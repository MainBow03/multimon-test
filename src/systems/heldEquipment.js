// Strumenti da tenere: non sono consumabili.
import { ITEMS_DB } from '../data/items.js';
// Sblocco shop permanente: lo strumento non scompare dopo le battaglie.
// Le gemme si scaricano SOLO durante la battaglia corrente.
export const HELD_ITEM_IDS=Object.freeze(Object.values(ITEMS_DB).filter(x=>x.type==='held').map(x=>x.id));
export const getHeldItemCount=(inventory,id)=>HELD_ITEM_IDS.includes(id)?
    Math.max(0,Number(inventory?.[id])||0):0;
export const getEquippedCount=(team,id,excludeIndex=-1)=>
    (team||[]).filter((hero,i)=>i!==excludeIndex&&hero.heldItem===id).length;
export const canEquipHeldItem=(team,index,itemId,inventory)=>
    itemId===''||(HELD_ITEM_IDS.includes(itemId)&&getEquippedCount(team,itemId,index)<getHeldItemCount(inventory,itemId));
export const getHeldGemType=itemId=>ITEMS_DB[itemId]?.gemType||null;
export const isUnusedGem=(character,move)=>!!character&&!!move&&move.power>0&&!character.gemSpent&&
    getHeldGemType(character.heldItem)===move.type;
export const getHeldPowerFactor=(character,move)=>{
    if(character?.heldItem==='iperband'&&move?.power>0)return 1.3;
    return isUnusedGem(character,move)?1.3:1;
};
export const useHeldGem=(character,move)=>{
    if(!isUnusedGem(character,move))return false;
    character.gemSpent=true;
    return true;
};
export const getHeldRecoil=(character,move)=>
    character?.heldItem==='iperband'&&move?.power>0
    ? Math.max(1,Math.floor((character.maxHp||0)*.1)):0;
export const getHeldEvasion=character=>character?.heldItem==='mantello_invisibilita'?.15:0;
export const getHeldEndTurnHeal=character=>
    character?.heldItem==='avanzi'&&character.hp>0
    ? Math.max(1,Math.floor((character.maxHp||0)*.05)):0;
export const getMahitoMultiplier = (attacker, defender, move) => {
  if (attacker?.id !== 'mahito' || !move?.power ||
      !defender?.statuses?.some(s => s.type === 'Anima Distorta')) return 1;
  return 1.25 * (move.name === 'Tocco dell’Anima' ? 2 : 1);
};
export const canDistortSoul = (attacker, move, target, randomValue = Math.random()) =>
  attacker?.id === 'mahito' && move?.contact === true && move.power > 0 &&
  target?.hp > 0 && !target?.passive?.immuneToNegativeStatuses && randomValue < 0.3;
export const getDistortedSoulDamage = (character) =>
  character?.statuses?.some(s => s.type === 'Anima Distorta')
    ? Math.max(1, Math.floor((character.maxHp || 0) * 0.05)) : 0;
