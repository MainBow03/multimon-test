import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initialCampaignField, nextCampaignCommandIndex, shouldRecoverCampaignCommand } from '../src/systems/campaignBattleRecovery.js';
import { getActivePlayersImpl } from '../src/systems/multiplayerSystem.js';
import { CHARACTERS } from '../src/data/characters.js';
import { MOVES_DB } from '../src/data/moves.js';

const fixture=(p1,p2,actions={})=>({
  status:'battling',gameMode:'classica',isCampaignBattle:true,
  isBot:{p1:false,p2:true},players:{p1:'Resistenza',p2:'Cell'},
  field:{p1:initialCampaignField(p1,5),p2:initialCampaignField(p2,5)},
  teams:{p1,p2},actions:{p1:actions,p2:{}}
});

test('m37: nel rematch contro Cell gli avversari salvati con HP 0 non occupano un posto',()=>{
  const human=Array.from({length:5},(_,i)=>({id:'hero'+i,hp:40}));
  const bosses=[
    {id:'cell',hp:200}, {id:'celljr_1',hp:0}, {id:'celljr_2',hp:0},
    {id:'celljr_3',hp:0},{id:'celljr_4',hp:0}
  ];
  const state=fixture(human,bosses);
  assert.deepEqual(state.field.p2,[0]);
  assert.deepEqual(state.field.p1,[0,1,2,3,4]);
  assert.deepEqual(getActivePlayersImpl({gameState:state}),['p1','p2']);
  assert.equal(shouldRecoverCampaignCommand(state,'p1',-1),true);
  assert.equal(nextCampaignCommandIndex(state,'p1'),0);
});

test('campagna: recupera il prossimo personaggio vivo e senza azione',()=>{
  const p1=[{hp:0},{hp:80},{hp:70}];
  const state=fixture(p1,[{hp:95}]);
  assert.deepEqual(state.field.p1,[1,2]);
  assert.equal(nextCampaignCommandIndex(state,'p1'),0);
  assert.equal(shouldRecoverCampaignCommand(state,'p1',-1),true);
  assert.equal(shouldRecoverCampaignCommand(state,'p1',0),false);
  state.actions.p1={'1':{type:'attack',moveIdx:0}};
  assert.equal(nextCampaignCommandIndex(state,'p1'),1);
  assert.equal(shouldRecoverCampaignCommand(state,'p1',0),true);
  assert.equal(shouldRecoverCampaignCommand(state,'p1',1),false);
  state.actions.p1['2']={type:'attack',moveIdx:1};
  assert.equal(nextCampaignCommandIndex(state,'p1'),-1);
  assert.equal(shouldRecoverCampaignCommand(state,'p1',-1),false);
});

test('recupero non si attiva durante animazioni o in partite multiplayer',()=>{
  const state=fixture([{hp:60}],[{hp:80}]);
  state.isCampaignBattle=false;
  assert.equal(nextCampaignCommandIndex(state,'p1'),-1);
  state.isCampaignBattle=true;state.status='executing';
  assert.equal(nextCampaignCommandIndex(state,'p1'),-1);
  state.status='battling';state.isBot.p1=true;
  assert.equal(nextCampaignCommandIndex(state,'p1'),-1);
});

test('il codice di avvio e il renderer ripristinano comandi e azzerano il filmato precedente',()=>{
  const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
  const select=readFileSync(new URL('../src/screens/campaign/CampaignTeamSelectView.jsx',import.meta.url),'utf8');
  assert.match(app,/shouldRecoverCampaignCommand\(gameState,'p1',commandingIdx\)/);
  assert.match(app,/appMode !== 'local_room'/);
  assert.match(select,/setCommandingIdx\(0\)/);
  assert.match(select,/setIsPlayingEvents\(false\)/);
  assert.match(select,/initialCampaignField\(p2Team, state.settings.fieldSize\)/);
  assert.match(select,/Number\(savedC.hp\) > 0/);
});

test('i tre potenziamenti restano piccoli e rispettano i valori concordati',()=>{
  const byId=id=>CHARACTERS.find(c=>c.id===id);
  assert.equal(byId('carlos').atk,100);
  assert.equal(byId('carlos').spd,80);
  assert.equal(byId('kevin').atk,100);
  assert.equal(MOVES_DB['Pugno Minerale'].power,80);
  assert.equal(byId('spyro').hp,95);
  assert.equal(byId('spyro').maxHp,95);
  assert.equal(byId('spyro').def,75);
});
