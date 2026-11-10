import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ECHO_CAMPAIGN} from '../src/data/echoCampaign.js';
import {CHARACTERS} from '../src/data/characters.js';
import {
 ECHO_CHALLENGE_VERSION,ECHO_MISSION_LINEUPS,echoEncounterRoster,
 echoEnemyFieldSize,echoEnemyScaling,echoPuppetIdentity
} from '../src/systems/echoChallenge.js';
const missions=ECHO_CAMPAIGN.sectors.flatMap(s=>s.missions);
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('REGRESSIONE: nessuna delle prime 33 missioni ottiene 6 avversari',()=>{
 const originalCounts=[
  2,2,2,2,2,2,
  2,2,2,2,2,3,
  2,2,2,2,2,2,
  2,2,2,2,3,2,
  2,2,2,4,2,3,
  3,2,3
 ];
 assert.equal(originalCounts.length,33);
 for(let i=0;i<33;i++){
  assert.equal(missions[i].boss.length,originalCounts[i],`eco_${String(i+1).padStart(2,'0')} ha un numero di nemici sbagliato`);
  assert.equal(missions[i].forceFieldSize,undefined,'Il numero di combattenti attivi deve rimanere quello originale');
  assert.equal(echoEnemyFieldSize(i+1),undefined);
  assert.equal(echoEncounterRoster(i+1,missions[i].boss).length,originalCounts[i]);
 }
 assert.deepEqual(Object.keys(ECHO_MISSION_LINEUPS).sort(),['34','35']);
});

test('Missione 34: due Rena Rouge, due Finn, Re Ghiaccio, Gravelord Nito — sei in campo',()=>{
 const mission=missions[33];
 assert.equal(mission.id,'eco_34');
 assert.deepEqual(mission.boss,['renarouge','renarouge','finn','finn','reghiaccio','nito']);
 assert.equal(mission.forceFieldSize,6);
 assert.equal(new Set(mission.boss).size,4,'Le coppie gemelle devono essere copie separate dello stesso personaggio');
 for(let i=0;i<4;i++){
  const instance=echoPuppetIdentity('eco_34',i,CHARACTERS.find(c=>c.id===mission.boss[i]));
  assert.equal(instance.isEchoPuppet,true);
  assert.match(instance.name,i<2?/Rena Rouge/:/Finn/);
  assert.match(instance.name,/I|II/);
 }
 assert.ok(mission.dialogue.length>=6,'La scena approfondisce le illusioni prima dello scontro');
 assert.ok(mission.postDialogue.length>=4);
});

test('Missione 35: Topolino, Snorlax, Kirby, Barry, Shadow, Cell Jr. — sei in campo',()=>{
 const mission=missions[34],allIds=new Set(CHARACTERS.map(c=>c.id));
 assert.equal(mission.id,'eco_35');
 assert.deepEqual(mission.boss,['topolino','snorlax','kirby','barry','shadow','celljr_1']);
 assert.equal(mission.forceFieldSize,6);
 for(const id of mission.boss)assert.ok(allIds.has(id),`Il Multimon ${id} non esiste`);
 assert.equal(echoPuppetIdentity('eco_35',0,CHARACTERS.find(c=>c.id==='topolino')).isEchoPuppet,true);
 assert.ok(mission.dialogue.some(d=>d.s.includes('Topolino')));
 assert.ok(mission.postDialogue.some(d=>d.s.includes('Gaster')));
});

test('Missione 36 mantiene Echomax boss con tre anime guardiane e 24 alleati',()=>{
 const mission=missions[35];
 assert.equal(mission.id,'eco_36');
 assert.deepEqual(mission.boss,['echomax','goku','naruto','luffy']);
 assert.equal(mission.forceFieldSize,6);
 assert.equal(mission.forcedRoster.length,24);
 assert.equal(mission.echoFinal,true);
 assert.equal(echoEnemyFieldSize(36),undefined);
});

test('La difficoltà cresce negli altri scontri senza moltiplicare i nemici',()=>{
 assert.equal(ECHO_CHALLENGE_VERSION,'echo-preboss-v3');
 for(const id of [1,6,7,12,13,18,19,24,25,30,31,33]){
  const scal=echoEnemyScaling(id);
  assert.ok(scal.hp>=1,'Gli scontri standard non vengono indeboliti');
  assert.ok(scal.atk>=1,'Gli scontri standard non vengono indeboliti');
 }
 assert.ok(echoEnemyScaling(31).hp>echoEnemyScaling(1).hp);
 assert.ok(echoEnemyScaling(31).atk>echoEnemyScaling(1).atk);
 assert.ok(echoEnemyScaling(34).hp<echoEnemyScaling(33).hp,'Il pre-boss bilancia la quantità con statistiche individuali più moderate');
 assert.ok(echoEnemyScaling(35).hp<echoEnemyScaling(33).hp);
 assert.ok(echoEnemyScaling(20,{insane:true}).hp>echoEnemyScaling(20).hp);
});

test('Il numero di eroi selezionabili rimane quattro fino al raid da 24',()=>{
 const selection=read('src/screens/campaign/CampaignTeamSelectView.jsx');
 const dialogue=read('src/screens/campaign/CampaignDialogueView.jsx');
 assert.match(selection,/let maxTeamSize = 4/);
 assert.doesNotMatch(selection,/activeCampaignId === 'eco_anime'\) maxTeamSize = 6/);
 assert.match(selection,/if \(isEchoFinalRaid\) maxTeamSize = 24/);
 assert.match(dialogue,/mission\.echoFinal \? 24 : 4/);
 assert.match(selection,/mission\.forceFieldSize/);
 assert.match(selection,/\['eco_34','eco_35','eco_36'\]\.includes\(mission\.id\)/);
});
