import { TYPE_CHART, getMultiplier } from './typeSystem.js';
import { getCharacterRoles } from './teamBuilderFilters.js';

// Analisi puramente consultiva: non modifica draft, statistiche o selezioni.
const ATTACK_TYPES = Object.keys(TYPE_CHART);

export function damagingMoveTypes(character) {
  return [...new Set((character?.moves || [])
    .filter(move => move && Number(move.power) > 0 && ATTACK_TYPES.includes(move.type))
    .map(move => move.type))];
}

// Una cura personale non viene presentata come cura utilizzabile sugli alleati.
export function canHealAllies(character) {
  const passive = character?.passive || {};
  if (passive.healLowestAllyPercent || passive.healTeamPercent) return true;
  return (character?.moves || []).some(move => {
    if (!move) return false;
    if (move.healLowestAllyPercent || move.teamHeal || move.reviveAlly || move.targetMode === 'revive' || move.targetMode === 'team_smart_heal') return true;
    const heals = move.heal || move.healFlat || move.selfHeal;
    return Boolean(heals && ['ally', 'team', 'all_allies'].includes(move.targetMode || move.target));
  });
}

function teamRoles(team) {
  const counts = { attacker: 0, tank: 0, healer: 0, support: 0, control: 0, allyHealer: 0, fast: 0 };
  for (const character of team) {
    for (const role of getCharacterRoles(character)) {
      if (Object.hasOwn(counts, role)) counts[role]++;
    }
    if (canHealAllies(character)) counts.allyHealer++;
    if (Number(character?.spd) >= 105) counts.fast++;
  }
  return counts;
}

function teamThreats(team) {
  return ATTACK_TYPES.map(type => {
    const weak = team.filter(character => getMultiplier(type, character.types) > 1);
    const resistant = team.filter(character => getMultiplier(type, character.types) < 1);
    return {
      type, weak: weak.length, resistant: resistant.length,
      vulnerableNames: weak.map(character => character.name)
    };
  }).filter(threat =>
    team.length >= 2 &&
    threat.weak >= 2 &&
    threat.weak >= Math.ceil(team.length / 2) &&
    threat.weak > threat.resistant
  ).sort((a, b) => (b.weak - b.resistant) - (a.weak - a.resistant) || b.weak - a.weak || a.type.localeCompare(b.type, 'it'));
}

function missingOffensiveCoverage(team) {
  const moves = new Set(team.flatMap(damagingMoveTypes));
  if (!moves.size) return ATTACK_TYPES;
  return ATTACK_TYPES.filter(defendingType =>
    ![...moves].some(attackingType => getMultiplier(attackingType, [defendingType]) > 1)
  );
}

function scoreCandidate(character, report) {
  const reasons = [];
  let score = 0;
  const candidateRoles = getCharacterRoles(character);
  for (const threat of report.threats.slice(0, 3)) {
    const multiplier = getMultiplier(threat.type, character.types);
    if (multiplier < 1) {
      score += 6;
      reasons.push(multiplier === 0 ? `immune a ${threat.type}` : `resiste a ${threat.type}`);
    } else if (multiplier === 1) {
      score += 1.5;
    } else {
      score -= 3;
    }
  }
  if (report.needs.allyHealer && canHealAllies(character)) {
    score += 7;
    reasons.push('può curare gli alleati');
  }
  if (report.needs.tank && candidateRoles.includes('tank')) {
    score += 4;
    reasons.push('rafforza la difesa');
  }
  if (report.needs.attacker && candidateRoles.includes('attacker')) {
    score += 4;
    reasons.push('aggiunge potenza offensiva');
  }
  if (report.needs.fast && Number(character.spd) >= 105) {
    score += 3;
    reasons.push('aggiunge velocità');
  }
  const effectiveAgainst = report.coverageGaps.filter(type =>
    damagingMoveTypes(character).some(moveType => getMultiplier(moveType, [type]) > 1)
  );
  if (effectiveAgainst.length) {
    score += Math.min(4, effectiveAgainst.length * 1.5);
    reasons.push(`copre ${effectiveAgainst.slice(0, 2).join(' e ')}`);
  }
  return { character, score, reasons: reasons.slice(0, 2) };
}

