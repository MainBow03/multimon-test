import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {visibleRoomInvitations,roomInvitationCapacity,roomModeLabel} from '../src/systems/roomInvitations.js';
import {GAME_UPDATES} from '../src/data/updateHistory.js';

const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const now=1762492000000;
const room=(code,fields={})=>({
 code,publicInvite:true,roomName:'Una battaglia epica',createdAt:now-15000,
 hostHeartbeatAt:now-10000,status:'lobby',gameMode:'classica',
 settings:{maxPlayers:4},players:{p1:'Giocatore Uno',p2:null},
 playerUids:{p1:'owner-1'},...fields
});

test('Le proposte sono opt-in: mostra solo stanze pubbliche, in lobby, con host presente e un posto libero',()=>{
 const entries=[
  room('VALID'),room('PRIVATE',{publicInvite:false}),
  room('STARTED',{status:'drafting'}),
  room('OLD',{createdAt:now-3600001}),
  room('OFFLINE',{hostHeartbeatAt:now-90001}),
  room('FULL',{players:{p1:'A',p2:'B'}}),
  room('SELF',{playerUids:{p1:'me'}}),
  room('COOP',{isRoguelikeCoop:true}),
  room('UNKNOWN',{createdAt:null}),
 ];
 assert.deepEqual(visibleRoomInvitations(entries,'me',now).map(x=>x.code),['VALID']);
 assert.equal(visibleRoomInvitations(entries,'me',now)[0].name,'Una battaglia epica');
 assert.equal(visibleRoomInvitations(entries,'me',now)[0].capacity,2);
 assert.equal(visibleRoomInvitations(entries,'me',now)[0].joined,1);
 assert.equal(visibleRoomInvitations([],null,now).length,0);
});

test('I nuovi inviti sono ordinati e limitati, senza popup ripetuti',()=>{
 const entries=Array.from({length:30},(_,i)=>room('ABC'+i,{createdAt:now-i*1000}));
 const result=visibleRoomInvitations(entries,'me',now);
 assert.equal(result.length,12);
 assert.equal(result[0].code,'ABC0');
 assert.equal(result[11].code,'ABC11');
 assert.equal(roomInvitationCapacity({gameMode:'ultimon',settings:{maxPlayers:8}}),8);
 assert.equal(roomInvitationCapacity({gameMode:'multipla'}),4);
 assert.equal(roomModeLabel('ultimon'),'Ultimon Multimon');
});

test('Nuovo menu: tutti i collegamenti restano e il menu precedente è recuperabile',()=>{
 const app=read('../src/App.jsx');
 const menu=read('../src/screens/hub/MenuView.jsx');
 const dashboard=read('../src/screens/hub/MenuDashboard.jsx');
 const css=read('../src/screens/hub/MenuDashboard.css');
 assert.match(menu,/MenuDashboard ctx=\{ctx\}/);
 assert.match(menu,/ctx\.useClassicMenu/);
 assert.match(menu,/onMenuStyleChange\('new'\)/);
 assert.match(dashboard,/onMenuStyleChange\('classic'\)/);
 assert.match(app,/multimon_menu_style_v1/);
 assert.match(app,/roomInvitations, useClassicMenu, onMenuStyleChange/);
 assert.match(dashboard,/Registro aggiornamenti/);
 for(const key of ['online','adventure','local','collection','profile'])
  assert.ok(dashboard.includes("key:'"+key+"'"),key);
 for(const label of ['Campagne','Roguelike Solo','Roguelike Co-op',
   'Sopravvivenza','Gioca in Locale','Catalogo','Laboratorio',
   'Negozio','Bauli Campagna','Casse Potenza','Tabella Tipi',
   'Statistiche complete','Prestigi e Padronanza'])
   assert.ok(dashboard.includes(label),label);
 assert.match(css,/\.mm-dash-hero/);
 assert.match(css,/@media\(max-width:680px\)/);
 assert.match(app,/appMode === 'stats' \|\| appMode === 'mastery'/);
});

test('Creazione stanza con nome e privacy, invito e join tramite codice o bacheca',()=>{
 const multiplayer=read('../src/systems/multiplayerSystem.js');
 const app=read('../src/App.jsx');
 const menu=read('../src/screens/hub/MenuDashboard.jsx');
 assert.match(multiplayer,/handleCreateRoomImpl = async \(ctx, requestedName='', publicRoom=true\)/);
 assert.match(multiplayer,/state\.publicInvite=publicRoom===true/);
 assert.match(multiplayer,/state\.roomName=/);
 assert.match(multiplayer,/state\.createdAt=Date\.now\(\)/);
 assert.match(multiplayer,/handleJoinRoomImpl = async \(ctx, inviteCode=null\)/);
 assert.match(multiplayer,/selectedCode\.trim\(\)\.toUpperCase\(\)/);
 assert.match(app,/onSnapshot\(recent,snapshot/);
 assert.match(app,/visibleRoomInvitations\(rows,user\.uid\)/);
 assert.match(menu,/handleCreateRoom\(roomName,publicRoom\)/);
 assert.match(menu,/handleJoinRoom\(code\)/);
 assert.match(menu,/Nascondi questo invito/);
 assert.match(menu,/Codice stanza/);
});

test('Registro accessibile da menu, Padronanza separata dalle statistiche senza perdere i titoli',()=>{
 const stats=read('../src/screens/hub/StatsView.jsx');
 const history=read('../src/components/UpdateHistoryPanel.jsx');
 const app=read('../src/App.jsx');
 assert.match(stats,/appMode === 'stats' \|\| appMode === 'mastery'/);
 assert.match(stats,/appMode==='stats'&&<>/);
 assert.match(stats,/appMode==='mastery'&&<section/);
 for(const name of ['Sconfitte','Multimon provati','Mosse eseguite','Tempo medio / partita'])
  assert.ok(stats.includes(name));
 assert.match(history,/multimon:open-updates/);
 assert.match(history,/hideLauncher/);
 assert.match(app,/hideLauncher=\{appMode==='menu'&&!useClassicMenu\}/);
 const entry=GAME_UPDATES.find(x=>x.id==='nov7-menu-dashboard-room-invites');
 assert.ok(entry);
 assert.ok(entry.items.some(i=>i.includes('Menu classico')));
});
