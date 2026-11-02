import React,{useState} from 'react';
import { FINN_CHEST_IMAGE } from '../../systems/roguelikePowerRewards.js';

// Due tutorial distinti. Quello lungo riguarda i Bauli del menu Campagna,
// il mini-dialogo spiega esclusivamente le Casse Potenza Roguelike.
export const FINN_CAMPAIGN_CHEST_DIALOGUES=[
  'Whoa, aspetta un secondo! Hai visto quel baule? Non è un baule qualunque, è un vero tesoro del Multiverso! Sono una figata, fidati!',
  'Ogni volta che superi una missione della Campagna ne ottieni uno. E se avevi già superato qualche missione, niente paura: i tuoi bauli ti aspettano qui. Nessuno perde i premi!',
  'Dentro ogni baule ci sono DUE ricompense a sorpresa. Puoi trovare monete, Punti Forza per allenare i tuoi Multimon, pozioni e altre cure utilissime.',
  'E non finisce qui! Se hai davvero fortuna, puoi scoprire uno strumento da battaglia oppure addirittura un Multimon tutto nuovo. Figo da matti, eh?',
  'La parte più divertente? Ogni premio viene estratto per conto suo. Può capitare anche la stessa ricompensa due volte di fila. È tutto questione di fortuna, fratello!',
  'Puoi tenere i bauli da parte e aprirli quando preferisci. Ma ora dai, apriamo questo scrigno! Avventura, tesori e sorprese: MATEMATICO!'
];
export const FINN_POWER_CHEST_DIALOGUES=[
  'Ehi, aspetta! Questa è una Cassa Potenza, non il solito Baule Campagna. Si conquista durante la Roguelike: una ogni 5 piani superati!',
  'Qui niente monete né oggetti: trovi SOLO Punti Forza, da 2 a 8 per cassa. Usali nel Laboratorio per dare una piccola spinta ai tuoi Multimon!',
  'E se sconfiggi il boss finale della Roguelike? BOOM, 30 Punti Forza bonus! Puoi ottenerli di nuovo dopo 4 ore dall’ultima ricompensa. Dai, apriamo una cassa: sarà una figata!'
];
export function FinnChestTutorial({kind='campaign',onComplete,onClose}){
  const lines=kind==='power'?FINN_POWER_CHEST_DIALOGUES:FINN_CAMPAIGN_CHEST_DIALOGUES;
  const [step,setStep]=useState(0),[error,setError]=useState('');
  const last=step===lines.length-1;
  const done=()=>{
    const result=onComplete();
    if(result?.ok||result?.reason==='already_seen')onClose();
    else setError(result?.reason||'Non è stato possibile registrare il tutorial.');
  };
  return <div className="fixed inset-0 z-[500] bg-[#020617]/95 backdrop-blur-lg flex items-center justify-center p-3 sm:p-6">
    <section role="dialog" aria-modal="true" aria-label={kind==='power'?'Finn spiega le Casse Potenza':'Finn spiega i Bauli Campagna'}
      className="max-w-3xl w-full max-h-[94dvh] overflow-y-auto rounded-3xl border-2 border-cyan-400/55 bg-gradient-to-br from-slate-900 via-[#0e2340] to-blue-950 shadow-[0_0_65px_rgba(56,189,248,.22)]">
      <div className="flex flex-wrap justify-between gap-3 p-4 sm:px-7 sm:py-5 border-b border-cyan-400/25">
        <div><p className="text-[10px] tracking-[.3em] font-black text-cyan-300 uppercase">Una guida con Finn</p>
          <h2 className="text-xl sm:text-2xl font-black text-white">{kind==='power'?'Casse Potenza Roguelike':'Bauli della Campagna'}</h2></div>
        <span className="text-xs text-cyan-200 font-bold">Dialogo {step+1} / {lines.length}</span>
      </div>
      <div className="grid sm:grid-cols-[210px_minmax(0,1fr)] gap-5 p-4 sm:p-7 items-center">
        <div className="rounded-2xl border border-cyan-400/35 bg-[radial-gradient(ellipse_at_center,#275e87,#070e24)] p-3">
          <img src={FINN_CHEST_IMAGE} alt="Finn l'Umano che spiega i bauli" className="w-full h-48 sm:h-64 object-contain drop-shadow-[0_0_18px_rgba(125,211,252,.25)]"/>
          <p className="text-xs font-black text-center text-cyan-200 tracking-widest mt-2">FINN L'UMANO</p>
        </div>
        <div className="space-y-5">
          <div className="bg-slate-950/65 p-4 sm:p-6 rounded-2xl border border-sky-400/35 min-h-[150px] flex items-center">
            <p className="text-base sm:text-lg font-semibold leading-relaxed text-slate-100">{lines[step]}</p>
          </div>
          {error&&<p className="text-rose-300 text-sm" role="alert">{error}</p>}
          <div className="flex flex-wrap justify-between gap-3">
            <button disabled={step===0} onClick={()=>setStep(v=>Math.max(0,v-1))} className="rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 disabled:opacity-35 text-slate-200 font-bold">Indietro</button>
            {last?<button onClick={done} className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-white font-black">{kind==='power'?'Apri la Cassa Potenza!':'Apriamo il baule!'}</button>:
              <button onClick={()=>setStep(v=>v+1)} className="rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 px-6 py-3 text-white font-black">Continua</button>}
          </div>
        </div>
      </div>
      <div className="flex gap-1 px-4 sm:px-7 pb-5">{lines.map((_,index)=><div key={index} className={`h-1.5 rounded-full flex-1 ${index<=step?'bg-cyan-400':'bg-slate-700'}`}/>)}</div>
    </section>
  </div>;
}
