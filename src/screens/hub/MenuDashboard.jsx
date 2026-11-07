import React,{useState} from 'react';
import {roomModeLabel} from '../../systems/roomInvitations.js';
import './MenuDashboard.css';

// Interfaccia di prova: la vecchia è ancora raggiungibile da "Menu classico".
// Nessun tasto di gioco sparisce: le azioni originali sono solo riordinate.
export function MenuDashboard({ctx}){
 const {CHARACTERS,IS_PREVIEW,appMode,getDefaultAvatar,getPlayerData,handleAvatarUpload,
  handleCreateRoguelikeCoop,handleCreateRoom,handleJoinRoom,handleLocalStart,
  handleSurvivalStart,handleVsCpuStart,playerAvatarUrl,playerName,playerTitle,
  roguelikeState,roomIdInput,roomInvitations=[],setAppMode,setPlayerAvatarUrl,setPlayerName,
  setRoguelikeDraftChoices,setRoguelikeState,setRoomIdInput,
  setShowOnlinePlayers,setSystemAlert,startWithModeGuide,onMenuStyleChange
 }=ctx;
 const [tab,setTab]=useState('online');
 const [roomName,setRoomName]=useState('');
 const [publicRoom,setPublicRoom]=useState(true);
 const [showProfileEditor,setShowProfileEditor]=useState(false);
 const [showAllRooms,setShowAllRooms]=useState(false);
 const [hiddenRooms,setHiddenRooms]=useState([]);
 const data=getPlayerData();
 const matches=Math.max(0,Number(data.matches)||0);
 const wins=Math.max(0,Number(data.wins)||0);
 const losses=Math.max(0,matches-wins);
 const winRate=matches?Math.round(wins/matches*100):0;
 const gameHours=((Number(data.playtime)||0)/3600).toFixed(1);
 const readyRooms=roomInvitations.filter(r=>!hiddenRooms.includes(r.code));
 const invite=readyRooms[0];
 const inviteCount=readyRooms.length;
 const favorite=Object.entries(data.chars||{}).sort((a,b)=>b[1]-a[1])[0];
 const heroCast=[
  {id:'sonic',label:'Sonic',color:'blue'},
  {id:'kirby',label:'Kirby',color:'pink'},
  {id:'marceline',label:'Marceline',color:'violet'}
 ].map(entry=>({...entry,character:CHARACTERS.find(char=>char.id===entry.id)}))
   .filter(entry=>entry.character?.img);
 const cardMascots={
  'Campagne':'finn','Roguelike Solo':'jake','Roguelike Co-op':'sage',
  'Sopravvivenza':'godzilla','Sfida vs CPU':'goku',
  'Gioca in Locale':'bugsbunny','Sfida contro CPU':'robin',
  'Catalogo':'kirby','Prestigi e Padronanza':'garnet','Laboratorio':'bulma',
  'Negozio':'wario','Bauli Campagna':'lucy','Casse Potenza':'starbutterfly',
  'Tabella Tipi':'peridot','Statistiche complete':'sonic'
 };
 const cardImages=Object.fromEntries(CHARACTERS.filter(c=>
   Object.values(cardMascots).includes(c.id)).map(c=>[c.id,c.img]));
 const quickStats=[
  {emoji:'⚔️',n:matches,label:'Partite'},
  {emoji:'🏆',n:wins,label:'Vittorie'},
  {emoji:'🎯',n:winRate+'%',label:'Win rate'},
  {emoji:'🪙',n:Number(data.coins)||0,label:'Monete'}
 ];
 const launch=(guide,action)=>startWithModeGuide(guide,action);
 const guarded=(guide,mode,description)=>launch(guide,()=>{
  if(!playerName.trim())setSystemAlert('Inserisci il tuo nome per accedere a '+description+'!');
  else setAppMode(mode);
 });
 const openUpdates=()=>window.dispatchEvent(new Event('multimon:open-updates'));
 const join=code=>{
  if(!playerName.trim())return setSystemAlert('Inserisci il tuo nome prima di unirti a una stanza!');
  launch('join_room',()=>handleJoinRoom(code));
 };
 const startRogueSolo=()=>launch('rogue_solo',()=>{
  if(roguelikeState.isStarted && roguelikeState.roster.length>0){
   setAppMode('roguelike_map');return;
  }
  const available=CHARACTERS.filter(c=>!c.isSummonOnly&&!c.isSecretUnlock);
  const shuffled=[...available].sort(()=>Math.random()-.5);
  setRoguelikeDraftChoices(shuffled.slice(0,6));
  setRoguelikeState({isStarted:true,runId:'run-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2),
    floor:1,roster:[],rosterStats:{},maxFloor:50,coins:0,
    inventory:{pozione:1},isMerchantNext:false,recruitBonus:.02,relics:[],encounteredEnemies:[]});
  setAppMode('roguelike_draft');
 });
 const modes=[
  {key:'online',label:'Online',emoji:'🌐'},
  {key:'adventure',label:'Avventure',emoji:'🗺️'},
  {key:'local',label:'Locale',emoji:'🎮'},
  {key:'collection',label:'Collezione',emoji:'💎'},
  {key:'profile',label:'Profilo',emoji:'👑'}
 ];
 const card=(emoji,title,caption,action,variant='blue',hint='')=>(
  <button type="button" className={'mm-dash-mode mm-dash-mode--'+variant} onClick={action} key={title}>
   <span className="mm-dash-mode-emoji">{emoji}</span>
   <span className="mm-dash-mode-copy"><strong>{title}</strong><small>{caption}</small></span>
   {cardImages[cardMascots[title]]&&<img className="mm-dash-mode-art"
     loading="lazy" src={cardImages[cardMascots[title]]} alt="" aria-hidden="true"/>}
   <span className="mm-dash-mode-arrow">↗</span>
   {hint&&<span className="mm-dash-mode-hint">{hint}</span>}
  </button>
 );

 if(appMode!=='menu')return null;
 return <main className="mm-dash">
  <div className="mm-dash-sparkle" aria-hidden="true"/>
  <div className="mm-dash-shell">
   <header className="mm-dash-header">
    <div className="mm-dash-brand">
     <span className="mm-dash-brand-mark">✦</span>
     <div><span className="mm-dash-kicker">L’ARENA DEL MULTIVERSO</span><h1>MULTI<span>MON</span></h1></div>
    </div>
    <div className="mm-dash-header-actions">
     <button type="button" className="mm-dash-top-action" onClick={()=>launch('online_players',()=>{
       if(!playerName.trim())setSystemAlert('Inserisci il nome per vedere gli altri giocatori!');
       else setShowOnlinePlayers(true);
     })}>🌐 Giocatori online</button>
     <button type="button" className="mm-dash-top-action" onClick={openUpdates}>📜 Registro aggiornamenti</button>
     <button type="button" className="mm-dash-top-action mm-dash-classic" onClick={()=>onMenuStyleChange('classic')}>↶ Menu classico</button>
    </div>
   </header>

   <section className="mm-dash-hero">
    <div className="mm-dash-hero-copy">
     <div className="mm-dash-hero-eyebrow"><span className="mm-dash-live-dot"/> IL MULTIVERSO È IN FERMENTO!</div>
     <h2>IL TUO MONDO.<span>LE TUE BATTAGLIE!</span></h2>
     <p>Raduna i tuoi Multimon, sfida i tuoi amici e crea un'avventura che nessuno dimenticherà!</p>
     {IS_PREVIEW&&<p className="mm-dash-preview">🛠️ Anteprima attiva · Personaggi temporaneamente sbloccati</p>}
     <div className="mm-dash-hero-shortcuts">
      <button type="button" onClick={()=>setTab('online')}>⚔️ VAI A COMBATTERE!</button>
      <button type="button" onClick={()=>setTab('adventure')}>🗺️ Parti all'avventura</button>
     </div>
     <div className="mm-dash-hero-confetti" aria-hidden="true">✦　★　✧</div>
    </div>
    <div className="mm-dash-hero-stage" aria-label="I Multimon sono pronti per la battaglia">
     <div className="mm-dash-hero-star mm-dash-hero-star--one" aria-hidden="true">✦</div>
     <div className="mm-dash-hero-star mm-dash-hero-star--two" aria-hidden="true">★</div>
     <div className="mm-dash-hero-ring" aria-hidden="true"/>
     {heroCast.map((item,index)=><div key={item.id}
       className={'mm-dash-hero-fighter mm-dash-hero-fighter--'+item.color}
       style={{'--fighter-index':index}}>
       <div className="mm-dash-hero-fighter-light"/>
       <img src={item.character.img} alt={item.label}/>
       <span>{item.label}</span>
      </div>)}
     <div className="mm-dash-hero-slogan">✨ SCEGLI. SCHIERA. VINCI! ✨</div>
    </div>
    <div className="mm-dash-player">
     <div className="mm-dash-player-head">
      <img src={playerAvatarUrl||getDefaultAvatar(playerName||'Giocatore')}
       alt="Avatar giocatore" onError={e=>{e.target.onerror=null;e.target.src=getDefaultAvatar(playerName||'Giocatore')}}/>
      <div><small>IL TUO PROFILO</small><strong>{playerName.trim()||'Nuovo giocatore'}</strong>
       {playerTitle&&<span>✦ {playerTitle}</span>}</div>
      <button type="button" onClick={()=>setTab('profile')} title="Modifica profilo" aria-label="Apri il profilo">✎</button>
     </div>
     {!playerName.trim()&&<label className="mm-dash-first-name">
      <span>🎤 Come ti chiami, campione?</span>
      <input type="text" maxLength={32} value={playerName}
       onChange={e=>setPlayerName(e.target.value)} placeholder="Il tuo nome in arena…" autoComplete="nickname"/>
     </label>}
     <div className="mm-dash-quick-stats">
      {quickStats.map(stat=><div key={stat.label}><small>{stat.emoji} {stat.label}</small><strong>{stat.n}</strong></div>)}
     </div>
    </div>
   </section>

   {invite&&<section className="mm-dash-invite" aria-label="Partite pubbliche disponibili">
    <div className="mm-dash-invite-pulse">✧</div>
    <div className="mm-dash-invite-copy">
     <span className="mm-dash-invite-tag"><span/> QUALCUNO TI STA SFIDANDO!</span>
     <strong>🎮 {invite.host} ha aperto «{invite.name}»!</strong>
     <small>{roomModeLabel(invite.gameMode)} · {invite.joined}/{invite.capacity} giocatori · Codice {invite.code}</small>
    </div>
    <button type="button" className="mm-dash-invite-join" onClick={()=>join(invite.code)}>⚡ Entro!</button>
    {inviteCount>1&&<button type="button" className="mm-dash-invite-more" onClick={()=>{setTab('online');setShowAllRooms(v=>!v);}}>
      +{inviteCount-1} altre</button>}
    <button type="button" className="mm-dash-invite-close" aria-label="Nascondi questo invito" title="Nascondi"
      onClick={()=>setHiddenRooms(prev=>[...prev,invite.code])}>×</button>
   </section>}

   <nav className="mm-dash-tabs" aria-label="Sezioni del menu">
    {modes.map(m=><button type="button" key={m.key} onClick={()=>setTab(m.key)}
     className={tab===m.key?'mm-dash-tab mm-dash-tab--active':'mm-dash-tab'}
     aria-current={tab===m.key?'page':undefined}>
     <span>{m.emoji}</span>{m.label}</button>)}
   </nav>
   <section className={'mm-dash-content mm-dash-content--'+tab}>
    {tab==='online'&&<>
     <div className="mm-dash-section-title"><div><small>✦ MULTIPLAYER</small><h2>Incontra il multiverso</h2></div><p>L'arena è aperta: chi sfidi oggi?</p></div>
     <div className="mm-dash-two-col">
      <div className="mm-dash-panel">
       <div className="mm-dash-panel-heading"><span>🌐</span><div><h3>Ospita una partita</h3><p>Configura le modalità dopo aver creato la stanza.</p></div></div>
       <label htmlFor="mm-room-name">Nome della partita</label>
       <input id="mm-room-name" type="text" maxLength={40} value={roomName} onChange={e=>setRoomName(e.target.value)}
        placeholder={(playerName.trim()||'La tua')+' · Arena'} />
       <label className="mm-dash-checkbox"><input type="checkbox" checked={publicRoom} onChange={e=>setPublicRoom(e.target.checked)}/>
        <span>Mostra un invito discreto agli altri giocatori online</span></label>
       <button type="button" className="mm-dash-primary" onClick={()=>launch('create_room',()=>handleCreateRoom(roomName,publicRoom))}>
        ✦ Crea stanza online <span>→</span></button>
       <small className="mm-dash-helper">Il codice stanza funziona anche se l'invito pubblico è disattivato.</small>
      </div>
      <div className="mm-dash-panel">
       <div className="mm-dash-panel-heading"><span>⚔️</span><div><h3>Entra nell'arena</h3><p>Hai ricevuto un codice da un amico?</p></div></div>
       <label htmlFor="mm-room-code">Codice stanza</label>
       <div className="mm-dash-code-row"><input id="mm-room-code" type="text" maxLength={12}
        value={roomIdInput} onChange={e=>setRoomIdInput(e.target.value.toUpperCase())} placeholder="ES. A7R3B"/>
        <button type="button" onClick={()=>join(roomIdInput)}>Unisciti ↗</button></div>
       <div className="mm-dash-hint"><span>🛡️</span> Le stanze private rimangono accessibili con il loro codice.</div>
       <button type="button" className="mm-dash-text-button" onClick={()=>setShowAllRooms(s=>!s)}>
        {showAllRooms?'Nascondi bacheca':'Apri bacheca partite pubbliche'} {inviteCount?'· '+inviteCount:''} ⌄
       </button>
      </div>
     </div>
     {showAllRooms&&<section className="mm-dash-rooms">
      <h3>📡 Partite in attesa</h3>
      {!readyRooms.length?<p>Nessuna stanza pubblica disponibile adesso. Puoi sempre usare un codice!</p>:
       readyRooms.map(r=><div className="mm-dash-room" key={r.code}>
        <div><strong>{r.name}</strong><small>{r.host} · {roomModeLabel(r.gameMode)} · {r.joined}/{r.capacity} giocatori</small></div>
        <button type="button" onClick={()=>join(r.code)}>Entra · {r.code}</button>
       </div>)}
     </section>}
    </>}
    {tab==='adventure'&&<>
     <div className="mm-dash-section-title"><div><small>✦ SCELTE DI GIOCO</small><h2>Ogni sfida è una storia</h2></div><p>Ogni portale nasconde una nuova sfida!</p></div>
     <div className={'mm-dash-card-grid mm-dash-card-grid--'+tab}>
      {card('📖','Campagne','Esplora le storie del multiverso.',()=>launch('campaign',()=>setAppMode('campaign_select')),'green')}
      {card('🎲','Roguelike Solo','50 piani, reclute e sfide imprevedibili.',startRogueSolo,'purple',
       roguelikeState.isStarted&&roguelikeState.roster.length?'Piano '+roguelikeState.floor:'')}
      {card('🤝','Roguelike Co-op','Unisciti ai tuoi amici nella spedizione.',()=>launch('rogue_coop',handleCreateRoguelikeCoop),'pink')}
      {card('♾️','Sopravvivenza','Resisti il più a lungo possibile.',()=>launch('survival',handleSurvivalStart),'violet',
       data.maxSurvivalRound?'Record '+data.maxSurvivalRound:'')}
      {card('🤖','Sfida vs CPU','Affronta un avversario strategico.',()=>launch('vs_cpu',handleVsCpuStart),'red')}
     </div>
    </>}
    {tab==='local'&&<>
     <div className="mm-dash-section-title"><div><small>✦ STESSO DISPOSITIVO</small><h2>Il divano diventa un'arena</h2></div><p>Gioca con gli amici sullo stesso PC o tablet.</p></div>
     <div className={'mm-dash-card-grid mm-dash-card-grid--'+tab}>
      {card('🎮','Gioca in Locale','Crea una stanza locale e personalizza le regole.',()=>launch('local',handleLocalStart),'blue')}
      {card('⚔️','Sfida contro CPU','Allenati prima di sfidare i tuoi amici.',()=>launch('vs_cpu',handleVsCpuStart),'red')}
     </div>
    </>}
    {tab==='collection'&&<>
     <div className="mm-dash-section-title"><div><small>✦ PROGRESSIONE</small><h2>Costruisci la tua leggenda</h2></div><p>Più forti, più rari, più tuoi!</p></div>
     <div className={'mm-dash-card-grid mm-dash-card-grid--'+tab}>
      {card('📚','Catalogo','Esplora i Multimon e le loro mosse.',()=>launch('catalog',()=>setAppMode('catalog')),'blue')}
      {card('💎','Prestigi e Padronanza','Livelli, titoli, ricompense estetiche.',()=>guarded('stats','mastery','ai prestigi'),'purple')}
      {card('⚡','Laboratorio','Allena Attacco, Difesa e Velocità.',()=>guarded('strength_lab','strength_lab','al laboratorio'),'cyan',(data.strengthPoints||0)+' Punti Forza')}
      {card('🛒','Negozio','Scopri campioni, strumenti e oggetti.',()=>guarded('shop','shop','al negozio'),'amber')}
      {card('🎁','Bauli Campagna','Apri i premi delle tue missioni.',()=>guarded('chests','chests','ai bauli'),'amber',(data.chests?.pending?.length||0)+' da aprire')}
      {card('🔮','Casse Potenza','Ricompense per le tue spedizioni.',()=>guarded('power_chests','power_chests','alle casse'),'cyan',(data.roguelikePower?.pending?.length||0)+' disponibili')}
      {card('🧬','Tabella Tipi','Consulta vantaggi e resistenze.',()=>launch('type_chart',()=>setAppMode('type_chart')),'green')}
     </div>
    </>}
    {tab==='profile'&&<>
     <div className="mm-dash-section-title"><div><small>✦ IDENTITÀ DEL CAMPIONE</small><h2>La tua leggenda</h2></div><p>Quante imprese hai già conquistato?</p></div>
     <div className="mm-dash-profile-grid">
      <div className="mm-dash-panel mm-dash-profile-card">
       <img src={playerAvatarUrl||getDefaultAvatar(playerName||'Giocatore')} alt="Avatar"
        onError={e=>{e.target.onerror=null;e.target.src=getDefaultAvatar(playerName||'Giocatore')}}/>
       <h3>{playerName.trim()||'Nuovo giocatore'}</h3>
       {playerTitle&&<p>✦ {playerTitle} ✦</p>}
       <button type="button" className="mm-dash-ghost" onClick={()=>setShowProfileEditor(v=>!v)}>
        {showProfileEditor?'Chiudi modifica':'✎ Modifica nome e avatar'}</button>
       {showProfileEditor&&<div className="mm-dash-profile-editor">
        <label htmlFor="mm-username">Nome giocatore</label>
        <input id="mm-username" value={playerName} onChange={e=>setPlayerName(e.target.value)} maxLength={32}/>
        <label htmlFor="mm-avatar-url">URL immagine avatar</label>
        <input id="mm-avatar-url" value={playerAvatarUrl} onChange={e=>setPlayerAvatarUrl(e.target.value)}/>
        <label className="mm-dash-upload">⬆ Carica un avatar dal dispositivo
         <input type="file" accept="image/*" onChange={handleAvatarUpload}/></label>
       </div>}
      </div>
      <div className="mm-dash-profile-insights">
       <div><small>📈 PARTITE PERSE</small><strong>{losses}</strong><span>Su {matches} incontri registrati</span></div>
       <div><small>⌛ ORE DI BATTAGLIA</small><strong>{gameHours}</strong><span>Tempo passato nell'arena</span></div>
       <div><small>🌟 CAMPIONE PIÙ GIOCATO</small><strong>{favorite?.[0]||'Nessuno'}</strong><span>{favorite?favorite[1]+' schieramenti':'Ancora da scoprire'}</span></div>
       <div><small>🔥 RECORD SOPRAVVIVENZA</small><strong>{data.maxSurvivalRound||0}</strong><span>Piano massimo raggiunto</span></div>
      </div>
     </div>
     <div className="mm-dash-card-grid mm-dash-profile-actions">
      {card('📊','Statistiche complete','Carriera, preferenze, vittorie e record.',()=>guarded('stats','stats','alle statistiche'),'blue')}
      {card('🏅','Prestigi e Padronanza','Gestisci progressi, cornici e titoli.',()=>guarded('stats','mastery','ai prestigi'),'purple')}
     </div>
    </>}
   </section>
   <footer className="mm-dash-footer">
    <span>✦ Multimon · Il tuo multiverso, le tue regole</span>
    <button type="button" onClick={openUpdates}>📜 Registro aggiornamenti</button>
   </footer>
  </div>
 </main>;
}
