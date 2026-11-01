import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CHARACTERS } from '../src/data/characters.js';
import { MOVES_DB } from '../src/data/moves.js';
import { CHAR_PRICES } from '../src/data/prices.js';
import { calculateDamageImpl } from '../src/systems/battleSystem.js';
import { ignoresShields, immuneToStatDrops, powerForAccordo, effectiveTaserPower,
  incomingRockEnchantmentFactor, affectedOpponents, addStickyTrap, trapEntries,
  stickyTrapEntryDamage } from '../src/systems/rockstarAgentEffects.js';
import { normalizeEventSettings, buildEventBattle, eventTurn } from '../src/systems/multiverseEventEngine.js';

const chars=Object.fromEntries(CHARACTERS.map(c=>[c.id,c]));
const createUnit=(id,owner,names)=>{
 const c=chars[id];
 return {key:owner+'-'+id,id,owner,name:c.name,img:c.img,types:c.types,
   hp:c.hp,maxHp:c.maxHp,atk:c.atk,def:c.def,baseDef:c.def,spd:c.spd,baseSpd:c.spd,spAtk:c.spAtk||c.atk,
   passive:c.passive||null,heldItem:null,hyper:false,statuses:[],
   moves:names.map(n=>{const m=MOVES_DB[n];return {
     name:m.name,type:m.type,power:m.power||0,accuracy:m.accuracy??1,
     uses:m.maxUses??null,targetCount:m.targetCount||1,priority:m.priority||0,
     effect:m.statusEffect||null,buff:m.selfStatBuff||m.statBuff||null,
     ignoreShields:!!m.ignoreShields,ignoreTaunt:!!m.ignoreTaunt,
     placeStickyTrap:!!m.placeStickyTrap,scalingEnemyCount:!!m.scalingEnemyCount,
     bonusIfSlowed:m.bonusIfSlowed||0,enemyDebuff:m.targetStatDebuff||null
   }})
 };
};
const battle=(allA,allB)=>({matchId:'new-champs',side:'A',turn:1,
 teams:{A:allA,B:allB},owners:{A:['a'],B:['b']},hyperUsed:{},
 weather:null,traps:{},finished:false,winner:null,log:[]});
const settings=normalizeEventSettings({entrants:4,teamSize:4,fieldSize:1});

