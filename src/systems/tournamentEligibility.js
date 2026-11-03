// Le forme akumizzate e i boss delle campagne future non possono
// partecipare al Torneo Assoluto, che cronologicamente le precede.
// Gli ID dei boss di Monarch vengono ricavati dalla campagna stessa,
// così nuove forme introdotte in quel capitolo restano escluse automaticamente.
import { CAMPAIGNS } from '../data/campaigns.js';

const monarch=CAMPAIGNS.find(c=>c.id==='monarch_akuma');
export const TOURNAMENT_EXCLUDED_IDS=Object.freeze([...new Set([
 'monarch','echomax',
 ...(monarch?.sectors||[]).flatMap(s=>(s.missions||[]).flatMap(m=>m.boss||[]))
])]);

const excluded=new Set(TOURNAMENT_EXCLUDED_IDS);
export const isTournamentExcludedId=id=>excluded.has(id);

export function isTournamentEligibleCharacter(char,storyIds=[]){
 return Boolean(char)&&!char.isSummonOnly&&!excluded.has(char.id)&&!storyIds.includes(char.id);
}

// Ripulisce un salvataggio del torneo già avviato senza toccare gli altri.
// Non reinserisce mai un personaggio della storia o una variante vietata.
export function sanitizeTournamentSave(state,characters,storyIds=[]){
 if(!state||!Array.isArray(state.roster))return state;
 const invalid=state.roster.filter(id=>excluded.has(id));
 const invalidProtagonist=Boolean(state.protagonist&&excluded.has(state.protagonist));
 if(!invalid.length&&!invalidProtagonist)return state;
 const removed=new Set(invalid);
 const roster=[...new Set(state.roster.filter(id=>!removed.has(id)))];
 const rosterStats={...(state.rosterStats||{})};
 for(const id of removed)delete rosterStats[id];
 // Un'alleanza già scelta è normalmente di otto membri. Se conteneva
 // un boss vietato, completa soltanto gli slot persi, senza azzerare
 // progressi, difficoltà, monete o altri dati del salvataggio.
 const previouslyChosen=state.roster.length<=8;
 if(previouslyChosen){
   const eligible=characters.filter(c=>isTournamentEligibleCharacter(c,storyIds));
   for(const c of eligible){
     if(roster.length>=8)break;
     if(!roster.includes(c.id)){
       roster.push(c.id);
       rosterStats[c.id]=c.maxHp;
     }
   }
 }
 return {...state,roster,rosterStats,
   protagonist:invalidProtagonist?null:state.protagonist,
   isStarted:invalidProtagonist?false:state.isStarted};
}
