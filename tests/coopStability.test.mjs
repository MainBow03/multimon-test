import test from 'node:test';
import assert from 'node:assert/strict';
import {initialGameState} from '../src/systems/gameState.js';
import {
  prepareCoopDraft,finishCoopFloor,nextCoopFloor,
  voteCoopEvent,coopCampPurchase,finalizeCoopEvent
} from '../src/systems/coopExpedition.js';
import {
  resolveMultiplayerWinner,prepareEmergencySwitch,
  resolveSwitchingRoom,nextPhaseAfterExecution,
  canRecoverRoom
} from '../src/systems/roomRecovery.js';
import {canSubmitCoopAction,canCommitCoopTurn} from '../src/systems/coopTurnGuards.js';
import {startBattleImpl} from '../src/systems/battleSystem.js';

const clone = x => structuredClone(x);
const makeHero=(id,hp=100)=>({
  id,name:id,types:['Normale'],maxHp:100,hp,atk:50,def:50,spd:30,
  baseAtk:50,baseDef:50,baseSpd:30,
  statuses:[],moves:[{name:'Colpo',type:'Normale',power:40}]
});
const roster=['A','B','C','D','E','F'].map(id=>makeHero(id));

function room(three=false){
  const s=initialGameState();
  s.isRoguelikeCoop=true;
  s.gameMode='juggernaut';
  s.settings={...s.settings,teamSize:1,maxPlayers:4,fieldSize:1,juggernautPlayer:'p4',draftBattle:true};
  s.players={...s.players,p1:'Host',p2:'Amico',p3:three?'Terzo':null,p4:'Guardiano'};
  s.playerUids={...s.playerUids,p1:'uid-1',p2:'uid-2',p3:three?'uid-3':null};
  s.isBot={...s.isBot,p4:true};
  s.hostHeartbeatAt=Date.now();
  s.coopRun={floor:1,coins:50,relics:[],nextBattlePower:1,encounteredEnemies:[],eventVotes:{}};
  return s;
}
const players=(s)=>['p1','p2','p3','p4'].filter(p=>s.players[p]);

for(const n of [2,3]){
  test('Co-op '+n+' giocatori: draft, KO, sostituzione, vittoria e piano 2',()=>{
    let s=room(n===3);
    const d=prepareCoopDraft(s,roster,()=>0);
    assert.equal(d.status,'drafting');
    assert.equal(d.draft.p4.length,1);
    assert.equal(d.draftChoices.p1.length,3);
    assert.equal(d.draftChoices.p2.length,3);
    if(n===3)assert.equal(d.draftChoices.p3.length,3);
    s={...s,...d};
    for(const p of players(s)){
      if(p==='p4')continue;
      s.draft[p]=[clone(roster[p==='p1'?0:p==='p2'?2:3])];
    }
    let started;
    startBattleImpl({
      gameState:s,appMode:'online_room',applyOnEnterPassive:()=>{},
      getRequiredPlayers:()=>4,
      matchStartTimeRef:{current:null},playerName:'',
      setCombatLog:()=>{},setCommandingIdx:()=>{},
      setIsLogOpen:()=>{},setPlayerRole:()=>{},updateLocalStats:()=>{},
      updateState:patch=>{started=patch;}
    });
    assert.equal(started.status,'pre_battle');
    for(const p of players(s))assert.deepEqual(started.field[p],[0]);
    s={...s,...started,status:'battling',phaseStartedAt:Date.now()};
    s.teams.p1.push(clone(roster[1]));
    s.teams.p1[0].hp=0;
    s.field.p1=[];
    const emergency=prepareEmergencySwitch(s,players(s));
    assert.equal(emergency.status,'switching_phase');
    assert.equal(emergency.pendingSwitches.p1,1);
    s={...s,...emergency,switchActions:{...s.switchActions,p1:[1]}};
    const switching=resolveSwitchingRoom(s,players(s),Date.now());
    assert.equal(switching.kind,'resolved');
    assert.deepEqual(switching.patch.field.p1,[1]);
    s={...s,...switching.patch,status:'battling'};
    assert.equal(resolveMultiplayerWinner(s,players(s)),null);
    s.teams.p4[0].hp=0;
    const recovered=nextPhaseAfterExecution({...s,status:'executing',postExecStatus:'battling'},players(s));
    assert.equal(recovered.status,'gameover');
    assert.equal(recovered.winner,['Host','Amico',...(n===3?['Terzo']:[])].join(' & '));
    const reward=finishCoopFloor({...s,status:'gameover',winner:recovered.winner},roster,()=>.99);
    assert.equal(reward.coopRun.floor,2);
    assert.ok(reward.coopRun.coins>=60);
    assert.throws(()=>finishCoopFloor({...s,status:reward.status,winner:null},roster));
    const next=nextCoopFloor({...s,...reward},roster,null,()=>.99);
    assert.equal(next.status,'pre_battle');
    assert.equal(next.field.p4.length,1);
  });
}

