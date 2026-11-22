import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {ascensionCreate,ascensionSelectStarter,ascensionBeginAction,
 ascensionSelectEncounterSpirit,ascensionPlayEncounter,ascensionResolveEncounterReaction
} from '../src/systems/colosseumAscension.js';
import {ascensionClassicView} from '../src/systems/ascensionClassicBattle.js';

const roles=Array.from({length:8},(_,i)=>'p'+(i+1));
const room=()=>({gameMode:'ascension',status:'ascension',
 players:Object.fromEntries(roles.map(r=>[r,'Giocatore '+r])),
 isBot:Object.fromEntries(roles.map(r=>[r,false]))});
const ready=(id=null)=>{
 let a=ascensionCreate(room(),CHARACTERS,()=>.28);
 if(id)a.participants.p1.options[0]=id;
 for(const role of roles)
  a=ascensionSelectStarter(a,role,a.participants[role].options[0],CHARACTERS);
 return a;
};
test('Lucy evoca Aries automaticamente entrando nello scontro e può selezionare qualunque chiave',()=>{
 const r=room();r.ascension=ascensionBeginAction(ready('lucy'),'p1','wild',CHARACTERS,()=>.35);
 let e=r.ascension.participants.p1.encounter;
 assert.equal(e.spirit.id,'zodiac_aries');
 assert.equal(e.spiritOpen,true);
 assert.equal(r.ascension.participants.p1.roster.length,1,'Lo Spirito non occupa uno dei nove slot');
 let view=ascensionClassicView(r,'p1',CHARACTERS);
 assert.deepEqual(view.view.field.p1,[0,1]);
 assert.equal(view.view.teams.p1[1].isZodiacSpirit,true);
 assert.equal(view.view.teams.p1[1].zodiacOwner,'p1');
 assert.equal(view.view.ascensionSpirit.canChoose,true);
 r.ascension=ascensionSelectEncounterSpirit(r.ascension,'p1','zodiac_leo',CHARACTERS);
 e=r.ascension.participants.p1.encounter;
 assert.equal(e.spirit.id,'zodiac_leo');
 assert.equal(r.ascension.participants.p1.roster[0].zodiacSpiritId,'zodiac_leo');
 view=ascensionClassicView(r,'p1',CHARACTERS);
 assert.equal(view.view.teams.p1[1].id,'zodiac_leo');
 assert.equal(view.commandingIdx,0);
 assert.throws(()=>ascensionSelectEncounterSpirit(r.ascension,'p1','no-spirit',CHARACTERS));
});
test('Lucy e Spirito ricevono mosse indipendenti PRIMA della risposta avversaria',()=>{
 let asc=ascensionBeginAction(ready('lucy'),'p1','trainer',CHARACTERS,()=>.22);
 // L'allenatore deve sopravvivere a entrambe le mosse per testare la sequenza.
 const foe=asc.participants.p1.encounter;
 foe.foeHp=foe.foeMaxHp;
 const lucy=CHARACTERS.find(c=>c.id==='lucy');
 const nonDamage=lucy.moves.findIndex(m=>!m?.power);
 assert.ok(nonDamage>=0);
 asc=ascensionPlayEncounter(asc,'p1',{type:'attack',index:nonDamage},CHARACTERS,()=>.8);
 let e=asc.participants.p1.encounter;
 assert.equal(e.turn,1);
 assert.equal(e.pendingReaction.phase,'spirit');
 assert.equal(ascensionClassicView({...room(),ascension:asc},'p1',CHARACTERS).commandingIdx,1);
 assert.throws(()=>ascensionResolveEncounterReaction(asc,'p1',CHARACTERS),/Nessuna reazione/);
 assert.throws(()=>ascensionSelectEncounterSpirit(asc,'p1','zodiac_gemini',CHARACTERS),/prima di agire/);
 const spirit=CHARACTERS.find(c=>c.id==='zodiac_aries');
 const spiritNonDamage=spirit.moves.findIndex(m=>!m?.power);
 assert.ok(spiritNonDamage>=0);
 asc=ascensionPlayEncounter(asc,'p1',{type:'attack',index:spiritNonDamage,source:'spirit'},CHARACTERS,()=>.99);
 e=asc.participants.p1.encounter;
 assert.equal(e.pendingReaction.phase,'enemy');
 assert.equal(e.turn,1,'Il nemico non ha ancora attaccato');
 assert.throws(()=>ascensionPlayEncounter(asc,'p1',{type:'attack',index:1},CHARACTERS),/Aspetta la risposta/);
 asc=ascensionResolveEncounterReaction(asc,'p1',CHARACTERS,()=>.95);
 e=asc.participants.p1.encounter;
 assert.ok(e||asc.participants.p1.battleResult);
 if(e){
  assert.equal(e.turn,2);
  assert.equal(e.pendingReaction,null);
  assert.ok(e.lastReaction.text);
 }
});
test('Prismaball fallita: non infligge danno e non avanza turno prima della reazione mostrata',()=>{
 let asc=ascensionBeginAction(ready(),'p1','wild',CHARACTERS,()=>.42);
 const original=asc.participants.p1.encounter;
 const hp=asc.participants.p1.roster[0].hp;
 asc=ascensionPlayEncounter(asc,'p1',{type:'ball'},CHARACTERS,()=>.9999);
 const participant=asc.participants.p1,e=participant.encounter;
 assert.equal(participant.lastCapture.success,false);
 assert.equal(e.pendingReaction.phase,'enemy');
 assert.equal(e.pendingReaction.reason,'ball');
 assert.equal(e.turn,1);
 assert.equal(participant.roster[0].hp,hp,'L’avversario non colpisce durante i tic della Prismaball');
 assert.equal(e.foeHp,original.foeHp);
 asc=ascensionResolveEncounterReaction(asc,'p1',CHARACTERS,()=>.92);
 const after=asc.participants.p1.encounter;
 assert.ok(after?.turn===2 || asc.participants.p1.battleResult);
 if(after){
  assert.equal(after.pendingReaction,null);
  assert.ok(after.lastReaction.text);
 }
});
test('Le animazioni sono sequenziali e il client aspetta la Prismaball prima della reazione',()=>{
 const game=readFileSync(new URL('../src/screens/battle/AscensionClassicBattle.jsx',import.meta.url),'utf8');
 const engine=readFileSync(new URL('../src/systems/colosseumAscension.js',import.meta.url),'utf8');
 const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
 assert.match(game,/native\.status==='ascension_capture'/);
 assert.match(game,/playEventsAnimationImpl\(/);
 assert.match(game,/renderSwitchingPhaseView/);
 assert.match(game,/commitActionImpl\(/);
 assert.match(engine,/ascensionRealCaptureContinue/);
 assert.match(app,/kind==='native-switch'/);
 assert.match(app,/kind==='native-capture-continue'/);
});
