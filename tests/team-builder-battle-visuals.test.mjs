import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { filterTeamRoster, getCharacterRoles, characterPrice } from '../src/systems/teamBuilderFilters.js';
import { CHARACTERS } from '../src/data/characters.js';

const r=(a,b)=>readFileSync(new URL(a,import.meta.url),'utf8').includes(b);
test('filtri del team builder: ricerca, tipo, costo, ruolo e preferiti',()=>{
  const roster=[
    {id:'tank',name:'Guardia',types:['Roccia'],atk:75,def:130,maxHp:125,spd:40,price:100,moves:[]},
    {id:'fire',name:'Fiamma',types:['Fuoco'],atk:135,def:65,maxHp:80,spd:115,price:350,moves:[{power:120}]},
    {id:'support',name:'Medico',types:['Acqua'],atk:70,def:65,maxHp:95,spd:100,price:200,moves:[{heal:.5,target:'self'},{targetMode:'ally',targetStatBuff:{def:1.3}}]}
  ];
  assert.deepEqual(filterTeamRoster(roster,{type:'Fuoco'}).map(c=>c.id),['fire']);
  assert.deepEqual(filterTeamRoster(roster,{search:'MED'}).map(c=>c.id),['support']);
  assert.deepEqual(filterTeamRoster(roster,{role:'tank'}).map(c=>c.id),['tank']);
  assert.deepEqual(filterTeamRoster(roster,{role:'healer'}).map(c=>c.id),['support']);
  assert.deepEqual(filterTeamRoster(roster,{role:'support'}).map(c=>c.id),['support']);
  assert.deepEqual(filterTeamRoster(roster,{price:'premium'}).map(c=>c.id),['fire']);
  assert.deepEqual(filterTeamRoster(roster,{favoritesOnly:true,favorites:['tank','fire']}).map(c=>c.id),['tank','fire']);
  assert.deepEqual(filterTeamRoster(roster,{sort:'price_desc'}).map(c=>c.id),['fire','support','tank']);
  assert.deepEqual(filterTeamRoster(roster,{sort:'speed'}).map(c=>c.id),['fire','support','tank']);
  assert.deepEqual(filterTeamRoster(roster,{role:'healer',type:'Fuoco'}),[]);
});
test('i ruoli sono suggerimenti calcolati dalle mosse, non modificano i personaggi',()=>{
  const nicole=CHARACTERS.find(c=>c.id==='nicole');
  const originalMoves=nicole.moves.length;
  const roles=getCharacterRoles(nicole);
  assert.ok(roles.includes('attacker'));
  assert.equal(nicole.moves.length,originalMoves);
  assert.ok(characterPrice(nicole)>0);
});
test('ricerca e preferiti non alterano la logica di selezione dei giocatori',()=>{
  assert.ok(r('../src/screens/battle/DraftingView.jsx','filterTeamRoster(draftableChars'));
  assert.ok(r('../src/screens/battle/DraftingView.jsx','toggleDraftFavorite(char.id)'));
  assert.ok(r('../src/screens/battle/DraftingView.jsx','handlePick(char)'));
  assert.ok(r('../src/App.jsx','multimon_team_favorites_v1'));
});
test('status completi, modifiche alle statistiche e passive restano nel renderer condiviso',()=>{
  const view=readFileSync(new URL('../src/screens/battle/BattlingView.jsx',import.meta.url),'utf8');
  const badges=readFileSync(new URL('../src/components/BattleStatusBadges.jsx',import.meta.url),'utf8');
  assert.match(view,/<BattleStatusBadges character=\{char\}/);
  assert.match(badges,/baseAtk/);
  assert.match(badges,/statusName\(status\)/);
  assert.match(badges,/character\.passive\?\.name/);
  assert.match(badges,/status\.turns/);
  assert.match(view,/battle-feedback-panel/);
  assert.match(view,/battle-ko-character/);
  const css=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
  assert.match(css,/@keyframes battle-knockout/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
