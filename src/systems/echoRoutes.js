// Tre vie tattiche a scelta prima delle missioni de L'Eco delle Anime.
// Ogni missione permette UNA decisione, salvata nello stato campagna.
export const ECHO_ROUTES=[
 {id:'assalto',label:'Assalto',description:'Attacco +10% per tutta la missione.',symbol:'⚔'},
 {id:'ricognizione',label:'Ricognizione',description:'La squadra inizia con Scudo Team per un turno.',symbol:'◈'},
 {id:'rifugio',label:'Rifugio',description:'Recupera il 15% dei PS massimi di ogni alleato ancora in vita.',symbol:'✚'}
];

export function applyEchoRouteToTeam(team,route){
 if(!Array.isArray(team))return team;
 for(const char of team){
  if(!char)continue;
  if(route==='assalto'){
    char.atk=Math.max(1,Math.round(char.atk*1.10));
    char.baseAtk=Math.max(1,Math.round((char.baseAtk??char.atk)*1.10));
  }else if(route==='ricognizione'){
    char.statuses??=[];
    if(!char.statuses.some(s=>s.type==='Scudo Team'))
      char.statuses.push({type:'Scudo Team',turns:1});
  }
 }
 return team;
}

export function claimEchoRoute(state,missionId,route,characters){
 if(!missionId || !ECHO_ROUTES.some(x=>x.id===route))return state;
 if(state.echoRouteChoices?.[missionId])return state;
 const stats={...(state.rosterStats||{})};
 if(route==='rifugio')for(const id of state.roster||[]){
   const c=characters.find(c=>c.id===id);
   if(c&&stats[id]>0)stats[id]=Math.min(c.maxHp,stats[id]+Math.ceil(c.maxHp*0.15));
 }
 return {...state,rosterStats:stats,
  echoRouteChoices:{...(state.echoRouteChoices||{}),[missionId]:route}};
}
