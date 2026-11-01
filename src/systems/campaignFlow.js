import { reconcileCampaignRoster } from './campaignRoster.js';
// Moduli dei sistemi di Multimon: funzioni originali con contesto esplicito.
export const loadCampaignImpl = (ctx, campId) => {
const { CHARACTERS, getCampaignStoryCharacters, setActiveCampaignId, setCampaignState } = ctx;

              setActiveCampaignId(campId);
              
              let defaultRoster = [];
              if (campId === 'crisi_varco') {
                  defaultRoster = ['finn', 'topolino'];
              } else if (campId === 'monarch_akuma') {
                  defaultRoster = ['ladybug', 'chatnoir'];
              } else {
                  const storyChars = getCampaignStoryCharacters(campId);
                  defaultRoster = CHARACTERS.filter(c => !c.isSummonOnly && !storyChars.includes(c.id)).map(c => c.id);
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
                      setCampaignState(parsed);
                      return parsed; 
                  } catch(e){}
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
const { activeCampaign, activeCampaignId, campaignState, setAppMode, setCampaignState } = ctx;

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
