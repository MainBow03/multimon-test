import {applyStrengthToFighter} from './strengthLab.js';
import {createBattleReport} from './battleReport.js';

// Colori nominati e scelti a mano: non dipendono dai temi dei quattro giocatori classici.
export const ULTIMON_COLORS = [
 {name:'Rosso fuoco',hex:'#ef4444'},{name:'Blu elettrico',hex:'#2563eb'},
 {name:'Verde smeraldo',hex:'#10b981'},{name:'Giallo sole',hex:'#facc15'},
 {name:'Viola imperiale',hex:'#9333ea'},{name:'Arancione',hex:'#f97316'},
 {name:'Rosa shocking',hex:'#ec4899'},{name:'Turchese',hex:'#06b6d4'},
 {name:'Bianco ghiaccio',hex:'#f8fafc'},{name:'Nero ossidiana',hex:'#171717'},
 {name:'Lime',hex:'#84cc16'},{name:'Bordeaux',hex:'#881337'},
 {name:'Lavanda',hex:'#c4b5fd'},{name:'Marrone terra',hex:'#92400e'},
 {name:'Blu notte',hex:'#172554'},{name:'Corallo',hex:'#fb7185'},
 {name:'Verde foresta',hex:'#166534'},{name:'Oro',hex:'#d97706'},
 {name:'Grigio argento',hex:'#94a3b8'},{name:'Indaco',hex:'#4f46e5'}
];
export const ULTIMON_STAGES = [
 'ultimon_showcase','ultimon_intro','ultimon_pair','ultimon_format','ultimon_pick',
 'ultimon_result','ultimon_elimination','ultimon_recap','ultimon_final'
];
const ROLES=['p1','p2','p3','p4','p5','p6','p7','p8'];
const newUltimonRunId=()=>`ultimon-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,12)}`;

const BOT_NAMES=['I Fulmini','Le Ombre','Draghi Astrali','I Titani','Lupi Lunari','Le Comete','Fiamme Selvagge','Gli Invincibili'];
// Rimuove campi undefined: Firestore rifiuta oggetti con valori non serializzabili.
const clone=o=>JSON.parse(JSON.stringify(o));
const alive=c=>c && c.hp>0 && !c.isSummonOnly;
export const ultimonPlayers=room=>ROLES.slice(0,Math.min(8,Math.max(4,Number(room.settings?.maxPlayers)||4)))
 .filter(p=>!!room.players?.[p]);
export const ultimonAlive=(rosters,p)=>(rosters?.[p]||[]).filter(alive).length;
export const ultimonActive=room=>ultimonPlayers(room).filter(p=>ultimonAlive(room.ultimon?.rosters,p)>0);
// Il Gran Finale inizia solo quando rimangono esattamente due squadre.
// La lotta conserva comunque le normali regole e gli schieramenti estratti.
export const ultimonIsFinalShowdown=room=>room?.gameMode==='ultimon' &&
 ultimonActive(room).length===2;
