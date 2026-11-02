import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  createBattleReport,accumulateBattleReport,battleReportLeaders,
  battleReportMvp,BATTLE_REPORT_METRICS
} from '../src/systems/battleReport.js';

const fighter=(id,name,hp,maxHp=hp,shield=0)=>({
  id,name,img:'/img/'+id+'.png',hp,maxHp,juggHitsRemaining:shield
});

test('I colpi, i danni reali, le cure e i KO sono assegnati ai Multimon giusti',()=>{
  const teams={
    p1:[fighter('cat','Chat Noir',100),fighter('finn','Finn',50,120)],
    p2:[fighter('gaster','Gaster',100,100,2)]
  };
  const events=[
    {type:'battle_actor',player:'p1',charTeamIdx:0,kind:'attack'},
    {type:'raid_shield_update',targetPlayer:'p2',targetIdx:0,remainingHits:1},
    {type:'raid_shield_update',targetPlayer:'p2',targetIdx:0,remainingHits:0},
    {type:'damage',targetPlayer:'p2',targetIdx:0,newHp:60},
    {type:'battle_actor',player:'p1',charTeamIdx:1,kind:'attack'},
    {type:'damage',targetPlayer:'p1',targetIdx:1,newHp:100},
    {type:'text',text:'Gaster attiva Sapienza',isPassive:true,passiveChar:'Gaster',passiveName:'Sapienza'},
    {type:'battle_actor',player:'p1',charTeamIdx:0,kind:'attack'},
    {type:'damage',targetPlayer:'p2',targetIdx:0,newHp:0},
    {type:'battle_actor_end'},
    {type:'damage',targetPlayer:'p1',targetIdx:0,newHp:70}
  ];
  const report=accumulateBattleReport(createBattleReport(),teams,events);
  const cat=report.entries['p1:0'],finn=report.entries['p1:1'],gaster=report.entries['p2:0'];
  assert.equal(cat.damageDealt,100,'40 + 60 HP effettivi, non danni teorici');
  assert.equal(cat.kos,1);
  assert.equal(cat.shieldsBroken,1,'Due cariche consumate, un solo scudo spezzato');
  assert.equal(cat.damageTaken,30,'Danni di fine turno non attribuiti all\'ultimo attaccante');
  assert.equal(finn.healing,50);
  assert.equal(finn.damageDealt,0);
  assert.equal(gaster.damageTaken,100);
  assert.equal(gaster.passiveActivations,1);
  assert.equal(report.turns,1);
  assert.equal(battleReportLeaders(report,'damageDealt')[0].name,'Chat Noir');
  assert.equal(battleReportMvp(report).name,'Chat Noir');
});

test('Turni successivi sommano le statistiche senza rielaborare turni vecchi',()=>{
  const first=accumulateBattleReport(createBattleReport(),
    {p1:[fighter('finn','Finn',50,100)],p2:[fighter('enemy','Nemico',100)]},
    [{type:'battle_actor',player:'p1',charTeamIdx:0,kind:'use_item'},
     {type:'damage',targetPlayer:'p1',targetIdx:0,newHp:90},
     {type:'battle_actor_end'}]);
  const second=accumulateBattleReport(first,
    {p1:[fighter('finn','Finn',90,100)],p2:[fighter('enemy','Nemico',100)]},
    [{type:'battle_actor',player:'p1',charTeamIdx:0,kind:'attack'},
     {type:'damage',targetPlayer:'p2',targetIdx:0,newHp:80},
     {type:'battle_actor_end'}]);
  assert.equal(first.entries['p1:0'].healing,40);
  assert.equal(first.entries['p1:0'].damageDealt,0);
  assert.equal(second.entries['p1:0'].healing,40);
  assert.equal(second.entries['p1:0'].damageDealt,20);
  assert.equal(second.turns,2);
});

