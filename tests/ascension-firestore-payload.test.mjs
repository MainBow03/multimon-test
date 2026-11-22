import test from 'node:test';
import assert from 'node:assert/strict';
import {CHARACTERS} from '../src/data/characters.js';
import {ascensionFirestorePayload} from '../src/systems/ascensionFirestorePayload.js';
import {
 ascensionCreate,ascensionSelectStarter,ascensionBeginAction,
 ascensionCreateRealEncounter,ascensionRealCapture,ascensionRealCaptureContinue,
 ascensionNextRound,ascensionChooseLineup,ascensionCreateRealDuel,
 ascensionCurrentMatch
} from '../src/systems/colosseumAscension.js';

const roles=Array.from({length:8},(_,i)=>'p'+(i+1));
const room=()=>({gameMode:'ascension',status:'ascension',
 players:Object.fromEntries(roles.map(p=>[p,p])),
 isBot:Object.fromEntries(roles.map(p=>[p,false]))});
function setup(){
 const r=room();
 let asc=ascensionCreate(r,CHARACTERS,()=>.2);
 for(const role of roles)
  asc=ascensionSelectStarter(asc,role,asc.participants[role].options[0],CHARACTERS);
 return {r,asc};
}
function findUndefined(value,path='ascension'){
 if(value===undefined)return path;
 if(!value||typeof value!=='object')return null;
 for(const [key,entry] of Object.entries(value)){
  const bad=findUndefined(entry,path+'.'+key);
  if(bad)return bad;
 }
 return null;
}
test('Riproduzione bug: la battaglia nativa contiene campi opzionali undefined nel roster',()=>{
 const {r,asc}=setup();
 const started=ascensionCreateRealEncounter(
  ascensionBeginAction(asc,'p1','trainer',CHARACTERS,()=>.32),'p1',CHARACTERS,r);
 const nested=started.participants.p1.encounter.classicRoom;
 const all=Object.values(nested.teams).flat();
 assert.ok(all.length>=2);
 // Optional catalog fields (e.g. zodiacSpiritId) are valid JS but invalid Firestore.
 assert.ok(all.some(member=>member.zodiacSpiritId===undefined));
});
test('Round allenatore e selvatico: nessun undefined dopo pulizia Firestore',()=>{
 for(const kind of ['wild','trainer']){
  const {r,asc}=setup();
  const started=ascensionCreateRealEncounter(
   ascensionBeginAction(asc,'p1',kind,CHARACTERS,()=>.33),'p1',CHARACTERS,r);
  const before=started.participants.p1.encounter.classicRoom;
  const cleaned=ascensionFirestorePayload(started);
  const after=cleaned.participants.p1.encounter.classicRoom;
  assert.equal(findUndefined(cleaned),null);
  assert.equal(after.status,'battling');
  assert.equal(after.gameMode,'classica');
  assert.deepEqual(after.field.p1,before.field.p1);
  assert.equal(after.teams.p1[0].hp,before.teams.p1[0].hp);
  assert.deepEqual(after.teams.p1[0].moves,before.teams.p1[0].moves.map(m=>JSON.parse(JSON.stringify(m))));
  assert.equal(started.participants.p1.encounter.classicRoom, before,
   'La pulizia non modifica la stanza originale nella memoria del gioco.');
  assert.doesNotThrow(()=>JSON.stringify({ascension:cleaned}));
 }
});
test('Cattura fallita e reazione avversaria: serializzazione sicura anche con eventi nativi',()=>{
 const {r,asc}=setup();
 let next=ascensionCreateRealEncounter(
  ascensionBeginAction(asc,'p1','wild',CHARACTERS,()=>.42),'p1',CHARACTERS,r);
 next=ascensionRealCapture(next,'p1',CHARACTERS,()=>.999);
 let payload=ascensionFirestorePayload(next);
 assert.equal(findUndefined(payload),null);
 assert.equal(payload.participants.p1.encounter.classicRoom.status,'ascension_capture');
 next=ascensionRealCaptureContinue(next,'p1',CHARACTERS);
 payload=ascensionFirestorePayload(next);
 assert.equal(findUndefined(payload),null);
 assert.equal(payload.participants.p1.encounter.classicRoom.status,'executing');
 assert.ok(payload.participants.p1.encounter.classicRoom.events.length);
});
test('Finale 2v2: anche i dati di entrambe le squadre e dei turni sono serializzabili',()=>{
 const {r,asc}=setup();
 const prep={...asc,round:18,participants:Object.fromEntries(roles.map(role=>[
  role,{...asc.participants[role],done:true,encounter:null,battleResult:null}
 ]))};
 let next=ascensionNextRound(prep,CHARACTERS);
 const match=ascensionCurrentMatch(next);
 const [left,right]=match.roles;
 for(const role of [left,right]){
  const original=next.participants[role].roster[0].id;
  const extra=CHARACTERS.find(ch=>ch.id!==original&&!ch.isSummonOnly&&!ch.isSecretUnlock&&!ch.isCampaignMonster);
  next.participants[role].roster.push({id:extra.id,level:1,hp:45,xp:0,trainingHalves:0});
 }
 next.bracket[0].stage='finale';
 for(const role of [left,right])
  next=ascensionChooseLineup(next,role,next.participants[role].roster.map(m=>m.id),CHARACTERS);
 next=ascensionCreateRealDuel(next,CHARACTERS,r);
 const safe=ascensionFirestorePayload(next);
 const b=ascensionCurrentMatch(safe).game.classicRoom;
 assert.equal(findUndefined(safe),null);
 assert.equal(b.gameMode,'classica');
 assert.equal(b.settings.fieldSize,2);
 assert.deepEqual(b.field.p1,[0,1]);
 assert.deepEqual(b.field.p2,[0,1]);
});
test('Mantiene 0, false e null, ma omette undefined in oggetti e usa null negli array',()=>{
 const before={foo:undefined,bar:0,flag:false,empty:null,
  moves:[{name:'Mossa',effect:undefined},undefined,0]};
 const safe=ascensionFirestorePayload(before);
 assert.deepEqual(safe,{bar:0,flag:false,empty:null,moves:[{name:'Mossa'},null,0]});
 assert.ok(Object.hasOwn(before,'foo'),'Non alterare i dati di ingresso');
 assert.throws(()=>ascensionFirestorePayload({bad:Number.POSITIVE_INFINITY}),/Numero non valido/);
});
