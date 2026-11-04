import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initialGameState } from '../src/systems/gameState.js';
import { prepareCoopDraft, isCoopDraftReady, coopEncounterSizeForFloor } from '../src/systems/coopExpedition.js';
import { handleConfirmLeaveImpl } from '../src/systems/multiplayerSystem.js';

const createHero = id => ({
  id, name: id, types: ['Normale'], maxHp: 100, hp: 100,
  atk: 50, def: 50, spd: 50, moves: [{name: 'Colpo', type: 'Normale', power: 40}]
});
const roster = ['a','b','c','d','e','f'].map(createHero);
function coopRoom(three = false) {
  const room = initialGameState();
  room.isRoguelikeCoop = true;
  room.status = 'lobby';
  room.players = {...room.players, p1: 'Uno', p2: 'Due', p3: three ? 'Tre' : null, p4: 'Guardiano'};
  room.isBot = {...room.isBot, p4: true};
  room.coopRun = {...room.coopRun, floor: 1};
  return room;
}

for(const three of [false,true]) {
  test('Co-op '+(three?'3':'2')+' giocatori: il vero draft con 2 nemici è pronto e avviabile', () => {
    const room=coopRoom(three);
    const draft=prepareCoopDraft(room,roster,()=>0.1);
    assert.equal(draft.draft.p4.length,2);
    const result={...room,...draft};
    for(const p of three?['p1','p2','p3']:['p1','p2'])
      result.draft[p]=[roster[0],roster[1]];
    assert.equal(isCoopDraftReady(result),true);
    result.draft.p4=[result.draft.p4[0]];
    assert.equal(isCoopDraftReady(result),false,'Un solo nemico non è più valido al piano 1');
  });
}

test('Draft incompleto non può avviarsi, ma vecchie stanze con uno starter rimangono compatibili', () => {
  const room=coopRoom();
  const result={...room,...prepareCoopDraft(room,roster,()=>0.2)};
  result.draft.p1=[roster[0],roster[1]];
  result.draft.p2=[roster[2]];
  assert.equal(isCoopDraftReady(result),false);
  result.settings.teamSize=1;
  result.draft.p1=[roster[0]];
  assert.equal(isCoopDraftReady(result),true);
  assert.equal(coopEncounterSizeForFloor(1),2);
});

test('App utilizza il validatore condiviso e monta un Error Boundary prima di AccountGate', () => {
  const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
  assert.match(app,/if\(!isCoopDraftReady\(room\)\)/);
  assert.match(app,/<AppErrorBoundary><AccountGate><App \/><\/AccountGate><\/AppErrorBoundary>/);
  assert.doesNotMatch(app,/\(room\.draft\?\.p4\|\|\[\]\)\.length!==1/);
});

test('Il click Esci legge la stanza attuale in transazione, non il vecchio gameState', async () => {
  const server=initialGameState();
  server.status='battling';server.gameMode='multipla';
  server.players={...server.players,p1:'Uno',p2:'Due',p3:'Tre',p4:'Quattro'};
  server.playerUids={...server.playerUids,p1:'uid1',p2:'uid2'};
  server.teams={...server.teams,p1:[createHero('a')],p2:[createHero('b')],p3:[createHero('c')],p4:[createHero('d')]};
  server.field={...server.field,p1:[0],p2:[0],p3:[0],p4:[0]};
  server.actions={...server.actions,p1:{},p2:{0:{type:'attack',moveIdx:3}}};
  const stale=structuredClone(server);
  stale.actions.p2={};
  let patch,returnedToMenu=false,errorMessage;
  await handleConfirmLeaveImpl({
    appMode:'online_room',gameState:stale,appId:'test',db:{},doc:()=>({}),
    roomId:'ABCDE',user:{uid:'uid1'},playerRole:'p1',
    setShowLeaveConfirm:()=>{},setSystemAlert:v=>{errorMessage=v},
    runTransaction:async (_db,cb)=>cb({
      get:async()=>({exists:()=>true,data:()=>server}),
      update:(_ref,update)=>{patch=update}
    }),
    leaveRoom:()=>{returnedToMenu=true}
  });
  assert.equal(errorMessage,undefined);
  assert.equal(returnedToMenu,true);
  assert.equal(patch['teams.p1'][0].hp,0);
  assert.ok(!Object.hasOwn(patch,'actions.p2'),'Deve preservare la mossa arrivata dopo lo snapshot locale');
  assert.ok(!Object.hasOwn(patch,'teams'),'Non può sostituire l’intero contenitore');
});

test('Transazione fallita: mostra errore e non abbandona erroneamente la stanza', async () => {
  let left=false,alert;
  const server=initialGameState();server.status='battling';
  await handleConfirmLeaveImpl({
    appMode:'online_room',gameState:server,user:{uid:'wrong'},roomId:'ABCD',
    playerRole:'p1',setShowLeaveConfirm:()=>{},setSystemAlert:e=>{alert=e},
    runTransaction:async()=>{throw new Error('connessione persa')},
    leaveRoom:()=>{left=true},
    doc:()=>({}),db:{},appId:'test'
  });
  assert.equal(left,false);
  assert.match(alert,/connessione persa/);
});
