import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 ROGUE_RELICS, ROGUE_TRAINING_MAX_USES,
 allRogueRelics, trainingUsesLeft, rogueEventTypesAvailable,
 rogueDamageFactor, maybeRogueEvent, canChooseRogueEvent, coopEventPath,
 applySoloRogueChoice, applyCoopRogueChoice, applyRogueEntryMoss, rogueAdvancedEnemyPool
} from '../src/systems/roguelikeEvents.js';
import {coopEnemyTeamForFloor} from '../src/systems/coopExpedition.js';
import {rogueEnemyTacticalTier,rogueTargetPressureBonus} from '../src/systems/strategicCpu.js';

const hero={id:'hero',name:'Eroe',maxHp:100,hp:100,atk:75,def:70,spd:80,moves:[{name:'Colpo',power:65,type:'Normale'}]};
const enemies=[
 {...hero,id:'weak',name:'Weak',price:100},
 {...hero,id:'a',name:'A',price:160},
 {...hero,id:'b',name:'B',price:200},
 {...hero,id:'c',name:'C',price:210},
 {...hero,id:'d',name:'D',price:260},
 {...hero,id:'e',name:'E',price:300}
];

test('Allenamento offensivo consentito esattamente tre volte nella stessa run singola',()=>{
 assert.equal(ROGUE_TRAINING_MAX_USES,3);
 let run={floor:2,maxFloor:50,coins:0,trainingUses:0,relics:[],nextBattlePower:1,
  roster:['hero'],rosterStats:{hero:100}};
 for(let i=1;i<=3;i++){
   run={...run,floor:i+1,pendingEvent:{type:'trainer',floor:i+1}};
   assert.equal(canChooseRogueEvent(run.pendingEvent,'power',0,run.relics,run.trainingUses),true);
   run=applySoloRogueChoice(run,'power',[hero]);
   assert.equal(run.trainingUses,i);
   assert.equal(run.nextBattlePower,1.2);
 }
 const blocked={...run,pendingEvent:{type:'trainer',floor:run.floor}};
 assert.equal(canChooseRogueEvent(blocked.pendingEvent,'power',0,[],3),false);
 assert.throws(()=>applySoloRogueChoice(blocked,'power',[hero]),/disponibile/);
 assert.equal(trainingUsesLeft(3),0);
 assert.equal(trainingUsesLeft(2),1);
 assert.equal(canChooseRogueEvent(blocked.pendingEvent,'heal',0,[],3),true);
 assert.equal(applySoloRogueChoice(blocked,'heal',[hero]).trainingUses,3);
});

test('Dopo tre usi l’Allenatore Errante scompare dai nuovi eventi casuali (anche dai sentieri Co-op)',()=>{
 assert.ok(rogueEventTypesAvailable(2).includes('trainer'));
 assert.ok(!rogueEventTypesAvailable(3).includes('trainer'));
 const pick=(trainingUses,branched)=>maybeRogueEvent(22,50,[],()=>.1,branched,trainingUses);
 for(let n=0;n<50;n++){
   const choices=rogueEventTypesAvailable(3);
   assert.ok(choices.every(type=>type!=='trainer'));
   const event=maybeRogueEvent(22,50,[],()=>n/125,true,3);
   assert.notEqual(event.type,'trainer');
   assert.notEqual(event.altType,'trainer');
 }
 assert.equal(pick(0,false)?.type,'merchant');
 assert.notEqual(pick(3,true)?.type,'trainer');
});

test('Una vecchia scelta Trainer già aperta resta risolvibile senza quarto bonus',()=>{
 const legacyEvent={type:'trainer',altType:'chest',floor:24};
 const converted=coopEventPath(legacyEvent,'pathA',30,[],3);
 assert.equal(converted.choiceId,'heal');
 const room={status:'coop_event',players:{p1:'A',p2:'B',p4:'Guardiano'},
  isBot:{p1:false,p2:false,p4:true},teams:{p1:[{...hero,hp:50}],p2:[{...hero,hp:50}]},
  coopRun:{floor:24,coins:30,relics:[],trainingUses:3,nextBattlePower:1,
   pendingEvent:legacyEvent}};
 const patch=applyCoopRogueChoice(room,'pathA');
 assert.equal(patch.coopRun.trainingUses,3);
 assert.equal(patch.coopRun.nextBattlePower,1);
 assert.equal(patch.teams.p1[0].hp,75);
 assert.equal(patch.teams.p2[0].hp,75);
 assert.equal(room.teams.p1[0].hp,50);
});

