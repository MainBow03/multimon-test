import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {initialGameState} from '../src/systems/gameState.js';
import {
 COMBAT_LAB_DEFAULT,COMBAT_LAB_MAX_PRESETS,
 COMBAT_LAB_STATUSES,COMBAT_LAB_WEATHERS,COMBAT_LAB_CPU,
 normalizeCombatLabConfig,combatLabStatus,combatLabWeather,
 prepareCombatLabFighter,createCombatLabRoom,dummyCombatLabActions,
 canEditCombatLabBattle,editCombatLabFighter,combatLabReportTotals
} from '../src/systems/combatLab.js';
import {startBattleImpl,generateCPUActionsForPlayerImpl} from '../src/systems/battleSystem.js';

const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const character=id=>CHARACTERS.find(c=>c.id===id);

test('Il laboratorio riconosce tutti i formati, meteo, status e tipi CPU consentiti',()=>{
 assert.equal(COMBAT_LAB_MAX_PRESETS,5);
 assert.ok(COMBAT_LAB_STATUSES.some(x=>x.id==='Assiderato'&&x.turns===2));
 assert.ok(COMBAT_LAB_STATUSES.some(x=>x.id==='Scottato'));
 assert.ok(COMBAT_LAB_WEATHERS.some(x=>x.id==='snowstorm'));
 assert.ok(COMBAT_LAB_WEATHERS.some(x=>x.id==='rainstorm'));
 assert.deepEqual(COMBAT_LAB_CPU.map(x=>x.id),['dummy','normal','expert']);
 assert.deepEqual(combatLabStatus('Assiderato'),
  {type:'Assiderato',turns:2,justApplied:true});
 assert.equal(combatLabStatus('none'),null);
 assert.deepEqual(combatLabWeather('rainstorm'),{type:'rainstorm',turns:5});
 assert.equal(combatLabWeather('none'),null);
 assert.equal(combatLabWeather('bad-weather'),null);
});

test('Config invalidi e roster doppi non permettono sblocchi esclusivi o format fuori limite',()=>{
 const raw={
  p1:['ganyu','ganyu','sonic','gaster','inesistente','lucy','coraline','flins','jake','elsa'],
  p2:['elsa','elsa'],fieldSize:99,
  cpuMode:'inventato',weather:'fake',hpP1:-20,hpP2:999,
  statusP1:'fake',statusP2:'Assiderato',upgrades:true
 };
 const normalized=normalizeCombatLabConfig(raw,CHARACTERS);
 assert.equal(normalized.fieldSize,4);
 assert.deepEqual(normalized.p1.filter(id=>id==='ganyu'),['ganyu']);
 assert.equal(normalized.p1.length<=6,true);
 assert.equal(normalized.p2.length,1);
 assert.equal(normalized.p1.includes('gaster'),!character('gaster')?.isSecretUnlock&&!character('gaster')?.isCampaignMonster);
 assert.equal(normalized.p1.includes('inesistente'),false);
 assert.equal(normalized.weather,'none');
 assert.equal(normalized.cpuMode,'dummy');
 assert.equal(normalized.hpP1,10);
 assert.equal(normalized.hpP2,100);
 assert.equal(normalized.statusP1,'none');
 assert.equal(normalized.statusP2,'Assiderato');
 assert.equal(normalized.upgrades,false);
 const boss=CHARACTERS.find(c=>c.isSecretUnlock);
 if(boss)assert.equal(normalizeCombatLabConfig({p1:[boss.id]},CHARACTERS).p1.includes(boss.id),false);
});

