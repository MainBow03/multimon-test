// Le ricompense Co-op appartengono al profilo personale, non alla stanza.
// La stanza Firestore certifica il piano; ogni partecipante le riscatta
// separatamente. Chi era offline riceve i premi arretrati al rientro.
import {grantRoguelikeMilestone,grantRoguelikeCompletion,POWER_CHEST_EVERY_FLOORS}
 from './roguelikePowerRewards.js';

export function claimCoopPersonalRewards(profile,runId,lastClearFloor,finished=false,maxFloor=50,now=Date.now()){
 if(typeof runId!=='string'||!runId.trim()||
    !Number.isInteger(lastClearFloor)||lastClearFloor<1||
    !Number.isInteger(maxFloor)||maxFloor<1||maxFloor>100)
   return {ok:false,profile,reason:'Progresso Co-op non valido.',milestones:[],normalChests:0,points:0};
 let current=profile,milestones=[],points=0,normalChests=0,finalPrize=false,coins=0,coinFloors=[];
 // Il bottino personale replica le 10–15 monete per piano del Solo,
 // con importo stabile per run+piano (niente reroll con refresh).
 const power={...(current.roguelikePower||{})};
 const coinsClaimed=new Set(power.coopCoinFloorsClaimed||[]);
 for(let floor=1;floor<=Math.min(lastClearFloor,maxFloor);floor++){
  const key=runId+':'+floor;
  if(coinsClaimed.has(key))continue;
  let hash=0;
  for(const c of key)hash=(hash*31+c.charCodeAt(0))>>>0;
  const reward=10+(hash%6);
  coins+=reward;coinFloors.push(floor);coinsClaimed.add(key);
 }
 if(coinFloors.length){
  current={...current,coins:(current.coins||0)+coins,
    roguelikePower:{...power,coopCoinFloorsClaimed:[...coinsClaimed]}};
 }
 const boundedFloor=Math.min(lastClearFloor,maxFloor);
 for(let floor=POWER_CHEST_EVERY_FLOORS;floor<=boundedFloor;floor+=POWER_CHEST_EVERY_FLOORS){
  const result=grantRoguelikeMilestone(current,runId,floor);
  if(result.ok){current=result.profile;milestones.push(floor);}
 }
 if(finished&&lastClearFloor>=maxFloor){
  const completion=grantRoguelikeCompletion(current,runId,maxFloor,maxFloor,now);
  if(completion.ok){
   current=completion.profile;
   points=completion.points;
   finalPrize=completion.rewarded;
   normalChests=completion.normalChests||0;
  }
 }
 const changed=milestones.length>0||normalChests>0||
   current!==profile;
 return {ok:changed,changed,profile:current,milestones,points,coins,coinFloors,
    normalChests,finalPrize};
}
