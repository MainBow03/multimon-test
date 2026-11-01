import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTERS } from '../src/data/characters.js';
import { CHAR_PRICES } from '../src/data/prices.js';
import { EVENT_PRIZES, normalizeEventSettings, validTeam, makeEventEntrants, makeEventBracket,
 nextEventMatch, completeEventMatch, eventPlacements, buildEventBattle, activeEventFighters, botActions, eventTurn, simulateBots } from '../src/systems/multiverseEventEngine.js';
const ids=CHARACTERS.filter(c=>!c.isSummonOnly&&!c.isSecretUnlock).slice(0,4).map(c=>c.id);
const member=(id)=>({id,name:id,teamIds:ids,ready:true});
const s=normalizeEventSettings({entrants:4,teamSize:4,fieldSize:1});
test('Impostazioni e team, inclusi 16 team a coppie',()=>{
 assert.equal(normalizeEventSettings({entrants:5,teamSize:100,fieldSize:100}).entrants,8);
 assert.equal(normalizeEventSettings({doubles:true,fieldSize:4}).fieldSize,2);
 assert.equal(validTeam(ids,s),true);
 assert.equal(validTeam([ids[0],ids[0],...ids.slice(2)],s),false);
 const ds=normalizeEventSettings({entrants:16,doubles:true});
 assert.throws(()=>makeEventEntrants([member('a')],[],ds));
 assert.equal(makeEventEntrants(Array.from({length:32},(_,i)=>member('p'+i)),[],ds).length,16);
});
test('Bracket a eliminazione, terzo posto, premi anche per chi perde',()=>{
 const entrants=makeEventEntrants(['a','b','c','d'].map(member),[],s);
 let m=makeEventBracket(entrants);
 assert.equal(m.length,4);assert.equal(nextEventMatch(m).id,'r0-m0');
 m=completeEventMatch(m,'r0-m0','A');m=completeEventMatch(m,'r0-m1','B');
 assert.equal(nextEventMatch(m).id,'bronze');
 m=completeEventMatch(m,'bronze','A');m=completeEventMatch(m,'r1-m0','B');
 const p=eventPlacements(m,entrants);
 assert.equal(p.participants.d.coins,400);
 assert.equal(p.participants.a.coins,200);
 assert.equal(p.participants.b.coins,140);
 assert.equal(p.participants.c.coins,50);
});
test('Simulazione battaglie CPU e calcolo del turno',()=>{
 const bots=Array.from({length:4},(_,i)=>({...member('bot-'+i),bot:true}));
 const entrants=makeEventEntrants([],bots,s),match=nextEventMatch(makeEventBracket(entrants));
 const battle=buildEventBattle(match,Object.fromEntries(bots.map(b=>[b.id,b])),s);
 assert.equal(activeEventFighters(battle,'A',s).length,1);
 assert.equal(eventTurn(battle,{'bot-0':botActions(battle,'bot-0',s)},s,()=>0.3).turn,2);
 assert.equal(simulateBots(battle,s,bots).finished,true);
});
test('Mahito nello shop, primo premio doppio del torneo standard',()=>{
 assert.equal(CHAR_PRICES.mahito,250);assert.equal(EVENT_PRIZES[1],400);
});