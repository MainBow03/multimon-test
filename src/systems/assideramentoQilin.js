// Assideramento: controllo effettivo dell'iniziativa e dei danni.
// Dura due turni COMPLETI dopo la sua applicazione e non blocca le mosse.
export const ASSIDERAMENTO_STATUS='Assiderato';
export const ASSIDERAMENTO_TURNS=2;
export const ASSIDERAMENTO_SPEED_FACTOR=0.5;
export const ASSIDERAMENTO_DAMAGE_FACTOR=0.7;
export const hasAssideramento=char=>!!char?.statuses?.some(s=>s?.type===ASSIDERAMENTO_STATUS&&s.turns>0);
export const assideramentoSpeedFactor=char=>hasAssideramento(char)?ASSIDERAMENTO_SPEED_FACTOR:1;
export const assideramentoDamageFactor=char=>hasAssideramento(char)?ASSIDERAMENTO_DAMAGE_FACTOR:1;
export function tickAssideramento(char){
 if(!Array.isArray(char?.statuses))return false;
 const s=char.statuses.find(x=>x?.type===ASSIDERAMENTO_STATUS);
 if(!s)return false;
 if(s.justApplied){delete s.justApplied;return false;}
 s.turns=(Number(s.turns)||0)-1;
 if(s.turns>0)return false;
 char.statuses=char.statuses.filter(x=>x!==s);
 return true;
}

// Ganyu: Sigilli Qilin (0 -> 1 -> 2 -> fioritura).
// Una carica PER MOSSA riuscita, mai una per bersaglio o per colpo multiplo.
// Dopo due attacchi Ghiaccio, il terzo fa +35% e recupera il 10% dei PS.
const isQilinAttack=(char,move)=>char?.passive?.type==='qilin_dew'&&
  move?.type==='Ghiaccio'&&Number(move.power)>0;
export function prepareQilinAttack(char,move){
 if(!isQilinAttack(char,move)||!(char.hp>0))return false;
 char.qilinBurstActive=(Number(char.qilinCharges)||0)>=2;
 return !!char.qilinBurstActive;
}
export const qilinDamageFactor=(char,move)=>
 isQilinAttack(char,move)&&char.qilinBurstActive?1.35:1;
export function resolveQilinAttack(char,move,succeeded){
 if(!isQilinAttack(char,move))return null;
 const wasBurst=!!char.qilinBurstActive;
 char.qilinBurstActive=false;
 if(!succeeded||!(char.hp>0))return null;
 if(wasBurst){
  char.qilinCharges=0;
  const healed=Math.max(0,Math.min(char.maxHp-char.hp,Math.max(1,Math.floor(char.maxHp*0.1))));
  char.hp+=healed;
  return {burst:true,charges:0,healed};
 }
 char.qilinCharges=Math.min(2,Math.max(0,Number(char.qilinCharges)||0)+1);
 return {burst:false,charges:char.qilinCharges,healed:0};
}
