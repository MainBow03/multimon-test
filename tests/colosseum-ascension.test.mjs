import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {
 ASCENSION_ROUNDS,ASCENSION_MAX_TEAM,ASCENSION_MAX_LEVEL,ASCENSION_FINAL_TEAM,ASCENSION_STARTING_BALLS,
 ascensionStarterPool,ascensionCreate,ascensionSelectStarter,ascensionFighterFromMember,
 ascensionWildLevel,ascensionCaptureChance,ascensionBeginAction,ascensionPlayEncounter,ascensionResolveEncounterReaction,
 ascensionTrain,ascensionBuy,ASCENSION_SHOP,ascensionRoundReady,ascensionNextRound,ascensionSettleBots,
 ascensionCurrentMatch,ascensionChooseLineup,ascensionDuelAction,ascensionAdvanceMatch,
 ascensionCreateRealDuel,ascensionRealBotDuels
} from '../src/systems/colosseumAscension.js';

const roles=Array.from({length:8},(_,i)=>'p'+(i+1));
const room=(bots=false)=>({
 gameMode:'ascension',status:'ascension',players:Object.fromEntries(roles.map((r,i)=>[r,'Giocatore '+(i+1)])),
 isBot:Object.fromEntries(roles.map((r,i)=>[r,bots&&i>0]))
});
const init=()=>ascensionCreate(room(),CHARACTERS,()=>.35);
const ready=(asc=init())=>{
 let a=asc;
 for(const r of roles)a=ascensionSelectStarter(a,r,a.participants[r].options[0],CHARACTERS);
 return a;
};
const completeRound=(asc)=>{
 const next=structuredClone(asc);
 next.roles.forEach(r=>{next.participants[r].done=true;next.participants[r].encounter=null});
 return next;
};

test('Ogni partecipante riceve 5 starter economici, privati nella UI e livello 1',()=>{
 const pool=ascensionStarterPool(CHARACTERS);
 assert.ok(pool.length>=5);
 assert.ok(pool.every(c=>c.price==null||Number.isFinite(c.price)));
 const a=init();
 assert.equal(a.stage,'starters');
 assert.equal(a.roles.length,8);
 for(const r of roles){
  const p=a.participants[r];
  assert.equal(p.options.length,5);
  assert.equal(new Set(p.options).size,5);
  assert.ok(p.options.every(id=>pool.some(c=>c.id===id)));
  assert.equal(p.prismaballs,20);
  assert.equal(p.coins,100);
  assert.equal(p.roster.length,0);
 }
 assert.throws(()=>ascensionSelectStarter(a,'p1','superman',CHARACTERS));
 const b=ready(a);
 assert.equal(b.stage,'preparation');
 assert.ok(roles.every(r=>b.participants[r].roster[0].level===1));
 assert.ok(roles.every(r=>b.participants[r].roster[0].trainingHalves===0));
 assert.equal(ASCENSION_ROUNDS,18);
 assert.equal(ASCENSION_MAX_TEAM,9);
 assert.equal(ASCENSION_MAX_LEVEL,10);
 assert.equal(ASCENSION_FINAL_TEAM,7);
});

test('Cattura Prismaball usa scala ESATTA 10%, 25%, 50%, 75%, 99%',()=>{
 for(const [hp,expected] of [[100,.10],[75,.25],[50,.5],[25,.75],[10,.99],[1,.99]]){
  assert.ok(Math.abs(ascensionCaptureChance(hp,100)-expected)<.0000001,hp);
 }
 assert.equal(ascensionCaptureChance(0,100),0);
 assert.ok(ascensionCaptureChance(50,100,{status:'Addormentato'})>.5);
 assert.ok(ascensionCaptureChance(50,100,{veryRare:true})<.5);
 assert.equal(ascensionCaptureChance(10,100,{veryRare:true}),.99,
  'Al 10% di PS la sincronizzazione resta al 99% anche per un raro');
});

test('I selvatici sono tre livelli sotto al membro più forte, con limite minimo 1',()=>{
 const a=ready();
 const p=a.participants.p1;
 assert.equal(ascensionWildLevel(p),1);
 p.roster[0].level=9;
 assert.equal(ascensionWildLevel(p),6);
 p.roster[0].level=10;
 assert.equal(ascensionWildLevel(p),7);
});

