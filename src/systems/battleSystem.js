import { prepareEmergencySwitch } from './roomRecovery.js';
import {canUseBagItems} from './bagItemPolicy.js';
import {selectedPassiveDamageFactor,triggerMiraculousAllyHeal,triggerJackpot,triggerFutureBlock,consumeFutureStrike} from './selectedCharacterPassives.js';
import {legalSupportTargets,isLegalSupportTarget} from './supportTargeting.js';
import {healFromVampiricBite} from './vampiricBite.js';
import {activateTitansRobin,createNightwingBuffWatcher,healBerrySlideAllies} from './titansBerryEffects.js';
import {newcomerDamageFactor,recordSpyExposure,cloverExtraEvasion,triggerCloverDodge,triggerStarWand,resolveBlueberryAction,resetNewcomerTurnFlags} from './newcomerEffects.js';
import {generateStrategicCpuActions,rememberPublicCpuMoves} from './strategicCpu.js';
import {dummyCombatLabActions} from './combatLab.js';
import {rogueDamageFactor} from './roguelikeEvents.js';
import { applyBattleStatModifier,setBattleStatGainObserver } from './statBalance.js';
import {createImperfectGemObserver,addHeatCharge,consumeHeatBurst,
  flameMoveDamageFactor,tryMagmaHeartBurn} from './gemFlameEffects.js';
import {tryCursedBody,tickCursedBody,isMoveDisabled,tryBerryChill,frillishSpoutPower} from './berryFrillishEffects.js';
import {beginHakiGuard,tickHakiGuard,shortenHakiDebuff,hakiStatDebuffMultiplier,strawHatCritBonus,
  strawHatDefenseFactor,namiClimateFactor,applyNamiMirage,applyGuardPoint,
  reduceGuardPointDamage,clearZoroBlind,chopperEntryAid} from './strawHatEffects.js';
import { applyPerfezioneBonus, firstHitProtectionFactor } from './nerfPassives.js';
import { isOnlineHealingLimited, isLimitedHealingItem, onlineHealingRemaining, ONLINE_HEAL_ITEM_LIMIT } from './onlineHealingLimit.js';
import { consumeRaidShieldHit, createRaidShieldUpdateEvent, applyRaidShieldUpdateEvent } from './finalRaidBalance.js';
import { activateRoguelikeBossShield } from './roguelikeBossPower.js';
import { createBattleReport, accumulateBattleReport } from './battleReport.js';
import {createBattlePlaybackSnapshot,applySummonPlaybackEvent} from './battleSummonPlayback.js';
import { collectEchoSoul, expireEchoCopies } from './echoSoulLegion.js';
import {echoFinalVictory,isEchoRaidAccuracyProtected,shouldApplyEchoRecharge} from './echoFinalSouls.js';
import {triggerEchoRaidHalfReset,restoreEchoRaidAccuracy} from './echoRaidHalfReset.js';
import {triggerEchoSoulRecall,shouldTriggerEchoRaidPulse,echoRaidPulseDamage,recordEchoOriginalSoulDefeat,syncEchoOriginalSoulDefeats} from './echoRaidTactics.js';
import {advanceEchoFinalPhase,echoCorruptedSoulReleased} from './echoFinalPhases.js';
import {emitEchoFinalStoryBeats,echoSoulReleaseDialogue} from './echoFinalStoryBeats.js';
import { applyStrengthToFighter } from './strengthLab.js';
import { copyKirbyMoveOnHit } from './kirbyCopy.js';
import { hyperPreviewMoves } from './hyperPreview.js';
import {assideramentoSpeedFactor,assideramentoDamageFactor,tickAssideramento,
  prepareQilinAttack,qilinDamageFactor,resolveQilinAttack} from './assideramentoQilin.js';
import {ZODIAC_TRAP,ZODIAC_DODGE,normalizeZodiacSpirit,activeZodiacSpirit,summonZodiacSpirit,
  addZodiacTrap,zodiacTrapSpeedFactor,zodiacTrapMisses,addZodiacDodge,consumeZodiacDodge,
  zodiacFlatStatBoost,cleanLucyDebuffs,zodiacSecondaryRoll} from './zodiacSpirits.js';
import { outgoingPassiveDamageFactor } from './offensivePassives.js';
import { isRainyWeather, RAINSTORM_TURNS, tryStartRainstorm, weatherMoveFactor, totalEvasionChance } from './rainstorm.js';
import {TAILWIND_TURNS,tailwindAllies,tailwindSpeedFactor,startTailwind,advanceTailwind,
  LUSH_GRASS_TURNS,isLushGrass,lushGrassHeal} from './battleFieldEffects.js';
import { resolvePoisonEndTurn } from './battleStatusTurns.js';
import { addEvasion, crystalShield, beginRefraction, directHitAfterCrystalDefense, endRefractionTurn, snowstormOutcome, randomBuff, randomDebuff, daffyCelebration } from './championEffects.js';
import { ignoresShields, immuneToStatDrops, powerForAccordo, effectiveTaserPower,
  incomingRockEnchantmentFactor, affectedOpponents, addStickyTrap, trapEntries,
  stickyTrapEntryDamage } from './rockstarAgentEffects.js';
import { getHeldPowerFactor, getHeldRecoil, getHeldEvasion, getHeldEndTurnHeal, useHeldGem, getMahitoMultiplier, canDistortSoul, getDistortedSoulDamage } from './heldEquipment.js';
import { reduceIncomingHeldDamage, useHeroSash, activateHourglass,
  boostedStatusChance, offensiveHeldFactor, recordOffensiveMove, markCompassOnHit,
  healSupportAlly, activateVictoryBoots, endVictoryBootsTurn,
  shortenNegativeStatus, reflectNegativeStatus, activatePhoenixFeather,
  endPhoenixFeatherTurn, activateRescueBell } from './advancedHeldItems.js';
import { activateHealingSprout, activateNeutralizingSpray, activateCupidArrow,
 blockedEnemyPassive, rapidTransmutationPriority, markRapidTransmutationEntry,
 endRapidTransmutationTurn, immuneToCritical, hannibalCanDebuff, isNegativeStatus, survivedBarrelHits } from './newHeldAndPassiveEffects.js';
// Moduli dei sistemi di Multimon: funzioni originali con contesto esplicito.
export const handleForceSkipImpl = (ctx) => {
const { calculateTurn, gameState, generateCPUActionsForPlayer, getActivePlayers, isCalculatingRef, setActionMenuMode, setCommandingIdx, setPendingHyper, setSystemAlert, setTargetingMoveIdx, updateState } = ctx;

              if(gameState.status!=='battling'){
                setSystemAlert('Il turno non è in fase di lotta. Per i KO usa la schermata di sostituzione.');
                return;
              }
              // Non provare a calcolare nuovi attacchi quando il campo è vuoto:
              // un KO con riserve disponibili richiede prima una sostituzione.
              const emergency=prepareEmergencySwitch(gameState,getActivePlayers(),Date.now());
              if(emergency){
                updateState(emergency).catch(e=>{
                  isCalculatingRef.current=false;
                  setSystemAlert('Non riesco a recuperare il campo: '+e.message);
                });
                return;
              }
              if(isCalculatingRef.current)return;
              let updates = {};
              let stateUpdated = false;
              let finalActions = JSON.parse(JSON.stringify(gameState.actions || {}));
              const activePlayers = getActivePlayers();
              
              activePlayers.forEach(p => {
                  const myField = gameState.field[p] || [];
                  const myActions = finalActions[p] || {};
                  let needsAction = false;
                  
                  myField.forEach(idx => {
                      const char = gameState.teams[p]?.[idx];
                      if (char && char.hp > 0 && !myActions[idx]) {
                          needsAction = true;
                      }
                  });

                  if (needsAction) {
                      const autoActions = generateCPUActionsForPlayer(p, finalActions);
                      updates[`actions.${p}`] = { ...myActions, ...autoActions }; 
                      finalActions[p] = { ...myActions, ...autoActions };
                      stateUpdated = true;
                  }
              });

              const doCalculate = () => {
                  try {
                      isCalculatingRef.current = true;
                      calculateTurn(finalActions);
                  } catch (e) {
                      console.error("Errore critico durante la forzatura del turno:", e);
                      isCalculatingRef.current = false;
                      setSystemAlert("❌ Errore durante il calcolo forzato. Consulta la console.");
                  }
              };

              // Pulisce l'UI del giocatore
              setTargetingMoveIdx(null);
              setActionMenuMode('moves');
              setPendingHyper(false);
              setCommandingIdx(-1);

              if (stateUpdated) {
                  updateState(updates).then(() => {
                      setTimeout(doCalculate, 300); // Attende il sync di firebase prima di colpire
                  });
              } else {
                  // Se era già tutto pronto ma il gioco si era incartato, forza il calcolo ignorando ogni cosa!
                  doCalculate();
              }
          
};

export const handleObserveImpl = (ctx, targetRoomId) => {
const { setAppMode, setPlayerRole, setRoomId, setShowOnlinePlayers } = ctx;

              setShowOnlinePlayers(false);
              setRoomId(targetRoomId);
              setPlayerRole('spectator');
              setAppMode('online_room');
          
};

export const applyOnEnterPassiveImpl = (ctx, char, p, idx, workingTeams, workingField, eventsArr, gameMode, settings, isCampaign) => {
const { CHARACTERS } = ctx;

              if (char.passive?.crewMedicHeal && char.hp>0) {
                const aid=chopperEntryAid(workingTeams,workingField,p,gameMode,settings,char.passive.crewMedicHeal);
                if(aid){
                  eventsArr.push({type:'damage',targetPlayer:aid.player,targetIdx:aid.idx,
                    newHp:aid.hp,isPassive:true,passiveChar:char.name,passiveName:char.passive.name,
                    text:'🩺 '+char.name+' attiva Medico di Bordo: recuperati '+aid.healed+' PS!'});
                  if(aid.removed)eventsArr.push({type:'status_update',targetPlayer:aid.player,targetIdx:aid.idx,
                    statuses:JSON.parse(JSON.stringify(workingTeams[aid.player][aid.idx].statuses)),
                    text:'🩺 '+char.name+' rimuove '+aid.removed+' grazie a Medico di Bordo!'});
                }
              }
              if (char.passive.zodiacSummon) {
                  const summoned=summonZodiacSpirit(workingTeams,workingField,p,idx,CHARACTERS);
                  if(summoned){
                    eventsArr.push({type:'summon',player:p,newChar:JSON.parse(JSON.stringify(summoned.char)),
                      fieldIdx:summoned.idx,text:`✨ ${char.name} apre il portale dello Zodiaco: ${summoned.char.name} entra in battaglia!`,
                      isPassive:true,passiveChar:char.name,passiveName:char.passive.name});
                  }
              }
              if (char.passive.isSummon) {
                  const summonIds = Array.isArray(char.passive.isSummon) ? char.passive.isSummon : [char.passive.isSummon];
                  let summonedNames = [];
                  summonIds.forEach(summonId => {
                      const baseChar = CHARACTERS.find(c => c.id === summonId);
                      if (baseChar) {
                          const newSummon = {
                              ...JSON.parse(JSON.stringify(baseChar)), statuses: [], consecutiveProtect: 0,
                              baseAtk: baseChar.atk, baseDef: baseChar.def, baseSpd: baseChar.spd, revealed: true
                          };
                          newSummon.moves.forEach(m => { if (m.maxUses !== undefined) m.remainingUses = m.maxUses; });
                          
                          // --- POTENZIAMENTO EVOCAZIONI JUGGERNAUT / CAMPAGNA BOSS ---
                          if (gameMode === 'juggernaut' && settings && !settings.isRoguelikeCoop && p === (settings.juggernautPlayer || 'p1')) {
                              const numOpp = Object.keys(workingField).filter(k => workingTeams[k] && workingTeams[k].length > 0).length - 1;
                              if (numOpp > 0) {
                                  newSummon.maxHp = Math.floor(newSummon.maxHp * (1 + numOpp * 0.8));
                                  newSummon.hp = newSummon.maxHp;
                                  newSummon.atk = Math.floor(newSummon.atk * (1 + numOpp * 0.3));
                                  newSummon.def = Math.floor(newSummon.def * (1 + numOpp * 0.3));
                                  newSummon.baseAtk = newSummon.atk;
                                  newSummon.baseDef = newSummon.def;
                                  newSummon.imageFilter = 'drop-shadow(0 0 15px rgba(220,38,38,0.8))';
                              }
                          } else if (isCampaign && p === 'p2') {
                              const summonerBase = CHARACTERS.find(c => c.id === char.id);
                              if (summonerBase) {
                                  const hpRatio = char.maxHp / summonerBase.maxHp;
                                  const statRatio = char.baseAtk / summonerBase.atk;
                                  newSummon.maxHp = Math.floor(newSummon.maxHp * hpRatio);
                                  newSummon.hp = newSummon.maxHp;
                                  newSummon.atk = Math.floor(newSummon.atk * statRatio);
                                  newSummon.def = Math.floor(newSummon.def * statRatio);
                                  newSummon.baseAtk = newSummon.atk;
                                  newSummon.baseDef = newSummon.def;
                                  if (char.imageFilter) newSummon.imageFilter = char.imageFilter;
                              }
                          }

                          workingTeams[p].push(newSummon);
                          workingField[p].push(workingTeams[p].length - 1);
                          summonedNames.push(newSummon.name);
                      }
                  });
                  if (summonedNames.length > 0) {
                      eventsArr.push({ type: 'text', text: `✨ ${char.name} attiva ${char.passive.name} ed evoca ${summonedNames.join(' e ')}!`, isPassive: true, passiveChar: char.name, passiveName: char.passive.name });
                  }
              }
              
              if (char.passive.teamStatBuff) {
                  let myTeamPlayers = [p];
                  if (gameMode === 'multipla') {
                      myTeamPlayers = ['p1', 'p2'].includes(p) ? ['p1', 'p2'] : ['p3', 'p4'];
                  } else if (gameMode === 'juggernaut') {
                      const juggPlayer = settings?.juggernautPlayer || 'p1';
                      if (p !== juggPlayer) {
                          const allPlayers = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'];
                          myTeamPlayers = allPlayers.filter(ap => ap !== juggPlayer && workingField[ap]);
                      }
                  }

                  myTeamPlayers.forEach(pAlly => {
                      if (workingField[pAlly]) {
                          workingField[pAlly].forEach(aIdx => {
                              const ally = workingTeams[pAlly][aIdx];
                              if (ally && ally.hp > 0) {
                                  if (char.passive.teamStatBuff.atk) applyBattleStatModifier(ally, 'atk', char.passive.teamStatBuff.atk);
                                  if (char.passive.teamStatBuff.def) applyBattleStatModifier(ally, 'def', char.passive.teamStatBuff.def);
                                  if (char.passive.teamStatBuff.spd) applyBattleStatModifier(ally, 'spd', char.passive.teamStatBuff.spd);
                              }
                          });
                      }
                  });
                  eventsArr.push({ type: 'text', text: `✨ ${char.name} attiva ${char.passive.name}: le statistiche del tuo team aumentano!`, isPassive: true, passiveChar: char.name, passiveName: char.passive.name });
              }
              
              if (char.passive.selfStatBuff) {
                  if (char.passive.selfStatBuff.atk) applyBattleStatModifier(char, 'atk', char.passive.selfStatBuff.atk);
                  if (char.passive.selfStatBuff.def) applyBattleStatModifier(char, 'def', char.passive.selfStatBuff.def);
                  if (char.passive.selfStatBuff.spd) applyBattleStatModifier(char, 'spd', char.passive.selfStatBuff.spd);
                  eventsArr.push({ type: 'text', text: `✨ ${char.name} attiva ${char.passive.name}: le proprie statistiche aumentano!`, isPassive: true, passiveChar: char.name, passiveName: char.passive.name });
              }
              
              if (char.passive.enemyStatDebuff || char.passive.revealStrongestEnemyMove || char.passive.applyStatusToRandomEnemy || char.passive.randomStatDebuffToRandomEnemy) {
                  const allPlayers = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'];
                  let enemyPlayers = [];
                  if (gameMode === 'multipla') {
                      enemyPlayers = ['p1', 'p2'].includes(p) ? ['p3', 'p4'] : ['p1', 'p2'];
                  } else if (gameMode === 'juggernaut') {
                      const juggPlayer = settings?.juggernautPlayer || 'p1';
                      enemyPlayers = p === juggPlayer ? allPlayers.filter(ap => ap !== juggPlayer && workingField[ap]) : [juggPlayer];
                  } else {
                      const pKeys = Object.keys(workingField).filter(k => workingField[k].length > 0);
                      enemyPlayers = pKeys.filter(k => k !== p);
                  }
                  
                  if (char.passive.enemyStatDebuff) {
                      enemyPlayers.forEach(ep => {
                          if (workingField[ep]) {
                              workingField[ep].forEach(eIdx => {
                                  const enemy = workingTeams[ep][eIdx];
                                  if (enemy && enemy.hp > 0 && !immuneToStatDrops(enemy) && !blockedEnemyPassive(enemy)) {
                                      if (char.passive.enemyStatDebuff.atk) {
                                          if (enemy.passive && enemy.passive.type === 'immune_to_atk_debuff') {
                                              eventsArr.push({ type: 'text', text: `🛡️ ${enemy.name} è immune al calo di Attacco grazie a ${enemy.passive.name}!`, isPassive: true, passiveChar: enemy.name, passiveName: enemy.passive.name });
                                          } else {
                                              applyBattleStatModifier(enemy, 'atk', char.passive.enemyStatDebuff.atk);
                                          }
                                      }
                                      if (char.passive.enemyStatDebuff.def) applyBattleStatModifier(enemy, 'def', char.passive.enemyStatDebuff.def);
                                      if (char.passive.enemyStatDebuff.spd) applyBattleStatModifier(enemy, 'spd', char.passive.enemyStatDebuff.spd);
                                  }
                              });
                          }
                      });
                      eventsArr.push({ type: 'text', text: `✨ ${char.name} attiva ${char.passive.name}: le statistiche dei nemici in campo diminuiscono!`, isPassive: true, passiveChar: char.name, passiveName: char.passive.name });
                  }
                  
                  if (char.passive.revealStrongestEnemyMove) {
                      let strongestMove = null;
                      let strongestPower = -1;
                      let enemyName = '';
                      enemyPlayers.forEach(ep => {
                          if (workingField[ep]) {
                              workingField[ep].forEach(eIdx => {
                                  const enemy = workingTeams[ep][eIdx];
                                  if (enemy && enemy.hp > 0) {
                                      enemy.moves.forEach(m => {
                                          if (m && m.power > strongestPower) {
                                              strongestPower = m.power;
                                              strongestMove = m;
                                              enemyName = enemy.name;
                                          }
                                      });
                                  }
                              });
                          }
                      });
                      if (strongestMove) {
                          eventsArr.push({ type: 'text', text: `👁️ ${char.passive.name}! ${char.name} analizza e svela la mossa più potente: ${strongestMove.name} di ${enemyName} (Potenza: ${strongestPower})!`, isPassive: true, passiveChar: char.name, passiveName: char.passive.name });
                      }
                  }
                  
                  if (char.passive.applyStatusToRandomEnemy) {
                      let possibleTargets = [];
                      enemyPlayers.forEach(ep => {
                          if (workingField[ep]) {
                              workingField[ep].forEach(eIdx => {
                                  const enemy = workingTeams[ep][eIdx];
                                  if (enemy && enemy.hp > 0 && !blockedEnemyPassive(enemy)) {
                                      possibleTargets.push({ player: ep, idx: eIdx, char: enemy });
                                  }
                              });
                          }
                      });
                      if (possibleTargets.length > 0) {
                          const rTarget = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
                          const sType = char.passive.applyStatusToRandomEnemy.type;
                          
                          const isNegative = ['Avvelenato', 'Scottato', 'Elettrizzato', 'Congelato', 'Addormentato', 'Confuso', 'Indebolito', 'Stordito', 'Accecato', 'Incantato', 'Anima Distorta', 'Assiderato'].includes(sType);
                          if (isNegative && (rTarget.char.passive?.immuneToNegativeStatuses || blockedEnemyPassive(rTarget.char) || (sType==='Accecato'&&isEchoRaidAccuracyProtected(rTarget.char)))) {
                              eventsArr.push({ type: 'text', text: `🛡️ ${char.name} attiva ${char.passive.name}, ma ${rTarget.char.name} è immune a ${sType} grazie a ${rTarget.char.passive?.name||'Scudo Anti-Magia'}!`, isPassive: true, passiveChar: char.name, passiveName: char.passive.name });
                          } else {
                              const existingIdx = rTarget.char.statuses.findIndex(s => s.type === sType);
                              if (existingIdx === -1) {
                                  rTarget.char.statuses.push({ type: sType, turns: char.passive.applyStatusToRandomEnemy.turns || 1 });
                              } else {
                                  rTarget.char.statuses[existingIdx].turns = char.passive.applyStatusToRandomEnemy.turns || 1;
                              }
                              eventsArr.push({ type: 'text', text: `🔥 ${char.name} attiva ${char.passive.name}! ${rTarget.char.name} subisce lo status ${sType}!`, isPassive: true, passiveChar: char.name, passiveName: char.passive.name });
                              const spray=activateNeutralizingSpray(rTarget.char);
                              if(spray.length)eventsArr.push({type:'text',text:`🧴 Spray Neutralizzante di ${rTarget.char.name}: rimuove ${spray.join(', ')}!`});
                              eventsArr.push({ type: 'status_update', targetPlayer: rTarget.player, targetIdx: rTarget.idx, statuses: JSON.parse(JSON.stringify(rTarget.char.statuses)) });
                          }
                      }
                  }
                  
                  if (char.passive.randomStatDebuffToRandomEnemy) {
                      let possibleTargets = [];
                      enemyPlayers.forEach(ep => {
                          if (workingField[ep]) {
                              workingField[ep].forEach(eIdx => {
                                  const enemy = workingTeams[ep][eIdx];
                                  if (enemy && enemy.hp > 0 && !immuneToStatDrops(enemy) && !blockedEnemyPassive(enemy)) {
                                      possibleTargets.push({ player: ep, idx: eIdx, char: enemy });
                                  }
                              });
                          }
                      });
                      if (possibleTargets.length > 0) {
                          const rTarget = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
                          const chance = char.passive.randomStatDebuffToRandomEnemy.chance || 0.5;
                          const mult = char.passive.randomStatDebuffToRandomEnemy.multiplier || 0.7;
                          let debuffedStats = [];
                          
                          if (Math.random() < chance) { 
                              if (rTarget.char.passive && rTarget.char.passive.type === 'immune_to_atk_debuff') {
                                  eventsArr.push({ type: 'text', text: `🛡️ ${rTarget.char.name} è immune al calo di Attacco grazie a ${rTarget.char.passive.name}!`, isPassive: true, passiveChar: rTarget.char.name, passiveName: rTarget.char.passive.name });
                              } else {
                                  applyBattleStatModifier(rTarget.char, 'atk', mult); debuffedStats.push("Attacco"); 
                              }
                          }
                          if (Math.random() < chance) { applyBattleStatModifier(rTarget.char, 'def', mult); debuffedStats.push("Difesa"); }
                          if (Math.random() < chance) { applyBattleStatModifier(rTarget.char, 'spd', mult); debuffedStats.push("Velocità"); }
                          if (debuffedStats.length > 0) {
                              eventsArr.push({ type: 'text', text: `✨ ${char.name} attiva ${char.passive.name}! Le seguenti statistiche di ${rTarget.char.name} diminuiscono: ${debuffedStats.join(", ")}!`, isPassive: true, passiveChar: char.name, passiveName: char.passive.name });
                          }
                      }
                  }
              }
          
};

export const startBattleImpl = (ctx, customDraft = null) => {
const { appMode, applyOnEnterPassive, gameState, getRequiredPlayers, matchStartTimeRef, playerName, setCombatLog, setCommandingIdx, setIsLogOpen, setPlayerRole, updateLocalStats, updateState } = ctx;

            const isCustomDraft = customDraft && typeof customDraft === 'object' && !customDraft.nativeEvent && (customDraft.p1 || customDraft.p2);
            const teams = JSON.parse(JSON.stringify(isCustomDraft ? customDraft : gameState.draft));
            // I bot scelgono autonomamente la chiave. Gli umani usano la selezione dal draft.
            Object.entries(teams).forEach(([p,team])=>(team||[]).forEach(char=>{
              if(char?.id==='lucy'){
                const options=['zodiac_aries','zodiac_taurus','zodiac_gemini','zodiac_cancer',
                  'zodiac_leo','zodiac_virgo','zodiac_aquarius','zodiac_scorpio'];
                char.zodiacSpiritId=gameState.isBot?.[p]?
                  options[Math.floor(Math.random()*options.length)]:
                  normalizeZodiacSpirit(char.zodiacSpiritId);
              }
            }));
            // Ogni umano usa solo gli aggiornamenti del proprio profilo,
            // fissati all'ingresso nella stanza. Le CPU non ricevono bonus.
            Object.entries(teams).forEach(([player,team])=>{
                const levels=gameState.playerStrength?.[player];
                if(!levels || gameState.isBot?.[player] || !Array.isArray(team))return;
                const owned=gameState.playerStrengthOwned?.[player]||[];
                teams[player]=team.map(char=>{
                    const isOwned=char && !char.isSecretUnlock && !char.isSummonOnly && !char.fusionOf &&
                        (!char.price || owned.includes(char.id));
                    return isOwned?applyStrengthToFighter(char,levels):char;
                });
            });
            // I bonus delle gemme si ricaricano tra partite diverse.
            // Il loro acquisto nel profilo rimane permanente.
            Object.values(teams).forEach(team=>(team||[]).forEach(char=>{
              char.baseSpDef ??= char.spDef ?? char.def;
              char.baseSpAtk ??= char.spAtk ?? char.atk;
              char.spDef ??= char.def;
              char.spAtk ??= char.atk;
              char.gemSpent=false;char.healingSproutUsed=false;char.neutralizingSprayUsed=false;
              if(char.id==='ametista')char.gemImperfectUsed=false;
              if(char.id==='robin')char.titansReportUses=0;
              if(char.id==='nightwing')char.evasionBonus=0;
              if(char.id==='flameprincess')char.heatCharges=0;
              if(char.id==='echomax')char.echoSoulCharges=0;
              char.rapidTransmutationReady=false;char.rapidTransmutationFresh=false;
            }));
            let fieldSize = gameState.settings.fieldSize;
            if (gameState.gameMode === 'multipla') fieldSize = 1; 
            
            let field = { p1: [], p2: [], p3: [], p4: [], p5: [], p6: [], p7: [], p8: [] };
            
            // GESTIONE SHUFFLE GIOCATORI NEL TORNEO
            let bracket = ['p1', 'p2', 'p3', 'p4'];
            let rrMatches = [];
            let scores = { p1: 0, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0, p7: 0, p8: 0 };

            if (gameState.gameMode === 'torneo') {
                for (let i = bracket.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [bracket[i], bracket[j]] = [bracket[j], bracket[i]];
                }
                ['p1', 'p2', 'p3', 'p4'].forEach(p => {
                    if (teams[p] && teams[p].length > 0) {
                        field[p] = teams[p].slice(0, fieldSize).map((_, i) => i);
                    }
                });
            } else if (gameState.gameMode === 'torneo_punti') {
                const joinedPlayers = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'].filter(p => gameState.players[p]);
                for (let i = 0; i < joinedPlayers.length; i++) {
                    for (let j = i + 1; j < joinedPlayers.length; j++) {
                        rrMatches.push({ pA: joinedPlayers[i], pB: joinedPlayers[j] });
                    }
                }
                rrMatches.sort(() => Math.random() - 0.5); // Mescola le partite
                
                // Manda in campo solo i due giocatori della prima partita
                [rrMatches[0].pA, rrMatches[0].pB].forEach(p => {
                    if (teams[p] && teams[p].length > 0) {
                        field[p] = teams[p].slice(0, fieldSize).map((_, i) => i);
                    }
                });
            } else if (gameState.gameMode === 'battleroyale') {
                const activeBR = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'].filter(p => gameState.players[p]);
                activeBR.forEach(p => {
                    if (teams[p] && teams[p].length > 0) {
                        field[p] = teams[p].slice(0, fieldSize).map((_, i) => i);
                    }
                });
            } else if (gameState.gameMode === 'juggernaut' || gameState.gameMode === 'survival') {
                const juggPlayer = gameState.settings.juggernautPlayer || (gameState.gameMode === 'survival' ? 'p2' : 'p1');
                const activeJugg = ['p1', 'p2', 'p3', 'p4', 'p5'].slice(0, gameState.settings.maxPlayers).filter(p => gameState.players[p]);
                activeJugg.forEach(p => {
                    if (teams[p] && teams[p].length > 0) {
                        // In Co-op i due/tre nemici sono contemporaneamente in campo.
                        // Gli umani mantengono un Multimon attivo e la riserva fuori campo.
                        const activeSlots=p===juggPlayer
                            ? (gameState.isRoguelikeCoop?teams[p].length:1):fieldSize;
                        field[p] = teams[p].slice(0,activeSlots).map((_, i) => i);
                    }
                });

                // --- APPLICAZIONE BUFF JUGGERNAUT (Solo Modalità Juggernaut) ---
                if (gameState.gameMode === 'juggernaut' && !gameState.isRoguelikeCoop && teams[juggPlayer] && teams[juggPlayer][0]) {
                    const numOpponents = Math.max(1, activeJugg.length - 1); // FIX: Assicura un valore valido
                    const jugg = teams[juggPlayer][0];
                    // Moltiplica enormemente HP per sopravvivere all'assalto combinato
                    jugg.maxHp = Math.floor(jugg.maxHp * numOpponents * 1.5); 
                    jugg.hp = jugg.maxHp;
                    // Aumenta attacco e difesa del +40% per ogni avversario extra
                    jugg.atk = Math.floor(jugg.atk * (1 + (numOpponents * 0.4)));
                    jugg.def = Math.floor(jugg.def * (1 + (numOpponents * 0.4)));
                    jugg.baseAtk = jugg.atk;
                    jugg.baseDef = jugg.def;
                    jugg.imageFilter = 'drop-shadow(0 0 30px rgba(220,38,38,1)) contrast(1.3) saturate(1.2)'; // Aura speciale potenziata
                    jugg.isJuggernaut = true; // Flag per UI e logiche boss
                    jugg.juggShieldHpThresholds = [0.75, 0.50, 0.25]; // Soglie scudo
                    jugg.juggHitsRemaining = 0; // Contatore scudo
                    jugg.shieldGrantedHits = 4; // Il Juggernaut riceve uno scudo da 4 colpi
                    jugg.juggTurnCount = 0; // Contatore turni per la purificazione passiva

                    // Aggiunta mossa esclusiva "Furia del Boss"
                    jugg.moves.push({
                        name: 'Furia del Boss',
                        type: 'Oscuro',
                        power: 40,
                        targetCount: 4,
                        cooldown: 3, // Sistema di ricarica
                        currentCooldown: 0,
                        desc: 'Un attacco esplosivo che colpisce tutti gli avversari in campo. Ricarica: 3 turni.'
                    });
                }
            } else {
                ['p1', 'p2', 'p3', 'p4'].forEach(p => {
                    if (teams[p] && teams[p].length > 0) {
                        field[p] = teams[p].slice(0, fieldSize).map((_, i) => i);
                    }
                });
            }

            let initialEvents = [];
            const gemIntro=createImperfectGemObserver(teams,field,initialEvents,applyBattleStatModifier);
            const stopGemIntro=setBattleStatGainObserver(gemIntro.onStatIncrease);
            try {

            // Imposta come "rivelati" i personaggi che entrano in campo per la prima volta
            Object.keys(field).forEach(p => {
                if (field[p]) {
                    const initialField = [...field[p]]; // Copia per non iterare sulle evocazioni appena aggiunte
                    initialField.forEach(idx => {
                        if (teams[p][idx]) {
                            teams[p][idx].revealed = true;
                            markRapidTransmutationEntry(teams[p][idx]);
                            
                            // GESTIONE ABILITÀ PASSIVE 'on_enter' (Allo start della battaglia)
                            const char = teams[p][idx];
                            if (char.passive && char.passive.type === 'on_enter' && (char.passiveUses || 0) < (char.passive.maxUses || 1)) {
                                char.passiveUses = (char.passiveUses || 0) + 1;
                                gemIntro.beginAction();
                                applyOnEnterPassive(char, p, idx, teams, field, initialEvents, gameState.gameMode, gameState.settings, gameState.isCampaignBattle);
                            }
                        }
                    });
                }
            });

            } finally { stopGemIntro(); }

            let nextState = {
              status: 'pre_battle',
              phaseStartedAt: Date.now(),
              aiMemory: {},
              battleWeather: null,
              battleTailwind: {},
              fieldTraps: {},
              fieldTrapSeen: {}, 
              teams: teams,
              field: field,
              events: initialEvents,
              // Nessuna vecchia istantanea deve interferire con gli ingressi di una nuova lotta.
              startOfTurnTeams:null,startOfTurnField:null,
              battleReport: accumulateBattleReport(createBattleReport(), teams, initialEvents, {countTurn:false}),
              healingItemsUsed: {p1:0,p2:0,p3:0,p4:0,p5:0,p6:0,p7:0,p8:0},
              turnExpiresAt: null,
              actions: { p1: {}, p2: {}, p3: {}, p4: {}, p5: {}, p6: {}, p7: {}, p8: {} },
              hyperUsed: { p1: false, p2: false, p3: false, p4: false, p5: false, p6: false, p7: false, p8: false }, // <--- AGGIUNTO PER FORMA IPER
              pendingSwitches: { p1: 0, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0, p7: 0, p8: 0 },
              switchActions: { p1: [], p2: [], p3: [], p4: [], p5: [], p6: [], p7: [], p8: [] },
              switchZodiacChoices: {p1:{},p2:{},p3:{},p4:{},p5:{},p6:{},p7:{},p8:{}},
              tournamentMatch: gameState.gameMode === 'torneo' ? 'semi1' : null,
              tournamentPhase: gameState.gameMode === 'torneo' ? 'semis' : 'semis',
              tournamentMatchStatus: { semi1: 'battling', semi2: 'battling', final: 'battling', bronze: 'battling' },
              tournamentBracket: bracket,
              roundRobinMatches: rrMatches,
              currentMatchIdx: 0,
              playerScores: scores
            };

            setCombatLog([]);
            setIsLogOpen(false);

            updateState(nextState);

            // AGGIORNAMENTO STATISTICHE: Partita e Personaggi scelti
            if (playerName.trim()) {
                updateLocalStats({ match: true });
                const myKey = Object.keys(gameState.players).find(k => gameState.players[k] === playerName);
                if (myKey && teams[myKey]) {
                    teams[myKey].forEach(c => updateLocalStats({ char: c.name }));
                }
            }
            matchStartTimeRef.current = Date.now();

            if (appMode === 'local_room' || appMode === 'vs_cpu') {
                let active = [];
                if (gameState.gameMode === 'torneo') active = [bracket[0], bracket[1], bracket[2], bracket[3]]; // In torneo sono attivi tutti e 4 all'inizio!
                else if (gameState.gameMode === 'torneo_punti') active = [rrMatches[0].pA, rrMatches[0].pB];
                else active = ['p1', 'p2', 'p3', 'p4'].slice(0, getRequiredPlayers(gameState.gameMode, gameState.settings));
                
                const humans = active.filter(p => !gameState.isBot[p]);
                if (humans.length > 0) {
                    setPlayerRole(humans[0]);
                } else {
                    setPlayerRole(active[0]);
                }
                setCommandingIdx(0);
            }
          
};

