import React,{useEffect,useState} from 'react';
import {SOUNDTRACKS,DEFAULT_BATTLE_SOUNDTRACK,soundtrackVideoUrl} from '../data/soundtracks.js';

/** YouTube's own embedded player. No audio is hosted, downloaded or re-distributed. */
export function SoundtrackPicker({value=DEFAULT_BATTLE_SOUNDTRACK,onChange,compact=false,title='🎵 Colonna sonora della battaglia'}){
 const [previewId,setPreviewId]=useState('');
 const selected=SOUNDTRACKS.find(s=>s.id===value)||SOUNDTRACKS[0];
 useEffect(()=>()=>setPreviewId(''),[]);
 const preview=track=>setPreviewId(current=>current===track.id?'':track.id);
 return <section className={'soundtrack-picker '+(compact?'soundtrack-picker--compact':'')} aria-label="Selezione soundtrack e anteprima OST">
  <div className="soundtrack-picker-heading"><span>{title}</span><small>Anteprima tramite player ufficiale YouTube</small></div>
  {compact?<div className="soundtrack-picker-compact-row">
   <select className="soundtrack-picker-select" aria-label="Soundtrack della battaglia"
     value={selected.id} onChange={e=>{onChange?.(e.target.value);setPreviewId('')}}>
    {SOUNDTRACKS.map(track=><option value={track.id} key={track.id}>{track.name}{track.isUltimonFinale?' ★ Finale Ultimon':''}</option>)}
   </select>
   <button type="button" className={'soundtrack-picker-preview '+(previewId===selected.id?'is-playing':'')}
     aria-label={'Anteprima '+selected.name} onClick={()=>preview(selected)}>
    {previewId===selected.id?'■ Chiudi anteprima':'▶ Anteprima'}
   </button>
  </div>:<div className="soundtrack-picker-grid">{SOUNDTRACKS.map(track=>
   <div key={track.id} className={'soundtrack-picker-option '+(selected.id===track.id?'is-selected':'')}>
    <div className="soundtrack-picker-disc" aria-hidden="true">♫</div>
    <div className="soundtrack-picker-info"><strong>{track.name}</strong>
     <span>{track.isUltimonFinale?'👑 FINALE UFFICIALE ULTIMON':track.category||'OST BATTAGLIA'}</span></div>
    <div className="soundtrack-picker-actions">
     <button type="button" className="soundtrack-picker-preview"
      onClick={()=>preview(track)} aria-label={'Anteprima '+track.name}>
      {previewId===track.id?'■':'▶'}</button>
     <button type="button" className={'soundtrack-picker-select-button '+(selected.id===track.id?'is-selected':'')}
      disabled={selected.id===track.id} onClick={()=>onChange?.(track.id)}>
      {selected.id===track.id?'✓ Scelta':'Scegli'}</button>
    </div>
   </div>)}</div>}
  {previewId&&<div className="soundtrack-picker-video" aria-label="Anteprima YouTube">
   <div className="soundtrack-picker-preview-header">
    <strong>🎧 Anteprima: {SOUNDTRACKS.find(s=>s.id===previewId)?.name}</strong>
    <button type="button" onClick={()=>setPreviewId('')}>■ Ferma</button>
   </div>
   <iframe key={previewId} title={'Anteprima '+previewId}
    src={`https://www.youtube.com/embed/${encodeURIComponent(previewId)}?autoplay=1&controls=1&playsinline=1&rel=0`}
    allow="autoplay; encrypted-media; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin"
    allowFullScreen loading="lazy"/>
   <a href={soundtrackVideoUrl(previewId)} target="_blank" rel="noopener noreferrer">Se non parte l'anteprima, apri la traccia su YouTube ↗</a>
  </div>}
 </section>;
}
