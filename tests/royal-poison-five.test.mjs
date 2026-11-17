import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {MOVES_DB} from '../src/data/moves.js';
import {CHAR_PRICES} from '../src/data/prices.js';
import {MASTERY_CHARACTER_TITLES} from '../src/data/masteryTitles.js';
import {NEGATIVE_STATUS_TYPES,activateNeutralizingSpray} from '../src/systems/newHeldAndPassiveEffects.js';
import {
 ROYAL_YZMA_STATUSES,royalStatusSnapshot,royalNewNegativeStatuses,royalStatus,
 royalCursedFlames,royalWolfVenom,royalPotionCanTarget,royalPotionApply,
 royalStatusDamageBonus,royalEffectiveMove,royalRotHealingAmount,royalHeal,
 royalApplyRot,royalRotTick,royalMedusaAgility,royalGrantPriority,
 royalConsumePriority,royalMedusaCanSummon,royalBuildMedusaSummon,royalMistTargets
} from '../src/systems/royalPoisonSystem.js';

const character=id=>CHARACTERS.find(c=>c.id===id);
const fresh=id=>{
 const c=structuredClone(character(id));c.statuses=[];
 for(const [key,base] of [['atk','baseAtk'],['def','baseDef'],['spd','baseSpd'],
  ['spAtk','baseSpAtk'],['spDef','baseSpDef']])c[base]=c[key];
 return c;
};
const source=path=>readFileSync(new URL(path,import.meta.url),'utf8');

