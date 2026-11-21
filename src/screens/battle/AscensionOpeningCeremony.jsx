import React,{useEffect,useMemo,useState} from 'react';
import {onMultimonImageError} from '../../systems/imageFallback.js';
import './AscensionOpeningCeremony.css';

const SOVEREIGN='Sovrano Aurelion';
export function AscensionOpeningCeremony({asc,room,role,characters,onFinish}){
 const [step,setStep]=useState(0);
 const [busy,setBusy]=useState(false);
 const contenders=useMemo(()=>asc.roles.map((r,i)=>{
  const starterId=asc.participants?.[r]?.roster?.[0]?.id;
  const character=characters.find(c=>c.id===starterId);
  return {id:r,position:i+1,name:room.players?.[r]||'Sfidante '+(i+1),
   starter:character||{id:starterId,name:starterId||'Sconosciuto',img:''},
   bot:!!room.isBot?.[r]};
 }),[asc.roles,asc.participants,room.players,room.isBot,characters]);
 const sovereign=characters.find(c=>c.id==='sovranoaurelion');
 const count=contenders.length;
 const introduction=step===0;
 const closing=step>count;
 const subject=!introduction&&!closing?contenders[step-1]:null;
 useEffect(()=>{
  if(closing||busy)return;
  const timer=setTimeout(()=>setStep(s=>Math.min(count+1,s+1)),
    introduction?2800:2050);
  return ()=>clearTimeout(timer);
 },[step,closing,introduction,count,busy]);
 const next=()=>setStep(s=>Math.min(count+1,s+1));
 const finish=async()=>{
  if(busy)return;
  setBusy(true);
  try{await onFinish()}finally{setBusy(false)}
 };
 const phrase=introduction
  ?'Per troppo tempo, il Colosseo è rimasto in silenzio. Oggi apro i suoi cancelli: otto allenatori affronteranno diciotto prove, e soltanto uno conquisterà il titolo di Campione!'
  :closing
   ?'Sfidanti, vi ho chiamati per una ragione: voglio scoprire chi sa crescere insieme ai propri Multimon. Scegliete il vostro cammino. Che l’Ascesa abbia inizio!'
   :'Dal varco numero '+subject.position+', '+subject.name+
    ' entrerà nell’arena al fianco di '+subject.starter.name+'!';
 return <main className="ac-ceremony" aria-label="Cerimonia di apertura dell'Ascesa del Colosseo">
  <div className="ac-ceremony-halo" aria-hidden="true"><i/><i/><i/></div>
  <div className="ac-ceremony-particles" aria-hidden="true">✧ ✦ ✧ ✦ ✧</div>
  <header className="ac-ceremony-banner">
   <span>🏟️ ASCESA DEL COLOSSEO</span>
   <span>✧ CERIMONIA D’APERTURA ✧</span>
  </header>
  <section className="ac-ceremony-stage">
   <div className="ac-ceremony-sovereign">
    <div className="ac-ceremony-sovereign-art">
     {sovereign?.img?<img className="ac-ceremony-sovereign-portrait"
      src={sovereign.img} alt="Sovrano Aurelion" onError={onMultimonImageError}/>:
      <span className="ac-ceremony-crown" aria-hidden="true">♛</span>}
    </div>
    <div className="ac-ceremony-royal-caption"><strong>{SOVEREIGN}</strong><small>Custode del Colosseo dei Mondi</small></div>
   </div>
   <div className="ac-ceremony-content">
    <div className="ac-ceremony-eyebrow">{introduction?'IL DECRETO REALE':closing?'IL GIURAMENTO DEGLI SFIDANTI':
     'PRESENTAZIONE · '+step+' / '+count}</div>
    <div key={step} className="ac-ceremony-slide">
     {subject?
      <>
       <div className="ac-ceremony-character">
        <div className="ac-ceremony-portal" aria-hidden="true">✧</div>
        {subject.starter.img?<img src={subject.starter.img} alt={subject.starter.name} onError={onMultimonImageError}/>:
         <span className="ac-ceremony-fallback">✦</span>}
       </div>
       <h1>{subject.name}</h1>
       <div className="ac-ceremony-starter-name">✦ {subject.starter.name} <span>{subject.bot?'· CPU':''}</span></div>
       {subject.id===role&&<span className="ac-ceremony-you">IL TUO INGRESSO</span>}
      </>:
      <div className="ac-ceremony-announcement">
       <span aria-hidden="true">{closing?'🏆':'⚔️'}</span>
       <h1>{closing?'CHE L’ASCESA COMINCI!':'OTTO SFIDANTI. UN SOLO TRONO.'}</h1>
       <p>{closing?'Il cammino verso il Colosseo si apre.':'Il Sovrano ha convocato otto allenatori da ogni angolo del Multiverso.'}</p>
      </div>
     }
    </div>
    <div className="ac-ceremony-dialogue" aria-live="polite" key={'dialogue-'+step}>
     <span className="ac-ceremony-dialogue-speaker">♛ {SOVEREIGN}</span>
     <p>«{phrase}»</p>
    </div>
   </div>
  </section>
  <section className="ac-ceremony-lineup" aria-label="Gli sfidanti annunciati">
   {contenders.map((p,index)=>{
    const shown=closing||step>index;
    return <div key={p.id} className={'ac-ceremony-contender'+(subject?.id===p.id?' current':'')+
      (shown?' revealed':'')} title={shown?p.name+' e '+p.starter.name:'Sfidante da annunciare'}>
      <div className="ac-ceremony-contender-art">
       {shown&&p.starter.img?<img src={p.starter.img} alt="" onError={onMultimonImageError}/>:<span>?</span>}
      </div>
      <small>#{p.position} {shown?p.name:'???'}</small>
      <strong>{shown?p.starter.name:'Da rivelare'}</strong>
     </div>;
   })}
  </section>
  <footer className="ac-ceremony-controls">
   <div className="ac-ceremony-dots" aria-label={'Annuncio '+(step+1)+' di '+(count+2)}>
    {Array.from({length:count+2},(_,i)=><i key={i} className={i<=step?'seen':''}/>)}
   </div>
   <div className="ac-ceremony-buttons">
    {!closing&&<button type="button" className="ac-ceremony-skip" onClick={()=>setStep(count+1)}>
      Salta le presentazioni
    </button>}
    {!closing?<button type="button" className="ac-ceremony-advance" onClick={next}>Avanti →</button>:
     <button type="button" className="ac-ceremony-advance" disabled={busy} onClick={finish}>
      🏟️ Inizia il percorso →
     </button>}
   </div>
  </footer>
 </main>;
}
