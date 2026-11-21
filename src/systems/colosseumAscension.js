// AS CES A DEL COLOSSEO • modalità a fasi per otto partecipanti.
// Funzioni pure e serializzabili: si usano in transazioni Firestore per evitare
// doppie catture, monete negative e due vincitori dello stesso round.
import {getMultiplier} from './typeSystem.js';
import {calculateDamageImpl} from './battleSystem.js';
import {ascensionNativeFighter,ascensionNativeTurn,ascensionNativeMoveAction} from './ascensionNativeBattle.js';
import {ZODIAC_SPIRITS,normalizeZodiacSpirit,zodiacSecondaryRoll,
 addZodiacTrap,zodiacFlatStatBoost,cleanLucyDebuffs} from './zodiacSpirits.js';

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
const legal=c=>Boolean(c?.id&&!c.isSummonOnly&&!c.isCampaignMonster&&!c.isSecretUnlock&&!c.isAscensionBanned&&!c.fusionOf&&Array.isArray(c.moves)&&c.moves.length);
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
   xp:0,trainingHalves:0,...(id==='lucy'?{zodiacSpiritId:normalizeZodiacSpirit()}: {})}; // due mezzi punti = +1 livello
}
export function ascensionFighterFromMember(member,chars){
 const original=ascensionFind(chars,member?.id);
 if(!original)return null;
 const fighter=ascensionFighter(original,member.level);
 fighter.hp=clamp(member.hp,0,fighter.maxHp);
 return fighter;
}
/** Gli Spiriti Stellari sono evocazioni, non occupano slot nei nove Multimon. */
function ascensionSummonLucySpirit(p,e,chars,{reset=true}={}){
 const member=p.roster[e.active];
 if(member?.id!=='lucy'||member.hp<=0){e.spirit=null;e.spiritOpen=false;return null;}
 if(!reset&&e.spirit?.hp>0)return e.spirit;
 const id=normalizeZodiacSpirit(member.zodiacSpiritId);
 member.zodiacSpiritId=id;
 const base=ascensionFind(chars,id);
 if(!base?.isSummonOnly)return null;
 e.spirit={id,level:member.level,hp:ascensionScaledMaxHp(base,member.level)};
 e.spiritOpen=true;
 e.log=[...(e.log||[]),'✨ Lucy apre il portale dello Zodiaco: '+base.name+' entra in campo!'].slice(-12);
 return e.spirit;
}
export function ascensionSelectEncounterSpirit(asc,role,spiritId,chars){
 if(asc.stage!=='preparation')throw Error('Evocazioni disponibili solo durante la preparazione.');
 return mutate(asc,next=>{
  const p=participant(next,role),e=p.encounter;
  if(!e||e.pendingReaction||!e.spiritOpen||p.roster[e.active]?.id!=='lucy')
   throw Error('Lucy può scegliere lo Spirito solo al suo ingresso in campo, prima di agire.');
  if(!ZODIAC_SPIRITS.some(s=>s.id===spiritId))throw Error('Spirito Stellare non disponibile.');
  p.roster[e.active].zodiacSpiritId=spiritId;
  ascensionSummonLucySpirit(p,e,chars);
 });
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
   done:false,encounter:null,battleResult:null,introSeen:false,notice:'Scegli uno dei tuoi cinque starter.',captures:0,trainerWins:0,shopBuys:0};
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
/** La cerimonia di apertura è personale: ogni allenatore vede gli otto annunci
 * prima del suo primo percorso. Non interferisce con la progressione dei bot. */
