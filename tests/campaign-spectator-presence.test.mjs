import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 ONLINE_TIMEOUT_MS,ONLINE_CLOCK_SKEW_MS,freshOnlineTimestamp,
 visibleOnlinePlayers,activityForPresence,isLiveCampaignBattle,
 campaignBattlePublicSnapshot,canObserveCampaignPresence,selectCampaignSpectatorSession
} from '../src/systems/onlinePresence.js';
import {campaignSnapshotToSpectatorState} from '../src/systems/campaignSpectatorBattle.js';

const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const now=Date.now();
const character=(id,name,hp,maxHp=100)=>({
 id,name,hp,maxHp,img:'https://example.com/'+id+'.png',
 types:['Luce','Terra'],statuses:[{type:'Scottato',turns:2}],
 moves:[{name:'Mossa segreta',damage:999}],heldItem:'iperband',
 inventory:{cura_totale:99},juggHitsRemaining:2
});
const campaignState={
 status:'battling',isCampaignBattle:true,
 players:{p1:'Giulia',p2:'Echomax'},
 settings:{fieldSize:2},battleReport:{turns:4},
 teams:{p1:[character('finn','Finn',85),character('jake','Jake',62),
  character('secret','Multimon in riserva',90)],
  p2:[character('boss','Echomax',120,200),character('minion','Minion',40)]},
 field:{p1:[1,0],p2:[0,1]},
 events:[{type:'damage',targetPlayer:'p2',targetIdx:0,newHp:120,text:'Jake colpisce Echomax!'},
  {type:'secret',hidden:true,text:'Segreto nascosto'},
  {type:'text',text:'Echomax scatena la sua aura!'}],
 inventory:{p1:{pozioni:200}},
 actions:{p1:{0:{type:'move',name:'Mossa segreta'}}},
 playerUids:{p1:'hidden-user-uid'}
};

test('Presenza: le battaglie campagna NON appaiono più Nel Menu',()=>{
 assert.equal(isLiveCampaignBattle('local_room',campaignState),true);
 assert.equal(activityForPresence('local_room',campaignState,null),'⚔️ Lotta Campagna');
 assert.equal(activityForPresence('campaign_map',{},null),'📖 In Campagna');
 assert.equal(activityForPresence('campaign_dialogue',{},null),'📖 In Campagna');
 assert.equal(activityForPresence('local_room',{isCampaignBattle:false},null),'🎮 In partita locale');
 assert.equal(activityForPresence('online_room',{},'ABC12'),'⚔️ In Partita');
 assert.equal(activityForPresence('roguelike_map',{},null),'🎲 In Roguelike');
 assert.equal(activityForPresence('roguelike_coop_lobby',{},null),'🤝 In Co-op');
 assert.equal(activityForPresence('menu',{},null),'Nel Menu');
 assert.equal(activityForPresence('campaign_spectate',{},null),'👁️ Osserva una Campagna');
 for(const phase of ['pre_battle','battling','executing','switching_phase']){
  assert.equal(isLiveCampaignBattle('local_room',{isCampaignBattle:true,status:phase}),true);
 }
 assert.equal(isLiveCampaignBattle('local_room',{isCampaignBattle:true,status:'gameover'}),false);
});

test('La diretta è una MINIATURA del campo, senza dati del salvataggio né panchina',()=>{
 const snap=campaignBattlePublicSnapshot(campaignState,
  {campaignId:'eco_anime',campaignName:'Echomax: frattura',missionName:'Scontro finale'});
 assert.equal(snap.phase,'battling');
 assert.equal(snap.campaignName,'Echomax: frattura');
 assert.equal(snap.turn,4);
 assert.equal(snap.playerName,'Giulia');
 assert.equal(snap.opponentName,'Echomax');
 assert.deepEqual(snap.allies.map(c=>c.name),['Jake','Finn']);
 assert.deepEqual(snap.opponents.map(c=>c.name),['Echomax','Minion']);
 assert.equal(snap.allies[0].hp,62);
 assert.equal(snap.opponents[0].hp,120);
 assert.equal(snap.allies[0].shield,2);
 assert.equal(snap.allies[0].statuses[0],'Scottato');
 assert.deepEqual(snap.highlights,['Jake colpisce Echomax!','Echomax scatena la sua aura!']);
 const json=JSON.stringify(snap);
 for(const forbidden of ['Multimon in riserva','Mossa segreta','pozioni','cura_totale',
  'playerUids','iperband','hidden-user-uid','danno segreto','Segreto nascosto']){
  assert.equal(json.includes(forbidden),false,forbidden);
 }
 assert.ok(json.length<10000);
 assert.equal(campaignBattlePublicSnapshot({...campaignState,status:'gameover'}),null);
 assert.equal(campaignBattlePublicSnapshot({...campaignState,isCampaignBattle:false}),null);
});

