# Pubblicare Multimon su GitHub Pages senza Bash

Questo pacchetto è un progetto **Vite/React**, non un semplice HTML apribile direttamente come file. La compilazione è necessaria perché il browser di GitHub Pages possa caricare i moduli e le dipendenze: **GitHub Actions esegue la compilazione per te**.

## Passaggi sul sito GitHub

1. Scarica e **estrai** lo ZIP. Apri la cartella `Multimon_Modulare_v2`.
2. Su GitHub crea un nuovo repository, oppure usa un repository di **prova** per non sovrascrivere la versione del gioco già online. Per il test consigliamo un nuovo repository.
3. Nella pagina del repository seleziona **Add file → Upload files**. Carica **il contenuto** della cartella `Multimon_Modulare_v2`, mantenendo le sottocartelle, inclusa `.github/workflows/deploy-pages.yml`, e conferma con **Commit changes**. Se il browser non mantiene le sottocartelle o non permette la cartella `.github`, usa l'editor di GitHub per creare manualmente quel file al percorso preciso `.github/workflows/deploy-pages.yml`.
4. Vai in **Settings → Pages** e imposta **Build and deployment → Source: GitHub Actions**.
5. Apri la scheda **Actions**: cerca il flusso "Pubblica Multimon su GitHub Pages". Se non parte automaticamente, aprilo e clicca **Run workflow** (ramo `main`).
6. Quando il flusso risulta concluso con successo, in **Settings → Pages** trovi il link del sito pubblicato. Nei repository di progetto in genere è `https://NOMEUTENTE.github.io/NOMEREPOSITORY/`.

### Attenzione

- Il workflow parte sul branch `main`. Se il tuo repository usa un branch diverso, aggiorna `branches: [main]` nel file `.github/workflows/deploy-pages.yml`.
- **Non** caricare lo ZIP direttamente nel repository aspettandoti che Pages lo esegua: devi estrarlo e caricarne i file.
- La versione 2 è stata controllata staticamente e con test della progressione, **ma non ancora provata in un browser con Firebase**. Evita di sostituire subito il sito principale.
- Se l'accesso Firebase non funziona sul nuovo URL, controlla anche **Firebase Authentication → Settings → Authorized domains** e le regole di Firestore.
- Il flusso di Crisi del Varco mostra ora il post-dialogo originale di m38 prima del finale. Il passaggio è stato simulato automaticamente, ma va verificato durante una partita reale.
- **Importante sui salvataggi:** se il nuovo repository si trova sullo stesso `username.github.io` del gioco originale, entrambi possono condividere i dati `localStorage` del browser. Usa una **finestra in incognito** per testare il nuovo sito senza toccare i salvataggi correnti.

## Perché si parlava di Bash?

I comandi `npm install` e `npm run build` servivano soltanto per provare/compilare il gioco **sul tuo computer**. Con il workflow presente in `.github/workflows`, vengono lanciati da GitHub al caricamento dei file. Non devi aprire il terminale sul tuo PC.
