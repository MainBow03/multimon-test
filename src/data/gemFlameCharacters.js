export const GEM_FLAME_CHARACTERS = [
  {
    id:'ametista',name:'Ametista',types:['Roccia','Magico'],
    hp:110,maxHp:110,atk:108,spAtk:101,def:88,spDef:91,spd:90,
    img:'https://www.clipartmax.com/png/middle/94-947196_amethyst-yep-amethyst-steven-universe-no-background.png',
    passive:{
      name:'Gemma Imperfetta',type:'gem_imperfect_copy',maxUses:1,
      desc:'Alla prima volta in battaglia che un alleato o un avversario attivo aumenta le proprie statistiche, Ametista replica gli stessi aumenti percentuali. Copia tutte le statistiche potenziate durante quell’azione; un’attivazione per battaglia.'
    },
    moveNames:['Frusta di Quarzo','Ruotazione Furiosa','Titanide da Ring','Lazo di Quarzo']
  },
  {
    id:'flameprincess',name:'Principessa Fiamma',types:['Fuoco','Magico'],
    hp:104,maxHp:104,atk:103,spAtk:124,def:79,spDef:91,spd:96,
    img:'https://i.pinimg.com/736x/88/43/27/88432790e49767f910b28c5139e2c081.jpg',
    passive:{
      name:'Cuore di Magma',type:'magma_heart',chance:0.25,
      desc:'Ogni volta che subisce un attacco fisico che le infligge danni, ha il 25% di probabilità di scottare l’attaccante. Le sue mosse possono ottenere una Carica Calore con il 50% di probabilità (massimo 2). Due cariche permettono a Fiamma Reale di infliggere +25% danni, consumandole.'
    },
    moveNames:['Pioggia di Braci','Vortice Ardente','Nucleo Incandescente','Fiamma Reale']
  }
];
