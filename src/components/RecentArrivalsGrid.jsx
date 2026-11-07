import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {recentArrivalCharacters} from '../data/recentArrivals.js';
import './RecentArrivalsGrid.css';

// Vetrina della lobby: i PNG devono essere leggibili anche sui tablet.
// Gli ultimi 4 arrivati hanno schede in evidenza, gli altri una griglia
// di ritratti più grandi. La selezione apre una scheda fuori dallo scroll.
export function RecentArrivalsGrid({characters,TYPE_STYLES={}}){
  const arrivals=recentArrivalCharacters(characters).slice(0,100);
  const [selectedIndex,setSelectedIndex]=useState(null);
  const closeRef=useRef(null);
  const selected=selectedIndex===null?null:arrivals[selectedIndex];

  useEffect(()=>{
    if(!selected)return;
    const handleKey=e=>{
      if(e.key==='Escape'){e.preventDefault();setSelectedIndex(null);}
      if(e.key==='ArrowRight')setSelectedIndex(i=>i===null?null:(i+1)%arrivals.length);
      if(e.key==='ArrowLeft')setSelectedIndex(i=>i===null?null:(i-1+arrivals.length)%arrivals.length);
    };
    document.addEventListener('keydown',handleKey);
    closeRef.current?.focus();
    return()=>document.removeEventListener('keydown',handleKey);
  },[selected?.id,arrivals.length]);

  const open=index=>setSelectedIndex(index);
  const close=()=>setSelectedIndex(null);
  const types=char=>(char.types||[]).map(t=>(
    <span key={t} className={'recent-arrivals-type '+(TYPE_STYLES[t]||'bg-slate-700')}>
      {t}
    </span>
  ));
  const portrait=(char,index,featured)=>(
    <button key={char.id} type="button" onClick={()=>open(index)}
      className={'recent-arrivals-card '+(featured?'recent-arrivals-card--featured':'')}
      aria-label={'Visualizza '+char.name} title={'Scopri '+char.name}>
      <span className="recent-arrivals-card-art">
        <img src={char.img} alt="" loading="lazy"/>
        {featured&&<span className="recent-arrivals-new-tag">NEW</span>}
      </span>
      <span className="recent-arrivals-card-name">{char.name}</span>
      {featured&&<span className="recent-arrivals-card-types">{(char.types||[]).slice(0,2).join(' · ')}</span>}
    </button>
  );

  return (
    <>
      <aside className="recent-arrivals-panel" aria-label="Nuovi Multimon, dal più recente">
        <div className="recent-arrivals-panel-top">
          <span className="recent-arrivals-eyebrow">✦ IL MULTIVERSO SI ESPANDE ✦</span>
          <div className="recent-arrivals-title-row">
            <h3><span aria-hidden="true">✨</span> Nuovi Arrivi</h3>
            <span className="recent-arrivals-total" aria-label={arrivals.length+' nuovi Multimon'}>{arrivals.length}</span>
          </div>
          <p>PNG più grandi, nomi leggibili e schede da esplorare.</p>
        </div>

        <div className="recent-arrivals-scroll custom-scrollbar">
          {arrivals.length>0&&<>
            <div className="recent-arrivals-section-heading"><span>★ ULTIMI ARRIVATI</span><small>In primo piano</small></div>
            <div className="recent-arrivals-featured-grid">
              {arrivals.slice(0,4).map((char,index)=>portrait(char,index,true))}
            </div>
          </>}
          {arrivals.length>4&&<>
            <div className="recent-arrivals-section-heading recent-arrivals-section-heading--archive">
              <span>✧ ALTRI ARRIVI</span><small>{arrivals.length-4} Multimon</small>
            </div>
            <div className="recent-arrivals-roster-grid">
              {arrivals.slice(4).map((char,index)=>portrait(char,index+4,false))}
            </div>
          </>}
          {arrivals.length===0&&<p className="recent-arrivals-empty">Nessun nuovo Multimon disponibile.</p>}
        </div>
        <div className="recent-arrivals-footer">👆 Tocca un personaggio per vederlo in grande</div>
      </aside>

      {selected&&createPortal(
        <div className="recent-arrivals-modal-backdrop" onMouseDown={e=>{
          if(e.target===e.currentTarget)close();
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="recent-arrivals-dialog-title"
            className="recent-arrivals-modal">
            <button type="button" ref={closeRef} onClick={close}
              className="recent-arrivals-modal-close" aria-label="Chiudi i dettagli">✕</button>
            <div className="recent-arrivals-modal-eyebrow">
              ✦ NUOVI ARRIVI <span>{selectedIndex+1} / {arrivals.length}</span>
            </div>
            <div className="recent-arrivals-modal-art">
              <img src={selected.img} alt={selected.name}/>
            </div>
            <h3 id="recent-arrivals-dialog-title">{selected.name}</h3>
            <div className="recent-arrivals-modal-types">{types(selected)}</div>
            <div className="recent-arrivals-modal-stats" aria-label="Statistiche del Multimon">
              {[['PS',selected.hp],['ATT',selected.atk],['DIF',selected.def],['VEL',selected.spd]]
                .filter(([,value])=>Number.isFinite(Number(value)))
                .map(([label,value])=><span key={label}><small>{label}</small><strong>{value}</strong></span>)}
            </div>
            <div className="recent-arrivals-modal-nav">
              <button type="button" onClick={()=>setSelectedIndex(i=>(i-1+arrivals.length)%arrivals.length)}
                aria-label="Mostra il Multimon precedente">‹ Precedente</button>
              <button type="button" onClick={()=>setSelectedIndex(i=>(i+1)%arrivals.length)}
                aria-label="Mostra il prossimo Multimon">Successivo ›</button>
            </div>
          </section>
        </div>,document.body
      )}
    </>
  );
}
