import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ECHO_CAMPAIGN,ECHO_ALLIES,ECHO_RECRUITS,ECHO_FINAL_ID} from '../src/data/echoCampaign.js';
import {CHARACTERS} from '../src/data/characters.js';
import {MOVES_DB} from '../src/data/moves.js';
import {CAMPAIGNS} from '../src/data/campaigns.js';
import {CAMPAIGN_ORDER,getCampaignLock} from '../src/systems/campaignUnlocks.js';
import {collectEchoSoul,expireEchoCopies} from '../src/systems/echoSoulLegion.js';
import {claimEchoRoute,applyEchoRouteToTeam,ECHO_ROUTES} from '../src/systems/echoRoutes.js';
import {ECHO_ACTIVE_LIMIT,echoRaidStarters,toggleEchoRaidStarter,orderEchoRaidRoster,isCompleteEchoRaidLineup} from '../src/systems/echoRaidLineup.js';
import {initialCampaignField} from '../src/systems/campaignBattleRecovery.js';
import {getRequiredSwitches} from '../src/systems/roomRecovery.js';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('Echomax è la terza campagna prima di Monarch, non modifica le prime due',()=>{
 assert.deepEqual(CAMPAIGN_ORDER,['crisi_varco','torneo_assoluto','eco_anime','monarch_akuma']);
 assert.deepEqual(CAMPAIGNS.map(c=>c.id),CAMPAIGN_ORDER);
 assert.equal(ECHO_CAMPAIGN.id,'eco_anime');
 const storage={getItem:key=>{
  if(key==='multimon_completed_campaigns_v1')return JSON.stringify({crisi_varco:true,torneo_assoluto:true});
  return null;
 }};
 assert.equal(getCampaignLock('eco_anime',storage),null);
 assert.equal(getCampaignLock('monarch_akuma',storage),'eco_anime');
});

test('Trentasei missioni in sei atti con dialoghi individuali, ricompense e boss validi',()=>{
 assert.equal(ECHO_CAMPAIGN.sectors.length,6);
 const stages=ECHO_CAMPAIGN.sectors.flatMap(s=>s.missions);
 assert.equal(stages.length,36);
 const allIds=new Set(CHARACTERS.map(c=>c.id));
 stages.forEach((m,i)=>{
  assert.equal(m.id,'eco_'+String(i+1).padStart(2,'0'));
  assert.equal(m.echoNumber,i+1);
  assert.ok(m.echoMission);
  assert.ok(m.dialogue.length>=3);
  assert.ok(m.postDialogue.length>=1);
  assert.ok(['superstite','resistenza','legendaria'].includes(m.echoReward));
  assert.ok(m.boss.length>=1);
  m.boss.forEach(id=>assert.ok(allIds.has(id),'Boss non esistente: '+id));
  m.unlock.forEach(id=>assert.ok(allIds.has(id),'Personaggio da reclutare inesistente: '+id));
  if(i%6===5)assert.equal(m.echoReward,'legendaria');
 });
 assert.equal(stages[35].id,ECHO_FINAL_ID);
 assert.equal(stages[35].forceFieldSize,6);
 assert.deepEqual(stages[35].forcedRoster,ECHO_ALLIES);
 assert.deepEqual(stages[35].boss,['echomax','goku','naruto','luffy']);
});

test('Tutti i 24 campioni sono unici, i 22 reclutamenti compaiono una sola volta',()=>{
 const stages=ECHO_CAMPAIGN.sectors.flatMap(s=>s.missions);
 const recruits=stages.flatMap(m=>m.unlock);
 assert.equal(ECHO_ALLIES.length,24);
 assert.equal(new Set(ECHO_ALLIES).size,24);
 assert.equal(ECHO_RECRUITS.length,22);
 assert.deepEqual(recruits,ECHO_RECRUITS);
 assert.ok(!ECHO_ALLIES.includes('echomax'));
 assert.ok(!ECHO_ALLIES.includes('finn'));
 assert.ok(!ECHO_ALLIES.includes('topolino'));
});

test('Echomax possiede le mosse richieste e la passiva Legione dei Caduti',()=>{
 const c=CHARACTERS.find(c=>c.id==='echomax');
 assert.ok(c);
 assert.deepEqual(c.types,['Spettro','Buio']);
 assert.equal(c.passive.type,'soul_legion');
 assert.ok(c.isSecretUnlock);
 assert.deepEqual(c.moves.map(m=>m.name),['Raggio dei Caduti','Le Tenebre vi Avvolgono','Vieni a Me, Anima','Dominatore del Multiverso']);
 assert.equal(MOVES_DB['Raggio dei Caduti'].power,100);
 assert.equal(MOVES_DB['Raggio dei Caduti'].accuracy,0.8);
 assert.equal(MOVES_DB['Le Tenebre vi Avvolgono'].power,70);
 assert.equal(MOVES_DB['Le Tenebre vi Avvolgono'].targetCount,24);
 assert.deepEqual(MOVES_DB['Vieni a Me, Anima'].targetStatDebuff,{def:0.7,spd:0.7});
 assert.equal(MOVES_DB['Dominatore del Multiverso'].power,150);
 assert.ok(MOVES_DB['Dominatore del Multiverso'].recharge);
 assert.ok(MOVES_DB['Dominatore del Multiverso'].echoRecoilConfusion);
});

