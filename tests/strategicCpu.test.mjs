import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CPU_STYLES,cpuStyle,generateStrategicCpuActions,
  rememberPublicCpuMoves,observedMovePattern
} from '../src/systems/strategicCpu.js';

const move=(name,type,power,extra={})=>({
  name,type,power,accuracy:100,remainingUses:null,...extra
});
const fighter=(id,type,hp=100,moves=[])=>({
  id,name:id,hp,maxHp:100,atk:70,def:55,
  baseAtk:70,types:[type],statuses:[],moves
});
const typeMultiplier=(type,types)=>({
  Fuoco:{Acqua:.5,Erba:2},Elettro:{Acqua:2},
  Acqua:{Fuoco:2,Elettro:.5}
}[type]?.[types?.[0]]??1);
const game=(style,front,bench=null,enemy=fighter('enemy','Acqua',100,[
  move('Getto','Acqua',90)
]))=>({
  gameMode:'classica',players:{p1:'Persona',p2:'CPU'},
  cpuStyles:{p2:style},isBot:{p1:false,p2:true},
  teams:{p1:[enemy],p2:[front,...(bench?[bench]:[])]},
  field:{p1:[0],p2:[0]},inventory:{p2:{}},
  hyperUsed:{p2:true},settings:{fieldSize:1},
  aiMemory:{}
});
const plan=(room,other={})=>generateStrategicCpuActions({
  room,player:'p2',activePlayers:['p1','p2'],
  currentActions:{p2:{}},getMultiplier:typeMultiplier,
  appMode:'online_room',random:()=>.5,...other
});

test('I tre stili sono distinti e persistono per lo stesso avversario',()=>{
  assert.deepEqual(Object.keys(CPU_STYLES),['aggressive','defensive','tactical']);
  const room=game('tactical',fighter('f','Fuoco',100,[move('Flame','Fuoco',70)]));
  assert.equal(cpuStyle(room,'p2'),'tactical');
  delete room.cpuStyles;
  assert.equal(cpuStyle(room,'p2'),cpuStyle(room,'p2'));
});

test('La CPU aggressiva preferisce tentare il KO invece di cambiare',()=>{
  const room=game('aggressive',
    fighter('fire','Fuoco',100,[move('Flame','Fuoco',100)]),
    fighter('electric','Elettro',100,[move('Spark','Elettro',100)]));
  const action=plan(room)[0];
  assert.equal(action.type,'attack');
  assert.equal(action.targetPlayer,'p1');
});

test('La CPU strategica cambia se in svantaggio di tipi',()=>{
  const room=game('tactical',
    fighter('fire','Fuoco',100,[move('Flame','Fuoco',100)]),
    fighter('electric','Elettro',100,[move('Spark','Elettro',100)]));
  assert.deepEqual(plan(room)[0],{type:'switch',toIdx:1});
});

test('La CPU difensiva spende pozioni solo se sono utili e disponibili',()=>{
  const room=game('defensive',
    fighter('fire','Fuoco',38,[move('Flame','Fuoco',75)]));
  room.inventory.p2.pozione=1;
  assert.equal(plan(room)[0].type,'use_item');
  assert.equal(plan(room)[0].itemId,'pozione');
  room.healingItemsUsed={p2:3};
  assert.equal(plan(room)[0].type,'attack');
});

test('Le protezioni non vengono ripetute senza criterio',()=>{
  const room=game('defensive',
    fighter('fire','Fuoco',45,[
      move('Flame','Fuoco',75),
      move('Protect','Normale',0,{isProtect:true,target:'self'})
    ]));
  assert.equal(plan(room)[0].moveIdx,1);
  room.teams.p2[0].consecutiveProtect=1;
  assert.equal(plan(room)[0].moveIdx,0);
});

