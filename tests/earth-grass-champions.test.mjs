import test from 'node:test';
import assert from 'node:assert/strict';
import {CHARACTERS} from '../src/data/characters.js';
import {MOVES_DB} from '../src/data/moves.js';
import {CHAR_PRICES} from '../src/data/prices.js';
import {RECENT_ARRIVALS_IDS,recentArrivalCharacters} from '../src/data/recentArrivals.js';
import {ULTIMON_ENTRANCE_LINES} from '../src/systems/ultimonEntranceLines.js';
import {ULTIMON_DUPLICATE_REACTIONS} from '../src/systems/ultimonDuplicateLines.js';
import {MASTERY_CHARACTER_TITLES} from '../src/data/masteryTitles.js';

const NEW_IDS=['tophbeifong','gaara','flygon','flora','leafeon','shaymin'];
const TYPES={
 tophbeifong:['Terra','Roccia'],
 gaara:['Terra','Psico'],
 flygon:['Terra','Drago'],
 flora:['Erba','Folletto'],
 leafeon:['Erba'],
 shaymin:['Erba','Luce']
};

test('Sei nuovi Multimon entrano nel roster normale con doppio tipo equilibrato e PNG individuali',()=>{
 const images=new Set(),allMoves=new Set();
 for(const id of NEW_IDS){
  const list=CHARACTERS.filter(c=>c.id===id);
  assert.equal(list.length,1,id+' deve avere un solo ingresso nel roster');
  const c=list[0];
  assert.deepEqual(c.types,TYPES[id]);
  assert.equal(c.isSummonOnly,undefined);
  assert.equal(c.isCampaignMonster,undefined);
  assert.ok(c.img.startsWith('https://')&&c.img.endsWith('.png'),id+' richiede PNG');
  assert.ok(!images.has(c.img),'PNG condiviso erroneamente per '+id);
  images.add(c.img);
  assert.equal(c.moves.length,4);
  assert.ok(c.moves.every(m=>m&&m.name&&m.type&&m.power!==undefined),id+' deve avere quattro mosse funzionanti');
  for(const m of c.moves){
   assert.equal(MOVES_DB[m.name],m,'mossa non collegata al database: '+m.name);
   assert.ok(!allMoves.has(m.name),'mossa duplicata: '+m.name);
   allMoves.add(m.name);
  }
  for(const t of c.types)assert.ok(!['Lotta','Magico','Normale','Oscuro'].includes(t));
  assert.ok(c.passive?.name&&c.passive?.type&&c.passive?.desc);
  assert.ok(CHAR_PRICES[id]>0);
 }
 assert.equal(allMoves.size,24);
});

test('I sei nuovi arrivi sono i primi nella vetrina del gioco e hanno titolo e intro specifici',()=>{
 assert.deepEqual(RECENT_ARRIVALS_IDS.slice(0,6),NEW_IDS);
 assert.deepEqual(recentArrivalCharacters(CHARACTERS).slice(0,6).map(c=>c.id),NEW_IDS);
 const titles=new Set();
 for(const id of NEW_IDS){
  assert.ok(ULTIMON_ENTRANCE_LINES[id]?.length>15,id+' non ha presentazione');
  assert.ok(ULTIMON_DUPLICATE_REACTIONS[id]?.length>15,id+' non ha reazione al doppione');
  assert.ok(MASTERY_CHARACTER_TITLES[id]?.length>12,id+' non ha titolo Padronanza');
  titles.add(MASTERY_CHARACTER_TITLES[id]);
 }
 assert.equal(titles.size,6);
});

test('Le passive si appoggiano a meccaniche esistenti e le mosse di supporto hanno limiti',()=>{
 const get=id=>CHARACTERS.find(c=>c.id===id);
 assert.deepEqual(get('tophbeifong').passive.selfStatBuff,{def:1.2});
 assert.deepEqual(get('gaara').passive.statBuff,{def:1.25,spd:1.1});
 assert.equal(get('gaara').passive.threshold,.5);
 assert.equal(get('flygon').passive.damageBonus,1.15);
 assert.deepEqual(get('flora').passive.teamStatBuff,{def:1.1});
 assert.equal(get('leafeon').passive.healPercent,.04);
 assert.equal(get('shaymin').passive.healLowestAllyPercent,.04);
 const heal=MOVES_DB['Prato della Rinascita'];
 assert.equal(heal.targetMode,'ally');
 assert.equal(heal.removeNegativeStatuses,true);
 assert.equal(heal.heal,.28);
 assert.equal(heal.strictUses,true);
 assert.equal(heal.maxUses,3);
 for(const name of ['Passo Sismico','Scudo del Kazekage','Danza del Drago delle Dune','Rosa Curativa','Difesa Fogliare']){
  assert.ok(MOVES_DB[name].strictUses);
  assert.ok(MOVES_DB[name].maxUses>=2);
 }
});
