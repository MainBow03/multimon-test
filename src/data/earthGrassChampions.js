// Sei nuovi Multimon: tre Terra e tre Erba, da universi differenti.
// Le immagini PNG ritraggono sempre un solo personaggio.
// Passivi e mosse usano esclusivamente proprieta' gia' gestite dal motore standard.
export const EARTH_GRASS_MOVES = {
  // Toph Beifong: controllo difensivo del campo.
  'Maglio della Faglia': {
    name:'Maglio della Faglia',type:'Terra',power:88,accuracy:1,
    hitStatDebuff:{def:.9,chance:.25},
    desc:'Potenza 88. Il 25% delle volte riduce la Difesa del bersaglio del 10%.'
  },
  'Passo Sismico': {
    name:'Passo Sismico',type:'Terra',power:0,target:'self',
    statBuff:{def:1.25,spd:1.1},maxUses:2,strictUses:true,
    desc:'Toph sente le vibrazioni del terreno: Difesa +25% e Velocita +10%. Due utilizzi.'
  },
  'Metallo Fluido': {
    name:'Metallo Fluido',type:'Robot',power:85,accuracy:1,ignoreDefBuffs:true,
    desc:'Potenza 85 di tipo Acciaio. Ignora i potenziamenti di Difesa del bersaglio.'
  },
  'Cerchio di Pietre': {
    name:'Cerchio di Pietre',type:'Roccia',power:70,accuracy:1,targetCount:2,
    desc:'Potenza 70. Colpisce fino a due avversari con rocce scagliate contemporaneamente.'
  },

  // Gaara: difesa e pressione del deserto.
  'Mano di Sabbia': {
    name:'Mano di Sabbia',type:'Terra',power:86,accuracy:1,
    hitStatDebuff:{spd:.85,chance:.3},
    desc:'Potenza 86. Il 30% delle volte riduce la Velocita del nemico del 15%.'
  },
  'Scudo del Kazekage': {
    name:'Scudo del Kazekage',type:'Terra',power:0,target:'self',
    statBuff:{def:1.35},maxUses:2,strictUses:true,
    desc:'Una corazza di sabbia aumenta la Difesa del 35%. Due utilizzi.'
  },
  'Sguardo del Deserto': {
    name:'Sguardo del Deserto',type:'Psico',power:74,special:true,accuracy:1,
    statusEffect:{type:'Confuso',chance:.2,turns:2},
    desc:'Potenza 74. Il 20% delle volte confonde il bersaglio per 2 turni.'
  },
  'Funerale della Sabbia': {
    name:'Funerale della Sabbia',type:'Terra',power:115,accuracy:.9,
    maxUses:2,strictUses:true,
    desc:'Potenza 115, precisione 90%. Attacco decisivo con due utilizzi.'
  },

  // Flygon: combattente rapido ad alto ritmo.
  'Dune Soniche': {
    name:'Dune Soniche',type:'Terra',power:78,accuracy:1,targetCount:2,
    desc:'Potenza 78. Le onde di sabbia colpiscono fino a due nemici.'
  },
  'Danza del Drago delle Dune': {
    name:'Danza del Drago delle Dune',type:'Drago',power:0,target:'self',
    statBuff:{atk:1.2,spd:1.15},maxUses:2,strictUses:true,
    desc:'Attacco +20% e Velocita +15%. Due utilizzi.'
  },
  'Scaglia Vorticosa': {
    name:'Scaglia Vorticosa',type:'Drago',power:92,accuracy:1,
    desc:'Potenza 92. Flygon piomba sul bersaglio in una spirale di vento.'
  },
  'Spirale del Deserto': {
    name:'Spirale del Deserto',type:'Terra',power:108,accuracy:.9,
    maxUses:2,strictUses:true,
    hitStatDebuff:{def:.9,chance:.2},
    desc:'Potenza 108, precisione 90%. Il 20% delle volte riduce la Difesa del 10%. Due utilizzi.'
  },

  // Flora: sostegno, cura e attacchi corali.
  'Liane Smeraldine': {
    name:'Liane Smeraldine',type:'Erba',power:76,special:true,accuracy:1,
    hitStatDebuff:{spd:.85,chance:.25},
    desc:'Potenza 76. Il 25% delle volte riduce la Velocita del nemico del 15%.'
  },
  'Rosa Curativa': {
    name:'Rosa Curativa',type:'Erba',power:0,targetMode:'ally',heal:.3,
    maxUses:3,strictUses:true,
    desc:'Cura del 30% dei PS massimi se stessa oppure un alleato attivo. Tre utilizzi.'
  },
  'Pollini Stellati': {
    name:'Pollini Stellati',type:'Folletto',power:82,special:true,accuracy:1,
    statusEffect:{type:'Confuso',chance:.15,turns:2},
    desc:'Potenza 82. Il 15% delle volte confonde il bersaglio per 2 turni.'
  },
  'Tempesta di Petali': {
    name:'Tempesta di Petali',type:'Erba',power:78,special:true,accuracy:1,
    targetCount:2,
    desc:'Potenza 78. Travolge fino a due nemici con una pioggia di petali.'
  },

  // Leafeon: attacchi veloci, copertura e rigenerazione.
  'Foglialama di Giada': {
    name:'Foglialama di Giada',type:'Erba',power:92,accuracy:1,contact:true,
    desc:'Potenza 92. Un fendente ravvicinato con le foglie affilate.'
  },
  'Balzo delle Foglie': {
    name:'Balzo delle Foglie',type:'Erba',power:65,accuracy:1,priority:1,contact:true,
    desc:'Potenza 65, priorita +1: Leafeon anticipa gli avversari.'
  },
  'Difesa Fogliare': {
    name:'Difesa Fogliare',type:'Erba',power:0,target:'self',
    statBuff:{def:1.3},maxUses:2,strictUses:true,
    desc:'La Difesa aumenta del 30%. Due utilizzi.'
  },
  'Corrente di Fronde': {
    name:'Corrente di Fronde',type:'Erba',power:75,accuracy:1,targetCount:2,
    hitStatDebuff:{spd:.9,chance:.2},
    desc:'Potenza 75 contro fino a due nemici; 20% di ridurre la Velocita del 10%.'
  },

  // Shaymin: purificazione e sostegno alla squadra.
  'Seme di Gratitudine': {
    name:'Seme di Gratitudine',type:'Erba',power:85,special:true,accuracy:1,drain:.15,
    desc:'Potenza 85. Recupera il 15% dei danni effettivamente inflitti.'
  },
  'Prato della Rinascita': {
    name:'Prato della Rinascita',type:'Erba',power:0,targetMode:'ally',
    heal:.28,removeNegativeStatuses:true,maxUses:3,strictUses:true,
    desc:'Cura il 28% dei PS massimi di Shaymin o di un alleato attivo e rimuove gli status negativi. Tre utilizzi.'
  },
  'Fiore Cometa': {
    name:'Fiore Cometa',type:'Luce',power:90,special:true,accuracy:1,
    hitStatDebuff:{atk:.9,chance:.2},
    desc:'Potenza 90. Il 20% delle volte riduce l Attacco nemico del 10%.'
  },
  'Eco Primaverile': {
    name:'Eco Primaverile',type:'Erba',power:72,special:true,accuracy:1,targetCount:2,
    desc:'Potenza 72. Colpisce fino a due nemici con una scarica di energia vegetale.'
  }
};

