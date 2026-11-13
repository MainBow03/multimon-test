// Le missioni possono bloccare temporaneamente personaggi per motivi di trama.
// È una restrizione di selezione, NON un danno, una rimozione dal salvataggio
// o una cancellazione dei loro PS. Il reclutamento di ritorno resta normale.
export function isCampaignHeroUnavailable(mission,id){
  return !!id&&Array.isArray(mission?.unavailableChars)&&mission.unavailableChars.includes(id);
}

export function availableCampaignHeroes(mission,ids=[]){
  return (ids||[]).filter(id=>!isCampaignHeroUnavailable(mission,id));
}

export function validateCampaignLineup(mission,roster,selected){
  if(!Array.isArray(selected)||selected.length===0)return {ok:false,reason:'empty'};
  const owned=new Set(roster||[]);
  if(selected.some(id=>isCampaignHeroUnavailable(mission,id)))return {ok:false,reason:'unavailable'};
  if(selected.some(id=>!owned.has(id)))return {ok:false,reason:'not_in_roster'};
  if(new Set(selected).size!==selected.length)return {ok:false,reason:'duplicate'};
  return {ok:true};
}
