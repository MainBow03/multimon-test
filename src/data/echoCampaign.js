// MULTIMON III — L'Eco delle Anime. Terzo capitolo narrativo, 36 missioni.
// I personaggi indicati in unlock entrano nella Resistenza SOLO dopo la vittoria.
export const ECHO_STARTERS=['jake','marceline'];
export const ECHO_RECRUITS=[
 'neon','sage','carlos','leon','bugsbunny','daffyduck','darwin','nicole',
 'penny','zatchbell','brago','meliodas','ban','perla','garnet','robin',
 'corvina','stellarubia','bumblebee','embermclain','cell','gaster'
];
export const ECHO_ALLIES=[...ECHO_STARTERS,...ECHO_RECRUITS];
export const ECHO_ID='eco_anime';
export const ECHO_FINAL_ID='eco_36';
export const isEchoFinalMission=mission=>mission?.id===ECHO_FINAL_ID;

// Dialoghi della storia: ogni missione ha una situazione e una risoluzione proprie.
const chapters=[
 {name:'Atto I · I superstiti',description:'La sede della Resistenza è vuota. Jake e Marceline raccolgono i primi sopravvissuti e cercano le tracce dei loro amici.',bg:'bg-slate-900',missions:[
  ['La sede abbandonata',['scheletro','clone_rosso'],[],[
   ['Jake il Cane','Finn non è mai rimasto in silenzio per tre giorni. Neppure quando ha perso il telefono nel mare!'],
   ['Marceline','Guarda la porta. È stata aperta dall’interno. Qualcuno sapeva dove trovarli.'],
   ['Jake il Cane','C’è un messaggio di Finn... «Non fidatevi di quello che vedrete. E soprattutto...» È interrotto!'],
   ['Marceline','Qualcuno sta arrivando. Sono vestiti come i vecchi soldati della Resistenza, ma i loro occhi sono vuoti.']
  ],[
   ['Marceline','Non sono semplicemente ipnotizzati. Le loro anime sembrano collegate a qualcosa di lontanissimo.'],
   ['Jake il Cane','Allora troveremo chi tiene in mano i fili. Per Finn. E per Topolino.']
  ]],
  ['Una scintilla nel buio',['metalsonic','zergling'],['neon'],[
   ['Neon','Ehi! Voi due! Se siete dalla parte di quei robot, vi avverto: corro più veloce di quanto riusciate a pensare!'],
   ['Jake il Cane','Noi cerchiamo Finn! Ma prima facciamo fuori i tizi che ti inseguono.'],
   ['Marceline','Le comunicazioni sono bloccate. Questa ragazza potrebbe sapere come attraversare il settore.']
  ],[
   ['Neon','Okay, mi avete salvato. Conosco un passaggio attraverso le barriere: vengo con voi!'],
   ['Jake il Cane','Tre membri della nuova Resistenza. Sembra quasi il primo giorno, eh, Marceline?']
  ]],
  ['L’ultimo rifugio',['reboo','robo_aiutante_1'],['sage'],[
   ['Sage','Il rifugio è pieno. Alcuni pazienti continuano a ripetere frasi che non appartengono loro.'],
   ['Marceline','Posso sentire una seconda voce sotto le loro parole. Non è una malattia normale.'],
   ['Neon','Ci sono altri aggressori fuori! Difendiamo l’entrata!']
  ],[
   ['Sage','Non posso abbandonare chi soffre. Se mi portate con voi, potremo aiutare molti altri.'],
   ['Marceline','Abbiamo bisogno di qualcuno che sappia ricucire le ferite. Benvenuta, Sage.']
  ]],
  ['Zona di quarantena',['zazan','robo_aiutante_2'],['carlos'],[
   ['Carlos Oliveira','Alt! La quarantena è in vigore. Chi viene colpito da questa energia smette di riconoscere i propri compagni.'],
   ['Jake il Cane','Noi ne cerchiamo due. Un ragazzo con un cappello bianco e un topo molto famoso.'],
   ['Carlos Oliveira','Ho sentito parlare della scomparsa. Prima aiutatemi a evacuare i civili.']
  ],[
   ['Carlos Oliveira','Questa invasione è pianificata. Qualcuno sta scegliendo i bersagli con precisione.'],
   ['Jake il Cane','Allora sei la persona giusta per aiutarci a fermarlo.']
  ]],
  ['L’agente scomparso',['megamind','clone_verde'],['leon'],[
   ['Leon Kennedy','Sono giorni che inseguo un segnale fantasma. Ora capisco perché: ogni trasmissione torna da un punto diverso.'],
   ['Carlos Oliveira','Leon? Credevo fossi disperso!'],
   ['Leon Kennedy','Non ancora. Ma se continuiamo a parlare, ci accerchieranno.'],
   ['Marceline','Finalmente qualcuno di pratico. Combattiamo.']
  ],[
   ['Leon Kennedy','Chiunque controlli queste truppe vuole che ci muoviamo verso una certa direzione.'],
   ['Carlos Oliveira','Allora facciamo il contrario: lo raggiungiamo per primi.']
  ]],
  ['Il Custode del Silenzio',['nito','mostro_scheletrico'],[],[
   ['Sage','La torre davanti a noi trasmette un segnale che interrompe i portali dimensionali.'],
   ['Neon','Quindi se la buttiamo giù possiamo chiamare rinforzi?'],
   ['Marceline','Sì. Ma il custode non ci permetterà di entrare senza combattere.']
  ],[
   ['Jake il Cane','Sono tornate le comunicazioni! Sento qualcosa... è una voce che dice «Echomax».'],
   ['Sage','Segnate quel nome. Dobbiamo scoprire chi è.']
  ]]
 ]},
 {name:'Atto II · La città senza voce',description:'Una città intera obbedisce a ordini invisibili. Anche i vecchi amici potrebbero mentire senza saperlo.',bg:'bg-cyan-950',missions:[
  ['Un coniglio fuori programma',['wario','robo_aiutante_1'],['bugsbunny'],[
   ['Bugs Bunny','Che succede, doc? Sono giorni che tutti sorridono e fanno la stessa fila. Perfino per comprare le carote!'],
   ['Jake il Cane','A me sembra terribile.'],
   ['Bugs Bunny','A me sembra che qualcuno abbia bisogno di una bella lezione di improvvisazione.']
  ],[
   ['Bugs Bunny','Quelli volevano imporre le regole a me? Ah! Mi unisco a voi, doc. Sarà divertente.'],
   ['Marceline','Ne ho già abbastanza di gente che crede di essere divertente.']
  ]],
  ['Il genio incompreso',['plankton','clone_rosso'],['daffyduck'],[
   ['Daffy Duck','Silenzio! Sono il nuovo comandante delle operazioni segrete... cioè, ehm, non l’ho detto davvero!'],
   ['Bugs Bunny','Bel travestimento, amico. Il becco ti spunta fuori dal casco.'],
   ['Daffy Duck','TRADITORE! Ora ci hanno scoperti!']
  ],[
   ['Daffy Duck','Naturalmente avevo previsto tutto. Senza il mio intervento sareste spacciati.'],
   ['Neon','Sei inciampato tre volte.'],
   ['Daffy Duck','Dettagli tattici!']
  ]],
  ['Dov’è Gumball?',['cuoredipietra','blob'],['darwin'],[
   ['Darwin','Non trovo Gumball da giorni. Le persone qui dicono tutte la stessa cosa, come un disco rotto.'],
   ['Jake il Cane','Capisco cosa significa cercare il proprio migliore amico. Ti aiutiamo noi.'],
   ['Darwin','Allora devo essere coraggioso. Vengo con voi!']
  ],[
   ['Darwin','Grazie. Mamma era andata verso il distretto centrale. Devo raggiungerla.'],
   ['Marceline','Ci arriviamo tutti insieme.']
  ]],
  ['Una madre contro tutti',['roserade','mantide'],['nicole'],[
   ['Nicole Watterson','Toglietevi dalla strada! Nessuno userà la mia famiglia come pedina!'],
   ['Darwin','MAMMA!'],
   ['Nicole Watterson','Darwin? Sei salvo! Perché siete tutti qui?'],
   ['Bugs Bunny','Eh, più o meno per lo stesso motivo, signora.']
  ],[
   ['Nicole Watterson','Non mi fermerò finché non avrò riportato tutti a casa. Da adesso comando anche io.'],
   ['Jake il Cane','Va bene! Abbiamo appena guadagnato una mamma super spaventosa.']
  ]],
  ['Un ordine familiare',['stewie','robo_aiutante_2'],[],[
   ['Topolino (trasmissione)','A tutti i membri della Resistenza: cessate ogni ribellione e consegnate le vostre armi.'],
   ['Darwin','Quello... era Topolino?'],
   ['Marceline','La voce sì. Il messaggio? Non ci credo.'],
   ['Leon Kennedy','Localizziamo il trasmettitore prima di giudicare.']
  ],[
   ['Sage','La registrazione sembra perfetta. Eppure una parte del segnale è stata costruita artificialmente.'],
   ['Jake il Cane','Non sappiamo ancora se Topolino è prigioniero oppure sta parlando davvero.']
  ]],
  ['Il Ventriloquo',['charmcaster','clone_corvina','clone_verde'],[],[
   ['Leon Kennedy','Questo teatro è pieno di copie. Alcune hanno le voci dei nostri alleati.'],
   ['Daffy Duck','Se ne facessero una di me, sarebbe almeno più talentuosa!'],
   ['Marceline','È una trappola. Restiamo concentrati: nessuna copia deve separarci.']
  ],[
   ['Bugs Bunny','Pare che la voce del topo fosse uno scherzo di pessimo gusto.'],
   ['Sage','Non possiamo esserne sicuri. Qualcuno sta usando ricordi autentici.']
  ]]
 ]},
 {name:'Atto III · La guerra dei regni',description:'Echomax cerca grandi sorgenti di magia per rompere il sigillo che lo trattiene.',bg:'bg-indigo-950',missions:[
  ['Il canto dell’acqua',['juvia','slime'],['penny'],[
   ['Penny','Le sorgenti del mio mondo stanno diventando nere! Le anime non riescono più a ritrovare la strada.'],
   ['Marceline','Conosco quella sensazione. C’è una presenza che le richiama tutte.'],
   ['Jake il Cane','Prima salviamo la gente, poi andiamo a parlare con quella presenza.']
  ],[
   ['Penny','Dovunque andiate, verrò anch’io. Non voglio lasciare questo potere nelle mani del nemico.']
  ]],
  ['Il ragazzo del libro rosso',['laxus','robo_aiutante_1'],['zatchbell'],[
   ['Zatch bell','Non permetterò a nessuno di rubare le anime dei miei amici!'],
   ['Neon','Finalmente un altro che usa l’elettricità.'],
   ['Sage','Dobbiamo attraversare il castello e interrompere il rituale.']
  ],[
   ['Zatch bell','Combatteremo insieme! Ho ancora tante persone da proteggere.'],
   ['Jake il Cane','Questa Resistenza diventa sempre più forte!']
  ]],
  ['Il re delle tenebre',['ryuk','mostro_scheletrico'],['brago'],[
   ['Brago','Non ho bisogno della vostra debole alleanza.'],
   ['Marceline','Allora non ti dispiacerà se eliminiamo i servitori che ti circondano.'],
   ['Brago','Tsk. Mostratemi di cosa siete capaci.']
  ],[
   ['Brago','Questo Echomax usa il potere dell’oscurità senza comprenderlo. Lo sconfiggerò.'],
   ['Daffy Duck','Perfetto! Un altro che non ride mai.']
  ]],
  ['Il drago senza paura',['zuko','natsu'],['meliodas'],[
   ['Meliodas','Ho visto molte maledizioni, ma questa è diversa. Qualcuno sta strappando alle persone il diritto di scegliere.'],
   ['Jake il Cane','Sai come impedirlo?'],
   ['Meliodas','Posso aiutarvi a spezzare i suoi incantesimi. Ma prima liberiamo questo regno.']
  ],[
   ['Meliodas','Vi accompagnerò. Sembra che il vostro capo mancante abbia parecchi buoni amici.'],
   ['Marceline','E alcuni decisamente rumorosi.']
  ]],
  ['L’immortale incatenato',['kratos','golem_pietra'],['ban'],[
   ['Ban l\'Immortale','Ehi, Meliodas! Ti sei finalmente deciso a venire a cercarmi?'],
   ['Meliodas','Avevo pensato di lasciarti in prigione ancora un pochino.'],
   ['Ban l\'Immortale','Ahah! Allora sbrighiamoci a far fuori queste guardie.']
  ],[
   ['Ban l\'Immortale','L’immortalità serve a poco se non puoi essere libero. Sono dei vostri.']
  ]],
  ['Il Re delle Catene',['ainz','golem_pietra_supremo'],[],[
   ['Sage','Il sigillo di quel comandante disattiva temporaneamente le abilità dei guerrieri che colpisce.'],
   ['Brago','Le catene di un falso sovrano non fermeranno il mio potere.'],
   ['Penny','C’è un’antica iscrizione sulla porta... parla di una prigione costruita cinquecento anni fa.']
  ],[
   ['Gaster (registrazione)','D... u... e... f... o... n... t... i... d... i... e... n... e... r... g... i... a... o... s... c... u... r... a...'],
   ['Jake il Cane','Due fonti oscure... Trigon e Gaster! È successo alla fine della prima guerra!'],
   ['Marceline','Abbiamo aperto qualcosa senza saperlo.']
  ]]
 ]},
 {name:'Atto IV · Gli eroi dell’ombra',description:'La Resistenza scopre che Echomax è ancora prigioniero, ma comanda il proprio esercito attraverso l’eco oscura di Trigon.',bg:'bg-purple-950',missions:[
  ['La Gemma spezzata',['peridot','diamante'],['perla'],[
   ['Perla','Hanno trasformato il nostro deposito di energia in una fabbrica di sigilli spirituali!'],
   ['Marceline','Non possiamo lasciargli un’altra fonte di potere.'],
   ['Sage','Perla, aiutaci a distruggere il generatore senza danneggiare le gemme prigioniere.']
  ],[
   ['Perla','Vi aiuterò a recuperare le anime rubate. Nessuno dovrebbe essere costretto a obbedire così.']
  ]],
  ['Il futuro è incerto',['diamantebianco','lapis'],['garnet'],[
   ['Garnet','Ho visto molti futuri. In quasi tutti, Echomax ci attende già.'],
   ['Jake il Cane','E in qualcuno vinciamo?'],
   ['Garnet','Sì. Ma solo se restiamo uniti e non seguiamo ogni previsione ciecamente.']
  ],[
   ['Garnet','La vostra presenza ha cambiato ciò che vedevo. Verrò con voi.']
  ]],
  ['Titani dispersi',['nightwing','cyborg'],['robin'],[
   ['Robin','I Titani sono dispersi. Ho creato un sistema di comunicazione, ma qualcuno conosce ogni nostra frequenza.'],
   ['Leon Kennedy','È una rete compromessa. Possiamo recuperarla, se lavoriamo insieme.'],
   ['Jake il Cane','Un altro capo squadra! Fantastico, ci serviva qualcuno organizzato.']
  ],[
   ['Robin','Non siete soldati, ma avete un piano. Mi unirò alla missione e proteggerò i superstiti.']
  ]],
  ['L’ombra della magia',['ursula','strega'],['corvina'],[
   ['Corvina','Conosco quella voce. Non appartiene a questo mondo. Trigon sta parlando attraverso un’altra entità.'],
   ['Marceline','Puoi indicare dove si nasconde?'],
   ['Corvina','Solo se interrompiamo i rituali che la alimentano.']
  ],[
   ['Corvina','Ho localizzato il nucleo della prigione. Ma per raggiungerlo bisognerà affrontare qualcosa che conosco fin troppo bene.']
  ]],
  ['L’eroe che non dovrebbe esserci',['finn','clone_rosso','clone_verde'],[],[
   ['Jake il Cane','Finn?! Sei davvero tu? Ti ho cercato ovunque!'],
   ['Finn l\'Umano','Jake... è bello rivederti. Non dovevate venire qui.'],
   ['Marceline','Finn, cosa ti è successo?'],
   ['Finn l\'Umano','Era proprio quello che volevamo.']
  ],[
   ['Jake il Cane','No... si sta dissolvendo!'],
   ['Corvina','Era una Copia Perfetta: possedeva una parte dei ricordi di Finn. Il vero Finn potrebbe essere ancora vivo.'],
   ['Marceline','Allora non ci fermeremo.']
  ]],
  ['L’anima di Trigon',['trigon','clone_corvina'],[],[
   ['Trigon','Pensavate di avermi sconfitto per sempre. L’eco della mia malvagità appartiene al vero dominatore.'],
   ['Corvina','Tu non sei mio padre. Sei soltanto la parte più oscura della sua anima.'],
   ['Trigon','Echomax costruirà un mondo senza volontà. E voi sarete le sue prime sentinelle.'],
   ['Marceline','Bene. Il discorso è finito.']
  ],[
   ['Trigon','Potrete distruggere questo corpo, ma l’Eco continuerà a risuonare!'],
   ['Corvina','Adesso sappiamo dove si trova la prigione di Echomax. Dobbiamo prepararci.']
  ]]
 ]},
 {name:'Atto V · Quando gli eroi cadono',description:'La Resistenza viene assediata. Gli eroi devono difendere gli ultimi rifugi e arrivare al cuore dell’Eco.',bg:'bg-rose-950',missions:[
  ['Fuoco stellare',['pyra','spyro'],['stellarubia'],[
   ['Stellarubia','Non lascerò che i portali vengano chiusi! Centinaia di persone devono ancora attraversarli.'],
   ['Robin','Copriamo la sua ritirata e mettiamo in sicurezza il corridoio.'],
   ['Jake il Cane','Meglio sbrigarsi: gli inseguitori sono già qui.']
  ],[
   ['Stellarubia','Grazie. Conosco altre vie nel cielo: vi accompagnerò.']
  ]],
  ['Le ali della ribellione',['metalsonic','robo_aiutante_2'],['bumblebee'],[
   ['Bumblebee','Sono entrata nella loro rete. Posso dirvi dove si trova il prossimo trasmettitore.'],
   ['Neon','Ehi, finalmente qualcuno che sa muoversi in fretta!'],
   ['Bumblebee','Prima però dobbiamo disattivare queste difese.']
  ],[
   ['Bumblebee','Trasmettitore fuori uso. La rete è aperta: da ora lavoriamo insieme.']
  ]],
  ['Il concerto fantasma',['reghiaccio','dolli'],['embermclain'],[
   ['Ember McLain','Questi fanatici stanno usando il mio concerto per attirare e imprigionare anime!'],
   ['Marceline','Hai bisogno di qualcuno che sappia suonare più forte delle loro frequenze.'],
   ['Ember McLain','Allora facciamo un duetto. Dopo averli sconfitti.']
  ],[
   ['Marceline','Non male. Non male per niente.'],
   ['Ember McLain','Se si tratta di far tacere Echomax, sono con voi.']
  ]],
  ['Assedio alla Resistenza',['zergling','golem_pietra_supremo','mostro_scheletrico','robo_aiutante_1'],[],[
   ['Robin','Ci attaccano da tre fronti! Tutti ai posti assegnati!'],
   ['Nicole Watterson','I civili prima di tutto. Non perderemo nessuno.'],
   ['Jake il Cane','La nostra base non cadrà senza una battaglia!'],
   ['Marceline','State pronti. È l’offensiva più grande che abbiamo visto.']
  ],[
   ['Carlos Oliveira','I superstiti sono evacuati. Ma la base è andata perduta.'],
   ['Jake il Cane','Abbiamo ancora i nostri compagni. Troveremo un’altra casa.']
  ]],
  ['La voce di Topolino',['stewie','megamind'],[],[
   ['Topolino (trasmissione)','Jake, se mi senti, non venire da solo. Non puoi credere a tutto quello che vedi.'],
   ['Jake il Cane','Queste sono le stesse parole che ci ha lasciato Finn.'],
   ['Sage','Stavolta il segnale contiene coordinate precise. Potrebbe essere autentico.'],
   ['Marceline','O un’altra trappola. Andiamo con gli occhi aperti.']
  ],[
   ['Garnet','Le coordinate portano direttamente al cuore della prigione. La strada è pericolosa, ma possibile.']
  ]],
  ['Il Generale Senza Volto',['astral','clone_corvina','celljr_1'],[],[
   ['Leon Kennedy','Questo generale può replicare i nemici che abbiamo già affrontato.'],
   ['Sage','Non inseguite le copie. Concentratevi sul comandante e sul suo segnale.'],
   ['Jake il Cane','Un’altra volta a combattere contro le facce dei nostri amici. Ne ho abbastanza.']
  ],[
   ['Corvina','Il generale non è altro che un punto di collegamento. Dall’altra parte c’è Echomax.'],
   ['Marceline','E noi sappiamo finalmente come arrivarci.']
  ]]
 ]},
 {name:'Atto VI · L’ultima Resistenza',description:'Vecchi nemici si uniscono agli eroi. I fondatori della Resistenza vengono ritrovati e l’Eco affrontato una volta per tutte.',bg:'bg-black',missions:[
  ['Il nemico del mio nemico',['celljr_1','celljr_2','celljr_3'],['cell'],[
   ['Cell','Che banda patetica. Tutti questi guerrieri e ancora non riuscite a fermare una voce nel buio?'],
   ['Jake il Cane','CELL?! Dopo tutto quello che ci hai fatto?!'],
   ['Cell','Se Echomax controlla ogni anima, non resterà un multiverso che valga la pena dominare.'],
   ['Marceline','Non mi fido di te. Ma se vuoi combattere contro di lui, dimostralo.']
  ],[
   ['Cell','Considerate questa alleanza temporanea. Non scambiatela per amicizia.'],
   ['Bugs Bunny','Eh, il nuovo arrivato mi sembra un tipo molto socievole, doc.']
  ]],
  ['L’errore di Gaster',['gaster','robo_aiutante_2'],['gaster'],[
   ['Gaster','I... l... s... i... g... i... l... l... o... h... a... c... e... d... u... t... o... a... c... a... u... s... a... n... o... s... t... r... a...'],
   ['Sage','È stato lo scontro con Trigon a indebolire la prigione?'],
   ['Gaster','S... ì... P... o... s... s... o... c... o... r... r... e... g... g... e... r... e... l... e... r... r... o... r... e...'],
   ['Cell','Prima dimostraci che non stai già lavorando per Echomax.']
  ],[
   ['Gaster','I... l... d... i... s... p... o... s... i... t... i... v... o... è... p... r... o... n... t... o...'],
   ['Jake il Cane','Ora abbiamo anche Gaster. Mai avrei pensato di dirlo.']
  ]],
  ['L’ultimo inganno di Trigon',['trigon','mostro_scheletrico','clone_corvina'],[],[
   ['Trigon','La Legione non ha bisogno di un corpo. Ogni anima obbediente può diventare la nostra arma.'],
   ['Corvina','Questa è la tua ultima apparizione. Abbiamo trovato come spezzare il legame.'],
   ['Gaster','S... i... g... i... l... l... o... d... i... s... c... o... n... n... e... s... s... i... o... n... e... a... t... t... i... v... o...']
  ],[
   ['Trigon','N... O...!'],
   ['Corvina','È finita. Stavolta non resterà nemmeno la sua ombra.'],
   ['Gaster','I... l... p... a... s... s... a... g... g... i... o... è... a... p... e... r... t... o...']
  ]],
  ['Il prigioniero senza nome',['clone_rosso','finn','clone_verde'],[],[
   ['Jake il Cane','Lo sento. Finn è da qualche parte dietro questa porta.'],
   ['Marceline','Attento. Abbiamo già affrontato una sua copia.'],
   ['Finn l\'Umano','Jake? Se sei davvero tu... non fidarti della mia voce. Trova il nucleo del sigillo!']
  ],[
   ['Jake il Cane','Finn! Questa volta sei davvero tu!'],
   ['Finn l\'Umano','Sì, fratello. Echomax ci ha separati per impedire alla Resistenza di riunirsi.'],
   ['Marceline','Ti abbiamo cercato per mesi, idiota. Non sparire mai più.']
  ]],
  ['La voce della libertà',['topolino','clone_corvina','clone_rosso'],[],[
   ['Topolino','Amici, scappate. L’Eco sta usando la mia voce per dare ordini ai vostri mondi.'],
   ['Finn l\'Umano','Non ti lasceremo qui, Topolino.'],
   ['Sage','Gaster, adesso! Dobbiamo spezzare il collegamento senza ferire chi è prigioniero.'],
   ['Gaster','C... o... l... l... e... g... a... m... e... n... t... o... i... n... t... e... r... r... o... t... t... o...']
  ],[
   ['Topolino','Oh, mamma mia! Siete venuti tutti!'],
   ['Jake il Cane','Ventiquattro eroi. E due fondatori di nuovo liberi.'],
   ['Finn l\'Umano','Adesso andiamo a fermare quell’essere. Per tutti i mondi.']
  ]],
  ['ECHOMAX — Il Dominatore del Multiverso',['echomax'],[],[
   ['Echomax','Cinque secoli ad ascoltare le vostre guerre. La libertà non ha prodotto altro che caos.'],
   ['Topolino','Non puoi chiamare pace un mondo in cui nessuno è libero.'],
   ['Finn l\'Umano','E questa volta non siamo soli! La Resistenza è tornata, più grande di prima!'],
   ['Jake il Cane','Guardati attorno, Echomax. Siamo tutti qui. Tutti e ventiquattro!'],
   ['Marceline','Niente più copie, niente più burattini. Stavolta combatti contro le persone vere.'],
   ['Echomax','Allora ventiquattro anime diventeranno il cuore della mia Legione.']
  ],[
   ['Echomax','I... m... p... o... s... s... i... b... i... l... e... L... a... v... o... l... o... n... t... à...'],
   ['Gaster','I... l... s... i... g... i... l... l... o... è... p... r... o... n... t... o...'],
   ['Cell','Non potrai più usare gli abitanti di questo universo come giocattoli. E sì, mi irrita dovertelo spiegare.'],
   ['Topolino','Amici, avete salvato ancora una volta il multiverso.'],
   ['Finn l\'Umano','Jake! Marceline! Siete stati voi a tenere insieme la Resistenza. Grazie.'],
   ['Marceline','Bene. Adesso qualcuno mi deve almeno sei mesi di vacanze.'],
   ['Jake il Cane','E una cena gigante!']
  ]]
 ]}
];

