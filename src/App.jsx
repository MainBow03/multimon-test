import { renderMenuView } from './screens/hub/MenuView.jsx';
import {FirstVisitModeGuide} from './components/FirstVisitModeGuide.jsx';
import { MultiverseEventHub } from './screens/events/MultiverseEventHub.jsx';
import { AccountGate } from './components/AccountGate.jsx';
import { AppErrorBoundary } from './components/AppErrorBoundary.jsx';
import { UpdateHistoryPanel } from './components/UpdateHistoryPanel.jsx';
import { renderCampaignSelectView } from './screens/campaign/CampaignSelectView.jsx';
import { renderCampaignIntroView } from './screens/campaign/CampaignIntroView.jsx';
import { renderCampaignSelectProtagonistView } from './screens/campaign/CampaignSelectProtagonistView.jsx';
import { renderCampaignMapView } from './screens/campaign/CampaignMapView.jsx';
import { renderCampaignDialogueView } from './screens/campaign/CampaignDialogueView.jsx';
import { renderCampaignPostDialogueView } from './screens/campaign/CampaignPostDialogueView.jsx';
import { renderEchoChestView } from './screens/campaign/EchoChestView.jsx';
import { renderCampaignChoiceView } from './screens/campaign/CampaignChoiceView.jsx';
import { renderCampaignResolutionDialogueView } from './screens/campaign/CampaignResolutionDialogueView.jsx';
import { renderCampaignTeamSelectView } from './screens/campaign/CampaignTeamSelectView.jsx';
import { renderCampaignShopView } from './screens/campaign/CampaignShopView.jsx';
import { renderCampaignEndingView } from './screens/campaign/CampaignEndingView.jsx';
import { renderRoguelikeDraftView } from './screens/roguelike/RoguelikeDraftView.jsx';
import { renderRoguelikeMapView } from './screens/roguelike/RoguelikeMapView.jsx';
import { renderRoguelikeCoopLobbyView } from './screens/roguelike/RoguelikeCoopLobbyView.jsx';
import { RoguelikeCoopCampView } from './screens/roguelike/RoguelikeCoopCampView.jsx';
import {COOP_STARTERS_PER_PLAYER,prepareCoopDraft,isCoopDraftReady,finishCoopFloor,nextCoopFloor,coopCampPurchase,voteCoopEvent,finalizeCoopEvent} from './systems/coopExpedition.js';
import {reorderCoopTeam,requestCoopTrade,respondCoopTrade,cancelCoopTrade} from './systems/coopTeamTrades.js';
import {canSubmitCoopAction,canCommitCoopTurn,coopValidatedActionDelta} from './systems/coopTurnGuards.js';
import { renderShopView } from './screens/hub/ShopView.jsx';
import { StrengthLabView } from './screens/hub/StrengthLabView.jsx';
import { migrateCampaignChests } from './systems/campaignChests.js';
import { CampaignChestsView } from './screens/hub/CampaignChestsView.jsx';
import { PowerChestsView } from './screens/hub/PowerChestsView.jsx';
import { renderStatsView } from './screens/hub/StatsView.jsx';
import { renderTypeChartView } from './screens/hub/TypeChartView.jsx';
import { renderCatalogView } from './screens/hub/CatalogView.jsx';
import { renderLobbyView } from './screens/battle/LobbyView.jsx';
import { renderDraftingView } from './screens/battle/DraftingView.jsx';
import { renderSwitchingPhaseView } from './screens/battle/SwitchingPhaseView.jsx';
import { renderBattlingView } from './screens/battle/BattlingView.jsx';
import { renderGameoverView } from './screens/battle/GameoverView.jsx';
import { renderIntermissionView } from './screens/battle/IntermissionView.jsx';
import { renderPreBattleView } from './screens/battle/PreBattleView.jsx';
import { handleForceSkipImpl, handleObserveImpl, applyOnEnterPassiveImpl, startBattleImpl, generateCPUActionsForPlayerImpl, commitActionImpl, handleSelectMoveTargetImpl, checkTurnReadyImpl, calculateDamageImpl, calculateTurnImpl, playEventsAnimationImpl } from './systems/battleSystem.js';
import { loadCampaignImpl, advanceCampaignImpl } from './systems/campaignFlow.js';
import { reconcileCampaignRoster } from './systems/campaignRoster.js';
import { nextCampaignCommandIndex, shouldRecoverCampaignCommand } from './systems/campaignBattleRecovery.js';
import { handleAvatarUploadImpl, leaveRoomImpl, handleConfirmLeaveImpl, updateStateImpl, getRequiredPlayersImpl, getActivePlayersImpl, isAllPlayersJoinedImpl, handleCreateRoomImpl, handleJoinRoomImpl, commitReplacementChoiceImpl, handleAddBotImpl, handleRemovePlayerImpl, handleLocalStartImpl, handleVsCpuStartImpl, handlePickImpl, handleDraftRerollImpl, handleSharedPickImpl } from './systems/multiplayerSystem.js';
import { updateLocalStatsImpl } from './systems/profileSystem.js';
import { equippedMasteryTitle, masteryVisibleLevels } from './systems/masterySystem.js';
import { renderHealthBarImpl } from './components/uiHelpers.jsx';
import { handleCreateRoguelikeCoopImpl, handleSurvivalStartImpl } from './systems/roguelikeSystem.js';
import { getTournamentMatchOpponentsImpl, handleNextTournamentMatchImpl } from './systems/tournamentSystem.js';
import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { SOUNDTRACKS, TYPES, ITEMS_DB, MOVES_DB, CHARACTERS, CHAR_PRICES, FUSION_CHARACTERS, CAMPAIGNS } from './data/gameData.js';
import { auth, db, appId, IS_PREVIEW } from './firebase/config.js';
import { getCampaignStoryCharacters } from './systems/campaignSystem.js';
import { TYPE_STYLES, TYPE_CHART, PLAYER_THEMES, getMultiplier, getDefaultAvatar } from './systems/typeSystem.js';
import { initialGameState } from './systems/gameState.js';
import { UltimonView } from './screens/battle/UltimonView.jsx';
import {ultimonLeaderboard} from './systems/ultimonSystem.js';
import {ULTIMON_STAGES,createUltimonShowcase,identityPatch,nextUltimonPair,
  revealUltimonFormat,pickPatch,startUltimonDuel,finishUltimonDuel,finishUltimonElimination,
  ultimonIsFinalShowdown} from './systems/ultimonSystem.js';

        import { onAuthStateChanged } from 'firebase/auth';
        import { doc, setDoc, onSnapshot, getDoc, updateDoc, collection, runTransaction } from 'firebase/firestore';
