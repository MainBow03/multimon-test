import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {MOVES_DB} from '../src/data/moves.js';
import {CHAR_PRICES} from '../src/data/prices.js';
import {TYPES} from '../src/data/types.js';
import {MASTERY_CHARACTER_TITLES} from '../src/data/masteryTitles.js';
import {GAME_UPDATES} from '../src/data/updateHistory.js';
import {
 newcomerDamageFactor,recordSpyExposure,cloverExtraEvasion,
 triggerCloverDodge,triggerStarWand,resolveBlueberryAction,resetNewcomerTurnFlags
} from '../src/systems/newcomerEffects.js';

const ids=['starbutterfly','samtotallyspies','clover','superman','blueberrymuffin'];
const pictures=[
 'https://i.pinimg.com/1200x/10/51/cd/1051cd075891f0bb75a09ebb7f61c390.jpg',
 'https://i.pinimg.com/1200x/84/cc/a7/84cca794b321b2320ab89404efbe575a.jpg',
 'https://i.pinimg.com/1200x/13/15/31/1315318411e2d9861f5b4362b15cdff2.jpg',
 'https://i.pinimg.com/1200x/fa/a1/6f/faa16fca17e71cec4ecc74fcde1e8a8d.jpg',
 'https://i.pinimg.com/736x/07/72/5d/07725d038239d9b88a6de2f11d31829f.jpg'
];
const get=id=>{
 const char=CHARACTERS.find(c=>c.id===id);
 assert.ok(char,id+' assente dal roster');
 return structuredClone({...char,baseAtk:char.atk,baseDef:char.def,baseSpd:char.spd,
  spAtk:char.spAtk??char.atk,spDef:char.spDef??char.def,statuses:[]});
};
const move=(name,type,power)=>({name,type,power});

test('I cinque personaggi sono giocabili, unici, con immagini e prezzi richiesti',()=>{
 ids.forEach((id,i)=>{
  assert.equal(CHARACTERS.filter(c=>c.id===id).length,1,id);
  const char=get(id);
  assert.equal(char.img,pictures[i]);
  assert.equal(char.hp,char.maxHp);
  assert.ok(char.atk>0&&char.def>0&&char.spd>0);
  assert.ok(!char.isCampaignMonster&&!char.isSummonOnly&&!char.isSecretUnlock);
  assert.equal(char.types.length,2);
  char.types.forEach(t=>assert.ok(TYPES.includes(t),t));
  assert.ok(char.price>0);
 });
 assert.deepEqual(ids.map(id=>CHAR_PRICES[id]),[260,180,180,350,160]);
});

test('20 mosse differenti: tutte registrate, valide e con PP coerenti',()=>{
 const all=[];
 for(const id of ids){
  const c=get(id);
  assert.equal(c.moves.length,4,id);
  for(const m of c.moves){
   assert.ok(m?.name,id+' senza mossa');
   assert.equal(MOVES_DB[m.name]?.name,m.name);
   assert.ok(TYPES.includes(m.type),m.name);
   assert.ok(m.power>=0&&m.power<=150);
   assert.ok(m.accuracy===undefined||(m.accuracy>0&&m.accuracy<=1),m.name);
   assert.ok(m.maxUses!==undefined,m.name+' non normalizzata');
   all.push(m.name);
  }
 }
 assert.equal(new Set(all).size,20,'Le mosse dei nuovi Multimon non devono essere doppioni');
});

test('La magia capricciosa di Star è casuale ma massimo una attivazione per turno',()=>{
 const star=get('starbutterfly'),enemy=get('superman');
 star.hp=50;
 let dice=0;
 const a=triggerStarWand(star,enemy,()=>dice++);
 // first 0 => attivazione; second 1 => effetto rallentamento bersaglio
 assert.ok(a?.text.includes('Bacchetta')||a?.text.includes('magia'));
 assert.equal(star.starWandCheckedThisTurn,true);
 assert.equal(triggerStarWand(star,enemy,()=>0),null,'Non si attiva due volte nello stesso turno');
 resetNewcomerTurnFlags(star);
 const previousHp=star.hp;
 const healed=triggerStarWand(star,enemy,()=>0);
 assert.ok(healed?.heal>0);
 assert.ok(star.hp>previousHp);
 resetNewcomerTurnFlags(star);
 assert.equal(triggerStarWand(star,enemy,()=>.99),null,'35% non significa effetto garantito');
});

