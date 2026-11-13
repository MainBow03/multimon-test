// Regole esclusive della Juggernaut PvP. Non applicare a Sopravvivenza o ai raid.
export const JUGGERNAUT_SCALING = Object.freeze({
  2: { hp: 3, atk: 1.6, def: 1.6 },
  3: { hp: 4.2, atk: 1.85, def: 1.85 },
  4: { hp: 5.4, atk: 2.1, def: 2.1 }
});
export const JUGGERNAUT_PHASE_NAMES = Object.freeze([
  'Dominio', 'Guardia Tirannica', 'Risveglio', 'Ultima Resistenza'
]);
export const JUGGERNAUT_SHIELD_HITS = 4;

const move = (name, juggSpecial, desc, extra = {}) => ({
  name, juggSpecial, type: 'Oscuro', power: 0, target: 'self',
  accuracy: 1, currentCooldown: 0, ...extra, desc
});

export function setupJuggernaut(boss, opponents) {
  if (!boss || boss.isJuggernaut) return boss;
  const scale = JUGGERNAUT_SCALING[Math.max(2, Math.min(4, Number(opponents) || 2))];
  boss.maxHp = Math.max(1, Math.floor(boss.maxHp * scale.hp));
  boss.hp = boss.maxHp;
  boss.atk = Math.floor(boss.atk * scale.atk);
  boss.def = Math.floor(boss.def * scale.def);
  if (Number.isFinite(boss.spAtk)) boss.spAtk = Math.floor(boss.spAtk * scale.atk);
  if (Number.isFinite(boss.spDef)) boss.spDef = Math.floor(boss.spDef * scale.def);
  boss.baseAtk = boss.atk;
  boss.baseDef = boss.def;
  boss.baseSpAtk = boss.spAtk ?? boss.atk;
  boss.baseSpDef = boss.spDef ?? boss.def;
  boss.isJuggernaut = true;
  boss.juggPhase = 1;
  boss.juggShieldHpThresholds = [0.75, 0.50, 0.25];
  boss.juggPendingShields = [];
  boss.juggHitsRemaining = 0;
  boss.shieldGrantedHits = JUGGERNAUT_SHIELD_HITS;
  boss.juggTurnCount = 0;
  boss.juggMidpointUsed = false;
  boss.juggCounterReady = false;
  boss.juggRoarThisTurn = false;
  boss.juggNextAttackBoost = false;
  boss.imageFilter = 'drop-shadow(0 0 30px rgba(220,38,38,1)) contrast(1.3) saturate(1.2)';
  boss.moves ??= [];
  const extra = [
    {name:'Furia del Boss',type:'Oscuro',power:40,targetCount:8,cooldown:3,currentCooldown:0,
      desc:'Colpisce tutti gli sfidanti. Ricarica: 3 turni.',juggSpecial:'fury'},
    move('Ruggito Tirannico','roar','Gli sfidanti infliggono il 15% di danni in meno in questo turno. Ricarica: 4 turni.',{cooldown:4,priority:7}),
    move('Contrattacco Supremo','counter','Riduce del 30% il prossimo danno diretto subito nel turno e contrattacca con potenza 60. Ricarica: 4 turni.',{cooldown:4,priority:7,juggRequiredPhase:2}),
    move('Ripristino del Tiranno','purge','Dal 50% dei PS: rimuove una sola volta tutti i malus alle statistiche.',{priority:7,juggRequiredPhase:3,juggOnceMidpoint:true}),
    move('Impulso Brutale','empower','Dal 50% dei PS: in alternativa a Ripristino, il prossimo attacco infligge +15% danni.',{priority:7,juggRequiredPhase:3,juggOnceMidpoint:true})
  ];
  for (const skill of extra) if (!boss.moves.some(m => m.juggSpecial === skill.juggSpecial)) boss.moves.push(skill);
  return boss;
}

