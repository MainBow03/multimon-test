import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analyzeTeam, canHealAllies, damagingMoveTypes } from '../src/systems/teamAdvisor.js';
import { getMultiplier } from '../src/systems/typeSystem.js';

const fighter = (id, types, moves, extra = {}) => ({
  id, name: id, types, moves, atk: 90, def: 75, maxHp: 90, spd: 85, ...extra
});

test('l'analisi usa la stessa chart di tipo della battaglia, anche sui doppi tipi', () => {
  const a = fighter('a', ['Acqua', 'Aria'], [{ type: 'Acqua', power: 70 }]);
  const b = fighter('b', ['Aria'], [{ type: 'Lotta', power: 70 }]);
  const report = analyzeTeam([a, b], [], 3);
  const electric = report.threats.find(t => t.type === 'Elettro');
  assert.equal(getMultiplier('Elettro', a.types), 4);
  assert.ok(electric);
  assert.equal(electric.weak, 2);
  assert.match(report.warnings.find(w => w.id === 'weak-Elettro').text, /2 su 2/);
  assert.deepEqual(electric.vulnerableNames, ['a', 'b']);
});

test('non segnala una debolezza condivisa se soltanto un membro su tre è debole', () => {
  const team = [
    fighter('a', ['Acqua'], [{ type: 'Acqua', power: 70 }]),
    fighter('b', ['Terra'], [{ type: 'Terra', power: 90 }]),
    fighter('c', ['Erba'], [{ type: 'Erba', power: 90 }])
  ];
  const report = analyzeTeam(team, [], 3);
  assert.ok(!report.threats.some(t => t.type === 'Elettro'));
});

test('la cura personale non equivale a curare gli alleati', () => {
  const self = fighter('self', ['Normale'], [{ power: 0, target: 'self', heal: 0.5 }]);
  const ally = fighter('ally', ['Normale'], [{ power: 0, targetMode: 'ally', heal: 0.5 }]);
  const group = fighter('group', ['Magico'], [{ power: 0, targetMode: 'team_smart_heal', healTeam: 0.4 }]);
  const rewind = fighter('rewind', ['Magico'], [{ power: 0, targetMode: 'ally', healLastTurnDamage: true }]);
  assert.equal(canHealAllies(self), false);
  assert.equal(canHealAllies(ally), true);
  assert.equal(canHealAllies(group), true);
  assert.equal(canHealAllies(rewind), true);
  const r = analyzeTeam([self, fighter('other', ['Lotta'], [{ type: 'Lotta', power: 80 }])], [ally], 3);
  assert.ok(r.warnings.some(w => w.id === 'heal'));
  assert.equal(r.suggestions[0].character.id, 'ally');
});

test('cure dedicate a un alleato specifico contano solo quando quel compagno è in squadra', () => {
  const special = fighter('special', ['Normale'], [{ targetMode: 'ally', heal: 0.3, specificAlly: 'Strega' }]);
  const strega = fighter('strega', ['Magico'], [], { name: 'Strega' });
  assert.equal(canHealAllies(special, [special]), false);
  assert.equal(canHealAllies(special, [special, strega]), true);
});

test('consigli solo fra le scelte disponibili, senza duplicati e senza mutare il team', () => {
  const t1 = fighter('t1', ['Acqua', 'Aria'], [{ type: 'Acqua', power: 75 }]);
  const t2 = fighter('t2', ['Aria'], [{ type: 'Aria', power: 80 }]);
  const resist = fighter('resist', ['Terra'], [{ type: 'Terra', power: 95 }], { def: 120 });
  const other = fighter('other', ['Normale'], [{ type: 'Normale', power: 50 }]);
  const team = [t1, t2];
  const original = JSON.stringify(team);
  const report = analyzeTeam(team, [t1, resist, resist, other], 3);
  assert.equal(report.suggestions[0].character.id, 'resist');
  assert.equal(report.suggestions.filter(s => s.character.id === 'resist').length, 1);
  assert.equal(report.suggestions.some(s => s.character.id === 't1'), false);
  assert.equal(JSON.stringify(team), original);
});

test('mosse di stato non forniscono falsamente copertura offensiva', () => {
  const character = fighter('state', ['Ghiaccio'], [
    { type: 'Ghiaccio', power: 0, statusEffect: { type: 'Congelato' } },
    { type: 'Normale', power: 50 }
  ]);
  assert.deepEqual(damagingMoveTypes(character), ['Normale']);
});

test('il consigliere è montato tanto nel draft normale quanto nella squadra pronta', () => {
  const view = readFileSync(new URL('../src/screens/battle/DraftingView.jsx', import.meta.url), 'utf8');
  const index = view.indexOf('<TeamAdvisor team={myDraft}');
  assert.ok(index > 0);
  assert.ok(index < view.indexOf('{isReady ? ('));
  assert.match(view, /advisorChoices = gameState\.settings\.sharedDraft/);
  assert.match(view, /gameState\.draftChoices\?\.\[playerRole\]/);
});
