// Registro pubblico degli aggiornamenti introdotti nelle sessioni recenti.
// Ordine: più recente prima. Le schede descrivono le modifiche effettivamente
// presenti nel gioco, distinguendo bilanciamento, funzionalità e correzioni.
export const UPDATE_CATEGORIES = [
  {id:'all',name:'Tutto',icon:'📜'},
  {id:'features',name:'Modalità e funzioni',icon:'🕹️'},
  {id:'campaigns',name:'Campagne e storia',icon:'📖'},
  {id:'balance',name:'Bilanciamento',icon:'⚖️'},
  {id:'champions',name:'Personaggi e abilità',icon:'⭐'},
  {id:'items',name:'Strumenti',icon:'🎒'},
  {id:'interface',name:'Grafica e interfaccia',icon:'🎨'},
  {id:'mastery',name:'Padronanza',icon:'🏆'},
  {id:'fixes',name:'Bug risolti',icon:'🛠️'}
];
export const GAME_UPDATES = [
  {id:'nov4-coop-two-starters',category:'balance',date:'04/11/2026',title:'🛡️ Roguelike Co-op: due Multimon iniziali per giocatore!',items:[
    'Nella Roguelike Co-op da 2 o 3 partecipanti, ciascuno sceglie due Multimon già prima del primo piano: in tre si parte con sei personaggi totali.',
    'Il primo personaggio scelto entra in campo e il secondo resta come riserva; rimane una lotta di squadra contro un solo nemico, con un Multimon attivo a testa.',
    'La riserva può entrare tramite Cambio durante la battaglia oppure sostituire un Multimon sconfitto; i suoi PS restano conservati tra i piani.',
    'Dopo la prima scelta vengono proposti altri tre campioni per selezionare il secondo, senza duplicati o boss esclusivi delle Campagne.',
    'Aggiornati la lobby, il contatore delle scelte e il tutorial di Natsu; le spedizioni già nel vecchio draft con un solo iniziale possono ancora proseguire.',
    'Non cambiano la durata della spedizione, le ricompense individuali, il limite di tre giocatori né le statistiche dei boss.'
  ]},

  {id:'nov4-noncollapsing-roster-cards',category:'fixes',date:'04/11/2026',title:'🛠️ Risolto roster a striscioline su tablet e PC',items:[
    'Corretto il problema che, con tanti campioni disponibili, comprimeva le schede in righe sottilissime nascondendo quasi completamente i PNG.',
    'La griglia ora conserva sempre la vera altezza dei ritratti e delle statistiche; i personaggi in più si raggiungono scorrendo normalmente.',
    'Altezza minima protetta per ogni scheda, immagini non comprimibili, 2 colonne sui telefoni e 3 sui tablet.',
    'Correzione applicata a Scegli la tua Squadra, draft condiviso, squadre Campagna, scelta del protagonista e Roguelike.',
    'Aggiunto test di regressione per impedire che gli oltre 80 personaggi facciano collassare le schede in futuro.'
  ]},

  {id:'nov4-tablet-roster-png-layout',category:'interface',date:'04/11/2026',title:'🖼️ Roster più ordinati e PNG finalmente visibili su tablet',items:[
    'Sistemata la griglia di selezione dei Multimon: due colonne su smartphone, tre su tablet, quattro o più solo sugli schermi grandi, con spazi regolari tra le carte.',
    'Le immagini dei personaggi ora sono più grandi e usano riquadri con adattamento completo, senza essere tagliate in minuscoli cerchi.',
    'Migliorati il draft normale e condiviso, la scelta della squadra nelle Campagne, la scelta del protagonista nel Torneo Assoluto e il draft iniziale della Roguelike.',
    'Nomi lunghi leggibili su due righe, margini più ampi e stato di selezione visibile senza ingrandire o coprire le immagini.',
    'Nessuna variazione alle regole di gioco, ai personaggi posseduti o ai progressi salvati.'
  ]},
  {id:'nov4-progressive-power-chests',category:'balance',date:'04/11/2026',title:'📈 Casse Potenza a ricompense crescenti',items:[
    'In Roguelike Solo e Co-op le casse del piano 5, 10 e 15 danno 3–8 Punti Forza.',
    'Le casse dei piani 20, 25 e 30 danno 5–11 Punti Forza.',
    'Le casse dei piani 35, 40 e 45 danno 7–14 Punti Forza.',
    'La cassa del piano 50 dà 10–18 Punti Forza.',
    'Le fasce si applicano anche a casse non ancora aperte; quelle già riscosse non cambiano.',
    'Aggiornate le spiegazioni nel menu, nella schermata Casse Potenza e nei dialoghi di Finn. Il bonus finale di 30 PF e i 5 Bauli normali restano invariati.'
  ]},

  {id:'nov4-coop-personal-rewards-guided-menu',category:'features',date:'04/11/2026',title:'🎁 Premi Roguelike Co-op per tutti + 16 guide dei personaggi',items:[
    'Roguelike Co-op: ogni giocatore umano riceve sul proprio profilo una Cassa Potenza ogni 5 piani superati, identica alla Roguelike Solo (2–8 Punti Forza quando viene aperta).',
    'Ogni piano Co-op vinto assegna anche 10–15 monete personali a ciascun partecipante, oltre alle monete condivise della spedizione. Non vengono sottratte agli alleati.',
    'Al piano 50 completato, ogni partecipante riceve individualmente il premio finale di 30 Punti Forza, se sono trascorse 4 ore dall’ultimo bonus, e 5 Bauli normali con due ricompense ciascuno.',
    'Anche la Roguelike Solo ora assegna 5 Bauli normali quando completi tutti i 50 piani. Sono riscattabili dal menu Bauli Campagna.',
    'Premi protetti contro doppi click e ricaricamenti con ID unici della spedizione. Il recupero automatico permette a chi era scollegato di riscattare i traguardi della sua stessa squadra al rientro.',
    'Le casse e i punti vengono registrati nel profilo personale e sincronizzati con il cloud del relativo account, mai nel portafoglio comune della stanza.',
    'La prima volta che clicchi ogni pulsante principale, un personaggio dedicato appare con una guida illustrata e due brevi spiegazioni; dopo la conferma la lezione non si ripete e la preferenza viene salvata.',
    'Goku presenta Gioca vs CPU, Plankton il Negozio, Finn la Roguelike Solo e Natsu la Co-op; anche Campagne, PvP, Locale, Sopravvivenza, Catalogo, Tipi, Bauli, Casse Potenza, Laboratorio e Statistiche hanno ciascuno una guida diversa.',
    'Le vecchie guide di Finn e del Professore nel Laboratorio e nelle Casse continuano a funzionare, con le spiegazioni aggiornate sui nuovi premi.'
  ]},

  {id:'nov4-torneo-assoluto-recovery',category:'fixes',date:'04/11/2026',title:'🏆 Recupero speciale dei progressi della seconda campagna',items:[
    'Aggiunto un recupero una tantum tramite codice privato nella sezione Account e Salvataggi Cloud, disponibile solo dopo l’accesso con email.',
    'Ripristina il completamento delle 10 missioni del Torneo Assoluto, sblocca la campagna successiva e recupera solo le casse delle missioni non ancora premiate.',
    'Mantiene le monete della campagna a un valore almeno pari alle 1.550 previste (50 iniziali + 150 per missione), senza ridurre un saldo già maggiore.',
    'Preserva casse già aperte, relative ricompense, statistiche, personaggi, strumenti e progressi delle altre modalità.',
    'Prima dell’operazione crea una copia di sicurezza e salva sul cloud con verifica dei conflitti. Il vecchio contenuto casuale di casse perse non può essere ricostruito esattamente.'
  ]},

  {id:'nov4-spray-cake-type-adjustment',category:'balance',date:'04/11/2026',title:'🧁 Nuovi tipi per le mosse di Clover e Blueberry Muffin',items:[
    'Torta di Mezzanotte di Blueberry Muffin cambia da Folletto a Psico.',
    'Spray Confondente di Clover cambia da Veleno a Folletto.',
    'Entrambe le mosse ora ricevono il bonus STAB del 50% perché appartengono a uno dei tipi del proprio Multimon. Potenza, precisione e probabilità degli effetti secondari restano invariate.'
  ]},
  {id:'nov4-five-new-original-multimon',category:'champions',date:'04/11/2026',title:'🌟 Star Butterfly, Sam, Clover, Superman e Blueberry Muffin: cinque stili unici',items:[
    'Star Butterfly (Magico/Folletto, 260 monete) — Bacchetta Capricciosa: una volta per turno, al primo attacco che causa danni, 35% di attivare un effetto a sorpresa tra guarigione 8% PS, Velocità +10% o Velocità nemica −12%.',
    'Star Butterfly usa Narvali Interdimensionali (2–3 colpi), Tempesta Arcobaleno (tutti gli avversari), Bacchetta a Sorpresa (25% confusione) e Dip Down (cura con potenziamento).',
    'Sam di Totally Spies (Robot/Psico, 180 monete) — Memoria Analitica: dopo aver subito un attacco, resiste del 25% ai successivi colpi di quel tipo; cambiare tipo di mossa le fa perdere il vantaggio. Non legge scelte segrete.',
    'Sam usa Analisi sul Campo (Attacco nemico −20%), Rete di Contenimento (possibile stordimento), Laser Compatto (ignora bonus difensivi) e Piano di Estrazione (Difesa e Velocità).',
    'Clover di Totally Spies (Folletto/Lotta, 180 monete) — Istinto da Copertina: 12% elusione naturale; la prima schivata del turno aumenta il proprio Attacco del 12%.',
    'Clover usa Tacco a Reazione (priorità +1), Spray Confondente, Flash da Copertina (riduce Precisione) e Cambio di Look (cura e Velocità).',
    'Superman (Luce/Lotta, 350 monete) — Corpo Kryptoniano: resistenza del 20% ai colpi con potenza base fino a 100; subisce invece il 25% di danni in più dalle mosse Magico. I colpi più forti ignorano la riduzione.',
    'Superman usa Visione Termica, Soffio Artico, Intervento Eroico (cura e potenzia un alleato) e Pugno della Giustizia (fortissimo ma con contraccolpo).',
    'Blueberry Muffin (Erba/Psico, 160 monete) — Lettura Geniale: le mosse di supporto riuscite caricano fino a 2 Appunti; il successivo attacco li consuma per +20% danni ciascuno.',
    'Blueberry Muffin usa Ricetta Annotata (cura e prepara Appunti), Muffin ai Mirtilli (drenaggio), Appunti Rivelatori (debuff doppi) e Torta di Mezzanotte (colpo speciale).',
    'Tutti e cinque usano i PNG richiesti e dispongono ciascuno di un titolo esclusivo di Padronanza. Le abilità speciali sono state integrate nella logica reale dei turni.'
  ]},

  {id:'nov4-six-new-multimon-deployment',category:'champions',date:'04/11/2026',title:'🍓 Sei nuovi Multimon: Fragolina, Altra Madre, Blaze, Shadow, Sonic e Tails',items:[
    'Fragolina Dolcecuore (Erba/Folletto): supporto e guarigione; Cuore Generoso cura a fine turno l’alleato in campo più ferito. Mosse Fragole Volanti, Marmellata Incantata, Frullato Rinvigorente e Pioggia di Bacche.',
    'Altra Madre (Spettro/Buio): controlla il campo con Sguardo di Bottoni (Velocità nemica −15% all’ingresso). Mosse Aghi di Bottoni, Fili di Ragnatela, Promessa Perfetta e Mani dell’Altro Mondo.',
    'Blaze the Cat (Fuoco/Psico): Fiamma Imperiale sotto il 40% PS aumenta Attacco +30% e Velocità +25%, una volta per battaglia. Mosse Artigli Ardenti, Fiamma delle Sol Emerald, Telecinesi Reale e Aura Ardente.',
    'Shadow the Hedgehog (Oscuro/Elettro): Forma di Vita Suprema potenzia del 20% il primo attacco del turno. Mosse Chaos Spear, Chaos Control, Chaos Blast e Colpo Inibitore.',
    'Sonic the Hedgehog (Aria/Normale): Troppo Veloce! aumenta la Velocità del 15% al primo ingresso. Mosse Spin Dash, Attacco Homing, Ciclone Blu e Velocità della Luce.',
    'Tails (Aria/Robot): Ingegnere Geniale aumenta del 15% la Difesa degli alleati in campo all’ingresso. Mosse Doppia Elica, Cannone Tornado, Kit di Riparazione e Super Gadget.',
    'Tutti e sei hanno le immagini fornite, un prezzo di sblocco nel Negozio, 24 mosse totali e un titolo di Padronanza esclusivo raggiungibile al livello 20.',
    'Corretto il blocco della pubblicazione automatica: sono stati aggiornati i test che impedivano a GitHub Pages di compilare la versione contenente i nuovi personaggi.'
  ]},
  {id:'nov4-account-progress-protection',category:'fixes',date:'04/11/2026',title:'☁️ Account persistente e recupero dei progressi',items:[
    'Firebase Auth ora richiede esplicitamente di conservare l’accesso tra le aperture del browser.',
    'Se una sessione precedente non viene ripristinata, il gioco non sostituisce automaticamente i progressi dell’account con quelli di un ospite: chiede di accedere di nuovo.',
    'I dati locali divergenti dal cloud vengono protetti e mostrati in una scelta esplicita prima di sostituire un salvataggio.',
    'Controllo di sincronizzazione cloud ogni due secondi quando il profilo cambia e protezione delle modifiche effettuate da altre sessioni.',
    'Aggiunto un pannello per controllare e ripristinare i backup precedenti con conferma, oltre a copie di sicurezza locali periodiche.',
    'I salvataggi locali e i profili storici per nome vengono conservati durante i cambi account; non è possibile garantire il recupero dei dati già cancellati.'
  ]},
  {id:'nov4-strategic-cpu',category:'balance',date:'04/11/2026',title:'🧠 IA migliorata: CPU aggressive, difensive e strategiche',items:[
    'Le CPU ora distinguono tre stili: aggressivo (ricerca KO), difensivo (cure e protezioni ragionate), strategico (sostituzioni per vantaggi di tipo e sopravvivenza).',
    'Le CPU ricordano solo le mosse realmente eseguite in battaglia: non possono leggere le azioni non ancora mostrate né il moveset segreto dei nemici.',
    'Le mosse a più bersagli vengono valutate per efficacia, mentre strumenti condivisi e limiti d’uso online vengono rispettati.',
    'La schermata di presentazione dello scontro mostra lo stile della CPU e il gioco evita che i bot restino senza azione per mosse in ricarica.'
  ]},

  {id:'nov3-coop-roguelike-chart-battle',category:'features',date:'03/11/2026',title:'🧬 Chart dei tipi in battaglia e Roguelike Co-op finalmente condivisa',items:[
    'La tabella completa dei 23 tipi è consultabile in qualsiasi battaglia dal nuovo pulsante 🧬 Chart tipi. Si apre e chiude senza perdere il turno o uscire dallo scontro; riusa i rapporti di efficacia reali del gioco.',
    'Roguelike Co-op: la lobby online ora riceve gli aggiornamenti Firestore prima dell’inizio. Puoi condividere il codice e far entrare fino a tre giocatori umani, con uno slot CPU separato.',
    'L’host può iniziare con due o tre giocatori: ognuno sceglie un solo Multimon nel draft iniziale e combatte controllando la propria squadra; in campo c’è un Multimon per persona.',
    'La Co-op non applica più i moltiplicatori enormi della modalità Juggernaut al nemico normale. I nemici scalano per piano e numero di giocatori, con mini-boss ogni dieci piani.',
    'Dopo ogni vittoria, tutti vedono un accampamento condiviso con squadre e PS conservati, monete della spedizione, reclutamento e possibilità di curare o rianimare i compagni.',
    'Reclutamento: probabilità iniziale 30%, che aumenta del 2% dopo ogni piano senza reclute. Se un nemico si unisce alla spedizione, viene assegnato casualmente a un partecipante.',
    'Chi possiede meno Multimon ha più probabilità di ricevere la recluta: peso pari a 1 + 3 per ogni membro in meno rispetto alla squadra più numerosa. Massimo 8 Multimon per giocatore.',
    'Gli acquisti, le ricompense e l’avanzamento di piano usano transazioni Firestore per evitare doppi reclutamenti, spese duplicate o conflitti tra giocatori.',
    'Un giocatore può curare un proprio Multimon oppure aiutare un amico: cura singola 20 monete, rianimazione 50, cura totale dei vivi 90. Ogni cinque piani i sopravvissuti recuperano il 40% dei PS.',
    'Tra un piano e l’altro gli strumenti, gli HP e i compagni reclutati restano associati al proprietario. La spedizione prosegue fino a 50 piani; anche chi rientra con il proprio account recupera lo stato condiviso.',
    'La Roguelike in solitaria non viene sovrascritta: conserva il proprio salvataggio e la progressione separata dalla Co-op.'
  ]},
  {id:'nov3-lucy-zodiac-spirit-system',category:'champions',date:'03/11/2026',title:'✨ Lucy Heartfilia e gli otto Spiriti Stellari dello Zodiaco',items:[
    'Lucy Heartfilia è un nuovo personaggio giocabile di tipo Normale/Luce: 100 PS, 100 Attacco, 85 Difesa e 105 Velocità. Usa l’immagine scelta dal giocatore.',
    'Passiva Spiriti dello Zodiaco: selezioni uno Spirito Stellare da evocare all’ingresso in campo. Nel draft, in campagna, nella Roguelike e durante le sostituzioni puoi scegliere la chiave con le immagini e gli effetti descritti.',
    'Gli Spiriti evocabili sono Aries (Folletto), Taurus (Lotta), Gemini (Psico), Cancer (Robot), Leo (Terra), Virgo (Terra), Aquarius (Acqua) e Scorpio (Veleno). Sono tutti isSummonOnly: non si acquistano e non entrano nei draft come personaggi autonomi.',
    'Ogni Lucy può avere al massimo un proprio Spirito vivo e schierato alla volta. I bot scelgono autonomamente. Se viene sconfitto, un nuovo Spirito potrà essere evocato al successivo ingresso di Lucy.',
    'Lucy: Abito Stellare aumenta il suo Attacco del 20% e ha il 40% di probabilità di infatuare un nemico casuale; Frusta Celestiale è Luce potenza 80 con il 20% di ridurre la Velocità.',
    'Lucy: Pioggia di Stelle è Luce potenza 70, colpisce tutti e ha il 30% di accecare; Apertura Forzata è Magico potenza 85 e richiama immediatamente l’effetto secondario dello Spirito attivo.',
    'Aries: Lana Celestiale, Nebbia del Sonno (40% Addormentato) e Abbraccio di Aries (cura 30% un alleato).',
    'Taurus: Ascia del Toro (100), Carica Selvaggia (120 e calo della propria Difesa), Ruggito Possente (+50% Attacco).',
    'Gemini: Copia Perfetta replica l’ultima mossa usata dall’avversario; Doppio Fantasma evita il prossimo attacco; Confusione Gemella (70, 50% Confuso).',
    'Cancer: Forbici Lampo (potenza 40, tre colpi), Taglio Fulmineo (90), Difesa del Granchio (+20 Difesa e Velocità).',
    'Leo: Regulus Impact (110), Lama Solare (85, ignora i bonus di Difesa), Aura del Re (+50% Attacco e Velocità).',
    'Virgo: Sepoltura Immediata (95); Prigione Sotterranea dura 3 turni con Velocità -50% e 50% di mancare; Servizio Impeccabile ha priorità +1 e cura gli status negativi e i debuff di Lucy.',
    'Aquarius: Tsunami Stellare (110), Tempesta Marina (85 e 30% Congelato), Diluvio di Aquarius (Pioggia per 5 turni, Acqua +25%, Fuoco -25%).',
    'Scorpio: Puntura Mortale (80, 50% Avvelenato), Veleno Imperiale (100), Agguato Silenzioso (priorità +1).',
    'Apertura Forzata richiama rispettivamente il sonno di Aries, il buff di Taurus, la confusione di Gemini, la difesa di Cancer, l’aura di Leo, la prigione di Virgo, la pioggia di Aquarius o il veleno di Scorpio.',
    'Le immagini degli otto Spiriti sono quelle indicate dal giocatore; per Scorpio, senza immagine specificata, è stata usata un’illustrazione riconoscibile dello Spirito di Fairy Tail.'
  ]},
  {id:'nov3-second-nerf-wave',category:'balance',date:'03/11/2026',title:'⚖️ Seconda ondata di nerf: 9 modifiche approvate e Colpo di Coda Drago',items:[
    'Trigon: statistiche giocabili PS 170→150 e Attacco 140→125; Inferno demoniaco mantiene potenza 100 e colpisce tutti, ma la scottatura passa dal 50% al 30%. I PS fissi del raid della prima campagna restano invariati.',
    'Soundwave: Jammer di Frequenza riduce Attacco e Velocità di tutti i nemici del 20% anziché del 30%, con un limite di 3 utilizzi per battaglia.',
    'Maestro Shifu: Saggezza di Oogway cura il 30% anziché il 40% dei PS e potenzia Attacco e Difesa del 30% anziché del 50%.',
    'Roxy: soltanto La Preferita cambia: +25% Attacco e +25% Velocità anziché +50%. La passiva Nessuno è meglio di me! conserva il +20% danni quando attacca per prima.',
    'Megamind: PRESENTAZIONE! riduce Difesa e Velocità nemiche del 15% anziché del 20% quando entra in campo.',
    'Ban l’Immortale: Attacco base ridotto da 115 a 104. I 130 PS e la guarigione del 3–5% per turno di Fonte della Giovinezza rimangono invariati.',
    'Shinobu: Leggerezza Piumata concede +15% danni invece di +20% se agisce per prima. Estrazione del Veleno mantiene l’80% di probabilità di avvelenare.',
    'Sasuke Uchiha: Risveglio del Susanoo aumenta la Difesa del 70% anziché raddoppiarla; Amaterasu mantiene potenza 120 e ricarica, ma la probabilità di scottatura scende dal 100% al 75%.',
    'Godzilla: Ruggito del Re riduce Attacco e Velocità di tutti i nemici del 20% anziché del 30%, massimo 2 utilizzi; probabilità di stordire invariata al 20%.',
    'Godzilla: Colpo di Coda passa dal tipo Lotta al tipo Drago, mantenendo potenza 85 e la scelta di un massimo di 2 bersagli.',
    'Nicole Watterson non viene modificata: mantiene Mamma Demoniaca e le statistiche già presenti.'
  ]},
  {id:'nov3-ten-nerfs',category:'balance',date:'03/11/2026',title:'⚖️ Top 10 nerf approvati: Zeno, Discord, Gaster e altri sette Multimon',items:[
    'Zeno: PS 250→200, Attacco 200→170, Difesa 150→130, Velocità 150→130. Mantiene il suo status di personaggio segreto e tutte le mosse.',
    'Discord: PS 180→155, Attacco 130→120, Velocità 120→110; Difesa invariata a 100.',
    'W.D. Gaster: Velocità 140→130 e passiva Senza Spazio né Tempo da +25% a +15% danni quando attacca per primo.',
    'Cell: Paura Perfetta riduce ora l’Attacco dei nemici del 20% anziché del 30%, per un massimo di 2 ingressi per battaglia anziché 3.',
    'Ainz Ooal Gown: Aura di Disperazione riduce Attacco e Velocità dei nemici del 15% anziché del 20%.',
    'Peridot: Tablet Alieno concede +25% Velocità e +20% Difesa all’ingresso, anziché +50% e +30%.',
    'Juri: Tifo del Pubblico concede +15% ad Attacco, Difesa e Velocità per KO anziché +30%, con un massimo di 3 attivazioni per battaglia.',
    'Meliodas: Marchio Demoniaco, sotto il 30% dei PS, aumenta Attacco e Velocità del 35% anziché del 50%.',
    'Diamante Bianco: Il Capo del Pianeta Natale riduce del 70% i danni del primo attacco nemico anziché annullarlo; i malus del primo attacco restano bloccati.',
    'Arie Vicente: Perfezione Assoluta concede bonus del 15% anziché 20% ad Attacco, Difesa o Velocità, con un massimo di 2 bonus per ciascuna statistica per battaglia.',
    'Nessun Multimon viene eliminato e non cambiano le regole speciali delle battaglie contro i boss.'
  ]},
  {id:'nov3-zeno-omnipotent-gaze',category:'balance',date:'03/11/2026',title:'👁️ Zeno: Sguardo Onnipotente diventa un attacco per due bersagli',items:[
    'Sguardo Onnipotente è ora una mossa Psico di potenza 75 (prima non infliggeva danni).',
    'Puoi selezionare fino a 2 bersagli nemici invece di colpire automaticamente tutti gli avversari sul campo.',
    'Conserva i 2 utilizzi per battaglia e l’indebolimento di Attacco, Difesa e Velocità dei bersagli colpiti.',
    'Zeno mantiene Cancellazione, Giochiamo! e Stato Avatar: nessuna mossa è stata rimossa dal suo repertorio.',
    'Le modifiche a Sguardo Onnipotente e alle statistiche di Zeno valgono anche per le battaglie nelle campagne quando il personaggio è giocabile.'
  ]},
  {id:'nov3-zazan-sage-arctic-move-balance',category:'balance',date:'03/11/2026',title:'⚖️ Zazan, Sage e Orso Bianco: nuove regole di bilanciamento',items:[
    'Zazan — Corazza Mutante: ora si attiva quando scende al 40% dei PS o meno, anziché al 30%. Conserva il raddoppio della Difesa, la rimozione degli status negativi e il limite di un’attivazione per battaglia.',
    'Sage — Vandal: diventa una mossa di tipo Cristallo anziché Normale. Mantiene potenza 80 e il 15% di probabilità di stordire. Sage può sfruttare il bonus del proprio tipo Cristallo.',
    'Orso Bianco — Furia dell’Artico: continua ad avere potenza 140, colpire tutti gli avversari e scatenare la Tempesta di Neve per 5 turni, ma ora dispone di un solo utilizzo per battaglia.',
    'La difficoltà de L’Eco delle Anime resta progressiva: ogni atto aumenta del 5% i PS e del 3% Attacco e Difesa dei boss ordinari rispetto alle statistiche base; Echomax conserva il bilanciamento speciale del raid.'
  ]},
  {id:'nov3-four-new-passives-bulma',category:'champions',date:'03/11/2026',title:'⭐ Quattro nuove passive e due potenziamenti: Crash, Gaston, Luigi, Mecha Johnny e Bulma',items:[
    'Crash Bandicoot — Extra Vita: alla prima sconfitta della battaglia si rialza immediatamente con il 30% dei PS massimi. Può attivarsi soltanto una volta per battaglia.',
    'Gaston — Velocità aumentata da 60 a 68. La nuova passiva Cacciatore Esperto infligge il 20% di danni extra ai bersagli con Velocità inferiore alla sua.',
    'Luigi — La nuova passiva Acchiappafantasmi aumenta del 25% i danni delle sue mosse contro i Multimon che possiedono il tipo Spettro, anche se hanno un secondo tipo.',
    'Mecha Johnny Test — Reattore Nucleare: alla fine di ogni turno in campo recupera il 5% dei PS massimi, senza superare il massimo.',
    'Bulma — Rifornimento Capsule Corp.: la cura a fine turno passa dal 3% al 5% dei propri PS massimi.',
    'Le nuove passive funzionano nel normale motore dei combattimenti e si applicano anche nelle campagne.'
  ]},
  {id:'nov3-hyper-immediate-moves',category:'fixes',date:'03/11/2026',title:'⚡ Forme Iper: trasformazione prima delle mosse e mosse speciali subito selezionabili',items:[
    'Quando selezioni la Forma Iper, le sue nuove mosse appaiono immediatamente nel menu, già nel turno di attivazione: non devi aspettare il turno successivo.',
    'Se disattivi l’opzione Iper prima di confermare una mossa, le mosse speciali scompaiono subito senza alterare il moveset normale.',
    'Le mosse Iper in anteprima possono essere selezionate e bersagliate correttamente anche al primo turno; la validazione degli indici evita mosse inesistenti.',
    'La trasformazione Iper avviene in un pre-pass all’inizio dell’esecuzione del turno, prima di ordinare gli attacchi per priorità e Velocità: anche un Multimon lento si trasforma prima che agisca il nemico.',
    'Il bonus Iper alle statistiche e il limite di una trasformazione per giocatore non sono stati alterati.'
  ]},
  {id:'nov3-juvia-rainstorm',category:'balance',date:'03/11/2026',title:'🌧️ Juvia: Colpo impetuoso scatena la Tempesta e nuova passiva',items:[
    'Colpo impetuoso mantiene potenza 95 e ora ha il 25% di probabilità di creare una Tempesta di pioggia dopo aver colpito.',
    'La Tempesta dura 5 turni e riguarda tutto il campo: le mosse Acqua infliggono +25% danni, quelle Fuoco -25%. Il bonus funziona per entrambi i lati dello scontro.',
    'Cuore di Pioggia è stata sostituita: durante Pioggia, Tempesta o Tempesta di Neve, Juvia ottiene +20 punti percentuali di elusione e schiva più facilmente gli attacchi.',
    'Il bonus di elusione di Juvia scompare quando il meteo termina e non si accumula a ogni turno. La Tempesta condivide il sistema meteo con la Tempesta di Neve.',
    'L’arena mostra un indicatore della Tempesta con i turni rimasti e il riepilogo dei modificatori.'
  ]},
  {id:'nov3-glitter-barrel-items',category:'items',date:'03/11/2026',title:'✨ Due strumenti equipaggiabili: Polvere Brillante e Barile Pimpante',items:[
    'Polvere Brillante (310 monete): fornisce +10% di probabilità di schivare gli attacchi nemici, per tutta la battaglia; si combina con l’elusione individuale.',
    'Barile Pimpante (420 monete): dopo 4 colpi diretti sopravvissuti il barile si rompe, ricoprendo il Multimon di melma e aumentando la sua Velocità del 75% fino alla fine dello scontro.',
    'Per il Barile ogni colpo reale di una mossa multicolpo conta separatamente; non contano gli attacchi schivati o assorbiti da scudi, gli status, il meteo e gli effetti di contraccolpo.',
    'Il Barile si attiva una sola volta per battaglia e il contatore si azzera in una nuova lotta. Gli strumenti rimangono di proprietà dopo l’uso.',
    'I due strumenti hanno illustrazioni vettoriali originali e compaiono nel Negozio insieme agli altri strumenti da tenere.'
  ]},
  {id:'nov3-equipment-ui',category:'interface',date:'03/11/2026',title:'🎒 Equipaggiamento più chiaro: immagini, effetti e guida cercabile',items:[
    'Ridisegnata la scelta degli strumenti nel draft delle battaglie e nella preparazione delle missioni della campagna.',
    'Ogni Multimon dispone ora di una scheda illustrata che mostra lo strumento scelto, il suo nome e la descrizione dettagliata dell’effetto.',
    'La nuova Guida agli strumenti permette di cercare tra tutti gli oggetti equipaggiabili, vedere le icone, conoscere gli effetti e sapere quante copie possiedi.',
    'I menu indicano le copie libere e impediscono di equipaggiare la stessa copia su più Multimon contemporaneamente.',
    'Nessuna variazione alle regole di acquisto, al possesso permanente o al numero di strumenti assegnabili.'
  ]},
  {id:'nov3-tournament-roster',category:'fixes',date:'03/11/2026',title:'🏟️ Torneo Assoluto: esclusi boss futuri e forme akumizzate',items:[
    'Nella seconda campagna non puoi più scegliere Monarch, Echomax e le forme akumizzate che appartengono alla storia successiva di Monarch.',
    'L’esclusione comprende Cuore Infranto, Terror Dash, Jake il Demone, Re della Rovina, Destriero Oscuro, Static Shocker (anche versione invincibile), Max e Marceline sottomesse e Maestro Spietato.',
    'Il divieto si applica sia alla lista dei Multimon del torneo sia alla schermata di scelta del protagonista.',
    'I salvataggi del Torneo Assoluto già avviati vengono ripuliti dai personaggi esclusi; i progressi, le monete e i PS degli altri alleati sono conservati. Le alleanze già ridotte a otto membri ricevono sostituti idonei.',
    'Echomax, Monarch e le forme speciali restano nel database del gioco e non vengono rimossi dalle altre modalità o dalle loro campagne.'
  ]},
  {id:'nov3-ten-character-buffs',category:'balance',date:'03/11/2026',title:'📈 Dieci Multimon potenziati: statistiche, mosse e nuove passive',items:[
    'Re Ghiaccio: PS 95→108, ATK 90→103, DEF 75→84, VEL 70→80; Vai Gunter! 25→30 di potenza per colpo. Nuova passiva Brina Regale: all’entrata riduce la Velocità dei nemici del 15%, una volta per battaglia.',
    'Juvia: PS 90→105, ATK 100→108, DEF 70→84, VEL 80→90; Colpo impetuoso 80→95. Nuova passiva Cuore di Pioggia: sotto il 50% dei PS, +30% Difesa e +15% Velocità, una volta per battaglia.',
    'Jake (DC): PS 90→105, ATK 90→106, DEF 75→86, VEL 85→95; Tom difendimi! 85→95 di potenza.',
    'Roserade: PS 80→100, ATK 115→118, DEF 65→80, VEL 90→100; Gigassorbimento 85→95 di potenza, conservando la cura del 50% del danno.',
    'Mantide: PS 70→90, ATK 110→118, DEF 60→75, VEL 115→125; Colpo della Mantide 70→82, mantenendo priorità +1.',
    'Spike: PS 85→105, ATK 115→120, DEF 65→80, VEL 90→100; Campo di Cactus 45→55 di potenza su tutti i bersagli.',
    'Spyro: PS 95→110, ATK 95→112, DEF 75→85, VEL 95→105; Pioggia di Gemme 25→32 di potenza per colpo.',
    'Poison Ivy: PS 95→105, ATK 100→110, DEF 80→92, VEL 75→90; Radici Avvolgenti 70→82 di potenza.',
    'Kevin: PS 110→125, ATK 100→112, DEF 100→112, VEL 50→60; Pugno Minerale 80→92. Nuova passiva Armatura Assorbente: sotto il 50% dei PS, +30% Difesa, una volta per battaglia.',
    'Topolino: PS 105→115, ATK 85→100, DEF 75→85, VEL 105→110; Colpo Cartoon 50→68. Nuova passiva Spirito della Resistenza: quando entra, +10% Difesa agli alleati presenti sul campo.',
    'Le modifiche si applicano alle statistiche e alle mosse generali dei personaggi, non soltanto alla seconda campagna; nessun altro Multimon viene indebolito in questo aggiornamento.'
  ]},
  {id:'nov3-echomax-final-raid',category:'campaigns',date:'03/11/2026',title:'🛡️ Echomax: raid corretto, 6 attivi e 18 riserve',items:[
    'Nel combattimento finale de L’Eco delle Anime partecipano tutti i 24 alleati reclutati, ma sul terreno possono esserci soltanto 6 Multimon per volta: gli altri 18 restano in panchina.',
    'Prima della battaglia scegli i sei titolari; i restanti Multimon rimangono disponibili tramite il normale comando Cambia (Squadra) e la sostituzione dopo un KO.',
    'Lo scontro utilizza lo stesso motore classico delle altre campagne, con le stesse regole per turni, mosse, strumenti, ritratti e statistiche. Rimossa la vecchia griglia che schierava 24 personaggi contemporaneamente.',
    'Echomax boss dispone di 6.200 PS, statistiche potenziate e quattro scudi da 8 colpi alle soglie dell’80%, 60%, 40% e 20% dei PS.',
    'La passiva Legione dei Caduti accumula una Carica Anima per ogni KO nemico e, con 3 cariche, permette di evocare una Copia Perfetta per 3 turni; resta attiva una sola copia alla volta.',
    'Nel raid Dominatore del Multiverso obbliga Echomax a ricaricare il turno successivo, ma non lo rende confuso.',
    'Le liste di riserve e sostituzioni sono scorrevoli per permettere la scelta anche fra tutti i 18 personaggi in panchina.'
  ]},
  {id:'nov3-echo-of-souls',category:'campaigns',date:'03/11/2026',title:'📖 Nuova terza campagna: L’Eco delle Anime',items:[
    'Aggiunta L’Eco delle Anime come terza modalità storia, dopo Il Torneo Assoluto e prima de L’Ombra di Monarch, ora quarta campagna.',
    'La storia comprende 36 missioni principali distribuite in 6 atti, ognuna con combattimenti, dialoghi iniziali e dialoghi conclusivi.',
    'Jake e Marceline sono i protagonisti iniziali: Finn e Topolino sono scomparsi e il loro destino si scopre solo proseguendo la storia.',
    'Reclutando progressivamente 22 altri alleati, si arriva a una Resistenza di 24 combattenti. Cell e Gaster si uniscono nell’ultimo atto per affrontare una minaccia comune.',
    'Prima delle missioni ordinarie puoi scegliere una via tattica: Assalto (+10% Attacco), Ricognizione (Scudo Team per un turno) o Rifugio (cura del 15% ai superstiti).',
    'Dopo ciascuna missione compare una cassa con una scelta fra monete, cure alla squadra o soccorso a un alleato; rimangono anche i normali Bauli Campagna.',
    'La storia collega lo scontro con Trigon e Gaster della prima campagna al risveglio di Echomax e prepara il successivo capitolo di Monarch.'
  ]},
  {id:'nov3-echomax-unlock',category:'champions',date:'03/11/2026',title:'👻 Echomax entra nel roster dopo la terza campagna',items:[
    'Echomax è un nuovo Multimon di tipo Spettro/Buio. Si sblocca permanentemente soltanto dopo averlo sconfitto e completato L’Eco delle Anime.',
    'Passiva Legione dei Caduti: ogni KO inflitto ai nemici fornisce una Carica Anima; con 3 cariche evoca una Copia Perfetta che combatte per tre turni.',
    'Raggio dei Caduti: Spettro, potenza 100, precisione 80%, bersaglio singolo.',
    'Le Tenebre vi Avvolgono: Buio, potenza 70, colpisce tutti i nemici presenti in campo.',
    'Vieni a Me, Anima: Spettro, senza danno diretto, riduce Difesa e Velocità del nemico del 30%.',
    'Dominatore del Multiverso: Spettro, potenza 150, bersaglio singolo; ricarica il turno dopo e confonde Echomax quando è usato come personaggio normale (non nel raid boss).',
    'Dopo lo sblocco, Echomax è disponibile nelle modalità che utilizzano il roster generale, ma non come partecipante del Torneo Assoluto.'
  ]},
  {id:'final-raid-trigon-gaster-balance',category:'balance',date:'02/11/2026',title:'RAID finale prima campagna: scudi da 6 e meno PS',items:[
    'Trigon nel raid finale passa da 4.250 a 3.375 PS massimi; W.D. Gaster da 3.375 a 2.436 PS.',
    'Gli scudi RAID dei due boss assorbono ora 6 colpi per attivazione anziché 15; rimangono le soglie al 75%, 50% e 25% della salute.',
    'Ogni singolo colpo di una mossa multicolpo sottrae una carica: una mossa che colpisce 4 volte consuma 4 cariche dello scudo.',
    'Se lo scudo si rompe durante una mossa multicolpo, gli eventuali colpi successivi possono danneggiare il boss.',
    'I vecchi salvataggi del RAID vengono aggiornati automaticamente preservando la percentuale di vita già tolta ai boss e limitando le cariche scudo a 6.',
    'Le statistiche base dei personaggi sbloccabili e le altre campagne non cambiano.'
  ]},
  {id:'battle-backpack-black-screen-fix',category:'fixes',date:'02/11/2026',title:'Corretto lo schermo nero aprendo lo zaino in battaglia',items:[
    'Risolto il crash ReferenceError: appMode is not defined quando si apre lo zaino durante uno scontro.',
    'La schermata di battaglia riceve ora correttamente la modalità e visualizza il contatore dei 3 strumenti curativi online senza bloccare il gioco.',
    'Le battaglie locali e la campagna rimangono senza limite curativi e il comportamento precedente degli oggetti è preservato.'
  ]},
  {id:'held-unique-svg-art',category:'interface',date:'02/11/2026',title:'13 illustrazioni SVG per i nuovi strumenti',items:[
    'Sostituite le stelle bianche di riserva con 13 icone SVG originali, una per ciascuno dei nuovi strumenti da battaglia.',
    'Ogni oggetto ha una silhouette riconoscibile e una propria palette: fascia, scudo, ciondolo, clessidra, lente, risonatore, nastro, stivali, bussola, specchio, sigillo, piuma e campanella.',
    'Le illustrazioni sono visibili nel Negozio e sui Multimon che le equipaggiano durante la lotta, senza emoji, immagini esterne né nuovi download.',
    'I prezzi, i potenziamenti, il funzionamento dei bauli e gli strumenti preesistenti rimangono invariati.'
  ]},
  {id:'thirteen-held-items',category:'items',date:'02/11/2026',title:'13 nuovi strumenti da equipaggiare',items:[
    'Fascia dell’Eroe (450 monete): da PS pieni resiste a un colpo diretto letale, restando con 1 PS. Una volta per battaglia.',
    'Scudo Antielemento (320): la prima mossa superefficace subita infligge 25% danni in meno.',
    'Ciondolo Antiveleno (260): danni da veleno ridotti del 40%.',
    'Clessidra della Rapidità (350): sotto il 30% dei PS dà +20% Velocità PER TUTTA LA BATTAGLIA, senza durata di due turni. Una sola attivazione.',
    'Lente della Fortuna (300): +10 punti percentuali alla prima probabilità di status non garantito (max 90%).',
    'Risonatore Elementale (360): il secondo attacco offensivo consecutivo di tipo diverso ha +12% danni.',
    'Nastro della Solidarietà (330): una mossa che potenzia un alleato lo cura anche dell’8% dei PS massimi, una volta.',
    'Stivali dello Slancio (340): dopo un KO inflitto con una mossa, +15% Velocità per il turno successivo.',
    'Bussola del Predatore (380): +15% danni al primo colpo riuscito contro un nemico sotto il 40% dei PS.',
    'Specchio delle Maledizioni (420): 40% di riflettere sul nemico uno status negativo ricevuto, una volta.',
    'Sigillo della Libertà (280): il primo status negativo temporaneo dura un turno in meno (minimo uno).',
    'Piuma della Rinascita (290): dopo una resurrezione +15% Difesa per due turni, una volta.',
    'Campanella del Soccorso (400): quando un alleato scende sotto il 25% dei PS, lo protegge dal 15% dei danni del successivo attacco, una volta.',
    'Guanti Spinosi e Corona del Coraggio non sono stati aggiunti, come richiesto. Gli sblocchi restano permanenti ma gli effetti monouso si resettano per battaglia.'
  ]},
  {id:'roguelike-power-chests',category:'balance',date:'02/11/2026',title:'Casse Potenza Roguelike, premio finale e due guide di Finn',items:[
    'Ogni cinque piani superati nella Roguelike solo si ottiene una Cassa Potenza, conservabile in un menu separato dai Bauli Campagna.',
    'Le Casse Potenza danno esclusivamente da 2 a 8 Punti Forza con probabilità uniforme; non contengono monete, pozioni, oggetti o personaggi.',
    'Ogni vittoria completa della Roguelike (50 piani) assegna 30 Punti Forza se sono passate almeno quattro ore dall’ultima vittoria premiata.',
    'Un timer in Casse Potenza mostra quanto manca per poter ricevere di nuovo il bonus finale da 30 PF; le casse ogni cinque piani non hanno cooldown.',
    'Finn l’Umano con un ritratto speciale spiega alla prima apertura dei Bauli Campagna le due ricompense, le rarità e tutti i premi possibili.',
    'Le Casse Potenza hanno un altro mini-dialogo separato con Finn, dedicato ai loro Punti Forza e al bonus finale.',
    'Le ricompense per piano e vittoria hanno identificativi della run: non possono essere riscosse due volte semplicemente ricaricando o facendo doppio click.'
  ]},
  {id:'campaign-chests-scientist',category:'champions',date:'02/11/2026',title:'Bauli della campagna e Topolino scienziato',items:[
    'Ogni missione completata nelle campagne disponibili assegna un Baule Campagna, conservabile nel menu.',
    'Chi ha già completato missioni riceve automaticamente tutti i bauli mancanti, senza duplicati.',
    'Ogni baule contiene due ricompense casuali indipendenti: cure 40%, Punti Forza 28%, monete 25%, Multimon 4%, strumenti da battaglia 3%.',
    'Punti Forza possibili: 5, 7, 9, 15, 20 o 40. Monete fra 15 e 50. I curativi includono pozioni, rimedi status e rivitalizzanti.',
    'I Multimon non posseduti sono i soli candidati alle ricompense rare. Se una categoria è completa, si ricevono Punti Forza sostitutivi.',
    'Lo scrigno illustrato e le due carte premio utilizzano animazioni e colori di rarità. Il risultato è registrato prima della rivelazione.',
    'Il Professor Topolino guida al primo ingresso nel Laboratorio usando il suo ritratto e regala un solo +1 gratuito a una statistica di un Multimon posseduto.'
  ]},
  {id:'online-heal-cap',category:'balance',date:'02/11/2026',title:'Tre strumenti curativi per giocatore nelle lotte online',items:[
    'Le lotte online permettono fino a tre utilizzi complessivi di strumenti curativi per giocatore per battaglia.',
    'Contano Pozione, Cura Totale, Revitalizzante, Cura Status e Pozione Rigenerante; le mosse di cura dei Multimon non sono strumenti.',
    'Il limite viene applicato sia al menu oggetti sia al motore dei turni, e riparte da zero in una nuova battaglia.',
    'La campagna e le partite in locale mantengono le regole precedenti.'
  ]},
  {id:'strength-lab',category:'balance',date:'02/11/2026',title:'⚡ Laboratorio e Punti Forza',items:[
    'Aggiunta la valuta Punti Forza (separata dalle monete). Tutti i profili partono da 0 Punti Forza.',
    'I Multimon posseduti possono aumentare separatamente Attacco, Difesa e Velocità dal livello 1 al 10.',
    'Ogni livello fornisce +1 punto reale. Livello 1 dà +1 gratuito; livello 10 dà +10 per statistica, massimo +30 complessivi.',
    'Costi per la statistica: livello 2 = 2 punti; livello 3 = 4; livello 4 = 6; ... livello 10 = 18 punti.',
    'Laboratorio con PNG, ricerca e filtri, barre luminose, differenza prima/dopo e conferma della spesa.',
    'I potenziamenti si salvano nel profilo, valgono per i personaggi posseduti nelle battaglie e non vengono applicati a boss o CPU.',
    'I Punti Forza non sono ancora ottenibili tramite ricompense: il sistema è pronto per i prossimi aggiornamenti.'
  ]},
  {id:'kirby',category:'champions',date:'02/11/2026',title:'⭐ Kirby entra nel multiverso',items:[
    'Nuovo Multimon Magico / Folletto, acquistabile per 200 monete. PS 100, Attacco 105, Difesa 85, Velocità 95.',
    'Passiva Copia Abilità: al primo attacco che infligge danni a ciascun nemico distinto, Kirby copia una sua mossa utilizzabile. Massimo 2 mosse copiate contemporaneamente; nessuna sottrazione all’avversario.',
    'Stella Sparata: Magico, potenza 85, 20% probabilità di stordire.',
    'Super Risucchio: Magico, potenza 70, cura del 25% del danno inflitto.',
    'Calcio Stellare: Folletto, potenza 95, priorità +1.',
    'Stella Warp: potenzia la Velocità di due livelli (+100%, nel limite delle statistiche), 2 utilizzi.',
    'Nuovo titolo di Padronanza livello 20: Eroe delle Stelle.'
  ]},
  {id:'nerfs',category:'balance',date:'02/11/2026',title:'⚖️ Dieci nerf approvati',items:[
    '1. Veleno: i danni aumentano del 5% → 10% → 15% dei PS massimi; non superano più il 15% per turno (prima 25%).',
    '2. Fratelli Bros (Mario + Luigi): potenza 300 → 250; bonus +50% → +30% alla Difesa di Mario e alla Velocità di Luigi. Rimane il costo del 20% dei PS per entrambi.',
    '3. A caccia di meduse (SpongeBob + Patrick): potenza 250 invariata. Il bonus di SpongeBob a ATK, DEF e VEL scende da +100% a +50%; Patrick perde sempre il 75% dei PS.',
    '4. Esplosione Solare (Bloom): scotta ancora al 100%, ma può colpire massimo 2 nemici scelti invece di 4.',
    '5. Polline fastidioso (Leslie): ora potenza 40, con 35% probabilità di addormentare e 35% di elettrizzare ogni bersaglio (prima 50% ciascuno); massimo 2 bersagli, 4 utilizzi.',
    '6. Fotosintesi clorofiliana (Leslie): cura da sola 80% dei PS massimi (prima 100%), con alleati 35% a ogni membro in campo (prima 50%); 2 utilizzi effettivi.',
    '7. Gadget di Supporto (Doraemon): massimo 2 utilizzi, mantenendo +50% Attacco e Difesa fino a 2 compagni.',
    '8. Fascino Glaciale (Yuki-Onna): 75% di infatuare (prima 100%), massimo 3 utilizzi.',
    '9. Sou Giakuru! (Penny): potenza 150 → 125 e confusione 100% → 70%, 2 utilizzi.',
    '10. Piano Z (Plankton): bonus Attacco +100% → +50%, Velocità +50% → +30%, 2 utilizzi.',
    'Le descrizioni delle mosse e la gestione dei limiti di utilizzo riflettono questi nuovi valori.'
  ]},
  {id:'buffs',category:'balance',date:'02/11/2026',title:'📈 Potenziamenti di Carlos, Kevin e Spyro',items:[
    'Carlos Oliveira: Attacco 90 → 100 e Velocità 70 → 80. La passiva di sopravvivenza al KO resta identica.',
    'Kevin: Attacco 90 → 100; Pugno Minerale potenza 60 → 80. Difesa e Velocità invariate.',
    'Spyro: PS massimi 85 → 95; Difesa 70 → 75. Le altre mosse rimangono invariate.'
  ]},
  {id:'poison-fix',category:'fixes',date:'02/11/2026',title:'☠️ KO da veleno senza blocco del turno',items:[
    'Risolto il TypeError «Cannot read properties of undefined (reading turns)». Un KO rimuove lo status e ora il motore non tenta di modificarlo dopo la cancellazione.',
    'Gestiti anche i casi in cui una passiva purifica il veleno o riporta in vita il combattente.',
    'Aggiunti test contro i KO da veleno, anche per lo scontro con Cell.'
  ]},
  {id:'cell-rematch',category:'fixes',date:'02/11/2026',title:'🧬 Rematch della campagna contro Cell',items:[
    'Corretta la gestione dei comandi della campagna che poteva lasciare «In attesa degli altri giocatori…» nonostante la CPU fosse presente.',
    'All’avvio di un nuovo tentativo vengono azzerate le animazioni e selezioni residue del combattimento precedente.',
    'La ricostruzione del campo non assegna slot attivi a Cell Jr. con 0 PS nel salvataggio. I progressi della campagna restano salvati.'
  ]},
  {id:'mastery-titles',category:'mastery',date:'02/11/2026',title:'🏆 Titoli individuali al livello 20',items:[
    'Ogni Multimon idoneo ha un titolo narrativo unico invece di un’etichetta generica. Con Kirby i titoli individuali arrivano a 137.',
    'Esempi: Sage — Guaritrice; Nicole — La Mamma Demoniaca; Kirby — Eroe delle Stelle; Alphonse — Trasmutatore Supremo; Yoshi — Compagno dal Guscio Verde.',
    'In Statistiche → Padronanza puoi cercare per nome del personaggio o titolo, leggere i titoli completi e indossare quelli sbloccati.',
    'Chi aveva già raggiunto il livello 20 mantiene tutti i PE e riceve automaticamente il nuovo titolo.',
    'Boss della campagna, evocazioni e fusioni non acquisiscono Padronanza.'
  ]},
  {id:'mastery-cosmetics',category:'mastery',date:'02/11/2026',title:'✨ Ricompense visive per la Padronanza',items:[
    'Livello 5: cornice ciano intorno al Multimon.',
    'Livello 10: aura speciale.',
    'Livello 15: scintille.',
    'Livello 20: ingresso dorato e titolo personale.',
    'I progressi e i titoli non vengono assegnati ai mostri esclusivi della campagna, alle fusioni o ai personaggi evocati.'
  ]},
  {id:'battle-visuals',category:'interface',date:'02/11/2026',title:'💥 KO e battaglie più spettacolari',items:[
    'Annunci speciali per KO, colpi critici, cure, passive, alterazioni di stato, buff e debuff.',
    'Animazione di caduta del personaggio sconfitto, impatto sull’arena, lampi e colori diversi per gli eventi importanti.',
    'Le animazioni rispettano l’impostazione di sistema di riduzione del movimento.'
  ]},
  {id:'status-clarity',category:'interface',date:'02/11/2026',title:'🔎 Buff, status e passive leggibili',items:[
    'Indicatori che mostrano percentuali effettive di Attacco, Difesa, Velocità e statistiche speciali rispetto ai valori di base.',
    'Status con nome completo, colori distinti per effetti positivi, negativi e protezioni, e turni residui quando disponibili.',
    'Passiva visibile sopra i personaggi: passando sopra il badge puoi leggerne la descrizione.',
    'Enciclopedia della battaglia consultabile per capire status, priorità, protezioni, strumenti e passive.'
  ]},
  {id:'builder',category:'interface',date:'02/11/2026',title:'🧩 Team builder avanzato',items:[
    'Ricerca per nome e filtri combinabili per tipo, ruolo stimato e prezzo.',
    'Ruoli suggeriti dalle statistiche e dalle mosse: Attaccante, Difensore, Curatore, Supporto e Controllo.',
    'Ordina i personaggi per Attacco, Difesa, Velocità, PS, prezzo o nome.',
    'Preferiti con la stellina ★ salvati nel browser, senza alterare la selezione della squadra.',
    'Le schede mostrano il prezzo e i ruoli stimati di ciascun Multimon.'
  ]},
  {id:'snow',category:'interface',date:'02/11/2026',title:'❄️ Arena innevata con Tempesta di Neve',items:[
    'Quando è attiva Tempesta di Neve l’arena assume colori azzurri, una foschia fredda e fiocchi animati.',
    'Il campo torna normale allo scadere del meteo; l’effetto grafico non modifica da solo danni o durata.',
    'L’animazione rispetta le preferenze di riduzione del movimento.'
  ]},
  {id:'hyper',category:'balance',date:'02/11/2026',title:'🔥 Forme Iper riequilibrate',items:[
    'Battaglie classiche: bonus Iper di Attacco, Difesa e Velocità ridotti dal +50% al +35%.',
    'Torneo del Multiverso: bonus Iper a Attacco, Attacco Speciale e PS ridotti dal +50% al +35%.',
    'Mosse aggiuntive, animazioni e trasformazioni speciali rimangono disponibili.'
  ]},
  {id:'stat-stacking',category:'balance',date:'02/11/2026',title:'📊 Potenziamenti e malus con limiti chiari',items:[
    'I modificatori delle statistiche si sommano rispetto al valore base, anziché moltiplicarsi senza controllo.',
    'Potenziamenti massimi +100% rispetto alla statistica base; riduzioni massime −50%.',
    'Le regole valgono per bonus e malus di mosse e passive; le trasformazioni Iper sono gestite separatamente.',
    'La voce Potenziamenti dell’Enciclopedia spiega i limiti.'
  ]},
  {id:'items',category:'items',date:'02/11/2026',title:'🎒 Quattro strumenti da battaglia',items:[
    'Germoglio Curativo: quando il portatore scende alla soglia del 50% dei PS, recupera il 25% dei PS massimi. Si attiva una sola volta.',
    'Spray Neutralizzante: rimuove status negativi e Ricarica quando si attivano. Si consuma dopo il primo utilizzo.',
    'Freccia di Cupido: gli attacchi fisici a contatto possono infatuare il bersaglio con probabilità del 10%, senza limite di attivazioni.',
    'Scudo Anti-Magia: protegge dagli effetti negativi delle passive nemiche; non annulla automaticamente i danni diretti delle mosse.'
  ]},
  {id:'new-passives',category:'champions',date:'02/11/2026',title:'🧬 Nuove passive e poteri',items:[
    'Nicole Watterson — Mamma Demoniaca: quando entra in campo, riduce del 20% l’Attacco dei nemici.',
    'Alphonse Elric — Trasmutazione Rapida: mosse Robot e Terra con priorità +1 nel primo turno in campo.',
    'Cyborg — Corazza Titan: protezione dai colpi critici e potenziamento difensivo.',
    'Altri effetti speciali e protezioni ricevono indicatori leggibili nel Codex e in battaglia.'
  ]}
];
export const UPDATE_COUNT=GAME_UPDATES.reduce((sum,section)=>sum+section.items.length,0);
