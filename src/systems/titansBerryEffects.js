import {supportTeamPlayers} from './supportTargeting.js';

// Robin viene sostenuto dai suoi quattro compagni: massimo quattro attivazioni
// dopo aver subito veri attacchi nemici. L'abilità non scatta da meteo,
// veleno, riflesso o attacchi assorbiti dagli scudi.
export const TITANS_ROBIN_CHANCE=0.50;
export const TITANS_ROBIN_MAX=4;
export const TITANS_ROBIN_FACTOR=1.10;
export const TITANS_RANDOM_STATS=Object.freeze(['atk','def','spd','evasion']);
const STAT_NAMES={atk:'Attacco',def:'Difesa',spd:'Velocità',evasion:'Elusione'};

export function activateTitansRobin(robin,applyModifier,random=Math.random){
  if(robin?.passive?.type!=='titans_report'||robin.hp<=0||
     (robin.titansReportUses||0)>=TITANS_ROBIN_MAX||random()>=TITANS_ROBIN_CHANCE)return null;
  const stat=TITANS_RANDOM_STATS[Math.min(3,Math.floor(random()*TITANS_RANDOM_STATS.length))];
  robin.titansReportUses=(robin.titansReportUses||0)+1;
  if(stat==='evasion')
    robin.evasionBonus=Math.min(0.95,(Number(robin.evasionBonus)||0)+0.10);
  else
    applyModifier(robin,stat,TITANS_ROBIN_FACTOR);
  return {stat,statName:STAT_NAMES[stat],uses:robin.titansReportUses};
}

// Nightwing guarda le mosse usate dai NEMICI e anticipa i loro piani.
// Una singola mossa che aumenta 2–3 statistiche attiva una sola schivata +10%.
// Eventi di ingresso, strumenti, riduzioni e semplici attacchi non contano.
export const NIGHTWING_EVASION_GAIN=0.10;
export function createNightwingBuffWatcher(teams,field,state,events){
  let actingPlayer=null,activeMove=null;
  let triggered=new Set();
  const active=()=>Object.entries(field||{}).flatMap(([p,slots])=>
    (slots||[]).map(idx=>({player:p,char:teams?.[p]?.[idx]}))
      .filter(x=>x.char?.hp>0));
  return {
    beginAction(player,move){
      actingPlayer=player;
      activeMove=move||null;
      triggered=new Set();
    },
    onStatGain(source,stat,before,after){
      if(!activeMove||!actingPlayer||after<=before||
         !['atk','def','spd','spAtk','spDef'].includes(stat)||
         !(activeMove.statBuff||activeMove.selfStatBuff||activeMove.targetStatBuff))
        return;
      const current=active();
      const sourceOwner=current.find(x=>x.char===source)?.player;
      if(!sourceOwner)return;
      const players=Object.keys(teams||{});
      const actorAllies=supportTeamPlayers({...state,teams},actingPlayer,players);
      if(!actorAllies.includes(sourceOwner))return;
      for(const {player,char} of current){
        if(char?.passive?.type!=='nightwing_one_step_ahead'||actorAllies.includes(player)||
           triggered.has(char))continue;
        triggered.add(char);
        char.evasionBonus=Math.min(0.95,(Number(char.evasionBonus)||0)+NIGHTWING_EVASION_GAIN);
        events.push({type:'text',text:'🦇 '+char.name+
          ' attiva Sempre un passo avanti: anticipa '+activeMove.name+
          ' e aumenta la propria elusione del 10%!',
          isPassive:true,passiveChar:char.name,passiveName:char.passive.name});
      }
    }
  };
}

// Scivolata Gelata: una sola guarigione per mossa che colpisce, a Berry
// e a tutti gli alleati VIVI in campo, inclusi giocatori amici in multiplayer.
export function healBerrySlideAllies(attacker,move,owner,teams,field,state,events,
                                    activePlayers=Object.keys(teams||{})){
  if(attacker?.id!=='berry'||!move?.berryTeamHeal||attacker.hp<=0)return 0;
  const allies=supportTeamPlayers({...state,teams},owner,activePlayers);
  let healed=0;
  for(const p of allies)
    for(const idx of (field?.[p]||[])){
      const char=teams?.[p]?.[idx];
      if(!char||char.hp<=0||char.hp>=char.maxHp)continue;
      const heal=Math.min(char.maxHp-char.hp,
        Math.max(1,Math.floor(char.maxHp*move.berryTeamHeal)));
      char.hp+=heal;
      healed+=heal;
      events.push({type:'damage',targetPlayer:p,targetIdx:idx,newHp:char.hp,
        text:'🍨 '+attacker.name+' usa '+move.name+': '+char.name+
          ' recupera '+heal+' PS!'});
    }
  return healed;
}
