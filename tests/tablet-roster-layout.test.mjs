import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const text=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const mainDraft=text('src/screens/battle/DraftingView.jsx');
const campaign=text('src/screens/campaign/CampaignTeamSelectView.jsx');
const protagonist=text('src/screens/campaign/CampaignSelectProtagonistView.jsx');
const roguelike=text('src/screens/roguelike/RoguelikeDraftView.jsx');

test('Il draft normale e quello condiviso mostrano massimo tre colonne su tablet',()=>{
 assert.equal((mainDraft.match(/grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6/g)||[]).length,2);
 assert.doesNotMatch(mainDraft,/md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9/);
 assert.match(mainDraft,/min-w-0/);
 assert.match(mainDraft,/sm:gap-4/);
 assert.match(mainDraft,/overflow-y-auto/);
});

test('La scelta squadra della Campagna lascia spazio ai PNG su tablet',()=>{
 assert.match(campaign,/grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6/);
 assert.doesNotMatch(campaign,/2xl:grid-cols-11/);
 assert.match(campaign,/max-h-\[60dvh\]/);
 assert.match(campaign,/h-28 sm:h-32 md:h-36/);
});

test('Il protagonista del Torneo non viene schiacciato in 6-8 colonne',()=>{
 assert.match(protagonist,/grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5/);
 assert.doesNotMatch(protagonist,/md:grid-cols-6 lg:grid-cols-8/);
 assert.match(protagonist,/h-28 sm:h-32 md:h-36/);
});

test('Le immagini dei personaggi non vengono ritagliate e i nomi restano leggibili',()=>{
 for(const [name,source] of [
  ['draft',mainDraft],['campagna',campaign],['protagonista',protagonist],['roguelike',roguelike]]){
  assert.match(source,/object-contain/,name+' senza PNG interi');
  assert.match(source,/line-clamp-2/,name+' senza nomi multi-riga');
  assert.match(source,/break-words/,name+' senza gestione nomi lunghi');
 }
 assert.match(mainDraft,/h-28 sm:h-32 md:h-36/);
 assert.match(mainDraft,/w-full h-24 sm:h-28 md:h-32/);
 assert.match(mainDraft,/w-full h-36 sm:h-40 md:h-44/);
 assert.match(roguelike,/h-28 sm:h-36 md:h-40/);
 assert.doesNotMatch(roguelike,/rounded-full object-cover/);
});

test('La scelta dei personaggi resta interattiva senza modificare il game logic',()=>{
 assert.match(mainDraft,/handlePick\(char\)/);
 assert.match(mainDraft,/handleSharedPick\(pIdx, activeTurnPlayer\)/);
 assert.match(campaign,/toggleChar\(id\)/);
 assert.match(protagonist,/protagonist: char.id/);
 assert.match(roguelike,/handlePick\(char.id\)/);
 assert.match(mainDraft,/aria-label="Già selezionato"/);
 assert.doesNotMatch(mainDraft,/opacity-50 grayscale' : 'border-slate-700/);
});
