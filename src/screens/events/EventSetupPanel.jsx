import React from 'react';
import {SoundtrackPicker} from '../../components/SoundtrackPicker.jsx';
import '../../components/SoundtrackPicker.css';
import './EventSetupPanel.css';

const fieldOptions = doubles => (doubles?
  [{size:1,label:'2v2',hint:'1 Multimon per giocatore · 2 giocatori per squadra'},
   {size:2,label:'4v4',hint:'2 Multimon per giocatore · 2 giocatori per squadra'}]:
  [1,2,3,4].map(size=>({size,label:size+'v'+size,hint:size+' Multimon in campo per sfidante'})));

export function EventSetupPanel({settings,setSettings,create,live=[],onOpen,busy,user,playerName}){
 const set=patch=>setSettings(prev=>({...prev,...patch}));
 const formatOptions=fieldOptions(settings.doubles);
 return <div className="mv-event-setup">
  <div className="mv-event-setup-hero">
   <div className="mv-event-setup-hero-glow" aria-hidden="true"/>
   <div className="mv-event-setup-intro">
    <span className="mv-event-setup-eyebrow">✦ CONFIGURAZIONE CAMPIONATO ✦</span>
    <h2>CREA LA TUA LEGGENDA</h2>
    <p>Scegli formato, regole e musica. Il tabellone unirà le due metà del multiverso verso la finalissima.</p>
    <div className="mv-event-setup-metrics">
     <span><strong>{settings.entrants}</strong> Squadre</span>
     <span><strong>{settings.entrants*(settings.doubles?2:1)}</strong> Partecipanti</span>
     <span><strong>{Math.log2(settings.entrants)}</strong> Turni</span>
     <span><strong>{settings.teamSize}</strong> Multimon / giocatore</span>
    </div>
   </div>
   <div className="mv-event-setup-trophy" aria-hidden="true">🏆</div>
  </div>
  <div className="mv-event-setup-columns">
   <div className="mv-event-setup-settings">
    <section className="mv-event-setup-section">
     <div className="mv-event-setup-section-header"><b>01</b><div><h3>DIMENSIONI DEL TORNEO</h3><p>Ogni squadra avanza dal primo turno verso la coppa.</p></div></div>
     <div className="mv-event-setup-card-grid">
      {[4,8,16,32].map(n=><button type="button" key={n}
       className={'mv-event-choice '+(settings.entrants===n?'is-selected':'')}
       onClick={()=>set({entrants:n})}><b>{n}</b><span>Squadre</span>{settings.entrants===n&&<small>✓ Selezionato</small>}</button>)}
     </div>
     <label className="mv-event-team-size">Multimon per giocatore
      <select value={settings.teamSize} onChange={e=>set({teamSize:Number(e.target.value)})}>
       {[4,5,6,7,8].map(n=><option key={n} value={n}>{n} Multimon</option>)}
      </select>
     </label>
    </section>
    <section className="mv-event-setup-section">
     <div className="mv-event-setup-section-header"><b>02</b><div><h3>TIPOLOGIA DI LOTTA</h3><p>Stessi termini delle modalità classiche di Multimon.</p></div></div>
     <div className="mv-event-setup-style-grid">
      <button type="button" className={'mv-event-battle-style '+(!settings.doubles?'is-selected':'')}
       onClick={()=>set({doubles:false,fieldSize:Math.min(4,Math.max(1,settings.fieldSize))})}>
       <strong>⚔️ Classica</strong><small>1 giocatore contro 1 giocatore</small><span>{!settings.doubles?'✓ Attiva':'Seleziona'}</span>
      </button>
      <button type="button" className={'mv-event-battle-style '+(settings.doubles?'is-selected':'')}
       onClick={()=>set({doubles:true,fieldSize:Math.min(2,Math.max(1,settings.fieldSize))})}>
       <strong>🤝 Multipla</strong><small>2 giocatori contro altri 2, in squadre</small><span>{settings.doubles?'✓ Attiva':'Seleziona'}</span>
      </button>
     </div>
    </section>
    <section className="mv-event-setup-section">
     <div className="mv-event-setup-section-header"><b>03</b><div><h3>STILE DI LOTTA</h3><p>Numero di Multimon simultanei in campo, come nelle altre arene.</p></div></div>
     <div className="mv-event-setup-card-grid mv-event-formats">
      {formatOptions.map(opt=><button key={opt.size} type="button"
       className={'mv-event-choice '+(settings.fieldSize===opt.size?'is-selected':'')}
       onClick={()=>set({fieldSize:opt.size})}>
       <b>{opt.label}</b><span>{opt.hint}</span></button>)}
     </div>
    </section>
    <section className="mv-event-setup-section">
     <div className="mv-event-setup-section-header"><b>04</b><div><h3>REGOLE SPECIALI</h3><p>Attiva soltanto ciò che vuoi nella competizione.</p></div></div>
     <div className="mv-event-toggle-grid">
      <label className="mv-event-toggle"><input type="checkbox" checked={settings.allowItems} onChange={e=>set({allowItems:e.target.checked})}/>
       <span>🎒 Strumenti equipaggiati<small>Le cure dello zaino restano disabilitate</small></span></label>
      <label className="mv-event-toggle"><input type="checkbox" checked={settings.allowHyper} onChange={e=>set({allowHyper:e.target.checked})}/>
       <span>🔥 Forme Iper<small>Permetti l'evoluzione durante la battaglia</small></span></label>
     </div>
    </section>
   </div>
   <aside className="mv-event-setup-sidebar">
    <div className="mv-event-preview-panel">
     <h3>🏆 ANTEPRIMA DEL TABELLONE</h3>
     <p>Sinistra contro destra. Finale al centro.</p>
     <div className="mv-event-mini-bracket" aria-label="Mini anteprima bracket simmetrico">
      <div className="mv-event-mini-side">{[1,2,3,4].map(i=><span key={i}>✦ Squadra {i}</span>)}</div>
      <div className="mv-event-mini-middle"><span>◈</span><div>🏆</div><small>FINALISSIMA</small></div>
      <div className="mv-event-mini-side">{[5,6,7,8].map(i=><span key={i}>✦ Squadra {i}</span>)}</div>
     </div>
     <div className="mv-event-setup-summary">
      <span>⚔️ {settings.doubles?'Lotta Multipla':'Lotta Classica'}</span>
      <span>🎯 {settings.fieldSize*(settings.doubles?2:1)}v{settings.fieldSize*(settings.doubles?2:1)}</span>
      <span>🎒 Strumenti {settings.allowItems?'attivi':'spenti'}</span>
      <span>🔥 Iper {settings.allowHyper?'attive':'spente'}</span>
     </div>
    </div>
    <SoundtrackPicker title="🎼 SOUNDTRACK DEL TORNEO" value={settings.soundtrack}
     onChange={id=>set({soundtrack:id})}/>
    <div className="mv-event-launch-panel">
     <div className="mv-event-launch-trophy" aria-hidden="true">✦ 🏆 ✦</div>
     <p>Servono <strong>{settings.entrants*(settings.doubles?2:1)}</strong> giocatori o bot pronti. L'host deve restare online.</p>
     <button type="button" className="mv-event-launch" disabled={busy||!user||!playerName.trim()} onClick={create}>
      ⚔️ CREA IL TORNEO DEL MULTIVERSO
     </button>
    </div>
   </aside>
  </div>
  {live.length>0&&<section className="mv-event-setup-section">
   <h3 className="mv-event-setup-live-title">🌐 TORNEI GIÀ IN CORSO</h3>
   {live.map(e=><button key={e.id} type="button" className="mv-event-live-tournament" onClick={()=>onOpen(e)}>
    <span>🏆 {e.hostName}</span><span>{e.status==='lobby'?'Iscrizioni aperte':'In diretta'} ↗</span>
   </button>)}
  </section>}
 </div>;
}
