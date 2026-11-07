import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 ULTIMON_ENTRANCE_EFFECTS,ULTIMON_INTRO_STEPS,
 ultimonIntroEntrance,ultimonIntroEntrancePatch,
 ultimonIntroMonologuePatch,advanceUltimonIntroduction,
 ultimonIntroductionReady
} from '../src/systems/ultimonIntro.js';

const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const makeRoom=(bot=false)=>({
 gameMode:'ultimon',status:'ultimon_intro',
 settings:{maxPlayers:4},
 players:{p1:'Player One',p2:'Player Two',p3:'Player Three',p4:'Bot'},
 isBot:{p1:bot,p2:false,p3:false,p4:true},
 ultimon:{
  intro:{
   order:['p1','p2','p3','p4'],
   index:0,step:'speech',lineIndex:0,
   monologues:{},entrances:{},
   casts:{p1:[0],p2:[0],p3:[0],p4:[0]}
  },
  rosters:{
   p1:[{id:'goku',name:'Goku',img:'avatar.png',hp:100}],
   p2:[{id:'jake',name:'Jake',img:'avatar.png',hp:100}],
   p3:[{id:'kirby',name:'Kirby',img:'avatar.png',hp:100}],
   p4:[{id:'robin',name:'Robin',img:'avatar.png',hp:100}]
  }
 }
});
function apply(room,patch){
 const next=structuredClone(room);
 for(const [key,value] of Object.entries(patch)){
  const fragments=key.split('.'),last=fragments.pop();
  let node=next;
  for(const fragment of fragments)node=node[fragment];
  node[last]=value;
 }
 return next;
}

test('Sei entrate differenti, ciascuna con tema, annunciatore e colore',()=>{
 assert.equal(ULTIMON_ENTRANCE_EFFECTS.length,6);
 assert.deepEqual(ULTIMON_ENTRANCE_EFFECTS.map(x=>x.id),
 ['starfall','thunder','portal','inferno','royal','glitch']);
 assert.equal(new Set(ULTIMON_ENTRANCE_EFFECTS.map(x=>x.name)).size,6);
 for(const effect of ULTIMON_ENTRANCE_EFFECTS){
  assert.ok(effect.name.length>6);
  assert.ok(effect.icon);
  assert.ok(effect.hint.length>35);
  assert.ok(effect.announcer.length>30);
  assert.ok(effect.tagline.length>20);
  assert.match(effect.color,/^#[\da-f]{6}$/i);
 }
 for(const step of ['call','speech','entrance_select','entrance','line','exit','complete'])
  assert.ok(ULTIMON_INTRO_STEPS.includes(step),step);
});

test('Dopo il monologo il presentatore DEVE aspettare l’ingresso umano',()=>{
 let room=makeRoom();
 assert.throws(()=>ultimonIntroEntrancePatch(room,'p1','starfall'),/Non puoi scegliere/);
 assert.throws(()=>advanceUltimonIntroduction(room),/monologo/);
 room=apply(room,ultimonIntroMonologuePatch(room,'p1',
  'La mia squadra è pronta, e oggi il pubblico assisterà a qualcosa di grandioso!'));
 assert.equal(advanceUltimonIntroduction(room)['ultimon.intro.step'],'entrance_select');
 room=apply(room,advanceUltimonIntroduction(room));
 assert.throws(()=>advanceUltimonIntroduction(room),/ingresso ad effetto/);
 assert.throws(()=>ultimonIntroEntrancePatch(room,'p2','portal'),/Non puoi scegliere/);
 assert.throws(()=>ultimonIntroEntrancePatch(room,'p1','fantasy'),/sei ingressi/);
 room=apply(room,ultimonIntroEntrancePatch(room,'p1','portal'));
 assert.equal(ultimonIntroEntrance(room,'p1'),'portal');
 assert.throws(()=>ultimonIntroEntrancePatch(room,'p1','inferno'),/già stato confermato/);
 room=apply(room,advanceUltimonIntroduction(room));
 assert.equal(room.ultimon.intro.step,'entrance');
 assert.equal(advanceUltimonIntroduction(room)['ultimon.intro.step'],'line');
 room=apply(room,advanceUltimonIntroduction(room));
 assert.equal(room.ultimon.intro.step,'line');
 assert.equal(advanceUltimonIntroduction(room)['ultimon.intro.step'],'exit');
});

test('Una CPU riceve un effetto automatico e il presentatore non rimane bloccato',()=>{
 let room=makeRoom(true);
 const auto=ultimonIntroEntrance(room,'p1');
 assert.ok(ULTIMON_ENTRANCE_EFFECTS.some(x=>x.id===auto));
 assert.equal(room.ultimon.intro.entrances.p1,undefined);
 room=apply(room,advanceUltimonIntroduction(room));
 assert.equal(room.ultimon.intro.step,'entrance_select');
 assert.throws(()=>ultimonIntroEntrancePatch(room,'p1','inferno'),/Non puoi scegliere/);
 room=apply(room,advanceUltimonIntroduction(room));
 assert.equal(room.ultimon.intro.step,'entrance');
});

test('I duelli continuano ad aspettare tutti gli ingressi, compresi gli umani',()=>{
 const room=makeRoom();
 room.ultimon.intro.step='complete';
 room.ultimon.intro.monologues.p1='Monologo p1';
 room.ultimon.intro.monologues.p2='Monologo p2';
 room.ultimon.intro.monologues.p3='Monologo p3';
 room.ultimon.intro.entrances.p1='glitch';
 room.ultimon.intro.entrances.p2='inferno';
 assert.equal(ultimonIntroductionReady(room),false);
 room.ultimon.intro.entrances.p3='royal';
 assert.equal(ultimonIntroductionReady(room),true);
 const oldRoom=structuredClone(room);
 delete oldRoom.ultimon.intro.entrances;
 assert.equal(ultimonIntroductionReady(oldRoom),true,
  'Presentazioni iniziate con la versione vecchia possono finire');
});

test('La scena e i sei effetti appaiono a TUTTI, con supporto tablet e movimento ridotto',()=>{
 const intro=read('../src/screens/battle/UltimonIntroView.jsx');
 const css=read('../src/screens/battle/UltimonIntroView.css');
 const view=read('../src/screens/battle/UltimonView.jsx');
 const app=read('../src/App.jsx');
 assert.match(intro,/step==='entrance_select'/);
 assert.match(intro,/step==='entrance'/);
 assert.match(intro,/ULTIMON_ENTRANCE_EFFECTS\.map/);
 assert.match(intro,/onEntrance\(role,effect\.id\)/);
 assert.match(intro,/entranceReady/);
 assert.match(intro,/entrance:6700/);
 assert.match(intro,/ultimon-intro-entrance-fighter/);
 for(const name of ['starfall','thunder','portal','inferno','royal','glitch'])
  assert.match(css,new RegExp('entrance-show--'+name));
 assert.match(css,/ultimon-cinema-portal/);
 assert.match(css,/ultimon-cinema-lightning/);
 assert.match(css,/ultimon-cinema-embers/);
 assert.match(css,/@media\(max-width:700px\)/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(view,/onEntrance=\{onEntrance\}/);
 assert.match(app,/ultimonIntroEntrancePatch\(room,role,effectId\)/);
 assert.match(app,/onEntrance=\{ultimonEntrance\}/);
});
