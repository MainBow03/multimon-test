import test from 'node:test';
import assert from 'node:assert/strict';
import { completeCampaign, getCampaignLock, isCampaignUnlocked, getCompletedCampaigns } from '../src/systems/campaignUnlocks.js';
const storage=()=>{const m=new Map();return{getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)}};
test('Le campagne sono bloccate in sequenza',()=>{
 const s=storage();
 assert.equal(isCampaignUnlocked('crisi_varco',s),true);
 assert.equal(getCampaignLock('torneo_assoluto',s),'crisi_varco');
 assert.equal(getCampaignLock('eco_anime',s),'torneo_assoluto');
 assert.equal(getCampaignLock('monarch_akuma',s),'eco_anime');
 completeCampaign('crisi_varco',s);assert.equal(isCampaignUnlocked('torneo_assoluto',s),true);
 assert.equal(isCampaignUnlocked('monarch_akuma',s),false);
 completeCampaign('torneo_assoluto',s);assert.equal(isCampaignUnlocked('eco_anime',s),true);
 assert.equal(isCampaignUnlocked('monarch_akuma',s),false);
 completeCampaign('eco_anime',s);assert.equal(isCampaignUnlocked('monarch_akuma',s),true);
 s.removeItem('multiverse_rpg_campaign_save_crisi_varco');
 assert.equal(getCompletedCampaigns(s).crisi_varco,true);
});
test('Si riconoscono vecchi salvataggi completati',()=>{
 const s=storage();s.setItem('multiverse_rpg_campaign_save_crisi_varco',JSON.stringify({completed:true}));
 assert.equal(isCampaignUnlocked('torneo_assoluto',s),true);
});