import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import { ITEMS_DB } from '../src/data/items.js';
import { TYPES } from '../src/data/types.js';
import { CHARACTERS } from '../src/data/characters.js';
import { updateLocalStatsImpl } from '../src/systems/profileSystem.js';
import { HELD_ITEM_IDS,getHeldPowerFactor,getHeldEvasion,getHeldEndTurnHeal,
    useHeldGem,canEquipHeldItem } from '../src/systems/heldEquipment.js';
import { calculateDamageImpl } from '../src/systems/battleSystem.js';
import { makeEventEntrants,makeEventBracket,nextEventMatch,buildEventBattle,
    eventTurn,activeEventFighters,normalizeEventSettings } from '../src/systems/multiverseEventEngine.js';
const gemItems=Object.values(ITEMS_DB).filter(x=>x.gemType);
test('22 gemme e un tipo univoco per ogni gemma',()=>{
 assert.equal(gemItems.length,22);
 assert.equal(new Set(gemItems.map(x=>x.gemType)).size,22);
 assert.ok(gemItems.every(x=>TYPES.includes(x.gemType)));
 assert.equal(ITEMS_DB.gemma_blu.gemType,'Acqua');
 assert.equal(ITEMS_DB.gemma_arancione.gemType,'Fuoco');
 assert.equal(ITEMS_DB.gemma_grigia.gemType,'Normale');
 assert.equal(ITEMS_DB.gemma_robot.gemType,'Robot');
 assert.ok(HELD_ITEM_IDS.includes('mantello_invisibilita'));
 assert.ok(HELD_ITEM_IDS.includes('avanzi'));
});
test('Gemme +30% soltanto alla prima mossa del tipo: poi si rompono solo in partita',()=>{
 const char={heldItem:'gemma_arancione',gemSpent:false,maxHp:100};
 const fire={power:90,type:'Fuoco'},water={power:90,type:'Acqua'};
 assert.equal(getHeldPowerFactor(char,water),1);
 assert.equal(getHeldPowerFactor(char,fire),1.3);
 assert.equal(useHeldGem(char,water),false);
 assert.equal(useHeldGem(char,fire),true);
 assert.equal(char.gemSpent,true);
 assert.equal(getHeldPowerFactor(char,fire),1);
 assert.equal(useHeldGem(char,fire),false);
 assert.equal(getHeldPowerFactor({...char,gemSpent:false},fire),1.3);
 assert.equal(getHeldPowerFactor({...char,gemSpent:false},{power:0,type:'Fuoco'}),1);
});
test('Mantello e Avanzi: 15% evasione e 5% cura finale',()=>{
 assert.equal(getHeldEvasion({heldItem:'mantello_invisibilita'}),0.15);
 assert.equal(getHeldEvasion({heldItem:'iperband'}),0);
 assert.equal(getHeldEndTurnHeal({heldItem:'avanzi',hp:64,maxHp:100}),5);
 assert.equal(getHeldEndTurnHeal({heldItem:'avanzi',hp:0,maxHp:100}),0);
});
test('I possedimenti restano nel profilo anche dopo overwrite dello zaino',()=>{
 const stored=new Map([['multiverse_rpg_global_profile',JSON.stringify({
  coins:900,matches:0,wins:0,playtime:0,chars:{},moves:{},inventory:{iperband:1},unlockedChars:[]
 })]]);
 const orig=globalThis.localStorage;
 globalThis.localStorage={getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,v),
  removeItem:k=>stored.delete(k)};
 try{
  const getter=()=>JSON.parse(stored.get('multiverse_rpg_global_profile'));
  updateLocalStatsImpl({getPlayerData:getter},{spendCoins:190,buyItem:'gemma_blu'});
  const first=getter();
  assert.equal(first.coins,710);
  assert.equal(first.inventory.gemma_blu,1);
  updateLocalStatsImpl({getPlayerData:getter},{buyItem:'gemma_blu'});
  assert.equal(getter().inventory.gemma_blu,1,'No duplicate permanent purchases');
  updateLocalStatsImpl({getPlayerData:getter},{overwriteInventory:{pozione:2}});
  assert.equal(getter().inventory.gemma_blu,1);
  assert.equal(getter().inventory.iperband,1);
  assert.equal(canEquipHeldItem([{heldItem:'gemma_blu'}],0,'gemma_blu',getter().inventory),true);
 }finally{globalThis.localStorage=orig;}
});
test('Bugs Bunny è Terra e mantiene moveset',()=>{
 const b=CHARACTERS.find(c=>c.id==='bugsbunny');
 assert.deepEqual(b.types,['Terra']);assert.equal(b.moves.length,4);
});
test('Event battle mantiene la gemma equipaggiata e può cambiarla con una riserva',()=>{
 const roster=CHARACTERS.filter(c=>!c.isSummonOnly&&!c.isSecretUnlock).slice(0,4).map(c=>c.id);
 const participant=id=>({id,name:id,teamIds:roster,ready:true,heldItems:{[roster[0]]:'gemma_arancione'}});
 const s=normalizeEventSettings({entrants:4,teamSize:4,fieldSize:1,allowItems:true});
 const people=['u1','u2','u3','u4'].map(participant);
 const entrants=makeEventEntrants(people,[],s);
 const b=buildEventBattle(nextEventMatch(makeEventBracket(entrants,()=>.99)),
   Object.fromEntries(people.map(x=>[x.id,x])),s);
 const first=activeEventFighters(b,'A',s)[0];
 assert.equal(first.heldItem,'gemma_arancione');
 assert.equal(first.gemSpent,false);
 const nextUnit=b.teams.A.find(u=>u.owner===first.owner&&u.key!==first.key);
 const next=eventTurn(b,{[first.owner]:[{actor:first.key,type:'switch',switchTo:nextUnit.key}]},s,()=>.3);
 assert.equal(activeEventFighters(next,'A',s).find(u=>u.owner===first.owner).key,nextUnit.key);
});
test('L’arena evento importa la stessa vista delle battaglie normali, non la copia precedente',()=>{
 const arena=readFileSync(new URL('../src/screens/events/StandardTournamentBattle.jsx',import.meta.url),'utf8');
 const hub=readFileSync(new URL('../src/screens/events/MultiverseEventHub.jsx',import.meta.url),'utf8');
 const shop=readFileSync(new URL('../src/screens/hub/ShopView.jsx',import.meta.url),'utf8');
 assert.ok(arena.includes("import { renderBattlingView } from '../battle/BattlingView.jsx'"));
 assert.ok(arena.includes('renderBattlingView({'));
 assert.ok(hub.includes("displayPhase:'battle'"));
 assert.ok(hub.includes("displayPhase:'bracket'"));
 assert.ok(hub.includes("event.displayPhase==='bracket'"));
 assert.ok(shop.includes("setShopTab('held')"));
 assert.ok(shop.includes("shopTab==='held'?item.type==='held':item.type!=='held'"));
});
