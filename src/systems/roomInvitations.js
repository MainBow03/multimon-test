// Vetrina pubblica delle stanze create dal menu. Le stanze private
// continuano ad essere raggiungibili SOLO inserendo il codice manualmente.
const LIVE_MS=90_000;
const MAX_AGE_MS=60*60*1000;
export function roomInvitationCapacity(room){
  if(room?.isRoguelikeCoop)return 3;
  const mode=room?.gameMode||'classica';
  if(mode==='classica')return 2;
  if(mode==='ultimon')return Math.min(8,Math.max(4,Number(room.settings?.maxPlayers)||4));
  if(['torneo_punti','battleroyale','juggernaut','survival'].includes(mode))
    return Math.min(8,Math.max(2,Number(room.settings?.maxPlayers)||4));
  return 4;
}
export function visibleRoomInvitations(rows,uid,now=Date.now()){
  if(!Array.isArray(rows))return [];
  return rows.filter(r=>{
    if(!r||!r.code||r.publicInvite!==true||r.status!=='lobby'||r.isRoguelikeCoop)return false;
    if(typeof r.createdAt!=='number'||r.createdAt>now+30000||now-r.createdAt>MAX_AGE_MS)return false;
    if(typeof r.hostHeartbeatAt!=='number'||r.hostHeartbeatAt>now+30000||now-r.hostHeartbeatAt>LIVE_MS)return false;
    if(uid&&Object.values(r.playerUids||{}).includes(uid))return false;
    const slots=Object.keys(r.players||{}).filter(k=>r.players[k]&&/^p[1-8]$/.test(k));
    return slots.length<roomInvitationCapacity(r);
  }).sort((a,b)=>b.createdAt-a.createdAt).slice(0,12).map(r=>({
    code:String(r.code).toUpperCase(),
    name:String(r.roomName||'Arena del Multiverso').slice(0,48),
    host:String(r.players?.p1||'Giocatore').slice(0,36),
    gameMode:String(r.gameMode||'classica'),
    joined:Object.keys(r.players||{}).filter(k=>r.players[k]&&/^p[1-8]$/.test(k)).length,
    capacity:roomInvitationCapacity(r),
    createdAt:r.createdAt
  }));
}
export const roomModeLabel=mode=>({classica:'Sfida Classica',multipla:'Lotta Multipla',
  juggernaut:'Juggernaut',survival:'Sopravvivenza',torneo:'Torneo',
  torneo_punti:'Torneo a Punti',battleroyale:'Battle Royale',ultimon:'Ultimon Multimon'}[mode]||'Battaglia online');
