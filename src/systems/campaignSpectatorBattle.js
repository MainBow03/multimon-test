// Adatta le informazioni visibili della campagna al normale motore grafico
// spettatore di BattlingView. Non importa mai comandi, zaino o progressi.
// Gli slot sono rinumerati perché il pubblico vede solo i Multimon in campo.
const integer=n=>Math.max(0,Math.trunc(Number(n)||0));
export function campaignSnapshotToSpectatorState(snapshot){
 if(!snapshot||!Array.isArray(snapshot.allies)||!Array.isArray(snapshot.opponents))return null;
 const char=(source,i)=>{
  const hp=integer(source.hp);
  const maxHp=Math.max(1,integer(source.maxHp));
  return {
   id:String(source.id||'visible-'+i),name:String(source.name||'Multimon'),
   img:source.img||'',hp:Math.min(hp,maxHp),maxHp,
   types:Array.isArray(source.types)?source.types:[],
   statuses:(source.statuses||[]).map(type=>({type:String(type),turns:1})),
   juggHitsRemaining:integer(source.shield),
   spd:integer(source.spd)||50,
   revealed:true,
   isJuggernaut:Boolean(source.isJuggernaut),
   isHyper:Boolean(source.isHyper),
   isZodiacSpirit:Boolean(source.isZodiacSpirit),
   zodiacOwner:source.zodiacOwner||null,
   mahitoTransformed:Boolean(source.mahitoTransformed),
   imageFilter:source.imageFilter||'none',
   moves:[],passive:null,heldItem:null
  };
 };
 const p1=snapshot.allies.map(char);
 const p2=snapshot.opponents.map(char);
 const roles=['p1','p2','p3','p4','p5','p6','p7','p8'];
 const fields=Object.fromEntries(roles.map(role=>[role,[]]));
 fields.p1=p1.map((_,i)=>i);fields.p2=p2.map((_,i)=>i);
 const teams=Object.fromEntries(roles.map(role=>[role,role==='p1'?p1:role==='p2'?p2:[]]));
 const playerName=String(snapshot.playerName||'Squadra');
 const opponentName=String(snapshot.opponentName||'Avversari');
 return {
  status:snapshot.phase==='executing'?'executing':'battling',
  gameMode:'classica',isCampaignBattle:true,isEchoFinalBattle:false,
  phaseStartedAt:snapshot.updatedAt||Date.now(),
  players:{p1:playerName,p2:opponentName},
  playerAvatars:{p1:p1[0]?.img||'',p2:p2[0]?.img||''},
  playerTitles:{},playerMastery:{},
  isBot:{p1:false,p2:true},
  settings:{fieldSize:Math.max(1,integer(snapshot.fieldSize))},
  teams,field:fields,
  battleReport:{version:1,turns:integer(snapshot.turn),entries:{}},
  battleWeather:snapshot.battleWeather||null,
  battleTailwind:snapshot.battleTailwind||{},fieldTraps:{},fieldTrapSeen:{},
  actions:{p1:{},p2:{}},hyperUsed:{p1:false,p2:false},
  events:[],inventory:{p1:{},p2:{}},
  isRoguelikeCoop:false
 };
}
