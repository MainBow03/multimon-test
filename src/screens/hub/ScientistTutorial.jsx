import React,{useState} from 'react';
import {ChevronRight,ArrowLeft,FlaskConical,Gift,X,Star,CheckCircle} from '../../components/ChestIcons.jsx';
import { STRENGTH_STATS,canTrainCharacter,strengthLevel } from '../../systems/strengthLab.js';

export const SCIENTIST_PORTRAIT='https://i.pinimg.com/1200x/b7/de/72/b7de72241371a88fad1b5eab4ae79810.jpg';
export const SCIENTIST_DIALOGUES=[
  {title:'Benvenuto, assistente!',text:'Oh, guarda un po’ chi è arrivato! Benvenuto nel mio Laboratorio di Potenziamento! Qui possiamo dare una piccola spinta ai tuoi Multimon. Vieni, ti faccio vedere!'},
  {title:'Tre statistiche da allenare',text:'Vedi questi tre parametri? Attacco, Difesa e Velocità. Ognuno può essere allenato separatamente, dal livello 1 fino al livello 10. Ogni livello dà soltanto +1: un piccolo vantaggio può cambiare una battaglia!'},
  {title:'I Punti Forza',text:'Per allenare i tuoi Multimon servono Punti Forza, diversi dalle monete del Negozio. Ogni livello costa un po’ più del precedente: 2, 4, 6… fino a 18 punti. Non ti farò mai spendere nulla senza chiedertelo!'},
  {title:'Un regalo speciale',text:'Sai che c’è? Ho deciso di farti un regalo: un potenziamento COMPLETAMENTE GRATIS! Uno solo, eh! Il budget del laboratorio non è infinito, ahah!'},
  {title:'Scegli il tuo Multimon',text:'Per prima cosa scegli un Multimon della tua collezione. Quale preferisci? Io preparo il macchinario!'},
  {title:'Quale statistica?',text:'Ottima scelta! Vuoi più Attacco, più Difesa o più Velocità? Guarda i numeri: puoi confrontare il valore attuale con quello dopo il miglioramento.'},
  {title:'Accendiamo la macchina!',text:'Perfetto! Il potenziamento è pronto. Controlla la tua scelta: aumenteremo questa statistica di +1, gratis. Premi il pulsante soltanto quando sei pronto!'},
  {title:'Esperimento riuscito!',text:'Funziona! Ahah, lo sapevo! Hai aumentato una statistica di un punto e il miglioramento rimarrà salvato nelle prossime battaglie. Il mio regalo è stato utilizzato!'},
  {title:'I Bauli Campagna',text:'Oh, quasi dimenticavo! Guadagnerai Punti Forza anche dai Bauli Campagna. Ogni missione conclusa ti regala uno scrigno con DUE ricompense misteriose: monete, cure, strumenti, Punti Forza e perfino un Multimon! Puoi conservarli e aprirli dal menu.'},
  {title:'Ora sei pronto!',text:'Bene, direi che ora sai tutto! Ricorda: non servono aumenti enormi per fare la differenza. Torna a trovarmi quando vuoi. E buona fortuna con i tuoi esperimenti!'}
];
export function ScientistTutorial({profile,characters,onStep,onFreeUpgrade,onComplete}){
 const saved=Number(profile?.labTutorialStep)||0;
 const [step,setStep]=useState(profile?.freeLabUpgradeUsed?Math.max(7,saved):Math.max(0,Math.min(9,saved)));
 const [visible,setVisible]=useState(true);
 const [selected,setSelected]=useState('');
 const [stat,setStat]=useState('atk');
 const [error,setError]=useState('');
 if(profile?.strengthLabIntroSeen)return null;
 const options=characters.filter(c=>canTrainCharacter(c,profile));
 const character=options.find(c=>c.id===selected)||options[0];
 const validStat=STRENGTH_STATS.some(s=>s.key===stat&&character&&strengthLevel(profile.strengthUpgrades,character.id,stat)<10);
 const advance=next=>{
   const normalized=Math.max(0,Math.min(9,next));
   setStep(normalized);
   onStep(normalized);
   setError('');
 };
 const claim=()=>{
   if(!character||!validStat){setError('Scegli un Multimon con una statistica sotto il livello 10.');return;}
   const result=onFreeUpgrade(character.id,stat);
   if(result?.ok){advance(7);}else setError(result?.reason||'Potenziamento non riuscito.');
 };
 const finish=()=>{
   if(!profile.freeLabUpgradeUsed){setError('Prima completa il potenziamento gratuito.');return;}
   const result=onComplete();if(result?.ok)setVisible(false);
 };
 if(!visible)return <button type="button" onClick={()=>setVisible(true)}
  className="fixed bottom-5 left-5 z-[95] bg-cyan-700 border border-cyan-300 text-white rounded-xl px-5 py-3 font-black shadow-[0_0_30px_rgba(34,211,238,.28)]">
   Riprendi la guida del Professore
 </button>;
 const current=SCIENTIST_DIALOGUES[step];
 return <div className="fixed inset-0 z-[350] bg-[#020617]/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
  <section role="dialog" aria-modal="true" aria-label="Il Professor Topolino ti guida nel laboratorio"
   className="w-full max-w-4xl max-h-[94dvh] overflow-y-auto custom-scrollbar rounded-3xl bg-gradient-to-br from-slate-900 via-[#0d1a32] to-indigo-950 border-2 border-cyan-400/50 shadow-[0_0_75px_rgba(34,211,238,.19)]">
   <header className="flex items-center justify-between gap-3 border-b border-cyan-500/25 p-4 sm:px-6">
    <div><div className="text-cyan-300 text-[10px] uppercase font-black tracking-[.25em]">Guida al laboratorio</div>
     <div className="text-sm font-bold text-white mt-1">Lezione {step+1} di {SCIENTIST_DIALOGUES.length}</div>
    </div>
    <button onClick={()=>setVisible(false)} type="button" aria-label="Chiudi temporaneamente la guida"
     className="text-slate-300 hover:text-white rounded-lg border border-slate-600 p-2"><X size={20}/></button>
   </header>
   <div className="p-4 sm:p-7 grid gap-5 sm:grid-cols-[180px_minmax(0,1fr)] items-start">
    <div className="rounded-2xl bg-[radial-gradient(circle,#287e9d_0%,#0a142b_85%)] border border-cyan-400/35 p-2 shadow-[0_0_30px_rgba(103,232,249,.13)]">
      <img src={SCIENTIST_PORTRAIT} alt="Topolino scienziato, guida del laboratorio"
       className="w-full h-40 sm:h-56 object-contain rounded-xl" />
      <p className="text-center text-xs tracking-wider text-cyan-200 font-extrabold mt-2">PROFESSOR TOPOLINO</p>
    </div>
    <div className="space-y-4 min-w-0">
      <h2 className="text-xl sm:text-3xl font-black text-white">{current.title}</h2>
      <p className="text-base leading-relaxed text-slate-200">{current.text}</p>
      {step===1&&<div className="grid grid-cols-3 gap-2">{STRENGTH_STATS.map(s=><div key={s.key}
         className="rounded-xl border p-3 text-center bg-slate-950/80" style={{borderColor:s.color}}>
         <div className="font-bold text-xs" style={{color:s.color}}>{s.label}</div><div className="font-black text-lg text-white mt-1">1 → 10</div>
         <div className="text-[10px] text-slate-300">+1 per livello</div></div>)}</div>}
      {step===2&&<div className="rounded-xl border border-amber-500/35 p-4 bg-slate-950/70 flex items-center justify-between">
        <span className="text-amber-200 font-bold">Punti Forza disponibili</span>
        <span className="text-2xl font-black text-amber-300">{profile.strengthPoints||0}</span>
      </div>}
      {step===4&&<div className="rounded-xl bg-slate-950/80 border border-cyan-400/40 p-4 space-y-3">
        <label htmlFor="scientist-character" className="block text-xs font-black tracking-widest text-cyan-200">SCEGLI UN MULTIMON POSSEDUTO</label>
        <select id="scientist-character" value={character?.id||''} onChange={e=>setSelected(e.target.value)}
         className="w-full p-3 rounded-xl border border-slate-600 bg-slate-900 text-white">
         {options.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {character&&<div className="flex gap-3 items-center"><img src={character.img} className="w-20 h-20 object-contain" alt={character.name}/>
          <div className="text-sm font-black text-white">{character.name}</div></div>}
      </div>}
      {(step===5||step===6)&&<div className="grid gap-2">
        {STRENGTH_STATS.map(s=>{
         const lv=character?strengthLevel(profile.strengthUpgrades,character.id,s.key):10,valid=lv<10;
         return <button type="button" key={s.key} disabled={!valid} onClick={()=>setStat(s.key)}
           className={`rounded-xl text-left p-3 border-2 flex items-center gap-3 disabled:opacity-40 ${stat===s.key?'bg-cyan-900/40':'bg-slate-950/70'}`}
           style={{borderColor:stat===s.key?s.color:'#334155'}}>
           <div className="font-black flex-1" style={{color:s.color}}>{s.label}</div>
           <div className="font-mono text-sm">{character?.[s.key]+lv} → <strong>{character?.[s.key]+Math.min(lv+1,10)}</strong></div>
         </button>;
        })}
      </div>}
      {step===6&&<div className="rounded-xl p-3 bg-emerald-900/25 border border-emerald-400/50 text-emerald-200 font-black text-center">
       GRATIS — 0 Punti Forza, per una sola statistica
      </div>}
      {step===7&&<div className="flex gap-2 items-center rounded-xl bg-emerald-950/40 border border-emerald-400/50 p-4 text-emerald-200 font-black"><CheckCircle/> Regalo riscattato e salvato!</div>}
      {step===8&&<div className="rounded-xl bg-amber-950/40 border border-amber-400/40 p-4 text-amber-200">
        Due ricompense per scrigno. Premi rari: Multimon 4%, strumenti da battaglia 3%. Nessun premio già ottenuto può essere estratto nuovamente aggiornando la pagina.
      </div>}
      {error&&<p role="alert" className="rounded-xl bg-red-950/55 border border-red-400/45 p-3 text-rose-200 text-sm">{error}</p>}
      <div className="flex items-center justify-between gap-3 pt-2">
       <button type="button" onClick={()=>step>0&&step<7&&advance(step-1)}
         disabled={step===0||step>=7} className="disabled:opacity-30 px-3 py-3 rounded-xl border border-slate-600 bg-slate-950 text-slate-300 font-bold flex items-center gap-2"><ArrowLeft size={16}/> Indietro</button>
       {step===6?<button type="button" onClick={claim} disabled={!character||!validStat}
         className="bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 rounded-xl font-black text-white shadow-[0_0_25px_rgba(34,211,238,.2)] flex items-center gap-2 disabled:opacity-40"><FlaskConical size={18}/> Potenzia gratis!</button>:
         step===9?<button type="button" onClick={finish} className="bg-emerald-600 hover:bg-emerald-500 px-5 py-3 rounded-xl font-black flex items-center gap-2"><CheckCircle size={18}/> Inizia a giocare</button>:
         <button type="button" onClick={()=>advance(step+1)} disabled={step===4&&!character||step===5&&!validStat}
           className="bg-gradient-to-r from-cyan-600 to-indigo-600 hover:brightness-110 px-5 py-3 rounded-xl font-black flex items-center gap-2 disabled:opacity-40">
           {step===4?'Conferma Multimon':'Continua'} <ChevronRight size={18}/>
         </button>}
      </div>
    </div>
   </div>
   <div className="flex gap-1 px-4 sm:px-7 pb-5">
     {SCIENTIST_DIALOGUES.map((_,i)=><div key={i} className={`h-1.5 flex-1 rounded-full ${i<=step?'bg-cyan-400':'bg-slate-700'}`}/>)}
   </div>
  </section>
 </div>;
}
