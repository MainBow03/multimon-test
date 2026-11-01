import { CHARACTERS } from '../data/characters.js';
import { getMultiplier } from './typeSystem.js';
import { calculateDamageImpl } from './battleSystem.js';
import { ignoresShields, immuneToStatDrops, powerForAccordo,
  effectiveTaserPower, stickyTrapEntryDamage } from './rockstarAgentEffects.js';
import { addEvasion, crystalShield, beginRefraction, directHitAfterCrystalDefense,
  endRefractionTurn, snowstormOutcome, randomBuff, randomDebuff, daffyCelebration } from './championEffects.js';
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
 atk:c.atk,def:c.def,baseDef:c.def,spDef:c.spDef||c.def,baseSpDef:c.spDef||c.def,spd:c.spd,baseSpd:c.spd,spAtk:c.spAtk||c.atk,passive:c.passive||null,heldItem:item||null,hyper:false,statuses:[],
 moves:c.moves.map(m=>({name:m.name,type:m.type,power:m.power||0,accuracy:m.accuracy??100,
 targetCount:m.targetCount||1,uses:m.maxUses??null,contact:!!m.contact,
 special:!!m.special,transform:!!m.transformMahito,effect:m.statusEffect||null,buff:m.selfStatBuff||m.statBuff||null,
 heal:m.heal||0,enemyDebuff:m.targetStatDebuff||null,snowstormTurns:m.snowstormTurns||0,
 evasionGain:m.evasionGain||0,crystalShieldPercent:m.crystalShieldPercent||0,
 refractionTurns:m.refractionTurns||0,bonusAgainstFaster:m.bonusAgainstFaster||0,
 priority:m.priority||0,ignoreShields:!!m.ignoreShields,ignoreTaunt:!!m.ignoreTaunt,
 placeStickyTrap:!!m.placeStickyTrap,scalingEnemyCount:!!m.scalingEnemyCount,bonusIfSlowed:m.bonusIfSlowed||0,
 ignoreDefBuffs:!!m.ignoreDefBuffs,speedScaling:!!m.speedScaling}))}
}
export function buildEventBattle(match,people,s){
 const make=side=>side.members.flatMap(uid=>people[uid].teamIds.map(id=>fighter(id,uid,s.allowItems?people[uid].heldItems?.[id]:null)));
 return{matchId:match.id,side:'A',turn:1,teams:{A:make(match.sideA),B:make(match.sideB)},
 owners:{A:match.sideA.members,B:match.sideB.members},hyperUsed:{},finished:false,winner:null,
 weather:null,traps:{},log:['Inizia '+match.sideA.name+' contro '+match.sideB.name+'!']};
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
// Una battaglia evento usa lo stesso calcolo dei danni del gioco classico;
// gli effetti dei nuovi campioni sono sincronizzati nello stato Firestore.
export function eventTurn(b,submissions,s,random=Math.random){
 if(b.finished)throw Error('Partita terminata');
 const x=structuredClone(b),side=x.side,oppo=side==='A'?'B':'A',log=[];
 x.traps ||= {};
 // Applica le trappole quando entra un NUOVO personaggio, non a chi era
 // già in campo al momento del piazzamento.
 for(const team of ['A','B']){
  const trap=x.traps[team];
  if(!trap)continue;
  const active=activeEventFighters(x,team,s);
  const previous=new Set(trap.seen||[]);
  for(const unit of active){
   if(previous.has(unit.key))continue;
   const dmg=stickyTrapEntryDamage(unit);
   unit.hp=Math.max(0,unit.hp-dmg);
   log.push('Trappola Segreta: '+unit.name+' perde '+dmg+' PS entrando in campo!');
  }
  trap.seen=activeEventFighters(x,team,s).map(u=>u.key);
 }
 const commands=new Map(x.owners[side].flatMap(uid=>submissions[uid]||[]).map(c=>[c.actor,c]));
 const applyBuff=(actor,buffs)=>{
  if(!buffs)return;
  for(const [k,value] of Object.entries(buffs)){
    if(Number.isFinite(actor[k]))actor[k]=Math.max(1,Math.floor(actor[k]*value));
  }
 };
 const status=(target,effect)=>{
  if(!effect||random()>=(effect.chance??0)||target.hp<=0)return;
  const name=effect.type;
  if(!target.statuses.includes(name))target.statuses.push(name);
  if(name==='Accecato')target.blindTurns=effect.turns||3;
  if(name==='Incantato'){target.enchantedTurns=effect.turns||10;target.enchantedFresh=true;}
  log.push(target.name+' riceve lo stato '+name+'!');
 };
 const hurt=(attacker,target,m)=>{
  const multiplier=getMultiplier(m.type,target.types);
  if(multiplier===0){log.push('Nessun effetto su '+target.name+'!');return 0;}
  // Il calcolo classic include Iperband, passiva petrosapien e Rifrazione.
  const wrap=u=>({...u,statuses:(u.statuses||[]).map(type=>({type})),
    heldItem:s.allowItems?u.heldItem:null});
  const raw=calculateDamageImpl({},wrap(attacker),wrap(target),m,multiplier,false,random);
  const defense=ignoresShields(attacker,m)?{damage:raw,absorbed:0,refracted:false}:directHitAfterCrystalDefense(target,raw);
  target.hp=Math.max(0,target.hp-defense.damage);
  if(defense.refracted)log.push('Rifrazione dimezza il primo colpo su '+target.name+'!');
  if(defense.absorbed)log.push('Scudo di '+target.name+': '+defense.absorbed+' danni assorbiti.');
  log.push(attacker.name+' usa '+m.name+' su '+target.name+': '+defense.damage+' danni'+(target.hp?'':' KO!'));
  if(target.hp>0&&target.passive?.type==='on_hp_threshold'&&!target.passiveUsed&&
     target.hp/target.maxHp<=target.passive.threshold){
    target.passiveUsed=true;applyBuff(target,target.passive.statBuff);
    log.push(target.name+' attiva '+target.passive.name+'!');
  }
  if(!target.hp){
    for(const ally of activeEventFighters(x,side,s).filter(u=>u!==attacker&&u.passive?.type==='failed_star')){
      const healed=daffyCelebration(ally);
      if(healed)log.push(ally.name+' attiva Protagonista Mancato: recupera '+healed+' PS e ATK +10%!');
    }
  }
  return defense.damage;
 };
 for(const actor of activeEventFighters(x,side,s).sort((a,b)=>{
  const ma=a.moves[Number(commands.get(a.key)?.moveIndex)||0];
  const mb=b.moves[Number(commands.get(b.key)?.moveIndex)||0];
  return (mb?.priority||0)-(ma?.priority||0)||b.spd-a.spd;
 })){
  if(actor.hp<=0)continue;
  const command=commands.get(actor.key);
  if(!command){log.push(actor.name+' passa.');continue;}
  const m=actor.moves[Number(command.moveIndex)]||actor.moves[0];if(!m||m.uses===0)continue;
  if(s.allowHyper&&command.hyper&&!x.hyperUsed[actor.owner]){
   x.hyperUsed[actor.owner]=true;actor.hyper=true;actor.atk=Math.round(actor.atk*1.5);
   actor.spAtk=Math.round(actor.spAtk*1.5);actor.maxHp=Math.round(actor.maxHp*1.5);
   actor.hp=Math.min(actor.maxHp,Math.round(actor.hp*1.5));log.push(actor.name+' usa la forma Iper!');
  }
  if(m.uses!==null)m.uses--;
  const accuracy=(m.accuracy<=1?m.accuracy:m.accuracy/100)*(actor.statuses.includes('Accecato')?.8:1);
  if(random()>accuracy){log.push(actor.name+' manca '+m.name);continue;}
  if(m.transform&&actor.id==='mahito'){
    actor.atk=Math.floor(actor.atk*1.5);actor.spAtk=Math.floor(actor.spAtk*1.5);
    actor.transformed=true;log.push(actor.name+' si trasfigura!');continue;
  }
  if(!m.power){
   applyBuff(actor,m.buff);
   if(m.heal){const h=Math.max(1,Math.floor(actor.maxHp*m.heal));actor.hp=Math.min(actor.maxHp,actor.hp+h);log.push(actor.name+' recupera '+h+' PS!');}
   if(m.evasionGain){addEvasion(actor);log.push(actor.name+' aumenta l’elusione!');}
   if(m.crystalShieldPercent){crystalShield(actor);log.push(actor.name+' innalza un Muro Cristallino!');}
   if(m.refractionTurns){beginRefraction(actor);log.push(actor.name+' attiva Rifrazione!');}
   if(m.placeStickyTrap){
     x.traps[oppo]={seen:activeEventFighters(x,oppo,s).map(u=>u.key)};
     log.push(actor.name+' piazza una Trappola Segreta sul campo avversario!');
   }
   const enemies=activeEventFighters(x,oppo,s).filter(u=>u.hp>0);
   const t=enemies.find(v=>v.key===command.target)||enemies[0];
   if(t&&m.enemyDebuff){
     if(immuneToStatDrops(t))log.push(t.name+' è immune ai cali di statistiche!');
     else{applyBuff(t,m.enemyDebuff);log.push(t.name+' subisce un calo di statistiche!');}
   }
   if(t)status(t,m.effect);
   log.push(actor.name+' usa '+m.name);
   continue;
  }
  const visible=activeEventFighters(x,oppo,s).filter(v=>v.hp>0);
  let targets=m.targetCount>=4?visible:
    m.targetCount>1?[
      ...visible.filter(v=>v.key===command.target),
      ...visible.filter(v=>v.key!==command.target)
    ].slice(0,m.targetCount):
    visible.filter(v=>v.key===command.target).slice(0,1);
  if(!targets.length&&visible.length)targets=[visible[0]];
  let hitAny=false;
  for(const t of targets){
   if(t.hp<=0)continue;
   if(t.evasionBonus&&random()<t.evasionBonus){log.push(t.name+' schiva il colpo!');continue;}
   hitAny=true;
   const actualMove=m.scalingEnemyCount?{...m,power:powerForAccordo(visible.length)}:
     m.bonusIfSlowed?{...m,power:effectiveTaserPower(t)}:m;
   const damage=hurt(actor,t,actualMove);
   if(t.hp&&damage&&actor.id==='mahito'&&m.contact&&random()<.3&&!t.statuses.includes('Anima Distorta')){
     t.statuses.push('Anima Distorta');log.push('Anima Distorta su '+t.name);
   }
   if(t.hp)status(t,m.effect);
   if(t.hp&&m.enemyDebuff){
     if(immuneToStatDrops(t))log.push(t.name+' è immune ai cali di statistiche!');
     else{applyBuff(t,m.enemyDebuff);log.push(t.name+' perde statistiche!');}
   }
  }
  if(hitAny&&m.buff)applyBuff(actor,m.buff);
  if(hitAny&&m.snowstormTurns){x.weather={type:'snowstorm',turns:m.snowstormTurns};log.push('Una tempesta di neve investe il campo!');}
  if(hitAny&&s.allowItems&&actor.heldItem==='iperband'){
   const recoil=Math.max(1,Math.floor(actor.maxHp*.1));actor.hp=Math.max(0,actor.hp-recoil);
   log.push('Iperband: '+actor.name+' perde '+recoil+' PS');
  }
 }
 // Fine turno: effetti condivisi da tutti i giocatori, senza duplicati.
 for(const team of ['A','B']){
  for(const u of activeEventFighters(x,team,s)){
   if(u.hp<=0)continue;
   if(u.statuses.includes('Anima Distorta')){
     const d=Math.max(1,Math.floor(u.maxHp*.05));u.hp=Math.max(0,u.hp-d);
     log.push(u.name+' perde '+d+' PS per Anima Distorta.');
   }
   if(u.hp<=0)continue;
   if(u.enchantedTurns>0){
     if(u.enchantedFresh)u.enchantedFresh=false;
     else if(--u.enchantedTurns<=0){
       u.statuses=u.statuses.filter(z=>z!=='Incantato');
       log.push(u.name+' non è più incantato!');
     }
   }
   if(u.blindTurns>0){
     u.blindTurns--;if(!u.blindTurns)u.statuses=u.statuses.filter(z=>z!=='Accecato');
   }
   if(u.passive?.type==='bugs_chaos'){
     if(random()<.5){const stat=randomBuff(u,random);log.push(u.name+' aumenta '+stat+' del 15%!');}
     const enemies=activeEventFighters(x,team==='A'?'B':'A',s).filter(v=>v.hp>0);
     if(enemies.length){const target=enemies[Math.floor(random()*enemies.length)];
       if(immuneToStatDrops(target))log.push(target.name+' resiste al calo di statistiche!');
       else{const stat=randomDebuff(target,random);log.push(u.name+' abbassa '+stat+' di '+target.name+'!');}}
   }
  }
 }
 if(x.weather?.type==='snowstorm'&&x.weather.turns>0){
  for(const team of ['A','B']){
   for(const u of activeEventFighters(x,team,s)){
    const effect=snowstormOutcome(u,true);
    if(effect.damage){u.hp=Math.max(0,u.hp-effect.damage);log.push(u.name+' perde '+effect.damage+' PS per la neve!');}
    if(u.hp&&effect.heal){u.hp=Math.min(u.maxHp,u.hp+effect.heal);log.push(u.name+' recupera '+effect.heal+' PS dal freddo!');}
   }
  }
  x.weather.turns--;if(x.weather.turns===0)x.weather=null;
 }
 for(const team of ['A','B'])for(const u of x.teams[team])endRefractionTurn(u);
 const a=x.teams.A.some(c=>c.hp>0),z=x.teams.B.some(c=>c.hp>0);
 if(!a||!z||x.turn>=300){
  x.finished=true;x.winner=a&&!z?'A':z&&!a?'B':
   x.teams.A.reduce((v,c)=>v+c.hp,0)>=x.teams.B.reduce((v,c)=>v+c.hp,0)?'A':'B';
  log.push('Vittoria lato '+x.winner);
 }else{x.side=oppo;x.turn++;}
 x.log=[...x.log,...log].slice(-60);return x;
}
export function simulateBots(b,s,bots){
 const all=new Set(bots.map(x=>x.id));if(![...b.owners.A,...b.owners.B].every(id=>all.has(id)))return b;
 let x=b;for(let i=0;i<301&&!x.finished;i++){const commands={};for(const uid of x.owners[x.side])commands[uid]=botActions(x,uid,s);x=eventTurn(x,commands,s)}
 return x;
}