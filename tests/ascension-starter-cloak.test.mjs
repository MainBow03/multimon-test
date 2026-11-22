import test from 'node:test';
import assert from 'node:assert/strict';
import {CHARACTERS} from '../src/data/characters.js';
import {
 ASCENSION_STARTER_CLOAK_ID,equipAscensionStarterCloak,
 activateAscensionStarterCloak,consumeAscensionStarterCloak
} from '../src/systems/ascensionStarterCloak.js';
import {
 ascensionCreate,ascensionSelectStarter,ascensionBeginAction,
 ascensionCreateRealEncounter,ascensionNextRound,
 ascensionChooseLineup,ascensionCurrentMatch,ascensionCreateRealDuel
} from '../src/systems/colosseumAscension.js';
import {createRealAscensionBattle,submitRealAscensionActions} from '../src/systems/ascensionRealBattle.js';
const roles=Array.from({length:8},(_,i)=>'p'+(i+1));
const room=()=>({
 gameMode:'ascension',status:'ascension',
 players:Object.fromEntries(roles.map(r=>[r,'Allenatore '+r])),
 isBot:Object.fromEntries(roles.map(r=>[r,false]))
});
function prepared(){
 const rm=room();
 let a=ascensionCreate(rm,CHARACTERS,()=>.24);
 for(const role of roles){
  a=ascensionSelectStarter(a,role,a.participants[role].options[0],CHARACTERS);
 }
 return {rm,a};
}
test('Tutti e otto gli starter ottengono gratis il mantello, non i nuovi selvatici',()=>{
 const {a}=prepared();
 for(const role of roles){
  const starter=a.participants[role].roster[0];
  assert.equal(starter.heldItem,ASCENSION_STARTER_CLOAK_ID);
  assert.equal(starter.ascensionStarterCloak,true);
 }
 let next=ascensionBeginAction(a,'p1','wild',CHARACTERS,()=>.42);
 next=ascensionCreateRealEncounter(next,'p1',CHARACTERS,room());
 const b=next.participants.p1.encounter.classicRoom;
 assert.equal(b.gameMode,'classica');
 assert.equal(b.isAscensionNativeBattle,true);
 assert.equal(b.teams.p1[0].heldItem,ASCENSION_STARTER_CLOAK_ID);
 assert.equal(b.teams.p1[0].ascensionStarterCloak,true);
 assert.equal(b.teams.p1[0].ascensionStarterCloakUsed,false);
 assert.equal(b.teams.p2[0].ascensionStarterCloak,false);
});
test('Mantello: un attacco intero bloccato, nessuna ricarica nello stesso combattimento',()=>{
 const target=activateAscensionStarterCloak({name:'Starter',hp:100,maxHp:100});
 const multiHit={name:'Colpi ripetuti',type:'Normale',power:90,multiHit:{min:2,max:4}};
 assert.equal(consumeAscensionStarterCloak(target,multiHit),true);
 assert.equal(target.ascensionStarterCloakUsed,true);
 assert.equal(consumeAscensionStarterCloak(target,multiHit),false);
 assert.equal(consumeAscensionStarterCloak(target,{name:'Status',power:0}),false);
 activateAscensionStarterCloak(target);
 assert.equal(target.ascensionStarterCloakUsed,false,'Si ricarica solo alla nuova battaglia');
 assert.equal(consumeAscensionStarterCloak(target,{power:0,percentDmgMax:.4}),true);
 const ordinaryCloak={hp:80,maxHp:80,heldItem:ASCENSION_STARTER_CLOAK_ID};
 assert.equal(consumeAscensionStarterCloak(ordinaryCloak,{power:100}),false,
  'Il Mantello usato fuori dall’Ascesa non deve guadagnare lo scudo');
 assert.equal(equipAscensionStarterCloak({id:'sonic'}).heldItem,ASCENSION_STARTER_CLOAK_ID);
});
test('Lo stesso motore classico annulla il primo attacco: nessun OHKO, evento visibile',()=>{
 const base=CHARACTERS.find(c=>c.id==='sonic');
 assert.ok(base);
 const member={id:'sonic',level:1,hp:Math.round((base.maxHp||base.hp)*.7)};
 const b=createRealAscensionBattle({chars:CHARACTERS,
  teamOne:[equipAscensionStarterCloak(member)],
  teamTwo:[member],secondBot:true,fieldSize:1});
 b.teams.p1[0].moves=[{name:'Attesa',type:'Normale',power:0,target:'self'}];
 b.teams.p2[0].moves=[{name:'Colpo possente',type:'Normale',power:240,accuracy:1}];
 b.teams.p2[0].spd=9999;
 b.teams.p2[0].atk=999;
 b.teams.p2[0].spAtk=999;
 const original=b.teams.p1[0].hp;
 const previous=Math.random;
 let done;
 try{
  Math.random=()=>.85; // Non elude l'attacco e la precisione resta al 100%.
  done=submitRealAscensionActions(b,'p1',{
   0:{type:'attack',moveIdx:0,targetPlayer:'p1',targetIdx:0}
  },CHARACTERS);
 }finally{Math.random=previous;}
 assert.equal(done.status,'executing');
 assert.equal(done.teams.p1[0].hp,original,'Il primo attacco nemico viene annullato');
 assert.equal(done.teams.p1[0].ascensionStarterCloakUsed,true);
 assert.ok(done.events.some(e=>e.text?.includes('Mantello dell’Invisibilità')),
  'Il giocatore deve vedere l’attivazione nel registro originale');
});
test('Il mantello segue lo starter anche nelle formazioni del Colosseo',()=>{
 const {rm,a}=prepared();
 const prep={...a,round:18,participants:Object.fromEntries(
  roles.map(role=>[role,{...a.participants[role],done:true,encounter:null,battleResult:null}]))};
 let next=ascensionNextRound(prep,CHARACTERS);
 const [first,second]=ascensionCurrentMatch(next).roles;
 for(const role of [first,second])
  next=ascensionChooseLineup(next,role,[next.participants[role].roster[0].id],CHARACTERS);
 next=ascensionCreateRealDuel(next,CHARACTERS,rm);
 const duel=ascensionCurrentMatch(next).game.classicRoom;
 assert.equal(duel.teams.p1[0].heldItem,ASCENSION_STARTER_CLOAK_ID);
 assert.equal(duel.teams.p2[0].heldItem,ASCENSION_STARTER_CLOAK_ID);
 assert.equal(duel.teams.p1[0].ascensionStarterCloakUsed,false);
 assert.equal(duel.teams.p2[0].ascensionStarterCloakUsed,false);
});
