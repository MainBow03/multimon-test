import { masteryVisibleLevels } from './masterySystem.js';
// Moduli dei sistemi di Multimon: funzioni originali con contesto esplicito.
export const handleCreateRoguelikeCoopImpl = async (ctx) => {
const { appId, db, doc, getPlayerData, initialGameState, playerAvatarUrl, playerName, playerTitle, setAppMode, setCoopRoomId, setDoc, setPlayerRole, setRoomId, setSystemAlert, user } = ctx;

            if (!playerName.trim()) return setSystemAlert("Inserisci il tuo nome!");
            if (!user) return setSystemAlert("Connessione ai server in corso, riprova tra un istante.");
            const newRoomId = Math.random().toString(36).substring(2, 7).toUpperCase();
            const state = initialGameState();
            state.players.p1 = playerName;
            state.playerUids.p1 = user.uid;
            state.hostHeartbeatAt = Date.now();
            state.phaseStartedAt = Date.now();
            state.playerAvatars.p1 = playerAvatarUrl;
            state.playerTitles.p1 = playerTitle || '';
            state.playerMastery.p1 = masteryVisibleLevels(getPlayerData());
            state.inventory.p1 = { pozione: 2, resurrezione: 1 };
            state.isRoguelikeCoop = true;
            state.coopRun = {floor:1,maxFloor:50,coins:0,lastCoins:0,recruitBonus:0,encounteredEnemies:[],lastRecruit:null,finished:false};
            state.gameMode = 'juggernaut'; // Il Juggernaut sarà il boss controllato dal Bot!
            state.settings = {
                ...state.settings,
                teamSize: 1,
                maxPlayers: 4,
                fieldSize: 1,
                juggernautPlayer: 'p4',
                draftBattle: true
            };
            state.players.p4 = "Guardiano del Piano";
            state.playerAvatars.p4 = 'https://api.dicebear.com/7.x/bottts/svg?seed=Skull&backgroundColor=020617';
            state.isBot.p4 = true;
            state.inventory.p4 = {};
            state.isCampaignBattle=false;
            // La CPU non è un quarto partecipante: lo slot p4 è solo l’avversario comune.

            const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', newRoomId);
            try{await setDoc(roomRef, state)}catch(error){
              setSystemAlert('Non riesco a creare la Roguelike Co-op: '+(error.message||error));return;
            }

            setRoomId(newRoomId);
            setPlayerRole('p1');
            setCoopRoomId(newRoomId);
            setAppMode('roguelike_coop_lobby');
          
};

export const handleSurvivalStartImpl = (ctx) => {
const { getPlayerData, initialGameState, playerAvatarUrl, playerName, playerTitle, setAppMode, setGameState, setPlayerRole } = ctx;

            const state = initialGameState();
            state.gameMode = 'survival';
            state.settings = { teamSize: 4, fieldSize: 1, maxPlayers: 2, juggernautPlayer: 'p2', soundtrack: 'wpEBouFcwqI', rentalMode: false, fusionMode: false, draftBattle: false, sharedDraft: false }; 
            state.players.p1 = playerName || "Sopravvissuto";
            state.playerAvatars.p1 = playerAvatarUrl;
            state.playerTitles.p1 = playerTitle || '';
            state.playerMastery.p1 = masteryVisibleLevels(getPlayerData());
            state.inventory.p1 = getPlayerData().inventory;
            state.players.p2 = "Orda Infinita";
            state.playerAvatars.p2 = 'https://api.dicebear.com/7.x/bottts/svg?seed=Skull&backgroundColor=020617';
            state.isBot.p2 = true;
            state.inventory.p2 = {}; // Niente cure per l'IA in survival
            setGameState(state);
            setPlayerRole('p1');
            setAppMode('local_room');
          
};
