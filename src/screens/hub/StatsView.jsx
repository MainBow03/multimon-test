import { masteryLevel, masteryProgress, masteryRank, masteryTitle, isMasteryUnlocked, equippedMasteryTitle, isMasteryEligible, MASTERY_REWARDS } from '../../systems/masterySystem.js';
import {careerTopThree} from '../../systems/careerStats.js';
import {onMultimonImageError} from '../../systems/imageFallback.js';
// La padronanza è visibile nel profilo, con titoli puramente estetici.
export function renderStatsView(ctx) {
const { ArrowLeft, Swords, Target, Trophy, Users, CHARACTERS, FUSION_CHARACTERS, appMode,
  getPlayerData, playerName, setAppMode, masterySearch, setMasterySearch, masteryFilter,
  setMasteryFilter, updateLocalStats } = ctx;
if (appMode === 'stats' || appMode === 'mastery') {
        const stats = getPlayerData();

        const allCharacters=[...CHARACTERS,...FUSION_CHARACTERS];
        const byId=Object.fromEntries(allCharacters.map(c=>[c.id,c]));
        const charNames=Object.fromEntries(allCharacters.map(c=>[c.id,c.name]));
        // Il podio rappresenta le scelte volontarie: campagna esclusa.
        const chosenCharacters=stats.chosenChars||{};
        const topCharacters=careerTopThree(chosenCharacters,charNames);
        const topMoves=careerTopThree(stats.moves);
        const characterCounts=Object.entries(chosenCharacters).filter(([,n])=>Number(n)>0);
        const moveCounts=Object.entries(stats.moves||{}).filter(([,n])=>Number(n)>0);
        const totalCharacterUses=characterCounts.reduce((n,[,v])=>n+(Number(v)||0),0);
        const favoriteCharacter=topCharacters[0]||null;
        const favoriteMove=topMoves[0]||null;
        const Medal=({rank})=><span className="text-xl" aria-label={rank+'° posto'}>{['🥇','🥈','🥉'][rank-1]}</span>;
        const Podium=({items,kind,total})=>{
          const ordered=[items[1],items[0],items[2]];
          return <div className="grid grid-cols-3 gap-2 items-end" role="list" aria-label={kind==='char'?'Podio Multimon più usati':'Podio mosse più usate'}>
            {ordered.map((item,index)=>{
              const rank=[2,1,3][index];
              const character=kind==='char'?byId[item?.id]:null;
              return <div key={item?.id||'empty-'+rank} role="listitem"
                className={`min-w-0 rounded-xl border ${rank===1?'border-amber-400/60 bg-amber-950/25 pb-5':'border-slate-700 bg-slate-900/70 pb-3'} px-2 pt-3 text-center`}>
                <div className="mb-2 flex justify-center"><Medal rank={rank}/></div>
                {item&&kind==='char'&&character?.img?
                  <img src={character.img} alt={item.name} loading="lazy" onError={onMultimonImageError}
                    className="w-14 h-14 sm:w-16 sm:h-16 object-contain mx-auto mb-2 rounded-lg bg-black/20"/>:
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-800/70 mx-auto mb-2 rounded-lg flex items-center justify-center">
                    {kind==='move'?<Swords size={30} className="text-rose-300"/>:<Users size={27} className="text-slate-500"/>}
                  </div>}
                <div className="text-xs sm:text-sm font-black text-slate-100 break-words leading-tight min-h-8"
                  title={item?.name||'Nessun utilizzo'}>{item?.name||'—'}</div>
                <div className={`mt-2 text-lg font-black ${rank===1?'text-amber-300':'text-cyan-200'}`}>{item?.count||0}</div>
                <div className="text-[10px] text-slate-400">{kind==='char'?'battaglie':'utilizzi'}</div>
                <div className="text-[10px] text-slate-500 mt-1">{item&&total>0?Math.round(item.count/total*100)+'% del totale':''}</div>
              </div>;
            })}
          </div>;
        };
        const formatTime = (secs) => {
            if (secs < 60) return `${secs} secondi`;
            const m = Math.floor(secs / 60);
            const h = Math.floor(m / 60);
            if (h > 0) return `${h}h ${m % 60}m`;
            return `${m}m ${secs % 60}s`;
        };

        const winRate = stats.matches > 0 ? Math.round((stats.wins / stats.matches) * 100) : 0;
        const defeats=Math.max(0,(stats.matches||0)-(stats.wins||0));
        const chosenDifferent=characterCounts.length;
        const usedDifferent=Object.entries(stats.chars||{}).filter(([,uses])=>Number(uses)>0).length;
        const totalMoves=moveCounts.reduce((n,[,v])=>n+(Number(v)||0),0);
        const averageTime=stats.matches>0?Math.round((stats.playtime||0)/stats.matches):0;
        const roster = CHARACTERS.filter(isMasteryEligible);
        const currentTitle = equippedMasteryTitle(stats, roster);
        const completed = roster.filter(char => isMasteryUnlocked(stats, char.id)).length;
        const filteredRoster = roster
          .filter(char => [char.name, masteryTitle(char)].some(value => value.toLocaleLowerCase('it').includes((masterySearch || '').toLocaleLowerCase('it'))))
          .filter(char => masteryFilter === 'completed' ? isMasteryUnlocked(stats, char.id)
            : masteryFilter === 'played' ? (stats.mastery?.[char.id] || 0) > 0 : true)
          .sort((a,b) => (stats.mastery?.[b.id] || 0) - (stats.mastery?.[a.id] || 0)
            || a.name.localeCompare(b.name, 'it'));

        return (
            <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black pointer-events-none opacity-60"></div>
                
                <div className="relative z-10 w-full max-w-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
                    <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
                        <button onClick={() => setAppMode('menu')} className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors font-bold bg-slate-950/50 px-4 py-2 rounded-xl border border-slate-700/50">
                            <ArrowLeft size={20} /> Menu
                        </button>
                        <div className="flex-1 text-center min-w-0">
                            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{appMode==='mastery'?'✦ Prestigi e Padronanza':'Statistiche di '+(playerName || 'Giocatore')}</h2>
                            {appMode==='mastery' && currentTitle && <div className="text-amber-300 font-black tracking-wide text-sm mt-1">✦ {currentTitle} ✦</div>}
                        </div>
                    </div>

                    {appMode==='stats'&&<><div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Panoramica */}
                        <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 shadow-inner">
                            <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2"><Trophy size={16} className="text-yellow-500"/> Carriera</h3>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-end border-b border-slate-800/50 pb-2">
                                    <span className="text-slate-300 font-medium">Partite Giocate</span>
                                    <span className="text-2xl font-black text-white">{stats.matches}</span>
                                </div>
                                <div className="flex justify-between items-end border-b border-slate-800/50 pb-2">
                                    <span className="text-slate-300 font-medium">Vittorie</span>
                                    <span className="text-2xl font-black text-emerald-400">{stats.wins}</span>
                                </div>
                                <div className="flex justify-between items-end border-b border-slate-800/50 pb-2">
                                    <span className="text-slate-300 font-medium">Win Rate</span>
                                    <span className="text-2xl font-black text-blue-400">{winRate}%</span>
                                </div>
                                <div className="flex justify-between items-end border-b border-slate-800/50 pb-2">
                                    <span className="text-slate-300 font-medium">Record Sopravvivenza</span>
                                    <span className="text-2xl font-black text-violet-400">{stats.maxSurvivalRound || 0}</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-slate-300 font-medium">Tempo in Battaglia</span>
                                    <span className="text-xl font-bold text-amber-400">{formatTime(stats.playtime)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Podi: contatori persistenti e classifiche storiche. */}
                        <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-inner min-w-0">
                            <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2"><Users size={16} className="text-cyan-400"/> Podio Multimon preferiti</h3>
                            <p className="text-xs text-slate-400 mb-3">Conta soltanto le battaglie in cui scegli tu i personaggi. Le campagne sono escluse.</p>
                            <Podium items={topCharacters} kind="char" total={totalCharacterUses}/>
                            <div className="mt-3 flex justify-between text-xs text-slate-400">
                                <span>Schieramenti liberi registrati</span><strong className="text-cyan-200">{totalCharacterUses}</strong>
                            </div>
                        </div>
                        <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-inner min-w-0">
                            <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2"><Swords size={16} className="text-rose-400"/> Podio mosse più utilizzate</h3>
                            <Podium items={topMoves} kind="move" total={totalMoves}/>
                            <div className="mt-3 flex justify-between text-xs text-slate-400">
                                <span>Mosse registrate</span><strong className="text-rose-200">{totalMoves}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7" aria-label="Statistiche aggiuntive">
                      {[
                        {label:'Sconfitte',value:defeats,icon:'🛡️',color:'text-rose-300'},
                        {label:'Multimon provati (tutte le modalità)',value:usedDifferent,icon:'🧬',color:'text-cyan-300'},
                        {label:'Mosse eseguite',value:totalMoves,icon:'⚡',color:'text-violet-300'},
                        {label:'Tempo medio / partita',value:formatTime(averageTime),icon:'⌛',color:'text-amber-300'}
                      ].map(item=><div key={item.label} className="rounded-2xl bg-slate-950/75 border border-slate-700/80 p-4">
                        <div className="text-xs text-slate-400 font-bold">{item.icon} {item.label}</div>
                        <div className={`font-black text-xl md:text-2xl mt-2 ${item.color}`}>{item.value}</div>
                      </div>)}
                    </div>
                    {appMode==='stats'&&<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                      <details className="rounded-xl bg-slate-950/70 border border-slate-700 p-4">
                        <summary className="cursor-pointer text-sm font-bold text-cyan-200">📊 Classifica Multimon scelti (senza campagne)</summary>
                        <div className="max-h-64 overflow-y-auto mt-3 space-y-2">
                          {Object.entries(chosenCharacters).filter(([,n])=>Number(n)>0)
                            .sort((a,b)=>Number(b[1])-Number(a[1])||String(charNames[a[0]]||a[0]).localeCompare(String(charNames[b[0]]||b[0]),'it'))
                            .map(([id,uses],i)=><div key={id} className="flex justify-between gap-3 text-sm border-b border-slate-800 pb-1">
                              <span className="truncate text-slate-300">{i+1}. {charNames[id]||id}</span>
                              <strong className="text-cyan-200 shrink-0">{uses}</strong>
                            </div>)}
                          {chosenDifferent===0&&<p className="text-sm text-slate-500">Non risultano ancora utilizzi nelle modalità libere. Le battaglie delle campagne non influenzano questo podio.</p>}
                        </div>
                      </details>
                      <details className="rounded-xl bg-slate-950/70 border border-slate-700 p-4">
                        <summary className="cursor-pointer text-sm font-bold text-rose-200">⚡ Classifica completa delle mosse</summary>
                        <div className="max-h-64 overflow-y-auto mt-3 space-y-2">
                          {Object.entries(stats.moves||{}).filter(([,n])=>Number(n)>0)
                            .sort((a,b)=>Number(b[1])-Number(a[1])||a[0].localeCompare(b[0],'it'))
                            .map(([name,uses],i)=><div key={name} className="flex justify-between gap-3 text-sm border-b border-slate-800 pb-1">
                              <span className="truncate text-slate-300">{i+1}. {name}</span>
                              <strong className="text-rose-200 shrink-0">{uses}</strong>
                            </div>)}
                          {moveCounts.length===0&&<p className="text-sm text-slate-500">Nessuna mossa registrata.</p>}
                        </div>
                      </details>
                      <div className="md:col-span-2 rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-xs text-slate-400">
                        Il podio Multimon conta soltanto le scelte effettuate nelle modalità libere, non nelle campagne.
                        I vecchi utilizzi non-campagna vengono recuperati quando il registro della battaglia indica la modalità; quelli misti non identificabili sono esclusi per non falsare i preferiti.
                        La classifica delle mosse rimane generale e include anche le campagne. Nessuna statistica storica viene cancellata.
                      </div>
                    </div>}
                    <button type="button" onClick={()=>setAppMode('mastery')}
                      className="w-full mb-5 rounded-2xl bg-violet-950/35 border border-violet-500/50 hover:bg-violet-800/30 px-4 py-3 text-sm font-bold text-violet-200">
                      🏅 Gestisci Prestigi, Padronanza e titoli in una sezione separata →
                    </button></>}
                    {appMode==='mastery'&&<section className="border-t border-violet-500/30 pt-6 space-y-4">
                        <div className="flex flex-wrap gap-3 justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-black text-violet-300">✦ Padronanza Multimon</h3>
                                <p className="text-slate-400 text-sm mt-1">20 livelli per ogni Multimon · +40 PE per battaglia giocata, +20 PE per la vittoria.</p>
                                <p className="text-slate-500 text-xs mt-1">Solo i Multimon normali: mostri campagna, evocazioni e fusioni sono esclusi. Ogni 5 livelli sblocchi effetti d’ingresso cumulativi. Nessun bonus alle statistiche.</p>
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                  {MASTERY_REWARDS.map(r=><span key={r.level} title={r.description} className="rounded-lg border border-violet-500/40 bg-violet-950/40 px-2 py-1 text-[11px] text-violet-200">{r.icon} Liv. {r.level}: {r.name}</span>)}
                                </div>
                            </div>
                            <span className="text-amber-300 font-bold bg-amber-950/30 border border-amber-600/40 px-3 py-2 rounded-xl">{completed} titoli sbloccati</span>
                        </div>

                        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4">
                            <div className="font-black text-amber-300 text-sm mb-2">Titolo sotto il tuo nome</div>
                            <p className="text-white font-semibold">{currentTitle || 'Nessun titolo equipaggiato'}</p>
                            {stats.equippedMasteryTitle !== null &&
                              <button className="mt-2 text-xs text-amber-200 hover:text-white underline"
                                onClick={() => updateLocalStats({equipMasteryTitle:null})}>Nascondi titolo</button>}
                            <p className="text-slate-400 text-xs mt-2">Ogni Multimon ha un titolo personale legato alla sua identità: sbloccalo al livello 20 e premi «Indossa».</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <input type="search" placeholder="Cerca Multimon o titolo..." value={masterySearch}
                              onChange={e => setMasterySearch(e.target.value)}
                              className="flex-1 min-w-[170px] rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-violet-400" />
                            <select value={masteryFilter} onChange={e => setMasteryFilter(e.target.value)}
                              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                              aria-label="Filtra padronanze">
                              <option value="all">Tutti</option><option value="played">Già utilizzati</option><option value="completed">Livello 20</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
                          {filteredRoster.length === 0 && <p className="col-span-full text-sm text-slate-400 py-4 text-center">Nessun Multimon trovato.</p>}
                          {filteredRoster.map(char => {
                            const xp = stats.mastery?.[char.id] || 0;
                            const progress = masteryProgress(xp);
                            const unlocked = isMasteryUnlocked(stats, char.id);
                            const equipped = stats.equippedMasteryTitle === char.id && unlocked;
                            return (
                              <div key={char.id} className={`rounded-xl border p-3 bg-slate-950/70 ${unlocked?'border-amber-500/60':'border-slate-700/60'}`}>
                                <div className="flex items-center gap-3">
                                  <img src={char.img} alt={char.name} loading="lazy" className="w-14 h-14 rounded-full object-cover border-2 border-violet-500/50 shrink-0"/>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-bold text-white text-sm truncate">{char.name}</div>
                                    <div className="text-xs font-semibold text-violet-300">Livello {progress.level}/20 · {masteryRank(progress.level)}</div>
                                    <div className="text-[11px] text-slate-400">{unlocked?'Padronanza massima':`${progress.inLevel}/${progress.required} PE al prossimo livello`}</div>
                                    <div className="text-[10px] text-cyan-300 mt-1">{progress.level>=20?'★ Entrata Leggendaria':progress.level>=15?'✧ Scia del Maestro':progress.level>=10?'◈ Aura dell’Esperto':progress.level>=5?'✦ Ingresso Stellare':'Effetto successivo al livello 5'}</div>
                                  </div>
                                </div>
                                <div className="h-2 rounded-full bg-slate-800 overflow-hidden mt-3">
                                  <div className={`h-full rounded-full ${unlocked?'bg-amber-400':'bg-violet-500'}`} style={{width:`${progress.percent}%`}} />
                                </div>
                                <div className="flex items-center justify-between gap-2 mt-3">
                                  <span className={`text-xs min-w-0 break-words leading-snug ${unlocked?'text-amber-300':'text-slate-500'}`}
                                    title={masteryTitle(char)}>{unlocked?'✦ '+masteryTitle(char):'🔒 Titolo: '+masteryTitle(char)}</span>
                                  {unlocked && <button onClick={() => updateLocalStats({equipMasteryTitle:char.id})}
                                    disabled={equipped} className="shrink-0 rounded-lg bg-amber-600/25 border border-amber-400/50 text-amber-200 font-bold text-xs px-3 py-1.5 disabled:opacity-50">
                                    {equipped?'Indossato':'Indossa'}
                                  </button>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                    </section>}
                    {appMode==='mastery'&&<button type="button" onClick={()=>setAppMode('stats')}
                      className="mt-5 text-sm font-black text-cyan-300 hover:text-cyan-200 underline">📊 Vai alle statistiche della carriera</button>}

                    <p className="text-center text-slate-500 text-xs mt-4">
                        I dati vengono salvati localmente su questo browser associandoli al profilo globale.
                    </p>
                </div>
            </div>
        );
    }
}
