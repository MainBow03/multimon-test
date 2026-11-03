import test from 'node:test';
import assert from 'node:assert/strict';
import {
  maybeRogueEvent, rogueDamageFactor, applySoloRogueChoice, canChooseRogueEvent
} from '../src/systems/roguelikeEvents.js';
import {
  voteCoopEvent, chooseCoopEventWinner, finalizeCoopEvent, nextCoopFloor
} from '../src/systems/coopExpedition.js';

const roster = [
  {id:'hero',name:'Eroe',maxHp:100,hp:100,atk:50,def:50,spd:50,moves:[]},
  {id:'enemy',name:'Boss',maxHp:120,hp:120,atk:50,def:50,spd:50,moves:[]}
];

function room() {
  return {
    isRoguelikeCoop:true,status:'coop_event',
    players:{p1:'Host',p2:'Amico',p4:'Guardiano'},
    isBot:{p1:false,p2:false,p4:true},
    phaseStartedAt:Date.now()-90000,
    teams:{
      p1:[{...roster[0]}],p2:[{...roster[0]}],p4:[{...roster[1]}]
    },
    coopRun:{
      floor:2,coins:40,relics:[],nextBattlePower:1,
      pendingEvent:{type:'chest',floor:2,relicId:'prism'},
      eventVotes:{},encounteredEnemies:[]
    }
  };
}

test('gli eventi non appaiono al primo, ultimo o piano di riposo', () => {
  assert.equal(maybeRogueEvent(1,50,[],()=>0),null);
  assert.equal(maybeRogueEvent(5,50,[],()=>0),null);
  assert.equal(maybeRogueEvent(50,50,[],()=>0),null);
  assert.equal(maybeRogueEvent(2,50,[],()=>.99),null);
  assert.equal(maybeRogueEvent(2,50,[],()=>0)?.type,'merchant');
});

test('prisma amplifica soltanto attacchi poco efficaci e non immunità', () => {
  assert.equal(rogueDamageFactor({rogueRelics:['prism']},.5),1.4);
  assert.equal(rogueDamageFactor({rogueRelics:['prism']},0),1);
  assert.equal(rogueDamageFactor({rogueRelics:['prism']},2),1);
  assert.equal(rogueDamageFactor({roguePowerBonus:1.2},1),1.2);
});

test('in solitaria un forziere dà una reliquia e non può mandare KO', () => {
  const run={
    floor:2,coins:10,relics:[],roster:['hero'],rosterStats:{hero:10},
    pendingEvent:{type:'chest',floor:2,relicId:'dawn'}
  };
  const resolved=applySoloRogueChoice(run,'relic',roster);
  assert.equal(resolved.rosterStats.hero,1);
  assert.deepEqual(resolved.relics,['dawn']);
  assert.equal(resolved.pendingEvent,null);
  assert.equal(run.rosterStats.hero,10);
});

test('mercante non vende reliquie senza monete', () => {
  assert.equal(canChooseRogueEvent({type:'merchant'},'relic',24,[]),false);
  assert.equal(canChooseRogueEvent({type:'merchant'},'relic',25,[]),true);
});

test('in co-op ogni voto è atomico e solo l’ultimo risolve l’evento', () => {
  const initial=room();
  const first=voteCoopEvent(initial,'p1','relic');
  assert.equal(first.status,undefined);
  assert.equal(first.coopRun.eventVotes.p1,'relic');
  const second=voteCoopEvent({...initial,coopRun:first.coopRun},'p2','relic');
  assert.equal(second.status,'coop_camp');
  assert.equal(second.coopRun.relics[0],'prism');
  assert.equal(second.teams.p1[0].hp,85);
  assert.equal(second.teams.p2[0].hp,85);
  assert.equal(second.teams.p4[0].hp,120);
  assert.equal(initial.teams.p1[0].hp,100);
});

test('parità risolta dal voto dell’host; inattivi sbloccati dopo timeout', () => {
  const initial=room();
  assert.equal(
    chooseCoopEventWinner(initial.coopRun.pendingEvent,{p1:'coins',p2:'relic'},['p1','p2']),
    'coins'
  );
  assert.throws(()=>finalizeCoopEvent({...initial,phaseStartedAt:Date.now()}));
  const recovered=finalizeCoopEvent({
    ...initial,coopRun:{...initial.coopRun,eventVotes:{p2:'coins'}}
  });
  assert.equal(recovered.status,'coop_camp');
  assert.equal(recovered.coopRun.coins,58);
});

test('nuovo piano propaga le reliquie a entrambi gli alleati e consuma il buff', () => {
  const initial=room();
  const next=nextCoopFloor({
    ...initial,status:'coop_camp',
    coopRun:{
      ...initial.coopRun,pendingEvent:null,
      relics:['prism','shift'],nextBattlePower:1.2
    }
  },roster,null,()=>0);
  assert.equal(next.status,'pre_battle');
  assert.deepEqual(next.rogueRelics,['prism','shift']);
  assert.deepEqual(next.teams.p1[0].rogueRelics,['prism','shift']);
  assert.equal(next.teams.p2[0].roguePowerBonus,1.2);
  assert.equal(next.coopRun.nextBattlePower,1);
});


test('la Co-op propone due eventi differenti nello stesso bivio', () => {
  const event=maybeRogueEvent(2,50,[],()=>0,true);
  assert.equal(event.type,'merchant');
  assert.equal(event.altType,'chest');
  assert.notEqual(event.type,event.altType);
});

test('i due sentieri della Co-op applicano l’evento votato, non un duello', () => {
  const initial=room();
  initial.coopRun.pendingEvent={type:'merchant',altType:'chest',floor:2,relicId:'dawn'};
  const first=voteCoopEvent(initial,'p1','pathB');
  assert.equal(first.coopRun.eventVotes.p1,'pathB');
  const second=voteCoopEvent({...initial,coopRun:first.coopRun},'p2','pathB');
  assert.equal(second.status,'coop_camp');
  assert.equal(second.coopRun.relics.includes('dawn'),true);
  assert.equal(second.teams.p1[0].hp,85);
  assert.equal(second.coopRun.coins,40);
  const tie=chooseCoopEventWinner(initial.coopRun.pendingEvent,
    {p1:'pathA',p2:'pathB'},['p1','p2']);
  assert.equal(tie,'pathA');
});
