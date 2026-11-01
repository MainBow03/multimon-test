// Schermata estratta senza alterare la struttura JSX originale.
export function renderCampaignSelectView(ctx) {
const { ArrowLeft, CAMPAIGNS, appMode, loadCampaign, setAppMode } = ctx;
if (appMode === 'campaign_select') {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
                 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-black pointer-events-none opacity-60"></div>
                 <button onClick={() => setAppMode('menu')} className="absolute top-6 left-6 flex items-center gap-2 text-slate-300 hover:text-white transition-colors bg-black/50 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20 z-20">
                     <ArrowLeft size={20} /> Torna al Menu
                </button>
                <h1 className="text-5xl font-black mb-10 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 text-center z-10 drop-shadow-md">Scegli la tua Avventura</h1>
                
                <div className="flex flex-col md:flex-row gap-8 max-w-5xl w-full z-10">
                    {CAMPAIGNS.map(camp => {
                        const saved = localStorage.getItem(`multiverse_rpg_campaign_save_${camp.id}`);
                        const isInProgress = !!saved;
                        return (
                            <div key={camp.id} className={`flex-1 rounded-3xl p-8 border border-slate-700/50 relative overflow-hidden group cursor-pointer hover:-translate-y-2 transition-transform shadow-2xl bg-gradient-to-br ${camp.bg}`}
                                onClick={() => {
                                    const state = loadCampaign(camp.id);
                                    if (state.isStarted) {
                                        setAppMode('campaign_map');
                                    } else {
                                        setAppMode('campaign_intro');
                                    }
                                }}
                            >
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
                                <div className="relative z-10 flex flex-col h-full text-center items-center">
                                    <span className="text-sm font-bold uppercase tracking-widest text-emerald-400 mb-2">{camp.shortTitle}</span>
                                    <h2 className="text-3xl font-black text-white mb-4">{camp.title}</h2>
                                    <p className="text-slate-300 mb-8 flex-1">{camp.description}</p>
                                    <button className="bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-8 rounded-full backdrop-blur-sm border border-white/20 transition-colors w-full uppercase tracking-widest shadow-lg mt-auto">
                                        {isInProgress ? 'Continua Partita' : 'Nuova Partita'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
}
