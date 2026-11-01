# Salvataggi cloud di Multimon (Email e Password)

## 1. Attivare Authentication

Firebase Console → Authentication → Sign-in method → **Email/Password** → Enable → Save.
**Lascia attivato anche Anonymous**, usato dalle modalità ospite.

## 2. Regola Firestore per l'account

Nella scheda Firestore Database → Rules, inserisci questo blocco **dentro**
`match /databases/{database}/documents { ... }`, sullo stesso livello dei
blocchi già esistenti per `rooms` e `multiverse_events`.
**NON eliminare le regole già presenti!**

```javascript
match /artifacts/{appId}/users/{uid}/saves/{saveId} {
  allow get, list: if request.auth != null
    && request.auth.uid == uid
    && request.auth.token.firebase.sign_in_provider == 'password';

  allow create, update: if request.auth != null
    && request.auth.uid == uid
    && request.auth.token.firebase.sign_in_provider == 'password'
    && request.resource.data.keys().hasOnly(['version','entries','savedAt'])
    && request.resource.data.version == 1
    && request.resource.data.entries is map;

  allow delete: if false;
}
```

## 3. Come funziona

- Registra un nuovo account dal browser dove giochi già, per importare i progressi.
- Accedendo da un nuovo dispositivo, Multimon scarica i dati del tuo account.
- Se un account non ha dati cloud, è richiesta una scelta esplicita prima
  di importare i dati locali o iniziare da zero.
- Se il cloud e il browser presentano progressi diversi, il gioco chiede quale usare.
- Monete, inventario, statistiche, personaggi, completamento e stato delle campagne,
  roguelike, nome, avatar e ricevute premio evento vengono sincronizzati.
- Le partite online in corso non sono ripristinate.
- I salvataggi vengono caricati periodicamente; premere **Salva ora** per confermare.
- Per provare l'aggiornamento, usa due browser e non giocare contemporaneamente
  con lo stesso account fino ai test di conflitto.

## Limiti di sicurezza

Le regole proteggono la riservatezza degli account, ma i premi vengono
calcolati nel browser: un sistema anticheat affidabile richiede convalida server.
Non pubblicare in chat credenziali, password o codici di recupero.
