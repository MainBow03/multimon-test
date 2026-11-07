import test from 'node:test';
import assert from 'node:assert/strict';
import {GAME_UPDATES,UPDATE_COUNT,UPDATE_CATEGORIES} from '../src/data/updateHistory.js';
import {ULTIMON_REWARDS} from '../src/systems/ultimonRewards.js';

const ids=[
 'nov7-ultimon-showcase-final',
 'nov7-ultimon-rewards',
 'nov7-ultimon-bag-ban',
 'nov7-ultimon-mode'
];

test('Le novità Ultimon appaiono per prime e con data, categoria e dettagli corretti',()=>{
 assert.deepEqual(GAME_UPDATES.slice(0,ids.length).map(u=>u.id),ids);
 assert.equal(new Set(GAME_UPDATES.map(u=>u.id)).size,GAME_UPDATES.length);
 assert.equal(UPDATE_COUNT,GAME_UPDATES.reduce((n,u)=>n+u.items.length,0));
 for(const id of ids){
   const item=GAME_UPDATES.find(u=>u.id===id);
   assert.equal(item.date,'07/11/2026');
   assert.ok(item.items.length>=3);
   assert.ok(UPDATE_CATEGORIES.some(c=>c.id===item.category));
 }
});

test('Il registro descrive tutte le novità effettivamente presenti nella modalità',()=>{
 const text=ids.map(id=>GAME_UPDATES.find(u=>u.id===id).items.join(' ')).join(' ');
 for(const phrase of ['cerimonia','tabellone','ULTIMO DUELLO',
  'Zaino','CPU','1v1','2v2','3v3','20 colori','KO','online'])
   assert.ok(text.toLowerCase().includes(phrase.toLowerCase()),phrase);
 for(const [size,rewards] of Object.entries(ULTIMON_REWARDS)){
   const entry=GAME_UPDATES.find(u=>u.id==='nov7-ultimon-rewards').items
    .find(x=>x.startsWith('Con '+size+' giocatori:'));
   assert.ok(entry,'manca tabella '+size);
   for(let pos=1;pos<=Number(size);pos++)
    assert.ok(entry.includes(pos+'° +'+rewards[pos-1]),size+' / '+pos+'°');
 }
});