export function analyzeTeam(team = [], availableChars = [], teamSize = 6) {
  const picked = (Array.isArray(team) ? team : []).filter(character => character?.id);
  const size = Math.max(1, Number(teamSize) || 6);
  const roles = teamRoles(picked);
  const threats = teamThreats(picked);
  const coverageGaps = missingOffensiveCoverage(picked);
  const hasAttacks = picked.some(character => damagingMoveTypes(character).length > 0);
  const needs = {
    allyHealer: size >= 3 && picked.length >= 2 && roles.allyHealer === 0,
    tank: size >= 3 && picked.length >= 2 && roles.tank === 0,
    attacker: size >= 3 && picked.length >= 2 && roles.attacker === 0,
    fast: size >= 3 && picked.length >= 2 && roles.fast === 0
  };
  const warnings = [];
  for (const threat of threats.slice(0, 3)) {
    warnings.push({
      id: `weak-${threat.type}`, kind: 'weakness',
      text: `${threat.weak} su ${picked.length} sono deboli a ${threat.type}`,
      detail: threat.vulnerableNames.join(', ')
    });
  }
  if (needs.allyHealer) warnings.push({ id: 'heal', kind: 'role', text: 'Manca una cura per gli alleati', detail: 'Le mosse che curano solo chi le usa non contano.' });
  if (needs.tank) warnings.push({ id: 'tank', kind: 'role', text: 'Manca un difensore resistente', detail: 'Un tank può assorbire colpi per il gruppo.' });
  if (needs.attacker) warnings.push({ id: 'attacker', kind: 'role', text: 'Manca un attaccante potente', detail: 'Valuta almeno un Multimon con buona potenza.' });
  if (needs.fast) warnings.push({ id: 'speed', kind: 'role', text: 'Nessun Multimon molto veloce', detail: 'Una scelta rapida può aiutare a prendere l’iniziativa.' });
  if (picked.length >= 2 && !hasAttacks) warnings.push({ id: 'damage', kind: 'coverage', text: 'Nessuna mossa offensiva individuata', detail: 'Controlla le mosse selezionate.' });
  else if (picked.length >= 2 && coverageGaps.length >= 4) {
    warnings.push({
      id: 'coverage', kind: 'coverage',
      text: `Copertura offensiva da migliorare (${coverageGaps.length} tipi)`,
      detail: `Nessuna mossa super efficace rilevata contro: ${coverageGaps.slice(0, 5).join(', ')}${coverageGaps.length > 5 ? '…' : ''}`
    });
  }
  const strengths = [];
  if (roles.tank) strengths.push(`${roles.tank} difensore${roles.tank > 1 ? 'i' : ''}`);
  if (roles.allyHealer) strengths.push(`${roles.allyHealer} cura${roles.allyHealer > 1 ? 'tori' : 'tore'} degli alleati`);
  if (roles.attacker) strengths.push(`${roles.attacker} attaccante${roles.attacker > 1 ? 'i' : ''}`);
  if (roles.fast) strengths.push(`${roles.fast} veloce${roles.fast > 1 ? 'i' : ''}`);
  const pickedIds = new Set(picked.map(character => character.id));
  const seen = new Set();
  const candidates = (Array.isArray(availableChars) ? availableChars : [])
    .filter(character => {
      if (!character?.id || pickedIds.has(character.id) || seen.has(character.id)) return false;
      seen.add(character.id);
      return !character.isSummonOnly;
    });
  const report = { roles, threats, coverageGaps, needs, warnings, strengths };
  const suggestions = picked.length === 0 ? [] : candidates
    .map(character => scoreCandidate(character, report))
    .filter(item => item.score > 0 && item.reasons.length > 0)
    .sort((a, b) => b.score - a.score || a.character.name.localeCompare(b.character.name, 'it'))
    .slice(0, 3);
  return { ...report, suggestions, picked: picked.length, teamSize: size };
}
