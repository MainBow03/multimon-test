import React from 'react';
import { isNegativeStatus, statusName } from '../systems/newHeldAndPassiveEffects.js';

const SHIELDS = new Set(['Protetto','Riflesso','Scudo Team','Rashield','In_Groppa','Ombra Rapida','Scudo Cristallino']);
const STAT_NAMES = Object.freeze([
  ['atk','baseAtk','ATK'],['def','baseDef','DEF'],['spd','baseSpd','VEL'],
  ['spAtk','baseSpAtk','ATK SP'],['spDef','baseSpDef','DEF SP']
]);
export function battleStatChanges(character) {
  return STAT_NAMES.flatMap(([key,baseKey,label])=>{
    const current=character?.[key],base=character?.[baseKey];
    if(!Number.isFinite(current)||!Number.isFinite(base)||base<=0)return [];
    const percent=Math.round((current/base-1)*100);
    if(Math.abs(percent)<2)return [];
    return [{key,label,percent,current,base}];
  });
}
export function categorizeBattleStatus(status) {
  if(isNegativeStatus(status))return 'negative';
  if(SHIELDS.has(statusName(status)))return 'protection';
  return 'positive';
}
export function battleFeedbackKind(message, passive=false) {
  const value=String(message||'');
  if(/(?:\bK\.?O\.?\b|è esausto|sconfitt[oa]|fuori combattimento)/i.test(value))return 'ko';
  if(/colpo critico|brutto colpo/i.test(value))return 'critical';
  if(passive)return 'passive';
  if(/(?:recupera|guarisc|curat[oa]|ripristina)\b/i.test(value))return 'heal';
  if(/(?:stat[ou]s|avvelenat|scottat|congelat|stordit|infatuat|paralizzat)/i.test(value))return 'status';
  if(/(?:riduc|diminuisc|abbass|indebolit|debuff)/i.test(value))return 'debuff';
  if(/(?:aumenta|potenzia|raddoppia|rafforza|buff)/i.test(value))return 'buff';
  return 'normal';
}
export const BATTLE_FEEDBACK_LABELS = Object.freeze({
  ko:'💥 K.O.!',critical:'💥 COLPO CRITICO!',passive:'✨ PASSIVA ATTIVATA',
  status:'🌀 STATUS',buff:'⬆ POTENZIAMENTO',debuff:'⬇ INDEBOLIMENTO',
  heal:'💚 CURA',normal:'⚔️ AZIONE'
});
export function BattleStatusBadges({character}) {
  if(!character)return null;
  const statuses=character.statuses||[];
  const changes=battleStatChanges(character);
  return <div className="battle-effects-panel" aria-label={'Effetti attivi di '+character.name}>
    {character.passive?.name&&<span className="battle-passive-pill" title={character.passive.desc||character.passive.name}>
      ✨ {character.passive.name}
    </span>}
    {changes.length>0&&<div className="battle-stat-effects">
      {changes.map(x=><span key={x.key} className={x.percent>0?'battle-effect-buff':'battle-effect-debuff'}
        title={x.label+': '+x.current+' (base '+x.base+')'} aria-label={x.label+' '+(x.percent>0?'+':'')+x.percent+' percento'}>
        {x.percent>0?'▲':'▼'} {x.label} {x.percent>0?'+':''}{x.percent}%
      </span>)}
    </div>}
    {statuses.length>0&&<div className="battle-status-effects">
      {statuses.map((status,i)=>{
        const name=statusName(status);
        if(!name)return null;
        const type=categorizeBattleStatus(status);
        const turns=typeof status==='object'&&Number.isFinite(Number(status.turns))&&status.turns!=null?Number(status.turns):null;
        return <span key={name+'-'+i} className={'battle-status-label battle-status-'+type}
          title={name+(turns!=null?' · '+turns+' turni residui':' · durata variabile')}
          aria-label={name+(turns!=null?', '+turns+' turni residui':'')}>
          {type==='negative'?'●':type==='protection'?'⬡':'✦'} {name}{turns!=null?' · '+turns+'t':''}
        </span>;
      })}
    </div>}
  </div>;
}
