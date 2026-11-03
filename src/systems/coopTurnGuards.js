// Verifiche pure da applicare dentro una transazione Firestore.
// Una risposta calcolata su una fase precedente NON può sovrascrivere la stanza.
export function coopSeatOwned(room,role,uid){
 return !!(room?.isRoguelikeCoop && uid && ['p1','p2','p3'].includes(role) &&
   room.players?.[role] && !room.isBot?.[role] && room.playerUids?.[role]===uid);
}

export function canSubmitCoopAction(room,role,uid,expectedPhase){
 return coopSeatOwned(room,role,uid) && room.status==='battling' &&
   Number.isFinite(expectedPhase) && room.phaseStartedAt===expectedPhase &&
   !room.turnCalculationOwner;
}

export function canCommitCoopTurn(room,role,uid,expectedPhase){
 if(!coopSeatOwned(room,role,uid) || room.status!=='battling' ||
    !Number.isFinite(expectedPhase) || room.phaseStartedAt!==expectedPhase)return false;
 // Solo chi ha acquisito il lock del turno può scriverne il risultato.
 // L'host può farlo direttamente solo quando non esiste un lock altrui.
 return role==='p1'
   ? (!room.turnCalculationOwner || room.turnCalculationOwner===uid)
   : room.turnCalculationOwner===uid;
}
