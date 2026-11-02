import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ITEMS_DB} from '../src/data/items.js';
import {MAX_BATTLE_STAT_MULTIPLIER} from '../src/systems/statBalance.js';
import {resolvePoisonEndTurn} from '../src/systems/battleStatusTurns.js';
import {
 reduceIncomingHeldDamage,useHeroSash,poisonDamageReduction,activateHourglass,
 boostedStatusChance,offensiveHeldFactor,recordOffensiveMove,markCompassOnHit,
 healSupportAlly,activateVictoryBoots,endVictoryBootsTurn,shortenNegativeStatus,
 reflectNegativeStatus,activatePhoenixFeather,endPhoenixFeatherTurn,activateRescueBell
} from '../src/systems/advancedHeldItems.js';

const approved=[
 ['fascia_eroe',450],['scudo_antielemento',320],['ciondolo_antiveleno',260],
 ['clessidra_rapidita',350],['lente_fortuna',300],['risonatore_elementale',360],
 ['nastro_solidarieta',330],['stivali_slancio',340],['bussola_predatore',380],
 ['specchio_maledizioni',420],['sigillo_liberta',280],['piuma_rinascita',290],
 ['campanella_soccorso',400]
];
const fighter=(heldItem,hp=100)=>({
 name:'Kirby',heldItem,hp,maxHp:100,atk:100,def:100,spd:100,
 baseAtk:100,baseDef:100,baseSpd:100,statuses:[]
});
test('13 oggetti approvati, prezzi corretti, #3 e #5 esclusi, sblocco permanente held',()=>{
 assert.equal(approved.length,13);
 for(const [id,price] of approved){
   assert.equal(ITEMS_DB[id]?.type,'held',id);
   assert.equal(ITEMS_DB[id]?.price,price,id);
   assert.ok(ITEMS_DB[id].desc,id);
 }
 assert.equal(ITEMS_DB['guanti_spinosi'],undefined);
 assert.equal(ITEMS_DB['corona_coraggio'],undefined);
 assert.match(ITEMS_DB['clessidra_rapidita'].desc,/fino alla fine della battaglia/i);
});
test('1 Fascia dell’Eroe: soltanto da salute massima, attacco diretto KO, una volta',()=>{
 const f=fighter('fascia_eroe');
 assert.equal(useHeroSash(f,90,{directAttack:true}),false);
 assert.equal(useHeroSash(f,140,{directAttack:false}),false);
 assert.equal(useHeroSash(f,140,{directAttack:true}),true);
 assert.equal(f.hp,1);
 f.hp=100;
 assert.equal(useHeroSash(f,140,{directAttack:true}),false);
 const damaged=fighter('fascia_eroe',80);
 assert.equal(useHeroSash(damaged,99,{directAttack:true}),false);
});
test('2 Scudo Antielemento 25% una sola volta e campanella 15% sul prossimo attacco',()=>{
 const f=fighter('scudo_antielemento');
 assert.equal(reduceIncomingHeldDamage(f,80,{directAttack:true,superEffective:false}).damage,80);
 assert.equal(reduceIncomingHeldDamage(f,80,{directAttack:true,superEffective:true}).damage,60);
 assert.equal(reduceIncomingHeldDamage(f,80,{directAttack:true,superEffective:true}).damage,80);
 const ally=fighter('',20),bell=fighter('campanella_soccorso');
 assert.equal(activateRescueBell([ally,bell],ally),bell);
 assert.equal(ally.bellShieldReady,true);
 assert.equal(reduceIncomingHeldDamage(ally,80,{directAttack:true}).damage,68);
 assert.equal(reduceIncomingHeldDamage(ally,80,{directAttack:true}).damage,80);
 assert.equal(activateRescueBell([ally,bell],ally),null);
});
test('4 Ciondolo Antiveleno 40% meno danno senza alterare la progressione',()=>{
 const u=fighter('ciondolo_antiveleno');
 assert.equal(poisonDamageReduction(u,15),9);
 assert.equal(poisonDamageReduction(fighter(''),15),15);
 u.statuses=[{type:'Avvelenato',turns:3}];
 const r=resolvePoisonEndTurn(u,n=>{u.hp-=n});
 assert.equal(r.damage,9);
 assert.equal(u.hp,91);
 assert.equal(u.statuses[0].turns,4);
});
test('6 Clessidra: velocità +20% permanente, non si accumula, limite +100%',()=>{
 const f=fighter('clessidra_rapidita',30);
 assert.equal(activateHourglass(f),false,'30% non è sotto 30%');
 f.hp=29;
 assert.equal(activateHourglass(f),true);
 assert.equal(f.spd,120);
 for(let turn=0;turn<10;turn++)assert.equal(activateHourglass(f),false);
 assert.equal(f.spd,120,'non scade dopo due turni');
 assert.equal(MAX_BATTLE_STAT_MULTIPLIER,2);
});
test('7 Lente: +10 punti percentuali, massimo 90%, una volta',()=>{
 const u=fighter('lente_fortuna');
 assert.equal(boostedStatusChance(u,1),1);
 assert.equal(boostedStatusChance(u,.2),.3);
 assert.equal(boostedStatusChance(u,.2),.2);
 const x=fighter('lente_fortuna');
 assert.equal(boostedStatusChance(x,.85),.9);
});
test('8 Risonatore: +12% se tipo offensivo cambia, mai cumulabile',()=>{
 const u=fighter('risonatore_elementale');
 const fire={power:80,type:'Fuoco'},water={power:85,type:'Acqua'},state={power:0,type:'Normale'};
 assert.equal(offensiveHeldFactor(u,fighter(''),fire),1);
 recordOffensiveMove(u,fire);
 assert.equal(offensiveHeldFactor(u,fighter(''),fire),1);
 assert.equal(offensiveHeldFactor(u,fighter(''),water),1.12);
 recordOffensiveMove(u,water);
 assert.equal(offensiveHeldFactor(u,fighter(''),water),1);
 recordOffensiveMove(u,state);
 assert.equal(u.lastOffensiveType,'Acqua');
});
test('9 Nastro: +8% PS alleato una volta, solo se potenziato davvero',()=>{
 const support=fighter('nastro_solidarieta'),ally=fighter('',50);
 assert.equal(healSupportAlly(support,ally,false),0);
 assert.equal(healSupportAlly(support,support,true),0);
 assert.equal(healSupportAlly(support,ally,true),8);
 assert.equal(ally.hp,58);
 assert.equal(healSupportAlly(support,ally,true),0);
});
test('10 Stivali: +15% per turno successivo senza intaccare buff concomitanti',()=>{
 const u=fighter('stivali_slancio');
 assert.equal(activateVictoryBoots(u),true);
 assert.equal(u.spd,115);
 assert.equal(endVictoryBootsTurn(u),false);
 assert.equal(u.spd,115);
 u.spd+=20; // Un altro aumento di velocità nel frattempo
 assert.equal(endVictoryBootsTurn(u),true);
 assert.equal(u.spd,120,'Si tolgono solo i 15 punti concessi dagli stivali');
 assert.equal(activateVictoryBoots(u),false);
});
test('11 Bussola: 15% sul primo colpo al bersaglio sotto il 40%',()=>{
 const u=fighter('bussola_predatore'),v=fighter('',39),move={type:'Lotta',power:100};
 assert.equal(offensiveHeldFactor(u,fighter('',40),move),1);
 assert.equal(offensiveHeldFactor(u,v,move),1.15);
 assert.equal(markCompassOnHit(u,v,39,0),false);
 assert.equal(markCompassOnHit(u,v,39,12),true);
 assert.equal(offensiveHeldFactor(u,v,move),1);
});
test('12 Specchio: 40% riflette uno status solo se è davvero ricevuto',()=>{
 const enemy=fighter(''),victim=fighter('specchio_maledizioni');
 assert.equal(reflectNegativeStatus(victim,enemy,{type:'Scottato',turns:3},()=>.5),false);
 assert.equal(reflectNegativeStatus(victim,enemy,{type:'Scottato',turns:3},()=>.3),true);
 assert.deepEqual(enemy.statuses,[{type:'Scottato',turns:3}]);
 assert.equal(reflectNegativeStatus(victim,enemy,{type:'Avvelenato',turns:4},()=>0),false);
 const immune=fighter('');
 immune.passive={immuneToNegativeStatuses:true};
 assert.equal(reflectNegativeStatus(fighter('specchio_maledizioni'),immune,{type:'Confuso',turns:3},()=>0),false);
});
test('13 Sigillo: -1 turno al primo status negativo temporaneo, minimo 1',()=>{
 const f=fighter('sigillo_liberta'),short={type:'Congelato',turns:1};
 assert.equal(shortenNegativeStatus(f,short),false);
 const status={type:'Addormentato',turns:4};
 assert.equal(shortenNegativeStatus(f,status),true);
 assert.equal(status.turns,3);
 assert.equal(shortenNegativeStatus(f,{type:'Scottato',turns:9}),false);
});
test('14 Piuma: +15% Difesa per due turni dopo revive, una volta',()=>{
 const f=fighter('piuma_rinascita');
 f.hp=0;assert.equal(activatePhoenixFeather(f),false);
 f.hp=50;assert.equal(activatePhoenixFeather(f),true);
 assert.equal(f.def,115);
 assert.equal(endPhoenixFeatherTurn(f),false);
 assert.equal(endPhoenixFeatherTurn(f),true);
 assert.equal(f.def,100);
 assert.equal(activatePhoenixFeather(f),false);
});
test('Motore classico e Torneo Multiverso con effetti reali, non solo catalogo',()=>{
 const a=readFileSync(new URL('../src/systems/battleSystem.js',import.meta.url),'utf8');
 const e=readFileSync(new URL('../src/systems/multiverseEventEngine.js',import.meta.url),'utf8');
 for(const name of ['useHeroSash','reduceIncomingHeldDamage','activateHourglass','markCompassOnHit','activateVictoryBoots','healSupportAlly','activatePhoenixFeather','shortenNegativeStatus','reflectNegativeStatus','activateRescueBell','endVictoryBootsTurn','boostedStatusChance','recordOffensiveMove'])
    assert.ok(a.includes(name),'Classic battle missing '+name);
 for(const name of ['useHeroSash','reduceIncomingHeldDamage','activateHourglass','markCompassOnHit','activateVictoryBoots','reflectNegativeStatus','activateRescueBell','boostedStatusChance','recordOffensiveMove'])
    assert.ok(e.includes(name),'Multiverse battle missing '+name);
});
