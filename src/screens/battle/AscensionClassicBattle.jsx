import React,{useEffect,useRef,useState} from 'react';
import {renderBattlingView} from './BattlingView.jsx';
import {PrismaballCapture} from './AscensionView.jsx';
import {AscensionEncounterReveal} from './AscensionEncounterReveal.jsx';
import {ascensionClassicView} from '../../systems/ascensionClassicBattle.js';
import {ascensionFind} from '../../systems/colosseumAscension.js';

// Nessuna seconda interfaccia di combattimento: viene renderizzata letteralmente
// la BattlingView delle sfide CPU, locali, online e delle campagne.
export function AscensionClassicBattle({
 room,role,characters,appMode,battleContext,onAction,onExit,onNextPlayer
}){
 const model=ascensionClassicView(room,role,characters);
 const [revealed,setRevealed]=useState(false);
 const [capture,setCapture]=useState(null);
 const [menu,setMenu]=useState('moves');
 const [targeting,setTargeting]=useState(null);
 const [hovered,setHovered]=useState(null);
 const [isLogOpen,setLogOpen]=useState(false);
 const [busy,setBusy]=useState(false);
 const [playback,setPlayback]=useState('');
 const pressTimer=useRef(null),longPress=useRef(false),logEnd=useRef(null),seenCapture=useRef(null);
 const playbackTimer=useRef(null),previousTurn=useRef(null);
 const e=model?.encounter;
 const nonce=room.ascension?.participants?.[role]?.lastCapture?.nonce;
 useEffect(()=>{
  if(!nonce||seenCapture.current===nonce)return;
  const data=room.ascension?.participants?.[role]?.lastCapture;
  if(data){seenCapture.current=nonce;setCapture(data)}
 },[nonce,role,room.ascension]);
 useEffect(()=>{
  setBusy(false);setTargeting(null);
 },[model?.turn,model?.match?.gameNumber,model?.view?.ascensionCapture?.balls,role]);
 useEffect(()=>{
  if(!model)return;
  if(previousTurn.current===null){previousTurn.current=model.turn;return}
  if(model.turn===previousTurn.current)return;
  previousTurn.current=model.turn;
  const latest=model.log.at(-1);
  if(!latest)return;
  if(playbackTimer.current)clearTimeout(playbackTimer.current);
  setPlayback(String(latest));
  playbackTimer.current=setTimeout(()=>setPlayback(''),750);
 },[model?.turn]);
 useEffect(()=>()=>{
  if(pressTimer.current)clearTimeout(pressTimer.current);
  if(playbackTimer.current)clearTimeout(playbackTimer.current);
 },[]);
 if(!model)return null;
 const {view,duel,spectators,canCommand,log}=model;
 const activePlayer=spectators?'spectator':'p1';
 const submit=async action=>{
  if(!canCommand||busy||spectators)return;
  const type=action?.type;
  if(type!=='attack'&&type!=='switch'&&type!=='ball'&&type!=='flee')return;
  setBusy(true);setTargeting(null);setHovered(null);setMenu('moves');
  try{
   if(type==='attack'){
    const index=Number(action.moveIdx);
    if(!Number.isInteger(index)||index<0)return;
    if(duel)await onAction('duel-move',index);
    else await onAction('encounter',{type:'attack',index});
   }else if(type==='switch'){
    const index=Number(action.toIdx);
    if(!Number.isInteger(index)||index<0)return;
    if(duel)await onAction('duel-switch',{index,fromIdx:Number(action.fromIdx)});
    else await onAction('encounter',{type:'switch',index});
   }else if(!duel){
    await onAction('encounter',{type:type==='ball'?'ball':'flee'});
   }
  }finally{
   setBusy(false);
  }
 };
 const selectTarget=(teamPlayer,fieldIdx)=>{
  if(targeting===null)return;
  submit({type:'attack',moveIdx:targeting,targetPlayer:teamPlayer,targetIdx:view.field?.[teamPlayer]?.[fieldIdx]});
 };
 const ctx={
  ...battleContext,
  gameState:view,appMode,playerRole:activePlayer,
  isEventBattle:true,eventBattleCanForce:false,
  getActivePlayers:()=>['p1','p2'],
  isPlayingEvents:!!playback,displayTeams:view.teams,displayField:view.field,
  commandingIdx:canCommand&&!busy?0:-1,
  combatLog:log.map(line=>({text:String(line),type:'normal'})),
  eventPlaybackPassive:null,eventPlaybackText:playback,screenFlash:false,
  actionMenuMode:menu,setActionMenuMode:setMenu,
  targetingMoveIdx:targeting,setTargetingMoveIdx:setTargeting,
  selectedMultiTargets:[],setSelectedMultiTargets:()=>{},
  hoveredMove:hovered,setHoveredMove:setHovered,
  isLogOpen,setIsLogOpen:setLogOpen,logEndRef:logEnd,
  isLongPressRef:longPress,pressTimerRef:pressTimer,
  pendingHyper:false,setPendingHyper:()=>{},
  commitAction:submit,handleSelectMoveTarget:selectTarget,
  handleForceSkip:()=>{},leaveRoom:onExit,
  timeLeft:NaN,
  onAscensionCapture:()=>submit({type:'ball'}),
  onAscensionFlee:()=>submit({type:'flee'})
 };
 return <>
  {renderBattlingView(ctx)}
  {appMode==='local_room'&&onNextPlayer&&duel&&
   <button type="button" onClick={onNextPlayer} className="fixed right-3 top-3 z-[70] rounded-xl bg-slate-900/95 border border-teal-400/60 text-teal-100 text-xs font-bold px-3 py-2 shadow-lg">
    Cambia giocatore locale ↔
   </button>}
  {e&&!revealed&&<AscensionEncounterReveal encounter={e}
   foe={ascensionFind(characters,e.foeId)||{id:e.foeId,name:e.foeId,img:''}}
   onFinish={()=>setRevealed(true)}/>}
  {capture&&<PrismaballCapture capture={capture}
   foe={ascensionFind(characters,capture.foeId)||{name:capture.foeId,img:''}}
   onFinish={()=>setCapture(null)}/>}
 </>;
}
