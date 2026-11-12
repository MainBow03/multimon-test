import { getCampaignLock, getCompletedCampaigns } from '../../systems/campaignUnlocks.js';

// Le illustrazioni risiedono nel repository, non su link esterni.
// import.meta.env.BASE_URL mantiene i percorsi corretti anche su GitHub Pages.
export const CAMPAIGN_MENU_BANNERS=Object.freeze({
 'crisi_varco':'crisi-varco.webp',
 'torneo_assoluto':'torneo-assoluto.webp',
 'eco_anime':'eco-anime.webp',
 'teatro_catastrofi':'teatro-catastrofi.webp',
 'monarch_akuma':'ombra-monarch.webp'
});

export function renderCampaignSelectView(ctx) {
 const { ArrowLeft, CAMPAIGNS, appMode, loadCampaign, setAppMode } = ctx;
 if(appMode!=='campaign_select')return;
 const mainCampaigns=CAMPAIGNS.filter(camp=>camp.id!=='monarch_akuma');
 const extraCampaigns=CAMPAIGNS.filter(camp=>camp.id==='monarch_akuma');

 const renderCard=(camp,isExtra=false)=>{
   const saved=localStorage.getItem('multiverse_rpg_campaign_save_'+camp.id);
   const isInProgress=!!saved;
   const completed=!!getCompletedCampaigns()[camp.id];
   const prerequisite=getCampaignLock(camp.id);
   const locked=!!prerequisite;
   const unlockLabel=prerequisite==='crisi_varco'?'Completa La Crisi del Varco Rotto'
       :prerequisite==='torneo_assoluto'?'Completa Il Torneo Assoluto'
       :prerequisite==='teatro_catastrofi'?'Completa Il Teatro delle Catastrofi'
       :'Completa L\'Eco delle Anime';
   const artwork=CAMPAIGN_MENU_BANNERS[camp.id];
   return (
     <div key={camp.id} className={`rounded-3xl border border-white/15 relative overflow-hidden group ${locked?'cursor-not-allowed grayscale-[.35] opacity-70':'cursor-pointer hover:-translate-y-1 hover:border-white/30'} transition-all duration-200 shadow-2xl bg-gradient-to-br ${camp.bg}`}
       onClick={()=>{
         if(locked)return;
         const state=loadCampaign(camp.id);
         if(!state)return;
         setAppMode(state.completed?'campaign_ending':state.isStarted?'campaign_map':'campaign_intro');
       }}>
       <div className="absolute inset-0 bg-black/25 group-hover:bg-black/15 pointer-events-none transition-colors"/>
       <div className="relative z-10 p-5 sm:p-6 flex flex-col text-center items-center h-full">
         {locked&&<div className="mb-3 px-4 py-2 rounded-xl border border-amber-500/50 bg-black/70 text-amber-300 text-xs font-black">🔒 BLOCCATA — {unlockLabel}</div>}
         <span className={`text-xs sm:text-sm font-black uppercase tracking-widest mb-1 ${isExtra?'text-amber-300':'text-emerald-300'}`}>
           {isExtra?'SPIN-OFF · CAMPAGNA EXTRA':camp.shortTitle}
         </span>
         <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 drop-shadow-md">{camp.title}</h2>
         <p className="text-slate-200 text-sm sm:text-base mb-4 min-h-[60px] leading-relaxed">{camp.description}</p>
         {artwork&&(
           <div className="w-full overflow-hidden rounded-2xl border border-white/20 bg-slate-950/60 mb-4 shadow-[0_12px_30px_rgba(0,0,0,.35)] aspect-[16/7] relative">
             <img loading="lazy" decoding="async"
               src={import.meta.env.BASE_URL+'campaign-banners/'+artwork}
               alt={'Illustrazione della campagna '+camp.title}
               className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.035] transition-transform duration-500"
               onError={e=>{e.currentTarget.style.display='none';}}/>
             <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/25 via-transparent to-transparent"/>
           </div>
         )}
         <div className="mt-auto w-full bg-white/10 hover:bg-white/20 text-white font-black text-xs sm:text-sm py-3.5 px-3 rounded-full border border-white/25 transition-colors uppercase tracking-wide shadow-lg">
           {locked?'🔒 Campagna bloccata':completed?'🏆 Campagna completata · Rivedi finale':isInProgress?'Continua partita':'Nuova partita'}
         </div>
       </div>
     </div>
   );
 };
 return (
   <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden p-5 sm:p-8">
     <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-black pointer-events-none opacity-60"/>
     <div className="relative z-10 max-w-6xl mx-auto">
       <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
         <button onClick={()=>setAppMode('menu')} className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors bg-black/50 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20 text-sm">
           <ArrowLeft size={18}/> Torna al Menu
         </button>
         <span className="text-xs font-black uppercase tracking-[.25em] text-emerald-300">Storie del Multiverso</span>
       </div>
       <h1 className="text-3xl sm:text-5xl font-black mb-7 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 text-center drop-shadow-md">Scegli la tua Avventura</h1>
       <section aria-label="Campagne principali">
         <div className="flex items-center gap-3 mb-4">
           <span className="text-xl">🌌</span>
           <h2 className="text-xl sm:text-2xl font-black text-white">Campagne principali</h2>
           <span className="rounded-full px-3 py-1 bg-emerald-500/15 border border-emerald-500/25 text-xs text-emerald-200 font-bold">{mainCampaigns.length} storie</span>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
           {mainCampaigns.map(camp=>renderCard(camp))}
         </div>
       </section>
       {extraCampaigns.length>0&&(
         <section aria-label="Campagne Extra e Spin-off" className="mt-10 mb-8">
           <div className="flex flex-wrap items-center gap-3 mb-3">
             <span className="text-xl">✨</span>
             <h2 className="text-xl sm:text-2xl font-black text-amber-100">Campagne Extra / Spin-off</h2>
             <span className="text-xs text-slate-400">Storie indipendenti dalla sequenza principale</span>
           </div>
           <p className="text-sm text-slate-400 mb-4">Avventure parallele con protagonisti e minacce proprie. Il loro completamento non serve per sbloccare il Teatro.</p>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{extraCampaigns.map(camp=>renderCard(camp,true))}</div>
         </section>
       )}
     </div>
   </div>
 );
}
