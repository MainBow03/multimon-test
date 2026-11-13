import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  applyBattleUsageSnapshot,backfillChosenCharacters,careerTopThree,
  isVoluntaryBattleMode,normalizeCareerProfile
} from '../src/systems/careerStats.js';

const snapshot=(id,mode,chars=['sonic'])=>({
  battleId:id,player:'p1',mode,chars,moves:{'Pugno':1}
});

test('Modalità storia/campagna escluse dai preferiti, ma non dai contatori carriera',()=>{
  for(const mode of ['campagna','campaign','storia','story'])
    assert.equal(isVoluntaryBattleMode(mode),false);
  for(const mode of ['classica','roguelike','roguelike_coop','multipla','ultimon'])
    assert.equal(isVoluntaryBattleMode(mode),true);
  assert.equal(isVoluntaryBattleMode(undefined),false);
  let p=normalizeCareerProfile({matches:0,chars:{},moves:{}},[]).profile;
  p=applyBattleUsageSnapshot(p,snapshot('campaign01','campagna',['starbutterfly','coraline'])).profile;
  assert.equal(p.matches,1);
  assert.equal(p.chars.starbutterfly,1);
  assert.equal(p.chars.coraline,1);
  assert.deepEqual(p.chosenChars,{});
  assert.equal(p.moves.Pugno,1,'Lo storico delle mosse resta generale');
  p=applyBattleUsageSnapshot(p,snapshot('free01','classica',['sonic','coraline'])).profile;
  assert.equal(p.matches,2);
  assert.equal(p.chars.coraline,2);
  assert.equal(p.chosenChars.coraline,1);
  assert.equal(p.chosenChars.sonic,1);
  assert.equal(p.chosenChars.starbutterfly,undefined);
  assert.equal(p.moves.Pugno,2);
});

test('La classifica è determinata dalle scelte libere, non dai personaggi di campagna',()=>{
  let p=normalizeCareerProfile({chars:{},moves:{}},[]).profile;
  for(let i=0;i<10;i++)
    p=applyBattleUsageSnapshot(p,snapshot('story'+i,'campagna',['coraline'])).profile;
  for(let i=0;i<3;i++)
    p=applyBattleUsageSnapshot(p,snapshot('free'+i,'classica',['robin'])).profile;
  p=applyBattleUsageSnapshot(p,snapshot('freeX','roguelike',['coraline'])).profile;
  const leaders=careerTopThree(p.chosenChars,{robin:'Robin',coraline:'Coraline'});
  assert.deepEqual(leaders.map(c=>c.name),['Robin','Coraline']);
  assert.equal(p.chars.coraline,11);
  assert.equal(p.chosenChars.coraline,1);
  assert.equal(p.chosenChars.robin,3);
});

test('Gli snapshot successivi non duplicano schieramenti né le preferenze',()=>{
  let p=normalizeCareerProfile({chars:{},moves:{}},[]).profile;
  const first=snapshot('same','classica',['sonic']);
  p=applyBattleUsageSnapshot(p,first).profile;
  assert.equal(applyBattleUsageSnapshot(p,first).changed,false);
  assert.equal(p.chosenChars.sonic,1);
  p=applyBattleUsageSnapshot(p,{...first,chars:['sonic','luigi'],moves:{Pugno:3}}).profile;
  assert.equal(p.chosenChars.sonic,1);
  assert.equal(p.chosenChars.luigi,1);
  assert.equal(p.moves.Pugno,3);
  assert.equal(applyBattleUsageSnapshot(p,{...first,chars:['sonic','luigi'],moves:{Pugno:3}}).changed,false);
  const campaign=snapshot('sameCampaign','campagna',['tails']);
  p=applyBattleUsageSnapshot(p,campaign).profile;
  assert.equal(p.chosenChars.tails,undefined);
  p=applyBattleUsageSnapshot(p,{...campaign,chars:['tails','stellarubia']}).profile;
  assert.equal(p.chars.stellarubia,1);
  assert.equal(p.chosenChars.stellarubia,undefined);
});

test('Migra solo partite libere identificabili dai ledger precedenti, una sola volta',()=>{
  const legacy={
    matches:50,wins:10,
    chars:{coraline:30,sonic:12,robin:8},
    moves:{Fulmine:30},
    careerBattleLedger:{
      'a:p1':{mode:'campagna',chars:['coraline'],moves:{Fulmine:3}},
      'b:p1':{mode:'campagna',chars:['coraline','robin']},
      'c:p1':{mode:'classica',chars:['sonic','robin']},
      'd:p1':{mode:'roguelike',chars:['sonic']},
      'e:p1':{chars:['coraline','sonic']}, // vecchio: modalità sconosciuta
    }
  };
  assert.deepEqual(backfillChosenCharacters(legacy.careerBattleLedger),{sonic:2,robin:1});
  const migrated=normalizeCareerProfile(legacy,[]);
  assert.equal(migrated.changed,true);
  assert.deepEqual(migrated.profile.chosenChars,{sonic:2,robin:1});
  assert.deepEqual(migrated.profile.chars,legacy.chars,'Non alterare lo storico della carriera');
  assert.equal(migrated.profile.moves.Fulmine,30);
  const again=normalizeCareerProfile(migrated.profile,[]);
  assert.equal(again.changed,false);
  assert.deepEqual(again.profile.chosenChars,{sonic:2,robin:1});
  const applied=applyBattleUsageSnapshot(again.profile,snapshot('f','campagna',['coraline']));
  assert.deepEqual(applied.profile.chosenChars,{sonic:2,robin:1});
});

test('I preferiti rimangono persistenti anche quando i checkpoint vecchi vengono eliminati',()=>{
  const initial={
    chosenCharsVersion:1,chosenChars:{sonic:83},
    chars:{sonic:110},moves:{},matches:110,
    careerBattleLedger:Object.fromEntries(
      Array.from({length:400},(_,i)=>['old'+i+':p1',{mode:'classica',chars:['sonic'],moves:{}}])
    )
  };
  const p=applyBattleUsageSnapshot(initial,snapshot('new','classica',['sonic'])).profile;
  assert.equal(Object.keys(p.careerBattleLedger).length,400);
  assert.equal(p.chosenChars.sonic,84,'Il podio non si azzera col troncamento del ledger');
  assert.equal(p.chars.sonic,111);
  const afterLoad=normalizeCareerProfile(p,[]);
  assert.equal(afterLoad.changed,false);
  assert.equal(afterLoad.profile.chosenChars.sonic,84);
});

test('La scheda podio e la classifica completa leggono chosenChars, non i totali misti',()=>{
  const c=readFileSync(new URL('../src/screens/hub/StatsView.jsx',import.meta.url),'utf8');
  assert.match(c,/const chosenCharacters=stats\.chosenChars\|\|\{\};/);
  assert.match(c,/careerTopThree\(chosenCharacters,charNames\)/);
  assert.match(c,/Object\.entries\(chosenCharacters\)/);
  assert.match(c,/Le campagne sono escluse/);
});
