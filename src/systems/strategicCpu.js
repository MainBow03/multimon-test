// IA tattica: considera soltanto i combattenti visibili, le proprie riserve
// e le mosse dell'avversario realmente eseguite in turni precedenti.
// NON legge le azioni pendenti avversarie o le loro mosse/riserve segrete.
export const CPU_STYLES=Object.freeze({
  aggressive:{name:'Aggressiva',damage:1.28,ko:125,support:0.64,heal:0.70,switch:0.38},
  defensive:{name:'Difensiva',damage:0.88,ko:55,support:1.40,heal:1.65,switch:1.08},
  tactical:{name:'Strategica',damage:1.05,ko:90,support:1.05,heal:1.1,switch:1.55}
});

export function cpuStyle(room,player){
  const selected=room?.cpuStyles?.[player];
  if(CPU_STYLES[selected])return selected;
  const label=String(room?.players?.[player]||'')+'|'+String(room?.teams?.[player]?.[0]?.id||'')+'|'+player;
  let h=0;
  for(const ch of label)h=(Math.imul(h,31)+ch.charCodeAt(0))|0;
  return Object.keys(CPU_STYLES)[(h>>>0)%3];
}

const finite=(value,fallback=0)=>Number.isFinite(Number(value))?Number(value):fallback;
const bounded=(v,min,max)=>Math.max(min,Math.min(max,v));
const hpRatio=char=>bounded(finite(char?.hp)/Math.max(1,finite(char?.maxHp,1)),0,1);
const alive=c=>Boolean(c&&c.hp>0);
const usable=m=>m && m.remainingUses!==0 && !(finite(m.currentCooldown)>0);
const hasNegative=c=>(c?.statuses||[]).some(s=>[
  'Avvelenato','Scottato','Congelato','Elettrizzato','Addormentato',
  'Stordito','Confuso','Indebolito','Accecato'
].includes(s.type));

export function visibleEnemyPlayers(room,player,activePlayers,matchOpponents=()=>[]){
  const mode=room.gameMode;
  if(mode==='multipla')return ['p1','p2'].includes(player)?['p3','p4']:['p1','p2'];
  if(mode==='juggernaut'||mode==='survival'){
    const leader=room.settings?.juggernautPlayer||(mode==='survival'?'p2':'p1');
    return player===leader?activePlayers.filter(p=>p!==leader):[leader];
  }
  if(mode==='torneo')return matchOpponents(player)||[];
  if(mode==='torneo_punti')return activePlayers.filter(p=>p!==player).slice(0,1);
  if(mode==='battleroyale')return activePlayers.filter(p=>p!==player);
  return [player==='p1'?'p2':'p1'];
}
function alliedPlayers(room,player,activePlayers){
  if(room.gameMode==='multipla')
    return ['p1','p2'].includes(player)?['p1','p2']:['p3','p4'];
  if(['juggernaut','survival'].includes(room.gameMode)){
    const leader=room.settings?.juggernautPlayer||(room.gameMode==='survival'?'p2':'p1');
    return player===leader?[player]:activePlayers.filter(p=>p!==leader);
  }
  return [player];
}
const strength=(attacker,move,target,multiplier)=>{
  // Non leggere la difesa o le mosse nascoste dell'avversario:
  // solo potenza della propria mossa, tipo avversario e PS visibili.
  const power=Math.max(0,finite(move.power));
  const boost=bounded(finite(attacker.atk,60)/75,.55,2.3);
  const accuracy=bounded(finite(move.accuracy,100)/100,.3,1);
  return power*multiplier*boost*accuracy;
};
function multiplierOf(getMultiplier,type,types){
  try{return bounded(finite(getMultiplier(type,types),1),0,4)}
  catch{return 1}
}
function bestCoverage(char,enemies,getMultiplier){
  return Math.max(0,...(char.moves||[]).filter(m=>usable(m)&&finite(m.power)>0)
    .flatMap(m=>enemies.map(e=>multiplierOf(getMultiplier,m.type,e.char.types))));
}

