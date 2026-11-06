import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {MOVES_DB} from '../src/data/moves.js';
import {CHAR_PRICES} from '../src/data/prices.js';
import {MASTERY_CHARACTER_TITLES} from '../src/data/masteryTitles.js';
import {applyBattleStatModifier} from '../src/systems/statBalance.js';
import {NEGATIVE_STATUS_TYPES,activateNeutralizingSpray} from '../src/systems/newHeldAndPassiveEffects.js';
import {
  CURSED_BODY_STATUS,CURSED_BODY_CHANCE,CURSED_BODY_TURNS,BERRY_CHILL_CHANCE,
  isMoveDisabled,disabledMoveInfo,tryCursedBody,tickCursedBody,
  tryBerryChill,frillishSpoutPower
} from '../src/systems/berryFrillishEffects.js';

const character=id=>CHARACTERS.find(c=>c.id===id);
const clone=id=>structuredClone(character(id));
const move=name=>MOVES_DB[name];
const source=path=>readFileSync(new URL(path,import.meta.url),'utf8');

test('Berry è solo Ghiaccio, Frillish Acqua/Spettro; ognuno ha 4 mosse, prezzo e Padronanza',()=>{
 for(const id of ['berry','frillish']){
   const copies=CHARACTERS.filter(c=>c.id===id);
   assert.equal(copies.length,1,id);
   const c=copies[0];
   assert.equal(c.moves.length,4);
   assert.ok(c.moves.every(Boolean),'ogni mossa dev’essere definita');
   assert.ok(c.img.startsWith('https://'));
   assert.equal(c.price,200);
   assert.equal(CHAR_PRICES[id],200);
   assert.ok(MASTERY_CHARACTER_TITLES[id].length>=10);
 }
 assert.deepEqual(character('berry').types,['Ghiaccio']);
 assert.deepEqual(character('frillish').types,['Acqua','Spettro']);
 assert.equal(character('berry').img,'https://i.pinimg.com/736x/cb/4c/50/cb4c503067d9af5f642e8f60e0e5e4e1.jpg');
 assert.equal(character('frillish').img,'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/592.png');
 assert.equal(character('ametista').img,'https://i.pinimg.com/736x/11/b5/05/11b5056b41f87fbe3120b68ed5dcfb09.jpg');
 assert.equal(character('orsobianco').img,'https://i.pinimg.com/736x/f8/c0/56/f8c056c741d18ae29d7eccdb0adfd0f4.jpg');
});

test('Berry ha 4 mosse Ghiaccio, Coppa Rigenerante al 51% e Scivolata offensiva curativa',()=>{
 const berry=character('berry');
 assert.deepEqual(berry.moves.map(m=>m.name),[
   'Gelato Glaciale','Grandinata di Coni','Coppa Rigenerante','Scivolata Gelata'
 ]);
 assert.ok(berry.moves.every(m=>m.type==='Ghiaccio'));
 assert.equal(move('Gelato Glaciale').power,85);
 assert.equal(move('Gelato Glaciale').statusEffect.chance,.15);
 assert.equal(move('Grandinata di Coni').targetCount,2);
 assert.deepEqual(move('Grandinata di Coni').hitStatDebuff,{spd:.9,chance:.2});
 assert.equal(move('Coppa Rigenerante').heal,.51);
 assert.equal(move('Coppa Rigenerante').targetMode,'ally');
 assert.equal(move('Coppa Rigenerante').maxUses,3);
 assert.equal(move('Scivolata Gelata').power,100);
 assert.equal(move('Scivolata Gelata').maxUses,2);
 assert.equal(move('Scivolata Gelata').berryTeamHeal,.25);
 assert.equal(move('Scivolata Gelata').targetStatDebuff,undefined);
 assert.equal(berry.passive.type,'berry_sweet_chill');
 assert.equal(berry.passive.chance,.25);
});

