const initialGameState = () => ({
          status: 'lobby', 
          gameMode: 'classica', 
          isCampaignBattle: false,
          battleWeather: null, // Meteo condiviso; azzerato in ogni nuova partita
          fieldTraps: {}, // Trappole piazzate su ciascun campo avversario
          fieldTrapSeen: {}, // Ultimi membri presenti, per colpire solo i nuovi ingressi
          survivalRound: 1, // <--- AGGIUNTO PER LA SOPRAVVIVENZA
          players: { p1: null, p2: null, p3: null, p4: null, p5: null, p6: null, p7: null, p8: null },
          playerUids: { p1: null, p2: null, p3: null, p4: null, p5: null, p6: null, p7: null, p8: null },
          hostHeartbeatAt: null,
          phaseStartedAt: null,
          playerAvatars: { p1: '', p2: '', p3: '', p4: '', p5: '', p6: '', p7: '', p8: '' },
          playerTitles: { p1: '', p2: '', p3: '', p4: '', p5: '', p6: '', p7: '', p8: '' },
          playerMastery: { p1: {}, p2: {}, p3: {}, p4: {}, p5: {}, p6: {}, p7: {}, p8: {} },
          playerStrength: { p1: {}, p2: {}, p3: {}, p4: {}, p5: {}, p6: {}, p7: {}, p8: {} },
          playerStrengthOwned: { p1: [], p2: [], p3: [], p4: [], p5: [], p6: [], p7: [], p8: [] },
          isBot: { p1: false, p2: false, p3: false, p4: false, p5: false, p6: false, p7: false, p8: false },
          settings: { teamSize: 4, fieldSize: 1, maxPlayers: 4, juggernautPlayer: 'p1', soundtrack: 'wpEBouFcwqI', rentalMode: false, fusionMode: false, draftBattle: false, sharedDraft: false }, 
          draft: { p1: [], p2: [], p3: [], p4: [], p5: [], p6: [], p7: [], p8: [] },
          draftChoices: { p1: [], p2: [], p3: [], p4: [], p5: [], p6: [], p7: [], p8: [] }, // <--- AGGIUNTO PER DRAFT BATTLE
          draftRerolls: { p1: 2, p2: 2, p3: 2, p4: 2, p5: 2, p6: 2, p7: 2, p8: 2 }, // <--- AGGIUNTO PER REROLL DRAFT
          sharedDraftPool: [], // <--- AGGIUNTO PER DRAFT CONDIVISO
          draftSequence: [], // <--- AGGIUNTO PER DRAFT CONDIVISO (Ordine turni)
          currentDraftTurn: 0, // <--- AGGIUNTO PER DRAFT CONDIVISO
          teams: { p1: [], p2: [], p3: [], p4: [], p5: [], p6: [], p7: [], p8: [] },
          field: { p1: [], p2: [], p3: [], p4: [], p5: [], p6: [], p7: [], p8: [] }, 
          actions: { p1: {}, p2: {}, p3: {}, p4: {}, p5: {}, p6: {}, p7: {}, p8: {} }, 
          inventory: { p1: {}, p2: {}, p3: {}, p4: {}, p5: {}, p6: {}, p7: {}, p8: {} },
          hyperUsed: { p1: false, p2: false, p3: false, p4: false, p5: false, p6: false, p7: false, p8: false }, // <--- AGGIUNTO PER FORMA IPER
          events: [], 
          winner: null,
          postExecStatus: 'battling', 
          pendingSwitches: { p1: 0, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0, p7: 0, p8: 0 },
          switchActions: { p1: [], p2: [], p3: [], p4: [], p5: [], p6: [], p7: [], p8: [] },
          tournamentMatch: null, 
          tournamentPhase: 'semis', // <--- AGGIUNTO PER LE LOTTE SIMULTANEE
          tournamentMatchStatus: { semi1: 'battling', semi2: 'battling', final: 'battling', bronze: 'battling' }, // <--- AGGIUNTO
          tournamentBracket: ['p1', 'p2', 'p3', 'p4'],
          tournamentResults: { semi1: null, semi2: null, bronze: null, final: null },
          roundRobinMatches: [],
          currentMatchIdx: 0,
          playerScores: { p1: 0, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0, p7: 0, p8: 0 },
          turnExpiresAt: null // <--- AGGIUNTO PER IL TIMER GLOBALE
        });

export { initialGameState };
