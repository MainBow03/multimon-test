import { ItemArtwork } from '../../components/ItemArtwork.jsx';
// Schermata estratta senza alterare la struttura JSX originale.
export function renderShopView(ctx) {
const { ArrowLeft, BookOpen, CHARACTERS, Coins, IS_PREVIEW, ITEMS_DB, Lock, ShoppingCart, TYPE_STYLES, Unlock, Users, appMode, gameState, getPlayerData, setAppMode, setGameState, setShopCharSearch, setShopTab, setSystemAlert, shopCharSearch, shopTab, updateLocalStats } = ctx;
if (appMode === 'shop') {
        const playerData = getPlayerData();
        
        const handleBuyItem = (itemDef) => {
            if (playerData.coins >= itemDef.price) {
                updateLocalStats({ spendCoins: itemDef.price, buyItem: itemDef.id });
                // Forza un re-render cambiando un po' lo stato locale, o basterà il prossimo ciclo
                setGameState({...gameState}); 
            } else {
                setSystemAlert("Non hai abbastanza monete!");
            }
        };

        const handleBuyChar = (char) => {
            // --- LOGICA REGALO DELLA BETA ---
            if (!playerData.freeUnlockUsed) {
                updateLocalStats({ unlockChar: char.id, useFreeUnlock: true });
                setGameState({...gameState}); 
                setSystemAlert(`🎁 Hai sbloccato ${char.name} gratuitamente come Regalo della Beta!`);
            } else if (playerData.coins >= char.price) {
                updateLocalStats({ spendCoins: char.price, unlockChar: char.id });
                setGameState({...gameState}); 
            } else {
                setSystemAlert("Non hai abbastanza monete!");
            }
        };

        return (
            <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/40 via-slate-950 to-black pointer-events-none opacity-60"></div>
                
                <div className="relative z-10 w-full max-w-5xl bg-slate-900/80 backdrop-blur-xl border border-amber-700/50 rounded-3xl p-8 shadow-2xl flex flex-col max-h-[90vh]">
                    <div className="flex justify-between items-center mb-6 border-b border-amber-800/50 pb-6 shrink-0">
                        <button onClick={() => setAppMode('menu')} className="flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors font-bold bg-slate-950/50 px-4 py-2 rounded-xl border border-slate-700/50">
                            <ArrowLeft size={20} /> Menu
                        </button>
                        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 text-center flex-1 flex items-center justify-center gap-3">
                            <ShoppingCart size={32} className="text-amber-500" /> Negozio
                        </h2>
                        <div className="flex items-center gap-2 bg-black/50 px-5 py-2 rounded-full border border-amber-500/50">
                            <Coins size={24} className="text-yellow-400" />
                            <span className="font-black text-xl text-yellow-400">{playerData.coins}</span>
                        </div>
                    </div>

                    <div className="flex gap-4 mb-6 shrink-0">
                         <button onClick={() => setShopTab('items')} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${shopTab === 'items' ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg border border-amber-500' : 'bg-slate-950/50 text-slate-400 border border-slate-700 hover:bg-slate-800'}`}><BookOpen size={20}/> Oggetti e Cure</button>
                         <button onClick={() => setShopTab('chars')} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${shopTab === 'chars' ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg border border-amber-500' : 'bg-slate-950/50 text-slate-400 border border-slate-700 hover:bg-slate-800'}`}><Users size={20}/> Personaggi Sbloccabili</button>
                    </div>

                    {shopTab === 'items' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar p-2">
                            {Object.values(ITEMS_DB).map(item => {
                                const owned = playerData.inventory[item.id] || 0;
                                const canAfford = playerData.coins >= item.price;
                                
                                return (
                                    <div key={item.id} className="bg-slate-950/80 border border-slate-700 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-500/50 transition-colors group shadow-lg relative">
                                        <div className="absolute top-3 right-3 bg-slate-800 text-xs font-bold px-2 py-1 rounded text-slate-400 border border-slate-600">
                                            Posseduti: {owned}
                                        </div>
                                        <div>
                                            <div className="mb-3 mt-2 flex justify-center">{item.type === 'held' ? <ItemArtwork id={item.id} size={68} /> : <span className="text-4xl">{item.icon}</span>}</div>
                                            <h3 className="text-lg font-black text-white mb-1">{item.name}</h3>
                                            <p className="text-xs text-slate-400 h-10 leading-tight">{item.desc}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleBuyItem(item)}
                                            disabled={!canAfford}
                                            className={`mt-4 w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${canAfford ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg hover:-translate-y-0.5' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}`}
                                        >
                                            Compra - <Coins size={16}/> {item.price}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {shopTab === 'chars' && (
                        <>
                            {/* --- BANNER REGALO DELLA BETA --- */}
                            {!playerData.freeUnlockUsed && (
                                <div className="mb-4 shrink-0 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl border border-emerald-400 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-pulse">
                                    <span className="text-3xl drop-shadow-md">🎁</span>
                                    <div className="text-left">
                                        <div className="font-black text-white text-lg drop-shadow-sm">Regalo della Beta!</div>
                                        <div className="text-xs text-emerald-100 font-medium">Sblocca il tuo primo personaggio in modo completamente GRATUITO!</div>
                                    </div>
                                </div>
                            )}

                            <div className="mb-4 shrink-0 px-2">
                                <input
                                    type="text"
                                    placeholder="🔍 Cerca personaggio da sbloccare..."
                                    value={shopCharSearch}
                                    onChange={e => setShopCharSearch(e.target.value)}
                                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all placeholder-slate-500 shadow-inner"
                                />
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto custom-scrollbar p-2">
                                {CHARACTERS.filter(c => c.price && !c.isSummonOnly && c.name.toLowerCase().includes(shopCharSearch.toLowerCase())).sort((a,b) => a.price - b.price).map(char => {
                                    const isUnlocked = IS_PREVIEW || playerData.unlockedChars.includes(char.id);
                                    const hasFreeUnlock = !playerData.freeUnlockUsed; // <-- CONTROLLO SBLOCCO
                                    const canAfford = hasFreeUnlock || playerData.coins >= char.price;
                                    
                                    return (
                                        <div key={char.id} className={`bg-slate-950/80 border ${isUnlocked ? 'border-emerald-500/50' : 'border-slate-700'} rounded-2xl p-4 flex flex-col justify-between transition-colors shadow-lg relative hover:-translate-y-1`}>
                                            <img src={char.img} alt={char.name} className={`w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 ${isUnlocked ? 'border-emerald-500/50' : 'border-slate-600/50'} transition-all`} />
                                            <h4 className="font-bold text-center text-sm mb-2 text-slate-100">{char.name}</h4>
                                            <div className="flex flex-wrap gap-1 justify-center mb-4">
                                                {char.types.map(t => (
                                                    <span key={t} className={`text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm uppercase ${TYPE_STYLES[t] || 'bg-gray-500'}`}>{t}</span>
                                                ))}
                                            </div>

                                        {isUnlocked ? (
                                            <button disabled className="w-full py-2 rounded-xl font-bold flex items-center justify-center gap-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs cursor-default">
                                                <Unlock size={14}/> Sbloccato
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleBuyChar(char)}
                                                disabled={!canAfford}
                                                className={`w-full py-2 rounded-xl font-bold flex items-center justify-center gap-1 transition-all text-xs ${hasFreeUnlock ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.6)] border border-emerald-300' : (canAfford ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700')}`}
                                            >
                                                {hasFreeUnlock ? (
                                                    <>🎁 Sblocca Gratis</>
                                                ) : (
                                                    <><Lock size={14}/> {char.price} <Coins size={12}/></>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }
}
