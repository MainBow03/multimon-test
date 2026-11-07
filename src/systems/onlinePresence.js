// Presence online: scadono automaticamente le sessioni senza heartbeat,
// evitando di mostrare giocatori che hanno chiuso il browser.
export const ONLINE_TIMEOUT_MS=90*1000;
export function visibleOnlinePlayers(sessions,ownSessionId,now=Date.now()){
 const unique=new Map();
 for(const s of sessions||[]){
  if(!s||typeof s.timestamp!=='number'||s.timestamp>now+30000||now-s.timestamp>=ONLINE_TIMEOUT_MS
     ||s.sessionId===ownSessionId||!s.uid||!String(s.name||'').trim())continue;
  const prev=unique.get(s.uid);
  // Un account può avere due schede: la battaglia attiva ha precedenza
  // sulla scheda ferma nel menu, purché entrambe abbiano heartbeat valido.
  const rank=x=>canObserveCampaignPresence(x,now)||x?.status==='⚔️ In Partita'?3:
    x?.status&&x.status!=='Nel Menu'?1:0;
  if(!prev||rank(s)>rank(prev)||(rank(s)===rank(prev)&&s.timestamp>prev.timestamp))
    unique.set(s.uid,s);
 }
 return [...unique.values()].sort((a,b)=>b.timestamp-a.timestamp);
}


// L'attività non dipende solo dalla stanza online: campagne e modalità
// single player sono locali e prima venivano erroneamente segnate "Nel Menu".
export const CAMPAIGN_BATTLE_PHASES=['pre_battle','battling','executing','switching_phase'];
export const isLiveCampaignBattle=(appMode,state)=>
  appMode==='local_room' && state?.isCampaignBattle===true &&
  CAMPAIGN_BATTLE_PHASES.includes(state.status);

export function activityForPresence(appMode,state,roomId){
 if(isLiveCampaignBattle(appMode,state))return '⚔️ Lotta Campagna';
 if(appMode==='campaign_spectate')return '👁️ Osserva una Campagna';
 if(String(appMode||'').startsWith('campaign_'))return '📖 In Campagna';
 if(appMode==='roguelike_coop_lobby')return '🤝 In Co-op';
 if(appMode==='roguelike_map'||appMode==='roguelike_draft')return '🎲 In Roguelike';
 if(appMode==='local_room')return '🎮 In partita locale';
 if(appMode==='vs_cpu')return '🤖 Sfida CPU';
 if(appMode==='survival')return '♾️ Sopravvivenza';
 if(appMode==='online_room' && roomId)return '⚔️ In Partita';
 const names={menu:'Nel Menu',shop:'🛒 Nel Negozio',catalog:'📚 Nel Catalogo',
  stats:'📊 Nelle Statistiche',mastery:'🏅 Nei Prestigi',
  strength_lab:'⚡ Nel Laboratorio',chests:'🎁 Nei Bauli',
  power_chests:'🔮 Nelle Casse',type_chart:'🧬 Tabella Tipi'};
 return names[appMode]||'🎮 Sta giocando';
}

// Esportiamo SOLTANTO lo stato visibile della battaglia: nessun salvataggio,
// moneta, zaino, mossa selezionata, inventario o personaggio in riserva.
// La stanza di campagna rimane locale; queste sono miniature sincronizzate.
const limitedText=(input,max=96)=>String(input||'').slice(0,max);
const finite=(value)=>Number.isFinite(Number(value))?Math.max(0,Math.round(Number(value))):0;
function visibleFighter(char){
 if(!char)return null;
 return {
  id:limitedText(char.id,55),name:limitedText(char.name,64),
  img:limitedText(char.img,480),
  hp:finite(char.hp),maxHp:Math.max(1,finite(char.maxHp)),
  types:Array.isArray(char.types)?char.types.slice(0,2).map(x=>limitedText(x,24)):[],
  statuses:Array.isArray(char.statuses)?char.statuses.slice(0,5).map(s=>limitedText(s?.type,36)):[],
  shield:finite(char.juggHitsRemaining),
  spd:finite(char.spd),
  isJuggernaut:!!char.isJuggernaut,
  isHyper:!!char.isHyper,
  isZodiacSpirit:!!char.isZodiacSpirit,
  zodiacOwner:limitedText(char.zodiacOwner,12),
  mahitoTransformed:!!char.mahitoTransformed,
  imageFilter:limitedText(char.imageFilter||'none',190)
 };
}
export function campaignBattlePublicSnapshot(gameState,{campaignId='',campaignName='',missionName=''}={}){
 if(!gameState?.isCampaignBattle||!CAMPAIGN_BATTLE_PHASES.includes(gameState.status))return null;
 const teamView=role=>{
  const indices=(gameState.field?.[role]||[]).slice(0,6);
  return indices.map(i=>({slot:i,...visibleFighter(gameState.teams?.[role]?.[i])}))
    .filter(c=>c.id);
 };
 const phase=gameState.status;
 const events=Array.isArray(gameState.events)?gameState.events:[];
 return {
  version:1,phase,updatedAt:Date.now(),
  campaignId:limitedText(campaignId,64),
  campaignName:limitedText(campaignName,72),
  missionName:limitedText(missionName,84),
  turn:finite(gameState.battleReport?.turns),
  fieldSize:Math.min(6,finite(gameState.settings?.fieldSize)||1),
  battleWeather:gameState.battleWeather?.type?{
   type:limitedText(gameState.battleWeather.type,28),
   turns:finite(gameState.battleWeather.turns)
  }:null,
  battleTailwind:Object.fromEntries(['p1','p2'].map(role=>
   [role,finite(gameState.battleTailwind?.[role])])),
  playerName:limitedText(gameState.players?.p1||'Squadra',54),
  opponentName:limitedText(gameState.players?.p2||'Avversari',96),
  allies:teamView('p1'),opponents:teamView('p2'),
  // Mostra SOLO gli eventi già eseguiti; niente comandi futuri.
  highlights:events.filter(e=>e?.text && !e?.hidden).slice(-5).map(e=>limitedText(e.text,155))
 };
}

export function canObserveCampaignPresence(entry,now=Date.now()){
 const snapshot=entry?.campaignBattle;
 return !!(entry?.uid&&entry?.sessionId&&snapshot?.version===1&&
  CAMPAIGN_BATTLE_PHASES.includes(snapshot.phase)&&
  typeof entry.timestamp==='number'&&now-entry.timestamp>=0&&now-entry.timestamp<ONLINE_TIMEOUT_MS&&
  typeof snapshot.updatedAt==='number'&&now-snapshot.updatedAt>=0&&now-snapshot.updatedAt<ONLINE_TIMEOUT_MS&&
  Array.isArray(snapshot.allies)&&Array.isArray(snapshot.opponents));
}
