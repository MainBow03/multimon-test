import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ECHO_CAMPAIGN,ECHO_ALLIES} from '../src/data/echoCampaign.js';
import {CHARACTERS} from '../src/data/characters.js';
import {
 ECHO_FINAL_SOUL_IDS,ECHO_FINAL_ENEMY_IDS,ECHO_FINAL_SOUL_VERSION,
 createEchoFinalSoul,isEchoFinalSoulId,echoFinalBossAlive,echoFinalVictory,echoSoulPortraitId
} from '../src/systems/echoFinalSouls.js';
import {
 ECHO_FINAL_STORY_BEATS,emitEchoFinalStoryBeats,echoSoulReleaseDialogue
} from '../src/systems/echoFinalStoryBeats.js';
import {echoEnsembleLines} from '../src/data/echoEnsembleDialogue.js';
const src=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const stages=ECHO_CAMPAIGN.sectors.flatMap(s=>s.missions);
const final=stages[35];

test('Solo nel raid finale Echomax è affiancato dalle tre anime richieste',()=>{
 assert.deepEqual(ECHO_FINAL_SOUL_IDS,['goku','naruto','luffy']);
 assert.deepEqual(ECHO_FINAL_ENEMY_IDS,['echomax','goku','naruto','luffy']);
 assert.deepEqual(final.boss,ECHO_FINAL_ENEMY_IDS);
 assert.equal(final.id,'eco_36');
 assert.equal(final.echoFinal,true);
 assert.equal(final.forceFieldSize,6);
 assert.equal(final.forcedRoster.length,24);
 assert.equal(new Set(final.forcedRoster).size,24);
 assert.deepEqual(final.forcedRoster,ECHO_ALLIES);
 for(let i=0;i<35;i++){
  if([33,34].includes(i))assert.equal(stages[i].boss.length,6);
  else assert.ok(stages[i].boss.length<6,'Nessun altro incontro deve diventare un 6v6');
  assert.ok(stages[i].boss.every(id=>!ECHO_FINAL_SOUL_IDS.includes(id)||
   stages[i].boss.length===1),'Il trio di anime non deve essere aggiunto alle altre missioni');
 }
});

test('Le tre anime sono personaggi reali con nomi, PNG, mosse e PS propri',()=>{
 const expected={
  goku:{hp:340,name:'Anima di Goku'},
  naruto:{hp:365,name:'Anima di Naruto'},
  luffy:{hp:395,name:'Anima di Luffy'}
 };
 for(const id of ECHO_FINAL_SOUL_IDS){
  const base=CHARACTERS.find(c=>c.id===id);
  assert.ok(base,'Personaggio mancante: '+id);
  const before=JSON.stringify(base);
  const guardian=createEchoFinalSoul(structuredClone(base));
  assert.equal(guardian.id,id);
  assert.equal(guardian.name,expected[id].name);
  assert.equal(guardian.hp,expected[id].hp);
  assert.equal(guardian.maxHp,expected[id].hp);
  assert.equal(guardian.isEchoSoulGuardian,true);
  assert.equal(guardian.echoSoulPermanentDefeat,true);
  assert.equal(guardian.isEchoCopy,false);
  assert.equal(guardian.isSummonOnly,false);
  assert.equal(guardian.soulMasterId,'echomax');
  assert.match(guardian.imageFilter,/hue-rotate/);
  assert.deepEqual(guardian.moves.map(m=>m.name),base.moves.map(m=>m.name));
  assert.equal(guardian.baseAtk,guardian.atk);
  assert.equal(JSON.stringify(base),before,'Non cambia il Multimon giocabile originale');
  assert.equal(echoSoulPortraitId(guardian.name),id);
  assert.equal(isEchoFinalSoulId(id),true);
 }
 assert.equal(echoSoulPortraitId('Anima di Finn'),null);
 assert.throws(()=>createEchoFinalSoul(CHARACTERS.find(c=>c.id==='finn')),/sconosciuta/);
});

test('L’obiettivo è Echomax: le anime KO non rientrano e non impediscono la vittoria',()=>{
 const heroes=[{id:'jake',hp:70,isSummonOnly:false}];
 const souls=ECHO_FINAL_SOUL_IDS.map(id=>({id,hp:100,isEchoSoulGuardian:true,isSummonOnly:false}));
 const boss={id:'echomax',hp:400,isSummonOnly:false};
 assert.equal(echoFinalBossAlive([boss,...souls]),true);
 assert.equal(echoFinalVictory({isEchoFinalBattle:true,heroes,enemies:[boss,...souls]}),null);
 assert.equal(echoFinalVictory({isEchoFinalBattle:true,heroes,enemies:[boss,...souls.map(s=>({...s,hp:0}))]}),null);
 assert.equal(echoFinalVictory({isEchoFinalBattle:true,heroes,enemies:[{...boss,hp:0},...souls]}),'heroes');
 assert.equal(echoFinalVictory({isEchoFinalBattle:true,heroes:[{...heroes[0],hp:0}],enemies:[boss,...souls]}),'boss');
 assert.equal(echoFinalVictory({isEchoFinalBattle:true,heroes:[{...heroes[0],hp:0}],enemies:[{...boss,hp:0},...souls]}),'draw');
 assert.equal(echoFinalVictory({isEchoFinalBattle:false,heroes,enemies:[{...boss,hp:0},...souls]}),null);
});

