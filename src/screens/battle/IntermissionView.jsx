// Schermata estratta senza alterare la struttura JSX originale.
export function renderIntermissionView(ctx) {
const { ChevronRight, Loader2, Trophy, appMode, gameState, getDefaultAvatar, handleNextTournamentMatch, playerRole } = ctx;
if (gameState.status === 'intermission') {
        const isHostOrLocal = appMode === 'local_room' || playerRole === 'p1';
        
        // --- NUOVO: RENDERER TABELLONE E CLASSIFICA TORNEO (Duplicato per scope) ---
        const renderTournamentUI = () => {
            if (gameState.gameMode === 'torneo') {
                const b = gameState.tournamentBracket || ['p1', 'p2', 'p3', 'p4'];
                const res = gameState.tournamentResults || {};

                const MatchBox = ({ p1, p2, winner, title, isFinal }) => (
                    <div className={`bg-slate-900/90 border ${isFinal ? 'border-yellow-500 shadow-[0_0_20px_rgba(250,204,21,0.3)]' : 'border-slate-600 shadow-lg'} rounded-xl p-3 w-48 md:w-56 flex flex-col gap-2 relative z-10 backdrop-blur-sm`}>
                        <div className={`text-[10px] ${isFinal ? 'text-yellow-400' : 'text-cyan-400'} font-black uppercase tracking-widest text-center`}>{title}</div>
                        <div className={`flex items-center gap-3 p-1.5 rounded-lg transition-all ${winner === p1 ? 'bg-emerald-900/60 border border-emerald-500/50' : (winner ? 'opacity-40 grayscale border border-transparent' : 'bg-slate-800 border border-slate-700')}`}>
                            <img src={p1 !== '???' ? (gameState.playerAvatars[p1] || getDefaultAvatar(gameState.players[p1])) : getDefaultAvatar('?')} className="w-8 h-8 rounded-full object-cover bg-slate-950" />
                            <span className="text-xs font-bold truncate text-white">{p1 !== '???' ? gameState.players[p1] : '???'}</span>
                            {winner === p1 && <ChevronRight size={16} className="text-emerald-400 ml-auto" />}
                        </div>
                        <div className="text-center text-[10px] text-slate-500 font-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-700 z-20">VS</div>
                        <div className={`flex items-center gap-3 p-1.5 rounded-lg transition-all ${winner === p2 ? 'bg-emerald-900/60 border border-emerald-500/50' : (winner ? 'opacity-40 grayscale border border-transparent' : 'bg-slate-800 border border-slate-700')}`}>
                            <img src={p2 !== '???' ? (gameState.playerAvatars[p2] || getDefaultAvatar(gameState.players[p2])) : getDefaultAvatar('?')} className="w-8 h-8 rounded-full object-cover bg-slate-950" />
                            <span className="text-xs font-bold truncate text-white">{p2 !== '???' ? gameState.players[p2] : '???'}</span>
                            {winner === p2 && <ChevronRight size={16} className="text-emerald-400 ml-auto" />}
                        </div>
                    </div>
                );

                const s1p1 = b[0], s1p2 = b[1], s2p1 = b[2], s2p2 = b[3];
                const s1w = res.semi1?.winner, s2w = res.semi2?.winner;
                const fw = res.final?.winner;
                const bw = res.bronze?.winner;

                return (
                    <div className="flex flex-col items-center w-full max-w-5xl mx-auto my-6 overflow-x-auto pb-4 custom-scrollbar">
                        <div className="flex items-center justify-center gap-8 md:gap-16 relative min-w-[600px] md:min-w-[800px]">
                            <div className="flex flex-col gap-12 md:gap-16">
                                <MatchBox p1={s1p1} p2={s1p2} winner={s1w} title="Semifinale 1" />
                                <MatchBox p1={s2p1} p2={s2p2} winner={s2w} title="Semifinale 2" />
                            </div>
                            <div className="hidden md:block absolute left-[14rem] top-0 bottom-0 w-8 border-y-2 border-r-2 border-slate-600/50 my-[5.5rem] rounded-r-xl z-0"></div>
                            <div className="hidden md:block absolute left-[16rem] top-1/2 w-8 border-t-2 border-slate-600/50 z-0"></div>
                            <div className="flex flex-col justify-center">
                                <MatchBox p1={s1w || '???'} p2={s2w || '???'} winner={fw} title="Finalissima" isFinal={true} />
                            </div>
                            <div className="hidden md:flex flex-col items-center gap-3 ml-4">
                                <Trophy size={64} className={`transition-all duration-700 ${fw ? 'text-yellow-400 animate-bounce drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]' : 'text-slate-800'}`} />
                            </div>
                        </div>
                        {(res.semi1 && res.semi2) && (
                            <div className="mt-8 pt-8 border-t border-slate-800 w-full flex flex-col items-center animate-fade-in">
                                <MatchBox p1={res.semi1.loser} p2={res.semi2.loser} winner={bw} title="Finale 3° Posto (Bronzo)" />
                            </div>
                        )}
                    </div>
                );
            } else if (gameState.gameMode === 'torneo_punti') {
                const sortedScores = Object.entries(gameState.playerScores)
                    .filter(([p, score]) => gameState.players[p])
                    .sort((a, b) => b[1] - a[1]);
                
                return (
                    <div className="bg-slate-900/90 border border-cyan-500/50 rounded-3xl p-6 md:p-8 shadow-[0_0_40px_rgba(6,182,212,0.2)] w-full max-w-lg mx-auto my-6 backdrop-blur-md">
                        <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-6 uppercase tracking-widest text-center">Classifica Attuale</h3>
                        <div className="space-y-3">
                            {sortedScores.map(([p, score], idx) => {
                                const isFirst = idx === 0 && score > 0;
                                return (
                                    <div key={p} className={`flex items-center justify-between p-3 md:p-4 rounded-xl border transition-all ${isFirst ? 'bg-yellow-900/20 border-yellow-500/50 shadow-[0_0_15px_rgba(250,204,21,0.2)] scale-[1.02]' : 'bg-slate-800/80 border-slate-700'}`}>
                                        <div className="flex items-center gap-3 md:gap-4">
                                            <span className={`font-black text-xl md:text-2xl w-6 md:w-8 text-center ${idx===0 ? 'text-yellow-400 drop-shadow-md' : idx===1 ? 'text-slate-300' : idx===2 ? 'text-amber-600' : 'text-slate-600'}`}>{idx+1}°</span>
                                            <img src={gameState.playerAvatars[p] || getDefaultAvatar(gameState.players[p])} className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 ${isFirst ? 'border-yellow-400' : 'border-slate-600'} object-cover bg-slate-950`} />
                                            <span className={`font-bold text-base md:text-lg ${isFirst ? 'text-yellow-100' : 'text-white'}`}>{gameState.players[p]}</span>
                                        </div>
                                        <span className={`font-black text-2xl md:text-3xl ${isFirst ? 'text-yellow-400' : 'text-cyan-400'}`}>{score}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-4 text-center text-xs text-slate-500 font-bold uppercase tracking-widest">
                            Incontro {Math.min(gameState.currentMatchIdx + 1, gameState.roundRobinMatches.length)} di {gameState.roundRobinMatches.length}
                        </div>
                    </div>
                );
            }
            return null;
        };

        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-slate-900 to-black pointer-events-none"></div>
                <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
                    {(gameState.gameMode !== 'torneo' && gameState.gameMode !== 'torneo_punti') && (
                        <Trophy size={80} className="text-yellow-500 mb-6 mx-auto animate-bounce drop-shadow-[0_0_20px_rgba(234,179,8,0.6)]"/>
                    )}
                    
                    <h2 className="text-5xl md:text-6xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-md">Scontro Concluso!</h2>
                    <p className="text-xl text-slate-300 mb-6 font-medium">L'arena si sta riorganizzando per la prossima fase...</p>
                    
                    {/* INIEZIONE TABELLONE NELL'INTERMEZZO */}
                    {renderTournamentUI()}

                    <div className="mt-6">
                        {isHostOrLocal ? (
                            <button onClick={handleNextTournamentMatch} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-12 py-5 rounded-full font-black text-2xl transition-all shadow-[0_10px_30px_rgba(6,182,212,0.4)] hover:-translate-y-1">
                                Avvia Prossimo Incontro <ChevronRight className="inline" />
                            </button>
                        ) : (
                            <div className="text-2xl text-cyan-400 animate-pulse font-bold flex items-center justify-center gap-4 bg-slate-800/50 py-4 px-8 rounded-full border border-cyan-500/30">
                                <Loader2 className="animate-spin" size={32}/> In attesa dell'Host...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}