test('I danni eccedenti e quelli su se stessi non diventano danni inflitti',()=>{
  const report=accumulateBattleReport(null,
    {p1:[fighter('goku','Goku',60)],p2:[fighter('boss','Boss',20)]},
    [{type:'battle_actor',player:'p1',charTeamIdx:0,kind:'attack'},
     {type:'damage',targetPlayer:'p1',targetIdx:0,newHp:35},
     {type:'damage',targetPlayer:'p2',targetIdx:0,newHp:0},
     {type:'damage',targetPlayer:'p2',targetIdx:0,newHp:0}]);
  assert.equal(report.entries['p1:0'].damageDealt,20);
  assert.equal(report.entries['p1:0'].damageTaken,25);
  assert.equal(report.entries['p1:0'].kos,1);
});

test('Le passive di ingresso vengono conteggiate senza aggiungere turni fittizi',()=>{
  const report=accumulateBattleReport(createBattleReport(),
    {p1:[fighter('nicole','Nicole',100)],p2:[fighter('enemy','Boss',100)]},
    [{type:'text',text:'Nicole usa Mamma Demoniaca',isPassive:true,passiveChar:'Nicole',passiveName:'Mamma Demoniaca'}],
    {countTurn:false});
  assert.equal(report.turns,0);
  assert.equal(report.entries['p1:0'].passiveActivations,1);
});

test('Cure passive e danni periodici non si attribuiscono per errore all\'ultimo attaccante',()=>{
  const report=accumulateBattleReport(createBattleReport(),
    {p1:[fighter('c','Curatore',40,100)],p2:[fighter('boss','Boss',100)]},
    [{type:'battle_actor_end'},
     {type:'damage',targetPlayer:'p1',targetIdx:0,newHp:65,
      isPassive:true,passiveChar:'Curatore',passiveName:'Benedizione',text:'Benedizione cura Curatore'},
     {type:'damage',targetPlayer:'p2',targetIdx:0,newHp:90}]);
  assert.equal(report.entries['p1:0'].healing,25);
  assert.equal(report.entries['p1:0'].damageDealt,0);
  assert.equal(report.entries['p2:0'].damageTaken,10);
});

test('Le classifiche sono tutte disponibili, sicure per report vuoti e limitate ai primi 3',()=>{
  assert.equal(BATTLE_REPORT_METRICS.length,6);
  assert.equal(battleReportMvp(createBattleReport()),null);
  assert.deepEqual(battleReportLeaders(null,'kos'),[]);
  const report=createBattleReport();
  for(let i=0;i<5;i++)report.entries['p1:'+i]={
    player:'p1',idx:i,name:'Multimon '+i,kos:i+1
  };
  assert.deepEqual(battleReportLeaders(report,'kos').map(c=>c.kos),[5,4,3]);
});

test('Le schermate di fine incontro includono le statistiche in ogni modalità',()=>{
  const engine=readFileSync(new URL('../src/systems/battleSystem.js',import.meta.url),'utf8');
  const gameover=readFileSync(new URL('../src/screens/battle/GameoverView.jsx',import.meta.url),'utf8');
  const campaign=readFileSync(new URL('../src/screens/campaign/CampaignTeamSelectView.jsx',import.meta.url),'utf8');
  assert.match(engine,/events\.push\(\{type:'battle_actor',player,charTeamIdx,kind:action\.type\}\)/);
  assert.match(engine,/events\.push\(\{type:'battle_actor_end'\}\)/);
  assert.match(engine,/battleReport: accumulateBattleReport\(gameState\.battleReport, startOfTurnTeams, events\)/);
  assert.match(engine,/evt\.type === 'battle_actor' \|\| evt\.type === 'battle_actor_end'/);
  assert.match(campaign,/state\.battleReport = accumulateBattleReport\(state\.battleReport, state\.teams, initialEvents/);
  assert.equal((gameover.match(/<BattleReportPanel /g)||[]).length,4);
});
