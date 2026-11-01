// Schermata estratta senza alterare la struttura JSX originale.
export function renderStatsView(ctx) {
const { ArrowLeft, Swords, Target, Trophy, Users, appMode, getPlayerData, playerName, setAppMode } = ctx;
if (appMode === 'stats') {
        const stats = getPlayerData();

        const getMostUsed = (obj) => {
            if (!obj || Object.keys(obj).length === 0) return { name: "Nessuno", count: 0 };
            const best = Object.keys(obj).reduce((a, b) => obj[a] > obj[b] ? a : b);
            return { name: best, count: obj[best] };
        };

        const favChar = getMostUsed(stats.chars);
        const favMove = getMostUsed(stats.moves);
        
        const formatTime = (secs) => {
            if (secs < 60) return `${secs} secondi`;
            const m = Math.floor(secs / 60);
            const h = Math.floor(m / 60);
            if (h > 0) return `${h}h ${m % 60}m`;
            return `${m}m ${secs % 60}s`;
        };

        const winRate = stats.matches > 0 ? Math.round((stats.wins / stats.matches) * 100) : 0;

        return (
            <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black pointer-events-none opacity-60"></div>
                
                <div className="relative z-10 w-full max-w-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
                    <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
                        <button onClick={() => setAppMode('menu')} className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors font-bold bg-slate-950/50 px-4 py-2 rounded-xl border border-slate-700/50">
                            <ArrowLeft size={20} /> Menu
                        </button>
                        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 text-center flex-1">Statistiche di {playerName || 'Giocatore'}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Panoramica */}
                        <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 shadow-inner">
                            <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2"><Trophy size={16} className="text-yellow-500"/> Carriera</h3>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-end border-b border-slate-800/50 pb-2">
                                    <span className="text-slate-300 font-medium">Partite Giocate</span>
                                    <span className="text-2xl font-black text-white">{stats.matches}</span>
                                </div>
                                <div className="flex justify-between items-end border-b border-slate-800/50 pb-2">
                                    <span className="text-slate-300 font-medium">Vittorie</span>
                                    <span className="text-2xl font-black text-emerald-400">{stats.wins}</span>
                                </div>
                                <div className="flex justify-between items-end border-b border-slate-800/50 pb-2">
                                    <span className="text-slate-300 font-medium">Win Rate</span>
                                    <span className="text-2xl font-black text-blue-400">{winRate}%</span>
                                </div>
                                <div className="flex justify-between items-end border-b border-slate-800/50 pb-2">
                                    <span className="text-slate-300 font-medium">Record Sopravvivenza</span>
                                    <span className="text-2xl font-black text-violet-400">{stats.maxSurvivalRound || 0}</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-slate-300 font-medium">Tempo in Battaglia</span>
                                    <span className="text-xl font-bold text-amber-400">{formatTime(stats.playtime)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Preferenze */}
                        <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 shadow-inner flex flex-col justify-center">
                            <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2"><Target size={16} className="text-rose-500"/> I Tuoi Preferiti</h3>
                            
                            <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-4 mb-4 flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center shrink-0 border border-slate-600">
                                    <Users size={24} className="text-cyan-400"/>
                                </div>
                                <div className="overflow-hidden w-full">
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Personaggio Più Usato</div>
                                    <div className="text-lg font-black text-white truncate w-full">{favChar.name}</div>
                                    <div className="text-xs text-slate-500">Schierato {favChar.count} volte</div>
                                </div>
                            </div>

                            <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center shrink-0 border border-slate-600">
                                    <Swords size={24} className="text-rose-400"/>
                                </div>
                                <div className="overflow-hidden w-full">
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Mossa Più Usata</div>
                                    <div className="text-lg font-black text-white truncate w-full">{favMove.name}</div>
                                    <div className="text-xs text-slate-500">Eseguita {favMove.count} volte</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="text-center text-slate-500 text-xs mt-4">
                        I dati vengono salvati localmente su questo browser associandoli al profilo globale.
                    </p>
                </div>
            </div>
        );
    }
}
