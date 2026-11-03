import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {MOVES_DB} from '../src/data/moves.js';
import {ITEMS_DB} from '../src/data/items.js';
import {hyperPreviewMoves,HYPER_BONUS_MOVES,canChooseHyperMove} from '../src/systems/hyperPreview.js';
import {tryStartRainstorm,isRainyWeather,weatherMoveFactor,weatherEvasionBonus,
 totalEvasionChance,RAINSTORM_TURNS} from '../src/systems/rainstorm.js';
import {getHeldEvasion} from '../src/systems/heldEquipment.js';
import {survivedBarrelHits} from '../src/systems/newHeldAndPassiveEffects.js';
const src=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const juvia=CHARACTERS.find(c=>c.id==='juvia');

test('Iper: i bonus appaiono prima della prima mossa, spariscono se si disattiva, non duplicano',()=>{
 const ch={...juvia,moves:juvia.moves.map(m=>({...m})),isHyper:false};
 const base=hyperPreviewMoves(ch,false,MOVES_DB);
 assert.strictEqual(base,ch.moves);
 const hyper=hyperPreviewMoves(ch,true,MOVES_DB);
 assert.equal(hyper.length,base.length+1);
 assert.equal(hyper.at(-1).name,'Abisso Disperato');
 assert.equal(hyper.at(-1).hyperPreview,true);
 assert.equal(hyper.at(-1).remainingUses,MOVES_DB['Abisso Disperato'].maxUses??null);
 assert.equal(ch.moves.length,base.length,'La scelta non modifica il Multimon originale');
 assert.equal(canChooseHyperMove(ch,hyper.length-1,true,MOVES_DB),true);
 assert.equal(canChooseHyperMove(ch,hyper.length-1,false,MOVES_DB),false);
 assert.equal(hyperPreviewMoves(ch,false,MOVES_DB).length,base.length);
 assert.equal(hyperPreviewMoves({...ch,isHyper:true},true,MOVES_DB).length,base.length);
});

