import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CHARACTERS } from '../src/data/characters.js';
import { MOVES_DB } from '../src/data/moves.js';
import { CHAR_PRICES } from '../src/data/prices.js';
import { MASTERY_CHARACTER_TITLES } from '../src/data/masteryTitles.js';
import { copyKirbyMoveOnHit } from '../src/systems/kirbyCopy.js';
import { GAME_UPDATES, UPDATE_CATEGORIES, UPDATE_COUNT } from '../src/data/updateHistory.js';
import { normalizeEventSettings, buildEventBattle, eventTurn } from '../src/systems/multiverseEventEngine.js';

const character=CHARACTERS.find(c=>c.id==='kirby');
const copy=()=>({id:'kirby',name:'Kirby',hp:100,passive:character.passive,moves:character.moves.map(m=>({...m}))});
const target=(name='Pikachu')=>({name,moves:[
  {name:'Fulmine',power:80,type:'Elettro',maxUses:5,remainingUses:3},
  {name:'Protezione',power:0,maxUses:8,remainingUses:8},
  {name:'Super Combo',power:250,isCombo:['hero','partner']}
]});

test('Kirby ha immagine, tipo, prezzo, quattro mosse e nuovo titolo personale',()=>{
  assert.ok(character);
  assert.equal(character.img,'https://i.pinimg.com/736x/c9/05/d7/c905d7a13a7dd44ea453614b270a560b.jpg');
  assert.deepEqual(character.types,['Magico','Folletto']);
  assert.equal(CHAR_PRICES.kirby,200);
  assert.equal(character.passive.name,'Copia Abilità');
  assert.equal(character.passive.maxCopies,2);
  assert.equal(MASTERY_CHARACTER_TITLES.kirby,'Eroe delle Stelle');
  assert.deepEqual(character.moves.map(m=>m.name),['Stella Sparata','Super Risucchio','Calcio Stellare','Stella Warp']);
  assert.equal(MOVES_DB['Stella Sparata'].power,85);
  assert.equal(MOVES_DB['Stella Sparata'].statusEffect.type,'Stordito');
  assert.equal(MOVES_DB['Stella Sparata'].statusEffect.chance,.2);
  assert.equal(MOVES_DB['Super Risucchio'].power,70);
  assert.equal(MOVES_DB['Super Risucchio'].drain,.25);
  assert.equal(MOVES_DB['Calcio Stellare'].power,95);
  assert.equal(MOVES_DB['Calcio Stellare'].priority,1);
  assert.equal(MOVES_DB['Stella Warp'].statBuff.spd,2);
  assert.equal(MOVES_DB['Stella Warp'].maxUses,2);
});

test('Copia Abilità: primo nemico, una mossa reale e nessun furto della mossa originale',()=>{
  const k=copy(),v=target();
  const initial=structuredClone(v.moves);
  const learnt=copyKirbyMoveOnHit(k,v,'p2:0',()=>0);
  assert.equal(learnt.name,'Fulmine');
  assert.equal(learnt.isKirbyCopy,true);
  assert.equal(learnt.remainingUses,3);
  assert.equal(k.moves.length,5);
  assert.deepEqual(v.moves,initial);
  assert.deepEqual(k.kirbyCopiedTargets,['p2:0']);
  assert.equal(copyKirbyMoveOnHit(k,v,'p2:0',()=>.4),null,'Un solo trigger per nemico');
});

test('Copia Abilità: massimo due mosse, mai da combo o copie, anche se ci sono altri avversari',()=>{
  const k=copy(),v=target();
  assert.equal(copyKirbyMoveOnHit(k,v,'p2:0',()=>.99).name,'Protezione');
  const second=copyKirbyMoveOnHit(k,{name:'Sonic',moves:[
    {name:'Super Combo',power:300,isCombo:['sonic','tails']},
    {name:'Scatto Sonico',power:80}
  ]},'p2:1',()=>0);
  assert.equal(second.name,'Scatto Sonico');
  assert.equal(copyKirbyMoveOnHit(k,{name:'Bowser',moves:[{name:'Soffio',power:70}]},'p2:2',()=>0),null);
  assert.equal(k.moves.filter(m=>m.isKirbyCopy).length,2);
  assert.equal(k.moves.length,6);
});

test('Copia Abilità non aumenta gli usi di mosse speciali limitate e non copia quelle esaurite',()=>{
  const k=copy();
  const original={name:'Poderosa Meteora',moves:[
    {name:'Mossa Esaurita',power:100,uses:0},
    {name:'Meteora Unica',power:150,uses:1}
  ]};
  const learned=copyKirbyMoveOnHit(k,original,'p2:0',()=>0);
  assert.equal(learned.name,'Meteora Unica');
  assert.equal(learned.maxUses,1);
  assert.equal(learned.remainingUses,1);
  assert.equal(learned.uses,1);
});

test('Copia Abilità: non si attiva per personaggi senza passiva o contro mosse non copiabili',()=>{
  assert.equal(copyKirbyMoveOnHit({id:'yoshi',hp:20,passive:{type:'kirby_copy_move'},moves:[]},target(),'p2:0'),null);
  assert.equal(copyKirbyMoveOnHit({...copy(),hp:0},target(),'p2:0'),null);
  assert.equal(copyKirbyMoveOnHit(copy(),{name:'Mario',moves:[{name:'Fratelli Bros',isCombo:['mario','luigi']}]},'p2:1'),null);
});

