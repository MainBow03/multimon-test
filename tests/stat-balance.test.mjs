import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { applyBattleStatModifier, MAX_BATTLE_STAT_MULTIPLIER, MIN_BATTLE_STAT_MULTIPLIER } from '../src/systems/statBalance.js';
import { randomBuff, randomDebuff, daffyCelebration } from '../src/systems/championEffects.js';

const unit=()=>({
  hp:100,maxHp:100,atk:100,baseAtk:100,
  def:100,baseDef:100,spd:100,baseSpd:100,
  spAtk:100,baseSpAtk:100,spDef:100,baseSpDef:100
});

test('due o più bonus +30% non crescono più esponenzialmente',()=>{
  const u=unit();
  assert.equal(applyBattleStatModifier(u,'atk',1.3),true);
  assert.equal(u.atk,130);
  applyBattleStatModifier(u,'atk',1.3);
  assert.equal(u.atk,160);
  applyBattleStatModifier(u,'atk',1.3);
  assert.equal(u.atk,190);
  applyBattleStatModifier(u,'atk',1.3);
  assert.equal(u.atk,200);
  assert.equal(applyBattleStatModifier(u,'atk',1.3),false);
  assert.equal(MAX_BATTLE_STAT_MULTIPLIER,2);
});

test('le mosse +50% e +100% mantengono il loro primo effetto ma rispettano un tetto',()=>{
  let u=unit();
  applyBattleStatModifier(u,'spd',1.5);
  assert.equal(u.spd,150);
  applyBattleStatModifier(u,'spd',1.5);
  assert.equal(u.spd,200);
  applyBattleStatModifier(u,'spd',1.5);
  assert.equal(u.spd,200);
  u=unit();
  applyBattleStatModifier(u,'atk',2);
  assert.equal(u.atk,200);
  assert.equal(applyBattleStatModifier(u,'atk',1.5),false);
});

test('i malus reiterati non riducono le statistiche sotto al 50%',()=>{
  const u=unit();
  applyBattleStatModifier(u,'def',0.7);
  assert.equal(u.def,70);
  applyBattleStatModifier(u,'def',0.7);
  assert.equal(u.def,50);
  applyBattleStatModifier(u,'def',0.5);
  assert.equal(u.def,50);
  assert.equal(MIN_BATTLE_STAT_MULTIPLIER,0.5);
  applyBattleStatModifier(u,'def',1.3);
  assert.equal(u.def,80);
});

test('le modifiche restano separate per ogni statistica e supportano le difese speciali',()=>{
 const u=unit();
 applyBattleStatModifier(u,'atk',1.3);
 applyBattleStatModifier(u,'spDef',1.5);
 assert.equal(u.atk,130);
 assert.equal(u.def,100);
 assert.equal(u.spDef,150);
 assert.equal(u.spAtk,100);
});

test('le vecchie statistiche di base e gli effetti senza base hanno risultati di primo utilizzo corretti',()=>{
  const c={atk:105,def:75,spd:95};
  applyBattleStatModifier(c,'atk',1.15);
  assert.equal(c.atk,Math.floor(105*1.15));
  applyBattleStatModifier(c,'def',0.85);
  assert.equal(c.def,Math.floor(75*0.85));
});

test('le passive aleatorie condividono i limiti dei buff e dei malus',()=>{
  const u=unit();
  for(let i=0;i<10;i++)randomBuff(u,()=>0);
  assert.equal(u.atk,200);
  for(let i=0;i<10;i++)randomDebuff(u,()=>0);
  assert.equal(u.atk,50);
  const daffy={...u,passive:{type:'failed_star'},hp:50};
  const heal=daffyCelebration(daffy);
  assert.equal(heal,20);
  assert.equal(daffy.atk,60);
});

test('le battaglie classiche e del torneo applicano la funzione comune',()=>{
  const normal=readFileSync(new URL('../src/systems/battleSystem.js',import.meta.url),'utf8');
  const event=readFileSync(new URL('../src/systems/multiverseEventEngine.js',import.meta.url),'utf8');
  const codex=readFileSync(new URL('../src/components/BattleCodex.jsx',import.meta.url),'utf8');
  assert.match(normal,/applyBattleStatModifier\(attacker, 'atk', buffToApply\.atk\)/);
  assert.match(normal,/applyBattleStatModifier\(t\.char, 'def', move\.targetStatDebuff\.def\)/);
  assert.match(event,/applyBattleStatModifier\(actor,k,value\)/);
  assert.match(codex,/due \+30% diventano \+60%/);
  const juggernaut=readFileSync(new URL('../src/systems/juggernautSystem.js',import.meta.url),'utf8');
  assert.match(normal,/setupJuggernaut\\(teams\\[juggPlayer\\]\\[0\\],numOpponents\\)/);
  assert.match(juggernaut,/boss\\.atk = Math\\.floor\\(boss\\.atk \\* scale\\.atk\\)/);
});
