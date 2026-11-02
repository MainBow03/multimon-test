import { ITEMS_DB } from '../data/items.js';
import { CHARACTERS } from '../data/characters.js';
import { FUSION_CHARACTERS } from '../data/fusions.js';
import { grantMasteryXP, isMasteryUnlocked } from './masterySystem.js';

const masteryEligibleIds = new Set([...CHARACTERS, ...FUSION_CHARACTERS].map(char => char.id));
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
          
};
