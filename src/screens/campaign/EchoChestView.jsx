// Cassa dopo OGNI missione de L'Eco delle Anime.
// Le scelte modificano solo i salvataggi della campagna; il sistema globale
// assegna comunque la sua cassa premio quando advanceCampaign viene chiamato.
import { ECHO_ID } from '../../data/echoCampaign.js';

const TIERS={
 superstite:{label:'Cassa del Superstite',text:'Hai recuperato le risorse abbandonate dai servitori dell’Eco.',base:80,heal:0.20},
 resistenza:{label:'Cassa della Resistenza',text:'Un nuovo alleato ha portato rifornimenti alla Resistenza.',base:130,heal:0.28},
 leggendaria:{label:'Cassa Leggendaria',text:'Il comandante sconfitto proteggeva un tesoro raro.',base:220,heal:0.40}
};

export function renderEchoChestView(ctx){
 const {appMode,activeCampaignId,activeMission,advanceCampaign,campaignState,setCampaignState,CHARACTERS}=ctx;
 if(appMode!=='campaign_echo_chest'||activeCampaignId!==ECHO_ID)return null;
 const tier=TIERS[activeMission.echoReward]||TIERS.superstite;
 const claimed=!!campaignState.echoChestClaims?.[activeMission.id];
 const team=campaignState.roster||[];
 const stats=campaignState.rosterStats||{};
 const weak=team.map(id=>({id,c:CHARACTERS.find(c=>c.id===id),hp:stats[id]??0}))
    .filter(x=>x.c).sort((a,b)=>a.hp/a.c.maxHp-b.hp/b.c.maxHp)[0];
 const pick=(kind)=>{
   if(claimed){advanceCampaign(150);return;}
   setCampaignState(prev=>{
     if(prev.echoChestClaims?.[activeMission.id])return prev;
     const newStats={...prev.rosterStats};
     let extraCoins=0;
     if(kind==='coins')extraCoins=tier.base;
     else if(kind==='team'){
       for(const id of prev.roster){
         const c=CHARACTERS.find(ch=>ch.id===id);
         if(c && newStats[id]>0)newStats[id]=Math.min(c.maxHp,newStats[id]+Math.ceil(c.maxHp*tier.heal));
       }
     }else if(kind==='rescue' && weak?.c){
       const max=weak.c.maxHp;
       newStats[weak.id]=Math.min(max,Math.max(1,newStats[weak.id])+Math.ceil(max*0.60));
     }
     return {...prev,coins:prev.coins+extraCoins,rosterStats:newStats,
       echoChestClaims:{...prev.echoChestClaims,[activeMission.id]:kind}};
   });
   advanceCampaign(150);
 };
 return <div className="min-h-screen bg-gradient-to-b from-violet-950 via-slate-950 to-black text-white flex items-center justify-center p-5">
   <section className="w-full max-w-4xl rounded-3xl border border-violet-400/40 bg-slate-900/90 shadow-[0_0_80px_rgba(139,92,246,0.2)] p-6 sm:p-10 text-center">
     <div className="uppercase tracking-[0.25em] text-xs text-violet-300 font-black mb-3">Missione {activeMission.echoNumber}/36 completata</div>
     <div className="text-6xl mb-4" aria-hidden="true">✦</div>
     <h1 className="text-3xl sm:text-5xl font-black text-amber-300 mb-3">{tier.label}</h1>
     <p className="text-slate-300 mb-2">{tier.text}</p>
     <p className="text-sm text-slate-400 mb-8">Scegli una ricompensa. Ottieni anche la cassa premio globale della missione e le normali monete avanzando.</p>
     {claimed?<button type="button" onClick={()=>advanceCampaign(150)} className="rounded-xl bg-emerald-600 px-8 py-4 font-black hover:bg-emerald-500">Continua l'avventura</button>:
     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
       <button type="button" onClick={()=>pick('coins')} className="rounded-2xl border border-amber-400/40 bg-amber-900/20 hover:bg-amber-800/35 p-5 text-left transition-colors">
         <div className="font-black text-xl text-amber-300 mb-2">Risorse recuperate</div>
         <p className="text-3xl font-black mb-2">+{tier.base} monete</p>
         <p className="text-xs text-slate-400">Più libertà di acquisto al prossimo accampamento.</p>
       </button>
       <button type="button" onClick={()=>pick('team')} className="rounded-2xl border border-emerald-400/40 bg-emerald-900/20 hover:bg-emerald-800/35 p-5 text-left transition-colors">
         <div className="font-black text-xl text-emerald-300 mb-2">Rifornimenti medici</div>
         <p className="text-3xl font-black mb-2">+{Math.round(tier.heal*100)}% PS</p>
         <p className="text-xs text-slate-400">Cura tutti gli alleati ancora in vita, senza rianimare gli esausti.</p>
       </button>
       <button type="button" onClick={()=>pick('rescue')} disabled={!weak} className="rounded-2xl border border-cyan-400/40 bg-cyan-900/20 hover:bg-cyan-800/35 p-5 text-left transition-colors disabled:opacity-40">
         <div className="font-black text-xl text-cyan-300 mb-2">Anima salvata</div>
         <p className="text-xl font-black mb-2">Soccorri {weak?.c?.name||'un alleato'}</p>
         <p className="text-xs text-slate-400">Rianima o cura maggiormente l'alleato con meno PS percentuali.</p>
       </button>
     </div>}
     <div className="mt-6 text-xs text-violet-200/70">La ricompensa è unica per questa missione; la squadra rimane salvata nella campagna.</div>
   </section>
 </div>;
}
