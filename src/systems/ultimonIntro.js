import {ultimonPlayers,ultimonAlive,allUltimonNamed} from './ultimonSystem.js';
import {ultimonEntranceLine} from './ultimonEntranceLines.js';
import {ultimonDuplicateReaction} from './ultimonDuplicateLines.js';

// Una presentazione condivisa tra tutti i client Firestore. La sorte dei
// quattro ambasciatori viene decisa una volta dall'host e salvata nella stanza.
export const ULTIMON_INTRO_STEPS=Object.freeze([
 'call','speech','entrance_select','entrance','line','exit','complete'
]);
export const ULTIMON_ENTRANCE_EFFECTS=Object.freeze([
 {id:'starfall',name:'Pioggia di Stelle',icon:'🌟',
  hint:'Una costellazione illumina l’arena e la squadra arriva dal cielo.',
  tagline:'LE STELLE HANNO SCELTO IL LORO CAMPIONE!',
  announcer:'Attenzione al cielo! Una pioggia di stelle annuncia l’arrivo di questa squadra!',
  color:'#fde68a',accent:'#f59e0b'},
 {id:'thunder',name:'Tuono del Destino',icon:'⚡',
  hint:'Fulmini, scariche elettriche e un ingresso che scuote il palco.',
  tagline:'IL TUONO HA UN NOME... E FA PAURA!',
  announcer:'Un boato attraversa gli spalti! Il tuono annuncia questi contendenti!',
  color:'#c4b5fd',accent:'#a78bfa'},
 {id:'portal',name:'Portale Multiversale',icon:'🌀',
  hint:'Un enorme varco si apre e i Multimon emergono da un’altra dimensione.',
  tagline:'DA UN ALTRO UNIVERSO... DIRETTAMENTE QUI!',
  announcer:'Si è aperto un varco! Sono arrivati da oltre i confini del multiverso!',
  color:'#67e8f9',accent:'#06b6d4'},
 {id:'inferno',name:'Fiamme del Campione',icon:'🔥',
  hint:'Un’esplosione di fiamme e scintille accoglie i nuovi sfidanti.',
  tagline:'L’ARENA STA PER INCENDIARSI!',
  announcer:'Sentite il calore? Il fuoco si alza per accompagnare la loro entrata!',
  color:'#fdba74',accent:'#f97316'},
 {id:'royal',name:'Tappeto delle Leggende',icon:'👑',
  hint:'Tappeto rosso, riflettori dorati e ingresso da autentica celebrità.',
  tagline:'FATE LARGO ALLE LEGGENDE!',
  announcer:'In piedi, pubblico! Riflettori puntati sui nuovi protagonisti!',
  color:'#fef08a',accent:'#ec4899'},
 {id:'glitch',name:'Glitch del Multiverso',icon:'👾',
  hint:'Lo schermo impazzisce: pixel, colori spezzati e teletrasporto digitale.',
  tagline:'ERRORE 404: AVVERSARI NON PREPARATI!',
  announcer:'Un disturbo nel segnale?! No... è il loro ingresso digitale!',
  color:'#a5f3fc',accent:'#8b5cf6'}
]);
export const ULTIMON_MONOLOGUE_STYLES=Object.freeze([
 {id:'eroico',name:'Eroico',icon:'🛡️'},
 {id:'spavaldo',name:'Spavaldo',icon:'🔥'},
 {id:'misterioso',name:'Misterioso',icon:'🌙'},
 {id:'divertente',name:'Divertente',icon:'🎭'}
]);
const shuffle=(a,rng)=>{
 const items=[...a];
 for(let i=items.length-1;i>0;i--){
  const x=Math.max(0,Math.min(.999999999,Number(rng())||0));
  const j=Math.floor(x*(i+1));
  [items[i],items[j]]=[items[j],items[i]];
 }
 return items;
};

export function ultimonSuggestedMonologue(team,style='eroico'){
 const name=String(team||'La nostra squadra').trim().slice(0,35);
 const texts={
  eroico:"Siamo "+name+". Nessuno sa cosa ci aspetta, ma so una cosa: resteremo uniti fino all'ultimo Multimon. Che vinca il coraggio!",
  spavaldo:"Avete visto chi è entrato? Siamo "+name+"! Guardate bene i nostri volti, perché saranno gli ultimi che vedrete sul tabellone!",
  misterioso:"Questa arena nasconde mille possibilità. Noi siamo "+name+". Non cercate di capire la nostra prossima mossa: sarà già troppo tardi.",
  divertente:"Abbiamo studiato strategie, preparato discorsi e quasi dimenticato i Multimon! Siamo "+name+", e promettiamo una cosa: non saremo noiosi!"
 };
 return texts[style]||texts.eroico;
}

