// Regola condivisa tra interfaccia, giocatori, CPU e motore di battaglia.
// Solo gli oggetti consumabili dello Zaino sono vietati in Ultimon.
// Gli strumenti tenuti dai Multimon e le loro abilità rimangono attivi.
export function canUseBagItems(room) {
  return room?.gameMode !== 'ultimon';
}
