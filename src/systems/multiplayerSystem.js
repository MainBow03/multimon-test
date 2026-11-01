// Moduli dei sistemi di Multimon: funzioni originali con contesto esplicito.
export const handleAvatarUploadImpl = (ctx, e) => {
const { setPlayerAvatarUrl } = ctx;

              const file = e.target.files[0];
              if (!file) return;

              const reader = new FileReader();
              reader.onload = (event) => {
                  const img = new Image();
                  img.onload = () => {
                      const canvas = document.createElement('canvas');
                      const MAX_SIZE = 150; // Dimensione ridotta per non appesantire Firestore
                      let width = img.width;
                      let height = img.height;

                      if (width > height) {
                          if (width > MAX_SIZE) {
                              height *= MAX_SIZE / width;
                              width = MAX_SIZE;
                          }
                      } else {
                          if (height > MAX_SIZE) {
                              width *= MAX_SIZE / height;
                              height = MAX_SIZE;
                          }
                      }
                      canvas.width = width;
                      canvas.height = height;
                      const ctx = canvas.getContext('2d');
                      ctx.drawImage(img, 0, 0, width, height);
                      
                      const dataUrl = canvas.toDataURL('image/jpeg', 0.8); // Formato compresso
                      setPlayerAvatarUrl(dataUrl);
                  };
                  img.src = event.target.result;
              };
              reader.readAsDataURL(file);
          
};

export const leaveRoomImpl = (ctx) => {
const { initialGameState, setAppMode, setCombatLog, setGameState, setIsLogOpen, setPlayerRole, setRoomId } = ctx;

            localStorage.removeItem('multiverse_rpg_session');
            setAppMode('menu');
            setRoomId(null);
            setPlayerRole(null);
            setGameState(initialGameState());
            setCombatLog([]);
            setIsLogOpen(false);
          
};

export const handleConfirmLeaveImpl = async (ctx) => {
const { CHARACTERS, activeCampaignId, appMode, campaignState, gameState, leaveRoom, playerRole, setAppMode, setCampaignSelectedTeam, setCampaignState, setShowLeaveConfirm, updateState } = ctx;

              setShowLeaveConfirm(false);
              const inBattleStates = ['battling', 'executing', 'switching_phase', 'pre_battle', 'intermission'];

              if (gameState.isCampaignBattle) {
                  // Ritiro in campagna: Fallimento automatico, salva HP del team e dei boss
                  const newRosterStats = { ...campaignState.rosterStats };
                  if (gameState.teams && gameState.teams.p1) {
                      gameState.teams.p1.forEach(c => {
                          if (!c.isSummonOnly) newRosterStats[c.id] = c.hp;
                      });
                  }

                  let currentEnemyState = null;
                  if (gameState.teams && gameState.teams.p2) {
                      const aliveEnemies = gameState.teams.p2.filter(c => c.hp > 0);
                      if (aliveEnemies.length > 0) {
                          currentEnemyState = aliveEnemies.map(c => ({
                              id: c.id,
                              hp: c.hp,
                              maxHp: c.maxHp,
                              atk: c.atk,
                              def: c.def,
                              spd: c.spd,
                              statuses: c.statuses,
                              isJuggernaut: c.isJuggernaut,
                              juggHitsRemaining: c.juggHitsRemaining,
                              juggTurnCount: c.juggTurnCount
                          }));
                      }
                  }

                  // Prevenzione Soft-lock: se muoiono TUTTI i pg del roster (o in Torneo Assoluto), li cura per riprovare
                  const aliveCount = campaignState.roster.filter(id => newRosterStats[id] > 0).length;
                  if (aliveCount === 0 || activeCampaignId === 'torneo_assoluto') {
                      campaignState.roster.forEach(id => {
                          const baseChar = CHARACTERS.find(c=>c.id===id);
                          if (activeCampaignId === 'torneo_assoluto') {
                              newRosterStats[id] = baseChar ? baseChar.maxHp : 100;
                          } else {
                              newRosterStats[id] = Math.max(1, Math.floor((baseChar ? baseChar.maxHp : 100) * 0.3)); 
                          }
                      });
                  }

                  setCampaignSelectedTeam([]); // FIX: Svuota la squadra selezionata per poter riprovare senza blocchi
                  setCampaignState(p => ({...p, rosterStats: newRosterStats, currentBossState: currentEnemyState}));
                  leaveRoom();
                  setAppMode('campaign_map');
                  return;
              }

              if (inBattleStates.includes(gameState.status) && appMode === 'online_room') {
                  // FORFAIT ONLINE: Uccide l'intero team per concedere la vittoria agli altri
                  let newTeams = JSON.parse(JSON.stringify(gameState.teams));
                  if (newTeams[playerRole]) {
                      newTeams[playerRole].forEach(c => c.hp = 0);
                  }
                  
                  // Manda un'azione fittizia per assicurarsi che il server registri il turno se bloccato
                  let newActions = JSON.parse(JSON.stringify(gameState.actions));
                  newActions[playerRole] = { forfeit: true };
                  
                  await updateState({ 
                      teams: newTeams, 
                      actions: newActions,
                      [`players.${playerRole}`]: `${gameState.players[playerRole]} (Arreso)`
                  });
              }
              
              leaveRoom();
          
};