export function botUltimonMonologue(room,role){
 const team=room.ultimon?.identities?.[role]?.name||room.players?.[role]||role;
 const styles=['spavaldo','misterioso','eroico','divertente'];
 const index=Math.max(0,ultimonPlayers(room).indexOf(role));
 return ultimonSuggestedMonologue(team,styles[index%styles.length]);
}

export function currentUltimonIntroRole(room){
 const intro=room.ultimon?.intro;
 return intro?.order?.[intro.index]||null;
}

// Solo le copie che hanno già PRESO LA PAROLA in un'altra squadra
// attivano la reazione. Un doppione rimasto in riserva non conta, e
// due copie nella medesima squadra non sono un incontro tra avversari.
export function ultimonPreviousSpeaker(room,role,characterId){
 const intro=room.ultimon?.intro;
 const position=intro?.order?.indexOf(role)??-1;
 if(position<=0||!characterId)return null;
 for(let i=position-1;i>=0;i--){
  const previousRole=intro.order[i];
  if(previousRole===role)continue;
  const indices=intro.casts?.[previousRole]||[];
  for(let j=indices.length-1;j>=0;j--){
   const fighter=room.ultimon?.rosters?.[previousRole]?.[indices[j]];
   if(fighter?.id!==characterId)continue;
   return {role:previousRole,fighter,
     team:room.ultimon?.identities?.[previousRole]?.name||
       room.players?.[previousRole]||previousRole,
     owner:room.players?.[previousRole]||previousRole,
     color:room.ultimon?.identities?.[previousRole]?.color||'#94a3b8'};
  }
 }
 return null;
}

export function ultimonIntroCast(room,role=currentUltimonIntroRole(room)){
 const ids=room.ultimon?.intro?.casts?.[role]||[];
 return ids.map(index=>{
  const fighter=room.ultimon?.rosters?.[role]?.[index];
  if(!fighter)return null;
  const originalLine=ultimonEntranceLine(fighter);
  const previous=ultimonPreviousSpeaker(room,role,fighter.id);
  const response=previous?ultimonDuplicateReaction(fighter,previous.fighter):null;
  return {index,id:fighter.id,name:fighter.name,img:fighter.img,
   // Conserva la battuta originale; l'incontro speciale è un contenuto
   // aggiuntivo usato solo dal renderer della presentazione.
   line:originalLine,
   duplicate:response?{
     line:response.line,comparison:response.comparison,
     rival:{role:previous.role,name:previous.fighter.name,
       img:previous.fighter.img,team:previous.team,owner:previous.owner,
       color:previous.color}
   }:null
  };
 }).filter(Boolean);
}

