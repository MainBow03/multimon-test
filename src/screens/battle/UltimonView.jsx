import {onMultimonImageError} from '../../systems/imageFallback.js';
import React,{useEffect,useState} from 'react';
import {ULTIMON_COLORS,ultimonPlayers,ultimonAlive,ultimonActive,ultimonLeaderboard,ultimonDuelOutcome,ultimonPicksReady,ultimonIsFinalShowdown} from '../../systems/ultimonSystem.js';
import {ultimonRewardForPlace} from '../../systems/ultimonRewards.js';
import {ultimonTeamMvp} from '../../systems/ultimonMvp.js';
import {UltimonIntroView} from './UltimonIntroView.jsx';
import {ultimonBanRoster,ultimonBanRoles,ultimonBannedIds,allUltimonBansReady} from '../../systems/ultimonBans.js';
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
       <img src={c.img} onError={onMultimonImageError} alt={c.name} loading="lazy"/>
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

function SurvivorBoard({room,standings}){
 const living=standings.filter(p=>p.alive>0),fallen=standings.filter(p=>p.alive===0);
 const card=(p)=>(
  <article key={p.role} className={'ultimon-board-team '+(!p.alive?'ultimon-board-team--gone':'')}
    style={{'--ultimon-team-color':p.color}}>
   <div className="ultimon-board-top">
    <span className="ultimon-team-dot"/>
    <div className="ultimon-board-name"><strong>{p.team}</strong><small>{p.name}{room.isBot?.[p.role]?' · CPU':''}</small></div>
    <span className="ultimon-board-count">{p.alive}/{p.original} vivi</span>
   </div>
   <div className="ultimon-board-icons">
    {(room.ultimon?.rosters?.[p.role]||[]).map((c,i)=>(
     <div className={'ultimon-board-avatar '+(!alive(c)?'ultimon-board-avatar--ko':'')}
       key={i} title={c.name+' · '+(alive(c)?Math.ceil(c.hp)+' PS':'KO')}>
      <img src={c.img} onError={onMultimonImageError} alt={c.name} loading="lazy"/>
      {!alive(c)&&<span aria-label="KO">✕</span>}
     </div>
    ))}
   </div>
   <div className="ultimon-board-stats">
    <span>⚔️ {p.matches} duelli</span><span>🏆 {p.wins} vittorie</span><span>💥 {p.lost} perdite</span>
   </div>
  </article>
 );
 return <section className="ultimon-survivor-board" aria-label="Tabellone dei superstiti">
   <div className="ultimon-board-heading">
    <span>📡 SITUAZIONE IN TEMPO REALE</span>
    <h2>Il tabellone dei superstiti</h2>
    <p>{living.length} squadre ancora in gioco · {fallen.length} eliminate</p>
   </div>
   <h3 className="ultimon-board-section-head">🟢 ANCORA IN GARA <span>{living.length}</span></h3>
   <div className="ultimon-board-grid">{living.map(card)}</div>
   {!!fallen.length&&<>
    <h3 className="ultimon-board-section-head ultimon-board-section-head--out">ELIMINATE <span>{fallen.length}</span></h3>
    <div className="ultimon-board-grid ultimon-board-grid--out">{fallen.map(card)}</div>
   </>}
  </section>;
}
function EliminationCeremony({room,standings,step}){
 const last=room.ultimon?.history?.at(-1);
 const eliminated=last?.eliminated||[];
 return <section className="ultimon-ceremony" aria-live="polite">
   <div className="ultimon-ceremony-decoration" aria-hidden="true">✦　✧　✦</div>
   <div className="ultimon-stage-label">ROUND {last?.round} · VERDETTO DEFINITIVO</div>
   <h2>✦ CERIMONIA DI ELIMINAZIONE ✦</h2>
   <p className="ultimon-ceremony-suspense">{step===0?
     'Il risultato è definitivo… Chi dovrà abbandonare Ultimon?':
     'Il viaggio di queste squadre nel torneo termina qui.'}</p>
   <div className="ultimon-ceremony-eliminated">
    {eliminated.map((role)=>{
      const info=standings.find(p=>p.role===role);
      const position=standings.findIndex(p=>p.role===role)+1;
      const fighters=room.ultimon?.rosters?.[role]||[];
      return <article key={role} className={'ultimon-ceremony-team '+(step>=1?'ultimon-ceremony-team--shown':'')}
        style={{'--ultimon-team-color':info?.color||'#94a3b8'}}>
        {step>=1?<>
          <div className="ultimon-ceremony-out">SQUADRA ELIMINATA</div>
          <h3>{info?.team||role}</h3><small>{info?.name||room.players?.[role]}</small>
          <div className="ultimon-ceremony-fighters">
           {fighters.map((c,i)=><div key={i} className="ultimon-ceremony-fighter">
             <img src={c.img} onError={onMultimonImageError} alt={c.name} loading="lazy"/>
             <strong>{c.name}</strong><span>KO DEFINITIVO</span>
           </div>)}
          </div>
          {step>=2&&<div className="ultimon-ceremony-placement">
           <b>{position}° POSTO</b>
           <span>🪙 +{ultimonRewardForPlace(standings.length,position)} monete</span>
          </div>}
        </>:<div className="ultimon-ceremony-silhouette"><span>?</span><small>Destino da rivelare…</small></div>}
       </article>;
     })}
   </div>
   {step>=3&&<p className="ultimon-ceremony-closing">Le squadre eliminate sono fuori. Il torneo continua con chi è rimasto!</p>}
  </section>;
}

