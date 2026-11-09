// Adattatore Firestore -> motore ufficiale Multimon.
// Il Torneo del Multiverso NON calcola più autonomamente mosse, danni o passive:
// questa funzione chiama calculateTurnImpl, la stessa della battaglia classica.
// Soltanto conversioni di ruoli, comandi e salvataggio Firestore restano locali.
import {calculateTurnImpl,calculateDamageImpl,applyOnEnterPassiveImpl} from './battleSystem.js';
import {getMultiplier} from './typeSystem.js';
import {CHARACTERS,FUSION_CHARACTERS,MOVES_DB,ITEMS_DB} from '../data/gameData.js';
import {activeEventFighters,buildEventBattle} from './multiverseEventEngine.js';

const base=Object.fromEntries(CHARACTERS.map(char=>[char.id,char]));
const idOf=(uid,idx)=>'p'+(idx+1);
const slots=()=>Object.fromEntries(['p1','p2','p3','p4','p5','p6','p7','p8'].map(id=>[id,[]]));
const objects=()=>Object.fromEntries(['p1','p2','p3','p4','p5','p6','p7','p8'].map(id=>[id,{}]));
const copy=value=>structuredClone(value);
const normalizeStatus=s=>typeof s==='string'?{type:s,turns:1}:s;
const cleanLog=e=>typeof e==='string'?e:(e?.text||'');
const combatRoleMap=b=>{
 const owners=[...(b.owners?.A||[]),...(b.owners?.B||[])];
 const roles=Object.fromEntries(owners.map((uid,i)=>[uid,idOf(uid,i)]));
 const byRole=Object.fromEntries(owners.map((uid,i)=>[idOf(uid,i),uid]));
 return {owners,roles,byRole};
};
const fighterToClassic=(f)=>{
 const initial=base[f.id]||{};
 const previous=Array.isArray(f.classicStatuses)?f.classicStatuses:f.statuses||[];
 const moves=(f.moves||[]).map(m=>{
  const definition=initial.moves?.find(move=>move.name===m.name)||MOVES_DB[m.name]||{};
  return {...copy(definition),...copy(m),
   remainingUses:m.remainingUses??m.uses??definition.maxUses??null};
 });
 return {...copy(f),moves,statuses:copy(previous).map(normalizeStatus),
  baseAtk:f.baseAtk??f.atk,baseDef:f.baseDef??f.def,baseSpd:f.baseSpd??f.spd,
  baseSpAtk:f.baseSpAtk??f.spAtk??f.atk,baseSpDef:f.baseSpDef??f.spDef??f.def,
  spAtk:f.spAtk??f.atk,spDef:f.spDef??f.def,acc:f.acc??1,consecutiveProtect:f.consecutiveProtect??0,
  isHyper:!!(f.isHyper||f.hyper),revealed:true};
};

export function adaptTournamentToClassic(b,settings){
 const {owners,roles,byRole}=combatRoleMap(b);
 const teams=slots(),field=slots(),players={},playerAvatars={};
 const inventory=objects(),hyperUsed=objects();
 for(const uid of owners){
  const side=b.owners.A.includes(uid)?'A':'B';
  const role=roles[uid];
  const ownerUnits=(b.teams[side]||[]).filter(unit=>unit.owner===uid);
  teams[role]=ownerUnits.map(fighterToClassic);
  players[role]=uid;
  playerAvatars[role]='';
  hyperUsed[role]=!!b.hyperUsed?.[uid];
  const requested=new Set(activeEventFighters(b,side,settings).filter(u=>u.owner===uid).map(u=>u.key));
  field[role]=ownerUnits.map((u,i)=>requested.has(u.key)&&u.hp>0?i:-1).filter(i=>i>=0);
 }
 // Unisci i giocatori di ogni lato usando la STESSA modalità dello scontro standard.
 const gameMode=settings.doubles?'multipla':'classica';
 const gameState={status:'battling',gameMode,players,playerAvatars,
  teams,field,inventory,hyperUsed,actions:objects(),
  settings:{...settings,fieldSize:settings.fieldSize,allowHyper:!!settings.allowHyper,
    allowItems:!!settings.allowItems},battleWeather:b.weather||null,
  battleTailwind:b.tailwind||{},fieldTraps:b.traps||{},
  fieldTrapSeen:b.trapSeen||{},healingItemsUsed:{},aiMemory:{},battleReport:null,
  isCampaignBattle:false,isRoguelikeBattle:false,isRoguelikeCoop:false};
 return {roles,byRole,owners,teams,field,gameState};
}

