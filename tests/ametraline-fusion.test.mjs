import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {FUSION_CHARACTERS} from '../src/data/fusions.js';
import {CHARACTERS} from '../src/data/characters.js';
import {MOVES_DB} from '../src/data/moves.js';
import {AMETRALINE_FUSION_MOVES} from '../src/data/ametralineFusion.js';
import {applyBattleStatModifier} from '../src/systems/statBalance.js';
import {ametralineWillChangeType,ametralineDamageFactor,ametralineOnSuccessfulAction,
 ametralineApplyButtons,ametralineTickButtons} from '../src/systems/ametralineFusionEffects.js';

const fuse=()=>structuredClone(FUSION_CHARACTERS.find(x=>x.id==='ametraline'));
const heal=(char,amount)=>{const old=char.hp;char.hp=Math.min(char.maxHp,char.hp+amount);return char.hp-old};
const fighter=(hp=100,atk=100)=>({
 id:'rival',name:'Rivale',hp,maxHp:100,atk,baseAtk:100,def:100,baseDef:100,
 spd:100,baseSpd:100,spAtk:100,baseSpAtk:100,spDef:100,baseSpDef:100,statuses:[]
});

test('Ametraline e una sola fusione Metamor valida con i veri due genitori',()=>{
 const matches=FUSION_CHARACTERS.filter(c=>c.id==='ametraline');
 assert.equal(matches.length,1);
 const char=matches[0];
 assert.deepEqual(char.fusionOf,['coraline','ametista']);
 for(const id of char.fusionOf)assert.ok(CHARACTERS.some(c=>c.id===id),id+' presente nel roster');
 assert.deepEqual(char.types,['Spettro','Cristallo']);
 assert.deepEqual([char.hp,char.atk,char.def,char.spd],[114,86,82,95]);
 assert.equal(char.fusionStyle,'Metamor');
 assert.equal(char.moves.length,4);
 assert.deepEqual(char.moves.map(m=>m.name),Object.keys(AMETRALINE_FUSION_MOVES));
 for(const move of char.moves)assert.equal(move,MOVES_DB[move.name]);
 assert.equal(char.passive.name,'Metamorfosi Cucita');
 assert.equal(char.passive.maxTriggers,4);
 assert.ok(char.img.endsWith('/ametraline.svg'));
 assert.equal(CHARACTERS.some(c=>c.id==='ametraline'),false,'Non duplica il roster normale');
});

test('Mosse d attacco e supporto preservano i dati concordati',()=>{
 const corridor=MOVES_DB['Corridoio Segreto'];
 assert.equal(corridor.power,80);
 assert.equal(corridor.hitStatDebuff.chance,.2);
 assert.equal(corridor.hitStatDebuff.def,.8);
 const whip=MOVES_DB["Frusta d'Ametista"];
 assert.equal(whip.power,72);
 assert.deepEqual(whip.multiHit,{min:2,max:2});
 assert.equal(whip.hitStatDebuff.chance,.15);
 assert.equal(whip.hitStatDebuff.spd,.9);
 const buttons=MOVES_DB['Bottoni del Vuoto'];
 assert.equal(buttons.power,0);
 assert.equal(buttons.maxUses,3);
 assert.equal(buttons.metamorButtons,true);
 const gem=MOVES_DB['Gemma Imperfetta'];
 assert.equal(gem.heal,.35);
 assert.equal(gem.statBuff.def,1.2);
 assert.equal(gem.statBuff.spd,1.2);
 assert.equal(gem.maxUses,2);
});

