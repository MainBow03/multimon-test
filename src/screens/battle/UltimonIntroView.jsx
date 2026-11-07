import React,{useEffect,useState} from 'react';
import {ULTIMON_MONOLOGUE_STYLES,ultimonSuggestedMonologue,
 currentUltimonIntroRole,ultimonIntroCast,ultimonIntroSpeech}
 from '../../systems/ultimonIntro.js';
import './UltimonIntroView.css';

export function UltimonIntroView({room,appMode,playerRole,isHost,onSpeech,onHost}){
 const intro=room.ultimon?.intro||{};
 const order=intro.order||[];
 const role=currentUltimonIntroRole(room);
 const team=room.ultimon?.identities?.[role]||{};
 const name=team.name||room.players?.[role]||role;
 const cast=ultimonIntroCast(room,role);
 const step=intro.step||'call';
 const speech=ultimonIntroSpeech(room,role);
 const spoken=Boolean(speech);
 const canSpeak=step==='speech'&&!room.isBot?.[role] &&
   (appMode==='local_room'||playerRole===role)&&!intro.monologues?.[role];
 const [style,setStyle]=useState('eroico');
 const [draft,setDraft]=useState('');
 const [sending,setSending]=useState(false);

 useEffect(()=>{
  setStyle('eroico');
  setDraft(ultimonSuggestedMonologue(name,'eroico'));
  setSending(false);
 },[role,name]);
 useEffect(()=>{if(spoken)setSending(false);},[spoken]);

 // Il presentatore host fa avanzare la sequenza sullo stato Firestore,
 // mai sui singoli client: tutti vedono lo stesso personaggio e la stessa riga.
 // Durante il monologo umano aspetta SEMPRE l'invio esplicito del giocatore.
 useEffect(()=>{
  if(!isHost||step==='complete'||(step==='speech'&&!spoken))return;
  const delay={call:3100,speech:4300,line:3500,exit:2500}[step]||3200;
  const timer=setTimeout(()=>onHost('introNext'),delay);
  return()=>clearTimeout(timer);
 },[isHost,step,intro.index,intro.lineIndex,spoken]);

 const selected=cast[Math.max(0,intro.lineIndex||0)];
 const progress=order.length?Math.round((Math.max(0,intro.index)+(step==='complete'?1:0))/order.length*100):0;
 const caption={
  call:'IL PRESENTATORE CHIAMA LA PROSSIMA SQUADRA',
  speech:'IL CAPITANO HA LA PAROLA',
  line:'I MULTIMON ENTRANO IN SCENA',
  exit:'LA SQUADRA RAGGIUNGE LA SUA POSTAZIONE',
  complete:'TUTTI I PARTECIPANTI SONO PRONTI'
 }[step];
 const canNext=step!=='speech'||spoken;
 return <section className="ultimon-introduction" aria-label="Cerimonia d'ingresso Ultimon">
   <header className="ultimon-intro-heading">
    <span className="ultimon-intro-kicker">🎤 DIRETTAMENTE DALL'ARENA DEL MULTIVERSO</span>
    <h2>LA GRANDE PRESENTAZIONE</h2>
    <p>Le squadre fanno il loro ingresso. Prima parla il capitano, poi quattro Multimon scelti a caso.</p>
    <div className="ultimon-intro-progress" role="progressbar" aria-label="Squadre presentate"
      aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
      <span style={{width:progress+'%'}}/>
    </div>
   </header>

   <div className="ultimon-intro-parade" aria-label="Ordine degli ingressi">
    {order.map((p,i)=>{
     const identity=room.ultimon?.identities?.[p]||{};
     return <div key={p}
       className={'ultimon-intro-parade-team '+(i<intro.index?'ultimon-intro-parade-team--past ':'')+
        (i===intro.index?'ultimon-intro-parade-team--active':'')}
       style={{'--intro-team-color':identity.color||'#94a3b8'}}>
       <span>{i+1}</span><strong>{identity.name||room.players?.[p]||p}</strong>
       {i<intro.index&&<b>✓</b>}
     </div>;
    })}
   </div>

   {step!=='complete'?<div className="ultimon-intro-stage"
      style={{'--intro-team-color':team.color||'#a78bfa'}}>
     <div className="ultimon-intro-spotlight" aria-hidden="true"/>
     <div className="ultimon-intro-announcer">
      <span className="ultimon-intro-mic">🎙️</span>
      <div><strong>IL PRESENTATORE</strong><span>{caption}</span></div>
     </div>
     <div className="ultimon-intro-team-name">✦ {name} ✦</div>

     {step==='call'&&<div key={role+'call'} className="ultimon-intro-call ultimon-intro-appear">
       <div className="ultimon-intro-call-silhouette" aria-hidden="true">
        {cast.slice(0,4).map((c,i)=><img key={i} src={c.img} alt=""
          style={{animationDelay:i*.14+'s'}}/>)}
       </div>
       <h3>Signore e signori… fate spazio!</h3>
       <p>Il pubblico si alza in piedi per accogliere <b>{name}</b>!</p>
       <div className="ultimon-intro-shout">CHE L'ARENA ACCOLGA QUESTA SQUADRA!</div>
      </div>}

     {step==='speech'&&<div key={role+'speech'} className="ultimon-intro-speech ultimon-intro-appear">
       <div className="ultimon-intro-avatar-collage" aria-hidden="true">
        {cast.map((c,i)=><img key={i} src={c.img} alt=""/>)}
       </div>
       <h3>🎤 {room.players?.[role]||role}, il pubblico ti ascolta!</h3>
       {spoken?
        <blockquote className="ultimon-intro-dialogue"><span>❝</span>{speech}<span>❞</span></blockquote>:
        canSpeak?
        <div className="ultimon-intro-monologue-editor">
         <p>Scegli lo stile del tuo monologo oppure scrivine uno completamente tuo.</p>
         <div className="ultimon-intro-styles">
          {ULTIMON_MONOLOGUE_STYLES.map(s=><button type="button" key={s.id}
            aria-pressed={style===s.id}
            className={'ultimon-intro-style '+(style===s.id?'ultimon-intro-style--selected':'')}
            onClick={()=>{setStyle(s.id);setDraft(ultimonSuggestedMonologue(name,s.id));}}>
            <span>{s.icon}</span><strong>{s.name}</strong>
           </button>)}
         </div>
         <label htmlFor="ultimon-intro-monologue">Il tuo discorso d'ingresso</label>
         <textarea id="ultimon-intro-monologue" value={draft}
           onChange={e=>{setDraft(e.target.value);setStyle('personalizzato');}}
           maxLength={260} rows={4} placeholder="Scrivi qui quello che vuoi dire quando entri nell'arena…"/>
         <div className="ultimon-intro-editor-bottom">
          <small>{draft.trim().length}/260 caratteri · minimo 12</small>
          <button type="button" className="ultimon-action" disabled={sending||draft.trim().length<12}
            onClick={()=>{setSending(true);Promise.resolve(onSpeech(role,draft))
              .finally(()=>setSending(false));}}>
            🎤 Pronuncia il monologo
          </button>
         </div>
        </div>:
        <div className="ultimon-intro-waiting">⌛ In attesa che {room.players?.[role]||name} scelga il proprio monologo…</div>}
      </div>}

     {step==='line'&&<div key={role+'line'+intro.lineIndex} className="ultimon-intro-character ultimon-intro-appear">
       <div className="ultimon-intro-character-count">MULTIMON {intro.lineIndex+1} / {cast.length}</div>
       {selected&&<div className="ultimon-intro-character-portrait">
        <div className="ultimon-intro-character-halo" aria-hidden="true"/>
        <img src={selected.img} alt={selected.name}/>
       </div>}
       <h3>{selected?.name||'Il prossimo Multimon'}</h3>
       <blockquote className="ultimon-intro-dialogue">
        <span>❝</span>{selected?.line||'Pronti alla battaglia!'}<span>❞</span>
       </blockquote>
       <div className="ultimon-intro-lineup">
        {cast.map((c,i)=><div key={i}
          className={'ultimon-intro-lineup-item '+(i===intro.lineIndex?'ultimon-intro-lineup-item--speaking':'')}
          title={c.name}>
          <img src={c.img} alt={c.name}/><small>{c.name}</small>
         </div>)}
       </div>
      </div>}

     {step==='exit'&&<div key={role+'exit'} className="ultimon-intro-exit ultimon-intro-appear">
       <h3>UN INGRESSO DA RICORDARE!</h3>
       <div className="ultimon-intro-exit-roster">
        {cast.map((c,i)=><figure key={i}>
         <img src={c.img} alt={c.name}/><figcaption>{c.name}</figcaption>
        </figure>)}
       </div>
       <p><b>{name}</b> prende posto. L'arena attende la prossima squadra!</p>
      </div>}

    <div className="ultimon-intro-footnote">
      {isHost&&canNext&&<button type="button" className="ultimon-intro-skip"
       onClick={()=>onHost('introNext')}>Prosegui con la presentazione ›</button>}
      {isHost&&canNext&&<small>Avanzamento automatico tra pochi istanti</small>}
      {step==='speech'&&!spoken&&!canSpeak&&<small>Il capitano deve parlare prima dei quattro Multimon.</small>}
    </div>
   </div>:
   <div className="ultimon-intro-end ultimon-intro-appear">
    <div className="ultimon-intro-end-crown">🏆</div>
    <h3>IL MULTIVERSO È AL COMPLETO!</h3>
    <p>Tutti i capitani hanno parlato e tutti i Multimon protagonisti si sono presentati.
      Ora la fortuna sceglierà chi entrerà in battaglia per primo!</p>
    <div className="ultimon-intro-end-teams">
     {order.map(p=><div key={p} style={{'--intro-team-color':room.ultimon?.identities?.[p]?.color||'#94a3b8'}}>
      <strong>{room.ultimon?.identities?.[p]?.name||room.players?.[p]}</strong>
      <small>✓ Presentata</small>
     </div>)}
    </div>
    {isHost?<button className="ultimon-action" type="button"
      onClick={()=>onHost('pair')}>🎲 INIZIA IL TORNEO · SORTEGGIA GLI SFIDANTI</button>:
      <p className="ultimon-intro-waiting">In attesa che il presentatore annunci il primo duello…</p>}
   </div>}
  </section>;
}
