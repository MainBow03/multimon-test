// Nuovi Multimon di One Piece: statistiche da roster normale (non boss).
import {MOVES_DB} from './moves.js';

export const STRAW_HAT_CHARACTERS=[
 {id:'luffy',name:'Monkey D. Luffy',types:['Lotta','Magico'],
  hp:108,maxHp:108,atk:112,def:88,spd:102,
  img:'https://i.pinimg.com/736x/21/61/91/2161915be009cacce21defa24cc74cfa.jpg',
  passive:{name:'Spirito del Capitano',type:'on_hp_threshold',threshold:0.5,maxUses:1,
   statBuff:{atk:1.15,spd:1.15},
   desc:'Alla prima discesa sotto il 50% dei PS ottiene +15% Attacco e +15% Velocità. Una volta per battaglia.'},
  moves:[MOVES_DB['Pistola Gom Gom'],MOVES_DB['Haki dell’Armatura'],MOVES_DB['Jet Gatling'],MOVES_DB['Red Hawk Supremo']]},
 {id:'zoro',name:'Roronoa Zoro',types:['Lotta','Terra'],
  hp:105,maxHp:105,atk:118,def:92,spd:85,
  img:'https://img1.pnghut.com/14/4/20/WJKKeyt7JB/one-piece-roronoa-zoro-anime-character-with-green-hair-and-a-scar.jpg',
  passive:{name:'Stile delle Tre Spade',type:'three_sword_style',
   desc:'Ignora il 10% della Difesa fisica del bersaglio e ha +10 punti percentuali di probabilità di critico.'},
  moves:[MOVES_DB['Oni Giri'],MOVES_DB['Tatsumaki delle Tre Spade'],MOVES_DB['Concentrazione da Spadaccino'],MOVES_DB['Asura']]},
 {id:'nami',name:'Nami',types:['Acqua','Aria'],
  hp:86,maxHp:86,atk:87,spAtk:112,def:74,spd:112,
  img:'https://i.pinimg.com/736x/ae/60/76/ae607673ca5a12fa09c795cb5abc5451.jpg',
  passive:{name:'Clima Tattico',type:'straw_hat_climate',
   desc:'Con Pioggia o Tempesta: +10% elusione e +15% danni delle mosse Acqua e Aria. Si somma al meteo senza moltiplicazioni esagerate.'},
  moves:[MOVES_DB['Raffica del Clima'],MOVES_DB['Miraggio Ladresco'],MOVES_DB['Tempesta di Zeus'],MOVES_DB['Pioggia del Clima-Tact']]},
 {id:'chopper',name:'Tony Tony Chopper',types:['Normale','Lotta'],
  hp:98,maxHp:98,atk:84,def:90,spd:80,
  img:'https://i.pinimg.com/1200x/d2/30/34/d2303406abaeb828122b55ddacc8a2a9.jpg',
  passive:{name:'Medico di Bordo',type:'on_enter',crewMedicHeal:0.12,maxUses:1,
   desc:'Una volta per battaglia, entrando in campo cura del 12% dei PS massimi l’alleato attivo più ferito (anche se stesso), e rimuove un suo status negativo.'},
  moves:[MOVES_DB['Colpo di Zoccolo'],MOVES_DB['Guard Point'],MOVES_DB['Cura d’Emergenza'],MOVES_DB['Monster Point']]}
];
