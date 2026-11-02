// Registro pubblico degli aggiornamenti introdotti nelle sessioni recenti.
// Ordine: più recente prima. Le schede descrivono le modifiche effettivamente
// presenti nel gioco, distinguendo bilanciamento, funzionalità e correzioni.
export const UPDATE_CATEGORIES = [
  {id:'all',name:'Tutto',icon:'📜'},
  {id:'balance',name:'Bilanciamento',icon:'⚖️'},
  {id:'champions',name:'Personaggi e abilità',icon:'⭐'},
  {id:'items',name:'Strumenti',icon:'🎒'},
  {id:'interface',name:'Grafica e interfaccia',icon:'🎨'},
  {id:'mastery',name:'Padronanza',icon:'🏆'},
  {id:'fixes',name:'Bug risolti',icon:'🛠️'}
];
export const GAME_UPDATES = [
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
    'Ogni missione completata in una delle tre campagne assegna un Baule Campagna, conservabile nel menu.',
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
