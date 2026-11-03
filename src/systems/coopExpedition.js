// Funzioni pure per la spedizione co-op. La stanza Firestore è la sola fonte di verità.
export const COOP_HUMANS=['p1','p2','p3'];
export const COOP_BOSS='p4';
export const COOP_MAX_FLOOR=50;
export const COOP_MAX_TEAM=8;
const real=c=>Boolean(c&&!c.isSummonOnly);
export const coopHumanPlayers=room=>COOP_HUMANS.filter(p=>Boolean(room?.players?.[p])&&!room?.isBot?.[p]);
export const coopCount=(room,p)=>(room.teams?.[p]||[]).filter(real).length;
export const coopRosterIds=room=>new Set(COOP_HUMANS.flatMap(p=>(room.teams?.[p]||[]).filter(real).map(c=>c.id)));
export const coopRecruitChance=run=>Math.min(.85,.30+(run?.recruitBonus||0));
export const COOP_SHOP={
 heal:{price:20,desc:'Recupera il 50% dei PS massimi a un Multimon vivo'},
 revive:{price:50,desc:'Rianima un Multimon sconfitto con il 50% dei PS'},
 full:{price:90,desc:'Cura fino al massimo i PS di tutti i Multimon ancora vivi'}
};
/**
 * Pesatura: 1 + 3 multimon per ogni membro in meno rispetto al compagno
 * che ne possiede di più. Non assegna reclute a squadre con 8 membri.
 */
