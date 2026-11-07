import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS} from '../src/data/characters.js';
import {MOVES_DB} from '../src/data/moves.js';
import {CAMPAIGNS} from '../src/data/campaigns.js';
import {ECHO_CAMPAIGN} from '../src/data/echoCampaign.js';
import {RECENT_ARRIVALS_IDS,recentArrivalCharacters} from '../src/data/recentArrivals.js';
import {applyBattleStatModifier} from '../src/systems/statBalance.js';
import {activateTitansRobin,createNightwingBuffWatcher,
        healBerrySlideAllies,TITANS_ROBIN_MAX,NIGHTWING_EVASION_GAIN} from '../src/systems/titansBerryEffects.js';

const base=id=>CHARACTERS.find(c=>c.id===id);
const fighter=(id,hp=70)=>{
 const c=structuredClone(base(id));
 c.hp=Math.min(c.maxHp,hp);
 c.baseAtk=c.atk;c.baseDef=c.def;c.baseSpd=c.spd;
 c.baseSpAtk=c.spAtk??c.atk;c.baseSpDef=c.spDef??c.def;
 c.evasionBonus=0;
 return c;
};
const contents=p=>readFileSync(new URL(p,import.meta.url),'utf8');

test('Bumblebee stabilizzata: Raffica Sonica 2-5 colpi',()=>{
 assert.deepEqual(MOVES_DB['Raffica Sonica'].multiHit,{min:2,max:5});
 const bee=base('bumblebee');
 assert.equal(bee.hp,89);assert.equal(bee.def,80);
 assert.equal(bee.passive.damageBonus,1.2);
});

test('Robin: nuova passiva con 50% di probabilità, quattro attivazioni max, quattro statistiche',()=>{
 const r=fighter('robin');
 assert.equal(r.passive.name,'Titans, a rapporto!');
 assert.equal(r.passive.type,'titans_report');
 assert.equal(r.passive.chance,.5);
 assert.equal(TITANS_ROBIN_MAX,4);
 assert.equal(activateTitansRobin(r,applyBattleStatModifier,()=>.5),null,'il tiro a .5 non attiva');
 const original={atk:r.atk,def:r.def,spd:r.spd};
 // Un numero casuale viene usato per la probabilità e uno per la scelta stat.
 let rolls=[.1,0, .1,.26, .1,.51, .1,.8];
 const random=()=>rolls.shift();
 const triggered=Array.from({length:4},()=>activateTitansRobin(r,applyBattleStatModifier,random));
 assert.deepEqual(triggered.map(v=>v.stat),['atk','def','spd','evasion']);
 assert.equal(r.titansReportUses,4);
 assert.equal(r.atk,original.atk+Math.floor(original.atk*.1));
 assert.equal(r.def,original.def+Math.floor(original.def*.1));
 assert.equal(r.spd,original.spd+Math.floor(original.spd*.1));
 assert.ok(Math.abs(r.evasionBonus-.1)<1e-10);
 assert.equal(activateTitansRobin(r,applyBattleStatModifier,()=>0),null,'non supera le 4 cariche');
 r.hp=0;
 assert.equal(activateTitansRobin(r,applyBattleStatModifier,()=>0),null,'non si potenzia da KO');
});

