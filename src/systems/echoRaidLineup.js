// Solo i sei titolari entrano in campo all'inizio del raid.
// Gli altri diciotto rimangono nello stesso team e possono essere sostituiti
// con le normali azioni Cambia (Squadra) o dopo un KO.
export const ECHO_ACTIVE_LIMIT=6;

export function echoRaidStarters(roster,selection){
 const available=Array.isArray(roster)?roster.filter(Boolean):[];
 const unique=ids=>[...new Set(ids)].filter(id=>available.includes(id));
 if(Array.isArray(selection))return unique(selection).slice(0,ECHO_ACTIVE_LIMIT);
 return unique(available).slice(0,ECHO_ACTIVE_LIMIT);
}

export function toggleEchoRaidStarter(roster,previous,id){
 const chosen=echoRaidStarters(roster,previous);
 if(!roster.includes(id))return chosen;
 return chosen.includes(id)
  ? chosen.filter(x=>x!==id)
  : chosen.length<ECHO_ACTIVE_LIMIT?[...chosen,id]:chosen;
}

export function orderEchoRaidRoster(roster,starters){
 const chosen=echoRaidStarters(roster,starters);
 return [...chosen,...roster.filter(id=>!chosen.includes(id))];
}

export function isCompleteEchoRaidLineup(roster,starters){
 return echoRaidStarters(roster,starters).length===ECHO_ACTIVE_LIMIT;
}
