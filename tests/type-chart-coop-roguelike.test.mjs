import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {initialGameState} from '../src/systems/gameState.js';
import {getActivePlayersImpl} from '../src/systems/multiplayerSystem.js';
import {GAME_UPDATES} from '../src/data/updateHistory.js';
import {TYPES} from '../src/data/types.js';
import {TYPE_CHART} from '../src/systems/typeSystem.js';
import {applyOnEnterPassiveImpl} from '../src/systems/battleSystem.js';
import {
 COOP_HUMANS,COOP_BOSS,COOP_MAX_FLOOR,COOP_MAX_TEAM,coopHumanPlayers,
 coopCount,coopRecruitChance,coopRecruitWeights,chooseCoopRecruitOwner,prepareCoopDraft,
 freshCoopFighter,coopEnemyForFloor,finishCoopFloor,coopCampPurchase,nextCoopFloor
} from '../src/systems/coopExpedition.js';

const file=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const fighter=(id,hp)=>{const base=CHARACTERS.find(x=>x.id===id);assert.ok(base,id);return freshCoopFighter(base,hp===undefined?null:{hp})};
function room(three=true){
 const s=initialGameState();
 Object.assign(s,{isRoguelikeCoop:true,gameMode:'juggernaut',status:'gameover',
  players:{...s.players,p1:'Ada',p2:'Berto',p3:three?'Clara':null,p4:'Guardiano del Piano'},
  isBot:{...s.isBot,p4:true},
  settings:{...s.settings,teamSize:1,fieldSize:1,maxPlayers:4,juggernautPlayer:'p4'},
  coopRun:{floor:1,maxFloor:50,coins:10,recruitBonus:0,encounteredEnemies:[]},
  winner:three?'Ada & Berto & Clara':'Ada & Berto'});
 s.teams.p1=[fighter('gaston',75)];
 s.teams.p2=[fighter('luigi',90)];
 s.teams.p3=three?[fighter('shrek',55)]:[];
 s.teams.p4=[fighter('zuko',0)];
 s.field.p1=[0];s.field.p2=[0];s.field.p3=three?[0]:[];s.field.p4=[];
 return s;
}

test('Chart consultabile in-game: popup dedicato con tutti i 23 tipi reali',()=>{
 assert.equal(TYPES.length,23);
 const code=file('src/components/BattleTypeChartLauncher.jsx');
 const battle=file('src/screens/battle/BattlingView.jsx');
 assert.match(code,/renderTypeChartView/);
 assert.match(code,/TYPE_CHART/);
 assert.match(code,/TYPES/);
 assert.match(code,/Escape/);
 assert.match(code,/setOpen\(false\)/);
 assert.match(battle,/<BattleTypeChartLauncher\s*\/>/);
 assert.equal(TYPE_CHART['Drago']['Folletto'],0);
 assert.equal(TYPE_CHART['Fuoco']['Erba'],2);
});

