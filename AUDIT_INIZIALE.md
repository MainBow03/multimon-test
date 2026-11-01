# Audit iniziale di Multimon

## Dati del file esaminato

- File sorgente: `Testo incollato(3).txt`
- Dimensione: circa 1,08 MB
- Lunghezza: 12.978 righe
- Architettura originale: una singola pagina HTML con React 18, JSX compilato nel browser da Babel Standalone, Tailwind via CDN e Firebase JS SDK via import da URL.

## Mappa iniziale del codice

- **Database mosse**: riga 166.
- **Roster personaggi**: riga 1091.
- **Personaggi fusione**: riga 1317.
- **Dati campagne**: riga 1339.
- **Componente principale React**: riga 2854.
- **Stato iniziale della partita**: riga 2810.
- **Helper che collega dialoghi e roster**: riga 2713.
- **Configurazione Firebase**: riga 110.

## Rischi architetturali osservati

1. **Componente monolitico:** `App()` contiene moltissimo stato e logica di più modalità di gioco. Questo rende più rischiose le modifiche perché stato, UI e regole sono strettamente intrecciati.
2. **Dati e logica mescolati:** mosse, roster, fusioni e campagne sono definiti nello stesso file della UI.
3. **Compilazione nel browser:** Babel Standalone carica e compila un file enorme a runtime. Vite permette di fare questa compilazione in fase di build.
4. **Firebase accoppiato alla UI:** inizializzazione e accesso a Firestore sono nello stesso file dell'applicazione. In una fase successiva conviene spostarli in `src/firebase/`, dopo aver verificato il comportamento attuale.
5. **Tailwind via CDN:** mantenuto nella prima migrazione per non cambiare contemporaneamente il sistema di stile. In futuro si può valutare una configurazione Tailwind compilata.
6. **Preview e ambiente online:** il codice distingue l'anteprima dall'ambiente online tramite hostname/protocollo. Va testato anche dopo la pubblicazione, perché i comportamenti di preview influenzano alcune funzioni.

## Problemi da testare prioritariamente

- Completamento della missione finale della campagna `crisi_varco` e apertura dell'epilogo.
- Caricamento e salvataggio della campagna in `localStorage`.
- Login anonimo Firebase e aggiornamento dello stato utente.
- Creazione/entrata nelle stanze e sincronizzazione Firestore.
- Inizio e conclusione delle battaglie, cambi, mosse, passivi e forme iper.
- Sblocco personaggi, fusioni, negozio e progressione.
- Funzionamento dei vari tornei e modalità di gioco.

## Strategia prudente

La migrazione iniziale sposta il CSS fuori dall'HTML, converte il progetto a Vite + React ed estrae già i dati statici principali in `src/data/gameData.js` e l'inizializzazione Firebase in `src/firebase/config.js`. La logica UI e gran parte dei sistemi restano in `App.jsx`: è intenzionale, perché prima si verifica che il gioco parta e poi si estraggono sistemi e schermate uno alla volta. Evita di cambiare simultaneamente architettura e regole di gioco.

## Limiti di questa analisi

L'ispezione statica del file non dimostra che tutte le funzioni siano corrette. Il progetto deve essere eseguito e testato in un browser con Firebase. Non sono state cambiate le regole di combattimento o i dati di gioco in questa migrazione.

## Workaround epilogo incluso nella copia di lavoro

La schermata vittoria della missione finale della campagna `crisi_varco` è stata modificata per passare direttamente a `campaign_ending`, evitando il passaggio post-dialogo che l'utente ha segnalato come bloccante. È un workaround mirato e non una causa radice dimostrata; salta eventuali righe di post-dialogo della missione finale. Va verificato nel browser prima di considerarlo risolto.
