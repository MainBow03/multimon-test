// Meccaniche esclusive per 15 Multimon, condivise dal motore locale e Firestore.
// I contatori di abilita e gli status sono salvati sui personaggi in battaglia.
import {earthGrassAlliedRoles} from './earthGrassEffects.js';

export const CRYSTAL_NEGATIVE_STATUSES = new Set([
 'Avvelenato','Scottato','Elettrizzato','Congelato','Addormentato','Confuso',
 'Indebolito','Stordito','Accecato','Incantato','Infatuato','Anima Distorta',
 'Assiderato','Marciume','Malinconia'
]);
const atLeastOne=n=>Math.max(1,Math.floor(n));
const ability=(c,txt)=>({type:'text',text:'✨ '+c.passive.name+': '+txt,
 isPassive:true,passiveChar:c.name,passiveName:c.passive.name});
const hpEvt=(c,role,idx,txt)=>({type:'damage',targetPlayer:role,targetIdx:idx,newHp:c.hp,
 text:txt,isPassive:true,passiveChar:c.name,passiveName:c.passive?.name||c.name});
const statusEvt=(c,role,idx,txt='')=>({type:'status_update',targetPlayer:role,targetIdx:idx,
 statuses:structuredClone(c.statuses||[]),text:txt});

export function crystalRockAllies({player,teams,field,mode,settings,isCoop=false}){
 const roles=earthGrassAlliedRoles(player,mode,settings,field,isCoop);
 return roles.flatMap(role=>(field?.[role]||[]).map(idx=>({player:role,idx,char:teams?.[role]?.[idx]})))
   .filter(t=>t.char?.hp>0);
}
function lowestDamaged(targets){
 return targets.filter(t=>t.char.hp<t.char.maxHp)
   .sort((a,b)=>a.char.hp/a.char.maxHp-b.char.hp/b.char.maxHp)[0]||null;
}
function recover(heal,char,factor){return heal(char,atLeastOne(char.maxHp*factor))}
export function giveCrystalBarrier(char,{reduce,turns,specialOnly=false}){
 if(!char||char.hp<=0||!(reduce>0)||!(turns>0))return false;
 char.statuses ||= [];
 const existing=char.statuses.find(s=>s.type==='Barriera Minerale'&&!!s.specialOnly===!!specialOnly);
 if(existing){
   existing.reduce=Math.max(existing.reduce,reduce);
   existing.turns=Math.max(existing.turns,turns);
   existing.justApplied=true;
 }else char.statuses.push({type:'Barriera Minerale',reduce,turns,specialOnly,justApplied:true});
 return true;
}
export function crystalBarrierFactor(defender,move){
 return (defender?.statuses||[]).filter(s=>s.type==='Barriera Minerale'&&
   (!s.specialOnly||!!move?.special)).reduce((f,s)=>Math.min(f,1-s.reduce),1);
}
export function crystalRockDamageFactor(attacker,move,isFirstAttackOfTurn=false){
 if(attacker?.hp<=0||!move||!(move.power>0))return 1;
 if(attacker.passive?.type==='lava_calm'&&['Roccia','Fuoco'].includes(move.type)&&
   attacker.hp/Math.max(1,attacker.maxHp)<=attacker.passive.threshold)
   return attacker.passive.damageBonus||1.15;
 if(attacker.passive?.type==='trained_scream'&&move.type==='Suono'&&isFirstAttackOfTurn)
   return attacker.passive.damageBonus||1.15;
 return 1;
}
export function crystalRockOnEnter(char,applyStat){
 if(char?.passive?.type!=='stone_guard'||char.hp<=0||char.stoneGuardUsed)return false;
 char.stoneGuardUsed=true;
 char.stoneGuardActive=true;
 applyStat(char,'spDef',1.2);
 return true;
}
export function crystalRockOnAction({attacker:char,move,turn,player,idx,teams,field,mode,
 settings,isCoop=false,heal,applyStat,targets=[],random=Math.random}){
 const output=[];
 if(char?.hp<=0||!move)return output;
 const role={player,teams,field,mode,settings,isCoop};
 const allies=crystalRockAllies(role);
 if(move.barrier){
   const targetsToProtect=move.targetMode==='team'?allies:
     move.targetMode==='ally'?targets.filter(t=>allies.some(a=>a.player===t.player&&a.idx===t.idx)):[{player,idx,char}];
   for(const to of targetsToProtect){
     if(giveCrystalBarrier(to.char,move.barrier)){
       output.push(statusEvt(to.char,to.player,to.idx));
       output.push({type:'text',text:'🛡️ '+move.name+': '+to.char.name+
         ' protetto per '+move.barrier.turns+' turni ('+Math.round(move.barrier.reduce*100)+
         '% danni'+(move.barrier.specialOnly?' speciali':'')+' in meno).'});
     }
   }
 }
 if(move.temporaryTeamBuff){
   const b=move.temporaryTeamBuff;
   for(const to of allies){
     to.char.statuses ||= [];
     let buff=to.char.statuses.find(s=>s.type==='Marcia Cremisi');
     if(!buff){
       applyStat(to.char,b.stat,b.multiplier);
       buff={type:'Marcia Cremisi',turns:b.turns,stat:b.stat,multiplier:b.multiplier,justApplied:true};
       to.char.statuses.push(buff);
     }else {buff.turns=Math.max(buff.turns,b.turns);buff.justApplied=true}
     output.push(statusEvt(to.char,to.player,to.idx));
   }
   output.push({type:'text',text:'🔥 Marcia Cremisi: Velocita +15% per 3 turni agli alleati attivi.'});
 }
 if(move.hotSkinTurns){
   char.statuses ||= [];
   char.statuses=char.statuses.filter(s=>s.type!=='Pelle Lavica');
   char.statuses.push({type:'Pelle Lavica',turns:move.hotSkinTurns,justApplied:true});
   output.push(statusEvt(char,player,idx,'🌋 La pelle di '+char.name+' diventa rovente per due turni!'));
 }
 if(move.selfEvasionBonus){
   char.evasionBonus=Math.min(.5,(char.evasionBonus||0)+move.selfEvasionBonus);
   output.push({type:'text',text:'🪽 '+char.name+' guadagna +10% elusione grazie a '+move.name+'.'});
 }
 if(!char.passive)return output;
 switch(char.passive.type){
  case 'perfect_elegance': {
   if(move.power>0)break;
   applyStat(char,'spDef',1.1);
   const to=lowestDamaged(allies);
   if(to){
     const n=recover(heal,to.char,.06);
     if(n>0)output.push(hpEvt(to.char,to.player,to.idx,
       '💎 Eleganza Perfetta: '+to.char.name+' recupera '+n+' PS!'));
   }
   output.push(ability(char,'Difesa Speciale +10% grazie al supporto.'));
   break;
  }
  case 'rebel_forge':{
   if(!(move.power>0)||!['Cristallo','Robot'].includes(move.type)||char.rebelForgeUsed)break;
   char.rebelForgeUsed=true;
   applyStat(char,'def',1.2);
   output.push(ability(char,'prima arma forgiata: Difesa +20%!'));
   break;
  }
  case 'music_beyond':{
   if(!(move.power>0)||move.type!=='Suono'||char.musicBeyondLastTurn===turn)break;
   const to=lowestDamaged(allies);if(!to)break;
   const healed=recover(heal,to.char,char.passive.healPercent||.07);
   if(healed>0){
     char.musicBeyondLastTurn=turn;
     output.push(hpEvt(to.char,to.player,to.idx,
       '🎸 Musica dell Altrove: '+to.char.name+' recupera '+healed+' PS!'));
   }
   break;
  }
 }
 return output;
}
export function crystalRockOnDamage({char,player,idx,teams,field,mode,settings,
 isCoop=false,move,attacker,attackerPlayer,attackerIdx,turn,damage=0,
 critical=false,heal,applyStat,random=Math.random}){
 const output=[];
 if(!char||char.hp<=0||!(damage>0))return output;
 const allies=crystalRockAllies({player,teams,field,mode,settings,isCoop});
 switch(char.passive?.type){
  case 'atlantean_heart': {
   if(char.atlanteanHeartUsed||char.hp/char.maxHp>.5)break;
   char.atlanteanHeartUsed=true;
   const healed=recover(heal,char,.2);
   if(healed>0)output.push(hpEvt(char,player,idx,
     '💠 Cuore di Atlantide: '+char.name+' recupera '+healed+' PS!'));
   for(const to of allies){
     giveCrystalBarrier(to.char,{reduce:.15,turns:2});
     output.push(statusEvt(to.char,to.player,to.idx));
   }
   output.push(ability(char,'la cupola del 15% protegge gli alleati per due turni.'));
   break;
  }
  case 'fragile_lucid':{
   if(char.fragileLucidUsed||(!critical&&char.hp/char.maxHp>.6))break;
   char.fragileLucidUsed=true;
   applyStat(char,'spd',1.2);
   output.push(ability(char,'la fragilita si trasforma in lucidita: Velocita +20%.'));
   break;
  }
  case 'mountain_eater':{
   if(!['Terra','Roccia'].includes(move?.type)||char.mountainEaterLastTurn===turn)break;
   const n=recover(heal,char,char.passive.healPercent??.1);
   if(n>0){
     char.mountainEaterLastTurn=turn;
     output.push(hpEvt(char,player,idx,
       '🪨 Fame di Montagne: '+char.name+' assorbe la roccia e recupera '+n+' PS!'));
   }
   break;
  }
  case 'adaptive_scarab':{
   if(!move||!attacker||attacker===char)break;
   const special=!!move.special;
   const key=special?'scarabSpecialUsed':'scarabPhysicalUsed';
   if(char[key])break;
   char[key]=true;
   applyStat(char,special?'spAtk':'atk',1.2);
   output.push(ability(char,(special?'Attacco Speciale':'Attacco')+' +20% contro il primo colpo '+(special?'speciale':'fisico')+'.'));
   break;
  }
 }
 if((char.statuses||[]).some(s=>s.type==='Pelle Lavica')&&move?.contact&&
    attacker&&attacker!==char&&attacker.hp>0&&!attacker.passive?.immuneToNegativeStatuses&&
    !(attacker.statuses||[]).some(s=>s.type==='Scottato')){
   attacker.statuses ||= [];
   attacker.statuses.push({type:'Scottato',turns:2});
   output.push(statusEvt(attacker,attackerPlayer,attackerIdx,
     '🌋 Colata Amichevole: '+attacker.name+' viene scottato toccando '+char.name+'!'));
 }
 return output;
}
export function crystalRockOnEndTurn({char,player,idx,teams,field,mode,settings,
 isCoop=false,heal,applyStat,random=Math.random}){
 const output=[];
 if(!char||char.hp<=0)return output;
 if(char.stoneGuardActive)char.stoneGuardActive=false;
 if(char.statuses){
   for(const st of [...char.statuses]){
     if(!['Barriera Minerale','Marcia Cremisi','Pelle Lavica'].includes(st.type))continue;
     if(st.justApplied){delete st.justApplied;continue}
     st.turns-=1;
     if(st.turns<=0){
       char.statuses=char.statuses.filter(s=>s!==st);
       if(st.type==='Marcia Cremisi'&&st.stat&&st.multiplier){
         applyStat(char,st.stat,1/st.multiplier);
       }
       output.push(statusEvt(char,player,idx,'⏳ '+st.type+' di '+char.name+' termina.'));
     }
   }
 }
 if(char.passive?.type==='nectar_healing'&&random()<(char.passive.chance??.35)){
   const allies=crystalRockAllies({player,teams,field,mode,settings,isCoop})
      .filter(t=>t.char!==char&&t.char.statuses?.some(s=>CRYSTAL_NEGATIVE_STATUSES.has(s.type)));
   if(allies.length){
     const to=allies[Math.floor(random()*allies.length)];
     const st=to.char.statuses.find(s=>CRYSTAL_NEGATIVE_STATUSES.has(s.type));
     to.char.statuses=to.char.statuses.filter(s=>s!==st);
     output.push(statusEvt(to.char,to.player,to.idx,
       '🐝 Nettare Curativo: '+char.name+' rimuove '+st.type+' da '+to.char.name+'!'));
     const healed=recover(heal,to.char,char.passive.healPercent??.1);
     if(healed>0)output.push(hpEvt(to.char,to.player,to.idx,
       '🍯 '+to.char.name+' riceve '+healed+' PS grazie al nettare di '+char.name+'!'));
   }
 }
 return output;
}
