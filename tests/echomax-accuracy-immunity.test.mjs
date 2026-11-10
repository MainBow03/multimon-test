import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {isEchoRaidAccuracyProtected} from '../src/systems/echoFinalSouls.js';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('Solo l’Echomax raid finale è immune ai cali di precisione',()=>{
 assert.equal(isEchoRaidAccuracyProtected({id:'echomax',isEchoRaidBoss:true}),true);
 assert.equal(isEchoRaidAccuracyProtected({id:'echomax',isEchoRaidBoss:false}),false);
 assert.equal(isEchoRaidAccuracyProtected({id:'echomax'}),false);
 assert.equal(isEchoRaidAccuracyProtected({id:'goku',isEchoRaidBoss:true}),false);
 assert.equal(isEchoRaidAccuracyProtected(null),false);
});

test('Il motore blocca sia i malus percentuali sia quelli assoluti alla precisione',()=>{
 const src=read('src/systems/battleSystem.js');
 const hit=src.match(/if \(move\.hitStatDebuff\.acc && !isEchoRaidAccuracyProtected\(t\.char\)\)/g)||[];
 const percent=src.match(/if \(move\.targetStatDebuff\.acc && !isEchoRaidAccuracyProtected\(t\.char\)\)/g)||[];
 const flat=src.match(/if \(move\.targetStatDebuff\.accFlat && !isEchoRaidAccuracyProtected\(t\.char\)\)/g)||[];
 assert.equal(hit.length,1);
 assert.equal(percent.length,2,'Colpo dannoso e mossa di stato');
 assert.equal(flat.length,2,'Colpo dannoso e mossa di stato');
 assert.match(src,/isEchoRaidAccuracyProtected\(attacker\) \? 1 : \(attacker\.acc/);
 assert.match(src,/!isEchoRaidAccuracyProtected\(attacker\) && attacker\.statuses\?\.some/);
});

test('Accecato non può colpire il boss da mosse e passive nemiche',()=>{
 const src=read('src/systems/battleSystem.js');
 assert.match(src,/if\(effect\.type==='Accecato'&&isEchoRaidAccuracyProtected\(t\.char\)\)/);
 assert.match(src,/sType==='Accecato'&&isEchoRaidAccuracyProtected\(rTarget\.char\)/);
 assert.match(src,/sType==='Accecato'&&isEchoRaidAccuracyProtected\(enemy\)/);
 assert.match(src,/Echomax è immune all’accecamento/);
});

test('Un checkpoint vecchio ripristina precisione normale senza cambiare gli altri status',()=>{
 const src=read('src/screens/campaign/CampaignTeamSelectView.jsx');
 assert.match(src,/if\(isEchoFinalRaid&&charInst\.id==='echomax'\)/);
 assert.match(src,/charInst\.acc=1\.0/);
 assert.match(src,/charInst\.statuses=\(charInst\.statuses\|\|\[\]\)\.filter\(x=>x\?\.type!=='Accecato'\)/);
});

test('La purificazione Juggernaut resta ogni due turni e non resetta i malus statistici',()=>{
 const src=read('src/systems/battleSystem.js');
 assert.match(src,/if \(char\.juggTurnCount >= 2\)/);
 assert.match(src,/Aura Suprema: \$\{char\.name\} si purifica/);
 const block=src.slice(src.indexOf('// Purificazione automatica del Juggernaut'),src.indexOf('let shieldIdx =',src.indexOf('// Purificazione automatica del Juggernaut')));
 assert.doesNotMatch(block,/char\.atk\s*=|char\.def\s*=|char\.spd\s*=/);
});
