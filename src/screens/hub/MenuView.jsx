import {MenuDashboard} from './MenuDashboard.jsx';
// Il menu originale resta disponibile come alternativa immediata alla nuova dashboard.
export function renderMenuView(ctx) {
const { BarChart, BookOpen, CHARACTERS, GridIcon, IS_PREVIEW, ImageIcon, Shield, ShoppingCart, Swords, Target, Trophy, Upload, Users, Wifi, appMode, getDefaultAvatar, getPlayerData, handleAvatarUpload, handleCreateRoguelikeCoop, handleCreateRoom, handleJoinRoom, handleLocalStart, handleSurvivalStart, handleVsCpuStart, onlineUsers, playerAvatarUrl, playerName, playerTitle, roguelikeState, roomIdInput, sessionId, setAppMode, setPlayerAvatarUrl, setPlayerName, setRoguelikeDraftChoices, setRoguelikeState, setRoomIdInput, setShowOnlinePlayers, setSystemAlert, startWithModeGuide } = ctx;
if (appMode === 'menu' && !ctx.useClassicMenu) return <MenuDashboard ctx={ctx}/>;
if (appMode === 'menu') {
            const playerData = getPlayerData();
            
            // Calcolo Leaderboard Live
            const me = {
                sessionId: sessionId,
                name: playerName || "Tu",
                avatar: playerAvatarUrl || getDefaultAvatar(playerName || "Tu"),
        title: playerTitle || "",
                wins: playerData.wins || 0,
                matches: playerData.matches || 0,
                isMe: true
            };
            const allForLeaderboard = playerName.trim() ? [...onlineUsers, me] : onlineUsers;
            const top5Users = allForLeaderboard.sort((a, b) => (b.wins || 0) - (a.wins || 0)).slice(0, 5);

            return (
                <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <button type="button" onClick={()=>ctx.onMenuStyleChange('new')}
                  className="fixed bottom-4 left-4 z-[90] px-3 py-2.5 text-xs font-black bg-indigo-700 hover:bg-indigo-600 border border-indigo-400 rounded-xl shadow-xl">
                  ✨ Prova il nuovo menu
                </button>
                <button onClick={()=>startWithModeGuide('online_players',()=>{ if(!playerName.trim()) setSystemAlert("Inserisci prima il tuo nome per vedere gli altri!"); else setShowOnlinePlayers(true); })} className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/50 text-cyan-400 font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] backdrop-blur-sm z-20 hover:-translate-y-0.5">
                    <Users size={18}/> Giocatori Online
                </button>
                
                <h1 className="text-6xl md:text-7xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 flex items-center gap-4 z-10 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] text-center leading-tight">
                    <Swords size={64} className="text-cyan-400 drop-shadow-lg hidden md:block" />
                    Multiverse RPG
                    <Swords size={64} className="text-purple-500 drop-shadow-lg hidden md:block" />
                </h1>
                <p className="text-slate-400 mb-12 text-center text-lg z-10 max-w-lg font-medium">Scegli i tuoi campioni. Domina il multiverso in tattiche battaglie a turni in diverse modalità!</p>
                
                {IS_PREVIEW && (
                    <div className="bg-amber-500/20 border border-amber-500 text-amber-400 font-bold px-6 py-2 rounded-xl mb-6 z-10 animate-pulse text-sm text-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                        🛠️ MODALITÀ ANTEPRIMA ATTIVA<br/>Tutti i personaggi sono temporaneamente sbloccati per i test!
                    </div>
                )}
                
                {/* --- TOP 5 ONLINE UMANI --- */}
                <div className="absolute top-20 right-6 w-72 bg-slate-900/80 backdrop-blur-xl border border-amber-500/50 rounded-2xl p-4 shadow-[0_0_30px_rgba(245,158,11,0.15)] hidden xl:block z-20 transition-all hover:scale-[1.02]">
                    <h3 className="text-amber-400 font-black flex items-center justify-between mb-4 border-b border-amber-500/30 pb-2 uppercase tracking-widest text-sm">
                        <span className="flex items-center gap-2"><Trophy size={18}/> Top 5 Online</span>
                        <span className="text-[10px] bg-amber-900/50 px-2 py-0.5 rounded text-amber-200 border border-amber-500/30 animate-pulse">Live</span>
                    </h3>
                    <div className="flex flex-col gap-2.5">
                        {top5Users.length === 0 ? (
                            <div className="text-xs text-slate-500 italic text-center py-4">Nessun giocatore online...</div>
                        ) : top5Users.map((p, i) => (
                            <div key={p.sessionId} className={`flex items-center gap-3 p-2 rounded-xl border transition-colors ${p.isMe ? 'bg-amber-900/40 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'bg-slate-950/60 border-slate-800 hover:border-slate-600'}`}>
                                <div className={`font-black text-xl w-6 text-center ${i === 0 ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-500' : 'text-slate-600'}`}>{i + 1}°</div>
                                <img src={p.avatar} className={`w-10 h-10 rounded-full border-2 ${p.isMe ? 'border-amber-400' : (i===0 ? 'border-yellow-400' : i===1 ? 'border-slate-300' : i===2 ? 'border-orange-500' : 'border-slate-600')} object-cover bg-slate-900 shrink-0`} />
                                <div className="flex-1 min-w-0">
                                    <div className={`font-bold text-xs truncate ${p.isMe ? 'text-amber-300' : 'text-slate-200'}`}>{p.name}</div>
                                    {p.title && <div className="text-[10px] text-amber-300 font-semibold truncate">✦ {p.title}</div>}
                                    <div className="text-[10px] text-slate-400 font-medium mt-0.5 flex justify-between">
                                        <span>Vittorie:</span> <span className="text-emerald-400 font-black">{p.wins || 0}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* --------------------------- */}
                
                <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl w-full max-w-md border border-slate-700/50 shadow-[0_0_50px_rgba(0,0,0,0.5)] space-y-5 z-10">
                    <div>
                        <label className="block text-xs uppercase tracking-widest font-bold text-slate-400 mb-2">Tuo Nome</label>
                        <input type="text" value={playerName} onChange={e => setPlayerName(e.target.value)} className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" placeholder="Inserisci il tuo nome..." />
                        {playerTitle && <div className="text-center mt-2 text-amber-300 font-black text-sm tracking-wide">✦ {playerTitle} ✦</div>}
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-widest font-bold text-slate-400 mb-2 flex items-center gap-2"><ImageIcon size={14}/> URL Avatar o Carica da Tablet</label>
                        <div className="flex gap-3 items-center">
                            <img src={playerAvatarUrl || getDefaultAvatar(playerName)} 
                                 onError={(e) => { e.target.onerror = null; e.target.src = getDefaultAvatar(playerName); }}
                                 className="w-14 h-14 rounded-full border-2 border-slate-600 object-cover bg-slate-900 shrink-0 shadow-inner" 
                                 alt="Preview" />
                            <div className="flex-1 flex flex-col gap-2">
                                <input type="text" value={playerAvatarUrl} onChange={e => setPlayerAvatarUrl(e.target.value)} className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-sm" placeholder="Es: https://.../img.jpg" />
                                <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-xs font-bold py-2 px-3 rounded-lg text-center border border-slate-600 transition-colors text-slate-300 flex items-center justify-center gap-2 shadow-md">
                                    <Upload size={14} /> Carica Immagine dal Dispositivo
                                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800 space-y-4">
                        <button onClick={()=>startWithModeGuide('create_room',handleCreateRoom)} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:-translate-y-0.5">
                             <Wifi size={20}/> Crea Stanza Online (Host)
                        </button>
                        <div className="flex gap-2">
                            <input type="text" value={roomIdInput} onChange={e => setRoomIdInput(e.target.value)} placeholder="Codice Stanza" className="w-1/2 bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2 text-white text-center font-mono uppercase focus:border-purple-500 outline-none transition-all" />
                            <button onClick={()=>startWithModeGuide('join_room',handleJoinRoom)} className="w-1/2 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold py-2 rounded-xl transition-all shadow-lg hover:-translate-y-0.5">
                                Unisciti
                            </button>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800">
                         <button onClick={()=>startWithModeGuide('campaign',()=>setAppMode('campaign_select'))} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:-translate-y-0.5 mb-3">
                             <BookOpen size={20}/> Modalità Campagne
                         </button>
                         <button onClick={()=>startWithModeGuide('vs_cpu',handleVsCpuStart)} className="w-full mb-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:-translate-y-0.5">
                             <Target size={20}/> Gioca vs CPU (Bot IA)
                        </button>
                        
                        {/* --- PULSANTI ROGUELIKE --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <button onClick={() => startWithModeGuide('rogue_solo',()=>{
                                if (roguelikeState.isStarted && roguelikeState.roster.length > 0) {
                                    setAppMode('roguelike_map');
                                } else {
                                    const available = CHARACTERS.filter(c => !c.isSummonOnly && !c.isSecretUnlock);
                                    const shuffled = [...available].sort(() => 0.5 - Math.random());
                                    setRoguelikeDraftChoices(shuffled.slice(0, 6)); // Scegli 3 tra 6 casuali
                                    setRoguelikeState({ isStarted: true, runId: 'run-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2), floor: 1, roster: [], rosterStats: {}, maxFloor: 50, coins: 0, inventory: { pozione: 1 }, isMerchantNext: false, recruitBonus: 0.02, relics: [], encounteredEnemies: [] });
                                    setAppMode('roguelike_draft');
                                }
                            })} className="relative w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:-translate-y-0.5">
                                 <Trophy size={20}/> Roguelike (Solo)
                                 {roguelikeState.isStarted && roguelikeState.roster.length > 0 && (
                                     <div className="absolute top-0 right-0 -mt-2 -mr-2 text-[10px] font-black bg-black/80 border border-fuchsia-400 px-2 py-1 rounded-lg text-fuchsia-200">
                                         P. {roguelikeState.floor}
                                     </div>
                                 )}
                            </button>

                            <button onClick={()=>startWithModeGuide('rogue_coop',handleCreateRoguelikeCoop)} className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:-translate-y-0.5">
                                 <Users size={20}/> Roguelike (Co-op)
                            </button>
                        </div>
                        {/* ------------------------------- */}

                        {/* --- AGGIUNTO IL PULSANTE SOPRAVVIVENZA --- */}
                         <button onClick={()=>startWithModeGuide('survival',handleSurvivalStart)} className="relative w-full mb-3 bg-gradient-to-r from-violet-700 to-purple-700 hover:from-violet-600 hover:to-purple-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:-translate-y-0.5">
                             <Shield size={20}/> Modalità Sopravvivenza (Infinita)
                             {playerData.maxSurvivalRound > 0 && (
                                 <div className="absolute right-4 text-xs font-black bg-black/40 border border-violet-400/50 px-2 py-1 rounded-lg text-violet-200 shadow-inner">
                                     Max: {playerData.maxSurvivalRound}
                                 </div>
                             )}
                        </button>
                        {/* ------------------------------------------ */}

                         <button onClick={()=>startWithModeGuide('local',handleLocalStart)} className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5">
                             <Users size={20}/> Gioca in Locale (Stesso PC)
                        </button>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <button onClick={()=>startWithModeGuide('catalog',()=>setAppMode('catalog'))} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all hover:-translate-y-0.5 text-sm shadow-md">
                                 <BookOpen size={20}/> Catalogo
                            </button>
                            <button onClick={()=>startWithModeGuide('type_chart',()=>setAppMode('type_chart'))} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all hover:-translate-y-0.5 text-sm shadow-md">
                                 <GridIcon size={20}/> Tabella Tipi
                            </button>
                            <button onClick={()=>setAppMode('collection')} className="col-span-2 bg-gradient-to-r from-cyan-800 to-indigo-800 hover:from-cyan-700 hover:to-indigo-700 border border-cyan-500/50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 text-sm shadow-md">
                                 ✨ Collezione Multimon · Ottenuti e mancanti
                            </button>
                        </div>
                        <button type="button" onClick={()=>startWithModeGuide('chests',()=>{if(!playerName.trim())setSystemAlert('Inserisci il tuo nome per aprire i bauli!');else setAppMode('chests');})}
                          className="w-full mt-3 bg-gradient-to-r from-amber-800 via-yellow-700 to-amber-900 border border-amber-400/70 hover:brightness-110 rounded-xl py-4 text-white font-black shadow-[0_0_24px_rgba(251,191,36,.16)] flex justify-center items-center gap-3 transition-all">
                          <span className="h-8 w-9 rounded-md bg-gradient-to-br from-yellow-300 via-amber-700 to-slate-900 border-2 border-yellow-200/60 shadow-inner relative">
                            <span className="absolute left-1/2 -translate-x-1/2 top-2 w-2.5 h-3 rounded-sm bg-cyan-300 border border-yellow-200"/>
                            <span className="absolute inset-x-0 top-0.5 border-t-2 border-yellow-200/60"/>
                          </span>
                          <span>Bauli Campagna <span className="block text-xs text-amber-100/85 font-semibold">{playerData.chests?.pending?.length||0} bauli da aprire · 2 premi ciascuno</span></span>
                        </button>
                        <button type="button" onClick={()=>startWithModeGuide('power_chests',()=>{if(!playerName.trim())setSystemAlert('Inserisci il tuo nome per aprire le Casse Potenza!');else setAppMode('power_chests');})}
                          className="w-full mt-3 bg-gradient-to-r from-cyan-800 via-blue-800 to-indigo-900 border border-cyan-400/65 hover:brightness-110 rounded-xl py-4 text-white font-black shadow-[0_0_24px_rgba(34,211,238,.15)] flex justify-center items-center gap-3 transition-all">
                          <span aria-hidden="true" className="h-9 w-10 rounded-lg bg-gradient-to-br from-cyan-300 via-blue-700 to-indigo-950 border-2 border-cyan-200/60 shadow-inner relative">
                            <span className="absolute left-1/2 -translate-x-1/2 top-2 w-3 h-4 rotate-45 bg-cyan-200 border border-white/70 shadow-[0_0_8px_rgba(103,232,249,.7)]"/>
                          </span>
                          <span>Casse Potenza <span className="block text-xs text-cyan-100/85 font-semibold">{playerData.roguelikePower?.pending?.length||0} disponibili · 3–18 Punti Forza in base al piano</span></span>
                        </button>
                        <button type="button" onClick={()=>setAppMode('combat_lab')}
                         className="w-full mt-3 bg-gradient-to-r from-sky-800 via-cyan-800 to-violet-800 hover:brightness-110 text-white font-black py-4 rounded-xl border border-cyan-400/70 shadow-[0_0_24px_rgba(34,211,238,.18)] flex items-center justify-center gap-3 transition-all">
                         <span className="text-2xl">🧪</span>
                         <span>Laboratorio di Combattimento
                           <span className="block text-xs font-semibold text-cyan-100/85">Prova gratis squadre, status, CPU, danni e passive · Nessun premio</span>
                         </span>
                        </button>
                        <button onClick={()=>startWithModeGuide('strength_lab',()=>{ if(!playerName.trim()) setSystemAlert("Inserisci il tuo nome per accedere al Laboratorio!"); else setAppMode('strength_lab'); })}
                            className="w-full mt-3 bg-gradient-to-r from-cyan-700 via-indigo-700 to-violet-800 hover:from-cyan-600 hover:to-violet-700 text-white font-black py-4 rounded-xl border border-cyan-400/60 shadow-[0_0_24px_rgba(34,211,238,.20)] flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5">
                            <span className="text-2xl">⚡</span>
                            <span>Laboratorio di Potenziamento <span className="block text-xs font-semibold text-cyan-100/85">Punti Forza: {playerData.strengthPoints||0} · ATK / DEF / VEL</span></span>
                        </button>
                        <div className="grid grid-cols-2 gap-3 mt-3">
                            <button onClick={()=>startWithModeGuide('shop',()=>{ if(!playerName.trim()) setSystemAlert("Inserisci il tuo nome per usare lo Shop!"); else setAppMode('shop'); })} className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 text-sm shadow-md">
                                 <ShoppingCart size={20}/> Negozio
                            </button>
                            <button onClick={()=>startWithModeGuide('stats',()=>{ if(!playerName.trim()) setSystemAlert("Inserisci il tuo nome per vedere le tue statistiche!"); else setAppMode('stats'); })} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 text-sm shadow-md">
                                 <BarChart size={20}/> Statistiche
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
