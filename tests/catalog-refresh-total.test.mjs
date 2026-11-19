import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {getCatalogOverview} from '../src/systems/catalogOverview.js';

const catalog = readFileSync(new URL('../src/screens/hub/CatalogView.jsx',import.meta.url),'utf8');

test('Il totale viene derivato dal roster giocabile senza includere boss ed evocazioni',()=>{
  const expected=CHARACTERS.filter(c=>c?.id&&!c.isSummonOnly&&!c.isCampaignMonster);
  const summary=getCatalogOverview(CHARACTERS);
  assert.equal(summary.totalMultimon,expected.length);
  assert.ok(summary.totalMultimon>=208,'Il roster aggiornato non deve perdere Multimon');
  assert.equal(summary.totalTypes,new Set(expected.flatMap(c=>c.types||[])).size);
  assert.equal(summary.totalSummons,CHARACTERS.filter(c=>c.isSummonOnly).length);
  assert.equal(summary.totalCampaignMonsters,CHARACTERS.filter(c=>c.isCampaignMonster).length);
});

test('Il contatore segue automaticamente le future aggiunte ed esclude categorie speciali',()=>{
  const additions=[
    {id:'nuovo',name:'Nuovo Multimon',types:['Suono','Luce']},
    {id:'evocato',name:'Evocato',types:['Magico'],isSummonOnly:true},
    {id:'boss',name:'Boss',types:['Oscuro'],isCampaignMonster:true}
  ];
  const baseline=getCatalogOverview(CHARACTERS);
  const withChanges=getCatalogOverview([...CHARACTERS,...additions]);
  assert.equal(withChanges.totalMultimon,baseline.totalMultimon+1);
  assert.equal(withChanges.totalSummons,baseline.totalSummons+1);
  assert.equal(withChanges.totalCampaignMonsters,baseline.totalCampaignMonsters+1);
  assert.deepEqual(getCatalogOverview(undefined),{
    totalMultimon:0,totalTypes:0,totalSummons:0,totalCampaignMonsters:0
  });
});

test('Catalogo: totale in evidenza, risultati del filtro e schede responsive con immagini intere',()=>{
  assert.match(catalog,/getCatalogOverview\(CHARACTERS\)/);
  assert.match(catalog,/data-testid="catalog-total-multimon"/);
  assert.match(catalog,/\{overview\.totalMultimon\}/);
  assert.match(catalog,/Totale Multimon/);
  assert.match(catalog,/\{displayedChars\.length\}/);
  assert.match(catalog,/setCatalogSearch\(e\.target\.value\)/);
  assert.match(catalog,/setCatalogFilter\(e\.target\.value\)/);
  assert.match(catalog,/setCatalogSort\(e\.target\.value\)/);
  assert.match(catalog,/Tutti i tipi/);
  assert.match(catalog,/Evocazioni/);
  assert.match(catalog,/Mostri Campagna/);
  assert.match(catalog,/Iper forme/);
  assert.match(catalog,/Fusioni/);
  assert.match(catalog,/sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5/);
  assert.match(catalog,/h-48.*sm:h-52/);
  assert.match(catalog,/object-contain/);
  assert.match(catalog,/loading="lazy"/);
  assert.match(catalog,/line-clamp-2 break-words/);
  assert.match(catalog,/<details className=/);
  assert.match(catalog,/char\.moves\.filter\(Boolean\)\.map/);
  assert.match(catalog,/onMultimonImageError/);
});
