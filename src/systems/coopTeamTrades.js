// Scambi e ordine squadra nell'accampamento condiviso.
// I chiamanti applicano il risultato con UNA transazione Firestore:
// questa logica non legge mai una copia non aggiornata della stanza.
import {coopHumanPlayers} from './coopExpedition.js';

export const COOP_TRADE_REFUSAL_COOLDOWN_MS = 90 * 1000;
export const COOP_TRADE_EXPIRY_MS = 120 * 1000;

function campPlayer(room,role) {
  if (!room?.isRoguelikeCoop || room.status !== 'coop_camp')
    throw new Error('Puoi organizzare gli scambi soltanto all’accampamento.');
  if (!coopHumanPlayers(room).includes(role))
    throw new Error('Non sei un giocatore della spedizione.');
}

const validCharacter=(room,role,index)=>{
  const team=room.teams?.[role];
  if (!Array.isArray(team) || !Number.isInteger(index) || index<0 || index>=team.length ||
      !team[index] || team[index].isSummonOnly)
    throw new Error('Il Multimon scelto non è più disponibile.');
  return team[index];
};

export const coopTradeIsExpired=(trade,now=Date.now())=>
  !!trade && now-(Number(trade.createdAt)||0)>=COOP_TRADE_EXPIRY_MS;
export const coopTradeCooldownRemaining=(room,role,now=Date.now())=>
  Math.max(0,Math.ceil(((room?.coopTradeCooldowns?.[role]||0)-now)/1000));

export function reorderCoopTeam(room,role,fromIndex,toIndex) {
  campPlayer(room,role);
  const team=room.teams?.[role];
  validCharacter(room,role,fromIndex);
  validCharacter(room,role,toIndex);
  if (fromIndex===toIndex)throw new Error('Il Multimon è già in questa posizione.');
  const reordered=team.slice();
  const [chosen]=reordered.splice(fromIndex,1);
  reordered.splice(toIndex,0,chosen);
  return {['teams.'+role]:reordered};
}

export function requestCoopTrade(room,fromRole,toRole,offeredIndex,wantedIndex,now=Date.now()) {
  campPlayer(room,fromRole);
  if (fromRole===toRole || !coopHumanPlayers(room).includes(toRole))
    throw new Error('Scegli un altro giocatore della spedizione.');
  const remaining=coopTradeCooldownRemaining(room,fromRole,now);
  if (remaining>0)throw new Error('Dopo il rifiuto puoi richiedere un nuovo scambio tra '+remaining+' secondi.');
  if (room.coopTrade && !coopTradeIsExpired(room.coopTrade,now))
    throw new Error('C’è già una proposta di scambio in attesa di risposta.');
  const offered=validCharacter(room,fromRole,offeredIndex);
  const wanted=validCharacter(room,toRole,wantedIndex);
  return {
    coopTrade:{
      id:String(now)+'-'+fromRole+'-'+toRole,
      fromRole,toRole,offeredIndex,wantedIndex,
      offeredId:offered.id,wantedId:wanted.id,
      offeredName:offered.name,wantedName:wanted.name,
      createdAt:now
    },
    coopTradeLastResult:null
  };
}

export function respondCoopTrade(room,role,accepted,now=Date.now()) {
  campPlayer(room,role);
  const trade=room.coopTrade;
  if (!trade)throw new Error('Non ci sono richieste di scambio.');
  if (coopTradeIsExpired(trade,now))
    throw new Error('Questa proposta è scaduta. Chiedi di inviarla nuovamente.');
  if (role!==trade.toRole || !coopHumanPlayers(room).includes(trade.fromRole))
    throw new Error('Solo il destinatario può accettare o rifiutare lo scambio.');
  const base={
    coopTrade:null,
    coopTradeLastResult:{
      status:accepted?'accepted':'rejected',
      fromRole:trade.fromRole,toRole:trade.toRole,
      offeredName:trade.offeredName,wantedName:trade.wantedName,
      resolvedAt:now
    }
  };
  if (!accepted) return {
    ...base,
    coopTradeCooldowns:{
      ...(room.coopTradeCooldowns||{}),
      [trade.fromRole]:now+COOP_TRADE_REFUSAL_COOLDOWN_MS
    }
  };
  // Controllo anti-snapshot obsoleto: riordini e cure concorrenti non
  // permettono di scambiare inconsapevolmente un altro Multimon.
  const offer=validCharacter(room,trade.fromRole,trade.offeredIndex);
  const want=validCharacter(room,trade.toRole,trade.wantedIndex);
  if (offer.id!==trade.offeredId || want.id!==trade.wantedId)
    throw new Error('Le squadre sono cambiate: annulla e richiedi di nuovo lo scambio.');
  const from=room.teams[trade.fromRole].slice();
  const to=room.teams[trade.toRole].slice();
  from[trade.offeredIndex]=want;
  to[trade.wantedIndex]=offer;
  // Conserva TUTTI i dati: PS correnti, strumenti, bonus, mosse, status
  // e proprietà. Cambia soltanto la squadra che possiede il personaggio.
  return {...base,
    ['teams.'+trade.fromRole]:from,
    ['teams.'+trade.toRole]:to
  };
}

export function cancelCoopTrade(room,role,now=Date.now()) {
  campPlayer(room,role);
  const trade=room.coopTrade;
  if (!trade)throw new Error('Non ci sono richieste da annullare.');
  if (role!==trade.fromRole && !coopTradeIsExpired(trade,now))
    throw new Error('Solo chi ha inviato lo scambio può annullarlo.');
  return {coopTrade:null};
}
