import React,{useEffect,useState} from 'react';
import {VICTORY_EFFECTS} from '../../systems/victoryCosmetics.js';
import './VictoryCelebration.css';

// Filmato solo estetico, montato una volta per vittoria, visibile a tutti i
// client della stessa stanza. Non influenza il risultato, i turni o i premi.
const particles=Array.from({length:40},(_,i)=>({
 i,
 x:((i*47+13)%97)+'%',
 delay:((i*13)%31)/10+'s',
 duration:(2.1+(i%7)*.41)+'s',
 scale:(.6+(i%5)*.22)
}));
export function VictoryCelebration({presentation,onClose}){
 const [visible,setVisible]=useState(true);
 useEffect(()=>{
  setVisible(true);
  const t=setTimeout(()=>{setVisible(false);onClose?.()},6100);
  return()=>clearTimeout(t);
 },[presentation?.id]);
 if(!presentation||!visible)return null;
 const effect=VICTORY_EFFECTS.find(e=>e.id===presentation.effect?.id);
 if(!effect)return null;
 const cls='victory-cinema victory-cinema--'+effect.id;
 return <div className={cls} role="status" aria-live="polite"
   aria-label={'Animazione di vittoria di '+presentation.winnerName+': '+effect.name}
   style={{'--victory-ink':effect.color,'--victory-accent':effect.accent}}>
   <div className="victory-cinema-backdrop" aria-hidden="true"/>
   <div className="victory-cinema-light victory-cinema-light--a" aria-hidden="true"/>
   <div className="victory-cinema-light victory-cinema-light--b" aria-hidden="true"/>
   <div className="victory-cinema-orbit" aria-hidden="true"/>
   <div className="victory-cinema-curtain victory-cinema-curtain--left" aria-hidden="true"/>
   <div className="victory-cinema-curtain victory-cinema-curtain--right" aria-hidden="true"/>
   <div className="victory-cinema-disco-ball" aria-hidden="true"/>
   <div className="victory-cinema-flower" aria-hidden="true">✿</div>
   <div className="victory-cinema-flower victory-cinema-flower--other" aria-hidden="true">❀</div>
   <div className="victory-cinema-water" aria-hidden="true"/>
   <div className="victory-cinema-crystal victory-cinema-crystal--a" aria-hidden="true"/>
   <div className="victory-cinema-crystal victory-cinema-crystal--b" aria-hidden="true"/>
   <div className="victory-cinema-fireworks" aria-hidden="true"><span/><span/><span/><span/></div>
   {/* Sei scene nuove, ognuna con una propria animazione, non soltanto un colore. */}
   <div className="victory-cinema-portal" aria-hidden="true"><span/><span/></div>
   <div className="victory-cinema-checkmate" aria-hidden="true"><span className="victory-chess-king">♚</span><span className="victory-chess-knight">♞</span><span className="victory-chess-rook">♜</span></div>
   <div className="victory-cinema-clock" aria-hidden="true"><span className="victory-clock-hour"/><span className="victory-clock-minute"/><span className="victory-clock-core"/></div>
   {/* Il drago è una figura vettoriale unica: corpo, testa e stelle seguono lo stesso
       sistema di coordinate. Niente deformazioni o pezzi disallineati. */}
   <div className="victory-cinema-astraldragon" aria-hidden="true">
     <svg className="victory-dragon-figure" viewBox="0 0 800 410" preserveAspectRatio="xMidYMid meet">
       <defs>
         <linearGradient id="victory-dragon-jade" x1="0" y1="1" x2="1" y2="0">
           <stop offset="0" stopColor="#059669"/>
           <stop offset=".55" stopColor="#34d399"/>
           <stop offset="1" stopColor="#bbf7d0"/>
         </linearGradient>
       </defs>
       <path className="victory-dragon-tail" d="M105 309 L29 307 L74 277 L63 247 L116 269" fill="#6ee7b7" opacity=".9"/>
       <path className="victory-dragon-body-glow" d="M101 300 C166 359 160 215 236 241 S343 321 389 232 S502 158 541 204 S600 194 641 150" fill="none" stroke="#34d399" strokeWidth="62" strokeLinecap="round" strokeLinejoin="round"/>
       <path className="victory-dragon-body" d="M101 300 C166 359 160 215 236 241 S343 321 389 232 S502 158 541 204 S600 194 641 150" fill="none" stroke="url(#victory-dragon-jade)" strokeWidth="34" strokeLinecap="round" strokeLinejoin="round"/>
       <path d="M104 285 C167 321 172 205 236 230 S347 295 388 215 S502 140 547 188 S608 173 632 139" fill="none" stroke="#d1fae5" strokeWidth="7" strokeLinecap="round" opacity=".85"/>
       <path className="victory-dragon-horn" d="M635 115 L628 69 L666 106 L697 103 L729 69 L713 124" fill="#a7f3d0"/>
       <path className="victory-dragon-head" d="M614 125 Q647 96 689 111 L712 119 L745 116 L724 140 L769 157 L740 178 L755 189 L704 188 Q679 215 643 188 L612 184 L624 154Z" fill="url(#victory-dragon-jade)" stroke="#d1fae5" strokeWidth="5" strokeLinejoin="round"/>
       <path d="M725 167 Q746 172 761 163 M674 182 Q685 196 706 188" fill="none" stroke="#064e3b" strokeWidth="5" strokeLinecap="round"/>
       <path d="M749 169 Q773 170 785 188 M750 173 Q771 191 776 209" fill="none" stroke="#a7f3d0" strokeWidth="3" strokeLinecap="round"/>
       <circle cx="704" cy="143" r="7" fill="#022c22"/>
       <circle cx="706" cy="141" r="2.2" fill="#fefce8"/>
       {[[94,300],[172,278],[239,241],[307,280],[386,233],[462,173],[541,204],[607,181],[676,114]].map(([x,y],i)=>
         <circle className="victory-dragon-star" key={i} cx={x} cy={y} r={i%3===0?8:5}
           style={{animationDelay:(i*.22)+'s'}} fill="#f0fdf4"/>
       )}
     </svg>
   </div>
   <div className="victory-cinema-thunderstorm" aria-hidden="true">{Array.from({length:6},(_,i)=><span key={i}/>)}</div>
   <div className="victory-cinema-storybook" aria-hidden="true">
     <span className="victory-book-left"/><span className="victory-book-right"/><span className="victory-book-cover"/>
     {/* Testo separato dalla copertina 3D: non verrà mai specchiato. */}
     <div className="victory-book-title">✦ VITTORIA ✦</div>
   </div>
   <div className="victory-cinema-meteorcrown" aria-hidden="true">
     {Array.from({length:5},(_,i)=><span className="victory-meteor" key={i} style={{'--meteor-index':i}}/>)}
     <div className="victory-meteor-crown"/>
   </div>
   <div className="victory-cinema-roseeclipse" aria-hidden="true">
     <div className="victory-eclipse-halo"/><div className="victory-eclipse-disc"/>
     {Array.from({length:14},(_,i)=><span className="victory-rose-petal" key={i} style={{
       '--rose-x':((i*47+11)%96)+'%','--rose-delay':((i*17)%23)/10+'s',
       '--rose-size':(7+(i%5)*3)+'px'
     }}/>)}
   </div>
   <div className="victory-cinema-royalcards" aria-hidden="true">
     {['♠','♥','♣','♦'].map((suit,i)=><div className="victory-royal-card" key={suit}
       style={{'--card-x':((i-1.5)*105)+'px','--card-angle':((i-1.5)*14)+'deg','--card-index':i}}>
       <span>{suit}</span>
     </div>)}
   </div>
   <div className="victory-cinema-mechaforge" aria-hidden="true">
     <span className="victory-forge-gear victory-forge-gear--left">⚙</span>
     <span className="victory-forge-gear victory-forge-gear--right">⚙</span>
     <div className="victory-forge-anvil"/><div className="victory-forge-hammer"/>
     {Array.from({length:9},(_,i)=><span className="victory-forge-spark" key={i}
       style={{'--spark-angle':(i*40)+'deg','--spark-distance':(58+(i%4)*20)+'px'}}/>)}
   </div>
   <div className="victory-cinema-particles" aria-hidden="true">
    {particles.map(p=><span key={p.i} style={{
     '--particle-x':p.x,'--particle-delay':p.delay,
     '--particle-duration':p.duration,'--particle-scale':p.scale,
     '--particle-i':p.i
    }}/>)}
   </div>
   <div className="victory-cinema-content">
    <div className="victory-cinema-kicker">✦ IL MULTIVERSO FESTEGGIA ✦</div>
    <div className="victory-cinema-emblem" aria-hidden="true">{effect.icon}</div>
    {presentation.heroImage&&<div className="victory-cinema-hero">
      <img src={presentation.heroImage} alt=""/>
    </div>}
    <h2>{effect.tagline}</h2>
    <div className="victory-cinema-divider" aria-hidden="true">✦　✧　✦</div>
    <strong className="victory-cinema-winner">{presentation.winnerName}</strong>
    <p>{effect.name}</p>
    <button type="button" onClick={()=>{setVisible(false);onClose?.()}} className="victory-cinema-skip">
      Continua ai risultati <span aria-hidden="true">→</span>
    </button>
   </div>
  </div>;
}
