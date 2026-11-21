import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {ascensionCreate,ascensionSelectStarter,ascensionBeginAction,
 ascensionNextRound,ascensionChooseLineup,ascensionCurrentMatch,ascensionDuelAction}
 from '../src/systems/colosseumAscension.js';
import {ascensionClassicView} from '../src/systems/ascensionClassicBattle.js';

const roles=Array.from({length:8},(_,i)=>'p'+(i+1));
const room=()=>({gameMode:'ascension',status:'ascension',
 players:Object.fromEntries(roles.map(r=>[r,r.toUpperCase()])),
 isBot:Object.fromEntries(roles.map(r=>[r,false]))});
function initialized(){
 let asc=ascensionCreate(room(),CHARACTERS,()=>.35);
 for(const role of roles)
  asc=ascensionSelectStarter(asc,role,asc.participants[role].options[0],CHARACTERS);
 return asc;
}
test('Selvatici e allenatori sono proiettati nella stessa arena standard',()=>{
 for(const kind of ['wild','trainer']){
  const r=room();
  r.ascension=ascensionBeginAction(initialized(),'p1',kind,CHARACTERS,()=>.25);
  const p=r.ascension.participants.p1;
  const model=ascensionClassicView(r,'p1',CHARACTERS);
  assert.equal(model.view.status,'battling');
  assert.equal(model.view.gameMode,'ascension');
  assert.equal(model.view.teams.p1.length,p.roster.length);
  assert.equal(model.view.field.p1[0],p.encounter.active);
  assert.equal(model.view.field.p2[0],0);
  assert.equal(model.view.teams.p2[0].hp,p.encounter.foeHp);
  assert.equal(model.view.teams.p2[0].adventureLevel,p.encounter.foeLevel);
  assert.equal(model.canCommand,true);
  assert.equal(model.view.hyperUsed.p1,true);
  assert.ok(model.view.teams.p1[0].moves.length);
  assert.equal(Boolean(model.view.ascensionCapture),kind==='wild');
  assert.equal(model.view.ascensionEncounterKind,kind);
 }
});
test('I duelli proiettano correttamente squadre e spettatori, anche in 2v2',()=>{
 let asc=initialized();
 asc=ascensionNextRound({...asc,round:18,participants:Object.fromEntries(
  roles.map(r=>[r,{...asc.participants[r],done:true,encounter:null}]))},CHARACTERS);
 const participants=asc.participants;
 const first=asc.bracket[0].roles[0],second=asc.bracket[0].roles[1];
 const extra=CHARACTERS.find(c=>c.id!==participants[first].roster[0].id&&c.moves?.length&&!c.isCampaignMonster&&!c.isSummonOnly);
 participants[first].roster.push({id:extra.id,level:1,hp:50,xp:0,trainingHalves:0});
 const r=room();r.ascension=asc;
 let a=ascensionChooseLineup(asc,first,participants[first].roster.map(m=>m.id),CHARACTERS);
 a=ascensionChooseLineup(a,second,participants[second].roster.map(m=>m.id),CHARACTERS);
 r.ascension=a;
 const view=ascensionClassicView(r,first,CHARACTERS);
 assert.ok(view.duel);
 assert.equal(view.view.players.p1,first.toUpperCase());
 assert.equal(view.view.teams.p1.length,2);
 assert.deepEqual(view.view.field.p1,[0]);
 assert.equal(view.canCommand,true);
 const spec=ascensionClassicView(r,roles.find(r=>!a.bracket[0].roles.includes(r)),CHARACTERS);
 assert.equal(spec.spectators,true);
 assert.equal(spec.canCommand,false);
 assert.equal(spec.view.field.p2.length,1);
 const finale=structuredClone(a);
 finale.bracket[0].stage='finale';
 const finalModel=ascensionClassicView({...r,ascension:finale},first,CHARACTERS);
 assert.deepEqual(finalModel.view.field.p1,[0,1]);
 assert.equal(finalModel.view.settings.teamSize,2);
});
test('Cambio nel pannello originale fa passare il turno senza duplicare un attacco',()=>{
 let a=initialized();
 a=ascensionNextRound({...a,round:18,participants:Object.fromEntries(
  roles.map(r=>[r,{...a.participants[r],done:true,encounter:null}]))},CHARACTERS);
 const m=ascensionCurrentMatch(a),rolesInMatch=m.roles;
 const first=rolesInMatch[0],second=rolesInMatch[1];
 const base=a.participants[first].roster[0].id;
 const extra=CHARACTERS.find(c=>c.id!==base&&!c.isCampaignMonster&&!c.isSummonOnly&&c.moves?.length);
 a.participants[first].roster.push({id:extra.id,level:1,hp:55,xp:0,trainingHalves:0});
 a=ascensionChooseLineup(a,first,[base,extra.id],CHARACTERS);
 a=ascensionChooseLineup(a,second,[a.participants[second].roster[0].id],CHARACTERS);
 assert.throws(()=>ascensionDuelAction(a,first,{type:'switch',fromIdx:0,index:0},CHARACTERS));
 a=ascensionDuelAction(a,first,{type:'switch',fromIdx:0,index:1},CHARACTERS);
 assert.equal(a.bracket[0].game.actions[first][0].type,'switch');
 a=ascensionDuelAction(a,second,0,CHARACTERS,()=>.5);
 assert.equal(a.bracket[0].game.field[first][0],1);
 assert.equal(a.bracket[0].game.units[first][1].id,extra.id);
 assert.ok(a.bracket[0].game.log.some(x=>/ritira|entra in campo|manda in campo/i.test(x)));
});
test('Ascesa usa realmente BattlingView e non la vecchia arena finta',()=>{
 const adapter=readFileSync(new URL('../src/screens/battle/AscensionClassicBattle.jsx',import.meta.url),'utf8');
 const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
 assert.match(adapter,/import \{renderBattlingView\} from '\.\/BattlingView\.jsx'/);
 assert.match(adapter,/renderBattlingView\(ctx\)/);
 assert.match(app,/inAscensionCombat/);
 assert.match(app,/AscensionClassicBattle/);
 assert.doesNotMatch(adapter,/AscensionBattleField/);
});
