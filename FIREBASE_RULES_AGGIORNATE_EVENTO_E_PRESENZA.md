# Regole Firestore complete — Multimon (evento, account e presenza)

Questa versione sostituisce le regole precedenti. **Fai prima una copia delle regole attive**.

Firebase Console → fakemon-cartoon → Firestore Database → Rules → sostituisci tutto → Publish.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Compatibilità con le vecchie stanze: regola originale permissiva.
    // Per uso pubblico va sostituita in un secondo aggiornamento con
    // controlli sulle stanze. Non estenderla ad altre raccolte.
    match /artifacts/{appId}/public/data/rooms/{roomId} {
      allow read, write: if true;
    }

    // Presenza online: solo persone autenticate possono leggere;
    // solo il proprietario della sessione può modificarla.
    match /artifacts/{appId}/public/data/online_users/{sessionId} {
      allow get, list: if request.auth != null;
      allow create: if request.auth != null
        && request.resource.data.uid == request.auth.uid
        && request.resource.data.sessionId == sessionId;
      allow update: if request.auth != null
        && resource.data.uid == request.auth.uid
        && request.resource.data.uid == request.auth.uid
        && request.resource.data.sessionId == sessionId;
      allow delete: if request.auth != null
        && resource.data.uid == request.auth.uid;
    }

    // Torneo del Multiverso
    match /artifacts/{appId}/public/data/multiverse_events/{eventId} {
      function eventPath() {
        return /databases/$(database)/documents/artifacts/$(appId)/public/data/multiverse_events/$(eventId);
      }
      function isHostOrExpired() {
        return request.auth != null
          && (
            get(eventPath()).data.hostId == request.auth.uid
            || (
              get(eventPath()).data.hostHeartbeatAt is timestamp
              && request.time > get(eventPath()).data.hostHeartbeatAt
                + duration.value(5, 'm')
            )
          );
      }

      allow get, list: if request.auth != null;
      allow create: if request.auth != null
        && request.resource.data.hostId == request.auth.uid
        && request.resource.data.status == 'lobby';
      allow update: if request.auth != null
        && resource.data.hostId == request.auth.uid
        && request.resource.data.hostId == resource.data.hostId
        && request.resource.data.createdAt == resource.data.createdAt;
      allow delete: if isHostOrExpired();

      match /players/{uid} {
        allow get, list: if request.auth != null;
        allow create: if request.auth != null
          && request.auth.uid == uid
          && request.resource.data.uid == uid
          && get(eventPath()).data.status == 'lobby';
        allow update: if request.auth != null
          && request.auth.uid == uid
          && resource.data.uid == uid
          && request.resource.data.uid == uid
          && get(eventPath()).data.status == 'lobby'
          && request.resource.data.diff(resource.data).affectedKeys()
            .hasOnly(['teamIds','heldItems','ready']);
        allow delete: if isHostOrExpired();
      }

      match /commands/{commandId} {
        allow get, list: if request.auth != null;
        allow create: if request.auth != null
          && request.resource.data.uid == request.auth.uid
          && get(eventPath()).data.status == 'running'
          && exists(
            /databases/$(database)/documents/artifacts/$(appId)/public/data/multiverse_events/$(eventId)/players/$(request.auth.uid)
          );
        allow update: if request.auth != null
          && resource.data.uid == request.auth.uid
          && request.resource.data.uid == request.auth.uid
          && get(eventPath()).data.status == 'running'
          && exists(
            /databases/$(database)/documents/artifacts/$(appId)/public/data/multiverse_events/$(eventId)/players/$(request.auth.uid)
          );
        allow delete: if isHostOrExpired();
      }
    }

    // Salvataggi cloud con email e password, isolati per proprietario.
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
  }
}
```

## Come funziona la scadenza

- L'host aggiorna `hostHeartbeatAt` circa ogni 25 secondi.
- Se la pagina viene chiusa senza terminare l'evento, il torneo smette di comparire dopo 5 minuti senza heartbeat.
- Quando l'host sceglie **Esci e termina torneo**, il gioco elimina i documenti dell'evento e le relative sottocollezioni.
- Un client connesso può fare pulizia di tornei scaduti, ma le regole Firestore autorizzano l'eliminazione **solo dopo 5 minuti dall'ultimo heartbeat verificato dal server**.
- Non è una procedura di pulizia programmata garantita se nessun browser è online. Per eliminazione automatica indipendente dai client servirebbe Cloud Functions oppure una politica TTL Firestore.
- La sezione **Giocatori Online** usa `online_users`, con accesso autenticato e filtro di 90 secondi.

## Nota sicurezza

La regola delle stanze rimane quella originaria e quindi è permissiva. I premi del torneo restano calcolati dal browser e non sono anti-cheat; proteggere premi competitivi richiede validazione server.
