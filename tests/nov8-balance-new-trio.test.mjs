import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {MOVES_DB} from '../src/data/moves.js';
import {CHAR_PRICES} from '../src/data/prices.js';
import {MASTERY_CHARACTER_TITLES} from '../src/data/masteryTitles.js';
import {HYPER_BONUS_MOVES,hyperPreviewMoves} from '../src/systems/hyperPreview.js';
import {CURSED_BODY_CHANCE,tryCursedBody} from '../src/systems/berryFrillishEffects.js';
import {NEGATIVE_STATUS_TYPES,activateNeutralizingSpray} from '../src/systems/newHeldAndPassiveEffects.js';
import {
 ASSIDERAMENTO_STATUS,ASSIDERAMENTO_TURNS,ASSIDERAMENTO_SPEED_FACTOR,
 ASSIDERAMENTO_DAMAGE_FACTOR,hasAssideramento,assideramentoSpeedFactor,
 assideramentoDamageFactor,tickAssideramento,prepareQilinAttack,
 qilinDamageFactor,resolveQilinAttack
} from '../src/systems/assideramentoQilin.js';

const source=file=>readFileSync(new URL(file,import.meta.url),'utf8');
const char=id=>CHARACTERS.find(c=>c.id===id);
const move=name=>MOVES_DB[name];

test('Nerf Elsa: Iper Gelo Definitivo applica Assiderato 25% per 2 turni, NON Congelato',()=>{
 const hyper=move('Gelo Definitivo');
 assert.equal(hyper.type,'Ghiaccio');
 assert.equal(hyper.power,100);
 assert.equal(hyper.targetCount,4);
 assert.equal(hyper.maxUses,1);
 assert.deepEqual(hyper.statusEffect,{type:'Assiderato',chance:.25,turns:2});
 assert.equal(HYPER_BONUS_MOVES.elsa.includes('Gelo Definitivo'),true);
 assert.equal(hyperPreviewMoves(char('elsa'),true,MOVES_DB).some(x=>x.name==='Gelo Definitivo'),true);
 assert.ok(NEGATIVE_STATUS_TYPES.includes('Assiderato'));
 assert.match(source('../src/components/BattleCodex.jsx'),/Assiderato:/);
});

test('Assideramento: -50% Velocità e -30% danni reali, azione consentita, dura due turni completi',()=>{
 assert.equal(ASSIDERAMENTO_STATUS,'Assiderato');
 assert.equal(ASSIDERAMENTO_TURNS,2);
 assert.equal(ASSIDERAMENTO_SPEED_FACTOR,.5);
 assert.equal(ASSIDERAMENTO_DAMAGE_FACTOR,.7);
 const target={name:'Bersaglio',statuses:[]};
 assert.equal(assideramentoSpeedFactor(target),1);
 assert.equal(assideramentoDamageFactor(target),1);
 target.statuses.push({type:'Assiderato',turns:2,justApplied:true});
 assert.equal(hasAssideramento(target),true);
 assert.equal(Math.floor(100*assideramentoSpeedFactor(target)),50);
 assert.equal(Math.floor(100*assideramentoDamageFactor(target)),70);
 assert.equal(tickAssideramento(target),false,'Il turno di applicazione non consuma durata');
 assert.equal(target.statuses[0].turns,2);
 assert.equal(tickAssideramento(target),false);
 assert.equal(target.statuses[0].turns,1);
 assert.equal(tickAssideramento(target),true);
 assert.equal(hasAssideramento(target),false);
 assert.equal(assideramentoDamageFactor(target),1);
 const victim={statuses:[{type:'Assiderato',turns:2,justApplied:true}],heldItem:'spray_neutralizzante'};
 assert.deepEqual(activateNeutralizingSpray(victim),['Assiderato']);
 assert.equal(victim.statuses.length,0);
 const code=source('../src/systems/battleSystem.js');
 assert.match(code,/effSpd = Math\.floor\(char\.spd\*zodiacTrapSpeedFactor\(char\)\*tailwindSpeedFactor\(workingTailwind,player\)\*assideramentoSpeedFactor\(char\)\)/);
 assert.match(code,/const weakenFactor = .*assideramentoDamageFactor\(attacker\)/);
 assert.match(code,/tickAssideramento\(char\)/);
 assert.match(code,/\['Incantato','Assiderato'\]/);
 assert.match(code,/includes\(effect\.type\)\?\{justApplied:true\}/);
});

test('Buff Garnet, Frillish, Jack Frost e nerf Juri esatti',()=>{
 assert.equal(move('Schianto Sismico').power,72);
 assert.equal(move('Schianto Sismico').targetCount,4);
 assert.equal(move('Scherzetto di Neve').power,50);
 assert.equal(move('Scherzetto di Neve').statusEffect.chance,.3,'Nerf successivo approvato: congelamento 40% → 30%');
 assert.equal(CURSED_BODY_CHANCE,.25);
 assert.equal(char('frillish').passive.chance,.25);
 const defender=structuredClone(char('frillish'));
 const attacker=structuredClone(char('berry'));
 attacker.statuses=[];
 attacker.moves=attacker.moves.map(x=>({...x,remainingUses:null}));
 assert.equal(tryCursedBody(defender,attacker,attacker.moves[0],()=>.24999),true);
 assert.equal(char('juri').passive.name,'Tifo del Pubblico');
 assert.equal(char('juri').passive.maxUses,2);
 assert.match(char('juri').passive.desc,/2 attivazioni/);
});

