// Celebrazioni cosmetic-only. Gli effetti non cambiano le regole della lotta.
export const VICTORY_EFFECT_PRICE=100;
export const VICTORY_EFFECTS=Object.freeze([
  {id:"coronation",name:"Incoronazione Celestiale",icon:"👑",
   hint:"Una corona enorme scende tra raggi d’oro e stelle; il palco si trasforma in un trono.",tagline:"IL MULTIVERSO HA IL SUO SOVRANO!",color:"#fbbf24",accent:"#f59e0b"},
  {id:"comet",name:"Comete della Gloria",icon:"☄️",
   hint:"Sciami di comete attraversano il cielo e si accendono attorno al vincitore.",tagline:"UNA VITTORIA SCRITTA TRA LE STELLE!",color:"#67e8f9",accent:"#6366f1"},
  {id:"rainbow",name:"Esplosione Arcobaleno",icon:"🌈",
   hint:"Archi di colore si espandono a ritmo di coriandoli e scintille.",tagline:"TUTTI I COLORI DI UN CAMPIONE!",color:"#f9a8d4",accent:"#f97316"},
  {id:"curtain",name:"L’Ultimo Sipario",icon:"🎭",
   hint:"Sipari cremisi si aprono, riflettori dorati e una meritata standing ovation.",tagline:"SIGNORI, ECCO IL PROTAGONISTA!",color:"#fda4af",accent:"#b91c1c"},
  {id:"disco",name:"Disco Nebulosa",icon:"🪩",
   hint:"Una sfera da discoteca cosmica ruota tra laser fucsia e bagliori ciano.",tagline:"LA PISTA APPARTIENE AI VINCITORI!",color:"#e879f9",accent:"#06b6d4"},
  {id:"bloom",name:"Giardino dei Campioni",icon:"🌺",
   hint:"Un giardino di fiori luminosi sboccia mentre petali danzano nell’aria.",tagline:"LA VITTORIA È SBOCCIATA!",color:"#bef264",accent:"#22c55e"},
  {id:"pixel",name:"Game Over? Mai!",icon:"👾",
   hint:"Una cascata di pixel ricompone la parola VITTORIA con effetti arcade rétro.",tagline:"NUOVO RECORD SBLOCCATO!",color:"#a5f3fc",accent:"#8b5cf6"},
  {id:"ocean",name:"Perle degli Abissi",icon:"🫧",
   hint:"Bolle iridescenti e anelli di schiuma svelano una perla gigante.",tagline:"DAL MARE ARRIVA UNA LEGGENDA!",color:"#99f6e4",accent:"#0891b2"},
  {id:"diamonds",name:"Tempesta di Diamanti",icon:"💎",
   hint:"Cristalli prismatici ruotano e si frammentano in scintille azzurre.",tagline:"UN TRIONFO CHE NON SI SPEZZA!",color:"#bfdbfe",accent:"#6366f1"},
  {id:"fireworks",name:"Festival dei Dieci Cieli",icon:"🎆",
   hint:"Fuochi colorati si aprono in dieci costellazioni sopra l’arena.",tagline:"TUTTO IL CIELO FESTEGGIA QUESTA VITTORIA!",color:"#fde68a",accent:"#ec4899"},
  {id:"portal",name:"Varco del Trionfo",icon:"🌀",
   hint:"Un enorme portale ruota e squarcia il cielo: due anelli di energia si aprono sul vincitore.",tagline:"IL CAMPIONE È OLTRE OGNI DIMENSIONE!",color:"#c4b5fd",accent:"#7c3aed"},
  {id:"checkmate",name:"Scaccomatto Multiversale",icon:"♟️",
   hint:"Una scacchiera luminosa appare sotto il campione: il re avversario cade mentre un cavallo e una torre avanzano.",tagline:"UNA MOSSA. UNA VITTORIA. SCACCOMATTO!",color:"#e2e8f0",accent:"#0ea5e9"},
  {id:"chronofinale",name:"Il Tempo è Mio",icon:"⏳",
   hint:"Un orologio gigante gira all’impazzata, le lancette si fermano e un lampo dorato consacra il vincitore.",tagline:"IL MOMENTO DELLA GLORIA È ADESSO!",color:"#fde68a",accent:"#d97706"},
  {id:"astraldragon",name:"Drago delle Costellazioni",icon:"🐉",
   hint:"Nove stelle si accendono una dopo l’altra formando un drago di luce che avvolge l’arena.",tagline:"LE STELLE RICONOSCONO IL DRAGO!",color:"#86efac",accent:"#34d399"},
  {id:"thunderstorm",name:"Applauso del Tuono",icon:"⚡",
   hint:"L’arena piomba nella tempesta: sei fulmini illuminano il cielo a tempo, poi tutto si accende di elettricità.",tagline:"IL TUONO PRONUNCIA IL TUO NOME!",color:"#fef08a",accent:"#2563eb"},
  {id:"storybook",name:"Libro delle Leggende",icon:"📖",
   hint:"Un antico tomo si apre, le pagine si voltano da sole e il nome del vincitore entra nella leggenda.",tagline:"UN NUOVO CAPITOLO NELLA LEGGENDA!",color:"#fcd34d",accent:"#b45309"},
  {id:"meteorcrown",name:"Corona Meteoritica",icon:"☄️",
   hint:"Quattro meteore infuocate sfrecciano sopra l’arena; le scie si riuniscono in una corona astrale che scende sul vincitore.",tagline:"IL CIELO SI INCHINA AL CAMPIONE!",color:"#fdba74",accent:"#ea580c"},
  {id:"roseeclipse",name:"Eclissi di Rose",icon:"🌘",
   hint:"Il sole scompare dietro una luna nera, una corona di luce cremisi si accende e petali rosa cadono dal cielo.",tagline:"LA NOTTE FIORISCE PER IL VINCITORE!",color:"#f9a8d4",accent:"#be185d"},
  {id:"royalcards",name:"Trionfo Reale",icon:"🃏",
   hint:"Quattro carte giganti vengono distribuite e si aprono a ventaglio dietro al vincitore, fra scintille da prestigiatore.",tagline:"LA MANO VINCENTE È LA TUA!",color:"#fde68a",accent:"#7c3aed"},
  {id:"mechaforge",name:"Forgia del Campione",icon:"⚙️",
   hint:"Due ingranaggi mettono in moto una fucina futuristica; un martello d’energia colpisce l’incudine sprigionando scintille.",tagline:"LA VITTORIA È STATA FORGIATA!",color:"#93c5fd",accent:"#0f766e"},
]);
const known=new Set(VICTORY_EFFECTS.map(x=>x.id));
export function ownedVictoryEffects(profile){
 return [...new Set((Array.isArray(profile?.victoryEffects)?profile.victoryEffects:[])
   .filter(id=>known.has(id)))];
}
export function equippedVictoryEffect(profile){
 const id=profile?.equippedVictoryEffect;
 return known.has(id)&&ownedVictoryEffects(profile).includes(id)?id:null;
}
export function purchaseVictoryEffect(profile,id){
 const effect=VICTORY_EFFECTS.find(x=>x.id===id);
 if(!effect)return {ok:false,reason:'Animazione di vittoria sconosciuta.'};
 if(ownedVictoryEffects(profile).includes(id))return {ok:false,reason:'Hai già acquistato questa animazione!'};
 const coins=Number(profile?.coins)||0;
 if(coins<VICTORY_EFFECT_PRICE)return {ok:false,reason:'Non hai abbastanza monete!'};
 const equipped=equippedVictoryEffect(profile);
 return {ok:true,effect,profile:{...profile,coins:coins-VICTORY_EFFECT_PRICE,
  victoryEffects:[...ownedVictoryEffects(profile),id],
  equippedVictoryEffect:equipped||id}};
}
export function equipVictoryEffect(profile,id){
 if(id!==null&&!ownedVictoryEffects(profile).includes(id))return {ok:false,reason:'Devi prima acquistare questa animazione!'};
 return {ok:true,profile:{...profile,equippedVictoryEffect:id},effectId:id};
}

