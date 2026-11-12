import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {
 MULTIMON_WELCOME_KEYS,MULTIMON_KEYS_GIFT_MARKER,multimonKeyBalance,
 hasPlayedMultimon,grantMultimonWelcomeKeys,redeemMultimonKey
} from '../src/systems/multimonKeys.js';
import {updateLocalStatsImpl} from '../src/systems/profileSystem.js';

const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const makeProfile=(updates={})=>({
 matches:0,wins:0,playtime:0,chars:{},moves:{},coins:80,
 inventory:{pozione:2},unlockedChars:[],freeUnlockUsed:false,
 ultimonEntrances:['starfall'],victoryEffects:['comet'],
 ...updates
});
const purchasable=CHARACTERS.filter(c=>Number(c.price)>0&&!c.isSummonOnly&&!c.isSecretUnlock);
const playable=purchasable[0];

test('Cinque chiavi a tutti i veterani, inclusi i vecchi salvataggi senza vittorie',()=>{
 assert.equal(MULTIMON_WELCOME_KEYS,5);
 assert.ok(playable?.id,'Serve un personaggio venduto dal negozio');
 for(const oldProfile of [
  makeProfile({matches:1,wins:0,coins:0}),
  makeProfile({matches:21,wins:8,coins:95}),
  makeProfile({matches:0,wins:3}),
  makeProfile({matches:0,chars:{sonic:2}}),
  makeProfile({maxSurvivalRound:7})
 ]){
  assert.equal(hasPlayedMultimon(oldProfile),true);
  const result=grantMultimonWelcomeKeys(oldProfile);
  assert.equal(result.changed,true);
  assert.equal(result.granted,5);
  assert.equal(result.profile.multimonKeys,5);
  assert.equal(result.profile[MULTIMON_KEYS_GIFT_MARKER],true);
  assert.deepEqual(result.profile.unlockedChars,oldProfile.unlockedChars);
  assert.equal(result.profile.coins,oldProfile.coins);
  assert.deepEqual(result.profile.inventory,oldProfile.inventory);
  assert.equal(oldProfile[MULTIMON_KEYS_GIFT_MARKER],undefined,'Immutabilità del salvataggio letto');
  const afterReload=grantMultimonWelcomeKeys(result.profile);
  assert.equal(afterReload.changed,false,'Non deve essere regalato due volte');
  assert.equal(afterReload.profile.multimonKeys,5);
 }
});

test('Ai nuovi giocatori senza una partita non si regalano chiavi prematuramente',()=>{
 const newbie=makeProfile({matches:0,wins:0});
 assert.equal(hasPlayedMultimon(newbie),false);
 const result=grantMultimonWelcomeKeys(newbie);
 assert.equal(result.changed,false);
 assert.equal(multimonKeyBalance(result.profile),0);
 const firstMatch=grantMultimonWelcomeKeys({...newbie,matches:1});
 assert.equal(multimonKeyBalance(firstMatch.profile),5);
});

test('Se il giocatore ha già qualche chiave, il bonus si somma e rimane una tantum',()=>{
 const profile=makeProfile({matches:3,multimonKeys:2});
 const gift=grantMultimonWelcomeKeys(profile);
 assert.equal(gift.profile.multimonKeys,7);
 const afterSpend=redeemMultimonKey(gift.profile,playable.id,CHARACTERS);
 assert.equal(afterSpend.ok,true);
 assert.equal(afterSpend.profile.multimonKeys,6);
 const afterReopen=grantMultimonWelcomeKeys(afterSpend.profile);
 assert.equal(afterReopen.changed,false);
 assert.equal(afterReopen.profile.multimonKeys,6);
 assert.equal(multimonKeyBalance({multimonKeys:-4}),0);
 assert.equal(multimonKeyBalance({multimonKeys:Infinity}),0);
});

test('Ogni Chiave Multimon sblocca un personaggio permanentemente, senza spendere monete',()=>{
 const initial=grantMultimonWelcomeKeys(makeProfile({
  matches:1,coins:0,inventory:{pozione:8},ultimonEntrances:['nebula']
 })).profile;
 const result=redeemMultimonKey(initial,playable.id,CHARACTERS);
 assert.equal(result.ok,true);
 assert.equal(result.character.id,playable.id);
 assert.equal(result.profile.multimonKeys,4);
 assert.equal(result.profile.coins,0);
 assert.ok(result.profile.unlockedChars.includes(playable.id));
 assert.deepEqual(result.profile.inventory,initial.inventory);
 assert.deepEqual(result.profile.ultimonEntrances,initial.ultimonEntrances);
 assert.deepEqual(result.profile.victoryEffects,initial.victoryEffects);
 assert.equal(initial.multimonKeys,5,'Nessuna mutazione del profilo originale');
 assert.equal(redeemMultimonKey(result.profile,playable.id,CHARACTERS).ok,false,
  'Niente doppia spesa per uno stesso personaggio');
 assert.equal(redeemMultimonKey(result.profile,'id-inventato',CHARACTERS).ok,false);
 assert.equal(redeemMultimonKey(makeProfile({multimonKeys:0}),playable.id,CHARACTERS).ok,false);
 const summon=CHARACTERS.find(c=>c.isSummonOnly);
 if(summon)assert.equal(redeemMultimonKey(result.profile,summon.id,CHARACTERS).ok,false);
 const exclusive=CHARACTERS.find(c=>c.isSecretUnlock);
 if(exclusive)assert.equal(redeemMultimonKey(result.profile,exclusive.id,CHARACTERS).ok,false);
});