test('L’osservazione termina a fine battaglia, alla disattivazione o alla perdita del heartbeat',()=>{
 const snapshot=campaignBattlePublicSnapshot(campaignState);
 const live={uid:'friend',sessionId:'tab',name:'Giulia',timestamp:now,
  status:'⚔️ Lotta Campagna',campaignBattle:{...snapshot,updatedAt:now}};
 assert.equal(canObserveCampaignPresence(live,now),true);
 assert.equal(canObserveCampaignPresence({...live,campaignBattle:null},now),false);
 assert.equal(canObserveCampaignPresence({...live,timestamp:now-ONLINE_TIMEOUT_MS-1},now),false);
 assert.equal(canObserveCampaignPresence({...live,campaignBattle:{...snapshot,updatedAt:now-ONLINE_TIMEOUT_MS-1}},now),false);
 assert.equal(canObserveCampaignPresence({...live,uid:null},now),false);
 assert.equal(canObserveCampaignPresence({...live,campaignBattle:{...snapshot,phase:'gameover'}},now),false);
});

test('Un account con due schede: la campagna attiva precede la scheda Nel Menu',()=>{
 const snapshot=campaignBattlePublicSnapshot(campaignState);
 const users=[
  {uid:'friend',sessionId:'battle',name:'Giulia',timestamp:now-16000,
   status:'⚔️ Lotta Campagna',campaignBattle:{...snapshot,updatedAt:now-16000}},
  {uid:'friend',sessionId:'menu',name:'Giulia',timestamp:now-300,status:'Nel Menu'},
  {uid:'other',sessionId:'fresh',name:'Marco',timestamp:now-1000,status:'Nel Menu'},
  {uid:'my',sessionId:'mine',name:'Io',timestamp:now,status:'Nel Menu'}
 ];
 const result=visibleOnlinePlayers(users,'mine',now);
 assert.equal(result.length,2);
 assert.equal(result.find(u=>u.uid==='friend').sessionId,'battle');
 const expired=users.map(u=>u.sessionId==='battle'?{...u,timestamp:now-ONLINE_TIMEOUT_MS-1}:u);
 assert.equal(visibleOnlinePlayers(expired,'mine',now).find(u=>u.uid==='friend').sessionId,'menu');
});

