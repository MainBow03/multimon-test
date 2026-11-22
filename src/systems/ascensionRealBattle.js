/**
 * A battle in Ascesa is a real, persistent Multimon CLASSICA room.
 *
 * This is deliberately not a combat engine: commands, AI, turns, entry
 * passives, playback and forced substitutions are all delegated to the
 * exact same systems used by CPU, local, online and campaign battles.
 * Only the journey's parent state decides who enters and what is earned.
 */
import {initialGameState} from './gameState.js';
import {ascensionNativeFighter} from './ascensionNativeBattle.js';
import {activateAscensionStarterCloak} from './ascensionStarterCloak.js';
import {calculateTurnImpl,calculateDamageImpl,generateCPUActionsForPlayerImpl,applyOnEnterPassiveImpl} from './battleSystem.js';
import {getMultiplier} from './typeSystem.js';
import {MOVES_DB} from '../data/moves.js';
import {nextPhaseAfterExecution,resolveSwitchingRoom,prepareEmergencySwitch} from './roomRecovery.js';

const clone=object=>structuredClone(object);
export const REAL_ASCENSION_BATTLE_VERSION=2;
const SIDES=['p1','p2'];
const requiredField=room=>Math.max(1,Math.trunc(room.settings?.fieldSize)||1);
const playable=c=>c&&c.hp>0&&!c.isSummonOnly;
const firstFields=(team,limit)=>team.map((c,i)=>playable(c)?i:-1).filter(i=>i>=0).slice(0,limit);
const defaultAction=(room,side,idx)=>{
 const opponent=side==='p1'?'p2':'p1';
 const target=room.field[opponent]?.find(i=>room.teams[opponent]?.[i]?.hp>0);
 const fighter=room.teams[side]?.[idx];
 const moveIdx=Math.max(0,(fighter?.moves||[]).findIndex(m=>m?.power>0&&(m.remainingUses??1)>0));
 return {type:'attack',moveIdx,targetPlayer:opponent,targetIdx:target??0,targetFieldIdx:0};
};
const battleContext=(room,chars,updateState)=>({
 CHARACTERS:chars,FUSION_CHARACTERS:[],ITEMS_DB:{},MOVES_DB,
 appMode:'local_room',gameState:room,
 getActivePlayers:()=>SIDES,
 getMultiplier,getTournamentMatchOpponents:()=>[],
 calculateDamage:(...args)=>calculateDamageImpl({},...args),
 playerName:room.players.p1,
 updateLocalStats:()=>{},
 updateState
});

