// Regole esclusive della Juggernaut PvP. Non applicare a Sopravvivenza o ai raid.
export const JUGGERNAUT_SCALING = Object.freeze({
  2: { hp: 3, atk: 1.6, def: 1.6 },
  3: { hp: 4.2, atk: 1.85, def: 1.85 },
  4: { hp: 5.4, atk: 2.1, def: 2.1 }
});
export const JUGGERNAUT_PHASE_NAMES = Object.freeze([
  'Dominio', 'Guardia Tirannica', 'Risveglio', 'Ultima Resistenza'
]);
export const JUGGERNAUT_SHIELD_HITS = 4;
export const JUGGERNAUT_ROAR_TURNS = 2;
export const JUGGERNAUT_ROAR_FACTOR = 0.80;
export const JUGGERNAUT_COUNTER_HITS = 2;

const move = (name, juggSpecial, desc, extra = {}) => ({
  name, juggSpecial, type: 'Oscuro', power: 0, target: 'self',
  accuracy: 1, currentCooldown: 0, ...extra, desc
});

export function setupJuggernaut(boss, opponents) {
  if (!boss || boss.isJuggernaut) return boss;
  const scale = JUGGERNAUT_SCALING[Math.max(2, Math.min(4, Number(opponents) || 2))];
  boss.maxHp = Math.max(1, Math.floor(boss.maxHp * scale.hp));
  boss.hp = boss.maxHp;
  boss.atk = Math.floor(boss.atk * scale.atk);
  boss.def = Math.floor(boss.def * scale.def);
  if (Number.isFinite(boss.spAtk)) boss.spAtk = Math.floor(boss.spAtk * scale.atk);
  if (Number.isFinite(boss.spDef)) boss.spDef = Math.floor(boss.spDef * scale.def);
  boss.baseAtk = boss.atk;
  boss.baseDef = boss.def;
  boss.baseSpAtk = boss.spAtk ?? boss.atk;
  boss.baseSpDef = boss.spDef ?? boss.def;
  boss.isJuggernaut = true;
  boss.juggPhase = 1;
  boss.juggShieldHpThresholds = [0.75, 0.50, 0.25];
  boss.juggPendingShields = [];
  boss.juggHitsRemaining = 0;
  boss.shieldGrantedHits = JUGGERNAUT_SHIELD_HITS;
  boss.juggTurnCount = 0;
  boss.juggMidpointUsed = false;
  boss.juggCounterReady = false;
  boss.juggCounterHitsRemaining = 0;
  boss.juggCounterUsed = false;
  boss.juggRoarTurnsRemaining = 0;
  boss.juggNextAttackBoost = false;
  boss.imageFilter = 'drop-shadow(0 0 30px rgba(220,38,38,1)) contrast(1.3) saturate(1.2)';
  boss.moves ??= [];
  const extra = [
    {name:'Furia del Boss',type:'Oscuro',power:40,targetCount:8,cooldown:3,currentCooldown:0,
      desc:'Colpisce tutti gli sfidanti. Ricarica: 3 turni.',juggSpecial:'fury'},
    move('Ruggito Tirannico','roar','Gli sfidanti infliggono il 20% di danni in meno per 2 turni (compreso quello di attivazione). Ricarica: 4 turni.',{cooldown:4,priority:7}),
    move('Contrattacco Supremo','counter','Riduce del 30% i primi 2 colpi diretti ricevuti nel turno e contrattacca una sola volta con potenza 60. Ricarica: 4 turni.',{cooldown:4,priority:7,juggRequiredPhase:2})
  ];
  for (const skill of extra) if (!boss.moves.some(m => m.juggSpecial === skill.juggSpecial)) boss.moves.push(skill);
  return boss;
}

