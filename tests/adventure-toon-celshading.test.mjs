import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildAdventureMesh,ADVENTURE_TOON_STYLE,adventureToonLightBand}
 from '../src/screens/adventure/AdventureWorldRenderer.js';
import {createAdventureSave} from '../src/systems/adventureCampaign.js';
import {CHARACTERS} from '../src/data/characters.js';

const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');

test('Cel-shading in tre/quattro fasce, colori e silhouette calcolati senza librerie',()=>{
 assert.deepEqual(ADVENTURE_TOON_STYLE.lightDirection,[-.45,.88,.32]);
 assert.deepEqual(ADVENTURE_TOON_STYLE.bands,[.32,.57,.79]);
 assert.equal(adventureToonLightBand(.2),.57);
 assert.equal(adventureToonLightBand(.40),.76);
 assert.equal(adventureToonLightBand(.65),1.04);
 assert.equal(adventureToonLightBand(.94),1.2);
 assert.ok(ADVENTURE_TOON_STYLE.outlineDarkness>.5);
 assert.ok(ADVENTURE_TOON_STYLE.outlineThreshold>0);
 const shader=read('../src/screens/adventure/AdventureWorldRenderer.js');
 assert.match(shader,/float band= vDiffuse>\.79\?/);
 assert.match(shader,/vRim=pow\(/);
 assert.match(shader,/vec3 shade=mix\(/);
 assert.match(shader,/vec3 finalColor=mix\(inked,uFogColor,vFog\)/);
});

test('Postprocess contorni reali su texture GPU con fallback automatico',()=>{
 const renderer=read('../src/screens/adventure/AdventureWorldRenderer.js');
 assert.match(renderer,/const inkFragmentShader=/);
 assert.match(renderer,/texture2D\(uScene,vUv\)/);
 assert.match(renderer,/smoothstep\(\.17,\.38/);
 assert.match(renderer,/gl\.framebufferTexture2D\(/);
 assert.match(renderer,/gl\.framebufferRenderbuffer\(/);
 assert.match(renderer,/gl\.checkFramebufferStatus\(gl\.FRAMEBUFFER\)/);
 assert.match(renderer,/gl\.drawArrays\(gl\.TRIANGLE_STRIP,0,4\)/);
 assert.match(renderer,/withInk\?ink\.framebuffer:null/);
 assert.match(renderer,/gl\.deleteFramebuffer\(ink\.framebuffer\)/);
 assert.match(renderer,/gl\.deleteTexture\(ink\.texture\)/);
 assert.match(renderer,/if\(!gl\)return createAdventureFallbackRenderer\(canvas,save\)/);
 assert.match(renderer,/w\*h>3000000/);
 assert.doesNotMatch(renderer,/https:\/\/.*(three|min\.js|cdn)/i);
});

test('Nuove decorazioni modellate conservano world mesh, normali e progressi',()=>{
 const starter=createAdventureSave('sonic',CHARACTERS);
 const before=structuredClone(starter);
 const mesh=buildAdventureMesh(starter);
 assert.ok(mesh instanceof Float32Array);
 assert.equal(mesh.length%27,0,'posizione RGB e normale su ogni vertice');
 assert.ok(mesh.length>230000,'dettagli 3D delle sei regioni presenti');
 for(let i=0;i<mesh.length;i++)assert.ok(Number.isFinite(mesh[i]),'valore non finito al vertice '+i);
 assert.deepEqual(starter,before,'render mai deve mutare salvataggi');
 const src=read('../src/screens/adventure/AdventureWorldRenderer.js');
 for(const feature of ['addToonFlower','m.box(x,.04,z+side*3.52',
   'biomeLandmarks','adventureObjectiveBeacon','playerGeometry','powerPreference:'])
  assert.ok(src.includes(feature),'manca '+feature);
});

test('UI cartoon accessibile, responsiva, con comandi e salvataggi intatti',()=>{
 const css=read('../src/screens/adventure/AdventureCampaign.css');
 const view=read('../src/screens/adventure/AdventureCampaignView.jsx');
 assert.match(css,/CARTOON CEL-SHADING/);
 assert.match(css,/--adv-ink:/);
 assert.match(css,/\.adv-pad:active/);
 assert.match(css,/@media\(max-width:690px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(view,/MONDO 3D CARTOON/);
 assert.match(view,/onPointerDown/);
 assert.match(view,/graphics\.render/);
 assert.match(view,/callbacks\.current\.onWalk/);
 assert.match(view,/requestAnimationFrame/);
});