export const generateCPUActionsForPlayerImpl = (ctx,cpuPlayer,currentActions) =>
  dummyCombatLabActions(ctx.gameState,cpuPlayer) ?? generateStrategicCpuActions({
    room:ctx.gameState,player:cpuPlayer,currentActions,
    activePlayers:ctx.getActivePlayers(),
    getMultiplier:ctx.getMultiplier,
    matchOpponents:ctx.getTournamentMatchOpponents,
    roguelikeState:ctx.roguelikeState,appMode:ctx.appMode
  });

export const commitActionImpl = (ctx, actionDetails) => {
const { appMode, commandingIdx, ITEMS_DB, MOVES_DB, gameState, getActivePlayers, isSubmittingActionRef, pendingHyper, playerRole, setActionMenuMode, setCommandingIdx, setPendingHyper, setPlayerRole, setSelectedMultiTargets, setTargetingMoveIdx, updateState } = ctx;

            // Il divieto dello Zaino in Ultimon vale anche per comandi vecchi o inviati a mano.
            if (actionDetails?.type === 'use_item' && !canUseBagItems(gameState)) return;
            if (isSubmittingActionRef.current) return; // FIX: Evita che i doppi click sovrascrivano le azioni precedenti!
            isSubmittingActionRef.current = true;

            const activeCharTeamIdx = gameState.field[playerRole]?.[commandingIdx];
            if (activeCharTeamIdx === undefined) {
                isSubmittingActionRef.current = false;
                return;
            }
            const activeCommandChar = gameState.teams[playerRole]?.[activeCharTeamIdx];
            if (!activeCommandChar) {
                isSubmittingActionRef.current = false;
                return;
            }
            
            if(actionDetails.type==='use_item' && isLimitedHealingItem(ITEMS_DB[actionDetails.itemId]) &&
               onlineHealingRemaining(gameState,playerRole,appMode,ITEMS_DB)<=0){
                isSubmittingActionRef.current=false;
                return;
            }
            setSelectedMultiTargets([]);

            let myNewActions = { ...(gameState.actions[playerRole] || {}) };
            
            // Le nuove mosse Iper sono visibili in anteprima già durante la scelta:
            // convalida l'indice prima di prenotare l'azione di questo turno.
            if(actionDetails.type === 'attack' &&
                (!hyperPreviewMoves(activeCommandChar,pendingHyper,MOVES_DB)[actionDetails.moveIdx] ||
                 isMoveDisabled(activeCommandChar,
                   hyperPreviewMoves(activeCommandChar,pendingHyper,MOVES_DB)[actionDetails.moveIdx]))){
                isSubmittingActionRef.current=false;
                return;
            }
            // --- AGGIUNGE LA FORMA IPER ALL'AZIONE ---
            if (pendingHyper && actionDetails.type === 'attack') {
                actionDetails.hyperize = true;
            }
            
            myNewActions[activeCharTeamIdx] = actionDetails;

            if (actionDetails.type === 'attack') {
                const move = activeCommandChar.moves[actionDetails.moveIdx];
                if (move && move.isCombo) {
                    const partnerIds = move.isCombo.filter(id => id !== activeCommandChar.id);
                    partnerIds.forEach(pId => {
                        // FIX: Previene crash per Mossa Combinata del Giocatore se l'alleato è in bug
                        const partnerTeamIdx = gameState.field[playerRole].find(idx => gameState.teams[playerRole][idx] && gameState.teams[playerRole][idx].id === pId && gameState.teams[playerRole][idx].hp > 0);
                        if (partnerTeamIdx !== undefined) {
                            myNewActions[partnerTeamIdx] = { type: 'combo_assist' };
                        }
                    });
                }
            }

            updateState({ [`actions.${playerRole}`]: myNewActions }).then(() => {
              setTargetingMoveIdx(null);
              setActionMenuMode('moves');
              setPendingHyper(false); // <--- RESET FORMA IPER
              
              let nextIdx = commandingIdx + 1;
              while (nextIdx < gameState.field[playerRole].length) {
                  const cIdx = gameState.field[playerRole][nextIdx];
                  if (!myNewActions[cIdx] && gameState.teams[playerRole][cIdx].hp > 0) {
                      break;
                  }
                  nextIdx++;
              }

              if (nextIdx < gameState.field[playerRole].length) {
                setCommandingIdx(nextIdx);
              } else {
                if (appMode === 'local_room') {
                    const active = getActivePlayers().filter(p => !gameState.isBot[p] && gameState.field[p] && gameState.field[p].length > 0);
                    const currIdx = active.indexOf(playerRole);
                    if (currIdx !== -1 && currIdx < active.length - 1) {
                        setPlayerRole(active[currIdx + 1]);
                        setCommandingIdx(0);
                    } else {
                        setCommandingIdx(-1);
                    }
                } else {
                  setCommandingIdx(-1);
                }
              }
            }).catch(e => console.error(e)).finally(() => {
                isSubmittingActionRef.current = false; // Sblocca SEMPRE per il prossimo personaggio o in caso di errore
            });
          
};

export const handleSelectMoveTargetImpl = (ctx, targetPlayer, targetFieldIdx) => {
const { commandingIdx, commitAction, gameState, getActivePlayers, getTournamentMatchOpponents, MOVES_DB, pendingHyper, playerRole, selectedMultiTargets, setSelectedMultiTargets, targetingMoveIdx } = ctx;

            const activeCharTeamIdx = gameState.field[playerRole]?.[commandingIdx];
            if (activeCharTeamIdx === undefined) return;
            const activeCommandChar = gameState.teams[playerRole]?.[activeCharTeamIdx];
            if (!activeCommandChar) return;
            
            const move = hyperPreviewMoves(activeCommandChar,pendingHyper,MOVES_DB)[targetingMoveIdx];
            if (!move) return;
            
            const targetCount = move.targetCount || 1;
            
            if (targetCount === 1) {
                // SELEZIONE SINGOLA CLASSICA
                commitAction({
                    type: 'attack',
                    moveIdx: targetingMoveIdx,
                    targetPlayer,
                    targetIdx: gameState.field[targetPlayer][targetFieldIdx],
                    targetFieldIdx: targetFieldIdx
                });
                return;
            }

            // SELEZIONE MULTIPLA MANUALE (2 o 3 bersagli)
            const isAlreadySelected = selectedMultiTargets.some(t => t.player === targetPlayer && t.fieldIdx === targetFieldIdx);
            if (isAlreadySelected) return; // Ignora doppio click sullo stesso

            const newTarget = {
                player: targetPlayer,
                fieldIdx: targetFieldIdx,
                idx: gameState.field[targetPlayer][targetFieldIdx]
            };

            const updatedTargets = [...selectedMultiTargets, newTarget];

            // Conta nemici vivi per sapere quando fermarsi
            const activeMatchPlayers = getActivePlayers();
            let enemyTeams = [];
            if (gameState.gameMode === 'ultimon') {
                enemyTeams = activeMatchPlayers.filter(p => p !== playerRole);
            } else if (gameState.gameMode === 'multipla') {
                enemyTeams = ['p1', 'p2'].includes(playerRole) ? ['p3', 'p4'] : ['p1', 'p2'];
            } else if (gameState.gameMode === 'juggernaut' || gameState.gameMode === 'survival') {
                const juggPlayer = gameState.settings.juggernautPlayer || (gameState.gameMode === 'survival' ? 'p2' : 'p1');
                enemyTeams = playerRole === juggPlayer ? activeMatchPlayers.filter(p => p !== juggPlayer) : [juggPlayer];
            } else if (gameState.gameMode === 'torneo') {
                enemyTeams = getTournamentMatchOpponents(playerRole);
            } else if (gameState.gameMode === 'torneo_punti') {
                enemyTeams = [activeMatchPlayers.find(p => p !== playerRole)];
            } else if (gameState.gameMode === 'battleroyale') {
                enemyTeams = activeMatchPlayers.filter(p => p !== playerRole);
            } else {
                enemyTeams = [playerRole === 'p1' ? 'p2' : 'p1'];
            }

            let aliveEnemies = 0;
            enemyTeams.forEach(ep => {
                if (ep && gameState.field[ep]) {
                    gameState.field[ep].forEach(idx => {
                        if (gameState.teams[ep][idx].hp > 0) aliveEnemies++;
                    });
                }
            });

            const neededTargets = Math.min(targetCount, aliveEnemies);

            if (updatedTargets.length >= neededTargets) {
                commitAction({
                    type: 'attack',
                    moveIdx: targetingMoveIdx,
                    selectedTargets: updatedTargets
                });
            } else {
                setSelectedMultiTargets(updatedTargets);
            }
          
};

export const checkTurnReadyImpl = (ctx, currentActions) => {
const { appMode, calculateTurn, gameState, getActivePlayers, playerRole } = ctx;

            if (appMode === 'online_room' && playerRole !== 'p1') return; 
            
            const activePlayers = getActivePlayers();
            let allReady = true;
            activePlayers.forEach(p => {
                const fieldCount = gameState.field[p].length;
                if (Object.keys(currentActions[p]).length < fieldCount) allReady = false;
            });

            if (allReady) {
              calculateTurn(currentActions);
            }
          
};

export const calculateDamageImpl = (ctx, attacker, defender, move, multiplier, isFirstAttackOfTurn = false, random = Math.random) => {

            let pwr = move.power * getHeldPowerFactor(attacker, move) * offensiveHeldFactor(attacker,defender,move);
            if (attacker.passive?.type === 'ghost_rockstar' && move.type === 'Suono') pwr *= 1.25;
            pwr *= qilinDamageFactor(attacker,move);
            if (move.speedScaling) pwr += Math.floor(attacker.spd / 3);
            
            // --- GESTIONE PASSIVE: POTENZIAMENTO MOSSE ---
            if (attacker.passive && attacker.passive.boostMoveType && attacker.passive.boostMoveType.type === move.type) {
                pwr = Math.floor(pwr * attacker.passive.boostMoveType.multiplier);
            }
            if (attacker.passive && attacker.passive.type === 'first_strike_bonus' && isFirstAttackOfTurn) {
                pwr = Math.floor(pwr * attacker.passive.damageBonus);
            }
            if (attacker.passive && attacker.passive.type === 'global_damage_boost') {
                pwr = Math.floor(pwr * attacker.passive.multiplier);
            }
            
            // PASSIVA YOSHI (Buff In Groppa)
            if (attacker.statuses?.some(s => s.type === 'In_Groppa')) {
                pwr = Math.floor(pwr * 1.25);
            }
            // ---------------------------------------------
            
            const defenseStat = move.special && Number.isFinite(defender.spDef) ? defender.spDef : defender.def;
            const originalDef = move.special && Number.isFinite(defender.baseSpDef) ? defender.baseSpDef : defender.baseDef;
            let defValue = move.ignoreDefBuffs && defenseStat > originalDef ? originalDef : defenseStat;
            defValue = Math.max(1, (defValue || 1)*strawHatDefenseFactor(attacker,move));
            
            // Supporto selettivo alle mosse speciali senza alterare le mosse già esistenti.
            const attackValue = move.special && Number.isFinite(attacker.spAtk) ? attacker.spAtk : attacker.atk;

            // FORMULA BILANCIATA: Divisore aumentato da 50 a 85 per ridurre i danni globali del ~40%
            // In questo modo si evitano i "one-shot" e gli scontri diventano più lunghi e strategici
            const baseDamage = ((2 * 50 / 5 + 2) * pwr * (attackValue / defValue)) / 85 + 2;
            const randomFactor = (Math.floor(random() * 16) + 85) / 100;
            const weakenFactor = (attacker.statuses?.some(s => s.type === 'Indebolito') ? 0.75 : 1) * assideramentoDamageFactor(attacker);
            // Scudo Team assorbe il 45% dei danni: resta il 55% (salvo mosse ignora-scudi).
            const teamDefFactor = !ignoresShields(attacker,move) && defender.statuses?.some(s => s.type === 'Scudo Team') ? 0.55 : 1;

            // STAB (Same-Type Attack Bonus): Danno aumentato del 50% se il tipo mossa coincide con il tipo attaccante
            const stabFactor = attacker.types.includes(move.type) ? 1.5 : 1;
            const enchantedDamageFactor = incomingRockEnchantmentFactor(attacker);
            const fasterTargetBonus = move.bonusAgainstFaster && defender.spd > attacker.spd ? move.bonusAgainstFaster : 1;

            return Math.max(1, Math.floor(baseDamage * randomFactor * multiplier * weakenFactor * teamDefFactor * stabFactor * enchantedDamageFactor * getMahitoMultiplier(attacker, defender, move) * fasterTargetBonus * (defender.passive?.type === 'petrosapien_armor' ? 1 - (defender.passive.damageReduction ?? 0.2) : 1) * (attacker.refractionTurns > 0 && move.type === 'Cristallo' ? 1.2 : 1) * outgoingPassiveDamageFactor(attacker,defender,move) * selectedPassiveDamageFactor(attacker,defender,move) * rogueDamageFactor(attacker,multiplier)));
          
};

