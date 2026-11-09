import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {analyzeBalanceData,formatBalanceAudit} from '../src/systems/balanceAudit.js';

const dummy=(id,name,hp,atk,def,spd,moves=[],passive=null)=>({
 id,name,hp,atk,def,spd,moves,img:'https://example.test/'+id+'.png',passive
});
test('Audit non include mostri campagna, summon, segreti o fusioni',()=>{
 const heroes=[
  dummy('a','Alice',80,80,80,80,[{name:'Colpo'}]),
  {...dummy('boss','Boss',1000,1000,1000,1000,[]),isCampaignMonster:true},
  {...dummy('summon','Evocazione',1,1,1,1,[]),isSummonOnly:true},
  {...dummy('secret','Segreto',99,99,99,99,[]),isSecretUnlock:true},
  {...dummy('fusion','Fusione',99,99,99,99,[]),fusionOf:['a','b']}
 ];
 const report=analyzeBalanceData(heroes);
 assert.equal(report.playable,1);
 assert.equal(report.medianRawTotal,320);
 assert.deepEqual(report.noPassive,[{id:'a',name:'Alice'}]);
});

test('Audit segnala solo anomalie verificabili, mai vittorie fittizie',()=>{
 const characters=[
  dummy('a','Alpha',200,180,150,140,[{name:'Stordimento',statusEffect:{type:'Stordito',chance:.5}}],{type:'on_enter'}),
  dummy('b','Beta',75,55,40,50,[{name:'Debole'}]),
  dummy('b','Beta duplicato',25,30,25,30,[null]),
  {...dummy('c','Gamma',70,80,70,90,[{name:'Congela',statusEffect:{type:'Congelato',chance:45}}]),img:''}
 ];
 const data=analyzeBalanceData(characters);
 assert.deepEqual(data.duplicateIds,['b']);
 assert.equal(data.missingMoveNames.length,1);
 assert.deepEqual(data.missingImages,['Gamma']);
 assert.ok(data.rawHigh.some(c=>c.id==='a'));
 assert.ok(data.rawLow.some(c=>c.id==='b'));
 assert.equal(data.largeControlChances.length,2);
 assert.deepEqual(data.largeControlChances.map(x=>x.chance),[50,45]);
 assert.match(data.disclaimer,/non sono vittorie simulate/);
 assert.match(formatBalanceAudit(data),/ID duplicati: b/);
});

test('Audit della repository può essere riprodotto e non altera alcun Multimon',()=>{
 const input=JSON.stringify(CHARACTERS);
 const report=analyzeBalanceData(CHARACTERS);
 assert.ok(report.playable>50);
 assert.ok(report.medianRawTotal>0);
 assert.equal(JSON.stringify(CHARACTERS),input);
 const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));
 assert.match(pkg.scripts['audit:balance'],/auditBalance\.mjs/);
 const ci=readFileSync(new URL('../.github/workflows/deploy-pages.yml',import.meta.url),'utf8');
 assert.match(ci,/npm run audit:balance/);
});
