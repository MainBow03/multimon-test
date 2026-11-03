// Logica condivisa tra battaglie classiche e Torneo del Multiverso.
// Una gemma o un oggetto da lotta si consuma SOLO dentro una partita,
// non dentro il profilo permanente dello shop.
export const NEGATIVE_STATUS_TYPES=Object.freeze([
 'Avvelenato','Scottato','Elettrizzato','Congelato','Addormentato',
 'Confuso','Indebolito','Stordito','Accecato','Incantato',
 'Anima Distorta','Infatuato','Ricarica','Magnetico'
]);
const negative=new Set(NEGATIVE_STATUS_TYPES);
export const statusName=status=>typeof status==='string'?status:status?.type;
export const isNegativeStatus=status=>negative.has(statusName(status));
export const hasAntiMagicShield=character=>character?.heldItem==='scudo_antimagia';
export const blockedEnemyPassive=(character)=>hasAntiMagicShield(character);
export function activateHealingSprout(character){
 if(!character||character.heldItem!=='germoglio_curativo'||character.healingSproutUsed||
    !(character.hp>0)||!(character.hp<=character.maxHp*0.5))return 0;
 character.healingSproutUsed=true;
 const amount=Math.max(1,Math.floor(character.maxHp*0.25));
 const healed=Math.min(character.maxHp-character.hp,amount);
 character.hp+=healed;
 return healed;
}
export function activateNeutralizingSpray(character){
 if(!character||character.heldItem!=='spray_neutralizzante'||
    character.neutralizingSprayUsed||!Array.isArray(character.statuses))return [];
 const cured=character.statuses.filter(isNegativeStatus).map(statusName);
 if(!cured.length)return [];
 character.neutralizingSprayUsed=true;
 character.statuses=character.statuses.filter(status=>!isNegativeStatus(status));
 return cured;
}
export const isPhysicalMove=move=>!!move&&move.power>0&&move.special!==true;
export function activateCupidArrow(attacker,move,target,random=Math.random,hit=true,asString=false){
 if(!hit||!attacker||attacker.heldItem!=='freccia_cupido'||
    !isPhysicalMove(move)||!target||target.hp<=0||target.passive?.immuneToNegativeStatuses||
    (target.statuses||[]).some(s=>statusName(s)==='Infatuato')||random()>=0.10)return false;
 target.statuses||=[];
 target.statuses.push(asString||typeof target.statuses[0]==='string'?'Infatuato':{type:'Infatuato',turns:4});
 return true;
}
export function rapidTransmutationPriority(character,move){
 return character?.passive?.type==='rapid_transmutation'&&character.rapidTransmutationReady&&
    ['Robot','Terra'].includes(move?.type)?1:0;
}
export function markRapidTransmutationEntry(character,enteredDuringTurn=false){
 if(character?.passive?.type!=='rapid_transmutation')return false;
 character.rapidTransmutationReady=true;
 character.rapidTransmutationFresh=enteredDuringTurn;
 return true;
}
export function endRapidTransmutationTurn(character){
 if(character?.passive?.type==='rapid_transmutation'){
  if(character.rapidTransmutationFresh)character.rapidTransmutationFresh=false;
  else character.rapidTransmutationReady=false;
 }
}
export const immuneToCritical=character=>!!character?.passive?.criticalImmunity||
  character?.passive?.type==='critical_immunity';
export const hannibalCanDebuff=(attacker,target,random=Math.random)=>
 !!attacker&&attacker.passive?.type==='psychological_manipulation'&&target?.hp>0&&
 !blockedEnemyPassive(target)&&target.passive?.type!=='undercover_agent'&&random()<0.20;

// Barile Pimpante: esclusivamente colpi di attacco diretto sopravvissuti.
// Le mosse multicolpo contano ogni singolo impatto, ma non gli scudi assorbiti,
// il veleno, il meteo, i contraccolpi, né i colpi che mandano KO.
export function survivedBarrelHits(character,hits=1){
 if(!character||character.heldItem!=='barile_pimpante'||character.barrelBroken||
    character.hp<=0||!Number.isFinite(hits)||hits<=0)return false;
 character.barrelSurvivedHits=Math.min(4,(character.barrelSurvivedHits||0)+Math.floor(hits));
 if(character.barrelSurvivedHits<4)return false;
 character.barrelBroken=true;
 return true;
}