// Memoria pubblica: il motore produce ai_public_move SOLO quando la mossa
// viene effettivamente utilizzata. Le mosse ordinate ma interrotte da KO,
// sonno o paralisi non sono apprese dalla CPU.
export function rememberPublicCpuMoves(previous={},events=[]){
  const memory={...previous};
  for(const event of events){
    if(event?.type!=='ai_public_move'||!event.player||!event.charId||
       !event.moveName||!event.moveType)continue;
    const oldPlayer=memory[event.player]||{};
    const old=oldPlayer[event.charId]||{total:0,types:{},moves:{}};
    const types={...(old.types||{})},moves={...(old.moves||{})};
    types[event.moveType]=(types[event.moveType]||0)+1;
    moves[event.moveName]=(moves[event.moveName]||0)+1;
    // Mantiene piccola la stanza Firestore anche dopo molti turni.
    if(Object.keys(moves).length>12){
      const oldest=Object.entries(moves).sort((a,b)=>a[1]-b[1])[0][0];
      delete moves[oldest];
    }
    if(Object.keys(types).length>12){
      const oldest=Object.entries(types).sort((a,b)=>a[1]-b[1])[0][0];
      delete types[oldest];
    }
    memory[event.player]={...oldPlayer,[event.charId]:{total:Math.min(99,(old.total||0)+1),types,moves}};
  }
  return memory;
}
export function observedMovePattern(room,target){
  const seen=room.aiMemory?.[target.player]?.[target.char.id];
  if(!seen||seen.total<2)return null;
  const [type,count]=Object.entries(seen.types||{}).sort((a,b)=>b[1]-a[1])[0]||[];
  if(!type||count<2||count/Math.max(1,seen.total)<.55)return null;
  return {type,count,confidence:count/seen.total};
}

function switchCandidate({room,player,char,charIdx,activeField,enemies,style,getMultiplier,random,reserved}){
  if(!enemies.length || !['tactical','defensive'].includes(style))return null;
  if(char.isSummonOnly || (char.statuses||[]).some(s=>['Radicato','In_Groppa'].includes(s.type)))return null;
  const bench=(room.teams?.[player]||[]).map((c,idx)=>({char:c,idx}))
    .filter(v=>alive(v.char)&&!v.char.isSummonOnly&&!activeField.includes(v.idx)&&!reserved.has(v.idx));
  if(!bench.length)return null;
  const coverage=bestCoverage(char,enemies,getMultiplier);
  const observed=enemies.map(e=>({e,pattern:observedMovePattern(room,e)}))
    .filter(v=>v.pattern);
  const risk=(candidate)=>observed.length
    ?observed.reduce((sum,v)=>sum+multiplierOf(getMultiplier,v.pattern.type,candidate.types)*v.pattern.confidence,0)/observed.length
    :1;
  const currentRisk=risk(char);
  let best=null;
  for(const {char:next,idx} of bench){
    const nextCover=bestCoverage(next,enemies,getMultiplier);
    const gain=nextCover-coverage;
    const safety=currentRisk-risk(next);
    const trapped=!!room.fieldTraps?.[player];
    const needsSwitch=(coverage<.8&&gain>=.75) ||
      (observed.length>0&&safety>=.7&&gain>=-.35) ||
      (hasNegative(char)&&gain>=.6&&hpRatio(next)>.55);
    if(!needsSwitch||hpRatio(next)<.33)continue;
    // Costo reale del cambio: l'ingresso su trappola infligge danni,
    // e la CPU rinuncia all'attacco di questo turno.
    const score=(style==='tactical'?112:91)+gain*42+safety*55+
      (hasNegative(char)?13:0)+(hpRatio(next)-hpRatio(char))*17-
      (trapped?43:0)+random()*3;
    if(!best||score>best.score)best={score,idx};
  }
  return best;
}

