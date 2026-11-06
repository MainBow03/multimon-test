import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {MOVES_DB} from '../src/data/moves.js';
import {CHAR_PRICES} from '../src/data/prices.js';
import {MASTERY_CHARACTER_TITLES} from '../src/data/masteryTitles.js';
import {applyBattleStatModifier,setBattleStatGainObserver} from '../src/systems/statBalance.js';
import {
  HEAT_CHARGE_CHANCE,MAX_HEAT_CHARGES,HEAT_BURST_FACTOR,MAGMA_BURN_CHANCE,
  addHeatCharge,consumeHeatBurst,flameMoveDamageFactor,tryMagmaHeartBurn,
  createImperfectGemObserver
} from '../src/systems/gemFlameEffects.js';

const fighter=id=>{
 const base=structuredClone(CHARACTERS.find(c=>c.id===id));
 return {...base,
   baseAtk:base.atk,baseDef:base.def,baseSpd:base.spd,
   baseSpAtk:base.spAtk??base.atk,baseSpDef:base.spDef??base.def,
   statuses:[],heatCharges:0
 };
};
const ability=(c)=>c.passive?.name;
test('Ametista e Principessa Fiamma nel roster con PNG, tipi, 4 mosse, prezzo e padronanza',()=>{
 const am=fighter('ametista'),fl=fighter('flameprincess');
 assert.deepEqual(am.types,['Roccia','Magico']);
 assert.deepEqual(fl.types,['Fuoco','Magico']);
 assert.equal(ability(am),'Gemma Imperfetta');
 assert.equal(ability(fl),'Cuore di Magma');
 assert.equal(am.passive.maxUses,1);
 for(const c of [am,fl]){
   assert.equal(CHARACTERS.filter(p=>p.id===c.id).length,1);
   assert.equal(c.moves.length,4);
   assert.ok(c.moves.every(Boolean));
   assert.ok(c.img.startsWith('https://'));
   assert.equal(c.price,CHAR_PRICES[c.id]);
   assert.ok(MASTERY_CHARACTER_TITLES[c.id]?.length>8);
 }
 assert.equal(fl.img,'https://i.pinimg.com/736x/88/43/27/88432790e49767f910b28c5139e2c081.jpg');
 assert.equal(CHAR_PRICES.ametista,250);
 assert.equal(CHAR_PRICES.flameprincess,250);
});

test('Ametista ha tutte le mosse ed effetti richiesti, inclusa la riduzione personale Difesa',()=>{
 const moves=fighter('ametista').moves;
 const whip=MOVES_DB['Frusta di Quarzo'];
 assert.equal(whip.power,95);
 assert.equal(whip.type,'Roccia');
 assert.equal(whip.accuracy,.90);
 assert.deepEqual(whip.statusEffect,{type:'Scottato',chance:.15,turns:3});
 const spin=MOVES_DB['Ruotazione Furiosa'];
 assert.equal(spin.power,70);
 assert.equal(spin.targetCount,2);
 assert.equal(spin.statusEffect.type,'Confuso');
 assert.equal(spin.statusEffect.chance,.13);
 assert.equal(MOVES_DB['Titanide da Ring'].power,110);
 assert.deepEqual(MOVES_DB['Titanide da Ring'].selfStatBuff,{def:.7});
 assert.equal(MOVES_DB['Lazo di Quarzo'].type,'Magico');
 assert.equal(MOVES_DB['Lazo di Quarzo'].power,90);
 assert.ok(moves.some(m=>m.name==='Lazo di Quarzo'));
});

test('Gemma Imperfetta copia SOLO il primo potenziamento e tutte le statistiche della sua azione',()=>{
 const am=fighter('ametista'),ally=fighter('luffy'),foe=fighter('zoro');
 const teams={p1:[am,ally],p2:[foe]},field={p1:[0,1],p2:[0]},events=[];
 const obs=createImperfectGemObserver(teams,field,events,applyBattleStatModifier);
 const stop=setBattleStatGainObserver(obs.onStatIncrease);
 try{
   obs.beginAction();
   applyBattleStatModifier(ally,'atk',1.25);
   applyBattleStatModifier(ally,'def',1.15);
   const atk=am.atk,def=am.def;
   assert.equal(am.gemImperfectUsed,true);
   assert.equal(atk,am.baseAtk+Math.floor(am.baseAtk*.25));
   assert.equal(def,am.baseDef+Math.floor(am.baseDef*.15));
   applyBattleStatModifier(foe,'spd',1.5);
   assert.equal(am.spd,am.baseSpd,'non copia il potenziamento di un secondo personaggio');
   obs.beginAction();
   applyBattleStatModifier(ally,'spd',1.3);
   assert.equal(am.spd,am.baseSpd,'un buff successivo dello stesso alleato non riattiva la passiva');
   assert.equal(am.atk,atk);
   assert.equal(am.def,def);
   assert.equal(events.filter(e=>e.text?.includes('attiva Gemma Imperfetta')).length,1);
 }finally{stop()}
});
test('Gemma Imperfetta può copiare il PRIMO buff nemico, non quello in panchina',()=>{
 const am=fighter('ametista'),bench=fighter('luffy'),enemy=fighter('zoro');
 const teams={p1:[am,bench],p2:[enemy]},field={p1:[0],p2:[0]},events=[];
 const obs=createImperfectGemObserver(teams,field,events,applyBattleStatModifier);
 const stop=setBattleStatGainObserver(obs.onStatIncrease);
 try{
   obs.beginAction();
   applyBattleStatModifier(bench,'atk',1.5);
   assert.equal(am.gemImperfectUsed,undefined);
   applyBattleStatModifier(enemy,'atk',1.4);
   assert.equal(am.gemImperfectUsed,true);
   assert.ok(am.atk>am.baseAtk);
 }finally{stop()}
});

