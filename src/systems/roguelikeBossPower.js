// Boss dei piani 10/20/30/40/50, sia Roguelike singola che Co-op.
// Nessun effetto su Juggernaut normali, raid campagna o nemici dei piani comuni.
export const ROGUELIKE_BOSS_STATS_MULTIPLIER = 1.05;
export const ROGUELIKE_BOSS_SHIELD_HITS = 3;
export const ROGUELIKE_BOSS_SHIELD_THRESHOLDS = Object.freeze([0.50, 0.25]);

/** Potenzia il boss già scalato per il piano, una sola volta. */
export function empowerRoguelikeBoss(enemy) {
  if (!enemy || enemy.rogueBossEnhanced) return enemy;
  const oldMaxHp = Number(enemy.maxHp);
  const oldHp = Number(enemy.hp);
  for (const stat of ['maxHp', 'atk', 'def', 'spd', 'spAtk', 'spDef']) {
    if (Number.isFinite(enemy[stat])) {
      enemy[stat] = Math.max(1, Math.round(enemy[stat] * ROGUELIKE_BOSS_STATS_MULTIPLIER));
    }
  }
  if (Number.isFinite(oldMaxHp) && oldMaxHp > 0 && Number.isFinite(oldHp)) {
    enemy.hp = Math.min(enemy.maxHp, Math.max(0, Math.round(oldHp / oldMaxHp * enemy.maxHp)));
  }
  for (const stat of ['Atk', 'Def', 'Spd', 'SpAtk', 'SpDef']) {
    const key = stat[0].toLowerCase() + stat.slice(1);
    if (Number.isFinite(enemy[key])) enemy['base' + stat] = enemy[key];
  }
  enemy.isRoguelikeBoss = true;
  enemy.rogueBossEnhanced = true;
  enemy.juggShieldHpThresholds = [...ROGUELIKE_BOSS_SHIELD_THRESHOLDS];
  enemy.shieldGrantedHits = ROGUELIKE_BOSS_SHIELD_HITS;
  enemy.juggHitsRemaining = 0;
  return enemy;
}

/**
 * Attiva UNA soglia alla volta. Se il boss passa dal 100% al 20% con
 * un attacco, il secondo scudo non viene perso: resterà disponibile
 * dopo che il primo sarà stato rotto e il boss riceverà altro danno.
 * Non attiva uno scudo su un boss già KO e non ricarica scudi attivi.
 */
export function activateRoguelikeBossShield(enemy, hpAfterHit) {
  if (!enemy?.isRoguelikeBoss || !Number.isFinite(enemy.maxHp) || enemy.maxHp <= 0 ||
      !Number.isFinite(enemy.hp) || enemy.hp <= 0 ||
      !Number.isFinite(hpAfterHit) || hpAfterHit <= 0 ||
      (enemy.juggHitsRemaining || 0) > 0 ||
      !Array.isArray(enemy.juggShieldHpThresholds) ||
      enemy.juggShieldHpThresholds.length === 0) return null;
  const threshold = enemy.juggShieldHpThresholds[0];
  if (hpAfterHit / enemy.maxHp > threshold) return null;
  enemy.juggShieldHpThresholds.shift();
  enemy.juggHitsRemaining = ROGUELIKE_BOSS_SHIELD_HITS;
  return { hits: ROGUELIKE_BOSS_SHIELD_HITS, thresholdPercent: Math.round(threshold * 100) };
}
