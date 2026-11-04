import { CAMPAIGNS } from '../data/campaigns.js';
import { chestStageId, emptyChestState } from './campaignChests.js';

// Il codice di recupero non compare nel repository: qui e' conservata
// soltanto la sua impronta SHA-256. Il recupero richiede accesso al
// proprio account Firebase e non viene applicato agli altri giocatori.
const VOUCHER_HASH='1a18304f8756b0da64b4750ea066d0ebd2411f7f1651a5a522e0584f8cece8f5';
export const TOURNAMENT_CLAIM_KEY='multimon_torneo_assoluto_recuperato_20261104';
const COMPLETE_KEY='multimon_completed_campaigns_v1';
const CAMPAIGN_KEY='multiverse_rpg_campaign_save_torneo_assoluto';
const PROFILE_KEY='multiverse_rpg_global_profile';

const parseOr=(value,fallback)=>{
  try{const parsed=JSON.parse(value);return parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:fallback;}
  catch{return fallback;}
};

export async function verifyTournamentVoucher(input,subtle=globalThis.crypto?.subtle){
  if(!subtle || typeof input!=='string')return false;
  const code=input.trim().toUpperCase();
  if(!/^MULTIMON-[A-F0-9]{32}$/.test(code))return false;
  const bytes=new TextEncoder().encode(code);
  const digest=await subtle.digest('SHA-256',bytes);
  const hex=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
  return hex===VOUCHER_HASH;
}

// Costruisce un NUOVO salvataggio e non modifica quello originale.
// Le casse già assegnate o aperte restano intatte: vengono aggiunti
// solo i premi di missioni mancanti. Non inventa drop random del passato.
export function restoreTournamentProgress(entries){
  const source=entries&&typeof entries==='object'&&!Array.isArray(entries)?entries:{};
  if(source[TOURNAMENT_CLAIM_KEY])return {changed:false,reason:'already',entries:source,addedChests:0};
  const campaign=CAMPAIGNS.find(c=>c.id==='torneo_assoluto');
  if(!campaign)throw new Error('La seconda campagna non esiste.');
  const missions=campaign.sectors.flatMap(s=>s.missions);
  const completed=parseOr(source[COMPLETE_KEY],{});
  const previousSave=parseOr(source[CAMPAIGN_KEY],{});
  const previousProfile=parseOr(source[PROFILE_KEY],{});
  const originalChests=previousProfile.chests||emptyChestState();
  const earned=new Set(originalChests.earnedStageIds||[]);
  const pending=[...(originalChests.pending||[])];
  let addedChests=0;
  for(const mission of missions){
    const id=chestStageId(campaign.id,mission.id);
    if(earned.has(id))continue;
    earned.add(id);
    if(!pending.includes(id))pending.push(id);
    addedChests++;
  }
  const chests={
    ...emptyChestState(),
    ...originalChests,
    earnedStageIds:[...earned],
    pending,
    opened:[...(originalChests.opened||[])],
  };
  const finalSector=campaign.sectors.length-1;
  const lastMission=campaign.sectors[finalSector].missions.length-1;
  const fullCampaignCoins=50+150*missions.length;
  const previousCoins=Number(previousSave.coins)||0;
  const save={
    ...previousSave,
    isStarted:true,
    completed:true,
    sectorIdx:finalSector,
    missionIdx:lastMission,
    coins:Math.max(previousCoins,fullCampaignCoins),
    currentBossState:null
  };
  const next={
    ...source,
    [COMPLETE_KEY]:JSON.stringify({...completed,torneo_assoluto:true}),
    [CAMPAIGN_KEY]:JSON.stringify(save),
    [PROFILE_KEY]:JSON.stringify({...previousProfile,chests}),
    [TOURNAMENT_CLAIM_KEY]:'recupero-completato'
  };
  return {
    changed:true,entries:next,addedChests,
    totalMissions:missions.length,campaignCoins:save.coins,
    preservedOpened:(originalChests.opened||[]).length
  };
}
