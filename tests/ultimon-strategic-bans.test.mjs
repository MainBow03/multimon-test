import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/gameData.js';
import {createUltimonShowcase,ULTIMON_STAGES} from '../src/systems/ultimonSystem.js';
import {
 ultimonBanRoster,ultimonBanRoles,ultimonBannedIds,isUltimonBanned,
 allUltimonBansReady,ultimonBanPatch,beginUltimonDraftAfterBans
} from '../src/systems/ultimonBans.js';
import {GAME_IN_PROGRESS} from '../src/systems/roomRecovery.js';

const candidates=CHARACTERS.filter(c=>c&&!c.isSummonOnly&&!c.isSecretUnlock&&!c.isCampaignMonster);
const [first,second]=candidates.slice(0,2);
assert.ok(first&&second&&first.id!==second.id);

const room=(mode={},bots={p1:false,p2:false,p3:true,p4:true})=>({
 gameMode:'ultimon',status:'ultimon_ban',
 settings:{maxPlayers:4,teamSize:4,fieldSize:1,rentalMode:false,
  fusionMode:false,sharedDraft:false,draftBattle:false,...mode},
 players:{p1:'Alice',p2:'Marco',p3:'CPU 1',p4:'CPU 2'},
 isBot:bots,
 draft:{p1:[],p2:[],p3:[],p4:[]},draftChoices:{p1:[],p2:[],p3:[],p4:[]},
 draftRerolls:{p1:0,p2:0,p3:0,p4:0},
 ultimonBans:{votes:{}}
});
const apply=(r,patch)=>{
 const state=structuredClone(r);
 for(const [key,val] of Object.entries(patch)){
  const parts=key.split('.'),last=parts.pop();let object=state;
  for(const name of parts){object[name]??={};object=object[name];}
  object[last]=val;
 }
 return state;
};
const completed=(config={})=>{
 let r=room(config);
 r=apply(r,ultimonBanPatch(r,'p1',first.id));
 r=apply(r,ultimonBanPatch(r,'p2',second.id));
 return r;
};
const noBanned=chars=>chars.every(c=>c.id!==first.id&&c.id!==second.id);

test('Fase BAN Ultimon: un umano un voto, bot esclusi dalla votazione, nomi reali nel roster',()=>{
 const r=room();
 assert.equal(ultimonBanRoles(r).length,2);
 assert.deepEqual(ultimonBanRoles(r),['p1','p2']);
 assert.ok(ultimonBanRoster(r).some(c=>c.id===first.id));
 assert.equal(allUltimonBansReady(r),false);
 assert.equal(ultimonBanPatch(r,'p1',first.id)['ultimonBans.votes.p1'],first.id);
 assert.throws(()=>ultimonBanPatch(r,'p3',second.id),/Solo i giocatori umani/);
 assert.throws(()=>ultimonBanPatch({...r,status:'drafting'},'p1',first.id),/non è attiva/);
 const firstVote=apply(r,ultimonBanPatch(r,'p1',first.id));
 assert.throws(()=>ultimonBanPatch(firstVote,'p1',second.id),/già confermato/);
 assert.throws(()=>ultimonBanPatch(firstVote,'p2',first.id),/già bannato/);
 const done=apply(firstVote,ultimonBanPatch(firstVote,'p2',second.id));
 assert.equal(allUltimonBansReady(done),true);
 assert.deepEqual(ultimonBannedIds(done),[first.id,second.id]);
 assert.equal(isUltimonBanned(done,first.id),true);
 assert.equal(isUltimonBanned({...done,gameMode:'classica'},first.id),false);
 assert.ok(ULTIMON_STAGES.includes('ultimon_ban'));
 assert.ok(GAME_IN_PROGRESS.includes('ultimon_ban'));
});

test('Nessuno può iniziare il draft prima che tutti gli umani abbiano bannato',()=>{
 assert.throws(()=>beginUltimonDraftAfterBans(room()),/Attendi/);
 assert.throws(()=>beginUltimonDraftAfterBans({...completed(),status:'lobby'}),/non è la fase/);
 const state=beginUltimonDraftAfterBans(completed(),()=>0.23);
 assert.equal(state.status,'drafting');
 assert.equal(state.draft.p1.length,0);
 assert.equal(state.draft.p2.length,0);
 assert.equal(state.draft.p3.length,4);
 assert.equal(state.draft.p4.length,4);
 assert.ok(noBanned([...state.draft.p3,...state.draft.p4]));
});