test('Flins, Ganyu e Coraline nel roster e nei prezzi: 4 mosse reali e PNG corretti',()=>{
 const expected=[
  ['flins',['Elettro','Luce'],250,'75d215c39a08b6ed5dbb7e67e3f25922','Lanterna del Guardiano'],
  ['ganyu',['Ghiaccio','Magico'],300,'a6d9df07e69725cb0e85bce44ef71b66','Rugiada Qilin'],
  ['coraline',['Psico','Spettro'],200,'759aae6689ebd83cc6c70c2fbc9edf54','Non ho paura dei bottoni']
 ];
 for(const [id,types,price,imagePart,passive] of expected){
  const found=CHARACTERS.filter(c=>c.id===id);
  assert.equal(found.length,1,'Roster duplicato: '+id);
  const c=found[0];
  assert.deepEqual(c.types,types);
  assert.equal(c.price,price);
  assert.equal(CHAR_PRICES[id],price);
  assert.ok(c.img.includes(imagePart));
  assert.ok(c.hp>0 && c.atk>0 && c.spd>0 && c.def>0);
  assert.equal(c.passive.name,passive);
  assert.equal(c.moves.length,4);
  assert.ok(c.moves.every(m=>m?.name&&m.type&&typeof m.power==='number'));
  assert.ok(MASTERY_CHARACTER_TITLES[id]?.length>6);
 }
 assert.equal(char('flins').passive.type,'global_damage_boost');
 assert.equal(char('flins').passive.multiplier,1.10);
 assert.equal(char('coraline').passive.type,'first_hit_immunity');
 assert.equal(move('Porticina Segreta').strictUses,true);
 assert.equal(move('Porticina Segreta').maxUses,3);
});

test('Ganyu · Rugiada Qilin: 2 mosse Ghiaccio caricano, la terza fa +35% e cura 10%',()=>{
 const g=structuredClone(char('ganyu'));
 g.hp=40;g.maxHp=100;
 const ice=move('Freccia del Qilin');
 const area=move('Pioggia Celestiale Qilin');
 const magic=move('Passo della Rugiada');
 assert.equal(g.passive.type,'qilin_dew');
 assert.equal(prepareQilinAttack(g,ice),false);
 assert.equal(qilinDamageFactor(g,ice),1);
 assert.deepEqual(resolveQilinAttack(g,ice,true),{burst:false,charges:1,healed:0});
 assert.equal(g.qilinCharges,1);
 assert.equal(prepareQilinAttack(g,ice),false);
 assert.deepEqual(resolveQilinAttack(g,ice,true),{burst:false,charges:2,healed:0});
 assert.equal(prepareQilinAttack(g,area),true);
 assert.equal(qilinDamageFactor(g,area),1.35);
 // Due bersagli e quattro colpi non devono consumare cariche in calculateDamage:
 assert.equal(qilinDamageFactor(g,area),1.35);
 assert.equal(qilinDamageFactor(g,area),1.35);
 assert.deepEqual(resolveQilinAttack(g,area,true),{burst:true,charges:0,healed:10});
 assert.equal(g.hp,50);
 assert.equal(g.qilinCharges,0);
 assert.equal(qilinDamageFactor(g,ice),1);
 assert.equal(prepareQilinAttack(g,magic),false,'Una mossa di supporto non consuma cariche');
 assert.equal(resolveQilinAttack(g,magic,true),null);
 assert.equal(g.qilinCharges,0);
 const miss=resolveQilinAttack(g,ice,false);
 assert.equal(miss,null,'Mossa fallita: nessun sigillo');
 assert.equal(g.qilinCharges,0);
});

test('I nuovi personaggi non creano effetti invalidi quando Ganyu è a PS pieni o esausta',()=>{
 const ice=move('Freccia del Qilin');
 const g=structuredClone(char('ganyu'));
 g.qilinCharges=2;g.hp=g.maxHp;
 assert.equal(prepareQilinAttack(g,ice),true);
 assert.deepEqual(resolveQilinAttack(g,ice,true),{burst:true,charges:0,healed:0});
 g.qilinCharges=2;g.hp=0;
 assert.equal(prepareQilinAttack(g,ice),false);
 assert.equal(resolveQilinAttack(g,ice,true),null);
 assert.equal(g.qilinCharges,2);
});

test('Gli effetti sono collegati al motore e alla enciclopedia',()=>{
 const engine=source('../src/systems/battleSystem.js');
 const codex=source('../src/components/BattleCodex.jsx');
 assert.match(engine,/pwr \*= qilinDamageFactor\(attacker,move\)/);
 assert.match(engine,/prepareQilinAttack\(attacker,move\)/);
 assert.match(engine,/resolveQilinAttack\(attacker,move,attackSucceeded\)/);
 assert.match(engine,/qilin\.healed>0/);
 assert.match(engine,/assideramentoSpeedFactor\(char\)/);
 assert.match(engine,/assideramentoDamageFactor\(attacker\)/);
 assert.match(engine,/tickAssideramento\(char\)/);
 assert.match(codex,/Velocità effettiva è dimezzata/);
 assert.match(codex,/25% di probabilità di bloccare/);
 assert.equal(move('Gelo Definitivo').statusEffect.type,'Assiderato');
});
