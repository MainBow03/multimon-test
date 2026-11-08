import React from 'react';
import { analyzeTeam } from '../systems/teamAdvisor.js';

// Il pannello è informativo: non seleziona né sostituisce personaggi automaticamente.
export function TeamAdvisor({ team = [], availableChars = [], teamSize = 6 }) {
  const report = analyzeTeam(team, availableChars, teamSize);
  const hasTeam = report.picked > 0;
  const issues = report.warnings.length;
  return (
    <details className="relative z-10 mb-3 shrink-0 rounded-2xl border border-cyan-500/40 bg-slate-950/90 text-slate-100 shadow-[0_8px_30px_rgba(8,145,178,0.12)]">
      <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 rounded-2xl px-3 py-2.5 sm:px-4 hover:bg-cyan-950/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 [&::-webkit-details-marker]:hidden">
        <span className="flex min-w-0 items-center gap-2">
          <span aria-hidden="true" className="text-xl">🧠</span>
          <span className="font-black text-sm sm:text-base text-cyan-200">Consigliere strategico</span>
          <span className="text-[11px] text-slate-400">{report.picked}/{report.teamSize}</span>
        </span>
        <span className="flex items-center gap-2 text-xs font-bold">
          {hasTeam ? (
            <span className={issues ? 'text-amber-300' : 'text-emerald-300'}>
              {issues ? `${issues} osservazion${issues === 1 ? 'e' : 'i'}` : 'Nessun problema evidente'}
            </span>
          ) : (
            <span className="text-slate-400">Seleziona un Multimon</span>
          )}
          <span className="rounded-lg border border-cyan-500/30 bg-slate-800 px-2 py-1 text-cyan-200">Dettagli ▾</span>
        </span>
      </summary>
      <div className="max-h-[40vh] overflow-y-auto border-t border-slate-700/70 p-3 sm:p-4 custom-scrollbar">
        {!hasTeam ? (
          <p className="text-sm text-slate-300">Aggiungi un Multimon: controllerò ruoli, debolezze condivise e copertura delle mosse. I consigli si aggiornano mentre scegli.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <section className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
              <h3 className="mb-2 text-sm font-black text-amber-200">Cosa migliorare</h3>
              {issues ? (
                <ul className="space-y-2">
                  {report.warnings.map(warning => (
                    <li key={warning.id} className="rounded-lg border border-amber-500/20 bg-amber-950/20 px-3 py-2 text-xs">
                      <div className="font-bold text-amber-100">⚠ {warning.text}</div>
                      <p className="mt-0.5 text-slate-300">{warning.detail}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-emerald-200">Non emergono criticità particolari con i Multimon attualmente scelti.</p>
              )}
              {report.strengths.length > 0 && (
                <div className="mt-3 border-t border-slate-700 pt-2">
                  <p className="mb-1 text-[11px] font-bold text-emerald-300">Punti di forza</p>
                  <div className="flex flex-wrap gap-1.5">
                    {report.strengths.map(strength => <span key={strength} className="rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2 py-1 text-[11px] text-emerald-100">{strength}</span>)}
                  </div>
                </div>
              )}
            </section>
            <section className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
              <h3 className="mb-1 text-sm font-black text-cyan-200">Multimon consigliati</h3>
              <p className="mb-2 text-[11px] text-slate-400">Scelte suggerite tra i personaggi disponibili, non aggiunte automaticamente.</p>
              {report.suggestions.length ? (
                <ul className="space-y-2">
                  {report.suggestions.map(({ character, reasons }) => (
                    <li key={character.id} className="flex items-center gap-3 rounded-xl border border-cyan-500/20 bg-slate-950/70 p-2">
                      {character.img && <img src={character.img} alt="" loading="lazy" className="h-12 w-12 shrink-0 rounded-lg border border-slate-700 bg-slate-900 object-contain" />}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-white" title={character.name}>{character.name}</p>
                        <p className="text-[11px] leading-relaxed text-cyan-100">{reasons.join(' · ')}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400">Nessuna alternativa specifica disponibile per le necessità individuate.</p>
              )}
              {report.picked === report.teamSize && <p className="mt-2 text-[11px] text-slate-400">Squadra completa: i consigli sono possibili sostituzioni, se la modalità le consente.</p>}
            </section>
            <p className="lg:col-span-2 text-[11px] text-slate-400">Analisi indicativa basata su chart tipi, statistiche e mosse. Passive, strumenti, meteo e sinergie speciali possono cambiare l'esito reale.</p>
          </div>
        )}
      </div>
    </details>
  );
}
