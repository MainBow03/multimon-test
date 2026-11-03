import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {MOVES_DB} from '../src/data/moves.js';
import {TYPES} from '../src/data/types.js';
import {GAME_UPDATES} from '../src/data/updateHistory.js';
import {initialGameState} from '../src/systems/gameState.js';
import {applyOnEnterPassiveImpl} from '../src/systems/battleSystem.js';
import {resolveSwitchingRoom} from '../src/systems/roomRecovery.js';
import {
  ZODIAC_SPIRITS,normalizeZodiacSpirit,activeZodiacSpirit,summonZodiacSpirit,
  ZODIAC_TRAP,ZODIAC_DODGE,addZodiacTrap,zodiacTrapMisses,zodiacTrapSpeedFactor,
  addZodiacDodge,consumeZodiacDodge,zodiacFlatStatBoost,cleanLucyDebuffs,
  zodiacSecondaryRoll
} from '../src/systems/zodiacSpirits.js';
const hero=id=>{const c=CHARACTERS.find(x=>x.id===id);assert.ok(c,id);return c};
const text=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const clone=char=>({...structuredClone(char),statuses:[],baseAtk:char.atk,baseDef:char.def,baseSpd:char.spd,
  moves:char.moves.map(m=>({...m,remainingUses:m.maxUses??null}))});

test('Lucy è un personaggio selezionabile Normale/Luce con quattro mosse e passiva dedicata',()=>{
 const lucy=hero('lucy');
 assert.deepEqual(lucy.types,['Normale','Luce']);
 assert.deepEqual([lucy.hp,lucy.maxHp,lucy.atk,lucy.def,lucy.spd],[100,100,100,85,105]);
 assert.equal(lucy.isSummonOnly,undefined);
 assert.equal(lucy.passive.name,'Spiriti dello Zodiaco');
 assert.equal(lucy.passive.type,'on_enter');
 assert.equal(lucy.passive.zodiacSummon,true);
 assert.deepEqual(lucy.moves.map(m=>m.name),
   ['Abito Stellare','Frusta Celestiale','Pioggia di Stelle','Apertura Forzata']);
 assert.equal(lucy.img,'https://i.pinimg.com/736x/71/ec/d2/71ecd2c17ca99eb2fd069adaf52b6928.jpg');
});

test('Otto Spiriti unici, tutti esclusivamente evocazioni, immagini e mosse presenti',()=>{
 assert.equal(ZODIAC_SPIRITS.length,8);
 assert.equal(new Set(ZODIAC_SPIRITS.map(s=>s.id)).size,8);
 const expected=[
 ['zodiac_aries','Folletto'],['zodiac_taurus','Lotta'],['zodiac_gemini','Psico'],
 ['zodiac_cancer','Robot'],['zodiac_leo','Terra'],['zodiac_virgo','Terra'],
 ['zodiac_aquarius','Acqua'],['zodiac_scorpio','Veleno']
 ];
 for(const [id,type] of expected){
   const c=hero(id);
   assert.deepEqual(c.types,[type],id);
   assert.equal(c.isSummonOnly,true,id+' is not playable');
   assert.equal(c.moves.length,3,id);
   assert.ok(c.moves.every(m=>m&&m.name&&MOVES_DB[m.name]),id);
   assert.ok(c.img.startsWith('https://'),id);
   assert.ok(TYPES.includes(type),type);
 }
 const draft=text('src/screens/battle/DraftingView.jsx');
 const coop=text('src/systems/multiplayerSystem.js');
 assert.match(draft,/!c\.isSummonOnly/);
 assert.match(coop,/!c\.isSummonOnly/);
});

