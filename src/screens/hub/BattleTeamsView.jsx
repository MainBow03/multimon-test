import React,{useEffect,useMemo,useState} from 'react';
import {onMultimonImageError} from '../../systems/imageFallback.js';
import {typeDisplayName} from '../../systems/typeLabel.js';
import {characterSeries,seriesMatches,seriesOptions} from '../../data/characterSeries.js';
import {
 BATTLE_TEAM_MIN_SIZE,BATTLE_TEAM_MAX_SIZE,BATTLE_TEAM_PRESET_SLOTS,
 battleTeamSlots
} from '../../systems/battleTeamPresets.js';
import './BattleTeamsView.css';

const getDraft=(profile,owner,size,slot)=>battleTeamSlots(profile,owner,size)[slot];

export function BattleTeamsView({characters,profile,owner='Giocatore',isPreview=false,
 typeStyles={},onSave,onDelete,onBack}){
 const [size,setSize]=useState(5);
 const [slot,setSlot]=useState(0);
 const [members,setMembers]=useState(()=>(getDraft(profile,owner,5,0)?.members||[]).map(c=>({...c})));
 const [name,setName]=useState(()=>getDraft(profile,owner,5,0)?.name||'Squadra 1');
 const [search,setSearch]=useState('');
 const [type,setType]=useState('Tutti');
 const [seriesFilter,setSeriesFilter]=useState('Tutti');
 const [feedback,setFeedback]=useState('');
 const slots=battleTeamSlots(profile,owner,size);
 const roster=useMemo(()=>characters.filter(c=>!c.isSummonOnly&&!c.isCampaignMonster&&
  ((!c.price&&!c.isSecretUnlock)||isPreview||profile?.unlockedChars?.includes(c.id))),
  [characters,isPreview,profile?.unlockedChars]);
 const lookup=useMemo(()=>new Map(characters.map(c=>[c.id,c])),[characters]);
 const selected=new Set(members.map(c=>c.id));
 const filtered=roster.filter(c=>seriesMatches(c,seriesFilter)&&
  (type==='Tutti'||c.types?.includes(type))&&
  (c.name||'').toLocaleLowerCase('it-IT').includes(search.trim().toLocaleLowerCase('it-IT')));
 const allTypes=['Tutti',...new Set(roster.flatMap(c=>c.types||[]))].sort((a,b)=>
  a==='Tutti'?-1:b==='Tutti'?1:a.localeCompare(b,'it'));

 useEffect(()=>{
  const saved=getDraft(profile,owner,size,slot);
  setMembers((saved?.members||[]).map(c=>({...c})));
  setName(saved?.name||'Squadra '+(slot+1));
  setFeedback('');
 },[size,slot,owner]);

 const add=c=>{
  if(members.length>=size||selected.has(c.id))return;
  setMembers(prev=>[...prev,{id:c.id}]);setFeedback('');
 };
 const remove=id=>{setMembers(prev=>prev.filter(c=>c.id!==id));setFeedback('');};
 const save=()=>{
  if(members.length!==size){setFeedback('Scegli esattamente '+size+' Multimon prima di salvare.');return;}
  const result=onSave({size,slot,name,members});
  setFeedback(result?.ok?'✓ Squadra salvata nel tuo profilo!':
   result?.reason||'Impossibile salvare la squadra.');
 };
 const erase=()=>{
  const result=onDelete({size,slot});
  if(result?.ok){
   setMembers([]);setName('Squadra '+(slot+1));
   setFeedback('Slot '+(slot+1)+' svuotato.');
  }else setFeedback(result?.reason||'Impossibile eliminare la squadra.');
 };

 return <main className="bt-page">
  <div className="bt-glow" aria-hidden="true"/>
  <div className="bt-container">
   <header className="bt-header">
    <button type="button" className="bt-back" onClick={onBack}>← Torna al menu</button>
    <div><span className="bt-eyebrow">⚔️ IL TUO ARSENALE</span>
     <h1>Squadre Lotta</h1>
     <p>Prepara fino a <b>3 squadre per ogni numero di Multimon</b>. Le formazioni da 5,
      da 6 e da tutti gli altri numeri si salvano separatamente, anche per le prossime partite.</p>
    </div>
   </header>

   <section className="bt-panel bt-configuration" aria-label="Numero di Multimon">
    <div className="bt-section-title"><h2>1. Quanti Multimon?</h2>
     <span>La dimensione scelta dall'host determinerà quali squadre potrai caricare.</span></div>
    <div className="bt-sizes">
     {Array.from({length:BATTLE_TEAM_MAX_SIZE-BATTLE_TEAM_MIN_SIZE+1},(_,i)=>i+BATTLE_TEAM_MIN_SIZE)
      .map(n=><button key={n} type="button" aria-pressed={size===n}
       className={'bt-size'+(size===n?' is-active':'')} onClick={()=>{setSize(n);setSlot(0);}}>
        {n} <small>vs {n}</small>
       </button>)}
    </div>
   </section>

   <section className="bt-panel" aria-label="Slot squadre lotta">
    <div className="bt-section-title"><h2>2. Scegli una delle 3 squadre da {size}</h2>
     <span>Ogni slot è indipendente dagli altri.</span></div>
    <div className="bt-slots">
     {Array.from({length:BATTLE_TEAM_PRESET_SLOTS},(_,i)=>{
      const saved=slots[i];
      return <button type="button" key={i} aria-pressed={slot===i}
       className={'bt-slot'+(slot===i?' is-active':'')}
       onClick={()=>setSlot(i)}>
       <span className="bt-slot-number">SQUADRA {i+1}</span>
       <strong>{saved?.name||'Slot vuoto'}</strong>
       <small>{saved?size+' Multimon salvati':'Da creare'}</small>
       <span className="bt-slot-faces">{saved?.members?.slice(0,6).map((m,j)=>{
        const fighter=lookup.get(m.id);
        return fighter?<img key={m.id+'-'+j} src={fighter.img} alt={fighter.name}
          onError={onMultimonImageError} loading="lazy"/>:null;
       })}</span>
      </button>;
     })}
    </div>
   </section>

   <section className="bt-panel">
    <div className="bt-section-title"><h2>3. Crea la tua formazione</h2>
     <span>{members.length}/{size} Multimon</span></div>
    <label className="bt-name-label" htmlFor="bt-team-name">Nome della squadra</label>
    <input id="bt-team-name" className="bt-name" maxLength={32}
     placeholder={'Squadra '+(slot+1)} value={name}
     onChange={e=>{setName(e.target.value);setFeedback('');}}/>
    <div className="bt-selected">
     {Array.from({length:size},(_,i)=>{
      const member=members[i],char=lookup.get(member?.id);
      return member?<button type="button" key={member.id+'-'+i} className="bt-picked"
       title={'Rimuovi '+(char?.name||member.id)} onClick={()=>remove(member.id)}>
       {char?.img&&<img src={char.img} alt="" onError={onMultimonImageError}/>}
       <strong>{char?.name||member.id}</strong><span>× Rimuovi</span>
      </button>:<div className="bt-picked bt-picked--empty" key={'empty-'+i}
       aria-label={'Posizione '+(i+1)+' vuota'}><b>+</b><small>{i+1}</small></div>;
     })}
    </div>
    <div className="bt-actions">
     <button type="button" className="bt-save" disabled={members.length!==size}
      onClick={save}>💾 Salva squadra {slot+1} da {size}</button>
     <button type="button" className="bt-clear" disabled={!slots[slot]} onClick={erase}>
      Elimina squadra salvata
     </button>
    </div>
    {feedback&&<p className="bt-feedback" role="status">{feedback}</p>}
   </section>

   <section className="bt-panel bt-catalog">
    <div className="bt-section-title"><h2>4. Scegli i Multimon</h2>
     <span>{roster.length} personaggi disponibili per il tuo profilo</span></div>
    <div className="bt-filter-row">
     <label>Cerca un personaggio<input type="search" value={search} onChange={e=>setSearch(e.target.value)}
      placeholder="Nome Multimon…"/></label>
     <label>Filtra per tipo<select value={type} onChange={e=>setType(e.target.value)}>
      {allTypes.map(t=><option key={t} value={t}>{typeDisplayName(t)}</option>)}
     </select></label>
    </div>
    <div className="mb-3 rounded-xl border border-violet-400/30 bg-violet-950/30 p-3">
     <label className="flex flex-wrap items-center gap-2 text-xs font-black text-violet-200">
      <span>🌌 Serie / universo d’origine</span>
      <select aria-label="Filtra Squadre Lotta per serie" value={seriesFilter} onChange={e=>setSeriesFilter(e.target.value)}
       className="min-w-0 flex-1 rounded-lg border border-violet-400/40 bg-slate-950 p-2 text-white">
       <option value="Tutti">Tutte le serie</option>
       {seriesOptions(roster).map(series=><option key={series} value={series}>{series}</option>)}
      </select>
     </label>
    </div>
    <div className="bt-roster">
     {filtered.map(c=><button key={c.id} type="button"
      disabled={selected.has(c.id)||members.length>=size}
      className={'bt-character'+(selected.has(c.id)?' is-selected':'')}
      onClick={()=>add(c)}>
      <img src={c.img} alt="" loading="lazy" onError={onMultimonImageError}/>
      <strong>{c.name}</strong><small title={characterSeries(c)}>🌌 {characterSeries(c)}</small>
      <span className="bt-types">{(c.types||[]).map(t=><span key={t}
       className={typeStyles[t]||'bg-slate-600 text-white'}>{typeDisplayName(t)}</span>)}</span>
      <small>{selected.has(c.id)?'✓ Nella squadra':members.length>=size?'Squadra completa':'+ Aggiungi'}</small>
     </button>)}
     {!filtered.length&&<p className="bt-no-results">Nessun Multimon disponibile con questo filtro.</p>}
    </div>
   </section>
   <p className="bt-footnote">Le squadre sono salvate nel tuo profilo. I Multimon vengono controllati di nuovo prima di caricarli in una partita: ban, sblocchi e regole della stanza restano validi.</p>
  </div>
 </main>;
}
