// ASCESA DEL COLOSSEO • Ponte al VERO motore di combattimento di Multimon.
// Non replica le formule: usa calculateTurnImpl con la stessa coda
// (priorità > velocità), gli stessi status, buff, passive, protezioni e danni
// delle sfide classiche. Solo EXP/Prismaball/percorso restano propri del Colosseo.
import {initialGameState} from './gameState.js';
import {calculateTurnImpl,calculateDamageImpl,applyOnEnterPassiveImpl} from './battleSystem.js';
import {getMultiplier} from './typeSystem.js';
import {MOVES_DB} from '../data/moves.js';

const clone=x=>structuredClone(x);
const slots=['p1','p2'];
export function ascensionNativeFighter(member,chars){
 if(!member)return null;
 const original=chars.find(c=>c.id===member.id);
 if(!original)throw Error('Multimon del Colosseo sconosciuto: '+member.id);
 const level=Math.max(1,Math.min(10,Math.trunc(member.level)||1));
 const scale=.7+.04*(level-1);
 const stat=(n,backup)=>Math.max(1,Math.round((Number(n)||Number(backup)||80)*scale));
 const maxHp=Math.max(10,Math.round((original.maxHp||original.hp||100)*scale));
 const fighter={
  ...clone(original),level,maxHp,hp:Math.max(0,Math.min(maxHp,Number(member.hp)??maxHp)),
  atk:stat(original.atk,80),def:stat(original.def,80),spd:stat(original.spd,80),
  spAtk:stat(original.spAtk,original.atk),spDef:stat(original.spDef,original.def),
  revealed:true,acc:1,consecutiveProtect:0,passiveUses:0,statuses:[],
  zodiacSpiritId:member.zodiacSpiritId,
  moves:(original.moves||[]).filter(Boolean).map(move=>({
   ...clone(move),...(move.maxUses!=null?{remainingUses:move.maxUses}: {})
  }))
 };
 Object.assign(fighter,{
  baseAtk:fighter.atk,baseDef:fighter.def,baseSpd:fighter.spd,
  baseSpAtk:fighter.spAtk,baseSpDef:fighter.spDef
 });
 // Conserva effetti, PP e variazioni del turno precedente senza
 // riportare gli incrementi di livello dentro lo stesso combattimento.
 const persisted=member.battleState;
 if(persisted){
  for(const [key,value] of Object.entries(persisted)){
   if(key!=='id'&&key!=='level'&&key!=='name'&&key!=='img'&&
      key!=='types'&&key!=='passive'&&key!=='isSecretUnlock')
    fighter[key]=clone(value);
  }
 }
 fighter.hp=Math.max(0,Math.min(maxHp,Number(member.hp)||0));
 fighter.maxHp=maxHp;
 fighter.level=level;
 return fighter;
}
export function ascensionNativeTurn({
 characters,teamOne,teamTwo,fieldOne,fieldTwo,actionsOne,actionsTwo,
 names=['Allenatore','Avversario'],fieldSize=1,weather=null,tailwind={},turn=1,
 initialEvents=[]
}){
 const state=initialGameState();
 state.status='battling';
 state.gameMode='classica';
 state.isCampaignBattle=false;
 state.settings={...state.settings,teamSize:Math.max(teamOne.length,teamTwo.length),fieldSize};
 state.players={...state.players,p1:names[0],p2:names[1]};
 state.teams={...state.teams,p1:clone(teamOne),p2:clone(teamTwo)};
 state.field={...state.field,p1:[...fieldOne],p2:[...fieldTwo]};
 state.battleWeather=weather;
 state.battleTailwind=clone(tailwind);
 state.battleReport={...state.battleReport,turns:Math.max(0,turn-1)};
 // Le passsive d'ingresso sono attivate COME nel combattimento originale,
 // prima che venga formata la coda del primo turno. Lucy è già evocata
 // nelle lotte selvatiche (e in quel caso non viene duplicata).
 const entryEvents=[...initialEvents];
 if(turn===1)for(const side of slots){
  const startingField=[...(state.field[side]||[])];
  for(const idx of startingField){
   const actor=state.teams[side]?.[idx];
   if(!actor||actor.hp<=0||actor.passive?.type!=='on_enter')continue;
   if(actor.id==='lucy'&&state.teams[side].some(c=>c?.isZodiacSpirit))continue;
   actor.passiveUses=(actor.passiveUses||0)+1;
   applyOnEnterPassiveImpl({CHARACTERS:characters},actor,side,idx,
    state.teams,state.field,entryEvents,'classica',state.settings,false);
  }
 }
 const allActions={p1:clone(actionsOne||{}),p2:clone(actionsTwo||{})};
 let result=null;
 const ctx={
  CHARACTERS:characters,FUSION_CHARACTERS:[],ITEMS_DB:{},MOVES_DB,
  appMode:'local_room',gameState:state,
  getActivePlayers:()=>slots,
  getMultiplier,getTournamentMatchOpponents:()=>[],
  calculateDamage:(...args)=>calculateDamageImpl({},...args),
  playerName:names[0],
  updateLocalStats:()=>{},
  updateState:update=>{result=update;return Promise.resolve(true);}
 };
 calculateTurnImpl(ctx,allActions);
 if(!result)throw Error('Il motore classico non ha completato il turno.');
 return {
  teams:{p1:result.teams.p1,p2:result.teams.p2},
  field:{p1:result.field.p1,p2:result.field.p2},
  startTeams:{p1:result.startOfTurnTeams.p1,p2:result.startOfTurnTeams.p2},
  startField:{p1:result.startOfTurnField.p1,p2:result.startOfTurnField.p2},
  events:[...entryEvents,...(result.events||[])],
  weather:result.battleWeather||null,tailwind:result.battleTailwind||{},
  winner:result.winner,status:result.postExecStatus,
  log:[...entryEvents,...(result.events||[])].map(e=>e.text).filter(Boolean),
  battleReport:result.battleReport
 };
}
export const ascensionNativeMoveAction=(index,targetPlayer='p2',targetIdx=0)=>({
 type:'attack',moveIdx:index,targetPlayer,targetIdx,targetFieldIdx:0
});
