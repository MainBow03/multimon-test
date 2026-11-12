// Schermata estratta senza alterare la struttura JSX originale.
export function renderCampaignIntroView(ctx) {
const { CHARACTERS, activeCampaign, activeCampaignId, appMode, campaignState, setAppMode, setCampaignState } = ctx;
if (appMode === 'campaign_intro') {
        const introData = activeCampaign.intro;
        const theater=activeCampaignId==='teatro_catastrofi';
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
                 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${theater?'from-rose-900/60 via-purple-950 to-black':'from-emerald-900/40 via-slate-950 to-black'} pointer-events-none opacity-60"></div>
                 <div className={`bg-slate-900/85 p-6 sm:p-8 rounded-3xl max-w-3xl text-center border z-10 shadow-2xl ${theater?'border-amber-500/50 shadow-rose-950/50':'border-emerald-500/30'}`}>
                      <h1 className={`text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r mb-4 ${theater?'from-amber-200 via-rose-300 to-fuchsia-400':'from-emerald-400 to-cyan-500'}`}>{introData.title}</h1>
                      <h2 className={`text-xl font-bold mb-6 ${theater?'text-amber-300':'text-emerald-400'}`}>{introData.subtitle}</h2>
                      {theater && <div className="mb-5 flex justify-center gap-3 flex-wrap">
                          {['starbutterfly','coraline','samtotallyspies','regista'].map(id=>{
                            const c=CHARACTERS?.find(char=>char.id===id);
                            return c?<div key={id} className="rounded-xl border border-amber-500/30 bg-black/40 p-2">
                              <img src={c.img} alt={c.name} className="h-24 w-20 sm:h-28 sm:w-24 rounded-lg object-contain" />
                              <div className="mt-1 max-w-24 text-xs font-bold text-slate-200 truncate">{id==='regista'?'Il Regista':c.name}</div>
                            </div>:null;
                          })}
                      </div>}
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
                      }} className={`bg-gradient-to-r ${theater?'from-rose-600 to-fuchsia-700':'from-emerald-500 to-teal-600'} px-10 py-4 rounded-full font-black text-xl hover:scale-105 transition-transform shadow-lg`}>{theater?'🎭 Si alzi il sipario!':'Inizia Avventura'}</button>
                 </div>
            </div>
        );
    }
}
