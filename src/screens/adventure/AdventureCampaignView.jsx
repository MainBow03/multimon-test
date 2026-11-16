import React,{useEffect,useRef,useState} from 'react';
import {createAdventureWorldRenderer} from './AdventureWorldRenderer.js';
import {ADVENTURE_ZONES,ADVENTURE_ENTITIES,ADVENTURE_STARTERS,ADVENTURE_CHAMPION,
 adventureRoadZ,adventureMove,adventureNearby,adventureZoneIndex,adventureZone,
 adventureGymCheck,createAdventureSave,adventureQuest,adventureMaxHp,adventureUsePotion,
 adventureShop,adventureHeal,adventureChest,adventureSwap,adventureExpRequired,
 ADVENTURE_MAX_PARTY} from '../../systems/adventureCampaign.js';
import {onMultimonImageError} from '../../systems/imageFallback.js';
import './AdventureCampaign.css';

const symbol={gym:'🏛️',trainer:'⚔️',wild:'✦',npc:'💬',inn:'✚',shop:'🛒',chest:'🎁',champion:'🏆'};
const getChar=(chars,id)=>chars.find(c=>c.id===id);
const hp=(m,chars)=>{
 const base=getChar(chars,m.id),max=base?adventureMaxHp(base,m.level):100;
 return {max,hp:m.hp===null?max:Math.max(0,Math.min(m.hp,max))};
};
const img=(src,alt,css='')=>src?<img src={src} alt={alt} className={css} onError={onMultimonImageError}/>:null;

function AdventureWorld3D({save,onWalk,onNear,onInteract,paused=false}){
 const canvas=useRef(null),player=useRef({...save.position}),saveRef=useRef(save);
 const buttons=useRef(new Set()),callbacks=useRef({onWalk,onNear,onInteract,paused});
 const travelRef=useRef(save.travelSerial||0);
 useEffect(()=>{
  saveRef.current=save;callbacks.current={onWalk,onNear,onInteract,paused};
  if((save.travelSerial||0)!==travelRef.current){
   player.current={...save.position};travelRef.current=save.travelSerial||0;
  }
 },[save,onWalk,onNear,onInteract,paused]);
 useEffect(()=>{
  const el=canvas.current;if(!el)return;
  const graphics=createAdventureWorldRenderer(el,saveRef.current);
  const keys=buttons.current;
  const before=performance.now();let previous=before,frame=0,lastSaved=before,prevNearest=null,alive=true;
  const focus=()=>!(document.activeElement instanceof HTMLInputElement)&&
     !(document.activeElement instanceof HTMLTextAreaElement);
  const interact=()=>{
    const found=adventureNearby(player.current,saveRef.current,4.5);
    if(!found||callbacks.current.paused)return;
    callbacks.current.onWalk({...player.current});
    callbacks.current.onInteract(found,{...player.current});
  };
  const keydown=e=>{
   const name=e.key.toLowerCase();
   if(!focus())return;
   if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d','shift','e',' ','enter'].includes(name)){
     if(!callbacks.current.paused&&['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d','e',' '].includes(name))e.preventDefault();
     if(name==='e'&&!e.repeat){interact();return;}
     if(!callbacks.current.paused)keys.add(name);
   }
  };
  const keyup=e=>{keys.delete(e.key.toLowerCase());};
  const blur=()=>{keys.clear();callbacks.current.onWalk({...player.current})};
  window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',blur);
  const tick=now=>{
   if(!alive)return;
   const dt=Math.min(.05,(now-previous)/1000);previous=now;
   if(!callbacks.current.paused){
    const forward=Number(keys.has('w')||keys.has('arrowup'))-Number(keys.has('s')||keys.has('arrowdown'));
    const lateral=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));
    if(forward||lateral){
     const length=Math.hypot(forward,lateral)||1;
     const speed=keys.has('shift')?14.5:9.3;
     const current=player.current;
     const next=adventureMove(saveRef.current,current.x+forward/length*speed*dt,
       current.z+lateral/length*speed*dt);
     // Position is managed in the renderer for smooth 60 FPS camera motion.
     player.current=next.position;
     saveRef.current={...saveRef.current,position:next.position};
     if(now-lastSaved>950){callbacks.current.onWalk({...next.position});lastSaved=now;}
    }
   }
   const nearest=adventureNearby(player.current,saveRef.current,4.5);
   const id=nearest?.id||null;
   if(id!==prevNearest){prevNearest=id;callbacks.current.onNear(nearest);}
   graphics.render(player.current,(now-before)/1000,saveRef.current.starterId);
   frame=requestAnimationFrame(tick);
  };
  frame=requestAnimationFrame(tick);
  return ()=>{
   alive=false;cancelAnimationFrame(frame);graphics.dispose();
   window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);
   window.removeEventListener('blur',blur);
   callbacks.current.onWalk({...player.current});
   keys.clear();
  };
 },[]);
 const key=(name,down)=>{if(down)buttons.current.add(name);else buttons.current.delete(name)};
 return <div className="adv-world">
  <canvas ref={canvas} className="adv-viewport" aria-label="Mondo tridimensionale di Multimon, con percorsi, centri di cura e palestre"/>
  <div className="adv-vignette" aria-hidden="true"/>
  <div className="adv-sun" aria-hidden="true"/>
  <div className="adv-mobile-controls" aria-label="Comandi di movimento">
   <div className="adv-dpad">
    {[['w','↑','north'],['a','←','west'],['s','↓','south'],['d','→','east']].map(([k,label,dir])=>
     <button type="button" aria-label={dir} className={'adv-pad adv-pad-'+dir} key={k}
       onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);key(k,true);}}
       onPointerUp={()=>key(k,false)} onPointerCancel={()=>key(k,false)}
       onLostPointerCapture={()=>key(k,false)}>{label}</button>)}
   </div>
   <button className="adv-action-touch" type="button" aria-label="Interagisci con personaggi e luoghi"
    onClick={interactMobile}>PARLA<br/>⚡</button>
  </div>
 </div>;
 function interactMobile(){
   if(callbacks.current.paused)return;
   const nearby=adventureNearby(player.current,saveRef.current,4.5);
   if(nearby){callbacks.current.onWalk({...player.current});callbacks.current.onInteract(nearby,{...player.current});}
 }
}