// Le CPU ricevono un effetto deterministico dall’ordine condiviso,
// i giocatori umani lo confermano prima di avviare il filmato.
export function ultimonIntroEntrance(room,role=currentUltimonIntroRole(room)){
 const intro=room.ultimon?.intro;
 if(!intro||!role)return null;
 const stored=intro.entrances?.[role];
 if(ULTIMON_ENTRANCE_EFFECTS.some(effect=>effect.id===stored))return stored;
 if(room.isBot?.[role]){
  const idx=Math.max(0,intro.order?.indexOf(role)||0);
  return ULTIMON_ENTRANCE_EFFECTS[idx%ULTIMON_ENTRANCE_EFFECTS.length].id;
 }
 return null;
}
export function ultimonIntroEntrancePatch(room,role,effectId){
 if(room.gameMode!=='ultimon'||room.status!=='ultimon_intro'||
   room.ultimon?.intro?.step!=='entrance_select'||
   currentUltimonIntroRole(room)!==role||
   !ultimonPlayers(room).includes(role)||room.isBot?.[role])
  throw new Error('Non puoi scegliere un ingresso adesso.');
 if(!ultimonIntroSpeech(room,role))
  throw new Error('Pronuncia prima il monologo.');
 if(room.ultimon?.intro?.entrances?.[role])
  throw new Error('L’ingresso è già stato confermato.');
 if(typeof effectId!=='string'||
   !ULTIMON_ENTRANCE_EFFECTS.some(effect=>effect.id===effectId))
  throw new Error('Seleziona uno dei sei ingressi ad effetto disponibili.');
 return {['ultimon.intro.entrances.'+role]:effectId};
}
export function ultimonIntroSpeech(room,role=currentUltimonIntroRole(room)){
 return room.ultimon?.intro?.monologues?.[role] ||
    (room.isBot?.[role]?botUltimonMonologue(room,role):'');
}
export function beginUltimonIntroduction(room,random=Math.random){
 if(room.gameMode!=='ultimon'||room.status!=='ultimon_showcase'||
  !allUltimonNamed(room))
  throw new Error('Prima tutte le squadre devono scegliere nome e colore.');
 const order=shuffle(ultimonPlayers(room),random);
 if(order.length<4||order.length>8)throw new Error('Partecipanti Ultimon non validi.');
 const casts={};
 for(const role of order){
  const roster=room.ultimon.rosters?.[role]||[];
  const eligible=roster.map((c,i)=>({c,i}))
    .filter(({c})=>c?.hp>0&&!c.isSummonOnly).map(({i})=>i);
  casts[role]=shuffle(eligible,random).slice(0,4);
 }
 return {status:'ultimon_intro',phaseStartedAt:Date.now(),
  'ultimon.intro':{
    order,index:0,step:'call',lineIndex:0,casts,monologues:{},entrances:{}
  }};
}
export function ultimonIntroMonologuePatch(room,role,raw){
 if(room.gameMode!=='ultimon'||room.status!=='ultimon_intro'||
    room.ultimon?.intro?.step!=='speech'||currentUltimonIntroRole(room)!==role||
    !ultimonPlayers(room).includes(role)||room.isBot?.[role])
  throw new Error('Non puoi parlare adesso. Aspetta che il presentatore chiami la tua squadra.');
 if(room.ultimon?.intro?.monologues?.[role])
  throw new Error('Il monologo è già stato confermato.');
 if(typeof raw!=='string')throw new Error('Il monologo deve essere un testo.');
 const line=raw.replace(/[\u0000-\u001f\u007f]+/g,' ').replace(/\s+/g,' ').trim();
 if(line.length<12||line.length>260)
  throw new Error('Il monologo deve contenere da 12 a 260 caratteri.');
 return {['ultimon.intro.monologues.'+role]:line};
}
export function advanceUltimonIntroduction(room){
 if(room.gameMode!=='ultimon'||room.status!=='ultimon_intro')
  throw new Error('La presentazione non è attiva.');
 const intro=room.ultimon?.intro;
 if(!intro||!ULTIMON_INTRO_STEPS.includes(intro.step))
  throw new Error('Presentazione non valida.');
 const current=currentUltimonIntroRole(room);
 if(intro.step==='call')
  return {'ultimon.intro.step':'speech',phaseStartedAt:Date.now()};
 if(intro.step==='speech'){
  if(!ultimonIntroSpeech(room,current))
   throw new Error('Il giocatore deve prima scegliere il suo monologo.');
  return {'ultimon.intro.step':'entrance_select',phaseStartedAt:Date.now()};
 }
 if(intro.step==='entrance_select'){
  if(!ultimonIntroEntrance(room,current))
   throw new Error('Il capitano deve prima scegliere il proprio ingresso ad effetto.');
  return {'ultimon.intro.step':'entrance',phaseStartedAt:Date.now()};
 }
 if(intro.step==='entrance')
  return {'ultimon.intro.step':'line','ultimon.intro.lineIndex':0,
    phaseStartedAt:Date.now()};
 if(intro.step==='line'){
  const count=ultimonIntroCast(room,current).length;
  if(intro.lineIndex+1<count)
   return {'ultimon.intro.lineIndex':intro.lineIndex+1,phaseStartedAt:Date.now()};
  return {'ultimon.intro.step':'exit',phaseStartedAt:Date.now()};
 }
 if(intro.step==='exit'){
  if(intro.index+1<intro.order.length)
   return {'ultimon.intro.index':intro.index+1,'ultimon.intro.step':'call',
     'ultimon.intro.lineIndex':0,phaseStartedAt:Date.now()};
  return {'ultimon.intro.step':'complete',phaseStartedAt:Date.now()};
 }
 throw new Error('La presentazione è già conclusa. Si può iniziare il torneo.');
}
export function ultimonIntroductionReady(room){
 const intro=room.ultimon?.intro;
 return room.gameMode==='ultimon'&&room.status==='ultimon_intro' &&
  intro?.step==='complete'&&Array.isArray(intro.order) &&
  intro.order.length===ultimonPlayers(room).length &&
  intro.order.every(role=>!!ultimonIntroSpeech(room,role))&&
  // Vecchie presentazioni create prima di questo aggiornamento restano
  // completabili anche se non avevano ancora le entrate personalizzate.
  (!intro.entrances||intro.order.every(role=>!!ultimonIntroEntrance(room,role)));
}