test('Roster: esistono 5 nuovi giocabili + 1 evocazione con immagini e stats',()=>{
 const ids=['malefica','yzma','lavender','remedusa','malenia'];
 const types=[
  ['Fuoco','Veleno'],['Veleno'],['Veleno','Lotta'],
  ['Elettro','Veleno'],['Veleno','Luce']
 ];
 const urls=[
  'https://i.pinimg.com/736x/92/3d/8f/923d8f62001c6981302ac08cc4a0c641.jpg',
  'https://i.pinimg.com/736x/e2/ad/04/e2ad043e15f3f05392ea53e56eb5f7e3.jpg',
  'https://i.pinimg.com/736x/b1/25/e5/b125e53f4c8ca72fb8c47a8287e8ad86.jpg',
  'https://i.pinimg.com/736x/7a/56/f2/7a56f28dadf4931d51433e07d0dffe79.jpg'
 ];
 for(let i=0;i<ids.length;i++){
  const c=character(ids[i]);
  assert.equal(CHARACTERS.filter(x=>x.id===ids[i]).length,1);
  assert.deepEqual(c.types,types[i]);
  assert.equal(c.moves.length,4);
  assert.ok(c.moves.every(m=>m?.name&&m.type&&Number.isFinite(m.power)));
  assert.equal(c.maxHp,c.hp);
  for(const key of ['atk','def','spd','spAtk','spDef'])
   assert.ok(c[key]>0,'statistica assente: '+ids[i]+' '+key);
  assert.ok(c.img.startsWith('https://'));
  assert.equal(c.price,CHAR_PRICES[c.id]);
  assert.ok(MASTERY_CHARACTER_TITLES[c.id]?.length>15);
  if(urls[i])assert.equal(c.img,urls[i]);
 }
 const summon=character('medusaservitore');
 assert.equal(summon.isSummonOnly,true);
 assert.deepEqual(summon.types,['Elettro','Veleno']);
 assert.equal(summon.maxHp,60);
 assert.equal(summon.passive.type,'bodyguard');
 assert.equal(summon.passive.protectAlly,'Re Medusa');
 assert.deepEqual(summon.moves.map(m=>m.name),
   ['Zip Zap','Oh Mio Sire','Gelatina Appiccicosa','Puntura Reale']);
 assert.equal(summon.img,'https://i.pinimg.com/1200x/88/98/60/889860ff33614368f4839526525aa317.jpg');
});
test('Malefica: poteri, chance 15% bruciatura o veleno, 25% danni extra e due usi',()=>{
 const c=fresh('malefica'),enemy=fresh('shrek');
 assert.equal(c.passive.name,'Fiamme Maledette');
 assert.equal(royalCursedFlames(c,enemy,()=>.1499),'Scottato');
 assert.equal(royalCursedFlames(c,enemy,()=>.19),'Avvelenato');
 assert.equal(royalCursedFlames(c,enemy,()=>.3),null);
 assert.equal(royalCursedFlames(c,enemy,()=>.16),null,'no duplicate poison');
 const splash=MOVES_DB['Fuoco Fatato'];
 assert.equal(splash.type,'Fuoco');assert.equal(splash.power,85);
 assert.equal(splash.statusEffect.chance,.3);assert.equal(splash.royalSplash,10);
 assert.equal(MOVES_DB['Rovi Corrotti'].power,80);
 assert.deepEqual(MOVES_DB['Rovi Corrotti'].hitStatDebuff,{spd:.8,chance:.3});
 assert.equal(MOVES_DB['Rovi Corrotti'].statusEffect.chance,.2);
 assert.deepEqual(MOVES_DB['Maledizione Reale'].targetStatDebuff,{atk:.85,def:.85,spd:.85});
 assert.equal(MOVES_DB['Maledizione Reale'].maxUses,3);
 const dragon=MOVES_DB['Drago Smeraldo'];
 assert.equal(dragon.power,120);assert.equal(dragon.maxUses,2);
 assert.equal(royalStatusDamageBonus(c,enemy,dragon),1.25);
 enemy.statuses=[];assert.equal(royalStatusDamageBonus(c,enemy,dragon),1);
});
test('Yzma: Leva Sbagliata rileva soltanto status nuovi, non quelli già presenti',()=>{
 const yzma=fresh('yzma');
 assert.equal(yzma.passive.type,'wrong_lever');
 const before=royalStatusSnapshot(yzma);
 royalStatus(yzma,'Scottato');
 assert.deepEqual(royalNewNegativeStatuses(yzma,before),['Scottato']);
 const after=royalStatusSnapshot(yzma);
 assert.equal(royalStatus(yzma,'Scottato'),false);
 assert.deepEqual(royalNewNegativeStatuses(yzma,after),[]);
 assert.equal(yzma.passive.counterPower,80);
});
test('Yzma: Pozione applica uno dei 6 status al 100%, solo una volta per bersaglio',()=>{
 const yzma=fresh('yzma'),foe=fresh('shrek');
 const used=new Set();
 for(let i=0;i<6;i++){
  const y=fresh('yzma'),target=fresh('shrek');
  const effect=royalPotionApply(y,target,'p2',0,()=>i/6);
  assert.equal(effect,ROYAL_YZMA_STATUSES[i]);
  assert.ok(target.statuses.some(x=>x.type===effect));
  used.add(effect);
  assert.equal(royalPotionCanTarget(y,'p1','p2',0,true),false);
  assert.equal(royalPotionApply(y,target,'p2',0,()=>.5),null);
  assert.equal(royalPotionCanTarget(y,'p1','p1',0,false),true,'alleati curabili più volte');
 }
 assert.equal(used.size,6);
 foe.statuses.push({type:'Scottato',turns:2});
 const different=royalPotionApply(yzma,foe,'p2',0,()=>0);
 assert.equal(different,'Congelato','salta gli status già presenti da altri');
 const immune=fresh('shrek');immune.passive={name:'Test',immuneToNegativeStatuses:true};
 assert.equal(royalPotionApply(fresh('yzma'),immune,'p2',0,()=>0),null);
});
test('Yzma: Laboratorio buff preciso e Formula Imperiale condizionata al debuff',()=>{
 assert.equal(MOVES_DB['Pozione Misteriosa'].targetMode,'any');
 assert.equal(MOVES_DB['Pozione Misteriosa'].power,50);
 assert.equal(MOVES_DB['Laboratorio Segreto'].maxUses,4);
 assert.deepEqual(MOVES_DB['Laboratorio Segreto'].targetStatBuff,{def:1.2,spd:1.1,atk:1.05});
 const formula=MOVES_DB['Formula Imperiale'];assert.equal(formula.power,100);
 const yzma=fresh('yzma'),foe=fresh('shrek');
 assert.equal(royalStatusDamageBonus(yzma,foe,formula),1);
 foe.spd*=.8;
 assert.equal(royalStatusDamageBonus(yzma,foe,formula),1.1);
 const chaos=MOVES_DB['Geniale! Aspetta...'];
 assert.equal(chaos.power,60);
 assert.equal(chaos.targetStatBuff.atk,1.15);
 assert.equal(chaos.statusEffect.type,'Confuso');
 assert.equal(chaos.statusEffect.chance,1);
});
test('Lavender: mossa Lotta velenosa al 35%, nebbia di precisione, Morso a 130 sui veleni',()=>{
 const wolf=fresh('lavender'),foe=fresh('shrek'),attack=MOVES_DB['Istinto da Predatore'];
 assert.equal(royalWolfVenom(wolf,foe,attack,()=>.35),false);
 assert.equal(royalWolfVenom(wolf,foe,attack,()=>.3499),true);
 assert.equal(royalWolfVenom(wolf,foe,attack,()=>0),false,'nessun veleno ripetuto');
 assert.equal(royalWolfVenom(wolf,fresh('shrek'),MOVES_DB['Artigli Tossici'],()=>0),false);
 assert.equal(MOVES_DB['Istinto da Predatore'].power,110);
 assert.equal(MOVES_DB['Istinto da Predatore'].selfStatBuff.def,.85);
 assert.equal(MOVES_DB['Nebbia Velenifica'].maxUses,3);
 const ally=fresh('malefica'),enemy=fresh('yzma');
 const result=royalMistTargets([wolf,ally],[enemy]);
 assert.equal(result.allies.length,2);assert.equal(result.enemies.length,1);
 assert.equal(wolf.acc,1.1);assert.equal(ally.acc,1.1);assert.equal(enemy.acc,.9);
 const bite=MOVES_DB['Morso del Basilisco'];
 assert.equal(bite.targetCount,2);
 const freshTarget=fresh('shrek');
 assert.equal(royalEffectiveMove(bite,freshTarget),bite);
 royalStatus(freshTarget,'Avvelenato');
 assert.equal(royalEffectiveMove(bite,freshTarget).power,130);
 assert.equal(bite.power,50,'non muta la definizione originale della mossa');
});
test('Re Medusa: end-turn speed 10%, minion unique per king, bodyguard e +1 priorità',()=>{
 const king=fresh('remedusa');
 const base=king.spd;
 assert.equal(royalMedusaAgility(king),true);
 assert.equal(king.spd,Math.round(base*1.1));
 for(let i=0;i<100;i++)royalMedusaAgility(king);
 assert.ok(king.spd<=base*3);
 assert.equal(MOVES_DB['Scarica di Medusa'].targetCount,4);
 assert.equal(MOVES_DB['Scarica di Medusa'].statusEffect.chance,.15);
 assert.deepEqual(MOVES_DB['Sciame di Meduse'].multiHit,{min:2,max:5});
 assert.equal(MOVES_DB['Sciame di Meduse'].royalJellySummonChance,.2);
 const summon=royalBuildMedusaSummon(character('medusaservitore'),0);
 assert.equal(summon.medusaKingIndex,0);
 assert.equal(royalMedusaCanSummon(king,[king],[0],0),true);
 assert.equal(royalMedusaCanSummon(king,[king,summon],[0,1],0),false);
 summon.hp=0;
 assert.equal(royalMedusaCanSummon(king,[king,summon],[0,1],0),true);
 assert.equal(royalGrantPriority(summon),true);
 assert.equal(royalConsumePriority(summon,{type:'attack'}),1);
 assert.equal(royalConsumePriority(summon,{type:'attack'}),0);
 assert.equal(MOVES_DB['Oh Mio Sire'].priority,1);
 assert.equal(MOVES_DB['Oh Mio Sire'].targetMode,'ally');
 assert.equal(MOVES_DB['Gelatina Appiccicosa'].targetStatDebuff.spd,.7);
 assert.equal(MOVES_DB['Puntura Reale'].statusEffect.chance,1);
});
test('Malenia: 15% lifesteal, fendente20%, danza 3 colpi, ultimate1 uso',()=>{
 const mal=fresh('malenia');
 assert.equal(mal.passive.type,'goddess_of_rot');
 assert.equal(mal.passive.drain,.15);
 assert.equal(MOVES_DB["Fendente dell'Empireo"].power,85);
 assert.equal(MOVES_DB["Fendente dell'Empireo"].drain,.2);
 assert.deepEqual(MOVES_DB['Danza delle Ali Acquatiche'].multiHit,{min:3,max:3});
 assert.equal(MOVES_DB['Danza delle Ali Acquatiche'].drain,.1);
 assert.equal(MOVES_DB['Fioritura Scarlatta'].power,130);
 assert.equal(MOVES_DB['Fioritura Scarlatta'].maxUses,1);
 const rot=MOVES_DB['Marciume Scarlatto'];
 assert.equal(rot.maxUses,3);assert.equal(rot.royalScarletRot,true);
});
test('Marciume: 4 turni con danni crescenti e cure realmente dimezzate, non accumula',()=>{
 const foe=fresh('shrek');foe.maxHp=200;foe.hp=100;
 assert.equal(royalApplyRot(foe),true);
 assert.equal(royalApplyRot(foe),false);
 assert.equal(foe.statuses.filter(x=>x.type==='Marciume').length,1);
 assert.equal(royalRotTick(foe).damage,0,'il turno di applicazione non conta');
 assert.equal(royalRotHealingAmount(foe,40),20);
 assert.equal(royalHeal(foe,40),20);
 assert.equal(foe.hp,120);
 const expected=[12,18,24,30];
 for(let i=0;i<4;i++){
  const result=royalRotTick(foe);
  assert.equal(result.damage,expected[i]);
  assert.equal(result.expired,i===3);
 }
 assert.ok(!foe.statuses.some(x=>x.type==='Marciume'));
 assert.equal(royalRotHealingAmount(foe,40),40);
 assert.equal(royalHeal(foe,20),20);
});
test('Marciume: negativo mostrato nel Codex e purificabile dagli strumenti',()=>{
 assert.ok(NEGATIVE_STATUS_TYPES.includes('Marciume'));
 const target=fresh('shrek');target.heldItem='spray_neutralizzante';
 royalApplyRot(target);
 assert.ok(activateNeutralizingSpray(target).includes('Marciume'));
 assert.equal(target.statuses.some(x=>x.type==='Marciume'),false);
});
test('Motore: passivi e mosse collegati al calcolo turni, UI e matchmaking standard',()=>{
 const battle=source('../src/systems/battleSystem.js');
 const ui=source('../src/screens/battle/BattlingView.jsx');
 const codex=source('../src/components/BattleCodex.jsx');
 const room=source('../src/data/characters.js');
 assert.match(battle,/royalStatusDamageBonus\(attacker,defender,move\)/);
 assert.match(battle,/royalCursedFlames\(source,target/);
 assert.match(battle,/royalWolfVenom\(source,target/);
 assert.match(battle,/royalPotionApply\(attacker,t\.char/);
 assert.match(battle,/royalApplyRot\(t\.char/);
 assert.match(battle,/royalRotTick\(char\)/);
 assert.match(battle,/royalMedusaAgility\(char\)/);
 assert.match(battle,/royalBuildMedusaSummon\(base,charTeamIdx\)/);
 assert.match(battle,/royalGrantPriority\(t\.char\)/);
 assert.match(battle,/royalConsumePriority\(char,action\)/);
 assert.match(battle,/royalEffectiveMove\(currentMoveForDmg,t\.char\)/);
 assert.match(battle,/royalMistTargets\(/);
 assert.match(battle,/royalNewNegativeStatuses\(yzma,before\)/);
 assert.match(ui,/move\.targetMode === 'any'/);
 assert.match(codex,/Marciume/);
 assert.match(room,/ROYAL_POISON_CHARACTERS/);
});
