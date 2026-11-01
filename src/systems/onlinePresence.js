// Presence online: scadono automaticamente le sessioni senza heartbeat,
// evitando di mostrare giocatori che hanno chiuso il browser.
export const ONLINE_TIMEOUT_MS=90*1000;
export function visibleOnlinePlayers(sessions,ownSessionId,now=Date.now()){
 const unique=new Map();
 for(const s of sessions||[]){
  if(!s||typeof s.timestamp!=='number'||s.timestamp>now+30000||now-s.timestamp>=ONLINE_TIMEOUT_MS
     ||s.sessionId===ownSessionId||!s.uid||!String(s.name||'').trim())continue;
  const prev=unique.get(s.uid);
  if(!prev||s.timestamp>prev.timestamp)unique.set(s.uid,s);
 }
 return [...unique.values()].sort((a,b)=>b.timestamp-a.timestamp);
}