function AdventureStarter({characters,onStart,onBack}){
 const [choice,setChoice]=useState(null);
 const starter=ADVENTURE_STARTERS.find(x=>x.id===choice);
 return <main className="adv-root adv-starter-root">
  <div className="adv-starter-stars" aria-hidden="true"/>
  <div className="adv-starter-shell">
   <button className="adv-ghost" onClick={onBack}>← Menu Multimon</button>
   <div className="adv-starter-title">
    <span className="adv-eyebrow">MULTIMON · UNA NUOVA AVVENTURA</span>
    <h1>Il mondo ti aspetta<span className="adv-glint">✦</span></h1>
    <p>Sei portali. Sei capipalestra. Una sola Lega. Prima di partire, scegli chi combatterà al tuo fianco.</p>
   </div>
   <div className="adv-starter-cards">
    {ADVENTURE_STARTERS.map(c=>{
     const char=getChar(characters,c.id),selected=choice===c.id;
     return <button type="button" key={c.id} className={'adv-starter-card adv-starter-'+c.tone+(selected?' adv-starter-selected':'')}
       onClick={()=>setChoice(c.id)} aria-pressed={selected}>
       <div className="adv-starter-orbit"><span>✦</span>{img(char?.img,char?.name)}</div>
       <span className="adv-starter-class">{c.icon} {c.role}</span>
       <strong>{char?.name||c.id}</strong>
       <small>{c.tagline}</small>
       <span className="adv-starter-types">{char?.types?.join('  ·  ')||''}</span>
       <span className="adv-starter-radio">{selected?'✓ SCELTO':'SCEGLI'}</span>
      </button>;
    })}
   </div>
   <button className="adv-start-button" disabled={!starter} onClick={()=>onStart(starter.id)}>
    {starter?'PARTI CON '+(getChar(characters,starter.id)?.name?.toUpperCase()||starter.id):'SCEGLI IL TUO STARTER'} <span>→</span>
   </button>
   <div className="adv-starter-bottom"><span>🧭 Esplorazione 3D</span><span>⚔️ Battaglie Multimon</span><span>💾 Progressi salvati automaticamente</span></div>
  </div>
 </main>;
}

