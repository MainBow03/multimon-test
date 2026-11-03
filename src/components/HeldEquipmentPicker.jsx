import React,{useMemo,useState} from 'react';
import { ITEMS_DB } from '../data/items.js';
import { getEquippedCount } from '../systems/heldEquipment.js';
import { ItemArtwork } from './ItemArtwork.jsx';

// Schede condivise fra il draft delle battaglie e la selezione delle campagne.
export function HeldEquipmentCard({hero,index,team=[],inventory={},selectedItem='',onEquip}){
 const equipped=ITEMS_DB[selectedItem]?.type==='held'?ITEMS_DB[selectedItem]:null;
 const owned=Object.values(ITEMS_DB).filter(item=>item.type==='held'&&(Number(inventory[item.id])||0)>0);
 return <div className="group min-w-0 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/70 p-3 shadow-lg hover:border-violet-400/60 transition-colors">
   <div className="flex gap-3 items-center mb-3">
     <img src={hero.img} alt="" className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-xl border-2 border-slate-600 group-hover:border-cyan-400 shrink-0"/>
     <div className="min-w-0 flex-1">
       <div className="text-xs sm:text-sm font-black text-white truncate">{hero.name}</div>
       <div className="text-[10px] font-bold uppercase tracking-wider text-violet-300 mt-1">Equipaggiamento</div>
     </div>
     <div className="w-12 h-12 shrink-0 rounded-xl border border-violet-400/35 bg-violet-900/30 flex items-center justify-center">
       {equipped?<ItemArtwork id={equipped.id} size={40}/>:<span className="text-violet-300/70 text-xl">＋</span>}
     </div>
   </div>
   <label className="block">
     <span className="text-[11px] font-semibold text-slate-300">Strumento da assegnare</span>
     <select aria-label={`Strumento per ${hero.name}`} value={selectedItem||''} onChange={e=>onEquip(e.target.value)}
       className="mt-1 w-full min-w-0 rounded-lg border border-violet-400/40 bg-slate-800 py-2.5 px-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-violet-400">
       <option value="">Nessuno strumento</option>
       {owned.map(item=>{
         const count=Number(inventory[item.id])||0;
         const remaining=count-getEquippedCount(team,item.id,index);
         return <option key={item.id} value={item.id} disabled={remaining<=0&&selectedItem!==item.id}>
           {item.name} · {remaining>0?remaining+' disp.':'tutte assegnate'}
         </option>;
       })}
     </select>
   </label>
   <div className="mt-3 flex items-start gap-2 rounded-lg border border-slate-700/70 bg-slate-900/75 px-2.5 py-3 min-h-[74px]">
      {equipped?<ItemArtwork id={equipped.id} size={26}/>:<span className="text-cyan-400 text-lg">ⓘ</span>}
      <div className="min-w-0">
        <div className="font-bold text-[11px] text-cyan-200 mb-1">{equipped?.name||'Nessuno strumento equipaggiato'}</div>
        <p className="text-[11px] text-slate-300 leading-relaxed">{equipped?.desc||'Puoi scegliere uno strumento dal menu sopra. Leggi la sua descrizione prima di assegnarlo.'}</p>
      </div>
   </div>
 </div>;
}

export function HeldEquipmentGuide({inventory={}}){
 const [open,setOpen]=useState(false);
 const [query,setQuery]=useState('');
 const held=useMemo(()=>Object.values(ITEMS_DB).filter(item=>item.type==='held'),[]);
 const filtered=held.filter(item=>(item.name+' '+item.desc).toLocaleLowerCase('it').includes(query.trim().toLocaleLowerCase('it')));
 return <section className="rounded-2xl border border-cyan-400/30 bg-slate-900/65 mt-4 overflow-hidden">
   <button type="button" onClick={()=>setOpen(x=>!x)} aria-expanded={open}
     className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-800/60 transition-colors">
     <span>
       <strong className="block text-sm text-cyan-200">📖 Guida agli strumenti</strong>
       <span className="text-[11px] text-slate-400">Consulta effetti, limiti e copie possedute, anche prima di acquistarli.</span>
     </span>
     <span className="text-violet-200 text-lg font-black">{open?'−':'+'}</span>
   </button>
   {open&&<div className="p-3 sm:p-4 border-t border-cyan-400/25">
     <input type="search" aria-label="Cerca uno strumento" placeholder="Cerca per nome o effetto..." value={query} onChange={e=>setQuery(e.target.value)}
       className="w-full rounded-lg bg-slate-950 border border-slate-600 focus:border-cyan-400 focus:outline-none p-3 text-sm text-white mb-3"/>
     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
       {filtered.map(item=>{
         const count=Number(inventory[item.id])||0;
         return <div key={item.id} className={`flex items-start gap-3 rounded-xl border p-3 ${count>0?'border-emerald-500/30 bg-emerald-950/15':'border-slate-700/70 bg-slate-950/75'}`}>
           <div className="shrink-0 w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center"><ItemArtwork id={item.id} size={41}/></div>
           <div className="min-w-0 flex-1">
             <div className="font-black text-xs text-white">{item.name}</div>
             <div className={`text-[10px] font-bold mt-0.5 ${count?'text-emerald-300':'text-slate-500'}`}>{count?`Posseduti: ${count}`:'Non posseduto'}</div>
             <p className="mt-1.5 text-[11px] leading-relaxed text-slate-300">{item.desc}</p>
           </div>
         </div>;
       })}
       {filtered.length===0&&<p className="p-4 text-slate-400">Nessuno strumento trovato.</p>}
     </div>
   </div>}
 </section>;
}
