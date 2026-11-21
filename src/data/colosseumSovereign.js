// Sovrano Aurelion: premio esclusivo per chi completa Ascesa del Colosseo.
// Le quattro tecniche sono registrate nel MOVES_DB condiviso dalle modalità.
export const AURELION_ID='sovranoaurelion';
export const AURELION_MOVES={
 'Bastone del Sovrano':{
  name:'Bastone del Sovrano',type:'Folletto',power:65,special:true,targetCount:4,
  statusEffect:{type:'Accecato',chance:.2,turns:3},
  desc:'Colpisce tutti i nemici con potenza 65. Ogni bersaglio ha il 20% di essere accecato: precisione -20% per 3 turni.'
 },
 'Scatto Regale':{
  name:'Scatto Regale',type:'Buio',power:70,priority:1,contact:true,
  desc:'Potenza 70, priorità +1: il Sovrano precede le mosse di priorità normale.'
 },
 'Mantello Elastico':{
  name:'Mantello Elastico',type:'Buio',power:0,target:'self',priority:5,
  isProtect:true,royalReflectRatio:.3,maxUses:4,
  desc:'Protegge dagli attacchi diretti e riflette il 30% del danno che avrebbe ricevuto. Come Protezione, fallisce più facilmente se usato consecutivamente.'
 },
 'Ascesa del Sovrano':{
  name:'Ascesa del Sovrano',type:'Folletto',power:100,special:true,
  desc:'Il potere della Corona avvolge il bersaglio. Potenza 100.'
 }
};
export const AURELION_PASSIVE={
 name:'Editto della Corona',type:'aurelion_royal',
 desc:'Se Aurelion ha più del 50% dei PS, i danni diretti che subisce sono ridotti del 15%. Con il 50% dei PS o meno, le sue mosse Buio e Folletto infliggono il 15% di danni in più.'
};
export const AURELION_CHARACTER={
 id:AURELION_ID,name:'Sovrano Aurelion',types:['Buio','Folletto'],
 hp:112,maxHp:112,atk:116,def:108,spd:111,spAtk:120,spDef:106,
 // Illustrazione ufficiale consegnata dall'autore del gioco.
 img:'./assets/sovrano-aurelion.webp',
 isSecretUnlock:true,isAscensionChampionReward:true,isAscensionBanned:true,
 passive:AURELION_PASSIVE,
 moveNames:['Bastone del Sovrano','Scatto Regale','Mantello Elastico','Ascesa del Sovrano']
};
