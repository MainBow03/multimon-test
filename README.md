# MULTIMON — versione modulare 2

Questa cartella è una **copia** del gioco: l’HTML originale non è stato sostituito. Non caricare lo ZIP come singolo file su Pages: **estrailo** e carica i file e le sottocartelle nel repository.

## Che cosa è stato separato

- `src/App.jsx`: stato React centrale, sincronizzazione e orchestrazione (circa 1.500 righe, rispetto alle oltre 10.000 precedenti).
- `src/screens/campaign/`: selezione, mappa, dialoghi, squadre, negozio e finale.
- `src/screens/battle/`: lobby, draft, lotta, vittoria/sconfitta, preparazione e intervalli.
- `src/screens/roguelike/`: le relative schermate.
- `src/screens/hub/`: menu, shop globale, statistiche, catalogo e affinità.
- `src/systems/battleSystem.js`: regole di combattimento, IA, danni, turni, eventi.
- `src/systems/campaignFlow.js`: caricamento e avanzamento della campagna.
- `src/systems/multiplayerSystem.js`: gestione stanze, lobby, draft e sessioni.
- `src/systems/tournamentSystem.js`, `roguelikeSystem.js`, `profileSystem.js`: logica delle rispettive modalità.
- `src/data/`: file distinti per personaggi, mosse, fusioni, campagne, oggetti, prezzi, tipi, soundtrack; `gameData.js` resta come indice compatibile.
- `src/firebase/config.js`: configurazione già presente nel progetto originario.

Le funzioni e le schermate sono state spostate conservando il loro corpo, usando un contesto di dipendenze esplicito. **Non è una riscrittura delle regole del gioco**. Alcune funzioni molto grandi restano intere nei moduli dedicati: suddividerne ulteriormente gli algoritmi richiederebbe test di gameplay più approfonditi.

## Correzione della missione finale di Crisi del Varco

1. Dopo Cell (`m37`), la campagna procede alla missione raid `m38`, con Trigon e Gaster.
2. Dopo la vittoria nel raid, il pulsante apre il post-dialogo originale **senza saltarne le quattro battute**.
3. Finite le battute, la campagna apre la schermata conclusiva; l'indice dell'area resta valido e lo stato viene marcato `completed`.
4. In caso di dialoghi mancanti, compare un pulsante esplicito invece di far partire `setTimeout` durante il render. La stessa precauzione è applicata ai dialoghi iniziali e di risoluzione.
5. Il testo della conclusione di Crisi del Varco riconosce gli avversari effettivi dell'ultimo raid.

## Pubblicazione GitHub Pages senza Bash

Leggi `GITHUB_PAGES_SENZA_BASH.md`. GitHub Actions esegue `npm install`, `npm test` e `npm run build`, e pubblica `dist/` automaticamente. **Non devi eseguire Bash sul tuo PC.**

## Verifiche eseguite

- Sintassi dei moduli controllata in modo statico.
- 7 test automatici di avanzamento campagna superati, incluso il passaggio m37 → m38 → finale.
- Simulazione del click sulla vittoria, delle quattro battute con click e dell'apertura del finale riuscita.
- Verifica dei riferimenti delle funzioni estratte effettuata tramite analisi statica.

**Da verificare con il browser e Firebase:** compilazione Vite completa (registro npm non raggiungibile nell'ambiente di preparazione), rete/stanze, passivi e attacchi in una partita reale, caricamento immagini, autenticazione e salvataggi. Per questo pubblica e prova inizialmente nel repository di test.

**SALVATAGGI:** GitHub Pages di due repository dello stesso account (`username.github.io/gioco1/` e `/gioco2/`) condivide l’origine browser e quindi può condividere `localStorage`! Apri il repository di prova in **navigazione privata** per non interferire con i salvataggi della versione principale.
