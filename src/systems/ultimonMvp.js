// Le statistiche Ultimon sono cumulative per slot del roster originale.
// Gli indici del report di battaglia, invece, si riferiscono soltanto allo
// schieramento del singolo duello: la mappatura selected è indispensabile.
const safeCount=value=>Math.max(0,Math.trunc(Number(value)||0));
export const ULTIMON_FIGHTER_METRICS=Object.freeze([
 'damageDealt','damageTaken','healing','kos',
 'shieldsBroken','passiveActivations','turnsOnField','battles'
]);

export function newUltimonFighterStats(fighter,index){
 return {
  index,id:String(fighter?.id||''),name:String(fighter?.name||'Multimon'),
  img:String(fighter?.img||''),
  damageDealt:0,damageTaken:0,healing:0,kos:0,
  shieldsBroken:0,passiveActivations:0,turnsOnField:0,battles:0
 };
}

export function initializeUltimonFighterStats(rosters){
 return Object.fromEntries(Object.entries(rosters||{}).map(([role,roster])=>[
  role,(roster||[]).map((fighter,index)=>newUltimonFighterStats(fighter,index))
 ]));
}

// Il report della lotta viene consolidato una sola volta nel verdetto.
// Ritorna un nuovo oggetto, non modifica i dati di Firestore o del report.
export function mergeUltimonDuelFighterStats(previous,rosters,selected,report){
 const merged=initializeUltimonFighterStats(rosters);
 for(const [role,roster] of Object.entries(rosters||{})){
  for(let index=0;index<(roster||[]).length;index++){
   const old=previous?.[role]?.[index];
   if(!old)continue;
   const dest=merged[role][index];
   for(const key of ULTIMON_FIGHTER_METRICS)
    dest[key]=safeCount(old[key]);
  }
 }
 for(const [role,indices] of Object.entries(selected||{})){
  if(!Array.isArray(indices)||!merged[role])continue;
  const visited=new Set();
  indices.forEach((rosterIndex,duelIndex)=>{
   if(!Number.isInteger(rosterIndex)||visited.has(rosterIndex))return;
   visited.add(rosterIndex);
   const stat=merged[role]?.[rosterIndex];
   if(!stat)return;
   // Il personaggio ha partecipato anche se il report è privo di eventi
   // per lui (es.: KO nel primo turno senza riuscire ad agire).
   stat.battles+=1;
   const entry=report?.entries?.[role+':'+duelIndex];
   if(!entry || (entry.id && stat.id && entry.id!==stat.id))return;
   for(const key of ULTIMON_FIGHTER_METRICS){
    if(key==='battles')continue;
    stat[key]+=safeCount(entry[key]);
   }
  });
 }
 return merged;
}

// Premia soprattutto i KO e l'impatto reale, ma riconosce anche il ruolo
// di supporto/tank. L'indice del roster risolve i pareggi in modo stabile.
export function scoreUltimonFighter(stat){
 if(!stat)return 0;
 return safeCount(stat.kos)*125 + safeCount(stat.damageDealt)
   +safeCount(stat.healing)*0.8 + safeCount(stat.damageTaken)*0.2
   +safeCount(stat.shieldsBroken)*65 +safeCount(stat.passiveActivations)*10
   +safeCount(stat.turnsOnField)*3 +safeCount(stat.battles)*5;
}
export function ultimonTeamMvp(room,role){
 const roster=room?.ultimon?.rosters?.[role]||[];
 const stats=room?.ultimon?.fighterStats?.[role]||[];
 const candidates=roster.map((fighter,index)=>{
  const entry=stats[index];
  if(!entry||!safeCount(entry.battles))return null;
  const values=Object.fromEntries(ULTIMON_FIGHTER_METRICS.map(key=>[key,safeCount(entry[key])]));
  return {
   ...newUltimonFighterStats(fighter,index),...values,
   score:scoreUltimonFighter(entry)
  };
 }).filter(Boolean);
 candidates.sort((a,b)=>b.score-a.score||b.kos-a.kos||b.damageDealt-a.damageDealt||
  b.healing-a.healing||a.index-b.index);
 return candidates[0]||null;
}
