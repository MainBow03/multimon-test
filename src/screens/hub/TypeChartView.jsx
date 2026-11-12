import {typeDisplayName} from '../../systems/typeLabel.js';
// Schermata estratta senza alterare la struttura JSX originale.
export function renderTypeChartView(ctx) {
const { ArrowLeft, TYPES, TYPE_CHART, TYPE_STYLES, appMode, setAppMode } = ctx;
if (appMode === 'type_chart') {
        return (
            <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black pointer-events-none opacity-60"></div>
                <div className="relative z-10 flex flex-col h-full max-w-7xl mx-auto w-full">
                    <div className="flex justify-between items-center mb-6">
                        <button onClick={() => setAppMode('menu')} className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors font-bold bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-700/50">
                            <ArrowLeft size={20} /> Menu
                        </button>
                        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 hidden sm:block">Tabella Efficacia Tipi</h2>
                        <div className="w-[100px] hidden sm:block"></div>
                    </div>

                    <div className="flex flex-wrap gap-4 justify-center mb-6 text-sm font-bold bg-slate-900/60 p-3 rounded-2xl border border-slate-700/50 backdrop-blur-md">
                        <span className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded border border-green-400"></div> 2x (Superefficace)</span>
                        <span className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500 rounded border border-red-400"></div> ½x (Poco efficace)</span>
                        <span className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-700 rounded border border-gray-500"></div> 0x (Nessun effetto)</span>
                    </div>

                    <div className="flex-1 overflow-auto custom-scrollbar border border-slate-700/50 rounded-2xl bg-slate-900/80 backdrop-blur-md shadow-2xl relative">
                        <table className="w-full text-center border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-3 border-b-2 border-r-2 border-slate-700 bg-slate-950 sticky top-0 left-0 z-30 shadow-sm min-w-[120px]">
                                        <div className="text-xs text-slate-400 text-right pr-2">Difensore ➔</div>
                                        <div className="text-xs text-slate-400 text-left pl-2 mt-1">Attaccante ⬇</div>
                                    </th>
                                    {TYPES.map(t => (
                                        <th key={t} className="p-2 border-b-2 border-slate-700 sticky top-0 bg-slate-950 z-20 w-12 sm:w-16 shadow-sm">
                                            <div className="flex justify-center h-24 items-end pb-2">
                                                <span className={`text-[10px] font-black px-1.5 py-1 rounded uppercase tracking-wider ${TYPE_STYLES[t] || 'bg-gray-500'} transform -rotate-180 whitespace-nowrap`} style={{ writingMode: 'vertical-rl' }}>
                                                    {typeDisplayName(t)}
                                                </span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {TYPES.map(atkType => (
                                    <tr key={atkType} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="p-2 border-b border-r-2 border-slate-700 bg-slate-900 sticky left-0 z-10 font-bold min-w-[120px] text-right pr-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <span className="text-slate-300">{typeDisplayName(atkType)}</span>
                                                <span className={`w-3 h-3 rounded-full ${TYPE_STYLES[atkType]?.split(' ')[0] || 'bg-gray-500'}`}></span>
                                            </div>
                                        </td>
                                        {TYPES.map(defType => {
                                            const mult = TYPE_CHART[atkType]?.[defType];
                                            let content = "1";
                                            let cellClass = "p-2 border-b border-slate-700/50";
                                            
                                            if (mult === 2) {
                                                content = "2";
                                                cellClass += " bg-green-900/30 text-green-400 font-black shadow-[inset_0_0_8px_rgba(34,197,94,0.2)]";
                                            } else if (mult === 0.5) {
                                                content = "½";
                                                cellClass += " bg-red-900/30 text-red-400 font-bold";
                                            } else if (mult === 0) {
                                                content = "0";
                                                cellClass += " bg-gray-900/50 text-gray-500";
                                            } else {
                                                cellClass += " text-slate-600 font-medium text-[10px]";
                                            }

                                            return (
                                                <td key={defType} className={cellClass}>
                                                    {content}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}
