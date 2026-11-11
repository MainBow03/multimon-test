import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceEchoFinalPhase} from '../src/systems/echoFinalPhases.js';
import {echoFinalVictory} from '../src/systems/echoFinalSouls.js';

const hero=(id,hp)=>({id,name:id,hp,maxHp:100,atk:90,baseAtk:90,
 def:80,baseDef:80,spd:70,baseSpd:70,types:['Normale'],
 statuses:[],moves:[{name:'Colpo',power:50}]});
const base={id:'echomax',name:'Echomax',hp:190,maxHp:190,atk:155,
 def:115,spd:105,types:['Spettro'],statuses:[],moves:[{name:'Dominatore del Multiverso',power:150}]};
function battle(){
 const teams={p1:[hero('finn',0),hero('sage',0),hero('jake',80)],
  p2:[{...base,hp:0,maxHp:4000,isEchoRaidBoss:true},
      {id:'goku',name:'Anima di Goku',hp:100,maxHp:100,isEchoSoulGuardian:true,statuses:[]}]};
 const field={p1:[2],p2:[1]};const events=[];
 return {teams,field,events,characters:[base],isEchoFinalBattle:true};
}
test('Due alleati esausti entrano ASSIEME alla forma giocabile, non dopo il secondo KO',()=>{
 const state=battle();
 const stage=advanceEchoFinalPhase({...state,stage:'raid'});
 assert.equal(stage,'normal');
 const normal=state.teams.p2.find(c=>c.echoFinalForm==='normal');
 const clones=state.teams.p2.filter(c=>c.isEchoCorruptedSoul);
 assert.equal(clones.length,2);
 assert.deepEqual(clones.map(c=>c.echoCorruptionSourceId).sort(),['finn','sage']);
 assert(clones.every(c=>c.hp===100 && c.statuses.some(s=>s.type==='Scudo Team')));
 assert(state.field.p2.length<=6);
 assert.equal(normal.echoNormalSoulsSummoned,true);
 assert(state.events.filter(e=>e.type==='summon').length===3);
 // La forma giocabile è ancora viva, ma i cloni sono già sul campo.
 assert(normal.hp>0);
 assert.equal(echoFinalVictory({isEchoFinalBattle:true,stage,heroes:state.teams.p1,enemies:state.teams.p2}),null);
 const count=state.teams.p2.length;
 assert.equal(advanceEchoFinalPhase({...state,stage:'normal'}),'normal');
 assert.equal(state.teams.p2.length,count);
});

test('Sconfiggere solo Echomax non termina il finale finché restano cloni corrotti',()=>{
 const state=battle();
 advanceEchoFinalPhase({...state,stage:'raid'});
 const normal=state.teams.p2.find(c=>c.echoFinalForm==='normal');
 normal.hp=0;
 assert.equal(echoFinalVictory({isEchoFinalBattle:true,stage:'normal',heroes:state.teams.p1,enemies:state.teams.p2}),null);
 const stage=advanceEchoFinalPhase({...state,stage:'normal'});
 assert.equal(stage,'souls');
 assert.equal(echoFinalVictory({isEchoFinalBattle:true,stage,heroes:state.teams.p1,enemies:state.teams.p2}),null);
 for(const clone of state.teams.p2.filter(c=>c.isEchoCorruptedSoul))clone.hp=0;
 assert.equal(echoFinalVictory({isEchoFinalBattle:true,stage,heroes:state.teams.p1,enemies:state.teams.p2}),'heroes');
});

test('Un salvataggio precedente in forma giocabile genera i due cloni al primo turno recuperato',()=>{
 const state=battle();
 state.teams.p2=[{...base,echoFinalForm:'normal',hp:190,maxHp:190,statuses:[],isEchoRaidBoss:false}];
 state.field.p2=[0];
 const stage=advanceEchoFinalPhase({...state,stage:'normal'});
 assert.equal(stage,'normal');
 assert.equal(state.teams.p2.filter(c=>c.isEchoCorruptedSoul).length,2);
 assert.equal(state.teams.p2[0].echoNormalSoulsSummoned,true);
});

test('Se nessun eroe è esausto la fase finale resta terminabile',()=>{
 const state=battle();
 state.teams.p1.forEach(c=>c.hp=100);
 advanceEchoFinalPhase({...state,stage:'raid'});
 assert.equal(state.teams.p2.filter(c=>c.isEchoCorruptedSoul).length,0);
 const normal=state.teams.p2.find(c=>c.echoFinalForm==='normal');
 normal.hp=0;
 const stage=advanceEchoFinalPhase({...state,stage:'normal'});
 assert.equal(stage,'souls');
 assert.equal(echoFinalVictory({isEchoFinalBattle:true,stage,heroes:state.teams.p1,enemies:state.teams.p2}),'heroes');
});
