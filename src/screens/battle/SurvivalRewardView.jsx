import React from 'react';
import {survivalWaveKind} from '../../systems/survivalWaves.js';

const labels={normal:'Nuovo sfidante',anomaly:'Arena Anomala',elite:'Nemico Élite',superboss:'SUPERBOSS'};
export function SurvivalRewardView({room,onChoice,onExit,canChoose=true}){
 const round=room.survivalRound||1;
 const kind=survivalWaveKind(round);
 const next=(room.teams?.[room.settings?.juggernautPlayer||'p2']||[])[0];
 const [busy,setBusy]=React.useState(false);
 const choose=async choice=>{
   if(busy)return;
   setBusy(true);
   try{const success=await onChoice(choice);if(success===false)setBusy(false);}
   catch(error){console.error('Ricompensa Sopravvivenza:',error);setBusy(false);}
 };
 return <main className="min-h-screen bg-slate-950 text-white p-5 sm:p-10 flex flex-col items-center justify-center">
   <div className="w-full max-w-4xl rounded-3xl bg-slate-900/95 border-2 border-violet-500/40 p-5 sm:p-10 shadow-2xl">
     <header className="text-center">
       <span className="uppercase tracking-widest text-violet-300 text-sm font-black">♾️ SOPRAVVIVENZA</span>
       <h1 className="text-3xl sm:text-5xl font-black mt-2">Ondata {round}</h1>
       <p className="text-amber-300 mt-4 font-black text-lg">{labels[kind]}: {next?.name||'In arrivo'}</p>
       {room.survivalDecision?.checkpoint&&<p className="text-emerald-300 mt-2">🏕️ Traguardo ogni 5 ondate raggiunto!</p>}
       {kind==='anomaly'&&<p className="text-cyan-200 mt-2">🌪️ L'arena cambia meteo per 5 turni.</p>}
       {kind==='elite'&&<p className="text-yellow-200 mt-2">⚡ Un combattente élite più resistente si prepara a entrare in campo.</p>}
       {kind==='superboss'&&<p className="text-rose-300 mt-2">👑 Il superboss è molto più resistente e pericoloso.</p>}
       <p className="text-slate-300 mt-4">Scegli una ricompensa prima di affrontare la prossima ondata. Non consuma il turno.</p>
     </header>
     {!canChoose&&<p className="text-center text-amber-200 font-bold mt-6">In attesa della scelta di un partecipante autorizzato…</p>}
     <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
       <button type="button" disabled={busy||!canChoose} onClick={()=>choose('heal')}
         className="p-5 rounded-2xl border border-emerald-500/60 bg-emerald-950/45 hover:bg-emerald-900/60 disabled:opacity-50 text-left">
         <strong className="text-xl block">💚 Riposo</strong>
         <span className="block text-sm mt-2 text-emerald-100">+10% PS massimi ai Multimon ancora vivi</span>
       </button>
       <button type="button" disabled={busy||!canChoose} onClick={()=>choose('power')}
         className="p-5 rounded-2xl border border-orange-500/60 bg-orange-950/45 hover:bg-orange-900/60 disabled:opacity-50 text-left">
         <strong className="text-xl block">🔥 Potenza</strong>
         <span className="block text-sm mt-2 text-orange-100">+10% danni dei giocatori per la prossima ondata</span>
       </button>
       <button type="button" disabled={busy||!canChoose} onClick={()=>choose('coins')}
         className="p-5 rounded-2xl border border-amber-500/60 bg-amber-950/45 hover:bg-amber-900/60 disabled:opacity-50 text-left">
         <strong className="text-xl block">🪙 Bottino</strong>
         <span className="block text-sm mt-2 text-amber-100">+10 monete al premio finale della sessione</span>
       </button>
     </div>
     <p className="text-center mt-5 text-slate-400 text-xs">Monete bonus accumulate: {room.survivalTreasury||0} · Ultimo traguardo: ondata {room.survivalLastCheckpoint||0}</p>
     <div className="text-center mt-4"><button className="text-slate-400 hover:text-white underline" onClick={onExit}>Torna al menu</button></div>
   </div>
 </main>;
}
