import test from 'node:test';
import assert from 'node:assert/strict';

import {CHARACTERS} from '../src/data/characters.js';
import {MOVES_DB} from '../src/data/moves.js';
import {CHAR_PRICES} from '../src/data/prices.js';
import {RECENT_ARRIVALS_IDS,recentArrivalCharacters} from '../src/data/recentArrivals.js';
import {NEW_REALM_CHARACTERS,NEW_REALM_MOVES} from '../src/data/newRealmChampions.js';
import {MASTERY_CHARACTER_TITLES} from '../src/data/masteryTitles.js';
import {ULTIMON_ENTRANCE_LINES} from '../src/systems/ultimonEntranceLines.js';
import {ULTIMON_DUPLICATE_REACTIONS} from '../src/systems/ultimonDuplicateLines.js';
import {applyBattleStatModifier} from '../src/systems/statBalance.js';
import {newRealmOnAction,newRealmOnEndTurn} from '../src/systems/newRealmEffects.js';

const IDS=['mushu','hakudrago','shenron','billcipher','senzavolto',
 'hornet','baxterstockman','vaiana','ariel','frozone','korra','ponyo'];
const EXPECTED={
 mushu:['Drago','Fuoco'],hakudrago:['Drago','Aria'],shenron:['Drago','Luce'],
 billcipher:['Buio','Psico'],senzavolto:['Buio','Spettro'],
 hornet:['Insetto','Aria'],baxterstockman:['Insetto','Robot'],
 vaiana:['Acqua','Luce'],ariel:['Acqua','Suono'],frozone:['Acqua','Ghiaccio'],
 korra:['Acqua','Terra'],ponyo:['Acqua','Folletto']
};
const character=id=>CHARACTERS.find(c=>c.id===id);

function battleFighter(id){
 const char=structuredClone(character(id));
 for(const stat of ['atk','def','spd','spAtk','spDef']){
  const base='base'+stat[0].toUpperCase()+stat.slice(1);
  char[base]=char[stat];
 }
 char.statuses=[];
 return char;
}
function heal(char,amount){
 const before=char.hp;
 char.hp=Math.min(char.maxHp,char.hp+amount);
 return char.hp-before;
}
function action(id,moveName,overrides={}){
 const attacker=overrides.attacker||battleFighter(id);
 const foe=overrides.foe||battleFighter('mushu');
 const teams={p1:[attacker],p2:[foe]};
 const field={p1:[0],p2:[0]};
 return {
  attacker,move:MOVES_DB[moveName],turn:1,player:'p1',idx:0,
  teams,field,mode:'classica',settings:{},targets:[{player:'p2',idx:0,char:foe}],
  foeRoles:['p2'],applyStat:applyBattleStatModifier,heal,
  random:()=>0,...overrides
 };
}

test('12 nuovi Multimon giocabili: 3 Drago, 2 Buio, 2 Insetto e 5 Acqua senza Pokemon',()=>{
 assert.deepEqual(NEW_REALM_CHARACTERS.map(c=>c.id),IDS);
 const imageUrls=new Set(),names=new Set(),passives=new Set();
 for(const id of IDS){
  const list=CHARACTERS.filter(c=>c.id===id);
  assert.equal(list.length,1,'id duplicato '+id);
  const char=list[0],spec=NEW_REALM_CHARACTERS.find(c=>c.id===id);
  assert.deepEqual(char.types,EXPECTED[id],id);
  assert.ok(!char.isSummonOnly&&!char.isCampaignMonster,id);
  assert.equal(char.moves.length,4,id+' deve avere 4 mosse');
  assert.ok(char.moves.every(m=>m&&m.name&&Number.isFinite(m.power)&&m.type),id);
  assert.ok(/^https:\/\/.+\.jpg$/i.test(char.img),id+' immagine JPG opaca');
  assert.ok(!imageUrls.has(char.img),'immagine ripetuta '+id);
  imageUrls.add(char.img);
  assert.ok(!names.has(char.name));names.add(char.name);
  assert.ok(!passives.has(char.passive?.type),id+' passiva unica');
  passives.add(char.passive.type);
  assert.ok(char.passive?.name?.length>5&&char.passive?.desc?.length>50);
  assert.ok(CHAR_PRICES[id]>0,id+' costo negozio');
  assert.ok(MASTERY_CHARACTER_TITLES[id]?.length>12,id+' padronanza');
  assert.ok(ULTIMON_ENTRANCE_LINES[id]?.length>15,id+' entrata');
  assert.ok(ULTIMON_DUPLICATE_REACTIONS[id]?.length>15,id+' reazione al doppione');
  assert.deepEqual(char.moves.map(m=>m.name),spec.moveNames);
  for(const m of char.moves)assert.equal(m,MOVES_DB[m.name]);
 }
 assert.equal(passives.size,12);
 assert.equal(Object.keys(NEW_REALM_MOVES).length,48);
 assert.equal(new Set(Object.keys(NEW_REALM_MOVES)).size,48);
 assert.ok(!IDS.some(id=>/pikachu|pokemon|eevee|mew|lapras|vaporeon/i.test(character(id).name)));
});

test('Catalogo, vetrina e conteggio dopo 12 aggiunte',()=>{
 assert.deepEqual(RECENT_ARRIVALS_IDS.slice(15,27),IDS);
 assert.deepEqual(recentArrivalCharacters(CHARACTERS).slice(15,27).map(c=>c.id),IDS);
 const roster=CHARACTERS.filter(c=>!c.isSummonOnly&&!c.isCampaignMonster);
 assert.equal(roster.length,209);
 const count=type=>roster.filter(c=>c.types.includes(type)).length;
 assert.equal(count('Drago'),12);
 assert.equal(count('Buio'),15);
 assert.equal(count('Insetto'),14);
 assert.equal(count('Acqua'),19);
});

