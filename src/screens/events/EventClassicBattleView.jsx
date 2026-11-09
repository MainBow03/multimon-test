import React,{useEffect,useMemo,useRef,useState} from 'react';
import { renderBattlingView } from '../battle/BattlingView.jsx';
import {EventBattleMusic} from './EventBattleMusic.jsx';
import { activeEventFighters } from '../../systems/multiverseEventEngine.js';
import { PLAYER_THEMES,TYPE_STYLES,getMultiplier,getDefaultAvatar } from '../../systems/typeSystem.js';
import { ITEMS_DB } from '../../data/items.js';
import { CHARACTERS } from '../../data/characters.js';

// Il torneo usa LETTERALMENTE il renderer delle lotte normali.
// Solo l'origine dei dati e l'invio delle mosse sono adattati a Firestore.
const roster=Object.fromEntries(CHARACTERS.map(x=>[x.id,x]));
function Icon({size=19,className='',children}) {
 return <span aria-hidden="true" className={className} style={{fontSize:Math.max(14,size*.8)}}>{children||'✦'}</span>;
}
const LogOut=p=><Icon {...p}>↩</Icon>,ScrollText=p=><Icon {...p}>▤</Icon>;
const Loader2=p=><Icon {...p}>◌</Icon>,ChevronRight=p=><Icon {...p}>›</Icon>;
const Target=p=><Icon {...p}>◎</Icon>,Shield=p=><Icon {...p}>⬡</Icon>;
const Trophy=p=><Icon {...p}>🏆</Icon>,XIcon=p=><Icon {...p}>✕</Icon>;
const emptyPlayerMap=()=>Object.fromEntries(['p1','p2','p3','p4','p5','p6','p7','p8'].map(p=>[p,[]]));
function adaptEventBattle(battle,settings,participants,currentUid,perspective){
 const mapping={},roles={},showBFirst=!battle.owners.A.includes(currentUid)
   &&!battle.owners.B.includes(currentUid)&&perspective==='B';
 const first=showBFirst?'B':'A',second=showBFirst?'A':'B';
 const membersA=battle.owners[first]||[],membersB=battle.owners[second]||[];
 membersA.forEach((uid,i)=>{mapping[uid]='p'+(i+1);roles['p'+(i+1)]=uid;});
 membersB.forEach((uid,i)=>{mapping[uid]='p'+(i+1+(settings.doubles?2:1));roles['p'+(i+1+(settings.doubles?2:1))]=uid;});
 const field=emptyPlayerMap(),teams=emptyPlayerMap();
 const players={},avatars={},isBot={},actions={},inventory={},playerMastery={};
 for(const [uid,role] of Object.entries(mapping)){
   const side=battle.owners.A.includes(uid)?'A':'B';
   teams[role]=battle.teams[side].filter(c=>c.owner===uid).map(c=>({
     ...c,isHyper:!!(c.hyper||c.isHyper),mahitoTransformed:!!c.transformed,
     statuses:(c.statuses||[]).map(s=>typeof s==='string'?{type:s}:s),
     revealed:true,moves:(c.moves||[]).map(m=>({
       ...roster[c.id]?.moves?.find(x=>x.name===m.name),...m,
       remainingUses:m.uses??null,maxUses:m.uses??undefined
     }))
   }));
   field[role]=activeEventFighters(battle,side,settings)
     .filter(u=>u.owner===uid).map(u=>teams[role].findIndex(c=>c.key===u.key)).filter(i=>i>=0);
   const participant=participants.find(p=>(p.uid||p.id)===uid);
   players[role]=participant?.name||uid.substring(0,10);
   avatars[role]=participant?.avatar||'';
   playerMastery[role]=participant?.mastery||{};
   isBot[role]=uid.startsWith('bot-');
   actions[role]={};inventory[role]={};
 }
 const role=mapping[currentUid]||'spectator';
 const sameSide=battle.owners.A.includes(currentUid)||battle.owners.B.includes(currentUid);
 return {role,mapping,roles,teams,field,gameState:{
   status:'battling',gameMode:settings.doubles?'multipla':'classica',
   players,playerAvatars:avatars,isBot,field,teams,actions,inventory,playerMastery,
   settings:{fieldSize:settings.fieldSize,allowHyper:settings.allowHyper,
     allowItems:settings.allowItems},
   battleWeather:battle.weather||null,battleTailwind:{},fieldTraps:battle.traps||{},
   isCampaignBattle:false,turnExpiresAt:0,
   hyperUsed:Object.fromEntries(Object.entries(mapping).map(([uid,p])=>[p,!!battle.hyperUsed?.[uid]])),
   events:[]
 },sameSide};
}
function HealthBar(hp,maxHp){
 const pct=Math.max(0,Math.min(100,hp/Math.max(1,maxHp)*100));
 return <div className="w-full h-3 rounded-full bg-black/70 border border-slate-700 overflow-hidden"
   aria-label={hp+' PS su '+maxHp}>
   <div className={'h-full '+(pct>50?'bg-emerald-400':pct>25?'bg-amber-400':'bg-rose-500')}
     style={{width:pct+'%'}}/>
 </div>;
}
export function EventClassicBattleView({battle,settings,participants=[],currentUid,perspective,
  setPerspective,moveDraft,setMoveDraft,submit,busy,hostForce,isHost,onContinue,onMinimize}) {
 const [targetingMoveIdx,setTargetingMoveIdx]=useState(null);
 const [actionMenuMode,setActionMenuMode]=useState('moves');
 const [pendingHyper,setPendingHyper]=useState(false);
 const [selectedMultiTargets,setSelectedMultiTargets]=useState([]);
 const [hoveredMove,setHoveredMove]=useState(null);
 const [isLogOpen,setIsLogOpen]=useState(false);
 const [passiveInfoPopup,setPassiveInfoPopup]=useState(null);
 const [announcement,setAnnouncement]=useState('');
 const [isPlayingEvents,setIsPlayingEvents]=useState(false);
 const [submitted,setSubmitted]=useState(false);
 const logEndRef=useRef(null),isLongPressRef=useRef(false),pressTimerRef=useRef(null);
 const mapping=useMemo(()=>adaptEventBattle(battle,settings,participants,currentUid,perspective),
   [battle,settings,participants,currentUid,perspective]);
 const {role,mapping:roleByUid,gameState}=mapping;
 const owner=battle.side==='both'
  ?(battle.owners.A.includes(currentUid)||battle.owners.B.includes(currentUid))
  :battle.owners[battle.side].includes(currentUid);
 const mySide=battle.owners.A.includes(currentUid)?'A':battle.owners.B.includes(currentUid)?'B':null;
 const currentRole=roleByUid[currentUid];
 const active=owner&&mySide?activeEventFighters(battle,mySide,settings).filter(x=>x.owner===currentUid):[];
 const nextActor=active.find(u=>!moveDraft[u.key]);
 const commandingIdx=nextActor&&currentRole!=null?gameState.field[currentRole].findIndex(
   i=>gameState.teams[currentRole][i]?.key===nextActor.key):-1;
 const isMyTurn=owner&&!submitted&&!battle.finished&&commandingIdx>=0;
 const totalDone=active.length>0&&active.every(u=>moveDraft[u.key]);
 const labelA=battle.owners.A.map(u=>participants.find(p=>(p.uid||p.id)===u)?.name||u.slice(0,8)).join(' & ');
 const labelB=battle.owners.B.map(u=>participants.find(p=>(p.uid||p.id)===u)?.name||u.slice(0,8)).join(' & ');
 useEffect(()=>{
   setSubmitted(false);
   setMoveDraft({});
   setTargetingMoveIdx(null);
   setPendingHyper(false);
   setActionMenuMode('moves');
   setSelectedMultiTargets([]);
 },[battle.matchId,battle.turn]);
 useEffect(()=>{
   if(!battle.log?.length)return;
   setAnnouncement(battle.log.at(-1)||'');
   setIsPlayingEvents(true);
   const timeout=setTimeout(()=>{setIsPlayingEvents(false);setAnnouncement('');},1650);
   return()=>clearTimeout(timeout);
 },[battle.matchId,battle.turn,battle.log?.length]);
 const moveSelection=action=>{
   if(!isMyTurn||!nextActor)return;
   if(action.type==='use_item')return; // il torneo consente strumenti equipaggiati, non le cure dello zaino
   if(action.type==='switch'){
     const unit=gameState.teams[currentRole]?.[action.toIdx];
     if(!unit)return;
     setMoveDraft(v=>({...v,[nextActor.key]:{actor:nextActor.key,type:'switch',switchTo:unit.key}}));
   }else if(action.type==='attack'){
     const tRole=action.targetPlayer;
     const tUnit=gameState.teams[tRole]?.[action.targetIdx];
     const opposite=mySide==='A'?'B':'A';
     const target=tUnit?.key||activeEventFighters(battle,opposite,settings)[0]?.key||null;
     setMoveDraft(v=>({...v,[nextActor.key]:{
       actor:nextActor.key,moveIndex:Number(action.moveIdx)||0,
       target,hyper:!!pendingHyper
     }}));
   }
   setTargetingMoveIdx(null);setPendingHyper(false);setActionMenuMode('moves');
   setSelectedMultiTargets([]);
 };
 const selectTarget=(targetRole,fieldIdx)=>{
   const index=gameState.field[targetRole]?.[fieldIdx];
   if(index===undefined||targetingMoveIdx===null)return;
   moveSelection({type:'attack',moveIdx:targetingMoveIdx,targetPlayer:targetRole,targetIdx:index});
 };
 const send=()=>{
   if(!totalDone||busy||submitted)return;
   setSubmitted(true);
   submit(active.map(u=>moveDraft[u.key]));
 };
 const log=(battle.log||[]).map(text=>({text,type:text.includes(' KO')?'faint':
    text.includes('recupera')?'heal':text.includes('danni')?'damage':'normal'}));
 return <div className="fixed inset-0 z-[130] overflow-y-auto bg-slate-950 text-white"
   aria-label="Combattimento del Torneo del Multiverso">
   <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[160] rounded-full bg-slate-950/95
     border border-fuchsia-500/60 shadow-xl px-4 py-1.5 text-center pointer-events-none
     text-[10px] sm:text-xs text-fuchsia-300 font-black max-w-[65vw] truncate">
      🏆 TORNEO DEL MULTIVERSO · {labelA} VS {labelB}
   </div>
   <button type="button" onClick={onMinimize}
     className="fixed top-2 right-3 z-[180] bg-slate-950/95 border border-cyan-400/70
       rounded-xl px-3 py-2 text-xs font-black text-cyan-200 shadow-xl hover:bg-slate-800"
     title="Riduci solo la visualizzazione: il torneo continua">↘ Riduci vista</button>
   <EventBattleMusic soundtrack={settings.soundtrack} matchId={battle.matchId}/>
   {renderBattlingView({
      ChevronRight,ITEMS_DB,Loader2,LogOut,PLAYER_THEMES,ScrollText,Shield,
      TYPE_STYLES,Target,Trophy,XIcon,actionMenuMode,combatLog:log,
      commandingIdx:isMyTurn?commandingIdx:-1,commitAction:moveSelection,
      displayField:gameState.field,displayTeams:gameState.teams,
      eventPlaybackPassive:null,eventPlaybackText:announcement,
      gameState,getActivePlayers:()=>Object.keys(mapping.roles),
      getDefaultAvatar,getMultiplier,getTournamentMatchOpponents:()=>[],
      handleForceSkip:hostForce,handleSelectMoveTarget:selectTarget,
      hoveredMove,isLogOpen,isLongPressRef,isPlayingEvents,
      leaveRoom:()=>{},logEndRef,pendingHyper,playerRole:role,
      pressTimerRef,renderHealthBar:HealthBar,screenFlash:false,
      selectedMultiTargets,setActionMenuMode,setHoveredMove,setIsLogOpen,
      setPassiveInfoPopup,setPendingHyper,setSelectedMultiTargets,
      setShowLeaveConfirm:()=>{},setTargetingMoveIdx,targetingMoveIdx,timeLeft:90,
      isEventBattle:true,eventBattleCanForce:isHost&&!battle.finished
   })}
   {passiveInfoPopup&&<button className="fixed bottom-24 right-3 z-[165] bg-slate-900
      border border-fuchsia-400 rounded-xl p-3 text-left shadow-xl max-w-xs"
      onClick={()=>setPassiveInfoPopup(null)}>
      <b>{passiveInfoPopup.name}</b>
      <p className="text-xs">{passiveInfoPopup.passive?.name||'Nessuna passiva'}</p>
      <p className="text-xs text-slate-300">{passiveInfoPopup.passive?.desc||''}</p>
      <span className="text-[10px] text-cyan-300">Tocca per chiudere</span>
   </button>}
   {isMyTurn&&totalDone&&!isPlayingEvents&&<div className="fixed z-[165] bottom-4 inset-x-0
     flex justify-center pointer-events-none">
     <div className="pointer-events-auto flex gap-2 bg-slate-950/95 border border-cyan-400/70
       rounded-2xl p-3 shadow-2xl max-w-[94vw]">
       <button className="px-4 py-3 rounded-xl bg-slate-700 font-bold" onClick={()=>setMoveDraft({})}>↩ Cambia mosse</button>
       <button className="px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-black"
          disabled={busy} onClick={send}>⚔️ CONFERMA LE MOSSE</button>
     </div>
   </div>}
   {(submitted||!owner)&&!battle.finished&&<div className="fixed z-[165] bottom-4 left-1/2 -translate-x-1/2
     bg-slate-950/95 border border-slate-700 rounded-2xl p-3 text-center max-w-[94vw] text-xs">
       👁️ {role==='spectator'?'Modalità spettatore':submitted?'Mosse inviate: attendi gli altri sfidanti':'In attesa del turno avversario'}
       {role==='spectator'&&<div className="flex gap-2 mt-2">
         <button className="rounded-lg bg-cyan-800 px-3 py-1.5" onClick={()=>setPerspective('A')}>Vista squadra A</button>
         <button className="rounded-lg bg-rose-800 px-3 py-1.5" onClick={()=>setPerspective('B')}>Vista squadra B</button>
       </div>}
     </div>}
   {battle.finished&&<div className="fixed inset-0 z-[170] flex items-center justify-center
     bg-slate-950/80 backdrop-blur-sm p-5">
     <div className="max-w-lg w-full rounded-3xl border-2 border-amber-400 bg-slate-900
       shadow-2xl text-center p-8 space-y-5">
       <div className="text-5xl">🏆</div>
       <h2 className="text-3xl font-black text-amber-300">Scontro terminato!</h2>
       <p className="text-lg font-bold">Vince {battle.winner==='A'?labelA:labelB}</p>
       {isHost?<button className="w-full rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500
         px-5 py-4 font-black" disabled={busy} onClick={onContinue}>
          Prosegui e mostra il tabellone →
       </button>:<p className="text-sm text-slate-300">In attesa che l’host prosegua al tabellone…</p>}
     </div>
   </div>}
 </div>;
}
