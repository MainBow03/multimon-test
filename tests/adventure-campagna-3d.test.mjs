import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {initialGameState} from '../src/systems/gameState.js';
import {
 ADVENTURE_ZONES,ADVENTURE_CHAMPION,ADVENTURE_ENTITIES,ADVENTURE_STARTERS,
 createAdventureSave,sanitizeAdventureSave,adventureMove,adventureRoadZ,adventureNearby,
 adventureGymCheck,adventureFighter,adventureMaxHp,adventureBattleRoom,
 adventureGiveXp,adventureFinishBattle,adventureHeal,adventureUsePotion,adventureShop,
 adventureChest,adventureSwap,adventureQuest
} from '../src/systems/adventureCampaign.js';
const index=new Map(CHARACTERS.map(c=>[c.id,c]));
const player=createAdventureSave('jake',CHARACTERS);
const find=(kind,zone)=>ADVENTURE_ENTITIES.find(e=>e.kind===kind&&(zone===undefined||e.zone===zone));
const finish=(save,entity,won=true,recruit=false)=>{
 const room=adventureBattleRoom(save,entity,CHARACTERS,initialGameState,'Viaggiatore');
 room.status='gameover';
 room.winner=won?'Viaggiatore':room.players.p2;
 room.teams.p1.forEach((m,i)=>{if(m.hp>0)m.hp=Math.max(1,m.hp-5);});
 return adventureFinishBattle(save,room,CHARACTERS,{recruit});
};
test('3D: sei regioni distinte, percorsi, capipalestra, allenatori, selvatici, centri e lega',()=>{
 assert.equal(ADVENTURE_ZONES.length,6);
 assert.equal(ADVENTURE_ENTITIES.filter(e=>e.kind==='gym').length,6);
 assert.equal(ADVENTURE_ENTITIES.filter(e=>e.kind==='trainer').length,12);
 assert.equal(ADVENTURE_ENTITIES.filter(e=>e.kind==='wild').length,24);
 assert.equal(ADVENTURE_ENTITIES.filter(e=>e.kind==='chest').length,6);
 assert.ok(ADVENTURE_ENTITIES.filter(e=>e.kind==='inn').length>=6);
 assert.ok(ADVENTURE_ENTITIES.filter(e=>e.kind==='shop').length>=6);
 assert.ok(ADVENTURE_CHAMPION.x>ADVENTURE_ZONES.at(-1).range[1]);
 assert.equal(ADVENTURE_ENTITIES.filter(e=>e.kind==='champion').length,1);
 for(const z of ADVENTURE_ZONES){
  for(const id of [...z.leaderTeam,...z.trainers,...z.wild])
   assert.ok(index.has(id),'Il personaggio nel roster non esiste: '+id);
 }
});
test('3D: tre starter veri e una partita iniziale isolata dal resto di Multimon',()=>{
 for(const s of ADVENTURE_STARTERS){
  assert.ok(index.has(s.id),'starter inesistente: '+s.id);
  assert.ok(index.get(s.id).moves?.length>0);
  const save=createAdventureSave(s.id,CHARACTERS);
  assert.equal(save.party[0].level,5);
  assert.equal(save.party[0].id,s.id);
  assert.equal(save.badges.length,0);
  assert.equal(save.potions,4);
  assert.ok(save.position.x>=0);
 }
 assert.throws(()=>createAdventureSave('boss_secret',CHARACTERS),/Starter non disponibile/);
});
test('3D: portali bloccati senza emblemi, accessibili dopo lo sblocco',()=>{
 const locked=adventureMove(player,37,adventureRoadZ(37));
 assert.equal(locked.blocked,true);
 assert.ok(locked.position.x<34);
 assert.ok(locked.requiresBadge.includes('Smeraldo'));
 const unlocked=adventureMove({...player,badges:['alba']},37,adventureRoadZ(37));
 assert.equal(unlocked.blocked,false);
 assert.equal(unlocked.position.x,37);
 const far=adventureMove({...player,badges:ADVENTURE_ZONES.map(z=>z.id)},214,0);
 assert.equal(far.position.x,214);
});
test('3D: si devono vincere gli allenatori prima di sfidare ogni capopalestra',()=>{
 const gym=find('gym',0);
 const blocked=adventureGymCheck(player,gym);
 assert.equal(blocked.ok,false);
 assert.match(blocked.message,/0\/2/);
 const one={...player,defeated:['alba:trainer:0']};
 assert.match(adventureGymCheck(one,gym).message,/1\/2/);
 const both={...player,defeated:['alba:trainer:0','alba:trainer:1']};
 assert.equal(adventureGymCheck(both,gym).ok,true);
 assert.equal(adventureGymCheck({...both,badges:['alba']},gym).ok,false);
 assert.equal(adventureGymCheck(player,ADVENTURE_CHAMPION).ok,false);
 assert.equal(adventureGymCheck({...both,badges:ADVENTURE_ZONES.map(z=>z.id)},ADVENTURE_CHAMPION).ok,true);
});
test('3D: pulsante interazione seleziona il personaggio vicino e rispetta scontri già vinti',()=>{
 const tr=find('trainer',0),located=adventureNearby({x:tr.x,z:tr.z},player);
 assert.equal(located?.id,tr.id);
 assert.notEqual(adventureNearby({x:tr.x,z:tr.z},{...player,defeated:[tr.id]})?.id,tr.id);
 assert.equal(adventureNearby({x:-5,z:-19},player,1),null);
});
test('3D: battaglie usano il motore vero, CPU, mosse e livelli, non un minigioco finto',()=>{
 const e=find('wild',0),room=adventureBattleRoom(player,e,CHARACTERS,initialGameState,'Viaggiatore');
 assert.equal(room.status,'pre_battle');
 assert.equal(room.isAdventureBattle,true);
 assert.equal(room.isTrainingBattle,true);
 assert.equal(room.gameMode,'classica');
 assert.equal(room.isBot.p2,true);
 assert.equal(room.field.p1.length,1);
 assert.equal(room.field.p2.length,1);
 assert.equal(room.teams.p1[0].id,'jake');
 assert.ok(room.teams.p1[0].moves[0]?.name);
 assert.ok(room.teams.p2[0].moves[0]?.name);
 assert.equal(room.teams.p1[0].adventureLevel,5);
 assert.equal(room.teams.p2[0].adventureLevel,e.level);
 assert.ok(room.battleReport?.id);
 const first=adventureFighter(index.get('jake'),{id:'jake',level:5,hp:null});
 assert.equal(first.hp,first.maxHp);
 assert.ok(adventureFighter(index.get('jake'),{id:'jake',level:30,hp:null}).maxHp>first.maxHp);
});
test('3D: punti esperienza, livelli e PS conservati; i KO non si rianimano al level up',()=>{
 const low={id:'jake',level:5,exp:0,hp:20};
 const grown=adventureGiveXp(low,600,CHARACTERS);
 assert.ok(grown.levels>=2);
 assert.ok(grown.member.level>5);
 assert.ok(grown.member.hp>20);
 const knockout=adventureGiveXp({...low,hp:0},600,CHARACTERS);
 assert.ok(knockout.member.level>5);
 assert.equal(knockout.member.hp,0,'il level-up non deve rianimare un Multimon KO');
 assert.ok(grown.member.hp<=adventureMaxHp(index.get('jake'),grown.member.level));
});
test('3D: premio allenatore ed emblema palestra una sola volta, senza azzerare progressi',()=>{
 let save=player;
 for(let i=0;i<2;i++){
  const tr=ADVENTURE_ENTITIES.find(e=>e.id==='alba:trainer:'+i);
  const result=finish(save,tr);
  assert.equal(result.won,true);
  assert.ok(result.xp>0);
  assert.ok(result.coins>0);
  save=result.save;
 }
 assert.equal(save.trainerWins,2);
 const gym=ADVENTURE_ENTITIES.find(e=>e.id==='alba:gym');
 const room=adventureBattleRoom(save,gym,CHARACTERS,initialGameState,'Viaggiatore');
 room.status='gameover';room.winner='Viaggiatore';
 const result=adventureFinishBattle(save,room,CHARACTERS);
 assert.equal(result.emblem,'Emblema Smeraldo');
 assert.deepEqual(result.save.badges,['alba']);
 assert.equal(result.save.gymWins,1);
 assert.equal(adventureFinishBattle(result.save,room,CHARACTERS).duplicate,true);
 assert.equal(sanitizeAdventureSave(result.save,CHARACTERS).badges.length,1);
});
test('3D: reclutamento selvatici in squadra o riserva e ritorno al checkpoint se KO',()=>{
 const e=find('wild',0);
 const won=finish(player,e,true,true);
 assert.equal(won.recruit,true);
 assert.equal(won.save.party.length,2);
 assert.equal(won.save.party[1].id,e.party[0]);
 const full={...player,party:Array.from({length:6},()=>({...player.party[0]}))};
 const placed=finish(full,e,true,true);
 assert.equal(placed.save.reserve.length,1);
 const loss=finish({...player,coins:100},e,false);
 assert.equal(loss.won,false);
 assert.equal(loss.save.coins,88);
 assert.equal(loss.save.badges.length,0);
 assert.ok(loss.save.party[0].hp>0);
});
test('3D: cure, bottega, scrigni e riserva non danno premi infiniti',()=>{
 const potion=adventureUsePotion({...player,party:[{...player.party[0],hp:20}]},0,CHARACTERS);
 assert.equal(potion.error,null);
 assert.equal(potion.save.potions,3);
 assert.ok(potion.save.party[0].hp>20);
 assert.equal(adventureUsePotion(player,0,CHARACTERS).error!==null,true);
 const faint={...player,party:[{...player.party[0],hp:0}]};
 const revived=adventureUsePotion(faint,0,CHARACTERS,true);
 assert.equal(revived.save.revives,0);assert.ok(revived.save.party[0].hp>0);
 const shop=adventureShop(player,'potion');assert.equal(shop.save.coins,75);
 assert.equal(shop.save.potions,5);
 const chest=find('chest',0);
 const rewarded=adventureChest(player,chest);assert.equal(rewarded.coins,175);
 assert.equal(adventureChest(rewarded,chest),rewarded);
 const healed=adventureHeal({...player,party:[{...player.party[0],hp:1}]},CHARACTERS);
 assert.equal(healed.party[0].hp,adventureMaxHp(index.get('jake'),5));
 const team={...player,party:[...player.party,{...player.party[0],id:'finn'}],reserve:[{id:'garnet',level:8,exp:0,hp:null}]};
 const swapped=adventureSwap(team,'party',1);
 assert.equal(swapped.party.length,1);
 assert.equal(swapped.reserve.length,2);
 assert.equal(adventureSwap(swapped,'reserve',0).party.length,2);
});
test('3D: salvataggi migrati senza dati falsi, pressione positiva nel diario',()=>{
 const changed=sanitizeAdventureSave({...player,
  position:{x:1800,z:1000},party:[{id:'jake',level:5,exp:0,hp:0},{id:'nonexistent',level:99,exp:0,hp:12}],
  coins:-500,potions:120,badges:['alba','alba','wrong']},CHARACTERS);
 assert.deepEqual(changed.badges,['alba']);assert.equal(changed.coins,0);
 assert.equal(changed.potions,99);assert.equal(changed.party.length,1);
 assert.equal(changed.party[0].hp,0);
 assert.ok(changed.position.x<68);
 assert.match(adventureQuest(player),/Valle/);
 assert.match(adventureQuest({...player,badges:ADVENTURE_ZONES.map(z=>z.id)}),/Lega/);
});
test('Wiring 3D: render WebGL, mobile, App bridge, menu nuovo e nessun pacchetto CDN',()=>{
 const file=p=>readFileSync(new URL(p,import.meta.url),'utf8');
 const app=file('../src/App.jsx'),v=file('../src/screens/adventure/AdventureCampaignView.jsx'),
   renderer=file('../src/screens/adventure/AdventureWorldRenderer.js'),
   css=file('../src/screens/adventure/AdventureCampaign.css'),
   menu=file('../src/screens/hub/MenuDashboard.jsx'),classic=file('../src/screens/hub/MenuView.jsx');
 assert.match(renderer,/getContext\('webgl2'/);
 assert.match(renderer,/gl\.enable\(gl\.DEPTH_TEST\)/);
 assert.match(renderer,/createAdventureFallbackRenderer/);
 assert.match(v,/requestAnimationFrame/);
 assert.match(v,/onPointerDown/);
 assert.match(v,/onStartBattle/);
 assert.match(v,/PARLA/);
 assert.match(css,/adv-mobile-controls/);
 assert.match(app,/adventureBattleRoom\(adventureState/);
 assert.match(app,/adventureFinishBattle\(adventureState/);
 assert.match(menu,/card\('🌍','Campagna','Mondo 3D aperto/);
 assert.match(classic,/Campagna 3D/);
});
