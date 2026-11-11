import {maybeRogueEvent} from '../../systems/roguelikeEvents.js';
import { partitionCampaignUnlocks } from '../../systems/campaignRoster.js';
import { BattleReportPanel } from '../../components/BattleReportPanel.jsx';
// Schermata estratta senza alterare la struttura JSX originale.
export function renderGameoverView(ctx) {
const { CHARACTERS, ChevronRight, Coins, RotateCcw, Trophy, activeCampaign, activeCampaignId, campaignState, gameState, getDefaultAvatar, leaveRoom, playerName, roguelikeState, setAppMode, setCampaignDialogueIdx, setCampaignSelectedTeam, setCampaignState, setRoguelikeState, setSystemAlert, updateLocalStats } = ctx;
if (gameState.status === 'gameover') {
        if (gameState.isCampaignBattle) {
            const isWin = gameState.winner === gameState.players.p1;
            
            const sector = activeCampaign.sectors[campaignState.sectorIdx] || activeCampaign.sectors[0];
            const mission = sector.missions[campaignState.missionIdx] || sector.missions[0];
            const isScriptedDefeat = !isWin && mission.progressOnDefeat;
            
            const winMessage = activeCampaignId === 'monarch_akuma'
                ? 'Hai purificato l\'Akuma e salvato i tuoi amici dall\'oscurità di Monarch!'
                : (activeCampaignId === 'crisi_varco'
                    ? 'Hai sconfitto i burattini di Cell e spezzato il controllo mentale!'
                    : 'Hai trionfato e superato la sfida!');
            
            return (
                <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                    <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${isWin || isScriptedDefeat ? 'from-emerald-900/40' : 'from-rose-900/40'} via-slate-950 to-black pointer-events-none`}></div>
                    <div className="relative z-10 w-full max-w-6xl bg-slate-900/80 p-5 sm:p-8 rounded-3xl border border-slate-700/50 shadow-2xl backdrop-blur-xl">
                        <h1 className={`text-7xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r ${isWin || isScriptedDefeat ? 'from-emerald-400 to-teal-500' : 'from-rose-500 to-red-600'}`}>{isWin ? 'VITTORIA!' : (isScriptedDefeat ? 'SOPRAFATTI...' : 'SCONFITTA!')}</h1>
                        
                        {isWin || isScriptedDefeat ? (
                            <>
                                <p className="text-xl text-slate-300 mb-4 font-medium">{isWin ? winMessage : 'L\'avversario era troppo potente... ma la storia non finisce qui!'}</p>
                                <p className="text-2xl font-bold text-yellow-400 mb-8 flex items-center justify-center gap-2"><Coins size={28}/> +20 Monete Globali!</p>
                                <BattleReportPanel report={gameState.battleReport} players={gameState.players} />
                                <button onClick={() => {
                                    // Il salvataggio statistico non deve bloccare il percorso narrativo.
                                    const saveGlobalUnlock = characterId => {
                                        try { updateLocalStats({ unlockChar: characterId }); }
                                        catch (error) { console.error('Multimon: impossibile salvare uno sblocco globale', error); }
                                    };
                                    const newRosterStats = { ...campaignState.rosterStats };
                                    const faintedThisBattle = [];
                                    
                                    if (gameState.teams && Array.isArray(gameState.teams.p1)) {
                                    gameState.teams.p1.forEach(c => {
                                        if (c && !c.isSummonOnly) {
                                            if (activeCampaignId === 'torneo_assoluto') {
                                                newRosterStats[c.id] = c.maxHp; // Cura completa per il torneo
                                            } else {
                                                newRosterStats[c.id] = c.hp; // Se sconfitta programmata, i PG restano a 0
                                            }
                                            if (c.hp <= 0) {
                                                faintedThisBattle.push(c.name);
                                            }
                                        }
                                    });
                                }

                                // Cura anche la panchina nel Torneo Assoluto
                                if (activeCampaignId === 'torneo_assoluto') {
                                    campaignState.roster.forEach(id => {
                                        const baseChar = CHARACTERS.find(ch => ch.id === id);
                                        if(baseChar) newRosterStats[id] = baseChar.maxHp;
                                    });
                                }
                                
                                // Missione gia' validata all'inizio della schermata.
                                    const newRoster = [...campaignState.roster];
                                    let unlockedThisTime = [];

                                    const { valid: validUnlocks, unavailable: unavailableUnlocks } =
                                        partitionCampaignUnlocks(mission.unlock, newRoster, CHARACTERS);
                                    if (unavailableUnlocks.length) {
                                        console.warn('Multimon: personaggi senza scheda:', unavailableUnlocks);
                                    }
                                    if (mission.randomUnlockCount) {
                                        const available = validUnlocks;
                                        if (available.length > 0) {
                                            // Sceglie a caso solo 1 personaggio dalla lista (es. o Max o Chloe)
                                            const pickedId = available[Math.floor(Math.random() * available.length)];
                                            newRoster.push(pickedId);
                                            newRosterStats[pickedId] = CHARACTERS.find(c=>c.id===pickedId)?.maxHp ?? 100;
                                            unlockedThisTime.push(pickedId);
                                            saveGlobalUnlock(pickedId);
                                        }
                                    } else if (!mission.choiceUnlock) {
                                        validUnlocks.forEach(id => {
                                            newRoster.push(id);
                                            newRosterStats[id] = CHARACTERS.find(c=>c.id===id).maxHp;
                                            unlockedThisTime.push(id);
                                            saveGlobalUnlock(id);
                                        });
                                    }

                                    // GESTIONE RIMOZIONE PERSONAGGI (Es. Zuko che se ne va)
                                    if (mission.removeChars) {
                                        mission.removeChars.forEach(rId => {
                                            const indexToRemove = newRoster.indexOf(rId);
                                            if (indexToRemove !== -1) {
                                                newRoster.splice(indexToRemove, 1);
                                                delete newRosterStats[rId];
                                            }
                                        });
                                    }

                                    if(activeCampaignId==='eco_anime' && mission.echoFinal){
                                        saveGlobalUnlock('echomax');
                                    }
                                    setCampaignSelectedTeam([]); // FIX: Svuota la squadra per la prossima missione
                                    setCampaignState(prev => ({
                                        ...prev,
                                        rosterStats: newRosterStats,
                                        roster: newRoster,
                                        faintedInLastBattle: faintedThisBattle, 
                                        lastUnlocked: unlockedThisTime,
                                        unavailableRosterIds: [...new Set([
                                            ...(prev.unavailableRosterIds || []), ...unavailableUnlocks
                                        ])],
                                        currentBossState: null, // Pulisce lo stato del boss alla vittoria!
                                        ...(activeCampaignId==='eco_anime'&&mission.echoFinal
                                            ?{echoFinalStage:null,echoCorruptedLockedIds:[]}:{}),
                                    }));
                                    setCampaignDialogueIdx(0);
                                    // Non saltare il post-dialogo del RAID finale (Trigon e Gaster).
                                    // Le quattro battute della missione m38 conducono all'epilogo.
                                    setAppMode('campaign_post_dialogue');
                                }} className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 px-10 py-5 rounded-full font-black text-2xl transition-all shadow-[0_10px_30px_rgba(16,185,129,0.4)] hover:-translate-y-1">Continua e Vedi Epilogo</button>
                            </>
                        ) : (
                            <>
                                {/* --- NUOVI DIALOGHI PERSONALIZZATI PER LA SCONFITTA (GAME OVER) --- */}
                                {(() => {
                                    const defeatQuotes = {
                                        'finn': "Ahi... che botta. Ma gli eroi si rialzano sempre!",
                                        'kratos': "Sconfitti... ma non piegati. Torneremo, e ci prenderemo la nostra vendetta.",
                                        'topolino': "Oh, mamma mia! Ci hanno battuto... ma la magia non si spegne così facilmente!",
                                        'goku': "Urca, sono fortissimi! Dobbiamo allenarci di più e riprovarci!",
                                        'ladybug': "Miraculous o no, oggi abbiamo perso. Ritiriamoci e pensiamo a un nuovo piano.",
                                        'stewie': "Vittoria calcolata male. È palesemente colpa vostra. Ritirata immediata!",
                                        'chatnoir': "Sembra che abbiamo finito le nostre sette vite... per oggi.",
                                        'spongebob': "Sono pronto... a scappare a gambe levate! Torniamo al Checkpoint!",
                                        'marceline': "Odio ammetterlo, ma ci hanno fatto a pezzi. Ripieghiamo.",
                                        'bowser': "BWAHAHAH... ohi ahi... il Re dei Koopa ha solo bisogno di un pisolino strategico!",
                                        'zuko': "La caduta fa parte del viaggio per ritrovare l'onore. Dobbiamo solo rialzarci.",
                                        'wario': "Wah! Abbiamo perso! Spero di non aver smarrito nessuna moneta d'oro cadendo!",
                                        'default': "La tua squadra è caduta... ma la Resistenza si rialzerà più forte!"
                                    };
                                    
                                    // Sceglie a caso un personaggio dal Roster come "Capitano" della schermata di sconfitta
                                    const speakerId = campaignState.roster.length > 0 ? campaignState.roster[Math.floor(Math.random() * campaignState.roster.length)] : 'default';
                                    const char = CHARACTERS.find(c => c.id === speakerId);
                                    const quote = defeatQuotes[speakerId] || defeatQuotes['default'];
                                    
                                    return (
                                        <div className="bg-slate-950/50 p-6 rounded-2xl border border-rose-900/50 mb-8 flex flex-col items-center shadow-lg relative max-w-xl mx-auto">
                                            {char && <img src={char.img} className="w-20 h-20 rounded-full border-2 border-rose-500 mb-4 object-cover grayscale opacity-80" />}
                                            <p className="text-2xl text-rose-200 font-medium italic text-center leading-relaxed">"{quote}"</p>
                                            {char && <span className="text-rose-500 font-black tracking-widest uppercase text-xs mt-3">- {char.name} -</span>}
                                        </div>
                                    );
                                })()}
                                <BattleReportPanel report={gameState.battleReport} players={gameState.players} />

                                <button onClick={() => {
                                    const newRosterStats = { ...campaignState.rosterStats };
                                    const stolenHeroIds=gameState.isEchoFinalBattle
                                        ?(gameState.teams?.p1||[]).filter(c=>c?.echoCorruptedLocked).map(c=>c.id)
                                        :[];
                                    if (gameState.teams && gameState.teams.p1) {
                                        gameState.teams.p1.forEach(c => {
                                            if (!c.isSummonOnly) newRosterStats[c.id] = c.hp;
                                        });
                                    }

                                    let currentEnemyState = null;
                                    if (gameState.teams && gameState.teams.p2) {
                                        const aliveEnemies = gameState.teams.p2.filter(c => c.hp > 0 && !c.isSummonOnly);
                                        if (aliveEnemies.length > 0) {
                                            currentEnemyState = aliveEnemies.map(c => ({
                                                id: c.id,
                                                name: c.name,
                                                imageFilter: c.imageFilter || null,
                                                isEchoPuppet: !!c.isEchoPuppet,
                                                echoCloneLabel: c.echoCloneLabel || null,
                                                isEchoSoulGuardian: !!c.isEchoSoulGuardian,
                                                echoFinalDialogueStages: c.echoFinalDialogueStages || [],
                                                echoFinalForm: c.echoFinalForm || null,
                                                isEchoRaidBoss: !!c.isEchoRaidBoss,
                                                isEchoCorruptedSoul: !!c.isEchoCorruptedSoul,
                                                echoCorruptionSourceId: c.echoCorruptionSourceId || null,
                                                echoCorruptionSourceIndex: c.echoCorruptionSourceIndex ?? null,
                                                echoSoulPermanentDefeat: !!c.echoSoulPermanentDefeat,
                                                hp: c.hp,
                                                maxHp: c.maxHp,
                                                atk: c.atk,
                                                def: c.def,
                                                spd: c.spd,
                                                baseAtk: c.baseAtk,
                                                baseDef: c.baseDef,
                                                baseSpd: c.baseSpd,
                                                acc: c.acc ?? 1,
                                                echoHalfResetDone: !!c.echoHalfResetDone,
                                                // I trigger del raid e delle nuove fasi sopravvivono
                                                // anche a ritirate, rematch e vecchi checkpoint.
                                                echo35SoulRecallDone: !!c.echo35SoulRecallDone,
                                                echoRaidLastPulseTurn: c.echoRaidLastPulseTurn ?? null,
                                                echoNormalSoulsSummoned: !!c.echoNormalSoulsSummoned,
                                                isEchoSoulRecalledProjection: !!c.isEchoSoulRecalledProjection,
                                                statuses: c.statuses,
                                                isJuggernaut: c.isJuggernaut,
                                                juggHitsRemaining: c.juggHitsRemaining,
                                                juggTurnCount: c.juggTurnCount
                                            }));
                                        }
                                    }

                                    // Prevenzione Soft-lock se tutto il Roster è morto o siamo nel Torneo
                                    stolenHeroIds.forEach(id=>{newRosterStats[id]=0;});
                                    const aliveCount = campaignState.roster.filter(id => newRosterStats[id] > 0).length;
                                    if (aliveCount === 0 || activeCampaignId === 'torneo_assoluto') {
                                        campaignState.roster.forEach(id => {
                                            const baseChar = CHARACTERS.find(c=>c.id===id);
                                            if (activeCampaignId === 'torneo_assoluto') {
                                                newRosterStats[id] = baseChar ? baseChar.maxHp : 100;
                                            } else if(!stolenHeroIds.includes(id)) {
                                                newRosterStats[id] = Math.max(1, Math.floor((baseChar ? baseChar.maxHp : 100) * 0.3)); 
                                            }
                                        });
                                    }

                                    setCampaignSelectedTeam([]); // FIX: Svuota la squadra in modo da poterne scegliere una nuova
                                    setCampaignState(p => ({...p, rosterStats: newRosterStats, currentBossState: currentEnemyState,
                                        ...(gameState.isEchoFinalBattle?{
                                            echoFinalStage:gameState.echoFinalStage||'raid',
                                            echoCorruptedLockedIds:stolenHeroIds
                                        }:{})}));
                                    setAppMode('campaign_map');
                                }} className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 px-10 py-5 rounded-full font-black text-2xl transition-all shadow-[0_10px_30px_rgba(225,29,72,0.4)] hover:-translate-y-1">Ritirata Strategica (Riprova)</button>
                            </>
                        )}
                    </div>
                </div>
            );
        }

        // --- GESTIONE VITTORIA/SCONFITTA ROGUELIKE ---
        if (gameState.isRoguelikeBattle) {
            const isWin = gameState.winner === gameState.players.p1;
            const earnedCoins = Math.floor(Math.random() * 21) + 10; // Da 10 a 30 monete
            
            return (
                <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                    <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${isWin ? 'from-fuchsia-900/40' : 'from-rose-900/40'} via-slate-950 to-black pointer-events-none`}></div>
                    <div className="relative z-10 bg-slate-900/80 p-12 rounded-3xl border border-slate-700/50 shadow-2xl backdrop-blur-xl w-full max-w-6xl">
                        <h1 className={`text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r ${isWin ? 'from-fuchsia-400 to-purple-500' : 'from-rose-500 to-red-600'}`}>
                            {isWin ? (roguelikeState.floor === roguelikeState.maxFloor ? 'SPEDIZIONE COMPLETATA!' : 'VITTORIA!') : 'SPEDIZIONE FALLITA'}
                        </h1>
                        
                        <p className="text-xl text-slate-300 mb-6 font-medium">
                            {isWin 
                                ? (roguelikeState.floor === roguelikeState.maxFloor ? 'Hai superato l\'ultimo piano. Sei una leggenda del Multiverso!' : 'I nemici sono stati sconfitti! Ti prepari al prossimo piano.') 
                                : 'Il tuo team è caduto. Dovrai ricominciare la scalata da zero.'}
                        </p>
                        <BattleReportPanel report={gameState.battleReport} players={gameState.players} />
                        {isWin && roguelikeState.floor === roguelikeState.maxFloor && (
                          <div className="mx-auto mb-8 max-w-xl space-y-2 rounded-2xl border border-amber-400/50 bg-amber-950/30 p-5 text-amber-100">
                            <p className="text-xl font-black">🎁 +5 Bauli normali!</p>
                            <p className="text-sm">Li troverai nella sezione Bauli Campagna del menu, con due ricompense ciascuno.</p>
                            <p className="text-sm text-cyan-200">🏆 Bonus finale: 50 Punti Forza, se sono trascorse almeno 4 ore dall'ultimo bonus ricevuto.</p>
                          </div>
                        )}
                        
                        {isWin && roguelikeState.floor !== roguelikeState.maxFloor && (
                             <div className="flex items-center justify-center gap-2 mb-8 text-2xl font-black text-yellow-400 bg-yellow-500/10 py-3 rounded-full border border-yellow-500/30">
                                 <Coins size={28} /> +{earnedCoins} Monete Trovate!
                             </div>
                        )}
                        
                        <button onClick={() => {
                            if (isWin) {
                                // Salva gli HP attuali e l'inventario rimasto
                                const newStats = { ...roguelikeState.rosterStats };
                                gameState.teams.p1.forEach(c => {
                                    if (!c.isSummonOnly) newStats[c.id] = c.hp;
                                });
                                const leftoverInventory = gameState.inventory.p1 || {};
                                // Ricompense con ID run stabile: nessuna duplica
                                // se si ritorna sulla pagina o si clicca due volte.
                                if(roguelikeState.runId && roguelikeState.floor%5===0)
                                    updateLocalStats({roguelikeMilestone:{
                                      runId:roguelikeState.runId,floor:roguelikeState.floor
                                    }});
                                if(roguelikeState.runId && roguelikeState.floor===roguelikeState.maxFloor)
                                    updateLocalStats({roguelikeComplete:{
                                      runId:roguelikeState.runId,floor:roguelikeState.floor,
                                      maxFloor:roguelikeState.maxFloor
                                    }});

                                
                                if (roguelikeState.floor === roguelikeState.maxFloor) {
                                    // Ha finito il gioco
                                    setRoguelikeState({ isStarted: false, roster: [] });
                                    setAppMode('menu');
                                } else {
                                    // --- LOGICA RECLUTAMENTO NEMICO E CHANCE MERCANTE ---
                                    let recruitedId = null;
                                    let currentBonus = roguelikeState.recruitBonus !== undefined ? roguelikeState.recruitBonus : (roguelikeState.floor * 0.02);
                                    let recruitChance = 0.30 + currentBonus;
                                    const chanceMerchant = Math.random() < 0.20; // 20% di apparizione
                                    
                                    // ESTRAZIONE DEL RECLUTAMENTO
                                    if (Math.random() < recruitChance) {
                                        const validEnemies = gameState.teams.p2.filter(c => !c.isSummonOnly && !roguelikeState.roster.includes(c.id));
                                        if (validEnemies.length > 0) {
                                            const recruitedEnemy = validEnemies[Math.floor(Math.random() * validEnemies.length)];
                                            recruitedId = recruitedEnemy.id;
                                        }
                                    }
                                    
                                    // Prossimo piano
                                    setRoguelikeState(p => {
                                        const nextRoster = [...p.roster];
                                        const nextStats = { ...newStats };
                                        let nextBonus = p.recruitBonus !== undefined ? p.recruitBonus : (p.floor * 0.02);
                                        let nextEnemies = p.encounteredEnemies ? [...p.encounteredEnemies] : [];

                                        // Memorizza i nemici sconfitti per non farli riapparire
                                        if (gameState.teams && gameState.teams.p2) {
                                            gameState.teams.p2.forEach(c => {
                                                if (!nextEnemies.includes(c.id)) nextEnemies.push(c.id);
                                            });
                                        }
                                        
                                        if (recruitedId) {
                                            nextRoster.push(recruitedId);
                                            const baseChar = CHARACTERS.find(c => c.id === recruitedId);
                                            if (baseChar) nextStats[recruitedId] = baseChar.maxHp; 
                                            nextBonus = 0; // Reset a 30% (bonus = 0)
                                        } else {
                                            nextBonus += 0.02; // Aumenta di 2% ogni piano superato senza reclutamenti
                                        }
                                        
                                        return { ...p, rosterStats: nextStats, roster: nextRoster, floor: p.floor + 1, coins: (p.coins || 0) + earnedCoins, inventory: leftoverInventory, isMerchantNext: chanceMerchant, recruitBonus: nextBonus, encounteredEnemies: nextEnemies,
                                            pendingEvent: maybeRogueEvent(p.floor + 1, p.maxFloor || 50, p.relics || [], Math.random, false, p.trainingUses || 0), lastEventResult:null };
                                    });
                                    setAppMode('roguelike_map');
                                    
                                    if (recruitedId) {
                                        const charName = CHARACTERS.find(c => c.id === recruitedId).name;
                                        setTimeout(() => setSystemAlert(`🎉 Reclutamento Inaspettato! Colpito dalla tua incredibile forza, ${charName} ha deciso di unirsi al tuo team per il resto della Spedizione con i PS al massimo!`), 300);
                                    }
                                }
                            } else {
                                // Sconfitta = Reset
                                setRoguelikeState({ isStarted: false, roster: [] });
                                setAppMode('menu');
                            }
                        }} className={`px-10 py-5 rounded-full font-black text-2xl transition-all shadow-lg hover:-translate-y-1 ${isWin ? 'bg-gradient-to-r from-fuchsia-500 to-purple-600' : 'bg-gradient-to-r from-rose-600 to-red-600'}`}>
                            {isWin ? (roguelikeState.floor === roguelikeState.maxFloor ? 'Torna al Menu' : 'Prosegui la Scalata') : 'Accetta la Sconfitta'}
                        </button>
                    </div>
                </div>
            );
        }
        // ---------------------------------------------

        let rewardText = "";
        let rankText = "";
        
        if (playerName.trim()) {
            let coins = 0;
            const myKey = Object.keys(gameState.players).find(k => gameState.players[k] === playerName);
            
            if (myKey) {
                if (gameState.gameMode === 'torneo') {
                    const tr = gameState.tournamentResults;
                    if (tr.final && tr.final.winner === myKey) { coins = 200; rankText = "1° Posto nel Torneo!"; }
                    else if (tr.final && tr.final.loser === myKey) { coins = 100; rankText = "2° Posto nel Torneo!"; }
                    else if (tr.bronze && tr.bronze.winner === myKey) { coins = 70; rankText = "3° Posto nel Torneo!"; }
                    else if (tr.bronze && tr.bronze.loser === myKey) { coins = 50; rankText = "4° Posto nel Torneo!"; }
                    else { coins = 50; }
                } else if (gameState.gameMode === 'survival') {
                    // --- PREMI SPECIFICI SOPRAVVIVENZA ---
                    const roundsSurvived = (gameState.survivalRound || 1) - 1;
                    rankText = `Sei sopravvissuto a ${roundsSurvived} Round!`;
                    let calculatedCoins = 0;
                    for (let i = 1; i <= roundsSurvived; i++) {
                        calculatedCoins += Math.min(10, i + 2);
                    }
                    coins = calculatedCoins;
                    if (roundsSurvived > 0) rewardText = `+${coins} Monete ricevute!`;
                } else if (gameState.gameMode === 'juggernaut') {
                    // --- PREMI SPECIFICI JUGGERNAUT (Allineati col salvataggio) ---
                    const juggPlayer = gameState.settings.juggernautPlayer || 'p1';
                    const amIJuggernaut = myKey === juggPlayer;
                    const juggWon = gameState.winner === gameState.players[juggPlayer];

                    if (gameState.winner === 'Pareggio') {
                        coins = 50;
                    } else if (juggWon) {
                        if (amIJuggernaut) coins = 150;
                        else coins = 50; 
                    } else {
                        if (amIJuggernaut) coins = 50; 
                        else coins = 110; 
                    }
                } else {
                    let won = false;
                    if (gameState.gameMode === 'multipla') {
                         if (gameState.winner && gameState.winner.includes(playerName)) won = true;
                    } else if (gameState.winner === playerName) {
                         won = true;
                    }
                    coins = won ? 100 : 50;
                    if (gameState.winner === 'Pareggio') coins = 50;
                }

                // CALCOLO BONUS TEAM SIZE
                const teamSizeBonus = Math.max(0, (gameState.settings.teamSize - 4) * 5);
                if (coins > 0) {
                    if (gameState.gameMode !== 'survival') {
                        coins += teamSizeBonus;
                        if (teamSizeBonus > 0) {
                            rewardText = `+${coins} Monete ricevute! (+${teamSizeBonus} Bonus Squadra)`;
                        } else {
                            rewardText = `+${coins} Monete ricevute!`;
                        }
                    } else {
                        rewardText = `+${coins} Monete ricevute!`;
                    }
                }
            }
        }

        // --- NUOVO: RENDERER TABELLONE E CLASSIFICA TORNEO ---
        const renderTournamentUI = () => {
            if (gameState.gameMode === 'torneo') {
                const b = gameState.tournamentBracket || ['p1', 'p2', 'p3', 'p4'];
                const res = gameState.tournamentResults || {};

                const MatchBox = ({ p1, p2, winner, title, isFinal }) => (
                    <div className={`bg-slate-900/90 border ${isFinal ? 'border-yellow-500 shadow-[0_0_20px_rgba(250,204,21,0.3)]' : 'border-slate-600 shadow-lg'} rounded-xl p-3 w-48 md:w-56 flex flex-col gap-2 relative z-10 backdrop-blur-sm`}>
                        <div className={`text-[10px] ${isFinal ? 'text-yellow-400' : 'text-cyan-400'} font-black uppercase tracking-widest text-center`}>{title}</div>
                        
                        <div className={`flex items-center gap-3 p-1.5 rounded-lg transition-all ${winner === p1 ? 'bg-emerald-900/60 border border-emerald-500/50' : (winner ? 'opacity-40 grayscale border border-transparent' : 'bg-slate-800 border border-slate-700')}`}>
                            <img src={p1 !== '???' ? (gameState.playerAvatars[p1] || getDefaultAvatar(gameState.players[p1])) : getDefaultAvatar('?')} className="w-8 h-8 rounded-full object-cover bg-slate-950" />
                            <span className="text-xs font-bold truncate text-white">{p1 !== '???' ? gameState.players[p1] : '???'}</span>
                            {winner === p1 && <ChevronRight size={16} className="text-emerald-400 ml-auto" />}
                        </div>
                        
                        <div className="text-center text-[10px] text-slate-500 font-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-700 z-20">VS</div>
                        
                        <div className={`flex items-center gap-3 p-1.5 rounded-lg transition-all ${winner === p2 ? 'bg-emerald-900/60 border border-emerald-500/50' : (winner ? 'opacity-40 grayscale border border-transparent' : 'bg-slate-800 border border-slate-700')}`}>
                            <img src={p2 !== '???' ? (gameState.playerAvatars[p2] || getDefaultAvatar(gameState.players[p2])) : getDefaultAvatar('?')} className="w-8 h-8 rounded-full object-cover bg-slate-950" />
                            <span className="text-xs font-bold truncate text-white">{p2 !== '???' ? gameState.players[p2] : '???'}</span>
                            {winner === p2 && <ChevronRight size={16} className="text-emerald-400 ml-auto" />}
                        </div>
                    </div>
                );

                const s1p1 = b[0], s1p2 = b[1], s2p1 = b[2], s2p2 = b[3];
                const s1w = res.semi1?.winner, s2w = res.semi2?.winner;
                const fw = res.final?.winner;
                const bw = res.bronze?.winner;

                return (
                    <div className="flex flex-col items-center w-full max-w-5xl mx-auto my-8 overflow-x-auto pb-4 custom-scrollbar">
                        <div className="flex items-center justify-center gap-8 md:gap-16 relative min-w-[600px] md:min-w-[800px]">
                            {/* Semifinali */}
                            <div className="flex flex-col gap-12 md:gap-16">
                                <MatchBox p1={s1p1} p2={s1p2} winner={s1w} title="Semifinale 1" />
                                <MatchBox p1={s2p1} p2={s2p2} winner={s2w} title="Semifinale 2" />
                            </div>

                            {/* Linee di connessione disegnate con i bordi (visibili solo su schermi medi/grandi) */}
                            <div className="hidden md:block absolute left-[14rem] top-0 bottom-0 w-8 border-y-2 border-r-2 border-slate-600/50 my-[5.5rem] rounded-r-xl z-0"></div>
                            <div className="hidden md:block absolute left-[16rem] top-1/2 w-8 border-t-2 border-slate-600/50 z-0"></div>

                            {/* Finale */}
                            <div className="flex flex-col justify-center">
                                <MatchBox p1={s1w || '???'} p2={s2w || '???'} winner={fw} title="Finalissima" isFinal={true} />
                            </div>

                            {/* Campione Assoluto */}
                            <div className="hidden md:flex flex-col items-center gap-3 ml-4">
                                <Trophy size={64} className={`transition-all duration-700 ${fw ? 'text-yellow-400 animate-bounce drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]' : 'text-slate-800'}`} />
                                {fw ? (
                                    <div className="bg-gradient-to-r from-yellow-600 to-orange-600 border-2 border-yellow-400 text-white font-black px-6 py-2 rounded-xl shadow-[0_0_30px_rgba(250,204,21,0.5)] animate-fade-in text-lg uppercase tracking-wider">
                                        {gameState.players[fw]}
                                    </div>
                                ) : (
                                    <div className="text-slate-600 font-bold uppercase tracking-widest text-xs">In attesa...</div>
                                )}
                            </div>
                        </div>

                        {/* Finale 3° Posto */}
                        {(res.semi1 && res.semi2) && (
                            <div className="mt-8 pt-8 border-t border-slate-800 w-full flex flex-col items-center animate-fade-in">
                                <MatchBox p1={res.semi1.loser} p2={res.semi2.loser} winner={bw} title="Finale 3° Posto (Bronzo)" />
                            </div>
                        )}
                    </div>
                );
            } else if (gameState.gameMode === 'torneo_punti') {
                const sortedScores = Object.entries(gameState.playerScores)
                    .filter(([p, score]) => gameState.players[p])
                    .sort((a, b) => b[1] - a[1]);
                
                return (
                    <div className="bg-slate-900/90 border border-cyan-500/50 rounded-3xl p-6 md:p-8 shadow-[0_0_40px_rgba(6,182,212,0.2)] w-full max-w-lg mx-auto my-8 backdrop-blur-md">
                        <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-6 uppercase tracking-widest text-center">Classifica Attuale</h3>
                        <div className="space-y-3">
                            {sortedScores.map(([p, score], idx) => {
                                const isFirst = idx === 0 && score > 0;
                                return (
                                    <div key={p} className={`flex items-center justify-between p-3 md:p-4 rounded-xl border transition-all ${isFirst ? 'bg-yellow-900/20 border-yellow-500/50 shadow-[0_0_15px_rgba(250,204,21,0.2)] scale-[1.02]' : 'bg-slate-800/80 border-slate-700'}`}>
                                        <div className="flex items-center gap-3 md:gap-4">
                                            <span className={`font-black text-xl md:text-2xl w-6 md:w-8 text-center ${idx===0 ? 'text-yellow-400 drop-shadow-md' : idx===1 ? 'text-slate-300' : idx===2 ? 'text-amber-600' : 'text-slate-600'}`}>{idx+1}°</span>
                                            <img src={gameState.playerAvatars[p] || getDefaultAvatar(gameState.players[p])} className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 ${isFirst ? 'border-yellow-400' : 'border-slate-600'} object-cover bg-slate-950`} />
                                            <span className={`font-bold text-base md:text-lg ${isFirst ? 'text-yellow-100' : 'text-white'}`}>{gameState.players[p]}</span>
                                        </div>
                                        <span className={`font-black text-2xl md:text-3xl ${isFirst ? 'text-yellow-400' : 'text-cyan-400'}`}>{score}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-4 text-center text-xs text-slate-500 font-bold uppercase tracking-widest">
                            Incontro {Math.min(gameState.currentMatchIdx + 1, gameState.roundRobinMatches.length)} di {gameState.roundRobinMatches.length}
                        </div>
                    </div>
                );
            }
            return null;
        };

        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 text-center overflow-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-black pointer-events-none"></div>
                <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
                    <h1 className="text-6xl md:text-7xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-lg tracking-tighter">FINE PARTITA</h1>
                    <h2 className="text-3xl md:text-4xl mb-4 font-bold text-white drop-shadow-md">{gameState.winner === 'Pareggio' ? 'Pareggio Totale!' : `VITTORIA PER ${(gameState.winner || '').toUpperCase()}!`}</h2>
                    
                    {/* INIEZIONE TABELLONE NEL GAMEOVER */}
                    {renderTournamentUI()}
                    <BattleReportPanel report={gameState.battleReport} players={gameState.players} />

                    {rankText && <h3 className="text-2xl font-bold text-emerald-400 mb-4 drop-shadow-sm">{rankText}</h3>}
                    {rewardText && <p className="text-xl font-black text-yellow-400 mb-10 flex items-center justify-center gap-2 bg-yellow-500/10 px-6 py-3 rounded-full border border-yellow-500/30 backdrop-blur-sm"><Coins size={28}/> {rewardText}</p>}
                    
                    <button onClick={leaveRoom} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-10 py-5 rounded-full font-black text-xl flex items-center gap-3 shadow-[0_10px_30px_rgba(59,130,246,0.4)] transition-all hover:-translate-y-1">
                        <RotateCcw size={24} /> Torna al Menu Principale
                    </button>
                </div>
            </div>
        );
    }
}
