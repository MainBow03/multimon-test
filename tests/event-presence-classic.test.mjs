import test from 'node:test';
import assert from 'node:assert/strict';
import { shuffleEventEntrants, isLiveEvent, EVENT_INACTIVITY_MS, makeEventBracket,
  makeEventEntrants, normalizeEventSettings } from '../src/systems/multiverseEventEngine.js';
import { visibleOnlinePlayers, ONLINE_TIMEOUT_MS } from '../src/systems/onlinePresence.js';
import { calculateDamageImpl } from '../src/systems/battleSystem.js';
import { CHARACTERS } from '../src/data/characters.js';

const now=1_800_000_000_000;
test('Torneo scade dopo cinque minuti SENZA attività host, non dopo cinque minuti totali',()=>{
 const oldCreatedAt=now-3600000;
 const stillLive={status:'running',createdAt:oldCreatedAt,updatedAt:now-25000};
 assert.equal(EVENT_INACTIVITY_MS,300000);
 assert.equal(isLiveEvent(stillLive,now),true);
 assert.equal(isLiveEvent({...stillLive,updatedAt:now-300001},now),false);
 assert.equal(isLiveEvent({...stillLive,status:'cancelled'},now),false);
 assert.equal(isLiveEvent({...stillLive,status:'finished'},now),false);
 assert.equal(isLiveEvent({...stillLive,hostHeartbeatAt:{seconds:Math.floor((now-20000)/1000)}},now),true);
 assert.equal(isLiveEvent({...stillLive,hostHeartbeatAt:{toMillis:()=>now-310000}},now),false);
});
test('Sorteggio primo round cambia squadre senza separare coppie',()=>{
 const entrants=Array.from({length:8},(_,i)=>({id:'team'+i,name:'Team '+i,members:['player'+i+'a','player'+i+'b']}));
 const randomized=shuffleEventEntrants(entrants,()=>0);
 assert.notDeepEqual(randomized.map(x=>x.id),entrants.map(x=>x.id));
 const bracket=makeEventBracket(entrants,()=>0);
 const first=bracket.filter(x=>x.round===0);
 assert.equal(first.length,4);
 const picked=first.flatMap(x=>[x.sideA,x.sideB]);
 assert.equal(new Set(picked.map(x=>x.id)).size,8);
 for(const entry of picked){
   assert.deepEqual(entry.members,entrants.find(x=>x.id===entry.id).members);
 }
 assert.deepEqual(entrants[0].members,['player0a','player0b']);
});
test('Presenza non mostra account scollegati o più schede della stessa persona',()=>{
 const sessions=[
   {uid:'me',sessionId:'mine',name:'Io',timestamp:now},
   {uid:'u1',sessionId:'oldtab',name:'Giulia',timestamp:now-40000},
   {uid:'u1',sessionId:'newtab',name:'Giulia',timestamp:now-5000},
   {uid:'u2',sessionId:'expired',name:'Marco',timestamp:now-ONLINE_TIMEOUT_MS-1},
   {uid:'u3',sessionId:'future',name:'Fake',timestamp:now+3600000},
   {uid:'u4',sessionId:'fresh',name:'Sara',timestamp:now-35000}
 ];
 const visible=visibleOnlinePlayers(sessions,'mine',now);
 assert.deepEqual(visible.map(x=>x.uid),['u1','u4']);
 assert.equal(visible[0].sessionId,'newtab');
});
test('Danno evento può riutilizzare la stessa formula della battaglia normale',()=>{
 const attacker={id:'finn',name:'Finn',atk:105,def:90,maxHp:100,types:['Spettro'],passive:null,statuses:[],heldItem:'iperband'};
 const defender={id:'jake',name:'Jake',atk:90,def:100,baseDef:100,maxHp:110,types:['Normale'],passive:null,statuses:[]};
 const move={name:'Urto',power:95,type:'Spettro'};
 const withBand=calculateDamageImpl({},attacker,defender,move,1,false,()=>0.6);
 const without=calculateDamageImpl({}, {...attacker,heldItem:null},defender,move,1,false,()=>0.6);
 assert.ok(withBand>without,'La formula classica deve applicare Iperband');
});
