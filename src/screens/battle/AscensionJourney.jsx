import React from 'react';
import {onMultimonImageError} from '../../systems/imageFallback.js';
import './AscensionJourney.css';

const ACTS=[
 {label:'ATTO I',title:'I primi passi',description:'Esplora i varchi e costruisci la tua squadra',symbol:'✿'},
 {label:'ATTO II',title:'La tua crescita',description:'Allena i tuoi compagni e supera avversari più esperti',symbol:'✦'},
 {label:'ATTO III',title:'Verso la gloria',description:'Ogni scelta ti avvicina al Colosseo',symbol:'♛'}
];
export function AscensionJourney({round,roster,onAction,characters,finished=false}){
 const actIndex=Math.min(2,Math.floor((round-1)/6)),act=ACTS[actIndex];
 const hero=characters.find(c=>c.id===roster?.[0]?.id);
 const readyToTrain=roster.filter(m=>(m.trainingHalves||0)>=2&&m.level<10).length;
 const canTrain=readyToTrain>0;
 return <div className={'ac-journey ac-journey--act-'+(actIndex+1)}>
  <section className="ac-journey-map" aria-label="Percorso verso il Colosseo">
   <div className="ac-journey-haze" aria-hidden="true"><span>✦</span><span>✧</span><span>✦</span></div>
   <div className="ac-journey-map-head">
    <div className="ac-journey-map-copy">
     <span className="ac-journey-eyebrow">✧ {act.label} · IL CAMMINO DEL CAMPIONE</span>
     <h3>{act.title} <em>{round}<small>/18</small></em></h3>
     <p>{act.description}</p>
    </div>
    <div className="ac-journey-seal" aria-hidden="true"><span>{act.symbol}</span><i/><i/></div>
   </div>
   <div className="ac-journey-checkpoints" role="progressbar" aria-label="Round completati"
     aria-valuemin={0} aria-valuemax={18} aria-valuenow={Math.max(0,round-1)}>
    {Array.from({length:18},(_,i)=>{
     const n=i+1;
     return <div key={n} className={'ac-journey-checkpoint'+(n<round?' ac-journey-checkpoint--past':'')+
      (n===round?' ac-journey-checkpoint--active':'')+(n%6===0?' ac-journey-checkpoint--boss':'')}
      title={'Round '+n+(n<round?' · Superato':n===round?' · Attuale':' · Da raggiungere')}>
       <span>{n%6===0?'✦':n}</span>
      </div>;
    })}
   </div>
   <div className="ac-journey-act-row">
    {ACTS.map((item,i)=><span key={item.label} className={i===actIndex?'current':''}>
     {item.symbol} {item.label} <small>{i*6+1}–{i*6+6}</small>
    </span>)}
   </div>
   <div className="ac-journey-map-footer">
    <span>◆ {Math.max(0,round-1)} round superati</span>
    <span>✦ {roster.length} Multimon nel team</span>
    <span>🏟️ Finale dopo il round 18</span>
   </div>
  </section>
  {finished?<div className="ac-journey-finished">✦ Percorso di questo round completato</div>:
  <section className="ac-journey-actions" aria-label="Scegli un percorso">
   <header className="ac-journey-choose-head"><span>✦ LA TUA PROSSIMA MOSSA</span><small>Una scelta per round · Ogni strada offre un vantaggio diverso</small></header>
   <div className="ac-journey-grid">
    <button type="button" className="ac-journey-choice ac-journey-choice--trainer" onClick={()=>onAction('round','trainer')}>
     <span className="ac-journey-choice-number">01 · SFIDA</span>
     <span className="ac-journey-choice-art" aria-hidden="true">
       {hero?.img?<img src={hero.img} onError={onMultimonImageError} alt=""/>:<span>⚔</span>}
       <i className="ac-journey-choice-spark">✦</i>
     </span>
     <strong>SFIDA ALLENATORE</strong>
     <small>Affronta una strategia offensiva, difensiva o speciale.</small>
     <span className="ac-journey-choice-prize">🪙 Monete · ⭐ EXP · +0,5 allenamento a tutti</span>
     <span className="ac-journey-choice-arrow" aria-hidden="true">↗</span>
    </button>
    <button type="button" className="ac-journey-choice ac-journey-choice--wild" onClick={()=>onAction('round','wild')}>
     <span className="ac-journey-choice-number">02 · ESPLORA</span>
     <span className="ac-journey-choice-art ac-journey-choice-mystery" aria-hidden="true"><span>?</span><i/><i/></span>
     <strong>VARCO SELVATICO</strong>
     <small>Un Multimon misterioso ti attende oltre il portale.</small>
     <span className="ac-journey-choice-prize">💎 Cattura · Scopri nuovi compagni</span>
     <span className="ac-journey-choice-arrow" aria-hidden="true">↗</span>
    </button>
    <button type="button" className="ac-journey-choice ac-journey-choice--training" disabled={!canTrain}
     onClick={()=>onAction('round','training')}>
     <span className="ac-journey-choice-number">03 · POTENZIA</span>
     <span className="ac-journey-choice-art" aria-hidden="true"><span className="ac-journey-choice-level">↑<b>LV</b></span></span>
     <strong>ALLENAMENTO</strong>
     <small>Allena contemporaneamente tutti i Multimon con almeno 1 punto disponibile.</small>
     <span className="ac-journey-choice-prize">{canTrain?'💪 '+readyToTrain+' pronti · +1 livello ciascuno':'🔒 Richiede 1 punto allenamento'}</span>
     <span className="ac-journey-choice-arrow" aria-hidden="true">↗</span>
    </button>
    <button type="button" className="ac-journey-choice ac-journey-choice--rest" onClick={()=>onAction('round','rest')}>
     <span className="ac-journey-choice-number">04 · RECUPERA</span>
     <span className="ac-journey-choice-art" aria-hidden="true"><span className="ac-journey-choice-heal">✚</span></span>
     <strong>CENTRO RECUPERO</strong>
     <small>Rimetti completamente in forze i tuoi compagni.</small>
     <span className="ac-journey-choice-prize">💚 Cura completa · Termina il round</span>
     <span className="ac-journey-choice-arrow" aria-hidden="true">↗</span>
    </button>
   </div>
  </section>}
 </div>;
}
