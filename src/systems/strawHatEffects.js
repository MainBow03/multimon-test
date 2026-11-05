import {isRainyWeather} from './rainstorm.js';

export const STRAW_HAT_NEGATIVE_STATUSES=new Set([
 'Avvelenato','Scottato','Elettrizzato','Congelato','Addormentato',
 'Confuso','Indebolito','Stordito','Accecato','Incantato',
 'Infatuato','Anima Distorta','Prigione Sotterranea'
]);

// Haki: i malus alle statistiche sono ridotti al 50% finché è attivo.
export function hakiStatDebuffMultiplier(char,multiplier){
 if(char?.id!=='luffy' || !(char.hakiGuardTurns>0) || multiplier>=1)
   return multiplier;
 return 1-(1-multiplier)*0.5;
}
export function shortenHakiDebuff(char,status){
 if(char?.id!=='luffy' || !(char.hakiGuardTurns>0) ||
    !status || !STRAW_HAT_NEGATIVE_STATUSES.has(status.type))return false;
 if(Number.isFinite(status.turns) && status.turns>1){
   status.turns=Math.max(1,Math.ceil(status.turns/2));
   return true;
 }
 return false;
}
export function beginHakiGuard(char,turns=3){
 if(char?.id!=='luffy'||char.hp<=0)return 0;
 char.hakiGuardTurns=Math.max(char.hakiGuardTurns||0,turns);
 char.hakiGuardFresh=true; // non consumare un turno subito dopo l'attivazione
 return char.hakiGuardTurns;
}
export function tickHakiGuard(char){
 if(!char || !char.hakiGuardTurns)return 0;
 if(char.hakiGuardFresh){char.hakiGuardFresh=false;return char.hakiGuardTurns;}
 char.hakiGuardTurns=Math.max(0,char.hakiGuardTurns-1);
 return char.hakiGuardTurns;
}

// Zoro: +10 punti % alla probabilità base di critico, e penetrazione
// difensiva del 10% per mosse fisiche. Non si applica ai danni speciali.
export const strawHatCritBonus=(attacker,move)=>
 (attacker?.passive?.type==='three_sword_style' ? 0.10 : 0)+
 (Number(move?.bonusCritChance)||0);
export const strawHatDefenseFactor=(attacker,move)=>
 attacker?.passive?.type==='three_sword_style' && !move?.special?0.90:1;

// Nami: ricompensa tattica sotto pioggia senza cambiare le statistiche.
export const namiClimateFactor=(attacker,move,weather)=>
 attacker?.passive?.type==='straw_hat_climate' && isRainyWeather(weather) &&
 ['Acqua','Aria'].includes(move?.type)?1.15:1;
export function applyNamiMirage(char,amount=0.15){
 if(char?.id!=='nami'||char.hp<=0)return 0;
 if(char.strawHatMirageUsed)return 0;
 char.strawHatMirageUsed=true;
 char.evasionBonus=Math.min(0.55,(Number(char.evasionBonus)||0)+amount);
 return amount;
}
export function applyGuardPoint(char,reduction=0.20){
 if(char?.id!=='chopper'||char.hp<=0)return false;
 char.strawHatGuardPoint=Math.max(0,Math.min(0.5,reduction));
 return true;
}
export function reduceGuardPointDamage(char,damage){
 if(char?.id!=='chopper' || !(char.strawHatGuardPoint>0)||damage<=0)
   return {damage,activated:false};
 const reduced=Math.max(1,Math.floor(damage*(1-char.strawHatGuardPoint)));
 char.strawHatGuardPoint=0;
 return {damage:reduced,activated:true};
}
export function clearZoroBlind(char){
 if(char?.id!=='zoro'||!Array.isArray(char.statuses))return false;
 const before=char.statuses.length;
 char.statuses=char.statuses.filter(s=>s.type!=='Accecato');
 return char.statuses.length<before;
}

// Chopper cura l'alleato sul campo con la % PS più bassa; stesso team
// anche nella battaglia Co-op (p1,p2,p3 contro il p4 controllato dalla CPU).
// Se tutti sono pieni ma hanno status, cura comunque uno di essi.
export function chopperEntryAid(teams,field,owner,gameMode,settings,percent=0.12){
 const jugg=settings?.juggernautPlayer||'p4';
 let allies=[owner];
 if(gameMode==='multipla'){
   allies=['p1','p2'].includes(owner)?['p1','p2']:['p3','p4'];
 }else if(gameMode==='juggernaut'){
   allies=owner===jugg?[owner]:Object.keys(field||{}).filter(p=>p!==jugg);
 }
 let best=null;
 for(const p of allies){
   for(const idx of field?.[p]||[]){
     const char=teams?.[p]?.[idx];
     if(!char||char.hp<=0||char.isSummonOnly||!Number.isFinite(char.maxHp)||char.maxHp<=0)continue;
     const needsHealing=char.hp<char.maxHp;
     const hasDebuff=(char.statuses||[]).some(s=>STRAW_HAT_NEGATIVE_STATUSES.has(s.type));
     if(!needsHealing&&!hasDebuff)continue;
     const score=char.hp/char.maxHp-(hasDebuff?0.0001:0);
     if(!best||score<best.score)best={p,idx,char,score};
   }
 }
 if(!best)return null;
 const char=best.char;
 const healed=Math.min(char.maxHp-char.hp,Math.max(1,Math.floor(char.maxHp*percent)));
 char.hp+=healed;
 const idx=(char.statuses||[]).findIndex(s=>STRAW_HAT_NEGATIVE_STATUSES.has(s.type));
 let removed=null;
 if(idx>=0)removed=char.statuses.splice(idx,1)[0].type;
 return {player:best.p,idx:best.idx,healed,removed,hp:char.hp};
}

// Ensure a newly deployed copy never carries "spent" passives from a
// previous battle; other systems reconstruct the battle copy per fight.
export function resetStrawHatBattleFlags(char){
 if(!char)return char;
 delete char.hakiGuardTurns;
 delete char.hakiGuardFresh;
 delete char.strawHatMirageUsed;
 delete char.strawHatGuardPoint;
 return char;
}
