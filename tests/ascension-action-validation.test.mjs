import test from 'node:test';
import assert from 'node:assert/strict';
import {CHARACTERS} from '../src/data/characters.js';
import {createRealAscensionBattle,submitRealAscensionActions} from '../src/systems/ascensionRealBattle.js';

const member=id=>{
 const c=CHARACTERS.find(ch=>ch.id===id);
 assert.ok(c,id);
 return {id,level:3,hp:Math.round((c.maxHp||c.hp||100)*.78)};
};
const room=()=>createRealAscensionBattle({
 chars:CHARACTERS,fieldSize:2,
 teamOne:['sonic','luigi','gardevoir','miku'].map(member),
 teamTwo:['finn','sage','marceline','natsu'].map(member)
});
test('Una sostituzione 2v2 non può inserire la stessa riserva in entrambi gli slot',()=>{
 const b=room();
 const once=submitRealAscensionActions(b,'p1',{
  0:{type:'switch',toIdx:2}
 },CHARACTERS);
 assert.equal(once.status,'battling');
 assert.deepEqual(once.actions.p1,{0:{type:'switch',toIdx:2}});
 assert.throws(()=>submitRealAscensionActions(once,'p1',{
  1:{type:'switch',toIdx:2}
 },CHARACTERS),/già stata scelta/);
 assert.equal(once.actions.p1[1],undefined);
 const after=submitRealAscensionActions(once,'p1',{
  1:{type:'switch',toIdx:3}
 },CHARACTERS);
 assert.equal(after.status,'battling');
 assert.deepEqual(after.actions.p1,{
  0:{type:'switch',toIdx:2},1:{type:'switch',toIdx:3}
 });
});
test('Il motore rifiuta target di stanze estranee anziché bloccarsi in calcolo',()=>{
 const b=room();
 const bad={type:'attack',moveIdx:0,targetPlayer:'p3',targetIdx:0};
 assert.throws(()=>submitRealAscensionActions(b,'p1',{0:bad},CHARACTERS),
  /Bersaglio non valido/);
 assert.deepEqual(b.actions.p1,{});
 assert.throws(()=>submitRealAscensionActions(b,'p1',{
  0:{type:'attack',moveIdx:0,
   selectedTargets:[{player:'p2',idx:0},{player:'p7',idx:0}]}
 },CHARACTERS),/Bersagli non validi/);
 assert.deepEqual(b.actions.p1,{});
});
test('Il bersaglio umano del secondo slot p2 resta ammesso',()=>{
 const b=room();
 const action={type:'attack',moveIdx:0,targetPlayer:'p2',
  targetIdx:b.field.p2[1],targetFieldIdx:1};
 const submitted=submitRealAscensionActions(b,'p1',{0:action},CHARACTERS);
 assert.deepEqual(submitted.actions.p1[0],action);
});