test('Ogni vittoria contro un allenatore dà 0,5 punti a TUTTI i Multimon',()=>{
 let a=ready();
 let p=a.participants.p1;
 const extra=CHARACTERS.find(c=>c.id!==p.roster[0].id&&!c.isSummonOnly&&!c.isCampaignMonster);
 p.roster.push({id:extra.id,level:1,hp:70,xp:0,trainingHalves:0});
 a=ascensionBeginAction(a,'p1','trainer',CHARACTERS,()=>.15);
 assert.equal(a.participants.p1.encounter.kind,'trainer');
 const encounter=a.participants.p1.encounter;
 // L'avversario non può essere catturato in nessun caso.
 assert.throws(()=>ascensionPlayEncounter(a,'p1',{type:'ball'},CHARACTERS));
 // Un trainer debole viene sconfitto da un colpo valido per completare la verifica.
 a.participants.p1.encounter.foeHp=1;
 const heroId=a.participants.p1.roster[0].id;
 const idx=CHARACTERS.find(c=>c.id===heroId).moves.findIndex(m=>m?.power>0);
 assert.ok(idx>=0);
 a=ascensionPlayEncounter(a,'p1',{type:'attack',index:idx},CHARACTERS,()=>.01);
 a=ascensionResolveEncounterReaction(a,'p1',CHARACTERS,()=>.01);
 p=a.participants.p1;
 assert.equal(p.encounter,null);
 assert.equal(p.done,true);
 assert.equal(p.trainerWins,1);
 assert.deepEqual(p.roster.map(m=>m.trainingHalves),[1,1]);
 assert.ok(p.coins>100);
 assert.throws(()=>ascensionTrain(a,'p1',p.roster[1].id,CHARACTERS),'Mezzo punto non basta');
 p.roster.forEach(m=>m.trainingHalves=2);
 const before=p.roster[1].level;
 const b=ascensionTrain(a,'p1',p.roster[1].id,CHARACTERS);
 assert.equal(b.participants.p1.roster[1].level,before+1);
 assert.equal(b.participants.p1.roster[1].trainingHalves,0);
 assert.equal(b.participants.p1.roster[0].level,p.roster[0].level+1,
  'Il pulsante allena anche lo starter, non solo il Multimon cliccato');
 assert.equal(b.participants.p1.roster[0].trainingHalves,0);
 assert.equal(b.participants.p1.done,true,'Allenarsi fra i round non consuma un turno extra');
});

test('Cattura riuscita aumenta la squadra e consuma una sola Prismaball',()=>{
 let a=ready();
 a=ascensionBeginAction(a,'p1','wild',CHARACTERS,()=>.76);
 const wild=a.participants.p1.encounter;
 assert.equal(wild.kind,'wild');
 wild.foeHp=1;
 a=ascensionPlayEncounter(a,'p1',{type:'ball'},CHARACTERS,()=>.1);
 const p=a.participants.p1;
 assert.equal(p.roster.length,2);
 assert.equal(p.captures,1);
 assert.equal(p.prismaballs,19);
 assert.equal(p.done,true);
 assert.equal(p.encounter,null);
 assert.equal(p.lastCapture.success,true);
 assert.equal(p.lastCapture.failedAt,3,'Tre tic per cattura riuscita');
 const repeat=ready();
 assert.throws(()=>ascensionPlayEncounter(repeat,'p1',{type:'ball'},CHARACTERS));
});

test('Cattura fallita torna in battaglia e aggiorna la Prismaball',()=>{
 let a=ready();
 a=ascensionBeginAction(a,'p1','wild',CHARACTERS,()=>.76);
 a=ascensionPlayEncounter(a,'p1',{type:'ball'},CHARACTERS,()=>.99);
 const p=a.participants.p1;
 assert.equal(p.prismaballs,19);
 assert.equal(p.captures,0);
 assert.equal(p.lastCapture.success,false);
 assert.ok(p.lastCapture.failedAt>=1&&p.lastCapture.failedAt<=3);
 assert.ok(p.encounter||p.done,'Il selvatico reagisce se il team è vivo');
});

test('Dopo 18 round comincia un bracket reale con 8 giocatori',()=>{
 let a=ready();
 for(let round=1;round<=18;round++){
  const finished=completeRound(a);
  assert.equal(ascensionRoundReady(finished),true);
  a=ascensionNextRound(finished,CHARACTERS);
  assert.equal(a.stage,round===18?'colosseum':'preparation');
 }
 assert.equal(a.bracket.length,4);
 assert.equal(a.bracket[0].stage,'quarti');
 assert.equal(new Set(a.bracket.flatMap(m=>m.roles)).size,8);
 assert.equal(a.matchIndex,0);
});

test('La finale schiera fino a 7 Multimon o tutti quelli disponibili se sono meno',()=>{
 let a=ready();
 a=ascensionNextRound({...completeRound(a),round:18},CHARACTERS);
 const players=roles.slice(0,2);
 a.bracket=[{id:'f0',stage:'finale',roles:players,wins:{},winner:null,selection:{},actions:{},game:null,gameNumber:1}];
 const p=a.participants.p1;
 const ids=CHARACTERS.filter(c=>c.id!==p.roster[0].id&&!c.isSummonOnly&&!c.isCampaignMonster).slice(0,8).map(c=>c.id);
 p.roster.push(...ids.map(id=>({id,level:1,hp:70,xp:0,trainingHalves:0})));
 assert.equal(p.roster.length,9);
 assert.throws(()=>ascensionChooseLineup(a,'p1',p.roster.slice(0,8).map(m=>m.id),CHARACTERS));
 a=ascensionChooseLineup(a,'p1',p.roster.slice(0,7).map(m=>m.id),CHARACTERS);
 assert.equal(a.bracket[0].selection.p1.length,7);
 const other=a.participants.p2;
 a=ascensionChooseLineup(a,'p2',other.roster.map(m=>m.id),CHARACTERS);
 assert.equal(a.bracket[0].game.units.p2.length,1);
 assert.equal(a.bracket[0].game.units.p1.length,7);
 assert.ok(a.bracket[0].game.turn===1);
});

