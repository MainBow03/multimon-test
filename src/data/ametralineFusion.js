// Fusione Metamor Coraline + Ametista. Non entra nel roster normale:
// compare fra le Fusioni e nelle modalita che abilitano fusionMode.
export const AMETRALINE_FUSION_MOVES={
 'Corridoio Segreto':{
  name:'Corridoio Segreto',type:'Spettro',power:80,accuracy:1,special:true,
  hitStatDebuff:{def:.8,chance:.2},
  desc:'Apre una porta impossibile: potenza 80, 20% di abbassare la Difesa nemica del 20%.'
 },
 "Frusta d'Ametista":{
  name:"Frusta d'Ametista",type:'Cristallo',power:72,accuracy:1,contact:true,
  multiHit:{min:2,max:2},hitStatDebuff:{spd:.9,chance:.15},
  desc:'Frusta cristallina: due colpi da 72 potenza; ogni colpo ha 15% di ridurre la Velocita del 10%.'
 },
 'Bottoni del Vuoto':{
  name:'Bottoni del Vuoto',type:'Spettro',power:0,accuracy:1,
  maxUses:3,strictUses:true,metamorButtons:true,
  desc:'Per 2 turni Attacco e Precisione nemici -20%. Non si accumula; se il bersaglio era gia indebolito, Ametraline recupera il 20% PS. Tre usi.'
 },
 'Gemma Imperfetta di Ametraline':{
  name:'Gemma Imperfetta di Ametraline',type:'Cristallo',power:0,target:'self',
  heal:.35,statBuff:{def:1.2,spd:1.2},maxUses:2,strictUses:true,
  desc:'Ripristina il 35% PS e aumenta Difesa e Velocita del 20%. Due usi.'
 }
};
