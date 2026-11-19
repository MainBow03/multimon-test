// 15 eroi del Multiverso: cinque Cristallo, cinque Roccia, due Suono, tre Insetto.
// Le immagini sono fotogrammi con sfondo, non sprite trasparenti. Zero Pokemon.
export const CRYSTAL_ROCK_SOUND_BUG_MOVES = {
  "Schegge di Atlantide": {
    "name": "Schegge di Atlantide",
    "type": "Cristallo",
    "power": 85,
    "special": true,
    "hitStatDebuff": {
      "spDef": 0.85,
      "chance": 0.2
    },
    "desc": "Un raggio di schegge del Cuore: 20% di ridurre Difesa Speciale del 15%."
  },
  "Cupola Atlantidea": {
    "name": "Cupola Atlantidea",
    "type": "Cristallo",
    "power": 0,
    "targetMode": "team",
    "barrier": {
      "reduce": 0.2,
      "turns": 2
    },
    "maxUses": 3,
    "strictUses": true,
    "desc": "Protegge tutti gli alleati con barriera del 20% per due turni. Tre usi."
  },
  "Fonte di Lemuria": {
    "name": "Fonte di Lemuria",
    "type": "Acqua",
    "power": 0,
    "targetMode": "ally",
    "heal": 0.4,
    "removeNegativeStatuses": true,
    "maxUses": 3,
    "strictUses": true,
    "desc": "Cura un alleato del 40% e lo libera dagli stati negativi. Tre usi."
  },
  "Raggio del Cuore": {
    "name": "Raggio del Cuore",
    "type": "Cristallo",
    "power": 110,
    "special": true,
    "accuracy": 0.95,
    "maxUses": 3,
    "strictUses": true,
    "desc": "Potenza 110, precisione 95%. Tre usi."
  },
  "Pioggia di Gemme": {
    "name": "Pioggia di Gemme",
    "type": "Cristallo",
    "power": 80,
    "special": true,
    "targetCount": 2,
    "desc": "Scatena due getti di cristalli su due nemici."
  },
  "Abito da Gala": {
    "name": "Abito da Gala",
    "type": "Folletto",
    "power": 0,
    "target": "self",
    "statBuff": {
      "spAtk": 1.2,
      "spDef": 1.2
    },
    "maxUses": 3,
    "strictUses": true,
    "desc": "Aumenta Attacco Speciale e Difesa Speciale del 20%. Tre usi."
  },
  "Vetrata Reale": {
    "name": "Vetrata Reale",
    "type": "Cristallo",
    "power": 0,
    "targetMode": "team",
    "barrier": {
      "reduce": 0.25,
      "turns": 3,
      "specialOnly": true
    },
    "maxUses": 3,
    "strictUses": true,
    "desc": "Team protetto per tre turni: 25% danni speciali in meno. Tre usi."
  },
  "Taglio di Diamante": {
    "name": "Taglio di Diamante",
    "type": "Cristallo",
    "power": 95,
    "critChance": 0.3,
    "critPower": 125,
    "desc": "Lama preziosa: 30% di colpo critico a potenza 125."
  },
  "Martello di Bismuto": {
    "name": "Martello di Bismuto",
    "type": "Robot",
    "power": 92,
    "contact": true,
    "desc": "Colpo di fucina temprato: potenza 92."
  },
  "Forgiatura Rapida": {
    "name": "Forgiatura Rapida",
    "type": "Cristallo",
    "power": 0,
    "target": "self",
    "heal": 0.25,
    "statBuff": {
      "atk": 1.2
    },
    "maxUses": 3,
    "strictUses": true,
    "desc": "Ripristina il 25% dei PS e aumenta Attacco del 20%. Tre usi."
  },
  "Gabbia Gemmata": {
    "name": "Gabbia Gemmata",
    "type": "Cristallo",
    "power": 0,
    "targetStatDebuff": {
      "spd": 0.75
    },
    "statusEffect": {
      "type": "Stordito",
      "chance": 0.25,
      "turns": 1
    },
    "maxUses": 3,
    "strictUses": true,
    "desc": "Blocca il bersaglio: Velocita -25% e 25% di stordire. Tre usi."
  },
  "Incudine della Rivolta": {
    "name": "Incudine della Rivolta",
    "type": "Robot",
    "power": 112,
    "accuracy": 0.92,
    "maxUses": 2,
    "strictUses": true,
    "desc": "Incudine esplosiva di potenza 112, due utilizzi."
  },
  "Frusta di Ambra": {
    "name": "Frusta di Ambra",
    "type": "Cristallo",
    "power": 82,
    "contact": true,
    "desc": "Una frusta di gemma cremisi colpisce il bersaglio."
  },
  "Marcia Cremisi": {
    "name": "Marcia Cremisi",
    "type": "Fuoco",
    "power": 0,
    "targetMode": "team",
    "temporaryTeamBuff": {
      "stat": "spd",
      "multiplier": 1.15,
      "turns": 3
    },
    "maxUses": 2,
    "strictUses": true,
    "desc": "Team: Velocita +15% per tre turni, due utilizzi."
  },
  "Ordine Infrangibile": {
    "name": "Ordine Infrangibile",
    "type": "Cristallo",
    "power": 0,
    "targetStatDebuff": {
      "atk": 0.85,
      "spAtk": 0.85
    },
    "maxUses": 2,
    "strictUses": true,
    "desc": "Un avversario perde 15% Attacco e Attacco Speciale. Due usi."
  },
  "Esplosione Hessonite": {
    "name": "Esplosione Hessonite",
    "type": "Fuoco",
    "power": 108,
    "accuracy": 0.95,
    "statusEffect": {
      "type": "Scottato",
      "chance": 0.2,
      "turns": 3
    },
    "desc": "Esplosione 108 con 20% probabilita di Scottatura."
  },
  "Lama Fosforescente": {
    "name": "Lama Fosforescente",
    "type": "Cristallo",
    "power": 86,
    "desc": "Un taglio di gemma che brilla nel buio."
  },
  "Vento Tagliente di Gemma": {
    "name": "Vento Tagliente di Gemma",
    "type": "Aria",
    "power": 78,
    "special": true,
    "targetCount": 2,
    "desc": "Schegge leggere spazzano due avversari."
  },
  "Riparazione Minerale": {
    "name": "Riparazione Minerale",
    "type": "Cristallo",
    "power": 0,
    "target": "self",
    "heal": 0.3,
    "statBuff": {
      "def": 1.2
    },
    "maxUses": 3,
    "strictUses": true,
    "desc": "Cura 30% PS e conferisce Difesa +20%. Tre usi."
  },
  "Frantumazione Lucente": {
    "name": "Frantumazione Lucente",
    "type": "Cristallo",
    "power": 104,
    "accuracy": 0.95,
    "hitStatDebuff": {
      "def": 0.9,
      "chance": 0.2
    },
    "desc": "Potenza 104, 20% di diminuire la Difesa del 10%."
  },
  "Schianto dell Arena": {
    "name": "Schianto dell Arena",
    "type": "Roccia",
    "power": 90,
    "desc": "Potenza 90: il campione frantuma il terreno."
  },
  "Provocazione del Campione": {
    "name": "Provocazione del Campione",
    "type": "Lotta",
    "power": 0,
    "targetStatDebuff": {
      "atk": 0.85,
      "acc": 0.85
    },
    "maxUses": 3,
    "strictUses": true,
    "desc": "Riduce Attacco e Precisione nemici del 15%. Tre usi."
  },
  "Posa da Titano": {
    "name": "Posa da Titano",
    "type": "Roccia",
    "power": 0,
    "target": "self",
    "statBuff": {
      "def": 1.25,
      "atk": 1.1
    },
    "maxUses": 3,
    "strictUses": true,
    "desc": "Difesa +25% e Attacco +10%, tre utilizzi."
  },
  "Valanga del Boulder": {
    "name": "Valanga del Boulder",
    "type": "Roccia",
    "power": 108,
    "accuracy": 0.9,
    "targetCount": 2,
    "maxUses": 2,
    "strictUses": true,
    "desc": "Massi in arena: due bersagli colpiti, precisione 90%. Due usi."
  },
  "Menhir Volante": {
    "name": "Menhir Volante",
    "type": "Roccia",
    "power": 88,
    "desc": "Un menhir vola da un lato all'altro dell'arena."
  },
  "Merenda Gallica": {
    "name": "Merenda Gallica",
    "type": "Normale",
    "power": 0,
    "target": "self",
    "heal": 0.35,
    "removeNegativeStatuses": true,
    "maxUses": 3,
    "strictUses": true,
    "desc": "Cura del 35% e purifica dai malus. Tre usi."
  },
  "Testa Dura": {
    "name": "Testa Dura",
    "type": "Roccia",
    "power": 0,
    "target": "self",
    "statBuff": {
      "def": 1.25,
      "spDef": 1.25
    },
    "maxUses": 2,
    "strictUses": true,
    "desc": "Difesa e Difesa Speciale +25%. Due usi."
  },
  "Corsa del Cinghiale": {
    "name": "Corsa del Cinghiale",
    "type": "Normale",
    "power": 102,
    "statusEffect": {
      "type": "Stordito",
      "chance": 0.2,
      "turns": 1
    },
    "desc": "Carica 102 con 20% di Stordimento."
  },
  "Pugno di Basalto": {
    "name": "Pugno di Basalto",
    "type": "Roccia",
    "power": 84,
    "contact": true,
    "desc": "Il braccio vulcanico abbatte la guardia nemica."
  },
  "Colata Amichevole": {
    "name": "Colata Amichevole",
    "type": "Fuoco",
    "power": 0,
    "target": "self",
    "heal": 0.2,
    "hotSkinTurns": 2,
    "maxUses": 2,
    "strictUses": true,
    "desc": "Cura Korg del 20%; per due turni, attacchi di contatto possono Scottare."
  },
  "Frammenti Vulcanici": {
    "name": "Frammenti Vulcanici",
    "type": "Roccia",
    "power": 76,
    "targetCount": 2,
    "desc": "Lancia detriti di Sakaar a due nemici."
  },
  "Eruzione Gentile": {
    "name": "Eruzione Gentile",
    "type": "Fuoco",
    "power": 110,
    "accuracy": 0.9,
    "maxUses": 3,
    "strictUses": true,
    "desc": "Un'eruzione poco gentile: potenza 110 e tre usi."
  },
  "Artigli di Granito": {
    "name": "Artigli di Granito",
    "type": "Roccia",
    "power": 87,
    "contact": true,
    "desc": "Artigli scolpiti colpiscono la guardia avversaria."
  },
  "Ali della Notte": {
    "name": "Ali della Notte",
    "type": "Aria",
    "power": 78,
    "priority": 1,
    "desc": "Priorita +1. Goliath atterra prima del nemico."
  },
  "Sentinella Gotica": {
    "name": "Sentinella Gotica",
    "type": "Roccia",
    "power": 0,
    "targetMode": "ally",
    "barrier": {
      "reduce": 0.3,
      "turns": 2
    },
    "maxUses": 3,
    "strictUses": true,
    "desc": "Un alleato riceve barriera protettiva del 30% per due turni. Tre usi."
  },
  "Tuffo del Gargoyle": {
    "name": "Tuffo del Gargoyle",
    "type": "Aria",
    "power": 106,
    "accuracy": 0.9,
    "hitStatDebuff": {
      "atk": 0.9,
      "chance": 0.2
    },
    "desc": "Potenza 106, 20% di ridurre Attacco di un 10%."
  },
  "Morso di Scogliera": {
    "name": "Morso di Scogliera",
    "type": "Roccia",
    "power": 94,
    "contact": true,
    "desc": "Il Mangiarocce consuma perfino la scogliera."
  },
  "Radici della Montagna": {
    "name": "Radici della Montagna",
    "type": "Terra",
    "power": 0,
    "target": "self",
    "statBuff": {
      "def": 1.25
    },
    "removeNegativeStatuses": true,
    "maxUses": 3,
    "strictUses": true,
    "desc": "Difesa +25% e cura gli status negativi. Tre usi."
  },
  "Masso Vagante": {
    "name": "Masso Vagante",
    "type": "Roccia",
    "power": 80,
    "targetCount": 2,
    "desc": "Spezza il terreno in due massi contro due nemici."
  },
  "Tremore Primordiale": {
    "name": "Tremore Primordiale",
    "type": "Terra",
    "power": 108,
    "accuracy": 0.9,
    "hitStatDebuff": {
      "spd": 0.85,
      "chance": 0.25
    },
    "desc": "Colpo di terra 108 con 25% di abbassare la Velocita del 15%."
  },
  "Accordo dell Aldila": {
    "name": "Accordo dell Aldila",
    "type": "Suono",
    "power": 84,
    "special": true,
    "desc": "Un accordo spettrale da potenza 84."
  },
  "Ricordo di Hector": {
    "name": "Ricordo di Hector",
    "type": "Spettro",
    "power": 0,
    "targetMode": "ally",
    "heal": 0.35,
    "targetStatBuff": {
      "spd": 1.15
    },
    "maxUses": 3,
    "strictUses": true,
    "desc": "Cura 35% di un alleato e gli aumenta Velocita del 15%. Tre usi."
  },
  "Chitarra delle Anime": {
    "name": "Chitarra delle Anime",
    "type": "Suono",
    "power": 96,
    "special": true,
    "statusEffect": {
      "type": "Addormentato",
      "chance": 0.2,
      "turns": 2
    },
    "desc": "Potenza 96, 20% di Addormentare per due turni."
  },
  "Non Dimenticarmi": {
    "name": "Non Dimenticarmi",
    "type": "Suono",
    "power": 0,
    "targetMode": "ally",
    "removeNegativeStatuses": true,
    "targetStatBuff": {
      "spAtk": 1.2
    },
    "maxUses": 3,
    "strictUses": true,
    "desc": "Libera un alleato dagli status negativi e gli aumenta Attacco Speciale del 20%. Tre usi."
  },
  "Canary Cry": {
    "name": "Canary Cry",
    "type": "Suono",
    "power": 95,
    "special": true,
    "targetCount": 2,
    "desc": "Urlo sonico potente su due avversari."
  },
  "Planata Tattica": {
    "name": "Planata Tattica",
    "type": "Aria",
    "power": 0,
    "target": "self",
    "statBuff": {
      "spd": 1.2
    },
    "selfEvasionBonus": 0.1,
    "maxUses": 3,
    "strictUses": true,
    "desc": "Velocita +20% ed elusione +10%, tre utilizzi."
  },
  "Fendente Acustico": {
    "name": "Fendente Acustico",
    "type": "Suono",
    "power": 78,
    "special": true,
    "hitStatDebuff": {
      "spDef": 0.85,
      "chance": 0.3
    },
    "desc": "30% probabilita di ridurre Difesa Speciale del 15%."
  },
  "Raffica della Vigilante": {
    "name": "Raffica della Vigilante",
    "type": "Aria",
    "power": 102,
    "accuracy": 0.9,
    "priority": 1,
    "maxUses": 3,
    "strictUses": true,
    "desc": "Potenza 102, priorita +1, tre utilizzi."
  },
  "Puntura Dorata": {
    "name": "Puntura Dorata",
    "type": "Insetto",
    "power": 76,
    "priority": 1,
    "desc": "La piccola ape fa un affondo rapido."
  },
  "Volo tra i Fiori": {
    "name": "Volo tra i Fiori",
    "type": "Folletto",
    "power": 0,
    "targetMode": "team",
    "targetStatBuff": {
      "spd": 1.1,
      "spDef": 1.1
    },
    "maxUses": 3,
    "strictUses": true,
    "desc": "Tutti gli alleati attivi: Velocita e Difesa Speciale +10%. Tre usi."
  },
  "Miele Rigenerante": {
    "name": "Miele Rigenerante",
    "type": "Insetto",
    "power": 0,
    "targetMode": "ally",
    "heal": 0.4,
    "maxUses": 4,
    "strictUses": true,
    "desc": "Nettare da 40% PS su un alleato, quattro utilizzi."
  },
  "Sciame Primaverile": {
    "name": "Sciame Primaverile",
    "type": "Insetto",
    "power": 92,
    "targetCount": 2,
    "hitStatDebuff": {
      "spd": 0.9,
      "chance": 0.1
    },
    "desc": "Potenza 92 su due nemici e 10% di abbassare Velocita."
  },
  "Lama dello Scarabeo": {
    "name": "Lama dello Scarabeo",
    "type": "Insetto",
    "power": 88,
    "contact": true,
    "desc": "Armatura a forma di lama, potenza 88."
  },
  "Cannone Khaji-Da": {
    "name": "Cannone Khaji-Da",
    "type": "Robot",
    "power": 97,
    "special": true,
    "desc": "Cannone alieno 97 di tipo Acciaio."
  },
  "Assetto Tattico": {
    "name": "Assetto Tattico",
    "type": "Robot",
    "power": 0,
    "target": "self",
    "statBuff": {
      "atk": 1.2,
      "spAtk": 1.2
    },
    "maxUses": 3,
    "strictUses": true,
    "desc": "Attacco e Attacco Speciale +20%. Tre usi."
  },
  "Carapace Orbitale": {
    "name": "Carapace Orbitale",
    "type": "Insetto",
    "power": 0,
    "target": "self",
    "barrier": {
      "reduce": 0.25,
      "turns": 3
    },
    "maxUses": 3,
    "strictUses": true,
    "desc": "Scudo personale del 25% per tre turni. Tre usi."
  },
  "Rider Sting": {
    "name": "Rider Sting",
    "type": "Insetto",
    "power": 86,
    "contact": true,
    "desc": "Puntura elettrica, potenza 86."
  },
  "Clock Up": {
    "name": "Clock Up",
    "type": "Elettro",
    "power": 0,
    "target": "self",
    "statBuff": {
      "spd": 1.3
    },
    "royalGrantPriority": true,
    "maxUses": 2,
    "strictUses": true,
    "desc": "Velocita +30%; la prossima mossa offensiva ha priorita +1. Due usi."
  },
  "Lampo Corazzato": {
    "name": "Lampo Corazzato",
    "type": "Elettro",
    "power": 83,
    "special": true,
    "statusEffect": {
      "type": "Elettrizzato",
      "chance": 0.25,
      "turns": 2
    },
    "desc": "25% di Elettrizzare per due turni."
  },
  "Rider Kick": {
    "name": "Rider Kick",
    "type": "Insetto",
    "power": 112,
    "accuracy": 0.9,
    "maxUses": 3,
    "strictUses": true,
    "desc": "Potenza 112, precisione 90%. Tre utilizzi."
  }
};

