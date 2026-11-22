import React from 'react';
import {onMultimonImageError} from '../../systems/imageFallback.js';
import './AscensionBracket.css';

// True 8-player elimination board: 4 quarterfinals, 2 semifinals and
// 1 final. Later rounds exist as placeholders until the preceding
// matches are completed; no invented winners or results.
const STAGE_LABEL={quarti:'QUARTI',semifinali:'SEMIFINALE',finale:'GRAN FINALE'};

function Contestant({role,match,room}){
 const isWinner=!!role&&match.winner===role;
 const hasLost=!!match.winner&&!isWinner;
 const name=role?(room.players?.[role]||role):'Da determinare';
 const avatar=role?room.playerAvatars?.[role]:null;
 const wins=role?(match.wins?.[role]||0):null;
 return <div className={'ac-bracket-contestant'+
  (isWinner?' is-winner':'')+(hasLost?' is-eliminated':'')+
  (!role?' is-placeholder':'')}>
  <div className="ac-bracket-avatar">
   {avatar?<img src={avatar} alt="" onError={onMultimonImageError}/>:
    <span aria-hidden="true">{role?'✦':'?'}</span>}
  </div>
  <div className="ac-bracket-identity">
   <strong title={name}>{name}</strong>
   <small>{!role?'In attesa di qualificazione':room.isBot?.[role]?'Allenatore CPU':'Allenatore'}</small>
  </div>
  {isWinner&&<span className="ac-bracket-win" aria-label="Qualificato">✓</span>}
  {role&&<span className="ac-bracket-score" aria-label={'Vittorie: '+wins}>{wins}</span>}
 </div>;
}
function MatchCard({match,room,currentId,label}){
 const active=currentId===match.id&&!match.winner;
 const finished=!!match.winner;
 const pending=!match.roles?.every(Boolean);
 const css='ac-bracket-match'+(active?' is-active':'')+
  (finished?' is-finished':'')+(pending?' is-upcoming':'');
 return <div className={css} aria-label={(label||STAGE_LABEL[match.stage]||'Incontro')+
  ': '+(match.roles||[]).map(r=>room.players?.[r]||'Da determinare').join(' contro ')}>
  <div className="ac-bracket-match-top">
   <span>{label||STAGE_LABEL[match.stage]}</span>
   <small>{finished?'✓ CONCLUSO':active?'● IN CORSO':pending?'DA DEFINIRE':'DA GIOCARE'}</small>
  </div>
  <Contestant match={match} role={match.roles?.[0]} room={room}/>
  <div className="ac-bracket-versus">VS</div>
  <Contestant match={match} role={match.roles?.[1]} room={room}/>
 </div>;
}
export function AscensionBracket({asc,room,currentMatchId}){
 const games=new Map((asc.bracket||[]).map(m=>[m.id,m]));
 const q=Array.from({length:4},(_,i)=>games.get('q'+i)||{
  id:'q'+i,stage:'quarti',roles:[null,null],wins:{},winner:null
 });
 const placeholder=(id,stage,sources)=>{
  const match=games.get(id);
  return match||{id,stage,roles:sources.map(m=>m?.winner||null),wins:{},winner:null};
 };
 const s0=placeholder('s0','semifinali',[q[0],q[1]]);
 const s1=placeholder('s1','semifinali',[q[2],q[3]]);
 const final=placeholder('f0','finale',[s0,s1]);
 const finished=[...q,s0,s1,final].filter(m=>m.winner).length;
 const champion=asc.champion||final.winner||null;
 return <section className="ac-tourney" aria-label="Tabellone completo dell'Ascesa del Colosseo">
  <header className="ac-tourney-header">
   <div>
    <small>♛ IL TRONO DEL MULTIVERSO</small>
    <h3>Tabellone del Colosseo</h3>
    <p>Otto sfidanti, quattro quarti, due semifinali e una sola grande finale.</p>
   </div>
   <div className="ac-tourney-progress">
    <strong>{finished}<span> / 7</span></strong>
    <small>SFIDE CONCLUSE</small>
    <div className="ac-tourney-progress-track"><i style={{width:Math.round(finished/7*100)+'%'}}/></div>
   </div>
  </header>
  <div className="ac-tourney-scroller" role="region" tabIndex={0}
   aria-label="Tabellone: scorri orizzontalmente per vedere quarti, semifinali e finale">
   <div className="ac-tourney-board">
    <div className="ac-tourney-column ac-tourney-column--quarters-left">
     <h4>⚔ QUARTI</h4>
     <div className="ac-tourney-stack">
      <MatchCard match={q[0]} room={room} currentId={currentMatchId} label="QUARTO 1"/>
      <MatchCard match={q[1]} room={room} currentId={currentMatchId} label="QUARTO 2"/>
     </div>
    </div>
    <div className="ac-tourney-column ac-tourney-column--semi-left">
     <h4>✧ SEMIFINALE</h4>
     <div className="ac-tourney-stack">
      <MatchCard match={s0} room={room} currentId={currentMatchId} label="SEMIFINALE 1"/>
     </div>
    </div>
    <div className="ac-tourney-column ac-tourney-column--grand-final">
     <h4>♛ FINALE</h4>
     <div className="ac-tourney-trophy" aria-hidden="true">🏆</div>
     <div className="ac-tourney-stack">
      <MatchCard match={final} room={room} currentId={currentMatchId} label="FINALE · 2VS2"/>
     </div>
     <div className="ac-tourney-champion">
      <span>👑 CAMPIONE</span>
      <strong>{champion?(room.players?.[champion]||champion):'Il trono attende…'}</strong>
     </div>
    </div>
    <div className="ac-tourney-column ac-tourney-column--semi-right">
     <h4>✧ SEMIFINALE</h4>
     <div className="ac-tourney-stack">
      <MatchCard match={s1} room={room} currentId={currentMatchId} label="SEMIFINALE 2"/>
     </div>
    </div>
    <div className="ac-tourney-column ac-tourney-column--quarters-right">
     <h4>⚔ QUARTI</h4>
     <div className="ac-tourney-stack">
      <MatchCard match={q[2]} room={room} currentId={currentMatchId} label="QUARTO 3"/>
      <MatchCard match={q[3]} room={room} currentId={currentMatchId} label="QUARTO 4"/>
     </div>
    </div>
   </div>
  </div>
  <footer className="ac-tourney-footer">
   <span>✧ I vincitori avanzano verso il centro del tabellone</span>
   <span>⚔ Quarti e semifinali: al meglio di 3 · 🏆 Finale: 2v2</span>
  </footer>
 </section>;
}
