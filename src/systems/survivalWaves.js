// Progressione dedicata a Sopravvivenza. Mai utilizzata nei raid o in Juggernaut.
export const survivalWaveKind=round=>round>0&&round%10===0?'superboss':
  round>0&&round%5===0?'elite':round>0&&round%3===0?'anomaly':'normal';
export const survivalWaveWeather=round=>{
  // Il meteo ogni 3 ondate si somma a élite e superboss (es. 15 e 30).
  if(!Number.isInteger(round)||round<1||round%3!==0)return null;
  return {type:['rainstorm','snowstorm','lush_grass'][Math.floor(round/3)%3],turns:5};
};
export function prepareSurvivalEnemy(base,round){
 if(!base||!Number.isFinite(base.maxHp)||round<1)throw new Error('Nemico Sopravvivenza non valido');
 const enemy=structuredClone(base),kind=survivalWaveKind(round);
 const scale=1+round*.05;
 const hpScale=scale*(kind==='superboss'?1.45:kind==='elite'?1.20:1);
 const attackScale=scale*(kind==='superboss'?1.18:kind==='elite'?1.10:1);
 const defenseScale=scale*(kind==='superboss'?1.12:kind==='elite'?1.07:1);
 enemy.maxHp=Math.max(1,Math.floor(base.maxHp*hpScale));enemy.hp=enemy.maxHp;
 for(const [stat,factor] of [['atk',attackScale],['def',defenseScale],
   ['spAtk',attackScale],['spDef',defenseScale]]){
   if(Number.isFinite(base[stat])){
     enemy[stat]=Math.max(1,Math.floor(base[stat]*factor));
     enemy['base'+stat[0].toUpperCase()+stat.slice(1)]=enemy[stat];
   }
 }
 enemy.baseSpd=enemy.spd;
 enemy.statuses=[];enemy.consecutiveProtect=0;enemy.revealed=true;
 enemy.survivalWaveKind=kind;
 enemy.moves=(base.moves||[]).filter(Boolean).map(m=>({...m,
   remainingUses:m.maxUses??null,currentCooldown:0}));
 if(kind==='elite'||kind==='superboss')
   enemy.imageFilter=kind==='superboss'
     ?'drop-shadow(0 0 25px rgba(244,63,94,1))'
     :'drop-shadow(0 0 18px rgba(250,204,21,.85))';
 return enemy;
}
/** Premi di fine ondata: revive solo su milestone di 5, al massimo uno
 * per l'intera squadra; +25% dopo boss, +10% negli altri round. */
export function recoverSurvivalTeam(teams,field,players,completedRound){
 const healFraction=completedRound%10===0?.25:.10;
 const reviveAvailable=completedRound%5===0;
 let revived=null,healed=0;
 for(const p of players){
   for(const [idx,c] of (teams[p]||[]).entries()){
     if(!c||c.isSummonOnly)continue;
     if(c.hp>0){
       const before=c.hp;
       c.hp=Math.min(c.maxHp,c.hp+Math.floor(c.maxHp*healFraction));
       healed+=c.hp-before;
     }else if(reviveAvailable&&!revived){
       c.hp=Math.max(1,Math.floor(c.maxHp*.20));
       c.statuses=[];
       revived={player:p,index:idx,name:c.name};
     }
   }
 }
 for(const p of players){
   const living=(teams[p]||[]).map((c,i)=>({c,i})).filter(x=>x.c?.hp>0&&!x.c.isSummonOnly);
   const current=(field[p]||[]).filter(i=>teams[p]?.[i]?.hp>0);
   field[p]=current.length?current:living.length?[living[0].i]:[];
 }
 return {healFraction,revived,healed};
}
export function claimSurvivalReward(room,choice){
 if(room?.gameMode!=='survival'||room.status!=='survival_reward'||
   !room.survivalDecision||room.survivalDecision.round!==room.survivalRound ||
   !['heal','power','coins'].includes(choice))
   throw new Error('La scelta per questa ondata non è più disponibile.');
 const boss=room.settings?.juggernautPlayer||'p2';
 const players=Object.keys(room.players||{}).filter(p=>p!==boss&&!room.isBot?.[p]);
 const teams=structuredClone(room.teams),field=structuredClone(room.field);
 let treasury=Number(room.survivalTreasury)||0,buff=1;
 if(choice==='heal'){
   for(const p of players)for(const c of teams[p]||[])
     if(c?.hp>0&&!c.isSummonOnly)c.hp=Math.min(c.maxHp,c.hp+Math.ceil(c.maxHp*.10));
 }else if(choice==='power'){buff=1.10;}
 else treasury+=10;
 for(const p of players){
   const alive=(teams[p]||[]).map((c,i)=>({c,i})).filter(x=>x.c?.hp>0&&!x.c.isSummonOnly);
   if(!(field[p]||[]).some(i=>teams[p]?.[i]?.hp>0))field[p]=alive.length?[alive[0].i]:[];
 }
 return {status:'battling',phaseStartedAt:Date.now(),turnExpiresAt:Date.now()+92000,
   teams,field,events:[],survivalDecision:null,survivalBattleBonus:buff,
   survivalTreasury:treasury,postExecStatus:'battling'};
}
