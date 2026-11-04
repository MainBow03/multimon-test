import {maybeRogueEvent,canChooseRogueEvent,applyCoopRogueChoice,getRogueEvent,applyRogueEntryMoss,rogueAdvancedEnemyPool} from './roguelikeEvents.js';
import {empowerRoguelikeBoss} from './roguelikeBossPower.js';
// Funzioni pure per la spedizione co-op. La stanza Firestore è la sola fonte di verità.
export const COOP_HUMANS=['p1','p2','p3'];
export const COOP_BOSS='p4';
export const COOP_MAX_FLOOR=50;
export const COOP_MAX_TEAM=8;
export const COOP_STARTERS_PER_PLAYER=2;
// In ogni blocco di dieci piani: incontro da 2, poi da 3, poi il boss.
// I boss occupano un solo slot, mentre la squadra CPU può schierare 2 o 3
// Multimon contemporaneamente (NON in panchina).
export function coopEncounterSizeForFloor(floor){
 if(!Number.isInteger(floor)||floor<1||floor>COOP_MAX_FLOOR)return 0;
 if(floor%10===0)return 1;
 const stage=floor%10;
 return stage<=4?2:3;
}
const real=c=>Boolean(c&&!c.isSummonOnly);
export const coopHumanPlayers=room=>COOP_HUMANS.filter(p=>Boolean(room?.players?.[p])&&!room?.isBot?.[p]);
export const coopCount=(room,p)=>(room.teams?.[p]||[]).filter(real).length;
export const coopRosterIds=room=>new Set(COOP_HUMANS.flatMap(p=>(room.teams?.[p]||[]).filter(real).map(c=>c.id)));
export const coopRecruitChance=run=>Math.min(.85,Math.round((.30+(run?.recruitBonus||0))*100)/100);
/** Single-transaction draft start: guest joins can never occur between slot snapshot and draft. */
export function prepareCoopDraft(room,roster,random=Math.random){
 if(!room?.isRoguelikeCoop||room.status!=='lobby')
   throw new Error('La lobby Co-op è già stata avviata.');
 const humans=coopHumanPlayers(room);
 if(humans.length<2||humans.length>3)throw new Error('Servono due o tre giocatori per iniziare.');
 const draftable=roster.filter(c=>!c.isSummonOnly&&!c.isSecretUnlock&&!c.isCampaignMonster);
 if(draftable.length<3)throw new Error('Il roster non contiene abbastanza Multimon.');
 const choices={...(room.draftChoices||{})},rerolls={...(room.draftRerolls||{})};
 const draft={...(room.draft||{})};
 for(const p of humans){
  const shuffled=[...draftable];
  for(let i=shuffled.length-1;i>0;i--){
   const j=Math.floor(random()*(i+1));
   [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
  }
  choices[p]=shuffled.slice(0,3);
  rerolls[p]=2;draft[p]=[];
 }
 draft.p4=coopEnemyTeamForFloor(1,draftable,humans.length,[],random);
 return {status:'drafting',phaseStartedAt:Date.now(),draftChoices:choices,
  draftRerolls:rerolls,draft,
  // Anche le vecchie lobby ancora in attesa ricevono due personaggi per umano.
  settings:{...room.settings,teamSize:COOP_STARTERS_PER_PLAYER,fieldSize:1},
  coopRun:{...room.coopRun,floor:1}};
}
// Un solo criterio di prontezza per UI e motore: evita che il draft
// continui a richiedere un solo Guardiano dopo l'arrivo dei gruppi da 2/3.
export function isCoopDraftReady(room){
 if(!room?.isRoguelikeCoop || room.status!=='drafting')return false;
 const humans=coopHumanPlayers(room);
 if(humans.length<2 || humans.length>3)return false;
 const needed=room.settings?.teamSize===1?1:COOP_STARTERS_PER_PLAYER;
 return humans.every(p=>Array.isArray(room.draft?.[p]) && room.draft[p].length===needed) &&
   Array.isArray(room.draft?.p4) &&
   room.draft.p4.length===coopEncounterSizeForFloor(room.coopRun?.floor||1);
}

export const COOP_SHOP={
 heal:{price:20,desc:'Recupera il 50% dei PS massimi a un Multimon vivo'},
 revive:{price:50,desc:'Rianima un Multimon sconfitto con il 50% dei PS'},
 full:{price:90,desc:'Cura fino al massimo i PS di tutti i Multimon ancora vivi'}
};
/**
 * Pesatura: 1 + 3 multimon per ogni membro in meno rispetto al compagno
 * che ne possiede di più. Non assegna reclute a squadre con 8 membri.
 */
export function coopRecruitWeights(room){
 const players=coopHumanPlayers(room).filter(p=>coopCount(room,p)<COOP_MAX_TEAM);
 const maximum=Math.max(0,...players.map(p=>coopCount(room,p)));
 return players.map(p=>({player:p,count:coopCount(room,p),weight:1+3*(maximum-coopCount(room,p))}));
}
export function chooseCoopRecruitOwner(room,random=Math.random){
 const choices=coopRecruitWeights(room);
 const total=choices.reduce((sum,c)=>sum+c.weight,0);
 if(!total)return null;
 let roll=Math.max(0,Math.min(1-Number.EPSILON,random()))*total;
 for(const c of choices){roll-=c.weight;if(roll<0)return c.player}
 return choices.at(-1).player;
}
export function freshCoopFighter(base,old=null){
 const c=structuredClone(base);
 const hp=old?.hp??base.maxHp;
 Object.assign(c,{hp:Math.max(0,Math.min(base.maxHp,hp)),maxHp:base.maxHp,
  baseAtk:base.atk,baseDef:base.def,baseSpd:base.spd,
  spAtk:base.spAtk??base.atk,spDef:base.spDef??base.def,
  baseSpAtk:base.spAtk??base.atk,baseSpDef:base.spDef??base.def,
  statuses:[],consecutiveProtect:0,revealed:true,
  moves:(base.moves||[]).filter(Boolean).map(m=>({...m,remainingUses:m.maxUses??null}))});
 if(old?.heldItem)c.heldItem=old.heldItem;
 if(old?.zodiacSpiritId)c.zodiacSpiritId=old.zodiacSpiritId;
 return c;
}
export function coopEnemyForFloor(floor,roster,playerCount=3,encountered=[],random=Math.random){
 const end=floor===COOP_MAX_FLOOR,boss=floor%10===0;
 let eligible=roster.filter(c=>!c.isSummonOnly&&!c.isCampaignMonster && (
  end?(c.isSecretUnlock||c.price>=300||['trigon','gaster','cell'].includes(c.id)):!c.isSecretUnlock));
 if(!eligible.length)eligible=roster.filter(c=>!c.isSummonOnly);
 if(!end)eligible=rogueAdvancedEnemyPool(eligible,floor);
 const unseen=eligible.filter(c=>!encountered.includes(c.id));
 const pool=unseen.length?unseen:eligible;
 const base=pool[Math.floor(random()*pool.length)]||roster.find(c=>!c.isSummonOnly);
 if(!base)throw new Error('Nessun avversario disponibile.');
 const enemy=freshCoopFighter(base);
 // Crescita morbida piano dopo piano, non scatti improvvisi ogni dieci piani.
 const scale=1+(floor-1)*.012;
 const hpScale=(1+(Math.max(1,playerCount)-1)*.55)*(boss?1.55:1)*(end?1.6:1);
 const atkScale=(1+(floor-1)*.0095)*(boss?1.12:1)*(end?1.2:1);
 enemy.maxHp=Math.max(1,Math.round(base.maxHp*scale*hpScale));
 enemy.hp=enemy.maxHp;
 enemy.atk=Math.round(base.atk*atkScale);
 enemy.def=Math.round(base.def*(1+(floor-1)*.007));
 enemy.spd=Math.round(base.spd*(1+(floor-1)*.006));
 enemy.baseAtk=enemy.atk;enemy.baseDef=enemy.def;enemy.baseSpd=enemy.spd;
 enemy.isCoopBoss=boss||end;
 if(boss||end)empowerRoguelikeBoss(enemy);
 return enemy;
}
// I nemici normali di gruppo hanno ciascuno meno HP e Attacco del vecchio
// Guardiano singolo: la difficoltà cresce dal numero di bersagli, non da
// tre boss con statistiche enormi al piano 5.
export function coopEnemyTeamForFloor(floor,roster,playerCount=3,encountered=[],random=Math.random){
 const count=coopEncounterSizeForFloor(floor);
 if(!count)throw new Error('Piano Co-op inesistente.');
 const selected=[],seen=new Set();
 for(let i=0;i<count;i++){
  const previous=[...encountered,...seen];
  const enemy=coopEnemyForFloor(floor,roster,playerCount,previous,random);
  if(seen.has(enemy.id)){
   const alternative=roster.find(c=>!c.isSummonOnly&&!c.isSecretUnlock &&
     !c.isCampaignMonster&&!seen.has(c.id));
   if(alternative){
    const replacement=coopEnemyForFloor(floor,[alternative],playerCount,[],random);
    selected.push(replacement);seen.add(replacement.id);continue;
   }
  }
  selected.push(enemy);seen.add(enemy.id);
 }
 if(count>1)for(const enemy of selected){
   const baseHp=enemy.maxHp;
   const newHp=Math.max(1,Math.round(baseHp*(count===2?.53:.34)));
   enemy.maxHp=newHp;enemy.hp=newHp;
   enemy.atk=Math.max(1,Math.round(enemy.atk*(count===2?.62:.45)));
   enemy.def=Math.max(1,Math.round(enemy.def*(count===2?.90:.85)));
   enemy.spd=Math.max(1,Math.round(enemy.spd*(count===2?.94:.90)));
   enemy.baseAtk=enemy.atk;enemy.baseDef=enemy.def;enemy.baseSpd=enemy.spd;
   enemy.isCoopBoss=false;enemy.isCoopGroupEnemy=true;
 }
 return selected;
}
const emptyActions=()=>Object.fromEntries(['p1','p2','p3','p4','p5','p6','p7','p8'].map(p=>[p,{}]));
const emptyFields=()=>Object.fromEntries(['p1','p2','p3','p4','p5','p6','p7','p8'].map(p=>[p,[]]));
/** Returns one Firestore patch for winning the current floor, no duplicate reward on repeated click. */
export function finishCoopFloor(room,roster,random=Math.random){
 if(!room?.isRoguelikeCoop || room.status!=='gameover')
   throw new Error('La spedizione non è in fase di ricompensa.');
 const run=room.coopRun||{},floor=run.floor||1;
 if(!room.winner || room.winner===room.players?.p4 || room.winner==='Pareggio')
   throw new Error('Questo combattimento non è stato vinto.');
 const teams=structuredClone(room.teams);
 const humans=coopHumanPlayers(room);
 for(const p of humans)teams[p]=(teams[p]||[]).filter(real).map(c=>freshCoopFighter(roster.find(b=>b.id===c.id)||c,c));
 const coins=10+Math.floor(random()*21);
 const oldIds=coopRosterIds({teams});
 const enemies=(room.teams?.p4||[]).filter(c=>real(c)&&!oldIds.has(c.id));
 const recruitChance=coopRecruitChance(run);
 let recruited=null;
 if(enemies.length && random()<recruitChance){
  const choice=enemies[Math.floor(random()*enemies.length)];
  const owner=chooseCoopRecruitOwner({players:room.players,isBot:room.isBot,teams},random);
  const base=roster.find(c=>c.id===choice.id);
  if(base&&owner){
   teams[owner].push(freshCoopFighter(base));
   recruited={id:base.id,name:base.name,owner};
  }
 }
 // Accampamento ogni 5 piani: +40% soltanto ai combattenti vivi.
 if(floor%5===0)
  for(const p of humans)for(const c of teams[p]||[])
   if(c.hp>0)c.hp=Math.min(c.maxHp,c.hp+Math.floor(c.maxHp*.4));
 const lastEnemies=[...new Set([...(run.encounteredEnemies||[]),...(room.teams?.p4||[]).filter(real).map(c=>c.id)])];
 const complete=floor>=COOP_MAX_FLOOR;
 const nextEvent=complete?null:maybeRogueEvent(floor+1,COOP_MAX_FLOOR,run.relics||[],random,true,run.trainingUses||0);
 return {status:complete?'coop_complete':nextEvent?'coop_event':'coop_camp',teams,
  coopRun:{...run,floor:complete?floor:floor+1,lastClearFloor:floor,
   coins:(run.coins||0)+coins,lastCoins:coins,lastRecruit:recruited,
   recruitBonus:recruited?0:Math.min(.55,Math.round(((run.recruitBonus||0)+.02)*100)/100),
   encounteredEnemies:lastEnemies,finished:complete,
   pendingEvent:nextEvent,eventVotes:{},lastEventResult:null},
  phaseStartedAt:Date.now(),events:[],actions:emptyActions(),winner:null};
}
export function coopCampPurchase(room,roster,kind,player,idx){
 if(!room?.isRoguelikeCoop || room.status!=='coop_camp')
  throw new Error('Il negozio è disponibile solo all’accampamento.');
 const price=COOP_SHOP[kind]?.price;
 if(!price)throw new Error('Oggetto inesistente.');
 if((room.coopRun?.coins||0)<price)throw new Error('Monete della spedizione insufficienti.');
 if(!coopHumanPlayers(room).includes(player))throw new Error('Questo giocatore non partecipa alla spedizione.');
 const teams=structuredClone(room.teams);
 // La cura globale non seleziona un bersaglio: deve funzionare anche
 // se chi preme il pulsante ha una squadra vuota (gli altri alleati sono vivi).
 const target=teams[player]?.[idx];
 if(kind!=='full' && (!target || target.isSummonOnly))
   throw new Error('Il Multimon scelto non è disponibile.');
 if(kind==='heal'){
  if(target.hp<=0||target.hp>=target.maxHp)throw new Error('Scegli un Multimon vivo e ferito.');
  target.hp=Math.min(target.maxHp,target.hp+Math.floor(target.maxHp*.5));
 }else if(kind==='revive'){
  if(target.hp>0)throw new Error('Puoi rianimare soltanto un Multimon esausto.');
  target.hp=Math.max(1,Math.floor(target.maxHp*.5));
 }else if(kind==='full'){
  if(!coopHumanPlayers(room).some(p=>teams[p]?.some(c=>real(c)&&c.hp>0&&c.hp<c.maxHp)))
   throw new Error('Tutti i Multimon vivi hanno già i PS al massimo.');
  for(const p of coopHumanPlayers(room))for(const c of teams[p]||[])if(real(c)&&c.hp>0)c.hp=c.maxHp;
 }
 return {teams,coopRun:{...room.coopRun,coins:room.coopRun.coins-price}};
}
/** Atomically reset combat for the next floor without losing persistent HP, recruits or items. */
export function nextCoopFloor(room,roster,applyOnEnter=null,random=Math.random){
 if(!room?.isRoguelikeCoop || room.status!=='coop_camp')
   throw new Error('Il prossimo piano non è ancora disponibile.');
 const floor=room.coopRun?.floor||1;
 if(floor>COOP_MAX_FLOOR)throw new Error('La spedizione è già terminata.');
 const humans=coopHumanPlayers(room);
 if(humans.length<2)throw new Error('Servono almeno due giocatori.');
 const teams={...structuredClone(room.teams)},field=emptyFields();
 const relics=room.coopRun?.relics||[], nextBattlePower=room.coopRun?.nextBattlePower||1;
 for(const p of humans){
  teams[p]=(room.teams[p]||[]).filter(real).map(c=>freshCoopFighter(roster.find(b=>b.id===c.id)||c,c));
  for(const c of teams[p]){c.rogueRelics=[...relics];c.roguePowerBonus=nextBattlePower;c.rogueShiftUsed=false;applyRogueEntryMoss(c,relics);}
  const idx=teams[p].findIndex(c=>c.hp>0);
  if(idx>=0)field[p]=[idx];
 }
 if(!humans.some(p=>field[p].length))throw new Error('Tutti i Multimon sono esausti! Occorre rianimarne uno.');
 const enemies=coopEnemyTeamForFloor(floor,roster,humans.length,room.coopRun.encounteredEnemies,random);
 teams.p4=enemies;field.p4=enemies.map((_,idx)=>idx);
 const events=[];
 if(typeof applyOnEnter==='function')
  for(const p of [...humans,'p4'])for(const idx of [...field[p]]){
   const c=teams[p][idx];
   if(c?.passive?.type==='on_enter'){
    c.passiveUses=1;
    applyOnEnter(c,p,idx,teams,field,events,room);
   }
  }
 return {status:'pre_battle',phaseStartedAt:Date.now(),turnExpiresAt:null,
  coopTrade:null,coopTradeLastResult:null,
  teams,field,events,postExecStatus:'battling',battleWeather:null,
  startOfTurnTeams:null,startOfTurnField:null,
  fieldTraps:{},fieldTrapSeen:{},actions:emptyActions(),
  healingItemsUsed:{p1:0,p2:0,p3:0,p4:0,p5:0,p6:0,p7:0,p8:0},
  hyperUsed:{p1:false,p2:false,p3:false,p4:false},
  pendingSwitches:{p1:0,p2:0,p3:0,p4:0},
  switchActions:{p1:[],p2:[],p3:[],p4:[]},switchZodiacChoices:{p1:{},p2:{},p3:{},p4:{}},
  winner:null,rogueRelics:[...relics],rogueDawnUsed:false,aiMemory:{},
  coopRun:{...room.coopRun,nextBattlePower:1,lastRecruit:null,lastCoins:0},
  // Start fresh combat reports on each floor.
  battleReport:{version:1,turns:0,entries:{}}};
}


/** Ogni voto è salvato in una transazione Firestore. Vince la maggioranza;
 * in parità decide l'host (p1). L'ultimo voto risolve l'evento in modo atomico.
 */
export function voteCoopEvent(room,player,choiceId){
 if(!room?.isRoguelikeCoop||room.status!=='coop_event'||!room.coopRun?.pendingEvent)
   throw new Error('Non ci sono eventi aperti.');
 const humans=coopHumanPlayers(room);
 if(!humans.includes(player))throw new Error('Non partecipi alla spedizione.');
 const run=room.coopRun;
 if(!canChooseRogueEvent(run.pendingEvent,choiceId,run.coins,run.relics,run.trainingUses))
   throw new Error('Questa scelta non è disponibile.');
 const votes={...(run.eventVotes||{}),[player]:choiceId};
 if(humans.every(p=>votes[p])){
   const chosen=chooseCoopEventWinner(run.pendingEvent,votes,humans,run.trainingUses);
   return applyCoopRogueChoice({...room,coopRun:{...run,eventVotes:votes}},chosen);
 }
 return {coopRun:{...run,eventVotes:votes}};
}

export function chooseCoopEventWinner(event,votes,humans,trainingUses=0){
 const choices=event?.altType?['pathA','pathB']:(getRogueEvent(event)?.choices.map(c=>c.id).filter(id=>canChooseRogueEvent(event,id,Infinity,[],trainingUses))||[]);
 if(!choices.length)throw new Error('Evento sconosciuto.');
 const ranked=choices.map(id=>({id,count:humans.filter(p=>votes[p]===id).length}));
 ranked.sort((a,b)=>b.count-a.count);
 if(ranked.length>1&&ranked[0].count===ranked[1].count&&choices.includes(votes.p1))
   return votes.p1;
 if(ranked[0].count)return ranked[0].id;
 // Se nessuno vota, evita automaticamente il sentiero più rischioso.
 if(event?.altType){
   const safety={merchant:4,trainer:3,chest:2,bargain:1};
   return (safety[event.type]||0)>=(safety[event.altType]||0)?'pathA':'pathB';
 }
 return choices[choices.length-1];
}

/** Recovery: dopo 75s l'host (o chi lo sostituisce) può chiudere il voto.
 * Nessun voto viene inventato per conto di giocatori scollegati.
 */
export function finalizeCoopEvent(room,now=Date.now()){
 if(!room?.isRoguelikeCoop||room.status!=='coop_event')
   throw new Error('La votazione non è più aperta.');
 if(now-(room.phaseStartedAt||now)<75000)
   throw new Error('Attendi il termine del tempo per i voti.');
 const humans=coopHumanPlayers(room);
 const chosen=chooseCoopEventWinner(room.coopRun.pendingEvent,room.coopRun.eventVotes||{},humans,room.coopRun.trainingUses);
 if(!canChooseRogueEvent(room.coopRun.pendingEvent,chosen,room.coopRun.coins,room.coopRun.relics,room.coopRun.trainingUses))
   throw new Error('La scelta non è disponibile.');
 return applyCoopRogueChoice(room,chosen);
}