test('Passiva all’ingresso evoca soltanto lo Spirito scelto, con 1 solo vivo attivo',()=>{
 const lucy=clone(hero('lucy'));lucy.zodiacSpiritId='zodiac_leo';
 const team={p1:[lucy],p2:[clone(hero('gaston'))]},field={p1:[0],p2:[0]},events=[];
 applyOnEnterPassiveImpl({CHARACTERS},lucy,'p1',0,team,field,events,'classica',{},false);
 const leo=activeZodiacSpirit(team,field,'p1',0);
 assert.ok(leo);
 assert.equal(leo.char.id,'zodiac_leo');
 assert.equal(leo.char.isSummonOnly,true);
 assert.equal(leo.char.zodiacOwner,'p1');
 assert.equal(leo.char.zodiacLucyIdx,0);
 assert.equal(leo.char.moves.length,3);
 assert.ok(leo.char.moves.every(m=>m.remainingUses===m.maxUses));
 assert.ok(events.some(e=>e.type==='summon'&&e.newChar.id==='zodiac_leo'));
 assert.equal(summonZodiacSpirit(team,field,'p1',0,CHARACTERS),null);
 assert.equal(team.p1.length,2);
 // Una nuova invocazione può avvenire solo dopo la scomparsa del precedente Spirito.
 leo.char.hp=0;field.p1=field.p1.filter(idx=>idx!==leo.idx);
 lucy.zodiacSpiritId='zodiac_virgo';
 const virgo=summonZodiacSpirit(team,field,'p1',0,CHARACTERS);
 assert.equal(virgo.char.id,'zodiac_virgo');
 assert.equal(activeZodiacSpirit(team,field,'p1',0).char.id,'zodiac_virgo');
});

test('Due Lucy sullo stesso lato mantengono la proprietà e la scelta dei loro spiriti',()=>{
 const a=clone(hero('lucy')),b=clone(hero('lucy'));
 a.zodiacSpiritId='zodiac_aries';b.zodiacSpiritId='zodiac_scorpio';
 const teams={p1:[a,b]},field={p1:[0,1]};
 summonZodiacSpirit(teams,field,'p1',0,CHARACTERS);
 summonZodiacSpirit(teams,field,'p1',1,CHARACTERS);
 assert.equal(activeZodiacSpirit(teams,field,'p1',0).char.id,'zodiac_aries');
 assert.equal(activeZodiacSpirit(teams,field,'p1',1).char.id,'zodiac_scorpio');
 assert.equal(normalizeZodiacSpirit('not_an_id'),'zodiac_aries');
});

test('Le quattro mosse di Lucy: percentuali, due target e attivazione di effetti secondari',()=>{
 const dress=MOVES_DB['Abito Stellare'],whip=MOVES_DB['Frusta Celestiale'];
 const rain=MOVES_DB['Pioggia di Stelle'],force=MOVES_DB['Apertura Forzata'];
 assert.equal(dress.statBuff.atk,1.2);
 assert.equal(dress.zodiacCharmOnDress,.4);
 assert.deepEqual([whip.type,whip.power,whip.hitStatDebuff.spd,whip.hitStatDebuff.chance],['Luce',80,.8,.2]);
 assert.deepEqual([rain.type,rain.power,rain.targetCount,rain.statusEffect.type,rain.statusEffect.chance],
   ['Luce',70,4,'Accecato',.3]);
 assert.equal(force.type,'Magico');
 assert.equal(force.power,85);
 assert.equal(force.zodiacForceSecondary,true);
});

test('Aries, Taurus, Gemini e Cancer conservano tutti i numeri chiesti',()=>{
 assert.deepEqual([MOVES_DB['Lana Celestiale'].power,MOVES_DB['Lana Celestiale'].hitStatDebuff.chance],[70,.3]);
 assert.equal(MOVES_DB['Nebbia del Sonno'].statusEffect.chance,.4);
 assert.equal(MOVES_DB['Abbraccio di Aries'].heal,.3);
 assert.equal(MOVES_DB['Ascia del Toro'].power,100);
 assert.equal(MOVES_DB['Carica Selvaggia (Taurus)'].power,120);
 assert.equal(MOVES_DB['Carica Selvaggia (Taurus)'].selfStatBuff.def,.7);
 assert.equal(MOVES_DB['Ruggito Possente'].statBuff.atk,1.5);
 assert.equal(MOVES_DB['Copia Perfetta'].zodiacCopyLastEnemy,true);
 assert.equal(MOVES_DB['Doppio Fantasma'].zodiacDodge,true);
 assert.equal(MOVES_DB['Confusione Gemella'].statusEffect.chance,.5);
 assert.deepEqual(MOVES_DB['Forbici Lampo'].multiHit,{min:3,max:3});
 assert.equal(MOVES_DB['Forbici Lampo'].power,40);
 assert.equal(MOVES_DB['Taglio Fulmineo'].power,90);
 assert.deepEqual(MOVES_DB['Difesa del Granchio'].zodiacFlatBuff,{def:20,spd:20});
});

