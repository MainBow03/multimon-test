import test from 'node:test';
import assert from 'node:assert/strict';
import {lastSavedCampaignId,rememberSelectedCampaign,LAST_CAMPAIGN_SELECTION_KEY} from '../src/systems/lastCampaignSelection.js';
import {recoverMissingEchoCompletion} from '../src/systems/echoCompletionRecovery.js';
import {completeCampaign,getCompletedCampaigns} from '../src/systems/campaignUnlocks.js';

function storage(){
 const entries=new Map();
 return {
  getItem:key=>entries.has(key)?entries.get(key):null,
  setItem:(key,value)=>entries.set(key,String(value)),
  removeItem:key=>entries.delete(key)
 };
}

test('Dopo il riavvio non si sostituisce Echomax con la prima campagna',()=>{
 const s=storage();
 s.setItem('multiverse_rpg_campaign_save_crisi_varco',JSON.stringify({sectorIdx:0,missionIdx:1}));
 s.setItem('multiverse_rpg_campaign_save_eco_anime',JSON.stringify({sectorIdx:5,missionIdx:5}));
 assert(rememberSelectedCampaign('eco_anime',s));
 assert.equal(lastSavedCampaignId(s),'eco_anime');
 assert.equal(JSON.parse(s.getItem('multiverse_rpg_campaign_save_crisi_varco')).missionIdx,1);
 assert.equal(JSON.parse(s.getItem('multiverse_rpg_campaign_save_eco_anime')).missionIdx,5);
 assert.equal(s.getItem(LAST_CAMPAIGN_SELECTION_KEY),'eco_anime');
});

test('Senza un salvataggio corrispondente non si mischia il roster di due campagne',()=>{
 const s=storage();
 rememberSelectedCampaign('eco_anime',s);
 assert.equal(lastSavedCampaignId(s),'crisi_varco');
 assert.equal(rememberSelectedCampaign('campagna_inesistente',s),false);
});

test('Il completamento di Echomax era registrato anche se il vecchio finale ha eliminato il save',()=>{
 const s=storage();
 completeCampaign('eco_anime',s);
 assert.equal(getCompletedCampaigns(s).eco_anime,true);
 const campaign={sectors:[{missions:[{id:'eco_01'}]},{missions:[{id:'eco_36'}]}]};
 const characters=['jake','marceline','neon','sage'].map(id=>({id,maxHp:100}));
 const recovered=recoverMissingEchoCompletion({
  campaignId:'eco_anime',campaign,characters,completed:getCompletedCampaigns(s).eco_anime
 });
 assert.equal(recovered.completed,true);
 assert.equal(recovered.isStarted,true);
 assert.equal(recovered.sectorIdx,1);
 assert.equal(recovered.missionIdx,0);
 assert.deepEqual(recovered.roster,['jake','marceline','neon','sage']);
 assert.equal(recovered.recoveredFromLegacyCompletion,true);
 assert.equal(recoverMissingEchoCompletion({
  campaignId:'eco_anime',campaign,characters,completed:true,explicitReset:true
 }),null);
});
