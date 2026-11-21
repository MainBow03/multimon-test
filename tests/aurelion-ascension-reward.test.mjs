import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {MOVES_DB} from '../src/data/moves.js';
import {AURELION_ID,AURELION_CHARACTER,AURELION_MOVES,AURELION_PASSIVE}
 from '../src/data/colosseumSovereign.js';
import {ascensionAllChars,ascensionStarterPool,ascensionCreate,
 ascensionAdvanceMatch} from '../src/systems/colosseumAscension.js';
const read=relative=>readFileSync(new URL(relative,import.meta.url),'utf8');
const roles=Array.from({length:8},(_,i)=>'p'+(i+1));
const baseRoom={players:Object.fromEntries(roles.map(x=>[x,x])),
 isBot:Object.fromEntries(roles.map(x=>[x,false]))};

test('Il Sovrano possiede esattamente il tipo, le mosse e gli effetti richiesti',()=>{
 const one=CHARACTERS.filter(c=>c.id===AURELION_ID);
 assert.equal(one.length,1);
 const c=one[0];
 assert.equal(c.name,'Sovrano Aurelion');
 assert.deepEqual(c.types,['Buio','Folletto']);
 assert.equal(c.moves.length,4);
 assert.deepEqual(c.moves.map(m=>m.name),
  ['Bastone del Sovrano','Scatto Regale','Mantello Elastico','Ascesa del Sovrano']);
 assert.deepEqual(c.moves.map(m=>m.power),[65,70,0,100]);
 assert.equal(MOVES_DB['Bastone del Sovrano'].targetCount,4);
 assert.deepEqual(MOVES_DB['Bastone del Sovrano'].statusEffect,
  {type:'Accecato',chance:.2,turns:3});
 assert.equal(MOVES_DB['Scatto Regale'].priority,1);
 assert.equal(MOVES_DB['Mantello Elastico'].isProtect,true);
 assert.equal(MOVES_DB['Mantello Elastico'].royalReflectRatio,.3);
 assert.equal(MOVES_DB['Ascesa del Sovrano'].type,'Folletto');
 assert.equal(c.passive.type,'aurelion_royal');
 assert.equal(c.passive.name,'Editto della Corona');
 assert.ok(c.isSecretUnlock&&c.isAscensionChampionReward&&c.isAscensionBanned);
 assert.equal(c.price,undefined,'La ricompensa non è in vendita');
 assert.ok(c.img.startsWith('data:image/webp;base64,'));
 assert.ok(Buffer.from(c.img.split(',')[1],'base64').length>3000);
});
test('Aurelion è impossibile da trovare tra starter, selvatici e allenatori del Colosseo',()=>{
 assert.ok(!ascensionAllChars(CHARACTERS).some(c=>c.id===AURELION_ID));
 assert.ok(!ascensionStarterPool(CHARACTERS).some(c=>c.id===AURELION_ID));
 const asc=ascensionCreate(baseRoom,CHARACTERS,()=>.1);
 for(const role of roles)assert.ok(!asc.participants[role].options.includes(AURELION_ID));
});
test('L’incoronazione è l’unico sblocco: il campione è memorizzato nella stanza',()=>{
 const asc=ascensionCreate(baseRoom,CHARACTERS);
 const finale={...asc,stage:'colosseum',bracket:[{
  id:'f',stage:'finale',roles:['p1','p2'],winner:'p1',
  wins:{p1:1,p2:0},selection:{},gameNumber:1,game:null
 }],matchIndex:0};
 const after=ascensionAdvanceMatch(finale,CHARACTERS);
 assert.equal(after.stage,'finished');
 assert.equal(after.champion,'p1');
 const app=read('../src/App.jsx');
 assert.match(app,/a\.champion!==playerRole/);
 assert.match(app,/updateLocalStats\(\{unlockChar:'sovranoaurelion'\}\)/);
 assert.match(app,/getPlayerData\(\)\.unlockedChars\?\.includes\('sovranoaurelion'\)/);
});
test('L’immagine del Sovrano è visualizzata nell’introduzione, nel premio e nella collezione',()=>{
 const intro=read('../src/screens/battle/AscensionOpeningCeremony.jsx');
 const view=read('../src/screens/battle/AscensionView.jsx');
 const collection=read('../src/screens/hub/CollectionView.jsx');
 assert.match(intro,/sovereign\.img/);
 assert.match(view,/character\(chars,'sovranoaurelion'\)\.img/);
 assert.match(view,/RICOMPENSA ESCLUSIVA/);
 assert.match(collection,/getCollectionEntries/);
});
test('La lotta originale è invocata per entrambe le fasi del Colosseo',()=>{
 const engine=read('../src/systems/colosseumAscension.js');
 const native=read('../src/systems/ascensionNativeBattle.js');
 assert.match(engine,/const result=ascensionNativeTurn\(/);
 assert.match(engine,/const reaction=ascensionNativeTurn\(/);
 assert.match(native,/calculateTurnImpl\(ctx,allActions\)/);
 assert.match(native,/applyOnEnterPassiveImpl/);
});
