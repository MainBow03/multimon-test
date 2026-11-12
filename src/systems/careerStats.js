// Statistiche carriera: contabilizzazione dai report condivisi delle battaglie.
// Il calcolo del turno può avvenire su un altro dispositivo (host online),
// quindi NON deve mai modificare direttamente il profilo personale.
export const CAREER_BATTLE_LEDGER_LIMIT=400;
const integer=value=>{
  const n=Number(value);
  return Number.isFinite(n)&&n>0?Math.floor(n):0;
};
const cleanName=value=>typeof value==='string'?value.trim():'';
const counter=(value)=>{
  if(!value||typeof value!=='object'||Array.isArray(value))return {};
  const result={};
  for(const [k,v] of Object.entries(value)){
    if(!cleanName(k))continue;
    const n=integer(v);
    if(n>0)result[k]=n;
  }
  return result;
};

// Migra i vecchi conteggi salvati con il NOME in quelli per ID stabile.
// Non azzera, non sostituisce e non inventa utilizzi precedenti.
export function normalizeCareerProfile(profile,characters=[]){
  const chars=counter(profile?.chars),moves=counter(profile?.moves);
  const names=new Map(), ids=new Set();
  for(const char of characters){
    if(!char?.id)continue;
    ids.add(char.id);
    const name=cleanName(char.name);
    if(name){
      const list=names.get(name)||[];
      list.push(char.id);
      names.set(name,list);
    }
  }
  for(const [name,uses] of Object.entries({...chars})){
    if(ids.has(name))continue;
    const matches=names.get(name);
    if(matches?.length!==1)continue;
    const id=matches[0];
    chars[id]=(chars[id]||0)+uses;
    delete chars[name];
  }
  const result={...profile,chars,moves};
  const changed=JSON.stringify(profile?.chars||{})!==JSON.stringify(chars) ||
    JSON.stringify(profile?.moves||{})!==JSON.stringify(moves);
  return {profile:result,changed};
}

const eligibleFighter=char=>!!(char?.id&&!char.isSummonOnly&&!char.isEchoCopy&&
  !char.isEchoCorruptedSoul&&!char.isEchoPuppet&&!char.isZodiacSpirit&&
  !char.isEchoSoulRecalledProjection);
const entryKey=(player,idx)=>player+':'+idx;

// In un match un Multimon conta UNA volta, quando entra realmente in campo.
// Le riserve mai usate, le evocazioni e gli avversari CPU sono esclusi.
export function battleUsageSnapshot({report,teams,player,mode}={}){
  if(!report?.id||!player||!Array.isArray(teams?.[player]))return null;
  const ids=new Set(),moves={};
  const entries=Object.values(report.entries||{}).filter(e=>e?.player===player);
  for(const entry of entries){
    const char=teams[player]?.[entry.idx];
    if(!eligibleFighter(char||entry))continue;
    // turni in campo, rivelato o azioni realmente eseguite.
    if(integer(entry.turnsOnField)>0||char?.revealed||entry.revealed ||
      Object.keys(entry.moveUses||{}).length>0)ids.add(char?.id||entry.id);
    for(const [name,uses] of Object.entries(entry.moveUses||{})){
      const key=cleanName(name);
      if(key&&integer(uses)>0)moves[key]=(moves[key]||0)+integer(uses);
    }
  }
  // All'ingresso in battaglia il report potrebbe non aver ancora visto un
  // turno: il campo iniziale ha gia' marcato i combattenti come revealed.
  for(const char of teams[player])if(eligibleFighter(char)&&char.revealed)ids.add(char.id);
  return {battleId:String(report.id),player,chars:[...ids].sort(),moves,mode:cleanName(mode)||'classica'};
}

// Conserva solo un checkpoint per battaglia e giocatore. Gli snapshot
// successivi incrementano soltanto la differenza positiva: niente doppioni
// dopo refresh, rientro online, aggiornamento Firestore o replay eventi.
export function applyBattleUsageSnapshot(profile,snapshot){
  if(!snapshot?.battleId||!snapshot.player)return {profile,changed:false};
  const key=snapshot.battleId+':'+snapshot.player;
  const previous=profile?.careerBattleLedger&&typeof profile.careerBattleLedger==='object'
    ?profile.careerBattleLedger:{};
  const old=previous[key]||null;
  const oldChars=new Set(old?.chars||[]);
  const oldMoves=counter(old?.moves);
  const currentChars=new Set((snapshot.chars||[]).filter(x=>cleanName(x)));
  const freshChars=[...currentChars].filter(id=>!oldChars.has(id));
  const diffs={};
  for(const [name,value] of Object.entries(counter(snapshot.moves))){
    const n=Math.max(0,value-(oldMoves[name]||0));
    if(n>0)diffs[name]=n;
  }
  const first=!old;
  const changed=first||freshChars.length>0||Object.keys(diffs).length>0;
  if(!changed)return {profile,changed:false};
  const next={...profile,
    chars:{...counter(profile?.chars)},
    moves:{...counter(profile?.moves)},
    careerBattleLedger:{...previous},
    modeMatches:{...counter(profile?.modeMatches)}};
  if(first){
    next.matches=integer(profile?.matches)+1;
    next.modeMatches[snapshot.mode]=(next.modeMatches[snapshot.mode]||0)+1;
  }
  for(const id of freshChars)next.chars[id]=(next.chars[id]||0)+1;
  for(const [name,delta] of Object.entries(diffs))next.moves[name]=(next.moves[name]||0)+delta;
  const previousChars=new Set([...oldChars,...currentChars]);
  const nextMoves={...oldMoves};
  for(const [name,value] of Object.entries(counter(snapshot.moves)))
    nextMoves[name]=Math.max(nextMoves[name]||0,value);
  // Riordina i checkpoint: le partite in corso devono essere tra le più
  // recenti, senza crescere per sempre oltre la quota del cloud.
  delete next.careerBattleLedger[key];
  next.careerBattleLedger[key]={chars:[...previousChars],moves:nextMoves,mode:snapshot.mode};
  const keys=Object.keys(next.careerBattleLedger);
  for(const obsolete of keys.slice(0,Math.max(0,keys.length-CAREER_BATTLE_LEDGER_LIMIT)))
    delete next.careerBattleLedger[obsolete];
  return {profile:next,changed:true};
}

export function careerTopThree(counts,labels={}){
  return Object.entries(counter(counts)).map(([id,count])=>({
    id,name:labels[id]||id,count
  })).sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name,'it')).slice(0,3);
}
