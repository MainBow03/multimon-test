import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOnlineForfeitPatch } from '../src/systems/onlineForfeit.js';
import { initialGameState } from '../src/systems/gameState.js';

const hero = (name, hp = 80) => ({ name, id: name, hp, maxHp: 100 });

function makeRoom(mode = 'classica') {
  const room = initialGameState();
  room.status = 'battling';
  room.gameMode = mode;
  room.players = { ...room.players, p1: 'Alice', p2: 'Bob', p3: 'Carla', p4: 'Dino' };
  room.playerUids = { ...room.playerUids, p1: 'uid1', p2: 'uid2', p3: 'uid3', p4: 'uid4' };
  room.teams = { ...room.teams, p1: [hero('A')], p2: [hero('B')], p3: [hero('C')], p4: [hero('D')] };
  room.field = { ...room.field, p1: [0], p2: [0], p3: [0], p4: [0] };
  room.actions = { ...room.actions, p1: { 0: { type: 'attack' } }, p2: { 0: { type: 'attack', moveIdx: 2 } } };
  return room;
}

test('Il forfait aggiorna solo campi di proprietà del giocatore, senza sovrascrivere gli alleati', () => {
  const room = makeRoom('multipla');
  const original = structuredClone(room);
  const patch = buildOnlineForfeitPatch(room, 'p1', 'uid1', 100);
  assert.deepEqual(Object.keys(patch).sort(), [
    'actions.p1', 'field.p1', 'players.p1', 'teams.p1'
  ].sort());
  assert.equal(patch['teams.p1'][0].hp, 0);
  assert.deepEqual(patch['field.p1'], []);
  assert.deepEqual(patch['actions.p1'], {});
  assert.equal(patch['players.p1'], 'Alice (Arreso)');
  assert.deepEqual(room, original, 'Non deve mutare la stanza precedente');
  assert.equal(patch.teams, undefined);
  assert.equal(patch.actions, undefined);
});

test('In uno scontro 1v1 il forfait attribuisce subito la vittoria senza intaccare l’avversario', () => {
  const patch = buildOnlineForfeitPatch(makeRoom(), 'p1', 'uid1', 3456);
  assert.equal(patch.status, 'gameover');
  assert.equal(patch.winner, 'Bob');
  assert.equal(patch.phaseStartedAt, 3456);
  assert.ok(!Object.hasOwn(patch, 'teams'));
  assert.ok(!Object.hasOwn(patch, 'actions.p2'));
});

test('Se il combattimento è in esecuzione, conclude l’animazione senza cambiare immediatamente lo stato', () => {
  const room = makeRoom(); room.status = 'executing';
  const patch = buildOnlineForfeitPatch(room, 'p1', 'uid1');
  assert.equal(patch.status, undefined);
  assert.equal(patch.postExecStatus, 'gameover');
  assert.equal(patch.winner, 'Bob');
});

test('Non si può abbandonare sotto l’identità di un altro giocatore', () => {
  assert.throws(() => buildOnlineForfeitPatch(makeRoom(), 'p1', 'uid2'), /altro giocatore/);
  assert.throws(() => buildOnlineForfeitPatch(makeRoom(), 'p7', 'uid1'), /altro giocatore/);
  const room = makeRoom(); room.isBot.p1 = true;
  assert.throws(() => buildOnlineForfeitPatch(room, 'p1', 'uid1'), /altro giocatore/);
});

test('Nessuna modifica per lobby o partite già concluse', () => {
  for(const status of ['lobby', 'gameover']){
    const room = makeRoom(); room.status = status;
    assert.equal(buildOnlineForfeitPatch(room, 'p1', 'uid1'), null);
  }
});

test('Se l’ultimo alleato Co-op abbandona, il guardiano vince; se restano alleati la partita continua', () => {
  const room = makeRoom('juggernaut');
  room.isRoguelikeCoop = true;
  room.settings.juggernautPlayer = 'p4';
  room.teams.p2[0].hp = 0; room.teams.p3[0].hp = 0;
  assert.equal(buildOnlineForfeitPatch(room, 'p1', 'uid1').winner, 'Dino');
  room.teams.p2[0].hp = 30;
  assert.equal(buildOnlineForfeitPatch(room, 'p1', 'uid1').winner, undefined);
});
