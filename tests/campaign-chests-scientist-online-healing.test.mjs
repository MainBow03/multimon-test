import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CAMPAIGNS} from '../src/data/campaigns.js';
import {CHARACTERS} from '../src/data/characters.js';
import {ITEMS_DB} from '../src/data/items.js';
import {getCompletedStageIds,migrateCampaignChests,awardCampaignChest,openCampaignChest,acknowledgeChestReveal,CHEST_DROP_RATES,
  CHEST_STRENGTH_DROPS} from '../src/systems/campaignChests.js';
import {updateLocalStatsImpl} from '../src/systems/profileSystem.js';
import {canTrainCharacter,strengthLevel,grantTutorialStrengthUpgrade} from '../src/systems/strengthLab.js';
import {ONLINE_HEAL_ITEM_LIMIT,isLimitedHealingItem,onlineHealingRemaining} from '../src/systems/onlineHealingLimit.js';
import {initialGameState} from '../src/systems/gameState.js';

const fakeStorage=entries=>{
 const map=new Map(Object.entries(entries));
 return {getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k),_map:map};
};
const base=()=>({coins:100,strengthPoints:0,strengthUpgrades:{},unlockedChars:['kirby'],inventory:{pozione:0},chars:{},moves:{},matches:0,wins:0,playtime:0});
const nextRng=(...values)=>{let i=0;return ()=>values[i++%values.length]};
test('Le tre campagne attribuiscono bauli retroattivi da sectorIdx e missionIdx',()=>{
 const first=CAMPAIGNS[0];
 const save={isStarted:true,sectorIdx:1,missionIdx:2,completed:false};
 const storage=fakeStorage({['multiverse_rpg_campaign_save_'+first.id]:JSON.stringify(save)});
 const ids=getCompletedStageIds(CAMPAIGNS,storage);
 const expected=first.sectors[0].missions.length+2;
 assert.equal(ids.length,expected);
 assert.equal(ids[0],first.id+':'+first.sectors[0].missions[0].id);
 assert.equal(ids[ids.length-1],first.id+':'+first.sectors[1].missions[1].id);
 let migrated=migrateCampaignChests(base(),CAMPAIGNS,storage);
 assert.equal(migrated.awarded,expected);
 assert.equal(migrated.profile.chests.pending.length,expected);
 const again=migrateCampaignChests(migrated.profile,CAMPAIGNS,storage);
 assert.equal(again.changed,false);
 assert.equal(again.profile.chests.pending.length,expected,'Una migrazione doppia non deve regalare altri bauli');
});
test('Campagna già completata: tutte le missioni, compresa l’ultima',()=>{
 const camp=CAMPAIGNS[0],total=camp.sectors.flatMap(s=>s.missions).length;
 const storage=fakeStorage({['multiverse_rpg_campaign_save_'+camp.id]:JSON.stringify({
  isStarted:true,sectorIdx:camp.sectors.length-1,missionIdx:camp.sectors.at(-1).missions.length-1,completed:true
 })});
 assert.equal(getCompletedStageIds(CAMPAIGNS,storage).length,total);
});
test('La stessa missione non assegna mai due bauli e non viene riassegnata dalla migrazione',()=>{
 const campaign=CAMPAIGNS[0],mission=campaign.sectors[0].missions[0].id;
 const first=awardCampaignChest(base(),campaign.id,mission);
 assert.equal(first.ok,true);
 const second=awardCampaignChest(first.profile,campaign.id,mission);
 assert.equal(second.ok,false);
 assert.equal(second.profile.chests.pending.length,1);
 const saved=fakeStorage({['multiverse_rpg_campaign_save_'+campaign.id]:JSON.stringify({isStarted:true,sectorIdx:0,missionIdx:1})});
 const migration=migrateCampaignChests(first.profile,CAMPAIGNS,saved);
 assert.equal(migration.awarded,0);
 assert.equal(migration.profile.chests.pending.length,1);
});
test('Ogni baule genera DUE estrazioni indipendenti, anche identiche, e accredita i Punti Forza',()=>{
 assert.deepEqual(CHEST_DROP_RATES,{healing:40,strength:28,coins:25,character:4,held:3});
 assert.equal(Object.values(CHEST_DROP_RATES).reduce((a,b)=>a+b,0),100);
 assert.deepEqual(CHEST_STRENGTH_DROPS.map(x=>x.value),[5,7,9,15,20,40]);
 let profile=awardCampaignChest(base(),'crisi_varco','m1').profile;
 const opened=openCampaignChest(profile,CHARACTERS,ITEMS_DB,nextRng(.45,.01,.45,.01));
 assert.equal(opened.ok,true);
 assert.deepEqual(opened.rewards.map(x=>[x.kind,x.value]),[['strength',5],['strength',5]]);
 assert.equal(opened.profile.strengthPoints,10);
 assert.equal(opened.profile.chests.pending.length,0);
 assert.equal(opened.profile.chests.opened.length,1);
 assert.equal(opened.profile.chests.opened[0].rewards.length,2);
 assert.equal(openCampaignChest(opened.profile,CHARACTERS,ITEMS_DB,()=>.9).ok,false,'Il risultato già aperto non può essere ritirato due volte');
 const claimed=acknowledgeChestReveal(opened.profile);
 assert.equal(claimed.ok,true);
 assert.equal(claimed.profile.chests.activeReveal,null);
 assert.equal(claimed.profile.strengthPoints,10);
 assert.equal(openCampaignChest(claimed.profile,CHARACTERS,ITEMS_DB,()=>.9).ok,false);
});
test('Multimon premio sbloccato e oggetti da combattimento non duplicabili',()=>{
 let profile=awardCampaignChest(base(),'crisi_varco','m1').profile;
 // 94% rientra nella fascia Multimon (40+28+25 = 93)
 const opened=openCampaignChest(profile,CHARACTERS,ITEMS_DB,nextRng(.94,0,.94,0));
 assert.equal(opened.rewards[0].kind,'character');
 assert.equal(opened.rewards[1].kind,'character');
 assert.notEqual(opened.rewards[0].id,opened.rewards[1].id);
 assert.ok(opened.profile.unlockedChars.includes(opened.rewards[0].id));
 assert.ok(opened.profile.unlockedChars.includes(opened.rewards[1].id));
 let allOwned={...profile,inventory:Object.fromEntries(Object.values(ITEMS_DB)
  .filter(i=>i.type==='held').map(i=>[i.id,1]))};
 const converted=openCampaignChest(allOwned,CHARACTERS,ITEMS_DB,nextRng(.99,.99));
 assert.deepEqual(converted.rewards.map(r=>r.value),[20,20]);
 assert.equal(converted.profile.strengthPoints,40);
});
test('Regalo tutorial gratuito: +1 senza spendere punti, una sola volta e solo per personaggio posseduto',()=>{
 const kirby=CHARACTERS.find(x=>x.id==='kirby');
 const gift=grantTutorialStrengthUpgrade(base(),kirby,'atk');
 assert.equal(gift.ok,true);
 assert.equal(gift.profile.strengthPoints,0);
 assert.equal(strengthLevel(gift.profile.strengthUpgrades,kirby.id,'atk'),2);
 assert.equal(gift.profile.freeLabUpgradeUsed,true);
 assert.equal(grantTutorialStrengthUpgrade(gift.profile,kirby,'def').ok,false);
 const locked=CHARACTERS.find(c=>!canTrainCharacter(c,base())&&!c.isSummonOnly&&!c.isSecretUnlock);
 assert.ok(locked);
 assert.equal(grantTutorialStrengthUpgrade(base(),locked,'atk').ok,false);
});
test('Accredito premi, tutorial e doppia apertura bloccata persistono nel profilo',()=>{
 const previous=globalThis.localStorage;
 const storage=fakeStorage();
 globalThis.localStorage=storage;
 try{
   const key='multiverse_rpg_global_profile';
   const read=()=>JSON.parse(storage.getItem(key)||JSON.stringify(base()));
   assert.equal(updateLocalStatsImpl({getPlayerData:read},{awardCampaignChest:{campaignId:'crisi_varco',missionId:'m1'}}).ok,true);
   assert.equal(read().chests.pending.length,1);
   assert.equal(updateLocalStatsImpl({getPlayerData:read},{openCampaignChest:true}).ok,true);
   assert.equal(read().chests.opened.length,1);
   assert.equal(updateLocalStatsImpl({getPlayerData:read},{openCampaignChest:true}).ok,false);
   assert.equal(updateLocalStatsImpl({getPlayerData:read},{acknowledgeChestReveal:true}).ok,true);
   assert.equal(updateLocalStatsImpl({getPlayerData:read},{freeLabUpgrade:{charId:'kirby',stat:'def'}}).ok,true);
   assert.equal(updateLocalStatsImpl({getPlayerData:read},{freeLabUpgrade:{charId:'kirby',stat:'spd'}}).ok,false);
   assert.equal(read().freeLabUpgradeUsed,true);
 }finally{globalThis.localStorage=previous}
});
test('Lotte online: massimo 3 consumabili curativi per giocatore, non per squadra né in campagna',()=>{
 assert.equal(ONLINE_HEAL_ITEM_LIMIT,3);
 const state=initialGameState();
 for(const id of ['pozione','cura_totale','resurrezione','cura_status','pozione_rigenerante'])
  assert.equal(isLimitedHealingItem(ITEMS_DB[id]),true,id);
 assert.equal(isLimitedHealingItem(ITEMS_DB['germoglio_curativo']),false);
 assert.equal(onlineHealingRemaining(state,'p1','online_room',ITEMS_DB),3);
 state.healingItemsUsed.p1=2;
 assert.equal(onlineHealingRemaining(state,'p1','online_room',ITEMS_DB),1);
 state.actions.p1={0:{type:'use_item',itemId:'pozione'}};
 assert.equal(onlineHealingRemaining(state,'p1','online_room',ITEMS_DB),0);
 assert.equal(onlineHealingRemaining(state,'p2','online_room',ITEMS_DB),3);
 assert.equal(onlineHealingRemaining(state,'p1','local_room',ITEMS_DB),Infinity);
 state.isCampaignBattle=true;
 assert.equal(onlineHealingRemaining(state,'p1','online_room',ITEMS_DB),Infinity);
});
test('Entrambi i controlli UI + motore sono integrati: non solo limitazione visiva',()=>{
 const battle=readFileSync(new URL('../src/systems/battleSystem.js',import.meta.url),'utf8');
 assert.match(battle,/workingHealingItemsUsed\[player\]=used\+1/);
 assert.match(battle,/used>=ONLINE_HEAL_ITEM_LIMIT/);
 assert.match(battle,/healingItemsUsed: workingHealingItemsUsed/);
 assert.match(battle,/onlineHealingRemaining\(gameState,playerRole,appMode,ITEMS_DB\)/);
 const ui=readFileSync(new URL('../src/screens/battle/BattlingView.jsx',import.meta.url),'utf8');
 assert.match(ui,/curativesLeft<=0/);
 assert.match(ui,/Strumenti curativi online/);
 const campaign=readFileSync(new URL('../src/systems/campaignFlow.js',import.meta.url),'utf8');
 assert.match(campaign,/awardCampaignChest/);
 const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
 assert.match(app,/migrateCampaignChests\(data,CAMPAIGNS,localStorage\)/);
 assert.match(app,/appMode === 'chests'/);
 assert.match(app,/onTutorialUpgrade=/);
});
test('Bauli SVG senza emoji e tutorial con ritratto originale',()=>{
 const chest=readFileSync(new URL('../src/screens/hub/CampaignChestsView.jsx',import.meta.url),'utf8');
 assert.match(chest,/<svg viewBox="0 0 520 420"/);
 assert.match(chest,/vault-reward-in/);
 assert.match(chest,/Rivela premio/);
 const tutor=readFileSync(new URL('../src/screens/hub/ScientistTutorial.jsx',import.meta.url),'utf8');
 assert.match(tutor,/b7de72241371a88fad1b5eab4ae79810.jpg/);
 assert.match(tutor,/freeLabUpgradeUsed/);
 assert.match(tutor,/onFreeUpgrade\(character.id,stat\)/);
});
