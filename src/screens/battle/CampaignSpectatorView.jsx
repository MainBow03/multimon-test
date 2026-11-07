import React,{useEffect,useState} from 'react';
import {doc,onSnapshot} from 'firebase/firestore';
import {db,appId} from '../../firebase/config.js';
import {canObserveCampaignPresence} from '../../systems/onlinePresence.js';
import './CampaignSpectatorView.css';

const amount=n=>Math.max(0,Math.round(Number(n)||0));
function TeamSide({name,fighters,enemy=false}){
 return <section className={'campaign-watch-side '+(enemy?'campaign-watch-side--enemy':'')}>
  <header className="campaign-watch-side-head">
   <span>{enemy?'💥 SCHIERAMENTO AVVERSARIO':'🛡️ SQUADRA EROICA'}</span>
   <h3>{name||'Multimon'}</h3>
  </header>
  <div className="campaign-watch-fighters">
   {fighters?.length?fighters.map((c,i)=>{
    const fraction=Math.min(100,Math.max(0,amount(c.hp)/Math.max(1,amount(c.maxHp))*100));
    return <article className={'campaign-watch-fighter '+(!c.hp?'campaign-watch-fighter--ko':'')}
      key={c.slot+'-'+c.id} style={{'--fighter-order':i}}>
      <div className="campaign-watch-art">
       {c.img?<img src={c.img} alt={c.name}/>:<span>✦</span>}
       {!c.hp&&<span className="campaign-watch-ko">KO</span>}
      </div>
      <div className="campaign-watch-fighter-data">
       <strong>{c.name}</strong>
       <small>{(c.types||[]).join(' · ')||'Multimon'}</small>
       <div className="campaign-watch-hp"><div style={{width:fraction+'%',
        background:fraction>50?'#4ade80':fraction>25?'#fbbf24':'#fb7185'}}/></div>
       <small className="campaign-watch-health">{amount(c.hp)} / {amount(c.maxHp)} PS</small>
       {!!c.shield&&<small className="campaign-watch-status">🛡️ Scudo: {c.shield}</small>}
       {!!c.statuses?.length&&<small className="campaign-watch-status">{c.statuses.join(' · ')}</small>}
      </div>
     </article>;
   }):<p className="campaign-watch-empty">In attesa dello schieramento…</p>}
  </div>
 </section>;
}

export function CampaignSpectatorView({sessionId,expectedUid,playerName,onExit}){
 const [entry,setEntry]=useState(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [clock,setClock]=useState(Date.now());
 useEffect(()=>{
  if(!sessionId||!expectedUid){setError('Giocatore non disponibile.');setLoading(false);return;}
  setEntry(null);setLoading(true);setError('');
  const ref=doc(db,'artifacts',appId,'public','data','online_users',sessionId);
  const unsubscribe=onSnapshot(ref,snap=>{
   if(!snap.exists()){setEntry(null);setLoading(false);setError('La sessione non è più disponibile.');return;}
   const data=snap.data();
   if(data.uid!==expectedUid || data.sessionId!==sessionId){
    setEntry(null);setError('La sessione non corrisponde al giocatore scelto.');setLoading(false);return;
   }
   setEntry(data);setError('');setLoading(false);
  },e=>{setEntry(null);setError('Non riesco a seguire questa battaglia: '+(e.message||e));setLoading(false);});
  const t=setInterval(()=>setClock(Date.now()),10000);
  return()=>{unsubscribe();clearInterval(t)};
 },[sessionId,expectedUid]);
 const live=canObserveCampaignPresence(entry,clock);
 const battle=live?entry.campaignBattle:null;
 return <main className="campaign-watch">
  <div className="campaign-watch-noise" aria-hidden="true"/>
  <div className="campaign-watch-shell">
   <header className="campaign-watch-header">
    <button type="button" onClick={onExit} className="campaign-watch-back">← Torna al menu</button>
    <div className="campaign-watch-brand"><span>📡 TRASMISSIONE MULTIVERSALE</span>
     <h1>OSSERVA LA <em>CAMPAGNA</em></h1></div>
    <div className="campaign-watch-badge"><span/> LIVE</div>
   </header>
   {loading?<section className="campaign-watch-message"><div className="campaign-watch-spinner">🌀</div>
     <h2>Collegamento all'arena…</h2>
     <p>Sto ricevendo lo scontro della tua amica.</p></section>
   :error?<section className="campaign-watch-message"><div>📡</div>
      <h2>Trasmissione non disponibile</h2><p>{error}</p>
      <button onClick={onExit}>Torna ai giocatori online</button>
     </section>
   :!live?<section className="campaign-watch-message">
     <div>🏁</div>
     <h2>La battaglia è terminata o la diretta è stata disattivata.</h2>
     <p>{playerName||'Il giocatore'} potrebbe aver concluso lo scontro, cambiato modalità o perso la connessione.</p>
     <button onClick={onExit}>Torna al menu</button>
    </section>
   :<>
     <section className="campaign-watch-arena-title">
      <div className="campaign-watch-live"><span/> IN DIRETTA · SOLO SPETTATORE</div>
      <h2>{battle.campaignName||'Campagna Multimon'}</h2>
      <p>{battle.missionName||'Una battaglia nel multiverso'}</p>
      <div className="campaign-watch-round">
       <span>⚔️ Turno {battle.turn||0}</span>
       <span>{battle.phase==='pre_battle'?'🎬 Entrata in campo':
        battle.phase==='executing'?'✨ Mosse in esecuzione':
        battle.phase==='switching_phase'?'🔄 Cambio di Multimon':'🎮 Scelta delle mosse'}</span>
      </div>
     </section>
     <section className="campaign-watch-battlefield" aria-label="Campo della battaglia di campagna in diretta">
      <TeamSide name={battle.opponentName} fighters={battle.opponents} enemy/>
      <div className="campaign-watch-versus" aria-hidden="true">VS</div>
      <TeamSide name={battle.playerName} fighters={battle.allies}/>
     </section>
     <section className="campaign-watch-log">
      <h3>📜 Ultimi eventi del combattimento</h3>
      {battle.highlights?.length?
        <div className="campaign-watch-events">{battle.highlights.map((text,i)=>
         <p key={battle.updatedAt+'-'+i}>{text}</p>)}</div>
       :<p className="campaign-watch-empty">Aspettando le prime mosse…</p>}
     </section>
     <p className="campaign-watch-disclaimer">👁️ Stai osservando un riepilogo visivo aggiornato in tempo reale. Non puoi scegliere mosse, controllare i Multimon o modificare la partita.</p>
   </>}
  </div>
 </main>;
}
