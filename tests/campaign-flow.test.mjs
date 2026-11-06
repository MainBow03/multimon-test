import test from 'node:test';
import assert from 'node:assert/strict';
import { CAMPAIGNS, CHARACTERS, CHAR_PRICES, MOVES_DB } from '../src/data/gameData.js';
import { advanceCampaignImpl } from '../src/systems/campaignFlow.js';

function simulateAdvance(campaign, state, extraCoins = 150) {
  let nextState = structuredClone(state);
  let nextMode;
  advanceCampaignImpl({
    activeCampaign: campaign,
    activeCampaignId: campaign.id,
    campaignState: state,
    setCampaignState: update => { nextState = typeof update === 'function' ? update(nextState) : update; },
    setAppMode: mode => { nextMode = mode; },
  }, extraCoins);
  return { nextState, nextMode };
}

const crisis = CAMPAIGNS.find(c => c.id === 'crisi_varco');

test('Il raid finale m38 contiene il post-dialogo narrativo e segue Cell', () => {
  const finalSector = crisis.sectors.at(-1);
  const finalMission = finalSector.missions.at(-1);
  assert.equal(finalMission.id, 'm38');
  assert.ok(finalMission.postDialogue.length>=4,'il raid mantiene le 4 battute precedenti e aggiunge scene');
  assert.ok(finalMission.postDialogue.some(line=>line.t.includes('Varco')));
  assert.deepEqual(finalMission.boss, ['trigon', 'gaster']);
  assert.equal(crisis.sectors.at(-2).missions.at(-1).id, 'm37');
});

test('Dopo il post-dialogo del raid finale si apre il vero epilogo senza indici invalidi', () => {
  const sectorIdx = crisis.sectors.length - 1;
  const missionIdx = crisis.sectors[sectorIdx].missions.length - 1;
  const state = { isStarted: true, sectorIdx, missionIdx, coins: 50, roster: ['finn','topolino'], faintedInLastBattle:['finn'], completed: false };
  const { nextState, nextMode } = simulateAdvance(crisis, state);
  assert.equal(nextMode, 'campaign_ending');
  assert.equal(nextState.sectorIdx, sectorIdx);
  assert.equal(nextState.missionIdx, missionIdx);
  assert.equal(nextState.coins, 200);
  assert.equal(nextState.completed, true);
  assert.equal(nextState.faintedInLastBattle, null);
  assert.deepEqual(state, { isStarted: true, sectorIdx, missionIdx, coins: 50, roster: ['finn','topolino'], faintedInLastBattle:['finn'], completed: false });
});

test('Dopo Cell m37 si accede al negozio del nuovo settore, non al finale', () => {
  const state = {isStarted:true, sectorIdx:crisis.sectors.length-2, missionIdx:crisis.sectors.at(-2).missions.length-1, coins: 20, roster:['finn'], completed:false};
  const { nextMode, nextState } = simulateAdvance(crisis,state);
  assert.equal(nextMode,'campaign_shop');
  assert.equal(nextState.sectorIdx, crisis.sectors.length-1);
  assert.equal(nextState.missionIdx,0);
  assert.equal(nextState.completed,false);
});

test('Le missioni interne proseguono sulla mappa', () => {
  const state = {isStarted:true,sectorIdx:0,missionIdx:0,coins:15,roster:['finn'], completed:false};
  const { nextMode,nextState } = simulateAdvance(crisis,state,30);
  assert.equal(nextMode,'campaign_map');
  assert.equal(nextState.sectorIdx,0);
  assert.equal(nextState.missionIdx,1);
  assert.equal(nextState.coins,45);
});

test('Tutte le campagne terminano senza sectorIdx fuori dai limiti', () => {
  for (const campaign of CAMPAIGNS) {
    const sectorIdx=campaign.sectors.length-1;
    const missionIdx=campaign.sectors[sectorIdx].missions.length-1;
    const state = {isStarted:true,sectorIdx,missionIdx,coins:0,roster:[]};
    const { nextMode,nextState } = simulateAdvance(campaign,state);
    assert.equal(nextMode,'campaign_ending',campaign.id);
    assert.equal(nextState.sectorIdx,sectorIdx,campaign.id);
    assert.equal(nextState.missionIdx,missionIdx,campaign.id);
  }
});

test('Il database delle mosse mantiene la normalizzazione originale', () => {
  assert.equal(MOVES_DB['Protezione'].maxUses, 8);
  assert.equal(MOVES_DB['Riposo'].maxUses, 5);
  const snorlax = CHARACTERS.find(c => c.id === 'snorlax');
  assert.equal(snorlax.moves[0], MOVES_DB['Riposo']);
});

test('I prezzi personalizzati sono ancora assegnati al roster', () => {
  const goku = CHARACTERS.find(c => c.id === 'goku');
  assert.ok(goku);
  assert.equal(goku.price, CHAR_PRICES.goku);
});
