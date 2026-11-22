import React,{useEffect,useRef,useState} from 'react';
import {renderBattlingView} from './BattlingView.jsx';
import {renderSwitchingPhaseView} from './SwitchingPhaseView.jsx';
import {getRequiredSwitches} from '../../systems/roomRecovery.js';
import {ascensionNextCommandPosition,ascensionCommandProgress} from '../../systems/ascensionDoubleCommands.js';
import {PrismaballCapture} from './AscensionView.jsx';
import {AscensionEncounterReveal} from './AscensionEncounterReveal.jsx';
import {MOVES_DB} from '../../data/moves.js';
import {ascensionCurrentMatch,ascensionFind} from '../../systems/colosseumAscension.js';
import {
 commitActionImpl,handleSelectMoveTargetImpl,playEventsAnimationImpl
} from '../../systems/battleSystem.js';

// The real CLASSICA room comes straight from the authoritative Firestore
// ascension encounter/match. NO synthetic battle state, NO duplicate move
// executor, NO custom timeline. The same battle controller functions that
// power CPU, local, online and campaign matches handle player input and replay.
export function AscensionClassicBattle({
 room,role,characters,appMode,battleContext,onAction,onExit,onNextPlayer
}){
 const asc=room.ascension,participant=asc?.participants?.[role];
 const match=ascensionCurrentMatch(asc);
 const encounter=asc?.stage==='preparation'?participant?.encounter:null;
 const duel=asc?.stage==='colosseum'&&!!match?.game&&!match?.game?.winner;
 const spectator=duel&&!match.roles.includes(role);
 const side=duel?(spectator?'spectator':match.roles[0]===role?'p1':'p2'):'p1';
 const native=encounter?.classicRoom||(duel?match.game.classicRoom:null);
 const [revealed,setRevealed]=useState(false);
 const [capture,setCapture]=useState(null);
 const [menu,setMenu]=useState('moves');
 const [targeting,setTargeting]=useState(null);
 const [selectedTargets,setSelectedTargets]=useState([]);
 const [hovered,setHovered]=useState(null);
 const [logOpen,setLogOpen]=useState(false);
 const [combatLog,setCombatLog]=useState([]);
 const [,setCommandingIdx]=useState(0);
 // Block the next input until Firestore actually shows the previous action.
 // The original controller optimistically advances, which is not safe for
 // two simultaneous fighters in an online duel.
 const [awaitingAction,setAwaitingAction]=useState(null);
 const [pendingHyper,setPendingHyper]=useState(false);
 const [playing,setPlaying]=useState(false);
 const [playbackText,setPlaybackText]=useState('');
 const [playbackPassive,setPlaybackPassive]=useState(null);
 const [flash,setFlash]=useState(false);
 const [displayTeams,setDisplayTeams]=useState(null);
 const [displayField,setDisplayField]=useState(null);
 const [timeLeft,setTimeLeft]=useState(90);
 const submitting=useRef(false),pressTimer=useRef(null),longPress=useRef(false);
 const logEnd=useRef(null),playbackRef=useRef(null),seenCapture=useRef(null),autoCpuSwitchRef=useRef(null);
 // Il motore classico registra l'Iper solo quando risolve il turno, ma
 // nella finale 2v2 il primo Multimon può averla già prenotata. Solo la
 // VISUALIZZAZIONE considera lo slot consumato; lo stato di battaglia resta
 // autentico e invariato.
 const hyperReserved=!!native&&['p1','p2'].includes(side)&&
  Object.values(native.actions?.[side]||{}).some(action=>action?.hyperize);
 const roomState=!native?native:{
  ...native,
  ...(native.status==='ascension_capture'?{status:'executing'}:{}),
  ...(hyperReserved?{hyperUsed:{...native.hyperUsed,[side]:true}}:{})
 };

 useEffect(()=>{
  if(native||!encounter&&!duel||spectator)return;
  void onAction('native-init');
 },[!!native,!!encounter,!!duel,spectator,role]);

 // A saved action is authoritative; the old local cursor can still be
 // one character ahead during Firestore propagation. Never use it to select
 // a second Multimon's move or overwrite an already submitted command.
 const commandProgress=ascensionCommandProgress(native,side);
 const commandingIdx=awaitingAction||playing||spectator
  ?-1:ascensionNextCommandPosition(native,side);
 useEffect(()=>{
  if(!awaitingAction)return;
  if(!native||native.status!=='battling'||
     native.phaseStartedAt!==awaitingAction.phase||
     native.actions?.[awaitingAction.side]?.[awaitingAction.teamIdx]!==undefined)
   setAwaitingAction(null);
 },[awaitingAction,native?.status,native?.phaseStartedAt,
    native?.actions?.[side]]);

 useEffect(()=>{
  if(!native||native.status!=='battling')return;
  const timer=setInterval(()=>setTimeLeft(Math.max(0,
   Math.ceil(((native.turnExpiresAt||Date.now()+92000)-Date.now())/1000))),900);
  return()=>clearInterval(timer);
 },[native?.phaseStartedAt,native?.status]);

 useEffect(()=>{
  const data=participant?.lastCapture;
  if(!data||!native||native.status!=='ascension_capture')return;
  const key=role+':'+data.nonce;
  if(seenCapture.current===key)return;
  seenCapture.current=key;
  setCapture(data);
 },[participant?.lastCapture?.nonce,native?.status,role]);

 // Recover in-progress rooms from before the CPU-switch fix: if only the
 // computer still has to replace a KO, resolve it without making a human
 // choose a reserve or click the manual unblock button.
 useEffect(()=>{
  if(!native||native.status!=='switching_phase'||spectator)return;
  const needed=getRequiredSwitches(native,['p1','p2']);
  const waitingCpu=['p1','p2'].some(p=>
   native.isBot?.[p] && (needed.need[p]||0)>(needed.valid[p]?.length||0));
  if(!waitingCpu)return;
  const key=String(native.phaseStartedAt)+':'+side;
  if(autoCpuSwitchRef.current===key)return;
  autoCpuSwitchRef.current=key;
  void onAction('native-auto-switch',{phase:native.phaseStartedAt});
 },[native?.status,native?.phaseStartedAt,native?.pendingSwitches?.p1,
    native?.pendingSwitches?.p2,side,spectator]);

 // Replay is literally playEventsAnimationImpl, NOT hand-timed imitations.
 useEffect(()=>{
  if(!native||native.status!=='executing')return;
  const key=side+':'+String(native.phaseStartedAt)+':'+native.events?.length;
  if(playbackRef.current===key)return;
  playbackRef.current=key;
  let cancelled=false;
  const phase=native.phaseStartedAt;
  const advance=()=>!cancelled&&onAction('native-advance',{phase});
  if(!native.events?.length){void advance();return()=>{cancelled=true};}
  void playEventsAnimationImpl({
   appMode:'online_room',gameState:native,getActivePlayers:()=>['p1','p2'],
   playerRole:side,setActionMenuMode:setMenu,setCombatLog,setCommandingIdx,
   setDisplayField,setDisplayTeams,setEventPlaybackPassive:setPlaybackPassive,
   setEventPlaybackText:setPlaybackText,setIsPlayingEvents:setPlaying,
   setPlayerRole:()=>{},setScreenFlash:setFlash,
   updateState:()=>Promise.resolve(),advanceOnlinePhase:advance
  }).then(()=>{
   // Same-snapshot idempotent transition; a p2 guest can recover an absent host.
   if(side!=='p1')void advance();
  });
  return()=>{cancelled=true};
 },[native?.status,native?.phaseStartedAt,side]);

 const commitAction=details=>{
  if(!native||native.status!=='battling'||spectator||submitting.current||
     awaitingAction||commandingIdx<0)return;
  const teamIdx=native.field?.[side]?.[commandingIdx];
  const phase=native.phaseStartedAt;
  return commitActionImpl({
   appMode:'online_room',commandingIdx,ITEMS_DB:battleContext.ITEMS_DB,
   MOVES_DB,
   gameState:native,getActivePlayers:()=>['p1','p2'],
   isSubmittingActionRef:submitting,pendingHyper,playerRole:side,
   setActionMenuMode:setMenu,setCommandingIdx,setPendingHyper,
   setPlayerRole:()=>{},setSelectedMultiTargets:setSelectedTargets,
   setTargetingMoveIdx:setTargeting,
   updateState:patch=>{
    setAwaitingAction({side,teamIdx,phase});
    return onAction('native-commit',{
     actions:patch['actions.'+side],phase
    }).catch(error=>{
     // A rejected transaction MUST not lock the other active Multimon.
     setAwaitingAction(null);
     throw error;
    });
   }
  },details);
 };
 const handleSelectMoveTarget=(targetPlayer,targetFieldIdx)=>{
  if(!native||spectator||awaitingAction||commandingIdx<0||targeting==null)return;
  return handleSelectMoveTargetImpl({
   commandingIdx,commitAction,gameState:native,getActivePlayers:()=>['p1','p2'],
   getTournamentMatchOpponents:()=>[],MOVES_DB,
   pendingHyper,playerRole:side,selectedMultiTargets:selectedTargets,
   setSelectedMultiTargets:setSelectedTargets,targetingMoveIdx:targeting
  },targetPlayer,targetFieldIdx);
 };
 const captureNow=()=>{if(!spectator&&!playing&&native?.status==='battling')
  void onAction('native-capture');};
 const leaveWild=()=>{if(!spectator&&!playing&&native?.status==='battling')
  void onAction('native-flee');};
 const forceSkip=()=>{if(!spectator&&native?.status==='battling')
  void onAction('native-force');};
 const nextCapture=()=>{
  const wasFailed=!!capture&&!capture.success;
  setCapture(null);
  if(wasFailed)void onAction('native-capture-continue');
 };
 if(!native)return <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-10 font-bold text-center">
  Inizializzazione della vera battaglia classica di Multimon…
 </main>;
 if(native.status==='gameover')return <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-10">
  <button className="bg-violet-700 px-6 py-4 rounded-xl font-black" onClick={()=>onAction('native-finalize')}>
   ⚔️ Visualizza il risultato →
  </button>
 </main>;
 const common={
  ...battleContext,gameState:roomState,playerRole:side,
  appMode,gameStateMode:'classica',getActivePlayers:()=>['p1','p2'],
  getTournamentMatchOpponents:()=>[],isEventBattle:true,
  eventBattleCanForce:true,onAscensionCapture:captureNow,
  onAscensionFlee:leaveWild,handleForceSkip:forceSkip,
  isPlayingEvents:playing||native.status==='ascension_capture',
  displayTeams:displayTeams||native.teams,displayField:displayField||native.field,
  eventPlaybackText:playbackText,eventPlaybackPassive:playbackPassive,
  actionMenuMode:menu,setActionMenuMode:setMenu,
  targetingMoveIdx:targeting,setTargetingMoveIdx:setTargeting,
  selectedMultiTargets:selectedTargets,setSelectedMultiTargets:setSelectedTargets,
  hoveredMove:hovered,setHoveredMove:setHovered,
  isLogOpen:logOpen,setIsLogOpen:setLogOpen,logEndRef:logEnd,
  combatLog,commandingIdx,
  isLongPressRef:longPress,pressTimerRef:pressTimer,
  pendingHyper,setPendingHyper,screenFlash:flash,
  commitAction,handleSelectMoveTarget,timeLeft,
  leaveRoom:onExit
 };
 return <>
  {native.status==='switching_phase'
   ?renderSwitchingPhaseView({
     ...common,chooseReplacement:(index,spiritId)=>onAction('native-switch',{index,spiritId}),
     forceCompleteSwitches:()=>onAction('native-force-switch'),
     canForceSwitch:appMode==='local_room'||side==='p1',
     setShowLeaveConfirm:onExit
    })
   :renderBattlingView(common)}
  {awaitingAction&&native.status==='battling'&&
   <div role="status" className="fixed z-[70] bottom-44 inset-x-0 flex justify-center pointer-events-none px-5">
    <div className="rounded-xl border border-cyan-300/70 bg-slate-950/95 text-cyan-100 px-5 py-3 text-sm font-black shadow-2xl text-center">
     ⏳ Conferma del comando {commandProgress.ready+1}/{commandProgress.total}…
    </div>
   </div>}
  {appMode==='local_room'&&onNextPlayer&&duel&&
   <button type="button" onClick={onNextPlayer}
    className="fixed right-3 top-3 z-[70] rounded-xl bg-slate-900/95 border border-teal-400/60 text-teal-100 text-xs font-bold px-3 py-2 shadow-lg">
    Cambia giocatore locale ↔
   </button>}
  {encounter&&!revealed&&<AscensionEncounterReveal encounter={encounter}
   foe={ascensionFind(characters,encounter.foeId)||{id:encounter.foeId,name:encounter.foeId,img:''}}
   onFinish={()=>setRevealed(true)}/>}
  {capture&&<PrismaballCapture capture={capture}
   foe={ascensionFind(characters,capture.foeId)||{name:capture.foeId,img:''}}
   onFinish={nextCapture}/>}
 </>;
}
