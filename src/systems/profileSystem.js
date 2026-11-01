// Moduli dei sistemi di Multimon: funzioni originali con contesto esplicito.
export const updateLocalStatsImpl = (ctx, updates) => {
const { getPlayerData } = ctx;

              const key = `multiverse_rpg_global_profile`;
              let current = getPlayerData();

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
                  current.inventory[updates.buyItem] = (current.inventory[updates.buyItem] || 0) + 1;
              }
              if (updates.unlockChar) {
                  if (!current.unlockedChars) current.unlockedChars = [];
                  if (!current.unlockedChars.includes(updates.unlockChar)) {
                      current.unlockedChars.push(updates.unlockChar);
                  }
              }
              if (updates.overwriteInventory) {
                  current.inventory = updates.overwriteInventory;
              }
              if (updates.maxSurvivalRound !== undefined && updates.maxSurvivalRound > (current.maxSurvivalRound || 0)) {
                  current.maxSurvivalRound = updates.maxSurvivalRound;
              }
              if (updates.useFreeUnlock) {
                  current.freeUnlockUsed = true; // <-- AGGIUNTO PER REGALO BETA
              }
              
              localStorage.setItem(key, JSON.stringify(current));
          
};
