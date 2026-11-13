// Movimenti aggiunti dalla Forma Iper. Il menu anticipa esattamente quelli
// applicati dal pre-pass del motore prima di calcolare l'iniziativa.
export const HYPER_BONUS_MOVES = Object.freeze({
  gardevoir:['Liane Oscillanti'],
  astral:['Assorbimento Tenebroso'],
  polterpup:['Riporta'],
  ariana:['Dangerous Woman'],
  jake:['Morsa del Demone'],
  finn:['Lama Vulcanica',"Fulmine dell'Eroe"],
  juvia:['Abisso Disperato'],
  corvina:['Luce di Azarath'],
  entoma:['Fame Insaziabile'],
  darwin:['Idropompa','Dittatura del Sorriso'],
  brago:['Caos Totale'],
  sdentato:['Fulmine'],
  rainbowdash:['Morso del Pony'],
  elsa:['Gelo Definitivo'],
  sheldon:['Meteora Devastante'],
  charizard:['Valanga'],
  maxcaulfield:['Tempesta di Farfalle'],
  chloeprice:['Caos Assoluto'],
  dolli:['Incubo di Pezza'],
  poisonivy:['Polline scottante'],
  carlos:['Pugno infuocato del survivor'],
  sage:['questo è il mio vero potenziale'],
  coraline:['Porta dell’Impossibile'],
  luigi:['Aspirazione Fantasma'],
  miku:['Concerto Universale']
});

export function hyperPreviewMoves(character,pendingHyper,movesDb){
  const regular=character?.moves||[];
  if(!character || character.isHyper || !pendingHyper)return regular;
  const additions=HYPER_BONUS_MOVES[character.id]||[];
  const existing=new Set(regular.map(m=>m.name));
  return [...regular,...additions.filter(name=>!existing.has(name)&&movesDb[name])
    .map(name=>({...movesDb[name],remainingUses:movesDb[name].maxUses??null,hyperPreview:true}))];
}

export function canChooseHyperMove(character,index,pendingHyper,movesDb){
  return Number.isInteger(index)&&index>=0&&index<hyperPreviewMoves(character,pendingHyper,movesDb).length;
}