export function UltimonView({room,appMode,playerRole,onBan,onIdentity,onPick,onSpeech,onEntrance,onHost,onExit,ownedEntrances=[],canHost=false}){
 const stage=room.status,u=room.ultimon||{},pair=u.pair||[];
 const isLocal=appMode==='local_room',isHost=!!canHost;
 const available=ultimonPlayers(room);
 const unnamed=available.filter(p=>!room.isBot?.[p]&&!u.identities?.[p]?.ready);
 const nameRole=isLocal?unnamed[0]:playerRole;
 const identity=u.identities?.[nameRole]||{};
 const [name,setName]=useState(identity.name||'');
 const [color,setColor]=useState(identity.color||ULTIMON_COLORS[0].hex);
 const [chosen,setChosen]=useState([]);
 const [banSearch,setBanSearch]=useState('');
 const [banSelected,setBanSelected]=useState('');
 const [revealed,setRevealed]=useState(false);
 const [ceremonyStep,setCeremonyStep]=useState(0);
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
 useEffect(()=>{
   if(stage!=='ultimon_elimination'){setCeremonyStep(0);return;}
   setCeremonyStep(0);
   const timers=[
     setTimeout(()=>setCeremonyStep(1),1300),
     setTimeout(()=>setCeremonyStep(2),3200),
     setTimeout(()=>setCeremonyStep(3),4600)
   ];
   return()=>timers.forEach(clearTimeout);
 },[stage,u.round,u.history?.length]);
 const banVotes=room.ultimonBans?.votes||{};
 const humanBanRoles=ultimonBanRoles(room);
 const currentBanRole=isLocal?humanBanRoles.find(p=>!banVotes[p]):playerRole;
 const canBan=stage==='ultimon_ban'&&humanBanRoles.includes(currentBanRole)&&!banVotes[currentBanRole];
 const banRoster=ultimonBanRoster(room);
 const bannedIds=ultimonBannedIds(room);
 const bannedSet=new Set(bannedIds);
 const bannedRoster=bannedIds.map(id=>banRoster.find(c=>c.id===id)).filter(Boolean);
 const banCandidates=banRoster.filter(c=>!bannedSet.has(c.id)&&
   (c.name||'').toLocaleLowerCase('it').includes(banSearch.trim().toLocaleLowerCase('it')));
 const banReady=stage==='ultimon_ban'&&allUltimonBansReady(room);
 const standings=ultimonLeaderboard(room);
 const prizes=standings.map((_,i)=>ultimonRewardForPlace(standings.length,i+1));
 const showdown=ultimonIsFinalShowdown(room);
 const finalTwo=showdown?ultimonActive(room):[];
 const finaleColors=finalTwo.map(role=>u.identities?.[role]?.color||'#a78bfa');
 const finaleName=role=>u.identities?.[role]?.name||room.players?.[role]||'Squadra';
 const finaleHero=role=>(u.rosters?.[role]||[]).find(c=>c?.hp>0&&c.img);
 const button=(text,action,disabled=false)=>
  <button type="button" className="ultimon-action" onClick={()=>onHost(action)} disabled={disabled||!isHost}>{text}</button>;
 const canPick=ultimonPicksReady(room);
 return <main className={"ultimon-screen "+(showdown?"ultimon-screen--showdown":"")}
   style={showdown?{'--final-left':finaleColors[0],'--final-right':finaleColors[1]}:undefined}>
   <div className="ultimon-sparks" aria-hidden="true"/>
   {showdown&&<div className="ultimon-showdown-scenery" aria-hidden="true">
     <div className="ultimon-showdown-beam ultimon-showdown-beam--left"/>
     <div className="ultimon-showdown-beam ultimon-showdown-beam--right"/>
     <div className="ultimon-showdown-ring"/>
     <div className="ultimon-showdown-stars">✦　✧　✦　✧　✦</div>
     <span className="ultimon-showdown-watermark">VS</span>
   </div>}
   <div className="ultimon-container">
     <header className="ultimon-header">
       <button type="button" onClick={onExit} className="ultimon-exit">← Esci</button>
       <div><span>IL TORNEO DEI SUPERSTITI</span><h1>ULTIMON <em>MULTIMON</em></h1></div>
       <div className="ultimon-round">ROUND {u.round||'—'}</div>
     </header>
     {stage==='ultimon_ban'&&<section className="ultimon-ban-stage">
       <div className="ultimon-ban-hero">
         <div className="ultimon-ban-eyebrow">✦ IL CONSIGLIO DEL MULTIVERSO ✦</div>
         <h2>🚫 BAN STRATEGICO</h2>
         <p>Ogni giocatore umano banna <strong>1 Multimon</strong>. Nessuno potrà usarlo in questa partita, nemmeno i bot. I ban sono globali e non si possono duplicare.</p>
         <div className="ultimon-ban-progress"><span>Ban confermati</span>
           <strong>{humanBanRoles.filter(p=>banVotes[p]).length} / {humanBanRoles.length}</strong>
         </div>
         <div className="ultimon-ban-participants">
           {humanBanRoles.map(role=><div key={role} className={'ultimon-ban-human '+(banVotes[role]?'ultimon-ban-human--ready':'')}>
             {room.playerAvatars?.[role]?<img src={room.playerAvatars[role]} alt=""/>:
               <span aria-hidden="true">👤</span>}
             <div><b>{room.players?.[role]||role}</b><small>{banVotes[role]?'✓ Ban scelto':'⌛ Deve scegliere'}</small></div>
           </div>)}
         </div>
       </div>
       {bannedRoster.length>0&&<div className="ultimon-ban-board">
         <h3>🚫 MULTIMON ESCLUSI DAL TORNEO</h3>
         <div className="ultimon-ban-board-grid">
           {bannedRoster.map(c=><div className="ultimon-ban-excluded" key={c.id}>
             {c.img&&<img src={c.img} onError={onMultimonImageError} alt=""/>}
             <strong>{c.name}</strong><span>BANNATO</span>
           </div>)}
         </div>
       </div>}
       {canBan?<section className="ultimon-ban-picker">
         <h3>⚡ {room.players[currentBanRole]}: scegli chi escludere</h3>
         <p>La tua scelta impedirà a tutti i concorrenti di utilizzare quel Multimon per questa partita Ultimon.</p>
         <label htmlFor="ultimon-ban-search">Cerca un Multimon da bannare</label>
         <input id="ultimon-ban-search" className="ultimon-ban-search" type="search"
           value={banSearch} onChange={e=>setBanSearch(e.target.value)}
           placeholder="Cerca per nome..." autoComplete="off"/>
         <div className="ultimon-ban-grid">
           {banCandidates.map(c=><button type="button" key={c.id}
             onClick={()=>setBanSelected(c.id)} aria-pressed={banSelected===c.id}
             className={'ultimon-ban-card '+(banSelected===c.id?'ultimon-ban-card--selected':'')}>
             <div className="ultimon-ban-image">{c.img&&<img src={c.img} onError={onMultimonImageError} alt="" loading="lazy"/>}</div>
             <strong>{c.name}</strong>
             <small>{(c.types||[]).join(' · ')}</small>
             <span>{banSelected===c.id?'✓ SCELTO':'Seleziona'}</span>
           </button>)}
           {!banCandidates.length&&<p className="ultimon-ban-noresults">Nessun Multimon corrisponde alla ricerca.</p>}
         </div>
         <div className="ultimon-ban-confirm">
           <p>{banSelected?<>Vuoi escludere <strong>{banRoster.find(c=>c.id===banSelected)?.name||banSelected}</strong>? Questo ban sarà definitivo per tutta la partita.</>:'Seleziona un Multimon prima di confermare il ban.'}</p>
           <button type="button" disabled={!banSelected||bannedSet.has(banSelected)}
             onClick={()=>{onBan(currentBanRole,banSelected);setBanSelected('');setBanSearch('');}}
             className="ultimon-action">🚫 CONFERMA IL BAN</button>
         </div>
       </section>:<div className="ultimon-center">
         {banReady?<h3>✅ Tutti i ban sono stati scelti!</h3>:<h3>⌛ In attesa dei ban degli altri giocatori…</h3>}
         {banReady&&isHost&&button('⚔️ Apri la scelta delle squadre','banContinue')}
         {banReady&&!isHost&&<p>L'host avvierà la scelta delle squadre.</p>}
       </div>}
     </section>}
     {stage!=='ultimon_ban'&&bannedRoster.length>0&&
       <div className="ultimon-ban-compact" aria-label="Multimon bannati per questa partita">
         <span>🚫 BAN GLOBALI</span>
         {bannedRoster.map(c=><div key={c.id}>
           {c.img&&<img src={c.img} onError={onMultimonImageError} alt=""/>}<b>{c.name}</b>
         </div>)}
       </div>}
     {stage==='ultimon_showcase'&&<>
       <section className="ultimon-hero"><div className="ultimon-stage-label">LA PRESENTAZIONE</div>
        <h2>Otto squadre possibili. Un solo superstite.</h2>
        <p>Guarda tutti i team, scegli nome e colore della tua squadra. I KO saranno definitivi!</p>
       </section>
       <div className="ultimon-roster-list">{available.map(p=><TeamCard key={p} room={room} role={p}/>)}</div>
       <div className="ultimon-prize-preview">
         <strong>🪙 Montepremi Ultimon · {standings.length} giocatori</strong>
         <div className="ultimon-prize-chips">
           {prizes.map((amount,i)=><span key={i}>{i+1}° <b>+{amount}</b> monete</span>)}
         </div>
       </div>
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
         {isHost?button('🎤 Inizia la presentazione delle squadre','introStart'):
           <p>In attesa che l’host chiami le squadre nell’arena…</p>}
       </section>}
       {!!unnamed.length&&!isLocal&&nameRole!==playerRole&&<p className="ultimon-center">In attesa delle altre squadre…</p>}
       {!!unnamed.length&&!isLocal&&identity.ready&&<p className="ultimon-center">✓ Squadra confermata. In attesa degli altri giocatori…</p>}
     </>}
     {stage==='ultimon_intro'&&<UltimonIntroView room={room} appMode={appMode}
       playerRole={playerRole} isHost={appMode==='local_room'||playerRole==='p1'} onSpeech={onSpeech} onEntrance={onEntrance} ownedEffects={ownedEntrances} onHost={onHost}/>}
     {showdown&&['ultimon_recap','ultimon_pair','ultimon_format','ultimon_pick'].includes(stage)&&
        <div className="ultimon-grand-final-banner" role="status">
         <span>⚡ LE ULTIME DUE SQUADRE ⚡</span>
         <h2>ULTIMO DUELLO <em>· GRAN FINALE</em></h2>
         <p>Due squadre. Un solo posto sul trono del multiverso.</p>
         <div className="ultimon-grand-final-versus" aria-label="Le ultime due squadre in gara">
          {finalTwo.map((role,i)=><React.Fragment key={role}>
           {i===1&&<div className="ultimon-grand-final-vs" aria-hidden="true">VS</div>}
           <div className="ultimon-grand-final-contender"
             style={{'--ultimon-team-color':u.identities?.[role]?.color||'#94a3b8'}}>
             {finaleHero(role)&&<img src={finaleHero(role).img} onError={onMultimonImageError} alt=""/>}
             <strong>{finaleName(role)}</strong>
             <small>{room.players?.[role]||role}</small>
           </div>
          </React.Fragment>)}
         </div>
         <div className="ultimon-grand-final-subline">✦ SOLO UNA SQUADRA RESTERÀ IN PIEDI ✦</div>
        </div>}
     {stage==='ultimon_pair'&&<section className={'ultimon-hero ultimon-reveal '+(showdown?'ultimon-hero--showdown':'')}>
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
     {stage==='ultimon_format'&&<section className={'ultimon-hero ultimon-reveal '+(showdown?'ultimon-hero--showdown':'')}>
       <div className="ultimon-stage-label">IL FORMATO DEL DUELLO</div>
       <h2>Quanti Multimon scenderanno in campo?</h2>
       <div className={'ultimon-format '+(!revealed?'ultimon-format--rolling':'')}>
         {revealed?u.format+' vs '+u.format:'1v1 · 2v2 · 3v3'}
       </div>
       <p>{revealed?'Ogni giocatore sceglierà '+u.format+' Multimon tra quelli ancora vivi.':'Il sorteggio si adatta ai superstiti di entrambe le squadre…'}</p>
       {revealed&&isHost&&button('⚔️ Passa alla scelta degli schieramenti','pick')}
     </section>}
     {stage==='ultimon_pick'&&<section className={'ultimon-hero '+(showdown?'ultimon-hero--showdown':'')}>
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
              <img src={c.img} onError={onMultimonImageError} alt={c.name}/><strong>{c.name}</strong>
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
     {stage==='ultimon_elimination'&&<>
       <EliminationCeremony room={room} standings={standings} step={ceremonyStep}/>
       {ceremonyStep>=3&&<>
        <SurvivorBoard room={room} standings={standings}/>
        <div className="ultimon-center">{isHost?
          button(standings.some(p=>p.alive>0)&&standings.filter(p=>p.alive>0).length>1?
            '✦ Concludi la cerimonia e torna al tabellone':'🏆 Concludi la cerimonia e premia il vincitore','ceremony'):
          <p>In attesa che l’host concluda la cerimonia…</p>}</div>
       </>}
     </>}
     {stage==='ultimon_recap'&&<>
       <ResultCard room={room} summary/>
       <SurvivorBoard room={room} standings={standings}/>
       <div className="ultimon-center">{isHost?button('🎲 Sorteggia il prossimo duello','pair'):
         <p>In attesa del prossimo sorteggio…</p>}</div>
     </>}
     {['ultimon_pair','ultimon_format'].includes(stage)&&
        <SurvivorBoard room={room} standings={standings}/>}
     {stage==='ultimon_final'&&<section className="ultimon-final">
        <div className="ultimon-stage-label">IL GRANDE VERDETTO</div>
        <h2>🏆 ULTIMO SUPERSTITE 🏆</h2>
        <p className="ultimon-champion">{u.champion?u.identities?.[u.champion]?.name:'Nessun superstite: pareggio assoluto!'}</p>
        <p>Classifica completa, dal vincitore al primo eliminato. Ogni giocatore umano riceve le monete del proprio piazzamento!</p>
        <div className="ultimon-scoreboard">{standings.map((p,i)=>{
          const mvp=ultimonTeamMvp(room,p.role);
          return <article key={p.role} className={'ultimon-score-row '+(i===0?'ultimon-score-row--champion':'')}
            style={{'--ultimon-team-color':p.color}}>
            <div className="ultimon-score-row-top">
             <strong><span className="ultimon-score-position">{i===0?'👑':i===1?'🥈':i===2?'🥉':'#'}{i+1}°</span> {p.team} <small>({p.name})</small></strong>
             <span className="ultimon-prize-amount">🪙 +{prizes[i]} monete</span>
            </div>
            <div className="ultimon-score-record">{p.wins} vittorie · {p.matches} duelli · {p.knockouts} KO di squadra · {p.lost} persi</div>
            {mvp?<section className="ultimon-mvp-card" aria-label={'MVP della squadra '+p.team}>
              <div className="ultimon-mvp-portrait">
               {mvp.img&&<img src={mvp.img} onError={onMultimonImageError} alt={mvp.name} loading="lazy"/>}
               <div className="ultimon-mvp-crown" aria-hidden="true">👑</div>
              </div>
              <div className="ultimon-mvp-info">
               <div className="ultimon-mvp-kicker">✦ MULTIMON MVP DELLA SQUADRA</div>
               <h4>{mvp.name}</h4>
               <div className="ultimon-mvp-stats">
                <span title="KO attribuiti al Multimon"><b>💥 {mvp.kos}</b> KO</span>
                <span title="Danni realmente inflitti ai nemici"><b>⚔️ {mvp.damageDealt}</b> danni inflitti</span>
                <span title="Danni subiti"><b>🛡️ {mvp.damageTaken}</b> subiti</span>
                <span title="Punti salute recuperati"><b>💚 {mvp.healing}</b> PS curati</span>
                <span title="Turni trascorsi in campo"><b>⏳ {mvp.turnsOnField}</b> turni</span>
                <span title="Duelli in cui è stato schierato"><b>🎮 {mvp.battles}</b> duelli</span>
                <span title="Attivazioni passive registrate"><b>✨ {mvp.passiveActivations}</b> passive</span>
                <span title="Scudi distrutti in battaglia"><b>🔰 {mvp.shieldsBroken}</b> scudi</span>
               </div>
              </div>
             </section>:<p className="ultimon-mvp-unavailable">MVP non disponibile: nessun duello individuale registrato per questa squadra.</p>}
          </article>;
        })}</div>
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
