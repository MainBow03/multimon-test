import { applyBattleStatModifier } from './statBalance.js';
import { isNegativeStatus, isPhysicalMove, statusName } from './newHeldAndPassiveEffects.js';

// All consumed flags live on a combatant's battle copy, never on the permanent
// shop/inventory entry. Effects therefore reset naturally for the next fight.
const has=(fighter,id)=>fighter?.heldItem===id;
const positiveHp=f=>!!f&&f.hp>0;
const already=(fighter,flag)=>Boolean(fighter?.[flag]);
const limited=(fighter,id,flag)=>has(fighter,id)&&!already(fighter,flag);
const appliedBuff=(fighter,stat,multiplier)=> {
  const before=fighter[stat];
  applyBattleStatModifier(fighter,stat,multiplier);
  return fighter[stat]-before;
};
export function reduceIncomingHeldDamage(target,damage,{directAttack=false,superEffective=false}={}){
  if(!positiveHp(target)||!(damage>0)||!directAttack)return {damage,activations:[]};
  const activations=[];
  if(limited(target,'scudo_antielemento','antiElementUsed')&&superEffective){
    target.antiElementUsed=true;
    damage=Math.max(1,Math.floor(damage*.75));
    activations.push('Scudo Antielemento');
  }
  if(target.bellShieldReady){
    target.bellShieldReady=false;
    damage=Math.max(1,Math.floor(damage*.85));
    activations.push('Campanella del Soccorso');
  }
  return {damage,activations};
}
export function useHeroSash(target,damage,{directAttack=false}={}){
  if(!positiveHp(target)||!directAttack||!limited(target,'fascia_eroe','heroSashUsed')||
      target.hp!==target.maxHp||damage<target.hp)return false;
  target.heroSashUsed=true;
  target.hp=1;
  return true;
}
export function poisonDamageReduction(character,damage){
  return has(character,'ciondolo_antiveleno')?Math.max(1,Math.floor(damage*.6)):damage;
}
export function activateHourglass(fighter){
  if(!positiveHp(fighter)||!limited(fighter,'clessidra_rapidita','hourglassUsed')||
      fighter.hp>=fighter.maxHp*.3)return false;
  fighter.hourglassUsed=true;
  appliedBuff(fighter,'spd',1.2);
  // Permanent through this battle, including after switch-outs and later turns.
  return true;
}
export function boostedStatusChance(attacker,chance){
  if(!Number.isFinite(chance)||chance>=1||chance<=0)return chance;
  if(!limited(attacker,'lente_fortuna','fortuneLensUsed'))return chance;
  attacker.fortuneLensUsed=true;
  return Math.min(.9,Math.round((chance+.1)*1000)/1000);
}
export function offensiveHeldFactor(attacker,defender,move){
  if(!positiveHp(attacker)||!(move?.power>0))return 1;
  let multiplier=1;
  if(has(attacker,'risonatore_elementale')&&attacker.lastOffensiveType&&
      attacker.lastOffensiveType!==move.type)multiplier*=1.12;
  if(limited(attacker,'bussola_predatore','predatorCompassUsed')&&
      positiveHp(defender)&&defender.hp<defender.maxHp*.4)multiplier*=1.15;
  return multiplier;
}
export function recordOffensiveMove(attacker,move){
  if(has(attacker,'risonatore_elementale')&&move?.power>0)
    attacker.lastOffensiveType=move.type;
}
export function markCompassOnHit(attacker,target,hpBefore,damage){
  if(!limited(attacker,'bussola_predatore','predatorCompassUsed')||!(damage>0)||
      !(hpBefore>0)||!(hpBefore<target.maxHp*.4))return false;
  attacker.predatorCompassUsed=true;return true;
}
export function healSupportAlly(attacker,ally,wasBuffed){
  if(!wasBuffed||!positiveHp(ally)||attacker===ally||
      !limited(attacker,'nastro_solidarieta','solidarityRibbonUsed'))return 0;
  attacker.solidarityRibbonUsed=true;
  const gain=Math.max(1,Math.floor(ally.maxHp*.08));
  const healed=Math.min(gain,ally.maxHp-ally.hp);
  ally.hp+=healed;
  return healed;
}
export function activateVictoryBoots(attacker){
  if(!positiveHp(attacker)||!limited(attacker,'stivali_slancio','victoryBootsUsed'))return false;
  attacker.victoryBootsUsed=true;
  attacker.victoryBootsExtra=appliedBuff(attacker,'spd',1.15);
  attacker.victoryBootsRemaining=2; // end of KO turn => 1; next turn => 0
  return true;
}
export function endVictoryBootsTurn(fighter){
  if(!fighter?.victoryBootsRemaining||fighter.hp<=0)return false;
  fighter.victoryBootsRemaining--;
  if(fighter.victoryBootsRemaining)return false;
  const delta=fighter.victoryBootsExtra||0;
  if(delta>0)fighter.spd=Math.max(1,fighter.spd-delta);
  fighter.victoryBootsExtra=0;
  return true;
}
export function shortenNegativeStatus(holder,status){
  if(!status||!isNegativeStatus(status)||!limited(holder,'sigillo_liberta','freedomSealUsed')||
      !Number.isFinite(status.turns)||status.turns<=1)return false;
  holder.freedomSealUsed=true;
  status.turns=Math.max(1,status.turns-1);
  return true;
}
export function reflectNegativeStatus(holder,attacker,status,random=Math.random,asString=false){
  const type=statusName(status);
  if(!positiveHp(holder)||!positiveHp(attacker)||holder===attacker||
    !limited(holder,'specchio_maledizioni','curseMirrorUsed')||!isNegativeStatus(status)||
    attacker.passive?.immuneToNegativeStatuses||!Array.isArray(attacker.statuses)||
    attacker.statuses.some(s=>statusName(s)===type)||random()>=.4)return false;
  holder.curseMirrorUsed=true;
  attacker.statuses.push(asString?type:{type,turns:Math.max(1,status.turns||1)});
  return true;
}
export function activatePhoenixFeather(fighter){
  if(!positiveHp(fighter)||!limited(fighter,'piuma_rinascita','phoenixFeatherUsed'))return false;
  fighter.phoenixFeatherUsed=true;
  fighter.phoenixFeatherExtra=appliedBuff(fighter,'def',1.15);
  fighter.phoenixFeatherRemaining=2;
  return true;
}
export function endPhoenixFeatherTurn(fighter){
  if(!fighter?.phoenixFeatherRemaining||fighter.hp<=0)return false;
  fighter.phoenixFeatherRemaining--;
  if(fighter.phoenixFeatherRemaining)return false;
  const delta=fighter.phoenixFeatherExtra||0;
  if(delta>0)fighter.def=Math.max(1,fighter.def-delta);
  fighter.phoenixFeatherExtra=0;
  return true;
}
export function activateRescueBell(protectors,ally){
  if(!positiveHp(ally)||ally.hp>=ally.maxHp*.25||ally.bellShieldReady)return null;
  const holder=(protectors||[]).find(char=>char!==ally&&positiveHp(char)&&
    limited(char,'campanella_soccorso','rescueBellUsed'));
  if(!holder)return null;
  holder.rescueBellUsed=true;
  ally.bellShieldReady=true;
  return holder;
}
