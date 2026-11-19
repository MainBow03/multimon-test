// Passive distintive dei 12 nuovi Multimon.
// Tutti i contatori e i marchi sono valori serializzabili nel fighter,
// quindi valgono allo stesso modo in locale, online, salvataggi e replay.
import {earthGrassAlliedRoles} from './earthGrassEffects.js';

const NEGATIVE = new Set(['Avvelenato','Scottato','Elettrizzato','Congelato','Addormentato',
 'Confuso','Indebolito','Stordito','Accecato','Incantato','Infatuato','Anima Distorta',
 'Assiderato','Marciume','Malinconia']);

const charges = c=>Number(c.newRealmCharges)||0;
const mark = c=>{c.newRealmCharges=charges(c)+1;};
const fresh = (c,turn)=>c.newRealmLastTurn!==turn;
const once = (c,turn)=>{c.newRealmLastTurn=turn;};
const usable = (c)=>c?.hp>0&&c?.passive&&c.passive.type;

function teamTargets({player,teams,field,mode,settings,isCoop}){
 const roles=earthGrassAlliedRoles(player,mode,settings,field,isCoop);
 return roles.flatMap(role=>(field[role]||[]).map(idx=>({player:role,idx,char:teams[role]?.[idx]})))
  .filter(t=>t.char?.hp>0);
}
function lowest(targets,damageOnly=true){
 const pool=damageOnly?targets.filter(t=>t.char.hp<t.char.maxHp):targets;
 return pool.sort((a,b)=>a.char.hp/Math.max(1,a.char.maxHp)-b.char.hp/Math.max(1,b.char.maxHp))[0]||null;
}
function enemyTargets({targets,foeRoles}){
 return (targets||[]).filter(t=>foeRoles.includes(t.player)&&t.char?.hp>0);
}
function healEvent(actor,to,amount,description){
 return {type:'damage',targetPlayer:to.player,targetIdx:to.idx,newHp:to.char.hp,
  text:'✨ '+actor.passive.name+': '+description+' ('+amount+' PS).',
  isPassive:true,passiveChar:actor.name,passiveName:actor.passive.name};
}
function textEvent(actor,description){
 return {type:'text',text:'✨ '+actor.passive.name+': '+description,
  isPassive:true,passiveChar:actor.name,passiveName:actor.passive.name};
}
function safeHeal(heal,c,percent){
 return heal(c,Math.max(1,Math.floor(c.maxHp*percent)));
}

