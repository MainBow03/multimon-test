import { applyBattleStatModifier } from './statBalance.js';

// Nuove passive: usano solo il colpo in esecuzione e lo stato visibile.
const between=(n,low,high)=>Math.max(low,Math.min(high,n));

export function newcomerDamageFactor(attacker,defender,move) {
  if(!move || !(move.power>0))return 1;
  let factor=1;
  // Sam impara il tipo dell'ultimo colpo che le ha tolto PS.
  if(defender?.passive?.type==='spy_analysis' &&
     defender.samLastObservedType===move.type)
    factor*=.75;
  // I colpi più forti attraversano la resistenza, la magia no.
  if(defender?.passive?.type==='kryptonian_body')
    factor*=move.type==='Magico'?1.25:move.power<=100?.8:1;
  if(attacker?.passive?.type==='bookworm')
    factor*=1+.2*between(Number(attacker.blueberryNotes)||0,0,2);
  return factor;
}

export function recordSpyExposure(defender,move,damageDealt) {
  if(defender?.passive?.type!=='spy_analysis'||!(move?.power>0)||
     !(damageDealt>0)||!move.type)return false;
  defender.samLastObservedType=move.type;
  return true;
}

export function cloverExtraEvasion(character) {
  return character?.passive?.type==='fashion_instinct' && character.hp>0
    ? .12 : 0;
}
export function triggerCloverDodge(character) {
  if(character?.passive?.type!=='fashion_instinct' ||
     character.hp<=0||character.cloverDodgeUsedThisTurn)return false;
  character.cloverDodgeUsedThisTurn=true;
  applyBattleStatModifier(character,'atk',1.12);
  return true;
}

// Primo colpo realmente inflitto da Star nel turno: una sola chance.
export function triggerStarWand(attacker,defender,random=Math.random) {
  if(attacker?.passive?.type!=='wand_flux'||attacker.hp<=0 ||
     attacker.starWandCheckedThisTurn)return null;
  attacker.starWandCheckedThisTurn=true;
  if(random()>=.35)return null;
  const roll=random();
  if(roll<1/3){
    const heal=Math.min(attacker.maxHp-attacker.hp,Math.max(1,Math.floor(attacker.maxHp*.08)));
    if(heal>0){
      attacker.hp+=heal;
      return {text:'🦋 '+attacker.name+': la Bacchetta Capricciosa fa recuperare '+heal+' PS!',heal};
    }
    applyBattleStatModifier(attacker,'spd',1.1);
    return {text:'🦋 '+attacker.name+': la Bacchetta Capricciosa aumenta la Velocità del 10%!',heal:0};
  }
  if(roll<2/3){
    applyBattleStatModifier(attacker,'spd',1.1);
    return {text:'🦋 '+attacker.name+': magia fulminea! Velocità +10%!',heal:0};
  }
  if(defender?.hp>0){
    applyBattleStatModifier(defender,'spd',.88);
    return {text:'🦋 '+attacker.name+': magia dispettosa! '+defender.name+' perde il 12% di Velocità!',heal:0};
  }
  applyBattleStatModifier(attacker,'spd',1.1);
  return {text:'🦋 '+attacker.name+': magia fulminea! Velocità +10%!',heal:0};
}

// Supporto carica note, attacco le consuma solo dopo essere stato eseguito.
export function resolveBlueberryAction(attacker,move,attackSucceeded){
  if(attacker?.passive?.type!=='bookworm'||attacker.hp<=0||
     !attackSucceeded||!move)return null;
  const old=between(Number(attacker.blueberryNotes)||0,0,2);
  if((move.power||0)<=0){
    const next=Math.min(2,old+1);
    attacker.blueberryNotes=next;
    return next>old
      ?'📖 '+attacker.name+' prende un appunto strategico! ('+next+'/2)'
      :null;
  }
  if(old>0){
    attacker.blueberryNotes=0;
    return '🫐 '+attacker.name+' usa '+old+' '+(old===1?'appunto':'appunti')+
      ': potenza +'+(old*20)+'%!';
  }
  return null;
}

// Riattiva le passive per turno, anche con personaggio in panchina.
export function resetNewcomerTurnFlags(character){
  if(!character)return;
  character.starWandCheckedThisTurn=false;
  character.cloverDodgeUsedThisTurn=false;
}
