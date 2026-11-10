// Solo il boss Echomax da 4000 PS, non la versione giocabile.
// Il reset è un evento unico e sopravvive ai salvataggi perché la
// marcatura resta sul combattente nello stato autorevole della partita.
export const ECHO_RAID_HALF_HP_RATIO=0.5;
export const ECHO_RAID_MOVE_ACCURACY=1;

export function isEchoRaidBoss(char){
  return char?.id==='echomax' && char.isEchoRaidBoss===true;
}

export function restoreEchoRaidAccuracy(char){
  if(!isEchoRaidBoss(char)||!(Number(char.acc)<1))return false;
  char.acc=1;
  return true;
}

export function echoRaidMovesAtFullAccuracy(moves=[]){
  return moves.map(move=>move ? {
    ...move,accuracy:ECHO_RAID_MOVE_ACCURACY,
    ...(move.name==='Raggio dei Caduti'
      ?{desc:String(move.desc||'').replace(/Precisione 80%\.?/i,'Precisione 100%.')}
      :{})
  }:move);
}

const STATS=['atk','def','spd'];
const visibleStats=(char,player,index)=>({
  type:'echo_stat_reset',player,index,
  atk:char.atk,def:char.def,spd:char.spd,acc:char.acc,
  evasionBonus:char.evasionBonus||0
});

/**
 * Esegue unicamente il reset alla soglia 50% del boss.
 * - Echomax perde solo i suoi malus a attacco/difesa/velocità.
 * - La Resistenza perde solo i buff sopra il proprio valore base.
 * - Le cure e i KO non vengono modificati, né i debuff sui protagonisti.
 * Il checkpoint di una partita già iniziata sotto 50% attiva una sola volta
 * il reset al primo calcolo di turno, anche se non attraversa ora la soglia.
 */
export function triggerEchoRaidHalfReset({isEchoFinalBattle=false,boss,heroes=[],events=[],bossIndex=0}={}){
  if(!isEchoFinalBattle||!isEchoRaidBoss(boss)||boss.echoHalfResetDone||
     !(Number(boss.hp)>0)||!(Number(boss.maxHp)>0)||
     boss.hp>boss.maxHp*ECHO_RAID_HALF_HP_RATIO)return false;
  boss.echoHalfResetDone=true;
  const boostedBoss=[];
  for(const stat of STATS){
    const base=Number(boss['base'+stat[0].toUpperCase()+stat.slice(1)]);
    if(Number.isFinite(base)&&base>0 && Number(boss[stat])<base){
      boss[stat]=base;boostedBoss.push(stat);
    }
  }
  events.push({type:'text',text:'🌘 ECHOMAX AL 50% DEI PS! Il suo potere spezza i depotenziamenti e annulla i potenziamenti della Resistenza!'});
  if(boostedBoss.length){
    events.push({...visibleStats(boss,'p2',bossIndex),
      text:'🛡️ Echomax ripristina '+boostedBoss.join(', ')+' ai valori originali!'});
  }
  for(let index=0;index<heroes.length;index++){
    const hero=heroes[index];
    if(!hero || hero.isSummonOnly)continue;
    let changed=false;
    for(const stat of STATS){
      const base=Number(hero['base'+stat[0].toUpperCase()+stat.slice(1)]);
      if(Number.isFinite(base)&&base>0&&Number(hero[stat])>base){
        hero[stat]=base;changed=true;
      }
    }
    if(Number(hero.acc)>1){hero.acc=1;changed=true;}
    if(Number(hero.evasionBonus)>0){hero.evasionBonus=0;changed=true;}
    if(changed)events.push({...visibleStats(hero,'p1',index),
      text:'💫 I bonus alle statistiche di '+hero.name+' svaniscono!'});
  }
  return true;
}