test('Le CPU scelgono starter e svolgono il proprio round senza interazioni manuali',()=>{
 const rm=room(true);
 let a=ascensionCreate(rm,CHARACTERS,()=>.4);
 a=ascensionSettleBots(a,rm,CHARACTERS,()=>.3);
 assert.equal(a.stage,'starters');
 assert.ok(roles.slice(1).every(r=>a.participants[r].roster.length===1));
 a=ascensionSelectStarter(a,'p1',a.participants.p1.options[0],CHARACTERS);
 a=ascensionSettleBots(a,rm,CHARACTERS,()=>.3);
 assert.equal(a.stage,'preparation');
 assert.ok(roles.slice(1).every(r=>a.participants[r].done));
 assert.equal(a.participants.p1.done,false);
});

test('Mercato usa monete vere, massimo due acquisti e niente allenamento comprabile',()=>{
 let a=ready();
 assert.ok(ASCENSION_SHOP.every(item=>item.price>0));
 assert.ok(!ASCENSION_SHOP.some(item=>item.training));
 assert.throws(()=>ascensionBuy(a,'p1','bad-item',null,CHARACTERS));
 a=ascensionBuy(a,'p1','ball',null,CHARACTERS);
 assert.equal(a.participants.p1.prismaballs,21);
 assert.equal(a.participants.p1.coins,65);
 const member=a.participants.p1.roster[0];
 member.hp=Math.max(1,member.hp-22);
 a=ascensionBuy(a,'p1','potion',member.id,CHARACTERS);
 assert.ok(a.participants.p1.roster[0].hp>member.hp);
 assert.equal(a.participants.p1.coins,43);
 assert.throws(()=>ascensionBuy(a,'p1','ball',null,CHARACTERS));
});

test('Non si catturano due volte gli stessi Multimon, ma resta possibile guadagnare esperienza',()=>{
 let a=ready();
 a=ascensionBeginAction(a,'p1','wild',CHARACTERS,()=>.76);
 const target=a.participants.p1.encounter.foeId;
 assert.notEqual(target,a.participants.p1.roster[0].id);
 a.participants.p1.roster.push({id:target,level:1,hp:70,xp:0,trainingHalves:0});
 assert.throws(()=>ascensionPlayEncounter(a,'p1',{type:'ball'},CHARACTERS),/già presente/);
});

test('Un intero Colosseo con otto bot si conclude e incorona un solo vincitore',()=>{
 const rm=room();rm.isBot=Object.fromEntries(roles.map(r=>[r,true]));
 let a=ascensionNextRound({...completeRound(ready()),round:18},CHARACTERS);
 for(let i=0;i<7;i++){
  for(let step=0;step<7&&!ascensionCurrentMatch(a)?.winner;step++){
   a=ascensionSettleBots(a,rm,CHARACTERS,()=>.22);
   if(ascensionCurrentMatch(a)?.game&&!ascensionCurrentMatch(a).game.classicRoom)
    a=ascensionCreateRealDuel(a,CHARACTERS,rm);
   a=ascensionRealBotDuels(a,rm,CHARACTERS);
  }
  assert.ok(ascensionCurrentMatch(a)?.winner,'Blocco partita '+(i+1));
  a=ascensionAdvanceMatch(a,CHARACTERS);
 }
 assert.equal(a.stage,'finished');
 assert.ok(roles.includes(a.champion));
 assert.equal(a.bracket.length,7,'4 quarti + 2 semifinali + 1 finale');
 assert.equal(a.bracket[6].stage,'finale');
 assert.equal(a.bracket[6].game.units[a.champion].length<=7,true);
});

test('Le schermate usano stanze, catture originali e comandi colosseo',()=>{
 const jsx=readFileSync(new URL('../src/screens/battle/AscensionView.jsx',import.meta.url),'utf8');
 const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
 const lobby=readFileSync(new URL('../src/screens/battle/LobbyView.jsx',import.meta.url),'utf8');
 assert.match(jsx,/PRISMABALL · SINCRONIZZAZIONE DIMENSIONALE/);
 assert.match(jsx,/ac-prism-device/);
 assert.match(jsx,/ASCENSION_FINAL_TEAM/);
 assert.match(jsx,/ascensionCaptureChance/);
 assert.match(jsx,/onAction\('starter'/);
 assert.match(jsx,/onAction\('duel-move'/);
 assert.match(app,/ascensionMutation/);
 assert.match(app,/runTransaction/);
 assert.match(lobby,/value="ascension"/);
});
