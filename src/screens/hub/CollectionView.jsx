import React, {useState} from 'react';
import {onMultimonImageError} from '../../systems/imageFallback.js';
import {getCollectionEntries} from '../../systems/collectionRoster.js';

function CollectionCard({entry, typeStyles}) {
  const {character, owned} = entry;
  const types = character.types || [];
  return (
    <article className={`group relative min-w-0 overflow-hidden rounded-2xl border transition-colors ${owned ? 'border-cyan-500/30 bg-slate-900/85 hover:border-cyan-300/75' : 'border-slate-700/80 bg-slate-900/70'}`}>
      <div className={`relative flex h-36 sm:h-44 md:h-48 items-center justify-center overflow-hidden bg-gradient-to-b ${owned ? 'from-indigo-950/80 via-slate-900 to-slate-900' : 'from-slate-800 to-slate-950'}`}>
        <div className={`absolute inset-4 rounded-full blur-2xl ${owned ? 'bg-cyan-400/10' : 'bg-slate-400/5'}`} aria-hidden="true"/>
        <img
          loading="lazy"
          src={character.img}
          onError={onMultimonImageError}
          alt={character.name}
          className={`relative z-10 h-[90%] w-[90%] object-contain drop-shadow-xl ${owned ? '' : 'grayscale brightness-[.42] contrast-125'}`}
          style={owned && character.imageFilter ? {filter: character.imageFilter} : undefined}
        />
        {!owned && <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/15" aria-hidden="true">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/25 bg-slate-950/80 text-3xl shadow-2xl">🔒</span>
        </div>}
        <span className={`absolute right-2 top-2 z-30 rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-wide ${owned ? 'border-emerald-400/40 bg-emerald-950/90 text-emerald-200' : 'border-slate-500/60 bg-slate-950/90 text-slate-300'}`}>
          {owned ? '✓ Ottenuto' : 'Da sbloccare'}
        </span>
      </div>
      <div className="space-y-2 px-3 pb-4 pt-3">
        <h3 className={`min-h-[2.7rem] text-center text-sm font-extrabold leading-snug sm:text-base ${owned ? 'text-white' : 'text-slate-300'}`}>{character.name}</h3>
        <div className="flex min-h-6 flex-wrap items-start justify-center gap-1">
          {types.map(type => <span key={type} className={`rounded-full px-2 py-1 text-[10px] font-bold leading-none ${owned ? (typeStyles[type] || 'bg-slate-700 text-white') : 'bg-slate-700/70 text-slate-300'}`}>{type}</span>)}
        </div>
        <p className={`text-center text-[11px] font-semibold ${owned ? 'text-cyan-300' : 'text-slate-400'}`}>
          {owned ? (character.isSecretUnlock ? 'Sblocco speciale ottenuto' : 'Nella tua collezione') : character.isSecretUnlock ? 'Sblocco speciale' : character.price ? `${character.price} monete nel Negozio` : 'Ancora da ottenere'}
        </p>
      </div>
    </article>
  );
}

