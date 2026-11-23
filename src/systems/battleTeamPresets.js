import {canEquipHeldItem} from './heldEquipment.js';

// Tre formazioni INDIPENDENTI per ogni dimensione di squadra (1-10).
// Vengono salvate nel profilo personale, non nel documento della stanza.
export const BATTLE_TEAM_PRESET_SLOTS=3;
export const BATTLE_TEAM_MIN_SIZE=1;
export const BATTLE_TEAM_MAX_SIZE=10;
const asSize=value=>Number.isInteger(Number(value))?Number(value):NaN;
export const validBattleTeamSize=size=>{
 const n=asSize(size);
 return n>=BATTLE_TEAM_MIN_SIZE&&n<=BATTLE_TEAM_MAX_SIZE;
};
export const battleTeamOwnerKey=owner=>
 String(owner||'Giocatore').trim().toLocaleLowerCase('it-IT').slice(0,64)||'giocatore';
export function battleTeamSlots(profile,owner,size){
 if(!validBattleTeamSize(size))return [null,null,null];
 const found=profile?.battleTeamPresets?.[battleTeamOwnerKey(owner)]?.[String(asSize(size))];
 return Array.from({length:BATTLE_TEAM_PRESET_SLOTS},(_,i)=>{
  const preset=Array.isArray(found)?found[i]:null;
  return preset&&Array.isArray(preset.members)?preset:null;
 });
}
const memberInfo=c=>{
 if(!c||typeof c.id!=='string'||!c.id.trim())throw Error('Multimon non valido nella squadra.');
 return {
  id:c.id.trim().slice(0,80),
  ...(typeof c.heldItem==='string'&&c.heldItem?{heldItem:c.heldItem.slice(0,80)}:{}),
  ...(typeof c.zodiacSpiritId==='string'&&c.zodiacSpiritId?
   {zodiacSpiritId:c.zodiacSpiritId.slice(0,80)}:{})
 };
};
const validSlot=slot=>Number.isInteger(slot)&&slot>=0&&slot<BATTLE_TEAM_PRESET_SLOTS;
export function saveBattleTeamPreset(profile,{owner,size,slot,name,members}={}){
 if(!validBattleTeamSize(size))return {ok:false,reason:'La squadra deve avere da 1 a 10 Multimon.'};
 if(!validSlot(slot))return {ok:false,reason:'Puoi salvare soltanto tre squadre per ogni numero di Multimon.'};
 if(!Array.isArray(members)||members.length!==asSize(size))
  return {ok:false,reason:'Completa la squadra da '+asSize(size)+' Multimon prima di salvarla.'};
 let entries;
 try{entries=members.map(memberInfo);}
 catch(error){return {ok:false,reason:error.message};}
 if(new Set(entries.map(c=>c.id)).size!==entries.length)
  return {ok:false,reason:'Non puoi mettere lo stesso Multimon due volte nella stessa formazione.'};
 const key=battleTeamOwnerKey(owner),sizeKey=String(asSize(size));
 const all=profile?.battleTeamPresets||{},forOwner=all[key]||{};
 const slots=battleTeamSlots(profile,owner,size);
 const label=String(name||'').trim().slice(0,32)||'Squadra '+(slot+1);
 slots[slot]={name:label,members:entries,savedAt:Date.now()};
 return {ok:true,profile:{...profile,
  battleTeamPresets:{...all,[key]:{...forOwner,[sizeKey]:slots}}}};
}
export function deleteBattleTeamPreset(profile,{owner,size,slot}={}){
 if(!validBattleTeamSize(size)||!validSlot(slot))
  return {ok:false,reason:'Slot della squadra non valido.'};
 const key=battleTeamOwnerKey(owner),sizeKey=String(asSize(size));
 const all=profile?.battleTeamPresets||{},forOwner=all[key]||{};
 const slots=battleTeamSlots(profile,owner,size);
 slots[slot]=null;
 return {ok:true,profile:{...profile,
  battleTeamPresets:{...all,[key]:{...forOwner,[sizeKey]:slots}}}};
}
export const battleTeamPresetsAllowed=room=>!!room&&
 !room.isRoguelikeCoop&&room.gameMode!=='ascension'&&
 !room.settings?.sharedDraft&&!room.settings?.draftBattle&&!room.settings?.rentalMode;

/**
 * Non fidarsi del salvataggio: un personaggio può essere diventato
 * bannato, bloccato o non disponibile quando la stanza viene avviata.
 * Si ricostruiscono sempre le istanze di battaglia dal roster ATTUALE.
 */
export function loadBattleTeamPreset(preset,available,expectedSize,inventory={}){
 if(!validBattleTeamSize(expectedSize)||!preset||
  !Array.isArray(preset.members)||preset.members.length!==asSize(expectedSize))
  return {ok:false,reason:'Questa squadra non corrisponde al numero di Multimon richiesto.'};
 const choices=new Map((available||[]).map(c=>[c.id,c]));
 const ids=preset.members.map(m=>m?.id);
 if(new Set(ids).size!==ids.length)
  return {ok:false,reason:'La formazione contiene Multimon duplicati.'};
 const invalid=ids.filter(id=>!choices.has(id));
 if(invalid.length)
  return {ok:false,reason:'Questa formazione contiene '+invalid.length+
   ' Multimon non disponibili, bloccati o bannati. Modificala prima di usarla.'};
 const team=preset.members.map(m=>{
  const c=choices.get(m.id);
  return {...c,statuses:[],consecutiveProtect:0,baseAtk:c.atk,baseDef:c.def,baseSpd:c.spd,
   moves:(c.moves||[]).filter(Boolean).map(move=>({
    ...move,remainingUses:move.maxUses!==undefined?move.maxUses:null
   })),
   ...(m.zodiacSpiritId?{zodiacSpiritId:m.zodiacSpiritId}:{})};
 });
 let unequipped=0;
 for(let i=0;i<team.length;i++){
  const item=preset.members[i].heldItem;
  if(!item)continue;
  if(canEquipHeldItem(team,i,item,inventory))team[i].heldItem=item;
  else unequipped++;
 }
 return {ok:true,team,unequipped};
}
