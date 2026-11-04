import {progressFingerprint} from './progressStorage.js';

// Se Firebase ha dimenticato le credenziali ma questo browser ricorda
// l'UID account, non trasformare automaticamente l'utente in ospite.
export function requiresAccountReauthentication(knownUid,firebaseUser){
 return Boolean(knownUid && (!firebaseUser||firebaseUser.isAnonymous||!firebaseUser.email));
}
export function hasMeaningfulLocalProgress(entries={}){
 return Object.keys(entries).some(key=>
  key!=='multiverse_rpg_saved_name' && key!=='multiverse_rpg_saved_avatar');
}
// Senza la stessa copia di salvataggio, nessun download automatico:
// il giocatore sceglie quale tenere.
export function shouldPromptSaveConflict(activeUid,loginUid,localEntries,remoteEntries){
 const different=progressFingerprint(localEntries)!==progressFingerprint(remoteEntries);
 return different&&(activeUid===loginUid||(!activeUid&&hasMeaningfulLocalProgress(localEntries)));
}