export const updateStateImpl = async (ctx, newState) => {
const { appId, appMode, db, doc, roomId, setGameState, updateDoc } = ctx;

            if (appMode === 'local_room') {
              setGameState(prev => {
                const nextState = { ...prev };
                Object.keys(newState).forEach(key => {
                  if (key.includes('.')) {
                    const parts = key.split('.');
                    let current = nextState;
                    for (let i = 0; i < parts.length - 1; i++) {
                      current[parts[i]] = { ...current[parts[i]] }; 
                      current = current[parts[i]];
                    }
                    current[parts[parts.length - 1]] = newState[key];
                  } else {
                    nextState[key] = newState[key];
                  }
                });
                return nextState;
              });
              return Promise.resolve();
            } else if (appMode === 'online_room' && roomId) {
              const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', roomId);
              await updateDoc(roomRef, newState);
            }
          
};

export const getRequiredPlayersImpl = (ctx, mode, currentSettings) => {

              if (mode === 'classica') return 2;
              if (mode === 'torneo_punti' || mode === 'battleroyale' || mode === 'juggernaut' || mode === 'survival') return currentSettings ? currentSettings.maxPlayers : (mode === 'survival' ? 2 : 4);
              return 4;
          
};

export const getActivePlayersImpl = (ctx) => {
const { gameState } = ctx;

              if (gameState.gameMode === 'classica') return ['p1', 'p2'];
              if (gameState.gameMode === 'multipla') return ['p1', 'p2', 'p3', 'p4'];
              if (gameState.gameMode === 'battleroyale') {
                  return ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'].filter(p => gameState.players[p]);
              }
              if (gameState.gameMode === 'juggernaut' || gameState.gameMode === 'survival') {
                  return ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'].slice(0, gameState.settings.maxPlayers).filter(p => gameState.players[p]);
              }
              if (gameState.gameMode === 'torneo') {
                  let active = [];
                  const b = gameState.tournamentBracket || ['p1', 'p2', 'p3', 'p4'];
                  const phase = gameState.tournamentPhase || 'semis';
                  const tStatus = gameState.tournamentMatchStatus || {};
                  
                  if (phase === 'semis') {
                      if (tStatus.semi1 !== 'finished') active.push(b[0], b[1]);
                      if (tStatus.semi2 !== 'finished') active.push(b[2], b[3]);
                  } else if (phase === 'finals') {
                      const res = gameState.tournamentResults || {};
                      if (tStatus.final !== 'finished' && res.semi1 && res.semi2) {
                          active.push(res.semi1.winner, res.semi2.winner);
                      }
                      if (tStatus.bronze !== 'finished' && res.semi1 && res.semi2) {
                          active.push(res.semi1.loser, res.semi2.loser);
                      }
                  }
                  return active;
              }
              if (gameState.gameMode === 'torneo_punti') {
                  if (gameState.roundRobinMatches && gameState.roundRobinMatches.length > 0) {
                      const match = gameState.roundRobinMatches[gameState.currentMatchIdx];
                      return [match.pA, match.pB];
                  }
                  return ['p1', 'p2'];
              }
              return ['p1', 'p2'];
          
};

