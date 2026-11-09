import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {normalizeEventSettings,makeEventBracket,nextEventMatch,buildEventBattle,activeEventFighters} from '../src/systems/multiverseEventEngine.js';
import {adaptTournamentToClassic,translateTournamentCommands,resolveEventWithStandardEngine} from '../src/systems/standardEventTurn.js';

const roster=CHARACTERS.filter(c=>!c.isSummonOnly&&!c.isSecretUnlock).slice(0,4).map(c=>c.id);
const person=uid=>({id:uid,uid,name:uid,teamIds:roster,ready:true,heldItems:{}});
function newBattle(settings) {
 const people=['u1','u2','u3','u4'].slice(0,settings.doubles?4:2).map(person);
 const entrants=people.map((p,i)=>({id:'entrant'+i,name:p.name,members:[p.uid]}));
 if(settings.doubles)return buildEventBattle({id:'test',sideA:{id:'a',name:'A',members:['u1','u2']},sideB:{id:'b',name:'B',members:['u3','u4']}},Object.fromEntries(people.map(p=>[p.uid,p])),{...settings,standardEngine:true});
 return buildEventBattle({id:'test',sideA:entrants[0],sideB:entrants[1]},Object.fromEntries(people.map(p=>[p.uid,p])),{...settings,standardEngine:true});
}
function commandsFor(b,s){
 const a=activeEventFighters(b,'A',s),z=activeEventFighters(b,'B',s);
 const pick=(members,target)=>Object.fromEntries(
  [...new Set(members.map(unit=>unit.owner))].map(uid=>[uid,members.filter(u=>u.owner===uid).map(unit=>({
   actor:unit.key,moveIndex:unit.moves.findIndex(m=>m.power>0)>=0?unit.moves.findIndex(m=>m.power>0):0,target:target[0]?.key
  }))])
 );
 return {...pick(a,z),...pick(z,a)};
}

test('Le due squadre si convertono nei ruoli ufficiali p1/p2 o p1/p2 contro p3/p4',()=>{
 const singles=normalizeEventSettings({entrants:4,fieldSize:2});
 const battle=newBattle(singles);
 assert.equal(battle.side,'both');
 const mapped=adaptTournamentToClassic(battle,singles);
 assert.deepEqual(mapped.owners,['u1','u2']);
 assert.equal(mapped.roles.u1,'p1');assert.equal(mapped.roles.u2,'p2');
 assert.equal(mapped.gameState.gameMode,'classica');
 assert.equal(mapped.field.p1.length,2);
 assert.equal(mapped.teams.p1.length,4);
 assert.deepEqual(mapped.teams.p1[0].statuses,[]);
 assert.equal(mapped.teams.p1[0].baseAtk,roster[0]&&mapped.teams.p1[0].atk);
 const double=normalizeEventSettings({entrants:4,doubles:true,fieldSize:2});
 const b2=newBattle(double),map2=adaptTournamentToClassic(b2,double);
 assert.equal(b2.side,'both');
 assert.deepEqual(map2.owners,['u1','u2','u3','u4']);
 assert.equal(map2.roles.u3,'p3');assert.equal(map2.roles.u4,'p4');
 assert.equal(map2.gameState.gameMode,'multipla');
 for(const uid of map2.owners)assert.equal(map2.field[map2.roles[uid]].length,2);
});

test('Il torneo invia esattamente gli stessi oggetti azione del motore classico',()=>{
 const s=normalizeEventSettings({entrants:4,fieldSize:1});
 const b=newBattle(s),c=adaptTournamentToClassic(b,s);
 const attacker=activeEventFighters(b,'A',s)[0],enemy=activeEventFighters(b,'B',s)[0];
 const acts=translateTournamentCommands(b,{u1:[{actor:attacker.key,moveIndex:1,target:enemy.key,hyper:true}]},c);
 assert.equal(acts.p1[0].type,'attack');
 assert.equal(acts.p1[0].moveIdx,1);
 assert.equal(acts.p1[0].targetPlayer,'p2');
 assert.equal(acts.p1[0].targetIdx,0);
 assert.equal(acts.p1[0].hyperize,false);
 assert.equal(acts.p2[0],undefined);
 const malicious=translateTournamentCommands(b,{u2:[{actor:attacker.key,moveIndex:1,target:enemy.key}]},c);
 assert.deepEqual(malicious.p1,{});
 assert.deepEqual(malicious.p2,{});
});

test('Il server eventi richiama il motore classico, non quello parallelo',()=>{
 const hub=readFileSync(new URL('../src/screens/events/MultiverseEventHub.jsx',import.meta.url),'utf8');
 const standard=readFileSync(new URL('../src/systems/standardEventTurn.js',import.meta.url),'utf8');
 const screen=readFileSync(new URL('../src/screens/events/EventClassicBattleView.jsx',import.meta.url),'utf8');
 assert.match(standard,/calculateTurnImpl\(\{/);
 assert.match(hub,/resolveEventWithStandardEngine\(old\.activeBattle,all,old\.settings\)/);
 assert.match(hub,/resolveEventWithStandardEngine\(b,submissions,old\.settings\)/);
 assert.doesNotMatch(hub,/const after=eventTurn\(/);
 assert.match(hub,/standardEngine:true/);
 assert.match(screen,/battle\.side==='both'/);
 assert.match(screen,/setSubmitted\(true\)/);
});

test('Il motore ufficiale risolve un round con i comandi di entrambe le squadre',()=>{
 const s=normalizeEventSettings({entrants:4,teamSize:4,fieldSize:1});
 const b=newBattle(s);
 const all=commandsFor(b,s);
 const next=resolveEventWithStandardEngine(b,all,s);
 assert.equal(next.turn,2);
 assert.equal(next.side,'both');
 assert.ok(next.log.length>b.log.length,'Le mosse hanno prodotto eventi nel registro');
 assert.equal(next.teams.A.length,b.teams.A.length);
 assert.equal(next.teams.B.length,b.teams.B.length);
 assert.equal(typeof next.finished,'boolean');
 assert.ok(next.teams.A[0].moves[0].remainingUses!==undefined);
 const damage=next.teams.A.some(u=>u.hp<b.teams.A.find(v=>v.key===u.key).hp)
   ||next.teams.B.some(u=>u.hp<b.teams.B.find(v=>v.key===u.key).hp);
 assert.ok(damage||next.log.some(t=>t.includes('manca')||t.includes('stordit')),
  'Il turno è stato davvero calcolato dal motore standard');
});

test('Lato bot: entrambi i partecipanti agiscono nello stesso turno condiviso',()=>{
 const s=normalizeEventSettings({entrants:4,doubles:true,fieldSize:1});
 const b=newBattle(s);
 const actions=commandsFor(b,s);
 const next=resolveEventWithStandardEngine(b,actions,s);
 assert.equal(next.turn,2);
 assert.equal(next.side,'both');
 assert.equal(Object.keys(next.activeKeys).length,4);
 for(const uid of ['u1','u2','u3','u4'])assert.ok(Array.isArray(next.activeKeys[uid]));
});
