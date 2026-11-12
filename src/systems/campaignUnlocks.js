export const CAMPAIGN_COMPLETION_KEY = 'multimon_completed_campaigns_v1';
export const CAMPAIGN_ORDER = ['crisi_varco','torneo_assoluto','eco_anime','teatro_catastrofi','monarch_akuma'];
export function getCompletedCampaigns(storage = (typeof localStorage !== 'undefined' ? localStorage : null)) {
  if (!storage) return Object.fromEntries(CAMPAIGN_ORDER.map(id=>[id,false]));
  let saved={}; try{ saved=JSON.parse(storage.getItem(CAMPAIGN_COMPLETION_KEY)||'{}')||{}; }catch(_){}
  const result=Object.fromEntries(CAMPAIGN_ORDER.map(id=>[id,!!saved[id]]));
  for(const id of CAMPAIGN_ORDER) try {
    const old=JSON.parse(storage.getItem('multiverse_rpg_campaign_save_'+id)||'null');
    if(old?.completed===true) result[id]=true;
  }catch(_){}
  return result;
}
export function completeCampaign(id,storage=(typeof localStorage!=='undefined'?localStorage:null)){
  if(!storage||!CAMPAIGN_ORDER.includes(id))return;
  const done=getCompletedCampaigns(storage);done[id]=true;
  storage.setItem(CAMPAIGN_COMPLETION_KEY,JSON.stringify(done));
}
export function getCampaignLock(id,storage=(typeof localStorage!=='undefined'?localStorage:null)){
  const i=CAMPAIGN_ORDER.indexOf(id);
  if(i<=0)return null;
  // Monarch resta una campagna laterale disponibile dopo Echomax:
  // l'aggiunta del Teatro non deve rimetterla sotto chiave.
  const prerequisite=id==='monarch_akuma'?'eco_anime':CAMPAIGN_ORDER[i-1];
  return getCompletedCampaigns(storage)[prerequisite]?null:prerequisite;
}
export function isCampaignUnlocked(id,storage=(typeof localStorage!=='undefined'?localStorage:null)){
  return getCampaignLock(id,storage)===null;
}