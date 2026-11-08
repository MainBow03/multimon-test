// Passive dei cinque Multimon selezionate dall'utente.
// Logica centralizzata e testabile; lo stato delle cariche vive sulle copie di battaglia.

export function selectedPassiveDamageFactor(attacker, defender, move) {
  if (!attacker || !move || !(Number(move.power) > 0)) return 1;
  let factor = 1;
  if (attacker.passive?.type === 'flames_unextinguished' &&
      move.type === 'Fuoco' && attacker.hp > 0 &&
      attacker.hp / attacker.maxHp < 0.5) {
    factor *= attacker.passive.damageBonus ?? 1.2;
  }
  if (attacker.passive?.type === 'born_adventurer' && defender &&
      Number(defender.baseAtk ?? defender.atk) > Number(attacker.baseAtk ?? attacker.atk)) {
    factor *= attacker.passive.damageBonus ?? 1.15;
  }
  if (attacker.passive?.type === 'unbreakable_future' && attacker.futureStrikeCharged) {
    factor *= attacker.passive.damageBonus ?? 1.25;
  }
  return factor;
}

export function triggerMiraculousAllyHeal(attacker, ally, move) {
  const passive = attacker?.passive;
  if (passive?.type !== 'miraculous_team_support' ||
      attacker.hp <= 0 || !ally || ally === attacker || ally.hp <= 0 ||
      !(ally.hp < ally.maxHp) ||
      Number(move?.power || 0) > 0 ||
      !['ally','team','team_smart_heal'].includes(move?.targetMode) ||
      (attacker.passiveUses || 0) >= (passive.maxUses ?? 3)) return 0;
  const healed = Math.min(ally.maxHp - ally.hp,
    Math.max(1, Math.floor(ally.maxHp * (passive.healPercent ?? 0.1))));
  if (healed <= 0) return 0;
  ally.hp += healed;
  attacker.passiveUses = (attacker.passiveUses || 0) + 1;
  return healed;
}

export function triggerJackpot(attacker, applyStatModifier) {
  const passive = attacker?.passive;
  if (passive?.type !== 'jackpot_critical' || attacker.hp <= 0 ||
      (attacker.passiveUses || 0) >= (passive.maxUses ?? 2)) return null;
  attacker.passiveUses = (attacker.passiveUses || 0) + 1;
  const beforeHp = attacker.hp;
  attacker.hp = Math.min(attacker.maxHp,
    attacker.hp + Math.max(1, Math.floor(attacker.maxHp * (passive.healPercent ?? .15))));
  applyStatModifier(attacker, 'spd', passive.speedBuff ?? 1.1);
  return { healed: attacker.hp - beforeHp, uses: attacker.passiveUses };
}

export function triggerFutureBlock(defender, incomingMove) {
  const passive = defender?.passive;
  if (passive?.type !== 'unbreakable_future' || defender.hp <= 0 ||
      !defender.statuses?.some(s => s.type === 'Protetto' && s.sourceMove === 'Visione del Futuro') ||
      !(Number(incomingMove?.power) > 0) || defender.futureStrikeCharged ||
      (defender.futureBlockUses || 0) >= (passive.maxUses ?? 2)) return false;
  defender.futureBlockUses = (defender.futureBlockUses || 0) + 1;
  defender.futureStrikeCharged = true;
  return true;
}

export function consumeFutureStrike(attacker) {
  if (attacker?.passive?.type !== 'unbreakable_future' || !attacker.futureStrikeCharged) return false;
  attacker.futureStrikeCharged = false;
  return true;
}
