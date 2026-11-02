import { ItemArtwork } from '../../components/ItemArtwork.jsx';
import { isMasteryEligible, masteryDeploymentTier } from '../../systems/masterySystem.js';
// Schermata estratta senza alterare la struttura JSX originale.
export function renderBattlingView(ctx) {
const { ownMasteryLevels, ChevronRight, ITEMS_DB, Loader2, LogOut, PLAYER_THEMES, ScrollText, Shield, TYPE_STYLES, Target, Trophy, XIcon, actionMenuMode, combatLog, commandingIdx, commitAction, displayField, displayTeams, eventPlaybackPassive, eventPlaybackText, gameState, getActivePlayers, getDefaultAvatar, getMultiplier, getTournamentMatchOpponents, handleForceSkip, handleSelectMoveTarget, hoveredMove, isLogOpen, isLongPressRef, isPlayingEvents, leaveRoom, logEndRef, pendingHyper, playerRole, pressTimerRef, renderHealthBar, screenFlash, selectedMultiTargets, isEventBattle=false, eventBattleCanForce=false, setActionMenuMode, setHoveredMove, setIsLogOpen, setPassiveInfoPopup, setPendingHyper, setSelectedMultiTargets, setShowLeaveConfirm, setTargetingMoveIdx, targetingMoveIdx, timeLeft } = ctx;
if (gameState.status === 'battling' || gameState.status === 'executing') {
        const activeMatchPlayers = getActivePlayers();
        
        let bottomPlayers = [];
        let topPlayers = [];
        const isSpectatorState = playerRole === 'spectator';

        if (gameState.gameMode === 'multipla') {
                if (isSpectatorState) { bottomPlayers = ['p1', 'p2']; topPlayers = ['p3', 'p4']; }
                else if (playerRole === 'p1' || playerRole === 'p2') { bottomPlayers = ['p1', 'p2']; topPlayers = ['p3', 'p4']; }
                else { bottomPlayers = ['p3', 'p4']; topPlayers = ['p1', 'p2']; }
        } else if (gameState.gameMode === 'juggernaut' || gameState.gameMode === 'survival') {
                const juggPlayer = gameState.settings.juggernautPlayer || (gameState.gameMode === 'survival' ? 'p2' : 'p1');
                topPlayers = [juggPlayer]; 
                bottomPlayers = activeMatchPlayers.filter(p => p !== juggPlayer);
        } else if (gameState.gameMode === 'torneo') {
            const phase = gameState.tournamentPhase || 'semis';
            const res = gameState.tournamentResults || {};
            const b = gameState.tournamentBracket || ['p1', 'p2', 'p3', 'p4'];
            const tStatus = gameState.tournamentMatchStatus || {};
            let myMatch = [];

            if (phase === 'semis') {
                const m1 = [b[0], b[1]];
                const m2 = [b[2], b[3]];
                if (m1.includes(playerRole)) {
                    myMatch = tStatus.semi1 === 'finished' && tStatus.semi2 !== 'finished' ? m2 : m1;
                } else if (m2.includes(playerRole)) {
                    myMatch = tStatus.semi2 === 'finished' && tStatus.semi1 !== 'finished' ? m1 : m2;
                } else {
                    myMatch = tStatus.semi1 !== 'finished' ? m1 : m2;
                }
            } else {
                const fw = [res.semi1?.winner, res.semi2?.winner].filter(Boolean);
                const bw = [res.semi1?.loser, res.semi2?.loser].filter(Boolean);
                if (fw.includes(playerRole)) {
                    myMatch = tStatus.final === 'finished' && tStatus.bronze !== 'finished' ? bw : fw;
                } else if (bw.includes(playerRole)) {
                    myMatch = tStatus.bronze === 'finished' && tStatus.final !== 'finished' ? fw : bw;
                } else {
                    myMatch = tStatus.final !== 'finished' ? fw : bw;
                }
            }

            if (myMatch.includes(playerRole) && !isSpectatorState) {
                bottomPlayers = [playerRole];
                topPlayers = [myMatch.find(p => p !== playerRole)];
            } else {
                bottomPlayers = [myMatch[0]];
                topPlayers = [myMatch[1]];
            }
        } else if (gameState.gameMode === 'torneo_punti') {
                if (isSpectatorState) {
                        bottomPlayers = [activeMatchPlayers[0]];
                        topPlayers = [activeMatchPlayers[1]];
                } else if (playerRole === activeMatchPlayers[0] || playerRole === activeMatchPlayers[1]) {
                        bottomPlayers = [playerRole];
                        topPlayers = [playerRole === activeMatchPlayers[0] ? activeMatchPlayers[1] : activeMatchPlayers[0]];
                } else {
                        bottomPlayers = [activeMatchPlayers[0]];
                        topPlayers = [activeMatchPlayers[1]];
                }
        } else if (gameState.gameMode === 'battleroyale') {
                if (isSpectatorState) {
                        bottomPlayers = [];
                        topPlayers = activeMatchPlayers;
                } else {
                        bottomPlayers = [playerRole];
                        topPlayers = activeMatchPlayers.filter(p => p !== playerRole);
                }
        } else {
                if (isSpectatorState) {
                        bottomPlayers = ['p1'];
                        topPlayers = ['p2'];
                } else {
                        bottomPlayers = [playerRole === 'p2' ? 'p2' : 'p1'];
                        topPlayers = [playerRole === 'p2' ? 'p1' : 'p2'];
                }
        }

        const isSpectator = isSpectatorState || (!bottomPlayers.includes(playerRole) && !topPlayers.includes(playerRole) && gameState.gameMode !== 'battleroyale');
        const isMyTurn = gameState.status === 'battling' && !isSpectatorState && !gameState.isBot[playerRole] && commandingIdx >= 0 && commandingIdx < gameState.field[playerRole].length;
        const activeCommandCharIdx = isMyTurn ? gameState.field[playerRole][commandingIdx] : null;
        const activeCommandChar = activeCommandCharIdx !== null ? gameState.teams[playerRole][activeCommandCharIdx] : null;

        const currentField = isPlayingEvents ? displayField : gameState.field;

        // --- FUNZIONE PER LA BARRA DELL'INIZIATIVA ---
        const getInitiativeOrder = () => {
            const activeMatchPlayers = getActivePlayers();
            let order = [];
            activeMatchPlayers.forEach(p => {
                const currentFieldForPlayer = isPlayingEvents ? (displayField[p] || []) : (gameState.field[p] || []);
                const team = isPlayingEvents ? (displayTeams[p] || []) : (gameState.teams[p] || []);
                currentFieldForPlayer.forEach(idx => {
                    const char = team[idx];
                    if (char && char.hp > 0) {
                        let effSpd = char.spd;
                        // Dimezza la velocità se è elettrizzato
                        if (char.statuses && char.statuses.some(s => s.type === 'Elettrizzato')) {
                            effSpd = Math.floor(effSpd / 2);
                        }
                        order.push({ player: p, char, effSpd });
                    }
                });
            });
            // Ordina per velocità decrescente
            order.sort((a, b) => b.effSpd - a.effSpd);
            return order;
        };

        const renderStatuses = (statuses) => {
            if (!statuses || statuses.length === 0) return null;
            return (
                <div className="flex gap-1 justify-center mt-1 flex-wrap">
                    {statuses.map((s, i) => {
                        const colors = { 'Confuso': 'bg-fuchsia-500 text-white', 'Protetto': 'bg-sky-400 text-black', 'Riflesso': 'bg-gray-300 text-black', 'Scudo Team': 'bg-teal-400 text-black', 'Stordito': 'bg-amber-600 text-white', 'Infatuato': 'bg-pink-400', 'Elettrizzato': 'bg-yellow-400 text-black', 'Scottato': 'bg-red-500', 'Avvelenato': 'bg-purple-500', 'Congelato': 'bg-cyan-400 text-black', 'Incantato': 'bg-fuchsia-500 text-white', 'Accecato': 'bg-yellow-200 text-gray-900', 'Addormentato': 'bg-slate-400', 'Indebolito': 'bg-stone-500 text-white', 'Ricarica': 'bg-orange-500 text-white', 'Magnetico': 'bg-indigo-500 text-white', 'Rashield': 'bg-yellow-200 text-black', 'Shudoruku': 'bg-orange-600 text-white', 'Dioemuru': 'bg-red-600 text-white', 'In_Groppa': 'bg-emerald-600 text-white', 'Ombra Rapida': 'bg-slate-700 text-cyan-300', 'Rigenerazione': 'bg-emerald-400 text-black' };
                        return <span key={i} className={`text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm uppercase ${colors[s.type] || 'bg-gray-500'}`}>{s.type.substring(0, 3)}</span>;
                    })}
                </div>
            );
        };

        const renderFieldCharacter = (teamPlayer, fieldIdx, charTeamIdx, isEnemySide) => {
            const char = isPlayingEvents ? displayTeams[teamPlayer]?.[charTeamIdx] : gameState.teams[teamPlayer]?.[charTeamIdx];
            if (!char) return null; 
            
            const isDead = char.hp <= 0;
            const masteryLevel = isMasteryEligible(char)
              ? (gameState.playerMastery?.[teamPlayer]?.[char.id] ||
                 (teamPlayer === playerRole ? ownMasteryLevels?.[char.id] : 0) || 1)
              : 1;
            const masteryTier = masteryDeploymentTier(masteryLevel);
            
            let isTargetable = false;
            if (targetingMoveIdx !== null && !isDead && activeCommandChar) {
                    const move = activeCommandChar.moves[targetingMoveIdx];
                    if (move.targetMode === 'ally' || move.targetMode === 'team') {
                            let myTeamPlayers = [playerRole];
                            if (gameState.gameMode === 'multipla') {
                                myTeamPlayers = ['p1', 'p2'].includes(playerRole) ? ['p1', 'p2'] : ['p3', 'p4'];
                            } else if (gameState.gameMode === 'juggernaut' || gameState.gameMode === 'survival') {
                                const juggPlayer = gameState.settings.juggernautPlayer || (gameState.gameMode === 'survival' ? 'p2' : 'p1');
                                if (playerRole !== juggPlayer) {
                                    myTeamPlayers = activeMatchPlayers.filter(p => p !== juggPlayer);
                                }
                            }
                            isTargetable = myTeamPlayers.includes(teamPlayer);
                    } else if (gameState.gameMode === 'juggernaut' || gameState.gameMode === 'survival') {
                            const juggPlayer = gameState.settings.juggernautPlayer || (gameState.gameMode === 'survival' ? 'p2' : 'p1');
                            const myTeam = playerRole === juggPlayer ? [juggPlayer] : activeMatchPlayers.filter(p => p !== juggPlayer);
                            isTargetable = !myTeam.includes(teamPlayer);
                    } else if (gameState.gameMode === 'torneo') {
                            isTargetable = getTournamentMatchOpponents(playerRole).includes(teamPlayer);
                    } else {
                            const myTeam = gameState.gameMode === 'multipla' 
                                     ? (['p1', 'p2'].includes(playerRole) ? ['p1', 'p2'] : ['p3', 'p4']) 
                                     : [playerRole];
                            isTargetable = !myTeam.includes(teamPlayer);
                    }
            }

            const isBeingCommanded = isMyTurn && teamPlayer === playerRole && fieldIdx === commandingIdx;
            const isJuggernaut = char.isJuggernaut || ((gameState.gameMode === 'survival' || gameState.gameMode === 'juggernaut') && teamPlayer === (gameState.settings.juggernautPlayer || (gameState.gameMode === 'survival' ? 'p2' : 'p1')));
            const isHyper = char.isHyper; // <--- RILEVA FORMA IPER GIA' ATTIVA
            const isPendingHyperHere = pendingHyper && isBeingCommanded; // <--- RILEVA SE STA CARICANDO L'ENERGIA
            
            const targetIndex = selectedMultiTargets.findIndex(t => t.player === teamPlayer && t.fieldIdx === fieldIdx);
            const isTargetedNow = targetIndex !== -1;

            let borderClass = isEnemySide ? 'border-red-500/50' : 'border-blue-500/50';
            if (gameState.gameMode === 'battleroyale') {
                borderClass = PLAYER_THEMES[teamPlayer]?.border || 'border-slate-500';
            }
            if (isPendingHyperHere) { // <--- EFFETTO CARICAMENTO PRE-ATTACCO (Quando scegli l'Iper)
                borderClass = 'border-yellow-300 shadow-[0_0_40px_rgba(253,224,71,1)] scale-110 z-30 animate-pulse filter brightness-150';
            } else if (isJuggernaut) {
                borderClass = 'border-rose-600 shadow-[0_0_20px_rgba(225,29,72,0.6)]';
            } else if (isHyper) { // <--- EFFETTO FORMA IPER (Dopo che si è trasformato)
                borderClass = 'border-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.8)] z-40';
            }
            
            if (char.mahitoTransformed && !isHyper && !isJuggernaut) {
                borderClass = 'border-fuchsia-400 shadow-[0_0_25px_rgba(217,70,239,0.85)]';
            }

            if (isTargetedNow) {
                borderClass = 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)] scale-105 cursor-pointer z-20';
            } else if (isTargetable) {
                borderClass = 'border-yellow-400 animate-pulse cursor-pointer shadow-[0_0_15px_rgba(250,204,21,0.5)]';
            }
            if (isBeingCommanded) borderClass = 'border-white shadow-[0_0_20px_rgba(255,255,255,0.6)] scale-105 z-10';

            let effectivenessBadge = null;
            if (isTargetable && targetingMoveIdx !== null && activeCommandChar) {
                    const move = activeCommandChar.moves[targetingMoveIdx];
                    if (move && move.power > 0 && move.type && !move.targetMode && !move.isProtect && !move.isSummon) {
                            const multiplier = getMultiplier(move.type, char.types);
                            if (multiplier > 1) {
                                    effectivenessBadge = <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)] border border-green-300 z-30 animate-bounce whitespace-nowrap">SUPER EFFICACE!</div>;
                            } else if (multiplier < 1 && multiplier > 0) {
                                    effectivenessBadge = <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.8)] border border-red-400 z-30 whitespace-nowrap">POCO EFFICACE</div>;
                            } else if (multiplier === 0) {
                                    effectivenessBadge = <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(75,85,99,0.8)] border border-gray-400 z-30 whitespace-nowrap">NESSUN EFFETTO</div>;
                            }
                    }
            }
            
            // --- LOGICA CAMBIO IMMAGINE TRASFORMAZIONI + ANIMAZIONE ---
            let formLevel = 0;
            let displayImg = char.img;
            if (char.mahitoTransformed) formLevel = 'soul';
            
            if (char.id === 'ponygon' && char.statuses) {
                if (char.statuses.some(s => s.type === 'Dioemuru')) {
                    formLevel = 2; // Seconda trasformazione (Dioemuru Shudoruku)
                    displayImg = "https://static.wikia.nocookie.net/zatchbell/images/2/20/DioemurShudorukZBGM.webp/revision/latest/scale-to-width-down/250?cb=20240908143545";
                } else if (char.statuses.some(s => s.type === 'Shudoruku')) {
                    formLevel = 1; // Prima trasformazione (Shudoruku)
                    displayImg = "https://static.wikia.nocookie.net/zatchbell/images/1/1b/ShudorukGoldenMemories.webp/revision/latest/scale-to-width-down/420?cb=20240521225743";
                }
            }
            // --- FORMA IPER (Cambio Immagine e Animazione Esplosiva) ---
            if (isHyper) {
                formLevel = 'hyper'; // Forza l'aggiornamento della key React
                if (char.id === 'barry') {
                    displayImg = "https://i.redd.it/le0qp8fednsc1.jpeg"; // NUOVA IMMAGINE REDDIT
                } else if (char.id === 'gardevoir') {
                    displayImg = "https://i.pinimg.com/736x/5b/fc/45/5bfc453fcdf52854983d80f2b7614abf.jpg";
                } else if (char.id === 'astral') {
                    displayImg = "https://i.pinimg.com/736x/cb/c6/27/cbc62707cd7e489bc2af1452055cd148.jpg"; 
                } else if (char.id === 'polterpup') {
                    displayImg = "https://i.pinimg.com/736x/7c/cb/6b/7ccb6b4a151705a8186777ae1379c472.jpg";
                } else if (char.id === 'spongebob') {
                    displayImg = "https://i.pinimg.com/1200x/a2/b3/11/a2b3112c702d2f0f03a8adc3cc05eb78.jpg"; // Spongebob Muscoloso
                } else if (char.id === 'patrick') {
                    displayImg = "https://i.pinimg.com/1200x/f9/b2/b1/f9b2b173fa94cf8b883787c26118cc61.jpg"; // Patrick Muscoloso
                } else if (char.id === 'alphonse') {
                    displayImg = "https://i.pinimg.com/736x/f5/52/0c/f5520ce0b913d427f0f992774.jpg"; // Alphonse Iper
                } else if (char.id === 'ariana') {
                    displayImg = "https://i.pinimg.com/736x/1a/d9/67/1ad967b56ae629c6acb40c00e837613d.jpg"; // Ariana Iper
                } else if (char.id === 'bloom') {
                    displayImg = "https://i.pinimg.com/736x/58/55/d3/5855d360ba56c8e37976835e48a4b724.jpg"; // Bloom Iper
                } else if (char.id === 'gaston') {
                    displayImg = "https://i.pinimg.com/736x/b3/ff/14/b3ff14068712a2926a7af8eead2422a9.jpg"; // Gaston Iper
                } else if (char.id === 'jake') {
                    displayImg = "https://i.pinimg.com/736x/86/6b/dc/866bdc8b9f83b2da400763e9d7b0a071.jpg"; // Jake Iper
                } else if (char.id === 'marceline') {
                    displayImg = "https://i.pinimg.com/736x/6c/f3/57/6cf357050acbc8e86676d3017d6c4ef4.jpg"; // Marceline Iper
                } else if (char.id === 'finn') {
                    displayImg = "https://i.pinimg.com/736x/51/cd/cf/51cdcf83d6a1d881f91f20bb7c219659.jpg"; // Finn Iper
                } else if (char.id === 'natsu') {
                    displayImg = "https://i.pinimg.com/736x/46/38/71/4638717f53f57400feb9949c77e6f481.jpg"; // Natsu Iper
                } else if (char.id === 'juvia') {
                    displayImg = "https://i.pinimg.com/736x/aa/29/5f/aa295f4695f570b09efbb7e84c1539c3.jpg"; // Juvia Iper
                } else if (char.id === 'laxus') {
                    displayImg = "https://i.pinimg.com/736x/76/e4/d1/76e4d18a3536b22a7e32ea37e1ef5f71.jpg"; // Laxus Iper
                } else if (char.id === 'bumblebee') {
                    displayImg = "https://i.pinimg.com/1200x/fc/1d/de/fc1ddef3272962f71c1678b9a13744bf.jpg"; // Bumblebee Iper
                } else if (char.id === 'corvina') {
                    displayImg = "https://i.pinimg.com/1200x/e9/0b/f7/e90bf763d6dd629badadf4577c1ff017.jpg"; // Corvina Iper
                } else if (char.id === 'entoma') {
                    displayImg = "https://i.pinimg.com/736x/50/e6/2a/50e62a01cc9186095dc216345d820eef.jpg"; // Entoma Iper
                } else if (char.id === 'garnet') {
                    displayImg = "https://i.pinimg.com/1200x/2c/db/e6/2cdbe6606a1387a260136966feb33ad7.jpg"; // Garnet Iper
                } else if (char.id === 'darwin') {
                    displayImg = "https://i.pinimg.com/1200x/c0/51/54/c05154be74cffbbaa49bc46c681082b3.jpg"; // Darwin Iper
                } else if (char.id === 'brago') {
                    displayImg = "https://pbs.twimg.com/media/FWqDimhUEAAh-wk.jpg"; // Brago Iper
                } else if (char.id === 'iris') {
                    displayImg = "https://i.pinimg.com/736x/79/4b/0b/794b0b7ac8e43390a87df4e26bed8b40.jpg"; // Iris Iper
                } else if (char.id === 'sdentato') {
                    displayImg = "https://i.pinimg.com/736x/8f/41/03/8f4103a00fabb4223c3f4095a4635776.jpg"; // Sdentato Iper
                } else if (char.id === 'ladybug') {
                    displayImg = "https://i.pinimg.com/736x/40/b6/29/40b629847b9740338ac820695fe68dd0.jpg"; // Ladybug Iper
                } else if (char.id === 'bowser') {
                    displayImg = "https://i.pinimg.com/736x/46/97/12/4697127f5285439d6d0448bd64a7b1a0.jpg"; // Bowser Iper
                } else if (char.id === 'rainbowdash') {
                    displayImg = "https://i.pinimg.com/736x/31/a1/38/31a13869a5fd16b2c24134e2205ba8fd.jpg"; // Rainbow Dash Iper
                } else if (char.id === 'elsa') {
                    displayImg = "https://i.pinimg.com/1200x/fa/2e/ed/fa2eed50fb89e9ea97d9252aa349a979.jpg"; // Elsa Iper
                } else if (char.id === 'sheldon') {
                    displayImg = "https://i.postimg.cc/FdLNqMxk/Gemini-Generated-Image-85dys085dys085dy.png"; // Sheldon Iper
                } else if (char.id === 'charizard') {
                    displayImg = "https://i.postimg.cc/v1kj6cd6/Gemini-Generated-Image-zd38yrzd38yrzd38.png"; // Charizard Iper
                } else if (char.id === 'maxcaulfield') {
                    displayImg = "https://i.postimg.cc/xXLNqLB9/Copilot-20260701-040119.jpg"; // Max Iper
                } else if (char.id === 'chloeprice') {
                    displayImg = "https://i.postimg.cc/NLm1TZKZ/Gemini-Generated-Image-okh29cokh29cokh2.png"; // Chloe Iper
                } else if (char.id === 'dolli') {
                    displayImg = "https://i.pinimg.com/1200x/a2/4e/80/a24e807c05f25fa984e59ab0b44d952c.jpg"; // Dolli Iper
                } else if (char.id === 'zatchbell') {
                    displayImg = "https://i.pinimg.com/736x/ff/5c/4c/ff5c4c6f0dbd938e1bbc34d3a98e890e.jpg"; // Zatch Iper
                } else if (char.id === 'yoshi') {
                    displayImg = "https://i.postimg.cc/4H1dN6WR/Gemini-Generated-Image-b3jjfwb3jjfwb3jj.png"; // Yoshi Iper
                } else if (char.id === 'poisonivy') {
                    displayImg = "https://i.postimg.cc/w339Gs8Y/Gemini-Generated-Image-ll2m1sll2m1sll2m.png"; // Poison Ivy Iper
                } else if (char.id === 'carlos') {
                    displayImg = "https://i.postimg.cc/mhmqbMVW/Gemini-Generated-Image-1wl7sn1wl7sn1wl7-(1).png"; // Carlos Iper
                } else if (char.id === 'leon') {
                    displayImg = "https://i.postimg.cc/N540GdVZ/834bde13bf771897729c8fc78dfcb7cd-(1).jpg"; // Leon Iper
                }
            }

            let extraAnimClass = "";
            if (formLevel === 1 || formLevel === 2) extraAnimClass = "animate-morph-spin";
            if (formLevel === 'hyper') extraAnimClass = "animate-hyper-awaken";
            else if (masteryTier) extraAnimClass = "mastery-deploy-pop";
            // ---------------------------------------------------
            
            return (
                <div key={`${teamPlayer}-${charTeamIdx}`} className={`relative flex flex-col items-center cursor-pointer ${isJuggernaut ? 'w-56' : 'w-36'} transition-all ${isDead ? 'opacity-0 scale-0 absolute' : 'opacity-100'} ${isHyper ? 'z-[45]' : 'z-10'}`} onClick={() => {
                    if (isTargetable) {
                        handleSelectMoveTarget(teamPlayer, fieldIdx);
                    } else {
                        setPassiveInfoPopup({ name: char.name, passive: char.passive });
                    }
                }}>
                    <div className="bg-slate-800/80 p-2 rounded-lg w-full mb-2 backdrop-blur-sm text-center shadow-lg z-10">
                        <div className="font-bold text-xs truncate text-gray-400 uppercase tracking-widest">{gameState.players[teamPlayer]}</div>
                        <div className="font-bold text-sm truncate text-gray-100 mb-1">
                            {char.name} 
                            {isJuggernaut && <span className="text-[10px] text-rose-500 ml-1">(BOSS)</span>}
                            {isHyper && <span className="text-[10px] text-yellow-400 font-black ml-1">(IPER)</span>}
                            {char.mahitoTransformed && <span className="text-[10px] text-fuchsia-300 font-black ml-1">(TRASFIGURATO)</span>} 
                        </div>
                        
                        <div className="flex gap-1 justify-center mb-1 flex-wrap">
                            {char.types.map(t => (
                                <span key={t} className={`text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm uppercase ${TYPE_STYLES[t] || 'bg-gray-500'}`}>{t}</span>
                            ))}
                        </div>

                        {masteryTier && <div className={`mastery-tier-tag mastery-tier-${masteryTier.level}`} title={masteryTier.description}>
                          {masteryTier.icon} LV {masteryLevel} · {masteryTier.name}
                        </div>}
                        {renderHealthBar(char.hp, char.maxHp)}
                        {renderStatuses(char.statuses)}
                    </div>
                    <div className={`relative ${masteryTier ? 'mastery-portrait mastery-stage-'+masteryTier.level : ''}`}>
                        {masteryTier && <div className={`mastery-entry-ribbon mastery-tier-${masteryTier.level}`} aria-hidden="true">
                          {masteryTier.icon} {masteryTier.name}
                        </div>}
                        {masteryTier?.level >= 10 && <div className="mastery-radiance" aria-hidden="true" />}
                        {masteryTier?.level >= 15 && <div className="mastery-sparks" aria-hidden="true"><i>✦</i><i>✧</i><i>★</i><i>✦</i></div>}
                        <img key={`img-${char.id}-form-${formLevel}`} src={displayImg} style={{ filter: char.imageFilter || 'none' }} className={`${isJuggernaut ? 'w-48 h-48 md:w-56 md:h-56' : 'w-28 h-28'} object-cover rounded-xl border-4 ${borderClass} transition-all ${extraAnimClass} ${masteryTier ? 'mastery-portrait-image mastery-border-'+masteryTier.level : ''}`} alt="" />
                        {ITEMS_DB[char.heldItem]?.type === 'held' && <span
                            title={ITEMS_DB[char.heldItem].name+(char.gemSpent?' · gemma scaricata':' · equipaggiato')}
                            className={'absolute -top-2 -right-2 bg-violet-700 border border-violet-300 text-base rounded-full w-8 h-8 flex items-center justify-center z-20 shadow-lg '+(char.gemSpent?'opacity-45 grayscale':'')}>
                            <ItemArtwork id={char.heldItem} size={24}/></span>}
                        {char.juggHitsRemaining > 0 && (
                            <div className="absolute inset-0 border-[6px] border-cyan-400 rounded-xl shadow-[inset_0_0_20px_rgba(34,211,238,0.8),_0_0_20px_rgba(34,211,238,0.8)] z-30 animate-pulse pointer-events-none flex items-center justify-center bg-cyan-900/30">
                                <span className="text-cyan-100 text-6xl font-black drop-shadow-[0_4px_4px_black]">{char.juggHitsRemaining}</span>
                            </div>
                        )}
                        {isTargetedNow && (
                            <div className="absolute inset-0 border-4 border-rose-500 rounded-xl bg-rose-500/30 z-20 flex items-center justify-center pointer-events-none shadow-[inset_0_0_15px_rgba(244,63,94,0.5)]">
                                <span className="text-white font-black text-4xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{targetIndex + 1}</span>
                            </div>
                        )}
                        {isTargetable && !isTargetedNow && <Target className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-400 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] z-20 pointer-events-none" size={48} />}
                        {effectivenessBadge}
                    </div>
                </div>
            );
        };

        const renderPlayerBanners = (players, isTop) => {
                return (
                        <div className={`flex gap-6 ${isTop ? 'mb-4' : 'mt-4'} drop-shadow-md z-20 w-full justify-center relative`}>
                                {players.map(p => {
                                        const team = isPlayingEvents ? (displayTeams[p] || []) : (gameState.teams[p] || []);
                                        const currentFieldForPlayer = isPlayingEvents ? (displayField[p] || []) : (gameState.field[p] || []);
                                        
                                        // LOGICA SCUDO TEAM VISIVO GLOBALE
                                        const hasScudoTeam = currentFieldForPlayer.some(fIdx => {
                                            const c = team[fIdx];
                                            return c && c.hp > 0 && c.statuses && c.statuses.some(s => s.type === 'Scudo Team');
                                        });

                                        return (
                                                <div key={p} className="flex flex-col items-center gap-1.5 relative">
                                                        {hasScudoTeam && (
                                                            <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-xl scale-150 animate-pulse z-0"></div>
                                                        )}
                                                        <div className={`flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-full border ${gameState.gameMode === 'battleroyale' ? PLAYER_THEMES[p].border : 'border-slate-700/50'} backdrop-blur-md relative z-10`}>
                                                                {hasScudoTeam && <Shield size={20} className="text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,1)]" />}
                                                                <img src={gameState.playerAvatars[p] || getDefaultAvatar(gameState.players[p])} onError={(e) => { e.target.onerror = null; e.target.src = getDefaultAvatar(gameState.players[p]); }} className={`w-8 h-8 rounded-full border-2 ${gameState.gameMode === 'battleroyale' ? PLAYER_THEMES[p].border : (isTop ? 'border-rose-400' : 'border-cyan-400')} object-cover bg-slate-950`} style={{ filter: (gameState.isCampaignBattle && gameState.isBot[p]) ? 'sepia(0.6) hue-rotate(250deg) saturate(3) brightness(0.7) contrast(1.3)' : 'none' }} alt="" />
                                                                <div className="flex flex-col min-w-0">
                                                                  <span className={`font-bold text-sm uppercase tracking-widest ${gameState.gameMode === 'battleroyale' ? PLAYER_THEMES[p].text : (isTop ? 'text-rose-300' : 'text-cyan-300')}`}>{gameState.players[p]}</span>
                                                                  {gameState.playerTitles?.[p] && <span className="text-[10px] font-semibold text-amber-300 truncate max-w-[170px]">✦ {gameState.playerTitles[p]}</span>}
                                                                </div>
                                                        </div>
                                                        {/* INDICATORE PERSONAGGI VIVI/MORTI / RIVELATI */}
                                                        <div className="flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-full border border-slate-700/50 backdrop-blur-sm relative z-10 min-h-[28px]">
                                                                {team.filter(c => !c.isSummonOnly).map((c, i) => {
                                                                        const isDead = c.hp <= 0;
                                                                        const isRevealed = c.revealed;
                                                                        
                                                                        const cBorderClass = gameState.gameMode === 'battleroyale' ? (PLAYER_THEMES[p]?.border || 'border-slate-500') : (isTop ? 'border-rose-500' : 'border-cyan-500');
                                                                        const cShadowClass = gameState.gameMode === 'battleroyale' ? (PLAYER_THEMES[p]?.shadow || '') : (isTop ? 'shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'shadow-[0_0_8px_rgba(6,182,212,0.6)]');
                                                                        const cDotBgClass = gameState.gameMode === 'battleroyale' ? (PLAYER_THEMES[p]?.text.replace('text-', 'bg-') || 'bg-slate-400') : (isTop ? 'bg-rose-500' : 'bg-cyan-500');

                                                                        if (isRevealed) {
                                                                            return (
                                                                                <div key={i} className={`w-5 h-5 rounded-full border ${isDead ? 'border-slate-600 grayscale opacity-50' : cBorderClass} overflow-hidden shrink-0`}>
                                                                                    <img src={c.img} className="w-full h-full object-cover bg-slate-900" alt="" title={c.name} />
                                                                                </div>
                                                                            );
                                                                        } else {
                                                                            return (
                                                                                <div key={i} className={`w-2.5 h-2.5 rounded-full shadow-inner border border-black/50 shrink-0 ${isDead ? 'bg-slate-700 opacity-50' : (cDotBgClass + ' ' + cShadowClass)}`}></div>
                                                                            );
                                                                        }
                                                                })}
                                                        </div>
                                                </div>
                                        );
                                })}
                        </div>
                );
        }

        return (
            <div className="min-h-screen bg-slate-900 flex flex-col font-sans text-white overflow-hidden">
                
                {/* SCREEN FLASH BIANCO PER FORMA IPER (Messo allo z-[40] per far scattare Barry in primo piano) */}
                {screenFlash && <div className="fixed inset-0 bg-white z-[40] animate-screen-flash"></div>}

                {/* EVENT PLAYBACK OVERLAY */}
                {isPlayingEvents && (
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-50 pointer-events-none flex flex-col items-center justify-center transition-all duration-300">
                        {eventPlaybackPassive && (
                            <div className="mb-4 animate-bounce-in flex flex-col items-center">
                                <span className="bg-amber-500 text-black px-4 py-1 rounded-full font-black text-lg md:text-xl uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.8)] border-2 border-white">
                                    ⚡ PASSIVA ATTIVATA ⚡
                                </span>
                                <span className="text-2xl md:text-3xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,1)] mt-2 bg-black/80 px-6 py-2 rounded-xl border border-amber-500/50 text-center">
                                    {eventPlaybackPassive.char}: <span className="text-amber-400">{eventPlaybackPassive.name}</span>
                                </span>
                            </div>
                        )}
                        <div className={`w-full py-5 border-y-4 shadow-[0_0_40px_rgba(0,0,0,0.8)] text-center transition-colors duration-300 ${eventPlaybackPassive ? 'bg-amber-950/95 border-amber-500' : 'bg-black/85 border-yellow-500/60'}`}>
                             <h2 className={`text-3xl md:text-4xl font-black italic drop-shadow-[0_3px_3px_rgba(0,0,0,1)] tracking-wider px-4 transition-colors duration-300 ${eventPlaybackPassive ? 'text-white' : 'text-yellow-400'}`}>
                                    {eventPlaybackText}
                             </h2>
                        </div>
                    </div>
                )}

                {/* BATTLE ARENA */}
                <div className="flex-1 p-4 flex flex-col relative overflow-hidden bg-slate-950">
                    
                    {!isEventBattle&&<button onClick={() => playerRole === 'spectator' ? leaveRoom() : setShowLeaveConfirm(true)} className="absolute top-4 left-4 flex items-center gap-2 text-rose-400 hover:text-white transition-colors bg-black/50 px-3 py-1.5 rounded-xl border border-rose-500/50 z-[60] shadow-lg text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
                         <LogOut size={16} /> {playerRole === 'spectator' ? 'Esci' : 'Resa'}
                    </button>}

                    {/* PULSANTE TOGGLE REGISTRO BATTAGLIA */}
                    <button onClick={() => setIsLogOpen(true)} className="absolute top-16 left-4 flex items-center gap-2 text-cyan-400 hover:text-white transition-colors bg-black/50 px-3 py-1.5 rounded-xl border border-cyan-500/50 z-[60] shadow-lg text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
                         <ScrollText size={16} /> Registro
                    </button>

                    {/* PULSANTE FORZA SKIP */}
                    {(!isEventBattle||eventBattleCanForce)&&<button onClick={handleForceSkip} className="absolute top-28 left-4 flex items-center gap-2 text-yellow-400 hover:text-white transition-colors bg-black/50 px-3 py-1.5 rounded-xl border border-yellow-500/50 z-[60] shadow-lg text-xs font-bold uppercase tracking-widest backdrop-blur-sm" title="Usa questo tasto se la partita si blocca o se l'host scompare!">
                         ⏩ Forza Skip
                    </button>}

                    {/* SIDEBAR REGISTRO BATTAGLIA */}
                    <div className={`fixed top-0 left-0 h-full w-72 md:w-80 bg-slate-900/95 backdrop-blur-xl border-r border-cyan-500/50 z-[100] transform transition-transform duration-300 ease-in-out flex flex-col shadow-[20px_0_50px_rgba(0,0,0,0.8)] ${isLogOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-950 shrink-0">
                            <h3 className="font-black text-cyan-400 flex items-center gap-2 uppercase tracking-widest text-sm"><ScrollText size={18}/> Registro</h3>
                            <button onClick={() => setIsLogOpen(false)} className="text-slate-500 hover:text-white transition-colors"><XIcon size={24}/></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3 bg-slate-950/50">
                            {combatLog.length === 0 ? (
                                <div className="text-slate-500 italic text-sm text-center mt-4">Nessun evento ancora registrato in questo scontro.</div>
                            ) : (
                                combatLog.map((log, index) => {
                                    let styleClass = "bg-slate-800/50 border-slate-700 text-slate-300"; // Normal
                                    if (log.type === 'passive') styleClass = "bg-amber-900/30 border-amber-500/40 text-amber-200";
                                    else if (log.type === 'faint') styleClass = "bg-rose-900/30 border-rose-500/40 text-rose-200";
                                    else if (log.type === 'heal') styleClass = "bg-emerald-900/30 border-emerald-500/40 text-emerald-200";
                                    else if (log.type === 'damage') styleClass = "bg-orange-900/20 border-orange-500/30 text-orange-200";

                                    return (
                                        <div key={index} className={`text-xs md:text-sm p-2.5 rounded-lg border ${styleClass} shadow-sm font-medium leading-tight`}>
                                            {log.text}
                                        </div>
                                    );
                                })
                            )}
                            <div ref={logEndRef} />
                        </div>
                    </div>

                    {/* Top Info Bar per Torneo */}
                    {gameState.gameMode === 'torneo' && (() => {
                        let matchTitle = '';
                        const phase = gameState.tournamentPhase || 'semis';
                        const b = gameState.tournamentBracket || ['p1', 'p2', 'p3', 'p4'];
                        const res = gameState.tournamentResults || {};
                        if (phase === 'semis') {
                            if ([b[0], b[1]].includes(bottomPlayers[0])) matchTitle = 'Semifinale 1';
                            else matchTitle = 'Semifinale 2';
                        } else {
                            const fw = [res.semi1?.winner, res.semi2?.winner].filter(Boolean);
                            if (fw.includes(bottomPlayers[0])) matchTitle = 'Finalissima';
                            else matchTitle = 'Finale 3° Posto';
                        }
                        
                        const amSpectating = isSpectatorState || (!bottomPlayers.includes(playerRole) && !topPlayers.includes(playerRole));
                        
                        return (
                             <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-slate-900/80 backdrop-blur-md px-6 py-2 rounded-full border border-yellow-500/50 shadow-lg text-yellow-400 font-black tracking-widest uppercase flex flex-col items-center">
                                    <span>{matchTitle}</span>
                                    {amSpectating && <span className="text-[10px] text-slate-300 normal-case">(Spettatore - In attesa)</span>}
                             </div>
                        );
                    })()}
                    
                    {gameState.gameMode === 'battleroyale' && (
                         <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-slate-900/80 backdrop-blur-md px-6 py-2 rounded-full border border-amber-500/50 shadow-lg text-amber-400 font-black tracking-widest uppercase text-xs sm:text-sm">
                                BATTLE ROYALE
                         </div>
                    )}

                    {/* --- AGGIUNTO INDICATORE ROUND SOPRAVVIVENZA --- */}
                    {gameState.gameMode === 'survival' && (
                         <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-slate-900/80 backdrop-blur-md px-6 py-2 rounded-full border border-violet-500/50 shadow-lg text-violet-400 font-black tracking-widest uppercase text-xs sm:text-sm">
                                ROUND {gameState.survivalRound || 1}
                         </div>
                    )}
                    {/* ------------------------------------------------ */}
                    
                    {/* Meteo condiviso: mostra i turni rimanenti a entrambi i giocatori. */}
                    {gameState.battleWeather?.type === 'snowstorm' && (
                        <div className="absolute z-[44] top-[7.5rem] left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl
                            border border-cyan-200/60 bg-sky-950/90 text-cyan-100 text-[11px] sm:text-sm font-black
                            drop-shadow-[0_0_15px_rgba(56,189,248,0.4)] text-center pointer-events-none">
                            ❄️ TEMPESTA DI NEVE · {gameState.battleWeather.turns} turni
                            <span className="block text-[9px] text-cyan-200/70 font-semibold">Ghiaccio / Roccia / Robot immuni</span>
                        </div>
                    )}

                    {Object.values(gameState.fieldTraps||{}).some(Boolean)&&(
                        <div className="absolute z-[42] top-[11rem] left-1/2 -translate-x-1/2 max-w-[90vw] rounded-xl border border-fuchsia-400/60 bg-fuchsia-950/85 px-3 py-1.5 text-center text-fuchsia-200 text-[10px] font-black shadow-xl pointer-events-none">
                            🪤 TRAPPOLA SEGRETA SUL CAMPO · -10% PS AI NUOVI ARRIVI
                        </div>
                    )}
                    {/* --- TIMER DI BATTAGLIA 90 SECONDI --- */}
                    {gameState.status === 'battling' && !isPlayingEvents && !isSpectator && (
                        <div className={`absolute top-16 left-1/2 -translate-x-1/2 z-[45] bg-slate-900/90 backdrop-blur-md px-5 py-1.5 rounded-full border shadow-[0_0_15px_rgba(0,0,0,0.6)] font-black tracking-widest flex items-center gap-2 transition-colors ${timeLeft <= 15 ? 'border-rose-500 text-rose-500 animate-pulse scale-110' : 'border-cyan-500/50 text-cyan-400'}`}>
                            ⏱️ {timeLeft}s
                        </div>
                    )}
                    {/* ----------------------------------- */}

                    {/* --- BARRA DELL'INIZIATIVA (ATB) VERTICALE DESTRA --- */}
                    <div className="absolute top-1/2 right-4 -translate-y-1/2 z-30 flex flex-col items-center gap-1 md:gap-2 bg-slate-900/90 backdrop-blur-md px-1.5 md:px-2 py-3 md:py-4 rounded-full border border-slate-700/50 shadow-[0_0_20px_rgba(0,0,0,0.6)] max-h-[80vh] overflow-y-auto custom-scrollbar" title="L'ordine di attacco stimato. Le mosse con priorità alta (es. Protezione) agiranno comunque per prime!">
                        <div className="flex flex-col items-center gap-1 shrink-0 mb-1 md:mb-2">
                            <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest" style={{ writingMode: 'vertical-rl' }}>Turni</span>
                        </div>
                        {getInitiativeOrder().map((item, idx, arr) => (
                            <div key={`${item.player}-${item.char.id}-${idx}`} className="flex flex-col items-center shrink-0">
                                <div className="relative">
                                    <img src={item.char.img} className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-2 ${PLAYER_THEMES[item.player]?.border || 'border-slate-500'} object-cover shadow-sm`} title={`${item.char.name} (Velocità: ${item.effSpd})`} />
                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-black ${PLAYER_THEMES[item.player]?.bg.split('/')[0] || 'bg-slate-500'} flex items-center justify-center text-[8px] font-black text-white`}>
                                        {item.player.replace('p', '')}
                                    </div>
                                </div>
                                {idx < arr.length - 1 && <ChevronRight size={14} className="text-slate-600 my-0.5 md:my-1 rotate-90" />}
                            </div>
                        ))}
                    </div>

                    {gameState.gameMode === 'battleroyale' ? (
                        /* BATTLE ROYALE LAYOUT: Grid or Flex around center */
                        <div className="flex-1 flex flex-wrap justify-center items-center gap-6 p-4 pt-12 overflow-y-auto custom-scrollbar pb-32">
                            {activeMatchPlayers.map(p => {
                                const currentFieldForPlayer = isPlayingEvents ? (displayField[p] || []) : (gameState.field[p] || []);
                                const isEliminated = gameState.teams[p].every(c => c.hp <= 0);
                                if (isEliminated && currentFieldForPlayer.length === 0) return null;
                                
                                const theme = PLAYER_THEMES[p] || PLAYER_THEMES.p1;
                                
                                return (
                                    <div key={p} className={`flex flex-col items-center ${theme.bg} p-4 rounded-3xl border-2 ${theme.border} ${theme.shadow} backdrop-blur-sm`}>
                                        {renderPlayerBanners([p], false)}
                                        <div className="flex justify-center gap-4 flex-wrap mt-4">
                                            {currentFieldForPlayer.map((charIdx, fIdx) => renderFieldCharacter(p, fIdx, charIdx, p !== playerRole))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* CLASSIC LAYOUT (TOP vs BOTTOM) */
                        <>
                            {/* Opponent Side (TOP) */}
                            <div className="h-1/2 flex flex-col items-center justify-start pt-6 relative bg-gradient-to-b from-rose-900/60 via-red-900/20 to-transparent rounded-b-3xl">
                                {renderPlayerBanners(topPlayers, true)}
                                <div className="flex justify-center gap-6 flex-wrap relative w-full h-full mt-2">
                                        {topPlayers.map(p => currentField[p]?.map((charIdx, fIdx) => renderFieldCharacter(p, fIdx, charIdx, true)))}
                                </div>
                            </div>

                            <div className="absolute inset-x-0 top-1/2 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent z-10"></div>

                            {/* Player Side (BOTTOM) */}
                            <div className="h-1/2 flex flex-col items-center justify-end pb-24 relative bg-gradient-to-t from-blue-900/60 via-cyan-900/20 to-transparent rounded-t-3xl">
                                <div className="flex justify-center gap-6 flex-wrap relative w-full h-full items-end mb-2">
                                        {bottomPlayers.map(p => currentField[p]?.map((charIdx, fIdx) => renderFieldCharacter(p, fIdx, charIdx, false)))}
                                </div>
                                {renderPlayerBanners(bottomPlayers, false)}
                            </div>
                        </>
                    )}

                    {/* MODIFICATO: Action Menu ora fisso a fondo schermo per supportare layout multipli come il Torneo */}
                    <div className="fixed bottom-4 inset-x-0 w-[95%] md:w-full flex flex-col items-center justify-center max-w-2xl mx-auto relative min-h-[80px] z-50 bg-slate-950/80 backdrop-blur-md rounded-2xl py-3 px-4 shadow-[0_0_30px_black] border border-slate-700/50">
                         
                         {(!isPlayingEvents && isMyTurn && activeCommandChar && targetingMoveIdx === null) && (
                                 <div className="flex gap-3 justify-center mb-2 z-10">
                                         <button onClick={() => setActionMenuMode('moves')} className={`px-5 py-1.5 rounded-full text-xs font-black tracking-widest uppercase transition-all ${actionMenuMode === 'moves' ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'}`}>Mosse</button>
                                         {!isEventBattle&&<button onClick={() => setActionMenuMode('items')} className={`px-5 py-1.5 rounded-full text-xs font-black tracking-widest uppercase transition-all ${actionMenuMode === 'items' ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'}`}>Zaino</button>}
                                         {!activeCommandChar.isSummonOnly && (
                                            <button onClick={() => setActionMenuMode('switch')} className={`px-5 py-1.5 rounded-full text-xs font-black tracking-widest uppercase transition-all ${actionMenuMode === 'switch' ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'}`}>Cambia (Squadra)</button>
                                         )}
                                 </div>
                         )}

                         {/* TOOLTIP DINAMICO MOVES */}
                         {hoveredMove ? (
                                <div className="animate-fade-in text-left bg-slate-900/95 p-3 rounded-xl border border-cyan-500/50 w-full shadow-lg relative z-50">
                                        <div className="flex justify-between items-end mb-1">
                                                <span className="font-bold text-cyan-300 text-lg">{hoveredMove.name}</span>
                                                <span className="text-xs text-slate-400 font-mono font-bold">
                                                        {hoveredMove.power > 0 ? `Potenza: ${hoveredMove.power} | ` : ''}
                                                        {hoveredMove.accuracy ? `Prec: ${hoveredMove.accuracy * 100}% | ` : ''}
                                                        {hoveredMove.cooldown !== undefined ? `Ricarica: ${hoveredMove.cooldown} turni | ` : ''}
                                                        {hoveredMove.requiredStatus ? `Richiede: ${hoveredMove.requiredStatus} | ` : ''}
                                                        {hoveredMove.remainingUses !== undefined && hoveredMove.remainingUses !== null ? `Usi: ${hoveredMove.remainingUses}/${hoveredMove.maxUses}` : ''}
                                                </span>
                                        </div>
                                        <p className="text-sm text-slate-300 leading-tight">{hoveredMove.desc}</p>
                                </div>
                         ) : (
                                <h3 className="text-xl text-blue-300 font-bold text-center min-h-[44px] flex items-center justify-center">
                                    {!isPlayingEvents && isMyTurn && activeCommandChar && (
                                        targetingMoveIdx === null 
                                            ? (actionMenuMode === 'moves' ? `Cosa deve fare ${activeCommandChar.name}?` : (actionMenuMode === 'items' ? 'Seleziona un oggetto da usare' : 'Seleziona un compagno da mandare in campo'))
                                            : (activeCommandChar.moves[targetingMoveIdx].targetMode === 'revive'
                                                ? `Chi vuoi rianimare con ${activeCommandChar.moves[targetingMoveIdx].name}?`
                                                : (activeCommandChar.moves[targetingMoveIdx].targetCount && activeCommandChar.moves[targetingMoveIdx].targetCount > 1 && activeCommandChar.moves[targetingMoveIdx].targetCount < 4
                                                    ? `Seleziona i bersagli per ${activeCommandChar.moves[targetingMoveIdx].name}! (${selectedMultiTargets.length}/${activeCommandChar.moves[targetingMoveIdx].targetCount})`
                                                    : `Seleziona il bersaglio per ${activeCommandChar.moves[targetingMoveIdx].name}!`))
                                    )}
                                </h3>
                         )}
                    </div>

                    <div className="w-full flex-1 flex items-start justify-center overflow-y-auto custom-scrollbar">
                        
                        {isSpectator ? (
                                <div className="bg-slate-900/80 p-6 rounded-2xl border border-yellow-500/30 flex flex-col items-center justify-center gap-4 mt-8 shadow-lg w-full max-w-xl mx-auto">
                                    <div className="text-2xl text-yellow-400 font-black tracking-widest flex items-center gap-3">
                                        <Trophy size={28} /> MODALITÀ SPETTATORE
                                    </div>
                                    <p className="text-slate-300 font-medium text-center text-lg">
                                        Scontro in corso tra <br/><span className="font-black text-white text-2xl">{gameState.players[topPlayers[0]]}</span> e <span className="font-black text-white text-2xl">{gameState.players[bottomPlayers[0]]}</span>
                                    </p>
                                    <div className="flex gap-2 items-center mt-2 bg-black/40 px-4 py-2 rounded-lg">
                                        <Loader2 className="animate-spin text-slate-500" size={20} />
                                        <span className="text-slate-400 text-sm font-bold">In attesa che i giocatori scelgano le mosse...</span>
                                    </div>
                                </div>
                        ) : (!isPlayingEvents && isMyTurn && activeCommandChar) ? (
                            <div className="w-full max-w-2xl">
                                {targetingMoveIdx === null ? (
                                    <>
                                        {actionMenuMode === 'moves' && (
                                            <div className="grid grid-cols-2 gap-4">
                                                {/* --- PULSANTE FORMA IPER --- */}
                                                {(!gameState.hyperUsed[playerRole] && !activeCommandChar.isHyper && (activeCommandChar.id === 'barry' || activeCommandChar.id === 'gardevoir' || activeCommandChar.id === 'astral' || activeCommandChar.id === 'polterpup' || activeCommandChar.id === 'spongebob' || activeCommandChar.id === 'patrick' || activeCommandChar.id === 'alphonse' || activeCommandChar.id === 'ariana' || activeCommandChar.id === 'bloom' || activeCommandChar.id === 'gaston' || activeCommandChar.id === 'jake' || activeCommandChar.id === 'marceline' || activeCommandChar.id === 'finn' || activeCommandChar.id === 'natsu' || activeCommandChar.id === 'juvia' || activeCommandChar.id === 'laxus' || activeCommandChar.id === 'bumblebee' || activeCommandChar.id === 'corvina' || activeCommandChar.id === 'entoma' || activeCommandChar.id === 'garnet' || activeCommandChar.id === 'darwin' || activeCommandChar.id === 'brago' || activeCommandChar.id === 'iris' || activeCommandChar.id === 'sdentato' || activeCommandChar.id === 'ladybug' || activeCommandChar.id === 'bowser' || activeCommandChar.id === 'rainbowdash' || activeCommandChar.id === 'elsa' || activeCommandChar.id === 'sheldon' || activeCommandChar.id === 'charizard' || activeCommandChar.id === 'maxcaulfield' || activeCommandChar.id === 'chloeprice' || activeCommandChar.id === 'dolli' || activeCommandChar.id === 'zatchbell' || activeCommandChar.id === 'yoshi' || activeCommandChar.id === 'poisonivy' || activeCommandChar.id === 'carlos' || activeCommandChar.id === 'leon' || activeCommandChar.id === 'sage')) && (() => {
                                                    let hyperTypeText = "";
                                                    const hyperTypesMap = {
                                                        'gardevoir': 'Psico-Erba',
                                                        'astral': 'Oscuro',
                                                        'spongebob': 'Acqua-Lotta',
                                                        'ariana': 'Suono-Oscuro',
                                                        'jake': 'Magico-Buio',
                                                        'finn': 'Elettro-Fuoco',
                                                        'juvia': 'Acqua-Buio',
                                                        'corvina': 'Magico',
                                                        'darwin': 'Acqua-Oscuro',
                                                        'brago': 'Oscuro-Psico',
                                                        'sdentato': 'Drago-Elettro',
                                                        'sheldon': 'Drago-Roccia',
                                                        'charizard': 'Roccia-Aria',
                                                        'maxcaulfield': 'Insetto-Aria',
                                                        'chloeprice': 'Suono-Luce',
                                                        'dolli': 'Spettro-Acqua',
                                                        'poisonivy': 'Veleno-Fuoco',
                                                        'carlos': 'Fuoco-Lotta',
                                                        'leon': 'Fuoco-Normale',
                                                        'sage': 'Cristallo-Magico'
                                                    };
                                                    if (hyperTypesMap[activeCommandChar.id]) {
                                                        hyperTypeText = ` [${hyperTypesMap[activeCommandChar.id].toUpperCase()}]`;
                                                    }
                                                    
                                                    return (
                                                        <div className="col-span-2 mb-1">
                                                            <button
                                                                onClick={() => setPendingHyper(!pendingHyper)}
                                                                className={`w-full py-3 rounded-xl font-black uppercase tracking-widest transition-all shadow-md ${pendingHyper ? 'bg-gradient-to-r from-yellow-300 to-yellow-500 text-black shadow-[0_0_25px_rgba(250,204,21,0.8)] scale-[1.02]' : 'bg-slate-800 text-yellow-400 border border-yellow-500/50 hover:bg-yellow-900/30'}`}
                                                            >
                                                                {pendingHyper ? '✨ FORMA IPER SELEZIONATA! Scegli una mossa! ✨' : `⚡ ATTIVA FORMA IPER${hyperTypeText} (1 Uso) ⚡`}
                                                            </button>
                                                        </div>
                                                    );
                                                })()}
                                                {/* --------------------------- */}
                                                {activeCommandChar.moves.map((move, idx) => {
                                                    let isDisabled = move.remainingUses === 0 || (move.currentCooldown && move.currentCooldown > 0);
                                                    if (move.requireSummonsDead && !isDisabled) {
                                                        if (gameState.teams[playerRole].some(c => move.requireSummonsDead.includes(c.id) && c.hp > 0)) {
                                                            isDisabled = true;
                                                        }
                                                    }
                                                    if (move.requiredStatus && !isDisabled) {
                                                        if (!activeCommandChar.statuses.some(s => s.type === move.requiredStatus)) {
                                                            isDisabled = true;
                                                        }
                                                    }
                                                    if (move.isCombo && !isDisabled) {
                                                        const myFieldChars = gameState.field[playerRole].map(cIdx => gameState.teams[playerRole][cIdx]).filter(c => c.hp > 0);
                                                        const myFieldIds = myFieldChars.map(c => c.id);
                                                        if (!move.isCombo.every(id => myFieldIds.includes(id))) {
                                                            isDisabled = true;
                                                        }
                                                    }
                                                    if (move.stealMove && !isDisabled) {
                                                        if (activeCommandChar.moves.some(m => m.isStolen)) {
                                                            isDisabled = true;
                                                        }
                                                    }
                                                    return (
                                                        <button
                                                            key={idx}
                                                            disabled={isDisabled}
                                                            onMouseEnter={() => setHoveredMove(move)}
                                                            onMouseLeave={() => { setHoveredMove(null); isLongPressRef.current = false; }}
                                                            onTouchStart={() => {
                                                                    isLongPressRef.current = false;
                                                                    pressTimerRef.current = setTimeout(() => {
                                                                            isLongPressRef.current = true;
                                                                            setHoveredMove(move);
                                                                    }, 400); 
                                                            }}
                                                            onTouchEnd={(e) => {
                                                                    clearTimeout(pressTimerRef.current);
                                                                    if (isLongPressRef.current) {
                                                                            setHoveredMove(null);
                                                                    }
                                                            }}
                                                            onTouchMove={() => {
                                                                    clearTimeout(pressTimerRef.current);
                                                                    setHoveredMove(null);
                                                            }}
                                                            onClick={(e) => {
                                                                    if (isLongPressRef.current) {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            return; 
                                                                    }
                                                                    
                                                                    if (move.target === 'self' || move.isSummon || move.targetMode === 'team_smart_heal' || move.targetMode === 'team') {
                                                                            commitAction({
                                                                                    type: 'attack',
                                                                                    moveIdx: idx,
                                                                                    targetPlayer: playerRole,
                                                                                    targetIdx: gameState.field[playerRole][commandingIdx]
                                                                            });
                                                                    } else if (move.targetCount && move.targetCount >= 4) {
                                                                            // Bypass mira per le mosse ad area totale (tutti i nemici)
                                                                            const activeMatchPlayers = getActivePlayers();
                                                                            let enemyTeams = [];
                                                                            if (gameState.gameMode === 'multipla') {
                                                                                enemyTeams = ['p1', 'p2'].includes(playerRole) ? ['p3', 'p4'] : ['p1', 'p2'];
                                                                            } else if (gameState.gameMode === 'juggernaut' || gameState.gameMode === 'survival') {
                                                                                const juggPlayer = gameState.settings.juggernautPlayer || (gameState.gameMode === 'survival' ? 'p2' : 'p1');
                                                                                enemyTeams = playerRole === juggPlayer ? activeMatchPlayers.filter(p => p !== juggPlayer) : [juggPlayer];
                                                                            } else if (gameState.gameMode === 'torneo') {
                                                                                enemyTeams = getTournamentMatchOpponents(playerRole);
                                                                            } else if (gameState.gameMode === 'torneo_punti') {
                                                                                enemyTeams = [activeMatchPlayers.find(p => p !== playerRole)];
                                                                            } else if (gameState.gameMode === 'battleroyale') {
                                                                                enemyTeams = activeMatchPlayers.filter(p => p !== playerRole);
                                                                            } else {
                                                                                enemyTeams = [playerRole === 'p1' ? 'p2' : 'p1'];
                                                                            }
                                                        
                                                                            let tPlayer = null;
                                                                            let tIdx = null;
                                                                            let tFieldIdx = null;
                                                        
                                                                            // Trova il primo nemico valido come bersaglio "ancora" (il motore poi colpirà tutti gli altri)
                                                                            for (let ep of enemyTeams) {
                                                                                if (ep && gameState.field[ep]) {
                                                                                    const aliveIdx = gameState.field[ep].findIndex(cIdx => gameState.teams[ep][cIdx].hp > 0);
                                                                                    if (aliveIdx !== -1) {
                                                                                        tPlayer = ep;
                                                                                        tIdx = gameState.field[ep][aliveIdx];
                                                                                        tFieldIdx = aliveIdx;
                                                                                        break;
                                                                                    }
                                                                                }
                                                                            }
                                                        
                                                                            commitAction({
                                                                                type: 'attack',
                                                                                moveIdx: idx,
                                                                                targetPlayer: tPlayer || (enemyTeams[0] || 'p2'),
                                                                                targetIdx: tIdx !== null ? tIdx : 0,
                                                                                targetFieldIdx: tFieldIdx !== null ? tFieldIdx : 0
                                                                            });
                                                                    } else {
                                                                            setTargetingMoveIdx(idx);
                                                                    }
                                                            }} 
                                                            className={`select-none bg-slate-800/80 backdrop-blur-md border border-slate-600 rounded-xl p-4 flex justify-between items-center transition-all duration-300 ${isDisabled ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:bg-slate-700 hover:-translate-y-1 hover:shadow-lg'}`}
                                                    >
                                                            <div className="flex flex-col items-start pointer-events-none">
                                                                    <span className="font-bold text-lg drop-shadow-sm">{move.name}</span>
                                                                    {move.currentCooldown > 0 ? (
                                                                        <span className="text-[10px] text-rose-400 font-bold mt-1">In ricarica ({move.currentCooldown})</span>
                                                                    ) : (
                                                                        move.maxUses !== undefined && <span className="text-[10px] text-slate-400 font-bold mt-1">Usi: {move.remainingUses}/{move.maxUses}</span>
                                                                    )}
                                                        </div>
                                                        <div className="flex flex-col items-end pointer-events-none">
                                                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${TYPE_STYLES[move.type] || 'bg-gray-500'}`}>{move.type}</span>
                                                             <span className="text-xs text-gray-400 mt-1 font-mono">{move.power > 0 ? `Potenza: ${move.power}` : (move.heal || move.healFlat || move.targetMode === 'team_smart_heal' || move.selfHeal || move.targetMode === 'team' || move.healLastTurnDamage ? 'Cura' : (move.isProtect ? 'Difesa' : ((move.isSummon || move.randomSummon) ? 'Evoca' : 'Stato')))}</span>
                                                        </div>
                                                </button>
                                            );
                                        })}
                                            </div>
                                        )}

                                        {actionMenuMode === 'items' && (() => {
                                            const myInventory = gameState.inventory?.[playerRole] || {};
                                            const itemsToRender = Object.keys(myInventory).filter(itemId => myInventory[itemId] > 0 && ITEMS_DB[itemId] && ITEMS_DB[itemId].type !== 'held');
                                            
                                            if (itemsToRender.length === 0) {
                                                return <div className="flex justify-center items-center h-full pt-4 text-slate-400 font-bold">Il tuo zaino è vuoto! Fai acquisti nel Negozio.</div>;
                                            }

                                            return (
                                                <div className="grid grid-cols-2 gap-4">
                                                    {itemsToRender.map(itemId => {
                                                        const itemDef = ITEMS_DB[itemId];
                                                        const qty = myInventory[itemId];
                                                        
                                                        // Se è un revit, abilita solo se ci sono morti in tutta la squadra
                                                        let isUsable = true;
                                                        if (itemDef.type === 'revive') {
                                                            let myTeamPlayers = [playerRole];
                                                            if (gameState.gameMode === 'multipla') {
                                                                myTeamPlayers = ['p1', 'p2'].includes(playerRole) ? ['p1', 'p2'] : ['p3', 'p4'];
                                                            } else if (gameState.gameMode === 'juggernaut' || gameState.gameMode === 'survival') {
                                                                const juggPlayer = gameState.settings.juggernautPlayer || (gameState.gameMode === 'survival' ? 'p2' : 'p1');
                                                                if (playerRole !== juggPlayer) {
                                                                    const activeMatchPlayers = getActivePlayers();
                                                                    myTeamPlayers = activeMatchPlayers.filter(p => p !== juggPlayer);
                                                                }
                                                            } else if (gameState.gameMode === 'torneo') {
                                                                myTeamPlayers = [playerRole]; // Nel torneo 1v1 ressi te stesso
                                                            }
                                                            
                                                            let hasDead = false;
                                                            myTeamPlayers.forEach(p => {
                                                                if (gameState.teams[p] && gameState.teams[p].some(c => c.hp <= 0 && !c.isSummonOnly)) {
                                                                    hasDead = true;
                                                                }
                                                            });
                                                            if (!hasDead) isUsable = false;
                                                        } else {
                                                            // Altri oggetti si usano sul pg in campo. Se è morto non può usarli.
                                                            if (activeCommandChar.hp <= 0) isUsable = false;
                                                        }

                                                        return (
                                                            <button key={itemId} disabled={!isUsable} onClick={() => {
                                                                commitAction({ type: 'use_item', itemId: itemId, targetIdx: activeCommandCharIdx });
                                                            }} className={`bg-amber-600/20 p-3 rounded-xl border flex items-center justify-between transition-all text-left ${!isUsable ? 'opacity-50 grayscale border-slate-600 cursor-not-allowed' : 'border-amber-500/50 hover:bg-amber-500/30 hover:border-amber-400 hover:scale-[1.02] shadow-md'}`}>
                                                                <div>
                                                                    <div className="font-bold text-amber-400 text-lg flex items-center gap-2">
                                                                        <span className="text-2xl">{itemDef.icon}</span> {itemDef.name}
                                                                    </div>
                                                                    <div className="text-[10px] text-amber-200/80 leading-tight mt-1 pr-2">{itemDef.desc}</div>
                                                                </div>
                                                                <div className="text-sm font-black bg-black/60 px-3 py-1 rounded-full text-white shrink-0 shadow-inner">
                                                                    x{qty}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })()}

                                        {actionMenuMode === 'switch' && (() => {
                                            const benchedChars = gameState.teams[playerRole].map((c, i) => ({...c, originalIdx: i})).filter((c, i) => !gameState.field[playerRole].includes(i) && c.hp > 0 && !c.isSummonOnly);
                                            return (
                                                <div className="grid grid-cols-2 gap-4">
                                                    {benchedChars.length === 0 ? <div className="col-span-2 text-center text-slate-400 font-bold mt-4">Nessun compagno disponibile per il cambio.</div> : null}
                                                    {benchedChars.map(char => (
                                                        <button key={char.originalIdx} onClick={() => {
                                                            commitAction({ type: 'switch', fromIdx: activeCommandCharIdx, toIdx: char.originalIdx });
                                                        }} className="bg-slate-800/80 p-3 rounded-xl border border-emerald-500/50 flex items-center gap-3 hover:bg-slate-700 hover:border-emerald-400 transition-all shadow-md group">
                                                            <img src={char.img} className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500/30 group-hover:border-emerald-400 shrink-0" />
                                                            <div className="text-left flex-1 min-w-0">
                                                                <div className="font-bold text-sm truncate text-white mb-1">{char.name}</div>
                                                                <div className="flex gap-1 mb-1.5 flex-wrap">
                                                                     {char.types.map(t => <span key={t} className={`text-[8px] font-black px-1 py-0.5 rounded uppercase ${TYPE_STYLES[t] || 'bg-gray-500'}`}>{t.substring(0,3)}</span>)}
                                                                </div>
                                                                {renderHealthBar(char.hp, char.maxHp)}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            );
                                        })()}
                                    </>
                                ) : (
                                    <div className="w-full">
                                        {activeCommandChar.moves[targetingMoveIdx].targetMode === 'revive' && (() => {
                                            let myTeamPlayers = [playerRole];
                                            if (gameState.gameMode === 'multipla') {
                                                myTeamPlayers = ['p1', 'p2'].includes(playerRole) ? ['p1', 'p2'] : ['p3', 'p4'];
                                            } else if (gameState.gameMode === 'juggernaut' || gameState.gameMode === 'survival') {
                                                const juggPlayer = gameState.settings.juggernautPlayer || (gameState.gameMode === 'survival' ? 'p2' : 'p1');
                                                if (playerRole !== juggPlayer) {
                                                    const activeMatchPlayers = getActivePlayers();
                                                    myTeamPlayers = activeMatchPlayers.filter(p => p !== juggPlayer);
                                                }
                                            } else if (gameState.gameMode === 'torneo') {
                                                myTeamPlayers = [playerRole];
                                            }

                                            let deadAllies = [];
                                            myTeamPlayers.forEach(p => {
                                                if (gameState.teams[p]) {
                                                    gameState.teams[p].forEach((char, i) => {
                                                        if (char.hp <= 0 && !char.isSummonOnly) {
                                                            deadAllies.push({ player: p, idx: i, char: char });
                                                        }
                                                    });
                                                }
                                            });

                                            return (
                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    {deadAllies.map((target, keyIdx) => (
                                                        <button key={keyIdx} onClick={() => {
                                                            commitAction({
                                                                type: 'attack',
                                                                moveIdx: targetingMoveIdx,
                                                                targetPlayer: target.player,
                                                                targetIdx: target.idx
                                                            });
                                                        }} className="bg-slate-800/80 p-3 rounded-xl border border-amber-500/50 flex items-center gap-3 hover:bg-slate-700 hover:border-amber-400 transition-all shadow-md group text-left">
                                                            <img src={target.char.img} className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-amber-500/30 group-hover:border-amber-400 shrink-0 grayscale" />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-bold text-sm truncate text-white mb-1">{target.char.name} {target.player !== playerRole ? `(${gameState.players[target.player]})` : ''}</div>
                                                                <div className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">Esausto</div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                    {deadAllies.length === 0 && (
                                                        <div className="col-span-2 text-center text-slate-400 font-bold py-4">Nessun alleato da rianimare!</div>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                        <button onClick={() => { setTargetingMoveIdx(null); setSelectedMultiTargets([]); setPendingHyper(false); }} className="mt-4 bg-slate-700 hover:bg-slate-600 px-6 py-2 rounded-lg font-bold w-full mx-auto block max-w-xs transition-colors shadow-md">
                                             Annulla Selezione
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (!isPlayingEvents && !isMyTurn) && (
                            <div className="text-2xl text-gray-500 animate-pulse font-bold flex items-center gap-3 mt-4">
                                 <Loader2 className="animate-spin" /> In attesa degli altri giocatori...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}
