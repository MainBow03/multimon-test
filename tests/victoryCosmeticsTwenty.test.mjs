import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {VICTORY_EFFECTS,purchaseVictoryEffect,equipVictoryEffect,
 equippedVictoryEffect,victoryCelebrationForRoom} from '../src/systems/victoryCosmetics.js';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const ids=['meteorcrown','roseeclipse','royalcards','mechaforge'];

test('Sono disponibili 20 animazioni con quattro nuovi effetti realmente distinti',()=>{
 assert.equal(VICTORY_EFFECTS.length,20);
 assert.equal(new Set(VICTORY_EFFECTS.map(x=>x.id)).size,20);
 assert.equal(new Set(VICTORY_EFFECTS.map(x=>x.name)).size,20);
 const css=read('../src/screens/battle/VictoryCelebration.css');
 const jsx=read('../src/screens/battle/VictoryCelebration.jsx');
 const frames=['victory-meteor-coronation','victory-eclipse-ring',
    'victory-card-fan','victory-forge-strike'];
 for(let i=0;i<ids.length;i++){
   const id=ids[i];
   assert.ok(VICTORY_EFFECTS.some(e=>e.id===id),id);
   assert.match(css,new RegExp('victory-cinema--'+id));
   assert.match(css,new RegExp('@keyframes '+frames[i]));
   assert.match(jsx,new RegExp('victory-cinema-'+id));
 }
 assert.match(css,/prefers-reduced-motion:reduce/);
 const shop=read('../src/screens/hub/ShopView.jsx');
 assert.match(shop,/Animazioni di Vittoria · \{VICTORY_EFFECTS\.length\}/);
 assert.match(shop,/setVictoryPreview\(effect\)/);
});

test('Libro delle Leggende: VITTORIA resta leggibile e indipendente dalla copertina che gira',()=>{
 const jsx=read('../src/screens/battle/VictoryCelebration.jsx');
 const css=read('../src/screens/battle/VictoryCelebration.css');
 assert.match(jsx,/className="victory-book-title">✦ VITTORIA ✦<\/div>/);
 assert.doesNotMatch(css,/victory-book-cover::after/);
 assert.match(css,/\.victory-book-title\{/);
 assert.match(css,/direction:ltr;unicode-bidi:isolate/);
 assert.match(css,/@keyframes victory-book-title-reveal/);
 assert.match(css,/\.victory-book-cover\{[^}]*animation:victory-book-cover/s);
});

test('Drago delle Costellazioni: corpo e testa in un unico SVG con proporzioni mantenute',()=>{
 const jsx=read('../src/screens/battle/VictoryCelebration.jsx');
 const css=read('../src/screens/battle/VictoryCelebration.css');
 assert.match(jsx,/className="victory-dragon-figure" viewBox="0 0 800 410" preserveAspectRatio="xMidYMid meet"/);
 assert.match(jsx,/className="victory-dragon-body"/);
 assert.match(jsx,/className="victory-dragon-head"/);
 assert.match(jsx,/className="victory-dragon-tail"/);
 assert.match(jsx,/className="victory-dragon-star"/);
 assert.doesNotMatch(css,/victory-cinema-astraldragon::before/);
 assert.doesNotMatch(css,/victory-cinema-astraldragon::after/);
 assert.match(css,/\.victory-dragon-figure\{/);
 assert.match(css,/@keyframes victory-dragon-glide/);
});

test('I quattro nuovi cosmetici si acquistano, equipaggiano e funzionano nelle vittorie online',()=>{
 let profile={coins:450,victoryEffects:[],equippedVictoryEffect:null};
 for(const id of ids){
   const bought=purchaseVictoryEffect(profile,id);
   assert.equal(bought.ok,true,id);
   profile=bought.profile;
   assert.equal(profile.coins,450-(profile.victoryEffects.length*100));
   assert.equal(purchaseVictoryEffect(profile,id).ok,false);
   const equipped=equipVictoryEffect(profile,id);
   assert.equal(equipped.ok,true);
   assert.equal(equippedVictoryEffect(equipped.profile),id);
   const state={gameMode:'classica',status:'gameover',phaseStartedAt:30,
     players:{p1:'Uno',p2:'Due'},winner:'Uno',
     teams:{p1:[{id:'starbutterfly',img:'/star.png',hp:100}],p2:[]},
     playerVictoryEffects:{p1:id}};
   const celebration=victoryCelebrationForRoom(state,equipped.profile,'online_room');
   assert.equal(celebration.effect.id,id);
   assert.equal(celebration.winnerName,'Uno');
 }
 assert.equal(profile.coins,50);
 assert.deepEqual(profile.victoryEffects,ids);
});