test('La campagna usa il campo ORIGINALE delle lotte online, senza una seconda UI',()=>{
 const app=read('../src/App.jsx');
 const screen=read('../src/screens/battle/CampaignSpectatorView.jsx');
 const battle=read('../src/screens/battle/BattlingView.jsx');
 assert.match(app,/activityForPresence\(appMode,gameState,roomId\)/);
 assert.match(app,/campaignBattlePublicSnapshot\(gameState/);
 assert.match(app,/setAppMode\('campaign_spectate'\)/);
 assert.match(app,/handleObserveCampaign\(u\)/);
 assert.match(app,/Diretta Campagna: ON/);
 assert.match(app,/Diretta Campagna: OFF/);
 assert.match(app,/multimon_campaign_watch_v1/);
 assert.match(app,/onExit=\{\(\)=>\{setSpectatingCampaign\(null\);setAppMode\('menu'\)/);
 assert.match(screen,/onSnapshot\(ref,snap/);
 assert.match(screen,/online_users/);
 assert.match(screen,/expectedUid/);
 assert.match(screen,/canObserveCampaignPresence\(entry,clock\)/);
 assert.match(screen,/campaignSnapshotToSpectatorState\(snapshot\)/);
 assert.match(screen,/return renderBattle\(\{/);
 assert.match(app,/renderBattle=\{\(\{gameState:watchedState/);
 assert.match(app,/renderBattlingView\(\{/);
 assert.match(app,/playerRole:'spectator'/);
 assert.match(battle,/MODALITÀ SPETTATORE/);
 assert.match(battle,/!isSpectatorState&&\(!isEventBattle\|\|eventBattleCanForce\)/);
 assert.doesNotMatch(screen,/campaign-watch-battlefield/);
});

test('Il campo normale riceve PNG, PS, stati e schieramenti nello stesso formato delle lotte online',()=>{
 const snap=campaignBattlePublicSnapshot(campaignState);
 const state=campaignSnapshotToSpectatorState(snap);
 assert.equal(state.status,'battling');
 assert.equal(state.gameMode,'classica');
 assert.equal(state.isCampaignBattle,true);
 assert.equal(state.players.p1,'Giulia');
 assert.equal(state.players.p2,'Echomax');
 assert.deepEqual(state.field.p1,[0,1]);
 assert.deepEqual(state.field.p2,[0,1]);
 assert.deepEqual(state.teams.p1.map(c=>c.name),['Jake','Finn']);
 assert.equal(state.teams.p1[0].hp,62);
 assert.equal(state.teams.p1[0].maxHp,100);
 assert.equal(state.teams.p1[0].statuses[0].type,'Scottato');
 assert.equal(state.teams.p2[0].juggHitsRemaining,2);
 assert.equal(state.isBot.p2,true);
 assert.equal(state.battleReport.turns,4);
 assert.deepEqual(state.teams.p3,[]);
 assert.deepEqual(state.field.p3,[]);
 assert.equal(state.inventory.p1['cura_totale'],undefined);
 assert.equal(state.actions.p1[0],undefined);
 assert.equal(state.teams.p1.find(c=>c.id==='secret'),undefined);
 assert.equal(campaignSnapshotToSpectatorState(null),null);
 assert.equal(campaignSnapshotToSpectatorState({...snap,phase:'executing'}).status,'executing');
 assert.equal(campaignSnapshotToSpectatorState({...snap,phase:'switching_phase'}).status,'battling');
});


test('Orologi di due dispositivi non perfettamente sincronizzati non fanno terminare la diretta',()=>{
 const snap=campaignBattlePublicSnapshot(campaignState);
 const friend={uid:'friend',sessionId:'battle',name:'Giulia',status:'⚔️ Lotta Campagna',
  timestamp:now+45000,campaignBattle:{...snap,updatedAt:now+45000}};
 assert.equal(canObserveCampaignPresence(friend,now),true,
  'L’orologio dell’amica 45 secondi avanti non deve interrompere la diretta');
 assert.equal(visibleOnlinePlayers([friend],'mine',now).length,1);
 assert.equal(freshOnlineTimestamp(now+ONLINE_CLOCK_SKEW_MS+1,now),false,
  'Gli orologi veramente errati restano esclusi');
 assert.equal(canObserveCampaignPresence({...friend,timestamp:now-ONLINE_TIMEOUT_MS-1},now),false);
});

test('Dopo un aggiornamento della pagina segue automaticamente la nuova sessione dello stesso account',()=>{
 const snap=campaignBattlePublicSnapshot(campaignState);
 const old={uid:'friend',sessionId:'old-tab',name:'Giulia',status:'Nel Menu',
  timestamp:now-10000,campaignBattle:null};
 const newer={uid:'friend',sessionId:'new-tab',name:'Giulia',status:'⚔️ Lotta Campagna',
  timestamp:now-1000,campaignBattle:{...snap,updatedAt:now-1000}};
 const unexpected={...newer,uid:'not-friend',sessionId:'other'};
 const selected=selectCampaignSpectatorSession([old,newer,unexpected],'friend','old-tab',now);
 assert.equal(selected.sessionId,'new-tab');
 assert.equal(selectCampaignSpectatorSession([old],'friend','old-tab',now).sessionId,'old-tab');
 assert.equal(selectCampaignSpectatorSession([unexpected],'friend','old-tab',now),null);
 const source=read('../src/screens/battle/CampaignSpectatorView.jsx');
 assert.match(source,/where\('uid','==',expectedUid\)/);
 assert.match(source,/selectCampaignSpectatorSession\(rows,expectedUid,sessionId\)/);
 assert.doesNotMatch(source,/La battaglia è terminata/);
 assert.match(source,/In attesa del segnale della battaglia/);
 assert.match(source,/la trasmissione ripartirà automaticamente/);
});

test('Gli heartbeat sono serializzati: nessun vecchio turno può sovrascrivere il più recente',()=>{
 const app=read('../src/App.jsx');
 assert.match(app,/presenceWriteRef=useRef\(\{running:false,queued:false,latest:null\}\)/);
 assert.match(app,/if\(writer\.running\)return/);
 assert.match(app,/while\(writer\.queued\)/);
 assert.match(app,/const payload=writer\.latest/);
 assert.match(app,/campaignBattle:payload\.campaignBattle/);
 assert.match(app,/updatedAt:timestamp/);
 assert.match(app,/setInterval\(updatePresence,25000\)/);
});
