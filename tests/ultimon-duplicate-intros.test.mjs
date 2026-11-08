import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {FUSION_CHARACTERS} from '../src/data/fusions.js';
import {ULTIMON_DUPLICATE_REACTIONS,compareUltimonDuplicateStats,ultimonDuplicateReaction}
 from '../src/systems/ultimonDuplicateLines.js';
import {ultimonPreviousSpeaker,ultimonIntroCast} from '../src/systems/ultimonIntro.js';

const all=[...CHARACTERS,...FUSION_CHARACTERS];
const sample=(id,spd=100)=>({
 id,name:all.find(c=>c.id===id)?.name||id,
 img:'https://example.com/'+id+'.png',
 hp:100,maxHp:100,atk:100,spAtk:100,def:100,spDef:100,spd,
 moves:[]});
const roles=['p1','p2','p3','p4'];
const mockRoom=(id='bugsbunny')=>({
 gameMode:'ultimon',status:'ultimon_intro',settings:{maxPlayers:4,teamSize:2},
 players:{p1:'Simone',p2:'Marika',p3:'Anna',p4:'CPU'},
 isBot:{p1:false,p2:false,p3:false,p4:true},
 ultimon:{
  identities:{p1:{name:'I Conigli Rossi',color:'#ef4444'},
   p2:{name:'Le Comete',color:'#2563eb'},
   p3:{name:'Le Ombre',color:'#9333ea'},
   p4:{name:'I Titani',color:'#f97316'}},
  rosters:{p1:[sample(id,110)],p2:[sample(id,140)],
   p3:[sample(id,85)],p4:[sample('sonic',125)]},
  intro:{order:roles,index:1,step:'line',lineIndex:0,
   casts:{p1:[0],p2:[0],p3:[0],p4:[0]},monologues:{}}
 }
});

test('Tutti i 235 Multimon, fusioni comprese, possiedono una reazione esclusiva al doppione',()=>{
 const ids=all.map(c=>c.id);
 assert.equal(ids.length,235);
 assert.equal(new Set(ids).size,ids.length);
 assert.equal(Object.keys(ULTIMON_DUPLICATE_REACTIONS).length,ids.length);
 assert.deepEqual(Object.keys(ULTIMON_DUPLICATE_REACTIONS).sort(),ids.sort());
 const lines=all.map(c=>ULTIMON_DUPLICATE_REACTIONS[c.id]);
 assert.equal(new Set(lines).size,lines.length,'La reazione deve essere diversa per ogni personaggio');
 for(const [i,line] of lines.entries()){
  assert.ok(typeof line==='string' && line.length>=32 && line.length<=240,all[i].id);
 }
 assert.match(ULTIMON_DUPLICATE_REACTIONS.bugsbunny,/coniglio/i);
 assert.match(ULTIMON_DUPLICATE_REACTIONS.daffyduck,/protagonista/i);
 assert.match(ULTIMON_DUPLICATE_REACTIONS.robin,/titani/i);
 assert.match(ULTIMON_DUPLICATE_REACTIONS.sonic,/veloce/i);
});

test('Un Multimon reagisce solo a una versione già presentata in una squadra precedente',()=>{
 const room=mockRoom();
 const first=ultimonIntroCast(room,'p1')[0];
 assert.equal(first.duplicate,null,'Il primo Bugs dice la battuta normale');
 const second=ultimonIntroCast(room,'p2')[0];
 assert.equal(second.line,first.line,'La battuta di ingresso originale resta intatta');
 assert.ok(second.duplicate,'Il Bugs successivo riconosce quello già presentato');
 assert.equal(second.duplicate.rival.role,'p1');
 assert.equal(second.duplicate.rival.team,'I Conigli Rossi');
 assert.equal(second.duplicate.rival.owner,'Simone');
 assert.equal(second.duplicate.rival.img,room.ultimon.rosters.p1[0].img);
 assert.match(second.duplicate.line,/coniglio/i);
 assert.match(second.duplicate.line,/Velocità/);
 assert.notEqual(second.duplicate.line,second.line);
 const third=ultimonIntroCast(room,'p3')[0];
 assert.equal(third.duplicate.rival.role,'p2','La terza copia risponde alla più recente');
 assert.match(third.duplicate.line,/55 punti in più di Velocità/);
 const fourth=ultimonIntroCast(room,'p4')[0];
 assert.equal(fourth.duplicate,null,'Sonic non reagisce a Bugs');
});

test('Le copie non presentate e i doppioni della stessa squadra non provocano reazioni',()=>{
 const room=mockRoom();
 room.ultimon.rosters.p1.push(sample('bugsbunny',120));
 room.ultimon.intro.casts.p1=[1,0];
 assert.equal(ultimonIntroCast(room,'p1').filter(x=>x.duplicate).length,0,
   'Nessuna finta sfida tra due Multimon dello stesso giocatore');
 room.ultimon.intro.casts.p1=[0];
 room.ultimon.rosters.p1[0]=sample('sonic');
 assert.equal(ultimonPreviousSpeaker(room,'p2','bugsbunny'),null,
   'Un doppione presente nel roster ma non chiamato non ha parlato');
 assert.equal(ultimonIntroCast(room,'p2')[0].duplicate,null);
 room.ultimon.intro.casts.p1=[1];
 assert.equal(ultimonIntroCast(room,'p2')[0].duplicate.rival.role,'p1',
   'Appena il doppione viene chiamato, l’interazione si attiva');
});

test('Il confronto usa statistiche reali, comprese le differenze di upgrade, senza cambiarle',()=>{
 const original=sample('bugsbunny',120),fast=sample('bugsbunny',148);
 const origSnapshot=structuredClone(original),fastSnapshot=structuredClone(fast);
 const faster=compareUltimonDuplicateStats(fast,original);
 assert.equal(faster.kind,'advantage');
 assert.equal(faster.label,'Velocità');
 assert.equal(faster.delta,28);
 assert.equal(faster.mine,148);
 assert.equal(faster.other,120);
 assert.equal(faster.rows.length,6);
 const slower=ultimonDuplicateReaction(original,fast);
 assert.equal(slower.comparison.kind,'disadvantage');
 assert.match(slower.line,/28 punti in più di Velocità/);
 const equal=ultimonDuplicateReaction(original,structuredClone(original));
 assert.equal(equal.comparison.kind,'tie');
 assert.match(equal.line,/statistiche|numeri|forza sulla carta/i);
 const superAtk={...original,spAtk:175};
 assert.equal(compareUltimonDuplicateStats(superAtk,original).label,'Attacco Speciale');
 assert.deepEqual(original,origSnapshot);
 assert.deepEqual(fast,fastSnapshot);
});

test('Tutto è limitato alla presentazione, senza cambiare il flusso dei duelli',()=>{
 const ui=readFileSync(new URL('../src/screens/battle/UltimonIntroView.jsx',import.meta.url),'utf8');
 const css=readFileSync(new URL('../src/screens/battle/UltimonIntroView.css',import.meta.url),'utf8');
 assert.match(ui,/selected\?\.duplicate\?\.line\|\|selected\?\.line/);
 assert.match(ui,/COLPO DI SCENA/);
 assert.match(ui,/rival\.team/);
 assert.match(ui,/duelStat\.label/);
 assert.match(ui,/step==='line'&&rival\?6800/);
 assert.match(css,/ultimon-intro-duplicate-faceoff/);
 assert.match(css,/prefers-reduced-motion/);
});
