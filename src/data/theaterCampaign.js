import {THEATER_ACT_I} from './theater/act1.js';
import {THEATER_ACT_II} from './theater/act2.js';
import {THEATER_ACT_III} from './theater/act3.js';
import {THEATER_ACT_IV} from './theater/act4.js';
import {THEATER_ACT_V} from './theater/act5.js';
import {THEATER_ACT_VI} from './theater/act6.js';

export const THEATER_ID='teatro_catastrofi';
export const THEATER_STARTERS=Object.freeze(['starbutterfly','coraline']);
export const THEATER_TOTAL_MISSIONS=36;
export const THEATER_RULES=Object.freeze({
 spotlight:{name:'Luci di protezione',description:'Finché un Riflettore Vivente è attivo, gli altri avversari subiscono il 25% di danni in meno. Spegni i riflettori per togliere la protezione.'},
 mirror:{name:'Scena specchiata',description:'Nei turni pari, le mosse offensive di entrambe le squadre infliggono il 10% di danni in meno.'},
 rehearsal:{name:'Prove generali',description:'Ogni terzo turno gli attacchi dei nemici sono potenziati del 15%. Preparati prima che le luci cambino.'},
 improv:{name:'Fuori copione',description:'Ogni terzo turno i tuoi attacchi infliggono il 20% di danni in più. Sfrutta la finestra di improvvisazione.'},
 curtain:{name:'Sipario pesante',description:'Ogni quarto turno gli attacchi diretti di entrambe le squadre infliggono il 15% di danni in meno.'},
 finale:{name:'Ultimo sipario',description:'I due riflettori proteggono il Regista. A 66% e 33% dei suoi PS cambierà fase; distruggi le luci per ridurgli le difese.'}
});
const ACTS=[THEATER_ACT_I,THEATER_ACT_II,THEATER_ACT_III,
 THEATER_ACT_IV,THEATER_ACT_V,THEATER_ACT_VI];
const dialogue=lines=>(lines||[]).map(([s,t])=>({s,t}));
export const THEATER_CAMPAIGN={
 id:THEATER_ID,title:'Il Teatro delle Catastrofi',shortTitle:'Quarta Campagna',
 description:'Un invito misterioso, una principessa scelta come protagonista e un teatro tra le dimensioni: Star, Coraline e Sam sono le attrici di uno spettacolo preparato nei minimi dettagli.',
 bg:'from-rose-950 via-purple-950 to-slate-950',
 intro:{
  title:'Il Teatro delle Catastrofi',subtitle:'Prologo: La principessa fuori copione',
  p1:'Star Butterfly riceve un biglietto dorato per uno spettacolo che non ha mai accettato. Quella notte un quartiere di Mewni viene trasformato in un palcoscenico, con veri abitanti intrappolati tra i fondali. A casa sua, Coraline trova un invito identico accanto a una porta comparsa dal nulla. Qualcuno ha scelto entrambe per una rappresentazione multiversale.',
  p2:'Un misterioso Regista vuole mettere in scena la rappresentazione perfetta, utilizzando veri luoghi e persone. Perché proprio Star e Coraline? Chi assiste allo spettacolo e chi ha scritto il copione? Sei atti, 36 missioni e una Regola di Scena diversa in ogni battaglia.'
 },
 sectors:ACTS.map((act,actIdx)=>({
  name:act.name,description:act.description,bg:act.bg,
  missions:act.missions.map((entry,missionIdx)=>{
   const number=actIdx*6+missionIdx+1;
   return {
    id:'teatro_'+String(number).padStart(2,'0'),title:entry.title,
    boss:entry.boss,unlock:entry.unlock||[],
    removeChars:entry.removeChars||undefined,
    unavailableChars:entry.unavailableChars||undefined,
    dialogue:dialogue(entry.dialogue),postDialogue:dialogue(entry.postDialogue),
    theaterMission:true,theaterAct:actIdx+1,theaterNumber:number,
    theaterRule:entry.sceneRule,
    theaterRuleDescription:THEATER_RULES[entry.sceneRule]?.description||'',
    theaterFinal:!!entry.theaterFinal,
    ...(entry.forceFieldSize?{forceFieldSize:entry.forceFieldSize}:{})
   };
  })
 }))
};
