import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  setupJuggernaut,updateJuggernautThresholds,
  canQueueJuggernautFreeChoice,applyJuggernautMidpointChoice,
  juggernautRoarDamageFactor,endJuggernautRoarTurn,
  mitigateJuggernautCounter,JUGGERNAUT_ROAR_TURNS,
  JUGGERNAUT_ROAR_FACTOR,JUGGERNAUT_COUNTER_HITS
} from '../src/systems/juggernautSystem.js';

const makeBoss=()=>setupJuggernaut({
  name:'Sage',maxHp:100,hp:100,atk:110,def:90,spAtk:80,spDef:80,
  spd:90,baseSpd:90,moves:[]
},3);
const makeRoom=()=>{
  const boss=makeBoss();
  boss.hp=Math.floor(boss.maxHp*.49);
  updateJuggernautThresholds(boss,boss.hp);
  return {
    gameMode:'juggernaut',status:'battling',phaseStartedAt:12345,
    settings:{juggernautPlayer:'p1'},
    players:{p1:'Boss',p2:'Alice',p3:'Bob',p4:'CPU'},
    isBot:{p1:false,p2:false,p3:false,p4:true},
    teams:{p1:[boss],p2:[{hp:100}],p3:[{hp:100}],p4:[{hp:100}]},
    field:{p1:[0],p2:[0],p3:[0],p4:[0]},
    battleReport:{turns:2},
    juggFreeChoices:{},
    juggSynergy:{charge:2,cooldownUntilTurn:0}
  };
};
test('Scelte gratuite: solo boss dal 50% e una sola scelta per battaglia',()=>{
  const room=makeRoom();
  assert.equal(canQueueJuggernautFreeChoice(room,'p1','boss','purge'),true);
  assert.equal(canQueueJuggernautFreeChoice(room,'p1','boss','empower'),true);
  assert.equal(canQueueJuggernautFreeChoice(room,'p2','boss','purge'),false);
  assert.equal(canQueueJuggernautFreeChoice(room,'p1','boss','roar'),false);
  room.juggFreeChoices.boss={by:'p1',value:'purge',phase:12345};
  assert.equal(canQueueJuggernautFreeChoice(room,'p1','boss','empower'),false);
  room.juggFreeChoices={};
  room.teams.p1[0].juggMidpointUsed=true;
  assert.equal(canQueueJuggernautFreeChoice(room,'p1','boss','purge'),false);
});
test('Scelte gratuite: solo gli sfidanti umani attivi e sinergia carica',()=>{
  const room=makeRoom();
  assert.equal(canQueueJuggernautFreeChoice(room,'p2','synergy','damage'),true);
  assert.equal(canQueueJuggernautFreeChoice(room,'p3','synergy','shield'),true);
  assert.equal(canQueueJuggernautFreeChoice(room,'p1','synergy','shield'),false);
  assert.equal(canQueueJuggernautFreeChoice(room,'p4','synergy','damage'),false);
  assert.equal(canQueueJuggernautFreeChoice(room,'p2','synergy','invalid'),false);
  room.juggFreeChoices.synergy={by:'p3',value:'damage',phase:12345};
  assert.equal(canQueueJuggernautFreeChoice(room,'p2','synergy','shield'),false);
  room.juggFreeChoices={};
  room.juggSynergy.charge=1;
  assert.equal(canQueueJuggernautFreeChoice(room,'p2','synergy','damage'),false);
  room.juggSynergy.charge=2;
  room.juggSynergy.cooldownUntilTurn=4;
  assert.equal(canQueueJuggernautFreeChoice(room,'p2','synergy','damage'),false);
  room.juggSynergy.cooldownUntilTurn=0;
  room.status='executing';
  assert.equal(canQueueJuggernautFreeChoice(room,'p2','synergy','damage'),false);
});
test('Ripristino gratuito: cancella solo malus, conserva buff e non è riutilizzabile',()=>{
  const boss=makeBoss();
  boss.hp=Math.floor(boss.maxHp*.49);
  updateJuggernautThresholds(boss,boss.hp);
  const originalAttack=boss.atk;
  boss.atk=Math.floor(boss.baseAtk*.6);
  boss.def=Math.floor(boss.baseDef*1.4);
  boss.spd=Math.floor(boss.baseSpd*.8);
  assert.equal(applyJuggernautMidpointChoice(boss,'purge'),true);
  assert.equal(boss.atk,originalAttack);
  assert.equal(boss.def,Math.floor(boss.baseDef*1.4));
  assert.equal(boss.spd,boss.baseSpd);
  assert.equal(boss.juggMidpointUsed,true);
  assert.equal(applyJuggernautMidpointChoice(boss,'empower'),false);
  assert.equal(boss.juggNextAttackBoost,false);
});
test('Impulso Brutale gratuito: potenzia prossimo attacco senza perdere la mossa',()=>{
  const boss=makeBoss();
  boss.hp=Math.floor(boss.maxHp*.49);
  updateJuggernautThresholds(boss,boss.hp);
  assert.equal(applyJuggernautMidpointChoice(boss,'empower'),true);
  assert.equal(boss.juggNextAttackBoost,true);
  assert.equal(boss.juggMidpointUsed,true);
  assert.equal(applyJuggernautMidpointChoice(boss,'purge'),false);
});
test('Ruggito Tirannico: -20% esattamente per due turni, non sulla squadra boss',()=>{
  const boss=makeBoss();
  boss.juggRoarTurnsRemaining=JUGGERNAUT_ROAR_TURNS;
  assert.equal(JUGGERNAUT_ROAR_FACTOR,.8);
  assert.equal(juggernautRoarDamageFactor(boss,true),.8);
  assert.equal(juggernautRoarDamageFactor(boss,false),1);
  assert.equal(endJuggernautRoarTurn(boss),1);
  assert.equal(juggernautRoarDamageFactor(boss,true),.8);
  assert.equal(endJuggernautRoarTurn(boss),0);
  assert.equal(juggernautRoarDamageFactor(boss,true),1);
  assert.equal(endJuggernautRoarTurn(boss),0);
});
test('Contrattacco Supremo: primi due colpi protetti, una sola risposta',()=>{
  const boss=makeBoss();
  boss.juggCounterReady=true;
  boss.juggCounterHitsRemaining=JUGGERNAUT_COUNTER_HITS;
  let hit=mitigateJuggernautCounter(boss,100,1);
  assert.deepEqual(hit,{damage:70,coveredHits:1,counter:true});
  assert.equal(boss.juggCounterHitsRemaining,1);
  hit=mitigateJuggernautCounter(boss,100,1);
  assert.deepEqual(hit,{damage:70,coveredHits:1,counter:false});
  hit=mitigateJuggernautCounter(boss,100,1);
  assert.deepEqual(hit,{damage:100,coveredHits:0,counter:false});
});
test('Contrattacco Supremo: multi-hit riduce proporzionalmente solo i primi due hit',()=>{
  const boss=makeBoss();
  boss.juggCounterReady=true;
  boss.juggCounterHitsRemaining=2;
  assert.deepEqual(mitigateJuggernautCounter(boss,200,4),
    {damage:170,coveredHits:2,counter:true});
  assert.equal(boss.juggCounterHitsRemaining,0);
  assert.equal(mitigateJuggernautCounter(boss,80,1).damage,80);
  assert.deepEqual(mitigateJuggernautCounter(null,100,2),
    {damage:100,coveredHits:0,counter:false});
});
test('Integrazione: scelte gratuite registrate a parte e non sostituiscono la mossa',()=>{
  const engine=readFileSync(new URL('../src/systems/battleSystem.js',import.meta.url),'utf8');
  const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
  const ui=readFileSync(new URL('../src/screens/battle/BattlingView.jsx',import.meta.url),'utf8');
  assert.match(engine,/const choice=gameState\.juggFreeChoices\|\|\{\}/);
  assert.match(engine,/applyJuggernautMidpointChoice\(boss,choice\.boss\.value\)/);
  assert.match(engine,/spendJuggernautSynergy\(juggSynergy,choice\.synergy\?\.value/);
  assert.match(engine,/juggFreeChoices: \{\}/);
  assert.match(engine,/mitigateJuggernautCounter\(/);
  assert.match(engine,/endJuggernautRoarTurn\(/);
  assert.match(app,/runTransaction\(db,async tx=>/);
  assert.match(app,/canQueueJuggernautFreeChoice\(live,playerRole,kind,value\)/);
  assert.match(ui,/chooseJuggernautFreeChoice\('boss','purge'\)/);
  assert.match(ui,/chooseJuggernautFreeChoice\('synergy','damage'\)/);
  assert.doesNotMatch(ui,/commitAction\(\{type:'juggernaut_synergy'/);
});
