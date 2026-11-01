// Schermata estratta senza alterare la struttura JSX originale.
export function renderLobbyView(ctx) {
const { ArrowLeft, CHARACTERS, FUSION_CHARACTERS, Loader2, SOUNDTRACKS, Swords, TYPE_STYLES, Users, Volume2, appMode, gameState, getDefaultAvatar, getPlayerData, getRequiredPlayers, handleAddBot, handleRemovePlayer, isAllPlayersJoined, leaveRoom, playerRole, roomId, setDraftTimeLeft, startBattle, updateState } = ctx;
if (gameState.status === 'lobby') {
        const isHost = playerRole === 'p1';
        const reqPlayers = getRequiredPlayers(gameState.gameMode, gameState.settings);
        const canStartDraft = isAllPlayersJoined();

        const newArrivals = ['mechajohnny', 'leon', 'perla', 'roxy', 'sans', 'ban', 'meliodas', 'sasuke', 'naruto', 'diamantebianco', 'arievicente', 'sugino', 'elly', 'sumo', 'charizard', 'megamind', 'sheldon', 'dante', 'ilcavaliere']; // Massimo 20 nuovi inserimenti

        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 relative">
                <button onClick={leaveRoom} className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-slate-800/50 px-4 py-2 rounded-xl backdrop-blur-sm border border-slate-700/50 z-20">
                     <ArrowLeft size={20} /> Torna al Menu
                </button>
                
                <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl justify-center items-stretch z-10 mt-16 mb-4">
                    {/* PANNELLO CENTRALE LOBBY */}
                    <div className="bg-slate-800/80 backdrop-blur-xl p-8 rounded-3xl w-full lg:max-w-xl border border-slate-700/50 text-center shadow-[0_0_50px_rgba(0,0,0,0.5)] flex-1 flex flex-col">
                        <h2 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Lobby Partita</h2>
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center justify-center gap-2">
                             <Users size={16}/> Stanza: <span className="text-white bg-slate-900 px-3 py-1 rounded-md border border-slate-700">{roomId}</span>
                        </div>

                        {isHost && (
                             <div className="mb-6 bg-slate-950/50 p-4 rounded-xl border border-slate-700/30 flex justify-between items-center">
                                 <span className="font-semibold text-slate-300">Modalità Gioco:</span>
                                 <select value={gameState.gameMode} onChange={e => {
                                     const newMode = e.target.value;
                                     let updates = { gameMode: newMode };
                                     if (newMode === 'survival') {
                                         const maxP = Math.min(4, Math.max(2, gameState.settings.maxPlayers));
                                         updates.settings = { ...gameState.settings, maxPlayers: maxP, juggernautPlayer: 'p2' };
                                         if (!gameState.players['p2']) {
                                             updates[`players.p2`] = "Orda Infinita";
                                             updates[`playerAvatars.p2`] = 'https://api.dicebear.com/7.x/bottts/svg?seed=Skull&backgroundColor=020617';
                                             updates[`isBot.p2`] = true;
                                             updates[`inventory.p2`] = {};
                                         }
                                         updates.survivalRound = 1;
                                     } else if (gameState.gameMode === 'survival') {
                                         const oldHorde = gameState.settings.juggernautPlayer || 'p2';
                                         if (gameState.players[oldHorde] === "Orda Infinita") {
                                              updates[`players.${oldHorde}`] = null;
                                              updates[`playerAvatars.${oldHorde}`] = '';
                                              updates[`isBot.${oldHorde}`] = false;
                                              updates[`inventory.${oldHorde}`] = {};
                                         }
                                     }
                                     updateState(updates);
                                 }} className="bg-slate-800 text-white font-bold p-2 rounded-lg outline-none border border-slate-600 focus:border-cyan-500">
                                         <option value="classica">Sfida Classica (1v1)</option>
                                         <option value="multipla">Multipla (2v2)</option>
                                         <option value="juggernaut">Juggernaut (1 vs Tutti)</option>
                                         <option value="survival">Sopravvivenza (Infinita)</option>
                                         <option value="battleroyale">Battle Royale (Tutti vs Tutti)</option>
                                         <option value="torneo">Torneo (4 Giocatori)</option>
                                         <option value="torneo_punti">Torneo a Punti (Tutti vs Tutti)</option>
                                 </select>
                         </div>
                    )}

                    {!isHost && (
                         <div className="mb-6 flex flex-col items-center">
                             <div className="text-xl font-bold text-cyan-400">Modalità: {gameState.gameMode.toUpperCase()}</div>
                             {gameState.settings?.rentalMode && (
                                 <div className="text-amber-400 text-sm font-black uppercase tracking-widest mt-1 animate-pulse flex items-center gap-2"><Swords size={16}/> Multimon in Nolo Attivo!</div>
                             )}
                         </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-8">
                         {['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'].slice(0, reqPlayers).map(slot => (
                             <div key={slot} className="bg-slate-950/50 rounded-2xl p-4 border border-slate-700/50 flex flex-col items-center justify-center min-h-[140px] relative">
                                 <div className="absolute top-2 left-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{slot}</div>
                                 {gameState.players[slot] ? (
                                     <>
                                         <img src={gameState.playerAvatars[slot] || getDefaultAvatar(gameState.players[slot])} onError={(e) => { e.target.onerror = null; e.target.src = getDefaultAvatar(gameState.players[slot]); }} className="w-16 h-16 rounded-full border-2 border-cyan-500 mb-2 object-cover bg-slate-900" alt="Avatar" />
                                         <div className="font-bold text-lg text-white text-center w-full truncate px-2 flex items-center justify-center gap-2">
                                             {gameState.players[slot]} {gameState.isBot[slot] && <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.5 rounded-md">BOT</span>}
                                         </div>
                                         {isHost && (
                                             <button onClick={() => handleRemovePlayer(slot)} className="text-xs text-rose-400 hover:text-rose-300 mt-2 transition-colors">
                                                 Rimuovi
                                             </button>
                                         )}
                                     </>
                                 ) : (
                                     <div className="font-bold text-lg text-white text-center flex flex-col items-center w-full">
                                         <Loader2 className="animate-spin text-slate-600 mb-2" size={24}/> 
                                         <span className="text-slate-600 text-sm mb-3">In attesa...</span>
                                         {isHost && appMode === 'online_room' && (
                                             <button onClick={() => handleAddBot(slot)} className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 px-3 py-1.5 rounded-lg w-full transition-colors">
                                                 + Aggiungi CPU
                                             </button>
                                         )}
                                         {isHost && appMode === 'local_room' && (
                                             <div className="flex gap-2 w-full mt-2">
                                                 <button onClick={() => {
                                                     const num = Object.keys(gameState.players).filter(k => gameState.players[k] && !gameState.isBot[k]).length + 1;
                                                     updateState({
                                                         [`players.${slot}`]: `Gioc. ${num}`,
                                                         [`playerAvatars.${slot}`]: getDefaultAvatar(`Gioc. ${num}`),
                                                         [`isBot.${slot}`]: false,
                                                         [`inventory.${slot}`]: getPlayerData().inventory
                                                     });
                                                 }} className="text-[10px] flex-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/50 px-2 py-1.5 rounded-lg transition-colors">+ Umano</button>
                                                 <button onClick={() => handleAddBot(slot)} className="text-[10px] flex-1 bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-500/50 px-2 py-1.5 rounded-lg transition-colors">+ CPU</button>
                                             </div>
                                         )}
                                     </div>
                                 )}
                             </div>
                         ))}
                    </div>

                    {isHost ? (
                        <div className="space-y-4 text-left">
                            <h3 className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-4">Regole</h3>

                            <div className="flex justify-between items-center bg-slate-950/50 p-4 rounded-xl border border-slate-700/30 mb-4">
                                <span className="font-semibold text-slate-300 flex items-center gap-2"><Volume2 size={16}/> Soundtrack:</span>
                                <select value={gameState.settings.soundtrack || 'wpEBouFcwqI'} onChange={e => updateState({ settings: { ...gameState.settings, soundtrack: e.target.value } })} className="bg-slate-800 text-white font-bold p-2 rounded-lg outline-none border border-slate-600 focus:border-cyan-500 max-w-[150px] sm:max-w-[200px] truncate text-xs sm:text-sm">
                                    {SOUNDTRACKS.map(st => (
                                        <option key={st.id} value={st.id}>{st.name}</option>
                                    ))}
                                </select>
                            </div>

                            {(gameState.gameMode === 'juggernaut' || gameState.gameMode === 'survival') && (
                                <div className={`flex justify-between items-center bg-slate-950/50 p-4 rounded-xl border ${gameState.gameMode === 'survival' ? 'border-violet-500/30 shadow-[0_0_10px_rgba(139,92,246,0.1)]' : 'border-rose-500/30 shadow-[0_0_10px_rgba(225,29,72,0.1)]'} mb-4 animate-fade-in`}>
                                    <span className={`font-bold ${gameState.gameMode === 'survival' ? 'text-violet-400' : 'text-rose-400'}`}>{gameState.gameMode === 'survival' ? 'Giocatore Orda (Boss):' : 'Juggernaut (Il Boss):'}</span>
                                    <select value={gameState.settings.juggernautPlayer || (gameState.gameMode === 'survival' ? 'p2' : 'p1')} onChange={e => updateState({ settings: { ...gameState.settings, juggernautPlayer: e.target.value } })} className={`bg-slate-800 text-white font-bold p-2 rounded-lg outline-none border ${gameState.gameMode === 'survival' ? 'border-violet-500/50 focus:border-violet-400' : 'border-rose-500/50 focus:border-rose-400'}`}>
                                        {['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'].slice(0, gameState.settings.maxPlayers).filter(p => gameState.players[p]).map(p => (
                                            <option key={p} value={p}>{gameState.players[p]}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            {(gameState.gameMode === 'torneo_punti' || gameState.gameMode === 'battleroyale' || gameState.gameMode === 'juggernaut' || gameState.gameMode === 'survival') && (
                                <div className="flex justify-between items-center bg-slate-950/50 p-4 rounded-xl border border-slate-700/30 mb-4">
                                    <span className="font-semibold text-slate-300">Numero Giocatori (Max):</span>
                                    <input type="number" 
                                        min={gameState.gameMode === 'juggernaut' ? "3" : "2"} 
                                        max={gameState.gameMode === 'juggernaut' ? "5" : (gameState.gameMode === 'survival' ? "4" : "8")} 
                                        value={gameState.settings.maxPlayers} 
                                        onChange={e => {
                                            let newVal = parseInt(e.target.value) || 2;
                                            if (gameState.gameMode === 'juggernaut') newVal = Math.min(5, Math.max(3, newVal));
                                            else if (gameState.gameMode === 'survival') newVal = Math.min(4, Math.max(2, newVal));
                                            else newVal = Math.min(8, Math.max(2, newVal));

                                            if (gameState.gameMode === 'survival' || gameState.gameMode === 'juggernaut') {
                                                let currentJugg = gameState.settings.juggernautPlayer || (gameState.gameMode === 'survival' ? 'p2' : 'p1');
                                                let juggIndex = parseInt(currentJugg.replace('p', ''));
                                                let updates = { settings: { ...gameState.settings, maxPlayers: newVal } };
                                                if (juggIndex > newVal) {
                                                     updates.settings.juggernautPlayer = 'p' + newVal;
                                                }
                                                updateState(updates);
                                            } else {
                                                updateState({ settings: { ...gameState.settings, maxPlayers: newVal } });
                                            }
                                        }} className="bg-slate-800 text-center w-20 p-2 rounded-lg outline-none font-bold" />
                                </div>
                            )}
                            <div className="flex justify-between items-center bg-slate-950/50 p-4 rounded-xl border border-slate-700/30">
                                <span className="font-semibold text-slate-300">Dimensione Squadra:</span>
                                <input type="number" min="1" max="10" value={gameState.settings.teamSize} onChange={e => updateState({ settings: { ...gameState.settings, teamSize: Math.min(10, Math.max(1, parseInt(e.target.value) || 1)) } })} className="bg-slate-800 text-center w-20 p-2 rounded-lg outline-none font-bold" />
                            </div>
                            <div className="flex justify-between items-center bg-slate-950/50 p-4 rounded-xl border border-slate-700/30">
                                <span className="font-semibold text-slate-300">Personaggi in Campo:</span>
                                {gameState.gameMode === 'multipla' ? (
                                        <span className="text-emerald-400 font-bold">1 (Fisso in 2v2)</span>
                                ) : (
                                        <input type="number" min="1" max="4" value={gameState.settings.fieldSize} onChange={e => updateState({ settings: { ...gameState.settings, fieldSize: Math.min(4, parseInt(e.target.value) || 1) } })} className="bg-slate-800 text-center w-20 p-2 rounded-lg outline-none font-bold" />
                                )}
                            </div>

                            {/* NUOVO: Multimon in Nolo */}
                            <div className="flex justify-between items-center bg-slate-950/50 p-4 rounded-xl border border-amber-500/30 shadow-inner mt-4">
                                <div className="flex flex-col text-left">
                                    <span className="font-bold text-amber-400">Multimon in Nolo</span>
                                    <span className="text-[10px] text-amber-200/70">Squadre 100% Casuali. Salta la scelta!</span>
                                </div>
                                <button 
                                    onClick={() => updateState({ settings: { ...gameState.settings, rentalMode: !gameState.settings.rentalMode } })} 
                                    className={`w-12 h-6 rounded-full flex items-center transition-all p-1 ${gameState.settings.rentalMode ? 'bg-amber-500' : 'bg-slate-700'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${gameState.settings.rentalMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </button>
                            </div>

                            {/* NUOVO: Fusion Battle */}
                            <div className="flex justify-between items-center bg-slate-950/50 p-4 rounded-xl border border-fuchsia-500/30 shadow-inner mt-4">
                                <div className="flex flex-col text-left">
                                    <span className="font-bold text-fuchsia-400">Fusion Battle</span>
                                    <span className="text-[10px] text-fuchsia-200/70">Roster completamente originale di Fusioni!</span>
                                </div>
                                <button 
                                    onClick={() => updateState({ settings: { ...gameState.settings, fusionMode: !gameState.settings.fusionMode } })} 
                                    className={`w-12 h-6 rounded-full flex items-center transition-all p-1 ${gameState.settings.fusionMode ? 'bg-fuchsia-500' : 'bg-slate-700'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${gameState.settings.fusionMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </button>
                            </div>

                            {/* NUOVO: Draft Battle */}
                            <div className="flex justify-between items-center bg-slate-950/50 p-4 rounded-xl border border-cyan-500/30 shadow-inner mt-4">
                                <div className="flex flex-col text-left">
                                    <span className="font-bold text-cyan-400">Modalità Draft Battle</span>
                                    <span className="text-[10px] text-cyan-200/70">Seleziona a tempo tra 3 campioni scelti a caso!</span>
                                </div>
                                <button 
                                    onClick={() => updateState({ settings: { ...gameState.settings, draftBattle: !gameState.settings.draftBattle, rentalMode: false, sharedDraft: false } })} 
                                    className={`w-12 h-6 rounded-full flex items-center transition-all p-1 ${gameState.settings.draftBattle ? 'bg-cyan-500' : 'bg-slate-700'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${gameState.settings.draftBattle ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </button>
                            </div>

                            {/* NUOVO: Draft Condiviso */}
                            <div className="flex justify-between items-center bg-slate-950/50 p-4 rounded-xl border border-indigo-500/30 shadow-inner mt-4">
                                <div className="flex flex-col text-left">
                                    <span className="font-bold text-indigo-400">Draft Condiviso</span>
                                    <span className="text-[10px] text-indigo-200/70">Scelta a turni da un roster casuale unico. Chi lo prende per primo lo tiene!</span>
                                </div>
                                <button 
                                    onClick={() => updateState({ settings: { ...gameState.settings, sharedDraft: !gameState.settings.sharedDraft, draftBattle: false, rentalMode: false } })} 
                                    className={`w-12 h-6 rounded-full flex items-center transition-all p-1 ${gameState.settings.sharedDraft ? 'bg-indigo-500' : 'bg-slate-700'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${gameState.settings.sharedDraft ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </button>
                            </div>

                            <button disabled={!canStartDraft} onClick={() => {
                                let hasBots = false;
                                const baseRoster = gameState.settings.fusionMode ? FUSION_CHARACTERS : CHARACTERS;
                                const draftable = baseRoster.filter(c => !c.isSummonOnly && !c.isSecretUnlock);
                                const newDraft = { ...gameState.draft };
                                const newDraftChoices = { ...gameState.draftChoices };
                                const newDraftRerolls = { ...gameState.draftRerolls }; // <--- AGGIUNTO
                                const req = getRequiredPlayers(gameState.gameMode, gameState.settings);
                                const juggPlayer = gameState.settings.juggernautPlayer || (gameState.gameMode === 'survival' ? 'p2' : 'p1');
                                const activePlayersToDraft = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'].slice(0, req).filter(p => gameState.players[p]);
                                
                                const getTeamSizeForPlayer = (p) => ((gameState.gameMode === 'juggernaut' || gameState.gameMode === 'survival') && p === juggPlayer) ? 1 : gameState.settings.teamSize;

                                if (gameState.settings.rentalMode) {
                                    activePlayersToDraft.forEach(p => {
                                        const cpuDraft = [];
                                        const shuffled = [...draftable].sort(() => 0.5 - Math.random());
                                        let cpuTeamSize = getTeamSizeForPlayer(p);
                                        
                                        for(let i=0; i<cpuTeamSize; i++) {
                                            let c = {...shuffled[i], statuses: [], consecutiveProtect: 0, baseAtk: shuffled[i].atk, baseDef: shuffled[i].def, baseSpd: shuffled[i].spd, moves: shuffled[i].moves.filter(Boolean).map(m => ({ ...m, remainingUses: m.maxUses !== undefined ? m.maxUses : null }))};
                                            cpuDraft.push(c);
                                        }
                                        newDraft[p] = cpuDraft;
                                    });
                                    startBattle(newDraft);
                                } else if (gameState.settings.sharedDraft) {
                                    // LOGICA DRAFT CONDIVISO (Ordine Lineare Costante)
                                    let sequence = [];
                                    const shuffledPlayers = [...activePlayersToDraft].sort(() => 0.5 - Math.random()); // Mescola solo al primo turno
                                    const maxPicks = Math.max(...activePlayersToDraft.map(p => getTeamSizeForPlayer(p)));
                                    
                                    // Genera andamento lineare: A-B-C -> A-B-C
                                    for(let i=0; i<maxPicks; i++) {
                                        shuffledPlayers.forEach(p => {
                                            if (sequence.filter(x => x === p).length < getTeamSizeForPlayer(p)) {
                                                sequence.push(p);
                                            }
                                        });
                                    }

                                    // Genera Pool
                                    const poolSize = sequence.length;
                                    const shuffledDraftable = [...draftable].sort(() => 0.5 - Math.random());
                                    const pool = shuffledDraftable.slice(0, poolSize).map(c => ({ char: c, pickedBy: null }));

                                    setDraftTimeLeft(15);
                                    updateState({ status: 'drafting', sharedDraftPool: pool, draftSequence: sequence, currentDraftTurn: 0 });

                                } else {
                                    activePlayersToDraft.forEach(p => {
                                        if (gameState.isBot[p]) {
                                            const cpuDraft = [];
                                            const shuffled = [...draftable].sort(() => 0.5 - Math.random());
                                            let cpuTeamSize = getTeamSizeForPlayer(p);
                                            
                                            for(let i=0; i<cpuTeamSize; i++) {
                                                let c = {...shuffled[i], statuses: [], consecutiveProtect: 0, baseAtk: shuffled[i].atk, baseDef: shuffled[i].def, baseSpd: shuffled[i].spd, moves: shuffled[i].moves.filter(Boolean).map(m => ({ ...m, remainingUses: m.maxUses !== undefined ? m.maxUses : null }))};
                                                cpuDraft.push(c);
                                            }
                                            newDraft[p] = cpuDraft;
                                            hasBots = true;
                                        } else if (gameState.settings.draftBattle) {
                                            // Inizializza i 3 campioni casuali per i giocatori umani nella modalità Draft
                                            const shuffled = [...draftable].sort(() => 0.5 - Math.random());
                                            newDraftChoices[p] = shuffled.slice(0, 3);
                                            newDraftRerolls[p] = 2; // Reset rerolls all'avvio
                                        }
                                    });

                                    setDraftTimeLeft(30); // Inizializza Timer!
                                    
                                    if (hasBots) {
                                         updateState({ status: 'drafting', draft: newDraft, draftChoices: newDraftChoices, draftRerolls: newDraftRerolls });
                                    } else {
                                         updateState({ status: 'drafting', draftChoices: newDraftChoices, draftRerolls: newDraftRerolls });
                                    }
                                }
                            }} className={`w-full disabled:opacity-50 disabled:grayscale text-white font-bold py-4 rounded-xl mt-6 shadow-lg text-lg ${gameState.settings.rentalMode ? 'bg-gradient-to-r from-amber-500 to-orange-600' : (gameState.settings.sharedDraft ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : (gameState.settings.draftBattle ? 'bg-gradient-to-r from-cyan-600 to-blue-600' : 'bg-gradient-to-r from-emerald-500 to-green-600'))}`}>
                                {gameState.settings.rentalMode ? 'Avvia Multimon in Nolo (Casuale)' : (gameState.settings.sharedDraft ? 'Avvia Draft Condiviso!' : (gameState.settings.draftBattle ? 'Avvia Draft Battle!' : 'Procedi alla Scelta Personaggi'))}
                            </button>
                        </div>
                    ) : (
                         <div className="text-slate-400 italic p-6 bg-slate-950/30 rounded-xl">L'host sta configurando le regole...</div>
                    )}
                    </div>

                    {/* PANNELLO LATERALE DESTRO - NUOVI ARRIVI */}
                    <div className="w-full lg:w-72 bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-5 flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.3)] shrink-0 max-h-[85vh]">
                        <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 mb-4 text-center uppercase tracking-widest border-b border-slate-700/50 pb-3">Nuovi Arrivi</h3>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                            {newArrivals.slice(0, 20).map(id => {
                                const char = CHARACTERS.find(c => c.id === id);
                                if (!char) return null;
                                return (
                                    <div key={id} className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4 flex flex-col items-center text-center hover:border-emerald-500/50 transition-all shadow-md group">
                                        <img src={char.img} className="w-20 h-20 rounded-full object-cover border-2 border-slate-600 group-hover:border-emerald-400 transition-colors mb-2 shadow-lg" alt={char.name} />
                                        <div className="font-bold text-base text-white">{char.name}</div>
                                        <div className="text-xs text-emerald-400 font-bold mb-3 italic">si è unito all'arena!</div>
                                        <div className="flex flex-wrap gap-1 justify-center">
                                            {char.types.map(t => (
                                                <span key={t} className={`text-[9px] font-black px-2 py-0.5 rounded shadow-sm uppercase ${TYPE_STYLES[t] || 'bg-gray-500'}`}>{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
