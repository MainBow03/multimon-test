import { CHAR_PRICES } from '../data/prices.js';

// Un personaggio può coprire più ruoli: è una stima basata su
// statistiche, mosse e passive reali, non una classe permanente.
export const TEAM_ROLES = Object.freeze([
  {id:'all',label:'Tutti i ruoli'},
  {id:'attacker',label:'⚔️ Attaccante'},
  {id:'tank',label:'🛡️ Difensore'},
  {id:'healer',label:'💚 Curatore'},
  {id:'support',label:'✨ Supporto'},
  {id:'control',label:'🌀 Controllo'}
]);
export function characterPrice(char){
  return Math.max(0,Number(char?.price ?? CHAR_PRICES[char?.id] ?? 0)||0);
}
export function getCharacterRoles(char){
  if(!char) return [];
  const moves=(char.moves||[]).filter(Boolean);
  const passive=char.passive||{};
  const roles=[];
  if((char.atk||0)>=110 || moves.some(m=>(m.power||0)>=110))roles.push('attacker');
  if((char.def||0)>=100 || (char.maxHp||char.hp||0)>=115 || moves.some(m=>m.isProtect||m.crystalShieldPercent))roles.push('tank');
  if(moves.some(m=>m.heal||m.healFlat||m.selfHeal||m.healLastTurnDamage||m.healLowestAllyPercent||m.targetMode==='team_smart_heal'||m.targetMode==='revive') ||
    passive.healPercent||passive.healLowestAllyPercent)roles.push('healer');
  if(moves.some(m=>m.targetMode==='ally'||m.targetMode==='team'||m.targetStatBuff||m.teamStatBuff)||
    passive.teamStatBuff||passive.applyStatusToTeam)roles.push('support');
  if(moves.some(m=>m.targetStatDebuff||m.statusEffect||m.statusEffects||m.hitStatDebuff||m.taunt)||
    passive.enemyStatDebuff||passive.enemyStatusEffect||passive.randomStatDebuffToRandomEnemy)roles.push('control');
  return roles.length?roles:['attacker'];
}
export function filterTeamRoster(chars,{type='Tutti',search='',role='all',price='all',favoritesOnly=false,favorites=[],sort='default'}={}){
  const favs=new Set(favorites);
  const query=String(search).trim().toLocaleLowerCase('it');
  const result=(chars||[]).filter(char=>{
    const cost=characterPrice(char);
    if(type!=='Tutti' && !char.types?.includes(type))return false;
    if(query && !char.name?.toLocaleLowerCase('it').includes(query))return false;
    if(role!=='all'&&!getCharacterRoles(char).includes(role))return false;
    if(price==='free' && cost!==0)return false;
    if(price==='cheap' && (cost<1 || cost>150))return false;
    if(price==='medium' && (cost<151||cost>250))return false;
    if(price==='premium' && cost<=250)return false;
    if(favoritesOnly&&!favs.has(char.id))return false;
    return true;
  });
  if(sort==='alpha')result.sort((a,b)=>a.name.localeCompare(b.name,'it'));
  else if(sort==='type')result.sort((a,b)=>(a.types?.[0]||'').localeCompare(b.types?.[0]||'','it'));
  else if(sort==='attack')result.sort((a,b)=>(b.atk||0)-(a.atk||0));
  else if(sort==='defense')result.sort((a,b)=>(b.def||0)-(a.def||0));
  else if(sort==='speed')result.sort((a,b)=>(b.spd||0)-(a.spd||0));
  else if(sort==='health')result.sort((a,b)=>(b.maxHp||b.hp||0)-(a.maxHp||a.hp||0));
  else if(sort==='price_asc')result.sort((a,b)=>characterPrice(a)-characterPrice(b));
  else if(sort==='price_desc')result.sort((a,b)=>characterPrice(b)-characterPrice(a));
  return result;
}
