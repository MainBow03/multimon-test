// Mosse dell'equipaggio di Cappello di Paglia.
// I bonus particolari (Haki, Clima-Tact, Guardia) sono risolti dal
// normale motore di battaglia e mantenuti nello stato condiviso online.
export const STRAW_HAT_MOVES = {
  'Pistola Gom Gom': {
    name:'Pistola Gom Gom',type:'Lotta',power:80,accuracy:1,contact:true,
    hitStatDebuff:{def:0.85,chance:0.25},
    desc:'Potenza 80 · Precisione 100. Il 25% delle volte riduce la Difesa del bersaglio del 15%.'
  },
  'Haki dell’Armatura': {
    name:'Haki dell’Armatura',type:'Magico',power:0,target:'self',
    statBuff:{atk:1.25,def:1.15,spd:1.05},
    hakiGuardTurns:3,maxUses:2,strictUses:true,
    desc:'Attacco +25%, Difesa +15%, Velocità +5%. Per i prossimi 3 turni dimezza le riduzioni delle statistiche e riduce la durata dei nuovi status negativi.'
  },
  'Jet Gatling': {
    name:'Jet Gatling',type:'Lotta',power:32,accuracy:0.95,
    multiHit:{min:3,max:3},contact:true,
    desc:'Tre colpi consecutivi da potenza 32 ciascuno. Precisione 95. Consuma fino a 3 cariche degli scudi.'
  },
  'Red Hawk Supremo': {
    name:'Red Hawk Supremo',type:'Magico',power:120,accuracy:0.9,contact:true,
    statusEffect:{type:'Scottato',chance:0.2,turns:3},
    maxUses:1,strictUses:true,
    desc:'Potenza 120 · Precisione 90. 20% Scottato. Un utilizzo per battaglia.'
  },
  'Oni Giri': {
    name:'Oni Giri',type:'Lotta',power:85,accuracy:1,contact:true,
    bonusCritChance:0.1,
    desc:'Potenza 85 · Precisione 100. +10 punti percentuali alla probabilità di critico.'
  },
  'Tatsumaki delle Tre Spade': {
    name:'Tatsumaki delle Tre Spade',type:'Terra',power:95,accuracy:0.95,
    hitStatDebuff:{spd:0.85,chance:0.2},
    desc:'Potenza 95 · Precisione 95. 20% di ridurre la Velocità del bersaglio del 15%.'
  },
  'Concentrazione da Spadaccino': {
    name:'Concentrazione da Spadaccino',type:'Lotta',power:0,target:'self',
    statBuff:{atk:1.2},strawHatClearBlind:true,
    maxUses:2,strictUses:true,
    desc:'Aumenta l’Attacco del 20% e rimuove Accecato. Due utilizzi per battaglia.'
  },
  'Asura': {
    name:'Asura',type:'Lotta',power:130,accuracy:0.85,contact:true,
    maxUses:1,strictUses:true,
    desc:'Potenza 130 · Precisione 85. Un utilizzo per battaglia.'
  },
  'Raffica del Clima': {
    name:'Raffica del Clima',type:'Aria',power:75,accuracy:1,special:true,
    statusEffect:{type:'Accecato',chance:0.2,turns:3},
    desc:'Potenza 75 · Precisione 100. 20% di accecare il bersaglio.'
  },
  'Miraggio Ladresco': {
    name:'Miraggio Ladresco',type:'Magico',power:0,target:'self',
    strawHatEvasionGain:0.15,maxUses:1,strictUses:true,
    desc:'Aumenta l’elusione personale del 15%, una sola volta per combattimento (non accumulabile).'
  },
  'Tempesta di Zeus': {
    name:'Tempesta di Zeus',type:'Aria',power:110,accuracy:0.9,special:true,
    statusEffect:{type:'Elettrizzato',chance:0.25,turns:3},
    desc:'Potenza 110 · Precisione 90. 25% di elettrizzare.'
  },
  'Pioggia del Clima-Tact': {
    name:'Pioggia del Clima-Tact',type:'Acqua',power:0,target:'self',
    rainstormChance:1,maxUses:2,strictUses:true,
    desc:'Scatena Pioggia per 5 turni: mosse Acqua +25% e Fuoco -25%.'
  },
  'Colpo di Zoccolo': {
    name:'Colpo di Zoccolo',type:'Lotta',power:78,accuracy:1,contact:true,
    hitStatDebuff:{atk:0.85,chance:0.2},
    desc:'Potenza 78 · Precisione 100. 20% di ridurre l’Attacco avversario del 15%.'
  },
  'Guard Point': {
    name:'Guard Point',type:'Normale',power:0,target:'self',
    statBuff:{def:1.25,spDef:1.1},strawHatGuardPoint:0.2,
    maxUses:2,strictUses:true,
    desc:'Difesa +25%, Difesa speciale +10%. Il prossimo attacco diretto subito infligge il 20% di danni in meno.'
  },
  'Cura d’Emergenza': {
    name:'Cura d’Emergenza',type:'Normale',power:0,targetMode:'ally',
    heal:0.3,removeNegativeStatuses:true,maxUses:3,strictUses:true,
    desc:'Cura un alleato del 30% dei PS massimi e rimuove gli status negativi. Tre utilizzi per battaglia.'
  },
  'Monster Point': {
    name:'Monster Point',type:'Lotta',power:115,accuracy:0.9,contact:true,
    costHpPercent:0.10,maxUses:1,strictUses:true,
    desc:'Potenza 115 · Precisione 90. Un uso per battaglia. Dopo il colpo perde il 10% dei propri PS massimi.'
  }
};
