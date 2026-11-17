// CAMPAGNA 3D — progressione autosalvata, separata dalle campagne a episodi.
// Tutti gli scontri usano il motore classico di Multimon (CPU, tipi, passive, mosse).
import {createBattleReport} from './battleReport.js';
import {ADVENTURE_RIVAL_ZONES} from '../data/adventureStory.js';

export const ADVENTURE_SAVE_KEY='multimon_avventura_3d_v1';
export const ADVENTURE_MAX_PARTY=6;
export const ADVENTURE_STARTERS=Object.freeze([
 {id:'sonic',role:'Velocità',icon:'⚡',tagline:'Scatta, colpisci e sorprendi i rivali.',tone:'cyan'},
 {id:'starbutterfly',role:'Magia',icon:'✨',tagline:'Una forza imprevedibile e spettacolare.',tone:'pink'},
 {id:'jake',role:'Equilibrio',icon:'🌿',tagline:'Resistenza, fantasia e un grande cuore.',tone:'amber'}
]);
export const ADVENTURE_ZONES=Object.freeze([
 {id:'alba',name:'Valle dell’Alba',short:'Valle Alba',biome:'meadow',range:[0,34],center:15,
  badge:'Emblema Smeraldo',gym:'Flora',beforeGym:"Qui non vince chi corre più forte. I miei Multimon sanno aspettare. Vediamo se sai cambiare piano.",afterGym:"Hai capito il ritmo del campo. L'Emblema Smeraldo te lo sei guadagnato.",title:'Custode del Germoglio',level:9,
  leaderTeam:['roserade','groot'],trainers:['finn','ponygon'],
  wild:['groot','yoshi','rainbowdash','spongebob'],desc:'Prati luminosi, ponti e i primi allenatori.',color:'#5ddd9f'},
 {id:'braci',name:'Sentiero delle Braci',short:'Braci',biome:'autumn',range:[34,68],center:49,
  badge:'Emblema Scintilla',gym:'Kael',beforeGym:"Il sentiero si scalda, eh? Le sfide migliori iniziano quando tutto cambia all'improvviso.",afterGym:"Non male! Hai tenuto testa al fuoco senza perdere la testa.",title:'Campione delle Fiamme',level:15,
  leaderTeam:['spyro','natsu'],trainers:['wario','pyra'],
  wild:['spyro','zuko','bowser','gaston'],desc:'Boschi d’autunno, forni e sentieri aranciati.',color:'#fba963'},
 {id:'cascate',name:'Lago delle Cascate',short:'Cascate',biome:'water',range:[68,102],center:83,
  badge:'Emblema Onda',gym:'Nerea',beforeGym:"Non sempre la corrente va dove pensi. Se ti irrigidisci, hai già perso.",afterGym:"Hai trovato la tua corrente. Ora seguila.",title:'Maestra delle Correnti',level:22,
  leaderTeam:['katara','lapis','juvia'],trainers:['spongebob','patrick'],
  wild:['lapis','juvia','katara','aang'],desc:'Canali azzurri, pontili e rocce levigate.',color:'#5bc5f5'},
 {id:'neve',name:'Picchi di Cristallo',short:'Cristallo',biome:'snow',range:[102,136],center:117,
  badge:'Emblema Brina',gym:'Eira',beforeGym:"Non inseguire la prima occasione che vedi. Sul ghiaccio, un passo sbagliato basta.",afterGym:"Hai capito quando rallentare. Il freddo non ti ha fermato.",title:'Signora del Gelo',level:29,
  leaderTeam:['weiss','elsa','jackfrost'],trainers:['reghiaccio','yukionna'],
  wild:['elsa','reghiaccio','yukionna','weiss'],desc:'Abeti innevati e un passo di montagna.',color:'#abd9ff'},
 {id:'astrale',name:'Giardino Astrale',short:'Astrale',biome:'magic',range:[136,170],center:151,
  badge:'Emblema Stella',gym:'Lyra',beforeGym:"Non guardare soltanto l'avversario. Guarda la squadra che hai portato fin qui.",afterGym:"I tuoi compagni si fidano di te. È questa la tua forza.",title:'Voce delle Costellazioni',level:36,
  leaderTeam:['perla','garnet','superboy'],trainers:['corvina','marceline'],
  wild:['gardevoir','kirby','neon','miku'],desc:'Giardini fluttuanti e torri illuminate.',color:'#bc9afb'},
 {id:'vulcano',name:'Corona del Vulcano',short:'Vulcano',biome:'volcanic',range:[170,204],center:185,
  badge:'Emblema Corona',gym:'Rokan',beforeGym:"Questa porta si apre solo a chi non si è fermato lungo la strada. Mostrami cosa hai imparato.",afterGym:"La tua squadra regge il calore della Forgia. Ora puoi affrontare la Lega.",title:'Re della Forgia',level:44,
  leaderTeam:['shrek','bowser','goku'],trainers:['kratos','meliodas'],
  wild:['shrek','goku','kratos','godzilla'],desc:'Canyon di lava e l’ultima Palestra.',color:'#ff8776'}
]);
export const ADVENTURE_CHAMPION={id:'champion',kind:'champion',name:'Campionessa Iris',title:'Signora dei Sei Portali',
 x:214,z:0,level:50,party:['sonic','kirby','starbutterfly','cell'],
 dialogue:'Hai attraversato sei mondi, ma non sono gli emblemi a definire un campione. Sono le scelte fatte lungo il cammino.'};
