# Controlli da effettuare in una partita reale

Usa una finestra in navigazione privata e un repository GitHub Pages separato dalla versione principale.

1. **Avvio:** il menu appare, gli avatar e gli stili si caricano e la console non segnala eccezioni.
2. **Battaglia normale:** entra nel draft, seleziona i personaggi, esegui mosse e cambi, termina il combattimento e torna al menu.
3. **Campagna:** prova la mappa, la selezione squadra, lo shop e una vittoria a metà campagna. Il progresso deve continuare come prima.
4. **Finale Crisi del Varco:** completa `m38` e usa “Continua e Vedi Epilogo”; devono apparire 4 battute (Trigon, Gaster, Finn e Topolino) prima del finale. Non deve apparire uno schermo vuoto permanente.
5. **Salvataggi:** ricarica la pagina a metà campagna; verifica che roster, salute e monete siano ancora giusti.
6. **Firebase:** controlla accesso, creazione stanza, ingresso secondo giocatore, sincronizzazione turno e uscita.
7. **Altre modalità:** verifica un torneo, uno scontro roguelike e l'uso del negozio globale.

I test automatizzati non sostituiscono questi controlli. Se la build GitHub Actions fallisce, apri il log in Actions e conserva la versione principale invariata.
