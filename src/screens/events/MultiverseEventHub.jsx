import React, {useState,useEffect,useRef,useMemo} from 'react';
import { CHARACTERS } from '../../data/characters.js';
import { EventClassicBattleView } from './EventClassicBattleView.jsx';
import { ITEMS_DB } from '../../data/items.js';
import { HELD_ITEM_IDS } from '../../systems/heldEquipment.js';
import { normalizeEventSettings,validTeam,makeEventEntrants,makeEventBracket,nextEventMatch,buildEventBattle,activeEventFighters,
 botActions,eventTurn,completeEventMatch,eventPlacements,simulateBots,EVENT_PRIZES,isLiveEvent,EVENT_INACTIVITY_MS } from '../../systems/multiverseEventEngine.js';
import {watchEvents,watchEvent,watchPlayers,watchCommands,createEvent,joinEvent,saveTeam,sendMoves,hostUpdate,heartbeatEvent,cancelAndPurgeEvent,purgeStaleEvent} from '../../firebase/multiverseEvents.js';

const available=CHARACTERS.filter(c=>!c.isSummonOnly&&!c.isSecretUnlock);
const index=Object.fromEntries(CHARACTERS.map(c=>[c.id,c]));
const btn='rounded-xl px-4 py-2.5 font-black bg-violet-600 hover:bg-violet-500 disabled:opacity-35 disabled:cursor-not-allowed';
const gray='rounded-xl px-4 py-2.5 font-bold bg-slate-800 border border-slate-700 hover:bg-slate-700';
const inp='w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white';
const card='rounded-2xl border border-slate-700 bg-slate-900/90 p-4';

// Bracket con abbinamenti ben visibili, avanzamento e collegamenti fra turni.
function Bracket({matches,current}){
 const levels=[...new Set(matches.map(m=>m.round))].sort((a,b)=>a-b);
 const cardFor=(m,round)=> <div key={m.id}
   className={`relative w-60 shrink-0 overflow-visible rounded-2xl border-2 p-3 shadow-xl transition-all ${current===m.id?'border-fuchsia-400 bg-fuchsia-950/90 ring-2 ring-fuchsia-400/40':'border-slate-700 bg-slate-950/95'}`}>
   <div className="flex justify-between gap-2 text-[10px] font-black uppercase tracking-widest text-amber-300 mb-2">
     <span>{m.stage==='bronze'?'🥉 TERZO POSTO':m.stage==='final'?'🏆 FINALISSIMA':'⚔️ '+m.id}</span>
     {current===m.id&&<span className="text-fuchsia-300 animate-pulse">IN DIRETTA</span>}
     {m.winner&&<span className="text-emerald-400">FINITO</span>}
   </div>
   {['sideA','sideB'].map((key,i)=><div key={key}
     className={`flex items-center gap-2 rounded-lg p-2 mb-1.5 border ${m.winner?.id===m[key]?.id?'bg-emerald-900/35 border-emerald-400/60':'bg-slate-900/80 border-slate-700/40'}`}>
      <div className={`rounded-lg w-7 h-7 grid place-items-center font-black text-xs ${i?'bg-rose-700':'bg-cyan-700'}`}>{m[key]?.name?.[0]?.toUpperCase()||'?'}</div>
      <span className="truncate flex-1 text-sm font-bold">{m[key]?.name||'Da determinare'}</span>
      {m.winner?.id===m[key]?.id&&<span className="text-amber-300">★</span>}
   </div>)}
   {round<levels.length-1&&m.stage!=='bronze'&&<span className="absolute -right-4 top-1/2 w-4 border-t-2 border-violet-400/65"/>}
 </div>;
 return <div className="relative overflow-x-auto overflow-y-visible custom-scrollbar p-3 rounded-xl border border-violet-500/30 bg-[radial-gradient(ellipse_at_top,#24143b_0%,#0b1022_65%)]">
  <div className="flex gap-7 items-stretch min-w-max py-3">
   {levels.map(round=>{
    const curr=matches.filter(m=>m.round===round);
    return <div key={round} className="w-60 shrink-0 flex flex-col">
      <div className="mb-5 p-2 border-b border-violet-400/50 text-center font-black uppercase tracking-[.15em] text-sm text-fuchsia-300">
        {round===levels.length-1?'🏆 FINALE':'ROUND '+(round+1)}
      </div>
      <div className="flex-1 flex flex-col justify-around gap-4" style={{minHeight:`${Math.max(185,curr.length*164)}px`}}>
        {curr.map(m=>cardFor(m,round))}
      </div>
    </div>;
   })}
  </div>
 </div>;
}

