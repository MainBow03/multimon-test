import React, { useEffect, useMemo, useState } from 'react';
import { ItemArtwork } from '../../components/ItemArtwork.jsx';
import { activeEventFighters } from '../../systems/multiverseEventEngine.js';
import { TYPE_STYLES, getMultiplier } from '../../systems/typeSystem.js';

const plain = 'rounded-xl border border-slate-600/70 bg-slate-900/85 px-3 py-2 text-xs font-black transition hover:bg-slate-700';
const action = 'rounded-xl border border-cyan-400/60 bg-gradient-to-br from-cyan-700 to-blue-900 px-5 py-3 font-black text-white shadow-[0_0_18px_rgba(34,211,238,.25)] disabled:opacity-40';

function SideRoster({ units, activeKeys, accent }) {
  return <div className="flex flex-wrap justify-center gap-1.5 rounded-2xl border border-slate-700/80 bg-slate-950/75 p-2">
    {units.map(u => <div key={u.key} title={u.name + ' · ' + u.hp + '/' + u.maxHp + ' PS'}
      className={`relative h-9 w-9 sm:h-11 sm:w-11 rounded-full border-2 overflow-hidden bg-slate-800 ${activeKeys.has(u.key) ? accent : 'border-slate-600/50'} ${u.hp<=0?'grayscale opacity-30':''}`}>
      <img src={u.img} alt={u.name} className="h-full w-full object-contain" loading="lazy"/>
      <div className="absolute bottom-0 inset-x-0 h-1 bg-black"><div className={`h-full ${u.hp/u.maxHp>.45?'bg-emerald-400':'bg-rose-500'}`} style={{width:`${Math.max(0,u.hp/u.maxHp*100)}%`}}/></div>
    </div>)}
  </div>;
}

function BattleSprite({ unit, selected, clickable, onClick, enemy, turn }) {
  const pct = Math.max(0, Math.min(100, (unit.hp / Math.max(1,unit.maxHp))*100));
  return <button type="button" onClick={onClick} disabled={!clickable}
    className={`group relative flex flex-col items-center min-w-0 w-[116px] sm:w-[150px] lg:w-[190px] transition-transform ${selected?'scale-[1.06] z-20':'z-10'} ${clickable?'cursor-crosshair hover:scale-105':'cursor-default'}`}
    aria-label={unit.name+' '+unit.hp+' di '+unit.maxHp+' punti salute'}>
    <div className={`w-full rounded-xl border px-2 py-1.5 backdrop-blur-md shadow-lg ${selected?'border-amber-300 bg-amber-950/80 ring-2 ring-amber-400':'border-white/20 bg-slate-950/85'}`}>
      <div className="flex justify-between gap-1 items-center"><span className="text-xs sm:text-sm font-black truncate">{unit.name}</span><span className="text-[9px] sm:text-[10px] tabular-nums font-bold text-slate-200">{unit.hp}/{unit.maxHp}</span></div>
      <div className="h-2 bg-black/70 rounded-full mt-1 overflow-hidden"><div className={`h-full transition-all duration-700 ${pct>50?'bg-emerald-400':pct>25?'bg-amber-400':'bg-rose-500'}`} style={{width:`${pct}%`}}/></div>
      <div className="flex justify-center gap-1 mt-1">
        {(unit.types||[]).map(t=><span key={t} className={`text-[8px] px-1.5 rounded-full ${TYPE_STYLES[t]||'bg-slate-700'}`}>{t}</span>)}
      </div>
    </div>
    <div className="relative h-[118px] sm:h-[170px] lg:h-[215px] w-full flex items-end justify-center">
      <div className={`absolute bottom-0 inset-x-3 h-6 rounded-[100%] blur-sm ${enemy?'bg-rose-500/35':'bg-cyan-400/35'}`}/>
      <img src={unit.img} alt="" draggable={false}
        className={`relative h-[110px] sm:h-[160px] lg:h-[205px] max-w-full w-full object-contain drop-shadow-[0_12px_12px_rgba(0,0,0,.95)] transition-all duration-500 ${unit.hp===0?'grayscale opacity-30 scale-75': 'animate-[battle-entrance_.45s_ease-out]'} ${unit.isHyper?'drop-shadow-[0_0_20px_rgba(251,191,36,.85)]':''} ${unit.transformed?'hue-rotate-[260deg] drop-shadow-[0_0_18px_rgba(217,70,239,.9)]':''}`}/>
      {unit.isHyper && <span className="absolute top-1 right-1 bg-amber-400 text-black font-black rounded-full text-[9px] px-1.5 py-0.5">IPER</span>}
      {unit.heldItem==='iperband'&&<div className="absolute bottom-8 right-0 rounded-full border border-violet-300/70 bg-slate-950/90 p-0.5"><ItemArtwork id="iperband" size={25}/></div>}
      {selected&&<span className="absolute -top-2 bg-amber-400 text-black rounded-lg px-2 py-1 font-black text-[10px] animate-bounce">BERSAGLIO</span>}
    </div>
    <div className="min-h-6 flex justify-center gap-1 flex-wrap max-w-full">
      {(unit.statuses||[]).slice(0,3).map((s,i)=><span key={i} className="text-[9px] bg-fuchsia-800/90 border border-fuchsia-400/40 rounded-md px-1.5">{typeof s==='string'?s:s.type}</span>)}
    </div>
  </button>;
}

