import React, { useEffect, useMemo, useState } from 'react';
import { CHARACTERS } from '../data/characters.js';
import { FUSION_CHARACTERS } from '../data/fusions.js';
import { MOVES_DB } from '../data/moves.js';
import { ITEMS_DB } from '../data/items.js';
import { NEGATIVE_STATUS_TYPES } from '../systems/newHeldAndPassiveEffects.js';

const NEGATIVE_DESCRIPTIONS = {
  Avvelenato:'Danneggia nel tempo. La durata dipende dalla mossa e dalle abilità che lo applicano.',
  Scottato:'Ustione: causa danni nel tempo; controlla i turni residui del bersaglio.',
  Elettrizzato:'Velocità dimezzata e probabilità del 30% di non riuscire ad agire.',
  Congelato:'A ogni azione può bloccarsi e perdere 3 PS oppure liberarsi dal ghiaccio.',
  Assiderato:'Status da Gelo Definitivo di Elsa: per 2 turni completi la Velocità effettiva è dimezzata (−50%) e tutti i danni inflitti sono ridotti del 30%. Non blocca le azioni. Curabile come status negativo.',
  Addormentato:'Impedisce di attaccare finché il bersaglio non si sveglia. Senza durata specifica si applicano 2–4 turni.',
  Confuso:'Può guarire spontaneamente oppure colpirsi da solo. Il tiro avviene quando prova ad agire.',
  Indebolito:'Riduce del 25% i danni inflitti dalle mosse, salvo eccezioni specifiche.',
  Stordito:'Fa perdere le azioni previste dallo stordimento.',
  Accecato:'Peggiora la precisione del 20%; la durata varia in base alla sorgente.',
  Incantato:'Riduce del 25% i danni inflitti dal bersaglio per la durata applicata.',
  'Anima Distorta':'Alterazione di lunga durata causata da abilità e mosse particolari.',
  Infatuato:'Può impedire di attaccare (50% durante il controllo). La Freccia di Cupido lo applica per 4 turni.',
  Ricarica:'Salta un turno dopo una mossa che richiede ricarica. Lo Spray Neutralizzante può rimuoverlo.',
  Magnetico:'Alterazione speciale: gli effetti precisi dipendono dalla mossa che la causa.',
  'Mossa Disabilitata':'Corpo Funesto di Frillish: 25% di probabilità di bloccare la mossa che lo ha colpito per 3 turni. La mossa resta nel moveset ma non si può scegliere né eseguire; il blocco termina automaticamente e può essere rimosso da uno strumento curativo per gli status negativi.'
};
// Durate ricavate dalle mosse realmente presenti nel database.
const STATUS_DURATIONS = (() => {
  const out = {};
  for (const move of Object.values(MOVES_DB)) {
    for (const effect of [...(move.statusEffects||[]),...(move.statusEffect?[move.statusEffect]:[])]) {
      if (!effect?.type || !Number.isFinite(Number(effect.turns))) continue;
      (out[effect.type] ||= new Set()).add(Number(effect.turns));
    }
  }
  return Object.fromEntries(Object.entries(out).map(([name,turns])=>[name,[...turns].sort((a,b)=>a-b)]));
})();
function statusDurationInfo(name) {
  if (name==='Ricarica') return 'Durata standard: 1 turno';
  if (name==='Infatuato') return 'Freccia di Cupido: 4 turni · altre fonti variabili';
  const values = STATUS_DURATIONS[name];
  return values?.length ? 'Durate delle mosse: '+values.join(', ')+' turni (altre fonti possono variare)'
    : 'Durata variabile: dipende da mossa, abilità o rimozione';
}
const POSITIVES=[
  {name:'Rigenerazione',description:'Recupera PS alla fine del turno. La Pozione Rigenerante cura il 15% dei PS massimi per 4 turni.'},
  {name:'Aumento Attacco',description:'Potenzia i danni delle mosse fisiche in base alla percentuale della mossa o passiva.'},
  {name:'Aumento Difesa',description:'Riduce i danni ricevuti secondo la modifica alla statistica Difesa.'},
  {name:'Aumento Velocità',description:'Permette di agire prima a parità di priorità delle mosse.'},
  {name:'Tailwind',description:'Effetto di squadra, non un aumento permanente della statistica: tutti gli alleati, compresi quelli che entrano dopo, agiscono con Velocità effettiva +30% per 5 turni. Indipendente dal meteo.'},
  {name:'Ombra Rapida',description:'Potenziamento situazionale: controlla la descrizione della mossa che lo applica.'},
  {name:'In_Groppa',description:'Sinergia con Yoshi: il compagno in groppa viene protetto e potenziato.'},
  {name:'Shudoruku',description:'Trasformazione speciale di Ponygon, con effetti definiti dalla mossa.'},
  {name:'Dioemuru',description:'Trasformazione speciale avanzata di Ponygon.'}
];
const PROTECTIONS=[
  {name:'Protetto',description:'Blocca gli attacchi protetti dalla mossa. Le protezioni ripetute possono fallire più spesso.'},
  {name:'Scudo Team',description:'Protezione condivisa tra gli alleati, finché il relativo effetto è attivo.'},
  {name:'Riflesso',description:'Schermo difensivo: tipo e durata dipendono dalla mossa che lo genera.'},
  {name:'Rashield',description:'Schermo speciale: può respingere una parte del danno agli attaccanti.'},
  {name:'Scudo Anti-Magia',description:'Strumento equipaggiato: annulla i malus causati dalle abilità passive degli avversari, non le mosse.'},
  {name:'Scudo Cristallino',description:'Assorbe parte dei danni finché ha resistenza residua.'}
];
const PASSIVE_CONDITIONS={
  on_enter:'All’ingresso in campo (con eventuale limite di utilizzo)',
  on_hp_threshold:'Quando i PS attraversano la soglia prevista',
  first_hit_immunity:'Al primo colpo ricevuto',
  rapid_transmutation:'Primo turno dopo l’ingresso: +1 priorità ad Acciaio e Terra',
  psychological_manipulation:'Dopo un colpo andato a segno: 20% di attivazione',
  critical_immunity:'Sempre attiva: immunità ai brutti colpi',
  aura:'Sempre attiva mentre valgono le condizioni della passiva',
  mount_buff:'Quando un alleato beneficia della montatura',
  first_strike_bonus:'Quando il Multimon agisce prima del bersaglio',
  on_hit:'Quando il Multimon colpisce',
  on_damage:'Quando subisce danni'
};
const TABS=[
  ['negative','🔴','Status negativi'],
  ['positive','🟢','Potenziamenti'],
  ['protect','🛡️','Protezioni'],
  ['passives','✨','Abilità passive'],
  ['weather','🌦️','Meteo e campi'],
  ['priority','⚡','Priorità mosse'],
  ['items','🎒','Strumenti']
];
const normalizeStatus=x=>typeof x==='string'?x:x?.type;
const durationText=turns=>turns!==null && turns!==undefined && Number.isFinite(Number(turns)) ? String(turns)+' turni rimasti' : 'durata non indicata';

