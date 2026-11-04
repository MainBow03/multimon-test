import React from 'react';

const ROOM_SESSION_KEY = 'multiverse_rpg_session';

// L'Error Boundary intercetta gli errori di rendering dei figli (AccountGate
// incluso). Non altera né cancella i salvataggi dei giocatori.
export class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, componentStack: '', copied: false, copyFailed: false };
    this.reportRef = React.createRef();
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ componentStack: info?.componentStack || '' });
    console.error('Multimon: errore React intercettato', error, info);
  }

  errorReport() {
    const error = this.state.error;
    return [
      'MULTIMON - ERRORE DI INTERFACCIA',
      'Data: ' + new Date().toISOString(),
      'Pagina: ' + window.location.pathname,
      'Messaggio: ' + (error?.message || String(error || 'Errore sconosciuto')),
      'Stack: ' + (error?.stack || '(non disponibile)'),
      'Componenti: ' + (this.state.componentStack || '(non disponibili)')
    ].join('\n').slice(0, 12000);
  }

  async copyReport() {
    const report = this.errorReport();
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard non disponibile');
      await navigator.clipboard.writeText(report);
      this.setState({ copied: true, copyFailed: false });
    } catch {
      // Il report resta selezionabile anche su browser senza Clipboard API.
      this.reportRef.current?.select();
      this.setState({ copied: false, copyFailed: true });
    }
  }

  returnToMenu() {
    try {
      // Rimuove esclusivamente la sessione temporanea della stanza.
      // Profilo, monete, progressi, campagne e backup non vengono toccati.
      localStorage.removeItem(ROOM_SESSION_KEY);
    } catch (error) {
      console.warn('Impossibile eliminare la sessione temporanea:', error);
    }
    window.location.reload();
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 sm:p-8">
        <section role="alert" className="w-full max-w-2xl rounded-3xl border border-rose-500/40 bg-slate-900 p-6 sm:p-9 shadow-2xl space-y-5">
          <div className="text-xs tracking-[.2em] uppercase font-black text-rose-300">Multimon · Recupero</div>
          <h1 className="text-2xl sm:text-3xl font-black">Si è verificato un errore nell'interfaccia</h1>
          <p className="text-slate-300 leading-relaxed">Il gioco ha interrotto questa schermata per evitare di mostrare una pagina nera. I tuoi progressi salvati non sono stati cancellati.</p>
          <div className="rounded-xl bg-slate-950 border border-slate-700 p-4 text-rose-200 text-sm break-words">
            {this.state.error?.message || 'Errore imprevisto di rendering'}
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => window.location.reload()}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl px-5 py-3">
              Ricarica e riprova
            </button>
            <button type="button" onClick={() => this.returnToMenu()}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold rounded-xl px-5 py-3">
              Torna al menu
            </button>
            <button type="button" onClick={() => this.copyReport()}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold rounded-xl px-5 py-3">
              {this.state.copied ? 'Dettagli copiati!' : 'Copia dettagli errore'}
            </button>
          </div>
          {this.state.copyFailed && <p className="text-amber-300 text-sm">Copia automatica non disponibile: seleziona il testo qui sotto e copialo manualmente.</p>}
          <details className="border-t border-slate-700 pt-4 text-sm text-slate-400">
            <summary className="cursor-pointer font-semibold">Dettagli tecnici (condivisibili per segnalare il bug)</summary>
            <textarea ref={this.reportRef} readOnly value={this.errorReport()} aria-label="Dettagli tecnici dell'errore"
              className="mt-3 w-full h-40 bg-slate-950 border border-slate-700 rounded-xl p-3 font-mono text-xs text-slate-200" />
          </details>
        </section>
      </main>
    );
  }
}
