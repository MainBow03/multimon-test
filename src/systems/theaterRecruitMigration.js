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


// Reclute aggiunte alla storia dopo il rilascio originale.
// Il checkpoint mantiene l'indice della PROSSIMA missione da giocare:
// se è almeno N, la missione N è già stata completata.
// completed=true copre anche il salvataggio del finale, fermo alla missione 36.
export const THEATER_NEW_RECRUITS=Object.freeze([
  {id:'shrek',afterMission:11},
  {id:'perla',afterMission:17},
  {id:'whisper',afterMission:23}
]);

export function migrateTheaterNewRecruits(state,characters=[]){
  if(!state||!Array.isArray(state.roster))return {state,changed:false,added:[]};
  const byId=new Map(characters.filter(c=>c?.id).map(c=>[c.id,c]));
  const sector=Number(state.sectorIdx);
  const mission=Number(state.missionIdx);
  const progress=Number.isInteger(sector)&&Number.isInteger(mission)&&sector>=0&&
    mission>=0?sector*6+mission:0;
  const completed=state.completed===true;
  const roster=[...state.roster];
  const stats={...(state.rosterStats||{})};
  const added=[];
  let changed=false;
  for(const recruit of THEATER_NEW_RECRUITS){
    if(!completed&&progress<recruit.afterMission)continue;
    const character=byId.get(recruit.id);
    if(!character||!Number.isFinite(character.maxHp))continue;
    if(!roster.includes(recruit.id)){
      roster.push(recruit.id);
      added.push(recruit.id);
      changed=true;
    }
    // Non curare personaggi già presenti: anche 0 PS è un dato valido.
    // Se l'ID esisteva senza statistiche, recupera solo il dato mancante.
    if(!Number.isFinite(Number(stats[recruit.id]))||stats[recruit.id]===undefined||
       stats[recruit.id]===null){
      stats[recruit.id]=character.maxHp;
      changed=true;
    }
  }
  return {state:changed?{...state,roster,rosterStats:stats}:state,changed,added};
}

// Un solo passaggio (e un solo salvataggio) per la vecchia correzione
// di Stellarubia e i tre nuovi personaggi.
export function migrateTheaterRecruits(state,characters=[]){
  const old=migrateTheaterStellarubia(state,characters);
  const current=migrateTheaterNewRecruits(old.state,characters);
  return {state:current.state,changed:old.changed||current.changed,added:current.added};
}
