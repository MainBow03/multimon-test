import { ITEMS_DB } from '../data/items.js';
import { CHARACTERS } from '../data/characters.js';
import { grantMasteryXP, isMasteryUnlocked, isMasteryEligible } from './masterySystem.js';
import { trainStrength, grantTutorialStrengthUpgrade } from './strengthLab.js';
import { awardCampaignChest, openCampaignChest, acknowledgeChestReveal } from './campaignChests.js';
import { grantRoguelikeMilestone, grantRoguelikeCompletion, openPowerChest, acknowledgePowerChest, completeFinnTutorial } from './roguelikePowerRewards.js';

const masteryEligibleIds = new Set(CHARACTERS.filter(isMasteryEligible).map(char => char.id));
// Moduli dei sistemi di Multimon: funzioni originali con contesto esplicito.
export const updateLocalStatsImpl = (ctx, updates) => {
const { getPlayerData } = ctx;

              const key = `multiverse_rpg_global_profile`;
              let current = getPlayerData();

              if (updates.masteryIds) {
                  current = grantMasteryXP(current, updates.masteryIds, !!updates.masteryWon, masteryEligibleIds);
              }
              if (Object.prototype.hasOwnProperty.call(updates, 'equipMasteryTitle')) {
                  const id = updates.equipMasteryTitle;
                  if (id === null || (masteryEligibleIds.has(id) && isMasteryUnlocked(current, id)))
                      current.equippedMasteryTitle = id;
              }
              if (updates.match) current.matches++;
              if (updates.win) current.wins++;
              if (updates.playtime) current.playtime += updates.playtime;
              if (updates.char) {
                  current.chars[updates.char] = (current.chars[updates.char] || 0) + 1;
              }
              if (updates.move) {
                  current.moves[updates.move] = (current.moves[updates.move] || 0) + 1;
              }
              // Spesa atomica sul profilo locale; non si possono comprare
              // livelli non posseduti, oltre il limite o senza punti.
              // Roguelike: una cassa per traguardo di 5 piani della stessa run.
              // La registrazione e il saldo sono nello stesso salvataggio, per
              // impedire doppie ricompense al refresh o al doppio click.
              if(updates.roguelikeMilestone){
                  const {runId,floor}=updates.roguelikeMilestone;
                  const result=grantRoguelikeMilestone(current,runId,floor);
                  if(!result.ok)return result;
                  current=result.profile;
              }
              if(updates.roguelikeComplete){
                  const {runId,floor,maxFloor}=updates.roguelikeComplete;
                  const result=grantRoguelikeCompletion(current,runId,floor,maxFloor);
                  if(!result.ok)return result;
                  current=result.profile;
                  localStorage.setItem(key,JSON.stringify(current));
                  return {ok:true,rewarded:result.rewarded,points:result.points,remainingMs:result.remainingMs};
              }
              if(updates.openPowerChest){
                  const result=openPowerChest(current);
                  if(!result.ok)return result;
                  current=result.profile;
                  localStorage.setItem(key,JSON.stringify(current));
                  return {ok:true,points:result.points,receipt:result.receipt};
              }
              if(updates.acknowledgePowerChest)
                  current=acknowledgePowerChest(current).profile;
              if(updates.completeFinnTutorial){
                  const result=completeFinnTutorial(current,updates.completeFinnTutorial);
                  if(!result.ok)return result;
                  current=result.profile;
              }
              if (updates.awardCampaignChest) {
                  const {campaignId,missionId}=updates.awardCampaignChest;
                  current=awardCampaignChest(current,campaignId,missionId).profile;
              }
              if (updates.openCampaignChest) {
                  const result=openCampaignChest(current,CHARACTERS,ITEMS_DB);
                  if(!result.ok)return result;
                  current=result.profile;
                  localStorage.setItem(key,JSON.stringify(current));
                  return {ok:true,rewards:result.rewards,receipt:result.receipt};
              }
              if (updates.acknowledgeChestReveal)
                  current=acknowledgeChestReveal(current).profile;
              if (updates.freeLabUpgrade) {
                  const {charId,stat}=updates.freeLabUpgrade;
                  const char=CHARACTERS.find(c=>c.id===charId);
                  const result=grantTutorialStrengthUpgrade(current,char,stat);
                  if(!result.ok)return result;
                  current=result.profile;
              }
              if (Object.prototype.hasOwnProperty.call(updates,'labTutorialStep')) {
                  const step=Number(updates.labTutorialStep);
                  if(Number.isInteger(step)&&step>=0&&step<=9)
                      current.labTutorialStep=Math.max(current.labTutorialStep||0,step);
              }
              if (updates.completeLabTutorial) {
                  current.strengthLabIntroSeen=true;
                  current.labTutorialStep=9;
              }
                            if (updates.strengthUpgrade) {
                  const {charId,stat}=updates.strengthUpgrade;
                  const character=CHARACTERS.find(c=>c.id===charId);
                  const result=trainStrength(current,character,stat);
                  if(!result.ok)return {ok:false,reason:result.reason};
                  current=result.profile;
              }
              if (updates.addStrengthPoints && Number.isFinite(updates.addStrengthPoints) && updates.addStrengthPoints>0)
                  current.strengthPoints=(current.strengthPoints||0)+Math.floor(updates.addStrengthPoints);
                            if (updates.addCoins) current.coins += updates.addCoins;
              if (updates.spendCoins) current.coins -= updates.spendCoins;
              if (updates.buyItem) {
                  // Uno strumento da lotta viene sbloccato una volta per sempre,
                  // mentre le cure dello zaino restano consumabili.
                  if(ITEMS_DB[updates.buyItem]?.type==='held')
                      current.inventory[updates.buyItem] = Math.max(1,current.inventory[updates.buyItem]||0);
                  else current.inventory[updates.buyItem] = (current.inventory[updates.buyItem] || 0) + 1;
              }
              if (updates.unlockChar) {
                  if (!current.unlockedChars) current.unlockedChars = [];
                  if (!current.unlockedChars.includes(updates.unlockChar)) {
                      current.unlockedChars.push(updates.unlockChar);
                  }
              }
              if (updates.overwriteInventory) {
                  const owned=Object.fromEntries(Object.keys(current.inventory||{})
                      .filter(id=>ITEMS_DB[id]?.type==='held'&&current.inventory[id]>0)
                      .map(id=>[id,current.inventory[id]]));
                  current.inventory={...updates.overwriteInventory,...owned};
              }
              if (updates.maxSurvivalRound !== undefined && updates.maxSurvivalRound > (current.maxSurvivalRound || 0)) {
                  current.maxSurvivalRound = updates.maxSurvivalRound;
              }
              if (updates.useFreeUnlock) {
                  current.freeUnlockUsed = true; // <-- AGGIUNTO PER REGALO BETA
              }
              
              localStorage.setItem(key, JSON.stringify(current));
              return {ok:true};
          
};
