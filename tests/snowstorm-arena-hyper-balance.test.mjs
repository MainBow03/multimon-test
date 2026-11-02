import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = file => readFileSync(new URL(file, import.meta.url), 'utf8');

test('Il campo innevato si attiva solamente con Tempesta di neve', () => {
  const view = read('../src/screens/battle/BattlingView.jsx');
  const css = read('../src/styles.css');
  assert.match(view, /gameState\.battleWeather\?\.type === 'snowstorm' \? 'battlefield-snowstorm' : 'bg-slate-950'/);
  assert.match(css, /\.battlefield-snowstorm\s*\{/);
  assert.match(css, /\.battlefield-snowstorm::after/);
  assert.match(css, /@keyframes multimon-snowfall/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(view, /TEMPESTA DI NEVE/);
});

test('Le Iper delle battaglie normali hanno bonus +35% alla base e ai valori correnti', () => {
  const battle = read('../src/systems/battleSystem.js');
  const start = battle.indexOf('// --- 1. PRE-PASS: ELABORAZIONE FORMA IPER');
  const end = battle.indexOf('// Chi entra sul campo DOPO la Trappola Segreta', start);
  assert.ok(start > 0 && end > start);
  const hyper = battle.slice(start, end);
  for (const stat of ['atk','def','spd']) {
    const suffix = stat[0].toUpperCase() + stat.slice(1);
    assert.ok(hyper.includes(`char.base${suffix} = Math.floor(char.base${suffix} * 1.35)`));
    assert.ok(hyper.includes(`char.${stat} = Math.floor(char.${stat} * 1.35)`));
  }
  assert.doesNotMatch(hyper, /char\.(?:atk|def|spd|baseAtk|baseDef|baseSpd) = Math\.floor\(char\.\w+ \* 1\.5\)/);
  assert.match(hyper, /char\.id === 'gardevoir'/, 'Le trasformazioni speciali devono restare');
});

test('Le Iper del torneo mantengono lo stesso piccolo nerf', () => {
  const event = read('../src/systems/multiverseEventEngine.js');
  const i = event.indexOf('if(s.allowHyper&&command.hyper');
  assert.ok(i > 0);
  const snippet = event.slice(i, i + 790);
  for (const stat of ['atk','spAtk','maxHp','hp','baseAtk','baseSpAtk']) {
    assert.match(snippet, new RegExp(`actor\\.${stat}[^;]*1\\.35`));
  }
  assert.match(event, /if\(hitAny&&m\.snowstormTurns\)/, 'Il torneo mantiene la tempesta');
});
