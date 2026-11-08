import React,{useEffect,useMemo,useState} from 'react';
import {
 COMBAT_LAB_CONFIG_KEY,COMBAT_LAB_PRESETS_KEY,COMBAT_LAB_MAX_PRESETS,
 COMBAT_LAB_DEFAULT,COMBAT_LAB_STATUSES,COMBAT_LAB_WEATHERS,COMBAT_LAB_CPU,
 normalizeCombatLabConfig,combatLabReportTotals,canEditCombatLabBattle
} from '../../systems/combatLab.js';
import {BattleReportPanel} from '../../components/BattleReportPanel.jsx';
import './CombatLabView.css';

const readJson=(key,fallback)=>{
 try{const data=JSON.parse(localStorage.getItem(key));return data??fallback;}catch{return fallback;}
};
const ListSelect=({value,onChange,values,label})=><label className="combat-lab-select">
 <span>{label}</span>
 <select value={value} onChange={e=>onChange(e.target.value)}>
  {values.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}
 </select>
</label>;
const Portrait=({char,selected=false,onClick,extra='',disabled=false})=>
 <button type="button" className={'combat-lab-portrait'+(selected?' is-selected':'')}
   onClick={onClick} disabled={disabled} aria-label={extra||char.name}
   title={extra||char.name}>
  <span className="combat-lab-portrait-art">
   <img src={char.img} alt="" loading="lazy" onError={e=>{e.currentTarget.style.visibility='hidden'}}/>
  </span>
  <span className="combat-lab-portrait-name">{char.name}</span>
  <span className="combat-lab-portrait-types">{(char.types||[]).slice(0,2).join(' / ')}</span>
  {selected&&<span className="combat-lab-portrait-indicator">✓</span>}
 </button>;

