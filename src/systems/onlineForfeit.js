import { resolveMultiplayerWinner } from './roomRecovery.js';

// Costruisce solo i campi del giocatore che si ritira. La transazione Firestore
// controlla i permessi e legge lo stato attuale prima di chiamare questa funzione.
export const ONLINE_FORFEIT_STAGES = new Set([
  'battling', 'executing', 'switching_phase', 'pre_battle', 'intermission'
]);

export function buildOnlineForfeitPatch(room, role, uid, now = Date.now()) {
  if (!room || !uid || !/^p[1-8]$/.test(role || '') ||
      room.playerUids?.[role] !== uid || !room.players?.[role] ||
      room.isBot?.[role]) {
    throw new Error('Non puoi modificare il posto di un altro giocatore.');
  }
  if (!ONLINE_FORFEIT_STAGES.has(room.status)) return null;

  // Mai scrivere i contenitori teams/actions/field/players per intero:
  // le azioni di altri giocatori potrebbero essere state confermate nel frattempo.
  const ownTeam = (room.teams?.[role] || []).map(char =>
    char ? { ...char, hp: 0 } : char);
  const currentName = room.players[role];
  const displayName = currentName.endsWith(' (Arreso)')
    ? currentName : currentName + ' (Arreso)';
  const patch = {
    [`teams.${role}`]: ownTeam,
    [`field.${role}`]: [],
    [`actions.${role}`]: {},
    [`players.${role}`]: displayName
  };

  const nextRoom = {
    ...room,
    teams: { ...room.teams, [role]: ownTeam },
    field: { ...room.field, [role]: [] },
    players: { ...room.players, [role]: displayName }
  };
  // Concludi immediatamente gli scontri con un vincitore certo, invece
  // di lasciare l'altro giocatore in attesa di una mossa impossibile.
  const participants = room.gameMode === 'classica'
    ? ['p1', 'p2']
    : room.gameMode === 'multipla'
      ? ['p1', 'p2', 'p3', 'p4']
      : room.isRoguelikeCoop
        ? ['p1', 'p2', 'p3', 'p4'].filter(p => room.players?.[p])
        : [];
  const winner = resolveMultiplayerWinner(nextRoom, participants);
  if (winner) {
    patch.winner = winner;
    if (room.status === 'executing') {
      // Lascia terminare l'animazione già in corso.
      patch.postExecStatus = 'gameover';
    } else {
      Object.assign(patch, {
        status: 'gameover',
        events: [],
        turnExpiresAt: null,
        phaseStartedAt: now
      });
    }
  }
  return patch;
}
