// Le due sorprese finali appartengono esclusivamente al raid della terza campagna.
// Una volta sconfitto il boss da 4000 PS, appare la sua forma giocabile.
// La forma giocabile ritorna SUBITO con fino a due copie dei nostri alleati KO.
export const ECHO_FINAL_PHASES = Object.freeze({
  RAID:'raid', NORMAL:'normal', SOULS:'souls'
});

const CORRUPTION_FILTER='sepia(.6) hue-rotate(245deg) saturate(2.5) drop-shadow(0 0 25px #b56eff)';
const say=(events,speaker,line)=>events.push({type:'text',text:'🎭 '+speaker+': «'+line+'»'});
const fullMoves=moves=>(moves||[]).filter(Boolean).map(m=>({
  ...structuredClone(m),remainingUses:m.maxUses===undefined?null:m.maxUses
}));

function enterEnemy(teams,field,events,fighter,text){
  const idx=teams.p2.push(fighter)-1;
  field.p2.push(idx);
  events.push({type:'summon',player:'p2',fieldIdx:idx,
    newChar:structuredClone(fighter),putOnField:true,text});
  return idx;
}

function releaseEchoCopies(teams,field,events){
  // Gli echi temporanei perdono energia quando Echomax scompare.
  for(let position=field.p2.length-1;position>=0;position--){
    const idx=field.p2[position],fighter=teams.p2[idx];
    if(fighter?.isEchoCopy){
      fighter.hp=0;fighter.echoFaintProcessed=true;
      field.p2.splice(position,1);
      events.push({type:'remove',player:'p2',pos:position});
    }
  }
}


// Quando si manifesta la forma giocabile, Echomax porta con sé fino a due
// copie corrotte dei protagonisti già esausti. Non aspettare il suo secondo KO.
function summonFallenHeroesAtNormalReveal(teams,field,events,normal){
  if(!normal||normal.echoNormalSoulsSummoned)return 0;
  normal.echoNormalSoulsSummoned=true; // Conservato anche nei checkpoint.
  say(events,'Echomax','LE ANIME DEI VOSTRI CADUTI MI APPARTENGONO!');
    const defeated=teams.p1.map((hero,index)=>({hero,index}))
      .filter(({hero})=>hero&&hero.hp<=0&&!hero.isSummonOnly&&!hero.echoCorruptedLocked);
    // Fisher–Yates: ogni eroe esausto ha pari probabilità di essere scelto.
    for(let i=defeated.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [defeated[i],defeated[j]]=[defeated[j],defeated[i]];
    }
    const chosen=defeated.slice(0,2);
    for(const {hero,index} of chosen){
      hero.echoCorruptedLocked=true;
      hero.echoSoulPermanentDefeat=true;
      const fullHp=Math.max(1,Number(hero.maxHp)||1);
      const soul={
        ...structuredClone(hero),name:'Anima corrotta di '+hero.name,
        hp:fullHp,maxHp:fullHp,atk:hero.baseAtk||hero.atk,
        def:hero.baseDef||hero.def,spd:hero.baseSpd||hero.spd,
        statuses:[],consecutiveProtect:0,echoFaintProcessed:false,
        moves:fullMoves(hero.moves),imageFilter:CORRUPTION_FILTER,
        isEchoCorruptedSoul:true,echoCorruptionSourceId:hero.id,
        echoCorruptionSourceIndex:index,echoCorruptedLocked:false,
        isEchoRaidBoss:false,isJuggernaut:false,isSummonOnly:false,
        isEchoCopy:false,echoSoulPermanentDefeat:true
      };
      say(events,'Echomax',hero.name+'! Alzati. La tua forza combatterà contro chi ti chiamava amico!');
      // Il raid permette al massimo sei combattenti attivi per schieramento.
      // Se i guardiani Goku/Naruto/Luffy occupano gli slot, vanno in riserva.
      if(field.p2.length>=6){
        let pos=-1;
        for(let i=field.p2.length-1;i>=0;i--){
          const fighter=teams.p2[field.p2[i]];
          if(fighter && fighter.id!=='echomax' && !fighter.isEchoCorruptedSoul){pos=i;break;}
        }
        if(pos>=0){
          const idx=field.p2.splice(pos,1)[0];
          events.push({type:'remove',player:'p2',pos});
          events.push({type:'text',text:'🌑 '+teams.p2[idx].name+' arretra per lasciare spazio a un’anima corrotta!'});
        }
      }
      enterEnemy(teams,field,events,soul,'🌘 '+hero.name+' viene trascinato nel team nemico al 100% dei PS!');
    }
    if(!chosen.length){
      say(events,'Echomax','Nessun caduto da reclamare?! Tutti ancora in piedi... impossibile!');
      say(events,'Topolino','È finita, Echomax. Neanche un’anima ti obbedirà più.');
    }else{
      say(events,'Corvina','I loro corpi sono esausti e le loro anime sono prigioniere. Dobbiamo sconfiggere queste copie per liberarli!');
      say(events,'Echomax','Provateci. Anche sconfitto, sarò io a decidere come termina questa storia!');
    }

  return chosen.length;
}