test('Sam impara solo il tipo già subìto, la strategia cambia quando cambia il tipo',()=>{
 const sam=get('samtotallyspies'),attacker=get('starbutterfly');
 const magic=move('Bacchetta a Sorpresa','Magico',80);
 const ice=move('Soffio Artico','Ghiaccio',75);
 assert.equal(newcomerDamageFactor(attacker,sam,magic),1);
 assert.equal(recordSpyExposure(sam,magic,0),false);
 assert.equal(newcomerDamageFactor(attacker,sam,magic),1);
 assert.equal(recordSpyExposure(sam,magic,10),true);
 assert.equal(newcomerDamageFactor(attacker,sam,magic),.75);
 assert.equal(newcomerDamageFactor(attacker,sam,ice),1);
 recordSpyExposure(sam,ice,15);
 assert.equal(newcomerDamageFactor(attacker,sam,ice),.75);
 assert.equal(newcomerDamageFactor(attacker,sam,magic),1);
 assert.equal(newcomerDamageFactor(attacker,sam,move('Difesa','Psico',0)),1);
});

test('Clover ha elusione aggiuntiva, il bonus reattivo non si accumula nello stesso turno',()=>{
 const clover=get('clover');
 assert.equal(cloverExtraEvasion(clover),.12);
 assert.equal(triggerCloverDodge(clover),true);
 const first=clover.atk;
 assert.ok(first>clover.baseAtk);
 assert.equal(triggerCloverDodge(clover),false);
 assert.equal(clover.atk,first);
 resetNewcomerTurnFlags(clover);
 assert.equal(triggerCloverDodge(clover),true);
 assert.ok(clover.atk>=first);
 const normal=get('superman');
 assert.equal(cloverExtraEvasion(normal),0);
 assert.equal(triggerCloverDodge(normal),false);
});

test('Superman è resistente ai colpi ordinari, ma vulnerabile alla magia',()=>{
 const sup=get('superman'),attack=get('clover');
 assert.equal(newcomerDamageFactor(attack,sup,move('Punch','Lotta',90)),.8);
 assert.equal(newcomerDamageFactor(attack,sup,move('Massive','Lotta',118)),1);
 assert.equal(newcomerDamageFactor(attack,sup,move('Spell','Magico',60)),1.25);
 assert.equal(newcomerDamageFactor(attack,sup,move('Status','Magico',0)),1);
});

test('Blueberry accumula fino a 2 Appunti e li consuma sul successivo colpo riuscito',()=>{
 const blue=get('blueberrymuffin'),defender=get('superman');
 const recipe=MOVES_DB['Ricetta Annotata'],cake=MOVES_DB['Torta di Mezzanotte'];
 assert.equal(newcomerDamageFactor(blue,defender,move('Torta','Folletto',108)),1);
 assert.match(resolveBlueberryAction(blue,recipe,true),/1\/2/);
 assert.equal(newcomerDamageFactor(blue,defender,move('Torta','Folletto',108)),1.2);
 assert.match(resolveBlueberryAction(blue,MOVES_DB['Appunti Rivelatori'],true),/2\/2/);
 assert.equal(newcomerDamageFactor(blue,defender,move('Torta','Folletto',108)),1.4);
 assert.equal(resolveBlueberryAction(blue,recipe,true),null,'Nessun terzo appunto');
 assert.equal(resolveBlueberryAction(blue,cake,false),null,'Mossa annullata non consuma');
 assert.equal(blue.blueberryNotes,2);
 assert.match(resolveBlueberryAction(blue,cake,true),/\+40%/);
 assert.equal(blue.blueberryNotes,0);
 resetNewcomerTurnFlags(blue);
 assert.equal(blue.blueberryNotes,0);
});

test('Cinque titoli di Padronanza distinti e registrati',()=>{
 const titles=ids.map(id=>MASTERY_CHARACTER_TITLES[id]);
 assert.equal(titles.every(t=>typeof t==='string'&&t.length>=7),true);
 assert.equal(new Set(titles).size,5);
});

test('Le 5 passive sono tipi differenti e nessuna è decorativa',()=>{
 const kinds=ids.map(id=>get(id).passive?.type);
 assert.deepEqual(kinds,['wand_flux','spy_analysis','fashion_instinct','kryptonian_body','bookworm']);
 assert.equal(new Set(kinds).size,5);
 const battle=readFileSync(new URL('../src/systems/battleSystem.js',import.meta.url),'utf8');
 for(const word of ['newcomerDamageFactor(args[0],args[1],args[2])',
   'triggerStarWand(attacker,t.char)','recordSpyExposure(t.char,move,',
   'triggerCloverDodge(t.char)','cloverExtraEvasion(t.char)',
   'resolveBlueberryAction(attacker,move,attackSucceeded)',
   'resetNewcomerTurnFlags(fighter)']){
  assert.ok(battle.includes(word),'Meccanica scollegata: '+word);
 }
});

test('Aggiornamenti include i cinque personaggi e le meccaniche originali',()=>{
 const entry=GAME_UPDATES.find(x=>x.id==='nov4-five-new-original-multimon');
 assert.ok(entry);
 assert.equal(entry.category,'champions');
 assert.equal(entry.date,'04/11/2026');
 const details=entry.items.join(' ');
 for(const text of ['Star Butterfly','Sam','Clover','Superman','Blueberry Muffin','Appunti','Bacchetta Capricciosa'])
  assert.ok(details.includes(text),text);
});
