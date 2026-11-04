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
                    
                    <div className="multimon-roster-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 overflow-y-auto custom-scrollbar max-h-[65dvh] p-2 sm:p-3">
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
                            }} className="multimon-roster-card min-w-0 bg-slate-900/80 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-slate-700/50 hover:border-amber-400 hover:bg-slate-800 cursor-pointer text-center hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(245,158,11,0.2)] transition-all group">
                                <div className="multimon-roster-portrait w-full h-28 sm:h-32 md:h-36 mb-3 rounded-xl flex items-center justify-center border-2 border-slate-600 group-hover:border-amber-400 bg-slate-950/55 p-2">
                                     <img src={char.img} alt={char.name} loading="lazy" className="w-full h-full object-contain drop-shadow-lg"/>
                                 </div>
                                <div className="font-bold text-sm sm:text-base text-slate-100 leading-snug line-clamp-2 min-h-[2.25em] break-words">{char.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
}