test('Creazione laboratorio: due squadre reali, PS e stati separati, nessuna risorsa del profilo',()=>{
 const config={p1:['ganyu','flins'],p2:['coraline','elsa'],
  fieldSize:3,cpuMode:'dummy',weather:'rainstorm',
  hpP1:50,hpP2:25,statusP1:'Assiderato',statusP2:'Scottato'};
 const originalGanyu=JSON.stringify(character('ganyu'));
 const lab=createCombatLabRoom(config,CHARACTERS,initialGameState,'Campione');
 assert.equal(lab.status,'drafting');
 assert.equal(lab.gameMode,'classica');
 assert.equal(lab.isTrainingBattle,true);
 assert.equal(lab.players.p1,'Campione');
 assert.equal(lab.players.p2,'Manichino');
 assert.equal(lab.isBot.p2,true);
 assert.equal(lab.settings.fieldSize,2,'Campo ridotto a squadra più piccola');
 assert.equal(lab.draft.p1.length,2);
 assert.equal(lab.draft.p2.length,2);
 assert.equal(lab.draft.p1[0].hp,Math.ceil(lab.draft.p1[0].maxHp*.5));
 assert.equal(lab.draft.p2[0].hp,Math.ceil(lab.draft.p2[0].maxHp*.25));
 assert.deepEqual(lab.draft.p1[0].statuses,[{type:'Assiderato',turns:2,justApplied:true}]);
 assert.deepEqual(lab.draft.p2[0].statuses,[{type:'Scottato',turns:3,justApplied:true}]);
 assert.equal(lab.draft.p1[0].moves.length,4);
 assert.ok(lab.draft.p1[0].moves.every(m=>m.remainingUses===null||Number.isFinite(m.remainingUses)));
 assert.deepEqual(lab.inventory.p1,{});
 assert.deepEqual(lab.inventory.p2,{});
 assert.deepEqual(lab.playerStrength.p1,{});
 assert.deepEqual(lab.playerStrengthOwned.p1,[]);
 assert.equal(lab.trainingLab.weather,'rainstorm');
 assert.equal(JSON.stringify(character('ganyu')),originalGanyu,'Il catalogo non va mutato');
});

test('Avvio integrato: startBattleImpl genera realmente le squadre del motore classico',()=>{
 const lab=createCombatLabRoom({p1:['sonic'],p2:['garnet'],
  cpuMode:'dummy',fieldSize:1},CHARACTERS,initialGameState,'Test');
 const changes=[];
 let saved=0,selectedRole=null,command=null;
 const clock={current:0};
 startBattleImpl({
  appMode:'local_room',applyOnEnterPassive:()=>{},
  gameState:lab,getRequiredPlayers:()=>2,
  matchStartTimeRef:clock,playerName:'Test',
  setCombatLog:()=>{},setIsLogOpen:()=>{},
  setCommandingIdx:i=>{command=i;},setPlayerRole:r=>{selectedRole=r;},
  updateLocalStats:()=>{saved++;},
  updateState:patch=>{changes.push(patch);return Promise.resolve();}
 });
 assert.equal(changes.length,1);
 const battle=changes[0];
 assert.equal(battle.status,'pre_battle');
 assert.deepEqual(battle.field.p1,[0]);
 assert.deepEqual(battle.field.p2,[0]);
 assert.equal(battle.teams.p1[0].id,'sonic');
 assert.equal(battle.teams.p2[0].id,'garnet');
 assert.equal(battle.battleReport.version,1);
 assert.equal(battle.battleReport.turns,0);
 assert.equal(selectedRole,'p1');
 assert.equal(command,0);
 assert.ok(clock.current>0);
 assert.ok(saved>0,'Il motore normale prova a registrare progressi: App deve bloccarli nel sandbox');
 const room={...lab,...battle,status:'battling'};
 const dummy=dummyCombatLabActions(room,'p2');
 assert.deepEqual(dummy,{0:{type:'pass'}});
 assert.equal(dummyCombatLabActions(room,'p1'),null);
 const cpu=generateCPUActionsForPlayerImpl({gameState:room,getActivePlayers:()=>['p1','p2']},'p2',{p1:{},p2:{}});
 assert.deepEqual(cpu,{0:{type:'pass'}},'Il manichino deve passare davvero il turno');
});

