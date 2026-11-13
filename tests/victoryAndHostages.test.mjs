import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {THEATER_CAMPAIGN} from '../src/data/theaterCampaign.js';
import {availableCampaignHeroes,isCampaignHeroUnavailable,validateCampaignLineup}
 from '../src/systems/campaignMissionAvailability.js';
import {VICTORY_EFFECTS,VICTORY_EFFECT_PRICE,ownedVictoryEffects,equippedVictoryEffect,
 purchaseVictoryEffect,equipVictoryEffect,victoryCelebrationForRoom} from '../src/systems/victoryCosmetics.js';

const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const missions=THEATER_CAMPAIGN.sectors.flatMap(s=>s.missions);

test('La scena del tradimento blocca Tails e Miku PRIMA dello scontro',()=>{
 const mission=missions[19];
 assert.equal(mission.title,'La scena del tradimento');
 assert.deepEqual(mission.unavailableChars,['tails','miku']);
 assert.deepEqual(mission.removeChars,['tails','miku']);
 const roster=['starbutterfly','coraline','samtotallyspies','stellarubia','tails','miku'];
 assert.deepEqual(availableCampaignHeroes(mission,roster),roster.slice(0,4));
 assert.equal(isCampaignHeroUnavailable(mission,'tails'),true);
 assert.equal(isCampaignHeroUnavailable(mission,'miku'),true);
 assert.equal(isCampaignHeroUnavailable(mission,'coraline'),false);
 assert.deepEqual(validateCampaignLineup(mission,roster,['tails','coraline']),
   {ok:false,reason:'unavailable'});
 assert.deepEqual(validateCampaignLineup(mission,roster,['miku','stellarubia']),
   {ok:false,reason:'unavailable'});
 assert.deepEqual(validateCampaignLineup(mission,roster,['starbutterfly','coraline']),
   {ok:true});
 assert.equal(validateCampaignLineup(mission,roster,['gaston']).ok,false);
 assert.equal(validateCampaignLineup(mission,roster,['starbutterfly','starbutterfly']).ok,false);
 const restored=missions[26];
 assert.ok(restored.unlock.includes('tails')&&restored.unlock.includes('miku'));
 assert.equal(isCampaignHeroUnavailable(restored,'tails'),false);
 assert.equal(isCampaignHeroUnavailable(restored,'miku'),false);
});

test('Gli ostaggi sono disabilitati anche in UI e nello startBattle, senza cambiare PS',()=>{
 const view=read('../src/screens/campaign/CampaignTeamSelectView.jsx');
 assert.match(view,/const playableSelectedTeam=availableCampaignHeroes\(mission,campaignSelectedTeam\)/);
 assert.match(view,/isCampaignHeroUnavailable\(mission,id\)/);
 assert.match(view,/validateCampaignLineup\(mission,campaignState\.roster,campaignSelectedTeam\)/);
 assert.match(view,/Prigioniero/);
 assert.match(view,/Tails e Miku sono intrappolati/);
 assert.doesNotMatch(read('../src/systems/campaignMissionAvailability.js'),/rosterStats\[/);
});

test('Sei cosmetici realmente nuovi con identificativi, scene e animazioni indipendenti',()=>{
 const ids=['portal','checkmate','chronofinale','astraldragon','thunderstorm','storybook'];
 assert.equal(VICTORY_EFFECTS.length,16);
 assert.equal(VICTORY_EFFECT_PRICE,100);
 const css=read('../src/screens/battle/VictoryCelebration.css');
 const jsx=read('../src/screens/battle/VictoryCelebration.jsx');
 const shop=read('../src/screens/hub/ShopView.jsx');
 const keyframes=[
  'victory-portal-open','victory-chess-king','victory-clock-hand',
  'victory-dragon-glide','victory-bolt','victory-book-cover'
 ];
 for(const [i,id] of ids.entries()){
  const effect=VICTORY_EFFECTS.find(e=>e.id===id);
  assert.ok(effect&&effect.hint.length>40&&effect.tagline.length>20,id);
  assert.match(css,new RegExp('victory-cinema--'+id));
  assert.match(css,new RegExp('@keyframes '+keyframes[i]));
  assert.match(jsx,new RegExp('victory-cinema-'+id));
 }
 assert.equal(new Set(VICTORY_EFFECTS.map(e=>e.id)).size,16);
 assert.equal(new Set(VICTORY_EFFECTS.map(e=>e.name)).size,16);
 assert.match(shop,/VICTORY_EFFECTS\.length/);
 assert.match(shop,/onClick=\{\(\)=>setVictoryPreview\(effect\)\}/);
 assert.match(css,/prefers-reduced-motion:reduce/);
});

test('Ogni nuovo cosmetico è acquistabile, equipaggiabile e mostrato al vincitore',()=>{
 const ids=['portal','checkmate','chronofinale','astraldragon','thunderstorm','storybook'];
 let profile={coins:601,victoryEffects:[],equippedVictoryEffect:null};
 for(const id of ids){
  const bought=purchaseVictoryEffect(profile,id);
  assert.equal(bought.ok,true,id);
  profile=bought.profile;
 }
 assert.equal(profile.coins,1);
 assert.deepEqual(ownedVictoryEffects(profile),ids);
 assert.equal(equippedVictoryEffect(profile),ids[0],'L’acquisto non cambia il cosmetico equipaggiato');
 for(const id of ids){
  const e=equipVictoryEffect(profile,id);
  assert.equal(e.ok,true);
  const room={status:'gameover',gameMode:'classica',phaseStartedAt:50,
    players:{p1:'Giocatore',p2:'CPU'},winner:'Giocatore',
    teams:{p1:[{id:'luigi',img:'/luigi.webp',hp:60}],p2:[{id:'enemy',hp:0}]},
    playerVictoryEffects:{p1:id}};
  const celebration=victoryCelebrationForRoom(room,e.profile,'online_room');
  assert.equal(celebration.effect.id,id);
  assert.equal(celebration.winnerName,'Giocatore');
  assert.match(celebration.id,new RegExp(id));
 }
 assert.equal(purchaseVictoryEffect(profile,ids[0]).ok,false);
});
