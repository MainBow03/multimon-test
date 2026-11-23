import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

import {CHARACTERS} from '../src/data/characters.js';
import {MOVES_DB} from '../src/data/moves.js';
import {CHAR_PRICES} from '../src/data/prices.js';
import {RECENT_ARRIVALS_IDS,recentArrivalCharacters} from '../src/data/recentArrivals.js';
import {MASTERY_CHARACTER_TITLES} from '../src/data/masteryTitles.js';
import {ULTIMON_ENTRANCE_LINES} from '../src/systems/ultimonEntranceLines.js';
import {ULTIMON_DUPLICATE_REACTIONS} from '../src/systems/ultimonDuplicateLines.js';
import {CRYSTAL_ROCK_SOUND_BUG_MOVES as MOVES,
 CRYSTAL_ROCK_SOUND_BUG_CHARACTERS as NEW} from '../src/data/crystalRockSoundBugChampions.js';
import {applyBattleStatModifier} from '../src/systems/statBalance.js';
import {crystalRockOnAction,crystalRockOnDamage,crystalRockOnEndTurn,
 crystalRockOnEnter,crystalBarrierFactor,crystalRockDamageFactor} from '../src/systems/crystalRockSoundBugEffects.js';

const ids=['kida','rarity','bismuth','hessonite','phosphophyllite','theboulder',
 'obelix','korg','goliath','mangiarocce','miguelrivera','blackcanary',
 'mayalape','bluebeetle','kamenriderkabuto'];
const types={
 kida:['Cristallo','Acqua'],rarity:['Cristallo','Folletto'],
 bismuth:['Cristallo','Robot'],hessonite:['Cristallo','Fuoco'],
 phosphophyllite:['Cristallo','Aria'],theboulder:['Roccia','Lotta'],
 obelix:['Roccia','Normale'],korg:['Roccia','Fuoco'],
 goliath:['Roccia','Aria'],mangiarocce:['Roccia','Terra'],
 miguelrivera:['Suono','Spettro'],blackcanary:['Suono','Aria'],
 mayalape:['Insetto','Folletto'],bluebeetle:['Insetto','Robot'],
 kamenriderkabuto:['Insetto','Elettro']
};
const get=id=>CHARACTERS.find(x=>x.id===id);
const heal=(char,amount)=>{const before=char.hp;char.hp=Math.min(char.maxHp,char.hp+amount);return char.hp-before};
const f=id=>{
 const char=structuredClone(get(id));
 for(const k of ['atk','def','spd','spAtk','spDef'])
  char['base'+k[0].toUpperCase()+k.slice(1)]=char[k];
 char.statuses=[];
 return char;
};
function ctx(id,name){
 const attacker=f(id),ally=f('vaiana'),foe=f('frozone');
 return {attacker,move:MOVES_DB[name],turn:1,player:'p1',idx:0,
  teams:{p1:[attacker,ally],p2:[foe]},field:{p1:[0,1],p2:[0]},
  targets:[{player:'p2',idx:0,char:foe}],mode:'classica',settings:{},
  heal,applyStat:applyBattleStatModifier,random:()=>0};
}

test('15 nuovi Multimon, 60 mosse singole e zero Pokemon',()=>{
 assert.deepEqual(NEW.map(c=>c.id),ids);
 assert.equal(Object.keys(MOVES).length,60);
 const names=new Set(),pictures=new Set();
 for(const id of ids){
  const list=CHARACTERS.filter(c=>c.id===id);
  assert.equal(list.length,1,id);
  const c=list[0],spec=NEW.find(x=>x.id===id);
  assert.deepEqual(c.types,types[id]);
  assert.equal(c.moves.length,4,id);
  assert.ok(c.passive?.name&&c.passive?.desc&&c.passive?.type,id);
  assert.ok(c.hp>0&&c.atk>0&&c.def>0&&c.spd>0);
  assert.ok(!c.isCampaignMonster&&!c.isSummonOnly);
  assert.ok(c.img.startsWith('https://'),id);
  assert.match(c.img,/\.(?:png|jpe?g)(?:\?.*)?$/i,id+' immagine non trasparente');
  assert.ok(!pictures.has(c.img));pictures.add(c.img);
  assert.ok(CHAR_PRICES[id]>=150,id+' costo');
  assert.ok(MASTERY_CHARACTER_TITLES[id]?.length>=14,id+' titolo padronanza');
  assert.ok(ULTIMON_ENTRANCE_LINES[id]?.length>16,id+' presentazione Ultimon');
  assert.ok(ULTIMON_DUPLICATE_REACTIONS[id]?.length>16,id+' doppione Ultimon');
  assert.deepEqual(c.moves.map(m=>m.name),spec.moveNames);
  for(const m of c.moves){
   assert.equal(m,MOVES_DB[m.name],m.name+' database mosse');
   assert.ok(!names.has(m.name),m.name+' non condivisa con altri nuovi');
   names.add(m.name);
  }
 }
 assert.equal(names.size,60);
 assert.ok(!NEW.some(c=>/pokemon|eevee|pikachu/i.test(c.name)));
 const support=Object.values(MOVES).filter(m=>m.power===0);
 assert.ok(support.length>=20,'Il supporto deve essere vario, non limitato a pochi personaggi');
});

