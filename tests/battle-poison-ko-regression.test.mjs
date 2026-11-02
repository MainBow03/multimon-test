import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolvePoisonEndTurn } from '../src/systems/battleStatusTurns.js';

const poison=(hp=100,turns=1)=>({hp,maxHp:100,statuses:[{type:'Avvelenato',turns}]});

test('veleno: il danno aumenta a ogni turno e si ferma al 15%',()=>{
  const c=poison(100,1);
  let d=0;
  let outcome=resolvePoisonEndTurn(c,amount=>{d=amount;c.hp-=amount;});
  assert.equal(d,5);
  assert.deepEqual(outcome,{applied:true,damage:5,progressed:true});
  assert.equal(c.statuses[0].turns,2);
  for(let i=0;i<6;i++){c.hp=100;resolvePoisonEndTurn(c,amount=>c.hp-=amount);}
  assert.equal(c.statuses[0].turns,8);
  assert.equal(resolvePoisonEndTurn({...c,hp:100},()=>{}).damage,15);
  const v=poison(100,3);
  assert.equal(resolvePoisonEndTurn(v,()=>{}).damage,15);
  assert.equal(resolvePoisonEndTurn(poison(100,100),()=>{}).damage,15);
});

test('regressione Cell: un KO da veleno cancella gli status e NON provoca TypeError turns',()=>{
  const c=poison(4,3);
  const result=resolvePoisonEndTurn(c,amount=>{
    assert.equal(amount,15);
    c.hp=0;
    c.statuses=[]; // handleFaint nel vero motore
  });
  assert.equal(c.hp,0);
  assert.deepEqual(c.statuses,[]);
  assert.equal(result.progressed,false);
});

test('una passiva purifica il veleno durante il danno senza farlo riapparire',()=>{
  const c=poison(50,2);
  resolvePoisonEndTurn(c,()=>{c.statuses=[{type:'Scudo Team',turns:2}];});
  assert.deepEqual(c.statuses,[{type:'Scudo Team',turns:2}]);
});

test('una rinascita con status ripuliti non riattiva il veleno pre-KO',()=>{
  const c=poison(4,4);
  resolvePoisonEndTurn(c,()=>{
    c.hp=35; // simulazione passiva di rinascita
    c.statuses=[];
  });
  assert.equal(c.hp,35);
  assert.deepEqual(c.statuses,[]);
});

test('status malformati, personaggi KO o senza veleno non bloccano il turno',()=>{
  assert.equal(resolvePoisonEndTurn(null,()=>{}).applied,false);
  assert.equal(resolvePoisonEndTurn({hp:0,statuses:[{type:'Avvelenato',turns:3}]},()=>{}).applied,false);
  assert.equal(resolvePoisonEndTurn({hp:40,maxHp:100,statuses:[{type:'Scottato',turns:2}]},()=>{}).applied,false);
  const c=poison(70,undefined);
  const result=resolvePoisonEndTurn(c,()=>{});
  assert.equal(result.damage,5);
  assert.equal(c.statuses[0].turns,2);
});

test('calculateTurn usa il resolver invece di un vecchio indice invalidabile dal KO',()=>{
  const source=readFileSync(new URL('../src/systems/battleSystem.js',import.meta.url),'utf8');
  assert.match(source,/const poisonResult = resolvePoisonEndTurn\(char,/);
  assert.doesNotMatch(source,/char\.statuses\[psnIdx\]\.turns/);
  assert.match(source,/const handleFaint =/);
  assert.match(source,/char\.statuses = \[\]/);
});