export function CombatLabView({characters,onStart,onBack}){
 const [config,setConfig]=useState(()=>normalizeCombatLabConfig(
  readJson(COMBAT_LAB_CONFIG_KEY,COMBAT_LAB_DEFAULT),characters));
 const [presets,setPresets]=useState(()=>{
  const items=readJson(COMBAT_LAB_PRESETS_KEY,[]);
  return Array.isArray(items)?items.slice(0,COMBAT_LAB_MAX_PRESETS):[];
 });
 const [side,setSide]=useState('p1');
 const [search,setSearch]=useState('');
 const [notice,setNotice]=useState('');
 const [showPresets,setShowPresets]=useState(false);
 const available=useMemo(()=>characters.filter(c=>c.img&&!c.isSecretUnlock&&!c.isSummonOnly
  &&!c.isCampaignMonster&&!c.fusionOf),[characters]);
 const byId=useMemo(()=>new Map(available.map(c=>[c.id,c])),[available]);
 const visible=useMemo(()=>available.filter(c=>(c.name||'').toLocaleLowerCase('it')
  .includes(search.trim().toLocaleLowerCase('it'))),[available,search]);
 useEffect(()=>{try{localStorage.setItem(COMBAT_LAB_CONFIG_KEY,JSON.stringify(config))}catch{}},[config]);
 const update=patch=>{setConfig(old=>normalizeCombatLabConfig({...old,...patch},characters));setNotice('')};
 const chosen=config[side];
 const add=(id)=>{
  if(chosen.includes(id))return update({[side]:chosen.filter(x=>x!==id)});
  if(chosen.length>=6){setNotice('Massimo 6 Multimon per squadra. Rimuovine prima uno.');return;}
  update({[side]:[...chosen,id]});
 };
 const savePreset=()=>{
  if(presets.length>=COMBAT_LAB_MAX_PRESETS){setNotice('Hai già 5 configurazioni. Elimina una per crearne un’altra.');return;}
  const name='Configurazione '+(presets.length+1);
  const next=[...presets,{name,config:{...config}}];
  setPresets(next);try{localStorage.setItem(COMBAT_LAB_PRESETS_KEY,JSON.stringify(next))}catch{}
  setNotice('💾 '+name+' salvata sul dispositivo.');
 };
 const deletePreset=index=>{
  const next=presets.filter((_,i)=>i!==index);
  setPresets(next);try{localStorage.setItem(COMBAT_LAB_PRESETS_KEY,JSON.stringify(next))}catch{}
  setNotice('Configurazione eliminata.');
 };
 const loadPreset=p=>{
  setConfig(normalizeCombatLabConfig(p.config,characters));
  setNotice('📂 '+p.name+' caricata.');
 };
 const launch=()=>{if(!config.p1.length||!config.p2.length){setNotice('Ogni squadra deve avere almeno un Multimon.');return;}
  onStart({...config});};
 return <main className="combat-lab-page">
  <div className="combat-lab-background" aria-hidden="true"/>
  <div className="combat-lab-shell">
   <header className="combat-lab-header">
    <button type="button" className="combat-lab-back" onClick={onBack}>← Menu</button>
    <div className="combat-lab-headline">
     <span className="combat-lab-eyebrow">✦ CENTRO DI SIMULAZIONE · ACCESSO LIBERO ✦</span>
     <h1>🧪 LABORATORIO <span>DI COMBATTIMENTO</span></h1>
     <p>Prepara due squadre, prova mosse e status e verifica i dati reali del motore di Multimon.</p>
    </div>
    <div className="combat-lab-no-rewards">🔒 SOLO ALLENAMENTO<br/><small>Nessun consumo · Nessuna ricompensa</small></div>
   </header>
   <div className="combat-lab-layout">
    <section className="combat-lab-panel combat-lab-roster">
     <div className="combat-lab-section-header">
      <h2>01 · Le squadre</h2><span>Fino a 6 per lato</span>
     </div>
     <div className="combat-lab-sides">
      {['p1','p2'].map(role=><button type="button" key={role}
        className={'combat-lab-side-tab'+(side===role?' is-active':'')}
        onClick={()=>{setSide(role);setSearch('')}}>
        <span>{role==='p1'?'⚡ La tua squadra':'🤖 Avversari'}</span>
        <b>{config[role].length}/6</b>
      </button>)}
     </div>
     <div className="combat-lab-selected" aria-label="Squadra selezionata">
      {chosen.length?chosen.map((id,i)=>{
       const c=byId.get(id);if(!c)return null;
       return <div key={id} className="combat-lab-picked">
        <img src={c.img} alt="" loading="lazy"/>
        <span>{c.name}</span>
        <button type="button" onClick={()=>add(id)} title={'Rimuovi '+c.name}
          aria-label={'Rimuovi '+c.name}>×</button>
       </div>;
      }):<p className="combat-lab-muted">Aggiungi almeno un Multimon.</p>}
     </div>
     <div className="combat-lab-search">
      <span aria-hidden="true">⌕</span>
      <input value={search} onChange={e=>setSearch(e.target.value)}
       placeholder="Cerca nel roster…" aria-label="Cerca personaggio da testare"/>
      <span>{visible.length} disponibili</span>
     </div>
     <div className="combat-lab-grid" aria-label="Personaggi utilizzabili nel laboratorio">
      {visible.map(char=><Portrait key={char.id} char={char}
        selected={chosen.includes(char.id)} onClick={()=>add(char.id)}
        extra={(chosen.includes(char.id)?'Rimuovi ':'Aggiungi ')+char.name}/>)}
     </div>
     <p className="combat-lab-footnote">Sono disponibili tutti i personaggi normali anche se non acquistati. Nessuno viene sbloccato nel profilo.</p>
    </section>

    <section className="combat-lab-panel combat-lab-settings">
     <div className="combat-lab-section-header"><h2>02 · Regole della simulazione</h2><span>Motore reale</span></div>
     <div className="combat-lab-setting-group">
      <span className="combat-lab-setting-caption">Multimon contemporaneamente in campo</span>
      <div className="combat-lab-segments">
       {[1,2,3,4].map(n=><button type="button" key={n}
        className={config.fieldSize===n?'is-active':''}
        onClick={()=>update({fieldSize:n})}>{n}v{n}</button>)}
      </div>
      {config.fieldSize>Math.min(config.p1.length,config.p2.length)&&
       <p className="combat-lab-hint">Il campo sarà ridotto automaticamente alla dimensione della squadra più piccola.</p>}
     </div>
     <div className="combat-lab-setting-group">
      <span className="combat-lab-setting-caption">Intelligenza avversaria</span>
      <div className="combat-lab-cpu-options">
       {COMBAT_LAB_CPU.map(mode=><button type="button" key={mode.id}
        className={config.cpuMode===mode.id?'is-active':''}
        onClick={()=>update({cpuMode:mode.id})}>
        <strong>{mode.label}</strong><small>{mode.description}</small>
       </button>)}
      </div>
     </div>
     <ListSelect label="Meteo all'inizio (5 turni)" value={config.weather}
      onChange={v=>update({weather:v})} values={COMBAT_LAB_WEATHERS}/>
     <div className="combat-lab-two-col">
      <ListSelect label="Status della tua squadra" value={config.statusP1}
       onChange={v=>update({statusP1:v})} values={COMBAT_LAB_STATUSES}/>
      <ListSelect label="Status degli avversari" value={config.statusP2}
       onChange={v=>update({statusP2:v})} values={COMBAT_LAB_STATUSES}/>
      <label className="combat-lab-select"><span>PS iniziali tuoi</span>
       <select value={config.hpP1} onChange={e=>update({hpP1:Number(e.target.value)})}>
        {[100,75,50,25,10].map(x=><option key={x} value={x}>{x}%</option>)}
       </select></label>
      <label className="combat-lab-select"><span>PS iniziali CPU</span>
       <select value={config.hpP2} onChange={e=>update({hpP2:Number(e.target.value)})}>
        {[100,75,50,25,10].map(x=><option key={x} value={x}>{x}%</option>)}
       </select></label>
     </div>
     <div className="combat-lab-notice"><strong>🔬 Sicurezza del test</strong>
      <p>Qui non vengono utilizzati i bonus Punti Forza, gli strumenti del tuo inventario o le ricompense di battaglia. Tutti i progressi restano invariati.</p>
     </div>
     <button type="button" className="combat-lab-primary" onClick={launch}>
      ⚔️ AVVIA LA SIMULAZIONE <span>→</span>
     </button>
     {notice&&<p className="combat-lab-feedback" role="status">{notice}</p>}
    </section>
   </div>

   <section className="combat-lab-panel combat-lab-preset-section">
    <div className="combat-lab-section-header"><h2>03 · Configurazioni salvate</h2><span>{presets.length}/5</span></div>
    <div className="combat-lab-presets-bar">
     <button type="button" onClick={savePreset} disabled={presets.length>=COMBAT_LAB_MAX_PRESETS}>💾 Salva questa configurazione</button>
     <button type="button" onClick={()=>setShowPresets(v=>!v)}>{showPresets?'Nascondi':'Mostra'} configurazioni</button>
     <button type="button" onClick={()=>setConfig(normalizeCombatLabConfig(COMBAT_LAB_DEFAULT,characters))}>↻ Configurazione base</button>
    </div>
    {showPresets&&<div className="combat-lab-preset-list">
     {presets.length?presets.map((p,i)=><div key={i} className="combat-lab-preset">
      <span>🧬 {p.name}</span>
      <button type="button" onClick={()=>loadPreset(p)}>Carica</button>
      <button type="button" onClick={()=>deletePreset(i)} aria-label={'Elimina '+p.name}>Elimina</button>
     </div>):<p className="combat-lab-muted">Non hai ancora configurazioni salvate.</p>}
    </div>}
    <p className="combat-lab-footnote">Le cinque configurazioni vengono salvate solo su questo dispositivo, non nel profilo online.</p>
   </section>
  </div>
 </main>;
}

