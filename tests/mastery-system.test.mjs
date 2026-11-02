import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CHARACTERS } from '../src/data/characters.js';
import { FUSION_CHARACTERS } from '../src/data/fusions.js';
import { updateLocalStatsImpl } from '../src/systems/profileSystem.js';
import {
  MASTERY_MAX_LEVEL, MASTERY_MAX_XP, masteryLevel, masteryProgress, masteryRank,
  masteryTitle, isMasteryUnlocked, equippedMasteryTitle, grantMasteryXP
} from '../src/systems/masterySystem.js';

const roster = [...CHARACTERS, ...FUSION_CHARACTERS];
const allowed = new Set(roster.map(c => c.id));
const nicole = roster.find(c => c.id === 'nicole');

test('Padronanza di ogni Multimon da livello 1 fino a livello 20', () => {
  assert.equal(MASTERY_MAX_LEVEL, 20);
  assert.equal(masteryLevel(0), 1);
  assert.equal(masteryLevel(99), 1);
  assert.equal(masteryLevel(100), 2);
  assert.equal(masteryLevel(900), 10);
  assert.equal(masteryLevel(MASTERY_MAX_XP), 20);
  assert.equal(masteryLevel(999999), 20);
  assert.equal(masteryProgress(1900).percent, 100);
  assert.equal(masteryProgress(140).inLevel, 40);
  assert.equal(masteryRank(20), 'Leggendario');
});

test('PE battaglie: +40 partecipazione, +20 vittoria, niente doppioni o potenziamenti', () => {
  const old = {coins:123, stats:{atk:999}, mastery:{}};
  const next = grantMasteryXP(old, ['nicole','nicole','alphonse','wrong'], true, allowed);
  assert.equal(next.mastery.nicole, 60);
  assert.equal(next.mastery.alphonse, 60);
  assert.equal(next.mastery.wrong, undefined);
  assert.deepEqual(next.stats,old.stats);
  assert.equal(old.mastery.nicole,undefined);
  assert.equal(grantMasteryXP(next,['nicole'],false,allowed).mastery.nicole,100);
});

test('Livello 20 sblocca un titolo esclusivo e ne permette la selezione', () => {
  const nearly = {mastery:{nicole:MASTERY_MAX_XP-20}};
  assert.equal(isMasteryUnlocked(nearly,'nicole'),false);
  const complete = grantMasteryXP(nearly,['nicole'],false,allowed);
  assert.equal(complete.mastery.nicole,MASTERY_MAX_XP);
  assert.equal(complete.equippedMasteryTitle,'nicole');
  assert.equal(isMasteryUnlocked(complete,'nicole'),true);
  assert.equal(equippedMasteryTitle(complete,roster),'La Mamma Demoniaca');
  assert.equal(equippedMasteryTitle({...complete,equippedMasteryTitle:'alphonse'},roster),'');
  assert.equal(equippedMasteryTitle({...complete,equippedMasteryTitle:null},roster),'');
  assert.equal(grantMasteryXP({...complete,equippedMasteryTitle:null},['nicole'],true,allowed).equippedMasteryTitle,null);
  assert.equal(masteryTitle(nicole),'La Mamma Demoniaca');
  assert.equal(masteryTitle(roster.find(c=>c.id==='yoshi')),'Compagno dal Guscio Verde');
  assert.equal(masteryTitle(roster.find(c=>c.id==='sage')),'Guaritrice');
});

test('Salvataggi legacy e selezione titolo con profileSystem', () => {
  const saved=new Map([['multiverse_rpg_global_profile',JSON.stringify({
    matches:7,wins:3,coins:100,inventory:{pozione:1},chars:{},moves:{}
  })]]);
  const original=globalThis.localStorage;
  globalThis.localStorage={
    getItem:key=>saved.get(key)??null,
    setItem:(key,value)=>saved.set(key,value),
  };
  try {
    const ctx={getPlayerData:()=>JSON.parse(saved.get('multiverse_rpg_global_profile'))};
    updateLocalStatsImpl(ctx,{masteryIds:['nicole'],masteryWon:true});
    let player=ctx.getPlayerData();
    assert.equal(player.matches,7);
    assert.equal(player.mastery.nicole,60);
    updateLocalStatsImpl(ctx,{equipMasteryTitle:'nicole'}); // ancora bloccato
    assert.equal(ctx.getPlayerData().equippedMasteryTitle,undefined);
    for(let i=0;i<31;i++)updateLocalStatsImpl(ctx,{masteryIds:['nicole'],masteryWon:true});
    player=ctx.getPlayerData();
    assert.equal(player.mastery.nicole,MASTERY_MAX_XP);
    assert.equal(player.equippedMasteryTitle,'nicole');
    updateLocalStatsImpl(ctx,{equipMasteryTitle:null});
    assert.equal(ctx.getPlayerData().equippedMasteryTitle,null);
    updateLocalStatsImpl(ctx,{equipMasteryTitle:'alphonse'}); // non sbloccato
    assert.equal(ctx.getPlayerData().equippedMasteryTitle,null);
    updateLocalStatsImpl(ctx,{equipMasteryTitle:'nicole'});
    assert.equal(ctx.getPlayerData().equippedMasteryTitle,'nicole');
  } finally { globalThis.localStorage=original; }
});

test('I PE sono assegnati al gameover, le nuove schermate mostrano il titolo sotto il nome',()=>{
  const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
  const profile=readFileSync(new URL('../src/screens/hub/StatsView.jsx',import.meta.url),'utf8');
  const menu=readFileSync(new URL('../src/screens/hub/MenuView.jsx',import.meta.url),'utf8');
  const battle=readFileSync(new URL('../src/screens/battle/BattlingView.jsx',import.meta.url),'utf8');
  const event=readFileSync(new URL('../src/screens/events/MultiverseEventHub.jsx',import.meta.url),'utf8');
  assert.match(app,/filter\(c => c && c\.revealed && !c\.isSummonOnly\)/);
  assert.match(app,/statsUpdates\.masteryIds = masteryIds/);
  assert.match(profile,/Livello \{progress\.level\}\/20/);
  assert.match(profile,/equipMasteryTitle:char\.id/);
  assert.match(menu,/playerTitle &&/);
  assert.match(battle,/gameState\.playerTitles\?\.\[p\]/);
  assert.match(event,/masteryIds:mine\.teamIds/);
});