const hero=(id,hp=100)=>({id,name:id,maxHp:hp,hp,passive:id==='echomax'?{type:'soul_legion',name:'Legione dei Caduti'}:null,moves:[{name:'Attacco',power:40}],statuses:[]});

test('Legione dei Caduti: 3 KO nemici -> una Copia Perfetta per tre turni',()=>{
 const teams={p1:[hero('jake'),hero('marceline'),hero('neon')],p2:[hero('echomax')]};
 const field={p1:[0,1,2],p2:[0]},events=[];
 for(let i=0;i<3;i++)collectEchoSoul(teams,field,teams.p1[i],'p1',events);
 assert.equal(teams.p2[0].echoSoulCharges,0);
 assert.equal(teams.p2.length,2);
 assert.equal(field.p2.length,2);
 assert.equal(teams.p2[1].isEchoCopy,true);
 assert.equal(teams.p2[1].echoTurns,3);
 assert.equal(teams.p2[1].name,'Copia Perfetta di neon');
 expireEchoCopies(teams,field,events);
 assert.equal(teams.p2[1].echoTurns,3,'Il turno di evocazione non consuma un turno di vita.');
 expireEchoCopies(teams,field,events);
 assert.equal(teams.p2[1].echoTurns,2);
 expireEchoCopies(teams,field,events);
 assert.equal(teams.p2[1].echoTurns,1);
 expireEchoCopies(teams,field,events);
 assert.equal(teams.p2[1].echoTurns,0);
 assert.deepEqual(field.p2,[0]);
 assert.ok(events.some(e=>e.type==='remove'));
});

test('Le copie non generano altre cariche e non si accumulano copie simultanee',()=>{
 const teams={p1:[hero('a'),hero('b'),hero('c'),hero('d')],p2:[hero('echomax')]};
 const field={p1:[0,1,2,3],p2:[0]},events=[];
 collectEchoSoul(teams,field,teams.p1[0],'p1',events);
 collectEchoSoul(teams,field,teams.p1[1],'p1',events);
 collectEchoSoul(teams,field,teams.p1[2],'p1',events);
 assert.equal(teams.p2.length,2);
 collectEchoSoul(teams,field,teams.p1[3],'p1',events);
 assert.equal(teams.p2[0].echoSoulCharges,1);
 collectEchoSoul(teams,field,teams.p2[1],'p2',events);
 assert.equal(teams.p2[0].echoSoulCharges,1);
});

