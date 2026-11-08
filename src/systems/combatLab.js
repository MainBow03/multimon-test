// Laboratorio di Combattimento — configurazione temporanea e isolata.
// Riutilizza il motore di lotta classico; NON modifica i progressi.
export const COMBAT_LAB_CONFIG_KEY='multimon_combat_lab_config_v1';
export const COMBAT_LAB_PRESETS_KEY='multimon_combat_lab_presets_v1';
export const COMBAT_LAB_MAX_PRESETS=5;
export const COMBAT_LAB_STATUSES=Object.freeze([
 {id:'none',label:'Nessuno',turns:0},
 {id:'Assiderato',label:'❄️ Assideramento · 2 turni',turns:2},
 {id:'Scottato',label:'🔥 Scottatura',turns:3},
 {id:'Avvelenato',label:'☠️ Veleno',turns:3},
 {id:'Elettrizzato',label:'⚡ Elettrizzato',turns:2},
 {id:'Indebolito',label:'⬇️ Indebolito',turns:2},
 {id:'Confuso',label:'🌀 Confuso',turns:2},
 {id:'Accecato',label:'🌫️ Accecato',turns:2}
]);
export const COMBAT_LAB_WEATHERS=Object.freeze([
 {id:'none',label:'☀️ Nessun meteo'},
 {id:'rainstorm',label:'🌧️ Pioggia · 5 turni'},
 {id:'snowstorm',label:'❄️ Tempesta di neve · 5 turni'},
 {id:'lush_grass',label:'🌿 Erba rigogliosa · 5 turni'}
]);
export const COMBAT_LAB_CPU=Object.freeze([
 {id:'dummy',label:'🧱 Manichino immobile',description:'Passa sempre il turno, ideale per provare danni e status.'},
 {id:'normal',label:'🤖 CPU normale',description:'Attacca e usa mosse di supporto con un criterio aggressivo.'},
 {id:'expert',label:'🧠 CPU tattica',description:'Usa il sistema di decisione strategica e cerca buone sostituzioni.'}
]);
export const COMBAT_LAB_DEFAULT={
 p1:['sonic','jake','ganyu','coraline'],
 p2:['elsa','garnet','frillish','flins'],
 fieldSize:2,cpuMode:'dummy',weather:'none',
 hpP1:100,hpP2:100,statusP1:'none',statusP2:'none',
 upgrades:false
};
const bounded=(value,min,max,fallback)=>Number.isFinite(Number(value))
 ?Math.max(min,Math.min(max,Math.trunc(Number(value))))):fallback;
const validIds=characters=>new Set((characters||[])
 .filter(c=>c?.id&&!c.isSecretUnlock&&!c.isSummonOnly&&!c.isCampaignMonster&&!c.fusionOf)
 .map(c=>c.id));
