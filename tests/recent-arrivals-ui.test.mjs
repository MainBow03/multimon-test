import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {recentArrivalCharacters,RECENT_ARRIVALS_IDS} from '../src/data/recentArrivals.js';
import {GAME_UPDATES} from '../src/data/updateHistory.js';

const read=relative=>readFileSync(new URL(relative,import.meta.url),'utf8');

test('Il redesign mantiene la cronologia e i primi quattro Multimon in evidenza',()=>{
 const arrivals=recentArrivalCharacters(CHARACTERS);
 assert.deepEqual(RECENT_ARRIVALS_IDS.slice(0,4),
  ['frillish','berry','flameprincess','ametista']);
 assert.deepEqual(arrivals.slice(0,4).map(c=>c.id),
  ['frillish','berry','flameprincess','ametista']);
 assert.ok(arrivals.length>24);
 assert.equal(new Set(arrivals.map(c=>c.id)).size,arrivals.length);
 const code=read('../src/components/RecentArrivalsGrid.jsx');
 assert.match(code,/recentArrivalCharacters\(characters\)\.slice\(0,100\)/);
 assert.match(code,/arrivals\.slice\(0,4\)/);
 assert.match(code,/arrivals\.slice\(4\)/);
 assert.match(code,/recent-arrivals-card--featured/);
 assert.match(code,/recent-arrivals-card-name/);
});

test('La vetrina mostra ritratti realmente ingranditi e si adatta a telefono, tablet e desktop',()=>{
 const css=read('../src/components/RecentArrivalsGrid.css');
 assert.match(css,/\.recent-arrivals-panel\{[\s\S]*?max-height:min\(660px/);
 assert.match(css,/\.recent-arrivals-card-art\{[^}]*height:83px/);
 assert.match(css,/\.recent-arrivals-card--featured \.recent-arrivals-card-art\{height:125px/);
 assert.match(css,/\.recent-arrivals-featured-grid\{[^}]*repeat\(2/);
 assert.match(css,/\.recent-arrivals-roster-grid\{[^}]*repeat\(3/);
 assert.match(css,/@media\(min-width:768px\) and \(max-width:1023px\)/);
 assert.match(css,/repeat\(5,minmax\(0,1fr\)\)/);
 assert.match(css,/@media\(max-width:479px\)/);
 assert.match(css,/\.recent-arrivals-panel\{width:390px\}/);
 assert.match(css,/overflow-y:auto/);
 assert.doesNotMatch(css,/grid-template-columns:repeat\(10/);
});

test('Il dettaglio con ritratti grandi è accessibile anche per personaggi in fondo allo scroll',()=>{
 const jsx=read('../src/components/RecentArrivalsGrid.jsx');
 const css=read('../src/components/RecentArrivalsGrid.css');
 assert.match(jsx,/createPortal\(/);
 assert.match(jsx,/document\.body/);
 assert.match(jsx,/role="dialog" aria-modal="true"/);
 assert.match(jsx,/if\(e\.key==='Escape'\)/);
 assert.match(jsx,/if\(e\.key==='ArrowRight'\)/);
 assert.match(jsx,/if\(e\.key==='ArrowLeft'\)/);
 assert.match(jsx,/selected\.img/);
 for(const col of ['PS','ATT','DIF','VEL'])
  assert.ok(jsx.includes("'"+col+"'"),col);
 assert.match(jsx,/Mostra il prossimo Multimon/);
 assert.match(jsx,/Mostra il Multimon precedente/);
 assert.match(css,/\.recent-arrivals-modal-art\{[^}]*height:clamp\(200px/);
 assert.match(css,/\.recent-arrivals-modal-backdrop\{position:fixed;z-index:9999/);
});

test('La nuova interfaccia è annotata nel Registro aggiornamenti del gioco',()=>{
 const entry=GAME_UPDATES.find(x=>x.id==='nov7-recent-arrivals-ui-redesign');
 assert.ok(entry);
 assert.equal(entry.date,'07/11/2026');
 assert.equal(entry.category,'interface');
 assert.ok(entry.items.some(x=>x.includes('Frillish')));
 assert.ok(entry.items.some(x=>x.includes('Precedente/Successivo')));
 assert.ok(entry.items.some(x=>x.includes('tre colonne')));
});
