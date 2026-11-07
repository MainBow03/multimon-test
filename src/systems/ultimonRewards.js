// Premi Ultimon Multimon: 1° classificato -> ultimo classificato.
// Nessun bonus squadra o moltiplicatore modifica questi importi.
export const ULTIMON_REWARDS=Object.freeze({
  4:Object.freeze([150,75,40,25]),
  5:Object.freeze([175,80,60,40,25]),
  6:Object.freeze([200,90,80,75,60,40]),
  7:Object.freeze([215,100,95,80,70,60,40]),
  8:Object.freeze([250,140,110,100,85,80,70,55])
});

export function ultimonRewardForPlace(participants,placement){
  if(!Number.isInteger(participants)||!Number.isInteger(placement))return 0;
  const prizes=ULTIMON_REWARDS[participants];
  return prizes&&placement>=1&&placement<=prizes.length?prizes[placement-1]:0;
}

// Ricevuta persistente: non premiare due volte dopo refresh, riconnessione
// o quando più render vedono lo stato finale della stessa partita.
export function claimUltimonPrize(profile,{runId,role,participants,placement}={}){
  if(typeof runId!=='string'||!/^ultimon-[a-z0-9-]{8,90}$/.test(runId)||
    typeof role!=='string'||!/^p[1-8]$/.test(role))
    return {ok:false,profile,coins:0,reason:'Partita o partecipante non valido.'};
  const coins=ultimonRewardForPlace(participants,placement);
  if(!coins)return {ok:false,profile,coins:0,reason:'Piazzamento non valido.'};
  const receipt=runId+':'+role;
  const claimed=profile?.ultimonClaimedPrizes||[];
  if(claimed.includes(receipt))
    return {ok:false,profile,coins:0,reason:'Premio già riscosso.'};
  return {
    ok:true,coins,receipt,
    profile:{...profile,
      coins:(Number(profile?.coins)||0)+coins,
      ultimonClaimedPrizes:[...claimed,receipt]}
  };
}