export function EventClassicBattleView({battle,settings,participants,currentUid,perspective,setPerspective,moveDraft,setMoveDraft,submit,busy,hostForce,isHost}) {
  const [selectedActor,setSelectedActor]=useState(null);
  const [logOpen,setLogOpen]=useState(false);
  const [announcement,setAnnouncement]=useState('');
  const enemySide=perspective==='A'?'B':'A';
  const myTurn=!battle.finished&&battle.members[battle.side].includes(currentUid);
  const ownActive=activeEventFighters(battle,battle.side,settings).filter(u=>u.owner===currentUid);
  const chosen=ownActive.find(u=>u.key===selectedActor)||ownActive[0];
  const targets=activeEventFighters(battle,battle.side==='A'?'B':'A',settings);
  const opponents=activeEventFighters(battle,enemySide,settings);
  const friends=activeEventFighters(battle,perspective,settings);
  const activeKeysA=new Set(activeEventFighters(battle,'A',settings).map(u=>u.key));
  const activeKeysB=new Set(activeEventFighters(battle,'B',settings).map(u=>u.key));
  const allOrdered=perspective==='A'?[['B',opponents],['A',friends]]:[['A',opponents],['B',friends]];
  const sideNames={
    A: battle.members.A.map(uid=>participants.find(p=>p.uid===uid)?.name||uid.slice(0,8)).join(' & '),
    B: battle.members.B.map(uid=>participants.find(p=>p.uid===uid)?.name||uid.slice(0,8)).join(' & ')
  };
  useEffect(()=>{
    setAnnouncement(battle.log?.at(-1)||'Combattimento in corso!');
    const t=setTimeout(()=>setAnnouncement(''),2300);
    return()=>clearTimeout(t);
  },[battle.turn,battle.log?.length,battle.matchId]);
  const setMove=(unit,key,value)=>setMoveDraft(old=>({...old,[unit]:{...(old[unit]||{}),[key]:value}}));
  const selectTarget=key=>{
    if(!myTurn||!chosen)return;
    setMove(chosen.key,'target',key);
  };
  const send=()=>{
    const moves=ownActive.map(unit=>({
      actor:unit.key,
      moveIndex:Number(moveDraft[unit.key]?.moveIndex||0),
      target:moveDraft[unit.key]?.target||targets[0]?.key||null,
      hyper:!!moveDraft[unit.key]?.hyper
    }));
    if(moves.length)submit(moves);
  };
  const isSpectator=!battle.members.A.includes(currentUid)&&!battle.members.B.includes(currentUid);
  return <section className="space-y-3 text-white" aria-label="Arena classica del Torneo del Multiverso">
    <div className="flex flex-wrap gap-2 justify-between items-center rounded-2xl border border-violet-400/35 bg-slate-950/90 px-3 py-3">
      <div><div className="text-xs font-bold tracking-[.2em] text-fuchsia-300">TORNEO DEL MULTIVERSO · BATTAGLIA CLASSICA</div>
        <div className="font-black text-lg sm:text-xl">Round {battle.turn} · {battle.finished?'Scontro concluso':`Tocca a ${sideNames[battle.side]}`}</div></div>
      <div className="flex flex-wrap gap-2">
        <button className={perspective==='A'?'rounded-xl px-3 py-2 bg-cyan-700 font-black text-sm':plain} onClick={()=>setPerspective('A')}>Vista squadra A</button>
        <button className={perspective==='B'?'rounded-xl px-3 py-2 bg-rose-700 font-black text-sm':plain} onClick={()=>setPerspective('B')}>Vista squadra B</button>
        <button className={plain} onClick={()=>setLogOpen(x=>!x)}>{logOpen?'Nascondi':'Mostra'} registro</button>
      </div>
    </div>
    <div className="relative overflow-hidden rounded-[26px] border-2 border-cyan-500/40 bg-slate-950 shadow-[0_0_38px_rgba(34,211,238,.10)] min-h-[530px]">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_40%,rgba(14,165,233,.15),transparent_65%),linear-gradient(180deg,#122142_0%,#1b2545_52%,#12172d_53%,#0a1223_100%)]"/>
      <div className="absolute left-[-20%] bottom-[9%] w-[140%] h-[28%] rounded-[100%] border-4 border-cyan-300/15 bg-cyan-600/10 pointer-events-none"/>
      <div className="absolute left-[10%] right-[10%] top-[51%] h-[1px] bg-white/15 pointer-events-none"/>
      {announcement&&<div className="absolute z-40 top-[43%] inset-x-3 pointer-events-none text-center">
        <span className="inline-block max-w-2xl rounded-2xl border border-amber-400/60 bg-black/85 px-4 py-2 text-base sm:text-xl font-black text-amber-300 shadow-2xl animate-pulse">{announcement}</span>
      </div>}
      <div className="relative flex flex-col gap-3 justify-between min-h-[530px] p-3 sm:p-5">
        {allOrdered.map(([side,active],row)=>{
          const enemy=row===0;
          const roster=battle.squads[side];
          const activeSet=side==='A'?activeKeysA:activeKeysB;
          const clickable=myTurn&&side===(battle.side==='A'?'B':'A');
          return <div key={side} className={`relative w-full ${enemy?'self-end':'self-start'}`}>
            <div className="flex flex-wrap gap-2 justify-between items-center rounded-xl bg-black/40 px-3 py-1.5">
              <div className={`font-black uppercase text-xs sm:text-sm ${enemy?'text-rose-300':'text-cyan-300'}`}>{enemy?'AVVERSARI':'SQUADRA IN PRIMO PIANO'} · {sideNames[side]}</div>
              <div className="text-[10px] text-slate-300">{roster.filter(x=>x.hp>0).length}/{roster.length} disponibili</div>
            </div>
            <div className="flex justify-center items-end gap-1 sm:gap-3 min-h-[205px] sm:min-h-[255px] overflow-x-auto overflow-y-hidden">
              {active.map(unit=><BattleSprite key={unit.key} unit={unit} enemy={enemy}
                selected={clickable&&moveDraft[chosen?.key]?.target===unit.key}
                clickable={clickable} onClick={()=>selectTarget(unit.key)} turn={battle.turn}/>)}
            </div>
            <SideRoster units={roster} activeKeys={activeSet} accent={enemy?'border-rose-400':'border-cyan-400'}/>
          </div>;
        })}
      </div>
    </div>
    {myTurn&&ownActive.length>0&&!battle.finished&&<div className="rounded-2xl bg-slate-950/95 border border-cyan-500/40 p-3 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><div>
        <div className="font-black text-xl text-cyan-300">Cosa deve fare {chosen?.name}?</div>
        <div className="text-xs text-slate-400">Seleziona una mossa e tocca un avversario sul campo. Comanda tutti i Multimon attivi prima di confermare.</div>
      </div><div className="text-xs text-amber-300 font-black">{ownActive.length} Multimon da comandare</div></div>
      <div className="flex flex-wrap gap-2">
        {ownActive.map(unit=><button key={unit.key} onClick={()=>setSelectedActor(unit.key)}
          className={`flex items-center gap-2 rounded-xl border px-2 py-1.5 ${chosen?.key===unit.key?'border-cyan-300 bg-cyan-800':'border-slate-700 bg-slate-900'}`}>
          <img src={unit.img} alt="" className="h-10 w-10 object-contain rounded-lg"/><span className="text-xs font-bold">{unit.name}{moveDraft[unit.key]?.moveIndex!==undefined?' ✓':''}</span>
        </button>)}
      </div>
      {chosen&&<div className="grid grid-cols-2 gap-2 sm:gap-3">
        {chosen.moves.map((move,i)=>{
          const chosenMove=Number(moveDraft[chosen.key]?.moveIndex||0)===i;
          const mult=targets.length?getMultiplier(move.type,targets[0].types):1;
          return <button key={i} disabled={move.remainingUses===0} onClick={()=>setMove(chosen.key,'moveIndex',i)}
            className={`relative text-left rounded-xl border-2 p-3 sm:p-4 transition-all disabled:opacity-30 ${chosenMove?'border-cyan-300 bg-cyan-900/70 shadow-[0_0_12px_rgba(34,211,238,.35)]':'border-slate-700 bg-slate-900 hover:border-slate-500'}`}>
            <span className="font-black text-sm sm:text-base block">{move.name}</span>
            <span className={`inline-block text-[10px] px-2 rounded-full mt-1 ${TYPE_STYLES[move.type]||'bg-slate-700'}`}>{move.type}</span>
            <span className="block text-xs mt-1 text-slate-300">Potenza: {move.power||'—'} · Precisione: {move.accuracy<=1?Math.round(move.accuracy*100):move.accuracy}%</span>
            {move.remainingUses!==null&&<span className="block text-[10px] text-amber-300 mt-1">Utilizzi rimasti: {move.remainingUses}</span>}
            {chosenMove&&<span className="absolute right-2 top-2 text-cyan-300 font-black">✓</span>}
          </button>;
        })}
      </div>}
      {settings.allowHyper&&chosen&&!battle.hyperUsed[currentUid]&&<label className="flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-950/30 p-3 font-black text-sm text-amber-300">
        <input type="checkbox" checked={!!moveDraft[chosen.key]?.hyper} onChange={e=>setMove(chosen.key,'hyper',e.target.checked)}/>
        Attiva la forma IPER di {chosen.name} (una per incontro)
      </label>}
      <button className={`w-full ${action}`} onClick={send} disabled={busy||!targets.length}>⚔️ CONFERMA MOSSE E ATTACCA</button>
    </div>}
    {(!myTurn||isSpectator)&&!battle.finished&&<div className="text-center text-sm text-slate-300 bg-slate-900/80 rounded-xl border border-slate-700 px-4 py-3">
      {isSpectator?'👁️ MODALITÀ SPETTATORE · Cambia prospettiva per seguire i due sfidanti.':'In attesa del turno avversario…'}
    </div>}
    {battle.finished&&<div className="rounded-2xl border border-amber-400/50 bg-amber-950/40 p-6 text-center text-2xl font-black text-amber-300">🏆 Vince {sideNames[battle.winningSide]||'la squadra vincitrice'}!</div>}
    {isHost&&!battle.finished&&<button className={plain} disabled={busy} onClick={hostForce}>Host: risolvi turno se un giocatore non risponde</button>}
    {logOpen&&<div className="rounded-2xl border border-slate-700 bg-slate-950 p-4 max-h-56 overflow-y-auto">
      <div className="text-cyan-300 font-black text-sm mb-2">REGISTRO DELLA BATTAGLIA</div>
      {battle.log.slice(-22).reverse().map((line,i)=><div key={i} className="py-1.5 text-xs text-slate-300 border-b border-slate-800">{line}</div>)}
    </div>}
  </section>;
}