export function prepareUltimonFighter(original,room,role){
 const c=clone(original);
 const owned=room.playerStrengthOwned?.[role]||[];
 const mayStrength=!room.isBot?.[role]&&!c.isSecretUnlock&&!c.isSummonOnly&&!c.fusionOf
   &&(!c.price||owned.includes(c.id));
 const boosted=mayStrength?applyStrengthToFighter(c,room.playerStrength?.[role]||{}):c;
 boosted.baseSpDef??=boosted.spDef??boosted.def;
 boosted.baseSpAtk??=boosted.spAtk??boosted.atk;
 boosted.spDef??=boosted.def;boosted.spAtk??=boosted.atk;
 boosted.statuses=[];boosted.consecutiveProtect=0;boosted.passiveUses=0;
 boosted.moves=(boosted.moves||[]).filter(Boolean).map(m=>({...m,
   remainingUses:m.maxUses??null,currentCooldown:0}));
 return boosted;
}
export function createUltimonShowcase(room,draft=room.draft){
 if(room.gameMode!=='ultimon')throw new Error('Modalità errata.');
 const players=ultimonPlayers(room);
 if(players.length<4||players.length>8)throw new Error('Ultimon richiede da 4 a 8 partecipanti.');
 const roster={},identities={},stats={};
 players.forEach((role,index)=>{
  const team=draft?.[role]||[];
  if(team.length!==room.settings.teamSize)throw new Error('Squadra incompleta: '+(room.players[role]||role));
  roster[role]=team.map(c=>prepareUltimonFighter(c,room,role));
  identities[role]={name:room.isBot?.[role]?BOT_NAMES[index]:'',
    color:ULTIMON_COLORS[index].hex,ready:!!room.isBot?.[role]};
  stats[role]={matches:0,wins:0,losses:0,knockouts:0,lost:0};
 });
 return {status:'ultimon_showcase',phaseStartedAt:Date.now(),
  teams:Object.fromEntries(ROLES.map(p=>[p,[]])),
  field:Object.fromEntries(ROLES.map(p=>[p,[]])),
  draft:Object.fromEntries(ROLES.map(p=>[p,[]])),
  ultimon:{runId:newUltimonRunId(),rosters:roster,identities,stats,round:0,
    history:[],eliminated:[],pair:[],format:null,picks:{},selected:{},lastPair:[],champion:null,intro:null}};
}
export function identityPatch(room,role,name,color){
 if(room.status!=='ultimon_showcase'||!ultimonPlayers(room).includes(role)||
    room.isBot?.[role])throw new Error('Non puoi modificare questa squadra.');
 const value=String(name||'').trim().slice(0,24);
 if(value.length<2)throw new Error('Inserisci un nome squadra di almeno 2 caratteri.');
 if(!ULTIMON_COLORS.some(c=>c.hex===color))throw new Error('Seleziona uno dei 20 colori.');
 if(Object.entries(room.ultimon.identities||{}).some(([p,d])=>p!==role&&d.ready&&d.color===color))
   throw new Error('Questo colore è già assegnato a un’altra squadra.');
 return {['ultimon.identities.'+role]:{name:value,color,ready:true}};
}
export function allUltimonNamed(room){
 return ultimonPlayers(room).every(p=>room.ultimon?.identities?.[p]?.ready);
}
const shuffle=(items,random=Math.random)=>{
 const list=[...items];
 for(let i=list.length-1;i>0;i--){const j=Math.min(i,Math.floor(random()*(i+1)));[list[i],list[j]]=[list[j],list[i]];}
 return list;
};
export function nextUltimonPair(room,random=Math.random){
 if(!['ultimon_showcase','ultimon_intro','ultimon_recap'].includes(room.status))
   throw new Error('Non è il momento di estrarre gli sfidanti.');
 if(!allUltimonNamed(room))throw new Error('Le squadre devono scegliere nome e colore.');
 if(room.status==='ultimon_intro'&&room.ultimon?.intro?.step!=='complete')
   throw new Error('Attendi che tutti i partecipanti finiscano la presentazione.');
 const aliveRoles=ultimonActive(room);
 if(aliveRoles.length<=1){
  return {status:'ultimon_final',phaseStartedAt:Date.now(),
   'ultimon.champion':aliveRoles[0]||null};
 }
 // Favorisce chi ha disputato meno duelli, evitando rimesse immediate quando possibile.
 const minGames=Math.min(...aliveRoles.map(p=>room.ultimon.stats[p]?.matches||0));
 const first=shuffle(aliveRoles.filter(p=>(room.ultimon.stats[p]?.matches||0)===minGames),random)[0];
 let rivals=aliveRoles.filter(p=>p!==first);
 const withoutLast=rivals.filter(p=>!room.ultimon.lastPair?.includes(p));
 if(withoutLast.length)rivals=withoutLast;
 const minRival=Math.min(...rivals.map(p=>room.ultimon.stats[p]?.matches||0));
 const second=shuffle(rivals.filter(p=>(room.ultimon.stats[p]?.matches||0)===minRival),random)[0];
 return {status:'ultimon_pair',phaseStartedAt:Date.now(),
  'ultimon.round':room.ultimon.round+1,
  'ultimon.pair':[first,second], 'ultimon.lastPair':[first,second],
  'ultimon.format':null,'ultimon.picks':{},'ultimon.selected':{}};
}
export function botUltimonPick(room,role,count,random=Math.random){
 const candidates=(room.ultimon.rosters?.[role]||[]).map((c,i)=>({c,i})).filter(x=>alive(x.c));
 return candidates.map(x=>({...x,score:
   (x.c.hp/Math.max(1,x.c.maxHp))*40+
   (Number(x.c.atk)||0)*.14+(Number(x.c.def)||0)*.08+(Number(x.c.spd)||0)*.05+
   random()*12})).sort((a,b)=>b.score-a.score).slice(0,count).map(x=>x.i);
}
export function revealUltimonFormat(room,random=Math.random){
 if(room.status!=='ultimon_pair')throw new Error('Prima servono i due sfidanti.');
 const pair=room.ultimon.pair||[];
 const max=Math.min(3,...pair.map(p=>ultimonAlive(room.ultimon.rosters,p)));
 if(pair.length!==2||max<1)throw new Error('Nessuna coppia valida.');
 const size=1+Math.floor(random()*max);
 const picks={};
 pair.forEach(p=>{if(room.isBot?.[p])picks[p]=botUltimonPick(room,p,size,random);});
 return {status:'ultimon_format',phaseStartedAt:Date.now(),
  'ultimon.format':size,'ultimon.picks':picks};
}
export function pickPatch(room,role,indices){
 if(room.status!=='ultimon_pick'||!room.ultimon.pair.includes(role)||
   room.isBot?.[role])throw new Error('Non puoi scegliere adesso.');
 const selected=Array.isArray(indices)?indices:[];
 const valid=selected.length===room.ultimon.format&&new Set(selected).size===selected.length&&
  selected.every(i=>Number.isInteger(i)&&alive(room.ultimon.rosters[role]?.[i]));
 if(!valid)throw new Error('Scegli esattamente i Multimon vivi richiesti dal formato.');
 return {['ultimon.picks.'+role]:[...selected]};
}
export function ultimonPicksReady(room){
 return room.ultimon?.pair?.length===2 && room.ultimon.pair.every(p=>{
  const arr=room.ultimon.picks?.[p]||[];
  return arr.length===room.ultimon.format&&new Set(arr).size===arr.length&&
   arr.every(i=>Number.isInteger(i)&&alive(room.ultimon.rosters[p]?.[i]));
 });
}
export function startUltimonDuel(room,applyOnEnter){
 if(room.status!=='ultimon_pick'||!ultimonPicksReady(room))throw new Error('Schieramenti non pronti.');
 const pair=room.ultimon.pair,format=room.ultimon.format;
 const teams=Object.fromEntries(ROLES.map(p=>[p,[]]));
 const field=Object.fromEntries(ROLES.map(p=>[p,[]]));
 const selected={};
 for(const p of pair){
  const indices=room.ultimon.picks[p];
  selected[p]=[...indices];
  teams[p]=indices.map(i=>{
   const c=clone(room.ultimon.rosters[p][i]);
   c.statuses=[];c.consecutiveProtect=0;c.passiveUses=0;c.gemSpent=false;
   c.healingSproutUsed=false;c.neutralizingSprayUsed=false;
   c.moves=(c.moves||[]).map(m=>({...m,remainingUses:m.maxUses??null,currentCooldown:0}));
   return c;
  });
  field[p]=indices.map((_,i)=>i);
 }
 const events=[];
 if(typeof applyOnEnter==='function'){
  for(const p of pair)for(const i of [...field[p]]){
   const c=teams[p]?.[i];
   if(c?.passive?.type==='on_enter'){
    c.passiveUses=1;
    applyOnEnter(c,p,i,teams,field,events,'ultimon',{...room.settings,fieldSize:format},false);
   }
  }
 }
 return {status:'pre_battle',phaseStartedAt:Date.now(),
  'ultimon.selected':selected,teams,field,events,
  settings:{...room.settings,fieldSize:format},
  battleWeather:null,battleTailwind:{},fieldTraps:{},fieldTrapSeen:{},aiMemory:{},
  battleReport:createBattleReport(),postExecStatus:'battling',winner:null,
  startOfTurnTeams:null,startOfTurnField:null,turnExpiresAt:null,
  actions:Object.fromEntries(ROLES.map(p=>[p,{}])),
  healingItemsUsed:Object.fromEntries(ROLES.map(p=>[p,0])),
  hyperUsed:Object.fromEntries(ROLES.map(p=>[p,false])),
  pendingSwitches:Object.fromEntries(ROLES.map(p=>[p,0])),
  switchActions:Object.fromEntries(ROLES.map(p=>[p,[]])),
  switchZodiacChoices:Object.fromEntries(ROLES.map(p=>[p,{}]))
 };
}
export function ultimonDuelOutcome(room){
 const pair=room.ultimon?.pair||[];
 if(pair.length!==2)throw new Error('Duello incompleto.');
 const aliveA=(room.teams[pair[0]]||[]).some(alive);
 const aliveB=(room.teams[pair[1]]||[]).some(alive);
 if(aliveA&&aliveB)return null;
 return {winner:aliveA?pair[0]:aliveB?pair[1]:null,loser:aliveA?pair[1]:aliveB?pair[0]:null};
}
export function finishUltimonDuel(room){
 if(room.status!=='ultimon_result')throw new Error('Lo scontro non è terminato.');
 const outcome=ultimonDuelOutcome(room);
 if(!outcome)throw new Error('Ci sono ancora due squadre in campo.');
 const u=room.ultimon,rosters=clone(u.rosters),stats=clone(u.stats);
 const ko={},eliminated=[...u.eliminated];
 for(const p of u.pair){
  const old=rosters[p],selection=u.selected?.[p]||[];
  ko[p]=[];
  for(let j=0;j<selection.length;j++){
   const i=selection[j],original=old[i],fought=room.teams?.[p]?.[j];
   if(!original||!fought)continue;
   const prev=original.hp;
   const remaining=Math.max(0,Math.min(original.maxHp,Number(fought.hp)||0));
   original.hp=remaining;
   if(prev>0&&remaining<=0){ko[p].push(original.name);stats[p].lost++;}
   if(remaining>0&&p===outcome.winner)
     original.hp=Math.min(original.maxHp,remaining+Math.ceil(original.maxHp*.5));
  }
  stats[p].matches++;
  if(p===outcome.winner)stats[p].wins++;
  else if(p===outcome.loser)stats[p].losses++;
 }
 if(outcome.winner)stats[outcome.winner].knockouts+=ko[outcome.loser]?.length||0;
 const newlyEliminated=u.pair.filter(p=>ultimonAlive(rosters,p)===0);
 for(const p of newlyEliminated)if(!eliminated.includes(p))eliminated.push(p);
 const survivors=ultimonPlayers(room).filter(p=>ultimonAlive(rosters,p)>0);
 const champion=survivors.length===1?survivors[0]:null;
 const record={round:u.round,pair:[...u.pair],format:u.format,
  winner:outcome.winner,loser:outcome.loser,ko,eliminated:newlyEliminated,
  surviving:Object.fromEntries(u.pair.map(p=>[p,ultimonAlive(rosters,p)]))};
 // Le eliminazioni definitive hanno una cerimonia dedicata prima del recap
 // o dei premi: un solo host avanza lo stato condiviso con una transazione.
 return {status:newlyEliminated.length?'ultimon_elimination':
   survivors.length<=1?'ultimon_final':'ultimon_recap',
  phaseStartedAt:Date.now(),events:[],
  'ultimon.rosters':rosters,'ultimon.stats':stats,
  'ultimon.history':[...u.history,record],'ultimon.eliminated':eliminated,
  'ultimon.champion':champion};
}
export function finishUltimonElimination(room){
 if(room.gameMode!=='ultimon'||room.status!=='ultimon_elimination')
   throw new Error('Non è in corso una cerimonia di eliminazione.');
 const last=room.ultimon?.history?.at(-1);
 if(!last?.eliminated?.length)
   throw new Error('Non ci sono squadre eliminate da presentare.');
 const survivors=ultimonActive(room);
 return {status:survivors.length<=1?'ultimon_final':'ultimon_recap',
   phaseStartedAt:Date.now()};
}
export function ultimonLeaderboard(room){
 const u=room.ultimon||{},players=ultimonPlayers(room);
 const eliminated=u.eliminated||[];
 return players.map(p=>({
  role:p,name:room.players[p],team:u.identities?.[p]?.name||room.players[p],
  color:u.identities?.[p]?.color||'#94a3b8',alive:ultimonAlive(u.rosters,p),
  original:(u.rosters?.[p]||[]).length,
  ...(u.stats?.[p]||{matches:0,wins:0,losses:0,knockouts:0,lost:0}),
  eliminatedRank:eliminated.indexOf(p)
 })).sort((a,b)=>{
  if(a.role===u.champion)return -1;
  if(b.role===u.champion)return 1;
  if(a.alive!==b.alive)return b.alive-a.alive;
  if(a.eliminatedRank!==b.eliminatedRank)return b.eliminatedRank-a.eliminatedRank;
  return b.wins-a.wins||b.knockouts-a.knockouts||a.role.localeCompare(b.role);
 });
}
