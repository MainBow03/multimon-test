import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {onlineHealingRemaining} from '../src/systems/onlineHealingLimit.js';
import {ITEMS_DB} from '../src/data/items.js';

const view=readFileSync(new URL('../src/screens/battle/BattlingView.jsx',import.meta.url),'utf8');
const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');

test('Zaino in battaglia: appMode è passato e definito nello scope della schermata',()=>{
 const setup=view.match(/export function renderBattlingView\(ctx\) \{\s*const \{([^}]+)\} = ctx;/);
 assert.ok(setup,'Impossibile trovare i parametri della schermata di battaglia');
 assert.match(setup[1],/(^|,)\s*appMode\s*(,|$)/,'BattlingView deve destrutturare appMode');
 const invocation=app.match(/renderBattlingView\(\{([^}]+)\}\)/);
 assert.ok(invocation,'Impossibile trovare la chiamata al renderer da App');
 assert.match(invocation[1],/(^|,)\s*appMode\s*(,|$)/,'App deve passare appMode allo zaino');
 assert.match(view,/onlineHealingRemaining\(gameState,playerRole,appMode,ITEMS_DB\)/);
});

test('Zaino: modalità locale e campagna nessun limite, online massimo tre cure',()=>{
 const state={healingItemsUsed:{p1:2},actions:{p1:{}},isCampaignBattle:false};
 assert.equal(onlineHealingRemaining(state,'p1','online_room',ITEMS_DB),1);
 assert.equal(onlineHealingRemaining(state,'p1','local_room',ITEMS_DB),Infinity);
 state.isCampaignBattle=true;
 assert.equal(onlineHealingRemaining(state,'p1','online_room',ITEMS_DB),Infinity);
});
