// L'Eco dei Sei Portali — storia della Campagna 3D.
// Una rete di teletrasporti isolata per evitare un sovraccarico.
// Gli Emblemi sono chiavi di sincronizzazione, non medaglie arbitrarie.
export const ADVENTURE_STORY_TITLE='L’Eco dei Sei Portali';
export const ADVENTURE_RIVAL_NAME='Nox';
export const ADVENTURE_RIVAL_ZONES=Object.freeze([1,3,5]);

const lines=(...entries)=>entries.map(([speaker,text])=>({speaker,text}));

export const ADVENTURE_STORY=Object.freeze({
 'arrival:alba':{
  title:'I · La Valle Scollegata',
  lines:lines(
   ['Professor Orion','Hai presente i portali che collegavano queste sei regioni? Si sono spenti tutti nella stessa notte.'],
   ['Professor Orion','La Lega non risponde. Io posso riparare il collegamento soltanto con le sei chiavi di sincronizzazione, che i capipalestra custodiscono come Emblemi.'],
   ['Professor Orion','Parti da Flora. Prima però allenati contro Milo e Lena: lei vuole sapere che sai proteggere i tuoi compagni.'],
   ['Nox','Orion, sei sicuro? La rete si è spenta per un motivo. Accenderla senza sapere quale potrebbe peggiorare le cose.'],
   ['Professor Orion','Allora scopriamo il motivo, invece di lasciare i villaggi isolati.']
  )},
 'badge:alba':{
  title:'Il primo collegamento',
  lines:lines(
   ['Flora','L’Emblema Smeraldo ha riacceso il ripetitore della Valle. La strada delle Braci dovrebbe essere accessibile.'],
   ['Professor Orion','Bene! Dal vecchio terminale è arrivata una traccia: l’ultima comunicazione della Lega proveniva proprio dalle Braci.'],
   ['Flora','Non correre dritto verso il pericolo. A Braci incontrerai persone che hanno perso molto con il blackout.']
  )},
 'arrival:braci':{
  title:'II · La Forgia Silenziosa',
  lines:lines(
   ['Kael','Le fornaci si alimentavano con l’energia dei portali. Da quando la rete è spenta, metà del villaggio lavora al buio.'],
   ['Nox','Ho trovato un registro di interventi. La chiusura è partita dalla Lega. Prima di riaprire questo varco, voglio vedere se sai reggere uno scontro.'],
   ['Kael','Nox, ancora con le sfide? Meglio una prova controllata che una discussione davanti alle fornaci.'],
   ['Nox','Affronta i due allenatori e poi me. Non ti lascerò consegnare il sigillo a chiunque.']
  )},
 'badge:braci':{
  title:'Un messaggio a metà',
  lines:lines(
   ['Kael','Ecco il registro recuperato dalle fornaci. La Lega ha scritto: «Arresto di sicurezza. Sovraccarico del...». Il resto è cancellato.'],
   ['Nox','Qualcuno sa più di quanto dice. Vado al Lago delle Cascate: i vecchi condotti lì dovrebbero conservare una copia del segnale.'],
   ['Professor Orion','Non dobbiamo inseguire Nox per forza. Seguiamo i fatti: al Lago troveremo la prossima chiave.']
  )},
 'arrival:cascate':{
  title:'III · Il Segnale Sommerso',
  lines:lines(
   ['Nerea','Sotto il lago c’è un condotto della vecchia rete. L’acqua ha conservato il segnale che le fornaci avevano perso.'],
   ['Katara','Ho provato a leggerlo. Non è un sabotaggio: la pressione energetica è aumentata fino al limite, poi qualcuno ha tirato il freno.'],
   ['Nerea','Se vuoi l’Emblema Onda, dimostra che sai adattarti. I due allenatori del pontile ti aspettano.'],
   ['Katara','E prima di salire in Palestra, puoi curarti gratis al Centro. Non c’è niente di eroico nell’arrivare esausti.']
  )},
 'badge:cascate':{
  title:'Non era un attacco',
  lines:lines(
   ['Nerea','Il messaggio è completo: «Sovraccarico del Cuore dei Portali. Isolare i sei rami».'],
   ['Professor Orion','Quindi qualcuno li ha chiusi per proteggerci. Ma per quanto tempo? Il villaggio delle nevi conserva gli strumenti che misuravano la rete.'],
   ['Nerea','Porta questa lettura a Eira. Saprà dirti se il Cuore può essere riacceso.']
  )},
 'arrival:neve':{
  title:'IV · La Verità nel Ghiaccio',
  lines:lines(
   ['Eira','I sensori della montagna non mentono. La rete era vicina a spezzarsi. Una chiusura totale ha evitato il peggio.'],
   ['Nox','È quello che cercavo di dirvi. Se riunite gli Emblemi troppo in fretta, il Cuore potrebbe sovraccaricarsi di nuovo.'],
   ['Eira','Hai ragione sul rischio, Nox. Ma isolare le persone per sempre non è una soluzione.'],
   ['Nox','Allora dimostrami che puoi decidere quando fermarti. Dopo gli allenatori, ti sfido qui, davanti al laboratorio.']
  )},
 'badge:neve':{
  title:'La firma sul comando',
  lines:lines(
   ['Eira','Il comando di chiusura porta una firma: Iris, Campionessa della Lega. È stata lei a isolare la rete.'],
   ['Nox','Iris ha salvato le regioni, ma non ci ha detto come riparare il Cuore. Aveva un motivo per tenerci lontani.'],
   ['Professor Orion','Nel Giardino Astrale studiano i sei sigilli come una sola costellazione. Lì possiamo trovare la sequenza corretta.']
  )},
 'arrival:astrale':{
  title:'V · I Sei Sigilli',
  lines:lines(
   ['Lyra','Gli Emblemi sono sei note di una stessa armonia. Se li attivi tutti insieme, la rete oscilla. Se li sincronizzi uno alla volta, il Cuore si stabilizza.'],
   ['Perla','Gli schemi confermano la teoria. Il protocollo è stato preparato prima del blackout, ma qualcuno non ha fatto in tempo a provarlo.'],
   ['Lyra','I due allenatori del Giardino hanno studiato quel protocollo. La loro sfida è l’ultima verifica prima che tu possa custodire la quinta chiave.'],
   ['Professor Orion','Una volta ottenuto il sigillo, resta soltanto la Corona del Vulcano e la Lega.']
  )},
 'badge:astrale':{
  title:'La sequenza dimenticata',
  lines:lines(
   ['Lyra','Eccola: Smeraldo, Scintilla, Onda, Brina, Stella e infine Corona. Ogni chiave contiene il ritmo della regione precedente.'],
   ['Perla','Questa sequenza impedisce di risvegliare il Cuore tutto in una volta. Rokan conserva l’ultima componente, vicino al vulcano.'],
   ['Nox','Ho seguito la stessa pista. Ti aspetterò lì. Se vuoi portare le sei chiavi alla Lega, dovrai farmi vedere che hai capito il rischio.']
  )},
 'arrival:vulcano':{
  title:'VI · L’Ultima Soglia',
  lines:lines(
   ['Rokan','Le antiche officine della Corona hanno creato gli Emblemi. Chi arriva fin qui deve saperli usare, non soltanto collezionarli.'],
   ['Nox','Ho paura che Iris voglia tenere la rete spenta per sempre. Io voglio aprirla adesso.'],
   ['Rokan','E se aprirla tutta insieme spezzasse il Cuore? Nessuno di voi ha ancora tutte le risposte.'],
   ['Nox','Hai ragione. Facciamo un’ultima prova. Affronta i due allenatori della Forgia, poi me. Se vinci, mi fiderò del tuo giudizio.']
  )},
 'badge:vulcano':{
  title:'La strada verso la Lega',
  lines:lines(
   ['Rokan','La sesta chiave è tua. La strada della Lega è aperta.'],
   ['Nox','Ho riletto gli schemi di Lyra. Non dobbiamo scegliere fra «tutto spento» e «tutto acceso». Possiamo riattivare un ramo alla volta.'],
   ['Professor Orion','Con le sei chiavi e il protocollo corretto, Iris potrà verificare se il Cuore è stabile. Raggiungila alla Lega.'],
   ['Nox','Non ti sfiderò più. Stavolta vengo con te, almeno fino alla porta.']
  )},
 ending:{
  title:'Epilogo · Le Porte dell’Alba',
  lines:lines(
   ['Iris','Hai superato la prova. Chi cerca solo di vincere non può riparare una rete che collega tante vite.'],
   ['Iris','Ho chiuso i portali quando il Cuore rischiava di cedere. Senza un viaggiatore capace di attraversare tutte le regioni non potevo sincronizzarli in sicurezza.'],
   ['Nox','Quindi non ci avevi abbandonati. Stavi cercando un modo per non farci correre un altro rischio.'],
   ['Professor Orion','I sei Emblemi stanno rispondendo, uno dopo l’altro. Le strade tornano a comunicare!'],
   ['Iris','Il titolo di Campione del Multiverso è tuo. Ma il viaggio non finisce: ora queste regioni possono tornare a conoscersi.']
  )}
});

export const ADVENTURE_INTRO_DIALOGUE=ADVENTURE_STORY['arrival:alba'];
export const adventureStoryScene=id=>ADVENTURE_STORY[id]||null;
export function adventureNextStoryScene(save,zoneId){
 if(!save?.started||!save.welcomed)return null;
 const seen=Array.isArray(save.storySeen)?save.storySeen:[];
 if(save.finished&&!seen.includes('ending'))return {id:'ending',...ADVENTURE_STORY.ending};
 const latestBadge=Array.isArray(save.badges)?save.badges.at(-1):null;
 if(latestBadge&&!seen.includes('badge:'+latestBadge))
  return {id:'badge:'+latestBadge,...ADVENTURE_STORY['badge:'+latestBadge]};
 const id='arrival:'+zoneId;
 if(!seen.includes(id)&&ADVENTURE_STORY[id])return {id,...ADVENTURE_STORY[id]};
 return null;
}
export function adventureMarkStorySeen(save,id){
 if(!ADVENTURE_STORY[id]||(save.storySeen||[]).includes(id))return save;
 return {...save,storySeen:[...(save.storySeen||[]),id]};
}
