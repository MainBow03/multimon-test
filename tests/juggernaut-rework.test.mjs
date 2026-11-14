import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  setupJuggernaut,applyJuggernautSummonBonus,updateJuggernautThresholds,
  activateNextJuggernautShield,canUseJuggernautSkill,
  createJuggernautSynergy,canActivateJuggernautSynergy,
  chargeJuggernautSynergy,spendJuggernautSynergy,JUGGERNAUT_SCALING
} from '../src/systems/juggernautSystem.js';

const boss=()=>({name:'Sage',maxHp:100,hp:100,atk:100,def:100,
  spAtk:80,spDef:80,baseSpd:100,spd:100,moves:[]});

test('Juggernaut: scale in 3/4/5 players, special stats and one-time setup',()=>{
  for(const [opponents,scale] of Object.entries(JUGGERNAUT_SCALING)){
    const char=boss();
    setupJuggernaut(char,Number(opponents));
    assert.equal(char.maxHp,Math.floor(100*scale.hp));
    assert.equal(char.atk,Math.floor(100*scale.atk));
    assert.equal(char.def,Math.floor(100*scale.def));
    assert.equal(char.spAtk,Math.floor(80*scale.atk));
    assert.equal(char.spDef,Math.floor(80*scale.def));
    assert.equal(char.moves.filter(m=>m.juggSpecial).length,3);
    setupJuggernaut(char,Number(opponents));
    assert.equal(char.moves.filter(m=>m.juggSpecial).length,3);
  }
});
test('Juggernaut: one heavy hit never loses shield phases',()=>{
  const c=setupJuggernaut(boss(),4);
  const stages=updateJuggernautThresholds(c,c.maxHp*.2);
  assert.deepEqual(stages,[2,3,4]);
  assert.deepEqual(c.juggShieldHpThresholds,[]);
  assert.deepEqual(c.juggPendingShields,[75,50,25]);
  assert.equal(c.atk,Math.floor(Math.floor(100*2.1)*1.15));
  assert.equal(c.def,Math.floor(Math.floor(100*2.1)*.90));
  let shield=activateNextJuggernautShield(c);
  assert.equal(shield.threshold,75);
  assert.equal(shield.hits,4);
  assert.equal(activateNextJuggernautShield(c),null);
  c.juggHitsRemaining=0;
  shield=activateNextJuggernautShield(c);
  assert.equal(shield.threshold,50);
  c.juggHitsRemaining=0;
  shield=activateNextJuggernautShield(c);
  assert.equal(shield.threshold,25);
  c.juggHitsRemaining=0;
  assert.equal(activateNextJuggernautShield(c),null);
  assert.deepEqual(updateJuggernautThresholds(c,c.maxHp*.1),[]);
});
test('Juggernaut: no new shield on KO and no duplicate phase activation',()=>{
  const c=setupJuggernaut(boss(),2);
  assert.deepEqual(updateJuggernautThresholds(c,0),[]);
  assert.equal(c.juggPhase,1);
  assert.deepEqual(updateJuggernautThresholds(c,c.maxHp*.74),[2]);
  assert.deepEqual(updateJuggernautThresholds(c,c.maxHp*.72),[]);
  assert.equal(c.juggPendingShields.length,1);
});
test('Juggernaut: skill gating and midpoint choice shared',()=>{
  const c=setupJuggernaut(boss(),3);
  const skills=Object.fromEntries(c.moves.map(m=>[m.juggSpecial,m]));
  assert.equal(canUseJuggernautSkill(c,skills.roar),true);
  assert.equal(canUseJuggernautSkill(c,skills.counter),false);
  updateJuggernautThresholds(c,c.maxHp*.49);
  assert.equal(canUseJuggernautSkill(c,skills.counter),true);
  // Le scelte del 50% ora sono gratuite, non mosse da selezionare.
  assert.equal(skills.purge,undefined);
  assert.equal(skills.empower,undefined);
  assert.equal(canUseJuggernautSkill(c,{juggSpecial:'purge',juggOnceMidpoint:true}),false);
  assert.equal(canUseJuggernautSkill(c,{juggSpecial:'empower',juggOnceMidpoint:true}),false);
  skills.roar.currentCooldown=2;
  assert.equal(canUseJuggernautSkill(c,skills.roar),false);
});
test('Juggernaut: capped summons never scale like the main boss',()=>{
  const summoned=boss();
  applyJuggernautSummonBonus(summoned,4);
  assert.equal(summoned.maxHp,180);
  assert.equal(summoned.atk,124);
  assert.equal(summoned.def,124);
  assert.equal(summoned.baseAtk,124);
});
test('Juggernaut: synergy requires two different real players and two coordinated turns',()=>{
  const syn=createJuggernautSynergy();
  assert.equal(chargeJuggernautSynergy(syn,['p2','p2']),false);
  assert.equal(chargeJuggernautSynergy(syn,['p2','p3']),true);
  assert.equal(syn.charge,1);
  assert.equal(canActivateJuggernautSynergy(syn,2),false);
  chargeJuggernautSynergy(syn,['p2','p4']);
  assert.equal(canActivateJuggernautSynergy(syn,3),true);
  assert.equal(spendJuggernautSynergy(syn,'shield',3),true);
  assert.equal(syn.shieldPierce,1);
  assert.equal(syn.charge,0);
  assert.equal(syn.cooldownUntilTurn,6);
  assert.equal(spendJuggernautSynergy(syn,'damage',3),false);
  chargeJuggernautSynergy(syn,['p2','p4']);
  chargeJuggernautSynergy(syn,['p2','p3']);
  assert.equal(canActivateJuggernautSynergy(syn,5),false);
  assert.equal(canActivateJuggernautSynergy(syn,6),true);
  assert.equal(spendJuggernautSynergy(syn,'damage',6),true);
  assert.equal(syn.activations,2);
});
test('Juggernaut: mode-isolated engine and UI integration',()=>{
  const engine=readFileSync(new URL('../src/systems/battleSystem.js',import.meta.url),'utf8');
  const ui=readFileSync(new URL('../src/screens/battle/BattlingView.jsx',import.meta.url),'utf8');
  const intro=readFileSync(new URL('../src/screens/battle/PreBattleView.jsx',import.meta.url),'utf8');
  const result=readFileSync(new URL('../src/screens/battle/GameoverView.jsx',import.meta.url),'utf8');
  assert.match(engine,/setupJuggernaut\(teams\[juggPlayer\]\[0\],numOpponents\)/);
  assert.match(engine,/gameState\.gameMode === 'juggernaut' && !gameState\.isRoguelikeCoop/);
  assert.match(engine,/juggFreeChoices/);
  assert.match(engine,/applyJuggernautMidpointChoice/);
  assert.match(engine,/juggHittersThisTurn/);
  assert.match(engine,/activateNextJuggernautShield/);
  assert.match(ui,/Frantuma Scudo/);
  assert.match(ui,/canUseJuggernautSkill/);
  assert.match(intro,/JUGGERNAUT · 1 CONTRO TUTTI/);
  assert.match(result,/JuggernautResults/);
});
