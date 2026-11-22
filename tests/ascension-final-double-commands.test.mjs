import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {
 createRealAscensionBattle,submitRealAscensionActions
} from '../src/systems/ascensionRealBattle.js';
import {
 ascensionNextCommandPosition,ascensionCommandProgress
} from '../src/systems/ascensionDoubleCommands.js';

const member=id=>{
 const c=CHARACTERS.find(ch=>ch.id===id);
 assert.ok(c,'Personaggio non presente: '+id);
 return {id,level:2,hp:Math.max(10,Math.round((c.maxHp||c.hp||100)*.74))};
};
const newFinal=()=>createRealAscensionBattle({
 chars:CHARACTERS,
 teamOne:['sonic','luigi','gardevoir'].map(member),
 teamTwo:['finn','miku','sage'].map(member),
 firstName:'Giocatore',secondName:'CPU Nilo',fieldSize:2
});
const attack=(room,side,teamIdx)=>{
 const fighter=room.teams[side][teamIdx];
 const idx=fighter.moves.findIndex(m=>m&&m.power>0);
 assert.ok(idx>=0);
 return {type:'attack',moveIdx:idx,targetPlayer:side==='p1'?'p2':'p1',
  targetIdx:room.field[side==='p1'?'p2':'p1'][0],targetFieldIdx:0};
};

test('Finale doppia: primo e secondo Multimon hanno un cursore diverso e conferme indipendenti',()=>{
 let room=newFinal();
 const first=attack(room,'p1',0);
 assert.equal(ascensionNextCommandPosition(room,'p1'),0);
 room=submitRealAscensionActions(room,'p1',{0:first},CHARACTERS);
 assert.equal(room.status,'battling');
 assert.deepEqual(room.actions.p1,{0:first});
 assert.deepEqual(ascensionCommandProgress(room,'p1'),{ready:1,total:2,next:1});
 assert.equal(ascensionNextCommandPosition(room,'p1'),1);
 const second=attack(room,'p1',1);
 room=submitRealAscensionActions(room,'p1',{0:first,1:second},CHARACTERS);
 assert.equal(room.status,'battling','La CPU avversaria deve ancora inviare le mosse');
 assert.deepEqual(room.actions.p1,{0:first,1:second});
 assert.deepEqual(ascensionCommandProgress(room,'p1'),{ready:2,total:2,next:-1});
 assert.equal(ascensionNextCommandPosition(room,'p1'),-1);
});

test('Un vecchio comando incluso nel payload NON annulla la mossa del secondo Multimon',()=>{
 let room=newFinal();
 const first=attack(room,'p1',0);
 room=submitRealAscensionActions(room,'p1',{0:first},CHARACTERS);
 const second=attack(room,'p1',1);
 const staleFirst={...first,moveIdx:Math.min(first.moveIdx+1,room.teams.p1[0].moves.length-1)};
 assert.notDeepEqual(staleFirst,first);
 room=submitRealAscensionActions(room,'p1',{0:staleFirst,1:second},CHARACTERS);
 assert.deepEqual(room.actions.p1[0],first,
  'Il primo comando salvato non deve essere sovrascritto');
 assert.deepEqual(room.actions.p1[1],second,
  'Il secondo comando va registrato, senza errore Comando già confermato');
 assert.equal(room.status,'battling');
 const repeated=submitRealAscensionActions(room,'p1',{0:staleFirst},CHARACTERS);
 assert.equal(repeated,room,'Ritrasmissione identica o obsoleta idempotente');
});

test('I due comandi del giocatore e i due dell avversario eseguono un solo turno classico',()=>{
 let room=newFinal();
 const a=attack(room,'p1',0),b=attack(room,'p1',1);
 room=submitRealAscensionActions(room,'p1',{0:a},CHARACTERS);
 room=submitRealAscensionActions(room,'p1',{0:a,1:b},CHARACTERS);
 const c=attack(room,'p2',0),d=attack(room,'p2',1);
 room=submitRealAscensionActions(room,'p2',{0:c},CHARACTERS);
 assert.equal(room.status,'battling');
 room=submitRealAscensionActions(room,'p2',{0:c,1:d},CHARACTERS);
 assert.equal(room.status,'executing');
 assert.ok(room.events.some(e=>e.type==='battle_actor'),
  'Il motore di Multimon genera gli eventi di combattimento');
 assert.ok(room.battleReport.turns>=1);
 assert.deepEqual(room.actions.p1,{});
 assert.deepEqual(room.actions.p2,{});
});

test('Cursore: usa la posizione nel campo anche con indice squadra 2, e ignora i KO',()=>{
 const room=newFinal();
 room.field.p1=[0,2];
 assert.equal(ascensionNextCommandPosition(room,'p1'),0);
 room.actions.p1={0:attack(room,'p1',0)};
 assert.equal(ascensionNextCommandPosition(room,'p1'),1);
 room.teams.p1[2].hp=0;
 assert.equal(ascensionNextCommandPosition(room,'p1'),-1);
 room.status='executing';
 assert.equal(ascensionNextCommandPosition(room,'p1'),-1);
});

test('La UI non mostra la seconda mossa finché Firestore non ha confermato la prima',()=>{
 const jsx=readFileSync(new URL('../src/screens/battle/AscensionClassicBattle.jsx',import.meta.url),'utf8');
 assert.match(jsx,/ascensionNextCommandPosition\(native,side\)/);
 assert.match(jsx,/const \[awaitingAction,setAwaitingAction\]=useState\(null\)/);
 assert.match(jsx,/awaitingAction\|\|commandingIdx<0/);
 assert.match(jsx,/native\.actions\?\.\[awaitingAction\.side\]\?\.\[awaitingAction\.teamIdx\]!==undefined/);
 assert.match(jsx,/setAwaitingAction\(\{side,teamIdx,phase\}\)/);
 assert.match(jsx,/onAction\('native-commit'/);
});
