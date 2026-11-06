// Battute e scene originali, dedicate alle missioni e ai temi di ciascuna
// campagna. Nessun dialogo viene generato a caso; le scene sostengono la
// trama senza cambiare nemici, ricompense, scelta o ordine delle battaglie.
const FIRST_DIALOGUE_BEATS={
  "m1": [
    [
      "Finn l'Umano",
      "Il mare è viola, Patrick parla come un manuale di istruzioni e nessuno risponde alla radio. Mi manca quando l'emergenza era solo un mostro nel bosco."
    ],
    [
      "Topolino",
      "Ha ricordato il tuo nome prima di attaccare. La Frequenza non cancella i ricordi: li imprigiona. È una buona notizia."
    ]
  ],
  "m1_5": [
    [
      "Topolino",
      "Il basso di Marceline sta trasmettendo la stessa nota dei ripetitori. Se la spezziamo, forse spezziamo anche il suo controllo."
    ],
    [
      "Marceline",
      "D'accordo, niente più concerti per un pubblico di cloni. Alla prossima canzone scegliamo noi la scaletta."
    ]
  ],
  "m1_8": [
    [
      "Finn l'Umano",
      "Jake ha ancora il suo solito modo di scusarsi mentre fa un disastro. C'è ancora qualcuno là dentro; non posso arrendermi."
    ],
    [
      "Jake il Cane",
      "La prossima volta che faccio qualcosa di strano, promettimi che mi chiedi prima se sono stato ipnotizzato."
    ]
  ],
  "m2": [
    [
      "Topolino",
      "Il segnale si rafforza vicino al Krusty Krab. Forse Cell sta usando perfino gli impianti audio della città."
    ],
    [
      "Spongebob",
      "Se serve, posso usare il microfono del ristorante per trasmettere il nostro messaggio. Ma niente pubblicità durante la Resistenza!"
    ]
  ],
  "m3": [
    [
      "Finn l'Umano",
      "I rampicanti si muovono seguendo la Frequenza. Non sono le piante a volerci fermare; qualcuno sta urlando ordini attraverso di loro."
    ],
    [
      "Poison Ivy",
      "Ho trovato un seme che non reagisce al segnale. Lo terrò: potrebbe aiutarci a capire come proteggere le altre foreste."
    ]
  ],
  "m4": [
    [
      "Topolino",
      "Queste ombre non sono normali. Si ritirano quando pronunciamo i nomi degli amici di Corvina."
    ],
    [
      "Corvina",
      "Ho sentito che continuavate a chiamarmi. In mezzo al rumore, quella era l'unica voce che non mentiva."
    ]
  ],
  "m5": [
    [
      "Finn l'Umano",
      "La corrente si accende ogni tre battiti. Aspettiamo il momento giusto invece di caricare alla cieca."
    ],
    [
      "Topolino",
      "Il laboratorio ha registrato la Frequenza. Abbiamo una traccia concreta, non soltanto sospetti."
    ]
  ],
  "m6": [
    [
      "Topolino",
      "Due menti geniali e un sistema pieno di trappole. Finn, tu pensa alla porta; io proverò a ragionare con chi c'è dietro."
    ],
    [
      "Finn l'Umano",
      "Ottimo lavoro! E per una volta non abbiamo dovuto tirare un calcio al computer per farlo ragionare."
    ]
  ],
  "m7": [
    [
      "Finn l'Umano",
      "Ogni stanza restituisce una voce diversa. Non seguiremo l'eco: seguiremo le persone."
    ],
    [
      "Topolino",
      "Una delle voci ha pronunciato il nome del prossimo settore. Il nostro nemico sta lasciando indizi senza accorgersene."
    ]
  ],
  "m8": [
    [
      "Topolino",
      "La rabbia è esattamente ciò che il segnale vuole amplificare. Non diamogli un'altra scintilla."
    ],
    [
      "Finn l'Umano",
      "Ha lasciato cadere l'arma quando ha riconosciuto la nostra voce. Si può tornare indietro, anche da qui."
    ]
  ],
  "m9": [
    [
      "Finn l'Umano",
      "Non siamo qui per domare un drago. Siamo qui per capire perché difende una macchina che non conosce."
    ],
    [
      "Topolino",
      "La montagna nasconde un secondo trasmettitore. Adesso sappiamo perché il cielo sopra di noi continua a cambiare colore."
    ]
  ],
  "m10": [
    [
      "Topolino",
      "Chiunque ci attenda dall'altra parte è stato un eroe. Ricordiamolo quando inizierà a combattere."
    ],
    [
      "Finn l'Umano",
      "Il coraggio non scompare solo perché qualcuno ha preso il controllo. Abbiamo appena avuto la prova."
    ]
  ],
  "m11": [
    [
      "Finn l'Umano",
      "Le immagini sono tutte perfette. Troppo perfette. Il vero mondo ha graffi e persone che fanno errori."
    ],
    [
      "Topolino",
      "La proiezione non riesce a imitare le nostre voci quando parliamo insieme. Potremmo usarlo contro Cell."
    ]
  ],
  "m12": [
    [
      "Topolino",
      "La strada per il nucleo non sarà una linea retta. Ho disegnato tre vie di fuga: spero di non averne bisogno."
    ],
    [
      "Finn l'Umano",
      "Siamo ancora qui. E adesso ogni alleato sa che cosa rischiamo quando il segnale raggiunge il massimo."
    ]
  ],
  "m12_5": [
    [
      "Finn l'Umano",
      "Quella Frequenza è tornata dopo che l'avevamo spenta. Cell non sta solo controllando i corpi: sta imparando dai nostri successi."
    ],
    [
      "Topolino",
      "Conserviamo la registrazione di questo secondo impulso. Se cambia ancora, sapremo riconoscerlo prima."
    ]
  ],
  "m13": [
    [
      "Topolino",
      "La magia qui interferisce con i sensori. Affidiamoci ai compagni, non ai numeri sullo schermo."
    ],
    [
      "Finn l'Umano",
      "È la prima volta che vedo il cristallo rispondere al nostro richiamo. Forse non è soltanto un'arma."
    ]
  ],
  "m14": [
    [
      "Finn l'Umano",
      "Se i Titani stanno litigando fra loro, la Frequenza ha scelto il bersaglio perfetto. Dobbiamo ricordare loro perché sono una squadra."
    ],
    [
      "Topolino",
      "Un segnale comune non basta a fare una squadra. Loro hanno scelto di esserlo, e ora lo ricordano."
    ]
  ],
  "m15": [
    [
      "Topolino",
      "Ogni colpo arrivava con un secondo di ritardo, come se due mondi cercassero di occupare lo stesso spazio."
    ],
    [
      "Finn l'Umano",
      "Quando abbiamo combattuto insieme, le due immagini hanno smesso di sovrapporsi. Non può essere una coincidenza."
    ]
  ],
  "m15_5": [
    [
      "Finn l'Umano",
      "C'è qualcuno che resiste al contagio senza il nostro aiuto. Dobbiamo capire come fa, prima che Cell lo scopra."
    ],
    [
      "Topolino",
      "La resistenza sembra aumentare quando gli amici si proteggono a vicenda. Questa scoperta potrebbe salvare altri mondi."
    ]
  ],
  "m16": [
    [
      "Topolino",
      "Non possiamo vincere soltanto con la forza: il ponte potrebbe crollare sotto i nostri piedi."
    ],
    [
      "Finn l'Umano",
      "Sì, certo... userò meno forza. Ma ammetto che vedere quei due fermarsi ha fatto un certo effetto."
    ]
  ],
  "m17": [
    [
      "Finn l'Umano",
      "Sento odore di fumo. E di ravioli. Non so quale dei due mi preoccupi di più."
    ],
    [
      "Topolino",
      "Il fuoco ha cancellato una parte della Frequenza sulle pareti. Potremmo sfruttare l'interferenza."
    ]
  ],
  "m17_5": [
    [
      "Topolino",
      "Questi cloni hanno le stesse cicatrici e gli stessi movimenti, ma non si ricordano nessuna promessa."
    ],
    [
      "Finn l'Umano",
      "Quindi non dobbiamo giudicarli dal volto. Un amico è qualcuno che ricorda anche i momenti difficili."
    ]
  ],
  "m18": [
    [
      "Finn l'Umano",
      "Vanno troppo veloci per inseguirli. Aspettiamo che sia il percorso a portarli da noi."
    ],
    [
      "Topolino",
      "Abbiamo recuperato la mappa della rete. Le linee rosse conducono tutte verso il centro del Varco."
    ]
  ],
  "m19": [
    [
      "Topolino",
      "La roccia assorbe il segnale meglio del metallo. Se dovessimo fermarci, questo settore potrebbe diventare un rifugio."
    ],
    [
      "Finn l'Umano",
      "Finalmente una buona notizia: abbiamo trovato un posto dove dormire senza sentirci osservati."
    ]
  ],
  "m20": [
    [
      "Finn l'Umano",
      "Quei mostri non hanno scelto di trovarsi qui. Non confondiamo un ordine con una volontà."
    ],
    [
      "Topolino",
      "La fonte del comando è vicina. Quando li abbiamo liberati, il segnale si è indebolito per qualche istante."
    ]
  ],
  "m20_5": [
    [
      "Topolino",
      "La magia del libro risponde a chi lo legge, non a chi grida più forte. Potrebbe essere la differenza decisiva."
    ],
    [
      "Finn l'Umano",
      "Adesso capisco: la fiducia non si può programmare. Cell continua a fare lo stesso errore."
    ]
  ],
  "m21": [
    [
      "Finn l'Umano",
      "Il ghiaccio sta crescendo anche sulle superfici calde. Il Varco sta cambiando le regole dei mondi."
    ],
    [
      "Topolino",
      "Ho segnato il percorso delle crepe. Se il cielo si spezza ancora, sapremo dove intervenire."
    ]
  ],
  "m22": [
    [
      "Topolino",
      "La neve copre le impronte, ma non i rumori. Restiamo vicini e ascoltiamo."
    ],
    [
      "Finn l'Umano",
      "Ho imparato una cosa: contro il gelo ci vogliono amici, un piano e calze davvero buone."
    ]
  ],
  "m23": [
    [
      "Finn l'Umano",
      "Un'altra foresta malata. Promettiamo che torneremo anche dopo la battaglia, non solo per prendere il prossimo indizio."
    ],
    [
      "Topolino",
      "Abbiamo salvato le radici, non soltanto la strada. Ivy sarà contenta di saperlo."
    ]
  ],
  "m24": [
    [
      "Topolino",
      "Se svegliamo il gigante nel momento sbagliato, potrebbe distruggere la via per i rifugiati."
    ],
    [
      "Finn l'Umano",
      "Siamo riusciti a passare senza sacrificare il ponte. Per me questa è una vittoria grande il doppio."
    ]
  ],
  "m25": [
    [
      "Finn l'Umano",
      "Il cielo sembra guardarci. Non so come si combatte una follia cosmica, ma so perché dobbiamo farlo."
    ],
    [
      "Topolino",
      "Quella luce è un'altra finestra sul nucleo. Ogni finestra aperta ci avvicina alla verità."
    ]
  ],
  "m26": [
    [
      "Topolino",
      "Lo sciame segue le ombre invece della luce. Gli ordini arrivano da sotto il terreno."
    ],
    [
      "Finn l'Umano",
      "Abbiamo trovato una vecchia stazione. Se è collegata al Varco, potremo interrompere gli ordini da qui."
    ]
  ],
  "m26_5": [
    [
      "Finn l'Umano",
      "Quel ricordo non è mio... eppure conosco già la risposta. Qualcuno sta mescolando le nostre storie."
    ],
    [
      "Topolino",
      "Ho conservato il messaggio prima che sparisse. Non siamo gli unici a osservare il tempo."
    ]
  ],
  "m27": [
    [
      "Topolino",
      "Le piante stanno difendendo i macchinari invece delle loro radici. È un altro segno della corruzione."
    ],
    [
      "Finn l'Umano",
      "Spero che un giorno qui crescano soltanto alberi e non antenne. Sarebbe molto più bello."
    ]
  ],
  "m28": [
    [
      "Finn l'Umano",
      "Per un momento ho sentito la voce di Jake chiedermi di tornare indietro. Ma Jake non mi chiederebbe mai di abbandonarvi."
    ],
    [
      "Topolino",
      "Era una registrazione costruita per dividerci. Non ha funzionato: questa volta conosciamo il trucco."
    ]
  ],
  "m29": [
    [
      "Topolino",
      "L'acqua porta il segnale molto più lontano. Se blocchiamo la corrente, possiamo proteggere le città sulla costa."
    ],
    [
      "Finn l'Umano",
      "Ci siamo riusciti. E questa volta non serve asciugarci per festeggiare... anzi, sì, decisamente."
    ]
  ],
  "m30": [
    [
      "Finn l'Umano",
      "Ogni porta che apriamo nasconde un'altra stanza. Qualcuno ci sta preparando un percorso."
    ],
    [
      "Topolino",
      "Ho trovato la firma del progettista. È la stessa della macchina che ha dato inizio all'Eclissi."
    ]
  ],
  "m30_5": [
    [
      "Topolino",
      "Non chiamatela una ricaduta casuale: il segnale ha cambiato frequenza proprio dopo la nostra vittoria."
    ],
    [
      "Finn l'Umano",
      "Allora lo faremo anche noi: cambieremo strategia. Non imparerà mai a prevederci tutti."
    ]
  ],
  "m31": [
    [
      "Finn l'Umano",
      "Questo posto sembra una giostra costruita da qualcuno che odia le persone felici."
    ],
    [
      "Topolino",
      "Eppure la macchina ha un punto cieco. La prossima volta che gira, passeremo di lì."
    ]
  ],
  "m32": [
    [
      "Topolino",
      "Chi ci osserva conosce le nostre tecniche. Dobbiamo fare qualcosa che non sia scritto in nessun manuale."
    ],
    [
      "Finn l'Umano",
      "Una strategia improvvisata può funzionare, purché tutti sappiano dove sono gli amici."
    ]
  ],
  "m33": [
    [
      "Finn l'Umano",
      "La nebbia nasconde anche il suono dei passi. Non perdiamo il contatto con gli altri."
    ],
    [
      "Topolino",
      "Abbiamo trovato un faro funzionante. Finalmente possiamo guidare al sicuro chi arriva dal Varco."
    ]
  ],
  "m34": [
    [
      "Topolino",
      "Quell'insegna è stata spenta di proposito. Qualcuno non vuole che vediamo il prossimo passaggio."
    ],
    [
      "Finn l'Umano",
      "L'abbiamo riaccesa. E stavolta saremo noi a decidere quale strada prendere."
    ]
  ],
  "m34_5": [
    [
      "Finn l'Umano",
      "Una voce dice che non possiamo vincere. È curioso come i nemici parlino sempre così tanto quando hanno paura."
    ],
    [
      "Topolino",
      "La voce è stata intercettata. Il nucleo è più vicino di quanto pensassimo."
    ]
  ],
  "m35": [
    [
      "Topolino",
      "Questi non sono semplici guardiani. Sono gli ultimi a poter chiudere il Varco alle nostre spalle."
    ],
    [
      "Finn l'Umano",
      "Abbiamo mantenuto aperta la strada per gli altri. Se domani vinciamo, ci arriveremo insieme."
    ]
  ],
  "m36": [
    [
      "Finn l'Umano",
      "Mi tremano le mani. Non perché voglio scappare, ma perché so quante persone contano su di noi."
    ],
    [
      "Topolino",
      "Essere coraggiosi non significa smettere di avere paura. Significa scegliere comunque di aiutare."
    ]
  ],
  "m37": [
    [
      "Topolino",
      "Cell continua a chiamare perfetto tutto ciò che non può disobbedirgli. Noi abbiamo amici che dicono anche di no."
    ],
    [
      "Finn l'Umano",
      "E sono proprio quelli che oggi ci hanno salvato. Cell non ha capito che cos'è una squadra."
    ]
  ],
  "m38": [
    [
      "Finn l'Umano",
      "Non possiamo permetterci di perdere il nucleo. Prima liberiamo i prigionieri, poi chiudiamo la strada ai boss."
    ],
    [
      "Topolino",
      "La Frequenza si sta spegnendo, ma resta una vibrazione nel Varco. Conserviamo i dati: potremmo averne ancora bisogno."
    ]
  ]
};
const ECHO_DIALOGUE_BEATS={
  "1": [
    [
      "Marceline",
      "Quel messaggio interrotto era pieno di rumore, ma sotto si sente il passo di Finn. È passato di qui."
    ],
    [
      "Jake il Cane",
      "Ho messo la sua giacca al sicuro. Non è una prova scientifica, ma per me significa che tornerà."
    ]
  ],
  "2": [
    [
      "Jake il Cane",
      "Se quella ragazza ci supera di corsa, forse possiamo almeno farle da segnaletica vivente."
    ],
    [
      "Neon",
      "Non sono brava a ringraziare restando ferma. Quindi grazie, adesso muoviamoci!"
    ]
  ],
  "3": [
    [
      "Marceline",
      "Le loro voci arrivano in ritardo rispetto ai pensieri. Echomax sta copiando anche le paure."
    ],
    [
      "Sage",
      "Ho scritto i nomi di tutti i pazienti. Non lasceremo che il silenzio cancelli chi sono."
    ]
  ],
  "4": [
    [
      "Jake il Cane",
      "Se questo è un controllo sanitario, abbiamo dimenticato di prendere un numerino."
    ],
    [
      "Marceline",
      "Non è una malattia. E qualcuno vuole che sembri tale per tenerci lontani."
    ]
  ],
  "5": [
    [
      "Marceline",
      "Vedi quel segno sul muro? È il codice di chi sa nascondere una via d'uscita."
    ],
    [
      "Jake il Cane",
      "Allora abbiamo degli amici che lasciano indizi. Comincio a preferire questa città."
    ]
  ],
  "6": [
    [
      "Sage",
      "Il segnale si interrompe ogni volta che qualcuno pronuncia il proprio nome."
    ],
    [
      "Marceline",
      "Lo chiamano Custode del Silenzio. Oggi gli abbiamo ricordato che una voce può ancora scegliere."
    ]
  ],
  "7": [
    [
      "Jake il Cane",
      "Un coniglio che fa battute durante un inseguimento? Per la prima volta mi sembra una giornata normale."
    ],
    [
      "Bugs Bunny",
      "Quando l'universo impazzisce, l'importante è non perdere il senso del ritmo, doc."
    ]
  ],
  "8": [
    [
      "Marceline",
      "Il loro litigio copre perfino il rumore dei droni. È fastidioso, ma potrebbe salvarci."
    ],
    [
      "Daffy Duck",
      "Vorrei che si mettesse agli atti che ho salvato la situazione con una performance impeccabile."
    ]
  ],
  "9": [
    [
      "Jake il Cane",
      "La casa di Gumball è rimasta intatta. È la parte più sospetta di questa faccenda."
    ],
    [
      "Marceline",
      "Se il ricordo di una famiglia è diventato un'esca, vuol dire che il nostro nemico sa dove colpire."
    ]
  ],
  "10": [
    [
      "Marceline",
      "Una madre arrabbiata può fare più paura di un esercito. Spero che sia dalla nostra parte."
    ],
    [
      "Nicole Watterson",
      "Non sono qui per fare l'eroina. Sono qui perché nessuno userà i miei figli come minaccia."
    ]
  ],
  "11": [
    [
      "Jake il Cane",
      "Le voci alla radio danno ordini perfino a chi sta dormendo. Dobbiamo trovare l'emittente."
    ],
    [
      "Sage",
      "Ho raccolto i dati dei superstiti: rispondono meglio quando sentono una voce familiare."
    ]
  ],
  "12": [
    [
      "Marceline",
      "La maschera dice una cosa, il corpo un'altra. Qualcuno gli ha messo in bocca parole non sue."
    ],
    [
      "Jake il Cane",
      "Ehi, io conosco il trucco dei pupazzi parlanti. Di solito non serve a comandare una città."
    ]
  ],
  "13": [
    [
      "Sage",
      "Qui le maree cambiano insieme agli impulsi dell'Eco. Anche l'acqua è diventata un messaggero."
    ],
    [
      "Marceline",
      "Ne abbiamo fermato una parte. Il resto del messaggio arriverà al prossimo regno."
    ]
  ],
  "14": [
    [
      "Jake il Cane",
      "Quel libro brilla ogni volta che il ragazzo sceglie di non scappare."
    ],
    [
      "Marceline",
      "Il coraggio non ha bisogno di amplificatori. Speriamo che Echomax non se ne accorga."
    ]
  ],
  "15": [
    [
      "Marceline",
      "Non scambiare la sua oscurità per obbedienza. Sta lottando per decidere da solo."
    ],
    [
      "Jake il Cane",
      "Ha detto sì con l'aria di chi avrebbe preferito dire niente. Lo considero un progresso."
    ]
  ],
  "16": [
    [
      "Jake il Cane",
      "Se ci attacca come un drago, io posso diventare un drago più grande. Non è un piano perfetto, ma è un piano."
    ],
    [
      "Marceline",
      "La sua forza non appartiene all'Eco. Adesso ricordiamo tutti perché la difende."
    ]
  ],
  "17": [
    [
      "Marceline",
      "Le catene sono fatte di promesse non mantenute. Che idea crudele trasformarle in una prigione."
    ],
    [
      "Jake il Cane",
      "Allora facciamo la promessa giusta: nessuno resta qui da solo."
    ]
  ],
  "18": [
    [
      "Sage",
      "Il Re delle Catene protegge una porta, non un tesoro. Dietro potrebbe esserci la prima sorgente del segnale."
    ],
    [
      "Marceline",
      "La porta si è aperta, ma la stanza è vuota. Echomax ci sta facendo aspettare di proposito."
    ]
  ],
  "19": [
    [
      "Marceline",
      "Perla continua a ripetere un ordine che non riconosce. Non è una sua decisione."
    ],
    [
      "Jake il Cane",
      "L'abbiamo sentita ridere, finalmente. È una buona ricompensa per una brutta giornata."
    ]
  ],
  "20": [
    [
      "Sage",
      "Ho visto tre possibilità per il domani. In tutte compare la stessa torre."
    ],
    [
      "Marceline",
      "Non c'è un destino già scritto. Al massimo c'è una torre da buttare giù con un buon piano."
    ]
  ],
  "21": [
    [
      "Jake il Cane",
      "Robin ha trasformato i superstiti in una squadra senza neanche chiedere come si chiamavano."
    ],
    [
      "Robin",
      "Non voglio comandare nessuno. Voglio soltanto che tutti abbiano una possibilità di tornare a casa."
    ]
  ],
  "22": [
    [
      "Marceline",
      "L'oscurità attorno a Corvina è diversa. È spaventata, e qualcuno sta usando quella paura."
    ],
    [
      "Corvina",
      "La mia magia non è una porta che Echomax può aprire a suo piacimento. Glielo dimostreremo."
    ]
  ],
  "23": [
    [
      "Jake il Cane",
      "Ogni volta che ci avviciniamo, quel ragazzo scompare dalla fotografia. Forse qualcuno lo sta cancellando."
    ],
    [
      "Marceline",
      "Ho conservato l'immagine originale. Se proveranno a riscrivere la storia, avremo una prova."
    ]
  ],
  "24": [
    [
      "Corvina",
      "Quella voce non è soltanto di Trigon. Qualcosa di più lontano sta parlando attraverso di lui."
    ],
    [
      "Marceline",
      "Echomax non controlla tutti allo stesso modo. Il legame con Trigon potrebbe essere la sua debolezza."
    ]
  ],
  "25": [
    [
      "Jake il Cane",
      "Vedo stelle che cadono e porte che si chiudono. Questa notte non finirà con una semplice fuga."
    ],
    [
      "Marceline",
      "Abbiamo aperto un corridoio per gli sfollati. Nessuna battaglia vale più delle persone che abbiamo salvato."
    ]
  ],
  "26": [
    [
      "Robin",
      "Bumblebee, dammi tre secondi per spiegare il piano. Tre."
    ],
    [
      "Bumblebee",
      "Ne ho usati due per eseguirlo. Il terzo te lo restituisco."
    ]
  ],
  "27": [
    [
      "Marceline",
      "Sento una melodia che non ho scritto. Vuole convincermi che abbiamo già perso."
    ],
    [
      "Ember McLain",
      "Allora cambiamo accordi. La nostra canzone non sarà mai un ordine."
    ]
  ],
  "28": [
    [
      "Robin",
      "Dividiamoci i corridoi, ma non interrompiamo le comunicazioni. Il silenzio è la loro arma."
    ],
    [
      "Sage",
      "La Resistenza tiene. Ho contato tutti i superstiti: non ne abbiamo dimenticato nessuno."
    ]
  ],
  "29": [
    [
      "Jake il Cane",
      "Topolino? Quella voce è uguale alla sua, ma mi dice di voltarmi dall'altra parte."
    ],
    [
      "Marceline",
      "Non ascoltare il comando. Ascolta ciò che lui direbbe davvero a un amico."
    ]
  ],
  "30": [
    [
      "Robin",
      "Il Generale non sta proteggendo la torre. Sta coprendo la ritirata di qualcos'altro."
    ],
    [
      "Marceline",
      "Abbiamo trovato chi lasciava ordini dietro gli ordini. Ora so a chi voglio fare una domanda."
    ]
  ],
  "31": [
    [
      "Cell",
      "Non confondete questa alleanza con una resa. Sono qui perché nessuno deve scegliere al posto mio."
    ],
    [
      "Jake il Cane",
      "È il discorso più gentile che abbia sentito fare a Cell. Lo prendiamo come un sì."
    ]
  ],
  "32": [
    [
      "Gaster",
      "L...a... m...a...c...c...h...i...n...a... n...o...n... d...o...v...e...v...a... a...p...r...i...r...s...i..."
    ],
    [
      "Marceline",
      "Per la prima volta Gaster ha ammesso un errore. E per la prima volta siamo più vicini al cuore dell'Eco."
    ]
  ],
  "33": [
    [
      "Corvina",
      "Trigon non ci sta tendendo una trappola soltanto per ferirci. Vuole metterci l'uno contro l'altro."
    ],
    [
      "Robin",
      "La trappola è fallita. Non perché siamo perfetti, ma perché siamo rimasti insieme."
    ]
  ],
  "34": [
    [
      "Jake il Cane",
      "Se quello è davvero Finn, saprà completare la nostra battuta peggiore."
    ],
    [
      "Finn l'Umano",
      "La battuta era terribile. Ed è esattamente per questo che mi è mancata."
    ]
  ],
  "35": [
    [
      "Topolino",
      "La mia voce è stata usata per mentire. Adesso voglio che sia la prima a dire la verità ai mondi."
    ],
    [
      "Marceline",
      "I ripetitori sono nostri. Anche chi è lontano potrà sentire che non è finita."
    ]
  ],
  "36": [
    [
      "Jake il Cane",
      "Non serve sembrare senza paura. Ho paura anch'io. Ma guardate quanti siamo diventati."
    ],
    [
      "Marceline",
      "Quando torniamo a casa, nessuno dovrà chiedere se la Resistenza è esistita. Guarderà chi è tornato."
    ]
  ]
};
const FIRST_EXTENDED_SCENES={
  "m1": {
    "before": [
      [
        "Topolino",
        "Se riusciamo a liberarlo senza distruggere il ripetitore, potremo studiarlo. Niente mosse avventate."
      ]
    ]
  },
  "m12_5": {
    "after": [
      [
        "Finn l'Umano",
        "Non distruggerò il registratore: ci servirà se Cell proverà la stessa cosa altrove."
      ]
    ]
  },
  "m15_5": {
    "before": [
      [
        "Topolino",
        "E se la chiave non fosse un oggetto, ma qualcuno disposto a resistere per un amico?"
      ]
    ]
  },
  "m26_5": {
    "after": [
      [
        "Finn l'Umano",
        "Sento che siamo vicini a qualcosa di enorme. Una storia che non abbiamo ancora raccontato."
      ]
    ]
  },
  "m35": {
    "before": [
      [
        "Finn l'Umano",
        "Se uno di noi resta indietro, gli altri continuano? No. Troviamo un piano che non lasci indietro nessuno."
      ]
    ]
  },
  "m37": {
    "before": [
      [
        "Topolino",
        "Ci ha privato di interi mondi. Non permettergli anche di convincerci che sono irrecuperabili."
      ]
    ]
  },
  "m38": {
    "after": [
      [
        "Finn l'Umano",
        "Siamo sopravvissuti all'ultima battaglia, ma quella vibrazione è ancora lì. Non chiamerò vittoria qualcosa che non abbiamo capito."
      ],
      [
        "Topolino",
        "Custodiremo il Varco. Non è soltanto una porta: è una promessa a chi abbiamo liberato."
      ]
    ]
  }
};
const ECHO_EXTENDED_SCENES={
  "1": {
    "before": [
      [
        "Jake il Cane",
        "Ho preparato una mappa, una borraccia e tre panini. Due panini. Uno non ha superato il viaggio."
      ]
    ]
  },
  "6": {
    "after": [
      [
        "Sage",
        "I pazienti hanno iniziato a pronunciare i loro nomi. È il primo vero passo verso il ritorno."
      ]
    ]
  },
  "12": {
    "after": [
      [
        "Marceline",
        "Il pupazzo sapeva cose che non avremmo dovuto raccontare a nessuno. Qualcuno ci ascolta da molto prima di oggi."
      ]
    ]
  },
  "18": {
    "after": [
      [
        "Sage",
        "La torre che ho visto nelle visioni è proprio oltre questo passaggio. Non siamo più alla ricerca di un'ipotesi."
      ]
    ]
  },
  "21": {
    "before": [
      [
        "Marceline",
        "Non ci servono altri ordini. Ci servono persone che sappiano anche dire di no. Robin sembra capirlo."
      ]
    ]
  },
  "24": {
    "after": [
      [
        "Corvina",
        "Sento ancora la sua presenza, ma adesso so distinguere la voce di mio padre da quella del suo carceriere."
      ]
    ]
  },
  "28": {
    "before": [
      [
        "Jake il Cane",
        "Ci hanno circondati, sì. Ma quando saremo usciti da qui, qualcuno dovrà occuparsi dei feriti."
      ]
    ]
  },
  "31": {
    "before": [
      [
        "Marceline",
        "Non mi fido di Cell. Ma mi fido ancora meno di un universo in cui nessuno può cambiare idea."
      ]
    ]
  },
  "32": {
    "after": [
      [
        "Sage",
        "Quel frammento di codice contiene il primo messaggio inviato da Echomax. Non voleva pace: voleva obbedienza."
      ]
    ]
  },
  "34": {
    "after": [
      [
        "Marceline",
        "Non gli dirò ancora cosa abbiamo passato. Gli prepareremo un posto a tavola, poi avremo tutto il tempo."
      ]
    ]
  },
  "35": {
    "after": [
      [
        "Topolino",
        "Il mio segnale non comanderà nessuno. Dirà soltanto dove ci troviamo e chiederà a chi vuole di unirsi."
      ]
    ]
  },
  "36": {
    "before": [
      [
        "Finn l'Umano",
        "Se c'è una cosa che tutti i mondi ci hanno insegnato, è che le squadre più strane possono diventare una famiglia."
      ]
    ],
    "after": [
      [
        "Sage",
        "Le trasmissioni sono tornate. Sento nomi, risate, litigi... Finalmente, nessuno parla più con una voce sola."
      ],
      [
        "Robin",
        "Il prossimo ordine che darò sarà semplice: tornate a casa. E riposatevi."
      ]
    ]
  }
};

