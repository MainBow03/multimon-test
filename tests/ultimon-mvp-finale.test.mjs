import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createBattleReport,accumulateBattleReport} from '../src/systems/battleReport.js';
import {initializeUltimonFighterStats,mergeUltimonDuelFighterStats,ultimonTeamMvp,
 scoreUltimonFighter} from '../src/systems/ultimonMvp.js';
import {finishUltimonDuel} from '../src/systems/ultimonSystem.js';

const file=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const fighter=(id,hp=100)=>({id,name:id.toUpperCase(),img:'/img/'+id+'.png',hp,maxHp:100});
const roster={p1:[fighter('tanker'),fighter('attacker')],p2:[fighter('enemy')],p3:[fighter('other')],p4:[fighter('reserve')]};
const apply=(data,patch)=>{
 const next=structuredClone(data);
 for(const [key,value] of Object.entries(patch)){
  const parts=key.split('.');
  const leaf=parts.pop();
  let current=next;
  for(const part of parts)current=current[part];
  current[leaf]=value;
 }
 return next;
};

test('Il report conta solo turni realmente in campo, escludendo panchina, KO e pre-battaglia',()=>{
 const teams={p1:[fighter('bench'),fighter('attacker')],p2:[fighter('enemy')],p3:[fighter('fallen',0)]};
 let report=accumulateBattleReport(createBattleReport(),teams,[],{
   fieldAtTurnStart:{p1:[1],p2:[0],p3:[0]},gameMode:'ultimon'
 });
 assert.equal(report.turns,1);
 assert.equal(report.entries['p1:0'].turnsOnField,0);
 assert.equal(report.entries['p1:1'].turnsOnField,1);
 assert.equal(report.entries['p2:0'].turnsOnField,1);
 assert.equal(report.entries['p3:0'].turnsOnField,0);
 report=accumulateBattleReport(report,teams,[],{
   fieldAtTurnStart:{p1:[0,1,1],p2:[0]},gameMode:'ultimon'
 });
 assert.equal(report.entries['p1:0'].turnsOnField,1);
 assert.equal(report.entries['p1:1'].turnsOnField,2,'Nessun doppio conteggio se il campo contiene duplicati');
 const previous=report;
 report=accumulateBattleReport(report,teams,[],{
   countTurn:false,fieldAtTurnStart:{p1:[0,1]},gameMode:'ultimon'
 });
 assert.equal(report.turns,2);
 assert.equal(report.entries['p1:1'].turnsOnField,2);
 assert.equal(previous.entries['p1:1'].turnsOnField,2,'Il report precedente resta immutato');
});

test('Gli indici locali del duello sono rimappati ai posti permanenti del roster',()=>{
 const report={version:1,turns:4,entries:{
  'p1:0':{id:'attacker',damageDealt:217,damageTaken:50,kos:2,healing:10,turnsOnField:4,passiveActivations:2},
  'p1:1':{id:'tanker',damageDealt:20,damageTaken:180,kos:0,healing:95,turnsOnField:3,passiveActivations:1},
  'p2:0':{id:'enemy',damageDealt:45,damageTaken:100,kos:0,healing:0,turnsOnField:2}
 }};
 const before=initializeUltimonFighterStats(roster);
 const after=mergeUltimonDuelFighterStats(before,roster,{p1:[1,0],p2:[0]},report);
 assert.equal(after.p1[0].damageDealt,20,'Lo slot 0 è il TANKER, non il primo schierato');
 assert.equal(after.p1[1].damageDealt,217,'Lo slot 1 è l’ATTACKER, primo schierato');
 assert.equal(after.p1[0].healing,95);
 assert.equal(after.p1[1].kos,2);
 assert.equal(after.p1[1].turnsOnField,4);
 assert.equal(after.p1[1].battles,1);
 assert.equal(before.p1[1].damageDealt,0,'Nessuna mutazione del precedente stato Firestore');
 assert.equal(after.p3[0].battles,0,'Le squadre non impegnate non ricevono statistiche');
 const next=mergeUltimonDuelFighterStats(after,roster,{p1:[0],p3:[0]},{
  version:1,entries:{'p1:0':{id:'tanker',damageDealt:78,kos:1,healing:11,turnsOnField:2},
   'p3:0':{id:'other',damageDealt:50,turnsOnField:2}}
 });
 assert.equal(next.p1[0].damageDealt,98);
 assert.equal(next.p1[0].healing,106);
 assert.equal(next.p1[0].battles,2);
 assert.equal(next.p1[1].damageDealt,217);
 assert.equal(next.p1[1].battles,1);
 assert.equal(next.p3[0].battles,1);
 assert.equal(ultimonTeamMvp({ultimon:{rosters:roster,fighterStats:next}},'p1').id,'attacker');
});

