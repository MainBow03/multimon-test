import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {initialGameState} from '../src/systems/gameState.js';
import {buildAdventureMesh} from '../src/screens/adventure/AdventureWorldRenderer.js';
import {ADVENTURE_STORY,ADVENTURE_RIVAL_ZONES,adventureNextStoryScene,adventureMarkStorySeen}
 from '../src/data/adventureStory.js';
import {
 ADVENTURE_ZONES,ADVENTURE_ENTITIES,createAdventureSave,sanitizeAdventureSave,
 adventureNextObjective,adventureGuide,adventureGymCheck,adventureBattleRoom,
 adventureFinishBattle,adventureRetreat,adventureHeal,adventureShop,adventureSwap
} from '../src/systems/adventureCampaign.js';

const starter=createAdventureSave('jake',CHARACTERS);
const byId=id=>ADVENTURE_ENTITIES.find(e=>e.id===id);
const defeatedTrainers=zone=>ADVENTURE_ENTITIES.filter(e=>e.kind==='trainer'&&e.zone===zone).map(e=>e.id);
test('Storia 3D: sei capitoli, sei epiloghi e un finale unico coerente',()=>{
 assert.equal(ADVENTURE_ZONES.length,6);
 for(const z of ADVENTURE_ZONES){
  for(const prefix of ['arrival','badge']){
   const scene=ADVENTURE_STORY[prefix+':'+z.id];
   assert.ok(scene?.title);
   assert.ok(scene.lines.length>=3,'Poche battute: '+prefix+':'+z.id);
   assert.ok(scene.lines.every(l=>l.speaker&&l.text.length>25));
  }
 }
 assert.ok(ADVENTURE_STORY.ending.lines.length>=4);
 assert.ok(ADVENTURE_STORY.ending.lines.some(l=>l.speaker==='Iris'));
 const joined=Object.values(ADVENTURE_STORY).flatMap(s=>s.lines.map(l=>l.text)).join(' ');
 assert.match(joined,/sovraccarico/i);
 assert.match(joined,/speg|chius|isola/i);
 assert.match(joined,/sincroni/i);
});
test('Storia: scene una volta sola e riprendibili nel salvataggio',()=>{
 let save={...starter,welcomed:true};
 let scene=adventureNextStoryScene(save,'alba');
 assert.equal(scene.id,'arrival:alba');
 save=adventureMarkStorySeen(save,scene.id);
 assert.equal(adventureNextStoryScene(save,'alba'),null);
 const noChange=adventureMarkStorySeen(save,'arrival:alba');
 assert.equal(noChange,save);
 save={...save,badges:['alba']};
 assert.equal(adventureNextStoryScene(save,'braci').id,'badge:alba');
 save=adventureMarkStorySeen(save,'badge:alba');
 assert.equal(adventureNextStoryScene(save,'braci').id,'arrival:braci');
 const finished={...save,finished:true};
 assert.equal(adventureNextStoryScene(finished,'braci').id,'ending');
});
test('Upgrade non distruttivo: le vecchie avventure mantengono emblemi e PS senza riaprire i capitoli già superati',()=>{
 const legacy={...starter,badges:['alba','braci'],storySeen:undefined,
  position:{x:75,z:1},party:[{id:'jake',level:18,exp:44,hp:0}],
  coins:912,potions:6};
 const m=sanitizeAdventureSave(legacy,CHARACTERS);
 assert.equal(m.coins,912);
 assert.equal(m.party[0].hp,0);
 assert.equal(m.party[0].level,18);
 assert.equal(m.position.x,75);
 assert.deepEqual(m.badges,['alba','braci']);
 for(const id of ['alba','braci']){
  assert.ok(m.storySeen.includes('arrival:'+id));
  assert.ok(m.storySeen.includes('badge:'+id));
 }
 assert.equal(adventureNextStoryScene({...m,welcomed:true},'cascate').id,'arrival:cascate');
 const broken=sanitizeAdventureSave({...starter,badges:42,defeated:{bad:1},chests:'none',storySeen:8},CHARACTERS);
 assert.deepEqual(broken.badges,[]);
 assert.deepEqual(broken.defeated,[]);
 assert.deepEqual(broken.chests,[]);
});
test('Percorsi: tre veri scontri con Nox e accesso alla Palestra solo dopo gli allenatori e Nox',()=>{
 assert.deepEqual(ADVENTURE_RIVAL_ZONES,[1,3,5]);
 const rivals=ADVENTURE_ENTITIES.filter(e=>e.kind==='rival');
 assert.equal(rivals.length,3);
 for(const i of ADVENTURE_RIVAL_ZONES){
  const zone=ADVENTURE_ZONES[i],rival=rivals.find(e=>e.zone===i);
  const gym=byId(zone.id+':gym');
  assert.ok(rival.party.length>=2);
  for(const id of rival.party)assert.ok(CHARACTERS.some(c=>c.id===id),'Nox usa un personaggio inesistente: '+id);
  const ready={...starter,badges:ADVENTURE_ZONES.slice(0,i).map(z=>z.id),defeated:defeatedTrainers(i)};
  assert.match(adventureGymCheck(ready,gym).message,/Nox/);
  assert.equal(adventureNextObjective(ready).id,rival.id);
  const fight=adventureBattleRoom(ready,rival,CHARACTERS,initialGameState,'Viaggiatore');
  assert.equal(fight.isAdventureBattle,true);
  assert.equal(fight.cpuStyles.p2,'tactical');
  fight.status='gameover';fight.winner=fight.players.p1;
  const claimed=adventureFinishBattle(ready,fight,CHARACTERS);
  assert.equal(claimed.won,true);
  assert.ok(claimed.save.defeated.includes(rival.id));
  assert.equal(claimed.save.rivalWins,1);
  assert.equal(adventureGymCheck(claimed.save,gym).ok,true);
  assert.equal(adventureNextObjective(claimed.save).id,gym.id);
  assert.throws(()=>adventureBattleRoom(claimed.save,rival,CHARACTERS,initialGameState),/già stato sconfitto/);
 }
});
test('Navigatore indica sempre la prossima sfida reale, senza far cercare a caso',()=>{
 const first=adventureNextObjective(starter);
 assert.equal(first.id,'alba:trainer:0');
 const info=adventureGuide(starter);
 assert.equal(info.target.id,first.id);
 assert.ok(info.distance>0);
 assert.match(info.tip,/strada chiara/);
 const firstWin={...starter,defeated:['alba:trainer:0']};
 assert.equal(adventureNextObjective(firstWin).id,'alba:trainer:1');
 const twoWins={...firstWin,defeated:defeatedTrainers(0)};
 assert.equal(adventureNextObjective(twoWins).id,'alba:gym');
 assert.equal(adventureGuide(twoWins).target.kind,'gym');
 const league={...starter,badges:ADVENTURE_ZONES.map(z=>z.id)};
 assert.equal(adventureNextObjective(league).kind,'champion');
 assert.match(adventureGuide(league).tip,/sesto portale/);
 assert.equal(adventureNextObjective({...league,finished:true}).kind,'complete');
});
test('Abbandonare una lotta applica la penalità e torna al Centro invece di cancellare i danni',()=>{
 const encounter=byId('alba:trainer:0');
 const room=adventureBattleRoom(starter,encounter,CHARACTERS,initialGameState,'Viaggiatore');
 room.teams.p1[0].hp=1;
 const retreated=adventureRetreat({...starter,coins:200},room,CHARACTERS);
 assert.equal(retreated.coins,176);
 assert.equal(retreated.position.x,5);
 assert.equal(retreated.badges.length,0);
 assert.ok(retreated.party[0].hp>0);
 assert.equal(retreated.travelSerial,1);
 assert.equal(retreated.lastBattleId,room.battleReport.id);
 const again=adventureRetreat(retreated,room,CHARACTERS);
 assert.equal(again,retreated,'niente penalità doppie sui reload');
});
test('Centro di Cura guarisce squadra e riserva, anche se uno è a zero PS',()=>{
 const depleted={...starter,party:[{id:'jake',level:12,exp:0,hp:0}],
  reserve:[{id:'garnet',level:20,exp:0,hp:1}]};
 const recovered=adventureHeal(depleted,CHARACTERS);
 assert.ok(recovered.party[0].hp>0);
 assert.ok(recovered.reserve[0].hp>1);
 assert.equal(depleted.party[0].hp,0,'non modificare il salvataggio originale');
});
test('Gestione inventario: nessuna capienza oltre 99 e riserva massima 24',()=>{
 const full={...starter,coins:1000,potions:99};
 assert.match(adventureShop(full,'potion').error,/99/);
 const oneMore={...starter,party:[...starter.party,{id:'finn',level:6,exp:0,hp:30}],
  reserve:Array.from({length:24},()=>({id:'garnet',level:9,exp:0,hp:null}))};
 assert.equal(adventureSwap(oneMore,'party',1),oneMore);
});
test('Mondo 3D V2: geometria valida, monumenti regionali, nav beacon, più città e NPC',()=>{
 assert.equal(ADVENTURE_ENTITIES.filter(e=>e.kind==='npc').length>=7,true);
 const mesh=buildAdventureMesh(starter);
 assert.ok(mesh instanceof Float32Array);
 assert.equal(mesh.length%27,0);
 assert.ok(mesh.length>230000,'servono monumenti e dettagli 3D, non un semplice fondale');
 for(let i=0;i<mesh.length;i++)assert.ok(Number.isFinite(mesh[i]),'mesh non valida al vertice '+i);
 const after=buildAdventureMesh({...starter,defeated:['alba:trainer:0'],badges:['alba']});
 assert.notEqual(after.length,mesh.length,'il mondo deve riflettere le vittorie e il portale aperto');
});
test('Interfaccia: scene narrative, guide, supporto mobile e ritiri collegati ad App',()=>{
 const file=p=>readFileSync(new URL(p,import.meta.url),'utf8');
 const view=file('../src/screens/adventure/AdventureCampaignView.jsx');
 const app=file('../src/App.jsx');
 const css=file('../src/screens/adventure/AdventureCampaign.css');
 const render=file('../src/screens/adventure/AdventureWorldRenderer.js');
 assert.match(view,/adventureNextStoryScene/);
 assert.match(view,/adventureMarkStorySeen/);
 assert.match(view,/adv-route-guide/);
 assert.match(view,/adv-story-modal/);
 assert.match(view,/adv-route-progress/);
 assert.match(view,/onPosition=/);
 assert.match(view,/keys\.clear\(\)/);
 assert.match(view,/onPointerDown/);
 assert.match(app,/adventureRetreat/);
 assert.match(css,/adv-story-modal/);
 assert.match(css,/adv-route-guide/);
 assert.match(render,/biomeLandmarks/);
 assert.match(render,/adventureObjectiveBeacon/);
 assert.match(render,/uniform vec3 uFogColor/);
});
