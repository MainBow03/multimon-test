import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import { ITEMS_DB } from '../src/data/items.js';
import { CHARACTERS } from '../src/data/characters.js';
import { HELD_ITEM_IDS } from '../src/systems/heldEquipment.js';
import { activateHealingSprout,activateNeutralizingSpray,activateCupidArrow,
  blockedEnemyPassive,markRapidTransmutationEntry,endRapidTransmutationTurn,
  rapidTransmutationPriority,immuneToCritical,hannibalCanDebuff,
  isNegativeStatus } from '../src/systems/newHeldAndPassiveEffects.js';
import { normalizeEventSettings,buildEventBattle,eventTurn,
  activeEventFighters } from '../src/systems/multiverseEventEngine.js';

const chars=Object.fromEntries(CHARACTERS.map(c=>[c.id,c]));
const ids=['nicole','alphonse','hannibal','cyborg'];
const enemies=['cyborg','kitty','bugsbunny','diamante'];
const settings=normalizeEventSettings({entrants:4,teamSize:4,fieldSize:1,allowItems:true});
const match={id:'test-fight',sideA:{id:'a',name:'Team A',members:['alice']},sideB:{id:'b',name:'Team B',members:['bob']}};
function event(teamA=ids,teamB=enemies,equipmentA={},equipmentB={}){
 const people={alice:{id:'alice',teamIds:teamA,heldItems:equipmentA},bob:{id:'bob',teamIds:teamB,heldItems:equipmentB}};
 return buildEventBattle(match,people,settings);
}
test('Quattro nuovi strumenti da lotta acquistabili per sempre',()=>{
 for(const id of ['germoglio_curativo','spray_neutralizzante','freccia_cupido','scudo_antimagia']){
  assert.equal(ITEMS_DB[id].type,'held',id);
  assert.ok(ITEMS_DB[id].price>0);
  assert.ok(HELD_ITEM_IDS.includes(id));
 }
});
test('Germoglio: sotto 50% recupera 25% max HP, una sola volta per partita',()=>{
 const u={name:'Sfidante',heldItem:'germoglio_curativo',maxHp:100,hp:51};
 assert.equal(activateHealingSprout(u),0);
 u.hp=49;
 assert.equal(activateHealingSprout(u),25);
 assert.equal(u.hp,74);
 u.hp=30;
 assert.equal(activateHealingSprout(u),0);
 assert.equal(u.hp,30);
 assert.equal(activateHealingSprout({...u,healingSproutUsed:false,hp:0}),0);
});
test('Spray: elimina qualsiasi malus incluso Ricarica, ma conserva i buff',()=>{
 const u={heldItem:'spray_neutralizzante',statuses:[
  {type:'Ricarica',turns:1},{type:'Scottato',turns:3},{type:'Infatuato',turns:4},
  {type:'Magnetico',turns:1},{type:'Protetto',turns:1}]};
 assert.deepEqual(activateNeutralizingSpray(u),['Ricarica','Scottato','Infatuato','Magnetico']);
 assert.deepEqual(u.statuses,[{type:'Protetto',turns:1}]);
 assert.equal(u.neutralizingSprayUsed,true);
 u.statuses.push({type:'Confuso',turns:3});
 assert.deepEqual(activateNeutralizingSpray(u),[]);
 assert.equal(isNegativeStatus('Ricarica'),true);
 assert.equal(isNegativeStatus('Protetto'),false);
});
test('Freccia di Cupido: 10% solo quando una mossa fisica colpisce; senza limiti',()=>{
 const attacker={heldItem:'freccia_cupido'},t=()=>({hp:100,statuses:[]});
 assert.equal(activateCupidArrow(attacker,{power:75,special:false},t(),()=>0.099),true);
 assert.equal(activateCupidArrow(attacker,{power:75,special:false},t(),()=>0.1),false);
 assert.equal(activateCupidArrow(attacker,{power:75,special:true},t(),()=>0),false);
 assert.equal(activateCupidArrow(attacker,{power:0,special:false},t(),()=>0),false);
 assert.equal(activateCupidArrow(attacker,{power:75},t(),()=>0,false),false);
 const protectedTarget={hp:100,statuses:[],passive:{immuneToNegativeStatuses:true}};
 assert.equal(activateCupidArrow(attacker,{power:75},protectedTarget,()=>0),false);
 assert.equal(activateCupidArrow(attacker,{power:75},t(),()=>0),true);
});
test('Nicole, Alphonse, Cyborg e Hannibal hanno abilità corrette',()=>{
 assert.equal(chars.nicole.passive.name,'Mamma Demoniaca');
 assert.equal(chars.nicole.passive.enemyStatDebuff.atk,.8);
 assert.equal(chars.alphonse.passive.type,'rapid_transmutation');
 assert.equal(chars.hannibal.passive.type,'psychological_manipulation');
 assert.equal(chars.cyborg.passive.name,'Corazza Titan');
 assert.equal(immuneToCritical(chars.cyborg),true);
 assert.equal(chars.cyborg.passive.aoeDamagePercentMaxHp,.1,'Vecchio Malfunzionamento preservato');
 const al={...chars.alphonse};
 assert.equal(rapidTransmutationPriority(al,{type:'Terra',power:50}),0);
 markRapidTransmutationEntry(al);
 assert.equal(rapidTransmutationPriority(al,{type:'Terra',power:50}),1);
 assert.equal(rapidTransmutationPriority(al,{type:'Robot',power:50}),1);
 assert.equal(rapidTransmutationPriority(al,{type:'Fuoco',power:50}),0);
 endRapidTransmutationTurn(al);
 assert.equal(rapidTransmutationPriority(al,{type:'Terra',power:50}),0);
 markRapidTransmutationEntry(al,true);
 endRapidTransmutationTurn(al);
 assert.equal(rapidTransmutationPriority(al,{type:'Robot'}),1,'Entrato a turno iniziato: deve avere bonus nel prossimo');
 endRapidTransmutationTurn(al);
 assert.equal(rapidTransmutationPriority(al,{type:'Robot'}),0);
});
test('Scudo Anti-Magia protegge dai malus delle passive, comprese quelle di Nicole e Hannibal',()=>{
 const immune={hp:100,heldItem:'scudo_antimagia'};
 assert.equal(blockedEnemyPassive(immune),true);
 assert.equal(hannibalCanDebuff(chars.hannibal,immune,()=>0),false);
 const bare={hp:100,heldItem:null};
 assert.equal(hannibalCanDebuff(chars.hannibal,bare,()=>0.19),true);
 assert.equal(hannibalCanDebuff(chars.hannibal,bare,()=>0.20),false);
 const withShield=event(ids,enemies,{}, {cyborg:'scudo_antimagia'});
 assert.equal(withShield.teams.B[0].atk,chars.cyborg.atk,'Nicole non deve ridurre Attacco a chi ha lo scudo');
 const withoutShield=event(ids,enemies);
 assert.equal(withoutShield.teams.B[0].atk,Math.floor(chars.cyborg.atk*.8));
});
test('Torneo: Hannibal applica la sua abilità dopo un attacco valido',()=>{
 const b=event(['hannibal','nicole','alphonse','cyborg'],['diamante','cyborg','bugsbunny','kitty']);
 const actor=activeEventFighters(b,'A',settings)[0];
 const enemy=activeEventFighters(b,'B',settings)[0];
 actor.moves[0]={...actor.moves[0],power:1,accuracy:1,special:false};
 enemy.hp=enemy.maxHp=300;
 const result=eventTurn(b,{alice:[{actor:actor.key,moveIndex:0,target:enemy.key}]},settings,()=>0);
 assert.ok(result.log.some(x=>x.includes('Manipolazione Psicologica')));
 assert.ok(result.teams.B[0].atk<enemy.atk);
});
test('Torneo: Freccia di Cupido può infatuare e Spray annulla Ricarica',()=>{
 const b=event(['hannibal','nicole','alphonse','cyborg'],['diamante','cyborg','bugsbunny','kitty'],
   {hannibal:'freccia_cupido'});
 const actor=b.teams.A[0],enemy=b.teams.B[0];
 actor.moves[0]={...actor.moves[0],power:1,accuracy:1,special:false};
 enemy.hp=enemy.maxHp=500;
 const after=eventTurn(b,{alice:[{actor:actor.key,moveIndex:0,target:enemy.key}]},settings,()=>0);
 assert.ok(after.teams.B[0].statuses.includes('Infatuato'));
 const recharge=event(['hannibal','nicole','alphonse','cyborg'],['diamante','cyborg','bugsbunny','kitty'],
   {hannibal:'spray_neutralizzante'});
 recharge.teams.A[0].moves[0]={...recharge.teams.A[0].moves[0],power:1,accuracy:1,recharge:true};
 recharge.teams.B[0].hp=recharge.teams.B[0].maxHp=500;
 const x=eventTurn(recharge,{alice:[{actor:recharge.teams.A[0].key,moveIndex:0,target:recharge.teams.B[0].key}]},settings,()=>.5);
 assert.equal(x.teams.A[0].neutralizingSprayUsed,true);
 assert.equal(x.teams.A[0].statuses.includes('Ricarica'),false);
});
test('Torneo: Cyborg respinge tutti i critici anche con casualità massima',()=>{
 const b=event(['hannibal','nicole','alphonse','cyborg'],enemies);
 const actor=b.teams.A[0],enemy=b.teams.B[0];
 actor.moves[0]={...actor.moves[0],power:1,accuracy:1,special:false};
 enemy.hp=enemy.maxHp=300;
 const x=eventTurn(b,{alice:[{actor:actor.key,moveIndex:0,target:enemy.key}]},settings,()=>0);
 assert.ok(!x.log.some(line=>line.startsWith('Brutto colpo')));
});
test('Il motore classico contiene tutti gli hook, lo shop usa la lista dinamica',()=>{
 const battle=readFileSync(new URL('../src/systems/battleSystem.js',import.meta.url),'utf8');
 const shop=readFileSync(new URL('../src/screens/hub/ShopView.jsx',import.meta.url),'utf8');
 assert.ok(battle.includes('activateHealingSprout(target)'));
 assert.ok(battle.includes('activateNeutralizingSpray(attacker)'));
 assert.ok(battle.includes('activateCupidArrow(attacker,move,t.char)'));
 assert.ok(battle.includes('hannibalCanDebuff(attacker,t.char)'));
 assert.ok(battle.includes('rapidTransmutationPriority(char,move)'));
 assert.ok(battle.includes('immuneToCritical(t.char)'));
 assert.ok(shop.includes("shopTab==='held'?item.type==='held':item.type!=='held'"));
});
