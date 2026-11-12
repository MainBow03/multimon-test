import test from 'node:test';
import assert from 'node:assert/strict';
import {THEATER_CAMPAIGN,THEATER_ID,THEATER_TOTAL_MISSIONS,THEATER_RULES} from '../src/data/theaterCampaign.js';
import {THEATER_CHARACTERS,THEATER_MOVES} from '../src/data/theaterActors.js';
import {theaterDamageMultiplier,theaterTurnCue,advanceTheaterFinalBossPhase} from '../src/systems/theaterBattleRules.js';
import {getCampaignLock} from '../src/systems/campaignUnlocks.js';

const missions=THEATER_CAMPAIGN.sectors.flatMap(section=>section.missions);
test('Teatro: 6 atti da 6 missioni con ID/dialoghi unici',()=>{
 assert.equal(THEATER_ID,'teatro_catastrofi');
 assert.equal(missions.length,THEATER_TOTAL_MISSIONS);
 assert.equal(THEATER_CAMPAIGN.sectors.length,6);
 assert(THEATER_CAMPAIGN.sectors.every(section=>section.missions.length===6));
 assert.equal(new Set(missions.map(m=>m.id)).size,36);
 assert(missions.every((mission,i)=>mission.id==='teatro_'+String(i+1).padStart(2,'0')));
 assert(missions.every(m=>m.dialogue.length>=6&&m.postDialogue.length>=4));
 assert(missions.every(m=>m.boss.length>=1&&THEATER_RULES[m.theaterRule]));
 assert(missions.every(m=>m.dialogue.every(d=>d.s&&d.t)&&m.postDialogue.every(d=>d.s&&d.t)));
});
test('La storia gestisce la separazione di Clover Tails e Miku',()=>{
 assert.deepEqual(missions[18].removeChars,['clover']);
 assert.deepEqual(missions[19].removeChars,['tails','miku']);
 assert(missions[26].unlock.includes('tails')&&missions[26].unlock.includes('miku'));
 assert(missions[28].unlock.includes('clover'));
 assert(missions[33].unlock.includes('nina_teatro'));
 assert(missions[35].unlock.includes('regista'));
 assert.equal(missions[35].theaterFinal,true);
});
test('Regista e PNG fallback: 5 attori originali con mosse reali',()=>{
 assert.equal(THEATER_CHARACTERS.length,5);
 assert.equal(new Set(THEATER_CHARACTERS.map(c=>c.id)).size,5);
 for(const c of THEATER_CHARACTERS){
  assert(c.img.startsWith('data:image/')||c.img.endsWith('.png'));
  assert(c.moves.length>=3&&c.moves.every(m=>THEATER_MOVES[m.name]===m));
 }
});
test('Protezione dei riflettori termina dopo il loro KO',()=>{
 const hero={id:'starbutterfly',hp:100},boss={id:'regista',hp:900,theaterPhase:1};
 const light={id:'riflettore',hp:50};
 const teams={p1:[hero],p2:[boss,light]};
 const scene={rule:'finale'};
 const factor=(target,turnNumber=1)=>theaterDamageMultiplier({scene,teams,attacker:hero,target,turnNumber});
 assert.equal(factor(boss),.7);
 assert.equal(factor(light),1);
 light.hp=0;
 assert.equal(factor(boss),1);
 boss.theaterPhase=3;
 assert.equal(factor(boss),1.1);
});
test('Regole dei turni funzionano senza alterare le altre modalita',()=>{
 const hero={id:'starbutterfly'},boss={id:'caposcena'};
 const teams={p1:[hero],p2:[boss]};
 const calc=(rule,attacker,target,turnNumber)=>theaterDamageMultiplier({scene:{rule},teams,attacker,target,turnNumber});
 assert.equal(calc('improv',hero,boss,3),1.2);
 assert.equal(calc('improv',hero,boss,4),1);
 assert.equal(calc('rehearsal',boss,hero,3),1.15);
 assert.equal(calc('mirror',hero,boss,2),.9);
 assert.equal(calc('curtain',boss,hero,4),.85);
 assert.equal(calc('spotlight',hero,boss,3),1);
 assert.equal(theaterDamageMultiplier({scene:null,teams,attacker:hero,target:boss,turnNumber:3}),1);
 assert.match(theaterTurnCue({rule:'improv'},3),/FUORI COPIONE/);
});
test('Il Regista cambia fase soltanto sotto le soglie previste',()=>{
 const boss={id:'regista',theaterFinalBoss:true,maxHp:900,hp:700,theaterPhase:1};
 const buffs=[],events=[];
 const call=()=>advanceTheaterFinalBossPhase({boss,events,applyStatBuff:(c,s,x)=>buffs.push([s,x])});
 assert.equal(call(),false);
 boss.hp=600;assert.equal(call(),true);assert.equal(boss.theaterPhase,2);
 assert.deepEqual(buffs,[['atk',1.1]]);
 boss.hp=300;assert.equal(call(),true);assert.equal(boss.theaterPhase,3);
 assert.deepEqual(buffs,[['atk',1.1],['spd',1.15]]);
 assert.equal(call(),false);
 assert.equal(events.filter(e=>e.type==='text').length,2);
});
test('La campagna laterale Monarch non viene bloccata dal nuovo Teatro',()=>{
 const data={'multimon_completed_campaigns_v1':JSON.stringify({
  crisi_varco:true,torneo_assoluto:true,eco_anime:true,
  teatro_catastrofi:false,monarch_akuma:false
 })};
 const storage={getItem:key=>data[key]??null};
 assert.equal(getCampaignLock('teatro_catastrofi',storage),null);
 assert.equal(getCampaignLock('monarch_akuma',storage),null);
});
