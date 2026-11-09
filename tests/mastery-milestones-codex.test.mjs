import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CHARACTERS } from '../src/data/characters.js';
import { FUSION_CHARACTERS } from '../src/data/fusions.js';
import {
  isMasteryEligible, isMasteryUnlocked, grantMasteryXP, masteryTitle,
  equippedMasteryTitle, masteryDeploymentTier, masteryVisibleLevels, MASTERY_MAX_XP
} from '../src/systems/masterySystem.js';
import { updateLocalStatsImpl } from '../src/systems/profileSystem.js';

const charById = id => CHARACTERS.find(c=>c.id===id);
const profile = {mastery:{
  nicole:MASTERY_MAX_XP,
  alphonse:900,
  celljr_1:MASTERY_MAX_XP,
  trigon:MASTERY_MAX_XP,
  [FUSION_CHARACTERS[0].id]:MASTERY_MAX_XP
}};

test('Campagna, boss segreti, evocazioni e fusioni sono completamente esclusi dalla padronanza',()=>{
  assert.equal(isMasteryEligible(charById('nicole')),true);
  assert.equal(isMasteryEligible(charById('celljr_1')),false);
  assert.equal(isMasteryEligible(charById('trigon')),false);
  assert.equal(isMasteryEligible(charById('summon_chatnoir')),false);
  assert.equal(isMasteryEligible(FUSION_CHARACTERS[0]),false);
  assert.equal(masteryTitle(charById('celljr_1')),'');
  assert.equal(masteryTitle(charById('trigon')),'');
  assert.equal(masteryTitle(FUSION_CHARACTERS[0]),'');
  assert.equal(isMasteryUnlocked(profile,'celljr_1'),false);
  assert.equal(isMasteryUnlocked(profile,'trigon'),false);
  assert.equal(isMasteryUnlocked(profile,FUSION_CHARACTERS[0].id),false);
  assert.equal(equippedMasteryTitle({...profile,equippedMasteryTitle:'celljr_1'},CHARACTERS),'');
  assert.equal(equippedMasteryTitle({...profile,equippedMasteryTitle:FUSION_CHARACTERS[0].id},FUSION_CHARACTERS),'');
  const updated=grantMasteryXP(profile,['celljr_1','trigon',FUSION_CHARACTERS[0].id,'nicole'],true);
  assert.equal(updated.mastery.nicole,MASTERY_MAX_XP);
  assert.equal(updated.mastery.celljr_1,MASTERY_MAX_XP,'PE legacy non modificati, ma ignorati');
});

test('Ricompense ogni 5 livelli: visibili, cumulative, senza bonus competitivi',()=>{
  assert.equal(masteryDeploymentTier(1),null);
  assert.equal(masteryDeploymentTier(4),null);
  assert.equal(masteryDeploymentTier(5).name,'Ingresso Stellare');
  assert.equal(masteryDeploymentTier(9).level,5);
  assert.equal(masteryDeploymentTier(10).name,'Aura dell’Esperto');
  assert.equal(masteryDeploymentTier(15).name,'Scia del Maestro');
  assert.equal(masteryDeploymentTier(20).name,'Entrata Leggendaria');
  const visible=masteryVisibleLevels({...profile,mastery:{...profile.mastery,cyborg:300}});
  assert.equal(visible.nicole,20);
  assert.equal(visible.alphonse,10);
  assert.equal(visible.cyborg,undefined,'Sotto al livello 5 non appare l’effetto');
  assert.equal(visible.celljr_1,undefined);
  assert.equal(visible.trigon,undefined);
  assert.equal(visible[FUSION_CHARACTERS[0].id],undefined);
});

test('Un titolo legacy dei mostri non può essere indossato dal profilo',()=>{
  const old=globalThis.localStorage;
  let last=JSON.stringify({...profile,inventory:{},chars:{},moves:{},equippedMasteryTitle:'celljr_1'});
  globalThis.localStorage={setItem:(key,v)=>{last=v;},getItem:()=>last};
  try{
    const ctx={getPlayerData:()=>JSON.parse(last)};
    updateLocalStatsImpl(ctx,{equipMasteryTitle:'celljr_1'});
    assert.equal(JSON.parse(last).equippedMasteryTitle,'celljr_1','dato legacy conservato, ma non mostrato');
    assert.equal(equippedMasteryTitle(JSON.parse(last),CHARACTERS),'');
    updateLocalStatsImpl(ctx,{equipMasteryTitle:'nicole'});
    assert.equal(JSON.parse(last).equippedMasteryTitle,'nicole');
  }finally{globalThis.localStorage=old}
});

test('Le ricompense si vedono sul PNG schierato anche nel torneo e il codex è accessibile in battaglia',()=>{
  const battle=readFileSync(new URL('../src/screens/battle/BattlingView.jsx',import.meta.url),'utf8');
  const event=readFileSync(new URL('../src/screens/events/StandardTournamentBattle.jsx',import.meta.url),'utf8');
  const encyclopedia=readFileSync(new URL('../src/components/BattleCodex.jsx',import.meta.url),'utf8');
  const styles=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
  const stats=readFileSync(new URL('../src/screens/hub/StatsView.jsx',import.meta.url),'utf8');
  assert.match(battle,/mastery-entry-ribbon/);
  assert.match(battle,/mastery-sparks/);
  assert.match(battle,/BattleCodexLauncher gameState/);
  assert.match(event,/playerMastery\[role\]/);
  assert.match(styles,/mastery-deploy-pop/);
  assert.match(stats,/CHARACTERS\.filter\(isMasteryEligible\)/);
  for(const label of ['Status negativi','Potenziamenti','Protezioni','Abilità passive','Priorità mosse','Strumenti']){
    assert.ok(encyclopedia.includes(label),label);
  }
  assert.match(encyclopedia,/turns/);
  assert.match(encyclopedia,/MOVES_DB/);
  assert.match(encyclopedia,/ITEMS_DB/);
});
