// AS CES A DEL COLOSSEO • modalità a fasi per otto partecipanti.
// Funzioni pure e serializzabili: si usano in transazioni Firestore per evitare
// doppie catture, monete negative e due vincitori dello stesso round.
import {getMultiplier} from './typeSystem.js';
import {calculateDamageImpl} from './battleSystem.js';

export const ASCENSION_MODE='ascension';
export const ASCENSION_STATUS='ascension';
export const ASCENSION_ROUNDS=18;
export const ASCENSION_MAX_LEVEL=10;
export const ASCENSION_MAX_TEAM=9;
export const ASCENSION_FINAL_TEAM=7;
export const ASCENSION_STARTING_BALLS=20;
export const ASCENSION_ROLES=Object.freeze(Array.from({length:8},(_,i)=>'p'+(i+1)));
export const ASCENSION_TRAINER_STYLES=Object.freeze([
 {id:'offensive',name:'Furia',label:'Offensivo',risk:1,coin:24},
 {id:'defensive',name:'Bastione',label:'Difensivo',risk:1,coin:27},
 {id:'strategic',name:'Mentore',label:'Strategico',risk:2,coin:39},
 {id:'specialist',name:'Maestro dei Tipi',label:'Specialista',risk:2,coin:43},
 {id:'elite',name:'Veterano',label:'Veterano',risk:3,coin:60}
]);
const clone=x=>structuredClone(x);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rand=(rng,size)=>Math.floor(clamp(rng(),0,.999999)*size);
const sample=(list,count,rng)=>{
 const a=[...list];
 for(let i=a.length-1;i>0;i--){const j=rand(rng,i+1);[a[i],a[j]]=[a[j],a[i]];}
 return a.slice(0,count);
};
const legal=c=>Boolean(c?.id&&!c.isSummonOnly&&!c.isCampaignMonster&&!c.isSecretUnlock&&!c.fusionOf&&Array.isArray(c.moves)&&c.moves.length);
export function ascensionStarterPool(chars){
 const legalChars=(chars||[]).filter(legal);
 const prices=legalChars.map(c=>Number(c.price)||0);
 const positives=prices.filter(p=>p>0).sort((a,b)=>a-b);
 const limit=positives[Math.min(positives.length-1,Math.floor(positives.length*.25))]||150;
 const base=legalChars.filter(c=>!c.price||Number(c.price)<=limit);
 return base.length>=5?base:legalChars.slice().sort((a,b)=>(a.price||0)-(b.price||0)).slice(0,Math.max(5,Math.ceil(legalChars.length*.25)));
}
export const ascensionAllChars=chars=>(chars||[]).filter(legal);
export const ascensionFind=(chars,id)=>(chars||[]).find(c=>c.id===id);
export const ascensionScaledMaxHp=(original,level)=>Math.max(10,Math.round((original.maxHp||original.hp||100)*(.7+.04*(level-1))));
export function ascensionFighter(original,level=1){
 const value=clamp(Math.trunc(level)||1,1,ASCENSION_MAX_LEVEL);
 const scale=.7+.04*(value-1);
 const hp=ascensionScaledMaxHp(original,value);
 return {...original,hp,maxHp:hp,
  atk:Math.max(1,Math.round((original.atk||80)*scale)),
  def:Math.max(1,Math.round((original.def||80)*scale)),
  spAtk:Math.max(1,Math.round((original.spAtk||original.atk||80)*scale)),
  spDef:Math.max(1,Math.round((original.spDef||original.def||80)*scale)),
  spd:Math.max(1,Math.round((original.spd||80)*scale)),
  types:original.types||['Normale'],statuses:[]};
}
export function ascensionMember(id,level,chars){
 const original=ascensionFind(chars,id);
 if(!original||!legal(original))throw Error('Multimon non disponibile.');
 const lvl=clamp(level,1,ASCENSION_MAX_LEVEL);
 return {id,level:lvl,hp:ascensionScaledMaxHp(original,lvl),
   xp:0,trainingHalves:0}; // due mezzi punti = +1 livello
}
export function ascensionFighterFromMember(member,chars){
 const original=ascensionFind(chars,member?.id);
 if(!original)return null;
 const fighter=ascensionFighter(original,member.level);
 fighter.hp=clamp(member.hp,0,fighter.maxHp);
 return fighter;
}
export function ascensionCreate(room,chars,rng=Math.random){
 const pool=ascensionStarterPool(chars);
 if(pool.length<5)throw Error('Servono almeno cinque starter economici.');
 const roles=ASCENSION_ROLES.filter(role=>room.players?.[role]);
 if(roles.length!==8)throw Error('Ascesa del Colosseo richiede esattamente otto giocatori.');
 const participants={};
 for(const role of roles){
  const options=sample(pool,5,rng).map(c=>c.id);
  participants[role]={role,options,roster:[],coins:100,prismaballs:ASCENSION_STARTING_BALLS,
   done:false,encounter:null,notice:'Scegli uno dei tuoi cinque starter.',captures:0,trainerWins:0};
 }
 return {version:1,stage:'starters',round:1,act:1,participants,roles,
  bracket:[],matchIndex:0,champion:null,history:[],revision:0};
}
const mutate=(asc,fn)=>{const next=clone(asc);fn(next);next.revision=(next.revision||0)+1;return next;};
function participant(asc,role){
 const p=asc.participants?.[role];if(!p)throw Error('Non fai parte di questa partita.');
 return p;
}
export function ascensionSelectStarter(asc,role,id,chars){
 if(asc.stage!=='starters')throw Error('La scelta degli starter è terminata.');
 return mutate(asc,next=>{
  const p=participant(next,role);
  if(p.roster.length)throw Error('Starter già scelto.');
  if(!p.options.includes(id))throw Error('Questo starter non è tra i tuoi cinque.');
  p.roster=[ascensionMember(id,1,chars)];
  p.notice='Starter scelto! Preparati alla spedizione.';
  if(next.roles.every(r=>next.participants[r].roster.length===1)){
   next.stage='preparation';
   next.roles.forEach(r=>{next.participants[r].done=false;next.participants[r].notice='Round 1: scegli il tuo percorso.';});
  }
 });
}
export function ascensionWildLevel(p){
 return clamp(Math.max(1,...p.roster.map(c=>c.level))-3,1,ASCENSION_MAX_LEVEL);
}
export function ascensionCaptureChance(hp,maxHp,{status=null,rare=false,veryRare=false}={}){
 if(maxHp<=0||hp<=0)return 0;
 const ratio=clamp(hp/maxHp,0,1);
 const marks=[[0.1,.99],[.25,.75],[.5,.5],[.75,.25],[1,.1]];
 let chance=.99;
 for(let i=0;i<marks.length;i++){
  const [x,y]=marks[i];
  if(ratio<=x){if(i===0){chance=y;break}
   const [px,py]=marks[i-1];chance=py+(y-py)*(ratio-px)/(x-px);break;
  }
 }
 if(ratio<=.1)return .99; // premio per chi lascia in vita il selvatico a pochissimi PS
 const bonus=({Addormentato:.10,Congelato:.10,Assiderato:.10,
  Stordito:.08,Confuso:.05,Indebolito:.05})[status]||0;
 return clamp(chance+bonus-(veryRare?0.15:rare?0.1:0),.05,.99);
}
export function ascensionTrainingProgress(p,memberId){
 return p.roster.find(c=>c.id===memberId)?.trainingHalves||0;
}
export function ascensionTrain(asc,role,id,chars){
 if(asc.stage!=='preparation')throw Error('L allenamento è disponibile durante la preparazione.');
 return mutate(asc,next=>{
  const p=participant(next,role),m=p.roster.find(x=>x.id===id);
  if(!m)throw Error('Multimon non nella tua squadra.');
  if(m.level>=ASCENSION_MAX_LEVEL)throw Error('Livello massimo raggiunto.');
  if(m.trainingHalves<2)throw Error('Servono due mezzi punti allenamento.');
  const hpBefore=ascensionScaledMaxHp(ascensionFind(chars,id),m.level);
  const missing=Math.max(0,hpBefore-m.hp);
  m.trainingHalves-=2;m.level++;
  m.hp=Math.max(1,ascensionScaledMaxHp(ascensionFind(chars,id),m.level)-missing);
  p.notice=ascensionFind(chars,id).name+' sale al livello '+m.level+'!';
 });
}
const expNeeded=level=>8+level*5;
export function ascensionGrantExp(p,index,amount,chars){
 const member=p.roster[index];
 if(!member||member.level>=ASCENSION_MAX_LEVEL||!amount)return 0;
 member.xp+=Math.max(0,Math.round(amount));
 let gained=0;
 while(member.level<ASCENSION_MAX_LEVEL&&member.xp>=expNeeded(member.level)){
  member.xp-=expNeeded(member.level);
  const oldMax=ascensionScaledMaxHp(ascensionFind(chars,member.id),member.level);
  member.level++;gained++;
  member.hp=Math.min(ascensionScaledMaxHp(ascensionFind(chars,member.id),member.level),
   member.hp+ascensionScaledMaxHp(ascensionFind(chars,member.id),member.level)-oldMax);
 }
 if(member.level===ASCENSION_MAX_LEVEL)member.xp=0;
 return gained;
}
function grantEncounterXp(p,activeIdx,amount,chars){
 const highest=Math.max(...p.roster.map(x=>x.level));
 p.roster.forEach((m,i)=>ascensionGrantExp(p,i,
  Math.round(amount*(i===activeIdx?(m.level<=highest-3?1.5:1):.25)),chars));
}
function chooseFoe(chars,level,rng,rareOnly=false){
 const pool=ascensionAllChars(chars).filter(c=>!rareOnly||Number(c.price||0)>=200);
 return sample(pool.length?pool:ascensionAllChars(chars),1,rng)[0];
}
export function ascensionBeginAction(asc,role,action,chars,rng=Math.random){
 if(asc.stage!=='preparation')throw Error('La preparazione è finita.');
 return mutate(asc,next=>{
  const p=participant(next,role);
  if(p.done||p.encounter)throw Error('Hai già intrapreso una attività questo round.');
  if(!p.roster.length)throw Error('Seleziona prima uno starter.');
  if(action==='rest'){
   p.roster.forEach(m=>{m.hp=ascensionScaledMaxHp(ascensionFind(chars,m.id),m.level)});
   p.done=true;p.notice='Squadra curata. Recupero completato.';
  }else if(action==='wild'){
   const level=ascensionWildLevel(p),foe=chooseFoe(chars,level,rng);
   const maxHp=ascensionScaledMaxHp(foe,level);
   p.encounter={kind:'wild',foeId:foe.id,foeLevel:level,foeHp:maxHp,
     foeMaxHp:maxHp,active:Math.max(0,p.roster.findIndex(m=>m.hp>0)),turn:1,
     status:null,log:['Un '+foe.name+' selvatico appare tra i varchi!']};
   p.notice='Incontro selvatico! Indeboliscilo e usa la Prismaball.';
  }else if(action==='trainer'){
   const rank=next.round<=6?0:next.round<=12?1:2;
   const available=ASCENSION_TRAINER_STYLES.filter(t=>t.risk<=rank+1);
   const trainer=available[rand(rng,available.length)];
   const level=clamp(Math.max(...p.roster.map(c=>c.level))+trainer.risk-1,1,10);
   const foe=chooseFoe(chars,level,rng);
   const maxHp=ascensionScaledMaxHp(foe,level);
   p.encounter={kind:'trainer',foeId:foe.id,foeLevel:level,foeHp:maxHp,
    foeMaxHp:maxHp,trainer:trainer.id,trainerName:trainer.name,
    trainerRisk:trainer.risk,turn:1,active:Math.max(0,p.roster.findIndex(m=>m.hp>0)),
    status:null,log:['Allenatore '+trainer.name+': preparati alla sfida!']};
   p.notice='Sfida '+trainer.label+' · '+trainer.name+'.';
  }else if(action==='training'){
   if(!p.roster.some(c=>c.trainingHalves>=2&&c.level<ASCENSION_MAX_LEVEL))
    throw Error('Non hai ancora abbastanza punti allenamento. Sfida un allenatore!');
   // Sessione assistita: i punti restano spendibili anche gratuitamente fra i round.
   const eligible=p.roster.filter(m=>m.trainingHalves>=2&&m.level<10);
   const preferred=eligible.sort((a,b)=>a.level-b.level)[0];
   const missing=ascensionScaledMaxHp(ascensionFind(chars,preferred.id),preferred.level)-preferred.hp;
   preferred.level++;preferred.trainingHalves-=2;
   preferred.hp=Math.max(1,ascensionScaledMaxHp(ascensionFind(chars,preferred.id),preferred.level)-missing);
   p.done=true;p.notice=ascensionFind(chars,preferred.id).name+' allenato: livello '+preferred.level+'!';
  }else throw Error('Attività non valida.');
 });
}
function attackDamage(attacker,defender,move,rng){
 if(!move?.power||move.power<=0)return 0;
 const multiplier=getMultiplier(move.type,defender.types||['Normale']);
 if(multiplier===0)return 0;
 // La formula condivisa del motore classico conserva STAB, tipi e statistiche.
 return Math.max(1,calculateDamageImpl({},attacker,defender,move,multiplier,false,rng));
}
function executeAction(attacker,defender,move,rng,log){
 if(!move)return 0;
 const acc=move.accuracy==null?1:move.accuracy>1?move.accuracy/100:move.accuracy;
 if(rng()>acc){log.push(attacker.name+' manca il bersaglio con '+move.name+'!');return 0;}
 const damage=attackDamage(attacker,defender,move,rng);
 if(damage>0){
  defender.hp=Math.max(0,defender.hp-damage);
  log.push(attacker.name+' usa '+move.name+': '+damage+' danni!');
 }else if(move.heal||move.selfHeal){
  const recovered=Math.max(1,Math.floor(attacker.maxHp*(move.heal||move.selfHeal)));
  attacker.hp=Math.min(attacker.maxHp,attacker.hp+recovered);
  log.push(attacker.name+' usa '+move.name+' e recupera '+recovered+' PS!');
 }else{log.push(attacker.name+' usa '+move.name+' (supporto)!');}
 return damage;
}
export function ascensionPlayEncounter(asc,role,choice,chars,rng=Math.random){
 if(asc.stage!=='preparation')throw Error('Non sei in preparazione.');
 return mutate(asc,next=>{
  const p=participant(next,role),e=p.encounter;
  if(!e)throw Error('Non hai un incontro attivo.');
  const foeBase=ascensionFind(chars,e.foeId),foe=ascensionFighter(foeBase,e.foeLevel);
  foe.hp=e.foeHp;
  let active=p.roster[e.active];
  if(!active||active.hp<=0){e.active=p.roster.findIndex(m=>m.hp>0);active=p.roster[e.active];}
  if(!active){p.done=true;p.encounter=null;p.notice='Squadra esausta: questo round termina.';return;}
  const hero=ascensionFighterFromMember(active,chars),log=[];
  if(choice?.type==='switch'){
   const target=p.roster[choice.index];
   if(!target||target.hp<=0)throw Error('Non puoi schierare un Multimon esausto.');
   e.active=choice.index;log.push('Cambio! Entra '+ascensionFind(chars,target.id).name+'.');
  }else if(choice?.type==='ball'){
   if(e.kind!=='wild')throw Error('Gli allenatori non sono catturabili.');
   if(p.prismaballs<=0)throw Error('Hai finito le Prismaball.');
   if(p.roster.length>=ASCENSION_MAX_TEAM)throw Error('Team pieno: massimo nove Multimon.');
   p.prismaballs--;
   const chance=ascensionCaptureChance(e.foeHp,e.foeMaxHp,{
    status:e.status,rare:Number(foeBase.price||0)>=250,veryRare:Number(foeBase.price||0)>=350});
   const captured=rng()<chance;
   const failedAt=captured?3:1+rand(rng,3);
   p.lastCapture={success:captured,failedAt,foeId:e.foeId,chance,nonce:(p.lastCapture?.nonce||0)+1};
   if(captured){
    p.roster.push(ascensionMember(e.foeId,e.foeLevel,chars));
    p.captures++;p.done=true;p.encounter=null;
    p.notice='Sincronizzazione completa! '+foeBase.name+' entra nella tua squadra.';
    return;
   }
   log.push('La Prismaball non completa la sincronizzazione!');
  }else if(choice?.type==='flee'){
   if(e.kind==='trainer')throw Error('Non puoi fuggire dalla sfida allenatore.');
   p.encounter=null;p.done=true;p.notice='Ti ritiri dal varco senza catturare.';
   return;
  }else if(choice?.type==='attack'){
   const heroMoves=(ascensionFind(chars,active.id).moves||[]).filter(Boolean);
   const move=heroMoves[choice.index];
   if(!move)throw Error('Mossa non disponibile.');
   executeAction(hero,foe,move,rng,log);
   active.hp=hero.hp;e.foeHp=foe.hp;
   if(foe.hp<=0){
    const xp=7+e.foeLevel*4+(e.kind==='trainer'?e.trainerRisk*3:0);
    grantEncounterXp(p,e.active,xp,chars);
    if(e.kind==='trainer'){
     const reward=ASCENSION_TRAINER_STYLES.find(x=>x.id===e.trainer);
     p.coins+=reward.coin+(next.round*2);
     // 0.5 punti a TUTTI i membri, incluso chi non combatte.
     p.roster.forEach(m=>{if(m.level<ASCENSION_MAX_LEVEL)m.trainingHalves=(m.trainingHalves||0)+1;});
     p.trainerWins++;
     p.notice='Allenatore sconfitto! Tutti i Multimon +0,5 Punti Allenamento.';
    }else{
     p.coins+=10+next.round;
     p.notice='Selvatico sconfitto: esperienza e monete ottenute, niente cattura.';
    }
    p.done=true;p.encounter=null;return;
   }
  }else throw Error('Comando non valido.');
  const foeMoves=(foeBase.moves||[]).filter(m=>m?.power>0);
  const ai=foeMoves.length?foeMoves[rand(rng,foeMoves.length)]:{name:'Attacco',type:foeBase.types[0],power:45,accuracy:1};
  const current=p.roster[e.active],target=ascensionFighterFromMember(current,chars);
  executeAction(foe,target,ai,rng,log);
  current.hp=target.hp;
  if(current.hp<=0){
   const nextActive=p.roster.findIndex(m=>m.hp>0);
   if(nextActive<0){p.done=true;p.encounter=null;p.notice='Squadra esausta. Riparti dal prossimo round.';return;}
   e.active=nextActive;log.push('Entra in campo '+ascensionFind(chars,p.roster[nextActive].id).name+'!');
  }
  e.foeHp=foe.hp;e.turn++;
  e.log=[...e.log,...log].slice(-9);
 });
}
export function ascensionRoundReady(asc){return asc.stage==='preparation'&&asc.roles.every(r=>asc.participants[r].done&&!asc.participants[r].encounter);}
export function ascensionNextRound(asc,chars){
 if(!ascensionRoundReady(asc))throw Error('Qualcuno sta ancora completando il round.');
 if(asc.round===ASCENSION_ROUNDS)return ascensionStartColosseum(asc,chars);
 return mutate(asc,next=>{
  if(next.round%6===0)next.roles.forEach(r=>next.participants[r].roster.forEach(m=>{
    const max=ascensionScaledMaxHp(ascensionFind(chars,m.id),m.level);
    m.hp=Math.min(max,m.hp+Math.ceil(max*.4));
  }));
  next.round++;
  next.roles.forEach(r=>{next.participants[r].done=false;next.participants[r].lastCapture=null;next.participants[r].notice='Nuovo round: scegli una attività.';});
 });
}
function ascensionStartColosseum(asc,chars){
 return mutate(asc,next=>{
  next.stage='colosseum';
  next.roles.forEach(r=>next.participants[r].roster.forEach(m=>{
   m.hp=ascensionScaledMaxHp(ascensionFind(chars,m.id),m.level);
  }));
  const pairs=sample(next.roles,8,Math.random); // il tabellone viene creato una sola volta
  next.bracket=Array.from({length:4},(_,i)=>({id:'q'+i,stage:'quarti',roles:[pairs[i*2],pairs[i*2+1]],
   wins:{},winner:null,selection:{},actions:{},game:null,gameNumber:1}));
  next.matchIndex=0;
  next.history.push('Il Colosseo apre i cancelli: iniziano i quarti di finale!');
 });
}
export const ascensionCurrentMatch=asc=>asc.stage==='colosseum'?asc.bracket[asc.matchIndex]:null;
export function ascensionChooseLineup(asc,role,ids,chars){
 return mutate(asc,next=>{
  const match=ascensionCurrentMatch(next);if(!match||!match.roles.includes(role)||match.winner)throw Error('Non sei in questo duello.');
  if(match.game)throw Error('La battaglia è già iniziata.');
  const count=match.stage==='finale'?ASCENSION_FINAL_TEAM:3;
  const p=participant(next,role);
  const legalIds=[...new Set(ids)].filter(id=>p.roster.some(m=>m.id===id));
  if(legalIds.length!==Math.min(count,p.roster.length))throw Error('Seleziona '+Math.min(count,p.roster.length)+' Multimon.');
  match.selection[role]=legalIds;
  if(match.roles.every(r=>match.selection[r]?.length)){
   match.game={turn:1,units:Object.fromEntries(match.roles.map(r=>[r,
    match.selection[r].map(id=>{
     const m=participant(next,r).roster.find(x=>x.id===id);
     return {id,level:m.level,hp:ascensionScaledMaxHp(ascensionFind(chars,id),m.level)};
    })])),actions:{},log:['La battaglia comincia!'],winner:null};
  }
 });
}
function firstAlive(units){return units.findIndex(x=>x.hp>0);}
function alive(units){return units.filter(x=>x.hp>0);}
export function ascensionDuelAction(asc,role,moveIndex,chars,rng=Math.random){
 return mutate(asc,next=>{
  const match=ascensionCurrentMatch(next),game=match?.game;
  if(!game||game.winner||!match.roles.includes(role))throw Error('Nessuna battaglia attiva.');
  if(game.actions[role])throw Error('Hai già dato un comando questo turno.');
  game.actions[role]={move:clamp(Math.trunc(moveIndex)||0,0,3)};
  if(!match.roles.every(r=>game.actions[r]))return;
  const sorted=[...match.roles].sort((a,b)=>{
   const fa=ascensionFighterFromMember(game.units[a][firstAlive(game.units[a])],chars);
   const fb=ascensionFighterFromMember(game.units[b][firstAlive(game.units[b])],chars);
   return (fb?.spd||0)-(fa?.spd||0);
  });
  const log=[];
  for(const actor of sorted){
   const targetRole=match.roles.find(r=>r!==actor);
   const fieldSize=match.stage==='finale'?2:1;
   for(let slot=0;slot<fieldSize;slot++){
    const allyUnits=alive(game.units[actor]),enemies=alive(game.units[targetRole]);
    if(!allyUnits.length||!enemies.length)break;
    const me=allyUnits[Math.min(slot,allyUnits.length-1)];
    if(slot>0&&me===allyUnits[0])break;
    const enemy=enemies[Math.min(slot,enemies.length-1)];
    const hero=ascensionFighterFromMember(me,chars);
    const foe=ascensionFighterFromMember(enemy,chars);
    const moves=(ascensionFind(chars,me.id).moves||[]).filter(Boolean);
    const index=game.actions[actor].move;
    const move=moves[index]||moves.find(m=>m.power>0)||moves[0];
    executeAction(hero,foe,move,rng,log);
    me.hp=hero.hp;enemy.hp=foe.hp;
   }
  }
  game.turn++;game.actions={};game.log=[...game.log,...log].slice(-10);
  const defeated=match.roles.find(r=>!alive(game.units[r]).length);
  if(!defeated)return;
  const winner=match.roles.find(r=>r!==defeated);
  match.wins[winner]=(match.wins[winner]||0)+1;
  game.winner=winner;
  if(match.stage==='finale'||match.wins[winner]>=2){
   match.winner=winner;
  }else{
   match.game=null;match.selection={};match.gameNumber++;
  }
 });
}
export function ascensionAdvanceMatch(asc,chars){
 const m=ascensionCurrentMatch(asc);
 if(!m?.winner)throw Error('La battaglia corrente non è ancora terminata.');
 return mutate(asc,next=>{
  const previous=next.bracket[next.matchIndex];
  next.history.push(previous.stage+': '+previous.winner+' avanza!');
  next.matchIndex++;
  if(next.matchIndex<next.bracket.length)return;
  const stage=previous.stage;
  if(stage==='finale'){
   next.stage='finished';next.champion=previous.winner;return;
  }
  if(stage==='quarti'){
   const winners=next.bracket.slice(0,4).map(m=>m.winner);
   next.bracket.push({id:'s0',stage:'semifinali',roles:winners.slice(0,2),
     wins:{},winner:null,selection:{},actions:{},game:null,gameNumber:1},
     {id:'s1',stage:'semifinali',roles:winners.slice(2),
     wins:{},winner:null,selection:{},actions:{},game:null,gameNumber:1});
  }else if(stage==='semifinali'){
   const winners=next.bracket.slice(4,6).map(m=>m.winner);
   next.bracket.push({id:'f0',stage:'finale',roles:winners,
     wins:{},winner:null,selection:{},actions:{},game:null,gameNumber:1});
  }
 });
}
export function ascensionBotTurn(asc,role,chars,rng=Math.random){
 if(asc.stage==='starters'){
  const p=participant(asc,role);return p.roster.length?asc:ascensionSelectStarter(asc,role,p.options[rand(rng,p.options.length)],chars);
 }
 if(asc.stage==='preparation'){
  let p=participant(asc,role);
  if(p.done)return asc;
  let next=asc;
  if(!p.encounter){
   const choice=p.roster.length<7 && rng()<.67?'wild':'trainer';
   next=ascensionBeginAction(next,role,choice,chars,rng);
  }
  for(let i=0;i<28;i++){
   p=participant(next,role);if(!p.encounter)break;
   const e=p.encounter,hero=p.roster[e.active];
   if(e.kind==='wild'&&hero&&e.foeHp/e.foeMaxHp<.25&&p.prismaballs>0&&p.roster.length<9){
    next=ascensionPlayEncounter(next,role,{type:'ball'},chars,rng);
   }else if(e.kind==='wild'&&p.roster.length>=9){
    next=ascensionPlayEncounter(next,role,{type:'flee'},chars,rng);
   }else{
    const moves=ascensionFind(chars,hero.id).moves||[];
    const attackIndex=moves.findIndex(m=>m?.power>0);
    next=ascensionPlayEncounter(next,role,{type:'attack',index:Math.max(0,attackIndex)},chars,rng);
   }
  }
  if(participant(next,role).encounter){
   // Safety valve: gli scontri allenatore non bloccano i round quando un
   // bot esaurisce il numero massimo di azioni simulate.
   next=mutate(next,state=>{
     const bot=participant(state,role);
     bot.encounter=null;bot.done=true;bot.notice='Scontro concluso per limite di turni.';
   });
  }
  return next;
 }
 if(asc.stage==='colosseum'){
  const match=ascensionCurrentMatch(asc);
  if(!match?.roles.includes(role)||match.winner)return asc;
  if(!match.game){
   if(match.selection[role])return asc;
   const p=participant(asc,role),max=match.stage==='finale'?ASCENSION_FINAL_TEAM:3;
   return ascensionChooseLineup(asc,role,p.roster.slice().sort((a,b)=>b.level-a.level).slice(0,max).map(m=>m.id),chars);
  }
  if(match.game.actions[role])return asc;
  const unit=match.game.units[role][firstAlive(match.game.units[role])];
  const moves=ascensionFind(chars,unit.id).moves||[];
  const attacks=moves.map((m,i)=>m?.power>0?i:-1).filter(i=>i>=0);
  return ascensionDuelAction(asc,role,attacks.length?attacks[rand(rng,attacks.length)]:0,chars,rng);
 }
 return asc;
}
