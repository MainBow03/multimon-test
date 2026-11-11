import test from 'node:test';
import assert from 'node:assert/strict';
import {
 triggerEchoSoulRecall,shouldTriggerEchoRaidPulse,echoRaidPulseDamage
} from '../src/systems/echoRaidTactics.js';

const guardian=id=>({
 id,name:'Anima di '+id,isEchoSoulGuardian:true,echoSoulPermanentDefeat:true,
 hp:100,maxHp:100,atk:110,baseAtk:110,def:85,baseDef:85,spd:95,baseSpd:95,
 echoFaintProcessed:false,types:['Lotta'],statuses:[],
 moves:[{name:'Mossa',power:50}]
});
const boss=hp=>({id:'echomax',isEchoRaidBoss:true,hp,maxHp:1000});
const setup=({hp=350,fallen=['naruto'],field=[0,1,3]}={})=>{
 const enemies=[boss(hp),guardian('goku'),guardian('naruto'),guardian('luffy')];
 for(const member of enemies)if(fallen.includes(member.id)){
  member.hp=0;member.echoFaintProcessed=true;
 }
 return {teams:{p2:enemies,p1:[]},field:{p2:field.slice(),p1:[]},events:[]};
};
const recall=(state,extra={})=>triggerEchoSoulRecall({
 isEchoFinalBattle:true,stage:'raid',...state,fieldSize:6,random:()=>0,...extra
});

test('Al 35% rianima un anima KO una sola volta, restituendole il campo',()=>{
 const state=setup();
 const result=recall(state);
 assert.equal(result.id,'naruto');
 assert.equal(state.teams.p2[2].hp,100);
 assert.equal(state.teams.p2[2].echoFaintProcessed,false);
 assert.equal(state.teams.p2[2].echoSoulPermanentDefeat,true);
 assert.deepEqual(state.field.p2,[0,1,3,2]);
 assert(state.events.some(e=>e.type==='revive_to_field'&&e.targetIdx===2));
 assert.equal(recall(state),null);
});

test('Al 35% possono essere scelte tutte e tre le anime KO con probabilità uguali',()=>{
 const expected=['goku','naruto','luffy'];
 for(let i=0;i<3;i++){
  const state=setup({fallen:expected,field:[0]});
  const result=recall(state,{random:()=>i/3+.01});
  assert.equal(result.id,expected[i]);
 }
});

test('Non si richiama prima del 35%, a zero PS o fuori dal raid finale',()=>{
 for(const state of [setup({hp:351}),setup({hp:0})]){
  assert.equal(recall(state),null);
  assert.equal(state.events.length,0);
 }
 const state=setup();
 assert.equal(recall(state,{isEchoFinalBattle:false}),null);
 assert.equal(recall(state,{stage:'normal'}),null);
});

test('Se sono già tutti attivi viene creata una singola proiezione',()=>{
 const state=setup({fallen:[],field:[0,1,2,3]});
 const result=recall(state);
 assert.equal(result.projected,true);
 assert.equal(state.teams.p2.length,5);
 assert.equal(state.field.p2.length,5);
 assert(state.events.some(e=>e.type==='summon'));
 assert.equal(recall(state),null);
});

test('Se gli slot sono pieni, il ritorno rispetta la capienza del campo',()=>{
 const state=setup({fallen:['naruto'],field:[0,1,3,4,5,6]});
 for(let i=4;i<7;i++)state.teams.p2[i]={
  id:'copy'+i,name:'Copia '+i,isEchoCopy:true,hp:10,maxHp:10
 };
 const result=recall(state);
 assert.equal(result.id,'naruto');
 assert.equal(state.field.p2.length,6);
 assert(state.field.p2.includes(2));
 assert(state.events.some(e=>e.type==='remove'));
});

test('Cataclisma attivo soltanto ogni cinque turni con Echomax vivo',()=>{
 const active={isEchoFinalBattle:true,stage:'raid',boss:boss(800)};
 for(let t=1;t<=20;t++)assert.equal(
  shouldTriggerEchoRaidPulse({...active,turnNumber:t}),t%5===0
 );
 active.boss.echoRaidLastPulseTurn=5;
 assert.equal(shouldTriggerEchoRaidPulse({...active,turnNumber:5}),false);
 assert.equal(shouldTriggerEchoRaidPulse({...active,turnNumber:10}),true);
 assert.equal(shouldTriggerEchoRaidPulse({...active,boss:{...boss(0)},turnNumber:10}),false);
 assert.equal(shouldTriggerEchoRaidPulse({...active,stage:'normal',turnNumber:10}),false);
 assert.equal(shouldTriggerEchoRaidPulse({...active,isEchoFinalBattle:false,turnNumber:10}),false);
});

test('Cataclisma: 40% dei PS massimi anche con PS attuali bassi',()=>{
 assert.equal(echoRaidPulseDamage(100),40);
 assert.equal(echoRaidPulseDamage(250),100);
 assert.equal(echoRaidPulseDamage(105),42);
 assert.equal(echoRaidPulseDamage(1),1);
 assert.equal(echoRaidPulseDamage(0),0);
});
