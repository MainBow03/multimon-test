import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ITEMS_DB} from '../src/data/items.js';

const root=new URL('../src/components/',import.meta.url);
const advanced=readFileSync(new URL('AdvancedItemArtwork.jsx',root),'utf8');
const artwork=readFileSync(new URL('ItemArtwork.jsx',root),'utf8');
const shop=readFileSync(new URL('../src/screens/hub/ShopView.jsx',import.meta.url),'utf8');
const battle=readFileSync(new URL('../src/screens/battle/BattlingView.jsx',import.meta.url),'utf8');
const ids=[
 'fascia_eroe','scudo_antielemento','ciondolo_antiveleno',
 'clessidra_rapidita','lente_fortuna','risonatore_elementale',
 'nastro_solidarieta','stivali_slancio','bussola_predatore',
 'specchio_maledizioni','sigillo_liberta','piuma_rinascita',
 'campanella_soccorso'
];

test('Tutti i 13 strumenti nuovi usano una chiave SVG, mai un emoji o la stella di riserva',()=>{
 assert.equal(new Set(ids).size,13);
 for(const id of ids){
   assert.equal(ITEMS_DB[id]?.type,'held',id);
   assert.equal(ITEMS_DB[id]?.icon,id,'Metadata SVG id per '+id);
   assert.match(advanced,new RegExp("case '"+id+"':"));
 }
 assert.match(artwork,/ADVANCED_HELD_ART_IDS\.includes\(id\)/);
 assert.match(artwork,/<AdvancedItemArtwork id=\{id\}/);
 assert.ok(artwork.indexOf('ADVANCED_HELD_ART_IDS.includes(id)')<
   artwork.indexOf("const gem=ITEMS_DB[id]?.gemType"),'Le nuove icone hanno precedenza sul fallback');
 assert.match(artwork,/return <span[^>]*>✦<\/span>/);
});

test('13 grafiche distinte con silhouette differenti e gradienti per ogni oggetto',()=>{
 const cases=[...advanced.matchAll(/case '([a-z_]+)':([\s\S]*?)break;/g)];
 assert.equal(cases.length,13);
 assert.deepEqual(cases.map(m=>m[1]),ids);
 for(const [,id,body] of cases){
   assert.ok(body.includes('<path')||body.includes('<circle')||body.includes('<rect'),'nessun SVG per '+id);
   assert.ok(body.length>150,'troppo povera la grafica di '+id);
   assert.equal(/✦|★|⭐|🎗️|🛡️|⌛|🪞|🪶|👢/.test(body),false,'emoji o stella nel disegno: '+id);
 }
 assert.match(advanced,/React\.useId\(\)/,'Gradienti univoci per più copie dello stesso equipaggiamento');
 assert.match(advanced,/viewBox="0 0 100 100"/);
 assert.match(advanced,/linearGradient/);
 assert.match(advanced,/radialGradient/);
 assert.match(advanced,/aria-label=\{name\|\|id\}/);
});

test('Il Negozio e i Multimon nelle battaglie mostrano lo stesso ItemArtwork, anche in 24px',()=>{
 assert.match(shop,/ItemArtwork id=\{item\.id\} size=\{68\}/);
 assert.match(battle,/ItemArtwork id=\{char\.heldItem\} size=\{24\}/);
 assert.match(advanced,/width=\{size\} height=\{size\}/);
});

test('Nessuna modifica ai vecchi strumenti o alle meccaniche di combattimento',()=>{
 for(const old of ['germoglio_curativo','spray_neutralizzante','freccia_cupido','scudo_antimagia','iperband','avanzi','mantello_invisibilita']){
   assert.equal(ITEMS_DB[old]?.type,'held',old);
 }
 for(const excluded of ['guanti_spinosi','corona_coraggio'])
   assert.equal(ITEMS_DB[excluded],undefined);
});
