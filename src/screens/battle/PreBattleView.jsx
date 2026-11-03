// Schermata estratta senza alterare la struttura JSX originale.
export function renderPreBattleView(ctx) {
const { PLAYER_THEMES, gameState, getActivePlayers, getDefaultAvatar, introCharIdx, playerRole } = ctx;
if (gameState.status === 'pre_battle') {
        const activeMatchPlayers = getActivePlayers();

        // Nella spedizione Co-op p1/p2/p3 sono alleati: il solo avversario è p4.
        // La schermata generica 1vs1 mostrava erroneamente i primi due compagni come rivali.
        if (gameState.isRoguelikeCoop) {
            const bossPlayer = gameState.settings?.juggernautPlayer || 'p4';
            const allyPlayers = ['p1', 'p2', 'p3'].filter(p =>
                p !== bossPlayer && Boolean(gameState.players?.[p]) && !gameState.isBot?.[p]
            );
            const floor = gameState.coopRun?.floor || 1;
            const bossName = gameState.players?.[bossPlayer] || 'Guardiano del Piano';
            const bossAvatar = gameState.playerAvatars?.[bossPlayer] || getDefaultAvatar(bossName);
            const bossFighter = (gameState.teams?.[bossPlayer] || []).find(c => c && !c.isSummonOnly);

            return (
                <div className="min-h-screen bg-slate-950 text-white relative flex flex-col items-center justify-center overflow-y-auto p-4 sm:p-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/50 via-slate-950 to-rose-950/50 pointer-events-none" />
                    <div className="relative z-10 w-full max-w-6xl flex flex-col items-center gap-5 sm:gap-8">
                        <div className="text-center">
                            <p className="text-cyan-300 font-black uppercase tracking-[0.3em] text-xs sm:text-sm mb-2">Spedizione Co-op</p>
                            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">Piano {floor}</h1>
                            <p className="mt-2 text-slate-400 text-sm sm:text-base">Combattete insieme contro il Guardiano del Piano</p>
                        </div>

                        <div className="w-full flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:gap-5">
                            <section className="flex-1 min-w-0 rounded-3xl border border-cyan-500/40 bg-cyan-950/20 p-4 sm:p-6 shadow-[0_0_35px_rgba(8,145,178,0.15)]">
                                <h2 className="text-center uppercase tracking-widest text-cyan-300 font-black mb-5">La vostra squadra</h2>
                                <div className="flex flex-wrap items-start justify-center gap-3 sm:gap-5">
                                    {allyPlayers.map((p, i) => {
                                        const name = gameState.players[p];
                                        const avatar = gameState.playerAvatars?.[p] || getDefaultAvatar(name);
                                        const fighter = (gameState.teams?.[p] || []).find(c => c && !c.isSummonOnly);
                                        return (
                                            <div key={p} className={introCharIdx >= 1 ? "flex flex-col items-center w-28 sm:w-36 transition-all duration-500 opacity-100 scale-100" : "flex flex-col items-center w-28 sm:w-36 transition-all duration-500 opacity-0 scale-75"}>
                                                <img src={avatar} alt={name} onError={(e) => { e.target.onerror = null; e.target.src = getDefaultAvatar(name); }} className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-cyan-400 object-cover bg-slate-900 shadow-lg" />
                                                <span className="mt-2 text-center text-sm sm:text-base font-bold text-white break-words w-full">{name}</span>
                                                {fighter && (
                                                    <div className={introCharIdx >= 2 + i ? "mt-3 flex flex-col items-center gap-1 transition-all duration-500 opacity-100 scale-100" : "mt-3 flex flex-col items-center gap-1 transition-all duration-500 opacity-0 scale-75"}>
                                                        <img src={fighter.img} alt={fighter.name} className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl border-2 border-cyan-500/70 object-cover bg-slate-950" />
                                                        <span className="text-center text-xs text-cyan-100 break-words">{fighter.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                            <div className={introCharIdx >= 1 ? "self-center z-20 shrink-0 rounded-full border-4 border-amber-400 bg-black px-5 py-2 text-3xl sm:text-5xl font-black italic text-white shadow-[0_0_30px_rgba(251,191,36,0.4)] transition-all duration-500 opacity-100 scale-100" : "self-center z-20 shrink-0 rounded-full border-4 border-amber-400 bg-black px-5 py-2 text-3xl sm:text-5xl font-black italic text-white transition-all duration-500 opacity-0 scale-75"}>
                                VS
                            </div>

                            <section className="flex-1 min-w-0 rounded-3xl border border-rose-500/40 bg-rose-950/20 p-4 sm:p-6 shadow-[0_0_35px_rgba(225,29,72,0.15)]">
                                <h2 className="text-center uppercase tracking-widest text-rose-300 font-black mb-5">Avversario del piano</h2>
                                <div className={introCharIdx >= 1 ? "flex flex-col items-center transition-all duration-500 opacity-100 scale-100" : "flex flex-col items-center transition-all duration-500 opacity-0 scale-75"}>
                                    <img src={bossAvatar} alt={bossName} onError={(e) => { e.target.onerror = null; e.target.src = getDefaultAvatar(bossName); }} className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-rose-400 object-cover bg-slate-900 shadow-lg" />
                                    <span className="mt-2 text-center text-sm sm:text-base font-bold text-white">{bossName}</span>
                                    {bossFighter && (
                                        <div className={introCharIdx >= 2 ? "mt-3 flex flex-col items-center gap-1 transition-all duration-500 opacity-100 scale-100" : "mt-3 flex flex-col items-center gap-1 transition-all duration-500 opacity-0 scale-75"}>
                                            <img src={bossFighter.img} alt={bossFighter.name} className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl border-2 border-rose-500/70 object-cover bg-slate-950" />
                                            <span className="text-center text-sm font-bold text-rose-100">{bossFighter.name}</span>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            );
        }

        if (gameState.gameMode === 'torneo') {
            const phase = gameState.tournamentPhase || 'semis';
            const b = gameState.tournamentBracket || ['p1', 'p2', 'p3', 'p4'];
            const res = gameState.tournamentResults || {};
            
            let m1Title, m2Title, m1p1, m1p2, m2p1, m2p2;
            if (phase === 'semis') {
                m1Title = "SEMIFINALE 1"; m2Title = "SEMIFINALE 2";
                m1p1 = b[0]; m1p2 = b[1]; m2p1 = b[2]; m2p2 = b[3];
            } else {
                m1Title = "FINALISSIMA"; m2Title = "FINALE 3° POSTO";
                m1p1 = res.semi1?.winner; m1p2 = res.semi2?.winner;
                m2p1 = res.semi1?.loser; m2p2 = res.semi2?.loser;
            }

            const renderMiniVS = (pA, pB, title) => {
                if (!pA || !pB) return null;
                return (
                    <div className="flex flex-col items-center flex-1 min-w-[300px]">
                        <h3 className="text-yellow-400 font-black mb-4 text-xl tracking-widest">{title}</h3>
                        <div className="flex items-center justify-center gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-700/50 backdrop-blur-md w-full">
                            <div className="flex flex-col items-center">
                                <img src={gameState.playerAvatars[pA] || getDefaultAvatar(gameState.players[pA])} className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-cyan-400 mb-2 object-cover bg-slate-950" />
                                <span className="font-bold text-base md:text-lg text-cyan-300">{gameState.players[pA]}</span>
                            </div>
                            <span className="text-3xl font-black text-white italic mx-2 md:mx-4 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]">VS</span>
                            <div className="flex flex-col items-center">
                                <img src={gameState.playerAvatars[pB] || getDefaultAvatar(gameState.players[pB])} className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-rose-400 mb-2 object-cover bg-slate-950" />
                                <span className="font-bold text-base md:text-lg text-rose-300">{gameState.players[pB]}</span>
                            </div>
                        </div>
                    </div>
                );
            };
            
            let matchToRender = null;
            if (playerRole === m1p1 || playerRole === m1p2) matchToRender = renderMiniVS(m1p1, m1p2, m1Title);
            else if (playerRole === m2p1 || playerRole === m2p2) matchToRender = renderMiniVS(m2p1, m2p2, m2Title);
            else {
                matchToRender = (
                    <>
                        {renderMiniVS(m1p1, m1p2, m1Title)}
                        {renderMiniVS(m2p1, m2p2, m2Title)}
                    </>
                );
            }

            return (
                <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 md:p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-950 to-black"></div>
                    <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-12 z-10 animate-pulse tracking-tighter drop-shadow-lg text-center">TORNEO ASSOLUTO</h2>
                    <div className="flex flex-wrap justify-center gap-8 w-full max-w-5xl z-10 transition-all duration-700 transform scale-100 opacity-100">
                        {matchToRender}
                    </div>
                </div>
            );
        }

        if (gameState.gameMode === 'battleroyale') {
            return (
                <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center relative overflow-hidden p-6">
                    <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] pointer-events-none z-30"></div>
                    <div className={`z-20 bg-black text-amber-400 px-8 py-4 rounded-full font-black text-4xl md:text-6xl italic border-4 border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.8)] [animation:pulse-vs_1s_infinite_ease-in-out] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-in-out ${introCharIdx >= 2 ? 'scale-50 opacity-0 -translate-y-48' : 'scale-100 opacity-100'}`}>
                        TUTTI VS TUTTI
                    </div>

                    <div className="w-full max-w-7xl h-full flex flex-wrap justify-center items-center gap-4 z-10">
                        {activeMatchPlayers.map((p, index) => {
                            const pName = gameState.players[p];
                            const pAvatar = gameState.playerAvatars[p] || getDefaultAvatar(pName);
                            const pTeam = gameState.teams[p] || [];
                            const theme = PLAYER_THEMES[p] || PLAYER_THEMES.p1;
                            
                            return (
                                <div key={p} className={`flex flex-col items-center justify-center p-4 rounded-3xl ${theme.bg} border border-slate-700/50 backdrop-blur-md transition-all duration-700 transform ${introCharIdx >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} style={{ width: `calc(${100 / Math.ceil(activeMatchPlayers.length / 2)}% - 1rem)`, minWidth: '250px' }}>
                                    <img src={pAvatar} onError={(e) => { e.target.onerror = null; e.target.src = getDefaultAvatar(pName); }} className={`w-16 h-16 md:w-24 md:h-24 rounded-full border-4 ${theme.border} object-cover ${theme.shadow} mb-4 bg-slate-900`} alt={pName} />
                                    <h2 className={`text-xl font-black ${theme.text} text-center drop-shadow-md mb-4 uppercase tracking-widest`}>{pName}</h2>
                                    
                                    <div className="flex justify-center flex-wrap gap-2">
                                        {pTeam.filter(c => !c.isSummonOnly).map((char, i) => (
                                            <div key={i} className={`flex flex-col items-center transition-all duration-500 ease-out transform ${introCharIdx >= 2 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-4'}`}>
                                                <img src={char.img} className={`w-10 h-10 md:w-14 md:h-14 rounded-full border-2 ${theme.border} object-cover shadow-lg mb-1`} alt={char.name}/>
                                                <span className={`text-[8px] md:text-[10px] font-bold text-white truncate w-14 text-center drop-shadow-md bg-black/60 px-1 py-0.5 rounded`}>{char.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }

        if (gameState.gameMode === 'multipla') {
            const p1Name = gameState.players.p1 || "Giocatore 1";
            const p2Name = gameState.players.p2 || "Giocatore 2";
            const p3Name = gameState.players.p3 || "Giocatore 3";
            const p4Name = gameState.players.p4 || "Giocatore 4";
            
            const p1Avatar = gameState.playerAvatars.p1 || getDefaultAvatar(p1Name);
            const p2Avatar = gameState.playerAvatars.p2 || getDefaultAvatar(p2Name);
            const p3Avatar = gameState.playerAvatars.p3 || getDefaultAvatar(p3Name);
            const p4Avatar = gameState.playerAvatars.p4 || getDefaultAvatar(p4Name);
            
            const p1Team = gameState.teams.p1 || [];
            const p2Team = gameState.teams.p2 || [];
            const p3Team = gameState.teams.p3 || [];
            const p4Team = gameState.teams.p4 || [];

            return (
                <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center relative overflow-hidden">
                    {/* Metà sinistra (Blu) - Team 1 */}
                    <div className="w-1/2 h-full absolute left-0 bg-gradient-to-br from-blue-900 to-slate-950 flex flex-col items-center justify-center p-8 [animation:slide-in-left_0.5s_ease-out]">
                        <div className={`flex flex-col items-center transition-all duration-700 ease-in-out ${introCharIdx >= 2 ? '-translate-y-16 md:-translate-y-32 scale-75' : 'translate-y-0 scale-100'}`}>
                            <div className="flex gap-4 mb-4 z-10 relative">
                                <div className="relative">
                                    <img src={p1Avatar} onError={(e) => { e.target.onerror = null; e.target.src = getDefaultAvatar(p1Name); }} className="w-20 h-20 md:w-32 md:h-32 rounded-full border-4 border-cyan-400 object-cover shadow-[0_0_50px_rgba(34,211,238,0.5)] bg-slate-900" alt="P1" />
                                </div>
                                <div className="relative">
                                    <img src={p2Avatar} onError={(e) => { e.target.onerror = null; e.target.src = getDefaultAvatar(p2Name); }} className="w-20 h-20 md:w-32 md:h-32 rounded-full border-4 border-cyan-400 object-cover shadow-[0_0_50px_rgba(34,211,238,0.5)] bg-slate-900" alt="P2" />
                                </div>
                            </div>
                            <h2 className="text-xl md:text-4xl font-black text-white text-center drop-shadow-xl">{p1Name} & {p2Name}</h2>
                        </div>

                        {/* Squadre Sinistra */}
                        <div className="absolute top-[60%] left-0 w-full px-2 md:px-8 flex justify-center flex-wrap gap-2 md:gap-4 -translate-y-1/2">
                            {[...p1Team.filter(c => !c.isSummonOnly), ...p2Team.filter(c => !c.isSummonOnly)].map((char, i) => (
                                <div key={i} className={`flex flex-col items-center transition-all duration-500 ease-out transform ${introCharIdx >= Math.floor(i/2) + 3 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-10'}`}>
                                    <img src={char.img} className="w-10 h-10 md:w-20 md:h-20 rounded-full border-2 md:border-4 border-cyan-300 object-cover shadow-[0_0_20px_rgba(34,211,238,0.4)] mb-1" alt={char.name}/>
                                    <span className="text-[7px] md:text-xs font-bold text-cyan-100 truncate w-16 md:w-24 text-center drop-shadow-md bg-slate-900/50 px-1 py-0.5 rounded-full">{char.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Metà destra (Rossa) - Team 2 */}
                    <div className="w-1/2 h-full absolute right-0 bg-gradient-to-bl from-rose-900 to-slate-950 flex flex-col items-center justify-center p-8 [animation:slide-in-right_0.5s_ease-out]">
                        <div className={`flex flex-col items-center transition-all duration-700 ease-in-out ${introCharIdx >= 2 ? '-translate-y-16 md:-translate-y-32 scale-75' : 'translate-y-0 scale-100'}`}>
                            <div className="flex gap-4 mb-4 z-10 relative">
                                <div className="relative">
                                    <img src={p3Avatar} onError={(e) => { e.target.onerror = null; e.target.src = getDefaultAvatar(p3Name); }} className="w-20 h-20 md:w-32 md:h-32 rounded-full border-4 border-rose-400 object-cover shadow-[0_0_50px_rgba(244,63,94,0.5)] bg-slate-900" alt="P3" />
                                </div>
                                <div className="relative">
                                    <img src={p4Avatar} onError={(e) => { e.target.onerror = null; e.target.src = getDefaultAvatar(p4Name); }} className="w-20 h-20 md:w-32 md:h-32 rounded-full border-4 border-rose-400 object-cover shadow-[0_0_50px_rgba(244,63,94,0.5)] bg-slate-900" alt="P4" />
                                </div>
                            </div>
                            <h2 className="text-xl md:text-4xl font-black text-white text-center drop-shadow-xl">{p3Name} & {p4Name}</h2>
                        </div>

                        {/* Squadre Destra */}
                        <div className="absolute top-[60%] left-0 w-full px-2 md:px-8 flex justify-center flex-wrap gap-2 md:gap-4 -translate-y-1/2">
                            {[...p3Team.filter(c => !c.isSummonOnly), ...p4Team.filter(c => !c.isSummonOnly)].map((char, i) => (
                                <div key={i} className={`flex flex-col items-center transition-all duration-500 ease-out transform ${introCharIdx >= Math.floor(i/2) + 3 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-10'}`}>
                                    <img src={char.img} className="w-10 h-10 md:w-20 md:h-20 rounded-full border-2 md:border-4 border-rose-300 object-cover shadow-[0_0_20px_rgba(244,63,94,0.4)] mb-1" alt={char.name}/>
                                    <span className="text-[7px] md:text-xs font-bold text-rose-100 truncate w-16 md:w-24 text-center drop-shadow-md bg-slate-900/50 px-1 py-0.5 rounded-full">{char.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className={`absolute top-0 bottom-0 left-1/2 w-2 bg-gradient-to-b from-transparent via-white to-transparent -translate-x-1/2 transform skew-x-[-15deg] z-10 transition-opacity duration-1000 ${introCharIdx >= 2 ? 'opacity-20' : 'opacity-100'}`}></div>
                    
                    <div className={`z-20 bg-black text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-black text-4xl md:text-8xl italic border-4 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.8)] [animation:pulse-vs_1s_infinite_ease-in-out] transition-all duration-700 ease-in-out ${introCharIdx >= 2 ? 'scale-50 opacity-0 -translate-y-48' : 'scale-100 opacity-100 translate-y-0'}`}>
                        VS
                    </div>

                    <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] pointer-events-none z-30"></div>
                </div>
            );
        }

        const p1Name = gameState.players[activeMatchPlayers[0]] || "Giocatore 1";
        const p2Name = gameState.players[activeMatchPlayers[1]] || "Giocatore 2";
        const p1Avatar = gameState.playerAvatars[activeMatchPlayers[0]] || getDefaultAvatar(p1Name);
        const p2Avatar = gameState.playerAvatars[activeMatchPlayers[1]] || getDefaultAvatar(p2Name);
        
        const p1Team = gameState.teams[activeMatchPlayers[0]] || [];
        const p2Team = gameState.teams[activeMatchPlayers[1]] || [];

        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center relative overflow-hidden">
                {/* Metà sinistra (Blu) */}
                <div className="w-1/2 h-full absolute left-0 bg-gradient-to-br from-blue-900 to-slate-950 flex flex-col items-center justify-center p-8 [animation:slide-in-left_0.5s_ease-out]">
                    <div className={`flex flex-col items-center transition-all duration-700 ease-in-out ${introCharIdx >= 2 ? '-translate-y-16 md:-translate-y-32 scale-75' : 'translate-y-0 scale-100'}`}>
                        <div className="relative">
                            <img src={p1Avatar} onError={(e) => { e.target.onerror = null; e.target.src = getDefaultAvatar(p1Name); }} className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-cyan-400 object-cover shadow-[0_0_50px_rgba(34,211,238,0.5)] mb-6 z-10 relative bg-slate-900" alt="P1" />
                            <div className="absolute inset-0 rounded-full border-4 border-cyan-400 blur-md opacity-50"></div>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-white text-center drop-shadow-xl">{p1Name}</h2>
                    </div>

                    {/* Squadra Sinistra */}
                    <div className="absolute top-[60%] left-0 w-full px-4 md:px-8 flex justify-center flex-wrap gap-4 md:gap-6 -translate-y-1/2">
                        {p1Team.filter(c => !c.isSummonOnly).map((char, i) => (
                            <div key={i} className={`flex flex-col items-center transition-all duration-500 ease-out transform ${introCharIdx >= i + 3 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-10'}`}>
                                <img src={char.img} className="w-16 h-16 md:w-24 md:h-24 rounded-full border-2 md:border-4 border-cyan-300 object-cover shadow-[0_0_20px_rgba(34,211,238,0.4)] mb-2" alt={char.name}/>
                                <span className="text-[10px] md:text-sm font-bold text-cyan-100 truncate w-24 text-center drop-shadow-md bg-slate-900/50 px-2 py-0.5 rounded-full">{char.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Metà destra (Rossa) */}
                <div className="w-1/2 h-full absolute right-0 bg-gradient-to-bl from-rose-900 to-slate-950 flex flex-col items-center justify-center p-8 [animation:slide-in-right_0.5s_ease-out]">
                    <div className={`flex flex-col items-center transition-all duration-700 ease-in-out ${introCharIdx >= 2 ? '-translate-y-16 md:-translate-y-32 scale-75' : 'translate-y-0 scale-100'}`}>
                        <div className="relative">
                            <img src={p2Avatar} onError={(e) => { e.target.onerror = null; e.target.src = getDefaultAvatar(p2Name); }} className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-rose-400 object-cover shadow-[0_0_50px_rgba(244,63,94,0.5)] mb-6 z-10 relative bg-slate-900" alt="P2" />
                            <div className="absolute inset-0 rounded-full border-4 border-rose-400 blur-md opacity-50"></div>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-white text-center drop-shadow-xl">{p2Name}</h2>
                    </div>

                    {/* Squadra Destra */}
                    <div className="absolute top-[60%] left-0 w-full px-4 md:px-8 flex justify-center flex-wrap gap-4 md:gap-6 -translate-y-1/2">
                        {p2Team.filter(c => !c.isSummonOnly).map((char, i) => (
                            <div key={i} className={`flex flex-col items-center transition-all duration-500 ease-out transform ${introCharIdx >= i + 3 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-10'}`}>
                                <img src={char.img} className="w-16 h-16 md:w-24 md:h-24 rounded-full border-2 md:border-4 border-rose-300 object-cover shadow-[0_0_20px_rgba(244,63,94,0.4)] mb-2" alt={char.name}/>
                                <span className="text-[10px] md:text-sm font-bold text-rose-100 truncate w-24 text-center drop-shadow-md bg-slate-900/50 px-2 py-0.5 rounded-full">{char.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Striscia di divisione e VS */}
                <div className={`absolute top-0 bottom-0 left-1/2 w-2 bg-gradient-to-b from-transparent via-white to-transparent -translate-x-1/2 transform skew-x-[-15deg] z-10 transition-opacity duration-1000 ${introCharIdx >= 2 ? 'opacity-20' : 'opacity-100'}`}></div>
                
                <div className={`z-20 bg-black text-white px-8 py-4 rounded-full font-black text-6xl md:text-8xl italic border-4 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.8)] [animation:pulse-vs_1s_infinite_ease-in-out] transition-all duration-700 ease-in-out ${introCharIdx >= 2 ? 'scale-50 opacity-0 -translate-y-48' : 'scale-100 opacity-100 translate-y-0'}`}>
                    VS
                </div>

                {/* Filtro scurito sui bordi per atmosfera cinematica */}
                <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] pointer-events-none z-30"></div>
            </div>
        );
    }
}