test('Una transazione del profilo scala una sola chiave e salva lo sblocco',()=>{
 const key='multiverse_rpg_global_profile';
 const store=new Map([[key,JSON.stringify(makeProfile({
  matches:6,coins:25,multimonKeys:5,[MULTIMON_KEYS_GIFT_MARKER]:true
 }))]]);
 const original=globalThis.localStorage;
 globalThis.localStorage={
  getItem:k=>store.get(k)||null,
  setItem:(k,value)=>store.set(k,value),
  removeItem:k=>store.delete(k)
 };
 try{
  const getPlayerData=()=>JSON.parse(store.get(key));
  const ctx={getPlayerData};
  const result=updateLocalStatsImpl(ctx,{redeemMultimonKey:playable.id});
  assert.equal(result.ok,true);
  assert.equal(result.keys,4);
  assert.equal(getPlayerData().multimonKeys,4);
  assert.equal(getPlayerData().coins,25,'Il costo in monete deve essere zero');
  assert.ok(getPlayerData().unlockedChars.includes(playable.id));
  assert.equal(updateLocalStatsImpl(ctx,{redeemMultimonKey:playable.id}).ok,false);
  assert.equal(getPlayerData().multimonKeys,4,'Nessuna doppia spesa');
  assert.equal(updateLocalStatsImpl(ctx,{redeemMultimonKey:'inventato'}).ok,false);
  assert.equal(getPlayerData().multimonKeys,4);
  for(const character of purchasable.filter(c=>c.id!==playable.id).slice(0,4)){
   assert.equal(updateLocalStatsImpl(ctx,{redeemMultimonKey:character.id}).ok,true);
  }
  assert.equal(getPlayerData().multimonKeys,0);
  const extra=purchasable.find(c=>!getPlayerData().unlockedChars.includes(c.id));
  assert.equal(updateLocalStatsImpl(ctx,{redeemMultimonKey:extra.id}).ok,false);
  assert.equal(getPlayerData().multimonKeys,0);
  assert.equal(getPlayerData().coins,25);
  assert.equal(getPlayerData().freeUnlockUsed,false,'Il Regalo Beta resta disponibile');
 }finally{globalThis.localStorage=original;}
});

test('Chi completa la PRIMA partita riceve cinque chiavi, non cinque a ogni partita',()=>{
 const key='multiverse_rpg_global_profile';
 const store=new Map([[key,JSON.stringify(makeProfile())]]);
 const original=globalThis.localStorage;
 globalThis.localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)};
 try{
  const ctx={getPlayerData:()=>JSON.parse(store.get(key))};
  updateLocalStatsImpl(ctx,{match:true});
  assert.equal(ctx.getPlayerData().matches,1);
  assert.equal(ctx.getPlayerData().multimonKeys,5);
  assert.equal(ctx.getPlayerData()[MULTIMON_KEYS_GIFT_MARKER],true);
  updateLocalStatsImpl(ctx,{match:true});
  assert.equal(ctx.getPlayerData().matches,2);
  assert.equal(ctx.getPlayerData().multimonKeys,5);
 }finally{globalThis.localStorage=original;}
});

test('Migrazione retroattiva + UI: monete, chiavi e Regalo Beta sono opzioni distinte',()=>{
 const app=read('../src/App.jsx');
 const shop=read('../src/screens/hub/ShopView.jsx');
 const history=read('../src/data/updateHistory.js');
 assert.match(app,/grantMultimonWelcomeKeys\(migration\.profile\)/);
 assert.match(app,/localStorage\.setItem\(key,JSON\.stringify\(normalized\.profile\)\)/);
 assert.match(shop,/Chiavi Multimon/);
 assert.match(shop,/multimonKeyBalance\(playerData\)/);
 assert.match(shop,/updateLocalStats\(\{redeemMultimonKey:char\.id\}\)/);
 assert.match(shop,/🔑 Usa 1 Chiave · GRATIS/);
 assert.match(shop,/Regalo Beta \(gratis\)/);
 assert.match(shop,/setGameState\(current=>\(\{\.\.\.current\}\)\)/);
 assert.match(shop,/overscroll-contain/);
 assert.match(history,/Regalo Veterani/);
});
