// Nuovi Multimon, collegati alla stessa MOVES_DB di tutte le modalità.
// Frillish usa il PNG ufficiale ospitato dal progetto pubblico PokéAPI Sprites.
export const BERRY_FRILLISH_CHARACTERS=[
  {
    id:'berry',name:'Berry',types:['Ghiaccio'],
    hp:99,maxHp:99,atk:78,spAtk:112,def:83,spDef:94,spd:96,
    img:'https://i.pinimg.com/736x/cb/4c/50/cb4c503067d9af5f642e8f60e0e5e4e1.jpg',
    passive:{name:'Dolce Freddo',type:'berry_sweet_chill',chance:0.25,
      desc:'Quando Berry colpisce un nemico con una mossa offensiva, ha il 25% di probabilità di ridurgli la Velocità del 15%. Non si attiva sulle cure.'},
    moveNames:['Gelato Glaciale','Grandinata di Coni','Coppa Rigenerante','Scivolata Gelata']
  },
  {
    id:'frillish',name:'Frillish',types:['Acqua','Spettro'],
    hp:104,maxHp:104,atk:78,spAtk:111,def:89,spDef:111,spd:78,
    img:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/592.png',
    passive:{name:'Corpo Funesto',type:'cursed_body',chance:0.20,disableTurns:3,
      desc:'Quando un nemico colpisce Frillish con una mossa, 20% di probabilità di disabilitare proprio quella mossa dell’attaccante per 3 turni. Le mosse disabilitate non possono essere selezionate o eseguite.'},
    moveNames:['Idrovampata','Energipalla (Frillish)','Zampillo (Frillish)','Palla Ombra (Frillish)']
  }
];