export function generateStrategicCpuActions({
  room,player,currentActions={},activePlayers=[],getMultiplier=()=>1,
  matchOpponents=()=>[],roguelikeState={},random=Math.random
}){
  const result={};
  const activeField=room.field?.[player]||[];
  if(!activeField.length)return result;
  const styleId=cpuStyle(room,player);
  const style=CPU_STYLES[styleId];
  const enemies=visibleEnemyPlayers(room,player,activePlayers,matchOpponents)
    .flatMap(p=>(room.field?.[p]||[]).map((idx,fieldIdx)=>({
      player:p,idx,fieldIdx,char:room.teams?.[p]?.[idx]
    })).filter(t=>alive(t.char)));
  const ownAllies=alliedPlayers(room,player,activePlayers);
  const activeOwned=new Set(activeField);
  const reserved=new Set();
  const inv=room.inventory?.[player]||{};
  const itemsUsed=room.healingItemsUsed?.[player]||0;
  const healLimit=2; // il motore applica il limite effettivo, se previsto
  const legalRevive=ownAllies.flatMap(p=>(room.teams?.[p]||[])
    .map((char,idx)=>({player:p,idx,char}))
    .filter(v=>v.char&&!v.char.isSummonOnly&&v.char.hp<=0));
  const activeAllies=ownAllies.flatMap(p=>(room.field?.[p]||[])
    .map((idx,fieldIdx)=>({player:p,idx,fieldIdx,char:room.teams?.[p]?.[idx]}))
    .filter(v=>alive(v.char)));
  for(const idx of activeField){
    if(result[idx])continue;
    const current=currentActions?.[player]?.[idx];
    if(current){result[idx]=current;if(current.type==='switch')reserved.add(current.toIdx);continue;}
    const char=room.teams?.[player]?.[idx];
    if(!alive(char))continue;
    const life=hpRatio(char);
    let best={score:-Infinity,action:null};
    const consider=(action,score)=>{
      if(action && Number.isFinite(score) && score>best.score)best={action,score};
    };
    // L'uso delle cure tiene conto sia dell'urgenza sia della personalità.
    const healingAllowed=itemsUsed<healLimit && room.gameMode!=='battleroyale';
    if(healingAllowed){
      const urgency=(1-life)*style.heal;
      if(inv.cura_totale>0 && life<(styleId==='aggressive'?.23:styleId==='defensive'?.58:.43))
        consider({type:'use_item',itemId:'cura_totale',targetIdx:idx},63+urgency*100);
      if(inv.pozione>0 && life<(styleId==='aggressive'?.31:styleId==='defensive'?.67:.47))
        consider({type:'use_item',itemId:'pozione',targetIdx:idx},48+urgency*80);
      if(inv.pozione_rigenerante>0 && life<.68 &&
         !(char.statuses||[]).some(s=>s.type==='Rigenerazione'))
        consider({type:'use_item',itemId:'pozione_rigenerante',targetIdx:idx},
          29+urgency*60);
    }
    for(let moveIdx=0;moveIdx<(char.moves||[]).length;moveIdx++){
      const move=char.moves[moveIdx];
      if(!usable(move))continue;
      if(move.requiredStatus && !(char.statuses||[]).some(s=>s.type===move.requiredStatus))continue;
      if(move.requireSummonsDead && (room.teams?.[player]||[]).some(c=>
        alive(c)&&move.requireSummonsDead.includes(c.id)))continue;
      if(move.isCombo){
        const ids=activeField.filter(i=>alive(room.teams?.[player]?.[i]))
          .map(i=>room.teams[player][i].id);
        if(!move.isCombo.every(id=>ids.includes(id)))continue;
      }
      const self=(score)=>consider({type:'attack',moveIdx,targetPlayer:player,targetIdx:idx},score);
      const support=move.target==='self'||['team','team_smart_heal'].includes(move.targetMode)||
        move.isProtect||move.isSummon||move.randomSummon;
      if(support){
        if(move.heal||move.healAlone||move.healLastTurnDamage){
          const missing=1-life;
          if(missing>.12)self((20+115*missing)*style.heal + random()*7);
        }else if(move.isProtect){
          if(!(char.statuses||[]).some(s=>['Protetto','Scudo'].includes(s.type)) &&
             finite(char.consecutiveProtect)<1){
            const observed=enemies.some(e=>observedMovePattern(room,e));
            const threat=life<.48?1:observed?.6:0;
            self((15+threat*80)*style.support+random()*7);
          }
        }else if(move.statBuff||move.targetStatBuff){
          const buffed=(char.atk||0)>(char.baseAtk||char.atk||0)*1.1;
          if(!buffed)self((38+Math.max(0,life-.4)*12)*style.support+random()*6);
        }else if(move.isSummon||move.randomSummon){
          if(activeField.length<Math.max(2,finite(room.settings?.fieldSize,1)+2))
            self(53*style.support+random()*7);
        }else self(20*style.support+random()*6);
        continue;
      }
      if(move.targetMode==='revive'){
        for(const ally of legalRevive)consider({
          type:'attack',moveIdx,targetPlayer:ally.player,targetIdx:ally.idx
        },(132+random()*8)*style.support);
        continue;
      }
      if(move.targetMode==='ally'){
        for(const ally of activeAllies){
          const need=1-hpRatio(ally.char);
          if(need>.23)consider({
            type:'attack',moveIdx,targetPlayer:ally.player,targetIdx:ally.idx,
            targetFieldIdx:ally.fieldIdx
          },(24+need*110)*style.support+random()*6);
        }
        continue;
      }
      if(move.targetCount>1 && move.targetCount<4){
        const ranked=enemies.map(e=>{
          const mult=multiplierOf(getMultiplier,move.type,e.char.types);
          return {...e,score:strength(char,move,e.char,mult)};
        }).sort((a,b)=>b.score-a.score);
        const targets=ranked.slice(0,move.targetCount);
        if(targets.length){
          const dmg=targets.reduce((n,e)=>n+e.score,0);
          consider({type:'attack',moveIdx,selectedTargets:targets.map(e=>({
            player:e.player,idx:e.idx,fieldIdx:e.fieldIdx
          }))},(24+dmg*.75)*style.damage+random()*7);
        }
        continue;
      }
      for(const enemy of enemies){
        const mult=multiplierOf(getMultiplier,move.type,enemy.char.types);
        const dmg=strength(char,move,enemy.char,mult);
        const killChance=move.power>0&&mult>0&&
          dmg>=enemy.char.hp*.75?style.ko:0;
        const debuff=move.statusEffect&&!(enemy.char.statuses||[]).some(s=>
          s.type===move.statusEffect?.type)?(life>.28?22:12)*style.support:0;
        const drain=move.drain?(1-life)*37*style.heal:0;
        const score=(24+dmg +killChance)*style.damage+debuff+drain+
          finite(move.priority)*7+random()*9-(mult===0?220:0);
        consider({type:'attack',moveIdx,targetPlayer:enemy.player,
          targetIdx:enemy.idx,targetFieldIdx:enemy.fieldIdx},score);
      }
    }
    // Cambia SOLO quando il confronto con i Multimon visibili lo giustifica.
    // Il nemico non viene analizzato usando mosse non ancora osservate.
    const candidate=switchCandidate({room,player,char,charIdx:idx,
      activeField,enemies,style:styleId,getMultiplier,random,reserved});
    if(candidate && candidate.score*style.switch>best.score+17){
      best={score:candidate.score,action:{type:'switch',toIdx:candidate.idx}};
      reserved.add(candidate.idx);
    }
    if(!best.action){
      const fallback=(char.moves||[]).findIndex(usable);
      if(fallback>=0){
        const e=enemies[0];
        best.action={type:'attack',moveIdx:fallback,
          targetPlayer:e?.player||player,targetIdx:e?.idx??idx,
          ...(e?{targetFieldIdx:e.fieldIdx}:{})};
      }
    }
    if(!best.action)continue;
    result[idx]=best.action;
    if(best.action.type==='attack'){
      const move=char.moves[best.action.moveIdx];
      if(move?.isCombo)for(const partnerId of move.isCombo.filter(id=>id!==char.id)){
        const partner=activeField.find(i=>i!==idx&&alive(room.teams?.[player]?.[i])&&
          room.teams[player][i].id===partnerId);
        if(partner!==undefined && !currentActions?.[player]?.[partner])
          result[partner]={type:'combo_assist'};
      }
    }
  }
  // La forma Iper è scelta in un secondo momento, conservando le
  // condizioni della modalità originale e il limite una volta per lotta.
  const floor=room.isRoguelikeCoop?room.coopRun?.floor:roguelikeState?.floor;
  const hyperAllowed=!room.isRoguelikeBattle || finite(floor,1)>=30;
  if(!room.hyperUsed?.[player]&&hyperAllowed){
    const hyperIds=new Set(['barry','gardevoir','astral','polterpup','spongebob','patrick',
      'alphonse','ariana','bloom','gaston','jake','marceline','finn','natsu','juvia',
      'laxus','bumblebee','corvina','entoma','garnet','darwin','brago','iris','sdentato',
      'ladybug','bowser','rainbowdash','elsa','sheldon','charizard','maxcaulfield',
      'chloeprice','dolli','zatchbell','yoshi','poisonivy','carlos','leon','sage']);
    for(const [idx,action] of Object.entries(result)){
      const char=room.teams?.[player]?.[idx];
      if(action.type==='attack'&&hyperIds.has(char?.id)&&!char.isHyper){
        action.hyperize=true;break;
      }
    }
  }
  return result;
}