export const isAllPlayersJoinedImpl = (ctx) => {
const { gameState, getRequiredPlayers } = ctx;

              const req = getRequiredPlayers(gameState.gameMode, gameState.settings);
              let joined = 0;
              const slots = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'].slice(0, req);
              slots.forEach(slot => {
                  if (gameState.players[slot]) {
                      joined++;
                  }
              });
              
              if (gameState.gameMode === 'torneo_punti' || gameState.gameMode === 'battleroyale') return joined >= 2;
              if (gameState.gameMode === 'juggernaut' || gameState.gameMode === 'survival') return joined === req;
              return joined === req;
          
};

export const handleCreateRoomImpl = async (ctx) => {
const { appId, db, doc, getPlayerData, initialGameState, playerAvatarUrl, playerName, setAppMode, setDoc, setPlayerRole, setRoomId, setSystemAlert, user } = ctx;

            if (!playerName.trim()) return setSystemAlert("Inserisci il tuo nome!");
            if (!user) return setSystemAlert("Connessione ai server in corso, riprova tra un istante.");
            const newRoomId = Math.random().toString(36).substring(2, 7).toUpperCase();
            const state = initialGameState();
            state.players.p1 = playerName;
            state.playerAvatars.p1 = playerAvatarUrl;
            state.inventory.p1 = getPlayerData().inventory;
            
            const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', newRoomId);
            await setDoc(roomRef, state);
            
            setRoomId(newRoomId);
            setPlayerRole('p1');
            setAppMode('online_room');
          
};

export const handleJoinRoomImpl = async (ctx) => {
const { appId, db, doc, getDoc, getPlayerData, getRequiredPlayers, playerAvatarUrl, playerName, roomIdInput, setAppMode, setCoopRoomId, setPlayerRole, setRoomId, setSystemAlert, updateDoc, user } = ctx;

            if (!playerName.trim() || !roomIdInput.trim()) return setSystemAlert("Inserisci nome e codice stanza!");
            if (!user) return setSystemAlert("Connessione in corso...");
            const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', roomIdInput.toUpperCase());
            const snap = await getDoc(roomRef);
            if (!snap.exists()) return setSystemAlert("Stanza non trovata!");
            
            const data = snap.data();

            // --- GESTIONE ACCESSO REALE ALLA STANZA ROGUELIKE CO-OP ---
            if (data.isRoguelikeCoop) {
                let assignedRole = null;
                if (!data.players.p2) assignedRole = 'p2';
                else if (!data.players.p3) assignedRole = 'p3';
                
                if (!assignedRole) return setSystemAlert("Stanza Co-op piena o spedizione già iniziata!");

                await updateDoc(roomRef, {
                    [`players.${assignedRole}`]: playerName,
                    [`playerAvatars.${assignedRole}`]: playerAvatarUrl,
                    [`isBot.${assignedRole}`]: false,
                    [`inventory.${assignedRole}`]: { pozione: 2, resurrezione: 1 } // FIX: Oggetti iniziali
                });
                setRoomId(roomIdInput.toUpperCase());
                setPlayerRole(assignedRole);
                setCoopRoomId(roomIdInput.toUpperCase());
                setAppMode('roguelike_coop_lobby');
                return;
            }
            // ----------------------------------------------------------

            let assignedRole = null;
            const req = getRequiredPlayers(data.gameMode, data.settings);
            
            let slotsToCheck = ['p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'].slice(0, req - 1);

            slotsToCheck.forEach(slot => {
                 if (!assignedRole && (!data.players[slot] || data.isBot[slot])) {
                      assignedRole = slot;
                 }
            });

            if (!assignedRole) return setSystemAlert("Stanza piena o partita in corso!");

            await updateDoc(roomRef, { 
                [`players.${assignedRole}`]: playerName,
                [`playerAvatars.${assignedRole}`]: playerAvatarUrl,
                [`isBot.${assignedRole}`]: false,
                [`inventory.${assignedRole}`]: getPlayerData().inventory
            });
            setRoomId(roomIdInput.toUpperCase());
            setPlayerRole(assignedRole);
            setAppMode('online_room');
          
};

