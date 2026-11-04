import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {grantNormalClearChests,FULL_CLEAR_NORMAL_CHESTS} from '../src/systems/modeCompletionRewards.js';
import {grantRoguelikeCompletion,openPowerChest,POWER_CHEST_EVERY_FLOORS} from '../src/systems/roguelikePowerRewards.js';
import {claimCoopPersonalRewards} from '../src/systems/coopPersonalRewards.js';
import {updateLocalStatsImpl} from '../src/systems/profileSystem.js';
import {MODE_GUIDES} from '../src/components/ModeGuideData.js';
import {CHARACTERS} from '../src/data/characters.js';
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const empty=()=>({coins:140,strengthPoints:6,inventory:{pozione:4},unlockedChars:['sage'],wins:0,
 chests:{schemaVersion:1,earnedStageIds:['crisi_varco:m1'],pending:['crisi_varco:m1'],
  opened:[{stageId:'crisi_varco:m0',openedAt:11,rewards:[{kind:'coins',value:23}]}],activeReveal:null}});

test('Cinque casse NORMALI per la Roguelike Solo completata, senza duplicazione',()=>{
 assert.equal(FULL_CLEAR_NORMAL_CHESTS,5);
 const p=empty();
 const res=grantRoguelikeCompletion(p,'solo-finale',50,50,20000000);
 assert.equal(res.ok,true);
 assert.equal(res.points,30);
 assert.equal(res.normalChests,5);
 assert.equal(res.profile.chests.pending.length,6);
 assert.equal(res.profile.chests.earnedStageIds.length,6);
 assert.deepEqual(res.profile.chests.opened,p.chests.opened);
 assert.equal(res.profile.coins,140);
 assert.equal(res.profile.strengthPoints,36);
 assert.equal(grantRoguelikeCompletion(res.profile,'solo-finale',50,50,20000000).ok,false);
 assert.equal(grantNormalClearChests(res.profile,'solo-finale').granted,0);
 const early=grantRoguelikeCompletion(res.profile,'solo-2',50,50,21000000);
 assert.equal(early.ok,true);
 assert.equal(early.points,0,'Il cooldown finale di 4 ore rimane');
 assert.equal(early.normalChests,5,'Le casse per una nuova scalata sono indipendenti dal cooldown dei PF');
});

test('Co-op: ogni giocatore riceve monete personali e casse ogni cinque piani',()=>{
 const a=claimCoopPersonalRewards(empty(),'coop-stanza-a',12,false,50,20000000);
 const b=claimCoopPersonalRewards(empty(),'coop-stanza-a',12,false,50,20000000);
 assert.equal(a.ok,true);
 assert.deepEqual(a.milestones,[5,10]);
 assert.equal(a.profile.roguelikePower.pending.length,2);
 assert.ok(a.coins>=120&&a.coins<=180);
 assert.equal(a.profile.coins,140+a.coins);
 assert.equal(b.profile.coins,a.profile.coins,'Uguali progressi, stesso bottino deterministico');
 assert.deepEqual(a.profile.inventory,{pozione:4});
 assert.equal(a.profile.strengthPoints,6,'I PF sono accreditati aprendo le Casse Potenza, non automaticamente');
 const repeat=claimCoopPersonalRewards(a.profile,'coop-stanza-a',12,false,50,20000000);
 assert.equal(repeat.ok,false);
 assert.equal(repeat.coins,0);
 assert.equal(repeat.milestones.length,0);
 assert.equal(repeat.profile,a.profile);
});

test('Co-op: un compagno scollegato recupera automaticamente tutti i premi intermedi',()=>{
 const p=empty();
 const result=claimCoopPersonalRewards(p,'coop-stanza-b',49,false,50,20000000);
 assert.equal(result.ok,true);
 assert.deepEqual(result.milestones,[5,10,15,20,25,30,35,40,45]);
 assert.equal(result.profile.roguelikePower.pending.length,9);
 assert.equal(result.coinFloors.length,49);
 const second=claimCoopPersonalRewards(result.profile,'coop-stanza-b',50,true,50,20000000);
 assert.deepEqual(second.milestones,[50]);
 assert.equal(second.coinFloors.length,1);
 assert.equal(second.points,30);
 assert.equal(second.normalChests,5);
 assert.equal(second.profile.roguelikePower.pending.length,10);
 assert.equal(second.profile.chests.pending.length,6);
 assert.equal(second.profile.roguelikePower.rewardedCompletions.length,1);
 assert.equal(claimCoopPersonalRewards(second.profile,'coop-stanza-b',50,true,50,20000000).ok,false);
});

