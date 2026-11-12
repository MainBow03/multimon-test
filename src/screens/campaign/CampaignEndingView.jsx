import { completeCampaign } from '../../systems/campaignUnlocks.js';
// Schermata estratta senza alterare la struttura JSX originale.
export function renderCampaignEndingView(ctx) {
const { CHARACTERS, Trophy, activeCampaign, activeCampaignId, appMode, campaignState, loadCampaign, setAppMode, setCampaignSelectedTeam, setCampaignState } = ctx;
if (appMode === 'campaign_ending') {
        return (
            <div className="min-h-screen bg-gradient-to-t from-blue-950 to-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
                <Trophy size={80} className="text-yellow-400 mb-6 drop-shadow-[0_0_30px_rgba(234,179,8,0.8)] animate-bounce" />
                <h1 className="text-6xl md:text-8xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-md tracking-tighter">
                    {activeCampaignId === 'crisi_varco' ? 'IL MULTIVERSO È SALVO!' : activeCampaignId === 'eco_anime' ? 'L’ECO È STATO SPEZZATO!' : activeCampaignId === 'teatro_catastrofi' ? 'IL SIPARIO NON CALA!' : 'CAMPAGNA COMPLETATA!'}
                </h1>
                <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mb-12 font-medium leading-relaxed">
                    {activeCampaignId === 'teatro_catastrofi' ? 'Star, Coraline e Sam hanno liberato gli spettatori. Nina può finalmente scrivere il proprio futuro e il Teatro Zero esiste senza copioni imposti. Hai sbloccato il Regista come Multimon giocabile!'
                    : activeCampaignId === 'eco_anime' ? 'Finn e Topolino sono finalmente liberi. La nuova Resistenza, nata dal coraggio di Jake e Marceline, ha riunito ventiquattro eroi e spezzato il dominio delle anime di Echomax. Hai sbloccato Echomax come Multimon giocabile!'
                    : activeCampaignId === 'crisi_varco'
                        ? 'Dopo la fuga di Cell, la Resistenza ha affrontato la vera minaccia: Trigon e Gaster. Il raid è terminato, il vuoto si richiude e la storia dei mondi salvati può finalmente continuare.'
                        : `Hai portato a termine ${activeCampaign.title}. La tua alleanza ha scritto un nuovo capitolo nel multiverso!`}
                </p>
                {campaignState.recoveredFromLegacyCompletion && (
                    <p className="max-w-3xl mb-5 rounded-2xl border border-cyan-400/35 bg-cyan-950/40 p-4 text-sm text-cyan-100">
                        Il completamento è stato recuperato dal registro dei traguardi: una vecchia versione aveva cancellato il salvataggio. I 24 eroi e l'epilogo sono stati ripristinati, ma non è possibile ricostruire con certezza le monete e i PS precedenti.
                    </p>
                )}
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
                    // Il finale NON deve azzerare il salvataggio della campagna.
                    // Mantieni completamento, ultimo settore, roster e ricompense.
                    completeCampaign(activeCampaignId);
                    setCampaignSelectedTeam([]);
                    setAppMode('menu');
                }} className="bg-white text-black px-12 py-5 rounded-full font-black text-xl hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.4)]">Torna al Menu Principale</button>
            </div>
        );
    }
}
