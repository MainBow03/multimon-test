import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {MOVES_DB} from '../src/data/moves.js';
import {GAME_UPDATES} from '../src/data/updateHistory.js';
import {FIRST_CAMPAIGN_FINAL_RAID} from '../src/systems/finalRaidBalance.js';
const hero=id=>{const c=CHARACTERS.find(c=>c.id===id);assert.ok(c,id+' missing');return c};
const file=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('Trigon: 150 PS, 125 Attacco, Inferno demoniaco 30% scottatura; raid fixed HP remains',()=>{
  const t=hero('trigon'), move=MOVES_DB['Inferno demoniaco'];
  assert.deepEqual([t.hp,t.maxHp,t.atk],[150,150,125]);
  assert.equal(move.power,100);
  assert.equal(move.targetCount,4);
  assert.equal(move.statusEffect.type,'Scottato');
  assert.equal(move.statusEffect.chance,.3);
  assert.ok(t.moves.some(x=>x.name===move.name));
  assert.equal(FIRST_CAMPAIGN_FINAL_RAID.trigon.maxHp,3375);
});

test('Soundwave: Jammer di Frequenza area -20% Attacco e Velocità, tre usi',()=>{
  const m=MOVES_DB['Jammer di Frequenza'];
  assert.deepEqual(m.targetStatDebuff,{atk:.8,spd:.8});
  assert.equal(m.targetCount,4);
  assert.equal(m.maxUses,3);
  assert.equal(m.strictUses,true,'Il limite deve sopravvivere alla normalizzazione generale delle mosse');
  assert.ok(hero('soundwave').moves.some(x=>x.name===m.name&&x.maxUses===3));
  const battle=file('src/systems/battleSystem.js');
  const battleUI=file('src/screens/battle/BattlingView.jsx');
  assert.match(battle,/move\.remainingUses -= 1/);
  assert.match(battleUI,/move\.remainingUses === 0/);
});

test('Shifu: Saggezza di Oogway resta di supporto e concede cura 30% e bonus 30%',()=>{
  const m=MOVES_DB['Saggezza di Oogway'];
  assert.equal(m.targetMode,'ally');
  assert.equal(m.power,0);
  assert.equal(m.heal,.3);
  assert.deepEqual(m.targetStatBuff,{atk:1.3,def:1.3});
  assert.ok(hero('shifu').moves.some(x=>x.name===m.name));
});

test('Roxy: soltanto La Preferita al 25%, passiva invariata al 20%',()=>{
  const r=hero('roxy'),m=MOVES_DB['La Preferita'];
  assert.deepEqual(m.statBuff,{atk:1.25,spd:1.25});
  assert.equal(m.target,'self');
  assert.equal(r.passive.type,'first_strike_bonus');
  assert.equal(r.passive.damageBonus,1.20);
  assert.deepEqual([r.hp,r.atk,r.def,r.spd],[95,115,80,125]);
});

test('Megamind: PRESENTAZIONE! -15% Difesa e Velocità, massimo una attivazione',()=>{
  const m=hero('megamind').passive;
  assert.equal(m.name,'PRESENTAZIONE!');
  assert.equal(m.type,'on_enter');
  assert.equal(m.maxUses,1);
  assert.deepEqual(m.enemyStatDebuff,{def:.85,spd:.85});
});

test('Ban: solo Attacco 115→104; cura e salute intatte',()=>{
  const b=hero('ban');
  assert.deepEqual([b.hp,b.maxHp,b.atk,b.def,b.spd],[130,130,104,80,110]);
  assert.equal(b.passive.name,'Fonte della Giovinezza');
  assert.deepEqual(b.passive.healPercentRandom,{min:.03,max:.05});
});

test('Shinobu: Leggerezza Piumata +15% mentre il veleno resta 80%',()=>{
  const s=hero('shinobu');
  assert.equal(s.passive.type,'first_strike_bonus');
  assert.equal(s.passive.damageBonus,1.15);
  assert.deepEqual([s.hp,s.atk,s.def,s.spd],[85,120,65,135]);
  const m=MOVES_DB['Estrazione del Veleno'];
  assert.equal(m.statusEffect.type,'Avvelenato');
  assert.equal(m.statusEffect.chance,.8);
});

test('Sasuke: Susanoo +70% Difesa e Amaterasu scotta con il 75%',()=>{
  const s=hero('sasuke');
  assert.equal(s.passive.type,'on_hp_threshold');
  assert.equal(s.passive.threshold,.3);
  assert.deepEqual(s.passive.statBuff,{def:1.7});
  const m=MOVES_DB['Amaterasu'];
  assert.equal(m.power,120);
  assert.equal(m.statusEffect.type,'Scottato');
  assert.equal(m.statusEffect.chance,.75);
  assert.equal(m.recharge,true);
  assert.equal(m.ignoreDefBuffs,true);
});

test('Godzilla: Ruggito del Re solo 2 usi e -20%; Colpo di Coda è Drago e colpisce 2 bersagli',()=>{
  const g=hero('godzilla');
  const roar=MOVES_DB['Ruggito del Re'];
  const tail=MOVES_DB['Colpo di Coda'];
  assert.equal(roar.targetCount,4);
  assert.deepEqual(roar.targetStatDebuff,{atk:.8,spd:.8});
  assert.equal(roar.maxUses,2);
  assert.equal(roar.strictUses,true,'Solo due utilizzi, senza espansione automatica a cinque');
  assert.equal(roar.statusEffect.chance,.2);
  assert.equal(tail.type,'Drago');
  assert.equal(tail.power,85);
  assert.equal(tail.targetCount,2);
  assert.ok(g.types.includes('Drago'));
  assert.ok(g.moves.some(x=>x.name===tail.name&&x.type==='Drago'));
  assert.ok(g.moves.some(x=>x.name===roar.name&&x.maxUses===2));
});

test('Nicole rimane completamente esclusa dai nuovi nerf',()=>{
  const n=hero('nicole');
  assert.deepEqual([n.hp,n.maxHp,n.atk,n.def,n.spd],[110,110,125,85,115]);
  assert.equal(n.passive.name,'Mamma Demoniaca');
  assert.equal(n.passive.maxUses,1);
  assert.deepEqual(n.passive.enemyStatDebuff,{atk:.8});
});

test('Registro aggiornamenti documenta tutti e nove i nerf e Nicole invariata',()=>{
  const history=GAME_UPDATES.find(s=>s.id==='nov3-second-nerf-wave');
  assert.equal(history.id,'nov3-second-nerf-wave');
  assert.equal(history.category,'balance');
  assert.equal(history.date,'03/11/2026');
  assert.ok(history.items.length>=10);
  const joined=history.items.join(' ');
  for(const term of ['Trigon','Soundwave','Shifu','Roxy','Megamind','Ban','Shinobu','Sasuke','Godzilla','Nicole',
    'Colpo di Coda','Drago','125','150','104','30%','25%','75%']){
    assert.ok(joined.includes(term),'Registro: manca '+term);
  }
  assert.ok(GAME_UPDATES.find(x=>x.id==='nov3-ten-nerfs'));
});
