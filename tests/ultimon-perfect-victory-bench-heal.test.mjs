import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {finishUltimonDuel} from '../src/systems/ultimonSystem.js';
import {initializeUltimonFighterStats} from '../src/systems/ultimonMvp.js';
import {createBattleReport} from '../src/systems/battleReport.js';

const fighter=(id,hp,maxHp=100)=>({id,name:id,hp,maxHp,img:'/img/'+id+'.png',types:['Insetto']});
const baseRoom=()=>{
 const rosters={
  p1:[fighter('bench-wounded',79),fighter('deployed',100),
      fighter('bench-near-full',98),fighter('bench-ko',0)],
  p2:[fighter('enemy',100),fighter('enemy-bench',60)],
  p3:[fighter('observer',100)],p4:[fighter('observer2',100)]
 };
 return {
  gameMode:'ultimon',status:'ultimon_result',settings:{maxPlayers:4},
  players:{p1:'Winner',p2:'Loser',p3:'Other',p4:'Other 2'},
  ultimon:{rosters,identities:{},fighterStats:initializeUltimonFighterStats(rosters),
    pair:['p1','p2'],selected:{p1:[1],p2:[0]},round:1,format:1,
    stats:Object.fromEntries(['p1','p2','p3','p4'].map(p=>
      [p,{matches:0,wins:0,losses:0,knockouts:0,lost:0}])),
    eliminated:[],history:[]},
  teams:{p1:[fighter('deployed',50)],p2:[fighter('enemy',0)]},
  battleReport:createBattleReport()
 };
};

const apply=(room,patch)=>{
 const out=structuredClone(room);
 for(const [name,value] of Object.entries(patch)){
  const keys=name.split('.'),key=keys.pop();
  let obj=out;
  for(const k of keys)obj=obj[k];
  obj[key]=value;
 }
 return out;
};

test('Vittoria perfetta: tutti i vivi in panchina recuperano 10% senza oltrepassare i PS massimi',()=>{
 const room=baseRoom();
 const result=finishUltimonDuel(room);
 const team=result['ultimon.rosters'].p1;
 assert.equal(team[0].hp,89,'79 PS + 10% dei 100 PS massimi');
 assert.equal(team[1].hp,90,'50 PS + 30% dopo il duello + 10% bonus individuale');
 assert.equal(team[2].hp,100,'La cura si ferma esattamente al massimo');
 assert.equal(team[3].hp,0,'KO in panchina NON viene rianimato');
 assert.equal(result['ultimon.rosters'].p2[1].hp,60,'La panchina avversaria non riceve cure');
 const record=result['ultimon.history'].at(-1);
 assert.equal(record.cleanVictory,true);
 assert.equal(record.benchHealed,2);
 assert.equal(record.bonusTarget?.id,'deployed','Resta il bonus di 10% sullo schierato');
 assert.equal(room.ultimon.rosters.p1[0].hp,79,'Nessuna mutazione dello stato originale Firestore');
 assert.throws(()=>finishUltimonDuel(apply(room,result)),/Lo scontro non è terminato/,
   'Il risultato non può essere applicato due volte');
});

test('Vittoria NON perfetta: nessuna cura alla panchina se uno schierato è KO',()=>{
 const room=baseRoom();
 room.ultimon.selected.p1=[1,2];
 room.ultimon.rosters.p1[2].hp=95;
 room.teams.p1=[fighter('deployed',45),fighter('bench-near-full',0)];
 const result=finishUltimonDuel(room);
 const team=result['ultimon.rosters'].p1;
 assert.equal(result['ultimon.history'].at(-1).cleanVictory,false);
 assert.equal(result['ultimon.history'].at(-1).benchHealed,0);
 assert.equal(result['ultimon.history'].at(-1).bonusTarget,null);
 assert.equal(team[0].hp,79,'Panchina viva senza cura in assenza di vittoria perfetta');
 assert.equal(team[1].hp,75,'Il superstite schierato mantiene la cura normale del 30%');
 assert.equal(team[2].hp,0,'Chi è andato KO rimane KO');
 assert.equal(team[3].hp,0);
});

test('La cura della panchina si arrotonda per eccesso anche con PS massimi non multipli di 10',()=>{
 const room=baseRoom();
 room.ultimon.rosters.p1[0].maxHp=89;
 room.ultimon.rosters.p1[0].hp=20;
 const result=finishUltimonDuel(room);
 assert.equal(result['ultimon.rosters'].p1[0].hp,29,
  '10% di 89 PS è 8.9, arrotondato a 9');
});

test('Il risultato di Ultimon spiega il bonus del 10% per tutti i compagni in panchina',()=>{
 const view=readFileSync(new URL('../src/screens/battle/UltimonView.jsx',import.meta.url),'utf8');
 assert.match(view,/last\.cleanVictory\?' Vittoria perfetta! Tutti i Multimon ancora vivi in panchina recuperano il 10%/);
 assert.match(view,/tutti i Multimon ancora vivi in panchina recuperano automaticamente il 10%/);
});
