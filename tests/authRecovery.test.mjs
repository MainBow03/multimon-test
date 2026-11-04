import test from 'node:test';
import assert from 'node:assert/strict';
import {
 requiresAccountReauthentication,hasMeaningfulLocalProgress,shouldPromptSaveConflict
} from '../src/systems/authRecovery.js';

test('Un account precedentemente connesso non diventa ospite al refresh',()=>{
 assert.equal(requiresAccountReauthentication('user-1',null),true);
 assert.equal(requiresAccountReauthentication('user-1',{uid:'new-guest',isAnonymous:true}),true);
 assert.equal(requiresAccountReauthentication('user-1',{uid:'user-1',email:'a@example.com',isAnonymous:false}),false);
 assert.equal(requiresAccountReauthentication(null,null),false);
});

test('I progressi divergenti nello stesso account richiedono una scelta',()=>{
 const local={multiverse_rpg_global_profile:'{"coins":2000}'};
 const cloud={multiverse_rpg_global_profile:'{"coins":250}'};
 assert.equal(shouldPromptSaveConflict('user-1','user-1',local,cloud),true);
 assert.equal(shouldPromptSaveConflict('user-1','user-1',local,local),false);
});

test('Un ospite con monete guadagnate prima del login non viene sovrascritto',()=>{
 const guest={multiverse_rpg_global_profile:'{"coins":900}',multiverse_rpg_saved_name:'Guest'};
 const cloud={multiverse_rpg_global_profile:'{"coins":50}'};
 assert.equal(hasMeaningfulLocalProgress(guest),true);
 assert.equal(shouldPromptSaveConflict(null,'user-1',guest,cloud),true);
});

test('Cambiare tra due account non importa i progressi dell’altro senza scelta',()=>{
 const old={multiverse_rpg_global_profile:'{"coins":900}'};
 const current={multiverse_rpg_global_profile:'{"coins":50}'};
 assert.equal(shouldPromptSaveConflict('user-old','user-new',old,current),false);
});

test('Un semplice nome ospite senza progressi non blocca la lettura del cloud',()=>{
 const guest={multiverse_rpg_saved_name:'Giocatore',multiverse_rpg_saved_avatar:'test'};
 assert.equal(hasMeaningfulLocalProgress(guest),false);
 assert.equal(shouldPromptSaveConflict(null,'user-1',guest,
  {multiverse_rpg_global_profile:'{"coins":1000}'}),false);
});
