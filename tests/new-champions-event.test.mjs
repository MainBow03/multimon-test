import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTERS } from '../src/data/characters.js';
import { MOVES_DB } from '../src/data/moves.js';
import { eventTurn, normalizeEventSettings } from '../src/systems/multiverseEventEngine.js';
const chars=Object.fromEntries(CHARACTERS.map(c=>[c.id,c]));
const unit=(id,owner,moves)=>{
 const c=chars[id];
 return {id,owner,key:owner+'-'+id,name:c.name,types:c.types,maxHp:c.maxHp,hp:c.maxHp,
  atk:c.atk,def:c.def,baseDef:c.def,spDef:c.spDef||c.def,baseSpDef:c.spDef||c.def,
  spAtk:c.spAtk||c.atk,spd:c.spd,passive:c.passive||null,heldItem:null,statuses:[],hyper:false,
  moves:moves.map(name=>{const m=MOVES_DB[name];return {name:m.name,type:m.type,power:m.power||0,
    accuracy:m.accuracy??1,uses:m.maxUses??null,contact:!!m.contact,
    targetCount:m.targetCount||1,special:!!m.special,buff:m.selfStatBuff||m.statBuff||null,
    heal:m.heal||0,effect:m.statusEffect||null,enemyDebuff:m.targetStatDebuff||null,
    snowstormTurns:m.snowstormTurns||0,evasionGain:m.evasionGain||0,
    crystalShieldPercent:m.crystalShieldPercent||0,refractionTurns:m.refractionTurns||0,
    bonusAgainstFaster:m.bonusAgainstFaster||0};})};
};
const battle=(sideA,sideB,fieldSize=1)=>({
 matchId:'test',side:'A',turn:1,teams:{A:sideA,B:sideB},
 owners:{A:['p1'],B:['p2']},weather:null,hyperUsed:{},finished:false,winner:null,log:[]
});
const settings=normalizeEventSettings({entrants:4,teamSize:4,fieldSize:2});
test('Evento: la tempesta parte da 5 turni e danneggia solo chi non è immune',()=>{
 const ice=unit('orsobianco','p1',['Furia dell’Artico']);ice.hp=50;
 const opponent=unit('bugsbunny','p2',['Carota Esplosiva']);opponent.hp=100;
 opponent.def=500;opponent.maxHp=500;
 const b=battle([ice],[opponent]);
 const x=eventTurn(b,{p1:[{actor:ice.key,moveIndex:0,target:opponent.key}]},settings,()=>0.5);
 assert.equal(x.weather?.turns,4);
 assert.ok(x.teams.A[0].hp>50,'Orso deve recuperare PS sotto la neve');
 assert.ok(x.teams.B[0].hp<100,'L’avversario subisce gli attacchi e la neve');
 assert.ok(x.log.some(t=>t.includes('tempesta di neve')));
});
test('Evento: Bugs può usare Dentro la Tana e accumula elusione',()=>{
 const bugs=unit('bugsbunny','p1',['Dentro la Tana']);bugs.passive=null;
 const target=unit('daffyduck','p2',['Pistola ad Acqua']);
 const x=eventTurn(battle([bugs],[target]),{p1:[{actor:bugs.key,moveIndex:0,target:target.key}]},settings,()=>.7);
 assert.equal(x.teams.A[0].evasionBonus,.2);
 assert.equal(x.teams.A[0].moves[0].uses,1);
});
test('Evento: Daffy riceve salute e +10% ATK quando un alleato elimina il nemico',()=>{
 const ally=unit('superboy','p1',['Impatto Kryptoniano']);
 const daffy=unit('daffyduck','p1',['Montante di Daffy']);daffy.hp=30;
 const victim=unit('bugsbunny','p2',['Carota Esplosiva']);victim.hp=1;
 const x=eventTurn(battle([ally,daffy],[victim],2),
  {p1:[{actor:ally.key,moveIndex:0,target:victim.key}]},settings,()=>.4);
 assert.equal(x.teams.B[0].hp,0);
 assert.ok(x.teams.A[1].hp>30,'Daffy deve recuperare PS dal KO causato dall’alleato');
 assert.ok(x.teams.A[1].atk>daffy.atk,'Daffy deve avere attacco aumentato');
});
test('Evento: Raggio Solare applica Accecato, il bersaglio ha precisione ridotta',()=>{
 const superboy=unit('superboy','p1',['Raggio Solare']);
 const defender=unit('orsobianco','p2',['Carica Valanga']);
 defender.hp=900;defender.maxHp=900;defender.def=800;
 const x=eventTurn(battle([superboy],[defender]),
  {p1:[{actor:superboy.key,moveIndex:0,target:defender.key}]},settings,()=>.1);
 assert.equal(x.finished,false);
 assert.ok(x.teams.B[0].statuses.includes('Accecato'));
 const y=eventTurn(x,{p2:[{actor:defender.key,moveIndex:0,target:superboy.key}]},settings,()=>.85);
 assert.ok(y.log.some(s=>s.includes('manca')),'Accecato deve ridurre la precisione');
});
test('Evento: Superboy aumenta attacco/velocità una sola volta sotto il 25% PS',()=>{
 const attacker=unit('orsobianco','p1',['Carica Valanga']);
 const superboy=unit('superboy','p2',['Raggio Solare']);
 superboy.hp=25;superboy.maxHp=115;superboy.def=600;
 const initialAtk=superboy.atk;
 const x=eventTurn(battle([attacker],[superboy]),
  {p1:[{actor:attacker.key,moveIndex:0,target:superboy.key}]},settings,()=>.1);
 assert.equal(x.teams.B[0].passiveUsed,true);
 assert.ok(x.teams.B[0].atk>initialAtk);
});
