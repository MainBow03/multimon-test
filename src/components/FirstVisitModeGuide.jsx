import React,{useState} from 'react';
import {CHARACTERS} from '../data/characters.js';

// Una guida unica e breve per ogni pulsante principale, con un volto diverso.
// Le immagini provengono dallo stesso roster usato in battaglia.
import {MODE_GUIDES} from './ModeGuideData.js';

export function FirstVisitModeGuide({guideKey,onCancel,onContinue}){
 const [step,setStep]=useState(0);
 const guide=MODE_GUIDES[guideKey];
 if(!guide)return null;
 const char=CHARACTERS.find(c=>c.id===guide.character);
 const last=step>=guide.lines.length-1;
 return <div className="fixed inset-0 z-[460] flex items-center justify-center bg-slate-950/95 p-4 text-white backdrop-blur-md">
  <section role="dialog" aria-modal="true" aria-label={'Guida: '+guide.title}
   className="w-full max-w-2xl overflow-hidden rounded-3xl border-2 border-cyan-500/40 bg-gradient-to-br from-slate-900 via-[#13223c] to-indigo-950 shadow-[0_0_70px_rgba(79,70,229,.25)]">
   <div className="flex items-center justify-between gap-3 border-b border-slate-600/50 p-5">
    <div><p className="text-xs font-black uppercase tracking-widest text-cyan-300">La prima volta in questa modalità</p>
     <h2 className="mt-1 text-xl sm:text-2xl font-black">{guide.title}</h2></div>
    <span className="text-xs font-bold text-slate-300">{step+1}/{guide.lines.length}</span>
   </div>
   <div className="grid gap-4 p-5 sm:grid-cols-[155px_1fr] sm:p-7">
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-slate-950/50 p-3 border border-cyan-500/25">
     {char?.img?<img src={char.img} alt={char.name} className="h-36 w-36 object-contain drop-shadow-[0_0_18px_rgba(34,211,238,.25)]"/>:
      <span className="p-10 text-5xl">✨</span>}
     <span className="text-center text-xs font-black text-cyan-200">{char?.name||'Guida Multimon'}</span>
    </div>
    <div className="flex flex-col justify-between gap-5">
     <p className="rounded-xl border border-slate-600/70 bg-slate-950/60 p-5 text-base leading-relaxed text-slate-100">“{guide.lines[step]}”</p>
     <div className="flex flex-wrap justify-end gap-2">
      <button type="button" onClick={onCancel} className="rounded-xl border border-slate-600 px-4 py-3 font-bold text-slate-300 hover:bg-slate-800">Non ora</button>
      {step>0&&<button type="button" onClick={()=>setStep(v=>v-1)} className="rounded-xl border border-slate-600 px-4 py-3 font-bold">Indietro</button>}
      <button type="button" onClick={()=>last?onContinue():setStep(v=>v+1)}
       className="rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 px-6 py-3 font-black hover:brightness-110">
       {last?'Ho capito, apri!':'Continua'}</button>
     </div>
    </div>
   </div>
   <div className="flex gap-1 px-5 pb-5">{guide.lines.map((_,i)=><div key={i} className={'h-1.5 flex-1 rounded-full '+(i<=step?'bg-cyan-400':'bg-slate-700')}/>)}</div>
  </section>
 </div>;
}
