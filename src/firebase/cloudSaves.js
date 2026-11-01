import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, appId } from './config.js';
import { PROFILE_STORE_VERSION, assertCloudSize } from '../systems/progressStorage.js';
const ref=uid=>doc(db,'artifacts',appId,'users',uid,'saves','current');
export async function downloadCloudSave(uid) {
 const snap=await getDoc(ref(uid));
 if(!snap.exists())return null;
 const value=snap.data();
 if(value.version!==PROFILE_STORE_VERSION||!value.entries||typeof value.entries!=='object')throw Error('Formato del salvataggio non riconosciuto.');
 return value.entries;
}
export async function uploadCloudSave(uid,entries) {
 assertCloudSize(entries);
 await setDoc(ref(uid),{version:PROFILE_STORE_VERSION,entries,savedAt:serverTimestamp()});
}