// Venti CPU originali in due serie da dieci, stilizzate cartoon (non anime).
// Le immagini sono asset del gioco: non dipendono da DiceBear o da servizi esterni.
// Quando aggiungiamo i prossimi gruppi, possiamo estendere questa lista.
export const CPU_BOT_PROFILES=Object.freeze([
 {id:'nilo',name:'Nilo',gender:'male',description:'Inventore con occhialoni e attrezzi'},
 {id:'brio',name:'Brio',gender:'male',description:'Atleta elettrizzante e ottimista'},
 {id:'elio',name:'Elio',gender:'male',description:'Giardiniere gentile con occhiali rotondi'},
 {id:'rook',name:'Rook',gender:'male',description:'Skater con giacca viola'},
 {id:'luma',name:'Luma',gender:'female',description:'Meccanica dai capelli turchesi'},
 {id:'mirea',name:'Mirea',gender:'female',description:'Pasticciera sempre allegra'},
 {id:'dalia',name:'Dalia',gender:'female',description:'Esploratrice dal cappello da avventura'},
 {id:'vela',name:'Vela',gender:'female',description:'DJ dai capelli argento'},
 {id:'sol',name:'Sol',gender:'nonbinary',description:'Artista dai capelli verde menta'},
 {id:'kiri',name:'Kiri',gender:'nonbinary',description:'Gamer-barista dai capelli bicolore'},
 // Seconda serie: 5 ragazzi e 5 ragazze, tutti con ritratti cartoon dedicati.
 {id:'timo',name:'Timo',gender:'male',description:'Inventore di pozioni luminose con occhialoni e salopette gialla'},
 {id:'berto',name:'Berto',gender:'male',description:'Costruttore di aquiloni dai capelli rossi e giacca azzurra'},
 {id:'paco',name:'Paco',gender:'male',description:'Percussionista allegro con cappello verde e bacchette'},
 {id:'quill',name:'Quill',gender:'male',description:'Cartografo con treccine, occhiali e una bussola'},
 {id:'otti',name:'Otti',gender:'male',description:'Prestigiatore buffo dai capelli viola e papillon a pois'},
 {id:'pippa',name:'Pippa',gender:'female',description:'Osservatrice di uccelli con trecce e binocolo rosa'},
 {id:'rina',name:'Rina',gender:'female',description:'Artigiana di origami con caschetto nero e ciocche blu'},
 {id:'fibi',name:'Fibi',gender:'female',description:'Creatrice di giocattoli con capelli biondi e salopette rosa'},
 {id:'zaza',name:'Zaza',gender:'female',description:'Pattinatrice con casco azzurro e stelle dorate'},
 {id:'cleo',name:'Cleo',gender:'female',description:'Meteorologa con capelli verdi e ombrello arcobaleno'}
]);

export const cpuBotDisplayName=profile=>'CPU '+profile.name;

// Base URL di Vite: funziona tanto su GitHub Pages (/multimon-test/)
// quanto sul server locale (/), senza appesantire Firebase con immagini base64.
export const cpuBotAvatarUrl=profile=>{
 const base=import.meta.env?.BASE_URL||'/';
 return base.replace(/\/?$/,'/')+'cpu-bots/'+profile.id+'.webp';
};

export const cpuBotByName=name=>
 CPU_BOT_PROFILES.find(p=>cpuBotDisplayName(p)===name)||null;

export function selectCpuBotProfile(room,random=Math.random){
 const used=new Set(Object.values(room?.players||{}).filter(Boolean));
 const free=CPU_BOT_PROFILES.filter(profile=>!used.has(cpuBotDisplayName(profile)));
 const pool=free.length?free:CPU_BOT_PROFILES;
 // Preferisce sempre un personaggio non ancora nella stanza.
 return pool[Math.min(pool.length-1,Math.max(0,Math.floor(random()*pool.length)))];
}
