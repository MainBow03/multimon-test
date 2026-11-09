import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 normalizedCpuAccuracy,estimatedCpuAttackStrength,generateStrategicCpuActions
} from '../src/systems/strategicCpu.js';
import {roomSyncHealth,ROOM_SYNC_STALE_MS} from '../src/systems/roomSyncHealth.js';
import {MULTIMON_IMAGE_FALLBACK,onMultimonImageError} from '../src/systems/imageFallback.js';

const src=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} !== ${b}`);
test('IA: normalizza precisione decimale e percentuale senza errore x100',()=>{
 for(const [raw,expected] of [[1,1],[.95,.95],[.5,.5],[100,1],[95,.95],[50,.5],[0,0],[-10,0],[125,1],[undefined,1],[NaN,1]]){
  near(normalizedCpuAccuracy(raw),expected);
 }
 const attacker={atk:75};
 near(estimatedCpuAttackStrength(attacker,{power:80,accuracy:1},1),80);
 near(estimatedCpuAttackStrength(attacker,{power:80,accuracy:100},1),80);
 near(estimatedCpuAttackStrength(attacker,{power:80,accuracy:.5},1),40);
 near(estimatedCpuAttackStrength(attacker,{power:80,accuracy:50},1),40);
});

test('La CPU ora preferisce una mossa affidabile a una più potente ma imprecisa',()=>{
 const a={id:'cpu',name:'cpu',hp:100,maxHp:100,atk:75,def:75,types:['Normale'],
  statuses:[],moves:[
   {name:'Colpo preciso',type:'Normale',power:80,accuracy:1,remainingUses:5},
   {name:'Colpo incerto',type:'Normale',power:115,accuracy:.5,remainingUses:5}
  ]};
 const enemy={id:'enemy',name:'enemy',hp:1000,maxHp:1000,atk:60,def:80,types:['Normale'],statuses:[],moves:[]};
 const room={gameMode:'classica',cpuStyles:{p2:'aggressive'},players:{p1:'Human',p2:'CPU'},
  isBot:{p1:false,p2:true},teams:{p1:[enemy],p2:[a]},field:{p1:[0],p2:[0]},
  inventory:{p2:{}},healingItemsUsed:{p2:0},hyperUsed:{p2:true},settings:{fieldSize:1}};
 const args={room,player:'p2',activePlayers:['p1','p2'],currentActions:{p2:{}},
  getMultiplier:()=>1,appMode:'online_room',random:()=>.5};
 assert.equal(generateStrategicCpuActions(args)[0].moveIdx,0);
 room.teams.p2[0].moves[0].accuracy=100;room.teams.p2[0].moves[1].accuracy=50;
 assert.equal(generateStrategicCpuActions(args)[0].moveIdx,0);
});

test('La diagnosi stanza distingue online, assenza rete, cache, server fermo ed errore',()=>{
 assert.equal(ROOM_SYNC_STALE_MS,45000);
 const input={now:100000,lastServerAt:95000};
 assert.equal(roomSyncHealth(input).level,'ok');
 assert.equal(roomSyncHealth({...input,lastServerAt:0}).level,'connecting');
 assert.equal(roomSyncHealth({...input,lastServerAt:10000}).level,'stale');
 assert.equal(roomSyncHealth({...input,fromCache:true}).level,'cache');
 assert.equal(roomSyncHealth({...input,online:false}).level,'offline');
 assert.equal(roomSyncHealth({...input,error:true}).level,'error');
 assert.match(roomSyncHealth({...input,online:false}).message,/non chiudere/);
});

test('App attiva metadati Firebase e banner ma non resetta la stanza su problemi di rete',()=>{
 const app=src('../src/App.jsx');
 assert.match(app,/includeMetadataChanges:true/);
 assert.match(app,/snapshot\.metadata\?\.fromCache/);
 assert.match(app,/setRoomSync\(previous=>/);
 assert.match(app,/<RoomSyncBanner active=/);
 assert.match(app,/onSnapshot\(roomRef,\{includeMetadataChanges:true\}/);
 const banner=src('../src/components/RoomSyncBanner.jsx');
 assert.match(banner,/window\.addEventListener\('online',refresh\)/);
 assert.match(banner,/window\.addEventListener\('offline',refresh\)/);
 assert.match(banner,/roomSyncHealth\(/);
 assert.match(banner,/if\(!active\)return null/);
});

test('Immagine locale di fallback: nessuna dipendenza da host esterni o loop onError',()=>{
 assert.ok(MULTIMON_IMAGE_FALLBACK.startsWith('data:image/svg+xml;'));
 assert.ok(MULTIMON_IMAGE_FALLBACK.includes('MULTIMON')||decodeURIComponent(MULTIMON_IMAGE_FALLBACK).includes('MULTIMON'));
 const image={url:'https://broken.example/test.png',onerror:()=>{},
  getAttribute(name){return name==='src'?this.url:null},
  set src(value){this.url=value},get src(){return this.url}};
 assert.equal(onMultimonImageError({currentTarget:image}),true);
 assert.equal(image.src,MULTIMON_IMAGE_FALLBACK);
 assert.equal(image.onerror,null);
 assert.equal(onMultimonImageError({target:image}),false);
 assert.equal(onMultimonImageError(null),false);
});

test('La fallback è attiva nei PNG principali di tutte le schermate più frequentate',()=>{
 for(const file of [
  '../src/screens/battle/BattlingView.jsx',
  '../src/screens/battle/DraftingView.jsx',
  '../src/screens/hub/CatalogView.jsx',
  '../src/screens/hub/MenuDashboard.jsx',
  '../src/screens/battle/UltimonView.jsx',
  '../src/screens/battle/UltimonIntroView.jsx',
  '../src/screens/events/MultiverseBracket.jsx'
 ]){
  const content=src(file);
  assert.match(content,/import \{onMultimonImageError\}/,file);
  assert.match(content,/onError=\{onMultimonImageError\}/,file);
 }
});
