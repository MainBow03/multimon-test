// Morso Vampirico: strumento da tenere, permanente nello shop. Ricompensa
// soltanto danni REALMENTE sottratti ai PS avversari da mosse offensive.
// Non si attiva su scudi, riflessi, meteo, veleno o autosacrificio.
export const VAMPIRIC_BITE_RATE=0.10;
export function healFromVampiricBite(attacker,actualHpDamage){
  if(attacker?.heldItem!=='morso_vampirico'||!Number.isFinite(actualHpDamage)||
     actualHpDamage<=0||attacker.hp<=0||attacker.hp>=attacker.maxHp)return 0;
  const gain=Math.max(1,Math.floor(actualHpDamage*VAMPIRIC_BITE_RATE));
  const healed=Math.min(attacker.maxHp-attacker.hp,gain);
  attacker.hp+=healed;
  return healed;
}
