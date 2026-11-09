import {CHARACTERS,FUSION_CHARACTERS} from '../data/gameData.js';
import {createUltimonShowcase} from './ultimonSystem.js';

// Un ban per ciascun umano. Si svolge PRIMA del draft: nessuno deve
// perdere un personaggio già scelto e i bot rispettano gli stessi divieti.
const ROLES=['p1','p2','p3','p4','p5','p6','p7','p8'];
const shuffled=(items,random=Math.random)=>{
 const a=[...items];
 for(let i=a.length-1;i>0;i--){
  const j=Math.max(0,Math.min(i,Math.floor(random()*(i+1))));
  [a[i],a[j]]=[a[j],a[i]];
 }
 return a;
};

export const ultimonBanRoster=room=>
 (room?.settings?.fusionMode?FUSION_CHARACTERS:CHARACTERS)
  .filter(c=>c?.id&&!c.isSummonOnly&&!c.isSecretUnlock&&!c.isCampaignMonster);
export const ultimonBanRoles=room=>ROLES.slice(0,Math.min(8,Math.max(4,Number(room?.settings?.maxPlayers)||4)))
 .filter(p=>room?.players?.[p]&&!room?.isBot?.[p]);
export const ultimonBannedIds=room=>[...new Set(Object.values(room?.ultimonBans?.votes||{})
 .filter(id=>typeof id==='string'&&id.length>0))];
export const isUltimonBanned=(room,id)=>room?.gameMode==='ultimon' &&ultimonBannedIds(room).includes(id);
export const allUltimonBansReady=room=>ultimonBanRoles(room).every(p=>!!room?.ultimonBans?.votes?.[p]);

export function ultimonBanPatch(room,role,charId){
 if(room?.gameMode!=='ultimon'||room.status!=='ultimon_ban')
  throw new Error('La fase di ban non è attiva.');
 if(!ultimonBanRoles(room).includes(role))throw new Error('Solo i giocatori umani possono bannare.');
 if(room.ultimonBans?.votes?.[role])throw new Error('Hai già confermato il tuo ban.');
 const candidates=ultimonBanRoster(room);
 const target=candidates.find(c=>c.id===charId);
 if(!target)throw new Error('Questo Multimon non può essere bannato.');
 if(ultimonBannedIds(room).includes(charId))throw new Error('Un altro giocatore ha già bannato questo Multimon.');
 return {['ultimonBans.votes.'+role]:charId};
}

const fighter=c=>({
 ...c,statuses:[],consecutiveProtect:0,
 baseAtk:c.atk,baseDef:c.def,baseSpd:c.spd,
 moves:(c.moves||[]).filter(Boolean).map(m=>({...m,remainingUses:m.maxUses??null}))
});

// Riprende le stesse quattro possibilità di scelta della lobby originale:
// normale, Draft Battle, Shared Draft e Nolo, ma DOPO aver escluso i ban.
export function beginUltimonDraftAfterBans(room,random=Math.random){
 if(room?.gameMode!=='ultimon'||room.status!=='ultimon_ban')
  throw new Error('Questa non è la fase dei ban.');
 if(!allUltimonBansReady(room))throw new Error('Attendi che tutti gli umani abbiano bannato un Multimon.');
 const forbidden=new Set(ultimonBannedIds(room));
 const pool=ultimonBanRoster(room).filter(c=>!forbidden.has(c.id));
 const roles=ROLES.slice(0,Math.min(8,Math.max(4,Number(room.settings.maxPlayers)||4)))
  .filter(p=>room.players?.[p]);
 const size=Math.max(1,Number(room.settings.teamSize)||4);
 if(pool.length<size)throw new Error('Troppi Multimon bannati: impossibile creare una squadra completa.');
 const draft={...(room.draft||{})},choices={...(room.draftChoices||{})},rerolls={...(room.draftRerolls||{})};
 for(const role of roles){draft[role]=[];choices[role]=[];rerolls[role]=2;}
 if(room.settings.rentalMode){
  for(const role of roles)draft[role]=shuffled(pool,random).slice(0,size).map(fighter);
  // Una partita in Nolo non ha schermata draft; entra direttamente nel showcase.
  return createUltimonShowcase({...room,draft},draft);
 }
 if(room.settings.sharedDraft){
  const order=shuffled(roles,random);
  const sequence=Array.from({length:size},()=>order).flat();
  if(pool.length<sequence.length)throw new Error('Il pool non contiene abbastanza Multimon per il draft condiviso.');
  const sharedDraftPool=shuffled(pool,random).slice(0,sequence.length)
   .map(char=>({char,pickedBy:null}));
  return {status:'drafting',phaseStartedAt:Date.now(),draft,draftChoices:choices,
   draftRerolls:rerolls,sharedDraftPool,draftSequence:sequence,currentDraftTurn:0};
 }
 for(const role of roles){
  if(room.isBot?.[role])draft[role]=shuffled(pool,random).slice(0,size).map(fighter);
  else if(room.settings.draftBattle)choices[role]=shuffled(pool,random).slice(0,3);
 }
 return {status:'drafting',phaseStartedAt:Date.now(),
  draft,draftChoices:choices,draftRerolls:rerolls,sharedDraftPool:[],draftSequence:[],currentDraftTurn:0};
}