export const EARTH_GRASS_CHARACTERS = [
  {
    id:'tophbeifong',name:'Toph Beifong',types:['Terra','Roccia'],
    hp:108,maxHp:108,atk:110,spAtk:85,def:115,spDef:101,spd:82,
    img:'https://www.pikpng.com/pngl/m/507-5076717_post-toph-avatar-clipart.png',
    passive:{name:'Senso Sismico',type:'on_enter',maxUses:1,
      selfStatBuff:{def:1.2},
      desc:'Al primo ingresso in campo percepisce il terreno e aumenta la propria Difesa del 20%.'},
    moveNames:['Maglio della Faglia','Passo Sismico','Metallo Fluido','Cerchio di Pietre']
  },
  {
    id:'gaara',name:'Gaara',types:['Terra','Psico'],
    hp:115,maxHp:115,atk:95,spAtk:112,def:105,spDef:105,spd:78,
    img:'https://www.pngfind.com/pngs/m/162-1623719_thumb-image-gaara-kazekage-hd-png-download.png',
    passive:{name:'Sabbia Protettiva',type:'on_hp_threshold',threshold:.5,maxUses:1,
      statBuff:{def:1.25,spd:1.1},
      desc:'La prima volta che scende al 50% dei PS o meno, se sopravvive, aumenta Difesa del 25% e Velocita del 10%.'},
    moveNames:['Mano di Sabbia','Scudo del Kazekage','Sguardo del Deserto','Funerale della Sabbia']
  },
  {
    id:'flygon',name:'Flygon',types:['Terra','Drago'],
    hp:100,maxHp:100,atk:111,spAtk:88,def:85,spDef:88,spd:121,
    img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/330.png',
    passive:{name:'Predatore delle Dune',type:'first_strike_bonus',damageBonus:1.15,
      desc:'Se esegue il primo attacco offensivo del turno, la potenza della sua mossa aumenta del 15%.'},
    moveNames:['Dune Soniche','Danza del Drago delle Dune','Scaglia Vorticosa','Spirale del Deserto']
  },
  {
    id:'flora',name:'Flora',types:['Erba','Folletto'],
    hp:102,maxHp:102,atk:77,spAtk:115,def:90,spDef:105,spd:95,
    img:'https://www.nicepng.com/png/full/229-2292865_stock-art-flora-winx-club-season-1.png',
    passive:{name:'Armonia della Natura',type:'on_enter',maxUses:1,
      teamStatBuff:{def:1.1},
      desc:'Al primo ingresso aumenta la Difesa del 10% di se stessa e di tutti gli alleati attivi.'},
    moveNames:['Liane Smeraldine','Rosa Curativa','Pollini Stellati','Tempesta di Petali']
  },
  {
    id:'leafeon',name:'Leafeon',types:['Erba'],
    hp:101,maxHp:101,atk:108,spAtk:77,def:103,spDef:90,spd:112,
    img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/470.png',
    passive:{name:'Fotosintesi Costante',type:'on_turn_end',healPercent:.04,
      desc:'Alla fine di ogni turno in cui e in campo recupera il 4% dei propri PS massimi, se non e esausto.'},
    moveNames:['Foglialama di Giada','Balzo delle Foglie','Difesa Fogliare','Corrente di Fronde']
  },
  {
    id:'shaymin',name:'Shaymin',types:['Erba','Luce'],
    hp:105,maxHp:105,atk:88,spAtk:110,def:96,spDef:112,spd:93,
    img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/492.png',
    passive:{name:'Gratitudine Fiorita',type:'on_turn_end',healLowestAllyPercent:.04,
      desc:'Alla fine di ogni turno in campo cura del 4% dei PS massimi l alleato attivo vivo con la percentuale di PS piu bassa (se stesso incluso).'},
    moveNames:['Seme di Gratitudine','Prato della Rinascita','Fiore Cometa','Eco Primaverile']
  }
];
