import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTERS } from '../src/data/characters.js';
import { FUSION_CHARACTERS } from '../src/data/fusions.js';
import { MASTERY_CHARACTER_TITLES } from '../src/data/masteryTitles.js';
import { MASTERY_ELIGIBLE_IDS, MASTERY_MAX_XP, masteryTitle,
  isMasteryEligible, isMasteryUnlocked, equippedMasteryTitle } from '../src/systems/masterySystem.js';

test('Ogni Multimon eleggibile ha esattamente un titolo autoriale non generico',()=>{
  const eligible=CHARACTERS.filter(isMasteryEligible);
  assert.equal(eligible.length,136,'Se cambia il roster, aggiungere i titoli dei nuovi Multimon');
  assert.equal(Object.keys(MASTERY_CHARACTER_TITLES).length,eligible.length);
  assert.deepEqual(new Set(Object.keys(MASTERY_CHARACTER_TITLES)),new Set(eligible.map(x=>x.id)));
  for(const char of eligible){
    const title=masteryTitle(char);
    assert.equal(typeof title,'string',char.id);
    assert.ok(title.trim().length>=4,char.id+' senza titolo');
    assert.ok(!title.startsWith('Leggenda di '),char.id+' ha un vecchio titolo generico');
    assert.ok(!title.toLowerCase().includes('undefined'),char.id);
  }
  const names=eligible.map(x=>masteryTitle(x).toLocaleLowerCase('it').trim());
  assert.equal(new Set(names).size,names.length,'I titoli devono essere tutti differenti');
});

test('Sage ottiene Guaritrice, i quattro titoli storici restano invariati',()=>{
  const byId=id=>CHARACTERS.find(x=>x.id===id);
  assert.equal(masteryTitle(byId('sage')),'Guaritrice');
  assert.equal(masteryTitle(byId('nicole')),'La Mamma Demoniaca');
  assert.equal(masteryTitle(byId('alphonse')),'Trasmutatore Supremo');
  assert.equal(masteryTitle(byId('cyborg')),'Titano Indistruttibile');
  assert.equal(masteryTitle(byId('hannibal')),'Burattinaio della Mente');
});

test('I titoli sono equipaggiabili solo dal livello 20 e si aggiornano anche nei vecchi salvataggi',()=>{
  const id='sage',char=CHARACTERS.find(x=>x.id===id);
  const profile={equippedMasteryTitle:id,mastery:{sage:MASTERY_MAX_XP-1}};
  assert.equal(isMasteryUnlocked(profile,id),false);
  assert.equal(equippedMasteryTitle(profile,CHARACTERS),'');
  const unlocked={...profile,mastery:{sage:MASTERY_MAX_XP}};
  assert.equal(isMasteryUnlocked(unlocked,id),true);
  assert.equal(equippedMasteryTitle(unlocked,CHARACTERS),'Guaritrice');
  assert.equal(equippedMasteryTitle({...unlocked,equippedMasteryTitle:null},CHARACTERS),'');
  assert.equal(masteryTitle(char),'Guaritrice');
  assert.equal(MASTERY_ELIGIBLE_IDS.has(id),true);
});

test('Mostri campagna, evocazioni, boss e fusioni restano senza padronanza',()=>{
  for(const char of [...CHARACTERS,...FUSION_CHARACTERS].filter(x=>!isMasteryEligible(x))){
    assert.equal(masteryTitle(char),'',char.id);
    assert.equal(Object.prototype.hasOwnProperty.call(MASTERY_CHARACTER_TITLES,char.id),false,char.id);
  }
});