test('Ricalcolo di 208 giocabili e Nuovi Arrivi nell ordine esatto',()=>{
 assert.deepEqual(RECENT_ARRIVALS_IDS.slice(0,15),ids);
 assert.deepEqual(recentArrivalCharacters(CHARACTERS).slice(0,15).map(c=>c.id),ids);
 const roster=CHARACTERS.filter(c=>!c.isSummonOnly&&!c.isCampaignMonster);
 assert.equal(roster.length,211);
 const count=t=>roster.filter(c=>c.types.includes(t)).length;
 assert.equal(count('Cristallo'),11);
 assert.equal(count('Roccia'),14);
 assert.equal(count('Suono'),12);
 assert.equal(count('Insetto'),14);
 assert.equal(count('Acqua'),19);
});

test('Nuove immagini ed effetti richiesti per i dodici del gruppo precedente',()=>{
 const images={
  mushu:'https://i.pinimg.com/736x/b6/32/8e/b6328ec0392d86c9c9e5684250dcf487.jpg',
  hakudrago:'https://i.pinimg.com/1200x/cb/b6/9f/cbb69f1284a830718d4240d7b31f7ee7.jpg',
  shenron:'https://i.pinimg.com/736x/0e/e4/c4/0ee4c4fa00a5e9cf58114291ad4dcea3.jpg',
  billcipher:'https://i.pinimg.com/736x/a5/eb/8d/a5eb8d7edf65c88d0f9dbcc004d0934d.jpg',
  senzavolto:'https://i.pinimg.com/1200x/f2/56/1d/f2561d523202beab275e1c92b1d4fe64.jpg',
  hornet:'https://i.pinimg.com/736x/40/21/7e/40217e9487290bf568e819a7268d1045.jpg',
  frozone:'https://i.pinimg.com/736x/8d/90/25/8d90256016c8ab28793b2a78b10122f2.jpg'
 };
 for(const [id,img] of Object.entries(images))assert.equal(get(id).img,img,id);
 assert.equal(MOVES_DB['Promessa del Drago'].maxUses,4);
 assert.equal(MOVES_DB['Promessa del Drago'].heal,.5);
 assert.equal(MOVES_DB['Caos Triangolare'].accuracy,.9);
 assert.equal(MOVES_DB['Silenzio del Treno'].targetCount,2);
 assert.equal(MOVES_DB['Silenzio del Treno'].targetStatDebuff.spd,.7);
 assert.equal(MOVES_DB['Maschera Vuota'].selfStatBuff.def,1.2);
 assert.equal(MOVES_DB['Maschera Vuota'].statusEffect.type,'Malinconia');
 assert.equal(MOVES_DB['Filo Scarlatto'].power,70);
 assert.equal(MOVES_DB['Danza dell Ago'].maxUses,5);
 assert.equal(get('baxterstockman').passive.maxTriggersPerEnemy,2);
 assert.equal(MOVES_DB['Muta Instabile'].heal,.4);
 assert.equal(MOVES_DB['Corrente Guida'].heal,.4);
 assert.equal(MOVES_DB['Onda del Viaggio'].statusEffect.chance,.18);
 assert.equal(MOVES_DB['Onda del Viaggio'].statusEffect.type,'Stordito');
 assert.equal(MOVES_DB['Canto della Laguna'].statusEffect.type,'Addormentato');
 assert.equal(MOVES_DB['Canto della Laguna'].statusEffect.chance,.2);
 assert.ok(MOVES_DB['Marea del Re'].targetCount>=4);
 assert.equal(MOVES_DB['Gelo Radente'].statusEffect.type,'Assiderato');
 assert.equal(MOVES_DB['Gelo Radente'].statusEffect.chance,.2);
 assert.equal(MOVES_DB['Occhi sul Ghiaccio'].maxUses,3);
 assert.equal(MOVES_DB['Zero sul Termometro'].maxUses,3);
 assert.equal(MOVES_DB['Magia del Secchiello'].statusEffect.type,'Scudo Team');
 assert.equal(MOVES_DB['Magia del Secchiello'].statusEffect.turns,3);
 assert.equal(get('ponyo').passive.chance,.3);
 assert.equal(get('ponyo').passive.healPercent,.1);
});