export function ascensionAcknowledgeOpening(asc,role){
 if(asc.stage!=='preparation'||asc.round!==1)
  throw Error('La cerimonia di apertura non è disponibile ora.');
 if(!asc.participants?.[role])throw Error('Non fai parte di questa partita.');
 if(asc.participants[role].introSeen)return asc;
 return mutate(asc,next=>{
  next.participants[role].introSeen=true;
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
export const ASCENSION_SHOP=Object.freeze([
 {id:'potion',name:'Pozione',price:22,healing:.3},
 {id:'super_potion',name:'Super Pozione',price:45,healing:.65},
 {id:'revive',name:'Rianima',price:55,revive:.35},
 {id:'ball',name:'Prismaball extra',price:35,ball:1}
]);
export function ascensionBuy(asc,role,itemId,memberId,chars){
 if(asc.stage!=='preparation')throw Error('Negozio disponibile soltanto in preparazione.');
 return mutate(asc,next=>{
  const p=participant(next,role),item=ASCENSION_SHOP.find(i=>i.id===itemId);
  if(!item)throw Error('Oggetto non disponibile.');
  if(p.encounter)throw Error('Non puoi acquistare durante uno scontro.');
  if((p.shopBuys||0)>=2)throw Error('Massimo due acquisti per round.');
  if(p.coins<item.price)throw Error('Monete insufficienti.');
  if(item.ball){
   if(p.prismaballs>=30)throw Error('Hai già troppe Prismaball.');
   p.prismaballs++;
  }else{
   const m=p.roster.find(m=>m.id===memberId);
   if(!m)throw Error('Seleziona un Multimon del tuo team.');
   const max=ascensionScaledMaxHp(ascensionFind(chars,m.id),m.level);
   if(item.revive){
    if(m.hp>0)throw Error('Questo Multimon non è esausto.');
    m.hp=Math.max(1,Math.round(max*item.revive));
   }else{
    if(m.hp<=0)throw Error('Serve un Rianima per un Multimon esausto.');
    if(m.hp>=max)throw Error('Questo Multimon è già completamente curato.');
    m.hp=Math.min(max,m.hp+Math.max(1,Math.ceil(max*item.healing)));
   }
  }
  p.coins-=item.price;p.shopBuys=(p.shopBuys||0)+1;
  p.notice='Acquisto riuscito: '+item.name+'.';
 });
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
  m.hp=m.hp<=0?0:Math.max(1,ascensionScaledMaxHp(ascensionFind(chars,id),m.level)-missing);
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
  if(p.battleResult)throw Error('Conferma prima il risultato della battaglia.');
  if(p.done||p.encounter)throw Error('Hai già intrapreso una attività questo round.');
  if(!p.roster.length)throw Error('Seleziona prima uno starter.');
  if(action==='rest'){
   p.roster.forEach(m=>{m.hp=ascensionScaledMaxHp(ascensionFind(chars,m.id),m.level)});
   p.done=true;p.notice='Squadra curata. Recupero completato.';
  }else if(action==='wild'){
   const level=ascensionWildLevel(p),free=ascensionAllChars(chars).filter(c=>!p.roster.some(m=>m.id===c.id));
   const foe=free.length?sample(free,1,rng)[0]:chooseFoe(chars,level,rng);
   const maxHp=ascensionScaledMaxHp(foe,level);
   p.encounter={kind:'wild',foeId:foe.id,foeLevel:level,foeHp:maxHp,
     foeMaxHp:maxHp,active:Math.max(0,p.roster.findIndex(m=>m.hp>0)),turn:1,
     status:null,log:['Un '+foe.name+' selvatico appare tra i varchi!']};
   ascensionSummonLucySpirit(p,p.encounter,chars);
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
   ascensionSummonLucySpirit(p,p.encounter,chars);
   p.notice='Sfida '+trainer.label+' · '+trainer.name+'.';
  }else if(action==='training'){
   if(!p.roster.some(c=>c.trainingHalves>=2&&c.level<ASCENSION_MAX_LEVEL))
    throw Error('Non hai ancora abbastanza punti allenamento. Sfida un allenatore!');
   // Sessione assistita: i punti restano spendibili anche gratuitamente fra i round.
   const eligible=p.roster.filter(m=>m.trainingHalves>=2&&m.level<10);
   const preferred=eligible.sort((a,b)=>a.level-b.level)[0];
   const missing=ascensionScaledMaxHp(ascensionFind(chars,preferred.id),preferred.level)-preferred.hp;
   preferred.level++;preferred.trainingHalves-=2;
   preferred.hp=preferred.hp<=0?0:Math.max(1,ascensionScaledMaxHp(ascensionFind(chars,preferred.id),preferred.level)-missing);
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
function trainerMove(foe,enemy,style,rng){
 const options=(foe.moves||[]).filter(Boolean);
 if(!options.length)return {name:'Attacco',type:foe.types?.[0]||'Normale',power:45,accuracy:1};
 const attacks=options.filter(m=>m.power>0);
 const controls=options.filter(m=>m.statusEffect||m.statusEffects||m.hitStatDebuff||m.targetStatDebuff);
 const heals=options.filter(m=>m.heal||m.selfHeal);
 if(style==='defensive'&&foe.hp/foe.maxHp<.5&&heals.length)return heals[0];
 if(style==='strategic'&&controls.length&&rng()<.6)return controls[rand(rng,controls.length)];
 if(style==='specialist'&&attacks.length){
  const stab=attacks.filter(m=>foe.types?.includes(m.type));
  if(stab.length)return stab.reduce((a,b)=>(a.power||0)>=(b.power||0)?a:b);
 }
 if(style==='offensive'&&attacks.length)return attacks.reduce((a,b)=>(a.power||0)>=(b.power||0)?a:b);
 if(style==='elite'&&attacks.length)return attacks.slice().sort((a,b)=>
  (b.power||0)*getMultiplier(b.type,enemy.types)-(a.power||0)*getMultiplier(a.type,enemy.types))[0];
 return attacks.length?attacks[rand(rng,attacks.length)]:options[rand(rng,options.length)];
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
// Resta salvato nella stanza finché il giocatore non conferma l'esito.
// Evita che un KO al primo attacco riporti immediatamente al percorso.
function concludeEncounter(p,e,outcome,chars,log=[],prizes={}){
 const active=p.roster[e.active];
 const foe=ascensionFind(chars,e.foeId);
 p.battleResult={
  outcome,kind:e.kind,foeId:e.foeId,foeLevel:e.foeLevel,
  foeMaxHp:e.foeMaxHp,foeHp:outcome==='victory'?0:e.foeHp,
  trainerName:e.trainerName||null,turn:Math.max(1,e.turn||1),
  heroId:active?.id||null,heroLevel:active?.level||1,heroHp:active?.hp??0,
  coins:prizes.coins||0,xp:prizes.xp||0,
  training:prizes.training||0,
  log:[...(e.log||[]),...log].slice(-8),
  nonce:(p.battleResult?.nonce||0)+1
 };
 p.done=true;
 p.encounter=null;
}
export function ascensionAcknowledgeEncounterResult(asc,role){
 if(asc.stage!=='preparation')throw Error('Non sei nella fase di preparazione.');
 return mutate(asc,next=>{
  const p=participant(next,role);
  if(!p.battleResult||p.encounter)throw Error('Nessun risultato da confermare.');
  p.battleResult=null;
  p.lastCapture=null;
 });
}
/** Conserva le ricompense anche dopo un KO al primo colpo. */
function ascensionWinEncounter(next,p,e,chars,log){
 const foeBase=ascensionFind(chars,e.foeId);
 const xp=7+e.foeLevel*4+(e.kind==='trainer'?e.trainerRisk*3:0);
 const coinsBefore=p.coins;
 grantEncounterXp(p,e.active,xp,chars);
 if(e.kind==='trainer'){
  const reward=ASCENSION_TRAINER_STYLES.find(x=>x.id===e.trainer);
  p.coins+=reward.coin+(next.round*2);
  p.roster.forEach(m=>{if(m.level<ASCENSION_MAX_LEVEL)m.trainingHalves=(m.trainingHalves||0)+1;});
  p.trainerWins++;
  p.notice='Allenatore sconfitto! Tutti i Multimon +0,5 Punti Allenamento.';
 }else{
  p.coins+=10+next.round;
  p.notice='Selvatico sconfitto: esperienza e monete ottenute, niente cattura.';
 }
 e.foeHp=0;
 concludeEncounter(p,e,'victory',chars,[...log,foeBase.name+' è KO!'],{
  coins:p.coins-coinsBefore,xp,training:e.kind==='trainer'?.5:0
 });
}
function ascensionApplyZodiacMove(e,move,foe,chars,rng,log){
 if(!e.spirit||e.spirit.hp<=0)return;
 const applyStatus=(status,chance=1,turns=2)=>{
  if(status&&foe.hp>0&&rng()<chance){
   e.status=status;e.statusTurns=turns;
   log.push('✨ '+foe.name+' è affetto da '+status+'!');
  }
 };
 if(move.zodiacForceSecondary){
  const effect=zodiacSecondaryRoll(e.spirit.id,rng);
  if(effect.status)applyStatus(effect.status);
  if(effect.buff){
   e.spirit.buffs={...(e.spirit.buffs||{}),...effect.buff};
   log.push('✨ '+ascensionFind(chars,e.spirit.id).name+' riceve un potenziamento!');
  }
  if(effect.flatBuff){
   e.spirit.flatBuff={...(e.spirit.flatBuff||{}),...effect.flatBuff};
   log.push('🛡️ Lo Spirito rafforza le proprie difese!');
  }
  if(effect.trapTurns){
   e.status='Prigione Sotterranea';e.statusTurns=effect.trapTurns;
   log.push('🕳️ Virgo intrappola '+foe.name+'!');
  }
  if(effect.rainTurns){e.weatherTurns=effect.rainTurns;log.push('🌧️ Aquarius richiama la pioggia!');}
 }
 if(move.zodiacCleanLucy)log.push('✨ Virgo protegge Lucy!');
 if(move.zodiacTrapTurns){e.status='Prigione Sotterranea';e.statusTurns=move.zodiacTrapTurns;log.push('🕳️ Prigione Sotterranea per '+foe.name+'!');}
 if(move.zodiacRainTurns){e.weatherTurns=move.zodiacRainTurns;log.push('🌧️ Aquarius richiama la pioggia!');}
 for(const effect of [...(Array.isArray(move.statusEffects)?move.statusEffects:[]),...(move.statusEffect?[move.statusEffect]:[])]){
  if(effect?.type)applyStatus(effect.type,effect.chance??1,effect.turns||2);
 }
}
/** L'azione del giocatore viene registrata PRIMA della risposta del nemico.
 * Il client anima il colpo e, in caso di Prismaball, attende la cattura.
 * Solo ascensionResolveEncounterReaction può eseguire la replica avversaria. */
export function ascensionPlayEncounter(asc,role,choice,chars,rng=Math.random){
 if(asc.stage!=='preparation')throw Error('Non sei in preparazione.');
 return mutate(asc,next=>{
  const p=participant(next,role),e=p.encounter;
  if(!e)throw Error('Non hai un incontro attivo.');
  if(e.pendingReaction?.phase==='enemy')throw Error('Aspetta la risposta del Multimon avversario.');
  const activeIdx=e.active;
  let active=p.roster[activeIdx];
  if(!active||active.hp<=0){
   e.active=p.roster.findIndex(m=>m.hp>0);active=p.roster[e.active];
  }
  if(!active){
   concludeEncounter(p,e,'defeat',chars,['Non hai più Multimon disponibili.']);
   p.notice='Squadra esausta: questo round termina.';return;
  }
  if(active.id==='lucy'&&!e.spirit&&e.spiritOpen!==false)ascensionSummonLucySpirit(p,e,chars);
  const foeBase=ascensionFind(chars,e.foeId),foe=ascensionFighter(foeBase,e.foeLevel);
  foe.hp=e.foeHp;
  const log=[];
  const spiritTurn=e.pendingReaction?.phase==='spirit';
  if(choice?.type==='switch'){
   if(spiritTurn)throw Error('Lo Spirito deve scegliere una mossa.');
   const target=p.roster[choice.index];
   if(!target||target.hp<=0||choice.index===e.active)throw Error('Non puoi schierare questo Multimon.');
   e.active=choice.index;
   e.spirit=null;e.spiritOpen=false;
   log.push('Cambio! Entra '+ascensionFind(chars,target.id).name+'.');
   if(target.id==='lucy')ascensionSummonLucySpirit(p,e,chars);
  }else if(choice?.type==='ball'){
   if(spiritTurn)throw Error('Lucy deve terminare il turno con lo Spirito.');
   if(e.kind!=='wild')throw Error('Gli allenatori non sono catturabili.');
   if(p.prismaballs<=0)throw Error('Hai finito le Prismaball.');
   if(p.roster.length>=ASCENSION_MAX_TEAM)throw Error('Team pieno: massimo nove Multimon.');
   if(p.roster.some(m=>m.id===e.foeId))throw Error('Questo Multimon è già presente nel tuo team.');
   p.prismaballs--;
   const chance=ascensionCaptureChance(e.foeHp,e.foeMaxHp,{
    status:e.status,rare:Number(foeBase.price||0)>=250,veryRare:Number(foeBase.price||0)>=350});
   const captured=rng()<chance,failedAt=captured?3:1+rand(rng,3);
   p.lastCapture={success:captured,failedAt,foeId:e.foeId,chance,
    nonce:(p.lastCapture?.nonce||0)+1};
   if(captured){
    p.roster.push(ascensionMember(e.foeId,e.foeLevel,chars));
    p.captures++;
    concludeEncounter(p,e,'capture',chars,['✨ '+foeBase.name+' è stato catturato!']);
    p.notice='Sincronizzazione completa! '+foeBase.name+' entra nella tua squadra.';
    return;
   }
   log.push('💎 '+foeBase.name+' sfugge alla Prismaball!');
  }else if(choice?.type==='flee'){
   if(spiritTurn)throw Error('Completa prima l’azione dello Spirito.');
   if(e.kind==='trainer')throw Error('Non puoi fuggire dalla sfida allenatore.');
   concludeEncounter(p,e,'retreat',chars,['Ti ritiri dal varco.']);
   p.notice='Ti ritiri dal varco senza catturare.';return;
  }else if(choice?.type==='attack'){
   const isSpirit=choice.source==='spirit';
   if(isSpirit!==spiritTurn)throw Error('Questo Multimon non può agire in questa fase.');
   if(!isSpirit&&e.pendingReaction)throw Error('Il turno è già in corso.');
   const actor=isSpirit?e.spirit:active;
   if(!actor||(isSpirit&&actor.hp<=0))throw Error('Spirito Stellare non disponibile.');
   const base=ascensionFind(chars,actor.id);
   const index=Math.trunc(choice.index),moves=(base?.moves||[]).filter(Boolean);
   if(!Number.isInteger(index)||!moves[index])throw Error('Mossa non disponibile.');
   // Come nelle lotte classiche: tutte le mosse vengono prima scelte,
   // POI ordinate da priorità e Velocità nel vero motore.
   if(isSpirit)e.queuedSpiritAction={type:'attack',index};
   else e.queuedHeroAction={type:'attack',index};
   log.push((base?.name||actor.id)+' prepara '+moves[index].name+'...');
  }else throw Error('Comando non valido.');
  e.spiritOpen=false;
  e.eventNonce=(e.eventNonce||0)+1;
  e.log=[...(e.log||[]),...log].slice(-12);
  const nextPhase=choice.type==='attack'&&choice.source!=='spirit'&&e.spirit?.hp>0?'spirit':'enemy';
  e.pendingReaction={phase:nextPhase,reason:choice.type,nonce:e.eventNonce,
   text:log.slice(-2).join(' ')||'Il turno continua.'};
 });
}
/** La reazione avversaria è una SECONDA transazione, dopo l'animazione del colpo.
 * Una Prismaball fallita NON infligge mai danno prima della fine del suo filmato. */
export function ascensionResolveEncounterReaction(asc,role,chars,rng=Math.random){
 if(asc.stage!=='preparation')throw Error('Non sei in preparazione.');
 return mutate(asc,next=>{
  const p=participant(next,role),e=p.encounter;
  if(!e||e.pendingReaction?.phase!=='enemy')throw Error('Nessuna reazione da risolvere.');
  const active=p.roster[e.active];
  if(!active)throw Error('Non ci sono Multimon da comandare.');
  const foeBase=ascensionFind(chars,e.foeId);
  const players=p.roster.map((m,i)=>ascensionNativeFighter({
   ...m,battleState:e.nativeUnits?.p1?.[i]||m.battleState
  },chars));
  const foe=ascensionNativeFighter({
   id:e.foeId,level:e.foeLevel,hp:e.foeHp,battleState:e.nativeUnits?.p2?.[0]
  },chars);
  const actionsOne={};
  if(e.queuedHeroAction){
   const index=e.queuedHeroAction.index;
   actionsOne[e.active]=ascensionNativeMoveAction(index,'p2',0);
  }
  const spiritIndex=players.length;
  if(e.spirit?.hp>0){
   const spirit=ascensionNativeFighter({
    ...e.spirit,battleState:e.nativeUnits?.p1?.[spiritIndex]||e.spirit.battleState
   },chars);
   spirit.isZodiacSpirit=true;spirit.zodiacOwner='p1';
   spirit.zodiacLucyIdx=e.active;
   players.push(spirit);
   if(e.queuedSpiritAction)
    actionsOne[spiritIndex]=ascensionNativeMoveAction(e.queuedSpiritAction.index,'p2',0);
  }
  const fieldOne=[e.active,...(players[spiritIndex]?.isZodiacSpirit?[spiritIndex]:[])];
  const moves=(foe.moves||[]).filter(Boolean);
  const ai=trainerMove(foe,players[e.active],e.kind==='trainer'?e.trainer:'wild',rng);
  const aiIndex=Math.max(0,moves.findIndex(m=>m.name===ai?.name));
  const reaction=ascensionNativeTurn({
   characters:chars,teamOne:players,teamTwo:[foe],
   fieldOne,fieldTwo:[0],actionsOne,
   actionsTwo:{0:ascensionNativeMoveAction(aiIndex,'p1',e.active)},
   names:[p.role,e.kind==='trainer'?'Allenatore '+e.trainerName:'Selvatico'],
   fieldSize:fieldOne.length,turn:e.turn,
   weather:e.nativeWeather||null,tailwind:e.nativeTailwind||{}
  });
  const actual=reaction.teams.p1;
  const foeUpdated=reaction.teams.p2[0];
  p.roster.forEach((member,i)=>{
   if(actual[i])member.hp=actual[i].hp;
  });
  e.foeHp=foeUpdated.hp;
  e.nativeUnits={p1:actual,p2:reaction.teams.p2};
  e.nativeWeather=reaction.weather;e.nativeTailwind=reaction.tailwind;
  e.status=foeUpdated.statuses?.[0]?.type||null;
  e.statusTurns=foeUpdated.statuses?.[0]?.turns||0;
  if(e.spirit){
   const spirit=actual[spiritIndex];
   if(!spirit||spirit.hp<=0){
    e.spirit=null;e.spiritOpen=false;
   }else{
    e.spirit.hp=spirit.hp;
    e.spirit.battleState=spirit;
   }
  }
  e.queuedHeroAction=null;e.queuedSpiritAction=null;
  const log=reaction.log||[];
  e.eventNonce=(e.eventNonce||0)+1;
  e.nativePlayback={nonce:e.eventNonce,
   events:reaction.events,startTeams:reaction.startTeams,
   startField:reaction.startField,endTeams:reaction.teams,endField:reaction.field};
  e.lastReaction={nonce:e.eventNonce,text:log.slice(-2).join(' ')||'Il nemico ha agito!'};
  e.pendingReaction=null;
  if(e.foeHp<=0){
   ascensionWinEncounter(next,p,e,chars,log);
   return;
  }
  if(!p.roster.some(m=>m.hp>0)){
   concludeEncounter(p,e,'defeat',chars,[...log,'La tua squadra è esausta.']);
   p.notice='Squadra esausta. Riparti dal prossimo round.';
   return;
  }
  if(p.roster[e.active]?.hp<=0){
   e.active=p.roster.findIndex(m=>m.hp>0);
   e.spirit=null;e.spiritOpen=false;
   const arriving=ascensionFind(chars,p.roster[e.active].id);
   log.push('Entra in campo '+arriving.name+'!');
   if(arriving.id==='lucy')ascensionSummonLucySpirit(p,e,chars);
  }
  e.turn++;
  e.log=[...(e.log||[]),...log].slice(-20);
 });
}
export function ascensionRoundReady(asc){return asc.stage==='preparation'&&asc.roles.every(r=>asc.participants[r].done&&!asc.participants[r].encounter&&!asc.participants[r].battleResult);}
export function ascensionNextRound(asc,chars){
 if(!ascensionRoundReady(asc))throw Error('Qualcuno sta ancora completando il round.');
 if(asc.round===ASCENSION_ROUNDS)return ascensionStartColosseum(asc,chars);
 return mutate(asc,next=>{
  if(next.round%6===0)next.roles.forEach(r=>next.participants[r].roster.forEach(m=>{
    const max=ascensionScaledMaxHp(ascensionFind(chars,m.id),m.level);
    m.hp=Math.min(max,m.hp+Math.ceil(max*.4));
  }));
  next.round++;
  next.roles.forEach(r=>{next.participants[r].done=false;next.participants[r].lastCapture=null;next.participants[r].battleResult=null;next.participants[r].shopBuys=0;next.participants[r].notice='Nuovo round: scegli una attività.';});
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
// Le sfide del torneo eseguono il motore CLASSICO (lo stesso di CPU, online,
// locale e campagne). Il Colosseo gestisce soltanto bracket, livelli e premi.
export function ascensionDuelAction(asc,role,choice,chars,rng=Math.random){
 return mutate(asc,next=>{
  const match=ascensionCurrentMatch(next),game=match?.game;
  if(!game||game.winner||!match.roles.includes(role))throw Error('Nessuna battaglia attiva.');
  const count=match.stage==='finale'?2:1;
  const teams=match.roles.map(r=>game.units[r]||[]);
  const livingField=role=>{
   const saved=game.field?.[role];
   if(Array.isArray(saved)){
    const active=saved.filter(i=>game.units[role][i]?.hp>0);
    if(active.length)return active;
   }
   return game.units[role].map((u,i)=>u.hp>0?i:-1).filter(i=>i>=0).slice(0,count);
  };
  const fields=Object.fromEntries(match.roles.map(r=>[r,livingField(r)]));
  const readyInputs=game.actions||{};
  const current=readyInputs[role]&&typeof readyInputs[role]==='object'?
    readyInputs[role]:{};
  const input=(choice&&typeof choice==='object')?choice:{type:'attack',index:choice};
  const from=Number.isInteger(input.fromIdx)?input.fromIdx:
    fields[role].find(i=>!current[i]);
  if(!Number.isInteger(from)||!fields[role].includes(from)||current[from])
   throw Error('Hai già comandato questo Multimon o non è attivo.');
  if(input.type==='switch'){
   const to=Math.trunc(input.index);
   if(!Number.isInteger(to)||!game.units[role][to]||game.units[role][to].hp<=0||
     fields[role].includes(to))throw Error('Cambio non valido.');
   current[from]={type:'switch',fromIdx:from,toIdx:to};
  }else{
   const char=ascensionFind(chars,game.units[role][from].id);
   const idx=clamp(Math.trunc(input.index)||0,0,(char?.moves||[]).filter(Boolean).length-1);
   if(!char?.moves?.filter(Boolean)[idx])throw Error('Mossa non disponibile.');
   current[from]={type:'attack',moveIdx:idx,
    targetPlayer:input.targetPlayer==='p1'?'self':'enemy',
    targetIdx:Number.isInteger(input.targetIdx)?input.targetIdx:null};
  }
  game.actions={...readyInputs,[role]:current};
  // La finale 2v2 richiede un comando per ognuno dei DUE combattenti in campo.
  const allReady=match.roles.every(r=>fields[r].every(i=>game.actions?.[r]?.[i]));
  if(!allReady)return;
  const allFighters=Object.fromEntries(match.roles.map(r=>[
   r,game.units[r].map(u=>ascensionNativeFighter(u,chars))]));
  const a=match.roles[0],b=match.roles[1];
  const actionMap=(actor,enemy)=>Object.fromEntries(fields[actor].map((idx,slot)=>{
   const chosen=game.actions[actor][idx];
   if(chosen.type==='switch')return [idx,chosen];
   const targetActor=chosen.targetPlayer==='self'?actor:enemy;
   const targetField=fields[targetActor];
   const validTarget=targetField.includes(chosen.targetIdx)?chosen.targetIdx:
     targetField[slot%targetField.length];
   const nativeTarget=(targetActor===a?'p1':'p2');
   return [idx,ascensionNativeMoveAction(chosen.moveIdx,nativeTarget,validTarget)];
  }));
  const result=ascensionNativeTurn({
   characters:chars,
   teamOne:allFighters[a],teamTwo:allFighters[b],
   fieldOne:fields[a],fieldTwo:fields[b],
   actionsOne:actionMap(a,b),actionsTwo:actionMap(b,a),
   names:[a,b],fieldSize:count,turn:game.turn,
   weather:game.weather||null,tailwind:game.tailwind||{}
  });
  for(const [nativeRole,actor] of [['p1',a],['p2',b]]){
   game.units[actor]=result.teams[nativeRole].map(u=>({
    id:u.id,level:u.level,hp:u.hp,battleState:u
   }));
   game.field??={};
   // Anche gli Spiriti di Lucy restano realmente sul campo e
   // ricevono un comando, esattamente come nelle partite classiche.
   game.field[actor]=result.field[nativeRole].filter(i=>game.units[actor][i]?.hp>0);
  }
  game.weather=result.weather;
  game.tailwind=result.tailwind;
  game.playback={
   nonce:(game.playback?.nonce||0)+1,
   events:result.events.slice(-55),
   startTeams:result.startTeams,startField:result.startField,
   endTeams:result.teams,endField:result.field
  };
  game.turn++;game.actions={};
  game.log=[...(game.log||[]),...result.log].slice(-22);
  const defeated=match.roles.find(r=>!alive(game.units[r]).filter(
    u=>!u.battleState?.isSummonOnly).length);
  const timeLimit=game.turn>=46;
  if(!defeated&&!timeLimit)return;
  const winner=defeated?match.roles.find(r=>r!==defeated):
    match.roles.slice().sort((x,y)=>{
     const ratio=r=>game.units[r].reduce((sum,u)=>sum+
       u.hp/Math.max(1,ascensionScaledMaxHp(ascensionFind(chars,u.id),u.level)),0);
     return ratio(y)-ratio(x);
    })[0];
  if(timeLimit)game.log.push('Limite turni: vince la squadra con più PS rimasti.');
  match.wins[winner]=(match.wins[winner]||0)+1;
  game.winner=winner;
  if(match.stage==='finale'||match.wins[winner]>=2)match.winner=winner;
  game.resultAcknowledged={};
 });
}
export function ascensionAcknowledgeDuelResult(asc,role){
 if(asc.stage!=='colosseum')throw Error('Il Colosseo non è aperto.');
 return mutate(asc,next=>{
  const match=ascensionCurrentMatch(next),game=match?.game;
  if(!game?.winner||!match.roles.includes(role))throw Error('Nessuna partita da confermare.');
  if(match.winner)throw Error('Il duello è terminato: aspetta il prossimo incontro.');
  game.resultAcknowledged={...(game.resultAcknowledged||{}),[role]:true};
  if(match.roles.every(r=>game.resultAcknowledged[r])){
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
  if(p.battleResult)return ascensionAcknowledgeEncounterResult(asc,role);
  if(p.done)return asc;
  let next=asc;
  if(!p.encounter){
   const choice=p.roster.length<7 && rng()<.67?'wild':'trainer';
   next=ascensionBeginAction(next,role,choice,chars,rng);
  }
  for(let i=0;i<28;i++){
   p=participant(next,role);if(!p.encounter)break;
   const e=p.encounter,hero=p.roster[e.active];
   if(e.pendingReaction?.phase==='enemy'){
    next=ascensionResolveEncounterReaction(next,role,chars,rng);
    continue;
   }
   if(e.pendingReaction?.phase==='spirit'){
    const moves=(ascensionFind(chars,e.spirit?.id)?.moves||[]).filter(Boolean);
    const index=moves.findIndex(m=>m?.power>0);
    next=ascensionPlayEncounter(next,role,{type:'attack',source:'spirit',index:Math.max(0,index)},chars,rng);
    continue;
   }
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
  if(match.game.winner){
   return match.game.resultAcknowledged?.[role]?asc:ascensionAcknowledgeDuelResult(asc,role);
  }
  const count=match.stage==='finale'?2:1;
  const units=match.game.units[role];
  const field=match.game.field?.[role]||units.map((m,i)=>m.hp>0?i:-1).filter(i=>i>=0).slice(0,count);
  const from=field.find(idx=>!match.game.actions?.[role]?.[idx]);
  if(from==null)return asc;
  const unit=units[from];
  const moves=(ascensionFind(chars,unit.id).moves||[]).filter(Boolean);
  const attacks=moves.map((m,i)=>m?.power>0?i:-1).filter(i=>i>=0);
  return ascensionDuelAction(asc,role,{type:'attack',fromIdx:from,
   index:attacks.length?attacks[rand(rng,attacks.length)]:0},chars,rng);
 }
 return asc;
}

export function ascensionSettleBots(asc,room,chars,rng=Math.random){
 let next=asc;
 for(let cycle=0;cycle<95;cycle++){
  let changed=false;
  for(const role of next.roles){
   if(!room.isBot?.[role])continue;
   const p=participant(next,role);
   let needed=false;
   if(next.stage==='starters')needed=!p.roster.length;
   else if(next.stage==='preparation')needed=!p.done||!!p.battleResult;
   else if(next.stage==='colosseum'){
    const m=ascensionCurrentMatch(next);
    needed=Boolean(m&&m.roles.includes(role)&&!m.winner&&
      (!m.selection[role]||m.game?.winner&&!m.game.resultAcknowledged?.[role]||m.game&&(()=>{
       const field=m.game.field?.[role]||m.game.units[role].map((u,i)=>u.hp>0?i:-1).filter(i=>i>=0).slice(0,m.stage==='finale'?2:1);
       return field.some(idx=>!m.game.actions?.[role]?.[idx]);
      })()));
   }
   if(!needed)continue;
   const after=ascensionBotTurn(next,role,chars,rng);
   if(after!==next){next=after;changed=true;}
  }
  if(!changed)break;
 }
 return next;
}
