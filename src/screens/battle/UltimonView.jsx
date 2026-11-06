import React,{useEffect,useState} from 'react';
import {ULTIMON_COLORS,ultimonPlayers,ultimonAlive,ultimonLeaderboard,ultimonDuelOutcome,ultimonPicksReady} from '../../systems/ultimonSystem.js';
import './UltimonView.css';

const alive=c=>c?.hp>0&&!c.isSummonOnly;
function TeamCard({room,role,selected=false,rank=null}){
 const id=room.ultimon?.identities?.[role]||{};
 const team=room.ultimon?.rosters?.[role]||[];
 const surviving=ultimonAlive(room.ultimon.rosters,role);
 return <article className={'ultimon-team-card '+(selected?'ultimon-team-card--selected ':'')+(!surviving?'ultimon-team-card--out ':'')}
   style={{'--ultimon-team-color':id.color||'#94a3b8'}}>
    <div className="ultimon-team-head">
     <div className="ultimon-team-title">
       {rank!==null&&<span className="ultimon-rank">#{rank}</span>}
       <span className="ultimon-team-dot"/>
       <div><strong>{id.name||'Squadra di '+(room.players?.[role]||role)}</strong>
        <small>{room.players?.[role]||role}{room.isBot?.[role]?' · CPU':''}</small></div>
     </div>
     <span className="ultimon-count">{surviving}/{team.length}</span>
    </div>
    <div className="ultimon-fighter-grid">
     {team.map((c,i)=><div key={i} className={'ultimon-fighter '+(!alive(c)?'ultimon-fighter--out':'')} title={c.name+' · '+Math.max(0,c.hp)+'/'+c.maxHp+' PS'}>
       <img src={c.img} alt={c.name} loading="lazy"/>
       <span>{c.name}</span>
       <small>{alive(c)?Math.ceil(c.hp)+' PS':'KO'}</small>
      </div>)}
    </div>
 </article>;
}
function ResultCard({room,summary=false}){
 const u=room.ultimon;
 const last=summary?u.history.at(-1):null;
 const pair=last?.pair||u.pair;
 const outcome=last?{winner:last.winner,loser:last.loser}:ultimonDuelOutcome(room);
 const winner=outcome?.winner;
 return <section className="ultimon-result-card">
   <div className="ultimon-stage-label">ROUND {u.round} · {u.format}v{u.format}</div>
   <h2>{winner?'🏆 Duello vinto da '+u.identities[winner]?.name:'⚔️ Doppio KO!'}</h2>
   <p>{winner?room.players[winner]+' si aggiudica la sfida!':'Nessuno dei due schieramenti è sopravvissuto.'}</p>
   {last&&<div className="ultimon-result-stats">
     {pair.map(p=><div key={p}><strong>{u.identities[p]?.name}</strong>
       <span>Multimon KO: {last.ko[p]?.length||0}</span>
       <span>Rimasti in squadra: {last.surviving[p]}</span>
       {!!last.ko[p]?.length&&<small>{last.ko[p].join(' · ')}</small>}
      </div>)}
   </div>}
   {last&&last.eliminated.length>0&&<p className="ultimon-eliminated">💀 Eliminate: {last.eliminated.map(p=>u.identities[p]?.name).join(' · ')}</p>}
   {last&&winner&&<p className="ultimon-heal">💚 Ai Multimon schierati e sopravvissuti della squadra vincente sono stati restituiti fino al 50% dei PS massimi.</p>}
 </section>;
}
export function UltimonView({room,appMode,playerRole,onIdentity,onPick,onHost,onExit,canHost=false}){
 const stage=room.status,u=room.ultimon||{},pair=u.pair||[];
 const isLocal=appMode==='local_room',isHost=!!canHost;
 const available=ultimonPlayers(room);
 const unnamed=available.filter(p=>!room.isBot?.[p]&&!u.identities?.[p]?.ready);
 const nameRole=isLocal?unnamed[0]:playerRole;
 const identity=u.identities?.[nameRole]||{};
 const [name,setName]=useState(identity.name||'');
 const [color,setColor]=useState(identity.color||ULTIMON_COLORS[0].hex);
 const [chosen,setChosen]=useState([]);
 const [revealed,setRevealed]=useState(false);
 const selectionRole=isLocal
   ?pair.find(p=>!room.isBot?.[p]&&!u.picks?.[p])
   :playerRole;
 const picksAllowed=stage==='ultimon_pick'&&pair.includes(selectionRole)&&!u.picks?.[selectionRole]&&!room.isBot?.[selectionRole];
 useEffect(()=>{setName(identity.name||'');setColor(identity.color||ULTIMON_COLORS[0].hex);},[nameRole,identity.ready]);
 useEffect(()=>{setChosen([]);},[selectionRole,stage,u.round]);
 useEffect(()=>{
   if(stage!=='ultimon_pair'&&stage!=='ultimon_format'){setRevealed(true);return;}
   setRevealed(false);
   const timer=setTimeout(()=>setRevealed(true),stage==='ultimon_pair'?3100:2700);
   return()=>clearTimeout(timer);
 },[stage,u.round]);
 const standings=ultimonLeaderboard(room);
 const button=(text,action,disabled=false)=>
  <button type="button" className="ultimon-action" onClick={()=>onHost(action)} disabled={disabled||!isHost}>{text}</button>;
 const canPick=ultimonPicksReady(room);
 return <main className="ultimon-screen">
   <div className="ultimon-sparks" aria-hidden="true"/>
   <div className="ultimon-container">
     <header className="ultimon-header">
       <button type="button" onClick={onExit} className="ultimon-exit">← Esci</button>
       <div><span>IL TORNEO DEI SUPERSTITI</span><h1>ULTIMON <em>MULTIMON</em></h1></div>
       <div className="ultimon-round">ROUND {u.round||'—'}</div>
     </header>
     {stage==='ultimon_showcase'&&<>
       <section className="ultimon-hero"><div className="ultimon-stage-label">LA PRESENTAZIONE</div>
        <h2>Otto squadre possibili. Un solo superstite.</h2>
        <p>Guarda tutti i team, scegli nome e colore della tua squadra. I KO saranno definitivi!</p>
       </section>
       <div className="ultimon-roster-list">{available.map(p=><TeamCard key={p} room={room} role={p}/>)}</div>
       {nameRole&&unnamed.includes(nameRole)&&<section className="ultimon-customizer">
         <h3>🎨 Personalizza la squadra di {room.players[nameRole]}</h3>
         <label>Nome della squadra
           <input value={name} onChange={e=>setName(e.target.value)} maxLength={24} placeholder="Es. Le Comete Nere"/>
         </label>
         <p>Seleziona un colore (20 disponibili):</p>
         <div className="ultimon-colors">{ULTIMON_COLORS.map(c=>{
           const taken=Object.entries(u.identities||{}).some(([p,v])=>p!==nameRole&&v.ready&&v.color===c.hex);
           return <button key={c.hex} type="button" disabled={taken}
             aria-label={c.name+(taken?' non disponibile':'')} title={c.name+(taken?' (già scelto)':'')}
             aria-pressed={color===c.hex} onClick={()=>setColor(c.hex)}
             style={{background:c.hex}} className={'ultimon-color '+(color===c.hex?'ultimon-color--chosen':'')+(taken?' ultimon-color--taken':'')}/>;
         })}</div>
         <p>Colore selezionato: <strong>{ULTIMON_COLORS.find(c=>c.hex===color)?.name}</strong></p>
         <button className="ultimon-action" disabled={name.trim().length<2} onClick={()=>onIdentity(nameRole,name.trim(),color)}>
           ✓ Conferma nome e colore
         </button>
       </section>}
       {!unnamed.length&&<section className="ultimon-center">
         <h3>🎉 Tutte le squadre sono pronte!</h3>
         {isHost?button('🎲 Inizia l’estrazione dei due sfidanti','pair'):
           <p>In attesa che l’host inizi il sorteggio…</p>}
       </section>}
       {!!unnamed.length&&!isLocal&&nameRole!==playerRole&&<p className="ultimon-center">In attesa delle altre squadre…</p>}
       {!!unnamed.length&&!isLocal&&identity.ready&&<p className="ultimon-center">✓ Squadra confermata. In attesa degli altri giocatori…</p>}
     </>}
     {stage==='ultimon_pair'&&<section className="ultimon-hero ultimon-reveal">
       <div className="ultimon-stage-label">ROUND {u.round} · SORTEGGIO SFIDANTI</div>
       <h2>{revealed?'Gli sfidanti sono stati scelti!':'Chi entrerà nell’arena?'}</h2>
       <div className="ultimon-faceoff">
         {pair.map((p,i)=><div key={p} className={'ultimon-face '+(!revealed?'ultimon-face--shuffle':'')} style={{'--ultimon-team-color':u.identities[p]?.color||'#94a3b8'}}>
           <span>{revealed?u.identities[p]?.name:'?'}</span>
           <small>{revealed?room.players[p]:'ESTRAZIONE…'}</small>
         </div>)}
       </div>
       {revealed&&isHost&&button('🎰 Sorteggia il formato della battaglia','format')}
       {!revealed&&<p className="ultimon-tension">I nomi stanno per essere rivelati…</p>}
       {revealed&&!isHost&&<p>In attesa del formato scelto dall’host…</p>}
     </section>}
     {stage==='ultimon_format'&&<section className="ultimon-hero ultimon-reveal">
       <div className="ultimon-stage-label">IL FORMATO DEL DUELLO</div>
       <h2>Quanti Multimon scenderanno in campo?</h2>
       <div className={'ultimon-format '+(!revealed?'ultimon-format--rolling':'')}>
         {revealed?u.format+' vs '+u.format:'1v1 · 2v2 · 3v3'}
       </div>
       <p>{revealed?'Ogni giocatore sceglierà '+u.format+' Multimon tra quelli ancora vivi.':'Il sorteggio si adatta ai superstiti di entrambe le squadre…'}</p>
       {revealed&&isHost&&button('⚔️ Passa alla scelta degli schieramenti','pick')}
     </section>}
     {stage==='ultimon_pick'&&<section className="ultimon-hero">
       <div className="ultimon-stage-label">ROUND {u.round} · SFIDA {u.format}v{u.format}</div>
       <h2>Schieramenti segreti</h2>
       <p>Puoi studiare TUTTI i Multimon dell’avversario. Solo i prescelti entreranno in battaglia: gli altri restano in riserva.</p>
       <div className="ultimon-roster-list">{pair.map(p=><TeamCard key={p} room={room} role={p} selected/>)}</div>
       <div className="ultimon-pick-ready">{pair.map(p=>
         <span key={p}>{u.identities?.[p]?.name}: {u.picks?.[p]?.length===u.format?'✓ Pronto':'⌛ Scelta in corso'}</span>)}</div>
       {picksAllowed&&<section className="ultimon-customizer">
          <h3>Seleziona {u.format} Multimon per {room.players[selectionRole]}</h3>
          <div className="ultimon-pick-grid">{(u.rosters?.[selectionRole]||[]).map((c,i)=>
            <button key={i} disabled={!alive(c)} type="button"
              className={'ultimon-pick-fighter '+(chosen.includes(i)?'ultimon-pick-fighter--chosen':'')}
              onClick={()=>setChosen(prev=>prev.includes(i)?prev.filter(x=>x!==i):
                 prev.length<u.format?[...prev,i]:prev)}>
              <img src={c.img} alt={c.name}/><strong>{c.name}</strong>
              <small>{alive(c)?Math.ceil(c.hp)+'/'+c.maxHp+' PS':'KO DEFINITIVO'}</small>
              {chosen.includes(i)&&<b>✓ SCHIERATO</b>}
            </button>)}</div>
          <button type="button" className="ultimon-action" disabled={chosen.length!==u.format}
            onClick={()=>onPick(selectionRole,chosen)}>Conferma {chosen.length}/{u.format} combattenti</button>
        </section>}
       {!picksAllowed&&<p className="ultimon-center">In attesa delle selezioni degli sfidanti…</p>}
       {canPick&&isHost&&button('⚔️ AVVIA LA LOTTA CLASSICA','battle')}
     </section>}
     {stage==='ultimon_result'&&<>
        <ResultCard room={room}/>
        <div className="ultimon-center">{isHost?button('📜 Mostra il verdetto e aggiorna la classifica','resolve'):
          <p>In attesa del verdetto ufficiale…</p>}</div>
       </>}
     {stage==='ultimon_recap'&&<>
       <ResultCard room={room} summary/>
       <h2 className="ultimon-section-title">Classifica provvisoria</h2>
       <div className="ultimon-scoreboard">{standings.map((p,i)=>
         <div className="ultimon-score-row" key={p.role} style={{'--ultimon-team-color':p.color}}>
          <strong>#{i+1} {p.team}</strong><span>{p.alive}/{p.original} vivi · {p.wins} vittorie · {p.knockouts} KO inflitti</span>
         </div>)}</div>
       <div className="ultimon-center">{isHost?button('🎲 Sorteggia il prossimo duello','pair'):
         <p>In attesa del prossimo sorteggio…</p>}</div>
     </>}
     {stage==='ultimon_final'&&<section className="ultimon-final">
        <div className="ultimon-stage-label">IL GRANDE VERDETTO</div>
        <h2>🏆 ULTIMO SUPERSTITE 🏆</h2>
        <p className="ultimon-champion">{u.champion?u.identities?.[u.champion]?.name:'Nessun superstite: pareggio assoluto!'}</p>
        <p>Classifica completa, dal vincitore al primo eliminato</p>
        <div className="ultimon-scoreboard">{standings.map((p,i)=>
          <div key={p.role} className="ultimon-score-row" style={{'--ultimon-team-color':p.color}}>
            <strong>{i+1}° {p.team} <small>({p.name})</small></strong>
            <span>{p.wins} vittorie · {p.matches} incontri · {p.knockouts} KO inflitti · {p.lost} persi</span>
          </div>)}</div>
        <div className="ultimon-honors">
          <h3>🌟 Record della stagione</h3>
          <div className="ultimon-honors-grid">
            <div><strong>⚔️ Più vittorie</strong><span>{[...standings].sort((a,b)=>b.wins-a.wins)[0]?.team}</span>
              <small>{Math.max(...standings.map(p=>p.wins))} vittorie</small></div>
            <div><strong>💥 Più KO inflitti</strong><span>{[...standings].sort((a,b)=>b.knockouts-a.knockouts)[0]?.team}</span>
              <small>{Math.max(...standings.map(p=>p.knockouts))} KO</small></div>
            <div><strong>🛡️ Più Multimon rimasti</strong><span>{[...standings].sort((a,b)=>b.alive-a.alive)[0]?.team}</span>
              <small>{Math.max(...standings.map(p=>p.alive))} superstiti</small></div>
          </div>
        </div>
        <details className="ultimon-history">
          <summary>📜 Rivedi tutti i {u.history?.length||0} duelli della stagione</summary>
          {(u.history||[]).map((round,i)=><div key={i} className="ultimon-history-row">
            <strong>Round {round.round} · {round.format}v{round.format}</strong>
            <span>{round.pair.map(p=>u.identities?.[p]?.name).join(' VS ')}</span>
            <small>Vince: {round.winner?u.identities?.[round.winner]?.name:'Doppio KO'} · Eliminati: {round.eliminated.map(p=>u.identities?.[p]?.name).join(', ')||'nessuno'}</small>
          </div>)}
        </details>
        <p>Totale duelli: {u.history?.length||0}</p>
        <button type="button" className="ultimon-action" onClick={onExit}>Torna al Menu</button>
       </section>}
   </div>
 </main>;
}
