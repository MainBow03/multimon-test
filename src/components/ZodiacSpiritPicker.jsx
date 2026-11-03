import React, {useState} from 'react';
import {ZODIAC_SPIRITS,normalizeZodiacSpirit,zodiacSpiritInfo} from '../systems/zodiacSpirits.js';

/** Il giocatore sceglie una chiave stellare; le immagini sono quelle dei personaggi richiesti. */
export function ZodiacSpiritPicker({value,onChange,compact=false}){
 const selected=normalizeZodiacSpirit(value);
 const chosen=zodiacSpiritInfo(selected);
 return <section className="rounded-2xl border border-amber-400/50 bg-gradient-to-br from-indigo-950/90 via-slate-900 to-violet-950/80 p-3 sm:p-4" aria-label="Scegli lo Spirito Stellare di Lucy">
   <div className="flex gap-3 items-center mb-3">
     <img src={chosen.img} alt={chosen.name} className="w-12 h-12 rounded-xl object-cover border-2 border-amber-300 bg-slate-800" />
     <div className="min-w-0">
       <h3 className="text-amber-200 font-black text-sm sm:text-base">✨ Spiriti dello Zodiaco · {chosen.name}</h3>
       <p className="text-xs text-indigo-200">Lucy evoca lo Spirito selezionato quando entra in campo.</p>
       <p className="text-xs text-slate-300">Effetto di Apertura Forzata: {chosen.secondary}</p>
     </div>
   </div>
   <div className={compact?'grid grid-cols-4 gap-1.5':'grid grid-cols-4 sm:grid-cols-8 gap-2'}>
     {ZODIAC_SPIRITS.map(spirit=><button type="button" key={spirit.id}
       aria-pressed={selected===spirit.id}
       title={spirit.name+' · '+spirit.type+' · '+spirit.secondary}
       onClick={()=>onChange(spirit.id)}
       className={'min-w-0 rounded-xl border p-1.5 flex flex-col items-center gap-1 transition-all '+(selected===spirit.id?
         'border-amber-300 bg-amber-500/20 shadow-[0_0_13px_rgba(251,191,36,.3)]':'border-slate-600 bg-slate-950/60 hover:border-violet-400')}>
       <img src={spirit.img} alt={spirit.name} loading="lazy" className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-slate-800 object-cover"/>
       <span className={'text-[10px] sm:text-xs font-black truncate max-w-full '+(selected===spirit.id?'text-amber-200':'text-slate-200')}>{spirit.name}</span>
       {!compact&&<span className="text-[9px] text-slate-400">{spirit.type}</span>}
     </button>)}
   </div>
   {!compact&&<p className="text-[11px] text-slate-400 mt-2">Ogni Spirito è un alleato evocato, non un Multimon acquistabile o selezionabile singolarmente. Solo uno attivo per Lucy.</p>}
 </section>;
}
export function ZodiacSwitchChoice({hero,actionLabel='Manda Lucy in campo',onChoose,compact=true}){
 const [selected,setSelected]=useState(()=>normalizeZodiacSpirit(hero.zodiacSpiritId));
 return <div className="col-span-2 rounded-2xl border border-amber-400/40 bg-slate-900/80 p-3 space-y-3">
   <div className="flex items-center gap-3">
     <img src={hero.img} alt={hero.name} className="w-14 h-14 rounded-full object-cover border-2 border-amber-400"/>
     <div><h3 className="font-black text-white">Lucy Heartfilia</h3><p className="text-xs text-amber-200">Scegli lo Spirito da evocare al suo ingresso.</p></div>
   </div>
   <ZodiacSpiritPicker value={selected} onChange={setSelected} compact={compact}/>
   <button type="button" onClick={()=>onChoose(selected)}
     className="w-full rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-black font-black px-4 py-3 hover:brightness-110">
     ✨ {actionLabel} · {zodiacSpiritInfo(selected).name}
   </button>
 </div>;
}
