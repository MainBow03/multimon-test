import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  createBattlePlaybackSnapshot,applySummonPlaybackEvent,
  visibleOnlineZodiacSpirits
} from '../src/systems/battleSummonPlayback.js';
import {summonZodiacSpirit} from '../src/systems/zodiacSpirits.js';
import {CHARACTERS} from '../src/data/characters.js';

const lucy=role=>({
  id:'lucy',name:'Lucy Heartfilia',hp:100,maxHp:100,
  zodiacSpiritId:role==='p1'?'zodiac_aries':'zodiac_leo',
  passive:{type:'on_enter',zodiacSummon:true,maxUses:99}
});
function sharedRoom(){
  const teams={p1:[lucy('p1')],p2:[lucy('p2')],p3:[{id:'kirby',name:'Kirby',hp:100}],p4:[]};
  const field={p1:[0],p2:[0],p3:[0],p4:[]};
  const a=summonZodiacSpirit(teams,field,'p1',0,CHARACTERS);
  const b=summonZodiacSpirit(teams,field,'p2',0,CHARACTERS);
  return {
    teams,field,
    events:[
      {type:'summon',player:'p1',fieldIdx:a.idx,newChar:structuredClone(a.char),text:'✨ Lucy evoca '+a.char.name},
      {type:'summon',player:'p2',fieldIdx:b.idx,newChar:structuredClone(b.char),text:'✨ Lucy evoca '+b.char.name}
    ]
  };
}

test('In uno stesso scontro online gli Spiriti di due Lucy appartengono ai giocatori corretti',()=>{
 const room=sharedRoom();
 const a=visibleOnlineZodiacSpirits(room.teams,room.field,'p1');
 const b=visibleOnlineZodiacSpirits(room.teams,room.field,'p2');
 assert.deepEqual(a.map(c=>c.id),['zodiac_aries']);
 assert.deepEqual(b.map(c=>c.id),['zodiac_leo']);
 assert.equal(a[0].zodiacOwner,'p1');
 assert.equal(b[0].zodiacOwner,'p2');
 assert.equal(visibleOnlineZodiacSpirits(room.teams,room.field,'p3').length,0);
});

test('Al primo turno la vista animata nasconde gli Spiriti fino alla loro evocazione',()=>{
 const room=sharedRoom(),before=structuredClone(room);
 const start=createBattlePlaybackSnapshot(room);
 assert.deepEqual(start.field,{p1:[0],p2:[0],p3:[0],p4:[]});
 assert.deepEqual(room,before,'La stanza condivisa Firestore non va modificata');
 let state=applySummonPlaybackEvent(start,room.events[1]);
 assert.deepEqual(state.field.p1,[0]);
 assert.deepEqual(state.field.p2,[0,1]);
 assert.equal(state.teams.p2[1].zodiacOwner,'p2');
 assert.equal(visibleOnlineZodiacSpirits(state.teams,state.field,'p1').length,0);
 assert.deepEqual(visibleOnlineZodiacSpirits(state.teams,state.field,'p2').map(c=>c.id),['zodiac_leo']);
 state=applySummonPlaybackEvent(state,room.events[0]);
 assert.deepEqual(state.field.p1,[0,1]);
 assert.deepEqual(state.field.p2,[0,1]);
 assert.equal(state.teams.p1[1].id,'zodiac_aries');
 assert.deepEqual(room,before);
});

test('Rete lenta, replay e snapshot multipli non duplicano mai uno Spirito',()=>{
 const room=sharedRoom();
 let state=createBattlePlaybackSnapshot(room);
 for(let i=0;i<3;i++)state=applySummonPlaybackEvent(state,room.events[1]);
 assert.deepEqual(state.field.p2,[0,1]);
 assert.equal(state.teams.p2.length,2);
 assert.equal(state.teams.p2.filter(c=>c?.id==='zodiac_leo').length,1);
 const different=applySummonPlaybackEvent(state,room.events[0]);
 assert.equal(different.teams.p2.length,2);
 assert.equal(different.teams.p1.length,2);
 assert.equal(different.field.p1.length,2);
});

test('I turni successivi iniziano dallo snapshot precedente, non dalla squadra finale',()=>{
 const room=sharedRoom();
 room.startOfTurnTeams={p1:[lucy('p1')],p2:[lucy('p2')],p3:[],p4:[]};
 room.startOfTurnField={p1:[0],p2:[0],p3:[],p4:[]};
 const first=createBattlePlaybackSnapshot(room);
 assert.equal(first.teams.p1.length,1);
 assert.equal(first.teams.p2.length,1);
 const after=applySummonPlaybackEvent(first,room.events[1]);
 assert.equal(after.teams.p2.length,2);
 assert.equal(after.teams.p2[1].isZodiacSpirit,true);
});

test('Non mostra Spiriti KO, riserve, altri proprietari o evocazioni estranee',()=>{
 const room=sharedRoom();
 const dead=structuredClone(room);dead.teams.p1[1].hp=0;
 assert.equal(visibleOnlineZodiacSpirits(dead.teams,dead.field,'p1').length,0);
 const benched=structuredClone(room);benched.field.p2=[0];
 assert.equal(visibleOnlineZodiacSpirits(benched.teams,benched.field,'p2').length,0);
 const stolen=structuredClone(room);stolen.teams.p2[1].zodiacOwner='p1';
 assert.equal(visibleOnlineZodiacSpirits(stolen.teams,stolen.field,'p2').length,0);
 assert.equal(applySummonPlaybackEvent(room,{type:'text'}),room);
});

test('L’animazione online usa gli stessi eventi per host, ospiti e spettatori',()=>{
 const engine=readFileSync(new URL('../src/systems/battleSystem.js',import.meta.url),'utf8');
 const arena=readFileSync(new URL('../src/screens/battle/BattlingView.jsx',import.meta.url),'utf8');
 const intro=readFileSync(new URL('../src/screens/battle/PreBattleView.jsx',import.meta.url),'utf8');
 const coop=readFileSync(new URL('../src/systems/coopExpedition.js',import.meta.url),'utf8');
 assert.match(engine,/createBattlePlaybackSnapshot\(gameState\)/);
 assert.match(engine,/applySummonPlaybackEvent\(\{teams:currentDisplay,field:currentDisplayField\},evt\)/);
 assert.match(engine,/startOfTurnTeams:null,startOfTurnField:null/);
 assert.match(coop,/startOfTurnTeams:null,startOfTurnField:null/);
 assert.match(arena,/visibleOnlineZodiacSpirits/);
 assert.match(arena,/zodiac-portal-entrance/);
 assert.match(intro,/visibleOnlineZodiacSpirits\(gameState\.teams,gameState\.field,p\)/);
});
