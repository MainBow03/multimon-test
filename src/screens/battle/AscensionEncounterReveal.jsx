import React,{useEffect,useRef,useState} from 'react';
import {onMultimonImageError} from '../../systems/imageFallback.js';
import './AscensionEncounterReveal.css';

// Solo per selvatici e allenatori: NON avvia la lunga intro "pre_battle".
export function AscensionEncounterReveal({encounter,foe,onFinish}){
 const [revealed,setRevealed]=useState(false);
 const finish=useRef(onFinish);
 useEffect(()=>{finish.current=onFinish},[onFinish]);
 useEffect(()=>{
  const show=setTimeout(()=>setRevealed(true),850);
  const done=setTimeout(()=>finish.current(),2700);
  return ()=>{clearTimeout(show);clearTimeout(done)};
 },[]);
 const trainer=encounter.kind==='trainer';
 return <div className="ac-intro" role="dialog" aria-modal="true" aria-label="Rivelazione avversario">
  <div className="ac-intro-card">
   <p className="ac-intro-eyebrow">{trainer?'⚔️ UN ALLENATORE TI SFIDA':'🌿 UN INCONTRO SELVATICO'}</p>
   <div className={'ac-intro-stage'+(revealed?' ac-intro-stage--revealed':'')}>
    <span className="ac-intro-sparkles" aria-hidden="true">✦ ✧ ✦</span>
    {foe.img?<img src={foe.img} alt={revealed?foe.name:''} onError={onMultimonImageError}/>:<span className="ac-intro-unknown">?</span>}
    {!revealed&&<span className="ac-intro-mark" aria-hidden="true">?</span>}
   </div>
   <small>{trainer?'SFIDA DELL\'ALLENATORE':'IDENTITÀ DEL MULTIMON'}</small>
   <h2 aria-live="polite">{revealed?(trainer?encounter.trainerName+' manda in campo '+foe.name+'!':'È '+foe.name+'!'):
    'Chi apparirà dal varco?'}</h2>
   <p className="ac-intro-subtitle">{revealed?'Livello '+encounter.foeLevel+' · Si combatte!':'Un Multimon sta per apparire...'}</p>
   {revealed&&<button type="button" onClick={onFinish}>Inizia la battaglia →</button>}
  </div>
 </div>;
}
