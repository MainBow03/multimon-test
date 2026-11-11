// Usa esattamente la stessa regola di accesso del draft normale.
// Le evocazioni e i mostri esclusivi della campagna non sono collezionabili.
export function getCollectionEntries(characters, unlockedChars = []) {
  const unlocked = new Set(Array.isArray(unlockedChars) ? unlockedChars : []);
  return (Array.isArray(characters) ? characters : [])
    .filter(char => char?.id && !char.isSummonOnly && !char.isCampaignMonster)
    .map(character => ({
      character,
      owned: ((!character.price && !character.isSecretUnlock) || unlocked.has(character.id))
    }));
}
