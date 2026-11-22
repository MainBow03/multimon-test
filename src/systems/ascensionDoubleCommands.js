/**
 * Authoritative command cursor for Ascesa del Colosseo.
 *
 * The classic battle controller optimistically advances its local cursor
 * after a successful write; in an online 2v2 the Firestore room snapshot may
 * still contain the previous command map. Only the AUTHORITATIVE room can
 * decide which character needs a move next. Team indices may be nonconsecutive
 * after switches, so return the FIELD POSITION, not the team index.
 */
export function ascensionNextCommandPosition(room,side){
 if(!room||room.status!=='battling'||!['p1','p2'].includes(side))return -1;
 const field=room.field?.[side]||[];
 const team=room.teams?.[side]||[];
 const actions=room.actions?.[side]||{};
 return field.findIndex(teamIdx=>
  team[teamIdx]?.hp>0 && !Object.hasOwn(actions,teamIdx));
}
export function ascensionCommandProgress(room,side){
 const field=(room?.field?.[side]||[]).filter(idx=>room?.teams?.[side]?.[idx]?.hp>0);
 const actions=room?.actions?.[side]||{};
 return {
  ready:field.filter(idx=>Object.hasOwn(actions,idx)).length,
  total:field.length,
  next:ascensionNextCommandPosition(room,side)
 };
}