test('Dolce Freddo si applica solo agli attacchi andati a segno, non a cure o nemici immuni',()=>{
 const berry=clone('berry');
 const target=clone('luffy');
 const damaging=move('Gelato Glaciale');
 assert.equal(BERRY_CHILL_CHANCE,.25);
 assert.equal(tryBerryChill(berry,target,damaging,()=>.2499),true);
 assert.equal(tryBerryChill(berry,target,damaging,()=>.25),false);
 assert.equal(tryBerryChill(berry,target,move('Coppa Rigenerante'),()=>0),false);
 target.passive.immuneToNegativeStatuses=true;
 assert.equal(tryBerryChill(berry,target,damaging,()=>0),false);
 delete target.passive.immuneToNegativeStatuses;
 target.heldItem='scudo_antimagia';
 assert.equal(tryBerryChill(berry,target,damaging,()=>0),false);
 delete target.heldItem;
 target.hp=0;
 assert.equal(tryBerryChill(berry,target,damaging,()=>0),false);
 target.hp=target.maxHp;
 target.baseSpd=target.spd;
 assert.equal(applyBattleStatModifier(target,'spd',.85),true);
 assert.ok(target.spd<target.baseSpd);
});

test('Frillish: danni, probabilità e tipi delle 4 mosse',()=>{
 const fs=character('frillish').moves;
 assert.deepEqual(fs.map(m=>m.name),['Idrovampata','Energipalla','Zampillo','Palla Ombra']);
 assert.equal(move('Idrovampata').power,85);
 assert.equal(move('Idrovampata').type,'Acqua');
 assert.deepEqual(move('Idrovampata').statusEffect,{type:'Scottato',chance:.3,turns:3});
 assert.equal(move('Energipalla (Frillish)').power,90);
 assert.equal(move('Energipalla (Frillish)').type,'Erba');
 assert.deepEqual(move('Energipalla (Frillish)').hitStatDebuff,{def:.7,chance:.1});
 assert.equal(move('Zampillo (Frillish)').targetCount,24);
 assert.equal(move('Zampillo (Frillish)').power,70);
 assert.equal(move('Zampillo (Frillish)').spoutLowHpPower,100);
 assert.equal(move('Palla Ombra (Frillish)').power,95);
 assert.equal(move('Palla Ombra (Frillish)').type,'Spettro');
});
test('Zampillo aumenta solo sotto il 50% dei PS, per ogni bersaglio individualmente',()=>{
 const spout=move('Zampillo (Frillish)');
 assert.equal(frillishSpoutPower({hp:100,maxHp:100},spout),70);
 assert.equal(frillishSpoutPower({hp:50,maxHp:100},spout),70,'esattamente al 50% non viene potenziata');
 assert.equal(frillishSpoutPower({hp:49,maxHp:100},spout),100);
 assert.equal(frillishSpoutPower({hp:3,maxHp:9},spout),100);
 assert.equal(frillishSpoutPower({hp:80,maxHp:100},spout),70);
});

