// Regole di Scena della campagna IV. Nessun effetto negli altri modi di gioco.
// I modificatori intervengono sui danni REALI del motore, non solo sui testi.
const validRules=new Set(['spotlight','mirror','rehearsal','improv','curtain','finale']);
const isEnemy=(fighter,teams)=>!!fighter&&teams?.p2?.includes(fighter);
const isHero=(fighter,teams)=>!!fighter&&teams?.p1?.includes(fighter);
export const THEATER_FINAL_PHASES=Object.freeze([1,2,3]);

export function theaterDamageMultiplier({scene,teams,attacker,target,turnNumber}={}){
 if(!scene||!validRules.has(scene.rule)||!teams)return 1;
 const turn=Math.max(1,Math.floor(Number(turnNumber)||1));
 const heroAttacks=isHero(attacker,teams),enemyAttacks=isEnemy(attacker,teams);
 const targetIsEnemy=isEnemy(target,teams);
 switch(scene.rule){
  case 'spotlight':
  case 'finale':{
   const lampsAlive=teams.p2.some(char=>char?.id==='riflettore'&&Number(char.hp)>0);
   if(heroAttacks&&targetIsEnemy&&target?.id!=='riflettore'&&lampsAlive)
     return scene.rule==='finale'?.70:.75;
   if(scene.rule==='finale'&&heroAttacks&&target?.id==='regista'&&!lampsAlive&&
      Number(target.theaterPhase)>=3)return 1.1;
   return 1;
  }
  case 'mirror':return turn%2===0?.9:1;
  case 'rehearsal':return enemyAttacks&&turn%3===0?1.15:1;
  case 'improv':return heroAttacks&&turn%3===0?1.2:1;
  case 'curtain':return turn%4===0?.85:1;
  default:return 1;
 }
}

export function theaterTurnCue(scene,turnNumber){
 if(!scene||!validRules.has(scene.rule))return null;
 const t=Math.floor(Number(turnNumber));
 if(!Number.isFinite(t)||t<1)return null;
 switch(scene.rule){
  case 'spotlight': return t===1?'🎭 LUCI DI PROTEZIONE: i riflettori schermano gli altri nemici! Spegnili per togliere lo scudo.':null;
  case 'finale':return t===1?'🎭 ULTIMO SIPARIO: spegni i due riflettori prima di affrontare il Regista!':null;
  case 'mirror':return t%2===0?'🪞 SCENA SPECCHIATA: i danni di tutti gli attacchi sono ridotti del 10% in questo turno!':null;
  case 'rehearsal':return t%3===0?'🎬 PROVE GENERALI: gli attacchi nemici sono potenziati del 15% in questo turno!':null;
  case 'improv':return t%3===0?'✨ FUORI COPIONE: le tue mosse offensive infliggono il 20% in più in questo turno!':null;
  case 'curtain':return t%4===0?'🎭 SIPARIO PESANTE: tutti i colpi perdono il 15% di potenza per questo turno!':null;
  default:return null;
 }
}

export function advanceTheaterFinalBossPhase({boss,events=[],applyStatBuff}={}){
 if(!boss?.theaterFinalBoss||boss.id!=='regista'||Number(boss.hp)<=0||!Number(boss.maxHp))return false;
 const ratio=boss.hp/boss.maxHp;
 const current=Number(boss.theaterPhase)||1;
 const phase=ratio<=1/3?3:ratio<=2/3?2:1;
 if(phase<=current)return false;
 boss.theaterPhase=phase;
 if(phase>=2 && current<2){
  if(applyStatBuff)applyStatBuff(boss,'atk',1.10);
  events.push({type:'text',text:'🎬 ATTO II — IL FINALE PRESTABILITO! Severin cambia ritmo: Attacco +10%. Ogni scelta degli eroi mette in crisi il suo copione.'});
 }
 if(phase>=3 && current<3){
  if(applyStatBuff)applyStatBuff(boss,'spd',1.15);
  // Non recupera PS né evoca cloni. L'ultima parte è più veloce ma
  // perde il controllo delle scenografie e resta affrontabile.
  events.push({type:'text',text:'🎭 ATTO III — IL PALCOSCENICO VUOTO! Severin perde il controllo del Teatro: Velocità +15%. Se i riflettori sono spenti subisce il 10% di danni in più.'});
 }
 return true;
}