test('La scelta MVP premia prestazioni reali e garantisce un vincitore per ogni team che ha giocato',()=>{
 const zero=initializeUltimonFighterStats(roster);
 assert.equal(ultimonTeamMvp({ultimon:{rosters:roster,fighterStats:zero}},'p1'),null);
 zero.p1[0].battles=1;
 zero.p1[1].battles=1;
 zero.p1[0].healing=200;
 zero.p1[1].damageDealt=100;zero.p1[1].kos=1;
 const winner=ultimonTeamMvp({ultimon:{rosters:roster,fighterStats:zero}},'p1');
 assert.equal(winner.id,'attacker');
 assert.equal(winner.healing,0);
 assert.ok(winner.score>scoreUltimonFighter(zero.p1[0]));
 zero.p1[1].kos=0;zero.p1[1].damageDealt=0;
 assert.equal(ultimonTeamMvp({ultimon:{rosters:roster,fighterStats:zero}},'p1').id,'tanker',
  'Un curatore può essere MVP anche senza KO');
});

test('Ogni duello consolida il report una sola volta nel verdetto Ultimon',()=>{
 const initial=initializeUltimonFighterStats(roster);
 const room={
  status:'ultimon_result',gameMode:'ultimon',settings:{maxPlayers:4},
  players:{p1:'Uno',p2:'Due',p3:'Tre',p4:'Quattro'},
  ultimon:{rosters:structuredClone(roster),fighterStats:initial,
   identities:{},pair:['p1','p2'],selected:{p1:[1,0],p2:[0]},
   round:1,format:2,stats:Object.fromEntries(['p1','p2','p3','p4'].map(p=>[
    p,{matches:0,wins:0,losses:0,knockouts:0,lost:0}])),
   eliminated:[],history:[]},
  teams:{p1:[fighter('attacker',65),fighter('tanker',38)],p2:[fighter('enemy',0)]},
  battleReport:{version:1,turns:5,entries:{
   'p1:0':{id:'attacker',damageDealt:175,kos:1,turnsOnField:4},
   'p1:1':{id:'tanker',healing:90,damageTaken:130,turnsOnField:5},
   'p2:0':{id:'enemy',damageTaken:100,turnsOnField:5}
  }}
 };
 const patch=finishUltimonDuel(room);
 assert.equal(patch['ultimon.fighterStats'].p1[1].damageDealt,175);
 assert.equal(patch['ultimon.fighterStats'].p1[0].healing,90);
 assert.equal(patch['ultimon.fighterStats'].p1[1].battles,1);
 assert.equal(patch['ultimon.fighterStats'].p3[0].battles,0);
 assert.equal(patch['ultimon.history'].length,1);
 assert.equal(room.ultimon.fighterStats.p1[1].battles,0,'Nessun doppio conteggio pre-commit');
 const final=apply(room,patch);
 assert.equal(ultimonTeamMvp(final,'p1').id,'attacker');
});

test('Gran finale: colori dinamici delle due squadre, scena VS e MVP per ogni posizione',()=>{
 const js=file('../src/screens/battle/UltimonView.jsx');
 const css=file('../src/screens/battle/UltimonView.css');
 const system=file('../src/systems/ultimonSystem.js');
 const engine=file('../src/systems/battleSystem.js');
 assert.match(js,/ultimonIsFinalShowdown\(room\)/);
 assert.match(js,/ultimonActive\(room\)/);
 assert.match(js,/'--final-left'/);
 assert.match(js,/'--final-right'/);
 assert.match(js,/ultimon-grand-final-versus/);
 assert.match(js,/ultimon-showdown-scenery/);
 assert.match(js,/ultimonTeamMvp\(room,p\.role\)/);
 for(const key of ['damageDealt','damageTaken','healing','kos','turnsOnField','battles','passiveActivations']){
  assert.match(js,new RegExp('mvp\\.'+key));
 }
 assert.match(css,/\.ultimon-screen--showdown\{/);
 assert.match(css,/color-mix\(in srgb,var\(--final-left\)/);
 assert.match(css,/ultimon-grand-final-vs/);
 assert.match(css,/ultimon-mvp-card/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/@media\(max-width:650px\)/);
 assert.match(system,/mergeUltimonDuelFighterStats/);
 assert.match(engine,/fieldAtTurnStart:startOfTurnField/);
});
