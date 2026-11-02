import React,{useState} from 'react';
import {ArrowLeft,Coins,Dumbbell,HeartPulse,Shield,Star,Gift,PackageOpen,ChevronRight} from '../../components/ChestIcons.jsx';

const TONES={
  strength:{title:'PUNTI FORZA',color:'#67e8f9',border:'border-cyan-400/70',bg:'from-cyan-950/95 to-blue-950/80',Icon:Dumbbell},
  coins:{title:'MONETE',color:'#fcd34d',border:'border-amber-400/70',bg:'from-amber-950/90 to-slate-950',Icon:Coins},
  healing:{title:'CURA',color:'#86efac',border:'border-emerald-400/70',bg:'from-emerald-950/90 to-slate-950',Icon:HeartPulse},
  held:{title:'STRUMENTO DA BATTAGLIA',color:'#c4b5fd',border:'border-violet-400/70',bg:'from-violet-950/90 to-slate-950',Icon:Shield},
  character:{title:'MULTIMON RARO',color:'#fda4af',border:'border-rose-400/70',bg:'from-rose-950/90 to-slate-950',Icon:Star}
};
const label=r=>r.kind==='strength'?r.value+' Punti Forza'
  :r.kind==='coins'?r.value+' monete'
  :r.kind==='healing'||r.kind==='held'?(r.name||r.id)+' ×'+(r.count||1):r.name;
