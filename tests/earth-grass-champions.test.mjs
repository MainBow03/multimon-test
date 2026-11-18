import test from 'node:test';
import assert from 'node:assert/strict';
import {CHARACTERS} from '../src/data/characters.js';
import {MOVES_DB} from '../src/data/moves.js';
import {CHAR_PRICES} from '../src/data/prices.js';
import {RECENT_ARRIVALS_IDS,recentArrivalCharacters} from '../src/data/recentArrivals.js';
import {ULTIMON_ENTRANCE_LINES} from '../src/systems/ultimonEntranceLines.js';
import {ULTIMON_DUPLICATE_REACTIONS} from '../src/systems/ultimonDuplicateLines.js';
import {MASTERY_CHARACTER_TITLES} from '../src/data/masteryTitles.js';
import {SHAYMIN_AWAKENED_IMAGE} from '../src/data/earthGrassChampions.js';

const IDS=['tophbeifong','gaara','flygon','flora','leafeon','shaymin'];
const EXPECTED={
 tophbeifong:['Terra','Roccia'],gaara:['Terra','Psico'],flygon:['Terra','Drago'],
 flora:['Erba','Folletto'],leafeon:['Erba'],shaymin:['Erba','Luce']
};
const byId=id=>CHARACTERS.find(c=>c.id===id);

test('Sei nuovi personaggi, 24 mosse e sei immagini individuali JPEG richieste dal giocatore',()=>{
 const images=new Set(),allMoves=new Set();
 for(const id of IDS){
  const list=CHARACTERS.filter(c=>c.id===id);
  assert.equal(list.length,1);
  const c=list[0];
  assert.deepEqual(c.types,EXPECTED[id]);
  assert.ok(!c.isSummonOnly&&!c.isCampaignMonster);
  assert.ok(/^https:\/\/i\.pinimg\.com\/.*\.jpg$/.test(c.img),id);
  assert.ok(!images.has(c.img));
  images.add(c.img);
  assert.equal(c.moves.length,4);
  assert.ok(c.moves.every(m=>m&&m.name&&m.type&&Number.isFinite(m.power)));
  for(const move of c.moves){
   assert.equal(MOVES_DB[move.name],move);
   assert.ok(!allMoves.has(move.name));
   allMoves.add(move.name);
  }
  assert.ok(CHAR_PRICES[id]>0);
  assert.ok(c.passive?.name&&c.passive?.type&&c.passive?.desc);
 }
 assert.equal(allMoves.size,24);
 assert.ok(SHAYMIN_AWAKENED_IMAGE.endsWith('.jpg'));
});

test('Vetrina, intro Ultimon, reazioni doppioni e titoli padronanza',()=>{
 assert.deepEqual(RECENT_ARRIVALS_IDS.slice(12,18),IDS);
 assert.deepEqual(recentArrivalCharacters(CHARACTERS).slice(12,18).map(c=>c.id),IDS);
 for(const id of IDS){
  assert.ok(ULTIMON_ENTRANCE_LINES[id]?.length>15);
  assert.ok(ULTIMON_DUPLICATE_REACTIONS[id]?.length>15);
  assert.ok(MASTERY_CHARACTER_TITLES[id]?.length>12);
 }
 assert.equal(new Set(IDS.map(id=>MASTERY_CHARACTER_TITLES[id])).size,6);
});

test('Sei passive differenti con condizioni e limiti reali',()=>{
 assert.equal(byId('tophbeifong').passive.earthSense,true);
 assert.equal(byId('gaara').passive.type,'sand_guard');
 assert.equal(byId('flygon').passive.maxTriggers,3);
 assert.equal(byId('flora').passive.healLowestAllyPercent,.08);
 assert.equal(byId('leafeon').passive.type,'leaf_blade');
 assert.equal(byId('shaymin').passive.type,'spring_heart');
 assert.equal(byId('shaymin').passive.maxTriggers,4);
});

test('Risveglio: un utilizzo, status Erba, tutte le statistiche e ritratto speciale',()=>{
 const awakening=MOVES_DB['Risveglio'];
 assert.equal(awakening.type,'Erba');
 assert.equal(awakening.power,0);
 assert.equal(awakening.target,'self');
 assert.equal(awakening.maxUses,1);
 assert.equal(awakening.strictUses,true);
 assert.equal(awakening.shayminAwakening,true);
 assert.equal(byId('shaymin').moves[3],awakening);
});

test('Cosmo, Iris, Sage e Gardevoir: conversione completa Magico-Folletto',()=>{
 for(const id of ['cosmo','iris','sage','gardevoir']){
  assert.ok(byId(id).types.includes('Folletto'),id);
  assert.ok(!byId(id).types.includes('Magico'),id);
  assert.ok(byId(id).moves.some(move=>move.power>0&&move.type==='Folletto')||
    byId(id).moves.some(move=>move.type==='Folletto'),id);
 }
 assert.equal(byId('cosmo').passive.requiredMoveType,'Folletto');
 assert.ok(byId('cosmo').moves.some(m=>m.name==='Trasformazione Fatata'));
 assert.equal(MOVES_DB['Trasformazione Bizzarra'].type,'Magico','Discord resta inalterato');
 assert.equal(byId('gardevoir').moves.find(m=>m.name==='Schermoluce').type,'Folletto');
 assert.equal(MOVES_DB['Schermoluce'].type,'Magico','Schermoluce condiviso invariato');
 assert.equal(MOVES_DB['Cristallo di Ephedia'].type,'Cristallo');
});
