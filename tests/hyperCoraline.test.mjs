import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {MOVES_DB} from '../src/data/moves.js';
import {HYPER_BONUS_MOVES,hyperPreviewMoves,canChooseHyperMove} from '../src/systems/hyperPreview.js';
import {CORALINE_HYPER_IMAGE} from '../src/systems/coralineHyperArtwork.js';

const source=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const coraline=CHARACTERS.find(c=>c.id==='coraline');

test('Coraline normale mantiene tipi, statistiche, passive e 4 mosse originali',()=>{
  assert.ok(coraline);
  assert.deepEqual(coraline.types,['Psico','Spettro']);
  assert.deepEqual([coraline.hp,coraline.atk,coraline.def,coraline.spd],[100,98,92,106]);
  assert.equal(coraline.passive.type,'first_hit_immunity');
  assert.equal(coraline.moves.length,4);
  assert.ok(!coraline.moves.some(m=>m.name==='Porta dell’Impossibile'));
});

test('Porta dell’Impossibile è una vera mossa Iper, speciale, 90 potenza, due usi, 25% confusione',()=>{
  const m=MOVES_DB['Porta dell’Impossibile'];
  assert.ok(m);
  assert.equal(m.type,'Psico');
  assert.equal(m.special,true);
  assert.equal(m.power,90);
  assert.equal(m.accuracy,1);
  assert.equal(m.maxUses,2);
  assert.equal(m.strictUses,true);
  assert.deepEqual(m.statusEffect,{type:'Confuso',chance:.25,turns:3});
  assert.deepEqual(HYPER_BONUS_MOVES.coraline,['Porta dell’Impossibile']);
});

test('La mossa appare immediatamente quando si seleziona Iper e scompare disattivandola',()=>{
  const ch={...coraline,moves:coraline.moves.map(m=>({...m})),isHyper:false};
  const base=hyperPreviewMoves(ch,false,MOVES_DB);
  const hyper=hyperPreviewMoves(ch,true,MOVES_DB);
  assert.equal(base.length,4);
  assert.equal(hyper.length,5);
  assert.equal(hyper[4].name,'Porta dell’Impossibile');
  assert.equal(hyper[4].remainingUses,2);
  assert.equal(hyper[4].hyperPreview,true);
  assert.equal(canChooseHyperMove(ch,4,true,MOVES_DB),true);
  assert.equal(canChooseHyperMove(ch,4,false,MOVES_DB),false);
  assert.equal(ch.moves.length,4);
  assert.equal(hyperPreviewMoves({...ch,isHyper:true},true,MOVES_DB).length,4);
});

test('Il pulsante Iper, lo sprite e la mossa sono collegati sia in battaglia sia nel Catalogo',()=>{
  const battle=source('src/screens/battle/BattlingView.jsx');
  const catalog=source('src/screens/hub/CatalogView.jsx');
  const engine=source('src/systems/battleSystem.js');
  assert.match(battle,/activeCommandChar\.id === 'coraline'/);
  assert.match(battle,/char\.id === 'coraline'[\s\S]{0,90}displayImg = CORALINE_HYPER_IMAGE/);
  assert.match(catalog,/hyperIds = [^;]*'coraline'/);
  assert.match(catalog,/char\.id === 'coraline'[\s\S]{0,70}char\.moves\.push\(MOVES_DB\['Porta dell’Impossibile'\]\)/);
  assert.match(catalog,/char\.img = CORALINE_HYPER_IMAGE/);
  assert.match(engine,/char\.id === 'coraline'[\s\S]{0,450}char\.moves\.push\(\{ \.\.\.MOVES_DB\['Porta dell’Impossibile'\], remainingUses: 2 \}\)/);
  assert.match(engine,/char\.atk = Math\.floor\(char\.atk \* 1\.35\)/);
});

test('Il PNG originale è distribuito come illustrazione AVIF locale, senza dipendenze esterne',()=>{
  const bytes=readFileSync(new URL('../public/hyper-coraline.avif',import.meta.url));
  assert.ok(bytes.length>5000);
  assert.equal(bytes.toString('ascii',4,12),'ftypavif');
  assert.match(CORALINE_HYPER_IMAGE,/hyper-coraline\.avif$/);
  assert.ok(!/^https?:/.test(CORALINE_HYPER_IMAGE));
});
