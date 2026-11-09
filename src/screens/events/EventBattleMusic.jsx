import React,{useEffect,useState} from 'react';
import {DEFAULT_BATTLE_SOUNDTRACK,soundtrackForId,soundtrackVideoUrl} from '../../data/soundtracks.js';

// Player YouTube autorizzato: la musica non viene scaricata o re-hostata.
// La riproduzione parte dopo un gesto dell'utente, per rispettare le regole dei browser.
export function EventBattleMusic({soundtrack=DEFAULT_BATTLE_SOUNDTRACK,matchId}){
 const [open,setOpen]=useState(false);
 const track=soundtrackForId(soundtrack);
 useEffect(()=>{setOpen(false);},[matchId,soundtrack]);
 return <div className="fixed top-[55px] right-3 z-[185] max-w-[min(90vw,370px)] text-white">
  <div className="rounded-xl border border-cyan-400/70 bg-slate-950/95 backdrop-blur-md shadow-[0_0_20px_rgba(34,211,238,.17)] overflow-hidden">
   <button type="button" onClick={()=>setOpen(v=>!v)}
     className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-800/90">
     <span aria-hidden="true" className="text-lg">🎵</span>
     <span className="flex-1 min-w-0"><strong className="text-[11px] font-black truncate block">{track.name}</strong>
      <small className="text-[9px] text-sky-300">{open?'Anteprima OST attiva':'Soundtrack della battaglia'}</small></span>
     <span className="text-xs font-bold text-cyan-200">{open?'■ Chiudi':'▶ Avvia'}</span>
   </button>
   {open&&<div className="p-2 pt-0">
    <iframe className="w-[340px] max-w-full h-[197px] rounded-lg border border-slate-600 bg-black"
      src={`https://www.youtube.com/embed/${encodeURIComponent(track.id)}?autoplay=1&controls=1&playsinline=1&loop=1&playlist=${encodeURIComponent(track.id)}`}
      allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin" title={'Musica battaglia: '+track.name}/>
    <a href={soundtrackVideoUrl(track.id)} target="_blank" rel="noopener noreferrer"
      className="block text-[10px] underline text-cyan-200 mt-1">Apri su YouTube se il video non è incorporabile ↗</a>
   </div>}
  </div>
 </div>;
}