test('Ember e Kitty: scheda, sprite e prezzi nello shop',()=>{
 const ember=chars.embermclain,kitty=chars.kitty;
 assert.ok(ember);assert.ok(kitty);
 assert.deepEqual(ember.types,['Spettro','Suono']);
 assert.deepEqual(kitty.types,['Folletto','Buio']);
 assert.equal(ember.passive.type,'ghost_rockstar');
 assert.equal(kitty.passive.type,'undercover_agent');
 assert.equal(ember.img,'https://i.pinimg.com/1200x/ad/c8/cc/adc8cccaee66fa6a65a4f2bea2534c49.jpg');
 assert.equal(kitty.img,'https://i.pinimg.com/736x/ba/be/cf/babecf95179ccc3a2290209d92e539b5.jpg');
 for(const id of ['embermclain','kitty']){
   assert.equal(chars[id].moves.length,4);
   assert.equal(chars[id].price,CHAR_PRICES[id]);
 }
});
test('Ember: mosse Suono più forti del 25%, scudi ignorati, incanto -25%',()=>{
 const ember={...chars.embermclain,statuses:[]};
 const target={...chars.diamante,statuses:[{type:'Scudo Team'}],hp:100};
 const m=MOVES_DB['Assolo Spettrale'];
 const ordinary={...ember,passive:null};
 const boosted=calculateDamageImpl({},ember,target,m,1,false,()=>.5);
 const base=calculateDamageImpl({},ordinary,target,m,1,false,()=>.5);
 assert.ok(boosted>base*3,'Rockstar bypassa anche la protezione dello scudo del team');
 assert.equal(ignoresShields(ember,m),true);
 assert.equal(ignoresShields(ordinary,m),false);
 const enchanted={...ordinary,statuses:[{type:'Incantato',turns:10}]};
 const plain=calculateDamageImpl({},ordinary,{...target,statuses:[]},MOVES_DB['Onda Fantasma'],1,false,()=>.5);
 const weak=calculateDamageImpl({},enchanted,{...target,statuses:[]},MOVES_DB['Onda Fantasma'],1,false,()=>.5);
 assert.ok(weak<plain);
 assert.equal(incomingRockEnchantmentFactor(enchanted),.75);
 assert.equal(MOVES_DB['Ipnosi Rock'].statusEffect.turns,10);
 assert.equal(MOVES_DB['Ipnosi Rock'].statusEffect.chance,.5);
});
test('Accordo Distruttivo 60/80/100/120 in funzione degli avversari',()=>{
 assert.deepEqual([1,2,3,4,5].map(powerForAccordo),[60,80,100,120,120]);
 assert.equal(MOVES_DB['Accordo Distruttivo'].accuracy,.8);
});
test('Kitty: priorità, scudi ignorati, Taser condizionale e trappole',()=>{
 assert.equal(MOVES_DB['Passo Felino'].priority,1);
 assert.equal(ignoresShields(chars.kitty,MOVES_DB['Infiltrazione']),true);
 assert.equal(MOVES_DB['Infiltrazione'].ignoreTaunt,true);
 assert.equal(MOVES_DB['Taser T.U.F.F.'].statusEffect.chance,.3);
 assert.equal(effectiveTaserPower({spd:100,baseSpd:100,statuses:[]}),80);
 assert.equal(effectiveTaserPower({spd:70,baseSpd:100,statuses:[]}),120);
 assert.equal(effectiveTaserPower({spd:100,baseSpd:100,statuses:[{type:'Elettrizzato'}]}),120);
 assert.equal(immuneToStatDrops(chars.kitty),true);
 const traps={},seen={},field={p1:[0],p2:[1]};
 addStickyTrap(traps,seen,['p2'],field);
 assert.deepEqual(trapEntries(traps,seen,field),[]);
 assert.deepEqual(trapEntries(traps,seen,{p1:[0],p2:[1,2]}),[{player:'p2',idx:2}]);
 assert.equal(stickyTrapEntryDamage({hp:90,maxHp:105}),10);
});
test('Evento: Assolo Spettrale ignora lo scudo di Diamante',()=>{
 const ember=createUnit('embermclain','a',['Assolo Spettrale']);
 const diamante=createUnit('diamante','b',['Schegge Diamantine']);
 diamante.crystalShieldHp=25;
 const x=eventTurn(battle([ember],[diamante]),{a:[{actor:ember.key,moveIndex:0,target:diamante.key}]},settings,()=>.9);
 assert.equal(x.teams.B[0].crystalShieldHp,25,'Lo scudo deve rimanere intatto');
 assert.ok(x.teams.B[0].hp<diamante.hp,'Ember deve colpire direttamente i PS');
});
test('Evento: Ipnosi Rock applica Incantato per 10 turni',()=>{
 const ember=createUnit('embermclain','a',['Ipnosi Rock']);
 const enemy=createUnit('kitty','b',['Passo Felino']);
 const x=eventTurn(battle([ember],[enemy]),{a:[{actor:ember.key,moveIndex:0,target:enemy.key}]},settings,()=>.2);
 assert.equal(x.teams.B[0].enchantedTurns,10);
 assert.ok(x.teams.B[0].statuses.includes('Incantato'));
});
test('Evento: Kitty dispone una trappola e colpisce SOLO il successivo entrante',()=>{
 const kitty=createUnit('kitty','a',['Trappola Segreta']);
 const first=createUnit('superboy','b',['Pugno Tattico']);
 const second=createUnit('daffyduck','b',['Pistola ad Acqua']);
 const initial=battle([kitty],[first,second]);
 const x=eventTurn(initial,{a:[{actor:kitty.key,moveIndex:0,target:first.key}]},settings,()=>.7);
 assert.ok(x.traps.B);
 assert.equal(x.teams.B[0].hp,first.hp,'Il primo personaggio è già in campo e non perde PS');
 x.teams.B[0].hp=0;
 const y=eventTurn(x,{},settings,()=>.7);
 assert.equal(y.teams.B[1].hp,second.hp-stickyTrapEntryDamage(second));
});
test('Controlli account non coprono il pulsante Torna al Menu',()=>{
 const c=readFileSync(new URL('../src/components/AccountGate.jsx',import.meta.url),'utf8');
 assert.ok(c.includes('fixed bottom-3 left-3'));
 assert.ok(!c.includes('fixed top-4 left-4 z-[250]'));
 assert.ok(c.includes('setControlsExpanded'));
});
