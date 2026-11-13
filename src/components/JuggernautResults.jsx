import {JUGGERNAUT_PHASE_NAMES} from '../systems/juggernautSystem.js';

// Classifiche specifiche del raid PvP: il danno al boss esclude le sue evocazioni.
export function JuggernautResults({gameState}){
  if(gameState?.gameMode!=='juggernaut')return null;
  const bossRole=gameState.settings?.juggernautPlayer||'p1';
  const boss=gameState.teams?.[bossRole]?.[0];
  const report=gameState.battleReport||{};
  const synergy=gameState.juggSynergy||{};
  const entries=Object.values(report.entries||{});
  const roles=Object.keys(gameState.players||{}).filter(role=>role!==bossRole && gameState.players[role] && gameState.teams?.[role]?.length);
  const competitors=roles.map(role=>{
    const rows=entries.filter(c=>c.player===role);
    return {role,name:gameState.players[role],damage:synergy.bossDamageByPlayer?.[role]||0,
      shields:rows.reduce((sum,c)=>sum+(c.shieldsBroken||0),0),
      healing:rows.reduce((sum,c)=>sum+(c.healing||0),0),
      kos:rows.reduce((sum,c)=>sum+(c.kos||0),0)};
  }).sort((a,b)=>b.damage-a.damage || b.shields-a.shields || b.healing-a.healing);
  const mvp=[...competitors].sort((a,b)=>
    (b.damage+b.shields*80+b.healing*.45+b.kos*60)-
    (a.damage+a.shields*80+a.healing*.45+a.kos*60))[0];
  const turns=Math.max(0,report.turns||0);
  return <section aria-label="Statistiche Juggernaut" className="w-full max-w-6xl mx-auto rounded-3xl border border-rose-400/40 bg-gradient-to-br from-rose-950/80 via-slate-950 to-indigo-950/70 p-4 sm:p-6 my-6 text-left shadow-[0_0_35px_rgba(244,63,94,0.12)]">
    <div className="text-center mb-5">
      <h3 className="text-2xl sm:text-3xl font-black text-amber-300">👑 Resoconto Juggernaut</h3>
      <p className="text-slate-300 text-sm mt-1">Il boss {gameState.players[bossRole]||bossRole} ha resistito {turns} {turns===1?'turno':'turni'} · Fase massima {boss?.juggPhase||1}/4 ({JUGGERNAUT_PHASE_NAMES[(boss?.juggPhase||1)-1]})</p>
      <p className="text-cyan-300 text-xs mt-2">🤝 {synergy.coordinatedTurns||0} turni coordinati · {synergy.activations||0} sinergie attivate</p>
    </div>
    {mvp&&<div className="rounded-2xl border border-amber-400/45 bg-amber-900/15 text-center p-3 mb-4">
      <div className="text-xs uppercase tracking-widest text-amber-300 font-black">★ MVP degli sfidanti</div>
      <div className="font-black text-xl text-white">{mvp.name}</div>
      <div className="text-xs text-slate-300">{mvp.damage.toLocaleString('it-IT')} danni al boss · {mvp.shields} scudi infranti · {mvp.healing} PS curati</div>
    </div>}
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead><tr className="text-[10px] sm:text-xs text-cyan-300 border-b border-slate-700">
          <th className="p-2">Sfidante</th><th className="p-2 text-right">Danni al boss</th>
          <th className="p-2 text-right">Scudi distrutti</th><th className="p-2 text-right">Cure</th><th className="p-2 text-right">KO</th>
        </tr></thead>
        <tbody>{competitors.map((c,i)=><tr key={c.role} className="border-b border-slate-800/70">
          <td className="p-2 font-black text-white">{i+1}° · {c.name}</td>
          <td className="p-2 text-right tabular-nums">{c.damage.toLocaleString('it-IT')}</td>
          <td className="p-2 text-right tabular-nums">{c.shields}</td>
          <td className="p-2 text-right tabular-nums">{c.healing.toLocaleString('it-IT')}</td>
          <td className="p-2 text-right tabular-nums">{c.kos}</td>
        </tr>)}</tbody>
      </table>
    </div>
    <p className="text-[11px] text-slate-400 mt-3">I danni al boss considerano soltanto i PS effettivamente sottratti al Juggernaut, non quelli delle evocazioni. MVP determinato da danni, cure, KO e scudi.</p>
  </section>;
}
