import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {
 BATTLE_TEAM_PRESET_SLOTS,battleTeamOwnerKey,battleTeamSlots,
 saveBattleTeamPreset,deleteBattleTeamPreset,
 loadBattleTeamPreset,battleTeamPresetsAllowed
} from '../src/systems/battleTeamPresets.js';
import {updateLocalStatsImpl} from '../src/systems/profileSystem.js';

const chosen=CHARACTERS.filter(c=>!c.isSummonOnly&&!c.isSecretUnlock&&!c.isCampaignMonster)
 .slice(0,10);
assert.ok(chosen.length>=8);
const members=(n,start=0)=>chosen.slice(start,start+n).map(c=>({id:c.id}));
const save=(profile,owner,size,slot,roster=members(size),name)=>saveBattleTeamPreset(
 profile,{owner,size,slot,members:roster,name:name||'Squadra '+(slot+1)}
);

test('Tre slot per dimensione: 3x5 e 3x6 rimangono indipendenti',()=>{
 assert.equal(BATTLE_TEAM_PRESET_SLOTS,3);
 let profile={};
 for(let i=0;i<3;i++){
  const r=save(profile,'Sega',5,i,members(5),'Cinque '+(i+1));
  assert.equal(r.ok,true);profile=r.profile;
 }
 for(let i=0;i<3;i++){
  const r=save(profile,'Sega',6,i,members(6),'Sei '+(i+1));
  assert.equal(r.ok,true);profile=r.profile;
 }
 assert.deepEqual(battleTeamSlots(profile,'Sega',5).map(t=>t.name),
  ['Cinque 1','Cinque 2','Cinque 3']);
 assert.deepEqual(battleTeamSlots(profile,'Sega',6).map(t=>t.name),
  ['Sei 1','Sei 2','Sei 3']);
 assert.deepEqual(battleTeamSlots(profile,'Sega',7),[null,null,null]);
 assert.equal(save(profile,'Sega',5,3).ok,false,'Non creare il quarto slot');
 assert.equal(save(profile,'Sega',11,0).ok,false,'Limite dell host: 10');
 assert.equal(save(profile,'Sega',5,0,members(4)).ok,false,'Non salvare squadre incomplete');
 assert.equal(save(profile,'Sega',5,0,Array(5).fill(members(5)[0])).ok,false,'Non duplicare Multimon');
 const overwrite=save(profile,'Sega',5,1,members(5,2),'Anti Drago');
 assert.equal(overwrite.ok,true);
 assert.equal(battleTeamSlots(overwrite.profile,'Sega',5)[1].name,'Anti Drago');
 assert.equal(battleTeamSlots(overwrite.profile,'Sega',5)[0].name,'Cinque 1');
 assert.equal(battleTeamSlots(overwrite.profile,'Sega',6)[1].name,'Sei 2');
});

test('I preset sono separati per giocatore e possono essere cancellati senza perdere gli altri',()=>{
 let p=save({},'Giocatore A',5,0);
 assert.equal(p.ok,true);
 p=save(p.profile,'Giocatore B',5,0,members(5,1),'Team B');
 assert.equal(p.ok,true);
 assert.equal(battleTeamOwnerKey('GIOCATORE A'),'giocatore a');
 assert.equal(battleTeamSlots(p.profile,'Giocatore A',5)[0].name,'Squadra 1');
 assert.equal(battleTeamSlots(p.profile,'Giocatore B',5)[0].name,'Team B');
 const before=p.profile;
 const next=deleteBattleTeamPreset(before,{owner:'Giocatore A',size:5,slot:0});
 assert.equal(next.ok,true);
 assert.deepEqual(battleTeamSlots(next.profile,'Giocatore A',5),[null,null,null]);
 assert.equal(battleTeamSlots(next.profile,'Giocatore B',5)[0].name,'Team B');
 assert.ok(battleTeamSlots(before,'Giocatore A',5)[0],'Non modificare il salvataggio originale');
});

test('Il caricamento usa i personaggi aggiornati, controlla sblocchi, ban e slot del match',()=>{
 const roster=chosen.slice(0,6);
 const preset={name:'Difesa',members:roster.slice(0,5).map(c=>({id:c.id}))};
 const loaded=loadBattleTeamPreset(preset,roster,5,{});
 assert.equal(loaded.ok,true);
 assert.deepEqual(loaded.team.map(c=>c.id),preset.members.map(m=>m.id));
 assert.ok(loaded.team.every(c=>Array.isArray(c.statuses)&&!c.statuses.length));
 assert.ok(loaded.team.every(c=>c.moves.every(m=>m.remainingUses===m.maxUses||
  (m.maxUses===undefined&&m.remainingUses===null))));
 assert.equal(loadBattleTeamPreset(preset,roster,6,{}).ok,false);
 assert.equal(loadBattleTeamPreset(preset,roster.slice(1),5,{}).ok,false,
  'Il primo Multimon bannato o bloccato fa rifiutare tutto il team');
 assert.deepEqual(preset.members.map(m=>m.id),roster.slice(0,5).map(c=>c.id));
});

