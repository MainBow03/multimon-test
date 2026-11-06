import {hakiStatDebuffMultiplier} from './strawHatEffects.js';

// Osservatore sincrono del solo calcolo autorevole del turno.
// Il callback viene disinstallato dopo il calcolo, mai salvato su Firestore.
let statGainObserver=null;
export function setBattleStatGainObserver(observer){
  const previous=statGainObserver;
  statGainObserver=typeof observer==='function'?observer:null;
  return ()=>{statGainObserver=previous};
}

// I potenziamenti e i malus si applicano come percentuali della statistica
// di base, non del valore già potenziato. Questo evita l'effetto valanga:
// 100 -> 130 -> 160 con due bonus da +30%, invece di 100 -> 130 -> 169.
// Le forme Iper e i boss modificano separatamente le statistiche di base.
export const MAX_BATTLE_STAT_MULTIPLIER = 2; // +100% al massimo
export const MIN_BATTLE_STAT_MULTIPLIER = 0.5; // -50% al minimo

const BASE_KEYS = Object.freeze({
  atk: 'baseAtk', def: 'baseDef', spd: 'baseSpd',
  spAtk: 'baseSpAtk', spDef: 'baseSpDef'
});

export function applyBattleStatModifier(character, stat, multiplier) {
  if (!character || !BASE_KEYS[stat] || !Number.isFinite(multiplier) || multiplier <= 0) return false;
  const current = character[stat];
  if (!Number.isFinite(current)) return false;
  const original = character[BASE_KEYS[stat]];
  const base = Number.isFinite(original) && original > 0 ? original : Math.max(1,current);
  const effectiveMultiplier=hakiStatDebuffMultiplier(character,multiplier);
  const change = base * (effectiveMultiplier - 1);
  if (Math.abs(change) < 1e-9) return false;
  const upper = Math.max(1, Math.round(base * MAX_BATTLE_STAT_MULTIPLIER));
  const lower = Math.max(1, Math.round(base * MIN_BATTLE_STAT_MULTIPLIER));
  const next = Math.max(lower, Math.min(upper, Math.floor(current + change + 1e-9)));
  character[stat] = next;
  if(next>current && statGainObserver)
    statGainObserver(character,stat,current,next,base);
  return next !== current;
}
