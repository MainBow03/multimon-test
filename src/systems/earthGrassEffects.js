// Effetti originali dei sei nuovi Multimon. Lo stato e' sui fighter,
// quindi ogni turno rimane serializzabile nel salvataggio e in Firestore.
import {SHAYMIN_AWAKENED_IMAGE} from '../data/earthGrassChampions.js';

export function earthGrassAlliedRoles(role,mode,settings={},field={},isCoop=false){
 if(isCoop||mode==='roguelike_coop')return ['p1','p2','p3'].filter(p=>field[p]);
 if(mode==='multipla')return (['p1','p2'].includes(role)?['p1','p2']:['p3','p4']).filter(p=>field[p]);
 if(mode==='juggernaut'||mode==='survival'){
  const boss=settings?.juggernautPlayer||(mode==='survival'?'p2':'p1');
  return (role===boss?[boss]:Object.keys(field).filter(p=>p!==boss));
 }
 return [role];
}
export function tophSeismicEntry(char,role,teams,field,mode,settings,applyStat,events,isCoop=false,canDebuff=()=>true){
 if(!char?.passive?.earthSense||char.hp<=0)return null;
 const allies=new Set(earthGrassAlliedRoles(role,mode,settings,field,isCoop));
 const foes=Object.entries(field||{}).filter(([p])=>!allies.has(p))
  .flatMap(([p,indices])=>(indices||[]).map(idx=>({role:p,idx,char:teams[p]?.[idx]})))
  .filter(t=>t.char?.hp>0&&canDebuff(t.char))
  .sort((a,b)=>b.char.spd-a.char.spd||a.role.localeCompare(b.role)||a.idx-b.idx);
 if(!foes.length)return null;
 const target=foes[0];
 if(!applyStat(target.char,'spd',.9))return null;
 events?.push({type:'text',isPassive:true,passiveChar:char.name,passiveName:char.passive.name,
   text:'⛰️ Senso Sismico: '+char.name+' rallenta '+target.char.name+' del 10% della Velocita!'});
 return target;
}
export function gaaraSandGuardHit(char,damage,turnNumber){
 if(char?.passive?.type!=='sand_guard'||!(damage>0)||char.hp<=0)return {damage,activated:false};
 const turn=Number(turnNumber)||1;
 if(char.sandGuardLastTurn===turn)return {damage,activated:false};
 char.sandGuardLastTurn=turn;
 return {damage:Math.max(1,Math.floor(damage*(char.passive.guardFactor??.8))),activated:true};
}
export function gaaraSandThreshold(char,applyStat){
 if(char?.passive?.type!=='sand_guard'||char.sandGuardThresholdUsed||char.hp<=0||
    char.hp/Math.max(1,char.maxHp)>(char.passive.threshold??.5))return false;
 char.sandGuardThresholdUsed=true;
 return applyStat(char,'def',1.2);
}
export function flygonDuneEcho(char,move,applyStat){
 if(char?.passive?.type!=='dune_echo'||char.hp<=0||!(move?.power>0)||
    !['Terra','Drago'].includes(move.type)||
    (char.duneEchoCharges||0)>=(char.passive.maxTriggers??3))return null;
 char.duneEchoCharges=(char.duneEchoCharges||0)+1;
 const stat=move.type==='Terra'?'spd':'atk';
 applyStat(char,stat,1.1);
 return {stat,charges:char.duneEchoCharges};
}
export function flygonWyrmBonus(char,move){
 return move?.duneMomentumBonus && char?.id==='flygon' &&
   Number(char.spd)>Number(char.baseSpd||char.spd)
  ?move.duneMomentumBonus:1;
}
export function leafeonSpeedPower(char,target,move,firstAttack){
 return char?.passive?.type==='leaf_blade'&&move?.power>0&&firstAttack&&
   Number(char.spd)>Number(target?.spd)?(char.passive.damageBonus??1.15):1;
}
export function floraFairyGarden(char,move,role,teams,field,mode,settings,heal,isCoop=false){
 if(char?.passive?.type!=='fairy_garden'||char.hp<=0||move?.power!==0)return null;
 const allies=earthGrassAlliedRoles(role,mode,settings,field,isCoop)
  .flatMap(p=>(field[p]||[]).map(idx=>({role:p,idx,char:teams[p]?.[idx]})))
  .filter(t=>t.char?.hp>0&&t.char.hp<t.char.maxHp)
  .sort((a,b)=>a.char.hp/a.char.maxHp-b.char.hp/b.char.maxHp);
 if(!allies.length)return null;
 const target=allies[0],amount=Math.max(1,Math.floor(target.char.maxHp*char.passive.healLowestAllyPercent));
 const healed=heal(target.char,amount);
 return healed>0?{...target,healed}:null;
}
export function shayminSpringHeart(char,move,applyStat,heal){
 if(char?.passive?.type!=='spring_heart'||char.hp<=0||
    !(move?.heal>0||move?.removeNegativeStatuses)||
    (char.springHeartCharges||0)>=(char.passive.maxTriggers??4))return null;
 char.springHeartCharges=(char.springHeartCharges||0)+1;
 const hp=heal(char,Math.max(1,Math.floor(char.maxHp*(char.passive.healPercent??.05))));
 applyStat(char,'spd',1.05);
 return {hp,charges:char.springHeartCharges};
}
export function shayminAwakening(char,move,applyStat){
 if(char?.id!=='shaymin'||char.hp<=0||!move?.shayminAwakening||char.shayminAwakened)return null;
 char.shayminAwakened=true;
 for(const stat of ['atk','def','spd','spAtk','spDef'])applyStat(char,stat,1.2);
 char.img=SHAYMIN_AWAKENED_IMAGE;
 return {image:char.img,stats:Object.fromEntries(['atk','def','spd','spAtk','spDef'].map(k=>[k,char[k]]))};
}