test('Le 48 mosse possiedono veri effetti del motore e limiti per gli attacchi piu forti',()=>{
 for(const [name,move] of Object.entries(NEW_REALM_MOVES)){
  assert.equal(name,move.name);
  assert.ok(Number.isFinite(move.power)&&move.power>=0&&move.power<=120);
  assert.ok(move.desc&&move.desc.length>25,name);
  if(move.power===0)assert.ok(
    move.heal||move.isProtect||move.statBuff||move.selfStatBuff||move.statusEffect||move.targetStatDebuff||move.removeNegativeStatuses,
    'supporto senza effetto '+name);
  if(move.maxUses!==undefined){assert.equal(move.strictUses,true,'limite non rigido '+name);assert.ok(move.maxUses<=5)}
 }
});

test('Mushu e Ariel curano un alleato ferito, una volta per turno dopo attacchi di tipo coerente',()=>{
 for(const [id,moveName] of [['mushu','Scintilla degli Antenati'],['ariel','Canto della Laguna']]){
  const a=action(id,moveName);a.attacker.hp=a.attacker.maxHp-50;
  const first=newRealmOnAction(a);
  assert.equal(first.filter(x=>x.type==='damage').length,1);
  const hp=a.attacker.hp;
  assert.ok(hp>a.attacker.maxHp-50);
  assert.equal(newRealmOnAction(a).length,0,'non cura due volte per turno');
 }
});

test('Haku, Shenron e Vaiana attivano il supporto e consumano le cariche corrette',()=>{
 const h=action('hakudrago','Ricordo del Fiume');
 h.attacker.statuses=[{type:'Confuso',turns:2}];
 const e=newRealmOnAction(h);
 assert.ok(e.some(x=>x.type==='status_update'));
 assert.ok(!h.attacker.statuses.length);
 assert.ok(h.attacker.spd>h.attacker.baseSpd);
 const sh=action('shenron','Promessa del Drago');
 sh.attacker.hp=75;
 assert.ok(newRealmOnAction(sh).length>0);
 assert.equal(sh.attacker.newRealmCharges,1);
 assert.equal(newRealmOnAction(sh).length,0);
 const va=action('vaiana','Corrente Guida');va.attacker.hp=80;
 assert.ok(newRealmOnAction(va).length>0);
 assert.equal(va.attacker.newRealmCharges,1);
});

test('Bill Cipher causa un debuff casuale; Senza Volto trae beneficio da status negativi',()=>{
 const bill=action('billcipher','Occhio Piramidale');
 const orig=bill.targets[0].char.atk;
 const e=newRealmOnAction(bill);
 assert.ok(e.length>0);
 assert.ok(bill.targets[0].char.atk<orig);
 assert.equal(bill.attacker.newRealmCharges,1);
 const face=action('senzavolto','Voracita Ombrosa');
 face.attacker.hp=65;face.targets[0].char.statuses=[{type:'Confuso',turns:2}];
 assert.ok(newRealmOnAction(face).some(x=>x.type==='damage'));
 assert.equal(face.attacker.newRealmCharges,1);
});

test('Hornet rallenta, Baxter accumula marchi, Frozone rallenta solo una volta a turno',()=>{
 const hornet=action('hornet','Filo Scarlatto');
 const start=hornet.targets[0].char.spd;
 assert.ok(newRealmOnAction(hornet).length>0);
 assert.ok(hornet.targets[0].char.spd<start);
 const baxter=action('baxterstockman','Mosca Robotica');
 const foe=baxter.targets[0].char;
 assert.ok(newRealmOnAction(baxter).some(x=>x.text.includes('marchio')));
 assert.equal(baxter.attacker.mouserTargets['p2:0'].marks,1);
 const oldDef=foe.def;
 assert.ok(newRealmOnAction(baxter).some(x=>x.text.includes('Difesa -20%')));
 assert.ok(foe.def<oldDef);
 assert.equal(baxter.attacker.mouserTargets['p2:0'].activations,1);
 const frozone=action('frozone','Pista di Cristallo');
 assert.ok(newRealmOnAction(frozone).length>0);
 assert.equal(newRealmOnAction(frozone).length,0);
});

test('Korra alterna Acqua e Terra; Ponyo purifica un alleato e si cura solo se riesce',()=>{
 const korra=action('korra','Frusta dell Oceano');
 assert.equal(newRealmOnAction(korra).length,0);
 korra.move=MOVES_DB['Pugno della Terra Viva'];
 assert.ok(newRealmOnAction(korra).length>0);
 assert.equal(korra.attacker.newRealmCharges,1);
 const ponyo=battleFighter('ponyo');
 const ally=battleFighter('vaiana');
 ally.statuses=[{type:'Confuso',turns:2}];
 ponyo.hp=60;
 const ctx={char:ponyo,player:'p1',idx:0,teams:{p1:[ponyo,ally]},
  field:{p1:[0,1]},mode:'classica',settings:{},heal,random:()=>0};
 const result=newRealmOnEndTurn(ctx);
 assert.ok(result.some(e=>e.type==='status_update'));
 assert.ok(result.some(e=>e.type==='damage'));
 assert.equal(ally.statuses.length,0);
 assert.ok(ponyo.hp>60);
 assert.deepEqual(newRealmOnEndTurn(ctx),[]);
 const bucket=MOVES_DB['Magia del Secchiello'];
 assert.equal(bucket.targetMode,'team');
 assert.equal(bucket.statusEffect.type,'Scudo Team');
 assert.equal(bucket.statusEffect.turns,3);
});
