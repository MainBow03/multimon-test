import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {FUSION_CHARACTERS} from '../src/data/fusions.js';
import {ULTIMON_ENTRANCE_LINES,ultimonEntranceLine} from '../src/systems/ultimonEntranceLines.js';
import {createUltimonShowcase,identityPatch,nextUltimonPair,ULTIMON_STAGES}
  from '../src/systems/ultimonSystem.js';
import {beginUltimonIntroduction,ultimonIntroMonologuePatch,
 advanceUltimonIntroduction,ultimonIntroCast,ultimonIntroSpeech,
 ultimonIntroEntrancePatch,ultimonIntroEntrance,ULTIMON_ENTRANCE_EFFECTS,
 currentUltimonIntroRole,ultimonSuggestedMonologue,ultimonIntroductionReady}
 from '../src/systems/ultimonIntro.js';
import {GAME_IN_PROGRESS} from '../src/systems/roomRecovery.js';

const characters=[...CHARACTERS,...FUSION_CHARACTERS];
const roster=(role,size=5)=>Array.from({length:size},(_,i)=>{
 const c=characters[(i+role.length*37+role.charCodeAt(1))%characters.length];
 return {...c,hp:c.hp||100,maxHp:c.maxHp||c.hp||100,
  moves:Array.isArray(c.moves)?c.moves:[]};
});
const room=(n=6,size=5)=>({
 gameMode:'ultimon',status:'drafting',settings:{maxPlayers:n,teamSize:size,fieldSize:1},
 players:Object.fromEntries(Array.from({length:n},(_,i)=>['p'+(i+1),'Persona '+(i+1)])),
 isBot:Object.fromEntries(Array.from({length:n},(_,i)=>['p'+(i+1),i>=2])),
 draft:Object.fromEntries(Array.from({length:n},(_,i)=>['p'+(i+1),roster('p'+(i+1),size)]))
});
const apply=(base,patch)=>{
 const result=structuredClone(base);
 for(const [path,value] of Object.entries(patch)){
  if(!path.includes('.')){result[path]=value;continue}
  const keys=path.split('.');
  const last=keys.pop();
  let current=result;
  for(const key of keys)current=current[key];
  current[last]=value;
 }
 return result;
};
function setup(n=6,size=5){
 const base=room(n,size);
 let state=apply(base,createUltimonShowcase(base));
 state=apply(state,identityPatch(state,'p1','Le Meteore','#ef4444'));
 state=apply(state,identityPatch(state,'p2','Le Comete','#2563eb'));
 return state;
}

test('TUTTI i 235 Multimon, comprese le 19 fusioni, hanno frasi originali specifiche e non duplicate',()=>{
 const ids=characters.map(c=>c.id);
 assert.equal(ids.length,235);
 assert.equal(new Set(ids).size,ids.length);
 assert.equal(Object.keys(ULTIMON_ENTRANCE_LINES).length,ids.length);
 assert.deepEqual(Object.keys(ULTIMON_ENTRANCE_LINES).sort(),ids.sort());
 const lines=characters.map(c=>ultimonEntranceLine(c));
 assert.equal(new Set(lines).size,lines.length,'Nessuna battuta uguale tra due Multimon');
 for(const [i,line] of lines.entries()){
  assert.ok(typeof line==='string'&&line.length>=22&&line.length<230,
    characters[i]?.id+' non ha una battuta valida');
 }
 assert.match(ultimonEntranceLine({id:'future',name:'Nuovo Multimon',
  moves:[{name:'Attacco Speciale',power:60}]}),/Attacco Speciale/);
});

test('Il presentatore sceglie ordine casuale e quattro Multimon DIVERSI per ogni squadra',()=>{
 let state=setup(8,6);
 assert.equal(ULTIMON_STAGES.includes('ultimon_intro'),true);
 assert.ok(GAME_IN_PROGRESS.includes('ultimon_intro'));
 assert.throws(()=>beginUltimonIntroduction({...state,status:'drafting'}),/nome e colore/);
 state=apply(state,beginUltimonIntroduction(state,()=>.34));
 assert.equal(state.status,'ultimon_intro');
 assert.equal(state.ultimon.intro.step,'call');
 assert.equal(state.ultimon.intro.order.length,8);
 assert.equal(new Set(state.ultimon.intro.order).size,8);
 for(const role of state.ultimon.intro.order){
  const indices=state.ultimon.intro.casts[role];
  assert.equal(indices.length,4);
  assert.equal(new Set(indices).size,4);
  const cast=ultimonIntroCast(state,role);
  assert.equal(cast.length,4);
  for(let i=0;i<cast.length;i++){
   assert.equal(cast[i].line,ultimonEntranceLine(state.ultimon.rosters[role][indices[i]]));
   assert.ok(cast[i].img);
  }
 }
 assert.throws(()=>nextUltimonPair(state),/presentazione/);
});