test('La stanza Co-op termina senza soft-lock quando la squadra viene sconfitta',()=>{
 const s=room();
 s.teams.p1=[makeHero('A',0)];
 s.teams.p2=[makeHero('B',0)];
 s.teams.p4=[makeHero('C')];
 s.status='battling';
 assert.equal(prepareEmergencySwitch(s,players(s)).winner,'Guardiano');
 assert.equal(resolveMultiplayerWinner(s,players(s)),'Guardiano');
 s.teams.p4[0].hp=0;
 assert.equal(resolveMultiplayerWinner(s,players(s)),'Pareggio');
});

test('Cure condivise possibili anche se chi paga non ha una squadra',()=>{
 const s=room();
 s.status='coop_camp';
 s.coopRun.coins=120;
 s.teams.p1=[];
 s.teams.p2=[makeHero('A',40)];
 const res=coopCampPurchase(s,roster,'full','p1',0);
 assert.equal(res.teams.p2[0].hp,100);
 assert.equal(res.coopRun.coins,30);
});

test('Un voto duplicato non duplica una ricompensa e il timeout si sblocca',()=>{
 const s=room(true);
 s.status='coop_event';
 s.phaseStartedAt=Date.now()-80000;
 s.coopRun={...s.coopRun,
   floor:2,pendingEvent:{floor:2,type:'trainer',altType:'bargain',relicId:'shift'},eventVotes:{}};
 const first=voteCoopEvent(s,'p1','pathA');
 const changed=voteCoopEvent({...s,coopRun:first.coopRun},'p1','pathB');
 assert.equal(changed.coopRun.eventVotes.p1,'pathB');
 const second=voteCoopEvent({...s,coopRun:changed.coopRun},'p2','pathA');
 assert.equal(second.status,undefined);
 const last=voteCoopEvent({...s,coopRun:second.coopRun},'p3','pathA');
 assert.equal(last.status,'coop_camp');
 assert.equal(last.coopRun.nextBattlePower,1.2);
 assert.throws(()=>voteCoopEvent({...s,...last},'p1','pathB'));
 assert.equal(finalizeCoopEvent({...s,coopRun:second.coopRun}).status,'coop_camp');
});

test('L’host offline si può sostituire senza sovrascrivere il turno',()=>{
 const s=room();
 s.status='battling';
 s.phaseStartedAt=10000;
 const now=Date.now();
 assert.equal(canRecoverRoom({...s,hostHeartbeatAt:now},'p2',now),false);
 assert.equal(canRecoverRoom({...s,hostHeartbeatAt:now-46000},'p2',now),true);
 assert.equal(canSubmitCoopAction(s,'p2','uid-2',10000),true);
 assert.equal(canSubmitCoopAction(s,'p2','uid-2',9999),false);
 assert.equal(canSubmitCoopAction(s,'p2','uid-1',10000),false);
 assert.equal(canCommitCoopTurn(s,'p2','uid-2',10000),false);
 assert.equal(canCommitCoopTurn(s,'p1','uid-1',10000),true);
 s.turnCalculationOwner='uid-2';
 assert.equal(canSubmitCoopAction(s,'p1','uid-1',10000),false);
 assert.equal(canCommitCoopTurn(s,'p1','uid-1',10000),false);
 assert.equal(canCommitCoopTurn(s,'p2','uid-2',10000),true);
 s.status='executing';
 assert.equal(canCommitCoopTurn(s,'p2','uid-2',10000),false);
});
