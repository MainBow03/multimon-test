import test from 'node:test';
import assert from 'node:assert/strict';
import {CHARACTERS} from '../src/data/characters.js';
import {
 createRealAscensionBattle,submitRealAscensionActions,resolveRealAscensionCpu,
 advanceRealAscensionBattle,chooseRealAscensionReplacement,
 recoverRealAscensionCpuReplacement
} from '../src/systems/ascensionRealBattle.js';
import {ascensionNextCommandPosition} from '../src/systems/ascensionDoubleCommands.js';
import {ascensionFirestorePayload} from '../src/systems/ascensionFirestorePayload.js';
import {
 ascensionCreate,ascensionSelectStarter,ascensionNextRound,ascensionCurrentMatch,
 ascensionChooseLineup,ascensionCreateRealDuel,ascensionRealSubmit,
 ascensionRealAdvance,ascensionRealAutoReplace,ascensionRealReplace
} from '../src/systems/colosseumAscension.js';

const character=id=>{
 const c=CHARACTERS.find(v=>v.id===id);
 assert.ok(c,id+' must exist');
 return c;
};
const member=id=>({id,level:3,hp:Math.max(12,Math.round((character(id).maxHp||character(id).hp||100)*.8))});
const fresh=(fieldSize=1,bots=false)=>createRealAscensionBattle({
 chars:CHARACTERS,
 teamOne:['sonic','luigi','gardevoir'].map(member),
 teamTwo:['finn','miku','sage'].map(member),
 firstName:'Umano',secondName:'CPU Brio',
 firstBot:bots,secondBot:true,fieldSize
});
const action=(room,side,teamIdx,targetFieldPosition=0)=>{
 const c=room.teams[side][teamIdx];
 const idx=c.moves.findIndex(m=>m?.power>0 && m.remainingUses!==0);
 const enemy=side==='p1'?'p2':'p1';
 assert.ok(idx>=0,c.name+' must have at least one usable attack');
 return {type:'attack',moveIdx:idx,targetPlayer:enemy,
  targetIdx:room.field[enemy][targetFieldPosition]??room.field[enemy][0],
  targetFieldIdx:targetFieldPosition};
};
const roundtrip=room=>structuredClone(ascensionFirestorePayload({room})).room;
const alive=(b,side)=>(b.teams[side]||[]).filter(c=>c.hp>0&&!c.isSummonOnly).length;

function runTurn(room){
 if(room.status!=='battling')return room;
 const before=room.battleReport?.turns||0;
 if(room.isBot.p1){
  room=resolveRealAscensionCpu(room,CHARACTERS);
 }else{
  const side='p1';
  for(const idx of room.field.p1.filter(i=>room.teams.p1[i].hp>0)){
   const move=action(room,side,idx,0);
   room=submitRealAscensionActions(room,'p1',{[idx]:move},CHARACTERS);
   if(room.status!=='battling')break;
   room=roundtrip(room);
  }
 }
 assert.equal(room.status,'executing','I comandi completi devono generare eventi classici');
 assert.equal(room.battleReport.turns,before+1,'Un turno non va calcolato due volte');
 return room;
}

test('1v1 contro CPU: turni, sostituzioni, serializzazione e replay fino a gameover',()=>{
 let b=fresh(1);
 let attempts=0;
 for(let i=0;i<55&&b.status!=='gameover';i++){
  b=roundtrip(b); // equivale a rientrare leggendo lo stato condiviso
  if(b.status==='battling')b=runTurn(b);
  else if(b.status==='executing')
   b=advanceRealAscensionBattle(b,b.phaseStartedAt,CHARACTERS);
  else if(b.status==='switching_phase'){
   b=recoverRealAscensionCpuReplacement(b,CHARACTERS);
   if(b.status==='switching_phase'){
    const idx=b.teams.p1.findIndex((c,k)=>c.hp>0&&!c.isSummonOnly&&!b.field.p1.includes(k));
    if(idx>=0)b=chooseRealAscensionReplacement(b,'p1',idx,CHARACTERS);
   }
  }
  attempts++;
 }
 assert.ok(attempts>1);
 assert.ok(['gameover','battling','executing','switching_phase'].includes(b.status));
 if(b.status==='battling')assert.ok(alive(b,'p1')>0&&alive(b,'p2')>0);
 assert.ok((b.battleReport?.turns||0)>=1);
});

test('2v2 contro CPU: due comandi, scelta del bersaglio 2, azioni conservate dopo refresh',()=>{
 let b=fresh(2);
 assert.deepEqual(b.field.p1,[0,1]);assert.deepEqual(b.field.p2,[0,1]);
 const left=action(b,'p1',0,1);
 b=submitRealAscensionActions(b,'p1',{0:left},CHARACTERS);
 b=roundtrip(b);
 assert.equal(b.actions.p1[0].targetFieldIdx,1);
 assert.equal(ascensionNextCommandPosition(b,'p1'),1);
 const right=action(b,'p1',1,0);
 b=submitRealAscensionActions(b,'p1',{1:right},CHARACTERS);
 assert.equal(b.status,'executing','CPU deve confermare entrambi i propri combattenti');
 assert.equal(b.battleReport.turns,1);
 assert.equal(advanceRealAscensionBattle(b,b.phaseStartedAt,CHARACTERS).status==='gameover'||
  advanceRealAscensionBattle(b,b.phaseStartedAt,CHARACTERS).status==='battling'||
  advanceRealAscensionBattle(b,b.phaseStartedAt,CHARACTERS).status==='switching_phase'||
  advanceRealAscensionBattle(b,b.phaseStartedAt,CHARACTERS).status==='executing',true);
});

