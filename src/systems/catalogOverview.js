// Catalogo: solo i personaggi giocabili, escludendo evocazioni e boss delle campagne.
// I contatori provengono dal roster corrente: nessun numero fisso da aggiornare a mano.
export function getCatalogOverview(characters = []) {
  const roster = (Array.isArray(characters) ? characters : [])
    .filter(char => char?.id && !char.isSummonOnly && !char.isCampaignMonster);
  return {
    totalMultimon: roster.length,
    totalTypes: new Set(roster.flatMap(char => Array.isArray(char.types) ? char.types : [])).size,
    totalSummons: (Array.isArray(characters) ? characters : []).filter(char => char?.isSummonOnly).length,
    totalCampaignMonsters: (Array.isArray(characters) ? characters : []).filter(char => char?.isCampaignMonster).length
  };
}
