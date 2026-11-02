import { BATTLE_REPORT_METRICS, battleReportLeaders, battleReportMvp } from '../systems/battleReport.js';

const appearance = {
  rose: 'border-rose-500/35 bg-rose-500/10 text-rose-300',
  orange: 'border-orange-500/35 bg-orange-500/10 text-orange-300',
  yellow: 'border-amber-500/35 bg-amber-500/10 text-amber-300',
  emerald: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300',
  cyan: 'border-cyan-500/35 bg-cyan-500/10 text-cyan-300',
  violet: 'border-violet-500/35 bg-violet-500/10 text-violet-300'
};

function Participant({character,players,large=false}){
  const owner=players?.[character.player]||'Squadra '+character.player;
  return <span className="flex min-w-0 items-center gap-2 text-left">
    {character.img
      ? <img src={character.img} alt="" className={`shrink-0 rounded-full object-cover border border-slate-600 bg-slate-900 ${large?'w-14 h-14':'w-9 h-9'}`} />
      : <span className={`flex shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-400 ${large?'w-14 h-14':'w-9 h-9'}`}>✦</span>}
    <span className="flex min-w-0 flex-col">
      <span className={`font-extrabold text-slate-100 truncate ${large?'text-lg':'text-sm'}`}>{character.name}</span>
      <span className="text-[11px] text-slate-400 truncate">{owner}</span>
    </span>
  </span>;
}

export function BattleReportPanel({report,players}){
  if(!report?.entries || !Object.keys(report.entries).length)return null;
  const mvp=battleReportMvp(report);
  return <section aria-label="Statistiche della battaglia" className="w-full max-w-6xl mx-auto my-8 text-left">
    <div className="mb-4 text-center">
      <div className="text-[11px] font-black uppercase tracking-[0.28em] text-cyan-300">Resoconto dello scontro</div>
      <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">Le statistiche della battaglia</h3>
      <p className="text-sm text-slate-400 mt-1">Dati registrati durante {report.turns} {report.turns===1?'turno':'turni'} · ogni posizione indica un singolo Multimon</p>
    </div>
    {mvp && <div className="mb-5 rounded-2xl border border-amber-400/45 bg-gradient-to-r from-amber-950/75 via-slate-900 to-violet-950/70 p-4 sm:p-6 shadow-[0_0_28px_rgba(251,191,36,0.12)]">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="text-[11px] font-black text-amber-300 tracking-[0.18em] uppercase mb-2">★ MVP della battaglia</div>
          <Participant character={mvp} players={players} large />
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          {[
            ['Danni',mvp.damageDealt],
            ['KO',mvp.kos],
            ['Cure',mvp.healing],
            ['Scudi',mvp.shieldsBroken]
          ].map(([label,value])=><div key={label} className="rounded-lg border border-amber-400/15 bg-black/25 p-2 min-w-[62px] text-center">
            <div className="text-lg font-black text-amber-100 tabular-nums">{value.toLocaleString('it-IT')}</div>
            <div className="text-[10px] uppercase text-amber-200/65 font-bold">{label}</div>
          </div>)}
        </div>
      </div>
      <div className="mt-3 text-xs text-slate-400">MVP calcolato considerando danni, cure, resistenza, KO, scudi distrutti e abilità passive.</div>
    </div>}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
      {BATTLE_REPORT_METRICS.map(metric=>{
        const leaders=battleReportLeaders(report,metric.key);
        return <div key={metric.key} className="rounded-2xl bg-slate-950/65 border border-slate-700/70 p-4 sm:p-5 shadow-lg">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`px-2.5 py-1 text-[11px] font-black uppercase tracking-wider border rounded-lg ${appearance[metric.color]}`}>{metric.label}</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-3">{metric.description}</p>
          {leaders.length ? <div className="space-y-2">
            {leaders.map((c,index)=><div key={c.player+':'+c.idx} className={`flex items-center gap-2 rounded-xl px-2 py-2 border ${index===0?'bg-slate-800/90 border-slate-600/70':'bg-slate-900/65 border-slate-800'}`}>
              <span className={`w-5 text-center font-black text-sm shrink-0 ${index===0?'text-amber-300':'text-slate-500'}`}>{index+1}°</span>
              <div className="min-w-0 flex-1"><Participant character={c} players={players}/></div>
              <div className="shrink-0 text-right">
                <span className="text-base sm:text-xl font-black tabular-nums text-white">{c[metric.key].toLocaleString('it-IT')}</span>
                <span className="block text-[10px] text-slate-500">{metric.unit}</span>
              </div>
            </div>)}
          </div> : <p className="text-sm italic text-slate-500 py-4 text-center">Nessun evento registrato</p>}
        </div>;
      })}
    </div>
    <p className="text-center text-[11px] text-slate-500 mt-4">I danni inflitti conteggiano i PS effettivi persi dal nemico. Gli scudi valgono solo quando vengono completamente infranti.</p>
  </section>;
}