test('I controlli live rispettano il turno e non modificano oggetti, campo o azioni del giocatore',()=>{
 const room=createCombatLabRoom(COMBAT_LAB_DEFAULT,CHARACTERS,initialGameState,'Test');
 room.status='battling';
 room.field.p1=[0,1];room.field.p2=[0,1];
 room.teams=structuredClone(room.draft);
 const original=structuredClone(room);
 assert.equal(canEditCombatLabBattle(room),true);
 assert.equal(canEditCombatLabBattle({...room,status:'executing'}),false);
 assert.equal(canEditCombatLabBattle(room,true),false);
 const patch=editCombatLabFighter(room,'p2',0,{status:'Assiderato',hpPercent:50});
 assert.ok(patch);
 assert.equal(patch.teams.p2[0].statuses[0].type,'Assiderato');
 assert.equal(patch.teams.p2[0].hp,Math.ceil(patch.teams.p2[0].maxHp*.5));
 assert.deepEqual(room,original,'Editing deve essere immutabile fino a updateState');
 assert.strictEqual(patch.teams.p1,room.teams.p1,'Non riscrivere gli alleati');
 assert.deepEqual(patch.teams.p2[1],room.teams.p2[1]);
 assert.equal(editCombatLabFighter({...room,status:'executing'},'p2',0,{hpPercent:100}),null);
 assert.equal(editCombatLabFighter(room,'p3',0,{hpPercent:100}),null);
 assert.equal(editCombatLabFighter(room,'p2',222,{hpPercent:100}),null);
 const updated={...room,...patch};
 const cured=editCombatLabFighter(updated,'p2',0,{clearStatus:true});
 assert.deepEqual(cured.teams.p2[0].statuses,[]);
});

test('Analisi danni reali: somma numeri del battleReport e non inventa il danno base',()=>{
 const report={version:1,turns:3,entries:{
  'p1:0':{player:'p1',damageDealt:52,damageTaken:23,healing:10,kos:1,passiveActivations:2,shieldsBroken:0},
  'p1:1':{player:'p1',damageDealt:17,damageTaken:12,healing:0,kos:0,passiveActivations:0,shieldsBroken:1},
  'p2:0':{player:'p2',damageDealt:22,damageTaken:69,healing:0,kos:0,passiveActivations:1,shieldsBroken:0}
 }};
 assert.deepEqual(combatLabReportTotals(report,'p1'),
  {damageDealt:69,damageTaken:35,healing:10,kos:1,passiveActivations:2,shieldsBroken:1});
 assert.equal(combatLabReportTotals(report,'p2').damageDealt,22);
 assert.equal(combatLabReportTotals(null,'p1').damageDealt,0);
});

test('Menu e flusso isolati: nessun farming di monete, Mastery, inventario o vittorie',()=>{
 const app=read('../src/App.jsx');
 const menu=read('../src/screens/hub/MenuDashboard.jsx');
 const legacy=read('../src/screens/hub/MenuView.jsx');
 const battle=read('../src/screens/battle/BattlingView.jsx');
 const ui=read('../src/screens/hub/CombatLabView.jsx');
 const css=read('../src/screens/hub/CombatLabView.css');
 assert.match(app,/appMode === 'combat_lab'/);
 assert.match(app,/createCombatLabRoom\(config,CHARACTERS,initialGameState/);
 assert.match(app,/startBattleImpl\(\{\s*appMode:'local_room'/);
 assert.match(app,/updateLocalStats:\(\)=>\{\},updateState:patched/);
 assert.match(app,/if\(gameState\.isTrainingBattle\)return \{ok:false/);
 assert.match(app,/gameState.status === 'gameover' && !gameState.isTrainingBattle/);
 assert.match(app,/const victoryPresentation=!gameState.isTrainingBattle/);
 assert.match(app,/CombatLabTelemetry room=\{gameState\}/);
 assert.match(app,/CombatLabResult room=\{gameState\}/);
 assert.match(menu,/Laboratorio di Combattimento/);
 assert.match(legacy,/Laboratorio di Combattimento/);
 assert.match(battle,/gameState\.isTrainingBattle\) \? leaveRoom\(\)/);
 assert.match(ui,/COMBAT_LAB_PRESETS_KEY/);
 assert.match(ui,/COMBAT_LAB_MAX_PRESETS/);
 assert.match(ui,/localStorage\.setItem\(COMBAT_LAB_CONFIG_KEY/);
 assert.match(ui,/onStart\(\{\.\.\.config\}\)/);
 assert.match(ui,/BattleReportPanel report=\{room\.battleReport\}/);
 assert.match(ui,/canEditCombatLabBattle\(room\)/);
 assert.match(css,/@media\(max-width:650px\)/);
 assert.match(css,/combat-lab-grid/);
 assert.match(css,/combat-lab-telemetry/);
});
