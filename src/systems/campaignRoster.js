// Ripara i salvataggi che contengono ID di personaggi non presenti nel database.
// Conserva gli ID e gli HP per un possibile ripristino futuro, senza azzerare i progressi.
export function reconcileCampaignRoster(state, characters) {
  if (!state || !Array.isArray(state.roster)) return state;
  const byId = new Map(characters.map(c => [c.id, c]));
  const stats = { ...(state.rosterStats || {}) };
  const archivedStats = { ...(state.unavailableRosterStats || {}) };
  const unavailable = new Set(state.unavailableRosterIds || []);
  const roster = [];
  let changed = false;
  for (const id of state.roster) {
    if (byId.has(id)) {
      if (!roster.includes(id)) roster.push(id);
    } else {
      changed = true;
      unavailable.add(id);
      if (Object.prototype.hasOwnProperty.call(stats, id)) {
        archivedStats[id] = stats[id];
        delete stats[id];
      }
    }
  }
  for (const id of [...unavailable]) {
    const character = byId.get(id);
    if (!character) continue;
    if (!roster.includes(id)) {
      roster.push(id);
      stats[id] = archivedStats[id] ?? character.maxHp;
    }
    unavailable.delete(id);
    delete archivedStats[id];
    changed = true;
  }
  if (!changed) return state;
  return { ...state, roster, rosterStats: stats,
    unavailableRosterIds: [...unavailable], unavailableRosterStats: archivedStats };
}

export function partitionCampaignUnlocks(unlocks, roster, characters) {
  const known = new Set(characters.map(c => c.id));
  const current = new Set(roster);
  const valid = [], unavailable = [];
  for (const id of unlocks || []) {
    if (!known.has(id)) unavailable.push(id);
    else if (!current.has(id)) valid.push(id);
  }
  return { valid, unavailable };
}

export function getCampaignHealthSummary(roster, rosterStats, characters) {
  const byId = new Map(characters.map(c => [c.id, c]));
  const aliveHeroes = (roster || []).filter(id =>
    byId.has(id) && byId.get(id).maxHp > 0 && Number(rosterStats?.[id]) > 0);
  const totalHpPercentage = aliveHeroes.length
    ? aliveHeroes.reduce((sum, id) =>
        sum + Number(rosterStats[id]) / byId.get(id).maxHp, 0) / aliveHeroes.length : 0;
  return { aliveHeroes, totalHpPercentage,
    lowHealthWarning: aliveHeroes.length > 0 && totalHpPercentage < 0.4 };
}