test('Nel Torneo del Multiverso Kirby copia una mossa dopo un attacco a danni',()=>{
  const settings=normalizeEventSettings({entrants:4,teamSize:4,fieldSize:1});
  const match={id:'test',sideA:{name:'Team Kirby',members:['k']},sideB:{name:'Team Bowser',members:['b']}};
  const people={k:{teamIds:['kirby','sage','spyro','carlos']},
    b:{teamIds:['bowser','goku','yoshi','kevin']}};
  const battle=buildEventBattle(match,people,settings);
  const k=battle.teams.A.find(c=>c.id==='kirby');
  const enemy=battle.teams.B.find(c=>c.id==='bowser');
  const a=eventTurn(battle,{k:[{actor:k.key,moveIndex:0,target:enemy.key}]},settings,()=>.5);
  assert.equal(a.teams.A.find(c=>c.id==='kirby').moves.filter(m=>m.isKirbyCopy).length,1);
  assert.ok(a.log.some(line=>line.includes('Copia Abilità')));
  assert.equal(battle.teams.A.find(c=>c.id==='kirby').moves.length,4,'Nessuna modifica allo stato d’ingresso');
});

test('Registro in gioco: tutte le categorie, 10 nerf e aggiornamenti della conversazione',()=>{
  const ids=GAME_UPDATES.map(x=>x.id);
  assert.ok(GAME_UPDATES.length>=14);
  assert.equal(new Set(ids).size,ids.length);
  assert.equal(UPDATE_COUNT,GAME_UPDATES.reduce((n,x)=>n+x.items.length,0));
  for(const cat of ['balance','champions','items','interface','mastery','fixes'])
    assert.ok(UPDATE_CATEGORIES.some(c=>c.id===cat));
  for(const id of ['kirby','nerfs','buffs','poison-fix','cell-rematch','mastery-titles','mastery-cosmetics','battle-visuals','status-clarity','builder','snow','hyper','stat-stacking','items','new-passives'])
    assert.ok(ids.includes(id),id);
  assert.ok(GAME_UPDATES.find(x=>x.id==='nerfs').items.some(x=>x.includes('Esplosione Solare')));
  assert.ok(GAME_UPDATES.find(x=>x.id==='nerfs').items.some(x=>x.includes('Polline fastidioso')));
  const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
  assert.match(app,/<UpdateHistoryPanel appMode=\{appMode\}/);
  const jsx=readFileSync(new URL('../src/components/UpdateHistoryPanel.jsx',import.meta.url),'utf8');
  assert.match(jsx,/role="dialog"/);
  assert.match(jsx,/aria-haspopup="dialog"/);
  assert.match(jsx,/setSearch/);
  assert.match(jsx,/GAME_UPDATES\.filter/);
});

test('Registro aggiornamenti: 3 novembre contiene torneo, buff e terza campagna aggiornati',()=>{
  const sections=GAME_UPDATES.slice(8,13);
  assert.deepEqual(sections.map(s=>s.id),[
    'nov3-tournament-roster','nov3-ten-character-buffs','nov3-echomax-final-raid',
    'nov3-echo-of-souls','nov3-echomax-unlock'
  ]);
  assert.ok(UPDATE_CATEGORIES.some(c=>c.id==='campaigns'));
  for(const section of sections){
    assert.equal(section.date,'03/11/2026');
    assert.ok(section.items.length>=5);
    assert.ok(UPDATE_CATEGORIES.some(c=>c.id===section.category));
  }
  const joined=sections.map(s=>[s.title,...s.items].join(' ')).join(' ');
  for(const word of ['Monarch','Torneo Assoluto','Echomax','Juvia','Roserade','Topolino',
    '6 Multimon','18','24','36 missioni','Cambia (Squadra)','scudi da 8']){
    assert.ok(joined.includes(word),'Dettaglio mancante nel registro: '+word);
  }
  assert.ok(!GAME_UPDATES.find(x=>x.id==='nov3-tournament-roster').items
    .some(item=>item.includes('tutte le modalità')));
  assert.ok(GAME_UPDATES.length>=28);
  assert.deepEqual(GAME_UPDATES.slice(0,2).map(s=>s.id),['nov3-ten-nerfs','nov3-zeno-omnipotent-gaze']);
  assert.deepEqual(GAME_UPDATES.slice(2,4).map(s=>s.id),['nov3-zazan-sage-arctic-move-balance','nov3-four-new-passives-bulma']);
  assert.deepEqual(GAME_UPDATES.slice(4,8).map(s=>s.id),[
    'nov3-hyper-immediate-moves','nov3-juvia-rainstorm','nov3-glitter-barrel-items','nov3-equipment-ui']);
  assert.equal(UPDATE_COUNT,GAME_UPDATES.reduce((n,x)=>n+x.items.length,0));
});

test('Il motore classico invia le mosse imparate al renderer e verifica il danno',()=>{
  const code=readFileSync(new URL('../src/systems/battleSystem.js',import.meta.url),'utf8');
  assert.match(code,/copyKirbyMoveOnHit\(attacker,t\.char/);
  assert.match(code,/t\.char\.hp < victimHpBeforeHit/);
  assert.match(code,/evt\.type === 'moves_update'/);
  assert.match(code,/passiveName:'Copia Abilità'/);
});