export const calculateTurnImpl = (ctx, currentActions) => {
const { CHARACTERS, FUSION_CHARACTERS, ITEMS_DB, MOVES_DB, appMode, calculateDamage: calculateRawDamage, gameState, getActivePlayers, getMultiplier, getTournamentMatchOpponents, playerName, updateLocalStats, updateState } = ctx;

            let events = [];
            const publicMovesForAi=[];
            // Salvataggio stato d'inizio turno per garantire la suspense visiva
            const startOfTurnTeams = JSON.parse(JSON.stringify(gameState.teams));
            const startOfTurnField = JSON.parse(JSON.stringify(gameState.field));
            
            let workingTeams = JSON.parse(JSON.stringify(gameState.teams));
            let workingField = JSON.parse(JSON.stringify(gameState.field));
            const applyEchoMidpointReset=()=>{
              if(!gameState.isEchoFinalBattle || (gameState.echoFinalStage||'raid')!=='raid')return;
              const index=workingTeams.p2?.findIndex(c=>c?.id==='echomax'&&c.isEchoRaidBoss)??-1;
              if(index<0)return;
              // Importante per i salvataggi precedenti: registra i guardiani
              // originali già KO PRIMA dell'eventuale richiamo al 35%.
              syncEchoOriginalSoulDefeats(workingTeams.p2,events);
              triggerEchoRaidHalfReset({isEchoFinalBattle:true,boss:workingTeams.p2[index],
                heroes:workingTeams.p1,events,bossIndex:index});
              // Il 35% richiama una sola anima (anche da un checkpoint vecchio).
              triggerEchoSoulRecall({
                isEchoFinalBattle:true,stage:gameState.echoFinalStage||'raid',
                teams:workingTeams,field:workingField,events,
                fieldSize:gameState.settings?.fieldSize||6
              });
            };
            // Anche le battaglie iniziate con una versione precedente possono
            // raggiungere la soglia senza perdere i propri progressi.
            applyEchoMidpointReset();
            const gemObserver=createImperfectGemObserver(workingTeams,workingField,events,applyBattleStatModifier);
            const nightwingObserver=createNightwingBuffWatcher(workingTeams,workingField,
              {gameMode:gameState.gameMode,settings:gameState.settings,
                isRoguelikeCoop:gameState.isRoguelikeCoop},events);
            const stopGemObserver=setBattleStatGainObserver((source,stat,before,after,base)=>{
              gemObserver.onStatIncrease(source,stat,before,after,base);
              nightwingObserver.onStatGain(source,stat,before,after);
            });
            try {
            let workingInventory = JSON.parse(JSON.stringify(gameState.inventory));
            const workingHealingItemsUsed={...(gameState.healingItemsUsed||{})};
            let rogueDawnUsed=Boolean(gameState.rogueDawnUsed);
            let workingHyperUsed = JSON.parse(JSON.stringify(gameState.hyperUsed || {})); // <--- AGGIUNTO PER FORMA IPER
            // Meteo condiviso: si salva nello stato partita, non sul singolo personaggio.
            let workingWeather = gameState.battleWeather ? {...gameState.battleWeather} : null;
            let workingTailwind={...(gameState.battleTailwind||{})};
            // Il turno in cui si usa Aura Glaciale non consuma Tailwind: la coda di iniziativa
            // è già stata calcolata, quindi i cinque turni di beneficio iniziano dal prossimo.
            const tailwindJustActivated=new Set();
            // Il meteo influenza TUTTE le mosse che infliggono danno, anche
            // quelle eseguite più tardi nello stesso turno in cui nasce la Tempesta.
            let heatBurstActive=false;
            const calculateDamage=(...args)=>{
                const base=calculateRawDamage(...args);
                return Math.max(1,Math.floor(base*weatherMoveFactor(args[2],workingWeather)*
                  namiClimateFactor(args[0],args[2],workingWeather)*
                  flameMoveDamageFactor(args[0],args[2],heatBurstActive)*
                  newcomerDamageFactor(args[0],args[1],args[2])));
            };
            let workingFieldTraps = {...(gameState.fieldTraps||{})};
            let workingTrapSeen = JSON.parse(JSON.stringify(gameState.fieldTrapSeen||{}));
            const activeMatchPlayers = getActivePlayers();

            const handleFaint = (targetPlayer, targetIdx) => {
              const char = workingTeams[targetPlayer]?.[targetIdx];
              if (!char) return; // FIX: Se è già stato rimosso per errore evita il crash
              if(char.echoFaintProcessed)return;
              char.echoFaintProcessed=true;
              events.push({ text: `${char.name} è esausto!`, type: 'faint' });
              if(gameState.isEchoFinalBattle&&char.isEchoCorruptedSoul)
                  echoCorruptedSoulReleased(char,events);
              if(gameState.isEchoFinalBattle&&char.isEchoSoulGuardian){
                  // Solo il KO del guardiano iniziale conta per sbloccare
                  // il Cataclisma: le copie e i richiami sono esclusi.
                  if(targetPlayer==='p2'){
                    const raidBoss=workingTeams.p2?.find(c=>c?.id==='echomax'&&c.isEchoRaidBoss);
                    recordEchoOriginalSoulDefeat(raidBoss,char,events);
                  }
                  events.push({type:'text',text:'💠 '+char.name+
                    ' è stata liberata dal controllo di Echomax!'});
                  for(const [speaker,line] of echoSoulReleaseDialogue(char.id))
                      events.push({type:'text',text:'🎭 '+speaker+': «'+line+'»'});
              }
              // La Legione di Echomax si attiva una sola volta per KO nemico.
              collectEchoSoul(workingTeams,workingField,char,targetPlayer,events,
                  {gameMode:gameState.gameMode,settings:gameState.settings});
              
              // --- RIMOZIONE STATUS IN_GROPPA SE YOSHI MUORE ---
              activeMatchPlayers.forEach(pAlly => {
                  if (workingTeams[pAlly]) {
                      workingTeams[pAlly].forEach((cAlly, aIdx) => {
                          if (cAlly && cAlly.hp > 0 && cAlly.statuses) {
                              const groppaIdx = cAlly.statuses.findIndex(s => s.type === 'In_Groppa' && s.protectorIdx === targetIdx && s.protectorPlayer === targetPlayer);
                              if (groppaIdx !== -1) {
                                  cAlly.statuses.splice(groppaIdx, 1);
                                  events.push({ type: 'text', text: `🦕 ${char.name} è andato K.O.! ${cAlly.name} scende dalla sua groppa.` });
                                  updateStatusUI(pAlly, aIdx);
                              }
                          }
                      });
                  }
              });
              // ------------------------------------------------
              
              char.atk = char.baseAtk;
              char.def = char.baseDef;
              char.spd = char.baseSpd;
              char.acc = 1.0;
              char.consecutiveProtect = 0;
              char.statuses = [];
              
              const deadFieldPos = workingField[targetPlayer].indexOf(targetIdx);
              if (deadFieldPos !== -1) {
                  // Rimuove il personaggio morto dal campo. Verrà innescata la fase di Sostituzione Manuale a fine turno
                  workingField[targetPlayer].splice(deadFieldPos, 1);
                  events.push({ type: 'remove', player: targetPlayer, pos: deadFieldPos });
              }

              // --- NUOVA LOGICA: PASSIVA ON_ALLY_FAINT (Es. Zatch Bell) ---
              let myTeamPlayers = [targetPlayer];
              if (gameState.gameMode === 'multipla') {
                  myTeamPlayers = ['p1', 'p2'].includes(targetPlayer) ? ['p1', 'p2'] : ['p3', 'p4'];
              } else if (gameState.gameMode === 'juggernaut' || gameState.gameMode === 'survival') {
                  const juggPlayer = gameState.settings.juggernautPlayer || (gameState.gameMode === 'survival' ? 'p2' : 'p1');
                  if (targetPlayer !== juggPlayer) {
                      myTeamPlayers = activeMatchPlayers.filter(p => p !== juggPlayer);
                  }
              }

              myTeamPlayers.forEach(pAlly => {
                  if (workingField[pAlly]) {
                      workingField[pAlly].forEach(aIdx => {
                          const ally = workingTeams[pAlly][aIdx];
                          if (ally && ally.hp > 0 && ally.passive && ally.passive.type === 'on_ally_faint' && !(pAlly === targetPlayer && aIdx === targetIdx)) {
                              if (ally.passive.statBuff) {
                                  let statTexts = [];
                                  if (ally.passive.statBuff.atk) { applyBattleStatModifier(ally, 'atk', ally.passive.statBuff.atk); statTexts.push("Attacco"); }
                                  if (ally.passive.statBuff.def) { applyBattleStatModifier(ally, 'def', ally.passive.statBuff.def); statTexts.push("Difesa"); }
                                  if (ally.passive.statBuff.spd) { applyBattleStatModifier(ally, 'spd', ally.passive.statBuff.spd); statTexts.push("Velocità"); }
                                  events.push({ type: 'text', text: `⚡ Il sacrificio di un alleato ispira ${ally.name}! Attiva "${ally.passive.name}": ${statTexts.join(" e ")} aumenta!`, isPassive: true, passiveChar: ally.name, passiveName: ally.passive.name });
                              }
                          }
                      });
                  }
              });
              // ------------------------------------------------------------
            };

            const applyDamage = (target, dmg, targetPlayer, targetIdx, text, options = {}) => {
                if (dmg > 0 && options.directAttack && !options.bypassShields) {
                    const defense = directHitAfterCrystalDefense(target, dmg);
                    dmg = defense.damage;
                    if (defense.refracted) events.push({type:'text',text:`💎 Rifrazione di ${target.name}: il primo attacco del turno viene dimezzato!`});
                    if (defense.absorbed) events.push({type:'text',text:`🛡️ Lo scudo cristallino di ${target.name} assorbe ${defense.absorbed} danni! (${target.crystalShieldHp||0} scudo rimasto)`});
                    if (dmg <= 0) {
                        events.push({type:'text',text:`🛡️ ${target.name} non perde PS grazie alle difese cristalline!`});
                        return;
                    }
                }

                if(dmg>0 && options.directAttack){
                    const guard=reduceGuardPointDamage(target,dmg);
                    dmg=guard.damage;
                    if(guard.activated)events.push({type:'text',text:'🛡️ Guard Point di '+target.name+': il colpo infligge il 20% di danni in meno!'});
                    const reduced=reduceIncomingHeldDamage(target,dmg,{
                      directAttack:true,superEffective:!!options.superEffective
                    });
                    dmg=reduced.damage;
                    for(const item of reduced.activations)
                      events.push({type:'text',text:`🛡️ ${item} protegge ${target.name}!`});
                }
                const hpBeforeDamage=target.hp;
                let willSurvive = false;
                if(useHeroSash(target,dmg,options)){
                    willSurvive=true;
                    events.push({type:'text',text:`🎗️ Fascia dell'Eroe: ${target.name} resiste con 1 PS!`});
                } else
                // --- NUOVA LOGICA: PASSIVA SOPRAVVIVENZA KO (Es. Carlos, Cuore di Pietra) ---
                if (target.hp - dmg <= 0 && target.passive && target.passive.type === 'survive_ko' && (target.passiveUses || 0) < (target.passive.maxUses || 1)) {
                    target.passiveUses = (target.passiveUses || 0) + 1;
                    target.hp = 1;
                    willSurvive = true;
                } else if (dmg > 0 && target.hp > 0 && target.hp - dmg <= 0 &&
                    !rogueDawnUsed && gameState.rogueRelics?.includes('dawn') &&
                    ((gameState.isRoguelikeBattle && targetPlayer === 'p1') ||
                     (gameState.isRoguelikeCoop && ['p1','p2','p3'].includes(targetPlayer)))) {
                    // Una sola rinascita per l'intera squadra e per battaglia.
                    rogueDawnUsed = true;
                    target.hp = Math.max(1,Math.floor(target.maxHp*0.2));
                    events.push({type:'text',text:'🪶 Piuma della Seconda Alba! '+target.name+
                        ' sfugge al colpo fatale e torna al 20% dei PS!'});
                } else {
                    target.hp = Math.max(0, target.hp - dmg);
                }
                
                if(options.directAttack && target.hp>0 && dmg>0 &&
                   survivedBarrelHits(target,options.directHits??1)){
                    applyBattleStatModifier(target,'spd',1.75);
                    events.push({type:'text',text:`🛢️ BARILE PIMPANTE! ${target.name} ha resistito a 4 colpi: il barile si rompe e la melma aumenta la Velocità del 75% fino alla fine della lotta!`});
                }
                target.damageTakenThisTurn = (target.damageTakenThisTurn || 0) + dmg;
                events.push({ type: 'damage', text: text, targetPlayer, targetIdx, newHp: target.hp });
                if(targetPlayer==='p2' && target.id==='echomax' && target.isEchoRaidBoss)
                    applyEchoMidpointReset();
                if(options.isEnemyTarget && (options.directAttack||options.isOffensiveMove) &&
                   hpBeforeDamage>target.hp && target.hp>0){
                  const titans=activateTitansRobin(target,applyBattleStatModifier);
                  if(titans){
                    events.push({type:'text',
                      text:'🦸 '+target.name+' attiva Titans, a rapporto! +10% '+
                        titans.statName+' ('+titans.uses+'/4)',
                      isPassive:true,passiveChar:target.name,passiveName:target.passive.name});
                  }
                }
                // Morso Vampirico cura in base ai PS REALMENTE persi dal
                // bersaglio, non alla potenza teorica o ai colpi assorbiti.
                // Vale anche sugli attacchi multibersaglio; mai su meteo,
                // riflessi, contraccolpo o danni inflitti a un alleato.
                if(options.isEnemyTarget && (options.directAttack||options.isOffensiveMove) &&
                   options.attacker && options.attacker!==target){
                  const gained=healFromVampiricBite(options.attacker,
                    Math.max(0,hpBeforeDamage-target.hp));
                  if(gained>0)events.push({type:'damage',targetPlayer:options.attackerPlayer,
                    targetIdx:options.attackerIdx,newHp:options.attacker.hp,
                    text:'🩸 Morso Vampirico: '+options.attacker.name+' assorbe '+gained+' PS!'});
                }
                // Cuore di Magma si attiva solo dopo un vero danno fisico: non
                // reagisce a meteo, scottature, autolesioni o colpi bloccati.
                if(hpBeforeDamage>target.hp && dmg>0 && options.directAttack && options.isEnemyTarget &&
                   tryMagmaHeartBurn(target,options.attacker,options.move)){
                    events.push({type:'status_update',targetPlayer:options.attackerPlayer,
                      targetIdx:options.attackerIdx,
                      statuses:JSON.parse(JSON.stringify(options.attacker.statuses)),
                      text:'🔥 '+target.name+' attiva Cuore di Magma: '+options.attacker.name+' è Scottato!',
                      isPassive:true,passiveChar:target.name,passiveName:target.passive.name});
                }
                if(hpBeforeDamage>target.hp && (options.directAttack||options.isOffensiveMove) && options.isEnemyTarget){
                  if(tryCursedBody(target,options.attacker,options.move)){
                    events.push({type:'status_update',targetPlayer:options.attackerPlayer,
                      targetIdx:options.attackerIdx,
                      statuses:JSON.parse(JSON.stringify(options.attacker.statuses)),
                      text:'👻 Corpo Funesto di '+target.name+': '+options.attacker.name+
                        ' non può usare '+options.move.name+' per 3 turni!',
                      isPassive:true,passiveChar:target.name,passiveName:target.passive.name});
                  }
                  if(tryBerryChill(options.attacker,target,options.move) &&
                     applyBattleStatModifier(target,'spd',0.85)){
                    events.push({type:'text',text:'🍦 Dolce Freddo di '+options.attacker.name+
                      ' rallenta '+target.name+': Velocità −15%!',
                      isPassive:true,passiveChar:options.attacker.name,
                      passiveName:options.attacker.passive.name});
                  }
                }
                const sproutHeal=activateHealingSprout(target);
                if(activateHourglass(target))
                    events.push({type:'text',text:`⌛ Clessidra della Rapidità di ${target.name}: Velocità +20% fino alla fine dello scontro!`});
                if(hpBeforeDamage>=target.maxHp*.25 && target.hp>0 && target.hp<target.maxHp*.25){
                    const alliedPlayers=gameState.gameMode==='multipla'
                      ? (['p1','p2'].includes(targetPlayer)?['p1','p2']:['p3','p4'])
                      : [targetPlayer];
                    const allies=alliedPlayers.flatMap(p=>(workingField[p]||[])
                      .map(idx=>workingTeams[p]?.[idx]).filter(Boolean));
                    const bearer=activateRescueBell(allies,target);
                    if(bearer)events.push({type:'text',text:`🔔 Campanella del Soccorso di ${bearer.name}: ${target.name} riceve uno scudo contro il prossimo attacco!`});
                }
                if(sproutHeal)events.push({type:'damage',targetPlayer,targetIdx,newHp:target.hp,
                   text:`🌱 Germoglio Curativo di ${target.name}: recupera ${sproutHeal} PS! (Attivazione unica)`});
                
                if (willSurvive) {
                    events.push({ type: 'text', text: `🛡️ ${target.name} stringe i denti! Resiste al colpo fatale grazie a "${target.passive.name}" e resta con 1 PS!`, isPassive: true, passiveChar: target.name, passiveName: target.passive.name });
                }
                
                if (target.isRoguelikeBoss) {
                    const shield = activateRoguelikeBossShield(target, target.hp);
                    if (shield) events.push(createRaidShieldUpdateEvent(
                        targetPlayer, targetIdx, shield.hits,
                        `🛡️ ${target.name} raggiunge il ${shield.thresholdPercent}% di PS e attiva uno scudo da ${shield.hits} colpi!`, true));
                } else if (target.juggShieldHpThresholds && target.juggShieldHpThresholds.length > 0) {
                    let thresholdTriggered = false;
                    while (target.juggShieldHpThresholds.length > 0 && (target.hp / target.maxHp) <= target.juggShieldHpThresholds[0]) {
                        target.juggShieldHpThresholds.shift();
                        thresholdTriggered = true;
                    }
                    if (thresholdTriggered) {
                        const hitsToGrant = target.shieldGrantedHits || 4;
                        target.juggHitsRemaining = hitsToGrant;
                        events.push(createRaidShieldUpdateEvent(targetPlayer,targetIdx,hitsToGrant, `💥 ${target.name} si infuria! Uno Scudo Assoluto assorbirà i prossimi ${hitsToGrant} colpi! 💥`, true));
                    }
                }

                // --- NUOVA LOGICA: RESURREZIONE CELL JR ---
                if (target.id === 'cell' && target.hp > 0 && target.hp <= target.maxHp * 0.25 && !target.cellJrResurrected && gameState.isCampaignBattle) {
                    target.cellJrResurrected = true;
                    events.push({ type: 'text', text: `✨ Cell: "Maledetti! Pensavate fosse finita?! Risorgete, figli miei!"` });
                    
                    workingTeams[targetPlayer].forEach((c, idx) => {
                        if (c.id.startsWith('celljr_')) {
                            if (c.hp <= 0) {
                                c.hp = c.maxHp;
                                c.statuses = [];
                                events.push({ type: 'damage', text: `${c.name} viene rigenerato dalla forza vitale di Cell!`, targetPlayer: targetPlayer, targetIdx: idx, newHp: c.hp });
                                
                                if (!workingField[targetPlayer].includes(idx)) {
                                    workingField[targetPlayer].push(idx);
                                    events.push({ type: 'revive_to_field', player: targetPlayer, targetIdx: idx });
                                }
                            }
                        }
                    });
                }
                // ------------------------------------------

                // --- GESTIONE PASSIVE: SOTTO SOGLIA HP (es. Barry, Chat Noir) ---
                if (target.hp > 0 && target.passive && target.passive.type === 'on_hp_threshold' && (target.passiveUses || 0) < (target.passive.maxUses || 1)) {
                    if ((target.hp / target.maxHp) <= target.passive.threshold) {
                        target.passiveUses = (target.passiveUses || 0) + 1;
                        
                        if (target.passive.statBuff) {
                            let statTexts = [];
                            if (target.passive.statBuff.atk) { applyBattleStatModifier(target, 'atk', target.passive.statBuff.atk); statTexts.push("Attacco"); }
                            if (target.passive.statBuff.def) { applyBattleStatModifier(target, 'def', target.passive.statBuff.def); statTexts.push("Difesa"); }
                            if (target.passive.statBuff.spd) { applyBattleStatModifier(target, 'spd', target.passive.statBuff.spd); statTexts.push("Velocità"); }
                            events.push({ type: 'text', text: `🔥 ${target.name} attiva ${target.passive.name}! Aumenta ${statTexts.join(" e ")}!`, isPassive: true, passiveChar: target.name, passiveName: target.passive.name });
                        }

                        // Cyborg conserva la precedente scarica di Malfunzionamento,
                        // ma lo Scudo Anti-Magia blocca gli effetti negativi
                        // prodotti da passive nemiche.
                        if(target.passive.aoeDamagePercentMaxHp){
                            const enemies=affectedOpponents(targetPlayer,gameState.gameMode,
                              activeMatchPlayers,getTournamentMatchOpponents,gameState.settings);
                            for(const ep of enemies)for(const eIdx of workingField[ep]||[]){
                                const enemy=workingTeams[ep]?.[eIdx];
                                if(!enemy||enemy.hp<=0)continue;
                                if(blockedEnemyPassive(enemy)){
                                    events.push({type:'text',text:`🛡️ ${enemy.name} evita la scarica di ${target.name} grazie allo Scudo Anti-Magia!`});
                                    continue;
                                }
                                const passiveDmg=Math.max(1,Math.floor(enemy.maxHp*target.passive.aoeDamagePercentMaxHp));
                                applyDamage(enemy,passiveDmg,ep,eIdx,
                                  `⚡ ${target.name} attiva ${target.passive.name}: ${enemy.name} perde ${passiveDmg} PS!`);
                            }
                        }

                        // AGGIUNTO: GESTIONE PURIFICAZIONE STATUS (es. Zazan - Corazza Mutante)
                        if (target.passive.removeNegativeStatuses) {
                            const negatives = ['Avvelenato', 'Scottato', 'Elettrizzato', 'Congelato', 'Addormentato', 'Confuso', 'Indebolito', 'Stordito', 'Accecato', 'Incantato', 'Anima Distorta', 'Assiderato'];
                            const originalLength = target.statuses.length;
                            target.statuses = target.statuses.filter(s => !negatives.includes(s.type));
                            
                            if (target.statuses.length < originalLength) {
                                events.push({ type: 'text', text: `✨ ${target.name} purifica il suo corpo da tutti gli status negativi!`, isPassive: true, passiveChar: target.name, passiveName: target.passive.name });
                                events.push({ type: 'status_update', targetPlayer: targetPlayer, targetIdx: targetIdx, statuses: JSON.parse(JSON.stringify(target.statuses)) });
                            }
                        }

                        if (target.passive.resetEnemyBuffs) {
                            events.push({ type: 'text', text: `🐾 ${target.name} attiva ${target.passive.name}! I potenziamenti degli avversari in campo vengono azzerati!`, isPassive: true, passiveChar: target.name, passiveName: target.passive.name });
                            
                            let enemyPlayers = [];
                            if (gameState.gameMode === 'multipla') {
                                enemyPlayers = ['p1', 'p2'].includes(targetPlayer) ? ['p3', 'p4'] : ['p1', 'p2'];
                            } else if (gameState.gameMode === 'juggernaut') {
                                const juggPlayer = gameState.settings.juggernautPlayer || 'p1';
                                enemyPlayers = targetPlayer === juggPlayer ? activeMatchPlayers.filter(p => p !== juggPlayer) : [juggPlayer];
                            } else {
                                const pKeys = Object.keys(workingField).filter(k => workingField[k].length > 0);
                                enemyPlayers = pKeys.filter(k => k !== targetPlayer);
                            }

                            enemyPlayers.forEach(ep => {
                                if (workingField[ep]) {
                                    workingField[ep].forEach(eIdx => {
                                        const enemy = workingTeams[ep][eIdx];
                                        if (enemy && enemy.hp > 0 && !blockedEnemyPassive(enemy)) {
                                            if (enemy.atk > enemy.baseAtk) enemy.atk = enemy.baseAtk;
                                            if (enemy.def > enemy.baseDef) enemy.def = enemy.baseDef;
                                            if (enemy.spd > enemy.baseSpd) enemy.spd = enemy.baseSpd;
                                        }
                                    });
                                }
                            });
                        }

                        // AGGIUNTO: GESTIONE EVOCAZIONI SOTTO SOGLIA HP (es. Charmcaster - Evocazione Suprema)
                        if (target.passive.isSummon) {
                            const summonIds = Array.isArray(target.passive.isSummon) ? target.passive.isSummon : [target.passive.isSummon];
                            let summonedNames = [];
                            summonIds.forEach(summonId => {
                                const baseChar = CHARACTERS.find(c => c.id === summonId);
                                if (baseChar) {
                                    const newSummon = {
                                        ...JSON.parse(JSON.stringify(baseChar)), statuses: [], consecutiveProtect: 0,
                                        baseAtk: baseChar.atk, baseDef: baseChar.def, baseSpd: baseChar.spd
                                    };
                                    newSummon.moves.forEach(m => { if (m.maxUses !== undefined) m.remainingUses = m.maxUses; });
                                    workingTeams[targetPlayer].push(newSummon);
                                    const newCharTeamIdx = workingTeams[targetPlayer].length - 1;
                                    workingField[targetPlayer].push(newCharTeamIdx);
                                    summonedNames.push(newSummon.name);
                                    events.push({ type: 'summon', text: ``, player: targetPlayer, newChar: JSON.parse(JSON.stringify(newSummon)), fieldIdx: newCharTeamIdx, isPassive: true, passiveChar: target.name, passiveName: target.passive.name });
                                }
                            });
                            if (summonedNames.length > 0) {
                                events.push({ type: 'text', text: `✨ ${target.name} attiva ${target.passive.name} ed evoca ${summonedNames.join(' e ')}!`, isPassive: true, passiveChar: target.name, passiveName: target.passive.name });
                            }
                        }
                    }
                }

                // --- GESTIONE PASSIVE: ALLA SCONFITTA (es. Bloom, Dolli) ---
                if (target.hp === 0 && !target.echoSoulPermanentDefeat && target.passive && target.passive.type === 'on_faint' && (target.passiveUses || 0) < (target.passive.maxUses || 1)) {
                    target.passiveUses = (target.passiveUses || 0) + 1;
                    
                    if (target.passive.reviveHpPercent) {
                        target.hp = Math.max(1, Math.floor(target.maxHp * target.passive.reviveHpPercent));
                        target.statuses = []; // Rimuove status negativi alla rinascita
                        events.push({ type: 'damage', text: `✨ ${target.name} attiva ${target.passive.name} e rinasce dalle proprie ceneri!`, targetPlayer, targetIdx, newHp: target.hp, isPassive: true, passiveChar: target.name, passiveName: target.passive.name });
                    }
                    
                    if (target.passive.applyStatusToTeam) {
                        let myTeamPlayers = [targetPlayer];
                        if (gameState.gameMode === 'multipla') {
                            myTeamPlayers = ['p1', 'p2'].includes(targetPlayer) ? ['p1', 'p2'] : ['p3', 'p4'];
                        } else if (gameState.gameMode === 'juggernaut' || gameState.gameMode === 'survival') {
                            const juggPlayer = gameState.settings.juggernautPlayer || (gameState.gameMode === 'survival' ? 'p2' : 'p1');
                            if (targetPlayer !== juggPlayer) {
                                myTeamPlayers = activeMatchPlayers.filter(p => p !== juggPlayer);
                            }
                        }
                        
                        let applied = false;
                        myTeamPlayers.forEach(pAlly => {
                            if (workingField[pAlly]) {
                                workingField[pAlly].forEach(aIdx => {
                                    const ally = workingTeams[pAlly][aIdx];
                                    if (ally && ally.hp > 0 && !(pAlly === targetPlayer && aIdx === targetIdx)) {
                                        const sType = target.passive.applyStatusToTeam.type;
                                        const existingIdx = ally.statuses.findIndex(s => s.type === sType);
                                        if (existingIdx === -1) {
                                            ally.statuses.push({ type: sType, turns: target.passive.applyStatusToTeam.turns });
                                        } else {
                                            ally.statuses[existingIdx].turns = target.passive.applyStatusToTeam.turns;
                                        }
                                        updateStatusUI(pAlly, aIdx);
                                        applied = true;
                                    }
                                });
                            }
                        });
                        
                        if (applied) {
                            events.push({ type: 'text', text: `🎀 ${target.name} viene sconfitta, ma attiva ${target.passive.name}! Il team riceve ${target.passive.applyStatusToTeam.type}!`, isPassive: true, passiveChar: target.name, passiveName: target.passive.name });
                        }
                    }
                }

                if (target.hp === 0) handleFaint(targetPlayer, targetIdx);
            };

            const updateStatusUI = (player, idx) => {
                events.push({ type: 'status_update', targetPlayer: player, targetIdx: idx, statuses: JSON.parse(JSON.stringify(workingTeams[player][idx].statuses)) });
            };

            // --- 1. PRE-PASS: ELABORAZIONE FORMA IPER (Avviene istantaneamente PRIMA di calcolare l'iniziativa) ---
            activeMatchPlayers.forEach(player => {
                Object.keys(currentActions[player] || {}).forEach(charTeamIdxStr => {
                    const action = currentActions[player][charTeamIdxStr];
                    if (action.hyperize && !workingHyperUsed[player]) {
                        const charTeamIdx = parseInt(charTeamIdxStr);
                        const char = workingTeams[player]?.[charTeamIdx];
                        if (char && char.hp > 0 && !char.isHyper) {
                            char.isHyper = true;
                            
                            // Nerf leggero: la forma Iper resta speciale, ma il bonus
                            // alle statistiche passa da +50% a +35%. Aggiorniamo
                            // anche le basi per mantenere coerenti i buff futuri.
                            char.baseAtk = Math.floor(char.baseAtk * 1.35);
                            char.baseDef = Math.floor(char.baseDef * 1.35);
                            char.baseSpd = Math.floor(char.baseSpd * 1.35);

                            char.atk = Math.floor(char.atk * 1.35);
                            char.def = Math.floor(char.def * 1.35);
                            char.spd = Math.floor(char.spd * 1.35);
                            
                            if (char.id === 'gardevoir') {
                                char.types = ['Psico', 'Erba'];
                                char.moves.push({ ...MOVES_DB['Liane Oscillanti'], remainingUses: MOVES_DB['Liane Oscillanti'].maxUses !== undefined ? MOVES_DB['Liane Oscillanti'].maxUses : null });
                            }
                            
                            if (char.id === 'astral') {
                                char.types = ['Oscuro']; // Astral diventa puramente Oscuro
                                char.moves.push({ ...MOVES_DB['Assorbimento Tenebroso'], remainingUses: MOVES_DB['Assorbimento Tenebroso'].maxUses !== undefined ? MOVES_DB['Assorbimento Tenebroso'].maxUses : null });
                            }

                            if (char.id === 'polterpup') {
                                char.moves.push({ ...MOVES_DB['Riporta'], remainingUses: MOVES_DB['Riporta'].maxUses !== undefined ? MOVES_DB['Riporta'].maxUses : null });
                            }

                            if (char.id === 'spongebob') {
                                char.types = ['Acqua', 'Lotta'];
                            }

                            if (char.id === 'ariana') {
                                char.types = ['Suono', 'Oscuro'];
                                char.moves.push({ ...MOVES_DB['Dangerous Woman'], remainingUses: MOVES_DB['Dangerous Woman'].maxUses !== undefined ? MOVES_DB['Dangerous Woman'].maxUses : null });
                            }

                            if (char.id === 'jake') {
                                char.types = ['Magico', 'Buio'];
                                char.moves.push({ ...MOVES_DB['Morsa del Demone'], remainingUses: MOVES_DB['Morsa del Demone'].maxUses !== undefined ? MOVES_DB['Morsa del Demone'].maxUses : null });
                            }

                            if (char.id === 'finn') {
                                char.types = ['Elettro', 'Fuoco'];
                                char.moves.push({ ...MOVES_DB['Lama Vulcanica'], remainingUses: MOVES_DB['Lama Vulcanica'].maxUses !== undefined ? MOVES_DB['Lama Vulcanica'].maxUses : null });
                                char.moves.push({ ...MOVES_DB['Fulmine dell\'Eroe'], remainingUses: MOVES_DB['Fulmine dell\'Eroe'].maxUses !== undefined ? MOVES_DB['Fulmine dell\'Eroe'].maxUses : null });
                            }

                            if (char.id === 'juvia') {
                                char.types = ['Acqua', 'Buio'];
                                char.moves.push({ ...MOVES_DB['Abisso Disperato'], remainingUses: MOVES_DB['Abisso Disperato'].maxUses !== undefined ? MOVES_DB['Abisso Disperato'].maxUses : null });
                            }

                            if (char.id === 'corvina') {
                                char.types = ['Magico']; // Diventa pura magia (Corvina Bianca)
                                char.moves.push({ ...MOVES_DB['Luce di Azarath'], remainingUses: MOVES_DB['Luce di Azarath'].maxUses !== undefined ? MOVES_DB['Luce di Azarath'].maxUses : null });
                            }

                            if (char.id === 'entoma') {
                                char.types = ['Insetto', 'Buio'];
                                char.moves.push({ ...MOVES_DB['Fame Insaziabile'], remainingUses: MOVES_DB['Fame Insaziabile'].maxUses !== undefined ? MOVES_DB['Fame Insaziabile'].maxUses : null });
                            }

                            if (char.id === 'darwin') {
                                char.types = ['Acqua', 'Oscuro'];
                                char.moves.push({ ...MOVES_DB['Idropompa'], remainingUses: MOVES_DB['Idropompa'].maxUses !== undefined ? MOVES_DB['Idropompa'].maxUses : null });
                                char.moves.push({ ...MOVES_DB['Dittatura del Sorriso'], remainingUses: MOVES_DB['Dittatura del Sorriso'].maxUses !== undefined ? MOVES_DB['Dittatura del Sorriso'].maxUses : null });
                            }

                            if (char.id === 'brago') {
                                char.types = ['Oscuro', 'Psico'];
                                char.moves.push({ ...MOVES_DB['Caos Totale'], remainingUses: MOVES_DB['Caos Totale'].maxUses !== undefined ? MOVES_DB['Caos Totale'].maxUses : null });
                            }

                            if (char.id === 'sdentato') {
                                char.types = ['Drago', 'Elettro'];
                                char.moves.push({ ...MOVES_DB['Fulmine'], remainingUses: MOVES_DB['Fulmine'].maxUses !== undefined ? MOVES_DB['Fulmine'].maxUses : null });
                            }

                            if (char.id === 'rainbowdash') {
                                char.moves.push({ ...MOVES_DB['Morso del Pony'], remainingUses: MOVES_DB['Morso del Pony'].maxUses !== undefined ? MOVES_DB['Morso del Pony'].maxUses : null });
                            }

                            if (char.id === 'elsa') {
                                char.moves.push({ ...MOVES_DB['Gelo Definitivo'], remainingUses: MOVES_DB['Gelo Definitivo'].maxUses !== undefined ? MOVES_DB['Gelo Definitivo'].maxUses : null });
                            }

                            if (char.id === 'sheldon') {
                                char.types = ['Drago', 'Roccia'];
                                char.moves.push({ ...MOVES_DB['Meteora Devastante'], remainingUses: MOVES_DB['Meteora Devastante'].maxUses !== undefined ? MOVES_DB['Meteora Devastante'].maxUses : null });
                            }

                            if (char.id === 'charizard') {
                                char.types = ['Roccia', 'Aria'];
                                char.moves.push({ ...MOVES_DB['Valanga'], remainingUses: MOVES_DB['Valanga'].maxUses !== undefined ? MOVES_DB['Valanga'].maxUses : null });
                            }

                            if (char.id === 'maxcaulfield') {
                                char.types = ['Insetto', 'Aria'];
                                char.moves.push({ ...MOVES_DB['Tempesta di Farfalle'], remainingUses: MOVES_DB['Tempesta di Farfalle'].maxUses !== undefined ? MOVES_DB['Tempesta di Farfalle'].maxUses : null });
                            }

                            if (char.id === 'chloeprice') {
                                char.types = ['Suono', 'Luce'];
                                char.moves.push({ ...MOVES_DB['Caos Assoluto'], remainingUses: MOVES_DB['Caos Assoluto'].maxUses !== undefined ? MOVES_DB['Caos Assoluto'].maxUses : null });
                            }

                            if (char.id === 'dolli') {
                                char.types = ['Spettro', 'Acqua'];
                                char.moves.push({ ...MOVES_DB['Incubo di Pezza'], remainingUses: MOVES_DB['Incubo di Pezza'].maxUses !== undefined ? MOVES_DB['Incubo di Pezza'].maxUses : null });
                            }

                            if (char.id === 'zatchbell') {
                                char.passive = { name: 'Kiyomaro: Zatch non sei solo', type: 'global_damage_boost', multiplier: 1.15, desc: 'Kiyomaro lo aiuta a combattere leggendo il libro rosso: tutte le sue mosse ricevono un potenziamento del 15% ai danni!' };
                            }

                            if (char.id === 'poisonivy') {
                                char.types = ['Veleno', 'Fuoco'];
                                char.moves.push({ ...MOVES_DB['Polline scottante'], remainingUses: MOVES_DB['Polline scottante'].maxUses !== undefined ? MOVES_DB['Polline scottante'].maxUses : null });
                            }

                            if (char.id === 'carlos') {
                                char.types = ['Fuoco', 'Lotta'];
                                char.moves.push({ ...MOVES_DB['Pugno infuocato del survivor'], remainingUses: MOVES_DB['Pugno infuocato del survivor'].maxUses !== undefined ? MOVES_DB['Pugno infuocato del survivor'].maxUses : null });
                            }

                            if (char.id === 'leon') {
                                char.types = ['Fuoco', 'Normale'];
                            }

                            if (char.id === 'sage') {
                                char.moves.push({ ...MOVES_DB['questo è il mio vero potenziale'], remainingUses: MOVES_DB['questo è il mio vero potenziale'].maxUses !== undefined ? MOVES_DB['questo è il mio vero potenziale'].maxUses : null });
                            }

                            workingHyperUsed[player] = true;
                            
                            // Genera evento speciale per innescare l'animazione di trasformazione!
                            events.push({ 
                                type: 'hyper_transform', 
                                text: `✨ INCREDIBILE! ${char.name} sprigiona un'aura cosmica e assume la sua FORMA IPER! ✨`,
                                player: player,
                                charTeamIdx: charTeamIdx
                            });
                        }
                    }
                });
            });
            // ---------------------------------------------------------------

            // Chi entra sul campo DOPO la Trappola Segreta perde il 10% PS.
            // La lista seen viene aggiornata a ogni turno; un ingresso
            // successivo dello stesso personaggio viene colpito di nuovo.
            for(const entry of trapEntries(workingFieldTraps,workingTrapSeen,workingField)){
                const char=workingTeams[entry.player]?.[entry.idx];
                if(!char||char.hp<=0)continue;
                const dmg=stickyTrapEntryDamage(char);
                applyDamage(char,dmg,entry.player,entry.idx,
                    `🪤 Trappola Segreta! ${char.name} perde ${dmg} PS entrando in campo!`);
            }
            for(const p of Object.keys(workingField))workingTrapSeen[p]=[...(workingField[p]||[])];

            // --- 2. COSTRUZIONE CODA DEI TURNI E INIZIATIVA ---
            let turnQueue = [];
            activeMatchPlayers.forEach(player => {
              workingTeams[player].forEach(char => { if (!char.statuses) char.statuses = []; });
              Object.keys(currentActions[player] || {}).forEach(charTeamIdxStr => {
                const charTeamIdx = parseInt(charTeamIdxStr);
                const char = workingTeams[player]?.[charTeamIdx];
                if (!char) return; // FIX: Safety Check 
                
                const action = currentActions[player][charTeamIdxStr];
                
                let effSpd = Math.floor(char.spd*zodiacTrapSpeedFactor(char)*tailwindSpeedFactor(workingTailwind,player)*assideramentoSpeedFactor(char));
                if (!immuneToStatDrops(char) && char.statuses && char.statuses.some(s => s.type === 'Elettrizzato')) effSpd = Math.floor(effSpd / 2);
                
                const move = action.type === 'attack' ? char.moves[action.moveIdx] : null;
                let priority = (action.type === 'switch' || action.type === 'use_item') ? 6 : (move ? (move.priority || 0) : 0);
                priority += rapidTransmutationPriority(char,move);

                if (char.statuses && char.statuses.some(s => s.type === 'Ombra Rapida')) {
                    priority += 2;
                }

                turnQueue.push({ player, charTeamIdx, char, effSpd, action, priority, move });
              });
            });

            turnQueue.sort((a, b) => b.priority - a.priority || b.effSpd - a.effSpd);

            let isFirstAttackOfTurn = true;

            for (let order of turnQueue) {
              gemObserver.beginAction();
              heatBurstActive=false;
              const { player, charTeamIdx, action } = order;
              // Validazione nel calcolo autorevole: nessun consumabile, cura o revive
              // può essere applicato in Ultimon, anche da bot/client non aggiornati.
              if (action.type === 'use_item' && !canUseBagItems(gameState)) continue;
              let move=order.move;
              nightwingObserver.beginAction(player,action.type==='attack'?move:null);
              if (action.type === 'combo_assist') continue;
              
              const attacker = workingTeams[player]?.[charTeamIdx];
              
              if (!attacker || (attacker.hp <= 0 && action.type !== 'use_item')) continue; // FIX: Protezione Null
              // Attribuzione degli eventi senza dipendere dal testo dei messaggi.
              events.push({type:'battle_actor',player,charTeamIdx,kind:action.type});
              const clearedBefore=activateNeutralizingSpray(attacker);
              if(clearedBefore.length){
                updateStatusUI(player,charTeamIdx);
                events.push({type:'text',text:`🧴 Spray Neutralizzante di ${attacker.name}: rimuove ${clearedBefore.join(', ')}!`});
              }

              // AGGIORNAMENTO STATISTICHE: Mossa usata
              if (gameState.players[player] === playerName && action.type === 'attack' && move) {
                  updateLocalStats({ move: move.name });
              }

              if (action.type === 'use_item') {
                  const itemId=action.itemId;
                  const itemDef=ITEMS_DB[itemId];
                  if(!itemDef || itemDef.type==='held' || !(workingInventory[player]?.[itemId]>0))
                    continue;
                  if(attacker.hp<=0){
                    events.push({type:'text',text:attacker.name+' non può utilizzare '+itemDef.name+' da esausto.'});
                    continue;
                  }

                  // La UI sceglie targetPlayer + targetIdx: controllali SEMPRE
                  // sullo snapshot autorevole prima di scalare inventario
                  // e limite online, anche nelle partite multigiocatore.
                  const kind=itemDef.type==='revive'?'revive':'alive';
                  const ownerState={gameMode:gameState.gameMode,settings:gameState.settings,
                    isRoguelikeCoop:gameState.isRoguelikeCoop,teams:workingTeams,field:workingField};
                  let targetPlayer=action.targetPlayer||player;
                  let targetIdx=Number.isInteger(action.targetIdx)?action.targetIdx:charTeamIdx;
                  // Compatibilità con azioni vecchie senza bersaglio esplicito:
                  // nei nuovi client il giocatore sceglie sempre il KO.
                  if(itemDef.type==='revive' && !action.targetPlayer){
                    const fallback=legalSupportTargets(ownerState,player,'revive',
                      {activePlayers:activeMatchPlayers})[0];
                    if(fallback){targetPlayer=fallback.player;targetIdx=fallback.idx}
                  }
                  if(!isLegalSupportTarget(ownerState,player,targetPlayer,targetIdx,kind,
                    {activePlayers:activeMatchPlayers})){
                    events.push({type:'text',text:'Non è possibile usare '+itemDef.name+
                      ' sul bersaglio scelto: nessun oggetto è stato consumato.'});
                    continue;
                  }
                  const recipient=workingTeams[targetPlayer][targetIdx];
                  if(isLimitedHealingItem(itemDef)&&isOnlineHealingLimited(appMode,gameState)){
                    const used=Number(workingHealingItemsUsed[player])||0;
                    if(used>=ONLINE_HEAL_ITEM_LIMIT){
                      events.push({type:'text',text:'Limite online raggiunto: massimo 3 strumenti curativi per giocatore.'});
                      continue;
                    }
                    workingHealingItemsUsed[player]=used+1;
                  }
                  workingInventory[player][itemId]-=1;

                  if(itemDef.type==='revive'){
                    const amount=Math.max(1,Math.floor(recipient.maxHp*itemDef.value));
                    recipient.hp=Math.min(recipient.maxHp,amount);
                    recipient.statuses=[];
                    events.push({type:'damage',targetPlayer,targetIdx,newHp:recipient.hp,
                      text:gameState.players[player]+' usa '+itemDef.name+' e rianima '+
                        recipient.name+' ('+(gameState.players?.[targetPlayer]||targetPlayer)+')!'});
                    updateStatusUI(targetPlayer,targetIdx);
                    if(activatePhoenixFeather(recipient))
                      events.push({type:'text',text:'🪶 Piuma della Rinascita di '+recipient.name+
                        ': Difesa +15% per 2 turni!'});
                  }else if(itemDef.type==='heal'){
                    const amount=Math.max(1,Math.floor(recipient.maxHp*itemDef.value));
                    const before=recipient.hp;
                    recipient.hp=Math.min(recipient.maxHp,recipient.hp+amount);
                    events.push({type:'damage',targetPlayer,targetIdx,newHp:recipient.hp,
                      text:gameState.players[player]+' usa '+itemDef.name+' su '+recipient.name+
                        ': recuperati '+(recipient.hp-before)+' PS!'});
                  }else if(itemDef.type==='buff'){
                    if(['atk','def','spd','spAtk','spDef'].includes(itemDef.stat))
                      applyBattleStatModifier(recipient,itemDef.stat,itemDef.value);
                    events.push({type:'text',text:gameState.players[player]+' usa '+itemDef.name+
                      ': '+recipient.name+' ottiene un potenziamento!'});
                  }else if(itemDef.type==='heal_status'){
                    const removed=(recipient.statuses||[]).filter(isNegativeStatus);
                    recipient.statuses=(recipient.statuses||[]).filter(s=>!isNegativeStatus(s));
                    updateStatusUI(targetPlayer,targetIdx);
                    events.push({type:'text',text:gameState.players[player]+' usa '+itemDef.name+
                      ' su '+recipient.name+': rimossi '+removed.length+' status negativi.'});
                  }else if(itemDef.type==='regen'){
                    recipient.statuses ||= [];
                    const regen=recipient.statuses.find(s=>s.type==='Rigenerazione');
                    if(regen){regen.turns=itemDef.turns;regen.healFactor=itemDef.value}
                    else recipient.statuses.push({type:'Rigenerazione',turns:itemDef.turns,
                      healFactor:itemDef.value});
                    updateStatusUI(targetPlayer,targetIdx);
                    events.push({type:'text',text:gameState.players[player]+' usa '+itemDef.name+
                      ' su '+recipient.name+': rigenerazione attiva per '+itemDef.turns+' turni!'});
                  }
                  continue;
              }

              if (action.type === 'switch') {
                  const fieldPos = workingField[player].indexOf(charTeamIdx);
                  if (fieldPos !== -1) {
                      attacker.atk = attacker.baseAtk;
                      attacker.def = attacker.baseDef;
                      attacker.spd = attacker.baseSpd;
                      // La Clessidra è un bonus per tutta la battaglia:
                      // non deve sparire al cambio, unlike ordinary stat buffs.
                      if(attacker.heldItem==='clessidra_rapidita'&&attacker.hourglassUsed)
                        applyBattleStatModifier(attacker,'spd',1.2);
                      attacker.acc = 1.0;
                      attacker.consecutiveProtect = 0;

                      // --- RIMOZIONE STATUS IN_GROPPA SE YOSHI VIENE SOSTITUITO ---
                      activeMatchPlayers.forEach(pAlly => {
                          if (workingTeams[pAlly]) {
                              workingTeams[pAlly].forEach((cAlly, aIdx) => {
                                  if (cAlly && cAlly.hp > 0 && cAlly.statuses) {
                                      const groppaIdx = cAlly.statuses.findIndex(s => s.type === 'In_Groppa' && s.protectorIdx === charTeamIdx && s.protectorPlayer === player);
                                      if (groppaIdx !== -1) {
                                          cAlly.statuses.splice(groppaIdx, 1);
                                          events.push({ type: 'text', text: `🦕 ${attacker.name} è stato messo in panchina! ${cAlly.name} scende dalla sua groppa.` });
                                          updateStatusUI(pAlly, aIdx);
                                      }
                                  }
                              });
                          }
                      });
                      // -----------------------------------------------------------

                      workingField[player][fieldPos] = action.toIdx;
                      const entering=workingTeams[player][action.toIdx];
                      if(entering?.id==='lucy' && action.zodiacSpiritId)
                        entering.zodiacSpiritId=normalizeZodiacSpirit(action.zodiacSpiritId);
                      entering.revealed = true;
                      markRapidTransmutationEntry(entering,true);
                      events.push({ type: 'switch', player, pos: fieldPos, newIdx: action.toIdx,
                        text: `${gameState.players[player]} ritira ${attacker.name} e manda in campo ${entering.name}!` });
                      // Prima mostriamo l'ingresso, poi eventuali danni
                      // della trappola e un KO: niente sprite fantasma.
                      if(workingFieldTraps[player] && entering?.hp>0){
                        const dmg=stickyTrapEntryDamage(entering);
                        applyDamage(entering,dmg,player,action.toIdx,
                          `🪤 Trappola Segreta! ${entering.name} perde ${dmg} PS entrando in campo!`);
                      }
                      // Il Sigillo del Cambio cura soltanto al primo ingresso via cambio
                      // di ciascun Multimon, non a ogni cambio ripetuto.
                      if (entering?.hp>0 && entering.rogueRelics?.includes('shift') &&
                          !entering.rogueShiftUsed) {
                        entering.rogueShiftUsed = true;
                        const amount = Math.min(entering.maxHp-entering.hp,
                          Math.max(1,Math.floor(entering.maxHp*0.15)));
                        if (amount > 0) {
                          entering.hp += amount;
                          events.push({type:'damage',targetPlayer:player,targetIdx:action.toIdx,
                            newHp:entering.hp,text:'🔄 Sigillo del Cambio: '+entering.name+
                            ' recupera '+amount+' PS entrando in campo!'});
                        }
                      }
                      if(entering?.hp>0 && entering.passive?.type==='on_enter' &&
                         (entering.passiveUses||0)<(entering.passive.maxUses||1)){
                        entering.passiveUses=(entering.passiveUses||0)+1;
                        applyOnEnterPassiveImpl({CHARACTERS},entering,player,action.toIdx,
                          workingTeams,workingField,events,gameState.gameMode,gameState.settings,gameState.isCampaignBattle);
                      }
                      workingTrapSeen[player]=[...(workingField[player]||[])];
                  }
                  continue;
              }

              let canAttack = true;

              let stunIdx = attacker.statuses.findIndex(s => s.type === 'Stordito');
              if (stunIdx !== -1) {
                  attacker.statuses[stunIdx].turns -= 1;
                  events.push({ type: 'text', text: `${attacker.name} è stordito e salta il turno!` });
                  if (attacker.statuses[stunIdx].turns <= 0) {
                      attacker.statuses.splice(stunIdx, 1);
                  }
                  updateStatusUI(player, charTeamIdx);
                  canAttack = false;
              }

              if (!canAttack) continue;

              let ricIdx = attacker.statuses.findIndex(s => s.type === 'Ricarica');
              if (ricIdx !== -1) {
                  events.push({ type: 'text', text: `${attacker.name} deve ricaricarsi dopo l'ultimo attacco!` });
                  attacker.statuses.splice(ricIdx, 1);
                  updateStatusUI(player, charTeamIdx);
                  canAttack = false;
              }

              if (!canAttack) continue;

              let sleepIdx = attacker.statuses.findIndex(s => s.type === 'Addormentato');
              if (sleepIdx !== -1) {
                  if (attacker.passive && attacker.passive.type === 'cure_sleep') {
                      events.push({ type: 'text', text: `✨ ${attacker.name} consuma la sua ${attacker.passive.name} e si sveglia immediatamente!`, isPassive: true, passiveChar: attacker.name, passiveName: attacker.passive.name });
                      attacker.statuses.splice(sleepIdx, 1);
                      updateStatusUI(player, charTeamIdx);
                  } else {
                      attacker.statuses[sleepIdx].turns -= 1;
                      if (attacker.statuses[sleepIdx].turns > 0) {
                          events.push({ type: 'text', text: `${attacker.name} dorme profondamente e non può attaccare...` });
                          updateStatusUI(player, charTeamIdx);
                          canAttack = false;
                      } else {
                          events.push({ type: 'text', text: `${attacker.name} si è svegliato!` });
                          attacker.statuses.splice(sleepIdx, 1);
                          updateStatusUI(player, charTeamIdx);
                      }
                  }
              }

              if (!canAttack) continue;

              let frozenIdx = attacker.statuses.findIndex(s => s.type === 'Congelato');
              if (frozenIdx !== -1) {
                  if (Math.random() < 0.5) {
                      applyDamage(attacker, 3, player, charTeamIdx, `${attacker.name} è congelato! Subisce 3 danni dal freddo.`);
                      canAttack = false;
                  } else {
                      events.push({ type: 'text', text: `${attacker.name} rompe il ghiaccio e si libera!` });
                      attacker.statuses.splice(frozenIdx, 1);
                      updateStatusUI(player, charTeamIdx);
                  }
              }

              if (!canAttack || attacker.hp <= 0) continue;

              if (attacker.statuses.some(s => s.type === 'Elettrizzato')) {
                  if (Math.random() < 0.3) {
                      events.push({ type: 'text', text: `${attacker.name} è paralizzato dall'elettricità!` });
                      canAttack = false;
                  }
              }

              if (!canAttack) continue;

              let infatIdx = attacker.statuses.findIndex(s => s.type === 'Infatuato');
              if (infatIdx !== -1) {
                  attacker.statuses[infatIdx].turns -= 1;
                  if (attacker.statuses[infatIdx].turns > 0) {
                      if (Math.random() < 0.5) {
                          events.push({ type: 'text', text: `${attacker.name} è troppo infatuato e salta il turno!` });
                          canAttack = false; 
                      }
                  } else {
                      events.push({ type: 'text', text: `${attacker.name} ha ripreso il controllo e non è più infatuato!` });
                      attacker.statuses.splice(infatIdx, 1);
                      updateStatusUI(player, charTeamIdx);
                  }
              }

              if (!canAttack) continue;

              let confIdx = attacker.statuses.findIndex(s => s.type === 'Confuso');
              if (confIdx !== -1) {
                  if (Math.random() < 0.25) {
                      events.push({ type: 'text', text: `${attacker.name} non è più confuso!` });
                      attacker.statuses.splice(confIdx, 1);
                      updateStatusUI(player, charTeamIdx);
                  } else {
                      events.push({ type: 'text', text: `${attacker.name} è confuso!` });
                      if (Math.random() < 0.4) {
                          const pwr = (move && move.power > 0) ? move.power : 40;
                          const baseDmg = ((2 * 50 / 5 + 2) * pwr * (attacker.atk / attacker.def)) / 50 + 2;
                          const selfDmg = Math.max(1, Math.floor(baseDmg * 0.25));
                          
                          applyDamage(attacker, selfDmg, player, charTeamIdx, `${attacker.name} si colpisce da solo nella confusione! Infligge ${selfDmg} danni a se stesso.`);
                          canAttack = false;
                      }
                  }
              }

              if (!canAttack || attacker.hp <= 0) continue;
              if(zodiacTrapMisses(attacker)){
                events.push({type:'text',text:`🕳️ ${attacker.name} perde l'orientamento nella Prigione Sotterranea e manca la mossa!`});
                continue;
              }

              if (action.type === 'attack' && move) {
                if((move.targetMode==='revive'||move.targetMode==='ally') &&
                   !isLegalSupportTarget(
                     {gameMode:gameState.gameMode,settings:gameState.settings,
                       isRoguelikeCoop:gameState.isRoguelikeCoop,
                       teams:workingTeams,field:workingField},
                     player,action.targetPlayer,action.targetIdx,
                     move.targetMode==='revive'?'revive':'alive',
                     {fieldOnly:move.targetMode!=='revive',activePlayers:activeMatchPlayers}
                   )){
                  events.push({type:'text',text:attacker.name+' non può usare '+move.name+
                    ': bersaglio di supporto non valido o non più disponibile.'});
                  continue;
                }
                if(isMoveDisabled(attacker,move)){
                  events.push({type:'text',text:'👻 '+attacker.name+' non può usare '+
                    move.name+': Corpo Funesto la disabilita ancora!'});
                  continue;
                }
                if (move.remainingUses !== null && move.remainingUses !== undefined) {
                    move.remainingUses -= 1;
                }
                if(move.zodiacCopyLastEnemy){
                  const target=workingTeams[action.targetPlayer]?.[action.targetIdx];
                  const remembered=target?.lastUsedMove;
                  if(!remembered || remembered.zodiacCopyLastEnemy || remembered.isSummon || remembered.randomSummon){
                    events.push({type:'text',text:'👥 Copia Perfetta fallisce: il bersaglio non ha una mossa copiabile già usata.'});
                    continue;
                  }
                  move={...remembered,name:`Copia Perfetta: ${remembered.name}`,remainingUses:null,
                    maxUses:undefined,isCombo:undefined,requiredStatus:undefined};
                  events.push({type:'text',text:`👥 Gemini copia la mossa ${remembered.name} di ${target.name}!`});
                }
                attacker.lastUsedMove={...move,remainingUses:null};
                // Si registra solo ciò che il nemico ha DAVVERO mostrato;
                // mai leggere comandi pendenti di giocatori avversari.
                publicMovesForAi.push({type:'ai_public_move',player,charTeamIdx,
                  charId:attacker.id,moveName:move.name,moveType:move.type});
                
                // Attiva il Cooldown della mossa appena usata
                if (move.cooldown !== undefined) {
                    move.currentCooldown = move.cooldown;
                }
                
                if (move.isCombo) {
                    const partnerIds = move.isCombo.filter(id => id !== attacker.id);
                    partnerIds.forEach(pId => {
                        const partnerTeamIdx = workingField[player].find(idx => workingTeams[player][idx].id === pId && workingTeams[player][idx].hp > 0);
                        if (partnerTeamIdx !== undefined) {
                            const partner = workingTeams[player][partnerTeamIdx];
                            const partnerMove = partner.moves.find(m => m.name === move.name);
                            if (partnerMove && partnerMove.remainingUses !== null && partnerMove.remainingUses !== undefined) {
                                partnerMove.remainingUses -= 1;
                            }
                        }
                    });
                }

                if(move.zodiacDodge){
                  addZodiacDodge(attacker);
                  events.push({type:'text',text:`👥 ${attacker.name} usa Doppio Fantasma: il prossimo attacco verrà evitato!`});
                  updateStatusUI(player,charTeamIdx);
                  continue;
                }
                if (move.isProtect) {
                    let consec = attacker.consecutiveProtect || 0;
                    let successChance = 1 / Math.pow(2, consec); 
                    if (Math.random() < successChance) {
                        let pStatus = move.protectStatus || 'Protetto';
                        attacker.statuses.push({ type: pStatus, turns: 1, sourceMove: move.name });
                        events.push({ type: 'text', text: `${attacker.name} assume una posizione difensiva e si protegge!` });
                        updateStatusUI(player, charTeamIdx);
                        attacker.consecutiveProtect = consec + 1;
                    } else {
                        events.push({ type: 'text', text: `${attacker.name} usa ${move.name}, ma la protezione fallisce!` });
                        attacker.consecutiveProtect = 0;
                    }
                    continue;
                } else {
                    attacker.consecutiveProtect = 0; 
                }

                if (move.isSummon || move.randomSummon) {
                    let summonIds = [];
                    if (move.isSummon) {
                        summonIds = Array.isArray(move.isSummon) ? move.isSummon : [move.isSummon];
                    } else if (move.randomSummon) {
                        // Sceglie un aiutante a caso dalla lista
                        const randomId = move.randomSummon[Math.floor(Math.random() * move.randomSummon.length)];
                        summonIds = [randomId];
                    }

                    let summonedNames = [];
                    
                    summonIds.forEach(summonId => {
                        const baseChar = CHARACTERS.find(c => c.id === summonId);
                        if (baseChar) {
                            const newSummon = {
                                ...JSON.parse(JSON.stringify(baseChar)), 
                                statuses: [],
                                consecutiveProtect: 0,
                                baseAtk: baseChar.atk,
                                baseDef: baseChar.def,
                                baseSpd: baseChar.spd
                            };
                            newSummon.moves.forEach(m => {
                                if (m.maxUses !== undefined) m.remainingUses = m.maxUses;
                            });

                            workingTeams[player].push(newSummon);
                            const newCharTeamIdx = workingTeams[player].length - 1;
                            workingField[player].push(newCharTeamIdx);
                            
                            summonedNames.push(newSummon.name);
                            events.push({ type: 'summon', text: `${attacker.name} ha evocato ${newSummon.name}!`, player: player, newChar: JSON.parse(JSON.stringify(newSummon)), fieldIdx: newCharTeamIdx });
                        }
                    });
                    
                    if (summonedNames.length > 1) {
                         // Modifica il testo se sono state fatte evocazioni multiple per renderlo più leggibile
                         events[events.length - 1].text = `${attacker.name} ha evocato ${summonedNames.join(' e ')}!`;
                    }
                    continue;
                }

                // Nel raid finale le mosse di Echomax partono tutte da precisione
                // 100%. La schivata naturale del bersaglio resta una meccanica distinta.
                let finalAccuracy = isEchoRaidAccuracyProtected(attacker)
                    ? 1 : (move.accuracy !== undefined ? move.accuracy : 1.0) * (attacker.acc || 1.0);
                if (!isEchoRaidAccuracyProtected(attacker) && attacker.statuses?.some(s=>s.type==='Accecato')) finalAccuracy *= 0.8;
                if (finalAccuracy < 1.0 && Math.random() > finalAccuracy) {
                    events.push({ type: 'text', text: `${attacker.name} usa ${move.name}, ma manca clamorosamente il bersaglio!` });
                    
                    if (action.targetPlayer && action.targetIdx !== undefined) {
                        const intendedTarget = workingTeams[action.targetPlayer]?.[action.targetIdx];
                        if (intendedTarget && intendedTarget.passive && intendedTarget.passive.type === 'perfezione_assoluta' && intendedTarget.hp > 0) {
                            if (applyPerfezioneBonus(intendedTarget,'def'))
                                events.push({ type: 'text', text: `✨ ${intendedTarget.name} attiva ${intendedTarget.passive.name}! Schiva e aumenta la Difesa del 15%! (massimo 2 volte)`, isPassive: true, passiveChar: intendedTarget.name, passiveName: intendedTarget.passive.name });
                        }
                    }
                    continue;
                }

                let resolvedTargets = [];

                if (move.targetCount && move.targetCount >= 4) {
                    // Mossa ad area totale: colpisce tutti i nemici
                    const activeMatchPlayers = getActivePlayers();
                    let enemyTeams = [];
                    if (gameState.gameMode === 'ultimon') {
                        enemyTeams = activeMatchPlayers.filter(p => p !== player);
                    } else if (gameState.gameMode === 'multipla') {
                        enemyTeams = ['p1', 'p2'].includes(player) ? ['p3', 'p4'] : ['p1', 'p2'];
                    } else if (gameState.gameMode === 'juggernaut' || gameState.gameMode === 'survival') {
                        const juggPlayer = gameState.settings.juggernautPlayer || (gameState.gameMode === 'survival' ? 'p2' : 'p1');
                        enemyTeams = player === juggPlayer ? activeMatchPlayers.filter(p => p !== juggPlayer) : [juggPlayer];
                    } else if (gameState.gameMode === 'torneo') {
                        enemyTeams = getTournamentMatchOpponents(player);
                    } else if (gameState.gameMode === 'torneo_punti') {
                        enemyTeams = [activeMatchPlayers.find(p => p !== player)];
                    } else if (gameState.gameMode === 'battleroyale') {
                        enemyTeams = activeMatchPlayers.filter(p => p !== player);
                    } else {
                        enemyTeams = [player === 'p1' ? 'p2' : 'p1'];
                    }

                    enemyTeams.forEach(ep => {
                        if (ep && workingField[ep]) {
                            workingField[ep].forEach((cIdx, fIdx) => {
                                if (workingTeams[ep][cIdx] && workingTeams[ep][cIdx].hp > 0) {
                                    resolvedTargets.push({
                                        player: ep,
                                        idx: cIdx,
                                        fieldIdx: fIdx,
                                        char: workingTeams[ep][cIdx]
                                    });
                                }
                            });
                        }
                    });
                } else if (move.targetMode === 'team' || move.targetMode === 'team_smart_heal') {
                    // --- FIX: MOSSE DI SQUADRA (Muro Protettivo, Cure di Gruppo, Scudi) ---
                    const activeMatchPlayers = getActivePlayers();
                    let myTeamPlayers = [player];
                    if (gameState.gameMode === 'multipla') {
                        myTeamPlayers = ['p1', 'p2'].includes(player) ? ['p1', 'p2'] : ['p3', 'p4'];
                    } else if (gameState.gameMode === 'juggernaut' || gameState.gameMode === 'survival') {
                        const juggPlayer = gameState.settings.juggernautPlayer || (gameState.gameMode === 'survival' ? 'p2' : 'p1');
                        if (player !== juggPlayer) {
                            myTeamPlayers = activeMatchPlayers.filter(p => p !== juggPlayer);
                        }
                    }

                    myTeamPlayers.forEach(ep => {
                        if (ep && workingField[ep]) {
                            workingField[ep].forEach((cIdx, fIdx) => {
                                if (workingTeams[ep][cIdx] && workingTeams[ep][cIdx].hp > 0) {
                                    resolvedTargets.push({
                                        player: ep,
                                        idx: cIdx,
                                        fieldIdx: fIdx,
                                        char: workingTeams[ep][cIdx]
                                    });
                                }
                            });
                        }
                    });
                    if (move.maxTeamTargets && resolvedTargets.length > move.maxTeamTargets) {
                        resolvedTargets = resolvedTargets.sort(() => 0.5 - Math.random()).slice(0, move.maxTeamTargets);
                    }
                } else if (action.selectedTargets) {
                    // Attacco a bersagli multipli selezionati manualmente
                    action.selectedTargets.forEach(t => {
                        let finalIdx = t.idx;
                        if (t.fieldIdx !== undefined) {
                            const currentIdxAtPos = workingField[t.player]?.[t.fieldIdx];
                            if (currentIdxAtPos !== undefined && workingTeams[t.player]?.[currentIdxAtPos]?.hp > 0) {
                                finalIdx = currentIdxAtPos;
                            } else {
                                const anyAlive = (workingField[t.player] || []).filter(i => workingTeams[t.player]?.[i]?.hp > 0);
                                if (anyAlive.length > 0) finalIdx = anyAlive[0];
                                else finalIdx = null;
                            }
                        }
                        
                        if (finalIdx !== null) {
                            const tgtChar = workingTeams[t.player]?.[finalIdx];
                            if (tgtChar) {
                                // Evita duplicati
                                if (!resolvedTargets.some(rt => rt.player === t.player && rt.idx === finalIdx)) {
                                    resolvedTargets.push({
                                        player: t.player,
                                        idx: finalIdx,
                                        fieldIdx: workingField[t.player].indexOf(finalIdx),
                                        char: tgtChar
                                    });
                                }
                            }
                        }
                    });
                } else {
                    let finalTargetIdx = action.targetIdx;
                    
                    if (action.targetFieldIdx !== undefined) {
                        const currentIdxAtPos = workingField[action.targetPlayer]?.[action.targetFieldIdx];
                        if (currentIdxAtPos !== undefined && workingTeams[action.targetPlayer]?.[currentIdxAtPos]?.hp > 0) {
                            // Colpisce chiunque si trovi ORA nello slot mirato originariamente
                            finalTargetIdx = currentIdxAtPos;
                        } else {
                            // Se lo slot è vuoto o chi c'è è morto, cerca il primo vivo disponibile
                            if (move.targetMode !== 'revive') {
                                const anyAlive = (workingField[action.targetPlayer] || []).filter(i => workingTeams[action.targetPlayer]?.[i]?.hp > 0);
                                if (anyAlive.length > 0) {
                                    finalTargetIdx = anyAlive[0];
                                } else {
                                    finalTargetIdx = null; // Nessuno in campo!
                                }
                            }
                        }
                    } else {
                        // Fallback se targetFieldIdx non è presente (vecchie azioni o IA)
                        const originalTarget = workingTeams[action.targetPlayer]?.[action.targetIdx];
                        if (originalTarget && (originalTarget.hp <= 0 || !workingField[action.targetPlayer]?.includes(action.targetIdx))) {
                            if (move.targetMode !== 'revive') {
                                const anyAlive = (workingField[action.targetPlayer] || []).filter(i => workingTeams[action.targetPlayer]?.[i]?.hp > 0);
                                if (anyAlive.length > 0) {
                                    finalTargetIdx = anyAlive[0];
                                } else {
                                    finalTargetIdx = null;
                                }
                            } else {
                                finalTargetIdx = action.targetIdx;
                            }
                        }
                    }

                    if (finalTargetIdx !== null) {
                        const fTgtChar = workingTeams[action.targetPlayer]?.[finalTargetIdx];
                        if (fTgtChar) {
                            resolvedTargets.push({
                                player: action.targetPlayer,
                                idx: finalTargetIdx,
                                fieldIdx: workingField[action.targetPlayer].indexOf(finalTargetIdx),
                                char: fTgtChar
                            });
                        }
                    }
                }

                // Il colpo finale consuma due cariche UNA volta per mossa,
                // così il bonus vale per tutti i bersagli e colpi del finisher.
                if(resolvedTargets.some(t=>t.char?.hp>0) && consumeHeatBurst(attacker,move)){
                  heatBurstActive=true;
                  events.push({type:'text',text:'🔥 '+attacker.name+
                    ' consuma 2 Cariche Calore! '+move.name+' infligge +25% danni!'});
                }
                let attackSucceeded = false;
                let futureStrikeDealtDamage = false;
                if(prepareQilinAttack(attacker,move)){
                  events.push({type:'text',text:'❄️ '+attacker.name+
                    ' attiva Fioritura del Qilin! Il prossimo attacco Ghiaccio infligge +35% danni!',
                    isPassive:true,passiveChar:attacker.name,passiveName:'Rugiada Qilin'});
                }

                for (let t of resolvedTargets) {
                    if (t.char.hp <= 0 && move.targetMode !== 'revive') continue;
                    
                    if (move.targetMode === 'revive' && t.char.hp > 0) {
                         events.push({ type: 'text', text: `${attacker.name} usa ${move.name}, ma ${t.char.name} è già in vita!` });
                         continue;
                    }

                    // --- REDIRECT LOGIC (SALI SULLA MIA SCHIENA) ---
                    let isRedirectedDmgReduced = false;
                    let inGroppaStatus = t.char.statuses.find(s => s.type === 'In_Groppa');
                    // MODIFICA: Yoshi devia l'attacco SOLO se non è un attacco ad area (altrimenti verrebbe colpito due volte dalla stessa esplosione!)
                    if (!move.ignoreTaunt && inGroppaStatus && inGroppaStatus.protectorIdx !== undefined) {
                        if (!move.targetCount || move.targetCount < 4) {
                            const pPlayer = inGroppaStatus.protectorPlayer || t.player;
                            const protectorChar = workingTeams[pPlayer]?.[inGroppaStatus.protectorIdx];
                            const protectorFieldIdx = workingField[pPlayer].indexOf(inGroppaStatus.protectorIdx);

                            if (protectorChar && protectorChar.hp > 0 && protectorFieldIdx !== -1) {
                                events.push({ type: 'text', text: `🛡️ L'attacco mirato a ${t.char.name} viene deviato su ${protectorChar.name}! (Danni Dimezzati)` });
                                t.char = protectorChar;
                                t.idx = inGroppaStatus.protectorIdx;
                                t.player = pPlayer; // FIX: Aggiorna il player per i calcoli successivi
                                t.fieldIdx = protectorFieldIdx;
                                isRedirectedDmgReduced = true;
                            } else {
                                // Failsafe: Se Yoshi non è in campo per un qualsiasi motivo, pulisci lo status per sicurezza
                                const gIdx = t.char.statuses.findIndex(s => s.type === 'In_Groppa');
                                if (gIdx !== -1) t.char.statuses.splice(gIdx, 1);
                            }
                        } else {
                            events.push({ type: 'text', text: `⚠️ L'attacco nemico è ad area! La protezione In Groppa non può deviare l'attacco su Yoshi!` });
                        }
                    }
                    // --- END REDIRECT LOGIC ---

                    // --- REDIRECT LOGIC (BODYGUARD PASSIVA - Es. Scheletro) ---
                    if (!move.ignoreTaunt && (!move.targetCount || move.targetCount < 4)) {
                        let hasBodyguard = false;
                        let protectorFieldIdx = -1;
                        let protectorCharIdx = -1;
                        
                        for (let fIdx = 0; fIdx < workingField[t.player].length; fIdx++) {
                            const possibleProtectorIdx = workingField[t.player][fIdx];
                            const possibleProtector = workingTeams[t.player]?.[possibleProtectorIdx];
                            
                            if (possibleProtector && possibleProtector.hp > 0 && possibleProtector.id !== t.char.id) {
                                if (possibleProtector.passive && possibleProtector.passive.type === 'bodyguard' && possibleProtector.passive.protectAlly === t.char.name) {
                                    hasBodyguard = true;
                                    protectorFieldIdx = fIdx;
                                    protectorCharIdx = possibleProtectorIdx;
                                    break; 
                                }
                            }
                        }

                        if (hasBodyguard && protectorCharIdx !== -1) {
                            const protectorChar = workingTeams[t.player][protectorCharIdx];
                            events.push({ type: 'text', text: `🛡️ ${protectorChar.name} si lancia per proteggere ${t.char.name}! Intercetta l'attacco!`, isPassive: true, passiveChar: protectorChar.name, passiveName: protectorChar.passive.name });
                            t.char = protectorChar;
                            t.idx = protectorCharIdx;
                            t.fieldIdx = protectorFieldIdx;
                        }
                    }
                    // --- END REDIRECT BODYGUARD LOGIC ---

                    // --- CHECK ALLY TARGET FOR IMMUNITIES ---
                    const isAllyTargeted = move.targetMode === 'team' || move.targetMode === 'team_smart_heal' || move.targetMode === 'ally' || move.targetMode === 'revive' || move.target === 'self';

                    let multiplier = isAllyTargeted ? 1 : getMultiplier(move.type, t.char.types);
                    let isImmuneDueToPassive = false;

                    // --- GESTIONE PASSIVE: IMMUNITÀ E RESISTENZE ---
                    if (!isAllyTargeted && t.char.passive && (t.char.passive.immuneToType === move.type || (t.char.passive.immuneTypes && t.char.passive.immuneTypes.includes(move.type)))) {
                        multiplier = 0;
                        isImmuneDueToPassive = true;
                    }

                    // --- BYPASS IMMUNITÀ PER MOSSE SCRIPTATE (Boss) ---
                    if (move.ignoreImmunities && multiplier === 0) {
                        multiplier = 1;
                        isImmuneDueToPassive = false;
                    }

                    // --- CHECK ENEMY FOR PROTECT ---
                    let isEnemyTarget = t.player !== player;
                    if (gameState.gameMode === 'multipla') {
                         const team1 = ['p1', 'p2'];
                         isEnemyTarget = (team1.includes(player) !== team1.includes(t.player));
                    } else if (gameState.gameMode === 'juggernaut' || gameState.gameMode === 'survival') {
                         const juggPlayer = gameState.settings.juggernautPlayer || (gameState.gameMode === 'survival' ? 'p2' : 'p1');
                         isEnemyTarget = (player === juggPlayer) !== (t.player === juggPlayer);
                    } else if (gameState.gameMode === 'torneo') {
                         isEnemyTarget = getTournamentMatchOpponents(player).includes(t.player);
                    }

                    const victimHpBeforeHit = t.char.hp;
                    const bypassEnemyShields = ignoresShields(attacker,move);
                    let isProtectedFromEnemy = !bypassEnemyShields && isEnemyTarget && t.char.statuses.some(s => s.type === 'Protetto' || s.type === 'Rashield');

                    let isInvincibleShield = false;
                    let isPerfectBarrier = false;
                    let isFirstHitProtection = false; // Diamante Bianco: il primo attacco è ridotto, non annullato

                    // Doppio Fantasma assorbe un intero attacco diretto, non un singolo hit.
                    if(isEnemyTarget && consumeZodiacDodge(t.char)){
                      events.push({type:'text',text:`👥 Doppio Fantasma! ${t.char.name} evita completamente l'attacco di ${attacker.name}!`});
                      updateStatusUI(t.player,t.idx);
                      attackSucceeded=true;
                      continue;
                    }
                    // Elusione individuale: una mossa con precisione 100% contro Bugs
                    // colpisce solo nell'80% dei casi dopo un uso di Dentro la Tana.
                    // Il controllo è per bersaglio, anche per gli attacchi ad area.
                    if (isEnemyTarget && Math.random() < Math.min(.55,totalEvasionChance(t.char,workingWeather,getHeldEvasion(t.char))+cloverExtraEvasion(t.char))) {
                        events.push({type:'text',text:`💨 ${t.char.name} evita l’attacco grazie alla propria elusione, al meteo, alla passiva o allo strumento equipaggiato!`});
                        if(triggerCloverDodge(t.char))
                            events.push({type:'text',text:`💄 ${t.char.name} attiva Istinto da Copertina: Attacco +12% dopo la schivata!`,
                              isPassive:true,passiveChar:t.char.name,passiveName:'Istinto da Copertina'});
                        continue;
                    }

                    if (t.char.id.startsWith('celljr_') && isEnemyTarget) {
                        const teamAlive = workingTeams[t.player].filter(c => c.hp > 0);
                        if (teamAlive.some(c => c.id === 'natsu' || c.id === 'po')) {
                            isInvincibleShield = true;
                        }
                    }
                    if (t.char.id === 'cell' && gameState.isCampaignBattle && isEnemyTarget) {
                        const teamAlive = workingTeams[t.player].filter(c => c.hp > 0);
                        if (teamAlive.some(c => c.id.startsWith('celljr_'))) {
                            isPerfectBarrier = true;
                        }
                    }
                    if (t.char.passive?.type === 'first_hit_immunity' && !t.char.firstHitImmunityUsed &&
                        isEnemyTarget && !bypassEnemyShields) {
                        isFirstHitProtection = true;
                    }

                    if (!bypassEnemyShields && (isProtectedFromEnemy || isInvincibleShield || isPerfectBarrier)) {
                        if (isProtectedFromEnemy) {
                            events.push({ type: 'text', text: `🛡️ ${t.char.name} si è protetto dall'attacco di ${attacker.name}!` });
                            if (triggerFutureBlock(t.char, move)) {
                                events.push({ type: 'text', text: `🔮 ${t.char.name} attiva Futuro Infrangibile! Il prossimo attacco offensivo infliggerà +25% danni! (${t.char.futureBlockUses}/2)`, isPassive: true, passiveChar: t.char.name, passiveName: t.char.passive.name });
                            }
                            if (t.char.statuses.some(s => s.type === 'Rashield') && attacker.hp > 0 && move.power > 0) {
                                let hitDmg = calculateDamage(attacker, t.char, move, multiplier, isFirstAttackOfTurn);
                                let recoil = Math.max(1, Math.floor(hitDmg * 0.25));
                                applyDamage(attacker, recoil, player, charTeamIdx, `⚡ Lo scudo di ${t.char.name} riflette l'attacco! ${attacker.name} subisce ${recoil} danni!`);
                            }
                        } else if (isInvincibleShield) {
                            events.push({ type: 'text', text: `🛡️ Lo Scudo Invincibile blocca l'attacco su ${t.char.name}! Sconfiggi Natsu o Po prima!` });
                        } else if (isPerfectBarrier) {
                            events.push({ type: 'text', text: `🛡️ La Barriera Perfetta protegge Cell! Sconfiggi prima tutti i Cell Jr.!` });
                        }
                        attackSucceeded = true;
                        continue; // SCARTA TUTTO IL RESTO (Danni, status, debuff)
                    }
                    if (isFirstHitProtection) {
                        t.char.firstHitImmunityUsed = true;
                        events.push({ type: 'text', text: `💎 ${t.char.name} attiva ${t.char.passive.name}! Subisce il 70% di danni in meno dal primo attacco e blocca gli effetti negativi!`, isPassive: true, passiveChar: t.char.name, passiveName: t.char.passive.name });
                    }
                    
                    let superEffectiveResisted = false;
                    if (multiplier > 1 && t.char.passive && t.char.passive.type === 'resist_super_effective') {
                        multiplier = 1 + ((multiplier - 1) * (1 - t.char.passive.reduction));
                        superEffectiveResisted = true;
                        events.push({ type: 'text', text: `🧽 ${t.char.name} attiva ${t.char.passive.name}! L'attacco superefficace viene parzialmente assorbito!`, isPassive: true, passiveChar: t.char.name, passiveName: t.char.passive.name });
                    }
                    // ----------------------------------
                    
                    let effectivenessText = "";
                    if (isImmuneDueToPassive) effectivenessText = ` Ma ${t.char.name} ne è immune grazie a ${t.char.passive.name}!`;
                    else if (superEffectiveResisted) effectivenessText = ` È superefficace! Ma attutito da ${t.char.passive.name}!`;
                    else if (multiplier > 1) effectivenessText = " È superefficace!";
                    else if (multiplier < 1 && multiplier > 0) {
                        effectivenessText = " Non è molto efficace...";
                        if (attacker.passive && attacker.passive.type === 'perfezione_assoluta' && attacker.hp > 0) {
                            if (applyPerfezioneBonus(attacker,'atk'))
                                events.push({ type: 'text', text: `✨ ${attacker.name} attiva ${attacker.passive.name}! La resistenza avversaria accende la sua lama: Attacco +15%! (massimo 2 volte)`, isPassive: true, passiveChar: attacker.name, passiveName: attacker.passive.name });
                        }
                    }
                    else if (multiplier === 0) effectivenessText = " Non ha alcun effetto!";
                    
                    if (multiplier === 0) {
                        events.push({ type: 'text', text: `${attacker.name} usa ${move.name} su ${t.char.name}!${effectivenessText}` });
                        
                        // POTENZIAMENTO DOPO AVER ASSORBITO UN ATTACCO PER CUI SI È IMMUNI (Es. Zuko - Parafulmine)
                        if (isImmuneDueToPassive && t.char.passive.statBuffOnImmune) {
                            let statTexts = [];
                            if (t.char.passive.statBuffOnImmune.atk) { applyBattleStatModifier(t.char, 'atk', t.char.passive.statBuffOnImmune.atk); statTexts.push("Attacco"); }
                            if (t.char.passive.statBuffOnImmune.def) { applyBattleStatModifier(t.char, 'def', t.char.passive.statBuffOnImmune.def); statTexts.push("Difesa"); }
                            if (t.char.passive.statBuffOnImmune.spd) { applyBattleStatModifier(t.char, 'spd', t.char.passive.statBuffOnImmune.spd); statTexts.push("Velocità"); }
                            events.push({ type: 'text', text: `⚡ ${t.char.name} assorbe l'energia dell'attacco! Aumenta ${statTexts.join(" e ")}!`, isPassive: true, passiveChar: t.char.name, passiveName: t.char.passive.name });
                        }
                        
                        continue;
                    }

                    const wasAlive = t.char.hp > 0;
                    
                    let isMagnetic = false;
                    const magIdx = t.char.statuses.findIndex(s => s.type === 'Magnetico');
                    if (magIdx !== -1 && move.type === 'Elettro') {
                        isMagnetic = true;
                        t.char.statuses.splice(magIdx, 1);
                        updateStatusUI(t.player, t.idx);
                    }

                    if (move.percentDmgCurrent || move.percentDmgMax) {
                        let dmg = 0;
                        if (move.percentDmgCurrent) {
                            dmg = Math.max(1, Math.floor(t.char.hp * move.percentDmgCurrent));
                        } else {
                            dmg = Math.max(1, Math.floor(t.char.maxHp * move.percentDmgMax));
                        }
                        if (isRedirectedDmgReduced) dmg = Math.max(1, Math.floor(dmg * 0.5));
                        if (isFirstHitProtection) dmg = Math.max(1,Math.floor(dmg * firstHitProtectionFactor(t.char,true)));
                        
                        // --- PASSIVA RIDUZIONE DANNO IN BASE ALLA MOSSA SCELTA ---
                        if (t.char.passive && t.char.passive.type === 'damage_reduction_on_move') {
                            const targetAction = currentActions[t.player]?.[t.idx];
                            if (targetAction && targetAction.type === 'attack' && t.char.moves[targetAction.moveIdx]) {
                                const targetMove = t.char.moves[targetAction.moveIdx];
                                if (targetMove.name === t.char.passive.moveName) {
                                    dmg = Math.max(1, Math.floor(dmg * (1 - t.char.passive.reduction)));
                                    events.push({ type: 'text', text: `👻 ${t.char.name} attiva ${t.char.passive.name}! Danni ridotti!`, isPassive: true, passiveChar: t.char.name, passiveName: t.char.passive.name });
                                }
                            }
                        }

                        // --- PASSIVA RIDUZIONE DANNI FISICI ---
                        if (t.char.passive && t.char.passive.type === 'damage_reduction') {
                            const physicalTypes = ['Normale', 'Lotta', 'Roccia', 'Terra', 'Insetto', 'Robot', 'Drago'];
                            if (physicalTypes.includes(move.type)) {
                                dmg = Math.max(1, Math.floor(dmg * (1 - t.char.passive.physicalReduction)));
                                events.push({ type: 'text', text: `🛡️ ${t.char.name} si deforma attivando ${t.char.passive.name}! Danni fisici ridotti!`, isPassive: true, passiveChar: t.char.name, passiveName: t.char.passive.name });
                            }
                        }
                        // -----------------------------------------------------------
                        
                        const raidHit=!bypassEnemyShields&&consumeRaidShieldHit(t.char);
                        if(raidHit?.absorbed) {
                             events.push(createRaidShieldUpdateEvent(t.player,t.idx,raidHit.remaining,`${attacker.name} usa ${move.name} su ${t.char.name}... ma lo Scudo ha assorbito l'attacco! (${raidHit.remaining} cariche scudo rimaste)`));
                            if(raidHit.broken) {
                                events.push({ type: 'text', text: `🛡️ Lo Scudo di ${t.char.name} si è infranto!` });
                                if (!t.char.isRoguelikeBoss) {
let recoilDmg = Math.max(5, Math.floor(t.char.maxHp * 0.05));
                                applyDamage(t.char, recoilDmg, t.player, t.idx, `💥 La frantumazione dello scudo infligge ${recoilDmg} danni a ${t.char.name}!`);
                                 }
                            }
                        } else {
                            applyDamage(t.char, dmg, t.player, t.idx, `${attacker.name} usa ${move.name} su ${t.char.name}!${effectivenessText} Gli toglie ${dmg} PS!`, {isOffensiveMove:true,attacker,attackerPlayer:player,attackerIdx:charTeamIdx,move,isEnemyTarget});
                        }
                        attackSucceeded = true;
                    } else if (move.power > 0) {
                        let hits = 1;
                        if (move.multiHit) {
                            hits = Math.floor(Math.random() * (move.multiHit.max - move.multiHit.min + 1)) + move.multiHit.min;
                        }

                        let totalDmg = 0;
                        let actualHits = 0;
                        let juggHitsAbsorbed = 0;
                        let landedCriticalHit = false;

                        for (let i = 0; i < hits; i++) {
                            // Ogni singolo colpo andato a segno consuma esattamente
                            // UNA carica, anche con mosse da 2–4 colpi.
                            const raidHit=!bypassEnemyShields&&consumeRaidShieldHit(t.char);
                            if (raidHit?.absorbed) {
                                juggHitsAbsorbed++;
                                actualHits++;
                                 events.push(createRaidShieldUpdateEvent(t.player,t.idx,raidHit.remaining,`${attacker.name} usa ${move.name} su ${t.char.name}: lo Scudo assorbe il colpo ${i+1}${hits>1?`/${hits}`:''}! (${raidHit.remaining} cariche rimaste)`));
                                if (raidHit.broken) {
                                    events.push({ type: 'text', text: `🛡️ Lo Scudo di ${t.char.name} si è infranto!` });
                                    // Danno da contraccolpo per rottura scudo (5% HP Max)
                                    if (!t.char.isRoguelikeBoss) {
let recoilDmg = Math.max(5, Math.floor(t.char.maxHp * 0.05));
                                    applyDamage(t.char, recoilDmg, t.player, t.idx, `💥 La frantumazione dello scudo infligge ${recoilDmg} danni a ${t.char.name}!`);
                                 }
                                }
                                continue;
                            }

                            let currentMoveForDmg = move;
                            if(move.scalingEnemyCount){
                              const opp=affectedOpponents(player,gameState.gameMode,activeMatchPlayers,getTournamentMatchOpponents,gameState.settings);
                              const n=opp.reduce((sum,p)=>sum+(workingField[p]||[]).filter(i=>workingTeams[p]?.[i]?.hp>0).length,0);
                              currentMoveForDmg={...move,power:powerForAccordo(n)};
                            }
                            if(move.bonusIfSlowed)currentMoveForDmg={...currentMoveForDmg,power:effectiveTaserPower(t.char)};
                            if(move.spoutLowHpPower)
                              currentMoveForDmg={...currentMoveForDmg,power:frillishSpoutPower(t.char,move)};
                            let isCritical = false;
                            let critMultiplier = 1.0;

                            // Gestione critico specifico (es. Shotgun di Neon) o Critico Universale al 5%
                            if (!immuneToCritical(t.char) && move.critChance && Math.random() < move.critChance) {
                                currentMoveForDmg = { ...move, power: move.critPower };
                                isCritical = true;
                            } else if (!immuneToCritical(t.char) && Math.random() < Math.min(0.5,0.05+strawHatCritBonus(attacker,move))) { // 5% base con bonus dei nuovi capitani
                                isCritical = true;
                                critMultiplier = 1.5; // +50% danno
                            }

                            if (isCritical) landedCriticalHit = true;
                            if (isCritical && i === 0) {
                                events.push({ type: 'text', text: `💥 BOOM! Colpo Critico di ${attacker.name}!` });
                                if (attacker.passive && attacker.passive.type === 'perfezione_assoluta' && attacker.hp > 0) {
                                    if (applyPerfezioneBonus(attacker,'spd'))
                                        events.push({ type: 'text', text: `✨ ${attacker.name} attiva ${attacker.passive.name}! Il colpo perfetto aumenta la sua Velocità del 15%! (massimo 2 volte)`, isPassive: true, passiveChar: attacker.name, passiveName: attacker.passive.name });
                                }
                            }

                            let hitDmg = calculateDamage(attacker, t.char, currentMoveForDmg, multiplier, isFirstAttackOfTurn);
                            if (i === 0 && selectedPassiveDamageFactor(attacker, t.char, currentMoveForDmg) > 1 &&
                                ['flames_unextinguished','born_adventurer'].includes(attacker.passive?.type)) {
                                events.push({ type: 'text', text: `✨ ${attacker.name} attiva ${attacker.passive.name}: danni potenziati!`, isPassive: true, passiveChar: attacker.name, passiveName: attacker.passive.name });
                            }
                            
                            // Applica il moltiplicatore critico base se attivato
                            if (critMultiplier > 1.0) {
                                hitDmg = Math.max(1, Math.floor(hitDmg * critMultiplier));
                            }
                            
                            if (isMagnetic) hitDmg *= 2;
                            if (isRedirectedDmgReduced) hitDmg = Math.max(1, Math.floor(hitDmg * 0.5));
                            
                            // --- PASSIVA RIDUZIONE DANNO IN BASE ALLA MOSSA SCELTA ---
                            if (t.char.passive && t.char.passive.type === 'damage_reduction_on_move') {
                                const targetAction = currentActions[t.player]?.[t.idx];
                                if (targetAction && targetAction.type === 'attack' && t.char.moves[targetAction.moveIdx]) {
                                    const targetMove = t.char.moves[targetAction.moveIdx];
                                    if (targetMove.name === t.char.passive.moveName) {
                                        hitDmg = Math.max(1, Math.floor(hitDmg * (1 - t.char.passive.reduction)));
                                        if (i === 0) {
                                            events.push({ type: 'text', text: `👻 ${t.char.name} attiva ${t.char.passive.name}! Danni ridotti!`, isPassive: true, passiveChar: t.char.name, passiveName: t.char.passive.name });
                                        }
                                    }
                                }
                            }

                            // --- PASSIVA RIDUZIONE DANNI FISICI ---
                            if (t.char.passive && t.char.passive.type === 'damage_reduction') {
                                const physicalTypes = ['Normale', 'Lotta', 'Roccia', 'Terra', 'Insetto', 'Robot', 'Drago'];
                                if (physicalTypes.includes(currentMoveForDmg.type)) {
                                    hitDmg = Math.max(1, Math.floor(hitDmg * (1 - t.char.passive.physicalReduction)));
                                    if (i === 0) {
                                        events.push({ type: 'text', text: `🛡️ ${t.char.name} si deforma attivando ${t.char.passive.name}! Danni fisici ridotti!`, isPassive: true, passiveChar: t.char.name, passiveName: t.char.passive.name });
                                    }
                                }
                            }
                            // -----------------------------------------------------------

                            if (isFirstHitProtection) hitDmg = Math.max(1,Math.floor(hitDmg * firstHitProtectionFactor(t.char,true)));
                            // --- GESTIONE CURE SU ALLEATI CON DANNO (es. Tempesta di Farfalle) ---
                            if (!isEnemyTarget && move.healAlliesByDamage) {
                                const healAmount = hitDmg;
                                t.char.hp = Math.min(t.char.maxHp, t.char.hp + healAmount);
                                events.push({ type: 'damage', text: `✨ ${attacker.name} usa ${move.name} su ${t.char.name}! La magia lo cura di ${healAmount} PS!${effectivenessText}`, targetPlayer: t.player, targetIdx: t.idx, newHp: t.char.hp });
                                attackSucceeded = true;
                                break; // Usciamo dal loop dei colpi multipli (le cure sono istantanee)
                            }

                            totalDmg += hitDmg;
                            actualHits++;
                            
                            if (move.hitStatDebuff && !isFirstHitProtection && !immuneToStatDrops(t.char) && Math.random() < move.hitStatDebuff.chance) {
                                let statTexts = [];
                                if (move.hitStatDebuff.def) { applyBattleStatModifier(t.char, 'def', move.hitStatDebuff.def); statTexts.push("la Difesa"); }
                                if (move.hitStatDebuff.atk) { 
                                    if (t.char.passive && t.char.passive.type === 'immune_to_atk_debuff') {
                                        events.push({ type: 'text', text: `🛡️ ${t.char.name} è immune al calo di Attacco grazie a ${t.char.passive.name}!`, isPassive: true, passiveChar: t.char.name, passiveName: t.char.passive.name });
                                    } else {
                                        applyBattleStatModifier(t.char, 'atk', move.hitStatDebuff.atk); statTexts.push("l'Attacco"); 
                                    }
                                }
                                if (move.hitStatDebuff.spd) { applyBattleStatModifier(t.char, 'spd', move.hitStatDebuff.spd); statTexts.push("la Velocità"); }
                                if (move.hitStatDebuff.acc && !isEchoRaidAccuracyProtected(t.char)) { t.char.acc = (t.char.acc || 1.0) * hakiStatDebuffMultiplier(t.char,move.hitStatDebuff.acc); statTexts.push("la Precisione"); }
                                if (statTexts.length) events.push({ type: 'text', text: `Il colpo riduce ${statTexts.join(" e ")} di ${t.char.name}!` });
                                else if(move.hitStatDebuff.acc && isEchoRaidAccuracyProtected(t.char)) events.push({type:'text',text:'🛡️ Aura Suprema: Echomax è immune alla riduzione di Precisione!'});
                            }

                            if (t.char.isRoguelikeBoss) {
                                const shield = activateRoguelikeBossShield(t.char, t.char.hp - totalDmg);
                                if (shield) events.push(createRaidShieldUpdateEvent(
                                    t.player, t.idx, shield.hits,
                                    `🛡️ ${t.char.name} raggiunge il ${shield.thresholdPercent}% di PS e attiva uno scudo da ${shield.hits} colpi!`, true));
                            } else if (t.char.juggShieldHpThresholds && t.char.juggShieldHpThresholds.length > 0) {
                                let thresholdTriggered = false;
                                while (t.char.juggShieldHpThresholds.length > 0 && ((t.char.hp - totalDmg) / t.char.maxHp) <= t.char.juggShieldHpThresholds[0]) {
                                    t.char.juggShieldHpThresholds.shift();
                                    thresholdTriggered = true;
                                }
                                if (thresholdTriggered) {
                                    const hitsToGrant = t.char.shieldGrantedHits || 4;
                                    t.char.juggHitsRemaining = hitsToGrant;
                                    events.push(createRaidShieldUpdateEvent(t.player,t.idx,hitsToGrant, `💥 ${t.char.name} si infuria! Uno Scudo Assoluto assorbirà i prossimi ${hitsToGrant} colpi! 💥`, true));
                                }
                            }

                            if (t.char.hp - totalDmg <= 0) break;
                        }

                        attackSucceeded = true;

                        let hitText = actualHits > 1 ? ` Colpisce ${actualHits} volte!` : '';
                        let magText = isMagnetic ? ` Lo stato Magnetico raddoppia i danni!` : '';
                        let groppaText = attacker.statuses.some(s => s.type === 'In_Groppa') ? ` (Danni +25% in Groppa!)` : '';

                        if (juggHitsAbsorbed > 0 && totalDmg === 0) {
                             // I singoli colpi assorbiti sono già mostrati dagli eventi raid_shield_update.
                        } else if (totalDmg > 0) {
                            let shieldTxt = juggHitsAbsorbed > 0 ? ` (Lo scudo ha assorbito ${juggHitsAbsorbed} colpi).` : '';
                            const previousDamageTaken=t.char.damageTakenThisTurn||0;
                            applyDamage(t.char, totalDmg, t.player, t.idx, `${attacker.name} usa ${move.name} su ${t.char.name}!${effectivenessText}${hitText}${magText}${groppaText} Infligge ${totalDmg} danni.${shieldTxt}`, {directAttack:true,directHits:Math.max(0,actualHits-juggHitsAbsorbed),bypassShields:bypassEnemyShields,superEffective:multiplier>1,attacker,attackerPlayer:player,attackerIdx:charTeamIdx,move,isEnemyTarget});
                            if(markCompassOnHit(attacker,t.char,victimHpBeforeHit,totalDmg))
                              events.push({type:'text',text:`🧭 Bussola del Predatore di ${attacker.name}: colpo potenziato contro bersaglio indebolito!`});
                            if(isEnemyTarget && !isFirstHitProtection && t.char.hp>0 && (t.char.damageTakenThisTurn||0)>previousDamageTaken){
                              if(activateCupidArrow(attacker,move,t.char)){
                                updateStatusUI(t.player,t.idx);
                                events.push({type:'text',text:`💘 Freccia di Cupido! ${t.char.name} è infatuato!`});
                              }
                              if(hannibalCanDebuff(attacker,t.char)){
                                const weakened=randomDebuff(t.char);
                                events.push({type:'text',text:`🧠 Manipolazione Psicologica di ${attacker.name}: ${weakened} di ${t.char.name} -15%!`,isPassive:true,passiveChar:attacker.name,passiveName:attacker.passive.name});
                              }
                              const cleared=activateNeutralizingSpray(t.char);
                              if(cleared.length){
                                updateStatusUI(t.player,t.idx);
                                events.push({type:'text',text:`🧴 Spray Neutralizzante di ${t.char.name}: rimuove ${cleared.join(', ')}!`});
                              }
                            }
                            if (!isFirstHitProtection && canDistortSoul(attacker, move, t.char) && !t.char.statuses.some(s => s.type === 'Anima Distorta')) {
                                t.char.statuses.push({ type: 'Anima Distorta', turns: 99 });
                                updateStatusUI(t.player, t.idx);
                                events.push({ type: 'text', text: `👁️ ${attacker.name} distorce l'anima di ${t.char.name}! Perde il 5% dei PS ogni turno e subisce più danni da Mahito.` });
                            }
                        } else {
                            applyDamage(t.char, totalDmg, t.player, t.idx, `${attacker.name} usa ${move.name} su ${t.char.name}!${effectivenessText} Infligge ${totalDmg} danni.`, {directAttack:true,bypassShields:bypassEnemyShields,superEffective:multiplier>1,attacker,attackerPlayer:player,attackerIdx:charTeamIdx,move,isEnemyTarget});
                            markCompassOnHit(attacker,t.char,victimHpBeforeHit,totalDmg);
                        }
                        
                        if (isEnemyTarget && t.char.hp < victimHpBeforeHit && move.power > 0) {
                            if (attacker.passive?.type === 'unbreakable_future' && attacker.futureStrikeCharged) {
                                futureStrikeDealtDamage = true;
                            }
                            if (landedCriticalHit) {
                                const jackpot = triggerJackpot(attacker, applyBattleStatModifier);
                                if (jackpot) {
                                    events.push({ type: 'damage', targetPlayer: player, targetIdx: charTeamIdx, newHp: attacker.hp,
                                        text: `🎰 ${attacker.name} attiva Jackpot! Recupera ${jackpot.healed} PS e guadagna +10% Velocità! (${jackpot.uses}/2)`,
                                        isPassive: true, passiveChar: attacker.name, passiveName: attacker.passive.name });
                                }
                            }
                        }

                        if(isEnemyTarget && totalDmg>0 && t.char.hp===0 && activateVictoryBoots(attacker))
                            events.push({type:'text',text:`👢 Stivali dello Slancio: ${attacker.name} guadagna +15% Velocità per il prossimo turno!`});
                        // Daffy beneficia dei KO realizzati dagli ALTRI alleati in campo:
                        // funziona in doppio/multipla, mai per il proprio KO.
                        if (totalDmg > 0 && t.char.hp === 0 && isEnemyTarget && !t.char.daffyAllyKoAlreadyHandled) {
                            t.char.daffyAllyKoAlreadyHandled = true;
                            const allyPlayers = gameState.gameMode === 'multipla'
                                ? (['p1','p2'].includes(player) ? ['p1','p2'] : ['p3','p4'])
                                : [player];
                            allyPlayers.forEach(allyPlayer => {
                                (workingField[allyPlayer] || []).forEach(allyIdx => {
                                    const ally = workingTeams[allyPlayer]?.[allyIdx];
                                    if (!ally || ally.hp <= 0 || ally === attacker || ally.id !== 'daffyduck') return;
                                    const heal = daffyCelebration(ally);
                                    if (heal > 0) events.push({type:'damage',targetPlayer:allyPlayer,targetIdx:allyIdx,newHp:ally.hp,
                                        text:`🎬 ${ally.name} attiva Protagonista Mancato: +10% Attacco, recupera fino a ${heal} PS!`,
                                        isPassive:true,passiveChar:ally.name,passiveName:'Protagonista Mancato'});
                                });
                            });
                        }

                        // Riflesso Danno
                        if (t.char.statuses.some(s => s.type === 'Riflesso') && totalDmg > 0 && attacker.hp > 0) {
                            let recoil = Math.max(1, Math.floor(totalDmg * 0.3));
                            applyDamage(attacker, recoil, player, charTeamIdx, `${t.char.name} respinge l'attacco! ${attacker.name} subisce ${recoil} danni di riflesso!`);
                        }

                        if (move.recoil && totalDmg > 0 && attacker.hp > 0) {
                            const recoilDmg = Math.max(1, Math.floor(totalDmg * move.recoil));
                            applyDamage(attacker, recoilDmg, player, charTeamIdx, `${attacker.name} subisce ${recoilDmg} danni di contraccolpo!`);
                        }

                        if (move.drain && totalDmg > 0 && attacker.hp > 0) {
                            const healAmount = Math.max(1, Math.floor(totalDmg * move.drain));
                            attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAmount);
                            events.push({ type: 'damage', text: `${attacker.name} assorbe energia e recupera ${healAmount} HP!`, targetPlayer: player, targetIdx: charTeamIdx, newHp: attacker.hp });
                        }

                        if (move.targetStatDebuff && !isFirstHitProtection && t.char.hp > 0 && !immuneToStatDrops(t.char)) {
                            let statTexts = [];
                            if (move.targetStatDebuff.atk) { 
                                if (t.char.passive && t.char.passive.type === 'immune_to_atk_debuff') {
                                    events.push({ type: 'text', text: `🛡️ ${t.char.name} è immune al calo di Attacco grazie a ${t.char.passive.name}!`, isPassive: true, passiveChar: t.char.name, passiveName: t.char.passive.name });
                                } else {
                                    applyBattleStatModifier(t.char, 'atk', move.targetStatDebuff.atk); statTexts.push("Attacco"); 
                                }
                            }
                            if (move.targetStatDebuff.def) { applyBattleStatModifier(t.char, 'def', move.targetStatDebuff.def); statTexts.push("Difesa"); }
                            if (move.targetStatDebuff.spd) { applyBattleStatModifier(t.char, 'spd', move.targetStatDebuff.spd); statTexts.push("Velocità"); }
                            if (move.targetStatDebuff.acc && !isEchoRaidAccuracyProtected(t.char)) { t.char.acc = (t.char.acc || 1.0) * hakiStatDebuffMultiplier(t.char,move.targetStatDebuff.acc); statTexts.push("Precisione"); }
                            if (move.targetStatDebuff.accFlat && !isEchoRaidAccuracyProtected(t.char)) { t.char.acc = Math.max(0.1, (t.char.acc || 1.0) - move.targetStatDebuff.accFlat * (t.char.id==='luffy' && t.char.hakiGuardTurns>0?0.5:1)); statTexts.push("Precisione"); }
                            if (statTexts.length > 0) {
                                events.push({ type: 'text', text: `${statTexts.join(" e ")} di ${t.char.name} diminuisce!` });
                            }
                        }

                        // LOGICA RIMOZIONE POTENZIAMENTI
                        if (move.removeBuffs && !isFirstHitProtection && t.char.hp > 0 && !immuneToStatDrops(t.char)) {
                            let removed = false;
                            if (t.char.atk > t.char.baseAtk) { t.char.atk = t.char.baseAtk; removed = true; }
                            if (t.char.def > t.char.baseDef) { t.char.def = t.char.baseDef; removed = true; }
                            if (t.char.spd > t.char.baseSpd) { t.char.spd = t.char.baseSpd; removed = true; }
                            if (removed) {
                                events.push({ type: 'text', text: `I potenziamenti di ${t.char.name} sono stati annullati da ${move.name}!` });
                            }
                        }
                    } else {
                        attackSucceeded = true;
                        if (move.targetMode !== 'revive') {
                            events.push({ type: 'text', text: `${attacker.name} usa ${move.name} su ${t.char.name}!` });
                        }
                        
                        if (move.targetStatDebuff && !isFirstHitProtection && t.char.hp > 0 && !immuneToStatDrops(t.char)) {
                            let statTexts = [];
                            if (move.targetStatDebuff.atk) { 
                                if (t.char.passive && t.char.passive.type === 'immune_to_atk_debuff') {
                                    events.push({ type: 'text', text: `🛡️ ${t.char.name} è immune al calo di Attacco grazie a ${t.char.passive.name}!`, isPassive: true, passiveChar: t.char.name, passiveName: t.char.passive.name });
                                } else {
                                    applyBattleStatModifier(t.char, 'atk', move.targetStatDebuff.atk); statTexts.push("Attacco"); 
                                }
                            }
                            if (move.targetStatDebuff.def) { applyBattleStatModifier(t.char, 'def', move.targetStatDebuff.def); statTexts.push("Difesa"); }
                            if (move.targetStatDebuff.spd) { applyBattleStatModifier(t.char, 'spd', move.targetStatDebuff.spd); statTexts.push("Velocità"); }
                            if (move.targetStatDebuff.acc && !isEchoRaidAccuracyProtected(t.char)) { t.char.acc = (t.char.acc || 1.0) * hakiStatDebuffMultiplier(t.char,move.targetStatDebuff.acc); statTexts.push("Precisione"); }
                            if (move.targetStatDebuff.accFlat && !isEchoRaidAccuracyProtected(t.char)) { t.char.acc = Math.max(0.1, (t.char.acc || 1.0) - move.targetStatDebuff.accFlat * (t.char.id==='luffy' && t.char.hakiGuardTurns>0?0.5:1)); statTexts.push("Precisione"); }
                            if (statTexts.length > 0) {
                                events.push({ type: 'text', text: `${statTexts.join(" e ")} di ${t.char.name} diminuisce!` });
                            }
                        }
                    }

                    // Passiva originale di Sam: la memoria analitica registra
                    // solo il tipo del colpo che le ha realmente tolto PS.
                    if(isEnemyTarget && t.char.hp<victimHpBeforeHit && move.power>0){
                        recordSpyExposure(t.char,move,victimHpBeforeHit-t.char.hp);
                        const flux=triggerStarWand(attacker,t.char);
                        if(flux){
                            events.push({type:'text',text:flux.text,isPassive:true,
                                passiveChar:attacker.name,passiveName:attacker.passive.name});
                            if(flux.heal>0)events.push({type:'damage',targetPlayer:player,
                                targetIdx:charTeamIdx,newHp:attacker.hp,
                                text:attacker.name+' recupera '+flux.heal+' PS grazie alla Bacchetta!'});
                        }
                    }

                    // Kirby copia una mossa soltanto al primo colpo che toglie
                    // PS a ciascun avversario distinto, massimo due per lotta.
                    // Copiare non sottrae la mossa al nemico e non copia combo.
                    if(isEnemyTarget && attacker.hp > 0 && t.char.hp < victimHpBeforeHit){
                        const copied=copyKirbyMoveOnHit(attacker,t.char,`${t.player}:${t.idx}`);
                        if(copied){
                            events.push({type:'text',text:`⭐ ${attacker.name} attiva Copia Abilità! Ha imparato "${copied.name}" da ${t.char.name}! (${attacker.kirbyCopiedTargets.length}/2)`,
                                isPassive:true,passiveChar:attacker.name,passiveName:'Copia Abilità'});
                            events.push({type:'moves_update',targetPlayer:player,targetIdx:charTeamIdx,
                                moves:JSON.parse(JSON.stringify(attacker.moves))});
                        }
                    }

                    // --- PASSIVA ON_KO (Zabuza, Brago, Juri) ---
                    if (wasAlive && t.char.hp <= 0 && attacker.hp > 0 && attacker.passive && attacker.passive.type === 'on_ko' &&
                        (attacker.passive.maxUses === undefined || (attacker.passiveUses||0) < attacker.passive.maxUses)) {
                        attacker.passiveUses = (attacker.passiveUses||0)+1;
                        if (attacker.passive.statBuff) {
                            let statTexts = [];
                            if (attacker.passive.statBuff.atk) { applyBattleStatModifier(attacker, 'atk', attacker.passive.statBuff.atk); statTexts.push("Attacco"); }
                            if (attacker.passive.statBuff.def) { applyBattleStatModifier(attacker, 'def', attacker.passive.statBuff.def); statTexts.push("Difesa"); }
                            if (attacker.passive.statBuff.spd) { applyBattleStatModifier(attacker, 'spd', attacker.passive.statBuff.spd); statTexts.push("Velocità"); }
                            events.push({ type: 'text', text: `✨ ${attacker.name} manda K.O. l'avversario e attiva ${attacker.passive.name}! Aumenta ${statTexts.join(", ")}!`, isPassive: true, passiveChar: attacker.name, passiveName: attacker.passive.name });
                        }
                        if (attacker.passive.healPercent) {
                            const healAmount = Math.max(1, Math.floor(attacker.maxHp * attacker.passive.healPercent));
                            attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAmount);
                            events.push({ type: 'damage', text: `✨ ${attacker.name} manda K.O. l'avversario e attiva ${attacker.passive.name}! Recupera ${healAmount} PS!`, targetPlayer: player, targetIdx: charTeamIdx, newHp: attacker.hp, isPassive: true, passiveChar: attacker.name, passiveName: attacker.passive.name });
                        }
                    }
                    // ------------------------------------------

                    if (t.char.hp > 0 || (move.targetMode === 'revive' && !t.char.echoSoulPermanentDefeat)) {
                        
                        // --- FIX: APPLICAZIONE CURE E REVIVE ---
                        const wasDead = t.char.hp <= 0;
                        
                        if (move.targetMode === 'team_smart_heal') {
                            const aliveAlliesCount = workingField[t.player].filter(idx => workingTeams[t.player][idx].hp > 0).length;
                            const healFactor = aliveAlliesCount === 1 ? (move.healAlone || move.heal) : (move.healTeam || move.heal);
                            const healAmount = Math.max(1, Math.floor(t.char.maxHp * healFactor));
                            t.char.hp = Math.min(t.char.maxHp, t.char.hp + healAmount);
                            events.push({ type: 'damage', text: `✨ ${t.char.name} recupera ${healAmount} PS!`, targetPlayer: t.player, targetIdx: t.idx, newHp: t.char.hp });
                        } else if (move.heal) {
                            const healAmount = Math.max(1, Math.floor(t.char.maxHp * move.heal));
                            t.char.hp = Math.min(t.char.maxHp, t.char.hp + healAmount);
                            
                            // FIX: Stampa l'azione della mossa se è una resurrezione, così il registro è chiaro!
                            if (wasDead && move.targetMode === 'revive') {
                                events.push({ type: 'text', text: `${attacker.name} usa ${move.name} su ${t.char.name}!` });
                            }

                            events.push({ type: 'damage', text: `✨ ${wasDead ? t.char.name + ' viene rianimato e recupera' : t.char.name + ' recupera'} ${healAmount} PS!`, targetPlayer: t.player, targetIdx: t.idx, newHp: t.char.hp });
                            
                            if (wasDead) {
                                if(activatePhoenixFeather(t.char))
                                  events.push({type:'text',text:`🪶 Piuma della Rinascita di ${t.char.name}: Difesa +15% per 2 turni!`});
                                t.char.statuses = [];
                                updateStatusUI(t.player, t.idx);
                                
                                // FIX PASSIVA: Innesco per chi rianima un alleato (es. Sage)
                                if (attacker.passive && attacker.passive.type === 'on_revive_ally') {
                                    if (attacker.passive.statBuff) {
                                        let statTexts = [];
                                        if (attacker.passive.statBuff.atk) { applyBattleStatModifier(attacker, 'atk', attacker.passive.statBuff.atk); statTexts.push("l'Attacco"); }
                                        if (attacker.passive.statBuff.def) { applyBattleStatModifier(attacker, 'def', attacker.passive.statBuff.def); statTexts.push("la Difesa"); }
                                        if (attacker.passive.statBuff.spd) { applyBattleStatModifier(attacker, 'spd', attacker.passive.statBuff.spd); statTexts.push("la Velocità"); }
                                        
                                        events.push({ type: 'text', text: `🌟 ${attacker.name} attiva ${attacker.passive.name}! Salvando un compagno, aumenta ${statTexts.join(" e ")}!`, isPassive: true, passiveChar: attacker.name, passiveName: attacker.passive.name });
                                    }
                                }
                            }
                        }

                        if (move.healLastTurnDamage && t.char.damageTakenLastTurn) {
                            const healAmount = t.char.damageTakenLastTurn;
                            t.char.hp = Math.min(t.char.maxHp, t.char.hp + healAmount);
                            events.push({ type: 'damage', text: `⏱️ ${t.char.name} riavvolge i danni del turno precedente! Recupera ${healAmount} PS!`, targetPlayer: t.player, targetIdx: t.idx, newHp: t.char.hp });
                        }

                        if (!isEnemyTarget && t.char !== attacker && t.char.hp > 0) {
                            const extraHeal = triggerMiraculousAllyHeal(attacker, t.char, move);
                            if (extraHeal > 0) {
                                events.push({ type: 'damage', targetPlayer: t.player, targetIdx: t.idx, newHp: t.char.hp,
                                    text: `🐞 ${attacker.name} attiva Il Potere dei Miraculous! ${t.char.name} recupera ${extraHeal} PS! (${attacker.passiveUses}/3)`,
                                    isPassive: true, passiveChar: attacker.name, passiveName: attacker.passive.name });
                            }
                        }

                        if (move.removeNegativeStatuses) {
                            const negatives = ['Avvelenato', 'Scottato', 'Elettrizzato', 'Congelato', 'Addormentato', 'Confuso', 'Indebolito', 'Stordito', 'Accecato', 'Incantato', 'Anima Distorta', 'Assiderato'];
                            const originalLength = t.char.statuses.length;
                            t.char.statuses = t.char.statuses.filter(s => !negatives.includes(s.type));
                            if (t.char.statuses.length < originalLength) {
                                events.push({ type: 'text', text: `✨ ${t.char.name} è stato purificato dagli status negativi!` });
                                updateStatusUI(t.player, t.idx);
                            }
                        }

                        // --- FIX: APPLICAZIONE PURIFICAZIONI E POTENZIAMENTI BERSAGLIO ---
                        if (move.targetStatBuff && t.char.hp > 0) {
                            let statTexts = [];
                            if (move.targetStatBuff.atk) { applyBattleStatModifier(t.char, 'atk', move.targetStatBuff.atk); statTexts.push("l'Attacco"); }
                            if (move.targetStatBuff.def) { applyBattleStatModifier(t.char, 'def', move.targetStatBuff.def); statTexts.push("la Difesa"); }
                            if (move.targetStatBuff.spd) { applyBattleStatModifier(t.char, 'spd', move.targetStatBuff.spd); statTexts.push("la Velocità"); }
                            if (statTexts.length > 0) {
                                events.push({ type: 'text', text: `📈 ${statTexts.join(" e ")} di ${t.char.name} aumenta!` });
                                if(!isEnemyTarget){
                                  const healed=healSupportAlly(attacker,t.char,true);
                                  if(healed>0)events.push({type:'damage',targetPlayer:t.player,targetIdx:t.idx,newHp:t.char.hp,
                                    text:`🎀 Nastro della Solidarietà di ${attacker.name}: ${t.char.name} recupera ${healed} PS!`});
                                }
                            }
                        }

                        if (move.copyRandomEnemyType && t.char.hp > 0) {
                            let possibleEnemies = [];
                            const activeMatchPlayers = getActivePlayers();
                            let enemyTeams = [];
                            if (gameState.gameMode === 'ultimon') {
                                enemyTeams = activeMatchPlayers.filter(p => p !== player);
                            } else if (gameState.gameMode === 'multipla') {
                                enemyTeams = ['p1', 'p2'].includes(player) ? ['p3', 'p4'] : ['p1', 'p2'];
                            } else if (gameState.gameMode === 'juggernaut' || gameState.gameMode === 'survival') {
                                const juggPlayer = gameState.settings.juggernautPlayer || (gameState.gameMode === 'survival' ? 'p2' : 'p1');
                                enemyTeams = player === juggPlayer ? activeMatchPlayers.filter(p => p !== juggPlayer) : [juggPlayer];
                            } else if (gameState.gameMode === 'torneo') {
                                enemyTeams = getTournamentMatchOpponents(player);
                            } else if (gameState.gameMode === 'torneo_punti') {
                                enemyTeams = [activeMatchPlayers.find(p => p !== player)];
                            } else if (gameState.gameMode === 'battleroyale') {
                                enemyTeams = activeMatchPlayers.filter(p => p !== player);
                            } else {
                                enemyTeams = [player === 'p1' ? 'p2' : 'p1'];
                            }
                            enemyTeams.forEach(ep => {
                                if (ep && workingField[ep]) {
                                    workingField[ep].forEach(eIdx => {
                                        if (workingTeams[ep][eIdx] && workingTeams[ep][eIdx].hp > 0) possibleEnemies.push(workingTeams[ep][eIdx]);
                                    });
                                }
                            });
                            if (possibleEnemies.length > 0) {
                                const rEnemy = possibleEnemies[Math.floor(Math.random() * possibleEnemies.length)];
                                t.char.types = [...rEnemy.types];
                                events.push({ type: 'text', text: `🔦 ${attacker.name} usa la Torcia Cambia-Tipo! I tipi di ${t.char.name} diventano [${t.char.types.join(', ')}] copiandoli da ${rEnemy.name}!` });
                            }
                        }

                        if (move.stealMove && !isFirstHitProtection && t.char.hp > 0 && t.char.moves.length > 0) {
                            const randomMoveIdx = Math.floor(Math.random() * t.char.moves.length);
                            const stolenMove = t.char.moves[randomMoveIdx];
                            t.char.moves.splice(randomMoveIdx, 1);
                            attacker.moves.push({ ...stolenMove, isStolen: true, stolenTurns: move.stealMove.turns, originalOwnerIdx: t.idx, originalOwnerPlayer: t.player });
                            events.push({ type: 'text', text: `✨ ${attacker.name} usa il suo gadget e ruba la mossa "${stolenMove.name}" a ${t.char.name} per ${move.stealMove.turns} turni!` });
                        }

                        let effects = move.statusEffects || (move.statusEffect ? [move.statusEffect] : []);
                        for (let effect of effects) {
                            if(effect.type==='Accecato'&&isEchoRaidAccuracyProtected(t.char)){
                                events.push({type:'text',text:'🛡️ Aura Suprema: Echomax è immune all’accecamento e ai cali di Precisione!'});
                                continue;
                            }
                            const isNegative = ['Avvelenato', 'Scottato', 'Elettrizzato', 'Congelato', 'Addormentato', 'Confuso', 'Indebolito', 'Stordito', 'Accecato', 'Incantato', 'Anima Distorta', 'Assiderato'].includes(effect.type);
                            
                            // FIX CRITICO: Se la mossa non ha una "chance" specificata, assumiamo che sia 1.0 (100% garantita)!
                            const chanceToApply = boostedStatusChance(attacker,effect.chance !== undefined ? effect.chance : 1.0);
                            
                            if (isNegative && (isFirstHitProtection || t.char.passive?.immuneToNegativeStatuses)) {
                                if (Math.random() < chanceToApply) {
                                    events.push({ type: 'text', text: `🛡️ ${t.char.name} resiste a ${effect.type} grazie a ${t.char.passive.name}!`, isPassive: true, passiveChar: t.char.name, passiveName: t.char.passive.name });
                                }
                                continue;
                            }

                            if (Math.random() < chanceToApply) {
                                const existingIdx = t.char.statuses.findIndex(s => s.type === effect.type);
                                let turns = effect.turns || 1;
                                if (effect.type === 'Addormentato' && !effect.turns) turns = Math.floor(Math.random() * 3) + 2;
                                if (effect.type === 'Infatuato' && !effect.turns) turns = Math.floor(Math.random() * 2) + 4;
                                
                                let newStatus = { type: effect.type, turns: turns, ...(['Incantato','Assiderato'].includes(effect.type)?{justApplied:true}:{}) };
                                if(shortenHakiDebuff(t.char,newStatus))
                                  events.push({type:'text',text:'🛡️ Haki dell’Armatura: '+t.char.name+' dimezza la durata di '+effect.type+'!'});
                                if(shortenNegativeStatus(t.char,newStatus))
                                  events.push({type:'text',text:`🔗 Sigillo della Libertà: ${effect.type} di ${t.char.name} durerà un turno in meno!`});
                                // --- FIX: LOGICA DI "In_Groppa" DI YOSHI ---
                                if (effect.type === 'In_Groppa') {
                                    newStatus.protectorIdx = charTeamIdx; // Assegna il protettore!
                                    newStatus.protectorPlayer = player; // Assegna il giocatore protettore!
                                }
                                
                                if (existingIdx === -1) {
                                    t.char.statuses.push(newStatus);
                                    updateStatusUI(t.player, t.idx);
                                    if(isEnemyTarget && reflectNegativeStatus(t.char,attacker,newStatus)){
                                      updateStatusUI(player,charTeamIdx);
                                      events.push({type:'text',text:`🪞 Specchio delle Maledizioni di ${t.char.name}: ${effect.type} si riflette su ${attacker.name}!`});
                                    }
                                    if (effect.type === 'Ombra Rapida') {
                                        events.push({ type: 'text', text: `${t.char.name} si avvolge nell'Ombra Rapida!` });
                                    } else if (effect.type === 'In_Groppa') {
                                        events.push({ type: 'text', text: `🦕 ${t.char.name} salta in groppa! È protetto e i suoi attacchi sono potenziati!` });
                                    } else {
                                        events.push({ type: 'text', text: `${t.char.name} è ${effect.type === 'Addormentato' ? 'caduto addormentato' : 'stato ' + effect.type.toLowerCase()}!` });
                                    }
                                } else {
                                    t.char.statuses[existingIdx] = newStatus;
                                    if (effect.type === 'In_Groppa') {
                                        events.push({ type: 'text', text: `🦕 ${t.char.name} rimane ben saldo in groppa!` });
                                    } else {
                                        events.push({ type: 'text', text: `Lo status ${effect.type} di ${t.char.name} è stato ripristinato!` });
                                    }
                                }
                            }
                        }
                        // Lo spray scatta immediatamente appena una mossa
                        // applica un malus, senza attendere il prossimo turno.
                        const sprayCured=activateNeutralizingSpray(t.char);
                        if(sprayCured.length){
                            updateStatusUI(t.player,t.idx);
                            events.push({type:'text',text:`🧴 Spray Neutralizzante di ${t.char.name}: neutralizza ${sprayCured.join(', ')}!`});
                        }
                    }
                } // FINE CICLO SUI BERSAGLI (resolvedTargets)
                if (futureStrikeDealtDamage && consumeFutureStrike(attacker)) {
                    events.push({ type: 'text', text: `🔮 ${attacker.name} sfrutta Futuro Infrangibile: il suo attacco ha inflitto +25% danni!`,
                        isPassive: true, passiveChar: attacker.name, passiveName: attacker.passive.name });
                }
                
                if(attackSucceeded && move.zodiacTrapTurns){
                  for(const t of resolvedTargets){
                    if(addZodiacTrap(t.char,move.zodiacTrapTurns)){
                      updateStatusUI(t.player,t.idx);
                      events.push({type:'text',text:`🕳️ ${t.char.name} è intrappolato da Virgo per 3 turni: Velocità -50%, 50% di mancare!`});
                    }
                  }
                }
                if(attackSucceeded && move.zodiacCleanLucy && attacker.isZodiacSpirit){
                  const lucy=workingTeams[player]?.[attacker.zodiacLucyIdx];
                  if(lucy?.id==='lucy' && cleanLucyDebuffs(lucy)){
                    updateStatusUI(player,attacker.zodiacLucyIdx);
                    events.push({type:'text',text:'🧹 Servizio Impeccabile: Virgo libera Lucy da status negativi e malus alle statistiche!'});
                  }
                }
                if(attackSucceeded && move.zodiacFlatBuff){
                  for(const [stat,amount] of Object.entries(move.zodiacFlatBuff))
                    zodiacFlatStatBoost(attacker,stat,amount);
                  events.push({type:'text',text:`🦀 Difesa del Granchio! ${attacker.name} aumenta Difesa e Velocità di 20 punti!`});
                }
                if(attackSucceeded && move.zodiacCharmOnDress && attacker.id==='lucy'){
                  const enemies=affectedOpponents(player,gameState.gameMode,activeMatchPlayers,getTournamentMatchOpponents,gameState.settings)
                    .flatMap(p=>(workingField[p]||[]).map(i=>({p,i,char:workingTeams[p]?.[i]})))
                    .filter(t=>t.char?.hp>0);
                  if(enemies.length && Math.random()<move.zodiacCharmOnDress){
                    const victim=enemies[Math.floor(Math.random()*enemies.length)];
                    if(!victim.char.passive?.immuneToNegativeStatuses){
                      victim.char.statuses ||= [];
                      victim.char.statuses= victim.char.statuses.filter(s=>s.type!=='Infatuato');
                      victim.char.statuses.push({type:'Infatuato',turns:4});
                      updateStatusUI(victim.p,victim.i);
                      events.push({type:'text',text:`💝 Abito Stellare di Lucy infatua ${victim.char.name}!`});
                    }
                  }
                }
                if(attackSucceeded && move.zodiacRainTurns){
                  workingWeather={type:'rainstorm',turns:move.zodiacRainTurns};
                  events.push({type:'text',text:`🌧️ Diluvio di Aquarius: Pioggia per ${move.zodiacRainTurns} turni! Acqua +25%, Fuoco -25%.`});
                }
                if(attackSucceeded && move.zodiacForceSecondary && attacker.id==='lucy'){
                  const spirit=activeZodiacSpirit(workingTeams,workingField,player,charTeamIdx);
                  if(spirit){
                    const target=resolvedTargets.find(t=>t.char.hp>0)?.char||null;
                    const effect=zodiacSecondaryRoll(spirit.char.id);
                    if(effect.status && target && !target.passive?.immuneToNegativeStatuses){
                      target.statuses ||= [];
                      target.statuses=target.statuses.filter(s=>s.type!==effect.status);
                      target.statuses.push({type:effect.status,turns:effect.status==='Addormentato'?3:4});
                      const t=resolvedTargets.find(t=>t.char===target);
                      if(t)updateStatusUI(t.player,t.idx);
                      events.push({type:'text',text:`✨ Apertura Forzata: ${spirit.char.name} applica ${effect.status} a ${target.name}!`});
                    }
                    if(effect.buff){
                      for(const [stat,m] of Object.entries(effect.buff))applyBattleStatModifier(spirit.char,stat,m);
                      events.push({type:'text',text:`✨ Apertura Forzata: ${spirit.char.name} riceve il potenziamento stellare!`});
                    }
                    if(effect.flatBuff){
                      for(const [stat,amount] of Object.entries(effect.flatBuff))zodiacFlatStatBoost(spirit.char,stat,amount);
                      events.push({type:'text',text:`✨ Apertura Forzata: ${spirit.char.name} aumenta Difesa e Velocità!`});
                    }
                    if(effect.trapTurns && target && addZodiacTrap(target,effect.trapTurns)){
                      const t=resolvedTargets.find(t=>t.char===target);
                      if(t)updateStatusUI(t.player,t.idx);
                      events.push({type:'text',text:`🕳️ Apertura Forzata: Virgo intrappola ${target.name} per 3 turni!`});
                    }
                    if(effect.rainTurns){
                      workingWeather={type:'rainstorm',turns:effect.rainTurns};
                      events.push({type:'text',text:'🌧️ Apertura Forzata: Aquarius scatena la Pioggia per 5 turni!'});
                    }
                    if(!effect.status&&!effect.buff&&!effect.flatBuff&&!effect.trapTurns&&!effect.rainTurns)
                      events.push({type:'text',text:`✨ Apertura Forzata risveglia ${spirit.char.name}, ma l'effetto secondario non riesce questa volta.`});
                  }
                }
                if (attackSucceeded && move.transformMahito && attacker.id === 'mahito' && !attacker.mahitoTransformed) {
                    attacker.mahitoTransformed = true;
                    attacker.imageFilter = 'hue-rotate(285deg) saturate(1.6) contrast(1.2) drop-shadow(0 0 17px rgba(217,70,239,0.95))';
                    attacker.atk = Math.floor(attacker.atk * 1.5);
                    attacker.spAtk = Math.floor((attacker.spAtk || attacker.atk) * 1.5);
                    events.push({ type: 'text', text: '👁️ Mahito usa Trasfigurazione Oziosa! Cambia forma e aumenta Attacco e Attacco Speciale di uno stadio!' });
                }

                // Le gemme amplificano tutta la PRIMA mossa offensiva del tipo
                // corrispondente, poi si rompono solo per questa battaglia.
                // Il possesso nel profilo non cambia.
                if(move.power>0 && useHeldGem(attacker,move)){
                    events.push({type:'text',text:`💎 La gemma di ${attacker.name} sprigiona energia e si rompe! (+30% di potenza)`});
                }
                const heldRecoil = getHeldRecoil(attacker, move);
                if (heldRecoil > 0 && attacker.hp > 0) {
                    applyDamage(attacker, heldRecoil, player, charTeamIdx, `💪 L'Iperband fa perdere ${heldRecoil} PS a ${attacker.name}!`);
                }

                const buffToApply = move.selfStatBuff || move.statBuff;
                if (attackSucceeded && buffToApply && attacker.hp > 0) {
                    let statTexts = [];
                    if (buffToApply.def) { applyBattleStatModifier(attacker, 'def', buffToApply.def); statTexts.push("Difesa"); }
                    if (buffToApply.spDef) { applyBattleStatModifier(attacker, 'spDef', buffToApply.spDef); statTexts.push("Difesa Speciale"); }
                    if (buffToApply.spd) { applyBattleStatModifier(attacker, 'spd', buffToApply.spd); statTexts.push("Velocità"); }
                    if (buffToApply.atk) { applyBattleStatModifier(attacker, 'atk', buffToApply.atk); statTexts.push("Attacco"); }
                    if (statTexts.length > 0) {
                        events.push({ type: 'text', text: `La ${statTexts.join(" e ")} di ${attacker.name} aumenta per via dell'attacco!` });
                    }
                }

                // Tecniche Cappello di Paglia: tutti gli effetti sono memorizzati
                // nella copia di combattimento, quindi sincronizzati online.
                if (attackSucceeded && attacker.hp>0 && move.hakiGuardTurns){
                    const turns=beginHakiGuard(attacker,move.hakiGuardTurns);
                    events.push({type:'text',text:'🛡️ '+attacker.name+' protegge le statistiche e gli status con l’Haki per '+turns+' turni!'});
                }
                if (attackSucceeded && attacker.hp>0 && move.strawHatEvasionGain){
                    const amount=applyNamiMirage(attacker,move.strawHatEvasionGain);
                    if(amount)events.push({type:'text',text:'🌫️ Miraggio Ladresco di '+attacker.name+': elusione +15% fino alla fine dello scontro!'});
                    else events.push({type:'text',text:'🌫️ Il miraggio di '+attacker.name+' è già attivo: non si accumula.'});
                }
                if (attackSucceeded && attacker.hp>0 && move.strawHatGuardPoint){
                    applyGuardPoint(attacker,move.strawHatGuardPoint);
                    events.push({type:'text',text:'🛡️ Guard Point di '+attacker.name+': il prossimo colpo diretto sarà attenuato del 20%!'});
                }
                if (attackSucceeded && attacker.hp>0 && move.strawHatClearBlind && clearZoroBlind(attacker)){
                    updateStatusUI(player,charTeamIdx);
                    events.push({type:'text',text:'✨ '+attacker.name+' ritrova la vista grazie alla concentrazione!'});
                }

                // Tecniche uniche dei nuovi campioni: effetto permanente fino a KO o fine lotta.
                if (attackSucceeded && attacker.hp > 0 && move.evasionGain && attacker.id === 'bugsbunny') {
                    const evasion = addEvasion(attacker);
                    events.push({type:'text',text:`🐰 Bugs Bunny usa Dentro la Tana: elusione totale +${Math.round(evasion*100)}%!`});
                }
                if (attackSucceeded && attacker.hp > 0 && move.crystalShieldPercent && attacker.id === 'diamante') {
                    const shield = crystalShield(attacker);
                    events.push({type:'text',text:`💎 Diamante genera un Muro Cristallino da ${shield} punti scudo!`});
                }
                if (attackSucceeded && attacker.hp > 0 && move.refractionTurns && attacker.id === 'diamante') {
                    beginRefraction(attacker);
                    events.push({type:'text',text:'💎 Rifrazione attiva per 3 turni: prima difesa dimezzata per turno, mosse Cristallo +20%!'});
                }
                if (attackSucceeded && move.placeStickyTrap) {
                    const foes=affectedOpponents(player,gameState.gameMode,activeMatchPlayers,getTournamentMatchOpponents,gameState.settings);
                    addStickyTrap(workingFieldTraps,workingTrapSeen,foes,workingField);
                    events.push({type:'text',text:`🪤 ${attacker.name} piazza una Trappola Segreta: i nuovi avversari perderanno il 10% dei PS entrando in campo!`});
                }
                if (attackSucceeded && (move.snowstormTurns ||
                    (move.snowstormChance && Math.random()<move.snowstormChance))) {
                    const snowTurns=move.snowstormTurns||5;
                    workingWeather={type:'snowstorm',turns:snowTurns};
                    events.push({type:'text',text:'❄️ '+attacker.name+' usa '+move.name+
                      ' e scatena una TEMPESTA DI NEVE per '+snowTurns+' turni!'});
                }
                if(attackSucceeded && move.lushGrassTurns){
                    workingWeather={type:'lush_grass',turns:move.lushGrassTurns};
                    events.push({type:'text',text:'🌿 '+attacker.name+' attiva ERBA RIGOGLIOSA per '+
                      move.lushGrassTurns+' turni! Mosse Erba +20%, i Multimon Erba recuperano il 5% PS a fine turno.'});
                }
                if(attackSucceeded && move.tailwindTurns){
                    const potentialAllies=Object.entries(workingTeams)
                      .filter(([,team])=>Array.isArray(team)&&team.some(c=>c&&!c.isSummonOnly))
                      .map(([role])=>role);
                    workingTailwind=startTailwind(workingTailwind,player,gameState.gameMode,
                      gameState.settings,potentialAllies);
                    for(const role of tailwindAllies(player,gameState.gameMode,gameState.settings,potentialAllies))
                      tailwindJustActivated.add(role);
                    events.push({type:'text',text:'💨 '+attacker.name+' attiva TAILWIND! Per '+
                      move.tailwindTurns+' turni tutti gli alleati (+ chi entra dopo) hanno Velocità effettiva +30%.'});
                }
                if(tryStartRainstorm(move,attackSucceeded)){
                    workingWeather={type:'rainstorm',turns:RAINSTORM_TURNS};
                    events.push({type:'text',text:`🌧️ ${attacker.name} usa ${move.name} e scatena una TEMPESTA! Per ${RAINSTORM_TURNS} turni: mosse Acqua +25% danni, Fuoco -25% danni; Cuore di Pioggia +20% elusione.`});
                }

                if (attackSucceeded && (move.selfHeal || move.selfHealRandom) && attacker.hp > 0) {
                    if (move.selfHealChance === undefined || Math.random() < move.selfHealChance) {
                        let healFactor = move.selfHeal;
                        if (move.selfHealRandom) {
                            healFactor = move.selfHealRandom.min + Math.random() * (move.selfHealRandom.max - move.selfHealRandom.min);
                        }
                        const healAmount = Math.floor(attacker.maxHp * healFactor);
                        attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAmount);
                        events.push({ type: 'damage', text: `${attacker.name} recupera ${healAmount} HP!`, targetPlayer: player, targetIdx: charTeamIdx, newHp: attacker.hp });
                    }
                }

                // --- PASSIVA ON_MOVE_USE (Es. Cosmo - Caos Benefico, Elsa - Cuore di Ghiaccio) ---
                if (attackSucceeded && attacker.hp > 0 && attacker.passive && attacker.passive.type === 'on_move_use') {
                    if (!attacker.passive.requiredMoveType || attacker.passive.requiredMoveType === move.type) {
                        if (Math.random() < attacker.passive.chance) {
                            if (attacker.passive.randomEffects) {
                                const effect = attacker.passive.randomEffects[Math.floor(Math.random() * attacker.passive.randomEffects.length)];
                                if (effect.statBuff) {
                                    let statTexts = [];
                                    if (effect.statBuff.atk) { applyBattleStatModifier(attacker, 'atk', effect.statBuff.atk); statTexts.push("Attacco"); }
                                    if (effect.statBuff.def) { applyBattleStatModifier(attacker, 'def', effect.statBuff.def); statTexts.push("Difesa"); }
                                    if (effect.statBuff.spd) { applyBattleStatModifier(attacker, 'spd', effect.statBuff.spd); statTexts.push("Velocità"); }
                                    events.push({ type: 'text', text: `✨ ${attacker.name} attiva ${attacker.passive.name}! Aumenta ${statTexts.join(" e ")}!`, isPassive: true, passiveChar: attacker.name, passiveName: attacker.passive.name });
                                }
                                if (effect.heal) {
                                    const healAmount = Math.max(1, Math.floor(attacker.maxHp * effect.heal));
                                    attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAmount);
                                    events.push({ type: 'damage', text: `✨ ${attacker.name} attiva ${attacker.passive.name}! Recupera ${healAmount} PS!`, targetPlayer: player, targetIdx: charTeamIdx, newHp: attacker.hp, isPassive: true, passiveChar: attacker.name, passiveName: attacker.passive.name });
                                }
                            }
                            if (attacker.passive.targetStatDebuff) {
                                let statTexts = [];
                                let applied = false;
                                resolvedTargets.forEach(t => {
                                    if (t.char.hp > 0) {
                                        if (attacker.passive.targetStatDebuff.atk) { 
                                            if (t.char.passive && t.char.passive.type === 'immune_to_atk_debuff') {
                                                events.push({ type: 'text', text: `🛡️ ${t.char.name} è immune al calo di Attacco grazie a ${t.char.passive.name}!`, isPassive: true, passiveChar: t.char.name, passiveName: t.char.passive.name });
                                            } else {
                                                applyBattleStatModifier(t.char, 'atk', attacker.passive.targetStatDebuff.atk); 
                                                if(!statTexts.includes("l'Attacco")) statTexts.push("l'Attacco"); 
                                            }
                                        }
                                        if (attacker.passive.targetStatDebuff.def) { applyBattleStatModifier(t.char, 'def', attacker.passive.targetStatDebuff.def); if(!statTexts.includes("la Difesa")) statTexts.push("la Difesa"); }
                                        if (attacker.passive.targetStatDebuff.spd) { applyBattleStatModifier(t.char, 'spd', attacker.passive.targetStatDebuff.spd); if(!statTexts.includes("la Velocità")) statTexts.push("la Velocità"); }
                                        applied = true;
                                    }
                                });
                                if (applied) {
                                     events.push({ type: 'text', text: `✨ ${attacker.name} attiva ${attacker.passive.name}! Riduce ${statTexts.join(" e ")} dei bersagli colpiti!`, isPassive: true, passiveChar: attacker.name, passiveName: attacker.passive.name });
                                }
                            }
                        }
                    }
                }
                // --------------------------------------------------------

                // GESTIONE EFFETTI SUL PARTNER PER LE MOSSE COMBINATE E COMBINATE ASIMMETRICHE
                if (attackSucceeded && move.isCombo && attacker.hp > 0) {
                    if (move.specificComboEffects && move.specificComboEffects[attacker.id]) {
                        const eff = move.specificComboEffects[attacker.id];
                        if (eff.selfHeal) {
                            if (eff.selfHeal < 0) {
                                const dmg = Math.floor(attacker.maxHp * Math.abs(eff.selfHeal));
                                applyDamage(attacker, dmg, player, charTeamIdx, `${attacker.name} sacrifica ${dmg} HP per la mossa combinata!`);
                            } else {
                                const healAmount = Math.floor(attacker.maxHp * eff.selfHeal);
                                attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAmount);
                                events.push({ type: 'damage', text: `${attacker.name} recupera ${healAmount} HP!`, targetPlayer: player, targetIdx: charTeamIdx, newHp: attacker.hp });
                            }
                        }
                        if (eff.statBuff && attacker.hp > 0) {
                            let statTexts = [];
                            if (eff.statBuff.def) { applyBattleStatModifier(attacker, 'def', eff.statBuff.def); statTexts.push("Difesa"); }
                            if (eff.statBuff.spd) { applyBattleStatModifier(attacker, 'spd', eff.statBuff.spd); statTexts.push("Velocità"); }
                            if (eff.statBuff.atk) { applyBattleStatModifier(attacker, 'atk', eff.statBuff.atk); statTexts.push("Attacco"); }
                            if (statTexts.length > 0) {
                                events.push({ type: 'text', text: `La ${statTexts.join(" e ")} di ${attacker.name} aumenta drasticamente!` });
                            }
                        }
                    }

                    const partnerIds = move.isCombo.filter(id => id !== attacker.id);
                    partnerIds.forEach(pId => {
                        const partnerTeamIdx = workingField[player].find(idx => workingTeams[player][idx].id === pId && workingTeams[player][idx].hp > 0);
                        if (partnerTeamIdx !== undefined) {
                            const partner = workingTeams[player][partnerTeamIdx];
                            
                            if (move.specificComboEffects && move.specificComboEffects[pId]) {
                                const eff = move.specificComboEffects[pId];
                                if (eff.selfHeal) {
                                    if (eff.selfHeal < 0) {
                                        const dmg = Math.floor(partner.maxHp * Math.abs(eff.selfHeal));
                                        applyDamage(partner, dmg, player, partnerTeamIdx, `${partner.name} sacrifica ${dmg} HP per la mossa combinata!`);
                                    } else {
                                        const healAmount = Math.floor(partner.maxHp * eff.selfHeal);
                                        partner.hp = Math.min(partner.maxHp, partner.hp + healAmount);
                                        events.push({ type: 'damage', text: `${partner.name} recupera ${healAmount} HP grazie alla Mossa Combinata!`, targetPlayer: player, targetIdx: partnerTeamIdx, newHp: partner.hp });
                                    }
                                }
                                if (eff.statBuff && partner.hp > 0) {
                                    let pStatTexts = [];
                                    if (eff.statBuff.def) { applyBattleStatModifier(partner, 'def', eff.statBuff.def); pStatTexts.push("Difesa"); }
                                    if (eff.statBuff.spd) { applyBattleStatModifier(partner, 'spd', eff.statBuff.spd); pStatTexts.push("Velocità"); }
                                    if (eff.statBuff.atk) { applyBattleStatModifier(partner, 'atk', eff.statBuff.atk); pStatTexts.push("Attacco"); }
                                    if (pStatTexts.length > 0) {
                                        events.push({ type: 'text', text: `La ${pStatTexts.join(" e ")} di ${partner.name} aumenta drasticamente!` });
                                    }
                                }
                            } else if (!move.specificComboEffects) {
                                if (move.selfStatBuff) {
                                    let pStatTexts = [];
                                    if (move.selfStatBuff.def) { applyBattleStatModifier(partner, 'def', move.selfStatBuff.def); pStatTexts.push("Difesa"); }
                                    if (move.selfStatBuff.spd) { applyBattleStatModifier(partner, 'spd', move.selfStatBuff.spd); pStatTexts.push("Velocità"); }
                                    if (move.selfStatBuff.atk) { applyBattleStatModifier(partner, 'atk', move.selfStatBuff.atk); pStatTexts.push("Attacco"); }
                                    if (pStatTexts.length > 0) {
                                        events.push({ type: 'text', text: `Anche la ${pStatTexts.join(" e ")} di ${partner.name} aumenta grazie all'attacco combinato!` });
                                    }
                                }
                                
                                if (move.selfHeal) {
                                    const pHealAmount = Math.floor(partner.maxHp * move.selfHeal);
                                    partner.hp = Math.min(partner.maxHp, partner.hp + pHealAmount);
                                    events.push({ type: 'damage', text: `${partner.name} recupera ${pHealAmount} HP grazie alla Mossa Combinata!`, targetPlayer: player, targetIdx: partnerTeamIdx, newHp: partner.hp });
                                }
                            }
                        }
                    });
                }

                if (attackSucceeded && move.costHpPercent && attacker.hp > 0) {
                    const costDmg = Math.max(1, Math.floor(attacker.maxHp * move.costHpPercent));
                    applyDamage(attacker, costDmg, player, charTeamIdx, `${attacker.name} sacrifica ${costDmg} HP per eseguire la mossa!`);
                }

                if (move.recharge && attackSucceeded && attacker.hp > 0) {
                    // Soltanto il boss raid di Echomax III rischia Ricarica al 50%.
                    // Tutti gli altri utilizzatori mantengono il normale obbligo.
                    if(shouldApplyEchoRecharge(attacker,move,gameState.isEchoFinalBattle)){
                        attacker.statuses.push({ type: 'Ricarica', turns: 1 });
                        const cured=activateNeutralizingSpray(attacker);
                        updateStatusUI(player,charTeamIdx);
                        if(cured.length)events.push({type:'text',text:`🧴 Spray Neutralizzante di ${attacker.name}: annulla Ricarica e gli altri malus!`});
                    }
                }
                if(move.echoRecoilConfusion && attackSucceeded && attacker.hp>0 && !attacker.isEchoRaidBoss){
                    attacker.statuses.push({type:'Confuso',turns:2});
                    updateStatusUI(player,charTeamIdx);
                    events.push({type:'text',text:`👁️ ${attacker.name} resta confuso dopo Dominatore del Multiverso!`});
                }

                if(attackSucceeded && move.berryTeamHeal && attacker.hp>0)
                  healBerrySlideAllies(attacker,move,player,workingTeams,workingField,
                    {gameMode:gameState.gameMode,settings:gameState.settings,
                      isRoguelikeCoop:gameState.isRoguelikeCoop},events,activeMatchPlayers);
                const qilin=resolveQilinAttack(attacker,move,attackSucceeded);
                if(qilin){
                  if(qilin.burst){
                    events.push({type:'text',text:'❄️ '+attacker.name+
                      ' consuma 2 Sigilli Qilin e riporta la Rugiada al livello 0!',
                      isPassive:true,passiveChar:attacker.name,passiveName:'Rugiada Qilin'});
                    if(qilin.healed>0)events.push({type:'damage',targetPlayer:player,
                      targetIdx:charTeamIdx,newHp:attacker.hp,
                      text:'💚 '+attacker.name+' recupera '+qilin.healed+' PS dalla Rugiada Qilin!',
                      isPassive:true,passiveChar:attacker.name,passiveName:'Rugiada Qilin'});
                  } else {
                    events.push({type:'text',text:'💠 '+attacker.name+' accumula un Sigillo Qilin! ('+
                      qilin.charges+'/2)',isPassive:true,passiveChar:attacker.name,passiveName:'Rugiada Qilin'});
                  }
                }
                if(attackSucceeded && addHeatCharge(attacker)){
                  events.push({type:'text',text:'🔥 '+attacker.name+' accumula una Carica Calore! ('+
                    attacker.heatCharges+'/2)'});
                }
                const bookwormResult=resolveBlueberryAction(attacker,move,attackSucceeded);
                if(bookwormResult)events.push({type:'text',text:bookwormResult,isPassive:true,
                    passiveChar:attacker.name,passiveName:attacker.passive.name});
                if(move.power>0)recordOffensiveMove(attacker,move);
                if (move.suicide && attacker.hp > 0) {
                    applyDamage(attacker, attacker.hp, player, charTeamIdx, `${attacker.name} va in cortocircuito ed esplode sacrificandosi!`);
                }

                isFirstAttackOfTurn = false;
            }
        } // Fine ciclo coda dei turni
        // Il colpo extra diventa disponibile SOLO dopo i KO di tutte e
        // tre le anime originali, poi ogni cinque turni della prima fase,
        // indipendentemente dalla normale azione, da Stordito e Ricarica.
        if(gameState.isEchoFinalBattle && (gameState.echoFinalStage||'raid')==='raid'){
          const raidIdx=workingTeams.p2?.findIndex(c=>c?.id==='echomax'&&c.isEchoRaidBoss===true)??-1;
          const raidBoss=raidIdx>=0?workingTeams.p2[raidIdx]:null;
          const turnNumber=Math.max(0,Math.floor(Number(gameState.battleReport?.turns)||0))+1;
          if(shouldTriggerEchoRaidPulse({
            isEchoFinalBattle:true,stage:'raid',boss:raidBoss,turnNumber
          })){
            raidBoss.echoRaidLastPulseTurn=turnNumber; // Il salvataggio evita doppi inneschi.
            events.push({type:'battle_actor',player:'p2',charTeamIdx:raidIdx,kind:'attack'});
            events.push({type:'text',text:'🌑 CATACLISMA DELLE ANIME! Echomax usa il suo attacco automatico del turno '+turnNumber+'! Tutti gli avversari in campo perdono il 40% dei loro PS massimi, senza riduzioni da Difesa o Scudi!'});
            // Copia gli indici perché i KO possono rimuoverli dal campo.
            for(const heroIdx of [...(workingField.p1||[])]){
              const hero=workingTeams.p1?.[heroIdx];
              if(!hero||hero.hp<=0)continue;
              const fixedDamage=echoRaidPulseDamage(hero.maxHp);
              if(fixedDamage>0)applyDamage(hero,fixedDamage,'p1',heroIdx,
                '💥 Cataclisma delle Anime: '+hero.name+' subisce '+fixedDamage+
                ' danni fissi (40% dei PS massimi)!');
            }
            events.push({type:'battle_actor_end'});
          }
        }
        // I danni e le cure automatiche a fine turno non appartengono all'ultimo attaccante.
        events.push({type:'battle_actor_end'});
        // Reset turno anche per chi è in panchina o esausto.
        for(const [role,roster] of Object.entries(workingTeams)){
          for(let i=0;i<(roster||[]).length;i++){
            const fighter=roster[i];
            resetNewcomerTurnFlags(fighter);
            const expired=tickCursedBody(fighter);
            if(expired.length){
              events.push({type:'status_update',targetPlayer:role,targetIdx:i,
                statuses:JSON.parse(JSON.stringify(fighter.statuses)),
                text:'👻 '+fighter.name+': '+expired.join(', ')+
                  (expired.length===1?' torna disponibile!':' tornano disponibili!')});
            }
          }
        }

        let eotTargets = [];
        activeMatchPlayers.forEach(p => {
            workingField[p].forEach(idx => eotTargets.push({ player: p, charTeamIdx: idx }));
        });

        for (let target of eotTargets) {
            let char = workingTeams[target.player]?.[target.charTeamIdx];
            if (!char || char.hp <= 0 || !char.statuses) continue;
            endRapidTransmutationTurn(char);
            if(endVictoryBootsTurn(char))
              events.push({type:'text',text:`👢 Il bonus Velocità degli Stivali dello Slancio di ${char.name} svanisce.`});
            if(endPhoenixFeatherTurn(char))
              events.push({type:'text',text:`🪶 Il bonus Difesa della Piuma della Rinascita di ${char.name} svanisce.`});
            const trap=char.statuses.find(s=>s.type===ZODIAC_TRAP);
            if(trap){
              // Tre turni completi dopo l'applicazione; non conta il turno di evocazione.
              if(trap.justApplied)delete trap.justApplied;
              else if(--trap.turns<=0){
                char.statuses=char.statuses.filter(s=>s!==trap);
                updateStatusUI(target.player,target.charTeamIdx);
                events.push({type:'text',text:`🕳️ ${char.name} è libero dalla Prigione Sotterranea!`});
              }
            }
            const sproutAtEnd=activateHealingSprout(char);
            if(sproutAtEnd)events.push({type:'damage',targetPlayer:target.player,targetIdx:target.charTeamIdx,newHp:char.hp,
              text:`🌱 ${char.name} recupera ${sproutAtEnd} PS grazie al Germoglio Curativo!`});
            const sprayAtEnd=activateNeutralizingSpray(char);
            if(sprayAtEnd.length){
                updateStatusUI(target.player,target.charTeamIdx);
                events.push({type:'text',text:`🧴 Spray Neutralizzante di ${char.name}: rimuove ${sprayAtEnd.join(', ')}!`});
            }

            const leftoversHeal=getHeldEndTurnHeal(char);
            if(leftoversHeal && char.hp<char.maxHp){
                char.hp=Math.min(char.maxHp,char.hp+leftoversHeal);
                events.push({type:'damage',text:`🍲 ${char.name} recupera ${leftoversHeal} PS grazie agli Avanzi!`,
                    targetPlayer:target.player,targetIdx:target.charTeamIdx,newHp:char.hp});
            }

            // --- NUOVA LOGICA: PASSIVE ON_TURN_END ---
            if (char.passive && char.passive.type === 'on_turn_end') {
                const triggers = char.passive.chance === undefined || Math.random() < char.passive.chance;

                if (triggers) {
                    if ((char.passive.healPercent || char.passive.healPercentRandom) && char.hp < char.maxHp) {
                        let hPercent = char.passive.healPercent || 0;
                        if (char.passive.healPercentRandom) {
                            hPercent = char.passive.healPercentRandom.min + Math.random() * (char.passive.healPercentRandom.max - char.passive.healPercentRandom.min);
                        }
                        const healAmount = Math.max(1, Math.floor(char.maxHp * hPercent));
                        char.hp = Math.min(char.maxHp, char.hp + healAmount);
                        events.push({ type: 'damage', text: `✨ ${char.name} attiva ${char.passive.name}: recupera ${healAmount} PS!`, targetPlayer: target.player, targetIdx: target.charTeamIdx, newHp: char.hp, isPassive: true, passiveChar: char.name, passiveName: char.passive.name });
                    }
                    if (char.passive.healLowestAllyPercent) {
                        let myTeamPlayers = [target.player];
                        if (gameState.gameMode === 'multipla') {
                            myTeamPlayers = ['p1', 'p2'].includes(target.player) ? ['p1', 'p2'] : ['p3', 'p4'];
                        } else if (gameState.gameMode === 'juggernaut') {
                            const juggPlayer = gameState.settings.juggernautPlayer || 'p1';
                            if (target.player !== juggPlayer) {
                                myTeamPlayers = activeMatchPlayers.filter(p => p !== juggPlayer);
                            }
                        }

                        let lowestAlly = null;
                        let lowestHpRatio = 1.0;

                        myTeamPlayers.forEach(pAlly => {
                            if (workingField[pAlly]) {
                                workingField[pAlly].forEach(idx => {
                                    const ally = workingTeams[pAlly][idx];
                                    if (ally && ally.hp > 0 && ally.hp < ally.maxHp) {
                                        const ratio = ally.hp / ally.maxHp;
                                        if (ratio < lowestHpRatio) {
                                            lowestHpRatio = ratio;
                                            lowestAlly = { p: pAlly, idx: idx, char: ally };
                                        }
                                    }
                                });
                            }
                        });

                        if (lowestAlly) {
                            const healAmount = Math.max(1, Math.floor(lowestAlly.char.maxHp * char.passive.healLowestAllyPercent));
                            lowestAlly.char.hp = Math.min(lowestAlly.char.maxHp, lowestAlly.char.hp + healAmount);
                            events.push({ type: 'damage', text: `✨ ${char.name} attiva ${char.passive.name}! ${lowestAlly.char.name} recupera ${healAmount} PS!`, targetPlayer: lowestAlly.p, targetIdx: lowestAlly.idx, newHp: lowestAlly.char.hp, isPassive: true, passiveChar: char.name, passiveName: char.passive.name });
                        }
                    }
                    
                    if (char.passive.teamStatBuff && (char.passive.teamStatBuffChance === undefined || Math.random() < char.passive.teamStatBuffChance)) {
                        let myTeamPlayers = [target.player];
                        if (gameState.gameMode === 'multipla') {
                            myTeamPlayers = ['p1', 'p2'].includes(target.player) ? ['p1', 'p2'] : ['p3', 'p4'];
                        } else if (gameState.gameMode === 'juggernaut' || gameState.gameMode === 'survival') {
                            const juggPlayer = gameState.settings.juggernautPlayer || (gameState.gameMode === 'survival' ? 'p2' : 'p1');
                            if (target.player !== juggPlayer) {
                                myTeamPlayers = activeMatchPlayers.filter(p => p !== juggPlayer);
                            }
                        }
                        let buffed = false;
                        myTeamPlayers.forEach(pAlly => {
                            if (workingField[pAlly]) {
                                workingField[pAlly].forEach(idx => {
                                    const ally = workingTeams[pAlly][idx];
                                    if (ally && ally.hp > 0) {
                                        if (char.passive.teamStatBuff.atk) applyBattleStatModifier(ally, 'atk', char.passive.teamStatBuff.atk);
                                        if (char.passive.teamStatBuff.def) applyBattleStatModifier(ally, 'def', char.passive.teamStatBuff.def);
                                        if (char.passive.teamStatBuff.spd) applyBattleStatModifier(ally, 'spd', char.passive.teamStatBuff.spd);
                                        buffed = true;
                                    }
                                });
                            }
                        });
                        if (buffed) {
                             let statTexts = [];
                             if (char.passive.teamStatBuff.atk) statTexts.push("l'Attacco");
                             if (char.passive.teamStatBuff.def) statTexts.push("la Difesa");
                             if (char.passive.teamStatBuff.spd) statTexts.push("la Velocità");
                             events.push({ type: 'text', text: `✨ ${char.name} impone ${char.passive.name}! ${statTexts.join(" e ")} del team aumenta!`, isPassive: true, passiveChar: char.name, passiveName: char.passive.name });
                        }
                    }

                    if (char.passive.enemyStatusEffect) {
                        let enemyPlayers = [];
                        if (gameState.gameMode === 'multipla') {
                            enemyPlayers = ['p1', 'p2'].includes(target.player) ? ['p3', 'p4'] : ['p1', 'p2'];
                        } else if (gameState.gameMode === 'juggernaut' || gameState.gameMode === 'survival') {
                            const juggPlayer = gameState.settings.juggernautPlayer || (gameState.gameMode === 'survival' ? 'p2' : 'p1');
                            enemyPlayers = target.player === juggPlayer ? activeMatchPlayers.filter(p => p !== juggPlayer) : [juggPlayer];
                        } else {
                            const pKeys = Object.keys(workingField).filter(k => workingField[k].length > 0);
                            enemyPlayers = pKeys.filter(k => k !== target.player);
                        }

                        let applied = false;
                        enemyPlayers.forEach(ep => {
                            if (workingField[ep]) {
                                workingField[ep].forEach(eIdx => {
                                    const enemy = workingTeams[ep][eIdx];
                                    if (enemy && enemy.hp > 0 && Math.random() < char.passive.enemyStatusEffect.chance) {
                                        const sType = char.passive.enemyStatusEffect.type;
                                        
                                        const isNegative = ['Avvelenato', 'Scottato', 'Elettrizzato', 'Congelato', 'Addormentato', 'Confuso', 'Indebolito', 'Stordito', 'Accecato', 'Incantato', 'Anima Distorta', 'Assiderato'].includes(sType);
                                        if (isNegative && (enemy.passive?.immuneToNegativeStatuses || blockedEnemyPassive(enemy) || (sType==='Accecato'&&isEchoRaidAccuracyProtected(enemy)))) {
                                            return; 
                                        }

                                        const existingIdx = enemy.statuses.findIndex(s => s.type === sType);
                                        if (existingIdx === -1) {
                                            enemy.statuses.push({ type: sType, turns: char.passive.enemyStatusEffect.turns || 1 });
                                        } else {
                                            enemy.statuses[existingIdx].turns = char.passive.enemyStatusEffect.turns || 1;
                                        }
                                        updateStatusUI(ep, eIdx);
                                        applied = true;
                                    }
                                });
                            }
                        });
                        
                        if (applied) {
                            events.push({ type: 'text', text: `✨ ${char.name} attiva ${char.passive.name}!`, isPassive: true, passiveChar: char.name, passiveName: char.passive.name });
                        }
                    }
                }
            }

            // Bugs Bunny: bonus personale al 50%, ma debuff di un nemico ogni turno.
            if (char.passive?.type === 'bugs_chaos') {
                if (Math.random() < 0.5) {
                    const boosted = randomBuff(char);
                    events.push({type:'text',text:`🐰 Che succede, amico? ${char.name} aumenta ${boosted} del 15%!`,isPassive:true,passiveChar:char.name,passiveName:char.passive.name});
                }
                const opponents = gameState.gameMode === 'multipla'
                    ? (['p1','p2'].includes(target.player) ? ['p3','p4'] : ['p1','p2'])
                    : gameState.gameMode === 'torneo'
                        ? getTournamentMatchOpponents(target.player)
                        : activeMatchPlayers.filter(p => p !== target.player);
                const choices = opponents.flatMap(p => (workingField[p]||[]).map(i => workingTeams[p]?.[i]).filter(u => u?.hp>0));
                if (choices.length) {
                    const enemy=choices[Math.floor(Math.random()*choices.length)];
                    if (immuneToStatDrops(enemy)||blockedEnemyPassive(enemy)) {
                        events.push({type:'text',text:`🛡️ ${enemy.name} resiste al calo di statistiche grazie a una protezione!`,isPassive:true,passiveChar:enemy.name,passiveName:enemy.passive?.name||'Scudo Anti-Magia'});
                    } else {
                    const weakened=randomDebuff(enemy);
                    events.push({type:'text',text:`🐰 ${char.name} distrae ${enemy.name}: ${weakened} -15%!`,isPassive:true,passiveChar:char.name,passiveName:char.passive.name});
                    }
                }
            }

            // Riduzione Cooldown (Ricarica turni per mossa) e Mosse Rubate
            if (char.moves) {
                for (let i = char.moves.length - 1; i >= 0; i--) {
                    let m = char.moves[i];
                    if (m.currentCooldown && m.currentCooldown > 0) {
                        m.currentCooldown -= 1;
                    }
                    if (m.isStolen) {
                        m.stolenTurns -= 1;
                        if (m.stolenTurns <= 0) {
                            const returnedMove = char.moves.splice(i, 1)[0];
                            if (workingTeams[returnedMove.originalOwnerPlayer] && workingTeams[returnedMove.originalOwnerPlayer][returnedMove.originalOwnerIdx]) {
                                workingTeams[returnedMove.originalOwnerPlayer][returnedMove.originalOwnerIdx].moves.push(returnedMove);
                                events.push({ type: 'text', text: `⏳ La mossa "${returnedMove.name}" rubata da ${char.name} è tornata al suo proprietario!` });
                            }
                        }
                    }
                }
            }

            // Purificazione automatica del Juggernaut ogni 2 turni
            if (char.isJuggernaut) {
                char.juggTurnCount = (char.juggTurnCount || 0) + 1;
                if (char.juggTurnCount >= 2) {
                    char.juggTurnCount = 0; // Reset contatore
                    if(restoreEchoRaidAccuracy(char))
                        events.push({type:'text',text:'🎯 Aura Suprema: Echomax ripristina la Precisione al 100% dopo due turni!'});
                    const negatives = ['Avvelenato', 'Scottato', 'Elettrizzato', 'Congelato', 'Addormentato', 'Confuso', 'Indebolito', 'Stordito', 'Accecato', 'Incantato', 'Anima Distorta', 'Assiderato'];
                    const hasNegative = char.statuses.some(s => negatives.includes(s.type));
                    if (hasNegative) {
                        char.statuses = char.statuses.filter(s => !negatives.includes(s.type));
                        updateStatusUI(target.player, target.charTeamIdx);
                        events.push({ type: 'text', text: `✨ Aura Suprema: ${char.name} si purifica automaticamente da tutti gli status negativi!` });
                    }
                }
            }

            let shieldIdx = char.statuses.findIndex(s => s.type === 'Scudo Team');
            if (shieldIdx !== -1) {
                char.statuses[shieldIdx].turns -= 1;
                if (char.statuses[shieldIdx].turns <= 0) {
                    char.statuses.splice(shieldIdx, 1);
                    updateStatusUI(target.player, target.charTeamIdx);
                    events.push({ type: 'text', text: `Lo Scudo protettivo su ${char.name} svanisce!` });
                }
            }

            let protIdx = char.statuses.findIndex(s => s.type === 'Protetto');
            if (protIdx !== -1) {
                char.statuses.splice(protIdx, 1);
                updateStatusUI(target.player, target.charTeamIdx);
            }

            let groppaIdx = char.statuses.findIndex(s => s.type === 'In_Groppa');
            if (groppaIdx !== -1) {
                char.statuses.splice(groppaIdx, 1);
                updateStatusUI(target.player, target.charTeamIdx);
                events.push({ type: 'text', text: `🦕 ${char.name} scende dalla groppa di Yoshi a fine turno!` });
            }

            let rashieldIdx = char.statuses.findIndex(s => s.type === 'Rashield');
            if (rashieldIdx !== -1) {
                char.statuses.splice(rashieldIdx, 1);
                updateStatusUI(target.player, target.charTeamIdx);
            }

            let ombraIdx = char.statuses.findIndex(s => s.type === 'Ombra Rapida');
            if (ombraIdx !== -1) {
                char.statuses[ombraIdx].turns -= 1;
                if (char.statuses[ombraIdx].turns <= 0) {
                    char.statuses.splice(ombraIdx, 1);
                    updateStatusUI(target.player, target.charTeamIdx);
                    events.push({ type: 'text', text: `L'Ombra Rapida di ${char.name} si dissolve!` });
                }
            }

            let rifIdx = char.statuses.findIndex(s => s.type === 'Riflesso');
            if (rifIdx !== -1) {
                char.statuses[rifIdx].turns -= 1;
                if (char.statuses[rifIdx].turns <= 0) {
                    char.statuses.splice(rifIdx, 1);
                    updateStatusUI(target.player, target.charTeamIdx);
                    events.push({ type: 'text', text: `La barriera di vento di ${char.name} svanisce!` });
                }
            }

            let blindIdx = char.statuses.findIndex(s => s.type === 'Accecato');
            if (blindIdx !== -1) {
                char.statuses[blindIdx].turns = (char.statuses[blindIdx].turns || 3) - 1;
                if (char.statuses[blindIdx].turns <= 0) {
                    char.statuses.splice(blindIdx,1);
                    updateStatusUI(target.player,target.charTeamIdx);
                    events.push({type:'text',text:`✨ ${char.name} torna a vedere chiaramente!`});
                }
            }

            let enchantIdx=char.statuses.findIndex(s=>s.type==='Incantato');
            if(enchantIdx!==-1){
              if(char.statuses[enchantIdx].justApplied){
                char.statuses[enchantIdx].justApplied=false;
              }else{
                char.statuses[enchantIdx].turns--;
                if(char.statuses[enchantIdx].turns<=0){
                  char.statuses.splice(enchantIdx,1);
                  updateStatusUI(target.player,target.charTeamIdx);
                  events.push({type:'text',text:`🎶 ${char.name} non è più incantato dalla musica di Ember!`});
                }
              }
            }
            if(tickAssideramento(char)){
              updateStatusUI(target.player,target.charTeamIdx);
              events.push({type:'text',text:'🌤️ '+char.name+
                ' si riprende dall’Assideramento: Velocità e danni tornano normali!'});
            }

            let indebIdx = char.statuses.findIndex(s => s.type === 'Indebolito');
            if (indebIdx !== -1) {
                char.statuses[indebIdx].turns -= 1;
                if (char.statuses[indebIdx].turns <= 0) {
                    char.statuses.splice(indebIdx, 1);
                    updateStatusUI(target.player, target.charTeamIdx);
                    events.push({ type: 'text', text: `${char.name} non è più indebolito!` });
                }
            }

            let burnIdx = char.statuses.findIndex(s => s.type === 'Scottato');
            if (burnIdx !== -1) { 
                const burnDmg = Math.max(5, Math.floor(char.maxHp * 0.10)); // 10% degli HP Max
                applyDamage(char, burnDmg, target.player, target.charTeamIdx, `${char.name} subisce ${burnDmg} danni dalla scottatura!`); 
            }
            if (char.hp <= 0) continue;

            // Il veleno può dare il KO. applyDamage/handleFaint in quel caso
            // svuota statuses: non leggere l'indice di uno status cancellato.
            const poisonResult = resolvePoisonEndTurn(char, psnDmg => {
                applyDamage(char, psnDmg, target.player, target.charTeamIdx,
                    `${char.name} subisce ${psnDmg} danni a causa del veleno!`);
            });
            if (poisonResult.progressed) updateStatusUI(target.player, target.charTeamIdx);

            const soulDamage = getDistortedSoulDamage(char);
            if (soulDamage > 0 && char.hp > 0) {
                applyDamage(char, soulDamage, target.player, target.charTeamIdx, `👁️ ${char.name} perde ${soulDamage} PS per Anima Distorta!`);
            }
            if (char.hp <= 0) continue;
            const hakiBefore=char.hakiGuardTurns||0;
            if(hakiBefore>0){
              const hakiAfter=tickHakiGuard(char);
              if(hakiAfter===0)events.push({type:'text',text:'🛡️ L’Haki dell’Armatura di '+char.name+' svanisce.'});
            }

            let regenIdx = char.statuses.findIndex(s => s.type === 'Rigenerazione');
            if (regenIdx !== -1) {
                if (char.hp > 0 && char.hp < char.maxHp) {
                    const healAmount = Math.max(1, Math.floor(char.maxHp * (char.statuses[regenIdx].healFactor || 0.15)));
                    char.hp = Math.min(char.maxHp, char.hp + healAmount);
                    events.push({ type: 'damage', text: `✨ ${char.name} rigenera ${healAmount} PS grazie alla Pozione!`, targetPlayer: target.player, targetIdx: target.charTeamIdx, newHp: char.hp });
                }
                char.statuses[regenIdx].turns -= 1;
                if (char.statuses[regenIdx].turns <= 0) {
                    char.statuses.splice(regenIdx, 1);
                    updateStatusUI(target.player, target.charTeamIdx);
                    events.push({ type: 'text', text: `L'effetto rigenerante su ${char.name} è svanito!` });
                }
            }

            char.damageTakenLastTurn = char.damageTakenThisTurn || 0;
            char.damageTakenThisTurn = 0;
        }

        // Tempesta di neve: un'unica applicazione alla fine di ogni turno,
        // a tutti i Multimon sul campo, indipendentemente dal giocatore.
        if (workingWeather?.type === 'snowstorm' && workingWeather.turns > 0) {
            events.push({type:'text',text:`❄️ TEMPESTA DI NEVE · ${workingWeather.turns} turni rimasti.`});
            for (const target of eotTargets) {
                const char=workingTeams[target.player]?.[target.charTeamIdx];
                if (!char || char.hp <= 0) continue;
                const outcome=snowstormOutcome(char,true);
                if (outcome.damage) applyDamage(char,outcome.damage,target.player,target.charTeamIdx,`❄️ ${char.name} perde ${outcome.damage} PS per la neve!`);
                if (char.hp > 0 && outcome.heal) {
                    char.hp=Math.min(char.maxHp,char.hp+outcome.heal);
                    events.push({type:'damage',text:`❄️ ${char.name} attiva Resistenza al Freddo e recupera ${outcome.heal} PS!`,targetPlayer:target.player,targetIdx:target.charTeamIdx,newHp:char.hp,isPassive:true,passiveChar:char.name,passiveName:char.passive.name});
                }
            }
            workingWeather.turns--;
            if (workingWeather.turns <= 0) {
                events.push({type:'text',text:'☀️ La tempesta di neve finisce.'});
                workingWeather=null;
            }
        }
        if(isLushGrass(workingWeather)){
            events.push({type:'text',text:'🌿 ERBA RIGOGLIOSA · '+workingWeather.turns+' turni rimasti. Mosse Erba +20%, cure Erba 5% PS.'});
            for(const target of eotTargets){
                const char=workingTeams[target.player]?.[target.charTeamIdx];
                const healed=lushGrassHeal(char,workingWeather);
                if(healed>0)events.push({type:'damage',targetPlayer:target.player,
                    targetIdx:target.charTeamIdx,newHp:char.hp,
                    text:'🌿 Erba Rigogliosa: '+char.name+' recupera '+healed+' PS!'});
            }
            if(--workingWeather.turns<=0){
                events.push({type:'text',text:'🌱 L’Erba Rigogliosa svanisce dal campo.'});
                workingWeather=null;
            }
        }
        if(isRainyWeather(workingWeather)&&Number.isFinite(workingWeather.turns)){
            events.push({type:'text',text:`🌧️ TEMPESTA · ${workingWeather.turns} turni rimasti. Acqua +25%, Fuoco -25%.`});
            workingWeather.turns--;
            if(workingWeather.turns<=0){
                events.push({type:'text',text:'☀️ La tempesta si placa: il meteo torna normale.'});
                workingWeather=null;
            }
        }
        for (const target of eotTargets) {
            const char=workingTeams[target.player]?.[target.charTeamIdx];
            if (char && char.refractionTurns > 0) endRefractionTurn(char);
        }
        const tailwindBefore=workingTailwind;
        workingTailwind=advanceTailwind(workingTailwind,tailwindJustActivated);
        for(const [role,turns] of Object.entries(tailwindBefore)){
            if(turns>0&&!workingTailwind[role])
                events.push({type:'text',text:'💨 Tailwind si esaurisce per la squadra di '+(gameState.players?.[role]||role)+'!'});
        }

        // --- GESTIONE RITORNO TRADITORI (Anomalia Eclissi) ---
        let betrayersToReturn = [];
        workingTeams['p2'].forEach((c, idx) => {
             if (c.isBetrayer) {
                  if (c.hp <= 0 || c.betrayalTurns <= 0) {
                       betrayersToReturn.push({ idx, char: c });
                  } else {
                       c.betrayalTurns -= 1;
                  }
             }
        });

        betrayersToReturn.forEach(b => {
             let returningChar = JSON.parse(JSON.stringify(b.char));
             returningChar.isBetrayer = false;
             returningChar.imageFilter = 'none';
             
             // Uccide il clone fasullo nella squadra nemica per rimuoverlo
             workingTeams['p2'][b.idx].isBetrayer = false; 
             workingTeams['p2'][b.idx].hp = 0;
             workingTeams['p2'][b.idx].isSummonOnly = true; 
             
             const fieldPos = workingField['p2'].indexOf(b.idx);
             if (fieldPos !== -1) {
                  workingField['p2'].splice(fieldPos, 1);
                  events.push({ type: 'remove', player: 'p2', pos: fieldPos });
             }
             
             workingTeams['p1'].push(returningChar);
             const newIdx = workingTeams['p1'].length - 1;
             
             let textEvt = returningChar.hp > 0 
                  ? `✨ L'eclissi svanisce! ${returningChar.name} riprende il controllo e torna in squadra!`
                  : `💀 Sconfitto, ${returningChar.name} si libera dal controllo mentale e torna nella tua panchina.`;
             
             const putOnField = returningChar.hp > 0 && workingField['p1'].length < gameState.settings.fieldSize;
             if (putOnField) {
                 workingField['p1'].push(newIdx);
             }
             
             events.push({ type: 'text', text: textEvt });
             events.push({ type: 'summon', text: '', player: 'p1', newChar: returningChar, fieldIdx: newIdx, putOnField: putOnField });
        });

        // Echomax raid: +5% Velocità BASE a ogni fine turno, anche dopo
        // Ricarica o Stordito. Il limite standard è +100% (baseSpd * 2).
        // Non riguarda la forma giocabile o Echomax sbloccato.
        if(gameState.isEchoFinalBattle && (gameState.echoFinalStage||'raid')==='raid'){
          const idx=workingTeams.p2?.findIndex(c=>c?.id==='echomax'&&c.isEchoRaidBoss===true&&c.hp>0)??-1;
          if(idx>=0){
            const boss=workingTeams.p2[idx];
            if(applyBattleStatModifier(boss,'spd',1.05)){
              events.push({type:'echo_stat_reset',player:'p2',index:idx,
                spd:boss.spd,text:'💨 Crescita Inarrestabile! Echomax ottiene +5% Velocità cumulabile ('+
                Math.round(100*boss.spd/(boss.baseSpd||boss.spd))+'% della velocità base, massimo 200%)!'});
            }
          }
        }
        // Il dialogo finale segue le fasi reali degli HP del boss, una sola
        // volta per soglia; sopravvive anche ai checkpoint della campagna.
        if(gameState.isEchoFinalBattle)
            emitEchoFinalStoryBeats(workingTeams.p2,events);
        // Le Copie Perfette svaniscono dopo tre turni combattuti; mai permanenti.
        expireEchoCopies(workingTeams,workingField,events);
        // Avanzamento autorevole: forma giocabile, poi fino a due anime dei caduti.
        // Il risultato viene deciso SOLO dopo la trasformazione/evocazione.
        const echoFinalStage=advanceEchoFinalPhase({
            isEchoFinalBattle:gameState.isEchoFinalBattle,
            stage:gameState.echoFinalStage||'raid',
            teams:workingTeams,field:workingField,characters:CHARACTERS,events
        });

        let nextStatus = 'battling';
        let winner = null;
        let tResults = { ...gameState.tournamentResults };
        let tStatus = { ...gameState.tournamentMatchStatus }; // <-- FIX: Spostato fuori per salvataggio globale
        let newScores = { ...gameState.playerScores };
        let currentSurvivalRound = gameState.survivalRound || 1; // <--- AGGIUNTO

        if (gameState.gameMode === 'multipla') {
            const team1Alive = workingTeams.p1.some(c=>c.hp>0 && !c.isSummonOnly) || workingTeams.p2.some(c=>c.hp>0 && !c.isSummonOnly);
            const team2Alive = workingTeams.p3.some(c=>c.hp>0 && !c.isSummonOnly) || workingTeams.p4.some(c=>c.hp>0 && !c.isSummonOnly);
            if (!team1Alive && !team2Alive) { nextStatus = 'gameover'; winner = 'Pareggio'; }
            else if (!team1Alive) { nextStatus = 'gameover'; winner = `${gameState.players.p3} & ${gameState.players.p4}`; }
            else if (!team2Alive) { nextStatus = 'gameover'; winner = `${gameState.players.p1} & ${gameState.players.p2}`; }
        } 
        else if (gameState.gameMode === 'ultimon') {
            // In Ultimon le squadre di questo incontro contengono SOLO i Multimon schierati.
            // La riserva permanente è mantenuta in ultimon.rosters.
            const contenders = gameState.ultimon?.pair || [];
            const firstAlive = (workingTeams[contenders[0]] || []).some(c=>c.hp>0 && !c.isSummonOnly);
            const secondAlive = (workingTeams[contenders[1]] || []).some(c=>c.hp>0 && !c.isSummonOnly);
            if (!firstAlive || !secondAlive) {
                nextStatus = 'ultimon_result';
                winner = firstAlive ? gameState.players[contenders[0]] : secondAlive ? gameState.players[contenders[1]] : 'Pareggio';
            }
        }
        else if (gameState.gameMode === 'classica') {
            const p1Alive = workingTeams.p1.some(c=>c.hp>0 && !c.isSummonOnly);
            const p2Alive = workingTeams.p2.some(c=>c.hp>0 && !c.isSummonOnly);
            // Nel raid finale conta Echomax, non le sue tre anime:
            // la sconfitta di un aiutante non termina la battaglia;
            // il KO del boss porta alla vittoria anche se gli aiutanti sono vivi.
            const echoResult=echoFinalVictory({isEchoFinalBattle:gameState.isEchoFinalBattle,
                heroes:workingTeams.p1,enemies:workingTeams.p2,stage:echoFinalStage});
            if(echoResult){
                nextStatus='gameover';
                winner=echoResult==='heroes'?gameState.players.p1:
                    echoResult==='boss'?gameState.players.p2:'Pareggio';
            }else if(!p1Alive&&!p2Alive){nextStatus='gameover';winner='Pareggio';}
            else if(!p1Alive){nextStatus='gameover';winner=gameState.players.p2;}
            else if(!p2Alive){nextStatus='gameover';winner=gameState.players.p1;}
        }
        // --- AGGIUNTO: LOGICA INFINITA SOPRAVVIVENZA ---
        else if (gameState.gameMode === 'survival') {
            const juggPlayer = gameState.settings.juggernautPlayer || 'p2';
            const hordeAlive = workingTeams[juggPlayer] && workingTeams[juggPlayer].some(c=>c.hp>0 && !c.isSummonOnly);
            
            const activeMatchPlayers = getActivePlayers();
            const humansPlayers = activeMatchPlayers.filter(p => p !== juggPlayer);
            const humansAlive = humansPlayers.some(p => workingTeams[p] && workingTeams[p].some(c=>c.hp>0 && !c.isSummonOnly));

            if (!humansAlive) { 
                nextStatus = 'gameover'; 
                winner = gameState.players[juggPlayer]; 
            }
            else if (!hordeAlive) {
                // Il nemico è morto! Creiamo un nuovo nemico invece di finire il gioco
                currentSurvivalRound++;
                
                const baseRoster = gameState.settings.fusionMode ? FUSION_CHARACTERS : CHARACTERS;
                const draftable = baseRoster.filter(c => !c.isSummonOnly && !c.isSecretUnlock);
                const nextEnemyBase = draftable[Math.floor(Math.random() * draftable.length)];
                
                // Scala la potenza del nemico in base al round (+5% stats ogni round)
                const scale = 1 + (currentSurvivalRound * 0.05);

                let nextEnemy = {
                    ...JSON.parse(JSON.stringify(nextEnemyBase)),
                    hp: Math.floor(nextEnemyBase.maxHp * scale),
                    maxHp: Math.floor(nextEnemyBase.maxHp * scale),
                    atk: Math.floor(nextEnemyBase.atk * scale),
                    baseAtk: Math.floor(nextEnemyBase.atk * scale),
                    def: Math.floor(nextEnemyBase.def * scale),
                    baseDef: Math.floor(nextEnemyBase.def * scale),
                    statuses: [],
                    consecutiveProtect: 0,
                    revealed: true,
                    moves: nextEnemyBase.moves.filter(Boolean).map(m => ({ ...m, remainingUses: m.maxUses !== undefined ? m.maxUses : null }))
                };

                // Rigenera il team della CPU con il nuovo nemico
                workingTeams[juggPlayer] = [nextEnemy];
                workingField[juggPlayer] = [0]; 
                
                // Cura i personaggi dei giocatori in campo del 20% come premio (e rianima chi è morto in Co-op!)
                humansPlayers.forEach(p => {
                    if (workingTeams[p]) {
                        workingTeams[p].forEach((char, idx) => {
                            if (char && !char.isSummonOnly) {
                                if (char.hp <= 0) {
                                    char.hp = Math.max(1, Math.floor(char.maxHp * 0.2));
                                    char.statuses = [];
                                    if (workingField[p] && !workingField[p].includes(idx)) {
                                        workingField[p].push(idx);
                                    }
                                } else {
                                    const heal = Math.floor(char.maxHp * 0.2);
                                    char.hp = Math.min(char.maxHp, char.hp + heal);
                                }
                            }
                        });
                    }
                });

                events.push({ type: 'text', text: `🌟 Round ${currentSurvivalRound - 1} superato! La squadra recupera il 20% dei PS! I caduti si rialzano!` });
                events.push({ type: 'text', text: `⚠️ Un nuovo sfidante appare: ${nextEnemy.name} (Livello ${currentSurvivalRound})!` });

                nextStatus = 'battling'; // Continua la lotta!
            }
        }
        // -----------------------------------------------
        else if (gameState.gameMode === 'juggernaut') {
            const juggPlayer = gameState.settings.juggernautPlayer || 'p1';
            const juggAlive = workingTeams[juggPlayer] && workingTeams[juggPlayer].some(c=>c.hp>0 && !c.isSummonOnly);
            const opponentsAlive = activeMatchPlayers.filter(p => p !== juggPlayer).some(p => workingTeams[p] && workingTeams[p].some(c=>c.hp>0 && !c.isSummonOnly));
            
            if (!juggAlive && !opponentsAlive) { nextStatus = 'gameover'; winner = 'Pareggio'; }
            else if (!juggAlive) { 
                nextStatus = 'gameover'; 
                winner = activeMatchPlayers.filter(p => p !== juggPlayer).map(p => gameState.players[p]).join(' & '); 
            }
            else if (!opponentsAlive) { nextStatus = 'gameover'; winner = gameState.players[juggPlayer]; }
        }
        else if (gameState.gameMode === 'torneo') {
            const phase = gameState.tournamentPhase || 'semis';
            const b = gameState.tournamentBracket || ['p1', 'p2', 'p3', 'p4'];
            
            if (phase === 'semis') {
                const p1 = b[0], p2 = b[1], p3 = b[2], p4 = b[3];
                
                if (tStatus.semi1 !== 'finished') {
                    const p1Alive = workingTeams[p1]?.some(c=>c.hp>0 && !c.isSummonOnly);
                    const p2Alive = workingTeams[p2]?.some(c=>c.hp>0 && !c.isSummonOnly);
                    if (!p1Alive || !p2Alive) {
                        tStatus.semi1 = 'finished';
                        tResults.semi1 = { winner: p1Alive ? p1 : (p2Alive ? p2 : 'p1'), loser: p1Alive ? p2 : (p2Alive ? p1 : 'p2') };
                    }
                }
                
                if (tStatus.semi2 !== 'finished') {
                    const p3Alive = workingTeams[p3]?.some(c=>c.hp>0 && !c.isSummonOnly);
                    const p4Alive = workingTeams[p4]?.some(c=>c.hp>0 && !c.isSummonOnly);
                    if (!p3Alive || !p4Alive) {
                        tStatus.semi2 = 'finished';
                        tResults.semi2 = { winner: p3Alive ? p3 : (p4Alive ? p4 : 'p3'), loser: p3Alive ? p4 : (p4Alive ? p3 : 'p4') };
                    }
                }
                
                if (tStatus.semi1 === 'finished' && tStatus.semi2 === 'finished') {
                    nextStatus = 'intermission';
                }
            } else if (phase === 'finals') {
                const fw1 = tResults.semi1?.winner, fw2 = tResults.semi2?.winner;
                const bw1 = tResults.semi1?.loser, bw2 = tResults.semi2?.loser;
                
                if (tStatus.final !== 'finished' && fw1 && fw2) {
                    const fw1Alive = workingTeams[fw1]?.some(c=>c.hp>0 && !c.isSummonOnly);
                    const fw2Alive = workingTeams[fw2]?.some(c=>c.hp>0 && !c.isSummonOnly);
                    if (!fw1Alive || !fw2Alive) {
                        tStatus.final = 'finished';
                        tResults.final = { winner: fw1Alive ? fw1 : (fw2Alive ? fw2 : fw1), loser: fw1Alive ? fw2 : (fw2Alive ? fw1 : fw2) };
                    }
                }
                
                if (tStatus.bronze !== 'finished' && bw1 && bw2) {
                    const bw1Alive = workingTeams[bw1]?.some(c=>c.hp>0 && !c.isSummonOnly);
                    const bw2Alive = workingTeams[bw2]?.some(c=>c.hp>0 && !c.isSummonOnly);
                    if (!bw1Alive || !bw2Alive) {
                        tStatus.bronze = 'finished';
                        tResults.bronze = { winner: bw1Alive ? bw1 : (bw2Alive ? bw2 : bw1), loser: bw1Alive ? bw2 : (bw2Alive ? bw1 : bw2) };
                    }
                }
                
                // FIX: Il torneo termina non appena si conclude la Finalissima, senza aspettare che finisca anche la sfida per il bronzo!
                if (tStatus.final === 'finished') {
                    nextStatus = 'gameover';
                    winner = gameState.players[tResults.final?.winner];
                    
                    // Se la finale per il bronzo era ancora in corso (es. giocatori inattivi), la concludiamo forzatamente
                    if (tStatus.bronze !== 'finished' && bw1 && bw2) {
                        tStatus.bronze = 'finished';
                        tResults.bronze = { winner: bw1, loser: bw2 };
                    }
                }
            }
            // Rimossa la chiamata doppia problematica a updateState qui!
        }
        else if (gameState.gameMode === 'torneo_punti') {
            const pA = activeMatchPlayers[0];
            const pB = activeMatchPlayers[1];
            const pA_Alive = workingTeams[pA].some(c=>c.hp>0 && !c.isSummonOnly);
            const pB_Alive = workingTeams[pB].some(c=>c.hp>0 && !c.isSummonOnly);
            
            if (!pA_Alive || !pB_Alive) {
                if (pA_Alive) newScores[pA] += 1;
                else if (pB_Alive) newScores[pB] += 1;
                
                if (gameState.currentMatchIdx >= gameState.roundRobinMatches.length - 1) {
                    nextStatus = 'gameover';
                    let maxScore = -1;
                    let bestP = null;
                    Object.keys(newScores).forEach(p => {
                        if (gameState.players[p] && newScores[p] > maxScore) {
                            maxScore = newScores[p];
                            bestP = p;
                        }
                    });
                    winner = gameState.players[bestP];
                } else {
                    nextStatus = 'intermission';
                }
            }
        }
        else if (gameState.gameMode === 'battleroyale') {
            const alivePlayers = activeMatchPlayers.filter(p => workingTeams[p].some(c => c.hp > 0 && !c.isSummonOnly));
            if (alivePlayers.length === 0) { 
                nextStatus = 'gameover'; 
                winner = 'Pareggio'; 
            } else if (alivePlayers.length === 1) { 
                nextStatus = 'gameover'; 
                winner = gameState.players[alivePlayers[0]]; 
            }
        }

        let pendingSwitches = { p1: 0, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0, p7: 0, p8: 0 };
        let hasPendingSwitches = false;

        if (nextStatus !== 'gameover' && nextStatus !== 'intermission' && nextStatus !== 'ultimon_result') {
            activeMatchPlayers.forEach(p => {
                 const mainCharsOnField = workingField[p].filter(idx => !workingTeams[p][idx].isSummonOnly).length;
                 const aliveBench = workingTeams[p].filter((c, i) => c.hp > 0 && !workingField[p].includes(i) && !c.isSummonOnly).length;
                 
                 let targetFieldSize = gameState.settings.fieldSize;
                 if (gameState.gameMode === 'multipla') targetFieldSize = 1;
                 
                 const missing = targetFieldSize - mainCharsOnField;
                 if (missing > 0 && aliveBench > 0) {
                     pendingSwitches[p] = Math.min(missing, aliveBench);
                     hasPendingSwitches = true;
                 }
            });

            if (hasPendingSwitches) {
                nextStatus = 'switching_phase';
            }
        }

        updateState({
          status: 'executing', 
          phaseStartedAt: Date.now(),
          turnCalculationOwner: null,
          turnCalculationStartedAt: null,
          postExecStatus: nextStatus,
          winner,
          survivalRound: currentSurvivalRound, 
          teams: workingTeams,
          field: workingField,
          ...(gameState.isEchoFinalBattle?{echoFinalStage}:{}),
          startOfTurnTeams: startOfTurnTeams, 
          startOfTurnField: startOfTurnField,
          events: events,
          aiMemory: rememberPublicCpuMoves(gameState.aiMemory,publicMovesForAi),
          battleReport: accumulateBattleReport(gameState.battleReport, startOfTurnTeams, events,
            {gameMode:gameState.gameMode,settings:gameState.settings,fieldAtTurnStart:startOfTurnField}),
          actions: { p1: {}, p2: {}, p3: {}, p4: {}, p5: {}, p6: {}, p7: {}, p8: {} },
          inventory: workingInventory,
          healingItemsUsed: workingHealingItemsUsed,
          fieldTraps: workingFieldTraps,
          fieldTrapSeen: workingTrapSeen,
          battleWeather: workingWeather,
          battleTailwind: workingTailwind,
          hyperUsed: workingHyperUsed,
          rogueDawnUsed,
          pendingSwitches: pendingSwitches,
          switchActions: { p1: [], p2: [], p3: [], p4: [], p5: [], p6: [], p7: [], p8: [] },
          tournamentResults: tResults,
          tournamentMatchStatus: tStatus, // <--- FIX INSERITO: Ora si salva correttamente!
          playerScores: newScores
        });
            } finally { stopGemObserver(); }

};

