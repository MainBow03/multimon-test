import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {prepareSurvivalEnemy,survivalWaveKind,survivalWaveWeather,recoverSurvivalTeam,claimSurvivalReward} from '../src/systems/survivalWaves.js';
import {needsSoloPathChoice,chooseSoloPath,soloPathEnemyCount,assignSoloTacticalRole,
 mitigateRogueGuardian,rogueHexerTriggers,rogueTacticalDamageFactor,awardSoloPathVictory} from '../src/systems/soloRoguePaths.js';
import {balanceBattleSnapshot,recordBalanceSnapshot,balanceRanking} from '../src/systems/balanceRegistry.js';
import {ultimonRivalry,ultimonRecoveryChoicePatch,finishUltimonDuel} from '../src/systems/ultimonSystem.js';

const char=(id='hero')=>({id,name:id,maxHp:100,hp:100,atk:80,def:75,spAtk:60,spDef:50,
 spd:70,moves:[{name:'Attacco',power:50,maxUses:5}],statuses:[]});
test('Survival: nuove ondate élite, anomale e superboss con stats fisiche e speciali',()=>{
 assert.equal(survivalWaveKind(1),'normal');
 assert.equal(survivalWaveKind(3),'anomaly');
 assert.equal(survivalWaveKind(5),'elite');
 assert.equal(survivalWaveKind(10),'superboss');
 assert.equal(survivalWaveKind(15),'elite');
 assert.equal(survivalWaveWeather(3).turns,5);
 assert.equal(survivalWaveWeather(5),null);
 const normal=prepareSurvivalEnemy(char(),4),elite=prepareSurvivalEnemy(char(),5);
 const superboss=prepareSurvivalEnemy(char(),10);
 assert.ok(elite.maxHp>normal.maxHp);
 assert.ok(superboss.maxHp>elite.maxHp);
 assert.ok(superboss.spAtk>elite.spAtk&&superboss.spDef>elite.spDef);
 assert.equal(superboss.survivalWaveKind,'superboss');
 assert.equal(superboss.moves[0].remainingUses,5);
});
test('Survival: +10% cure ordinarie, +25% dopo boss e un revive ogni cinque round',()=>{
 const teams={p1:[char('vivo'),{...char('ko1'),hp:0},{...char('ko2'),hp:0}],p2:[]},field={p1:[0],p2:[]};
 teams.p1[0].hp=50;
 let reward=recoverSurvivalTeam(teams,field,['p1'],4);
 assert.equal(teams.p1[0].hp,60);assert.equal(reward.revived,null);
 reward=recoverSurvivalTeam(teams,field,['p1'],5);
 assert.equal(teams.p1[0].hp,70);
 assert.equal(teams.p1[1].hp,20);
 assert.equal(teams.p1[2].hp,0,'solo un revive per traguardo, non tre');
 assert.equal(reward.revived.name,'ko1');
 const current=teams.p1[0].hp;
 recoverSurvivalTeam(teams,field,['p1'],10);
 assert.equal(teams.p1[0].hp,current+25);
 assert.equal(teams.p1[2].hp,20);
});
test('Survival: premio una sola volta, cura o potenza o monete senza cambiare modalità',()=>{
 const base={gameMode:'survival',status:'survival_reward',settings:{juggernautPlayer:'p2'},
  players:{p1:'Eroe',p2:'Orda'},isBot:{p1:false,p2:true},
  teams:{p1:[{...char(),hp:50}],p2:[char('enemy')]},field:{p1:[0],p2:[0]},
  survivalRound:6,survivalDecision:{round:6},survivalTreasury:3};
 const a=claimSurvivalReward(base,'heal');
 assert.equal(a.teams.p1[0].hp,60);assert.equal(a.status,'battling');
 assert.equal(a.survivalBattleBonus,1);assert.equal(a.survivalTreasury,3);
 const b=claimSurvivalReward(base,'power');
 assert.equal(b.survivalBattleBonus,1.10);assert.equal(b.teams.p1[0].hp,50);
 const c=claimSurvivalReward(base,'coins');
 assert.equal(c.survivalTreasury,13);assert.equal(c.teams.p1[0].hp,50);
 assert.throws(()=>claimSurvivalReward({...base,status:'battling'},'coins'),/non è più disponibile/);
});
test('Roguelike Solo: bivio sicuro/pericoloso solo a inizio blocchi di cinque',()=>{
 const base={isStarted:true,floor:2,roster:['hero'],rosterStats:{hero:55},coins:0,
  relics:[],encounteredEnemies:[]};
 assert.equal(needsSoloPathChoice(base),true);
 const safe=chooseSoloPath(base,'safe',[char()]);
 assert.equal(safe.coins,15);assert.equal(safe.rosterStats.hero,65);
 assert.equal(soloPathEnemyCount(3,safe,false),1);
 assert.equal(needsSoloPathChoice(safe),false);
 const danger=chooseSoloPath(base,'dangerous',[char()]);
 assert.equal(soloPathEnemyCount(1,danger,false),2);
 assert.equal(soloPathEnemyCount(3,{...danger,floor:3},false),4);
 assert.equal(soloPathEnemyCount(3,{...danger,floor:5},false),3);
 assert.equal(soloPathEnemyCount(3,danger,true),3);
 assert.equal(needsSoloPathChoice({...danger,floor:7}),true);
});
test('Roguelike: guardiano, maledicente, berserker e premio percorso non duplicabile',()=>{
 const run=chooseSoloPath({isStarted:true,floor:2,coins:0,roster:[],rosterStats:{},relics:[]},'dangerous');
 const a=assignSoloTacticalRole(char('a'),0,2,run);
 const b=assignSoloTacticalRole(char('b'),1,2,run);
 const c=assignSoloTacticalRole(char('c'),2,2,run);
 assert.equal(a.rogueTacticalRole,'guardian');
 assert.equal(b.rogueTacticalRole,'hexer');
 assert.equal(c.rogueTacticalRole,'finisher');
 assert.deepEqual(mitigateRogueGuardian(a,100,true),{damage:80,activated:true});
 assert.deepEqual(mitigateRogueGuardian(a,100,true),{damage:100,activated:false});
 assert.equal(rogueHexerTriggers(b,char('target'),()=>.05),true);
 assert.equal(rogueHexerTriggers(b,char('target'),()=>.95),false);
 assert.equal(rogueTacticalDamageFactor(c,[c]),1.25);
 assert.equal(rogueTacticalDamageFactor(c,[a,c]),1);
 const victory=awardSoloPathVictory({...run,floor:3},2,()=>0);
 assert.equal(victory.soloPath.claimed,true);
 assert.equal(victory.relics.length,1);
 assert.deepEqual(awardSoloPathVictory(victory,2),victory);
});
test('Registro: ignora i doppi salvataggi, conserva solo scelte non forzate',()=>{
 const base={status:'gameover',gameMode:'classica',isTrainingBattle:false,
  players:{p1:'Uno',p2:'Due'},isBot:{p1:false,p2:true},winner:'Uno',
  battleStartedAt:1000,teams:{p1:[char()],p2:[char('cpu')]},
  battleReport:{id:'match-1',turns:4,entries:{'p1:0':{player:'p1',idx:0,id:'hero',name:'hero',
    revealed:true,turnsOnField:4,damageDealt:140,healing:20,moveUses:{Attacco:3},
    itemUses:{pozione:{uses:1,healed:20}}}}}};
 const snap=balanceBattleSnapshot(base,'p1',61000);
 assert.equal(snap.mode,'classica');assert.equal(snap.won,true);
 assert.equal(snap.duration,60);
 assert.equal(snap.characters.hero.picks,1);
 assert.equal(snap.items.pozione.healed,20);
 const saved=recordBalanceSnapshot({},snap);
 assert.equal(saved.changed,true);
 assert.equal(saved.profile.balanceRegistry.modes.classica.matches,1);
 assert.equal(saved.profile.balanceRegistry.modes.classica.totalSeconds,60);
 assert.equal(recordBalanceSnapshot(saved.profile,snap).changed,false);
 assert.equal(balanceRanking({hero:{picks:1}},'picks')[0].id,'hero');
 const campaign=balanceBattleSnapshot({...base,isCampaignBattle:true,battleReport:{...base.battleReport,id:'match-2'}},'p1',61000);
 assert.equal(campaign.mode,'campagna');
 assert.equal(Object.keys(campaign.characters).length,0,'campagna non altera la classifica dei preferiti');
});
test('Ultimon: rivincite reali e bonus al superstite con bersaglio opzionale',()=>{
 const room={gameMode:'ultimon',status:'ultimon_result',
  players:{p1:'A',p2:'B',p3:'C',p4:'D'},settings:{maxPlayers:4},
  ultimon:{round:2,pair:['p1','p2'],format:2,selected:{p1:[0,1],p2:[0,1]},
   rosters:{p1:[char('a'),char('b')],p2:[char('c'),char('d')],p3:[char('e')],p4:[char('f')]},
   stats:Object.fromEntries(['p1','p2','p3','p4'].map(p=>[p,{matches:0,wins:0,losses:0,lost:0,knockouts:0}])),
   history:[{round:1,pair:['p2','p1'],format:1,winner:'p1',ko:{p1:[],p2:['d']},eliminated:[]}],
   eliminated:[],fighterStats:{}},
  teams:{p1:[{...char('a'),hp:20},{...char('b'),hp:40}],
   p2:[{...char('c'),hp:0},{...char('d'),hp:0}]}};
 const rival=ultimonRivalry(room);
 assert.equal(rival.matches,1);assert.equal(rival.wins.p1,1);
 assert.equal(ultimonRecoveryChoicePatch(room,'p1',1)['ultimon.recoveryChoice'].index,1);
 assert.throws(()=>ultimonRecoveryChoicePatch(room,'p2',1),/Solo il vincitore/);
 room.ultimon.recoveryChoice={role:'p1',index:1};
 const patch=finishUltimonDuel(room);
 assert.equal(patch['ultimon.rosters'].p1[0].hp,50);
 assert.equal(patch['ultimon.rosters'].p1[1].hp,80,'30% +10% al prescelto');
 assert.equal(patch['ultimon.history'].at(-1).cleanVictory,true);
 assert.equal(patch['ultimon.history'].at(-1).bonusTarget.id,'b');
});
test('Wiring: rewards, safe screens, stats and no forced characters in registry',()=>{
 const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
 const b=read('../src/systems/battleSystem.js'),app=read('../src/App.jsx');
 const map=read('../src/screens/roguelike/RoguelikeMapView.jsx');
 const results=read('../src/screens/battle/GameoverView.jsx');
 const dashboard=read('../src/screens/hub/MenuDashboard.jsx');
 assert.match(b,/nextStatus='survival_reward'/);
 assert.match(b,/rogueHexerTriggers/);
 assert.match(map,/chooseSoloPath/);
 assert.match(results,/awardSoloPathVictory/);
 assert.match(app,/balanceBattleSnapshot/);
 assert.match(dashboard,/Registro di Bilanciamento/);
});
