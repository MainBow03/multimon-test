import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {MOVES_DB} from '../src/data/moves.js';
import {CHARACTERS} from '../src/data/characters.js';
import {TYPE_STYLES} from '../src/systems/typeSystem.js';
import {prepareUltimonFighter} from '../src/systems/ultimonSystem.js';

test('Rabbia di Sparta di Kratos aumenta Attacco e Difesa solo del 25%',()=>{
 const move=MOVES_DB['Rabbia di Sparta'];
 assert.ok(move,'Mossa di Kratos assente');
 assert.deepEqual(move.statBuff,{atk:1.25,def:1.25});
 assert.equal(move.heal,0.2,'La cura rimane invariata al 20%');
 assert.match(move.desc,/25%/);
 assert.doesNotMatch(move.desc,/50%/);
 const kratos=CHARACTERS.find(c=>c.id==='kratos');
 assert.ok(kratos,'Kratos assente dal roster');
 const assigned=kratos.moves.find(m=>m.name==='Rabbia di Sparta');
 assert.equal(assigned.statBuff.atk,1.25);
 assert.equal(assigned.statBuff.def,1.25);
});

test('I tipi sono conservati anche negli avatar di Ultimon e mantengono i colori ufficiali',()=>{
 const kratos=CHARACTERS.find(c=>c.id==='kratos');
 const source=readFileSync(new URL('../src/screens/battle/UltimonView.jsx',import.meta.url),'utf8');
 const css=readFileSync(new URL('../src/screens/battle/UltimonView.css',import.meta.url),'utf8');
 assert.match(source,/import \{TYPE_STYLES\} from '\.\.\/\.\.\/systems\/typeSystem\.js'/);
 assert.match(source,/export function UltimonTypeBadges\(\{types,compact=false\}\)/);
 assert.match(source,/TYPE_STYLES\[type\]/);
 assert.match(source,/role="group" aria-label=\{'Tipi: '/);
 assert.match(source,/<UltimonTypeBadges types=\{c\.types\} compact\/>/,'Rosa di entrambe le squadre');
 assert.match(source,/<UltimonTypeBadges types=\{c\.types\}\/>/,'Schieramento selezionabile');
 assert.match(source,/<UltimonTypeBadges types=\{fighter\.types\}\/>/,'Scelta premio');
 assert.match(css,/\.ultimon-type-badges--compact/);
 assert.match(css,/@media\(max-width:600px\)/);
 assert.deepEqual(kratos.types,['Lotta','Oscuro']);
 assert.ok(TYPE_STYLES.Lotta && TYPE_STYLES.Oscuro);
 const prepared=prepareUltimonFighter(kratos,{
  isBot:{p1:true},playerStrengthOwned:{p1:[]},playerStrength:{p1:{}}
 },'p1');
 assert.deepEqual(prepared.types,['Lotta','Oscuro']);
});
