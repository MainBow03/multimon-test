import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 ULTIMON_INTRO_AUTO_ADVANCE_MS,ultimonIntroSceneReady,ultimonIntroSceneDeadline,
 ultimonIntroMonologuePatch,ultimonIntroEntrancePatch,advanceUltimonIntroduction,
 skipUltimonCurrentPresentation
} from '../src/systems/ultimonIntro.js';
import {ULTIMON_BASIC_ENTRANCE} from '../src/systems/ultimonCosmetics.js';

const roster={id:'finn',name:'Finn',hp:100,maxHp:100,moves:[],types:['Lotta']};
const getRoom=()=>({
 gameMode:'ultimon',status:'ultimon_intro',phaseStartedAt:1000,
 settings:{maxPlayers:4},
 players:{p1:'Alice',p2:'Marco',p3:'Bot',p4:'Bot 2'},
 isBot:{p1:false,p2:false,p3:true,p4:true},
 ultimon:{
  rosters:{p1:[roster],p2:[roster],p3:[roster],p4:[roster]},
  intro:{index:0,step:'call',lineIndex:0,order:['p1','p2','p3','p4'],
   monologues:{},entrances:{},casts:{p1:[0],p2:[0],p3:[0],p4:[0]}}
 }
});
const apply=(room,patch)=>{
 const next=structuredClone(room);
 for(const [path,value] of Object.entries(patch)){
  const p=path.split('.'),key=p.pop();
  let pointer=next;
  for(const item of p)pointer=pointer[item];
  pointer[key]=value;
 }
 return next;
};
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');

test('TUTTE le scene pronte hanno 20 secondi esatti prima dell’auto-avanzamento',()=>{
 const base=getRoom();
 assert.equal(ULTIMON_INTRO_AUTO_ADVANCE_MS,20000);
 for(const step of ['call','entrance','line','exit']){
  const r={...base,ultimon:{...base.ultimon,intro:{...base.ultimon.intro,step}}};
  assert.equal(ultimonIntroSceneReady(r),true,step);
  assert.equal(ultimonIntroSceneDeadline(r),21000,step);
 }
 assert.equal(ultimonIntroSceneReady({...base,ultimon:{...base.ultimon,intro:{...base.ultimon.intro,step:'complete'}}}),false);
});

test('Nessun timer mentre un capitano scrive o seleziona il proprio ingresso',()=>{
 let r=apply(getRoom(),advanceUltimonIntroduction(getRoom()));
 assert.equal(r.ultimon.intro.step,'speech');
 assert.equal(ultimonIntroSceneReady(r),false);
 assert.equal(ultimonIntroSceneDeadline(r),null);
 assert.throws(()=>skipUltimonCurrentPresentation(r),/monologo/);
 const submitted=ultimonIntroMonologuePatch(r,'p1','Questo è il monologo creativo della nostra squadra.');
 assert.ok(Number.isFinite(submitted.phaseStartedAt));
 r=apply(r,submitted);
 assert.equal(ultimonIntroSceneReady(r),true);
 assert.equal(ultimonIntroSceneDeadline(r),submitted.phaseStartedAt+20000);
 assert.throws(()=>skipUltimonCurrentPresentation(r),/ingresso/);
 r=apply(r,advanceUltimonIntroduction(r));
 assert.equal(r.ultimon.intro.step,'entrance_select');
 assert.equal(ultimonIntroSceneReady(r),false);
 assert.equal(ultimonIntroSceneDeadline(r),null);
 const entrance=ultimonIntroEntrancePatch(r,'p1',ULTIMON_BASIC_ENTRANCE.id,[]);
 assert.ok(entrance.phaseStartedAt);
 r=apply(r,entrance);
 assert.equal(ultimonIntroSceneReady(r),true);
 assert.equal(ultimonIntroSceneDeadline(r),entrance.phaseStartedAt+20000);
});

test('Host: salta solo la parte restante della squadra dopo i contributi del capitano',()=>{
 let r=getRoom();
 r=apply(r,advanceUltimonIntroduction(r));
 r=apply(r,ultimonIntroMonologuePatch(r,'p1','La nostra grande squadra è pronta a sfidare il mondo!'));
 r=apply(r,advanceUltimonIntroduction(r));
 r=apply(r,ultimonIntroEntrancePatch(r,'p1',ULTIMON_BASIC_ENTRANCE.id,[]));
 const before=structuredClone(r);
 const patch=skipUltimonCurrentPresentation(r);
 assert.equal(patch['ultimon.intro.index'],1);
 assert.equal(patch['ultimon.intro.step'],'call');
 assert.equal(patch['ultimon.intro.lineIndex'],0);
 assert.equal(r.ultimon.intro.index,0,'Non deve alterare direttamente il documento Firestore');
 assert.deepEqual(r,before);
 const next=apply(r,patch);
 assert.equal(next.ultimon.intro.index,1);
 assert.equal(next.ultimon.intro.monologues.p1,before.ultimon.intro.monologues.p1);
 assert.equal(next.ultimon.intro.entrances.p1,ULTIMON_BASIC_ENTRANCE.id);
 assert.equal(ultimonIntroSceneDeadline(next),next.phaseStartedAt+20000);
});

test('Skip finale passa al sorteggio solo dopo un vero monologo e ingresso',()=>{
 const r=getRoom();
 r.ultimon.intro.index=3;
 r.ultimon.intro.step='line';
 const patch=skipUltimonCurrentPresentation(r);
 assert.equal(patch['ultimon.intro.step'],'complete');
 assert.equal(ultimonIntroSceneReady(apply(r,patch)),false);
});

test('Solo l’host p1 può velocizzare o saltare scene, anche se gli ospiti possono recuperare la stanza',()=>{
 const ui=read('../src/screens/battle/UltimonIntroView.jsx');
 const parent=read('../src/screens/battle/UltimonView.jsx');
 const app=read('../src/App.jsx');
 const style=read('../src/screens/battle/UltimonIntroView.css');
 assert.match(ui,/if\(!isHost\|\|!sceneReady\|\|!sceneDeadline\)return/);
 assert.match(ui,/setTimeout\(\(\)=>onHost\('introNext'\),Math\.max\(0,sceneDeadline-Date\.now\(\)\)\)/);
 assert.match(ui,/hostAdvance\('introNext'\)/);
 assert.match(ui,/hostAdvance\('introSkipTeam'\)/);
 assert.match(ui,/\{isHost&&<div className="ultimon-intro-host-controls"/);
 assert.match(ui,/Il timer resta fermo/);
 assert.match(parent,/isHost=\{appMode==='local_room'\|\|playerRole==='p1'\}/);
 assert.match(app,/strictHost=false/);
 assert.match(app,/live\.playerUids\?\.p1!==user\.uid/);
 assert.match(app,/introSkipTeam:\{allowed:\['ultimon_intro'\]/);
 assert.match(app,/skipUltimonCurrentPresentation\(room\)/);
 assert.match(app,/action==='introNext'\|\|action==='introSkipTeam'/);
 assert.match(style,/\.ultimon-intro-auto-clock/);
 assert.match(style,/\.ultimon-intro-skip-team/);
});
