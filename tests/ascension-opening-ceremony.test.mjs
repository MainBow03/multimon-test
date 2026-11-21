import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {ascensionCreate,ascensionSelectStarter,ascensionAcknowledgeOpening}
 from '../src/systems/colosseumAscension.js';

const roles=Array.from({length:8},(_,i)=>'p'+(i+1));
const room=()=>({gameMode:'ascension',status:'ascension',players:Object.fromEntries(
 roles.map(r=>[r,'Contendente '+r])),
 isBot:Object.fromEntries(roles.map(r=>[r,false]))});
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');

test('La cerimonia inizia soltanto DOPO la scelta degli otto starter',()=>{
 let asc=ascensionCreate(room(),CHARACTERS,()=>.32);
 assert.equal(asc.stage,'starters');
 for(let i=0;i<7;i++)asc=ascensionSelectStarter(asc,roles[i],asc.participants[roles[i]].options[0],CHARACTERS);
 assert.equal(asc.stage,'starters');
 asc=ascensionSelectStarter(asc,roles[7],asc.participants[roles[7]].options[0],CHARACTERS);
 assert.equal(asc.stage,'preparation');
 assert.equal(asc.round,1);
 assert.ok(roles.every(r=>asc.participants[r].roster.length===1));
 assert.ok(roles.every(r=>asc.participants[r].introSeen===false));
 assert.throws(()=>ascensionAcknowledgeOpening({...asc,stage:'starters'},'p1'),/non è disponibile/);
 assert.throws(()=>ascensionAcknowledgeOpening(asc,'p9'),/Non fai parte/);
});

test('Ogni giocatore conferma una sola volta; lo stato della cerimonia sopravvive a un ricaricamento',()=>{
 let asc=ascensionCreate(room(),CHARACTERS,()=>.32);
 for(const r of roles)asc=ascensionSelectStarter(asc,r,asc.participants[r].options[0],CHARACTERS);
 asc=ascensionAcknowledgeOpening(asc,'p1');
 assert.equal(asc.participants.p1.introSeen,true);
 assert.equal(asc.participants.p2.introSeen,false);
 assert.equal(ascensionAcknowledgeOpening(asc,'p1'),asc,'Non si modifica di nuovo lo stato');
 const restored=structuredClone(asc);
 assert.equal(restored.participants.p1.introSeen,true);
 assert.equal(restored.participants.p2.introSeen,false);
 const after=ascensionAcknowledgeOpening(restored,'p2');
 assert.equal(after.participants.p2.introSeen,true);
 assert.equal(after.participants.p1.introSeen,true);
});

test('Il Sovrano annuncia nome e starter di tutti gli otto, senza inventare squadre',()=>{
 const ceremony=read('../src/screens/battle/AscensionOpeningCeremony.jsx');
 const app=read('../src/App.jsx');
 assert.match(ceremony,/Sovrano Aurelion/);
 assert.match(ceremony,/asc\.roles\.map/);
 assert.match(ceremony,/room\.players\?\.\[r\]/);
 assert.match(ceremony,/asc\.participants\?\.\[r\]\?\.roster\?\.\[0\]\?\.id/);
 assert.match(ceremony,/subject\.name/);
 assert.match(ceremony,/subject\.starter\.name/);
 assert.match(ceremony,/Array\.from\(\{length:count\+2\}/);
 assert.match(ceremony,/Salta le presentazioni/);
 assert.match(ceremony,/Inizia il percorso/);
 assert.match(app,/AscensionOpeningCeremony/);
 assert.match(app,/!asc\.participants\?\.\[current\]\?\.introSeen/);
 assert.match(app,/kind==='intro-seen'/);
});

test('Le carte degli starter non sono coperte dal pulsante e i PNG restano grandi su tablet',()=>{
 const jsx=read('../src/screens/battle/AscensionView.jsx');
 const css=read('../src/screens/battle/AscensionView.css');
 const begin=jsx.indexOf('className="ac-card-grid ac-starters"');
 const end=jsx.indexOf('</div>)}</div>',begin);
 assert.ok(begin>=0&&end>begin,'La scelta starter deve avere carte individuali');
 const selection=jsx.slice(begin,end);
 assert.ok(selection.indexOf('ac-starter-select')<selection.indexOf('<Portrait'),
  'Il pulsante deve stare SOPRA al PNG, non davanti o sotto');
 assert.match(css,/\.ac-starters \.ac-starter\{display:grid/);
 assert.match(css,/grid-template-rows:auto minmax\(0,1fr\)/);
 assert.match(css,/\.ac-starters \.ac-starter \.ac-portrait-frame\{[^}]*height:clamp\(140px,13vw,182px\)/);
 assert.match(css,/@media\(max-width:610px\)/);
});
