// Padronanza estetica: non modifica statistiche, mosse o probabilità di vittoria.
export const MASTERY_MAX_LEVEL = 20;
export const MASTERY_XP_PER_LEVEL = 100;
export const MASTERY_XP_PER_BATTLE = 40;
export const MASTERY_XP_WIN_BONUS = 20;
export const MASTERY_MAX_XP = (MASTERY_MAX_LEVEL - 1) * MASTERY_XP_PER_LEVEL;

// Titoli narrativi unici per alcuni campioni; ogni altro Multimon ha un
// titolo esclusivo che include il suo nome.
export const MASTERY_SPECIAL_TITLES = Object.freeze({
  nicole: 'La Mamma Demoniaca',
  alphonse: 'Trasmutatore Supremo',
  cyborg: 'Titano Indistruttibile',
  hannibal: 'Burattinaio della Mente'
});

export function masteryLevel(xp = 0) {
  const safeXp = Math.max(0, Number.isFinite(Number(xp)) ? Number(xp) : 0);
  return Math.min(MASTERY_MAX_LEVEL, 1 + Math.floor(safeXp / MASTERY_XP_PER_LEVEL));
}

export function masteryProgress(xp = 0) {
  const safeXp = Math.min(MASTERY_MAX_XP, Math.max(0, Number.isFinite(Number(xp)) ? Math.floor(Number(xp)) : 0));
  const level = masteryLevel(safeXp);
  const inLevel = level === MASTERY_MAX_LEVEL ? MASTERY_XP_PER_LEVEL : safeXp % MASTERY_XP_PER_LEVEL;
  return { level, xp: safeXp, inLevel, required: MASTERY_XP_PER_LEVEL,
    percent: level === MASTERY_MAX_LEVEL ? 100 : inLevel };
}

export const masteryRank = level => level >= 20 ? 'Leggendario'
  : level >= 15 ? 'Maestro' : level >= 10 ? 'Veterano'
  : level >= 5 ? 'Esperto' : 'Principiante';

export function masteryTitle(character) {
  if (!character?.id || !character?.name) return '';
  return MASTERY_SPECIAL_TITLES[character.id] || `Leggenda di ${character.name}`;
}

export function isMasteryUnlocked(profile, characterId) {
  return !!characterId && masteryLevel(profile?.mastery?.[characterId]) === MASTERY_MAX_LEVEL;
}

export function equippedMasteryTitle(profile, characters) {
  const id = profile?.equippedMasteryTitle;
  const character = characters?.find(char => char.id === id);
  return character && isMasteryUnlocked(profile, id) ? masteryTitle(character) : '';
}

// Restituisce una copia: la padronanza si assegna una sola volta per Multimon
// partecipante, al termine di una battaglia (non per singolo turno/KO).
export function grantMasteryXP(profile, characterIds, win = false, allowedIds = null) {
  const next = { ...profile, mastery: { ...(profile?.mastery || {}) } };
  const eligible = new Set(Array.isArray(characterIds) ? characterIds : []);
  const gain = MASTERY_XP_PER_BATTLE + (win ? MASTERY_XP_WIN_BONUS : 0);
  let firstUnlock = null;
  for (const id of eligible) {
    if (typeof id !== 'string' || !id || (allowedIds && !allowedIds.has(id))) continue;
    const oldXp = Math.min(MASTERY_MAX_XP, Math.max(0, Number(next.mastery[id]) || 0));
    const newXp = Math.min(MASTERY_MAX_XP, oldXp + gain);
    next.mastery[id] = newXp;
    if (oldXp < MASTERY_MAX_XP && newXp === MASTERY_MAX_XP && !firstUnlock) firstUnlock = id;
  }
  // Il primo titolo ottenuto viene selezionato automaticamente; scegliendo
  // "Nessun titolo" il giocatore può invece impostare esplicitamente null.
  if (firstUnlock && next.equippedMasteryTitle === undefined)
    next.equippedMasteryTitle = firstUnlock;
  return next;
}
