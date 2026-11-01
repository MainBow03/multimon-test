// Schermata estratta senza alterare la struttura JSX originale.
export function renderCampaignEndingView(ctx) {
const { CHARACTERS, Trophy, activeCampaign, activeCampaignId, appMode, campaignState, loadCampaign, setAppMode, setCampaignSelectedTeam, setCampaignState } = ctx;
if (appMode === 'campaign_ending') {
        return (
            <div className="min-h-screen bg-gradient-to-t from-blue-950 to-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
                <Trophy size={80} className="text-yellow-400 mb-6 drop-shadow-[0_0_30px_rgba(234,179,8,0.8)] animate-bounce" />
                <h1 className="text-6xl md:text-8xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-md tracking-tighter">
                    {activeCampaignId === 'crisi_varco' ? 'IL MULTIVERSO È SALVO!' : 'CAMPAGNA COMPLETATA!'}
                </h1>
                <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mb-12 font-medium leading-relaxed">
                    {activeCampaignId === 'crisi_varco'
                        ? 'Dopo la fuga di Cell, la Resistenza ha affrontato la vera minaccia: Trigon e Gaster. Il raid è terminato, il vuoto si richiude e la storia dei mondi salvati può finalmente continuare.'
                        : `Hai portato a termine ${activeCampaign.title}. La tua alleanza ha scritto un nuovo capitolo nel multiverso!`}
                </p>
                <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/10 mb-12 w-full max-w-4xl backdrop-blur-md">
                    <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-6">La Resistenza Finale</h3>
                    <div className="flex flex-wrap justify-center gap-4">
                         {campaignState.roster.map(id => {
                              const char = CHARACTERS.find(c=>c.id===id);
                              if(!char) return null;
                              return <img key={id} src={char.img} className="w-16 h-16 rounded-full border-2 border-emerald-500 object-cover shadow-lg" title={char.name} alt={char.name} />;
                         })}
                    </div>
                </div>
                <button onClick={() => { 
                    setCampaignSelectedTeam([]); // FIX: Svuota la squadra
                    const freshState = loadCampaign(activeCampaignId);
                    freshState.isStarted = false;
                    setCampaignState(freshState);
                    localStorage.removeItem(`multiverse_rpg_campaign_save_${activeCampaignId}`);
                    setAppMode('menu'); 
                }} className="bg-white text-black px-12 py-5 rounded-full font-black text-xl hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.4)]">Torna al Menu Principale</button>
            </div>
        );
    }
}
