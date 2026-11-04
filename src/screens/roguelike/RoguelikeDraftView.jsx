// Schermata estratta senza alterare la struttura JSX originale.
export function renderRoguelikeDraftView(ctx) {
const { CHARACTERS, TYPE_STYLES, appMode, roguelikeDraftChoices, roguelikeState, setAppMode, setRoguelikeState } = ctx;
if (appMode === 'roguelike_draft') {
        const handlePick = (id) => {
            if (roguelikeState.roster.includes(id)) return;
            const newRoster = [...roguelikeState.roster, id];
            const newStats = { ...roguelikeState.rosterStats };
            newStats[id] = CHARACTERS.find(c => c.id === id).maxHp;
            
            setRoguelikeState(prev => ({ ...prev, roster: newRoster, rosterStats: newStats }));
            
            if (newRoster.length >= 3) {
                setTimeout(() => setAppMode('roguelike_map'), 500);
            }
        };

        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col p-3 sm:p-6 relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-fuchsia-900/40 via-slate-950 to-black pointer-events-none opacity-60"></div>
                <div className="relative z-10 w-full max-w-5xl text-center">
                    <h2 className="text-3xl sm:text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-500 drop-shadow-md">Draft Iniziale</h2>
                    <p className="text-base sm:text-xl text-slate-300 mb-6 font-medium">Scegli 3 campioni. La vita NON si rigenera dopo le battaglie. Se muoiono tutti, la spedizione finisce. ({roguelikeState.roster.length}/3)</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 lg:gap-6 max-h-[67dvh] overflow-y-auto custom-scrollbar p-1 sm:p-2">
                        {roguelikeDraftChoices.map(char => {
                            const isPicked = roguelikeState.roster.includes(char.id);
                            return (
                                <div key={char.id} onClick={() => handlePick(char.id)} className={`bg-slate-900/80 border-2 ${isPicked ? 'border-fuchsia-500 opacity-50 grayscale' : 'border-slate-600 hover:border-fuchsia-400 hover:bg-slate-800 hover:-translate-y-2 cursor-pointer'} min-w-0 p-3 sm:p-5 rounded-3xl transition-all shadow-xl flex flex-col items-center`}>
                                    <div className="w-full h-28 sm:h-36 md:h-40 rounded-xl border-2 border-slate-700 bg-slate-950/65 mb-3 flex items-center justify-center p-2">
                                         <img src={char.img} alt={char.name} className="w-full h-full object-contain drop-shadow-lg" />
                                     </div>
                                    <h3 className="font-black text-sm sm:text-lg mb-2 leading-snug line-clamp-2 min-h-[2.25em] break-words">{char.name}</h3>
                                    <div className="flex flex-wrap gap-1.5 justify-center mb-2">
                                        {char.types.map(t => <span key={t} className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${TYPE_STYLES[t] || 'bg-gray-500'}`}>{t}</span>)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }
}
