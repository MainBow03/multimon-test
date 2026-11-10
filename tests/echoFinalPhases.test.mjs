import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceEchoFinalPhase} from '../src/systems/echoFinalPhases.js';
import {echoFinalVictory} from '../src/systems/echoFinalSouls.js';
import {legalSupportTargets} from '../src/systems/supportTargeting.js';

const echomaxPlayable={
  id:'echomax',name:'Echomax',hp:190,maxHp:190,atk:155,def:115,spd:105,
  passive:{name:'Legione dei Caduti',type:'soul_legion'},
  moves:[{name:'Eco Oscura',power:70,maxUses:4}]
};
const hero=(id,hp,maxHp=100)=>({
  id,name:id,hp,maxHp,atk:90,baseAtk:90,def:80,baseDef:80,spd:70,baseSpd:70,
  statuses:[],moves:[{name:'Lampo',power:90,maxUses:5}],isSummonOnly:false
});
const room=(p1=[hero('finn',100)],p2=[{
  ...echomaxPlayable,hp:0,maxHp:4000,isEchoRaidBoss:true,isJuggernaut:true
},hero('goku',340,340)])=>({
  teams:{p1,p2},field:{p1:p1.map((_,i)=>i).filter(i=>p1[i].hp>0),
    p2:p2.map((_,i)=>i).filter(i=>p2[i].hp>0)}
});

test('il raid KO genera Echomax giocabile senza modificare il boss base',()=>{
  const game=room();
  const events=[];
  const stage=advanceEchoFinalPhase({isEchoFinalBattle:true,stage:'raid',
    teams:game.teams,field:game.field,characters:[echomaxPlayable],events});
  assert.equal(stage,'normal');
  const normal=game.teams.p2.at(-1);
  assert.equal(normal.id,'echomax');
  assert.equal(normal.hp,190);
  assert.equal(normal.maxHp,190);
  assert.equal(normal.atk,155);
  assert.equal(normal.def,115);
  assert.equal(normal.spd,105);
  assert.equal(normal.isJuggernaut,false);
  assert.equal(normal.isEchoRaidBoss,false);
  assert.equal(normal.moves[0].remainingUses,4);
  assert.ok(game.field.p2.includes(game.teams.p2.length-1));
  assert.ok(events.some(e=>e.type==='summon'));
  assert.equal(echomaxPlayable.hp,190);
  assert.equal(echoFinalVictory({isEchoFinalBattle:true,stage,heroes:game.teams.p1,
    enemies:game.teams.p2}),null);
});

test('alla sconfitta della forma normale ruba solo due eroi esausti e li porta al 100%',()=>{
  const dead=[hero('finn',0),hero('marceline',0,150),hero('sage',0,120)];
  const alive=hero('neon',100);
  const p2=[{...echomaxPlayable,hp:0,echoFinalForm:'normal'},hero('goku',340,340)];
  const game=room([...dead,alive],p2);
  const events=[];
  const stage=advanceEchoFinalPhase({isEchoFinalBattle:true,stage:'normal',
    teams:game.teams,field:game.field,characters:[echomaxPlayable],events});
  assert.equal(stage,'souls');
  const souls=game.teams.p2.filter(c=>c.isEchoCorruptedSoul);
  assert.equal(souls.length,2);
  assert.equal(new Set(souls.map(c=>c.id)).size,2);
  assert.ok(souls.every(c=>c.hp===c.maxHp && c.hp>0));
  assert.ok(souls.every(c=>['finn','marceline','sage'].includes(c.id)));
  assert.equal(alive.echoCorruptedLocked,undefined);
  assert.equal(game.teams.p1.filter(c=>c.echoCorruptedLocked).length,2);
  assert.ok(game.teams.p1.filter(c=>c.echoCorruptedLocked).every(c=>c.hp===0));
  assert.ok(events.filter(e=>e.type==='summon').length===2);
  assert.equal(echoFinalVictory({isEchoFinalBattle:true,stage,heroes:game.teams.p1,
    enemies:game.teams.p2}),null);
  const targets=legalSupportTargets({teams:game.teams,field:game.field,gameMode:'classica'},
    'p1','revive');
  assert.ok(targets.every(t=>!t.char.echoCorruptedLocked));
  souls.forEach(s=>{s.hp=0;});
  // Gli aiutanti originali non prolungano il terzo atto.
  assert.equal(echoFinalVictory({isEchoFinalBattle:true,stage,heroes:game.teams.p1,
    enemies:game.teams.p2}),'heroes');
});

test('se non ci sono esausti Echomax non evoca anime',()=>{
  const game=room([hero('finn',100),hero('sage',80)],
    [{...echomaxPlayable,hp:0,echoFinalForm:'normal'},hero('goku',340,340)]);
  const events=[];
  const stage=advanceEchoFinalPhase({isEchoFinalBattle:true,stage:'normal',
    teams:game.teams,field:game.field,characters:[echomaxPlayable],events});
  assert.equal(stage,'souls');
  assert.equal(game.teams.p2.filter(c=>c.isEchoCorruptedSoul).length,0);
  assert.equal(echoFinalVictory({isEchoFinalBattle:true,stage,heroes:game.teams.p1,
    enemies:game.teams.p2}),'heroes');
});

test('con un solo esausto viene richiamata una sola anima',()=>{
  const game=room([hero('finn',0),hero('sage',100)],
    [{...echomaxPlayable,hp:0,echoFinalForm:'normal'}]);
  const stage=advanceEchoFinalPhase({isEchoFinalBattle:true,stage:'normal',
    teams:game.teams,field:game.field,characters:[echomaxPlayable],events:[]});
  assert.equal(stage,'souls');
  assert.equal(game.teams.p2.filter(c=>c.isEchoCorruptedSoul).length,1);
});

test('no-raid non innesca transizioni, squadra priva di eroi vivi perde',()=>{
  const game=room([hero('finn',0)]);
  const before=game.teams.p2.length;
  assert.equal(advanceEchoFinalPhase({isEchoFinalBattle:false,stage:'raid',
    teams:game.teams,field:game.field,characters:[echomaxPlayable]}),'raid');
  assert.equal(game.teams.p2.length,before);
  assert.equal(echoFinalVictory({isEchoFinalBattle:true,stage:'raid',
    heroes:game.teams.p1,enemies:[{...echomaxPlayable,hp:200}]}),'boss');
});
