import { canEquipHeldItem } from '../../systems/heldEquipment.js';
// Schermata estratta senza alterare la struttura JSX originale.
export function renderDraftingView(ctx) {
const { ArrowLeft, CHARACTERS, ITEMS_DB, FUSION_CHARACTERS, IS_PREVIEW, Loader2, Swords, TYPES, TYPE_STYLES, Unlock, appMode, draftFilterType, draftHoverInfo, draftLongPressRef, draftPressTimerRef, draftSearch, draftSort, draftTimeLeft, gameState, getDefaultAvatar, getPlayerData, getRequiredPlayers, handleDraftReroll, handlePick, handleSharedPick, leaveRoom, playerRole, setDraftFilterType, setDraftHoverInfo, setDraftSearch, setDraftSort, setPlayerRole, setSystemAlert, startBattle, updateState } = ctx;
if (gameState.status === 'drafting') {
        if (playerRole === 'spectator') {
            return (
                <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 relative overflow-hidden">
                    <button onClick={leaveRoom} className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-slate-800/50 px-4 py-2 rounded-xl backdrop-blur-sm border border-slate-700/50 z-20">
                         <ArrowLeft size={20} /> Torna al Menu
                    </button>
                    <div className="text-2xl text-cyan-400 animate-pulse font-bold flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin" size={48} />
                        I giocatori stanno scegliendo la squadra...
                    </div>
                </div>
            );
        }

        const activeReqPlayers = getRequiredPlayers(gameState.gameMode, gameState.settings);
        const activePlayersList = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'].filter(p => gameState.players[p]);
        const draftLimitToCheck = (gameState.gameMode === 'torneo_punti' || gameState.gameMode === 'juggernaut' || gameState.gameMode === 'survival') ? activePlayersList : ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'].slice(0, activeReqPlayers);
        
        const juggPlayer = gameState.settings.juggernautPlayer || (gameState.gameMode === 'survival' ? 'p2' : 'p1');
        const myDraft = gameState.draft[playerRole] || [];
        const myTeamSize = ((gameState.gameMode === 'juggernaut' || gameState.gameMode === 'survival') && playerRole === juggPlayer) ? 1 : gameState.settings.teamSize;
        const isReady = myDraft.length === myTeamSize;
        const heldInventory = getPlayerData().inventory || {};
        const equipItem = (index, itemId) => {
            if (!canEquipHeldItem(myDraft, index, itemId, heldInventory)) {
                setSystemAlert('Non possiedi abbastanza copie di questo strumento!');
                return;
            }
            updateState({ [`draft.${playerRole}`]: myDraft.map((c, i) => i === index ? { ...c, heldItem: itemId || null } : c) });
        };
        
        let allReady = true;
        let readyCount = 0;
        draftLimitToCheck.forEach(p => {
                let limit = gameState.settings.teamSize;
                if ((gameState.gameMode === 'juggernaut' || gameState.gameMode === 'survival') && p === juggPlayer) limit = 1;

                if (gameState.draft[p] && gameState.draft[p].length === limit) readyCount++;
                else allReady = false;
        });

        const currentPlayerName = gameState.players[playerRole] || "Player";
        const baseRoster = gameState.settings.fusionMode ? FUSION_CHARACTERS : CHARACTERS;
        const myUnlocked = IS_PREVIEW ? baseRoster.map(c => c.id) : (getPlayerData().unlockedChars || []);
        const draftableChars = baseRoster.filter(c => !c.isSummonOnly && ((!c.price && !c.isSecretUnlock) || myUnlocked.includes(c.id)));

        let filteredDraftableChars = draftableChars.filter(c => {
            if (draftFilterType !== 'Tutti' && !c.types.includes(draftFilterType)) return false;
            if (draftSearch.trim() !== '' && !c.name.toLowerCase().includes(draftSearch.toLowerCase())) return false;
            return true;
        });

        if (draftSort === 'alpha') {
            filteredDraftableChars.sort((a, b) => a.name.localeCompare(b.name));
        } else if (draftSort === 'type') {
            filteredDraftableChars.sort((a, b) => a.types[0].localeCompare(b.types[0]));
        }

        return (
            <div className="h-[100dvh] min-h-[520px] bg-slate-900 text-white p-3 sm:p-5 flex flex-col relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black pointer-events-none opacity-40"></div>
                
                <div className="flex flex-wrap justify-between items-center gap-3 mb-3 z-10">
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Scegli la tua Squadra ({myDraft.length}/{myTeamSize}) {(gameState.gameMode === 'juggernaut' || gameState.gameMode === 'survival') && playerRole === juggPlayer && <span className="text-rose-500 text-sm align-middle block mt-1">Sei il Nemico! Scegli 1 solo campione.</span>}</h2>
                    <div className="text-slate-300 bg-slate-950/80 px-6 py-3 rounded-xl border border-slate-700/50 shadow-inner font-bold flex items-center gap-3">
                         {appMode === 'vs_cpu' ? (
                             <span>Scegli il tuo Team!</span>
                         ) : (
                             <>Giocatori Pronti: <span className={allReady ? "text-emerald-400" : "text-amber-400"}>{readyCount}/{draftLimitToCheck.length}</span></>
                         )}
                    </div>
                </div>

                <div className="flex gap-4 mb-6 z-10 min-h-[80px] overflow-x-auto pb-2 custom-scrollbar">
                     {myDraft.map((char, i) => {
                         // IMPEDISCE DI RIMUOVERE I PERSONAGGI NELLE MODALITÀ DRAFT
                         const canRemoveFromDraft = !gameState.settings.draftBattle && !gameState.settings.sharedDraft;
                         return (
                             <div key={i} className={`relative flex-shrink-0 animate-fade-in ${canRemoveFromDraft ? 'group cursor-pointer' : ''}`} onClick={() => { if(canRemoveFromDraft) updateState({ [`draft.${playerRole}`]: myDraft.filter((_, idx) => idx !== i) }) }}>
                                 <img src={char.img} alt={char.name} className="w-20 h-20 rounded-full object-cover border-4 border-emerald-400" />
                                 {canRemoveFromDraft && (
                                     <div className="absolute inset-0 bg-red-600/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"><span className="font-black text-xl">X</span></div>
                                 )}
                             </div>
                         );
                     })}
                </div>

                {isReady ? (
                    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar flex flex-col items-center justify-start bg-slate-950/60 rounded-3xl z-10 border border-slate-800/50 backdrop-blur-sm py-3">
                         <div className="w-full max-w-5xl mb-5 rounded-2xl bg-slate-900/90 border border-violet-500/50 p-3 sm:p-4 max-h-[45vh] overflow-y-auto custom-scrollbar">
                           <h3 className="text-lg sm:text-xl font-black text-violet-300 mb-1">🎒 Assegna strumenti alla squadra</h3>
                           <p className="text-xs text-slate-400 mb-3">Gli strumenti acquistati al negozio non si consumano. Una copia può essere assegnata a un solo campione per battaglia.</p>
                           <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                             {myDraft.map((hero, idx) => <label key={idx} className="bg-slate-950/80 p-3 rounded-xl border border-slate-700 flex items-center gap-3 min-w-0">
                               <img src={hero.img} alt="" className="w-11 h-11 rounded-full object-cover" />
                               <span className="flex-1 min-w-0"><span className="block font-bold text-xs truncate">{hero.name}</span>
                                 <select aria-label={`Strumento per ${hero.name}`} value={hero.heldItem || ''} onChange={e => equipItem(idx, e.target.value)} className="mt-1 w-full min-w-0 bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs">
                                   <option value="">Nessuno</option>
                                   {Object.values(ITEMS_DB).filter(item => item.type === 'held' && heldInventory[item.id] > 0).map(item => <option key={item.id} value={item.id}>{item.icon} {item.name} (x{heldInventory[item.id]})</option>)}
                                 </select>
                               </span>
                             </label>)}
                           </div>
                         </div>
                         <h3 className="text-3xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 font-black mb-4 sm:mb-8 drop-shadow-md text-center">Squadra Pronta!</h3>
                         
                         {appMode === 'local_room' && !allReady && (() => {
                                 const humans = draftLimitToCheck.filter(p => !gameState.isBot[p]);
                                 const nextIdx = humans.indexOf(playerRole) + 1;
                                 const nextHuman = humans[nextIdx];
                                 
                                 return nextHuman ? (
                                     <button onClick={() => setPlayerRole(nextHuman)} className="bg-gradient-to-r from-blue-600 to-indigo-600 px-10 py-5 rounded-2xl font-black text-2xl shadow-[0_10px_30px_rgba(59,130,246,0.3)] hover:-translate-y-1 transition-all">
                                            Passa il turno al Giocatore {nextHuman.replace('p', '')}
                                     </button>
                                 ) : null;
                         })()}
                         
                         {appMode === 'online_room' && !allReady && (
                                 <p className="text-slate-400 animate-pulse flex items-center gap-3 text-xl bg-slate-900/50 px-8 py-4 rounded-xl"><Loader2 className="animate-spin text-cyan-400"/> In attesa degli altri...</p>
                         )}

                         {allReady && (appMode === 'local_room' || playerRole === 'p1') && (
                                 <button onClick={startBattle} className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 px-10 py-5 rounded-2xl font-black text-2xl shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:-translate-y-1 transition-all flex items-center gap-3"><Swords /> Inizia Lotta!</button>
                         )}

                         {allReady && appMode === 'online_room' && playerRole !== 'p1' && (
                                 <p className="text-emerald-400 animate-pulse flex items-center gap-3 text-xl bg-slate-900/50 px-8 py-4 rounded-xl"><Loader2 className="animate-spin"/> Tutti pronti! In attesa dell'Host...</p>
                         )}
                    </div>
                ) : (
                    <div className="flex-1 min-h-0 w-full flex flex-col bg-slate-950/60 rounded-3xl p-3 sm:p-5 overflow-hidden border border-slate-800/50 z-10">
                        {gameState.settings.sharedDraft ? (
                            // --- INTERFACCIA DRAFT CONDIVISO (SNAKE DRAFT) ---
                            <div className="flex flex-col items-center justify-start w-full h-full">
                                {/* Barra dei turni in alto */}
                                <div className="w-full bg-slate-900/80 p-4 rounded-2xl border border-indigo-500/50 mb-6 flex flex-col items-center shadow-lg">
                                    <h3 className="text-indigo-400 font-bold uppercase tracking-widest text-xs mb-3">Ordine di Scelta</h3>
                                    <div className="flex gap-2 overflow-x-auto max-w-full pb-2 custom-scrollbar justify-start md:justify-center px-4">
                                        {gameState.draftSequence.map((pID, idx) => {
                                            const isCurrentTurn = idx === gameState.currentDraftTurn;
                                            const isPastTurn = idx < gameState.currentDraftTurn;
                                            return (
                                                <div key={idx} className={`relative flex-shrink-0 transition-all ${isCurrentTurn ? 'scale-125 mx-2 z-10' : (isPastTurn ? 'opacity-40 grayscale' : 'opacity-80 scale-90')}`}>
                                                    <img src={gameState.playerAvatars[pID] || getDefaultAvatar(gameState.players[pID])} className={`w-10 h-10 rounded-full border-2 ${isCurrentTurn ? 'border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.8)]' : 'border-slate-600'} object-cover bg-slate-900`} title={gameState.players[pID]}/>
                                                    {isCurrentTurn && <div className="absolute -bottom-1 -right-1 bg-yellow-400 w-3 h-3 rounded-full border border-black animate-ping"></div>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className={`mt-4 text-2xl font-black flex items-center gap-4 ${draftTimeLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-white'}`}>
                                        <span>Turno di: <span className="text-indigo-400">{gameState.players[gameState.draftSequence[gameState.currentDraftTurn]]}</span></span>
                                        <span className="bg-slate-950 px-3 py-1 rounded-lg border border-slate-700 text-amber-400 font-mono">⏳ {draftTimeLeft}s</span>
                                    </div>
                                </div>

                                {/* Griglia dei Personaggi Disponibili */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 2xl:grid-cols-11 gap-3 overflow-y-auto custom-scrollbar p-2 w-full flex-1 min-h-0 content-start pb-8">
                                    {gameState.sharedDraftPool.map((item, pIdx) => {
                                        const isPicked = item.pickedBy !== null;
                                        // FIX LOCALE: Controlliamo se è il turno dell'utente attivo senza curarci di playerRole in Locale!
                                        const activeTurnPlayer = gameState.draftSequence[gameState.currentDraftTurn];
                                        const isMyTurn = appMode === 'local_room' ? !gameState.isBot[activeTurnPlayer] : (!gameState.isBot[playerRole] && playerRole === activeTurnPlayer);
                                        
                                        return (
                                            <div 
                                                key={pIdx} 
                                                onClick={() => {
                                                    if (!isPicked && isMyTurn) {
                                                        handleSharedPick(pIdx, activeTurnPlayer);
                                                    } else if (!isMyTurn && !isPicked) {
                                                        setSystemAlert("Non è il tuo turno!");
                                                    }
                                                }}
                                                className={`relative overflow-hidden bg-slate-900/80 backdrop-blur-md border rounded-2xl p-3 text-center transition-all duration-300 flex flex-col items-center justify-center ${isPicked ? 'border-slate-700 opacity-60 grayscale' : (isMyTurn ? 'border-indigo-400/50 hover:border-indigo-300 cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:-translate-y-1' : 'border-slate-700/50 shadow-md')}`}
                                            >
                                                <img src={item.char.img} alt={item.char.name} className={`w-14 h-14 rounded-full object-cover mb-2 border-2 ${isPicked ? 'border-slate-600' : 'border-indigo-500/50'}`} />
                                                <h4 className="font-bold text-xs mb-1 truncate text-slate-100 w-full">{item.char.name}</h4>
                                                
                                                <div className="flex flex-wrap gap-1 justify-center w-full mb-1">
                                                    {item.char.types.map(t => (
                                                        <span key={t} className={`text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm uppercase ${TYPE_STYLES[t] || 'bg-gray-500'}`}>{t}</span>
                                                    ))}
                                                </div>
                                                
                                                {/* Overlay se è stato scelto */}
                                                {isPicked && (
                                                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                                                        <img src={gameState.playerAvatars[item.pickedBy] || getDefaultAvatar(gameState.players[item.pickedBy])} className="w-10 h-10 rounded-full border-2 border-slate-400 shadow-lg object-cover bg-slate-900 mb-1" />
                                                        <span className="bg-slate-800 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">{gameState.players[item.pickedBy]}</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : gameState.settings.draftBattle ? (
                            // --- INTERFACCIA DRAFT BATTLE ---
                            <div className="flex flex-col items-center justify-center w-full h-full">
                                <div className={`text-4xl md:text-5xl font-black mb-4 animate-pulse ${draftTimeLeft <= 10 ? 'text-rose-500' : 'text-amber-400'}`}>
                                    ⏳ {draftTimeLeft}s
                                </div>
                                <div className="flex justify-center mb-8">
                                    <button 
                                        onClick={handleDraftReroll}
                                        disabled={(gameState.draftRerolls?.[playerRole] ?? 2) <= 0}
                                        className={`px-6 py-2 rounded-full font-black uppercase tracking-widest transition-all ${(gameState.draftRerolls?.[playerRole] ?? 2) > 0 ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)] hover:scale-105 hover:-translate-y-1' : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'}`}
                                    >
                                        🔄 Reroll Scelte ({gameState.draftRerolls?.[playerRole] ?? 2} Rimasti)
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
                                    {(gameState.draftChoices[playerRole] || []).map((char, cIdx) => (
                                        <div 
                                            key={char.id + cIdx} 
                                            onClick={() => handlePick(char)}
                                            className="bg-slate-900/90 backdrop-blur-xl border border-cyan-500/50 hover:border-cyan-300 rounded-3xl p-6 text-center cursor-pointer transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 shadow-[0_0_30px_rgba(6,182,212,0.2)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] flex flex-col items-center group"
                                        >
                                            <img src={char.img} alt={char.name} className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover mx-auto mb-4 border-4 border-slate-600 group-hover:border-cyan-400 transition-colors shadow-xl" />
                                            <h3 className="text-2xl font-black text-white mb-2">{char.name}</h3>
                                            <div className="flex flex-wrap gap-2 justify-center mb-6">
                                                {char.types.map(t => (
                                                    <span key={t} className={`text-xs font-black px-3 py-1 rounded shadow-sm uppercase ${TYPE_STYLES[t] || 'bg-gray-500'}`}>{t}</span>
                                                ))}
                                            </div>
                                            <div className="w-full grid grid-cols-2 gap-3 text-sm font-mono bg-black/40 p-4 rounded-xl border border-slate-700/50 mb-6">
                                                <div className="text-emerald-400">HP: {char.maxHp}</div>
                                                <div className="text-rose-400">ATK: {char.atk}</div>
                                                <div className="text-blue-400">DEF: {char.def}</div>
                                                <div className="text-amber-400">SPD: {char.spd}</div>
                                            </div>
                                            <div className="w-full text-left space-y-2 mt-auto">
                                                <div className="font-bold text-cyan-400 border-b border-slate-700 pb-1 mb-2 uppercase tracking-widest text-xs">Set Mosse Principali</div>
                                                {char.moves.slice(0, 3).map((m, mIdx) => (
                                                    <div key={mIdx} className="bg-slate-800/80 p-2 rounded-lg text-xs flex justify-between items-center border border-slate-700">
                                                        <span className="font-bold text-slate-200 truncate pr-2">{m.name}</span>
                                                        <span className={`px-1.5 py-0.5 rounded text-[9px] ${TYPE_STYLES[m.type] || 'bg-gray-500'}`}>{m.type}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            // --- INTERFACCIA SCELTA CLASSICA (GRIGLIA) ---
                            <>
                                <div className="flex flex-wrap gap-3 mb-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-700/50 backdrop-blur-md items-center shrink-0">
                                    <div className="flex-1 min-w-[150px]">
                                        <input 
                                            type="text" 
                                            placeholder="Cerca campione..." 
                                            value={draftSearch} 
                                            onChange={e => setDraftSearch(e.target.value)} 
                                            className="w-full bg-slate-800 text-white font-bold px-4 py-2 rounded-xl outline-none border border-slate-600 focus:border-cyan-500 placeholder-slate-400 text-sm"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Tipo:</span>
                                        <select value={draftFilterType} onChange={e => setDraftFilterType(e.target.value)} className="bg-slate-800 text-white font-bold p-2 rounded-lg outline-none border border-slate-600 focus:border-cyan-500 text-xs">
                                            <option value="Tutti">Tutti</option>
                                            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Ordina:</span>
                                        <select value={draftSort} onChange={e => setDraftSort(e.target.value)} className="bg-slate-800 text-white font-bold p-2 rounded-lg outline-none border border-slate-600 focus:border-cyan-500 text-xs">
                                            <option value="default">Predefinito</option>
                                            <option value="alpha">A-Z</option>
                                            <option value="type">Per Tipo</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 2xl:grid-cols-11 gap-3 w-full flex-1 min-h-0 overflow-y-auto content-start custom-scrollbar p-2">
                                    {filteredDraftableChars.map(char => {
                                        const isSelected = myDraft.some(c => c.id === char.id);
                                        return (
                                            <div 
                                                key={char.id} 
                                                onMouseEnter={() => setDraftHoverInfo(char.id)} 
                                                onMouseLeave={() => { setDraftHoverInfo(null); draftLongPressRef.current = false; }}
                                                onTouchStart={() => {
                                                    draftLongPressRef.current = false;
                                                    draftPressTimerRef.current = setTimeout(() => {
                                                        draftLongPressRef.current = true;
                                                        setDraftHoverInfo(char.id);
                                                    }, 400); 
                                                }}
                                                onTouchEnd={(e) => {
                                                    clearTimeout(draftPressTimerRef.current);
                                                    if (draftLongPressRef.current) {
                                                        e.preventDefault();
                                                    } else {
                                                        setDraftHoverInfo(null);
                                                    }
                                                }}
                                                onTouchMove={() => {
                                                    clearTimeout(draftPressTimerRef.current);
                                                }}
                                                onClick={(e) => {
                                                    if (draftLongPressRef.current) {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        return; 
                                                    }
                                                    if (!isSelected) handlePick(char);
                                                }}
                                                className={`relative overflow-hidden bg-slate-900/80 backdrop-blur-md border rounded-2xl p-4 text-center transition-all duration-300 ${isSelected ? 'border-emerald-400 bg-emerald-900/30 scale-105 shadow-[0_0_15px_rgba(16,185,129,0.5)] opacity-50 grayscale' : 'border-slate-700/50 hover:border-cyan-500/50 hover:-translate-y-1 cursor-pointer shadow-lg'}`}
                                            >
                                                <img src={char.img} alt={char.name} className={`w-16 h-16 rounded-full object-cover mx-auto mb-3 border-2 ${isSelected ? 'border-emerald-400' : 'border-slate-600/50'}`} />
                                                <h4 className="font-bold text-sm mb-2 truncate text-slate-100">{char.name}</h4>
                                                <div className="flex flex-wrap gap-1 justify-center mb-3">
                                                    {char.types.map(t => (
                                                        <span key={t} className={`text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm uppercase ${TYPE_STYLES[t] || 'bg-gray-500'}`}>{t}</span>
                                                    ))}
                                                </div>
                                                <div className="w-full grid grid-cols-2 gap-1 text-[10px] font-mono bg-slate-950/50 p-2 rounded-xl border border-slate-800 mb-1">
                                                    <div className="text-emerald-400">HP: {char.maxHp}</div>
                                                    <div className="text-rose-400">ATK: {char.atk}</div>
                                                    <div className="text-blue-400">DEF: {char.def}</div>
                                                    <div className="text-amber-400">SPD: {char.spd}</div>
                                                </div>

                                                {isSelected && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-emerald-900/40 backdrop-blur-sm z-10">
                                                        <div className="bg-emerald-500 text-white rounded-full p-2 shadow-lg"><Unlock size={24}/></div>
                                                    </div>
                                                )}
                                                
                                                {draftHoverInfo === char.id && (
                                                    <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl p-4 overflow-y-auto custom-scrollbar z-20 flex flex-col text-left transition-opacity duration-300 opacity-100 rounded-2xl">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="font-bold text-amber-400">Statistiche</span>
                                                            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">HP: {char.maxHp}</span>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-1 text-[10px] text-center mb-3">
                                                            <div className="bg-slate-800/50 p-1 rounded border border-rose-900/50"><div className="text-rose-400 font-bold">ATK</div><div>{char.atk}</div></div>
                                                            <div className="bg-slate-800/50 p-1 rounded border border-blue-900/50"><div className="text-blue-400 font-bold">DEF</div><div>{char.def}</div></div>
                                                            <div className="bg-slate-800/50 p-1 rounded border border-amber-900/50"><div className="text-amber-400 font-bold">SPD</div><div>{char.spd}</div></div>
                                                        </div>
                                                        <div className="font-bold text-amber-400 mb-1 text-xs">Mosse</div>
                                                        <div className="space-y-1.5 overflow-y-auto custom-scrollbar flex-1 pr-1">
                                                            {char.moves.filter(Boolean).map((m, i) => (
                                                                <div key={i} className="text-[9px] bg-slate-800/50 p-1.5 rounded border border-slate-700/50">
                                                                    <div className="flex justify-between items-center mb-0.5">
                                                                        <span className="font-bold text-slate-200">{m.name}</span>
                                                                        <span className={`px-1 rounded text-[8px] ${TYPE_STYLES[m.type] || 'bg-gray-500'}`}>{m.type}</span>
                                                                    </div>
                                                                    <p className="text-slate-400 italic leading-tight line-clamp-2">{m.desc}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        );
    }
}