export const ECHO_CAMPAIGN={
 id:ECHO_ID,title:"L'Eco delle Anime",shortTitle:'Terza Campagna',
 description:"Finn e Topolino sono scomparsi. Jake e Marceline ricostruiscono la Resistenza e sfidano Echomax, l'antico dominatore delle anime.",
 bg:'from-fuchsia-950 via-violet-950 to-black',
 intro:{
   title:"L'Eco delle Anime",subtitle:"Prologo: Il silenzio della Resistenza",
   p1:"Cinquecento anni fa gli dèi sigillarono Echomax, un'entità che voleva trasformare ogni anima in un burattino. Durante la sconfitta di Trigon e Gaster, il sigillo si incrinò. L'essere risvegliò un'eco malvagia dell'anima di Trigon e cominciò a muoversi nell'ombra.",
   p2:"Tre mesi dopo il Torneo Assoluto, Finn e Topolino scompaiono. La vecchia Resistenza è dissolta; Jake e Marceline devono trovare i superstiti, liberare le anime catturate e scoprire la verità. Nell'ultima battaglia avrai tutti i 24 alleati a disposizione: 6 in campo per volta e 18 riserve, con i normali cambi della campagna."
 },
 sectors:chapters.map((chapter,chapterIdx)=>({
   name:chapter.name,description:chapter.description,bg:chapter.bg,
   missions:chapter.missions.map(([title,boss,unlock,dialogue,postDialogue],stageIdx)=>{
     const number=chapterIdx*6+stageIdx+1;
     const isFinal=number===36;
     return {
       id:'eco_'+String(number).padStart(2,'0'),title,boss,unlock,dialogue:dialogue.map(([s,t])=>({s,t})),
       postDialogue:postDialogue.map(([s,t])=>({s,t})),
       echoMission:true,echoAct:chapterIdx+1,echoNumber:number,
       echoReward:stageIdx===5?'legendaria':unlock.length?'resistenza':'superstite',
       echoFinal:isFinal,forcedRoster:isFinal?[...ECHO_ALLIES]:undefined,forceFieldSize:isFinal?6:undefined
     };
   })
 }))
};
