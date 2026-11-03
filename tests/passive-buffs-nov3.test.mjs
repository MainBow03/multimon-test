import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {MOVES_DB} from '../src/data/moves.js';
import {calculateDamageImpl} from '../src/systems/battleSystem.js';
import {outgoingPassiveDamageFactor} from '../src/systems/offensivePassives.js';
import {GAME_UPDATES} from '../src/data/updateHistory.js';
const byId=id=>CHARACTERS.find(c=>c.id===id);
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const fighter=(c,override={})=>({...c,baseAtk:c.atk,baseDef:c.def,baseSpd:c.spd,
  hp:c.hp,maxHp:c.maxHp,statuses:[],moves:c.moves.map(m=>({...m})),...override});
const attack=(a,d,m)=>calculateDamageImpl({},fighter(a),fighter(d),m,1,false,()=>0);

test('Zazan: Corazza Mutante si attiva al 40% PS e conserva il potenziamento',()=>{
 const p=byId('zazan').passive;
 assert.equal(p.name,'Corazza Mutante');
 assert.equal(p.type,'on_hp_threshold');
 assert.equal(p.threshold,0.4);
 assert.equal(p.statBuff.def,2);
 assert.equal(p.removeNegativeStatuses,true);
 assert.equal(p.maxUses,1);
 assert.match(p.desc,/40%/);
 const engine=read('src/systems/battleSystem.js');
 assert.match(engine, /target\.hp \/ target\.maxHp\) <= target\.passive\.threshold/);
});

test('Sage: Vandal è Cristallo, ha 80 potenza e conserva il 15% di stordimento',()=>{
 const sage=byId('sage'),v=MOVES_DB['Vandal'];
 assert.equal(v.type,'Cristallo');
 assert.equal(v.power,80);
 assert.equal(v.statusEffect.type,'Stordito');
 assert.equal(v.statusEffect.chance,0.15);
 assert.ok(sage.moves.some(m=>m.name==='Vandal'&&m.type==='Cristallo'));
 assert.ok(sage.types.includes('Cristallo'));
 const defender=fighter(byId('gaston'));
 const dmg=calculateDamageImpl({},fighter(sage),defender,v,1,false,()=>0);
 const noStab=calculateDamageImpl({},fighter(sage,{types:['Magico']}),defender,v,1,false,()=>0);
 assert.ok(dmg>noStab,'Vandal deve ricevere il bonus per tipo Cristallo di Sage');
});

test('Orso Bianco: Furia dell’Artico 140 potenza, 5 turni neve, una sola carica',()=>{
 const move=MOVES_DB['Furia dell’Artico'];
 assert.equal(move.power,140);
 assert.equal(move.maxUses,1);
 assert.equal(move.strictUses,true);
 assert.equal(move.targetCount,4);
 assert.equal(move.snowstormTurns,5);
 assert.ok(byId('orsobianco').moves.some(m=>m.name===move.name));
 const code=read('src/systems/battleSystem.js');
 const ui=read('src/screens/battle/BattlingView.jsx');
 assert.match(code,/move\.remainingUses -= 1/);
 assert.match(ui,/move\.remainingUses === 0/);
});

test('Crash Bandicoot: Extra Vita usa la meccanica di resurrezione una volta al 30%',()=>{
 const crash=byId('crash');
 const p=crash.passive;
 assert.equal(p.name,'Extra Vita');
 assert.equal(p.type,'on_faint');
 assert.equal(p.reviveHpPercent,0.3);
 assert.equal(p.maxUses,1);
 assert.equal(Math.floor(crash.maxHp*p.reviveHpPercent),27);
 const engine=read('src/systems/battleSystem.js');
 assert.match(engine,/target\.passive\.type === 'on_faint'/);
 assert.match(engine,/target\.passiveUses = \(target\.passiveUses \|\| 0\) \+ 1/);
 assert.match(engine,/target\.maxHp \* target\.passive\.reviveHpPercent/);
});

