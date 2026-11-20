import React from 'react';
import {onMultimonImageError} from '../../systems/imageFallback.js';

// Stessa disposizione delle battaglie classiche: avversari in alto,
// squadra del giocatore in basso, PS e informazioni accanto agli sprite.
const hpPercent=(hp,max)=>Math.max(0,Math.min(100,100*(Number(hp)||0)/Math.max(1,Number(max)||1)));

function ActiveFighter({unit,side}){
 const char=unit.char||{};
 const hp=Math.max(0,Number(unit.hp)||0),maxHp=Math.max(1,Number(unit.maxHp)||1);
 const percent=hpPercent(hp,maxHp);
 return <article className={'ac-field-fighter ac-field-fighter--'+side+(hp<=0?' ac-field-fainted':'')}>
  <div className="ac-field-stat-card">
   <div className="ac-field-stat-title"><strong>{char.name||'Multimon'}</strong><span>Lv. {unit.level||1}</span></div>
   <div className="ac-field-types">{(char.types||[]).map(type=><span key={type}>{type}</span>)}
    {unit.status&&<span className="ac-field-status">{unit.status}</span>}
   </div>
   <div className="ac-field-health" role="progressbar" aria-label={'PS di '+(char.name||'Multimon')}
    aria-valuemin={0} aria-valuemax={maxHp} aria-valuenow={hp}>
    <i className={percent<=25?'critical':percent<=50?'low':''} style={{width:percent+'%'}}/>
   </div>
   <small>{hp} / {maxHp} PS</small>
  </div>
  <div className="ac-field-sprite-wrap">
   <div className="ac-field-platform"/>
   {char.img?<img className="ac-field-sprite" src={char.img} alt={char.name}
     onError={onMultimonImageError}/>:<span className="ac-field-placeholder">✦</span>}
  </div>
 </article>;
}

function Reserve({units,label}){
 if(!units.length)return null;
 return <div className="ac-field-reserves"><span>{label}</span>
  {units.map((unit,i)=><div key={unit.char?.id||i} className={'ac-field-reserve'+(unit.hp<=0?' ac-field-reserve-ko':'')}
    title={(unit.char?.name||'Multimon')+' · '+unit.hp+' PS'}>
   {unit.char?.img?<img src={unit.char.img} alt={unit.char.name} onError={onMultimonImageError}/>:<span>✦</span>}
  </div>)}
 </div>;
}

export function AscensionBattleField({enemy=[],allies=[],enemyLabel='Avversario',
 allyLabel='La tua squadra',enemyBench=[],allyBench=[],turn=null,kind='wild'}){
 return <section className={'ac-field-arena ac-field-arena--'+kind} aria-label="Arena di combattimento">
  <div className="ac-field-backdrop" aria-hidden="true"><span className="ac-field-sigil">✦</span></div>
  <div className="ac-field-top">
   <div className="ac-field-team-label ac-field-team-label--foe"><span className="ac-field-team-dot"/> {enemyLabel}</div>
   <div className="ac-field-line ac-field-line--foe">
    {enemy.map((unit,i)=><ActiveFighter key={unit.char?.id||i} unit={unit} side="foe"/>)}
   </div>
   <Reserve units={enemyBench} label="Riserve avversarie"/>
  </div>
  <div className="ac-field-middle"><span>VS</span>{turn!=null&&<small>TURNO {turn}</small>}</div>
  <div className="ac-field-bottom">
   <div className="ac-field-line ac-field-line--ally">
    {allies.map((unit,i)=><ActiveFighter key={unit.char?.id||i} unit={unit} side="ally"/>)}
   </div>
   <div className="ac-field-team-label ac-field-team-label--ally"><span className="ac-field-team-dot"/> {allyLabel}</div>
   <Reserve units={allyBench} label="Riserve"/>
  </div>
 </section>;
}
