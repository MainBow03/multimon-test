import React,{useEffect,useMemo,useRef,useState} from 'react';
import {collection,query,where,onSnapshot} from 'firebase/firestore';
import {db,appId} from '../../firebase/config.js';
import {canObserveCampaignPresence,selectCampaignSpectatorSession} from '../../systems/onlinePresence.js';
import {campaignSnapshotToSpectatorState} from '../../systems/campaignSpectatorBattle.js';

// Non esiste più un campo della campagna diverso da quello standard:
// il componente parent renderizza la vera BattlingView (stessa visuale
// e stessa modalità spettatore delle partite online).
export function CampaignSpectatorView({sessionId,expectedUid,playerName,onExit,renderBattle}){
 const [entry,setEntry]=useState(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [clock,setClock]=useState(Date.now());
 const [isLogOpen,setIsLogOpen]=useState(false);
 const [playback,setPlayback]=useState({active:false,text:''});
 const lastHighlightRef=useRef('');
 const logEndRef=useRef(null);
 useEffect(()=>{
  if(!sessionId||!expectedUid){
   setError('Giocatore non disponibile.');setLoading(false);return;
  }
  setEntry(null);setLoading(true);setError('');
  // Osserva tutte le sessioni dell'account: dopo un refresh la nuova
  // sessione sostituisce automaticamente quella originale.
  const ref=query(collection(db,'artifacts',appId,'public','data','online_users'),
    where('uid','==',expectedUid));
  const unsubscribe=onSnapshot(ref,snap=>{
   const rows=snap.docs.map(d=>d.data());
   setEntry(selectCampaignSpectatorSession(rows,expectedUid,sessionId));
   setClock(Date.now());
   setError('');setLoading(false);
  },err=>{
   setEntry(null);setError('Impossibile seguire la battaglia: '+(err.message||err));
   setLoading(false);
  });
  const timer=setInterval(()=>setClock(Date.now()),10000);
  return()=>{unsubscribe();clearInterval(timer)};
 },[sessionId,expectedUid]);
 const live=canObserveCampaignPresence(entry,clock);
 const snapshot=live?entry.campaignBattle:null;
 const shareOff=entry?.status==='⚔️ Lotta Campagna'&&!entry.campaignBattle;
 const campaignIdle=entry?.status==='📖 In Campagna';
 const signalLost=!!entry?.campaignBattle&&!live;
 const spectatorState=useMemo(()=>campaignSnapshotToSpectatorState(snapshot),[snapshot]);
 const highlights=snapshot?.highlights||[];
 const eventSignature=snapshot
  ?String(snapshot.turn)+':'+snapshot.phase+':'+JSON.stringify(highlights)
  :'';
 useEffect(()=>{
  if(!eventSignature){setPlayback({active:false,text:''});return;}
  if(lastHighlightRef.current===eventSignature)return;
  const isInitial=!lastHighlightRef.current;
  lastHighlightRef.current=eventSignature;
  const text=highlights.at(-1)||'';
  // Mostra gli annunci nello stesso overlay del combattimento normale,
  // non in un secondo riquadro inventato per questa modalità.
  if(!text||snapshot?.phase!=='executing'){
   setPlayback({active:false,text:''});return;
  }
  setPlayback({active:true,text});
  const timer=setTimeout(()=>setPlayback({active:false,text:''}),1400);
  return()=>clearTimeout(timer);
 },[eventSignature]);
 const log=useMemo(()=>highlights.map(text=>({text,type:'normal'})),[eventSignature]);
 if(!live||!spectatorState){
  return <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center gap-4">
   <span className="text-5xl">{loading?'🌀':error?'📡':'🏁'}</span>
   <h1 className="text-2xl font-black">
    {loading?'Collegamento alla lotta…':error?'Collegamento non disponibile':
     shareOff?'Diretta disattivata':
     campaignIdle?'In attesa della prossima battaglia':
     'In attesa del segnale della battaglia…'}
   </h1>
   <p className="text-sm text-slate-300 max-w-lg">
    {loading?'Recupero la diretta di '+(playerName||'questo giocatore')+'.':
     error||
     (shareOff?'Il giocatore ha disattivato la condivisione. Se la riattiva, la diretta riprenderà automaticamente.':
      campaignIdle?'Il giocatore è nella campagna, ma in questo momento non sta combattendo. La diretta ripartirà con il prossimo scontro.':
      signalLost?'Il collegamento è temporaneamente instabile. Resto collegato e riprendo il campo appena arrivano nuovi aggiornamenti.':
      'Sto cercando la sessione attiva del giocatore. Non è necessario uscire: la trasmissione ripartirà automaticamente quando sarà disponibile.')}
   </p>
   <button type="button" onClick={onExit}
    className="bg-cyan-700 hover:bg-cyan-600 border border-cyan-400 px-5 py-3 rounded-xl font-bold">
    ← Torna ai giocatori online
   </button>
  </main>;
 }
 return renderBattle({
  gameState:spectatorState,
  isPlayingEvents:playback.active,
  eventPlaybackText:playback.text,
  eventPlaybackPassive:null,
  displayTeams:spectatorState.teams,
  displayField:spectatorState.field,
  combatLog:log,isLogOpen,setIsLogOpen,logEndRef,
  onExit
 });
}
