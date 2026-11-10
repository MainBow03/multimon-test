// Solo due missioni pre-boss hanno sei nemici: la 34 e la 35.
// Le 33 missioni precedenti preservano il numero originale di avversari.
// Il raid finale rimane Echomax singolo con Legione dei Caduti.
export const ECHO_CHALLENGE_VERSION='echo-preboss-v3';
export const ECHO_MISSION_LINEUPS=Object.freeze({
  34:['renarouge','renarouge','finn','finn','reghiaccio','nito'],
  35:['topolino','snorlax','kirby','barry','shadow','celljr_1']
});
export function echoEncounterRoster(number,original=[]){
 const roster=ECHO_MISSION_LINEUPS[number];
 return roster?[...roster]:[...original];
}

// Soltanto gli ultimi due scontri pre-boss schierano sei avversari
// contemporaneamente. Le missioni 1–33 conservano la formazione originale.
export function echoEnemyFieldSize(number){
 return number===34||number===35?6:undefined;
}

// Aumento moderato della difficoltà nei sei atti, senza aggiungere nemici.
// I due scontri 34–35 sono già più impegnativi per il numero di avversari.
const CURVE=[
 {hp:1.02,atk:1.00,def:1.00,spd:1.00},
 {hp:1.09,atk:1.035,def:1.035,spd:1.01},
 {hp:1.16,atk:1.07,def:1.065,spd:1.02},
 {hp:1.23,atk:1.105,def:1.09,spd:1.035},
 {hp:1.30,atk:1.14,def:1.115,spd:1.045},
 {hp:1.37,atk:1.18,def:1.145,spd:1.06}
];
export function echoEnemyScaling(number,{insane=false}={}){
 const act=Math.max(1,Math.min(6,Math.ceil(number/6)));
 const stage=(number-1)%6;
 const base=CURVE[act-1];
 const preBoss=number===34||number===35;
 const pressure=stage*.011+(stage===5?.025:0);
 const factor=insane?1.20:1;
 return {
  hp:Number(((preBoss?1.07:base.hp+pressure)*factor).toFixed(3)),
  atk:Number(((preBoss?1.035:base.atk+pressure*.45)*factor).toFixed(3)),
  def:Number(((preBoss?1.035:base.def+pressure*.25)*factor).toFixed(3)),
  spd:Number((preBoss?1.00:base.spd+pressure*.12).toFixed(3))
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
