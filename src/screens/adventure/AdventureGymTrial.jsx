import React,{useState} from 'react';
import {adventureTrialForZone,adventureTrialInitial,adventureTrialStep} from '../../systems/adventureEnhancements.js';
import './AdventureGymTrial.css';

// Sei prove realmente interattive, completamente eseguibili con mouse, touch o tastiera.
export function AdventureGymTrial({zoneId,onComplete,onClose}){
 const spec=adventureTrialForZone(zoneId);
 const [state,setState]=useState(()=>adventureTrialInitial(zoneId));
 const [showPattern,setShowPattern]=useState(false);
 if(!spec||!state)return null;
 const run=choice=>setState(previous=>adventureTrialStep(previous,choice));
 const total=spec.kind==='growth'?spec.values.length:
  ['forge','tides'].includes(spec.kind)?spec.targets.length:
  spec.kind==='ice'?1:spec.answer.length;
 const index=Math.min(state.step,total-1);
 return <div className="adv-trial-overlay" role="dialog" aria-modal="true" aria-label={'Prova '+spec.name}>
  <section className={'adv-trial-box adv-trial-'+spec.kind}>
   <div className="adv-trial-top"><span className="adv-trial-kicker">🏛️ PROVA DELLA PALESTRA</span>
    <button type="button" className="adv-trial-close" onClick={onClose} aria-label="Esci dalla prova">✕</button></div>
   <div className="adv-trial-title"><span>{spec.icon}</span><div><h2>{spec.name}</h2><p>{spec.intro}</p></div></div>
   <div className="adv-trial-progress">{Array.from({length:total},(_,i)=><i key={i} className={i<state.step?'done':i===state.step?'active':''}/>)}</div>
   {state.solved?<div className="adv-trial-success">
     <span>🏅</span><h3>PROVA SUPERATA!</h3>
     <p>Hai aperto il passaggio verso il capopalestra. La prova resterà completata anche quando torni a giocare.</p>
     <button type="button" className="adv-primary" onClick={onComplete}>AFFRONTA IL CAPOPALESTRA →</button>
    </div>:<>
    <div className="adv-trial-stage">FASE {state.step+1} DI {total}{state.mistakes>0&&
     <span> · Riprova: {state.mistakes}</span>}</div>
    {spec.kind==='growth'&&<div className="adv-trial-growth">
      <p className="adv-trial-hint">{spec.clues[index]}</p>
      <div className="adv-trial-options">
       {spec.options[index].map(v=><button key={v} type="button" onClick={()=>run(v)}>
        <span>{v==='sole'?'☀️':v==='rugiada'?'💧':'🌱'}</span><strong>{v.toUpperCase()}</strong>
       </button>)}</div>
      <p className="adv-trial-footnote">Ogni gesto fa crescere il giardino. I passaggi si aprono uno alla volta.</p>
     </div>}
    {spec.kind==='forge'&&<div className="adv-trial-forge">
      <p>Temperatura richiesta: <strong>{spec.targets[index]}°</strong></p>
      <div className="adv-trial-thermo"><div style={{width:state.value+'%'}}/><span>{state.value}°</span></div>
      <div className="adv-trial-controls">{[-25,-10,-5,5,10,25].map(n=><button key={n} type="button" onClick={()=>run(n)}>{n>0?'+':''}{n}°</button>)}</div>
      <button className="adv-primary" type="button" onClick={()=>run('confirm')}>TEMPERA IL METALLO</button>
     </div>}
    {spec.kind==='tides'&&<div className="adv-trial-tides">
      <p>Portata richiesta: <strong>{spec.targets[index]}</strong> · Portata attuale: <strong>{state.value}</strong></p>
      <div className="adv-trial-valves">{[1,2,4].map((volume,i)=><button type="button" key={i}
       className={(state.value&(1<<i))?'open':''} onClick={()=>run(i)}>
       <span>{(state.value&(1<<i))?'🌊':'🔒'}</span><strong>CHIUSA {volume}</strong><small>{(state.value&(1<<i))?'APERTA':'CHIUSA'}</small>
      </button>)}</div>
      <button className="adv-primary" type="button" onClick={()=>run('confirm')}>VERIFICA PORTATA</button>
     </div>}
    {spec.kind==='ice'&&<div className="adv-trial-ice">
      <p>Parti dalla figura azzurra. Raggiungi il sigillo dorato senza fermarti a metà scivolata.</p>
      <div className="adv-trial-ice-grid">{Array.from({length:spec.width*spec.height},(_,index)=>{
       const x=index%spec.width,z=Math.floor(index/spec.width);
       const wall=spec.walls.some(([wx,wz])=>wx===x&&wz===z);
       const player=state.position[0]===x&&state.position[1]===z;
       const target=spec.goal[0]===x&&spec.goal[1]===z;
       return <span key={index} className={'adv-trial-ice-cell'+(wall?' wall':'')+(player?' player':'')+(target?' goal':'')}>
        {wall?'🧊':player?'🧍':target?'⭐':''}</span>;
      })}</div>
      <div className="adv-trial-directions">
       <button type="button" onClick={()=>run('up')} aria-label="Scivola su">↑</button>
       <div><button type="button" onClick={()=>run('left')} aria-label="Scivola a sinistra">←</button>
       <button type="button" onClick={()=>run('down')} aria-label="Scivola giù">↓</button>
       <button type="button" onClick={()=>run('right')} aria-label="Scivola a destra">→</button></div>
      </div>
      <button className="adv-trial-reset" type="button" onClick={()=>setState(adventureTrialInitial(zoneId))}>Ricomincia il percorso</button>
     </div>}
    {['stars','runes'].includes(spec.kind)&&<div className="adv-trial-stars">
      <p>{spec.kind==='stars'?'Ricorda i simboli della mappa e selezionali nell ordine indicato.':
       'Attiva le sei chiavi nel loro ordine geografico, dalla prima valle alla Lega.'}</p>
      {spec.kind==='stars'&&<button className="adv-trial-pattern" type="button"
        onClick={()=>setShowPattern(v=>!v)}>{showPattern?
         'Onda → Custode → Corona → Alba':'MOSTRA / NASCONDI LA MAPPA DELLA COSTELLAZIONE'}</button>}
      <div className="adv-trial-runes">{spec.symbols.map((name,i)=><button type="button" key={name}
       onClick={()=>run(i)}><span>{['✦','◆','◈','✧','❖','⬡'][i]}</span><strong>{name}</strong></button>)}</div>
      <p className="adv-trial-footnote">Sigilli accesi: {state.history.map(i=>spec.symbols[i]).join(' · ')||'nessuno'}</p>
     </div>}
    </>}
    <div className="adv-trial-bottom"><button type="button" onClick={onClose}>← TORNA AL MONDO</button>
      <span>La Palestra non richiede un secondo motore di combattimento.</span></div>
  </section>
 </div>;
}
