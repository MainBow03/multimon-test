// Geometria condivisa del tabellone a due ali: ottavi/quarti/semifinali
// avanzano dai bordi verso la finale centrale senza cambiare i dati Firestore.
export const BRACKET_CARD_WIDTH=218;
export const BRACKET_COLUMN_WIDTH=267;
export const BRACKET_CENTER_WIDTH=304;
export const BRACKET_ROW_HEIGHT=168;

export function mirroredBracketLayout(matches=[]){
  const games=(Array.isArray(matches)?matches:[]).filter(m=>Number.isInteger(m.round)&&m.stage!=='bronze');
  const first=games.filter(m=>m.round===0).length;
  if(!first||![2,4,8,16].includes(first))return {rounds:0,items:[],paths:[],width:0,height:0,final:null,bronze:null};
  const rounds=Math.log2(first)+1;
  const wingColumns=rounds-1;
  const wingWidth=wingColumns*BRACKET_COLUMN_WIDTH;
  const width=wingWidth*2+BRACKET_CENTER_WIDTH;
  const leavesPerWing=first/2;
  const height=Math.max(360,leavesPerWing*BRACKET_ROW_HEIGHT);
  const cardHeight=136;
  const centerY=height/2;
  const items=[];
  const paths=[];
  for(let round=0;round<wingColumns;round++){
    const count=first/2**round;
    const half=count/2;
    const current=games.filter(m=>m.round===round);
    for(const m of current){
      const side=m.slot<half?'left':'right';
      const local=side==='left'?m.slot:m.slot-half;
      const y=(local+.5)*2**round*(height/leavesPerWing);
      const x=side==='left' ? round*BRACKET_COLUMN_WIDTH
        : width-round*BRACKET_COLUMN_WIDTH-BRACKET_CARD_WIDTH;
      items.push({id:m.id,match:m,round,side,x,y,top:y-cardHeight/2});
      const nextRound=round+1;
      const parent=games.find(candidate=>candidate.round===nextRound&&candidate.slot===Math.floor(m.slot/2));
      if(!parent)continue;
      const parentY=nextRound===rounds-1?centerY
        :((Math.floor(m.slot/2)%(first/2**(round+2)))+.5)*2**nextRound*(height/leavesPerWing);
      const fromX=side==='left'?x+BRACKET_CARD_WIDTH:x;
      const toX=nextRound===rounds-1
        ?(side==='left'?(width-264)/2:(width+264)/2)
        :(side==='left'?(round+1)*BRACKET_COLUMN_WIDTH:width-(round+1)*BRACKET_COLUMN_WIDTH);
      const midX=(fromX+toX)/2;
      paths.push({id:m.id+'-to-'+parent.id,side,won:!!m.winner,active:!m.winner&&!!m.sideA&&!!m.sideB,
        d:`M ${fromX} ${y} H ${midX} V ${parentY} H ${toX}`});
    }
  }
  const final=games.find(m=>m.stage==='final')||games.find(m=>m.round===rounds-1)||null;
  const bronze=(Array.isArray(matches)?matches:[]).find(m=>m.stage==='bronze')||null;
  return {rounds,first,items,paths,width,height,final,bronze,centerY,centerX:(width-264)/2};
}

export function bracketParticipantRoster(entrant,people=[]){
  if(!entrant)return [];
  const byId=new Map(people.map(p=>[p.uid||p.id,p]));
  return (entrant.members||[]).map(id=>byId.get(id)).filter(Boolean);
}

export function tournamentMatchState(match,currentId){
  if(match?.winner)return 'complete';
  if(match?.id===currentId)return 'live';
  if(match?.sideA&&match?.sideB)return 'ready';
  return 'pending';
}
