import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CHARACTERS } from '../src/data/characters.js';
import { MOVES_DB } from '../src/data/moves.js';
import { GAME_UPDATES } from '../src/data/updateHistory.js';
import { applyPerfezioneBonus, firstHitProtectionFactor } from '../src/systems/nerfPassives.js';
import { calculateDamageImpl } from '../src/systems/battleSystem.js';

const byId = id => {
  const c = CHARACTERS.find(x=>x.id===id);
  assert.ok(c,id+' non trovato');
  return c;
};
const source=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const fighter=(base,overrides={})=>({
 ...base,baseAtk:base.atk,baseDef:base.def,baseSpd:base.spd,
 statuses:[],hp:base.hp,maxHp:base.maxHp,...overrides
});

test('Zeno mantiene le quattro mosse ma ha statistiche bilanciate',()=>{
 const z=byId('zeno');
 assert.deepEqual([z.hp,z.maxHp,z.atk,z.def,z.spd],[200,200,170,130,130]);
 assert.deepEqual(z.moves.map(m=>m.name),['Cancellazione','Giochiamo!','Sguardo Onnipotente','Stato Avatar']);
 assert.equal(z.isSecretUnlock,true);
});

test('Sguardo Onnipotente: 75 potenza, fino a due bersagli, due usi e riduzioni conservate',()=>{
 const m=MOVES_DB['Sguardo Onnipotente'];
 assert.equal(m.power,75);
 assert.equal(m.type,'Psico');
 assert.equal(m.targetCount,2);
 assert.equal(m.maxUses,2);
 assert.deepEqual(m.targetStatDebuff,{atk:0.5,def:0.5,spd:0.5});
 assert.match(m.desc,/due bersagli/i);
 assert.match(source('src/screens/battle/BattlingView.jsx'),/availableMoves\[targetingMoveIdx\]\.targetCount > 1 && availableMoves\[targetingMoveIdx\]\.targetCount < 4/);
 const battle=source('src/systems/battleSystem.js');
 assert.match(battle,/const neededTargets = Math\.min\(targetCount, aliveEnemies\)/);
 assert.match(battle,/move\.remainingUses -= 1/);
 // Da 0 a 75 di potenza deve fare realmente più danno, non solo cambiare la descrizione.
 const defender=fighter(byId('luigi'));
 const zeno=fighter(byId('zeno'));
 const damage=calculateDamageImpl({},zeno,defender,m,1,false,()=>.5);
 assert.ok(damage>0);
});

test('Discord, Gaster e Cell: nerf a statistiche e passive',()=>{
 const d=byId('discord');
 assert.deepEqual([d.hp,d.atk,d.def,d.spd],[155,120,100,110]);
 const g=byId('gaster');
 assert.equal(g.spd,130);
 assert.equal(g.passive.type,'first_strike_bonus');
 assert.equal(g.passive.damageBonus,1.15);
 const c=byId('cell');
 assert.equal(c.passive.enemyStatDebuff.atk,0.8);
 assert.equal(c.passive.maxUses,2);
});

test('Ainz, Peridot, Meliodas: passive ridotte ma conservate',()=>{
 const ainz=byId('ainz');
 assert.deepEqual(ainz.passive.enemyStatDebuff,{atk:.85,spd:.85});
 const peridot=byId('peridot');
 assert.deepEqual(peridot.passive.selfStatBuff,{spd:1.25,def:1.2});
 assert.equal(peridot.passive.maxUses,1);
 const meliodas=byId('meliodas');
 assert.deepEqual(meliodas.passive.statBuff,{atk:1.35,spd:1.35});
 assert.equal(meliodas.passive.threshold,.3);
});

test('Juri: Tifo del Pubblico +15% e massimo due KO per combattimento',()=>{
 const j=byId('juri');
 assert.equal(j.passive.type,'on_ko');
 assert.deepEqual(j.passive.statBuff,{atk:1.15,def:1.15,spd:1.15});
 assert.equal(j.passive.maxUses,2);
 const battle=source('src/systems/battleSystem.js');
 assert.match(battle,/attacker\.passive\.maxUses === undefined \|\| \(attacker\.passiveUses\|\|0\) < attacker\.passive\.maxUses/);
 assert.match(battle,/attacker\.passiveUses = \(attacker\.passiveUses\|\|0\)\+1/);
});

