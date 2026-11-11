import {CAMPAIGN_ORDER} from './campaignUnlocks.js';

export const LAST_CAMPAIGN_SELECTION_KEY='multimon_last_selected_campaign_v1';

// Non scambiare mai i dati di due campagne: al riavvio ripristina la
// selezione soltanto quando ESISTE il salvataggio associato.
export function lastSavedCampaignId(storage=(typeof localStorage!=='undefined'?localStorage:null)){
  if(!storage)return 'crisi_varco';
  try{
    const id=storage.getItem(LAST_CAMPAIGN_SELECTION_KEY);
    return CAMPAIGN_ORDER.includes(id) &&
      storage.getItem('multiverse_rpg_campaign_save_'+id)
        ?id:'crisi_varco';
  }catch(_){return 'crisi_varco';}
}
export function rememberSelectedCampaign(id,storage=(typeof localStorage!=='undefined'?localStorage:null)){
  if(!CAMPAIGN_ORDER.includes(id)||!storage)return false;
  try{storage.setItem(LAST_CAMPAIGN_SELECTION_KEY,id);return true;}
  catch(_){return false;}
}