test('Nightwing: +10% elusione per singola mossa di potenziamento del nemico, non per ogni statistica',()=>{
 const nightwing=fighter('nightwing'),enemy=fighter('robin'),ally=fighter('nami');
 const teams={p1:[nightwing,ally],p2:[enemy]};
 const field={p1:[0,1],p2:[0]},events=[];
 const watcher=createNightwingBuffWatcher(teams,field,{gameMode:'classica'},events);
 assert.equal(NIGHTWING_EVASION_GAIN,.1);
 assert.equal(nightwing.passive.name,'Sempre un passo avanti');
 watcher.beginAction('p2',{name:'Allenamento nemico',statBuff:{atk:1.5,def:1.2}});
 watcher.onStatGain(enemy,'atk',100,120);
 watcher.onStatGain(enemy,'def',100,120);
 assert.equal(nightwing.evasionBonus,.1);
 assert.equal(events.length,1);
 watcher.beginAction('p2',{name:'Colpo qualsiasi',power:80});
 watcher.onStatGain(enemy,'atk',100,120);
 assert.equal(nightwing.evasionBonus,.1,'attacco che non buffa non attiva passiva');
 watcher.beginAction('p1',{name:'Allenamento alleato',statBuff:{atk:1.5}});
 watcher.onStatGain(ally,'atk',100,120);
 assert.equal(nightwing.evasionBonus,.1,'non reagisce ai propri alleati');
 watcher.beginAction('p2',{name:'Altro buff',selfStatBuff:{spd:1.2}});
 watcher.onStatGain(enemy,'spd',100,120);
 assert.equal(nightwing.evasionBonus,.2);
 watcher.beginAction('p2',{name:'Buff solo a chi è in panchina',statBuff:{atk:1.5}});
 const benched=fighter('luffy');
 watcher.onStatGain(benched,'atk',100,120);
 assert.equal(nightwing.evasionBonus,.2);
});
test('Nightwing rispetta alleanze Lotta Multipla e nessun bonus da buff della propria coppia',()=>{
 const nightwing=fighter('nightwing'),buddy=fighter('robin'),enemy=fighter('berry');
 const teams={p1:[nightwing],p2:[buddy],p3:[enemy],p4:[]};
 const field={p1:[0],p2:[0],p3:[0],p4:[]};
 const watcher=createNightwingBuffWatcher(teams,field,{gameMode:'multipla'},[]);
 watcher.beginAction('p2',{name:'Titani uniti',statBuff:{atk:1.2}});
 watcher.onStatGain(buddy,'atk',100,120);
 assert.equal(nightwing.evasionBonus,0);
 watcher.beginAction('p3',{name:'Gelato potente',statBuff:{atk:1.2}});
 watcher.onStatGain(enemy,'atk',100,120);
 assert.equal(nightwing.evasionBonus,.1);
});

test('Berry: Coppa Rigenerante 51%; Scivolata 100, due usi, non rallenta più',()=>{
 const cup=MOVES_DB['Coppa Rigenerante'];
 const slide=MOVES_DB['Scivolata Gelata'];
 assert.equal(cup.heal,.51);
 assert.equal(cup.targetMode,'ally');
 assert.equal(cup.maxUses,3);
 assert.equal(slide.power,100);
 assert.equal(slide.maxUses,2);
 assert.equal(slide.strictUses,true);
 assert.equal(slide.berryTeamHeal,.25);
 assert.equal(slide.targetStatDebuff,undefined);
});
test('Scivolata Gelata cura una sola volta Berry e alleati vivi sul campo, anche altri giocatori',()=>{
 const berry=fighter('berry',50),partner=fighter('robin',40),benched=fighter('nami',15);
 const foe=fighter('frillish',40);
 const teams={p1:[berry,benched],p2:[partner],p3:[foe]};
 const field={p1:[0],p2:[0],p3:[0]};
 const events=[];
 const n=healBerrySlideAllies(berry,MOVES_DB['Scivolata Gelata'],'p1',
   teams,field,{gameMode:'multipla'},events,['p1','p2','p3']);
 assert.ok(n>0);
 assert.equal(berry.hp,50+Math.floor(berry.maxHp*.25));
 assert.equal(partner.hp,40+Math.floor(partner.maxHp*.25));
 assert.equal(benched.hp,15,'le riserve non vengono curate');
 assert.equal(foe.hp,40,'i nemici non sono curati');
 assert.equal(events.length,2);
 assert.equal(healBerrySlideAllies(berry,MOVES_DB['Gelato Glaciale'],'p1',
   teams,field,{gameMode:'multipla'},[],['p1','p2','p3']),0);
});

