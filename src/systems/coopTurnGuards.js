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

export function canCommitCoopTurn(room,role,uid,expectedPhase,now=Date.now()){
 if(!coopSeatOwned(room,role,uid) || room.status!=='battling' ||
    !Number.isFinite(expectedPhase) || room.phaseStartedAt!==expectedPhase)return false;
 // Solo chi ha acquisito il lock del turno può scriverne il risultato.
 // L'host può farlo direttamente solo quando non esiste un lock altrui.
 const staleLease=Number.isFinite(room.turnCalculationStartedAt) &&
   now-room.turnCalculationStartedAt>=25000;
 return role==='p1'
   ? (!room.turnCalculationOwner || room.turnCalculationOwner===uid || staleLease)
   : room.turnCalculationOwner===uid;
}

// Una transazione può aggiungere UNA sola nuova azione del combattente attivo.
// Non può sostituire una mossa già confermata né inserire azioni da riserva.
// Le azioni già lette nel vecchio snapshot devono rimanere identiche.
export function coopValidatedActionDelta(room,role,uid,expectedPhase,submitted){
 if(!canSubmitCoopAction(room,role,uid,expectedPhase)||
    !submitted||typeof submitted!=='object'||Array.isArray(submitted))return null;
 const stored=room.actions?.[role]||{};
 const field=room.field?.[role]||[];
 const team=room.teams?.[role]||[];
 const delta={};
 for(const [rawIndex,action] of Object.entries(submitted)){
   const index=Number(rawIndex);
   if(!Number.isInteger(index)||index<0||String(index)!==rawIndex||
      !action||typeof action!=='object'||typeof action.type!=='string')return null;
   if(Object.prototype.hasOwnProperty.call(stored,rawIndex)){
     if(JSON.stringify(stored[rawIndex])!==JSON.stringify(action))return null;
   }else{
     if(!field.includes(index)||!team[index]||team[index].hp<=0)return null;
     delta[rawIndex]=action;
   }
 }
 return Object.keys(delta).length===1?delta:null;
}
