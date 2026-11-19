import test from 'node:test';
import assert from 'node:assert/strict';
import {CHARACTERS} from '../src/data/characters.js';
import {
 ADVENTURE_ZONES,ADVENTURE_ENTITIES,adventureNearby,adventureMove,
 createAdventureSave,sanitizeAdventureSave,adventureRoadZ,adventureGymCheck
} from '../src/systems/adventureCampaign.js';
import {
 ADVENTURE_TRIALS,ADVENTURE_SIDE_QUESTS,
 adventureTrialInitial,adventureTrialStep,adventureFinishTrial,
 adventureDiscoverSecret,adventureQuestProgress,adventureClaimQuest
} from '../src/systems/adventureEnhancements.js';
import {buildAdventureMesh} from '../src/screens/adventure/AdventureWorldRenderer.js';

const save=createAdventureSave('sonic',CHARACTERS);
const step=(p,actions)=>actions.reduce((state,action)=>adventureTrialStep(state,action),p);

test('Sei Palestre hanno sei enigmi distinti, salvabili e superabili',()=>{
 assert.deepEqual(ADVENTURE_TRIALS.map(t=>t.kind),
  ['growth','forge','tides','ice','stars','runes']);
 let progress=adventureTrialInitial('alba');
 assert.equal(adventureTrialStep(progress,'radici').step,0,'Una risposta errata non apre la strada');
 progress=step(progress,['sole','rugiada','radici']);
 assert.equal(progress.solved,true);
 assert.equal(progress.step,3);
 let forge=adventureTrialInitial('braci');
 for(const target of [60,85,45]){
  // La prova del calore e un misuratore vero, non un quiz: misura e conferma ogni target.
  let left=target;
  for(const n of [25,10,5]){
   while(left>=n){forge=adventureTrialStep(forge,n);left-=n;}
  }
  assert.equal(left,0);
  forge=adventureTrialStep(forge,'confirm');
 }
 assert.equal(forge.solved,true,'La forgia deve poter essere completata');
 let tides=adventureTrialInitial('cascate');
 for(const [i,bits] of [[0,[0,1]],[1,[0,2]],[2,[1,2]]]){
  for(const b of bits)tides=adventureTrialStep(tides,b);
  tides=adventureTrialStep(tides,'confirm');
  assert.equal(tides.step,i+1);
 }
 assert.equal(tides.solved,true);
 const ice=step(adventureTrialInitial('neve'),['right','up']);
 assert.equal(ice.solved,true,'Il labirinto sul ghiaccio deve essere risolvibile');
 const stars=step(adventureTrialInitial('astrale'),[2,0,3,1]);
 assert.equal(stars.solved,true);
 const runes=step(adventureTrialInitial('vulcano'),[0,1,2,3,4,5]);
 assert.equal(runes.solved,true);
 for(const region of ADVENTURE_ZONES){
  const first=adventureFinishTrial(save,region.id);
  assert.ok(first.gymTrials.includes(region.id));
  assert.equal(adventureFinishTrial(first,region.id),first,'Nessuna duplicazione del traguardo');
  const recovered=sanitizeAdventureSave(first,CHARACTERS);
  assert.ok(recovered.gymTrials.includes(region.id),'La prova sopravvive al riavvio');
 }
});

test('Sei missioni secondarie e diciotto reperti davvero trovabili nel mondo',()=>{
 assert.equal(ADVENTURE_SIDE_QUESTS.length,6);
 const secrets=ADVENTURE_ENTITIES.filter(e=>e.kind==='secret');
 const quests=ADVENTURE_ENTITIES.filter(e=>e.kind==='quest');
 assert.equal(secrets.length,18);
 assert.equal(quests.length,6);
 for(const quest of ADVENTURE_SIDE_QUESTS){
  assert.equal(quest.spots.length,3);
  const giver=quests.find(e=>e.id==='quest:'+quest.id);
  assert.ok(giver,quest.id);
  let progress=save;
  assert.equal(adventureClaimQuest(progress,quest.id),progress,'No premi senza ricerca');
  for(let i=0;i<3;i++){
   const entity=secrets.find(e=>e.id==='secret:'+quest.id+':'+i);
   assert.ok(entity,quest.id+' punto '+i);
   assert.equal(entity.zone,ADVENTURE_ZONES.findIndex(z=>z.id===quest.id));
   progress=adventureDiscoverSecret(progress,entity.id);
   assert.ok(!adventureNearby({x:entity.x,z:entity.z},progress,0.1)?.id?.includes(entity.id),
    'Un reperto raccolto non deve riapparire come interagibile');
  }
  assert.equal(adventureQuestProgress(progress,quest.id).count,3);
  const coins=progress.coins,potions=progress.potions;
  const claimed=adventureClaimQuest(progress,quest.id);
  assert.equal(claimed.coins,coins+quest.rewardCoins);
  assert.equal(claimed.potions,potions+quest.rewardPotions);
  assert.ok(claimed.questsDone.includes(quest.id));
  assert.equal(adventureClaimQuest(claimed,quest.id),claimed,'Ricompensa una sola volta');
  const recovered=sanitizeAdventureSave(claimed,CHARACTERS);
  assert.deepEqual(recovered.secrets,progress.secrets);
  assert.deepEqual(recovered.questsDone,claimed.questsDone);
 }
});

test('Collisioni delle Palestre e negozi senza impedire l attivazione ravvicinata',()=>{
 const gym=ADVENTURE_ENTITIES.find(e=>e.kind==='gym'&&e.zone===0);
 const near={...save,position:{x:gym.x+6,z:gym.z}};
 const hit=adventureMove(near,gym.x,gym.z);
 assert.equal(hit.blocked,true,'Il personaggio non deve attraversare la Palestra');
 assert.ok(Math.hypot(hit.position.x-gym.x,hit.position.z-gym.z)>=3,'Il muro e solido');
 const house=ADVENTURE_ENTITIES.find(e=>e.kind==='shop');
 const nearHouse={...save,position:{x:house.x+5,z:house.z}};
 const blocked=adventureMove(nearHouse,house.x,house.z);
 assert.equal(blocked.blocked,true,'La bottega non deve essere attraversabile');
 const normal=adventureMove(save,6,adventureRoadZ(6));
 assert.equal(normal.blocked,false,'Si deve poter percorrere liberamente la strada');
 const lock=adventureMove(save,80,0);
 assert.equal(lock.blocked,true);
 assert.ok(lock.requiresBadge,'Il blocco degli Emblemi rimane valido');
});

test('Le Palestre mantengono allenatori e rivali richiesti come prima',()=>{
 const z=ADVENTURE_ZONES[0],gym=ADVENTURE_ENTITIES.find(e=>e.id===z.id+':gym');
 assert.match(adventureGymCheck(save,gym).message,/allenatori/);
 const ready={...save,defeated:ADVENTURE_ENTITIES.filter(e=>e.zone===0&&e.kind==='trainer').map(e=>e.id)};
 assert.equal(adventureGymCheck(ready,gym).ok,true);
});

test('La geometria 3D e una mesh reale anche dopo le nuove missioni',()=>{
 const vertices=buildAdventureMesh(save);
 assert.ok(vertices instanceof Float32Array);
 assert.equal(vertices.length%9,0);
 assert.ok(vertices.length>10000,'Mondo 3D ancora popolato di geometrie');
});
