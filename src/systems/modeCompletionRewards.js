// Ricompense dei completamenti di Roguelike Solo e Co-op.
// Le casse normali usano gli stessi bauli campagna (due drop per apertura).
import { emptyChestState } from './campaignChests.js';

export const FULL_CLEAR_NORMAL_CHESTS=5;

export function grantNormalClearChests(profile,runId,count=FULL_CLEAR_NORMAL_CHESTS){
 if(typeof runId!=='string'||!runId.trim()||!Number.isInteger(count)||count<1||count>10)
  return {ok:false,profile,granted:0,reason:'Identificativo completamento non valido.'};
 const original=profile?.chests||emptyChestState();
 const earned=new Set(original.earnedStageIds||[]);
 const pending=[...(original.pending||[])];
 let granted=0;
 for(let i=1;i<=count;i++){
  const id='roguelike-full-clear:'+runId+':'+i;
  if(earned.has(id))continue;
  earned.add(id);
  pending.push(id);granted++;
 }
 if(!granted)return {ok:false,profile,granted:0,reason:'Bauli già consegnati per questa spedizione.'};
 return {ok:true,granted,profile:{...profile,chests:{
   ...emptyChestState(),...original,
   earnedStageIds:[...earned],pending
 }}};
}
