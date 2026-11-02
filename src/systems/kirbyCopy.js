// Passiva di Kirby: fino a due mosse copiate in un combattimento,
// una per ciascun avversario distinto colpito realmente.
export function copyKirbyMoveOnHit(kirby, victim, victimKey, random=Math.random) {
  if(kirby?.id!=='kirby' || kirby?.passive?.type!=='kirby_copy_move') return null;
  if(!kirby.hp || !victim || !victimKey) return null;
  kirby.kirbyCopiedTargets ||= [];
  const maxCopies=Math.max(0,Number(kirby.passive.maxCopies)||2);
  const existing=(kirby.moves||[]).filter(m=>m?.isKirbyCopy);
  if(existing.length>=maxCopies || kirby.kirbyCopiedTargets.includes(victimKey))return null;
  const candidates=(victim.moves||[]).filter(m=>
    m && typeof m.name==='string' && m.name.trim() &&
    // Combinazioni e mosse che chiedono un partner specifico non sono
    // eseguibili in modo affidabile da Kirby.
    !m.isCombo && !m.isKirbyCopy && !m.isStolen &&
    m.remainingUses!==0 && m.uses!==0 &&
    !m.requiredStatus && !m.requiresMove && !m.requireSummonsDead &&
    !kirby.moves.some(owned=>owned.name===m.name)
  );
  if(!candidates.length)return null;
  const roll=Number(random());
  const index=Math.max(0,Math.min(candidates.length-1,Math.floor((Number.isFinite(roll)?roll:0)*candidates.length)));
  const selected=candidates[index];
  // Clonazione indipendente: la mossa originale non perde utilizzi.
  const maxUses=Number.isFinite(selected.maxUses)?selected.maxUses
    :Number.isFinite(selected.uses)?selected.uses:3;
  const availableUses=Number.isFinite(selected.remainingUses)?selected.remainingUses
    :Number.isFinite(selected.uses)?selected.uses:maxUses;
  const remainingUses=Math.max(0,Math.min(maxUses,availableUses));
  const copied={...structuredClone(selected),isKirbyCopy:true,copySource:victim.name,
    maxUses,remainingUses,uses:remainingUses,currentCooldown:0};
  kirby.moves.push(copied);
  kirby.kirbyCopiedTargets.push(victimKey);
  return copied;
}
