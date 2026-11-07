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
