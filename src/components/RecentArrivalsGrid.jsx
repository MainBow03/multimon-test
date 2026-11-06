import {recentArrivalCharacters} from '../data/recentArrivals.js';

// Griglia compatta: 10 colonne, al massimo 10 righe (100 personaggi).
// I ritratti non sono miniature da 80 px impilate verticalmente.
// Cliccando o toccando una miniatura si apre il nome completo con PNG grande.
export function RecentArrivalsGrid({characters,TYPE_STYLES={}}){
  const arrivals=recentArrivalCharacters(characters).slice(0,100);
  return (
    <aside className="w-full lg:w-[270px] bg-slate-800/80 backdrop-blur-xl border border-slate-700/50
      rounded-2xl p-3 flex flex-col shadow-[0_0_25px_rgba(0,0,0,0.3)] shrink-0
      self-start max-h-[360px]" aria-label="Nuovi Multimon, dal più recente">
      <div className="flex items-center justify-between gap-2 border-b border-slate-700/70 pb-2 mb-2">
        <h3 className="text-sm font-black text-emerald-300 uppercase tracking-wide">
          ✨ Nuovi Arrivi
        </h3>
        <span className="text-[10px] font-bold text-cyan-200 bg-cyan-900/30 rounded-md px-2 py-0.5">
          {arrivals.length}
        </span>
      </div>
      <p className="text-[10px] text-slate-400 mb-2">Più recenti in alto · tocca un PNG per i dettagli</p>
      <div className="overflow-y-auto overflow-x-visible custom-scrollbar pr-1 pb-1">
        <div className="grid grid-cols-10 gap-1 auto-rows-auto">
          {arrivals.map((char,index)=>(
            <details key={char.id} className="group relative min-w-0">
              <summary title={char.name} aria-label={char.name}
                className={`list-none cursor-pointer rounded border transition-all
                  hover:border-cyan-300 focus-visible:ring-2 focus-visible:ring-cyan-300
                  [&::-webkit-details-marker]:hidden
                  ${index<4?'border-amber-400/75 bg-amber-700/25':'border-slate-600 bg-slate-950/70'}`}>
                <img src={char.img} alt="" loading="lazy"
                  className="block w-full aspect-square object-contain" />
              </summary>
              <div className="absolute z-30 left-1/2 -translate-x-1/2 top-full mt-1 w-44
                rounded-xl border border-emerald-400/70 bg-slate-950 p-2 shadow-2xl
                text-center pointer-events-none">
                <img src={char.img} alt="" className="w-16 h-16 mx-auto object-contain mb-1"/>
                <div className="font-black text-xs text-white leading-tight">{char.name}</div>
                <div className="flex flex-wrap gap-1 justify-center mt-1">
                  {char.types.map(t=>(
                    <span key={t} className={`text-[8px] font-black uppercase rounded px-1 py-0.5
                      ${TYPE_STYLES[t]||'bg-slate-700'}`}>{t}</span>
                  ))}
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </aside>
  );
}
