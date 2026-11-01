import { CHARACTERS } from '../data/characters.js';
import { getMultiplier } from './typeSystem.js';
import { calculateDamageImpl } from './battleSystem.js';
export const EVENT_PRIZES={1:400,2:200,3:140,other:50};
export function normalizeEventSettings(s={}){
 const n=+s.entrants,team=+s.teamSize,field=+s.fieldSize,doubles=!!s.doubles;
 return {entrants:[4,8,16,32].includes(n)?n:8,teamSize:Math.max(4,Math.min(8,team||4)),
 doubles,fieldSize:Math.max(1,Math.min(doubles?2:4,field||1)),allowItems:!!s.allowItems,allowHyper:!!s.allowHyper};
}
export const validTeam=(team,s)=>Array.isArray(team)&&team.length===s.teamSize
 && new Set(team).size===team.length && team.every(id=>CHARACTERS.some(c=>c.id===id&&!c.isSummonOnly&&!c.isSecretUnlock));
export function makeEventEntrants(players,bots,s,order=[]){
 const all=[...players,...bots].map(p=>({...p,id:p.id||p.uid})),lookup=new Map(all.map(p=>[p.id,p]));
 const sorted=[...new Set([...order,...all.map(x=>x.id)])].map(id=>lookup.get(id)).filter(Boolean);
 if(sorted.length!==s.entrants*(s.doubles?2:1)||!sorted.every(p=>p.ready&&validTeam(p.teamIds,s)))throw Error('Servono tutti i partecipanti con squadra completa.');
 const n=s.doubles?2:1;
 return Array.from({length:s.entrants},(_,i)=>{const slice=sorted.slice(i*n,i*n+n);return{id:'entrant-'+i,name:slice.map(x=>x.name).join(' & '),members:slice.map(x=>x.id)}});
}
// Mantieni le coppie impostate dall'host, ma distribuiscile casualmente nel primo turno.
export function shuffleEventEntrants(entrants,random=Math.random){
 const shuffled=[...entrants];
 for(let i=shuffled.length-1;i>0;i--){
  const j=Math.max(0,Math.min(i,Math.floor(random()*(i+1))));
  [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
 }
 return shuffled;
}
export const EVENT_INACTIVITY_MS=5*60*1000;
export function isLiveEvent(e,now=Date.now()){
 if(!e||!['lobby','running'].includes(e.status))return false;
 const heartbeat=e.hostHeartbeatAt?.toMillis?.() ??
  (typeof e.hostHeartbeatAt?.seconds==='number'?e.hostHeartbeatAt.seconds*1000:(e.updatedAt||e.createdAt));
 return Number.isFinite(heartbeat)&&heartbeat<=now+30000&&now-heartbeat<EVENT_INACTIVITY_MS;
}
export function makeEventBracket(entrants,random=Math.random){
 if(![4,8,16,32].includes(entrants.length))throw Error('Numero di squadre non valido.');
 const seed=shuffleEventEntrants(entrants,random);
 const matches=[],n=Math.log2(seed.length);
 for(let r=0;r<n;r++)for(let i=0;i<entrants.length/(2**(r+1));i++)matches.push({id:'r'+r+'-m'+i,round:r,slot:i,stage:r===n-1?'final':'normal',sideA:r===0?seed[2*i]:null,sideB:r===0?seed[2*i+1]:null,winner:null,loser:null});
 matches.splice(matches.length-1,0,{id:'bronze',round:n-1,slot:-1,stage:'bronze',sideA:null,sideB:null,winner:null,loser:null});
 return matches;
}
export function nextEventMatch(matches){return matches.find(m=>m.sideA&&m.sideB&&!m.winner)||null}
export function completeEventMatch(matches,id,side){
 const arr=structuredClone(matches),m=arr.find(x=>x.id===id);
 if(!m||m.winner||!m.sideA||!m.sideB)throw Error('Incontro non valido');
 m.winner=side==='A'?m.sideA:m.sideB;m.loser=side==='A'?m.sideB:m.sideA;
 if(m.stage==='normal'){
  const next=arr.find(x=>x.id==='r'+(m.round+1)+'-m'+Math.floor(m.slot/2));
  if(next)next[m.slot%2?'sideB':'sideA']=m.winner;
  const semi=Math.log2(arr.filter(x=>x.round===0).length*2)-2;
  if(m.round===semi)arr.find(x=>x.stage==='bronze')[m.slot%2?'sideB':'sideA']=m.loser;
 }
 return arr;
}
export function eventPlacements(matches,entrants){
 const f=matches.find(x=>x.stage==='final'),b=matches.find(x=>x.stage==='bronze');
 if(!f?.winner||!b?.winner)return null;
 const ranks={[f.winner.id]:1,[f.loser.id]:2,[b.winner.id]:3},participants={};
 for(const e of entrants)for(const uid of e.members){let rank=ranks[e.id]||4;participants[uid]={rank,coins:EVENT_PRIZES[rank]||50}}
 return{entrants:ranks,participants};
}
function fighter(id,owner,item){
 const c=CHARACTERS.find(x=>x.id===id);if(!c)throw Error('Multimon mancante: '+id);
 return{key:owner+'-'+id,id,owner,name:c.name,img:c.img,types:c.types||[],hp:c.maxHp,maxHp:c.maxHp,
 atk:c.atk,def:c.def,baseDef:c.def,spd:c.spd,spAtk:c.spAtk||c.atk,passive:c.passive||null,heldItem:item||null,hyper:false,statuses:[],
 moves:c.moves.map(m=>({name:m.name,type:m.type,power:m.power||0,accuracy:m.accuracy??100,
 targetCount:m.targetCount||1,uses:m.maxUses??null,contact:!!m.contact,
 special:!!m.special,transform:!!m.transformMahito,effect:m.statusEffect||null,buff:m.selfStatBuff||null,
 ignoreDefBuffs:!!m.ignoreDefBuffs,speedScaling:!!m.speedScaling}))}
}
export function buildEventBattle(match,people,s){
 const make=side=>side.members.flatMap(uid=>people[uid].teamIds.map(id=>fighter(id,uid,s.allowItems?people[uid].heldItems?.[id]:null)));
 return{matchId:match.id,side:'A',turn:1,teams:{A:make(match.sideA),B:make(match.sideB)},
 owners:{A:match.sideA.members,B:match.sideB.members},hyperUsed:{},finished:false,winner:null,
 log:['Inizia '+match.sideA.name+' contro '+match.sideB.name+'!']};
}
export function activeEventFighters(b,side,s){
 return b.owners[side].flatMap(uid=>b.teams[side].filter(x=>x.owner===uid&&x.hp>0).slice(0,s.fieldSize));
}
export function botActions(b,uid,s){
 const targets=activeEventFighters(b,b.side==='A'?'B':'A',s);
 return activeEventFighters(b,b.side,s).filter(x=>x.owner===uid).map(c=>{
 const ranks=c.moves.map((m,i)=>({m,i})).filter(x=>x.m.uses===null||x.m.uses>0).sort((a,d)=>d.m.power-a.m.power);
 return{actor:c.key,moveIndex:ranks[0]?.i||0,target:targets[0]?.key||null}});
}
export function eventTurn(b,submissions,s,random=Math.random){
 if(b.finished)throw Error('Partita terminata');
 let x=structuredClone(b),side=x.side,oppo=side==='A'?'B':'A',log=[];
 const commands=new Map(x.owners[side].flatMap(uid=>submissions[uid]||[]).map(c=>[c.actor,c]));
 for(const actor of activeEventFighters(x,side,s).sort((a,b)=>b.spd-a.spd)){
  if(actor.hp<=0)continue;
  const command=commands.get(actor.key);if(!command){log.push(actor.name+' passa.');continue}
  const m=actor.moves[+command.moveIndex]||actor.moves[0];if(!m||m.uses===0)continue;
  if(s.allowHyper&&command.hyper&&!x.hyperUsed[actor.owner]){
   x.hyperUsed[actor.owner]=true;actor.hyper=true;actor.atk=Math.round(actor.atk*1.5);actor.spAtk=Math.round(actor.spAtk*1.5);
   actor.maxHp=Math.round(actor.maxHp*1.5);actor.hp=Math.min(actor.maxHp,Math.round(actor.hp*1.5));log.push(actor.name+' usa la forma Iper!');
  }
  if(m.uses!==null)m.uses--;
  if(random()>(m.accuracy<=1?m.accuracy:m.accuracy/100)){log.push(actor.name+' manca '+m.name);continue}
  if(m.transform&&actor.id==='mahito'){actor.atk=Math.floor(actor.atk*1.5);actor.spAtk=Math.floor(actor.spAtk*1.5);log.push(actor.name+' cambia forma!');continue}
  if(!m.power){if(m.buff)for(const [k,v] of Object.entries(m.buff))if(Number.isFinite(actor[k]))actor[k]=Math.round(actor[k]*v);log.push(actor.name+' usa '+m.name);continue}
  const visible=activeEventFighters(x,oppo,s).filter(v=>v.hp>0);
  let targets=m.targetCount>1?visible:visible.filter(v=>v.key===command.target).slice(0,1);
  if(!targets.length&&visible.length)targets=[visible[0]];
  for(const t of targets){
   // Formula IDENTICA alla battaglia classica: passiva, STAB, resistenze,
   // Iperband, Mahito, bonus danno e difesa. Status in formato classico.
   const type=getMultiplier(m.type,t.types);
   const wrap=u=>({...u,statuses:(u.statuses||[]).map(status=>({type:status})),
      heldItem:s.allowItems?u.heldItem:null});
   const dmg=type===0?0:calculateDamageImpl({},wrap(actor),wrap(t),m,type,false,random);
   t.hp=Math.max(0,t.hp-dmg);log.push(actor.name+' usa '+m.name+' su '+t.name+': '+dmg+' danni'+(t.hp?'':' KO!'));
   if(t.hp&&actor.id==='mahito'&&m.contact&&random()<.3&&!t.statuses.includes('Anima Distorta')){t.statuses.push('Anima Distorta');log.push('Anima Distorta su '+t.name);}
   if(t.hp&&m.effect&&random()<(m.effect.chance||0))t.statuses.push(m.effect.type);
  }
  if(s.allowItems&&actor.heldItem==='iperband'){const recoil=Math.max(1,Math.floor(actor.maxHp*.1));actor.hp=Math.max(0,actor.hp-recoil);log.push('Iperband: '+actor.name+' perde '+recoil+' PS');}
 }
 for(const c of x.teams[side])if(c.hp>0&&c.statuses.includes('Anima Distorta')){const dmg=Math.max(1,Math.floor(c.maxHp*.05));c.hp=Math.max(0,c.hp-dmg);log.push(c.name+' perde '+dmg+' PS per Anima Distorta.');}
 const a=x.teams.A.some(c=>c.hp>0),z=x.teams.B.some(c=>c.hp>0);
 if(!a||!z||x.turn>=300){
  x.finished=true;x.winner=a&&!z?'A':z&&!a?'B':x.teams.A.reduce((v,c)=>v+c.hp,0)>=x.teams.B.reduce((v,c)=>v+c.hp,0)?'A':'B';
  log.push('Vittoria lato '+x.winner);
 }else{x.side=oppo;x.turn++}
 x.log=[...x.log,...log].slice(-60);return x;
}
export function simulateBots(b,s,bots){
 const all=new Set(bots.map(x=>x.id));if(![...b.owners.A,...b.owners.B].every(id=>all.has(id)))return b;
 let x=b;for(let i=0;i<301&&!x.finished;i++){const commands={};for(const uid of x.owners[x.side])commands[uid]=botActions(x,uid,s);x=eventTurn(x,commands,s)}
 return x;
}