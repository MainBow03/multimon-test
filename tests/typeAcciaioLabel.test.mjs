import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {TYPES} from '../src/data/types.js';
import {TYPE_CHART,getMultiplier} from '../src/systems/typeSystem.js';
import {typeDisplayName,typeInternalName} from '../src/systems/typeLabel.js';

test('Acciaio è la nuova etichetta del tipo Robot senza duplicati',()=>{
 assert.equal(typeDisplayName('Robot'),'Acciaio');
 assert.equal(typeDisplayName('Acciaio'),'Acciaio');
 assert.equal(typeDisplayName('Ghiaccio'),'Ghiaccio');
 assert.equal(typeInternalName('Acciaio'),'Robot');
 assert.equal(TYPES.filter(t=>t==='Robot').length,1,'L’ID nei salvataggi esistenti rimane stabile');
 assert.equal(TYPE_CHART.Robot.Robot,.5);
 assert.equal(getMultiplier('Robot',['Roccia']),2);
 assert.equal(getMultiplier('Fuoco',['Robot']),2);
});
test('I principali badge, filtri e tabelle mostrano Acciaio, non Robot',()=>{
 for(const path of [
  '../src/screens/hub/CatalogView.jsx',
  '../src/screens/hub/ShopView.jsx',
  '../src/screens/hub/CollectionView.jsx',
  '../src/screens/hub/TypeChartView.jsx',
  '../src/screens/battle/BattlingView.jsx',
  '../src/screens/battle/DraftingView.jsx',
  '../src/screens/campaign/CampaignTeamSelectView.jsx'
 ]){
  const c=readFileSync(new URL(path,import.meta.url),'utf8');
  assert.match(c,/typeDisplayName/,'Etichetta Acciaio mancante in '+path);
 }
 const codex=readFileSync(new URL('../src/components/BattleCodex.jsx',import.meta.url),'utf8');
 assert.match(codex,/Ghiaccio, Roccia e Acciaio immuni/);
});
