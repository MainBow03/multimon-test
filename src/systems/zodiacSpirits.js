import {applyBattleStatModifier} from './statBalance.js';

export const ZODIAC_SPIRITS = Object.freeze([
 {id:'zodiac_aries',name:'Aries',type:'Folletto',role:'Supporto: sonno e cure',img:'https://i.pinimg.com/736x/8e/73/6b/8e736b32374431f6dd0270a6e90ed075.jpg',secondary:'Nebbia del Sonno: 40% Addormentato'},
 {id:'zodiac_taurus',name:'Taurus',type:'Lotta',role:'Attaccante fisico',img:'https://i.pinimg.com/736x/fb/67/5d/fb675d7c6662cb3b2054645f2d427590.jpg',secondary:'Ruggito Possente: +50% Attacco a Taurus'},
 {id:'zodiac_gemini',name:'Gemini',type:'Psico',role:'Inganno e copie',img:'https://i.pinimg.com/736x/e2/d7/bb/e2d7bb1bce642b1d9dd2db9bb2694a2e.jpg',secondary:'Confusione Gemella: 50% Confuso'},
 {id:'zodiac_cancer',name:'Cancer',type:'Robot',role:'Colpi multipli e difese',img:'https://i.pinimg.com/736x/ea/97/4c/ea974cc620b0212432439eec9600d669.jpg',secondary:'Difesa del Granchio: +20 Difesa e Velocità a Cancer'},
 {id:'zodiac_leo',name:'Leo',type:'Terra',role:'Attacco e velocità',img:'https://i.pinimg.com/736x/ba/0d/69/ba0d697288bfb45ba6ba45c85c09a14a.jpg',secondary:'Aura del Re: +50% Attacco e Velocità a Leo'},
 {id:'zodiac_virgo',name:'Virgo',type:'Terra',role:'Prigionia e purificazione',img:'https://i.pinimg.com/1200x/57/9d/d0/579dd040e158038c6eeadc9e7cadf7e2.jpg',secondary:'Prigione Sotterranea: 3 turni'},
 {id:'zodiac_aquarius',name:'Aquarius',type:'Acqua',role:'Meteo e danni',img:'https://i.pinimg.com/1200x/7c/af/d6/7cafd6dcb3349fcedaf925744102d242.jpg',secondary:'Diluvio di Aquarius: Pioggia per 5 turni'},
 {id:'zodiac_scorpio',name:'Scorpio',type:'Veleno',role:'Veleno e priorità',img:'https://www.clipartkey.com/mpngs/m/176-1769122_transparent-scorpio-png-scorpio-fairy-tail-celestial-spirits.png',secondary:'Puntura Mortale: 50% Avvelenato'}
]);
export const DEFAULT_ZODIAC_SPIRIT = 'zodiac_aries';
const BY_ID=Object.fromEntries(ZODIAC_SPIRITS.map(s=>[s.id,s]));
export const isZodiacSpiritId=id=>Boolean(BY_ID[id]);
export const normalizeZodiacSpirit=id=>isZodiacSpiritId(id)?id:DEFAULT_ZODIAC_SPIRIT;
export const zodiacSpiritInfo=id=>BY_ID[normalizeZodiacSpirit(id)];

