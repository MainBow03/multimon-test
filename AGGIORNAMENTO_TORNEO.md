# Multimon — Campagne a progressione e Torneo del Multiverso (beta)

## Storia
- Solo **Crisi del Varco Rotto** è disponibile inizialmente.
- Dopo averla completata si sblocca **Torneo Assoluto**.
- Dopo aver completato Torneo Assoluto si sblocca **L'Ombra di Monarch**.
- Il completamento è salvato separatamente dai file di salvataggio di ciascuna campagna. Sono riconosciuti vecchi salvataggi che contengono `completed:true`, ma non si può ricostruire una vittoria passata se il salvataggio è già stato cancellato.

## Negozio
- Mahito acquistabile per 250 monete.
- Nuova illustrazione SVG per Iperband, visibile nello shop, nel draft e nell'arena.

## Torneo del Multiverso
- Invito globale e lobby condivisa via Firebase.
- Host sceglie 4/8/16/32 squadre, 4–8 Multimon per utente, 1/2/3/4 in campo in singolo oppure 1–2 per utente in lotta multipla (2 utenti contro 2).
- L'host può aggiungere bot con nomi e squadre personalizzate e riordinare i partecipanti per formare le coppie. 16 coppie richiedono 32 persone/bot.
- Bracket a eliminazione, un incontro alla volta, terzo posto e spettatori con prospettiva selezionabile. Gli scontri bot contro bot sono simulati.
- Strumenti e Iper attivabili/disattivabili dall'host.
- Premi: primo 400 (il doppio del torneo standard), secondo 200, terzo 140, tutti gli altri 50 monete.

## Attenzione
La modalità evento è una **beta**; la build può passare, ma il multiplayer va ancora verificato realmente con più browser. L'arena usa un motore di combattimento dedicato e semplificato, che non include ancora tutte le eccezioni delle mosse e abilità tradizionali.

Prima di testarla online, integra **solo** il blocco Firestore di `FIREBASE_TORNEO_DEL_MULTIVERSO.md` nelle regole che già utilizzi. Non sostituire le vecchie regole.