export function newRealmOnAction(options){
 const {attacker:c,move,turn,player,teams,field,mode,settings,isCoop=false,
  targets=[],foeRoles=[],applyStat,heal,canDebuff=()=>true,random=Math.random}=options;
 const out=[];
 if(!usable(c)||!move)return out;
 const allies=teamTargets({player,teams,field,mode,settings,isCoop});
 const enemies=enemyTargets({targets,foeRoles}).filter(t=>canDebuff(t.char));
 const foe=enemies[0]||null;
 const offensive=move.power>0;
 const support=!offensive;
 const use=(text)=>out.push(textEvent(c,text));
 switch(c.passive.type){
  case 'ancestor_guard': {
   if(!offensive||move.type!=='Fuoco'||!fresh(c,turn))break;
   const ally=lowest(allies);
   if(!ally)break;
   const n=safeHeal(heal,ally.char,.07);
   if(n>0){once(c,turn);out.push(healEvent(c,ally,n,ally.char.name+' riceve aiuto dagli antenati'));}
   break;
  }
  case 'river_memory':{
   if(!support||charges(c)>=(c.passive.maxTriggers??3))break;
   mark(c);
   const status=(c.statuses||[]).find(s=>NEGATIVE.has(s.type));
   if(status){
    c.statuses=c.statuses.filter(s=>s!==status);
    out.push({type:'status_update',targetPlayer:player,targetIdx:options.idx,
      statuses:structuredClone(c.statuses),
      text:'🌊 '+c.name+' lascia scorrere via '+status.type+'!',isPassive:true,
      passiveChar:c.name,passiveName:c.passive.name});
   }
   applyStat(c,'spd',1.1);
   use(c.name+' recupera un ricordo e ottiene Velocita +10% ('+charges(c)+'/3).');
   break;
  }
  case 'single_wish':{
   if(!support||charges(c)>0)break;
   const to=lowest(allies,false);if(!to)break;
   mark(c);
   const n=safeHeal(heal,to.char,.15);
   applyStat(to.char,'def',1.1);
   if(n>0)out.push(healEvent(c,to,n,to.char.name+' viene curato dal desiderio'));
   use(to.char.name+' riceve anche Difesa +10%. Desiderio consumato.');
   break;
  }
  case 'cipher_contract':{
   if(!foe||!offensive||move.type!=='Buio'||charges(c)>=(c.passive.maxTriggers??3)||random()>=.35)break;
   const stats=['atk','def','spd'];
   const stat=stats[Math.min(2,Math.floor(random()*3))];
   if(applyStat(foe.char,stat,.85)){
    mark(c);
    use(foe.char.name+' perde 15% '+({atk:'Attacco',def:'Difesa',spd:'Velocita'}[stat])+' ('+charges(c)+'/3).');
   }
   break;
  }
  case 'silent_hunger':{
   if(!foe||!offensive||charges(c)>=(c.passive.maxTriggers??2)||c.hp>=c.maxHp)break;
   if(!(foe.char.statuses||[]).some(s=>NEGATIVE.has(s.type)))break;
   const n=safeHeal(heal,c,.12);
   if(n>0){mark(c);out.push(healEvent(c,{player,idx:options.idx,char:c},n,
     c.name+' assorbe energia da '+foe.char.name+' ('+charges(c)+'/2)'));}
   break;
  }
  case 'silk_hunter':{
   if(!foe||!offensive||move.type!=='Insetto'||charges(c)>=(c.passive.maxTriggers??2))break;
   if(applyStat(foe.char,'spd',.9)){mark(c);use(foe.char.name+' resta intrappolato: Velocita -10% ('+charges(c)+'/2).');}
   break;
  }
  case 'mouser_project':{
   if(!foe||!offensive||move.type!=='Robot')break;
   // Contatore distinto per bersaglio, legato a questo Baxter e non condiviso con altri.
   const targetKey=foe.player+':'+foe.idx;
   c.mouserTargets ||= {};
   const targetState=c.mouserTargets[targetKey] ||= {marks:0,activations:0};
   if(targetState.activations>=(c.passive.maxTriggersPerEnemy??2))break;
   targetState.marks+=1;
   if(targetState.marks>=2){
     targetState.marks=0;
     if(applyStat(foe.char,'def',.8)){
      targetState.activations+=1;
      use('due marchi su '+foe.char.name+': Difesa -20% ('+targetState.activations+'/2 per nemico).');
     }
   }else use(foe.char.name+' riceve un marchio dei microbot.');
   break;
  }
  case 'wayfinder':{
   if(!support||charges(c)>=(c.passive.maxTriggers??2))break;
   const to=lowest(allies,false);if(!to)break;
   mark(c);
   const n=safeHeal(heal,to.char,.06);
   applyStat(to.char,'spd',1.1);
   if(n>0)out.push(healEvent(c,to,n,to.char.name+' segue la corrente'));
   use(to.char.name+' ottiene Velocita +10% ('+charges(c)+'/2).');
   break;
  }
  case 'ocean_song':{
   if(!offensive||move.type!=='Suono'||!fresh(c,turn))break;
   const to=lowest(allies);if(!to)break;
   const n=safeHeal(heal,to.char,.07);
   if(n>0){once(c,turn);out.push(healEvent(c,to,n,to.char.name+' ritrova il ritmo delle maree'));}
   break;
  }
  case 'frozen_trail':{
   if(!foe||!offensive||move.type!=='Ghiaccio'||!fresh(c,turn)||
      charges(c)>=(c.passive.maxTriggers??2))break;
   if(applyStat(foe.char,'spd',.9)){
    once(c,turn);mark(c);use(foe.char.name+' scivola sulla pista: Velocita -10% ('+charges(c)+'/2).');
   }
   break;
  }
  case 'avatar_balance':{
   if(!offensive||!['Acqua','Terra'].includes(move.type))break;
   const previous=c.avatarLastElement;
   c.avatarLastElement=move.type;
   if(!previous||previous===move.type||charges(c)>=(c.passive.maxTriggers??3))break;
   const stat=move.type==='Terra'?'atk':'def';
   applyStat(c,stat,1.1);mark(c);
   use(c.name+' alterna gli elementi: +10% '+(stat==='atk'?'Attacco':'Difesa')+' ('+charges(c)+'/3).');
   break;
  }
 }
 return out;
}

// Ponyo non possiede piu una passiva di soglia PS; la purificazione e al termine del turno.
export function newRealmOnEndTurn({char,player,idx,teams,field,mode,settings,
 isCoop=false,heal,random=Math.random}){
 if(char?.passive?.type!=='living_sea'||char.hp<=0||random()>=(char.passive.chance??.3))return [];
 const friends=teamTargets({player,teams,field,mode,settings,isCoop})
   .filter(t=>t.char!==char&&t.char.statuses?.some(s=>NEGATIVE.has(s.type)));
 if(!friends.length)return [];
 const target=friends[Math.floor(random()*friends.length)];
 const statusIndex=target.char.statuses.findIndex(s=>NEGATIVE.has(s.type));
 if(statusIndex<0)return [];
 const [cleansed]=target.char.statuses.splice(statusIndex,1);
 const recovered=safeHeal(heal,char,char.passive.healPercent??.1);
 const result=[{type:'status_update',targetPlayer:target.player,targetIdx:target.idx,
   statuses:structuredClone(target.char.statuses),isPassive:true,
   passiveChar:char.name,passiveName:char.passive.name,
   text:'🌊 '+char.name+' purifica '+cleansed.type+' da '+target.char.name+'!'}];
 if(recovered>0)result.push(healEvent(char,{player,idx,char},recovered,
   char.name+' recupera PS per aver aiutato '+target.char.name));
 return result;
}

// Conservato come funzione neutra per gli altri utilizzatori del motore.
export function newRealmOnDamage(){return [];}
