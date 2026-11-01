// Schermata estratta senza alterare la struttura JSX originale.
export function renderRoguelikeMapView(ctx) {
const { CHARACTERS, ChevronRight, Coins, Heart, ITEMS_DB, LogOut, Swords, Users, appMode, initialGameState, playerName, renderHealthBar, roguelikeState, setAppMode, setGameState, setPlayerRole, setRoguelikeState, setSystemAlert } = ctx;
if (appMode === 'roguelike_map') {
        const isBossFloor = roguelikeState.floor % 10 === 0;
        const isFinalBossFloor = roguelikeState.floor === roguelikeState.maxFloor;
        const isRestFloor = roguelikeState.floor % 5 === 0 && !isBossFloor && !isFinalBossFloor;

        // --- SCHERMATA MERCANTE VAGABONDO ---
        if (roguelikeState.isMerchantNext) {
            const handleBuyRevive = (id) => {
                if (roguelikeState.coins >= 50) {
                    const maxHp = CHARACTERS.find(c=>c.id===id).maxHp;
                    setRoguelikeState(p => ({ ...p, coins: p.coins - 50, rosterStats: { ...p.rosterStats, [id]: Math.floor(maxHp * 0.5) } }));
                } else setSystemAlert("Monete insufficienti!");
            };
            const handleBuyHeal = (id) => {
                if (roguelikeState.coins >= 15) {
                    const maxHp = CHARACTERS.find(c=>c.id===id).maxHp;
                    const newHp = Math.min(maxHp, roguelikeState.rosterStats[id] + Math.floor(maxHp * 0.5));
                    setRoguelikeState(p => ({ ...p, coins: p.coins - 15, rosterStats: { ...p.rosterStats, [id]: newHp } }));
                } else setSystemAlert("Monete insufficienti!");
            };
            const handleBuyFullHealAll = () => {
                if (roguelikeState.coins >= 80) {
                    const newStats = { ...roguelikeState.rosterStats };
                    roguelikeState.roster.forEach(id => {
                        if (newStats[id] > 0) newStats[id] = CHARACTERS.find(c=>c.id===id).maxHp;
                    });
                    setRoguelikeState(p => ({ ...p, coins: p.coins - 80, rosterStats: newStats }));
                } else setSystemAlert("Monete insufficienti!");
            };
            const handleBuyItem = (itemId, price) => {
                if (roguelikeState.coins >= price) {
                    setRoguelikeState(p => ({ ...p, coins: p.coins - price, inventory: { ...(p.inventory || {}), [itemId]: ((p.inventory || {})[itemId] || 0) + 1 } }));
                } else setSystemAlert("Monete insufficienti!");
            };

            return (
                <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-900/40 via-slate-950 to-black pointer-events-none opacity-60"></div>
                    
                    <h2 className="text-4xl font-black mb-2 mt-8 text-yellow-400 z-10 flex items-center gap-3">🛒 Mercante Vagabondo</h2>
                    <div className="flex items-center gap-2 mb-8 bg-black/60 px-6 py-2 rounded-xl border border-yellow-500/50 z-10 shadow-lg">
                        <Coins className="text-yellow-400" size={24} />
                        <span className="font-bold text-yellow-400 text-xl">{roguelikeState.coins || 0} Monete Spedizione</span>
                    </div>

                    <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 z-10">
                        {/* Cure e Rianimazioni */}
                        <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-700/50 shadow-xl">
                            <h3 className="text-xl font-bold mb-4 text-emerald-400 flex items-center justify-between">
                                Reparto Medico
                                <button onClick={handleBuyFullHealAll} className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1 transition-colors">Cura Tutti (100%) <Coins size={12}/> 80</button>
                            </h3>
                            <div className="space-y-3">
                                {roguelikeState.roster.map(id => {
                                    const char = CHARACTERS.find(c=>c.id===id);
                                    const hp = roguelikeState.rosterStats[id];
                                    const isDead = hp <= 0;
                                    const isFull = hp >= char.maxHp;
                                    return (
                                        <div key={id} className={`bg-slate-800 p-3 rounded-xl border ${isDead ? 'border-rose-900' : 'border-slate-600'} flex items-center gap-3 shadow-sm`}>
                                            <img src={char.img} className={`w-10 h-10 rounded-full object-cover border border-slate-500 ${isDead ? 'grayscale' : ''}`} />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-sm truncate">{char.name}</div>
                                                {renderHealthBar(hp, char.maxHp)}
                                            </div>
                                            {isDead ? (
                                                <button onClick={() => handleBuyRevive(id)} className="bg-rose-600 hover:bg-rose-500 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition-colors"><Heart size={12}/> Rianima - 50 <Coins size={10}/></button>
                                            ) : (
                                                <button disabled={isFull} onClick={() => handleBuyHeal(id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition-colors ${isFull ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500'}`}><Heart size={12}/> Cura 50% - 15 <Coins size={10}/></button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Oggetti Zaino */}
                        <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-700/50 shadow-xl">
                            <h3 className="text-xl font-bold mb-4 text-amber-400">Scorte per la Lotta</h3>
                            <p className="text-xs text-slate-400 mb-4">Questi oggetti verranno inseriti nel tuo zaino e potrai usarli in battaglia!</p>
                            <div className="grid grid-cols-1 gap-3">
                                {['pozione', 'cura_totale', 'resurrezione'].map(itemId => {
                                    const item = ITEMS_DB[itemId];
                                    const price = itemId === 'pozione' ? 15 : (itemId === 'cura_totale' ? 30 : 50);
                                    return (
                                        <div key={itemId} className="bg-slate-800 p-3 rounded-xl border border-amber-900/50 flex justify-between items-center shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl">{item.icon}</span>
                                                <div>
                                                    <div className="font-bold text-sm text-amber-200">{item.name}</div>
                                                    <div className="text-[10px] text-slate-400">Nello zaino: {(roguelikeState.inventory || {})[itemId] || 0}</div>
                                                </div>
                                            </div>
                                            <button onClick={() => handleBuyItem(itemId, price)} className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 text-white shadow-md transition-all">Compra - {price} <Coins size={10}/></button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <button onClick={() => setRoguelikeState(p => ({ ...p, isMerchantNext: false }))} className="mt-10 bg-blue-600 hover:bg-blue-500 px-10 py-4 rounded-full font-black text-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:-translate-y-1 z-10 flex items-center gap-2">
                        Continua la Spedizione <ChevronRight />
                    </button>
                </div>
            );
        }
        // ------------------------------------

        const startRoguelikeCombat = () => {
            const myTeam = roguelikeState.roster.map(id => {
                const base = CHARACTERS.find(c => c.id === id);
                return { ...JSON.parse(JSON.stringify(base)), hp: roguelikeState.rosterStats[id], statuses: [], consecutiveProtect: 0, baseAtk: base.atk, baseDef: base.def, baseSpd: base.spd, moves: base.moves.filter(Boolean).map(m => ({ ...m, remainingUses: m.maxUses !== undefined ? m.maxUses : null })) };
            });

            // Generazione Nemici (Scala in base al piano)
            let enemyCount = 1;
            if (roguelikeState.floor >= 15) enemyCount = 2;
            if (roguelikeState.floor >= 35) enemyCount = 3;
            if (isBossFloor) enemyCount = 1; // 1 Solo nemico se è il Boss del piano

            let availableEnemies = CHARACTERS.filter(c => !c.isSummonOnly && (isFinalBossFloor ? c.price === 350 || c.isSecretUnlock || c.id === 'cell' || c.id === 'trigon' || c.id === 'gaster' : !c.isSecretUnlock));
            
            // --- EVITA NEMICI GIÀ INCONTRATI ---
            const unencountered = availableEnemies.filter(c => !(roguelikeState.encounteredEnemies || []).includes(c.id));
            if (unencountered.length >= enemyCount) {
                availableEnemies = unencountered;
            }
            
            const shuffledEnemies = [...availableEnemies].sort(() => 0.5 - Math.random());
            
            const enemyTeam = shuffledEnemies.slice(0, enemyCount).map(base => {
                // Nuovo sistema a scaglioni: 0% per 1-10, 5% per 11-20, 10% per 21-30, ecc.
                const tier = Math.floor((roguelikeState.floor - 1) / 10);
                const scale = 1 + (tier * 0.05); 
                
                let e = { ...JSON.parse(JSON.stringify(base)), hp: Math.floor(base.maxHp * scale), maxHp: Math.floor(base.maxHp * scale), atk: Math.floor(base.atk * scale), def: Math.floor(base.def * scale), baseAtk: Math.floor(base.atk * scale), baseDef: Math.floor(base.def * scale), statuses: [], consecutiveProtect: 0, moves: base.moves.filter(Boolean).map(m => ({ ...m, remainingUses: m.maxUses !== undefined ? m.maxUses : null })) };
                
                if (isFinalBossFloor) {
                    e.atk = Math.floor(e.atk * 1.5); e.hp *= 2; e.maxHp *= 2; e.imageFilter = 'drop-shadow(0 0 20px rgba(220,38,38,1))';
                    e.statuses.push({ type: 'Protetto', turns: 1 });
                } else if (isBossFloor) {
                    // Mini-Boss ogni 10 piani
                    e.atk = Math.floor(e.atk * 1.2); e.hp = Math.floor(e.hp * 1.5); e.maxHp = Math.floor(e.maxHp * 1.5);
                    e.imageFilter = 'drop-shadow(0 0 15px rgba(234,179,8,1))';
                }
                return e;
            });

            const state = initialGameState();
            state.gameMode = 'classica';
            state.isRoguelikeBattle = true; 
            
            // --- FIX BUG ROGUELIKE: Schiera solo i personaggi VIVI in campo all'inizio! ---
            let aliveIndices = [];
            myTeam.forEach((c, i) => { if (c.hp > 0) aliveIndices.push(i); });
            state.settings = { teamSize: myTeam.length, fieldSize: Math.min(4, Math.max(aliveIndices.length, enemyTeam.length)) };
            
            state.players = { p1: playerName || "Spedizione", p2: isFinalBossFloor ? "Guardiano Finale" : (isBossFloor ? "Boss del Piano" : "Abitanti del Piano") };
            state.playerAvatars = { p1: myTeam[0].img, p2: enemyTeam[0].img };
            state.isBot = { p1: false, p2: true };
            state.teams = { p1: myTeam, p2: enemyTeam };
            state.field = { 
                p1: aliveIndices.slice(0, state.settings.fieldSize), 
                p2: enemyTeam.slice(0, state.settings.fieldSize).map((_, i) => i) 
            };
            state.inventory.p1 = JSON.parse(JSON.stringify(roguelikeState.inventory || {})); // Inietta l'inventario locale
            state.field.p1.forEach(idx => { if(state.teams.p1[idx]) state.teams.p1[idx].revealed = true; });
            state.field.p2.forEach(idx => { if(state.teams.p2[idx]) state.teams.p2[idx].revealed = true; });
            state.status = 'pre_battle';
            setGameState(state);
            setPlayerRole('p1');
            setAppMode('local_room');
        };

        const handleRest = () => {
            const newStats = { ...roguelikeState.rosterStats };
            roguelikeState.roster.forEach(id => {
                const max = CHARACTERS.find(c=>c.id===id).maxHp;
                if (newStats[id] > 0) { // Cura solo chi è vivo
                    newStats[id] = Math.min(max, newStats[id] + Math.floor(max * 0.4)); // Cura 40%
                }
            });
            setRoguelikeState(p => ({ ...p, rosterStats: newStats, floor: p.floor + 1 }));
        };

        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <button onClick={() => { setRoguelikeState({ isStarted: false, roster: [] }); setAppMode('menu'); }} className="absolute top-6 left-6 flex items-center gap-2 text-rose-400 hover:text-white transition-colors bg-black/50 px-4 py-2 rounded-xl backdrop-blur-sm border border-rose-500/50 z-20 font-bold">
                     <LogOut size={16} /> Abbandona Run
                </button>
                
                <h2 className="text-4xl font-black mb-2 text-fuchsia-400">Piano {roguelikeState.floor} / {roguelikeState.maxFloor}</h2>
                <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-1.5 rounded-xl border border-yellow-500/30">
                        <Coins className="text-yellow-400" size={16} />
                        <span className="font-bold text-yellow-400 text-sm">{roguelikeState.coins || 0} Monete</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-1.5 rounded-xl border border-fuchsia-500/30">
                        <Users className="text-fuchsia-400" size={16} />
                        <span className="font-bold text-fuchsia-400 text-sm">Reclutamento: {Math.round((0.30 + (roguelikeState.recruitBonus !== undefined ? roguelikeState.recruitBonus : (roguelikeState.floor * 0.02))) * 100)}%</span>
                    </div>
                </div>
                
                <div className="w-full max-w-2xl bg-slate-900/80 p-6 rounded-3xl border border-slate-700/50 mb-8 flex gap-4 overflow-x-auto custom-scrollbar">
                    {roguelikeState.roster.map(id => {
                        const char = CHARACTERS.find(c=>c.id===id);
                        const hp = roguelikeState.rosterStats[id];
                        return (
                            <div key={id} className={`flex-1 min-w-[150px] bg-slate-800 p-4 rounded-xl flex flex-col items-center border ${hp <= 0 ? 'border-rose-900 grayscale' : 'border-slate-600'}`}>
                                <img src={char.img} className="w-16 h-16 rounded-full object-cover mb-2 border-2 border-slate-500" />
                                <span className="font-bold text-sm truncate w-full text-center">{char.name}</span>
                                {renderHealthBar(hp, char.maxHp)}
                            </div>
                        );
                    })}
                </div>

                <div className="flex gap-6">
                    {isRestFloor ? (
                        <div className="bg-emerald-900/40 border border-emerald-500 p-8 rounded-3xl text-center max-w-sm">
                            <h3 className="text-2xl font-black text-emerald-400 mb-2">Accampamento</h3>
                            <p className="text-slate-300 mb-6">Un'area sicura. Cura il 40% dei PS a tutti i membri del team ancora in vita.</p>
                            <button onClick={handleRest} className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 px-8 rounded-full w-full transition-all">Riposa e Prosegui</button>
                        </div>
                    ) : (
                        <div className={`bg-rose-900/40 border border-rose-500 p-8 rounded-3xl text-center max-w-sm`}>
                            <h3 className="text-2xl font-black text-rose-400 mb-2">{isFinalBossFloor ? 'Stanza del Super Boss' : (isBossFloor ? 'Stanza del Boss' : 'Stanza di Combattimento')}</h3>
                            <p className="text-slate-300 mb-6">{isFinalBossFloor ? 'Il guardiano finale ti attende.' : (isBossFloor ? 'Un potente nemico blocca il passaggio verso i prossimi piani.' : 'Dei nemici bloccano la via. Preparati a lottare.')}</p>
                            <button onClick={startRoguelikeCombat} className="bg-rose-600 hover:bg-rose-500 text-white font-black py-4 px-8 rounded-full w-full transition-all flex items-center justify-center gap-2"><Swords size={20}/> Entra in Battaglia</button>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}
