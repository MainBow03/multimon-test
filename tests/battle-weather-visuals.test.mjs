import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');

test('Meteo animati: pioggia, neve, erba e Tailwind senza cambiare le regole di gioco',()=>{
 const jsx=read('../src/components/BattleWeatherParticles.jsx');
 const css=read('../src/components/BattleWeatherParticles.css');
 const battle=read('../src/screens/battle/BattlingView.jsx');
 assert.match(battle,/battlefield-rainstorm/);
 assert.match(battle,/<BattleWeatherParticles weather=\{gameState\.battleWeather\} tailwind=\{gameState\.battleTailwind\}\s*\/>/);
 for(const type of ['rainstorm','snowstorm','lush_grass']){
   assert.match(jsx,new RegExp(type));
   assert.match(css,new RegExp('battle-weather-particle--'+type));
 }
 assert.match(css,/@keyframes multimon-rain-drop/);
 assert.match(css,/@keyframes multimon-large-snow/);
 assert.match(css,/@keyframes multimon-grass-pollen/);
 assert.match(css,/@keyframes multimon-wind-stream/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/pointer-events:none/);
});

test('Indicatore meteo in alto a destra e senza coprire il centro dell\'arena',()=>{
 const battle=read('../src/screens/battle/BattlingView.jsx');
 const css=read('../src/components/BattleWeatherParticles.css');
 assert.match(battle,/className="battle-weather-hud"/);
 assert.match(battle,/TEMPESTA DI NEVE/);
 assert.match(battle,/TEMPESTA/);
 assert.match(battle,/ERBA RIGOGLIOSA/);
 assert.match(battle,/TAILWIND/);
 assert.match(css,/\.battle-weather-hud\s*\{[^}]*top:12px;right:12px/s);
 assert.doesNotMatch(battle,/top-\[7\.5rem\]/);
});
