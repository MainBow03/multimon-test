import React,{useEffect,useMemo,useRef,useState} from 'react';
import {renderBattlingView} from '../battle/BattlingView.jsx';
import {adaptTournamentToClassic} from '../../systems/standardEventTurn.js';
import {activeEventFighters} from '../../systems/multiverseEventEngine.js';
import {handleSelectMoveTargetImpl} from '../../systems/battleSystem.js';
import {applySummonPlaybackEvent} from '../../systems/battleSummonPlayback.js';
import {renderHealthBarImpl} from '../../components/uiHelpers.jsx';
import {ChevronRight,Loader2,LogOut,ScrollText,Shield,Target,Trophy,XIcon} from '../../components/BattleIcons.jsx';
import {PLAYER_THEMES,TYPE_STYLES,getDefaultAvatar,getMultiplier} from '../../systems/typeSystem.js';
import {ITEMS_DB} from '../../data/items.js';
import {MOVES_DB} from '../../data/moves.js';
import {EventBattleMusic} from './EventBattleMusic.jsx';

// Controller Firestore: l'ARENA è sempre e soltanto BattlingView.jsx.
// Nessun secondo layout, barra delle mosse o bottone di conferma propri del torneo.
export function StandardTournamentBattle({
 battle,settings,participants=[],currentUid,moveDraft,setMoveDraft,
 submit,busy,hostForce,isHost,onContinue,onMinimize,ownMasteryLevels={}
}){
 const [actionMenuMode,setActionMenuMode]=useState('moves');
 const [targetingMoveIdx,setTargetingMoveIdx]=useState(null);
 const [selectedMultiTargets,setSelectedMultiTargets]=useState([]);
 const [pendingHyper,setPendingHyper]=useState(false);
 const [hoveredMove,setHoveredMove]=useState(null);
 const [isLogOpen,setIsLogOpen]=useState(false);
 const [passiveInfoPopup,setPassiveInfoPopup]=useState(null);
 const [submitted,setSubmitted]=useState(false);
 const [playbackRound,setPlaybackRound]=useState(null);
 const [playbackFrame,setPlaybackFrame]=useState(null);
 const [isPlayingEvents,setIsPlayingEvents]=useState(false);
 const [eventPlaybackText,setEventPlaybackText]=useState('');
 const [eventPlaybackPassive,setEventPlaybackPassive]=useState(null);
 const [screenFlash,setScreenFlash]=useState(false);
 const isLongPressRef=useRef(false),pressTimerRef=useRef(null),logEndRef=useRef(null);
 const lastSubmissionRef=useRef('');
 const converted=useMemo(()=>adaptTournamentToClassic(battle,settings),[battle,settings]);
 const {roles,byRole}=converted;
 const playerRole=roles[currentUid]||'spectator';
 const userSide=battle.owners.A.includes(currentUid)?'A':battle.owners.B.includes(currentUid)?'B':null;
 const active=userSide?activeEventFighters(battle,userSide,settings).filter(c=>c.owner===currentUid&&c.hp>0):[];
 const members=Object.fromEntries(participants.map(p=>[p.uid||p.id,p]));
 const gameState=useMemo(()=>{
  const players={},playerAvatars={},playerTitles={},playerMastery={},isBot={};
  for(const [role,uid] of Object.entries(byRole)){
   const participant=members[uid];
   players[role]=participant?.name||uid;
   playerAvatars[role]=participant?.avatar||'';
   playerTitles[role]=participant?.title||'';
   playerMastery[role]=participant?.mastery||{};
   isBot[role]=!!participant?.bot||uid.startsWith('bot-');
  }
  return {...converted.gameState,players,playerAvatars,playerTitles,playerMastery,isBot,
   status:isPlayingEvents?'executing':'battling',
   isTournamentEvent:true,events:battle.playback?.events||[],
   fieldTraps:battle.traps||{},battleWeather:battle.weather||null,
   battleTailwind:battle.tailwind||{}};
 },[converted,battle,participants,isPlayingEvents]);
 const canCommand=!submitted&&!busy&&!isPlayingEvents&&playbackRound===battle.turn&&!battle.finished&&!!userSide;
 const nextActor=canCommand?active.find(c=>!moveDraft[c.key]):null;
 const commandingIdx=nextActor?gameState.field[playerRole]?.findIndex(i=>
    gameState.teams[playerRole]?.[i]?.key===nextActor.key)??-1:-1;
 const roundKey=battle.matchId+':'+battle.turn;
 const allSelected=active.length>0&&active.every(c=>moveDraft[c.key]);
 const opposing=(userSide==='A'?'B':'A');
 const log=(battle.log||[]).map(text=>({text,
    type:/esausto| KO\b/i.test(text)?'faint':
      /recupera|cura\b/i.test(text)?'heal':
      /danni|colpisce/i.test(text)?'damage':'normal'}));

 useEffect(()=>{
  setSubmitted(false);lastSubmissionRef.current='';
  setMoveDraft({});setActionMenuMode('moves');setPendingHyper(false);
  setTargetingMoveIdx(null);setSelectedMultiTargets([]);setHoveredMove(null);
 },[battle.matchId,battle.turn,setMoveDraft]);

 // Stessa sequenza delle animazioni della battaglia standard: evento per evento,
 // con snapshot di inizio turno, trasformazioni, KO, HP, status e sostituzioni.
 useEffect(()=>{
  const playback=battle.playback;
  if(!playback||playback.turn!==battle.turn||!playback.startTeams||!playback.startField){
   setPlaybackFrame(null);setIsPlayingEvents(false);setEventPlaybackText('');
   setEventPlaybackPassive(null);setPlaybackRound(battle.turn);
   return;
  }
  let stopped=false,timer;
  let frame={teams:structuredClone(playback.startTeams),field:structuredClone(playback.startField)};
  setPlaybackFrame(frame);setIsPlayingEvents(true);setPlaybackRound(null);
  const wait=ms=>new Promise(resolve=>{timer=setTimeout(resolve,ms)});
  const replay=async()=>{
   try{
    for(const evt of playback.events||[]){
     if(stopped)return;
     if(evt.type==='battle_actor'||evt.type==='battle_actor_end')continue;
     setEventPlaybackText(evt.text||'');
     setEventPlaybackPassive(evt.isPassive?{char:evt.passiveChar,name:evt.passiveName}:null);
     if(evt.type==='summon'){
      frame=applySummonPlaybackEvent(frame,evt);
     }else if(evt.type==='damage'&&frame.teams[evt.targetPlayer]?.[evt.targetIdx]){
      frame.teams[evt.targetPlayer][evt.targetIdx].hp=evt.newHp;
     }else if(evt.type==='status_update'&&frame.teams[evt.targetPlayer]?.[evt.targetIdx]){
      frame.teams[evt.targetPlayer][evt.targetIdx].statuses=evt.statuses;
     }else if(evt.type==='hyper_transform'&&frame.teams[evt.player]?.[evt.charTeamIdx]){
      frame.teams[evt.player][evt.charTeamIdx].isHyper=true;
      setScreenFlash(true);
     }else if(evt.type==='switch'&&frame.field[evt.player]){
      frame.field[evt.player][evt.pos]=evt.newIdx;
     }else if(evt.type==='remove'&&frame.field[evt.player]){
      frame.field[evt.player].splice(evt.pos,1);
     }else if(evt.type==='revive_to_field'&&frame.field[evt.player]){
      if(!frame.field[evt.player].includes(evt.targetIdx))frame.field[evt.player].push(evt.targetIdx);
     }else if(evt.type==='moves_update'&&frame.teams[evt.targetPlayer]?.[evt.targetIdx]){
      frame.teams[evt.targetPlayer][evt.targetIdx].moves=evt.moves;
     }
     setPlaybackFrame({teams:{...frame.teams},field:{...frame.field}});
     await wait(evt.type==='hyper_transform'?4500:evt.isPassive?2200:1600);
     if(stopped)return;
     setScreenFlash(false);
    }
   }finally{
    if(!stopped){
     setIsPlayingEvents(false);setPlaybackFrame(null);
     setEventPlaybackText('');setEventPlaybackPassive(null);setScreenFlash(false);
     setPlaybackRound(battle.turn);
    }
   }
  };
  replay().catch(err=>{if(!stopped){console.error('Playback torneo:',err);setIsPlayingEvents(false);setPlaybackRound(battle.turn)}});
  return()=>{stopped=true;clearTimeout(timer)};
 },[battle.matchId,battle.turn]);

 const commitAction=action=>{
  if(!nextActor||commandingIdx<0||action.type==='use_item')return;
  let command;
  if(action.type==='switch'){
   const incoming=gameState.teams[playerRole]?.[action.toIdx];
   if(!incoming||incoming.hp<=0||gameState.field[playerRole]?.includes(action.toIdx))return;
   command={actor:nextActor.key,type:'switch',switchTo:incoming.key,zodiacSpiritId:action.zodiacSpiritId};
  }else if(action.type==='attack'){
   const selected=(action.selectedTargets||[]).map(t=>gameState.teams[t.player]?.[t.idx]?.key).filter(Boolean);
   const selectedTarget=gameState.teams[action.targetPlayer]?.[action.targetIdx];
   const enemy=activeEventFighters(battle,opposing,settings).find(c=>c.hp>0);
   command={actor:nextActor.key,moveIndex:Number(action.moveIdx)||0,
    target:selectedTarget?.key||(selected[0]||enemy?.key||nextActor.key),
    ...(selected.length?{selectedTargets:selected}:{}),
    hyper:!!pendingHyper};
  }else return;
  setMoveDraft(prev=>({...prev,[nextActor.key]:command}));
  setActionMenuMode('moves');setTargetingMoveIdx(null);
  setSelectedMultiTargets([]);setPendingHyper(false);
 };
 const handleSelectMoveTarget=(targetPlayer,fieldIdx)=>
  handleSelectMoveTargetImpl({
   commandingIdx,commitAction,gameState,getActivePlayers:()=>Object.keys(byRole),
   getTournamentMatchOpponents:()=>[],MOVES_DB,pendingHyper,playerRole,
   selectedMultiTargets,setSelectedMultiTargets,targetingMoveIdx
  },targetPlayer,fieldIdx);

 // Il normale click sulle mosse è già una conferma: niente secondo pulsante
 // "CONFERMA LE MOSSE", che esisteva soltanto nel vecchio stile del torneo.
 useEffect(()=>{
  if(!canCommand||!allSelected||lastSubmissionRef.current===roundKey)return;
  lastSubmissionRef.current=roundKey;setSubmitted(true);
  Promise.resolve(submit(active.map(c=>moveDraft[c.key])))
   .then(ok=>{if(ok===false){lastSubmissionRef.current='';setSubmitted(false)}})
   .catch(err=>{lastSubmissionRef.current='';setSubmitted(false);console.error('Invio mosse:',err)});
 },[canCommand,allSelected,roundKey,active.map(c=>c.key).join(','),moveDraft,submit]);

 const battleView=renderBattlingView({
  ownMasteryLevels,ChevronRight,ITEMS_DB,Loader2,LogOut,
  PLAYER_THEMES,ScrollText,Shield,TYPE_STYLES,Target,Trophy,XIcon,
  appMode:'online_room',actionMenuMode,combatLog:log,commandingIdx,
  commitAction,displayField:playbackFrame?.field||gameState.field,
  displayTeams:playbackFrame?.teams||gameState.teams,
  eventPlaybackPassive,eventPlaybackText,gameState,
  getActivePlayers:()=>Object.keys(byRole),getDefaultAvatar,getMultiplier,
  getTournamentMatchOpponents:()=>[],handleForceSkip:hostForce,
  handleSelectMoveTarget,hoveredMove,isLogOpen,isLongPressRef,isPlayingEvents,
  leaveRoom:onMinimize,logEndRef,pendingHyper,playerRole,pressTimerRef,
  renderHealthBar:(hp,max)=>renderHealthBarImpl({},hp,max),
  screenFlash,selectedMultiTargets,setActionMenuMode,setHoveredMove,
  setIsLogOpen,setPassiveInfoPopup,setPendingHyper,setSelectedMultiTargets,
  setShowLeaveConfirm:()=>{},setTargetingMoveIdx,targetingMoveIdx,
  timeLeft:null,isEventBattle:true,eventBattleCanForce:isHost&&!battle.finished
 });

 const winners=battle.winner==='A'?battle.owners.A:battle.owners.B;
 return <div className="fixed inset-0 z-[130] bg-slate-950 text-white">
  {battleView}
  <EventBattleMusic soundtrack={settings.soundtrack} matchId={battle.matchId}/>
  {passiveInfoPopup&&<button type="button" className="fixed right-3 bottom-28 z-[175] rounded-xl border border-fuchsia-400 bg-slate-950 p-4 text-left shadow-xl max-w-xs" onClick={()=>setPassiveInfoPopup(null)}>
   <b>{passiveInfoPopup.name}</b>
   <p className="text-sm text-amber-200">{passiveInfoPopup.passive?.name||'Nessuna passiva'}</p>
   <p className="text-xs text-slate-300">{passiveInfoPopup.passive?.desc||''}</p>
   <small className="text-cyan-300">Tocca per chiudere</small>
  </button>}
  {battle.finished&&!isPlayingEvents&&playbackRound===battle.turn&&<div className="fixed inset-0 z-[180] flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-5">
   <section className="w-full max-w-lg rounded-3xl border-2 border-amber-400 bg-slate-900 p-8 text-center space-y-5 shadow-2xl" role="status">
    <div className="text-6xl">🏆</div>
    <h2 className="text-3xl font-black text-amber-300">Scontro terminato!</h2>
    <p className="text-lg text-white font-bold">Vince {winners.map(uid=>members[uid]?.name||uid).join(' & ')}</p>
    {isHost?<button type="button" disabled={busy} onClick={onContinue} className="w-full rounded-xl bg-fuchsia-600 px-5 py-4 font-black hover:bg-fuchsia-500">
     Prosegui al tabellone →</button>
     :<p className="text-sm text-slate-300">In attesa che l'host prosegua al tabellone…</p>}
   </section>
  </div>}
 </div>;
}
