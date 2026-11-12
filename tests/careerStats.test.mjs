import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeCareerProfile,applyBattleUsageSnapshot,battleUsageSnapshot,careerTopThree} from '../src/systems/careerStats.js';
import {createBattleReport,accumulateBattleReport} from '../src/systems/battleReport.js';

const fighter=(id,name,revealed=false,other={})=>({id,name,revealed,hp:100,maxHp:100,...other});
const old={matches:27,wins:14,chars:{'Sonic':8,'sonic':2,'Garnet':3},moves:{'Pugno':20}};
const roster=[{id:'sonic',name:'Sonic'},{id:'garnet',name:'Garnet'}];

test('Vecchi contatori per nome vengono uniti agli ID senza azzerare i numeri',()=>{
 const first=normalizeCareerProfile(old,roster);
 assert.equal(first.profile.chars.sonic,10);
 assert.equal(first.profile.chars.garnet,3);
 assert.equal(first.profile.matches,27);
 assert.equal(first.profile.moves.Pugno,20);
 const again=normalizeCareerProfile(first.profile,roster);
 assert.deepEqual(again.profile.chars,first.profile.chars);
 assert.equal(again.changed,false);
});

test('Una battaglia conta solo schierati e mosse realmente eseguite',()=>{
 const teams={p1:[fighter('sonic','Sonic',true),fighter('garnet','Garnet',false)],
  p2:[fighter('cpu','CPU',true)]};
 const events=[{type:'battle_actor',player:'p1',charTeamIdx:0,kind:'attack'},
  {type:'battle_move_used',player:'p1',charTeamIdx:0,moveName:'Giro della morte'},
  {type:'battle_actor_end'}];
 const report=accumulateBattleReport(createBattleReport(),teams,events,
  {fieldAtTurnStart:{p1:[0],p2:[0]}});
 const snap=battleUsageSnapshot({report,teams,player:'p1',mode:'classica'});
 assert.deepEqual(snap.chars,['sonic']);
 assert.equal(snap.moves['Giro della morte'],1);
 let profile=old;
 const first=applyBattleUsageSnapshot(profile,snap);
 assert.equal(first.changed,true);
 profile=first.profile;
 assert.equal(profile.matches,28);
 assert.equal(profile.modeMatches.classica,1);
 assert.equal(profile.chars.sonic,3);
 assert.equal(profile.moves['Giro della morte'],1);
 assert.equal(applyBattleUsageSnapshot(profile,snap).changed,false);
 assert.equal(applyBattleUsageSnapshot(profile,snap).profile,profile);
});

test('Due turni e cambio in campo contano 2 mosse ma solo 1 partita per Multimon',()=>{
 const teams={p1:[fighter('sonic','Sonic',true),fighter('garnet','Garnet',false)],p2:[fighter('boss','Boss',true)]};
 let report=accumulateBattleReport(createBattleReport(),teams,
  [{type:'battle_actor',player:'p1',charTeamIdx:0,kind:'attack'},
   {type:'battle_move_used',player:'p1',charTeamIdx:0,moveName:'Bomba'},
   {type:'battle_actor_end'}],{fieldAtTurnStart:{p1:[0]}});
 let profile=applyBattleUsageSnapshot({matches:0,chars:{},moves:{}},
  battleUsageSnapshot({report,teams,player:'p1',mode:'campagna'})).profile;
 const previousReport=report;
 teams.p1[1].revealed=true;
 report=accumulateBattleReport(report,teams,
  [{type:'battle_actor',player:'p1',charTeamIdx:0,kind:'attack'},
   {type:'battle_move_used',player:'p1',charTeamIdx:0,moveName:'Bomba'},
   {type:'battle_actor_end'},
   {type:'battle_actor',player:'p1',charTeamIdx:1,kind:'attack'},
   {type:'battle_move_used',player:'p1',charTeamIdx:1,moveName:'Bomba'},
   {type:'battle_actor_end'}],{fieldAtTurnStart:{p1:[0,1]}});
 assert.equal(previousReport.entries['p1:0'].moveUses.Bomba,1);
 assert.equal(report.entries['p1:0'].moveUses.Bomba,2);
 assert.equal(report.entries['p1:1'].moveUses.Bomba,1);
 profile=applyBattleUsageSnapshot(profile,battleUsageSnapshot({report,teams,player:'p1',mode:'campagna'})).profile;
 assert.equal(profile.matches,1);
 assert.equal(profile.chars.sonic,1);
 assert.equal(profile.chars.garnet,1);
 assert.equal(profile.moves.Bomba,3);
 assert.equal(applyBattleUsageSnapshot(profile,battleUsageSnapshot({report,teams,player:'p1',mode:'campagna'})).changed,false);
});

test('Statistiche ospite online conteggiate dal suo lato, senza CPU né evocazioni',()=>{
 const teams={p1:[fighter('sonic','Sonic',true)],p2:[fighter('garnet','Garnet',true),
  fighter('summon','Evocazione',true,{isSummonOnly:true})]};
 const report=accumulateBattleReport(createBattleReport(),teams,
   [{type:'battle_actor',player:'p1',charTeamIdx:0,kind:'attack'},
    {type:'battle_move_used',player:'p1',charTeamIdx:0,moveName:'Fulmine'},
    {type:'battle_actor_end'},
    {type:'battle_actor',player:'p2',charTeamIdx:0,kind:'attack'},
    {type:'battle_move_used',player:'p2',charTeamIdx:0,moveName:'Schianto'},
    {type:'battle_actor_end'}],
   {fieldAtTurnStart:{p1:[0],p2:[0,1]}});
 const snap=battleUsageSnapshot({report,teams,player:'p2'});
 assert.deepEqual(snap.chars,['garnet']);
 assert.deepEqual(snap.moves,{Schianto:1});
});

test('Podio discendente e pareggi stabili per nome',()=>{
 const top=careerTopThree({finn:9,sonic:27,robin:14,garnet:14},{robin:'Robin',garnet:'Garnet'});
 assert.deepEqual(top.map(c=>c.id),['sonic','garnet','robin']);
});

test('Report precedenti senza ID non creano nuovi conteggi incerti',()=>{
 const oldReport={version:1,turns:2,entries:{'p1:0':{player:'p1',idx:0,id:'sonic',moveUses:{Bomba:3}}}};
 assert.equal(battleUsageSnapshot({report:oldReport,teams:{p1:[fighter('sonic','Sonic',true)]},player:'p1'}),null);
});
