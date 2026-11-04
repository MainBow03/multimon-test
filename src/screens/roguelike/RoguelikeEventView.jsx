import React from 'react';
import {ROGUE_RELICS,ROGUE_EVENTS,getRogueEvent,canChooseRogueEvent,coopEventPath,trainingUsesLeft} from '../../systems/roguelikeEvents.js';

// Pannello condiviso: in solitaria conferma una scelta, in co-op registra un voto.
export function RoguelikeEventView({event,coins=0,relics=[],trainingUses=0,onChoice,votes=null,players={},humanRoles=[],playerRole=null,busy=false}) {
  const data=getRogueEvent(event);
  if (!data) return null;
  const isCoop=Boolean(votes);
  const branched=isCoop&&Boolean(event.altType);
  const choices=branched?['pathA','pathB'].map((id,i)=>{
    const type=i===0?event.type:event.altType;
    const scene=ROGUE_EVENTS[type];
    const chosen=coopEventPath(event,id,coins,relics,trainingUses);
    const action=scene.choices.find(x=>x.id===chosen.choiceId);
    return {id,name:scene.name,desc:scene.story+' '+action.desc,icon:scene.icon,grantsRelic:chosen.choiceId==='relic'};
  }):data.choices.filter(choice=>!(event.type==='trainer'&&choice.id==='power'&&!trainingUsesLeft(trainingUses)));
  const ownVote=isCoop ? votes[playerRole] : undefined;
  const count=humanRoles.filter(p => votes && votes[p]).length;
  const acquired=event.relicId ? ROGUE_RELICS[event.relicId] : null;
  return <section className="w-full max-w-4xl mx-auto rounded-3xl border border-violet-400/40 bg-slate-900/95 p-5 sm:p-8 shadow-2xl text-white">
    <div className="text-center">
      <p className="text-xs font-black uppercase tracking-[.2em] text-fuchsia-300">✨ Incontro casuale · Piano {event.floor}</p>
      <p className="text-5xl mt-3" aria-hidden="true">{branched?'🌌':data.icon}</p>
      <h2 className="text-3xl sm:text-4xl font-black mt-2">{branched?'Due sentieri, una decisione':data.name}</h2>
      <p className="mt-4 text-slate-300">{branched?'Scegliete insieme quale incontro affrontare. Ogni sentiero ha una ricompensa e un rischio differenti.':data.story}</p>
      {(event.type==='trainer'||event.altType==='trainer') && <p className="mt-3 text-xs font-bold text-amber-200">
        Allenamenti offensivi usati: {Math.min(3,Math.max(0,Number(trainingUses)||0))}/3 {trainingUsesLeft(trainingUses)===0?'· bonus offensivo esaurito':''}
      </p>}
      {isCoop && <p className="mt-3 font-bold text-cyan-200">Votazione di squadra: {count}/{humanRoles.length} voti</p>}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-7">
      {choices.map(choice=>{
        const selected=isCoop && ownVote===choice.id;
        const enabled=canChooseRogueEvent(event,choice.id,coins,relics,trainingUses);
        const voted=isCoop ? humanRoles.filter(p=>votes[p]===choice.id) : [];
        return <button key={choice.id} type="button" disabled={busy||!enabled}
          onClick={()=>onChoice(choice.id)}
          className={'text-left rounded-2xl border-2 p-5 transition-all hover:-translate-y-1 disabled:opacity-40 disabled:cursor-not-allowed '+
            (selected?'border-emerald-400 bg-emerald-950/40':'border-violet-600/50 bg-slate-800/70 hover:border-fuchsia-400')}>
          <h3 className="text-lg font-black text-white">{choice.icon && <span className="mr-2">{choice.icon}</span>}{choice.name} {selected && '✓'}</h3>
          <p className="mt-2 text-sm text-slate-300">{choice.desc}</p>
          {(choice.id==='relic'||choice.grantsRelic) && <p className="mt-2 text-sm text-amber-200">
            {acquired&&!relics.includes(event.relicId)?'Reliquia possibile: '+acquired.name:'Hai già tutte le reliquie: ricompensa alternativa in monete'}
          </p>}
          {!enabled&&<p className="mt-2 text-xs text-rose-300">Monete insufficienti</p>}
          {isCoop&&<p className="mt-3 text-xs text-cyan-200">
            {voted.length ? voted.map(p=>players[p]||p).join(', ') : 'Nessun voto'}
          </p>}
        </button>;
      })}
    </div>
    {isCoop&&<p className="text-center text-xs text-slate-400 mt-5">Puoi cambiare voto finché tutti non hanno votato. In caso di parità prevale il voto dell’host.</p>}
  </section>;
}