/** Recreate full native battle state only at BATTLE START, never each turn. */
export function createRealAscensionBattle({
 chars,teamOne,teamTwo,firstName='Sfidante',secondName='Avversario',
 firstBot=false,secondBot=false,fieldSize=1
}){
 const room=initialGameState();
 const n=Math.max(1,Math.min(2,fieldSize));
 room.status='battling';
 room.gameMode='classica';
 room.isAscensionNativeBattle=true; // GUI bonus Prismaball; classic mechanics unchanged.
 room.ascensionRealVersion=REAL_ASCENSION_BATTLE_VERSION;
 room.settings={...room.settings,fieldSize:n,teamSize:Math.max(teamOne.length,teamTwo.length)};
 room.players={...room.players,p1:firstName,p2:secondName};
 room.isBot={...room.isBot,p1:!!firstBot,p2:!!secondBot};
 const freshFighter=member=>{
  const fighter=ascensionNativeFighter(member,chars);
  // L'unico colpo protetto si ricarica all'INIZIO di una nuova lotta,
  // mai al cambio turno o quando lo starter rientra dalla panchina.
  if(member.ascensionStarterCloak)activateAscensionStarterCloak(fighter);
  return fighter;
 };
 room.teams={...room.teams,p1:teamOne.map(freshFighter),
  p2:teamTwo.map(freshFighter)};
 room.field={...room.field,p1:firstFields(room.teams.p1,n),p2:firstFields(room.teams.p2,n)};
 room.phaseStartedAt=Date.now();
 room.turnExpiresAt=Date.now()+92000;
 room.battleStartedAt=Date.now();
 const entry=[];
 for(const side of SIDES){
  for(const index of [...room.field[side]]){
   const fighter=room.teams[side][index];
   if(fighter?.passive?.type==='on_enter'&&!(fighter.passiveUses||0)){
    fighter.passiveUses=1;
    applyOnEnterPassiveImpl({CHARACTERS:chars},fighter,side,index,
     room.teams,room.field,entry,'classica',room.settings,false);
   }
  }
 }
 // The same on-enter passive effects apply; the initial state is already
 // authoritative and will remain so until the last turn. Intro text is
 // recorded once without a second home-made playback controller.
 room.initialEntryLog=entry.map(evt=>evt.text).filter(Boolean);
 const terminal=prepareEmergencySwitch(room,SIDES);
 if(terminal?.status==='gameover'){
  room.status='gameover';room.winner=terminal.winner;
 }
 return room;
}
export const realAscensionSideReady=(room,side)=>(
 (room.field?.[side]||[]).every(idx=>
  !(room.teams?.[side]?.[idx]?.hp>0)||Boolean(room.actions?.[side]?.[idx]))
);
function addCpuCommands(room,chars){
 const all=clone(room.actions||{});
 for(const side of SIDES){
  if(!room.isBot?.[side]||realAscensionSideReady({...room,actions:all},side))continue;
  let proposed={};
  try{
   proposed=generateCPUActionsForPlayerImpl({
    gameState:room,getActivePlayers:()=>SIDES,
    getMultiplier,getTournamentMatchOpponents:()=>[],
    roguelikeState:null,appMode:'local_room'
   },side,all)||{};
  }catch(error){
   // Choosing an attack is a fallback for AI failures, NOT a damage engine.
   proposed={};
  }
  const actions={...(all[side]||{})};
  for(const idx of room.field[side]||[]){
   if(room.teams[side]?.[idx]?.hp<=0)continue;
   actions[idx]=actions[idx]||proposed[idx]||defaultAction(room,side,idx);
  }
  all[side]=actions;
 }
 return all;
}
function calculateNativeRoom(room,chars){
 const updateState=patch=>{computed=patch;return Promise.resolve();};
 let computed=null;
 const ctx=battleContext(room,chars,updateState);
 calculateTurnImpl(ctx,room.actions);
 if(!computed)throw Error('Il motore classico non ha completato il turno.');
 return {...room,...computed};
}
/** Full original action objects: targets, swaps, Hyper, statuses and move slots. */
export function submitRealAscensionActions(room,side,actions,chars){
 if(room.status!=='battling')throw Error('La battaglia non accetta comandi ora.');
 if(!SIDES.includes(side)||room.isBot?.[side])throw Error('Non puoi comandare questa squadra.');
 const current=room.actions?.[side]||{};
 const validIndices=new Set(room.field[side]||[]);
 const received=actions&&typeof actions==='object'?actions:{};
 const updated={...current};
 for(const [key,details] of Object.entries(received)){
  const idx=Number(key);
  if(!Number.isInteger(idx)||!validIndices.has(idx)||!details||typeof details!=='object')
   throw Error('Comando non valido per il Multimon attivo.');
  if(current[idx]&&JSON.stringify(current[idx])!==JSON.stringify(details))
   throw Error('Comando già confermato.');
  const c=room.teams?.[side]?.[idx];
  if(!c||c.hp<=0)throw Error('Questo Multimon è esausto.');
  if(details.type==='attack'){
   if(!Number.isInteger(details.moveIdx)||!c.moves?.[details.moveIdx])
    throw Error('Mossa non presente nel moveset.');
   if(c.moves[details.moveIdx].remainingUses===0)
    throw Error('Mossa esaurita.');
  }else if(details.type==='switch'){
   if(!Number.isInteger(details.toIdx)||!room.teams[side]?.[details.toIdx]||
      room.teams[side][details.toIdx].hp<=0||room.field[side].includes(details.toIdx))
    throw Error('Cambio impossibile.');
  }else if(details.type!=='combo_assist'){
   throw Error('Azione non consentita in Ascesa del Colosseo.');
  }
  updated[idx]=clone(details);
 }
 const next={...room,actions:{...room.actions,[side]:updated}};
 if(!realAscensionSideReady(next,side))return next;
 next.actions=addCpuCommands(next,chars);
 if(!SIDES.every(p=>realAscensionSideReady(next,p)))return next;
 return calculateNativeRoom(next,chars);
}
export function resolveRealAscensionCpu(room,chars){
 if(room.status!=='battling')return room;
 const next={...room,actions:addCpuCommands(room,chars)};
 if(!SIDES.every(p=>realAscensionSideReady(next,p)))return next;
 return calculateNativeRoom(next,chars);
}
/** Replay is finished ONLY when the original battle animation has ended. */
export function advanceRealAscensionBattle(room,phaseStartedAt){
 if(room.status!=='executing'||room.phaseStartedAt!==phaseStartedAt)return room;
 const patch=nextPhaseAfterExecution(room,SIDES,Date.now());
 return patch?{...room,...patch}:room;
}
export function chooseRealAscensionReplacement(room,side,idx,chars,spiritId=null){
 if(room.status!=='switching_phase')throw Error('Nessuna sostituzione necessaria.');
 if(!SIDES.includes(side)||room.isBot[side])throw Error('Non puoi scegliere qui.');
 if(!Number.isInteger(idx))throw Error('Multimon non valido.');
 const selected=room.switchActions[side]||[];
 if(selected.includes(idx)||room.field[side].includes(idx)||!playable(room.teams[side][idx]))
  throw Error('Questo Multimon non può entrare.');
 const updated={...room,switchActions:{...room.switchActions,[side]:[...selected,idx]}};
 if(spiritId&&room.teams[side][idx]?.id==='lucy')
  updated.switchZodiacChoices={...room.switchZodiacChoices,
   [side]:{...(room.switchZodiacChoices?.[side]||{}),[idx]:spiritId}};
 const patch=resolveSwitchingRoom(updated,SIDES,Date.now(),false,
  (char,p,i,teams,field,events,battle)=>
    applyOnEnterPassiveImpl({CHARACTERS:chars},char,p,i,teams,field,events,
      'classica',battle.settings,false));
 return patch?.patch?{...updated,...patch.patch}:updated;
}
export function forceRealAscensionReplacement(room,chars){
 const patch=resolveSwitchingRoom(room,SIDES,Date.now(),true,
  (char,p,i,teams,field,events,battle)=>
    applyOnEnterPassiveImpl({CHARACTERS:chars},char,p,i,teams,field,events,
      'classica',battle.settings,false));
 return patch?.patch?{...room,...patch.patch}:room;
}
export function resolveRealAscensionCaptureCounter(room,chars){
 if(room.status!=='ascension_capture')return room;
 const next={...room,status:'battling',actions:{...room.actions,p1:{},p2:{}}};
 const actions=addCpuCommands(next,chars);
 // Missing p1 command means this was a Prismaball action: the wild foe
 // receives its genuine battle-engine response; no fake damage roll.
 return calculateNativeRoom({...next,actions},chars);
}
