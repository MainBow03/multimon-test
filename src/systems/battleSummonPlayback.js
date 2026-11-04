/**
 * Vista locale della sequenza animata. La stanza Firestore contiene lo stato
 * autorevole completo: gli Spiriti Stellari sono già nella squadra/nel campo
 * anche prima che l'animazione d'ingresso venga riprodotta.
 * Li nascondiamo solo NELLA COPIA GRAFICA finché non arriva il loro evento.
 */
export function createBattlePlaybackSnapshot(room) {
  const hadStartSnapshot=Boolean(room?.startOfTurnTeams && room?.startOfTurnField);
  const teams=structuredClone((hadStartSnapshot?room.startOfTurnTeams:room?.teams)||{});
  const field=structuredClone((hadStartSnapshot?room.startOfTurnField:room?.field)||{});
  if (!hadStartSnapshot) {
    for (const event of room?.events||[]) {
      if (event?.type !== 'summon' || !event.player ||
          !Number.isInteger(event.fieldIdx)) continue;
      const active=field[event.player];
      if(Array.isArray(active)){
        field[event.player]=active.filter(idx=>idx!==event.fieldIdx);
      }
    }
  }
  return {teams,field};
}

/**
 * Replay deterministico per ogni client (host, altri utenti, spettatori).
 * Aggiunge lo Spirito esattamente al suo indice originale; non fa mai push
 * due volte di una stessa evocazione. Non modifica la stanza originale.
 */
export function applySummonPlaybackEvent(snapshot,event) {
  if(event?.type!=='summon' || !event.player ||
     !Number.isInteger(event.fieldIdx)||event.fieldIdx<0 || !event.newChar)
    return snapshot;
  const owner=event.player,idx=event.fieldIdx;
  const oldTeam=snapshot?.teams?.[owner];
  const oldField=snapshot?.field?.[owner];
  if(!Array.isArray(oldTeam)||!Array.isArray(oldField))return snapshot;
  const team=oldTeam.slice();
  // Una evocazione esistente nel salvataggio non va duplicata.
  if(!team[idx] || team[idx].id!==event.newChar.id)
    team[idx]=structuredClone(event.newChar);
  const field=oldField.includes(idx)?oldField.slice():[...oldField,idx];
  return {
    teams:{...snapshot.teams,[owner]:team},
    field:{...snapshot.field,[owner]:field}
  };
}

export function visibleOnlineZodiacSpirits(teams,field,player) {
  const team=teams?.[player]||[];
  return (field?.[player]||[])
    .map(idx=>team[idx])
    .filter(char=>char?.hp>0 && char.isZodiacSpirit &&
      char.zodiacOwner===player && char.isSummonOnly);
}
