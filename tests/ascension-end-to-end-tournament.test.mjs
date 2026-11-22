import test from 'node:test';
import assert from 'node:assert/strict';
import {CHARACTERS} from '../src/data/characters.js';
import {ascensionFirestorePayload} from '../src/systems/ascensionFirestorePayload.js';
import {
 ascensionCreate,ascensionSelectStarter,ascensionBeginAction,
 ascensionRoundReady,ascensionNextRound,ascensionCurrentMatch,
 ascensionChooseLineup,ascensionCreateRealDuel,ascensionRealSubmit,
 ascensionRealAdvance,ascensionAcknowledgeDuelResult,
 ascensionAdvanceMatch,ASCENSION_ROUNDS
} from '../src/systems/colosseumAscension.js';

const roles=Array.from({length:8},(_,i)=>'p'+(i+1));
const room={
 gameMode:'ascension',status:'ascension',
 players:Object.fromEntries(roles.map(r=>[r,'Giocatore '+r])),
 isBot:Object.fromEntries(roles.map(r=>[r,false]))
};
const save=state=>structuredClone(ascensionFirestorePayload(state));
const attack=(side,targetPlayer)=>({
 type:'attack',moveIdx:0,targetPlayer,targetIdx:0,targetFieldIdx:0
});
function openDuel(a,match){
 for(const role of match.roles){
  const ids=a.participants[role].roster.map(x=>x.id);
  a=ascensionChooseLineup(a,role,ids,CHARACTERS);
 }
 return ascensionCreateRealDuel(a,CHARACTERS,room);
}
function winOneRealBattle(a,match){
 const native=match.game.classicRoom;
 assert.ok(native,'Tutti i duelli devono possedere la stanza classica');
 assert.equal(native.gameMode,'classica');
 // Impostiamo un KO garantito per velocizzare questo test delle transizioni:
 // il KO viene comunque inflitto e risolto da calculateTurnImpl originale.
 const strong=native.teams.p1[0],weak=native.teams.p2[0];
 strong.moves=[{name:'Attacco di prova',type:'Normale',power:9000,
  accuracy:1,remainingUses:null}];
 strong.types=['Normale'];strong.atk=9000;strong.spd=9000;
 strong.statuses=[];strong.passive=null;
 weak.moves=[{name:'Attesa',type:'Normale',power:0,target:'self',accuracy:1}];
 weak.types=['Normale'];weak.hp=1;weak.def=1;weak.spDef=1;
 weak.statuses=[];weak.passive=null;weak.heldItem=null;
 weak.ascensionStarterCloak=true;weak.ascensionStarterCloakUsed=true;
 a=ascensionRealSubmit(a,match.roles[0],{0:attack('p1','p2')},native.phaseStartedAt,CHARACTERS);
 const afterHuman=ascensionCurrentMatch(a).game.classicRoom;
 assert.equal(afterHuman.status,'battling','L avversario deve ancora confermare');
 a=save(a);
 a=ascensionRealSubmit(a,match.roles[1],
  {0:attack('p2','p2')},afterHuman.phaseStartedAt,CHARACTERS);
 let b=ascensionCurrentMatch(a).game.classicRoom;
 assert.equal(b.status,'executing','Le mosse sono calcolate dal motore originale');
 assert.ok(b.events.some(e=>e.type==='battle_actor'));
 const phase=b.phaseStartedAt;
 a=save(a); // riconnessione prima dell'animazione conclusiva
 a=ascensionRealAdvance(a,match.roles[0],phase,CHARACTERS);
 b=ascensionCurrentMatch(a).game.classicRoom;
 assert.equal(b.status,'gameover','Il KO deve terminare normalmente la partita');
 assert.equal(ascensionCurrentMatch(a).game.winner,match.roles[0],
  'Il vincitore reale della partita deve avanzare');
 return save(a);
}

test('Partita completa: 8 partecipanti, 18 round, 4 quarti, 2 semifinali, finale e campione',()=>{
 let a=ascensionCreate(room,CHARACTERS,()=>.31);
 assert.equal(a.roles.length,8);
 for(const role of roles)
  a=ascensionSelectStarter(a,role,a.participants[role].options[0],CHARACTERS);
 assert.equal(a.stage,'preparation');
 for(let round=1;round<=ASCENSION_ROUNDS;round++){
  assert.equal(a.round,round);
  for(const role of roles)a=ascensionBeginAction(a,role,'rest',CHARACTERS);
  assert.equal(ascensionRoundReady(a),true);
  a=save(a); // round salvato su Firestore e ricaricato
  a=ascensionNextRound(a,CHARACTERS);
 }
 assert.equal(a.stage,'colosseum');
 assert.equal(a.bracket.length,4);
 let concluded=0;
 while(a.stage==='colosseum'){
  assert.ok(concluded<7,'Il bracket non può bloccarsi in un incontro');
  const match=ascensionCurrentMatch(a);
  assert.ok(match,'Il prossimo duello deve esistere');
  assert.equal(match.roles.length,2);
  let games=0;
  do{
   a=openDuel(a,ascensionCurrentMatch(a));
   a=save(a);
   a=winOneRealBattle(a,ascensionCurrentMatch(a));
   games++;
   const after=ascensionCurrentMatch(a);
   if(!after.winner){
    assert.equal(after.game.winner,match.roles[0]);
    a=ascensionAcknowledgeDuelResult(a,match.roles[0]);
    a=ascensionAcknowledgeDuelResult(a,match.roles[1]);
    assert.equal(ascensionCurrentMatch(a).game,null);
    a=save(a);
   }
  }while(!ascensionCurrentMatch(a).winner&&games<4);
  assert.equal(ascensionCurrentMatch(a).winner,match.roles[0]);
  assert.equal(games,match.stage==='finale'?1:2);
  concluded++;
  a=ascensionAdvanceMatch(save(a),CHARACTERS);
 }
 assert.equal(concluded,7,'Quattro quarti, due semifinali e finale devono essere conclusi');
 assert.equal(a.stage,'finished');
 assert.equal(a.bracket.length,7);
 assert.ok(a.champion&&roles.includes(a.champion));
 assert.equal(a.champion,a.bracket[6].winner);
 assert.ok(a.history.some(s=>s.includes('finale')));
});
