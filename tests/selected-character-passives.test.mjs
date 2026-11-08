import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CHARACTERS } from '../src/data/characters.js';
import {
  selectedPassiveDamageFactor, triggerMiraculousAllyHeal, triggerJackpot,
  triggerFutureBlock, consumeFutureStrike
} from '../src/systems/selectedCharacterPassives.js';

const clone = id => {
  const base = CHARACTERS.find(c => c.id === id);
  assert.ok(base, 'Multimon mancante: ' + id);
  return JSON.parse(JSON.stringify({ ...base, baseAtk: base.atk, baseDef: base.def, baseSpd: base.spd }));
};
const fire = { name: 'Lanciafiamme', type: 'Fuoco', power: 90 };
const strike = { name: 'Pugno', type: 'Lotta', power: 80 };
const support = { name: 'Lucky Charm', type: 'Magico', power: 0, targetMode: 'ally' };

test('i cinque Multimon ottengono le passive approvate e non cambiano i moveset', () => {
  const expected = {
    ladybug: ['Il Potere dei Miraculous','miraculous_team_support'],
    charizard: ['Fiamme Inestinguibili','flames_unextinguished'],
    dante: ['Jackpot!','jackpot_critical'],
    finn: ['Avventuriero Nato','born_adventurer'],
    garnet: ['Futuro Infrangibile','unbreakable_future']
  };
  for (const [id,[name,type]] of Object.entries(expected)) {
    const c=clone(id);
    assert.equal(c.passive.name,name);
    assert.equal(c.passive.type,type);
    assert.ok(c.moves.length>=4);
  }
});

test('Ladybug cura solo un alleato ferito con mossa di supporto, massimo 3 volte', () => {
  const ladybug = clone('ladybug');
  const ally={id:'ally',maxHp:100,hp:40};
  assert.equal(triggerMiraculousAllyHeal(ladybug,ally,support),10);
  assert.equal(ally.hp,50);
  assert.equal(ladybug.passiveUses,1);
  assert.equal(triggerMiraculousAllyHeal(ladybug,ladybug,support),0);
  assert.equal(triggerMiraculousAllyHeal(ladybug,ally,{...support,power:70}),0);
  assert.equal(triggerMiraculousAllyHeal(ladybug,ally,{...support,targetMode:'self'}),0);
  assert.equal(triggerMiraculousAllyHeal(ladybug,ally,{...support,targetMode:'team_smart_heal'}),10);
  assert.equal(triggerMiraculousAllyHeal(ladybug,ally,{...support,targetMode:'team'}),10);
  assert.equal(triggerMiraculousAllyHeal(ladybug,ally,support),0);
  assert.equal(ladybug.passiveUses,3);
  assert.equal(ally.hp,70);
});

test('Charizard: Fiamme Inestinguibili solo sotto il 50% e con mosse Fuoco offensive', () => {
  const c=clone('charizard'), opponent=clone('dante');
  c.hp=c.maxHp*0.5;
  assert.equal(selectedPassiveDamageFactor(c,opponent,fire),1);
  c.hp=52;
  assert.equal(selectedPassiveDamageFactor(c,opponent,fire),1.2);
  assert.equal(selectedPassiveDamageFactor(c,opponent,{...fire,type:'Aria'}),1);
  assert.equal(selectedPassiveDamageFactor(c,opponent,{...fire,power:0}),1);
  c.hp=0;
  assert.equal(selectedPassiveDamageFactor(c,opponent,fire),1);
});

test('Dante: Jackpot! cura 15% dei PS e aumenta Velocità 10%, massimo due volte', () => {
  const d=clone('dante');
  d.hp=40;
  const buff=(c,stat,factor)=>{c[stat]=Math.floor(c[stat]*factor)};
  assert.deepEqual(triggerJackpot(d,buff),{healed:15,uses:1});
  assert.equal(d.hp,55);
  assert.equal(d.spd,126);
  assert.deepEqual(triggerJackpot(d,buff),{healed:15,uses:2});
  assert.equal(d.hp,70);
  assert.equal(triggerJackpot(d,buff),null);
  const healthy=clone('dante');
  healthy.hp=healthy.maxHp;
  const result=triggerJackpot(healthy,buff);
  assert.equal(result.healed,0);
  assert.equal(result.uses,1);
});

test('Finn: Avventuriero Nato confronta Attacco base, non i buff temporanei', () => {
  const finn=clone('finn'), stronger=clone('dante'), weaker=clone('ladybug');
  assert.equal(selectedPassiveDamageFactor(finn,stronger,strike),1.15);
  assert.equal(selectedPassiveDamageFactor(finn,weaker,strike),1);
  stronger.atk=1; // riduzione temporanea non cambia il confronto fra Attacchi base
  finn.atk=250;
  assert.equal(selectedPassiveDamageFactor(finn,stronger,strike),1.15);
  stronger.baseAtk=finn.baseAtk;
  assert.equal(selectedPassiveDamageFactor(finn,stronger,strike),1);
});

test('Garnet: solo Visione del Futuro bloccata, bonus singolo senza accumulo, max 2', () => {
  const g=clone('garnet'), opponent=clone('dante');
  assert.equal(triggerFutureBlock(g,strike),false);
  g.statuses=[{type:'Protetto',sourceMove:'Protezione'}];
  assert.equal(triggerFutureBlock(g,strike),false);
  g.statuses=[{type:'Protetto',sourceMove:'Visione del Futuro'}];
  assert.equal(triggerFutureBlock(g,{...strike,power:0}),false);
  assert.equal(triggerFutureBlock(g,strike),true);
  assert.equal(g.futureBlockUses,1);
  assert.equal(triggerFutureBlock(g,strike),false);
  assert.equal(g.futureBlockUses,1);
  assert.equal(selectedPassiveDamageFactor(g,opponent,strike),1.25);
  assert.equal(consumeFutureStrike(g),true);
  assert.equal(consumeFutureStrike(g),false);
  assert.equal(selectedPassiveDamageFactor(g,opponent,strike),1);
  assert.equal(triggerFutureBlock(g,strike),true);
  assert.equal(g.futureBlockUses,2);
  assert.equal(consumeFutureStrike(g),true);
  assert.equal(triggerFutureBlock(g,strike),false);
});

test('motore collegato agli eventi reali senza cambiare il sistema mosse', () => {
  const source=readFileSync(new URL('../src/systems/battleSystem.js',import.meta.url),'utf8');
  for(const trigger of ['selectedPassiveDamageFactor(attacker,defender,move)',
    'triggerFutureBlock(t.char, move)',
    'triggerJackpot(attacker, applyBattleStatModifier)',
    'triggerMiraculousAllyHeal(attacker, t.char, move)',
    'consumeFutureStrike(attacker)']) {
    assert.ok(source.includes(trigger),'Hook non trovato: '+trigger);
  }
  assert.match(source,/sourceMove: move.name/);
  assert.match(source,/t.char.hp < victimHpBeforeHit && move.power > 0/);
});
