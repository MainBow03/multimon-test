import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SOUNDTRACKS,ULTIMON_FINAL_SOUNDTRACK,DEFAULT_BATTLE_SOUNDTRACK,soundtrackForId} from '../src/data/soundtracks.js';
import {makeEventBracket,normalizeEventSettings,eventTurn,buildEventBattle} from '../src/systems/multiverseEventEngine.js';
import {mirroredBracketLayout,bracketParticipantRoster,tournamentMatchState} from '../src/systems/eventBracketLayout.js';
import {CHARACTERS} from '../src/data/characters.js';

const file=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const entrants=n=>Array.from({length:n},(_,i)=>({id:'team-'+i,name:'Squadra '+(i+1),members:['p'+i]}));
test('Bracket speculare a sinistra e destra per 4/8/16/32 squadre',()=>{
 for(const n of [4,8,16,32]){
  const matches=makeEventBracket(entrants(n),()=>.99);
  const layout=mirroredBracketLayout(matches);
  assert.equal(layout.rounds,Math.log2(n));
  assert.equal(layout.items.length,n-2);
  assert.equal(layout.items.filter(i=>i.side==='left').length,(n-2)/2);
  assert.equal(layout.items.filter(i=>i.side==='right').length,(n-2)/2);
  assert.equal(layout.paths.length,n-2);
  assert.equal(layout.final?.stage,'final');
  assert.equal(layout.bronze?.stage,'bronze');
  const outerLeft=layout.items.find(i=>i.side==='left'&&i.round===0);
  const outerRight=layout.items.find(i=>i.side==='right'&&i.round===0);
  assert.equal(outerLeft.x,0);
  assert.equal(outerRight.x+218,layout.width);
  assert.ok(layout.width>600);
  assert.ok(layout.centerX>layout.width*.25&&layout.centerX<layout.width*.6);
 }
});

test('Click giocatori e squadra: dati reali dei membri, non nomi inventati',()=>{
 const group={id:'x',name:'Giulia & Marco',members:['u1','u2']};
 const people=[{uid:'u1',name:'Giulia',teamIds:['finn','garnet'],avatar:'https://example.com/u1.png'},{id:'u2',name:'Marco',teamIds:['sonic']}];
 const members=bracketParticipantRoster(group,people);
 assert.deepEqual(members.map(p=>p.name),['Giulia','Marco']);
 assert.deepEqual(members[0].teamIds,['finn','garnet']);
 assert.equal(bracketParticipantRoster(null,people).length,0);
 assert.equal(tournamentMatchState({id:'r0-m0',sideA:group,sideB:group},'r0-m0'),'live');
 assert.equal(tournamentMatchState({id:'r0-m0',winner:group},'r0-m0'),'complete');
 const jsx=file('../src/screens/events/MultiverseBracket.jsx');
 assert.match(jsx,/setSelected\(playerId\(person\)\)/);
 assert.match(jsx,/mv-bracket-fighter/);
 assert.match(jsx,/selectedPerson\?\.teamIds/);
 assert.match(jsx,/mv-bracket-modal/);
});

test('Tre OST aggiunte con IDs originali e Ultra Instinct Remix finale ufficiale',()=>{
 const requested={
   'SYTS2sJWcIs':'Champion and Red',
   '_xEDmgVscdc':'Ultra Instinct Remix',
   'gASj-wzktTM':'Beast Gohan'
 };
 for(const [id,name] of Object.entries(requested)){
  assert.equal(SOUNDTRACKS.filter(x=>x.id===id).length,1);
  assert.equal(soundtrackForId(id).name,name);
  assert.equal(normalizeEventSettings({soundtrack:id}).soundtrack,id);
 }
 assert.equal(ULTIMON_FINAL_SOUNDTRACK,'_xEDmgVscdc');
 assert.equal(normalizeEventSettings({soundtrack:'invalid ID'}).soundtrack,DEFAULT_BATTLE_SOUNDTRACK);
 const app=file('../src/App.jsx');
 assert.match(app,/ultimonFinalTheme\?ULTIMON_FINAL_SOUNDTRACK/);
});

