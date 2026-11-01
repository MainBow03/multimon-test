// Schermata estratta senza alterare la struttura JSX originale.
export function renderCampaignIntroView(ctx) {
const { activeCampaign, activeCampaignId, appMode, campaignState, setAppMode, setCampaignState } = ctx;
if (appMode === 'campaign_intro') {
        const introData = activeCampaign.intro;
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
                 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/40 via-slate-950 to-black pointer-events-none opacity-60"></div>
                 <div className="bg-slate-900/80 p-8 rounded-3xl max-w-2xl text-center border border-emerald-500/30 z-10 shadow-2xl">
                      <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 mb-4">{introData.title}</h1>
                      <h2 className="text-xl text-emerald-400 font-bold mb-6">{introData.subtitle}</h2>
                      <p className="text-slate-300 mb-4 text-left leading-relaxed">{introData.p1}</p>
                      <p className="text-slate-300 mb-8 text-left leading-relaxed">{introData.p2}</p>
                      
                      <div className="flex justify-center gap-4 mb-8">
                          <button onClick={() => setCampaignState(p => ({...p, difficulty: 'Normal'}))} className={`px-6 py-3 rounded-xl font-bold border-2 transition-all ${campaignState.difficulty === 'Normal' ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 'border-slate-700 text-slate-500'}`}>Normale</button>
                          <button onClick={() => setCampaignState(p => ({...p, difficulty: 'Insane'}))} className={`px-6 py-3 rounded-xl font-bold border-2 transition-all ${campaignState.difficulty === 'Insane' ? 'border-rose-500 bg-rose-500/20 text-rose-400' : 'border-slate-700 text-slate-500'}`}>Multiverso Folle</button>
                      </div>
                      
                      <button onClick={() => {
                          if (activeCampaignId === 'torneo_assoluto' && !campaignState.protagonist) {
                              setAppMode('campaign_select_protagonist');
                          } else {
                              setCampaignState(p => ({...p, isStarted: true}));
                              setAppMode('campaign_map');
                          }
                      }} className="bg-gradient-to-r from-emerald-500 to-teal-600 px-10 py-4 rounded-full font-black text-xl hover:scale-105 transition-transform shadow-lg">Inizia Avventura</button>
                 </div>
            </div>
        );
    }
}
