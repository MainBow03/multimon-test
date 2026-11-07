import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {canUseBagItems} from '../src/systems/bagItemPolicy.js';

const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');

test('In Ultimon ogni oggetto dello zaino è vietato, nelle altre modalità rimane consentito',()=>{
  assert.equal(canUseBagItems({gameMode:'ultimon'}),false);
  for(const mode of ['classica','multipla','torneo','torneo_punti','battleroyale','survival','juggernaut']){
    assert.equal(canUseBagItems({gameMode:mode}),true,mode);
  }
  assert.equal(canUseBagItems(null),true);
});

test('Il pulsante Zaino, i consumabili e il selettore bersagli spariscono solo in Ultimon',()=>{
  const ui=read('../src/screens/battle/BattlingView.jsx');
  assert.match(ui,/const bagAvailable = canUseBagItems\(gameState\)/);
  assert.match(ui,/\{!isEventBattle&&bagAvailable&&<button onClick=\{\(\) => setActionMenuMode\('items'\)\}/);
  assert.match(ui,/\{bagAvailable && actionMenuMode === 'items' &&/);
  assert.match(ui,/\{bagAvailable && selectedBagItem &&/);
  assert.match(ui,/Zaino vietato in Ultimon/);
});

test('Comandi manuali e azioni stale sono respinti dal motore, senza consumare inventario',()=>{
  const engine=read('../src/systems/battleSystem.js');
  assert.match(engine,/actionDetails\?\.type === 'use_item' && !canUseBagItems\(gameState\)\) return/);
  assert.match(engine,/action\.type === 'use_item' && !canUseBagItems\(gameState\)\) continue/);
  assert.match(engine,/workingInventory\[player\]\[itemId\]-=1/);
  const guard=engine.indexOf("if (action.type === 'use_item' && !canUseBagItems(gameState)) continue;");
  const consumption=engine.indexOf('workingInventory[player][itemId]-=1;');
  assert.ok(guard>=0&&consumption>guard,'Il blocco deve essere eseguito prima del consumo');
});

test('La CPU non seleziona pozioni o cure dello zaino in Ultimon',()=>{
  const cpu=read('../src/systems/strategicCpu.js');
  assert.match(cpu,/const healingAllowed=canUseBagItems\(room\) &&/);
  assert.match(cpu,/if\(healingAllowed\)\{/);
  // Nessun cambiamento a strumenti equipaggiati, abilità o mosse curative.
  const policy=read('../src/systems/bagItemPolicy.js');
  assert.doesNotMatch(policy,/heldItem|moves/);
});
