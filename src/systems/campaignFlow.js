import { reconcileCampaignRoster } from './campaignRoster.js';
import { completeCampaign, getCompletedCampaigns, isCampaignUnlocked } from './campaignUnlocks.js';
import {recoverMissingEchoCompletion,CAMPAIGN_REPLAY_RESET_PREFIX} from './echoCompletionRecovery.js';
import { ECHO_ID, ECHO_STARTERS } from '../data/echoCampaign.js';
import {THEATER_ID,THEATER_STARTERS} from '../data/theaterCampaign.js';
import {migrateTheaterStellarubia} from './theaterRecruitMigration.js';
import { isTournamentEligibleCharacter, sanitizeTournamentSave } from './tournamentEligibility.js';
import {rememberSelectedCampaign} from './lastCampaignSelection.js';
// Moduli dei sistemi di Multimon: funzioni originali con contesto esplicito.
export const loadCampaignImpl = (ctx, campId) => {
const { CHARACTERS, CAMPAIGNS, getCampaignStoryCharacters, setActiveCampaignId, setCampaignState } = ctx;

              if (!isCampaignUnlocked(campId)) return null;
              rememberSelectedCampaign(campId);
              setActiveCampaignId(campId);
              
              let defaultRoster = [];
              if (campId === 'crisi_varco') {
                  defaultRoster = ['finn', 'topolino'];
              } else if (campId === ECHO_ID) {
                   defaultRoster = [...ECHO_STARTERS];
               } else if (campId === THEATER_ID) {
                  defaultRoster = [...THEATER_STARTERS];
              } else if (campId === 'monarch_akuma') {
                  defaultRoster = ['ladybug', 'chatnoir'];
              } else {
                  const storyChars = getCampaignStoryCharacters(campId);
                  defaultRoster = CHARACTERS.filter(c => campId === 'torneo_assoluto'
                     ? isTournamentEligibleCharacter(c,storyChars)
                     : !c.isSummonOnly && !storyChars.includes(c.id)).map(c => c.id);
              }

              const defaultStats = {};
              defaultRoster.forEach(id => {
                  const c = CHARACTERS.find(x=>x.id===id);
                  if(c) defaultStats[id] = c.maxHp;
              });

              const saved = localStorage.getItem(`multiverse_rpg_campaign_save_${campId}`);
              if (saved) {
                  try { 
                      let parsed = JSON.parse(saved);
                      if (parsed.isStarted === undefined) parsed.isStarted = true; // Migrazione vecchi save
                      if (!parsed.roster || (campId === 'torneo_assoluto' && parsed.roster.length <= 2)) parsed.roster = defaultRoster;
                      if (!parsed.rosterStats || (campId === 'torneo_assoluto' && Object.keys(parsed.rosterStats).length <= 2)) {
                          parsed.rosterStats = defaultStats;
                      }
                      if (parsed.sectorIdx === undefined) parsed.sectorIdx = 0;
                      if (parsed.missionIdx === undefined) parsed.missionIdx = 0;
                      if (parsed.coins === undefined) parsed.coins = 50;
                      parsed = reconcileCampaignRoster(parsed, CHARACTERS);
                      if(campId === THEATER_ID){
                        // Aggiorna anche le partite della quarta campagna avviate
                        // prima del cambio di reclutamento nella missione 8.
                        const migration=migrateTheaterStellarubia(parsed,CHARACTERS);
                        if(migration.changed){
                          parsed=migration.state;
                          localStorage.setItem(`multiverse_rpg_campaign_save_${campId}`,JSON.stringify(parsed));
                        }
                      }
                      if(campId === 'torneo_assoluto')
                        parsed = sanitizeTournamentSave(parsed,CHARACTERS,getCampaignStoryCharacters(campId));
                      setCampaignState(parsed);
                      return parsed; 
                  } catch(e){}
              }

              // Recupero non distruttivo: il vecchio finale eliminava il salvataggio
              // nonostante il registro globale segnasse Echomax come completato.
              const recovered=recoverMissingEchoCompletion({
                  campaignId:campId,
                  campaign:CAMPAIGNS?.find(c=>c.id===campId),
                  characters:CHARACTERS,
                  completed:!!getCompletedCampaigns()[campId],
                  explicitReset:localStorage.getItem(CAMPAIGN_REPLAY_RESET_PREFIX+campId)==='1'
              });
              if(recovered){
                  localStorage.setItem(`multiverse_rpg_campaign_save_${campId}`,JSON.stringify(recovered));
                  setCampaignState(recovered);
                  return recovered;
              }

              const freshState = {
                  isStarted: false,
                  sectorIdx: 0,
                  missionIdx: 0,
                  roster: defaultRoster,
                  rosterStats: defaultStats,
                  coins: 50,
                  difficulty: 'Normal',
                  currentBossState: null,
                  protagonist: null
              };
              setCampaignState(freshState);
              return freshState;
          
};

export const advanceCampaignImpl = (ctx, extraCoins = 150) => {
const { activeCampaign, activeCampaignId, campaignState, setAppMode, setCampaignState, updateLocalStats } = ctx;

              // Premio associato alla missione appena superata, non al solo
              // ingresso nel settore. Lo stesso ID non viene mai pagato due volte.
              const justFinished=activeCampaign.sectors[campaignState.sectorIdx]?.missions[campaignState.missionIdx];
              if(justFinished?.id)updateLocalStats?.({awardCampaignChest:{
                campaignId:activeCampaignId,missionId:justFinished.id
              }});
                            const newCoins = campaignState.coins + extraCoins;
              let nextMissionIdx = campaignState.missionIdx + 1;
              let nextSectorIdx = campaignState.sectorIdx;
              let nextAppMode = 'campaign_map';

              let newAnomalyTargets = null;
              if (activeCampaignId === 'crisi_varco' && nextSectorIdx === 5 && nextMissionIdx === 2) { 
                   const shuffled = [...campaignState.roster].sort(() => 0.5 - Math.random());
                   const maxAnomalyCount = Math.max(1, Math.min(4, campaignState.roster.length - 1));
                   newAnomalyTargets = shuffled.slice(0, maxAnomalyCount);
              }

              if (nextMissionIdx >= activeCampaign.sectors[campaignState.sectorIdx].missions.length) {
                  nextMissionIdx = 0;
                  nextSectorIdx++;
                  nextAppMode = 'campaign_shop';
              }

              // La campagna conclusa conserva la posizione dell'ultima missione.
              // Un indice fuori dalla lista faceva ricadere activeSector sulla PRIMA area.
              const campaignCompleted = nextSectorIdx >= activeCampaign.sectors.length;
              if (campaignCompleted) {
                  completeCampaign(activeCampaignId);
                  nextSectorIdx = activeCampaign.sectors.length - 1;
                  nextMissionIdx = activeCampaign.sectors[nextSectorIdx].missions.length - 1;
                  nextAppMode = 'campaign_ending';
              }

              setCampaignState(prev => ({
                  ...prev,
                  coins: newCoins,
                  missionIdx: nextMissionIdx,
                  sectorIdx: nextSectorIdx,
                  completed: campaignCompleted || Boolean(prev.completed),
                  faintedInLastBattle: null,
                  anomalyTargets: newAnomalyTargets
              }));
              setAppMode(nextAppMode);
          
};
