// Personaggi originali della quarta campagna: Il Teatro delle Catastrofi.
// Illustrazioni vettoriali locali per NPC/guardiani; il Regista usa un PNG dedicato.
const portrait=(background,face,accent,symbol)=>'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="360" height="420" viewBox="0 0 360 420">'+
  '<defs><radialGradient id="a"><stop stop-color="'+accent+'" stop-opacity=".5"/><stop offset="1" stop-color="'+background+'"/></radialGradient></defs>'+
  '<rect width="360" height="420" fill="url(#a)"/>'+
  '<path d="M0 0Q50 115 8 210L0 420M360 0Q310 115 352 210L360 420" fill="none" stroke="#a71e39" stroke-width="44"/>'+
  '<circle cx="180" cy="169" r="77" fill="'+face+'" stroke="#eecb85" stroke-width="5"/>'+
  '<path d="M130 150Q151 130 172 153M188 153Q212 130 233 150" stroke="#301f31" stroke-width="8" fill="none"/>'+
  '<circle cx="155" cy="166" r="7" fill="#1b1728"/><circle cx="210" cy="166" r="7" fill="#1b1728"/>'+
  '<path d="M150 200Q180 220 211 198" stroke="#5b2646" stroke-width="7" fill="none"/>'+
  '<path d="M130 245L82 420H280L231 245Z" fill="'+background+'" stroke="#eecb85" stroke-width="7"/>'+
  '<path d="M154 246L180 303L205 246L180 230Z" fill="'+accent+'"/>'+
  '<text x="180" y="375" font-size="78" text-anchor="middle" fill="#f7e1ae" font-family="Georgia,serif">'+symbol+'</text></svg>'
);
export const THEATER_MOVES={
 'Ciak!':{name:'Ciak!',type:'Psico',power:88,accuracy:1,statusEffect:{type:'Confuso',chance:.22,turns:3},desc:'Potenza 88; 22% di confondere il bersaglio per tre turni.'},
 'Montaggio Impossibile':{name:'Montaggio Impossibile',type:'Spettro',power:68,accuracy:1,targetCount:24,desc:'Potenza 68 su tutti gli avversari in campo.'},
 'Luci di Scena':{name:'Luci di Scena',type:'Psico',power:0,target:'self',statBuff:{def:1.25,spd:1.1},heal:.12,maxUses:2,strictUses:true,desc:'Recupera il 12% dei PS, Difesa +25% e Velocità +10%. Due usi.'},
 'Cala il Sipario':{name:'Cala il Sipario',type:'Buio',power:124,accuracy:.85,maxUses:3,strictUses:true,desc:'Colpo conclusivo da potenza 124, precisione 85% e tre usi.'},
 'Colpo di Scena':{name:'Colpo di Scena',type:'Lotta',power:85,accuracy:1,desc:'Il Caposcena colpisce con la leva del fondale. Potenza 85.'},
 'Ordine di Scena':{name:'Ordine di Scena',type:'Psico',power:0,targetStatDebuff:{atk:.85},maxUses:3,strictUses:true,desc:'Riduce Attacco del bersaglio del 15%. Tre usi.'},
 'Fermo Macchina':{name:'Fermo Macchina',type:'Robot',power:75,accuracy:1,statusEffect:{type:'Stordito',chance:.18,turns:1},desc:'Potenza 75, 18% di stordire.'},
 'Sipario di Ferro':{name:'Sipario di Ferro',type:'Robot',power:0,target:'self',statBuff:{def:1.3},maxUses:2,strictUses:true,desc:'Aumenta la propria Difesa del 30%. Due usi.'},
 'Aria della Prima Donna':{name:'Aria della Prima Donna',type:'Suono',power:92,accuracy:1,desc:'Aria di potenza 92.'},
 'Bis!':{name:'Bis!',type:'Suono',power:37,accuracy:1,multiHit:{min:2,max:3},desc:'Colpisce due o tre volte con potenza 37 per colpo.'},
 'Nota Assordante':{name:'Nota Assordante',type:'Suono',power:65,targetCount:24,statusEffect:{type:'Confuso',chance:.12,turns:2},desc:'Danni a tutti gli avversari; 12% di confondere.'},
 'Cambio Costume':{name:'Cambio Costume',type:'Magico',power:0,target:'self',heal:.17,statBuff:{spd:1.2},maxUses:2,strictUses:true,desc:'Cura il 17% dei PS e aumenta Velocità del 20%. Due usi.'},
 'Fascio Accecante':{name:'Fascio Accecante',type:'Luce',power:58,accuracy:1,statusEffect:{type:'Accecato',chance:.18,turns:2},desc:'Potenza 58, 18% di accecare.'},
 'Lampadina Rovente':{name:'Lampadina Rovente',type:'Fuoco',power:65,accuracy:1,statusEffect:{type:'Scottato',chance:.16,turns:3},desc:'Potenza 65, 16% di scottare.'},
 'Specchio Lucido':{name:'Specchio Lucido',type:'Robot',power:0,target:'self',statBuff:{def:1.2},maxUses:2,strictUses:true,desc:'Difesa +20%, due usi.'},
 'Pagina Bianca':{name:'Pagina Bianca',type:'Luce',power:86,accuracy:1,desc:'Un futuro non ancora scritto. Potenza 86.'},
 'Primo Passo':{name:'Primo Passo',type:'Normale',power:78,priority:1,accuracy:1,desc:'Potenza 78 e priorità +1.'},
 'Parole Nuove':{name:'Parole Nuove',type:'Suono',power:0,target:'self',statBuff:{atk:1.2,spd:1.15},maxUses:2,strictUses:true,desc:'Attacco +20% e Velocità +15%. Due usi.'},
 'Luce Naturale':{name:'Luce Naturale',type:'Luce',power:0,target:'self',heal:.3,maxUses:2,strictUses:true,desc:'Cura il 30% dei PS massimi. Due usi.'}
};
export const THEATER_CHARACTERS=[
 {id:'regista',name:'Severin Vell · Il Regista',types:['Psico','Spettro'],
  hp:205,maxHp:205,atk:135,def:109,spd:104,
  // Ritratto originale auto-contenuto: nessun link esterno che possa sparire.
  img:portrait('#271626','#ded0bf','#ba5a75','✦'),isSecretUnlock:true,
  passive:{name:'Sipario Aperto',type:'on_enter',maxUses:1,enemyStatDebuff:{spd:.9},
   desc:'Quando entra in campo rallenta del 10% la Velocità degli avversari.'},
  moves:['Ciak!','Montaggio Impossibile','Luci di Scena','Cala il Sipario'].map(n=>THEATER_MOVES[n])},
 {id:'caposcena',name:'Il Caposcena',types:['Robot','Buio'],
  hp:120,maxHp:120,atk:108,def:112,spd:88,
  img:portrait('#18162c','#cbb9a9','#b84d4a','✦'),isSecretUnlock:true,
  moves:['Colpo di Scena','Ordine di Scena','Fermo Macchina','Sipario di Ferro'].map(n=>THEATER_MOVES[n])},
 {id:'primadonna',name:'La Prima Donna',types:['Suono','Magico'],
  hp:119,maxHp:119,atk:121,def:88,spd:115,
  img:portrait('#451641','#e9c5bb','#b661c6','♫'),isSecretUnlock:true,
  moves:['Aria della Prima Donna','Bis!','Nota Assordante','Cambio Costume'].map(n=>THEATER_MOVES[n])},
 {id:'riflettore',name:'Riflettore Vivente',types:['Robot','Luce'],
  hp:78,maxHp:78,atk:78,def:120,spd:55,
  img:portrait('#3c2830','#e8cb8d','#eeb95a','☀'),isSecretUnlock:true,
  moves:['Fascio Accecante','Lampadina Rovente','Specchio Lucido'].map(n=>THEATER_MOVES[n])},
 {id:'nina_teatro',name:'Nina del Teatro Zero',types:['Luce','Suono'],
  hp:106,maxHp:106,atk:99,def:89,spd:111,
  img:portrait('#16313e','#e0d2c4','#74cfca','✧'),isSecretUnlock:true,
  moves:['Pagina Bianca','Primo Passo','Parole Nuove','Luce Naturale'].map(n=>THEATER_MOVES[n])}
];