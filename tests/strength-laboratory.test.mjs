import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CHARACTERS } from '../src/data/characters.js';
import { initialGameState } from '../src/systems/gameState.js';
import { updateLocalStatsImpl } from '../src/systems/profileSystem.js';
import { strengthLevel, strengthUpgradeCost, strengthTotalLevels, STRENGTH_STATS,
  canTrainCharacter, trainStrength, applyStrengthToFighter, strengthSummary } from '../src/systems/strengthLab.js';
import { buildEventBattle, normalizeEventSettings } from '../src/systems/multiverseEventEngine.js';

const kirby=CHARACTERS.find(c=>c.id==='kirby');
const carlos=CHARACTERS.find(c=>c.id==='carlos');
const base=()=>({coins:200,inventory:{},unlockedChars:['kirby','carlos'],strengthPoints:0,strengthUpgrades:{},chars:{},moves:{},matches:0,wins:0,playtime:0});
test('Tutti iniziano al livello 1; +1 per statistica, +10 al livello 10 e totale 30',()=>{
 assert.deepEqual(STRENGTH_STATS.map(s=>s.key),['atk','def','spd']);
 const profile=base();
 for(const key of ['atk','def','spd'])assert.equal(strengthLevel(profile.strengthUpgrades,kirby.id,key),1);
 const start=applyStrengthToFighter(kirby,profile.strengthUpgrades);
 assert.equal(start.atk,kirby.atk+1);
 assert.equal(start.def,kirby.def+1);
 assert.equal(start.spd,kirby.spd+1);
 const lvl10={kirby:{atk:10,def:10,spd:10}};
 const maxed=applyStrengthToFighter(kirby,lvl10);
 assert.equal(maxed.atk,kirby.atk+10);
 assert.equal(maxed.def,kirby.def+10);
 assert.equal(maxed.spd,kirby.spd+10);
 assert.equal(strengthTotalLevels(lvl10,'kirby'),30);
 assert.equal(strengthTotalLevels(profile.strengthUpgrades,'kirby'),3);
 assert.equal(applyStrengthToFighter(maxed,lvl10),maxed,'No doppia applicazione');
 assert.equal(kirby.atk,105,'Nessuna mutazione del roster');
 assert.equal(maxed.baseAtk,maxed.atk);
 assert.equal(maxed.baseDef,maxed.def);
 assert.equal(maxed.baseSpd,maxed.spd);
});
test('Costi: 1 → 2 costa 2, 2 → 3 costa 4 ... 9 → 10 costa 18',()=>{
 for(let lv=1;lv<10;lv++)assert.equal(strengthUpgradeCost(lv),lv*2);
 assert.equal(strengthUpgradeCost(10),0);
});
test('Valuta parte da zero: senza Punti Forza nessun potenziamento',()=>{
 const profile=base();
 const result=trainStrength(profile,kirby,'atk');
 assert.equal(result.ok,false);
 assert.equal(profile.strengthPoints,0);
 assert.equal(strengthLevel(profile.strengthUpgrades,'kirby','atk'),1);
});
test('Ogni statistica cresce indipendentemente e non può superare livello 10',()=>{
 let profile={...base(),strengthPoints:400};
 for(let i=0;i<9;i++){
  const r=trainStrength(profile,kirby,'atk');
  assert.equal(r.ok,true);
  assert.equal(r.cost,(i+1)*2);
  profile=r.profile;
 }
 assert.equal(strengthLevel(profile.strengthUpgrades,'kirby','atk'),10);
 assert.equal(strengthLevel(profile.strengthUpgrades,'kirby','def'),1);
 assert.equal(profile.strengthPoints,310);
 assert.equal(trainStrength(profile,kirby,'atk').ok,false);
 assert.equal(trainStrength(profile,kirby,'unknown').ok,false);
 const stats=strengthSummary(kirby,profile.strengthUpgrades);
 assert.equal(stats[0].value,kirby.atk+10);
 assert.equal(stats[0].cost,0);
 assert.equal(stats[1].cost,2);
});
test('Non si potenziano personaggi bloccati, evocazioni o boss',()=>{
 const profile=base();
 const locked=CHARACTERS.find(c=>c.price && !profile.unlockedChars.includes(c.id)&&!c.isSecretUnlock&&!c.isCampaignMonster);
 assert.ok(locked);
 assert.equal(canTrainCharacter(locked,profile),false);
 assert.equal(trainStrength({...profile,strengthPoints:100},locked,'def').ok,false);
 const boss=CHARACTERS.find(c=>c.isCampaignMonster||c.isSecretUnlock||c.isSummonOnly);
 assert.ok(boss);
 assert.equal(canTrainCharacter(boss,profile),false);
 assert.equal(canTrainCharacter(kirby,profile),true);
});
test('Acquisti gestiti tramite lo stesso profilo delle monete, con controllo saldo',()=>{
 let profile={...base(),strengthPoints:6};
 const previousStorage=globalThis.localStorage;
 const data=new Map();
 globalThis.localStorage={getItem:key=>data.get(key)||null,setItem:(key,v)=>data.set(key,v)};
 try {
  const getPlayerData=()=>JSON.parse(data.get('multiverse_rpg_global_profile')||JSON.stringify(profile));
  assert.equal(updateLocalStatsImpl({getPlayerData},{strengthUpgrade:{charId:'kirby',stat:'atk'}}).ok,true);
  profile=getPlayerData();
  assert.equal(profile.strengthPoints,4);
  assert.equal(profile.strengthUpgrades.kirby.atk,2);
  assert.equal(updateLocalStatsImpl({getPlayerData},{strengthUpgrade:{charId:'kirby',stat:'def'}}).ok,true);
  profile=getPlayerData();
  assert.equal(profile.strengthPoints,2);
  assert.equal(updateLocalStatsImpl({getPlayerData},{strengthUpgrade:{charId:'kirby',stat:'atk'}}).ok,false);
  assert.equal(getPlayerData().strengthPoints,2,'Un acquisto rifiutato non deve spendere saldo');
  assert.equal(getPlayerData().coins,200);
 } finally {globalThis.localStorage=previousStorage}
});
test('Statistiche personalizzate nel campo giocatore, senza applicarle alle CPU',()=>{
 const game=initialGameState();
 assert.deepEqual(game.playerStrength.p1,{});
 assert.deepEqual(game.playerStrengthOwned.p1,[]);
 const source=readFileSync(new URL('../src/systems/battleSystem.js',import.meta.url),'utf8');
 assert.match(source,/gameState\.playerStrength\?\.\[player\]/);
 assert.match(source,/gameState\.playerStrengthOwned\?\.\[player\]/);
 assert.match(source,/gameState\.isBot\?\.\[player\]/);
 assert.match(source,/char\.strengthApplied/);
});
test('La campagna utilizza i potenziamenti personali e mantiene i boss invariati',()=>{
 const text=readFileSync(new URL('../src/screens/campaign/CampaignTeamSelectView.jsx',import.meta.url),'utf8');
 assert.match(text,/canTrainCharacter\(baseChar,personal\)/);
 assert.match(text,/applyStrengthToFighter\(instance,personal\.strengthUpgrades\)/);
});
test('I giocatori portano i propri potenziamenti anche nel Torneo del Multiverso',()=>{
 const s=normalizeEventSettings({entrants:4,teamSize:4,fieldSize:1});
 const match={id:'lab-test',sideA:{name:'Alpha',members:['human']},sideB:{name:'Beta',members:['bot']}};
 const participant={
  human:{teamIds:['kirby','carlos','sage','yoshi'],strengthUpgrades:{kirby:{atk:10,def:5,spd:3}}},
  bot:{teamIds:['kirby','carlos','sage','yoshi']}
 };
 const battle=buildEventBattle(match,participant,s);
 const human= battle.teams.A.find(c=>c.id==='kirby');
 const cpu=battle.teams.B.find(c=>c.id==='kirby');
 assert.equal(human.atk,kirby.atk+10);
 assert.equal(human.def,kirby.def+5);
 assert.equal(human.spd,kirby.spd+3);
 assert.equal(cpu.atk,kirby.atk);
});
test('Il laboratorio ha selezione, conferma, barre, anteprima e menu',()=>{
 const view=readFileSync(new URL('../src/screens/hub/StrengthLabView.jsx',import.meta.url),'utf8');
 for(const term of ['Confermi il potenziamento','nextValue','role="progressbar"','Punti Forza','canTrainCharacter','onUpgrade'])
  assert.ok(view.includes(term),term);
 const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
 assert.match(app,/appMode === 'strength_lab'/);
 assert.match(app,/strengthPoints: 0/);
 const menu=readFileSync(new URL('../src/screens/hub/MenuView.jsx',import.meta.url),'utf8');
 assert.match(menu,/Laboratorio di Potenziamento/);
});