export const CRYSTAL_ROCK_SOUND_BUG_CHARACTERS = [
  {
    "id": "kida",
    "name": "Kida Nedakh",
    "types": [
      "Cristallo",
      "Acqua"
    ],
    "hp": 105,
    "maxHp": 105,
    "atk": 91,
    "spAtk": 115,
    "def": 103,
    "spDef": 106,
    "spd": 98,
    "img": "https://thatoldpictureshow.com/wp-content/uploads/2020/04/atlantis.jpg",
    "passive": {
      "name": "Cuore di Atlantide",
      "type": "atlantean_heart",
      "maxUses": 1,
      "desc": "La prima volta sotto il 50% dei PS, se sopravvive, recupera il 20% dei PS e offre agli alleati una cupola del 15% per due turni."
    },
    "moveNames": [
      "Schegge di Atlantide",
      "Cupola Atlantidea",
      "Fonte di Lemuria",
      "Raggio del Cuore"
    ]
  },
  {
    "id": "rarity",
    "name": "Rarity",
    "types": [
      "Cristallo",
      "Folletto"
    ],
    "hp": 96,
    "maxHp": 96,
    "atk": 83,
    "spAtk": 110,
    "def": 90,
    "spDef": 117,
    "spd": 102,
    "img": "https://static.manebooru.art/img/2020/8/20/1200029/large.jpg",
    "passive": {
      "name": "Eleganza Perfetta",
      "type": "perfect_elegance",
      "desc": "Dopo un supporto riuscito, Difesa Speciale +10% e cura del 6% l alleato ferito con meno PS."
    },
    "moveNames": [
      "Pioggia di Gemme",
      "Abito da Gala",
      "Vetrata Reale",
      "Taglio di Diamante"
    ]
  },
  {
    "id": "bismuth",
    "name": "Bismuth",
    "types": [
      "Cristallo",
      "Robot"
    ],
    "hp": 119,
    "maxHp": 119,
    "atk": 120,
    "spAtk": 85,
    "def": 119,
    "spDef": 95,
    "spd": 69,
    "img": "https://i0.wp.com/i.imgur.com/tbB6Yka.png",
    "passive": {
      "name": "Forgia Ribelle",
      "type": "rebel_forge",
      "maxUses": 1,
      "desc": "Dopo il primo attacco Cristallo o Acciaio riuscito aumenta la propria Difesa del 20%, una volta per battaglia."
    },
    "moveNames": [
      "Martello di Bismuto",
      "Forgiatura Rapida",
      "Gabbia Gemmata",
      "Incudine della Rivolta"
    ]
  },
  {
    "id": "hessonite",
    "name": "Hessonite",
    "types": [
      "Cristallo",
      "Fuoco"
    ],
    "hp": 106,
    "maxHp": 106,
    "atk": 117,
    "spAtk": 109,
    "def": 94,
    "spDef": 92,
    "spd": 112,
    "img": "https://maroonersrock.com/wp-content/uploads/2017/10/Hessonite_Card.png",
    "passive": {
      "name": "Comandante Imperiale",
      "type": "on_enter",
      "maxUses": 1,
      "teamStatBuff": {
        "atk": 1.1
      },
      "desc": "All ingresso in campo aumenta l Attacco degli alleati attivi del 10%, una volta per battaglia."
    },
    "moveNames": [
      "Frusta di Ambra",
      "Marcia Cremisi",
      "Ordine Infrangibile",
      "Esplosione Hessonite"
    ]
  },
  {
    "id": "phosphophyllite",
    "name": "Phosphophyllite",
    "types": [
      "Cristallo",
      "Aria"
    ],
    "hp": 85,
    "maxHp": 85,
    "atk": 80,
    "spAtk": 107,
    "def": 70,
    "spDef": 83,
    "spd": 132,
    "img": "https://www.animeclick.it/immagini/anime/Houseki_no_Kuni_TV/gallery_original/Houseki_no_Kuni_TV-59d90d91c6a44.jpg",
    "passive": {
      "name": "Corpo Fragile, Anima Lucida",
      "type": "fragile_lucid",
      "maxUses": 1,
      "threshold": 0.6,
      "desc": "Quando subisce un critico o scende sotto il 60% dei PS e sopravvive, guadagna Velocita +20%. Una volta per battaglia."
    },
    "moveNames": [
      "Lama Fosforescente",
      "Vento Tagliente di Gemma",
      "Riparazione Minerale",
      "Frantumazione Lucente"
    ]
  },
  {
    "id": "theboulder",
    "name": "The Boulder",
    "types": [
      "Roccia",
      "Lotta"
    ],
    "hp": 119,
    "maxHp": 119,
    "atk": 117,
    "spAtk": 78,
    "def": 105,
    "spDef": 77,
    "spd": 77,
    "img": "https://www.looper.com/img/gallery/15-best-avatar-the-last-airbender-characters-ranked/the-boulder-1647545922.jpg",
    "passive": {
      "name": "Showman del Ring",
      "type": "on_ko",
      "maxUses": 2,
      "statBuff": {
        "atk": 1.2
      },
      "desc": "Quando manda KO un nemico guadagna Attacco +20%, fino a due volte per battaglia."
    },
    "moveNames": [
      "Schianto dell Arena",
      "Provocazione del Campione",
      "Posa da Titano",
      "Valanga del Boulder"
    ]
  },
  {
    "id": "obelix",
    "name": "Obelix",
    "types": [
      "Roccia",
      "Normale"
    ],
    "hp": 140,
    "maxHp": 140,
    "atk": 119,
    "spAtk": 71,
    "def": 117,
    "spDef": 87,
    "spd": 54,
    "img": "https://www.cartonionline.com/wordpress/wp-content/uploads/2021/12/asterix_e_la_pozione_magica_01.jpg",
    "passive": {
      "name": "Menhir Ambulante",
      "type": "damage_reduction",
      "physicalReduction": 0.15,
      "desc": "Subisce 15% danni fisici in meno grazie alla sua eccezionale robustezza."
    },
    "moveNames": [
      "Menhir Volante",
      "Merenda Gallica",
      "Testa Dura",
      "Corsa del Cinghiale"
    ]
  },
  {
    "id": "korg",
    "name": "Korg",
    "types": [
      "Roccia",
      "Fuoco"
    ],
    "hp": 122,
    "maxHp": 122,
    "atk": 107,
    "spAtk": 94,
    "def": 119,
    "spDef": 100,
    "spd": 70,
    "img": "https://imgix.bustle.com/uploads/image/2017/10/31/cc906b83-766f-4a51-ad4f-a428cf72f3ff-screen-shot-2017-10-31-at-90629-am.png?auto=format&crop=faces&fit=crop&h=546&q=70&w=970",
    "passive": {
      "name": "Tranquillita Lavica",
      "type": "lava_calm",
      "threshold": 0.5,
      "damageBonus": 1.15,
      "desc": "Sotto il 50% dei PS gli attacchi Roccia e Fuoco infliggono il 15% di danni in piu."
    },
    "moveNames": [
      "Pugno di Basalto",
      "Colata Amichevole",
      "Frammenti Vulcanici",
      "Eruzione Gentile"
    ]
  },
  {
    "id": "goliath",
    "name": "Goliath",
    "types": [
      "Roccia",
      "Aria"
    ],
    "hp": 120,
    "maxHp": 120,
    "atk": 115,
    "spAtk": 79,
    "def": 117,
    "spDef": 94,
    "spd": 86,
    "img": "https://www.looper.com/img/gallery/gargoyles-live-action-plot-details-tease-goliaths-mission-and-a-mystery/l-intro-1697608364.jpg",
    "passive": {
      "name": "Guardia di Pietra",
      "type": "stone_guard",
      "maxUses": 1,
      "desc": "Primo ingresso: Difesa Speciale +20%, immune ai rallentamenti per il primo turno in campo."
    },
    "moveNames": [
      "Artigli di Granito",
      "Ali della Notte",
      "Sentinella Gotica",
      "Tuffo del Gargoyle"
    ]
  },
  {
    "id": "mangiarocce",
    "name": "Mangiarocce",
    "types": [
      "Roccia",
      "Terra"
    ],
    "hp": 139,
    "maxHp": 139,
    "atk": 116,
    "spAtk": 60,
    "def": 128,
    "spDef": 91,
    "spd": 43,
    "img": "https://www.slashfilm.com/img/gallery/alan-oppenheimer-had-no-trouble-finding-voices-for-the-neverending-storys-fantasy-creatures/alan-oppenheimer-voiced-more-than-one-creature-in-the-film-1674746347.jpg",
    "passive": {
      "name": "Fame di Montagne",
      "type": "mountain_eater",
      "healPercent": 0.1,
      "desc": "Quando riceve un colpo di tipo Roccia o Terra recupera il 10% dei PS massimi, una volta per turno."
    },
    "moveNames": [
      "Morso di Scogliera",
      "Radici della Montagna",
      "Masso Vagante",
      "Tremore Primordiale"
    ]
  },
  {
    "id": "miguelrivera",
    "name": "Miguel Rivera",
    "types": [
      "Suono",
      "Spettro"
    ],
    "hp": 96,
    "maxHp": 96,
    "atk": 75,
    "spAtk": 108,
    "def": 82,
    "spDef": 107,
    "spd": 105,
    "img": "https://i.blogs.es/aaa610/diseno-sin-titulo-19-/840_560.jpeg",
    "passive": {
      "name": "Musica dell Altrove",
      "type": "music_beyond",
      "healPercent": 0.07,
      "desc": "Dopo il primo attacco Suono riuscito in ogni turno, cura del 7% dei PS massimi l alleato piu ferito."
    },
    "moveNames": [
      "Accordo dell Aldila",
      "Ricordo di Hector",
      "Chitarra delle Anime",
      "Non Dimenticarmi"
    ]
  },
  {
    "id": "blackcanary",
    "name": "Black Canary",
    "types": [
      "Suono",
      "Aria"
    ],
    "hp": 104,
    "maxHp": 104,
    "atk": 106,
    "spAtk": 105,
    "def": 94,
    "spDef": 88,
    "spd": 122,
    "img": "https://dcanimated.com/WF/jlu/bios/canary/06.jpg",
    "passive": {
      "name": "Urlo Addestrato",
      "type": "trained_scream",
      "damageBonus": 1.15,
      "desc": "La prima mossa Suono offensiva di ogni turno riceve un bonus del 15% alla potenza."
    },
    "moveNames": [
      "Canary Cry",
      "Planata Tattica",
      "Fendente Acustico",
      "Raffica della Vigilante"
    ]
  },
  {
    "id": "mayalape",
    "name": "Maya l Ape",
    "types": [
      "Insetto",
      "Folletto"
    ],
    "hp": 92,
    "maxHp": 92,
    "atk": 81,
    "spAtk": 98,
    "def": 82,
    "spDef": 108,
    "spd": 121,
    "img": "https://s.tvp.pl/images/5/e/0/uid_5e0899d2849140d488df8b5b2ad1654b_width_1200_play_0_pos_0_gs_0_height_630.png",
    "passive": {
      "name": "Nettare Curativo",
      "type": "nectar_healing",
      "chance": 0.35,
      "healPercent": 0.1,
      "desc": "Alla fine del turno, 35% di rimuovere uno status negativo a un alleato attivo, curandolo anche del 10% dei PS massimi."
    },
    "moveNames": [
      "Puntura Dorata",
      "Volo tra i Fiori",
      "Miele Rigenerante",
      "Sciame Primaverile"
    ]
  },
  {
    "id": "bluebeetle",
    "name": "Blue Beetle",
    "types": [
      "Insetto",
      "Robot"
    ],
    "hp": 112,
    "maxHp": 112,
    "atk": 110,
    "spAtk": 109,
    "def": 112,
    "spDef": 104,
    "spd": 101,
    "img": "https://images.squarespace-cdn.com/content/v1/60455d6a513f6b5c4dccdb4c/d44ecac2-7102-4a11-b6b2-7f041c554f70/blue-beetle.jpg",
    "passive": {
      "name": "Scarabeo Adattivo",
      "type": "adaptive_scarab",
      "desc": "Prima volta colpito da mossa fisica: Attacco +20%; prima volta da speciale: Attacco Speciale +20%. Una volta per categoria."
    },
    "moveNames": [
      "Lama dello Scarabeo",
      "Cannone Khaji-Da",
      "Assetto Tattico",
      "Carapace Orbitale"
    ]
  },
  {
    "id": "kamenriderkabuto",
    "name": "Kamen Rider Kabuto",
    "types": [
      "Insetto",
      "Elettro"
    ],
    "hp": 101,
    "maxHp": 101,
    "atk": 116,
    "spAtk": 82,
    "def": 101,
    "spDef": 85,
    "spd": 137,
    "img": "https://www.kamen-rider-official.com/uploads/kamen_rider_member/s3_main_image2/249/4335ae76-f7e3-4fdc-9d19-9ab02f81dd5f.jpeg",
    "passive": {
      "name": "Clock Up",
      "type": "on_enter",
      "maxUses": 1,
      "selfStatBuff": {
        "spd": 1.25
      },
      "desc": "All ingresso in campo guadagna +25% Velocita, una volta per battaglia."
    },
    "moveNames": [
      "Rider Sting",
      "Clock Up",
      "Lampo Corazzato",
      "Rider Kick"
    ]
  }
];