test('Diamante Bianco: primo attacco fa il 30% dei danni, ma non causa malus',()=>{
 const white=byId('diamantebianco');
 assert.equal(white.passive.type,'first_hit_immunity');
 assert.equal(white.passive.damageReduction,.7);
 assert.ok(Math.abs(firstHitProtectionFactor(white,true)-.3)<1e-9);
 assert.equal(firstHitProtectionFactor(white,false),1);
 assert.equal(firstHitProtectionFactor(byId('gaster'),true),1);
 const battle=source('src/systems/battleSystem.js');
 assert.match(battle,/if \(isFirstHitProtection\) \{\s*t\.char\.firstHitImmunityUsed = true/);
 assert.match(battle,/if \(isFirstHitProtection\) hitDmg = Math\.max\(1,Math\.floor\(hitDmg \* firstHitProtectionFactor\(t\.char,true\)\)\)/);
 assert.match(battle,/if \(isFirstHitProtection\) dmg = Math\.max\(1,Math\.floor\(dmg \* firstHitProtectionFactor\(t\.char,true\)\)\)/);
 assert.match(battle,/move\.hitStatDebuff && !isFirstHitProtection/);
 assert.match(battle,/move\.targetStatDebuff && !isFirstHitProtection/);
 assert.match(battle,/isNegative && \(isFirstHitProtection \|\|/);
 assert.match(battle,/move\.removeBuffs && !isFirstHitProtection/);
 assert.match(battle,/if \(!bypassEnemyShields && \(isProtectedFromEnemy \|\| isInvincibleShield \|\| isPerfectBarrier\)\)/);
});

test('Arie Vicente: +15% per stat, massimo due attivazioni ciascuna',()=>{
 const base=byId('arievicente');
 const a=fighter(base);
 assert.equal(a.passive.type,'perfezione_assoluta');
 assert.equal(a.passive.statBonus,1.15);
 assert.equal(a.passive.maxStatTriggers,2);
 for(const stat of ['atk','def','spd']){
  const before=a[stat];
  assert.equal(applyPerfezioneBonus(a,stat),true);
  assert.equal(applyPerfezioneBonus(a,stat),true);
  const after=a[stat];
  assert.ok(after>before);
  assert.equal(applyPerfezioneBonus(a,stat),false);
  assert.equal(a[stat],after);
  assert.equal(a.perfezioneBoostCounts[stat],2);
 }
 assert.equal(applyPerfezioneBonus(a,'hp'),false);
 assert.equal(applyPerfezioneBonus(fighter(byId('gaster')),'atk'),false);
 const battle=source('src/systems/battleSystem.js');
 for(const stat of ['atk','def','spd'])
  assert.ok(battle.includes("applyPerfezioneBonus(attacker,'"+stat+"')") ||
    battle.includes("applyPerfezioneBonus(intendedTarget,'"+stat+"')"));
 assert.ok(!battle.includes("attiva ${attacker.passive.name}! Il colpo perfetto aumenta la sua Velocità del 20%"));
});

test('Registro aggiornamenti: nerf e modifica a Sguardo Onnipotente sono in testa',()=>{
 const ids=['nov3-ten-nerfs','nov3-zeno-omnipotent-gaze'];
 const sections=ids.map(id=>GAME_UPDATES.find(x=>x.id===id));
 assert.ok(sections.every(Boolean),'Le note dei nerf non devono sparire');
 assert.ok(GAME_UPDATES.findIndex(x=>x.id===ids[0])<
           GAME_UPDATES.findIndex(x=>x.id===ids[1]));
 const joined=sections.flatMap(x=>x.items).join(' ');
 for(const word of ['Zeno','Discord','Gaster','Cell','Ainz','Peridot','Juri','Meliodas',
    'Diamante Bianco','Arie Vicente','Sguardo Onnipotente','75','2 bersagli','70%'])
  assert.ok(joined.includes(word),word+' assente dal registro');
 assert.ok(GAME_UPDATES.some(x=>x.id==='nov3-juvia-rainstorm'));
});
