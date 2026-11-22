import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {
 createRealAscensionBattle,advanceRealAscensionBattle,
 chooseRealAscensionReplacement,recoverRealAscensionCpuReplacement
} from '../src/systems/ascensionRealBattle.js';

const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const member=id=>{
 const c=CHARACTERS.find(ch=>ch.id===id);
 assert.ok(c,'Multimon test non trovato: '+id);
 return {id,level:3,hp:Math.max(15,Math.round((c.maxHp||c.hp||100)*.78))};
};
const battle=(human=['sonic','luigi'],bot=['gardevoir','finn'])=>
 createRealAscensionBattle({
  chars:CHARACTERS,teamOne:human.map(member),teamTwo:bot.map(member),
  firstName:'Allenatore',secondName:'CPU Nilo',firstBot:false,
  secondBot:true,fieldSize:1
 });
const makeKo=(b,side)=>{
 b.teams[side][b.field[side][0]].hp=0;
 b.status='executing';
 b.postExecStatus='battling';
 b.events=[{type:'faint',text:'Un Multimon è esausto!'}];
 return b;
};
test('CPU KO con una riserva: entra automaticamente senza attendere un altro giocatore',()=>{
 const b=makeKo(battle(),'p2');
 const next=advanceRealAscensionBattle(b,b.phaseStartedAt,CHARACTERS);
 assert.equal(next.status,'executing',
  'La sostituzione CPU deve produrre subito una vera animazione di ingresso');
 assert.deepEqual(next.field.p2,[1]);
 assert.ok(next.teams.p2[1].hp>0);
 assert.ok(next.events.some(e=>e.type==='switch'&&e.player==='p2'&&e.newIdx===1));
 assert.equal(next.postExecStatus,'battling');
 const afterReplay=advanceRealAscensionBattle(next,next.phaseStartedAt,CHARACTERS);
 assert.equal(afterReplay.status,'battling','Lo scontro riprende da solo dopo l ingresso CPU');
 assert.equal(afterReplay.teams.p2[0].hp,0);
});

test('Se anche il giocatore ha un KO, la CPU sceglie subito e aspetta solo la scelta umana',()=>{
 const b=makeKo(battle(),'p2');
 b.teams.p1[0].hp=0;
 const next=advanceRealAscensionBattle(b,b.phaseStartedAt,CHARACTERS);
 assert.equal(next.status,'switching_phase');
 assert.equal(next.pendingSwitches.p1,1);
 assert.deepEqual(next.switchActions.p2,[1],
  'CPU scelta automaticamente, senza forzare il cambio del giocatore');
 assert.deepEqual(next.switchActions.p1,[]);
 const replaced=chooseRealAscensionReplacement(next,'p1',1,CHARACTERS);
 assert.equal(replaced.status,'executing');
 assert.deepEqual(replaced.field.p1,[1]);
 assert.deepEqual(replaced.field.p2,[1]);
 assert.equal(replaced.events.filter(e=>e.type==='switch').length,2);
});

test('Recupero di una stanza già bloccata nella fase sostituzione CPU',()=>{
 const b=makeKo(battle(),'p2');
 // Simula la versione precedente: passava a switching_phase e non
 // richiamava resolveSwitchingRoom per il bot.
 b.status='switching_phase';
 b.pendingSwitches={p1:0,p2:1};
 b.switchActions={p1:[],p2:[]};
 b.field.p2=[0];
 const repaired=recoverRealAscensionCpuReplacement(b,CHARACTERS);
 assert.equal(repaired.status,'executing');
 assert.deepEqual(repaired.field.p2,[1]);
 assert.ok(repaired.events.some(e=>e.type==='switch'&&e.player==='p2'));
});

test('CPU senza riserve: lo scontro termina, nessuna schermata di attesa obbligatoria',()=>{
 const b=makeKo(battle(['sonic'],['gardevoir']),'p2');
 const next=advanceRealAscensionBattle(b,b.phaseStartedAt,CHARACTERS);
 assert.equal(next.status,'gameover');
 assert.notEqual(next.status,'switching_phase');
});

test('Il Colosseo ripara automaticamente le stanze bloccate e conserva il cambio manuale umano',()=>{
 const controller=read('../src/screens/battle/AscensionClassicBattle.jsx');
 const router=read('../src/App.jsx');
 const asc=read('../src/systems/colosseumAscension.js');
 assert.match(controller,/getRequiredSwitches\(native,\['p1','p2'\]\)/);
 assert.match(controller,/onAction\('native-auto-switch'/);
 assert.match(router,/kind==='native-auto-switch'/);
 assert.match(asc,/export function ascensionRealAutoReplace/);
 assert.match(asc,/advanceRealAscensionBattle\(s\.battle,phase,chars\)/);
 assert.match(asc,/recoverRealAscensionCpuReplacement\(s\.battle,chars\)/);
});

test('Il tabellone ha quarti a sinistra/destra, semifinali e finale al centro',()=>{
 const bracket=read('../src/screens/battle/AscensionBracket.jsx');
 const styles=read('../src/screens/battle/AscensionBracket.css');
 const view=read('../src/screens/battle/AscensionView.jsx');
 for(const id of ['q0','q1','q2','q3','s0','s1','f0'])
  assert.ok(bracket.includes("'"+id+"'")||/['"]q['"]\+i/.test(bracket)&&id.startsWith('q'),
   'Il tabellone deve contenere '+id);
 assert.match(bracket,/room\.playerAvatars\?\.\[role\]/);
 assert.match(bracket,/ac-tourney-column--grand-final/);
 assert.match(bracket,/ac-tourney-column--quarters-left/);
 assert.match(bracket,/ac-tourney-column--quarters-right/);
 assert.match(bracket,/ac-tourney-column--semi-left/);
 assert.match(bracket,/ac-tourney-column--semi-right/);
 assert.match(bracket,/placeholder\('f0','finale',\[s0,s1\]\)/);
 assert.match(view,/AscensionBracket/);
 assert.doesNotMatch(view,/className="ac-bracket"/);
 assert.match(styles,/overflow-x:auto/);
 assert.match(styles,/@media\(max-width:850px\)/);
});
