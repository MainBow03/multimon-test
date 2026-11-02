// Potenziamenti lievi permanenti: indipendenti da PE/Padronanza e monete.
// Ciascuna statistica ha livello 1..10; il livello 1 dà +1 gratuitamente.
// Raggiungendo livello 10 ciascuna riceve +10, massimo +30 totali.
export const STRENGTH_MAX_LEVEL = 10;
export const STRENGTH_STATS = Object.freeze([
  {key:'atk',label:'Attacco',short:'ATK',icon:'⚔️',color:'#fb7185'},
  {key:'def',label:'Difesa',short:'DEF',icon:'🛡️',color:'#38bdf8'},
  {key:'spd',label:'Velocità',short:'VEL',icon:'⚡',color:'#fbbf24'}
]);
const level = value => Math.min(STRENGTH_MAX_LEVEL,Math.max(1,Math.floor(Number(value)||1)));
export const strengthLevel = (upgrades,id,stat) => level(upgrades?.[id]?.[stat]);
export const strengthUpgradeCost = currentLevel => level(currentLevel)>=STRENGTH_MAX_LEVEL?0:level(currentLevel)*2;
export function strengthTotalLevels(upgrades,id){
  return STRENGTH_STATS.reduce((n,stat)=>n+strengthLevel(upgrades,id,stat.key),0);
}
export function canTrainCharacter(character,profile){
  return !!character && !character.isCampaignMonster && !character.isSummonOnly &&
    !character.isSecretUnlock && !character.fusionOf &&
    (!character.price || (profile?.unlockedChars||[]).includes(character.id));
}
export function trainStrength(profile,character,stat){
  if(!STRENGTH_STATS.some(s=>s.key===stat)||!canTrainCharacter(character,profile))
    return {ok:false,reason:'Multimon non posseduto o statistica non valida.',profile};
  const points=Number(profile?.strengthPoints)||0;
  const current=strengthLevel(profile?.strengthUpgrades,character.id,stat);
  if(current>=STRENGTH_MAX_LEVEL)return {ok:false,reason:'Statistica già al livello 10.',profile};
  const cost=strengthUpgradeCost(current);
  if(points<cost)return {ok:false,reason:'Punti Forza insufficienti.',profile};
  const upgrades={...(profile.strengthUpgrades||{})};
  upgrades[character.id]={...(upgrades[character.id]||{}),[stat]:current+1};
  return {ok:true,cost,level:current+1,profile:{
    ...profile,strengthPoints:points-cost,strengthUpgrades:upgrades
  }};
}
// Usare una sola volta alla creazione del combattente. Le statistiche di
// catalogo non devono essere alterate; baseAtk/Def/Spd riflettono il boost.
export function applyStrengthToFighter(fighter,upgrades){
  if(!fighter || !fighter.id || fighter.strengthApplied)return fighter;
  const instance={...fighter},bonus={};
  for(const {key} of STRENGTH_STATS){
    const extra=strengthLevel(upgrades,instance.id,key);
    bonus[key]=extra;
    instance[key]=(Number(instance[key])||0)+extra;
    instance['base'+key[0].toUpperCase()+key.slice(1)]=instance[key];
  }
  instance.strengthApplied=true;
  instance.strengthBonus=bonus;
  return instance;
}
// Elenco visibile e prova: livello 1 = +1, livello 10 = +10.
export const strengthSummary = (character,upgrades)=>STRENGTH_STATS.map(({key,label})=>{
  const currentLevel=strengthLevel(upgrades,character.id,key);
  return {key,label,level:currentLevel,bonus:currentLevel,
    base:Number(character[key])||0,value:(Number(character[key])||0)+currentLevel,
    nextBonus:Math.min(currentLevel+1,STRENGTH_MAX_LEVEL),
    nextValue:(Number(character[key])||0)+Math.min(currentLevel+1,STRENGTH_MAX_LEVEL),
    cost:strengthUpgradeCost(currentLevel)};
});