test('Alternanza Spettro/Cristallo: +15% per quella mossa e scudo 8%, massimo 4',()=>{
 const char=fuse();
 const ghost=MOVES_DB['Corridoio Segreto'],crystal=MOVES_DB["Frusta d'Ametista"];
 assert.equal(ametralineDamageFactor(char,ghost),1);
 assert.equal(ametralineOnSuccessfulAction(char,ghost),null);
 assert.equal(ametralineDamageFactor(char,ghost),1);
 assert.equal(ametralineWillChangeType(char,crystal),true);
 assert.equal(ametralineDamageFactor(char,crystal),1.15);
 const first=ametralineOnSuccessfulAction(char,crystal);
 assert.equal(first.charges,1);
 assert.equal(first.shield,Math.floor(char.maxHp*.08));
 assert.equal(char.crystalShieldHp,first.shield);
 assert.equal(ametralineDamageFactor(char,crystal),1);
 for(const move of [ghost,crystal,ghost]){
  assert.equal(ametralineDamageFactor(char,move),1.15);
  assert.ok(ametralineOnSuccessfulAction(char,move));
 }
 assert.equal(char.ametralineCharges,4);
 assert.equal(ametralineDamageFactor(char,crystal),1);
 assert.equal(ametralineOnSuccessfulAction(char,crystal),null);
 assert.equal(char.ametralineCharges,4);
});

test('Bottoni del Vuoto: Attacco/Precisione -20%, durata 2 turni e nessun rinnovo',()=>{
 const char=fuse(),enemy=fighter();
 const effects=ametralineApplyButtons(char,enemy,applyBattleStatModifier,heal);
 assert.equal(effects.applied,true);
 assert.equal(enemy.atk,80);
 assert.equal(enemy.acc,.8);
 assert.equal(enemy.statuses[0].turns,2);
 assert.equal(ametralineApplyButtons(char,enemy,applyBattleStatModifier,heal).alreadyActive,true);
 assert.equal(enemy.atk,80);
 ametralineTickButtons(enemy); // turno di applicazione
 assert.equal(enemy.statuses[0].turns,2);
 ametralineTickButtons(enemy);
 assert.equal(enemy.statuses[0].turns,1);
 assert.equal(ametralineTickButtons(enemy).expired,true);
 assert.equal(enemy.atk,100);
 assert.equal(enemy.acc,1);
 assert.equal(enemy.statuses.length,0);
});

test('Cura 20% solo contro bersaglio gia indebolito e restore anche con purificazione',()=>{
 const char=fuse(),enemy=fighter();char.hp=50;
 assert.equal(ametralineApplyButtons(char,enemy,applyBattleStatModifier,heal).healed,0);
 assert.equal(char.hp,50);
 enemy.statuses=[];
 ametralineTickButtons(enemy);
 assert.equal(enemy.atk,100);
 assert.equal(enemy.acc,1);
 enemy.statuses=[{type:'Scottato',turns:2}];
 const effect=ametralineApplyButtons(char,enemy,applyBattleStatModifier,heal);
 assert.equal(effect.healed,Math.floor(char.maxHp*.2));
 assert.equal(char.hp,50+Math.floor(char.maxHp*.2));
 enemy.statuses=[]; // purificazione durante il turno
 assert.equal(ametralineTickButtons(enemy).expired,true);
 assert.equal(enemy.atk,100);
 assert.equal(enemy.acc,1);
});

test('Ritratto originale incorporato nel sito, non un link esterno o immagine trasparente',()=>{
 const svg=readFileSync(new URL('../public/images/ametraline.svg',import.meta.url),'utf8');
 assert.match(svg,/<svg /);
 assert.match(svg,/image\/webp;base64,/);
 const data=svg.match(/base64,([A-Za-z0-9+/=]+)"/)?.[1];
 assert.ok(data?.length>6000,'L artwork deve avere dati reali');
 const webp=Buffer.from(data,'base64');
 assert.equal(webp.subarray(0,4).toString(),'RIFF');
 assert.equal(webp.subarray(8,12).toString(),'WEBP');
 assert.ok(webp.length>4000);
});

test('Il motore autorevole contiene le nuove tecniche e la scadenza',()=>{
 const s=readFileSync(new URL('../src/systems/battleSystem.js',import.meta.url),'utf8');
 assert.match(s,/ametralineDamageFactor\(attacker,move\)/);
 assert.match(s,/ametralineApplyButtons\(attacker,t\.char,applyBattleStatModifier,royalHeal\)/);
 assert.match(s,/ametralineOnSuccessfulAction\(attacker,move\)/);
 assert.match(s,/ametralineTickButtons\(char\)/);
});
