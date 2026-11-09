import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {normalizeEventSettings,activeEventFighters} from '../src/systems/multiverseEventEngine.js';
import {buildStandardEventBattle,adaptTournamentToClassic,translateTournamentCommands,resolveEventWithStandardEngine} from '../src/systems/standardEventTurn.js';
const text=file=>readFileSync(new URL(file,import.meta.url),'utf8');
const teamA=['ladybug','finn','spyro','garnet'];
const teamB=['charizard','garnet','finn','dante'];
for(const id of [...teamA,...teamB])assert.ok(CHARACTERS.some(c=>c.id===id),id);
function start(fieldSize=2){
 const settings=normalizeEventSettings({entrants:4,teamSize:4,fieldSize,allowHyper:true});
 const people={u1:{uid:'u1',name:'Giocatore uno',teamIds:teamA,ready:true},
               u2:{uid:'u2',name:'Giocatore due',teamIds:teamB,ready:true}};
 const match={id:'m1',sideA:{id:'a',name:'A',members:['u1']},
   sideB:{id:'b',name:'B',members:['u2']}};
 return {settings,battle:buildStandardEventBattle(match,people,settings)};
}

test('Nessuna vista autonoma del Torneo: usa la stessa BattlingView delle altre modalità',()=>{
 const oldUrl=new URL('../src/screens/events/EventClassicBattleView.jsx',import.meta.url);
 assert.equal(existsSync(oldUrl),false);
 const scene=text('../src/screens/events/StandardTournamentBattle.jsx');
 const main=text('../src/App.jsx'),hub=text('../src/screens/events/MultiverseEventHub.jsx');
 assert.match(scene,/import \{renderBattlingView\} from '\.\.\/battle\/BattlingView\.jsx'/);
 assert.match(main,/import \{ renderBattlingView \} from '\.\/screens\/battle\/BattlingView\.jsx'/);
 assert.match(scene,/renderBattlingView\(\{/);
 assert.match(hub,/<StandardTournamentBattle/);
 assert.doesNotMatch(hub,/<Arena|EventClassicBattleView/);
 assert.doesNotMatch(scene,/CONFERMA LE MOSSE|function HealthBar|function Icon\(/);
 assert.match(scene,/handleSelectMoveTargetImpl\(\{/);
 assert.match(scene,/const allSelected=active\.length/);
 assert.match(scene,/submit\(active\.map\(c=>moveDraft\[c\.key\]\)\)/);
});

test('Le icone sono le stesse identiche componenti condivise nell’App e nel torneo',()=>{
 const main=text('../src/App.jsx'),scene=text('../src/screens/events/StandardTournamentBattle.jsx');
 for(const name of ['ChevronRight','Loader2','LogOut','ScrollText','Shield','Target','Trophy','XIcon']){
  assert.match(text('../src/components/BattleIcons.jsx'),new RegExp('export const '+name+' ='));
  assert.ok(main.includes(name),'App non usa più '+name);
  assert.ok(scene.includes(name),'Torneo non usa più '+name);
 }
});

test('Azioni di supporto e selezione bersagli multipli arrivano al vero motore',()=>{
 const {battle,settings}=start(2),converted=adaptTournamentToClassic(battle,settings);
 const actors=activeEventFighters(battle,'A',settings);
 const enemies=activeEventFighters(battle,'B',settings);
 const ladybug=actors.find(c=>c.id==='ladybug');
 assert.ok(ladybug);
 const healIndex=converted.teams.p1.find(c=>c.key===ladybug.key).moves.findIndex(m=>m.targetMode==='team_smart_heal');
 assert.ok(healIndex>=0);
 const support=translateTournamentCommands(battle,{u1:[{actor:ladybug.key,moveIndex:healIndex,target:ladybug.key}]},converted);
 const index=converted.teams.p1.findIndex(c=>c.key===ladybug.key);
 assert.equal(support.p1[index].targetPlayer,'p1');
 assert.equal(support.p1[index].targetIdx,index);
 const anyAttack=converted.teams.p1[index].moves.findIndex(m=>m.power>0);
 assert.ok(anyAttack>=0);
 const multi=translateTournamentCommands(battle,{u1:[{actor:ladybug.key,moveIndex:anyAttack,
   target:enemies[0].key,selectedTargets:enemies.map(c=>c.key)}]},converted);
 assert.equal(multi.p1[index].selectedTargets.length,2);
 assert.deepEqual(multi.p1[index].selectedTargets.map(t=>t.player),['p2','p2']);
 assert.deepEqual(multi.p1[index].selectedTargets.map(t=>t.fieldIdx),[0,1]);
});

test('Il flusso ufficiale produce gli stessi eventi di animazione che legge la schermata',()=>{
 const {battle,settings}=start(1);
 const first=activeEventFighters(battle,'A',settings)[0];
 const enemy=activeEventFighters(battle,'B',settings)[0];
 const i1=first.moves.findIndex(m=>m.power>0),i2=enemy.moves.findIndex(m=>m.power>0);
 assert.ok(i1>=0&&i2>=0);
 const next=resolveEventWithStandardEngine(battle,{
  u1:[{actor:first.key,moveIndex:i1,target:enemy.key}],
  u2:[{actor:enemy.key,moveIndex:i2,target:first.key}]
 },settings);
 assert.equal(next.playback.turn,next.turn);
 assert.ok(next.playback.events.length>0);
 assert.ok(next.playback.startTeams.p1.length>0);
 assert.ok(next.playback.startField.p1.length>0);
 const scene=text('../src/screens/events/StandardTournamentBattle.jsx');
 assert.match(scene,/playback\.startTeams/);
 assert.match(scene,/evt\.type==='damage'/);
 assert.match(scene,/evt\.type==='switch'/);
 assert.match(scene,/evt\.type==='hyper_transform'/);
});