export function coopRecruitWeights(room){
 const players=coopHumanPlayers(room).filter(p=>coopCount(room,p)<COOP_MAX_TEAM);
 const maximum=Math.max(0,...players.map(p=>coopCount(room,p)));
 return players.map(p=>({player:p,count:coopCount(room,p),weight:1+3*(maximum-coopCount(room,p))}));
}
export function chooseCoopRecruitOwner(room,random=Math.random){
 const choices=coopRecruitWeights(room);
 const total=choices.reduce((sum,c)=>sum+c.weight,0);
 if(!total)return null;
 let roll=Math.max(0,Math.min(1-Number.EPSILON,random()))*total;
 for(const c of choices){roll-=c.weight;if(roll<0)return c.player}
 return choices.at(-1).player;
}
export function freshCoopFighter(base,old=null){
 const c=structuredClone(base);
 const hp=old?.hp??base.maxHp;
 Object.assign(c,{hp:Math.max(0,Math.min(base.maxHp,hp)),maxHp:base.maxHp,
  baseAtk:base.atk,baseDef:base.def,baseSpd:base.spd,
  spAtk:base.spAtk??base.atk,spDef:base.spDef??base.def,
  baseSpAtk:base.spAtk??base.atk,baseSpDef:base.spDef??base.def,
  statuses:[],consecutiveProtect:0,revealed:true,
  moves:(base.moves||[]).filter(Boolean).map(m=>({...m,remainingUses:m.maxUses??null}))});
 if(old?.heldItem)c.heldItem=old.heldItem;
 if(old?.zodiacSpiritId)c.zodiacSpiritId=old.zodiacSpiritId;
 return c;
}
export function coopEnemyForFloor(floor,roster,playerCount=3,encountered=[],random=Math.random){
 const end=floor===COOP_MAX_FLOOR,boss=floor%10===0;
 let eligible=roster.filter(c=>!c.isSummonOnly&&!c.isCampaignMonster && (
  end?(c.isSecretUnlock||c.price>=300||['trigon','gaster','cell'].includes(c.id)):!c.isSecretUnlock));
 if(!eligible.length)eligible=roster.filter(c=>!c.isSummonOnly);
 const unseen=eligible.filter(c=>!encountered.includes(c.id));
 const pool=unseen.length?unseen:eligible;
 const base=pool[Math.floor(random()*pool.length)]||roster.find(c=>!c.isSummonOnly);
 if(!base)throw new Error('Nessun avversario disponibile.');
 const enemy=freshCoopFighter(base);
 const tier=Math.floor((floor-1)/10);
 const scale=1+tier*.08;
 const hpScale=(1+(Math.max(1,playerCount)-1)*.55)*(boss?1.55:1)*(end?1.6:1);
 const atkScale=(1+tier*.065)*(boss?1.12:1)*(end?1.2:1);
 enemy.maxHp=Math.max(1,Math.round(base.maxHp*scale*hpScale));
 enemy.hp=enemy.maxHp;
 enemy.atk=Math.round(base.atk*atkScale);
 enemy.def=Math.round(base.def*scale);
 enemy.spd=Math.round(base.spd*(1+tier*.04));
 enemy.baseAtk=enemy.atk;enemy.baseDef=enemy.def;enemy.baseSpd=enemy.spd;
 enemy.isCoopBoss=boss||end;
 return enemy;
}
const emptyActions=()=>Object.fromEntries(['p1','p2','p3','p4','p5','p6','p7','p8'].map(p=>[p,{}]));
const emptyFields=()=>Object.fromEntries(['p1','p2','p3','p4','p5','p6','p7','p8'].map(p=>[p,[]]));
/** Returns one Firestore patch for winning the current floor, no duplicate reward on repeated click. */
export function finishCoopFloor(room,roster,random=Math.random){
 if(!room?.isRoguelikeCoop || room.status!=='gameover')
   throw new Error('La spedizione non è in fase di ricompensa.');
 const run=room.coopRun||{},floor=run.floor||1;
 if(!room.winner || room.winner===room.players?.p4 || room.winner==='Pareggio')
   throw new Error('Questo combattimento non è stato vinto.');
 const teams=structuredClone(room.teams);
 const humans=coopHumanPlayers(room);
 for(const p of humans)teams[p]=(teams[p]||[]).filter(real).map(c=>freshCoopFighter(roster.find(b=>b.id===c.id)||c,c));
 const coins=10+Math.floor(random()*21);
 const oldIds=coopRosterIds({teams});
 const enemies=(room.teams?.p4||[]).filter(c=>real(c)&&!oldIds.has(c.id));
 const recruitChance=coopRecruitChance(run);
 let recruited=null;
 if(enemies.length && random()<recruitChance){
  const choice=enemies[Math.floor(random()*enemies.length)];
  const owner=chooseCoopRecruitOwner({players:room.players,isBot:room.isBot,teams},random);
  const base=roster.find(c=>c.id===choice.id);
  if(base&&owner){
   teams[owner].push(freshCoopFighter(base));
   recruited={id:base.id,name:base.name,owner};
  }
 }
 // Accampamento ogni 5 piani: +40% soltanto ai combattenti vivi.
 if(floor%5===0)
  for(const p of humans)for(const c of teams[p]||[])
   if(c.hp>0)c.hp=Math.min(c.maxHp,c.hp+Math.floor(c.maxHp*.4));
 const lastEnemies=[...new Set([...(run.encounteredEnemies||[]),...(room.teams?.p4||[]).filter(real).map(c=>c.id)])];
 const complete=floor>=COOP_MAX_FLOOR;
 return {status:complete?'coop_complete':'coop_camp',teams,
  coopRun:{...run,floor:complete?floor:floor+1,lastClearFloor:floor,
   coins:(run.coins||0)+coins,lastCoins:coins,lastRecruit:recruited,
   recruitBonus:recruited?0:Math.min(.55,(run.recruitBonus||0)+.02),
   encounteredEnemies:lastEnemies,finished:complete},
  phaseStartedAt:Date.now(),events:[],actions:emptyActions(),winner:null};
}
export function coopCampPurchase(room,roster,kind,player,idx){
 if(!room?.isRoguelikeCoop || room.status!=='coop_camp')
  throw new Error('Il negozio è disponibile solo all’accampamento.');
 const price=COOP_SHOP[kind]?.price;
 if(!price)throw new Error('Oggetto inesistente.');
 if((room.coopRun?.coins||0)<price)throw new Error('Monete della spedizione insufficienti.');
 if(!coopHumanPlayers(room).includes(player))throw new Error('Questo giocatore non partecipa alla spedizione.');
 const teams=structuredClone(room.teams);
 const target=teams[player]?.[idx];
 if(!target || target.isSummonOnly)throw new Error('Il Multimon scelto non è disponibile.');
 if(kind==='heal'){
  if(target.hp<=0||target.hp>=target.maxHp)throw new Error('Scegli un Multimon vivo e ferito.');
  target.hp=Math.min(target.maxHp,target.hp+Math.floor(target.maxHp*.5));
 }else if(kind==='revive'){
  if(target.hp>0)throw new Error('Puoi rianimare soltanto un Multimon esausto.');
  target.hp=Math.max(1,Math.floor(target.maxHp*.5));
 }else if(kind==='full'){
  if(!coopHumanPlayers(room).some(p=>teams[p]?.some(c=>real(c)&&c.hp>0&&c.hp<c.maxHp)))
   throw new Error('Tutti i Multimon vivi hanno già i PS al massimo.');
  for(const p of coopHumanPlayers(room))for(const c of teams[p]||[])if(real(c)&&c.hp>0)c.hp=c.maxHp;
 }
 return {teams,coopRun:{...room.coopRun,coins:room.coopRun.coins-price}};
}
/** Atomically reset combat for the next floor without losing persistent HP, recruits or items. */
export function nextCoopFloor(room,roster,applyOnEnter=null,random=Math.random){
 if(!room?.isRoguelikeCoop || room.status!=='coop_camp')
   throw new Error('Il prossimo piano non è ancora disponibile.');
 const floor=room.coopRun?.floor||1;
 if(floor>COOP_MAX_FLOOR)throw new Error('La spedizione è già terminata.');
 const humans=coopHumanPlayers(room);
 if(humans.length<2)throw new Error('Servono almeno due giocatori.');
 const teams={...structuredClone(room.teams)},field=emptyFields();
 for(const p of humans){
  teams[p]=(room.teams[p]||[]).filter(real).map(c=>freshCoopFighter(roster.find(b=>b.id===c.id)||c,c));
  const idx=teams[p].findIndex(c=>c.hp>0);
  if(idx>=0)field[p]=[idx];
 }
 if(!humans.some(p=>field[p].length))throw new Error('Tutti i Multimon sono esausti! Occorre rianimarne uno.');
 const enemy=coopEnemyForFloor(floor,roster,humans.length,room.coopRun.encounteredEnemies,random);
 teams.p4=[enemy];field.p4=[0];
 const events=[];
 if(typeof applyOnEnter==='function')
  for(const p of [...humans,'p4'])for(const idx of [...field[p]]){
   const c=teams[p][idx];
   if(c?.passive?.type==='on_enter'){
    c.passiveUses=1;
    applyOnEnter(c,p,idx,teams,field,events,room);
   }
  }
 return {status:'pre_battle',phaseStartedAt:Date.now(),turnExpiresAt:null,
  teams,field,events,postExecStatus:'battling',battleWeather:null,
  fieldTraps:{},fieldTrapSeen:{},actions:emptyActions(),
  healingItemsUsed:{p1:0,p2:0,p3:0,p4:0,p5:0,p6:0,p7:0,p8:0},
  hyperUsed:{p1:false,p2:false,p3:false,p4:false},
  pendingSwitches:{p1:0,p2:0,p3:0,p4:0},
  switchActions:{p1:[],p2:[],p3:[],p4:[]},switchZodiacChoices:{p1:{},p2:{},p3:{},p4:{}},
  winner:null,coopRun:{...room.coopRun,lastRecruit:null,lastCoins:0},
  // Start fresh combat reports on each floor.
  battleReport:{version:1,turns:0,entries:{}}};
}
