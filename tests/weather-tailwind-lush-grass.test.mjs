import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {MOVES_DB} from '../src/data/moves.js';
import {CHARACTERS} from '../src/data/characters.js';
import {tryStartRainstorm,weatherMoveFactor} from '../src/systems/rainstorm.js';
import {snowstormOutcome} from '../src/systems/championEffects.js';
import {
  TAILWIND_TURNS,TAILWIND_SPEED_FACTOR,LUSH_GRASS_TURNS,
  isLushGrass,lushGrassDamageFactor,lushGrassHeal,tailwindAllies,
  startTailwind,tailwindSpeedFactor,advanceTailwind
} from '../src/systems/battleFieldEffects.js';

const ch=id=>CHARACTERS.find(c=>c.id===id);
const m=name=>MOVES_DB[name];
const moves=id=>ch(id).moves.map(x=>x.name);
const source=(path)=>readFileSync(new URL(path,import.meta.url),'utf8');

test('Juvia: Colpo Impetuoso ha 35% di generare Tempesta dopo un colpo riuscito',()=>{
 assert.equal(m('Colpo impetuoso').rainstormChance,.35);
 assert.equal(tryStartRainstorm(m('Colpo impetuoso'),true,()=>.34),true);
 assert.equal(tryStartRainstorm(m('Colpo impetuoso'),true,()=>.35),false);
 assert.equal(tryStartRainstorm(m('Colpo impetuoso'),false,()=>.1),false);
 assert.ok(moves('juvia').includes('Colpo impetuoso'));
});
test('Lapis: Torre d’Acqua attiva Tempesta nel 60% dei casi senza togliere Ricarica',()=>{
 assert.equal(m("Torre d'Acqua").rainstormChance,.60);
 assert.equal(m("Torre d'Acqua").power,120);
 assert.equal(m("Torre d'Acqua").recharge,true);
 assert.equal(tryStartRainstorm(m("Torre d'Acqua"),true,()=>.59),true);
 assert.equal(tryStartRainstorm(m("Torre d'Acqua"),true,()=>.6),false);
 assert.ok(moves('lapis').includes("Torre d'Acqua"));
});
test('Katara: Gabbia di Ghiaccio 80 danni, due bersagli, gelo al 25% ciascuno',()=>{
 assert.equal(m('Gabbia di Ghiaccio').power,80);
 assert.equal(m('Gabbia di Ghiaccio').targetCount,2);
 assert.deepEqual(m('Gabbia di Ghiaccio').statusEffect,{type:'Congelato',chance:.25});
 assert.ok(moves('katara').includes('Gabbia di Ghiaccio'));
});
test('Jack Frost: Vento Invernale colpisce 2, Aura Glaciale avvia Tailwind senza buff permanente',()=>{
 assert.equal(m('Vento Invernale').targetCount,2);
 assert.equal(m('Vento Invernale').power,70);
 assert.equal(m('Aura Glaciale').power,0);
 assert.equal(m('Aura Glaciale').tailwindTurns,5);
 assert.equal(m('Aura Glaciale').target, 'self');
 assert.equal(m('Aura Glaciale').targetStatBuff,undefined);
 assert.ok(moves('jackfrost').includes('Aura Glaciale'));
});
test('Tailwind: +30% all’iniziativa di tutti gli alleati, anche riserve entrate dopo',()=>{
 assert.equal(TAILWIND_TURNS,5);
 assert.equal(TAILWIND_SPEED_FACTOR,1.3);
 const t=startTailwind({},'p1','multipla',{},['p1','p2','p3','p4']);
 assert.deepEqual(t,{p1:5,p2:5});
 assert.equal(tailwindSpeedFactor(t,'p2'),1.3);
 assert.equal(tailwindSpeedFactor(t,'p3'),1);
 assert.equal(Math.floor(100*tailwindSpeedFactor(t,'p2')),130);
 assert.equal(tailwindSpeedFactor(t,'p2'),1.3,'Nuovo combattente mantiene l’effetto perché è legato al ruolo, non al Multimon');
 let current=t;
 for(let i=0;i<4;i++)current=advanceTailwind(current);
 assert.deepEqual(current,{p1:1,p2:1});
 current=advanceTailwind(current);
 assert.deepEqual(current,{},'tailwind scade al quinto turno');
 assert.equal(tailwindSpeedFactor(current,'p2'),1);
});
test('Tailwind in Roguelike Co-op copre tutti i giocatori, non il boss',()=>{
 const allies=tailwindAllies('p2','juggernaut',{juggernautPlayer:'p4'},['p1','p2','p3','p4']);
 assert.deepEqual(allies,['p1','p2','p3']);
 const effect=startTailwind({},'p2','juggernaut',{juggernautPlayer:'p4'},['p1','p2','p3','p4']);
 assert.deepEqual(effect,{p1:5,p2:5,p3:5});
 assert.equal(tailwindSpeedFactor(effect,'p4'),1);
 assert.deepEqual(startTailwind({},'p4','juggernaut',{juggernautPlayer:'p4'},['p1','p2','p3','p4']),{p4:5});
});
test('Tailwind appena lanciato dura cinque turni completi e non prolunga il vento nemico',()=>{
 const ongoing={p3:2,p4:2};
 const wind=startTailwind(ongoing,'p1','multipla',{},['p1','p2','p3','p4']);
 assert.deepEqual(wind,{p3:2,p4:2,p1:5,p2:5});
 const afterTurn=advanceTailwind(wind,new Set(['p1','p2']));
 assert.deepEqual(afterTurn,{p3:1,p4:1,p1:5,p2:5});
 let next=afterTurn;
 for(let i=0;i<5;i++)next=advanceTailwind(next);
 assert.deepEqual(next,{});
 const engine=source('../src/systems/battleSystem.js');
 assert.match(engine,/advanceTailwind\(workingTailwind,tailwindJustActivated\)/);
 assert.match(engine,/tailwindAllies\(player,gameState.gameMode,gameState.settings,potentialAllies\)/);
});
test('Elsa: 10% per Tempesta di Neve, gelo precedente del 15% conservato',()=>{
 assert.equal(m('Gelo Eterno').snowstormChance,.10);
 assert.equal(m('Gelo Eterno').statusEffect.chance,.15);
 assert.equal(m('Gelo Eterno').power,95);
 assert.ok(moves('elsa').includes('Gelo Eterno'));
});
test('Erba Rigogliosa: Juruku e Splendete mie piante attivano il nuovo meteo',()=>{
 assert.equal(m('Juruku').lushGrassTurns,5);
 assert.equal(m('Juruku').target,'self');
 assert.ok(moves('sugino').includes('Juruku'));
 assert.ok(moves('poisonivy').includes('Splendete, mie piante!'));
 assert.ok(!moves('poisonivy').includes('Fascino Botanico'));
 assert.equal(m('Splendete, mie piante!').lushGrassTurns,5);
 assert.equal(LUSH_GRASS_TURNS,5);
 assert.equal(isLushGrass({type:'lush_grass',turns:5}),true);
});
test('Erba Rigogliosa cura 5% PS a qualsiasi Multimon Erba vivo e aumenta Erba del 20%',()=>{
 const w={type:'lush_grass',turns:5};
 const ivy={name:'Poison Ivy',types:['Veleno','Erba'],hp:65,maxHp:105};
 const enemy={name:'Albero',types:['Erba'],hp:0,maxHp:100};
 const ally={name:'Luffy',types:['Lotta','Magico'],hp:80,maxHp:100};
 assert.equal(lushGrassHeal(ivy,w),5);
 assert.equal(ivy.hp,70);
 assert.equal(lushGrassHeal(enemy,w),0);
 assert.equal(lushGrassHeal(ally,w),0);
 assert.equal(lushGrassDamageFactor({type:'Erba',power:75},w),1.2);
 assert.equal(weatherMoveFactor({type:'Erba',power:75},w),1.2);
 assert.equal(weatherMoveFactor({type:'Fuoco',power:75},w),1);
 assert.equal(weatherMoveFactor({type:'Erba',power:75},{type:'rainstorm',turns:5}),1);
 assert.equal(lushGrassHeal(ivy,{type:'lush_grass',turns:0}),0);
 const full={types:['Erba'],hp:99,maxHp:100};
 assert.equal(lushGrassHeal(full,w),1,'non si cura oltre PS massimi');
});
test('Motore, UI, introduzione Co-op ed Enciclopedia sono collegati alle nuove condizioni',()=>{
 const engine=source('../src/systems/battleSystem.js');
 const arena=source('../src/screens/battle/BattlingView.jsx');
 const codex=source('../src/components/BattleCodex.jsx');
 const coop=source('../src/systems/coopExpedition.js');
 assert.match(engine,/battleTailwind: workingTailwind/);
 assert.match(engine,/tailwindSpeedFactor\(workingTailwind,player\)/);
 assert.match(engine,/lushGrassHeal\(char,workingWeather\)/);
 assert.match(engine,/move\.snowstormChance && Math\.random\(\)<move\.snowstormChance/);
 assert.match(engine,/tryStartRainstorm\(move,attackSucceeded\)/);
 assert.match(arena,/battlefield-lush-grass/);
 assert.match(arena,/TAILWIND/);
 assert.match(codex,/\['weather','🌦️','Meteo e campi'\]/);
 assert.match(codex,/m\.rainstormChance\|\|m\.snowstormTurns/);
 assert.match(coop,/battleTailwind:\{\}/);
 assert.match(source('../src/systems/gameState.js'),/battleTailwind: \{\}/);
});