export const playEventsAnimationImpl = async (ctx) => {
const { appMode, gameState, getActivePlayers, playerRole, setActionMenuMode, setCombatLog, setCommandingIdx, setDisplayField, setDisplayTeams, setEventPlaybackPassive, setEventPlaybackText, setIsPlayingEvents, setPlayerRole, setScreenFlash, updateState, advanceOnlinePhase } = ctx;

        setIsPlayingEvents(true);
        
        try {
            // Usa lo stato d'inizio turno per cominciare l'animazione, creando VERA suspance!
            const playbackStart=createBattlePlaybackSnapshot(gameState);
            let currentDisplay=playbackStart.teams;
            let currentDisplayField=playbackStart.field;
            
            setDisplayTeams(currentDisplay);
            setDisplayField(currentDisplayField);

            for (let evt of gameState.events) {
                // Marker statistici, non animazioni visibili.
                if (evt.type === 'battle_actor' || evt.type === 'battle_actor_end') continue;
                if (evt.text) {
                    setEventPlaybackText(evt.text);
                    
                    // Aggiungi al registro battaglia con classificazione colori
                    let logType = 'normal';
                    if (evt.isPassive || evt.type === 'hyper_transform') logType = 'passive';
                    else if (evt.type === 'faint' || evt.text.toLowerCase().includes('esausto')) logType = 'faint';
                    else if (evt.text.toLowerCase().includes('recupera') || evt.text.toLowerCase().includes('cura ') || evt.text.toLowerCase().includes('curato')) logType = 'heal';
                    else if (evt.text.toLowerCase().includes('danni')) logType = 'damage';
                    
                    setCombatLog(prev => [...prev, { text: evt.text, type: logType }]);
                }
                if (evt.isPassive) {
                    setEventPlaybackPassive({ char: evt.passiveChar, name: evt.passiveName });
                } else {
                    setEventPlaybackPassive(null);
                }
                
                if (evt.type === 'summon') {
                   const next=applySummonPlaybackEvent({teams:currentDisplay,field:currentDisplayField},evt);
                   currentDisplay=next.teams;
                   currentDisplayField=next.field;
                   setDisplayTeams(currentDisplay);
                   setDisplayField(currentDisplayField);
                } else if (evt.type === 'echo_stat_reset') {
                    const fighter=currentDisplay?.[evt.player]?.[evt.index];
                    if(fighter){
                        for(const attr of ['atk','def','spd','acc','evasionBonus'])
                            if(evt[attr]!==undefined)fighter[attr]=evt[attr];
                        setDisplayTeams({...currentDisplay});
                    }
                } else if (evt.type === 'hyper_transform') {
                   // --- ANIMAZIONE FORMA IPER LENTA E AD EFFETTO ---
                   setScreenFlash(true);
                   setTimeout(() => setScreenFlash(false), 3500);
                   
                   if (currentDisplay[evt.player] && currentDisplay[evt.player][evt.charTeamIdx]) {
                       currentDisplay[evt.player][evt.charTeamIdx].isHyper = true;
                       setDisplayTeams({ ...currentDisplay });
                   }
                 } else if (evt.type === 'raid_shield_update') {
                    if (applyRaidShieldUpdateEvent(currentDisplay, evt)) {
                        setDisplayTeams({ ...currentDisplay });
                    }
                 } else if (evt.type === 'damage') {
                  if (currentDisplay[evt.targetPlayer] && currentDisplay[evt.targetPlayer][evt.targetIdx]) {
                      currentDisplay[evt.targetPlayer][evt.targetIdx].hp = evt.newHp;
                      setDisplayTeams({ ...currentDisplay });
                  }
                } else if (evt.type === 'switch') {
                   if(currentDisplayField[evt.player]) currentDisplayField[evt.player][evt.pos] = evt.newIdx;
                   setDisplayField({ ...currentDisplayField });
                } else if (evt.type === 'remove') {
                   if(currentDisplayField[evt.player]) currentDisplayField[evt.player].splice(evt.pos, 1);
                   setDisplayField({ ...currentDisplayField });
                } else if (evt.type === 'moves_update') {
                   if(currentDisplay[evt.targetPlayer]?.[evt.targetIdx]){
                       currentDisplay[evt.targetPlayer][evt.targetIdx].moves = evt.moves;
                       setDisplayTeams({...currentDisplay});
                   }
                } else if (evt.type === 'status_update') {
                   if (currentDisplay[evt.targetPlayer] && currentDisplay[evt.targetPlayer][evt.targetIdx]) {
                       currentDisplay[evt.targetPlayer][evt.targetIdx].statuses = evt.statuses;
                       setDisplayTeams({ ...currentDisplay });
                   }
                } else if (evt.type === 'revive_to_field') {
                   if (currentDisplayField[evt.player] && !currentDisplayField[evt.player].includes(evt.targetIdx)) {
                       currentDisplayField[evt.player].push(evt.targetIdx);
                       setDisplayField({ ...currentDisplayField });
                   }
                }
                
                 let delay = evt.type === 'raid_shield_update' && !evt.activated ? 650 : 1600;
                // Le animazioni seguono il ritmo standard delle campagne.
                if (evt.isPassive) delay = 2200; // Tempo extra per far leggere la passiva
                if (evt.type === 'hyper_transform') delay = 4500; // Tempo extra per ammirare la lunghissima trasformazione
                await new Promise(r => setTimeout(r, delay)); 
            }

            setEventPlaybackText('Turno concluso.');
            setEventPlaybackPassive(null);
            await new Promise(r => setTimeout(r, 1000));
        } catch (error) {
            console.error("Errore critico recuperato durante le animazioni:", error);
            setEventPlaybackText('Errore grafico superato.');
            setEventPlaybackPassive(null);
            await new Promise(r => setTimeout(r, 1000));
            } finally {
            setIsPlayingEvents(false);
            
            // L'host online conferma con una transazione che lo stato sia
            // ANCORA lo stesso: così un'animazione vecchia non annulla
            // un KO, una sostituzione o un turno già recuperato.
            if(appMode==='online_room' && playerRole==='p1'){
                try{await advanceOnlinePhase(gameState.phaseStartedAt);}
                catch(error){console.error('Avanzamento dopo animazione non riuscito:',error);}
                if(!gameState.isBot?.[playerRole] && gameState.field?.[playerRole]?.length){
                    setCommandingIdx(0);setActionMenuMode('moves');
                }else setCommandingIdx(-1);
            }else if(appMode==='local_room'){
                if (gameState.postExecStatus === 'ultimon_result') {
                     updateState({ status: 'ultimon_result', events: [] });
                } else if (gameState.postExecStatus === 'gameover') {
                     updateState({ status: 'gameover', events: [] });
                } else if (gameState.postExecStatus === 'intermission') {
                     updateState({ status: 'intermission', events: [] });
                } else if (gameState.postExecStatus === 'switching_phase') {
                     if (appMode === 'local_room') {
                         const active = getActivePlayers().filter(p => !gameState.isBot[p] && gameState.pendingSwitches[p] > 0);
                         if (active.length > 0) setPlayerRole(active[0]);
                     }
                     updateState({ status: 'switching_phase', events: [] });
                } else {
                    if (appMode === 'local_room') {
                        const active = getActivePlayers().filter(p => !gameState.isBot[p] && gameState.field[p] && gameState.field[p].length > 0);
                        if (active.length > 0) {
                            setPlayerRole(active[0]);
                            setCommandingIdx(0);
                            setActionMenuMode('moves');
                        } else {
                            setCommandingIdx(-1);
                        }
                    } else {
                        if (!gameState.isBot[playerRole] && gameState.field[playerRole] && gameState.field[playerRole].length > 0) {
                            setCommandingIdx(0);
                            setActionMenuMode('moves');
                        } else {
                            setCommandingIdx(-1);
                        }
                    }
                    updateState({ status: 'battling', events: [], turnExpiresAt: Date.now() + 92000 });
                }
            } else {
                // I client ospiti si limitano a ripristinare la UI
                if (gameState.field[playerRole] && gameState.field[playerRole].length > 0) {
                    setCommandingIdx(0);
                    setActionMenuMode('moves');
                } else {
                    setCommandingIdx(-1);
                }
            }
        }
    
};