export const adventureRoadZ=x=>Math.sin(x*.075)*3.6+Math.sin(x*.19)*1.35;
const finite=(value,fallback=0)=>Number.isFinite(Number(value))?Number(value):fallback;
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
export const adventureZoneIndex=x=>clamp(Math.floor(clamp(finite(x),0,203.99)/34),0,5);
export const adventureZone=x=>ADVENTURE_ZONES[adventureZoneIndex(x)];
export const adventureEncounterId=(zone,kind,index)=>zone+':'+kind+':'+index;
export const adventureLevelCap=badges=>[14,20,27,34,41,50,60][clamp(badges?.length||0,0,6)];
export const adventureExpRequired=level=>28+Math.max(1,level)*10;

export function createAdventureSave(starterId,characters=[]){
 if(!ADVENTURE_STARTERS.some(s=>s.id===starterId))throw new Error('Starter non disponibile.');
 const starter=characters.find(c=>c.id===starterId&&!c.isSummonOnly);
 if(!starter)throw new Error('Starter non presente nel roster.');
 return {version:1,started:true,finished:false,starterId,position:{x:5,z:adventureRoadZ(5)},
  facing:0,party:[{id:starterId,level:5,exp:0,hp:null}],
  reserve:[],coins:120,potions:4,revives:1,badges:[],
  defeated:[],chests:[],storySeen:[],wildBattles:0,trainerWins:0,rivalWins:0,gymWins:0,
  chapter:'L’inizio di un’avventura',lastMessage:'Il professor Orion ti aspetta davanti al villaggio.',
  lastBattleId:null,checkpointZone:0,playSeconds:0,createdAt:Date.now()};
}
export function sanitizeAdventureSave(raw,characters=[]){
 if(!raw?.started)return null;
 const allowed=new Set(characters.filter(c=>c?.id&&!c.isSummonOnly).map(c=>c.id));
 const members=(array,max)=>[...(Array.isArray(array)?array:[])].filter(m=>
  m&&allowed.has(m.id)&&Number.isFinite(m.level)).slice(0,max).map(m=>({
   id:m.id,level:clamp(Math.floor(m.level),1,60),exp:clamp(Math.floor(finite(m.exp)),0,5000),
   hp:m.hp===null||m.hp===undefined?null:Math.max(0,Math.round(finite(m.hp)))
  }));
 const party=members(raw.party,6),reserve=members(raw.reserve,24);
 if(!party.length)return null;
 const badges=[...new Set((Array.isArray(raw.badges)?raw.badges:[]).filter(x=>ADVENTURE_ZONES.some(z=>z.id===x)))];
 const maxX=Math.min(217,34*(badges.length+1)-1);
 const x=clamp(finite(raw.position?.x,5),0,maxX);
 return {...raw,version:1,started:true,finished:!!raw.finished,
  position:{x,z:clamp(finite(raw.position?.z,adventureRoadZ(x)),-19,19)},
  starterId:allowed.has(raw.starterId)?raw.starterId:party[0].id,
  party,reserve,coins:clamp(Math.floor(finite(raw.coins)),0,999999),
  potions:clamp(Math.floor(finite(raw.potions)),0,99),
  revives:clamp(Math.floor(finite(raw.revives)),0,99),
  badges,defeated:[...new Set((Array.isArray(raw.defeated)?raw.defeated:[]).filter(id=>typeof id==='string'))],
  chests:[...new Set((Array.isArray(raw.chests)?raw.chests:[]).filter(id=>typeof id==='string'))],
  storySeen:Array.isArray(raw.storySeen)?[...new Set(raw.storySeen.filter(id=>typeof id==='string'))]:
    // Già oltre la regione: non riprodurre tutti i filmati del passato.
    badges.flatMap(id=>['arrival:'+id,'badge:'+id]),
  wildBattles:Math.max(0,Math.floor(finite(raw.wildBattles))),
  trainerWins:Math.max(0,Math.floor(finite(raw.trainerWins))),
  rivalWins:Math.max(0,Math.floor(finite(raw.rivalWins))),
  gymWins:Math.max(0,Math.floor(finite(raw.gymWins))),
  checkpointZone:clamp(Math.floor(finite(raw.checkpointZone)),0,5),
  playSeconds:Math.max(0,Math.floor(finite(raw.playSeconds)))};
}
export function adventureEntities(){
 const result=[{id:'professor',kind:'npc',name:'Professor Orion',x:8,z:adventureRoadZ(8)-5,
  dialogue:'Ogni percorso nasconde incontri inattesi. Allenati, aiuta chi trovi e conquista i sei Emblemi. La vera avventura comincia adesso!'},
 {id:'inn:0',kind:'inn',name:'Centro di Cura',x:5,z:adventureRoadZ(5)+7},
 {id:'shop:0',kind:'shop',name:'Bottega di Alba',x:10,z:adventureRoadZ(10)+7}];
 const regionPeople=[
  {name:'Meccanico Teo',text:'Il generatore della Valle lampeggia da quando sono caduti i sei portali. Flora conserva la chiave per stabilizzarlo.'},
  {name:'Fabbra Mira',text:'Le fonderie hanno perso corrente. Kael tiene la sua chiave nella Palestra, ma Nox controlla chi tenta di arrivarci.'},
  {name:'Barcaiola Ondina',text:'Ho trovato un segnale dentro il vecchio condotto sotto il lago. La rete è stata fermata per evitare un sovraccarico.'},
  {name:'Tecnica Brina',text:'I sensori parlano chiaro: Iris ordinò lo spegnimento per salvare tutti. La prossima traccia è nel Giardino Astrale.'},
  {name:'Archivista Selene',text:'Ho studiato le sei chiavi: bisogna attivarle in sequenza. Perla e Lyra conoscono l’ordine esatto.'},
  {name:'Guardiano della Forgia',text:'La sesta chiave riposa con Rokan. Se Nox si mette di mezzo, affrontalo: vuole essere certo che tu comprenda il rischio.'}
 ];
 for(let i=0;i<ADVENTURE_ZONES.length;i++){
  const z=ADVENTURE_ZONES[i],x=z.center;
  const px=x-12;
  result.push({id:'guide:'+z.id,kind:'npc',name:regionPeople[i].name,
    zone:i,x:px,z:adventureRoadZ(px)+5.6,dialogue:regionPeople[i].text});
  result.push({id:z.id+':gym',kind:'gym',name:'Palestra di '+z.gym,zone:i,
   x:x+11,z:adventureRoadZ(x+11)+9,level:z.level,
   title:z.title,dialogue:z.beforeGym,afterVictory:z.afterGym,party:z.leaderTeam});
  for(let j=0;j<2;j++){
   const tx=x-5+j*12;
   result.push({id:adventureEncounterId(z.id,'trainer',j),kind:'trainer',
    name:['Allenatore '+['Milo','Lena','Rex','Ivy','Luca','Kira','Dora','Axel','Nico','Eva','Mika','Nora'][i*2+j]][0],
    zone:i,x:tx,z:adventureRoadZ(tx)+(j===0?-5:5),level:Math.max(5,z.level-3+j),
    party:[z.trainers[j],...(i>=2?[z.wild[(j+i)%z.wild.length]]:[])],
    dialogue:['Vedo una bella squadra! Ti va una sfida?','Vediamo se sei pronto per la prossima Palestra!'][j]});
  }
  if(ADVENTURE_RIVAL_ZONES.includes(i)){
   const rx=x+3;
   result.push({id:adventureEncounterId(z.id,'rival',0),kind:'rival',
     name:'Nox · Viaggiatore dei Portali',zone:i,x:rx,z:adventureRoadZ(rx)-2,
     level:z.level+2,party:i===1?['metalsonic','poisonivy']:
       i===3?['weiss','superboy','miku']:['garnet','meliodas','reboo'],
     dialogue:i===1?'Dimostrami che non consegnerai le chiavi senza fare domande.':
       i===3?'I sensori hanno ragione, ma serve qualcuno capace di fermarsi.':
       'Se vincerai, ti accompagnerò fino alla Lega.'});
  }
  for(let j=0;j<4;j++){
   const tx=x-8+j*6;
   result.push({id:adventureEncounterId(z.id,'wild',j),kind:'wild',
    name:'Incontro selvatico',zone:i,x:tx,z:adventureRoadZ(tx)+(j%2===0?-11:11),
    level:Math.max(4,z.level-5+j),party:[z.wild[j]]});
  }
  const bx=x-10;
  result.push({id:'chest:'+i,kind:'chest',zone:i,name:'Scrigno di viaggio',
   x:bx,z:adventureRoadZ(bx)+13});
  if(i>0){
   result.push({id:'inn:'+i,kind:'inn',name:'Centro di Cura · '+z.short,
    zone:i,x:x-12,z:adventureRoadZ(x-12)-8});
   result.push({id:'shop:'+i,kind:'shop',name:'Bottega di '+z.short,
    zone:i,x:x-7,z:adventureRoadZ(x-7)+8});
  }
 }
 result.push(ADVENTURE_CHAMPION);
 return result;
}
export const ADVENTURE_ENTITIES=adventureEntities();
export const adventureDistance=(a,b)=>Math.hypot(finite(a?.x)-finite(b?.x),finite(a?.z)-finite(b?.z));
export function adventureNearby(position,save,radius=4.4){
 const currentZone=adventureZoneIndex(position.x);
 return ADVENTURE_ENTITIES.filter(e=>adventureDistance(position,e)<=radius&&
  // Never show already-completed one-time encounters as interactable.
  !(['trainer','rival'].includes(e.kind)&&save.defeated.includes(e.id))&&
  !(e.kind==='gym'&&save.badges.includes(ADVENTURE_ZONES[e.zone].id))&&
  !(e.kind==='chest'&&save.chests.includes(e.id))&&
  !(e.kind==='champion'&&save.finished))
 .sort((a,b)=>adventureDistance(position,a)-adventureDistance(position,b))[0]||null;
}
export function adventureMove(save,newX,newZ){
 const current=save?.position||{x:5,z:0};
 const x=clamp(finite(newX,current.x),0,217),z=clamp(finite(newZ,current.z),-19,19);
 const allowedMax=save.finished?217:Math.min(217,34*(save.badges?.length+1)-.6);
 const goalX=Math.min(x,allowedMax);
 return {position:{x:goalX,z},blocked:x>allowedMax+.04,requiresBadge:ADVENTURE_ZONES[save.badges.length]?.badge||null};
}
export function adventureGymCheck(save,entity){
 if(!entity)return {ok:false,message:'Non c’è nessuna sfida qui.'};
 if(entity.kind==='gym'){
   const z=ADVENTURE_ZONES[entity.zone],previous=ADVENTURE_ZONES.slice(0,entity.zone);
   if(!previous.every(g=>save.badges.includes(g.id)))
     return {ok:false,message:'Devi conquistare le Palestre precedenti.'};
   if(save.badges.includes(z.id))return {ok:false,message:'Questo Emblema è già tuo.'};
   const victories=(save.defeated||[]).filter(id=>id.startsWith(z.id+':trainer:')).length;
   if(victories<2)return {ok:false,message:'Prima devi battere entrambi gli allenatori di '+z.name+' ('+victories+'/2). Apri la bussola della missione per trovarli.'};
   const rivalId=adventureEncounterId(z.id,'rival',0);
   if(ADVENTURE_RIVAL_ZONES.includes(entity.zone)&&!save.defeated.includes(rivalId))
     return {ok:false,message:'Nox ti aspetta lungo il percorso. Affrontalo prima della Palestra di '+z.gym+'.'};
 }
 if(entity.kind==='champion'){
   if(save.badges.length<6)return {ok:false,message:'La Lega richiede tutti e sei gli Emblemi.'};
   if(save.finished)return {ok:false,message:'Hai già conquistato la Lega del Multiverso!'};
 }
 if(!save.party.some(m=>m.hp===null||m.hp>0))return {ok:false,message:'La tua squadra è esausta. Raggiungi un Centro di Cura.'};
 return {ok:true,message:''};
}
export function adventureMaxHp(base,level){return Math.max(1,Math.round(finite(base?.maxHp,base?.hp||100)*(1+Math.max(1,level)*.036)));}
export function adventureFighter(base,member){
 if(!base||!member)throw new Error('Multimon senza scheda');
 const fighter=structuredClone(base);
 const level=clamp(Math.floor(finite(member.level,5)),1,60);
 const factor=.83+level*.022;
 fighter.maxHp=adventureMaxHp(base,level);
 fighter.hp=member.hp===null?fighter.maxHp:clamp(Math.round(finite(member.hp)),0,fighter.maxHp);
 for(const stat of ['atk','def','spd','spAtk','spDef']){
  if(Number.isFinite(base[stat])){
   fighter[stat]=Math.max(1,Math.round(base[stat]*factor));
   fighter['base'+stat.charAt(0).toUpperCase()+stat.slice(1)]=fighter[stat];
  }
 }
 fighter.adventureLevel=level;
 fighter.revealed=true;
 fighter.statuses=[];fighter.consecutiveProtect=0;fighter.heldItem=null;
 fighter.moves=(base.moves||[]).filter(Boolean).map(m=>({...m,remainingUses:m.maxUses??null,currentCooldown:0}));
 return fighter;
}
export function adventureBattleRoom(save,entity,characters,initialGameState,trainerName='Viaggiatore'){
 if(!['wild','trainer','rival','gym','champion'].includes(entity?.kind))throw new Error('Sfida non valida');
 if(['trainer','rival'].includes(entity.kind)&&save.defeated.includes(entity.id))
   throw new Error('Questo avversario è già stato sconfitto.');
 const check=adventureGymCheck(save,entity);
 if(!check.ok)throw new Error(check.message);
 const byId=new Map(characters.map(c=>[c.id,c]));
 const enemies=entity.party.map((id,index)=>{
  const base=byId.get(id);
  if(!base)throw new Error('Avversario non presente nel database: '+id);
  const member={id,level:Math.min(60,entity.level+(entity.kind==='gym'?index:0)),hp:null};
  return adventureFighter(base,member);
 });
 const heroes=save.party.map(m=>{
  const base=byId.get(m.id);
  if(!base)throw new Error('Alleato non presente nel database: '+m.id);
  return adventureFighter(base,m);
 });
 const first=heroes.findIndex(c=>c.hp>0);
 if(first<0)throw new Error('La squadra è esausta.');
 const base=initialGameState();
 return {...base,status:'pre_battle',gameMode:'classica',
  isTrainingBattle:true,isAdventureBattle:true,battleStartedAt:Date.now(),battleReport:createBattleReport(),
  adventureEncounter:{id:entity.id,kind:entity.kind,zone:entity.zone??6,
   species:entity.party[0],name:entity.name,level:entity.level},
  players:{...base.players,p1:trainerName||'Viaggiatore',p2:entity.name},
  playerAvatars:{...base.playerAvatars,p1:heroes[first].img,p2:enemies[0].img},
  isBot:{...base.isBot,p1:false,p2:true},
  teams:{...base.teams,p1:heroes,p2:enemies},
  field:{...base.field,p1:[first],p2:[0]},
  inventory:{...base.inventory,p1:{},p2:{}},
  settings:{...base.settings,teamSize:Math.max(heroes.length,enemies.length),
   fieldSize:1,maxPlayers:2,rentalMode:true,draftBattle:false,sharedDraft:false},
  cpuStyles:{p2:['gym','champion','rival'].includes(entity.kind)?'tactical':'aggressive'}
 };
}
export function adventureGiveXp(member,amount,characters){
 const base=characters.find(c=>c.id===member.id);
 if(!base)return {member,levels:0};
 let level=member.level,exp=member.exp||0,hp=member.hp===null?adventureMaxHp(base,level):member.hp;
 const beforeMax=adventureMaxHp(base,level);
 exp+=Math.max(0,Math.floor(amount));
 let levels=0;
 while(level<60&&exp>=adventureExpRequired(level)){
  exp-=adventureExpRequired(level);level++;levels++;
 }
 const afterMax=adventureMaxHp(base,level);
 // Il level-up aumenta anche la barra massima, ma non rianima un KO.
 if(hp>0)hp=Math.min(afterMax,hp+afterMax-beforeMax);
 return {member:{...member,level,exp,hp},levels};
}
export function adventureFinishBattle(save,room,characters,{recruit=false}={}){
 if(!room?.isAdventureBattle||room.status!=='gameover')throw new Error('Battaglia non conclusa.');
 const id=room.battleReport?.id||room.adventureEncounter?.id;
 if(id&&save.lastBattleId===id)return {save,won:false,duplicate:true};
 const won=room.winner===room.players.p1,encounter=room.adventureEncounter||{};
 let next={...save,party:save.party.map(m=>({...m})),
   reserve:[...(save.reserve||[])],defeated:[...(save.defeated||[])],
   badges:[...(save.badges||[])],lastBattleId:id};
 const report=room.battleReport||{};
 let xp=0,coins=0,levelUps=[];
 next.party=next.party.map((m,i)=>{
  const fighter=room.teams?.p1?.[i];
  if(!fighter)return m;
  const hp=clamp(Math.round(finite(fighter.hp)),0,adventureMaxHp(characters.find(c=>c.id===m.id),m.level));
  return {...m,hp};
 });
 if(won){
  xp=encounter.kind==='champion'?1200:encounter.kind==='gym'?240+encounter.level*5:
   encounter.kind==='rival'?175+encounter.level*5:
   encounter.kind==='trainer'?90+encounter.level*4:40+encounter.level*2;
  coins=encounter.kind==='champion'?1200:encounter.kind==='gym'?350:
   encounter.kind==='rival'?220:
   encounter.kind==='trainer'?90+encounter.level*3:24+encounter.level;
  next.party=next.party.map(m=>{
    const gain=m.hp>0?xp:Math.floor(xp*.35);
    const result=adventureGiveXp(m,gain,characters);
    if(result.levels)levelUps.push({id:m.id,levels:result.levels,newLevel:result.member.level});
    return result.member;
  });
  next.coins+=coins;
  if(encounter.kind==='gym'){
    const zone=ADVENTURE_ZONES[encounter.zone];
    if(zone&&!next.badges.includes(zone.id)){
      next.badges.push(zone.id);next.gymWins=(next.gymWins||0)+1;
      next.checkpointZone=Math.max(next.checkpointZone||0,encounter.zone);
      next.chapter='La strada verso '+(ADVENTURE_ZONES[encounter.zone+1]?.name||'la Lega del Multiverso');
    }
  }
  if(['trainer','rival'].includes(encounter.kind)&&!next.defeated.includes(encounter.id)){
   next.defeated.push(encounter.id);
   if(encounter.kind==='trainer')next.trainerWins=(next.trainerWins||0)+1;
   else next.rivalWins=(next.rivalWins||0)+1;
  }
  if(encounter.kind==='wild'){
   next.wildBattles=(next.wildBattles||0)+1;
   const base=characters.find(c=>c.id===encounter.species);
   if(recruit&&base&&(next.party.length+next.reserve.length)<30){
     const newcomer={id:base.id,level:Math.max(2,encounter.level),exp:0,hp:null};
     if(next.party.length<6)next.party.push(newcomer);
     else next.reserve.push(newcomer);
   }
  }
  if(encounter.kind==='champion'){
   next.finished=true;next.chapter='Campione del Multiverso';
  }
  next.lastMessage='Vittoria contro '+encounter.name+'! Hai guadagnato '+xp+' EXP e '+coins+' monete.';
 }else{
  const loss=Math.min(next.coins,Math.ceil(next.coins*.12));
  next.coins-=loss;
  const z=ADVENTURE_ZONES[Math.min(next.checkpointZone||0,Math.max(0,next.badges.length))]||ADVENTURE_ZONES[0];
  const start=z.center-10;
  next.position={x:start,z:adventureRoadZ(start)};
  next.travelSerial=(next.travelSerial||0)+1;
  next.party=next.party.map(m=>({...m,hp:Math.max(1,Math.ceil(adventureMaxHp(characters.find(c=>c.id===m.id),m.level)*.55))}));
  next.lastMessage='La squadra si è ritirata al Centro di Cura. Hai perso '+loss+' monete, ma non i progressi.';
 }
 return {save:next,won,xp,coins,levelUps,emblem:won&&encounter.kind==='gym'?ADVENTURE_ZONES[encounter.zone]?.badge:null,
  champion:won&&encounter.kind==='champion',recruit:won&&recruit&&encounter.kind==='wild'};
}
export function adventureHeal(save,characters){
 const restore=m=>({...m,hp:adventureMaxHp(characters.find(c=>c.id===m.id),m.level)});
 return {...save,party:save.party.map(restore),reserve:(save.reserve||[]).map(restore),
  lastMessage:'Il Centro di Cura ha guarito tutta la squadra e la riserva!'};
}
export function adventureUsePotion(save,index,characters,revive=false){
 const member=save.party?.[index],base=characters.find(c=>c.id===member?.id);
 if(!base)return {save,error:'Alleato non valido'};
 const max=adventureMaxHp(base,member.level),hp=member.hp===null?max:member.hp;
 if(revive){
  if(hp>0||!save.revives)return {save,error:'Serve un alleato esausto e un cristallo di rinascita'};
 }else if(!(save.potions>0)||hp<=0||hp>=max)
  return {save,error:'Questo alleato non può usare la pozione'};
 const newHp=revive?Math.max(1,Math.ceil(max*.5)):Math.min(max,hp+Math.ceil(max*.40));
 return {save:{...save,
  party:save.party.map((m,i)=>i===index?{...m,hp:newHp}:m),
  potions:save.potions-(revive?0:1),revives:save.revives-(revive?1:0),
  lastMessage:(revive?'Cristallo':'Pozione')+' usato su '+base.name+'.'},error:null};
}
export function adventureShop(save,item){
 const catalog={potion:{price:45,key:'potions',name:'Pozione'},revive:{price:135,key:'revives',name:'Cristallo di Rinascita'}};
 const selected=catalog[item];
 if(!selected||save.coins<selected.price)return {save,error:'Monete insufficienti'};
 if((save[selected.key]||0)>=99)return {save,error:'Non puoi portarne più di 99.'};
 return {save:{...save,coins:save.coins-selected.price,
   [selected.key]:(save[selected.key]||0)+1,
   lastMessage:selected.name+' acquistato!'},error:null};
}
export function adventureChest(save,entity){
 if(entity?.kind!=='chest'||save.chests.includes(entity.id))return save;
 return {...save,chests:[...save.chests,entity.id],coins:save.coins+55,potions:save.potions+1,
  lastMessage:'Scrigno aperto! +55 monete e una Pozione.'};
}
export function adventureSwap(save,source,index){
 if(!['party','reserve'].includes(source)||!Number.isInteger(index)||index<0)return save;
 const party=[...save.party],reserve=[...save.reserve];
 if(source==='reserve'){
  if(!reserve[index]||party.length>=ADVENTURE_MAX_PARTY)return save;
  party.push(...reserve.splice(index,1));
 }else{
  if(!party[index]||party.length<=1||reserve.length>=24)return save;
  reserve.push(...party.splice(index,1));
 }
 return {...save,party,reserve,lastMessage:'Squadra aggiornata: modifiche salvate.'};
}
export function adventureNextObjective(save){
 if(!save?.started)return null;
 if(save.finished)return {id:'completed',kind:'complete',name:'Campione del Multiverso',x:214,z:0,
   description:'Hai ripristinato il Cuore dei Portali. Puoi esplorare liberamente.'};
 const zone=ADVENTURE_ZONES[Math.min(5,save.badges.length)];
 if(save.badges.length>=6)return ADVENTURE_CHAMPION;
 const wins=(save.defeated||[]).filter(id=>id.startsWith(zone.id+':trainer:')).length;
 if(wins<2)return ADVENTURE_ENTITIES.find(e=>e.kind==='trainer'&&e.zone===save.badges.length&&!save.defeated.includes(e.id));
 if(ADVENTURE_RIVAL_ZONES.includes(save.badges.length)){
   const nox=ADVENTURE_ENTITIES.find(e=>e.kind==='rival'&&e.zone===save.badges.length);
   if(!save.defeated.includes(nox.id))return nox;
 }
 return ADVENTURE_ENTITIES.find(e=>e.kind==='gym'&&e.zone===save.badges.length);
}
export function adventureGuide(save,position=save?.position){
 const target=adventureNextObjective(save);
 if(!target)return null;
 const dx=target.x-(position?.x||0),dz=target.z-(position?.z||0);
 const distance=Math.round(Math.hypot(dx,dz));
 const degree=Math.atan2(dz,dx)*180/Math.PI;
 const direction=Math.abs(dx)>=Math.abs(dz)*1.5?(dx>=0?'AVANTI':'INDIETRO'):
   Math.abs(dz)>=Math.abs(dx)*1.5?(dz>=0?'A DESTRA':'A SINISTRA'):
   dx>=0?(dz>=0?'AVANTI + DESTRA':'AVANTI + SINISTRA'):
   (dz>=0?'INDIETRO + DESTRA':'INDIETRO + SINISTRA');
 const kind=target.kind;
 const action=kind==='trainer'?'Sfida l’allenatore':kind==='rival'?'Affronta Nox':
   kind==='gym'?'Conquista l’Emblema':kind==='champion'?'Sfida Iris alla Lega':'Esplora';
 const tip=kind==='trainer'?'Segui la strada chiara e cerca l’icona ⚔️. Premi E oppure PARLA quando sei vicino.':
   kind==='rival'?'Nox è sul percorso principale: è una sfida obbligatoria prima della Palestra.':
   kind==='gym'?'La Palestra è un edificio con una gemma brillante. Cura il team prima di sfidarla.':
   kind==='champion'?'Attraversa il sesto portale, raggiungi il palazzo e parla con Iris.':
   'Ora puoi visitare tutte le regioni.';
 return {target,action,distance,direction,angle:degree,tip,
   progress:save.badges.length+' / 6 Emblemi',zone:target.zone===undefined?'Lega':ADVENTURE_ZONES[target.zone]?.name};
}
export function adventureQuest(save){
 if(!save?.started)return 'Scegli uno starter per cominciare.';
 if(save.finished)return 'Il Cuore dei Portali è ripartito. Sei il Campione del Multiverso!';
 const target=adventureNextObjective(save);
 if(target?.kind==='champion')return 'Raggiungi la Lega attraverso il sesto portale e affronta Iris.';
 if(target?.kind==='trainer'){
  const z=ADVENTURE_ZONES[target.zone],wins=save.defeated.filter(id=>id.startsWith(z.id+':trainer:')).length;
  return 'Nella '+z.name+': sconfiggi i due allenatori ('+wins+'/2). Prossimo: '+target.name+'.';
 }
 if(target?.kind==='rival')return 'Nox ti aspetta nella '+ADVENTURE_ZONES[target.zone].name+'. Sconfiggilo per accedere alla Palestra.';
 if(target?.kind==='gym')return 'Sfida '+ADVENTURE_ZONES[target.zone].gym+' e conquista '+ADVENTURE_ZONES[target.zone].badge+'.';
 return 'Segui la bussola e scopri la tua prossima missione.';
}
// Uscire dalla battaglia NON cancella danni o permette di saltare i rivali:
// è un ritiro con ritorno al checkpoint e perdita moderata di monete.
export function adventureRetreat(save,room,characters){
 if(!room?.isAdventureBattle)return save;
 if(room?.battleReport?.id&&save.lastBattleId===room.battleReport.id)return save;
 const abandoned={...room,status:'gameover',winner:room.players?.p2||'Avversario'};
 return adventureFinishBattle(save,abandoned,characters).save;
}
