// Eventi e reliquie condivisi tra Roguelike in solitaria e Co-op.
// Tutte le funzioni sono pure: il chiamante salva il risultato in localStorage o Firestore.
export const ROGUE_RELICS = {
  prism: {
    name: 'Prisma del Contrario',
    icon: '💠',
    desc: 'Le mosse poco efficaci (efficacia maggiore di 0 e minore di 1) infliggono il 40% di danni in più.'
  },
  shift: {
    name: 'Sigillo del Cambio',
    icon: '🔄',
    desc: 'La prima volta che un Multimon entra tramite sostituzione in ogni battaglia recupera il 15% dei PS massimi.'
  },
  dawn: {
    name: 'Piuma della Seconda Alba',
    icon: '🪶',
    desc: 'Una volta per battaglia un alleato sopravvive a un colpo fatale con il 20% dei PS massimi. Effetto condiviso in Co-op.'
  }
};

export const ROGUE_EVENTS = {
  merchant: {
    icon: '🧙',
    name: 'Mercante Misterioso',
    story: 'Un viaggiatore offre un frammento di un antico tesoro. In cambio chiede monete della spedizione.',
    choices: [
      {id:'relic',name:'Acquista una reliquia',desc:'Spendi 25 monete per una nuova reliquia. Se le possiedi tutte, ricevi 30 monete.'},
      {id:'coins',name:'Vendi le informazioni',desc:'Il mercante ti paga 15 monete per una mappa.'}
    ]
  },
  chest: {
    icon: '🗝️',
    name: 'Forziere Maledetto',
    story: 'Un forziere luccica nell’ombra. Qualcosa al suo interno sembra reagire ai vostri battiti.',
    choices: [
      {id:'relic',name:'Apri il forziere',desc:'Ottieni una reliquia, ma tutti gli alleati vivi perdono il 15% dei PS massimi (senza andare KO).'},
      {id:'coins',name:'Prendi solo le monete',desc:'Lascia intatto il sigillo e recupera 18 monete.'}
    ]
  },
  trainer: {
    icon: '🥋',
    name: 'Allenatore Errante',
    story: 'Un maestro propone due tecniche diverse per affrontare il prossimo incontro.',
    choices: [
      {id:'power',name:'Allenamento offensivo',desc:'Tutte le mosse degli alleati infliggono il 20% di danni in più nella prossima battaglia.'},
      {id:'heal',name:'Allenamento di recupero',desc:'I Multimon ancora vivi recuperano il 25% dei PS massimi.'}
    ]
  },
  bargain: {
    icon: '🌒',
    name: 'Offerta Rischiosa',
    story: 'Un’ombra vi offre ricchezze in cambio di una parte della vostra energia.',
    choices: [
      {id:'risk',name:'Accetta il patto',desc:'Ottieni 40 monete, ma ogni alleato vivo perde il 20% dei PS massimi (senza andare KO).'},
      {id:'safe',name:'Rifiuta il patto',desc:'Trovi 12 monete lungo il sentiero e conservi tutte le energie.'}
    ]
  }
};

export const allRogueRelics = relics => Array.isArray(relics) ? relics.filter(id => ROGUE_RELICS[id]) : [];
export const rogueDamageFactor = (attacker, effectiveness) =>
  (allRogueRelics(attacker?.rogueRelics).includes('prism') && effectiveness > 0 && effectiveness < 1 ? 1.4 : 1) *
  (Number.isFinite(attacker?.roguePowerBonus) ? Math.max(1,Math.min(1.5,attacker.roguePowerBonus)) : 1);

export function maybeRogueEvent(floor, maxFloor = 50, relics = [], random = Math.random) {
  if (!Number.isInteger(floor) || floor < 2 || floor >= maxFloor || floor % 5 === 0 || random() >= 0.42) return null;
  const keys = Object.keys(ROGUE_EVENTS);
  const type = keys[Math.floor(random() * keys.length)];
  const available = Object.keys(ROGUE_RELICS).filter(id => !allRogueRelics(relics).includes(id));
  const relicId = available.length ? available[Math.floor(random() * available.length)] : null;
  return {type, floor, relicId};
}

export function getRogueEvent(event) {
  return event && ROGUE_EVENTS[event.type] ? ROGUE_EVENTS[event.type] : null;
}

export function canChooseRogueEvent(event, choiceId, coins, relics = []) {
  const definition = getRogueEvent(event);
  if (!definition?.choices.some(c => c.id === choiceId)) return false;
  if (event.type === 'merchant' && choiceId === 'relic') {
    const available = Object.keys(ROGUE_RELICS).some(id => !allRogueRelics(relics).includes(id));
    return !available || (coins || 0) >= 25;
  }
  return true;
}

