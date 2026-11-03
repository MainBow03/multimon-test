// Meteo condiviso delle battaglie classiche: Tempesta di Juvia.
// Un'unica condizione meteo per campo, come la già esistente Tempesta di Neve.
export const RAINSTORM_TURNS=5;
export const RAINSTORM_WATER_BONUS=1.25;
export const RAINSTORM_FIRE_FACTOR=0.75;
const wateryWeather=new Set(['rainstorm','rain','storm','pioggia','pioggia_intensa']);

export function isRainyWeather(weather){
  return wateryWeather.has(weather?.type)&&(!Number.isFinite(weather.turns)||weather.turns>0);
}

export function tryStartRainstorm(move,attackSucceeded,random=Math.random){
  if(!attackSucceeded || !move?.rainstormChance)return false;
  return random()<move.rainstormChance;
}

export function weatherMoveFactor(move,weather){
  if(!isRainyWeather(weather))return 1;
  if(move?.type==='Acqua')return RAINSTORM_WATER_BONUS;
  if(move?.type==='Fuoco')return RAINSTORM_FIRE_FACTOR;
  return 1;
}

export function weatherEvasionBonus(character,weather){
  return character?.id==='juvia' && character?.passive?.type==='rain_evasion' &&
    isRainyWeather(weather) ? 0.20 : 0;
}

export function totalEvasionChance(character,weather,heldEvasion=0){
  const base=Math.max(0,Math.min(0.95,
    (Number(character?.evasionBonus)||0)+weatherEvasionBonus(character,weather)));
  const held=Math.max(0,Math.min(0.95,heldEvasion||0));
  return Math.min(0.95,1-(1-base)*(1-held));
}
