import React,{useEffect,useState} from 'react';
import { FinnChestTutorial } from './FinnChestTutorial.jsx';
import { roguelikeBonusRemaining,ROGUELIKE_FULL_CLEAR_COOLDOWN_MS } from '../../systems/roguelikePowerRewards.js';
import {ArrowLeft,ChevronRight,CheckCircle} from '../../components/ChestIcons.jsx';

function PowerChestArtwork({opened=false}){
 return <svg viewBox="0 0 420 330" role="img" aria-label={opened?'Cassa Potenza aperta':'Cassa Potenza chiusa'}
   className="w-full max-w-[390px] mx-auto drop-shadow-[0_20px_40px_rgba(56,189,248,.28)]">
   <defs>
    <linearGradient id="power-metal" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#8eeaff"/><stop offset=".36" stopColor="#3777b4"/><stop offset=".8" stopColor="#1d315f"/><stop offset="1" stopColor="#0f1b34"/></linearGradient>
    <linearGradient id="power-crystal" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff"/><stop offset=".3" stopColor="#67e8f9"/><stop offset=".7" stopColor="#818cf8"/><stop offset="1" stopColor="#a855f7"/></linearGradient>
    <radialGradient id="power-aura"><stop stopColor="#67e8f9" stopOpacity=".8"/><stop offset="1" stopColor="#0ea5e9" stopOpacity="0"/></radialGradient>
   </defs>
   <ellipse cx="210" cy="292" rx="150" ry="24" fill="#010a20" opacity=".7"/>
   <circle cx="210" cy="155" r="150" fill="url(#power-aura)" opacity={opened?'.9':'.45'}/>
   <g className={opened?'power-lid-open':''} style={{transformOrigin:'215px 147px'}}>
    <path d="M62 147 103 65 318 65 363 147 329 173 92 173z" fill="url(#power-metal)" stroke="#a5f3fc" strokeWidth="6"/>
    <path d="M114 88h192l28 55H87z" fill="#111b39" stroke="#4fc3e6" strokeWidth="3"/>
    <path d="M210 83 238 118 210 156 182 118z" fill="url(#power-crystal)" stroke="#cffafe" strokeWidth="4"/>
    <path d="M94 146h240" stroke="#a5f3fc" strokeWidth="6"/>
   </g>
   <path d="M67 157 354 157 335 272 90 272z" fill="#192b51" stroke="#67e8f9" strokeWidth="7"/>
   <path d="M91 156 91 270M331 156 331 270M81 264h264" fill="none" stroke="url(#power-metal)" strokeWidth="18"/>
   <rect x="181" y="165" width="58" height="75" rx="12" fill="url(#power-metal)" stroke="#9be8ff" strokeWidth="5"/>
   <path d="m210 181 18 23-18 26-18-26z" fill="url(#power-crystal)" stroke="white" strokeWidth="3"/>
   <style>{`
    .power-lid-open{transform:translateY(-55px) rotate(-8deg)}
    @media(prefers-reduced-motion:no-preference){.power-lid-open{transition:transform .6s cubic-bezier(.17,.67,.32,1.2)}}
   `}</style>
  </svg>;
}
const countdown=ms=>{
 const total=Math.max(0,Math.ceil(ms/1000));
 return [Math.floor(total/3600),Math.floor(total%3600/60),total%60].map(v=>String(v).padStart(2,'0')).join(':');
};
export function PowerChestsView({profile,onOpen,onAcknowledge,onTutorialComplete,onBack}){
 const power=profile?.roguelikePower||{},pending=power.pending||[],receipt=power.activeReveal;
 const seen=!!power.powerTutorialSeen;
 const [tutorial,setTutorial]=useState(false),[revealed,setRevealed]=useState(!!receipt),[error,setError]=useState('');
 const [now,setNow]=useState(Date.now());
 useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(t)},[]);
 const remaining=roguelikeBonusRemaining(profile,now);
 const open=()=>{setError('');if(!seen){setTutorial(true);return}const result=onOpen();if(result?.ok){setRevealed(false);setError('')}else setError(result?.reason||'Impossibile aprire la cassa.')};
 const tutorialDone=()=>onTutorialComplete('power');
 const afterTutorial=()=>{setTutorial(false);const result=onOpen();if(result?.ok){setRevealed(false);setError('')}else setError(result?.reason||'Non hai casse da aprire.');};
 const dismiss=()=>{const result=onAcknowledge();if(result?.ok){setRevealed(false);setError('')}};
 return <main className="min-h-screen text-white bg-[radial-gradient(ellipse_at_top,#172e63_0%,#0f1431_48%,#030817_100%)] px-3 py-5 sm:px-6 sm:py-10">
  <div className="max-w-5xl mx-auto space-y-6">
   <header className="flex flex-wrap justify-between items-start gap-3">
    <div><button type="button" onClick={onBack} className="font-bold text-cyan-200 hover:text-white flex items-center gap-2 text-sm"><ArrowLeft size={18}/> Torna al menu</button>
     <p className="text-xs text-cyan-300 font-black tracking-[.28em] mt-6">ENERGIA ROGUELIKE</p>
     <h1 className="text-3xl sm:text-5xl font-black mt-1">Casse Potenza</h1>
     <p className="text-slate-300 text-sm mt-2">Ogni 5 piani superati nella Roguelike, una cassa da 2 a 8 Punti Forza.</p>
    </div>
    <div className="rounded-2xl border border-cyan-400/60 bg-slate-950/70 px-6 py-4 text-center shadow-[0_0_28px_rgba(34,211,238,.13)]">
     <p className="text-xs font-black text-cyan-200 tracking-wider">CASSE DISPONIBILI</p>
     <p className="text-4xl font-black text-white">{pending.length}</p>
     <p className="text-[10px] text-slate-400">{(power.opened||[]).length} aperte</p>
    </div>
   </header>
   <section className="rounded-3xl border border-cyan-400/35 bg-slate-950/70 shadow-[0_20px_80px_rgba(0,0,0,.45)] p-4 sm:p-8 text-center space-y-4">
    <div className="max-w-sm mx-auto"><PowerChestArtwork opened={!!receipt}/></div>
    {receipt?<div className="space-y-4">
      <h2 className="text-2xl font-black text-cyan-200">Cassa Potenza aperta!</h2>
      {revealed?<div className="max-w-sm mx-auto rounded-2xl border-2 border-cyan-300/70 bg-gradient-to-b from-cyan-950 via-blue-950 to-indigo-950 p-6 shadow-[0_0_40px_rgba(34,211,238,.15)]">
        <p className="text-xs tracking-widest text-cyan-200 font-bold">RICOMPENSA OTTENUTA</p>
        <p className="text-5xl font-black text-white mt-3">+{receipt.points}</p>
        <p className="text-base font-bold text-cyan-200 mt-2">Punti Forza</p>
      </div>:<p className="text-slate-300">La ricompensa è già stata salvata. Scoprila!</p>}
      <button type="button" onClick={revealed?dismiss:()=>setRevealed(true)}
       className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-indigo-600 font-black rounded-xl text-white">
       {revealed?'Conserva i punti e continua':'Rivela i Punti Forza'}
      </button>
    </div>:<div className="space-y-4">
      <h2 className="text-2xl font-black text-cyan-200">{pending.length?'La prossima cassa è pronta!':'Nessuna Cassa Potenza da aprire'}</h2>
      <p className="text-slate-300 text-sm">{pending.length?'Ogni cassa dà esclusivamente Punti Forza, da 2 a 8.':'Raggiungi e supera i piani 5, 10, 15 e così via nella Roguelike per ottenere casse.'}</p>
      <button type="button" disabled={!pending.length} onClick={open}
       className="px-10 py-4 font-black rounded-xl text-white bg-gradient-to-r from-cyan-500 to-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_24px_rgba(56,189,248,.2)]">Apri Cassa Potenza</button>
    </div>}
    {error&&<p role="alert" className="text-rose-300 font-bold text-sm">{error}</p>}
   </section>
   <section className="border border-violet-400/35 bg-slate-900/75 rounded-2xl p-4 sm:p-6 flex flex-wrap gap-4 justify-between items-center">
    <div className="space-y-2"><h3 className="text-xl font-black text-white">Premio per vittoria completa: +30 PF</h3>
     <p className="text-sm text-slate-300">Una volta ogni 4 ore dall'ultima vittoria premiata, anche se giochi altre run durante l'attesa.</p></div>
    <div className="text-center rounded-xl border border-violet-400/45 bg-slate-950/80 p-4 min-w-[165px]">
     <p className="text-xs font-bold text-violet-300">PROSSIMO BONUS</p>
     <p className={`text-2xl font-black mt-2 tabular-nums ${remaining?'text-amber-300':'text-emerald-300'}`}>{remaining?countdown(remaining):'DISPONIBILE'}</p>
    </div>
   </section>
  </div>
  {tutorial&&<FinnChestTutorial kind="power" onComplete={tutorialDone} onClose={afterTutorial}/>}
 </main>;
}
