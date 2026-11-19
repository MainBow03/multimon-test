// Esplorazione e sei prove originali delle Palestre.
// Logica pura: tutte le prove sono giocabili con tastiera, mouse e touch.
export const ADVENTURE_TRIALS=Object.freeze([
 {id:'alba',name:'Il Labirinto Vivente',icon:'🌿',kind:'growth',
  intro:'Tre radici bloccano il passaggio verso Flora. Ricostruisci il ciclo di crescita delle piante.',
  clues:['Raggiungi il sole nascosto nel giardino.','Segui il sentiero fino alla rugiada.','Trova il cuore delle radici.','Attraversa l arco e raggiungi Flora.'],
  width:7,height:5,start:[0,4],goal:[6,0],
  walls:[[2,0],[2,1],[4,3],[1,1],[3,4],[5,3]],
  nodes:[{position:[1,3],icon:'☀️',name:'Sole'},
   {position:[3,2],icon:'💧',name:'Rugiada'},
   {position:[5,1],icon:'🌱',name:'Radici'}]},
 {id:'braci',name:'La Forgia Incandescente',icon:'🔥',kind:'forge',
  intro:'Regola il calore delle tre camere senza surriscaldarle. Ogni metallo ha il proprio punto di fusione.',
  targets:[60,85,45]},
 {id:'cascate',name:'Le Maree Perdute',icon:'🌊',kind:'tides',
  intro:'Apri le chiuse per ottenere la portata indicata. Le tre valvole aggiungono 1, 2 e 4 unita d acqua.',
  targets:[3,5,6]},
 {id:'neve',name:'Il Palazzo Gelato',icon:'❄️',kind:'ice',
  intro:'Scivola fino al sigillo azzurro: quando parti non puoi fermarti finche non trovi un muro.',
  width:5,height:5,start:[0,4],goal:[4,0],
  walls:[[2,0],[2,1],[0,2],[3,3],[1,3]]},
 {id:'astrale',name:'La Costellazione Spezzata',icon:'✨',kind:'stars',
  intro:'Allinea le stelle nell ordine inciso sul cielo: Onda, Custode, Corona, Alba.',
  symbols:['Custode','Alba','Onda','Corona'],answer:[2,0,3,1]},
 {id:'vulcano',name:'Le Sei Fiamme della Corona',icon:'🌋',kind:'runes',
  intro:'La sequenza di sincronizzazione compare negli archivi della Lega: attraversa le sei regioni nello stesso ordine.',
  symbols:['Smeraldo','Scintilla','Onda','Brina','Stella','Corona'],
  answer:[0,1,2,3,4,5]}
]);
export const ADVENTURE_SIDE_QUESTS=Object.freeze([
 {id:'alba',name:'Il giardino di Mira',giver:'Giardiniera Lilia',
  dialogue:'Il vento ha portato via tre semi luminosi. Sono sparsi nella Valle. Riesci a ritrovarli?',
  completed:'Hai salvato il giardino della Valle! Flora sarebbe orgogliosa di te.',
  rewardCoins:90,rewardPotions:2,spots:[[4,-14],[21,15],[30,-12]],spotName:'Seme luminoso'},
 {id:'braci',name:'I tre nuclei spenti',giver:'Artigiano Fero',
  dialogue:'Sono rimasti tre nuclei fuori uso nella Forgia. Recuperali lungo i sentieri laterali.',
  completed:'Ora la fonderia puo ripartire, grazie a te!',rewardCoins:115,rewardPotions:1,
  spots:[[38,-14],[55,16],[63,-13]],spotName:'Nucleo di forgia'},
 {id:'cascate',name:'Le perle del lago',giver:'Barcaiola Mina',
  dialogue:'Le correnti hanno disperso tre perle guida tra le rocce e il pontile. Aiutami a recuperarle.',
  completed:'Il faro acquatico tornera a brillare!',rewardCoins:125,rewardPotions:2,
  spots:[[71,16],[88,-15],[97,17]],spotName:'Perla marina'},
 {id:'neve',name:'Segnali nella tormenta',giver:'Ricercatrice Neve',
  dialogue:'Tre cristalli di segnalazione sono rimasti tra le rocce ghiacciate. Puoi raggiungerli?',
  completed:'Perfetto! I sensori della montagna ci guideranno anche stanotte.',
  rewardCoins:140,rewardPotions:2,spots:[[106,-15],[124,16],[131,-12]],spotName:'Cristallo-segnale'},
 {id:'astrale',name:'La polvere delle stelle',giver:'Astronoma Lyse',
  dialogue:'Tre frammenti luminosi sono caduti dal padiglione astrale. Recuperali prima che svaniscano.',
  completed:'I frammenti formano una nuova costellazione!',rewardCoins:160,rewardPotions:2,
  spots:[[140,-15],[155,16],[165,-13]],spotName:'Frammento stellare'},
 {id:'vulcano',name:'Il cuore della fucina',giver:'Fabbro Rook',
  dialogue:'Tre rune di basalto sono disperse lungo il vulcano. Se le recuperi riaccenderemo la fornace.',
  completed:'La fornace si e accesa! Prendi queste provviste per la Lega.',
  rewardCoins:200,rewardPotions:3,spots:[[174,17],[190,-15],[200,16]],spotName:'Runa di basalto'}
]);
export const adventureQuestForZone=id=>ADVENTURE_SIDE_QUESTS.find(q=>q.id===id);
export const adventureTrialForZone=id=>ADVENTURE_TRIALS.find(q=>q.id===id);
export const adventureTrialInitial=zoneId=>{
 const spec=adventureTrialForZone(zoneId);
 if(!spec)return null;
 return {zoneId,step:0,value:spec.kind==='ice'||spec.kind==='growth'?null:0,
  position:spec.kind==='ice'||spec.kind==='growth'?[...spec.start]:null,history:[],mistakes:0,solved:false};
};
const key=xy=>xy.join(',');
export function adventureTrialStep(current,action){
 if(!current||current.solved)return current;
 const spec=adventureTrialForZone(current.zoneId);if(!spec)return current;
 let next={...current,history:[...current.history]};
 const success=()=>{
  const last=spec.kind==='growth'?spec.nodes.length+1:
    spec.kind==='forge'||spec.kind==='tides'?spec.targets.length:
    spec.kind==='ice'?1:spec.answer.length;
  next.step+=1;next.value=0;next.solved=next.step>=last;
  return next;
 };
 if(spec.kind==='growth'){
  const [dx,dz]=({up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]})[action]||[0,0];
  if(!dx&&!dz)return next;
  const [x,z]=next.position,px=x+dx,pz=z+dz;
  if(px<0||px>=spec.width||pz<0||pz>=spec.height||
     spec.walls.some(([wx,wz])=>wx===px&&wz===pz))
   return {...next,mistakes:next.mistakes+1};
  next.position=[px,pz];
  const node=spec.nodes[next.step];
  if(node&&node.position[0]===px&&node.position[1]===pz){
   next.history.push(node.name);return success();
  }
  if(next.step===spec.nodes.length&&px===spec.goal[0]&&pz===spec.goal[1])
   return success();
  return next;
 }
 if(spec.kind==='forge'){
  if(typeof action==='number'){next.value=Math.max(0,Math.min(100,next.value+action));return next}
  return action==='confirm'&&next.value===spec.targets[next.step]?success():
   {...next,mistakes:next.mistakes+1};
 }
 if(spec.kind==='tides'){
  if(Number.isInteger(action)&&action>=0&&action<=2){
   next.value^=(1<<action);return next;
  }
  return action==='confirm'&&next.value===spec.targets[next.step]?success():
   {...next,mistakes:next.mistakes+1};
 }
 if(spec.kind==='ice'){
  const [dx,dz]=({up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]})[action]||[0,0];
  if(!dx&&!dz)return next;
  let [x,z]=current.position;
  const blocked=new Set(spec.walls.map(key));
  while(x+dx>=0&&x+dx<spec.width&&z+dz>=0&&z+dz<spec.height&&!blocked.has(key([x+dx,z+dz]))){
    x+=dx;z+=dz;
  }
  next.position=[x,z];
  next.history.push(action);
  if(x===spec.goal[0]&&z===spec.goal[1])return success();
  return next;
 }
 if(spec.kind==='stars'||spec.kind==='runes'){
  if(!Number.isInteger(action)||action<0||action>=spec.symbols.length)return next;
  if(action===spec.answer[next.step]){next.history.push(action);return success()}
  return {...next,mistakes:next.mistakes+1};
 }
 return next;
}
export function adventureFinishTrial(save,zoneId){
 if(!adventureTrialForZone(zoneId)||(save.gymTrials||[]).includes(zoneId))return save;
 return {...save,gymTrials:[...(save.gymTrials||[]),zoneId],
  lastMessage:'Prova superata! La Palestra di '+zoneId+' e ora accessibile.'};
}
export function adventureDiscoverSecret(save,id){
 if(!id?.startsWith('secret:')||(save.secrets||[]).includes(id))return save;
 const zone=id.split(':')[1],q=adventureQuestForZone(zone);
 if(!q)return save;
 return {...save,secrets:[...(save.secrets||[]),id],
  lastMessage:q.spotName+' raccolto! Torna da '+q.giver+' per ricevere la ricompensa.'};
}
export function adventureQuestProgress(save,zoneId){
 const q=adventureQuestForZone(zoneId);
 if(!q)return null;
 const count=(save.secrets||[]).filter(id=>id.startsWith('secret:'+zoneId+':')).length;
 const completed=(save.questsDone||[]).includes(zoneId);
 return {quest:q,count,total:q.spots.length,completed};
}
export function adventureClaimQuest(save,zoneId){
 const p=adventureQuestProgress(save,zoneId);
 if(!p||p.count<p.total||p.completed)return save;
 return {...save,questsDone:[...(save.questsDone||[]),zoneId],
  coins:save.coins+p.quest.rewardCoins,
  potions:Math.min(99,(save.potions||0)+p.quest.rewardPotions),
  lastMessage:p.quest.completed+' +'+p.quest.rewardCoins+' monete e '+p.quest.rewardPotions+' Pozioni!'};
}
