import React,{useEffect,useState,useRef} from 'react';
import {onMultimonImageError} from '../../systems/imageFallback.js';
import {ASCENSION_FINAL_TEAM,ASCENSION_ROUNDS,ASCENSION_MAX_TEAM,ASCENSION_SHOP,
 ascensionCaptureChance,ascensionCurrentMatch,ascensionFind,ascensionRoundReady,ascensionScaledMaxHp} from '../../systems/colosseumAscension.js';
import {AscensionJourney} from './AscensionJourney.jsx';
import './AscensionView.css';
const character=(all,id)=>ascensionFind(all,id)||{name:id,img:'',moves:[],types:[]};
const percentage=(hp,max)=>Math.max(0,Math.min(100,100*hp/Math.max(1,max)));
function Portrait({char,label='',selected=false,onClick}){
 const children=<><div className="ac-portrait-frame">{char.img?<img src={char.img} onError={onMultimonImageError} alt={char.name}/>:<span>✦</span>}</div>
   <strong>{char.name}</strong><small>{label}</small></>;
 return onClick?<button type="button" className={'ac-portrait '+(selected?'selected':'')} onClick={onClick}>{children}</button>:
   <div className="ac-portrait">{children}</div>;
}
export function PrismaballCapture({capture,foe,onFinish}){
 const [step,setStep]=useState(0);
 useEffect(()=>{
  setStep(0);
  const timers=[450,1150,1850,2550,3300].map((ms,i)=>setTimeout(()=>setStep(i+1),ms));
  return ()=>timers.forEach(clearTimeout);
 },[capture?.nonce]);
 const broken=!capture.success&&step>=capture.failedAt+1;
 const captured=capture.success&&step>=4;
 return <div className="ac-prism-modal" role="dialog" aria-modal="true" aria-label="Lancio Prismaball">
   <div className="ac-prism-stage">
    <span className="ac-prism-stars">✧ ✦ ✧</span>
    {foe.img&&<img className={'ac-prism-target '+(step>=1?'vanish':'')} src={foe.img} alt={foe.name} onError={onMultimonImageError}/>}
    <div className={'ac-prism-device '+(step===0?'throw':'')+(step>1&&!broken?'tick':'')+(broken?'broken':'')+(captured?'captured':'')}>
      <span className="ac-prism-heart">✦</span><i/><i/><i/><i/><i/><i/>
    </div>
    <div className="ac-prism-ticks">{[1,2,3].map(n=><span key={n} className={step>n&&(!broken||n<capture.failedAt)?'lit':''}>◆</span>)}</div>
   </div>
   <small className="ac-prism-kicker">PRISMABALL · SINCRONIZZAZIONE DIMENSIONALE</small>
   <h2>{broken?'La sincronizzazione si interrompe!':captured?'CATTURA COMPLETATA!':step===0?'La Prismaball apre un varco...':'Tic '+Math.min(3,Math.max(1,step-1))+' / 3'}</h2>
   <p>{capture.success?'Una nuova energia si unisce alla squadra!':'Probabilità della cattura: '+Math.round(capture.chance*100)+'%'}</p>
   <button type="button" className="ac-main" onClick={onFinish} disabled={step<4}>Continua →</button>
  </div>;
}
function Arena({asc,room,role,chars,onAction,onHost,canHost,local,onNextPlayer}){
 const match=ascensionCurrentMatch(asc);
 const [chosen,setChosen]=useState([]);
 useEffect(()=>setChosen([]),[asc.matchIndex,match?.gameNumber,role]);
 if(asc.stage==='finished')return <div className="ac-arena-win"><span>👑</span>
  <h2>IL CAMPIONE DEL COLOSSEO</h2>
  <h1>{room.players[asc.champion]}</h1>
  <p>Otto partecipanti. Diciotto round. Un solo vincitore.</p>
  <div className="ac-sovereign-prize">
   <img src={character(chars,'sovranoaurelion').img} alt="Sovrano Aurelion" onError={onMultimonImageError}/>
   <div><small>✦ RICOMPENSA ESCLUSIVA</small><h3>SOVRANO AURELION</h3>
    <p>Buio / Folletto · Il custode del Colosseo entra nella collezione del campione!</p>
    <strong>{asc.champion===role?'🏆 Multimon sbloccato nel tuo profilo!':'Solo il vincitore riceve Aurelion.'}</strong>
   </div>
  </div>
 </div>;
 if(!match)return <div className="ac-panel">Il Colosseo sta formando gli incontri.</div>;
 const fighting=match.roles.includes(role),p=asc.participants[role],limit=match.stage==='finale'?ASCENSION_FINAL_TEAM:3;
 const wanted=Math.min(limit,p.roster.length),chosenByRoom=match.selection[role]||[];
 const game=match.game,other=match.roles.find(r=>r!==role);
 const mine=game?.units?.[role]||[],opponents=game?.units?.[other]||[];
 const first=mine.find(m=>m.hp>0),myChar=first?character(chars,first.id):null;
 const moves=(myChar?.moves||[]).filter(Boolean);
 return <div className="ac-panel ac-arena">
  <div className="ac-section-title"><small>🏛️ {match.stage.toUpperCase()} · PARTITA {match.gameNumber}</small>
   <h2>{room.players[match.roles[0]]} <span>VS</span> {room.players[match.roles[1]]}</h2>
   <p>{match.stage==='finale'?'Finale 2v2 · massimo 7 Multimon, o tutti quelli posseduti':
      'Battaglie 1v1 con 3 Multimon · Best of 3'}</p>
   <div className="ac-scores">{match.roles.map(r=><span key={r}>{room.players[r]}: <strong>{match.wins[r]||0}</strong></span>)}</div>
  </div>
  {match.winner?<div className="ac-centered"><h3>🏅 {room.players[match.winner]} ha vinto!</h3>
   {canHost&&<button type="button" className="ac-main" onClick={()=>onHost('next-match')}>Prossimo incontro →</button>}</div>:
  !fighting?<div className="ac-centered"><h3>👁️ Spettatore</h3><p>Segui gli scontri, in attesa della prossima sfida.</p>
   <div className="ac-battle-log">{game?.log?.slice(-8).map((x,i)=><p key={i}>{x}</p>)}</div></div>:
  !game?<div className="ac-pick">
   <h3>Scegli {wanted} Multimon per questa sfida</h3>
   <div className="ac-card-grid">{p.roster.map(m=><Portrait key={m.id} char={character(chars,m.id)} label={'Liv. '+m.level}
     selected={chosen.includes(m.id)||chosenByRoom.includes(m.id)}
     onClick={()=>setChosen(prev=>prev.includes(m.id)?prev.filter(x=>x!==m.id):
        prev.length<wanted?[...prev,m.id]:prev)}/>)}</div>
   {chosenByRoom.length?<p className="ac-notice">✅ Formazione confermata, in attesa dell'avversario.</p>:
    <button type="button" className="ac-main" disabled={chosen.length!==wanted}
      onClick={()=>onAction('lineup',chosen)}>Conferma formazione ({chosen.length}/{wanted})</button>}
   {local&&onNextPlayer&&<button type="button" className="ac-ghost" onClick={onNextPlayer}>Passa il turno a un altro giocatore</button>}
  </div>:
  <div className="ac-arena-fight">
   <div className="ac-duel-grid">{[{title:'La tua squadra',members:mine},{title:'Avversario',members:opponents}].map(team=>
    <div key={team.title}><h4>{team.title}</h4><div className="ac-duel-party">{team.members.map((m,i)=><div className={m.hp<=0?'ac-ko':''} key={i}>
     <Portrait char={character(chars,m.id)} label={'Lv. '+m.level}/>
     <div className="ac-health"><i style={{width:percentage(m.hp,ascensionScaledMaxHp(character(chars,m.id),m.level))+'%'}}/></div>
    </div>)}</div></div>)}</div>
   <div className="ac-battle-log">{game.log?.slice(-7).map((x,i)=><p key={i}>{x}</p>)}</div>
   {game.actions?.[role]?<p className="ac-notice">⌛ Comando inviato, in attesa dell'avversario...</p>:
   <div className="ac-move-grid">{moves.map((m,i)=><button key={i} type="button" onClick={()=>onAction('duel-move',i)}>
      <strong>{m.name}</strong><small>{m.type} · {m.power>0?'Potenza '+m.power:'Supporto'}</small>
   </button>)}</div>}
  </div>}
  <div className="ac-bracket">{asc.bracket.map(m=><div key={m.id} className={m.id===match.id?'active':''}>
    <small>{m.stage.toUpperCase()}</small><strong>{m.roles.map(r=>room.players[r]).join(' vs ')}</strong>
    <span>{m.winner?'✓ '+room.players[m.winner]:'In attesa'}</span></div>)}</div>
 </div>;
}
export function AscensionView({room,role,characters,onAction,onHost,onExit,canHost=false,local=false,onNextPlayer}){
 const asc=room.ascension,p=asc?.participants?.[role];
 const [capture,setCapture]=useState(null),[detail,setDetail]=useState(null);
 const lastCapture=useRef(null);
 useEffect(()=>{
  const data=p?.lastCapture,key=data?role+':'+data.nonce:'';
  if(data&&lastCapture.current!==key){lastCapture.current=key;setCapture(data)}
 },[p?.lastCapture?.nonce,role]);
 if(!asc||!p)return <main className="ac-app">Caricamento dell'avventura...</main>;
 const get=id=>character(characters,id);
 const stage=asc.stage,showArena=stage==='colosseum'||stage==='finished';
 const roundReady=ascensionRoundReady(asc);
 const captureChance=e=>ascensionCaptureChance(e.foeHp,e.foeMaxHp,{status:e.status,
  rare:get(e.foeId).price>=250,veryRare:get(e.foeId).price>=350});
 return <main className="ac-app"><div className="ac-bg" aria-hidden="true"/><div className="ac-shell">
  <header className="ac-header">
   <button type="button" className="ac-ghost" onClick={onExit}>← Esci</button>
   <div><small>IL TORNEO DEL MULTIVERSO</small><h1>🏟️ ASCESA DEL <em>COLOSSEO</em></h1></div>
   <div className="ac-wallet"><span>💎 {p.prismaballs} Prismaball</span><span>🪙 {p.coins}</span></div>
  </header>
  <div className="ac-round-header">
   <div><h2>{stage==='starters'?'Scegli il tuo starter':showArena?'IL GRANDE COLOSSEO':'Round '+asc.round+'/'+ASCENSION_ROUNDS}</h2>
    <small>{stage==='starters'?'Cinque opzioni personali':showArena?'Torneo a eliminazione diretta':
      asc.round<=6?'ATTO I · PRIMI PASSI':asc.round<=12?'ATTO II · CRESCITA':'ATTO III · PREPARAZIONE FINALE'}</small></div>
   <div className="ac-round-track"><i style={{width:(stage==='starters'?0:showArena?100:100*asc.round/ASCENSION_ROUNDS)+'%'}}/></div>
  </div>
  <section className="ac-players"><h3>Gli otto contendenti</h3><div className="ac-player-grid">{asc.roles.map(r=>
   <div className={'ac-player '+(role===r?'me':'')} key={r}><span>{room.isBot?.[r]?'🤖':'🎮'}</span>
    <strong>{room.players[r]}</strong><small>{asc.participants[r]?.roster.length||0} Multimon {asc.participants[r]?.done?'✓':''}</small>
   </div>)}</div></section>
  {stage==='starters'?<section className="ac-panel">
   <div className="ac-section-title"><small>✦ LE CINQUE ALTERNATIVE DEL DESTINO</small>
    <h2>Seleziona un Multimon iniziale</h2><p>Personaggi base ed economici, cinque scelte private per ciascun giocatore.</p></div>
   <div className="ac-card-grid ac-starters">{p.options.map(id=><div key={id} className="ac-starter">
    <button type="button" className="ac-main ac-starter-select" disabled={p.roster.length>0} onClick={()=>onAction('starter',id)}>
      {p.roster.length?(p.roster[0].id===id?'✓ Il tuo starter':'Scelta completata'):'✦ Seleziona questo starter'}
    </button>
    <Portrait char={get(id)} label={(get(id).types||[]).join(' / ')}/>
   </div>)}</div>
   {p.roster.length>0&&<p className="ac-notice">Hai scelto {get(p.roster[0].id).name}. Gli altri giocatori stanno scegliendo.</p>}
   {local&&onNextPlayer&&<button type="button" className="ac-ghost" onClick={onNextPlayer}>Passa al prossimo giocatore locale</button>}
  </section>:showArena?<Arena key={asc.matchIndex} asc={asc} room={room} role={role} chars={characters}
    onAction={onAction} onHost={onHost} canHost={canHost} local={local} onNextPlayer={onNextPlayer}/>:
  <div className="ac-columns ac-journey-columns">
   <section className="ac-panel ac-journey-panel">
    <div className="ac-section-title ac-journey-title"><small>✦ LA TUA AVVENTURA</small><h2>{p.encounter?'⚔️ Incontro in corso':'Quale strada prenderai?'}</h2><p>{p.notice}</p></div>
    {!p.encounter&&<AscensionJourney round={asc.round} roster={p.roster} characters={characters} onAction={onAction} finished={p.done}/>}
    {p.encounter?(()=>{
      const e=p.encounter,foe=get(e.foeId),member=p.roster[e.active],hero=get(member.id);
      const moves=(hero.moves||[]).filter(Boolean);
      return <div className="ac-encounter">
       <div className="ac-encounter-head"><span>{e.kind==='trainer'?'🏅 ALLENATORE '+e.trainerName:'🌿 MULTIMON SELVATICO'}</span><span>Turno {e.turn}</span></div>
       <div className="ac-faceoff"><div><Portrait char={foe} label={'Liv. '+e.foeLevel}/>
         <div className="ac-health"><i style={{width:percentage(e.foeHp,e.foeMaxHp)+'%'}}/></div><small>{e.foeHp}/{e.foeMaxHp} PS</small></div>
        <b>VS</b><div><Portrait char={hero} label={'Liv. '+member.level}/>
         <div className="ac-health"><i style={{width:percentage(member.hp,ascensionScaledMaxHp(hero,member.level))+'%'}}/></div>
         <small>{member.hp}/{ascensionScaledMaxHp(hero,member.level)} PS</small></div></div>
       {e.kind==='wild'&&<p className="ac-capture-chance">💎 Cattura attuale: <strong>{Math.round(captureChance(e)*100)}%</strong></p>}
       <div className="ac-battle-log">{e.log.slice(-5).map((line,i)=><p key={i}>{line}</p>)}</div>
       <div className="ac-move-grid">{moves.map((m,i)=><button type="button" key={i}
         onClick={()=>onAction('encounter',{type:'attack',index:i})}>
         <strong>{m.name}</strong><small>{m.type} · {m.power>0?'Potenza '+m.power:'Supporto'}</small></button>)}</div>
       {e.kind==='wild'&&<div className="ac-commands">
        <button type="button" className="ac-main" disabled={p.prismaballs<=0||p.roster.length>=ASCENSION_MAX_TEAM}
         onClick={()=>onAction('encounter',{type:'ball'})}>💎 Lancia Prismaball ({p.prismaballs})</button>
        <button type="button" className="ac-ghost" onClick={()=>onAction('encounter',{type:'flee'})}>Ritirati</button>
       </div>}
       <div className="ac-switch"><h4>Sostituisci il Multimon</h4><div>{p.roster.map((m,i)=>
        <button type="button" key={i} disabled={m.hp<=0||i===e.active} onClick={()=>onAction('encounter',{type:'switch',index:i})}>
         {get(m.id).name} Lv.{m.level}</button>)}</div></div>
      </div>;
    })():p.done?<div className="ac-done"><h3>✅ Round completato!</h3><p>Puoi controllare la squadra mentre gli altri finiscono le loro attività.</p>
     {canHost&&roundReady&&<button type="button" className="ac-main" onClick={()=>onHost('next-round')}>
      {asc.round===18?'🏛️ Apri il Colosseo':'Avanza al round successivo →'}</button>}
     {local&&onNextPlayer&&<button type="button" className="ac-ghost" onClick={onNextPlayer}>Passa a un altro giocatore</button>}
    </div>:null}
   </section>
   <aside className="ac-panel ac-roster"><h3>La tua squadra <span>{p.roster.length}/9</span></h3>
    <div className="ac-roster-list">{p.roster.map((m,i)=><div className="ac-member" key={i}>
     <button type="button" className="ac-member-top" onClick={()=>setDetail(get(m.id))}>
      <img src={get(m.id).img} alt="" onError={onMultimonImageError}/>
      <span><strong>{get(m.id).name}</strong><small>Liv. {m.level} · {m.hp}/{ascensionScaledMaxHp(get(m.id),m.level)} PS</small></span>
     </button>
     <div className="ac-health"><i style={{width:percentage(m.hp,ascensionScaledMaxHp(get(m.id),m.level))+'%'}}/></div>
     <div className="ac-member-stats"><span>EXP {m.xp}</span><span>Allenamento {(m.trainingHalves||0)/2} pt.</span></div>
     {m.trainingHalves>=2&&m.level<10&&<button type="button" className="ac-train"
       onClick={()=>onAction('train',m.id)}>✦ Allena +1 livello (−1 punto)</button>}
    </div>)}</div>
    <section className="ac-shop">
     <h4>🛍️ Mercato del Colosseo</h4>
     <p>Massimo 2 acquisti per round · Spendi le monete guadagnate combattendo.</p>
     <div className="ac-shop-balls"><button type="button" disabled={p.coins<35||(p.shopBuys||0)>=2||!!p.encounter||p.prismaballs>=30}
       onClick={()=>onAction('buy',{itemId:'ball',memberId:null})}>
       💎 Prismaball extra · 35 monete</button></div>
     {p.roster.map(m=><div className="ac-shop-row" key={m.id}>
      <strong>{get(m.id).name} · {m.hp} PS</strong>
      <div>{ASCENSION_SHOP.filter(item=>!item.ball).map(item=><button type="button" key={item.id}
       disabled={p.coins<item.price||(p.shopBuys||0)>=2||!!p.encounter||
        (item.revive?m.hp>0:m.hp<=0||m.hp>=ascensionScaledMaxHp(get(m.id),m.level))}
       onClick={()=>onAction('buy',{itemId:item.id,memberId:m.id})}>
       {item.name} · {item.price} 🪙
      </button>)}</div>
     </div>)}
    </section>
    <footer>🏅 Allenatori vinti: {p.trainerWins} · 💎 Catture: {p.captures}</footer>
    <p className="ac-micro">Vincendo contro un allenatore tutti i tuoi Multimon, anche in riserva, ricevono 0,5 punti. Due mezzi punti = un livello.</p>
   </aside>
  </div>}
  </div>
  {capture&&<PrismaballCapture capture={capture} foe={get(capture.foeId)} onFinish={()=>setCapture(null)}/>}
  {detail&&<div className="ac-detail-overlay" onClick={()=>setDetail(null)}><div className="ac-detail" onClick={e=>e.stopPropagation()}>
   <button type="button" className="ac-ghost" onClick={()=>setDetail(null)}>✕ Chiudi</button><Portrait char={detail}/>
   <h3>✦ {detail.passive?.name||'Abilità'}</h3><p>{detail.passive?.desc||'Scopri le sue mosse in battaglia.'}</p>
   <div>{(detail.moves||[]).filter(Boolean).map((m,i)=><p key={i}><strong>{m.name}</strong><br/>{m.desc}</p>)}</div>
  </div></div>}
 </main>;
}
