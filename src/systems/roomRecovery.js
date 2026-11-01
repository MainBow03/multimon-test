// Prevenzione soft-lock nelle battaglie multigiocatore.
// Pure helpers: usati dal motore, dai client online e dai test.
export const ROOM_PHASE_TIMEOUT_MS = 120000;
export const ROOM_HOST_TIMEOUT_MS = 45000;
export const ROOM_SESSION_KEY = 'multiverse_rpg_session';
const PLAYER_KEYS = ['p1','p2','p3','p4','p5','p6','p7','p8'];
export const GAME_IN_PROGRESS = ['drafting','pre_battle','battling','executing','switching_phase','intermission'];

export function roomRoleForUid(room,uid){
 if(!uid||!room)return null;
 return PLAYER_KEYS.find(p=>room.players?.[p]&&room.playerUids?.[p]===uid)||null;
}
export function recoverableLegacyRole(room,session,roomId,name,uid){
 if(!room||!session||!uid||!name||session.appMode!=='online_room'
    ||session.roomId!==roomId||!PLAYER_KEYS.includes(session.playerRole)
    ||session.playerRole==='spectator')return null;
 const role=session.playerRole;
 if(room.playerUids?.[role]&&room.playerUids[role]!==uid)return null;
 if(session.playerUid&&session.playerUid!==uid)return null;
 if(room.isBot?.[role]||room.players?.[role]!==name)return null;
 return role;
}
export function findJoinableSlot(room,required){
 if(!room||room.status!=='lobby')return null;
 const max=Math.min(8,Math.max(2,required||4));
 return PLAYER_KEYS.slice(1,max).find(p=>!room.players?.[p]||room.isBot?.[p])||null;
}
const playable=(c)=>c&&c.hp>0&&!c.isSummonOnly;
const fieldSize=(room)=>room.gameMode==='multipla'?1:Math.max(1,Number(room.settings?.fieldSize)||1);
export function getRequiredSwitches(room,players){
 const need={};const valid={};const bench={};const field={};
 for(const p of players){
  const team=room.teams?.[p]||[];
  const seen=new Set();
  const existing=(room.field?.[p]||[]).filter(i=>{
   if(!Number.isInteger(i)||seen.has(i)||!playable(team[i]))return false;
   seen.add(i);return true;
  });
  field[p]=existing;
  bench[p]=team.map((c,i)=>({c,i})).filter(({c,i})=>playable(c)&&!seen.has(i)).map(x=>x.i);
  need[p]=Math.min(Math.max(0,fieldSize(room)-existing.filter(i=>!team[i].isSummonOnly).length),bench[p].length);
  valid[p]=Array.isArray(room.switchActions?.[p])?room.switchActions[p].filter((i,j,arr)=>bench[p].includes(i)&&arr.indexOf(i)===j).slice(0,need[p]):[];
 }
 return {need,valid,bench,field,any:Object.values(need).some(x=>x>0)};
}
export function isHostFresh(room,now=Date.now()){
 const heartbeat=room.hostHeartbeatAt;
 return typeof heartbeat==='number'&&Number.isFinite(heartbeat)&&now-heartbeat<ROOM_HOST_TIMEOUT_MS&&heartbeat<now+30000;
}
export function canRecoverRoom(room,playerRole,now=Date.now()){
 return playerRole==='p1'||(!isHostFresh(room,now) && GAME_IN_PROGRESS.includes(room.status));
}
export function phaseIsStale(room,now=Date.now(),observedAt=null){
 const base=Number.isFinite(room.phaseStartedAt)?room.phaseStartedAt:observedAt;
 return Number.isFinite(base)&&now-base>ROOM_PHASE_TIMEOUT_MS;
}
export function resolveMultiplayerWinner(room,players){
 if(!['classica','multipla'].includes(room.gameMode))return null;
 const alive=p=>(room.teams?.[p]||[]).some(playable);
 const teamA=room.gameMode==='multipla'?['p1','p2']:['p1'];
 const teamB=room.gameMode==='multipla'?['p3','p4']:['p2'];
 if(!teamA.concat(teamB).every(p=>players.includes(p)))return null;
 const a=teamA.some(alive),b=teamB.some(alive);
 if(a&&b)return null;
 return !a&&!b?'Pareggio':room.players?.[(a?teamA:teamB).find(alive)]||'Vittoria';
}
export function prepareEmergencySwitch(room,players,now=Date.now()){
 if(!room||room.status!=='battling')return null;
 const replacement=getRequiredSwitches(room,players);
 if(replacement.any){
  const blank=Object.fromEntries(PLAYER_KEYS.map(p=>[p,0]));
  return {status:'switching_phase',phaseStartedAt:now,
    field:{...(room.field||{}),...replacement.field},
    pendingSwitches:{...blank,...replacement.need},
    switchActions:Object.fromEntries(PLAYER_KEYS.map(p=>[p,[]])),
    actions:Object.fromEntries(PLAYER_KEYS.map(p=>[p,{}]))};
 }
 const winner=resolveMultiplayerWinner(room,players);
 return winner?{status:'gameover',winner,phaseStartedAt:now}:null;
}
export function resolveSwitchingRoom(room,players,now=Date.now(),force=false,applyOnEnter=null){
 if(room?.status!=='switching_phase')return null;
 const r=getRequiredSwitches(room,players);
 const choices={...room.switchActions},need={...room.pendingSwitches};
 let hasChanged=false,allReady=true;
 for(const p of players){
  const intended=r.need[p];
  if(need[p]!==intended)hasChanged=true;
  need[p]=intended;
  const chosen=[...r.valid[p]];
  if((room.isBot?.[p]||force)&&chosen.length<intended){
   for(const i of r.bench[p]){
    if(chosen.length>=intended)break;
    if(!chosen.includes(i)){chosen.push(i);hasChanged=true;}
   }
  }
  if(!Array.isArray(choices[p])||JSON.stringify(choices[p])!==JSON.stringify(chosen))hasChanged=true;
  choices[p]=chosen;
  if(chosen.length<intended)allReady=false;
 }
 const sanitizedField={...(room.field||{}),...r.field};
 if(!allReady){
  return hasChanged?{kind:'updated',patch:{pendingSwitches:need,switchActions:choices,field:sanitizedField}}:{kind:'waiting'};
 }
 // Ogni sostituzione viene applicata UNA SOLA VOLTA: chiamare sotto
 // transazione quando la stanza è online.
 const field=structuredClone(sanitizedField),teams=structuredClone(room.teams||{}),events=[];
 for(const p of players){
  for(const i of choices[p]||[]){
   if(field[p].includes(i)||!playable(teams[p]?.[i]))continue;
   field[p].push(i);teams[p][i].revealed=true;
   events.push({type:'switch',player:p,pos:field[p].length-1,newIdx:i,
     text:teams[p][i].name+' entra in campo dopo il KO!'});
   if(typeof applyOnEnter==='function' && teams[p][i].passive?.type==='on_enter' &&
      (teams[p][i].passiveUses||0)<(teams[p][i].passive.maxUses||1)){
     const ch=teams[p][i];ch.passiveUses=(ch.passiveUses||0)+1;
     applyOnEnter(ch,p,i,teams,field,events,room);
   }
   // La trappola appiccicosa si attiva anche nella sostituzione obbligatoria.
   if(room.fieldTraps?.[p]&&teams[p][i].hp>0){
    const damage=Math.max(1,Math.floor(teams[p][i].maxHp*.1));
    teams[p][i].hp=Math.max(0,teams[p][i].hp-damage);
    events.push({type:'damage',targetPlayer:p,targetIdx:i,newHp:teams[p][i].hp,
      text:'Trappola Segreta: '+teams[p][i].name+' perde '+damage+' PS entrando in campo!'});
    if(!teams[p][i].hp){
      field[p]=field[p].filter(x=>x!==i);
      events.push({type:'faint',text:teams[p][i].name+' è esausto!'});
      events.push({type:'remove',player:p,pos:field[p].length});
    }
   }
  }
 }
 const reset=Object.fromEntries(PLAYER_KEYS.map(p=>[p,0]));
 const resetActions=Object.fromEntries(PLAYER_KEYS.map(p=>[p,[]]));
 const nextRoom={...room,field,teams};
 const winner=resolveMultiplayerWinner(nextRoom,players);
 const post=winner?'gameover':'battling';
 return {kind:'resolved',patch:{
   field,teams,startOfTurnTeams:structuredClone(room.teams||{}),
   startOfTurnField:structuredClone(sanitizedField),
   fieldTrapSeen:Object.fromEntries(Object.keys(field).map(p=>[p,[...field[p]]])),
   status:events.length?'executing':post,
   postExecStatus:events.length?post:null,events,
   pendingSwitches:reset,switchActions:resetActions,
   ...(winner?{winner}:{}),
   phaseStartedAt:now,turnExpiresAt:now+92000
 }};
}
export function nextPhaseAfterExecution(room,players,now=Date.now()){
 if(room?.status!=='executing')return null;
 let post=room.postExecStatus||'battling';
 const replacement=getRequiredSwitches(room,players);
 if(post!=='gameover'&&post!=='intermission'&&replacement.any)post='switching_phase';
 const winner=post==='battling'?resolveMultiplayerWinner(room,players):null;
 if(winner)post='gameover';
 return {status:post,events:[],phaseStartedAt:now,
   ...(post==='switching_phase'?{
     pendingSwitches:{...room.pendingSwitches,...replacement.need},
     switchActions:Object.fromEntries(PLAYER_KEYS.map(p=>[p,(room.switchActions?.[p]||[])]))
   }:{}),
   ...(winner?{winner}:{}),
   ...(post==='battling'?{turnExpiresAt:now+92000}:{})};
}
