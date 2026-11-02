import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {
 FIRST_CAMPAIGN_FINAL_RAID,finalRaidBossStats,
 rebalanceSavedFinalRaidBoss,consumeRaidShieldHit
} from '../src/systems/finalRaidBalance.js';

const campaign=readFileSync(new URL('../src/screens/campaign/CampaignTeamSelectView.jsx',import.meta.url),'utf8');
const battle=readFileSync(new URL('../src/systems/battleSystem.js',import.meta.url),'utf8');
const campaignData=readFileSync(new URL('../src/data/campaigns.js',import.meta.url),'utf8');

test('Il raid finale della prima campagna ha 3375 PS a Trigon, 2436 PS a Gaster e scudi da 6',()=>{
 assert.deepEqual(FIRST_CAMPAIGN_FINAL_RAID.trigon,{maxHp:3375,shieldHits:6});
 assert.deepEqual(FIRST_CAMPAIGN_FINAL_RAID.gaster,{maxHp:2436,shieldHits:6});
 assert.equal(finalRaidBossStats('cell'),null);
 assert.equal(finalRaidBossStats('zeno'),null);
 assert.ok(campaignData.includes("id: 'm38'"));
 assert.ok(campaignData.includes("boss: ['trigon', 'gaster']"));
 assert.match(campaign,/const raidBossBalance=isFinalRaid\?finalRaidBossStats\(baseChar\.id\):null/);
 assert.match(campaign,/raidBossBalance\?\.maxHp \?\? Math\.floor\(baseChar\.maxHp \* hpMultiplier\)/);
 assert.match(campaign,/charInst\.shieldGrantedHits = raidBossBalance\?\.shieldHits \|\| 4/);
 assert.doesNotMatch(campaign,/charInst\.shieldGrantedHits\s*=\s*15\s*;/);
});

test('Statistiche base e altri boss rimangono invariati',()=>{
 const trigon=CHARACTERS.find(c=>c.id==='trigon');
 const gaster=CHARACTERS.find(c=>c.id==='gaster');
 assert.equal(trigon.maxHp,170);
 assert.equal(gaster.maxHp,135);
 assert.equal(trigon.atk,140);
 assert.equal(gaster.atk,145);
 assert.equal(finalRaidBossStats('gaster').shieldHits,6);
});

test('Salvataggi pre-nerf conservano progressi e percentuale di HP residui',()=>{
 const oldTrigon={id:'trigon',maxHp:4250,hp:2125,juggHitsRemaining:12,atk:420};
 const adjusted=rebalanceSavedFinalRaidBoss(oldTrigon);
 assert.equal(adjusted.maxHp,3375);
 assert.equal(adjusted.hp,1688);
 assert.equal(adjusted.juggHitsRemaining,6);
 assert.equal(adjusted.shieldGrantedHits,6);
 assert.equal(adjusted.atk,420);
 assert.equal(oldTrigon.maxHp,4250,'Il vecchio save originale non deve essere mutato');
 const oldGaster={id:'gaster',maxHp:3375,hp:1350,juggHitsRemaining:4};
 const scaled=rebalanceSavedFinalRaidBoss(oldGaster);
 assert.equal(scaled.maxHp,2436);
 assert.equal(scaled.hp,974);
 assert.equal(scaled.juggHitsRemaining,4);
 const singleHp=rebalanceSavedFinalRaidBoss({id:'trigon',maxHp:4250,hp:1,juggHitsRemaining:0});
 assert.equal(singleHp.hp,1,'Il boss rimane vivo anche se aveva soltanto 1 PS');
 assert.equal(rebalanceSavedFinalRaidBoss({id:'cell',maxHp:5000,hp:2000}).hp,2000);
 assert.match(campaign,/rebalanceSavedFinalRaidBoss\(originalSavedC\)/);
});

test('Mossa che colpisce 4 volte assorbe esattamente 4 delle 6 cariche',()=>{
 const boss={id:'trigon',juggHitsRemaining:6};
 const results=Array.from({length:4},()=>consumeRaidShieldHit(boss));
 assert.equal(results.filter(r=>r.absorbed).length,4);
 assert.deepEqual(results.map(r=>r.remaining),[5,4,3,2]);
 assert.equal(boss.juggHitsRemaining,2);
 assert.ok(results.every(r=>!r.broken));
});

test('Una mossa che supera le cariche rompe lo scudo e i colpi extra danneggiano',()=>{
 const boss={id:'gaster',juggHitsRemaining:2};
 const hits=Array.from({length:4},()=>consumeRaidShieldHit(boss));
 assert.deepEqual(hits.map(h=>h.absorbed),[true,true,false,false]);
 assert.deepEqual(hits.map(h=>h.broken),[false,true,false,false]);
 assert.deepEqual(hits.map(h=>h.remaining),[1,0,0,0]);
 assert.equal(boss.juggHitsRemaining,0);
});

test('Nessuna carica consumata se la mossa manca o bypassa gli scudi',()=>{
 const boss={id:'trigon',juggHitsRemaining:6};
 // Il motore invoca consumeRaidShieldHit solo dopo la verifica di successo;
 // gli attacchi bypass applicano il corto circuito e non invocano il metodo.
 assert.equal(false&&consumeRaidShieldHit(boss),false);
 assert.equal(boss.juggHitsRemaining,6);
 assert.equal(consumeRaidShieldHit(null).absorbed,false);
 assert.equal(consumeRaidShieldHit({juggHitsRemaining:0}).absorbed,false);
 assert.match(battle,/!bypassEnemyShields&&consumeRaidShieldHit\(t\.char\)/);
 assert.match(battle,/for \(let i = 0; i < hits; i\+\+\) \{[\s\S]{0,350}consumeRaidShieldHit\(t\.char\)/);
 assert.match(battle,/if \(raidHit\?\.absorbed\) \{/);
});

test('I due boss continuano ad attivare gli scudi al 75%, 50%, 25%',()=>{
 assert.match(campaign,/charInst\.juggShieldHpThresholds = \[0\.75, 0\.50, 0\.25\]/);
 assert.match(battle,/target\.juggHitsRemaining = hitsToGrant/);
 assert.match(battle,/t\.char\.juggHitsRemaining = hitsToGrant/);
 assert.match(campaign,/Math\.min\(raidBalance\.shieldHits,Math\.max\(0,savedC\.juggHitsRemaining\|\|0\)\)/);
});
