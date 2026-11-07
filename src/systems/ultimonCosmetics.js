// Catalogo condiviso fra il negozio e la cerimonia Ultimon.
// I cosmetici sono permanenti e non danno alcun vantaggio in combattimento.
export const ULTIMON_ENTRANCE_PRICE=100;
export const ULTIMON_BASIC_ENTRANCE=Object.freeze({id:'basic',name:'Ingresso Classico',icon:'🎤',
 hint:'Tutti i Multimon arrivano sul palco senza effetti speciali.',
 tagline:'E ORA... LA SQUADRA È AL COMPLETO!',
 announcer:'Un applauso per i nostri nuovi sfidanti!',color:'#e2e8f0',accent:'#64748b'});
export const ULTIMON_ENTRANCE_EFFECTS=Object.freeze([
 {id:"starfall",name:"Pioggia di Stelle",icon:"🌟",
  hint:"Una costellazione illumina l’arena e la squadra arriva dal cielo.",tagline:"LE STELLE HANNO SCELTO I LORO CAMPIONI!",announcer:"Attenzione al cielo! Una pioggia di stelle annuncia questa squadra!",
  color:"#fde68a",accent:"#f59e0b"},
 {id:"thunder",name:"Tuono del Destino",icon:"⚡",
  hint:"Un fulmine gigantesco squarcia il cielo: tuoni e scosse ritmiche.",tagline:"IL TUONO HA UN NOME... E FA PAURA!",announcer:"Un boato attraversa gli spalti: il tuono annuncia questi contendenti!",
  color:"#c4b5fd",accent:"#a78bfa"},
 {id:"portal",name:"Portale Multiversale",icon:"🌀",
  hint:"Un enorme varco si apre e i Multimon emergono da un’altra dimensione.",tagline:"DA UN ALTRO UNIVERSO... DIRETTAMENTE QUI!",announcer:"Si è aperto un varco! Sono arrivati da oltre i confini del multiverso!",
  color:"#67e8f9",accent:"#06b6d4"},
 {id:"inferno",name:"Fiamme del Campione",icon:"🔥",
  hint:"Un’esplosione di fiamme e scintille incendia l’aria intorno alla squadra.",tagline:"L’ARENA STA PER INCENDIARSI!",announcer:"Sentite il calore? Il fuoco accompagna la loro entrata!",
  color:"#fdba74",accent:"#f97316"},
 {id:"royal",name:"Tappeto delle Leggende",icon:"👑",
  hint:"Tappeto rosso, riflettori dorati e un ingresso da autentica celebrità.",tagline:"FATE LARGO ALLE LEGGENDE!",announcer:"In piedi, pubblico! Riflettori puntati sui nuovi protagonisti!",
  color:"#fef08a",accent:"#ec4899"},
 {id:"glitch",name:"Glitch del Multiverso",icon:"👾",
  hint:"La realtà si spezza in pixel, interferenze e teletrasporti digitali.",tagline:"ERRORE 404: AVVERSARI NON PREPARATI!",announcer:"Un disturbo nel segnale?! No... è il loro ingresso digitale!",
  color:"#a5f3fc",accent:"#8b5cf6"},
 {id:"eclipse",name:"Eclissi delle Ombre",icon:"🌘",
  hint:"Un disco lunare copre il sole: le stelle spuntano nel crepuscolo viola.",tagline:"QUANDO CALA LA LUCE, NASCONO LE LEGGENDE!",announcer:"Le luci si spengono, la luna divora il sole... chi osa entrare nell’ombra?",
  color:"#ddd6fe",accent:"#6d28d9"},
 {id:"abyss",name:"Marea degli Abissi",icon:"🐚",
  hint:"Onde di luce turchese e bolle marine portano la squadra in superficie.",tagline:"DAL PROFONDO, FINO ALLA GLORIA!",announcer:"Il fondale si muove! Un’ondata leggendaria porta nuovi sfidanti!",
  color:"#99f6e4",accent:"#0891b2"},
 {id:"jungle",name:"Trono della Natura",icon:"🌿",
  hint:"Liane e petali aprono un passaggio in una giungla magica e luminosa.",tagline:"LA NATURA NON SI FERMA!",announcer:"Le radici si aprono, i fiori esplodono in colori: arrivano i sovrani della foresta!",
  color:"#bef264",accent:"#16a34a"},
 {id:"neon",name:"Neon Overdrive",icon:"🎧",
  hint:"Una pista futuristica di linee laser segue il ritmo di un concerto.",tagline:"IL FUTURO HA SCELTO LA SUA SQUADRA!",announcer:"Le casse esplodono, il pavimento si illumina: benvenuti nel futuro!",
  color:"#f0abfc",accent:"#d946ef"},
 {id:"blizzard",name:"Aurora di Cristallo",icon:"❄️",
  hint:"Cristalli di ghiaccio e una gigantesca aurora danzano sopra l’arena.",tagline:"FREDDI COME IL GHIACCIO, GRANDI COME IL CIELO!",announcer:"La temperatura scende e l’aurora si accende! Sono arrivati!",
  color:"#bae6fd",accent:"#38bdf8"},
 {id:"origami",name:"Danza dei Mille Origami",icon:"🦋",
  hint:"Farfalle di carta e fogli colorati si piegano e volteggiano nell’aria.",tagline:"UNA SQUADRA FUORI DALLE PIEGHE DEL DESTINO!",announcer:"Le pagine prendono vita! Ogni piega racconta un nuovo campione!",
  color:"#fecdd3",accent:"#fb7185"},
 {id:"nebula",name:"Trono della Galassia",icon:"🌌",
  hint:"Nebulose spiraliformi e pianeti luminosi aprono una porta cosmica.",tagline:"L’UNIVERSO INTERO FA IL TIFO!",announcer:"Dal centro della galassia, fra stelle e pianeti, arrivano gli sfidanti cosmici!",
  color:"#c4b5fd",accent:"#6366f1"},
 {id:"clockwork",name:"Ora Zero",icon:"⏳",
  hint:"Ingranaggi dorati rallentano il tempo prima di un rintocco titanico.",tagline:"IL TEMPO SI FERMA. LORO NO!",announcer:"Le lancette si fermano... il destino ha appuntamento con questa squadra!",
  color:"#fde68a",accent:"#b45309"},
 {id:"candy",name:"Carnevale Zuccherato",icon:"🍭",
  hint:"Nuvole di zucchero, coriandoli e caramelle colorano ogni angolo.",tagline:"DOLCI ALL’INGRESSO, TERRIBILI IN BATTAGLIA!",announcer:"Coriandoli, caramelle e risate! L’arena diventa una festa!",
  color:"#fbcfe8",accent:"#f472b6"},
 {id:"meteor",name:"Impatto Meteora",icon:"☄️",
  hint:"Una meteora infuocata sfreccia sul palco creando un cratere di luce.",tagline:"IL CIELO È CADUTO. LA SQUADRA È ARRIVATA!",announcer:"Occhi al cielo! Una meteora apre la strada a nuovi contendenti!",
  color:"#fed7aa",accent:"#ea580c"},
]);
const validIds=new Set(ULTIMON_ENTRANCE_EFFECTS.map(e=>e.id));
export function ownedUltimonEntrances(profile){
 return [...new Set((Array.isArray(profile?.ultimonEntrances)?profile.ultimonEntrances:[])
  .filter(id=>validIds.has(id)))];
}
export function ownsUltimonEntrance(profile,id){
 return id===ULTIMON_BASIC_ENTRANCE.id || ownedUltimonEntrances(profile).includes(id);
}
export function purchaseUltimonEntrance(profile,id){
 const effect=ULTIMON_ENTRANCE_EFFECTS.find(entry=>entry.id===id);
 if(!effect)return {ok:false,reason:'Ingresso ad effetto inesistente.'};
 if(ownsUltimonEntrance(profile,id))return {ok:false,reason:'Questo ingresso è già tuo per sempre!'};
 const coins=Number(profile?.coins)||0;
 if(coins<ULTIMON_ENTRANCE_PRICE)return {ok:false,reason:'Non hai abbastanza monete!'};
 return {ok:true,profile:{...profile,coins:coins-ULTIMON_ENTRANCE_PRICE,
  ultimonEntrances:[...ownedUltimonEntrances(profile),id]},effect};
}
