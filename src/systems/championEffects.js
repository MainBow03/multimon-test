// Effetti condivisi dai nuovi Multimon; mantenuti separati per testare
// il comportamento anche senza una partita completa o Firebase.
export const SNOWSTORM_IMMUNE_TYPES = Object.freeze(['Ghiaccio','Roccia','Robot']);
export const SNOWSTORM_LENGTH = 5;
export const STATS_FOR_RANDOM_PASSIVE = Object.freeze(['atk','def','spd']);

export function isSnowImmune(character) {
  return (character?.types || []).some(type => SNOWSTORM_IMMUNE_TYPES.includes(type));
}
export function snowstormOutcome(character, active) {
  if (!active || !character || character.hp <= 0) return {damage:0,heal:0};
  const damage = isSnowImmune(character) ? 0 : Math.max(1,Math.floor(character.maxHp*0.02));
  const heal = character.passive?.type === 'cold_resistance'
    ? Math.max(1,Math.floor(character.maxHp*0.05)) : 0;
  return {damage,heal};
}
export function addEvasion(character) {
  character.evasionBonus=Math.min(0.4,(character.evasionBonus||0)+0.2);
  return character.evasionBonus;
}
export function incomingAccuracy(attacker, move, target) {
  const accuracy=move.accuracy===undefined?1:(move.accuracy>1?move.accuracy/100:move.accuracy);
  return Math.max(0,Math.min(1,accuracy * (attacker.acc||1) * (1-Math.min(.4,target?.evasionBonus||0))));
}
export function crystalShield(character) {
  character.crystalShieldHp=Math.max(1,Math.floor(character.maxHp*0.2));
  return character.crystalShieldHp;
}
export function beginRefraction(character) {
  character.refractionTurns=3;
  character.refractionBlockedThisTurn=false;
}
export function directHitAfterCrystalDefense(character,damage) {
  let remaining=Math.max(0,damage),absorbed=0,refracted=false;
  if(remaining>0&&character.refractionTurns>0&&!character.refractionBlockedThisTurn){
    remaining=Math.floor(remaining*.5);
    character.refractionBlockedThisTurn=true;
    refracted=true;
  }
  if(remaining>0&&character.crystalShieldHp>0){
    absorbed=Math.min(remaining,character.crystalShieldHp);
    character.crystalShieldHp-=absorbed;
    remaining-=absorbed;
  }
  return {damage:remaining,absorbed,refracted};
}
export function endRefractionTurn(character) {
  if (character.refractionTurns>0) character.refractionTurns--;
  character.refractionBlockedThisTurn=false;
}
export function randomStatKey(random=Math.random){
  return STATS_FOR_RANDOM_PASSIVE[Math.min(STATS_FOR_RANDOM_PASSIVE.length-1,
    Math.floor(random()*STATS_FOR_RANDOM_PASSIVE.length))];
}
export function randomBuff(character,random=Math.random){
  const key=randomStatKey(random);
  character[key]=Math.max(1,Math.floor((character[key]||1)*1.15));
  return key;
}
export function randomDebuff(character,random=Math.random){
  const key=randomStatKey(random);
  character[key]=Math.max(1,Math.floor((character[key]||1)*0.85));
  return key;
}
export function daffyCelebration(character) {
  if(!character||character.hp<=0||character.passive?.type!=='failed_star')return 0;
  const heal=Math.max(1,Math.floor(character.maxHp*0.2));
  character.hp=Math.min(character.maxHp,character.hp+heal);
  character.atk=Math.max(1,Math.floor(character.atk*1.1));
  return heal;
}
