import React, {useEffect,useMemo,useState} from 'react';
import { GAME_UPDATES, UPDATE_CATEGORIES, UPDATE_COUNT } from '../data/updateHistory.js';

export function UpdateHistoryPanel({appMode='menu',hideLauncher=false}) {
  const [open,setOpen]=useState(false);
  const [category,setCategory]=useState('all');
  const [search,setSearch]=useState('');
  const [expanded,setExpanded]=useState({});
  const entries=useMemo(()=>{
    const query=search.trim().toLocaleLowerCase('it');
    return GAME_UPDATES.filter(section=>
      (category==='all'||section.category===category) &&
      (!query||[section.title,section.date,...section.items].join(' ').toLocaleLowerCase('it').includes(query))
    );
  },[category,search]);
  useEffect(()=>{
    if(!open)return;
    const onKey=e=>{if(e.key==='Escape')setOpen(false)};
    window.addEventListener('keydown',onKey);
    return()=>window.removeEventListener('keydown',onKey);
  },[open]);
  useEffect(()=>{
    const openFromMenu=()=>setOpen(true);
    window.addEventListener('multimon:open-updates',openFromMenu);
    return()=>window.removeEventListener('multimon:open-updates',openFromMenu);
  },[]);
  return <>
    {!hideLauncher&&<button type="button" onClick={()=>setOpen(true)} aria-haspopup="dialog"
      aria-label="Apri registro aggiornamenti e bilanciamenti"
      className={`fixed right-3 sm:right-5 z-[85] px-3 py-2.5 rounded-xl border border-violet-400/65 bg-slate-950/95 text-violet-200 text-xs font-black shadow-[0_0_18px_rgba(139,92,246,0.3)] hover:bg-violet-900/70 hover:text-white backdrop-blur-md transition-colors ${appMode==='menu'?'bottom-4':'top-20'}`}>
      📜 Aggiornamenti
    </button>}
    {open&&<div className="fixed inset-0 z-[350] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-5"
      onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false);}}>
      <section role="dialog" aria-modal="true" aria-labelledby="update-history-title"
        className="bg-slate-950 text-slate-100 w-full max-w-4xl max-h-[94dvh] sm:max-h-[88vh] flex flex-col rounded-2xl sm:rounded-3xl border border-violet-500/55 shadow-[0_0_75px_rgba(139,92,246,0.25)] overflow-hidden">
        <header className="shrink-0 px-4 py-4 sm:px-7 sm:py-5 bg-gradient-to-r from-violet-950 via-slate-950 to-indigo-950 border-b border-violet-500/35 flex justify-between gap-3 items-start">
          <div className="min-w-0">
            <div className="text-[10px] font-black tracking-[0.25em] uppercase text-violet-300">Multimon · Cronologia del gioco</div>
            <h2 id="update-history-title" className="text-xl sm:text-3xl font-black text-white mt-1">📜 Registro aggiornamenti</h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">Tutte le modifiche di questa conversazione, ordinate dalla più recente. {GAME_UPDATES.length} sezioni · {UPDATE_COUNT} dettagli.</p>
          </div>
          <button type="button" aria-label="Chiudi registro aggiornamenti" onClick={()=>setOpen(false)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-white text-lg font-black shrink-0">✕</button>
        </header>
        <div className="shrink-0 p-3 sm:px-6 sm:py-4 border-b border-slate-700/70 bg-slate-900/90 space-y-3">
          <label className="sr-only" htmlFor="update-history-search">Cerca un aggiornamento</label>
          <input id="update-history-search" value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="🔎 Cerca una mossa, un Multimon, una passiva o un bug..."
            className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-violet-400 outline-none text-sm text-white placeholder:text-slate-500"/>
          <nav aria-label="Filtra aggiornamenti per categoria" className="flex gap-2 overflow-x-auto pb-1">
            {UPDATE_CATEGORIES.map(c=><button key={c.id} type="button" aria-pressed={category===c.id}
              onClick={()=>setCategory(c.id)}
              className={`shrink-0 px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${category===c.id?'bg-violet-600 border-violet-400 text-white':'bg-slate-950 border-slate-700 text-slate-300 hover:border-violet-500'}`}>
              {c.icon} {c.name}
            </button>)}
          </nav>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 sm:p-6 space-y-3">
          {entries.length===0&&<div className="text-center p-9 text-slate-400 bg-slate-900 rounded-xl">Nessun aggiornamento trovato. Cambia ricerca o categoria.</div>}
          {entries.map((section,index)=>{
            const isOpen=expanded[section.id]??(category!=='all'||Boolean(search.trim())||index<2);
            const cat=UPDATE_CATEGORIES.find(x=>x.id===section.category);
            return <article key={section.id} className="rounded-xl border border-slate-700/85 bg-slate-900/75 overflow-hidden">
              <button type="button" aria-expanded={isOpen} onClick={()=>setExpanded(previous=>({...previous,[section.id]:!isOpen}))}
                className="w-full px-3 py-3 sm:p-4 text-left flex gap-3 items-center hover:bg-slate-800/70 transition-colors">
                <span className="text-xl sm:text-2xl shrink-0">{cat?.icon||'📜'}</span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm sm:text-base font-extrabold text-white">{section.title}</span>
                  <span className="block mt-1 text-[10px] sm:text-xs text-slate-400">{cat?.name} · {section.date} · {section.items.length} dettagli</span>
                </span>
                <span className="text-violet-300 font-black text-xl shrink-0">{isOpen?'−':'+'}</span>
              </button>
              {isOpen&&<div className="border-t border-slate-700/70 px-3 py-3 sm:px-5 sm:py-4 bg-slate-950/55">
                <ul className="space-y-3">
                  {section.items.map((item,i)=><li key={i} className="flex gap-3 text-xs sm:text-sm leading-relaxed text-slate-200">
                    <span className="text-violet-400 shrink-0 mt-0.5">✦</span>
                    <span>{item}</span>
                  </li>)}
                </ul>
              </div>}
            </article>;
          })}
        </div>
        <footer className="shrink-0 px-4 py-3 bg-slate-900 border-t border-slate-700 flex flex-wrap justify-between items-center gap-2 text-[10px] sm:text-xs text-slate-400">
          <span>Le spiegazioni non cambiano il salvataggio né interrompono lo scontro.</span>
          <button type="button" onClick={()=>setOpen(false)} className="bg-violet-700 hover:bg-violet-600 rounded-lg px-4 py-2 text-white font-bold">Torna al gioco</button>
        </footer>
      </section>
    </div>}
  </>;
}
