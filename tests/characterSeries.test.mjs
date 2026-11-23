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
