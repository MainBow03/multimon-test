export const ONLINE_HEAL_ITEM_LIMIT=3;
const HEALING_TYPES=new Set(['heal','revive','regen','heal_status']);
export const isLimitedHealingItem=item=>Boolean(item&&HEALING_TYPES.has(item.type));
export const isOnlineHealingLimited=(appMode,state)=>appMode==='online_room'&&!state?.isCampaignBattle;
// Conta solo usi effettivi confermati nei turni precedenti.
export function onlineHealingRemaining(state,role,appMode,itemDefinitions,includeQueued=true){
  if(!isOnlineHealingLimited(appMode,state))return Infinity;
  const spent=Math.max(0,Number(state?.healingItemsUsed?.[role])||0);
  const queued=includeQueued?Object.values(state?.actions?.[role]||{}).filter(action=>
    action?.type==='use_item'&&isLimitedHealingItem(itemDefinitions?.[action.itemId])).length:0;
  return Math.max(0,ONLINE_HEAL_ITEM_LIMIT-spent-queued);
}
