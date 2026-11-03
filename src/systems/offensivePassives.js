// Bonus danni condizionati delle passive offensive.
// La velocità considerata è quella EFFETTIVA del combattimento, dopo i buff.
export const outgoingPassiveDamageFactor=(attacker,defender,move)=>{
  if(!attacker || !defender || !(move?.power>0))return 1;
  if(attacker.passive?.type==='expert_hunter' &&
      Number.isFinite(attacker.spd) && Number.isFinite(defender.spd) &&
      defender.spd < attacker.spd)
    return attacker.passive.damageBonus || 1.2;
  if(attacker.passive?.type==='ghostbuster' && defender.types?.includes('Spettro'))
    return attacker.passive.damageBonus || 1.25;
  return 1;
};