test('Malinconia: status 3-5 turni, calo difesa 10%, non si riapplica',()=>{
 const src=readFileSync(new URL('../src/systems/battleSystem.js',import.meta.url),'utf8');
 assert.match(src,/effect\.type === 'Malinconia'.*Math\.floor\(Math\.random\(\) \* 3\) \+ 3/);
 assert.match(src,/if\(effect\.type==='Malinconia'&&existingIdx>=0\)/);
 assert.match(src,/applyBattleStatModifier\(char,'def',\.9\)/);
 assert.match(src,/melancholy\.turns-=1/);
 assert.match(src,/Malinconia/);
});

test('Cupola di Kida e Vetrata di Rarity sono due barriere diverse con scadenza',()=>{
 const k=ctx('kida','Cupola Atlantidea');
 const out=crystalRockOnAction(k);
 assert.ok(out.some(e=>e.type==='status_update'));
 const shield=k.attacker.statuses.find(s=>s.type==='Barriera Minerale');
 assert.equal(shield.reduce,.2);
 assert.equal(shield.turns,2);
 assert.equal(crystalBarrierFactor(k.attacker,{special:false}),.8);
 const rarity=ctx('rarity','Vetrata Reale');
 crystalRockOnAction(rarity);
 assert.equal(crystalBarrierFactor(rarity.attacker,{special:false}),1);
 assert.equal(crystalBarrierFactor(rarity.attacker,{special:true}),.75);
 const opts={char:k.attacker,player:'p1',idx:0,teams:k.teams,field:k.field,mode:'classica',settings:{},heal,applyStat:applyBattleStatModifier};
 crystalRockOnEndTurn(opts);
 assert.equal(shield.turns,2,'il turno del lancio non consuma la barriera');
 crystalRockOnEndTurn(opts);
 crystalRockOnEndTurn(opts);
 assert.equal(crystalBarrierFactor(k.attacker,{special:false}),1);
});

test('Kida alla soglia cura 20% e protegge la squadra; Phos si velocizza dopo danno',()=>{
 const k=ctx('kida','Schegge di Atlantide');
 k.attacker.hp=43;
 const opts={char:k.attacker,player:'p1',idx:0,teams:k.teams,field:k.field,
  mode:'classica',settings:{},damage:25,turn:1,heal,applyStat:applyBattleStatModifier};
 const e=crystalRockOnDamage(opts);
 assert.ok(e.some(x=>x.type==='damage'));
 assert.ok(k.attacker.hp>43);
 assert.equal(crystalBarrierFactor(k.teams.p1[1],{special:false}),.85);
 assert.deepEqual(crystalRockOnDamage(opts),[]);
 const p=ctx('phosphophyllite','Lama Fosforescente');
 p.attacker.hp=40;
 const ev=crystalRockOnDamage({...opts,char:p.attacker,teams:p.teams,field:p.field});
 assert.ok(ev.some(x=>x.text.includes('Velocita +20%')));
 assert.ok(p.attacker.spd>p.attacker.baseSpd);
});

test('Rarity, Bismuth e Miguel attivano supporti distinti con limiti',()=>{
 const rarity=ctx('rarity','Abito da Gala');rarity.teams.p1[1].hp=30;
 assert.ok(crystalRockOnAction(rarity).some(e=>e.type==='damage'));
 assert.ok(rarity.attacker.spDef>rarity.attacker.baseSpDef);
 const forge=ctx('bismuth','Martello di Bismuto');
 assert.ok(crystalRockOnAction(forge).length>0);
 assert.equal(crystalRockOnAction(forge).length,0);
 const miguel=ctx('miguelrivera','Accordo dell Aldila');miguel.teams.p1[1].hp=30;
 assert.ok(crystalRockOnAction(miguel).some(e=>e.type==='damage'));
 assert.equal(crystalRockOnAction(miguel).length,0);
});