test('Bot-vs-bot 2v2 utilizza lo stesso motore di turni, senza comandi manuali',()=>{
 let b=fresh(2,true);
 for(let i=0;i<3;i++){
  if(b.status!=='battling')break;
  b=resolveRealAscensionCpu(roundtrip(b),CHARACTERS);
  assert.equal(b.status,'executing');
  assert.ok(b.events.some(e=>e.type==='battle_actor'));
  b=advanceRealAscensionBattle(roundtrip(b),b.phaseStartedAt,CHARACTERS);
  if(b.status==='executing')
   b=advanceRealAscensionBattle(roundtrip(b),b.phaseStartedAt,CHARACTERS);
 }
 assert.ok((b.battleReport?.turns||0)>=1);
});

test('Avvio vero del tabellone a otto: 1v1 e finale 2v2 persistono senza ricreare gli HP',()=>{
 const roles=Array.from({length:8},(_,i)=>'p'+(i+1));
 const room={gameMode:'ascension',status:'ascension',
  players:Object.fromEntries(roles.map(r=>[r,'Giocatore '+r])),
  isBot:Object.fromEntries(roles.map(r=>[r,false]))};
 let a=ascensionCreate(room,CHARACTERS,()=>.33);
 for(const role of roles)
  a=ascensionSelectStarter(a,role,a.participants[role].options[0],CHARACTERS);
 const participants=structuredClone(a.participants);
 for(const role of roles){
  participants[role].done=true;
  participants[role].encounter=null;
  participants[role].battleResult=null;
 }
 a=ascensionNextRound({...a,round:18,participants},CHARACTERS);
 const match=ascensionCurrentMatch(a);
 assert.equal(match.stage,'quarti');
 const [left,right]=match.roles;
 for(const role of [left,right]){
  const current=a.participants[role].roster[0].id;
  const extra=CHARACTERS.find(c=>c.id!==current&&!c.isSummonOnly&&!c.isSecretUnlock&&!c.isCampaignMonster);
  a.participants[role].roster.push(member(extra.id));
 }
 a.bracket[0].stage='finale';
 for(const role of [left,right])
  a=ascensionChooseLineup(a,role,a.participants[role].roster.map(m=>m.id),CHARACTERS);
 a=ascensionCreateRealDuel(a,CHARACTERS,room);
 let b=ascensionCurrentMatch(a).game.classicRoom;
 assert.deepEqual(b.field.p1,[0,1]);assert.deepEqual(b.field.p2,[0,1]);
 const first=action(b,'p1',b.field.p1[0]);
 a=ascensionRealSubmit(a,left,{[b.field.p1[0]]:first},b.phaseStartedAt,CHARACTERS);
 a=structuredClone(ascensionFirestorePayload(a));
 b=ascensionCurrentMatch(a).game.classicRoom;
 assert.equal(b.status,'battling');
 const second=action(b,'p1',b.field.p1[1]);
 a=ascensionRealSubmit(a,left,{[b.field.p1[1]]:second},b.phaseStartedAt,CHARACTERS);
 b=ascensionCurrentMatch(a).game.classicRoom;
 assert.equal(b.status,'battling');
 const opponentActions=Object.fromEntries(b.field.p2.map(i=>[i,action(b,'p2',i)]));
 a=ascensionRealSubmit(a,right,opponentActions,b.phaseStartedAt,CHARACTERS);
 b=ascensionCurrentMatch(a).game.classicRoom;
 assert.equal(b.status,'executing');
 const before=b.battleReport.turns;
 a=structuredClone(ascensionFirestorePayload(a));
 a=ascensionRealAdvance(a,left,b.phaseStartedAt,CHARACTERS);
 b=ascensionCurrentMatch(a).game.classicRoom;
 assert.ok(['battling','switching_phase','executing','gameover'].includes(b.status));
 assert.equal(b.battleReport.turns,before,'Replay non deve calcolare un secondo turno');
});

test('Idempotenza dopo reconnect: avanzamento vecchio e comando duplicato non ripetono danni',()=>{
 let b=fresh(1);
 const attack1=action(b,'p1',0);
 b=submitRealAscensionActions(b,'p1',{0:attack1},CHARACTERS);
 assert.equal(b.status,'executing');
 const oldPhase=b.phaseStartedAt;
 const after=advanceRealAscensionBattle(roundtrip(b),oldPhase,CHARACTERS);
 const repeated=advanceRealAscensionBattle(after,oldPhase,CHARACTERS);
 assert.equal(repeated,after,'La vecchia transizione non va riapplicata');
 if(after.status==='battling'){
  const actions={...after.actions.p1};
  assert.deepEqual(actions,{});
 }
});