test('La memoria considera SOLO le mosse effettivamente mostrate',()=>{
  const visible={type:'ai_public_move',player:'p1',charId:'enemy',
    moveName:'Getto',moveType:'Acqua'};
  const memory=rememberPublicCpuMoves({},[
    {type:'battle_actor',player:'p1',charTeamIdx:0},
    {type:'ai_public_move',player:'p2',charId:'fire',moveName:'Fiammata',moveType:'Fuoco'},
    visible,visible,visible
  ]);
  assert.equal(memory.p1.enemy.total,3);
  assert.equal(memory.p1.enemy.moves.Getto,3);
  assert.equal(memory.p1.enemy.types.Acqua,3);
  assert.equal(memory.p1.fire,undefined);
  const room=game('tactical',fighter('fire','Fuoco',70,[move('Hit','Normale',60)]),
    fighter('electric','Elettro',100,[move('Hit','Normale',60)]));
  room.aiMemory=memory;
  assert.equal(observedMovePattern(room,{player:'p1',char:room.teams.p1[0]}).type,'Acqua');
  assert.deepEqual(plan(room)[0],{type:'switch',toIdx:1});
});

test('La CPU non legge né mosse avversarie nascoste né comandi avversari pendenti',()=>{
  const room=game('tactical',
    fighter('fire','Fuoco',100,[move('Flame','Fuoco',80)]));
  Object.defineProperty(room.teams.p1[0],'moves',{get(){
    throw new Error('La CPU non deve ispezionare le mosse del nemico');
  }});
  const actions={p1:new Proxy({},{
    get(){throw new Error('La CPU non deve leggere le azioni avversarie');}
  }),p2:{}};
  assert.equal(plan(room,{currentActions:actions})[0].type,'attack');
  assert.equal(room.aiMemory.p1,undefined);
});

test('Le azioni già scelte rimangono intatte durante lo skip forzato',()=>{
  const room=game('aggressive',
    fighter('fire','Fuoco',100,[move('Flame','Fuoco',80)]));
  const chosen={type:'attack',moveIdx:0,targetPlayer:'p1',targetIdx:0};
  assert.deepEqual(plan(room,{currentActions:{p2:{0:chosen}}})[0],chosen);
});

test('Mosse doppio bersaglio e mosse in ricarica sono rispettate',()=>{
  const room=game('aggressive',
    fighter('fire','Fuoco',100,[
      move('Cooldown','Fuoco',300,{currentCooldown:2}),
      move('Double','Fuoco',70,{targetCount:2})
    ]));
  room.field.p1=[0,1];
  room.teams.p1.push(fighter('enemy2','Erba',100,[move('Hit','Normale',30)]));
  const action=plan(room)[0];
  assert.equal(action.type,'attack');
  assert.equal(action.moveIdx,1);
  assert.equal(action.selectedTargets.length,2);
  assert.notEqual(action.selectedTargets[0].idx,action.selectedTargets[1].idx);
});


test('Una CPU non si blocca se tutte le mosse sono in ricarica',()=>{
  const room=game('tactical',
    fighter('fire','Fuoco',100,[move('Unica','Fuoco',60,{currentCooldown:2})]));
  delete room.inventory.p2;
  const action=plan(room)[0];
  assert.equal(action.type,'attack');
  assert.equal(action.moveIdx,0);
});

test('Lo skip forzato non altera la scelta umana né aggiunge Iper non richiesta',()=>{
  const room=game('aggressive',
    fighter('barry','Fuoco',100,[move('Hit','Fuoco',80)]));
  room.hyperUsed.p2=false;
  const choice=Object.freeze({type:'attack',moveIdx:0,targetPlayer:'p1',targetIdx:0});
  const planned=plan(room,{currentActions:{p2:{0:choice}}});
  assert.deepEqual(planned[0],choice);
  assert.equal(choice.hyperize,undefined);
});


test('Due Multimon CPU non prenotano la stessa unica pozione',()=>{
  const room=game('defensive',
    fighter('one','Fuoco',35,[move('Hit','Fuoco',65)]));
  room.teams.p2.push(fighter('two','Fuoco',33,[move('Hit','Fuoco',65)]));
  room.field.p2=[0,1];
  room.inventory.p2.pozione=1;
  const actions=plan(room);
  const items=Object.values(actions).filter(a=>a.type==='use_item'&&a.itemId==='pozione');
  assert.equal(items.length,1);
  assert.equal(Object.keys(actions).length,2);
});