import { visibleOnlinePlayers } from './systems/onlinePresence.js';
import { ROOM_SESSION_KEY, roomRoleForUid, canRecoverRoom, phaseIsStale, isHostFresh,
  prepareEmergencySwitch, getRequiredSwitches, resolveSwitchingRoom, nextPhaseAfterExecution } from './systems/roomRecovery.js';

        const { useState, useEffect, useCallback, useRef } = React;

        // --- ICONE SVG PERSONALIZZATE ---
        const Heart = ({size=24, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>;
        const Swords = ({size=24, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"></path><path d="M13 19l6-6"></path><path d="M16 16l4 4"></path><path d="M19 21l2-2"></path><path d="M14.5 6.5L18 3h3v3l-3.5 3.5"></path><path d="M19 13l-6-6"></path><path d="M16 8l-4-4"></path><path d="M9 5l-2-2"></path><path d="M4.5 17.5L8 21h-3v-3l-3.5-3.5"></path><path d="M5 13l6 6"></path><path d="M8 16l4 4"></path></svg>;
        const Shield = ({size=24, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
        const RotateCcw = ({size=24, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>;
        const Users = ({size=24, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
        const Target = ({size=24, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>;
        const ScrollText = ({size=24, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h12a2 2 0 0 0 2-2v-14a2 2 0 0 0-2-2h-12a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z"></path><path d="M8 7h12"></path><path d="M8 11h12"></path><path d="M8 15h8"></path><path d="M4 17v2a2 2 0 0 0 2 2h2"></path><path d="M4 13v-8a2 2 0 0 1 2-2h2"></path></svg>;
        const Loader2 = ({size=24, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>;
        const Wifi = ({size=24, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>;
        const Trophy = ({size=24, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path></svg>;
        const BookOpen = ({size=24, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;
        const ArrowLeft = ({size=24, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
        const ChevronRight = ({size=24, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
        const ImageIcon = ({size=24, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>;
        const GridIcon = ({size=24, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>;
        const BarChart = ({size=24, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>;
        const ShoppingCart = ({size=24, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>;
        const Coins = ({size=24, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="7"></circle><path d="M8.2 5.3C7.6 5.1 7.1 5.3 6.8 5.6C6.5 6 6.5 6.4 6.8 6.8C7.1 7.1 7.7 7.3 8 7.6C8.3 7.9 8.3 8.4 8 8.7C7.7 9 7.2 9.2 6.6 9"></path><line x1="8" y1="4" x2="8" y2="12"></line><path d="M16 16m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"></path><path d="M16.2 13.3C15.6 13.1 15.1 13.3 14.8 13.6C14.5 14 14.5 14.4 14.8 14.8C15.1 15.1 15.7 15.3 16 15.6C16.3 15.9 16.3 16.4 16 16.7C15.7 17 15.2 17.2 14.6 17"></path><line x1="16" y1="12" x2="16" y2="20"></line></svg>;
        const Lock = ({size=24, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
        const Unlock = ({size=24, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>;
        const LogOut = ({size=24, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
        const Eye = ({size=24, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
        const XIcon = ({size=24, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
        const Upload = ({size=24, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>;
        const Volume2 = ({size=24, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>;
        const VolumeX = ({size=24, className=""}) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>;

        // --- MIGRAZIONE SALVATAGGI ---
        const migrateSaves = () => {
            try {
                const oldSave = localStorage.getItem('multiverse_rpg_campaign_save');
                if (oldSave) {
                    localStorage.setItem('multiverse_rpg_campaign_save_crisi_varco', oldSave);
                    localStorage.removeItem('multiverse_rpg_campaign_save');
                }
            } catch(e) {}
        };
        migrateSaves();

        const getSavedSession = () => {
            try {
                const s = localStorage.getItem('multiverse_rpg_session');
                if (s) return JSON.parse(s);
            } catch(e){}
            return null;
        };

        function App() {
          const [user, setUser] = useState(null);
          const [playerName, setPlayerName] = useState(() => localStorage.getItem('multiverse_rpg_saved_name') || '');
          const [playerAvatarUrl, setPlayerAvatarUrl] = useState(() => localStorage.getItem('multiverse_rpg_saved_avatar') || ''); 
          const [roomIdInput, setRoomIdInput] = useState('');
          const [profileRevision, setProfileRevision] = useState(0);
          const [pendingModeGuide,setPendingModeGuide] = useState(null);
          const [masterySearch, setMasterySearch] = useState('');
          const [masteryFilter, setMasteryFilter] = useState('all');
          const [coopRoomId, setCoopRoomId] = useState(null);

          const sessionRef = useRef(getSavedSession());
          
          const [appMode, setAppMode] = useState(sessionRef.current?.appMode || 'menu');
          const [roomId, setRoomId] = useState(sessionRef.current?.roomId || null);
          const [playerRole, setPlayerRole] = useState(sessionRef.current?.playerRole || null); 
          const [gameState, setGameState] = useState(sessionRef.current?.gameState || initialGameState());
          
          const [displayTeams, setDisplayTeams] = useState({ p1: [], p2: [], p3: [], p4: [], p5: [], p6: [], p7: [], p8: [] }); 
          const [displayField, setDisplayField] = useState({ p1: [], p2: [], p3: [], p4: [], p5: [], p6: [], p7: [], p8: [] });
          const [isPlayingEvents, setIsPlayingEvents] = useState(false);
          const [eventPlaybackText, setEventPlaybackText] = useState('');
          const [eventPlaybackPassive, setEventPlaybackPassive] = useState(null);

          const [commandingIdx, setCommandingIdx] = useState(-1);
          // Blocco immediato del proprio comando finché Firestore conferma la mossa.
          const [coopPendingAction,setCoopPendingAction] = useState(null);
          const [targetingMoveIdx, setTargetingMoveIdx] = useState(null);
          const [selectedMultiTargets, setSelectedMultiTargets] = useState([]);
          
          const [catalogSort, setCatalogSort] = useState('alpha');
          const [catalogFilter, setCatalogFilter] = useState('Tutti');
          const [catalogSearch, setCatalogSearch] = useState('');
          const [shopCharSearch, setShopCharSearch] = useState('');

          const [draftSearch, setDraftSearch] = useState('');
          const [draftFilterType, setDraftFilterType] = useState('Tutti');
          const [draftSort, setDraftSort] = useState('default');
          const [draftRole, setDraftRole] = useState('all');
          const [draftPrice, setDraftPrice] = useState('all');
          const [draftFavoritesOnly, setDraftFavoritesOnly] = useState(false);
          const [draftFavorites, setDraftFavorites] = useState(() => {
            try {
              const stored=JSON.parse(localStorage.getItem('multimon_team_favorites_v1')||'[]');
              return Array.isArray(stored)?stored.filter(id=>typeof id==='string'):[];
            }catch{return [];}
          });
          const toggleDraftFavorite = id => {
            setDraftFavorites(old => {
              const next=old.includes(id)?old.filter(x=>x!==id):[...old,id];
              try{localStorage.setItem('multimon_team_favorites_v1',JSON.stringify(next));}catch{}
              return next;
            });
          };

          const [resolutionDialogues, setResolutionDialogues] = useState([]);
          const [resolutionDialogueIdx, setResolutionDialogueIdx] = useState(0);

          const [introCharIdx, setIntroCharIdx] = useState(0);
          
          const [pendingHyper, setPendingHyper] = useState(false); // <--- AGGIUNTO PER FORMA IPER
          const [screenFlash, setScreenFlash] = useState(false); // <--- AGGIUNTO PER EFFETTO FLASH BIANCO

          const [teamSelectionDialogue, setTeamSelectionDialogue] = useState(null);
          const selectionDialogueTimerRef = useRef(null);

          // Variabile Timer Draft Battle
          const [draftTimeLeft, setDraftTimeLeft] = useState(30);

          // Variabili Registro Battaglia
          const [combatLog, setCombatLog] = useState([]);
          const [isLogOpen, setIsLogOpen] = useState(false);
          const logEndRef = useRef(null);
          
          // Variabili Timer Battaglia
          const [timeLeft, setTimeLeft] = useState(90);
          const battleTimerRef = useRef(null);

          // Variabili di stato e reference mancanti
          const [systemAlert, setSystemAlert] = useState(null);
          const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
          const [passiveInfoPopup, setPassiveInfoPopup] = useState(null);
          const [shopTab, setShopTab] = useState('items');
          const [draftHoverInfo, setDraftHoverInfo] = useState(null);
          const [actionMenuMode, setActionMenuMode] = useState('moves');
          const [hoveredMove, setHoveredMove] = useState(null);
          const [hasRewarded, setHasRewarded] = useState(false);
          
          const [showOnlinePlayers, setShowOnlinePlayers] = useState(false);
          const [onlineUsers, setOnlineUsers] = useState([]);
          const [onlineUsersError, setOnlineUsersError] = useState('');
          const [checkingOnlineUsers, setCheckingOnlineUsers] = useState(false);
          const onlinePresenceRowsRef = useRef([]);
          const [sessionId] = useState(() => Math.random().toString(36).substring(2, 15));

          const matchStartTimeRef = useRef(null);
          const draftLongPressRef = useRef(false);
          const draftPressTimerRef = useRef(null);
          const isLongPressRef = useRef(false);
          const pressTimerRef = useRef(null);
          const isCalculatingRef = useRef(false);
          const recoveryBusyRef = useRef(false);
          const recoveryObservedRef = useRef({room:null,status:null,at:Date.now()});
          const playbackKeyRef = useRef(null);
          
          // NUOVO: Ref per bloccare i doppi click veloci e fix timer
          const isSubmittingActionRef = useRef(false);
          const currentDraftTurnRef = useRef(0);
          
          // --- YOUTUBE BGM PLAYER ---
          const [isMuted, setIsMuted] = useState(false);
          const [bgmVolume, setBgmVolume] = useState(40); // Stato per controllare il volume
          const ytRef = useRef(null);
          // La musica si attiva solo durante le fasi di lotta
          const shouldPlayMusic = ['pre_battle', 'battling', 'executing', 'switching_phase', 'intermission'].includes(gameState.status);
          // Il tema speciale della finalissima usa una traccia GIA' disponibile
          // nella colonna sonora; mute e volume continuano a funzionare.
          const ultimonFinalTheme=gameState.gameMode==='ultimon' && ultimonIsFinalShowdown(gameState);
          const activeBgmId=ultimonFinalTheme?'bUG_NS0xqSY':
            (gameState.settings?.soundtrack||'wpEBouFcwqI');

          useEffect(() => {
              if (ytRef.current && ytRef.current.contentWindow) {
                  if (shouldPlayMusic) {
                      ytRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo' }), '*');
                      ytRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'setVolume', args: [bgmVolume] }), '*');
                      if (isMuted) {
                          ytRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'mute' }), '*');
                      } else {
                          ytRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'unMute' }), '*');
                      }
                  } else {
                      ytRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo' }), '*');
                  }
              }
          }, [shouldPlayMusic, isMuted, bgmVolume, gameState.status]);
          
          // Auto-scroll per il registro battaglia
          useEffect(() => {
              if (isLogOpen && logEndRef.current) {
                  logEndRef.current.scrollIntoView({ behavior: 'smooth' });
              }
          }, [combatLog, isLogOpen]);

          // --- LOGICA TIMER SINCRONIZZATO DURANTE LA BATTAGLIA ---
          useEffect(() => {
              if (gameState.status === 'battling' && !isPlayingEvents && appMode !== 'menu') {
                  const updateTimer = () => {
                      if (gameState.turnExpiresAt) {
                          const remaining = Math.max(0, Math.ceil((gameState.turnExpiresAt - Date.now()) / 1000));
                          setTimeLeft(remaining);
                      } else {
                          setTimeLeft(90); // Fallback di sicurezza
                      }
                  };
                  
                  updateTimer(); // Chiama subito per evitare lag
                  battleTimerRef.current = setInterval(updateTimer, 1000);
              } else {
                  if (battleTimerRef.current) clearInterval(battleTimerRef.current);
              }

              return () => {
                  if (battleTimerRef.current) clearInterval(battleTimerRef.current);
              };
          }, [gameState.status, isPlayingEvents, appMode, gameState.turnExpiresAt]);

          // Le battaglie online devono essere avanzate da un solo dispositivo:
          // il guest può prendere il turno solo se l'host non aggiorna più
          // la propria presenza. Una transazione impedisce il doppio skip.
          const claimOfflineHostTurn = async ()=>{
            if(appMode!=='online_room'||!roomId||!user?.uid||
               !canRecoverRoom(gameState,playerRole))return false;
            const ref=doc(db,'artifacts',appId,'public','data','rooms',roomId);
            return runTransaction(db,async tx=>{
              const snap=await tx.get(ref);
              if(!snap.exists())return false;
              const data=snap.data(),now=Date.now();
              if(data.status!=='battling'||isHostFresh(data,now))return false;
              if(data.playerUids?.[playerRole]&&data.playerUids[playerRole]!==user.uid)return false;
              if(data.turnCalculationOwner&&now-(data.turnCalculationStartedAt||now)<25000)return false;
              tx.update(ref,{turnCalculationOwner:user.uid,turnCalculationStartedAt:now});
              return true;
            });
          };

          // --- NUOVA FUNZIONE DI SALVATAGGIO / SKIP FORZATO (Infallibile) ---
          const handleForceSkip = (...__args) => handleForceSkipImpl({ calculateTurn, gameState, generateCPUActionsForPlayer, getActivePlayers, isCalculatingRef, setActionMenuMode, setCommandingIdx, setPendingHyper, setSystemAlert, setTargetingMoveIdx, updateState }, ...__args);

          const safeForceSkip = async()=>{
            if(gameState.status!=='battling')return;
            // In Co-op recupera i KO sotto transazione: mai scrivere una
            // sostituzione da uno snapshot vecchio mentre si calcola il turno.
            if(appMode==='online_room'&&gameState.isRoguelikeCoop &&
               prepareEmergencySwitch(gameState,getActivePlayers())){
              await recoverRoomPhase(true);
              return;
            }
            // Se un compagno ha acquisito il turno quando l'host era offline,
            // l'host riconnesso non deve avviare un secondo calcolo.
            if(appMode==='online_room'&&gameState.isRoguelikeCoop&&
               gameState.turnCalculationOwner&&gameState.turnCalculationOwner!==user?.uid&&
               !(Number.isFinite(gameState.turnCalculationStartedAt)&&
                 Date.now()-gameState.turnCalculationStartedAt>=25000))return;
            if(appMode==='online_room'&&playerRole!=='p1'){
              if(!canRecoverRoom(gameState,playerRole)){
                setSystemAlert('L’host è ancora connesso: attendi il suo turno. In caso di KO, usa la sostituzione.');
                return;
              }
              try{
                const allowed=await claimOfflineHostTurn();
                if(!allowed)return;
              }catch(err){setSystemAlert('Non posso forzare il turno: '+err.message);return;}
            }
            handleForceSkip();
          };

          // Il timer non trasforma mai un guest in arbitro mentre
          // l'host è ancora presente. Solo dopo 45s senza heartbeat,
          // e dopo aver acquisito la transazione di turno.
          useEffect(()=>{
            if(timeLeft!==0||gameState.status!=='battling'||isPlayingEvents)return;
            if(appMode==='local_room'||playerRole==='p1'){
              safeForceSkip();
              return;
            }
            if(appMode!=='online_room')return;
            const check=()=>{if(canRecoverRoom(gameState,playerRole))safeForceSkip();};
            check();
            const timer=setInterval(check,5000);
            return()=>clearInterval(timer);
          },[timeLeft,gameState.status,isPlayingEvents,appMode,playerRole,
             gameState.hostHeartbeatAt,gameState.turnExpiresAt,roomId,user?.uid]);

          // --- FIX: TIENI TRACCIA DEL TURNO DRAFT REALE ---
          useEffect(() => {
              currentDraftTurnRef.current = gameState.currentDraftTurn;
          }, [gameState.currentDraftTurn]);
          
          // --- EFFETTO TIMER DRAFT BATTLE ---
          useEffect(() => {
              let timer;
              const myTeamSize = ((gameState.gameMode === 'juggernaut' || gameState.gameMode === 'survival') && playerRole === (gameState.settings.juggernautPlayer || 'p1')) ? 1 : gameState.settings.teamSize;
              const myDraft = gameState.draft[playerRole] || [];
              const isReady = myDraft.length >= myTeamSize;

              if (gameState.status === 'drafting' && gameState.settings.draftBattle && !isReady && appMode !== 'menu' && !gameState.isBot[playerRole] && playerRole !== 'spectator') {
                  timer = setInterval(() => {
                      setDraftTimeLeft(prev => {
                          if (prev <= 1) {
                              // Scelta Automatica se il tempo scade!
                              const choices = gameState.draftChoices[playerRole] || [];
                              if (choices.length > 0) {
                                  handlePick(choices[Math.floor(Math.random() * choices.length)]);
                              }
                              return 30;
                          }
                          return prev - 1;
                      });
                  }, 1000);
              }
              return () => { if (timer) clearInterval(timer); };
          }, [gameState.status, gameState.settings.draftBattle, gameState.draft, playerRole, appMode, gameState.draftChoices]);
          // ---------------------------------------------------

          // --- EFFETTO BOT E TIMER PER DRAFT CONDIVISO ---
          useEffect(() => {
              if (gameState.status !== 'drafting' || !gameState.settings.sharedDraft) return;
              
              const activePlayerTurn = gameState.draftSequence[gameState.currentDraftTurn];
              if (!activePlayerTurn) return; // Draft finito

              // FIX CRITICO: Resetta SEMPRE il timer locale a 15 quando inizia un nuovo turno.
              // Impedisce che il timer scatti a zero istantaneamente se l'avversario ha impiegato troppo tempo!
              setDraftTimeLeft(15);

              if (gameState.isBot[activePlayerTurn]) {
                  if (appMode === 'local_room' || playerRole === 'p1') {
                      const timer = setTimeout(() => {
                          const available = gameState.sharedDraftPool.map((c, i) => ({ c, i })).filter(x => !x.c.pickedBy);
                          if (available.length > 0) {
                              const pick = available[Math.floor(Math.random() * available.length)];
                              handleSharedPick(pick.i, activePlayerTurn);
                          }
                      }, 1500); // Ritardo per far "pensare" il bot
                      return () => clearTimeout(timer);
                  }
              } else {
                  const expectedTurn = gameState.currentDraftTurn;
                  // Timer per l'umano di turno (15 secondi)
                  const timer = setInterval(() => {
                      setDraftTimeLeft(prev => {
                          if (prev <= 1) {
                              if (appMode === 'local_room' || (appMode === 'online_room' && activePlayerTurn === playerRole)) {
                                  const available = gameState.sharedDraftPool.map((c, i) => ({ c, i })).filter(x => !x.c.pickedBy);
                                  if (available.length > 0) {
                                      const pick = available[Math.floor(Math.random() * available.length)];
                                      handleSharedPick(pick.i, activePlayerTurn);
                                  }
                              } else if (appMode === 'online_room' && playerRole === 'p1') {
                                  // Fallback: se l'ospite crasha e non invia la scelta, l'host la fa per lui
                                  setTimeout(() => {
                                      // FIX: Usa la ref per assicurarsi che il turno non sia già cambiato nel frattempo
                                      if (currentDraftTurnRef.current === expectedTurn) { 
                                          const available = gameState.sharedDraftPool.map((c, i) => ({ c, i })).filter(x => !x.c.pickedBy);
                                          if (available.length > 0) {
                                              const pick = available[Math.floor(Math.random() * available.length)];
                                              handleSharedPick(pick.i, activePlayerTurn);
                                          }
                                      }
                                  }, 2000);
                              }
                              return 15; // Reset timer
                          }
                          return prev - 1;
                      });
                  }, 1000);
                  return () => clearInterval(timer);
              }
          }, [gameState.status, gameState.settings.sharedDraft, gameState.currentDraftTurn, gameState.sharedDraftPool, gameState.isBot]);
          // ---------------------------------------------------

          // --- STATO CAMPAGNA ---
          const [activeCampaignId, setActiveCampaignId] = useState('crisi_varco');
          
          const loadCampaign = (...__args) => loadCampaignImpl({ CHARACTERS, getCampaignStoryCharacters, setActiveCampaignId, setCampaignState }, ...__args);

          const [campaignState, setCampaignState] = useState(() => {
              const saved = localStorage.getItem('multiverse_rpg_campaign_save_crisi_varco');
              if (saved) {
                  try { 
                      let parsed = JSON.parse(saved);
                      if (parsed.isStarted === undefined) parsed.isStarted = true;
                      if (!parsed.roster) parsed.roster = ['finn', 'topolino'];
                      if (!parsed.rosterStats) parsed.rosterStats = { 'finn': 105, 'topolino': 105 };
                      if (parsed.sectorIdx === undefined) parsed.sectorIdx = 0;
                      if (parsed.missionIdx === undefined) parsed.missionIdx = 0;
                      if (parsed.coins === undefined) parsed.coins = 50;
                      return reconcileCampaignRoster(parsed, CHARACTERS); 
                  } catch(e){}
              }
              const finn = CHARACTERS.find(c=>c.id==='finn');
              const topo = CHARACTERS.find(c=>c.id==='topolino');
              return {
                  isStarted: false,
                  sectorIdx: 0,
                  missionIdx: 0,
                  roster: ['finn', 'topolino'],
                  rosterStats: {
                      'finn': finn ? finn.maxHp : 100,
                      'topolino': topo ? topo.maxHp : 100
                  },
                  coins: 50,
                  difficulty: 'Normal',
                  currentBossState: null,
                  protagonist: null
              };
          });
          const [campaignDialogueIdx, setCampaignDialogueIdx] = useState(0);
          const [campaignSelectedTeam, setCampaignSelectedTeam] = useState([]);
          const [campaignHeldItems, setCampaignHeldItems] = useState({});
          const [campaignZodiacChoices, setCampaignZodiacChoices] = useState({});
          
          // --- NUOVI STATI: ROGUELIKE ---
          const [roguelikeDraftChoices, setRoguelikeDraftChoices] = useState([]);
          const [roguelikeState, setRoguelikeState] = useState(() => {
              const saved = localStorage.getItem('multiverse_rpg_roguelike_save');
              if (saved) {
                  try {
                      const run=JSON.parse(saved);
                      if(run?.isStarted && !run.runId)run.runId='legacy-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
                      return run;
                  } catch(e){}
              }
              return { isStarted: false, floor: 1, roster: [], rosterStats: {}, maxFloor: 50, coins: 0, inventory: {}, isMerchantNext: false, recruitBonus: 0.02, relics: [], trainingUses: 0, encounteredEnemies: [] };
          });

          // Autosave Roguelike
          useEffect(() => {
              if (roguelikeState.isStarted) {
                  localStorage.setItem('multiverse_rpg_roguelike_save', JSON.stringify(roguelikeState));
              } else {
                  localStorage.removeItem('multiverse_rpg_roguelike_save');
              }
          }, [roguelikeState]);
          // ------------------------------

          // --- LOGICA UPLOAD IMMAGINE AVATAR ---
          const handleAvatarUpload = (...__args) => handleAvatarUploadImpl({ setPlayerAvatarUrl }, ...__args);

          const activeCampaign = CAMPAIGNS.find(c => c.id === activeCampaignId) || CAMPAIGNS[0];
          const activeSector = activeCampaign.sectors[campaignState.sectorIdx] || activeCampaign.sectors[0];
          const activeMission = activeSector.missions[campaignState.missionIdx] || activeSector.missions[0];

          // Funzione di avanzamento campagna condivisa
          const advanceCampaign = (...__args) => advanceCampaignImpl({ activeCampaign, activeCampaignId, campaignState, setAppMode, setCampaignState, updateLocalStats }, ...__args);

          // --- LOGICA LORE DINAMICO (Spostata al top level per evitare violazioni di React Hooks) ---
          const campaignDialogueMemo = React.useMemo(() => {
              let dialogs = [...(activeMission.dialogue || [])];
              
              const aliveHeroes = campaignState.roster.filter(id => campaignState.rosterStats[id] > 0);
              const activeBosses = activeMission.isAnomaly && activeMission.id === 'm12_5' && campaignState.anomalyTargets ? campaignState.anomalyTargets : activeMission.boss;

              const ANOMALY_LINES = {
                  'finn': "La mia spada... vuole solo distruggere! Non posso fermarmi!",
                  'topolino': "Ah-ah! L'oscurità è così divertente! Venite a giocare con me!",
                  'patrick': "La polvere nera mi rende... malvagiamente intelligente! E spietato!",
                  'jake': "Mi sto allungando verso l'infinito oscuro, amico! Vi stritolerò!",
                  'spongebob': "Ahahah! Bolle nere per tutti! Sarete perfetti!",
                  'marceline': "Questo nero è molto più gustoso e caotico del rosso...",
                  'poisonivy': "Le mie piante amano questo veleno. Crescete, mie creature oscure!",
                  'corvina': "L'oscurità di quel gatto... si sposa perfettamente con la mia.",
                  'cyborg': "Sistemi infetti. Malware Cataclisma attivo. Eliminare Resistenza.",
                  'goku': "Un potere distruttivo incredibile! Devo assolutamente testarlo su di voi!",
                  'kratos': "LA RABBIA NON HA FINE! MORIRETE TUTTI!",
                  'ladybug': "Il Lucky Charm prevede la vostra totale e assoluta distruzione!",
                  'renarouge': "Le mie illusioni vi faranno impazzire di puro terrore!",
                  'chatnoir': "Ancora Cataclisma! M'lady, non mi fermerò stavolta!",
                  'bowser': "BWAHAH! La polvere oscura mi rende invincibile!",
                  'sdentato': "*Ruggito assordante intriso di energia nera e fulmini viola*",
                  'plankton': "Finalmente un potere superiore per schiacciarvi, molluschi!",
                  'stewie': "I miei calcoli indicano che ora godo di una sadica invincibilità.",
                  'default': "La polvere nera... il Maestro mi chiama di nuovo. Vi annienterò!"
              };

              if (activeMission.isAnomaly && activeMission.id === 'm12_5' && campaignState.anomalyTargets && !dialogs.some(d => d.isAnomalyInjection)) {
                  let insertIdx = Math.min(2, dialogs.length); 
                  campaignState.anomalyTargets.forEach(tId => {
                      const cObj = CHARACTERS.find(c => c.id === tId);
                      if (cObj) {
                          dialogs.splice(insertIdx++, 0, { s: `${cObj.name} (Corrotto)`, t: ANOMALY_LINES[tId] || ANOMALY_LINES['default'], isAnomalyInjection: true });
                      }
                  });
                  dialogs.splice(insertIdx, 0, { s: "Finn l'Umano", t: "No! È inutile parlargli, l'infezione ha preso il sopravvento. Non ci lasciano scelta... dobbiamo lottare!", isAnomalyInjection: true });
              }

              if (!dialogs.some(d => d.isDynamicLore) && !activeMission.isAnomaly) {
                  const lorePool = [
                      { h: 'finn', b: 'jake', t: "Jake! Ricordati di noi! Di BMO, della Casa sull'Albero! Non lasciare che quel testone verde ti porti via!" },
                      { h: 'marceline', b: 'jake', t: "Ehi cagnolone, svegliati o ti prosciugo tutto il sangue! Sto scherzando... forse." },
                      { h: 'finn', b: 'marceline', t: "Marceline, ti prego! Non sei tu! Rompi il controllo, ricordati di Ooo e delle nostre canzoni!" },
                      { h: 'spongebob', b: 'patrick', t: "Patrick, migliore amico mio! Non farti controllare! Ricordati di quando cacciavamo le meduse!" },
                      { h: 'patrick', b: 'spongebob', t: "Spongebob! Ti salverò io! Anzi, ti prenderò a testate finché non torni normale!" },
                      { h: 'ladybug', b: 'chatnoir', t: "Chat, gattino sciocco, resisti! Il tuo Miraculous è più forte di questo trucco mentale!" },
                      { h: 'chatnoir', b: 'renarouge', t: "Rena, smettila con queste illusioni! Siamo una squadra, svegliati!" },
                      { h: 'cyborg', b: 'corvina', t: "Corvina! Usa il tuo mantra! Azzarath Metrion... dai, blocca la sua frequenza!" },
                      { h: 'robin', b: 'cyborg', t: "Cyborg, riavvia i sistemi! Scavalca il firewall di Cell, ora!" },
                      { h: 'goku', b: 'cell', t: "Ancora tu, Cell?! Questa volta non avrai bisogno di esplodere per perdere contro di noi!" },
                      { h: 'kratos', b: 'goku', t: "Un guerriero che si fa dominare la mente è debole. Ti libererò io a suon di pugni." },
                      { h: 'stewie', b: 'plankton', t: "Un microbo con un occhio solo? Amico, i miei laser sono perfetti per disinfestare l'arena." },
                      { h: 'finn', b: 'reghiaccio', t: "Simon! Smettila di fare il cattivo o ti prendo a calci il sedere ghiacciato un'altra volta!" },
                      { h: 'astral', b: 'utopia', t: "Numero 39: Utopia... la mia carta più fedele. Ti libererò da questa oscurità con la luce della speranza!" },
                      { h: 'goku', b: 'snorlax', t: "Ehi bestione! Se ti liberi da quell'insetto ti offro io la cena, promesso!" },
                      { h: 'poisonivy', b: 'roserade', t: "La tua tossina è potente, piccola Roserade. Smettila di servire lui e combatti per il Verde!" },
                      { h: 'luigi', b: 'mario', t: "M-Mario! Fratellone! Svegliati, mi fai troppa paura quando hai quegli occhi viola!" },
                      { h: 'bowser', b: 'mario', t: "Bwahahah! Mario, farti comandare a bacchetta da un insetto gigante è patetico! Ti schiaccio io prima che lo faccia lui!" },
                      { h: 'bowser', b: 'luigi', t: "Lo spilungone verde! Fatti da parte, non ho tempo da perdere con un fifone come te!" },
                      { h: 'zuko', b: 'katara', t: "Katara, reagisci! Non puoi piegarti a questo Cell! Abbiamo ancora una pace da costruire!" },
                      { h: 'zuko', b: 'aang', t: "Aang, tu sei l'Avatar! Sei tu che devi portare l'equilibrio, non la sottomissione!" },
                      { h: 'katara', b: 'aang', t: "Aang, ti prego! Guarda i miei occhi, ricordati di noi! Rompi questa frequenza oscura!" },
                      { h: 'bowser', b: 'spyro', t: "Un draghetto lilla? Bwahaha! Ti faccio vedere io come sputa fuoco un VERO drago!" },
                      { h: 'aang', b: 'zabuza', t: "Usare il dominio dell'acqua per creare una nebbia assassina?! Io ti fermerò!" },
                      { h: 'natsu', b: 'juvia', t: "Juvia! Smettila di fare fiumi di lacrime e datti una mossa, dobbiamo rompere questo incantesimo!" },
                      { h: 'kratos', b: 'nito', t: "Un altro signore dei morti che brama anime. Le mie lame conoscono bene il tuo tipo." },
                      { h: 'carlos', b: 'hannibal', t: "Hai l'aria del mostro psicopatico... Ho affrontato gli zombie, non ho paura di te!" },
                      { h: 'corvina', b: 'trigon', t: "Padre... pensavi di potermi manipolare di nuovo nascondendoti dietro quel burattino di Cell? Questa volta la tua fine sarà definitiva!" },
                      { h: 'meliodas', b: 'ban', t: "Ban! Ehi, svegliati! Non farti comandare da quell'insetto troppo cresciuto!" },
                      { h: 'ban', b: 'meliodas', t: "Capitano! Sembra che tu stia combinando dei guai. Ti darò una raddrizzata!" }
                  ];

                  let injected = false;
                  lorePool.forEach(lore => {
                      if (!injected && aliveHeroes.includes(lore.h) && activeBosses.includes(lore.b)) {
                          const heroObj = CHARACTERS.find(c => c.id === lore.h);
                          if (heroObj) {
                              dialogs.splice(1, 0, { s: heroObj.name, t: lore.t, isDynamicLore: true });
                              injected = true;
                          }
                      }
                  });
              }

              // Sostituzione Protagonista e Co-Protagonista in Torneo Assoluto
              if (activeCampaignId === 'torneo_assoluto') {
                  const protag = CHARACTERS.find(c => c.id === campaignState.protagonist);
                  const coProtagId = campaignState.roster.find(id => id !== campaignState.protagonist) || 'finn';
                  const coProtag = CHARACTERS.find(c => c.id === coProtagId);

                  dialogs = dialogs.map(d => {
                      let newD = { ...d };
                      if (protag && newD.s === 'Topolino') {
                          newD.s = protag.name;
                          if (newD.t) newD.t = newD.t.replace(/Topolino/g, protag.name).replace(/\b(caro roditore|topo)\b/gi, 'campione');
                      }
                      if (coProtag && newD.s === 'Co-Protagonista') {
                          newD.s = coProtag.name;
                      }
                      return newD;
                  });
              }

              return dialogs;
          }, [activeMission, campaignState.roster, campaignState.rosterStats, campaignState.anomalyTargets, activeCampaignId, campaignState.protagonist]);

          const campaignPostDialogueMemo = React.useMemo(() => {
              let dialogs = [...(activeMission.postDialogue || [])];

              const RECOVERY_LINES = {
                  'finn': "Amici... scusate, avevo perso totalmente il controllo della mia spada.",
                  'topolino': "Oh cielo... che brutto sogno che ho fatto. L'oscurità fa paura.",
                  'patrick': "Ehi, dov'è finita la mia polvere magica dell'intelligenza?",
                  'jake': "Ugh, mi sento tutto annodato come un pretzel malriuscito.",
                  'spongebob': "Sono di nuovo una spugna felice, porosa e assorbente!",
                  'marceline': "Bleah, ho un saporaccio in bocca. Mai più polvere di gatto nero.",
                  'poisonivy': "Il Verde... mi ha purificata di nuovo dalla marcescenza.",
                  'corvina': "Azarath Metrion... fiuu, sto bene. Grazie ragazzi, mi avete salvata.",
                  'cyborg': "Antivirus completato. Rimossa stringa 'Malware Cataclisma'. Booyah.",
                  'goku': "Che botta! Però mi sono divertito un po', ammettetelo!",
                  'kratos': "Ancora una volta, ho ceduto all'ira cieca... vi ringrazio.",
                  'ladybug': "Di nuovo?! Dobbiamo sconfiggere Cell al più presto, prima che accada di peggio.",
                  'renarouge': "Ahi... la mia testa gira peggio delle mie stesse illusioni.",
                  'chatnoir': "Scusate... il potere del mio Cataclisma vi ha messi in pericolo.",
                  'bowser': "Grrr... odierò quella polvere per il resto della mia vita!",
                  'sdentato': "*Guaisce scuotendo la testa, visibilmente stordito ma docile*",
                  'plankton': "Maledizione! Ero così vicino alla superiorità intellettuale!",
                  'stewie': "Ignorate tutto ciò che ho detto. Sono stati i fumi della polvere.",
                  'default': "Cosa è successo? Mi sentivo come avvolto nel buio totale..."
              };

              if (activeMission.randomUnlockCount && campaignState.lastUnlocked && campaignState.lastUnlocked.length > 0 && !dialogs.some(d => d.isDynamicUnlock)) {
                  const unlockedId = campaignState.lastUnlocked[0];
                  if (unlockedId === 'maxcaulfield') {
                      dialogs.push({ s: "Chloe Price", t: "Senti Max... vai con loro. Io rimarrò qui a tenere a bada i mostri in questa zona con il fucile. Usa i tuoi poteri e fagli il culo!", isDynamicUnlock: true });
                      dialogs.push({ s: "Max Caulfield", t: "D'accordo Chloe... starò attenta. Ragazzi, sono con voi. Facciamo a pezzi questo Cell.", isDynamicUnlock: true });
                  } else if (unlockedId === 'chloeprice') {
                      dialogs.push({ s: "Max Caulfield", t: "Chloe, devi andare con loro. Devo rimanere qui a stabilizzare la frattura temporale che abbiamo causato o l'universo collasserà.", isDynamicUnlock: true });
                      dialogs.push({ s: "Chloe Price", t: "Hella yes! Vado a spaccare qualche muso alieno. Cerca di sbrigarti a sistemare le cose, Max.", isDynamicUnlock: true });
                  }
              }

              if (activeMission.isAnomaly && activeMission.id === 'm12_5' && campaignState.anomalyTargets && !dialogs.some(d => d.isAnomalyInjection)) {
                  let insertIdx = Math.min(1, dialogs.length); 
                  campaignState.anomalyTargets.forEach(tId => {
                      const cObj = CHARACTERS.find(c => c.id === tId);
                      if (cObj) {
                          dialogs.splice(insertIdx++, 0, { s: cObj.name, t: RECOVERY_LINES[tId] || RECOVERY_LINES['default'], isAnomalyInjection: true });
                      }
                  });
              }
              
              if (campaignState.faintedInLastBattle && campaignState.faintedInLastBattle.length > 0 && !dialogs.some(d => d.isDynamicFaint)) {
                  const faintedName = campaignState.faintedInLastBattle[0]; 
                  
                  const aliveCharacters = campaignState.roster.filter(id => campaignState.rosterStats[id] > 0);
                  let speakerId = aliveCharacters.length > 0 ? aliveCharacters[Math.floor(Math.random() * aliveCharacters.length)] : 'finn';
                  const speakerNameObj = CHARACTERS.find(c => c.id === speakerId);
                  const speakerName = speakerNameObj ? speakerNameObj.name : "Finn l'Umano";

                  const finalSpeaker = speakerName === faintedName ? "Topolino" : speakerName;

                  // --- NUOVI DIALOGHI PERSONALIZZATI PER I CADUTI ---
                  const specificFaintLines = [
                      { s: 'finn', f: 'Jake il Cane', t: "Jake! Fratello! Resisti, ti rimetteremo in sesto!" },
                      { s: 'jake', f: 'Finn l\'Umano', t: "Finn!! Ohi ohi, ti preparo subito dei pancake curativi, amico!" },
                      { s: 'ladybug', f: 'Chat Noir', t: "Chat... no! M'lady non può farcela senza di te." },
                      { s: 'chatnoir', f: 'Ladybug', t: "M'lady!! La mia fortuna si è azzerata vedendoti cadere... ti proteggerò!" },
                      { s: 'marceline', f: 'Re Ghiaccio', t: "Simon! Non fare scherzi, vecchio pazzo. Svegliati!" },
                      { s: 'goku', f: 'Kratos', t: "Ehi, Kratos! Ti sei fatto stendere? Forza, non è da te!" },
                      { s: 'kratos', f: 'Goku', t: "Il guerriero spensierato è caduto. La sua ingenuità gli è costata cara." },
                      { s: 'spongebob', f: 'Patrick Stella', t: "Patrick!! Amico miooooo! Sniff... ti salverò io!" },
                      { s: 'patrick', f: 'Spongebob', t: "Spongebob! Oh no, si è asciugato tutto! Serve acqua, presto!" },
                      { s: 'maxcaulfield', f: 'Chloe Price', t: "Chloe... no, di nuovo no. Devo riavvolgere il tempo... resisti." },
                      { s: 'chloeprice', f: 'Max Caulfield', t: "Max! Brutti bastardi, me la pagherete cara per averle fatto del male!" },
                      { s: 'stewie', f: 'Plankton', t: "Bene, l'organismo monocellulare è fuori uso. Un peso in meno per me." },
                      { s: 'cyborg', f: 'Robin', t: "Robin è a terra! Squadra, copritelo finché non lo curiamo!" },
                      { s: 'corvina', f: 'Stellarubia', t: "Stella... la sua luce si è spenta. La farò pagare a chi le ha fatto questo." },
                      { s: 'meliodas', f: 'Ban l\'Immortale', t: "Ban! Non fare finta di dormire, so che ti rigeneri! ...Ban?!" },
                      { s: 'ban', f: 'Meliodas', t: "Capitano! Tsk... me la pagheranno cara per questo!" }
                  ];

                  const genericSpeakerLines = {
                      'finn': `Accidenti, ${faintedName} ha preso una brutta batosta! Curiamolo in fretta!`,
                      'kratos': `${faintedName} è caduto. Debole. Ma non lo lasceremo qui a morire.`,
                      'stewie': `Perfetto, ${faintedName} è svenuto. Ora devo fare tutto il lavoro sporco io?`,
                      'topolino': `Oh cielo! ${faintedName} è ferito! Presto, diamogli una mano!`,
                      'cyborg': `Emergenza medica per ${faintedName}! Chiama un medico, o un meccanico!`,
                      'poisonivy': `Povero ${faintedName}... appassito così in fretta. Lo curerò con le mie erbe.`,
                      'goku': `Urca! ${faintedName} ha esaurito l'energia. Presto, ci serve un Senzu!`,
                      'wario': `Wah! ${faintedName} è andato K.O.! Spero non mi chieda i soldi per l'ospedale!`,
                      'zuko': `L'onore di ${faintedName} è intatto, ha combattuto bene. Ora riposi.`,
                      'charmcaster': `Tsk... ${faintedName} è un peso morto. Ma suppongo ci serva ancora per vincere.`,
                      'default': `Oh no! ${faintedName} è a terra! Dobbiamo rimetterlo in sesto!`
                  };

                  let phrase = genericSpeakerLines['default'];
                  
                  // Controlla se c'è un'interazione specifica
                  const specificMatch = specificFaintLines.find(l => CHARACTERS.find(c=>c.id===l.s)?.name === finalSpeaker && l.f === faintedName);
                  if (specificMatch) {
                      phrase = specificMatch.t;
                  } else {
                      // Altrimenti usa una generica del personaggio che parla (se esiste)
                      const speakerIdMatched = CHARACTERS.find(c=>c.name===finalSpeaker)?.id;
                      if (speakerIdMatched && genericSpeakerLines[speakerIdMatched]) {
                          phrase = genericSpeakerLines[speakerIdMatched];
                      } else {
                          phrase = `Oh no! ${faintedName} è a terra! Dobbiamo rimetterlo in sesto!`;
                      }
                  }
                  
                  dialogs.unshift({ s: finalSpeaker, t: phrase, isDynamicFaint: true });
              }

              // Sostituzione Protagonista e Co-Protagonista in Torneo Assoluto
              if (activeCampaignId === 'torneo_assoluto') {
                  const protag = CHARACTERS.find(c => c.id === campaignState.protagonist);
                  const coProtagId = campaignState.roster.find(id => id !== campaignState.protagonist) || 'finn';
                  const coProtag = CHARACTERS.find(c => c.id === coProtagId);

                  dialogs = dialogs.map(d => {
                      let newD = { ...d };
                      if (protag && newD.s === 'Topolino') {
                          newD.s = protag.name;
                          if (newD.t) newD.t = newD.t.replace(/Topolino/g, protag.name).replace(/\b(caro roditore|topo)\b/gi, 'campione');
                      }
                      if (coProtag && newD.s === 'Co-Protagonista') {
                          newD.s = coProtag.name;
                      }
                      return newD;
                  });
              }

              return dialogs;
          }, [activeMission, campaignState.lastUnlocked, campaignState.anomalyTargets, campaignState.faintedInLastBattle, campaignState.roster, campaignState.rosterStats, activeCampaignId, campaignState.protagonist]);
          
          // Autosave Campagna
          useEffect(() => {
              if (campaignState.isStarted) {
                  localStorage.setItem(`multiverse_rpg_campaign_save_${activeCampaignId}`, JSON.stringify(campaignState));
              } else {
                  localStorage.removeItem(`multiverse_rpg_campaign_save_${activeCampaignId}`);
              }
          }, [campaignState, activeCampaignId]);

          // Autosave Profilo
          useEffect(() => {
              localStorage.setItem('multiverse_rpg_saved_avatar', playerAvatarUrl);
              localStorage.setItem('multiverse_rpg_saved_name', playerName);
          }, [playerAvatarUrl, playerName]);

          // AGGIORNAMENTO STATISTICHE E PREMI (Risolto bug Battle Royale e Ospiti Online)
          useEffect(() => {
              if (gameState.status === 'pre_battle') {
                  setHasRewarded(false);
              }
              if (gameState.status === 'gameover' && !hasRewarded && playerName.trim()) {
                  setHasRewarded(true);
                  
                  // --- FIX BUG MONETE: CREIAMO UN UNICO OGGETTO PER SALVARE TUTTO IN UNA VOLTA ---
                  let statsUpdates = {};
                  
                  if (matchStartTimeRef.current) {
                      statsUpdates.playtime = Math.floor((Date.now() - matchStartTimeRef.current) / 1000);
                  }
                  
                  const myKey = Object.keys(gameState.players).find(k => gameState.players[k] === playerName);
                  // Solo i Multimon realmente entrati in campo guadagnano padronanza.
                  // La ricompensa si applica nel medesimo salvataggio delle monete.
                  const masteryIds = (gameState.teams?.[myKey] || [])
                    .filter(c => c && c.revealed && !c.isSummonOnly)
                    .map(c => c.id);

                  if (gameState.isCampaignBattle) {
                      const isWin = gameState.winner === gameState.players.p1;
                      if (isWin) {
                          statsUpdates.addCoins = 20;
                          statsUpdates.win = true;
                      }
                      if (myKey && gameState.inventory[myKey]) {
                          statsUpdates.overwriteInventory = gameState.inventory[myKey]; // FIX: Salva gli oggetti usati in campagna
                      }
                      if (masteryIds.length) {
                          statsUpdates.masteryIds = masteryIds;
                          statsUpdates.masteryWon = isWin;
                      }
                      if (Object.keys(statsUpdates).length > 0) updateLocalStats(statsUpdates);
                      return; 
                  }
                  
                  if(gameState.isRoguelikeCoop){
                      // Il bottino della Co-op è SOLO quello condiviso nel documento Firestore.
                      // Non assegnare 110 monete del Juggernaut per ogni piano e
                      // non sovrascrivere lo zaino del profilo globale.
                      const won=gameState.winner!==gameState.players.p4 && gameState.winner!=='Pareggio';
                      if(myKey && masteryIds.length){
                          statsUpdates.masteryIds=masteryIds;
                          statsUpdates.masteryWon=won;
                      }
                      if(won)statsUpdates.win=true;
                      if(Object.keys(statsUpdates).length)updateLocalStats(statsUpdates);
                      return;
                  }
                  if (myKey && gameState.inventory[myKey] && !gameState.isRoguelikeBattle) { // FIX: Ignora l'inventario del roguelike per non sovrascrivere quello globale
                      statsUpdates.overwriteInventory = gameState.inventory[myKey];
                  }

                  if (myKey) {
                      let coinsToReward = 0;
                      let won = false;

                      if (gameState.isRoguelikeBattle) {
                          won = (gameState.winner === gameState.players[myKey]);
                          coinsToReward = won ? (Math.floor(Math.random() * 6) + 10) : 5; // 10-15 monete globali per piano
                      } else if (gameState.gameMode === 'torneo') {
                          const tr = gameState.tournamentResults;
                          if (tr.final && tr.final.winner === myKey) { coinsToReward = 200; won = true; }
                          else if (tr.final && tr.final.loser === myKey) { coinsToReward = 100; }
                          else if (tr.bronze && tr.bronze.winner === myKey) { coinsToReward = 70; }
                          else if (tr.bronze && tr.bronze.loser === myKey) { coinsToReward = 50; }
                          else { coinsToReward = 50; }
                      } else if (gameState.gameMode === 'juggernaut') {
                          // LOGICA PREMI JUGGERNAUT
                          const juggPlayer = gameState.settings.juggernautPlayer || 'p1';
                          const amIJuggernaut = myKey === juggPlayer;
                          const juggWon = gameState.winner === gameState.players[juggPlayer];
                          
                          if (gameState.winner === 'Pareggio') {
                              coinsToReward = 50;
                          } else if (juggWon) {
                              if (amIJuggernaut) {
                                  coinsToReward = 150; // Juggernaut vince
                                  won = true;
                              } else {
                                  coinsToReward = 50; // Fissato per non sfasare i testi
                              }
                          } else {
                              if (amIJuggernaut) {
                                  coinsToReward = 50; // Fissato
                              } else {
                                  coinsToReward = 110; // Sfidanti vincono
                                  won = true;
                              }
                          }
                      } else if (gameState.gameMode === 'survival') {
                          const roundsSurvived = (gameState.survivalRound || 1) - 1;
                          let calculatedCoins = 0;
                          for (let i = 1; i <= roundsSurvived; i++) {
                              calculatedCoins += Math.min(10, i + 2);
                          }
                          coinsToReward = calculatedCoins;
                          statsUpdates.maxSurvivalRound = roundsSurvived;
                      } else {
                          if (gameState.gameMode === 'multipla') {
                               if (gameState.winner && gameState.winner.includes(playerName)) won = true;
                          } else if (gameState.winner === playerName) {
                               won = true;
                          }
                          coinsToReward = won ? 100 : 50;
                          if (gameState.winner === 'Pareggio') coinsToReward = 50;
                      }
                      
                      const teamSizeBonus = Math.max(0, (gameState.settings.teamSize - 4) * 5);
                      if (gameState.gameMode !== 'survival' && !gameState.isRoguelikeBattle) {
                          coinsToReward += teamSizeBonus;
                      }

                      if (won) {
                           statsUpdates.win = true;
                      }
                      if (coinsToReward > 0) {
                           statsUpdates.addCoins = coinsToReward;
                      }
                  }
                  
                  if (myKey && masteryIds.length) {
                      statsUpdates.masteryIds = masteryIds;
                      statsUpdates.masteryWon = !!statsUpdates.win;
                  }

                  // CHIAMATA UNICA AL SALVATAGGIO (Risolve il bug di sovrascrittura di localStorage)
                  if (Object.keys(statsUpdates).length > 0) {
                      updateLocalStats(statsUpdates);
                  }
              }
          }, [gameState.status, hasRewarded, playerName, gameState.winner, gameState.gameMode, gameState.tournamentResults, gameState.settings.teamSize, gameState.inventory, gameState.players, gameState.isCampaignBattle]);

          useEffect(() => {
              const saveableModes = ['local_room', 'online_room', 'roguelike_coop_lobby'];
              if ((appMode==='online_room'||appMode==='roguelike_coop_lobby') && (!user?.uid || !roomId || !playerRole)) return;
              if (saveableModes.includes(appMode)) {
                  localStorage.setItem(ROOM_SESSION_KEY, JSON.stringify({
                      appMode,
                      roomId,
                      playerRole,
                      playerUid: user?.uid||null,
                      gameState: appMode === 'local_room' ? gameState : null
                  }));
              } else if (appMode === 'menu') {
                  localStorage.removeItem('multiverse_rpg_session');
              }
          }, [appMode, roomId, playerRole, gameState, user?.uid]);
          
          // --- FIX: INIZIALIZZAZIONE AUTENTICAZIONE FIREBASE ---
          // AccountGate accede a Firebase e recupera prima i progressi;
          // App viene montata solo dopo per non sovrascrivere il salvataggio.
          useEffect(() => {
              const unsubscribe = onAuthStateChanged(auth, setUser);
              return () => unsubscribe();
          }, []);

          // --- PRESENZA ONLINE (heartbeat + feedback errori) ---
          useEffect(() => {
              if (!user || !playerName.trim()) return;
              const updatePresence = async () => {
                  try {
                      const stats = getPlayerData();
                      const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'online_users', sessionId);
                      await setDoc(userRef, {
                          uid: user.uid,
                          sessionId,
                          name: playerName.trim(),
                          avatar: playerAvatarUrl || '',
                          status: (appMode === 'online_room' && roomId) ? 'In Partita' : 'Nel Menu',
                          roomId: appMode === 'online_room' ? roomId : null,
                          timestamp: Date.now(),
                          wins: stats.wins || 0,
                          matches: stats.matches || 0,
                          title: equippedMasteryTitle(stats, [...CHARACTERS, ...FUSION_CHARACTERS])
                      });
                      setOnlineUsersError('');
                  } catch (err) {
                      console.error('Multimon: presenza online non autorizzata:', err);
                      setOnlineUsersError('Impossibile aggiornare la presenza. Controlla le regole Firestore online_users e Authentication: ' + err.message);
                  }
              };
              updatePresence();
              const interval = setInterval(updatePresence, 25000);
              const onVisible = () => { if (!document.hidden) updatePresence(); };
              document.addEventListener('visibilitychange', onVisible);
              return () => {
                  clearInterval(interval);
                  document.removeEventListener('visibilitychange', onVisible);
              };
          }, [user?.uid, playerName, playerAvatarUrl, appMode, roomId, sessionId, profileRevision]);

          useEffect(() => {
              if (!user || !showOnlinePlayers) return;
              setCheckingOnlineUsers(true);
              const usersRef = collection(db, 'artifacts', appId, 'public', 'data', 'online_users');
              const unsubscribe = onSnapshot(usersRef, (snapshot) => {
                  onlinePresenceRowsRef.current = snapshot.docs.map(d => d.data());
                  setOnlineUsers(visibleOnlinePlayers(onlinePresenceRowsRef.current, sessionId));
                  setCheckingOnlineUsers(false);
                  setOnlineUsersError('');
              }, (err) => {
                  setCheckingOnlineUsers(false);
                  setOnlineUsersError('Firebase non permette di leggere la lista online: ' + err.message);
                  console.error('Errore elenco online:', err);
              });
              const timer = setInterval(() => setOnlineUsers(
                  visibleOnlinePlayers(onlinePresenceRowsRef.current, sessionId)
              ), 12000);
              return () => { unsubscribe(); clearInterval(timer); };
          }, [user?.uid, showOnlinePlayers, sessionId]);

          const handleObserve = (...__args) => handleObserveImpl({ setAppMode, setPlayerRole, setRoomId, setShowOnlinePlayers }, ...__args);

          // --- EFFETTO TRANSIZIONE CO-OP LOBBY -> DRAFT ONLINE ---
          useEffect(() => {
              if (appMode === 'roguelike_coop_lobby' && gameState.status === 'drafting') {
                  setAppMode('online_room');
              }
          }, [appMode, gameState.status]);
          // -------------------------------------------------------

          function getPlayerData() {
              const key = `multiverse_rpg_global_profile`;
              const reconcile = data => {
                  const migration=migrateCampaignChests(data,CAMPAIGNS,localStorage);
                  if(migration.changed)localStorage.setItem(key,JSON.stringify(migration.profile));
                  return migration.profile;
              };
              const raw = localStorage.getItem(key);
              if (raw) {
                  let data = JSON.parse(raw);
                  if (data.coins === undefined) data.coins = 100;
                  if (data.strengthPoints === undefined) data.strengthPoints = 0;
                  if (data.strengthUpgrades === undefined) data.strengthUpgrades = {};
                  if (data.inventory === undefined) data.inventory = { cura_totale: 1 };
                  if (data.unlockedChars === undefined) data.unlockedChars = [];
                  if (data.maxSurvivalRound === undefined) data.maxSurvivalRound = 0;
                  if (data.freeUnlockUsed === undefined) data.freeUnlockUsed = false; // <-- AGGIUNTO PER REGALO BETA
                  
                  // FIX: Scuse e Regalo di 200 Monete
                  if (!data.apologyGiftReceived) {
                      data.coins += 200;
                      data.apologyGiftReceived = true;
                      localStorage.setItem(key, JSON.stringify(data));
                  }

                  // NUOVO FIX: Ricompensa bug di ulteriori 200 monete per tutti i giocatori
                  if (!data.bugFixCompensation200) {
                      data.coins += 200;
                      data.bugFixCompensation200 = true;
                      localStorage.setItem(key, JSON.stringify(data));
                  }
                  
                  return reconcile(data);
              }

              // Migrazione dal vecchio salvataggio (basato sul nome) se esiste
              for (let i = 0; i < localStorage.length; i++) {
                  const k = localStorage.key(i);
                  if (k && k.startsWith('multiverse_rpg_stats_')) {
                      const oldRaw = localStorage.getItem(k);
                      if (oldRaw) {
                          localStorage.setItem(key, oldRaw);
                          let data = JSON.parse(oldRaw);
                          if (data.coins === undefined) data.coins = 100;
                          if (data.strengthPoints === undefined) data.strengthPoints = 0;
                          if (data.strengthUpgrades === undefined) data.strengthUpgrades = {};
                          if (data.inventory === undefined) data.inventory = { cura_totale: 1 };
                          if (data.unlockedChars === undefined) data.unlockedChars = [];
                          if (data.maxSurvivalRound === undefined) data.maxSurvivalRound = 0;
                          if (data.freeUnlockUsed === undefined) data.freeUnlockUsed = false; // <-- AGGIUNTO PER REGALO BETA
                          
                          if (!data.apologyGiftReceived) {
                              data.coins += 200;
                              data.apologyGiftReceived = true;
                          }
                          if (!data.bugFixCompensation200) {
                              data.coins += 200;
                              data.bugFixCompensation200 = true;
                          }
                          localStorage.setItem(key, JSON.stringify(data));
                          return reconcile(data);
                      }
                  }
              }

              return reconcile({ matches: 0, wins: 0, playtime: 0, chars: {}, moves: {}, coins: 500, inventory: { cura_totale: 1 }, unlockedChars: [], strengthPoints: 0, strengthUpgrades: {}, apologyGiftReceived: true, bugFixCompensation200: true, maxSurvivalRound: 0 });
          }

          const updateLocalStats = (...__args) => {
              const result=updateLocalStatsImpl({ getPlayerData }, ...__args);
              setProfileRevision(previous => previous + 1);
              return result;
          };
          const getPlayerTitle = () => equippedMasteryTitle(getPlayerData(), [...CHARACTERS, ...FUSION_CHARACTERS]);
          // La guida viene mostrata solo al primo click, PRIMA di avviare
          // l'azione. Dopo la conferma si conserva la scelta sul cloud.
          const startWithModeGuide=(key,action)=>{
            if(getPlayerData().modeGuideSeen?.[key])return action();
            setPendingModeGuide({key,action});
          };
          const finishModeGuide=()=>{
            const pending=pendingModeGuide;
            if(!pending)return;
            updateLocalStats({markModeGuideSeen:pending.key});
            setPendingModeGuide(null);
            pending.action();
          };

          // La stanza certifica i piani già vinti; ogni giocatore reclama
          // i SUOI premi nel profilo personale, anche dopo un rientro.
          useEffect(()=>{
            if(!gameState.isRoguelikeCoop || !roomId || !user?.uid || !playerRole ||
                gameState.playerUids?.[playerRole]!==user.uid || gameState.isBot?.[playerRole])
              return;
            const floor=Number(gameState.coopRun?.lastClearFloor)||0;
            if(!Number.isInteger(floor)||floor<1)return;
            updateLocalStats({coopPersonalRewards:{
              runId:gameState.coopRun?.runId||'coop-legacy-'+roomId,
              lastClearFloor:floor,
              finished:gameState.coopRun?.finished===true,
              maxFloor:50
            }});
          },[roomId,user?.uid,playerRole,gameState.isRoguelikeCoop,
             gameState.coopRun?.runId,gameState.coopRun?.lastClearFloor,
             gameState.coopRun?.finished,gameState.playerUids?.[playerRole]]);


          // Alla classifica finale ogni account online riscatta solo il proprio
          // piazzamento. Le CPU non hanno profilo; in locale il profilo è quello p1.
          // Un identificativo di partita + ricevuta nel profilo evitano premi ripetuti.
          useEffect(()=>{
            if(gameState.gameMode!=='ultimon'||gameState.status!=='ultimon_final')return;
            if(appMode!=='local_room'&&appMode!=='online_room')return;
            const role=appMode==='local_room'?'p1':playerRole;
            if(!role || role==='spectator'||gameState.isBot?.[role])return;
            if(appMode==='online_room'&&(!user?.uid||!roomId||
               gameState.playerUids?.[role]!==user.uid))return;
            const rankings=ultimonLeaderboard(gameState);
            const placement=rankings.findIndex(entry=>entry.role===role)+1;
            if(!placement||!gameState.ultimon?.runId)return;
            updateLocalStats({ultimonPrize:{
              runId:gameState.ultimon.runId,
              role,
              participants:rankings.length,
              placement
            }});
          },[gameState.status,gameState.gameMode,gameState.ultimon?.runId,
             gameState.ultimon?.champion,gameState.ultimon?.eliminated,
             gameState.ultimon?.stats,gameState.ultimon?.rosters,
             gameState.isBot,gameState.playerUids,appMode,playerRole,roomId,user?.uid]);

          const leaveRoom = (...__args) => leaveRoomImpl({ initialGameState, setAppMode, setCombatLog, setGameState, setIsLogOpen, setPlayerRole, setRoomId }, ...__args);

          const handleConfirmLeave = (...__args) => handleConfirmLeaveImpl({ CHARACTERS, activeCampaignId, appMode, appId, db, doc, roomId, user, runTransaction, campaignState, gameState, leaveRoom, playerRole, setAppMode, setCampaignSelectedTeam, setCampaignState, setShowLeaveConfirm, setSystemAlert }, ...__args);

          const renderHealthBar = (...__args) => renderHealthBarImpl({  }, ...__args);

          useEffect(() => {
            if (!isPlayingEvents && gameState.status === 'battling' && gameState.teams.p1) {
              setDisplayTeams(JSON.parse(JSON.stringify(gameState.teams)));
              setDisplayField(JSON.parse(JSON.stringify(gameState.field)));
            }
          }, [gameState.teams, gameState.field, isPlayingEvents, gameState.status]);

          // Ricollegamento: il documento server è la fonte di verità.
          // Nessun reset della partita al semplice errore di connessione.
          useEffect(() => {
            if ((appMode !== 'online_room' && appMode !== 'roguelike_coop_lobby') || !roomId || !user?.uid) return;
            const roomRef=doc(db,'artifacts',appId,'public','data','rooms',roomId);
            const unsubscribe=onSnapshot(roomRef,snapshot=>{
              if(!snapshot.exists()){
                setSystemAlert('La stanza non esiste più. Se è stata eliminata, non è possibile riprenderla.');
                return;
              }
              const data=snapshot.data();
              if(playerRole && playerRole!=='spectator' && data.playerUids?.[playerRole]
                 && data.playerUids[playerRole]!==user.uid){
                setSystemAlert('Questo posto appartiene a un altro account. Per rientrare accedi con l’account originale.');
                setRoomId(null);setPlayerRole(null);setAppMode('menu');
                return;
              }
              setGameState(data);
            },err=>{
              console.error('Problema di sincronizzazione stanza:',err);
              setSystemAlert('Connessione alla partita interrotta. Il tuo posto resta prenotato: verifica la rete e ricarica per rientrare. '+(err.message||''));
            });
            return()=>unsubscribe();
          },[appMode,roomId,user?.uid,playerRole]);

          // Host presente: heartbeat discreto, per permettere a un altro
          // giocatore di riparare una partita bloccata se l'host sparisce.
          useEffect(()=>{
            if((appMode!=='online_room'&&appMode!=='roguelike_coop_lobby')||playerRole!=='p1'||!roomId||!user?.uid)return;
            const ref=doc(db,'artifacts',appId,'public','data','rooms',roomId);
            const ping=()=>updateDoc(ref,{hostHeartbeatAt:Date.now()}).catch(e=>
              console.warn('Heartbeat della stanza non riuscito:',e));
            ping();
            const timer=setInterval(ping,20000);
            return()=>clearInterval(timer);
          },[appMode,roomId,playerRole,user?.uid]);

          // Listener per sbloccare il turno quando arrivano i dati o i bot calcolano
          useEffect(() => {
              const isHostOrLocal = (appMode === 'online_room' && playerRole === 'p1') || appMode === 'local_room' || appMode === 'vs_cpu';

              if (isHostOrLocal && gameState.status === 'battling') {
                  const activePlayers = getActivePlayers();
                  // Se un KO ha lasciato vuoto il campo, NON trattare
                  // "nessuna azione mancante" come "tutti pronti".
                  // La fase va riparata dalla procedura di sostituzione.
                  if(prepareEmergencySwitch(gameState,activePlayers))return;
                  let humansReady = true;

                  activePlayers.forEach(p => {
                      if (!gameState.isBot[p]) {
                          // FIX: Controlla precisamente se ogni personaggio VIVO in campo ha un'azione
                          const myField = gameState.field[p] || [];
                          myField.forEach(idx => {
                               const char = gameState.teams[p]?.[idx];
                               if (char && char.hp > 0) {
                                    // FIX ANTI-BLOCCO: Controllo esatto sia con indice Number che String (per Firebase)
                                    if (!gameState.actions[p] || (gameState.actions[p][idx] === undefined && gameState.actions[p][idx.toString()] === undefined)) {
                                         humansReady = false;
                                    }
                               }
                          });
                      }
                  });

                  if (humansReady && !isCalculatingRef.current) {
                      isCalculatingRef.current = true;
                      let finalActions = { ...gameState.actions };
                      
                      // FIX ANTI-BLOCCO: Avvolge tutto in try-catch a prova di bomba
                      try {
                          activePlayers.forEach(p => {
                              if (gameState.isBot[p]) {
                                   finalActions[p] = generateCPUActionsForPlayer(p, finalActions);
                              }
                          });
                          
                          // Aggiunto ritardo di sicurezza per evitare blocchi del main thread
                          setTimeout(() => {
                              try {
                                  calculateTurn(finalActions);
                              } catch (calcError) {
                                  console.error("Errore critico durante il calculateTurn. Sblocco forzato:", calcError);
                                  isCalculatingRef.current = false;
                              }
                          }, 50);
                      } catch (error) {
                          console.error("Errore critico durante la generazione azioni CPU. Sblocco turno:", error);
                          isCalculatingRef.current = false;
                      }
                  }
              } else if (gameState.status !== 'battling') {
                  // Resetta SEMPRE isCalculating quando non siamo più in battaglia per prevenire l'incastro a vita!
                  isCalculatingRef.current = false;
              }
          // FIX ANTI-BLOCCO: Aggiunte tutte le dipendenze vitali per far funzionare correttamente getActivePlayers() senza "Stale Closures" (dati vecchi)
          }, [
              gameState.actions, gameState.status, appMode, playerRole, 
              gameState.field, gameState.teams, gameState.isBot,
              gameState.gameMode, gameState.settings, gameState.players,
              gameState.tournamentBracket, gameState.tournamentPhase, 
              gameState.tournamentMatchStatus, gameState.tournamentResults,
              gameState.roundRobinMatches, gameState.currentMatchIdx
          ]);

          useEffect(() => {
            if (!isPlayingEvents && gameState.teams.p1) {
              setDisplayTeams(JSON.parse(JSON.stringify(gameState.teams)));
              setDisplayField(JSON.parse(JSON.stringify(gameState.field)));
            }
          }, [gameState.teams, gameState.field, isPlayingEvents]);

          useEffect(() => {
              if (gameState.status === 'pre_battle') {
                  setIntroCharIdx(0);
                  // Aumentato l'intervallo per dare il giusto ritmo di suspense alla comparsa dei personaggi
                  const interval = setInterval(() => {
                      setIntroCharIdx(prev => prev + 1);
                  }, 400);

                  let timeout;
                  if (appMode === 'local_room' || playerRole === 'p1') {
                      // Aumentato il tempo totale della schermata per permettere la visione delle squadre (6 secondi)
                      timeout = setTimeout(() => {
                          if (gameState.events && gameState.events.length > 0) {
                              updateState({ status: 'executing', postExecStatus: 'battling', turnExpiresAt: Date.now() + 92000 });
                          } else {
                              updateState({ status: 'battling', turnExpiresAt: Date.now() + 92000 });
                          }
                          if (appMode === 'local_room') {
                              if(gameState.gameMode==='ultimon'){
                                const active=(gameState.ultimon?.pair||[]).filter(p=>!gameState.isBot?.[p]);
                                setPlayerRole(active[0]||gameState.ultimon?.pair?.[0]||'p1');
                              }else setPlayerRole('p1');
                              setCommandingIdx(0);
                          }
                      }, 6000); 
                  }

                  return () => {
                      clearInterval(interval);
                      if (timeout) clearTimeout(timeout);
                  };
              }
          }, [gameState.status, appMode, playerRole, gameState.events]);

          // Per ogni client online, comanda SOLO i Multimon ancora privi
          // di una mossa in questo turno. La Co-op blocca immediatamente anche
          // il comando appena inviato, prima che arrivi lo snapshot Firebase.
          useEffect(() => {
              if(gameState.status!=='battling' || isPlayingEvents || appMode!=='online_room' ||
                  gameState.isBot[playerRole])return;
              const myField=gameState.field[playerRole]||[];
              const myActions=gameState.actions[playerRole]||{};
              const locallySubmitted=idx=>gameState.isRoguelikeCoop &&
                coopPendingAction?.roomId===roomId &&
                coopPendingAction?.role===playerRole &&
                coopPendingAction?.phase===gameState.phaseStartedAt &&
                coopPendingAction?.index===idx;
              const available=myField.findIndex(idx=>
                gameState.teams[playerRole]?.[idx]?.hp>0 &&
                myActions[idx]===undefined && !locallySubmitted(idx));
              if(commandingIdx===-1 && available!==-1){
                setCommandingIdx(available);setActionMenuMode('moves');
              }else if(commandingIdx>=0){
                const idx=myField[commandingIdx];
                if(idx===undefined || myActions[idx]!==undefined || locallySubmitted(idx))
                  setCommandingIdx(-1);
              }
          },[gameState.status,isPlayingEvents,appMode,roomId,playerRole,
             gameState.phaseStartedAt,gameState.isRoguelikeCoop,gameState.field,
             gameState.actions,commandingIdx,coopPendingAction,gameState.isBot,gameState.teams]);

          // La campagna e' locale: al rematch non esiste un altro giocatore
          // da aspettare. Se il comando resta su -1 o su un personaggio non
          // selezionabile, riattiviamo il primo Multimon vivo e senza azione.
          // La stessa protezione nelle stanze online e' gestita sopra.
          useEffect(() => {
              if (appMode !== 'local_room' || !gameState.isCampaignBattle ||
                  gameState.status !== 'battling' || isPlayingEvents || playerRole !== 'p1') return;
              if (!shouldRecoverCampaignCommand(gameState,'p1',commandingIdx)) return;
              const nextIdx=nextCampaignCommandIndex(gameState,'p1');
              if (nextIdx < 0) return;
              setCommandingIdx(nextIdx);
              setActionMenuMode('moves');
              setTargetingMoveIdx(null);
              setSelectedMultiTargets([]);
          }, [appMode, gameState.status, gameState.isCampaignBattle,
              gameState.field, gameState.teams, gameState.actions,
              isPlayingEvents, playerRole, commandingIdx]);

          const updateState = (...__args) => updateStateImpl({ appId, appMode, db, doc, roomId, setGameState, updateDoc }, ...__args);

          const getRequiredPlayers = (...__args) => getRequiredPlayersImpl({  }, ...__args);
          
          const getActivePlayers = (...__args) => getActivePlayersImpl({ gameState }, ...__args);

          const isAllPlayersJoined = (...__args) => isAllPlayersJoinedImpl({ gameState, getRequiredPlayers }, ...__args);

          const handleCreateRoom = (...__args) => handleCreateRoomImpl({ appId, db, doc, getPlayerData, initialGameState, playerAvatarUrl, playerName, playerTitle: getPlayerTitle(), setAppMode, setDoc, setPlayerRole, setRoomId, setSystemAlert, user }, ...__args);

          const handleCreateRoguelikeCoop = (...__args) => handleCreateRoguelikeCoopImpl({ appId, db, doc, getPlayerData, initialGameState, playerAvatarUrl, playerName, playerTitle: getPlayerTitle(), setAppMode, setCoopRoomId, setDoc, setPlayerRole, setRoomId, setSystemAlert, user }, ...__args);

          const handleJoinRoom = (...__args) => handleJoinRoomImpl({ appId, db, doc, getPlayerData, getRequiredPlayers, playerAvatarUrl, playerName, playerTitle: getPlayerTitle(), roomIdInput, setAppMode, setCoopRoomId, setPlayerRole, setRoomId, setSystemAlert, runTransaction, user }, ...__args);

          const chooseReplacement = (...__args) => commitReplacementChoiceImpl({ appMode, appId, db, doc, gameState, playerRole, roomId, runTransaction, setSystemAlert, updateState, user }, ...__args);

          const handleAddBot = (...__args) => handleAddBotImpl({ gameState, updateState }, ...__args);

          const handleRemovePlayer = (...__args) => handleRemovePlayerImpl({ updateState }, ...__args);

          const handleLocalStart = (...__args) => handleLocalStartImpl({ getPlayerData, initialGameState, playerAvatarUrl, playerName, playerTitle: getPlayerTitle(), setAppMode, setGameState, setPlayerRole }, ...__args);

          const handleVsCpuStart = (...__args) => handleVsCpuStartImpl({ getPlayerData, initialGameState, playerAvatarUrl, playerName, playerTitle: getPlayerTitle(), setAppMode, setGameState, setPlayerRole }, ...__args);

          // --- AGGIUNTO: AVVIO MODALITÀ SOPRAVVIVENZA ---
          const handleSurvivalStart = (...__args) => handleSurvivalStartImpl({ getPlayerData, initialGameState, playerAvatarUrl, playerName, playerTitle: getPlayerTitle(), setAppMode, setGameState, setPlayerRole }, ...__args);
          // ----------------------------------------------

          const handlePick = (...__args) => handlePickImpl({ CHARACTERS, FUSION_CHARACTERS, gameState, playerRole, setDraftTimeLeft, updateState }, ...__args);

          const handleDraftReroll = (...__args) => handleDraftRerollImpl({ CHARACTERS, FUSION_CHARACTERS, gameState, playerRole, setDraftTimeLeft, updateState }, ...__args);

          // --- GESTIONE PICK DRAFT CONDIVISO ---
          const handleSharedPick = (...__args) => handleSharedPickImpl({ gameState, updateState }, ...__args);
          // -------------------------------------

          const applyOnEnterPassive = (...__args) => applyOnEnterPassiveImpl({ CHARACTERS }, ...__args);

          const startBattle = (...__args) => {
            if (gameState.gameMode === 'ultimon') {
              try {
                const candidate=__args[0];
                const custom=candidate&&typeof candidate==='object'&&!candidate.nativeEvent&&candidate.p1
                  ?candidate:gameState.draft;
                updateState(createUltimonShowcase(gameState,custom))
                  .catch(error=>setSystemAlert('Ultimon: '+(error.message||error)));
                setCombatLog([]);setIsLogOpen(false);
              }catch(error){setSystemAlert('Ultimon: '+(error.message||error));}
              return;
            }
            if(appMode==='online_room'&&gameState.isRoguelikeCoop){
              // Una transazione impedisce avvii doppi e permette a un compagno
              // di sostituire l'host quando la presenza è scaduta.
              return coopRoomAction(['drafting'],true,room=>{
                // Il numero dei nemici è quello generato dal piano (2, 3 o boss).
                // Le vecchie spedizioni con un solo starter umano restano compatibili.
                if(!isCoopDraftReady(room))
                  throw new Error('Il draft non è completo per tutti i partecipanti.');
                let patch=null;
                startBattleImpl({
                  appMode:'online_room',applyOnEnterPassive,gameState:room,
                  getRequiredPlayers,matchStartTimeRef:{current:null},playerName:'',
                  setCombatLog:()=>{},setCommandingIdx:()=>{},setIsLogOpen:()=>{},
                  setPlayerRole:()=>{},updateLocalStats:()=>{},
                  updateState:result=>{patch=result}
                });
                if(patch?.status!=='pre_battle')
                  throw new Error('La preparazione dello scontro non è riuscita.');
                return patch;
              }).then(()=>{
                matchStartTimeRef.current=Date.now();
                setCombatLog([]);setIsLogOpen(false);
              }).catch(error=>setSystemAlert('Non posso avviare la Co-op: '+(error.message||error)));
            }
            return startBattleImpl({ appMode, applyOnEnterPassive, gameState, getRequiredPlayers, matchStartTimeRef, playerName, setCombatLog, setCommandingIdx, setIsLogOpen, setPlayerRole, updateLocalStats, updateState }, ...__args);
          };

          // Ultimon: transizioni atomiche per la stanza online.
          const ultimonMutation = async (allowed,build,actor=null) => {
            if(!['local_room','online_room'].includes(appMode)||gameState.gameMode!=='ultimon')return;
            try {
              const apply=room=>{
                if(room.gameMode!=='ultimon'||!allowed.includes(room.status))
                  throw new Error('La fase Ultimon è già cambiata.');
                return build(room);
              };
              if(appMode==='local_room'){await updateState(apply(gameState));return;}
              if(!roomId||!user?.uid)throw new Error('Stanza o account non disponibili.');
              const ref=doc(db,'artifacts',appId,'public','data','rooms',roomId);
              await runTransaction(db,async tx=>{
                const snap=await tx.get(ref);
                if(!snap.exists())throw new Error('Stanza non trovata.');
                const live=snap.data();
                if(actor){
                  if(playerRole!==actor||live.playerUids?.[actor]!==user.uid||live.isBot?.[actor])
                    throw new Error('Non puoi scegliere per questa squadra.');
                }else if(playerRole!=='p1'&&!canRecoverRoom(live,playerRole))
                  throw new Error('Solo l’host può avanzare il torneo.');
                tx.update(ref,apply(live));
              });
            }catch(error){setSystemAlert('Ultimon: '+(error.message||error));}
          };
          const ultimonIdentity=(role,name,color)=>ultimonMutation(['ultimon_showcase'],
            room=>identityPatch(room,role,name,color),role);
          const ultimonPick=(role,indices)=>ultimonMutation(['ultimon_pick'],
            room=>pickPatch(room,role,indices),role);
          const ultimonHostAction=action=>{
            const steps={
              pair:{allowed:['ultimon_showcase','ultimon_recap'],build:room=>nextUltimonPair(room)},
              format:{allowed:['ultimon_pair'],build:room=>revealUltimonFormat(room)},
              pick:{allowed:['ultimon_format'],build:()=>({status:'ultimon_pick',phaseStartedAt:Date.now()})},
              battle:{allowed:['ultimon_pick'],build:room=>startUltimonDuel(room,applyOnEnterPassive)},
              resolve:{allowed:['ultimon_result'],build:room=>finishUltimonDuel(room)},
              ceremony:{allowed:['ultimon_elimination'],build:room=>finishUltimonElimination(room)}
            };
            const step=steps[action];
            if(!step)return;
            return ultimonMutation(step.allowed,step.build).then(()=>{
              if(action==='battle'&&appMode==='local_room'){
                const humans=(gameState.ultimon?.pair||[]).filter(p=>!gameState.isBot[p]);
                setPlayerRole(humans[0]||gameState.ultimon?.pair?.[0]||'p1');
                setCommandingIdx(0);setCombatLog([]);setIsLogOpen(false);
              }
            });
          };

          // --- HELPER PER OPPONENTI NEL TORNEO SIMULTANEO ---
          const getTournamentMatchOpponents = (...__args) => getTournamentMatchOpponentsImpl({ gameState }, ...__args);

          // --- INTELLIGENZA ARTIFICIALE CPU (Migliorata per Tutti i Bot) ---
          const generateCPUActionsForPlayer = (...__args) => generateCPUActionsForPlayerImpl({ gameState, appMode, getActivePlayers, getMultiplier, getTournamentMatchOpponents, roguelikeState }, ...__args);

          // Un click vecchio, arrivato dopo il cambio turno o su una sessione diversa,
          // non deve sostituire le azioni del nuovo combattimento.
          const guardedCoopActionUpdate = async patch => {
              if(appMode!=='online_room'||!gameState.isRoguelikeCoop)return updateState(patch);
              if(!roomId||!user?.uid)throw new Error('Non sei collegato alla stanza.');
              const key='actions.'+playerRole;
              if(!Object.prototype.hasOwnProperty.call(patch,key))
                throw new Error('Azione Co-op non valida.');
              const submitted=patch[key]||{};
              const active=gameState.field[playerRole]||[];
              const newIndex=active.find(idx=>submitted[idx]!==undefined &&
                gameState.actions?.[playerRole]?.[idx]===undefined);
              if(newIndex===undefined)throw new Error('Questo Multimon ha già confermato la mossa.');
              const pending={roomId,role:playerRole,phase:gameState.phaseStartedAt,index:newIndex};
              setCoopPendingAction(pending); // Mostra subito "mossa confermata".
              const ref=doc(db,'artifacts',appId,'public','data','rooms',roomId);
              try{
                return await runTransaction(db,async tx=>{
                  const snap=await tx.get(ref);
                  if(!snap.exists())throw new Error('La stanza non esiste più.');
                  const live=snap.data();
                  const delta=coopValidatedActionDelta(live,playerRole,user.uid,
                    gameState.phaseStartedAt,submitted);
                  if(!delta)throw new Error('Mossa già confermata oppure turno non più disponibile.');
                  tx.update(ref,{[key]:{...(live.actions?.[playerRole]||{}),...delta}});
                  return true;
                });
              }catch(err){
                setCoopPendingAction(prev=>prev?.roomId===pending.roomId &&
                  prev?.role===pending.role && prev?.phase===pending.phase &&
                  prev?.index===pending.index?null:prev);
                setSystemAlert('Non sono riuscito a registrare la mossa: '+(err.message||err));
                throw err;
              }
          };

          const commitAction = (...__args) => commitActionImpl({ appMode, commandingIdx, ITEMS_DB, MOVES_DB, gameState, getActivePlayers, isSubmittingActionRef, pendingHyper, playerRole, setActionMenuMode, setCommandingIdx, setPendingHyper, setPlayerRole, setSelectedMultiTargets, setTargetingMoveIdx, updateState:guardedCoopActionUpdate }, ...__args);

          const handleSelectMoveTarget = (...__args) => handleSelectMoveTargetImpl({ commandingIdx, commitAction, gameState, getActivePlayers, getTournamentMatchOpponents, MOVES_DB, pendingHyper, playerRole, selectedMultiTargets, setSelectedMultiTargets, targetingMoveIdx }, ...__args);

          const checkTurnReady = (...__args) => checkTurnReadyImpl({ appMode, calculateTurn, gameState, getActivePlayers, playerRole }, ...__args);

          const calculateDamage = (...__args) => calculateDamageImpl({  }, ...__args);

          // Anche il risultato del turno dev'essere condizionale: la prima
          // transazione vincente termina la fase, le altre non riscrivono lo stato.
          const guardedCoopTurnUpdate = async patch => {
              if(appMode!=='online_room'||!gameState.isRoguelikeCoop)return updateState(patch);
              if(!roomId||!user?.uid){isCalculatingRef.current=false;return false;}
              const ref=doc(db,'artifacts',appId,'public','data','rooms',roomId);
              let committed=false;
              try{
                committed=await runTransaction(db,async tx=>{
                  const snap=await tx.get(ref);
                  if(!snap.exists())return false;
                  const live=snap.data();
                  if(!canCommitCoopTurn(live,playerRole,user.uid,gameState.phaseStartedAt))
                    return false;
                  tx.update(ref,{...patch,turnCalculationOwner:null,turnCalculationStartedAt:null});
                  return true;
                });
                return committed;
              }catch(err){
                console.error('Calcolo Co-op non registrato:',err);
                setSystemAlert('Impossibile confermare il turno Co-op: '+(err.message||err));
                return false;
              }finally{
                // In caso di successo aspetta il nuovo snapshot della fase,
                // evitando di ricalcolare inutilmente lo stesso turno.
                // Se la transazione fallisce, il dispositivo può riprovare.
                if(!committed)isCalculatingRef.current=false;
              }
          };

          const calculateTurn = (...__args) => calculateTurnImpl({ CHARACTERS, FUSION_CHARACTERS, ITEMS_DB, MOVES_DB, appMode, calculateDamage, gameState, getActivePlayers, getMultiplier, getTournamentMatchOpponents, playerName, updateLocalStats, updateState:guardedCoopTurnUpdate }, ...__args);

    const handleNextTournamentMatch = (...__args) => handleNextTournamentMatchImpl({ appMode, gameState, setCombatLog, setCommandingIdx, setIsLogOpen, setPlayerRole, updateState }, ...__args);

    // onSnapshot può arrivare più volte (heartbeat incluso) durante
    // la stessa animazione: NON far ripartire il filmato ad ogni snapshot.
    useEffect(() => {
        if(gameState.status!=='executing'){
            playbackKeyRef.current=null;
            return;
        }
        if(!gameState.events?.length)return;
        const key=`${appMode}:${roomId||'local'}:${gameState.phaseStartedAt||gameState.turnExpiresAt||'old'}:${gameState.postExecStatus}:${gameState.events.length}`;
        if(playbackKeyRef.current===key)return;
        playbackKeyRef.current=key;
        playEventsAnimation();
    },[appMode,roomId,gameState.status,gameState.events,
       gameState.phaseStartedAt,gameState.postExecStatus]);

    const advanceOnlinePhase = async (expectedStartedAt) => {
        if(appMode!=='online_room'||!roomId||!user?.uid)return;
        const ref=doc(db,'artifacts',appId,'public','data','rooms',roomId);
        return runTransaction(db,async tx=>{
            const snap=await tx.get(ref);
            if(!snap.exists())return;
            const current=snap.data();
            if(current.status!=='executing'||current.phaseStartedAt!==expectedStartedAt)return;
            if(playerRole!=='p1'&&!canRecoverRoom(current,playerRole))return;
            if(current.playerUids?.[playerRole]&&current.playerUids[playerRole]!==user.uid)return;
            const players=getActivePlayersImpl({gameState:current});
            const patch=nextPhaseAfterExecution(current,players,Date.now());
            if(patch)tx.update(ref,patch);
        });
    };

    const playEventsAnimation = (...__args) => playEventsAnimationImpl({ appMode, gameState,
        getActivePlayers, playerRole, setActionMenuMode, setCombatLog, setCommandingIdx,
        setDisplayField, setDisplayTeams, setEventPlaybackPassive, setEventPlaybackText,
        setIsPlayingEvents, setPlayerRole, setScreenFlash, updateState, advanceOnlinePhase }, ...__args);

    // --- RECUPERO STANZA + SOSTITUZIONI DOPO KO ---
    const recoverRoomPhase = async (force=false) => {
        if(recoveryBusyRef.current)return;
        const active=getActivePlayers();
        if(appMode==='local_room'){
            if(gameState.status==='switching_phase'){
                const result=resolveSwitchingRoom(gameState,active,Date.now(),force,
                    (char,p,i,teams,field,events,room)=>applyOnEnterPassive(
                        char,p,i,teams,field,events,room.gameMode,room.settings,room.isCampaignBattle));
                if(result?.patch){
                    await updateState(result.patch);
                    if(result.kind==='resolved'){
                        const ready=active.filter(p=>!gameState.isBot?.[p] && (result.patch.field[p]||[]).length);
                        if(ready.length){setPlayerRole(ready[0]);setCommandingIdx(0);setActionMenuMode('moves');}
                    }
                }
            }else if(gameState.status==='battling'){
                const patch=prepareEmergencySwitch(gameState,active);
                if(patch)await updateState(patch);
            }
            return;
        }
        if(appMode!=='online_room'||!roomId||!user?.uid)return;
        if(!canRecoverRoom(gameState,playerRole) && !force)return;
        recoveryBusyRef.current=true;
        try{
            const ref=doc(db,'artifacts',appId,'public','data','rooms',roomId);
            await runTransaction(db,async tx=>{
                const snap=await tx.get(ref);
                if(!snap.exists())return;
                const current=snap.data(),now=Date.now();
                if(!canRecoverRoom(current,playerRole,now))return;
                if(current.playerUids?.[playerRole] &&
                   current.playerUids[playerRole]!==user.uid)return;
                const involved=getActivePlayersImpl({gameState:current});
                let patch=null;
                if(current.status==='switching_phase'){
                    const forced=force || phaseIsStale(current,now,recoveryObservedRef.current.at);
                    const result=resolveSwitchingRoom(current,involved,now,forced,
                        (char,p,i,teams,field,events,room)=>applyOnEnterPassive(
                            char,p,i,teams,field,events,room.gameMode,room.settings,room.isCampaignBattle));
                    patch=result?.patch||null;
                }else if(current.status==='battling'){
                    patch=prepareEmergencySwitch(current,involved,now);
                }else if(current.status==='executing' &&
                         phaseIsStale(current,now,recoveryObservedRef.current.at) &&
                         !isHostFresh(current,now)){
                    patch=nextPhaseAfterExecution(current,involved,now);
                }else if(current.status==='pre_battle' &&
                         phaseIsStale(current,now,recoveryObservedRef.current.at) &&
                         !isHostFresh(current,now)){
                    patch={status:current.events?.length?'executing':'battling',
                        postExecStatus:'battling',phaseStartedAt:now,
                        turnExpiresAt:now+92000};
                }
                if(patch)tx.update(ref,patch);
            });
        }catch(error){
            console.error('Recupero stato della partita:',error);
            if(force)setSystemAlert('Non riesco a sbloccare la sostituzione: '+error.message);
        }finally{recoveryBusyRef.current=false;}
    };

    useEffect(()=>{
        if(!['switching_phase','executing','battling','pre_battle'].includes(gameState.status))return;
        const marker=roomId+'|'+gameState.status+'|'+String(gameState.phaseStartedAt||'legacy');
        if(recoveryObservedRef.current.marker!==marker)
            recoveryObservedRef.current={marker,at:Date.now()};
        const check=()=>{recoverRoomPhase(false).catch(err=>console.error('Recupero:',err));};
        check();
        const timer=setInterval(check,8000);
        return()=>clearInterval(timer);
    },[appMode,roomId,playerRole,user?.uid,gameState.status,
       gameState.phaseStartedAt,gameState.field,gameState.teams,
       gameState.switchActions,gameState.pendingSwitches,gameState.isBot,
       gameState.hostHeartbeatAt]);

    // L'host può completare le sostituzioni AFK senza avviare un turno
    // con il campo vuoto. Anche l'host di una stanza legacy può usarlo.
    const forceCompleteSwitches = () => recoverRoomPhase(true);


    // Roguelike Co-op: ricompense, acquisti e nuovi piani sono transazioni
    // atomiche sull'unico documento Firestore della stanza, mai sul salvataggio solo.
    const coopRoomAction=async (allowedStages,leadOnly,makePatch)=>{
      if(!roomId||!user?.uid||!gameState.isRoguelikeCoop)throw new Error('Non sei in una spedizione Co-op.');
      const ref=doc(db,'artifacts',appId,'public','data','rooms',roomId);
      return runTransaction(db,async tx=>{
        const snap=await tx.get(ref);
        if(!snap.exists())throw new Error('La stanza non esiste più.');
        const room=snap.data();
        if(!room.isRoguelikeCoop||!allowedStages.includes(room.status))
          throw new Error('La fase della spedizione è già cambiata. La stanza si sta aggiornando.');
        if(!room.players?.[playerRole]||room.isBot?.[playerRole]||
          room.playerUids?.[playerRole]!==user.uid)
          throw new Error('Non possiedi un posto valido in questa spedizione.');
        if(leadOnly&&playerRole!=='p1'&&isHostFresh(room))
          throw new Error('Solo l’host può proseguire finché è collegato.');
        const patch=makePatch(room);
        tx.update(ref,patch);
        return patch;
      });
    };
    const startCoopDraft=()=>coopRoomAction(['lobby'],true,room=>prepareCoopDraft(room,CHARACTERS))
      .catch(error=>{setSystemAlert('Impossibile avviare la Co-op: '+(error.message||error));throw error;});
    const claimCoopFloor=()=>coopRoomAction(['gameover'],true,
      room=>finishCoopFloor(room,CHARACTERS));
    const startCoopNextFloor=()=>coopRoomAction(['coop_camp'],true,
      room=>({...nextCoopFloor(room,CHARACTERS,(char,p,idx,teams,field,events,ctx)=>
        applyOnEnterPassive(char,p,idx,teams,field,events,ctx.gameMode,ctx.settings,false)),
        coopTrade:null}));
    const buyCoopCampCare=(kind,targetPlayer,targetIdx)=>coopRoomAction(['coop_camp'],false,
      room=>coopCampPurchase(room,CHARACTERS,kind,targetPlayer,targetIdx));
    const castCoopEventVote=choice=>coopRoomAction(['coop_event'],false,
      room=>voteCoopEvent(room,playerRole,choice));
    const closeCoopEventVote=()=>coopRoomAction(['coop_event'],true,
      room=>finalizeCoopEvent(room));
    const reorderOwnCoopTeam=(from,to,expectedId)=>coopRoomAction(['coop_camp'],false,
      room=>reorderCoopTeam(room,playerRole,from,to,expectedId));
    const offerCoopTrade=(target,ownIdx,otherIdx,offeredId,wantedId)=>coopRoomAction(['coop_camp'],false,
      room=>requestCoopTrade(room,playerRole,target,ownIdx,otherIdx,Date.now(),offeredId,wantedId));
    const answerCoopTrade=(accepted,tradeId)=>coopRoomAction(['coop_camp'],false,
      room=>respondCoopTrade(room,playerRole,accepted,Date.now(),tradeId));
    const withdrawCoopTrade=tradeId=>coopRoomAction(['coop_camp'],false,
      room=>cancelCoopTrade(room,playerRole,Date.now(),tradeId));

    // --- RENDERERS ---

    const renderView = () => {
        if (appMode === 'menu') {
  const __screen = renderMenuView({ BarChart, BookOpen, CHARACTERS, GridIcon, IS_PREVIEW, ImageIcon, Shield, ShoppingCart, Swords, Target, Trophy, Upload, Users, Wifi, appMode, getDefaultAvatar, getPlayerData, handleAvatarUpload, handleCreateRoguelikeCoop, handleCreateRoom, handleJoinRoom, handleLocalStart, handleSurvivalStart, handleVsCpuStart, onlineUsers, playerAvatarUrl, playerName, playerTitle: getPlayerTitle(), roguelikeState, roomIdInput, sessionId, setAppMode, setPlayerAvatarUrl, setPlayerName, setRoguelikeDraftChoices, setRoguelikeState, setRoomIdInput, setShowOnlinePlayers, setSystemAlert, startWithModeGuide });
  if (__screen !== undefined) return __screen;
}
    
    if (appMode === 'campaign_select') {
  const __screen = renderCampaignSelectView({ ArrowLeft, CAMPAIGNS, appMode, loadCampaign, setAppMode });
  if (__screen !== undefined) return __screen;
}

    if (appMode === 'campaign_intro') {
  const __screen = renderCampaignIntroView({ activeCampaign, activeCampaignId, appMode, campaignState, setAppMode, setCampaignState });
  if (__screen !== undefined) return __screen;
}

    if (appMode === 'campaign_select_protagonist') {
  const __screen = renderCampaignSelectProtagonistView({ CHARACTERS, appMode, campaignState, getCampaignStoryCharacters, setAppMode, setCampaignState });
  if (__screen !== undefined) return __screen;
}

    if (appMode === 'campaign_map') {
  const __screen = renderCampaignMapView({ ArrowLeft, CHARACTERS, Coins, TYPE_STYLES, Users, activeCampaignId, activeMission, activeSector, appMode, campaignState, loadCampaign, renderHealthBar, setAppMode, setCampaignDialogueIdx, setCampaignSelectedTeam, setCampaignState });
  if (__screen !== undefined) return __screen;
}

    if (appMode === 'campaign_dialogue') {
  const __screen = renderCampaignDialogueView({ CHARACTERS, activeCampaign, activeCampaignId, activeMission, activeSector, appMode, campaignDialogueIdx, campaignDialogueMemo, campaignState, setAppMode, setCampaignDialogueIdx, setCampaignSelectedTeam, setCampaignState });
  if (__screen !== undefined) return __screen;
}

    if (appMode === 'campaign_echo_chest') {
 const __screen = renderEchoChestView({appMode,activeCampaignId,activeMission,advanceCampaign,campaignState,setCampaignState,CHARACTERS});
 return __screen;
 }
 if (appMode === 'campaign_post_dialogue') {
  const __screen = renderCampaignPostDialogueView({ CHARACTERS, activeMission, activeSector, advanceCampaign, appMode, campaignDialogueIdx, campaignPostDialogueMemo, setAppMode, setCampaignDialogueIdx });
  if (__screen !== undefined) return __screen;
}

    if (appMode === 'campaign_choice') {
  const __screen = renderCampaignChoiceView({ CHARACTERS, TYPE_STYLES, activeMission, activeSector, appMode, campaignState, setAppMode, setCampaignState, setResolutionDialogueIdx, setResolutionDialogues, updateLocalStats });
  if (__screen !== undefined) return __screen;
}

    if (appMode === 'campaign_resolution_dialogue') {
  const __screen = renderCampaignResolutionDialogueView({ CHARACTERS, activeSector, advanceCampaign, appMode, resolutionDialogueIdx, resolutionDialogues, setResolutionDialogueIdx });
  if (__screen !== undefined) return __screen;
}

    if (appMode === 'campaign_team_select') {
  const __screen = renderCampaignTeamSelectView({ ITEMS_DB, campaignHeldItems, setCampaignHeldItems, campaignZodiacChoices, setCampaignZodiacChoices, CHARACTERS, Swords, TYPES, TYPE_STYLES, activeCampaign, activeCampaignId, appMode, applyOnEnterPassive, campaignSelectedTeam, campaignState, draftFilterType, draftSearch, draftSort, getPlayerData, initialGameState, playerName, renderHealthBar, selectionDialogueTimerRef, setAppMode, setCampaignSelectedTeam, setCampaignState, setCombatLog, setCommandingIdx, setActionMenuMode, setTargetingMoveIdx, setSelectedMultiTargets, setPendingHyper, setIsPlayingEvents, setEventPlaybackText, setEventPlaybackPassive, setDraftFilterType, setDraftSearch, setDraftSort, setGameState, setIsLogOpen, setPlayerRole, setSystemAlert, setTeamSelectionDialogue, teamSelectionDialogue });
  if (__screen !== undefined) return __screen;
}

    if (appMode === 'campaign_shop') {
  const __screen = renderCampaignShopView({ CHARACTERS, Coins, Heart, appMode, campaignState, renderHealthBar, setAppMode, setCampaignState, setSystemAlert });
  if (__screen !== undefined) return __screen;
}

    if (appMode === 'campaign_ending') {
  const __screen = renderCampaignEndingView({ CHARACTERS, Trophy, activeCampaign, activeCampaignId, appMode, campaignState, loadCampaign, setAppMode, setCampaignSelectedTeam, setCampaignState });
  if (__screen !== undefined) return __screen;
}

    // --- NUOVE PAGINE ROGUELIKE ---
    if (appMode === 'roguelike_draft') {
  const __screen = renderRoguelikeDraftView({ CHARACTERS, TYPE_STYLES, appMode, roguelikeDraftChoices, roguelikeState, setAppMode, setRoguelikeState });
  if (__screen !== undefined) return __screen;
}

    if (appMode === 'roguelike_map') {
  const __screen = renderRoguelikeMapView({ CHARACTERS, ChevronRight, Coins, Heart, ITEMS_DB, LogOut, Swords, Users, appMode, initialGameState, applyOnEnterPassive, playerName, renderHealthBar, roguelikeState, setAppMode, setGameState, setPlayerRole, setRoguelikeState, setSystemAlert, updateLocalStats });
  if (__screen !== undefined) return __screen;
}
    // --- FINE NUOVE PAGINE ---

    if (appMode === 'roguelike_coop_lobby') {
  const __screen = renderRoguelikeCoopLobbyView({ ArrowLeft, CHARACTERS, FUSION_CHARACTERS, Loader2, Wifi, appMode, coopRoomId, gameState, getDefaultAvatar, playerRole, setAppMode, setCoopRoomId, leaveRoom, startCoopDraft });
  if (__screen !== undefined) return __screen;
}

    if (appMode === 'chests') {
  return <CampaignChestsView profile={getPlayerData()} onOpen={()=>updateLocalStats({openCampaignChest:true})}
    onAcknowledge={()=>updateLocalStats({acknowledgeChestReveal:true})}
    onTutorialComplete={type=>updateLocalStats({completeFinnTutorial:type})}
    onBack={()=>setAppMode('menu')}/>;
}

    if (appMode === 'power_chests') {
  return <PowerChestsView profile={getPlayerData()}
    onOpen={()=>updateLocalStats({openPowerChest:true})}
    onAcknowledge={()=>updateLocalStats({acknowledgePowerChest:true})}
    onTutorialComplete={type=>updateLocalStats({completeFinnTutorial:type})}
    onBack={()=>setAppMode('menu')}/>;
}

    if (appMode === 'strength_lab') {
  return <StrengthLabView characters={CHARACTERS} profile={getPlayerData()}
    onUpgrade={(charId,stat)=>updateLocalStats({strengthUpgrade:{charId,stat}})}
    onTutorialUpgrade={(charId,stat)=>updateLocalStats({freeLabUpgrade:{charId,stat}})}
    onTutorialStep={step=>updateLocalStats({labTutorialStep:step})}
    onTutorialComplete={()=>updateLocalStats({completeLabTutorial:true})}
    onBack={()=>setAppMode('menu')}/>;
}

    if (appMode === 'shop') {
  const __screen = renderShopView({ ArrowLeft, BookOpen, CHARACTERS, Coins, IS_PREVIEW, ITEMS_DB, Lock, ShoppingCart, TYPE_STYLES, Unlock, Users, appMode, gameState, getPlayerData, setAppMode, setGameState, setShopCharSearch, setShopTab, setSystemAlert, shopCharSearch, shopTab, updateLocalStats });
  if (__screen !== undefined) return __screen;
}

    if (appMode === 'stats') {
  const __screen = renderStatsView({ ArrowLeft, Swords, Target, Trophy, Users, CHARACTERS, FUSION_CHARACTERS, appMode, getPlayerData, playerName, masterySearch, setMasterySearch, masteryFilter, setMasteryFilter, setAppMode, updateLocalStats });
  if (__screen !== undefined) return __screen;
}

    if (appMode === 'type_chart') {
  const __screen = renderTypeChartView({ ArrowLeft, TYPES, TYPE_CHART, TYPE_STYLES, appMode, setAppMode });
  if (__screen !== undefined) return __screen;
}

    if (appMode === 'catalog') {
  const __screen = renderCatalogView({ ArrowLeft, CHARACTERS, FUSION_CHARACTERS, Lock, MOVES_DB, TYPES, TYPE_STYLES, appMode, catalogFilter, catalogSearch, catalogSort, setAppMode, setCatalogFilter, setCatalogSearch, setCatalogSort });
  if (__screen !== undefined) return __screen;
}

    if (gameState.status === 'lobby') {
  const __screen = renderLobbyView({ ArrowLeft, CHARACTERS, FUSION_CHARACTERS, Loader2, SOUNDTRACKS, Swords, TYPE_STYLES, Users, Volume2, appMode, gameState, getDefaultAvatar, getPlayerData, getRequiredPlayers, handleAddBot, handleRemovePlayer, isAllPlayersJoined, leaveRoom, playerRole, roomId, setDraftTimeLeft, startBattle, updateState });
  if (__screen !== undefined) return __screen;
}

    if (gameState.status === 'drafting') {
  const __screen = renderDraftingView({ ArrowLeft, CHARACTERS, ITEMS_DB, FUSION_CHARACTERS, IS_PREVIEW, Loader2, Swords, TYPES, TYPE_STYLES, Unlock, appMode, draftFilterType, draftHoverInfo, draftLongPressRef, draftPressTimerRef, draftSearch, draftSort, draftRole, setDraftRole, draftPrice, setDraftPrice, draftFavorites, draftFavoritesOnly, setDraftFavoritesOnly, toggleDraftFavorite, draftTimeLeft, gameState, getDefaultAvatar, getPlayerData, getRequiredPlayers, handleDraftReroll, handlePick, handleSharedPick, leaveRoom, playerRole, setDraftFilterType, setDraftHoverInfo, setDraftSearch, setDraftSort, setPlayerRole, setSystemAlert, startBattle, updateState });
  if (__screen !== undefined) return __screen;
}

    if (gameState.gameMode === 'ultimon' && ULTIMON_STAGES.includes(gameState.status)) {
      return <UltimonView key={gameState.status+':'+(gameState.ultimon?.round||0)}
        room={gameState} appMode={appMode} playerRole={playerRole}
        canHost={appMode==='local_room'||playerRole==='p1'||canRecoverRoom(gameState,playerRole)}
        onIdentity={ultimonIdentity} onPick={ultimonPick}
        onHost={ultimonHostAction} onExit={leaveRoom}/>;
    }

    if (gameState.status === 'switching_phase') {
  const __screen = renderSwitchingPhaseView({ Loader2, LogOut, TYPE_STYLES, appMode, gameState, getActivePlayers, getTournamentMatchOpponents, leaveRoom, playerRole, renderHealthBar, setPlayerRole, setShowLeaveConfirm, chooseReplacement, forceCompleteSwitches, canForceSwitch: appMode==='local_room'||canRecoverRoom(gameState,playerRole) });
  if (__screen !== undefined) return __screen;
}

    if (gameState.status === 'battling' || gameState.status === 'executing') {
  const __screen = renderBattlingView({ coopPendingAction, roomId, ownMasteryLevels: masteryVisibleLevels(getPlayerData()), ChevronRight, ITEMS_DB, appMode, Loader2, LogOut, PLAYER_THEMES, ScrollText, Shield, TYPE_STYLES, Target, Trophy, XIcon, actionMenuMode, combatLog, commandingIdx, commitAction, displayField, displayTeams, eventPlaybackPassive, eventPlaybackText, gameState, getActivePlayers, getDefaultAvatar, getMultiplier, getTournamentMatchOpponents, handleForceSkip: safeForceSkip, handleSelectMoveTarget, hoveredMove, isLogOpen, isLongPressRef, isPlayingEvents, leaveRoom, logEndRef, pendingHyper, playerRole, pressTimerRef, renderHealthBar, screenFlash, selectedMultiTargets, setActionMenuMode, setHoveredMove, setIsLogOpen, setPassiveInfoPopup, setPendingHyper, setSelectedMultiTargets, setShowLeaveConfirm, setTargetingMoveIdx, targetingMoveIdx, timeLeft });
  if (__screen !== undefined) return __screen;
}

    if (gameState.isRoguelikeCoop &&
       ['gameover','coop_event','coop_camp','coop_complete'].includes(gameState.status)) {
      return <RoguelikeCoopCampView room={gameState} playerRole={playerRole}
        canLead={playerRole==='p1'||!isHostFresh(gameState)}
        onClaimWin={claimCoopFloor} onNext={startCoopNextFloor}
        onPurchase={buyCoopCampCare} onVoteEvent={castCoopEventVote}
        onReorder={reorderOwnCoopTeam} onTradeOffer={offerCoopTrade}
        onTradeReply={answerCoopTrade} onTradeCancel={withdrawCoopTrade}
        onFinalizeEvent={closeCoopEventVote} onExit={leaveRoom} personalProfile={getPlayerData()}/>;
    }

    if (gameState.status === 'gameover') {
  const __screen = renderGameoverView({ CHARACTERS, ChevronRight, Coins, RotateCcw, Trophy, activeCampaign, activeCampaignId, campaignState, gameState, getDefaultAvatar, leaveRoom, playerName, roguelikeState, setAppMode, setCampaignDialogueIdx, setCampaignSelectedTeam, setCampaignState, setRoguelikeState, setSystemAlert, updateLocalStats });
  if (__screen !== undefined) return __screen;
}

    if (gameState.status === 'intermission') {
  const __screen = renderIntermissionView({ ChevronRight, Loader2, Trophy, appMode, gameState, getDefaultAvatar, handleNextTournamentMatch, playerRole });
  if (__screen !== undefined) return __screen;
}

    if (gameState.status === 'pre_battle') {
  const __screen = renderPreBattleView({ PLAYER_THEMES, gameState, getActivePlayers, getDefaultAvatar, introCharIdx, playerRole });
  if (__screen !== undefined) return __screen;
}

        return null;
    }; // Fine renderView

    return (
        <>
            <MultiverseEventHub appMode={appMode} user={user} playerName={playerName} playerAvatarUrl={playerAvatarUrl} playerTitle={getPlayerTitle()} getPlayerData={getPlayerData} updateLocalStats={updateLocalStats} />
            <UpdateHistoryPanel appMode={appMode} />
            {pendingModeGuide&&<FirstVisitModeGuide key={pendingModeGuide.key}
              guideKey={pendingModeGuide.key}
              onCancel={()=>setPendingModeGuide(null)}
              onContinue={finishModeGuide}/>}

            {showLeaveConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-slate-900 border border-rose-500/50 p-6 rounded-3xl max-w-sm w-full text-center shadow-[0_0_50px_rgba(244,63,94,0.2)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-600"></div>
                        <h3 className="text-2xl font-black text-rose-500 mb-2 flex items-center justify-center gap-2">Vuoi Abbandonare?</h3>
                        <p className="text-slate-300 mb-6 font-medium text-sm">Sei sicuro di voler uscire? Se la partita è in corso online, equivarrà a una resa istantanea per il tuo team.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowLeaveConfirm(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all border border-slate-600">Annulla</button>
                            <button onClick={handleConfirmLeave} className="flex-1 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg">Conferma</button>
                        </div>
                    </div>
                </div>
            )}
            {systemAlert && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-slate-900 border border-amber-500/50 p-6 rounded-3xl max-w-sm w-full text-center shadow-[0_0_50px_rgba(245,158,11,0.2)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500"></div>
                        <h3 className="text-2xl font-black text-amber-500 mb-2 flex items-center justify-center gap-2">⚠️ Avviso</h3>
                        <p className="text-slate-300 mb-8 font-medium">{systemAlert}</p>
                        <button onClick={() => setSystemAlert(null)} className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-3 px-6 rounded-xl w-full transition-all shadow-lg hover:-translate-y-0.5">
                            Ho capito!
                        </button>
                    </div>
                </div>
            )}

            {/* MODALE INFO PASSIVA */}
            {passiveInfoPopup && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setPassiveInfoPopup(null)}>
                    <div className="bg-slate-900 border border-cyan-500/50 p-6 rounded-3xl max-w-sm w-full text-center shadow-[0_0_50px_rgba(6,182,212,0.2)] relative overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500"></div>
                        <h3 className="text-2xl font-black text-cyan-400 mb-4">Passiva di {passiveInfoPopup.name}</h3>
                        {passiveInfoPopup.passive ? (
                            <div className="text-slate-300 font-medium text-sm flex flex-col gap-2 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                <span className="font-bold text-white text-lg flex items-center justify-center gap-2">✨ {passiveInfoPopup.passive.name}</span>
                                <p className="leading-relaxed">{passiveInfoPopup.passive.desc}</p>
                            </div>
                        ) : (
                            <div className="text-slate-400 italic font-medium bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                Passiva non ancora implementata.
                            </div>
                        )}
                        <button onClick={() => setPassiveInfoPopup(null)} className="mt-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-xl w-full transition-all shadow-lg hover:-translate-y-0.5">
                            Chiudi
                        </button>
                    </div>
                </div>
            )}
            
            {/* MODALE GIOCATORI ONLINE */}
            {showOnlinePlayers && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-slate-900 border border-cyan-500/50 rounded-3xl max-w-md w-full shadow-[0_0_50px_rgba(6,182,212,0.3)] relative overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950 shrink-0">
                            <h3 className="text-xl font-black text-cyan-400 flex items-center gap-2"><Users size={24}/> Giocatori Online</h3>
                            <button onClick={() => setShowOnlinePlayers(false)} className="text-slate-500 hover:text-white transition-colors"><XIcon size={24}/></button>
                        </div>
                        <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-3">
                            {onlineUsersError ? (
                                <p role="alert" className="text-rose-300 text-center p-4 bg-rose-950/50 border border-rose-500/40 rounded-xl text-sm">{onlineUsersError}</p>
                            ) : checkingOnlineUsers ? (
                                <p className="text-cyan-300 text-center py-8">Controllo chi è online…</p>
                            ) : onlineUsers.length === 0 ? (
                                <p className="text-slate-400 text-center italic py-8 font-medium">Nessun altro giocatore online in questo momento. I giocatori inattivi da 90 secondi vengono nascosti.</p>
                            ) : onlineUsers.map(u => (
                                <div key={u.sessionId} className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl flex items-center gap-3 shadow-md">
                                    <img src={u.avatar || getDefaultAvatar(u.name)} onError={(e) => { e.target.onerror = null; e.target.src = getDefaultAvatar(u.name); }} className="w-12 h-12 rounded-full border-2 border-slate-600 bg-slate-900 object-cover" />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-white truncate text-base mb-0.5">{u.name}</div>
                                        {u.title && <div className="text-xs text-amber-300 truncate">✦ {u.title}</div>}
                                        <div className={`text-[10px] font-bold uppercase tracking-widest ${u.status === 'In Partita' ? 'text-amber-400' : 'text-emerald-400'}`}>{u.status}</div>
                                    </div>
                                    {u.roomId && (
                                        <button onClick={() => handleObserve(u.roomId)} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all hover:-translate-y-0.5">
                                            <Eye size={16}/> Osserva
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Iframe YouTube Nascosto per l'Audio */}
            <iframe 
                ref={ytRef}
                className="hidden"
                src={`https://www.youtube.com/embed/${activeBgmId}?enablejsapi=1&loop=1&playlist=${activeBgmId}`}
                onLoad={() => {
                    // La finalissima ricarica il video: ripristina volume, mute e play.
                    const player=ytRef.current?.contentWindow;
                    if(!player || !shouldPlayMusic)return;
                    player.postMessage(JSON.stringify({event:'command',func:'setVolume',args:[bgmVolume]}),'*');
                    player.postMessage(JSON.stringify({event:'command',func:isMuted?'mute':'unMute'}),'*');
                    player.postMessage(JSON.stringify({event:'command',func:'playVideo'}),'*');
                }}
                allow="autoplay"
                title="BGM"
            ></iframe>

            {/* Pulsante Toggle Musica Globale e Regolazione Volume */}
            {shouldPlayMusic && (
                <div className="fixed top-4 right-4 z-[200] flex items-center gap-2 bg-slate-900/80 p-2 rounded-full border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.5)] backdrop-blur-md group transition-all">
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={bgmVolume} 
                        onChange={(e) => setBgmVolume(parseInt(e.target.value))}
                        className="w-0 opacity-0 group-hover:w-24 group-hover:opacity-100 transition-all duration-300 origin-right cursor-pointer accent-cyan-400 ml-2"
                        title="Regola Volume"
                    />
                    <button 
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-1 text-cyan-400 hover:text-white transition-all hover:scale-110 mr-1"
                        title={isMuted ? "Attiva Musica" : "Disattiva Musica"}
                    >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                </div>
            )}

            {/* PULSANTE SKIP (Visibile SOLO nell'Anteprima/Canvas per il Testing) */}
            {IS_PREVIEW && gameState.isCampaignBattle && ['pre_battle', 'battling', 'executing', 'switching_phase'].includes(gameState.status) && (
                <button 
                    onClick={() => {
                        updateState({ status: 'gameover', winner: gameState.players.p1 });
                    }}
                    className="fixed top-4 right-20 z-[200] bg-emerald-900/80 px-4 py-2.5 rounded-full border border-emerald-500/50 text-emerald-400 hover:text-white font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(16,185,129,0.5)] backdrop-blur-md hover:scale-105 flex items-center gap-1"
                    title="Skip Vittoria (Dev Only)"
                >
                    ⏩ Skip
                </button>
            )}
            
            {renderView()}
        </>
    );
}

        const root = createRoot(document.getElementById('root'));
root.render(<AppErrorBoundary><AccountGate><App /></AccountGate></AppErrorBoundary>);
