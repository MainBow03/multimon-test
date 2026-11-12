export const THEATER_ACT_II={
 name:'ATTO II · Dietro il sipario',
 description:'Il Teatro ha una città, un archivio e migliaia di persone intrappolate. Le leggi delle scenografie nascondono una macchina reale.',
 bg:'bg-indigo-950',
 missions:[
 {title:'La città di cartone',boss:['riflettore','reboo','riflettore'],sceneRule:'spotlight',
 dialogue:[
 ['Star Butterfly','Queste case hanno le finestre, i balconi e... nessuna parete sul retro.'],
 ['Sam (Totally Spies)','Sono fondali su ruote. Ma le persone all’interno sono reali.'],
 ['Coraline','Attenzione al pavimento: qui sotto c’è il vuoto, anche se sembra asfalto.'],
 ['Il Caposcena','Le comparse non devono vedere il lato sbagliato della città!'],
 ['Star Butterfly','Il lato sbagliato è quello con qualcuno che cerca di farle precipitare!'],
 ['Sam (Totally Spies)','Distruggiamo i supporti dei riflettori; senza luce, i binari diventano visibili.'],
 ['Coraline','E accompagniamo fuori tutti prima che il fondale crolli. Nessuno resta indietro.']
 ],
 postDialogue:[
 ['Sam (Totally Spies)','Ho recuperato una scheda di controllo. Qualcuno produce queste scene su scala industriale.'],
 ['Star Butterfly','I cittadini possono tornare a casa?'],
 ['Coraline','Non ancora. Il Teatro ha preso anche le loro porte di uscita.'],
 ['Sam (Totally Spies)','Allora troviamo chi progetta quelle porte.']
 ]},
 {title:'Un ingegnere dietro le quinte',boss:['caposcena','mechajohnny'],unlock:['tails'],sceneRule:'curtain',
 dialogue:[
 ['Tails','Non muovetevi! Ho piazzato dei sensori tra i macchinari.'],
 ['Star Butterfly','È una volpe con due code! Posso chiederti se...'],
 ['Sam (Totally Spies)','Star. Dopo. Mi chiamo Sam: il tuo sistema sta tentando di aggirare i controlli?'],
 ['Tails','Sì! Ogni volta che spengo un proiettore, un altro lo riaccende. Qualcuno sta riscrivendo i comandi.'],
 ['Coraline','Come quando chiudi una porta e qualcuno la apre dall’altro lato.'],
 ['Il Caposcena','L’ingegnere è in ritardo. La scena deve iniziare ADESSO!'],
 ['Tails','Allora aiutatemi a salvare la console prima che il suo robot la distrugga!'],
 ['Star Butterfly','Bene! Abbiamo trovato un genio e un altro robot da prendere a schiaffi!']
 ],
 postDialogue:[
 ['Tails','Ho isolato il circuito. Possiamo controllare alcune luci dall’interno.'],
 ['Sam (Totally Spies)','Con il tuo aiuto possiamo mappare tutte le cabine del Teatro.'],
 ['Tails','Resterò con voi. Ho bisogno di scoprire come funziona questa macchina.'],
 ['Star Butterfly','BENVENUTO! L’unica regola del gruppo è che io posso dare nomi ai nostri piani.'],
 ['Coraline','Quella non è una regola approvata.']
 ]},
 {title:'Due madri, una porta',boss:['altramadre','caposcena'],sceneRule:'mirror',
 dialogue:[
 ['Coraline','Questo corridoio... conosco la carta da parati. E la porta in fondo.'],
 ['Altra Madre','Tesoro. Ho preparato una parte bellissima soltanto per te.'],
 ['Star Butterfly','Ehi! Perché quella signora ha dei bottoni sugli occhi?'],
 ['Sam (Totally Spies)','Star, non distrarti. Questa creatura conosce Coraline.'],
 ['Altra Madre','Conosco tutto quello che potrebbe renderla felice.'],
 ['Coraline','Conosci soltanto quello che pensi dovrebbe rendermi felice.'],
 ['Altra Madre','Con due nuove amiche sei diventata ancora più impertinente.'],
 ['Star Butterfly','È un complimento, giusto? Perché io lo prenderei come un complimento.'],
 ['Coraline','No, Star. Ma grazie. Questa volta non ho intenzione di entrare da sola.']
 ],
 postDialogue:[
 ['Altra Madre','Chiudevi gli occhi per la paura. Ora sai guardare soltanto chi ti accompagna.'],
 ['Coraline','Ho imparato a guardare entrambe le cose. Addio.'],
 ['Star Butterfly','Okay. Adesso che siamo fuori posso davvero chiedere la storia dei bottoni?'],
 ['Sam (Totally Spies)','Dopo aver sigillato la porta. Per favore.'],
 ['Coraline','Ve la racconterò. Ma non durante la cena.']
 ]},
 {title:'Il concerto interrotto',boss:['primadonna','riflettore'],unlock:['miku'],sceneRule:'rehearsal',
 dialogue:[
 ['Hatsune Miku','Un’altra esibizione? Non c’è mai un’ultima canzone qui.'],
 ['La Prima Donna','Il pubblico vuole il bis. Se smetti, lo spettacolo finisce per tutti.'],
 ['Sam (Totally Spies)','Quel sistema di amplificazione rimanda l’ultimo ritornello ai musicisti.'],
 ['Coraline','Così nessuno può completare il concerto.'],
 ['Star Butterfly','Ehi! Un concerto senza finale è una tortura! Non puoi nemmeno andare a mangiare i popcorn!'],
 ['Hatsune Miku','Se riuscite a interrompere il ritorno audio, posso suonare una nota fuori programma.'],
 ['La Prima Donna','Nessuna improvvisazione è ammessa sul mio palcoscenico!'],
 ['Sam (Totally Spies)','Allora sarà un peccato quando la tua cassa di controllo smetterà di funzionare.']
 ],
 postDialogue:[
 ['Hatsune Miku','Silenzio... Per la prima volta posso scegliere quale canzone cantare.'],
 ['Star Butterfly','A me piacciono quelle che fanno BOOM!'],
 ['Sam (Totally Spies)','Miku, quelle frequenze interferiscono con i riflettori. Ti andrebbe di aiutarci?'],
 ['Hatsune Miku','Sì. Vorrei che anche gli altri potessero cantare senza un copione.'],
 ['Coraline','Mi piace come suona questo piano.']
 ]},
 {title:'Tre battute per un disastro',boss:['riflettore','caposcena','riflettore'],sceneRule:'improv',
 dialogue:[
 ['Il Regista','A sinistra, una famiglia chiusa in una galleria. A destra, un ponte pieno di viaggiatori. Davanti, il vostro amico Tails. Una sola uscita.'],
 ['Star Butterfly','Perché continui a inventare queste stupidaggini?!'],
 ['Sam (Totally Spies)','Ha collegato tutti e tre i settori alla stessa leva. Ma non sono circuiti indipendenti.'],
 ['Coraline','Guarda i segni sul pavimento: la scenografia ruota. Le tre strade si incontrano dietro.'],
 ['Tails','Posso sincronizzare le porte, ma qualcuno deve impedire ai riflettori di riavviarsi.'],
 ['Hatsune Miku','Un segnale audio può tenerli fuori tempo per qualche secondo.'],
 ['Star Butterfly','Allora mi prendo il ruolo di quella che distrae tre luci idiote. È il mio ruolo naturale!'],
 ['Il Regista','Un piano collettivo. Che sorpresa... Vediamo se funziona davvero.']
 ],
 postDialogue:[
 ['Tails','Le porte si sono aperte contemporaneamente. Tutti e tre i gruppi sono usciti.'],
 ['Star Butterfly','HAI VISTO? Non abbiamo scelto chi perdere!'],
 ['Il Regista','Avete trovato una soluzione a una scena mal costruita. Ne prenderò nota.'],
 ['Sam (Totally Spies)','Sta imparando da noi. Non possiamo usare sempre lo stesso trucco.'],
 ['Coraline','Bene. Allora ne inventeremo altri.']
 ]},
 {title:'La legge dei riflettori',boss:['primadonna','riflettore','riflettore'],sceneRule:'spotlight',
 dialogue:[
 ['Tails','Siamo nella cabina di regia secondaria. Ho trovato i registri e perfino i dossier del cast.'],
 ['Sam (Totally Spies)','Qui non c’è magia predittiva: ogni disastro è una scena organizzata. Persino i nostri inviti erano pianificati. Rotaie, interruttori e percorsi obbligati.'],
 ['Star Butterfly','Quindi il suo grande spettacolo non prevede niente: provoca disastri e aspetta che il suo cast reagisca davvero!'],
 ['Coraline','Ma chi guarda davvero tutti questi spettacoli?'],
 ['La Prima Donna','Il nostro pubblico non vuole essere visto. Vuole soltanto una storia perfetta.'],
 ['Hatsune Miku','Sento qualcosa sotto la sala. Come migliaia di voci che cercano di parlare.'],
 ['Tails','Una rete di energia scende fino ai sotterranei. Non posso isolare la fonte.'],
 ['Sam (Totally Spies)','Se vogliamo capire, dobbiamo andare oltre il palcoscenico.']
 ],
 postDialogue:[
 ['Tails','Ho copiato l’archivio del Teatro. Prevede sei atti e scenografie sottratte a diversi mondi. Quello di Mewni era soltanto il primo allestimento.'],
 ['Coraline','E persone segnate con una sola parola: comparsa.'],
 ['Star Butterfly','Non ci credo. Abbiamo appena iniziato a scoprire quanto è grande questa cosa.'],
 ['Il Regista','Complimenti, mie attrici. Avete ottenuto l’accesso al secondo spettacolo.'],
 ['Sam (Totally Spies)','Sapeva che saremmo arrivati qui. Dobbiamo smettere di seguire le porte che ci apre.']
 ]}
 ]};