test('Corpo Funesto: 20% di bloccare la mossa usata, con 3 turni effettivi',()=>{
 const defender=clone('frillish'),attacker=clone('berry');
 attacker.statuses=[];
 attacker.moves=attacker.moves.map(m=>({...m,remainingUses:null}));
 assert.equal(CURSED_BODY_CHANCE,.2);
 assert.equal(CURSED_BODY_TURNS,3);
 const used=attacker.moves[0];
 assert.equal(tryCursedBody(defender,attacker,used,()=>.2),false,'20% è la soglia esclusiva');
 assert.equal(tryCursedBody(defender,attacker,used,()=>.1999),true);
 assert.equal(attacker.statuses.length,1);
 assert.equal(attacker.statuses[0].type,CURSED_BODY_STATUS);
 assert.equal(attacker.statuses[0].moveName,used.name);
 assert.equal(disabledMoveInfo(attacker,used).turns,3);
 assert.equal(isMoveDisabled(attacker,used),true);
 assert.equal(isMoveDisabled(attacker,attacker.moves[1]),false);
 assert.equal(tryCursedBody(defender,attacker,attacker.moves[1],()=>0),false,'niente più blocchi contemporanei');
 assert.deepEqual(attacker.moves.map(m=>m.name),character('berry').moves.map(m=>m.name),
   'a differenza del Guanto Ruba-Mosse non si devono rimuovere/spostare le mosse');
 assert.deepEqual(tickCursedBody(attacker),[],'turno di applicazione non consumato');
 assert.equal(disabledMoveInfo(attacker,used).turns,3);
 assert.deepEqual(tickCursedBody(attacker),[]);
 assert.equal(disabledMoveInfo(attacker,used).turns,2);
 assert.deepEqual(tickCursedBody(attacker),[]);
 assert.equal(disabledMoveInfo(attacker,used).turns,1);
 assert.deepEqual(tickCursedBody(attacker),[used.name]);
 assert.equal(isMoveDisabled(attacker,used),false,'libero dopo esattamente 3 turni completi');
});
test('Corpo Funesto non crea softlock, rispetta difese anti-magia e immunità',()=>{
 const defender=clone('frillish'),attacker=clone('berry');
 attacker.statuses=[];
 const used=attacker.moves[0];
 attacker.heldItem='scudo_antimagia';
 assert.equal(tryCursedBody(defender,attacker,used,()=>0),false);
 delete attacker.heldItem;
 attacker.passive.immuneToNegativeStatuses=true;
 assert.equal(tryCursedBody(defender,attacker,used,()=>0),false);
 delete attacker.passive.immuneToNegativeStatuses;
 attacker.moves=[used];
 assert.equal(tryCursedBody(defender,attacker,used,()=>0),false,
   'se rimarrebbe senza attacchi disponibili Corpo Funesto non lo intrappola');
 attacker.moves=clone('berry').moves;
 attacker.statuses=[];
 assert.equal(tryCursedBody(defender,attacker,{name:'Mossa Fantasma',power:85},()=>0),false,
   'non disabilita una mossa che non fa parte del moveset attuale');
 assert.equal(tryCursedBody(defender,attacker,{name:used.name,power:0},()=>0),false);
 assert.ok(NEGATIVE_STATUS_TYPES.includes(CURSED_BODY_STATUS));
 attacker.heldItem='spray_neutralizzante';
 tryCursedBody(defender,attacker,attacker.moves[0],()=>0);
 const removed=activateNeutralizingSpray(attacker);
 assert.ok(removed.includes(CURSED_BODY_STATUS));
 assert.equal(isMoveDisabled(attacker,attacker.moves[0]),false);
});

test('Motore, menu, CPU, Enciclopedia e registri collegati a Corpo Funesto',()=>{
 const battle=source('../src/systems/battleSystem.js');
 const arena=source('../src/screens/battle/BattlingView.jsx');
 const cpu=source('../src/systems/strategicCpu.js');
 const codex=source('../src/components/BattleCodex.jsx');
 assert.match(battle,/tryCursedBody\(target,options\.attacker,options\.move\)/);
 assert.match(battle,/tickCursedBody\(fighter\)/);
 assert.match(battle,/isMoveDisabled\(attacker,move\)/);
 assert.match(battle,/isMoveDisabled\(activeCommandChar/);
 assert.match(battle,/frillishSpoutPower\(t\.char,move\)/);
 assert.match(battle,/tryBerryChill\(options\.attacker,target,options\.move\)/);
 assert.match(arena,/let isDisabled = isMoveDisabled\(activeCommandChar,move\)/);
 assert.match(arena,/Disabilitata ·/);
 assert.match(arena,/s\.moveName/);
 assert.match(cpu,/!isMoveDisabled\(char,m\)/);
 assert.match(codex,/Mossa Disabilitata/);
 assert.ok(move('Guanto Ruba-Mosse').stealMove?.turns===3,'Doraemon mantiene il suo gadget esistente');
});
