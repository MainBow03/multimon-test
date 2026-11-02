// Legione dei Caduti: una sola Copia Perfetta, durata tre turni.
// Le copie non producono cariche, e il contatore resta personale a Echomax.
export function collectEchoSoul(teams,field,defeated,defeatedPlayer,events){
  if(!defeated || defeated.isEchoCopy || defeated.isSummonOnly || defeated.id==='echomax')return false;
  let summoned=false;
  for(const [player,roster] of Object.entries(teams||{})){
    if(player===defeatedPlayer || !Array.isArray(roster))continue;
    roster.forEach((echo,echoIdx)=>{
      if(echo?.id!=='echomax' || echo.hp<=0 || echo.passive?.type!=='soul_legion')return;
      echo.echoSoulCharges=Math.min(3,(echo.echoSoulCharges||0)+1);
      events.push({type:'text',text:`💠 ${echo.name} assorbe l'eco di ${defeated.name}! Cariche Anima: ${echo.echoSoulCharges}/3.`,isPassive:true,passiveChar:echo.name,passiveName:echo.passive.name});
      if(echo.echoSoulCharges<3 || roster.some(c=>c?.isEchoCopy&&c.hp>0))return;
      echo.echoSoulCharges=0;
      const copy={
        ...JSON.parse(JSON.stringify(defeated)),
        name:`Copia Perfetta di ${defeated.name}`,
        id:`echo_copy_${defeated.id}`,
        hp:Math.max(1,Math.round(defeated.maxHp||100)),
        maxHp:Math.max(1,Math.round(defeated.maxHp||100)),
        isSummonOnly:true,isEchoCopy:true,echoTurns:3,echoJustSummoned:true,echoFaintProcessed:false,
        statuses:[],passive:null,consecutiveProtect:0,
        imageFilter:'sepia(0.6) hue-rotate(240deg) saturate(2) drop-shadow(0 0 12px #a855f7)'
      };
      const idx=roster.length;
      roster.push(copy);
      field[player]??=[];
      field[player].push(idx);
      events.push({type:'summon',player,fieldIdx:idx,newChar:JSON.parse(JSON.stringify(copy)),
        text:`👻 ${echo.name} evoca una Copia Perfetta di ${defeated.name}! Combatterà per tre turni.`,
        isPassive:true,passiveChar:echo.name,passiveName:echo.passive.name});
      summoned=true;
    });
  }
  return summoned;
}

export function expireEchoCopies(teams,field,events){
  for(const [player,roster] of Object.entries(teams||{})){
    if(!Array.isArray(roster)||!Array.isArray(field[player]))continue;
    for(let i=field[player].length-1;i>=0;i--){
      const idx=field[player][i];
      const copy=roster[idx];
      if(!copy?.isEchoCopy)continue;
      if(copy.hp<=0){field[player].splice(i,1);events.push({type:'remove',player,pos:i});continue;}
      if(copy.echoJustSummoned){copy.echoJustSummoned=false;continue;}
      copy.echoTurns=Math.max(0,(copy.echoTurns??3)-1);
      if(copy.echoTurns===0){
        copy.hp=0;
        field[player].splice(i,1);
        events.push({type:'text',text:`🌫️ ${copy.name} si dissolve: i suoi tre turni sono terminati.`});
        events.push({type:'remove',player,pos:i});
      }
    }
  }
}