test('Musica e stili: stessa battle view, anteprima nelle due lobby, nessun remount per turno',()=>{
 const event=file('../src/screens/events/MultiverseEventHub.jsx');
 const lobby=file('../src/screens/battle/LobbyView.jsx');
 const arena=file('../src/screens/events/StandardTournamentBattle.jsx');
 const music=file('../src/components/SoundtrackPicker.jsx');
 const setup=file('../src/screens/events/EventSetupPanel.jsx');
 assert.match(event,/<MultiverseBracket/);
 assert.match(event,/<EventSetupPanel/);
 assert.match(event,/key=\{event\.activeBattle\.matchId\}/);
 assert.match(arena,/renderBattlingView\(\{/);
 assert.match(arena,/<EventBattleMusic/);
 assert.match(lobby,/<SoundtrackPicker compact/);
 assert.match(setup,/<SoundtrackPicker/);
 assert.match(setup,/TIPOLOGIA DI LOTTA/);
 assert.match(setup,/STILE DI LOTTA/);
 assert.match(music,/youtube\.com\/embed/);
 assert.match(music,/setPreviewId/);
});

function unit(id,owner,moves,extras={}){
 const c=CHARACTERS.find(c=>c.id===id);
 return {id,name:c.name,key:owner+'-'+id,owner,hp:100,maxHp:100,
  atk:c.atk,baseAtk:c.atk,def:100,baseDef:100,spd:c.spd,baseSpd:c.spd,
  spAtk:c.spAtk||c.atk,types:c.types,statuses:[],passive:c.passive,
  heldItem:null,moves, ...extras};
}
function arena(A,B){return {matchId:'match',side:'A',turn:1,teams:{A,B},owners:{A:['p1'],B:['p2']},
 weather:null,hyperUsed:{},finished:false,winner:null,log:[]};}
const s=normalizeEventSettings({entrants:4,teamSize:4,fieldSize:2});
test('Supporto da battaglia classica: cura il team e applica la passiva di Ladybug',()=>{
 const lady=unit('ladybug','p1',[{name:'Miraculous Ladybug',type:'Magico',power:0,accuracy:1,
  uses:2,targetMode:'team_smart_heal',healTeam:.4,healAlone:.5}]);
 const ally=unit('finn','p1',[],{hp:20});
 const foe=unit('garnet','p2',[],{hp:1000,maxHp:1000});
 const out=eventTurn(arena([lady,ally],[foe]),{p1:[{actor:lady.key,moveIndex:0}]},s,()=>.5);
 assert.equal(out.teams.A[0].hp,100);
 assert.equal(out.teams.A[1].hp,70,'40% cura di squadra + 10% passiva Ladybug');
 assert.equal(out.teams.A[0].passiveUses,1);
});

test('Protezione funziona durante il turno nemico come nella battaglia classica',()=>{
 const garnet=unit('garnet','p1',[{name:'Visione del Futuro',type:'Magico',power:0,accuracy:1,
  isProtect:true,priority:5,uses:4}]);
 const enemy=unit('finn','p2',[{name:'Pugno',type:'Lotta',power:80,accuracy:1,uses:10,targetCount:1}]);
 const b=eventTurn(arena([garnet],[enemy]),{p1:[{actor:garnet.key,moveIndex:0}]},s,()=>.5);
 assert.equal(b.teams.A[0].statuses.includes('Protetto'),true);
 const next=eventTurn(b,{p2:[{actor:enemy.key,moveIndex:0,target:garnet.key}]},s,()=>.5);
 assert.equal(next.teams.A[0].hp,100);
 assert.ok(next.log.some(x=>x.includes('blocca Pugno')));
 assert.equal(next.teams.A[0].futureStrikeCharged,true);
 assert.equal(next.teams.A[0].futureBlockUses,1);
});

test('Le mosse multicolpo infliggono più colpi reali, non soltanto testo',()=>{
 const attacker=unit('spyro','p1',[{name:'Gemme',type:'Roccia',power:20,accuracy:1,uses:8,
  multiHit:{min:3,max:3},targetCount:1}],{atk:105});
 const defender=unit('garnet','p2',[],{hp:1000,maxHp:1000,def:100});
 const full=eventTurn(arena([attacker],[defender]),{p1:[{actor:attacker.key,moveIndex:0,target:defender.key}]},s,()=>.5);
 const single=eventTurn(arena([{...attacker,moves:[{...attacker.moves[0],multiHit:null}]}],[defender]),
  {p1:[{actor:attacker.key,moveIndex:0,target:defender.key}]},s,()=>.5);
 assert.ok(full.teams.B[0].hp<single.teams.B[0].hp);
 assert.ok(full.log.some(x=>x.includes('colpisce 3 volte')));
});
