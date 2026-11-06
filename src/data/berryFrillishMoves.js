// Berry (Brawl Stars) e Frillish (Pokémon).
// Le mosse sfruttano i campi già implementati dal battle engine.
export const BERRY_FRILLISH_MOVES={
  'Gelato Glaciale':{
    name:'Gelato Glaciale',type:'Ghiaccio',power:85,accuracy:1,special:true,
    statusEffect:{type:'Congelato',chance:0.15,turns:2},
    desc:'Berry lancia un cono gelato ghiacciato. Potenza 85, 15% di congelare.'
  },
  'Grandinata di Coni':{
    name:'Grandinata di Coni',type:'Ghiaccio',power:70,accuracy:1,special:true,
    targetCount:2,hitStatDebuff:{spd:0.9,chance:0.2},
    desc:'Potenza 70. Colpisce fino a 2 bersagli; 20% per bersaglio di ridurre la Velocità del 10%.'
  },
  'Coppa Rigenerante':{
    name:'Coppa Rigenerante',type:'Ghiaccio',power:0,targetMode:'ally',
    heal:0.3,maxUses:3,strictUses:true,
    desc:'Berry porge un gelato curativo a sé o un alleato: recupera il 30% dei PS massimi. 3 usi.'
  },
  'Scivolata Gelata':{
    name:'Scivolata Gelata',type:'Ghiaccio',power:75,accuracy:1,
    targetStatDebuff:{spd:0.85},
    desc:'Potenza 75. Berry scivola sul ghiaccio e riduce la Velocità del bersaglio del 15%.'
  },
  'Idrovampata':{
    name:'Idrovampata',type:'Acqua',power:85,accuracy:1,special:true,
    statusEffect:{type:'Scottato',chance:0.3,turns:3},
    desc:'Potenza 85. Getto d’acqua spettrale: 30% di scottare.'
  },
  'Energipalla (Frillish)':{
    name:'Energipalla',type:'Erba',power:90,accuracy:1,special:true,
    hitStatDebuff:{def:0.7,chance:0.10},
    desc:'Potenza 90, tipo Erba. 10% di ridurre la Difesa del bersaglio del 30%.'
  },
  'Zampillo (Frillish)':{
    name:'Zampillo',type:'Acqua',power:70,accuracy:1,special:true,
    targetCount:24,spoutLowHpPower:100,spoutLowHpThreshold:0.5,
    desc:'Colpisce tutti i nemici: potenza 70, oppure 100 contro ciascun bersaglio con meno del 50% dei suoi PS massimi.'
  },
  'Palla Ombra (Frillish)':{
    name:'Palla Ombra',type:'Spettro',power:95,accuracy:1,special:true,
    desc:'Potenza 95. Un concentrato di energia spettrale colpisce un nemico.'
  }
};
