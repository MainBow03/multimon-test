import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initialGameState } from '../src/systems/gameState.js';
import { handleJoinRoomImpl, commitReplacementChoiceImpl } from '../src/systems/multiplayerSystem.js';
import { ROOM_SESSION_KEY, roomRoleForUid, recoverableLegacyRole,
 findJoinableSlot, getRequiredSwitches, prepareEmergencySwitch, resolveSwitchingRoom,
 nextPhaseAfterExecution, resolveMultiplayerWinner, canRecoverRoom,
 isHostFresh, phaseIsStale } from '../src/systems/roomRecovery.js';

// I test node non hanno il localStorage del browser.
globalThis.localStorage ??= {getItem:()=>null,setItem:()=>{},removeItem:()=>{}};
const now=1_800_000_000_000;
const char=(id,hp=100,extra={})=>({id,name:id,hp,maxHp:100,types:['Normale'],
 atk:80,def:80,spd:80,statuses:[],moves:[],...extra});
function multi(){
 const r=initialGameState();
 r.gameMode='multipla';r.status='battling';
 for(const p of ['p1','p2','p3','p4']){
   r.players[p]='Player '+p;
   r.teams[p]=[char('fighter-'+p),char('bench-'+p)];
   r.field[p]=[0];r.isBot[p]=false;
 }
 return r;
}
function deadAllyRoom(){
 const r=multi();r.teams.p1[0].hp=0;r.teams.p2[0].hp=0;
 r.field.p1=[];r.field.p2=[];return r;
}
function firestoreMock(room){
 const state=structuredClone(room),updates=[];
 const apply=(patch)=>{
   for(const [key,value] of Object.entries(patch)){
     if(key.includes('.')){
       const parts=key.split('.');let obj=state;
       for(let i=0;i<parts.length-1;i++)obj=obj[parts[i]]??={};
       obj[parts.at(-1)]=structuredClone(value);
     }else state[key]=structuredClone(value);
   }
   updates.push(patch);
 };
 const tx={get:async()=>({exists:()=>true,data:()=>structuredClone(state)}),
   update:(ref,patch)=>apply(patch)};
 return {state,updates,db:{},doc:()=>({id:'ABCDE'}),
  runTransaction:async(db,work)=>work(tx)};
}
test('Stanze online: il proprietario recupera lo slot anche con stanza piena e partita già avviata',async()=>{
 const r=multi();r.status='lobby';
 r.playerUids.p1='owner-uid';r.playerUids.p2='user-2';
 const f=firestoreMock(r);let role=null,mode=null,alert='';
 const context={...f,appId:'test',getPlayerData:()=>({inventory:{}}),
  getRequiredPlayers:()=>4,playerAvatarUrl:'photo',playerName:'Nome cambiato',
  roomIdInput:'abcde',setAppMode:v=>mode=v,setCoopRoomId:()=>{},
  setPlayerRole:v=>role=v,setRoomId:()=>{},setSystemAlert:v=>alert=v,
  user:{uid:'user-2'}};
 f.state.status='battling';
 await handleJoinRoomImpl(context);
 assert.equal(role,'p2');
 assert.equal(mode,'online_room');
 assert.equal(f.state.players.p2,'Player p2','rientro non deve sovrascrivere il nome e la squadra');
 assert.equal(f.state.teams.p2[0].id,'fighter-p2');
 assert.match(alert,/Rientro riuscito/);
});
test('Nuovi ingressi mid-battle rifiutati; due ospiti non occupano lo stesso slot',async()=>{
 const r=initialGameState();r.status='lobby';r.gameMode='multipla';
 r.players.p1='Host';r.playerUids.p1='owner';
 const f=firestoreMock(r);
 for(const [uid,name] of [['a','Alice'],['b','Barbara']]){
  let role=null;
  await handleJoinRoomImpl({...f,appId:'test',getPlayerData:()=>({inventory:{}}),
   getRequiredPlayers:()=>4,playerAvatarUrl:'',playerName:name,roomIdInput:'ABCDE',
   setAppMode:()=>{},setCoopRoomId:()=>{},setPlayerRole:v=>role=v,
   setRoomId:()=>{},setSystemAlert:()=>{},user:{uid}});
  assert.equal(role,uid==='a'?'p2':'p3');
 }
 f.state.status='battling';
 let error='';
 await handleJoinRoomImpl({...f,appId:'test',getPlayerData:()=>({inventory:{}}),
  getRequiredPlayers:()=>4,playerAvatarUrl:'',playerName:'Intruso',roomIdInput:'ABCDE',
  setAppMode:()=>{},setCoopRoomId:()=>{},setPlayerRole:()=>{},
  setRoomId:()=>{},setSystemAlert:v=>error=v,user:{uid:'intruder'}});
 assert.match(error,/già iniziata/);
 assert.equal(f.state.playerUids.p4,null);
});
test('Rientro legacy consentito solo con sessione e nome della stessa persona',()=>{
 const room=multi();delete room.playerUids;
 const session={appMode:'online_room',roomId:'ROOM1',playerRole:'p2'};
 assert.equal(recoverableLegacyRole(room,session,'ROOM1','Player p2','u2'),'p2');
 assert.equal(recoverableLegacyRole(room,session,'ROOM1','Impostore','u2'),null);
 assert.equal(recoverableLegacyRole(room,{...session,playerUid:'other'},'ROOM1','Player p2','u2'),null);
 assert.equal(recoverableLegacyRole(room,session,'ROOM2','Player p2','u2'),null);
});
test('Multipla 2v2: due alleate perdono un Multimon, entrambe devono sostituirlo',()=>{
 const r=deadAllyRoom();
 const needs=getRequiredSwitches(r,['p1','p2','p3','p4']);
 assert.equal(needs.need.p1,1);assert.equal(needs.need.p2,1);
 assert.equal(needs.need.p3,0);assert.equal(needs.need.p4,0);
 const fix=prepareEmergencySwitch(r,['p1','p2','p3','p4'],now);
 assert.equal(fix.status,'switching_phase');
 assert.deepEqual(fix.pendingSwitches,{p1:1,p2:1,p3:0,p4:0,p5:0,p6:0,p7:0,p8:0});
 const inSwitch={...r,...fix};
 const waiting=resolveSwitchingRoom(inSwitch,['p1','p2','p3','p4'],now);
 assert.equal(waiting.kind,'waiting');
 inSwitch.switchActions.p1=[1];inSwitch.switchActions.p2=[1];
 const complete=resolveSwitchingRoom(inSwitch,['p1','p2','p3','p4'],now);
 assert.equal(complete.kind,'resolved');
 assert.deepEqual(complete.patch.field.p1,[1]);
 assert.deepEqual(complete.patch.field.p2,[1]);
 assert.deepEqual(complete.patch.field.p3,[0]);
 assert.deepEqual(complete.patch.field.p4,[0]);
 assert.equal(complete.patch.postExecStatus,'battling');
 const advanced=nextPhaseAfterExecution({...inSwitch,...complete.patch},['p1','p2','p3','p4'],now+1000);
 assert.equal(advanced.status,'battling');
});
test('Forzare sostituzioni non inserisce KO e non sottrae il turno a chi ha già scelto',()=>{
 const r=deadAllyRoom();r.status='switching_phase';
 r.switchActions.p1=[1];r.switchActions.p2=[];
 const x=resolveSwitchingRoom(r,['p1','p2','p3','p4'],now,true);
 assert.equal(x.kind,'resolved');
 assert.equal(x.patch.field.p1[0],1);
 assert.equal(x.patch.field.p2[0],1);
 assert.equal(x.patch.teams.p1[0].hp,0);
});
test('Scelte di due giocatrici salvate in due campi atomici separati',async()=>{
 const r=deadAllyRoom();r.status='switching_phase';
 r.playerUids.p1='u1';r.playerUids.p2='u2';
 const f=firestoreMock(r);const errors=[];
 const choose=(role,uid)=>commitReplacementChoiceImpl({
  ...f,appMode:'online_room',appId:'test',roomId:'ABCDE',
  playerRole:role,user:{uid},gameState:f.state,
  setSystemAlert:m=>errors.push(m),updateState:()=>Promise.resolve()
 },1);
 await choose('p1','u1');await choose('p2','u2');
 assert.deepEqual(f.state.switchActions.p1,[1]);assert.deepEqual(f.state.switchActions.p2,[1]);
 assert.equal(errors.length,0);
});
test('Nessun personaggio e nessuna riserva: la lotta multipla si conclude',()=>{
 const r=deadAllyRoom();r.teams.p1[1].hp=0;r.teams.p2[1].hp=0;
 assert.equal(getRequiredSwitches(r,['p1','p2','p3','p4']).any,false);
 const fix=prepareEmergencySwitch(r,['p1','p2','p3','p4'],now);
 assert.equal(fix.status,'gameover');
 assert.equal(fix.winner,'Player p3');
});
test('Campi con evocazioni vive mantengono gli alleati evocati senza usarli come riserve',()=>{
 const r=multi();r.teams.p1.push(char('summon',80,{isSummonOnly:true}));
 r.field.p1=[0,2];
 const need=getRequiredSwitches(r,['p1']);
 assert.deepEqual(need.field.p1,[0,2]);
 assert.equal(need.need.p1,0);
});
test('Guest non può guidare la stanza mentre host presente; takeover solo dopo 45 secondi',()=>{
 const r=multi();r.hostHeartbeatAt=now-15000;
 assert.equal(isHostFresh(r,now),true);
 assert.equal(canRecoverRoom(r,'p2',now),false);
 assert.equal(canRecoverRoom(r,'spectator',now),false);
 assert.equal(canRecoverRoom(r,'p1',now),true);
 r.hostHeartbeatAt=now-46000;
 assert.equal(canRecoverRoom(r,'p2',now),true);
 assert.equal(phaseIsStale({...r,phaseStartedAt:now-130000},now),true);
 assert.equal(phaseIsStale({...r,phaseStartedAt:now-5000},now),false);
});
test('Al refresh stesso account conserva la sessione e non sovrascrive il turno online',()=>{
 const acct=readFileSync(new URL('../src/components/AccountGate.jsx',import.meta.url),'utf8');
 const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
 const battle=readFileSync(new URL('../src/systems/battleSystem.js',import.meta.url),'utf8');
 assert.ok(acct.includes('stored.playerUid===uid'));
 assert.ok(app.includes('playerUid: user?.uid||null'));
 assert.ok(app.includes('roomRoleForUid')===false||app.includes('playerUids?.[playerRole]'));
 assert.ok(app.includes('playbackKeyRef.current===key'));
 assert.ok(app.includes('advanceOnlinePhase(gameState.phaseStartedAt)')||battle.includes('advanceOnlinePhase(gameState.phaseStartedAt)'));
 assert.ok(battle.includes('prepareEmergencySwitch(gameState'));
});
