// Solo dati persistenti: mai sincronizzare stanze temporanee o credenziali.
export const SAVED_EXACT_KEYS = Object.freeze([
 'multiverse_rpg_global_profile','multiverse_rpg_saved_name',
 'multiverse_rpg_saved_avatar','multiverse_rpg_roguelike_save',
 'multimon_completed_campaigns_v1'
]);
export const SAVED_PREFIXES = Object.freeze([
 'multiverse_rpg_campaign_save_','multimon_event_reward_'
]);
const owned = key => SAVED_EXACT_KEYS.includes(key) || SAVED_PREFIXES.some(prefix=>key.startsWith(prefix));
export const PROFILE_STORE_VERSION = 1;
export const GUEST_BACKUP_KEY = 'multimon_guest_progress_backup_v1';
export const ACTIVE_ACCOUNT_KEY = 'multimon_cloud_account_uid_v1';
export const LOCAL_ACCOUNT_BACKUP_PREFIX = 'multimon_cloud_backup_';
export function collectProgress(store=localStorage) {
 const result={};
 for(let i=0;i<store.length;i++) {
  const key=store.key(i);
  if(key && owned(key)) {
   const value=store.getItem(key);
   if(value!==null)result[key]=value;
  }
 }
 return result;
}
export function clearProgress(store=localStorage) {
 const keys=[];
 for(let i=0;i<store.length;i++) {
  const key=store.key(i);
  if(key && owned(key))keys.push(key);
 }
 keys.forEach(key=>store.removeItem(key));
}
export function restoreProgress(entries,store=localStorage) {
 if(!entries || typeof entries!=='object'||Array.isArray(entries))throw Error('Salvataggio non valido');
 clearProgress(store);
 for(const [key,value] of Object.entries(entries))if(owned(key)&&typeof value==='string')store.setItem(key,value);
}
export const progressFingerprint = entries => JSON.stringify(Object.entries(entries).sort(([a],[b])=>a.localeCompare(b)));
export function saveLocalBackup(name,store=localStorage) {
 store.setItem(name,JSON.stringify({version:PROFILE_STORE_VERSION,entries:collectProgress(store),createdAt:Date.now()}));
}
export function readLocalBackup(name,store=localStorage) {
 try { const value=JSON.parse(store.getItem(name)||'null');return value?.entries&&typeof value.entries==='object'?value.entries:null; }
 catch{return null;}
}
export function assertCloudSize(entries) {
 if(JSON.stringify(entries).length>750000)throw Error('Il salvataggio è troppo grande per il cloud. I dati locali rimangono intatti.');
 return entries;
}