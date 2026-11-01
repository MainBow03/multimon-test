// Strumenti da tenere: non sono consumabili.
export const HELD_ITEM_IDS = ['iperband'];
export const getHeldItemCount = (inventory, id) => Math.max(0, Number(inventory?.[id]) || 0);
export const getEquippedCount = (team, id, excludeIndex = -1) =>
  (team || []).filter((hero, i) => i !== excludeIndex && hero.heldItem === id).length;
export const canEquipHeldItem = (team, index, itemId, inventory) =>
  itemId === '' || (HELD_ITEM_IDS.includes(itemId) &&
    getEquippedCount(team, itemId, index) < getHeldItemCount(inventory, itemId));
export const getHeldPowerFactor = (character, move) =>
  character?.heldItem === 'iperband' && move?.power > 0 ? 1.3 : 1;
export const getHeldRecoil = (character, move) =>
  character?.heldItem === 'iperband' && move?.power > 0
    ? Math.max(1, Math.floor((character.maxHp || 0) * 0.1)) : 0;
export const getMahitoMultiplier = (attacker, defender, move) => {
  if (attacker?.id !== 'mahito' || !move?.power ||
      !defender?.statuses?.some(s => s.type === 'Anima Distorta')) return 1;
  return 1.25 * (move.name === 'Tocco dell’Anima' ? 2 : 1);
};
export const canDistortSoul = (attacker, move, target, randomValue = Math.random()) =>
  attacker?.id === 'mahito' && move?.contact === true && move.power > 0 &&
  target?.hp > 0 && !target?.passive?.immuneToNegativeStatuses && randomValue < 0.3;
export const getDistortedSoulDamage = (character) =>
  character?.statuses?.some(s => s.type === 'Anima Distorta')
    ? Math.max(1, Math.floor((character.maxHp || 0) * 0.05)) : 0;
