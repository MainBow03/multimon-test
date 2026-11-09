// 04/11/2026 — Star, Sam, Clover, Superman, Blueberry Muffin.
// Effetti speciali implementati in newcomerEffects.js, non solo descrittivi.
export const FIVE_NEW_MOVES = {
  'Narvali Interdimensionali': {
    name:'Narvali Interdimensionali',type:'Magico',power:30,accuracy:1,multiHit:{min:2,max:3},
    desc:'I narvali magici colpiscono 2–3 volte con potenza 30 per colpo.'
  },
  'Tempesta Arcobaleno': {
    name:'Tempesta Arcobaleno',type:'Folletto',power:70,accuracy:.95,targetCount:24,
    desc:'Magia colorata di potenza 70 che colpisce tutti gli avversari in campo. Precisione 95%.'
  },
  'Bacchetta a Sorpresa': {
    name:'Bacchetta a Sorpresa',type:'Magico',power:87,accuracy:1,
    statusEffect:{type:'Confuso',chance:.25,turns:3},
    desc:'Potenza 87. Ha il 25% di probabilità di confondere il bersaglio per 3 turni.'
  },
  'Dip Down': {
    name:'Dip Down',type:'Magico',power:0,target:'self',heal:.2,statBuff:{atk:1.2,spd:1.15},
    maxUses:2,strictUses:true,
    desc:'Star recupera il 20% dei PS massimi e aumenta Attacco del 20% e Velocità del 15%. Due usi.'
  },

  'Analisi sul Campo': {
    name:'Analisi sul Campo',type:'Psico',power:0,accuracy:1,
    targetStatDebuff:{atk:.8},maxUses:3,strictUses:true,
    desc:'Sam studia il nemico e riduce del 20% il suo Attacco. Tre utilizzi.'
  },
  'Rete di Contenimento': {
    name:'Rete di Contenimento',type:'Robot',power:64,accuracy:1,
    statusEffect:{type:'Stordito',chance:.2,turns:1},
    desc:'Potenza 64. Una rete tecnologica ha il 20% di stordire per un turno.'
  },
  'Laser Compatto': {
    name:'Laser Compatto',type:'Robot',power:93,accuracy:1,ignoreDefBuffs:true,
    desc:'Potenza 93, ignora i bonus temporanei alla Difesa del bersaglio.'
  },
  'Piano di Estrazione': {
    name:'Piano di Estrazione',type:'Buio',power:0,target:'self',
    statBuff:{def:1.25,spd:1.1},maxUses:2,strictUses:true,
    desc:'Sam organizza la fuga: Difesa +25% e Velocità +10%. Due utilizzi.'
  },

  'Tacco a Reazione': {
    name:'Tacco a Reazione',type:'Lotta',power:78,accuracy:1,priority:1,contact:true,
    desc:'Potenza 78, priorità +1: Clover attacca prima degli avversari più lenti nelle reazioni.'
  },
  'Spray Confondente': {
    name:'Spray Confondente',type:'Folletto',power:65,accuracy:1,
    statusEffect:{type:'Confuso',chance:.35,turns:3},
    desc:'Potenza 65. Il profumo confonde il nemico con una probabilità del 35%.'
  },
  'Flash da Copertina': {
    name:'Flash da Copertina',type:'Luce',power:86,accuracy:1,
    hitStatDebuff:{acc:.85,chance:.4},
    desc:'Potenza 86. Nel 40% dei casi abbassa la Precisione del nemico del 15%.'
  },
  'Cambio di Look': {
    name:'Cambio di Look',type:'Folletto',power:0,target:'self',
    heal:.15,statBuff:{spd:1.2},maxUses:3,strictUses:true,
    desc:'Clover recupera il 15% dei PS e aumenta la Velocità del 20%. Tre utilizzi.'
  },

  'Visione Termica': {
    name:'Visione Termica',type:'Luce',power:93,accuracy:1,special:true,
    statusEffect:{type:'Scottato',chance:.25,turns:4},
    desc:'Potenza speciale 93. Il 25% delle volte provoca una scottatura.'
  },
  'Soffio Artico': {
    name:'Soffio Artico',type:'Ghiaccio',power:76,accuracy:1,special:true,
    statusEffect:{type:'Congelato',chance:.2,turns:2},
    desc:'Potenza speciale 76. Il 20% delle volte congela per due turni.'
  },
  'Intervento Eroico': {
    name:'Intervento Eroico',type:'Luce',power:0,targetMode:'ally',heal:.3,
    targetStatBuff:{def:1.2},maxUses:3,strictUses:true,
    desc:'Soccorre un alleato in campo (anche sé stesso): cura 30% dei PS e Difesa +20%. Tre utilizzi.'
  },
  'Pugno della Giustizia': {
    name:'Pugno della Giustizia',type:'Lotta',power:118,accuracy:.9,contact:true,
    recoil:.08,desc:'Potenza 118, precisione 90%. Superman subisce l’8% dei danni come contraccolpo.'
  },

  'Ricetta Annotata': {
    name:'Ricetta Annotata',type:'Erba',power:0,target:'self',heal:.24,
    maxUses:3,strictUses:true,
    desc:'Blueberry recupera il 24% dei PS e prepara un appunto per potenziare il prossimo attacco.'
  },
  'Muffin ai Mirtilli': {
    name:'Muffin ai Mirtilli',type:'Erba',power:86,accuracy:1,drain:.25,
    desc:'Potenza 86. Blueberry recupera il 25% dei danni realmente inflitti.'
  },
  'Appunti Rivelatori': {
    name:'Appunti Rivelatori',type:'Psico',power:0,targetStatDebuff:{atk:.85,def:.85},
    maxUses:3,strictUses:true,
    desc:'Blueberry annota i punti deboli: Attacco e Difesa nemici −15%. Genera un appunto.'
  },
  'Torta di Mezzanotte': {
    name:'Torta di Mezzanotte',type:'Psico',power:108,accuracy:.85,special:true,
    desc:'Potenza speciale 108, precisione 85%. Consuma gli appunti accumulati per aumentare il danno.'
  }
};
export const FIVE_NEW_CHARACTERS = [
  {
    id:'starbutterfly',name:'Star Butterfly',types:['Magico','Folletto'],
    hp:105,maxHp:105,atk:105,spAtk:122,def:88,spd:112,
    img:'https://i.pinimg.com/1200x/10/51/cd/1051cd075891f0bb75a09ebb7f61c390.jpg',
    passive:{name:'Bacchetta Capricciosa',type:'wand_flux',
      desc:'Una volta per turno, al primo colpo che infligge danni, ha il 35% di attivare una magia casuale: cura 8% dei PS, Velocità +10% oppure Velocità del bersaglio −12%.'},
    moves:['Narvali Interdimensionali','Tempesta Arcobaleno','Bacchetta a Sorpresa','Dip Down'].map(k=>FIVE_NEW_MOVES[k])
  },
  {
    id:'samtotallyspies',name:'Sam (Totally Spies)',types:['Robot','Psico'],
    hp:106,maxHp:106,atk:105,def:100,spd:112,
    img:'https://i.pinimg.com/1200x/84/cc/a7/84cca794b321b2320ab89404efbe575a.jpg',
    passive:{name:'Memoria Analitica',type:'spy_analysis',
      desc:'Dopo aver subito danno da un tipo di mossa, i colpi successivi dello stesso tipo infliggono il 25% di danni in meno. Cambiare tipo inganna la sua analisi.'},
    moves:['Analisi sul Campo','Rete di Contenimento','Laser Compatto','Piano di Estrazione'].map(k=>FIVE_NEW_MOVES[k])
  },
  {
    id:'clover',name:'Clover (Totally Spies)',types:['Folletto','Lotta'],
    hp:96,maxHp:96,atk:111,def:86,spd:125,
    img:'https://i.pinimg.com/1200x/13/15/31/1315318411e2d9861f5b4362b15cdff2.jpg',
    passive:{name:'Istinto da Copertina',type:'fashion_instinct',
      desc:'Ha il 12% di elusione naturale aggiuntiva. La prima volta che schiva ogni turno ottiene Attacco +12% (entro il limite generale dei potenziamenti).'},
    moves:['Tacco a Reazione','Spray Confondente','Flash da Copertina','Cambio di Look'].map(k=>FIVE_NEW_MOVES[k])
  },
  {
    id:'superman',name:'Superman',types:['Luce','Lotta'],
    hp:132,maxHp:132,atk:137,spAtk:125,def:119,spDef:112,spd:106,
    img:'https://i.pinimg.com/1200x/fa/a1/6f/faa16fca17e71cec4ecc74fcde1e8a8d.jpg',
    passive:{name:'Corpo Kryptoniano',type:'kryptonian_body',
      desc:'Subisce il 20% in meno dalle mosse con potenza base fino a 100, eccetto le mosse Magico: quelle gli infliggono il 25% di danni extra. Gli attacchi più potenti ignorano la riduzione.'},
    moves:['Visione Termica','Soffio Artico','Intervento Eroico','Pugno della Giustizia'].map(k=>FIVE_NEW_MOVES[k])
  },
  {
    id:'blueberrymuffin',name:'Blueberry Muffin',types:['Erba','Psico'],
    hp:111,maxHp:111,atk:92,spAtk:110,def:96,spd:91,
    img:'https://i.pinimg.com/736x/07/72/5d/07725d038239d9b88a6de2f11d31829f.jpg',
    passive:{name:'Lettura Geniale',type:'bookworm',
      desc:'Ogni mossa di supporto riuscita aggiunge un Appunto (massimo 2). Il successivo attacco offensivo consuma gli Appunti e infligge +20% danni per Appunto.'},
    moves:['Ricetta Annotata','Muffin ai Mirtilli','Appunti Rivelatori','Torta di Mezzanotte'].map(k=>FIVE_NEW_MOVES[k])
  }
];
