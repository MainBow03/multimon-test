import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {MOVES_DB} from '../src/data/moves.js';
import {CHAR_PRICES} from '../src/data/prices.js';
import {applyBattleStatModifier} from '../src/systems/statBalance.js';
import {calculateDamageImpl} from '../src/systems/battleSystem.js';
import {totalEvasionChance} from '../src/systems/rainstorm.js';
import {
 beginHakiGuard,tickHakiGuard,shortenHakiDebuff,hakiStatDebuffMultiplier,
 strawHatCritBonus,strawHatDefenseFactor,namiClimateFactor,
 applyNamiMirage,applyGuardPoint,reduceGuardPointDamage,clearZoroBlind,
 chopperEntryAid
} from '../src/systems/strawHatEffects.js';

const crew=['luffy','zoro','nami','chopper'];
const clone=id=>structuredClone(CHARACTERS.find(c=>c.id===id));
const basic=id=>({...clone(id),baseAtk:clone(id).atk,baseDef:clone(id).def,
 baseSpd:clone(id).spd,spAtk:clone(id).spAtk??clone(id).atk,
 spDef:clone(id).spDef??clone(id).def,statuses:[]});

test('I quattro nuovi personaggi sono nel roster, senza doppioni, con immagine e prezzo',()=>{
 for(const id of crew){
  const list=CHARACTERS.filter(c=>c.id===id);
  assert.equal(list.length,1,id+' nel roster una sola volta');
  const ch=list[0];
  assert.equal(ch.moves.length,4);
  assert.ok(ch.moves.every(Boolean),id+' deve avere quattro mosse valide');
  assert.ok(ch.img.startsWith('https://'),id+' deve avere un ritratto');
  assert.ok(ch.passive?.name);
  assert.equal(ch.price,CHAR_PRICES[id]);
  assert.ok(ch.price>=150&&ch.price<=300);
 }
 assert.deepEqual(clone('luffy').types,['Lotta','Magico']);
 assert.deepEqual(clone('zoro').types,['Lotta','Terra']);
 assert.deepEqual(clone('nami').types,['Acqua','Aria']);
 assert.deepEqual(clone('chopper').types,['Normale','Lotta']);
 assert.equal(clone('luffy').img,'https://i.pinimg.com/736x/21/61/91/2161915be009cacce21defa24cc74cfa.jpg');
 assert.equal(clone('nami').img,'https://i.pinimg.com/736x/ae/60/76/ae607673ca5a12fa09c795cb5abc5451.jpg');
 assert.equal(clone('chopper').img,'https://i.pinimg.com/1200x/d2/30/34/d2303406abaeb828122b55ddacc8a2a9.jpg');
});

test('Pistola Gom Gom ha potenza 80 e 25% di ridurre la difesa',()=>{
 const move=MOVES_DB['Pistola Gom Gom'];
 assert.equal(move.power,80);
 assert.equal(move.accuracy,1);
 assert.deepEqual(move.hitStatDebuff,{def:0.85,chance:0.25});
 assert.equal(MOVES_DB['Jet Gatling'].multiHit.min,3);
 assert.equal(MOVES_DB['Jet Gatling'].multiHit.max,3);
 assert.equal(MOVES_DB['Red Hawk Supremo'].maxUses,1);
 assert.equal(MOVES_DB['Red Hawk Supremo'].strictUses,true);
});

test('Haki dell’Armatura applica esattamente i tre buff e attenua i malus futuri',()=>{
 const move=MOVES_DB['Haki dell’Armatura'];
 assert.deepEqual(move.statBuff,{atk:1.25,def:1.15,spd:1.05});
 assert.equal(move.hakiGuardTurns,3);
 const l=basic('luffy');
 assert.equal(beginHakiGuard(l),3);
 const freshAtk=l.atk;
 assert.equal(applyBattleStatModifier(l,'atk',0.70),true);
 assert.equal(l.atk,Math.floor(freshAtk-l.baseAtk*0.15));
 assert.equal(tickHakiGuard(l),3,'il turno di lancio non consuma la protezione');
 assert.equal(tickHakiGuard(l),2);
 assert.equal(tickHakiGuard(l),1);
 assert.equal(tickHakiGuard(l),0);
 const atkBefore=l.atk;
 applyBattleStatModifier(l,'atk',0.70);
 assert.ok(l.atk<=atkBefore-30,'senza Haki si subisce il malus pieno');
});

test('Haki dimezza le durate dei nuovi status negativi, senza influire sui positivi',()=>{
 const l=basic('luffy');
 beginHakiGuard(l,3);
 const poison={type:'Avvelenato',turns:4};
 assert.equal(shortenHakiDebuff(l,poison),true);
 assert.equal(poison.turns,2);
 const status={type:'Rigenerazione',turns:4};
 assert.equal(shortenHakiDebuff(l,status),false);
 assert.equal(status.turns,4);
 const other=basic('nami');
 assert.equal(shortenHakiDebuff(other,{type:'Avvelenato',turns:4}),false);
});

test('Zoro ha critici leggermente più frequenti e penetrazione solo su mosse fisiche',()=>{
 const z=basic('zoro'),target=basic('chopper');
 assert.equal(strawHatCritBonus(z,MOVES_DB['Oni Giri']),0.2);
 assert.equal(strawHatCritBonus(z,MOVES_DB['Asura']),0.1);
 assert.equal(strawHatDefenseFactor(z,MOVES_DB['Oni Giri']),0.9);
 assert.equal(strawHatDefenseFactor(z,{type:'Magico',power:90,special:true}),1);
 assert.equal(strawHatDefenseFactor(basic('luffy'),MOVES_DB['Oni Giri']),1);
 const damaged=calculateDamageImpl({},z,target,MOVES_DB['Oni Giri'],1,false,()=>0.2);
 const normal=calculateDamageImpl({}, {...z,passive:{}},target,MOVES_DB['Oni Giri'],1,false,()=>0.2);
 assert.ok(damaged>normal);
 z.statuses=[{type:'Accecato',turns:2},{type:'Avvelenato',turns:3}];
 assert.equal(clearZoroBlind(z),true);
 assert.deepEqual(z.statuses.map(s=>s.type),['Avvelenato']);
});