function Arena({battle,settings,uid,view,setView,orders,setOrders,submit,force,isHost,busy,participants,onContinue,onMinimize}){
 // Il torneo usa i dati sincronizzati dell'evento, ma la presentazione
 // riprende il campo, i PNG e i comandi a pulsanti delle battaglie normali.
 const asUnit=u=>({...u,isHyper:u.hyper||u.isHyper,transformed:u.transformed||u.mahitoTransformed,
    moves:u.moves.map(m=>({...m,remainingUses:m.uses??m.remainingUses??null}))});
 const normalized={...battle,
    squads:{A:battle.teams.A.map(asUnit),B:battle.teams.B.map(asUnit)},
    members:battle.owners,winningSide:battle.winner};
 return <EventClassicBattleView battle={normalized} settings={settings}
   participants={participants||[]} currentUid={uid} perspective={view}
   setPerspective={setView} moveDraft={orders} setMoveDraft={setOrders}
   submit={submit} hostForce={force} busy={busy} isHost={isHost} onContinue={onContinue} onMinimize={onMinimize}/>;
}

export function MultiverseEventHub({appMode,user,playerName,playerAvatarUrl,getPlayerData,updateLocalStats}){
 const [opened,open]=useState(false),[createScreen,showCreate]=useState(false),[activeId,setId]=useState('');
 const [events,setEvents]=useState([]),[event,setEvent]=useState(null),[players,setPlayers]=useState([]);
 const [clock,setClock]=useState(Date.now());
 const [settings,setSettings]=useState(normalizeEventSettings()),[draft,setDraft]=useState([]),[held,setHeld]=useState({});
 const [botName,setBotName]=useState(''),[editing,setEditing]=useState(''),[editName,setEditName]=useState(''),[editRoster,setEditRoster]=useState([]);
 const [perspective,setPerspective]=useState('A'),[orders,setOrders]=useState({}),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const resolving=useRef(false),current=useRef(null);current.current=event;
 const uid=user?.uid||'',isHost=event?.hostId===uid;
 const mine=players.find(p=>p.uid===uid),count=players.length+(event?.bots?.length||0),capacity=event?event.settings.entrants*(event.settings.doubles?2:1):0;
 const live=events.filter(e=>isLiveEvent(e,clock)).sort((a,b)=>b.createdAt-a.createdAt);
 const hostingId=events.find(e=>e.hostId===uid&&isLiveEvent(e,clock))?.id||'';
 useEffect(()=>{const t=setInterval(()=>setClock(Date.now()),12000);return()=>clearInterval(t)},[]);
 // Il torneo rimane online durante le battaglie: scade solo se l'host
 // scompare senza aggiornare la propria presenza per cinque minuti.
 useEffect(()=>{
  if(!hostingId||!uid)return;
  const ping=()=>heartbeatEvent(hostingId,uid).catch(e=>console.warn('Heartbeat torneo:',e));
  ping();
  const t=setInterval(ping,25000);
  return()=>clearInterval(t);
 },[hostingId,uid]);
 // Il client di qualsiasi spettatore può ripulire un torneo abbandonato.
 // Le regole Firestore decidono se è davvero scaduto, usando l'orologio server.
 useEffect(()=>{
  for(const e of events.filter(x=>['lobby','running','cancelled','finished'].includes(x.status)
    && !isLiveEvent(x,clock)&&(clock-(x.updatedAt||x.createdAt)>EVENT_INACTIVITY_MS)).slice(0,2)){
   purgeStaleEvent(e,clock).catch(()=>{});
  }
 },[events,clock]);
 useEffect(()=>{
   if(event&&['lobby','running'].includes(event.status)&&!isLiveEvent(event,clock)){
     setEvent(null);setId('');open(false);
   }
 },[event?.id,event?.status,event?.updatedAt,event?.hostHeartbeatAt,clock]);
 const ordered=useMemo(()=>{
  if(!event)return[];
  const all=[...players,...event.bots].map(p=>({...p,id:p.id||p.uid})),map=new Map(all.map(p=>[p.id,p]));
  return [...new Set([...(event.pairOrder||[]),...all.map(x=>x.id)])].map(id=>map.get(id)).filter(Boolean);
 },[event?.pairOrder,event?.bots,players]);
 const owned=useMemo(()=>{
  const unlocked=new Set(getPlayerData().unlockedChars||[]);
  return available.filter(c=>!c.price||unlocked.has(c.id));
 },[opened,activeId,mine?.ready]);
 useEffect(()=>{if(!user)return;return watchEvents(setEvents,e=>setError('Eventi online: '+e.message));},[user?.uid]);
 useEffect(()=>{if(!activeId||!user)return;const off1=watchEvent(activeId,setEvent,e=>setError('Evento: '+e.message));
 const off2=watchPlayers(activeId,setPlayers,e=>setError('Partecipanti: '+e.message));return()=>{off1();off2()};},[activeId,user?.uid]);
 const operate=async fn=>{if(busy)return;setBusy(true);setError('');try{await fn()}catch(e){setError(e.message||String(e))}finally{setBusy(false)}};
 const updateHost=fn=>hostUpdate(activeId,uid,old=>old.status==='lobby'?fn(old):null);
 const closeEvent=()=>{
  if(isHost&&event&&['lobby','running'].includes(event.status)){
   operate(async()=>{
     await cancelAndPurgeEvent(activeId,uid);
     setId('');setEvent(null);open(false);
   });
  }else{open(false);setError('');}
 };
 const join=()=>operate(async()=>{if(!event||event.status!=='lobby'||count>=capacity)throw Error('Iscrizioni chiuse.');
 if(!mine)await joinEvent(activeId,{uid,name:playerName.trim(),avatar:playerAvatarUrl||''});});
 const create=()=>operate(async()=>{if(!user||!playerName.trim())throw Error('Connettiti e inserisci un nome nel menu');
 if(live.length)throw Error('È già attivo un torneo: unisciti a quello.');
 const id=await createEvent({uid,name:playerName.trim()},normalizeEventSettings(settings));setId(id);showCreate(false)});
 const save=()=>operate(async()=>{
 if(!mine||!validTeam(draft,event.settings))throw Error('Seleziona esattamente '+event.settings.teamSize+' personaggi diversi.');
 const eq={},inv=getPlayerData().inventory||{},used={};
 if(event.settings.allowItems)for(const char of draft)if(held[char]){eq[char]=held[char];used[held[char]]=(used[held[char]]||0)+1}
 if(Object.entries(used).some(([id,n])=>n>(inv[id]||0)))throw Error('Strumenti insufficienti.');
 await saveTeam(activeId,uid,draft,eq);
 });
 const addBot=()=>operate(async()=>{
 await updateHost(old=>{
 const total=players.length+old.bots.length,limit=old.settings.entrants*(old.settings.doubles?2:1);
 if(total>=limit)throw Error('Posti esauriti');
 const botId='bot-'+Date.now()+'-'+Math.floor(Math.random()*99999);
 const team=[...available].sort(()=>Math.random()-.5).slice(0,old.settings.teamSize).map(c=>c.id);
 return{bots:[...old.bots,{id:botId,name:botName.trim()||'Bot '+(old.bots.length+1),teamIds:team,bot:true,ready:true}],pairOrder:[...old.pairOrder,botId]};
 });setBotName('');
 });
 const botEdit=bot=>{setEditing(bot.id);setEditName(bot.name);setEditRoster([...bot.teamIds])};
 const saveBot=()=>operate(async()=>{
 if(!validTeam(editRoster,event.settings))throw Error('La squadra del bot deve contenere personaggi diversi');
 await updateHost(old=>({bots:old.bots.map(b=>b.id===editing?{...b,name:editName.trim()||b.name,teamIds:editRoster}:b)}));setEditing('');
 });
 const removeBot=id=>operate(()=>updateHost(old=>({bots:old.bots.filter(b=>b.id!==id),pairOrder:old.pairOrder.filter(x=>x!==id)})));
 const move=id=>operate(()=>updateHost(old=>{
 const all=[...players.map(p=>p.uid),...old.bots.map(b=>b.id)],arr=[...new Set([...old.pairOrder,...all])].filter(x=>all.includes(x));
 const at=arr.indexOf(id);if(at<1)return null;[arr[at-1],arr[at]]=[arr[at],arr[at-1]];return{pairOrder:arr};
 }));
 const begin=()=>operate(()=>hostUpdate(activeId,uid,old=>{
 if(old.status!=='lobby')return null;
 const entrants=makeEventEntrants(players,old.bots,old.settings,old.pairOrder),matches=makeEventBracket(entrants);
 const map=Object.fromEntries([...players,...old.bots].map(p=>[p.id||p.uid,p]));
 const battle=buildEventBattle(nextEventMatch(matches),map,old.settings);
 return{status:'running',entrants,matches:battle.finished?completeEventMatch(matches,battle.matchId,battle.winner):matches,activeBattle:battle,displayPhase:'battle'};
 }));
 const showBracket=()=>operate(()=>hostUpdate(activeId,uid,old=>
   ['running','finished'].includes(old.status)&&old.activeBattle?.finished?{displayPhase:'bracket'}:null));
 const next=()=>operate(()=>hostUpdate(activeId,uid,old=>{
 if(old.status!=='running'||!old.activeBattle?.finished||old.displayPhase!=='bracket')return null;
 const match=nextEventMatch(old.matches);if(!match)return null;
 const map=Object.fromEntries([...players,...old.bots].map(p=>[p.id||p.uid,p]));
 const battle=buildEventBattle(match,map,old.settings);
 const matches=battle.finished?completeEventMatch(old.matches,match.id,battle.winner):old.matches;
 const placements=eventPlacements(matches,old.entrants);
 return{activeBattle:battle,matches,displayPhase:'battle',...(placements?{status:'finished',placements}: {})};
 }));
 const force=()=>operate(()=>hostUpdate(activeId,uid,old=>{
 const b=old.activeBattle;if(old.status!=='running'||!b||b.finished)return null;
 const submissions={};for(const id of b.owners[b.side])submissions[id]=old.bots.some(bot=>bot.id===id)?botActions(b,id,old.settings):[];
 const after=eventTurn(b,submissions,old.settings),matches=after.finished?completeEventMatch(old.matches,b.matchId,after.winner):old.matches;
 const placements=eventPlacements(matches,old.entrants);
 return{activeBattle:after,matches,...(placements?{status:'finished',placements}: {})};
 }));
 const send=actions=>operate(()=>sendMoves(activeId,event.activeBattle,uid,actions));
 useEffect(()=>{
  const b=event?.activeBattle;if(!isHost||!b||b.finished||event.status!=='running')return;
  return watchCommands(activeId,b.matchId+':'+b.turn,async commands=>{
   if(resolving.current)return;
   const snapshot=current.current;
   if(snapshot?.activeBattle?.turn!==b.turn||snapshot?.activeBattle?.matchId!==b.matchId)return;
   const bots=new Set((snapshot.bots||[]).map(x=>x.id));
   // Dopo un KO un membro di una coppia può non avere più Multimon
   // attivi: non aspettare comandi impossibili da inviare.
   const activeOwners=new Set(activeEventFighters(b,b.side,snapshot.settings).map(x=>x.owner));
   if(!b.owners[b.side].filter(id=>activeOwners.has(id)).every(id=>bots.has(id)||commands[id]))return;
   resolving.current=true;
   try{
    // Mostra ogni turno delle lotte CPU, invece di saltare direttamente
    // dal sorteggio al vincitore. Tempo minimo per vedere il combattimento.
    if(activeOwners.size>0 && [...activeOwners].every(id=>bots.has(id)))
      await new Promise(resolve=>setTimeout(resolve,1800));
    await hostUpdate(activeId,uid,old=>{
     if(old.status!=='running'||old.activeBattle?.turn!==b.turn||old.activeBattle?.matchId!==b.matchId)return null;
     const all={...commands};for(const id of b.owners[b.side])if(bots.has(id))all[id]=botActions(b,id,old.settings);
     const after=eventTurn(old.activeBattle,all,old.settings);
     const matches=after.finished?completeEventMatch(old.matches,b.matchId,after.winner):old.matches;
     const placements=eventPlacements(matches,old.entrants);
     return{activeBattle:after,matches,...(placements?{status:'finished',placements}: {})};
    });
   }catch(e){setError('Arbitraggio: '+e.message)}finally{resolving.current=false}
  },e=>setError('Mosse online: '+e.message));
 },[activeId,isHost,uid,event?.status,event?.activeBattle?.turn,event?.activeBattle?.matchId,event?.activeBattle?.finished]);
 useEffect(()=>{
  if(!event||event.status!=='finished'||!uid)return;
  const prize=event.placements?.participants?.[uid];if(!prize)return;
  const key='multimon_event_reward_'+event.id+'_'+uid;
  if(localStorage.getItem(key))return;
  updateLocalStats({addCoins:prize.coins,win:prize.rank===1,match:true});
  localStorage.setItem(key,JSON.stringify(prize));
 },[event?.id,event?.status,uid,event?.placements]);
 const openEvent=e=>{setId(e.id);showCreate(false);open(true)};
 return <>
 {live.length>0&&!opened&&playerName.trim()&&<button className="fixed z-[90] bottom-5 right-5 bg-gradient-to-r from-fuchsia-700 to-violet-700 border border-fuchsia-300 shadow-2xl rounded-xl p-4 font-black text-white animate-pulse" onClick={()=>openEvent(live[0])}>🏆 TORNEO DEL MULTIVERSO · {live[0].status==='lobby'?'UNISCITI':'GUARDA'}</button>}
 {!opened&&appMode==='menu'&&<button className="fixed z-[80] bottom-5 left-5 bg-slate-950 border border-amber-400 rounded-xl px-4 py-3 font-black text-amber-300" onClick={()=>{open(true);showCreate(true);setId('')}}>🏆 Torneo del Multiverso</button>}
 {opened&&<div className="fixed inset-0 z-[100] overflow-y-auto custom-scrollbar bg-black/95 text-white" role="dialog" aria-modal="true" aria-label="Torneo del Multiverso"><div className="max-w-[1800px] mx-auto p-4 sm:p-8 space-y-5">
 <header className="flex flex-wrap justify-between gap-3 border-b border-fuchsia-500/40 pb-4"><div><div className="text-amber-300 text-xs tracking-widest font-black">EVENTO GLOBALE</div><h1 className="text-3xl sm:text-5xl font-black text-fuchsia-300">IL TORNEO DEL MULTIVERSO</h1></div><button className={gray} onClick={closeEvent}>{isHost&&['lobby','running'].includes(event?.status)?'Esci e termina torneo':'Chiudi'}</button></header>
 {error&&<div className="rounded-xl p-4 bg-red-950 text-rose-200 border border-red-500/50 text-sm">{error}<div className="text-xs mt-2">Se vedi «Missing or insufficient permissions», integra prima le regole Firebase del torneo.</div></div>}
 {!user&&<p>Connessione a Firebase in corso…</p>}
 {(!event||createScreen)&&<div className={card}><h2 className="font-black text-xl mb-3">Crea un torneo globale</h2><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
 <label>Squadre<select className={inp} value={settings.entrants} onChange={e=>setSettings(s=>normalizeEventSettings({...s,entrants:+e.target.value}))}>{[4,8,16,32].map(n=><option key={n}>{n}</option>)}</select></label>
 <label>Multimon per giocatore<select className={inp} value={settings.teamSize} onChange={e=>setSettings(s=>normalizeEventSettings({...s,teamSize:+e.target.value}))}>{[4,5,6,7,8].map(n=><option key={n}>{n}</option>)}</select></label>
 <label>Modalità<select className={inp} value={settings.doubles?'doubles':'singles'} onChange={e=>setSettings(s=>normalizeEventSettings({...s,doubles:e.target.value==='doubles'}))}><option value="singles">Individuale</option><option value="doubles">Lotta multipla (2 giocatori per squadra)</option></select></label>
 <label>Multimon simultanei per giocatore<select className={inp} value={settings.fieldSize} onChange={e=>setSettings(s=>normalizeEventSettings({...s,fieldSize:+e.target.value}))}>{Array.from({length:settings.doubles?2:4},(_,i)=>i+1).map(n=><option key={n} value={n}>{settings.doubles?2*n:n} contro {settings.doubles?2*n:n}</option>)}</select></label>
 <label className="flex gap-2 items-center"><input type="checkbox" checked={settings.allowItems} onChange={e=>setSettings(s=>({...s,allowItems:e.target.checked}))}/> Permetti strumenti</label>
 <label className="flex gap-2 items-center"><input type="checkbox" checked={settings.allowHyper} onChange={e=>setSettings(s=>({...s,allowHyper:e.target.checked}))}/> Permetti le Iper</label></div>
 <p className="text-xs text-slate-400 mt-3">Servono {settings.entrants*(settings.doubles?2:1)} persone o bot. L’host deve restare online durante gli scontri.</p>
 <button className={`${btn} mt-4`} disabled={busy||!user||!playerName.trim()} onClick={create}>Crea evento</button>
 {live.map(e=><button key={e.id} className={`${gray} block w-full mt-3 text-left`} onClick={()=>openEvent(e)}>Entra nel torneo di {e.hostName} · {e.status}</button>)}
 </div>}
 {event&&!createScreen&&<>
 <div className="flex flex-wrap justify-between gap-2"><span className="text-fuchsia-300 font-black">Host: {event.hostName} · {event.status} · {count}/{capacity} giocatori</span><span className="text-amber-300 text-sm font-bold">Premi: 1º 400 · 2º 200 · 3º 140 · partecipazione 50 monete</span></div>
 {event.status==='lobby'&&<>
 {!mine&&<div className={card}><p className="mb-3">Unisciti al torneo e crea la tua squadra.</p><button className={btn} disabled={busy||count>=capacity} onClick={join}>Unisciti!</button></div>}
 {mine&&<div className={card}><h2 className="font-black text-xl">La tua squadra ({mine.ready?mine.teamIds.length:draft.length}/{event.settings.teamSize})</h2>
 {mine.ready?<div className="flex flex-wrap gap-2 mt-3">{mine.teamIds.map(id=><div key={id} className="bg-slate-950 rounded-xl p-2 flex gap-2 items-center text-xs"><img src={index[id]?.img} alt="" className="w-10 h-10 rounded-full object-cover"/>{index[id]?.name}</div>)}</div>:<>
 <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 xl:grid-cols-12 gap-2 mt-3 max-h-80 overflow-y-auto">{owned.map(c=><button key={c.id} onClick={()=>setDraft(prev=>prev.includes(c.id)?prev.filter(x=>x!==c.id):prev.length<event.settings.teamSize?[...prev,c.id]:prev)} className={`rounded-xl border p-2 text-center ${draft.includes(c.id)?'border-fuchsia-400 bg-violet-950':'border-slate-700 bg-slate-950'}`}><img src={c.img} alt="" className="w-12 h-12 mx-auto rounded-full object-cover"/><span className="text-[10px] font-bold truncate block">{c.name}</span></button>)}</div>
 {event.settings.allowItems&&<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-3">{draft.map(id=><label key={id} className="text-xs">{index[id]?.name}<select className={inp} value={held[id]||''} onChange={e=>setHeld(v=>({...v,[id]:e.target.value}))}><option value="">Nessuno</option>{HELD_ITEM_IDS.filter(id=>(getPlayerData().inventory?.[id]||0)>0).map(id=>
    <option key={id} value={id}>{ITEMS_DB[id]?.name||id}</option>)}</select></label>)}</div>}
 <button className={`${btn} mt-4`} disabled={busy||draft.length!==event.settings.teamSize} onClick={save}>Conferma squadra · Pronto!</button>
 </>}</div>}
 {isHost&&<div className={`${card} border-amber-400/40 space-y-3`}><div className="flex justify-between"><h2 className="text-xl text-amber-300 font-black">Pannello host</h2><button className={gray} onClick={()=>operate(async()=>{await cancelAndPurgeEvent(activeId,uid);setId('');setEvent(null);open(false);})}>Annulla evento</button></div>
 <div className="flex gap-2 flex-wrap"><input className={`${inp} max-w-xs`} placeholder="Nome del bot" value={botName} onChange={e=>setBotName(e.target.value)}/><button className={btn} onClick={addBot} disabled={busy||count>=capacity}>Aggiungi bot</button></div>
 {event.bots.map(bot=><div key={bot.id} className="flex gap-2 flex-wrap items-center bg-slate-950 p-2 rounded-xl text-xs"><b className="flex-1">{bot.name} · {bot.teamIds.map(id=>index[id]?.name).join(', ')}</b><button className={gray} onClick={()=>botEdit(bot)}>Modifica squadra</button><button className={gray} onClick={()=>removeBot(bot.id)}>Rimuovi</button></div>)}
 {editing&&<div className="rounded-xl border border-violet-500 p-3 space-y-2"><input className={inp} value={editName} onChange={e=>setEditName(e.target.value)}/>
 <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">{editRoster.map((id,i)=><select key={i} className={inp} value={id} onChange={e=>setEditRoster(v=>v.map((x,j)=>j===i?e.target.value:x))}>{available.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>)}</div><button className={btn} onClick={saveBot}>Salva bot</button></div>}
 <h3 className="font-black text-sm">Ordina gli sfidanti (in modalità multipla, ogni 2 consecutivi formano un team)</h3>
 <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">{ordered.map((p,i)=><div key={p.id} className="bg-slate-950 rounded-xl p-2 text-xs flex items-center gap-2"><span className="text-amber-400">#{i+1}</span><span className="flex-1 truncate">{p.name} {p.ready?'✅':'⌛'}</span><button disabled={busy||i===0} onClick={()=>move(p.id)}>▲</button></div>)}</div>
 <button className={btn} disabled={busy||count!==capacity||!ordered.every(x=>x.ready)} onClick={begin}>Avvia torneo ({event.settings.entrants} squadre)</button>
 </div>}
 <div className={card}><h3 className="font-black">Iscritti</h3><div className="flex flex-wrap gap-2 mt-2">{[...players,...event.bots].map(p=><span key={p.uid||p.id} className="rounded-lg px-3 py-2 border border-slate-700 text-xs">{p.name} {p.ready?'✅':'⌛'}</span>)}</div></div>
 </>}
 {event.status!=='lobby'&&<>
 {(event.displayPhase==='bracket'||!event.activeBattle)&&
   <div className={card}><h2 className="text-xl font-black mb-3">Bracket del Multiverso</h2>
   <Bracket matches={event.matches} current={event.activeBattle?.matchId}/></div>}
 {event.activeBattle&&event.displayPhase!=='bracket'&&
   <Arena key={event.activeBattle.matchId+'-'+event.activeBattle.turn}
     participants={[...players,...event.bots.map(b=>({uid:b.id,name:b.name}))]}
     battle={event.activeBattle} settings={event.settings} uid={uid}
     view={perspective} setView={setPerspective} orders={orders} setOrders={setOrders}
     submit={send} force={force} isHost={isHost} busy={busy} onContinue={showBracket} onMinimize={()=>open(false)}/>}
 {isHost&&event.status==='running'&&event.activeBattle?.finished&&event.displayPhase==='bracket'&&
   <button className={btn} onClick={next} disabled={busy}>Avvia il prossimo incontro →</button>}
 {event.status==='finished'&&event.displayPhase==='bracket'&&event.placements&&<div className={`${card} border-amber-400/50 text-center`}><h2 className="text-3xl text-amber-300 font-black mb-3">🏆 Il Torneo è finito!</h2>
 {event.entrants.map(e=><div key={e.id} className="p-2 border-b border-slate-700 text-sm">{e.name} · #{event.placements.entrants[e.id]||4} · {EVENT_PRIZES[event.placements.entrants[e.id]]||50} monete</div>)}
 <p className="text-slate-400 mt-3 text-xs">I premi vengono accreditati una volta per evento nel profilo locale.</p></div>}
 </>}
 </>}
 </div></div>}
 </>;
}
