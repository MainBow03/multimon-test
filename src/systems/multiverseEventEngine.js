import { applyBattleStatModifier } from './statBalance.js';
import { reduceIncomingHeldDamage, useHeroSash, activateHourglass, boostedStatusChance,
  markCompassOnHit, recordOffensiveMove, activateVictoryBoots, endVictoryBootsTurn,
  shortenNegativeStatus, reflectNegativeStatus, activateRescueBell } from './advancedHeldItems.js';
import { applyStrengthToFighter } from './strengthLab.js';
import { copyKirbyMoveOnHit } from './kirbyCopy.js';
import { CHARACTERS } from '../data/characters.js';
import {SOUNDTRACKS,DEFAULT_BATTLE_SOUNDTRACK} from '../data/soundtracks.js';
import { getMultiplier } from './typeSystem.js';
import { calculateDamageImpl } from './battleSystem.js';
import { triggerJackpot,triggerMiraculousAllyHeal,consumeFutureStrike } from './selectedCharacterPassives.js';
import { getHeldEvasion,getHeldEndTurnHeal,useHeldGem } from './heldEquipment.js';
import { activateHealingSprout,activateNeutralizingSpray,activateCupidArrow,blockedEnemyPassive,
 rapidTransmutationPriority,markRapidTransmutationEntry,endRapidTransmutationTurn,
 immuneToCritical,hannibalCanDebuff,isNegativeStatus } from './newHeldAndPassiveEffects.js';
import { ignoresShields, immuneToStatDrops, powerForAccordo,
  effectiveTaserPower, stickyTrapEntryDamage } from './rockstarAgentEffects.js';
import { addEvasion, crystalShield, beginRefraction, directHitAfterCrystalDefense,
  endRefractionTurn, snowstormOutcome, randomBuff, randomDebuff, daffyCelebration } from './championEffects.js';
export const EVENT_PRIZES={1:400,2:200,3:140,other:50};
export function normalizeEventSettings(s={}){
 const n=+s.entrants,team=+s.teamSize,field=+s.fieldSize,doubles=!!s.doubles;
 return {entrants:[4,8,16,32].includes(n)?n:8,teamSize:Math.max(4,Math.min(8,team||4)),
 doubles,fieldSize:Math.max(1,Math.min(doubles?2:4,field||1)),allowItems:!!s.allowItems,allowHyper:!!s.allowHyper,
 soundtrack:SOUNDTRACKS.some(track=>track.id===s.soundtrack)?s.soundtrack:DEFAULT_BATTLE_SOUNDTRACK};
}
export const validTeam=(team,s)=>Array.isArray(team)&&team.length===s.teamSize
 && new Set(team).size===team.length && team.every(id=>CHARACTERS.some(c=>c.id===id&&!c.isSummonOnly&&!c.isSecretUnlock));
