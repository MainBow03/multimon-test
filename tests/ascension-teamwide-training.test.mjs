import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {ascensionCreate,ascensionSelectStarter,ascensionTrain,ascensionBeginAction,
 ascensionFind,ascensionScaledMaxHp,ASCENSION_MAX_LEVEL} from '../src/systems/colosseumAscension.js';

const roles=Array.from({length:8},(_,i)=>'p'+(i+1));
const room=()=>({gameMode:'ascension',status:'ascension',
 players:Object.fromEntries(roles.map(r=>[r,'Allenatore '+r])),
 isBot:Object.fromEntries(roles.map(r=>[r,false]))});
const setup=()=>{
 let asc=ascensionCreate(room(),CHARACTERS,()=>.22);
 for(const role of roles)
  asc=ascensionSelectStarter(asc,role,asc.participants[role].options[0],CHARACTERS);
 const p=asc.participants.p1;
 const extras=CHARACTERS.filter(c=>c.id!==p.roster[0].id&&!c.isSummonOnly&&
   !c.isCampaignMonster&&!c.isSecretUnlock).slice(0,3);
 for(const c of extras)p.roster.push({id:c.id,level:1,
  hp:ascensionScaledMaxHp(c,1),xp:0,trainingHalves:0});
 return asc;
};

test('Un clic allena tutti i compagni idonei, anche chi ha più punti in riserva',()=>{
 const asc=setup(),p=asc.participants.p1;
 p.roster[0].trainingHalves=2;
 p.roster[1].trainingHalves=4;
 p.roster[2].trainingHalves=1;
 p.roster[3].trainingHalves=2;p.roster[3].level=ASCENSION_MAX_LEVEL;
 const originalLevels=p.roster.map(m=>m.level);
 const trained=ascensionTrain(asc,'p1',null,CHARACTERS);
 const team=trained.participants.p1.roster;
 assert.deepEqual(team.map(m=>m.level),[originalLevels[0]+1,originalLevels[1]+1,
  originalLevels[2],originalLevels[3]]);
 assert.deepEqual(team.map(m=>m.trainingHalves),[0,2,1,2]);
 assert.match(trained.participants.p1.notice,/2 Multimon salgono/);
 assert.deepEqual(p.roster.map(m=>m.level),originalLevels,
  'La mutazione deve conservare lo snapshot precedente per Firebase');
 // Il secondo clic usa il punto residuo: mai consumare più di un punto per volta.
 const again=ascensionTrain(trained,'p1',null,CHARACTERS);
 assert.equal(again.participants.p1.roster[1].level,originalLevels[1]+2);
 assert.equal(again.participants.p1.roster[1].trainingHalves,0);
});

test('L’allenamento preserva il danno già subito e non rianima compagni KO',()=>{
 const asc=setup(),p=asc.participants.p1;
 const a=p.roster[0],b=p.roster[1];
 const oldMax=ascensionScaledMaxHp(ascensionFind(CHARACTERS,a.id),a.level);
 a.hp=Math.max(1,oldMax-12);a.trainingHalves=2;
 b.hp=0;b.trainingHalves=2;
 const result=ascensionTrain(asc,'p1',a.id,CHARACTERS);
 const upgraded=result.participants.p1.roster;
 const newMax=ascensionScaledMaxHp(ascensionFind(CHARACTERS,a.id),a.level+1);
 assert.equal(upgraded[0].hp,newMax-12,'I PS mancanti restano gli stessi');
 assert.equal(upgraded[1].hp,0,'Non si ottiene un Rianima gratuito');
 assert.equal(upgraded[0].level,2);
 assert.equal(upgraded[1].level,2);
});

test('La scelta Allenamento del percorso aumenta tutto il team in un solo round',()=>{
 const asc=setup(),p=asc.participants.p1;
 p.roster[0].trainingHalves=2;
 p.roster[1].trainingHalves=2;
 p.roster[2].trainingHalves=2;
 p.roster[3].trainingHalves=1;
 const result=ascensionBeginAction(asc,'p1','training',CHARACTERS);
 const next=result.participants.p1;
 assert.equal(next.done,true);
 assert.deepEqual(next.roster.map(m=>m.level),[2,2,2,1]);
 assert.deepEqual(next.roster.map(m=>m.trainingHalves),[0,0,0,1]);
 assert.match(next.notice,/3 Multimon hanno guadagnato 1 livello/);
 assert.throws(()=>ascensionBeginAction(result,'p1','training',CHARACTERS),
  /già intrapreso/);
});

test('Nessun punto pronto: niente livelli inventati o transazione parziale',()=>{
 const asc=setup();
 assert.throws(()=>ascensionTrain(asc,'p1',null,CHARACTERS),
  /Nessun Multimon ha un punto/);
 assert.deepEqual(asc.participants.p1.roster.map(m=>m.level),[1,1,1,1]);
 assert.throws(()=>ascensionBeginAction(asc,'p1','training',CHARACTERS),
  /Non hai ancora abbastanza/);
});

test('Interfaccia: un pulsante globale, nessun tasto individuale, anteprima dei pronti',()=>{
 const view=readFileSync(new URL('../src/screens/battle/AscensionView.jsx',import.meta.url),'utf8');
 const path=readFileSync(new URL('../src/screens/battle/AscensionJourney.jsx',import.meta.url),'utf8');
 assert.match(view,/ac-train-all/);
 assert.match(view,/onAction\('train',null\)/);
 assert.doesNotMatch(view,/onAction\('train',m\.id\)/);
 assert.match(path,/readyToTrain/);
 assert.match(path,/Allena contemporaneamente tutti i Multimon/);
});
