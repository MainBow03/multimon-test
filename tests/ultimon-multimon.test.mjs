import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ULTIMON_COLORS,createUltimonShowcase,identityPatch,allUltimonNamed,
 nextUltimonPair,revealUltimonFormat,pickPatch,ultimonPicksReady,
 startUltimonDuel,ultimonDuelOutcome,finishUltimonDuel,ultimonLeaderboard
} from '../src/systems/ultimonSystem.js';
import {getActivePlayersImpl,getRequiredPlayersImpl} from '../src/systems/multiplayerSystem.js';
import {prepareEmergencySwitch,nextPhaseAfterExecution} from '../src/systems/roomRecovery.js';

const mkChar=(p,i,hp=100)=>({id:p+'-c'+i,name:p+' Hero '+i,
  img:'https://example.com/'+p+i+'.png',hp,maxHp:100,atk:65,def:55,spd:60,
  spAtk:65,spDef:55,types:['Fuoco'],moves:[{name:'Attacco',type:'Fuoco',power:50,accuracy:1}]});
const room=(n=4,size=3)=>({
 gameMode:'ultimon',status:'drafting',
 settings:{maxPlayers:n,teamSize:size,fieldSize:1},
 players:Object.fromEntries(Array.from({length:n},(_,i)=>['p'+(i+1),'Persona '+(i+1)])),
 isBot:Object.fromEntries(Array.from({length:n},(_,i)=>['p'+(i+1),i>1])),
 draft:Object.fromEntries(Array.from({length:n},(_,i)=>['p'+(i+1),
   Array.from({length:size},(_,j)=>mkChar('p'+(i+1),j))]))
});
const put=(base,patch)=>{
 const v=structuredClone(base);
 for(const [path,value] of Object.entries(patch)){
  if(!path.includes('.'))v[path]=value;
  else{
   const parts=path.split('.'),last=parts.pop();
   let obj=v;
   for(const k of parts)obj=obj[k];
   obj[last]=value;
  }
 }
 return v;
};
const renamed=state=>{
 state=put(state,identityPatch(state,'p1','Le Meteore',ULTIMON_COLORS[0].hex));
 state=put(state,identityPatch(state,'p2','Gli Eroi',ULTIMON_COLORS[1].hex));
 return state;
};
test('Ultimon accetta 4–8 giocatori e 20 colori distinti',()=>{
 assert.equal(ULTIMON_COLORS.length,20);
 assert.equal(new Set(ULTIMON_COLORS.map(c=>c.hex)).size,20);
 for(const n of [4,6,8]){
  const initial=room(n);
  assert.equal(getRequiredPlayersImpl({},'ultimon',initial.settings),n);
  const state=put(initial,createUltimonShowcase(initial));
  assert.equal(Object.keys(state.ultimon.rosters).length,n);
  assert.ok(state.ultimon.rosters.p1.every(c=>c.hp===100));
 }
 assert.throws(()=>createUltimonShowcase(room(3)),/4 a 8/);
});
test('Nomi e colori sono scelti dai partecipanti prima del sorteggio',()=>{
 const r=put(room(),createUltimonShowcase(room()));
 assert.equal(allUltimonNamed(r),false);
 assert.throws(()=>identityPatch(r,'p1','A','#ff0000'),/2 caratteri|20 colori/);
 const withName=put(r,identityPatch(r,'p1','Squadra A',ULTIMON_COLORS[0].hex));
 assert.throws(()=>identityPatch(withName,'p2','Squadra B',ULTIMON_COLORS[0].hex),/già assegnato/);
 const ready=put(withName,identityPatch(withName,'p2','Squadra B',ULTIMON_COLORS[1].hex));
 assert.equal(allUltimonNamed(ready),true);
});
test('Il formato non supera mai i Multimon rimasti ai due sfidanti',()=>{
 let state=renamed(put(room(8),createUltimonShowcase(room(8))));
 state=put(state,nextUltimonPair(state,()=>0));
 assert.equal(state.status,'ultimon_pair');
 assert.equal(getActivePlayersImpl({gameState:state}).length,2);
 const pair=state.ultimon.pair;
 state.ultimon.rosters[pair[1]][1].hp=0;
 state.ultimon.rosters[pair[1]][2].hp=0;
 state=put(state,revealUltimonFormat(state,()=>.999));
 assert.equal(state.ultimon.format,1);
 assert.equal(state.status,'ultimon_format');
});
test('Scelte valide, lotta classica, KO permanenti, cura della squadra vincente',()=>{
 let state=renamed(put(room(),createUltimonShowcase(room())));
 state=put(state,nextUltimonPair(state,()=>.11));
 const [a,b]=state.ultimon.pair;
 state=put(state,revealUltimonFormat(state,()=>.99));
 assert.equal(state.ultimon.format,3);
 state=put(state,{status:'ultimon_pick'});
 for(const role of [a,b]){
  if(state.isBot[role])continue;
  assert.throws(()=>pickPatch(state,role,[0]),/esattamente/);
  state=put(state,pickPatch(state,role,[0,1,2]));
 }
 assert.equal(ultimonPicksReady(state),true);
 state=put(state,startUltimonDuel(state));
 assert.equal(state.status,'pre_battle');
 assert.equal(state.settings.fieldSize,3);
 assert.deepEqual(state.field[a],[0,1,2]);
 assert.equal(state.teams[a].length,3);
 assert.equal(state.teams[b].length,3);
 // La squadra b perde un eroe, ma vince il duello (A perde tutti gli schierati).
 state.teams[a].forEach(c=>{c.hp=0;});
 state.teams[b][0].hp=0;state.teams[b][1].hp=20;state.teams[b][2].hp=40;
 assert.equal(ultimonDuelOutcome(state).winner,b);
 assert.equal(prepareEmergencySwitch({...state,status:'battling'},[a,b])?.status,'ultimon_result');
 state=put(state,{status:'ultimon_result'});
 state=put(state,finishUltimonDuel(state));
 assert.equal(state.ultimon.rosters[a].filter(c=>c.hp>0).length,0);
 assert.equal(state.ultimon.rosters[b][state.ultimon.selected[b][0]].hp,0);
 assert.equal(state.ultimon.rosters[b][state.ultimon.selected[b][1]].hp,70);
 assert.equal(state.ultimon.rosters[b][state.ultimon.selected[b][2]].hp,90);
 assert.equal(state.ultimon.stats[b].wins,1);
 assert.ok(state.ultimon.eliminated.includes(a));
 assert.equal(state.status,'ultimon_elimination');
 assert.equal(state.ultimon.history.length,1);
 const ranks=ultimonLeaderboard(state);
 assert.equal(ranks.at(-1).role,a);
});
test('Il finale premia l’unica squadra viva e produce la classifica',()=>{
 let state=renamed(put(room(),createUltimonShowcase(room())));
 for(const p of ['p2','p3','p4'])state.ultimon.rosters[p].forEach(c=>{c.hp=0;});
 state=put(state,nextUltimonPair(state,()=>0));
 assert.equal(state.status,'ultimon_final');
 assert.equal(state.ultimon.champion,'p1');
 assert.equal(ultimonLeaderboard(state)[0].role,'p1');
});
test('Ultimon usa la fine animazioni dedicata senza avviare sostituzioni da una riserva esterna',()=>{
 const b=readFileSync(new URL('../src/systems/battleSystem.js',import.meta.url),'utf8');
 const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
 const lobby=readFileSync(new URL('../src/screens/battle/LobbyView.jsx',import.meta.url),'utf8');
 assert.match(b,/nextStatus = 'ultimon_result'/);
 assert.match(b,/nextStatus !== 'ultimon_result'/);
 assert.match(b,/gameState.postExecStatus === 'ultimon_result'/);
 assert.match(app,/ULTIMON_STAGES.includes\(gameState.status\)/);
 assert.match(lobby,/value="ultimon"/);
 const r={status:'executing',gameMode:'ultimon',postExecStatus:'ultimon_result',
  teams:{p1:[mkChar('p1',0)],p2:[]},field:{p1:[0],p2:[]},settings:{fieldSize:1},pendingSwitches:{}};
 assert.equal(nextPhaseAfterExecution(r,['p1','p2'])?.status,'ultimon_result');
});