export function translateTournamentCommands(b,submissions,converted){
 const result=objects();
 const location=new Map();
 for(const [role,uid] of Object.entries(converted.byRole)){
  for(let index=0;index<converted.teams[role].length;index++){
   const unit=converted.teams[role][index];
   if(unit?.key)location.set(unit.key,{role,index,uid});
  }
 }
 for(const [uid,actions] of Object.entries(submissions||{})){
  const role=converted.roles[uid];
  if(!role||!Array.isArray(actions))continue;
  for(const command of actions){
   const actor=location.get(command.actor);
   if(!actor||actor.uid!==uid||actor.role!==role)continue;
   const char=converted.teams[role][actor.index];
   if(!char||char.hp<=0||!converted.field[role].includes(actor.index))continue;
   if(command.type==='switch'){
    const replacement=location.get(command.switchTo);
    if(replacement?.uid===uid && replacement.role===role&&
       converted.teams[role][replacement.index]?.hp>0&&!converted.field[role].includes(replacement.index))
      result[role][actor.index]={type:'switch',toIdx:replacement.index};
    continue;
   }
   // L'inventario di battaglia del torneo è sempre vuoto: nessun uso dello zaino.
   if(command.type==='use_item')continue;
   const moveIdx=Number(command.moveIndex);
   if(!Number.isInteger(moveIdx)||moveIdx<0||moveIdx>=char.moves.length)continue;
   const move=char.moves[moveIdx];
   if(move.remainingUses!==null && move.remainingUses!==undefined&&move.remainingUses<=0)continue;
   const target=location.get(command.target);
   const enemySide=b.owners.A.includes(uid)?'B':'A';
   const fallback=activeEventFighters(b,enemySide,converted.gameState.settings)
     .find(t=>t.hp>0);
   const enemy=fallback?location.get(fallback.key):null;
   const isSupport=move.targetMode==='ally'||move.targetMode==='revive';
   const legal=target &&(isSupport?
     (b.owners.A.includes(target.uid)===b.owners.A.includes(uid)):
     (b.owners.A.includes(target.uid)!==b.owners.A.includes(uid)));
   const recipient=legal?target:isSupport?actor:enemy;
   const selectedTargets=(Array.isArray(command.selectedTargets)?command.selectedTargets:[])
     .map(key=>location.get(key))
     .filter(item=>item &&(b.owners.A.includes(item.uid)!==b.owners.A.includes(uid)))
     .map(item=>({player:item.role,idx:item.index,
       fieldIdx:converted.field[item.role].indexOf(item.index)}))
     .filter(item=>item.fieldIdx>=0);
   result[role][actor.index]={type:'attack',moveIdx,
     targetPlayer:recipient?.role||role,targetIdx:recipient?.index??actor.index,
     ...(selectedTargets.length?{selectedTargets}:{}),
     hyperize:!!command.hyper&&!!converted.gameState.settings.allowHyper};
  }
 }
 return result;
}

