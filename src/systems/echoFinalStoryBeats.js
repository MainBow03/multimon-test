// Conversazioni originali durante il raid: non ripetono battute già ascoltate.
// Lo stato delle soglie è conservato sul boss e quindi nei checkpoint.
export const ECHO_FINAL_STORY_BEATS=Object.freeze([
 {id:'quarter',threshold:.75,lines:[
  ['Echomax','Anche in ventiquattro non riuscirete a proteggere ogni singola anima. Qualcuno verrà dimenticato.'],
  ['Sage','Ne abbiamo già liberate migliaia. Non scegli tu quanto vale una vita.'],
  ['Neon','Il segnale dell’Eco si indebolisce. La libertà delle anime sta destabilizzando i suoi scudi.'],
  ['Echomax','Allora mi basterà farvi dimenticare perché siete venuti.']
 ]},
 {id:'half',threshold:.50,lines:[
  ['Echomax','Le anime di Goku, Naruto e Luffy mi hanno mostrato cosa significa desiderare qualcosa senza limite.'],
  ['Robin','Hanno desiderato per sé, non per costringere gli altri. Non hai capito nulla dei loro sogni.'],
  ['Corvina','Ogni volta che il suo dominio vacilla, una delle anime ritrova un frammento di sé.'],
  ['Echomax','Basta. Se non posso usare i loro sogni, userò la vostra paura.']
 ]},
 {id:'last',threshold:.25,lines:[
  ['Echomax','Cinquecento anni di silenzio. Tutto quel tempo a preparare un mondo senza errori. E voi lo riducete in cenere!'],
  ['Cell','Non è il mondo che hai costruito. Sono le catene che gli avevi messo intorno.'],
  ['Marceline','Sei così terrorizzato di perdere il controllo da non accorgerti che tutti gli altri stanno imparando a vivere.'],
  ['Echomax','Dimostratemi, allora, che la vostra volontà può sopravvivere persino alla mia.']
 ]}
]);
export function emitEchoFinalStoryBeats(enemies=[],events=[]){
 const boss=enemies.find(e=>e?.id==='echomax');
 if(!boss||!Number.isFinite(boss.hp)||!Number.isFinite(boss.maxHp)||boss.maxHp<=0)return [];
 const finished=new Set(Array.isArray(boss.echoFinalDialogueStages)?boss.echoFinalDialogueStages:[]);
 const triggered=[];
 for(const stage of ECHO_FINAL_STORY_BEATS){
  if(boss.hp/boss.maxHp<=stage.threshold&&!finished.has(stage.id)){
   finished.add(stage.id);
   triggered.push(stage.id);
   for(const [speaker,line] of stage.lines)
    events.push({type:'text',text:'🎭 '+speaker+': «'+line+'»'});
  }
 }
 if(triggered.length)boss.echoFinalDialogueStages=[...finished];
 return triggered;
}
export function echoSoulReleaseDialogue(id){
 const lines={
  goku:[['Anima di Goku','La mia forza... non era fatta per servire un padrone.'],['Echomax','NO! Anche la volontà di Goku mi sfugge!']],
  naruto:[['Anima di Naruto','I miei legami... sono più forti di questa catena.'],['Echomax','Come può un ricordo resistere a tutto il mio potere?']],
  luffy:[['Anima di Luffy','Il mare è libero... e anch’io lo sarò!'],['Echomax','La terza anima... no, non potete portarmela via!']]
 };
 return lines[id]||[];
}