test('Il motore standard rispetta permanenza degli aiutanti e la vittoria contro il boss',()=>{
 const battle=src('src/systems/battleSystem.js');
 const team=src('src/screens/campaign/CampaignTeamSelectView.jsx');
 const retry=src('src/screens/battle/GameoverView.jsx');
 assert.match(team,/createEchoFinalSoul\(charInst\)/);
 assert.match(team,/ECHO_FINAL_SOUL_VERSION/);
 assert.match(team,/isEchoFinalSoulId\(charInst\.id\)/);
 assert.match(team,/isEchoFinalRaid\?\'Echomax e le tre Anime Sottomesse\'/);
 assert.match(team,/fSize = ECHO_ACTIVE_LIMIT/);
 assert.match(team,/isEchoFinalRaid\) maxTeamSize = 24/);
 assert.match(battle,/echoFinalVictory\(\{isEchoFinalBattle:gameState\.isEchoFinalBattle/);
 assert.match(battle,/!t\.char\.echoSoulPermanentDefeat/);
 assert.match(battle,/char\.isEchoSoulGuardian/);
 assert.match(retry,/isEchoSoulGuardian: !!c\.isEchoSoulGuardian/);
 assert.equal(ECHO_FINAL_SOUL_VERSION,1);
});

test('Finale con molti più interlocutori, botta e risposta e personalità differenti',()=>{
 assert.ok(final.dialogue.length>=55,'Il discorso prima del boss deve essere molto più lungo');
 assert.ok(final.postDialogue.length>=20,'Anche il finale deve avere una conclusione corale');
 const names=new Set(final.dialogue.map(d=>d.s));
 const required=[
  'Neon','Sage','Carlos Oliveira','Leon Kennedy','Perla','Garnet','Robin',
  'Corvina','Bumblebee','Stellarubia','Nicole Watterson','Darwin',
  'Meliodas',"Ban l'Immortale",'Cell','Ember McLain','Bugs Bunny','Daffy Duck',
  'Penny','Brago','Zatch bell','W.D. Gaster','Echomax'
 ];
 for(const speaker of required)assert.ok(names.has(speaker),'Manca la voce di '+speaker);
 for(const soul of ['Anima di Goku','Anima di Naruto','Anima di Luffy'])
  assert.ok(names.has(soul),'La sua anima deve avere una voce: '+soul);
 const bossLines=final.dialogue.filter(d=>d.s==='Echomax').length;
 assert.ok(bossLines>=8,'Echomax deve rispondere in più scambi e non fare un solo monologo');
 assert.ok(echoEnsembleLines(36,'before').length>=45);
 assert.ok(echoEnsembleLines(36,'after').length>=15);
 const stagesWithEnsemble=stages.filter(m=>echoEnsembleLines(m.echoNumber,'before').length+
  echoEnsembleLines(m.echoNumber,'after').length>0);
 assert.ok(stagesWithEnsemble.length>=12,'Anche gli atti precedenti devono avere voci diverse');
});

test('Il boss dialoga in battaglia alle soglie 75/50/25%, una volta per soglia',()=>{
 const boss={id:'echomax',hp:6200,maxHp:6200};
 const enemies=[boss,{id:'goku',hp:300},{id:'naruto',hp:300},{id:'luffy',hp:300}];
 const messages=[];
 assert.equal(ECHO_FINAL_STORY_BEATS.length,3);
 assert.deepEqual(emitEchoFinalStoryBeats(enemies,messages),[]);
 boss.hp=4600; // sotto 75%
 assert.deepEqual(emitEchoFinalStoryBeats(enemies,messages),['quarter']);
 assert.deepEqual(emitEchoFinalStoryBeats(enemies,messages),[]);
 boss.hp=2900;
 assert.deepEqual(emitEchoFinalStoryBeats(enemies,messages),['half']);
 boss.hp=1400;
 assert.deepEqual(emitEchoFinalStoryBeats(enemies,messages),['last']);
 assert.equal(boss.echoFinalDialogueStages.length,3);
 assert.ok(messages.length>=12);
 assert.ok(messages.some(e=>e.text.includes('Echomax')));
 assert.deepEqual(emitEchoFinalStoryBeats(enemies,messages),[]);
 const resumed={...boss,echoFinalDialogueStages:[...boss.echoFinalDialogueStages]};
 assert.deepEqual(emitEchoFinalStoryBeats([resumed],[]),[]);
 assert.equal(emitEchoFinalStoryBeats([],[]).length,0);
 for(const id of ECHO_FINAL_SOUL_IDS)
  assert.ok(echoSoulReleaseDialogue(id).some(([speaker])=>speaker.includes('Anima')));
 const battle=src('src/systems/battleSystem.js');
 assert.match(battle,/emitEchoFinalStoryBeats\(workingTeams\.p2,events\)/);
 assert.match(battle,/echoSoulReleaseDialogue\(char\.id\)/);
 const retry=src('src/screens/battle/GameoverView.jsx');
 const team=src('src/screens/campaign/CampaignTeamSelectView.jsx');
 assert.match(retry,/echoFinalDialogueStages: c\.echoFinalDialogueStages/);
 assert.match(team,/echoFinalDialogueStages=\[\.\.\.\(savedC\.echoFinalDialogueStages/);
});

test('Le anime nei dialoghi mostrano i loro ritratti con aura da Echomax',()=>{
 const ui=src('src/screens/campaign/CampaignDialogueView.jsx');
 assert.match(ui,/echoSoulPortraitId\(dialogue\.s\)/);
 assert.match(ui,/hue-rotate\(245deg\)/);
 assert.match(ui,/onError=\{onMultimonImageError\}/);
 assert.match(ui,/campaignDialogueIdx\+1/);
});