/** Alive celestial spirit belonging to this particular Lucy (not another user's Lucy). */
export function activeZodiacSpirit(teams,field,player,lucyTeamIdx){
 const active=field?.[player]||[],roster=teams?.[player]||[];
 const index=active.find(i=>roster[i]?.hp>0 && roster[i].isZodiacSpirit &&
    roster[i].zodiacLucyIdx===lucyTeamIdx && roster[i].zodiacOwner===player);
 return index===undefined?null:{idx:index,char:roster[index],player};
}
export function summonZodiacSpirit(teams,field,player,lucyTeamIdx,lookup){
 const lucy=teams?.[player]?.[lucyTeamIdx];
 if(!lucy || lucy.id!=='lucy' || lucy.hp<=0 || !field?.[player]?.includes(lucyTeamIdx))return null;
 if(activeZodiacSpirit(teams,field,player,lucyTeamIdx))return null; // one active at a time
 const spiritId=normalizeZodiacSpirit(lucy.zodiacSpiritId);
 const base=lookup.find(c=>c.id===spiritId && c.isSummonOnly);
 if(!base)return null;
 const spirit=JSON.parse(JSON.stringify(base));
 Object.assign(spirit,{statuses:[],consecutiveProtect:0,baseAtk:base.atk,
   baseDef:base.def,baseSpd:base.spd,baseSpAtk:base.spAtk??base.atk,
   baseSpDef:base.spDef??base.def,spAtk:base.spAtk??base.atk,
   spDef:base.spDef??base.def,revealed:true,isZodiacSpirit:true,
   zodiacOwner:player,zodiacLucyIdx:lucyTeamIdx});
 spirit.moves=spirit.moves.map(m=>({...m,remainingUses:m.maxUses??null}));
 teams[player].push(spirit);
 const idx=teams[player].length-1;
 field[player].push(idx);
 lucy.zodiacSpiritId=spiritId;
 return {char:spirit,idx,spiritId};
}
export const ZODIAC_TRAP='Prigione Sotterranea';
export const ZODIAC_DODGE='Doppio Fantasma';
export function addZodiacTrap(target,turns=3){
 if(!target || target.hp<=0 || target.passive?.immuneToNegativeStatuses)return false;
 target.statuses ||= [];
 const old=target.statuses.find(s=>s.type===ZODIAC_TRAP);
 if(old)old.turns=turns;
 else target.statuses.push({type:ZODIAC_TRAP,turns});
 return true;
}
export function zodiacTrapSpeedFactor(character){
 return character?.statuses?.some(s=>s.type===ZODIAC_TRAP)?0.5:1;
}
export function zodiacTrapMisses(character,random=Math.random){
 return Boolean(character?.statuses?.some(s=>s.type===ZODIAC_TRAP))&&random()<.5;
}
export function addZodiacDodge(char){
 char.statuses ||= [];
 if(!char.statuses.some(s=>s.type===ZODIAC_DODGE))
   char.statuses.push({type:ZODIAC_DODGE,turns:99});
}
export function consumeZodiacDodge(char){
 const idx=char?.statuses?.findIndex(s=>s.type===ZODIAC_DODGE)??-1;
 if(idx<0)return false;
 char.statuses.splice(idx,1);
 return true;
}
export function zodiacFlatStatBoost(char,stat,amount=20){
 if(!char || !['def','spd'].includes(stat))return false;
 const base=char[stat==='def'?'baseDef':'baseSpd']??char[stat];
 const previous=char[stat];
 char[stat]=Math.min(Math.round(base*2),previous+amount);
 return char[stat]!==previous;
}
export function cleanLucyDebuffs(lucy){
 if(!lucy || lucy.hp<=0)return false;
 const negative=new Set(['Avvelenato','Scottato','Elettrizzato','Congelato','Addormentato','Confuso','Indebolito','Stordito','Accecato','Infatuato','Incantato','Anima Distorta',ZODIAC_TRAP]);
 const before=lucy.statuses?.length||0;
 lucy.statuses=(lucy.statuses||[]).filter(s=>!negative.has(s.type));
 let changed=lucy.statuses.length<before;
 for(const [stat,baseKey] of [['atk','baseAtk'],['def','baseDef'],['spd','baseSpd']]){
  if(Number.isFinite(lucy[baseKey]) && lucy[stat]<lucy[baseKey]){lucy[stat]=lucy[baseKey];changed=true;}
 }
 if(lucy.acc<1){lucy.acc=1;changed=true;}
 return changed;
}
export function zodiacSecondaryRoll(spiritId,random=Math.random){
 const id=normalizeZodiacSpirit(spiritId);
 switch(id){
  case 'zodiac_aries':return {status:random()<.4?'Addormentato':null};
  case 'zodiac_taurus':return {buff:{atk:1.5}};
  case 'zodiac_gemini':return {status:random()<.5?'Confuso':null};
  case 'zodiac_cancer':return {flatBuff:{def:20,spd:20}};
  case 'zodiac_leo':return {buff:{atk:1.5,spd:1.5}};
  case 'zodiac_virgo':return {trapTurns:3};
  case 'zodiac_aquarius':return {rainTurns:5};
  case 'zodiac_scorpio':return {status:random()<.5?'Avvelenato':null};
  default:return {};
 }
}