test('Iper: ogni mossa preview corrisponde a una vera mossa e all’aggiunta del motore',()=>{
 const battle=src('src/systems/battleSystem.js');
 const knownIds=new Set(CHARACTERS.map(c=>c.id));
 for(const [id,names] of Object.entries(HYPER_BONUS_MOVES)){
  assert.ok(knownIds.has(id),id+' non è un personaggio');
  const c=CHARACTERS.find(c=>c.id===id);
  const preview=hyperPreviewMoves(c,true,MOVES_DB);
  assert.ok(preview.length>=c.moves.length);
  for(const name of names){
   assert.ok(MOVES_DB[name],name+' non esiste');
   assert.ok(preview.some(m=>m.name===MOVES_DB[name].name),id+' non mostra '+name);
   assert.ok(battle.includes('MOVES_DB['+JSON.stringify(name).replaceAll('"',"'")+']') ||
      (id==='finn'&&name.includes("Eroe")),name+' non presente nel motore');
  }
 }
 const ui=src('src/screens/battle/BattlingView.jsx');
 const actions=src('src/systems/battleSystem.js');
 const app=src('src/App.jsx');
 assert.match(ui,/availableMoves\.map/);
 assert.match(ui,/hyperPreviewMoves\(activeCommandChar,pendingHyper,MOVES_DB\)/);
 assert.match(ui,/setPendingHyper\(!pendingHyper\)/);
 assert.match(actions,/hyperPreviewMoves\(activeCommandChar,pendingHyper,MOVES_DB\)\[targetingMoveIdx\]/);
 assert.match(actions,/hyperPreviewMoves\(activeCommandChar,pendingHyper,MOVES_DB\)\[actionDetails\.moveIdx\]/);
 assert.match(app,/handleSelectMoveTargetImpl\(\{[^\n]*MOVES_DB, pendingHyper/);
});

test('Iper: la trasformazione è calcolata prima dell’iniziativa, anche se il Multimon è lento',()=>{
 const battle=src('src/systems/battleSystem.js');
 const prepass=battle.indexOf('// --- 1. PRE-PASS: ELABORAZIONE FORMA IPER');
 const queue=battle.indexOf('// --- 2. COSTRUZIONE CODA DEI TURNI E INIZIATIVA');
 const speed=battle.indexOf('turnQueue.sort((a, b)',queue);
 const hyperEvent=battle.indexOf("type: 'hyper_transform'",prepass);
 assert.ok(prepass>0);
 assert.ok(hyperEvent>prepass && hyperEvent<queue,'La trasformazione deve precedere la coda');
 assert.ok(queue>hyperEvent && speed>queue);
 assert.match(battle,/char\.isHyper = true/);
 assert.match(battle,/workingHyperUsed\[player\] = true/);
 assert.match(battle,/actionDetails\.hyperize = true/);
});

test('Juvia: Colpo impetuoso ha esattamente 25% di chance di Tempesta, durata 5',()=>{
 const move=MOVES_DB['Colpo impetuoso'];
 assert.equal(move.power,95);
 assert.equal(move.rainstormChance,.25);
 assert.equal(RAINSTORM_TURNS,5);
 assert.equal(tryStartRainstorm(move,true,()=>.2499),true);
 assert.equal(tryStartRainstorm(move,true,()=>.25),false);
 assert.equal(tryStartRainstorm(move,false,()=>0),false);
 assert.equal(tryStartRainstorm(MOVES_DB['Colpo Cartoon'],true,()=>0),false);
});

test('Tempesta: Acqua +25%, Fuoco -25%; il meteo è condiviso e rimpiazzabile',()=>{
 const weather={type:'rainstorm',turns:4};
 assert.equal(isRainyWeather(weather),true);
 assert.equal(isRainyWeather({type:'rain',turns:3}),true);
 assert.equal(isRainyWeather({type:'snowstorm',turns:4}),false);
 assert.equal(isRainyWeather({type:'rainstorm',turns:0}),false);
 assert.equal(weatherMoveFactor({type:'Acqua'},weather),1.25);
 assert.equal(weatherMoveFactor({type:'Fuoco'},weather),.75);
 assert.equal(weatherMoveFactor({type:'Lotta'},weather),1);
 assert.equal(weatherMoveFactor({type:'Acqua'},{type:'snowstorm',turns:3}),1);
 const engine=src('src/systems/battleSystem.js');
 assert.match(engine,/const calculateDamage=\(\.\.\.args\)=>/);
 assert.match(engine,/weatherMoveFactor\(args\[2\],workingWeather\)/);
 assert.match(engine,/tryStartRainstorm\(move,attackSucceeded\)/);
 assert.match(engine,/workingWeather=\{type:'rainstorm',turns:RAINSTORM_TURNS\}/);
 assert.match(engine,/workingWeather\.turns--/);
 const ui=src('src/screens/battle/BattlingView.jsx');
 assert.match(ui,/TEMPESTA · \{gameState\.battleWeather\.turns\} turni/);
});

test('Cuore di Pioggia: +20% elusione soltanto sotto tempesta o pioggia',()=>{
 assert.ok(juvia);
 assert.equal(juvia.passive.name,'Cuore di Pioggia');
 assert.equal(juvia.passive.type,'rain_evasion');
 const storm={type:'rainstorm',turns:3};
 assert.equal(weatherEvasionBonus(juvia,storm),.2);
 assert.equal(weatherEvasionBonus(juvia,{type:'rain',turns:2}),.2);
 assert.equal(weatherEvasionBonus(juvia,null),0);
 assert.equal(weatherEvasionBonus(juvia,{type:'snowstorm',turns:4}),.2);
 assert.equal(weatherEvasionBonus(CHARACTERS.find(c=>c.id==='jake'),storm),0);
 assert.ok(Math.abs(totalEvasionChance(juvia,storm)-.2)<1e-10);
});

test('Polvere Brillante: elusione +10% e si combina con la pioggia senza sostituire il Mantello',()=>{
 assert.equal(ITEMS_DB.polvere_brillante.type,'held');
 assert.equal(getHeldEvasion({heldItem:'polvere_brillante'}),.1);
 assert.equal(getHeldEvasion({heldItem:'mantello_invisibilita'}),.15);
 assert.equal(getHeldEvasion({heldItem:null}),0);
 const withPowder={...juvia,heldItem:'polvere_brillante'};
 assert.ok(Math.abs(totalEvasionChance(withPowder,{type:'rainstorm',turns:3},getHeldEvasion(withPowder))-.28)<.0001);
 assert.ok(Math.abs(totalEvasionChance(withPowder,null,getHeldEvasion(withPowder))-.1)<1e-10);
});

test('Barile Pimpante: quattro colpi sopravvissuti, anche multicolpo, una sola attivazione',()=>{
 const c={heldItem:'barile_pimpante',hp:80,barrelSurvivedHits:0,barrelBroken:false};
 assert.equal(ITEMS_DB.barile_pimpante.type,'held');
 assert.equal(survivedBarrelHits(c,1),false);
 assert.equal(survivedBarrelHits(c,2),false);
 assert.equal(c.barrelSurvivedHits,3);
 assert.equal(survivedBarrelHits(c,1),true);
 assert.equal(c.barrelSurvivedHits,4);
 assert.equal(c.barrelBroken,true);
 assert.equal(survivedBarrelHits(c,10),false,'Non deve riattivarsi');
 const multi={heldItem:'barile_pimpante',hp:100};
 assert.equal(survivedBarrelHits(multi,4),true,'Quattro colpi in una mossa contano tutti');
 const dead={heldItem:'barile_pimpante',hp:0};
 assert.equal(survivedBarrelHits(dead,4),false,'Nessun bonus se il Multimon va KO');
 assert.equal(survivedBarrelHits({heldItem:'avanzi',hp:100},4),false);
 assert.equal(survivedBarrelHits(multi,0),false);
 const engine=src('src/systems/battleSystem.js');
 assert.match(engine,/if\(options\.directAttack && target\.hp>0 && dmg>0/);
 assert.match(engine,/survivedBarrelHits\(target,options\.directHits\?\?1\)/);
 assert.match(engine,/applyBattleStatModifier\(target,'spd',1\.75\)/);
 assert.match(engine,/directHits:Math\.max\(0,actualHits-juggHitsAbsorbed\)/);
});

test('Nuova guida equipaggiamento: descrizione persistente e catalogo in campagna e draft',()=>{
 const picker=src('src/components/HeldEquipmentPicker.jsx');
 const draft=src('src/screens/battle/DraftingView.jsx');
 const campaign=src('src/screens/campaign/CampaignTeamSelectView.jsx');
 const art=src('src/components/ItemArtwork.jsx');
 assert.match(picker,/equipped\?\.desc/);
 assert.match(picker,/Guida agli strumenti/);
 assert.match(picker,/aria-label="Cerca uno strumento"/);
 assert.match(picker,/getEquippedCount\(team,item\.id,index\)/);
 for(const screen of [draft,campaign]){
  assert.match(screen,/<HeldEquipmentCard /);
  assert.match(screen,/<HeldEquipmentGuide /);
 }
 for(const item of ['polvere_brillante','barile_pimpante']){
  assert.ok(ITEMS_DB[item].desc.length>=50);
  assert.match(art,new RegExp("id==='"+item+"'"));
 }
});
