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
 const desired=Object.fromEntries(Object.entries(entries)
  .filter(([key,value])=>owned(key)&&typeof value==='string'));
 const previous=collectProgress(store);
 // Prima scrivi i nuovi dati e solo dopo rimuovi quelli non più necessari.
 // Se la quota del browser è esaurita prova a riportare il vecchio salvataggio.
 try{
  for(const [key,value] of Object.entries(desired))store.setItem(key,value);
  for(const key of Object.keys(previous))if(!(key in desired))store.removeItem(key);
 }catch(error){
  try{
   for(const [key,value] of Object.entries(previous))store.setItem(key,value);
   for(const key of Object.keys(desired))if(!(key in previous))store.removeItem(key);
  }catch{}
  throw error;
 }
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
export const RECOVERY_BACKUP_PREFIX='multimon_recovery_backup_';
const recoveryOwned=name=>name===GUEST_BACKUP_KEY||
 name.startsWith(LOCAL_ACCOUNT_BACKUP_PREFIX)||name.startsWith(RECOVERY_BACKUP_PREFIX);

export function listRecoveryBackups(store=localStorage) {
 const result=[];
 for(let i=0;i<store.length;i++){
  const name=store.key(i);
  if(!name||!recoveryOwned(name))continue;
  try{
   const backup=JSON.parse(store.getItem(name)||'null');
   const entries=backup?.entries;
   if(!entries||typeof entries!=='object'||Array.isArray(entries))continue;
   const valid=Object.keys(entries).filter(owned);
   if(!valid.length)continue;
   result.push({name,createdAt:Number(backup.createdAt)||0,
     keys:valid.length,size:JSON.stringify(entries).length,
     label:name===GUEST_BACKUP_KEY?'Salvataggio ospite':
       name.startsWith(LOCAL_ACCOUNT_BACKUP_PREFIX)?'Salvataggio account precedente':
       'Copia di sicurezza automatica'});
  }catch{}
 }
 return result.sort((a,b)=>b.createdAt-a.createdAt);
}

// Rotazione di due copie per non saturare i pochi MB del localStorage.
// Non sovrascrive MAI il backup ospite o quello nominato per account.
export function createRecoverySnapshot(entries=collectProgress(),label='auto',store=localStorage) {
 if(!entries||!Object.keys(entries).some(owned))return null;
 const hash=progressFingerprint(entries);
 const newest=listRecoveryBackups(store).find(x=>x.name.startsWith(RECOVERY_BACKUP_PREFIX));
 if(newest){
  const previous=readLocalBackup(newest.name,store);
  if(previous && progressFingerprint(previous)===hash)return newest.name;
 }
 // Un nuovo backup deve avere un timestamp distinto anche se più salvataggi
 // avvengono nello stesso millisecondo (e dopo un refresh rapido).
 const now=Math.max(Date.now(),(newest?.createdAt||0)+1);
 const key=RECOVERY_BACKUP_PREFIX+now+'_'+Math.random().toString(36).slice(2,7);
 const data=JSON.stringify({version:PROFILE_STORE_VERSION,entries,createdAt:now,source:label});
 const excess=()=>listRecoveryBackups(store).filter(x=>x.name.startsWith(RECOVERY_BACKUP_PREFIX));
 try{
  store.setItem(key,data);
 }catch(error){
  // Se il browser ha esaurito la quota, NON cancellare l'ultimo
  // backup buono per creare una copia nuova che potrebbe fallire.
  throw new Error('Spazio del browser insufficiente per una copia di sicurezza. I backup esistenti sono intatti.');
 }
 const copies=excess();
 for(const backup of copies.slice(2))store.removeItem(backup.name);
 return key;
}

// Una copia della versione cloud prima di un ripristino locale permette
// di tornare indietro anche se l'utente sceglie un backup più vecchio.
export function backupCloudBeforeOverwrite(entries,store=localStorage){
 return createRecoverySnapshot(entries,'cloud-prima-del-ripristino',store);
}