test('Nami trae vantaggio solo da pioggia e non cumula Miraggio Ladresco',()=>{
 const nami=basic('nami'),rain={type:'rainstorm',turns:4},clear=null;
 assert.equal(namiClimateFactor(nami,MOVES_DB['Raffica del Clima'],rain),1.15);
 assert.equal(namiClimateFactor(nami,MOVES_DB['Tempesta di Zeus'],clear),1);
 assert.equal(namiClimateFactor(nami,{type:'Fuoco'},rain),1);
 assert.equal(namiClimateFactor(basic('luffy'),MOVES_DB['Raffica del Clima'],rain),1);
 assert.ok(Math.abs(totalEvasionChance(nami,rain)-0.10)<1e-9);
 assert.equal(totalEvasionChance(nami,clear),0);
 assert.equal(applyNamiMirage(nami),0.15);
 assert.equal(applyNamiMirage(nami),0);
 assert.equal(nami.evasionBonus,0.15);
 assert.ok(totalEvasionChance(nami,rain)>.2);
 assert.equal(MOVES_DB['Pioggia del Clima-Tact'].rainstormChance,1);
 assert.equal(MOVES_DB['Tempesta di Zeus'].statusEffect.chance,0.25);
});

test('Guard Point protegge il prossimo colpo ma non blocca i colpi successivi',()=>{
 const ch=basic('chopper');
 assert.equal(applyGuardPoint(ch,0.20),true);
 assert.deepEqual(reduceGuardPointDamage(ch,100),{damage:80,activated:true});
 assert.deepEqual(reduceGuardPointDamage(ch,100),{damage:100,activated:false});
 assert.deepEqual(MOVES_DB['Guard Point'].statBuff,{def:1.25,spDef:1.10});
 assert.equal(MOVES_DB['Cura d’Emergenza'].heal,0.30);
 assert.equal(MOVES_DB['Cura d’Emergenza'].targetMode,'ally');
 assert.equal(MOVES_DB['Cura d’Emergenza'].removeNegativeStatuses,true);
 assert.equal(MOVES_DB['Monster Point'].costHpPercent,0.10);
 assert.equal(MOVES_DB['Monster Point'].maxUses,1);
});

test('Medico di Bordo cura l’alleato più ferito anche in Co-op e rimuove uno status',()=>{
 const teams={p1:[basic('chopper')],p2:[basic('nami')],p3:[basic('zoro')],p4:[basic('luffy')]};
 teams.p1[0].hp=95;
 teams.p2[0].hp=30;
 teams.p2[0].statuses=[{type:'Scottato',turns:3},{type:'Confuso',turns:2}];
 teams.p3[0].hp=40;
 teams.p4[0].hp=3;
 const field={p1:[0],p2:[0],p3:[0],p4:[0]};
 const copy=structuredClone(teams.p4);
 const result=chopperEntryAid(teams,field,'p1','juggernaut',{juggernautPlayer:'p4'},.12);
 assert.equal(result.player,'p2');
 assert.equal(result.removed,'Scottato');
 assert.equal(teams.p2[0].hp,30+Math.floor(teams.p2[0].maxHp*.12));
 assert.deepEqual(teams.p4,copy,'non deve curare avversari');
 assert.equal(teams.p2[0].statuses.length,1);
 const full={p1:[basic('chopper')]};
 assert.equal(chopperEntryAid(full,{p1:[0]},'p1','classica',{},.12),null);
});

test('Il motore esegue i bonus speciali e mostra la durata nella UI',()=>{
 const engine=readFileSync(new URL('../src/systems/battleSystem.js',import.meta.url),'utf8');
 const view=readFileSync(new URL('../src/screens/battle/BattlingView.jsx',import.meta.url),'utf8');
 assert.match(engine,/strawHatDefenseFactor\(attacker,move\)/);
 assert.match(engine,/strawHatCritBonus\(attacker,move\)/);
 assert.match(engine,/namiClimateFactor\(args\[0\],args\[2\],workingWeather\)/);
 assert.match(engine,/beginHakiGuard\(attacker,move.hakiGuardTurns\)/);
 assert.match(engine,/tickHakiGuard\(char\)/);
 assert.match(engine,/chopperEntryAid\(workingTeams,workingField,p,gameMode,settings,char.passive.crewMedicHeal\)/);
 assert.match(engine,/reduceGuardPointDamage\(target,dmg\)/);
 assert.match(engine,/shortenHakiDebuff\(t.char,newStatus\)/);
 assert.match(view,/char.hakiGuardTurns>0/);
});

test('Haki dimezza anche malus alla precisione',()=>{
 const l=basic('luffy');
 beginHakiGuard(l);
 assert.equal(hakiStatDebuffMultiplier(l,0.60),0.80);
 assert.equal(hakiStatDebuffMultiplier(l,0.80),0.90);
 assert.equal(hakiStatDebuffMultiplier(l,1.20),1.20);
 const engine=readFileSync(new URL('../src/systems/battleSystem.js',import.meta.url),'utf8');
 assert.match(engine,/hakiStatDebuffMultiplier\(t.char,move.targetStatDebuff.acc\)/);
 assert.match(engine,/hakiStatDebuffMultiplier\(t.char,move.hitStatDebuff.acc\)/);
});
