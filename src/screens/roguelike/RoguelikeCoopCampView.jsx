import React,{useState,useEffect} from 'react';
import {BattleReportPanel} from '../../components/BattleReportPanel.jsx';
import {COOP_HUMANS,COOP_SHOP,coopHumanPlayers,coopRecruitWeights,
  coopRecruitChance,COOP_MAX_FLOOR} from '../../systems/coopExpedition.js';
import {CHARACTERS} from '../../data/characters.js';
import {RoguelikeEventView} from './RoguelikeEventView.jsx';
import {ROGUE_RELICS} from '../../systems/roguelikeEvents.js';

export function RoguelikeCoopCampView({room,playerRole,canLead,onClaimWin,onNext,onPurchase,onVoteEvent,onFinalizeEvent,onExit}){
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [clock,setClock]=useState(()=>Date.now());
 // Il countdown avanza anche se nessun altro giocatore produce snapshot Firestore.
 // Non affidarsi a render casuali: altrimenti il pulsante di recupero non appare.
 useEffect(()=>{
   if(room.status!=='coop_event')return;
   setClock(Date.now());
   const timer=setInterval(()=>setClock(Date.now()),1000);
   return ()=>clearInterval(timer);
 },[room.status,room.phaseStartedAt]);
 const run=room.coopRun||{};
 const humans=coopHumanPlayers(room),isWin=room.winner&&room.winner!==room.players?.p4&&room.winner!=='Pareggio';
 const stage=room.status,isVictory=stage==='gameover'&&isWin;
 const failed=stage==='gameover'&&!isWin;
 const completed=stage==='coop_complete';
 const runAction=async fn=>{
  if(busy)return;
  setBusy(true);setError('');
  try{await fn()}catch(e){setError(e.message||'Operazione non riuscita.')}
  finally{setBusy(false)}
 };
 return <main className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,#332256_0%,#100d24_48%,#020617_100%)] text-white px-3 py-6 sm:p-8">
  <div className="mx-auto max-w-6xl space-y-5">
   <header className="rounded-3xl border border-fuchsia-400/35 bg-slate-950/70 p-5 sm:p-7">
    <div className="flex items-center justify-between gap-3 flex-wrap">
     <div>
      <p className="text-xs font-black tracking-[.2em] text-fuchsia-300 uppercase">Roguelike Co-op · Spedizione condivisa</p>
      <h1 className="mt-2 text-3xl sm:text-5xl font-black text-white">
       {completed?'🏆 Spedizione completata!':failed?'💔 Spedizione fallita':isVictory?'🎉 Avversario sconfitto!':stage==='coop_event'?'✨ Bivio del destino':'🏕️ Accampamento'}
      </h1>
      <p className="mt-2 text-slate-300">{completed?'Avete superato tutti e 50 i piani!':failed?'Tutti i vostri Multimon sono caduti.':isVictory?
       'Congratulazioni! Il bottino della squadra è pronto.':stage==='coop_event'?'Ogni giocatore vota la scelta della spedizione.':'Organizzate le squadre, curate i compagni e preparatevi alla prossima lotta.'}</p>
     </div>
     <div className="rounded-2xl border border-amber-400/50 bg-amber-950/20 px-5 py-3 text-center">
      <p className="text-amber-200 text-xs font-black">PIANO</p>
      <p className="text-3xl font-black">{Math.min(run.floor||1,COOP_MAX_FLOOR)}<span className="text-base text-slate-400">/{COOP_MAX_FLOOR}</span></p>
     </div>
    </div>
    <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold">
     <span className="rounded-full border border-amber-500/40 bg-amber-950/30 px-4 py-2 text-amber-200">🪙 {run.coins||0} monete condivise</span>
     <span className="rounded-full border border-purple-500/40 bg-purple-950/30 px-4 py-2 text-purple-200">✨ Reclutamento prossimo: {Math.round(coopRecruitChance(run)*100)}%</span>
     <span className="rounded-full border border-cyan-500/40 bg-cyan-950/30 px-4 py-2 text-cyan-200">👥 {humans.length}/3 partecipanti</span>
    </div>
   </header>

   {(run.relics||[]).length>0&&<section className="rounded-2xl border border-indigo-400/35 bg-indigo-950/30 p-4">
     <h2 className="font-black text-violet-200 mb-2">✨ Reliquie condivise</h2>
     <div className="flex flex-wrap gap-2">{run.relics.map(id=>ROGUE_RELICS[id]&&<div key={id}
       className="text-xs max-w-[240px] rounded-xl bg-slate-900 border border-indigo-500/40 px-3 py-2">
         <p className="font-black">{ROGUE_RELICS[id].icon} {ROGUE_RELICS[id].name}</p>
         <p className="text-slate-300 mt-1">{ROGUE_RELICS[id].desc}</p>
       </div>)}</div>
   </section>}

   {(run.nextBattlePower||1)>1&&<p className="rounded-xl border border-amber-500/30 bg-amber-950/30 p-3 text-amber-200 text-sm">🥋 Allenamento offensivo: +20% danni nella prossima battaglia!</p>}
   {stage==='coop_event'&&run.pendingEvent&&<RoguelikeEventView
     event={run.pendingEvent} coins={run.coins||0} relics={run.relics||[]}
     votes={run.eventVotes||{}} players={room.players} humanRoles={humans}
     playerRole={playerRole} busy={busy}
     onChoice={choice=>runAction(()=>onVoteEvent(choice))}/>}
   {stage==='coop_event'&&canLead&&
     <div className="text-center text-slate-300 text-sm">
       {clock-(room.phaseStartedAt||clock)>=75000?
         <button disabled={busy} type="button" onClick={()=>runAction(onFinalizeEvent)}
           className="rounded-xl px-5 py-3 font-black bg-fuchsia-700 hover:bg-fuchsia-600 disabled:opacity-40">
           Chiudi votazione (giocatore assente)</button>:
         <p>Il capogruppo potrà sbloccare la votazione tra {Math.max(0,Math.ceil((75000-(clock-(room.phaseStartedAt||clock)))/1000))} secondi se qualcuno non risponde.</p>}
     </div>}
   {(stage==='coop_camp'||completed)&&run.lastEventResult&&<p className="rounded-xl bg-emerald-950/30 border border-emerald-500/30 p-4 text-emerald-200 text-sm">
     ✨ {run.lastEventResult}
   </p>}

   {(stage==='coop_camp'||completed)&&run.lastClearFloor&&
    <section className="rounded-2xl border border-emerald-400/30 bg-emerald-950/20 px-5 py-4">
     <h2 className="font-black text-emerald-200">Piano {run.lastClearFloor} superato! +{run.lastCoins||0} monete</h2>
     {run.lastRecruit?
      <p className="mt-2 text-amber-200 font-semibold">🎉 Reclutamento! {run.lastRecruit.name} si unisce alla squadra di {room.players[run.lastRecruit.owner]}.</p>:
      <p className="mt-2 text-sm text-slate-300">Nessun reclutamento questa volta. La probabilità aumenta del 2% finché non reclutate qualcuno.</p>}
     {run.lastClearFloor%5===0&&<p className="mt-2 text-sm text-teal-300">⛺ Riposo: i Multimon ancora vivi hanno recuperato il 40% dei PS.</p>}
    </section>}

   <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {humans.map(p=>{
     const own=p===playerRole;const roster=(room.teams?.[p]||[]).filter(c=>!c.isSummonOnly);
     return <article key={p} className={'rounded-2xl border bg-slate-900/80 p-4 '+(own?'border-amber-400/70':'border-slate-700')}>
      <div className="mb-3 flex items-center justify-between">
       <h2 className="font-black text-lg text-white">{room.players[p]} {own&&<span className="text-xs text-amber-200">(Tu)</span>}</h2>
       <span className="text-xs text-slate-400">{roster.length}/8 Multimon</span>
      </div>
      <div className="space-y-2">
       {roster.map((char,i)=>{
        const hp=Math.max(0,char.hp),max=Math.max(1,char.maxHp),alive=hp>0;
        return <div key={char.id+'-'+i} className="flex gap-3 items-center rounded-xl border border-slate-700/70 bg-slate-950/80 p-2">
         <img src={char.img} alt="" className={'h-12 w-12 shrink-0 rounded-full object-cover border '+(alive?'border-fuchsia-400':'border-rose-700 grayscale')}/>
         <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-black">{char.name}</p>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-700"><div className={'h-full '+(alive?'bg-emerald-400':'bg-rose-700')}
            style={{width:Math.max(0,Math.min(100,hp/max*100))+'%'}}/></div>
          <p className="mt-0.5 text-[11px] text-slate-300">{hp}/{max} PS</p>
         </div>
         {stage==='coop_camp'&&<button type="button" disabled={busy||(!alive && (run.coins||0)<50)||(alive&&(hp===max||(run.coins||0)<20))}
          onClick={()=>runAction(()=>onPurchase(alive?'heal':'revive',p,i))}
          className="shrink-0 rounded-lg bg-fuchsia-700 px-2 py-2 text-[10px] font-black text-white hover:bg-fuchsia-600 disabled:opacity-30">
          {alive?'Cura 20🪙':'Rianima 50🪙'}</button>}
        </div>
       })}
      </div>
     </article>
    })}
   </section>

   {stage==='coop_camp'&&<section className="rounded-2xl border border-cyan-400/30 bg-slate-900/80 p-5">
    <h2 className="text-xl font-black text-cyan-200">🏕️ Servizi dell'accampamento</h2>
    <p className="mt-1 text-sm text-slate-300">Le monete sono condivise. Puoi curare un Multimon di qualsiasi compagno; ogni acquisto è sincronizzato per tutti.</p>
    <button type="button" disabled={busy||(run.coins||0)<90}
      onClick={()=>runAction(()=>onPurchase('full',playerRole,0))}
      className="mt-3 rounded-xl bg-cyan-700 px-5 py-3 text-sm font-black hover:bg-cyan-600 disabled:opacity-40">
      💚 Cura completamente tutti i Multimon vivi · 90 monete</button>
    <div className="mt-4 rounded-xl border border-violet-500/20 bg-slate-950/60 p-3 text-xs text-slate-300">
     <p className="font-black text-violet-200">Assegnazione delle reclute</p>
     <p className="mt-1">La scelta del proprietario è casuale, ma favorisce chi ha una squadra più piccola. Nessuno può superare 8 Multimon.</p>
     <div className="mt-2 flex flex-wrap gap-2">
      {(()=>{const weighted=coopRecruitWeights(room),total=weighted.reduce((x,a)=>x+a.weight,0);
       return weighted.map(w=><span key={w.player} className="rounded-lg bg-indigo-950 px-2 py-1">
        {room.players[w.player]}: {Math.round(w.weight/total*100)}% ({w.count} Multimon)
       </span>);})()}
     </div>
    </div>
   </section>}

   {isVictory&&<BattleReportPanel report={room.battleReport} players={room.players}/>}
   {error&&<p role="alert" className="rounded-xl border border-rose-500/70 bg-rose-950/40 p-3 text-rose-200">{error}</p>}
   <div className="flex flex-wrap justify-center gap-3 pb-8">
    {isVictory&&(canLead?
      <button disabled={busy} onClick={()=>runAction(onClaimWin)}
        className="rounded-2xl bg-emerald-600 px-8 py-4 font-black text-lg hover:bg-emerald-500 disabled:opacity-50">🎁 Raccogli le ricompense di squadra</button>:
      <p className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-slate-300">In attesa che l'host raccolga le ricompense…</p>)}
    {stage==='coop_camp'&&(canLead?
      <button disabled={busy} onClick={()=>runAction(onNext)}
       className="rounded-2xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-8 py-4 font-black text-lg hover:brightness-110 disabled:opacity-50">
       ⚔️ Affronta il piano {run.floor||1}</button>:
      <p className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-slate-300">In attesa dell'host per il prossimo piano…</p>)}
    {(failed||completed)&&<button onClick={onExit} className="rounded-2xl bg-slate-700 px-8 py-4 font-black hover:bg-slate-600">Torna al menu</button>}
   </div>
  </div>
 </main>;
}
