import test from 'node:test';
import assert from 'node:assert/strict';
import { getEquippedCount, canEquipHeldItem, getHeldPowerFactor, getHeldRecoil,
  getMahitoMultiplier, canDistortSoul, getDistortedSoulDamage } from '../src/systems/heldEquipment.js';
import { ITEMS_DB, MOVES_DB, CHARACTERS } from '../src/data/gameData.js';
import { TYPES } from '../src/data/types.js';
import { TYPE_STYLES, getMultiplier } from '../src/systems/typeSystem.js';

test('Iperband is a purchasable permanent held item', () => {
  assert.equal(ITEMS_DB.iperband.type, 'held');
  assert.equal(ITEMS_DB.iperband.price, 450);
});
test('Each Iperband copy can be assigned to only one champion', () => {
  const team = [{ heldItem: 'iperband' }, { heldItem: null }];
  assert.equal(getEquippedCount(team, 'iperband'), 1);
  assert.equal(canEquipHeldItem(team, 1, 'iperband', { iperband: 1 }), false);
  assert.equal(canEquipHeldItem(team, 1, 'iperband', { iperband: 2 }), true);
  assert.equal(canEquipHeldItem(team, 0, 'iperband', { iperband: 1 }), true);
  assert.equal(canEquipHeldItem(team, 0, '', { iperband: 0 }), true);
});
test('Held equipment boosts damaging moves, never status moves', () => {
  const holder = { heldItem: 'iperband', maxHp: 95 };
  assert.equal(getHeldPowerFactor(holder, { power: 90 }), 1.3);
  assert.equal(getHeldPowerFactor(holder, { power: 0 }), 1);
  assert.equal(getHeldPowerFactor({ maxHp: 95 }, { power: 90 }), 1);
  assert.equal(getHeldRecoil(holder, { power: 90 }), 9);
  assert.equal(getHeldRecoil({ ...holder, maxHp: 3 }, { power: 20 }), 1);
  assert.equal(getHeldRecoil(holder, { power: 0 }), 0);
});
test('Mahito has all moves, correct passive, once-only transformation and ultimate', () => {
  const mahito = CHARACTERS.find(c => c.id === 'mahito');
  assert.ok(mahito);
  assert.deepEqual(mahito.types, ['Spettro']);
  assert.equal(mahito.moves.length, 4);
  assert.equal(mahito.moves[0].maxUses, 1);
  assert.equal(mahito.moves[1].power, 95);
  assert.equal(mahito.moves[2].targetCount, 4);
  assert.equal(mahito.moves[2].statusEffect.chance, 0.1);
  assert.equal(mahito.moves[3].maxUses, 1);
  assert.equal(mahito.passive.type, 'mahito_soul');
});
test('Folletto is a registered type with styles and an effectiveness chart', () => {
  assert.ok(TYPES.includes('Folletto'));
  assert.ok(TYPE_STYLES.Folletto);
  assert.equal(getMultiplier('Folletto', ['Drago']), 2);
  assert.equal(getMultiplier('Drago', ['Folletto']), 0);
});
test('Mahito distorted soul multiplies damage and causes 5% end-of-turn loss', () => {
  const defender = { maxHp: 95, hp: 80, statuses: [{ type: 'Anima Distorta' }] };
  assert.equal(getMahitoMultiplier({ id: 'mahito' }, defender, MOVES_DB['Tocco dell’Anima']), 2.5);
  assert.equal(getMahitoMultiplier({ id: 'mahito' }, defender, MOVES_DB['Polimorfismo Mostruoso']), 1.25);
  assert.equal(getMahitoMultiplier({ id: 'finn' }, defender, MOVES_DB['Tocco dell’Anima']), 1);
  assert.equal(getDistortedSoulDamage(defender), 4);
  assert.equal(canDistortSoul({ id: 'mahito' }, { power: 95, contact: true }, defender, 0.29), true);
  assert.equal(canDistortSoul({ id: 'mahito' }, { power: 95, contact: true }, defender, 0.31), false);
  assert.equal(canDistortSoul({ id: 'mahito' }, { power: 75 }, defender, 0.1), false);
});
