import { CHAR_PRICES } from '../data/prices.js';
import { getCompletedCampaigns } from './campaignUnlocks.js';

export const CHEST_DROP_RATES=Object.freeze({healing:40,strength:28,coins:25,character:4,held:3});
export const CHEST_STRENGTH_DROPS=Object.freeze([
  {value:5,weight:32},{value:7,weight:24},{value:9,weight:20},
  {value:15,weight:13},{value:20,weight:8},{value:40,weight:3}
]);
export const CHEST_HEALING_DROPS=Object.freeze([
  {id:'pozione',count:2,weight:44},{id:'cura_status',count:2,weight:20},
  {id:'pozione_rigenerante',count:1,weight:16},
  {id:'cura_totale',count:1,weight:13},{id:'resurrezione',count:1,weight:7}
]);
const roll=(random)=>Math.min(.999999999,Math.max(0,Number(random())||0));
function weighted(items,random) {
  const total=items.reduce((n,item)=>n+item.weight,0);
  let index=roll(random)*total;
  for(const item of items){index-=item.weight;if(index<0)return item;}
  return items[items.length-1];
}
export function chestStageId(campaignId,missionId){return campaignId+':'+missionId;}
export function getCompletedStageIds(campaigns,storage){
  if(!storage)return [];
  const finished=getCompletedCampaigns(storage);
  const ids=[];
  for(const campaign of campaigns){
    let save=null;
    try{save=JSON.parse(storage.getItem('multiverse_rpg_campaign_save_'+campaign.id)||'null')}catch{}
    const allDone=save?.completed===true||finished[campaign.id]===true;
    if(!save&&!allDone)continue;
    const sectorIndex=Number(save?.sectorIdx)||0,missionIndex=Number(save?.missionIdx)||0;
    campaign.sectors.forEach((sector,s)=>{
      sector.missions.forEach((mission,m)=>{
        if(allDone || s<sectorIndex || s===sectorIndex&&m<missionIndex)
          ids.push(chestStageId(campaign.id,mission.id));
      });
    });
  }
  return ids;
}
export const emptyChestState=()=>({schemaVersion:1,earnedStageIds:[],pending:[],opened:[],activeReveal:null});
export function migrateCampaignChests(profile,campaigns,storage){
  const existing=profile?.chests||emptyChestState();
  const earned=new Set(existing.earnedStageIds||[]);
  const fresh=getCompletedStageIds(campaigns,storage).filter(id=>!earned.has(id));
  const needsMigration=!profile?.chests || fresh.length>0;
  if(!needsMigration)return {profile,changed:false,awarded:0};
  const chests={...emptyChestState(),...existing,
    earnedStageIds:[...earned,...fresh],
    pending:[...(existing.pending||[]),...fresh]};
  return {profile:{...profile,chests},changed:true,awarded:fresh.length};
}
export function awardCampaignChest(profile,campaignId,missionId){
  if(!campaignId||!missionId)return {ok:false,profile};
  const id=chestStageId(campaignId,missionId);
  const chests=profile.chests||emptyChestState();
  if((chests.earnedStageIds||[]).includes(id))return {ok:false,profile};
  return {ok:true,profile:{...profile,chests:{...emptyChestState(),...chests,
    earnedStageIds:[...(chests.earnedStageIds||[]),id],
    pending:[...(chests.pending||[]),id]}}};
}
function randomChestReward(profile,characters,items,random){
  const category=weighted(Object.entries(CHEST_DROP_RATES).map(([id,weight])=>({id,weight})),random).id;
  if(category==='strength')
    return {kind:'strength',value:weighted(CHEST_STRENGTH_DROPS,random).value};
  if(category==='coins')return {kind:'coins',value:15+Math.floor(roll(random)*36)};
  if(category==='healing'){
    const drop=weighted(CHEST_HEALING_DROPS,random);
    return {kind:'healing',id:drop.id,count:drop.count,name:items[drop.id]?.name||drop.id};
  }
  if(category==='held'){
    const available=Object.values(items).filter(item=>item.type==='held'&&!profile.inventory?.[item.id]);
    if(!available.length)return {kind:'strength',value:20,convertedFrom:'held'};
    const item=available[Math.floor(roll(random)*available.length)];
    return {kind:'held',id:item.id,count:1,name:item.name};
  }
  const available=characters.filter(char=>CHAR_PRICES[char.id]>0 &&
    !char.isSecretUnlock&&!char.isSummonOnly&&!char.isCampaignMonster&&!char.fusionOf &&
    !(profile.unlockedChars||[]).includes(char.id));
  if(!available.length)return {kind:'strength',value:40,convertedFrom:'character'};
  const char=available[Math.floor(roll(random)*available.length)];
  return {kind:'character',id:char.id,name:char.name,img:char.img};
}
function awardDrop(profile,drop){
  const updated={...profile};
  if(drop.kind==='strength')updated.strengthPoints=(updated.strengthPoints||0)+drop.value;
  if(drop.kind==='coins')updated.coins=(updated.coins||0)+drop.value;
  if(drop.kind==='healing'||drop.kind==='held')
    updated.inventory={...(updated.inventory||{}),[drop.id]:
      drop.kind==='held'?1:(updated.inventory?.[drop.id]||0)+drop.count};
  if(drop.kind==='character')updated.unlockedChars=[...(updated.unlockedChars||[]),drop.id];
  return updated;
}
export function openCampaignChest(profile,characters,items,random=Math.random){
  const chests=profile?.chests||emptyChestState();
  if(chests.activeReveal)return {ok:false,reason:'Ritira prima le due ricompense del baule aperto.',profile};
  if(!chests.pending?.length)return {ok:false,reason:'Non hai bauli da aprire.',profile};
  const stageId=chests.pending[0];
  let updated=profile;
  const rewards=[];
  for(let slot=0;slot<2;slot++){
    const reward=randomChestReward(updated,characters,items,random);
    rewards.push(reward);
    updated=awardDrop(updated,reward);
  }
  const receipt={stageId,rewards,openedAt:Date.now()};
  const next={...chests,pending:chests.pending.slice(1),
    opened:[...(chests.opened||[]),receipt],activeReveal:receipt};
  return {ok:true,rewards,receipt,profile:{...updated,chests:next}};
}
export function acknowledgeChestReveal(profile){
  if(!profile?.chests?.activeReveal)return {ok:false,profile};
  return {ok:true,profile:{...profile,chests:{...profile.chests,activeReveal:null}}};
}
