import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  ROGUELIKE_BOSS_STATS_MULTIPLIER, ROGUELIKE_BOSS_SHIELD_HITS,
  ROGUELIKE_BOSS_SHIELD_THRESHOLDS,
  empowerRoguelikeBoss, activateRoguelikeBossShield
} from '../src/systems/roguelikeBossPower.js';
import {consumeRaidShieldHit} from '../src/systems/finalRaidBalance.js';
import {coopEnemyForFloor,coopEnemyTeamForFloor} from '../src/systems/coopExpedition.js';

const base={
  id:'boss', name:'Boss', maxHp:100, hp:100, atk:100, def:100,
  spd:100, spAtk:100, spDef:100, types:['Normale'], moves:[{
    name:'Colpo',type:'Normale',power:70,accuracy:1
  }]
};

test('Ogni boss riceve esattamente +5% PS, Attacco, Difesa, Velocità e statistiche speciali',()=>{
 const b=structuredClone(base);
 const result=empowerRoguelikeBoss(b);
 assert.equal(result,b);
 assert.equal(ROGUELIKE_BOSS_STATS_MULTIPLIER,1.05);
 for (const stat of ['maxHp','hp','atk','def','spd','spAtk','spDef']) assert.equal(b[stat],105,stat);
 for (const stat of ['baseAtk','baseDef','baseSpd','baseSpAtk','baseSpDef']) assert.equal(b[stat],105,stat);
 assert.deepEqual(b.juggShieldHpThresholds,[0.5,0.25]);
 assert.equal(b.shieldGrantedHits,3);
 assert.equal(b.juggHitsRemaining,0);
 assert.equal(b.isRoguelikeBoss,true);
 empowerRoguelikeBoss(b);
 assert.equal(b.maxHp,105,'non applicare due volte il bonus');
});

test('Il potenziamento rispetta la percentuale di PS già presente',()=>{
 const b={...structuredClone(base),hp:42};
 empowerRoguelikeBoss(b);
 assert.equal(b.hp,44);
});

test('Il primo scudo si attiva sotto 50%, il secondo sotto 25%, una sola volta ciascuno',()=>{
 const b=empowerRoguelikeBoss(structuredClone(base));
 assert.deepEqual([...ROGUELIKE_BOSS_SHIELD_THRESHOLDS],[.50,.25]);
 assert.equal(activateRoguelikeBossShield(b,53),null);
 const first=activateRoguelikeBossShield(b,52);
 assert.deepEqual(first,{hits:3,thresholdPercent:50});
 assert.equal(activateRoguelikeBossShield(b,20),null,'non ricaricare uno scudo già attivo');
 assert.equal(b.juggShieldHpThresholds.length,1,'la soglia 25% rimane');
 const hits=Array.from({length:3},()=>consumeRaidShieldHit(b));
 assert.deepEqual(hits.map(h=>h.remaining),[2,1,0]);
 assert.equal(hits[2].broken,true);
 assert.equal(activateRoguelikeBossShield(b,27),null,'sopra 25% niente scudo');
 const second=activateRoguelikeBossShield(b,26);
 assert.deepEqual(second,{hits:3,thresholdPercent:25});
 assert.deepEqual(b.juggShieldHpThresholds,[]);
 for(let i=0;i<3;i++)consumeRaidShieldHit(b);
 assert.equal(activateRoguelikeBossShield(b,2),null,'mai un terzo scudo');
});

test('Un grosso colpo che supera 50% e 25% non consuma entrambe le soglie',()=>{
 const b=empowerRoguelikeBoss(structuredClone(base));
 assert.equal(activateRoguelikeBossShield(b,10).thresholdPercent,50);
 assert.deepEqual(b.juggShieldHpThresholds,[.25]);
 for(let i=0;i<3;i++)consumeRaidShieldHit(b);
 b.hp=10;
 assert.equal(activateRoguelikeBossShield(b,5).thresholdPercent,25);
 assert.deepEqual(b.juggShieldHpThresholds,[]);
});

test('Boss KO e scudi ancora attivi non ricreano cariche',()=>{
 const b=empowerRoguelikeBoss(structuredClone(base));
 assert.equal(activateRoguelikeBossShield(b,0),null);
 b.hp=0;
 assert.equal(activateRoguelikeBossShield(b,20),null);
 const normal=structuredClone(base);
 assert.equal(activateRoguelikeBossShield(normal,20),null);
});

test('Co-op: soltanto i boss dei piani 10, 20, 30, 40, 50 ricevono gli scudi',()=>{
 const roster=[base,{...base,id:'altro',name:'Altro'}];
 for(const floor of [1,5,9,11,19,21,35,49]){
   const group=coopEnemyTeamForFloor(floor,roster,3,[],()=>0);
   assert.ok(group.every(e=>!e.isRoguelikeBoss && !e.juggShieldHpThresholds),'piano '+floor);
 }
 for(const floor of [10,20,30,40,50]){
   const enemy=coopEnemyForFloor(floor,roster,3,[],()=>0);
   assert.equal(enemy.isCoopBoss,true);
   assert.equal(enemy.isRoguelikeBoss,true,'piano '+floor);
   assert.equal(enemy.shieldGrantedHits,ROGUELIKE_BOSS_SHIELD_HITS);
   assert.deepEqual(enemy.juggShieldHpThresholds,[.5,.25]);
   assert.equal(coopEnemyTeamForFloor(floor,roster,3,[],()=>0).length,1);
 }
});

test('Il gioco singolo abilita gli scudi solo sui boss e riutilizza il motore multicolpo',()=>{
 const map=readFileSync(new URL('../src/screens/roguelike/RoguelikeMapView.jsx',import.meta.url),'utf8');
 const battle=readFileSync(new URL('../src/systems/battleSystem.js',import.meta.url),'utf8');
 const ui=readFileSync(new URL('../src/screens/battle/BattlingView.jsx',import.meta.url),'utf8');
 assert.match(map,/if \(isBossFloor\) empowerRoguelikeBoss\(e\)/);
 assert.match(battle,/activateRoguelikeBossShield\(target, target\.hp\)/);
 assert.match(battle,/activateRoguelikeBossShield\(t\.char, t\.char\.hp - totalDmg\)/);
 assert.match(battle,/if \(!t\.char\.isRoguelikeBoss\)/);
 assert.match(battle,/consumeRaidShieldHit\(t\.char\)/);
 assert.match(ui,/char\.isRoguelikeBoss/);
});

test('La barriera del raid campagna rimane diversa (6 colpi)',()=>{
 const campaign=readFileSync(new URL('../src/systems/finalRaidBalance.js',import.meta.url),'utf8');
 assert.match(campaign,/shieldHits: 6/);
 assert.equal(ROGUELIKE_BOSS_SHIELD_HITS,3);
});
