import {echoSoulPortraitId} from '../../systems/echoFinalSouls.js';
import {onMultimonImageError} from '../../systems/imageFallback.js';
// Schermata estratta senza alterare la struttura JSX originale.
export function renderCampaignDialogueView(ctx) {
const { CHARACTERS, activeCampaign, activeCampaignId, activeMission, activeSector, appMode, campaignDialogueIdx, campaignDialogueMemo, campaignState, setAppMode, setCampaignDialogueIdx, setCampaignSelectedTeam, setCampaignState } = ctx;
if (appMode === 'campaign_dialogue') {
        const sector = activeSector;
        const mission = activeMission;
        
        const fullDialogue = campaignDialogueMemo;

        const dialogue = fullDialogue[campaignDialogueIdx];
        
        const nextDialogue = () => {
            if (dialogue && campaignDialogueIdx < fullDialogue.length - 1) {
                setCampaignDialogueIdx(p => p + 1);
            } else {
                const isSecondCampaign = activeCampaignId === 'torneo_assoluto';
                const isFinalRaid = activeCampaignId === 'crisi_varco' && campaignState.sectorIdx >= activeCampaign.sectors.length - 1;
                let maxTeamSize = 4;
                if (isFinalRaid) maxTeamSize = 20;
                if (isSecondCampaign) maxTeamSize = 8;
                if (activeCampaignId === 'eco_anime') maxTeamSize = mission.echoFinal ? 24 : 4;
                
                if (isSecondCampaign) {
                    if (campaignState.roster.length <= maxTeamSize) {
                        const alive = campaignState.roster.filter(id => campaignState.rosterStats[id] > 0);
                        setCampaignSelectedTeam(alive);
                    } else if (campaignState.protagonist) {
                        setCampaignSelectedTeam([campaignState.protagonist]);
                    }
                } else if (mission.forcedRoster) {
                    // LOGICA SQUADRA FORZATA (Assicura che i personaggi siano vivi e nel roster)
                    let newStats = {...campaignState.rosterStats};
                    let newRoster = [...campaignState.roster];
                    
                    mission.forcedRoster.forEach(id => {
                        if (!newRoster.includes(id)) newRoster.push(id);
                        // Le anime rubate restano KO finché non vengono liberate.
                        // L'aiuto narrativo del 30% non può aggirare questo blocco.
                        if(activeCampaignId==='eco_anime'&&mission.echoFinal&&
                            (campaignState.echoCorruptedLockedIds||[]).includes(id)){
                            newStats[id]=0;
                            return;
                        }
                        if (!newStats[id] || newStats[id] <= 0) {
                            const c = CHARACTERS.find(x => x.id === id);
                            if (c) newStats[id] = Math.floor(c.maxHp * 0.3); // Li rianima al 30% per la trama se erano esausti
                        }
                    });
                    setCampaignState(p => ({...p, rosterStats: newStats, roster: newRoster}));
                    setCampaignSelectedTeam(mission.forcedRoster);
                } else if (campaignState.roster.length <= maxTeamSize) {
                    const alive = campaignState.roster.filter(id => campaignState.rosterStats[id] > 0);
                    setCampaignSelectedTeam(alive);
                }
                
                setAppMode('campaign_team_select');
            }
        };

        if (!dialogue) {
            // Non generare side effect in render: l'utente puo' procedere in modo esplicito.
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
        const soulPortraitId=echoSoulPortraitId(dialogue.s);
        if(soulPortraitId)speakerChar=CHARACTERS.find(c=>c.id===soulPortraitId)||speakerChar;
        const echoFinalScene=activeCampaignId==='eco_anime'&&mission.echoFinal;
        
        return (
            <div className={`min-h-screen flex flex-col justify-end p-8 ${sector.bg} relative overflow-hidden`} onClick={nextDialogue}>
                 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/20 via-transparent to-transparent pointer-events-none opacity-50"></div>
                 {speakerChar && (
                     <div className={`absolute bottom-0 left-4 md:left-24 transition-all duration-500 pointer-events-none drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]`}>
                         <img src={speakerChar.img} alt={speakerChar.name} onError={onMultimonImageError}
                           style={soulPortraitId?{filter:'sepia(.4) hue-rotate(245deg) saturate(2) drop-shadow(0 0 24px #a855f7)'}:undefined}
                           className={`w-48 h-48 md:w-80 md:h-80 object-contain rounded-t-full border-t-4 border-x-4 ${soulPortraitId?'border-fuchsia-400':'border-emerald-500'} opacity-100`} />
                     </div>
                 )}
                 <div className={`bg-slate-900/95 border-2 ${echoFinalScene?'border-fuchsia-400 shadow-[0_0_48px_rgba(192,38,211,0.3)]':'border-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.2)]'} p-6 sm:p-8 rounded-2xl max-w-4xl w-full mx-auto z-10 cursor-pointer relative mb-12 animate-fade-in`}>
                      <div className={`absolute -top-4 left-6 px-4 py-1 rounded-full font-black text-sm uppercase tracking-widest shadow-md ${echoFinalScene?'bg-fuchsia-600':'bg-emerald-500'} text-white`}>{dialogue.s}</div>
                      {echoFinalScene&&<div className="text-[11px] font-black uppercase tracking-widest text-fuchsia-200 mb-2">
                        🌌 Scontro finale · Dialogo {campaignDialogueIdx+1}/{fullDialogue.length}
                      </div>}
                      <p className="text-xl md:text-2xl mt-4 leading-relaxed font-medium text-white italic">"{dialogue.t}"</p>
                      <p className="text-right text-xs text-emerald-400 mt-4 animate-pulse font-bold">Clicca per continuare...</p>
                 </div>
            </div>
        );
    }
}
