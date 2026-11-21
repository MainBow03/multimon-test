import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=file=>readFileSync(new URL(file,import.meta.url),'utf8');

test('Campagne standard è il primo tasto lungo nelle Avventure del menu nuovo',()=>{
 const menu=read('../src/screens/hub/MenuDashboard.jsx');
 const css=read('../src/screens/hub/MenuDashboard.css');
 const adventure=menu.slice(menu.indexOf("{tab==='adventure'"),menu.indexOf("{tab==='local'"));
 assert.ok(adventure.includes("card('📖','Campagne'"));
 assert.ok(!adventure.includes("setAppMode('adventure_world')"),
  'La campagna 3D non deve essere nel menu');
 assert.ok(adventure.indexOf("card('📖','Campagne'")<adventure.indexOf("card('🎲','Roguelike Solo'"));
 assert.match(adventure,/setAppMode\('campaign_select'\)/);
 assert.match(css,/\.mm-dash-card-grid--adventure>\.mm-dash-mode:first-child\s*\{\s*grid-column:1 \/ -1/);
});

test('Il menu classico ha solo il pulsante principale delle Campagne standard',()=>{
 const menu=read('../src/screens/hub/MenuView.jsx');
 assert.ok(!menu.includes("setAppMode('adventure_world')"));
 assert.ok(!menu.includes('Campagna 3D · Mondo Aperto'));
 assert.match(menu,/startWithModeGuide\('campaign',\(\)=>setAppMode\('campaign_select'\)\)/);
 assert.match(menu,/Modalità Campagne/);
 assert.match(menu,/font-black py-5/);
});

test('La Campagna 3D, i salvataggi e la logica di esplorazione NON vengono cancellati',()=>{
 const app=read('../src/App.jsx');
 const engine=read('../src/systems/adventureCampaign.js');
 const world=read('../src/screens/adventure/AdventureCampaignView.jsx');
 assert.match(app,/appMode === 'adventure_world'/);
 assert.match(app,/ADVENTURE_SAVE_KEY/);
 assert.ok(engine.length>500);
 assert.ok(world.length>500);
});
