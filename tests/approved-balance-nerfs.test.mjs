import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MOVES_DB } from '../src/data/moves.js';
import { resolvePoisonEndTurn } from '../src/systems/battleStatusTurns.js';
import { applyBattleStatModifier } from '../src/systems/statBalance.js';

const move = name => {
  const m=MOVES_DB[name];
  assert.ok(m,'Mossa inesistente: '+name);
  return m;
};
const assertNear=(a,b)=>assert.ok(Math.abs(a-b)<1e-10, `Expected ${a} == ${b}`);

test('1) Veleno: progressione 5/10/15%, massimo 15% e KO sicuri',()=>{
  for(const [turns,expected] of [[1,5],[2,10],[3,15],[4,15],[20,15]]){
    const c={hp:100,maxHp:100,statuses:[{type:'Avvelenato',turns}]};
    const result=resolvePoisonEndTurn(c,damage=>{c.hp-=damage;});
    assert.equal(result.damage,expected,'Turno di veleno '+turns);
    assert.equal(c.statuses[0].turns,turns+1);
  }
  const c={hp:2,maxHp:100,statuses:[{type:'Avvelenato',turns:4}]};
  const out=resolvePoisonEndTurn(c,()=>{c.hp=0;c.statuses=[];});
  assert.equal(out.progressed,false);
  assert.deepEqual(c.statuses,[]);
});

test('2) Fratelli Bros: potenza 250 e bonus +30% per Mario e Luigi',()=>{
  const m=move('Fratelli Bros');
  assert.equal(m.power,250);
  assert.equal(m.maxUses,1);
  assert.deepEqual(m.isCombo,['mario','luigi']);
  assertNear(m.specificComboEffects.mario.statBuff.def,1.3);
  assertNear(m.specificComboEffects.luigi.statBuff.spd,1.3);
  assertNear(m.specificComboEffects.mario.selfHeal,-.2);
  assertNear(m.specificComboEffects.luigi.selfHeal,-.2);
});

test('3) A caccia di meduse: 250 potenza invariata, SpongeBob +50% su tre statistiche',()=>{
  const m=move('A caccia di meduse');
  assert.equal(m.power,250);
  assert.equal(m.ignoreDefBuffs,true);
  assert.deepEqual(m.isCombo,['spongebob','patrick']);
  for(const key of ['atk','def','spd']) assertNear(m.specificComboEffects.spongebob.statBuff[key],1.5);
  assertNear(m.specificComboEffects.patrick.selfHeal,-.75);
  const c={atk:100,baseAtk:100};
  assert.equal(applyBattleStatModifier(c,'atk',1.5),true);
  assert.equal(c.atk,150);
});

test('4) Esplosione Solare: brucia al 100%, massimo due bersagli',()=>{
  const m=move('Esplosione Solare');
  assert.equal(m.targetCount,2);
  assert.equal(m.statusEffect.type,'Scottato');
  assert.equal(m.statusEffect.chance,1);
});

test('5) Polline fastidioso: potenza 40, due bersagli, 35% ciascuno dei due status',()=>{
  const m=move('Polline fastidioso');
  assert.equal(m.power,40);
  assert.equal(m.targetCount,2);
  assert.equal(m.maxUses,4);
  assert.deepEqual(m.statusEffects.map(s=>s.type),['Addormentato','Elettrizzato']);
  for(const s of m.statusEffects) assertNear(s.chance,.35);
});

test('6) Fotosintesi clorofiliana: cura 80% da sola, 35% con team',()=>{
  const m=move('Fotosintesi clorofiliana');
  assert.equal(m.strictUses,true, 'Il limite non deve essere aumentato dalla normalizzazione');
  assert.equal(m.targetMode,'team_smart_heal');
  assert.equal(m.maxUses,2);
  assertNear(m.healAlone,.8);
  assertNear(m.healTeam,.35);
});

test('7) Gadget di Supporto: massimo 2 usi e massimo 2 alleati',()=>{
  const m=move('Gadget di Supporto');
  assert.equal(m.strictUses,true, 'Il limite non deve essere aumentato dalla normalizzazione');
  assert.equal(m.maxUses,2);
  assert.equal(m.maxTeamTargets,2);
  assertNear(m.targetStatBuff.atk,1.5);
  assertNear(m.targetStatBuff.def,1.5);
});

test('8) Fascino Glaciale: 75% e 3 utilizzi',()=>{
  const m=move('Fascino Glaciale');
  assert.equal(m.strictUses,true, 'Il limite non deve essere aumentato dalla normalizzazione');
  assert.equal(m.maxUses,3);
  assert.equal(m.statusEffect.type,'Infatuato');
  assertNear(m.statusEffect.chance,.75);
});

test('9) Sou Giakuru!: 125 potenza e 70% confusione',()=>{
  const m=move('Sou Giakuru!');
  assert.equal(m.power,125);
  assert.equal(m.maxUses,2);
  assert.equal(m.statusEffect.type,'Confuso');
  assertNear(m.statusEffect.chance,.7);
});

test('10) Piano Z: +50% ATK, +30% VEL con 2 usi',()=>{
  const m=move('Piano Z');
  assert.equal(m.strictUses,true, 'Il limite non deve essere aumentato dalla normalizzazione');
  assert.equal(m.maxUses,2);
  assertNear(m.statBuff.atk,1.5);
  assertNear(m.statBuff.spd,1.3);
});

test('Il motore gestisce selezione di due bersagli, due status e utilizzi delle mosse',()=>{
  const battle=readFileSync(new URL('../src/systems/battleSystem.js',import.meta.url),'utf8');
  const planner=readFileSync(new URL('../src/systems/strategicCpu.js',import.meta.url),'utf8');
  // La selezione IA dei bersagli è stata estratta in strategicCpu:
  // continua a rispettare il limite 2–3 bersagli, il motore esegue i colpi.
  assert.match(planner,/move\.targetCount>1 && move\.targetCount<4/);
  assert.match(planner,/selectedTargets:targets\.map/);
  assert.match(battle,/Math\.min\(targetCount, aliveEnemies\)/);
  assert.match(battle,/let effects = move\.statusEffects \|\| \(move\.statusEffect \? \[move\.statusEffect\] : \[\]\)/);
  assert.match(battle,/move\.remainingUses -= 1/);
  assert.match(battle,/move\.healAlone \|\| move\.heal/);
});
