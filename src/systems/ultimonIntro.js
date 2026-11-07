import {ultimonPlayers,ultimonAlive,allUltimonNamed} from './ultimonSystem.js';
import {ultimonEntranceLine} from './ultimonEntranceLines.js';

// Una presentazione condivisa tra tutti i client Firestore. La sorte dei
// quattro ambasciatori viene decisa una volta dall'host e salvata nella stanza.
export const ULTIMON_INTRO_STEPS=Object.freeze(['call','speech','line','exit','complete']);
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

export function ultimonIntroCast(room,role=currentUltimonIntroRole(room)){
 const ids=room.ultimon?.intro?.casts?.[role]||[];
 return ids.map(index=>{
  const fighter=room.ultimon?.rosters?.[role]?.[index];
  return fighter?{index,id:fighter.id,name:fighter.name,img:fighter.img,
   line:ultimonEntranceLine(fighter)}:null;
 }).filter(Boolean);
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
    order,index:0,step:'call',lineIndex:0,casts,monologues:{}
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
  return {'ultimon.intro.step':'line','ultimon.intro.lineIndex':0,
    phaseStartedAt:Date.now()};
 }
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
  intro.order.every(role=>!!ultimonIntroSpeech(room,role));
}
