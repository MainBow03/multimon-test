// Schermata estratta senza alterare la struttura JSX originale.
export function renderCampaignMapView(ctx) {
const { ArrowLeft, CHARACTERS, Coins, TYPE_STYLES, Users, activeCampaignId, activeMission, activeSector, appMode, campaignState, loadCampaign, renderHealthBar, setAppMode, setCampaignDialogueIdx, setCampaignSelectedTeam, setCampaignState } = ctx;
if (appMode === 'campaign_map') {
        const sector = activeSector;
        const mission = activeMission;
        
        // Calcolo per l'avviso salute
        const aliveHeroes = campaignState.roster.filter(id => campaignState.rosterStats[id] > 0);
        const totalHpPercentage = aliveHeroes.reduce((acc, id) => acc + (campaignState.rosterStats[id] / CHARACTERS.find(c=>c.id===id).maxHp), 0) / Math.max(1, aliveHeroes.length);
        const lowHealthWarning = aliveHeroes.length > 0 && totalHpPercentage < 0.4;
        
        return (
            <div className={`min-h-screen flex flex-col p-6 text-white ${sector.bg} relative overflow-hidden`}>
                <button onClick={() => setAppMode('menu')} className="absolute top-6 left-6 flex items-center gap-2 text-slate-300 hover:text-white transition-colors bg-black/50 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20 z-20">
                     <ArrowLeft size={20} /> Abbandona Campagna
                </button>
                <button onClick={() => { 
                    setCampaignSelectedTeam([]); // FIX: Svuota la squadra
                    const freshState = loadCampaign(activeCampaignId);
                    freshState.isStarted = false;
                    setCampaignState(freshState);
                    localStorage.removeItem(`multiverse_rpg_campaign_save_${activeCampaignId}`);
                    setAppMode('menu'); 
                }} className="absolute top-6 right-6 flex items-center gap-2 text-rose-400 hover:text-white transition-colors bg-black/50 px-4 py-2 rounded-xl backdrop-blur-sm border border-rose-500/50 z-20 text-sm font-bold shadow-lg">
                     Resetta Progressi
                </button>
                <div className="flex justify-center items-center bg-black/50 p-4 rounded-2xl mb-4 backdrop-blur-md border border-white/10 mt-14 max-w-4xl mx-auto w-full relative">
                    <div className="absolute -top-3 left-4 bg-slate-900 border border-slate-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-slate-400">
                        Difficoltà: <span className={campaignState.difficulty === 'Insane' ? 'text-rose-400' : 'text-blue-400'}>{campaignState.difficulty === 'Insane' ? 'Folle' : 'Normale'}</span>
                    </div>
                    <div className="flex-1 text-center">
                        <h2 className="text-3xl font-black text-emerald-400">{sector.name}</h2>
                        <p className="text-slate-300 text-sm">{sector.description}</p>
                        
                        {/* BARRA DI PROGRESSO SETTORE */}
                        <div className="flex justify-center items-center gap-2 mt-3">
                            {sector.missions.map((m, i) => (
                                <div key={i} className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full border-2 ${i < campaignState.missionIdx ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : i === campaignState.missionIdx ? 'bg-yellow-400 border-yellow-200 animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.8)]' : 'bg-slate-800 border-slate-600'}`} title={`Missione ${i+1}`}></div>
                                    {i < sector.missions.length - 1 && <div className={`w-4 h-0.5 ${i < campaignState.missionIdx ? 'bg-emerald-500/50' : 'bg-slate-700'}`}></div>}
                                </div>
                            ))}
                            <div className="flex items-center ml-1">
                                <div className="w-4 h-0.5 bg-slate-700"></div>
                                <div className={`w-4 h-4 rounded border-2 rotate-45 ml-1 ${campaignState.missionIdx >= sector.missions.length ? 'bg-amber-500 border-amber-300' : 'bg-slate-800 border-slate-600'}`} title="Accampamento / Negozio"></div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-xl border border-yellow-500/50 absolute right-8">
                        <Coins className="text-yellow-400" size={24} />
                        <span className="font-bold text-yellow-400 text-xl">{campaignState.coins}</span>
                    </div>
                </div>
                
                {lowHealthWarning && (
                    <div className="max-w-4xl mx-auto w-full bg-rose-900/40 border border-rose-500/50 text-rose-200 p-2 rounded-xl text-center text-sm font-bold animate-pulse mb-4">
                        ⚠️ Attenzione: La salute media della squadra è molto bassa! Sfrutta i curatori o sii cauto!
                    </div>
                )}
                
                <div className="flex-1 flex flex-col md:flex-row gap-8 max-w-6xl w-full mx-auto">
                    <div className="flex-1 bg-black/40 rounded-3xl p-8 border border-white/10 flex flex-col justify-center items-center text-center relative">
                        <h3 className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-2">Prossima Missione</h3>
                        <h1 className="text-5xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">{mission.title}</h1>
                        <div className="flex flex-col items-center justify-center gap-4 mb-8 bg-black/30 p-4 rounded-2xl w-full">
                            <div className="flex items-center justify-center gap-4">
                                <span className="text-slate-400 font-bold uppercase tracking-widest text-sm mr-2">Boss:</span>
                                {(() => {
                                    let activeBosses = mission.isAnomaly && mission.id === 'm12_5' && campaignState.anomalyTargets && campaignState.anomalyTargets.length > 0 ? campaignState.anomalyTargets : mission.boss;
                                    if (mission.isAnomaly && mission.id === 'm12_5' && activeBosses.includes('dynamic_anomaly_1')) activeBosses = ['scheletro'];
                                    return activeBosses.map((bId, idx) => {
                                        const b = CHARACTERS.find(c=>c.id===bId);
                                        return b ? <img key={`${bId}-${idx}`} src={b.img} className={`w-16 h-16 rounded-full border-2 ${mission.isAnomaly ? 'border-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.8)] filter sepia-[0.3] hue-rotate-[280deg]' : 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]'} object-cover`} title={b.name} alt={b.name} /> : null;
                                    });
                                })()}
                            </div>
                            
                            {/* ANTEPRIMA TIPI BOSS */}
                            <div className="flex gap-2 justify-center flex-wrap mt-1">
                                {(() => {
                                    let activeBosses = mission.isAnomaly && mission.id === 'm12_5' && campaignState.anomalyTargets && campaignState.anomalyTargets.length > 0 ? campaignState.anomalyTargets : mission.boss;
                                    if (mission.isAnomaly && mission.id === 'm12_5' && activeBosses.includes('dynamic_anomaly_1')) activeBosses = ['scheletro'];
                                    
                                    const allTypes = new Set();
                                    activeBosses.forEach(bId => {
                                        const b = CHARACTERS.find(c=>c.id===bId);
                                        if (b) b.types.forEach(t => allTypes.add(t));
                                    });
                                    
                                    return Array.from(allTypes).map(t => (
                                        <span key={t} className={`text-[10px] font-black px-2 py-0.5 rounded shadow-sm uppercase ${TYPE_STYLES[t] || 'bg-gray-500'}`}>{t}</span>
                                    ));
                                })()}
                            </div>
                        </div>
                        <button onClick={() => { setCampaignDialogueIdx(0); setAppMode('campaign_dialogue'); }} className="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-xl font-bold text-xl flex items-center gap-2 shadow-lg hover:-translate-y-1 transition-all">Avvia Missione <ArrowLeft className="rotate-180"/></button>
                    </div>
                    
                    <div className="w-full md:w-1/3 bg-black/40 rounded-3xl p-6 border border-white/10 flex flex-col">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-emerald-400"><Users size={20}/> La Tua Resistenza</h3>
                        <div className="space-y-3 overflow-y-auto max-h-[400px] custom-scrollbar pr-2 flex-1">
                            {campaignState.roster.map(id => {
                                const char = CHARACTERS.find(c=>c.id===id);
                                const hp = campaignState.rosterStats[id];
                                if(!char) return null;
                                return (
                                    <div key={id} className={`bg-slate-900/80 p-3 rounded-xl border ${hp <= 0 ? 'border-rose-900 grayscale opacity-75' : 'border-slate-700/50'} flex items-center gap-3`}>
                                        <img src={char.img} className="w-12 h-12 rounded-full border border-slate-600 object-cover" />
                                        <div className="flex-1">
                                            <div className="font-bold text-sm truncate">{char.name} {hp <= 0 && <span className="text-rose-500 text-[10px] ml-1">(Esausto)</span>}</div>
                                            {renderHealthBar(hp, char.maxHp)}
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
