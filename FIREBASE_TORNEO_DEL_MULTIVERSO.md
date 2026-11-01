# Regole Firestore — Torneo del Multiverso

Queste regole vanno **aggiunte** dentro il tuo blocco esistente `service cloud.firestore { match /databases/{database}/documents { ... } }`. Non cancellare le regole delle altre modalità. In assenza di queste autorizzazioni, il torneo online può mostrare `Missing or insufficient permissions`.

```firestore
match /artifacts/{appId}/public/data/multiverse_events/{eventId} {
  allow get, list: if request.auth != null;
  allow create: if request.auth != null
    && request.resource.data.hostId == request.auth.uid
    && request.resource.data.status == 'lobby';
  allow update: if request.auth != null
    && resource.data.hostId == request.auth.uid
    && request.resource.data.hostId == resource.data.hostId
    && request.resource.data.createdAt == resource.data.createdAt;
  allow delete: if false;

  match /players/{uid} {
    allow get, list: if request.auth != null;
    allow create: if request.auth != null && request.auth.uid == uid
      && request.resource.data.uid == uid
      && get(/databases/$(database)/documents/artifacts/$(appId)/public/data/multiverse_events/$(eventId)).data.status == 'lobby';
    allow update: if request.auth != null && request.auth.uid == uid
      && request.resource.data.uid == uid
      && get(/databases/$(database)/documents/artifacts/$(appId)/public/data/multiverse_events/$(eventId)).data.status == 'lobby'
      && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['teamIds', 'heldItems', 'ready']);
    allow delete: if false;
  }
  match /commands/{commandId} {
    allow get, list: if request.auth != null;
    allow create, update: if request.auth != null
      && request.resource.data.uid == request.auth.uid
      && get(/databases/$(database)/documents/artifacts/$(appId)/public/data/multiverse_events/$(eventId)).data.status == 'running'
      && exists(/databases/$(database)/documents/artifacts/$(appId)/public/data/multiverse_events/$(eventId)/players/$(request.auth.uid));
    allow delete: if false;
  }
}
```

## Limiti attuali

- Il browser dell'host deve rimanere aperto per gestire i turni, anche quando non combatte.
- Gli scontri bot contro bot sono simulati velocemente senza richiedere a persone di comandarli.
- I premi sono conservati nel profilo locale (un accredito per evento), non sono verificati da un server: non sono un sistema anti-cheat. Per premi competitivi verificabili sono necessarie Cloud Functions e profili server-side.
- L'arena usa un motore dedicato *semplificato*: danni, tipi, status di base, Iper e Iperband sono presenti; le eccezioni e abilità più avanzate del motore classico non sono tutte coperte.
- Prova prima in due browser con autenticazioni diverse e conserva le regole Firestore originali per le stanze.