export function BattleCodexLauncher({ gameState }) {
  const [open,setOpen]=useState(false);
  const [tab,setTab]=useState('negative');
  const [search,setSearch]=useState('');
  useEffect(()=>{
    if (!open) return;
    const close=e=>{if(e.key==='Escape')setOpen(false);};
    window.addEventListener('keydown',close);
    return()=>window.removeEventListener('keydown',close);
  },[open]);
  const statuses=useMemo(()=>{
    const out=[];
    for(const [player,idxs] of Object.entries(gameState?.field||{}))
      for(const i of idxs||[]){
        const char=gameState?.teams?.[player]?.[i];
        if(!char||char.hp<=0)continue;
        for(const st of char.statuses||[]){
          const name=normalizeStatus(st);
          if(name)out.push({key:player+'-'+i+'-'+name,name,owner:char.name,
            turns:typeof st==='object'?st.turns:null});
        }
      }
    return out;
  },[gameState]);
  const entries=useMemo(()=>{
    switch(tab){
      case 'negative': return NEGATIVE_STATUS_TYPES.map(name=>({name,sub:statusDurationInfo(name),description:NEGATIVE_DESCRIPTIONS[name]||'Alterazione negativa: durata ed effetto specifico dipendono dalla mossa.'}));
      case 'positive':return POSITIVES;
      case 'protect':return PROTECTIONS;
      case 'passives':return [...CHARACTERS,...FUSION_CHARACTERS].filter(c=>c.passive?.name).map(c=>({
        name:c.passive.name, sub:c.name, img:c.img,
        description:c.passive.desc||'Passiva speciale',
        condition:PASSIVE_CONDITIONS[c.passive.type]||
          (c.passive.maxUses?'Uso massimo: '+c.passive.maxUses+' per battaglia':'Condizione descritta nella passiva')
      })).sort((a,b)=>a.sub.localeCompare(b.sub,'it'));
      case 'weather':return [
        {name:'🌧️ Tempesta di Acqua / Pioggia',sub:'Meteo globale · 5 turni',description:'Le mosse Acqua infliggono +25% danni; le mosse Fuoco infliggono −25% danni. Juvia riceve +20 punti percentuali di elusione e Nami attiva Clima Tattico. Sostituisce Neve o Erba Rigogliosa.'},
        {name:'❄️ Tempesta di Neve',sub:'Meteo globale · 5 turni',description:'Alla fine del turno, i Multimon non immuni perdono il 2% dei PS massimi. Tipi Ghiaccio, Roccia e Acciaio immuni. Sostituisce gli altri meteo.'},
        {name:'🌿 Erba Rigogliosa',sub:'Meteo globale · 5 turni',description:'A fine turno ogni Multimon vivo di tipo Erba, alleato o avversario, recupera il 5% dei PS massimi. Le mosse Erba infliggono +20% danni. Sostituisce Pioggia o Neve.'},
        {name:'💨 Tailwind',sub:'Effetto di squadra · 5 turni',description:'Aumenta del 30% la Velocità effettiva di tutta la squadra, inclusi gli alleati che entrano più tardi. Non modifica in modo permanente la Velocità e funziona anche insieme al meteo.'},
        ...Object.values(MOVES_DB).filter(m=>m.rainstormChance||m.snowstormTurns||m.snowstormChance||
          m.zodiacRainTurns||m.lushGrassTurns||m.tailwindTurns).map(m=>({
            name:m.name,
            sub:'Mossa '+m.type+' · '+(m.rainstormChance?'🌧️ Tempesta '+Math.round(m.rainstormChance*100)+'%':
              m.snowstormChance?'❄️ Neve '+Math.round(m.snowstormChance*100)+'%':
              m.snowstormTurns?'❄️ Neve garantita':
              m.zodiacRainTurns?'🌧️ Tempesta garantita':
              m.lushGrassTurns?'🌿 Erba Rigogliosa garantita':'💨 Tailwind garantito'),
            condition:m.rainstormChance||m.snowstormChance?
              'Solo dopo l’uso riuscito · probabilità '+Math.round((m.rainstormChance||m.snowstormChance)*100)+'%':
              'Dopo l’uso riuscito · durata '+(m.snowstormTurns||m.zodiacRainTurns||m.lushGrassTurns||m.tailwindTurns||5)+' turni',
            description:m.desc||'Modifica le condizioni sul campo per la durata indicata.'
          }))
      ];
      case 'priority':return Object.values(MOVES_DB).filter(m=>typeof m.priority==='number'&&m.priority!==0).map(m=>({
        name:m.name,sub:'Tipo '+m.type+' · Priorità '+(m.priority>0?'+':'')+m.priority,
        priority:m.priority,
        description:m.desc||'Viene risolta secondo la priorità indicata.'
      })).sort((a,b)=>b.priority-a.priority||a.name.localeCompare(b.name,'it'));
      case 'items':return Object.values(ITEMS_DB).map(item=>({
        name:item.name,sub:item.type==='held'?'Equipaggiabile · '+(item.gemType||'Tutti i tipi'):'Consumabile nello zaino',
        description:item.desc||'',icon:item.icon
      })).sort((a,b)=>a.name.localeCompare(b.name,'it'));
      default:return [];
    }
  },[tab]);
  const shown=entries.filter(e=>[e.name,e.sub,e.description,e.condition].some(t=>(t||'').toLocaleLowerCase('it').includes(search.toLocaleLowerCase('it'))));
  return <>
    <button type="button" onClick={()=>setOpen(true)} aria-label="Apri enciclopedia della battaglia"
      className="absolute top-[10.5rem] left-4 z-[65] flex items-center gap-2 rounded-xl border border-violet-400/60 bg-black/75 px-3 py-2 text-xs font-black uppercase tracking-wide text-violet-200 shadow-lg backdrop-blur hover:bg-violet-950">
      📖 Enciclopedia
    </button>
    {open && <div role="dialog" aria-modal="true" aria-label="Enciclopedia di battaglia"
      className="fixed inset-0 z-[240] flex items-center justify-center bg-black/90 p-3 sm:p-6"
      onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false);}}>
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-violet-500/60 bg-slate-950 text-white shadow-[0_0_80px_rgba(124,58,237,.25)]">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-violet-500/30 bg-slate-900 p-4 sm:p-5">
          <div><div className="text-xs font-black uppercase tracking-widest text-violet-300">Manuale del Multiverso</div>
            <h2 className="text-2xl font-black">📖 Enciclopedia di battaglia</h2>
            <p className="text-xs text-slate-400">Consultabile senza consumare il turno. Premi ESC per chiudere.</p>
          </div>
          <button type="button" onClick={()=>setOpen(false)}
            className="rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 font-black hover:bg-slate-700" aria-label="Chiudi enciclopedia">✕</button>
        </div>
        <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-slate-800 bg-slate-900/80 p-3 custom-scrollbar">
          {TABS.map(([id,icon,label])=><button type="button" key={id} onClick={()=>{setTab(id);setSearch('');}}
            aria-pressed={tab===id}
            className={'shrink-0 rounded-xl border px-3 py-2 text-xs font-black '+(tab===id?'border-violet-300 bg-violet-600 text-white':'border-slate-700 bg-slate-950 text-slate-300 hover:border-violet-500')}>
            {icon} {label}</button>)}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5 custom-scrollbar">
          {(tab==='negative'||tab==='positive'||tab==='protect')&&statuses.length>0&&
            <div className="mb-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3">
              <h3 className="mb-2 text-xs font-black uppercase tracking-wide text-cyan-200">Effetti attivi ora in campo</h3>
              <div className="flex flex-wrap gap-2">
                {statuses.filter(x=>tab==='negative'?NEGATIVE_STATUS_TYPES.includes(x.name):
                  tab==='protect'?PROTECTIONS.some(p=>p.name===x.name):
                  POSITIVES.some(p=>p.name===x.name)).map(x=>
                    <div key={x.key} className="rounded-lg border border-cyan-500/30 bg-slate-900 px-2 py-1 text-[11px]">
                      <b>{x.owner}</b> · {x.name} · <span className="text-cyan-300">{durationText(x.turns)}</span>
                    </div>)}
                {statuses.every(x=>tab==='negative'?!NEGATIVE_STATUS_TYPES.includes(x.name):
                  tab==='protect'?!PROTECTIONS.some(p=>p.name===x.name):
                  !POSITIVES.some(p=>p.name===x.name))&&
                  <span className="text-xs text-slate-400">Nessun effetto di questa categoria attualmente visibile.</span>}
              </div>
            </div>}
          {tab==='positive'&&<div className="mb-3 rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-3 text-xs text-emerald-100">
            Bilanciamento: i potenziamenti si sommano rispetto alla statistica base, senza moltiplicarsi tra loro. Esempio: due +30% diventano +60% totale, non +69%. Limite cumulativo +100% per Attacco, Difesa e Velocità, compresi i bonus dalle passive. Il limite dei malus ripetuti è −50%. Le trasformazioni Iper e i bonus speciali dei boss seguono regole proprie.
          </div>}
          {tab==='priority'&&<div className="mb-3 rounded-xl border border-amber-600/40 bg-amber-950/20 p-3 text-xs text-amber-100">
            Le mosse con priorità maggiore agiscono prima, anche contro avversari più veloci. A parità di priorità conta la Velocità. Alcune passive, come Trasmutazione Rapida di Alphonse, aggiungono priorità situazionale.
          </div>}
          {tab==='weather'&&<div className="mb-3 rounded-xl border border-lime-500/40 bg-green-950/20 p-3 text-xs text-lime-100">
            {gameState?.battleWeather
              ?'Meteo attuale: '+gameState.battleWeather.type+' · '+gameState.battleWeather.turns+' turni rimasti. '
              :'Nessun meteo attivo. '}
            Tailwind attivi: {Object.entries(gameState?.battleTailwind||{}).filter(([,turns])=>turns>0)
              .map(([role,turns])=>(gameState?.players?.[role]||role)+' ('+turns+' turni)').join(', ')||'nessuno'}.
            Pioggia, Neve ed Erba Rigogliosa si sostituiscono tra loro. Tailwind è indipendente.
          </div>}
          {tab==='items'&&<div className="mb-3 rounded-xl border border-violet-500/30 bg-violet-950/20 p-3 text-xs text-violet-200">
            Equipaggiabili e oggetti da zaino sono separati nelle descrizioni. Alcuni strumenti agiscono automaticamente e altri hanno usi limitati per battaglia.
          </div>}
          <input type="search" value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Cerca per nome, Multimon, condizione o effetto…"
            className="mb-4 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-violet-400" />
          <div className="grid gap-3 sm:grid-cols-2">
            {shown.map((e,i)=><article key={e.name+'-'+e.sub+'-'+i}
              className="rounded-xl border border-slate-700/70 bg-slate-900/80 p-3">
              <div className="flex items-center gap-3">
                {e.img&&<img src={e.img} alt="" loading="lazy" className="h-11 w-11 shrink-0 rounded-lg object-cover" />}
                <div className="min-w-0">
                  <div className="text-sm font-black text-white">{e.icon&&e.icon!=='iperband'?e.icon+' ':''}{e.name}</div>
                  {e.sub&&<div className="mt-0.5 text-[11px] font-semibold text-violet-300">{e.sub}</div>}
                </div>
              </div>
              {e.condition&&<div className="mt-2 rounded-lg bg-slate-950/70 px-2 py-1.5 text-[11px] text-amber-200">Attivazione: {e.condition}</div>}
              <p className="mt-2 text-xs leading-relaxed text-slate-300">{e.description}</p>
            </article>)}
          </div>
          {shown.length===0&&<p className="py-10 text-center text-slate-400">Nessuna voce trovata.</p>}
        </div>
        <footer className="shrink-0 border-t border-slate-800 bg-slate-900/80 p-3 text-center text-[11px] text-slate-400">
          Le durate effettive possono variare tra mosse, abilità e modalità. Il valore mostrato in campo fa riferimento allo stato attuale.
        </footer>
      </div>
    </div>}
  </>;
}
