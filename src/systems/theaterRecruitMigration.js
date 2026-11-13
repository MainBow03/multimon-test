// Adegua in modo non distruttivo i vecchi salvataggi della quarta campagna.
// La missione 8 inizialmente sbloccava Tails. Ora sblocca Stellarubia,
// mentre Tails viene reclutato alla missione 12.
// Non togliamo Tails ai giocatori che lo avevano gia' ottenuto: non sarebbe
// corretto perdere un compagno o i suoi PS per un aggiornamento narrativo.
export function migrateTheaterStellarubia(state,characters=[]){
  if(!state||!Array.isArray(state.roster))return {state,changed:false};
  const sector=Math.max(0,Number(state.sectorIdx)||0);
  const mission=Math.max(0,Number(state.missionIdx)||0);
  const alreadyCompleted=!!state.completed||sector>1||(sector===1&&mission>=2);
  if(!alreadyCompleted||state.roster.includes('stellarubia'))return {state,changed:false};
  const stellarubia=characters.find(c=>c?.id==='stellarubia');
  if(!stellarubia)return {state,changed:false};
  const previous=state.rosterStats||{};
  const savedHp=Number(previous.stellarubia);
  const hp=Number.isFinite(savedHp)
    ?Math.min(stellarubia.maxHp,Math.max(0,savedHp))
    :stellarubia.maxHp;
  return {state:{
    ...state,
    roster:[...state.roster,'stellarubia'],
    rosterStats:{...previous,stellarubia:hp},
    lastUnlocked:[...new Set([...(state.lastUnlocked||[]),'stellarubia'])]
  },changed:true};
}
