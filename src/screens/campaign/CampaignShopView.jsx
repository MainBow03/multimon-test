// Schermata estratta senza alterare la struttura JSX originale.
export function renderCampaignShopView(ctx) {
const { CHARACTERS, Coins, Heart, appMode, campaignState, renderHealthBar, setAppMode, setCampaignState, setSystemAlert } = ctx;
if (appMode === 'campaign_shop') {
        const buyFullHeal = () => {
            if (campaignState.coins >= 600) {
                const newStats = {...campaignState.rosterStats};
                campaignState.roster.forEach(id => {
                    newStats[id] = CHARACTERS.find(c=>c.id===id).maxHp;
                });
                setCampaignState(p => ({...p, coins: p.coins - 600, rosterStats: newStats}));
            } else {
                setSystemAlert("Non hai abbastanza monete!");
            }
        };

        const buyRevive = (id) => {
            if (campaignState.coins >= 100) {
                const newStats = {...campaignState.rosterStats};
                const maxHp = CHARACTERS.find(c=>c.id===id).maxHp;
                newStats[id] = Math.floor(maxHp * 0.5);
                setCampaignState(p => ({...p, coins: p.coins - 100, rosterStats: newStats}));
            } else {
                setSystemAlert("Non hai abbastanza monete!");
            }
        };

        const buyPotion = (id) => {
            if (campaignState.coins >= 50) {
                const newStats = {...campaignState.rosterStats};
                const maxHp = CHARACTERS.find(c=>c.id===id).maxHp;
                newStats[id] = Math.min(maxHp, newStats[id] + Math.floor(maxHp * 0.5));
                setCampaignState(p => ({...p, coins: p.coins - 50, rosterStats: newStats}));
            } else {
                setSystemAlert("Non hai abbastanza monete!");
            }
        };

        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/40 via-amber-950 to-black pointer-events-none opacity-80"></div>
                
                {/* Animazione Fuoco di bivacco nello sfondo */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-9xl opacity-10 animate-pulse pointer-events-none blur-sm filter">🔥</div>

                <div className="bg-slate-900/90 border border-orange-500/50 p-8 rounded-3xl max-w-2xl w-full text-center shadow-[0_0_50px_rgba(249,115,22,0.15)] z-10 max-h-[95vh] flex flex-col">
                    <div className="shrink-0">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <span className="text-4xl">⛺</span>
                            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">Accampamento</h2>
                            <span className="text-4xl animate-pulse">🔥</span>
                        </div>
                        <p className="text-orange-200/70 text-sm mb-4 font-medium">Riposa, cura le ferite e organizza la squadra prima del prossimo settore.</p>
                        
                        <div className="flex items-center justify-center gap-3 mb-6 text-xl font-black bg-black/40 py-2 rounded-xl border border-slate-800">
                            Bilancio: <Coins className="text-yellow-400" size={24} /> <span className="text-yellow-400">{campaignState.coins} Monete</span>
                        </div>

                        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-6 flex justify-between items-center shadow-inner">
                             <div className="text-left flex items-center gap-4">
                                 <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400"><Heart size={24}/></div>
                                 <div>
                                     <div className="font-black text-lg text-white">Cura Totale Squadra</div>
                                     <div className="text-xs text-slate-400 mt-1">Ripristina tutti gli HP al massimo</div>
                                 </div>
                             </div>
                             <button onClick={buyFullHeal} className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-black px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg hover:-translate-y-0.5 transition-all"><Coins size={16}/> 600</button>
                        </div>
                    </div>
                    
                    <div className="text-left text-sm font-bold text-slate-400 mb-2 px-2">Cure Individuali:</div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-6 space-y-3 text-left">
                        {campaignState.roster.map(id => {
                            const char = CHARACTERS.find(c=>c.id===id);
                            const hp = campaignState.rosterStats[id] || 0;
                            if(!char) return null;
                            const isDead = hp <= 0;
                            const isFull = hp >= char.maxHp;

                            return (
                                <div key={id} className={`bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 flex items-center gap-3`}>
                                    <img src={char.img} className={`w-12 h-12 rounded-full border border-slate-600 object-cover ${isDead ? 'grayscale' : ''}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-sm truncate">{char.name} {isDead && <span className="text-rose-500 text-[10px] ml-1">(Esausto)</span>}</div>
                                        {renderHealthBar(hp, char.maxHp)}
                                    </div>
                                    <div className="shrink-0 flex gap-2">
                                        {isDead ? (
                                            <button onClick={() => buyRevive(id)} className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs shadow-md transition-all">
                                                <Heart size={12}/> Revitalizza <Coins size={10}/> 100
                                            </button>
                                        ) : (
                                            <button disabled={isFull} onClick={() => buyPotion(id)} className={`font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs shadow-md transition-all ${isFull ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}>
                                                <Heart size={12}/> Pozione (+50%) <Coins size={10}/> 50
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    <button onClick={() => setAppMode('campaign_map')} className="w-full shrink-0 bg-blue-600 hover:bg-blue-500 py-4 rounded-full font-black text-xl transition-all shadow-lg hover:-translate-y-1">Avanza al Prossimo Settore</button>
                </div>
            </div>
        );
    }
}
