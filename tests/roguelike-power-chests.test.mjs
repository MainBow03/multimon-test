import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {grantRoguelikeMilestone,grantRoguelikeCompletion,roguelikeBonusRemaining,
  openPowerChest,acknowledgePowerChest,completeFinnTutorial,FINN_CHEST_IMAGE,
  ROGUELIKE_FULL_CLEAR_COOLDOWN_MS,POWER_CHEST_MIN,POWER_CHEST_MAX,POWER_CHEST_TIERS,
  powerChestRangeForFloor,powerChestRangeForStage} from '../src/systems/roguelikePowerRewards.js';
import {updateLocalStatsImpl} from '../src/systems/profileSystem.js';
const profile=()=>({coins:200,strengthPoints:0,strengthUpgrades:{},inventory:{},unlockedChars:[],chars:{},moves:{},matches:0,wins:0,playtime:0});
const read=(path)=>readFileSync(new URL(path,import.meta.url),'utf8');
test('Cassa Potenza ogni 5 piani completati, mai in altri piani',()=>{
 let p=profile();
 for(const floor of [1,3,4,6,9,11,14,19,49]){
   assert.equal(grantRoguelikeMilestone(p,'run-xyz',floor).ok,false);
 }
 for(const floor of [5,10,15,20,25,30,35,40,45,50]){
   const res=grantRoguelikeMilestone(p,'run-xyz',floor);
   assert.equal(res.ok,true,'Piano '+floor);
   p=res.profile;
 }
 assert.equal(p.roguelikePower.pending.length,10);
 assert.equal(new Set(p.roguelikePower.pending).size,10);
 for(const floor of [5,10,50])
   assert.equal(grantRoguelikeMilestone(p,'run-xyz',floor).ok,false,'Nessun doppio premio al piano '+floor);
 assert.equal(grantRoguelikeMilestone(p,'second-run',5).ok,true,'La nuova run può ottenere altre casse');
 assert.equal(grantRoguelikeMilestone(p,'',5).ok,false);
});

test('Casse Potenza: quattro fasce progressive in base al piano raggiunto',()=>{
 const table=[
  {floor:5,min:3,max:8},{floor:10,min:3,max:8},{floor:15,min:3,max:8},
  {floor:20,min:5,max:11},{floor:25,min:5,max:11},{floor:30,min:5,max:11},
  {floor:35,min:7,max:14},{floor:40,min:7,max:14},{floor:45,min:7,max:14},
  {floor:50,min:10,max:18}
 ];
 assert.deepEqual(POWER_CHEST_TIERS,[
  {from:5,to:15,min:3,max:8},
  {from:20,to:30,min:5,max:11},
  {from:35,to:45,min:7,max:14},
  {from:50,to:50,min:10,max:18}
 ]);
 assert.equal(POWER_CHEST_MIN,3);
 assert.equal(POWER_CHEST_MAX,18);
 for(const tier of table){
  assert.equal(powerChestRangeForFloor(tier.floor).min,tier.min);
  assert.equal(powerChestRangeForFloor(tier.floor).max,tier.max);
  for(const [roll,expected] of [[0,tier.min],[.999999,tier.max]]){
   const p=grantRoguelikeMilestone(profile(),'solo-'+tier.floor,tier.floor).profile;
   const result=openPowerChest(p,()=>roll,12345);
   assert.equal(result.ok,true,'Piano '+tier.floor);
   assert.equal(result.points,expected,'Piano '+tier.floor+', roll '+roll);
   assert.equal(result.profile.strengthPoints,expected);
   assert.equal(result.profile.roguelikePower.activeReveal.points,expected);
   assert.equal(result.profile.roguelikePower.pending.length,0);
   assert.equal(openPowerChest(result.profile,()=>roll).ok,false);
   const acknowledged=acknowledgePowerChest(result.profile);
   assert.equal(acknowledged.ok,true);
   assert.equal(acknowledged.profile.strengthPoints,expected);
  }
 }
 assert.equal(openPowerChest(profile(),()=>0).ok,false);
});

test('L’importo dipende dall’ID della cassa, anche in Co-op e per casse vecchie non aperte',()=>{
 let p=profile();
 for(const floor of [5,20,35,50]){
  p=grantRoguelikeMilestone(p,'coop-example',floor).profile;
 }
 const expected=[[5,3,8],[20,5,11],[35,7,14],[50,10,18]];
 for(const [floor,min,max] of expected){
  const stage=p.roguelikePower.pending[0];
  assert.equal(stage,'coop-example:'+floor);
  assert.equal(powerChestRangeForStage(stage).min,min);
  assert.equal(powerChestRangeForStage(stage).max,max);
  const opened=openPowerChest(p,()=>.999,12345);
  assert.equal(opened.points,max);
  p=acknowledgePowerChest(opened.profile).profile;
 }
 assert.equal(p.roguelikePower.pending.length,0);
 // Legacy: se un vecchio salvataggio non registra il piano, nessun crash.
 const legacy={...profile(),roguelikePower:{pending:['vecchia-cassa'],opened:[],earnedMilestones:[]}};
 assert.equal(powerChestRangeForStage('vecchia-cassa').min,2);
 assert.equal(openPowerChest(legacy,()=>0).points,2);
});

