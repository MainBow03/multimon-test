import React,{useEffect,useRef,useState} from 'react';
import {renderBattlingView} from './BattlingView.jsx';
import {PrismaballCapture} from './AscensionView.jsx';
import {AscensionEncounterReveal} from './AscensionEncounterReveal.jsx';
import {ZodiacSpiritPicker} from '../../components/ZodiacSpiritPicker.jsx';
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
 const [showSpirits,setShowSpirits]=useState(false);
 const [menu,setMenu]=useState('moves');
 const [targeting,setTargeting]=useState(null);
 const [hovered,setHovered]=useState(null);
 const [isLogOpen,setLogOpen]=useState(false);
 const [busy,setBusy]=useState(false);
 const [playback,setPlayback]=useState('');
 const pressTimer=useRef(null),longPress=useRef(false),logEnd=useRef(null),seenCapture=useRef(null);
 const playbackTimer=useRef(null);
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
 // Il motore invia PRIMA l'azione del giocatore: la risposta del nemico
 // deve essere calcolata solo dopo che il giocatore ha visto il filmato.
 const pendingNonce=e?.pendingReaction?.nonce||null;
 const pendingPhase=e?.pendingReaction?.phase||null;
 const pendingReason=e?.pendingReaction?.reason||null;
 const reactionNonce=e?.lastReaction?.nonce||null;
 useEffect(()=>{
  if(!pendingNonce||pendingReason==='ball')return;
  const text=e?.pendingReaction?.text||'Il turno continua...';
  setPlayback(text);
  const timer=setTimeout(()=>{
   setPlayback('');
   if(pendingPhase==='enemy')void onAction('encounter-reaction');
  },pendingPhase==='spirit'?1450:1600);
  return ()=>clearTimeout(timer);
 },[pendingNonce,pendingPhase,pendingReason,role]);
 useEffect(()=>{
  if(!reactionNonce)return;
  setPlayback(e?.lastReaction?.text||'Il nemico ha agito!');
  const timer=setTimeout(()=>setPlayback(''),1800);
  return ()=>clearTimeout(timer);
 },[reactionNonce,role]);
 useEffect(()=>()=>{
  if(pressTimer.current)clearTimeout(pressTimer.current);
  if(playbackTimer.current)clearTimeout(playbackTimer.current);
 },[]);
 if(!model)return null;
 const {view,duel,spectators,canCommand,commandingIdx,log}=model;
 const activePlayer=spectators?'spectator':'p1';
 // Replay nativo: eventi del medesimo motore usato in tutte le altre modalità.
 const nativePlayback=view.ascensionPlayback;
 const nativePlaybackNonce=nativePlayback?.nonce||0;
 useEffect(()=>{
  if(!duel||!nativePlaybackNonce)return;
  const events=(nativePlayback.events||[]).filter(evt=>evt?.text);
  let index=0;
  const timer=setInterval(()=>{
   if(index>=events.length){setPlayback('');clearInterval(timer);return;}
   setPlayback(String(events[index++].text));
  },events.length>15?420:850);
  return ()=>clearInterval(timer);
 },[duel,nativePlaybackNonce]);
 const submit=async action=>{
  if(!canCommand||busy||spectators)return;
  const type=action?.type;
  if(type!=='attack'&&type!=='switch'&&type!=='ball'&&type!=='flee')return;
  setBusy(true);setTargeting(null);setHovered(null);setMenu('moves');
  try{
   if(type==='attack'){
    const index=Number(action.moveIdx);
    if(!Number.isInteger(index)||index<0)return;
    if(duel)await onAction('duel-move',{type:'attack',index,
     fromIdx:view.field?.p1?.[commandingIdx],
     targetIdx:Number.isInteger(action.targetIdx)?action.targetIdx:null});
    else await onAction('encounter',{type:'attack',index,
     source:commandingIdx===1?'spirit':'hero'});
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
  commandingIdx:canCommand&&!busy?commandingIdx:-1,
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
  {view.ascensionSpirit?.canChoose&&!duel&&
   <div className="fixed top-[76px] right-3 z-[75] flex flex-col items-end gap-2 max-w-[min(95vw,420px)]">
    <button type="button" onClick={()=>setShowSpirits(prev=>!prev)}
     className="rounded-xl border border-amber-400 bg-gradient-to-r from-violet-950 to-amber-900 text-amber-100 shadow-[0_0_25px_rgba(250,204,21,.3)] px-3 py-2 text-xs font-black">
     ✨ Spirito Stellare: {view.teams.p1.find(c=>c.isZodiacSpirit)?.name||'Aries'} · Cambia chiave
    </button>
    {showSpirits&&<div className="w-full max-h-[65dvh] overflow-y-auto rounded-xl bg-slate-950/90 p-2 shadow-2xl">
     <ZodiacSpiritPicker compact value={view.ascensionSpirit.selected}
      onChange={id=>{void onAction('encounter-spirit',id);setShowSpirits(false)}}/>
    </div>}
   </div>}
  {e?.pendingReaction?.phase==='spirit'&&!playback&&
   <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[75] text-xs font-black text-amber-100 bg-violet-950/90 border border-amber-400 rounded-lg px-3 py-2 shadow-lg">
    ✨ Ora scegli la mossa dello Spirito Stellare!
   </div>}
  {e?.pendingReaction?.phase==='enemy'&&e.pendingReaction.reason==='ball'&&!capture&&
   <button type="button" onClick={()=>{setPlayback('');void onAction('encounter-reaction')}}
    className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[80] rounded-xl bg-gradient-to-r from-rose-700 to-orange-600 border border-amber-200 px-5 py-3 font-black text-white shadow-2xl">
    ⚔️ Il selvatico reagisce · Continua →
   </button>}
  {e&&!revealed&&<AscensionEncounterReveal encounter={e}
   foe={ascensionFind(characters,e.foeId)||{id:e.foeId,name:e.foeId,img:''}}
   onFinish={()=>setRevealed(true)}/>}
  {capture&&<PrismaballCapture capture={capture}
   foe={ascensionFind(characters,capture.foeId)||{name:capture.foeId,img:''}}
   onFinish={()=>{const failed=!capture.success;setCapture(null);
    if(failed){setPlayback('💎 La cattura è fallita... il selvatico sta per attaccare!');
      void onAction('encounter-reaction');}}}/>}
 </>;
}