test('Leo, Virgo, Aquarius e Scorpio conservano tutti i dettagli richiesti',()=>{
 assert.equal(MOVES_DB['Regulus Impact'].power,110);
 assert.equal(MOVES_DB['Lama Solare'].power,85);
 assert.equal(MOVES_DB['Lama Solare'].ignoreDefBuffs,true);
 assert.deepEqual(MOVES_DB['Aura del Re'].statBuff,{atk:1.5,spd:1.5});
 assert.equal(MOVES_DB['Sepoltura Immediata'].power,95);
 assert.equal(MOVES_DB['Prigione Sotterranea'].zodiacTrapTurns,3);
 assert.equal(MOVES_DB['Servizio Impeccabile'].priority,1);
 assert.equal(MOVES_DB['Servizio Impeccabile'].zodiacCleanLucy,true);
 assert.equal(MOVES_DB['Tsunami Stellare'].power,110);
 assert.equal(MOVES_DB['Tempesta Marina'].power,85);
 assert.equal(MOVES_DB['Tempesta Marina'].statusEffect.chance,.3);
 assert.equal(MOVES_DB['Diluvio di Aquarius'].zodiacRainTurns,5);
 assert.equal(MOVES_DB['Puntura Mortale'].power,80);
 assert.equal(MOVES_DB['Puntura Mortale'].statusEffect.chance,.5);
 assert.equal(MOVES_DB['Veleno Imperiale'].power,100);
 assert.equal(MOVES_DB['Agguato Silenzioso'].priority,1);
});

test('Virgo intrappola per 3 turni: metà velocità e metà probabilità di fallire',()=>{
 const target=clone(hero('gaston'));
 assert.equal(addZodiacTrap(target),true);
 assert.equal(target.statuses[0].type,ZODIAC_TRAP);
 assert.equal(target.statuses[0].turns,3);
 assert.equal(target.statuses[0].justApplied,true);
 assert.equal(zodiacTrapSpeedFactor(target),.5);
 assert.equal(zodiacTrapMisses(target,()=>0),true);
 assert.equal(zodiacTrapMisses(target,()=>.99),false);
 assert.equal(zodiacTrapSpeedFactor(clone(hero('gaston'))),1);
 assert.match(text('src/systems/battleSystem.js'),/if\(trap\.justApplied\)delete trap\.justApplied/);
});

test('Gemini evita il prossimo attacco e perde lo stato dopo il primo consumo',()=>{
 const gemini=clone(hero('zodiac_gemini'));
 addZodiacDodge(gemini);
 assert.ok(gemini.statuses.some(s=>s.type===ZODIAC_DODGE));
 assert.equal(consumeZodiacDodge(gemini),true);
 assert.equal(consumeZodiacDodge(gemini),false);
 assert.ok(!gemini.statuses.some(s=>s.type===ZODIAC_DODGE));
 assert.match(text('src/systems/battleSystem.js'),/consumeZodiacDodge\(t\.char\)/);
});

test('Cancer aumenta di 20 punti i valori non oltre il doppio; Virgo purifica Lucy',()=>{
 const cancer=clone(hero('zodiac_cancer'));
 assert.equal(zodiacFlatStatBoost(cancer,'def',20),true);
 assert.equal(zodiacFlatStatBoost(cancer,'spd',20),true);
 assert.equal(cancer.def,95);
 assert.equal(cancer.spd,115);
 const lucy=clone(hero('lucy'));
 lucy.atk=60;lucy.spd=70;lucy.acc=.4;lucy.statuses=[{type:'Avvelenato',turns:2},{type:ZODIAC_TRAP,turns:3}];
 assert.equal(cleanLucyDebuffs(lucy),true);
 assert.equal(lucy.atk,100);assert.equal(lucy.spd,105);assert.equal(lucy.acc,1);
 assert.deepEqual(lucy.statuses,[]);
});