test('Vittoria Roguelike: +30 PF solo al primo clear valido e di nuovo dopo 4h',()=>{
 assert.equal(ROGUELIKE_FULL_CLEAR_COOLDOWN_MS,14400000);
 const now=18000000;
 assert.equal(grantRoguelikeCompletion(profile(),'win',49,50,now).ok,false);
 const first=grantRoguelikeCompletion(profile(),'win-1',50,50,now);
 assert.equal(first.ok,true);assert.equal(first.rewarded,true);assert.equal(first.points,30);
 assert.equal(first.profile.strengthPoints,30);
 assert.equal(roguelikeBonusRemaining(first.profile,now),14400000);
 assert.equal(grantRoguelikeCompletion(first.profile,'win-1',50,50,now+14400000).ok,false);
 const early=grantRoguelikeCompletion(first.profile,'win-2',50,50,now+1000000);
 assert.equal(early.ok,true);assert.equal(early.rewarded,false);assert.equal(early.points,0);
 assert.equal(early.profile.strengthPoints,30);
 assert.equal(early.profile.roguelikePower.lastFullClearRewardAt,now);
 assert.equal(grantRoguelikeCompletion(early.profile,'win-2',50,50,now+15000000).ok,false);
 const later=grantRoguelikeCompletion(early.profile,'win-3',50,50,now+14400000);
 assert.equal(later.ok,true);assert.equal(later.rewarded,true);
 assert.equal(later.profile.strengthPoints,60);
 assert.equal(roguelikeBonusRemaining(later.profile,now+14400000),14400000);
});

test('Le due spiegazioni di Finn si sbloccano separatamente e restano viste',()=>{
 let p=profile();
 const camp=completeFinnTutorial(p,'campaign');
 assert.equal(camp.ok,true);
 p=camp.profile;
 assert.equal(p.roguelikePower.campaignTutorialSeen,true);
 assert.equal(p.roguelikePower.powerTutorialSeen,false);
 assert.equal(completeFinnTutorial(p,'campaign').ok,false);
 const power=completeFinnTutorial(p,'power');
 assert.equal(power.ok,true);
 assert.equal(power.profile.roguelikePower.powerTutorialSeen,true);
 assert.equal(power.profile.roguelikePower.campaignTutorialSeen,true);
 assert.equal(completeFinnTutorial(p,'invalid').ok,false);
 assert.match(FINN_CHEST_IMAGE,/afd3975c34007f3d6a888de9e6b416e0.jpg/);
});

test('Il profilo salva casse, ricompense, mini-dialoghi e cooldown con operazioni già esistenti',()=>{
 const old=globalThis.localStorage;
 const store=new Map();
 globalThis.localStorage={
   getItem:key=>store.get(key)||null,
   setItem:(key,val)=>store.set(key,val)
 };
 try{
   const getPlayerData=()=>JSON.parse(store.get('multiverse_rpg_global_profile')||JSON.stringify(profile()));
   assert.equal(updateLocalStatsImpl({getPlayerData},{roguelikeMilestone:{runId:'run-a',floor:5}}).ok,true);
   assert.equal(updateLocalStatsImpl({getPlayerData},{roguelikeMilestone:{runId:'run-a',floor:5}}).ok,false);
   assert.equal(updateLocalStatsImpl({getPlayerData},{openPowerChest:true}).ok,true);
   const p=getPlayerData();
   assert.ok(p.strengthPoints>=3&&p.strengthPoints<=8);
   assert.equal(updateLocalStatsImpl({getPlayerData},{openPowerChest:true}).ok,false);
   assert.equal(updateLocalStatsImpl({getPlayerData},{acknowledgePowerChest:true}).ok,true);
   assert.equal(updateLocalStatsImpl({getPlayerData},{completeFinnTutorial:'campaign'}).ok,true);
   assert.equal(updateLocalStatsImpl({getPlayerData},{completeFinnTutorial:'power'}).ok,true);
   assert.equal(getPlayerData().roguelikePower.campaignTutorialSeen,true);
   assert.equal(getPlayerData().roguelikePower.powerTutorialSeen,true);
 }finally{globalThis.localStorage=old}
});

test('Menu separati, Finn nel baule campagna, mini-dialogo indipendente e timer visibile',()=>{
 const menu=read('../src/screens/hub/MenuView.jsx');
 assert.match(menu,/setAppMode\('chests'\)/);
 assert.match(menu,/setAppMode\('power_chests'\)/);
 assert.match(menu,/runId: 'run-'/);
 const app=read('../src/App.jsx');
 assert.match(app,/appMode === 'power_chests'/);
 assert.match(app,/onTutorialComplete=\{type=>updateLocalStats\(\{completeFinnTutorial:type\}\)\}/);
 const campaign=read('../src/screens/hub/CampaignChestsView.jsx');
 assert.match(campaign,/campaignTutorialSeen/);
 assert.match(campaign,/FinnChestTutorial kind="campaign"/);
 const power=read('../src/screens/hub/PowerChestsView.jsx');
 assert.match(power,/FinnChestTutorial kind="power"/);
 assert.match(power,/setInterval/);
 assert.match(power,/roguelikeBonusRemaining/);
 const tutorial=read('../src/screens/hub/FinnChestTutorial.jsx');
 assert.match(tutorial,/FINN_CAMPAIGN_CHEST_DIALOGUES/);
 assert.match(tutorial,/FINN_POWER_CHEST_DIALOGUES/);
 assert.match(tutorial,/matematico/i);
});

test('Ricompense assegnate solo a piani effettivamente superati o dopo boss finale',()=>{
 const map=read('../src/screens/roguelike/RoguelikeMapView.jsx');
 const victory=read('../src/screens/battle/GameoverView.jsx');
 assert.match(map,/roguelikeState\.floor%5===0/);
 assert.match(map,/updateLocalStats\(\{roguelikeMilestone:/);
 assert.match(victory,/roguelikeState\.floor%5===0/);
 assert.match(victory,/updateLocalStats\(\{roguelikeComplete:/);
 assert.match(victory,/if \(isWin\)/);
 assert.match(victory,/setRoguelikeState\(\{ isStarted: false, roster: \[\] \}\)/);
});