test('La lobby co-op si aggiorna da Firestore, la creazione usa getPlayerData',()=>{
 const app=file('src/App.jsx'),system=file('src/systems/roguelikeSystem.js');
 const multi=file('src/systems/multiplayerSystem.js');
 assert.match(app,/appMode !== 'online_room' && appMode !== 'roguelike_coop_lobby'/);
 assert.match(system,/doc\(db, 'artifacts', appId, 'public', 'data', 'rooms'/);
 assert.match(system,/getPlayerData/);
 assert.match(multi,/appMode === 'roguelike_coop_lobby'/);
 assert.match(multi,/room\.status/);
 assert.match(app,/gameState\.status === 'drafting'/);
});

test('Tre partecipanti umani massimo, p4 è solo CPU; getActivePlayers non include gli assenti',()=>{
 const s=room();
 assert.deepEqual(COOP_HUMANS,['p1','p2','p3']);
 assert.equal(COOP_BOSS,'p4');
 assert.deepEqual(coopHumanPlayers(s),['p1','p2','p3']);
 assert.deepEqual(getActivePlayersImpl({gameState:s}),['p1','p2','p3','p4']);
 const onlyTwo=room(false);
 assert.deepEqual(coopHumanPlayers(onlyTwo),['p1','p2']);
 assert.deepEqual(getActivePlayersImpl({gameState:onlyTwo}),['p1','p2','p4']);
 const lobby=file('src/screens/roguelike/RoguelikeCoopLobbyView.jsx');
 assert.match(lobby,/startCoopDraft/);
 assert.match(file('src/App.jsx'),/prepareCoopDraft\(room,CHARACTERS\)/);
 assert.ok(!lobby.includes('draftChoices.p4'));
});

test('Avvio del draft atomico: scelte solo ai partecipanti e un nemico condiviso',()=>{
 const s=room(false);
 s.status='lobby';
 const p=prepareCoopDraft(s,CHARACTERS,()=>0);
 assert.equal(p.status,'drafting');
 assert.equal(p.draftChoices.p1.length,3);
 assert.equal(p.draftChoices.p2.length,3);
 assert.deepEqual(p.draftChoices.p3,[]);
 assert.equal(p.draft.p4.length,1);
 assert.ok(p.draft.p4[0].hp>0);
 assert.equal(s.status,'lobby','La funzione non modifica l’originale.');
 assert.throws(()=>prepareCoopDraft({...s,status:'drafting'},CHARACTERS),/lobby/);
 assert.throws(()=>prepareCoopDraft({...s,players:{...s.players,p2:null}},CHARACTERS),/due o tre/);
});

test('Un solo Multimon attivo per giocatore, senza potenziamenti Juggernaut',()=>{
 const system=file('src/systems/battleSystem.js');
 assert.match(system,/gameState\.gameMode === 'juggernaut' && !gameState\.isRoguelikeCoop/);
 assert.match(file('src/systems/roguelikeSystem.js'),/fieldSize: 1/);
 assert.match(system,/field\[p\] = teams\[p\]\.slice\(0, p === juggPlayer \? 1 : fieldSize\)/);
});

test('Reclutamento favorisce chi ha meno Multimon, senza andare oltre otto',()=>{
 const s=room();s.teams.p1.push(fighter('mario'));s.teams.p1.push(fighter('naruto'));
 s.teams.p2.push(fighter('elsa'));
 const weights=coopRecruitWeights(s);
 assert.deepEqual(weights.map(w=>w.count),[3,2,1]);
 assert.deepEqual(weights.map(w=>w.weight),[1,4,7]);
 assert.equal(chooseCoopRecruitOwner(s,()=>0),'p1');
 assert.equal(chooseCoopRecruitOwner(s,()=>.1),'p2');
 assert.equal(chooseCoopRecruitOwner(s,()=>.9),'p3');
 assert.equal(COOP_MAX_TEAM,8);
 s.teams.p3=Array.from({length:8},(_,i)=>fighter(['zuko','katara','aang','mario','luigi','elsa','natsu','gaston'][i]));
 assert.ok(coopRecruitWeights(s).every(w=>w.player!=='p3'));
});

test('Fine piano: la recluta viene assegnata una sola volta e restano PS e proprietari',()=>{
 const s=room();
 // Dopo il piano possono comparire eventi Roguelike: ciò non deve
 // annullare reclutamento, monete né proprietà dei combattenti.
 const patch=finishCoopFloor(s,CHARACTERS,()=>0);
 assert.ok(['coop_camp','coop_event'].includes(patch.status));
 assert.equal(patch.coopRun.floor,2);
 assert.equal(patch.coopRun.lastClearFloor,1);
 assert.equal(patch.coopRun.lastCoins,10);
 assert.equal(patch.coopRun.coins,20);
 assert.equal(patch.coopRun.lastRecruit.id,'zuko');
 assert.equal(patch.coopRun.lastRecruit.owner,'p1');
 assert.equal(patch.teams.p1.length,2);
 assert.equal(patch.teams.p1[0].hp,75);
 assert.equal(patch.teams.p2[0].hp,90);
 assert.equal(patch.teams.p1[1].hp,patch.teams.p1[1].maxHp);
 assert.deepEqual(coopHumanPlayers(s),['p1','p2','p3']);
 assert.throws(()=>finishCoopFloor({...s,status:'coop_camp'},CHARACTERS),/ricompensa/);
});

test('Chance reclutamento 30%, cresce del 2% dopo mancato reclutamento, torna a 30% dopo successo',()=>{
 let s=room();s.coopRun.recruitBonus=.04;
 assert.equal(coopRecruitChance(s.coopRun),.34);
 const miss=finishCoopFloor(s,CHARACTERS,()=>.99);
 assert.equal(miss.coopRun.recruitBonus,.06);
 assert.equal(miss.coopRun.lastRecruit,null);
 const win=finishCoopFloor(s,CHARACTERS,()=>0);
 assert.equal(win.coopRun.recruitBonus,0);
 assert.equal(coopRecruitChance(win.coopRun),.30);
 assert.ok(coopRecruitChance({recruitBonus:10})<=.85);
});

test('Riposo ogni 5 piani: +40% ai vivi, senza rianimare i caduti',()=>{
 const s=room();
 s.coopRun.floor=5;
 s.teams.p1[0].hp=20;
 s.teams.p2[0].hp=0;
 const x=finishCoopFloor(s,CHARACTERS,()=>.99);
 assert.equal(x.teams.p1[0].hp,20+Math.floor(x.teams.p1[0].maxHp*.4));
 assert.equal(x.teams.p2[0].hp,0);
 assert.equal(x.coopRun.floor,6);
});

test('Camp condiviso: cura 20, resurrezione 50, totale 90 e monete mai negative',()=>{
 const s=room();
 s.status='coop_camp';s.coopRun.coins=100;
 const heal=coopCampPurchase(s,CHARACTERS,'heal','p1',0);
 assert.equal(heal.coopRun.coins,80);
 assert.equal(heal.teams.p1[0].hp,Math.min(s.teams.p1[0].maxHp,75+Math.floor(s.teams.p1[0].maxHp*.5)));
 assert.equal(s.teams.p1[0].hp,75,'pure function: original untouched');
 s.teams.p2[0].hp=0;
 const revived=coopCampPurchase(s,CHARACTERS,'revive','p2',0);
 assert.equal(revived.coopRun.coins,50);
 assert.equal(revived.teams.p2[0].hp,Math.floor(s.teams.p2[0].maxHp*.5));
 const full=coopCampPurchase(s,CHARACTERS,'full','p1',0);
 assert.equal(full.coopRun.coins,10);
 assert.equal(full.teams.p1[0].hp,full.teams.p1[0].maxHp);
 assert.throws(()=>coopCampPurchase({...s,coopRun:{...s.coopRun,coins:5}},CHARACTERS,'heal','p1',0),/Monete/);
});

test('Nuovo piano: un combattente attivo per ciascuno, CPU in p4 e PS persistenti',()=>{
 const s=room();
 const camp=finishCoopFloor(s,CHARACTERS,()=>.99);
 const state={...s,...camp};
 const next=nextCoopFloor(state,CHARACTERS,null,()=>0);
 assert.equal(next.status,'pre_battle');
 assert.equal(next.coopRun.floor,2);
 assert.equal(next.teams.p1[0].hp,75);
 assert.equal(next.field.p1.length,1);
 assert.equal(next.field.p2.length,1);
 assert.equal(next.field.p3.length,1);
 assert.equal(next.field.p4.length,1);
 assert.ok(next.teams.p4[0].hp>0);
 assert.equal(next.teams.p4[0].isSummonOnly,undefined);
 assert.equal(next.teams.p4.length,1);
 assert.deepEqual(next.actions.p1,{});
 assert.deepEqual(next.actions.p4,{});
 assert.equal(next.winner,null);
 assert.equal(next.battleWeather,null);
 assert.equal(next.battleReport.turns,0);
});

test('Quando un giocatore perde il suo attivo, usa solo la sua riserva',()=>{
 const s=room();
 s.status='coop_camp';
 s.teams.p1=[fighter('mario',0),fighter('luigi',55)];
 const next=nextCoopFloor(s,CHARACTERS,null,()=>0);
 assert.deepEqual(next.field.p1,[1]);
 assert.deepEqual(next.field.p2,[0]);
 assert.deepEqual(next.field.p3,[0]);
 assert.deepEqual(next.field.p4,[0]);
});

test('Boss e nemici scalano per piano e numero di partecipanti',()=>{
 const a=coopEnemyForFloor(1,CHARACTERS,2,[],()=>0);
 const b=coopEnemyForFloor(1,CHARACTERS,3,[],()=>0);
 assert.equal(a.id,b.id);
 assert.ok(b.hp>a.hp);
 const boss=coopEnemyForFloor(10,CHARACTERS,3,[],()=>0);
 assert.equal(boss.isCoopBoss,true);
 const final=coopEnemyForFloor(COOP_MAX_FLOOR,CHARACTERS,3,[],()=>0);
 assert.equal(final.isCoopBoss,true);
 assert.ok(final.hp>boss.hp);
 assert.ok(final.moves.length>=1);
});

test('Host non può duplicare loot: transazione atomica e controlli di fase',()=>{
 const app=file('src/App.jsx');
 assert.match(app,/runTransaction\(db,async tx=>/);
 assert.match(app,/finishCoopFloor\(room,CHARACTERS\)/);
 assert.match(app,/nextCoopFloor\(room,CHARACTERS/);
 assert.match(app,/coopCampPurchase\(room,CHARACTERS/);
 assert.match(app,/!allowedStages\.includes\(room\.status\)/);
 assert.match(app,/room\.playerUids\?\.\[playerRole\]!==user\.uid/);
 assert.match(app,/isHostFresh\(room\)/);
});

test('Spiriti di Lucy: entrano dopo il reclutamento/cambio nel nuovo piano',()=>{
 const s=room();
 s.status='coop_camp';
 s.teams.p1=[fighter('lucy',85)];
 s.teams.p1[0].zodiacSpiritId='zodiac_aquarius';
 const next=nextCoopFloor(s,CHARACTERS,
  (c,p,i,teams,field,events,room)=>
    applyOnEnterPassiveImpl({CHARACTERS},c,p,i,teams,field,events,room.gameMode,room.settings,false),()=>0);
 assert.ok(next.teams.p1.some(c=>c.id==='zodiac_aquarius'&&c.isSummonOnly));
 assert.ok(next.events.some(e=>e.type==='summon'));
 assert.equal(next.field.p1.length,2,'Spirit is a summoned ally, not an extra draft character');
});

test('La Co-op non sovrascrive il salvataggio solitario',()=>{
 assert.match(file('src/App.jsx'),/multiverse_rpg_roguelike_save/);
 assert.match(file('src/App.jsx'),/coopRoomAction/);
 const mod=file('src/systems/coopExpedition.js');
 assert.ok(!mod.includes('localStorage'));
 const roomView=file('src/screens/roguelike/RoguelikeCoopCampView.jsx');
 assert.match(roomView,/Accampamento/);
 assert.match(roomView,/coopRecruitWeights/);
 assert.match(roomView,/onPurchase/);
 assert.match(roomView,/Raccogli le ricompense/);
 assert.ok(GAME_UPDATES.some(x=>x.id==='nov3-coop-roguelike-chart-battle'));
 assert.equal(GAME_UPDATES.find(x=>x.id==='nov3-coop-roguelike-chart-battle').date,'03/11/2026');
});
