import test from 'node:test';
import assert from 'node:assert/strict';
import {getCollectionEntries} from '../src/systems/collectionRoster.js';

const roster = [
  {id:'free',name:'Gratuito'},
  {id:'shop',name:'Acquistabile',price:200},
  {id:'secret',name:'Speciale',isSecretUnlock:true},
  {id:'summon',name:'Evocazione',isSummonOnly:true},
  {id:'campaign',name:'Boss missione',isCampaignMonster:true,isSecretUnlock:true},
];

test('La collezione elenca solo i personaggi permanenti collezionabili', () => {
  const entries = getCollectionEntries(roster, []);
  assert.deepEqual(entries.map(e => e.character.id), ['free','shop','secret']);
  assert.deepEqual(entries.map(e => e.owned), [true,false,false]);
});

test('Le acquisizioni del profilo sbloccano shop e personaggi speciali', () => {
  const entries = getCollectionEntries(roster, ['shop','secret']);
  assert.deepEqual(entries.map(e => e.owned), [true,true,true]);
});

test('I vecchi profili senza unlockedChars e i dati mancanti sono gestiti', () => {
  assert.deepEqual(getCollectionEntries(roster, undefined).map(e => e.owned), [true,false,false]);
  assert.deepEqual(getCollectionEntries(null, null), []);
});

test('L’anteprima non viene scambiata per uno sblocco permanente', () => {
  const entries = getCollectionEntries(roster, []);
  assert.equal(entries.find(e => e.character.id === 'shop').owned, false);
});
