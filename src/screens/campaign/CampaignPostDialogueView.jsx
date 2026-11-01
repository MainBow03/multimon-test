// Schermata estratta senza alterare la struttura JSX originale.
export function renderCampaignPostDialogueView(ctx) {
const { CHARACTERS, activeMission, activeSector, advanceCampaign, appMode, campaignDialogueIdx, campaignPostDialogueMemo, setAppMode, setCampaignDialogueIdx } = ctx;
if (appMode === 'campaign_post_dialogue') {
        const sector = activeSector;
        const mission = activeMission;
        
        const fullDialogue = campaignPostDialogueMemo;

        const dialogue = fullDialogue[campaignDialogueIdx];
        
        const nextDialogue = () => {
            if (dialogue && campaignDialogueIdx < fullDialogue.length - 1) {
                setCampaignDialogueIdx(p => p + 1);
            } else {
                if (mission.choiceUnlock) {
                    setAppMode('campaign_choice');
                } else {
                    advanceCampaign(150);
                }
            }
        };

        if (!dialogue) {
            // Mai programmare setTimeout durante render: React puo' ri-renderizzare
            // piu' volte e accodare avanzamenti ripetuti/incoerenti.
            return (
                <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
                    <button onClick={nextDialogue} className="px-10 py-5 rounded-2xl font-black text-xl bg-cyan-600 text-white hover:bg-cyan-500">
                        Continua la storia
                    </button>
                </div>
            );
        }

        const speakerName = dialogue.s.replace(' (Corrotto)', '').replace(' (Corrotta)', '').replace(' (Sottomessa)', '');
        let speakerChar = CHARACTERS.find(c => c.name === speakerName);
        if (!speakerChar) speakerChar = CHARACTERS.find(c => c.name.includes(speakerName));
        
        return (
            <div className={`min-h-screen flex flex-col justify-end p-8 ${sector.bg} relative overflow-hidden`} onClick={nextDialogue}>
                 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent pointer-events-none opacity-50"></div>
                 {speakerChar && (
                     <div className={`absolute bottom-0 left-4 md:left-24 transition-all duration-500 pointer-events-none drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]`}>
                         <img src={speakerChar.img} className="w-48 h-48 md:w-80 md:h-80 object-cover rounded-t-full border-t-4 border-x-4 border-cyan-500 opacity-100" />
                     </div>
                 )}
                 <div className="bg-slate-900/95 border-2 border-cyan-400 p-8 rounded-2xl max-w-4xl w-full mx-auto z-10 cursor-pointer shadow-[0_0_40px_rgba(34,211,238,0.2)] relative mb-12 animate-fade-in">
                      <div className={`absolute -top-4 left-6 px-4 py-1 rounded-full font-black text-sm uppercase tracking-widest shadow-md bg-cyan-500 text-black`}>{dialogue.s}</div>
                      <p className="text-xl md:text-2xl mt-4 leading-relaxed font-medium text-white italic">"{dialogue.t}"</p>
                      <p className="text-right text-xs text-cyan-400 mt-4 animate-pulse font-bold">Clicca per continuare...</p>
                 </div>
            </div>
        );
    }
}