test('Nuovi Arrivi: quattro arrivi evidenziati e ritratti più leggibili',()=>{
 assert.deepEqual(RECENT_ARRIVALS_IDS.slice(0,4),
   ['frillish','berry','flameprincess','ametista']);
 const arrivals=recentArrivalCharacters(CHARACTERS);
 assert.deepEqual(arrivals.slice(0,4).map(c=>c.id),
   ['frillish','berry','flameprincess','ametista']);
 assert.equal(new Set(arrivals.map(c=>c.id)).size,arrivals.length);
 assert.ok(arrivals.length>24);
 const ui=contents('../src/components/RecentArrivalsGrid.jsx');
 const lobby=contents('../src/screens/battle/LobbyView.jsx');
 assert.match(ui,/recent-arrivals-featured-grid/);
 assert.match(ui,/recent-arrivals-roster-grid/);
 assert.match(ui,/\.slice\(0,100\)/);
 assert.match(ui,/createPortal/);
 assert.match(ui,/onClick/);
 assert.match(lobby,/<RecentArrivalsGrid/);
 assert.doesNotMatch(lobby,/newArrivals\.slice\(0, 20\)/);
});

test('Prima campagna: 47 missioni arricchite con dialoghi inizio/fine coerenti',()=>{
 const first=CAMPAIGNS.find(x=>x.id==='crisi_varco');
 assert.ok(first);
 const missions=first.sectors.flatMap(s=>s.missions);
 assert.equal(missions.length,47);
 for(const m of missions){
   assert.ok(m.dialogue.length>=3,m.id+' ha più dialoghi prima del combattimento');
   assert.ok(m.postDialogue.length>=2,m.id+' ha più dialoghi dopo il combattimento');
   assert.ok(m.dialogue.every(x=>typeof x.s==='string'&&x.t.length>5));
   assert.ok(m.postDialogue.every(x=>typeof x.s==='string'&&typeof x.t==='string'));
   assert.ok(m.postDialogue.some(x=>x.t.length>20),'scena narrativa aggiuntiva lunga per '+m.id);
   assert.ok(m.boss?.length>0,m.id+' mantiene il boss');
 }
 assert.ok(missions.find(m=>m.id==='m38').postDialogue.some(x=>x.t.includes('Varco')));
});

test('Terza campagna: tutti 36 livelli ricevono scenette diverse, senza cambiare la trama',()=>{
 const echo=CAMPAIGNS.find(x=>x.id==='eco_anime');
 assert.ok(echo);
 assert.strictEqual(echo,ECHO_CAMPAIGN,'stessa campagna referenziata dai sistemi esistenti');
 const missions=echo.sectors.flatMap(s=>s.missions);
 assert.equal(missions.length,36);
 for(const m of missions){
   assert.ok(m.dialogue.length>=3,m.id+' ha più dialoghi prima');
   assert.ok(m.postDialogue.length>=2,m.id+' ha più dialoghi dopo');
   assert.equal(m.echoMission,true,m.id);
   assert.ok(m.boss?.length>0,m.id);
 }
 const ending=missions[35];
 assert.equal(ending.id,'eco_36');
 assert.ok(ending.dialogue.some(x=>x.s==='Finn l\'Umano'));
 assert.ok(ending.postDialogue.some(x=>x.s==='Sage'));
 assert.equal(ending.forceFieldSize,6);
});
test('Motore usa i passivi e guarisce Berry dopo una mossa riuscita',()=>{
 const engine=contents('../src/systems/battleSystem.js');
 assert.match(engine,/createNightwingBuffWatcher/);
 assert.match(engine,/nightwingObserver\.beginAction\(player,/);
 assert.match(engine,/activateTitansRobin\(target,applyBattleStatModifier\)/);
 assert.match(engine,/healBerrySlideAllies\(attacker,move,player,workingTeams,workingField/);
 assert.match(engine,/if\(attackSucceeded && move\.berryTeamHeal && attacker\.hp>0\)/);
 assert.match(engine,/char\.titansReportUses=0/);
 const arena=contents('../src/screens/battle/BattlingView.jsx');
 assert.match(arena,/Titans, a rapporto!/);
 assert.match(arena,/Sempre un passo avanti/);
});
