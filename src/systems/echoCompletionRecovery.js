import {ECHO_ALLIES,ECHO_ID} from '../data/echoCampaign.js';

export const CAMPAIGN_REPLAY_RESET_PREFIX='multimon_explicit_campaign_reset_';

// Nelle versioni precedenti il tasto finale cancellava il salvataggio.
// Se il registro globale certifica che Echomax è stato completato,
// recuperiamo l'epilogo senza costringere a rifare 36 missioni.
// Non inventiamo le monete e i PS esatti perduti dal vecchio bug.
export function recoverMissingEchoCompletion({campaignId,campaign,characters=[],completed=false,explicitReset=false}={}){
 if(campaignId!==ECHO_ID||!completed||explicitReset||!campaign?.sectors?.length)
  return null;
 const lastSectorIndex=campaign.sectors.length-1;
 const lastMissionIndex=(campaign.sectors[lastSectorIndex]?.missions||[]).length-1;
 if(lastMissionIndex<0)return null;
 const byId=new Map(characters.map(char=>[char.id,char]));
 const roster=ECHO_ALLIES.filter(id=>byId.has(id));
 const rosterStats=Object.fromEntries(roster.map(id=>[id,Number(byId.get(id).maxHp)||100]));
 return {
  isStarted:true,completed:true,
  sectorIdx:lastSectorIndex,missionIdx:lastMissionIndex,
  roster,rosterStats,coins:50,difficulty:'Normal',
  currentBossState:null,protagonist:null,
  recoveredFromLegacyCompletion:true
 };
}
