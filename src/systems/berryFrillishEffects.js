import {blockedEnemyPassive} from './newHeldAndPassiveEffects.js';

export const CURSED_BODY_CHANCE=0.25;
export const CURSED_BODY_TURNS=3;
export const CURSED_BODY_STATUS='Mossa Disabilitata';
export const BERRY_CHILL_CHANCE=0.25;

export const isMoveDisabled=(character,move)=>
  !!move?.name && (character?.statuses||[]).some(s=>
    s?.type===CURSED_BODY_STATUS && s.moveName===move.name && s.turns>0);

export const disabledMoveInfo=(character,move)=>
  (character?.statuses||[]).find(s=>
    s?.type===CURSED_BODY_STATUS && s.moveName===move?.name && s.turns>0)||null;

// Corpo Funesto non toglie fisicamente la mossa dalla squadra,
// a differenza del Guanto Ruba-Mosse di Doraemon: le conserva nel loro
// ordine e blocca temporaneamente solo la mossa appena usata.
export function tryCursedBody(defender,attacker,move,random=Math.random){
  if(defender?.passive?.type!=='cursed_body'||!attacker||attacker===defender||
     attacker.hp<=0||!move?.name||move.power<=0||
     attacker.passive?.immuneToNegativeStatuses||blockedEnemyPassive(attacker)||
     !(attacker.moves||[]).some(m=>m?.name===move.name)||
     (attacker.statuses||[]).some(s=>s?.type===CURSED_BODY_STATUS&&s.turns>0)||
     random()>=CURSED_BODY_CHANCE)return false;
  // Per evitare un softlock lascia sempre almeno una mossa utilizzabile.
  if((attacker.moves||[]).filter(m=>m&&!isMoveDisabled(attacker,m)&&m.remainingUses!==0).length<=1)
    return false;
  attacker.statuses ||= [];
  attacker.statuses.push({type:CURSED_BODY_STATUS,moveName:move.name,
    turns:CURSED_BODY_TURNS,justApplied:true});
  return true;
}
export function tickCursedBody(character){
  if(!Array.isArray(character?.statuses))return [];
  const expired=[];
  for(const s of character.statuses){
    if(s.type!==CURSED_BODY_STATUS)continue;
    if(s.justApplied){delete s.justApplied;continue;}
    s.turns=(Number(s.turns)||0)-1;
    if(s.turns<=0)expired.push(s.moveName);
  }
  character.statuses=character.statuses.filter(s=>
    s?.type!==CURSED_BODY_STATUS || s.turns>0);
  return expired;
}

export function tryBerryChill(attacker,target,move,random=Math.random){
  if(attacker?.passive?.type!=='berry_sweet_chill'||!target||target.hp<=0||
     !move||move.power<=0||target.passive?.immuneToNegativeStatuses||
     blockedEnemyPassive(target)||random()>=BERRY_CHILL_CHANCE)return false;
  return true;
}

export function frillishSpoutPower(target,move){
  if(!move?.spoutLowHpPower || !Number.isFinite(target?.hp)||
     !Number.isFinite(target?.maxHp)||target.maxHp<=0)return move?.power;
  return target.hp/target.maxHp < (move.spoutLowHpThreshold??0.5)
    ? move.spoutLowHpPower:move.power;
}