function ChestArtwork({open=false}){
 return <svg viewBox="0 0 520 420" role="img" aria-label={open?'Scrigno magico aperto':'Scrigno magico chiuso'}
   className={'w-full max-w-[420px] mx-auto overflow-visible '+(open?'vault-open':'vault-idle')}>
  <defs>
   <linearGradient id="cwood" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#43627c"/><stop offset=".46" stopColor="#243c5c"/><stop offset="1" stopColor="#0b1632"/></linearGradient>
   <linearGradient id="cmetal" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff0b0"/><stop offset=".30" stopColor="#d5a951"/><stop offset=".65" stopColor="#8c5925"/><stop offset="1" stopColor="#f6dc8c"/></linearGradient>
   <radialGradient id="cglow"><stop stopColor="#a5f3fc" stopOpacity=".95"/><stop offset=".4" stopColor="#60a5fa" stopOpacity=".5"/><stop offset="1" stopColor="#818cf8" stopOpacity="0"/></radialGradient>
   <filter id="cshadow"><feGaussianBlur stdDeviation="15"/></filter>
  </defs>
  <ellipse cx="260" cy="368" rx="197" ry="28" fill="#000" opacity=".7" filter="url(#cshadow)"/>
  <circle cx="260" cy="200" r="200" fill="url(#cglow)" opacity={open?'.85':'.28'} className="vault-glow"/>
  {open&&<g className="vault-rays" stroke="#d7f7ff" opacity=".65" strokeWidth="4">{Array.from({length:12},(_,i)=>{
    const a=i*Math.PI/6;return <line key={i} x1={260+Math.cos(a)*75} y1={220+Math.sin(a)*55} x2={260+Math.cos(a)*185} y2={220+Math.sin(a)*160}/>;
  })}</g>}
  <g className="vault-lid" style={{transformOrigin:'255px 230px'}}>
    <path d="M80 228 L80 148 Q91 97 152 78 Q257 47 368 81 Q436 101 444 158 L444 228 Z" fill="url(#cwood)" stroke="#1d324c" strokeWidth="8"/>
    <path d="M77 162 Q95 102 169 86 Q264 60 358 90 Q430 109 444 162" fill="none" stroke="url(#cmetal)" strokeWidth="26"/>
    <path d="M81 213 H444" stroke="url(#cmetal)" strokeWidth="20"/>
    <path d="M144 115 V220 M377 112 V220" stroke="url(#cmetal)" strokeWidth="14"/>
    <path d="M102 170 Q265 128 421 173" fill="none" stroke="#78b9d1" opacity=".32" strokeWidth="4"/>
  </g>
  <path d="M78 214 L444 214 L425 346 Q258 383 98 345 Z" fill="url(#cwood)" stroke="#1d3046" strokeWidth="8"/>
  <path d="M81 223 L442 223" stroke="url(#cmetal)" strokeWidth="24"/>
  <path d="M112 236 L127 342 M411 235 L396 342" stroke="url(#cmetal)" strokeWidth="18"/>
  <path d="M108 346 Q258 385 414 346" stroke="url(#cmetal)" strokeWidth="19" fill="none"/>
  <rect x="225" y="207" width="70" height="93" rx="13" fill="url(#cmetal)" stroke="#6a421e" strokeWidth="5"/>
  <path d="M259 236 L272 249 L258 276 L244 249 Z" fill="#67e8f9" stroke="#c2f7ff" strokeWidth="4" className="vault-gem"/>
  <circle cx="133" cy="259" r="5" fill="#fef3c7"/><circle cx="390" cy="259" r="5" fill="#fef3c7"/>
 </svg>;
}
function RewardCard({reward,index}){
 const tone=TONES[reward.kind]||TONES.coins;
 return <div className={'relative min-w-0 rounded-2xl border-2 bg-gradient-to-b p-4 sm:p-6 flex flex-col items-center gap-2 text-center '+tone.border+' '+tone.bg+' vault-reward-in'}
    style={{boxShadow:'0 0 30px '+tone.color+'25'}}>
    <span className="text-[10px] tracking-[.24em] font-black text-slate-300">PREMIO {index+1}</span>
    {reward.kind==='character'&&reward.img?<img src={reward.img} alt={reward.name} className="w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-[0_0_12px_rgba(255,255,255,.35)]"/>:
     <div className="w-20 h-20 rounded-full flex items-center justify-center border" style={{color:tone.color,borderColor:tone.color,background:tone.color+'20'}}>
      <tone.Icon size={42} strokeWidth={1.5}/>
     </div>}
    <span className="text-[10px] tracking-widest font-black" style={{color:tone.color}}>{tone.title}</span>
    <span className="text-lg sm:text-xl font-black text-white break-words">{label(reward)}</span>
    {reward.convertedFrom&&<span className="text-xs text-slate-300">Ricompensa sostitutiva: categoria già completata</span>}
  </div>;
}
export function CampaignChestsView({profile,onOpen,onAcknowledge,onBack}){
 const chests=profile?.chests||{},pending=chests.pending||[],receipt=chests.activeReveal;
 const [revealed,setRevealed]=useState(receipt?2:0),[error,setError]=useState('');
 const open=()=>{const result=onOpen();if(result?.ok){setRevealed(0);setError('')}else setError(result?.reason||'Impossibile aprire il baule.')};
 const dismiss=()=>{const result=onAcknowledge();if(result?.ok){setRevealed(0);setError('')}};
 return <main className="min-h-screen text-white bg-[radial-gradient(ellipse_at_top,#182f53_0%,#10162b_47%,#050814_100%)] p-3 sm:p-8">
  <style>{`
   @keyframes vaultFloat{50%{transform:translateY(-9px)}}
   @keyframes vaultGem{50%{filter:drop-shadow(0 0 19px #67e8f9)}}
   @keyframes vaultReward{from{transform:translateY(40px) scale(.72);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}
   .vault-idle{animation:vaultFloat 4s ease-in-out infinite}
   .vault-gem{animation:vaultGem 2s ease-in-out infinite}
   .vault-open .vault-lid{transform:translateY(-55px) rotate(-7deg);transition:transform .5s cubic-bezier(.2,.8,.2,1)}
   .vault-reward-in{animation:vaultReward .5s cubic-bezier(.2,.9,.2,1) both}
   @media(prefers-reduced-motion:reduce){.vault-idle,.vault-gem,.vault-reward-in{animation:none!important}.vault-open .vault-lid{transition:none}}
  `}</style>
  <div className="max-w-5xl mx-auto space-y-5">
   <header className="flex flex-wrap justify-between gap-3 items-start">
    <div><button type="button" onClick={onBack} className="text-cyan-200 hover:text-white text-sm font-bold flex gap-1 items-center"><ArrowLeft size={18}/> Torna al menu</button>
     <div className="mt-6 text-[11px] font-black tracking-[.35em] text-amber-300">TESORERIA DEL MULTIVERSO</div>
     <h1 className="text-3xl sm:text-5xl font-black mt-1">Bauli della Campagna</h1>
     <p className="text-sm text-slate-300 mt-2">Ogni missione completata ti regala uno scrigno. Aprilo quando vuoi, con due ricompense casuali.</p>
    </div>
    <div className="bg-slate-950/75 border border-amber-400/55 rounded-2xl px-6 py-4 text-center shadow-[0_0_24px_rgba(251,191,36,.12)]">
     <div className="text-xs font-bold text-amber-200 tracking-widest">BAULI DISPONIBILI</div>
     <div className="text-4xl font-black text-amber-300 tabular-nums">{pending.length}</div>
     <div className="text-[10px] text-slate-400">{(chests.opened||[]).length} aperti in totale</div>
    </div>
   </header>
   <div className="rounded-3xl p-4 sm:p-8 border border-amber-500/25 bg-gradient-to-b from-slate-900/90 to-[#090e20] shadow-[0_20px_90px_rgba(0,0,0,.55)] space-y-4 text-center">
    {!receipt||revealed===0?<div className="max-w-md mx-auto"><ChestArtwork open={!!receipt}/></div>:
      <div className="max-w-[240px] mx-auto"><ChestArtwork open/></div>}
    {receipt ? <>
      <h2 className="font-black text-2xl text-amber-200">{revealed<2?'Scopri i tuoi premi':'Ricompense ottenute!'}</h2>
      {revealed>0&&<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
       {receipt.rewards.slice(0,revealed).map((reward,i)=><RewardCard key={i} reward={reward} index={i}/>)}
      </div>}
      {revealed<2?<button type="button" onClick={()=>setRevealed(r=>Math.min(2,r+1))}
       className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-110 text-slate-950 font-black rounded-xl shadow-[0_0_24px_rgba(251,191,36,.22)] inline-flex gap-2 items-center"><Gift size={20}/> Rivela premio {revealed+1} di 2</button>:
       <button type="button" onClick={dismiss} className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-700 hover:brightness-110 font-black rounded-xl inline-flex gap-2 items-center"><PackageOpen size={20}/> Conserva i premi e continua <ChevronRight size={20}/></button>}
    </>:<>
      <h2 className="font-black text-2xl text-amber-200">{pending.length?'Uno scrigno aspetta di essere aperto':'Nessun baule da aprire'}</h2>
      <p className="text-sm text-slate-300 max-w-xl mx-auto">{pending.length?'Ogni apertura genera due premi. Puoi trovare due volte di fila la stessa ricompensa: dipende soltanto dalla fortuna.':'Supera missioni della campagna per ottenere nuovi bauli. Quelli delle missioni già superate sono stati conteggiati automaticamente.'}</p>
      <button disabled={!pending.length} type="button" onClick={open} className="px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed font-black rounded-xl shadow-[0_0_24px_rgba(251,191,36,.22)]">Apri baule</button>
    </>}
    {error&&<p role="alert" className="text-sm text-rose-300 font-bold">{error}</p>}
   </div>
   <section className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
     {[['Cure','40%'],['Punti Forza','28%'],['Monete','25%'],['Multimon','4%'],['Strumenti da battaglia','3%']].map(([name,prob])=><div key={name} className="border border-slate-700/70 bg-slate-950/70 rounded-xl p-3"><div className="font-extrabold text-cyan-200 text-xl">{prob}</div><div className="text-slate-300 mt-1">{name}</div></div>)}
   </section>
   <p className="text-xs text-slate-400 text-center">Se un premio rarissimo non è disponibile perché possiedi già tutto, riceverai Punti Forza al suo posto. Ogni apertura viene salvata prima di rivelare il contenuto.</p>
  </div>
 </main>;
}
