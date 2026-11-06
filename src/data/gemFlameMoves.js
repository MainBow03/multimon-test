// Le nuove mosse usano le stesse proprietà del motore battaglia di Multimon.
export const GEM_FLAME_MOVES = {
  'Frusta di Quarzo': {
    name:'Frusta di Quarzo',type:'Roccia',power:95,accuracy:0.9,contact:true,
    statusEffect:{type:'Scottato',chance:0.15,turns:3},
    desc:'Potenza 95, precisione 90%. 15% di scottare il bersaglio.'
  },
  'Ruotazione Furiosa': {
    name:'Ruotazione Furiosa',type:'Roccia',power:70,accuracy:1,targetCount:2,contact:true,
    statusEffect:{type:'Confuso',chance:0.13,turns:3},
    desc:'Potenza 70. Colpisce fino a due nemici e ha il 13% di confondere ciascuno.'
  },
  'Titanide da Ring': {
    name:'Titanide da Ring',type:'Lotta',power:110,accuracy:1,contact:true,
    selfStatBuff:{def:0.7},
    desc:'Ametista si trasforma nella sua forma da wrestler e attacca con potenza 110. Dopo il colpo la sua Difesa diminuisce del 30%.'
  },
  'Lazo di Quarzo': {
    name:'Lazo di Quarzo',type:'Magico',power:90,accuracy:1,contact:true,
    desc:'Potenza 90. Ametista allunga la frusta di quarzo per intrappolare e colpire un bersaglio.'
  },
  'Pioggia di Braci': {
    name:'Pioggia di Braci',type:'Fuoco',power:80,accuracy:1,special:true,
    statusEffect:{type:'Scottato',chance:0.2,turns:3},
    desc:'Potenza 80. Ha il 20% di scottare. Ogni mossa di Principessa Fiamma ha il 50% di generare una Carica Calore (massimo due).'
  },
  'Vortice Ardente': {
    name:'Vortice Ardente',type:'Fuoco',power:70,accuracy:1,special:true,targetCount:2,
    statusEffect:{type:'Scottato',chance:0.10,turns:3},
    desc:'Potenza 70. Colpisce fino a due bersagli e ha il 10% di scottare ciascuno.'
  },
  'Nucleo Incandescente': {
    name:'Nucleo Incandescente',type:'Magico',power:0,target:'self',
    statBuff:{spAtk:1.20,def:1.10},maxUses:2,strictUses:true,
    desc:'Aumenta Attacco Speciale del 20% e Difesa del 10%. Può generare una Carica Calore come tutte le sue mosse.'
  },
  'Fiamma Reale': {
    name:'Fiamma Reale',type:'Fuoco',power:115,accuracy:0.9,special:true,
    heatFinisher:true,heatBurstBonus:1.25,maxUses:3,strictUses:true,
    desc:'Potenza 115, precisione 90%. Con due Cariche Calore le consuma e infligge il 25% di danni in più. La carica può rigenerarsi con le mosse successive.'
  }
};