test('Il monologo umano è scelto solo dal capitano chiamato e confermato prima delle battute',()=>{
 let state=setup();
 state=apply(state,beginUltimonIntroduction(state,()=>.01));
 // Ogni ordine casuale contiene almeno due umani e CPU.
 while(state.ultimon.intro.step!=='complete'){
  const intro=state.ultimon.intro;
  const role=currentUltimonIntroRole(state);
  if(intro.step==='call'){
   state=apply(state,advanceUltimonIntroduction(state));
   continue;
  }
  if(intro.step==='speech'){
   if(!state.isBot[role]){
    assert.equal(ultimonIntroSpeech(state,role),'');
    assert.throws(()=>advanceUltimonIntroduction(state),/monologo/);
    const other=role==='p1'?'p2':'p1';
    assert.throws(()=>ultimonIntroMonologuePatch(state,other,'Adesso entro io!'),/Non puoi parlare/);
    assert.throws(()=>ultimonIntroMonologuePatch(state,role,'Ciao'),/12 a 260/);
    const custom='  Sono  '+state.players[role]+', e questa sarà una battaglia memorabile!   ';
    state=apply(state,ultimonIntroMonologuePatch(state,role,custom));
    assert.equal(ultimonIntroSpeech(state,role),custom.trim().replace(/  +/g,' '));
    assert.throws(()=>ultimonIntroMonologuePatch(state,role,custom),/già stato confermato/);
   }else{
    assert.ok(ultimonIntroSpeech(state,role).length>25);
    assert.throws(()=>ultimonIntroMonologuePatch(state,role,'Non sono un umano, sono un bot.'),/Non puoi parlare/);
   }
  }
  if(intro.step==='entrance_select'){
   if(!state.isBot[role]){
    assert.equal(ultimonIntroEntrance(state,role),null);
    assert.throws(()=>advanceUltimonIntroduction(state),/ingresso ad effetto/);
    assert.throws(()=>ultimonIntroEntrancePatch(state,role,'inventato'),/ingresso esistente/);
    const other=role==='p1'?'p2':'p1';
    assert.throws(()=>ultimonIntroEntrancePatch(state,other,'starfall'),/Non puoi scegliere/);
    const index=role==='p1'?0:5;
    state=apply(state,ultimonIntroEntrancePatch(state,role,ULTIMON_ENTRANCE_EFFECTS[index].id,[ULTIMON_ENTRANCE_EFFECTS[index].id]));
    assert.equal(ultimonIntroEntrance(state,role),ULTIMON_ENTRANCE_EFFECTS[index].id);
    assert.throws(()=>ultimonIntroEntrancePatch(state,role,'portal'),/già stato confermato/);
   }else{
    assert.equal(ultimonIntroEntrance(state,role),'basic');
    assert.throws(()=>ultimonIntroEntrancePatch(state,role,'starfall'),/Non puoi scegliere/);
   }
  }
  const before=state.ultimon.intro.step;
  state=apply(state,advanceUltimonIntroduction(state));
  if(before==='line'&&state.ultimon.intro.step==='line')
   assert.equal(state.ultimon.intro.lineIndex,intro.lineIndex+1);
 }
 assert.equal(ultimonIntroductionReady(state),true);
 assert.equal(Object.keys(state.ultimon.intro.monologues).length,2,
  'I bot non hanno bisogno di scrivere nel documento Firestore');
 assert.equal(Object.keys(state.ultimon.intro.entrances).length,2,
  'Solo gli esseri umani salvano la scelta in Firestore; le CPU scelgono automaticamente');
 assert.equal(nextUltimonPair(state,()=>.3).status,'ultimon_pair');
 assert.throws(()=>advanceUltimonIntroduction(state),/già conclusa/);
});

test('Con un team piccolo presentano solo i Multimon realmente disponibili',()=>{
 const state=setup(4,2);
 const intro=apply(state,beginUltimonIntroduction(state,()=>.76));
 for(const role of intro.ultimon.intro.order)
  assert.equal(ultimonIntroCast(intro,role).length,2);
});

test('La UI collega scrittura personale, quattro stili, attesa online e passi sincronizzati',()=>{
 const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
 const screen=readFileSync(new URL('../src/screens/battle/UltimonView.jsx',import.meta.url),'utf8');
 const ui=readFileSync(new URL('../src/screens/battle/UltimonIntroView.jsx',import.meta.url),'utf8');
 const css=readFileSync(new URL('../src/screens/battle/UltimonIntroView.css',import.meta.url),'utf8');
 assert.match(app,/ultimonSpeech=\(role,monologue\)/);
 assert.match(app,/introStart:\{allowed:\['ultimon_showcase'\]/);
 assert.match(app,/introNext:\{allowed:\['ultimon_intro'\]/);
 assert.match(app,/onSpeech=\{ultimonSpeech\}/);
 assert.match(app,/onEntrance=\{ultimonEntrance\}/);
 assert.match(ui,/usableEffects\.map/);
 assert.match(ui,/onEntrance\(role,effect\.id\)/);
 assert.match(screen,/stage==='ultimon_intro'/);
 assert.match(screen,/Inizia la presentazione delle squadre/);
 assert.match(ui,/ULTIMON_MONOLOGUE_STYLES\.map/);
 assert.match(ui,/onSpeech\(role,draft\)/);
 assert.match(ui,/setTimeout\(\(\)=>onHost\('introNext'\),Math\.max\(0,sceneDeadline-Date\.now\(\)\)\)/);
 assert.match(ui,/intro\.lineIndex/);
 assert.match(ui,/aria-label="Cerimonia d'ingresso Ultimon"/);
 assert.match(css,/ultimon-intro-character-portrait/);
 assert.match(css,/prefers-reduced-motion/);
 assert.ok(ultimonSuggestedMonologue('I Fulmini','eroico').includes('I Fulmini'));
});
