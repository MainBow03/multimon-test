import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {MOVES_DB} from '../src/data/moves.js';
import {ITEMS_DB} from '../src/data/items.js';
import {HELD_ITEM_IDS,canEquipHeldItem} from '../src/systems/heldEquipment.js';
import {healFromVampiricBite,VAMPIRIC_BITE_RATE} from '../src/systems/vampiricBite.js';
import {supportTeamPlayers,legalSupportTargets,isLegalSupportTarget} from '../src/systems/supportTargeting.js';

const source=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const character=id=>CHARACTERS.find(c=>c.id===id);
const sample=(id,hp)=>({...structuredClone(character(id)),hp});
const state={
  gameMode:'multipla',teams:{
    p1:[sample('luffy',55),sample('nami',0),sample('berry',90)],
    p2:[sample('chopper',17),sample('frillish',0)],
    p3:[sample('zoro',70),sample('ametista',0)],
    p4:[sample('elsa',0)]
  },field:{p1:[0,2],p2:[0],p3:[0],p4:[]}
};

test('Lotta Multipla: selezione pozioni e cura anche compagno e riserve',()=>{
 assert.deepEqual(supportTeamPlayers(state,'p1',['p1','p2','p3','p4']),['p1','p2']);
 assert.deepEqual(supportTeamPlayers(state,'p3',['p1','p2','p3','p4']),['p3','p4']);
 const alive=legalSupportTargets(state,'p1','alive');
 assert.deepEqual(alive.map(t=>t.player+'-'+t.idx),['p1-0','p1-2','p2-0']);
 assert.equal(isLegalSupportTarget(state,'p1','p2',0,'alive'),true);
 assert.equal(isLegalSupportTarget(state,'p1','p3',0,'alive'),false,'mai curare un nemico');
 assert.equal(isLegalSupportTarget(state,'p1','p1',1,'alive'),false,'non usare pozione su KO');
 assert.equal(isLegalSupportTarget(state,'p1','p2',9,'alive'),false,'indice inesistente');
 assert.equal(isLegalSupportTarget(state,'p1','p1',0,'alive',{fieldOnly:true}),true);
});

test('Revitalizzante e Sage permettono scegliere il KO preciso, anche dell’altro giocatore',()=>{
 const dead=legalSupportTargets(state,'p1','revive');
 assert.deepEqual(dead.map(t=>t.player+'-'+t.idx),['p1-1','p2-1']);
 assert.ok(isLegalSupportTarget(state,'p1','p2',1,'revive'));
 assert.ok(isLegalSupportTarget(state,'p1','p1',1,'revive'));
 assert.equal(isLegalSupportTarget(state,'p1','p3',1,'revive'),false);
 assert.equal(isLegalSupportTarget(state,'p1','p1',0,'revive'),false);
 assert.equal(MOVES_DB['Non ucciderai i miei alleati!'].targetMode,'revive');
 assert.equal(MOVES_DB['Non ucciderai i miei alleati!'].heal,.5);
 assert.equal(ITEMS_DB.resurrezione.type,'revive');
});

test('In Roguelike Coop i tre amici possono supportarsi ma non curare il boss',()=>{
 const coop={...state,gameMode:'juggernaut',isRoguelikeCoop:true,settings:{juggernautPlayer:'p4'}};
 assert.deepEqual(supportTeamPlayers(coop,'p2',['p1','p2','p3','p4']),['p1','p2','p3']);
 assert.ok(isLegalSupportTarget(coop,'p2','p1',1,'revive'));
 assert.ok(isLegalSupportTarget(coop,'p3','p2',0,'alive'));
 assert.equal(isLegalSupportTarget(coop,'p2','p4',0,'revive'),false);
 assert.deepEqual(supportTeamPlayers(coop,'p4',['p1','p2','p3','p4']),['p4']);
});
test('Modalità singole non danno accesso al roster avversario',()=>{
 for(const gameMode of ['classica','torneo','battleroyale','torneo_punti']){
   const room={...state,gameMode};
   assert.deepEqual(supportTeamPlayers(room,'p1',['p1','p2','p3','p4']),['p1']);
   assert.equal(isLegalSupportTarget(room,'p1','p2',0,'alive'),false);
 }
});

