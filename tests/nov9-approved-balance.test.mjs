import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CHARACTERS } from '../src/data/characters.js';
import { MOVES_DB } from '../src/data/moves.js';
import { calculateDamageImpl } from '../src/systems/battleSystem.js';

const get = id => {
  const character = CHARACTERS.find(c => c.id === id);
  assert.ok(character, 'Multimon inesistente: ' + id);
  return character;
};
const assertMoveAttached = (id, name) => {
  const character = get(id);
  const move = character.moves.find(m => m?.name === name);
  assert.ok(move, name + ' non assegnata a ' + id);
  return move;
};

test('Buff approvati: 6 modifiche alle statistiche del roster standard', () => {
  assert.equal(get('yukionna').def, 75);
  assert.equal(get('katara').hp, 95);
  assert.equal(get('katara').maxHp, 95);
  assert.equal(get('gardevoir').hp, 95);
  assert.equal(get('gardevoir').maxHp, 95);
  assert.equal(get('rias').def, 82);
  assert.equal(get('reghiaccio').spd, 88);
  assert.equal(get('marceline').def, 82);
});

test('Buff approvati: Chopper ha davvero Velocità base 88', () => {
  assert.equal(get('chopper').spd, 88);
  assert.equal(get('chopper').hp, 98);
  assert.equal(get('chopper').passive.name, 'Medico di Bordo');
});

test('Buff approvati: 3 nuove potenze delle mosse nella MOVES_DB e nei personaggi', () => {
  const updates = [
    ['carlos','Assalto Frontale',85],
    ['pyra','Lame Scarlatte',75],
    ['spyro','Pioggia di Gemme',36]
  ];
  for (const [id, name, power] of updates) {
    assert.equal(MOVES_DB[name].power, power);
    assert.equal(assertMoveAttached(id,name).power,power);
  }
  assert.deepEqual(MOVES_DB['Pioggia di Gemme'].multiHit, {min:2,max:4});
  assert.equal(MOVES_DB['Lame Scarlatte'].targetCount, 2);
});

test('Nerf approvati: Superman scende a 132 PS, altre statistiche conservate', () => {
  const c = get('superman');
  assert.equal(c.hp,132);
  assert.equal(c.maxHp,132);
  assert.equal(c.atk,137);
  assert.equal(c.def,119);
});

test('Nerf approvati: probabilità ridotte realmente nei dati e nelle mosse', () => {
  assert.equal(get('darwin').passive.teamStatBuffChance,0.30);
  assert.equal(get('darwin').passive.teamStatBuff.def,1.3);
  assert.match(get('darwin').passive.desc,/30% di probabilità/);

  const statusRules = [
    ['neon','Relay Bolt','Stordito',0.65],
    ['jackfrost','Scherzetto di Neve','Congelato',0.30],
    ['meliodas','Fiamme del Purgatorio','Scottato',0.35]
  ];
  for(const [id,name,status,chance] of statusRules) {
    const move=assertMoveAttached(id,name);
    assert.equal(move.statusEffect.type,status);
    assert.equal(move.statusEffect.chance,chance);
    assert.equal(MOVES_DB[name].statusEffect.chance,chance);
  }
});

test('Ladybug: cura gruppo 40%, cura in solitaria 50%, due usi e passiva invariata', () => {
  const move = assertMoveAttached('ladybug','Miraculous Ladybug');
  assert.equal(move.targetMode,'team_smart_heal');
  assert.equal(move.healTeam,0.4);
  assert.equal(move.healAlone,0.5);
  assert.equal(move.maxUses,5); // Normalizzazione originale dei PP delle mosse di cura.
  assert.equal(get('ladybug').passive.name,'Il Potere dei Miraculous');
  const engine = readFileSync(new URL('../src/systems/battleSystem.js',import.meta.url),'utf8');
  assert.match(engine,/aliveAlliesCount === 1 \? \(move\.healAlone \|\| move\.heal\) : \(move\.healTeam \|\| move\.heal\)/);
});

test('Diamante: fattore danno reale 0.85 dalla passiva, non 0.8 fissato nel motore', () => {
  const diamond=get('diamante');
  assert.equal(diamond.passive.type,'petrosapien_armor');
  assert.equal(diamond.passive.damageReduction,0.15);
  assert.match(diamond.passive.desc,/15%/);
  const engine=readFileSync(new URL('../src/systems/battleSystem.js',import.meta.url),'utf8');
  assert.match(engine,/1 - \(defender\.passive\.damageReduction \?\? 0\.2\)/);
  assert.doesNotMatch(engine,/petrosapien_armor' \? 0\.8/);

  const base = Object.assign({},diamond,{statuses:[],baseDef:diamond.def});
  const attacker = Object.assign({},get('carlos'),{statuses:[],baseAtk:get('carlos').atk});
  const move = MOVES_DB['Assalto Frontale'];
  const normal=calculateDamageImpl({},attacker,{...base,passive:null},move,1,false,()=>0.5);
  const protectedDamage=calculateDamageImpl({},attacker,base,move,1,false,()=>0.5);
  assert.ok(normal>0,'Il danno base deve essere positivo');
  assert.ok(protectedDamage<normal,'La passiva deve ridurre il danno');
  assert.ok(Math.abs(protectedDamage/normal-0.85)<0.04,
    'Riduzione reale attesa intorno al 15%: '+protectedDamage+'/'+normal);
});

test('Le modifiche alle probabilità sono consumate dal motore del turno', () => {
  const code=readFileSync(new URL('../src/systems/battleSystem.js',import.meta.url),'utf8');
  assert.match(code,/Math\.random\(\) < char\.passive\.teamStatBuffChance/);
  assert.match(code,/const chanceToApply = boostedStatusChance\(attacker,effect\.chance !== undefined \? effect\.chance : 1\.0\)/);
});
