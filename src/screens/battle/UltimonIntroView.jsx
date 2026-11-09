import {onMultimonImageError} from '../../systems/imageFallback.js';
import React,{useEffect,useRef,useState} from 'react';
import {ULTIMON_MONOLOGUE_STYLES,ULTIMON_ENTRANCE_EFFECTS,ultimonIntroEntrance,
 ultimonIntroFullTeam,ultimonSuggestedMonologue,currentUltimonIntroRole,ultimonIntroCast,ultimonIntroSpeech,
 ultimonIntroSceneReady,ultimonIntroSceneDeadline,ULTIMON_INTRO_AUTO_ADVANCE_MS}
 from '../../systems/ultimonIntro.js';
import {ULTIMON_BASIC_ENTRANCE} from '../../systems/ultimonCosmetics.js';
import './UltimonIntroView.css';

export function UltimonIntroView({room,appMode,playerRole,isHost,onSpeech,onEntrance,onHost,ownedEffects=[]}){
 const intro=room.ultimon?.intro||{};
 const order=intro.order||[];
 const role=currentUltimonIntroRole(room);
 const team=room.ultimon?.identities?.[role]||{};
 const name=team.name||room.players?.[role]||role;
 const cast=ultimonIntroCast(room,role);
 const fullTeam=ultimonIntroFullTeam(room,role);
 const ownedSet=new Set(ownedEffects);
 const usableEffects=ULTIMON_ENTRANCE_EFFECTS.filter(e=>ownedSet.has(e.id));
 const step=intro.step||'call';
 const speech=ultimonIntroSpeech(room,role);
 const spoken=Boolean(speech);
 const entranceId=ultimonIntroEntrance(room,role);
 const entrance=entranceId===ULTIMON_BASIC_ENTRANCE.id
   ?ULTIMON_BASIC_ENTRANCE
   :ULTIMON_ENTRANCE_EFFECTS.find(effect=>effect.id===entranceId)||null;
 const entranceReady=Boolean(entrance);
 const canEnter=step==='entrance_select'&&!room.isBot?.[role]&&
   (appMode==='local_room'||playerRole===role)&&!intro.entrances?.[role];
 const canSpeak=step==='speech'&&!room.isBot?.[role] &&
   (appMode==='local_room'||playerRole===role)&&!intro.monologues?.[role];
 const [style,setStyle]=useState('eroico');
 const [draft,setDraft]=useState('');
 const [sending,setSending]=useState(false);
 const [entranceSending,setEntranceSending]=useState(false);
 const [remainingSeconds,setRemainingSeconds]=useState(null);
 const [hostActionPending,setHostActionPending]=useState(false);
 const autoEntranceRef=useRef('');
 const selected=cast[Math.max(0,intro.lineIndex||0)];
 const rival=selected?.duplicate?.rival;
 const duelStat=selected?.duplicate?.comparison;

 useEffect(()=>{
  setStyle('eroico');
  setDraft(ultimonSuggestedMonologue(name,'eroico'));
  setSending(false);
  setEntranceSending(false);
 },[role,name]);
 useEffect(()=>{if(spoken)setSending(false);},[spoken]);
 useEffect(()=>{if(entranceReady)setEntranceSending(false);},[entranceReady,role]);
 // Nessun cosmetico posseduto? Salta la scelta e usa automaticamente
 // l'entrata classica. Un ref impedisce doppie richieste Firestore.
 useEffect(()=>{
  if(!canEnter||usableEffects.length||entranceReady)return;
  const key=role+':'+intro.index;
  if(autoEntranceRef.current===key)return;
  autoEntranceRef.current=key;
  setEntranceSending(true);
  Promise.resolve(onEntrance(role,ULTIMON_BASIC_ENTRANCE.id))
   .catch(()=>{autoEntranceRef.current='';})
   .finally(()=>setEntranceSending(false));
 },[canEnter,role,intro.index,ownedEffects.join('|'),entranceReady]);

 // Tutti i dispositivi usano la stessa scadenza sincronizzata via Firestore.
 // Nessun timer parte mentre il capitano sta SCRIVENDO il monologo o scegliendo
 // l'effetto. Solo l'host può anticipare il cambio di scena.
 const sceneReady=ultimonIntroSceneReady(room);
 const sceneDeadline=ultimonIntroSceneDeadline(room);
 useEffect(()=>{
  if(!sceneReady||!sceneDeadline){setRemainingSeconds(null);return;}
  const tick=()=>setRemainingSeconds(Math.max(0,Math.ceil((sceneDeadline-Date.now())/1000)));
  tick();
  const ticker=setInterval(tick,250);
  return()=>clearInterval(ticker);
 },[sceneReady,sceneDeadline]);
 useEffect(()=>{
  if(!isHost||!sceneReady||!sceneDeadline)return;
  const timer=setTimeout(()=>onHost('introNext'),Math.max(0,sceneDeadline-Date.now()));
  return()=>clearTimeout(timer);
 },[isHost,sceneReady,sceneDeadline,intro.index,intro.lineIndex,step]);
 const hostAdvance=action=>{
  if(!isHost||hostActionPending)return;
  setHostActionPending(true);
  Promise.resolve(onHost(action)).catch(error=>console.error('Presentazione Ultimon:',error))
   .finally(()=>setHostActionPending(false));
 };

 const progress=order.length?Math.round((Math.max(0,intro.index)+(step==='complete'?1:0))/order.length*100):0;
 const caption={
  call:'IL PRESENTATORE CHIAMA LA PROSSIMA SQUADRA',
  speech:'IL CAPITANO HA LA PAROLA',
  entrance_select:'COME VUOI FARE IL TUO INGRESSO?',
  entrance:'ATTENZIONE: ENTRATA SPETTACOLARE!',
  line:'I MULTIMON ENTRANO IN SCENA',
  exit:'LA SQUADRA RAGGIUNGE LA SUA POSTAZIONE',
  complete:'TUTTI I PARTECIPANTI SONO PRONTI'
 }[step];
 const canNext=(step!=='speech'||spoken)&&
  (step!=='entrance_select'||entranceReady);
 return <section className="ultimon-introduction" aria-label="Cerimonia d'ingresso Ultimon">
   <header className="ultimon-intro-heading">
    <span className="ultimon-intro-kicker">🎤 DIRETTAMENTE DALL'ARENA DEL MULTIVERSO</span>
    <h2>LA GRANDE PRESENTAZIONE</h2>
    <p>Prima il monologo del capitano, poi un ingresso personalizzato fra 16 spettacoli da collezionare… e infine quattro Multimon prendono la parola!</p>
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
        {fullTeam.map((c,i)=><img key={i} src={c.img} onError={onMultimonImageError} alt=""
          style={{animationDelay:i*.14+'s'}}/>)}
       </div>
       <h3>Signore e signori… fate spazio!</h3>
       <p>Il pubblico si alza in piedi per accogliere <b>{name}</b>!</p>
       <div className="ultimon-intro-shout">CHE L'ARENA ACCOLGA QUESTA SQUADRA!</div>
      </div>}

     {step==='speech'&&<div key={role+'speech'} className="ultimon-intro-speech ultimon-intro-appear">
       <div className="ultimon-intro-avatar-collage" aria-hidden="true">
        {cast.map((c,i)=><img key={i} src={c.img} onError={onMultimonImageError} alt=""/>)}
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

     {step==='entrance_select'&&<div key={role+'entrance-select'} className="ultimon-intro-entrance-picker ultimon-intro-appear">
      <div className="ultimon-intro-entrance-crown">✦ IL TUO MOMENTO DI GLORIA ✦</div>
      <h3>🎬 Scegli la tua entrata ad effetto!</h3>
      <p>Il monologo è stato pronunciato! Gli ingressi speciali vanno acquistati nel Negozio → Cosmetici (100 monete, permanenti).</p>
      {canEnter&&usableEffects.length>0?<div className="ultimon-intro-entrance-grid">
       {usableEffects.map(effect=><button type="button"
          key={effect.id} className={'ultimon-intro-entrance-option ultimon-intro-entrance-option--'+effect.id}
          style={{'--entrance-accent':effect.accent,'--entrance-ink':effect.color}}
          disabled={entranceSending} aria-label={'Entra con '+effect.name}
          onClick={()=>{setEntranceSending(true);Promise.resolve(onEntrance(role,effect.id))
            .finally(()=>setEntranceSending(false));}}>
           <span className="ultimon-intro-entrance-option-icon">{effect.icon}</span>
           <strong>{effect.name}</strong>
           <small>{effect.hint}</small>
           <b>{entranceSending?'Conferma in corso…':'SCEGLI QUESTO EFFETTO ✨'}</b>
         </button>)}
         <button type="button" className="ultimon-intro-entrance-option ultimon-intro-entrance-option--basic"
           disabled={entranceSending} onClick={()=>{setEntranceSending(true);
             Promise.resolve(onEntrance(role,ULTIMON_BASIC_ENTRANCE.id))
             .finally(()=>setEntranceSending(false));}}>
           <span className="ultimon-intro-entrance-option-icon">🎤</span>
           <strong>Ingresso Classico</strong>
           <small>Entrata normale, gratis per tutti. I tuoi Multimon si presentano senza effetti speciali.</small>
           <b>ENTRA NORMALMENTE</b>
         </button>
      </div>:entrance?<div className="ultimon-intro-entrance-confirmed" role="status">
       <div>{entrance.icon}</div><h4>{entrance.name}</h4>
       <p>{entranceId==='basic'?'La squadra entra normalmente.':'Il presentatore prepara lo spettacolo scelto. L’intera arena lo vedrà!'}</p>
      </div>:<div className="ultimon-intro-waiting">
       {canEnter?'🎤 Nessun cosmetico acquistato: ingresso classico automatico…':
        '⌛ In attesa che '+(room.players?.[role]||name)+' prepari la sua entrata…'}
      </div>}
     </div>}

     {step==='entrance'&&<div key={role+'entrance-'+entranceId}
       className={'ultimon-intro-entrance-show ultimon-intro-entrance-show--'+(entranceId||'starfall')}
       style={{'--entrance-accent':entrance?.accent||'#f59e0b',
         '--entrance-ink':entrance?.color||'#fde68a'}} aria-label="Entrata speciale della squadra">
       <div className="ultimon-intro-entrance-backdrop" aria-hidden="true"/>
       <div className="ultimon-intro-entrance-effect" aria-hidden="true">
        {Array.from({length:20},(_,i)=><span key={i} className="ultimon-intro-effect-particle"
         style={{'--i':i,'--delay':(i%7)*.19+'s',
           '--x':(7+(i*37)%88)+'%','--scale':(.64+(i%5)*.26)}}/>)}
       </div>
       <div className="ultimon-intro-entrance-portal" aria-hidden="true"/>
       <div className="ultimon-intro-entrance-thunder" aria-hidden="true"/>
       <div className="ultimon-intro-entrance-flames" aria-hidden="true">🔥 🔥 🔥</div>
       <div className="ultimon-intro-entrance-red-carpet" aria-hidden="true"/>
       <div className="ultimon-intro-entrance-burst" aria-hidden="true">✦</div>
       <div className="ultimon-cinema-moon" aria-hidden="true"/>
       <div className="ultimon-cinema-waves" aria-hidden="true"><span/><span/><span/></div>
       <div className="ultimon-cinema-jungle" aria-hidden="true">❧　❧　❧</div>
       <div className="ultimon-cinema-neon-grid" aria-hidden="true"/>
       <div className="ultimon-cinema-aurora" aria-hidden="true"/>
       <div className="ultimon-cinema-paper" aria-hidden="true">✦　◆　✧　◈</div>
       <div className="ultimon-cinema-nebula" aria-hidden="true"/>
       <div className="ultimon-cinema-clock" aria-hidden="true"><span>Ⅻ</span><span>Ⅲ</span><span>Ⅵ</span><span>Ⅸ</span></div>
       <div className="ultimon-cinema-candy" aria-hidden="true">🍬　✦　🍭　✦　🍬</div>
       <div className="ultimon-cinema-meteor" aria-hidden="true"/>
       <div className="ultimon-intro-entrance-vip">
        <div className="ultimon-intro-entrance-type">{entrance?.icon} {entrance?.name}</div>
        {room.playerAvatars?.[role]&&<img className="ultimon-intro-entrance-player-avatar"
          src={room.playerAvatars[role]} alt={'Avatar di '+(room.players?.[role]||role)}/>}
        <div className="ultimon-intro-entrance-fighters ultimon-intro-entrance-fighters--all"
          style={{'--team-count':fullTeam.length}}>
         {fullTeam.map((c,i)=><div key={i} className="ultimon-intro-entrance-fighter"
           style={{'--fighter-index':i}}>
           <img src={c.img} onError={onMultimonImageError} alt={c.name}/><span>{c.name}</span>
          </div>)}
        </div>
        <h3>{entrance?.tagline||'UN INGRESSO INDIMENTICABILE!'}</h3>
        <div className="ultimon-intro-entrance-show-team">{name}</div>
        <blockquote>🎙️ {entrance?.announcer||'Un applauso per questa squadra!'}</blockquote>
       </div>
      </div>}

     {step==='line'&&<div key={role+'line'+intro.lineIndex} className="ultimon-intro-character ultimon-intro-appear">
       <div className="ultimon-intro-character-count">MULTIMON {intro.lineIndex+1} / {cast.length}</div>
       {selected&&<div className="ultimon-intro-character-portrait">
        <div className="ultimon-intro-character-halo" aria-hidden="true"/>
        <img src={selected.img} onError={onMultimonImageError} alt={selected.name}/>
       </div>}
       <h3>{selected?.name||'Il prossimo Multimon'}</h3>
       {rival&&<section className="ultimon-intro-duplicate" aria-label="Incontro fra doppioni">
        <div className="ultimon-intro-duplicate-kicker">
         ✨ COLPO DI SCENA · DUE {selected?.name?.toLocaleUpperCase('it')} NELL'ARENA!
        </div>
        <p>Il Multimon riconosce il suo doppione, già entrato con un'altra squadra!</p>
        <div className="ultimon-intro-duplicate-faceoff">
         <div className="ultimon-intro-duplicate-fighter"
           style={{'--dup-color':rival.color}}>
          <span>GIÀ PRESENTATO</span>
          <img src={rival.img} onError={onMultimonImageError} alt={rival.name+' della squadra '+rival.team}/>
          <strong>{rival.name}</strong>
          <small>{rival.team} · {rival.owner}</small>
         </div>
         <span className="ultimon-intro-duplicate-vs" aria-hidden="true">⇄</span>
         <div className="ultimon-intro-duplicate-fighter ultimon-intro-duplicate-fighter--new"
           style={{'--dup-color':team.color||'#a78bfa'}}>
          <span>NUOVO ARRIVATO</span>
          <img src={selected.img} onError={onMultimonImageError} alt={selected.name+' della squadra '+name}/>
          <strong>{selected.name}</strong>
          <small>{name} · {room.players?.[role]||role}</small>
         </div>
        </div>
        {duelStat&&<div className="ultimon-intro-duplicate-comparison">
         <strong>📊 {duelStat.label}</strong>
         <span>{duelStat.other} <b>vs</b> {duelStat.mine}</span>
         <small>{duelStat.kind==='tie'?'Stesse statistiche!':
          duelStat.delta>0?'Il nuovo arrivato è in vantaggio di '+duelStat.delta+' punti':
          'Il primo arrivato è in vantaggio di '+Math.abs(duelStat.delta)+' punti'}</small>
        </div>}
       </section>}
       <blockquote className={'ultimon-intro-dialogue '+(rival?'ultimon-intro-dialogue--duplicate':'')}>
        <span>❝</span>{selected?.duplicate?.line||selected?.line||'Pronti alla battaglia!'}<span>❞</span>
       </blockquote>
       <div className="ultimon-intro-lineup">
        {cast.map((c,i)=><div key={i}
          className={'ultimon-intro-lineup-item '+(i===intro.lineIndex?'ultimon-intro-lineup-item--speaking':'')}
          title={c.name}>
          <img src={c.img} onError={onMultimonImageError} alt={c.name}/><small>{c.name}</small>
         </div>)}
       </div>
      </div>}

     {step==='exit'&&<div key={role+'exit'} className="ultimon-intro-exit ultimon-intro-appear">
       <h3>UN INGRESSO DA RICORDARE!</h3>
       <div className="ultimon-intro-exit-roster">
        {fullTeam.map((c,i)=><figure key={i}>
         <img src={c.img} onError={onMultimonImageError} alt={c.name}/><figcaption>{c.name}</figcaption>
        </figure>)}
       </div>
       <p><b>{name}</b> prende posto con tutti i suoi {fullTeam.length} Multimon. L'arena attende la prossima squadra!</p>
      </div>}

    <div className="ultimon-intro-footnote">
      {sceneReady&&<div className="ultimon-intro-auto-clock" role="status">
       <span>⏱️ Avanzamento automatico tra</span>
       <strong>{remainingSeconds??Math.ceil(ULTIMON_INTRO_AUTO_ADVANCE_MS/1000)} s</strong>
       <div className="ultimon-intro-auto-track" aria-hidden="true">
        <span style={{width:Math.max(0,Math.min(100,(remainingSeconds??20)*100/(ULTIMON_INTRO_AUTO_ADVANCE_MS/1000)))+'%'}}/>
       </div>
      </div>}
      {isHost&&<div className="ultimon-intro-host-controls" aria-label="Comandi delle presentazioni riservati all'host">
       <span className="ultimon-intro-host-label">👑 COMANDI HOST</span>
       <button type="button" className="ultimon-intro-skip" disabled={!canNext||hostActionPending}
        onClick={()=>hostAdvance('introNext')}>⏩ Velocizza · Prossima scena</button>
       <button type="button" className="ultimon-intro-skip ultimon-intro-skip-team"
        disabled={!spoken||!entranceReady||hostActionPending}
        title="Disponibile dopo il monologo e la scelta dell'ingresso"
        onClick={()=>hostAdvance('introSkipTeam')}>⏭ Salta il resto della squadra</button>
       </div>}
      {!isHost&&sceneReady&&<small>La presentazione avanza dopo 20 secondi; solo l'host può saltarla.</small>}
      {step==='speech'&&!spoken&&<small>⌛ Il timer resta fermo finché il capitano non ha pronunciato il suo monologo.</small>}
      {step==='entrance_select'&&!entranceReady&&
       <small>⌛ Nessun avanzamento finché il capitano non conferma il proprio ingresso.</small>}
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