test('Due nuove reliquie sono uniche, moderate e non si applicano a bersagli immuni',()=>{
 assert.equal(ROGUE_RELICS.compass.name,'Bussola dei Punti Deboli');
 assert.equal(ROGUE_RELICS.moss.name,'Muschio del Viandante');
 assert.deepEqual(allRogueRelics(['compass','moss','invalid']),['compass','moss']);
 assert.equal(rogueDamageFactor({rogueRelics:['compass']},2),1.08);
 assert.equal(rogueDamageFactor({rogueRelics:['compass']},1),1);
 assert.equal(rogueDamageFactor({rogueRelics:['compass']},0),1);
 assert.equal(rogueDamageFactor({rogueRelics:['compass']},.5),1);
 assert.equal(rogueDamageFactor({rogueRelics:['prism','compass']},.5),1.4);
});

test('Il Muschio cura solo alleati vivi una volta all’inizio dello scontro e mai oltre il massimo',()=>{
 const fighter={...hero,hp:50};
 assert.equal(applyRogueEntryMoss(fighter,['moss']),4);
 assert.equal(fighter.hp,54);
 assert.equal(applyRogueEntryMoss(fighter,[]),0);
 assert.equal(fighter.hp,54);
 const low={...hero,hp:99};
 assert.equal(applyRogueEntryMoss(low,['moss']),1);
 assert.equal(low.hp,100);
 const ko={...hero,hp:0};
 assert.equal(applyRogueEntryMoss(ko,['moss']),0);
 assert.equal(ko.hp,0);
});

test('Le reliquie sono ottenibili dagli eventi esistenti, senza duplicati',()=>{
 const used=['prism','shift','dawn'];
 const event=maybeRogueEvent(22,50,used,()=>0);
 assert.equal(event.relicId,'compass');
 const got=applySoloRogueChoice({
   floor:22,pendingEvent:{type:'chest',floor:22,relicId:event.relicId},
   coins:0,relics:used,roster:['hero'],rosterStats:{hero:100}
 },'relic',[hero]);
 assert.ok(got.relics.includes('compass'));
 const next=maybeRogueEvent(23,50,got.relics,()=>0);
 assert.equal(next.relicId,'moss');
});

test('Ai piani alti gli avversari vengono scelti tra classi più avanzate, senza buff nascosti',()=>{
 const early=rogueAdvancedEnemyPool(enemies,10);
 assert.equal(early.length,6);
 const middle=rogueAdvancedEnemyPool(enemies,24);
 assert.equal(middle.length,5);
 const high=rogueAdvancedEnemyPool(enemies,41);
 assert.equal(high.length,4);
 assert.ok(high.every(c=>c.price>=200));
 assert.equal(rogueAdvancedEnemyPool([hero],40).length,1,'fallback per roster piccoli');
 assert.equal(rogueAdvancedEnemyPool([{...hero,price:50}],40).length,1);
 const team=coopEnemyTeamForFloor(41,enemies,3,[],()=>0);
 assert.equal(team.length,2);
 assert.ok(team.every(c=>c.price>=200));
 assert.ok(team.every(c=>!c.isRoguelikeBoss),'mai boss gratis su piani normali');
});

test('IA avanzata solo per nemici Roguelike dal piano 21, coordinamento dal 36',()=>{
 assert.equal(rogueEnemyTacticalTier({isRoguelikeBattle:true},'p2',{floor:20}),0);
 assert.equal(rogueEnemyTacticalTier({isRoguelikeBattle:true},'p2',{floor:21}),1);
 assert.equal(rogueEnemyTacticalTier({isRoguelikeBattle:true},'p2',{floor:36}),2);
 const coop={isRoguelikeCoop:true,coopRun:{floor:41},settings:{juggernautPlayer:'p4'}};
 assert.equal(rogueEnemyTacticalTier(coop,'p4'),2);
 assert.equal(rogueEnemyTacticalTier(coop,'p1'),0);
 assert.equal(rogueEnemyTacticalTier({gameMode:'juggernaut'},'p4'),0);
 assert.equal(rogueTargetPressureBonus(0,.2,2,2),0);
 assert.ok(rogueTargetPressureBonus(1,.3,2,0)>rogueTargetPressureBonus(1,1,1,0));
 assert.ok(rogueTargetPressureBonus(2,.3,2,1)>rogueTargetPressureBonus(2,.3,2,0));
});

test('Le interfacce e gli avvii applicano la cura e mostrano il limite degli allenamenti',()=>{
 const solo=readFileSync(new URL('../src/screens/roguelike/RoguelikeMapView.jsx',import.meta.url),'utf8');
 const coop=readFileSync(new URL('../src/systems/coopExpedition.js',import.meta.url),'utf8');
 const events=readFileSync(new URL('../src/screens/roguelike/RoguelikeEventView.jsx',import.meta.url),'utf8');
 assert.match(solo,/applyRogueEntryMoss\(char, roguelikeState\.relics/);
 assert.match(coop,/applyRogueEntryMoss\(c,relics\)/);
 assert.match(events,/trainingUsesLeft\(trainingUses\)/);
 assert.match(solo,/rogueAdvancedEnemyPool\(availableEnemies, roguelikeState\.floor\)/);
});
