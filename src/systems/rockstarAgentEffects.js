// Effetti originali di Ember McLain e Kitty (pure utilities).
// Sono condivisi tra battaglie classiche e Torneo del Multiverso.
export const ROCK_ENCHANT_DURATION=10;
export const STICKY_TRAP_DAMAGE_PERCENT=0.10;
export function ignoresShields(attacker,move){
  return !!move?.ignoreShields ||
    (attacker?.passive?.type==='ghost_rockstar' && move?.type==='Suono');
}
export function immuneToStatDrops(character){
  return character?.passive?.type==='undercover_agent';
}
export function powerForAccordo(enemyCount){
  return 60+20*(Math.min(4,Math.max(1,Math.floor(enemyCount||1)))-1);
}
export function isSlowed(character){
  if(!character)return false;
  return (Number.isFinite(character.baseSpd)&&character.spd<character.baseSpd) ||
    (character.statuses||[]).some(s=>['Elettrizzato','Rallentato','Rallentato II'].includes(typeof s==='string'?s:s?.type));
}
export function effectiveTaserPower(target){
  return isSlowed(target)?120:80;
}
export function incomingRockEnchantmentFactor(character){
  return (character?.statuses||[]).some(s=>(typeof s==='string'?s:s?.type)==='Incantato')?0.75:1;
}
export function stickyTrapEntryDamage(character) {
  return !character||character.hp<=0?0:Math.max(1,Math.floor((character.maxHp||1)*STICKY_TRAP_DAMAGE_PERCENT));
}
export function affectedOpponents(player,mode,activePlayers,getTournamentOpponents,settings={}){
  if(mode==='multipla')return ['p1','p2'].includes(player)?['p3','p4']:['p1','p2'];
  if(mode==='torneo')return getTournamentOpponents(player);
  if(mode==='juggernaut'||mode==='survival'){
    const boss=settings.juggernautPlayer||(mode==='survival'?'p2':'p1');
    return player===boss?activePlayers.filter(p=>p!==boss):[boss];
  }
  return activePlayers.filter(p=>p!==player);
}
export function addStickyTrap(fieldTraps,fieldSeen,enemyPlayers,field){
 for(const enemy of enemyPlayers){
   fieldTraps[enemy]=true;
   // Chi è già in campo all'atto di piazzamento non viene colpito.
   fieldSeen[enemy]=[...(field[enemy]||[])];
 }
}
export function trapEntries(fieldTraps,oldField,field){
 const entries=[];
 for(const player of Object.keys(field||{})){
   if(!fieldTraps[player])continue;
   const old=new Set(oldField[player]||[]);
   for(const idx of field[player]||[]){
     if(!old.has(idx))entries.push({player,idx});
   }
 }
 return entries;
}
