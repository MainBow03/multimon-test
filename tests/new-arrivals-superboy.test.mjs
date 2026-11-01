import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CHARACTERS } from '../src/data/characters.js';
import { MOVES_DB } from '../src/data/moves.js';
import { CHAR_PRICES } from '../src/data/prices.js';
import { calculateDamageImpl } from '../src/systems/battleSystem.js';

test('Nuovi arrivi: Mahito, Orso Bianco, Bugs, Daffy, Diamante, Superboy',()=>{
 const c=readFileSync(new URL('../src/screens/battle/LobbyView.jsx',import.meta.url),'utf8');
 const found=c.match(/const newArrivals = \[([^\]]+)\]/);
 assert.ok(found,'Manca la lista Nuovi Arrivi');
 const ids=[...found[1].matchAll(/'([^']+)'/g)].map(m=>m[1]);
 for(const id of ['mahito','orsobianco','bugsbunny','daffyduck','diamante','superboy']){
  assert.ok(ids.includes(id),id+' non appare tra i nuovi arrivi');
  assert.ok(ids.indexOf(id)<20,id+' deve comparire nei 20 nuovi arrivi visibili');
  assert.ok(CHARACTERS.some(c=>c.id===id),id+' non esiste nel roster');
 }
});
test('Solo il filtro Fusioni visualizza le fusioni',()=>{
 const code=readFileSync(new URL('../src/screens/hub/CatalogView.jsx',import.meta.url),'utf8');
 assert.ok(code.includes("catalogFilter === 'Fusioni'"));
 assert.ok(code.includes("displayedChars = FUSION_CHARACTERS.map("));
 assert.ok(code.includes("displayedChars = CHARACTERS.filter("));
 assert.ok(!code.includes("displayedChars = [...CHARACTERS, ...FUSION_CHARACTERS]"));
});
test('Superboy entra nel roster e nello shop con le quattro mosse',()=>{
 const superboy=CHARACTERS.find(c=>c.id==='superboy');
 assert.ok(superboy);
 assert.deepEqual(superboy.types,['Luce','Lotta']);
 assert.equal(superboy.img,'https://i.pinimg.com/1200x/c0/d6/0b/c0d60bee10b5a61fdd406cb2ecd12449.jpg');
 assert.equal(CHAR_PRICES.superboy,250);
 assert.deepEqual(superboy.moves.map(m=>m.name),['Raggio Solare','Pugno Tattico','Impatto Kryptoniano','Volo Supersonico']);
 assert.equal(superboy.passive.type,'on_hp_threshold');
 assert.equal(superboy.passive.threshold,.25);
 assert.deepEqual(superboy.passive.statBuff,{atk:1.2,spd:1.2});
 assert.equal(superboy.passive.maxUses,1);
});
test('Superboy: abbagliamento, controattacco più veloce, impatto e volo',()=>{
 assert.equal(MOVES_DB['Raggio Solare'].power,90);
 assert.equal(MOVES_DB['Raggio Solare'].statusEffect.chance,.2);
 assert.equal(MOVES_DB['Raggio Solare'].statusEffect.type,'Accecato');
 assert.equal(MOVES_DB['Pugno Tattico'].bonusAgainstFaster,1.5);
 assert.equal(MOVES_DB['Impatto Kryptoniano'].power,120);
 assert.equal(MOVES_DB['Impatto Kryptoniano'].accuracy,.7);
 assert.equal(MOVES_DB['Volo Supersonico'].selfStatBuff.spd,1.2);
 const attacker={id:'superboy',name:'Superboy',maxHp:110,atk:100,def:80,spd:90,types:['Lotta','Luce'],statuses:[]};
 const defender={id:'other',name:'Altro',def:100,baseDef:100,spd:150,types:['Normale'],statuses:[]};
 const move=MOVES_DB['Pugno Tattico'];
 const boosted=calculateDamageImpl({},attacker,defender,move,1,false,()=>.4);
 const ordinary=calculateDamageImpl({},attacker,{...defender,spd:60},move,1,false,()=>.4);
 assert.ok(boosted>ordinary,'Pugno Tattico deve aumentare i danni solo contro bersagli più veloci');
});