function AdventureMember({member,characters,onPotion,onRevive,onMove,source='party',index=0}){
 const char=getChar(characters,member.id);
 const {hp:current,max}=hp(member,characters),expRequired=adventureExpRequired(member.level);
 return <div className="adv-team-member">
  <div className="adv-member-portrait">{img(char?.img,char?.name||member.id)}</div>
  <div className="adv-member-main">
   <div className="adv-member-title"><strong>{char?.name||member.id}</strong><b>LV. {member.level}</b></div>
   <small>{char?.types?.join(' / ')}</small>
   <div className="adv-bar"><span style={{width:100*current/max+'%',background:current/max<.3?'#fb7185':'#5eeac0'}}/></div>
   <small>{current}/{max} PS · EXP {member.exp}/{expRequired}</small>
  </div>
  <div className="adv-member-actions">
   {source==='party'&&<>
    <button type="button" onClick={()=>onPotion(index)} disabled={current<=0||current>=max}>💚 Cura</button>
    <button type="button" onClick={()=>onRevive(index)} disabled={current>0}>✨ Rianima</button>
   </>}
   <button type="button" onClick={()=>onMove(source,index)}>{source==='party'?'↓ Riserva':'↑ Squadra'}</button>
  </div>
 </div>;
}

export function AdventureCampaignView({state,characters,onUpdate,onStartBattle,onBack,onRestart}){
 const [panel,setPanel]=useState(null),[nearby,setNearby]=useState(null),[dialog,setDialog]=useState(null);
 const [battleTarget,setBattleTarget]=useState(null),[toast,setToast]=useState(null),[help,setHelp]=useState(false);
 const [confirmReset,setConfirmReset]=useState(false);
 const save=state;
 const update=fn=>onUpdate(prev=>typeof fn==='function'?fn(prev):fn);
 const showMessage=msg=>{setToast(msg);};
 useEffect(()=>{if(toast){const handle=setTimeout(()=>setToast(null),4300);return ()=>clearTimeout(handle)}},[toast]);
 const unlockIntro=save&&!save.welcomed;
 if(!save?.started)return <AdventureStarter characters={characters} onStart={id=>onUpdate(createAdventureSave(id,characters))}
   onBack={onBack}/>;
 const zone=adventureZone(save.position.x),next=ADVENTURE_ZONES[save.badges.length];
 const currentQuest=adventureQuest(save);
 const showPanel=p=>{setPanel(p);setBattleTarget(null);setDialog(null)};
 const canTravel=i=>i<=save.badges.length&&i<=5;
 const handleInteraction=(entity,position)=>{
  if(panel||dialog||battleTarget||help)return;
  update(p=>({...p,position}));
  if(entity.kind==='npc'){setDialog({speaker:entity.name,text:entity.dialogue});return;}
  if(entity.kind==='chest'){
   update(p=>adventureChest(p,entity));showMessage('🎁 +55 monete e una Pozione!');return;
  }
  if(entity.kind==='inn'){
   update(p=>adventureHeal(p,characters));showMessage('💚 Squadra guarita completamente!');return;
  }
  if(entity.kind==='shop'){setPanel('shop');return;}
  const check=adventureGymCheck(save,entity);
  if(!check.ok){setDialog({speaker:entity.name,text:check.message});return;}
  setBattleTarget(entity);
 };
 const useItem=(index,revive=false)=>{
  const result=adventureUsePotion(save,index,characters,revive);
  if(result.error){showMessage(result.error);return;}
  onUpdate(result.save);showMessage(result.save.lastMessage);
 };
 const buy=item=>{
  const result=adventureShop(save,item);
  if(result.error){showMessage(result.error);return;}
  onUpdate(result.save);showMessage(result.save.lastMessage);
 };
 const travel=i=>{
  if(!canTravel(i)){showMessage('Devi sbloccare questo percorso con gli Emblemi.');return;}
  const x=ADVENTURE_ZONES[i].center-10,z=adventureRoadZ(x);
  update(p=>({...p,position:{x,z},travelSerial:(p.travelSerial||0)+1}));setPanel(null);
 };
 const paused=!!panel||!!dialog||!!battleTarget||help||confirmReset||unlockIntro;
 return <main className="adv-root">
  <AdventureWorld3D key={'world-'+save.badges.join(',')+'-'+save.chests.length+'-'+save.defeated.length}
   save={save} onWalk={position=>update(p=>p?.started?{...p,position}:p)} onNear={setNearby}
   onInteract={handleInteraction} paused={paused}/>
  <div className="adv-overlay">
   <header className="adv-hud-header">
    <button type="button" className="adv-back" onClick={onBack} title="Torna al menu senza perdere i progressi">← <span>MENU</span></button>
    <div className="adv-hud-place"><span className="adv-hud-place-kicker">✧ CAMPAGNA · MONDO APERTO</span>
     <strong>{zone.name}</strong><small>{zone.desc}</small></div>
    <div className="adv-hud-badges" aria-label="Emblemi ottenuti">
     <span>EMBLEMI</span><strong>{save.badges.length}<small>/6</small></strong>
     <div className="adv-badge-pips">{ADVENTURE_ZONES.map(z=><i title={z.badge} key={z.id}
       style={{background:save.badges.includes(z.id)?z.color:'#25334b',boxShadow:save.badges.includes(z.id)?'0 0 9px '+z.color:'none'}}/>)}</div>
    </div>
   </header>
   <div className="adv-hud-lower">
    <aside className="adv-quest-panel">
     <span>✦ MISSIONE ATTUALE</span><strong>{currentQuest}</strong>
     <div className="adv-quest-bottom"><span>🪙 {save.coins}</span><span>🏆 {save.gymWins||0} Palestre</span></div>
    </aside>
    {nearby&&!paused&&<button type="button" className="adv-interact-pill" onClick={()=>handleInteraction(nearby,save.position)}>
      <kbd>E</kbd><span>{symbol[nearby.kind]} <b>{nearby.name}</b><small>{nearby.kind==='wild'?'Incontro selvatico':nearby.kind==='gym'?'Sfida capopalestra':nearby.kind==='inn'?'Cura gratuita':nearby.kind==='chest'?'Apri scrigno':'Interagisci'}</small></span>
     </button>}
    <nav className="adv-toolbar" aria-label="Strumenti di avventura">
     <button onClick={()=>showPanel('team')} title="Gestisci squadra">🐾 <span>SQUADRA</span></button>
     <button onClick={()=>showPanel('map')} title="Mappa del mondo">🗺️ <span>MAPPA</span></button>
     <button onClick={()=>showPanel('bag')} title="Zaino">🎒 <span>ZAINO</span></button>
     <button onClick={()=>showPanel('journal')} title="Diario">📜 <span>DIARIO</span></button>
     <button onClick={()=>setHelp(true)} title="Comandi">❔</button>
    </nav>
   </div>
   <div className="adv-compass">N <span>✧</span> E <small>WASD / FRECCE · E interagisci · SHIFT corri</small></div>
  </div>
  {toast&&<div className="adv-toast" role="status">{toast}</div>}
  {unlockIntro&&<div className="adv-modal-wrap">
   <section className="adv-modal adv-intro">
    <div className="adv-modal-kicker">✦ EPISODIO I · IL PRIMO PASSO</div>
    <h2>Benvenuto nella Valle dell'Alba</h2>
    <p>«Sono il professor Orion. Davanti a te ci sono sei regioni, ognuna con una Palestra. Allenati sui percorsi, stringi amicizia con nuovi Multimon e conquista gli Emblemi. La Lega del Multiverso ti aspetta oltre il vulcano.»</p>
    <div className="adv-intro-steps"><span>⚡ Esplora</span><span>⚔️ Combatti</span><span>🏅 Conquista</span></div>
    <button className="adv-primary" onClick={()=>update(p=>({...p,welcomed:true,lastMessage:'Il viaggio è iniziato. Raggiungi i primi allenatori!'}))}>INIZIA L'AVVENTURA →</button>
   </section>
  </div>}
  {dialog&&<div className="adv-modal-wrap" onClick={()=>setDialog(null)}>
   <div className="adv-dialog" role="dialog" aria-label={dialog.speaker} onClick={e=>e.stopPropagation()}>
    <div className="adv-dialog-speaker">💬 {dialog.speaker}</div>
    <p>{dialog.text}</p><button onClick={()=>setDialog(null)}>CONTINUA →</button>
   </div>
  </div>}
  {battleTarget&&<div className="adv-modal-wrap">
   <section className="adv-modal adv-battle-preview">
    <div className="adv-modal-kicker">{battleTarget.kind==='gym'?'🏛️ SFIDA PALESTRA':
      battleTarget.kind==='champion'?'🏆 LEGA DEL MULTIVERSO':
      battleTarget.kind==='trainer'?'⚔️ ALLENATORE':'✦ INCONTRO SELVATICO'}</div>
    <h2>{battleTarget.name}</h2>
    <p>{battleTarget.dialogue||(
     battleTarget.kind==='wild'?'Un Multimon selvatico è comparso sul percorso!':
     battleTarget.kind==='gym'?'Conquista l’Emblema e apri il portale della regione successiva.':
     'Una battaglia decisiva per il destino del Multiverso.')}</p>
    <div className="adv-enemy-line">{battleTarget.party?.map((id,i)=>{
     const c=getChar(characters,id);return <div key={id+i}>{img(c?.img,c?.name)}<strong>{c?.name||id}</strong><small>LV. {battleTarget.level+i*(battleTarget.kind==='gym'?1:0)}</small></div>;
    })}</div>
    <div className="adv-preview-actions">
     <button onClick={()=>setBattleTarget(null)} className="adv-ghost">NON ORA</button>
     <button className="adv-primary" onClick={()=>onStartBattle(battleTarget)}>⚔️ INIZIA LO SCONTRO →</button>
    </div>
   </section>
  </div>}
  {(panel||help||confirmReset)&&!unlockIntro&&<div className="adv-modal-wrap" onMouseDown={e=>{if(e.target===e.currentTarget){setPanel(null);setHelp(false);setConfirmReset(false);}}}>
   <section className={'adv-modal adv-panel '+(panel==='map'?'adv-panel-map':'')}>
    <div className="adv-panel-head">
     <span className="adv-modal-kicker">MULTIMON · CAMPAGNA 3D</span>
     <button onClick={()=>{setPanel(null);setHelp(false);setConfirmReset(false);}} aria-label="Chiudi">✕</button>
    </div>
    {panel==='team'&&<>
     <h2>La tua squadra <small>{save.party.length}/{ADVENTURE_MAX_PARTY}</small></h2>
     <p>Le statistiche crescono con i livelli. I Multimon nella riserva non combattono finché non li aggiungi alla squadra.</p>
     <div className="adv-team-grid">{save.party.map((m,i)=><AdventureMember key={m.id+'-'+i} index={i} member={m} characters={characters}
      onPotion={k=>useItem(k)} onRevive={k=>useItem(k,true)}
      onMove={(src,idx)=>update(p=>adventureSwap(p,src,idx))}/>)}</div>
     <h3>📦 Riserva · {save.reserve.length}/24</h3>
     <div className="adv-team-grid">{save.reserve.map((m,i)=><AdventureMember key={m.id+'-'+i} index={i} member={m} characters={characters}
       source="reserve" onMove={(src,idx)=>update(p=>adventureSwap(p,src,idx))}/>)}
      {!save.reserve.length&&<p>Quando la squadra è piena, i nuovi Multimon reclutati verranno qui.</p>}</div>
    </>}
    {panel==='map'&&<>
      <h2>La mappa del Multiverso</h2><p>Sei regioni collegate da sentieri reali. Viaggia verso le zone già sbloccate o prosegui a piedi fino alla prossima Palestra.</p>
      <div className="adv-region-list">{ADVENTURE_ZONES.map((z,i)=>{
       const unlocked=canTravel(i),done=save.badges.includes(z.id);
       return <button type="button" key={z.id} disabled={!unlocked} onClick={()=>travel(i)}
        className={'adv-region-row '+(unlocked?'':'adv-region-locked')}>
        <div className="adv-region-number" style={{borderColor:z.color,color:z.color}}>{done?'✓':i+1}</div>
        <div><strong>{z.name}</strong><small>{z.desc} · Capopalestra {z.gym}</small></div>
        <span>{done?'🏅 EMblema':unlocked?'RAGGIUNGI →':'🔒'}</span>
       </button>;
      })}</div>
      <div className="adv-map-legend">🏆 Lega del Multiverso · sbloccata dopo sei Emblemi</div>
    </>}
    {panel==='bag'&&<>
      <h2>Il tuo zaino</h2><p>Le cure funzionano tra una battaglia e l’altra. Per usare una Pozione scegli un Multimon nel pannello Squadra.</p>
      <div className="adv-bag-grid"><div><b>🪙 Monete</b><strong>{save.coins}</strong></div>
       <div><b>💚 Pozioni</b><strong>{save.potions}</strong><small>Recupera il 40% dei PS</small></div>
       <div><b>✨ Cristalli</b><strong>{save.revives}</strong><small>Rianima al 50% dei PS</small></div></div>
      <button className="adv-primary" onClick={()=>setPanel('team')}>GESTISCI LA SQUADRA →</button>
    </>}
    {panel==='shop'&&<>
     <h2>🛒 Bottega dei Viaggiatori</h2>
     <p>Hai <b>{save.coins} monete</b>. Le Pozioni e i Cristalli non utilizzano il tuo inventario competitivo.</p>
     <div className="adv-shop-list">{[
      ['potion','💚 Pozione','Recupera il 40% dei PS fuori dalla lotta',45],
      ['revive','✨ Cristallo','Rianima un Multimon esausto al 50%',135]
     ].map(([id,icon,desc,price])=><div key={id}>
       <span><strong>{icon}</strong><small>{desc}</small></span>
       <button disabled={save.coins<price} onClick={()=>buy(id)}>COMPRA · {price} 🪙</button>
      </div>)}</div>
    </>}
    {panel==='journal'&&<>
      <h2>📜 Diario del Viaggiatore</h2>
      <p className="adv-quest-lead">{currentQuest}</p>
      <div className="adv-stat-grid"><div><strong>{save.trainerWins||0}</strong><small>Allenatori battuti</small></div>
       <div><strong>{save.wildBattles||0}</strong><small>Incontri selvatici vinti</small></div>
       <div><strong>{save.gymWins||0}/6</strong><small>Palestre vinte</small></div>
       <div><strong>{save.party.length+save.reserve.length}</strong><small>Multimon reclutati</small></div></div>
      <h3>Gli Emblemi</h3>
      <div className="adv-emblem-list">{ADVENTURE_ZONES.map(z=><div key={z.id} className={save.badges.includes(z.id)?'adv-emblem-earned':''}>
       <span style={{color:z.color}}>◆</span><strong>{z.badge}</strong><small>{save.badges.includes(z.id)?'CONQUISTATO':'DA CONQUISTARE'}</small>
      </div>)}</div>
      <p>Ultimo evento: {save.lastMessage}</p>
      <button className="adv-danger-link" onClick={()=>setConfirmReset(true)}>Ricomincia l'avventura</button>
    </>}
    {help&&<>
     <h2>Come funziona l'esplorazione?</h2>
     <div className="adv-help-list">
      <p><kbd>W A S D</kbd> o <kbd>Frecce</kbd> per muoverti lungo i percorsi 3D.</p>
      <p><kbd>SHIFT</kbd> per correre. <kbd>E</kbd> per parlare, sfidare o aprire gli scrigni.</p>
      <p>📱 Su tablet usa la croce direzionale e il pulsante PARLA.</p>
      <p>⚔️ Sconfiggi i due allenatori di ogni regione per accedere alla Palestra. Il nuovo Emblema apre il percorso seguente.</p>
      <p>✦ Vinci gli incontri selvatici per poter reclutare altri Multimon. Il team contiene massimo sei alleati, poi c'è la riserva.</p>
      <p>💾 Il salvataggio è automatico su questo browser. Torna al menu quando vuoi.</p>
     </div>
    </>}
    {confirmReset&&<div className="adv-reset-overlay">
      <h2>Ricominciare da zero?</h2><p>Perderai tutti gli Emblemi, i livelli e i Multimon di questa Campagna 3D. Le altre modalità non verranno toccate.</p>
      <div className="adv-preview-actions"><button className="adv-ghost" onClick={()=>setConfirmReset(false)}>ANNULLA</button>
       <button className="adv-danger-button" onClick={()=>{onRestart();setConfirmReset(false);setPanel(null);}}>AZZERA CAMPAGNA</button></div>
    </div>}
   </section>
  </div>}
 </main>;
}