test('Integrazione: battle classica, 6 in campo, 24 in squadra e sblocco Echomax',()=>{
 const team=read('src/screens/campaign/CampaignTeamSelectView.jsx');
 const battle=read('src/systems/battleSystem.js');
 const ui=read('src/screens/battle/BattlingView.jsx');
 const over=read('src/screens/battle/GameoverView.jsx');
 const post=read('src/screens/campaign/CampaignPostDialogueView.jsx');
 const app=read('src/App.jsx');
 assert.match(team,/maxTeamSize = 24/);
 assert.match(team,/charInst\.shieldGrantedHits=8/);
 assert.match(team,/charInst\.juggShieldHpThresholds=\[0\.8,0\.6,0\.4,0\.2\]/);
 assert.match(team,/charInst\.isEchoRaidBoss=true/);
 assert.match(team,/\? 6200 :/);
 assert.match(battle,/collectEchoSoul\(workingTeams,workingField,char,targetPlayer,events,/);
 assert.match(battle,/expireEchoCopies\(workingTeams,workingField,events\)/);
 assert.match(battle,/!attacker\.isEchoRaidBoss/);
 assert.match(team,/state\.gameMode = 'classica'/);
 assert.match(team,/state\.isCampaignBattle = true/);
 assert.match(team,/fSize = ECHO_ACTIVE_LIMIT/);
 assert.match(team,/orderEchoRaidRoster\(campaignSelectedTeam,echoStartingSix\)/);
 assert.doesNotMatch(ui,/isEchoRaid && !isEnemySide/);
 assert.match(ui,/renderFieldCharacter\(p, fIdx, charIdx, false\)/);
 assert.match(ui,/gameState\.isEchoFinalBattle \? 'grid grid-cols-2 gap-3 max-h-/);
 assert.match(read('src/screens/battle/SwitchingPhaseView.jsx'),/gameState\.isEchoFinalBattle \? "min-h-screen/);
 assert.match(over,/saveGlobalUnlock\('echomax'\)/);
 assert.match(post,/campaign_echo_chest/);
 assert.match(app,/renderEchoChestView/);
});

test('La scelta roguelike è unica per missione, senza farmare cure ripetute',()=>{
 assert.equal(ECHO_ROUTES.length,3);
 const base={roster:['jake','marceline'],rosterStats:{jake:30,marceline:0},echoRouteChoices:{}};
 const picked=claimEchoRoute(base,'eco_01','rifugio',CHARACTERS);
 assert.ok(picked.rosterStats.jake>30);
 assert.equal(picked.rosterStats.marceline,0);
 assert.equal(picked.echoRouteChoices.eco_01,'rifugio');
 const second=claimEchoRoute(picked,'eco_01','rifugio',CHARACTERS);
 assert.equal(second,picked);
 const another=claimEchoRoute(second,'eco_02','assalto',CHARACTERS);
 assert.equal(another.echoRouteChoices.eco_02,'assalto');
});

test('Assalto potenzia attacco, ricognizione offre scudo senza contaminare altri scontri',()=>{
 const original={id:'jake',atk:100,baseAtk:100,statuses:[]};
 const team1=[structuredClone(original)];
 applyEchoRouteToTeam(team1,'assalto');
 assert.equal(team1[0].atk,110);
 assert.equal(team1[0].baseAtk,110);
 const team2=[structuredClone(original)];
 applyEchoRouteToTeam(team2,'ricognizione');
 assert.equal(team2[0].atk,100);
 assert.ok(team2[0].statuses.some(s=>s.type==='Scudo Team'&&s.turns===1));
 assert.equal(original.statuses.length,0);
});

test('La mappa obbliga alla scelta del percorso e il raid non lo richiede',()=>{
 const map=read('src/screens/campaign/CampaignMapView.jsx');
 const team=read('src/screens/campaign/CampaignTeamSelectView.jsx');
 assert.match(map,/claimEchoRoute\(p,mission.id,route.id,CHARACTERS\)/);
 assert.match(map,/mission.echoMission&&!mission.echoFinal&&!campaignState.echoRouteChoices/);
 assert.match(team,/applyEchoRouteToTeam\(p1Team,campaignState.echoRouteChoices/);
});

test('La Legione non conta i KO degli alleati in una battaglia multipla',()=>{
 const t={p1:[hero('echomax')],p2:[hero('ally')],p3:[hero('enemy')]};
 const f={p1:[0],p2:[0],p3:[0]};const e=[];
 collectEchoSoul(t,f,t.p2[0],'p2',e,{gameMode:'multipla'});
 assert.equal(t.p1[0].echoSoulCharges??0,0);
 collectEchoSoul(t,f,t.p3[0],'p3',e,{gameMode:'multipla'});
 assert.equal(t.p1[0].echoSoulCharges,1);
});

test('I sei titolari sono scelti fra 24 alleati e gli altri 18 restano disponibili',()=>{
 assert.equal(ECHO_ACTIVE_LIMIT,6);
 const starters=echoRaidStarters(ECHO_ALLIES);
 assert.equal(starters.length,6);
 assert.deepEqual(starters,ECHO_ALLIES.slice(0,6));
 assert.equal(isCompleteEchoRaidLineup(ECHO_ALLIES,starters),true);

 const five=toggleEchoRaidStarter(ECHO_ALLIES,starters,ECHO_ALLIES[0]);
 assert.equal(five.length,5);
 assert.equal(isCompleteEchoRaidLineup(ECHO_ALLIES,five),false);
 const chosen=toggleEchoRaidStarter(ECHO_ALLIES,five,ECHO_ALLIES[18]);
 assert.equal(chosen.length,6);
 assert.ok(chosen.includes(ECHO_ALLIES[18]));
 assert.ok(!chosen.includes(ECHO_ALLIES[0]));
 const ordered=orderEchoRaidRoster(ECHO_ALLIES,chosen);
 assert.equal(ordered.length,24);
 assert.equal(new Set(ordered).size,24);
 assert.deepEqual(ordered.slice(0,6),chosen);
 assert.equal(ordered.slice(6).length,18);
});

test('Il campo iniziale contiene 6 combattenti, non 24, con 18 riserve e il boss singolo',()=>{
 const ordered=orderEchoRaidRoster(ECHO_ALLIES,echoRaidStarters(ECHO_ALLIES));
 const team=ordered.map(id=>hero(id));
 const active=initialCampaignField(team,6);
 assert.deepEqual(active,[0,1,2,3,4,5]);
 assert.equal(team.length,24);
 const room={gameMode:'classica',settings:{fieldSize:6,teamSize:24},
   teams:{p1:team,p2:[hero('echomax')]},
   field:{p1:active,p2:[0]},
   switchActions:{p1:[],p2:[]}};
 const ready=getRequiredSwitches(room,['p1','p2']);
 assert.equal(ready.need.p1,0);
 assert.equal(ready.need.p2,0);
 assert.equal(ready.bench.p1.length,18);

 // Se un titolare va KO, il motore deve chiedere una singola sostituzione.
 room.teams.p1[0].hp=0;
 room.field.p1=[1,2,3,4,5];
 const afterKo=getRequiredSwitches(room,['p1','p2']);
 assert.equal(afterKo.need.p1,1);
 assert.equal(afterKo.bench.p1.length,18);
 assert.deepEqual(afterKo.bench.p1.slice(0,2),[6,7]);
 assert.equal(afterKo.need.p2,0);

 room.field.p1=[1,2,3,4,5,6];
 assert.equal(getRequiredSwitches(room,['p1','p2']).need.p1,0);
});