test('Co-op: il premio finale è individuale anche con cooldown, le casse restano cinque per run',()=>{
 const first=claimCoopPersonalRewards(empty(),'coop-1',50,true,50,20000000);
 const second=claimCoopPersonalRewards(first.profile,'coop-2',50,true,50,20100000);
 assert.equal(first.normalChests,5);
 assert.equal(first.points,30);
 assert.equal(second.normalChests,5);
 assert.equal(second.points,0);
 assert.equal(second.profile.chests.pending.length,11);
 assert.equal(second.profile.roguelikePower.pending.length,20);
 assert.equal(claimCoopPersonalRewards(second.profile,'coop-2',51,true,50,20100000).ok,false);
});

test('I bauli normali danno due premi e le Casse Potenza Co-op seguono le nuove fasce',()=>{
 const after=claimCoopPersonalRewards(empty(),'coop-k',5,false,50);
 const chest=openPowerChest(after.profile,()=>0);
 assert.equal(chest.ok,true);
 assert.equal(chest.points,3);
 const source=read('../src/systems/campaignChests.js');
 assert.match(source,/for\(let slot=0;slot<2;slot\+\+\)/);
 assert.equal(POWER_CHEST_EVERY_FLOORS,5);
});

test('Premi co-op persistiti in una sola operazione del profilo, non nella stanza condivisa',()=>{
 const old=globalThis.localStorage;
 const mem=new Map();
 globalThis.localStorage={getItem:key=>mem.get(key)||null,setItem:(key,value)=>mem.set(key,value)};
 try{
  const initial=empty();
  mem.set('multiverse_rpg_global_profile',JSON.stringify(initial));
  const ctx={getPlayerData:()=>JSON.parse(mem.get('multiverse_rpg_global_profile'))};
  const update={coopPersonalRewards:{runId:'coop-verified',lastClearFloor:10,finished:false,maxFloor:50}};
  const r=updateLocalStatsImpl(ctx,update);
  assert.equal(r.ok,true);
  assert.deepEqual(r.milestones,[5,10]);
  assert.ok(r.coins>=100);
  assert.equal(updateLocalStatsImpl(ctx,update).ok,false,'Non scrive due volte gli stessi premi');
  const p=ctx.getPlayerData();
  assert.equal(p.roguelikePower.pending.length,2);
  assert.ok(p.coins>initial.coins);
 }finally{globalThis.localStorage=old}
});

test('Ogni voce del menu ha un personaggio diverso e due spiegazioni leggibili',()=>{
 const required=['online_players','create_room','join_room','campaign','vs_cpu','rogue_solo',
   'rogue_coop','survival','local','catalog','type_chart','chests','power_chests',
   'strength_lab','shop','stats'];
 assert.deepEqual(Object.keys(MODE_GUIDES).sort(),required.sort());
 const ids=new Set();
 for(const [key,g] of Object.entries(MODE_GUIDES)){
   assert.ok(!ids.has(g.character),'Personaggio tutorial ripetuto: '+g.character);
   ids.add(g.character);
   assert.ok(CHARACTERS.some(c=>c.id===g.character&&c.img),key+' senza ritratto');
   assert.equal(g.lines.length,2,key);
   assert.ok(g.lines.every(line=>line.length>=35&&line.length<=300),key);
 }
 assert.equal(MODE_GUIDES.vs_cpu.character,'goku');
 assert.equal(MODE_GUIDES.shop.character,'plankton');
 const menu=read('../src/screens/hub/MenuView.jsx');
 for(const key of required)assert.ok(menu.includes("startWithModeGuide('"+key+"'"),key+' non collegato');
 const app=read('../src/App.jsx');
 assert.match(app,/modeGuideSeen\?\.\[key\]/);
 assert.match(app,/markModeGuideSeen:pending\.key/);
 assert.match(app,/FirstVisitModeGuide/);
});

test('La Co-op controlla identità Firebase e accredita la ricompensa su OGNI client',()=>{
 const app=read('../src/App.jsx');
 assert.match(app,/gameState\.playerUids\?\.\[playerRole\]!==user\.uid/);
 assert.match(app,/coopPersonalRewards:\{/);
 assert.match(app,/gameState\.coopRun\?\.lastClearFloor/);
 assert.match(app,/getPlayerData\(\)/);
 const coop=read('../src/systems/coopExpedition.js');
 assert.match(coop,/lastClearFloor:floor/);
 assert.match(coop,/finished:complete/);
 const flow=read('../src/systems/roguelikeSystem.js');
 assert.match(flow,/runId:'coop-'\+newRoomId/);
});
