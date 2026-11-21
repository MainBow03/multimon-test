// Proietta gli incontri del Colosseo nello stato richiesto dalla VERA
// BattlingView. Il motore/progresso resta nello stato serializzato ascension.
import {ascensionCurrentMatch,ascensionFighter,ascensionFighterFromMember,
  ascensionFind} from './colosseumAscension.js';
import {ascensionNativeFighter} from './ascensionNativeBattle.js';

const hp=n=>Math.max(0,Number(n)||0);
const fighter=(member,chars)=>{
 const result=ascensionFighterFromMember(member,chars);
 return {...result, hp:hp(member.hp), revealed:true, adventureLevel:member.level,
  moves:(result.moves||[]).filter(Boolean),statuses:result.statuses||[], heldItem:null};
};
const activeIndices=(members,count)=>members
 .map((m,index)=>m.hp>0?index:-1).filter(index=>index>=0).slice(0,count);

export function ascensionClassicView(room,role,chars){
 const asc=room?.ascension;
 if(!asc)return null;
 const participant=asc.participants?.[role];
 const encounter=participant?.encounter;
 const match=ascensionCurrentMatch(asc);
 const duel=asc.stage==='colosseum'&&match?.game&&!match.winner;
 if(!encounter&&!duel)return null;
 const spectators=duel&&!match.roles.includes(role);
 const myRole=duel?(spectators?match.roles[0]:role):role;
 const otherRole=duel?match.roles.find(r=>r!==myRole):null;
 const fieldSize=duel&&match.stage==='finale'?2:1;
 let mine,theirs,myActive,enemyActive,turn,log,canCommand,labels,capture=null;
 let commandingIdx=0,spiritSelection=null;
 if(encounter){
  mine=participant.roster.map((member,i)=>ascensionNativeFighter({
   ...member,battleState:encounter.nativeUnits?.p1?.[i]
  },chars));
  const original=ascensionFind(chars,encounter.foeId);
  const enemy=ascensionNativeFighter({
   id:encounter.foeId,level:encounter.foeLevel,hp:encounter.foeHp,
   battleState:encounter.nativeUnits?.p2?.[0]
  },chars);
  enemy.adventureLevel=encounter.foeLevel;
  theirs=[enemy];
  myActive=[encounter.active];
  const isLucy=participant.roster[encounter.active]?.id==='lucy';
  const spiritBase=encounter.spirit?.hp>0
   ?ascensionFind(chars,encounter.spirit.id)
   :isLucy&&encounter.spiritOpen!==false?ascensionFind(chars,'zodiac_aries'):null;
  if(spiritBase?.isSummonOnly){
   const spiritState=encounter.spirit;
   const spirit=ascensionNativeFighter({
    id:spiritBase.id,level:spiritState?.level||participant.roster[encounter.active].level,
    hp:spiritState?.hp||0,
    battleState:encounter.nativeUnits?.p1?.[mine.length]||spiritState?.battleState
   },chars);
   spirit.isZodiacSpirit=true;
   spirit.zodiacOwner='p1';
   spirit.zodiacLucyIdx=encounter.active;
   spirit.revealed=true;
   spirit.adventureLevel=spiritState?.level||participant.roster[encounter.active].level;
   spirit.moves=(spirit.moves||[]).filter(Boolean);
   mine.push(spirit);
   myActive.push(mine.length-1);
  }
  commandingIdx=encounter.pendingReaction?.phase==='spirit'?1:0;
  if(isLucy&&!encounter.pendingReaction&&encounter.spiritOpen!==false){
   spiritSelection={selected:encounter.spirit?.id||'zodiac_aries',canChoose:true};
  }
  enemyActive=[0];
  turn=encounter.turn||1;
  log=encounter.log||[];
  canCommand=encounter.pendingReaction?.phase!=='enemy'&&
   (commandingIdx===1?myActive.length>1&&mine[myActive[1]]?.hp>0:mine[encounter.active]?.hp>0);
  labels={p1:room.players?.[role]||'Allenatore',p2:encounter.kind==='trainer'
   ?'Allenatore '+encounter.trainerName:'Multimon selvatico'};
  if(encounter.kind==='wild')capture={
   balls:participant.prismaballs||0,
   chance:null,
   canCapture:participant.prismaballs>0&&participant.roster.length<9
  };
 }else{
  mine=(match.game.units?.[myRole]||[]).map(member=>ascensionNativeFighter(member,chars));
  theirs=(match.game.units?.[otherRole]||[]).map(member=>ascensionNativeFighter(member,chars));
  myActive=Array.isArray(match.game.field?.[myRole])
   ?match.game.field[myRole].filter(i=>mine[i]?.hp>0)
   :activeIndices(mine,fieldSize);
  enemyActive=Array.isArray(match.game.field?.[otherRole])
   ?match.game.field[otherRole].filter(i=>theirs[i]?.hp>0)
   :activeIndices(theirs,fieldSize);
  turn=match.game.turn||1;
  log=match.game.log||[];
  const commands=match.game.actions?.[myRole]||{};
  commandingIdx=myActive.findIndex(i=>!commands[i]);
  canCommand=!spectators&&commandingIdx>=0&&myActive.length>0;
  labels={p1:room.players?.[myRole]||'Sfidante',p2:room.players?.[otherRole]||'Avversario'};
 }
 const view={
  status:'battling',gameMode:'ascension',
  players:labels,playerAvatars:{},playerTitles:{},
  teams:{p1:mine,p2:theirs},field:{p1:myActive,p2:enemyActive},
  isBot:{p1:spectators,p2:true},
  settings:{teamSize:fieldSize},
  hyperUsed:{p1:true,p2:true},
  actions:{p1:{},p2:{}},inventory:{p1:{},p2:{}},
  battleReport:{turns:Math.max(0,turn-1)},
  battleWeather:encounter?.nativeWeather||match?.game?.weather||{type:'clear',turns:0},
  battleTailwind:encounter?.nativeTailwind||match?.game?.tailwind||{},
  fieldTraps:{},events:[],playerMastery:{},
  isRoguelikeCoop:false,isCampaignBattle:false,isAdventureBattle:false,
  isTrainingBattle:false,isTournamentEvent:false,
  ascensionCapture:capture,
  ascensionSpirit:spiritSelection,
  ascensionEncounterKind:encounter?.kind||null,
  ascensionDuel:!!duel,
  ascensionPlayback:duel?match?.game?.playback||null:encounter?.nativePlayback||null
 };
 return {view,duel:!!duel,spectators,canCommand,commandingIdx,role:myRole,turn,log,
  encounter,match,activeIndex:encounter?.active??myActive[0]??0};
}
