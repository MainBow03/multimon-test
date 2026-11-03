import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CHARACTERS } from '../src/data/characters.js';
import { CAMPAIGNS } from '../src/data/campaigns.js';
import { MOVES_DB } from '../src/data/moves.js';
import { getCampaignStoryCharacters } from '../src/systems/campaignSystem.js';
import { TOURNAMENT_EXCLUDED_IDS, isTournamentExcludedId,
 isTournamentEligibleCharacter, sanitizeTournamentSave } from '../src/systems/tournamentEligibility.js';

const excludedIds=new Set(TOURNAMENT_EXCLUDED_IDS);
const storyIds=getCampaignStoryCharacters('torneo_assoluto');
const eligible=CHARACTERS.filter(c=>isTournamentEligibleCharacter(c,storyIds));
const byId=id=>CHARACTERS.find(c=>c.id===id);
const source=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('Il Torneo esclude Monarch, Echomax e tutti gli avversari akumizzati della quarta campagna',()=>{
 const monarch=CAMPAIGNS.find(c=>c.id==='monarch_akuma');
 assert.ok(monarch);
 const formIds=monarch.sectors.flatMap(s=>s.missions.flatMap(m=>m.boss||[]));
 assert.ok(formIds.length>=9);
 for(const id of ['monarch','echomax',...formIds]){
  assert.ok(excludedIds.has(id),'esclusione mancante: '+id);
  assert.ok(!eligible.some(c=>c.id===id),'trovato nel roster del torneo: '+id);
  assert.equal(isTournamentExcludedId(id),true);
 }
 for(const id of ['cuoreinfranto','terrordash','jakeildemone','zatch_akuma','ponygon_akuma',
   'staticshocker','staticshocker_invincible','maxcaulfield_corrotta','marceline_corrotta','maestrospietato']){
  assert.ok(excludedIds.has(id),id);
 }
 assert.equal(eligible.some(c=>c.id==='monarch'),false);
 assert.equal(eligible.some(c=>c.id==='echomax'),false);
 assert.ok(eligible.length>50,'Il resto del roster deve rimanere disponibile');
 assert.ok(eligible.some(c=>c.id==='roserade'));
});

test('Il filtro viene applicato sia ai nuovi tornei sia alla scelta del protagonista',()=>{
 const flow=source('src/systems/campaignFlow.js');
 const pick=source('src/screens/campaign/CampaignSelectProtagonistView.jsx');
 assert.match(flow,/campId === 'torneo_assoluto'\s*\? isTournamentEligibleCharacter\(c,storyChars\)/);
 assert.match(flow,/campId === 'torneo_assoluto'\)\s*parsed = sanitizeTournamentSave\(/);
 assert.match(pick,/isTournamentEligibleCharacter\(c,storyChars\)/);
 assert.ok(isTournamentEligibleCharacter(byId('monarch'),[])===false);
 assert.ok(isTournamentEligibleCharacter(byId('echomax'),[])===false);
 assert.ok(isTournamentEligibleCharacter(byId('jake'),[])===true);
});

test('I salvataggi con boss futuri sono ripuliti senza perdere progressi, monete o vecchi alleati',()=>{
 const current={
  isStarted:true,sectorIdx:2,missionIdx:3,coins:890,difficulty:'Insane',
  protagonist:'roserade',
  roster:['roserade','juvia','monarch','echomax','cuoreinfranto','topolino','mantide','spike'],
  rosterStats:{roserade:37,juvia:41,monarch:200,echomax:190,cuoreinfranto:150,topolino:80,mantide:39,spike:60},
  currentBossState:[{id:'goku',hp:100}],
  someOtherPersistedField:'preserve-me'
 };
 const after=sanitizeTournamentSave(current,CHARACTERS,storyIds);
 assert.equal(after.coins,890);
 assert.equal(after.difficulty,'Insane');
 assert.equal(after.sectorIdx,2);
 assert.equal(after.missionIdx,3);
 assert.equal(after.protagonist,'roserade');
 assert.equal(after.currentBossState,current.currentBossState);
 assert.equal(after.someOtherPersistedField,'preserve-me');
 assert.equal(after.rosterStats.roserade,37);
 assert.equal(after.rosterStats.juvia,41);
 assert.equal(after.rosterStats.mantide,39);
 assert.equal(after.roster.length,8);
 assert.equal(new Set(after.roster).size,8);
 assert.equal(after.roster.includes('monarch'),false);
 assert.equal(after.roster.includes('echomax'),false);
 assert.equal(after.roster.includes('cuoreinfranto'),false);
 assert.equal(after.rosterStats.monarch,undefined);
 assert.equal(after.rosterStats.echomax,undefined);
 assert.ok(after.roster.every(id=>!excludedIds.has(id)));
 assert.ok(after.roster.every(id=>Number.isFinite(after.rosterStats[id])));
 assert.equal(sanitizeTournamentSave(after,CHARACTERS,storyIds),after,
  'Ricaricare lo stesso salvataggio non deve rifare la migrazione');
});

