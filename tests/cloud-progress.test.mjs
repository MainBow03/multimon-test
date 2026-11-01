import test from 'node:test';
import assert from 'node:assert/strict';
import {
 collectProgress,restoreProgress,clearProgress,progressFingerprint,
 readLocalBackup,saveLocalBackup,assertCloudSize
} from '../src/systems/progressStorage.js';

class MemoryStore {
 constructor(data={}){this.store=new Map(Object.entries(data));}
 get length(){return this.store.size;}
 key(i){return [...this.store.keys()][i]??null;}
 getItem(k){return this.store.get(k)??null;}
 setItem(k,v){this.store.set(k,String(v));}
 removeItem(k){this.store.delete(k);}
}
test('Salva profilo, campagne, roguelike, sblocchi e ricevute del torneo',()=>{
 const fake=new MemoryStore({
  multiverse_rpg_global_profile:'{"coins":555,"unlockedChars":["mahito"]}',
  multiverse_rpg_campaign_save_crisi_varco:'{"sectorIdx":5}',
  multimon_completed_campaigns_v1:'{"crisi_varco":true}',
  multiverse_rpg_roguelike_save:'{"floor":7}',
  multimon_event_reward_123_456:'{"rank":2}',
  multiverse_rpg_session:'{"roomId":"x"}',
  secret_token:'PRIVATE'
 });
 const cloud=collectProgress(fake);
 assert.equal(Object.keys(cloud).length,5);
 assert.equal(cloud.secret_token,undefined);
 assert.equal(cloud.multiverse_rpg_session,undefined);
 const fresh=new MemoryStore();
 restoreProgress(cloud,fresh);
 assert.equal(fresh.getItem('multiverse_rpg_campaign_save_crisi_varco'),'{"sectorIdx":5}');
 assert.equal(fresh.getItem('multiverse_rpg_global_profile').includes('mahito'),true);
});
test('Se si cambia account non restano i vecchi salvataggi visibili',()=>{
 const fake=new MemoryStore({multiverse_rpg_global_profile:'old',multiverse_rpg_saved_name:'Old',other:'keep'});
 restoreProgress({multiverse_rpg_saved_name:'New'},fake);
 assert.equal(fake.getItem('multiverse_rpg_global_profile'),null);
 assert.equal(fake.getItem('multiverse_rpg_saved_name'),'New');
 assert.equal(fake.getItem('other'),'keep');
});
test('Conserva una copia locale e ripristina ospite dopo logout',()=>{
 const fake=new MemoryStore({multiverse_rpg_saved_name:'Ospite'});
 saveLocalBackup('backup',fake);
 clearProgress(fake);
 restoreProgress({multiverse_rpg_saved_name:'Online'},fake);
 restoreProgress(readLocalBackup('backup',fake),fake);
 assert.equal(fake.getItem('multiverse_rpg_saved_name'),'Ospite');
});
test('Fingerprint stabile per ordine dei campi',()=>{
 assert.equal(progressFingerprint({b:'2',a:'1'}),progressFingerprint({a:'1',b:'2'}));
 assert.notEqual(progressFingerprint({b:'3',a:'1'}),progressFingerprint({a:'1',b:'2'}));
});
test('Le chiavi sconosciute e valori non stringa vengono scartati',()=>{
 const fake=new MemoryStore();
 restoreProgress({multiverse_rpg_saved_name:'Tester',bad:'oops',multiverse_rpg_global_profile:{coins:4}},fake);
 assert.equal(fake.length,1);
});
test('Limite dimensione prima di sovrascrivere salvataggio',()=>{
 assert.throws(()=>assertCloudSize({multiverse_rpg_global_profile:'a'.repeat(800001)}),/troppo grande/);
 assert.doesNotThrow(()=>assertCloudSize({multiverse_rpg_global_profile:'{}'}));
});
