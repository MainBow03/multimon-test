// Una sola definizione delle alleanze di supporto per zaino, mosse revive e CPU.
// Separa giocatore attivo e proprietario del personaggio scelto: nella Lotta
// Multipla e Roguelike Co-op le cure possono andare a un compagno di squadra.
export function supportTeamPlayers(state,owner,activePlayers){
  const mode=state?.gameMode;
  if(mode==='multipla')
    return ['p1','p2'].includes(owner)?['p1','p2']:['p3','p4'];
  if(mode==='juggernaut'||mode==='survival'||state?.isRoguelikeCoop){
    const jugg=state?.settings?.juggernautPlayer||
      (state?.isRoguelikeCoop?'p4':mode==='survival'?'p2':'p1');
    if(owner===jugg)return [owner];
    const contenders=(activePlayers?.length?activePlayers:Object.keys(state?.teams||{}))
      .filter(p=>p!==jugg && (state?.teams?.[p]||[]).length>0);
    return contenders.includes(owner)?contenders:[owner];
  }
  return [owner];
}

export function legalSupportTargets(state,owner,kind,{fieldOnly=false,activePlayers=[]}={}){
  const allies=supportTeamPlayers(state,owner,activePlayers);
  return allies.flatMap(p=>(state?.teams?.[p]||[]).map((char,idx)=>({player:p,idx,char}))
    .filter(t=>t.char&&!t.char.isSummonOnly&&
      (kind==='revive'?(t.char.hp<=0 && !t.char.echoCorruptedLocked && !t.char.echoSoulPermanentDefeat):t.char.hp>0)&&
      (!fieldOnly||state?.field?.[p]?.includes(t.idx))));
}
export function isLegalSupportTarget(state,owner,targetPlayer,targetIdx,kind,options={}){
  return legalSupportTargets(state,owner,kind,options)
    .some(t=>t.player===targetPlayer&&t.idx===targetIdx);
}
