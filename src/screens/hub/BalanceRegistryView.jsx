import React,{useState} from 'react';
import {BALANCE_MODE_LABELS,balanceRanking} from '../../systems/balanceRegistry.js';
import {onMultimonImageError} from '../../systems/imageFallback.js';

export function BalanceRegistryView({profile,characters=[],items={},onBack}){
 const modes=profile?.balanceRegistry?.modes||{};
 const keys=Object.keys(modes).sort((a,b)=>(BALANCE_MODE_LABELS[a]||a).localeCompare(BALANCE_MODE_LABELS[b]||b,'it'));
 const [selected,setSelected]=useState('all');
 const selectedMode=selected==='all'||!modes[selected]?'all':selected;
 const aggregate=selectedMode==='all'
   ?keys.reduce((all,key)=>{
      const cur=modes[key]||{};
      all.matches+=(cur.matches||0);all.wins+=(cur.wins||0);
      all.totalSeconds+=(cur.totalSeconds||0);all.timedMatches+=(cur.timedMatches||0);
      all.totalTurns+=(cur.totalTurns||0);
      for(const id of ['characters','moves','items','held']){
        all[id]??={};
        for(const [name,value] of Object.entries(cur[id]||{})){
          if(typeof value==='number')all[id][name]=(all[id][name]||0)+value;
          else{
            const prev=all[id][name]||{};
            all[id][name]=Object.fromEntries(
              [...new Set([...Object.keys(prev),...Object.keys(value)])]
                .map(k=>[k,(prev[k]||0)+(value[k]||0)]));
          }
        }
      }
      return all;
   },{matches:0,wins:0,totalSeconds:0,timedMatches:0,totalTurns:0,characters:{},moves:{},items:{},held:{}})
   :modes[selectedMode];
 const byId=Object.fromEntries(characters.map(c=>[c.id,c]));
 const top=balanceRanking(aggregate?.characters,'picks',12);
 const moveTop=balanceRanking(aggregate?.moves,'uses',10);
 const itemTop=balanceRanking(aggregate?.items,'uses',10);
 const heldTop=balanceRanking(aggregate?.held,'matches',10);
 const n=aggregate?.matches||0;
 const pct=(a,b)=>b>0?Math.round(a/b*100)+'%':'—';
 const duration=aggregate?.timedMatches>0?Math.round(aggregate.totalSeconds/aggregate.timedMatches):null;
 return <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
  <div className="mx-auto max-w-6xl space-y-6">
    <header className="rounded-3xl border border-indigo-400/40 bg-gradient-to-r from-indigo-950 via-slate-900 to-cyan-950 p-6">
      <button type="button" onClick={onBack} className="text-cyan-200 underline font-bold text-sm">← Torna al menu</button>
      <h1 className="text-3xl sm:text-5xl font-black mt-3">📊 Registro di Bilanciamento</h1>
      <p className="text-sm text-slate-300 mt-3 max-w-3xl">I dati arrivano dalle partite concluse e dal report reale delle mosse. Sono statistiche personali del tuo profilo, non percentuali globali di tutti i giocatori.</p>
    </header>
    <label className="block rounded-xl bg-slate-900 border border-slate-700 p-3">
      <span className="block font-bold text-sm mb-2">Modalità analizzata</span>
      <select className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-600" value={selectedMode} onChange={e=>setSelected(e.target.value)}>
        <option value="all">Tutte le modalità</option>
        {keys.map(id=><option key={id} value={id}>{BALANCE_MODE_LABELS[id]||id} · {modes[id].matches} partite</option>)}
      </select>
    </label>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[
        ['🎮 Partite concluse',n],
        ['🏆 Vittorie registrate',aggregate?.wins||0],
        ['⏱️ Durata media',duration==null?'Dati non ancora disponibili':Math.floor(duration/60)+'m '+duration%60+'s'],
        ['🔁 Turni medi',n?(aggregate.totalTurns/n).toFixed(1):'—']
      ].map(([label,value])=><div key={label} className="rounded-xl border border-indigo-400/20 bg-slate-900 p-4">
        <p className="text-slate-400 text-xs">{label}</p><strong className="block mt-2 text-xl sm:text-2xl">{value}</strong>
      </div>)}
    </div>
    {!n&&<section className="text-center bg-slate-900 rounded-2xl p-10 border border-slate-700">
      <h2 className="font-black text-xl">Nessuna battaglia completata ancora registrata</h2>
      <p className="text-slate-400 mt-2">Le statistiche cominceranno a riempirsi dopo gli incontri giocati con questo aggiornamento. Non vengono inventate statistiche per battaglie precedenti.</p>
    </section>}
    {!!n&&<>
      <section className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5">
        <h2 className="text-2xl font-black">💎 Multimon più scelti volontariamente</h2>
        <p className="text-sm text-slate-400 mt-2">Le campagne e i personaggi imposti dalle modalità PvE sono esclusi. Percentuale vittorie riferita alle battaglie in cui il Multimon è stato schierato, non ai duelli 1v1 fra personaggi.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {top.map((c,i)=><div key={c.id} className="flex items-center gap-3 bg-slate-950/70 rounded-xl border border-slate-700 p-3">
            <strong className="text-xl text-amber-200 w-7">#{i+1}</strong>
            {byId[c.id]?.img&&<img className="w-14 h-14 object-contain" src={byId[c.id].img} onError={onMultimonImageError} alt=""/>}
            <div><strong className="block">{byId[c.id]?.name||c.id}</strong><small className="text-slate-400">{c.picks} scelte · {pct(c.wins,c.picks)} vittorie</small>
              <small className="block text-cyan-200">{(c.damage||0).toLocaleString('it-IT')} danni · {(c.healed||0).toLocaleString('it-IT')} cure</small></div>
          </div>)}
          {!top.length&&<p className="text-slate-400">Nessuna scelta volontaria registrata per questa modalità.</p>}
        </div>
      </section>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5">
          <h2 className="font-black text-xl">⚔️ Mosse più utilizzate</h2>
          <div className="mt-3 space-y-2">
            {moveTop.map((m,i)=><div key={m.id} className="flex justify-between gap-3 text-sm border-b border-slate-700 py-2">
              <span>{i+1}. {m.id}</span><strong>{m.uses} utilizzi</strong>
            </div>)}
            {!moveTop.length&&<p className="text-slate-400">Nessuna mossa registrata.</p>}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5">
          <h2 className="font-black text-xl">🎒 Strumenti consumabili</h2>
          <p className="text-xs text-slate-400">Mostra utilizzi effettivi e PS recuperati immediatamente; non attribuisce alle cure successive l'effetto di rigenerazioni.</p>
          <div className="mt-3 space-y-2">
            {itemTop.map(x=><div key={x.id} className="flex justify-between gap-3 text-sm border-b border-slate-700 py-2">
              <span>{items[x.id]?.name||x.id}</span><strong>{x.uses} usi · {x.healed||0} PS</strong>
            </div>)}
            {!itemTop.length&&<p className="text-slate-400">Nessun consumabile ancora usato.</p>}
          </div>
        </section>
        <section className="lg:col-span-2 rounded-2xl border border-slate-700 bg-slate-900/80 p-5">
          <h2 className="font-black text-xl">🛡️ Strumenti equipaggiati</h2>
          <p className="text-xs text-slate-400">Tasso di vittoria quando uno strumento era equipaggiato: è una correlazione, non una prova che lo strumento abbia causato la vittoria. Contiamo gli schieramenti.</p>
          <div className="grid md:grid-cols-2 gap-2 mt-4">
            {heldTop.map(x=><div key={x.id} className="rounded-xl bg-slate-950/70 p-3 flex justify-between gap-3">
              <span>{items[x.id]?.name||x.id}</span><strong>{x.matches} presenze · {pct(x.wins,x.matches)}</strong>
            </div>)}
            {!heldTop.length&&<p className="text-slate-400">Nessuno strumento equipaggiato nei dati registrati.</p>}
          </div>
        </section>
      </div>
    </>}
  </div>
 </main>;
}