export function applyJuggernautSummonBonus(summon, opponents) {
  const count = Math.max(1, Math.min(4, Number(opponents) || 1));
  const hpFactor = Math.min(1.8, 1 + 0.2 * count);
  const statFactor = Math.min(1.24, 1 + 0.06 * count);
  summon.maxHp = Math.max(1, Math.floor(summon.maxHp * hpFactor));
  summon.hp = summon.maxHp;
  for (const stat of ['atk', 'def', 'spAtk', 'spDef']) {
    if (Number.isFinite(summon[stat])) summon[stat] = Math.floor(summon[stat] * statFactor);
  }
  summon.baseAtk = summon.atk;
  summon.baseDef = summon.def;
  if (Number.isFinite(summon.spAtk)) summon.baseSpAtk = summon.spAtk;
  if (Number.isFinite(summon.spDef)) summon.baseSpDef = summon.spDef;
  summon.imageFilter = 'drop-shadow(0 0 15px rgba(220,38,38,0.8))';
  return summon;
}

// Mantiene TUTTE le soglie attraversate, anche se il colpo salta dal 90% al 20%.
export function updateJuggernautThresholds(boss, hpAfter) {
  if (!boss?.isJuggernaut || !Number.isFinite(boss.maxHp) || hpAfter <= 0) return [];
  boss.juggShieldHpThresholds ??= [];
  boss.juggPendingShields ??= [];
  const newStages = [];
  while (boss.juggShieldHpThresholds.length &&
    hpAfter / boss.maxHp <= boss.juggShieldHpThresholds[0]) {
    const threshold = boss.juggShieldHpThresholds.shift();
    boss.juggPendingShields.push(Math.round(threshold * 100));
    const stage = threshold === .75 ? 2 : threshold === .5 ? 3 : 4;
    if ((boss.juggPhase || 1) < stage) {
      boss.juggPhase = stage;
      newStages.push(stage);
      if (stage === 4) {
        boss.atk = Math.floor(boss.atk * 1.15);
        if (Number.isFinite(boss.spAtk)) boss.spAtk = Math.floor(boss.spAtk * 1.15);
        boss.def = Math.max(1, Math.floor(boss.def * 0.90));
        if (Number.isFinite(boss.spDef)) boss.spDef = Math.max(1, Math.floor(boss.spDef * 0.90));
      }
    }
  }
  return newStages;
}

export function activateNextJuggernautShield(boss) {
  if (!boss?.isJuggernaut || boss.hp <= 0 || (boss.juggHitsRemaining || 0) > 0 ||
    !boss.juggPendingShields?.length) return null;
  const threshold = boss.juggPendingShields.shift();
  boss.juggHitsRemaining = boss.shieldGrantedHits || JUGGERNAUT_SHIELD_HITS;
  return { threshold, hits: boss.juggHitsRemaining };
}
export function canUseJuggernautSkill(boss, selectedMove) {
  if (!selectedMove?.juggSpecial) return true;
  return !!boss?.isJuggernaut &&
    (boss.juggPhase || 1) >= (selectedMove.juggRequiredPhase || 1) &&
    (!selectedMove.juggOnceMidpoint || !boss.juggMidpointUsed) &&
    !(selectedMove.currentCooldown > 0);
}

export function createJuggernautSynergy() {
  return {charge:0, coordinatedTurns:0, activations:0, cooldownUntilTurn:0, shieldPierce:0};
}
export function canActivateJuggernautSynergy(synergy, turn) {
  return Number(synergy?.charge || 0) >= 2 && turn >= Number(synergy?.cooldownUntilTurn || 0);
}
export function chargeJuggernautSynergy(synergy, distinctHitters) {
  if (new Set(distinctHitters).size < 2) return false;
  synergy.coordinatedTurns = (synergy.coordinatedTurns || 0) + 1;
  synergy.charge = Math.min(2, (synergy.charge || 0) + 1);
  return true;
}
export function spendJuggernautSynergy(synergy, effect, turn) {
  if (!['damage','shield'].includes(effect) || !canActivateJuggernautSynergy(synergy, turn)) return false;
  synergy.charge = 0;
  synergy.activations = (synergy.activations || 0) + 1;
  synergy.cooldownUntilTurn = turn + 3;
  if (effect === 'shield') synergy.shieldPierce = 1;
  return true;
}
