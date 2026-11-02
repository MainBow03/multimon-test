import React,{useMemo,useState} from 'react';
import { ScientistTutorial } from './ScientistTutorial.jsx';
import { STRENGTH_STATS,STRENGTH_MAX_LEVEL,canTrainCharacter,strengthSummary,strengthTotalLevels } from '../../systems/strengthLab.js';

// Il laboratorio è una schermata persistente, non un semplice popup.
// Legge i livelli dal profilo e mostra le statistiche previste in battaglia.
export function StrengthLabView({characters,profile,onUpgrade,onTutorialUpgrade,onTutorialStep,onTutorialComplete,onBack}){
  const [search,setSearch]=useState('');
  const [selected,setSelected]=useState(null);
  const [filter,setFilter]=useState('all');
  const [confirmation,setConfirmation]=useState(null);
  const [notice,setNotice]=useState('');
  const unlocked=useMemo(()=>characters.filter(c=>canTrainCharacter(c,profile)),[characters,profile]);
  const shown=useMemo(()=>unlocked.filter(c=>{
    const query=search.trim().toLocaleLowerCase('it');
    if(query&&!c.name.toLocaleLowerCase('it').includes(query))return false;
    const upgraded=strengthTotalLevels(profile?.strengthUpgrades,c.id)>3;
    return filter==='all'||(filter==='upgraded'&&upgraded)||(filter==='fresh'&&!upgraded);
  }),[unlocked,profile,search,filter]);
  const current=unlocked.find(c=>c.id===selected)||shown[0]||null;
  const stats=current?strengthSummary(current,profile?.strengthUpgrades):[];
  const points=Math.max(0,Number(profile?.strengthPoints)||0);
  const levelsEarned=(Object.entries(profile?.strengthUpgrades||{})).reduce((n,[id])=>
    n+(unlocked.some(c=>c.id===id)?strengthTotalLevels(profile.strengthUpgrades,id)-3:0),0);
  const confirmUpgrade=()=>{
    if(!confirmation)return;
    const result=onUpgrade(confirmation.id,confirmation.stat);
    setNotice(result?.ok?'Potenziamento completato! ⚡':result?.reason||'Impossibile potenziare.');
    setConfirmation(null);
  };
  return <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,#23365b_0%,#10172c_38%,#070d1d_90%)] text-white px-3 sm:px-6 py-5 sm:py-8">
    <div className="max-w-7xl mx-auto space-y-5">
      <header className="flex flex-wrap gap-3 justify-between items-start">
        <div className="space-y-1">
          <button type="button" onClick={onBack} className="text-sm font-bold text-cyan-300 hover:text-white">← Torna al menu</button>
          <p className="uppercase text-[10px] tracking-[.32em] text-cyan-400 font-extrabold pt-4">Centro di ricerca · Multimon</p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">⚡ Laboratorio di Potenziamento</h1>
          <p className="text-slate-300 text-sm">Sperimenta, migliora e rendi la tua squadra leggermente più forte.</p>
        </div>
        <div className="rounded-2xl border border-amber-400/60 bg-amber-950/30 px-5 py-4 shadow-[0_0_25px_rgba(251,191,36,.12)] text-right">
          <div className="text-xs uppercase font-black tracking-widest text-amber-200">⚡ Punti Forza</div>
          <div className="text-3xl font-black text-amber-300 tabular-nums">{points}</div>
          <div className="text-[10px] text-slate-400">Valuta separata dalle monete</div>
        </div>
      </header>
      <section className="grid sm:grid-cols-3 gap-3 text-center" aria-label="Regole del laboratorio">
        <div className="rounded-xl bg-slate-900/80 border border-cyan-500/30 p-3">
          <div className="text-xl font-black text-cyan-200">1 → 10</div>
          <div className="text-xs text-slate-300">Livelli per ogni statistica</div>
        </div>
        <div className="rounded-xl bg-slate-900/80 border border-violet-500/30 p-3">
          <div className="text-xl font-black text-violet-200">+1 per livello</div>
          <div className="text-xs text-slate-300">Fino a +10 per ATK, DEF e VEL</div>
        </div>
        <div className="rounded-xl bg-slate-900/80 border border-amber-500/30 p-3">
          <div className="text-xl font-black text-amber-200">2 · 4 · 6 · ... · 18</div>
          <div className="text-xs text-slate-300">Costo in Punti Forza per il livello successivo</div>
        </div>
      </section>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(290px,0.9fr)_minmax(0,1.3fr)] gap-4">
        <section className="bg-slate-900/80 rounded-3xl border border-slate-700/90 p-3 sm:p-5 min-w-0">
          <div className="flex justify-between items-center gap-2 mb-3">
            <h2 className="font-black text-lg">I tuoi Multimon</h2>
            <span className="text-xs text-cyan-300 font-bold">{unlocked.length} posseduti</span>
          </div>
          <input type="search" aria-label="Cerca Multimon posseduto" placeholder="🔎 Cerca un Multimon..." value={search}
            onChange={e=>setSearch(e.target.value)}
            className="bg-slate-950 border border-slate-700 focus:border-cyan-400 outline-none rounded-xl p-3 w-full text-sm mb-3"/>
          <div className="flex flex-wrap gap-2 mb-4">
            {[['all','Tutti'],['upgraded','Potenziati'],['fresh','Livello base']].map(([id,label])=><button key={id} type="button" onClick={()=>setFilter(id)}
              className={`px-3 py-2 text-xs font-bold rounded-lg border ${filter===id?'border-cyan-300 bg-cyan-500/20 text-cyan-200':'border-slate-700 bg-slate-950 text-slate-400'}`}>{label}</button>)}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 max-h-[520px] overflow-y-auto custom-scrollbar pr-1">
            {shown.length===0&&<p className="col-span-full text-center py-8 text-sm text-slate-400">Nessun Multimon trovato.</p>}
            {shown.map(c=>{
              const selectedId=current?.id===c.id, lv=strengthTotalLevels(profile?.strengthUpgrades,c.id);
              return <button type="button" key={c.id} onClick={()=>{setSelected(c.id);setNotice('')}}
                className={`p-3 flex flex-col items-center rounded-xl border-2 transition-colors text-center ${selectedId?'border-cyan-300 bg-cyan-950/70':'border-slate-700 bg-slate-950/75 hover:border-cyan-500'}`}>
                <img src={c.img} alt="" className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_0_9px_rgba(125,211,252,.25)]"/>
                <span className="font-bold text-xs mt-2 line-clamp-2">{c.name}</span>
                <span className="text-[10px] text-cyan-300 mt-1">⚡ {lv}/30 livelli</span>
              </button>;
            })}
          </div>
        </section>
        <section className="bg-slate-900/90 rounded-3xl border border-cyan-400/35 p-4 sm:p-6 shadow-[0_0_45px_rgba(6,182,212,.09)] min-w-0">
          {current?<div className="space-y-5">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0 rounded-3xl bg-[radial-gradient(circle,#205473_0%,#111c31_70%)] border border-cyan-400/40 grid place-items-center overflow-hidden">
                <div className="absolute inset-0 opacity-40 bg-[repeating-linear-gradient(0deg,transparent_0px,transparent_16px,rgba(34,211,238,.17)_17px)]"/>
                <img src={current.img} alt={current.name} className="w-24 h-24 sm:w-32 sm:h-32 relative z-10 object-contain drop-shadow-[0_0_18px_rgba(125,211,252,.55)]"/>
              </div>
              <div className="flex-1 min-w-[145px]">
                <p className="text-[10px] uppercase tracking-widest font-bold text-cyan-300">Soggetto selezionato</p>
                <h2 className="text-xl sm:text-3xl font-black">{current.name}</h2>
                <p className="text-xs text-slate-300 mt-2">{current.types?.join(' / ')}</p>
                <p className="text-xs text-amber-200 mt-3">⚡ Potenziamento complessivo: +{strengthTotalLevels(profile?.strengthUpgrades,current.id)} / 30</p>
              </div>
            </div>
            <div className="space-y-3">
              {stats.map(stat=>{
                const info=STRENGTH_STATS.find(x=>x.key===stat.key);
                const max=stat.level===STRENGTH_MAX_LEVEL,affordable=points>=stat.cost;
                return <div key={stat.key} className="rounded-2xl bg-slate-950/80 border border-slate-700/80 p-3 sm:p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-black text-base" style={{color:info.color}}>{info.icon} {info.label}</div>
                    <div className="font-bold text-xs text-slate-300">Livello {stat.level}/{STRENGTH_MAX_LEVEL}</div>
                  </div>
                  <div role="progressbar" aria-label={`${stat.label} livello ${stat.level}`} aria-valuenow={stat.level} aria-valuemin={1} aria-valuemax={10}
                    className="h-3 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full transition-all duration-500 rounded-full" style={{width:stat.level*10+'%',background:info.color,boxShadow:`0 0 12px ${info.color}`}}/>
                  </div>
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div className="text-sm">
                      <span className="text-slate-400">Base {stat.base}</span>
                      <span className="text-slate-400 mx-2">→</span>
                      <strong className="text-white text-lg">{stat.value}</strong>
                      <span className="text-emerald-300 text-xs ml-2">(+{stat.bonus})</span>
                    </div>
                    <div className="text-xs font-bold text-cyan-300">{max?'MASSIMO':`Prossimo: ${stat.value} → ${stat.nextValue}`}</div>
                  </div>
                  <button type="button" disabled={max||!affordable} onClick={()=>{setNotice('');setConfirmation({id:current.id,name:current.name,stat:stat.key,label:stat.label,cost:stat.cost,from:stat.value,to:stat.nextValue});}}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-45 rounded-xl text-sm font-black py-2.5">
                    {max?'✓ Statistica al livello massimo':affordable?`⚡ Potenzia · ${stat.cost} Punti Forza`:`🔒 Servono ${stat.cost} Punti Forza`}
                  </button>
                </div>;
              })}
            </div>
            <p className="text-xs text-slate-400 bg-slate-950/75 border border-slate-700 rounded-xl p-3">
              Ogni punto dà un piccolo vantaggio reale. Livello 1 = +1 gratuito per statistica; livello 10 = +10.
              Il livello 10 ha appena 9 punti in più del livello 1: il gioco resta equilibrato.
            </p>
          </div>:<div className="text-center p-14 text-slate-400">Non possiedi ancora Multimon disponibili per il laboratorio. Sbloccane uno nel Negozio.</div>}
        </section>
      </div>
      <footer className="text-xs text-slate-400 text-center">Livelli acquistati: {levelsEarned} · Tutti i profili iniziano con 0 Punti Forza. Le prossime attività potranno assegnarne.</footer>
    </div>
    {!profile?.strengthLabIntroSeen&&<ScientistTutorial profile={profile} characters={characters}
      onStep={onTutorialStep} onFreeUpgrade={onTutorialUpgrade} onComplete={onTutorialComplete}/>}
        {notice&&<div role="status" className="fixed left-1/2 bottom-4 -translate-x-1/2 z-[300] bg-slate-950 border border-cyan-400 text-cyan-200 shadow-2xl rounded-xl p-4 text-sm font-bold max-w-[90vw]">
      {notice}<button onClick={()=>setNotice('')} className="ml-4 text-slate-400" aria-label="Chiudi notifica">✕</button>
    </div>}
    {confirmation&&<div className="fixed inset-0 z-[310] bg-black/85 backdrop-blur-md grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="Conferma potenziamento">
      <div className="max-w-sm w-full bg-slate-900 border border-cyan-400 rounded-3xl p-6 space-y-4 text-center shadow-[0_0_65px_rgba(6,182,212,.25)]">
        <div className="text-5xl">⚡</div>
        <h3 className="text-2xl font-black">Confermi il potenziamento?</h3>
        <p className="text-sm text-slate-300">{confirmation.name} · {confirmation.label}</p>
        <div className="text-xl font-black text-cyan-200">{confirmation.from} → {confirmation.to} <span className="text-emerald-300">(+1)</span></div>
        <p className="text-amber-200 font-bold text-sm">Costo: {confirmation.cost} Punti Forza</p>
        <div className="flex gap-3">
          <button className="flex-1 rounded-xl bg-slate-700 py-3 font-bold" onClick={()=>setConfirmation(null)}>Annulla</button>
          <button className="flex-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 py-3 font-black" onClick={confirmUpgrade}>Potenzia!</button>
        </div>
      </div>
    </div>}
  </main>;
}
