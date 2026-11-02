// Recupero del turno in campagna quando un rematch mantiene l'indice
// di comando del combattimento precedente. Non interviene nel multiplayer.
export function nextCampaignCommandIndex(state, role='p1') {
  if (!state?.isCampaignBattle || state.status !== 'battling' || state.isBot?.[role]) return -1;
  const field=state.field?.[role] || [], team=state.teams?.[role] || [], actions=state.actions?.[role] || {};
  for(let position=0;position<field.length;position++){
    const teamIndex=field[position], fighter=team[teamIndex];
    if(fighter?.hp>0 && !Object.prototype.hasOwnProperty.call(actions,String(teamIndex)))return position;
  }
  return -1;
}
export function shouldRecoverCampaignCommand(state,role,currentIndex){
  const next=nextCampaignCommandIndex(state,role);
  if(next<0)return false;
  const field=state.field?.[role] || [];
  const teamIndex=field[currentIndex], fighter=state.teams?.[role]?.[teamIndex];
  const chosen=teamIndex!==undefined &&
    Object.prototype.hasOwnProperty.call(state.actions?.[role] || {},String(teamIndex));
  return !Number.isInteger(currentIndex) || currentIndex<0 ||
    currentIndex>=field.length || !fighter || !(fighter.hp>0) || chosen;
}

/** Se il salvataggio conserva solo alcuni Cell Jr. o contiene vecchi KO,
 *  entra in campo soltanto chi ha PS positivi; gli indici restano corretti. */
export function initialCampaignField(team,fieldSize){
  if(!Array.isArray(team))return [];
  const limit=Math.max(0,Math.floor(Number(fieldSize)||0));
  return team.map((fighter,index)=>({fighter,index}))
    .filter(({fighter})=>Number(fighter?.hp)>0)
    .slice(0,limit).map(({index})=>index);
}
