// Due nuovi campioni: usano le normali mosse, statistiche e passive del motore Multimon.
export const FROZEN_ALCHEMIST_MOVES = {
 'Raffica di Fiocchi': {name:'Raffica di Fiocchi',type:'Ghiaccio',power:80,special:true,accuracy:1,
   hitStatDebuff:{spd:.85,chance:.25},desc:'Potenza 80; 25% di ridurre la Velocita del 15%.'},
 'Abbraccio Caloroso': {name:'Abbraccio Caloroso',type:'Ghiaccio',power:0,target:'self',
   heal:.3,maxUses:3,strictUses:true,desc:'Olaf recupera il 30% dei PS massimi. Tre usi.'},
 'Valanga Birichina': {name:'Valanga Birichina',type:'Terra',power:88,accuracy:.95,
   hitStatDebuff:{def:.9,chance:.2},desc:'Potenza 88, precisione 95%; 20% di ridurre Difesa del 10%.'},
 'Nevicata Scatenata': {name:'Nevicata Scatenata',type:'Ghiaccio',power:65,special:true,
   accuracy:1,targetCount:2,desc:'Una tormenta che colpisce fino a due nemici. Potenza 65.'},
 'Lama di Automail': {name:'Lama di Automail',type:'Robot',power:90,accuracy:1,
   contact:true,critChance:.15,desc:'Lama alchemica: potenza 90, critico 15%.'},
 'Trasmutazione Tellurica': {name:'Trasmutazione Tellurica',type:'Terra',power:82,special:true,
   accuracy:1,targetCount:2,desc:'Trasmutazione del terreno su fino a due nemici. Potenza 82.'},
 'Bastione Alchemico': {name:'Bastione Alchemico',type:'Terra',power:0,target:'self',
   statBuff:{def:1.25},maxUses:3,strictUses:true,desc:'Aumenta la propria Difesa del 25%. Tre usi.'},
 'Pugno di Metallo': {name:'Pugno di Metallo',type:'Robot',power:108,accuracy:.9,
   contact:true,maxUses:3,strictUses:true,desc:'Potenza 108, precisione 90%. Tre usi.'}
};
export const FROZEN_ALCHEMIST_CHARACTERS = [
 {id:'olaf',name:'Olaf',types:['Ghiaccio','Terra'],
  hp:106,maxHp:106,atk:83,spAtk:95,def:98,spDef:92,spd:58,
  img:'https://i.pinimg.com/736x/b7/16/eb/b716eb876965607b9552e422afc5caf4.jpg',
  passive:{name:'Sempre Col Sorriso',type:'on_enter',maxUses:1,selfStatBuff:{def:1.15},
    desc:'Al primo ingresso in campo ottiene Difesa +15%.'},
  moveNames:['Raffica di Fiocchi','Abbraccio Caloroso','Valanga Birichina','Nevicata Scatenata']},
 {id:'edwardelric',name:'Edward Elric',types:['Terra','Robot'],
  hp:98,maxHp:98,atk:112,spAtk:100,def:92,spDef:93,spd:109,
  img:'https://i.pinimg.com/736x/e7/44/80/e74480782e9913fec26b99d53e60796e.jpg',
  passive:{name:'Alchimia Senza Cerchio',type:'on_enter',maxUses:1,selfStatBuff:{spd:1.15},
    desc:'Al primo ingresso in campo ottiene Velocita +15%.'},
  moveNames:['Lama di Automail','Trasmutazione Tellurica','Bastione Alchemico','Pugno di Metallo']}
];