test('Cuore di Magma: 25% per colpo fisico che infligge danni; non attacca gli status',()=>{
 const fl=fighter('flameprincess'),attacker=fighter('luffy');
 assert.equal(MAGMA_BURN_CHANCE,.25);
 assert.equal(tryMagmaHeartBurn(fl,attacker,{power:85,special:false},()=>.24),true);
 assert.deepEqual(attacker.statuses,[{type:'Scottato',turns:3}]);
 assert.equal(tryMagmaHeartBurn(fl,attacker,{power:85,special:false},()=>.1),false,'niente scottatura doppia');
 const clean=fighter('luffy');
 assert.equal(tryMagmaHeartBurn(fl,clean,{power:90,special:false},()=>.25),false);
 assert.equal(tryMagmaHeartBurn(fl,clean,{power:90,special:true},()=>0),false);
 assert.equal(tryMagmaHeartBurn(fl,clean,{power:0},()=>0),false);
 clean.heldItem='scudo_antimagia';
 assert.equal(tryMagmaHeartBurn(fl,clean,{power:90,special:false},()=>0),false);
});

test('Principessa Fiamma accumula 0-2 cariche con probabilità 50%, bonus +25% soltanto al finisher',()=>{
 const flame=fighter('flameprincess');
 assert.equal(HEAT_CHARGE_CHANCE,.5);
 assert.equal(MAX_HEAT_CHARGES,2);
 assert.equal(HEAT_BURST_FACTOR,1.25);
 assert.equal(addHeatCharge(flame,()=>.50),false);
 assert.equal(flame.heatCharges,0);
 assert.equal(addHeatCharge(flame,()=>.49),true);
 assert.equal(addHeatCharge(flame,()=>.20),true);
 assert.equal(flame.heatCharges,2);
 assert.equal(addHeatCharge(flame,()=>0),false,'limite due cariche');
 const finisher=MOVES_DB['Fiamma Reale'],other=MOVES_DB['Pioggia di Braci'];
 assert.equal(consumeHeatBurst(flame,other),false);
 assert.equal(flame.heatCharges,2,'le altre mosse non consumano le cariche');
 assert.equal(consumeHeatBurst(flame,finisher),true);
 assert.equal(flame.heatCharges,0);
 assert.equal(flameMoveDamageFactor(flame,finisher,true),1.25);
 assert.equal(flameMoveDamageFactor(flame,other,true),1);
 assert.equal(flameMoveDamageFactor(flame,finisher,false),1);
 assert.equal(consumeHeatBurst(flame,finisher),false,'niente bonus con cariche insufficienti');
 assert.ok(flame.moves.every(m=>m.name),'nessuna mossa non registrata');
});

test('Le cariche e Gemma Imperfetta sono collegate ai veri turni e ripartono a ogni battaglia',()=>{
 const engine=readFileSync(new URL('../src/systems/battleSystem.js',import.meta.url),'utf8');
 const arena=readFileSync(new URL('../src/screens/battle/BattlingView.jsx',import.meta.url),'utf8');
 assert.match(engine,/setBattleStatGainObserver\(gemObserver\.onStatIncrease\)/);
 assert.match(engine,/setBattleStatGainObserver\(gemIntro\.onStatIncrease\)/);
 assert.match(engine,/gemObserver\.beginAction\(\)/);
 assert.match(engine,/finally \{ stopGemObserver\(\); \}/);
 assert.match(engine,/tryMagmaHeartBurn\(target,options.attacker,options.move\)/);
 assert.match(engine,/hpBeforeDamage>target\.hp && dmg>0 && options.directAttack && options.isEnemyTarget/);
 assert.match(engine,/flameMoveDamageFactor\(args\[0\],args\[2\],heatBurstActive\)/);
 assert.match(engine,/consumeHeatBurst\(attacker,move\)/);
 assert.match(engine,/attackSucceeded && addHeatCharge\(attacker\)/);
 assert.match(engine,/if\(char.id==='ametista'\)char.gemImperfectUsed=false/);
 assert.match(engine,/if\(char.id==='flameprincess'\)char.heatCharges=0/);
 assert.match(arena,/Cariche Calore:/);
 assert.match(arena,/Gemma Imperfetta:/);
});
