import {typeDisplayName} from '../../systems/typeLabel.js';
import {onMultimonImageError} from '../../systems/imageFallback.js';
import {CORALINE_HYPER_IMAGE} from '../../systems/coralineHyperArtwork.js';
// Schermata estratta senza alterare la struttura JSX originale.
export function renderCatalogView(ctx) {
const { ArrowLeft, CHARACTERS, FUSION_CHARACTERS, Lock, MOVES_DB, TYPES, TYPE_STYLES, appMode, catalogFilter, catalogSearch, catalogSort, setAppMode, setCatalogFilter, setCatalogSearch, setCatalogSort } = ctx;
if (appMode === 'catalog') {
        let displayedChars = [...CHARACTERS];
        const hyperIds = ['barry', 'gardevoir', 'astral', 'polterpup', 'spongebob', 'patrick', 'alphonse', 'ariana', 'bloom', 'gaston', 'jake', 'marceline', 'finn', 'natsu', 'juvia', 'laxus', 'bumblebee', 'corvina', 'entoma', 'garnet', 'darwin', 'brago', 'iris', 'sdentato', 'ladybug', 'bowser', 'rainbowdash', 'elsa', 'sheldon', 'charizard', 'maxcaulfield', 'chloeprice', 'dolli', 'zatchbell', 'yoshi', 'poisonivy', 'carlos', 'leon', 'sage', 'coraline', 'luigi', 'miku'];
        
        if (catalogFilter === 'Evocazioni') {
            displayedChars = displayedChars.filter(c => c.isSummonOnly);
        } else if (catalogFilter === 'Mostri Campagna') {
            displayedChars = displayedChars.filter(c => c.isCampaignMonster);
        } else if (catalogFilter === 'Iper forme') {
            displayedChars = displayedChars.filter(c => hyperIds.includes(c.id)).map(baseChar => {
                let char = JSON.parse(JSON.stringify(baseChar));
                
                // --- APPLICA STATS IPER ---
                char.atk = Math.floor(char.atk * 1.35);
                char.def = Math.floor(char.def * 1.35);
                char.spd = Math.floor(char.spd * 1.35);
                char.name = char.id === 'coraline' ? 'Coraline (Iper — Oltre la Porticina)' :
                    char.id === 'luigi' ? 'Luigi (Iper — Terrore Sconfitto)' :
                    char.id === 'miku' ? 'Hatsune Miku (Iper — Diva Stellare)' :
                    char.name + " (Iper)";
                char.isHyperInCatalog = true;
                
                // --- APPLICA MOSSE E TIPI IPER ---
                if (char.id === 'coraline') { char.moves.push(MOVES_DB['Porta dell’Impossibile']); }
                if (char.id === 'luigi') { char.moves.push(MOVES_DB['Aspirazione Fantasma']); }
                if (char.id === 'miku') { char.moves.push(MOVES_DB['Concerto Universale']); }
                if (char.id === 'gardevoir') { char.types = ['Psico', 'Erba']; char.moves.push(MOVES_DB['Liane Oscillanti']); }
                if (char.id === 'astral') { char.types = ['Oscuro']; char.moves.push(MOVES_DB['Assorbimento Tenebroso']); }
                if (char.id === 'polterpup') { char.moves.push(MOVES_DB['Riporta']); }
                if (char.id === 'spongebob') { char.types = ['Acqua', 'Lotta']; }
                if (char.id === 'ariana') { char.types = ['Suono', 'Oscuro']; char.moves.push(MOVES_DB['Dangerous Woman']); }
                if (char.id === 'jake') { char.types = ['Magico', 'Buio']; char.moves.push(MOVES_DB['Morsa del Demone']); }
                if (char.id === 'finn') { char.types = ['Elettro', 'Fuoco']; char.moves.push(MOVES_DB['Lama Vulcanica']); char.moves.push(MOVES_DB['Fulmine dell\'Eroe']); }
                if (char.id === 'juvia') { char.types = ['Acqua', 'Buio']; char.moves.push(MOVES_DB['Abisso Disperato']); }
                if (char.id === 'corvina') { char.types = ['Magico']; char.moves.push(MOVES_DB['Luce di Azarath']); }
                if (char.id === 'entoma') { char.types = ['Insetto', 'Buio']; char.moves.push(MOVES_DB['Fame Insaziabile']); }
                if (char.id === 'darwin') { char.types = ['Acqua', 'Oscuro']; char.moves.push(MOVES_DB['Idropompa']); char.moves.push(MOVES_DB['Dittatura del Sorriso']); }
                if (char.id === 'brago') { char.types = ['Oscuro', 'Psico']; char.moves.push(MOVES_DB['Caos Totale']); }
                if (char.id === 'sdentato') { char.types = ['Drago', 'Elettro']; char.moves.push(MOVES_DB['Fulmine']); }
                if (char.id === 'rainbowdash') { char.moves.push(MOVES_DB['Morso del Pony']); }
                if (char.id === 'elsa') { char.moves.push(MOVES_DB['Gelo Definitivo']); }
                if (char.id === 'sheldon') { char.types = ['Drago', 'Roccia']; char.moves.push(MOVES_DB['Meteora Devastante']); }
                if (char.id === 'charizard') { char.types = ['Roccia', 'Aria']; char.moves.push(MOVES_DB['Valanga']); }
                if (char.id === 'maxcaulfield') { char.types = ['Insetto', 'Aria']; char.moves.push(MOVES_DB['Tempesta di Farfalle']); }
                if (char.id === 'chloeprice') { char.types = ['Suono', 'Luce']; char.moves.push(MOVES_DB['Caos Assoluto']); }
                if (char.id === 'dolli') { char.types = ['Spettro', 'Acqua']; char.moves.push(MOVES_DB['Incubo di Pezza']); }
                if (char.id === 'zatchbell') { char.passive = { name: 'Kiyomaro: Zatch non sei solo', type: 'global_damage_boost', multiplier: 1.15, desc: 'Kiyomaro lo aiuta a combattere leggendo il libro rosso: tutte le sue mosse ricevono un potenziamento del 15% ai danni!' }; }
                if (char.id === 'poisonivy') { char.types = ['Veleno', 'Fuoco']; char.moves.push(MOVES_DB['Polline scottante']); }
                if (char.id === 'carlos') { char.types = ['Fuoco', 'Lotta']; char.moves.push(MOVES_DB['Pugno infuocato del survivor']); }
                if (char.id === 'leon') { char.types = ['Fuoco', 'Normale']; }
                if (char.id === 'sage') { char.moves.push(MOVES_DB['questo è il mio vero potenziale']); }

                // --- APPLICA IMMAGINE IPER ---
                if (char.id === 'barry') char.img = "https://i.redd.it/le0qp8fednsc1.jpeg";
                else if (char.id === 'gardevoir') char.img = "https://i.pinimg.com/736x/5b/fc/45/5bfc453fcdf52854983d80f2b7614abf.jpg";
                else if (char.id === 'astral') char.img = "https://i.pinimg.com/736x/cb/c6/27/cbc62707cd7e489bc2af1452055cd148.jpg"; 
                else if (char.id === 'polterpup') char.img = "https://i.pinimg.com/736x/7c/cb/6b/7ccb6b4a151705a8186777ae1379c472.jpg";
                else if (char.id === 'spongebob') char.img = "https://i.pinimg.com/1200x/a2/b3/11/a2b3112c702d2f0f03a8adc3cc05eb78.jpg"; 
                else if (char.id === 'patrick') char.img = "https://i.pinimg.com/1200x/f9/b2/b1/f9b2b173fa94cf8b883787c26118cc61.jpg"; 
                else if (char.id === 'alphonse') char.img = "https://i.pinimg.com/736x/f5/52/0c/f5520ce0b913d427f0f992774.jpg"; 
                else if (char.id === 'ariana') char.img = "https://i.pinimg.com/736x/1a/d9/67/1ad967b56ae629c6acb40c00e837613d.jpg"; 
                else if (char.id === 'bloom') char.img = "https://i.pinimg.com/736x/58/55/d3/5855d360ba56c8e37976835e48a4b724.jpg"; 
                else if (char.id === 'gaston') char.img = "https://i.pinimg.com/736x/b3/ff/14/b3ff14068712a2926a7af8eead2422a9.jpg"; 
                else if (char.id === 'jake') char.img = "https://i.pinimg.com/736x/86/6b/dc/866bdc8b9f83b2da400763e9d7b0a071.jpg"; 
                else if (char.id === 'marceline') char.img = "https://i.pinimg.com/736x/6c/f3/57/6cf357050acbc8e86676d3017d6c4ef4.jpg"; 
                else if (char.id === 'finn') char.img = "https://i.pinimg.com/736x/51/cd/cf/51cdcf83d6a1d881f91f20bb7c219659.jpg"; 
                else if (char.id === 'natsu') char.img = "https://i.pinimg.com/736x/46/38/71/4638717f53f57400feb9949c77e6f481.jpg"; 
                else if (char.id === 'juvia') char.img = "https://i.pinimg.com/736x/aa/29/5f/aa295f4695f570b09efbb7e84c1539c3.jpg"; 
                else if (char.id === 'laxus') char.img = "https://i.pinimg.com/736x/76/e4/d1/76e4d18a3536b22a7e32ea37e1ef5f71.jpg"; 
                else if (char.id === 'bumblebee') char.img = "https://i.pinimg.com/1200x/fc/1d/de/fc1ddef3272962f71c1678b9a13744bf.jpg"; 
                else if (char.id === 'corvina') char.img = "https://i.pinimg.com/1200x/e9/0b/f7/e90bf763d6dd629badadf4577c1ff017.jpg"; 
                else if (char.id === 'entoma') char.img = "https://i.pinimg.com/736x/50/e6/2a/50e62a01cc9186095dc216345d820eef.jpg"; 
                else if (char.id === 'garnet') char.img = "https://i.pinimg.com/1200x/2c/db/e6/2cdbe6606a1387a260136966feb33ad7.jpg"; 
                else if (char.id === 'darwin') char.img = "https://i.pinimg.com/1200x/c0/51/54/c05154be74cffbbaa49bc46c681082b3.jpg"; 
                else if (char.id === 'brago') char.img = "https://pbs.twimg.com/media/FWqDimhUEAAh-wk.jpg"; 
                else if (char.id === 'iris') char.img = "https://i.pinimg.com/736x/79/4b/0b/794b0b7ac8e43390a87df4e26bed8b40.jpg"; 
                else if (char.id === 'sdentato') char.img = "https://i.pinimg.com/736x/8f/41/03/8f4103a00fabb4223c3f4095a4635776.jpg"; 
                else if (char.id === 'ladybug') char.img = "https://i.pinimg.com/736x/40/b6/29/40b629847b9740338ac820695fe68dd0.jpg"; 
                else if (char.id === 'bowser') char.img = "https://i.pinimg.com/736x/46/97/12/4697127f5285439d6d0448bd64a7b1a0.jpg"; 
                else if (char.id === 'rainbowdash') char.img = "https://i.pinimg.com/736x/31/a1/38/31a13869a5fd16b2c24134e2205ba8fd.jpg";
                else if (char.id === 'elsa') char.img = "https://i.pinimg.com/1200x/fa/2e/ed/fa2eed50fb89e9ea97d9252aa349a979.jpg";
                else if (char.id === 'sheldon') char.img = "https://i.postimg.cc/FdLNqMxk/Gemini-Generated-Image-85dys085dys085dy.png";
                else if (char.id === 'charizard') char.img = "https://i.postimg.cc/v1kj6cd6/Gemini-Generated-Image-zd38yrzd38yrzd38.png";
                else if (char.id === 'maxcaulfield') char.img = "https://i.postimg.cc/xXLNqLB9/Copilot-20260701-040119.jpg";
                else if (char.id === 'chloeprice') char.img = "https://i.postimg.cc/NLm1TZKZ/Gemini-Generated-Image-okh29cokh29cokh2.png";
                else if (char.id === 'dolli') char.img = "https://i.pinimg.com/1200x/a2/4e/80/a24e807c05f25fa984e59ab0b44d952c.jpg";
                else if (char.id === 'zatchbell') char.img = "https://i.pinimg.com/736x/ff/5c/4c/ff5c4c6f0dbd938e1bbc34d3a98e890e.jpg";
                else if (char.id === 'poisonivy') char.img = "https://i.postimg.cc/w339Gs8Y/Gemini-Generated-Image-ll2m1sll2m1sll2m.png"; // Poison Ivy Iper
                else if (char.id === 'carlos') char.img = "https://i.postimg.cc/mhmqbMVW/Gemini-Generated-Image-1wl7sn1wl7sn1wl7-(1).png"; // Carlos Iper
                else if (char.id === 'leon') char.img = "https://i.postimg.cc/N540GdVZ/834bde13bf771897729c8fc78dfcb7cd-(1).jpg"; // Leon Iper
                else if (char.id === 'sage') char.img = "https://i.pinimg.com/1200x/c8/94/13/c89413f6d9bfeacd9b036e496117f1f8.jpg"; // Sage Iper
                else if (char.id === 'coraline') char.img = CORALINE_HYPER_IMAGE;
                else if (char.id === 'luigi') char.img = 'https://i.pinimg.com/1200x/22/86/f9/2286f929ba8c9bc5bd63a96ccb266f2d.jpg';
                else if (char.id === 'miku') char.img = 'https://i.pinimg.com/736x/4d/88/d9/4d88d9df93b4a62f43bc69bfd46eb250.jpg';
                
                return char;
            });
        } else if (catalogFilter === 'Fusioni') {
            displayedChars = FUSION_CHARACTERS.map(c => ({...c, isFusionInCatalog: true}));
        } else {
            // Le fusioni sono visibili soltanto nella categoria dedicata.
            // In "Tutti" e nei filtri dei tipi mostriamo esclusivamente il roster normale.
            displayedChars = CHARACTERS.filter(c => !c.isSummonOnly && !c.isCampaignMonster);
            if (catalogFilter !== 'Tutti') {
                displayedChars = displayedChars.filter(c => c.types.includes(catalogFilter));
            }
        }
        if (catalogSearch.trim() !== '') {
            const searchLower = catalogSearch.toLowerCase();
            displayedChars = displayedChars.filter(c => c.name.toLowerCase().includes(searchLower));
        }
        if (catalogSort === 'alpha') {
            displayedChars.sort((a, b) => a.name.localeCompare(b.name));
        } else if (catalogSort === 'type') {
            displayedChars.sort((a, b) => a.types[0].localeCompare(b.types[0]));
        }

        return (
            <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black pointer-events-none opacity-60"></div>

                <div className="relative z-10 flex flex-col h-full max-w-7xl mx-auto w-full">
                    <div className="flex justify-between items-center mb-8">
                        <button onClick={() => setAppMode('menu')} className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors font-bold bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-700/50">
                            <ArrowLeft size={20} /> Menu
                        </button>
                        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 hidden sm:block">Catalogo Personaggi</h2>
                        <div className="w-[100px] hidden sm:block"></div>
                    </div>

                    <div className="flex flex-wrap gap-4 mb-8 bg-slate-900/60 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-md items-center">
                        <div className="flex-1 min-w-[200px]">
                            <input 
                                type="text" 
                                placeholder="Cerca per nome..." 
                                value={catalogSearch} 
                                onChange={e => setCatalogSearch(e.target.value)} 
                                className="w-full bg-slate-800 text-white font-bold px-4 py-2 rounded-xl outline-none border border-slate-600 focus:border-cyan-500 placeholder-slate-400"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">Filtra:</span>
                            <select value={catalogFilter} onChange={e => setCatalogFilter(e.target.value)} className="bg-slate-800 text-white font-bold p-2 rounded-lg outline-none border border-slate-600 focus:border-cyan-500">
                                <option value="Tutti">Tutti i Tipi</option>
                                <option value="Evocazioni">Solo Evocazioni</option>
                                <option value="Mostri Campagna">Mostri Campagna</option>
                                <option value="Iper forme">Iper Forme</option>
                                <option value="Fusioni">Fusioni</option>
                                {TYPES.map(t => <option key={t} value={t}>{typeDisplayName(t)}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">Ordina:</span>
                            <select value={catalogSort} onChange={e => setCatalogSort(e.target.value)} className="bg-slate-800 text-white font-bold p-2 rounded-lg outline-none border border-slate-600 focus:border-cyan-500">
                                <option value="alpha">A-Z</option>
                                <option value="type">Per Tipo Primario</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {displayedChars.map(char => (
                                <div key={char.id} tabIndex="0" className={`bg-slate-900/80 backdrop-blur-md border ${char.isHyperInCatalog ? 'border-yellow-400/50 shadow-[0_0_15px_rgba(250,204,21,0.2)]' : (char.isFusionInCatalog ? 'border-fuchsia-500/50 shadow-[0_0_15px_rgba(217,70,239,0.2)]' : 'border-slate-700/50')} rounded-2xl p-5 flex flex-col items-center hover:border-cyan-500/50 transition-colors shadow-lg relative group cursor-pointer focus:outline-none`}>
                                    <div className="relative">
                                        <img src={char.img} onError={onMultimonImageError} alt={char.name} className={`w-24 h-24 rounded-full object-cover mb-4 border-2 ${char.isHyperInCatalog ? 'border-yellow-400' : (char.isFusionInCatalog ? 'border-fuchsia-500' : 'border-slate-600/50')} transition-transform group-hover:scale-105`} />
                                        
                                        {char.fusionOf && (
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900/95 backdrop-blur-xl p-3 rounded-2xl border-2 border-fuchsia-500 shadow-[0_0_30px_rgba(217,70,239,0.6)] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-2 w-max min-w-[140px] z-20 pointer-events-none">
                                                <span className="font-black text-[10px] text-fuchsia-400 uppercase tracking-widest">Fusione di:</span>
                                                <div className="flex gap-3">
                                                    {char.fusionOf.map(id => {
                                                        const base = CHARACTERS.find(c => c.id === id);
                                                        return base && (
                                                            <div key={id} className="flex flex-col items-center">
                                                                <img src={base.img} onError={onMultimonImageError} className="w-12 h-12 rounded-full border-2 border-slate-500 object-cover bg-slate-900" />
                                                                <span className="text-[9px] font-bold text-slate-200 mt-1 max-w-[55px] truncate text-center">{base.name}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {char.price && !char.isHyperInCatalog && !char.isFusionInCatalog && (
                                        <div className="absolute top-2 right-2 bg-amber-500/20 border border-amber-500/50 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <Lock size={10}/> {char.price}
                                        </div>
                                    )}
                                    {(char.isHyperInCatalog || char.isFusionInCatalog || hyperIds.includes(char.id)) && (
                                        <div className={`absolute top-2 left-2 ${char.isFusionInCatalog ? 'bg-fuchsia-500/20 border-fuchsia-500/50 text-fuchsia-300 shadow-[0_0_10px_rgba(217,70,239,0.5)]' : 'bg-yellow-400/20 border-yellow-400/50 text-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.5)]'} text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 cursor-help`} title={char.isHyperInCatalog ? "Stai visualizzando le statistiche e le mosse della Forma Iper!" : (char.isFusionInCatalog ? "Questo è un personaggio Fusione originale!" : "Questo personaggio possiede la Forma Iper in battaglia!")}>
                                            {char.isFusionInCatalog ? "🧬 FUSIONE" : "✨ IPER"}
                                        </div>
                                    )}
                                    <h4 className="font-bold text-lg mb-2 text-slate-100 text-center">{char.name}</h4>
                                    <div className="flex flex-wrap gap-1.5 justify-center mb-4">
                                      {char.types.map(t => (
                                        <span key={t} className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${TYPE_STYLES[t] || 'bg-gray-500'}`}>{typeDisplayName(t)}</span>
                                      ))}
                                    </div>
                                    <div className="w-full grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950/50 p-3 rounded-xl mb-4 border border-slate-800">
                                        <div className="text-emerald-400">HP: {char.maxHp}</div>
                                        <div className="text-rose-400">ATK: {char.atk}</div>
                                        <div className="text-blue-400">DEF: {char.def}</div>
                                        <div className="text-amber-400">SPD: {char.spd}</div>
                                    </div>
                                    <div className="w-full space-y-2">
                                        {char.passive && (
                                            <div className="text-[10px] bg-amber-900/40 p-2 rounded border border-amber-500/50 flex flex-col gap-1 shadow-inner">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold text-amber-400 flex items-center gap-1">✨ Passiva: {char.passive.name}</span>
                                                    <span className="text-[8px] text-amber-200/70">{char.passive.maxUses ? `Usi max: ${char.passive.maxUses}` : 'Infinito'}</span>
                                                </div>
                                                <span className="text-[9px] text-amber-100/80 leading-tight">{char.passive.desc}</span>
                                            </div>
                                        )}
                                        {char.moves.filter(Boolean).map((m, i) => (
                                            <div key={i} className="text-[10px] bg-slate-800 p-2 rounded border border-slate-700 flex flex-col gap-1">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold text-gray-300">{m.name}</span>
                                                    <span className={`${TYPE_STYLES[m.type]} px-1 py-0.5 rounded text-[8px]`}>{typeDisplayName(m.type)}</span>
                                                </div>
                                                <div className="flex justify-between text-slate-500 text-[9px] font-bold">
                                                    <span>{m.power > 0 ? `Pot: ${m.power}` : (m.heal || m.healFlat || m.targetMode === 'team_smart_heal' || m.targetMode === 'team' || m.selfHeal || m.healLastTurnDamage ? 'Cura' : (m.isProtect ? 'Difesa' : ((m.isSummon || m.randomSummon) ? 'Evoca' : 'Stato')))}</span>
                                                    {m.accuracy && <span>Prec: {m.accuracy * 100}%</span>}
                                                    {m.maxUses && <span>Usi max: {m.maxUses}</span>}
                                                    {m.multiHit && <span>{m.multiHit.min}-{m.multiHit.max} Colpi</span>}
                                                </div>
                                                <p className="text-slate-400 italic text-[9px] mt-1 leading-tight">{m.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
