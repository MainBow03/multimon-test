import {typeDisplayName} from '../../systems/typeLabel.js';
import {getCatalogOverview} from '../../systems/catalogOverview.js';
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


        const overview = getCatalogOverview(CHARACTERS);
        const activeSection = catalogFilter === 'Tutti' ? 'Tutti i Multimon' :
          catalogFilter === 'Fusioni' ? 'Fusioni del Multiverso' :
          catalogFilter === 'Iper forme' ? 'Forme Iper' :
          catalogFilter === 'Evocazioni' ? 'Evocazioni' :
          catalogFilter === 'Mostri Campagna' ? 'Mostri della Campagna' :
          'Tipo ' + typeDisplayName(catalogFilter);
        return (
            <main className="relative min-h-screen overflow-hidden bg-[#080d1d] px-3 pb-12 pt-4 text-white sm:px-5 lg:px-8">
                <div className="pointer-events-none absolute -top-28 left-1/2 h-[36rem] w-[85vw] -translate-x-1/2 rounded-full bg-indigo-600/15 blur-3xl" aria-hidden="true" />
                <div className="pointer-events-none absolute -top-12 right-0 h-72 w-72 rounded-full bg-fuchsia-600/10 blur-3xl" aria-hidden="true" />
                <div className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-col gap-5">
                    <header className="flex flex-wrap items-center justify-between gap-3">
                        <button type="button" onClick={() => setAppMode('menu')} className="flex items-center gap-2 rounded-xl border border-slate-600/70 bg-slate-900/85 px-4 py-2.5 text-sm font-bold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300">
                            <ArrowLeft size={18}/> Torna al menu
                        </button>
                        <span className="rounded-full border border-cyan-400/25 bg-cyan-950/35 px-3 py-2 text-[10px] font-black uppercase tracking-[.18em] text-cyan-200 sm:text-xs">
                            ✦ Archivio del Multiverso
                        </span>
                    </header>

                    <section className="relative isolate overflow-hidden rounded-[26px] border border-cyan-300/25 bg-gradient-to-br from-[#162d52] via-[#1b2450] to-[#301b4b] px-5 py-6 shadow-[0_22px_65px_rgba(0,0,0,.32)] sm:px-8 sm:py-8">
                        <div className="pointer-events-none absolute -right-12 -top-20 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" aria-hidden="true"/>
                        <div className="pointer-events-none absolute -bottom-20 right-1/3 h-56 w-56 rounded-full bg-fuchsia-400/15 blur-3xl" aria-hidden="true"/>
                        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                            <div className="min-w-0">
                                <p className="mb-2 text-[11px] font-black uppercase tracking-[.24em] text-cyan-300">✦ Enciclopedia dei personaggi</p>
                                <h1 className="bg-gradient-to-r from-white via-cyan-100 to-fuchsia-200 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl lg:text-5xl">
                                    Catalogo Multimon
                                </h1>
                                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-200 sm:text-base">
                                    Tutti gli eroi, i loro tipi, le abilità e le mosse in un unico archivio.
                                    Esplora ogni universo e scopri come combattono i tuoi preferiti.
                                </p>
                                <div className="mt-5 flex flex-wrap gap-2">
                                    <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-cyan-100">✦ {overview.totalTypes} tipi presenti</span>
                                    <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-fuchsia-100">✨ {hyperIds.length} forme Iper</span>
                                    <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-100">🧬 {FUSION_CHARACTERS.length} fusioni</span>
                                </div>
                            </div>
                            <div className="flex min-w-[185px] items-center justify-center rounded-[23px] border border-cyan-200/30 bg-slate-950/45 px-8 py-5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,.1),0_12px_25px_rgba(0,0,0,.2)]">
                                <div>
                                    <span className="block text-[11px] font-black uppercase tracking-[.18em] text-cyan-200">Totale Multimon</span>
                                    <strong className="my-1 block text-6xl font-black tabular-nums tracking-tight text-white sm:text-7xl" data-testid="catalog-total-multimon">
                                        {overview.totalMultimon}
                                    </strong>
                                    <span className="block text-xs font-bold text-slate-300">personaggi giocabili</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-600/50 bg-slate-900/80 p-3 shadow-lg backdrop-blur-md sm:p-4" aria-label="Ricerca e filtri del catalogo">
                        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(160px,210px)_minmax(150px,185px)] md:items-end">
                            <label className="block min-w-0">
                                <span className="mb-1.5 block text-[11px] font-black uppercase tracking-widest text-cyan-200">🔎 Cerca un Multimon</span>
                                <div className="flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-950/85 px-3 focus-within:border-cyan-400">
                                    <input
                                        type="search"
                                        aria-label="Cerca un Multimon per nome"
                                        placeholder="Nome del personaggio..."
                                        value={catalogSearch}
                                        onChange={e => setCatalogSearch(e.target.value)}
                                        className="min-w-0 flex-1 bg-transparent py-3 text-sm font-semibold text-white outline-none placeholder:text-slate-500"
                                    />
                                    {catalogSearch && <button type="button" aria-label="Cancella ricerca" onClick={() => setCatalogSearch('')} className="rounded-lg px-2 py-1 text-lg font-bold text-slate-300 hover:bg-slate-700 hover:text-white">×</button>}
                                </div>
                            </label>
                            <label className="block min-w-0">
                                <span className="mb-1.5 block text-[11px] font-black uppercase tracking-widest text-slate-300">Filtra per categoria</span>
                                <select aria-label="Filtra catalogo per tipo" value={catalogFilter} onChange={e => setCatalogFilter(e.target.value)} className="w-full rounded-xl border border-slate-600 bg-slate-950/85 px-3 py-3 text-sm font-bold text-white outline-none focus:border-cyan-400">
                                    <option value="Tutti">Tutti i tipi</option>
                                    <option value="Evocazioni">Solo evocazioni</option>
                                    <option value="Mostri Campagna">Mostri campagna</option>
                                    <option value="Iper forme">Forme Iper</option>
                                    <option value="Fusioni">Fusioni</option>
                                    {TYPES.map(t => <option key={t} value={t}>{typeDisplayName(t)}</option>)}
                                </select>
                            </label>
                            <label className="block min-w-0">
                                <span className="mb-1.5 block text-[11px] font-black uppercase tracking-widest text-slate-300">Ordina per</span>
                                <select aria-label="Ordina catalogo" value={catalogSort} onChange={e => setCatalogSort(e.target.value)} className="w-full rounded-xl border border-slate-600 bg-slate-950/85 px-3 py-3 text-sm font-bold text-white outline-none focus:border-cyan-400">
                                    <option value="alpha">Nome A–Z</option>
                                    <option value="type">Tipo principale</option>
                                </select>
                            </label>
                        </div>
                    </section>

                    <div className="flex flex-wrap items-center justify-between gap-2 px-1" role="status" aria-live="polite">
                        <div className="min-w-0">
                            <h2 className="text-lg font-black text-white sm:text-xl">{activeSection}</h2>
                            <p className="text-xs font-semibold text-slate-400">
                                {displayedChars.length} {displayedChars.length === 1 ? 'risultato' : 'risultati'} visualizzati
                                {catalogFilter === 'Tutti' && !catalogSearch.trim() ? ' · roster completo' : ' · totale roster: ' + overview.totalMultimon}
                            </p>
                        </div>
                        {(catalogFilter !== 'Tutti' || catalogSearch.trim()) && <button type="button"
                            onClick={() => { setCatalogFilter('Tutti'); setCatalogSearch(''); }}
                            className="rounded-full border border-cyan-400/35 bg-cyan-950/35 px-3 py-2 text-xs font-extrabold text-cyan-200 transition hover:border-cyan-300 hover:bg-cyan-900/50">
                            ✕ Ripristina filtri
                        </button>}
                    </div>

                    {displayedChars.length === 0 ? (
                        <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-600 bg-slate-900/45 px-5 py-10 text-center">
                            <span className="text-5xl" aria-hidden="true">🔎</span>
                            <h3 className="text-xl font-black text-white">Nessun Multimon trovato</h3>
                            <p className="max-w-md text-sm text-slate-400">Prova un altro nome oppure modifica i filtri per continuare l'esplorazione.</p>
                            <button type="button" onClick={() => { setCatalogFilter('Tutti'); setCatalogSearch(''); }}
                                className="rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-cyan-500">Mostra tutti i Multimon</button>
                        </div>
                    ) : (
                        <div className="grid auto-rows-max grid-cols-1 content-start gap-4 pb-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                            {displayedChars.map(char => (
                                <article key={char.id} className={'group relative flex min-w-0 flex-col overflow-hidden rounded-[22px] border bg-[#111b30]/95 shadow-[0_12px_28px_rgba(0,0,0,.23)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(32,155,196,.14)] ' +
                                    (char.isHyperInCatalog ? 'border-amber-400/50 hover:border-amber-300' :
                                    char.isFusionInCatalog ? 'border-fuchsia-400/50 hover:border-fuchsia-300' :
                                    'border-slate-600/65 hover:border-cyan-400/65')}>
                                    <div className={'relative flex h-48 items-center justify-center overflow-hidden border-b border-white/10 bg-gradient-to-b p-3 sm:h-52 ' +
                                        (char.isHyperInCatalog ? 'from-amber-900/35 via-indigo-950/40 to-[#111b30]' :
                                        char.isFusionInCatalog ? 'from-fuchsia-900/35 via-indigo-950/40 to-[#111b30]' :
                                        'from-cyan-950/65 via-[#172b4a] to-[#111b30]')}>
                                        <div className="pointer-events-none absolute inset-x-10 top-7 h-32 rounded-full bg-cyan-300/10 blur-3xl" aria-hidden="true"/>
                                        <div className="pointer-events-none absolute bottom-2 left-2 text-[10px] font-black tracking-widest text-white/35" aria-hidden="true">MULTIMON ✦</div>
                                        <img loading="lazy" src={char.img} onError={onMultimonImageError} alt={char.name}
                                            className="relative z-10 h-full w-full object-contain drop-shadow-[0_12px_18px_rgba(0,0,0,.6)] transition-transform duration-200 group-hover:scale-105"
                                            style={char.imageFilter ? {filter: char.imageFilter} : undefined}/>
                                        {char.price && !char.isHyperInCatalog && !char.isFusionInCatalog &&
                                            <span className="absolute right-2 top-2 z-20 inline-flex items-center gap-1 rounded-full border border-amber-400/45 bg-slate-950/90 px-2.5 py-1 text-[11px] font-black text-amber-200">
                                                <Lock size={12}/> {char.price} monete
                                            </span>}
                                        {(char.isHyperInCatalog || char.isFusionInCatalog || hyperIds.includes(char.id)) &&
                                            <span className={'absolute left-2 top-2 z-20 rounded-full border px-2.5 py-1 text-[10px] font-black tracking-wide ' +
                                                (char.isFusionInCatalog ? 'border-fuchsia-300/50 bg-fuchsia-950/90 text-fuchsia-200' :
                                                 'border-amber-300/50 bg-amber-950/90 text-amber-200')}>
                                                {char.isFusionInCatalog ? '🧬 FUSIONE' : '✨ IPER'}
                                            </span>}
                                    </div>

                                    <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
                                        <div className="min-h-[68px]">
                                            <h3 className="line-clamp-2 break-words text-center text-base font-black leading-snug text-white sm:text-lg">{char.name}</h3>
                                            <div className="mt-2 flex min-h-6 flex-wrap items-center justify-center gap-1.5">
                                                {char.types.map(t => <span key={t} className={'rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ' +
                                                    (TYPE_STYLES[t] || 'bg-slate-600 text-white')}>{typeDisplayName(t)}</span>)}
                                            </div>
                                        </div>

                                        {char.fusionOf && <div className="space-y-2 rounded-xl border border-fuchsia-400/25 bg-fuchsia-950/25 px-3 py-3 text-center">
                                            <p className="text-[11px] font-extrabold leading-relaxed text-fuchsia-100">
                                                🧬 {char.fusionStyle ? 'Fusione ' + char.fusionStyle + ' · ' : 'Fusione di: '}
                                                {char.fusionOf.map(id => CHARACTERS.find(c => c.id === id)?.name || id).join(' + ')}
                                            </p>
                                            {char.fusionTitle && <strong className="block text-xs font-black text-fuchsia-200">✦ {char.fusionTitle}</strong>}
                                            {char.fusionDescription && <p className="text-[11px] leading-relaxed text-slate-300">{char.fusionDescription}</p>}
                                        </div>}

                                        <div className="grid grid-cols-4 gap-1.5 rounded-xl border border-slate-700/60 bg-slate-950/65 p-2 text-center">
                                            {[
                                                ['PS', char.maxHp, 'text-emerald-300'],
                                                ['ATT', char.atk, 'text-rose-300'],
                                                ['DIF', char.def, 'text-sky-300'],
                                                ['VEL', char.spd, 'text-amber-300']
                                            ].map(([label,value,tone]) => <div key={label} className="min-w-0 rounded-lg bg-white/[.035] px-1 py-2">
                                                <span className="block text-[10px] font-bold text-slate-400">{label}</span>
                                                <strong className={'block text-sm font-black tabular-nums ' + tone}>{value}</strong>
                                            </div>)}
                                        </div>

                                        {char.passive && <div className="rounded-xl border border-amber-400/25 bg-amber-950/20 p-3">
                                            <div className="mb-1 flex flex-wrap items-center justify-between gap-1">
                                                <span className="min-w-0 break-words text-xs font-black text-amber-200">✦ {char.passive.name}</span>
                                                {char.passive.maxUses && <span className="text-[10px] font-bold text-amber-200/70">{char.passive.maxUses} usi</span>}
                                            </div>
                                            <p className="text-[11px] leading-relaxed text-slate-300">{char.passive.desc || 'Abilità passiva del personaggio.'}</p>
                                        </div>}

                                        <details className="group/moves mt-auto rounded-xl border border-slate-600/65 bg-slate-800/50 open:border-cyan-400/35 open:bg-slate-900/80">
                                            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-3 py-3 text-xs font-black text-cyan-100 transition-colors hover:bg-slate-700/40 [&::-webkit-details-marker]:hidden">
                                                <span>⚔️ Mosse del personaggio ({char.moves.filter(Boolean).length})</span>
                                                <span className="text-cyan-300 transition-transform group-open/moves:rotate-180" aria-hidden="true">⌄</span>
                                            </summary>
                                            <div className="space-y-2 px-2.5 pb-3">
                                                {char.moves.filter(Boolean).map((m, i) => (
                                                    <div key={i} className="rounded-lg border border-slate-700/65 bg-[#101b31] p-2.5">
                                                        <div className="flex min-w-0 flex-wrap items-start justify-between gap-1">
                                                            <span className="min-w-0 break-words text-[11px] font-black leading-snug text-white">{m.name}</span>
                                                            <span className={'shrink-0 rounded-md px-1.5 py-1 text-[9px] font-black ' + (TYPE_STYLES[m.type] || 'bg-slate-700 text-white')}>{typeDisplayName(m.type)}</span>
                                                        </div>
                                                        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-bold text-slate-300">
                                                            <span>{m.power > 0 ? 'Potenza ' + m.power : (m.heal || m.healFlat || m.targetMode === 'team_smart_heal' || m.targetMode === 'team' || m.selfHeal || m.healLastTurnDamage ? 'Cura / supporto' : (m.isProtect ? 'Difesa / supporto' : ((m.isSummon || m.randomSummon) ? 'Evocazione' : 'Supporto')))}</span>
                                                            {m.accuracy != null && <span>Prec. {Math.round(m.accuracy * 100)}%</span>}
                                                            {m.maxUses && <span>Max {m.maxUses} usi</span>}
                                                            {m.multiHit && <span>{m.multiHit.min}–{m.multiHit.max} colpi</span>}
                                                        </div>
                                                        {m.desc && <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">{m.desc}</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        </details>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        );
    }
}
