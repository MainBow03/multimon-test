// Parametri esclusivi del raid conclusivo della PRIMA campagna.
// Non cambiare gli HP base dei personaggi sbloccati e gli altri Juggernaut.
export const FIRST_CAMPAIGN_FINAL_RAID = Object.freeze({
  trigon: Object.freeze({ maxHp: 3375, shieldHits: 6 }),
  gaster: Object.freeze({ maxHp: 2436, shieldHits: 6 })
});

export function finalRaidBossStats(id) {
  return FIRST_CAMPAIGN_FINAL_RAID[id] || null;
}

// Anche chi era già arrivato al raid con un salvataggio precedente
// mantiene la stessa percentuale di PS residui, ma sul nuovo massimo.
export function rebalanceSavedFinalRaidBoss(saved) {
  const balance=finalRaidBossStats(saved?.id);
  if(!balance)return saved;
  const oldMax=Number(saved.maxHp);
  const oldHp=Number(saved.hp);
  const safeMax=Number.isFinite(oldMax)&&oldMax>0?oldMax:balance.maxHp;
  const safeHp=Number.isFinite(oldHp)?oldHp:safeMax;
  const newHp=Math.min(balance.maxHp,Math.max(0,Math.round(safeHp/safeMax*balance.maxHp)));
  const oldShield=Number(saved.juggHitsRemaining);
  return {...saved,maxHp:balance.maxHp,hp:newHp,
    shieldGrantedHits:balance.shieldHits,
    juggHitsRemaining:Number.isFinite(oldShield)
      ?Math.min(balance.shieldHits,Math.max(0,Math.trunc(oldShield))):0};
}

// Chiamare UNA VOLTA per OGNI colpo effettivo: un attacco da 2–4 colpi
// sottrae 2–4 cariche, non una sola per l'intera mossa.
export function consumeRaidShieldHit(target){
  if(!target||!Number.isFinite(target.juggHitsRemaining)||target.juggHitsRemaining<=0)
    return {absorbed:false,broken:false,remaining:0};
  target.juggHitsRemaining=Math.max(0,Math.trunc(target.juggHitsRemaining)-1);
  return {absorbed:true,broken:target.juggHitsRemaining===0,remaining:target.juggHitsRemaining};
}

  
// Replay di battaglia: ogni modifica del contatore deve essere mostrata
// nello stesso ordine in cui viene risolta, non solo a fine turno.
export function createRaidShieldUpdateEvent(targetPlayer,targetIdx,remainingHits,text=null,activated=false){
  const event={
    type:'raid_shield_update',targetPlayer,targetIdx,
    remainingHits:Math.max(0,Math.trunc(Number(remainingHits)||0))
  };
  if(text)event.text=text;
  if(activated)event.activated=true;
  return event;
}

export function applyRaidShieldUpdateEvent(displayTeams,event){
  if(event?.type!=='raid_shield_update')return false;
  const target=displayTeams?.[event.targetPlayer]?.[event.targetIdx];
  if(!target)return false;
  target.juggHitsRemaining=Math.max(0,Math.trunc(Number(event.remainingHits)||0));
  return true;
}