test('Draft Battle: le tre offerte iniziali e le squadre CPU rispettano entrambi i ban',()=>{
 const r=completed({draftBattle:true});
 const next=beginUltimonDraftAfterBans(r,()=>.17);
 assert.equal(next.status,'drafting');
 for(const p of ['p1','p2']){
  assert.equal(next.draftChoices[p].length,3);
  assert.ok(noBanned(next.draftChoices[p]));
  assert.equal(next.draftRerolls[p],2);
 }
 for(const p of ['p3','p4'])assert.ok(noBanned(next.draft[p]));
});

test('Draft Condiviso: il pool e ogni carta disponibile escludono il ban globale',()=>{
 const next=beginUltimonDraftAfterBans(completed({sharedDraft:true}),()=>.7);
 assert.equal(next.status,'drafting');
 assert.equal(next.draftSequence.length,16);
 assert.equal(next.sharedDraftPool.length,16);
 assert.ok(noBanned(next.sharedDraftPool.map(entry=>entry.char)));
 assert.ok(next.sharedDraftPool.every(entry=>entry.pickedBy===null));
 assert.deepEqual(new Set(next.draftSequence),new Set(['p1','p2','p3','p4']));
});

test('Multimon in Nolo: bot e umani ottengono team generati senza bannati',()=>{
 const r=completed({rentalMode:true});
 const next=beginUltimonDraftAfterBans(r,()=>.42);
 assert.equal(next.status,'ultimon_showcase');
 for(const role of ['p1','p2','p3','p4']){
  assert.equal(next.ultimon.rosters[role].length,4);
  assert.ok(noBanned(next.ultimon.rosters[role]));
 }
 assert.equal(next.ultimonBans,undefined,'La patch non deve duplicare inutilmente i voti esistenti');
});

test('Guardia del lancio: un draft modificato in ritardo non può utilizzare un bannato',()=>{
 const r=completed();
 const safe=beginUltimonDraftAfterBans(r,()=>.34);
 const base=CHARACTERS.filter(c=>!c.isSummonOnly&&!c.isSecretUnlock).slice(2,6);
 assert.equal(base.length,4);
 const fake=Object.fromEntries(['p1','p2','p3','p4'].map(p=>[p,base]));
 fake.p1=[first,...base.slice(1)];
 const unsafe={...r,status:'drafting',draft:fake};
 assert.throws(()=>createUltimonShowcase(unsafe),/bannato/);
 const good={...unsafe,draft:Object.fromEntries(['p1','p2','p3','p4'].map(p=>[p,base]))};
 assert.equal(createUltimonShowcase(good).status,'ultimon_showcase');
 assert.equal(safe.status,'drafting');
});

test('Interfaccia e motore: ban prima del draft, filtro visivo e protezione di tutte le modalità di scelta',()=>{
 const file=p=>readFileSync(new URL(p,import.meta.url),'utf8');
 const lobby=file('../src/screens/battle/LobbyView.jsx');
 const ui=file('../src/screens/battle/UltimonView.jsx');
 const app=file('../src/App.jsx');
 const draft=file('../src/screens/battle/DraftingView.jsx');
 const system=file('../src/systems/multiplayerSystem.js');
 assert.match(lobby,/status:'ultimon_ban'/);
 assert.match(ui,/stage==='ultimon_ban'/);
 assert.match(ui,/CONFERMA IL BAN/);
 assert.match(ui,/onBan\(currentBanRole,banSelected\)/);
 assert.match(ui,/banContinue/);
 assert.match(app,/ultimonBanPatch\(room,role,charId\)/);
 assert.match(app,/beginUltimonDraftAfterBans\(room\)/);
 assert.match(app,/onBan=\{ultimonBan\}/);
 assert.match(draft,/!isUltimonBanned\(gameState,c\.id\)/);
 assert.match(system,/isUltimonBanned\(gameState,char\?\.id\)/);
 assert.match(system,/isUltimonBanned\(gameState,item\.char\?\.id\)/);
});
