// Danno da veleno di fine turno. Il motore di battaglia può rimuovere
// tutti gli status durante applyDamage (KO, rinascita, purificazione
// di una passiva): non conservare mai indici dentro un array mutabile.
export function resolvePoisonEndTurn(character, applyDamage) {
  const poison=Array.isArray(character?.statuses)
    ? character.statuses.find(s=>s?.type==='Avvelenato') : undefined;
  if (!poison || !(character.hp > 0)) return {applied:false,damage:0,progressed:false};

  const turnValue=Number(poison.turns);
  const turnsActive=Number.isFinite(turnValue)&&turnValue>0 ? turnValue : 1;
  const damage=Math.max(5,Math.floor(character.maxHp*Math.min(0.15,0.05*turnsActive)));
  applyDamage(damage);

  // Il KO elimina lo status. Anche una passiva può cambiare l'array.
  // Un nuovo veleno dello stesso tipo NON eredita il conteggio cancellato.
  const stillActive=character.hp>0 &&
    Array.isArray(character.statuses) && character.statuses.includes(poison);
  if(stillActive)poison.turns=turnsActive+1;
  return {applied:true,damage,progressed:stillActive};
}
