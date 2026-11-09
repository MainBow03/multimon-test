// Audit statico di un roster: indicatori per DECIDERE cosa testare, mai
// simulazioni inventate o nerf automatici. Usa solo dati effettivi del gioco.
const regular=char=>char?.id&&!char.isSummonOnly&&!char.isSecretUnlock&&
 !char.isCampaignMonster&&!char.fusionOf&&Array.isArray(char.moves);
const int=(value)=>Number.isFinite(Number(value))?Number(value):0;
const score=char=>int(char.hp??char.maxHp)+int(char.atk)+int(char.def)+int(char.spd);
const chance=(value)=>{
 const n=Number(value);
 return Number.isFinite(n)?(n>1?n/100:n):0;
};
const CONTROL_TYPES=new Set(['Stordito','Congelato','Addormentato','Confuso','Incantato','Infatuato','Assiderato']);
const stats=char=>({hp:int(char.hp??char.maxHp),atk:int(char.atk),def:int(char.def),spd:int(char.spd)});
const rank=arr=>arr.sort((a,b)=>b.total-a.total||a.name.localeCompare(b.name,'it'));

export function analyzeBalanceData(characters=[]){
 const roster=characters.filter(regular);
 const ids=new Set(),duplicateIds=new Set();
 const missingMoveNames=[],missingImages=[],unusualStatusMoves=[];
 const totals=roster.map(char=>({
  id:char.id,name:char.name||char.id,total:score(char),
  ...stats(char),passive:Boolean(char.passive)
 }));
 const sorted=rank(totals);
 const medianValues=sorted.map(char=>char.total).sort((a,b)=>a-b);
 const median=medianValues.length?medianValues[Math.floor((medianValues.length-1)/2)]:0;
 for(const char of roster){
  if(ids.has(char.id))duplicateIds.add(char.id);else ids.add(char.id);
  if(typeof char.img!=='string'||!char.img.trim())missingImages.push(char.name||char.id);
  for(const [i,move] of (char.moves||[]).entries()){
   if(!move||!move.name){
    missingMoveNames.push({character:char.name||char.id,slot:i+1});continue;
   }
   const status=move.statusEffect;
   if(CONTROL_TYPES.has(status?.type)&&chance(status.chance)>=.4){
    unusualStatusMoves.push({character:char.name||char.id,move:move.name,
     status:status.type,chance:Math.round(chance(status.chance)*100)});
   }
  }
 }
 return {
  playable:roster.length,medianRawTotal:median,
  noPassive:roster.filter(char=>!char.passive).map(char=>({id:char.id,name:char.name||char.id})),
  rawHigh:sorted.filter(char=>char.total>=median+45).slice(0,12),
  rawLow:[...sorted].reverse().filter(char=>char.total<=median-45).slice(0,12),
  largeControlChances:unusualStatusMoves.sort((a,b)=>b.chance-a.chance).slice(0,25),
  duplicateIds:[...duplicateIds].sort(),
  missingMoveNames,missingImages,
  disclaimer:'Indicatori statici: non sono vittorie simulate né prove di squilibrio. Il danno reale dipende da tipo, passive, mosse, composizione squadra e modalità.'
 };
}

export function formatBalanceAudit(report){
 const lines=[
  'MULTIMON — AUDIT DI BILANCIAMENTO (SOLO INDICATORI)',
  'Multimon giocabili: '+report.playable,
  'Mediana somma PS+ATT+DIF+VEL: '+report.medianRawTotal,
  'Personaggi senza passiva: '+report.noPassive.length,
  'Estremi alti (da verificare): '+report.rawHigh.map(x=>x.name+' ['+x.total+']').join(', '),
  'Estremi bassi (da verificare): '+report.rawLow.map(x=>x.name+' ['+x.total+']').join(', '),
  'Mosse con controllo >=40%: '+report.largeControlChances.map(x=>x.character+' / '+x.move+' ('+x.chance+'%)').join(', '),
  'ID duplicati: '+(report.duplicateIds.join(', ')||'nessuno'),
  'Mosse senza nome: '+report.missingMoveNames.length,
  'PNG mancanti come URL: '+report.missingImages.length,
  report.disclaimer
 ];
 return lines.join('\n');
}
