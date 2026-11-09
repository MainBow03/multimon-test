import React,{useEffect,useState} from 'react';
import {roomSyncHealth} from '../systems/roomSyncHealth.js';

// Mostra problemi di connessione senza toccare stato, squadre o progressi.
export function RoomSyncBanner({active=false,fromCache=false,lastServerAt=0,error=false}){
 const [online,setOnline]=useState(()=>typeof navigator==='undefined'?true:navigator.onLine!==false);
 const [now,setNow]=useState(()=>Date.now());
 useEffect(()=>{
  if(!active)return;
  const refresh=()=>{setOnline(navigator.onLine!==false);setNow(Date.now());};
  const clock=setInterval(()=>setNow(Date.now()),10000);
  window.addEventListener('online',refresh);
  window.addEventListener('offline',refresh);
  return()=>{clearInterval(clock);window.removeEventListener('online',refresh);window.removeEventListener('offline',refresh);};
 },[active]);
 if(!active)return null;
 const health=roomSyncHealth({online,fromCache,lastServerAt,error,now});
 if(health.level==='ok')return null;
 const critical=['error','offline'].includes(health.level);
 return <section role="status" aria-live="polite" aria-label="Stato sincronizzazione della partita"
   className={'fixed left-1/2 top-[69px] -translate-x-1/2 z-[220] w-[min(92vw,490px)] rounded-xl border px-3 py-2 text-center shadow-[0_5px_24px_rgba(0,0,0,.7)] backdrop-blur-xl '+
   (critical?'border-rose-400 bg-rose-950/95 text-rose-100':'border-amber-400/80 bg-slate-950/95 text-amber-100')}>
   <div className="flex gap-2 items-center justify-center text-xs font-black">
    <span aria-hidden="true">{critical?'🔴':'🟡'}</span>{health.message}
   </div>
   <p className="mt-1 text-[11px] leading-snug opacity-85">{health.tip}</p>
 </section>;
}
