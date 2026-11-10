// Prima di caricare il cloud, proteggi la partita ancora in corso.
// Una sessione locale deve appartenere allo stesso UID: non va cancellata
// soltanto perché non è una stanza Firestore online.
export function shouldKeepSessionOnAuthRestore(session,uid,priorUid){
  if(!session||!uid)return false;
  const sameAccount=session.playerUid===uid ||
    (!session.playerUid&&priorUid===uid);
  if(!sameAccount)return false;
  if(session.appMode==='online_room' || session.appMode==='roguelike_coop_lobby')
    return !!session.roomId&&!!session.playerRole;
  if(session.appMode==='local_room')
    return !!session.gameState && typeof session.gameState==='object' &&
      !!session.gameState.teams && !!session.gameState.field;
  return false;
}
