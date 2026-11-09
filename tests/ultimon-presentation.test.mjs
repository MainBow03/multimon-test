import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createUltimonShowcase,finishUltimonDuel,finishUltimonElimination,
  ultimonIsFinalShowdown,ultimonLeaderboard,ULTIMON_STAGES}
  from '../src/systems/ultimonSystem.js';
import {GAME_IN_PROGRESS} from '../src/systems/roomRecovery.js';

const fighter=(name,hp=100)=>({id:name,name,img:'https://example.com/'+name+'.png',
  hp,maxHp:100,atk:75,def:50,spd:60,moves:[{name:'Tackle',power:50}]});
const setup=()=>{
 const roles=['p1','p2','p3','p4'];
 const base={gameMode:'ultimon',status:'drafting',
   settings:{maxPlayers:4,teamSize:2,fieldSize:1},
   players:{p1:'Alice',p2:'Bob',p3:'Cody',p4:'Dina'},
   isBot:{p1:false,p2:true,p3:true,p4:true},
   draft:Object.fromEntries(roles.map(p=>[p,[fighter(p+'a'),fighter(p+'b')]]))};
 return {...base,...createUltimonShowcase(base)};
};
const finish=(room,a,b,loseA=true)=>{
 room.status='ultimon_result';
 room.ultimon.pair=[a,b];
 room.ultimon.round=(room.ultimon.round||0)+1;
 room.ultimon.format=1;
 room.ultimon.selected={[a]:[0],[b]:[0]};
 room.teams={[a]:[fighter(a+'a',loseA?0:100)],[b]:[fighter(b+'a',loseA?100:0)]};
 return finishUltimonDuel(room);
};
const apply=(room,patch)=>{
 for(const [path,value] of Object.entries(patch)){
   if(!path.includes('.'))room[path]=value;
   else{
     const parts=path.split('.');
     const last=parts.pop();let target=room;
     for(const part of parts)target=target[part];
     target[last]=value;
   }
 }
 return room;
};
test('Il verdetto passa a una cerimonia dedicata quando un roster viene eliminato',()=>{
 const room=setup();
 room.ultimon.rosters.p2[1].hp=0;
 apply(room,finish(room,'p2','p1'));
 assert.equal(room.status,'ultimon_elimination');
 assert.ok(ULTIMON_STAGES.includes('ultimon_elimination'));
 assert.ok(GAME_IN_PROGRESS.includes('ultimon_elimination'));
 assert.deepEqual(room.ultimon.history.at(-1).eliminated,['p2']);
 const table=ultimonLeaderboard(room);
 assert.equal(table.at(-1).role,'p2');
 assert.equal(table.filter(p=>p.alive>0).length,3);
 apply(room,finishUltimonElimination(room));
 assert.equal(room.status,'ultimon_recap');
 assert.throws(()=>finishUltimonElimination(room),/cerimonia/);
});

test('Solo il KO definitivo provoca la cerimonia; le riserve vive mantengono la squadra in gara',()=>{
 const room=setup();
 apply(room,finish(room,'p2','p1'));
 assert.equal(room.ultimon.rosters.p2[0].hp,0);
 assert.equal(room.ultimon.rosters.p2[1].hp,100);
 assert.equal(room.status,'ultimon_recap');
 assert.equal(room.ultimon.history.at(-1).eliminated.length,0);
});

test('La finalissima compare solo quando rimangono esattamente due squadre',()=>{
 const room=setup();
 assert.equal(ultimonIsFinalShowdown(room),false);
 room.ultimon.rosters.p3.forEach(c=>{c.hp=0;});
 assert.equal(ultimonIsFinalShowdown(room),false);
 room.ultimon.rosters.p4.forEach(c=>{c.hp=0;});
 assert.equal(ultimonIsFinalShowdown(room),true);
 room.ultimon.rosters.p1.forEach(c=>{c.hp=0;});
 assert.equal(ultimonIsFinalShowdown(room),false);
 assert.equal(ultimonIsFinalShowdown({gameMode:'torneo',...room,gameMode:'torneo'}),false);
});

test('Cerimonia finale precede premi ed epilogo: nessun accredito anticipato',()=>{
 const room=setup();
 for(const p of ['p3','p4'])room.ultimon.rosters[p].forEach(c=>{c.hp=0;});
 room.ultimon.eliminated=['p3','p4'];
 room.ultimon.rosters.p2[1].hp=0;
 apply(room,finish(room,'p2','p1'));
 assert.equal(room.status,'ultimon_elimination');
 assert.equal(room.ultimon.champion,'p1');
 apply(room,finishUltimonElimination(room));
 assert.equal(room.status,'ultimon_final');
 assert.equal(ultimonLeaderboard(room)[0].role,'p1');
 assert.throws(()=>finishUltimonElimination(room),/cerimonia/);
});

test('La UI contiene tabellone in diretta, KO oscurati, cerimonia e Gran Finale',()=>{
 const view=readFileSync(new URL('../src/screens/battle/UltimonView.jsx',import.meta.url),'utf8');
 const css=readFileSync(new URL('../src/screens/battle/UltimonView.css',import.meta.url),'utf8');
 const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
 const battle=readFileSync(new URL('../src/screens/battle/BattlingView.jsx',import.meta.url),'utf8');
 assert.match(view,/function SurvivorBoard/);
 assert.match(view,/function EliminationCeremony/);
 assert.match(view,/stage==='ultimon_elimination'/);
 assert.match(view,/,\s*'ceremony'\)/);
 assert.match(view,/ULTIMO DUELLO/);
 assert.match(view,/className=\{'ultimon-board-avatar/);
 assert.match(css,/ultimon-board-avatar--ko img\{filter:grayscale/);
 assert.match(css,/\.ultimon-ceremony-fighters/);
 assert.match(css,/\.ultimon-final-arena-glow/);
 assert.match(app,/finishUltimonElimination/);
 assert.match(app,/ceremony:\{allowed:\['ultimon_elimination'\]/);
 assert.match(app,/ultimonFinalTheme\?ULTIMON_FINAL_SOUNDTRACK/);
 assert.match(battle,/ultimonIsFinalShowdown\(gameState\)/);
 assert.match(battle,/ULTIMO DUELLO/);
});