export function applyJuggernautSummonBonus(summon, opponents) {
  const count = Math.max(1, Math.min(4, Number(opponents) || 1));
  const hpFactor = Math.min(1.8, 1 + 0.2 * count);
  const statFactor = Math.min(1.24, 1 + 0.06 * count);
  summon.maxHp = Math.max(1, Math.floor(summon.maxHp * hpFactor));
  summon.hp = summon.maxHp;
  for (const stat of ['atk', 'def', 'spAtk', 'spDef']) {
    if (Number.isFinite(summon[stat])) summon[stat] = Math.floor(summon[stat] * statFactor);
  }
  summon.baseAtk = summon.atk;
  summon.baseDef = summon.def;
  if (Number.isFinite(summon.spAtk)) summon.baseSpAtk = summon.spAtk;
  if (Number.isFinite(summon.spDef)) summon.baseSpDef = summon.spDef;
  summon.imageFilter = 'drop-shadow(0 0 15px rgba(220,38,38,0.8))';
  return summon;
}

// Mantiene TUTTE le soglie attraversate, anche se il colpo salta dal 90% al 20%.
export function updateJuggernautThresholds(boss, hpAfter) {
  if (!boss?.isJuggernaut || !Number.isFinite(boss.maxHp) || hpAfter <= 0) return [];
  boss.juggShieldHpThresholds ??= [];
  boss.juggPendingShields ??= [];
  const newStages = [];
  while (boss.juggShieldHpThresholds.length &&
    hpAfter / boss.maxHp <= boss.juggShieldHpThresholds[0]) {
    const threshold = boss.juggShieldHpThresholds.shift();
    boss.juggPendingShields.push(Math.round(threshold * 100));
    const stage = threshold === .75 ? 2 : threshold === .5 ? 3 : 4;
    if ((boss.juggPhase || 1) < stage) {
      boss.juggPhase = stage;
      newStages.push(stage);
      if (stage === 4) {
        boss.atk = Math.floor(boss.atk * 1.15);
        if (Number.isFinite(boss.spAtk)) boss.spAtk = Math.floor(boss.spAtk * 1.15);
        boss.def = Math.max(1, Math.floor(boss.def * 0.90));
        if (Number.isFinite(boss.spDef)) boss.spDef = Math.max(1, Math.floor(boss.spDef * 0.90));
      }
    }
  }
  return newStages;
}

export function activateNextJuggernautShield(boss) {
  if (!boss?.isJuggernaut || boss.hp <= 0 || (boss.juggHitsRemaining || 0) > 0 ||
    !boss.juggPendingShields?.length) return null;
  const threshold = boss.juggPendingShields.shift();
  boss.juggHitsRemaining = boss.shieldGrantedHits || JUGGERNAUT_SHIELD_HITS;
  return { threshold, hits: boss.juggHitsRemaining };
}
export function canUseJuggernautSkill(boss, selectedMove) {
  if (!selectedMove?.juggSpecial) return true;
  // Le vecchie mosse "Ripristino/Impulso" possono restare nei salvataggi:
  // sono diventate scelte GRATUITE, non più azioni di combattimento.
  if (selectedMove.juggOnceMidpoint || ['purge','empower'].includes(selectedMove.juggSpecial)) return false;
  return !!boss?.isJuggernaut &&
    (boss.juggPhase || 1) >= (selectedMove.juggRequiredPhase || 1) &&
    (!selectedMove.juggOnceMidpoint || !boss.juggMidpointUsed) &&
    !(selectedMove.currentCooldown > 0);
}

export function createJuggernautSynergy() {
  return {charge:0, coordinatedTurns:0, activations:0, cooldownUntilTurn:0, shieldPierce:0};
}
export function canActivateJuggernautSynergy(synergy, turn) {
  return Number(synergy?.charge || 0) >= 2 && turn >= Number(synergy?.cooldownUntilTurn || 0);
}
export function chargeJuggernautSynergy(synergy, distinctHitters) {
  if (new Set(distinctHitters).size < 2) return false;
  synergy.coordinatedTurns = (synergy.coordinatedTurns || 0) + 1;
  synergy.charge = Math.min(2, (synergy.charge || 0) + 1);
  return true;
}
export function spendJuggernautSynergy(synergy, effect, turn) {
  if (!['damage','shield'].includes(effect) || !canActivateJuggernautSynergy(synergy, turn)) return false;
  synergy.charge = 0;
  synergy.activations = (synergy.activations || 0) + 1;
  synergy.cooldownUntilTurn = turn + 3;
  if (effect === 'shield') synergy.shieldPierce = 1;
  return true;
}

