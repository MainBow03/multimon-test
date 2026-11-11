import test from 'node:test';
import assert from 'node:assert/strict';
import {applyBattleStatModifier,MAX_BATTLE_STAT_MULTIPLIER} from '../src/systems/statBalance.js';

test('Echomax accumula incrementi del 5 percento della velocità base senza superare il limite',()=>{
 const boss={id:'echomax',isEchoRaidBoss:true,hp:2500,baseSpd:155,spd:155,statuses:[]};
 let count=0;
 for(let i=0;i<100;i++){
  if(applyBattleStatModifier(boss,'spd',1.05))count++;
  assert(boss.spd<=Math.round(155*MAX_BATTLE_STAT_MULTIPLIER));
 }
 assert(count>0);
 assert.equal(boss.spd,310);
 assert.equal(applyBattleStatModifier(boss,'spd',1.05),false);
});

test('I bonus speed funzionano anche quando il personaggio ha Ricarica o è stordito',()=>{
 const boss={id:'echomax',isEchoRaidBoss:true,baseSpd:155,spd:155,
  statuses:[{type:'Ricarica',turns:1},{type:'Stordito',turns:1}]};
 assert.equal(applyBattleStatModifier(boss,'spd',1.05),true);
 assert(boss.spd>155);
});
