import React,{useState} from 'react';
import {PrismaballCapture} from './AscensionView.jsx';
import {onMultimonImageError} from '../../systems/imageFallback.js';
import {ascensionCurrentMatch,ascensionFind,ASCENSION_ROUNDS} from '../../systems/colosseumAscension.js';
import './AscensionBattleResult.css';

function Face({char,hp=0,maxHp=1,level=1,title,defeated=false}){
 const percent=Math.max(0,Math.min(100,(hp/Math.max(1,maxHp))*100));
 return <div className={'ac-result-fighter'+(defeated?' ac-result-fighter--ko':'')}>
  <small>{title}</small>
  {char?.img?<img src={char.img} onError={onMultimonImageError} alt={char.name}/>:<span aria-hidden="true">✦</span>}
  <strong>{char?.name||'Multimon'}</strong>
  <div className="ac-result-fighter-line"><span>LV {level}</span><span>{hp} / {maxHp} PS</span></div>
  <div className="ac-result-hp"><i style={{width:percent+'%'}}/></div>
  {defeated&&<b>KO</b>}
 </div>;
}

export function AscensionBattleResult({room,role,characters,onAction,onHost,onNextPlayer,canHost=false,local=false}){
 const asc=room.ascension,participant=asc?.participants?.[role];
 const encounterResult=asc?.stage==='preparation'?participant?.battleResult:null;
 const match=ascensionCurrentMatch(asc);
 const game=match?.game?.winner?match.game:null;
 const duel=!encounterResult&&Boolean(game);
 const spectator=duel&&!match.roles.includes(role);
 const victory=duel?game.winner===role:encounterResult?.outcome==='victory';
 const captureSuccess=!duel&&encounterResult?.outcome==='capture';
 const retreat=!duel&&encounterResult?.outcome==='retreat';
 const outcome=duel?(victory?'victory':'defeat'):encounterResult?.outcome||'defeat';
 const [showCapture,setShowCapture]=useState(()=>captureSuccess);
 const [submitting,setSubmitting]=useState(false);
 if(!encounterResult&&!game)return null;
 const find=(id)=>ascensionFind(characters,id)||{name:id||'Sconosciuto',img:''};
 let playerFighter,foeFighter,heroName,enemyName,log,turn,roundLabel;
 if(duel){
  const myRole=spectator?match.roles[0]:role,enemyRole=match.roles.find(r=>r!==myRole);
  const mine=game.units[myRole]||[],theirs=game.units[enemyRole]||[];
  const one=mine.find(m=>m.hp>0)||mine[0],two=theirs.find(m=>m.hp>0)||theirs[0];
  playerFighter=one&&{char:find(one.id),level:one.level,hp:one.hp,maxHp:Math.max(1,Math.round((find(one.id).maxHp||find(one.id).hp||100)*(.7+.04*(one.level-1))))};
  foeFighter=two&&{char:find(two.id),level:two.level,hp:two.hp,maxHp:Math.max(1,Math.round((find(two.id).maxHp||find(two.id).hp||100)*(.7+.04*(two.level-1))))};
  heroName=room.players[myRole];enemyName=room.players[enemyRole];
  log=game.log||[];turn=Math.max(1,(game.turn||2)-1);
  roundLabel=match.stage.toUpperCase()+' · PARTITA '+match.gameNumber;
 }else{
  const r=encounterResult;
  const hero=find(r.heroId),foe=find(r.foeId);
  const level=r.heroLevel||1,foeLevel=r.foeLevel||1;
  playerFighter={char:hero,level,hp:r.heroHp||0,
   maxHp:Math.max(1,Math.round((hero.maxHp||hero.hp||100)*(.7+.04*(level-1))))};
  foeFighter={char:foe,level:foeLevel,hp:r.foeHp||0,maxHp:r.foeMaxHp||1};
  heroName=room.players?.[role]||'La tua squadra';
  enemyName=r.kind==='trainer'?'Allenatore '+r.trainerName:'Multimon selvatico';
  log=r.log||[];turn=r.turn||1;
  roundLabel='ROUND '+asc.round+' / '+ASCENSION_ROUNDS;
 }
 const title=duel?(spectator?'PARTITA CONCLUSA':victory?'VITTORIA!':'SCONFITTA'):
  captureSuccess?'CATTURA RIUSCITA!':victory?'VITTORIA!':retreat?'RITIRATA':'SCONFITTA';
 const subtitle=duel
  ?(room.players[game.winner]+' vince la partita '+match.gameNumber+'!')
  :captureSuccess?(find(encounterResult.foeId).name+' entra nella tua squadra!')
  :victory?(find(encounterResult.foeId).name+' è stato sconfitto!')
  :retreat?'Ti sei ritirato dal varco.':'La tua squadra è esausta.';
 const alreadyConfirmed=duel&&Boolean(game.resultAcknowledged?.[role]);
 const needsNextGame=duel&&!match.winner;
 const canContinue=duel?needsNextGame&&!spectator&&!alreadyConfirmed:true;
 const continueLabel=duel?'Ho visto il risultato · Prossima partita →':'Continua il percorso →';
 const doContinue=async()=>{
  if(submitting||!canContinue)return;
  setSubmitting(true);
  try{await onAction(duel?'duel-continue':'encounter-continue');}
  finally{setSubmitting(false);}
 };
 const next=async()=>{
  if(submitting)return;
  setSubmitting(true);
  try{await onHost('next-match');}finally{setSubmitting(false)}
 };
 return <main className={'ac-result-screen ac-result-screen--'+outcome} aria-label="Risultato battaglia">
  <div className="ac-result-orbit" aria-hidden="true">✦ ✧ ✦</div>
  <section className="ac-result-panel">
   <header className="ac-result-top"><span>🏛️ ASCESA DEL COLOSSEO</span><span>{roundLabel}</span></header>
   <div className="ac-result-header">
    <small>{duel?'IL VERDETTO DELL’ARENA':captureSuccess?'LA PRISMABALL HA RISPOSTO':'BATTAGLIA CONCLUSA'}</small>
    <h1>{title}</h1>
    <p>{subtitle}</p>
    <div className="ac-result-turn">⚔️ Scontro concluso al turno {turn}{turn===1&&victory?' · KO al primo turno!':''}</div>
   </div>
   <div className="ac-result-stage" aria-label="Schieramenti alla conclusione">
    <Face title={heroName} {...playerFighter} defeated={playerFighter?.hp<=0}/>
    <div className="ac-result-vs">VS</div>
    <Face title={enemyName} {...foeFighter} defeated={foeFighter?.hp<=0}/>
   </div>
   {duel?<section className="ac-result-rewards" aria-label="Punteggio torneo">
     <h2>🏆 PUNTEGGIO DEL DUELLO</h2>
     <div className="ac-result-score">{match.roles.map(r=><span key={r}>
      {room.players[r]} <strong>{match.wins[r]||0}</strong></span>)}</div>
     <p>{match.winner?'Il duello è terminato. Il vincitore avanza nel tabellone.':
      'Sfida al meglio delle tre · la prossima partita inizia dopo che i contendenti hanno confermato.'}</p>
    </section>:<section className="ac-result-rewards" aria-label="Ricompense">
     <h2>{victory?'✦ RICOMPENSE OTTENUTE':captureSuccess?'✦ NUOVO COMPAGNO':'✦ ESITO DELLO SCONTRO'}</h2>
     {victory?<div className="ac-result-prizes">
      <span>🪙 +{encounterResult.coins||0} monete</span>
      <span>⭐ +{encounterResult.xp||0} esperienza base</span>
      {encounterResult.training>0&&<span>💪 +{encounterResult.training} punti allenamento a tutti</span>}
     </div>:<p>{captureSuccess?'La cattura è registrata nella tua squadra.':
      retreat?'Nessuna cattura.':'Nessuna ricompensa per questa sconfitta.'}</p>}
    </section>}
   <details className="ac-result-log">
    <summary>📜 Rivedi gli ultimi eventi della battaglia</summary>
    <ol>{log.slice(-8).map((line,i)=><li key={i}>{line}</li>)}</ol>
   </details>
   <footer className="ac-result-footer">
    {canContinue&&<button type="button" className="ac-result-next" disabled={submitting} onClick={doContinue}>{continueLabel}</button>}
    {duel&&needsNextGame&&(spectator||alreadyConfirmed)&&<p>⌛ {alreadyConfirmed?'Risultato confermato.':'Gli sfidanti devono confermare il risultato.'} In attesa dell’altro giocatore…</p>}
    {duel&&!!match.winner&&canHost&&<button type="button" className="ac-result-next" disabled={submitting} onClick={next}>
      {match.stage==='finale'?'👑 Incorona il campione →':'Prossimo incontro →'}</button>}
    {duel&&!!match.winner&&!canHost&&<p>🏆 In attesa che l’organizzatore apra il prossimo incontro.</p>}
    {local&&onNextPlayer&&<button type="button" className="ac-result-local" onClick={onNextPlayer}>Passa a un altro giocatore locale</button>}
    <small>Il risultato non sparirà finché non verrà confermato.</small>
   </footer>
  </section>
  {showCapture&&participant?.lastCapture?.success&&
   <PrismaballCapture capture={participant.lastCapture}
    foe={find(encounterResult.foeId)} onFinish={()=>setShowCapture(false)}/>}
 </main>;
}
