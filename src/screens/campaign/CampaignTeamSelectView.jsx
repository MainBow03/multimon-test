import { ItemArtwork } from '../../components/ItemArtwork.jsx';
import { HeldEquipmentCard, HeldEquipmentGuide } from '../../components/HeldEquipmentPicker.jsx';
import { ZodiacSpiritPicker } from '../../components/ZodiacSpiritPicker.jsx';
import { canEquipHeldItem } from '../../systems/heldEquipment.js';
import { initialCampaignField } from '../../systems/campaignBattleRecovery.js';
import { applyStrengthToFighter, canTrainCharacter } from '../../systems/strengthLab.js';
import { finalRaidBossStats, rebalanceSavedFinalRaidBoss } from '../../systems/finalRaidBalance.js';
import { accumulateBattleReport } from '../../systems/battleReport.js';
import { applyEchoRouteToTeam } from '../../systems/echoRoutes.js';
import {echoEnemyScaling,echoPuppetIdentity} from '../../systems/echoChallenge.js';
import { echoRaidStarters, toggleEchoRaidStarter, orderEchoRaidRoster, isCompleteEchoRaidLineup, ECHO_ACTIVE_LIMIT } from '../../systems/echoRaidLineup.js';
import {createEchoFinalSoul,isEchoFinalSoulId,ECHO_FINAL_SOUL_VERSION} from '../../systems/echoFinalSouls.js';
import {echoRaidMovesAtFullAccuracy} from '../../systems/echoRaidHalfReset.js';
import {onMultimonImageError} from '../../systems/imageFallback.js';
const ECHO_FINAL_BOSS_HP = 4000;
// Schermata estratta senza alterare la struttura JSX originale.
export function renderCampaignTeamSelectView(ctx) {
const { ITEMS_DB, campaignHeldItems, setCampaignHeldItems, campaignZodiacChoices, setCampaignZodiacChoices, CHARACTERS, Swords, TYPES, TYPE_STYLES, activeCampaign, activeCampaignId, appMode, applyOnEnterPassive, campaignSelectedTeam, campaignState, draftFilterType, draftSearch, draftSort, getPlayerData, initialGameState, playerName, renderHealthBar, selectionDialogueTimerRef, setAppMode, setCampaignSelectedTeam, setCampaignState, setCombatLog, setCommandingIdx, setActionMenuMode, setTargetingMoveIdx, setSelectedMultiTargets, setPendingHyper, setIsPlayingEvents, setEventPlaybackText, setEventPlaybackPassive, setDraftFilterType, setDraftSearch, setDraftSort, setGameState, setIsLogOpen, setPlayerRole, setSystemAlert, setTeamSelectionDialogue, teamSelectionDialogue } = ctx;
if (appMode === 'campaign_team_select') {
        const equipInventory = getPlayerData().inventory || {};
        const assignCampaignItem = (id, itemId) => {
            const team = campaignSelectedTeam.map(heroId => ({ heldItem: campaignHeldItems[heroId] || null }));
            const index = campaignSelectedTeam.indexOf(id);
            if (index < 0 || !canEquipHeldItem(team, index, itemId, equipInventory)) {
                setSystemAlert('Non possiedi abbastanza copie di questo strumento!');
                return;
            }
            setCampaignHeldItems(old => ({ ...old, [id]: itemId || null }));
        };
        const isSecondCampaign = activeCampaignId === 'torneo_assoluto';
        const isFinalRaid = activeCampaignId === 'crisi_varco' && campaignState.sectorIdx >= activeCampaign.sectors.length - 1;
        
        // MODIFICA TEAM SIZE: 8 per il Torneo Assoluto, 20 per il Final Raid della prima, 4 normale
        let maxTeamSize = 4;
        if (isFinalRaid) maxTeamSize = 20;
        if (isSecondCampaign) maxTeamSize = 8;
        
        const sector = activeCampaign.sectors[campaignState.sectorIdx] || activeCampaign.sectors[0];
        const mission = sector.missions[campaignState.missionIdx] || sector.missions[0];
        const isEchoFinalRaid = activeCampaignId === 'eco_anime' && mission.echoFinal;
        if (isEchoFinalRaid) maxTeamSize = 24;
        const echoStartingSix = isEchoFinalRaid ? echoRaidStarters(campaignSelectedTeam,campaignState.echoStartingSix).filter(id=>campaignState.rosterStats[id]>0) : [];
        const activeBosses = mission.isAnomaly && mission.id === 'm12_5' && campaignState.anomalyTargets && campaignState.anomalyTargets.length > 0 ? campaignState.anomalyTargets : mission.boss;

        const showSelectionDialogue = (charId, isDeselect = false) => {
            const TEAM_SELECTION_QUOTES = {
                // Eroi classici & Cartoon Network
                'finn': "Matematico! La mia spada è pronta per il torneo!",
                'jake': "Mi allungherò fino alla vittoria, fratello!",
                'topolino': "Ah-ah! Insieme siamo una squadra imbattibile!",
                'spongebob': "Sono pronto! Sono pronto! Vinceremo la coppa!",
                'patrick': "Posso usare la maionese come arma in questo torneo?",
                'mario': "Mamma mia! Let's-a go! Salteremo in testa a tutti!",
                'luigi': "O-okey dokey... spero non ci siano fantasmi sul ring.",
                'crash': "Whoa! *Gira su se stesso e fa pollice in su*",
                'rainbowdash': "Sarà tutto fatto in 10 secondi netti! Più figo del 20%!",
                'darwin': "Andiamo a spaccare tutto, amico!",
                'po': "Skadoosh! Il Guerriero Dragone è in campo!",

                // Anime & Shonen
                'goku': "Evvai! Non vedo l'ora di sfidare tipi fortissimi!",
                'natsu': "Sono tutto un fuoco! Spacchiamo tutto!",
                'zatchbell': "Zaker! Dimostrerò di essere un re valoroso!",
                'zuko': "Ripristinerò il mio onore su questo ring. Non fallirò.",
                'aang': "Manterremo l'equilibrio. Yip yip, andiamo!",
                'katara': "Vi coprirò le spalle con il potere dell'acqua curativa.",
                'laxus': "Fatevi da parte. Ci penserà il mio fulmine a spazzarli via.",
                'sanemi': "Tsk. Levatevi di mezzo, li farò a fette in un secondo.",
                'shinobu': "Ara ara~ Li avvelenerò con estrema dolcezza.",
                'juvia': "Juvia combatterà con la forza del suo amore!",
                'brago': "Schiaccerò i miei nemici con la pura gravità.",
                'ponygon': "Meru meru meee!",
                'penny': "Amore mio, vincerò per te! Akur!",
                'yusei': "La nostra accelerazione supererà ogni limite!",
                'astral': "Formuliamo la tattica vincente. Osservazione: vinceremo.",

                // Supereroi & Maghetti
                'ladybug': "Miraculous! La fortuna è dalla nostra parte.",
                'chatnoir': "Pronto a graffiare, M'lady! Sarà un gioco da gatti.",
                'cyborg': "Booyah! Sistemi tattici e cannoni sonici operativi!",
                'corvina': "Basta che ci sbrighiamo. Ho un libro da finire.",
                'robin': "Titani, uniti! Sincronizziamo gli attacchi e vinceremo.",
                'stellarubia': "Amici! Che gioia meravigliosa lottare insieme a voi!",
                'nightwing': "Ottima scelta. Colpiremo dai punti ciechi.",
                'bumblebee': "Pronta a pungere! Non vi deluderò!",
                'bloom': "La Fiamma del Drago brucia per la nostra squadra!",
                'iris': "Cristallo di Ephedia! Sono pronta!",
                'charmcaster': "Vi aiuterò io. Evidentemente avete un disperato bisogno di magia vera.",

                // Villain & Antieroi
                'kratos': "Hmph. Le mie lame non conoscono pietà. Nessuno sopravviverà.",
                'bowser': "BWAHAHAH! Ridurrò in cenere gli altri team! Il Re è qui!",
                'wario': "Wah! Se vinciamo, il montepremi in monete d'oro è tutto MIO!",
                'plankton': "Userò i soldi del premio per rubare la ricetta segreta! Ahahah!",
                'cell': "Vi mostrerò cosa significa affrontare la vera Perfezione.",
                'trigon': "Schiaccerò questi vermi mortali per te... ma solo per stavolta.",
                'gaston': "Nessuno combatte, colpisce o vince in un torneo come Gaston!",
                'shego': "Ugh, va bene. Ma se perdiamo vi friggo col plasma.",
                'hannibal': "Un banchetto eccellente. Spero che i nostri avversari siano... saporiti.",
                'zazan': "Una Regina merita solo la vittoria assoluta. Inchinatevi!",
                'barry': "AHAHAH! Li farò a fettine magiche!",
                'juri': "Hehehe... facciamoli a pezzi e divertiamoci un po'.",
                'reboo': "BWAHAHAH! Intrappolerò tutti nei miei quadri!",
                'metalsonic': "Obiettivo: Annientamento totale.",
                'ursula': "Oh, tesoro! Siete venuti dalla strega del mare giusta!",
                'strega': "Le mie magie oscure e i miei servitori vi saranno utili.",

                // Magia, Fantasy e Mostri
                'marceline': "Ottima scelta. Facciamo un po' di rumore con il basso!",
                'reghiaccio': "Evviva! Se vinciamo mi regalate una Principessa in premio?!",
                'elsa': "Il freddo non mi ha mai disturbata. Congelerò l'arena.",
                'pyra': "L'Egida brucerà per la nostra alleanza. Contate su di me.",
                'dannyphantom': "Diventerò fantasma e non sapranno nemmeno cosa li ha colpiti!",
                'godzilla': "*RUGGITO ASSORDANTE CHE FA TREMARE L'INTERA ARENA!*",
                'sdentato': "*Soffia un po' di plasma felice e scodinzola pronto alla lotta*",
                'spyro': "Pronto a scaldare l'atmosfera! Lasciateli a me!",
                'ryuk': "Hehehe... va bene combattere, ma dopo mi compri delle mele succose?",
                'jackfrost': "Pronto a portare un po' di gelo in questa festa!",
                'yukionna': "Li congelerò con la mia bellezza e il mio alito di ghiaccio.",
                'zabuza': "La nebbia della morte li avvolgerà, e poi colpirò.",
                'nito': "Tutti finiranno nella tomba, prima o poi. Vi mostrerò la via.",
                'zergling': "*Stridio di battaglia acutissimo e feroce!*",
                'polterpup': "*Abbaia felicemente e lecca lo schermo!*",

                // Supporti, Robot e Bizzarri
                'sage': "Dimostrerò di non essere solo una guaritrice!",
                'ariana': "YUH!",
                'entoma': "Oh... nuovi spuntini per me e per le mie amiche mosche.",
                'stewie': "La vittoria è calcolata al 100%. Le mie armi sono pronte.",
                'carlos': "Ricevuto. Armi cariche. Coprirò le vostre spalle.",
                'leon': "Niente panico. Ho la situazione sotto controllo.",
                'bulma': "Lasciate fare ai miei gadget! La tecnologia Capsule Corp vince sempre!",
                'peridot': "Ahah! Siete fortunati ad avere una mente superiore e certificata come la mia!",
                'snorlax': "Zzz... mh? Devo alzarmi? Va bene... ma dopo si mangia!",
                'groot': "Io sono Groot!",
                'miku': "La mia voce vi guiderà alla vittoria! One, two, tre, let's go!",
                'maxcaulfield': "Pronta! E se le cose vanno male... beh, riavvolgerò il tempo.",
                'chloeprice': "Hella yes! Andiamo a spaccare qualche muso là fuori!",
                'gaster': "I... n... t... e... r... e... s... s... a... n... t... e...",
                'utopia': "Luce della Speranza, guidaci alla vittoria!",
                'cosmo': "Speriamo di non trasformare nessuno in un budino al cioccolato!",
                'mantide': "Velocità e precisione. Non mi vedranno arrivare.",
                'yugo': "Uso i miei portali per portarvi la vittoria in un lampo!",
                'spike': "*Agita un cactus felice verso di voi*",
                'whisper': "Il mio Yo-kai Pad dice che abbiamo il 100% di probabilità di vittoria!",
                'leslie': "Cercherò di non fare appassire nessuno! Sono delicato!",
                'roserade': "*Si esibisce in un inchino elegante spargendo petali*",
                'dolli': "Un sorriso luminoso e spacchiamo tutto!",
                'kevin': "Vi mostrerò la vera durezza della roccia, a suon di pugni.",
                'cuoredipietra': "Schiaccerò l'imperfezione in mille pezzi!",
                'shifu': "La pace interiore guiderà i nostri colpi verso il trionfo.",
                'gardevoir': "Proteggerò i miei alleati a costo della mia stessa vita.",
                'jakedc': "Ho preso un lanciafiamme! Andiamo!",
                'shrek': "Meglio fuori che dentro! La palude dominerà il ring!",
                'kai': "Il fuoco è la mia forza! Vi farò vedere di cosa è capace un vero Ninja!",
                'ainz': "Dimostrerò il potere supremo della Grande Tomba di Nazarick.",
                'terra': "Posso spostare le montagne. Letteralmente. Contate su di me!",
                'weiss': "Myrtenaster è pronta. Mostreremo a questa gentaglia la nostra eleganza.",
                'neon': "Pronti? Io sono nata pronta. Vado a fulminarli!",
                'doraemon': "Lasciate fare a me e ai miei gadget dal 22° secolo!",
                'ilcavaliere': "*Il Cavaliere ti fissa in silenzio, poi si ritira nell'ombra.*",
                'dante': "Jackpot! Facciamoli a pezzi con stile.",
                'megamind': "La differenza tra un cattivo e un supercattivo? La PRESENTAZIONE!",
                'sumo': "Nessuno può spostarmi dal ring!",
                'elly': "Bau! Bau bau bau! (Pronta a mordere le caviglie!)",
                'arievicente': "La mia lama non conosce imperfezioni. Affronteremo il torneo con eleganza assoluta.",
                'diamantebianco': "La vostra luce impallidisce di fronte alla mia perfezione.",
                'sugino': "I miei fiori vi mostreranno il potere della natura!",
                'naruto': "Non mi arrenderò mai! Questo è il mio credo ninja!",
                'sasuke': "Taglierò ogni legame ostile per raggiungere la vittoria.",
                'meliodas': "Sate sate sate! Facciamo sul serio!",
                'ban': "Hehe... preparatevi, vi ruberò anche le mutande!",
                'sans': "che bella giornata fuori. gli uccellini cantano... i fiori sbocciano...",
                'roxy': "Sono la migliore! Tutti mi adorano!",
                'perla': "Mostrerò loro la vera eleganza in combattimento! Per Rose!",
                'mechajohnny': "Bling-Bling Boy mi fa un baffo! Test robotico in corso!",

                'default': "Contate su di me! Insieme porteremo a casa la vittoria!"
            };

            const DESELECT_QUOTES = {
                // Eroi
                'goku': "Ah, va bene. Vado a fare un po' di flessioni in panchina!",
                'spongebob': "Ok! Aspetterò qui e preparerò dei Krabby Patty per la squadra!",
                'mario': "Mamma mia... farò il tifo-a per voi da qui!",
                'natsu': "Eh?! Ma io voglio combattere!! Uffa, che noia!",
                'crash': "Aww... *Fa una faccia triste e si siede*",
                'ladybug': "Nessun problema, vi fornirò supporto strategico da fuori.",
                'aang': "D'accordo, mediterò per inviarvi energie positive.",
                'darwin': "Oh... okay. Farò il tifo per voi dagli spalti.",
                'po': "Ottimo! Vado a mangiarmi dei ravioli al vapore. Avvisatemi se serve!",
                'sage': "Tornerò a concentrarmi sulle cure, allora.",
                'ariana': "Thank u, next.",

                // Cattivi / Antieroi
                'bowser': "COSA?! Come osi mettere da parte il potente Re dei Koopa?!",
                'kratos': "Come desideri. Ma la mia ira dovrà essere sfogata prima o poi.",
                'wario': "Wah?! Pesciferi! Spero perdiate così tengo io i soldi di consolazione!",
                'cell': "Tsk. Sciocchi imperfetti. Vi pentirete di non aver usato il mio potere.",
                'stewie': "Scelta deplorevole. Ma mi gusterò lo spettacolo della vostra disfatta.",
                'sanemi': "Tsk. Peggio per voi. Mi limiterò a guardare le vostre facce da perdenti.",
                'gaston': "Pazzesco! Lasciare Gaston in panchina?! Siete ciechi?!",
                'barry': "Tsk, non sapete cosa vi perdete. Andrò ad affettare qualcosa.",
                'reboo': "Grrr! La pagherete per avermi escluso!",
                'metalsonic': "Modalità standby attivata. In attesa.",
                'ursula': "Poveri, infelici sventurati! Rimpiangerete questa scelta!",
                'strega': "Tsk. Peggio per voi, stolti. La mia magia mi terrà compagnia.",

                // Altri
                'snorlax': "Zzz... meglio così... torno a dormire... Zzz...",
                'groot': "*Sguardo tristissimo* Io... sono Groot...",
                'reghiaccio': "Cosa?! E la mia Principessa?! Uff, vado a parlare con Gunter.",
                'chloeprice': "Che palla. Vado a farmi un giro dietro gli spalti allora.",
                'ryuk': "Peccato. Niente lotte, niente mele. Che noia il mondo degli umani.",
                'leslie': "Oh, bene. Vado a farmi innaffiare da qualche parte.",
                'roserade': "*Si gira sdegnata e se ne va spargendo foglie secche*",
                'juvia': "Juvia è così triste di essere esclusa... pioverà per giorni.",
                'dolli': "Uff, vado a rifarmi il trucco allora.",
                'kevin': "Vabbè. Ritorno a essere un normale pezzo di strada.",
                'cuoredipietra': "La mia roccia attenderà il suo momento.",
                'utopia': "Compreso. Ritorno nell'Extra Deck.",
                'cosmo': "Evviva! Torno da Wanda a mangiare i cereali!",
                'mantide': "La pazienza è la virtù del guerriero. Aspetterò nell'ombra.",
                'garnet': "Rispetto la tua scelta. Ritornerò al Tempio.",
                'lapis': "Torno a volare da sola. È più tranquillo.",
                'yugo': "Okay, vado a salutare Amalia e gli altri nel frattempo.",
                'spike': "*Si siede triste a terra pungendo un palloncino*",
                'nito': "Il riposo eterno attende me e le mie ossa.",
                'entoma': "Peccato... tornerò a mangiare qualche insetto di passaggio.",
                'jackfrost': "Che noiosi. Vado a fare a palle di neve con qualcun altro.",
                'yukionna': "Il mio cuore di ghiaccio si spezza un po' di più...",
                'zabuza': "Come vuoi. La mia mannaia riposa.",
                'polterpup': "*Guaisce mestamente e scompare attraverso un muro*",
                'rias': "Peccato. Tornerò a bere del tè con i miei servitori.",
                'zergling': "*Ringhia sommessamente e si rintana nel terreno*",
                'whisper': "Come?! Il mio Pad diceva che ero il membro più indispensabile!",
                'astral': "Comprendo. Ritorno nella Chiave dell'Imperatore in meditazione.",
                'yusei': "Il motore è spento, per ora. Sono ai box se vi servo.",
                'juri': "Che noia, volevo proprio spaccare qualche osso oggi.",
                'iris': "Vado a fare le prove con le Lolirock, allora! Ciao!",
                'bumblebee': "Beh, fatemi sapere se vi serve una scossa di energia.",
                'penny': "Uffa! Io volevo combattere insieme al mio amato Zatch!",
                'brago': "Hmph. Patetico scartare la vera forza.",
                'ponygon': "Meru... :(",
                'shifu': "Mediterò sul vostro futuro e forse sul vostro fallimento.",
                'gardevoir': "*Fa un inchino profondamente rispettoso e svanisce nel nulla*",
                'jakedc': "Vado a fare battute altrove, gente senza umorismo.",
                'shrek': "Fate come volete. Io me ne torno nella mia palude!",
                'kai': "Tsk, il fuoco non si spegne così facilmente. Vi aspetterò qui.",
                'ainz': "Una mossa saggia. Osserverò le capacità di questi esseri inferiori.",
                'terra': "Come volete. Torno a fare una passeggiata tra le rocce.",
                'weiss': "Tsk. Non avete alcun gusto per la vera arte della spada.",
                'neon': "Uffa, ma siete lentissimi! Fatemi sapere quando vi serve una vera scossa.",
                'doraemon': "Oh, d'accordo... vado a mangiarmi dei dorayaki in panchina.",
                'ilcavaliere': "*Il Cavaliere ti fissa in silenzio, poi si ritira nell'ombra.*",
                'dante': "Niente demoni da cacciare? Allora mi vado a mangiare una pizza.",
                'megamind': "Tsk, il mio genio era sprecato qui in panchina.",
                'sumo': "Uff, vado a mangiarmi qualcosa allora.",
                'elly': "*Guaisce e va a cuccia offesa.*",
                'arievicente': "Una scelta priva di eleganza. Tornerò ad affilare la mia lama nell'ombra.",
                'diamantebianco': "Come osate ignorare la mia luce? Scomparite.",
                'sugino': "D'accordo, tornerò a prendermi cura dei miei germogli.",
                'naruto': "Uffa... va bene, vado a mangiare del ramen da Ichiraku.",
                'sasuke': "Tsk. Non avete il potere necessario per comprendermi.",
                'meliodas': "Nessun problema, torno a servire birra al Boar Hat.",
                'ban': "Tsk, vado a farmi una bella bevuta di birra allora. Non disturbatemi.",
                'sans': "ok. vado da grillby's.",
                'roxy': "Pff, perdenti. Andate a piangere altrove.",
                'perla': "Come volete. Ma la vostra tecnica è a dir poco approssimativa.",
                'leon': "Ricevuto. Mi posiziono nelle retrovie e tengo d'occhio il perimetro.",
                'mechajohnny': "Uffa! Allora vado in laboratorio a fare esplodere qualcosa con Dukey.",

                'default': "Oh, vabbè... farò il tifo dalla panchina. Spaccate tutto!"
            };

            const char = CHARACTERS.find(c => c.id === charId);
            if (char) {
                const text = isDeselect ? (DESELECT_QUOTES[charId] || DESELECT_QUOTES['default']) : (TEAM_SELECTION_QUOTES[charId] || TEAM_SELECTION_QUOTES['default']);
                setTeamSelectionDialogue({
                    name: char.name,
                    img: char.img,
                    text: text
                });
                
                if (selectionDialogueTimerRef.current) clearTimeout(selectionDialogueTimerRef.current);
                selectionDialogueTimerRef.current = setTimeout(() => {
                    setTeamSelectionDialogue(null);
                }, 3500); // Nasconde il popup dopo 3.5 secondi
            }
        };

        const toggleChar = (id) => {
            const isAnomalyTarget = mission.isAnomaly && mission.id === 'm12_5' && campaignState.anomalyTargets && campaignState.anomalyTargets.includes(id);
            if (isAnomalyTarget) {
                setSystemAlert("Questo personaggio è stato infettato dall'Anomalia e non può essere schierato! Lo affronterai a breve!");
                return;
            }

            if (mission.forcedRoster) {
                // Tutti e 24 restano arruolati: al raid puoi scegliere soltanto
                // quali SEI iniziano in campo, gli altri sono riserve.
                if(isEchoFinalRaid){
                    setCampaignState(prev=>({
                        ...prev,
                        echoStartingSix:toggleEchoRaidStarter(campaignSelectedTeam,
                            echoStartingSix,id)
                    }));
                    return;
                }
                setSystemAlert("Questa missione richiede una squadra fissa per motivi di trama!");
                return;
            }

            if (activeCampaignId === 'torneo_assoluto' && id === campaignState.protagonist && campaignState.roster.length > 8) {
                setSystemAlert("Il tuo protagonista deve guidare l'alleanza, non puoi rimuoverlo dalla selezione base!");
                return;
            }

            if (campaignSelectedTeam.includes(id)) {
                setCampaignSelectedTeam(campaignSelectedTeam.filter(c => c !== id));
                if (activeCampaignId === 'torneo_assoluto') {
                    showSelectionDialogue(id, true);
                }
            } else {
                if (campaignSelectedTeam.length < maxTeamSize) {
                    setCampaignSelectedTeam([...campaignSelectedTeam, id]);
                    if (activeCampaignId === 'torneo_assoluto') {
                        showSelectionDialogue(id, false);
                    }
                }
            }
        };
        
        const handleStartCampaignBattle = () => {
            const aliveCount = campaignState.roster.filter(id => campaignState.rosterStats[id] > 0).length;
            const requiredCount = Math.min(maxTeamSize, aliveCount);

            if (campaignSelectedTeam.length === 0) return setSystemAlert("Seleziona almeno un personaggio!");
            if (isEchoFinalRaid && (campaignSelectedTeam.length !== 24 || !campaignState.roster.every(id=>campaignSelectedTeam.includes(id))))
                return setSystemAlert('Il raid contro Echomax richiede tutti i 24 membri della Resistenza!');
            if(isEchoFinalRaid && !isCompleteEchoRaidLineup(campaignSelectedTeam,echoStartingSix))
                return setSystemAlert('Scegli esattamente 6 titolari. Gli altri 18 resteranno disponibili per le sostituzioni!');
            
            if (activeCampaignId === 'torneo_assoluto') {
                if (campaignState.roster.length > maxTeamSize && campaignSelectedTeam.length !== maxTeamSize) {
                    return setSystemAlert(`Devi formare un'alleanza di esattamente ${maxTeamSize} campioni!`);
                }
                if (campaignState.roster.length <= maxTeamSize && campaignSelectedTeam.length !== requiredCount) {
                    return setSystemAlert(`Devi schierare tutti i tuoi ${requiredCount} campioni in vita!`);
                }
            }
            
            // Fissa l'Alleanza nel Torneo Assoluto alla prima battaglia
            if (activeCampaignId === 'torneo_assoluto' && campaignState.roster.length > maxTeamSize) {
                const newRosterStats = {};
                campaignSelectedTeam.forEach(id => {
                    newRosterStats[id] = campaignState.rosterStats[id] || CHARACTERS.find(c=>c.id===id).maxHp;
                });
                
                setCampaignState(p => ({
                    ...p,
                    roster: [...campaignSelectedTeam],
                    rosterStats: newRosterStats
                }));
            }
            
            const battleRoster = isEchoFinalRaid ? orderEchoRaidRoster(campaignSelectedTeam,echoStartingSix) : campaignSelectedTeam;
            const p1Team = battleRoster.map(id => {
                const baseChar = CHARACTERS.find(c => c.id === id);
                if (!baseChar) return null; // FIX: Previene crash fatali
                const echoLocked=isEchoFinalRaid && (campaignState.echoCorruptedLockedIds||[]).includes(id);
                const hp = echoLocked ? 0 : (campaignState.rosterStats[id] || 100);
                const instance={
                    ...JSON.parse(JSON.stringify(baseChar)), hp: hp, statuses: [], consecutiveProtect: 0, heldItem: campaignHeldItems[id] || null,
                    ...(echoLocked?{echoCorruptedLocked:true,echoSoulPermanentDefeat:true}:{}),
                    ...(id==='lucy'?{zodiacSpiritId:campaignZodiacChoices[id]||'zodiac_aries'}:{}),
                    baseAtk: baseChar.atk, baseDef: baseChar.def, baseSpd: baseChar.spd,
                    moves: baseChar.moves.filter(Boolean).map(m => ({ ...m, remainingUses: m.maxUses !== undefined ? m.maxUses : null }))
                };
                const personal=getPlayerData();
                return canTrainCharacter(baseChar,personal) ? applyStrengthToFighter(instance,personal.strengthUpgrades):instance;
            }).filter(Boolean); // Rimuove i null per sicurezza

            if(mission.echoMission && !isEchoFinalRaid)
                applyEchoRouteToTeam(p1Team,campaignState.echoRouteChoices?.[mission.id]);

            let p2Team = [];
            let isValidSavedBoss = false;

            if (campaignState.currentBossState && campaignState.currentBossState.length > 0 &&
                // Dopo la revisione a sei nemici un vecchio checkpoint con 2-3
                // nemici non deve svuotare la nuova squadra.
                (!mission.echoMission || !['eco_34','eco_35','eco_36'].includes(mission.id) ||
                  (campaignState.echoChallengeVersion===mission.echoChallengeVersion &&
                   campaignState.echoChallengeMissionId===mission.id &&
                   (!isEchoFinalRaid||campaignState.echoFinalSoulVersion===ECHO_FINAL_SOUL_VERSION)))) {
                // FIX CRITICO: Ignora il salvataggio vecchio se avevi già perso contro Groot e Snorlax PRIMA dell'aggiornamento
                const isOldM24Save = mission.id === 'm24' && campaignState.currentBossState.length <= 2 && !campaignState.currentBossState.some(c => ['piantacarnivora', 'cespugliomaledetto', 'alberto', 'fioretenebroso'].includes(c.id));
                
                if (!isOldM24Save) {
                    isValidSavedBoss = campaignState.currentBossState.some(c => Number(c.hp) > 0 && ((mission.isAnomaly && mission.id === 'm12_5') || activeBosses.includes(c.id) || (isEchoFinalRaid && c.isEchoCorruptedSoul)));
                }
            }

            if (isValidSavedBoss) {
                p2Team = campaignState.currentBossState.filter(savedC => Number(savedC.hp) > 0).map(originalSavedC => {
                    // Aggiorna i salvataggi precedenti al bilanciamento del raid,
                    // conservando la percentuale di salute già consumata.
                    const savedC=isFinalRaid ? rebalanceSavedFinalRaidBoss(originalSavedC) : originalSavedC;
                    let baseChar = CHARACTERS.find(c => c.id === savedC.id);
                    if (!baseChar) baseChar = CHARACTERS.find(c => c.id === 'scheletro');
                    
                    let charInst = {
                        ...JSON.parse(JSON.stringify(baseChar)), 
                        hp: savedC.hp,
                        maxHp: savedC.maxHp,
                        name: savedC.name || baseChar.name,
                        ...(savedC.isEchoPuppet?{isEchoPuppet:true,echoCloneLabel:savedC.echoCloneLabel}:{}),
                        ...(savedC.echoFinalForm?{echoFinalForm:savedC.echoFinalForm}:{}),
                        ...(savedC.isEchoSoulRecalledProjection?{isEchoSoulRecalledProjection:true}:{}),
                        echoNormalSoulsSummoned:!!savedC.echoNormalSoulsSummoned,
                        ...(savedC.isEchoCorruptedSoul?{isEchoCorruptedSoul:true,
                            echoCorruptionSourceId:savedC.echoCorruptionSourceId,
                            echoCorruptionSourceIndex:savedC.echoCorruptionSourceIndex,
                            echoSoulPermanentDefeat:true}:{}), 
                        statuses: savedC.statuses || [], 
                        consecutiveProtect: 0,
                        atk: savedC.atk, 
                        baseAtk: savedC.baseAtk ?? (isEchoFinalRaid&&savedC.id==='echomax'&&savedC.echoFinalForm!=='normal'?270:savedC.atk), 
                        def: savedC.def, 
                        baseDef: savedC.baseDef ?? (isEchoFinalRaid&&savedC.id==='echomax'&&savedC.echoFinalForm!=='normal'?190:savedC.def), 
                        spd: savedC.spd, 
                        baseSpd: savedC.baseSpd ?? (isEchoFinalRaid&&savedC.id==='echomax'&&savedC.echoFinalForm!=='normal'?155:savedC.spd),
                        moves: baseChar.moves.filter(Boolean).map(m => ({ ...m, remainingUses: m.maxUses !== undefined ? m.maxUses : null }))
                    };
                    
                    if(mission.theaterMission && savedC.id==='regista'){
                      charInst.theaterFinalBoss=!!savedC.theaterFinalBoss||!!mission.theaterFinal;
                      charInst.theaterPhase=savedC.theaterPhase||1;
                    }
                    // Riporta anche i checkpoint precedenti al nuovo massimo,
                    // mantenendo la percentuale di PS rimasta nel raid.
                    if (isEchoFinalRaid && savedC.id === 'echomax' && savedC.echoFinalForm!=='normal') {
                        const previousMaxHp = Math.max(1, Number(savedC.maxHp) || ECHO_FINAL_BOSS_HP);
                        const previousHp = Math.max(0, Number(savedC.hp) || 0);
                        charInst.maxHp = ECHO_FINAL_BOSS_HP;
                        charInst.hp = Math.max(1, Math.min(ECHO_FINAL_BOSS_HP, Math.round(previousHp / previousMaxHp * ECHO_FINAL_BOSS_HP)));
                    }

                    if(isEchoFinalRaid && savedC.id==='echomax' && savedC.echoFinalForm!=='normal'){
                      charInst.echoHalfResetDone=!!savedC.echoHalfResetDone;
                      charInst.echo35SoulRecallDone=!!savedC.echo35SoulRecallDone;
                      charInst.echoOriginalSoulsDefeated=[...(savedC.echoOriginalSoulsDefeated||[])];
                      charInst.echoRaidLastPulseTurn=savedC.echoRaidLastPulseTurn??null;
                      charInst.moves=echoRaidMovesAtFullAccuracy(charInst.moves);
                    }
                    charInst.isSummonOnly = false; // Gli aiutanti hanno PS propri.
                    if(isEchoFinalRaid&&isEchoFinalSoulId(charInst.id)){
                        charInst.isEchoSoulGuardian=true;
                        charInst.echoSoulPermanentDefeat=true;
                        charInst.soulMasterId='echomax';
                    }

                    // Riassegna il filtro immagine
                    if (activeCampaignId === 'crisi_varco') {
                        if (!isFinalRaid) {
                             charInst.imageFilter = mission.isAnomaly ? 'sepia(0.3) hue-rotate(280deg) saturate(3) brightness(0.6) contrast(1.5) drop-shadow(0 0 15px rgba(217,70,239,0.9))' : 'sepia(0.6) hue-rotate(250deg) saturate(3) brightness(0.7) contrast(1.3) drop-shadow(0 0 10px rgba(168,85,247,0.8))';
                        } else {
                             charInst.imageFilter = 'drop-shadow(0 0 20px rgba(220,38,38,1))'; 
                        }
                    } else {
                        charInst.imageFilter = savedC.imageFilter || baseChar.imageFilter || 'none';
                    }
                    
                    // RIPRISTINO ABILITA' DA SUPER-BOSS (JUGGERNAUT, SCUDO E PURIFICAZIONE PASSIVA)
                    if (savedC.isJuggernaut || (isFinalRaid && (charInst.id === 'trigon' || charInst.id === 'gaster')) || (isEchoFinalRaid && charInst.id==='echomax' && savedC.echoFinalForm!=='normal')) {
                         charInst.isJuggernaut = true;
                         charInst.juggTurnCount = savedC.juggTurnCount || 0;
                         const raidBalance=isFinalRaid?finalRaidBossStats(charInst.id):null;
                         charInst.juggHitsRemaining = raidBalance
                             ? Math.min(raidBalance.shieldHits,Math.max(0,savedC.juggHitsRemaining||0))
                             : (savedC.juggHitsRemaining||0);
                         charInst.shieldGrantedHits = isEchoFinalRaid ? 8 : (raidBalance?.shieldHits || savedC.shieldGrantedHits || 4);
                         if(isEchoFinalRaid && charInst.id==='echomax' && charInst.echoFinalForm!=='normal'){
                           charInst.isEchoRaidBoss=true;
                           charInst.echoFinalDialogueStages=[...(savedC.echoFinalDialogueStages||[])];
                         }
                         
                         const hpRatio = charInst.hp / charInst.maxHp;
                         charInst.juggShieldHpThresholds = (isEchoFinalRaid?[0.8,0.6,0.4,0.2]:[0.75, 0.50, 0.25]).filter(t => t < hpRatio);
                    }

                    return charInst;
                });
            } else {
                // Calcolo scaling progressivo (ogni settore aumenta HP del 5% e Stat del 3%)
                let progressiveScale = 1 + (campaignState.sectorIdx * 0.05);
                const echoScaling=mission.echoMission&&!isEchoFinalRaid
                  ?echoEnemyScaling(mission.echoNumber,{insane:campaignState.difficulty==='Insane'})
                  :null;

                p2Team = activeBosses.map((id,enemyIdx) => {
                    let baseChar = CHARACTERS.find(c => c.id === id);
                    
                    // FIX CRITICO: Se l'id del boss manca (es. anomalia non salvata bene), usa uno scheletro per evitare lo SCHERMO NERO
                    if (!baseChar) {
                        baseChar = CHARACTERS.find(c => c.id === 'scheletro');
                    }
                    
                    let hpMultiplier = echoScaling?.hp ?? progressiveScale;
                    if (isEchoFinalRaid && baseChar.id === 'echomax') hpMultiplier = 1;
                    if (isFinalRaid) hpMultiplier = 25; // Raid originale della prima campagna
                    else if (campaignState.difficulty === 'Insane' && !echoScaling) hpMultiplier *= 1.5; 
                    
                    const raidBossBalance=isFinalRaid?finalRaidBossStats(baseChar.id):null;
                    let hp = isEchoFinalRaid && baseChar.id === 'echomax' ? ECHO_FINAL_BOSS_HP : raidBossBalance?.maxHp ?? Math.floor(baseChar.maxHp * hpMultiplier);
                    if(mission.theaterMission && baseChar.id==='regista' && mission.theaterNumber>=35)
                      hp=mission.theaterFinal?950:450;
                    
                    let charInst = {
                        ...JSON.parse(JSON.stringify(baseChar)), hp: hp, maxHp: hp, statuses: [], consecutiveProtect: 0,
                        baseAtk: baseChar.atk, baseDef: baseChar.def, baseSpd: baseChar.spd,
                        moves: baseChar.moves.filter(Boolean).map(m => ({ ...m, remainingUses: m.maxUses !== undefined ? m.maxUses : null }))
                    };

                    charInst.isSummonOnly = false; // FIX: I boss della campagna sono sempre considerati combattenti principali
                    if(mission.theaterFinal && charInst.id==='regista'){
                      charInst.theaterFinalBoss=true;
                      charInst.theaterPhase=1;
                    }
                    
                    // Buff Alle Statistiche (Attacco e Difesa scalano in base al settore)
                    if (!isFinalRaid) {
                         charInst.atk = Math.max(1,Math.floor(charInst.atk * (echoScaling?.atk ?? (1 + (campaignState.sectorIdx * 0.03)))));
                         charInst.baseAtk = charInst.atk;
                         charInst.def = Math.max(1,Math.floor(charInst.def * (echoScaling?.def ?? (1 + (campaignState.sectorIdx * 0.03)))));
                         charInst.baseDef = charInst.def;
                         if(echoScaling){
                           charInst.spd=Math.max(1,Math.floor(charInst.spd*echoScaling.spd));
                           charInst.baseSpd=charInst.spd;
                         }
                         if (activeCampaignId === 'crisi_varco') {
                             if (baseChar.imageFilter) {
                                 charInst.imageFilter = baseChar.imageFilter; // Mantieni il colore base per i Cell Jr
                             } else {
                                 charInst.imageFilter = mission.isAnomaly ? 'sepia(0.3) hue-rotate(280deg) saturate(3) brightness(0.6) contrast(1.5) drop-shadow(0 0 15px rgba(217,70,239,0.9))' : 'sepia(0.6) hue-rotate(250deg) saturate(3) brightness(0.7) contrast(1.3) drop-shadow(0 0 10px rgba(168,85,247,0.8))';
                             }
                         } else {
                             charInst.imageFilter = baseChar.imageFilter || 'none';
                         }
                    } else {
                         charInst.atk = Math.floor(charInst.atk * 1.5); // Final raid buff
                         charInst.baseAtk = charInst.atk;
                         charInst.def = Math.floor(charInst.def * 1.2);
                         charInst.baseDef = charInst.def;
                         if (activeCampaignId === 'crisi_varco') {
                             charInst.imageFilter = 'drop-shadow(0 0 20px rgba(220,38,38,1))'; // Aura rossa oscura per i boss finali
                         } else {
                             charInst.imageFilter = baseChar.imageFilter || 'none';
                         }
                    }

                    if (campaignState.difficulty === 'Insane' || isFinalRaid) {
                        charInst.statuses.push({ type: 'Protetto', turns: 1 });
                        charInst.statuses.push({ type: 'Scudo Team', turns: 2 });
                    }
                    
                    // Buff Alle Statistiche dei Super Boss
                    if (isFinalRaid) {
                         charInst.atk = Math.floor(charInst.atk * 2.0); // Aumentato da 1.5 a 2.0
                         charInst.baseAtk = charInst.atk;
                         charInst.def = Math.floor(charInst.def * 1.5); // Aumentato da 1.2 a 1.5
                         charInst.baseDef = charInst.def;
                         charInst.imageFilter = 'drop-shadow(0 0 20px rgba(220,38,38,1))'; // Aura rossa oscura per i boss finali
                         
                         // Aggiunta meccanica Scudo da Raid per Trigon e Gaster
                         if (charInst.id === 'trigon' || charInst.id === 'gaster') {
                             charInst.juggShieldHpThresholds = [0.75, 0.50, 0.25];
                             charInst.juggHitsRemaining = 0;
                             charInst.shieldGrantedHits = raidBossBalance?.shieldHits || 4; // RAID finale: 6 cariche per scudo
                             charInst.isJuggernaut = true; // Attiva la purificazione passiva ogni 2 turni
                         }
                    }

                    if(mission.echoMission&&!isEchoFinalRaid){
                        const disguise=echoPuppetIdentity(mission.id,enemyIdx,baseChar);
                        if(disguise)Object.assign(charInst,disguise);
                    }

                    if(isEchoFinalRaid && isEchoFinalSoulId(charInst.id)){
                        // Le tre anime hanno i loro movimenti originali e un'unica vita.
                        Object.assign(charInst,createEchoFinalSoul(charInst));
                    }

                    if(isEchoFinalRaid && charInst.id==='echomax'){
                        // Echomax affronta sei campioni per volta e fino a 24 nell'intero raid.
                        charInst.isEchoRaidBoss=true;
                        charInst.isJuggernaut=true;
                        charInst.juggHitsRemaining=0;
                        charInst.juggShieldHpThresholds=[0.8,0.6,0.4,0.2];
                        charInst.shieldGrantedHits=8;
                        charInst.echoSoulCharges=0;
                        charInst.atk=270;
                        charInst.def=190;
                        charInst.spd=155;
                        charInst.baseAtk=270;charInst.baseDef=190;charInst.baseSpd=155;
                        charInst.acc=1;
                        charInst.echoHalfResetDone=false;
                        charInst.moves=echoRaidMovesAtFullAccuracy(charInst.moves);
                        charInst.imageFilter='drop-shadow(0 0 32px rgba(168,85,247,0.8))';
                    }
                    if(isEchoFinalRaid&&charInst.id==='echomax'){
                      if(charInst.isEchoRaidBoss){
                        // Checkpoint vecchi: i debuff di precisione precedenti alla
                        // nuova immunità non devono riapparire al rientro.
                        charInst.acc=1.0;
                        charInst.statuses=(charInst.statuses||[]).filter(x=>x?.type!=='Accecato');
                      }
                    }
                    return charInst;
                });
            }

            const state = initialGameState();
            state.gameMode = 'classica';
            state.isCampaignBattle = true;
            state.isEchoFinalBattle = isEchoFinalRaid;
            state.theaterScene=mission.theaterMission?{rule:mission.theaterRule,missionId:mission.id}:null;
            state.isTheaterFinalBattle=!!mission.theaterFinal;
            if(isEchoFinalRaid){
              state.echoFinalStage=isValidSavedBoss
                ?(campaignState.echoFinalStage || (p2Team.some(c=>c.isEchoCorruptedSoul)?'souls':
                    p2Team.some(c=>c.echoFinalForm==='normal')?'normal':'raid'))
                :'raid';
            }
            state.campaignBattleId = mission.id;
            
            // La battaglia usa il motore classico: 6 titolari, 18 in panchina.
            // Gli altri incontri della campagna mantengono le loro regole standard.
            let fSize = 1;
            if (isEchoFinalRaid) {
                fSize = ECHO_ACTIVE_LIMIT;
            } else if (activeCampaignId === 'torneo_assoluto') {
                fSize = 6;
            } else {
                fSize = Math.min(4, Math.max(p1Team.length > 4 ? 4 : p1Team.length, p2Team.length));
                if (mission.forceFieldSize) fSize = mission.forceFieldSize;
            }
            
            state.settings = { teamSize: p1Team.length, fieldSize: fSize, echoRaid: isEchoFinalRaid };
            if((mission.echoMission && mission.echoAct>=3)||(mission.theaterMission&&mission.theaterAct>=4))
              state.cpuStyles={...(state.cpuStyles||{}),p2:'tactical'};
            
            state.players.p1 = playerName || "Resistenza";
            state.playerAvatars.p1 = p1Team.length > 0 ? p1Team[0].img : '';
            state.isBot.p1 = false;
            state.inventory.p1 = getPlayerData().inventory; // FIX: Aggiunto caricamento cure in Campagna!
            
            state.players.p2 = isEchoFinalRaid?'Echomax e le tre Anime Sottomesse' : mission.echoMission&&!isEchoFinalRaid
              ?(mission.id==='eco_34'?'Legione dell’Eco · Finn':mission.id==='eco_35'?'Legione dell’Eco · Topolino':'Legione dell’Eco')
              : mission.isAnomaly && mission.id === 'm12_5' ? "Team Infetto" : activeBosses.map(id => {
                 const b = CHARACTERS.find(c=>c.id===id);
                 return b ? b.name : "Sconosciuto";
            }).join(" & ");
            state.playerAvatars.p2 = p2Team.length > 0 ? p2Team[0].img : '';
            state.isBot.p2 = true;

            state.teams = { p1: p1Team, p2: p2Team, p3: [], p4: [] };
            state.field = { 
                p1: initialCampaignField(p1Team, state.settings.fieldSize),
                p2: initialCampaignField(p2Team, state.settings.fieldSize),
                p3: [], p4: []
            };
            
            // --- FIX: ATTIVAZIONE PASSIVE ON_ENTER PER CAMPAGNA ---
            let initialEvents = [];
            Object.keys(state.field).forEach(p => {
                if (state.field[p]) {
                    const initialField = [...state.field[p]]; // Copia per evitare loop con le evocazioni
                    initialField.forEach(idx => {
                        if (state.teams[p][idx]) {
                            state.teams[p][idx].revealed = true;
                            
                            // Attiva la passiva
                            const char = state.teams[p][idx];
                            if (char.passive && char.passive.type === 'on_enter' && (char.passiveUses || 0) < (char.passive.maxUses || 1)) {
                                char.passiveUses = (char.passiveUses || 0) + 1;
                                applyOnEnterPassive(char, p, idx, state.teams, state.field, initialEvents, state.gameMode, state.settings, state.isCampaignBattle);
                            }
                        }
                    });
                }
            });
            state.events = initialEvents;
            state.battleReport = accumulateBattleReport(state.battleReport, state.teams, initialEvents, {countTurn:false});
            // ------------------------------------------------------

            state.status = 'pre_battle';
            if(mission.echoMission){
              setCampaignState(prev=>({...prev,
                echoChallengeVersion:mission.echoChallengeVersion,
                echoChallengeMissionId:mission.id,
                ...(isEchoFinalRaid?{echoFinalSoulVersion:ECHO_FINAL_SOUL_VERSION}:{})
              }));
            }
            
            // Nuovo scontro dopo una sconfitta: elimina la UI/animazione
            // rimasta dal combattimento precedente. Non servono altri giocatori.
            setCombatLog([]);
            setIsLogOpen(false);
            setIsPlayingEvents(false);
            setEventPlaybackText('');
            setEventPlaybackPassive(null);
            setActionMenuMode('moves');
            setTargetingMoveIdx(null);
            setSelectedMultiTargets([]);
            setPendingHyper(false);
            setCommandingIdx(0);

            setGameState(state);
            setPlayerRole('p1');
            setAppMode('local_room');
        };

        return (
            <div className={`min-h-screen flex flex-col p-6 text-white ${sector.bg} relative overflow-hidden`}>
                
                {/* TOAST MINIDIALOGHI SELEZIONE TORNEO */}
                {teamSelectionDialogue && !mission.forcedRoster && (
                    <div className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-slate-900/95 border-2 border-indigo-500 p-4 rounded-2xl max-w-xl w-[90%] z-50 shadow-[0_0_30px_rgba(99,102,241,0.5)] animate-bounce-in flex items-center gap-4 transition-all">
                        <img src={teamSelectionDialogue.img} className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-indigo-400 shrink-0 shadow-lg" alt={teamSelectionDialogue.name} />
                        <div>
                            <div className="text-indigo-400 font-black text-xs uppercase tracking-widest mb-0.5">{teamSelectionDialogue.name}</div>
                            <div className="text-white italic text-sm md:text-base font-medium">"{teamSelectionDialogue.text}"</div>
                        </div>
                    </div>
                )}

                <div className="flex-1 flex flex-col items-center justify-center mt-6 w-full z-10">
                    <h2 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 text-center">
                        {isEchoFinalRaid
                            ? `Scegli i 6 titolari (${echoStartingSix.length}/6)`
                            : mission.forcedRoster
                            ? "Squadra Tattica Obbligatoria!"
                            : (activeCampaignId === 'torneo_assoluto' && campaignState.roster.length <= maxTeamSize 
                                ? `Schiera i tuoi Campioni (${campaignSelectedTeam.length}/${Math.min(maxTeamSize, campaignState.roster.filter(id => campaignState.rosterStats[id] > 0).length)})` 
                                : `Seleziona la tua Resistenza (${campaignSelectedTeam.length}/${maxTeamSize})`
                            )
                        }
                        {isEchoFinalRaid && <span className="block text-base text-cyan-300 mt-3">
                            Tutti i 24 Multimon partecipano: 6 iniziano in campo e 18 restano in panchina.
                            Tocca i ritratti per scegliere i titolari. Durante la battaglia potrai cambiarli normalmente.
                        </span>}
                        {activeCampaignId === 'torneo_assoluto' && campaignState.roster.length > maxTeamSize && !mission.forcedRoster && <span className="block text-sm text-indigo-400 mt-2">Forma l'Alleanza fissa da 8 (5 Membri + 3 Riserve)</span>}
                    </h2>
                    
                    {isEchoFinalRaid&&<section className="w-full max-w-3xl mb-5 rounded-2xl border-2 border-fuchsia-400/70 bg-gradient-to-r from-purple-950/90 via-slate-950/90 to-purple-950/90 p-3 sm:p-5 shadow-[0_0_28px_rgba(168,85,247,0.2)]">
                        <h3 className="text-lg sm:text-xl font-black text-fuchsia-200 text-center">👻 ECHOMAX E LE TRE ANIME PRIGIONIERE</h3>
                        <p className="text-center text-xs sm:text-sm text-slate-200 mt-1 mb-4">
                            Tre aiutanti affiancano Echomax. Una volta sconfitta, un'anima non torna in battaglia.
                            <strong className="text-amber-200"> Per vincere devi sconfiggere Echomax!</strong>
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                            {activeBosses.map(id=>{
                                const c=CHARACTERS.find(x=>x.id===id);
                                const soul=isEchoFinalSoulId(id);
                                if(!c)return null;
                                const name=soul?'Anima di '+(id==='luffy'?'Luffy':c.name.replace(' Uzumaki','')):'ECHOMAX';
                                return <div key={id} className={`flex flex-col items-center gap-1 rounded-xl border ${soul?'border-fuchsia-500/60 bg-fuchsia-950/45':'border-amber-400/70 bg-amber-950/30'} p-2 text-center`}>
                                    <img src={c.img} alt={name} onError={onMultimonImageError} loading="lazy"
                                        style={soul?{filter:'sepia(.4) hue-rotate(240deg) saturate(2) drop-shadow(0 0 12px #a855f7)'}:undefined}
                                        className="h-20 sm:h-24 w-full object-contain"/>
                                    <strong className="text-xs text-white">{name}</strong>
                                    <small className={soul?'text-fuchsia-200':'text-amber-300'}>{soul?'AIUTANTE · KO DEFINITIVO':'BOSS PRINCIPALE'}</small>
                                </div>;
                            })}
                        </div>
                    </section>}
                    {/* HINT TIPI NEMICI NELLA SELEZIONE */}
                    <div className="mb-6 bg-slate-900/80 px-6 py-2 rounded-full border border-rose-500/30 flex items-center gap-3 backdrop-blur-md shadow-lg">
                        <span className="text-xs text-slate-300 font-bold uppercase tracking-widest">Tipi Nemici:</span>
                        <div className="flex gap-1.5">
                            {(() => {
                                let bossesToEval = activeBosses;
                                if (mission.isAnomaly && mission.id === 'm12_5' && activeBosses.includes('dynamic_anomaly_1')) bossesToEval = ['scheletro'];
                                const allTypes = new Set();
                                bossesToEval.forEach(bId => {
                                    const b = CHARACTERS.find(c=>c.id===bId);
                                    if (b) b.types.forEach(t => allTypes.add(t));
                                });
                                return Array.from(allTypes).map(t => (
                                    <span key={t} className={`text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm uppercase ${TYPE_STYLES[t] || 'bg-gray-500'}`}>{t}</span>
                                ));
                            })()}
                        </div>
                    </div>

                <div className="flex flex-wrap gap-4 mb-4 w-full bg-slate-900/60 p-3 rounded-2xl border border-slate-700/50 backdrop-blur-md items-center">
                    <div className="flex-1 min-w-[150px]">
                        <input 
                            type="text" 
                            placeholder="Cerca campione..." 
                            value={draftSearch} 
                            onChange={e => setDraftSearch(e.target.value)} 
                            className="w-full bg-slate-800 text-white font-bold px-4 py-2 rounded-xl outline-none border border-slate-600 focus:border-cyan-500 placeholder-slate-400 text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Tipo:</span>
                        <select value={draftFilterType} onChange={e => setDraftFilterType(e.target.value)} className="bg-slate-800 text-white font-bold p-2 rounded-lg outline-none border border-slate-600 focus:border-cyan-500 text-xs">
                            <option value="Tutti">Tutti</option>
                            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Ordina:</span>
                        <select value={draftSort} onChange={e => setDraftSort(e.target.value)} className="bg-slate-800 text-white font-bold p-2 rounded-lg outline-none border border-slate-600 focus:border-cyan-500 text-xs">
                            <option value="default">Predefinito</option>
                            <option value="alpha">A-Z</option>
                            <option value="type">Per Tipo</option>
                        </select>
                    </div>
                </div>

                <div className="multimon-roster-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 mb-4 w-full max-h-[60dvh] overflow-y-auto content-start custom-scrollbar p-2 sm:p-3">
                    {(() => {
                        let rosterChars = campaignState.roster.map(id => CHARACTERS.find(c => c.id === id)).filter(Boolean);
                        
                        let filteredRoster = rosterChars.filter(c => {
                            if (draftFilterType !== 'Tutti' && !c.types.includes(draftFilterType)) return false;
                            if (draftSearch.trim() !== '' && !c.name.toLowerCase().includes(draftSearch.toLowerCase())) return false;
                            return true;
                        });

                        if (draftSort === 'alpha') {
                            filteredRoster.sort((a, b) => a.name.localeCompare(b.name));
                        } else if (draftSort === 'type') {
                            filteredRoster.sort((a, b) => a.types[0].localeCompare(b.types[0]));
                        }

                        return filteredRoster.map(char => {
                            const id = char.id;
                            const hp = campaignState.rosterStats[id] || 0;
                            const isDead = hp <= 0;
                            const isSelected = campaignSelectedTeam.includes(id);
                            const isStarting = isEchoFinalRaid && echoStartingSix.includes(id);
                            const isAnomalyTarget = mission.isAnomaly && mission.id === 'm12_5' && campaignState.anomalyTargets && campaignState.anomalyTargets.includes(id);

                            return (
                                <div 
                                    key={id} 
                                    onClick={() => {
                                        if (isDead) {
                                            setSystemAlert("Questo personaggio è esausto! Curarlo all'accampamento prima di poterlo schierare in battaglia.");
                                            return;
                                        }
                                        toggleChar(id);
                                    }}
                                    className={`multimon-roster-card relative min-w-0 overflow-hidden bg-slate-900/80 backdrop-blur-md border rounded-2xl p-3 sm:p-4 text-center transition-all duration-300 ${isDead ? 'opacity-50 grayscale border-rose-900 cursor-not-allowed' : isAnomalyTarget ? 'border-fuchsia-500 opacity-50 cursor-not-allowed' : isEchoFinalRaid ? (isStarting ? 'border-amber-300 bg-amber-900/25 shadow-[0_0_18px_rgba(251,191,36,0.3)] cursor-pointer':'border-slate-600/80 hover:border-cyan-400 cursor-pointer') : isSelected ? 'border-emerald-400 bg-emerald-900/30 ring-2 ring-emerald-400/35 shadow-[0_0_15px_rgba(16,185,129,0.25)]' : 'border-slate-700/50 hover:border-cyan-500/50 hover:-translate-y-1 cursor-pointer shadow-lg'}`}
                                >
                                    <div className={`multimon-roster-portrait w-full h-28 sm:h-32 md:h-36 flex items-center justify-center rounded-xl bg-slate-950/60 border-2 mb-3 p-2 ${isEchoFinalRaid ? (isStarting?'border-amber-300':'border-slate-600') : isSelected ? 'border-emerald-400' : 'border-slate-600/50'}`}>
                                        <img src={char.img} alt={char.name} loading="lazy" className="w-full h-full object-contain drop-shadow-lg" />
                                    </div>
                                    <h4 className="font-bold text-sm sm:text-base mb-2 leading-snug line-clamp-2 min-h-[2.25em] break-words text-slate-100">{char.name}</h4>
                                    <div className="flex flex-wrap gap-1 justify-center mb-3">
                                        {char.types.map(t => (
                                            <span key={t} className={`text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm uppercase ${TYPE_STYLES[t] || 'bg-gray-500'}`}>{t}</span>
                                        ))}
                                    </div>
                                    {renderHealthBar(hp, char.maxHp)}
                                    
                                    {isEchoFinalRaid && <div className={`mt-3 text-[11px] font-black uppercase tracking-wide ${isStarting?'text-amber-300':'text-slate-400'}`}>{isStarting?'In campo':'Riserva'}</div>}
                                    {isStarting && <div className="absolute top-2 right-2 bg-amber-400 text-black rounded-full px-2 py-0.5 font-black text-xs shadow-md">{echoStartingSix.indexOf(id)+1}</div>}
                                    {isSelected && !isEchoFinalRaid && (
                                        <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center font-black text-xs shadow-md">✓</div>
                                    )}
                                    {isAnomalyTarget && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-fuchsia-900/80 backdrop-blur-sm z-10">
                                            <span className="text-white font-black text-[10px] uppercase -rotate-12 border-2 border-white px-2 py-1 bg-black/50 rounded shadow-lg">Infetto</span>
                                        </div>
                                    )}
                                    {isDead && !isAnomalyTarget && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-rose-900/60 backdrop-blur-sm z-10">
                                            <span className="text-white font-black text-[10px] uppercase -rotate-12 border-2 border-white px-2 py-1 bg-black/50 rounded shadow-lg">Esausto</span>
                                        </div>
                                    )}
                                </div>
                            );
                        });
                    })()}
                </div>
                {campaignSelectedTeam.length > 0 && <div className="w-full max-w-6xl bg-gradient-to-b from-slate-900/95 to-indigo-950/80 border border-violet-400/45 rounded-3xl p-4 sm:p-6 mb-6 shadow-[0_0_35px_rgba(139,92,246,0.12)]">
                  <div className="flex items-center gap-3 mb-3">
                    <ItemArtwork id="iperband" size={35}/>
                    <div>
                      <h3 className="font-black text-violet-200 text-lg sm:text-xl">Assegna gli strumenti</h3>
                      <p className="text-xs text-slate-300 mt-1">Ogni Multimon mostra il proprio strumento e una descrizione del suo effetto. Gli oggetti equipaggiati non vengono consumati.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {campaignSelectedTeam.map((id,index) => {
                      const hero=CHARACTERS.find(c=>c.id===id);
                      const team=campaignSelectedTeam.map(heroId=>({heldItem:campaignHeldItems[heroId]||null}));
                      return hero?<HeldEquipmentCard key={id} hero={hero} index={index} team={team}
                        inventory={equipInventory} selectedItem={campaignHeldItems[id]||''}
                        onEquip={itemId=>assignCampaignItem(id,itemId)}/>:null;
                    })}
                  </div>
                  <HeldEquipmentGuide inventory={equipInventory}/>
                </div>}
                {campaignSelectedTeam.includes('lucy')&&<div className="w-full max-w-6xl mb-6">
                  <ZodiacSpiritPicker value={campaignZodiacChoices.lucy} onChange={spiritId=>setCampaignZodiacChoices(prev=>({...prev,lucy:spiritId}))}/>
                </div>}
                <button onClick={handleStartCampaignBattle} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-12 py-5 rounded-full font-black text-2xl shadow-[0_10px_30px_rgba(59,130,246,0.4)] hover:-translate-y-1 transition-all flex items-center gap-3">
                    <Swords size={28}/> Inizia Battaglia!
                </button>
                </div>
            </div>
        );
    }
}
