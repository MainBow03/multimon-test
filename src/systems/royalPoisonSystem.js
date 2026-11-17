// Meccaniche dei nuovi personaggi: pure, deterministiche a parità di roll,
// testabili senza UI/Firestore. Lo stato viene salvato sulle copie dei fighter.
export const ROYAL_NEGATIVE_STATUSES=new Set([
 'Scottato','Avvelenato','Elettrizzato','Congelato','Addormentato',
 'Infatuato','Confuso','Indebolito','Stordito','Accecato','Assiderato',
 'Marciume','Anima Distorta','Incantato'
]);
export const ROYAL_YZMA_STATUSES=[
 'Scottato','Congelato','Avvelenato','Elettrizzato','Addormentato','Infatuato'
];
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
export function isRoyalNegativeStatus(type){return ROYAL_NEGATIVE_STATUSES.has(type);}
export function royalStatusSnapshot(target){
 return new Set((target?.statuses||[]).filter(s=>isRoyalNegativeStatus(s?.type)).map(s=>s.type));
}
export function royalNewNegativeStatuses(target,before){
 return (target?.statuses||[]).filter(s=>isRoyalNegativeStatus(s?.type)&&!before?.has(s.type)).map(s=>s.type);
}
export function royalStatus(target,type,opts={}){
 if(!target||target.hp<=0||!isRoyalNegativeStatus(type)||
    target.passive?.immuneToNegativeStatuses||opts.blocked)return false;
 target.statuses??=[];
 const previous=target.statuses.find(s=>s.type===type);
 if(previous)return false; // No refresh infinito / nessun doppio Marciume.
 const turns=opts.turns??(type==='Marciume'?4:3);
 target.statuses.push({type,turns,...(type==='Marciume'?{rotProgress:0,justApplied:true}:{}),
   ...(type==='Addormentato'?{turns:2}:{})});
 return true;
}
export function royalCursedFlames(attacker,target,random=Math.random,blocked=false){
 if(attacker?.passive?.type!=='cursed_flames')return null;
 const roll=random();
 const type=roll<.15?'Scottato':roll<.3?'Avvelenato':null;
 return type&&royalStatus(target,type,{turns:3,blocked})?type:null;
}
export function royalWolfVenom(attacker,target,move,random=Math.random,blocked=false){
 if(attacker?.passive?.type!=='wolf_venom'||move?.type!=='Lotta'||
   !(move?.power>0)||random()>=.35)return false;
 return royalStatus(target,'Avvelenato',{turns:3,blocked});
}
export function royalPotionCanTarget(attacker,player,targetPlayer,targetIdx,isEnemy){
 return !isEnemy||!(attacker?.royalPotionVictims||[]).includes(targetPlayer+':'+targetIdx);
}
export function royalPotionApply(attacker,target,targetPlayer,targetIdx,random=Math.random,blocked=false){
 const token=targetPlayer+':'+targetIdx;
 if(!royalPotionCanTarget(attacker,null,targetPlayer,targetIdx,true))return null;
 const status=ROYAL_YZMA_STATUSES[Math.floor(clamp(random(),0,.999999)*ROYAL_YZMA_STATUSES.length)];
 if(!royalStatus(target,status,{blocked,turns:status==='Infatuato'?4:status==='Congelato'?2:3}))return null;
 attacker.royalPotionVictims??=[];
 attacker.royalPotionVictims.push(token);
 return status;
}
export function royalStatusDamageBonus(attacker,defender,move){
 if(!attacker||!defender||!move)return 1;
 let factor=1;
 if(move.royalConditionBonus&&defender.statuses?.some(s=>['Scottato','Avvelenato'].includes(s.type)))
   factor*=1+move.royalConditionBonus;
 if(move.royalDebuffBonus&&['atk','def','spd','spAtk','spDef'].some(k=>
    Number.isFinite(defender[k])&&Number.isFinite(defender['base'+k.charAt(0).toUpperCase()+k.slice(1)])&&
    defender[k]<defender['base'+k.charAt(0).toUpperCase()+k.slice(1)]))
   factor*=1+move.royalDebuffBonus;
 return factor;
}
export function royalEffectiveMove(move,target){
 if(!move?.royalPoisonedPower||!target?.statuses?.some(s=>s.type==='Avvelenato'))return move;
 return {...move,power:move.royalPoisonedPower};
}
export function royalRotHealingAmount(target,rawHeal){
 const amount=Math.max(0,Math.floor(Number(rawHeal)||0));
 return target?.statuses?.some(s=>s?.type==='Marciume')?Math.floor(amount*.5):amount;
}
export function royalHeal(target,rawHeal){
 if(!target||target.hp<=0)return 0;
 const before=target.hp;
 const allowed=royalRotHealingAmount(target,rawHeal);
 target.hp=Math.min(target.maxHp,target.hp+allowed);
 return target.hp-before;
}
export function royalApplyRot(target,blocked=false){
 return royalStatus(target,'Marciume',{turns:4,blocked});
}
export function royalRotTick(target){
 if(!target||target.hp<=0)return {damage:0,expired:false,started:false};
 const status=target.statuses?.find(s=>s.type==='Marciume');
 if(!status)return {damage:0,expired:false,started:false};
 if(status.justApplied){delete status.justApplied;return {damage:0,expired:false,started:true};}
 status.rotProgress=clamp((status.rotProgress||0)+1,1,4);
 const ratio=[.06,.09,.12,.15][status.rotProgress-1];
 const damage=Math.max(1,Math.floor(target.maxHp*ratio));
 status.turns=4-status.rotProgress;
 if(status.turns<=0)target.statuses=target.statuses.filter(s=>s!==status);
 return {damage,expired:status.turns<=0,started:false};
}
export function royalMedusaAgility(fighter){
 if(fighter?.passive?.type!=='medusa_agility'||fighter.hp<=0)return false;
 const old=Number(fighter.spd)||0;
 const base=Math.max(1,Number(fighter.baseSpd)||old);
 fighter.spd=Math.min(Math.floor(base*3),Math.max(old+1,Math.round(old*1.1)));
 return fighter.spd>old;
}
export function royalGrantPriority(target){
 if(!target||target.hp<=0)return false;
 target.royalPriorityBonus=Math.max(1,target.royalPriorityBonus||0);
 return true;
}
export function royalConsumePriority(target,action){
 if(!target||action?.type!=='attack'||!target.royalPriorityBonus)return 0;
 const bonus=target.royalPriorityBonus;target.royalPriorityBonus=0;return bonus;
}
export function royalMedusaCanSummon(owner,side,field,ownerIdx){
 if(owner?.id!=='remedusa'||owner.hp<=0)return false;
 return !(field||[]).some(i=>side?.[i]?.id==='medusaservitore'&&side[i].hp>0&&
   side[i].medusaKingIndex===ownerIdx);
}
export function royalBuildMedusaSummon(base,ownerIdx){
 if(!base||base.id!=='medusaservitore')return null;
 const summon=structuredClone(base);
 summon.statuses=[];summon.consecutiveProtect=0;summon.revealed=true;
 summon.medusaKingIndex=ownerIdx;
 summon.baseAtk=summon.atk;summon.baseDef=summon.def;
 summon.baseSpd=summon.spd;summon.baseSpAtk=summon.spAtk;summon.baseSpDef=summon.spDef;
 for(const move of summon.moves||[])if(move.maxUses!==undefined)move.remainingUses=move.maxUses;
 return summon;
}
export function royalMistTargets(allies,enemies,blocked=()=>false){
 const changed={allies:[],enemies:[]};
 for(const target of allies){
  if(target?.hp>0){
   target.acc=clamp((Number(target.acc)||1)*1.1,.1,2);
   changed.allies.push(target);
  }
 }
 for(const target of enemies){
  if(target?.hp>0&&!blocked(target)){
   target.acc=clamp((Number(target.acc)||1)*.9,.1,2);
   changed.enemies.push(target);
  }
 }
 return changed;
}
