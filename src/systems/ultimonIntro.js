import {ultimonPlayers,ultimonAlive,allUltimonNamed} from './ultimonSystem.js';
import {ultimonEntranceLine} from './ultimonEntranceLines.js';
import {ultimonDuplicateReaction} from './ultimonDuplicateLines.js';
import {ULTIMON_ENTRANCE_EFFECTS,ULTIMON_BASIC_ENTRANCE,ownsUltimonEntrance} from './ultimonCosmetics.js';

// Una presentazione condivisa tra tutti i client Firestore. La sorte dei
// quattro ambasciatori viene decisa una volta dall'host e salvata nella stanza.
// Ogni scena pronta rimane leggibile per 20 secondi. L'attesa del capitano
// non ha timeout: il timer parte solo dopo il suo invio.
export const ULTIMON_INTRO_AUTO_ADVANCE_MS=20000;
export const ultimonIntroSceneReady=room=>{
 const intro=room?.ultimon?.intro,role=currentUltimonIntroRole(room);
 if(!intro||intro.step==='complete')return false;
 if(intro.step==='speech')return !!ultimonIntroSpeech(room,role);
 if(intro.step==='entrance_select')return !!ultimonIntroEntrance(room,role);
 return ULTIMON_INTRO_STEPS.includes(intro.step);
};
export const ultimonIntroSceneDeadline=room=>
 ultimonIntroSceneReady(room)?(Number(room.phaseStartedAt)||Date.now())+ULTIMON_INTRO_AUTO_ADVANCE_MS:null;

export const ULTIMON_INTRO_STEPS=Object.freeze([
 'call','speech','entrance_select','entrance','line','exit','complete'
]);
// Catalogo condiviso con il Negozio: sedici effetti acquistabili.
export {ULTIMON_ENTRANCE_EFFECTS} from './ultimonCosmetics.js';
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
 // Compatibilità con le cerimonie già in corso: non togliere gli effetti
 // confermati prima del nuovo Negozio Cosmetici.
 if(stored===ULTIMON_BASIC_ENTRANCE.id || ULTIMON_ENTRANCE_EFFECTS.some(effect=>effect.id===stored))return stored;
 // Le CPU non acquistano cosmetici: entrano normalmente.
 if(room.isBot?.[role])return ULTIMON_BASIC_ENTRANCE.id;
 return null;
}
export function ultimonIntroEntrancePatch(room,role,effectId,ownedEffects=[]){
 if(room.gameMode!=='ultimon'||room.status!=='ultimon_intro'||
   room.ultimon?.intro?.step!=='entrance_select'||
   currentUltimonIntroRole(room)!==role||
   !ultimonPlayers(room).includes(role)||room.isBot?.[role])
  throw new Error('Non puoi scegliere un ingresso adesso.');
 if(!ultimonIntroSpeech(room,role))
  throw new Error('Pronuncia prima il monologo.');
 if(room.ultimon?.intro?.entrances?.[role])
  throw new Error('L’ingresso è già stato confermato.');
 if(typeof effectId!=='string' ||
   (effectId!==ULTIMON_BASIC_ENTRANCE.id && !ULTIMON_ENTRANCE_EFFECTS.some(effect=>effect.id===effectId)))
  throw new Error('Seleziona un ingresso esistente.');
 if(!ownsUltimonEntrance({ultimonEntrances:ownedEffects},effectId))
  throw new Error('Questo ingresso non è stato acquistato nel Negozio Cosmetici.');
 return {['ultimon.intro.entrances.'+role]:effectId,phaseStartedAt:Date.now()};
}
// La presentazione scenica usa TUTTO il roster, non solo i quattro
// ambasciatori che pronunciano le loro battute individuali.
export function ultimonIntroFullTeam(room,role=currentUltimonIntroRole(room)){
 return (room.ultimon?.rosters?.[role]||[])
  .filter(c=>c&&!c.isSummonOnly)
  .map((c,index)=>({index,id:c.id,name:c.name,img:c.img,hp:c.hp}));
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
 return {['ultimon.intro.monologues.'+role]:line,phaseStartedAt:Date.now()};
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
// La verifica dell'identità dell'host è effettuata dalla transazione online.
export function skipUltimonCurrentPresentation(room){
 if(room.gameMode!=='ultimon'||room.status!=='ultimon_intro')
  throw new Error('La presentazione non è attiva.');
 const intro=room.ultimon?.intro,current=currentUltimonIntroRole(room);
 if(!intro||intro.step==='complete'||!current)
  throw new Error('Non ci sono scene da saltare.');
 if(!ultimonIntroSpeech(room,current))
  throw new Error('Attendi che il capitano finisca di scrivere il suo monologo.');
 if(!ultimonIntroEntrance(room,current))
  throw new Error('Attendi che il capitano scelga il proprio ingresso.');
 if(intro.index+1<intro.order.length)
  return {'ultimon.intro.index':intro.index+1,'ultimon.intro.step':'call',
    'ultimon.intro.lineIndex':0,phaseStartedAt:Date.now()};
 return {'ultimon.intro.step':'complete',phaseStartedAt:Date.now()};
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
