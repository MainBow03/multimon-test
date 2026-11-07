import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {GAME_UPDATES} from '../src/data/updateHistory.js';
import {visibleRoomInvitations} from '../src/systems/roomInvitations.js';

const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');

test('Menu Festival: la scena usa tre PNG realmente presenti nel roster Multimon',()=>{
 const ui=read('../src/screens/hub/MenuDashboard.jsx');
 const mascots=['sonic','kirby','marceline'];
 for(const id of mascots){
  assert.ok(CHARACTERS.some(c=>c.id===id&&typeof c.img==='string'),id+' non disponibile nel roster');
  assert.ok(ui.includes("id:'"+id+"'"),id+' non compare nella home');
 }
 assert.match(ui,/mm-dash-hero-stage/);
 assert.match(ui,/mm-dash-hero-fighter/);
 assert.match(ui,/SCEGLI\. SCHIERA\. VINCI!/);
});

test('Le schede delle modalità usano PNG diversi e colori più vivaci',()=>{
 const ui=read('../src/screens/hub/MenuDashboard.jsx');
 const css=read('../src/screens/hub/MenuDashboard.css');
 for(const id of ['finn','jake','sage','godzilla','goku','bugsbunny','robin','garnet','bulma','wario','lucy','starbutterfly','peridot']){
  assert.ok(CHARACTERS.some(c=>c.id===id&&c.img),id+' non disponibile');
  assert.ok(ui.includes("'"+id+"'"),id+' non mappato alle schede');
 }
 assert.match(ui,/mm-dash-mode-art/);
 assert.match(css,/\.mm-dash-mode-art\{/);
 assert.match(css,/\.mm-dash-mode--green\{/);
 assert.match(css,/\.mm-dash-mode--pink\{/);
 assert.match(css,/\.mm-dash-mode--amber\{/);
 assert.match(css,/\.mm-dash-tab--active:nth-child\(5\)/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/@media\(max-width:680px\)/);
});

test('Il nuovo menu è predefinito dopo il precedente rollback, ma il menu classico resta accessibile',()=>{
 const app=read('../src/App.jsx');
 const oldMenu=read('../src/screens/hub/MenuView.jsx');
 const festival=read('../src/screens/hub/MenuDashboard.jsx');
 assert.match(app,/multimon_menu_style_v2/);
 assert.doesNotMatch(app,/multimon_menu_style_v1/);
 assert.match(oldMenu,/ctx\.useClassicMenu/);
 assert.match(oldMenu,/Prova il nuovo menu/);
 assert.match(festival,/onMenuStyleChange\('classic'\)/);
 assert.match(app,/hideLauncher=\{appMode==='menu'&&!useClassicMenu\}/);
});

test('Inviti pubblici discreti, nome partita e codici rimangono senza creare notifiche invadenti',()=>{
 const ui=read('../src/screens/hub/MenuDashboard.jsx');
 const multiplayer=read('../src/systems/multiplayerSystem.js');
 assert.match(ui,/QUALCUNO TI STA SFIDANDO!/);
 assert.match(ui,/Nascondi questo invito/);
 assert.match(ui,/roomInvitations=\[\]/);
 assert.match(ui,/handleCreateRoom\(roomName,publicRoom\)/);
 assert.match(ui,/handleJoinRoom\(code\)/);
 assert.match(ui,/Codice stanza/);
 assert.match(multiplayer,/state\.publicInvite=publicRoom===true/);
 const now=Date.now();
 const rows=[
  {code:'OK123',publicInvite:true,roomName:'Battaglia allegra',createdAt:now-5000,
   hostHeartbeatAt:now-4000,status:'lobby',players:{p1:'P1'},playerUids:{p1:'u1'},gameMode:'classica'},
  {code:'SECRET',publicInvite:false,roomName:'Segreta',createdAt:now-5000,
   hostHeartbeatAt:now-4000,status:'lobby',players:{p1:'P2'},playerUids:{p1:'u2'},gameMode:'classica'}
 ];
 assert.deepEqual(visibleRoomInvitations(rows,'new-user',now).map(r=>r.code),['OK123']);
});

test('Prestigi e Registro rimangono separati e documentati',()=>{
 const ui=read('../src/screens/hub/MenuDashboard.jsx');
 const stats=read('../src/screens/hub/StatsView.jsx');
 const entry=GAME_UPDATES.find(x=>x.id==='nov7-menu-dashboard-room-invites');
 assert.ok(entry);
 assert.match(entry.title,/Festival/);
 assert.match(ui,/Prestigi e Padronanza/);
 assert.match(ui,/Registro aggiornamenti/);
 assert.match(stats,/appMode === 'stats' \|\| appMode === 'mastery'/);
});
