// Proietta gli incontri del Colosseo nello stato richiesto dalla VERA
// BattlingView. Il motore/progresso resta nello stato serializzato ascension.
import {ascensionCurrentMatch,ascensionFighter,ascensionFighterFromMember,
  ascensionFind} from './colosseumAscension.js';

const hp=n=>Math.max(0,Number(n)||0);
const fighter=(member,chars)=>{
 const result=ascensionFighterFromMember(member,chars);
 return {...result, hp:hp(member.hp), revealed:true, adventureLevel:member.level,
  statuses:result.statuses||[], heldItem:null};
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
 if(encounter){
  mine=participant.roster.map(member=>fighter(member,chars));
  const original=ascensionFind(chars,encounter.foeId);
  const enemy=ascensionFighter(original,encounter.foeLevel);
  enemy.hp=hp(encounter.foeHp);
  enemy.revealed=true;
  enemy.adventureLevel=encounter.foeLevel;
  enemy.heldItem=null;
  enemy.statuses=encounter.status?[{type:encounter.status,turns:encounter.statusTurns||1}]:[];
  theirs=[enemy];
  myActive=[encounter.active];
  enemyActive=[0];
  turn=encounter.turn||1;
  log=encounter.log||[];
  canCommand=mine[encounter.active]?.hp>0;
  labels={p1:room.players?.[role]||'Allenatore',p2:encounter.kind==='trainer'
   ?'Allenatore '+encounter.trainerName:'Multimon selvatico'};
  if(encounter.kind==='wild')capture={
   balls:participant.prismaballs||0,
   chance:null,
   canCapture:participant.prismaballs>0&&participant.roster.length<9
  };
 }else{
  mine=(match.game.units?.[myRole]||[]).map(member=>fighter(member,chars));
  theirs=(match.game.units?.[otherRole]||[]).map(member=>fighter(member,chars));
  myActive=activeIndices(mine,fieldSize);
  enemyActive=activeIndices(theirs,fieldSize);
  turn=match.game.turn||1;
  log=match.game.log||[];
  canCommand=!spectators&&!match.game.actions?.[myRole]&&myActive.length>0;
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
  battleWeather:{type:'clear',turns:0},battleTailwind:{},
  fieldTraps:{},events:[],playerMastery:{},
  isRoguelikeCoop:false,isCampaignBattle:false,isAdventureBattle:false,
  isTrainingBattle:false,isTournamentEvent:false,
  ascensionCapture:capture,
  ascensionEncounterKind:encounter?.kind||null,
  ascensionDuel:!!duel
 };
 return {view,duel:!!duel,spectators,canCommand,role:myRole,turn,log,
  encounter,match,activeIndex:encounter?.active??myActive[0]??0};
}