test('Apertura Forzata: ognuno degli 8 Spiriti ha un effetto secondario definito',()=>{
 assert.equal(zodiacSecondaryRoll('zodiac_aries',()=>0).status,'Addormentato');
 assert.equal(zodiacSecondaryRoll('zodiac_aries',()=>.99).status,null);
 assert.deepEqual(zodiacSecondaryRoll('zodiac_taurus'),{buff:{atk:1.5}});
 assert.equal(zodiacSecondaryRoll('zodiac_gemini',()=>0).status,'Confuso');
 assert.deepEqual(zodiacSecondaryRoll('zodiac_cancer'),{flatBuff:{def:20,spd:20}});
 assert.deepEqual(zodiacSecondaryRoll('zodiac_leo'),{buff:{atk:1.5,spd:1.5}});
 assert.deepEqual(zodiacSecondaryRoll('zodiac_virgo'),{trapTurns:3});
 assert.deepEqual(zodiacSecondaryRoll('zodiac_aquarius'),{rainTurns:5});
 assert.equal(zodiacSecondaryRoll('zodiac_scorpio',()=>0).status,'Avvelenato');
 assert.match(text('src/systems/battleSystem.js'),/move\.zodiacForceSecondary && attacker\.id==='lucy'/);
});

test('Sostituzione obbligatoria sceglie Virgo senza esporre Spiriti nel draft',()=>{
 const state=initialGameState();
 state.status='switching_phase';
 state.gameMode='classica';state.settings.fieldSize=1;
 state.players.p1='Giocatore';state.players.p2='CPU';
 state.teams.p1=[clone(hero('lucy'))];state.teams.p2=[clone(hero('gaston'))];
 state.field.p1=[];state.field.p2=[0];
 state.switchActions.p1=[0];state.switchActions.p2=[];
 state.switchZodiacChoices.p1={0:'zodiac_virgo'};
 const result=resolveSwitchingRoom(state,['p1','p2'],Date.now(),false,
   (ch,p,idx,teams,field,events,room)=>
     applyOnEnterPassiveImpl({CHARACTERS},ch,p,idx,teams,field,events,
       room.gameMode,room.settings,room.isCampaignBattle));
 assert.equal(result.kind,'resolved');
 assert.equal(result.patch.teams.p1[0].zodiacSpiritId,'zodiac_virgo');
 assert.ok(result.patch.teams.p1.some(c=>c.id==='zodiac_virgo'&&c.isSummonOnly));
 assert.ok(result.patch.events.some(e=>e.type==='summon'));
});

test('Selettore degli Spiriti integrato nei draft, campagna, roguelike e sostituzioni',()=>{
 for(const file of [
  'src/screens/battle/DraftingView.jsx',
  'src/screens/battle/BattlingView.jsx',
  'src/screens/battle/SwitchingPhaseView.jsx',
  'src/screens/campaign/CampaignTeamSelectView.jsx',
  'src/screens/roguelike/RoguelikeMapView.jsx'
 ])assert.match(text(file),/ZodiacSpiritPicker|ZodiacSwitchChoice/,file);
 assert.match(text('src/systems/multiplayerSystem.js'),/switchZodiacChoices/);
 assert.match(text('src/components/ZodiacSpiritPicker.jsx'),/aria-pressed/);
});

test('Registro aggiornamenti: 9 nuovi personaggi, tutte le mosse e Spiriti non giocabili',()=>{
 const section=GAME_UPDATES[0];
 assert.equal(section.id,'nov3-lucy-zodiac-spirit-system');
 assert.equal(section.category,'champions');
 assert.ok(section.items.length>=13);
 const joined=section.items.join(' ');
 for(const word of ['Lucy','Aries','Taurus','Gemini','Cancer','Leo','Virgo','Aquarius','Scorpio',
   'Abito Stellare','Apertura Forzata','Colpo','Spiriti']){
   assert.ok(joined.includes(word),word+' absent from history');
 }
 assert.ok(GAME_UPDATES.some(x=>x.id==='nov3-second-nerf-wave'));
});
