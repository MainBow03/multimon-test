import { doc, getDoc, setDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db, appId } from './config.js';
import { PROFILE_STORE_VERSION, assertCloudSize, progressFingerprint } from '../systems/progressStorage.js';
const ref=uid=>doc(db,'artifacts',appId,'users',uid,'saves','current');
export async function downloadCloudSave(uid) {
 const snap=await getDoc(ref(uid));
 if(!snap.exists())return null;
 const value=snap.data();
 if(value.version!==PROFILE_STORE_VERSION||!value.entries||typeof value.entries!=='object')throw Error('Formato del salvataggio non riconosciuto.');
 return value.entries;
}
// Le scritture automatiche richiedono che il cloud sia rimasto nella
// stessa versione scaricata: una vecchia scheda/dispositivo non può
// cancellare in silenzio ore di gioco salvate da un altro dispositivo.
export async function uploadCloudSave(uid,entries,expectedFingerprint=null) {
 assertCloudSize(entries);
 const document=ref(uid);
 if(expectedFingerprint!==null){
  await runTransaction(db,async tx=>{
   const snap=await tx.get(document);
   if(!snap.exists() || progressFingerprint(snap.data()?.entries||{})!==expectedFingerprint){
    const error=new Error('Salvataggio cloud modificato da un’altra sessione. Scegli quale versione tenere.');
    error.code='multimon/cloud-conflict';
    throw error;
   }
   tx.set(document,{version:PROFILE_STORE_VERSION,entries,savedAt:serverTimestamp()});
  });
  return;
 }
 await setDoc(document,{version:PROFILE_STORE_VERSION,entries,savedAt:serverTimestamp()});
}