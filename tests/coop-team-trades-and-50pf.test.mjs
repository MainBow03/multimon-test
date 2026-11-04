import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {initialGameState} from '../src/systems/gameState.js';
import {nextCoopFloor} from '../src/systems/coopExpedition.js';
import {
 COOP_TRADE_REFUSAL_COOLDOWN_MS,COOP_TRADE_EXPIRY_MS,
 coopTradeCooldownRemaining,coopTradeIsExpired,requestCoopTrade,
 respondCoopTrade,cancelCoopTrade,reorderCoopTeam
} from '../src/systems/coopTeamTrades.js';
import {ROGUELIKE_FULL_CLEAR_REWARD,grantRoguelikeCompletion} from '../src/systems/roguelikePowerRewards.js';

const mon=(id,hp=100,extra={})=>({
 id,name:id,maxHp:100,hp,atk:70,def:60,spd:85,
 types:['Normale'],moves:[{name:'Colpo',power:60,type:'Normale',accuracy:100}],
 ...extra
});
function room() {
 const r=initialGameState();
 r.isRoguelikeCoop=true;r.status='coop_camp';r.gameMode='juggernaut';
 r.players={...r.players,p1:'Alice',p2:'Bob',p3:null,p4:'Guardiano'};
 r.isBot={...r.isBot,p1:false,p2:false,p4:true};
 r.settings={...r.settings,fieldSize:1,teamSize:2,juggernautPlayer:'p4'};
 r.coopRun={...r.coopRun,floor:6,coins:100,relics:[],encounteredEnemies:[],nextBattlePower:1};
 r.teams={...r.teams,p1:[mon('mario',73,{heldItem:'avanzi'}),mon('superman',50),mon('kirby',80)],
  p2:[mon('luigi',44,{heldItem:'mantello'})],p4:[mon('nemico',100)]};
 return r;
}

test('Riordinare modifica solo la propria squadra, anche se il cambiamento riguarda la prima posizione',()=>{
 const r=room(),copy=structuredClone(r);
 const patch=reorderCoopTeam(r,'p1',2,0);
 assert.deepEqual(patch['teams.p1'].map(c=>c.id),['kirby','mario','superman']);
 assert.equal(Object.hasOwn(patch,'teams.p2'),false);
 assert.deepEqual(r,copy,'La funzione non deve mutare lo snapshot ricevuto');
 const updated={...r,teams:{...r.teams,p1:patch['teams.p1']}};
 const roster=updated.teams.p1.concat(updated.teams.p2).concat([mon('nemico'),mon('altro'),mon('terzo')]);
 const battle=nextCoopFloor(updated,roster,null,()=>0.3);
 assert.equal(battle.status,'pre_battle');
 assert.deepEqual(battle.field.p1,[0]);
 assert.equal(battle.teams.p1[battle.field.p1[0]].id,'kirby');
 assert.equal(battle.teams.p2[battle.field.p2[0]].id,'luigi');
 assert.throws(()=>reorderCoopTeam(r,'p4',0,1),/non sei un giocatore/i);
});

test('Un Multimon KO in posizione uno lascia partire il primo compagno vivo',()=>{
 const r=room();r.teams.p1[0].hp=0;
 const roster=r.teams.p1.concat(r.teams.p2).concat([mon('nemico'),mon('altro'),mon('terzo')]);
 const battle=nextCoopFloor(r,roster,null,()=>0.3);
 assert.deepEqual(battle.field.p1,[1]);
 assert.equal(battle.teams.p1[1].id,'superman');
});

test('Proporre Mario per Luigi non scambia niente finché Bob non accetta',()=>{
 const r=room(),original=structuredClone(r);
 const proposal=requestCoopTrade(r,'p1','p2',0,0,50000);
 assert.equal(proposal.coopTrade.offeredName,'mario');
 assert.equal(proposal.coopTrade.wantedName,'luigi');
 assert.equal(proposal.coopTrade.fromRole,'p1');
 assert.equal(proposal.coopTrade.toRole,'p2');
 assert.deepEqual(r,original);
 const pending={...r,...proposal};
 const accepted=respondCoopTrade(pending,'p2',true,51000);
 assert.equal(accepted.coopTrade,null);
 assert.deepEqual(accepted['teams.p1'].map(c=>c.id),['luigi','superman','kirby']);
 assert.deepEqual(accepted['teams.p2'].map(c=>c.id),['mario']);
 assert.equal(accepted['teams.p1'][0].hp,44);
 assert.equal(accepted['teams.p2'][0].hp,73);
 assert.equal(accepted['teams.p1'][0].heldItem,'mantello');
 assert.equal(accepted['teams.p2'][0].heldItem,'avanzi');
 assert.equal(Object.hasOwn(accepted,'teams'),false,'Non sostituire tutte le squadre');
 assert.deepEqual(pending.teams.p1,original.teams.p1);
 assert.equal(accepted.coopTradeLastResult.status,'accepted');
});

test('Rifiuto: 90 secondi di cooldown al proponente, nessun trasferimento di squadra',()=>{
 const now=300000;
 const r=room(),pending={...r,...requestCoopTrade(r,'p1','p2',0,0,now)};
 assert.throws(()=>respondCoopTrade(pending,'p1',true,now+50),/Solo il destinatario/);
 const declined=respondCoopTrade(pending,'p2',false,now+100);
 assert.equal(declined.coopTrade,null);
 assert.equal(declined.coopTradeCooldowns.p1,now+100+90000);
 assert.equal(COOP_TRADE_REFUSAL_COOLDOWN_MS,90000);
 const after={...pending,...declined};
 assert.equal(coopTradeCooldownRemaining(after,'p1',now+200),90);
 assert.throws(()=>requestCoopTrade(after,'p1','p2',0,0,now+89900),/rifiuto/);
 assert.equal(coopTradeCooldownRemaining(after,'p1',now+90100),0);
 assert.ok(requestCoopTrade(after,'p1','p2',0,0,now+90100).coopTrade);
 assert.deepEqual(after.teams.p1.map(c=>c.id),r.teams.p1.map(c=>c.id));
});

