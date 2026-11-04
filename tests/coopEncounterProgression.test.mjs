import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {initialGameState} from '../src/systems/gameState.js';
import {prepareCoopDraft,coopEnemyTeamForFloor,coopEnemyForFloor,coopEncounterSizeForFloor,nextCoopFloor,finishCoopFloor} from '../src/systems/coopExpedition.js';
import {startBattleImpl} from '../src/systems/battleSystem.js';
import {generateStrategicCpuActions} from '../src/systems/strategicCpu.js';
import {resolveMultiplayerWinner,nextPhaseAfterExecution} from '../src/systems/roomRecovery.js';

const make=(id,hp=100)=>({
  id,name:id,types:['Normale'],hp,maxHp:100,atk:60,def:60,spd:60,
  moves:[{name:'Pugno',power:50,type:'Normale',accuracy:1}]
});
const heroes=['A','B','C','D','E','F','G','H','I'].map(id=>make(id));
const active=['p1','p2','p3','p4'];

function createCoop(floor=1){
 const s=initialGameState();
 s.isRoguelikeCoop=true;s.gameMode='juggernaut';s.status='coop_camp';
 s.settings={...s.settings,teamSize:2,fieldSize:1,juggernautPlayer:'p4',maxPlayers:4};
 s.players={...s.players,p1:'P1',p2:'P2',p3:'P3',p4:'Guardiano'};
 s.isBot={...s.isBot,p4:true};
 s.coopRun={floor,maxFloor:50,coins:50,encounteredEnemies:[],relics:[],nextBattlePower:1};
 s.teams.p1=[make('A'),make('B')];s.teams.p2=[make('C'),make('D')];
 s.teams.p3=[make('E'),make('F')];s.teams.p4=[make('G',0)];
 s.field.p1=[0];s.field.p2=[0];s.field.p3=[0];s.field.p4=[];
 return s;
}

test('Progressione completa: 2 avversari, poi 3, poi boss unico ogni 10 piani',()=>{
 for(let floor=1;floor<=50;floor++){
  const expected=floor%10===0?1:floor%10<=4?2:3;
  assert.equal(coopEncounterSizeForFloor(floor),expected,'piano '+floor);
  const foes=coopEnemyTeamForFloor(floor,heroes,3,[],()=>0);
  assert.equal(foes.length,expected,'numero avversari al piano '+floor);
  assert.equal(new Set(foes.map(c=>c.id)).size,expected,'non duplicare il nemico nello stesso piano');
  assert.ok(foes.every(c=>c.hp>0&&c.hp===c.maxHp),'nemici vitali');
  assert.ok(foes.every(c=>c.isCoopBoss===(expected===1)),'solo i boss hanno l’aura da boss');
 }
 assert.equal(coopEncounterSizeForFloor(0),0);
 assert.equal(coopEncounterSizeForFloor(51),0);
});

test('I nemici normali diventano più forti progressivamente, ma ciascuno è più leggero del vecchio guardiano',()=>{
 for(const count of [2,3]){
  const floor=count===2?1:5;
  const single=coopEnemyForFloor(floor,heroes,3,[],()=>0);
  const group=coopEnemyTeamForFloor(floor,heroes,3,[],()=>0);
  assert.equal(group.length,count);
  for(const enemy of group){
   assert.ok(enemy.maxHp<single.maxHp,'ogni nemico normale ha meno PS del guardiano singolo');
   assert.ok(enemy.atk<single.atk,'ogni nemico normale ha meno attacco');
  }
 }
 const f1=coopEnemyForFloor(1,heroes,3,[],()=>0);
 const f2=coopEnemyForFloor(2,heroes,3,[],()=>0);
 const f9=coopEnemyForFloor(9,heroes,3,[],()=>0);
 assert.ok(f2.maxHp>=f1.maxHp && f9.maxHp>f2.maxHp);
 assert.ok(f9.atk>=f1.atk);
 const b10=coopEnemyForFloor(10,heroes,3,[],()=>0);
 const b20=coopEnemyForFloor(20,heroes,3,[],()=>0);
 const b50=coopEnemyForFloor(50,heroes,3,[],()=>0);
 assert.ok(b20.maxHp>b10.maxHp);
 assert.ok(b50.maxHp>b20.maxHp);
});

