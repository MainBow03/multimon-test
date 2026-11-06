import {blockedEnemyPassive,isPhysicalMove} from './newHeldAndPassiveEffects.js';

export const HEAT_CHARGE_CHANCE=0.50;
export const MAX_HEAT_CHARGES=2;
export const HEAT_BURST_FACTOR=1.25;
export const MAGMA_BURN_CHANCE=0.25;

export function addHeatCharge(char,random=Math.random){
  if(char?.id!=='flameprincess'||char.hp<=0||
     (Number(char.heatCharges)||0)>=MAX_HEAT_CHARGES)return false;
  if(random()>=HEAT_CHARGE_CHANCE)return false;
  char.heatCharges=(Number(char.heatCharges)||0)+1;
  return true;
}
export function consumeHeatBurst(char,move){
  if(char?.id!=='flameprincess'||!move?.heatFinisher||move.power<=0||
     (Number(char.heatCharges)||0)<MAX_HEAT_CHARGES)return false;
  char.heatCharges-=MAX_HEAT_CHARGES;
  return true;
}
export const flameMoveDamageFactor=(attacker,move,isHeatBurst)=>
  attacker?.id==='flameprincess'&&move?.heatFinisher&&isHeatBurst?HEAT_BURST_FACTOR:1;

export function tryMagmaHeartBurn(defender,attacker,move,random=Math.random){
  if(defender?.passive?.type!=='magma_heart'||!attacker||attacker===defender||
     attacker.hp<=0||!isPhysicalMove(move)||attacker.passive?.immuneToNegativeStatuses||
     blockedEnemyPassive(attacker)||attacker.statuses?.some(s=>s.type==='Scottato'||s==='Scottato')||
     random()>=MAGMA_BURN_CHANCE)return false;
  attacker.statuses ||= [];
  attacker.statuses.push({type:'Scottato',turns:3});
  return true;
}

/**
 * Osserva ogni aumento REALE attraverso applyBattleStatModifier, senza
 * modificare altri campioni. Copia il PRIMO personaggio potenziato sul campo,
 * alleato o avversario, e gli incrementi dei diversi attributi nella STESSA
 * azione; una sola attivazione totale per ciascuna Ametista.
 *
 * Il callback non viene serializzato su Firestore. Solo gli aumenti alle
 * statistiche e il flag gemImperfectUsed vivono nello stato di battaglia.
 */
export function createImperfectGemObserver(teams,field,events,modify){
  let action=0;
  const firstByGem=new WeakMap();
  let mirroring=false;
  const activeCharacters=()=>Object.entries(field||{}).flatMap(([p,slots])=>
    (slots||[]).map(idx=>teams?.[p]?.[idx]).filter(c=>c?.hp>0));
  return {
    beginAction(){action++},
    onStatIncrease(source,stat,before,after,base){
      if(mirroring||!source||source.hp<=0||source.id==='ametista'||after<=before||
         !Number.isFinite(base)||base<=0)return;
      const active=activeCharacters();
      if(!active.includes(source))return;
      const growth=Math.max(0,(after-before)/base);
      if(growth<=0)return;
      for(const gem of active){
        if(gem===source||gem.id!=='ametista'||gem.passive?.type!=='gem_imperfect_copy')
          continue;
        let first=firstByGem.get(gem);
        if(!gem.gemImperfectUsed){
          gem.gemImperfectUsed=true;
          first={source,action};
          firstByGem.set(gem,first);
          events.push({type:'text',
            text:'💜 '+gem.name+' attiva Gemma Imperfetta! Replica il primo potenziamento di '+source.name+'!',
            isPassive:true,passiveChar:gem.name,passiveName:gem.passive.name});
        }else if(!first||first.source!==source||first.action!==action)continue;
        const old=gem[stat];
        try {
          mirroring=true;
          modify(gem,stat,1+growth);
        } finally {mirroring=false}
        if(gem[stat]>old){
          const labels={atk:'Attacco',def:'Difesa',spd:'Velocità',
            spAtk:'Attacco Speciale',spDef:'Difesa Speciale'};
          events.push({type:'text',text:'💎 '+gem.name+' copia +'+
            Math.round(growth*100)+'% '+(labels[stat]||stat)+' da '+source.name+'!',
            isPassive:true,passiveChar:gem.name,passiveName:gem.passive.name});
        }
      }
    }
  };
}