test('Una sola proposta alla volta e nessuno può rispondere al posto dell’altro',()=>{
 const r=room(),pending={...r,...requestCoopTrade(r,'p1','p2',0,0,9000)};
 assert.throws(()=>requestCoopTrade(pending,'p2','p1',0,0,10000),/già una proposta/);
 assert.throws(()=>requestCoopTrade(r,'p1','p1',0,0,9000),/altro giocatore/);
 assert.throws(()=>requestCoopTrade(r,'p1','p4',0,0,9000),/altro giocatore/);
 assert.throws(()=>requestCoopTrade(r,'p1','p2',99,0,9000),/non è più disponibile/);
 assert.throws(()=>cancelCoopTrade(pending,'p2',9500),/Solo chi/);
 assert.equal(cancelCoopTrade(pending,'p1',9500).coopTrade,null);
 const different={...r,status:'battling'};
 assert.throws(()=>requestCoopTrade(different,'p1','p2',0,0,9000),/accampamento/);
 assert.throws(()=>reorderCoopTeam(different,'p1',1,0),/accampamento/);
});

test('Proposta scaduta: non può essere accettata, ma si può liberare la stanza',()=>{
 const now=250000;
 const r=room(),pending={...r,...requestCoopTrade(r,'p1','p2',0,0,now)};
 assert.equal(COOP_TRADE_EXPIRY_MS,120000);
 assert.equal(coopTradeIsExpired(pending.coopTrade,now+119999),false);
 assert.equal(coopTradeIsExpired(pending.coopTrade,now+120000),true);
 assert.throws(()=>respondCoopTrade(pending,'p2',true,now+120000),/scaduta/);
 assert.equal(cancelCoopTrade(pending,'p2',now+120000).coopTrade,null);
 const fresh=requestCoopTrade(pending,'p2','p1',0,0,now+120001);
 assert.equal(fresh.coopTrade.fromRole,'p2');
});

test('Un cambio di posizione dopo la proposta non può trasferire per sbaglio un altro Multimon',()=>{
 const r=room(),pending={...r,...requestCoopTrade(r,'p1','p2',0,0,9000)};
 const moved=reorderCoopTeam(pending,'p1',0,1);
 const changed={...pending,teams:{...pending.teams,p1:moved['teams.p1']}};
 assert.throws(()=>respondCoopTrade(changed,'p2',true,9500),/squadre sono cambiate/);
});

test('Premio completo Roguelike da 50 PF per Solo e Co-op; cooldown storico invariato',()=>{
 assert.equal(ROGUELIKE_FULL_CLEAR_REWARD,50);
 const profile={strengthPoints:10};
 const first=grantRoguelikeCompletion(profile,'new-50',50,50,20000000);
 assert.equal(first.points,50);
 assert.equal(first.profile.strengthPoints,60);
 assert.equal(grantRoguelikeCompletion(first.profile,'new-50',50,50,20000001).ok,false);
 const early=grantRoguelikeCompletion(first.profile,'next-soon',50,50,21000000);
 assert.equal(early.points,0);
 const later=grantRoguelikeCompletion(early.profile,'after-4h',50,50,34400000);
 assert.equal(later.points,50);
});

test('UI e collegamenti: entrambe le funzioni passano da transazioni Firestore',()=>{
 const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
 const view=readFileSync(new URL('../src/screens/roguelike/RoguelikeCoopCampView.jsx',import.meta.url),'utf8');
 assert.match(app,/const offerCoopTrade=.*coopRoomAction\(\['coop_camp'\],false/);
 assert.match(app,/const answerCoopTrade=.*coopRoomAction\(\['coop_camp'\],false/);
 assert.match(app,/const reorderOwnCoopTeam=.*coopRoomAction\(\['coop_camp'\],false/);
 assert.match(view,/Accetta scambio/);
 assert.match(view,/Rifiuta scambio/);
 assert.match(view,/cooldownSeconds/);
 assert.match(view,/onReorder\(i,i-1,char.id\)/);
});

test('La conferma, il ritiro e la richiesta rispettano esattamente gli ID mostrati',()=>{
 const r=room(),now=500000;
 assert.throws(()=>requestCoopTrade(r,'p1','p2',0,0,now,'kirby','luigi'),/squadre sono cambiate/i);
 assert.throws(()=>reorderCoopTeam(r,'p1',0,1,'luigi'),/squadra è cambiata/i);
 const offer=requestCoopTrade(r,'p1','p2',0,0,now,'mario','luigi');
 const pending={...r,...offer};
 assert.throws(()=>respondCoopTrade(pending,'p2',true,now+100,'id-vecchio'),/proposta è cambiata/i);
 assert.throws(()=>cancelCoopTrade(pending,'p1',now+100,'id-vecchio'),/proposta è cambiata/i);
 const ok=respondCoopTrade(pending,'p2',true,now+100,offer.coopTrade.id);
 assert.equal(ok['teams.p1'][0].id,'luigi');
 assert.equal(cancelCoopTrade(pending,'p1',now+100,offer.coopTrade.id).coopTrade,null);
});