test('Nuovo piano: p4 schiera tutti i 2/3 bersagli, ciascuno riceve una mossa CPU',()=>{
 for(const [floor,count] of [[2,2],[5,3],[9,3],[10,1],[15,3],[30,1],[50,1]]){
  const room=createCoop(floor);
  const next=nextCoopFloor(room,heroes,null,()=>0);
  assert.deepEqual(next.field.p4,Array.from({length:count},(_,i)=>i));
  assert.equal(next.teams.p4.length,count);
  assert.deepEqual(next.field.p1,[0]);assert.deepEqual(next.field.p2,[0]);assert.deepEqual(next.field.p3,[0]);
  assert.equal(next.teams.p1.length,2,'ogni giocatore ha la riserva personale');
  const state={...room,...next,status:'battling'};
  const choices=generateStrategicCpuActions({
   room:state,player:'p4',activePlayers:active,appMode:'online_room',
   random:()=>.15,getMultiplier:()=>1
  });
  assert.equal(Object.keys(choices).length,count,'tutti i nemici possono attaccare al piano '+floor);
  for(const [idx,action] of Object.entries(choices)){
   assert.ok(next.field.p4.includes(Number(idx)));
   assert.equal(action.type,'attack');
   assert.ok(['p1','p2','p3'].includes(action.targetPlayer));
  }
 }
});

test('La prima battaglia ha due avversari realmente attivi, non soltanto due PNG',()=>{
 const room=createCoop(1);
 room.status='lobby';
 const draft=prepareCoopDraft(room,heroes,()=>0);
 assert.equal(draft.draft.p4.length,2);
 const prepared={...room,...draft};
 for(const p of ['p1','p2','p3'])prepared.draft[p]=room.teams[p];
 let patch=null;
 startBattleImpl({gameState:prepared,appMode:'online_room',
  applyOnEnterPassive:()=>{},getRequiredPlayers:()=>4,
  matchStartTimeRef:{current:null},playerName:'',
  setCombatLog:()=>{},setCommandingIdx:()=>{},setIsLogOpen:()=>{},
  setPlayerRole:()=>{},updateLocalStats:()=>{},
  updateState:p=>{patch=p}});
 assert.equal(patch.status,'pre_battle');
 assert.deepEqual(patch.field.p4,[0,1]);
 for(const p of ['p1','p2','p3'])assert.deepEqual(patch.field[p],[0]);
});

test('Il piano è vinto solo dopo avere sconfitto TUTTI i nemici del gruppo',()=>{
 const room={...createCoop(5),...nextCoopFloor(createCoop(5),heroes,null,()=>0)};
 room.status='executing';room.postExecStatus='battling';
 assert.equal(room.teams.p4.length,3);
 room.teams.p4[0].hp=0;room.field.p4=[1,2];
 assert.equal(resolveMultiplayerWinner(room,active),null,'un solo KO non deve concludere il piano');
 assert.equal(nextPhaseAfterExecution(room,active).status,'battling');
 room.teams.p4[1].hp=0;room.field.p4=[2];
 assert.equal(resolveMultiplayerWinner(room,active),null);
 room.teams.p4[2].hp=0;room.field.p4=[];
 const win=resolveMultiplayerWinner(room,active);
 assert.equal(win,'P1 & P2 & P3');
 const phase=nextPhaseAfterExecution(room,active);
 assert.equal(phase.status,'gameover');
 assert.equal(phase.winner,win);
 const rewards=finishCoopFloor({...room,status:'gameover',winner:win},heroes,()=>.99);
 assert.equal(rewards.coopRun.floor,6);
 assert.equal(rewards.coopRun.lastClearFloor,5);
});

test('L’interfaccia pre-battaglia mostra tutti i PNG e la scelta bersaglio usa field.p4',()=>{
 const pre=readFileSync(new URL('../src/screens/battle/PreBattleView.jsx',import.meta.url),'utf8');
 const ui=readFileSync(new URL('../src/screens/battle/BattlingView.jsx',import.meta.url),'utf8');
 const engine=readFileSync(new URL('../src/systems/battleSystem.js',import.meta.url),'utf8');
 assert.match(pre,/enemyFighters\.map/);
 assert.match(pre,/object-contain/);
 assert.match(ui,/currentField\[p\]\?\.map/);
 assert.match(ui,/handleSelectMoveTarget/);
 assert.match(engine,/activeSlots=p===juggPlayer/);
});