export function normalizeCombatLabConfig(config,characters){
 const allowed=validIds(characters),fallback=(characters||[]).filter(c=>allowed.has(c.id)).slice(0,4).map(c=>c.id);
 const uniqueTeam=(ids,def)=>[...new Set((Array.isArray(ids)?ids:def).filter(id=>allowed.has(id)))].slice(0,6);
 const p1=uniqueTeam(config?.p1,COMBAT_LAB_DEFAULT.p1);
 const p2=uniqueTeam(config?.p2,COMBAT_LAB_DEFAULT.p2);
 return {
  p1:p1.length?p1:[...fallback.slice(0,1)],
  p2:p2.length?p2:[...fallback.slice(0,1)],
  fieldSize:bounded(config?.fieldSize,1,4,COMBAT_LAB_DEFAULT.fieldSize),
  cpuMode:COMBAT_LAB_CPU.some(c=>c.id===config?.cpuMode)?config.cpuMode:'dummy',
  weather:COMBAT_LAB_WEATHERS.some(w=>w.id===config?.weather)?config.weather:'none',
  hpP1:bounded(config?.hpP1,10,100,100),
  hpP2:bounded(config?.hpP2,10,100,100),
  statusP1:COMBAT_LAB_STATUSES.some(s=>s.id===config?.statusP1)?config.statusP1:'none',
  statusP2:COMBAT_LAB_STATUSES.some(s=>s.id===config?.statusP2)?config.statusP2:'none',
  upgrades:false // I potenziamenti Punti Forza non sono applicati in questo sandbox.
 };
}
export function combatLabStatus(type){
 const definition=COMBAT_LAB_STATUSES.find(s=>s.id===type);
 return definition&&definition.turns>0
  ?{type:definition.id,turns:definition.turns,justApplied:true}
  :null;
}
export function combatLabWeather(type){
 return type==='none'||!COMBAT_LAB_WEATHERS.some(w=>w.id===type)
  ?null:{type,turns:5};
}
export function prepareCombatLabFighter(base,percentage=100,status='none'){
 if(!base||!Array.isArray(base.moves))throw new Error('Multimon non valido per il laboratorio.');
 const fighter=JSON.parse(JSON.stringify(base));
 fighter.maxHp=Math.max(1,Number(fighter.maxHp||fighter.hp)||100);
 fighter.hp=Math.max(1,Math.ceil(fighter.maxHp*bounded(percentage,10,100,100)/100));
 fighter.baseAtk=fighter.atk;fighter.baseDef=fighter.def;fighter.baseSpd=fighter.spd;
 fighter.statuses=combatLabStatus(status)?[combatLabStatus(status)]:[];
 fighter.moves=fighter.moves.filter(Boolean).map(move=>({
  ...move,remainingUses:move.maxUses??null
 }));
 fighter.heldItem=null;
 fighter.consecutiveProtect=0;
 fighter.revealed=false;
 return fighter;
}
export function createCombatLabRoom(raw,characters,initialGameState,name='Allenatore'){
 const config=normalizeCombatLabConfig(raw,characters);
 const byId=new Map((characters||[]).map(c=>[c.id,c]));
 const team=(ids,hp,status)=>ids.map(id=>prepareCombatLabFighter(byId.get(id),hp,status));
 const base=initialGameState();
 const p1=team(config.p1,config.hpP1,config.statusP1);
 const p2=team(config.p2,config.hpP2,config.statusP2);
 const fieldSize=Math.min(config.fieldSize,p1.length,p2.length);
 return {
  ...base,status:'drafting',gameMode:'classica',isTrainingBattle:true,
  players:{...base.players,p1:name.trim()||'Allenatore',p2:config.cpuMode==='dummy'?'Manichino':'CPU Laboratorio'},
  isBot:{...base.isBot,p2:true},playerStrength:{...base.playerStrength,p1:{},p2:{}},
  playerStrengthOwned:{...base.playerStrengthOwned,p1:[],p2:[]},
  cpuStyles:{p2:config.cpuMode==='expert'?'tactical':'aggressive'},
  draft:{...base.draft,p1,p2},
  inventory:{...base.inventory,p1:{},p2:{}},
  settings:{...base.settings,fieldSize,teamSize:Math.max(p1.length,p2.length),maxPlayers:2,draftBattle:false,
   sharedDraft:false,rentalMode:true,fusionMode:false},
  trainingLab:{config,cpuMode:config.cpuMode,weather:config.weather,startedAt:Date.now()}
 };
}
export function dummyCombatLabActions(room,player){
 if(!room?.isTrainingBattle||player!=='p2'||room.trainingLab?.cpuMode!=='dummy')return null;
 return Object.fromEntries((room.field?.[player]||[])
  .filter(index=>(room.teams?.[player]?.[index]?.hp||0)>0)
  .map(index=>[index,{type:'pass'}]));
}
export function canEditCombatLabBattle(room,isPlayingEvents=false){
 return room?.isTrainingBattle===true&&room.status==='battling'&&!isPlayingEvents;
}
export function editCombatLabFighter(room,role,index,{status,hpPercent,clearStatus}={}){
 if(!canEditCombatLabBattle(room)||!['p1','p2'].includes(role))return null;
 const src=room.teams?.[role]?.[index];
 if(!src||src.hp<=0)return null;
 const newChar={...src,statuses:(src.statuses||[]).map(s=>({...s}))};
 if(clearStatus)newChar.statuses=[];
 if(status&&status!=='none'){
  const effect=combatLabStatus(status);
  if(!effect)return null;
  newChar.statuses=newChar.statuses.filter(s=>s.type!==status);
  newChar.statuses.push(effect);
 }
 if(hpPercent!==undefined)
  newChar.hp=Math.max(1,Math.ceil(newChar.maxHp*bounded(hpPercent,10,100,100)/100));
 return {
  teams:{...room.teams,[role]:room.teams[role].map((c,i)=>i===index?newChar:c)},
  // Non cambiare campo, team avversario o azioni pendenti.
 };
}
export function combatLabReportTotals(report,role){
 return Object.values(report?.entries||{}).filter(c=>c.player===role)
  .reduce((total,e)=>{
   for(const key of ['damageDealt','damageTaken','healing','kos','passiveActivations','shieldsBroken'])
    total[key]+=(Number(e[key])||0);
   return total;
  },{damageDealt:0,damageTaken:0,healing:0,kos:0,passiveActivations:0,shieldsBroken:0});
}
