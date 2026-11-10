// L'Eco delle Anime: 6 avversari TOTALI per missione ordinaria.
// L'atto finale è un raid contro Echomax singolo con Legione dei Caduti.
// La disposizione al campo aumenta da 2 a 6 man mano che arrivano alleati.
// Le missioni 34 e 35 hanno composizioni fisse richieste dalla storia.
export const ECHO_CHALLENGE_VERSION='echo-six-v2';
export const ECHO_MISSION_LINEUPS=Object.freeze({
  01: ["scheletro","clone_rosso","clone_verde","robo_aiutante_1","slime","blob"],
  02: ["metalsonic","zergling","robo_aiutante_1","robo_aiutante_2","clone_rosso","clone_verde"],
  03: ["reboo","robo_aiutante_1","blob","robo_aiutante_2","scheletro","clone_verde"],
  04: ["zazan","robo_aiutante_2","slime","zergling","clone_rosso","blob"],
  05: ["megamind","clone_verde","robo_aiutante_1","robo_aiutante_2","metalsonic","clone_rosso"],
  06: ["nito","mostro_scheletrico","scheletro","clone_rosso","clone_verde","blob"],
  07: ["wario","robo_aiutante_1","megamind","plankton","clone_rosso","clone_verde"],
  08: ["plankton","clone_rosso","wario","stewie","robo_aiutante_2","blob"],
  09: ["cuoredipietra","blob","slime","worm","zergling","clone_verde"],
  10: ["roserade","mantide","worm","zazan","slime","clone_rosso"],
  11: ["stewie","robo_aiutante_2","megamind","metalsonic","clone_verde","clone_rosso"],
  12: ["charmcaster","clone_corvina","clone_verde","strega","blob","reboo"],
  13: ["juvia","slime","blob","worm","roserade","clone_verde"],
  14: ["laxus","robo_aiutante_1","megamind","stewie","metalsonic","zergling"],
  15: ["ryuk","mostro_scheletrico","nito","scheletro","clone_corvina","blob"],
  16: ["zuko","natsu","laxus","charmcaster","slime","worm"],
  17: ["kratos","golem_pietra","nito","mostro_scheletrico","zazan","clone_rosso"],
  18: ["ainz","golem_pietra_supremo","nito","charmcaster","clone_corvina","strega"],
  19: ["peridot","diamante","golem_pietra","robo_aiutante_1","robo_aiutante_2","reboo"],
  20: ["diamantebianco","lapis","diamante","peridot","charmcaster","clone_corvina"],
  21: ["nightwing","cyborg","metalsonic","robo_aiutante_2","clone_rosso","stewie"],
  22: ["ursula","strega","charmcaster","clone_corvina","ryuk","reboo"],
  23: ["finn","clone_rosso","clone_verde","reghiaccio","nito","renarouge"],
  24: ["trigon","clone_corvina","mostro_scheletrico","nito","ainz","golem_pietra_supremo"],
  25: ["pyra","spyro","zuko","natsu","laxus","clone_rosso"],
  26: ["metalsonic","robo_aiutante_2","zergling","megamind","stewie","clone_verde"],
  27: ["reghiaccio","dolli","yukionna","elsa","nito","clone_corvina"],
  28: ["zergling","golem_pietra_supremo","mostro_scheletrico","robo_aiutante_1","robo_aiutante_2","clone_rosso"],
  29: ["stewie","megamind","reboo","renarouge","clone_verde","clone_rosso"],
  30: ["astral","clone_corvina","celljr_1","celljr_2","celljr_3","golem_pietra_supremo"],
  31: ["celljr_1","celljr_2","celljr_3","celljr_4","clone_rosso","metalsonic"],
  32: ["gaster","robo_aiutante_2","clone_corvina","robo_aiutante_1","astral","stewie"],
  33: ["trigon","mostro_scheletrico","clone_corvina","nito","ainz","golem_pietra_supremo"],
  34: ["renarouge","renarouge","finn","finn","reghiaccio","nito"],
  35: ["topolino","snorlax","kirby","barry","shadow","celljr_1"],
});
export function echoEncounterRoster(number,original=[]){
 if(number===36)return [...original];
 const roster=ECHO_MISSION_LINEUPS[number];
 return roster?[...roster]:[...original];
}

