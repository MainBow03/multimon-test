export const CAMPAIGNS = [
          {
            id: 'crisi_varco',
            title: "La Crisi del Varco Corrotto",
            shortTitle: "Campagna Principale",
            description: "Cell Perfetto ha fuso le dimensioni e controllato la mente degli eroi. Raduna la Resistenza e sconfiggilo!",
            bg: "from-emerald-900 to-slate-950",
            intro: {
                title: "La Crisi del Varco Corrotto",
                subtitle: "Prologo: L'Eclissi di Cell",
                p1: "Un'entità proveniente da un futuro distorto, Cell Perfetto (Corrotto), ha utilizzato una tecnologia rubata per fondere le dimensioni.",
                p2: "Ha emesso una 'Frequenza di Sottomissione' che ha lavato il cervello al 90% degli eroi, trasformandoli nei suoi Burattini Perfetti. Solo Finn l'Umano e Topolino sono sfuggiti. Ora devono formare la Resistenza Finale!"
            },
            sectors: [
            {
              name: "Settore 1: L'Atollo Post-Apocalittico",
              description: "Una fusione tra Bikini Bottom e le Terre di Ooo. Oceano viola radioattivo.",
              bg: "bg-purple-950",
              missions: [
                {
                  id: 'm1', title: 'Amici o Nemici?',
                  dialogue: [
                    { s: "Finn l'Umano", t: "Patrick! Spongebob! Siete qui? È tutto così... viola." },
                    { s: "Patrick Stella (Corrotto)", t: "Il Grande Occhio dice che non siete pronti per la Perfezione! Vi schiaccerò con la mia stella!" },
                    { s: "Finn l'Umano", t: "Patrick, amico mio, quello non è un occhio, è solo Cell con un filtro Instagram cattivo! Svegliati!" },
                    { s: "Topolino", t: "È sotto controllo mentale, Finn. Dobbiamo combattere per liberarlo!" }
                  ],
                  postDialogue: [
                    { s: "Patrick Stella", t: "Ugh... la mia testa. C'era un tizio insetto gigante che mi diceva di schiacciare tutto..." },
                    { s: "Finn l'Umano", t: "Bentornato tra noi, Patrick! L'incantesimo della Frequenza è svanito." },
                    { s: "Patrick Stella", t: "Nessuno comanda a bacchetta la mia mente... soprattutto perché dentro c'è un sacco di spazio vuoto! Sono dei vostri!" }
                  ],
                  boss: ['patrick'],
                  unlock: ['patrick']
                },
                {
                  id: 'm1_5', title: 'Canzoni nell\'Ombra',
                  dialogue: [
                    { s: "Marceline (Corrotta)", t: "Tutto questo... rosso. Non è abbastanza. Il Maestro desidera che io prosciughi ogni sfumatura di colore da questo mondo." },
                    { s: "Topolino", t: "Oh mamma! Una vampira con un basso-ascia? Questo multiverso diventa sempre più spaventoso!" }
                  ],
                  postDialogue: [
                    { s: "Marceline", t: "Bleah... che saporaccio aveva quella Frequenza oscura. Mi sento come se avessi bevuto colore rosso finto." },
                    { s: "Finn l'Umano", t: "Marceline! Stai bene! Abbiamo bisogno del tuo basso per spaccare i timpani a Cell!" },
                    { s: "Marceline", t: "Ci sto, eroe. Ma guido io." }
                  ],
                  boss: ['marceline'],
                  unlock: ['marceline']
                },
                {
                  id: 'm1_8', title: 'Il Migliore Amico',
                  dialogue: [
                    { s: "Jake il Cane (Corrotto)", t: "Amico... la Frequenza dice che devo stritolarvi diventando un labirinto gigante... sigh, scusa Finn." },
                    { s: "Topolino", t: "Attento Finn, il tuo amico può trasformarsi in qualsiasi cosa! Dobbiamo fare attenzione ai pugni elastici!" }
                  ],
                  postDialogue: [
                    { s: "Jake il Cane", t: "Ohi, la mia testa! Mi sento come un pancake bruciato... amico, menomale che mi hai suonato di santa ragione!" },
                    { s: "Finn l'Umano", t: "Non ti avrei mai lasciato indietro, fratello! Ora andiamo a prendere a calci nel sedere chi ti ha fatto questo." },
                    { s: "Jake il Cane", t: "Oh yeah! È l'ora dell'avventura!" }
                  ],
                  boss: ['jake'],
                  unlock: ['jake']
                },
                {
                  id: 'm2', title: 'Rompere la Bolla',
                  dialogue: [
                    { s: "Spongebob (Corrotto)", t: "Siete qui per scoppiare le mie bolle perfette? Non ve lo permetterò!" },
                    { s: "Topolino", t: "Spongebob, la tua risata è scomparsa... ma la ritroveremo!" }
                  ],
                  postDialogue: [
                    { s: "Spongebob", t: "Ragazzi! Ho fatto un incubo orribile dove il Krusty Krab serviva panini grigi e insipidi!" },
                    { s: "Topolino", t: "È tutto finito, Spongebob. Abbiamo bisogno della tua spugnosità per salvare il multiverso!" }
                  ],
                  boss: ['spongebob'],
                  unlock: ['spongebob']
                }
              ]
            },
            {
              name: "Settore 2: Le Ombre di Gotham City",
              description: "Gotham infestata da piante giganti e magia oscura.",
              bg: "bg-emerald-950",
              missions: [
                {
                  id: 'm3', title: 'Radici del Male',
                  dialogue: [
                    { s: "Poison Ivy", t: "Il verde di questo mondo ora appartiene alla Perfezione." },
                    { s: "Finn l'Umano", t: "Le tue piante hanno un pessimo aspetto, Ivy!" }
                  ],
                  postDialogue: [
                    { s: "Poison Ivy", t: "Le mie povere piante... quella Frequenza oscura le faceva marcire dall'interno." },
                    { s: "Finn l'Umano", t: "Ora sei libera. Ci aiuterai a fermare questa pazzia?" },
                    { s: "Poison Ivy", t: "Solo per proteggere il Verde. Non fateci l'abitudine." }
                  ],
                  boss: ['poisonivy'],
                  unlock: ['poisonivy']
                },
                {
                  id: 'm4', title: 'Il Canto della Notte',
                  dialogue: [
                    { s: "Corvina (Corrotta)", t: "Azarath Metrion... Zinthos... Tutto è oscurità." },
                    { s: "Patrick Stella", t: "Ehi, mi piace quel trucchetto del mantello!" }
                  ],
                  postDialogue: [
                    { s: "Corvina", t: "L'oscurità di Cell... era disgustosa. Perfino peggio di mio padre." },
                    { s: "Topolino", t: "Siamo felici di riaverti con noi, Corvina. Insieme siamo imbattibili!" }
                  ],
                  boss: ['corvina'],
                  unlock: ['corvina']
                }
              ]
            },
            {
              name: "Settore 3: Il Cyber-Laboratorio",
              description: "Una metropoli iper-tecnologica dove Cell amplifica il suo segnale.",
              bg: "bg-cyan-950",
              missions: [
                {
                  id: 'm5', title: 'Cuore d\'Acciaio',
                  dialogue: [
                    { s: "Cyborg (Corrotto)", t: "Sistemi riavviati. Direttiva: Eliminare la Resistenza. Booyah... letale." },
                    { s: "Corvina", t: "Hanno hackerato i suoi sistemi cibernetici. Dobbiamo mandarlo in cortocircuito!" }
                  ],
                  postDialogue: [
                    { s: "Cyborg", t: "Whoa, ragazzi! Ho un mal di testa pazzesco nei miei circuiti." },
                    { s: "Topolino", t: "Tutto a posto, amico. Il virus mentale di Cell è stato debellato!" },
                    { s: "Cyborg", t: "Ottimo. È ora di restituirgli il favore a suon di Cannoni Sonici. Booyah!" }
                  ],
                  boss: ['cyborg'],
                  unlock: ['cyborg']
                },
                {
                  id: 'm6', title: 'Menti Geniali, Piani Malvagi',
                  dialogue: [
                    { s: "Stewie (Corrotto)", t: "Maledetti insolenti! I miei laser sono calibrati sulla Perfezione assoluta!" },
                    { s: "Plankton (Corrotto)", t: "E finalmente avrò la ricetta segreta! Ah no aspetta, la direttiva dice di distruggervi." },
                    { s: "Spongebob", t: "Plankton! Lascia stare la ricetta e affrontaci da vero mollusco!" }
                  ],
                  postDialogue: [
                    { s: "Stewie", t: "Cosa diavolo... mi sono fatto comandare da uno scarafaggio gigante? Che umiliazione." },
                    { s: "Cyborg", t: "Benvenuto nel club dei liberati, tappo. Ci aiuti o torni a giocare con i pupazzi?" }
                  ],
                  boss: ['stewie', 'plankton'],
                  choiceUnlock: ['stewie', 'plankton'],
                  choiceDialogues: {
                    'stewie': [
                        { s: "Stewie", t: "Ottima scelta. Quel microbo con un occhio solo mi stava già facendo venire l'orticaria." },
                        { s: "Plankton", t: "COSA?! Preferite un poppante col testone al mio puro genio del male?! Karen, andiamo via, questa Resistenza non mi merita!" }
                    ],
                    'plankton': [
                        { s: "Plankton", t: "Ah! Finalmente qualcuno che sa apprezzare un intelletto superiore! Vi guiderò alla vittoria!" },
                        { s: "Stewie", t: "Tsk. Peggio per voi. Torno nel mio universo, Brian deve aver sicuramente fatto un disastro sul tappeto." }
                    ]
                  }
                }
              ]
            },
            {
              name: "Settore 4: Gli Inferi Fusi",
              description: "Il regno dei morti e la terra degli Dei della Guerra uniti in un paesaggio di fuoco e spiriti.",
              bg: "bg-red-950",
              missions: [
                {
                  id: 'm7', title: 'Spiriti Inquieti',
                  dialogue: [
                    { s: "Danny Phantom (Corrotto)", t: "Io diventerò il fantasma più forte al servizio di Cell..." },
                    { s: "Re Boo (Corrotto)", t: "Mwa ha ha! I vostri ritratti staranno benissimo nella mia galleria perfetta!" },
                    { s: "Finn l'Umano", t: "Fantasmi... odio i fantasmi! Ma non mi tirerò indietro." }
                  ],
                  postDialogue: [
                    { s: "Danny Phantom", t: "Ahhh! Quella presenza nella mia testa... era agghiacciante." },
                    { s: "Topolino", t: "Il vostro lato oscuro è svanito! Abbiamo bisogno di voi!" }
                  ],
                  boss: ['dannyphantom', 'reboo'],
                  choiceUnlock: ['dannyphantom', 'reboo'],
                  choiceDialogues: {
                    'dannyphantom': [
                        { s: "Danny Phantom", t: "Sono pronto a combattere. Quell'insetto pagherà per avermi controllato!" },
                        { s: "Re Boo", t: "Fools! I miei ritratti aspetteranno... mi ritiro nell'ombra della mia villa! Bwahaha!" }
                    ],
                    'reboo': [
                        { s: "Re Boo", t: "Ottima scelta! I miei fantasmi terrorizzeranno Cell a dovere!" },
                        { s: "Danny Phantom", t: "Se preferite un pallone gonfiato... io torno ad Amity Park. Buona fortuna!" }
                    ]
                  }
                },
                {
                  id: 'm8', title: 'La Furia di Sparta',
                  dialogue: [
                    { s: "Kratos (Corrotto)", t: "NESSUNO PUÒ SFIDARE IL NUOVO ORDINE. Crollerete sotto il peso della Perfezione." },
                    { s: "Finn l'Umano", t: "Gulp... quello sembra parecchio arrabbiato." },
                    { s: "Topolino", t: "Ragazzi, ho un brutto presentimento. Quello sembra davvero inarrestabile!" }
                  ],
                  postDialogue: [
                    { s: "Kratos", t: "La mia mente... obnubilata da un insetto. Questa vergogna sarà lavata con il suo sangue." },
                    { s: "Topolino", t: "Ehm... ciao signore! Se vuoi unirti a noi per picchiarlo, sei il benvenuto!" },
                    { s: "Kratos", t: "Il mio obiettivo è la vendetta. Se le nostre strade coincidono, vi seguirò. Per ora." }
                  ],
                  boss: ['kratos'],
                  unlock: ['kratos']
                }
              ]
            },
            {
              name: "Settore 5: Il Cratere dell'Impatto",
              description: "Una landa desolata scossa da crateri di aura cosmica e fiamme di drago.",
              bg: "bg-orange-950",
              missions: [
                {
                  id: 'm9', title: 'Squame e Fuoco',
                  dialogue: [
                    { s: "Bowser (Corrotto)", t: "BWAHAHAH! Rapirò la Perfezione e dominerò questa dimensione!" },
                    { s: "Sdentato (Corrotto)", t: "*Ruggito gutturale e innaturale, occhi iniettati di viola*" },
                    { s: "Kratos", t: "Bestie prive di volontà. Fatemi strada, li abbatterò." }
                  ],
                  postDialogue: [
                    { s: "Bowser", t: "Grrr! Nessuno controlla il Re dei Koopa! Me la pagherà cara!" },
                    { s: "Finn l'Umano", t: "Bravo tartarugone! Ora siamo dalla stessa parte." }
                  ],
                  boss: ['bowser', 'sdentato'],
                  unlock: ['bowser', 'sdentato']
                },
                {
                  id: 'm10', title: 'Un Eroe Caduto',
                  dialogue: [
                    { s: "Goku (Corrotto)", t: "Non riesco... a fermarmi! Il mio corpo... vuole solo lottare per LUI!" },
                    { s: "Bulma (Corrotta)", t: "Analisi completata! Siete delle imperfezioni da eliminare. Fuoco a volontà dai miei Robo Aiutanti!" },
                    { s: "Topolino", t: "Sta resistendo al controllo mentale! Dobbiamo indebolirlo per spezzare il legame!" },
                    { s: "Cyborg", t: "Indebolire quel tizio?! Sembra che possa far esplodere un pianeta con uno starnuto, e ora ha anche supporto robotico!" }
                  ],
                  postDialogue: [
                    { s: "Goku", t: "Uff, grazie ragazzi! Stavo rischiando di fare davvero un bel disastro." },
                    { s: "Bulma", t: "I miei circuiti sono di nuovo stabili... quel Cell aveva hackerato il mio mech! Inaccettabile!" },
                    { s: "Finn l'Umano", t: "Siete fortissimi! Avremo bisogno del vostro potere per abbattere l'Arena." },
                    { s: "Bulma", t: "Goku, vai con loro. Io resterò qui a riparare i danni e coordinare le comunicazioni... fate attenzione!" },
                    { s: "Goku", t: "Agli ordini! Quel Cell colpisce forte! Non vedo l'ora di combatterlo di nuovo, ma stavolta insieme a voi!" }
                  ],
                  boss: ['goku', 'bulma'],
                  unlock: ['goku']
                }
              ]
            },
            {
              name: "Settore 6: Parigi Fratturata",
              description: "Le strade di Parigi si fondono con i regni magici. Illusioni e cristalli spuntano dall'asfalto.",
              bg: "bg-pink-950",
              missions: [
                {
                  id: 'm11', title: 'Illusioni Miracolose',
                  dialogue: [
                    { s: "Ladybug (Corrotta)", t: "Il mio Lucky Charm ha calcolato la probabilità della vostra vittoria: zero spaccato." },
                    { s: "Rena Rouge (Corrotta)", t: "Sarete intrappolati in un'illusione di dolore per sempre! Miraggio!" },
                    { s: "Topolino", t: "Due eroine di Parigi! Dobbiamo fare molta attenzione alle loro combo magiche in doppio!" }
                  ],
                  postDialogue: [
                    { s: "Ladybug", t: "Cosa ho fatto... la mia mente era avvolta da un'ombra opprimente. Grazie." },
                    { s: "Rena Rouge", t: "Ahi... che mal di testa. Prometto di usare le mie illusioni solo per aiutarvi da ora in poi." },
                    { s: "Finn l'Umano", t: "Fantastico! Più siamo e più il testone di Cell prenderà botte!" }
                  ],
                  boss: ['ladybug', 'renarouge'],
                  unlock: ['ladybug', 'renarouge']
                },
                {
                  id: 'm12', title: 'Cataclisma Inevitabile',
                  dialogue: [
                    { s: "Chat Noir (Corrotto)", t: "Plagg, trasformami! Cataclisma! Ridurrò in cenere ogni imperfezione per il Maestro Cell!" },
                    { s: "Ladybug", t: "Chat, fermati! Non sei in te! Devi ascoltarmi!" },
                    { s: "Chat Noir (Corrotto)", t: "Mi dispiace, m'lady... ma il tempo per le chiacchiere è scaduto." }
                  ],
                  postDialogue: [
                    { s: "Chat Noir", t: "M'lady? Ragazzi? Accidenti, mi sento come se fossi stato stirato da un camion delle pulizie." },
                    { s: "Ladybug", t: "Chat! Sono così felice che tu stia bene. Ora siamo di nuovo la squadra imbattibile." },
                    { s: "Finn l'Umano", t: "Benvenuto nella resistenza, gattino. Sfoderiamo gli artigli!" }
                  ],
                  boss: ['chatnoir'],
                  unlock: ['chatnoir']
                },
                {
                  id: 'm12_5', title: 'Anomalia: Contagio di Ritorno',
                  dialogue: [
                    { s: "Finn l'Umano", t: "Chat Noir è a terra! Ce l'abbiamo fatta!" },
                    { s: "Topolino", t: "Attenti! La polvere nera del suo Cataclisma residuo... si sta radunando e fluttua verso di noi!" }
                  ],
                  postDialogue: [
                    { s: "Finn l'Umano", t: "Fiuu... li abbiamo stesi. E la polvere nera si è finalmente dissolta." },
                    { s: "Topolino", t: "Non abbassiamo la guardia. Cell sta diventando disperato se usa questi trucchi per metterci l'uno contro l'altro!" }
                  ],
                  boss: ['dynamic_anomaly_1', 'dynamic_anomaly_2', 'dynamic_anomaly_3', 'dynamic_anomaly_4'], // Verrà sostituito dinamicamente
                  unlock: [],
                  isAnomaly: true
                }
              ]
            },
            {
              name: "Settore 7: Il Vortice Cosmico",
              description: "Fate, streghe e principesse aliene intrappolate in un vortice di energia stellare e magia oscura.",
              bg: "bg-fuchsia-950",
              missions: [
                {
                  id: 'm13', title: 'Incantesimi di Fuoco e Cristallo',
                  dialogue: [
                    { s: "Bloom (Corrotta)", t: "La Fiamma del Drago obbedisce a un solo dominatore ora: la Perfezione!" },
                    { s: "Iris (Corrotta)", t: "I miei cristalli taglieranno via la vostra fragile Resistenza in un istante!" },
                    { s: "Charmcaster (Corrotta)", t: "I miei Golem di pietra vi schiacceranno senza pietà!" }
                  ],
                  postDialogue: [
                    { s: "Bloom", t: "La Fiamma... è tornata a scaldarmi il cuore. Ero intrappolata in un gelo mentale terribile." },
                    { s: "Iris", t: "Ephedia vi ringrazia. Con le nostre magie unite, Cell non avrà scampo!" },
                    { s: "Charmcaster", t: "Che umiliazione... Vabbè, vi aiuto. Ma solo perché detesto chi mi dà ordini." },
                    { s: "Spongebob", t: "Ehi fatine magiche! Per festeggiare la vostra liberazione, che ne dite di un bel Krabby Patty scoppiettante?!" },
                    { s: "Charmcaster", t: "Una spugna parlante in calzoncini che cucina panini... Vi prego, ditemi che sto ancora avendo un incubo." },
                    { s: "Jake il Cane", t: "Tranquilla maghetta, ci farai l'abitudine. Ieri ho visto un topo con i pantaloni rossi lanciare incantesimi, figurati!" },
                    { s: "Topolino", t: "Ehi! Ti ho sentito, Jake! E per la cronaca, la mia è Magia Disney certificata, mica trucchi da quattro soldi!" },
                    { s: "Bloom", t: "Ahahah! Beh, alla scuola di Alfea non si vedono di certo alleati così... pittoreschi. Sarà un'avventura interessante!" },
                    { s: "Finn l'Umano", t: "Questo è lo spirito giusto! Magia, panini e spade! Prossima fermata: prendere a calci i burattini di Cell!" }
                  ],
                  boss: ['bloom', 'iris', 'charmcaster'],
                  unlock: ['bloom', 'iris', 'charmcaster']
                },
                {
                  id: 'm14', title: 'Titani nell\'Ombra',
                  dialogue: [
                    { s: "Nightwing (Corrotto)", t: "Le ombre non sono nulla in confronto alla luce della Perfezione. Sarete annientati." },
                    { s: "Stellarubia (Corrotta)", t: "I nostri legami sono stati spezzati! I miei Starbolts vi inceneriranno!" },
                    { s: "Robin (Corrotto)", t: "Titani... distruggete la Resistenza!" },
                    { s: "Cyborg", t: "Amici miei! Nightwing! Dobbiamo farli tornare in sé, squadra! Preparatevi!" }
                  ],
                  postDialogue: [
                    { s: "Nightwing", t: "Ugh... la mia mente. Quell'energia oscura era potente. Grazie per l'aiuto." },
                    { s: "Stellarubia", t: "Amici! Che gioia immensa! Mi sentivo così fredda e sola senza di voi!" },
                    { s: "Robin", t: "Siamo di nuovo una squadra. Cell si pentirà amaramente di averci manipolati." }
                  ],
                  boss: ['nightwing', 'stellarubia', 'robin'],
                  unlock: ['nightwing', 'stellarubia', 'robin']
                }
              ]
            },
            {
              name: "Settore 8: La Dimensione dei Duellanti",
              description: "Campi di battaglia olografici si mescolano a piste di velocità cibernetiche.",
              bg: "bg-indigo-950",
              missions: [
                {
                  id: 'm15', title: 'Sincronia Cosmica',
                  dialogue: [
                    { s: "Astral (Corrotto)", t: "Osservazione: La Resistenza ha una probabilità di vittoria dello 0%. Mi dispiace, Yuma." },
                    { s: "Yusei Fudo (Corrotto)", t: "Il mio Drago Polvere di Stelle spazzerà via le vostre speranze in nome della Perfezione." },
                    { s: "Topolino", t: "Usano le carte e l'energia cosmica per evocare mostri! Dobbiamo distruggere i loro deck!" }
                  ],
                  postDialogue: [
                    { s: "Astral", t: "Errore di calcolo... la vostra forza di volontà ha superato ogni statistica. L'influsso è spezzato." },
                    { s: "Yusei Fudo", t: "Grazie per avermi fermato. Accelererò insieme a voi verso il varco di Cell!" }
                  ],
                  boss: ['astral', 'yusei'],
                  unlock: ['astral', 'yusei']
                },
                {
                  id: 'm15_5', title: 'Anomalia: Resistenza al Contagio',
                  dialogue: [
                    { s: "Finn l'Umano", t: "Attenti ragazzi! Un'altra nube di polvere nera! Sta puntando a chi è già stato infettato in precedenza!" },
                    { s: "Patrick Stella", t: "Ugh... la mia testa... la voce mi dice di schiacciare Spongebob..." },
                    { s: "Spongebob", t: "Patrick, no! Ricordati del nostro patto dei migliori amici! E dei campi di meduse!" },
                    { s: "Patrick Stella", t: "Meduse... amicizia? Hai ragione! Nessuna polvere spaziale mi metterà contro il mio migliore amico!" },
                    { s: "Jake il Cane", t: "Finn... mi sento strano... l'oscurità vuole che io stritoli tutto..." },
                    { s: "Finn l'Umano", t: "Jake, non cedere! Noi siamo gli eroi di Ooo, siamo più forti di questo schifo viola!" },
                    { s: "Jake il Cane", t: "Aaaah! Hai ragione fratello! Sono un cane magico, non un burattino!" },
                    { s: "Ladybug", t: "Il mio Miraculous... la sfortuna sta prendendo di nuovo il sopravvento..." },
                    { s: "Chat Noir", t: "Non permetterò che accada, M'lady! La tua luce è la guida di tutti noi. Concentrati su di me, resisti!" },
                    { s: "Ladybug", t: "Chat... grazie. L'oscurità sta arretrando. Sono ancora io." },
                    { s: "Sdentato", t: "*Ruggito soffocato e innaturale, mentre gli occhi vacillano verso il viola*" },
                    { s: "Kratos", t: "Bestia! Non farti domare da un insetto. Controlla la tua furia e dimostra la tua vera natura, o ti abbatterò io stesso!" },
                    { s: "Sdentato", t: "*Scuote violentemente la testa e ruggisce con vigore, dissipando la polvere oscura*" },
                    { s: "Topolino", t: "Fantastico! Hanno resistito al contagio! Ma la nube di polvere ha creato dei mostri, spazziamoli via!" }
                  ],
                  postDialogue: [
                    { s: "Finn l'Umano", t: "Siete stati grandiosi, ragazzi! La forza di volontà ha vinto sul controllo mentale." },
                    { s: "Ladybug", t: "Grazie Chat... le tue parole mi hanno ancorata alla realtà." },
                    { s: "Patrick Stella", t: "Tutto molto bello, ma... possiamo avere un Krabby Patty ora? Combattere le voci nella testa fa venire fame." },
                    { s: "Topolino", t: "Non fermiamoci adesso, il viaggio continua!" }
                  ],
                  boss: ['slime', 'blob', 'worm', 'melma'],
                  unlock: [],
                  isAnomaly: true
                },
                {
                  id: 'm16', title: 'Combattenti Brutali',
                  dialogue: [
                    { s: "Juri (Corrotta)", t: "Ahahaha! Vi schiaccerò sotto il mio tacco per il mio nuovo Maestro!" },
                    { s: "Sanemi (Corrotto)", t: "Taglierò la vostra imperfezione in mille pezzi a favore del vento!" },
                    { s: "Finn l'Umano", t: "Questi due sembrano dei veri psicopatici... state in guardia!" }
                  ],
                  postDialogue: [
                    { s: "Juri", t: "Tsk... mi sono fatta controllare come una marionetta. Che seccatura." },
                    { s: "Sanemi", t: "I miei demoni interiori sono nulla in confronto a quel mostro." }
                  ],
                  boss: ['juri', 'sanemi'],
                  choiceUnlock: ['juri', 'sanemi'],
                  choiceDialogues: {
                    'juri': [
                        { s: "Juri", t: "Hehe... sembra che mi divertirò con voi. Facciamo a pezzi qualcuno!" },
                        { s: "Sanemi", t: "Non ho tempo da perdere con dei rammolliti. Torno ad affettare demoni per conto mio." }
                    ],
                    'sanemi': [
                        { s: "Sanemi", t: "Le mie lame sono al vostro servizio. Sventreremo quell'essere abominevole." },
                        { s: "Juri", t: "Che noia... pensavo sareste stati dei padroni più divertenti. Ciao ciao!" }
                    ]
                  }
                }
              ]
            },
            {
              name: "Settore 9: Il Torneo Marziale",
              description: "Un'antica arena asiatica circondata da fiamme di drago e montagne di ravioli.",
              bg: "bg-amber-950",
              missions: [
                {
                  id: 'm17', title: 'Fuoco e Ravioli',
                  dialogue: [
                    { s: "Natsu (Corrotto)", t: "Sono tutto un fuoco! Un fuoco di pura sottomissione perfetta!" },
                    { s: "Po (Corrotto)", t: "Non c'è spazio per l'imperfezione... e nemmeno per i ravioli! Solo per Cell!" },
                    { s: "Goku", t: "Questi guerrieri hanno un'aura incredibile! Lasciateli a me!" }
                  ],
                  postDialogue: [
                    { s: "Goku", t: "Fiuu! È stata tosta! Siete forti, ma vi abbiamo battuti!" },
                    { s: "Natsu", t: "Ugh... la mia testa... aspetta, cosa sono quegli esserini blu che arrivano?" },
                    { s: "Topolino", t: "Oh no! Dei cloni in miniatura di Cell! Stanno spargendo di nuovo la polvere oscura su Natsu e Po!" },
                    { s: "Po", t: "No! I ravioli... l'oscurità... argh! Vi distruggerò di nuovo per il Maestro!" }
                  ],
                  boss: ['natsu', 'po'],
                  unlock: []
                },
                {
                  id: 'm17_5', title: 'Anomalia: I Cloni Imperfetti',
                  isAnomaly: true,
                  forceFieldSize: 6,
                  dialogue: [
                    { s: "Cell Jr. (Rosso)", t: "Kikiki! Il Maestro ci ha mandati a proteggere i nostri nuovi giocattoli!" },
                    { s: "Finn l'Umano", t: "Sono in sei! E sembrano avere una specie di barriera magica attorno a loro!" },
                    { s: "Topolino", t: "Guardate! Lo scudo dei Cell Jr. è collegato a Natsu e Po! Finché loro sono in piedi, i piccoli sono invincibili!" }
                  ],
                  postDialogue: [
                    { s: "Finn l'Umano", t: "Ce l'abbiamo fatta! Gli scudi sono caduti e i cloni sono stati sconfitti!" },
                    { s: "Natsu", t: "Aaah... che liberazione! Quelle piccole pesti mi stavano friggendo il cervello!" },
                    { s: "Goku", t: "Ehi, dov'è finito il panda gigante?" },
                    { s: "Natsu", t: "È scappato mentre finivamo i cloni... l'oscurità lo ha portato via. Ma io sono con voi adesso! Mi sento tutto un fuoco!" }
                  ],
                  boss: ['natsu', 'po', 'celljr_1', 'celljr_2', 'celljr_3', 'celljr_4'],
                  unlock: ['natsu']
                },
                {
                  id: 'm18', title: 'Velocità e Fiamme',
                  dialogue: [
                    { s: "Mantide (Corrotto)", t: "La mia velocità è l'apice dell'evoluzione. Non mi vedrete nemmeno arrivare!" },
                    { s: "Zuko (Corrotto)", t: "Il mio onore ora dipende dalla vittoria del Maestro Cell!" },
                    { s: "Cyborg", t: "Velocità e dominio del fuoco. Calibrate bene i vostri attacchi, squadra!" }
                  ],
                  postDialogue: [
                    { s: "Zuko", t: "Ancora una volta ho perso la mia strada... ma ora combatterò per rimediare." },
                    { s: "Mantide", t: "Ehi, mi avete quasi schiacciato! Ma grazie per la svegliata, ne avevo bisogno." }
                  ],
                  boss: ['mantide', 'zuko'],
                  unlock: ['mantide', 'zuko']
                }
              ]
            },
            {
              name: "Settore 10: Il Castello dei Malvagi",
              description: "Una fortezza di pietra nera costellata da trofei di caccia e nidi mostruosi.",
              bg: "bg-stone-900",
              missions: [
                {
                  id: 'm19', title: 'Muscoli e Roccia',
                  dialogue: [
                    { s: "Gaston (Corrotto)", t: "Nessuno serve la Perfezione Assoluta come Gaston! Guardate che bicipiti sottomessi!" },
                    { s: "Cuore di Pietra (Corrotto)", t: "Schiaccerò l'imperfezione fino a ridurla in polvere!" },
                    { s: "Kratos", t: "Sbruffoni vanitosi e sassi ambulanti. Non meritano pietà." }
                  ],
                  postDialogue: [
                    { s: "Gaston", t: "Io... sconfitto? Deve esserci stato un errore di calcolo nei miei bicipiti!" },
                    { s: "Cuore di Pietra", t: "La mia roccia si sgretola... ma l'incantesimo è rotto. Avete la mia forza, per ora." }
                  ],
                  boss: ['gaston', 'cuoredipietra'],
                  unlock: ['gaston', 'cuoredipietra']
                },
                {
                  id: 'm20', title: 'Mostri Letali',
                  dialogue: [
                    { s: "Zazan (Corrotta)", t: "Le mie metamorfosi sono nulla in confronto alla forma finale del Maestro Cell!" },
                    { s: "Barry (Corrotto)", t: "AHAHAH! Vi taglierò a fettine magiche per abbellire questo castello!" },
                    { s: "Finn l'Umano", t: "Ok, questa è roba da incubo. Nessun passo falso!" }
                  ],
                  postDialogue: [
                    { s: "Zazan", t: "Hiss... essere comandata a bacchetta è un insulto per una Regina!" },
                    { s: "Barry", t: "Mmm, forse fare i bravi ragazzi è più divertente... per oggi." }
                  ],
                  boss: ['zazan', 'barry'],
                  unlock: ['zazan', 'barry']
                },
                {
                  id: 'm20_5', title: 'Il Re dei Mamodo',
                  forceFieldSize: 4,
                  dialogue: [
                    { s: "Barry", t: "Guarda guarda, anche il re 'benevolo e gentile' è stato trasformato in un burattino eh?" },
                    { s: "Zatch bell (Corrotto)", t: "Re benevolo e gentile dici? Non farmi ridere. Mangia la mia polvere, Zaker!" },
                    { s: "Penny (Corrotta)", t: "Barry, Barry, Barry... come osi parlare male del mio Zatch? La pagherai cara!" },
                    { s: "Ponygon (Corrotto)", t: "Meru meru me!" },
                    { s: "Barry", t: "Bene allora. Vi farò tornare normali a suon di pugni." },
                    { s: "Brago (Corrotto)", t: "Tsk......." },
                    { s: "Barry", t: "Tu almeno stai provando a resistere vedo..." }
                  ],
                  postDialogue: [
                    { s: "Zatch bell", t: "Ugh... la mia testa! Barry, mi hai svegliato da un incubo orribile, grazie!" },
                    { s: "Penny", t: "Zatch, amore mio! L'importante è che ora siamo di nuovo insieme!" },
                    { s: "Ponygon", t: "Meru meru meee!" },
                    { s: "Brago", t: "Che umiliazione essere controllato. Barry, non pensare che questo ci renda amici." },
                    { s: "Barry", t: "Tsk. Mettiti in fila, spigoloso. L'importante è che ora colpiate dalla parte giusta." }
                  ],
                  boss: ['zatchbell', 'penny', 'ponygon', 'brago'],
                  unlock: ['zatchbell', 'penny', 'ponygon', 'brago']
                }
              ]
            },
            {
              name: "Settore 11: Il Ghiacciaio Sospeso",
              description: "Una landa di ghiaccio perenne dove le bufere nascondono antiche magie.",
              bg: "bg-cyan-900",
              missions: [
                {
                  id: 'm21', title: 'Cuori di Ghiaccio',
                  dialogue: [
                    { s: "Zatch bell", t: "B-b-brrr! Che freddo glaciale! Ponygon, amico mio, fammi salire in groppa! I miei piedini si stanno congelando!" },
                    { s: "Ponygon", t: "Meru meru me! (Sbuffa, scuote la testa e gli gira le spalle)" },
                    { s: "Zatch bell", t: "Uffa, sei un cavallino egoista! Se non mi aiuti diventerò un ghiacciolo e non potrò più darti il tuo cibo preferito!" },
                    { s: "Ponygon", t: "Meru?! (Ci pensa su, poi si abbassa rassegnato per farlo salire)" },
                    { s: "Elsa (Corrotta)", t: "Il freddo non mi ha mai disturbata... ma questa Frequenza gela perfino la mia anima." },
                    { s: "Re Ghiaccio (Corrotto)", t: "Zitto Gunter! Guarda quel ragazzino sul cavallo! Il Maestro Cell mi ha promesso tutte le principesse del Multiverso se vi congelo tutti!" },
                    { s: "Po (Corrotto)", t: "Il freddo conserverà i ravioli in eterno... e anche voi!" },
                    { s: "Topolino", t: "Attenti, le loro magie combinate potrebbero trasformarci in statue di ghiaccio!" }
                  ],
                  postDialogue: [
                    { s: "Elsa", t: "La mia mente... era avvolta da un inverno oscuro e innaturale. Vi ringrazio per avermi liberata." },
                    { s: "Re Ghiaccio", t: "Ahi, la mia schiena! Ma dove sono le mie principesse?! Vabbè, mi unisco a voi se promettete di presentarmi qualcuna." },
                    { s: "Po", t: "Ragazzi... vi giuro che ero posseduto! Non avrei mai rinunciato ai ravioli caldi di mia spontanea volontà! Scusate per la fuga!" },
                    { s: "Finn l'Umano", t: "Tutto a posto, amico! L'importante è che ora sei dei nostri." }
                  ],
                  boss: ['elsa', 'reghiaccio', 'po'],
                  unlock: ['elsa', 'reghiaccio', 'po']
                },
                {
                  id: 'm22', title: 'Neve Assassina',
                  dialogue: [
                    { s: "Jack Frost (Corrotto)", t: "Il divertimento è finito. L'inverno della Perfezione durerà in eterno!" },
                    { s: "Yuki-Onna (Corrotta)", t: "I vostri respiri caldi... li soffocherò sotto una coltre di neve e oscurità." },
                    { s: "Marceline", t: "Odio il freddo. Mi secca i canini. Facciamola finita in fretta." }
                  ],
                  postDialogue: [
                    { s: "Jack Frost", t: "Ugh, mi sentivo come se il Babau mi avesse rubato i pensieri! Tornerò a fare scherzi gelati per aiutarvi." },
                    { s: "Yuki-Onna", t: "Il mio spirito è di nuovo in pace. Soffierò venti gelidi sui vostri nemici." }
                  ],
                  boss: ['jackfrost', 'yukionna'],
                  unlock: ['jackfrost', 'yukionna']
                }
              ]
            },
            {
              name: "Settore 12: La Giungla d'Acciaio",
              description: "La natura selvaggia ha invaso le rovine di una metropoli, creando mutazioni letali.",
              bg: "bg-emerald-900",
              missions: [
                {
                  id: 'm23', title: 'Flora Velenosa',
                  dialogue: [
                    { s: "Zatch bell", t: "Ooooh! Guardate che bei fiori giganti! Ne voglio raccogliere uno da regalare a Vulcan 300!" },
                    { s: "Ponygon", t: "MERU! MERU ME! (Morde Zatch per la maglietta e lo tira indietro con forza)" },
                    { s: "Zatch bell", t: "Ahi! Ponygon, ma sei impazzito?! Volevo solo accarezzare quella bella pianta carnivora, sembrava così felice di vedermi!" },
                    { s: "Poison Ivy", t: "Quel piccolo cavallo ha decisamente più istinto di sopravvivenza di te, ragazzino." },
                    { s: "Roserade (Corrotto)", t: "*Sibilo elegante ma velenoso, sprigionando spore viola*" },
                    { s: "Leslie (Corrotto)", t: "Io non volevo combattere! Ma la voce nella mia testa dice che devo farvi concime!" },
                    { s: "Poison Ivy", t: "Queste piante stanno soffrendo... Cell le sta forzando oltre i loro limiti!" }
                  ],
                  postDialogue: [
                    { s: "Leslie", t: "Mio fiorellino! Ero diventato un mostro cattivone! Grazie per avermi sfoltito le foglie." },
                    { s: "Roserade", t: "*Inchino regale di ringraziamento*" },
                    { s: "Poison Ivy", t: "La natura ringrazia. Ora venite con noi, abbiamo un insetto da schiacciare." }
                  ],
                  boss: ['roserade', 'leslie'],
                  unlock: ['roserade', 'leslie']
                },
                {
                  id: 'm24', title: 'Giganti Addormentati',
                  forceFieldSize: 6,
                  dialogue: [
                    { s: "Groot (Corrotto)", t: "Io. Sono. CELL." },
                    { s: "Snorlax (Corrotto)", t: "*Ronf... Zzz... la Perfezione è... Zzz...*" },
                    { s: "Finn l'Umano", t: "Un albero gigante che parla e un orso che dorme anche se è posseduto? Aspetta... ci sono altri 4 mostriciattoli corrotti con loro! Una pianta carnivora, un cespuglio, un albero demoniaco e un fiore!" },
                    { s: "Topolino", t: "Dobbiamo stare molto attenti, sembrano letali e fanno da guardia ai due giganti!" }
                  ],
                  postDialogue: [
                    { s: "Groot", t: "Io sono Groot." },
                    { s: "Snorlax", t: "*Sbadiglio*... Ho una fame da lupi! C'è niente da mangiare da queste parti?" },
                    { s: "Cyborg", t: "Perfetto. Quei mostriciattoli vegetali sono cenere. Un albero monosillabico e un pozzo senza fondo invece si sono uniti a noi!" }
                  ],
                  boss: ['groot', 'snorlax', 'piantacarnivora', 'cespugliomaledetto', 'alberto', 'fioretenebroso'],
                  unlock: ['groot', 'snorlax']
                }
              ]
            },
            {
              name: "Settore 13: Le Rovine Galattiche",
              description: "Astronavi distrutte e anomalie spaziali circondano i margini del dominio di Cell.",
              bg: "bg-fuchsia-900",
              missions: [
                {
                  id: 'm25', title: 'Follia Cosmica',
                  forceFieldSize: 3,
                  dialogue: [
                    { s: "N°39 Utopia (Corrotto)", t: "L'Aspirazione Imperiale è stata sovrascritta. Modalità: Sottomissione." },
                    { s: "Cosmo (Corrotto)", t: "Wanda! Timmy! Aiuto! Il signor insetto cattivo ha rubato la mia bacchetta mentale! Vi devo vaporizzare!" },
                    { s: "Finn l'Umano", t: "Attenti ragazzi! Con loro c'è una Fata Cosmica velocissima che li protegge e li cura senza sosta!" },
                    { s: "Goku", t: "Un guerriero d'oro, uno strano esserino verde e una fatina volante... questo multiverso è davvero strano!" }
                  ],
                  postDialogue: [
                    { s: "N°39 Utopia", t: "Sistemi ripristinati. Luce della Speranza online. Attendo ordini dalla Resistenza." },
                    { s: "Cosmo", t: "Evviva! Sono tornato me stesso! Speriamo che Wanda non scopra che mi sono fatto fare il lavaggio del cervello!" },
                    { s: "Topolino", t: "La fatina invece si è dissolta in polvere di stelle. Dobbiamo andare avanti!" }
                  ],
                  boss: ['utopia', 'cosmo', 'fatacosmica'],
                  unlock: ['utopia', 'cosmo']
                },
                {
                  id: 'm26', title: 'Sciame e Fantasmi',
                  dialogue: [
                    { s: "Zergling (Corrotto)", t: "*Stridio agghiacciante di sottomissione all'Alveare Perfetto*" },
                    { s: "Whisper (Corrotto)", t: "Secondo il mio Yo-kai Pad, la probabilità che voi sopravviviate al Maestro Cell è... inesistente!" },
                    { s: "Topolino", t: "Siamo un passo dall'Arena. Non fermiamoci adesso!" }
                  ],
                  postDialogue: [
                    { s: "Whisper", t: "Phew! Il mio Yo-kai Pad stava impazzendo! Grazie per l'esorcismo... ehm, salvataggio!" },
                    { s: "Zergling", t: "*Si accuccia come un cagnolino alieno, libero dal controllo*" },
                    { s: "Finn l'Umano", t: "Bravi mostriciattoli. Ora andiamo a finire il lavoro." }
                  ],
                  boss: ['zergling', 'whisper'],
                  unlock: ['zergling', 'whisper']
                },
                {
                  id: 'm26_5', title: 'Echi nel Tempo',
                  dialogue: [
                    { s: "Finn l'Umano", t: "Siamo finiti in una distorsione temporale! Tutto si muove a scatti! E chi sono quelle due ragazze?" },
                    { s: "Max Caulfield (Corrotta)", t: "Il tempo è puro caos. Il Maestro Cell mi ha mostrato come riavvolgerlo verso l'Ordine Assoluto." },
                    { s: "Chloe Price (Corrotta)", t: "Preparatevi a mangiare la polvere! Stiamo per cancellarvi da questa linea temporale!" }
                  ],
                  postDialogue: [
                    { s: "Finn l'Umano", t: "Fiuu! Quella mossa combinata era assurda! Riavvolgevano i nostri stessi attacchi!" },
                    { s: "Max Caulfield", t: "Oh mio dio... Chloe, stiamo bene? La mia testa gira, sento echi temporali ovunque." },
                    { s: "Chloe Price", t: "Sto bene Max. Quel mostro ci aveva rubato il cervello." }
                  ],
                  boss: ['maxcaulfield', 'chloeprice'],
                  unlock: ['maxcaulfield', 'chloeprice'],
                  randomUnlockCount: 1
                }
              ]
            },
            {
              name: "Settore 14: Il Regno dei Funghi Corrotto",
              description: "Tubi warp distorti, mattoni fluttuanti e un cielo viola. Il regno è caduto.",
              bg: "bg-red-950",
              missions: [
                {
                  id: 'm27', title: 'Verde d\'Invidia',
                  dialogue: [
                    { s: "Zatch bell", t: "Wow! Ci sono funghi giganti ovunque! Chissà se sono buoni da mangiare... Ne assaggio uno!" },
                    { s: "Ponygon", t: "Meru! Meru meru! (Si lancia per bloccarlo ma scivola su un guscio di tartaruga)" },
                    { s: "Zatch bell", t: "Tranquillo Ponygon, ti proteggo io dai gusci scivolosi! Ti faccio strada a suon di fulmini!" },
                    { s: "Luigi (Corrotto)", t: "Sempre il numero due... ma per il Maestro Cell, io sarò il flagello perfetto! Tremate!" },
                    { s: "Topolino", t: "Luigi! Non è da te! Resisti a questa energia oscura!" }
                  ],
                  postDialogue: [
                    { s: "Luigi", t: "M-mamma mia... che incubo spaventoso! Grazie per avermi svegliato, ragazzi!" },
                    { s: "Zatch bell", t: "Prego amico coi baffi verdi! E grazie per il fungo, sapeva di... energia pura!" },
                    { s: "Ponygon", t: "Meru... (Si dà una zampata in fronte, esasperato)" },
                    { s: "Finn l'Umano", t: "Ahah! Non c'è di che, baffone verde! Ma c'è ancora tuo fratello da salvare." }
                  ],
                  boss: ['luigi'],
                  unlock: ['luigi']
                },
                {
                  id: 'm28', title: 'L\'Eroe Corrotto',
                  dialogue: [
                    { s: "Mario (Corrotto)", t: "It's-a-me... la Perfezione! Nessun fungo vi salverà dalla mia potenza!" },
                    { s: "Finn l'Umano", t: "Oh cavolo, se Mario è diventato cattivo, la situazione è davvero disperata!" }
                  ],
                  postDialogue: [
                    { s: "Mario", t: "Mamma mia... che mal di testa! Mi sentivo come se fossi caduto nella lava!" },
                    { s: "Topolino", t: "Sei tornato in te, Mario! Ora abbiamo il salto più potente del multiverso dalla nostra parte!" }
                  ],
                  boss: ['mario'],
                  unlock: ['mario']
                }
              ]
            },
            {
              name: "Settore 15: Il Tempio degli Elementi",
              description: "Rovine dei Nomadi dell'Aria avvolte da vortici d'acqua e magia distorta.",
              bg: "bg-cyan-950",
              missions: [
                {
                  id: 'm29', title: 'Onde Implacabili',
                  dialogue: [
                    { s: "Katara (Corrotta)", t: "Il dominio dell'acqua non serve per curare... serve per affogare l'imperfezione!" },
                    { s: "Corvina", t: "La sua magia è purissima, ma è stata corrotta alla radice. Non sottovalutatela!" }
                  ],
                  postDialogue: [
                    { s: "Katara", t: "Cos'ho fatto... l'acqua dovrebbe portare vita, non distruzione. Mi dispiace tanto." },
                    { s: "Topolino", t: "È colpa di Cell, Katara! Ti aiuteremo a riportare l'equilibrio!" }
                  ],
                  boss: ['katara'],
                  unlock: ['katara']
                },
                {
                  id: 'm30', title: 'L\'Avatar Oscuro',
                  dialogue: [
                    { s: "Aang (Corrotto)", t: "Non c'è più equilibrio. Non ci sono più quattro nazioni. C'è solo la Perfezione Assoluta di Cell!" },
                    { s: "Finn l'Umano", t: "L'Avatar! Controlla tutti gli elementi! Dobbiamo schivare come pazzi!" }
                  ],
                  postDialogue: [
                    { s: "Aang", t: "Le vite passate... non riuscivo a sentirle. C'era solo un ronzio terribile e oscuro." },
                    { s: "Finn l'Umano", t: "Tranquillo amico, l'incubo è finito. Benvenuto nella squadra!" },
                    { s: "Aang", t: "Grazie! Insieme soffieremo via quest'oscurità!" }
                  ],
                  boss: ['aang'],
                  unlock: ['aang']
                },
                {
                  id: 'm30_5', title: 'Anomalia: La Ricaduta dell\'Onore',
                  isAnomaly: true,
                  dialogue: [
                    { s: "Topolino", t: "Oh no! Quella nube di polvere oscura è tornata e si sta dirigendo verso Katara e Aang!" },
                    { s: "Katara (Corrotta)", t: "Le mie acque... si tingono di nero. Vi annegherò tutti!" },
                    { s: "Aang (Corrotto)", t: "L'Avatar deve imporre... l'Ordine Assoluto!" },
                    { s: "Zuko", t: "Non di nuovo! Resisterò... non mi farò controllare... argh!" },
                    { s: "Zuko (Corrotto)", t: "Il mio onore... brucerà l'imperfezione!" },
                    { s: "Finn l'Umano", t: "Zuko ha ceduto! Dobbiamo farli rinsavire un'altra volta, preparatevi!" }
                  ],
                  postDialogue: [
                    { s: "Aang", t: "La mia testa... mi dispiace tanto ragazzi, l'oscurità era troppo forte." },
                    { s: "Katara", t: "L'importante è che ora stiamo di nuovo bene... vero, Zuko?" },
                    { s: "Zuko", t: "No. Non sto bene. Mi sono fatto controllare... DI NUOVO." },
                    { s: "Finn l'Umano", t: "Ehi, non è colpa tua! Quella magia è infida, ha preso alla sprovvista anche noi a volte." },
                    { s: "Zuko", t: "Un vero dominatore del fuoco non si fa spegnere la mente. Sono debole. Non posso viaggiare con voi se sono una minaccia costante per la mia stessa squadra." },
                    { s: "Topolino", t: "Zuko, aspetta! Dove vai?!" },
                    { s: "Zuko", t: "A ritrovare me stesso. O a bruciare da solo. Non cercatemi." }
                  ],
                  boss: ['aang', 'katara', 'zuko'],
                  removeChars: ['zuko']
                }
              ]
            },
            {
              name: "Settore 16: L'Arcipelago dei Campioni",
              description: "Isole tropicali galleggianti su un mare di lava viola. Vecchie glorie dei videogames ti attendono.",
              bg: "bg-teal-950",
              missions: [
                {
                  id: 'm31', title: 'Follia Rotante e Fiammeggiante',
                  dialogue: [
                    { s: "Spyro (Corrotto)", t: "Ridurremo queste isole in cenere... il Maestro Cell non vuole imperfezioni!" },
                    { s: "Crash Bandicoot (Corrotto)", t: "*Versi aggressivi e distorti, pronto a ruotare*" },
                    { s: "Topolino", t: "Due leggende sotto controllo mentale! Non fatevi colpire da quella trottola pelosa!" }
                  ],
                  postDialogue: [
                    { s: "Spyro", t: "Che mal di testa... perché stavo cercando di arrostire le mie stesse isole?" },
                    { s: "Crash Bandicoot", t: "Woah!" },
                    { s: "Finn l'Umano", t: "Ahah! Siete liberi ragazzi, unitevi al nostro gruppo!" }
                  ],
                  boss: ['spyro', 'crash'],
                  unlock: ['spyro', 'crash']
                },
                {
                  id: 'm32', title: 'Lame Scarlatte e Tattiche',
                  dialogue: [
                    { s: "Pyra (Corrotta)", t: "Il fuoco dell'Egida incenerirà ogni ostacolo sul cammino della Perfezione." },
                    { s: "Carlos Oliveira (Corrotto)", t: "Nessuna via di fuga. Ordini ricevuti, bersagli acquisiti." },
                    { s: "Cyborg", t: "Una spada divina di fuoco e un soldato armato fino ai denti. Riparatevi!" }
                  ],
                  postDialogue: [
                    { s: "Pyra", t: "La mia fiamma... è tornata calda. Era diventata così gelida e distruttiva." },
                    { s: "Carlos Oliveira", t: "Ho visto orrori indicibili nella mia vita, ma quel controllo mentale è stato il peggiore. Contate su di me." }
                  ],
                  boss: ['pyra', 'carlos'],
                  unlock: ['pyra', 'carlos']
                }
              ]
            },
            {
              name: "Settore 17: Le Grotte dell'Agonia",
              description: "Caverne oscure colme di miasmi mortali e fiumi di nebbia velenosa.",
              bg: "bg-zinc-950",
              missions: [
                {
                  id: 'm33', title: 'Nebbia Sanguinaria',
                  dialogue: [
                    { s: "Juvia (Corrotta)", t: "Juvia affogherà i nemici del Maestro Cell in un mare di disperazione e lacrime..." },
                    { s: "Zabuza (Corrotto)", t: "La nebbia della morte vi avvolgerà, e non saprete da dove arriverà il colpo." },
                    { s: "Sailor Mercury (Corrotta)", t: "Le mie bolle offuscheranno ogni vostra via di fuga. Perfezione glaciale." },
                    { s: "Goku", t: "Non riesco a percepire la loro aura nella nebbia! Dobbiamo stare attenti!" }
                  ],
                  postDialogue: [
                    { s: "Juvia", t: "Juvia è così dispiaciuta! Juvia non voleva farvi del male, la sua mente era intrappolata!" },
                    { s: "Sailor Mercury", t: "La mia mente razionale era stata completamente silenziata... grazie per avermi salvata." },
                    { s: "Zabuza", t: "Un guerriero come me sottomesso a un insetto. È un disonore che laverò col sangue di quel Cell." }
                  ],
                  boss: ['juvia', 'zabuza', 'sailormercury'],
                  unlock: ['juvia', 'zabuza', 'sailormercury']
                },
                {
                  id: 'm34', title: 'L\'Abisso Oscuro',
                  dialogue: [
                    { s: "Gravelord Nito (Corrotto)", t: "*Suono agghiacciante di innumerevoli ossa scricchiolanti e miasma opprimente*" },
                    { s: "Hannibal (Corrotto)", t: "La vostra carne nutrirà la Perfezione Assoluta in un banchetto sublime..." },
                    { s: "Marceline", t: "Ugh, questi due mi fanno venire i brividi perfino a me. Facciamola finita." }
                  ],
                  postDialogue: [
                    { s: "Hannibal", t: "Che scortesia immensa, farsi controllare la mente. Credo che mi servirà un buon Chianti per riprendermi." },
                    { s: "Topolino", t: "L'importante è che ora siate liberi! La via per il castello è aperta!" }
                  ],
                  boss: ['nito', 'hannibal'],
                  unlock: ['nito', 'hannibal']
                },
                {
                  id: 'm34_5', title: 'L\'Onore Ritrovato',
                  dialogue: [
                    { s: "Finn l'Umano", t: "Siamo quasi usciti da queste caverne puzzolenti! ...Aspetta, chi c'è laggiù?" },
                    { s: "Zuko", t: "Siete arrivati. Vi stavo aspettando." },
                    { s: "Topolino", t: "Zuko! Sei tornato in te! Vieni con noi, stiamo per affrontare Cell!" },
                    { s: "Zuko", t: "Non ancora. Devo capire se le mie fiamme sono davvero mie o se sono ancora macchiate di nero. Combattetemi. Mostratemi che non sono un pericolo per voi, e vi seguirò fino alla fine." }
                  ],
                  postDialogue: [
                    { s: "Zuko", t: "*Ansimando* Siete davvero forti... ma non vi ho feriti. Ho mantenuto il controllo sulle mie fiamme." },
                    { s: "Katara", t: "Non l'hai mai perso del tutto, Zuko. Nessuno è perfetto, l'importante è sapersi rialzare." },
                    { s: "Zuko", t: "Hai ragione. Il mio fuoco brucia per proteggere, non per distruggere. L'oscurità non mi avrà più. Cell ha i minuti contati." },
                    { s: "Finn l'Umano", t: "Questo è lo spirito giusto! Bentornato nel gruppo, scintilla!" }
                  ],
                  boss: ['zuko'],
                  unlock: ['zuko']
                }
              ]
            },
            {
              name: "Settore 18: L'Arena della Perfezione",
              description: "Un immenso castello fluttuante nel vuoto tra le dimensioni. È l'ora della verità.",
              bg: "bg-slate-900",
              missions: [
                {
                  id: 'm35', title: 'I Guardiani del Varco',
                  dialogue: [
                    { s: "Cell", t: "Siete arrivati fin qui... superando ben diciassette dimensioni. Wario, Metal Sonic, Alphonse... mostrate loro l'abisso." },
                    { s: "Alphonse Elric (Corrotto)", t: "La mia armatura è vuota, ma ora è ricolma dell'Ordine Assoluto." },
                    { s: "Goku", t: "Non ti nascondere dietro i tuoi scagnozzi, Cell! Fatti avanti!" }
                  ],
                  postDialogue: [
                    { s: "Wario", t: "Wahh! La mia testa! Dove sono finite tutte le mie monete d'oro?!" },
                    { s: "Alphonse Elric", t: "Fratellone... scusa. Non sono riuscito a resistere a quel mostro. Vengo con voi a fermarlo." },
                    { s: "Metal Sonic", t: "*Bip*... Errore di sistema. Direttiva primaria di sottomissione annullata." },
                    { s: "Kratos", t: "La feccia è stata eliminata. Andiamo avanti." }
                  ],
                  boss: ['wario', 'metalsonic', 'alphonse'],
                  unlock: ['alphonse']
                },
                {
                  id: 'm36', title: 'I Mietitori',
                  dialogue: [
                    { s: "Ryuk (Corrotto)", t: "Le mele di questo mondo facevano schifo comunque... scriverò i vostri nomi in nome della Perfezione." },
                    { s: "Rias Gremory (Corrotta)", t: "Il mio Potere della Distruzione ora serve un solo, vero Re." },
                    { s: "Bort (Corrotto)", t: "Siete tutti così fragili. Vi spezzerò come vetro." },
                    { s: "Corvina", t: "Un Dio della Morte, un Demone Purosangue e una gemma inscalfibile. Attenti, il loro potere è immenso." }
                  ],
                  postDialogue: [
                    { s: "Rias Gremory", t: "Io... una Gremory, sottomessa in quel modo. Inaccettabile." },
                    { s: "Bort", t: "Pensavo che niente potesse scalfire la mia volontà. Mi sbagliavo. Mi sdebiterò combattendo al vostro fianco." },
                    { s: "Ryuk", t: "Hehehe... mi sono divertito. Credo che mi siederò qui a mangiare una mela mentre voi finite il lavoro." },
                    { s: "Topolino", t: "Siamo al centro dell'Arena. Manca solo lui." }
                  ],
                  boss: ['ryuk', 'rias', 'bort'],
                  unlock: ['bort']
                },
                {
                  id: 'm37', title: 'La Perfezione Assoluta',
                  forceFieldSize: 5,
                  dialogue: [
                    { s: "Cell", t: "Io sono l'evoluzione finale. Voi siete solo... spazzatura multiversale. Figlioli, distruggeteli!" },
                    { s: "Cell Jr. (Rosso)", t: "Kikiki! Giochiamo!" },
                    { s: "Goku", t: "Attenti ragazzi! Quei piccoli mostriciattoli generano una barriera impenetrabile attorno a Cell! Dobbiamo eliminarli per primi!" },
                    { s: "Topolino", t: "Esatto! La nostra forza non viene dalla perfezione, ma dall'unione di tutti i nostri universi!" }
                  ],
                  postDialogue: [
                    { s: "Cell", t: "Imp... impossibile! Ma... ahahah! Stolti! Pensate davvero che fossi io la mente dietro tutto questo?" },
                    { s: "Topolino", t: "Cosa?! Non eri tu a voler dominare le dimensioni?" },
                    { s: "Cell", t: "Ho fuso i mondi per nascondermi da LORO. Volevo un esercito per difendermi! Ma ora che l'avete distrutto... mi hanno trovato. Addio, feccia imperfetta! Arrangiatevi!" },
                    { s: "Finn l'Umano", t: "È scappato in un portale spaziotemporale! Ma... se lui era terrorizzato, cos'è quell'enorme voragine nera che si sta aprendo nel cielo?!" }
                  ],
                  boss: ['cell', 'celljr_1', 'celljr_2', 'celljr_3', 'celljr_4'],
                  unlock: []
                }
              ]
            },
            {
              name: "Settore 19: La Fine del Multiverso",
              description: "L'oscurità assoluta. Il vuoto dove risiedono i veri padroni del caos dimensionale.",
              bg: "bg-black",
              missions: [
                {
                  id: 'm38', title: 'I Veri Padroni (RAID)',
                  forceFieldSize: 6,
                  dialogue: [
                    { s: "Trigon", t: "Così, questo è l'esercito di insetti che ha distrutto il nostro umile scudo verde." },
                    { s: "Gaster", t: "I... n... t... e... r... e... s... s... a... n... t... e... La loro linea temporale finirà qui." },
                    { s: "Topolino", t: "Un demone gigante e... una strana ombra! Questa è davvero la battaglia finale! Ragazzi, schieriamo tutti!" }
                  ],
                  postDialogue: [
                    { s: "Trigon", t: "NOOO! I miei poteri oscuri... sconfitti da dei patetici mortali?! Maledizione a voi!" },
                    { s: "Gaster", t: "E... r... r... o... r... e... S... i... s... t... e... m... a... C... r... i... t... i... c... o..." },
                    { s: "Finn l'Umano", t: "L'abbiamo fatto! Abbiamo distrutto i capi di Cell!" },
                    { s: "Topolino", t: "Guardate! Il cielo si sta aprendo! Che succede ora?!" }
                  ],
                  boss: ['trigon', 'gaster'],
                  unlock: ['trigon', 'gaster']
                }
              ]
            }
          ]
        },
        {
            id: 'torneo_assoluto',
            title: "Il Torneo Assoluto: Alleanze",
            shortTitle: "Seconda Campagna",
            description: "Gli Dei esigono spettacolo! Forma un'Alleanza di 8 campioni e affronta scontri totali 6vs6 per salvare il tuo universo.",
            bg: "from-indigo-900 to-purple-950",
            intro: {
                title: "Il Torneo Assoluto",
                subtitle: "Regola d'Oro: Alleanze Multiversali",
                p1: "Zeno e Discord hanno deciso che le lotte singole sono noiose. Hanno istituito la Regola dell'Alleanza: gli universi devono unirsi in squadre da 8 combattenti!",
                p2: "Le battaglie si svolgeranno in enormi scontri 6 contro 6 sul ring. Scegli i tuoi 8 eroi, vinci il torneo per ottenere il potere delle Super Sfere del Drago e salva il tuo universo dalla cancellazione!"
            },
            sectors: [
            {
              name: "Settore 0: Il Raduno",
              description: "Il tuo eroe riceve l'invito al Torneo Assoluto. È il momento di formare l'alleanza definitiva.",
              bg: "bg-blue-950",
              missions: [
                {
                  id: 'm_zero', title: 'Una Nuova Sfida',
                  dialogue: [
                    { s: "Zeno", t: "Sì, sì! Ciao a tutti! Siete stati bravissimi contro quel brutto insetto verde e la sua polvere!" },
                    { s: "Discord", t: "Oh, assolutamente sublimi. Ho sgranocchiato popcorn per tutto il tempo guardandovi ruzzolare disperatamente tra le dimensioni in cerca di una via d'uscita." },
                    { s: "Topolino", t: "Oh mamma... e voi chi sareste? Siete per caso i padroni dell'oscurità che abbiamo intravisto alla fine?" },
                    { s: "Zeno", t: "Io sono Zeno! Il Re di Tutto! E lui è Discord. Tutto quel pasticcio con i varchi ci ha fatto notare che i vostri universi sono un po'... disordinati. C'è troppa gente in giro." },
                    { s: "Discord", t: "Esatto, caro roditore. È tempo di pulizie di primavera cosmiche. Abbiamo deciso di cancellare i mondi troppo caotici e inutili, ma Zeno è magnanimo e vi darà una possibilità di divertirci per salvarvi la pelliccia." },
                    { s: "Zeno", t: "Sì, sì! Un grande torneo! Il Torneo Assoluto! Vogliamo vedere lotte pazzesche e tanto divertimento! E non è tutto: il team vincitore potrà esprimere un desiderio a sua scelta usando le Super Sfere del Drago!" },
                    { s: "Topolino", t: "Le Super Sfere del Drago?! Ma aspetta... e per chi perde? Cancellerete i nostri mondi se non partecipiamo e non vinciamo?!" },
                    { s: "Discord", t: "Bingo! L'Alleanza vincente avrà il suo premio, mentre gli sconfitti faranno poof! E per renderlo più... piccante, abbiamo istituito la Regola dell'Alleanza: ogni fazione deve schierare una squadra formata da ben 8 campioni. 5 titolari per gli scontri doppi e 3 riserve tattiche!" },
                    { s: "Co-Protagonista", t: "Un torneo contro le alleanze più forti di tutti i mondi?! Non vedo l'ora di cominciare! Daremo il massimo!" },
                    { s: "Topolino", t: "Ragazzi, vi rendete conto che è in gioco l'esistenza di tutti noi? Dobbiamo chiamare a raccolta gli amici che ci hanno aiutato contro Cell. Dovremo fare delle scelte difficili per comporre l'alleanza perfetta." },
                    { s: "Whisper", t: "Attenzione, signori! Per qualificarvi ufficialmente e accedere al tabellone principale dovete prima superare il test di ammissione affrontando i robot d'allenamento di Bulma. Vi consiglio di non prenderlo alla leggera!" }
                  ],
                  postDialogue: [
                    { s: "Topolino", t: "Fiuuu, test superato! La nostra squadra da 8 è ufficiale ed è iscritta al torneo! Adesso non si torna più indietro." },
                    { s: "Co-Protagonista", t: "Siamo fortissimi! Ehi, adesso che siamo dentro possiamo andare al Villaggio dei Campioni? Ho bisogno di riposare prima degli scontri veri!" },
                    { s: "Zeno", t: "Sì, sì! Siete qualificati! Ci vediamo sul ring del torneo, mi raccomando fateci divertire tantissimo!" }
                  ],
                  boss: ['robo_aiutante_1', 'robo_aiutante_2', 'robo_aiutante_1', 'robo_aiutante_2'],
                  unlock: []
                }
              ]
            },
            {
              name: "Settore 1: Le Qualificazioni",
              description: "Le prime alleanze scendono in campo. Il lavoro di squadra è tutto.",
              bg: "bg-indigo-950",
              missions: [
                {
                  id: 'm39', title: 'L\'Alleanza Platform',
                  dialogue: [
                    { s: "Zeno", t: "Sì, sì! Benvenuti al Giorno 1 del Torneo Assoluto! Tutte le squadre sono state alloggiate nel Villaggio dei Campioni!" },
                    { s: "Discord", t: "Esatto! Avete passato gli ultimi giorni a conoscervi, ma ora si fa sul serio. Gli spalti sono pieni e il tabellone vi ha accoppiati subito con le vecchie glorie." },
                    { s: "Mario", t: "Mamma mia... abbiamo fatto settimane di ritiri tattici nel Regno dei Funghi per trovare la giusta sinergia tra me, Luigi e Bowser." },
                    { s: "Crash Bandicoot", t: "*Fa stretching intensivo nel tunnel degli spogliatoi, scaldandosi i muscoli e sgranocchiando un frutto Wumpa*" },
                    { s: "Co-Protagonista", t: "Ok squadra, siamo al nostro debutto. Respirate a fondo, guardate quanta gente là fuori... ricordatevi di coprire il compagno sul ring!" }
                  ],
                  postDialogue: [
                    { s: "Luigi", t: "Okey dokey... siamo stati eliminati già ai gironi. Ma è stata una bellissima partita di squadra." },
                    { s: "Discord", t: "Ah! Che scontro scoppiettante! Siete qualificati per il prossimo round, tornate pure in hotel a riposare!" }
                  ],
                  boss: ['mario', 'luigi', 'bowser', 'wario', 'crash', 'metalsonic'],
                  unlock: []
                },
                {
                  id: 'm40', title: 'L\'Alleanza Paranormale',
                  dialogue: [
                    { s: "Topolino", t: "Giorno 2. Uff, fa un freddo glaciale in questa sala d'attesa. Sono l'unico ad avere la tremarella?" },
                    { s: "Stewie", t: "Nessun mistero, topo. Ho hackerato il sistema di ventilazione della vostra ala del villaggio per favorire i nostri spettri. Siamo tatticamente superiori." },
                    { s: "Ladybug", t: "Non approvo questi trucchetti, Stewie! Un vero eroe vince lealmente basandosi sull'addestramento, non sabotando l'aria condizionata!" },
                    { s: "Re Boo", t: "Bwahaha! Lealtà? Questo è un torneo di sopravvivenza! I gironi di qualificazione non perdonano. Fuori i secondi, si va in scena!" }
                  ],
                  postDialogue: [
                    { s: "Chat Noir", t: "M'lady, le nostre sette vite non sono bastate. Le loro tattiche di panchina erano imprevedibili." },
                    { s: "Danny Phantom", t: "Ammetto che il vostro allenamento ha dato i suoi frutti. Meritate l'accesso alle Semifinali." }
                  ],
                  boss: ['ladybug', 'chatnoir', 'renarouge', 'dannyphantom', 'reboo', 'stewie'],
                  unlock: []
                },
                {
                  id: 'm40_5', title: 'L\'Alleanza dei Titani',
                  dialogue: [
                    { s: "Cyborg", t: "Analisi olografica della squadra avversaria completata. Robin, le loro statistiche di vittoria negli scontri 6vs6 sono dell'88%." },
                    { s: "Robin", t: "Perfetto. Titani, abbiamo passato le ultime 48 ore nella Stanza del Pericolo a simulare i loro pattern d'attacco. Sappiamo come neutralizzarli." },
                    { s: "Nightwing", t: "Esatto. Ricordate la regola d'oro: comunicate quando volete dare il cambio. Le sostituzioni sono cruciali in questo campionato." },
                    { s: "Bumblebee", t: "Abbiamo gli occhi di tutta Jump City puntati addosso sugli schermi! Pronta a pungere e a staccare un pass per i Quarti di Finale!" }
                  ],
                  postDialogue: [
                    { s: "Corvina", t: "Uff... il nostro piano partita era perfetto, ma hanno saputo improvvisare in modo brillante." },
                    { s: "Stellarubia", t: "Amici, è stata una sfida gloriosa e leale! Vi faremo il tifo dagli spalti per il resto del torneo!" }
                  ],
                  boss: ['bumblebee', 'robin', 'stellarubia', 'corvina', 'cyborg', 'nightwing'],
                  unlock: []
                }
              ]
            },
            {
              name: "Settore 2: Semifinali Cosmiche",
              description: "Il torneo entra nel vivo. Combina gli elementi e prevedi le mosse avversarie.",
              bg: "bg-red-950",
              missions: [
                {
                  id: 'm41', title: 'L\'Alleanza Elementale',
                  dialogue: [
                    { s: "Aang", t: "*Seduto a gambe incrociate in levitazione nel cortile di riscaldamento* L'energia del pubblico oggi è travolgente. Sento la loro tensione." },
                    { s: "Natsu", t: "*Sgranocchia carboni ardenti da un braciere* Quale tensione?! Io voglio solo spaccare tutto! Sono tre giorni che aspetto di salire su quel ring!" },
                    { s: "Pyra", t: "Risparmia il tuo fuoco per il match, Natsu. Arrivare alle Semifinali significa che i nostri avversari sanno sfruttare ogni debolezza elementale." },
                    { s: "Topolino", t: "Le telecamere sono accese. Controllate i subentri in panchina e non fatevi prendere dal panico. Questa alleanza non ha punti deboli evidenti." }
                  ],
                  postDialogue: [
                    { s: "Aang", t: "Incredibile... avete spezzato il nostro equilibrio difensivo con un pressing costante." },
                    { s: "Pyra", t: "Siamo fuori. È stato un onore incrociare le armi con voi. Vincerete questo torneo." }
                  ],
                  boss: ['aang', 'katara', 'zuko', 'natsu', 'juvia', 'pyra'],
                  unlock: []
                },
                {
                  id: 'm41_5', title: 'Arti Marziali e Magia',
                  dialogue: [
                    { s: "Maestro Shifu", t: "La pazienza è la virtù dei campioni. Abbiamo atteso questo incontro per giorni nei nostri alloggi, affinando lo spirito tramite la meditazione." },
                    { s: "Laxus", t: "Io ho atteso affilando i miei fulmini. Mi sono stancato di meditare su una stuoia, voglio sentire il boato dell'arena!" },
                    { s: "Po", t: "Io ho atteso scofanandomi i ravioli al vapore della mensa del Villaggio! Sono pazzeschi! Dovreste provarli prima di... beh, perdere." },
                    { s: "Juvia", t: "Juvia ha studiato tutte le registrazioni dei vostri incontri! Ha scoperto i vostri punti deboli e li userà per farsi notare dal suo amato Natsu!" }
                  ],
                  postDialogue: [
                    { s: "Maestro Shifu", t: "Eccellente tecnica marziale... avete mantenuto la disciplina persino sotto pressione." },
                    { s: "Mantide", t: "Ahia, le mie povere antenne! Ma che dire, un bel match è un bel match." }
                  ],
                  boss: ['natsu', 'juvia', 'laxus', 'mantide', 'po', 'shifu'],
                  unlock: []
                },
                {
                  id: 'm42', title: 'Titani dell\'Olimpo e della Terra',
                  dialogue: [
                    { s: "Kratos", t: "*Affila l'ascia Leviatano nell'ombra. I suoi passi fanno tremare letteralmente il pavimento degli spogliatoi.*" },
                    { s: "Poison Ivy", t: "Hanno dovuto rinforzare l'intera struttura architettonica dell'arena solo per permettere al nostro team di scendere sul ring. I pesi massimi sono qui." },
                    { s: "Godzilla", t: "*Un ruggito sordo e radioattivo proviene dai sotterranei, facendo cadere calcinacci dal soffitto*" },
                    { s: "Zazan", t: "Non vi servirà nessuna tattica. Tra un minuto sarete solo macchie sul pavimento. Schiacciamoli." }
                  ],
                  postDialogue: [
                    { s: "Kratos", t: "La vostra sinergia mentale... ha superato la nostra pura forza bruta. Degni avversari." },
                    { s: "Zeno", t: "Uaoooo! Un terremoto continuo! Che scontro esagerato! Ma c'è un'altra alleanza agguerritissima che vi aspetta prima della finalissima!" }
                  ],
                  boss: ['kratos', 'godzilla', 'groot', 'snorlax', 'poisonivy', 'zazan'],
                  unlock: []
                },
                {
                  id: 'm42_5', title: 'L\'Alleanza Implacabile',
                  dialogue: [
                    { s: "Peridot", t: "Ahah! Siete dei poveri illusi! Ho passato la nottata a trafugare il database del torneo per analizzare ogni vostra abitudine di combattimento!" },
                    { s: "Sanemi", t: "Mettiti via quel tablet luminoso, secchiona. A me basta stringere l'elsa della spada e sentire l'adrenalina pre-partita per farli a fette." },
                    { s: "Garnet", t: "Abbiamo riposato bene, ci siamo sincronizzate e abbiamo calcolato le percentuali di rischio. La probabilità che voi passiate questo turno è dello 0.1%." },
                    { s: "Shinobu", t: "Ara ara~ L'agonismo è così affascinante. Spero solo che non soffriate troppo quando sarete costretti a chiamare il medico del torneo." }
                  ],
                  postDialogue: [
                    { s: "Lapis", t: "Incredibile. Avete aggirato tutte le nostre difese e ribaltato i calcoli matematici." },
                    { s: "Sanemi", t: "Tsk. Maledizione! Non posso credere che ci abbiate buttati fuori a un passo dalla vetta." },
                    { s: "Discord", t: "Magnifico! Un trionfo tattico assoluto! Riposatevi, perché domani ci sarà la vera e unica Finale dei Mondi!" }
                  ],
                  boss: ['garnet', 'lapis', 'peridot', 'sanemi', 'shinobu', 'godzilla'],
                  unlock: []
                }
              ]
            },
            {
              name: "Settore 3: La Finale dei Mondi",
              description: "La sfida finale tra mortali. I più grandi eroi dei cartoni animati si sono uniti per formare l'alleanza definitiva.",
              bg: "bg-orange-950",
              missions: [
                {
                  id: 'm43', title: 'L\'Alleanza Cartoon',
                  dialogue: [
                    { s: "Zeno", t: "Sì, sì! Ci siamo! La Finalissima Assoluta dei Mondi! Lo stadio trabocca, ci sono miliardi di spettatori sintonizzati da ogni galassia!" },
                    { s: "Discord", t: "Abbiamo venduto i diritti televisivi perfino al Vuoto Cosmico! Fateci vedere uno spettacolo indimenticabile prima dell'incoronazione!" },
                    { s: "Co-Protagonista", t: "Siamo arrivati in cima, ragazzi. Abbiamo superato ogni ostacolo, ci siamo allenati duramente e ora ci giochiamo tutto sotto i riflettori!" },
                    { s: "Spongebob", t: "Sono pronto! I miei pori trasudano puro agonismo sportivo! Vinceremo noi la coppa gigante!" },
                    { s: "Plankton", t: "Sciocchi, a me della coppa non importa! Metterò le mani sui fondi del montepremi per costruire l'impero del Chum Bucket!" },
                    { s: "Marceline", t: "Mettiamo su un concerto rock che farà crollare le tribune. Dateci dentro, e che vinca l'alleanza migliore!" }
                  ],
                  postDialogue: [
                    { s: "Jake il Cane", t: "Oh cavolo... ci avete suonati di brutto! Le vostre tattiche di sostituzione ci hanno mandati al tappeto!" },
                    { s: "Zeno", t: "Coriandoli! Fuochi d'artificio! Siete i Campioni dei Mondi! Avete vinto il Torneo Regolare!" }
                  ],
                  boss: ['finn', 'jake', 'marceline', 'spongebob', 'patrick', 'plankton'],
                  unlock: []
                }
              ]
            },
            {
              name: "Settore 4: Sfida ai Creatori (Scontro Supremo)",
              description: "Siete i Campioni, ma gli Dei vogliono la loro sfida. Sconfiggeteli in questo scontro 6vs6 finale.",
              bg: "bg-purple-950",
              missions: [
                {
                  id: 'm44', title: 'I Signori dell\'Equilibrio',
                  dialogue: [
                    { s: "Topolino", t: "Ce l'abbiamo fatta... il torneo è finito, i nostri mondi sono ufficialmente salvi! È ora di fare le valigie all'hotel e tornare a casa." },
                    { s: "Discord", t: "Fermo lì, topo! Prima di lasciarvi andare via, io e Zeno vogliamo divertirci un po' in una partitella di esibizione fuori concorso!" },
                    { s: "Zeno", t: "Esatto! Non ci sono regole, nessun mondo a rischio... ma abbiamo assemblato il Dream Team più illegale, rotto e sbilanciato di sempre apposta per voi!" },
                    { s: "Goku", t: "Ehi ciao! Mi hanno detto che c'era l'opportunità di lottare contro i vincitori assoluti senza trattenere la potenza, non potevo mica perdermelo!" },
                    { s: "Gaster", t: "S... t... r... a... n... a... a... l... l... e... a... n... z... a... v... e... d... i... a... m... o... c... h... i... c... a... d... e... p... r... i... m... a." }
                  ],
                  postDialogue: [
                    { s: "Discord", t: "La mia... schiena astrale! Non ci posso credere, avete spazzato via anche il nostro Dream Team impossibile! Siete mostruosi!" },
                    { s: "Zeno", t: "Ahahah! Mi sono divertito tantissimo a guardarvi fare strategia! Siete i Campioni Assoluti e Indiscussi delle Alleanze!" },
                    { s: "Topolino", t: "Quindi... è finita sul serio? Discord, Zeno, abbiamo vinto. Ora pretendiamo il nostro premio: le Super Sfere del Drago!" },
                    { s: "Zeno", t: "Sì, sì! Siete i Campioni, le Sfere sono vostre! Qual è il vostro desiderio?" },
                    { s: "Co-Protagonista", t: "Non c'è nemmeno da pensarci. Desideriamo che tutti gli universi distrutti durante le eliminatorie vengano ripristinati immediatamente!" },
                    { s: "Discord", t: "Che noia, siete i soliti eroi dal cuore d'oro. Ma le regole sono regole! *Schiocco di dita* Desiderio esaudito! È stato un grande e bellissimo gioco, alla prossima stagione!" }
                  ],
                  boss: ['goku', 'utopia', 'trigon', 'gaster', 'cell', 'nito'],
                  unlock: []
                }
              ]
            }
          ]
        },
        {
            id: 'monarch_akuma',
            title: "L'Ombra di Monarch",
            shortTitle: "Terza Campagna",
            description: "La festa per la vittoria nel Torneo viene interrotta da sciami di Akuma! Usa Ladybug e Chat Noir per purificare i tuoi amici corrotti dalle emozioni negative.",
            bg: "from-purple-900 to-slate-950",
            intro: {
                title: "L'Ombra di Monarch",
                subtitle: "Prologo: Il Banchetto Interrotto",
                p1: "Sono passati alcuni mesi da quando gli eroi hanno salvato i loro universi nel Torneo Assoluto. Zeno e Discord hanno organizzato un enorme banchetto interdimensionale per festeggiare in pace.",
                p2: "Ma la felicità di molti nasconde la frustrazione di altri. Attratto da questa incredibile concentrazione di emozioni, Monarch (il portatore del Miraculous della Farfalla) ha invaso il Villaggio dei Campioni. Il suo piano è akumizzare i campioni uno ad uno per impadronirsi dei Miraculous di Ladybug e Chat Noir!"
            },
            sectors: [
            {
              name: "Settore 1: La Minaccia Oscura",
              description: "I primi giorni di pace vengono sconvolti. Monarch sfrutta le debolezze dei campioni per creare i suoi araldi.",
              bg: "bg-fuchsia-950",
              missions: [
                {
                  id: 'm_akuma1', title: 'Un Re Incompreso',
                  dialogue: [
                    { s: "Bowser", t: "Grrr... Non ci posso credere! Ho conquistato galassie, ho sputato fiumi di magma, eppure a questo banchetto tutti pendono dalle labbra di quell'idraulico baffuto! E la torta? Hanno dato a lui la fetta più grande con la ciliegina! È un affronto inaccettabile per il grande Re dei Koopa!" },
                    { s: "Topolino", t: "Suvvia Bowser, non fare così! È una festa per tutti, ci sono dolci in abbondanza se vuoi..." },
                    { s: "Bowser", t: "Taci, topo! Nessuno capisce la grandezza del mio genio incompreso! Mi trattano sempre come una barzelletta!" },
                    { s: "Monarch", t: "Ah... la frustrazione cocente di un sovrano ignorato e sminuito. L'invidia che corrode l'orgoglio. È una sinfonia perfetta per i miei scopi. Vola, mia piccola creatura oscura, e infetta quel cuore colmo di rabbia!" },
                    { s: "Ladybug", t: "Chat! Il mio yo-yo segnala un'anomalia... Quella è un'Akuma! Sta puntando verso Bowser!" },
                    { s: "Chat Noir", t: "Un'Akuma qui, nel Villaggio dei Campioni? Sembra che il nostro 'amico' Monarch non voglia proprio concederci una vacanza, M'lady." },
                    { s: "Topolino", t: "Un'a-che-cosa? Ragazzi, una farfalla nera è appena entrata nel guscio spinoso di Bowser! E ora c'è una maschera di luce viola sul suo volto!" },
                    { s: "Monarch", t: "Cuore Infranto, io sono Monarch. Ti hanno sempre umiliato e messo in secondo piano. Ora ti dono il potere inarrestabile per bruciare chiunque osi deriderti, per far capire a tutti chi è il vero Re. In cambio, mi porterai i Miraculous di Ladybug e Chat Noir!" },
                    { s: "Cuore Infranto", t: "BWAHAHAHA! Perfetto... Finalmente! Nessuno ignorerà più la mia potenza! Ridurrò in cenere questa festa, l'intero villaggio, e poi prenderò quei gioielli scintillanti per te, Monarch!" },
                    { s: "Ladybug", t: "Non se te lo impediremo noi! Attenti tutti, non è più in sé, le sue emozioni negative lo stanno controllando. Dobbiamo sconfiggerlo per liberare l'Akuma! Tikki, trasformami!" }
                  ],
                  postDialogue: [
                    { s: "Ladybug", t: "Niente più malefatte per te, piccola akuma! ... Miraculous Ladybug!" },
                    { s: "Bowser", t: "Ugh... la mia testa. Cos'è successo? Perché ho il sapore di cenere in bocca? E soprattutto... DOV'È FINITA LA MIA FETTA DI TORTA?!" },
                    { s: "Chat Noir", t: "Ben svegliato, fiammifero. Ci stavi dando del filo da torcere. Hai cercato di grigliare tutti gli invitati." },
                    { s: "Topolino", t: "Mamma mia... Se Ladybug non avesse ripristinato tutto con la sua magia, avremmo perso mezzo accampamento. Siete stati incredibili, ragazzi!" },
                    { s: "Ladybug", t: "È il nostro lavoro. Ma questo significa che Monarch ha trovato un modo per far viaggiare le sue Akuma attraverso le dimensioni." },
                    { s: "Monarch", t: "Avete vinto questa piccola scaramuccia, Ladybug e Chat Noir. Ma siete lontani da casa, vulnerabili. E questo multiverso pullula di anime frustrate, insicure e arrabbiate, pronte a servirmi. I vostri Miraculous saranno miei!" }
                  ],
                  boss: ['cuoreinfranto'],
                  unlock: ['bowser']
                },
                {
                  id: 'm_akuma2', title: 'Velocità Infranta',
                  dialogue: [
                    { s: "Topolino", t: "Sono passati tre giorni dall'incidente alla festa. Abbiamo raddoppiato le ronde, ma finora nessuna traccia di altre farfalle nere." },
                    { s: "Rainbow Dash", t: "Ugh, sono così frustrata! Ieri mi sono allenata con Sonic e quel tizio robot, Metal Sonic. Mi hanno battuta! Me! Il pony più veloce di tutta Equestria, lasciata a mangiare la polvere cibernetica!" },
                    { s: "Topolino", t: "Dash, non puoi vincere sempre. Metal Sonic ha dei propulsori a reazione spaziali, non c'è paragone..." },
                    { s: "Rainbow Dash", t: "Non m'importa! Se non sono la più veloce, allora chi sono?! Forse hanno ragione... forse sto perdendo il mio tocco. Forse sono diventata... lenta." },
                    { s: "Monarch", t: "La paura di non essere abbastanza. Il terrore di perdere la propria identità e la propria fama. Che preda prelibata per il mio sciame. Vola, mia piccola Akuma, e falle superare ogni limite... verso il baratro!" },
                    { s: "Chat Noir", t: "M'lady, il radar del tuo yo-yo sta impazzendo! Segnala un'altra intrusione oscura, settore ovest, vicino alla pista d'atletica!" },
                    { s: "Ladybug", t: "Presto Chat! Dobbiamo intercettarla prima che trovi un bersaglio debole emotivamente!" },
                    { s: "Monarch", t: "Terror Dash, io sono Monarch. Ti senti umiliata e scavalcata. Ti offro la velocità dell'oscurità assoluta, una rapidità che nessuno potrà mai eguagliare. Farai assaggiare la polvere a chi ti ha superato, in cambio dei Miraculous di Ladybug e Chat Noir!" },
                    { s: "Terror Dash", t: "Sì... Sì! Nessuno sarà più veloce di me! Porterò un uragano di terrore su chiunque osi sfidarmi!" },
                    { s: "Topolino", t: "Oh no, siamo arrivati tardi! Rainbow Dash è diventata completamente grigia, e ha degli occhi rossi spaventosi!" },
                    { s: "Chat Noir", t: "Accidenti, non ci voleva. Battere qualcuno che vola alla velocità della luce sarà una bella gatta da pelare..." },
                    { s: "Ladybug", t: "Dobbiamo bloccarla o stordirla! Se le permettiamo di prendere velocità, i suoi attacchi ci spazzeranno via!" }
                  ],
                  postDialogue: [
                    { s: "Ladybug", t: "Presa! Ciao ciao, farfallina. Miraculous Ladybug!" },
                    { s: "Rainbow Dash", t: "Cosa...? Dove sono? L'ultima cosa che ricordo è che volevo superare la barriera del suono per dimostrare quanto valessi..." },
                    { s: "Chat Noir", t: "E ci sei quasi riuscita, solo che lo stavi facendo circondata da fulmini neri molto poco rassicuranti." },
                    { s: "Rainbow Dash", t: "Oh cavolo... mi sono lasciata prendere dall'insicurezza. Io sono Rainbow Dash, non ho bisogno di distruggere tutto per dimostrare quanto sono veloce! Mi dispiace, ragazzi." },
                    { s: "Finn l'Umano", t: "Ehi ragazzi! Abbiamo visto i fulmini neri da lontano! Siete stati fantastici a fermarla!" },
                    { s: "Topolino", t: "Finn! Meno male che siete qui." },
                    { s: "Finn l'Umano", t: "Se questo Monarch se la prende con i nostri amici, vi diamo una mano noi a pattugliare!" }
                  ],
                  boss: ['terrordash'],
                  unlock: ['rainbowdash', 'finn']
                },
                {
                  id: 'm_akuma3', title: 'L\'Amico Demoniaco',
                  dialogue: [
                    { s: "Finn l'Umano", t: "Tutto tranquillo nel settore ovest. Jake, amico, stai bene? Sembri un po' giù di corda da quando Sonic ci ha superati l'altro giorno." },
                    { s: "Jake il Cane", t: "Oh, non è niente Finn... è solo che... tu diventi sempre più forte, hai spade magiche, salvi principesse... e io sono solo un cane che si allunga. Prima o poi non avrai più bisogno di me." },
                    { s: "Finn l'Umano", t: "Cosa?! Ma sei impazzito?! Tu sei il mio fratello magico! Senza di te non sarei sopravvissuto a metà delle nostre avventure!" },
                    { s: "Monarch", t: "Il timore dell'abbandono. L'inadeguatezza di un fratello maggiore che si sente inutile. Un'esca perfetta! Vola, mia piccola Akuma, e oscura quel cuore colmo di dubbio!" },
                    { s: "Ladybug", t: "Attenti! Un'Akuma si sta dirigendo proprio verso di voi!" },
                    { s: "Finn l'Umano", t: "Un'A-che-cosa?! Jake, spostati!" },
                    { s: "Jake il Cane", t: "Argh! La mia testa!" },
                    { s: "Monarch", t: "Jake il Demone, io sono Monarch. La paura di essere lasciato indietro ti divora. Ti dono il potere di diventare il guardiano assoluto, uno scudo inarrestabile. Nessuno potrà mai più fare a meno di te. In cambio, mi porterai i Miraculous di Ladybug e Chat Noir!" },
                    { s: "Jake il Demone", t: "GRRRR... IO PROTEGGERÒ FINN! STRITOLERÒ CHIUNQUE OSI AVVICINARSI! Sarete la mia colazione, eroi da strapazzo!" },
                    { s: "Finn l'Umano", t: "No, Jake! Ladybug, Chat Noir, aiutatemi a farlo tornare in sé! Non voglio fargli del male!" },
                    { s: "Ladybug", t: "Tranquillo Finn! Dobbiamo solo stancarlo e distruggere l'oggetto akumizzato! In questo caso... il suo collare!" }
                  ],
                  postDialogue: [
                    { s: "Ladybug", t: "Preso il collare! Niente più malefatte per te, piccola akuma! ... Miraculous Ladybug!" },
                    { s: "Jake il Cane", t: "Oh... ohi ohi... la mia pancia. Credo di aver mangiato troppa oscurità. Ha il sapore di calzini vecchi dimenticati al sole." },
                    { s: "Finn l'Umano", t: "JAKE! Fratello!" },
                    { s: "Jake il Cane", t: "Scusa, Finn. Quella farfallina mi ha fatto pensare a cose bruttissime. Mi sentivo così inutile..." },
                    { s: "Finn l'Umano", t: "Non spaventarmi mai più così! Io ho bisogno di te, amico. Siamo inseparabili, ricordi?" },
                    { s: "Chat Noir", t: "Un vero lieto fine. Anche se il mio costume è completamente ricoperto di bava di demone gigante elastico." },
                    { s: "Finn l'Umano", t: "Siete stati formidabili, eroi di Parigi. Ora che anche Jake sta bene, ci prepareremo per la prossima minaccia!" },
                    { s: "Monarch", t: "Illusi. Ogni alleanza che forgiate sarà la vostra debolezza. Le vostre paure sono un serbatoio infinito per il mio potere. Non mi fermerò finché non avrò i Miraculous!" }
                  ],
                  boss: ['jakeildemone'],
                  unlock: ['jake']
                }
              ]
            },
            {
              name: "Settore 2: Legami Spezzati",
              description: "Monarch inizia a prendere di mira i legami più stretti tra i campioni, cercando di distruggere le loro amicizie per ottenere potere.",
              bg: "bg-indigo-950",
              missions: [
                {
                  id: 'm_akuma4', title: 'I Sovrani della Rovina',
                  dialogue: [
                    { s: "Zatch bell", t: "Ponygon, no! Quello è Vulcan 300, il mio migliore amico costruito con una scatola di merendine! Non morderlo, ti prego!" },
                    { s: "Ponygon", t: "Meru meru meee! (Stringe la scatola tra i denti e tira fortissimo giocando)" },
                    { s: "Zatch bell", t: "Lascialo! Così lo rompiamo! Dai, Ponygon, molla la presa!" },
                    { s: "Topolino", t: "*(Strappo netto)* Oh cielo... si è letteralmente spezzato a metà." },
                    { s: "Zatch bell", t: "Oh no... Vulcan... si è strappato. Il mio amico..." },
                    { s: "Ponygon", t: "Meru... (Abbassa le orecchie, rendendosi conto del danno, profondamente triste e in colpa)" },
                    { s: "Monarch", t: "Il dolore pungente di un'amicizia ferita. Il senso di colpa soffocante per aver rovinato qualcosa di prezioso. L'incapacità di comprendersi. Le emozioni perfette per... non una, ma ben due vittime! Vola, mia piccola Akuma, e corrompi quel giocattolo spezzato che li unisce!" },
                    { s: "Ladybug", t: "Attenti ragazzi! L'Akuma è entrata di scatto in quello che rimane della scatola di cartone che tengono in mano!" },
                    { s: "Monarch", t: "Sovrani della Rovina, io sono Monarch. Vi sentite in colpa, tristi, incompresi. Vi dono il potere di distruggere ogni cosa, così che nulla in questo fragile mondo possa più ferirvi o spezzarsi. Sarete i dominatori assoluti... in cambio dei Miraculous di Ladybug e Chat Noir!" },
                    { s: "Re della Rovina", t: "Questo mondo è troppo fragile... Non mi serve. Ti porteremo i gioielli! ZAKER OSCURO!" },
                    { s: "Destriero Oscuro", t: "MERU RAWRRR! (Avvolge il suo corpo in fiamme oscure)" },
                    { s: "Finn l'Umano", t: "Santo cielo, il ragazzino spara fulmini neri e il cavallino è diventato un demone in fiamme! Ladybug, Chat Noir, vi copro io!" },
                    { s: "Chat Noir", t: "Sembra che questi due abbiano deciso di darci una bella 'scossa' emotiva, M'lady." },
                    { s: "Ladybug", t: "Meno battute, Chat! L'oggetto akumizzato è quel robottino di cartone che tengono stretto, ma dobbiamo prima stenderli entrambi per arrivarci!" }
                  ],
                  postDialogue: [
                    { s: "Ladybug", t: "Preso! Niente più malefatte per te, piccola Akuma! Miraculous Ladybug!" },
                    { s: "Topolino", t: "Guardate! Lo sciame magico di Ladybug ha appena riparato completamente Vulcan 300!" },
                    { s: "Zatch bell", t: "Ugh... la mia bocca sa di cenere. Eh?! Vulcan 300! Sei di nuovo intero! Scusa Ponygon, non volevo arrabbiarmi così tanto con te." },
                    { s: "Ponygon", t: "Meru... meru me. (Scuote la testa terrorizzato guardandosi le zampe, poi corre via veloce verso la foresta dell'accampamento)" },
                    { s: "Zatch bell", t: "Ponygon, aspetta! Uffa, si è spaventato tantissimo per via di quell'energia oscura che aveva in corpo. Deve essersi sentito in trappola ed è scappato." },
                    { s: "Finn l'Umano", t: "Lasciagli un po' di spazio, Zatch. Si calmerà e tornerà. Nel frattempo, noi abbiamo un tizio con le farfalle da sistemare." },
                    { s: "Zatch bell", t: "Hai ragione, Finn! Quel 'Monarch' ha usato il povero Vulcan 300 per fare del male ai miei amici e spaventare Ponygon! Io, Zatch Bell, diventerò un Re gentile e non permetterò a nessuno di fare il prepotente! Vi aiuterò io!" },
                    { s: "Chat Noir", t: "Un re che spara fulmini dalla bocca? Purr-fetto, la nostra squadra si fa sempre più elettrizzante." }
                  ],
                  boss: ['zatch_akuma', 'ponygon_akuma'],
                  unlock: ['zatchbell']
                },
                {
                  id: 'm_akuma5', title: 'Uscita a Quattro Rovinata',
                  forcedRoster: ['maxcaulfield', 'marceline'],
                  progressOnDefeat: true,
                  dialogue: [
                    { s: "Topolino", t: "Oggi l'accampamento è tranquillo. Max e Marceline hanno organizzato un'uscita a quattro con le loro ragazze vicino al lago!" },
                    { s: "Max Caulfield", t: "Chloe, dai, non fare così. Stavo solo ascoltando la spiegazione di Bonnibel sulla struttura molecolare dello zucchero... era interessante!" },
                    { s: "Chloe Price", t: "Interessante?! Per tre ore, Max?! Vi siete isolate completamente! Che senso ha fare un'uscita a quattro se io devo stare qui a fissare le paperelle del lago?" },
                    { s: "Gommarosa", t: "La scienza richiede concentrazione, Chloe. E il tuo atteggiamento ostile è statisticamente inutile per la risoluzione di questo futile conflitto." },
                    { s: "Marceline", t: "Ehi Bonnie, vacci piano, non fare la secchiona adesso. E tu Chloe, dacci un taglio e smettila di fare la bambina." },
                    { s: "Chloe Price", t: "Perfetto. Fate tutti squadra contro di me, giusto?! Voi due siete le principessine perfette e geniali... e io sono solo lo stupido terzo incomodo! Anzi, quarto!" },
                    { s: "Monarch", t: "Oh... il pungente sapore dell'esclusione. Il sentirsi stupidi e messi da parte da chi si ama. La gelosia che si trasforma in pura rabbia elettrica! Vola, mia piccola Akuma, e accendi il suo odio!" },
                    { s: "Chloe Price", t: "Argh! La mia chitarra... scotta!" },
                    { s: "Monarch", t: "Static Shocker, io sono Monarch. Ti fanno sentire inutile e ignorante? Ti darò il potere di farti ascoltare da tutto il multiverso con una scossa inarrestabile! In cambio, voglio i Miraculous!" },
                    { s: "Static Shocker", t: "Alzerò il volume al massimo! Nessuno potrà più ignorarmi!" },
                    { s: "Max Caulfield", t: "Oh no... Marceline, Ladybug e Chat Noir sono lontani da qui in pattuglia! Dobbiamo fermarla noi due!" },
                    { s: "Marceline", t: "Sfoderiamo i bassi, Max. Facciamola ragionare a suon di musica... e botte!" }
                  ],
                  postDialogue: [
                    { s: "Static Shocker", t: "Ahahah! Ve l'avevo detto che la mia musica vi avrebbe letteralmente spazzate via!" },
                    { s: "Monarch", t: "Eccellente, Static Shocker. Usa il tuo ritmo dissonante per piegare le loro menti. Saranno le tue coriste obbedienti!" },
                    { s: "Marceline", t: "Ugh... la mia testa... la sua musica... non riesco a pensare ad altro... ha un ritmo così... perfetto..." },
                    { s: "Max Caulfield", t: "Chloe... la tua voce... è l'unica cosa che conta. Faremo... faremo tutto quello che vorrai..." },
                    { s: "Static Shocker", t: "Molto meglio! E ora, mie fedeli groupies, andiamo a dare una bella scossa a quegli insetti di Parigi!" }
                  ],
                  boss: ['staticshocker_invincible'],
                  unlock: []
                },
                {
                  id: 'm_akuma6', title: 'Il Ritmo dell\'Eroismo',
                  forcedRoster: ['ladybug', 'chatnoir'],
                  dialogue: [
                    { s: "Chat Noir", t: "M'lady! Abbiamo sentito un boato pazzesco dal lago! Guarda là... Chloe ha un aspetto elettrizzante." },
                    { s: "Ladybug", t: "Fermati, Chloe! O dovrei dire Static Shocker! Lascia andare Max e Marceline, non costringerci a farti del male!" },
                    { s: "Static Shocker", t: "Non sono più Max e Marceline! Sono le mie groupies personali! Coriste, attaccate gli intrusi!" },
                    { s: "Max (Sottomessa)", t: "Come desideri... Chloe." },
                    { s: "Marceline (Sottomessa)", t: "Strappiamo le loro corde vocali." },
                    { s: "Chat Noir", t: "M'lady, le hanno fatto il lavaggio del cervello! Ma sembrano un po' provate dalla botta di prima, non sono al massimo delle forze." },
                    { s: "Ladybug", t: "Meglio per noi! Dobbiamo disarmare Static Shocker e spezzare la sua chitarra, così l'incantesimo si scioglierà! Attento ai suoi accordi, Chat!" }
                  ],
                  postDialogue: [
                    { s: "Ladybug", t: "Presa! Niente più malefatte per te, piccola akuma! ... Miraculous Ladybug!" },
                    { s: "Chloe Price", t: "Ugh... la mia testa. C-cosa è successo? Max... ho rovinato tutto di nuovo, vero?" },
                    { s: "Max Caulfield", t: "Shh, Chloe. Va tutto bene. Era colpa di quell'insetto gigante, non tua. Ti prometto che non parleremo più di chimica zuccherina, o quello che era." },
                    { s: "Gommarosa", t: "Per la cronaca, mi scuso anche io. Ho sottovalutato le tue reazioni emotive. Analizzerò meglio il contesto sociale la prossima volta." },
                    { s: "Marceline", t: "Questa è Bonnibel per dire 'Scusa, sono stata una secchiona insopportabile'. Tutto risolto!" },
                    { s: "Chat Noir", t: "Un altro lieto fine! Anche se ho le orecchie che fischiano ancora per quel ronzio elettrico." }
                  ],
                  boss: ['staticshocker', 'maxcaulfield_corrotta', 'marceline_corrotta'],
                  unlock: ['maxcaulfield', 'chloeprice', 'marceline']
                }
              ]
            },
            {
              name: "Settore 3: Il Peso dell'Eredità",
              description: "Monarch punta ai maestri e alle guide, corrompendo la loro saggezza e sfruttando la loro ansia di fallire con gli allievi.",
              bg: "bg-emerald-950",
              missions: [
                {
                  id: 'm_akuma7', title: 'Lezione di Paralisi',
                  dialogue: [
                    { s: "Maestro Shifu", t: "Quante volte devo dirtelo, Po?! La concentrazione è tutto! Non puoi fermarti a mangiare ravioli mentre esegui i Kata base!" },
                    { s: "Po", t: "Ma Maestro, il mio stomaco faceva rumori fortissimi! Era una disarmonia pura dell'universo che andava placata con del cibo al vapore!" },
                    { s: "Maestro Shifu", t: "Pazienza! Disciplina! Perché i miei studenti sono sempre così indisciplinati? Tai Lung... Tigre... e ora tu. Forse il problema sono io. Forse non sono un buon maestro, forse fallirò anche con il Guerriero Dragone." },
                    { s: "Monarch", t: "Ah... il senso di inadeguatezza di un grande saggio. Il peso opprimente delle aspettative non realizzate verso se stesso. Meraviglioso! Vola, mia piccola Akuma, e offuscagli la mente!" },
                    { s: "Ladybug", t: "Attenti ragazzi! Il bastone del Maestro Shifu è stato infettato!" },
                    { s: "Monarch", t: "Maestro Spietato, io sono Monarch. I tuoi studenti non ascoltano? Sono troppo indisciplinati? Ti offro il potere di piegare le loro menti e i loro corpi ribelli con la disciplina assoluta. E in cambio... i Miraculous!" },
                    { s: "Maestro Spietato", t: "L'indisciplina sarà sradicata con il dolore. Po, ti darò la lezione definitiva!" },
                    { s: "Po", t: "Maestro, no! Skadoo-- ugh! Ahia! Ah! Mi ha colpito i centri nervosi... non riesco a muovere un muscolo! Sono diventato un panda di sasso!" },
                    { s: "Chat Noir", t: "Sembra che il Maestro abbia bisogno di una lezione di relax intensivo, M'lady! E il nostro panda gigante è fuori gioco." },
                    { s: "Ladybug", t: "Ci pensiamo noi! State in guardia, è incredibilmente veloce ed usa l'energia oscura per colpire i punti vitali!" }
                  ],
                  postDialogue: [
                    { s: "Ladybug", t: "Presa! Niente più malefatte per te, piccola akuma! ... Miraculous Ladybug!" },
                    { s: "Maestro Shifu", t: "Ugh... Po? Dove sono? Perché ti stai toccando la pancia come una statua?" },
                    { s: "Po", t: "Fiuuu! Mi si sono sbloccati i muscoli! Maestro, era diventato tutto viola e spaventoso e mi aveva bloccato il chi!" },
                    { s: "Maestro Shifu", t: "Io... ho perso la pace interiore. L'ansia di fallire con te mi ha reso cieco, e quella magia oscura ne ha approfittato." },
                    { s: "Po", t: "Maestro, lei è il migliore che ci sia! Non si preoccupi per me, so il fatto mio. Anche se ogni tanto mangio troppi ravioli." },
                    { s: "Chat Noir", t: "Tutto è bene quel che finisce bene! Anche se mi fa ancora male la schiena per quei calci rotanti." },
                    { s: "Maestro Shifu", t: "Vi sono debitore, eroi di Parigi. Affronterò questo 'Monarch' assieme a voi per ristabilire l'equilibrio." }
                  ],
                  boss: ['maestrospietato'],
                  unlock: ['shifu']
                }
              ]
            }
          ]
        }];