export const handleAddBotImpl = (ctx, slot) => {
const { gameState, updateState } = ctx;

            const botNum = Object.values(gameState.isBot).filter(Boolean).length + 1;
            updateState({
                [`players.${slot}`]: `CPU Bot ${botNum}`,
                [`playerAvatars.${slot}`]: `https://api.dicebear.com/7.x/bottts/svg?seed=CpuBot${botNum}&backgroundColor=020617`,
                [`isBot.${slot}`]: true,
                [`inventory.${slot}`]: { cura_totale: 1 }
            });
          
};

export const handleRemovePlayerImpl = (ctx, slot) => {
const { updateState } = ctx;

            updateState({
                [`players.${slot}`]: null,
                [`playerAvatars.${slot}`]: '',
                [`isBot.${slot}`]: false,
                [`inventory.${slot}`]: {}
            });
          
};

export const handleLocalStartImpl = (ctx) => {
const { getPlayerData, initialGameState, playerAvatarUrl, playerName, setAppMode, setGameState, setPlayerRole } = ctx;

            const state = initialGameState();
            state.players.p1 = playerName || "Gioc. 1";
            state.playerAvatars.p1 = playerAvatarUrl;
            state.inventory.p1 = getPlayerData().inventory;
            setGameState(state);
            setPlayerRole('p1');
            setAppMode('local_room');
          
};

export const handleVsCpuStartImpl = (ctx) => {
const { getPlayerData, initialGameState, playerAvatarUrl, playerName, setAppMode, setGameState, setPlayerRole } = ctx;

            const state = initialGameState();
            state.players.p1 = playerName || "Giocatore";
            state.playerAvatars.p1 = playerAvatarUrl;
            state.inventory.p1 = getPlayerData().inventory;
            state.players.p2 = "Bot Supremo";
            state.playerAvatars.p2 = 'https://api.dicebear.com/7.x/bottts/svg?seed=CpuBot&backgroundColor=020617';
            state.isBot.p2 = true;
            state.inventory.p2 = { cura_totale: 1, pozione: 2 };
            setGameState(state);
            setPlayerRole('p1');
            setAppMode('local_room');
          
};

