import React, {useEffect,useMemo,useState} from 'react';
import {CHARACTERS} from '../../data/characters.js';
import {mirroredBracketLayout,bracketParticipantRoster,tournamentMatchState} from '../../systems/eventBracketLayout.js';
import './MultiverseBracket.css';

const roster=Object.fromEntries(CHARACTERS.map(c=>[c.id,c]));
const ACCENTS=['#22d3ee','#d946ef','#fbbf24','#34d399','#fb7185','#a78bfa','#38bdf8','#fb923c'];
const tint=id=>ACCENTS[[...String(id||'')].reduce((a,x)=>a+x.charCodeAt(0),0)%ACCENTS.length];
const playerId=p=>p?.uid||p?.id;
function Avatar({person,size='small'}){
  const portrait=person?.avatar||roster[person?.teamIds?.[0]]?.img;
  return portrait?<img className={'mv-bracket-avatar mv-bracket-avatar--'+size}
    src={portrait} alt="" loading="lazy" referrerPolicy="no-referrer"/>:
    <span className={'mv-bracket-avatar mv-bracket-avatar--'+size+' mv-bracket-avatar--letter'}>{(person?.name||'?').slice(0,1).toUpperCase()}</span>;
}
function Entrant({entrant,winner,loser,people,onOpen}){
  const members=bracketParticipantRoster(entrant,people);
  if(!entrant)return <div className="mv-bracket-tbd"><span className="mv-bracket-tbd-icon">✧</span> In attesa degli sfidanti</div>;
  return <div className={'mv-bracket-contender '+(winner?'mv-bracket-contender--winner ':'')+(loser?'mv-bracket-contender--loser':'')}>
   {members.length?members.map(person=><button key={playerId(person)} type="button"
     className="mv-bracket-player" style={{'--player-glow':tint(playerId(person))}}
     title={'Apri la squadra di '+person.name} onClick={()=>onOpen(person)}>
     <Avatar person={person}/><span className="mv-bracket-player-info"><b>{person.name}</b><small>Vedi i Multimon ↗</small></span>
   </button>):<div className="mv-bracket-player mv-bracket-player--placeholder"><span className="mv-bracket-avatar mv-bracket-avatar--letter">{entrant.name?.[0]||'?'}</span><b>{entrant.name}</b></div>}
   {winner&&<span className="mv-bracket-win" title="Qualificato">✦</span>}
  </div>;
}
function MatchCard({match,current,people,onOpen,className='',style={}}){
  const state=tournamentMatchState(match,current);
  return <article className={'mv-bracket-match mv-bracket-match--'+state+' '+className} style={style}>
   <header className="mv-bracket-match-label">
     <span>{match.stage==='bronze'?'🥉 FINALE BRONZO':match.stage==='final'?'🏆 GRAN FINALE':('⚔️ '+('MATCH '+(match.slot+1)))}</span>
     <span className={'mv-bracket-match-status mv-bracket-match-status--'+state}>
      {state==='complete'?'CONCLUSO':state==='live'?'● IN DIRETTA':state==='ready'?'PRONTO':'DA DEFINIRE'}
     </span>
   </header>
   <div className="mv-bracket-contenders">
    <Entrant entrant={match.sideA} winner={match.winner?.id===match.sideA?.id}
      loser={!!match.winner&&match.loser?.id===match.sideA?.id} people={people} onOpen={onOpen}/>
    <div className="mv-bracket-versus">VS</div>
    <Entrant entrant={match.sideB} winner={match.winner?.id===match.sideB?.id}
      loser={!!match.winner&&match.loser?.id===match.sideB?.id} people={people} onOpen={onOpen}/>
   </div>
  </article>;
}
export function MultiverseBracket({matches=[],current=null,participants=[]}){
 const [selected,setSelected]=useState(null);
 const [zoom,setZoom]=useState(1);
 const layout=useMemo(()=>mirroredBracketLayout(matches),[matches]);
 useEffect(()=>{
  if(!selected)return;
  const close=e=>{if(e.key==='Escape')setSelected(null);};
  window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);
 },[selected]);
 const first=useMemo(()=>Object.fromEntries(participants.map(p=>[playerId(p),p])),[participants]);
 const selectedPerson=selected?first[selected]:null;
 const team=selectedPerson?.teamIds||[];
 if(!layout.rounds)return <div className="mv-bracket-empty">🏆 Il bracket apparirà quando il torneo comincerà.</div>;
 const openPerson=person=>setSelected(playerId(person));
 const champion=layout.final?.winner;
 return <div className="mv-bracket-shell">
   <div className="mv-bracket-heading">
    <div><div className="mv-bracket-eyebrow">✧ MULTIVERSE CHAMPIONSHIP ✧</div>
     <h2>IL CAMMINO VERSO LA GLORIA</h2>
     <p>Due lati. Una sola coppa. Tocca un giocatore per esplorare la sua squadra.</p></div>
    <div className="mv-bracket-controls">
     <span>ZOOM</span>
     <button type="button" onClick={()=>setZoom(z=>Math.max(.65,Math.round((z-.1)*100)/100))} disabled={zoom<=.65} aria-label="Riduci bracket">−</button>
     <b>{Math.round(zoom*100)}%</b>
     <button type="button" onClick={()=>setZoom(z=>Math.min(1.25,Math.round((z+.1)*100)/100))} disabled={zoom>=1.25} aria-label="Ingrandisci bracket">+</button>
    </div>
   </div>
   <div className="mv-bracket-scroll" tabIndex={0} role="region" aria-label="Tabellone del torneo a eliminazione, scorribile orizzontalmente">
    <div className="mv-bracket-scaled" style={{width:layout.width*zoom,height:(layout.height+246)*zoom}}>
     <div className="mv-bracket-canvas" style={{width:layout.width,height:layout.height+246,transform:'scale('+zoom+')'}}>
      <div className="mv-bracket-starfield" aria-hidden="true"/>
      <svg className="mv-bracket-lines" viewBox={`0 0 ${layout.width} ${layout.height}`} aria-hidden="true">
       <defs><linearGradient id="mv-left-path"><stop stopColor="#38bdf8"/><stop offset="1" stopColor="#c084fc"/></linearGradient>
        <linearGradient id="mv-right-path"><stop stopColor="#f472b6"/><stop offset="1" stopColor="#fbbf24"/></linearGradient></defs>
       {layout.paths.map(path=><path key={path.id} d={path.d}
         className={'mv-bracket-path '+(path.won?'mv-bracket-path--won':path.active?'mv-bracket-path--active':'')}
         stroke={path.side==='left'?'url(#mv-left-path)':'url(#mv-right-path)'}/>)}
      </svg>
      {Array.from({length:layout.rounds-1},(_,r)=>(
       <React.Fragment key={r}>
        <span className="mv-bracket-round-label" style={{left:r*267,width:218,top:2}}>
         {r===layout.rounds-2?'SEMIFINALE':r===0?'PRIMO TURNO':r===1?'SECONDO TURNO':'TURNO '+(r+1)}
        </span>
        <span className="mv-bracket-round-label mv-bracket-round-label--right" style={{left:layout.width-r*267-218,width:218,top:2}}>
         {r===layout.rounds-2?'SEMIFINALE':r===0?'PRIMO TURNO':r===1?'SECONDO TURNO':'TURNO '+(r+1)}
        </span>
       </React.Fragment>
      ))}
      {layout.items.map(item=><MatchCard key={item.id} match={item.match} current={current}
       people={participants} onOpen={openPerson} className={'mv-bracket-match--'+item.side}
       style={{left:item.x,top:item.top+22,width:218}}/>)}
      <div className="mv-bracket-finals" style={{left:layout.centerX,top:layout.centerY-158,width:264}}>
       <div className="mv-bracket-trophy" aria-hidden="true">🏆</div>
       <div className="mv-bracket-final-label">✦ GRAN FINALE ✦</div>
       {layout.final&&<MatchCard match={layout.final} current={current} people={participants} onOpen={openPerson}/>}
       {champion&&<div className="mv-bracket-champion">👑 CAMPIONE: {champion.name}</div>}
      </div>
      {layout.bronze&&<div className="mv-bracket-bronze" style={{left:layout.centerX,top:layout.height+14,width:264}}>
       <MatchCard match={layout.bronze} current={current} people={participants} onOpen={openPerson}/>
      </div>}
     </div>
    </div>
   </div>
   <div className="mv-bracket-footer">✦ Il tabellone si aggiorna in tempo reale · Le squadre sono consultabili facendo clic sui nomi dei giocatori</div>
   {selectedPerson&&<div className="mv-bracket-modal-backdrop" role="presentation" onClick={()=>setSelected(null)}>
     <section className="mv-bracket-modal" role="dialog" aria-modal="true" aria-label={'Squadra di '+selectedPerson.name}
       onClick={e=>e.stopPropagation()}>
      <div className="mv-bracket-modal-head">
       <Avatar person={selectedPerson} size="large"/>
       <div><small>✦ SQUADRA DEL CONCORRENTE ✦</small><h3>{selectedPerson.name}</h3>
       {selectedPerson.title&&<p>{selectedPerson.title}</p>}</div>
       <button type="button" onClick={()=>setSelected(null)} aria-label="Chiudi squadra">✕</button>
      </div>
      <div className="mv-bracket-team-grid">
       {team.map((id,i)=>{
        const c=roster[id];return <div className="mv-bracket-fighter" key={id+'-'+i}>
         {c?.img&&<img src={c.img} alt="" loading="lazy"/>}
         <span className="mv-bracket-fighter-index">{String(i+1).padStart(2,'0')}</span>
         <b>{c?.name||id}</b>
         <small>{c?.types?.join(' · ')||'Multimon'}</small>
         {c?.passive?.name&&<span className="mv-bracket-fighter-passive">{c.passive.name}</span>}
        </div>;
       })}
      </div>
      {!team.length&&<p className="mv-bracket-empty-team">La squadra non è ancora stata confermata.</p>}
     </section>
   </div>}
 </div>;
}
