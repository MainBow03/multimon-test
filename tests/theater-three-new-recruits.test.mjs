import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {THEATER_CAMPAIGN,THEATER_TOTAL_MISSIONS} from '../src/data/theaterCampaign.js';
import {CHARACTERS} from '../src/data/characters.js';
import {THEATER_NEW_RECRUITS,migrateTheaterNewRecruits,migrateTheaterRecruits} from '../src/systems/theaterRecruitMigration.js';

const missions=THEATER_CAMPAIGN.sectors.flatMap(act=>act.missions);
const state=(sectorIdx,missionIdx,extra={})=>({
 isStarted:true,sectorIdx,missionIdx,coins:157,difficulty:'Insane',
 protagonist:'starbutterfly',roster:['starbutterfly','coraline','stellarubia'],
 rosterStats:{starbutterfly:12,coraline:0,stellarubia:77},
 lastUnlocked:['stellarubia'],
 currentBossState:[{id:'caposcena',hp:31}],
 ...extra
});
const has=(save,id)=>save.roster.includes(id);
test('Teatro: reclute presenti nel database reale e assegnate nelle missioni 11, 17 e 23',()=>{
 assert.equal(missions.length,THEATER_TOTAL_MISSIONS);
 assert.deepEqual(THEATER_NEW_RECRUITS.map(x=>[x.id,x.afterMission]),
   [['shrek',11],['perla',17],['whisper',23]]);
 for(const [id,n] of [['shrek',11],['perla',17],['whisper',23]]){
   const fighter=CHARACTERS.find(c=>c.id===id);
   assert.ok(fighter?.maxHp>0,'scheda giocabile mancante: '+id);
   assert.ok(fighter.moves?.length>0,'moveset mancante: '+id);
   assert.ok(missions[n-1].unlock.includes(id),'non entra in squadra dopo la missione '+n);
   assert.ok(missions[n-1].dialogue.some(d=>d.s===fighter.name),'manca introduzione nella missione '+n);
   assert.ok(missions[n-1].postDialogue.some(d=>d.s===fighter.name),'manca scena di reclutamento '+n);
   assert.ok(missions.slice(n).some(m=>[...m.dialogue,...m.postDialogue].some(d=>d.s===fighter.name)),
     'il personaggio sparisce dalla storia dopo il reclutamento: '+fighter.name);
   assert.ok(missions[35].dialogue.some(d=>d.s===fighter.name),'non compare nel finale: '+fighter.name);
 }
});
test('Teatro: prima del completamento delle missioni nessun reclutamento anticipato',()=>{
 for(const [n,sector,mission,id] of [[11,1,4,'shrek'],[17,2,4,'perla'],[23,3,4,'whisper']]){
   const result=migrateTheaterRecruits(state(sector,mission),CHARACTERS);
   assert.equal(has(result.state,id),false,'recluta anticipata prima della missione '+n);
 }
 assert.equal(migrateTheaterRecruits(state(0,0),CHARACTERS).changed,false);
});
test('Teatro: chi è già oltre la missione 11 riceve Shrek senza altri anticipi',()=>{
 const first=migrateTheaterRecruits(state(1,5),CHARACTERS);
 assert.equal(first.changed,true);
 assert.deepEqual(first.added,['shrek']);
 assert.equal(has(first.state,'shrek'),true);
 assert.equal(has(first.state,'perla'),false);
 assert.equal(has(first.state,'whisper'),false);
 assert.equal(first.state.rosterStats.shrek,CHARACTERS.find(c=>c.id==='shrek').maxHp);
});
test('Teatro: dopo missione 17 Perla viene aggiunta, Whisper aspetta la 23',()=>{
 const result=migrateTheaterRecruits(state(2,5),CHARACTERS);
 assert.deepEqual(result.added,['shrek','perla']);
 assert.equal(has(result.state,'whisper'),false);
});
test('Teatro: dopo missione 23 e dopo il finale arrivano tutti e tre',()=>{
 for(const example of [state(3,5),state(4,0),state(5,5,{completed:true})]){
   const result=migrateTheaterRecruits(example,CHARACTERS);
   assert.deepEqual(result.added,['shrek','perla','whisper']);
   assert.equal(result.state.roster.filter(id=>id==='shrek').length,1);
   assert.equal(result.state.roster.filter(id=>id==='perla').length,1);
   assert.equal(result.state.roster.filter(id=>id==='whisper').length,1);
 }
});
test('Migrazione: non altera HP esistenti, KO, monete, capitolo, scelta eroe o stato boss',()=>{
 const original=state(4,1,{
   roster:['starbutterfly','coraline','stellarubia','shrek'],
   rosterStats:{starbutterfly:12,coraline:0,stellarubia:77,shrek:5},
   lastUnlocked:['ganyu'],faintedInLastBattle:['Coraline'],
   removeCounter:3
 });
 const initialCopy=structuredClone(original);
 const result=migrateTheaterRecruits(original,CHARACTERS);
 assert.equal(result.changed,true);
 assert.deepEqual(result.added,['perla','whisper']);
 assert.deepEqual(original,initialCopy,'la migrazione non deve mutare il salvataggio originale');
 for(const key of ['coins','difficulty','sectorIdx','missionIdx','protagonist','currentBossState',
   'lastUnlocked','faintedInLastBattle','removeCounter']){
   assert.deepEqual(result.state[key],original[key],'dato alterato: '+key);
 }
 for(const [id,hp] of Object.entries(original.rosterStats)){
   assert.equal(result.state.rosterStats[id],hp,'PS sovrascritti: '+id);
 }
 assert.equal(result.state.rosterStats.perla,CHARACTERS.find(c=>c.id==='perla').maxHp);
 assert.equal(result.state.rosterStats.whisper,CHARACTERS.find(c=>c.id==='whisper').maxHp);
 const second=migrateTheaterRecruits(result.state,CHARACTERS);
 assert.equal(second.changed,false);
 assert.equal(second.state,result.state,'secondo caricamento non deve modificare dati né creare doppioni');
});
test('Se la recluta è già nel team a 0 PS non viene rianimata',()=>{
 const old=state(4,3,{
   roster:['starbutterfly','coraline','stellarubia','shrek','perla','whisper'],
   rosterStats:{starbutterfly:35,coraline:0,stellarubia:8,shrek:0,perla:0,whisper:2}
 });
 const migrated=migrateTheaterNewRecruits(old,CHARACTERS);
 assert.equal(migrated.changed,false);
 assert.equal(migrated.state,old);
 assert.equal(migrated.state.rosterStats.perla,0);
 assert.equal(migrated.state.rosterStats.shrek,0);
});
test('Entrambi i percorsi di ripristino (caricamento e avvio) applicano la migrazione',()=>{
 const file=p=>readFileSync(new URL(p,import.meta.url),'utf8');
 const campaignFlow=file('../src/systems/campaignFlow.js');
 const app=file('../src/App.jsx');
 assert.match(campaignFlow,/migrateTheaterRecruits\(parsed,CHARACTERS\)/);
 assert.match(app,/migrateTheaterRecruits\(parsed,CHARACTERS\)/);
 assert.match(campaignFlow,/localStorage\.setItem\(`multiverse_rpg_campaign_save_\$\{campId\}`/);
 assert.match(app,/localStorage\.setItem\('multiverse_rpg_campaign_save_'/);
});