// È lo stesso Scudo Team della mossa "Riflesso" (Magico): riduce
// i danni subiti del 45% per cinque turni, senza contrattacco.
// Si applica a Echomax e a tutti gli alleati ancora vivi sul suo lato.
function grantNormalEchoTeamShield(teams,events,normal){
  for(let idx=0;idx<teams.p2.length;idx++){
    const ally=teams.p2[idx];
    if(!ally||ally.hp<=0||ally.isEchoCopy)continue;
    ally.statuses=Array.isArray(ally.statuses)?ally.statuses:[];
    if(ally===normal)
      ally.statuses=ally.statuses.filter(s=>s.type!=='Riflesso');
    const existing=ally.statuses.find(s=>s.type==='Scudo Team');
    if(existing)existing.turns=5;
    else ally.statuses.push({type:'Scudo Team',turns:5});
    events.push({type:'status_update',targetPlayer:'p2',targetIdx:idx,
      statuses:structuredClone(ally.statuses)});
  }
  normal.echoNormalShieldApplied=true;
  events.push({type:'text',text:'🛡️ SCUDO TEAM! Echomax protegge sé stesso e i suoi alleati: danni subiti ridotti per 5 turni!'});
}

export function advanceEchoFinalPhase({isEchoFinalBattle=false,stage='raid',teams,field,characters=[],events=[]}={}){
  if(!isEchoFinalBattle||!teams?.p1||!teams?.p2||!field?.p2)return stage;
  if(stage===ECHO_FINAL_PHASES.RAID){
    const defeatedRaid=teams.p2.find(c=>c?.id==='echomax'&&c.isEchoRaidBoss&&c.hp<=0);
    if(!defeatedRaid)return stage;
    const base=characters.find(c=>c.id==='echomax');
    if(!base)throw new Error('Forma giocabile di Echomax non trovata.');
    releaseEchoCopies(teams,field,events);
    events.push({type:'text',text:'🌑 IL DOMINATORE CADE... MA LA SUA PRESENZA NON SCOMPARE!'});
    say(events,'Marceline','Il nucleo si è spento! È finita... giusto?');
    say(events,'Gaster','N... o... L... a... s... u... a... a... n... i... m... a...');
    say(events,'Echomax','Avete distrutto il mio trono. NON la mia volontà.');
    say(events,'Finn','Allora affrontaci senza quel potere. Faccia a faccia.');
    const normal={
      ...structuredClone(base),hp:base.maxHp,maxHp:base.maxHp,
      // Scudo Team (5 turni), non Riflesso danni. Velocità +100%
      // solo nella seconda fase, senza alterare il personaggio sbloccabile.
      statuses:[],
      spd:base.spd*2,consecutiveProtect:0,echoFinalForm:'normal',
      isEchoRaidBoss:false,isJuggernaut:false,isSummonOnly:false,
      baseAtk:base.atk,baseDef:base.def,baseSpd:base.spd,
      moves:fullMoves(base.moves),echoSoulCharges:0,echoFaintProcessed:false
    };
    enterEnemy(teams,field,events,normal,'⚡ Echomax riappare nella sua forma giocabile, con '+normal.maxHp+' PS!');
    grantNormalEchoTeamShield(teams,events,normal);
    events.push({type:'text',text:'💨 ULTIMO SCATTO! La Velocità di Echomax aumenta del 100% ('+base.spd+' → '+normal.spd+')!'});
    say(events,'Echomax','Non mi servono scudi o corone per piegare il vostro destino. Venite!');
    summonFallenHeroesAtNormalReveal(teams,field,events,normal);
    return ECHO_FINAL_PHASES.NORMAL;
  }
  if(stage===ECHO_FINAL_PHASES.NORMAL){
    // Migra senza ricominciare lo scontro le forme normali apparse con
    // la vecchia versione che dava Riflesso al posto di Scudo Team.
    const livingNormal=teams.p2.find(c=>c?.id==='echomax'&&c.echoFinalForm==='normal'&&c.hp>0);
    if(livingNormal&&!livingNormal.echoNormalShieldApplied)
      grantNormalEchoTeamShield(teams,events,livingNormal);
    // Salvataggi creati prima della correzione: i compagni esausti entrano
    // appena il turno viene calcolato, senza dover sconfiggere Echomax.
    if(livingNormal && !livingNormal.echoNormalSoulsSummoned)
      summonFallenHeroesAtNormalReveal(teams,field,events,livingNormal);
    const defeatedNormal=teams.p2.find(c=>c?.id==='echomax'&&c.echoFinalForm==='normal'&&c.hp<=0);
    if(!defeatedNormal)return stage;
    if(!defeatedNormal.echoNormalSoulsSummoned)
      summonFallenHeroesAtNormalReveal(teams,field,events,defeatedNormal);
    releaseEchoCopies(teams,field,events);
    events.push({type:'text',text:'💠 ULTIMO ATTO — LA VOLONTÀ DI ECHOMAX SI SPEZZA'});
    say(events,'Echomax','No... non può essere. Perfino questa forma... sconfitta?');
    say(events,'Jake il Cane','Hai perso, amico. È ora di lasciare andare tutti.');
    say(events,'Echomax','LASCIARE ANDARE?! Cinquecento anni! Cinquecento anni a preparare un universo perfetto!');
    say(events,'Sage','Un universo perfetto non ha bisogno di rubare la volontà a nessuno.');
    say(events,'Echomax','Voi la chiamate libertà. Io vedo solo un mondo condannato a ripetere i propri errori.');
    say(events,'Neon','Il tuo potere sta svanendo. Non puoi più comandare la Legione.');
    say(events,'Echomax','Allora userò l’ultima scintilla. Non per vincere... per dimostrarvi che nessun legame è al sicuro!');
    say(events,'Marceline','Non toccare i nostri compagni, Echomax!');
    say(events,'Echomax','Neppure senza di me riuscirete a spezzare tutti i miei ultimi legami!');
    return ECHO_FINAL_PHASES.SOULS;
  }
  return stage;
}

export function echoCorruptedSoulReleased(fighter,events=[]){
  if(!fighter?.isEchoCorruptedSoul)return false;
  events.push({type:'text',text:'💠 '+fighter.name+' è stata sconfitta: l’anima torna libera!'});
  say(events,fighter.name.replace(/^Anima corrotta di /,''),'Quella voce... è scomparsa. Finalmente posso tornare da voi.');
  say(events,'Corvina','L’anima è libera! Il corpo resta esausto, ma Echomax non può più usarlo.');
  return true;
}