export const handlePickImpl = (ctx, char) => {
const { CHARACTERS, FUSION_CHARACTERS, gameState, playerRole, setDraftTimeLeft, updateState } = ctx;

            const currentDraft = gameState.draft[playerRole] || [];
            const myTeamSize = ((gameState.gameMode === 'juggernaut' || gameState.gameMode === 'survival') && playerRole === (gameState.settings.juggernautPlayer || (gameState.gameMode === 'survival' ? 'p2' : 'p1'))) ? 1 : gameState.settings.teamSize;
            if (currentDraft.length >= myTeamSize) return;
            
            const charInstance = { 
                ...char, 
                statuses: [],
                consecutiveProtect: 0,
                baseAtk: char.atk,
                baseDef: char.def,
                baseSpd: char.spd,
                moves: char.moves.filter(Boolean).map(m => ({ ...m, remainingUses: m.maxUses !== undefined ? m.maxUses : null }))
            };

            let updates = { [`draft.${playerRole}`]: [...currentDraft, charInstance] };

            // Se è Draft Battle e dobbiamo ancora scegliere, generiamo altre 3 carte
            if (gameState.settings.draftBattle && currentDraft.length + 1 < myTeamSize) {
                const baseRoster = gameState.settings.fusionMode ? FUSION_CHARACTERS : CHARACTERS;
                const draftable = baseRoster.filter(c => !c.isSummonOnly && !c.isSecretUnlock);
                
                // Esclude chi hai già scelto dalle future scelte
                const pickedIds = [...currentDraft.map(c => c.id), char.id];
                const availableDraftable = draftable.filter(c => !pickedIds.includes(c.id));

                const shuffled = [...availableDraftable].sort(() => 0.5 - Math.random());
                updates[`draftChoices.${playerRole}`] = shuffled.slice(0, 3);
            }

            updateState(updates);
            setDraftTimeLeft(30); // Resetta il timer
          
};

export const handleDraftRerollImpl = (ctx) => {
const { CHARACTERS, FUSION_CHARACTERS, gameState, playerRole, setDraftTimeLeft, updateState } = ctx;

              const currentRerolls = gameState.draftRerolls?.[playerRole] !== undefined ? gameState.draftRerolls[playerRole] : 2;
              if (currentRerolls <= 0) return;

              const currentDraft = gameState.draft[playerRole] || [];
              const baseRoster = gameState.settings.fusionMode ? FUSION_CHARACTERS : CHARACTERS;
              const draftable = baseRoster.filter(c => !c.isSummonOnly && !c.isSecretUnlock);
              
              const pickedIds = currentDraft.map(c => c.id);
              const currentChoicesIds = (gameState.draftChoices[playerRole] || []).map(c => c.id);
              
              // Esclude chi è già in squadra e (se possibile) le 3 scelte attuali per dare vera varietà
              let availableDraftable = draftable.filter(c => !pickedIds.includes(c.id) && !currentChoicesIds.includes(c.id));
              
              if (availableDraftable.length < 3) {
                  availableDraftable = draftable.filter(c => !pickedIds.includes(c.id));
              }

              const shuffled = [...availableDraftable].sort(() => 0.5 - Math.random());
              
              updateState({
                  [`draftChoices.${playerRole}`]: shuffled.slice(0, 3),
                  [`draftRerolls.${playerRole}`]: currentRerolls - 1
              });
              setDraftTimeLeft(30); // Resetta timer su reroll
          
};

export const handleSharedPickImpl = (ctx, poolIdx, pRole) => {
const { gameState, updateState } = ctx;

              const activeTurnPlayer = gameState.draftSequence[gameState.currentDraftTurn];
              if (pRole !== activeTurnPlayer) return; // FIX ANTI-LAG: Impedisce doppie scelte simultanee

              const item = gameState.sharedDraftPool[poolIdx];
              if (!item || item.pickedBy) return; // Già scelto

              const charInstance = { 
                  ...item.char, 
                  statuses: [],
                  consecutiveProtect: 0,
                  baseAtk: item.char.atk,
                  baseDef: item.char.def,
                  baseSpd: item.char.spd,
                  moves: item.char.moves.filter(Boolean).map(m => ({ ...m, remainingUses: m.maxUses !== undefined ? m.maxUses : null }))
              };

              let newDraft = [...(gameState.draft[pRole] || []), charInstance];
              let newPool = [...gameState.sharedDraftPool];
              newPool[poolIdx] = { ...newPool[poolIdx], pickedBy: pRole };

              updateState({
                  [`draft.${pRole}`]: newDraft,
                  sharedDraftPool: newPool,
                  currentDraftTurn: gameState.currentDraftTurn + 1
              });
              // rimosso il setDraftTimeLeft(15) da qui perché ora è gestito in sicurezza all'inizio dell'effetto
          
};
