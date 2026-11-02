import { CHARACTERS } from '../data/characters.js';
import { MASTERY_CHARACTER_TITLES } from '../data/masteryTitles.js';
// Padronanza estetica: non modifica statistiche, mosse o probabilità di vittoria.
// Mostri della campagna, evocazioni e fusioni non partecipano ai prestigi.
export const MASTERY_ELIGIBLE_IDS = new Set(CHARACTERS.filter(c =>
  !c.isCampaignMonster && !c.isSecretUnlock && !c.isSummonOnly && !c.fusionOf
).map(c=>c.id));
export const isMasteryEligible = character => !!character?.id &&
  MASTERY_ELIGIBLE_IDS.has(character.id);

export const MASTERY_REWARDS = Object.freeze([
  {level:5, name:'Ingresso Stellare', description:'Sblocco di un sigillo azzurro e di un ingresso illuminato nell’arena.', icon:'✦'},
  {level:10, name:'Aura dell’Esperto', description:'Il Multimon entra con un’aura viola che circonda il suo ritratto.', icon:'◈'},
  {level:15, name:'Scia del Maestro', description:'Nuovi bagliori e particelle luminose all’ingresso e durante lo scontro.', icon:'✧'},
  {level:20, name:'Entrata Leggendaria', description:'Ingresso dorato, emblema leggendario e titolo esclusivo da indossare.', icon:'★'}
]);
export function masteryDeploymentTier(level) {
  const safe=Math.max(1,Math.min(20,Number(level)||1));
  return MASTERY_REWARDS.filter(r=>safe>=r.level).at(-1)||null;
}
export function masteryVisibleLevels(profile) {
  return Object.fromEntries(Object.entries(profile?.mastery||{})
    .filter(([id])=>MASTERY_ELIGIBLE_IDS.has(id))
    .map(([id,xp])=>[id,masteryLevel(xp)])
    .filter(([,level])=>level>=5));
}
export const MASTERY_MAX_LEVEL = 20;
export const MASTERY_XP_PER_LEVEL = 100;
export const MASTERY_XP_PER_BATTLE = 40;
export const MASTERY_XP_WIN_BONUS = 20;
export const MASTERY_MAX_XP = (MASTERY_MAX_LEVEL - 1) * MASTERY_XP_PER_LEVEL;

// Titoli esclusivi scritti per ogni Multimon giocabile.
// Esportiamo ancora il vecchio nome per compatibilità con altri componenti.
export const MASTERY_SPECIAL_TITLES = MASTERY_CHARACTER_TITLES;

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
  if (!isMasteryEligible(character) || !character?.name) return '';
  return MASTERY_CHARACTER_TITLES[character.id] || '';
}

export function isMasteryUnlocked(profile, characterId) {
  return MASTERY_ELIGIBLE_IDS.has(characterId) && masteryLevel(profile?.mastery?.[characterId]) === MASTERY_MAX_LEVEL;
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
    if (typeof id !== 'string' || !MASTERY_ELIGIBLE_IDS.has(id) || (allowedIds && !allowedIds.has(id))) continue;
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
