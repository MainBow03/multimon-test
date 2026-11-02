// Due tipi di casse distinti: queste sono solo per la Roguelike e contengono
// esclusivamente Punti Forza. I bauli campagna rimangono separati.
export const POWER_CHEST_MIN=2;
export const POWER_CHEST_MAX=8;
export const POWER_CHEST_EVERY_FLOORS=5;
export const ROGUELIKE_FULL_CLEAR_REWARD=30;
export const ROGUELIKE_FULL_CLEAR_COOLDOWN_MS=4*60*60*1000;
export const FINN_CHEST_IMAGE='https://i.pinimg.com/736x/af/d3/97/afd3975c34007f3d6a888de9e6b416e0.jpg';
export const emptyRoguelikePower=()=>({
  pending:[],opened:[],earnedMilestones:[],
  rewardedCompletions:[],lastFullClearRewardAt:0,
  powerTutorialSeen:false,campaignTutorialSeen:false,
  activeReveal:null
});
const getPower=p=>({...emptyRoguelikePower(),...(p?.roguelikePower||{})});
export const roguelikeMilestoneKey=(runId,floor)=>runId+':'+floor;
export function grantRoguelikeMilestone(profile,runId,floor){
  if(typeof runId!=='string'||!runId.trim()||!Number.isInteger(floor)||
     floor<POWER_CHEST_EVERY_FLOORS||floor%POWER_CHEST_EVERY_FLOORS!==0)
    return {ok:false,reason:'Traguardo Roguelike non valido.',profile};
  const power=getPower(profile),key=roguelikeMilestoneKey(runId,floor);
  if(power.earnedMilestones.includes(key))return {ok:false,reason:'Cassa già ottenuta in questa run.',profile};
  return {ok:true,profile:{...profile,roguelikePower:{...power,
    pending:[...power.pending,key],earnedMilestones:[...power.earnedMilestones,key]
  }}};
}
export function roguelikeBonusRemaining(profile,now=Date.now()){
  const last=Number(getPower(profile).lastFullClearRewardAt)||0;
  return last?Math.max(0,ROGUELIKE_FULL_CLEAR_COOLDOWN_MS-(now-last)):0;
}
export function grantRoguelikeCompletion(profile,runId,completedFloor,maxFloor,now=Date.now()){
  if(typeof runId!=='string'||!runId.trim()||
      !Number.isInteger(completedFloor)||!Number.isInteger(maxFloor)||
      completedFloor!==maxFloor||completedFloor<1)
    return {ok:false,reason:'La Roguelike non è ancora completata.',profile};
  const power=getPower(profile);
  if(power.rewardedCompletions.includes(runId))return {ok:false,reason:'Vittoria già registrata.',profile};
  const cooldown=roguelikeBonusRemaining(profile,now);
  const eligible=cooldown===0;
  return {ok:true,rewarded:eligible,points:eligible?ROGUELIKE_FULL_CLEAR_REWARD:0,
    remainingMs:eligible?ROGUELIKE_FULL_CLEAR_COOLDOWN_MS:cooldown,
    profile:{...profile,strengthPoints:(profile.strengthPoints||0)+(eligible?ROGUELIKE_FULL_CLEAR_REWARD:0),
      roguelikePower:{...power,rewardedCompletions:[...power.rewardedCompletions,runId],
        lastFullClearRewardAt:eligible?now:power.lastFullClearRewardAt}}};
}
export function openPowerChest(profile,random=Math.random,now=Date.now()){
  const power=getPower(profile);
  if(power.activeReveal)return {ok:false,reason:'Conferma prima la ricompensa precedente.',profile};
  if(!power.pending.length)return {ok:false,reason:'Non hai Casse Potenza da aprire.',profile};
  const r=Math.min(.999999999,Math.max(0,Number(random())||0));
  const amount=POWER_CHEST_MIN+Math.floor(r*(POWER_CHEST_MAX-POWER_CHEST_MIN+1));
  const receipt={id:power.pending[0],points:amount,openedAt:now};
  return {ok:true,receipt,points:amount,profile:{
    ...profile,strengthPoints:(profile.strengthPoints||0)+amount,
    roguelikePower:{...power,pending:power.pending.slice(1),
      opened:[...power.opened,receipt],activeReveal:receipt}
  }};
}
export function acknowledgePowerChest(profile){
  const power=getPower(profile);
  if(!power.activeReveal)return {ok:false,profile};
  return {ok:true,profile:{...profile,roguelikePower:{...power,activeReveal:null}}};
}
export function completeFinnTutorial(profile,type){
  if(type!=='campaign'&&type!=='power')return {ok:false,profile};
  const power=getPower(profile);
  const key=type==='campaign'?'campaignTutorialSeen':'powerTutorialSeen';
  if(power[key])return {ok:false,profile};
  return {ok:true,profile:{...profile,roguelikePower:{...power,[key]:true}}};
}
