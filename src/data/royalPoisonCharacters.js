// Cinque nuovi Multimon del regno velenoso + evocazione esclusiva.
// Le immagini fornite sono mantenute esattamente come indicate dal giocatore.
export const ROYAL_POISON_CHARACTERS=[
  {id:'malefica',name:'Malefica',types:['Fuoco','Veleno'],
   hp:96,maxHp:96,atk:92,spAtk:112,def:78,spDef:96,spd:87,
   img:'https://i.pinimg.com/736x/92/3d/8f/923d8f62001c6981302ac08cc4a0c641.jpg',
   passive:{name:'Fiamme Maledette',type:'cursed_flames',chanceBurn:.15,chancePoison:.15,
     desc:'Quando colpisce con una mossa dannosa ha il 15% di scottare oppure il 15% di avvelenare. Una sola condizione per colpo.'},
   moveNames:['Fuoco Fatato','Rovi Corrotti','Maledizione Reale','Drago Smeraldo']
  },
  {id:'yzma',name:'Yzma',types:['Veleno'],
   hp:82,maxHp:82,atk:86,spAtk:112,def:74,spDef:99,spd:96,
   img:'https://i.pinimg.com/736x/e2/ad/04/e2ad043e15f3f05392ea53e56eb5f7e3.jpg',
   passive:{name:'Leva Sbagliata!',type:'wrong_lever',counterPower:80,
     desc:'Ogni volta che un avversario le infligge un nuovo status negativo, contrattacca immediatamente con un colpo Veleno da 80 di potenza.'},
   moveNames:['Pozione Misteriosa','Laboratorio Segreto','Formula Imperiale','Geniale! Aspetta...']
  },
  {id:'lavender',name:'Lavender',types:['Veleno','Lotta'],
   hp:94,maxHp:94,atk:108,spAtk:83,def:79,spDef:80,spd:99,
   img:'https://i.pinimg.com/736x/b1/25/e5/b125e53f4c8ca72fb8c47a8287e8ad86.jpg',
   passive:{name:'Veleno del Lupo!',type:'wolf_venom',chance:.35,
     desc:'Ogni volta che colpisce con una mossa Lotta, ha il 35% di avvelenare il bersaglio.'},
   moveNames:['Artigli Tossici','Nebbia Velenifica','Istinto da Predatore','Morso del Basilisco']
  },
  {id:'remedusa',name:'Re Medusa',types:['Elettro','Veleno'],
   hp:108,maxHp:108,atk:87,spAtk:111,def:89,spDef:91,spd:80,
   img:'https://i.pinimg.com/736x/7a/56/f2/7a56f28dadf4931d51433e07d0dffe79.jpg',
   passive:{name:'Agilità della Medusa',type:'medusa_agility',factor:1.1,
     desc:'Alla fine di ogni turno in campo aumenta la propria Velocità del 10%, fino al limite di battaglia.'},
   moveNames:['Scarica di Medusa','Sciame di Meduse','Gelatina Reale','Puntura Reale']
  },
  {id:'malenia',name:'Malenia',types:['Veleno','Luce'],
   hp:106,maxHp:106,atk:103,spAtk:110,def:82,spDef:95,spd:97,
   // Render illustrativo: il giocatore non ha fornito un link dedicato per Malenia.
   img:'https://opis-cdn.tinkoffjournal.ru/mercury/in-out-malenia-blade-of-miquella.jpg?preset=image_1280w_2x',
   passive:{name:'Dea del Marciume',type:'goddess_of_rot',drain:.15,
     desc:'Ogni volta che infligge danni diretti a un nemico recupera il 15% dei PS realmente sottratti, oltre alle cure delle sue mosse.'},
   moveNames:["Fendente dell'Empireo",'Marciume Scarlatto','Danza delle Ali Acquatiche','Fioritura Scarlatta']
  },
  {id:'medusaservitore',name:'Medusa Servitore',types:['Elettro','Veleno'],
   hp:60,maxHp:60,atk:50,spAtk:63,def:50,spDef:57,spd:74,
   img:'https://i.pinimg.com/1200x/88/98/60/889860ff33614368f4839526525aa317.jpg',
   passive:{name:'Per il Mio Re',type:'bodyguard',protectAlly:'Re Medusa',
     desc:'Se un nemico mira Re Medusa con un colpo singolo, la Medusa intercetta l’attacco al suo posto. Non intercetta gli attacchi ad area.'},
   moveNames:['Zip Zap','Oh Mio Sire','Gelatina Appiccicosa','Puntura Reale'],
   isSummonOnly:true
  }
];