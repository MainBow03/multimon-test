import { getRequiredSwitches } from '../../systems/roomRecovery.js';
// Schermata estratta senza alterare la struttura JSX originale.
export function renderSwitchingPhaseView(ctx) {
const { Loader2, LogOut, TYPE_STYLES, appMode, gameState, getActivePlayers, getTournamentMatchOpponents, leaveRoom, playerRole, renderHealthBar, setPlayerRole, setShowLeaveConfirm, chooseReplacement, forceCompleteSwitches, canForceSwitch } = ctx;
if (gameState.status === 'switching_phase') {
        const needed=getRequiredSwitches(gameState,[playerRole]);
        const required=needed.need[playerRole]||0;
        const chosen=needed.valid[playerRole]||[];
        const isMyTurnToSwitch = playerRole!=='spectator' && !gameState.isBot?.[playerRole] && required>chosen.length;

        // Identifica gli avversari per mostrare chi hanno in campo
        const activeMatchPlayers = getActivePlayers();
        let enemyPlayers = [];
        if (gameState.gameMode === 'multipla') {
            enemyPlayers = ['p1', 'p2'].includes(playerRole) ? ['p3', 'p4'] : ['p1', 'p2'];
        } else if (gameState.gameMode === 'torneo') {
            enemyPlayers = getTournamentMatchOpponents(playerRole);
        } else if (gameState.gameMode === 'torneo_punti') {
            enemyPlayers = [activeMatchPlayers.find(p => p !== playerRole)];
        } else if (gameState.gameMode === 'battleroyale') {
            enemyPlayers = activeMatchPlayers.filter(p => p !== playerRole);
        } else {
            enemyPlayers = [playerRole === 'p1' ? 'p2' : 'p1'];
        }
        
        let enemyActiveChars = [];
        enemyPlayers.forEach(ep => {
            if (ep && gameState.field[ep]) {
                gameState.field[ep].forEach(idx => {
                    const c = gameState.teams[ep][idx];
                    if (c && c.hp > 0) enemyActiveChars.push({ char: c, owner: gameState.players[ep] });
                });
            }
        });

        return (
            <div className="min-h-screen bg-slate-900 flex flex-col font-sans text-white p-6 relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black pointer-events-none opacity-60"></div>
                <button onClick={() => playerRole === 'spectator' ? leaveRoom() : setShowLeaveConfirm(true)} className="absolute top-6 left-6 flex items-center gap-2 text-rose-400 hover:text-white transition-colors bg-slate-900/80 px-4 py-2 rounded-xl border border-rose-500/50 z-20 shadow-lg">
                     <LogOut size={20} /> {playerRole === 'spectator' ? 'Esci' : 'Resa'}
                </button>
                <div className="bg-slate-800/90 backdrop-blur-xl p-8 rounded-3xl w-full max-w-3xl border border-slate-700/50 shadow-2xl text-center z-10">
                    <h2 className="text-4xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Sostituzione Personaggio</h2>
                    
                    {isMyTurnToSwitch ? (
                        <>
                            {enemyActiveChars.length > 0 && (
                                <div className="mb-6 bg-slate-950/60 border border-rose-500/30 rounded-2xl p-4 shadow-inner">
                                    <h3 className="text-xs font-bold text-rose-400 mb-3 uppercase tracking-widest">Avversari in Campo</h3>
                                    <div className="flex justify-center gap-3 flex-wrap">
                                        {enemyActiveChars.map((enemyObj, eIdx) => (
                                            <div key={eIdx} className="flex flex-col items-center bg-slate-900 p-2 rounded-xl border border-rose-900/50 shadow-md w-24">
                                                <img src={enemyObj.char.img} className="w-10 h-10 rounded-full object-cover border border-rose-500/50 mb-1" />
                                                <span className="text-[9px] font-bold text-slate-400 truncate w-full text-center">{enemyObj.owner}</span>
                                                <span className="text-[11px] font-bold text-white truncate w-full text-center mb-1">{enemyObj.char.name}</span>
                                                <div className="flex flex-wrap justify-center gap-0.5 w-full">
                                                    {enemyObj.char.types.map(t => <span key={t} className={`text-[7px] font-black px-1 rounded uppercase ${TYPE_STYLES[t] || 'bg-gray-500'}`}>{t.substring(0,3)}</span>)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <p className="text-lg text-slate-300 mb-6">Un tuo personaggio è esausto! Scegli chi mandare in campo.</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {gameState.teams[playerRole].map((char, i) => {
                                    const isAliveBench = char.hp > 0 && !gameState.field[playerRole].includes(i) && !char.isSummonOnly && !(gameState.switchActions[playerRole] || []).includes(i);
                                    if (!isAliveBench) return null;
                                    return (
                                        <button key={i} onClick={() => {
                                            const currentActions = gameState.switchActions[playerRole] || [];
                                            const newActions = [...currentActions, i];
                                            updateState({ [`switchActions.${playerRole}`]: newActions }).then(() => {
                                                if (appMode === 'local_room') {
                                                    const nextActive = getActivePlayers().filter(p => !gameState.isBot[p] && (p === playerRole ? newActions.length < gameState.pendingSwitches[p] : gameState.pendingSwitches[p] > (gameState.switchActions[p]?.length || 0)));
                                                    if (nextActive.length > 0) {
                                                        setPlayerRole(nextActive[0]);
                                                    }
                                                }
                                            });
                                        }} className="bg-slate-900/80 hover:bg-slate-700/80 border-2 border-emerald-500/50 hover:border-emerald-400 p-4 rounded-xl flex flex-col items-center gap-2 transition-all cursor-pointer shadow-lg hover:-translate-y-1">
                                            <img src={char.img} className="w-16 h-16 rounded-full object-cover border-2 border-emerald-400" />
                                            <span className="font-bold text-sm truncate w-full text-center mb-1">{char.name}</span>
                                            <div className="flex flex-wrap justify-center gap-1 w-full mb-1">
                                                {char.types.map(t => (
                                                    <span key={t} className={`text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm uppercase ${TYPE_STYLES[t] || 'bg-gray-500'}`}>{t}</span>
                                                ))}
                                            </div>
                                            {renderHealthBar(char.hp, char.maxHp)}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="text-2xl text-slate-400 animate-pulse font-bold flex flex-col items-center gap-4">
                            <Loader2 className="animate-spin" size={48} />
                            In attesa degli altri giocatori...
                        </div>
                    )}
                </div>
            </div>
        );
    }
}
