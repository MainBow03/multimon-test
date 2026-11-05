// Effetti di campo riproducibili su tutti i client, inclusi switch e nuovi alleati.
// Tailwind è un vento di squadra indipendente dal meteo globale.
export const TAILWIND_TURNS=5;
export const TAILWIND_SPEED_FACTOR=1.30;
export const LUSH_GRASS_TURNS=5;
export const LUSH_GRASS_HEAL_PERCENT=0.05;
export const LUSH_GRASS_POWER_FACTOR=1.20;

export const isLushGrass=weather=>weather?.type==='lush_grass' && weather.turns>0;
export const lushGrassDamageFactor=(move,weather)=>
  isLushGrass(weather)&&move?.type==='Erba'?LUSH_GRASS_POWER_FACTOR:1;

export function lushGrassHeal(character,weather){
  if(!isLushGrass(weather)||!character||character.hp<=0||
     !character.types?.includes('Erba'))return 0;
  const before=character.hp;
  character.hp=Math.min(character.maxHp,character.hp+
    Math.max(1,Math.floor(character.maxHp*LUSH_GRASS_HEAL_PERCENT)));
  return character.hp-before;
}

// Rispetta le alleanze del motore di lotta. In Juggernaut-Co-op tutti i
// partecipanti p1/p2/p3 ricevono Tailwind anche se entrano dopo.
export function tailwindAllies(owner,gameMode,settings,activePlayers){
  const players=(activePlayers||[]).filter(Boolean);
  if(gameMode==='multipla')
    return players.filter(p=>(['p1','p2'].includes(p))===(['p1','p2'].includes(owner)));
  if(gameMode==='juggernaut'||gameMode==='survival'){
    const boss=settings?.juggernautPlayer||(gameMode==='survival'?'p2':'p1');
    return owner===boss?[owner]:players.filter(p=>p!==boss);
  }
  return [owner];
}
export const tailwindSpeedFactor=(tailwind,owner)=>
  (tailwind?.[owner]>0?TAILWIND_SPEED_FACTOR:1);

export function startTailwind(state,owner,gameMode,settings,activePlayers){
  const next={...(state||{})};
  for(const p of tailwindAllies(owner,gameMode,settings,activePlayers))
    next[p]=TAILWIND_TURNS;
  return next;
}
export function advanceTailwind(state,activatedOwners=new Set()){
  const next={};
  for(const [p,turns] of Object.entries(state||{})){
    const remaining=activatedOwners.has(p)?turns:Math.max(0,(Number(turns)||0)-1);
    if(remaining>0)next[p]=remaining;
  }
  return next;
}
