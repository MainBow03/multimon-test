import {ECHO_FINAL_SOUL_IDS} from './echoFinalSouls.js';

// Meccaniche aggiuntive ESCLUSIVE di Echomax nella forma raid della campagna III.
export const ECHO_RECALL_HP_RATIO=0.35;
export const ECHO_PULSE_INTERVAL=5;
export const ECHO_PULSE_MAX_HP_RATIO=0.40;

const eligibleRaidBoss=(boss,isEchoFinalBattle,stage)=>
  !!isEchoFinalBattle&&stage==='raid'&&boss?.id==='echomax'&&
  boss.isEchoRaidBoss===true&&Number(boss.hp)>0&&Number(boss.maxHp)>0;

const fullMoves=moves=>(moves||[]).filter(Boolean).map(move=>({
  ...structuredClone(move),
  remainingUses:move.maxUses===undefined?null:move.maxUses
}));

// Traccia soltanto i KO delle tre anime ORIGINALI. Il ritorno di una
// di loro al 35% non riavvolge lo sblocco del Cataclisma.
export function recordEchoOriginalSoulDefeat(boss,soul,events=[]){
 if(!boss?.isEchoRaidBoss || boss.id!=='echomax' ||
    !soul?.isEchoSoulGuardian || soul.isEchoSoulRecalledProjection ||
    !ECHO_FINAL_SOUL_IDS.includes(soul.id) || Number(soul.hp)>0) return false;
 const defeated=new Set((boss.echoOriginalSoulsDefeated||[])
   .filter(id=>ECHO_FINAL_SOUL_IDS.includes(id)));
 if(defeated.has(soul.id))return false;
 defeated.add(soul.id);
 boss.echoOriginalSoulsDefeated=[...defeated];
 if(defeated.size===ECHO_FINAL_SOUL_IDS.length){
   events.push({type:'text',text:'🌑 LE TRE ANIME ORIGINALI SONO CADUTE! Echomax libera il Cataclisma delle Anime: da ora può colpire tutto il team ogni 5 turni!'});
 }
 return true;
}

// Retrocompatibilità: dopo un checkpoint ripristina gli eventuali KO
// originali già presenti, senza contare proiezioni né cloni.
export function syncEchoOriginalSoulDefeats(enemies=[],events=[]){
 const boss=enemies.find(char=>char?.id==='echomax'&&char.isEchoRaidBoss);
 if(!boss)return false;
 for(const id of ECHO_FINAL_SOUL_IDS){
   const original=enemies.find(char=>char?.id===id&&char.isEchoSoulGuardian&&
     !char.isEchoSoulRecalledProjection);
   if(original && Number(original.hp)<=0)
     recordEchoOriginalSoulDefeat(boss,original,events);
 }
 return ECHO_FINAL_SOUL_IDS.every(id=>
   (boss.echoOriginalSoulsDefeated||[]).includes(id));
}

