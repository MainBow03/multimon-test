// Schermata estratta senza alterare la struttura JSX originale.
export function renderCampaignChoiceView(ctx) {
const { CHARACTERS, TYPE_STYLES, activeMission, activeSector, appMode, campaignState, setAppMode, setCampaignState, setResolutionDialogueIdx, setResolutionDialogues, updateLocalStats } = ctx;
if (appMode === 'campaign_choice') {
        const sector = activeSector;
        const mission = activeMission;

        const handleChoice = (pickedId) => {
            const resDialogues = mission.choiceDialogues[pickedId];
            setResolutionDialogues(resDialogues);
            setResolutionDialogueIdx(0);

            const newRoster = [...campaignState.roster, pickedId];
            const newRosterStats = { ...campaignState.rosterStats };
            newRosterStats[pickedId] = CHARACTERS.find(c=>c.id===pickedId).maxHp;

            setCampaignState(prev => ({
                ...prev,
                roster: newRoster,
                rosterStats: newRosterStats
            }));
            updateLocalStats({ unlockChar: pickedId });

            setAppMode('campaign_resolution_dialogue');
        };

        return (
            <div className={`min-h-screen flex flex-col p-6 text-white ${sector.bg} relative overflow-hidden items-center justify-center`}>
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0"></div>
                <div className="relative z-10 text-center max-w-5xl w-full">
                    <h2 className="text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 drop-shadow-md">Scegli chi Reclutare!</h2>
                    <p className="text-xl text-slate-300 mb-12 font-medium">Puoi accogliere solo uno di loro nella Resistenza.<br/>L'altro tornerà alla sua dimensione d'origine.</p>
                    
                    <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch w-full">
                        {mission.choiceUnlock.map(id => {
                            const char = CHARACTERS.find(c => c.id === id);
                            if(!char) return null;
                            return (
                                <div key={id} onClick={() => handleChoice(id)} className="bg-slate-900/80 border-2 border-slate-600 hover:border-emerald-400 hover:bg-slate-800 p-8 rounded-3xl cursor-pointer transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(16,185,129,0.3)] flex-1 flex flex-col items-center group">
                                    <img src={char.img} className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover border-4 border-slate-700 group-hover:border-emerald-400 transition-colors mb-6 shadow-xl" alt={char.name} />
                                    <h3 className="text-3xl font-black text-white mb-4">{char.name}</h3>
                                    <div className="flex gap-2 justify-center mb-6">
                                        {char.types.map(t => (
                                            <span key={t} className={`text-xs font-black px-3 py-1 rounded shadow-sm uppercase ${TYPE_STYLES[t] || 'bg-gray-500'}`}>{t}</span>
                                        ))}
                                    </div>
                                    <div className="w-full grid grid-cols-2 gap-3 text-sm font-mono bg-black/40 p-4 rounded-xl border border-slate-700/50 mt-auto">
                                        <div className="text-emerald-400">HP: {char.maxHp}</div>
                                        <div className="text-rose-400">ATK: {char.atk}</div>
                                        <div className="text-blue-400">DEF: {char.def}</div>
                                        <div className="text-amber-400">SPD: {char.spd}</div>
                                    </div>
                                    <button className="mt-8 bg-emerald-600 group-hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-colors w-full uppercase tracking-widest text-sm">Scegli {char.name}</button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }
}