const injected=new Set();
function addNarrativeBeat(mission,entry,extra,scope){
  if(!mission || !entry || injected.has(scope+':'+mission.id))return;
  injected.add(scope+':'+mission.id);
  const intro=[{s:entry[0][0],t:entry[0][1]},
    ...(extra?.before||[]).map(([s,t])=>({s,t}))];
  const outro=[{s:entry[1][0],t:entry[1][1]},
    ...(extra?.after||[]).map(([s,t])=>({s,t}))];
  // Prima della frase conclusiva di preparazione al combattimento:
  // l'ultima frase originale resta il segnale della sfida.
  const opening=Array.isArray(mission.dialogue)?mission.dialogue:[];
  opening.splice(Math.max(0,opening.length-1),0,...intro);
  mission.dialogue=opening;
  // Le reazioni seguono le battute già esistenti della missione e lasciano
  // un piccolo filo narrativo collegato alla tappa successiva.
  mission.postDialogue=[...(mission.postDialogue||[]),...outro];
}

export function enrichFirstCampaign(campaign){
  if(campaign?.id!=='crisi_varco')return campaign;
  for(const sector of campaign.sectors||[])
    for(const mission of sector.missions||[])
      addNarrativeBeat(mission,FIRST_DIALOGUE_BEATS[mission.id],
        FIRST_EXTENDED_SCENES[mission.id],'first');
  return campaign;
}
export function enrichEchoCampaign(campaign){
  if(campaign?.id!=='eco_anime')return campaign;
  for(const sector of campaign.sectors||[])
    for(const mission of sector.missions||[]){
      const n=Number(mission.echoNumber||mission.id?.split('_')[1]);
      addNarrativeBeat(mission,ECHO_DIALOGUE_BEATS[n],
        ECHO_EXTENDED_SCENES[n],'echo');
    }
  return campaign;
}