// Identifica il vincitore dal ruolo reale anziché dalla vista dello spettatore.
// Il vincitore non è necessariamente il giocatore che sta guardando.
export function victoryWinnerRole(room){
 const players=room?.players||{};
 if(room?.gameMode==='ultimon'){
  if(room.status==='ultimon_final')return room.ultimon?.champion||null;
  if(room.status==='ultimon_result'){
   const [a,b]=room.ultimon?.pair||[];
   const alive=role=>(room.teams?.[role]||[]).some(c=>c&&Number(c.hp)>0);
   return alive(a)&&!alive(b)?a:alive(b)&&!alive(a)?b:null;
  }
  return null;
 }
 if(room?.status!=='gameover'||!room.winner||room.winner==='Pareggio')return null;
 if(room.gameMode==='torneo'&&room.tournamentResults?.final?.winner)return room.tournamentResults.final.winner;
 const exact=Object.entries(players).find(([role,name])=>name===room.winner);
 if(exact)return exact[0];
 // Le lotte multiple possono indicare più vincitori come elenco di nomi.
 if(room.gameMode==='multipla'){
  const winners=Object.entries(players).filter(([,name])=>name&&room.winner.includes(name));
  if(winners.length===1)return winners[0][0];
 }
 return null;
}
export function victoryCelebrationForRoom(room,profile=null,appMode='local_room'){
 const role=victoryWinnerRole(room);
 if(!role)return null;
 const sharedId=room.playerVictoryEffects?.[role];
 const id=known.has(sharedId)?sharedId:
   (role==='p1'&&appMode!=='online_room'&&appMode!=='roguelike_coop_lobby'
     ?equippedVictoryEffect(profile):null);
 const effect=VICTORY_EFFECTS.find(x=>x.id===id);
 if(!effect)return null;
 const eventId=room.gameMode==='ultimon'
  ?room.status+':'+(room.ultimon?.runId||'run')+':'+(room.ultimon?.round||0)+':'+(room.ultimon?.pair||[]).join('-')
  :'gameover:'+(room.phaseStartedAt||room.createdAt||0)+':'+(room.winner||'');
 const winnerRoster=room.gameMode==='ultimon'
  ?room.ultimon?.rosters?.[role]:room.teams?.[role];
 const hero=(winnerRoster||[]).find(c=>c?.hp>0&&c?.img)||
   (winnerRoster||[]).find(c=>c?.img);
 return {role,effect,id:eventId+':'+effect.id,heroImage:hero?.img||'',
  winnerName:String(room.gameMode==='ultimon'
   ?room.ultimon?.identities?.[role]?.name||room.players?.[role]||'Campioni'
   :room.players?.[role]||'Campioni')};
}