export function CollectionView({characters, playerData, typeStyles, isPreview, onBack, onCatalog, onShop}) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('Tutti');
  const [sort, setSort] = useState('az');
  const entries = getCollectionEntries(characters, playerData?.unlockedChars);
  const allOwned = entries.filter(entry => entry.owned).length;
  const total = entries.length;
  const percentage = total ? Math.round(allOwned / total * 100) : 0;
  const types = [...new Set(entries.flatMap(entry => entry.character.types || []))].sort((a,b) => a.localeCompare(b, 'it'));

  const normalizedSearch = search.trim().toLocaleLowerCase('it');
  const visible = entries.filter(({character}) =>
    (!normalizedSearch || character.name.toLocaleLowerCase('it').includes(normalizedSearch)) &&
    (filterType === 'Tutti' || (character.types || []).includes(filterType))
  ).sort((a,b) => sort === 'recent'
    ? (characters.indexOf(b.character) - characters.indexOf(a.character))
    : a.character.name.localeCompare(b.character.name, 'it'));

  const owned = visible.filter(entry => entry.owned);
  const locked = visible.filter(entry => !entry.owned);
  const grid = 'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5';
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080c1d] px-3 pb-16 pt-5 text-white sm:px-6">
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-[110%] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-3xl" aria-hidden="true"/>
      <div className="relative mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={onBack} className="rounded-xl border border-slate-600 bg-slate-900/90 px-4 py-2.5 font-bold text-slate-200 transition-colors hover:border-cyan-400 hover:text-cyan-300">← Torna al menu</button>
          <button type="button" onClick={onCatalog} className="rounded-xl border border-violet-500/40 bg-violet-900/30 px-4 py-2.5 text-sm font-bold text-violet-200 hover:bg-violet-800/40">📖 Catalogo completo</button>
        </header>
        <div className="mb-7 text-center">
          <span className="text-xs font-black uppercase tracking-[.3em] text-cyan-400">✦ Il tuo archivio personale</span>
          <h1 className="mt-2 bg-gradient-to-r from-cyan-300 via-white to-fuchsia-300 bg-clip-text text-3xl font-black text-transparent sm:text-5xl">Collezione Multimon</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300 sm:text-base">I tuoi campioni conquistati, e tutti quelli che aspettano ancora di unirsi a te.</p>
          {isPreview && <p className="mx-auto mt-3 max-w-xl text-xs text-amber-300">In anteprima alcuni Multimon sono giocabili temporaneamente: qui contano solo quelli ottenuti davvero.</p>}
        </div>
        <section className="mb-7 rounded-3xl border border-cyan-500/20 bg-slate-900/70 p-5 shadow-xl" aria-label="Avanzamento della collezione">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-xs font-bold uppercase tracking-widest text-cyan-300">Progressi collezione</p><p className="mt-1 text-2xl font-black sm:text-3xl">{allOwned} <span className="text-lg font-medium text-slate-400">/ {total} Multimon</span></p></div>
            <div className="text-right"><p className="text-3xl font-black text-emerald-300">{percentage}%</p><p className="text-xs text-slate-400">Completamento</p></div>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-700" role="progressbar" aria-label="Completamento collezione" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage}>
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 transition-all" style={{width: `${percentage}%`}}/>
          </div>
          <div className="mt-3 flex justify-between text-xs font-semibold"><span className="text-emerald-300">✓ {allOwned} ottenuti</span><span className="text-slate-400">🔒 {total-allOwned} mancanti</span></div>
        </section>
        <div className="mb-8 flex flex-wrap gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/60 p-3">
          <label className="min-w-[190px] flex-[2]"><span className="mb-1 block text-xs font-bold text-slate-300">Cerca un Multimon</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nome del personaggio..." aria-label="Cerca Multimon" className="w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"/></label>
          <label className="min-w-[130px] flex-1"><span className="mb-1 block text-xs font-bold text-slate-300">Tipo</span><select value={filterType} onChange={e=>setFilterType(e.target.value)} className="w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2.5 text-sm text-white">{['Tutti', ...types].map(type=><option key={type} value={type}>{type}</option>)}</select></label>
          <label className="min-w-[130px] flex-1"><span className="mb-1 block text-xs font-bold text-slate-300">Ordina</span><select value={sort} onChange={e=>setSort(e.target.value)} className="w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2.5 text-sm text-white"><option value="az">Nome A–Z</option><option value="recent">Nuovi arrivi prima</option></select></label>
        </div>
        <section aria-labelledby="collection-owned-heading" className="mb-12">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-emerald-400/20 pb-3">
            <h2 id="collection-owned-heading" className="text-xl font-black text-emerald-300 sm:text-2xl">✨ I tuoi Multimon <span className="text-sm text-emerald-200/70">({owned.length})</span></h2>
            <span className="text-xs text-slate-400">Già disponibili nel tuo roster</span>
          </div>
          {owned.length ? <div className={grid}>{owned.map(entry=><CollectionCard key={entry.character.id} entry={entry} typeStyles={typeStyles}/>)}</div> : <p className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-6 text-center text-slate-400">{search || filterType !== 'Tutti' ? 'Nessun Multimon ottenuto corrisponde ai filtri.' : 'Non hai ancora Multimon in questa sezione.'}</p>}
        </section>
        <section aria-labelledby="collection-locked-heading">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-600/50 pb-3">
            <h2 id="collection-locked-heading" className="text-xl font-black text-slate-200 sm:text-2xl">🔒 Ancora da sbloccare <span className="text-sm text-slate-400">({locked.length})</span></h2>
            <button type="button" onClick={onShop} className="rounded-lg border border-amber-500/40 bg-amber-950/40 px-3 py-2 text-xs font-bold text-amber-200 hover:bg-amber-900/40">🛒 Vai al Negozio</button>
          </div>
          {locked.length ? <div className={grid}>{locked.map(entry=><CollectionCard key={entry.character.id} entry={entry} typeStyles={typeStyles}/>)}</div> : <p className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-6 text-center text-slate-400">{search || filterType !== 'Tutti' ? 'Nessun personaggio da sbloccare corrisponde ai filtri.' : 'Complimenti! Hai completato la collezione!'}</p>}
        </section>
      </div>
    </main>
  );
}
