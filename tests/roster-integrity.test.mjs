import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTERS, CAMPAIGNS } from '../src/data/gameData.js';
import { reconcileCampaignRoster, partitionCampaignUnlocks, getCampaignHealthSummary } from '../src/systems/campaignRoster.js';

const campaign = CAMPAIGNS.find(c => c.id === 'crisi_varco');
test('Missing character ID does not crash map HP calculations', () => {
  const stats = { finn: 100, sailormercury: 90 };
  const health = getCampaignHealthSummary(['finn', 'sailormercury'], stats, CHARACTERS);
  assert.deepEqual(health.aliveHeroes, ['finn']);
  assert.ok(health.totalHpPercentage > 0);
});
test('Existing save preserves campaign position, coins and recoverable missing characters', () => {
  const old = { sectorIdx: 16, missionIdx: 1, coins: 432, roster: ['finn', 'sailormercury'], rosterStats: { finn: 42, sailormercury: 90 } };
  const fixed = reconcileCampaignRoster(old, CHARACTERS);
  assert.equal(fixed.coins, 432);
  assert.equal(fixed.sectorIdx, 16);
  assert.equal(fixed.missionIdx, 1);
  assert.deepEqual(fixed.roster, ['finn']);
  assert.deepEqual(fixed.unavailableRosterIds, ['sailormercury']);
  assert.equal(fixed.unavailableRosterStats.sailormercury, 90);
  assert.deepEqual(old.roster, ['finn', 'sailormercury']);
});
test('Archived character can be restored once its definition exists', () => {
  const state = reconcileCampaignRoster({ roster: ['finn', 'bort'], rosterStats: { finn: 50, bort: 80 } }, CHARACTERS);
  const restored = reconcileCampaignRoster(state, [...CHARACTERS, { id: 'bort', maxHp: 115 }]);
  assert.ok(restored.roster.includes('bort'));
  assert.equal(restored.rosterStats.bort, 80);
});
test('No missing characters are unlocked after mission victory', () => {
  for (const id of ['sailormercury', 'bort']) {
    const { valid, unavailable } = partitionCampaignUnlocks([id, 'goku'], ['finn'], CHARACTERS);
    assert.deepEqual(valid, ['goku']);
    assert.deepEqual(unavailable, [id]);
  }
});
test('Valid saves are not changed', () => {
  const save = { coins: 123, roster: ['finn'], rosterStats: { finn: 90 } };
  assert.equal(reconcileCampaignRoster(save, CHARACTERS), save);
});
test('The missing roster definitions are documented until supplied', () => {
  const ids = new Set(CHARACTERS.map(c => c.id));
  for (const target of ['m33', 'm36']) {
    const mission = campaign.sectors.flatMap(s => s.missions).find(m => m.id === target);
    assert.ok(mission);
    assert.ok(mission.unlock.some(id => !ids.has(id)));
  }
});
