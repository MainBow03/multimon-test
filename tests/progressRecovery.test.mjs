import test from 'node:test';
import assert from 'node:assert/strict';
import {
 SAVED_EXACT_KEYS,ACTIVE_ACCOUNT_KEY,GUEST_BACKUP_KEY,LOCAL_ACCOUNT_BACKUP_PREFIX,
 RECOVERY_BACKUP_PREFIX,collectProgress,restoreProgress,readLocalBackup,
 saveLocalBackup,createRecoverySnapshot,listRecoveryBackups,progressFingerprint
} from '../src/systems/progressStorage.js';

function memoryStore(initial={}){
 const map=new Map(Object.entries(initial));
 return {
   get length(){return map.size},
   key:i=>[...map.keys()][i]??null,
   getItem:k=>map.has(k)?map.get(k):null,
   setItem:(k,v)=>map.set(k,String(v)),
   removeItem:k=>map.delete(k),
   entries:()=>Object.fromEntries(map)
 };
}

test('Restore conserva le copie account e guest, tocca solo il progresso',()=>{
 const store=memoryStore({
  multiverse_rpg_global_profile:'{"coins":500}',
  [ACTIVE_ACCOUNT_KEY]:'account-123',
  [GUEST_BACKUP_KEY]:'{"entries":{"multiverse_rpg_global_profile":"{}"}}',
  unrelated:'value'
 });
 const newer={multiverse_rpg_global_profile:'{"coins":1500}',multiverse_rpg_roguelike_save:'{"floor":14}'};
 restoreProgress(newer,store);
 assert.deepEqual(collectProgress(store),newer);
 assert.equal(store.getItem(ACTIVE_ACCOUNT_KEY),'account-123');
 assert.ok(store.getItem(GUEST_BACKUP_KEY));
 assert.equal(store.getItem('unrelated'),'value');
});

test('Se la scrittura di un salvataggio fallisce, prova a ripristinare i dati di prima',()=>{
 const store=memoryStore({
  multiverse_rpg_global_profile:'{"coins":200}',
  multiverse_rpg_saved_name:'Player'
 });
 const old=collectProgress(store);
 const original=store.setItem.bind(store);
 store.setItem=(key,value)=>{
  if(key==='multiverse_rpg_roguelike_save')throw Error('Quota insufficiente');
  original(key,value);
 };
 assert.throws(()=>restoreProgress({
  multiverse_rpg_global_profile:'{"coins":0}',multiverse_rpg_roguelike_save:'{"floor":1}'
 },store),/Quota/);
 assert.deepEqual(collectProgress(store),old);
});

test('Le copie automatiche sono recuperabili e si tengono due versioni',()=>{
 const store=memoryStore();
 let first=null;
 for(let coins=100;coins<=400;coins+=100){
  store.setItem('multiverse_rpg_global_profile',JSON.stringify({coins}));
  const name=createRecoverySnapshot(collectProgress(store),'auto',store);
  if(coins===100)first=name;
 }
 const copies=listRecoveryBackups(store);
 assert.equal(copies.length,2);
 assert.ok(copies.every(b=>b.name.startsWith(RECOVERY_BACKUP_PREFIX)));
 assert.equal(copies[0].keys,1);
 assert.ok(!store.getItem(first),'Le copie più vecchie vengono ruotate');
 const latest=readLocalBackup(copies[0].name,store);
 assert.match(latest.multiverse_rpg_global_profile,/"coins":400/);
 assert.equal(progressFingerprint(latest),progressFingerprint(collectProgress(store)));
 assert.equal(createRecoverySnapshot(collectProgress(store),'ripeti',store),copies[0].name);
 assert.equal(listRecoveryBackups(store).length,2);
});

test('I backup ospite e account restano separati e visibili per il recupero',()=>{
 const store=memoryStore({
  multiverse_rpg_global_profile:'{"wins":10}',
  multiverse_rpg_campaign_save_crisi_varco:'{"mission":5}'
 });
 saveLocalBackup(GUEST_BACKUP_KEY,store);
 saveLocalBackup(LOCAL_ACCOUNT_BACKUP_PREFIX+'person-uid',store);
 const entries=listRecoveryBackups(store);
 assert.equal(entries.length,2);
 assert.ok(entries.some(x=>x.label==='Salvataggio ospite'));
 assert.ok(entries.some(x=>x.label==='Salvataggio account precedente'));
 assert.equal(readLocalBackup(LOCAL_ACCOUNT_BACKUP_PREFIX+'person-uid',store)
  .multiverse_rpg_global_profile,'{"wins":10}');
});

test('In caso di quota esaurita non viene distrutto un backup esistente',()=>{
 const store=memoryStore({multiverse_rpg_global_profile:'{"wins":40}'});
 const older=createRecoverySnapshot(collectProgress(store),'prima',store);
 const original=store.setItem.bind(store);
 store.setItem=(key,val)=>{
  if(key.startsWith(RECOVERY_BACKUP_PREFIX)&&key!==older)throw Error('Quota piena');
  original(key,val);
 };
 store.setItem('multiverse_rpg_global_profile','{"wins":50}');
 assert.throws(()=>createRecoverySnapshot(collectProgress(store),'poi',store),/Spazio/);
 assert.ok(store.getItem(older));
 assert.equal(readLocalBackup(older,store).multiverse_rpg_global_profile,'{"wins":40}');
});

test('Anche il vecchio profilo legato al nome resta recuperabile prima del login',()=>{
 const store=memoryStore({
  multiverse_rpg_stats_vecchio:'{"coins":3500,"wins":40}',
  multiverse_rpg_saved_name:'Vecchio'
 });
 const snapshot=createRecoverySnapshot(collectProgress(store),'migration',store);
 assert.ok(snapshot);
 assert.equal(readLocalBackup(snapshot,store).multiverse_rpg_stats_vecchio,
  '{"coins":3500,"wins":40}');
});
