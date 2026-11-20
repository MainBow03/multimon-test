import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {
 ascensionCreate,ascensionSelectStarter,ascensionBeginAction,ascensionPlayEncounter,
 ascensionAcknowledgeEncounterResult,ascensionAcknowledgeDuelResult,
 ascensionRoundReady,ascensionNextRound,ascensionCurrentMatch,ascensionChooseLineup,
 ascensionDuelAction,ascensionSettleBots
} from '../src/systems/colosseumAscension.js';
const roles=Array.from({length:8},(_,i)=>'p'+(i+1));
const room=()=>({gameMode:'ascension',status:'ascension',
 players:Object.fromEntries(roles.map(r=>[r,'Giocatore '+r])),
 isBot:Object.fromEntries(roles.map(r=>[r,false]))});
function prep(){
 let a=ascensionCreate(room(),CHARACTERS,()=>.3);
 for(const role of roles)a=ascensionSelectStarter(a,role,a.participants[role].options[0],CHARACTERS);
 return a;
}
function combat(kind){
 let a=ascensionBeginAction(prep(),'p1',kind,CHARACTERS,()=>.32);
 a.participants.p1.encounter.foeHp=1;
 const hero=a.participants.p1.roster[0];
 const moves=CHARACTERS.find(c=>c.id===hero.id).moves;
 const index=moves.findIndex(m=>m?.power>0);
 assert.ok(index>=0);
 return ascensionPlayEncounter(a,'p1',{type:'attack',index},CHARACTERS,()=>0);
}
test('One-hit KO: selvatico e allenatore mostrano risultato persistente prima del percorso',()=>{
 for(const kind of ['wild','trainer']){
  const after=combat(kind),p=after.participants.p1;
  assert.equal(p.encounter,null,'Il motore termina correttamente il combattimento');
  assert.equal(p.done,true);
  assert.equal(p.battleResult?.outcome,'victory','Il risultato resta nel salvataggio');
  assert.equal(p.battleResult.kind,kind);
  assert.equal(p.battleResult.turn,1,'KO al primo turno');
  assert.equal(p.battleResult.foeHp,0);
  assert.ok(p.battleResult.log.some(line=>line.includes('KO')));
  assert.equal(ascensionRoundReady({...after,roles:['p1']}),false,'Non si può saltare il risultato');
  const refreshed=structuredClone(after);
  assert.equal(refreshed.participants.p1.battleResult.outcome,'victory','Il risultato sopravvive al reload');
  const confirmed=ascensionAcknowledgeEncounterResult(after,'p1');
  assert.equal(confirmed.participants.p1.battleResult,null);
  assert.equal(confirmed.participants.p1.done,true);
  assert.throws(()=>ascensionAcknowledgeEncounterResult(confirmed,'p1'),/Nessun risultato/);
  if(kind==='trainer')assert.equal(p.battleResult.training,.5);
 }
});
test('Prismaball: una cattura riuscita passa prima dal riepilogo e rimane acquisita',()=>{
 let a=ascensionBeginAction(prep(),'p1','wild',CHARACTERS,()=>.33);
 const e=a.participants.p1.encounter;
 e.foeHp=1;
 const target=e.foeId;
 a=ascensionPlayEncounter(a,'p1',{type:'ball'},CHARACTERS,()=>0);
 const p=a.participants.p1;
 assert.equal(p.encounter,null);
 assert.equal(p.battleResult.outcome,'capture');
 assert.equal(p.battleResult.foeId,target);
 assert.equal(p.battleResult.foeHp,1,'Un Multimon catturato non è KO');
 assert.ok(p.lastCapture.success);
 assert.equal(p.roster.length,2);
 a=ascensionAcknowledgeEncounterResult(a,'p1');
 assert.equal(a.participants.p1.lastCapture,null,'La cattura non viene riprodotta due volte al ritorno al percorso');
 assert.equal(a.participants.p1.roster.length,2);
});
test('Duello risolto al primo turno: risultato e punteggio restano finché entrambi confermano',()=>{
 let a=prep();
 a=ascensionNextRound({...a,round:18,
  participants:Object.fromEntries(roles.map(r=>[r,{...a.participants[r],done:true,encounter:null}]))},CHARACTERS);
 const m=ascensionCurrentMatch(a);
 const [left,right]=m.roles;
 a=ascensionChooseLineup(a,left,a.participants[left].roster.map(x=>x.id),CHARACTERS);
 a=ascensionChooseLineup(a,right,a.participants[right].roster.map(x=>x.id),CHARACTERS);
 // Uno dei due ha appena 1 PS. Chi vince, lo scontro deve essere visibile.
 a.bracket[0].game.units[right][0].hp=1;
 const id=a.bracket[0].game.units[left][0].id;
 const moveIndex=CHARACTERS.find(c=>c.id===id).moves.findIndex(m=>m?.power>0);
 a=ascensionDuelAction(a,left,Math.max(0,moveIndex),CHARACTERS,()=>0);
 a=ascensionDuelAction(a,right,0,CHARACTERS,()=>0);
 const game=ascensionCurrentMatch(a).game;
 assert.ok(game?.winner,'Partita conclusa');
 assert.equal(game.turn,2,'La partita si è conclusa nel primo turno');
 assert.ok(ascensionCurrentMatch(a).game,'Non passa automaticamente a un altro incontro');
 assert.equal(Object.values(ascensionCurrentMatch(a).wins).reduce((x,y)=>x+y,0),1);
 const firstAck=ascensionAcknowledgeDuelResult(a,left);
 assert.ok(ascensionCurrentMatch(firstAck).game,'L’altro giocatore non ha ancora confermato');
 assert.equal(ascensionCurrentMatch(firstAck).game.resultAcknowledged[left],true);
 const secondAck=ascensionAcknowledgeDuelResult(firstAck,right);
 assert.equal(ascensionCurrentMatch(secondAck).game,null);
 assert.equal(ascensionCurrentMatch(secondAck).gameNumber,2);
});
test('CPU confermano automaticamente i risultati senza bloccare il Colosseo',()=>{
 const r=room();r.isBot=Object.fromEntries(roles.map(x=>[x,true]));
 let a=prep();
 a=ascensionSettleBots(a,r,CHARACTERS,()=>.16);
 assert.equal(a.stage,'preparation');
 assert.equal(ascensionRoundReady(a),true);
 assert.ok(roles.every(role=>!a.participants[role].battleResult));
});
test('App mostra l’esito PRIMA della selezione del percorso; percorso ora animato',()=>{
 const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
 const result=readFileSync(new URL('../src/screens/battle/AscensionBattleResult.jsx',import.meta.url),'utf8');
 const path=readFileSync(new URL('../src/screens/battle/AscensionJourney.jsx',import.meta.url),'utf8');
 assert.ok(app.indexOf('if(pendingResult||concludedDuel)')<app.indexOf('if(inAscensionCombat)'));
 assert.match(app,/AscensionBattleResult/);
 assert.match(result,/KO al primo turno/);
 assert.match(result,/onAction\(duel\?'duel-continue':'encounter-continue'\)/);
 assert.match(path,/ac-journey-checkpoints/);
 assert.match(path,/Array\.from\(\{length:18\}/);
 for(const mode of ['trainer','wild','training','rest'])
  assert.match(path,new RegExp("onAction\\('round','"+mode+"'\\)"));
});
