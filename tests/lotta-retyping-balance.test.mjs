import test from 'node:test';
import assert from 'node:assert/strict';

import {CHARACTERS} from '../src/data/characters.js';
import {MOVES_DB} from '../src/data/moves.js';
import {FIVE_NEW_MOVES} from '../src/data/fiveNewChampions.js';

const REBALANCED=[
  {id:'laxus',types:['Elettro','Drago'],move:'Combo Fairy Tale',moveType:'Drago'},
  {id:'perla',types:['Luce','Cristallo'],move:'Danza delle Lame',moveType:'Cristallo'},
  {id:'garnet',types:['Roccia','Cristallo'],move:'Pugno Razzo',moveType:'Cristallo'},
  {id:'clover',types:['Folletto','Robot'],move:'Tacco a Reazione',moveType:'Robot'},
  {id:'yugo',types:['Psico','Luce'],move:'Danza Eliatrope',moveType:'Luce'},
  {id:'jake',types:['Magico','Folletto'],move:'Pugno Elastico',moveType:'Folletto'}
];

const byId=id=>CHARACTERS.find(c=>c.id===id);

test('Sei Multimon cambiano solo tipo, mantenendo nomi e identita delle mosse',()=>{
  for(const {id,types,move,moveType} of REBALANCED){
    const matches=CHARACTERS.filter(c=>c.id===id);
    assert.equal(matches.length,1, id+' univoco');
    const char=matches[0];
    assert.deepEqual(char.types,types,id+' nuovi tipi');
    assert.equal(char.moves.length,4,id+' moveset intatto');
    const attack=char.moves.find(m=>m.name===move);
    assert.ok(attack,id+' conserva '+move);
    assert.equal(attack.type,moveType,move+' diventa STAB');
    assert.ok(types.includes(attack.type),id+' tipo della mossa deve essere uno STAB');
    const canonical=id==='clover'?FIVE_NEW_MOVES[move]:MOVES_DB[move];
    assert.equal(attack,canonical,id+' mantiene la voce originale della mossa');
  }
});

test('Le vecchie mosse Lotta mantengono potenze ed effetti',()=>{
  assert.deepEqual(MOVES_DB['Combo Fairy Tale'].multiHit,{min:2,max:5});
  assert.deepEqual(MOVES_DB['Danza delle Lame'].multiHit,{min:2,max:4});
  assert.equal(MOVES_DB['Danza delle Lame'].speedScaling,true);
  assert.equal(MOVES_DB['Pugno Razzo'].power,85);
  assert.equal(MOVES_DB['Pugno Razzo'].statusEffect.chance,.2);
  assert.deepEqual(MOVES_DB['Danza Eliatrope'].multiHit,{min:2,max:3});
  assert.equal(MOVES_DB['Pugno Elastico'].targetCount,2);
  assert.equal(FIVE_NEW_MOVES['Tacco a Reazione'].priority,1);
  assert.equal(FIVE_NEW_MOVES['Tacco a Reazione'].power,78);
});

test('Chat Noir e le sue mosse di tipo Lotta restano invariati',()=>{
  assert.deepEqual(byId('chatnoir').types,['Buio','Lotta']);
  assert.equal(byId('chatnoir').moves.find(m=>m.name==='Bastone Estendibile').type,'Lotta');
  assert.equal(MOVES_DB['Bastone Estendibile'].type,'Lotta');
});

test('Il riequilibrio riduce Lotta di 6 senza aumentare il roster',()=>{
  const roster=CHARACTERS.filter(c=>!c.isSummonOnly&&!c.isCampaignMonster);
  assert.equal(roster.length,209);
  const count=type=>roster.filter(c=>c.types.includes(type)).length;
  assert.equal(count('Lotta'),28);
  assert.equal(count('Drago'),12);
  assert.equal(count('Cristallo'),11);
  assert.equal(count('Robot'),22); // Etichetta pubblica: Acciaio
  assert.equal(count('Luce'),16);
  assert.equal(count('Folletto'),14);
});