export function resolveEventWithStandardEngine(b,submissions,settings){
 if(!b||b.finished)throw Error('La battaglia del torneo è già terminata.');
 const converted=adaptTournamentToClassic(b,settings);
 const actions=translateTournamentCommands(b,submissions,converted);
 let patch=null;
 calculateTurnImpl({
  CHARACTERS,FUSION_CHARACTERS,ITEMS_DB,MOVES_DB,
  appMode:'online_room',gameState:converted.gameState,
  calculateDamage:(...args)=>calculateDamageImpl({},...args),
  getActivePlayers:()=>Object.keys(converted.byRole),
  getMultiplier,getTournamentMatchOpponents:()=>[],
  playerName:'__event_system__',updateLocalStats:()=>{},
  updateState:result=>{patch=result}
 },actions);
 if(!patch||!patch.teams||!patch.field)throw Error('Il motore classico non ha restituito lo stato del turno.');
 const next=copy(b);
 const rebuilt={A:[],B:[]},activeKeys={...next.activeKeys},hyperUsed={...next.hyperUsed};
 for(const [role,uid] of Object.entries(converted.byRole)){
  const side=b.owners.A.includes(uid)?'A':'B';
  const original=(b.teams[side]||[]).filter(char=>char.owner===uid);
  const full=(patch.teams[role]||[]).map((char,i)=>{
   const fallback=original[i];
   const key=char.key||fallback?.key||uid+'-'+char.id+'-'+i;
   return {...char,key,owner:uid,hyper:!!char.isHyper,
    moves:(char.moves||[]).map(move=>({
     ...move,uses:move.remainingUses??null
    }))};
  });
  rebuilt[side].push(...full);
  const indices=(patch.field[role]||[]).filter(i=>full[i]?.hp>0);
  const selected=indices.map(i=>full[i].key);
  for(const unit of full){
   if(selected.length>=settings.fieldSize)break;
   if(unit.hp>0&&!selected.includes(unit.key))selected.push(unit.key);
  }
  activeKeys[uid]=selected;
  hyperUsed[uid]=!!patch.hyperUsed?.[role];
 }
 next.teams=rebuilt;next.activeKeys=activeKeys;next.hyperUsed=hyperUsed;
 next.weather=patch.battleWeather||null;next.tailwind=patch.battleTailwind||{};
 next.traps=patch.fieldTraps||{};next.trapSeen=patch.fieldTrapSeen||{};
 const emitted=(patch.events||[]).map(cleanLog).filter(Boolean);
 next.log=[...(b.log||[]),...emitted].slice(-60);
 next.turn=(b.turn||1)+1;
 // Mostra in diretta gli stessi eventi visivi prodotti dal motore standard.
 next.playback=JSON.parse(JSON.stringify({
  turn:next.turn,
  startTeams:patch.startOfTurnTeams||converted.teams,
  startField:patch.startOfTurnField||converted.field,
  events:patch.events||[]
 }));
 const aAlive=rebuilt.A.some(unit=>unit.hp>0&&!unit.isSummonOnly);
 const bAlive=rebuilt.B.some(unit=>unit.hp>0&&!unit.isSummonOnly);
 if(!aAlive||!bAlive||next.turn>300){
  next.finished=true;
  next.winner=aAlive&&!bAlive?'A':bAlive&&!aAlive?'B':
   rebuilt.A.reduce((sum,u)=>sum+Math.max(0,u.hp||0),0)>=
   rebuilt.B.reduce((sum,u)=>sum+Math.max(0,u.hp||0),0)?'A':'B';
  next.log.push('🏆 Vittoria della squadra '+next.winner+'!');
 }else next.side=b.side==='both'?'both':b.side==='A'?'B':'A';
 return next;
}

// Preparazione partita: anche le passive che scattano all'ingresso vengono
// eseguite DAL MOTORE STANDARD, non dall'implementazione precedente dell'evento.
export function buildStandardEventBattle(match,people,settings){
 const b=buildEventBattle(match,people,{...settings,standardEngine:true});
 const converted=adaptTournamentToClassic(b,settings);
 const lines=[];
 const standardMode=settings.doubles?'multipla':'classica';
 for(const [role] of Object.entries(converted.byRole)){
  for(const index of [...converted.field[role]]){
   const character=converted.teams[role]?.[index];
   if(!character?.passive||character.hp<=0)continue;
   applyOnEnterPassiveImpl({CHARACTERS},character,role,index,
     converted.teams,converted.field,lines,standardMode,settings,false);
  }
 }
 for(const [role,uid] of Object.entries(converted.byRole)){
  const side=b.owners.A.includes(uid)?'A':'B';
  const team=converted.teams[role].map((char,index)=>({
   ...char,owner:uid,key:char.key||uid+'-'+char.id+'-'+index,
   moves:(char.moves||[]).map(m=>({...m,uses:m.remainingUses??null}))
  }));
  const originalOthers=b.teams[side].filter(u=>u.owner!==uid);
  b.teams[side]=[...originalOthers,...team];
  b.activeKeys[uid]=converted.field[role].map(index=>team[index]?.key).filter(Boolean);
 }
 b.log.push(...lines.map(cleanLog).filter(Boolean));
 return b;
}
