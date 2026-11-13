export const THEATER_ACT_I={
 name:'ATTO I · La principessa fuori copione',
 description:'Un Regista sceglie Star e Coraline come protagoniste e prepara la sua prima teatrale usando un quartiere reale di Mewni come palcoscenico.',
 bg:'bg-fuchsia-950',
 missions:[
 {title:'Il cielo va in scena',boss:['caposcena','riflettore'],sceneRule:'spotlight',
 dialogue:[
 ["Star Butterfly","Okay, chi ha appeso un sipario al cielo? Perché ieri c'era solo un biglietto dorato sul mio letto."],
 ["Coraline","E tu ci sei andata?"],
 ["Star Butterfly","Non ci sono andata! Mi sono svegliata e il quartiere del castello era già così. Tu chi sei?"],
 ["Coraline","Coraline. Ho trovato un invito identico vicino a una porticina comparsa in casa. Dietro c'era qualcuno che chiedeva aiuto."],
 ["Star Butterfly","Oh. Quindi siamo entrambe state fregate."],
 ["Il Regista","Non fregate. Scritturate. Ho scelto la principessa che non riesce a stare ferma..."],
 ["Coraline","...e hai messo la porta apposta per farmi venire."],
 ["Il Regista","Coraline Jones, la testimone. Avevo bisogno di qualcuno che notasse i dettagli."],
 ["Star Butterfly","Il dettaglio è che la gente sta scappando!"],
 ["Coraline","Star, guarda il ponte. È legato a quel riflettore."],
 ["Il Caposcena","Comparse ai posti! Al prossimo segnale il ponte deve cadere."],
 ["Star Butterfly","Con delle persone sopra? No, grazie. Coraline, tieniti forte!"]
 ],
 postDialogue:[
 ["Star Butterfly","Il ponte è ancora in piedi. Bene. E il resto di Mewni è là fuori, quindi non ha preso tutto il regno."],
 ["Coraline","Solo questo pezzo. Le strade sono finte, ma chi ci vive no. Guarda i cavi."],
 ["Il Regista","Non male. Non era previsto che lo salvassi così in fretta."],
 ["Star Butterfly","Allora cambia mestiere. Noi cerchiamo un'uscita."],
 ["Coraline","Prima liberiamo chi è rimasto qui."]
 ]},
 {title:'La porta senza casa',boss:['reboo','riflettore'],sceneRule:'mirror',
 dialogue:[
 ["Coraline","Ho appena aperto tre porte diverse. Tutte e tre portano qui."],
 ["Star Butterfly","Potrei aprire una quarta con la magia."],
 ["Coraline","Aspetta. Guarda le cerniere: questo muro gira."],
 ["Re Boo","BWAHAHA! Finalmente ospiti! Sorridete, vi voglio nella mia collezione di ritratti."],
 ["Star Butterfly","Sei adorabile. In un modo molto sgradevole."],
 ["Il Caposcena","Non siete autorizzate a usare le uscite di servizio!"],
 ["Coraline","Hai sentito, Star? Ha appena detto dove si trovano."],
 ["Star Butterfly","Mi piacciono gli indizi involontari. Quello lì ne è pieno."]
 ],
 postDialogue:[
 ["Re Boo","Un momento! Non potete andarvene prima del finale!"],
 ["Coraline","Dietro il muro c'è una lista del cast. Ci sono i nostri nomi, perfino il posto in cui avremmo dovuto incontrarci."],
 ["Star Butterfly","E c'è una mappa. Guarda quante altre porte."],
 ["Coraline","Non scegliere quella più colorata."],
 ["Star Butterfly","...Stavo proprio per farlo."]
 ]},
 {title:'L’agente fuori parte',boss:['samtotallyspies','riflettore'],unlock:['samtotallyspies'],sceneRule:'rehearsal',
 dialogue:[
 ["Sam (Totally Spies)","Fermi dove siete. Chi ha il trasmettitore rubato della WOOHP?"],
 ["Star Butterfly","Io ho una bacchetta e una pessima mattinata. Vale lo stesso?"],
 ["Sam (Totally Spies)","La tua bacchetta manda in tilt lo scanner."],
 ["Coraline","E quello sulla parete è un ricevitore. Guarda il filo che arriva al riflettore."],
 ["Sam (Totally Spies)","Potrebbe essere una trappola. Non vi conosco."],
 ["Il Regista","La terza attrice è arrivata. Finalmente."],
 ["Sam (Totally Spies)","Chi è quello?"],
 ["Star Butterfly","Il tizio che ci ha rapite per un suo teatrino. Cattivo gusto, ottimo impianto audio."],
 ["Il Regista","Agente, se vuole la verità, dovrà guadagnarsela."],
 ["Coraline","Sta facendo combattere te contro di noi. Sam, abbassa il dispositivo!"],
 ["Sam (Totally Spies)","Prima disattivo quella luce. Poi parliamo."]
 ],
 postDialogue:[
 ["Sam (Totally Spies)","Avevate ragione. Il trasmettitore era un’esca. Il segnale parte da qui, non dalla WOOHP."],
 ["Star Butterfly","Bello. Allora adesso sei dalla nostra parte?"],
 ["Sam (Totally Spies)","Per adesso. Ho ancora parecchie domande."],
 ["Coraline","Noi pure. Cominciamo dalla macchina che chiude le uscite."],
 ["Star Butterfly","Operazione: Non Fidarsi del Tizio col Megafono. Nome definitivo."]
 ]},
 {title:'Applausi obbligatori',boss:['reboo','caposcena'],sceneRule:'rehearsal',
 dialogue:[
 ["Star Butterfly","Perché stanno applaudendo? Non c'è niente da applaudire."],
 ["Coraline","Quel bambino ha smesso di battere le mani. La campana suona... e ricomincia."],
 ["Sam (Totally Spies)","Ogni quarantotto secondi. Li obbliga quel segnale."],
 ["Il Caposcena","Il pubblico applaude quando lo decide il palco. È molto semplice."],
 ["Star Butterfly","Già. Ed è terribile."],
 ["Coraline","Sua madre è dall'altra parte della piazza. Lui non riesce a raggiungerla."],
 ["Sam (Totally Spies)","Il campanile comanda i proiettori. Lo spengo io."],
 ["Il Caposcena","Non toccate le apparecchiature!"],
 ["Star Butterfly","Troppo tardi per la richiesta gentile."]
 ],
 postDialogue:[
 ["Coraline","Ehi. Adesso il bambino è con sua madre."],
 ["Sam (Totally Spies)","Il segnale è sparito, ma il blocco sulle porte è ancora attivo."],
 ["Star Butterfly","Sembra che ogni volta che ne sistemiamo una ne spuntino cinque."],
 ["Coraline","Almeno sappiamo che i comandi si possono rompere."],
 ["Sam (Totally Spies)","E che qualcuno li controlla da una cabina. Andiamo."]
 ]},
 {title:'La caduta delle 21:17',boss:['caposcena','riflettore','riflettore'],sceneRule:'spotlight',
 dialogue:[
 ["Il Regista","Scena quinta. Ore 21:17. La torre cade. Non deludetemi."],
 ["Star Butterfly","Hai un orario per far cadere una torre? Sul serio?"],
 ["Sam (Totally Spies)","Tre cavi la tengono sospesa. Se si tendono insieme, il tetto cede."],
 ["Coraline","E ci sono famiglie dentro. Dobbiamo farle uscire."],
 ["Il Caposcena","Un minuto! Tutti pronti alla caduta!"],
 ["Star Butterfly","C'è anche un bambino al piano di sopra. Lo vedo dalla finestra."],
 ["Sam (Totally Spies)","Io apro la scala antincendio. Voi due tenete occupati i riflettori."],
 ["Coraline","Star, niente incantesimi sul tetto."],
 ["Star Butterfly","Va bene. Solo sui cattivi. Sono bravissima a seguire regole molto specifiche."]
 ],
 postDialogue:[
 ["Coraline","Le 21:18. La torre è ancora lì."],
 ["Star Butterfly","E la famiglia è uscita. Anche il gatto. Ho dovuto convincerlo personalmente."],
 ["Sam (Totally Spies)","Non era un'illusione: quella torre sarebbe crollata davvero."],
 ["Il Regista","Avete rovinato una scena costosa. Il pubblico, però, ha gradito."],
 ["Star Butterfly","Beh, il pubblico può chiedere il rimborso."]
 ]},
 {title:'Fine del primo atto',boss:['caposcena','caposcena','riflettore'],sceneRule:'curtain',
 dialogue:[
 ["Coraline","Questa non è una strada. È il retro di una scenografia."],
 ["Sam (Totally Spies)","E oltre c'è il Deposito Scenografie. Guarda quelle rotaie."],
 ["Star Butterfly","Aspettate. Quindi il castello era appeso a delle ruote giganti?"],
 ["Coraline","Non il tuo castello. La copia che vedevamo da qui."],
 ["Il Caposcena","È proibito entrare dietro il sipario!"],
 ["Sam (Totally Spies)","Il comando delle porte è su quella console."],
 ["Il Caposcena","Il Regista vi aveva assegnato un ruolo. Dovevate recitarlo!"],
 ["Star Butterfly","Il mio ruolo preferito è rovinarti la giornata."],
 ["Coraline","E io preferirei uscire prima che richiuda il muro. Sam?"],
 ["Sam (Totally Spies)","Ci sono. Tenete lontano il Caposcena per dieci secondi."]
 ],
 postDialogue:[
 ["Il Caposcena","Il primo atto è finito. Io sono senza lavoro."],
 ["Sam (Totally Spies)","Ho aperto il collegamento con Mewni. Gli abitanti possono uscire, ma la struttura centrale è ancora attiva."],
 ["Star Butterfly","Quindi Non ha inghiottito l’universo di Star. Ha solo rubato un quartiere per usarlo come set."],
 ["Coraline","E non è il suo unico set. Guarda quante porte ci sono in fondo."],
 ["Il Regista","Intervallo. Mi raccomando, non fate tardi per il secondo atto."],
 ["Star Butterfly","Stai tranquillo. La prossima scena te la roviniamo in anticipo."]
 ]}
 ]};