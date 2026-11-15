import {ROGUE_RELICS} from './roguelikeEvents.js';
export const SOLO_PATH_CHOICES=Object.freeze([
 {id:'safe',name:'Sentiero Sicuro',desc:'Un solo nemico nei prossimi incontri normali, +15 monete e cura del 10% ai vivi.'},
 {id:'dangerous',name:'Sentiero Pericoloso',desc:'Almeno due nemici contemporanei, con ruoli tattici. Supera il primo scontro per ricevere una reliquia non posseduta oppure 35 monete.'}
]);
export const soloPathDecisionFloor=floor=>Number.isInteger(floor)&&floor>=2&&floor<=47&&floor%5===2;
export const needsSoloPathChoice=run=>!!run?.isStarted&&soloPathDecisionFloor(run.floor)&&
  run.soloPath?.startFloor!==run.floor;

export function chooseSoloPath(run,kind,rosterDb=[]){
 if(!needsSoloPathChoice(run)||!SOLO_PATH_CHOICES.some(x=>x.id===kind))return run;
 const next={...run,soloPath:{kind,startFloor:run.floor,endFloor:run.floor+2,
   claimed:false},lastRouteResult:null};
 if(kind==='safe'){
   next.coins=(Number(run.coins)||0)+15;
   next.rosterStats={...(run.rosterStats||{})};
   for(const id of run.roster||[]){
     const max=rosterDb.find(c=>c.id===id)?.maxHp;
     if(max&&next.rosterStats[id]>0)
       next.rosterStats[id]=Math.min(max,next.rosterStats[id]+Math.max(1,Math.floor(max*.10)));
   }
 }
 return next;
}
export function soloPathEnemyCount(count,run,isBoss=false){
 if(isBoss||!run?.soloPath||run.floor<run.soloPath.startFloor||
   run.floor>run.soloPath.endFloor)return count;
 return run.soloPath.kind==='safe'?1:Math.min(4,Math.max(2,count+1));
}
export function assignSoloTacticalRole(enemy,index,floor,run){
 const dangerous=run?.soloPath?.kind==='dangerous'&&
   floor>=run.soloPath.startFloor&&floor<=run.soloPath.endFloor;
 // Nei piani alti i ruoli tattici esistono anche sui percorsi normali;
 // sui pericolosi sono disponibili sin dalle prime battaglie.
 if(!enemy||(!dangerous&&floor<21))return enemy;
 const role=['guardian','hexer','finisher'][(index+(floor>=21?Math.floor(floor/5):0))%3];
 enemy.rogueTacticalRole=role;
 if(role==='guardian')enemy.rogueGuardCharges=1;
 return enemy;
}
export function rogueTacticalDamageFactor(attacker,enemyTeam){
 if(attacker?.rogueTacticalRole!=='finisher')return 1;
 const others=(enemyTeam||[]).filter(c=>c?.hp>0&&!c.isSummonOnly&&c!==attacker);
 return others.length===0?1.25:1;
}
export function mitigateRogueGuardian(target,dmg,direct=true){
 if(!direct||target?.rogueTacticalRole!=='guardian'||!(target.rogueGuardCharges>0)||!(dmg>0))
   return {damage:dmg,activated:false};
 target.rogueGuardCharges--;
 return {damage:Math.max(1,Math.floor(dmg*.80)),activated:true};
}
export function rogueHexerTriggers(attacker,target,random=Math.random){
 return attacker?.rogueTacticalRole==='hexer'&&target?.hp>0&&
   !(target.statuses||[]).some(s=>s.type==='Indebolito')&&random()<.20;
}
export function awardSoloPathVictory(run,completedFloor,random=Math.random){
 const path=run?.soloPath;
 if(!path||path.kind!=='dangerous'||path.claimed||path.startFloor!==completedFloor)return run;
 const possible=Object.keys(ROGUE_RELICS).filter(id=>!(run.relics||[]).includes(id));
 if(!possible.length)return {...run,coins:(run.coins||0)+35,
   soloPath:{...path,claimed:true},
   lastRouteResult:'🎁 Sentiero Pericoloso completato: +35 monete!'};
 const relic=possible[Math.min(possible.length-1,Math.floor(random()*possible.length))];
 return {...run,relics:[...(run.relics||[]),relic],
   soloPath:{...path,claimed:true},
   lastRouteResult:'🎁 Sentiero Pericoloso completato: reliquia '+ROGUE_RELICS[relic].name+'!'};
}