// Ritorna UNA sola anima scelta in modo uniforme fra Goku, Naruto e Luffy.
// Se è stata sconfitta, viene rianimata (eccezione allo stop permanente).
// Se combatte già, Echomax proietta una sua seconda eco sul campo.
export function triggerEchoSoulRecall({
 isEchoFinalBattle=false,stage='raid',teams,field,events=[],
 fieldSize=6,random=Math.random
}={}){
 const enemies=teams?.p2,active=field?.p2;
 if(!Array.isArray(enemies)||!Array.isArray(active))return null;
 const boss=enemies.find(c=>c?.id==='echomax'&&c.isEchoRaidBoss===true);
 if(!eligibleRaidBoss(boss,isEchoFinalBattle,stage) ||
    boss.echo35SoulRecallDone || boss.hp>boss.maxHp*ECHO_RECALL_HP_RATIO)
   return null;

 const guardians=ECHO_FINAL_SOUL_IDS
   .map(id=>({id,index:enemies.findIndex(c=>c?.id===id&&c.isEchoSoulGuardian===true)}))
   .filter(entry=>entry.index>=0);
 if(!guardians.length)return null;

 // Prima consideriamo le anime già KO, poi quelle fuori campo.
 // Se sono tutte già schierate, crea una proiezione supplementare.
 const fallen=guardians.filter(entry=>Number(enemies[entry.index].hp)<=0);
 const reserves=guardians.filter(entry=>!active.includes(entry.index));
 const candidates=fallen.length?fallen:reserves.length?reserves:guardians;
 const sampled=Number(random());
 const choice=candidates[Math.min(candidates.length-1,Math.max(0,Math.floor(
   (Number.isFinite(sampled)?sampled:0)*candidates.length
 )))];
 const soul=enemies[choice.index];
 const makeProjection=Number(soul.hp)>0&&active.includes(choice.index);
 const size=Math.max(1,Math.floor(Number(fieldSize)||6));

 // Prima liberiamo un posto da eventuali copie temporanee della Legione.
 // Se il campo resta pieno, mettiamo in riserva l'ultimo alleato non-boss.
 if(active.length>=size){
   let slot=active.findIndex(index=>enemies[index]?.isEchoCopy);
   if(slot<0){
     for(let i=active.length-1;i>=0;i--){
       if(enemies[active[i]]?.id!=='echomax' && active[i]!==choice.index){
         slot=i;break;
       }
     }
   }
   if(slot<0 && makeProjection){
     for(let i=active.length-1;i>=0;i--){
       if(enemies[active[i]]?.id!=='echomax'){slot=i;break;}
     }
   }
   if(slot<0)return null;
   const benched=active.splice(slot,1)[0];
   const fighter=enemies[benched];
   events.push({type:'remove',player:'p2',pos:slot});
   events.push({type:'text',text:'🌑 Echomax ritira '+fighter.name+
     ' dal campo per fare spazio al richiamo dell\'anima!'});
   if(fighter.isEchoCopy){
     fighter.hp=0;fighter.echoFaintProcessed=true;
   }
 }

 boss.echo35SoulRecallDone=true;
 events.push({type:'text',text:'🔮 ECHOMAX AL 35% DEI PS! «La tua libertà non mi interessa! TORNA A COMBATTERE PER ME!»'});

 let resultIdx=choice.index;
 if(makeProjection){
   const projection={
     ...structuredClone(soul),
     name:'Eco Richiamata di '+soul.name.replace(/^Anima di /,''),
     hp:soul.maxHp,maxHp:soul.maxHp,
     atk:soul.baseAtk||soul.atk,def:soul.baseDef||soul.def,
     spd:soul.baseSpd||soul.spd,
     statuses:[],consecutiveProtect:0,echoFaintProcessed:false,
     isEchoSoulGuardian:true,isEchoSoulRecalledProjection:true,
     echoSoulPermanentDefeat:true,
     moves:fullMoves(soul.moves)
   };
   resultIdx=enemies.push(projection)-1;
   active.push(resultIdx);
   events.push({type:'summon',player:'p2',fieldIdx:resultIdx,
     newChar:structuredClone(projection),putOnField:true,
     text:'💠 '+projection.name+' appare per combattere accanto a Echomax!'});
 } else {
   if(Number(soul.hp)<=0){
     soul.hp=soul.maxHp;
     soul.atk=soul.baseAtk||soul.atk;
     soul.def=soul.baseDef||soul.def;
     soul.spd=soul.baseSpd||soul.spd;
     soul.statuses=[];
     soul.consecutiveProtect=0;
     soul.echoFaintProcessed=false;
     soul.moves=fullMoves(soul.moves);
     // Il blocco alle rianimazioni comuni resta, ma il richiamo scriptato
     // è già stato applicato manualmente e non può ripetersi.
     events.push({type:'damage',targetPlayer:'p2',targetIdx:choice.index,
       newHp:soul.hp,text:'✨ '+soul.name+' torna al 100% dei PS!'});
     events.push({type:'status_update',targetPlayer:'p2',targetIdx:choice.index,
       statuses:[]});
   }
   if(!active.includes(choice.index)){
     active.push(choice.index);
     events.push({type:'revive_to_field',player:'p2',targetIdx:choice.index});
   }
   events.push({type:'text',text:'💠 '+soul.name+' viene richiamata in battaglia accanto a Echomax!'});
 }
 return {id:choice.id,index:resultIdx,projected:makeProjection};
}

export function shouldTriggerEchoRaidPulse({
 isEchoFinalBattle=false,stage='raid',boss,turnNumber
}={}){
 const turn=Math.floor(Number(turnNumber));
 return eligibleRaidBoss(boss,isEchoFinalBattle,stage) &&
   // Nessuna onda prima che Goku, Naruto e Luffy ORIGINALI siano tutti KO.
   ECHO_FINAL_SOUL_IDS.every(id=>(boss.echoOriginalSoulsDefeated||[]).includes(id)) &&
   Number.isFinite(turn)&&turn>0&&turn%ECHO_PULSE_INTERVAL===0 &&
   boss.echoRaidLastPulseTurn!==turn;
}

// Danno fisso calcolato sui PS MASSIMI del bersaglio, mai sui PS rimasti.
export function echoRaidPulseDamage(maxHp){
 const hp=Number(maxHp);
 return Number.isFinite(hp)&&hp>0?Math.max(1,Math.round(hp*ECHO_PULSE_MAX_HP_RATIO)):0;
}
