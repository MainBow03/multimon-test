import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {MOVES_DB} from '../src/data/moves.js';
import {hyperPreviewMoves,canChooseHyperMove,HYPER_BONUS_MOVES} from '../src/systems/hyperPreview.js';
import {healHyperMikuConcertAllies} from '../src/systems/hyperMikuEffects.js';

const character=(id)=>{
  const c=CHARACTERS.find(c=>c.id===id);
  assert.ok(c,'Multimon mancante: '+id);
  return structuredClone(c);
};

test('Iper Luigi: attacco Spettro, 95 potenza, assorbimento 20%, due usi fissi',()=>{
  const luigi=character('luigi');
  assert.equal(luigi.types[0],'Normale');
  assert.equal(luigi.moves.some(m=>m.name==='Aspirazione Fantasma'),false);
  const move=MOVES_DB['Aspirazione Fantasma'];
  assert.ok(move);
  assert.equal(move.type,'Spettro');
  assert.equal(move.power,95);
  assert.equal(move.drain,.20);
  assert.equal(move.maxUses,2);
  assert.equal(move.strictUses,true);
  assert.deepEqual(HYPER_BONUS_MOVES.luigi,['Aspirazione Fantasma']);
  const preview=hyperPreviewMoves(luigi,true,MOVES_DB);
  assert.equal(preview.length,luigi.moves.length+1);
  assert.equal(preview.at(-1).remainingUses,2);
  assert.equal(canChooseHyperMove(luigi,preview.length-1,true,MOVES_DB),true);
  assert.equal(hyperPreviewMoves(luigi,false,MOVES_DB).length,luigi.moves.length);
});

test('Iper Miku: mossa ad area che cura il 10% degli alleati, due usi',()=>{
  const miku=character('miku');
  assert.equal(miku.moves.some(m=>m.name==='Concerto Universale'),false);
  const move=MOVES_DB['Concerto Universale'];
  assert.ok(move);
  assert.equal(move.type,'Suono');
  assert.equal(move.power,70);
  assert.equal(move.special,true);
  assert.ok(move.targetCount>=4);
  assert.equal(move.concertTeamHeal,.10);
  assert.equal(move.maxUses,2);
  assert.equal(move.strictUses,true);
  assert.deepEqual(HYPER_BONUS_MOVES.miku,['Concerto Universale']);
  const preview=hyperPreviewMoves(miku,true,MOVES_DB);
  assert.equal(preview.length,miku.moves.length+1);
  assert.equal(preview.at(-1).remainingUses,2);
  assert.equal(canChooseHyperMove(miku,preview.length-1,true,MOVES_DB),true);
});

test('Concerto Universale cura Miku e alleati vivi in campo UNA volta',()=>{
  const miku={id:'miku',name:'Miku',isHyper:true,hp:60,maxHp:100};
  const ally={id:'luigi',name:'Luigi',hp:44,maxHp:100};
  const reserve={id:'sonic',name:'Sonic',hp:10,maxHp:100};
  const ko={id:'garnet',name:'Garnet',hp:0,maxHp:100};
  const enemy={id:'villain',name:'Nemico',hp:20,maxHp:100};
  const teams={p1:[miku,ally,reserve,ko],p2:[enemy]};
  const field={p1:[0,1,3],p2:[0]};
  const events=[];
  const result=healHyperMikuConcertAllies(miku,MOVES_DB['Concerto Universale'],
    'p1',teams,field,{gameMode:'classica'},events,['p1','p2']);
  assert.equal(result,20);
  assert.equal(miku.hp,70);
  assert.equal(ally.hp,54);
  assert.equal(reserve.hp,10);
  assert.equal(ko.hp,0);
  assert.equal(enemy.hp,20);
  assert.equal(events.length,2);
  assert.equal(healHyperMikuConcertAllies({...miku,isHyper:false},
    MOVES_DB['Concerto Universale'],'p1',teams,field,{},[],['p1','p2']),0);
});

test('Concerto Universale cura alleati di altri giocatori in co-op, non i nemici',()=>{
  const miku={id:'miku',name:'Miku',isHyper:true,hp:90,maxHp:100};
  const ally={id:'sage',name:'Sage',hp:20,maxHp:100};
  const ally2={id:'starbutterfly',name:'Star',hp:50,maxHp:100};
  const enemy={id:'boss',name:'Boss',hp:30,maxHp:100};
  const teams={p1:[miku],p2:[ally],p3:[ally2],p4:[enemy]};
  const field={p1:[0],p2:[0],p3:[0],p4:[0]};
  const ev=[];
  const healed=healHyperMikuConcertAllies(miku,MOVES_DB['Concerto Universale'],'p1',
    teams,field,{gameMode:'juggernaut',isRoguelikeCoop:true,
      settings:{juggernautPlayer:'p4'}},ev,['p1','p2','p3','p4']);
  assert.equal(healed,30);
  assert.deepEqual([miku.hp,ally.hp,ally2.hp,enemy.hp],[100,30,60,30]);
  assert.equal(ev.length,3);
});

test('Niente cure a chi ha già i PS pieni, e niente cura se Miku è KO',()=>{
  const miku={id:'miku',name:'Miku',isHyper:true,hp:100,maxHp:100};
  const teams={p1:[miku],p2:[{id:'enemy',hp:20,maxHp:100}]};
  const field={p1:[0],p2:[0]};
  assert.equal(healHyperMikuConcertAllies(miku,MOVES_DB['Concerto Universale'],
    'p1',teams,field,{},[],['p1','p2']),0);
  miku.hp=0;
  assert.equal(healHyperMikuConcertAllies(miku,MOVES_DB['Concerto Universale'],
    'p1',teams,field,{},[],['p1','p2']),0);
});

test('Il motore, il catalogo e l’interfaccia usano i link scelti e rispettano la regola Iper',()=>{
  const battle=readFileSync(new URL('../src/systems/battleSystem.js',import.meta.url),'utf8');
  const view=readFileSync(new URL('../src/screens/battle/BattlingView.jsx',import.meta.url),'utf8');
  const catalog=readFileSync(new URL('../src/screens/hub/CatalogView.jsx',import.meta.url),'utf8');
  for(const id of ['luigi','miku']){
    assert.match(battle,new RegExp("char\\.id === '"+id+"'"));
    assert.match(view,new RegExp("activeCommandChar\\.id === '"+id+"'"));
    assert.match(catalog,new RegExp("'"+id+"'"));
  }
  assert.match(battle,/healHyperMikuConcertAllies/);
  assert.match(view,/https:\/\/i\.pinimg\.com\/1200x\/22\/86\/f9\/2286f929ba8c9bc5bd63a96ccb266f2d\.jpg/);
  assert.match(view,/https:\/\/i\.pinimg\.com\/736x\/4d\/88\/d9\/4d88d9df93b4a62f43bc69bfd46eb250\.jpg/);
  assert.match(catalog,/https:\/\/i\.pinimg\.com\/1200x\/22\/86\/f9\/2286f929ba8c9bc5bd63a96ccb266f2d\.jpg/);
  assert.match(catalog,/https:\/\/i\.pinimg\.com\/736x\/4d\/88\/d9\/4d88d9df93b4a62f43bc69bfd46eb250\.jpg/);
});
