// Registro di bilanciamento personale basato solo su battaglie CONCLUSE.
// Non confondere correlazione (strumento equipaggiato) con causalità.
export const BALANCE_LEDGER_LIMIT=600;
export const BALANCE_MODE_LABELS=Object.freeze({
 classica:'Classica / vs CPU',multipla:'Multipla 2v2',juggernaut:'Juggernaut',
 survival:'Sopravvivenza',battleroyale:'Battle Royale',torneo:'Torneo',
 torneo_punti:'Torneo a Punti',ultimon:'Ultimon Multimon',
 roguelike_solo:'Roguelike Solo',roguelike_coop:'Roguelike Co-op',campagna:'Campagne'
});
const safe=v=>Math.max(0,Math.floor(Number(v)||0));
const voluntary=new Set(['classica','multipla','juggernaut','battleroyale','torneo','torneo_punti','ultimon']);
export function balanceMode(room){
 if(room?.isCampaignBattle)return 'campagna';
 if(room?.isRoguelikeCoop)return 'roguelike_coop';
 if(room?.isRoguelikeBattle)return 'roguelike_solo';
 return room?.gameMode||'classica';
}
export function balanceBattleSnapshot(room,role,now=Date.now()){
 if(!room?.battleReport?.id||!role||room.isTrainingBattle)return null;
 if(!['gameover','ultimon_result'].includes(room.status))return null;
 const mode=balanceMode(room);
 const own=room.teams?.[role];
 if(!Array.isArray(own)||!room.players?.[role]||room.isBot?.[role])return null;
 let won=false;
 if(mode==='ultimon'){
   const pair=room.ultimon?.pair||[];
   if(!pair.includes(role))return null;
   const other=pair.find(p=>p!==role);
   won=own.some(c=>c.hp>0&&!c.isSummonOnly) &&
     !(room.teams?.[other]||[]).some(c=>c.hp>0&&!c.isSummonOnly);
 }else{
   const winners=typeof room.winner==='string'?room.winner.split(' & '):[];
   won=winners.includes(room.players[role]);
 }
 const entries=Object.values(room.battleReport.entries||{})
   .filter(e=>e?.player===role&&e.id);
 const characters={},moves={},items={},held={};
 for(const e of entries){
   const char=own[e.idx];
   if(!char||char.isSummonOnly||char.isEchoCopy||char.isZodiacSpirit)continue;
   const played=safe(e.turnsOnField)>0||e.revealed||
      Object.keys(e.moveUses||{}).length>0;
   if(played&&voluntary.has(mode)){
     const record=characters[char.id]||{picks:0,wins:0,damage:0,healed:0};
     // Un personaggio schierato vale una sola scelta per battaglia.
     record.picks=1;
     record.wins=won?1:0;
     record.damage+=safe(e.damageDealt);record.healed+=safe(e.healing);
     characters[char.id]=record;
   }
   if(played&&char.heldItem){
     const id=String(char.heldItem);
     held[id]??={matches:0,wins:0};
     held[id].matches+=1;held[id].wins+=won?1:0;
   }
   for(const [name,count] of Object.entries(e.moveUses||{}))
     if(name)moves[name]=(moves[name]||0)+safe(count);
   for(const [id,data] of Object.entries(e.itemUses||{})){
     if(!id)continue;
     items[id]??={uses:0,healed:0};
     items[id].uses+=safe(data.uses);items[id].healed+=safe(data.healed);
   }
 }
 const started=Number(room.battleStartedAt);
 const duration=Number.isFinite(started)&&started>0&&now>=started&&now-started<=86400000
   ?Math.floor((now-started)/1000):null;
 return {id:String(room.battleReport.id)+':'+role,mode,won,
   duration,turns:safe(room.battleReport.turns),characters,moves,items,held};
}
export function recordBalanceSnapshot(profile,snapshot){
 if(!snapshot?.id||!snapshot.mode)return {profile,changed:false};
 const prev=profile?.balanceRegistry||{};
 if(prev.receipts?.[snapshot.id])return {profile,changed:false};
 const receipts={...(prev.receipts||{})};
 receipts[snapshot.id]=1;
 const keys=Object.keys(receipts);
 for(const id of keys.slice(0,Math.max(0,keys.length-BALANCE_LEDGER_LIMIT)))
   delete receipts[id];
 const modes={...(prev.modes||{})};
 const old=modes[snapshot.mode]||{};
 const mode={...old,matches:safe(old.matches)+1,
   wins:safe(old.wins)+(snapshot.won?1:0),
   totalTurns:safe(old.totalTurns)+safe(snapshot.turns),
   timedMatches:safe(old.timedMatches)+(snapshot.duration==null?0:1),
   totalSeconds:safe(old.totalSeconds)+(snapshot.duration==null?0:safe(snapshot.duration)),
   characters:{...(old.characters||{})},moves:{...(old.moves||{})},
   items:{...(old.items||{})},held:{...(old.held||{})}};
 for(const [id,item] of Object.entries(snapshot.characters||{})){
   const old=mode.characters[id]||{};
   mode.characters[id]={picks:safe(old.picks)+safe(item.picks),
     wins:safe(old.wins)+safe(item.wins),damage:safe(old.damage)+safe(item.damage),
     healed:safe(old.healed)+safe(item.healed)};
 }
 for(const [name,count] of Object.entries(snapshot.moves||{}))
   mode.moves[name]=safe(mode.moves[name])+safe(count);
 for(const [id,item] of Object.entries(snapshot.items||{})){
   const old=mode.items[id]||{};
   mode.items[id]={uses:safe(old.uses)+safe(item.uses),
     healed:safe(old.healed)+safe(item.healed)};
 }
 for(const [id,item] of Object.entries(snapshot.held||{})){
   const old=mode.held[id]||{};
   mode.held[id]={matches:safe(old.matches)+safe(item.matches),
     wins:safe(old.wins)+safe(item.wins)};
 }
 modes[snapshot.mode]=mode;
 return {profile:{...profile,balanceRegistry:{version:1,receipts,modes}},changed:true};
}
export function balanceRanking(map={},sort='picks',limit=10){
 return Object.entries(map||{}).map(([id,data])=>({id,...(typeof data==='number'?{uses:data}:data)}))
   .sort((a,b)=>safe(b[sort])-safe(a[sort])||a.id.localeCompare(b.id,'it')).slice(0,limit);
}