function adjustSoloHp(rosterStats, roster, rosterDb, fraction, damage) {
  const copy = {...(rosterStats || {})};
  for (const id of roster || []) {
    const maxHp = rosterDb.find(c => c.id === id)?.maxHp || 0;
    if (!maxHp || !(copy[id] > 0)) continue;
    const amount = Math.max(1,Math.floor(maxHp*fraction));
    copy[id] = damage ? Math.max(1,copy[id] - amount) : Math.min(maxHp,copy[id]+amount);
  }
  return copy;
}

function adjustCoopHp(teams, players, fraction, damage) {
  const copy = structuredClone(teams || {});
  for (const p of players) {
    for (const char of copy[p] || []) {
      if (char.isSummonOnly || !(char.hp > 0)) continue;
      const amount = Math.max(1,Math.floor(char.maxHp*fraction));
      char.hp = damage ? Math.max(1,char.hp-amount) : Math.min(char.maxHp,char.hp+amount);
    }
  }
  return copy;
}

function resolveEffect(event, choiceId, coins, relics, nextBattlePower) {
  if (!canChooseRogueEvent(event, choiceId, coins, relics))
    throw new Error('Questa scelta non è disponibile.');
  const current = allRogueRelics(relics);
  const rewardRelic = event.relicId && ROGUE_RELICS[event.relicId] && !current.includes(event.relicId)
    ? event.relicId : Object.keys(ROGUE_RELICS).find(id => !current.includes(id));
  let nextCoins = coins || 0, power = nextBattlePower || 1;
  let heal = 0,damage = 0, result = '';
  if (event.type === 'merchant') {
    if (choiceId === 'relic') {
      if (rewardRelic) {
        nextCoins -= 25;
        current.push(rewardRelic);
        result = 'Acquistata la reliquia: ' + ROGUE_RELICS[rewardRelic].name + '!';
      } else { nextCoins += 30; result = 'Reliquie già complete: il mercante vi dona 30 monete.'; }
    } else { nextCoins += 15; result = 'Ricevute 15 monete dal mercante.'; }
  } else if (event.type === 'chest') {
    if (choiceId === 'relic') {
      damage = .15;
      if (rewardRelic) {
        current.push(rewardRelic);
        result = 'Trovata la reliquia ' + ROGUE_RELICS[rewardRelic].name + ', ma il forziere vi ha indeboliti!';
      } else { nextCoins += 30; result = 'Il forziere contiene 30 monete, ma la maledizione colpisce comunque.'; }
    } else { nextCoins += 18; result = 'Ottenute 18 monete senza infrangere il sigillo.'; }
  } else if (event.type === 'trainer') {
    if (choiceId === 'power') { power = 1.2; result = 'Allenamento completato: +20% danni nella prossima battaglia.'; }
    else { heal = .25; result = 'Il maestro ha curato tutti i combattenti ancora vivi del 25%.'; }
  } else if (event.type === 'bargain') {
    if (choiceId === 'risk') { nextCoins += 40; damage = .20; result = 'Il patto dà 40 monete, ma consuma parte della vostra energia.'; }
    else { nextCoins += 12; result = 'Il patto è rifiutato: 12 monete recuperate.'; }
  }
  return {coins:nextCoins,relics:current,nextBattlePower:power,heal,damage,result};
}

export function applySoloRogueChoice(run, choiceId, rosterDb) {
  if (!run?.pendingEvent || run.pendingEvent.floor !== run.floor)
    throw new Error('Non c’è nessun incontro da risolvere.');
  const out = resolveEffect(run.pendingEvent,choiceId,run.coins,run.relics,run.nextBattlePower);
  const rosterStats = out.heal ? adjustSoloHp(run.rosterStats,run.roster,rosterDb,out.heal,false)
    : out.damage ? adjustSoloHp(run.rosterStats,run.roster,rosterDb,out.damage,true)
    : run.rosterStats;
  return {...run,coins:out.coins,relics:out.relics,nextBattlePower:out.nextBattlePower,
    rosterStats,pendingEvent:null,lastEventResult:out.result};
}

export function applyCoopRogueChoice(room, choiceId) {
  const event=room.coopRun?.pendingEvent;
  if (!event || room.status !== 'coop_event' || event.floor !== room.coopRun.floor)
    throw new Error('L’evento non è più disponibile.');
  const out=resolveEffect(event,choiceId,room.coopRun.coins,room.coopRun.relics,room.coopRun.nextBattlePower);
  const humans=['p1','p2','p3'].filter(p => room.players?.[p] && !room.isBot?.[p]);
  const teams=out.heal ? adjustCoopHp(room.teams,humans,out.heal,false)
    : out.damage ? adjustCoopHp(room.teams,humans,out.damage,true)
    : room.teams;
  return {status:'coop_camp',phaseStartedAt:Date.now(),teams,
    coopRun:{...room.coopRun,coins:out.coins,relics:out.relics,
      nextBattlePower:out.nextBattlePower,pendingEvent:null,eventVotes:{},
      lastEventResult:out.result}};
}
