import test from 'node:test';
import assert from 'node:assert/strict';
import {triggerEchoRaidHalfReset,restoreEchoRaidAccuracy,echoRaidMovesAtFullAccuracy} from '../src/systems/echoRaidHalfReset.js';
import {shouldKeepSessionOnAuthRestore} from '../src/systems/sessionPersistence.js';
import {isEchoRaidAccuracyProtected} from '../src/systems/echoFinalSouls.js';

const actor=(id,hp,maxHp,opts={})=>({
  id,name:id,hp,maxHp,atk:100,baseAtk:100,def:80,baseDef:80,
  spd:70,baseSpd:70,acc:1,statuses:[],...opts
});
const boss=(hp,opts={})=>actor('echomax',hp,4000,{
 isEchoRaidBoss:true,atk:210,baseAtk:270,def:120,baseDef:190,
 spd:90,baseSpd:155,...opts
});

test('Echomax 50%: cancella i soli debuff del boss e tutti i buff della Resistenza',()=>{
 const enemy=boss(2000);
 const heroes=[
   actor('sage',80,120,{atk:120,def:120,spd:85,acc:1.2,evasionBonus:.2}),
   actor('marceline',0,130,{atk:130,def:65,spd:90}),
   actor('finn',100,120,{atk:70,def:65,spd:50})
 ];
 const events=[];
 assert.equal(triggerEchoRaidHalfReset({
   isEchoFinalBattle:true,boss:enemy,heroes,events,bossIndex:2
 }),true);
 assert.deepEqual([enemy.atk,enemy.def,enemy.spd],[270,190,155]);
 assert.deepEqual([heroes[0].atk,heroes[0].def,heroes[0].spd,heroes[0].acc,heroes[0].evasionBonus],[100,80,70,1,0]);
 assert.equal(heroes[1].atk,100);
 assert.equal(heroes[1].def,65);
 assert.deepEqual([heroes[2].atk,heroes[2].def,heroes[2].spd],[70,65,50]);
 assert.equal(enemy.hp,2000);
 assert.equal(enemy.echoHalfResetDone,true);
 assert.ok(events.some(e=>e.type==='echo_stat_reset'&&e.player==='p2'&&e.index===2));
 assert.ok(events.some(e=>e.type==='echo_stat_reset'&&e.player==='p1'&&e.index===0));
 const after=events.length;
 assert.equal(triggerEchoRaidHalfReset({isEchoFinalBattle:true,boss:enemy,heroes,events}),false);
 assert.equal(events.length,after,'La soglia non riapplica il reset più volte');
});

test('Non si attiva sopra il 50%, su boss KO o fuori dalla campagna',()=>{
 for(const e of [boss(2001),boss(0),actor('echomax',170,190),boss(2000,{isEchoRaidBoss:false})]){
   const heroes=[actor('finn',100,100,{atk:150})],events=[];
   assert.equal(triggerEchoRaidHalfReset({isEchoFinalBattle:true,boss:e,heroes,events}),false);
   assert.equal(heroes[0].atk,150);
 }
 assert.equal(triggerEchoRaidHalfReset({isEchoFinalBattle:false,boss:boss(1900),heroes:[]}),false);
});

test('Precisione: tutte le mosse del boss a 100%, la versione giocabile invariata',()=>{
 const moves=[{name:'Raggio dei Caduti',accuracy:.8,desc:'Precisione 80%.'},{name:'Dominatore del Multiverso',accuracy:.85}];
 const result=echoRaidMovesAtFullAccuracy(moves);
 assert.equal(result[0].accuracy,1);
 assert.equal(result[1].accuracy,1);
 assert.match(result[0].desc,/Precisione 100%/);
 assert.equal(moves[0].accuracy,.8,'L\'originale resta intatto');
 assert.equal(isEchoRaidAccuracyProtected(boss(1500)),true);
 assert.equal(isEchoRaidAccuracyProtected(actor('echomax',190,190)),false);
});

test('Purificazione precisione: solo Echomax boss sceso sotto 100%',()=>{
 const e=boss(1800,{acc:.55});
 assert.equal(restoreEchoRaidAccuracy(e),true);
 assert.equal(e.acc,1);
 assert.equal(restoreEchoRaidAccuracy(e),false);
 const playable=actor('echomax',190,190,{acc:.55});
 assert.equal(restoreEchoRaidAccuracy(playable),false);
 assert.equal(playable.acc,.55);
});

test('Refresh: sessione locale resta disponibile solo per lo stesso account',()=>{
 const local={appMode:'local_room',playerUid:'uid-1',
   gameState:{status:'executing',isCampaignBattle:true,
     teams:{p1:[actor('finn',25,100)],p2:[boss(1650)]},
     field:{p1:[0],p2:[0]},events:[{type:'damage'}]}
 };
 assert.equal(shouldKeepSessionOnAuthRestore(local,'uid-1','uid-1'),true);
 assert.equal(shouldKeepSessionOnAuthRestore(local,'uid-2','uid-1'),false);
 assert.equal(shouldKeepSessionOnAuthRestore({...local,playerUid:null},'uid-1','uid-1'),true);
 assert.equal(shouldKeepSessionOnAuthRestore({...local,gameState:null},'uid-1','uid-1'),false);
});

test('Refresh online: stanza e ruolo conservati, nessuna partita di altri account',()=>{
 const online={appMode:'online_room',playerUid:'uid-1',roomId:'ROOM',playerRole:'p1',gameState:null};
 assert.equal(shouldKeepSessionOnAuthRestore(online,'uid-1','uid-1'),true);
 assert.equal(shouldKeepSessionOnAuthRestore({...online,roomId:null},'uid-1','uid-1'),false);
 assert.equal(shouldKeepSessionOnAuthRestore(online,'uid-2','uid-1'),false);
 assert.equal(shouldKeepSessionOnAuthRestore({appMode:'menu'},'uid-1','uid-1'),false);
});
