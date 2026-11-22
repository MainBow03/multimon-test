import test from 'node:test';
import assert from 'node:assert/strict';
import {CHARACTERS} from '../src/data/characters.js';
import {MOVES_DB} from '../src/data/moves.js';
import {HYPER_BONUS_MOVES,hyperPreviewMoves} from '../src/systems/hyperPreview.js';
import {
 createRealAscensionBattle,realAscensionSelectedMove,
 submitRealAscensionActions
} from '../src/systems/ascensionRealBattle.js';

function roomFor(heroId){
 const char=CHARACTERS.find(c=>c.id===heroId);
 const enemy=CHARACTERS.find(c=>c.id==='sonic');
 assert.ok(char&&enemy);
 const hp=c=>Math.max(10,Math.round((c.maxHp||c.hp||100)*.78));
 return createRealAscensionBattle({
  chars:CHARACTERS,
  teamOne:[{id:heroId,level:3,hp:hp(char)}],
  teamTwo:[{id:'sonic',level:3,hp:hp(enemy)}],
  fieldSize:1,firstName:'Giocatore',secondName:'Avversario'
 });
}
function action(idx,hyperize=false,targetPlayer='p2'){
 return {type:'attack',moveIdx:idx,
  ...(hyperize?{hyperize:true}:{}),
  targetPlayer,targetIdx:0,targetFieldIdx:0};
}
test('Una mossa Iper nuova deve essere convalidata come nel menu classico',()=>{
 for(const id of ['gardevoir','luigi','miku','coraline','finn','sage']){
  const room=roomFor(id),character=room.teams.p1[0];
  const preview=hyperPreviewMoves(character,true,MOVES_DB);
  const baseCount=character.moves.length;
  assert.ok(preview.length>baseCount,'Nessuna mossa Iper in anteprima per '+id);
  for(let index=baseCount;index<preview.length;index++){
   const selected=realAscensionSelectedMove(room,'p1',0,action(index,true));
   assert.equal(selected?.name,preview[index].name,id);
   assert.equal(realAscensionSelectedMove(room,'p1',0,action(index,false)),null,
    'Senza Iper la mossa extra non è giocabile: '+id);
  }
 }
});
test('Una vera mossa Iper anticipata viene eseguita dal motore originale (Luigi e Miku)',()=>{
 for(const id of ['luigi','miku','gardevoir','coraline','finn']){
  const b=roomFor(id);
  const char=b.teams.p1[0];
  const index=char.moves.length;
  const preview=hyperPreviewMoves(char,true,MOVES_DB);
  assert.ok(preview[index],id+' preview');
  const afterPlayer=submitRealAscensionActions(b,'p1',
   {0:action(index,true)},CHARACTERS);
  assert.equal(afterPlayer.status,'battling',id);
  assert.equal(afterPlayer.actions.p1[0].hyperize,true,id);
  const afterTurn=submitRealAscensionActions(afterPlayer,'p2',
   {0:action(0,false,'p1')},CHARACTERS);
  assert.equal(afterTurn.status,'executing',id);
  assert.equal(afterTurn.teams.p1[0].isHyper,true,id);
  assert.equal(afterTurn.hyperUsed.p1,true,id);
  assert.equal(afterTurn.teams.p1[0].moves[index]?.name,preview[index].name,
   'La mossa Iper deve essere stata aggiunta PRIMA della coda turni: '+id);
  assert.ok(afterTurn.events.some(e=>e.type==='hyper_transform'),id);
  assert.ok(afterTurn.events.some(e=>String(e.text||'').includes(preview[index].name)),
   'Il gioco deve mostrare la mossa Iper: '+id);
 }
});
test('Indice errato non scrive azioni e non blocca la stanza: è possibile riprovare',()=>{
 const b=roomFor('luigi');
 const extraIndex=b.teams.p1[0].moves.length;
 assert.throws(()=>submitRealAscensionActions(b,'p1',
  {0:action(extraIndex,false)},CHARACTERS),/Mossa non disponibile/);
 assert.equal(b.status,'battling');
 assert.equal(Object.keys(b.actions.p1||{}).length,0);
 const retry=submitRealAscensionActions(b,'p1',
  {0:action(extraIndex,true)},CHARACTERS);
 assert.equal(retry.actions.p1[0].moveIdx,extraIndex);
 assert.equal(retry.actions.p1[0].hyperize,true);
 assert.equal(retry.status,'battling');
});
