import { isTournamentEligibleCharacter } from '../../systems/tournamentEligibility.js';
// Schermata estratta senza alterare la struttura JSX originale.
export function renderCampaignSelectProtagonistView(ctx) {
const { CHARACTERS, appMode, campaignState, getCampaignStoryCharacters, setAppMode, setCampaignState } = ctx;
if (appMode === 'campaign_select_protagonist') {
        const storyChars = getCampaignStoryCharacters('torneo_assoluto');
        const draftableChars = CHARACTERS.filter(c => isTournamentEligibleCharacter(c,storyChars));
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col p-6 relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/40 via-slate-950 to-black pointer-events-none opacity-60"></div>
                <div className="relative z-10 w-full max-w-6xl">
                    <h2 className="text-4xl md:text-5xl font-black mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 drop-shadow-md">
                        Scegli il tuo Protagonista
                    </h2>
                    <p className="text-center text-slate-300 mb-10 text-lg">Guiderai l'alleanza prendendo il posto di Topolino.<br/><span className="text-sm text-amber-400">Nota: I personaggi che fanno già parte della storia del Torneo non possono essere scelti.</span></p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 overflow-y-auto custom-scrollbar max-h-[60vh] p-2">
                        {draftableChars.map(char => (
                            <div key={char.id} onClick={() => {
                                let newRoster = [...campaignState.roster];
                                newRoster = newRoster.filter(id => id !== 'topolino');
                                if (newRoster.includes(char.id)) {
                                    newRoster = newRoster.filter(id => id !== char.id);
                                }
                                newRoster.unshift(char.id);
                                
                                setCampaignState(p => ({...p, protagonist: char.id, roster: newRoster, isStarted: true}));
                                setAppMode('campaign_map');
                            }} className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700/50 hover:border-amber-400 hover:bg-slate-800 cursor-pointer text-center hover:scale-105 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(245,158,11,0.2)] transition-all group">
                                <img src={char.img} className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-2 border-slate-600 group-hover:border-amber-400 shadow-md"/>
                                <div className="font-bold text-xs truncate text-slate-100">{char.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
}
