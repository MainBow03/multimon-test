// Nuovi personaggi · Flins, Ganyu e Coraline.
// Usano la MOVES_DB universale per ogni formato, incluse campagne e PvP.
export const NEW_TRIO_MOVES={
 'Lancia del Faro':{
  name:'Lancia del Faro',type:'Elettro',power:88,accuracy:1,
  statusEffect:{type:'Elettrizzato',chance:0.22,turns:2},
  desc:'La lancia di Flins scatena un lampo azzurro. Potenza 88, 22% di elettrizzare.'
 },
 'Raggio della Lanterna':{
  name:'Raggio della Lanterna',type:'Luce',power:82,special:true,accuracy:1,
  ignoreDefBuffs:true,
  desc:'Luce concentrata dalla lanterna: potenza 82, ignora i bonus di Difesa del bersaglio.'
 },
 'Guardia del Crepuscolo':{
  name:'Guardia del Crepuscolo',type:'Luce',power:0,target:'self',
  statBuff:{def:1.2,spd:1.2},maxUses:2,strictUses:true,
  desc:'Flins assume la guardia del faro: Difesa e Velocità +20%. Due utilizzi.'
 },
 'Sinfonia del Fulmine Lunare':{
  name:'Sinfonia del Fulmine Lunare',type:'Elettro',power:100,special:true,
  targetCount:2,maxUses:3,strictUses:true,
  desc:'Due fulmini danzano sotto la luna. Potenza 100 contro fino a due nemici, 3 utilizzi.'
 },
 'Freccia del Qilin':{
  name:'Freccia del Qilin',type:'Ghiaccio',power:88,special:true,accuracy:1,
  desc:'Una freccia criogenica precisa: carica Rugiada Qilin quando colpisce.'
 },
 'Fiore di Ghiaccio':{
  name:'Fiore di Ghiaccio',type:'Ghiaccio',power:76,special:true,
  statusEffect:{type:'Congelato',chance:0.12,turns:1},
  desc:'Un fiore di cristallo sboccia sul bersaglio. Potenza 76, 12% di congelare.'
 },
 'Pioggia Celestiale Qilin':{
  name:'Pioggia Celestiale Qilin',type:'Ghiaccio',power:75,special:true,
  targetCount:4,maxUses:3,strictUses:true,
  desc:'Pioggia di frecce glaciali su fino a 4 nemici. Potenza 75, 3 utilizzi. Sfrutta Rugiada Qilin.'
 },
 'Passo della Rugiada':{
  name:'Passo della Rugiada',type:'Magico',power:0,target:'self',
  statBuff:{spd:1.25},heal:0.18,maxUses:2,strictUses:true,
  desc:'Ganyu si cura del 18% dei PS massimi e aumenta la Velocità del 25%. Due utilizzi.'
 },
 'Chiave dei Mondi':{
  name:'Chiave dei Mondi',type:'Psico',power:84,special:true,
  statusEffect:{type:'Confuso',chance:0.20,turns:2},
  desc:'Coraline apre una minuscola porta nella mente avversaria: potenza 84 e 20% di confondere.'
 },
 'Balzo del Gatto Nero':{
  name:'Balzo del Gatto Nero',type:'Spettro',power:85,priority:1,
  desc:'Il Gatto Nero appare dall’ombra e sorprende il nemico. Potenza 85, priorità +1.'
 },
 'Occhi di Bottone':{
  name:'Occhi di Bottone',type:'Psico',power:73,special:true,
  statusEffect:{type:'Accecato',chance:0.30,turns:2},
  desc:'Uno sguardo inquietante provoca un’illusione: potenza 73, 30% di accecare.'
 },
 'Porticina Segreta':{
  name:'Porticina Segreta',type:'Spettro',power:0,target:'self',
  isProtect:true,priority:5,maxUses:3,strictUses:true,
  desc:'Coraline scompare oltre la porta e si protegge dagli attacchi per il turno. 3 utilizzi.'
 }
};

export const NEW_TRIO_CHARACTERS=[
 {id:'flins',name:'Flins',types:['Elettro','Luce'],
  hp:105,maxHp:105,atk:108,spAtk:113,def:92,spDef:95,spd:102,
  img:'https://i.pinimg.com/736x/75/d2/15/75d215c39a08b6ed5dbb7e67e3f25922.jpg',
  passive:{name:'Lanterna del Guardiano',type:'global_damage_boost',multiplier:1.10,
   desc:'Il bagliore della lanterna aumenta del 10% la potenza di tutte le mosse offensive di Flins.'},
  moveNames:['Lancia del Faro','Raggio della Lanterna','Guardia del Crepuscolo','Sinfonia del Fulmine Lunare']
 },
 {id:'ganyu',name:'Ganyu',types:['Ghiaccio','Magico'],
  hp:100,maxHp:100,atk:82,spAtk:121,def:83,spDef:101,spd:97,
  img:'https://i.pinimg.com/736x/a6/d9/df/a6d9df07e69725cb0e85bce44ef71b66.jpg',
  passive:{name:'Rugiada Qilin',type:'qilin_dew',
   desc:'Ogni mossa offensiva Ghiaccio che colpisce accumula 1 Sigillo Qilin (max 2, uno per mossa). Con 2 sigilli, il prossimo attacco Ghiaccio infligge il 35% di danni in più e cura Ganyu del 10% dei PS massimi, poi azzera le cariche.'},
  moveNames:['Freccia del Qilin','Fiore di Ghiaccio','Pioggia Celestiale Qilin','Passo della Rugiada']
 },
 {id:'coraline',name:'Coraline',types:['Psico','Spettro'],
  hp:100,maxHp:100,atk:98,spAtk:109,def:92,spDef:93,spd:106,
  img:'https://i.pinimg.com/736x/75/9a/ae/759aae6689ebd83cc6c70c2fbc9edf54.jpg',
  passive:{name:'Non ho paura dei bottoni',type:'first_hit_immunity',
   desc:'Il primo attacco diretto subito in ogni battaglia infligge il 70% di danni in meno; Coraline ne blocca anche gli effetti negativi.'},
  moveNames:['Chiave dei Mondi','Balzo del Gatto Nero','Occhi di Bottone','Porticina Segreta']
 }
];
