import { applyBattleStatModifier } from './statBalance.js';

// Perfezione Assoluta: ogni statistica può crescere solo due volte a battaglia.
// Il contatore vive sul personaggio in combattimento e si azzera alla partita nuova.
export function applyPerfezioneBonus(character, stat) {
  if (character?.passive?.type !== 'perfezione_assoluta' ||
      !['atk', 'def', 'spd'].includes(stat) || character.hp <= 0) return false;
  const maxUses = character.passive.maxStatTriggers ?? 2;
  const count = character.perfezioneBoostCounts?.[stat] || 0;
  if (count >= maxUses) return false;
  const boost = character.passive.statBonus ?? 1.15;
  character.perfezioneBoostCounts = {
    ...character.perfezioneBoostCounts, [stat]: count + 1
  };
  applyBattleStatModifier(character, stat, boost);
  return true;
}

// Scudo di Diamante Bianco: protegge dall'impatto e dai malus del PRIMO attacco,
// senza trasformarsi in invulnerabilità totale. Gli effetti dello stesso attacco
// vengono ridotti tutti, comprese le singole componenti di un multicolpo.
export function firstHitProtectionFactor(character, protectedAttack) {
  if (!protectedAttack) return 1;
  return Math.max(0, 1 - (character?.passive?.damageReduction ?? 0.7));
}