test('Gaston: 68 Velocità e +20% danni solo ai bersagli più lenti',()=>{
 const gaston=byId('gaston');
 assert.equal(gaston.spd,68);
 assert.equal(gaston.passive.name,'Cacciatore Esperto');
 assert.equal(gaston.passive.type,'expert_hunter');
 assert.equal(gaston.passive.damageBonus,1.2);
 const move=MOVES_DB['Fucile da Caccia'];
 const slow=fighter(byId('luigi'),{spd:50});
 const equal=fighter(byId('luigi'),{spd:68});
 const fast=fighter(byId('luigi'),{spd:110});
 assert.equal(outgoingPassiveDamageFactor(fighter(gaston),slow,move),1.2);
 assert.equal(outgoingPassiveDamageFactor(fighter(gaston),equal,move),1);
 assert.equal(outgoingPassiveDamageFactor(fighter(gaston),fast,move),1);
 const normal=fighter(gaston,{passive:null});
 const boosted=calculateDamageImpl({},fighter(gaston),slow,move,1,false,()=>0);
 const base=calculateDamageImpl({},normal,slow,move,1,false,()=>0);
 assert.ok(boosted>base,'La passiva deve modificare i danni effettivi');
 const unboosted=calculateDamageImpl({},fighter(gaston),equal,move,1,false,()=>0);
 const equalBase=calculateDamageImpl({},normal,equal,move,1,false,()=>0);
 assert.equal(unboosted,equalBase);
});

test('Luigi: Acchiappafantasmi +25% danni ai tipi Spettro, anche secondari',()=>{
 const luigi=byId('luigi');
 assert.equal(luigi.passive.name,'Acchiappafantasmi');
 assert.equal(luigi.passive.type,'ghostbuster');
 assert.equal(luigi.passive.damageBonus,1.25);
 const move=MOVES_DB['Poltergust 3000'];
 const ghost=fighter(byId('dannyphantom'));
 const dual=fighter(byId('marceline'));
 const nonGhost=fighter(byId('gaston'));
 assert.equal(outgoingPassiveDamageFactor(fighter(luigi),ghost,move),1.25);
 assert.equal(outgoingPassiveDamageFactor(fighter(luigi),dual,move),1.25);
 assert.equal(outgoingPassiveDamageFactor(fighter(luigi),nonGhost,move),1);
 const basic=fighter(luigi,{passive:null});
 assert.ok(calculateDamageImpl({},fighter(luigi),ghost,move,1,false,()=>0)>
   calculateDamageImpl({},basic,ghost,move,1,false,()=>0));
 assert.equal(calculateDamageImpl({},fighter(luigi),nonGhost,move,1,false,()=>0),
   calculateDamageImpl({},basic,nonGhost,move,1,false,()=>0));
});

test('Mecha Johnny Test e Bulma si curano del 5% a fine turno',()=>{
 for(const [id,name] of [['mechajohnny','Reattore Nucleare'],['bulma','Rifornimento Capsule Corp.']]){
   const p=byId(id).passive;
   assert.equal(p.name,name);
   assert.equal(p.type,'on_turn_end');
   assert.equal(p.healPercent,0.05);
   assert.ok(p.desc.includes('5%'));
 }
 const engine=read('src/systems/battleSystem.js');
 assert.match(engine,/char\.passive\.type === 'on_turn_end'/);
 assert.match(engine,/Math\.floor\(char\.maxHp \* hPercent\)/);
 assert.match(engine,/Math\.min\(char\.maxHp, char\.hp \+ healAmount\)/);
});

test('Nuove passive di danno ignorano mosse non offensive e rispettano statistiche attuali',()=>{
 const gaston=fighter(byId('gaston'));
 const slower=fighter(byId('zazan'),{spd:55});
 assert.equal(outgoingPassiveDamageFactor(gaston,slower,{power:0,type:'Normale'}),1);
 assert.equal(outgoingPassiveDamageFactor(gaston,slower,null),1);
 assert.equal(outgoingPassiveDamageFactor({...gaston,spd:40},slower,{power:80}),1);
 assert.equal(outgoingPassiveDamageFactor({...gaston,spd:60},slower,{power:80}),1.2);
 const engine=read('src/systems/battleSystem.js');
 assert.match(engine,/outgoingPassiveDamageFactor\(attacker,defender,move\)/);
});

test('Registro aggiornamenti: nuove note per ogni buff senza dimenticare le precedenti',()=>{
 const recent=GAME_UPDATES.slice(2,4);
 assert.deepEqual(recent.map(s=>s.id),[
   'nov3-zazan-sage-arctic-move-balance','nov3-four-new-passives-bulma'
 ]);
 assert.ok(recent.every(x=>x.date==='03/11/2026'));
 const text=recent.flatMap(s=>s.items).join(' ');
 for(const word of ['Zazan','Sage','Vandal','Cristallo','Orso Bianco','Crash Bandicoot','30%',
  'Gaston','68','Luigi','Mecha Johnny Test','Bulma','5%']){
    assert.ok(text.includes(word),word+' non compare nel Registro aggiornamenti');
 }
 assert.ok(GAME_UPDATES.some(x=>x.id==='nov3-juvia-rainstorm'));
});