export function CombatLabTelemetry({room,combatLog,onEdit,getMultiplier,onQuit}){
 const [open,setOpen]=useState(false);
 const [role,setRole]=useState('p2');
 const [idx,setIdx]=useState(0);
 const [status,setStatus]=useState('Assiderato');
 const canEdit=canEditCombatLabBattle(room);
 const roster=room.teams?.[role]||[];
 const char=roster[idx]||roster.find(c=>c?.hp>0);
 const allies=room.teams?.p1||[],enemies=room.teams?.p2||[];
 const myActive=allies[(room.field?.p1||[])[0]],enemyActive=enemies[(room.field?.p2||[])[0]];
 const keyMove=myActive?.moves?.find(m=>m.power>0);
 const effectiveness=keyMove&&enemyActive&&getMultiplier
  ?getMultiplier(keyMove.type,enemyActive.types):null;
 const totalsP1=combatLabReportTotals(room.battleReport,'p1');
 const totalsP2=combatLabReportTotals(room.battleReport,'p2');
 const log=(combatLog||[]).slice(-8).map(x=>typeof x==='string'?x:x?.text||'').filter(Boolean);
 return <aside className={'combat-lab-telemetry'+(open?' is-open':'')} aria-label="Controlli e analisi del laboratorio">
  {!open?<button type="button" className="combat-lab-hud-toggle" onClick={()=>setOpen(true)}>
   🧪 Analisi & controlli <span className="combat-lab-hud-pulse"/>
  </button>:<div className="combat-lab-hud">
   <header><div><small>DIAGNOSTICA LIVE · TURNO {room.battleReport?.turns||0}</small>
    <h3>🧪 Centro di analisi</h3></div>
    <button type="button" onClick={()=>setOpen(false)} aria-label="Chiudi analisi">×</button></header>
   <div className="combat-lab-hud-scroll">
    <div className="combat-lab-live-grid">
     <div><span>La tua squadra</span><strong>{totalsP1.damageDealt}</strong><small>danni inflitti · {totalsP1.kos} KO</small></div>
     <div><span>La CPU</span><strong>{totalsP2.damageDealt}</strong><small>danni inflitti · {totalsP2.kos} KO</small></div>
     <div><span>Cure totali</span><strong>{totalsP1.healing+totalsP2.healing}</strong><small>PS realmente recuperati</small></div>
     <div><span>Passive</span><strong>{totalsP1.passiveActivations+totalsP2.passiveActivations}</strong><small>attivazioni registrate</small></div>
    </div>
    {keyMove&&enemyActive&&<div className="combat-lab-inspector">
     <h4>🎯 Analisi del tipo (reale)</h4>
     <p><b>{myActive.name}</b> → <b>{enemyActive.name}</b></p>
     <p>{keyMove.name} · {keyMove.type} · efficacia <strong>×{effectiveness}</strong></p>
     <small>I danni reali sono quelli registrati sopra: dipendono anche dalle statistiche, dal meteo, dalle passive e dai tiri del motore.</small>
    </div>}
    <div className="combat-lab-hud-divider"/>
    <h4>🎛️ Modifica il bersaglio tra i turni</h4>
    <div className="combat-lab-hud-buttons">
     <button type="button" className={role==='p1'?'is-active':''} onClick={()=>{setRole('p1');setIdx(0)}}>Alleati</button>
     <button type="button" className={role==='p2'?'is-active':''} onClick={()=>{setRole('p2');setIdx(0)}}>Avversari</button>
    </div>
    <select value={roster[idx]?idx:0} onChange={e=>setIdx(Number(e.target.value))}
      aria-label="Multimon di cui modificare lo stato">
     {roster.map((c,i)=><option key={i} value={i}>{c.name}{c.hp<=0?' · KO':''}</option>)}
    </select>
    {char&&<p className="combat-lab-hud-char">
      <img src={char.img} alt=""/><span><b>{char.name}</b><small>{char.hp}/{char.maxHp} PS · {(char.statuses||[]).map(s=>s.type+' ('+s.turns+')').join(', ')||'Nessuno status'}</small></span>
    </p>}
    <select value={status} onChange={e=>setStatus(e.target.value)} aria-label="Status da applicare">
     {COMBAT_LAB_STATUSES.filter(s=>s.id!=='none').map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
    </select>
    <div className="combat-lab-hud-buttons">
     <button type="button" disabled={!canEdit||!char||char.hp<=0} onClick={()=>onEdit(role,idx,{status})}>Applica status</button>
     <button type="button" disabled={!canEdit||!char||char.hp<=0} onClick={()=>onEdit(role,idx,{clearStatus:true})}>Rimuovi status</button>
     <button type="button" disabled={!canEdit||!char||char.hp<=0} onClick={()=>onEdit(role,idx,{hpPercent:100})}>PS 100%</button>
     <button type="button" disabled={!canEdit||!char||char.hp<=0} onClick={()=>onEdit(role,idx,{hpPercent:50})}>PS 50%</button>
    </div>
    {!canEdit&&<p className="combat-lab-hud-warning">⏳ Puoi modificare i combattenti soltanto tra i turni, non durante le animazioni.</p>}
    <div className="combat-lab-hud-divider"/>
    <h4>📋 Ultimi eventi</h4>
    <div className="combat-lab-hud-log">
     {log.length?log.map((line,i)=><p key={i}>{line}</p>):
      <small>Gli eventi reali del motore appariranno qui durante la lotta.</small>}
    </div>
   </div>
   <button type="button" className="combat-lab-hud-exit" onClick={onQuit}>← Torna al Laboratorio</button>
  </div>}
 </aside>;
}

export function CombatLabResult({room,onReplay,onEdit,onMenu}){
 const won=room.winner===room.players?.p1;
 return <main className="combat-lab-page combat-lab-result-page">
  <div className="combat-lab-shell">
   <div className="combat-lab-panel combat-lab-result-hero">
    <span className="combat-lab-eyebrow">✦ SESSIONE DI SIMULAZIONE CONCLUSA ✦</span>
    <h1>{won?'🏆 SIMULAZIONE VINTA':room.winner==='Pareggio'?'⚖️ PAREGGIO':'🧪 TEST COMPLETATO'}</h1>
    <p>{room.winner==='Pareggio'?'Entrambe le squadre sono state sconfitte.':
      'Vincitore del test: '+(room.winner||'Nessuno')}</p>
    <span className="combat-lab-no-rewards">Nessuna moneta · Nessun progresso · Nessuno strumento consumato</span>
    <div className="combat-lab-result-actions">
     <button type="button" className="combat-lab-primary" onClick={onReplay}>↻ RIPETI CON LE STESSE REGOLE</button>
     <button type="button" onClick={onEdit}>⚙️ Modifica configurazione</button>
     <button type="button" onClick={onMenu}>← Menu principale</button>
    </div>
   </div>
   <BattleReportPanel report={room.battleReport} players={room.players}/>
  </div>
 </main>;
}
