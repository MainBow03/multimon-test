// Ametraline, fusione Metamor di Coraline e Ametista.
// Le cariche, l'ultimo tipo e gli status sono salvati sul fighter per la sync PvP.
// Niente danni o debuff finti: tutti gli effetti mutano lo stato autorevole.
const isAmetraline=char=>char?.id==='ametraline' && char?.passive?.type==='metamor_stitched';
const cap=char=>char?.passive?.maxTriggers??4;
export function ametralineWillChangeType(char,move) {
 return isAmetraline(char)&&char.hp>0 && !!move?.type &&
   !!char.ametralineLastType && char.ametralineLastType!==move.type &&
   (char.ametralineCharges||0)<cap(char);
}
export function ametralineDamageFactor(char,move){
 return move?.power>0 && ametralineWillChangeType(char,move) ? 1.15 : 1;
}
export function ametralineOnSuccessfulAction(char,move){
 if(!isAmetraline(char)||char.hp<=0||!move?.type)return null;
 const changed=ametralineWillChangeType(char,move);
 char.ametralineLastType=move.type;
 if(!changed)return null;
 char.ametralineCharges=(char.ametralineCharges||0)+1;
 const shield=Math.max(1,Math.floor(char.maxHp*.08));
 // Il motore sa gia assorbire questo scudo prima del danno ai PS.
 char.crystalShieldHp=Math.min(char.maxHp,
   (char.crystalShieldHp||0)+shield);
 return {shield,remaining:char.crystalShieldHp,charges:char.ametralineCharges};
}
const negativeStatuses=new Set([
 'Avvelenato','Scottato','Elettrizzato','Congelato','Addormentato',
 'Confuso','Indebolito','Stordito','Accecato','Incantato','Infatuato',
 'Anima Distorta','Assiderato','Marciume','Malinconia','Bottoni del Vuoto'
]);
export function ametralineHasDebuff(char) {
 if(!char)return false;
 if((char.statuses||[]).some(s=>negativeStatuses.has(s.type)))return true;
 return ['atk','def','spd','spAtk','spDef'].some(k=>
    Number.isFinite(char['base'+k[0].toUpperCase()+k.slice(1)]) &&
    Number.isFinite(char[k])&&char[k]<char['base'+k[0].toUpperCase()+k.slice(1)]);
}
export function ametralineApplyButtons(attacker,target,applyStat,heal){
 if(attacker?.id!=='ametraline'||!target||target.hp<=0)return {applied:false,healed:0};
 target.statuses ||= [];
 if(target.statuses.some(s=>s.type==='Bottoni del Vuoto'))return {applied:false,healed:0,alreadyActive:true};
 const wasDebuffed=ametralineHasDebuff(target);
 const originalAtk=target.atk;
 const statApplied=applyStat(target,'atk',.8);
 const lostAtk=Math.max(0,originalAtk-target.atk);
 const previousAcc=Number.isFinite(target.acc)?target.acc:1;
 target.acc=previousAcc*.8;
 // Il moltiplicatore viene ripristinato dopo due fine-turno completi.
 target.statuses.push({type:'Bottoni del Vuoto',turns:2,justApplied:true,lostAtk,accuracyMultiplier:.8});
 target.ametralineButtonsPenalty={lostAtk,accuracyMultiplier:.8};
 const healed=wasDebuffed&&attacker.hp<attacker.maxHp
   ? heal(attacker,Math.max(1,Math.floor(attacker.maxHp*.2))):0;
 return {applied:true,statApplied,lostAtk,healed,turns:2};
}
export function ametralineTickButtons(char){
 if(!char)return null;
 const active=char.statuses?.find(s=>s.type==='Bottoni del Vuoto');
 if(active?.justApplied){delete active.justApplied;return {expired:false,remaining:active.turns};}
 if(active){
  active.turns-=1;
  if(active.turns>0)return {expired:false,remaining:active.turns};
 }
 // Recupera le statistiche anche se uno strumento o una cura ha gia
 // purificato lo status durante il turno.
 const penalty=char.ametralineButtonsPenalty||active;
 if(!penalty)return null;
 char.atk=Math.max(1,char.atk+(penalty.lostAtk||0));
 if(Number.isFinite(char.acc))char.acc=Math.min(2,char.acc/(penalty.accuracyMultiplier||.8));
 delete char.ametralineButtonsPenalty;
 char.statuses=(char.statuses||[]).filter(s=>s.type!=='Bottoni del Vuoto');
 return {expired:true,remaining:0};
}