export function makeEventEntrants(players,bots,s,order=[]){
 const all=[...players,...bots].map(p=>({...p,id:p.id||p.uid})),lookup=new Map(all.map(p=>[p.id,p]));
 const sorted=[...new Set([...order,...all.map(x=>x.id)])].map(id=>lookup.get(id)).filter(Boolean);
 if(sorted.length!==s.entrants*(s.doubles?2:1)||!sorted.every(p=>p.ready&&validTeam(p.teamIds,s)))throw Error('Servono tutti i partecipanti con squadra completa.');
 const n=s.doubles?2:1;
 return Array.from({length:s.entrants},(_,i)=>{const slice=sorted.slice(i*n,i*n+n);return{id:'entrant-'+i,name:slice.map(x=>x.name).join(' & '),members:slice.map(x=>x.id)}});
}
// Mantieni le coppie impostate dall'host, ma distribuiscile casualmente nel primo turno.
export function shuffleEventEntrants(entrants,random=Math.random){
 const shuffled=[...entrants];
 for(let i=shuffled.length-1;i>0;i--){
  const j=Math.max(0,Math.min(i,Math.floor(random()*(i+1))));
  [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
 }
 return shuffled;
}
export const EVENT_INACTIVITY_MS=5*60*1000;
export function isLiveEvent(e,now=Date.now()){
 if(!e||!['lobby','running'].includes(e.status))return false;
 const heartbeat=e.hostHeartbeatAt?.toMillis?.() ??
  (typeof e.hostHeartbeatAt?.seconds==='number'?e.hostHeartbeatAt.seconds*1000:(e.updatedAt||e.createdAt));
 return Number.isFinite(heartbeat)&&heartbeat<=now+30000&&now-heartbeat<EVENT_INACTIVITY_MS;
}
export function makeEventBracket(entrants,random=Math.random){
 if(![4,8,16,32].includes(entrants.length))throw Error('Numero di squadre non valido.');
 const seed=shuffleEventEntrants(entrants,random);
 const matches=[],n=Math.log2(seed.length);
 for(let r=0;r<n;r++)for(let i=0;i<entrants.length/(2**(r+1));i++)matches.push({id:'r'+r+'-m'+i,round:r,slot:i,stage:r===n-1?'final':'normal',sideA:r===0?seed[2*i]:null,sideB:r===0?seed[2*i+1]:null,winner:null,loser:null});
 matches.splice(matches.length-1,0,{id:'bronze',round:n-1,slot:-1,stage:'bronze',sideA:null,sideB:null,winner:null,loser:null});
 return matches;
}
export function nextEventMatch(matches){return matches.find(m=>m.sideA&&m.sideB&&!m.winner)||null}
export function completeEventMatch(matches,id,side){
 const arr=structuredClone(matches),m=arr.find(x=>x.id===id);
 if(!m||m.winner||!m.sideA||!m.sideB)throw Error('Incontro non valido');
 m.winner=side==='A'?m.sideA:m.sideB;m.loser=side==='A'?m.sideB:m.sideA;
 if(m.stage==='normal'){
  const next=arr.find(x=>x.id==='r'+(m.round+1)+'-m'+Math.floor(m.slot/2));
  if(next)next[m.slot%2?'sideB':'sideA']=m.winner;
  const semi=Math.log2(arr.filter(x=>x.round===0).length*2)-2;
  if(m.round===semi)arr.find(x=>x.stage==='bronze')[m.slot%2?'sideB':'sideA']=m.loser;
 }
 return arr;
}
export function eventPlacements(matches,entrants){
 const f=matches.find(x=>x.stage==='final'),b=matches.find(x=>x.stage==='bronze');
 if(!f?.winner||!b?.winner)return null;
 const ranks={[f.winner.id]:1,[f.loser.id]:2,[b.winner.id]:3},participants={};
 for(const e of entrants)for(const uid of e.members){let rank=ranks[e.id]||4;participants[uid]={rank,coins:EVENT_PRIZES[rank]||50}}
 return{entrants:ranks,participants};
}
function fighter(id,owner,item,upgrades){
 const c=CHARACTERS.find(x=>x.id===id);if(!c)throw Error('Multimon mancante: '+id);
 const baseline={key:owner+'-'+id,id,owner,name:c.name,img:c.img,types:c.types||[],hp:c.maxHp,maxHp:c.maxHp,
 atk:c.atk,baseAtk:c.atk,def:c.def,baseDef:c.def,spDef:c.spDef||c.def,baseSpDef:c.spDef||c.def,spd:c.spd,baseSpd:c.spd,spAtk:c.spAtk||c.atk,baseSpAtk:c.spAtk||c.atk,passive:c.passive||null,heldItem:item||null,gemSpent:false,healingSproutUsed:false,neutralizingSprayUsed:false,rapidTransmutationReady:false,hyper:false,statuses:[],
 moves:c.moves.map(m=>({...m,name:m.name,type:m.type,power:m.power||0,accuracy:m.accuracy??100,
 targetCount:m.targetCount||1,uses:m.maxUses??null,contact:!!m.contact,
 special:!!m.special,recharge:!!m.recharge,transform:!!m.transformMahito,effect:m.statusEffect||null,buff:m.selfStatBuff||m.statBuff||null,drain:m.drain||0,
 heal:m.heal||0,enemyDebuff:m.targetStatDebuff||null,snowstormTurns:m.snowstormTurns||0,
 evasionGain:m.evasionGain||0,crystalShieldPercent:m.crystalShieldPercent||0,
 refractionTurns:m.refractionTurns||0,bonusAgainstFaster:m.bonusAgainstFaster||0,
 priority:m.priority||0,ignoreShields:!!m.ignoreShields,ignoreTaunt:!!m.ignoreTaunt,
 placeStickyTrap:!!m.placeStickyTrap,scalingEnemyCount:!!m.scalingEnemyCount,bonusIfSlowed:m.bonusIfSlowed||0,
 ignoreDefBuffs:!!m.ignoreDefBuffs,speedScaling:!!m.speedScaling,
    critChance:m.critChance??null,critPower:m.critPower??null,multiHit:m.multiHit||null,
    targetMode:m.targetMode||null,target:m.target||null,targetStatBuff:m.targetStatBuff||null,
    isProtect:!!m.isProtect,protectStatus:m.protectStatus||null,
    healTeam:m.healTeam??null,healAlone:m.healAlone??null,
    removeNegativeStatuses:!!m.removeNegativeStatuses}))};
 return upgrades?applyStrengthToFighter(baseline,upgrades):baseline;
}
export function buildEventBattle(match,people,s){
 const make=side=>side.members.flatMap(uid=>people[uid].teamIds.map(id=>fighter(id,uid,s.allowItems?people[uid].heldItems?.[id]:null,people[uid].strengthUpgrades)));
 const teams={A:make(match.sideA),B:make(match.sideB)};
 const owners={A:match.sideA.members,B:match.sideB.members};
 const activeKeys=Object.fromEntries([...owners.A,...owners.B].map(uid=>[
     uid,[...teams.A,...teams.B].filter(u=>u.owner===uid).slice(0,s.fieldSize).map(u=>u.key)
 ]));
 const battle={matchId:match.id,side:'A',turn:1,teams,owners,activeKeys,hyperUsed:{},finished:false,winner:null,
 weather:null,traps:{},log:['Inizia '+match.sideA.name+' contro '+match.sideB.name+'!']};
 for(const side of ['A','B']){
  for(const unit of activeEventFighters(battle,side,s)){
   unit.eventEntered=true;
   markRapidTransmutationEntry(unit);
   applyEventEntryPassive(battle,side,unit,s,Math.random,battle.log);
  }
 }
 return battle;
}
export function activeEventFighters(b,side,s){
 return b.owners[side].flatMap(uid=>{
   const available=b.teams[side].filter(x=>x.owner===uid&&x.hp>0);
   const chosen=(b.activeKeys?.[uid]||[]).map(key=>available.find(u=>u.key===key)).filter(Boolean);
   // Compatibilità con eventi vecchi senza activeKeys e subentro automatico
   // se il titolare è KO e rimane una riserva viva.
   return [...chosen,...available.filter(x=>!chosen.includes(x))].slice(0,s.fieldSize);
 });
}
// Le abilità all'ingresso si attivano anche nel torneo.
export function applyEventEntryPassive(b,side,entrant,s,random=Math.random,log=b.log||[]){
 const p=entrant?.passive;
 if(p?.type!=='on_enter'||(entrant.eventPassiveUses||0)>=(p.maxUses||1))return false;
 entrant.eventPassiveUses=(entrant.eventPassiveUses||0)+1;
 const opposite=side==='A'?'B':'A';
 const enemies=activeEventFighters(b,opposite,s).filter(u=>u.hp>0);
 if(p.enemyStatDebuff){
  let count=0;
  for(const enemy of enemies){
   if(blockedEnemyPassive(enemy)||immuneToStatDrops(enemy)){
     log.push(enemy.name+' è protetto dal malus di '+entrant.name+'!');
     continue;
   }
   for(const [stat,mult] of Object.entries(p.enemyStatDebuff)){
     if(!Number.isFinite(enemy[stat]))continue;
     if(stat==='atk'&&enemy.passive?.type==='immune_to_atk_debuff')continue;
     enemy[stat]=Math.max(1,Math.floor(enemy[stat]*mult));count++;
   }
  }
  if(count)log.push(entrant.name+' attiva '+p.name+': statistiche nemiche ridotte!');
 }
 if(p.applyStatusToRandomEnemy){
  const victim=enemies[Math.floor(random()*enemies.length)];
  if(victim){
   const type=p.applyStatusToRandomEnemy.type;
   if(isNegativeStatus(type)&&(blockedEnemyPassive(victim)||victim.passive?.immuneToNegativeStatuses))
     log.push(victim.name+' neutralizza '+p.name+'!');
   else{
     victim.statuses||=[];
     if(!victim.statuses.includes(type))victim.statuses.push(type);
     log.push(entrant.name+' usa '+p.name+': '+victim.name+' riceve '+type+'!');
     const cured=activateNeutralizingSpray(victim);
     if(cured.length)log.push('Spray Neutralizzante di '+victim.name+' rimuove '+cured.join(', ')+'!');
   }
  }
 }
 return true;
}
export function botActions(b,uid,s){
 const targets=activeEventFighters(b,b.side==='A'?'B':'A',s);
 return activeEventFighters(b,b.side,s).filter(x=>x.owner===uid).map(c=>{
 const ranks=c.moves.map((m,i)=>({m,i})).filter(x=>x.m.uses===null||x.m.uses>0).sort((a,d)=>d.m.power-a.m.power);
 return{actor:c.key,moveIndex:ranks[0]?.i||0,target:targets[0]?.key||null}});
}
// Una battaglia evento usa lo stesso calcolo dei danni del gioco classico;
// gli effetti dei nuovi campioni sono sincronizzati nello stato Firestore.
export function eventTurn(b,submissions,s,random=Math.random){
 if(b.finished)throw Error('Partita terminata');
 const x=structuredClone(b),side=x.side,oppo=side==='A'?'B':'A',log=[];
 x.activeKeys||={};
 const previouslyActive=new Set(Object.values(b.activeKeys||{}).flat());
 for(const uid of [...x.owners.A,...x.owners.B]){
   const team=x.owners.A.includes(uid)?'A':'B';
   x.activeKeys[uid]=activeEventFighters(x,team,s).filter(u=>u.owner===uid).map(u=>u.key);
 }
 for(const team of ['A','B'])for(const unit of activeEventFighters(x,team,s)){
   if(!previouslyActive.has(unit.key)){
     markRapidTransmutationEntry(unit);
     applyEventEntryPassive(x,team,unit,s,random,log);
   }
 }
 x.traps ||= {};
 // Applica le trappole quando entra un NUOVO personaggio, non a chi era
 // già in campo al momento del piazzamento.
 for(const team of ['A','B']){
  const trap=x.traps[team];
  if(!trap)continue;
  const active=activeEventFighters(x,team,s);
  const previous=new Set(trap.seen||[]);
  for(const unit of active){
   if(previous.has(unit.key))continue;
   const dmg=stickyTrapEntryDamage(unit);
   unit.hp=Math.max(0,unit.hp-dmg);
   log.push('Trappola Segreta: '+unit.name+' perde '+dmg+' PS entrando in campo!');
   const heal=activateHealingSprout(unit);
   if(heal)log.push('Germoglio Curativo di '+unit.name+' recupera '+heal+' PS!');
  }
  trap.seen=activeEventFighters(x,team,s).map(u=>u.key);
 }
 const commands=new Map(x.owners[side].flatMap(uid=>submissions[uid]||[]).map(c=>[c.actor,c]));
 const applyBuff=(actor,buffs)=>{
  if(!buffs)return;
  for(const [k,value] of Object.entries(buffs)){
    if(Number.isFinite(actor[k]))applyBattleStatModifier(actor,k,value);
  }
 };
 const status=(target,effect,source=null)=>{
  if(!effect||target.hp<=0)return;
  const chance=source?boostedStatusChance(source,effect.chance??1):effect.chance??1;
  if(random()>=chance)return;
  const name=effect.type;
  if(!target.statuses.includes(name)){
    target.statuses.push(name);
    if(source&&reflectNegativeStatus(target,source,name,random,true))
      log.push('Specchio delle Maledizioni di '+target.name+' riflette '+name+' su '+source.name+'!');
  }
  if(name==='Accecato')target.blindTurns=effect.turns||3;
  if(name==='Incantato'){target.enchantedTurns=effect.turns||10;target.enchantedFresh=true;}
  log.push(target.name+' riceve lo stato '+name+'!');
  const cleared=activateNeutralizingSpray(target);
  if(cleared.length)log.push('Spray Neutralizzante di '+target.name+': rimuove '+cleared.join(', ')+'!');
 };
 const hurt=(attacker,target,m)=>{
  const multiplier=getMultiplier(m.type,target.types);
  if(multiplier===0){log.push('Nessun effetto su '+target.name+'!');return 0;}
  // Il calcolo classic include Iperband, passiva petrosapien e Rifrazione.
  const wrap=u=>({...u,statuses:(u.statuses||[]).map(type=>({type})),
    heldItem:s.allowItems?u.heldItem:null});
  const raw=calculateDamageImpl({},wrap(attacker),wrap(target),m,multiplier,false,random);
  const crit=!immuneToCritical(target)&&random()<.05;
  const bonusDamage=crit?Math.max(1,Math.floor(raw*1.5)):raw;
  const defense=ignoresShields(attacker,m)?{damage:bonusDamage,absorbed:0,refracted:false}:directHitAfterCrystalDefense(target,bonusDamage);
  const prepared=reduceIncomingHeldDamage(target,defense.damage,{directAttack:true,superEffective:multiplier>1});
  defense.damage=prepared.damage;
  for(const name of prepared.activations)log.push(name+' protegge '+target.name+'!');
  if(crit)log.push('Brutto colpo di '+attacker.name+'!');

  const hpBefore=target.hp;
  if(useHeroSash(target,defense.damage,{directAttack:true})){
    log.push('Fascia dell’Eroe: '+target.name+' sopravvive con 1 PS!');
  }else target.hp=Math.max(0,target.hp-defense.damage);
  if(activateHourglass(target))log.push('Clessidra della Rapidità: '+target.name+' Velocità +20% fino alla fine dello scontro!');
  if(hpBefore>=target.maxHp*.25 && target.hp>0 && target.hp<target.maxHp*.25){
    const owners=x.teams.A.includes(target)?'A':'B';
    const bellOwner=activateRescueBell(activeEventFighters(x,owners,s),target);
    if(bellOwner)log.push('Campanella del Soccorso di '+bellOwner.name+' protegge '+target.name+' dal prossimo attacco!');
  }
  const heal=activateHealingSprout(target);
  if(heal)log.push('Germoglio Curativo di '+target.name+': recupera '+heal+' PS!');
  if(defense.damage>0&&hpBefore>0&&target.hp>0){
    if(activateCupidArrow(attacker,m,target,random,true,true)){
      log.push('Freccia di Cupido di '+attacker.name+': '+target.name+' è infatuato!');
    }
    if(hannibalCanDebuff(attacker,target,random)){
      const stat=randomDebuff(target,random);
      log.push('Manipolazione Psicologica di '+attacker.name+': '+stat+' di '+target.name+' -15%!');
    }
    const cleared=activateNeutralizingSpray(target);
    if(cleared.length)log.push('Spray Neutralizzante di '+target.name+' rimuove '+cleared.join(', ')+'!');
  }
  if(defense.refracted)log.push('Rifrazione dimezza il primo colpo su '+target.name+'!');
  if(defense.absorbed)log.push('Scudo di '+target.name+': '+defense.absorbed+' danni assorbiti.');
  log.push(attacker.name+' usa '+m.name+' su '+target.name+': '+defense.damage+' danni'+(target.hp?'':' KO!'));
  if(target.hp>0&&target.passive?.type==='on_hp_threshold'&&!target.passiveUsed&&
     target.hp/target.maxHp<=target.passive.threshold){
    target.passiveUsed=true;applyBuff(target,target.passive.statBuff);
    log.push(target.name+' attiva '+target.passive.name+'!');
    if(target.passive.aoeDamagePercentMaxHp){
      const defendersSide=x.teams.A.includes(target)?'A':'B';
      const opposingSide=defendersSide==='A'?'B':'A';
      for(const foe of activeEventFighters(x,opposingSide,s)){
        if(foe.hp<=0)continue;
        if(blockedEnemyPassive(foe)){log.push('Scudo Anti-Magia protegge '+foe.name+' dalla scarica di '+target.name+'!');continue;}
        const recoil=Math.max(1,Math.floor(foe.maxHp*target.passive.aoeDamagePercentMaxHp));
        foe.hp=Math.max(0,foe.hp-recoil);
        log.push(foe.name+' perde '+recoil+' PS per '+target.passive.name+'!');
        const sprout=activateHealingSprout(foe);
        if(sprout)log.push('Germoglio Curativo di '+foe.name+': cura '+sprout+' PS!');
      }
    }
  }

  if(defense.damage>0&&hpBefore>0&&target.hp===0&&activateVictoryBoots(attacker))
    log.push('Stivali dello Slancio: '+attacker.name+' Velocità +15% per il prossimo turno!');
  if(defense.damage>0&&markCompassOnHit(attacker,target,hpBefore,defense.damage))
    log.push('Bussola del Predatore di '+attacker.name+' potenzia il colpo!');
  if(!target.hp){
    for(const ally of activeEventFighters(x,side,s).filter(u=>u!==attacker&&u.passive?.type==='failed_star')){
      const healed=daffyCelebration(ally);
      if(healed)log.push(ally.name+' attiva Protagonista Mancato: recupera '+healed+' PS e ATK +10%!');
    }
  }
  return defense.damage;
 };
 for(const actor of activeEventFighters(x,side,s).sort((a,b)=>{
  const ma=a.moves[Number(commands.get(a.key)?.moveIndex)||0];
  const mb=b.moves[Number(commands.get(b.key)?.moveIndex)||0];
  return ((mb?.priority||0)+rapidTransmutationPriority(b,mb))-((ma?.priority||0)+rapidTransmutationPriority(a,ma))||b.spd-a.spd;
 })){
  if(actor.hp<=0)continue;
  const oldMalus=activateNeutralizingSpray(actor);
  if(oldMalus.length)log.push('Spray Neutralizzante di '+actor.name+' rimuove '+oldMalus.join(', ')+'!');
  if(actor.statuses.includes('Stordito')){
    actor.statuses=actor.statuses.filter(s=>s!=='Stordito');
    log.push(actor.name+' è stordito e salta il turno!');continue;
  }
  if(actor.statuses.includes('Ricarica')){
    actor.statuses=actor.statuses.filter(s=>s!=='Ricarica');
    log.push(actor.name+' deve ricaricarsi e perde il turno.');continue;
  }
  if(actor.statuses.includes('Infatuato')){
    actor.cupidCharmTurns=(actor.cupidCharmTurns??4)-1;
    if(actor.cupidCharmTurns<=0){
      actor.statuses=actor.statuses.filter(s=>s!=='Infatuato');actor.cupidCharmTurns=0;
    }else if(random()<.5){
      log.push(actor.name+' è troppo infatuato e salta il turno!');continue;
    }
  }
  const command=commands.get(actor.key);
  if(!command){log.push(actor.name+' passa.');continue;}
  if(command.type==='switch'&&command.switchTo){
   const ally=x.teams[side].find(u=>u.owner===actor.owner&&u.key===command.switchTo&&u.hp>0);
   const current=x.activeKeys[actor.owner]||[];
   if(ally&&!current.includes(ally.key)){
     x.activeKeys[actor.owner]=current.map(k=>k===actor.key?ally.key:k);
     markRapidTransmutationEntry(ally,true);
     applyEventEntryPassive(x,side,ally,s,random,log);
     log.push(actor.name+' rientra, entra '+ally.name+'!');
   }else log.push(actor.name+' non riesce a cambiare.');
   continue;
  }
  const m=actor.moves[Number(command.moveIndex)]||actor.moves[0];if(!m||m.uses===0)continue;
  if(s.allowHyper&&command.hyper&&!x.hyperUsed[actor.owner]){
   // Forma Iper nel torneo: +35% Attacco, Attacco Speciale e PS
   // invece di +50%. Gli altri effetti e le mosse speciali restano.
   x.hyperUsed[actor.owner]=true;actor.hyper=true;actor.atk=Math.round(actor.atk*1.35);
   actor.baseAtk=Math.round(actor.baseAtk*1.35);actor.baseSpAtk=Math.round(actor.baseSpAtk*1.35);
   actor.spAtk=Math.round(actor.spAtk*1.35);actor.maxHp=Math.round(actor.maxHp*1.35);
   actor.hp=Math.min(actor.maxHp,Math.round(actor.hp*1.35));log.push(actor.name+' usa la forma Iper!');
  }
  if(m.uses!==null)m.uses--;
  const accuracy=(m.accuracy<=1?m.accuracy:m.accuracy/100)*(actor.statuses.includes('Accecato')?.8:1);
  if(random()>accuracy){log.push(actor.name+' manca '+m.name);continue;}
  if(m.transform&&actor.id==='mahito'){
    actor.atk=Math.floor(actor.atk*1.5);actor.spAtk=Math.floor(actor.spAtk*1.5);
    actor.transformed=true;log.push(actor.name+' si trasfigura!');continue;
  }
  if(!m.power){
   applyBuff(actor,m.buff);
   if(m.heal){const h=Math.max(1,Math.floor(actor.maxHp*m.heal));actor.hp=Math.min(actor.maxHp,actor.hp+h);log.push(actor.name+' recupera '+h+' PS!');}
   if(m.evasionGain){addEvasion(actor);log.push(actor.name+' aumenta l’elusione!');}
   if(m.crystalShieldPercent){crystalShield(actor);log.push(actor.name+' innalza un Muro Cristallino!');}
   if(m.refractionTurns){beginRefraction(actor);log.push(actor.name+' attiva Rifrazione!');}
   if(m.placeStickyTrap){
     x.traps[oppo]={seen:activeEventFighters(x,oppo,s).map(u=>u.key)};
     log.push(actor.name+' piazza una Trappola Segreta sul campo avversario!');
   }
   const enemies=activeEventFighters(x,oppo,s).filter(u=>u.hp>0);
   const t=enemies.find(v=>v.key===command.target)||enemies[0];
   if(t&&m.enemyDebuff){
     if(immuneToStatDrops(t))log.push(t.name+' è immune ai cali di statistiche!');
     else{applyBuff(t,m.enemyDebuff);log.push(t.name+' subisce un calo di statistiche!');}
   }
   if(t)status(t,m.effect,actor);
   log.push(actor.name+' usa '+m.name);
   if(m.recharge&&actor.hp>0){
      if(!actor.statuses.includes('Ricarica'))actor.statuses.push('Ricarica');
      const cured=activateNeutralizingSpray(actor);
      if(cured.length)log.push('Spray Neutralizzante di '+actor.name+' annulla Ricarica!');
   }
   continue;
  }
  const visible=activeEventFighters(x,oppo,s).filter(v=>v.hp>0);
  let targets=m.targetCount>=4?visible:
    m.targetCount>1?[
      ...visible.filter(v=>v.key===command.target),
      ...visible.filter(v=>v.key!==command.target)
    ].slice(0,m.targetCount):
    visible.filter(v=>v.key===command.target).slice(0,1);
  if(!targets.length&&visible.length)targets=[visible[0]];
  let hitAny=false;
  for(const t of targets){
   if(t.hp<=0)continue;
   if(random()<(1-(1-Math.min(.95,t.evasionBonus||0))*(1-getHeldEvasion(t)))){log.push(t.name+' schiva il colpo!');continue;}
   hitAny=true;
   const actualMove=m.scalingEnemyCount?{...m,power:powerForAccordo(visible.length)}:
     m.bonusIfSlowed?{...m,power:effectiveTaserPower(t)}:m;
   const damage=hurt(actor,t,actualMove);
   if(damage>0 && m.drain && actor.hp>0){
     const gained=Math.max(1,Math.floor(damage*m.drain));
     const restored=Math.min(gained,actor.maxHp-actor.hp);
     actor.hp+=restored;
     if(restored>0)log.push(actor.name+' recupera '+restored+' PS con '+m.name+'!');
   }
   if(damage>0 && actor.hp>0){
     const copied=copyKirbyMoveOnHit(actor,t,t.key,random);
     if(copied)log.push('⭐ '+actor.name+' attiva Copia Abilità: impara '+copied.name+' da '+t.name+'! ('+actor.kirbyCopiedTargets.length+'/2)');
   }
   if(t.hp&&damage&&actor.id==='mahito'&&m.contact&&random()<.3&&!t.statuses.includes('Anima Distorta')){
     t.statuses.push('Anima Distorta');log.push('Anima Distorta su '+t.name);
   }
   if(t.hp)status(t,m.effect,actor);
   if(t.hp&&m.enemyDebuff){
     if(immuneToStatDrops(t))log.push(t.name+' è immune ai cali di statistiche!');
     else{applyBuff(t,m.enemyDebuff);log.push(t.name+' perde statistiche!');}
   }
  }
  recordOffensiveMove(actor,m);
  if(hitAny&&useHeldGem(actor,m))log.push('La gemma di '+actor.name+' si rompe dopo aver potenziato '+m.name+'!');
  if(m.recharge&&hitAny&&actor.hp>0){
     if(!actor.statuses.includes('Ricarica'))actor.statuses.push('Ricarica');
     const cured=activateNeutralizingSpray(actor);
     if(cured.length)log.push('Spray Neutralizzante di '+actor.name+' neutralizza Ricarica!');
  }
  if(hitAny&&m.buff)applyBuff(actor,m.buff);
  if(hitAny&&m.snowstormTurns){x.weather={type:'snowstorm',turns:m.snowstormTurns};log.push('Una tempesta di neve investe il campo!');}
  if(hitAny&&s.allowItems&&actor.heldItem==='iperband'){
   const recoil=Math.max(1,Math.floor(actor.maxHp*.1));actor.hp=Math.max(0,actor.hp-recoil);
   log.push('Iperband: '+actor.name+' perde '+recoil+' PS');
  }
 }
 // Fine turno: effetti condivisi da tutti i giocatori, senza duplicati.
 for(const team of ['A','B']){
  for(const u of activeEventFighters(x,team,s)){
   if(u.hp<=0)continue;
   if(team===side){
     endRapidTransmutationTurn(u);
     if(endVictoryBootsTurn(u))log.push('Stivali dello Slancio: bonus Velocità di '+u.name+' terminato.');
   }
   const cured=activateNeutralizingSpray(u);
   if(cured.length)log.push('Spray Neutralizzante di '+u.name+' rimuove '+cured.join(', ')+'!');
   const leftovers=getHeldEndTurnHeal(u);
   if(leftovers&&u.hp<u.maxHp){u.hp=Math.min(u.maxHp,u.hp+leftovers);log.push(u.name+' recupera '+leftovers+' PS dagli Avanzi!');}
   if(u.statuses.includes('Anima Distorta')){
     const d=Math.max(1,Math.floor(u.maxHp*.05));u.hp=Math.max(0,u.hp-d);
     log.push(u.name+' perde '+d+' PS per Anima Distorta.');
   }
   const sprout=activateHealingSprout(u);
   if(sprout)log.push('Germoglio Curativo di '+u.name+' recupera '+sprout+' PS!');
   if(u.hp<=0)continue;
   if(u.enchantedTurns>0){
     if(u.enchantedFresh)u.enchantedFresh=false;
     else if(--u.enchantedTurns<=0){
       u.statuses=u.statuses.filter(z=>z!=='Incantato');
       log.push(u.name+' non è più incantato!');
     }
   }
   if(u.blindTurns>0){
     u.blindTurns--;if(!u.blindTurns)u.statuses=u.statuses.filter(z=>z!=='Accecato');
   }
   if(u.passive?.type==='bugs_chaos'){
     if(random()<.5){const stat=randomBuff(u,random);log.push(u.name+' aumenta '+stat+' del 15%!');}
     const enemies=activeEventFighters(x,team==='A'?'B':'A',s).filter(v=>v.hp>0);
     if(enemies.length){const target=enemies[Math.floor(random()*enemies.length)];
       if(immuneToStatDrops(target)||blockedEnemyPassive(target))log.push(target.name+' resiste al calo di statistiche!');
       else{const stat=randomDebuff(target,random);log.push(u.name+' abbassa '+stat+' di '+target.name+'!');}}
   }
  }
 }
 if(x.weather?.type==='snowstorm'&&x.weather.turns>0){
  for(const team of ['A','B']){
   for(const u of activeEventFighters(x,team,s)){
    const effect=snowstormOutcome(u,true);
    if(effect.damage){u.hp=Math.max(0,u.hp-effect.damage);log.push(u.name+' perde '+effect.damage+' PS per la neve!');}
    if(u.hp&&effect.heal){u.hp=Math.min(u.maxHp,u.hp+effect.heal);log.push(u.name+' recupera '+effect.heal+' PS dal freddo!');}
   const sprout=activateHealingSprout(u);
   if(sprout)log.push('Germoglio Curativo di '+u.name+' recupera '+sprout+' PS!');
   }
  }
  x.weather.turns--;if(x.weather.turns===0)x.weather=null;
 }
 for(const team of ['A','B'])for(const u of x.teams[team])endRefractionTurn(u);
 const a=x.teams.A.some(c=>c.hp>0),z=x.teams.B.some(c=>c.hp>0);
 if(!a||!z||x.turn>=300){
  x.finished=true;x.winner=a&&!z?'A':z&&!a?'B':
   x.teams.A.reduce((v,c)=>v+c.hp,0)>=x.teams.B.reduce((v,c)=>v+c.hp,0)?'A':'B';
  log.push('Vittoria lato '+x.winner);
 }else{x.side=oppo;x.turn++;}
 x.log=[...x.log,...log].slice(-60);return x;
}
export function simulateBots(b,s,bots){
 const all=new Set(bots.map(x=>x.id));if(![...b.owners.A,...b.owners.B].every(id=>all.has(id)))return b;
 let x=b;for(let i=0;i<301&&!x.finished;i++){const commands={};for(const uid of x.owners[x.side])commands[uid]=botActions(x,uid,s);x=eventTurn(x,commands,s)}
 return x;
}