test('Gli oggetti vengono ripristinati solo se posseduti, senza duplicare una copia',()=>{
 const preset={members:members(3).map((m,i)=>({
  ...m,heldItem:i<2?'iperband':'avanzi'
 }))};
 const loaded=loadBattleTeamPreset(preset,chosen,3,{iperband:1,avanzi:0});
 assert.equal(loaded.ok,true);
 assert.equal(loaded.team[0].heldItem,'iperband');
 assert.notEqual(loaded.team[1].heldItem,'iperband');
 assert.notEqual(loaded.team[2].heldItem,'avanzi');
 assert.equal(loaded.unequipped,2);
});

test('Il pulsante delle squadre è disattivato nei draft casuali, condivisi, in nolo o durante Ascesa',()=>{
 const room=(options={},mode='classica')=>({
  gameMode:mode,settings:{...options},isRoguelikeCoop:false
 });
 assert.equal(battleTeamPresetsAllowed(room()),true);
 assert.equal(battleTeamPresetsAllowed(room({},'ultimon')),true);
 assert.equal(battleTeamPresetsAllowed(room({sharedDraft:true})),false);
 assert.equal(battleTeamPresetsAllowed(room({draftBattle:true})),false);
 assert.equal(battleTeamPresetsAllowed(room({rentalMode:true})),false);
 assert.equal(battleTeamPresetsAllowed(room({},'ascension')),false);
 assert.equal(battleTeamPresetsAllowed({...room(),isRoguelikeCoop:true}),false);
});

test('Il profilo salva la squadra nella stessa chiave usata dal salvataggio cloud',()=>{
 const data={matches:0,wins:0,playtime:0,chars:{},moves:{},unlockedChars:[],
   inventory:{},coins:100};
 const memory=new Map([['multiverse_rpg_global_profile',JSON.stringify(data)]]);
 const previous=globalThis.localStorage;
 globalThis.localStorage={
  getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),
  removeItem:k=>memory.delete(k),get length(){return memory.size;},
  key:i=>[...memory.keys()][i]??null
 };
 try{
  const result=updateLocalStatsImpl({getPlayerData:()=>data},{
   battleTeamPresetSave:{owner:'Alice',size:5,slot:0,members:members(5),name:'Prima'}
  });
  assert.equal(result.ok,true);
  const profile=JSON.parse(memory.get('multiverse_rpg_global_profile'));
  assert.equal(battleTeamSlots(profile,'Alice',5)[0].name,'Prima');
  assert.equal(updateLocalStatsImpl({getPlayerData:()=>profile},{
   battleTeamPresetDelete:{owner:'Alice',size:5,slot:0}
  }).ok,true);
  const after=JSON.parse(memory.get('multiverse_rpg_global_profile'));
  assert.equal(battleTeamSlots(after,'Alice',5)[0],null);
 }finally{globalThis.localStorage=previous;}
});

test('Menu nuovo, menu classico e draft offrono accesso alla squadra lotta salvata',()=>{
 const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
 const app=read('../src/App.jsx');
 const modern=read('../src/screens/hub/MenuDashboard.jsx');
 const classic=read('../src/screens/hub/MenuView.jsx');
 const draft=read('../src/screens/battle/DraftingView.jsx');
 const manager=read('../src/screens/hub/BattleTeamsView.jsx');
 assert.match(app,/appMode === 'battle_teams'/);
 assert.match(modern,/setAppMode\('battle_teams'\)/);
 assert.match(classic,/setAppMode\('battle_teams'\)/);
 assert.match(draft,/loadBattleTeamPreset\(chosen,draftableChars,myTeamSize,heldInventory\)/);
 assert.match(draft,/savedTeamSlots\.map/);
 assert.match(draft,/updateState\(\{\[\`draft\.\$\{playerRole\}\`\]:restored\.team\}\)/);
 assert.match(draft,/updateLocalStats\(\{battleTeamPresetSave/);
 assert.match(manager,/Scegli una delle 3 squadre da/);
 assert.match(manager,/BATTLE_TEAM_PRESET_SLOTS/);
});
