// Moduli dei sistemi di Multimon: funzioni originali con contesto esplicito.
export const getTournamentMatchOpponentsImpl = (ctx, p) => {
const { gameState } = ctx;

              const phase = gameState.tournamentPhase || 'semis';
              const res = gameState.tournamentResults || {};
              const b = gameState.tournamentBracket || ['p1', 'p2', 'p3', 'p4'];
              
              if (phase === 'semis') {
                  if ([b[0], b[1]].includes(p)) return [b[0], b[1]].filter(x => x !== p);
                  if ([b[2], b[3]].includes(p)) return [b[2], b[3]].filter(x => x !== p);
              } else if (phase === 'finals') {
                  const finalP = [res.semi1?.winner, res.semi2?.winner].filter(Boolean);
                  const bronzeP = [res.semi1?.loser, res.semi2?.loser].filter(Boolean);
                  if (finalP.includes(p)) return finalP.filter(x => x !== p);
                  if (bronzeP.includes(p)) return bronzeP.filter(x => x !== p);
              }
              return [];
          
};

export const handleNextTournamentMatchImpl = (ctx) => {
const { appMode, gameState, setCombatLog, setCommandingIdx, setIsLogOpen, setPlayerRole, updateState } = ctx;

        let healedTeams = JSON.parse(JSON.stringify(gameState.teams));
        ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'].forEach(p => {
            if (healedTeams[p]) {
                healedTeams[p].forEach(char => {
                    char.hp = char.maxHp;
                    char.statuses = [];
                    char.consecutiveProtect = 0;
                    char.atk = char.baseAtk;
                    char.def = char.baseDef;
                    char.spd = char.baseSpd;
                    char.moves.forEach(m => {
                        if (m.maxUses !== undefined) m.remainingUses = m.maxUses;
                    });
                });
            }
        });

        if (gameState.gameMode === 'torneo_punti') {
            const nextIdx = gameState.currentMatchIdx + 1;
            const nextMatch = gameState.roundRobinMatches[nextIdx];
            
            let newField = { p1: [], p2: [], p3: [], p4: [], p5: [], p6: [], p7: [], p8: [] };
            [nextMatch.pA, nextMatch.pB].forEach(p => {
                newField[p] = healedTeams[p].slice(0, gameState.settings.fieldSize).map((_, i) => i);
                newField[p].forEach(idx => {
                    if(healedTeams[p][idx]) healedTeams[p][idx].revealed = true;
                });
            });

            updateState({
                status: 'pre_battle', 
                currentMatchIdx: nextIdx,
                teams: healedTeams,
                field: newField,
                actions: { p1: {}, p2: {}, p3: {}, p4: {}, p5: {}, p6: {}, p7: {}, p8: {} },
                switchActions: { p1: [], p2: [], p3: [], p4: [], p5: [], p6: [], p7: [], p8: [] },
                pendingSwitches: { p1: 0, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0, p7: 0, p8: 0 }
            });

            if (appMode === 'local_room') {
                const activeNext = [nextMatch.pA, nextMatch.pB];
                const humans = activeNext.filter(p => !gameState.isBot[p]);
                if (humans.length > 0) setPlayerRole(humans[0]);
                else setPlayerRole(activeNext[0]);
                setCommandingIdx(0);
            }
            return;
        }

        if (gameState.gameMode === 'torneo') {
            setCombatLog([]);
            setIsLogOpen(false);

            let newField = { p1: [], p2: [], p3: [], p4: [], p5: [], p6: [], p7: [], p8: [] };
            const res = gameState.tournamentResults;
            const activeNext = [res.semi1?.winner, res.semi2?.winner, res.semi1?.loser, res.semi2?.loser].filter(Boolean);
            
            activeNext.forEach(p => {
                newField[p] = healedTeams[p].slice(0, gameState.settings.fieldSize).map((_, i) => i);
                newField[p].forEach(idx => {
                    if(healedTeams[p][idx]) healedTeams[p][idx].revealed = true;
                });
            });

            updateState({
                status: 'pre_battle', 
                tournamentPhase: 'finals',
                tournamentMatchStatus: { semi1: 'finished', semi2: 'finished', final: 'battling', bronze: 'battling' },
                teams: healedTeams,
                field: newField,
                actions: { p1: {}, p2: {}, p3: {}, p4: {}, p5: {}, p6: {}, p7: {}, p8: {} },
                switchActions: { p1: [], p2: [], p3: [], p4: [], p5: [], p6: [], p7: [], p8: [] },
                pendingSwitches: { p1: 0, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0, p7: 0, p8: 0 }
            });

            if (appMode === 'local_room') {
                const humans = activeNext.filter(p => !gameState.isBot[p]);
                if (humans.length > 0) {
                    setPlayerRole(humans[0]);
                } else {
                    setPlayerRole(activeNext[0]);
                }
                setCommandingIdx(0);
            }
            return;
        }
    
};
