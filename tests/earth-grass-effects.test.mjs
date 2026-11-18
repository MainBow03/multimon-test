import test from 'node:test';
import assert from 'node:assert/strict';
import {CHARACTERS} from '../src/data/characters.js';
import {MOVES_DB} from '../src/data/moves.js';
import {applyBattleStatModifier} from '../src/systems/statBalance.js';
import {tophSeismicEntry,gaaraSandGuardHit,gaaraSandThreshold,flygonDuneEcho,
 flygonWyrmBonus,leafeonSpeedPower,floraFairyGarden,shayminSpringHeart,
 shayminAwakening} from '../src/systems/earthGrassEffects.js';

const fighter=id=>{
 const f=structuredClone(CHARACTERS.find(c=>c.id===id));
 for(const key of ['Atk','Def','Spd','SpAtk','SpDef']){
  const stat=key==='Atk'?'atk':key==='Def'?'def':key==='Spd'?'spd':key==='SpAtk'?'spAtk':'spDef';
  f['base'+key]=f[stat];
 }
 f.statuses=[];
 return f;
};
const heal=(char,amount)=>{const old=char.hp;char.hp=Math.min(char.maxHp,char.hp+amount);return char.hp-old;};

test('Toph sceglie il nemico piu veloce, non rallenta gli alleati e non ripete il suo ingresso',()=>{
 const toph=fighter('tophbeifong'),a=fighter('leafeon'),slow=fighter('gaara'),fast=fighter('flygon');
 const teams={p1:[toph,a],p2:[slow,fast]},field={p1:[0,1],p2:[0,1]},events=[];
 const prev=fast.spd;
 const picked=tophSeismicEntry(toph,'p1',teams,field,'classica',{},applyBattleStatModifier,events);
 assert.equal(picked.char,fast);
 assert.ok(fast.spd<prev);
 assert.equal(slow.spd,slow.baseSpd);
 assert.equal(a.spd,a.baseSpd);
 assert.equal(events.length,1);
});

test('Gaara: scudo una volta per turno e +20% Difesa solo alla prima soglia',()=>{
 const gaara=fighter('gaara');
 const first=gaaraSandGuardHit(gaara,100,1);
 assert.deepEqual(first,{damage:80,activated:true});
 assert.deepEqual(gaaraSandGuardHit(gaara,100,1),{damage:100,activated:false});
 assert.deepEqual(gaaraSandGuardHit(gaara,100,2),{damage:80,activated:true});
 gaara.hp=56;
 assert.equal(gaaraSandThreshold(gaara,applyBattleStatModifier),false);
 gaara.hp=50;
 assert.equal(gaaraSandThreshold(gaara,applyBattleStatModifier),true);
 assert.ok(gaara.def>gaara.baseDef);
 assert.equal(gaaraSandThreshold(gaara,applyBattleStatModifier),false);
});

test('Flygon: accumula tre cariche Terra/Drago e Picchiata Wyrm guadagna momentum',()=>{
 const flygon=fighter('flygon');
 assert.equal(flygonWyrmBonus(flygon,MOVES_DB['Picchiata Wyrm']),1);
 assert.equal(flygonDuneEcho(flygon,MOVES_DB['Rombo del Deserto'],applyBattleStatModifier).stat,'spd');
 assert.equal(flygonWyrmBonus(flygon,MOVES_DB['Picchiata Wyrm']),1.2);
 assert.equal(flygonDuneEcho(flygon,MOVES_DB['Artiglio Mirage'],applyBattleStatModifier).stat,'atk');
 assert.equal(flygonDuneEcho(flygon,MOVES_DB['Tempesta Sonica'],applyBattleStatModifier).charges,3);
 assert.equal(flygonDuneEcho(flygon,MOVES_DB['Picchiata Wyrm'],applyBattleStatModifier),null);
 assert.equal(flygon.duneEchoCharges,3);
});

test('Flora: passiva supporto cura alleato attivo piu ferito una sola volta',()=>{
 const flora=fighter('flora'),leafeon=fighter('leafeon'),gaara=fighter('gaara');
 flora.hp=90;leafeon.hp=20;gaara.hp=70;
 const teams={p1:[flora,leafeon],p2:[gaara]},field={p1:[0,1],p2:[0]};
 const result=floraFairyGarden(flora,MOVES_DB['Valzer dei Petali'],'p1',
   teams,field,'classica',{},heal);
 assert.equal(result.char,leafeon);
 assert.equal(result.healed,Math.floor(leafeon.maxHp*.08));
 assert.equal(gaara.hp,70);
 assert.equal(floraFairyGarden(flora,MOVES_DB['Laccio di Vite'],'p1',
   teams,field,'classica',{},heal),null);
});

test('Leafeon: +15% solo se e piu veloce e apre la sequenza offensiva',()=>{
 const leafeon=fighter('leafeon'),gaara=fighter('gaara'),flygon=fighter('flygon');
 assert.equal(leafeonSpeedPower(leafeon,gaara,MOVES_DB['Foglialama Reale'],true),1.15);
 assert.equal(leafeonSpeedPower(leafeon,flygon,MOVES_DB['Foglialama Reale'],true),1);
 assert.equal(leafeonSpeedPower(leafeon,gaara,MOVES_DB['Foglialama Reale'],false),1);
 assert.equal(leafeonSpeedPower(leafeon,gaara,MOVES_DB['Radura Protettiva'],true),1);
});

test('Shaymin: risveglio una volta, cinque statistiche +20%, cambia ritratto e non guarisce gratis',()=>{
 const shaymin=fighter('shaymin'),before=Object.fromEntries(
  ['atk','def','spd','spAtk','spDef'].map(key=>[key,shaymin[key]]));
 const image=shaymin.img;
 assert.equal(shayminAwakening(shaymin,MOVES_DB['Cometa Florale'],applyBattleStatModifier),null);
 const awakened=shayminAwakening(shaymin,MOVES_DB['Risveglio'],applyBattleStatModifier);
 assert.ok(awakened);
 assert.notEqual(shaymin.img,image);
 assert.equal(shaymin.hp,shaymin.maxHp);
 for(const key of Object.keys(before)){
   assert.ok(shaymin[key]>before[key],key);
   assert.ok(shaymin[key]<=before[key]*1.2,key);
 }
 assert.equal(shayminAwakening(shaymin,MOVES_DB['Risveglio'],applyBattleStatModifier),null);
 shaymin.hp=75;
 for(let i=0;i<4;i++)assert.ok(shayminSpringHeart(shaymin,MOVES_DB['Prato della Rinascita'],applyBattleStatModifier,heal));
 assert.equal(shayminSpringHeart(shaymin,MOVES_DB['Prato della Rinascita'],applyBattleStatModifier,heal),null);
 assert.equal(shaymin.springHeartCharges,4);
});
