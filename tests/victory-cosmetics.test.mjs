import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 VICTORY_EFFECTS,VICTORY_EFFECT_PRICE,ownedVictoryEffects,equippedVictoryEffect,
 purchaseVictoryEffect,equipVictoryEffect,victoryWinnerRole,victoryCelebrationForRoom
} from '../src/systems/victoryCosmetics.js';
import {updateLocalStatsImpl} from '../src/systems/profileSystem.js';
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const sampleProfile={coins:250,victoryEffects:[],inventory:{pozione:2},ultimonEntrances:['starfall'],
 chars:{},moves:{},matches:0,wins:0,playtime:0,unlockedChars:[]};
const battle=(status='gameover')=>({
 gameMode:'classica',status,phaseStartedAt:123,
 players:{p1:'Giulia',p2:'Simone'},
 winner:'Simone',
 teams:{p1:[{id:'jake',name:'Jake',img:'/jake.png',hp:0}],
   p2:[{id:'sonic',name:'Sonic',img:'/sonic.png',hp:45}]},
 playerVictoryEffects:{p1:'rainbow',p2:'disco'}
});

test('Le sedici celebrazioni sono uniche e coerenti (prezzo 100 e tutte illustrate)',()=>{
 assert.equal(VICTORY_EFFECT_PRICE,100);
 assert.equal(VICTORY_EFFECTS.length,16);
 assert.equal(new Set(VICTORY_EFFECTS.map(e=>e.id)).size,16);
 assert.equal(new Set(VICTORY_EFFECTS.map(e=>e.name)).size,16);
 for(const effect of VICTORY_EFFECTS){
  assert.ok(effect.icon&&effect.hint.length>30&&effect.tagline.length>16,effect.id);
  assert.match(effect.color,/^#[0-9a-f]{6}$/i);
  assert.match(effect.accent,/^#[0-9a-f]{6}$/i);
 }
 const css=read('../src/screens/battle/VictoryCelebration.css');
 for(const e of VICTORY_EFFECTS){
  assert.match(css,new RegExp('victory-cinema--'+e.id));
 }
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/@media\(max-width:650px\)/);
});

test('La prima animazione si equipaggia da sola, gli acquisti successivi non cambiano la scelta',()=>{
 const bought=purchaseVictoryEffect(sampleProfile,'coronation');
 assert.equal(bought.ok,true);
 assert.equal(bought.profile.coins,150);
 assert.deepEqual(bought.profile.victoryEffects,['coronation']);
 assert.equal(equippedVictoryEffect(bought.profile),'coronation');
 assert.equal(bought.profile.inventory.pozione,2);
 assert.deepEqual(bought.profile.ultimonEntrances,['starfall']);
 assert.equal(sampleProfile.coins,250);
 assert.equal(purchaseVictoryEffect(bought.profile,'coronation').ok,false);
 const second=purchaseVictoryEffect(bought.profile,'bloom');
 assert.equal(second.ok,true);
 assert.equal(second.profile.coins,50);
 assert.equal(equippedVictoryEffect(second.profile),'coronation');
 assert.equal(purchaseVictoryEffect(second.profile,'glitch').ok,false);
 assert.equal(purchaseVictoryEffect(second.profile,'ocean').ok,false);
 const switchTo=equipVictoryEffect(second.profile,'bloom');
 assert.equal(switchTo.ok,true);
 assert.equal(equippedVictoryEffect(switchTo.profile),'bloom');
 assert.deepEqual(ownedVictoryEffects({...switchTo.profile,victoryEffects:['bloom','bloom','coronation','fake']}),
  ['bloom','coronation']);
 assert.equal(equipVictoryEffect(second.profile,'disco').ok,false,
  'Non si possono equipaggiare animazioni non comprate');
 const disabled=equipVictoryEffect(switchTo.profile,null);
 assert.equal(disabled.ok,true);
 assert.equal(equippedVictoryEffect(disabled.profile),null);
});

test('Il salvataggio del profilo scala esattamente 100 monete per un nuovo effetto',()=>{
 const key='multiverse_rpg_global_profile';
 const stored=new Map([[key,JSON.stringify(sampleProfile)]]);
 const original=globalThis.localStorage;
 globalThis.localStorage={getItem:key=>stored.get(key)||null,
  setItem:(key,value)=>stored.set(key,value),removeItem:key=>stored.delete(key)};
 try{
  const ctx={getPlayerData:()=>JSON.parse(stored.get(key))};
  const buy=updateLocalStatsImpl(ctx,{buyVictoryEffect:'fireworks'});
  assert.equal(buy.ok,true);
  assert.equal(ctx.getPlayerData().coins,150);
  assert.equal(ctx.getPlayerData().equippedVictoryEffect,'fireworks');
  assert.deepEqual(ctx.getPlayerData().victoryEffects,['fireworks']);
  assert.equal(updateLocalStatsImpl(ctx,{buyVictoryEffect:'fireworks'}).ok,false);
  assert.equal(ctx.getPlayerData().coins,150);
  assert.equal(updateLocalStatsImpl(ctx,{equipVictoryEffect:'diamonds'}).ok,false);
  assert.equal(ctx.getPlayerData().equippedVictoryEffect,'fireworks');
  assert.equal(updateLocalStatsImpl(ctx,{buyVictoryEffect:'diamonds'}).ok,true);
  assert.equal(ctx.getPlayerData().coins,50);
  assert.equal(updateLocalStatsImpl(ctx,{equipVictoryEffect:'diamonds'}).ok,true);
  assert.equal(ctx.getPlayerData().equippedVictoryEffect,'diamonds');
  assert.equal(updateLocalStatsImpl(ctx,{equipVictoryEffect:null}).ok,true);
  assert.equal(ctx.getPlayerData().equippedVictoryEffect,null);
  assert.deepEqual(ctx.getPlayerData().inventory,{pozione:2});
  assert.deepEqual(ctx.getPlayerData().ultimonEntrances,['starfall']);
 }finally{globalThis.localStorage=original}
});

test('L’animazione spetta al vero vincitore, non allo spettatore o al perdente',()=>{
 const room=battle();
 assert.equal(victoryWinnerRole(room),'p2');
 const panel=victoryCelebrationForRoom(room,{...sampleProfile,victoryEffects:['rainbow'],
  equippedVictoryEffect:'rainbow'},'online_room');
 assert.equal(panel.effect.id,'disco');
 assert.equal(panel.winnerName,'Simone');
 assert.equal(panel.heroImage,'/sonic.png');
 assert.match(panel.id,/gameover/);
 assert.equal(victoryCelebrationForRoom({...room,winner:'Pareggio'},sampleProfile,'online_room'),null);
 assert.equal(victoryCelebrationForRoom({...room,status:'battling'},sampleProfile,'online_room'),null);
 assert.equal(victoryCelebrationForRoom({...room,playerVictoryEffects:{}},sampleProfile,'online_room'),null);
 const campaign=battle();
 campaign.winner='Giulia';
 campaign.isCampaignBattle=true;
 delete campaign.playerVictoryEffects;
 const profile={...sampleProfile,victoryEffects:['bloom'],equippedVictoryEffect:'bloom'};
 assert.equal(victoryCelebrationForRoom(campaign,profile,'local_room').effect.id,'bloom');
 campaign.winner='Simone';
 assert.equal(victoryCelebrationForRoom(campaign,profile,'local_room'),null,
  'La vittoria di un altro giocatore non usa il cosmetico di Giulia');
});

test('Ultimon celebra il vincitore di ogni duello e il campione finale',()=>{
 const room={gameMode:'ultimon',status:'ultimon_result',phaseStartedAt:2,
   players:{p1:'Giulia',p2:'Simone'},
   teams:{p1:[{id:'sonic',hp:75,img:'/sonic.png'}],p2:[{id:'kirby',hp:0,img:'/kirby.png'}]},
   playerVictoryEffects:{p1:'coronation',p2:'fireworks'},
   ultimon:{pair:['p1','p2'],runId:'test-run',round:2,
    rosters:{p1:[{id:'sonic',hp:75,img:'/sonic.png'}]},
    identities:{p1:{name:'Le Meteore'}}}
 };
 assert.equal(victoryWinnerRole(room),'p1');
 const result=victoryCelebrationForRoom(room,null,'online_room');
 assert.equal(result.effect.id,'coronation');
 assert.equal(result.winnerName,'Le Meteore');
 room.status='ultimon_final';
 room.ultimon.champion='p1';
 assert.equal(victoryWinnerRole(room),'p1');
 assert.equal(victoryCelebrationForRoom(room,null,'online_room').heroImage,'/sonic.png');
 room.ultimon.champion=null;
 assert.equal(victoryCelebrationForRoom(room,null,'online_room'),null);
});

test('Vere animazioni, anteprima nel negozio, equipaggiamento e sincronizzazione Firestore',()=>{
 const shop=read('../src/screens/hub/ShopView.jsx');
 const jsx=read('../src/screens/battle/VictoryCelebration.jsx');
 const css=read('../src/screens/battle/VictoryCelebration.css');
 const app=read('../src/App.jsx');
 const multiplayer=read('../src/systems/multiplayerSystem.js');
 assert.match(shop,/Animazioni di Vittoria · \{VICTORY_EFFECTS\.length\}/);
 assert.match(shop,/shopCosmeticTab==='victories'/);
 assert.match(shop,/setShopCosmeticTab\('victories'\)/);
 assert.match(shop,/VICTORY_EFFECTS\.map\(effect=>/);
 assert.match(shop,/buyVictoryEffect:effect\.id/);
 assert.match(shop,/equipVictoryEffect:id/);
 assert.match(shop,/onClick=\{\(\)=>setVictoryPreview\(effect\)\}/);
 assert.match(shop,/auto-rows-\[minmax\(255px,max-content\)\]/);
 assert.match(shop,/overflow-y-auto overscroll-contain/);
 assert.match(app,/victoryCelebrationForRoom\(gameState,getPlayerData\(\),appMode\)/);
 assert.match(app,/presentation=\{victoryPresentation\}/);
 assert.match(app,/setVictoryPreview/);
 assert.match(jsx,/setTimeout\(\(\)=>\{setVisible\(false\);onClose\?\.\(\)\},6100\)/);
 assert.match(jsx,/Continua ai risultati/);
 assert.match(jsx,/presentation\.heroImage/);
 for(const effect of VICTORY_EFFECTS){
  assert.match(css,new RegExp('victory-cinema--'+effect.id));
 }
 assert.match(multiplayer,/playerVictoryEffects/);
 assert.match(multiplayer,/equippedVictoryEffect\(getPlayerData\(\)\)/);
});
