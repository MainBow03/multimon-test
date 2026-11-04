// Scelte e avvio sono preparati atomicamente da Firestore nell'host.
// Schermata estratta senza alterare la struttura JSX originale.
export function renderRoguelikeCoopLobbyView(ctx) {
const { ArrowLeft, CHARACTERS, FUSION_CHARACTERS, Loader2, Wifi, appMode, coopRoomId, gameState, getDefaultAvatar, playerRole, setAppMode, setCoopRoomId, leaveRoom, startCoopDraft } = ctx;
if (appMode === 'roguelike_coop_lobby') {
        const isHost = playerRole === 'p1';

        const handleStartSpedizione = () => {
            if(!isHost||gameState.status!=='lobby'||!gameState.players.p2)return;
            Promise.resolve(startCoopDraft()).catch(error=>{
              console.error('Avvio spedizione fallito:',error);
            });
        };

        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-pink-900/20 via-slate-900 to-black pointer-events-none"></div>
                
                <button onClick={() => { leaveRoom(); setCoopRoomId(null); }} className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-slate-800/50 px-4 py-2 rounded-xl backdrop-blur-sm border border-slate-700/50 z-20">
                     <ArrowLeft size={20} /> Torna al Menu
                </button>
                
                <div className="bg-slate-800/80 backdrop-blur-xl p-8 rounded-3xl w-full max-w-3xl border border-pink-500/50 text-center shadow-[0_0_50px_rgba(236,72,153,0.3)] z-10 flex flex-col items-center">
                    <h2 className="text-4xl md:text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-500 drop-shadow-md">Roguelike Co-op</h2>
                    <p className="text-slate-300 mb-8 font-medium max-w-lg">Spedizione online da 2 o 3 giocatori (massimo 3). Ognuno sceglie 2 Multimon iniziali: il primo combatte, il secondo resta come riserva per le sostituzioni e i KO. In 3 partirete con 6 Multimon! Affrontate gruppi di 2 avversari nei primi 4 piani, poi 3 avversari nei piani 5–9 e un boss al piano 10: il ciclo continua fino al piano 50! Reclutate nuovi compagni tra un piano e l’altro, con più probabilità per chi ne ha meno.</p>
                    
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-10 flex flex-col md:flex-row items-center justify-center gap-4 bg-slate-900/80 px-6 py-4 rounded-2xl border border-slate-700/50">
                         <div className="flex items-center gap-2">
                             <Wifi size={20} className="text-pink-400"/> Codice Stanza:
                         </div>
                         <span className="text-white text-3xl font-mono tracking-widest bg-black px-4 py-2 rounded-xl border border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.4)] select-all">{coopRoomId}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8">
                         {/* Host */}
                         <div className="bg-slate-950/50 rounded-2xl p-6 border border-pink-500/50 flex flex-col items-center justify-center relative shadow-inner">
                             <div className="absolute top-3 left-3 text-[10px] font-black text-pink-400 uppercase tracking-widest">Host</div>
                             <img src={gameState.playerAvatars.p1 || getDefaultAvatar(gameState.players.p1)} onError={(e) => { e.target.onerror = null; e.target.src = getDefaultAvatar(gameState.players.p1); }} className="w-20 h-20 rounded-full border-4 border-pink-500 mb-3 object-cover bg-slate-900 shadow-[0_0_15px_rgba(236,72,153,0.5)]" alt="Avatar" />
                             <div className="font-bold text-lg text-white text-center w-full truncate">{gameState.players.p1}</div>
                         </div>
                         {/* Slot 2 */}
                         <div className="bg-slate-950/50 rounded-2xl p-6 border border-slate-700/50 flex flex-col items-center justify-center relative border-dashed">
                             <div className="absolute top-3 left-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Guest 1</div>
                             {gameState.players.p2 ? (
                                 <>
                                     <img src={gameState.playerAvatars.p2 || getDefaultAvatar(gameState.players.p2)} onError={(e) => { e.target.onerror = null; e.target.src = getDefaultAvatar(gameState.players.p2); }} className="w-20 h-20 rounded-full border-4 border-slate-400 mb-3 object-cover bg-slate-900 shadow-[0_0_15px_rgba(255,255,255,0.2)]" alt="Avatar" />
                                     <div className="font-bold text-lg text-white text-center w-full truncate">{gameState.players.p2}</div>
                                 </>
                             ) : (
                                 <>
                                     <Loader2 className="animate-spin text-slate-600 mb-4" size={32}/> 
                                     <span className="text-slate-500 font-bold">In attesa...</span>
                                 </>
                             )}
                         </div>
                         {/* Slot 3 */}
                         <div className="bg-slate-950/50 rounded-2xl p-6 border border-slate-700/50 flex flex-col items-center justify-center relative border-dashed">
                             <div className="absolute top-3 left-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Guest 2</div>
                             {gameState.players.p3 ? (
                                 <>
                                     <img src={gameState.playerAvatars.p3 || getDefaultAvatar(gameState.players.p3)} onError={(e) => { e.target.onerror = null; e.target.src = getDefaultAvatar(gameState.players.p3); }} className="w-20 h-20 rounded-full border-4 border-slate-400 mb-3 object-cover bg-slate-900 shadow-[0_0_15px_rgba(255,255,255,0.2)]" alt="Avatar" />
                                     <div className="font-bold text-lg text-white text-center w-full truncate">{gameState.players.p3}</div>
                                 </>
                             ) : (
                                 <>
                                     <Loader2 className="animate-spin text-slate-600 mb-4" size={32}/> 
                                     <span className="text-slate-500 font-bold">In attesa...</span>
                                 </>
                             )}
                         </div>
                    </div>

                    {isHost ? (
                        <button 
                            disabled={!gameState.players.p2 || gameState.status!=='lobby'} 
                            onClick={handleStartSpedizione}
                            className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-black py-4 px-12 rounded-full shadow-lg transition-all hover:-translate-y-1 disabled:opacity-50 disabled:grayscale text-xl"
                        >
                            Inizia Spedizione!
                        </button>
                    ) : (
                        <div className="text-pink-400 font-bold animate-pulse text-lg border border-pink-500/30 bg-pink-950/30 px-6 py-3 rounded-full">
                            In attesa che l'Host avvii la spedizione...
                        </div>
                    )}
                </div>
            </div>
        );
    }
}
