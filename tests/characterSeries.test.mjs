import test from 'node:test';
import assert from 'node:assert/strict';
import {CHARACTERS} from '../src/data/characters.js';
import {FUSION_CHARACTERS} from '../src/data/fusions.js';
import {SERIES_BY_ID,characterSeries,characterSeriesList,seriesOptions,seriesMatches} from '../src/data/characterSeries.js';

test('ogni Multimon di base, incluso boss o evocazione, ha una serie d’origine',()=>{
  const missing=CHARACTERS.filter(c=>
    !SERIES_BY_ID[c.id] || !c.series || c.series==='Origine da verificare' ||
    c.series!==characterSeries(c));
  assert.deepEqual(missing.map(c=>c.id),[]);
  assert.equal(new Set(CHARACTERS.map(c=>c.id)).size,CHARACTERS.length);
  assert.equal(Object.keys(SERIES_BY_ID).length,CHARACTERS.length);
});

test('le fusioni appartengono a entrambi gli universi di origine',()=>{
  for(const c of FUSION_CHARACTERS){
    const series=characterSeriesList(c);
    assert.ok(series.length>0,c.id);
    assert.ok(series.every(s=>s!=='Origine da verificare'),c.id);
    for(const origin of series)assert.ok(seriesMatches(c,origin),c.id+' '+origin);
    assert.deepEqual(c.seriesList,series);
  }
});

test('i singoli e le varianti sono presenti nei filtri separati',()=>{
  assert.equal(characterSeries({id:'frillish'}),'Pokémon');
  assert.equal(characterSeries({id:'marceline_corrotta'}),'Adventure Time');
  assert.equal(characterSeries({id:'cosmo'}),'I due fantagenitori');
  assert.ok(seriesOptions(CHARACTERS).includes('L’Ape Maya'));
  assert.ok(seriesMatches({id:'mayalape'},'L’Ape Maya'));
  assert.ok(!seriesMatches({id:'mayalape'},'Pokémon'));
  assert.ok(seriesMatches({id:'mayalape'},'Tutti'));
});
test('corregge categorie esistenti e rimuove serie senza personaggi',()=>{
 assert.equal(characterSeries({id:'sugino'}),'Zatch Bell!');
 assert.equal(characterSeries({id:'spike'}),'Brawl Stars');
 assert.equal(characterSeries({id:'roxy'}),'Winx Club');
 assert.ok(!seriesOptions(CHARACTERS).includes('Assassination Classroom'));
 assert.ok(!seriesOptions(CHARACTERS).includes('Five Nights at Freddy’s'));
 assert.equal(characterSeries({id:'olaf'}),'Disney - Frozen');
 assert.equal(characterSeries({id:'edwardelric'}),'Fullmetal Alchemist');
});
test('Olaf, Edward e Miguel hanno i dati e le immagini richiesti',()=>{
 const olaf=CHARACTERS.find(c=>c.id==='olaf'),edward=CHARACTERS.find(c=>c.id==='edwardelric');
 const miguel=CHARACTERS.find(c=>c.id==='miguelrivera');
 assert.deepEqual(olaf.types,['Ghiaccio','Terra']);
 assert.deepEqual(edward.types,['Terra','Robot']);
 assert.equal(olaf.img,'https://i.pinimg.com/736x/b7/16/eb/b716eb876965607b9552e422afc5caf4.jpg');
 assert.equal(edward.img,'https://i.pinimg.com/736x/e7/44/80/e74480782e9913fec26b99d53e60796e.jpg');
 assert.equal(miguel.img,'https://i.pinimg.com/736x/72/ce/d0/72ced0b06c33ddcfe81401a9fcc464c7.jpg');
 for(const c of [olaf,edward]){
   assert.equal(c.moves.length,4);
   assert.ok(c.moves.every(m=>m&&m.name&&m.type&&m.maxUses>0));
   assert.equal(c.passive.type,'on_enter');
   assert.ok(c.price>0);
 }
});
