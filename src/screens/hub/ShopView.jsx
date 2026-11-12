import {typeDisplayName} from '../../systems/typeLabel.js';
import { ItemArtwork } from '../../components/ItemArtwork.jsx';
import {ULTIMON_ENTRANCE_EFFECTS,ULTIMON_ENTRANCE_PRICE,ownedUltimonEntrances}
  from '../../systems/ultimonCosmetics.js';
import {VICTORY_EFFECTS,VICTORY_EFFECT_PRICE,ownedVictoryEffects,equippedVictoryEffect}
 from '../../systems/victoryCosmetics.js';
import {multimonKeyBalance,MULTIMON_WELCOME_KEYS} from '../../systems/multimonKeys.js';
// Schermata estratta senza alterare la struttura JSX originale.
export function renderShopView(ctx) {
const { ArrowLeft, BookOpen, CHARACTERS, Coins, IS_PREVIEW, ITEMS_DB, Lock, ShoppingCart, TYPE_STYLES, Unlock, Users, appMode, gameState, getPlayerData, setAppMode, setGameState, setShopCharSearch, setShopTab, setShopCosmeticTab, setSystemAlert, setVictoryPreview, shopCharSearch, shopTab, shopCosmeticTab, updateLocalStats } = ctx;
if (appMode === 'shop') {
        const playerData = getPlayerData();
        const multimonKeys=multimonKeyBalance(playerData);
        
        const handleBuyItem = (itemDef) => {
            if(itemDef.type==='held' && (playerData.inventory?.[itemDef.id]||0)>0){
                setSystemAlert('Hai già sbloccato questo strumento per sempre!');
                return;
            }
            if (playerData.coins >= itemDef.price) {
                updateLocalStats({ spendCoins: itemDef.price, buyItem: itemDef.id });
                // Forza un re-render cambiando un po' lo stato locale, o basterà il prossimo ciclo
                setGameState({...gameState}); 
            } else {
                setSystemAlert("Non hai abbastanza monete!");
            }
        };

        const handleBuyEntrance = effect => {
            const result=updateLocalStats({buyUltimonEntrance:effect.id});
            if(!result?.ok){
                setSystemAlert(result?.reason||'Impossibile acquistare questo cosmetico.');
                return;
            }
            // Lo stato del profilo si aggiorna dal salvataggio persistente.
            setGameState(current=>({...current}));
            setSystemAlert('✨ Hai sbloccato '+effect.name+'! È tuo per sempre.');
        };
        const ownedEntrances=new Set(ownedUltimonEntrances(playerData));
        const ownedVictories=new Set(ownedVictoryEffects(playerData));
        const equippedVictory=equippedVictoryEffect(playerData);
        const handleBuyVictory=effect=>{
            const result=updateLocalStats({buyVictoryEffect:effect.id});
            if(!result?.ok){setSystemAlert(result?.reason||'Acquisto non riuscito.');return;}
            setGameState(prev=>({...prev}));
            setSystemAlert('🏆 '+effect.name+' acquistata!'+(!equippedVictory?' È già equipaggiata.':' Ora puoi equipaggiarla.'));
        };
        const handleEquipVictory=id=>{
            const result=updateLocalStats({equipVictoryEffect:id});
            if(!result?.ok){setSystemAlert(result?.reason||'Non puoi equipaggiare questo effetto.');return;}
            setGameState(prev=>({...prev}));
            setSystemAlert(id?'✨ Animazione di vittoria equipaggiata!':'Animazione di vittoria disattivata.');
        };

        const handleRedeemKey = char => {
            const result=updateLocalStats({redeemMultimonKey:char.id});
            if(!result?.ok){
                setSystemAlert(result?.reason||'Non è stato possibile usare la Chiave Multimon.');
                return;
            }
            setGameState(current=>({...current}));
            setSystemAlert('🔑 '+char.name+' sbloccato GRATIS con una Chiave Multimon! Chiavi rimaste: '+result.keys+'.');
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
                
                <div className="relative z-10 w-full max-w-5xl bg-slate-900/80 backdrop-blur-xl border border-amber-700/50 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl flex flex-col min-h-0 max-h-[92dvh]">
                    <div className="flex justify-between items-center mb-6 border-b border-amber-800/50 pb-6 shrink-0">
                        <button onClick={() => setAppMode('menu')} className="flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors font-bold bg-slate-950/50 px-4 py-2 rounded-xl border border-slate-700/50">
                            <ArrowLeft size={20} /> Menu
                        </button>
                        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 text-center flex-1 flex items-center justify-center gap-3">
                            <ShoppingCart size={32} className="text-amber-500" /> Negozio
                        </h2>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <div className="flex items-center gap-2 bg-black/50 px-3 sm:px-5 py-2 rounded-full border border-amber-500/50">
                            <Coins size={20} className="text-yellow-400" />
                            <span className="font-black text-lg sm:text-xl text-yellow-400">{playerData.coins}</span>
                          </div>
                          <div className="flex items-center gap-1.5 rounded-full px-3 py-1 bg-cyan-950/70 border border-cyan-400/60"
                            title="Una Chiave Multimon sblocca gratuitamente un personaggio del negozio">
                            <span aria-hidden="true">🔑</span>
                            <span className="text-cyan-100 text-xs sm:text-sm font-black">{multimonKeys} Chiavi</span>
                          </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 shrink-0">
                         <button onClick={() => setShopTab('items')} className={`flex-1 min-w-[135px] py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${shopTab === 'items' ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg border border-amber-500' : 'bg-slate-950/50 text-slate-400 border border-slate-700 hover:bg-slate-800'}`}><BookOpen size={20}/> Oggetti e Cure</button>
                         <button onClick={() => setShopTab('chars')} className={`flex-1 min-w-[135px] py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${shopTab === 'chars' ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg border border-amber-500' : 'bg-slate-950/50 text-slate-400 border border-slate-700 hover:bg-slate-800'}`}><Users size={20}/> Personaggi Sbloccabili</button>
                         <button onClick={() => setShopTab('held')} className={`flex-1 min-w-[135px] py-3 px-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${shopTab === 'held' ? 'bg-gradient-to-r from-violet-600 to-cyan-700 text-white shadow-lg border border-violet-400' : 'bg-slate-950/50 text-slate-400 border border-slate-700 hover:bg-slate-800'}`}><span aria-hidden="true">💎</span> Strumenti da Lotta</button>
                         <button onClick={() => setShopTab('cosmetics')} className={`flex-1 min-w-[135px] py-3 px-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${shopTab === 'cosmetics' ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg border border-pink-400' : 'bg-slate-950/50 text-slate-400 border border-slate-700 hover:bg-slate-800'}`}>
                           <span aria-hidden="true">🎬</span> Cosmetici
                         </button>
                    </div>

                    {(shopTab === 'items'||shopTab === 'held') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar p-2">
                            {Object.values(ITEMS_DB).filter(item=>shopTab==='held'?item.type==='held':item.type!=='held').map(item => {
                                const owned = playerData.inventory[item.id] || 0;
                                const isPermanent = item.type==='held';
                                const unlocked = isPermanent && owned > 0;
                                const canAfford = !unlocked && playerData.coins >= item.price;
                                
                                return (
                                    <div key={item.id} className="bg-slate-950/80 border border-slate-700 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-500/50 transition-colors group shadow-lg relative">
                                        <div className="absolute top-3 right-3 bg-slate-800 text-xs font-bold px-2 py-1 rounded text-slate-400 border border-slate-600">
                                            {isPermanent ? (unlocked ? '✓ PERMANENTE' : 'DA SBLOCCARE') : `Posseduti: ${owned}`}
                                        </div>
                                        <div>
                                            <div className="mb-3 mt-2 flex justify-center">{isPermanent ? <ItemArtwork id={item.id} size={68} /> : <span className="text-4xl">{item.icon}</span>}</div>
                                            <h3 className="text-lg font-black text-white mb-1">{item.name}</h3>
                                            <p className="text-xs text-slate-400 h-10 leading-tight">{item.desc}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleBuyItem(item)}
                                            disabled={!canAfford}
                                            className={`mt-4 w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${canAfford ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg hover:-translate-y-0.5' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}`}
                                        >
                                            {unlocked ? '✓ Sbloccato per sempre' : <>Compra - <Coins size={16}/> {item.price}</>}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {shopTab === 'cosmetics'&&(
                      <section className="flex-1 min-h-0 flex flex-col gap-3" aria-label="Catalogo cosmetici">
                        <nav className="flex flex-wrap gap-2 shrink-0" aria-label="Categorie cosmetici">
                          <button type="button" onClick={()=>setShopCosmeticTab('entrances')}
                            className={`flex-1 min-w-[145px] rounded-xl px-4 py-3 font-black text-xs border transition-all
                              ${shopCosmeticTab==='entrances'?'bg-gradient-to-r from-violet-600 to-fuchsia-700 border-fuchsia-300 text-white':'bg-slate-950/70 border-violet-700/70 text-slate-300 hover:bg-slate-800'}`}>
                            🎬 Entrate Ultimon · 16
                          </button>
                          <button type="button" onClick={()=>setShopCosmeticTab('victories')}
                            className={`flex-1 min-w-[145px] rounded-xl px-4 py-3 font-black text-xs border transition-all
                              ${shopCosmeticTab==='victories'?'bg-gradient-to-r from-amber-600 to-rose-600 border-yellow-300 text-white':'bg-slate-950/70 border-amber-700/70 text-slate-300 hover:bg-slate-800'}`}>
                            🏆 Animazioni di Vittoria · 10
                          </button>
                        </nav>
                        {shopCosmeticTab==='entrances'&&<>
                        <div className="shrink-0 rounded-2xl border border-fuchsia-400/50 bg-gradient-to-r from-purple-950 via-indigo-950 to-pink-950 p-4 sm:p-5">
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div>
                              <h3 className="font-black text-xl sm:text-2xl text-fuchsia-100">🎬 Entrate ad effetto Ultimon</h3>
                              <p className="text-xs sm:text-sm text-indigo-100 mt-1">Acquista le tue entrate! Ogni effetto costa <b>100 monete</b> ed è permanente. Nessun bonus in battaglia.</p>
                            </div>
                            <span className="rounded-full border border-fuchsia-400 px-3 py-2 bg-black/50 text-xs font-black text-fuchsia-100">
                              ✨ {ownedEntrances.size}/{ULTIMON_ENTRANCE_EFFECTS.length} sbloccate
                            </span>
                          </div>
                          <p className="text-emerald-200 text-xs font-bold mt-2">🎤 Senza cosmetici entri normalmente: l'ingresso classico è sempre GRATIS.</p>
                        </div>
                        <div className="grid min-h-0 flex-1 content-start grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(250px,max-content)] gap-4 overflow-y-auto overscroll-contain custom-scrollbar p-2"
                          aria-label="Entrate ad effetto acquistabili">
                          {ULTIMON_ENTRANCE_EFFECTS.map(effect=>{
                            const owned=ownedEntrances.has(effect.id);
                            const affordable=playerData.coins>=ULTIMON_ENTRANCE_PRICE;
                            return <article key={effect.id} className="relative min-h-[250px] h-full rounded-2xl border-2 p-4 flex flex-col gap-2 shadow-xl transition-transform hover:-translate-y-1"
                              style={{borderColor:effect.accent,background:`radial-gradient(circle at 50% 0%,${effect.accent}66,#0b1024 76%)`}}>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-4xl drop-shadow-xl" aria-hidden="true">{effect.icon}</span>
                                <span className={`text-[10px] font-black px-2 py-1 rounded-full border ${owned?'bg-emerald-900/90 text-emerald-100 border-emerald-400':'bg-slate-950 text-slate-200 border-slate-400/60'}`}>
                                  {owned?'✓ POSSEDUTO':'🔒 DA SBLOCCARE'}
                                </span>
                              </div>
                              <h4 className="text-lg leading-tight font-black" style={{color:effect.color}}>{effect.name}</h4>
                              <p className="text-xs leading-relaxed text-slate-200 flex-1">{effect.hint}</p>
                              <div className="rounded-xl bg-black/45 border border-white/20 px-3 py-2 text-[10px] font-black tracking-wide text-white">
                                {effect.tagline}
                              </div>
                              <button type="button" onClick={()=>handleBuyEntrance(effect)}
                                disabled={owned||!affordable}
                                aria-label={owned?effect.name+' già acquistata':'Acquista '+effect.name+' per 100 monete'}
                                className={`mt-auto min-h-[44px] w-full shrink-0 py-3 rounded-xl font-black text-xs border transition-colors ${owned
                                  ?'bg-emerald-900/60 text-emerald-200 border-emerald-500/60 cursor-default'
                                  :affordable?'bg-gradient-to-r from-fuchsia-600 to-violet-600 border-fuchsia-400 text-white hover:brightness-125'
                                  :'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'}`}>
                                {owned?'✓ Tuo per sempre':affordable?'🪙 Acquista · 100 monete':'🔒 Servono 100 monete'}
                              </button>
                            </article>;
                          })}
                        </div>
                        </>}
                        {shopCosmeticTab==='victories'&&<>
                          <div className="shrink-0 rounded-2xl border border-amber-400/60 bg-gradient-to-r from-amber-950 via-violet-950 to-rose-950 p-4 sm:p-5">
                            <div className="flex flex-wrap gap-3 justify-between items-center">
                              <div>
                                <h3 className="font-black text-lg sm:text-2xl text-amber-100">🏆 Animazioni di Vittoria</h3>
                                <p className="text-xs sm:text-sm text-amber-50 mt-1">Festeggia la tua vittoria con uno spettacolo originale! <b>100 monete</b> per animazione, permanente.</p>
                              </div>
                              <span className="bg-black/60 border border-amber-400/70 rounded-full px-3 py-2 text-xs font-black text-amber-100">
                                ✨ {ownedVictories.size}/{VICTORY_EFFECTS.length} sbloccate
                              </span>
                            </div>
                            <p className="text-xs text-emerald-200 mt-2 font-bold">Ne puoi comprare tante, ma ne equipaggi una sola. Le vedono anche gli altri durante le partite online!</p>
                            {equippedVictory&&<button type="button" onClick={()=>handleEquipVictory(null)}
                              className="mt-3 px-3 py-2 text-xs font-black rounded-lg border border-slate-400 text-slate-200 hover:bg-slate-700">
                              Disattiva animazione equipaggiata
                            </button>}
                          </div>
                          <div className="grid min-h-0 flex-1 content-start grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(255px,max-content)] gap-4 overflow-y-auto overscroll-contain custom-scrollbar p-2"
                            aria-label="Animazioni di vittoria acquistabili">
                            {VICTORY_EFFECTS.map(effect=>{
                              const owned=ownedVictories.has(effect.id);
                              const equipped=equippedVictory===effect.id;
                              const affordable=Number(playerData.coins)>=VICTORY_EFFECT_PRICE;
                              return <article key={effect.id} className="relative min-h-[255px] h-full rounded-2xl border-2 p-4 flex flex-col gap-2 shadow-xl transition-transform hover:-translate-y-1"
                                style={{borderColor:effect.accent,background:`radial-gradient(circle at 50% 0%,${effect.accent}66,#101227 76%)`}}>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-4xl" aria-hidden="true">{effect.icon}</span>
                                  <span className={`text-[10px] font-black rounded-full px-2 py-1 border ${equipped?'bg-amber-400/30 text-amber-100 border-amber-300':owned?'bg-emerald-900/70 text-emerald-200 border-emerald-400':'bg-black/50 text-slate-200 border-slate-500'}`}>
                                    {equipped?'👑 EQUIPAGGIATA':owned?'✓ POSSEDUTA':'🔒 DA SBLOCCARE'}
                                  </span>
                                </div>
                                <h4 className="font-black text-lg leading-tight" style={{color:effect.color}}>{effect.name}</h4>
                                <p className="text-xs text-slate-200 leading-relaxed flex-1">{effect.hint}</p>
                                <div className="bg-black/45 border border-white/20 text-white rounded-xl px-3 py-2 text-[10px] font-black">{effect.tagline}</div>
                                <button type="button" onClick={()=>setVictoryPreview(effect)}
                                  aria-label={'Guarda anteprima di '+effect.name}
                                  className="shrink-0 w-full rounded-lg border border-white/40 bg-black/40 px-3 py-2 text-xs font-black text-cyan-100 hover:bg-white/15">
                                  👁️ Anteprima animazione
                                </button>
                                {owned?<button type="button" onClick={()=>handleEquipVictory(effect.id)} disabled={equipped}
                                  aria-label={'Equipaggia '+effect.name}
                                  className={`mt-auto min-h-[44px] w-full shrink-0 rounded-xl font-black text-xs border
                                    ${equipped?'bg-emerald-900/50 border-emerald-500/60 text-emerald-200 cursor-default':
                                      'bg-gradient-to-r from-amber-600 to-orange-600 border-amber-400 text-white hover:brightness-125'}`}>
                                    {equipped?'✓ In uso':'✨ Equipaggia'}
                                  </button>:<button type="button" onClick={()=>handleBuyVictory(effect)} disabled={!affordable}
                                  aria-label={'Acquista '+effect.name+' per 100 monete'}
                                  className={`mt-auto min-h-[44px] w-full shrink-0 rounded-xl font-black text-xs border
                                    ${affordable?'bg-gradient-to-r from-fuchsia-600 to-purple-600 border-fuchsia-400 text-white hover:brightness-125':
                                      'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'}`}>
                                    {affordable?'🪙 Acquista · 100 monete':'🔒 Servono 100 monete'}
                                  </button>}
                              </article>;
                            })}
                          </div>
                        </>}
                      </section>
                    )}

                    {shopTab === 'chars' && (
                        <>
                            <div className="mb-4 shrink-0 px-4 py-3 rounded-2xl border-2 border-cyan-400/60 bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 shadow-lg">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex gap-3 items-center">
                                  <span className="text-3xl sm:text-4xl" aria-hidden="true">🔑</span>
                                  <div>
                                    <h3 className="font-black text-cyan-100 text-base sm:text-lg">Chiavi Multimon</h3>
                                    <p className="text-xs text-slate-200">
                                      {playerData.multimonWelcomeKeysV1
                                        ? 'Regalo veterani ricevuto! Sblocca 1 personaggio per chiave, senza spendere monete.'
                                        : 'Completa la prima partita per ricevere 5 Chiavi Multimon gratuite.'}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-sm font-black text-cyan-100 rounded-full border border-cyan-400 bg-cyan-500/20 px-4 py-2">
                                  🔑 {multimonKeys} disponibili
                                </span>
                              </div>
                              {playerData.multimonWelcomeKeysV1&&<p className="text-[11px] text-emerald-200 font-bold mt-2">
                                🎁 Bonus una tantum: {MULTIMON_WELCOME_KEYS} Chiavi per chi ha già giocato. Le chiavi non scadono e non sostituiscono il Regalo Beta.
                              </p>}
                            </div>
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
                            <div className="grid min-h-0 flex-1 content-start grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto overscroll-contain custom-scrollbar p-2">
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
                                                    <span key={t} className={`text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm uppercase ${TYPE_STYLES[t] || 'bg-gray-500'}`}>{typeDisplayName(t)}</span>
                                                ))}
                                            </div>

                                        {isUnlocked ? (
                                            <button disabled className="w-full min-h-[42px] py-2 rounded-xl font-bold flex items-center justify-center gap-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs cursor-default">
                                                <Unlock size={14}/> Sbloccato
                                            </button>
                                        ) : (
                                            <div className="flex flex-col gap-2">
                                                {multimonKeys>0&&<button type="button"
                                                    onClick={() => handleRedeemKey(char)}
                                                    aria-label={'Sblocca '+char.name+' con 1 Chiave Multimon'}
                                                    className="w-full min-h-[44px] py-2 px-2 rounded-xl font-black text-xs text-white
                                                      bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500
                                                      border border-cyan-300/70 shadow-lg transition-all">
                                                    🔑 Usa 1 Chiave · GRATIS
                                                </button>}
                                                <button type="button"
                                                    onClick={() => handleBuyChar(char)}
                                                    disabled={!canAfford}
                                                    className={`w-full min-h-[42px] py-2 px-2 rounded-xl font-bold flex items-center justify-center gap-1 transition-all text-xs ${hasFreeUnlock ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.6)] border border-emerald-300' : (canAfford ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700')}`}>
                                                    {hasFreeUnlock ? (
                                                        <>🎁 Regalo Beta (gratis)</>
                                                    ) : (
                                                        <><Lock size={14}/> {char.price} <Coins size={12}/></>
                                                    )}
                                                </button>
                                            </div>
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