test('Se il protagonista di un salvataggio è vietato, deve essere scelto nuovamente',()=>{
 const current={roster:['echomax','monarch','jake','juvia'],rosterStats:{echomax:190,monarch:200,jake:88,juvia:33},
  protagonist:'echomax',isStarted:true,sectorIdx:3,missionIdx:1};
 const after=sanitizeTournamentSave(current,CHARACTERS,storyIds);
 assert.equal(after.protagonist,null);
 assert.equal(after.isStarted,false);
 assert.equal(after.sectorIdx,3);
 assert.equal(after.missionIdx,1);
 assert.equal(after.rosterStats.juvia,33);
 assert.ok(after.roster.every(id=>!excludedIds.has(id)));
});

test('Salvataggi e altre campagne senza varianti vietate non vengono modificati',()=>{
 const state={roster:['jake','juvia'],rosterStats:{jake:50,juvia:77},protagonist:'jake',isStarted:true};
 assert.equal(sanitizeTournamentSave(state,CHARACTERS,storyIds),state);
 assert.ok(CAMPAIGNS.some(c=>c.id==='eco_anime'));
 assert.ok(CAMPAIGNS.some(c=>c.id==='monarch_akuma'));
});

const balance=[
 ['reghiaccio','Re Ghiaccio',[95,90,75,70],[108,103,84,80],'Vai Gunter!',30],
 ['juvia','Juvia',[90,100,70,80],[105,108,84,90],'Colpo impetuoso',95],
 ['jakedc','Jake (DC)',[90,90,75,85],[105,106,86,95],'Tom difendimi!',95],
 ['roserade','Roserade',[80,115,65,90],[100,118,80,100],'Gigassorbimento',95],
 ['mantide','Mantide',[70,110,60,115],[90,118,75,125],'Colpo della Mantide',82],
 ['spike','Spike',[85,115,65,90],[105,120,80,100],'Campo di Cactus',55],
 ['spyro','Spyro',[95,95,75,95],[110,112,85,105],'Pioggia di Gemme',32],
 ['poisonivy','Poison Ivy',[95,100,80,75],[105,110,92,90],'Radici Avvolgenti',82],
 ['kevin','Kevin',[110,100,100,50],[125,112,112,60],'Pugno Minerale',92],
 ['topolino','Topolino',[105,85,75,105],[115,100,85,110],'Colpo Cartoon',68]
];

test('Dieci Multimon svantaggiati ricevono esattamente i buff di statistiche e mosse previsti',()=>{
 assert.equal(balance.length,10);
 for(const [id,name,oldStats,newStats,move,power] of balance){
  const char=byId(id);
  assert.ok(char,'Personaggio non trovato: '+id);
  assert.equal(char.name,name);
  assert.deepEqual([char.hp,char.atk,char.def,char.spd],newStats,id);
  assert.equal(char.maxHp,char.hp,id+' maxHp allineati');
  assert.ok(newStats.reduce((a,b)=>a+b,0)>oldStats.reduce((a,b)=>a+b,0));
  assert.equal(MOVES_DB[move].power,power,'Potenza mossa '+move);
  assert.ok(char.moves.some(m=>m.name===move||m===MOVES_DB[move]),
   id+' deve possedere la propria mossa migliorata');
 }
});

test('Le quattro nuove passive usano tipologie già gestite dal motore di battaglia',()=>{
 const ice=byId('reghiaccio').passive;
 assert.equal(ice.type,'on_enter');
 assert.equal(ice.enemyStatDebuff.spd,0.85);
 assert.equal(ice.maxUses,1);
 const rain=byId('juvia').passive;
 assert.equal(rain.type,'rain_evasion');
 assert.ok(rain.desc.includes('20'));
 assert.equal(MOVES_DB['Colpo impetuoso'].rainstormChance,.25);
 const stone=byId('kevin').passive;
 assert.equal(stone.type,'on_hp_threshold');
 assert.equal(stone.statBuff.def,1.3);
 const mickey=byId('topolino').passive;
 assert.equal(mickey.type,'on_enter');
 assert.equal(mickey.teamStatBuff.def,1.1);
 assert.equal(mickey.maxUses,1);
 const battle=source('src/systems/battleSystem.js');
 for(const keyword of ['enemyStatDebuff','teamStatBuff','on_hp_threshold','statBuff']){
  assert.ok(battle.includes(keyword),'Motore non gestisce '+keyword);
 }
});
