import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ULTIMON_ENTRANCE_PRICE,ULTIMON_BASIC_ENTRANCE,ULTIMON_ENTRANCE_EFFECTS,
 ownedUltimonEntrances,ownsUltimonEntrance,purchaseUltimonEntrance}
 from '../src/systems/ultimonCosmetics.js';
import {updateLocalStatsImpl} from '../src/systems/profileSystem.js';
import {ultimonIntroFullTeam,ultimonIntroEntrancePatch,ultimonIntroEntrance,
 ultimonIntroSpeech,advanceUltimonIntroduction,beginUltimonIntroduction}
 from '../src/systems/ultimonIntro.js';

const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const fighter=(n,i)=>({id:'char'+i,name:n,img:'https://example.com/'+i+'.png',hp:100,maxHp:100,moves:[]});

test('Il catalogo comprende sedici entrate ORIGINALI e una base gratuita',()=>{
 assert.equal(ULTIMON_ENTRANCE_PRICE,100);
 assert.equal(ULTIMON_ENTRANCE_EFFECTS.length,16);
 assert.equal(new Set(ULTIMON_ENTRANCE_EFFECTS.map(e=>e.id)).size,16);
 assert.equal(new Set(ULTIMON_ENTRANCE_EFFECTS.map(e=>e.name)).size,16);
 assert.equal(ULTIMON_BASIC_ENTRANCE.id,'basic');
 assert.ok(!ULTIMON_ENTRANCE_EFFECTS.some(e=>e.id==='basic'));
 for(const entrance of ULTIMON_ENTRANCE_EFFECTS){
  assert.ok(entrance.icon&&entrance.announcer&&entrance.tagline&&entrance.hint,entrance.id);
  assert.match(entrance.color,/^#[a-f0-9]{6}$/i);
 }
});

test('Acquisto cosmetico permanente: paga 100 una sola volta, senza toccare lo zaino',()=>{
 const original={coins:250,inventory:{pozione:2},ultimonEntrances:[],unlockedChars:['sonic']};
 const first=purchaseUltimonEntrance(original,'meteor');
 assert.equal(first.ok,true);
 assert.equal(first.profile.coins,150);
 assert.deepEqual(first.profile.ultimonEntrances,['meteor']);
 assert.deepEqual(first.profile.inventory,original.inventory);
 assert.equal(original.coins,250,'L acquisto non deve mutare l oggetto originale');
 assert.equal(purchaseUltimonEntrance(first.profile,'meteor').ok,false);
 assert.equal(purchaseUltimonEntrance(first.profile,'inventato').ok,false);
 const second=purchaseUltimonEntrance(first.profile,'starfall');
 assert.equal(second.ok,true);
 assert.equal(second.profile.coins,50);
 assert.equal(purchaseUltimonEntrance(second.profile,'neon').ok,false);
 assert.deepEqual(ownedUltimonEntrances({ultimonEntrances:['meteor','meteor','hack','neon']}),
  ['meteor','neon']);
 assert.equal(ownsUltimonEntrance({},'basic'),true);
 assert.equal(ownsUltimonEntrance({},'meteor'),false);
});

test('Il salvataggio reale del Negozio conferma atomico saldo e sblocco',()=>{
 const key='multiverse_rpg_global_profile';
 const db=new Map([[key,JSON.stringify({coins:225,inventory:{pozione:1},ultimonEntrances:[],
  matches:0,wins:0,playtime:0,chars:{},moves:{},unlockedChars:[]})]]);
 const original=globalThis.localStorage;
 globalThis.localStorage={getItem:k=>db.get(k)||null,setItem:(k,v)=>db.set(k,v)};
 try{
  const getPlayerData=()=>JSON.parse(db.get(key));
  const buy=updateLocalStatsImpl({getPlayerData},{buyUltimonEntrance:'eclipse'});
  assert.equal(buy.ok,true);
  assert.equal(getPlayerData().coins,125);
  assert.deepEqual(getPlayerData().ultimonEntrances,['eclipse']);
  assert.equal(updateLocalStatsImpl({getPlayerData},{buyUltimonEntrance:'eclipse'}).ok,false);
  assert.equal(getPlayerData().coins,125);
  assert.equal(updateLocalStatsImpl({getPlayerData},{buyUltimonEntrance:'neon'}).ok,true);
  assert.equal(getPlayerData().coins,25);
  assert.equal(updateLocalStatsImpl({getPlayerData},{buyUltimonEntrance:'starfall'}).ok,false);
  assert.equal(getPlayerData().coins,25);
 }finally{globalThis.localStorage=original;}
});

test('Solo gli effetti posseduti possono entrare in Firestore, l ingresso base è gratuito',()=>{
 const room={gameMode:'ultimon',status:'ultimon_intro',isBot:{p1:false,p2:true},
  players:{p1:'Alice',p2:'CPU'},settings:{maxPlayers:4},
  ultimon:{intro:{step:'entrance_select',index:0,order:['p1','p2'],
   entrances:{},monologues:{p1:'Siamo pronti a fare una bella entrata!'}},
   rosters:{p1:[fighter('Sonic',0)],p2:[fighter('Kirby',1)]}}};
 assert.equal(ultimonIntroEntrance(room,'p1'),null);
 assert.equal(ultimonIntroEntrance(room,'p2'),'basic');
 assert.throws(()=>ultimonIntroEntrancePatch(room,'p1','starfall',[]),/non è stato acquistato/);
 assert.throws(()=>ultimonIntroEntrancePatch(room,'p1','meteor',['glitch']),/non è stato acquistato/);
 assert.equal(ultimonIntroEntrancePatch(room,'p1','meteor',['meteor'])['ultimon.intro.entrances.p1'],'meteor');
 assert.equal(ultimonIntroEntrancePatch(room,'p1','basic',[])['ultimon.intro.entrances.p1'],'basic');
 assert.equal(ultimonIntroSpeech(room,'p1').length>12,true);
 const ready={...room,ultimon:{...room.ultimon,intro:{...room.ultimon.intro,entrances:{p1:'basic'}}}};
 assert.equal(advanceUltimonIntroduction(ready)['ultimon.intro.step'],'entrance');
});

test('Il filmato mostra TUTTO il roster, le battute restano solo quattro',()=>{
 const full=Array.from({length:18},(_,i)=>fighter('Campione '+i,i));
 const room={gameMode:'ultimon',status:'ultimon_intro',settings:{maxPlayers:4},
  players:{p1:'Alice',p2:'Bob',p3:'Cara',p4:'Dario'},
  isBot:{p1:false,p2:true,p3:true,p4:true},
  ultimon:{rosters:{p1:full,p2:full,p3:full,p4:full}}};
 const team=ultimonIntroFullTeam(room,'p1');
 assert.equal(team.length,18);
 assert.equal(new Set(team.map(c=>c.index)).size,18);
 const source=read('../src/screens/battle/UltimonIntroView.jsx');
 assert.match(source,/fullTeam=ultimonIntroFullTeam\(room,role\)/);
 assert.match(source,/fullTeam\.map\(\(c,i\)=>/);
 assert.match(source,/usableEffects\.map\(effect=>/);
 assert.match(source,/ULTIMON_BASIC_ENTRANCE\.id/);
 assert.match(source,/autoEntranceRef/);
 assert.match(source,/cast\.map\(\(c,i\)=>/);
 assert.doesNotMatch(source,/cast\.slice\(0,4\)/);
 const css=read('../src/screens/battle/UltimonIntroView.css');
 assert.match(css,/ultimon-intro-entrance-fighters--all/);
 assert.match(css,/ultimon-intro-exit-roster/);
 for(const id of ULTIMON_ENTRANCE_EFFECTS.map(e=>e.id)){
  assert.match(css,new RegExp('entrance-show--'+id));
 }
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/@media\(max-width:700px\)/);
});

test('La home cambia il trio senza ripetizioni e il negozio mostra tutti i cosmetici',()=>{
 const menu=read('../src/screens/hub/MenuDashboard.jsx');
 const shop=read('../src/screens/hub/ShopView.jsx');
 const app=read('../src/App.jsx');
 assert.match(menu,/const \[heroCast\]=useState\(\(\)=>/);
 assert.match(menu,/Math\.random\(\)/);
 assert.match(menu,/pool\.slice\(0,3\)/);
 assert.match(shop,/setShopTab\('cosmetics'\)/);
 assert.match(shop,/shopTab === 'cosmetics'/);
 assert.match(shop,/ULTIMON_ENTRANCE_EFFECTS\.map/);
 assert.match(shop,/buyUltimonEntrance:effect\.id/);
 assert.match(app,/ownedUltimonEntrances\(getPlayerData\(\)\)/);
});