test('Morso Vampirico: strumento da equipaggiare, si acquista una sola volta',()=>{
 const def=ITEMS_DB.morso_vampirico;
 assert.equal(def.type,'held');
 assert.ok(def.price>=200);
 assert.equal(def.icon,'morso_vampirico');
 assert.ok(HELD_ITEM_IDS.includes('morso_vampirico'));
 assert.equal(canEquipHeldItem([{id:'luffy'}, {id:'zoro'}],0,'morso_vampirico',
   {morso_vampirico:1}),true);
 assert.equal(VAMPIRIC_BITE_RATE,.1);
 const artwork=source('../src/components/ItemArtwork.jsx');
 assert.match(artwork,/id==='morso_vampirico'/);
 assert.match(artwork,/aria-label="Morso Vampirico"/);
});
test('Morso Vampirico cura 10% danni HP effettivi, non oltre HP max; non ruba su zero',()=>{
 const c={id:'luffy',heldItem:'morso_vampirico',hp:50,maxHp:108};
 assert.equal(healFromVampiricBite(c,100),10);
 assert.equal(c.hp,60);
 assert.equal(healFromVampiricBite(c,30),3);
 assert.equal(c.hp,63);
 assert.equal(healFromVampiricBite(c,1),1);
 assert.equal(c.hp,64);
 assert.equal(healFromVampiricBite(c,0),0);
 const x={id:'luffy',heldItem:'morso_vampirico',hp:107,maxHp:108};
 assert.equal(healFromVampiricBite(x,100),1);
 assert.equal(healFromVampiricBite(x,100),0);
 assert.equal(healFromVampiricBite({id:'luffy',heldItem:'avanzi',hp:5,maxHp:108},100),0);
 assert.equal(healFromVampiricBite({id:'luffy',heldItem:'morso_vampirico',hp:0,maxHp:108},100),0);
});

test('Bumblebee buff: statistiche, passiva e tutte le quattro mosse',()=>{
 const bee=character('bumblebee');
 assert.equal(bee.hp,89);
 assert.equal(bee.maxHp,89);
 assert.equal(bee.def,80);
 assert.equal(bee.passive.type,'first_strike_bonus');
 assert.equal(bee.passive.damageBonus,1.20);
 assert.deepEqual(MOVES_DB['Raffica Sonica'].multiHit,{min:2,max:6});
 assert.equal(MOVES_DB['Raggio Esplosivo'].power,100);
 assert.equal(MOVES_DB['Raggio Esplosivo'].accuracy,.9);
 assert.equal(MOVES_DB['Pungiglione Elettrico'].targetStatDebuff.spd,.9);
 assert.equal(MOVES_DB['Pungiglione Elettrico'].statusEffect.chance,.3);
 assert.equal(MOVES_DB['Pungiglione'].statusEffect.type,'Avvelenato');
 assert.equal(MOVES_DB['Pungiglione'].statusEffect.chance,.3);
 assert.equal(bee.moves.length,4);
});

test('Motore: al click su bersaglio corretto la cura è validata prima di spendere l’oggetto',()=>{
 const engine=source('../src/systems/battleSystem.js');
 const ui=source('../src/screens/battle/BattlingView.jsx');
 assert.match(engine,/const recipient=workingTeams\[targetPlayer\]\[targetIdx\]/);
 const valid=engine.indexOf('if(!isLegalSupportTarget(ownerState,player,targetPlayer,targetIdx,kind,');
 const spent=engine.indexOf('workingInventory[player][itemId]-=1;');
 assert.ok(valid>0 && spent>valid,'la convalida precede la spesa');
 assert.match(engine,/kind=itemDef.type==='revive'\?'revive':'alive'/);
 assert.match(engine,/workingHealingItemsUsed\[player\]=used\+1/);
 assert.match(engine,/isLegalSupportTarget\(/);
 assert.match(engine,/healFromVampiricBite\(options.attacker,/);
 assert.match(ui,/setActionMenuMode\('item_target:'\+itemId\)/);
 assert.match(ui,/targetPlayer:t.player,targetIdx:t.idx/);
 assert.match(ui,/legalSupportTargets\(gameState,playerRole,kind/);
 assert.match(ui,/Scegli chi rianimare/);
 assert.match(ui,/Torna allo zaino/);
 assert.match(ui,/targetMode === 'revive'/);
});
