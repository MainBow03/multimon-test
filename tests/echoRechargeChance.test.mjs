import test from 'node:test';
import assert from 'node:assert/strict';
import {shouldApplyEchoRecharge} from '../src/systems/echoFinalSouls.js';

const raid={id:'echomax',isEchoRaidBoss:true};
const attack={name:'Dominatore del Multiverso',recharge:true};
const roll=value=>()=>value;

test('Echomax boss finale: Ricarica soltanto quando il tiro è inferiore a 0,30',()=>{
 assert.equal(shouldApplyEchoRecharge(raid,attack,true,roll(0)),true);
 assert.equal(shouldApplyEchoRecharge(raid,attack,true,roll(.2999)),true);
 assert.equal(shouldApplyEchoRecharge(raid,attack,true,roll(.30)),false);
 assert.equal(shouldApplyEchoRecharge(raid,attack,true,roll(.9999)),false);
});

test('Echomax giocabile e seconda forma non cambiano',()=>{
 assert.equal(shouldApplyEchoRecharge({id:'echomax'},attack,false,roll(.99)),true);
 assert.equal(shouldApplyEchoRecharge({id:'echomax',echoFinalForm:'normal'},attack,true,roll(.99)),true);
});

test('Le mosse degli altri personaggi mantengono Ricarica garantita',()=>{
 assert.equal(shouldApplyEchoRecharge({id:'natsu'},{name:'Loto Cremisi',recharge:true},false,roll(.99)),true);
 assert.equal(shouldApplyEchoRecharge(raid,{name:'Altra mossa',recharge:true},true,roll(.99)),true);
});

test('Le mosse senza Ricarica non applicano mai lo status',()=>{
 assert.equal(shouldApplyEchoRecharge(raid,{name:'Raggio dei Caduti'},true,roll(.1)),false);
 assert.equal(shouldApplyEchoRecharge(raid,null,true,roll(.1)),false);
});