export function AdventureBattleResult({room,save,characters,onContinue,onExit}){
 const [claimed,setClaimed]=useState(false);
 const result=room?.adventureEncounter||{};
 const won=room?.winner===room?.players?.p1;
 const fighter=getChar(characters,result.species);
 const canRecruit=won&&result.kind==='wild'&&
  (save.party.length+save.reserve.length)<30;
 const finish=recruit=>{if(claimed)return;setClaimed(true);onContinue(recruit);};
 return <main className="adv-root adv-result-root">
  <div className="adv-result-card">
   <span className="adv-eyebrow">{won?'✦ VITTORIA CONQUISTATA':'✦ UNA NUOVA POSSIBILITÀ'}</span>
   <div className="adv-result-icon">{won?'🏆':'🛡️'}</div>
   <h1>{won?'Sfida superata!':'La squadra si ritira'}</h1>
   <p>{won?'Hai superato lo scontro contro '+result.name+'. I tuoi Multimon guadagnano esperienza e monete.':
    'Ritornerai al tuo ultimo Centro di Cura. I progressi e gli Emblemi conquistati restano tuoi.'}</p>
   {won&&result.kind==='gym'&&<div className="adv-earned-emblem">
    <span>◆</span><strong>{ADVENTURE_ZONES[result.zone]?.badge}</strong><small>NUOVO EMBLEMA · PERCORSO SBLOCCATO</small>
   </div>}
   {won&&result.kind==='champion'&&<div className="adv-earned-emblem"><strong>🌟 CAMPIONE DEL MULTIVERSO 🌟</strong><small>HAI COMPLETATO LA LEGA!</small></div>}
   {canRecruit&&<div className="adv-capture-card">
    {img(fighter?.img,fighter?.name||result.species)}
    <div><strong>{fighter?.name||result.species} vuole unirsi al viaggio!</strong>
     <small>LV. {result.level} · {fighter?.types?.join(' / ')}</small>
     <p>Puoi aggiungerlo alla squadra o alla riserva, senza perdere nessun alleato.</p>
    </div>
   </div>}
   <div className="adv-preview-actions">
    {canRecruit&&<button className="adv-primary" disabled={claimed} onClick={()=>finish(true)}>✨ RECLUTA {fighter?.name?.toUpperCase()||'MULTIMON'}</button>}
    <button className={canRecruit?'adv-ghost':'adv-primary'} disabled={claimed} onClick={()=>finish(false)}>
     {canRecruit?'PROSEGUI SENZA RECLUTARE':'TORNA AL MONDO 3D →'}
    </button>
   </div>
   <button className="adv-result-menu" onClick={onExit}>Torna al menu senza incassare questa battaglia</button>
  </div>
 </main>;
}