/** Le scelte gratuite vengono registrate sullo stato stanza, non fra le azioni. */
export function canQueueJuggernautFreeChoice(room, role, kind, value) {
  if (room?.gameMode !== 'juggernaut' || room.status !== 'battling' ||
    !room.players?.[role] || room.isBot?.[role] || room.juggFreeChoices?.[kind]) return false;
  const bossRole = room.settings?.juggernautPlayer || 'p1';
  const boss = room.teams?.[bossRole]?.[0];
  if (!boss?.isJuggernaut || boss.hp <= 0) return false;
  if (!(room.field?.[role] || []).some(idx => room.teams?.[role]?.[idx]?.hp > 0)) return false;
  if (kind === 'boss') return role === bossRole && (boss.juggPhase || 1) >= 3 &&
    !boss.juggMidpointUsed && ['purge', 'empower'].includes(value);
  if (kind === 'synergy') return role !== bossRole &&
    canActivateJuggernautSynergy(room.juggSynergy, (room.battleReport?.turns || 0) + 1) &&
    ['damage','shield'].includes(value);
  return false;
}

export function applyJuggernautMidpointChoice(boss, kind) {
  if (!boss?.isJuggernaut || boss.hp <= 0 || (boss.juggPhase || 1) < 3 ||
    boss.juggMidpointUsed || !['purge','empower'].includes(kind)) return false;
  if (kind === 'purge') {
    for (const [stat,base] of [['atk','baseAtk'],['def','baseDef'],['spd','baseSpd'],
      ['spAtk','baseSpAtk'],['spDef','baseSpDef']]) {
      if (Number.isFinite(boss[base]) && Number.isFinite(boss[stat]) &&
          boss[stat] < boss[base]) boss[stat] = boss[base];
    }
  } else {
    boss.juggNextAttackBoost = true;
  }
  boss.juggMidpointUsed = true;
  return true;
}

export function juggernautRoarDamageFactor(boss, isChallenger) {
  return isChallenger && Number(boss?.juggRoarTurnsRemaining || 0) > 0
    ? JUGGERNAUT_ROAR_FACTOR : 1;
}

export function endJuggernautRoarTurn(boss) {
  if (!boss?.isJuggernaut) return 0;
  boss.juggRoarTurnsRemaining = Math.max(0, Number(boss.juggRoarTurnsRemaining || 0) - 1);
  return boss.juggRoarTurnsRemaining;
}

/** Le mosse multicolpo vengono aggregate dal motore: la riduzione si applica
 *  proporzionalmente al numero di hit ancora coperti (massimo 2 in tutto).
 *  Un'unica risposta viene emessa anche se il colpo è multiplo.
 */
export function mitigateJuggernautCounter(boss, damage, landedHits = 1) {
  const initial = Math.max(0, Math.floor(Number(damage) || 0));
  const hits = Math.max(1, Math.floor(Number(landedHits) || 1));
  const charges = Math.max(0, Math.floor(Number(boss?.juggCounterHitsRemaining) || 0));
  if (!boss?.isJuggernaut || !boss.juggCounterReady || charges <= 0 || initial <= 0) {
    return {damage:initial, coveredHits:0, counter:false};
  }
  const coveredHits = Math.min(charges,hits);
  boss.juggCounterHitsRemaining = charges - coveredHits;
  const counter = !boss.juggCounterUsed;
  boss.juggCounterUsed = true;
  return {
    damage:Math.max(1,Math.floor(initial*(1-0.30*coveredHits/hits))),
    coveredHits,counter
  };
}
