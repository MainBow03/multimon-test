// Resoconto persistito nel gameState e ricostruito dagli eventi reali del turno.
// Nessuna statistica viene calcolata leggendo il testo localizzato dei messaggi.
export const BATTLE_REPORT_METRICS = [
  {key:'damageDealt',label:'Danni inflitti',description:'PS realmente sottratti ai nemici',unit:'PS',color:'rose'},
  {key:'damageTaken',label:'Danni subiti',description:'PS persi dopo difese e protezioni',unit:'PS',color:'orange'},
  {key:'kos',label:'KO effettuati',description:'Avversari mandati al tappeto',unit:'KO',color:'yellow'},
  {key:'healing',label:'Cure effettuate',description:'PS davvero recuperati dagli alleati',unit:'PS',color:'emerald'},
  {key:'shieldsBroken',label:'Scudi distrutti',description:'Barriere raid portate a zero cariche',unit:'scudi',color:'cyan'},
  {key:'passiveActivations',label:'Passive attivate',description:'Attivazioni annunciate in battaglia',unit:'attivazioni',color:'violet'}
];

export function createBattleReport(){
  return {version:1,turns:0,entries:{}};
}

const battleKey=(player,idx)=>player+':'+idx;
const integer=(value)=>Math.max(0,Math.trunc(Number(value)||0));
function areOpponents(attacker,target,mode,settings){
  if(attacker===target)return false;
  if(mode==='multipla')return ['p1','p2'].includes(attacker)!==['p1','p2'].includes(target);
  if(mode==='juggernaut'||mode==='survival'){
    const boss=settings?.juggernautPlayer||(mode==='survival'?'p2':'p1');
    return (attacker===boss)!==(target===boss);
  }
  return true;
}

function register(report,player,idx,char){
  if(!player || !Number.isInteger(Number(idx)) || idx<0 || !char)return null;
  const key=battleKey(player,idx);
  if(!report.entries[key]){
    report.entries[key]={
      player,idx:Number(idx),id:char.id||'',name:char.name||'Multimon',
      img:char.img||'',damageDealt:0,damageTaken:0,healing:0,
      kos:0,shieldsBroken:0,passiveActivations:0
    };
  }
  return report.entries[key];
}

function namedPassiveOwner(report,event,acting){
  if(!event.isPassive || !event.passiveChar || !event.passiveName)return null;
  const name=event.passiveChar;
  // Se il nome si ripete nelle due squadre, non attribuiamo una passiva
  // a caso: preferiamo un riferimento esplicito all'attore o al bersaglio.
  if(acting && report.entries[battleKey(acting.player,acting.idx)]?.name===name)
    return report.entries[battleKey(acting.player,acting.idx)];
  if(event.targetPlayer!=null && event.targetIdx!=null){
    const target=report.entries[battleKey(event.targetPlayer,event.targetIdx)];
    if(target?.name===name)return target;
  }
  const matches=Object.values(report.entries).filter(c=>c.name===name);
  return matches.length===1?matches[0]:null;
}

export function accumulateBattleReport(previous, teamsAtTurnStart, events, {countTurn=true,gameMode='classica',settings={}}={}){
  const report=previous?.version===1
    ? {version:1,turns:integer(previous.turns),entries:JSON.parse(JSON.stringify(previous.entries||{}))}
    : createBattleReport();
  const health=new Map();
  const shields=new Map();
  for(const [player,team] of Object.entries(teamsAtTurnStart||{})){
    if(!Array.isArray(team))continue;
    team.forEach((char,idx)=>{
      if(!char)return;
      register(report,player,idx,char);
      health.set(battleKey(player,idx),integer(char.hp));
      shields.set(battleKey(player,idx),integer(char.juggHitsRemaining));
    });
  }

  let actor=null;
  for(const event of events||[]){
    if(!event)continue;
    if(event.type==='battle_actor'){
      actor={player:event.player,idx:event.charTeamIdx,kind:event.kind};
      continue;
    }
    if(event.type==='battle_actor_end'){
      actor=null;
      continue;
    }
    if(event.type==='summon'){
      // Anche le evocazioni entrate nel corso del turno devono avere
      // un contatore personale e un riferimento stabile per gli eventi.
      const teamIndex=event.fieldIdx;
      const summoned=register(report,event.player,teamIndex,event.newChar);
      if(summoned){
        health.set(battleKey(event.player,teamIndex),integer(event.newChar.hp));
        shields.set(battleKey(event.player,teamIndex),integer(event.newChar.juggHitsRemaining));
      }
    }

    const passiveOwner=namedPassiveOwner(report,event,actor);
    if(passiveOwner && event.text && event.type!=='summon')
      passiveOwner.passiveActivations+=1;

    if(event.type==='raid_shield_update'){
      const key=battleKey(event.targetPlayer,event.targetIdx);
      const old=shields.get(key)??0;
      const next=integer(event.remainingHits);
      if(!event.activated && old>0 && next===0 && actor?.kind==='attack' && areOpponents(actor.player,event.targetPlayer,gameMode,settings)){
        const attacker=report.entries[battleKey(actor.player,actor.idx)];
        if(attacker)attacker.shieldsBroken+=1;
      }
      shields.set(key,next);
      continue;
    }

    if(event.type!=='damage' || event.targetPlayer==null || event.targetIdx==null)continue;
    const key=battleKey(event.targetPlayer,event.targetIdx);
    const before=health.get(key);
    const after=integer(event.newHp);
    health.set(key,after);
    if(before==null)continue; // Mai inventare danni da uno snapshot mancante.
    const target=report.entries[key];
    if(!target)continue;
    const lost=Math.max(0,before-after);
    const gained=Math.max(0,after-before);
    target.damageTaken+=lost;
    const source=passiveOwner || (actor&&report.entries[battleKey(actor.player,actor.idx)]);
    if(!source)continue;
    const offensive=actor?.kind==='attack' && areOpponents(actor.player,event.targetPlayer,gameMode,settings) && !event.isPassive;
    const passiveDamage=event.isPassive && passiveOwner && areOpponents(passiveOwner.player,event.targetPlayer,gameMode,settings);
    if(lost && (offensive||passiveDamage)){
      source.damageDealt+=lost;
      if(after===0 && before>0)source.kos+=1;
    }
    if(gained)source.healing+=gained;
  }
  if(countTurn)report.turns+=1;
  return report;
}

export function battleReportLeaders(report,metric,limit=3){
  return Object.values(report?.entries||{})
    .filter(c=>integer(c[metric])>0)
    .sort((a,b)=>integer(b[metric])-integer(a[metric]) ||
      a.player.localeCompare(b.player) || a.idx-b.idx)
    .slice(0,limit);
}

export function battleReportMvp(report){
  const participants=Object.values(report?.entries||[]);
  const scored=participants.map(c=>({
    ...c,
    mvpScore:integer(c.damageDealt) + integer(c.damageTaken)*0.25 +
      integer(c.healing)*0.7 + integer(c.kos)*120 +
      integer(c.shieldsBroken)*80 + integer(c.passiveActivations)*12
  })).sort((a,b)=>b.mvpScore-a.mvpScore ||
    integer(b.kos)-integer(a.kos) ||
    a.player.localeCompare(b.player) || a.idx-b.idx);
  return scored[0]?.mvpScore>0?scored[0]:null;
}
