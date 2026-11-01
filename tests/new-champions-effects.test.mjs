import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTERS } from '../src/data/characters.js';
import { MOVES_DB } from '../src/data/moves.js';
import { CHAR_PRICES } from '../src/data/prices.js';
import { calculateDamageImpl } from '../src/systems/battleSystem.js';
import { isSnowImmune, snowstormOutcome, addEvasion, incomingAccuracy, crystalShield,
 beginRefraction, directHitAfterCrystalDefense, endRefractionTurn, randomBuff, randomDebuff,
 daffyCelebration, SNOWSTORM_LENGTH } from '../src/systems/championEffects.js';

const roster=Object.fromEntries(CHARACTERS.map(c=>[c.id,c]));
const move=n=>MOVES_DB[n];
test('Tutti e quattro i personaggi sono nel roster e acquistabili',()=>{
 for(const id of ['orsobianco','bugsbunny','daffyduck','diamante']){
  const c=roster[id];
  assert.ok(c,id+' manca dal database');
  assert.equal(c.moves.length,4);
  assert.equal(c.maxHp,c.hp);
  assert.equal(c.price,CHAR_PRICES[id]);
  assert.ok(c.img.startsWith('https://'));
 }
 assert.deepEqual(roster.orsobianco.types,['Ghiaccio','Roccia']);
 assert.deepEqual(roster.daffyduck.types,['Acqua']);
 assert.deepEqual(roster.diamante.types,['Cristallo']);
});
test('Orso Bianco: mosse, tempesta 5 turni, immunità e guarigione 5%',()=>{
 assert.equal(move('Ascia di Ghiaccio').statusEffect.chance,.15);
 assert.equal(move('Carica Valanga').accuracy,.95);
 assert.equal(move('Tecnica dell’Orso').heal,.1);
 assert.deepEqual(move('Tecnica dell’Orso').statBuff,{atk:1.5,def:1.5});
 assert.equal(move('Furia dell’Artico').targetCount,4);
 assert.equal(move('Furia dell’Artico').power,140);
 assert.equal(move('Furia dell’Artico').snowstormTurns,SNOWSTORM_LENGTH);
 assert.deepEqual(snowstormOutcome({...roster.orsobianco,hp:50},true),{damage:0,heal:6});
 assert.deepEqual(snowstormOutcome({types:['Normale'],hp:80,maxHp:100},true),{damage:2,heal:0});
 for(const type of ['Ghiaccio','Roccia','Robot'])assert.equal(isSnowImmune({types:[type]}),true);
 assert.deepEqual(snowstormOutcome({types:['Ghiaccio'],hp:80,maxHp:100},false),{damage:0,heal:0});
});
test('Bugs: elusione +20% con 2 utilizzi e passiva 50% buff',()=>{
 const bug={...roster.bugsbunny};
 assert.equal(move('Dentro la Tana').maxUses,2);
 assert.equal(move('Dentro la Tana').strictUses,true);
 assert.equal(addEvasion(bug),.2);
 assert.equal(incomingAccuracy({acc:1},{accuracy:1},bug),.8);
 assert.equal(addEvasion(bug),.4);
 assert.equal(incomingAccuracy({acc:1},{accuracy:1},bug),.6);
 const before=bug.atk;
 assert.equal(randomBuff(bug,()=>0),'atk');
 assert.equal(bug.atk,Math.floor(before*1.15));
 const enemy={atk:100,def:100,spd:100};
 assert.equal(randomDebuff(enemy,()=>.9999),'spd');
 assert.equal(enemy.spd,85);
 assert.equal(move('Carota Esplosiva').statusEffect.chance,.1);
 assert.equal(move('Battiterra').targetStatDebuff.spd,.9);
 assert.equal(move('Spuntino Rinvigorante').heal,.45);
});
test('Daffy: passiva KO alleato, 20% heal, +10% ATK',()=>{
 const char={...roster.daffyduck,hp:30};
 const gain=daffyCelebration(char);
 assert.equal(gain,Math.floor(char.maxHp*.2));
 assert.equal(char.hp,30+gain);
 assert.equal(char.atk,Math.floor(roster.daffyduck.atk*1.1));
 assert.equal(daffyCelebration({...char,passive:null}),0);
 assert.equal(move('Tuffo Disperato').accuracy,.75);
 assert.equal(move('Parlantina Scocciante').type,'Buio');
 assert.equal(move('Parlantina Scocciante').targetStatDebuff.def,.7);
 assert.equal(move('Parlantina Scocciante').statusEffect.chance,.4);
});
test('Diamante: muro da 20%, rifrazione e bonus Cristallo',()=>{
 const char={...roster.diamante};
 assert.equal(move('Schegge Diamantine').targetCount,2);
 assert.equal(move('Muro Cristallino').statBuff.spDef,1.5);
 assert.equal(move('Muro Cristallino').crystalShieldPercent,.2);
 assert.equal(move('Rifrazione di Diamante').refractionTurns,3);
 assert.equal(crystalShield(char),Math.floor(char.maxHp*.2));
 beginRefraction(char);
 assert.deepEqual(directHitAfterCrystalDefense(char,40),{damage:0,absorbed:20,refracted:true});
 assert.equal(char.crystalShieldHp,5);
 assert.deepEqual(directHitAfterCrystalDefense(char,20),{damage:15,absorbed:5,refracted:false});
 endRefractionTurn(char);
 assert.equal(char.refractionTurns,2);
 assert.deepEqual(directHitAfterCrystalDefense(char,20),{damage:10,absorbed:0,refracted:true});
 const attacker={...roster.diamante,statuses:[],passive:roster.diamante.passive,refractionTurns:2};
 const defender={...roster.bugsbunny,statuses:[]};
 const dmg=calculateDamageImpl({},attacker,defender,move('Schegge Diamantine'),1,false,()=>.5);
 const noRef=calculateDamageImpl({}, {...attacker,refractionTurns:0},defender,move('Schegge Diamantine'),1,false,()=>.5);
 assert.ok(dmg>noRef,'Rifrazione deve aumentare i danni Cristallo');
 const normal=calculateDamageImpl({},defender,{...attacker,passive:null},move('Carota Esplosiva'),1,false,()=>.5);
 const resisted=calculateDamageImpl({},defender,attacker,move('Carota Esplosiva'),1,false,()=>.5);
 assert.ok(resisted<normal,'Corpo Petrosapien deve ridurre i danni');
 assert.equal(move('Schiacciata Pesante').statusEffect.chance,.1);
});
