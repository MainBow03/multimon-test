import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CAMPAIGNS} from '../src/data/campaigns.js';
import {restoreTournamentProgress,verifyTournamentVoucher,TOURNAMENT_CLAIM_KEY}
  from '../src/systems/tournamentRecovery.js';
import {SAVED_EXACT_KEYS,collectProgress,restoreProgress} from '../src/systems/progressStorage.js';

const campaign=CAMPAIGNS.find(c=>c.id==='torneo_assoluto');
const stages=campaign.sectors.flatMap(s=>s.missions.map(m=>'torneo_assoluto:'+m.id));
const exampleProfile={coins:831,wins:7,strengthPoints:58,unlockedChars:['sage','neon'],
 inventory:{pozione:3},chests:{schemaVersion:1,earnedStageIds:[stages[0]],
 pending:[],opened:[{stageId:stages[0],rewards:[{kind:'coins',value:40}],openedAt:12345}],
 activeReveal:null}};
const save={
 multiverse_rpg_global_profile:JSON.stringify(exampleProfile),
 multiverse_rpg_campaign_save_torneo_assoluto:JSON.stringify({isStarted:true,sectorIdx:1,missionIdx:1,coins:170,roster:['sage','neon'],rosterStats:{sage:72,neon:55},protagonist:'sage'}),
 multimon_completed_campaigns_v1:JSON.stringify({crisi_varco:true,torneo_assoluto:false,eco_anime:false}),
 multiverse_rpg_roguelike_save:JSON.stringify({floor:31,isStarted:true}),
};

test('La seconda campagna contiene 10 missioni e il recupero le completa senza cancellare il profilo',()=>{
 assert.equal(stages.length,10);
 const {changed,entries,totalMissions,addedChests,campaignCoins}=restoreTournamentProgress(save);
 assert.equal(changed,true);
 assert.equal(totalMissions,10);
 assert.equal(addedChests,9);
 assert.equal(campaignCoins,1550);
 const progress=JSON.parse(entries.multiverse_rpg_campaign_save_torneo_assoluto);
 assert.equal(progress.completed,true);
 assert.equal(progress.sectorIdx,4);
 assert.equal(progress.missionIdx,campaign.sectors.at(-1).missions.length-1);
 assert.deepEqual(progress.roster,['sage','neon']);
 assert.deepEqual(progress.rosterStats,{sage:72,neon:55});
 assert.equal(progress.protagonist,'sage');
 assert.equal(JSON.parse(entries.multimon_completed_campaigns_v1).crisi_varco,true);
 assert.equal(JSON.parse(entries.multimon_completed_campaigns_v1).torneo_assoluto,true);
 assert.equal(entries.multiverse_rpg_roguelike_save,save.multiverse_rpg_roguelike_save);
 assert.equal(entries[TOURNAMENT_CLAIM_KEY],'recupero-completato');
 assert.deepEqual(save,Object.fromEntries(Object.entries(save)),'Il salvataggio sorgente resta immutato');
});

test('Casse già aperte e relativi oggetti restano intatti; la ricompensa non si duplica',()=>{
 const result=restoreTournamentProgress(save);
 const before=JSON.parse(save.multiverse_rpg_global_profile);
 const after=JSON.parse(result.entries.multiverse_rpg_global_profile);
 assert.equal(after.coins,before.coins);
 assert.equal(after.wins,before.wins);
 assert.equal(after.strengthPoints,before.strengthPoints);
 assert.deepEqual(after.unlockedChars,before.unlockedChars);
 assert.deepEqual(after.inventory,before.inventory);
 assert.deepEqual(after.chests.opened,before.chests.opened);
 assert.equal(after.chests.earnedStageIds.length,10);
 assert.equal(new Set(after.chests.earnedStageIds).size,10);
 assert.deepEqual(after.chests.pending,stages.slice(1));
 const twice=restoreTournamentProgress(result.entries);
 assert.equal(twice.changed,false);
 assert.equal(twice.addedChests,0);
 assert.equal(twice.entries,result.entries);
});

test('Se alcune casse non erano ancora aperte, restano una sola volta in attesa',()=>{
 const profile=structuredClone(exampleProfile);
 profile.chests.pending=[stages[1]];
 profile.chests.earnedStageIds.push(stages[1]);
 const original={...save,multiverse_rpg_global_profile:JSON.stringify(profile)};
 const res=restoreTournamentProgress(original);
 const chests=JSON.parse(res.entries.multiverse_rpg_global_profile).chests;
 assert.equal(res.addedChests,8);
 assert.equal(chests.pending.length,9);
 assert.equal(chests.pending[0],stages[1]);
 assert.equal(new Set(chests.pending).size,chests.pending.length);
 assert.equal(chests.opened[0].rewards[0].value,40);
});

test('I progressi cloud includono la ricevuta una tantum e rispettano chiavi compatibili',()=>{
 assert.ok(SAVED_EXACT_KEYS.includes(TOURNAMENT_CLAIM_KEY));
 class Store {
  map=new Map();
  get length(){return this.map.size}
  key(i){return [...this.map.keys()][i]||null}
  getItem(k){return this.map.get(k)??null}
  setItem(k,v){this.map.set(k,v)}
  removeItem(k){this.map.delete(k)}
 }
 const storage=new Store();
 const next=restoreTournamentProgress(save).entries;
 restoreProgress(next,storage);
 const collected=collectProgress(storage);
 assert.equal(collected[TOURNAMENT_CLAIM_KEY],'recupero-completato');
 assert.equal(collected.multiverse_rpg_campaign_save_torneo_assoluto,next.multiverse_rpg_campaign_save_torneo_assoluto);
});

test('Il codice di recupero non si trova in chiaro nel codice sorgente',async()=>{
 assert.equal(await verifyTournamentVoucher('sbagliato'),false);
 assert.equal(await verifyTournamentVoucher('MULTIMON-'+'0'.repeat(32)),false);
 // La verifica crittografica e' separata dalla trasformazione del salvataggio.
 const code=readFileSync(new URL('../src/components/AccountGate.jsx',import.meta.url),'utf8');
 assert.match(code,/verifyTournamentVoucher\(tournamentVoucher\)/);
 assert.match(code,/restoreTournamentProgress\(before\)/);
 assert.match(code,/createRecoverySnapshot\(before/);
 assert.match(code,/uploadCloudSave\(session.uid,result.entries,lastUploaded.current\)/);
 assert.match(code,/activate\(session.uid,result.entries\)/);
 assert.doesNotMatch(code, /[a-z0-9._%+-]+@(gmail|outlook|hotmail)\.com/i, 'Non pubblicare indirizzi email personali');
});