export function echoEnemyFieldSize(number){
 if(number>=36)return 6;
 const act=Math.max(1,Math.min(6,Math.ceil(number/6)));
 return Math.min(6,act+1);
}

const CURVE=[
 // HP, Attacco, Difesa, Velocità. Più nemici richiedono un primo atto accessibile.
 {hp:.73,atk:.77,def:.82,spd:.90},
 {hp:.92,atk:.89,def:.94,spd:.96},
 {hp:1.06,atk:1.02,def:1.03,spd:1.00},
 {hp:1.16,atk:1.09,def:1.08,spd:1.04},
 {hp:1.27,atk:1.16,def:1.12,spd:1.07},
 {hp:1.40,atk:1.22,def:1.16,spd:1.10}
];
export function echoEnemyScaling(number,{insane=false}={}){
 const act=Math.max(1,Math.min(6,Math.ceil(number/6)));
 const stage=(number-1)%6;
 const base=CURVE[act-1];
 const pressure=stage*.016+(stage===5?.055:0);
 const factor=insane?1.20:1;
 return {
  hp:Number(((base.hp+pressure)*factor).toFixed(3)),
  atk:Number(((base.atk+pressure*.55)*factor).toFixed(3)),
  def:Number(((base.def+pressure*.36)*factor).toFixed(3)),
  spd:Number((base.spd+pressure*.15).toFixed(3))
 };
}
export function echoPuppetIdentity(missionId,index,base){
 const id=String(missionId);
 if(id==='eco_34'){
  if(index<2)return {
   name:'Eco di Rena Rouge '+(index===0?'I':'II'),
   isEchoPuppet:true,echoCloneLabel:index+1,
   imageFilter:index===0
    ?'sepia(.4) hue-rotate(225deg) saturate(2) drop-shadow(0 0 14px #a855f7)'
    :'sepia(.5) hue-rotate(135deg) saturate(2) drop-shadow(0 0 14px #38bdf8)'
  };
  if(index===2||index===3)return{
   name:'Finn · Copia Perfetta '+(index===2?'I':'II'),
   isEchoPuppet:true,echoCloneLabel:index-1,
   imageFilter:'sepia(.48) hue-rotate(245deg) saturate(1.8) drop-shadow(0 0 18px #a855f7)'
  };
 }
 if(id==='eco_35'&&index===0)return{
   name:'Topolino · Sotto l’Eco',isEchoPuppet:true,
   imageFilter:'sepia(.35) hue-rotate(235deg) saturate(1.8) drop-shadow(0 0 16px #a855f7)'
 };
 return null;
}

export function echoEncounterBriefing(number){
 const act=Math.ceil(number/6);
 const cues=[
  'Le unità più fragili nascondono una seconda linea. Conserva mosse e cure per i rinforzi.',
  'I comandanti stanno imparando a combinare poteri diversi. Alterna bersagli e protezioni.',
  'I sigilli si alimentano della magia: usa i tipi con attenzione e prepara i cambi.',
  'Le copie imitano abilità reali. Controlla le passive dei nemici prima di concentrarti su un solo bersaglio.',
  'La Legione è organizzata in squadre complete. Porta supporti e prepara un piano per sei bersagli.',
  'La Resistenza affronta le copie migliori di Echomax. Ogni scelta e ogni turno contano.'
 ];
 if(number===34)return 'Due copie di Rena Rouge, due copie di Finn, Re Ghiaccio e Gravelord Nito: proteggi i tuoi alleati e non sottovalutare le illusioni.';
 if(number===35)return 'Topolino controllato è protetto da Snorlax, Kirby, Barry, Shadow e Cell Jr.: sei nemici con ruoli differenti, tutti sul campo.';
 return cues[Math.max(0,Math.min(5,act-1))];
}