test('Korg e Canary hanno bonus condizionati; Goliath resiste ai rallentamenti iniziali',()=>{
 const korg=f('korg');
 korg.hp=Math.floor(korg.maxHp*.5);
 assert.equal(crystalRockDamageFactor(korg,MOVES_DB['Pugno di Basalto']),1.15);
 assert.equal(crystalRockDamageFactor(korg,MOVES_DB['Menhir Volante']),1.15);
 assert.equal(crystalRockDamageFactor(korg,MOVES_DB['Bolla Birichina']),1);
 const canary=f('blackcanary');
 assert.equal(crystalRockDamageFactor(canary,MOVES_DB['Canary Cry'],true),1.15);
 assert.equal(crystalRockDamageFactor(canary,MOVES_DB['Canary Cry'],false),1);
 const goliath=f('goliath');
 assert.equal(crystalRockOnEnter(goliath,applyBattleStatModifier),true);
 assert.equal(crystalRockOnEnter(goliath,applyBattleStatModifier),false);
 assert.equal(applyBattleStatModifier(goliath,'spd',.8),false);
 crystalRockOnEndTurn({char:goliath,player:'p1',idx:0,
   teams:{p1:[goliath]},field:{p1:[0]},mode:'classica',settings:{},heal,applyStat:applyBattleStatModifier});
 assert.equal(goliath.stoneGuardActive,false);
 assert.equal(applyBattleStatModifier(goliath,'spd',.8),true);
});

test('Marcia Cremisi scade dopo 3 turni completi e ripristina la statistica',()=>{
 const h=ctx('hessonite','Marcia Cremisi');
 const before=h.attacker.spd;
 crystalRockOnAction(h);
 assert.ok(h.attacker.spd>before);
 const opts={char:h.attacker,player:'p1',idx:0,teams:h.teams,field:h.field,
  mode:'classica',settings:{},heal,applyStat:applyBattleStatModifier};
 for(let i=0;i<4;i++)crystalRockOnEndTurn(opts);
 assert.equal(h.attacker.spd,before);
 assert.equal(h.attacker.statuses.some(x=>x.type==='Marcia Cremisi'),false);
});

test('Scarabeo Adattivo reagisce una volta ai colpi fisici e speciali; Mangiarocce assorbe Roccia',()=>{
 const b=ctx('bluebeetle','Lama dello Scarabeo');
 const attacker=b.teams.p2[0];
 const opts={char:b.attacker,player:'p1',idx:0,teams:b.teams,field:b.field,
  mode:'classica',settings:{},attacker,attackerPlayer:'p2',attackerIdx:0,
  damage:15,turn:1,heal,applyStat:applyBattleStatModifier};
 const initial=b.attacker.atk;
 assert.ok(crystalRockOnDamage({...opts,move:MOVES_DB['Menhir Volante']}).length>0);
 assert.ok(b.attacker.atk>initial);
 assert.deepEqual(crystalRockOnDamage({...opts,move:MOVES_DB['Menhir Volante']}),[]);
 const old=b.attacker.spAtk;
 assert.ok(crystalRockOnDamage({...opts,move:MOVES_DB['Canto della Laguna']}).length>0);
 assert.ok(b.attacker.spAtk>old);
 const rock=ctx('mangiarocce','Morso di Scogliera');rock.attacker.hp=75;
 const hit={...opts,char:rock.attacker,teams:rock.teams,field:rock.field,move:MOVES_DB['Menhir Volante']};
 assert.ok(crystalRockOnDamage(hit).some(e=>e.type==='damage'));
 assert.ok(rock.attacker.hp>75);
 assert.deepEqual(crystalRockOnDamage(hit),[]);
});

test('Maya l Ape toglie un malus e cura del 10% alleato, non se nessuno e affetto',()=>{
 const may=ctx('mayalape','Puntura Dorata');
 const ally=may.teams.p1[1];
 ally.hp=50;ally.statuses=[{type:'Malinconia',turns:3}];
 const opts={char:may.attacker,player:'p1',idx:0,teams:may.teams,field:may.field,
  mode:'classica',settings:{},heal,applyStat:applyBattleStatModifier,random:()=>0};
 const events=crystalRockOnEndTurn(opts);
 assert.ok(events.some(x=>x.type==='status_update'));
 assert.ok(events.some(x=>x.type==='damage'));
 assert.equal(ally.statuses.length,0);
 assert.ok(ally.hp>50);
 assert.deepEqual(crystalRockOnEndTurn(opts),[]);
});
