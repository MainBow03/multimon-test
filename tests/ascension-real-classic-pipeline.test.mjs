import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {
 ascensionCreate,ascensionSelectStarter,ascensionBeginAction,
 ascensionNextRound,ascensionCurrentMatch,ascensionChooseLineup,
 ascensionCreateRealEncounter,ascensionCreateRealDuel,
 ascensionRealSubmit,ascensionRealAdvance,ascensionRealCapture,
 ascensionRealCaptureContinue
} from '../src/systems/colosseumAscension.js';

const roles=Array.from({length:8},(_,i)=>'p'+(i+1));
const room=()=>({
 gameMode:'ascension',status:'ascension',
 players:Object.fromEntries(roles.map(p=>[p,'Allenatore '+p])),
 isBot:Object.fromEntries(roles.map(p=>[p,false]))
});
function setup(){
 const r=room();
 let a=ascensionCreate(r,CHARACTERS,()=>.16);
 for(const role of roles)
  a=ascensionSelectStarter(a,role,a.participants[role].options[0],CHARACTERS);
 return {r,a};
}
const attack=(battle,side,fieldIdx=0)=>({
 type:'attack',
 moveIdx:Math.max(0,battle.teams[side][fieldIdx].moves.findIndex(m=>m?.power>0)),
 targetPlayer:side==='p1'?'p2':'p1',targetIdx:0,targetFieldIdx:0
});
test('Il Colosseo persiste realmente una stanza di battaglia CLASSICA, non una copia della UI',()=>{
 const {r,a}=setup();
 let next=ascensionBeginAction(a,'p1','trainer',CHARACTERS,()=>.22);
 next=ascensionCreateRealEncounter(next,'p1',CHARACTERS,r);
 const b=next.participants.p1.encounter.classicRoom;
 assert.equal(b.gameMode,'classica');
 assert.equal(b.status,'battling');
 assert.equal(b.isAscensionNativeBattle,true);
 assert.ok(b.teams.p1[0].moves.length);
 assert.ok(b.teams.p1[0].baseSpd);
 assert.ok(b.teams.p1[0].statuses);
 assert.deepEqual(b.field.p1,[0]);
 assert.deepEqual(b.field.p2,[0]);
 assert.ok(b.actions.p1&&b.actions.p2);
 assert.ok(b.battleReport&&b.battleWeather!==undefined);
 assert.ok(b.turnExpiresAt>0);
 const source=readFileSync(new URL('../src/screens/battle/AscensionClassicBattle.jsx',import.meta.url),'utf8');
 for(const token of ['commitActionImpl','handleSelectMoveTargetImpl','playEventsAnimationImpl',
  'renderBattlingView(common)','renderSwitchingPhaseView'])
  assert.ok(source.includes(token),'Deve usare la vera pipeline: '+token);
 assert.ok(!source.includes('ascensionClassicView('),
  'Il controller non può convertire una copia di stato in battaglia');
 assert.ok(!source.includes('ascensionNativeTurn('));
});
test('KO in un colpo → risultato persistente solo DOPO il replay CLASSICO',()=>{
 const {r,a}=setup();
 let next=ascensionBeginAction(a,'p1','trainer',CHARACTERS,()=>.12);
 next=ascensionCreateRealEncounter(next,'p1',CHARACTERS,r);
 const b=next.participants.p1.encounter.classicRoom;
 b.teams.p1[0].hp=999;b.teams.p1[0].def=9000;b.teams.p1[0].spDef=9000;
 b.teams.p2[0].hp=1;
 next=ascensionRealSubmit(next,'p1',{0:attack(b,'p1')},b.phaseStartedAt,CHARACTERS);
 const e=next.participants.p1.encounter;
 assert.equal(e.classicRoom.status,'executing');
 assert.equal(next.participants.p1.battleResult,null,
  'Non si può saltare l’animazione KO con un redirect');
 assert.ok(e.classicRoom.events.some(x=>x.type==='damage'));
 assert.ok(e.classicRoom.startOfTurnTeams&&e.classicRoom.startOfTurnField);
 next=ascensionRealAdvance(next,'p1',e.classicRoom.phaseStartedAt,CHARACTERS);
 assert.equal(next.participants.p1.encounter,null);
 assert.equal(next.participants.p1.battleResult?.outcome,'victory');
 assert.equal(next.participants.p1.battleResult?.kind,'trainer');
 assert.equal(next.participants.p1.done,true);
});
test('Prismaball fallita → filmato e POI reazione calcolata dal motore classico',()=>{
 const {r,a}=setup();
 let next=ascensionBeginAction(a,'p1','wild',CHARACTERS,()=>.23);
 next=ascensionCreateRealEncounter(next,'p1',CHARACTERS,r);
 const original=next.participants.p1.encounter.classicRoom;
 const firstHp=original.teams.p1[0].hp;
 next=ascensionRealCapture(next,'p1',CHARACTERS,()=>.999);
 const p=next.participants.p1;
 assert.equal(p.lastCapture.success,false);
 assert.equal(p.encounter.classicRoom.status,'ascension_capture');
 assert.equal(p.encounter.classicRoom.teams.p1[0].hp,firstHp);
 next=ascensionRealCaptureContinue(next,'p1',CHARACTERS);
 const after=next.participants.p1.encounter.classicRoom;
 assert.equal(after.status,'executing');
 assert.ok(after.events.length>0,'La CPU ha reagito con eventi del motore standard');
 assert.ok(after.battleReport.turns>=1);
});
test('Finale 2v2: ogni Multimon riceve il proprio comando nella coda STANDARD',()=>{
 const {r,a}=setup();
 const prep={...a,round:18,
  participants:Object.fromEntries(roles.map(role=>[role,{
   ...a.participants[role],done:true,encounter:null,battleResult:null
  }]))};
 let next=ascensionNextRound(prep,CHARACTERS);
 const m=ascensionCurrentMatch(next),[left,right]=m.roles;
 for(const role of [left,right]){
  const current=next.participants[role].roster[0].id;
  const extra=CHARACTERS.find(c=>c.id!==current&&!c.isSummonOnly&&!c.isSecretUnlock&&!c.isCampaignMonster);
  next.participants[role].roster.push({id:extra.id,level:1,hp:70,xp:0,trainingHalves:0});
 }
 next.bracket[0].stage='finale';
 for(const role of [left,right])
  next=ascensionChooseLineup(next,role,next.participants[role].roster.map(x=>x.id),CHARACTERS);
 next=ascensionCreateRealDuel(next,CHARACTERS,r);
 let b=ascensionCurrentMatch(next).game.classicRoom;
 assert.equal(b.settings.fieldSize,2);
 assert.deepEqual(b.field.p1,[0,1]);assert.deepEqual(b.field.p2,[0,1]);
 const actions=side=>Object.fromEntries([0,1].map(i=>[i,attack(b,side,i)]));
 next=ascensionRealSubmit(next,left,actions('p1'),b.phaseStartedAt,CHARACTERS);
 b=ascensionCurrentMatch(next).game.classicRoom;
 assert.equal(b.status,'battling','Attendi il secondo giocatore umano');
 next=ascensionRealSubmit(next,right,actions('p2'),b.phaseStartedAt,CHARACTERS);
 b=ascensionCurrentMatch(next).game.classicRoom;
 assert.equal(b.status,'executing');
 assert.ok(b.events.some(e=>e.type==='battle_actor'),
  'Ci sono veri eventi per ogni personaggio attivo');
 assert.ok(b.battleReport.turns>=1);
});
