export const MOVES_DB = {
  'Raggio dei Caduti': {name:'Raggio dei Caduti',type:'Spettro',power:100,accuracy:0.8,desc:'Raggio spettrale potentissimo su un singolo bersaglio. Precisione 80%.'},
  'Le Tenebre vi Avvolgono': {name:'Le Tenebre vi Avvolgono',type:'Buio',power:70,targetCount:24,desc:'Le tenebre travolgono tutti i bersagli avversari in campo.'},
  'Vieni a Me, Anima': {name:'Vieni a Me, Anima',type:'Spettro',power:0,targetStatDebuff:{def:0.7,spd:0.7},desc:'Indebolisce Difesa e Velocità del bersaglio del 30%.'},
  'Dominatore del Multiverso': {name:'Dominatore del Multiverso',type:'Spettro',power:150,recharge:true,echoRecoilConfusion:true,desc:'Colpo devastante a bersaglio singolo. Deve ricaricare; fuori dal raid confonde anche Echomax.'},
          // Kirby · copia al primo colpo una mossa di ciascuno dei primi 2 nemici distinti.
          'Stella Sparata': { name:'Stella Sparata',type:'Magico',power:85,statusEffect:{type:'Stordito',chance:0.2,turns:1},desc:'Lancia una stella luminosa: potenza 85, 20% di stordire il bersaglio.' },
          'Super Risucchio': { name:'Super Risucchio',type:'Magico',power:70,drain:0.25,desc:'Potenza 70. Kirby recupera il 25% dei danni inflitti.' },
          'Calcio Stellare': { name:'Calcio Stellare',type:'Folletto',power:95,priority:1,desc:'Calcio rapido: potenza 95, priorità +1.' },
          'Stella Warp': { name:'Stella Warp',type:'Magico',power:0,target:'self',statBuff:{spd:2.0},maxUses:2,strictUses:true,desc:'Kirby prende la sua stella e aumenta la Velocità di due livelli (+100%), fino al limite dei potenziamenti. (2 utilizzi)' },
          // Danny Phantom / T.U.F.F. Puppy: Ember e Kitty
          'Assolo Spettrale': { name:'Assolo Spettrale',type:'Suono',power:90,accuracy:1,statusEffect:{type:'Confuso',chance:0.2,turns:3},desc:'Potenza 90. Ha il 20% di confondere.' },
          'Onda Fantasma': { name:'Onda Fantasma',type:'Spettro',power:85,accuracy:1,desc:'Onda spettrale, potenza 85.' },
          'Ipnosi Rock': { name:'Ipnosi Rock',type:'Suono',power:0,accuracy:1,statusEffect:{type:'Incantato',chance:0.5,turns:10},desc:'50% di incantare un avversario per 10 turni; un nemico incantato infligge il 25% di danni in meno.' },
          'Accordo Distruttivo': { name:'Accordo Distruttivo',type:'Suono',power:60,accuracy:0.8,scalingEnemyCount:true,desc:'Potenza 60 con un bersaglio avversario in campo; 80 con 2, 100 con 3 e 120 con 4 o più. Precisione 80%.' },
          'Passo Felino': { name:'Passo Felino',type:'Folletto',power:75,accuracy:1,priority:1,contact:true,desc:'Potenza 75, precisione 100, priorità +1.' },
          'Infiltrazione': { name:'Infiltrazione',type:'Buio',power:90,accuracy:1,ignoreShields:true,ignoreTaunt:true,desc:'Potenza 90: ignora scudi, protezioni e provocazioni.' },
          'Taser T.U.F.F.': { name:'Taser T.U.F.F.',type:'Buio',power:80,accuracy:1,bonusIfSlowed:120,statusEffect:{type:'Elettrizzato',chance:0.3},desc:'Potenza 80, oppure 120 contro bersagli con Velocità ridotta; 30% di paralizzare.' },
          'Trappola Segreta': { name:'Trappola Segreta',type:'Buio',power:0,accuracy:1,target:'self',placeStickyTrap:true,desc:'Posiziona sul campo avversario una trappola appiccicosa permanente: chi entra in campo perde il 10% dei PS massimi.' },
          'Raggio Solare': { name:'Raggio Solare',type:'Luce',power:90,accuracy:1,statusEffect:{type:'Accecato',chance:0.20,turns:3},desc:'Potenza 90, precisione 100. Ha il 20% di accecare il bersaglio (precisione -20% per 3 turni).' },
          'Pugno Tattico': { name:'Pugno Tattico',type:'Lotta',power:85,accuracy:1,contact:true,bonusAgainstFaster:1.5,desc:'Potenza 85. Se il bersaglio è più veloce, infligge il 50% di danno extra.' },
          'Impatto Kryptoniano': { name:'Impatto Kryptoniano',type:'Lotta',power:120,accuracy:0.7,contact:true,desc:'Potenza 120, precisione 70.' },
          'Volo Supersonico (Superboy)': { name:'Volo Supersonico',type:'Aria',power:80,accuracy:1,selfStatBuff:{spd:1.2},desc:'Potenza 80, dopo il colpo aumenta la Velocità del 20%.' },
          // NUOVI CAMPIONI — Orso Bianco, Bugs Bunny, Daffy Duck e Diamante
          'Ascia di Ghiaccio': { name:'Ascia di Ghiaccio',type:'Ghiaccio',power:85,accuracy:1,statusEffect:{type:'Congelato',chance:0.15},desc:'Potenza 85, precisione 100. 15% di congelare.' },
          'Carica Valanga': { name:'Carica Valanga',type:'Roccia',power:100,accuracy:0.95,contact:true,desc:'Potenza 100, precisione 95.' },
          'Tecnica dell’Orso': { name:'Tecnica dell’Orso',type:'Ghiaccio',power:0,target:'self',statBuff:{atk:1.5,def:1.5},heal:0.10,desc:'Aumenta Attacco e Difesa di uno stadio e recupera il 10% dei PS massimi.' },
          'Furia dell’Artico': { name:'Furia dell’Artico',type:'Ghiaccio',power:140,accuracy:1,targetCount:4,snowstormTurns:5,desc:'Colpisce tutti i nemici e provoca 5 turni di tempesta di neve: -2% PS per turno a chi non è Ghiaccio, Roccia o Robot.' },

          'Carota Esplosiva': { name:'Carota Esplosiva',type:'Fuoco',power:75,accuracy:1,statusEffect:{type:'Scottato',chance:0.1},desc:'Potenza 75. Ha il 10% di scottare.' },
          'Dentro la Tana': { name:'Dentro la Tana',type:'Normale',power:0,target:'self',maxUses:2,strictUses:true,evasionGain:0.2,desc:'Aumenta l’elusione di Bugs del 20% contro gli attacchi diretti a lui, per un massimo di due usi.' },
          'Spuntino Rinvigorante': { name:'Spuntino Rinvigorante',type:'Normale',power:0,target:'self',heal:0.45,desc:'Recupera il 45% dei PS massimi.' },
          'Battiterra': { name:'Battiterra',type:'Terra',power:85,targetCount:4,targetStatDebuff:{spd:0.9},desc:'Potenza 85 su tutti i nemici e riduce del 10% la loro Velocità.' },

          'Tuffo Disperato': { name:'Tuffo Disperato',type:'Acqua',power:110,accuracy:0.75,contact:true,desc:'Potenza 110, precisione 75.' },
          'Parlantina Scocciante': { name:'Parlantina Scocciante',type:'Buio',power:0,targetStatDebuff:{def:0.7},statusEffect:{type:'Confuso',chance:0.4,turns:3},desc:'Riduce del 30% la Difesa di un nemico e ha il 40% di confonderlo.' },
          'Montante di Daffy': { name:'Montante di Daffy',type:'Lotta',power:85,accuracy:1,contact:true,desc:'Potenza 85.' },
          'Pistola ad Acqua': { name:'Pistola ad Acqua',type:'Acqua',power:70,accuracy:1,desc:'Potenza 70.' },

          'Schegge Diamantine': { name:'Schegge Diamantine',type:'Cristallo',power:80,accuracy:1,targetCount:2,desc:'Potenza 80, precisione 100. Colpisce fino a 2 bersagli.' },
          'Muro Cristallino': { name:'Muro Cristallino',type:'Cristallo',power:0,target:'self',statBuff:{def:1.5,spDef:1.5},crystalShieldPercent:0.2,desc:'Aumenta Difesa e Difesa Speciale di uno stadio. Crea uno scudo da 20% PS massimi.' },
          'Rifrazione di Diamante': { name:'Rifrazione di Diamante',type:'Cristallo',power:0,target:'self',refractionTurns:3,desc:'Per 3 turni dimezza il primo attacco subito in ciascun turno e aumenta del 20% le mosse Cristallo.' },
          'Schiacciata Pesante': { name:'Schiacciata Pesante',type:'Normale',power:95,accuracy:0.9,contact:true,statusEffect:{type:'Elettrizzato',chance:0.1},desc:'Potenza 95, precisione 90. 10% di paralizzare.' },
          'Trasfigurazione Oziosa': { name: 'Trasfigurazione Oziosa', type: 'Spettro', power: 0, accuracy: 1, target: 'self', transformMahito: true, strictUses: true, maxUses: 1, desc: 'Mahito cambia forma e aumenta Attacco e Attacco Speciale di uno stadio (+50%). Una volta per battaglia.' },
          'Tocco dell’Anima': { name: 'Tocco dell’Anima', type: 'Spettro', power: 95, accuracy: 1, contact: true, desc: 'Potenza 95; danni doppi contro bersagli con Anima Distorta.' },
          'Polimorfismo Mostruoso': { name: 'Polimorfismo Mostruoso', type: 'Folletto', power: 75, special: true, targetCount: 4, statusEffect: { type: 'Confuso', chance: 0.1, turns: 3 }, desc: 'Colpisce tutti i nemici. Ogni bersaglio ha il 10% di probabilità di essere confuso.' },
          'Forma Verdetto Istantaneo': { name: 'Forma Verdetto Istantaneo', type: 'Spettro', power: 120, maxUses: 1, contact: true, selfStatBuff: { spd: 1.5 }, desc: 'Mossa suprema: potenza 120 e Velocità +50%. Un solo utilizzo per battaglia.' },
          'Azione': { name: 'Azione', type: 'Normale', power: 40, desc: 'Un attacco fisico rapido e diretto.' },
          'Pugno': { name: 'Pugno Duro', type: 'Lotta', power: 60, desc: 'Sferra un pugno devastante al bersaglio.' },
          'Lanciafiamme': { name: 'Lanciafiamme', type: 'Fuoco', power: 90, statusEffect: { type: 'Scottato', chance: 0.15 }, desc: "Scotta il bersaglio con un'intensa fiammata. 15% di probabilità di scottare." },
          'Pistolacqua': { name: 'Pistolacqua', type: 'Acqua', power: 40, desc: "Spara un getto d'acqua ad alta pressione." },
          'Foglielama': { name: 'Foglielama', type: 'Erba', power: 55, desc: 'Taglia il bersaglio con foglie affilate come rasoi.' },
          'Tifone': { name: 'Tifone', type: 'Aria', power: 110, accuracy: 0.80, desc: 'Evoca un potente vortice di vento avvolgente. Alta potenza ma precisione 80%.' },
          'Sassata': { name: 'Sassata', type: 'Roccia', power: 50, desc: 'Scaglia un grosso masso contro il nemico.' },
          'Geloraggio': { name: 'Geloraggio', type: 'Ghiaccio', power: 90, desc: 'Colpisce con un raggio di energia gelida.' },
          'Raggio Laser': { name: 'Raggio Laser', type: 'Robot', power: 80, desc: 'Spara un fascio di luce altamente concentrato.' },
          'Dragartigli': { name: 'Dragartigli', type: 'Drago', power: 80, desc: 'Fende il nemico con artigli carichi di pura energia.' },
          'Magia Pura': { name: 'Magia Pura', type: 'Magico', power: 70, desc: 'Un attacco basato su concentrazione magica grezza.' },
          'Fangobomba': { name: 'Fangobomba', type: 'Veleno', power: 80, desc: 'Lancia una bomba di fango tossico esplosiva.' },
          'Morsico': { name: 'Morsico Insetto', type: 'Insetto', power: 60, desc: 'Morde il bersaglio con zanne affilate e pungenti.' },
          'Fulmine': { name: 'Fulmine', type: 'Elettro', power: 90, desc: 'Scaglia una potente scarica elettrica dal cielo.' },
          'Idropompa': { name: 'Idropompa', type: 'Acqua', power: 110, desc: "Travolge il bersaglio con un'enorme colonna d'acqua." },
          'Terremoto': { name: 'Terremoto', type: 'Terra', power: 100, desc: 'Scuote la terra violentemente, infliggendo ingenti danni.' },
          
          'Riposo': { name: 'Riposo', type: 'Normale', power: 0, heal: 1.0, removeNegativeStatuses: true, statusEffect: { type: 'Addormentato', turns: 2 }, maxUses: 2, target: 'self', desc: 'Si addormenta per recuperare il 100% dei PS e curare gli status negativi. (Addormentato 2 turni)' },
          'Doppia Sberla': { name: 'Doppia Sberla', type: 'Normale', power: 25, multiHit: { min: 2, max: 5 }, desc: 'Colpisce il bersaglio in rapida successione da 2 a 5 volte di fila.' },
          'Corposcontro': { name: 'Corposcontro', type: 'Normale', power: 85, statusEffect: { type: 'Elettrizzato', chance: 0.15 }, desc: 'Si lancia con tutto il peso e la mole sul nemico. 15% di probabilità di paralizzare.' },
          'Tuonopugno': { name: 'Tuonopugno', type: 'Elettro', power: 75, desc: 'Sferra un pugno caricato di pura elettricità statica.' },
          
          'Presa Militare': { name: 'Presa Militare', type: 'Lotta', power: 50, statusEffect: { type: 'Elettrizzato', chance: 0.3 }, desc: 'Una presa tecnica corpo a corpo. Ha il 30% di probabilità di paralizzare.' },
          'Kit Medico': { name: 'Kit Medico', type: 'Normale', power: 0, heal: 0.5, maxUses: 2, target: 'self', desc: 'Usa cure di primo soccorso per recuperare il 50% dei PS massimi.' },
          'Assalto Frontale': { name: 'Assalto Frontale', type: 'Lotta', power: 70, desc: 'Carica il nemico con una potente e inarrestabile raffica di colpi.' },
          'Tiro Rapido': { name: 'Tiro Rapido', type: 'Normale', power: 90, accuracy: 0.90, desc: 'Estrae un\'arma e attacca velocemente. Ha il 10% di probabilità di mancare.' },

          'Doruzonisu': { name: 'Doruzonisu', type: 'Oscuro', power: 60, targetCount: 2, desc: 'Colpisce fino a due bersagli contemporaneamente con dardi oscuri.' },
          'Gigano Zonisu': { name: 'Gigano Zonisu', type: 'Oscuro', power: 75, desc: 'Scaglia una potente onda concentrata di energia oscura.' },
          'Dioga zonisudon': { name: 'Dioga zonisudon', type: 'Magico', power: 90, maxUses: 3, desc: 'Un potentissimo e devastante raggio magico. Utilizzabile 3 volte.' },
          'Zorushirudo': { name: 'Zorushirudo', type: 'Magico', power: 0, target: 'self', maxUses: 5, priority: 5, isProtect: true, desc: 'Si protegge dagli attacchi. Se usato di fila, la probabilità di successo si dimezza.' },
          
          'Fiamma del Drago': { name: 'Fiamma del Drago', type: 'Fuoco', power: 60, desc: 'Un getto di fiamme a forma di drago che incenerisce il nemico.' },
          'Esplosione Solare': { name: 'Esplosione Solare', type: 'Fuoco', power: 0, targetCount: 2, statusEffect: { type: 'Scottato', chance: 1.0 }, desc: 'Scotta sicuramente fino a 2 avversari selezionati, grazie a una luce accecante e calore estremo.' },
          'Aura Stellare': { name: 'Aura Stellare', type: 'Magico', power: 0, target: 'self', maxUses: 3, statBuff: { atk: 1.5 }, desc: "Aumenta l'attacco di chi la usa del 50%. (3 utilizzi)" },
          'Incanto Protettivo': { name: 'Incanto Protettivo', type: 'Magico', power: 0, targetCount: 4, maxUses: 3, statusEffect: { type: 'Indebolito', chance: 1.0, turns: 5 }, desc: 'Applica Indebolito. Riduce del 25% i danni fisici e magici degli avversari per 5 turni.' },

          'Rolla-Guscio': { name: 'Rolla-Guscio', type: 'Roccia', power: 30, statusEffect: { type: 'Confuso', chance: 0.8 }, desc: 'Rotola come un macigno contro il nemico. L\'80% di probabilità di confondere il bersaglio.' },
          'Ruggito del re koopa': { name: 'Ruggito del re koopa', type: 'Drago', power: 0, target: 'self', maxUses: 2, statBuff: { atk: 1.5, def: 1.5 }, desc: 'Emette un boato terrificante, aumentando Attacco e Difesa del 50%.' },

          'Tossina': { name: 'Tossina', type: 'Veleno', power: 0, statusEffect: { type: 'Avvelenato', chance: 1.0 }, desc: 'Avvelena gravemente il bersaglio.' },
          'Gigassorbimento': { name: 'Gigassorbimento', type: 'Erba', power: 95, drain: 0.50, desc: 'Assorbe i PS del nemico. Cura chi la usa del 50% del danno inflitto.' },
          'Protezione': { name: 'Protezione', type: 'Normale', power: 0, target: 'self', maxUses: 5, priority: 5, isProtect: true, desc: 'Si protegge dagli attacchi. Se usata di fila, la probabilità di successo si dimezza.' },

          'Colpo Cartoon': { name: 'Colpo Cartoon', type: 'Normale', power: 68, priority: 1, desc: 'Un colpo imprevedibile che colpisce sempre per primo (Priorità +1).' },
          'Fischietto amico': { name: 'Fischietto amico', type: 'Normale', power: 0, target: 'self', statBuff: { atk: 2.0 }, desc: 'Un fischio incoraggiante che raddoppia l\'Attacco (+100%).' },
          'Tappeto scivoloso': { name: 'Tappeto scivoloso', type: 'Normale', power: 75, statusEffect: { type: 'Confuso', chance: 0.25 }, desc: 'Tira via il tappeto! 25% di probabilità di confondere il nemico.' },
          'Magia Disney': { name: 'Magia Disney', type: 'Magico', power: 100, ignoreDefBuffs: true, desc: 'Un attacco magico formidabile che ignora i potenziamenti difensivi del nemico.' },

          'Raggio Avvelenato': { name: 'Raggio Avvelenato', type: 'Magico', power: 70, statusEffect: { type: 'Avvelenato', chance: 0.10 }, desc: 'Un raggio oscuro e tossico. 10% di probabilità di avvelenare il bersaglio.' },
          'Evocazione!': { name: 'Evocazione!', type: 'Oscuro', power: 0, isSummon: 'scheletro', maxUses: 3, desc: 'Evoca uno Scheletro in campo che combatterà al tuo fianco! (Fino a 3 evocazioni)' },
          'Proteggi la mamma!': { name: 'Proteggi la mamma!', type: 'Normale', power: 0, targetMode: 'ally', specificAlly: 'Strega', heal: 0.3, desc: 'Difende e cura la Strega del proprio team del 30% dei PS massimi. Funziona SOLO sulla Strega!' },
          'Colpo di spada': { name: 'Colpo di spada', type: 'Normale', power: 40, desc: 'Un colpo di spada sgangherato ma affilato. Infligge danni moderati.' },

          // NUOVE MOSSE RAINBOW DASH
          'Sonic Rainboom': { name: 'Sonic Rainboom', type: 'Aria', power: 100, speedScaling: true, desc: 'Un\'esplosione sonica arcobaleno. Il danno aumenta in base alla sua Velocità.' },
          'Barriera di Nuvole': { name: 'Barriera di Nuvole', type: 'Aria', power: 0, target: 'self', isProtect: true, priority: 5, maxUses: 5, desc: 'Si nasconde in una nuvola parando i danni. Usandola di fila aumenta la probabilità che fallisca.' },
          'Calcio Fulmineo': { name: 'Calcio Fulmineo', type: 'Elettro', power: 75, statusEffect: { type: 'Elettrizzato', chance: 0.3 }, desc: 'Un calcio veloce e caricato elettricamente. 30% di probabilità di paralizzare.' },
          'Volo Acrobatico': { name: 'Volo Acrobatico', type: 'Aria', power: 0, target: 'self', statBuff: { spd: 2.0, atk: 1.3 }, desc: 'Acrobazie aeree spettacolari che raddoppiano la Velocità e aumentano l\'Attacco del 30%.' },
          'Morso del Pony': { name: 'Morso del Pony', type: 'Buio', power: 80, selfHeal: 0.5, selfHealChance: 0.5, desc: 'Un morso oscuro e inaspettato. 50% di probabilità di recuperare il 50% dei PS massimi.' },

          // NUOVE MOSSE LADYBUG
          'Yo-Yo Devastante': { name: 'Yo-Yo Devastante', type: 'Insetto', power: 80, desc: 'Colpisce il nemico con il suo inseparabile yo-yo magico.' },
          'Lucky Charm': { name: 'Lucky Charm', type: 'Magico', power: 0, targetMode: 'ally', targetStatBuff: { atk: 1.5, def: 1.5 }, desc: 'Evoca l\'oggetto perfetto per la situazione! Aumenta Attacco e Difesa di un alleato del 50%.' },
          'Miraculous Ladybug': { name: 'Miraculous Ladybug', type: 'Magico', power: 0, targetMode: 'team_smart_heal', healAlone: 0.5, healTeam: 0.5, maxUses: 2, desc: 'Lancia in aria il Lucky Charm riparando i danni! Cura tutto il team in campo del 50% dei PS.' },
          'Miraculous Juviabug': { name: 'Miraculous Juviabug', type: 'Magico', power: 0, targetMode: 'team_smart_heal', healAlone: 0.5, healTeam: 0.5, maxUses: 2, desc: 'Lancia in aria il Lucky Charm riparando i danni! Cura tutto il team in campo del 50% dei PS.' },
          'Mi serve un aiutante!': { name: 'Mi serve un aiutante!', type: 'Magico', power: 0, maxUses: 2, strictUses: true, selfStatBuff: { def: 1.1 }, randomSummon: ['summon_chatnoir', 'summon_renarouge', 'viperion', 'summon_carapace', 'summon_ryuko', 'summon_kingmonkey'], desc: 'Aumenta la Difesa del 10% ed evoca un aiutante casuale tra gli eroi di Parigi. (2 utilizzi)' },
          'Lucky Charm Illusorio!': { name: 'Lucky Charm Illusorio!', type: 'Magico', power: 100, maxUses: 1, isCombo: ['ladybug', 'renarouge'], selfHeal: 1.0, statusEffect: { type: 'Scottato', chance: 1.0 }, desc: 'Mossa Combinata: 100 danni, brucia il bersaglio e cura al 100% Ladybug e Rena Rouge! Consuma il turno di entrambe.' },

          // NUOVE MOSSE WARIO
          'Peto Velenoso': { name: 'Peto Velenoso', type: 'Veleno', power: 80, statusEffect: { type: 'Avvelenato', chance: 0.8 }, desc: 'Emana un gas tossico letale. 80% di probabilità di avvelenare gravemente il bersaglio.' },
          'Carica di Spalla': { name: 'Carica di Spalla', type: 'Lotta', power: 90, desc: 'Una spallata brutale e potentissima. Tipica mossa di Wario.' },
          'Masticata d\'Aglio': { name: 'Masticata d\'Aglio', type: 'Erba', power: 0, target: 'self', heal: 0.4, removeNegativeStatuses: true, desc: 'Mangia uno spicchio d\'aglio! Recupera il 40% dei PS e rimuove gli status negativi.' },
          'Moto da teppista': { name: 'Moto da teppista', type: 'Robot', power: 85, statusEffect: { type: 'Stordito', chance: 0.2 }, desc: 'Investe il nemico con la sua possente moto. 20% di probabilità di stordire.' },

          // NUOVE MOSSE ZUKO
          'Frusta di Fuoco': { name: 'Frusta di Fuoco', type: 'Fuoco', power: 75, statusEffect: { type: 'Scottato', chance: 0.3 }, desc: 'Colpisce il nemico con una frusta di fiamme. 30% di probabilità di scottare.' },
          'Danza del Drago': { name: 'Danza del Drago', type: 'Fuoco', power: 0, target: 'self', statBuff: { atk: 1.5, spd: 1.5 }, desc: 'Antica tecnica di dominio originaria. Aumenta l\'Attacco e la Velocità del 50%.' },
          'Calcio Infuocato': { name: 'Calcio Infuocato', type: 'Lotta', power: 85, desc: 'Un calcio acrobatico di arti marziali potenziato dal dominio del fuoco.' },
          'Deviazione del Fulmine': { name: 'Deviazione del Fulmine', type: 'Elettro', power: 0, target: 'self', isProtect: true, priority: 5, protectStatus: 'Rashield', desc: 'Canalizza l\'energia avversaria, proteggendosi e riflettendo il 25% dei danni al mittente.' },

          // NUOVE MOSSE SPIKE
          'Sfera di Spine': { name: 'Sfera di Spine', type: 'Erba', power: 30, multiHit: { min: 2, max: 3 }, desc: 'Lancia un cactus esplosivo che colpisce da 2 a 3 volte con le sue spine.' },
          'Campo di Cactus': { name: 'Campo di Cactus', type: 'Erba', power: 55, targetCount: 4, statusEffect: { type: 'Stordito', chance: 0.2 }, desc: 'Fa spuntare cactus su tutto il campo colpendo ogni nemico. 20% probabilità di stordire.' },
          'Abbraccio Oscuro': { name: 'Abbraccio Oscuro', type: 'Oscuro', power: 80, drain: 0.4, desc: 'Un abbraccio maledetto che assorbe l\'energia nemica. Cura del 40% dei danni inflitti.' },
          'Fertilizzante': { name: 'Fertilizzante', type: 'Erba', power: 0, target: 'self', heal: 0.5, desc: 'Usa del fertilizzante per rigenerare rapidamente i propri tessuti curando il 50% dei PS.' },

          'Polline fastidioso': { name: 'Polline fastidioso', type: 'Erba', power: 40, maxUses: 4, targetCount: 2, statusEffects: [{ type: 'Addormentato', chance: 0.35 }, { type: 'Elettrizzato', chance: 0.35 }], desc: 'Colpisce fino a 2 nemici con potenza 40; 35% di addormentare e 35% di paralizzare ciascun bersaglio. (4 utilizzi)' },
          'Foglia Danzerina': { name: 'Foglia Danzerina', type: 'Erba', power: 65, statusEffect: { type: 'Confuso', chance: 0.30 }, desc: 'Una danza di foglie affilate. 30% di probabilità di confondere.' },
          'Fotosintesi clorofiliana': { name: 'Fotosintesi clorofiliana', type: 'Erba', power: 0, maxUses: 2, strictUses: true, targetMode: 'team_smart_heal', healAlone: 0.8, healTeam: 0.35, desc: 'Se è sola si cura dell’80% dei PS massimi. Con alleati, cura ogni membro del team in campo del 35%. (2 utilizzi)' },
          'L ho fatta nel vaso': { name: 'L ho fatta nel vaso', type: 'Erba', power: 0, target: 'self', heal: 0.25, statBuff: { def: 1.5 }, desc: 'Si sistema comodamente: recupera il 25% dei PS e aumenta la propria Difesa del 50%.' },

          'Bolla Turbo': { name: 'Bolla Turbo', type: 'Acqua', power: 45, targetCount: 4, selfStatBuff: { spd: 1.5 }, desc: 'Attacco rapido d\'acqua che colpisce più bersagli possibili e aumenta la Velocità di chi la usa.' },
          'Onda Amica': { name: 'Onda Amica', type: 'Acqua', power: 0, targetMode: 'ally', heal: 0.4, removeNegativeStatuses: true, desc: 'Una dolce onda curativa che guarisce il 40% dei PS a un alleato (o a se stesso) e rimuove gli status negativi.' },
          'Brutto, brutto e cattivo!': { name: 'Brutto, brutto e cattivo!', type: 'Normale', power: 60, multiHit: { min: 1, max: 2 }, desc: 'Un attacco da capriccio esplosivo! Può colpire da 1 a 2 volte il bersaglio.' },
          'Onda Travolgente': { name: 'Onda Travolgente', type: 'Acqua', power: 80, statusEffect: { type: 'Stordito', chance: 0.2 }, desc: 'Un\'onda violenta che travolge il nemico. 20% di probabilità di stordire.' },
          'Dittatura del Sorriso': { name: 'Dittatura del Sorriso', type: 'Oscuro', power: 90, targetCount: 4, statusEffect: { type: 'Confuso', chance: 0.5 }, desc: 'Obbliga tutti a sorridere! Colpisce tutti i nemici con energia oscura e ha il 50% di probabilità di confonderli.' },

          'Tempesta emotiva': { name: 'Tempesta emotiva', type: 'Aria', power: 110, targetCount: 2, maxUses: 5, desc: 'Un ciclone di emozioni e vento. Colpisce fino a due bersagli contemporaneamente.' },
          'Colpo impetuoso': { name: 'Colpo impetuoso', type: 'Acqua', power: 95, rainstormChance: 0.25, desc: 'Un potente colpo Acqua: 25% di probabilità di scatenare una Tempesta di 5 turni. Con Tempesta: Acqua +25% danni, Fuoco -25% danni.' },
          'Amore devoto': { name: 'Amore devoto', type: 'Magico', power: 0, maxUses: 3, targetMode: 'ally', targetStatBuff: { atk: 1.5, def: 1.5 }, desc: 'Il potere dell\'amore: potenzia grandemente l\'Attacco e la Difesa di un alleato in squadra.' },
          'Flirt': { name: 'Flirt', type: 'Normale', power: 0, maxUses: 5, statusEffect: { type: 'Infatuato', chance: 1.0 }, desc: 'Usa il fascino per far innamorare irrimediabilmente il bersaglio.' },
          'Abisso Disperato': { name: 'Abisso Disperato', type: 'Buio', power: 85, drain: 0.5, maxUses: 3, desc: 'L\'oscurità della sua gelosia avvolge il nemico. Drena il 50% del danno inflitto in PS. (3 utilizzi)' },

          'Primo Kata': { name: 'Primo Kata', type: 'Aria', power: 20, multiHit: { min: 2, max: 4 }, speedScaling: true, desc: 'Raffiche multiple in rotazione. Il danno scala aggiungendo un bonus in base alla Velocità.' },
          'Terzo Kata': { name: 'Terzo Kata', type: 'Aria', power: 0, target: 'self', statBuff: { def: 2.0 }, statusEffect: { type: 'Riflesso', turns: 2 }, desc: 'Crea una barriera di vento: raddoppia la Difesa e riflette i danni al mittente (2 turni).' },
          'Settimo Kata': { name: 'Settimo Kata', type: 'Aria', power: 85, targetCount: 4, targetStatDebuff: { def: 0.7 }, desc: 'Raffiche devastanti su tutti i nemici. Riduce permanentemente la loro Difesa del 30%.' },
          'Colpo Karate': { name: 'Colpo Karate', type: 'Lotta', power: 60, desc: 'Un attacco marziale diretto, semplice e potente.' },

          'Riflesso Team': { name: 'Riflesso', type: 'Magico', power: 0, targetMode: 'team', statusEffect: { type: 'Scudo Team', turns: 5 }, desc: 'Crea una barriera di luce magica. Moltiplica la Difesa di tutto il team x3 per 5 turni.' },
          'Sorriso Luminoso': { name: 'Sorriso Luminoso', type: 'Normale', power: 0, targetMode: 'team', removeNegativeStatuses: true, desc: 'Un sorriso abbagliante che cura chi la usa e tutti gli alleati da qualsiasi alterazione di stato negativa.' },
          'Faccino carino!': { name: 'Faccino carino!', type: 'Normale', power: 0, maxUses: 3, targetStatDebuff: { atk: 0.5 }, desc: 'Sfrutta la tenerezza per abbassare la guardia del nemico, dimezzandone permanentemente l\'Attacco. (3 utilizzi)' },
          'Tsunami dolce': { name: 'Tsunami dolce', type: 'Acqua', power: 80, desc: 'Travolge il nemico con una massiccia e inaspettata onda zuccherata.' },

          'Pugno Minerale': { name: 'Pugno Minerale', type: 'Terra', power: 92, desc: 'Un colpo fisico durissimo sferrato tramutando il proprio braccio in pietra massiccia.' },
          'Frana Impattante': { name: 'Frana Impattante', type: 'Roccia', power: 50, targetCount: 2, statusEffect: { type: 'Stordito', chance: 0.3 }, desc: 'Fa precipitare massi enormi dall\'alto. Colpisce fino a 2 nemici e ha il 30% di probabilità di stordirli.' },
          'Assorbimento grezzo': { name: 'Assorbimento grezzo', type: 'Terra', power: 0, maxUses: 3, targetStatDebuff: { atk: 0.7 }, selfHeal: 0.2, desc: 'Assorbe l\'essenza del nemico: ne riduce l\'Attacco del 30% e cura Kevin del 20% dei suoi PS massimi. (3 utilizzi)' },
          'Carica selvaggia': { name: 'Carica selvaggia', type: 'Normale', power: 110, statusEffect: { type: 'Confuso', chance: 0.10 }, desc: 'Si scaglia a testa bassa contro l\'avversario con una carica a tutta velocità. 10% di probabilità di confondere.' },

          'Ruggito di Pietra': { name: 'Ruggito di Pietra', type: 'Roccia', power: 0, targetCount: 2, targetStatDebuff: { atk: 0.7, spd: 0.7 }, desc: 'Un boato roccioso che riduce l\'Attacco e la Velocità di due bersagli.' },
          'Pugno di Macigno': { name: 'Pugno di Macigno', type: 'Roccia', power: 120, accuracy: 0.70, desc: 'Colpo fisico devastante con il braccio di pietra. Alta potenza, ma bassa precisione (70%).' },
          'Scaglie di Roccia': { name: 'Scaglie di Roccia', type: 'Roccia', power: 55, targetCount: 4, desc: 'Lancia schegge di pietra affilate dal proprio corpo colpendo più bersagli.' },
          'Presa Schiacciante': { name: 'Presa Schiacciante', type: 'Terra', power: 75, statusEffect: { type: 'Stordito', chance: 0.3 }, desc: 'Afferra il nemico e lo stringe con forza sovrumana. 30% di probabilità di stordirlo.' },

          'Gelo Eterno': { name: 'Gelo Eterno', type: 'Ghiaccio', power: 95, statusEffect: { type: 'Congelato', chance: 0.15 }, desc: 'Un raggio di ghiaccio puro. 15% di probabilità di congelare il bersaglio.' },
          'Frammenti di Neve': { name: 'Frammenti di Neve', type: 'Ghiaccio', power: 25, multiHit: { min: 2, max: 5 }, desc: 'Scaglia schegge di ghiaccio che colpiscono il bersaglio in rapida successione (da 2 a 5 volte).' },
          'Canto dell Inverno': { name: 'Canto dell\'Inverno', type: 'Ghiaccio', power: 0, targetMode: 'ally', heal: 0.4, removeNegativeStatuses: true, desc: 'Guarisce un alleato (o se stessa) del 40% dei PS massimi e rimuove gli status negativi.' },
          'Luce Cristallina': { name: 'Luce Cristallina', type: 'Magico', power: 80, ignoreDefBuffs: true, desc: 'Raggio di luce magica. Colpisce ignorando completamente i potenziamenti alla Difesa del nemico.' },
          'Gelo Definitivo': { name: 'Gelo Definitivo', type: 'Ghiaccio', power: 100, targetCount: 4, maxUses: 1, statusEffect: { type: 'Congelato', chance: 0.60 }, desc: 'Un vortice di gelo assoluto. Colpisce tutti i nemici in campo con il 60% di probabilità di congelarli. (1 utilizzo)' },
          
          // NUOVE MOSSE RE GHIACCIO
          'Raggio Congelante': { name: 'Raggio Congelante', type: 'Ghiaccio', power: 75, statusEffect: { type: 'Congelato', chance: 0.25 }, desc: 'Un raggio gelido scaturito dalla corona. 25% di probabilità di congelare.' },
          'Vai Gunter!': { name: 'Vai Gunter!', type: 'Normale', power: 30, multiHit: { min: 2, max: 4 }, desc: 'Lancia Gunter e altri pinguini contro il nemico. Colpisce da 2 a 4 volte.' },
          'Prigione di Ghiaccio': { name: 'Prigione di Ghiaccio', type: 'Ghiaccio', power: 50, statusEffect: { type: 'Stordito', chance: 1.0 }, maxUses: 2, desc: 'Intrappola il nemico nel ghiaccio. Stordisce al 100%, ma è utilizzabile solo 2 volte.' },
          'Follia della Corona': { name: 'Follia della Corona', type: 'Magico', power: 0, target: 'self', statBuff: { atk: 2.0 }, statusEffect: { type: 'Confuso', chance: 0.5 }, desc: 'Attinge al potere della corona raddoppiando l\'Attacco, ma col 50% di probabilità di confondersi.' },

          // NUOVE MOSSE DANNY PHANTOM
          'Raggio Ectoplasmatico': { name: 'Raggio Ectoplasmatico', type: 'Elettro', power: 85, desc: 'Spara un potente getto di energia verde dalle mani.' },
          'Urlo Spettrale': { name: 'Urlo Spettrale', type: 'Spettro', power: 120, targetCount: 4, recharge: true, desc: 'Un urlo sonico devastante che colpisce tutti. Richiede un turno di ricarica.' },
          'Intangibilità': { name: 'Intangibilità', type: 'Aria', power: 0, target: 'self', isProtect: true, priority: 5, maxUses: 4, desc: 'Diventa intangibile per schivare ogni attacco in questo turno.' },
          'Pugno Ghiacciato': { name: 'Pugno Ghiacciato', type: 'Ghiaccio', power: 65, statusEffect: { type: 'Congelato', chance: 0.3 }, desc: 'Usa la sua criocinesi in un pugno. 30% di probabilità di congelare.' },

          // NUOVE MOSSE RE BOO
          'Trappola nel Quadro': { name: 'Trappola nel Quadro', type: 'Magico', power: 80, statusEffect: { type: 'Stordito', chance: 0.25 }, maxUses: 3, desc: 'Intrappola l\'avversario in una tela! 80 di danno e 25% di probabilità di stordire. (3 utilizzi)' },
          'boo ho ho hahaha': { name: 'boo ho ho hahaha', type: 'Spettro', power: 0, isSummon: 'boo', maxUses: 3, desc: 'Evoca un Boo alleato sul campo di battaglia. (3 utilizzi)' },
          'Lingua Gigante': { name: 'Lingua Gigante', type: 'Spettro', power: 70, drain: 0.3, desc: 'Lecca il nemico con una lingua enorme. Recupera il 30% dei danni inflitti.' },
          'Lingua Gigante (Boo)': { name: 'Lingua Gigante', type: 'Spettro', power: 50, drain: 0.3, desc: 'Lecca il nemico. Recupera il 30% dei danni inflitti.' },
          'Potere della Corona': { name: 'Potere della Corona', type: 'Magico', power: 0, target: 'self', statBuff: { def: 1.5, atk: 1.5 }, desc: 'Il gioiello della corona brilla, aumentando Attacco e Difesa del 50%.' },

          // NUOVE MOSSE DANNY PHANTOM
          'Mela Rossa': { name: 'Mela Rossa', type: 'Erba', power: 0, target: 'self', heal: 0.5, statBuff: { spd: 1.3 }, desc: 'Mangia una succosa mela terrestre: si cura del 50% e aumenta la Velocità.' },
          'Sguardo Shinigami': { name: 'Sguardo Shinigami', type: 'Oscuro', power: 0, targetStatDebuff: { def: 0.7, spd: 0.7 }, statusEffect: { type: 'Confuso', chance: 0.4 }, desc: 'Scopre il vero nome del bersaglio: diminuisce la sua Difesa e Velocità del 30% e ha il 40% di confonderlo.' },
          'Ali Nere': { name: 'Ali Nere', type: 'Aria', power: 75, speedScaling: true, desc: 'Vola a gran velocità per sferrare un attacco aereo. Scala con la Velocità.' },
          'Giudizio dello Shinigami': { name: 'Giudizio dello Shinigami', type: 'Oscuro', power: 100, recharge: true, desc: 'Un colpo fatale e inesorabile. Infligge 100 danni ma richiede un turno di ricarica.' },

          'Leccata Festosa': { name: 'Leccata Festosa', type: 'Spettro', power: 55, drain: 0.5, statusEffect: { type: 'Infatuato', chance: 0.3 }, desc: 'Una leccatina affettuosa e bavosa. Assorbe vita (50%) e può infatuare (30%).' },
          'Ruba-Chiavi': { name: 'Ruba-Chiavi', type: 'Normale', power: 45, targetStatDebuff: { def: 0.6, spd: 0.6 }, desc: 'Ruba gli oggetti dell\'avversario per giocarci! Riduce drasticamente Difesa e Velocità (-40%).' },
          'Buon Cagnolino': { name: 'Buon Cagnolino', type: 'Normale', power: 0, targetMode: 'ally', heal: 0.5, removeNegativeStatuses: true, desc: 'Guarisce un alleato del 50% dei PS e rimuove le sue alterazioni di stato.' },
          'Nascondino': { name: 'Nascondino', type: 'Spettro', power: 0, target: 'self', isProtect: true, priority: 5, statBuff: { spd: 1.5 }, maxUses: 3, desc: 'Si nasconde sotto terra proteggendosi. Aumenta la sua Velocità del 50%.' },
          'Riporta': { name: 'Riporta', type: 'Normale', power: 40, multiHit: { min: 2, max: 5 }, desc: 'Corre a riportare qualcosa di pesante scodinzolando! Colpisce da 2 a 5 volte.' },

          // NUOVE MOSSE RIAS GREMORY
          'Potere della Distruzione': { name: 'Potere della Distruzione', type: 'Oscuro', power: 100, ignoreDefBuffs: true, desc: 'Una sfera di pura aura distruttiva che annienta tutto ignorando le difese.' },
          'Stella del Mattino': { name: 'Stella del Mattino', type: 'Magico', power: 75, targetCount: 4, desc: 'Un lampo cremisi che colpisce tutti i nemici sul campo di battaglia.' },
          'Ali da Demone': { name: 'Ali da Demone', type: 'Aria', power: 0, target: 'self', isProtect: true, priority: 5, maxUses: 3, desc: 'Spiega le sue ali da diavolo per schivare gli attacchi del turno. (3 utilizzi)' },
          'Regina Cremisi': { name: 'Regina Cremisi', type: 'Oscuro', power: 0, targetMode: 'team', targetStatBuff: { atk: 1.3, spd: 1.3 }, desc: 'Ispira i suoi servitori. Aumenta l\'Attacco e la Velocità di tutto il team del 30%.' },

          // NUOVE MOSSE CRASH BANDICOOT
          'Tornado Rotante': { name: 'Tornado Rotante', type: 'Lotta', power: 30, multiHit: { min: 2, max: 4 }, desc: 'Il suo iconico attacco a trottola. Colpisce da 2 a 4 volte.' },
          'Spanciata': { name: 'Spanciata', type: 'Normale', power: 85, statusEffect: { type: 'Stordito', chance: 0.3 }, desc: 'Un salto seguito da un tonfo di pancia letale. 30% di probabilità di stordire.' },
          'Maschera Aku Aku': { name: 'Maschera Aku Aku', type: 'Magico', power: 0, target: 'self', isProtect: true, priority: 5, maxUses: 2, heal: 0.2, desc: 'Evoca Aku Aku! Lo protegge dai danni e lo cura del 20% dei PS. (2 utilizzi)' },
          'Frutto Wumpa': { name: 'Frutto Wumpa', type: 'Erba', power: 0, target: 'self', heal: 0.4, statBuff: { spd: 1.3 }, desc: 'Mangia un delizioso Frutto Wumpa. Recupera il 40% dei PS e aumenta la Velocità del 30%.' },

          // NUOVE MOSSE PYRA
          'Spada dell\'Egida': { name: 'Spada dell\'Egida', type: 'Fuoco', power: 90, desc: 'Un fendente potente e concentrato di fiamme sprigionato dalla spada leggendaria.' },
          'Sintesi Ardente': { name: 'Sintesi Ardente', type: 'Erba', power: 0, target: 'self', heal: 0.3, statBuff: { atk: 1.3 }, desc: 'Usa l\'energia della natura per curarsi del 30% e aumentare l\'Attacco del 30%.' },
          'Rovi di Fuoco': { name: 'Rovi di Fuoco', type: 'Erba', power: 75, statusEffect: { type: 'Scottato', chance: 0.3 }, desc: 'Evoca rovi infuocati che avvolgono il nemico. 30% di probabilità di scottare.' },
          'Lame Scarlatte': { name: 'Lame Scarlatte', type: 'Fuoco', power: 65, targetCount: 2, desc: 'Scaglia ondate di fuoco a ventaglio colpendo fino a 2 bersagli.' },

          // NUOVE MOSSE KATARA
          'Frusta d\'Acqua': { name: 'Frusta d\'Acqua', type: 'Acqua', power: 75, desc: 'Plasma l\'acqua in una frusta flessibile e letale che colpisce il nemico.' },
          'Onda Guaritrice': { name: 'Onda Guaritrice', type: 'Acqua', power: 0, targetMode: 'ally', heal: 0.5, desc: 'Usa le proprietà curative dell\'acqua per curare un alleato del 50% dei PS massimi.' },
          'Dominio del Sangue': { name: 'Dominio del Sangue', type: 'Oscuro', power: 80, drain: 0.4, statusEffect: { type: 'Stordito', chance: 0.2 }, desc: 'Controlla i fluidi vitali del nemico! Drena il 40% del danno e ha il 20% di stordire.' },
          'Gabbia di Ghiaccio': { name: 'Gabbia di Ghiaccio', type: 'Ghiaccio', power: 50, statusEffect: { type: 'Congelato', chance: 0.6 }, desc: 'Intrappola il bersaglio congelandolo. 60% di probabilità di congelare.' },

          // NUOVE MOSSE ZABUZA
          'Velo di Nebbia': { name: 'Velo di Nebbia', type: 'Acqua', power: 0, target: 'self', isProtect: true, priority: 5, maxUses: 3, desc: 'Si nasconde in una fitta nebbia schivando ogni attacco nemico per il turno. (3 utilizzi)' },
          'Mannaia Tagliateste': { name: 'Mannaia Tagliateste', type: 'Lotta', power: 100, ignoreDefBuffs: true, desc: 'Un fendente spaventoso con la spada gigante che ignora le difese avversarie.' },
          'Drago Acquatico': { name: 'Drago Acquatico', type: 'Acqua', power: 95, desc: 'Plasma enormi quantità d\'acqua creando un possente drago che si schianta sul nemico.' },
          'Omicidio Silenzioso': { name: 'Omicidio Silenzioso', type: 'Oscuro', power: 130, accuracy: 0.7, desc: 'Attacca a sorpresa dai punti ciechi. Danni mostruosi, ma precisione ridotta al 70%.' },

          // NUOVE MOSSE STEWIE
          'Pistola Laser': { name: 'Pistola Laser', type: 'Robot', power: 80, desc: 'Spara con la sua invenzione letale: un fucile a raggi concentrati.' },
          'Macchina del Tempo': { name: 'Macchina del Tempo', type: 'Magico', power: 0, target: 'self', heal: 1.0, maxUses: 1, removeNegativeStatuses: true, desc: 'Torna indietro nel tempo prima di subire danni! Recupera il 100% dei PS e status. 1 Uso.' },
          'Granata EMP': { name: 'Granata EMP', type: 'Elettro', power: 60, targetCount: 4, statusEffect: { type: 'Elettrizzato', chance: 0.4 }, desc: 'Esplosione elettromagnetica su tutti i nemici. 40% di probabilità di paralizzarli.' },
          'Controllo Mentale': { name: 'Controllo Mentale', type: 'Magico', power: 0, statusEffect: { type: 'Confuso', chance: 1.0 }, targetStatDebuff: { def: 0.5 }, desc: 'Infiltra la mente avversaria: lo confonde e ne dimezza permanentemente la Difesa.' },

          // NUOVE MOSSE GROOT (Curatore/Supporto)
          'Io sono Groot': { name: 'Io sono Groot', type: 'Erba', power: 0, targetMode: 'team_smart_heal', healAlone: 0.5, healTeam: 0.3, removeNegativeStatuses: true, desc: 'Cura il team del 30% (o 50% se è solo) e rimuove le alterazioni di stato negative.' },
          'Scudo di Rami': { name: 'Scudo di Rami', type: 'Terra', power: 0, targetMode: 'ally', targetStatBuff: { def: 2.0 }, desc: 'Avvolge un alleato (o sé stesso) con rami resistenti raddoppiandone la Difesa.' },
          'Liane Sferzanti': { name: 'Liane Sferzanti', type: 'Erba', power: 80, desc: 'Sferza il nemico con robuste liane. Un attacco potente e diretto di tipo Erba.' },
          'Colpo Radice': { name: 'Colpo Radice', type: 'Terra', power: 75, desc: 'Sferra un colpo pesante facendo emergere enormi radici dure come la roccia.' },

          // NUOVE MOSSE GRAVELORD NITO
          'Miasma della Morte': { name: 'Miasma della Morte', type: 'Oscuro', power: 40, targetCount: 4, statusEffect: { type: 'Avvelenato', chance: 0.8 }, desc: 'Un gas mortale che colpisce tutti i nemici. 80% di probabilità di avvelenamento grave.' },
          'Spadone del Re Tombale': { name: 'Spadone del Re Tombale', type: 'Roccia', power: 90, ignoreDefBuffs: true, desc: 'Trafigge con una spada colossale ignorando i potenziamenti difensivi dell\'avversario.' },
          'Danza Macabra': { name: 'Danza Macabra', type: 'Spettro', power: 75, drain: 0.5, desc: 'Drena l\'energia vitale. Cura Nito del 50% del danno inflitto.' },
          'Risveglio dei Morti': { name: 'Risveglio dei Morti', type: 'Oscuro', power: 0, isSummon: ['mostro_scheletrico', 'mostro_scheletrico'], maxUses: 2, desc: 'Il Re Tombale evoca ben DUE Mostri Scheletrici sul campo di battaglia in un solo turno! (2 utilizzi)' },
          
          'Sguardo demoniaco': { name: 'Sguardo demoniaco', type: 'Oscuro', power: 0, targetStatDebuff: { atk: 0.7, def: 0.7 }, desc: 'Uno sguardo agghiacciante che diminuisce l\'Attacco e la Difesa del bersaglio del 30%.' },
          'Aura spettrale': { name: 'Aura spettrale', type: 'Spettro', power: 60, desc: 'Un attacco con aura spettrale mortale che infligge 60 danni.' },

          // NUOVE MOSSE JACK FROST
          'Vento Invernale': { name: 'Vento Invernale', type: 'Ghiaccio', power: 70, selfStatBuff: { spd: 1.5 }, desc: 'Cavalca il vento gelato, infliggendo danni e aumentando la sua Velocità del 50%.' },
          'Scherzetto di Neve': { name: 'Scherzetto di Neve', type: 'Ghiaccio', power: 40, targetCount: 2, statusEffect: { type: 'Congelato', chance: 0.4 }, desc: 'Lancia palle di neve magiche su 2 nemici infliggendo danni. 40% di probabilità di congelarli.' },
          'Bastone Magico': { name: 'Bastone Magico', type: 'Magico', power: 70, statusEffect: { type: 'Confuso', chance: 0.2 }, desc: 'Colpisce con il bastone magico. 20% di probabilità di confondere il bersaglio.' },
          'Aura Glaciale': { name: 'Aura Glaciale', type: 'Ghiaccio', power: 0, targetMode: 'team', targetStatBuff: { spd: 1.5 }, desc: 'Ricopre l\'arena di ghiaccio liscio, aumentando la Velocità di tutto il team del 50%.' },

          // NUOVE MOSSE YUKI-ONNA
          'Alito Congelante': { name: 'Alito Congelante', type: 'Ghiaccio', power: 85, statusEffect: { type: 'Congelato', chance: 0.35 }, desc: 'Soffia aria gelida per abbassare la temperatura corporea. 35% di prob. di congelare.' },
          'Sguardo Spirituale': { name: 'Sguardo Spirituale', type: 'Spettro', power: 0, targetStatDebuff: { atk: 0.5, spd: 0.5 }, desc: 'Uno sguardo terrificante dall\'oltretomba che dimezza l\'Attacco e la Velocità del nemico.' },
          'Tormenta Spettrale': { name: 'Tormenta Spettrale', type: 'Spettro', power: 80, targetCount: 4, desc: 'Evoca anime in pena in mezzo a una tormenta, colpendo tutti i nemici in campo.' },
          'Fascino Glaciale': { name: 'Fascino Glaciale', type: 'Ghiaccio', power: 0, maxUses: 3, strictUses: true, statusEffect: { type: 'Infatuato', chance: 0.75 }, desc: 'Può infatuare il nemico con il 75% di probabilità. (3 utilizzi)' },

          // NUOVE MOSSE CYBORG
          'Cannone Sonico': { name: 'Cannone Sonico', type: 'Robot', power: 85, targetCount: 2, desc: 'Un\'onda d\'urto sonica ad alta frequenza che colpisce fino a 2 bersagli.' },
          'Booyah!': { name: 'Booyah!', type: 'Normale', power: 0, targetMode: 'team', targetStatBuff: { atk: 1.3, spd: 1.3 }, desc: 'Un grido di battaglia iconico! Aumenta Attacco e Velocità di tutti gli alleati del 30%.' },
          'Missile a Ricerca': { name: 'Missile a Ricerca', type: 'Elettro', power: 60, accuracy: 2.0, ignoreDefBuffs: true, desc: 'Un missile tracciante elettrificato che non manca mai il bersaglio e ignora i potenziamenti difensivi.' },
          'Riparazione Automatica': { name: 'Riparazione Automatica', type: 'Robot', power: 0, target: 'self', heal: 0.4, removeNegativeStatuses: true, desc: 'Ripara i sistemi danneggiati recuperando il 40% dei PS e rimuovendo gli status negativi.' },

          // NUOVE MOSSE UTOPIA
          'Taglio della Speranza': { name: 'Taglio della Speranza', type: 'Magico', power: 90, desc: 'Il suo iconico fendente con la spada di luce. Infligge ingenti danni magici.' },
          'Scudo Ala di Luce': { name: 'Scudo Ala di Luce', type: 'Magico', power: 0, target: 'self', isProtect: true, priority: 5, maxUses: 3, desc: 'Nega un attacco avversario proteggendosi completamente per il turno. (3 utilizzi)' },
          'Doppio o Niente!': { name: 'Doppio o Niente!', type: 'Normale', power: 150, accuracy: 0.5, desc: 'Un attacco devastante ma rischioso. Ha solo il 50% di probabilità di colpire, ma infligge danni enormi.' },
          'Raggio Vittoria': { name: 'Raggio Vittoria', type: 'Robot', power: 100, drain: 0.3, maxUses: 2, desc: 'Un potente raggio cosmico. Assorbe il 30% dei danni inflitti per curarsi. (2 utilizzi)' },

          // NUOVE MOSSE SDENTATO
          'Fuoco al Plasma': { name: 'Fuoco al Plasma', type: 'Drago', power: 95, ignoreDefBuffs: true, desc: 'Un colpo esplosivo che penetra le difese avversarie ignorando i potenziamenti difensivi.' },
          'Volo Furtivo': { name: 'Volo Furtivo', type: 'Aria', power: 0, target: 'self', statBuff: { spd: 1.5, def: 1.5 }, desc: 'Si mimetizza in volo. Aumenta Velocità e Difesa del 50%.' },
          'Ruggito Alfa': { name: 'Ruggito Alfa', type: 'Drago', power: 0, targetCount: 4, targetStatDebuff: { atk: 0.7, def: 0.7 }, desc: 'Un ruggito autoritario che spaventa tutti i nemici riducendo del 30% Attacco e Difesa.' },
          'Tuffo in Picchiata': { name: 'Tuffo in Picchiata', type: 'Aria', power: 80, speedScaling: true, desc: 'Sfrutta l\'altitudine per attaccare. Il danno aumenta in base alla Velocità di chi la usa.' },

          // NUOVE MOSSE SPYRO
          'Soffio di Fuoco': { name: 'Soffio di Fuoco', type: 'Fuoco', power: 70, statusEffect: { type: 'Scottato', chance: 0.5 }, desc: 'Una vampata fiammeggiante con il 50% di probabilità di scottare.' },
          'Carica a Cornate': { name: 'Carica a Cornate', type: 'Normale', power: 85, statusEffect: { type: 'Stordito', chance: 0.2 }, desc: 'Una testata a tutta velocità. Il 20% di probabilità di stordire il nemico.' },
          'L\'aiuto di Sparx': { name: 'L\'aiuto di Sparx', type: 'Insetto', power: 0, target: 'self', heal: 0.4, removeNegativeStatuses: true, desc: 'La libellula Sparx cura Spyro del 40% dei PS e rimuove le alterazioni di stato.' },
          'Pioggia di Gemme': { name: 'Pioggia di Gemme', type: 'Roccia', power: 32, multiHit: { min: 2, max: 4 }, desc: 'Scaglia le gemme raccolte colpendo da 2 a 4 volte.' },

          // NUOVE MOSSE COSMO
          'Bacchetta Magica': { name: 'Bacchetta Magica', type: 'Magico', power: 80, statusEffect: { type: 'Confuso', chance: 0.4 }, desc: 'Agita la bacchetta a caso. 40% di probabilità di confondere il bersaglio.' },
          'Desiderio: Cura!': { name: 'Desiderio: Cura!', type: 'Magico', power: 0, targetMode: 'ally', heal: 0.5, removeNegativeStatuses: true, desc: 'Realizza un desiderio curando il 50% dei PS a un alleato e rimuovendo gli status negativi.' },
          'Trasformazione Bizzarra': { name: 'Trasformazione Bizzarra', type: 'Magico', power: 60, statusEffect: { type: 'Stordito', chance: 0.6 }, desc: 'Trasforma il nemico in qualcosa di stupido. 60% di probabilità di stordire.' },
          'Esplosione Stellina': { name: 'Esplosione Stellina', type: 'Fuoco', power: 90, targetCount: 4, statusEffect: { type: 'Scottato', chance: 0.3 }, desc: 'Fa esplodere una stella gigante che colpisce tutti i nemici. 30% probabilità di scottare.' },

          // NUOVE MOSSE CORVINA
          'Azarath Metrion Zinthos': { name: 'Azarath Metrion Zinthos', type: 'Oscuro', power: 120, recharge: true, desc: 'Sprigiona il potere demoniaco. Danni estremi, ma necessita di ricarica il turno successivo.' },
          'Scudo d\'Ombra': { name: 'Scudo d\'Ombra', type: 'Oscuro', power: 0, targetMode: 'team', statusEffect: { type: 'Scudo Team', turns: 4 }, desc: 'Avvolge il team nelle ombre moltiplicando la Difesa x3 per 4 turni.' },
          'Telecinesi Oscura': { name: 'Telecinesi Oscura', type: 'Magico', power: 80, statusEffect: { type: 'Confuso', chance: 0.3 }, desc: 'Scaglia oggetti con la mente. 30% di probabilità di confondere.' },
          'Assorbimento Animico': { name: 'Assorbimento Animico', type: 'Oscuro', power: 70, drain: 0.5, desc: 'Attacca l\'anima del bersaglio, assorbendo il 50% dei danni inflitti per curarsi.' },
          'Luce di Azarath': { name: 'Luce di Azarath', type: 'Magico', power: 120, selfHeal: 0.5, removeNegativeStatuses: true, maxUses: 2, desc: 'Sprigiona il potere puro della Corvina Bianca. Infligge danni enormi, si cura del 50% e si purifica dagli status negativi. (2 utilizzi)' },
          
          // NUOVE MOSSE POISON IVY
          'Bacio Tossico': { name: 'Bacio Tossico', type: 'Veleno', power: 60, statusEffect: { type: 'Avvelenato', chance: 0.8 }, desc: 'Un bacio letale con l\'80% di probabilità di avvelenare gravemente il bersaglio.' },
          'Radici Avvolgenti': { name: 'Radici Avvolgenti', type: 'Erba', power: 82, statusEffect: { type: 'Stordito', chance: 0.3 }, desc: 'Evoca possenti radici che stritolano il nemico. 30% di probabilità di stordirlo.' },
          'Spore Soporifere': { name: 'Spore Soporifere', type: 'Erba', power: 0, targetCount: 2, statusEffect: { type: 'Addormentato', chance: 0.6 }, desc: 'Soffia polveri ipnotiche. Ha il 60% di probabilità di addormentare fino a due bersagli.' },
          'Fascino Botanico': { name: 'Fascino Botanico', type: 'Normale', power: 0, statusEffect: { type: 'Infatuato', chance: 1.0 }, targetStatDebuff: { atk: 0.7 }, desc: 'Ammalia il bersaglio infatuandolo (50% prob. di non attaccare) e ne riduce l\'Attacco del 30%.' },
          'Polline scottante': { name: 'Polline scottante', type: 'Fuoco', power: 70, statusEffect: { type: 'Scottato', chance: 1.0 }, desc: 'Soffia un polline infuocato. Infligge 70 danni e scotta infallibilmente il bersaglio.' },

          // NUOVE MOSSE MANTIDE
          'Colpo della Mantide': { name: 'Colpo della Mantide', type: 'Insetto', power: 82, priority: 1, desc: 'Un colpo fulmineo di arti marziali. Colpisce sempre per primo (Priorità +1).' },
          'Agopuntura': { name: 'Agopuntura', type: 'Insetto', power: 0, targetMode: 'ally', targetStatBuff: { atk: 1.5, spd: 1.5 }, desc: 'Sfrutta la conoscenza dei punti di pressione per potenziare un alleato: +50% Attacco e Velocità.' },
          'Raffica di Pugni': { name: 'Raffica di Pugni', type: 'Lotta', power: 20, multiHit: { min: 3, max: 5 }, desc: 'Una tempesta inarrestabile di pugni minuscoli. Colpisce in sequenza da 3 a 5 volte.' },
          'Schivata Acrobatica': { name: 'Schivata Acrobatica', type: 'Aria', power: 0, target: 'self', isProtect: true, priority: 5, maxUses: 3, desc: 'Sfrutta le sue dimensioni e l\'agilità per schivare ogni attacco per il turno corrente. (3 utilizzi)' },

          // NUOVE MOSSE ZAZAN
          'Aculeo Letale': { name: 'Aculeo Letale', type: 'Veleno', power: 85, statusEffect: { type: 'Avvelenato', chance: 0.5 }, desc: 'Infilza il nemico con il suo pungiglione. 50% di probabilità di avvelenare gravemente.' },
          'Metamorfosi Regina': { name: 'Metamorfosi Regina', type: 'Insetto', power: 0, target: 'self', statBuff: { atk: 1.5, def: 1.5 }, heal: 0.3, maxUses: 2, desc: 'Risveglia la sua vera forma. Si cura del 30% dei PS massimi e potenzia Attacco e Difesa del 50%.' },
          'Seta Imprigionante': { name: 'Seta Imprigionante', type: 'Insetto', power: 40, targetCount: 2, targetStatDebuff: { spd: 0.5 }, statusEffect: { type: 'Stordito', chance: 0.2 }, desc: 'Sputa ragnatele su due bersagli, dimezzandone permanentemente la Velocità. 20% probabilità di stordire.' },
          'Raggio del Giudizio': { name: 'Raggio del Giudizio', type: 'Oscuro', power: 100, recharge: true, ignoreDefBuffs: true, desc: 'Un raggio di pura malvagità distruttiva. Ignora i potenziamenti difensivi ma richiede un turno di ricarica.' },

          // NUOVE MOSSE ZATCH BELL
          'Zaker': { name: 'Zaker', type: 'Elettro', power: 80, statusEffect: { type: 'Elettrizzato', chance: 0.2 }, desc: 'Spara un fulmine dalla bocca. 20% di probabilità di paralizzare.' },
          'Rashield': { name: 'Rashield', type: 'Elettro', power: 0, target: 'self', isProtect: true, priority: 5, protectStatus: 'Rashield', desc: 'Uno scudo elettrico che blocca gli attacchi e riflette il 25% del danno all\'attaccante.' },
          'Zagurzem': { name: 'Zagurzem', type: 'Elettro', power: 0, statusEffect: { type: 'Magnetico', turns: 99, chance: 1.0 }, desc: 'Carica il nemico di magnetismo. Il prossimo attacco Elettro farà danni doppi e consumerà lo status.' },
          'Baou Zakeruga': { name: 'Baou Zakeruga', type: 'Elettro', power: 150, maxUses: 1, desc: 'Evoca un colossale drago elettrico. Danni immensi, ma utilizzabile solo 1 volta.' },

          // NUOVE MOSSE RENA ROUGE
          'Miraggio!': { name: 'Miraggio!', type: 'Magico', power: 0, isSummon: ['clone_rosso', 'clone_verde'], maxUses: 4, requireSummonsDead: ['clone_rosso', 'clone_verde'], desc: 'Suona il flauto ed evoca due cloni illusori. Usabile solo se i cloni sono sconfitti. (4 utilizzi)' },
          'Colpo di flauto': { name: 'Colpo di flauto', type: 'Normale', power: 55, desc: 'Colpisce il nemico con il flauto magico.' },
          'Zuffa di colpi': { name: 'Zuffa di colpi', type: 'Normale', power: 150, recharge: true, desc: 'Una scarica di colpi violentissima. Richiede un turno di ricarica successivo al suo utilizzo.' },
          'Devia-colpi': { name: 'Devia-colpi', type: 'Normale', power: 0, target: 'self', isProtect: true, priority: 5, protectStatus: 'Rashield', maxUses: 3, desc: 'Ruota il bastone ad alta velocità per deviare l\'attacco e riflettere il 25% del danno al mittente.' },
          'Volpe rabbiosa': { name: 'Volpe rabbiosa', type: 'Normale', power: 75, desc: 'Scatena una serie di colpi precisi e letali contro il nemico.' },

          // NUOVE MOSSE LAXUS
          'Ruggito del Drago Fulmine': { name: 'Ruggito del Drago Fulmine', type: 'Elettro', power: 85, targetCount: 4, statusEffect: { type: 'Elettrizzato', chance: 0.3 }, desc: 'Un devastante ruggito elettrico che colpisce tutti i nemici in campo. 30% prob. di paralizzare.' },
          'Alabarda del Cielo': { name: 'Alabarda del Cielo', type: 'Elettro', power: 100, ignoreDefBuffs: true, desc: 'Lancia una lancia di puro fulmine che ignora le difese avversarie.' },
          'Combo Fairy Tale': { name: 'Combo Fairy Tale', type: 'Lotta', power: 25, multiHit: { min: 2, max: 5 }, hitStatDebuff: { def: 0.8, chance: 0.10 }, desc: 'Una combo inarrestabile di attacchi corpo a corpo. Colpisce da 2 a 5 volte. Ogni colpo ha il 10% di probabilità di ridurre la Difesa avversaria.' },
          'Fairy Law': { name: 'Fairy Law', type: 'Magico', power: 150, targetCount: 4, maxUses: 1, desc: 'Una magia suprema che annienta i nemici. Danni colossali a tutti, usabile 1 sola volta.' },

          // NUOVE MOSSE GARNET
          'Pugno Razzo': { name: 'Pugno Razzo', type: 'Lotta', power: 85, statusEffect: { type: 'Stordito', chance: 0.2 }, desc: 'Lancia i suoi guantoni con estrema violenza. 20% di probabilità di stordire.' },
          'Visione del Futuro': { name: 'Visione del Futuro', type: 'Magico', power: 0, target: 'self', isProtect: true, priority: 5, maxUses: 4, desc: 'Prevede l\'attacco nemico e lo evita, garantendo protezione per il turno.' },
          'Schianto Sismico': { name: 'Schianto Sismico', type: 'Roccia', power: 65, targetCount: 4, desc: 'Un colpo al suolo che fa tremare l\'arena, colpendo tutti i nemici in campo.' },
          'Forza dell\'Amore': { name: 'Forza dell\'Amore', type: 'Normale', power: 0, target: 'self', statBuff: { atk: 1.5, def: 1.5 }, desc: 'Trae forza dall\'essere una fusione perfetta. Aumenta Attacco e Difesa del 50.' },

          // NUOVE MOSSE LAPIS LAZULI
          'Getto Bollente': { name: 'Getto Bollente', type: 'Acqua', power: 75, statusEffect: { type: 'Scottato', chance: 0.2 }, desc: 'Colpisce il bersaglio con acqua bollente. 20% di probabilità di scottare.' },
          'Catene Oceaniche': { name: 'Catene Oceaniche', type: 'Acqua', power: 50, targetCount: 2, targetStatDebuff: { spd: 0.7 }, desc: 'Avvolge fino a due nemici nell\'acqua, riducendone la Velocità del 30%.' },
          'Torre d\'Acqua': { name: 'Torre d\'Acqua', type: 'Acqua', power: 120, recharge: true, desc: 'Solleva un\'enorme colonna d\'acqua dal suolo. Devastante, ma richiede un turno di ricarica.' },
          'Turbine Massiccio': { name: 'Turbine Massiccio', type: 'Aria', power: 60, hitStatDebuff: { spd: 0.7, chance: 0.3 }, desc: 'Con le sue ali evoca un turbine contro il bersaglio. 30% di probabilità di ridurre la Velocità.' },

          // NUOVE MOSSE AANG
          'Aliante Eolico': { name: 'Aliante Eolico', type: 'Aria', power: 0, target: 'self', statBuff: { spd: 2.0 }, desc: 'Sfrutta l\'aliante per librarsi in volo raddoppiando la sua Velocità.' },
          'Sfera d\'Aria': { name: 'Sfera d\'Aria', type: 'Aria', power: 80, speedScaling: true, desc: 'Spara una densa palla di vento. Il danno inflitto aumenta in base alla sua Velocità.' },
          'Stato Avatar': { name: 'Stato Avatar', type: 'Magico', power: 0, target: 'self', statBuff: { atk: 1.5, def: 1.5, spd: 1.5 }, maxUses: 1, desc: 'Entra nello Stato Avatar. Aumenta tutte le statistiche del 50%, ma usabile 1 sola volta.' },
          'Dominio degli Elementi': { name: 'Dominio degli Elementi', type: 'Magico', power: 110, targetCount: 4, recharge: true, desc: 'Scatena i quattro elementi su tutti i nemici. Richiede un turno di ricarica.' },

          // NUOVE MOSSE YUGO
          'Raggio Wakfu': { name: 'Raggio Wakfu', type: 'Magico', power: 85, desc: 'Spara un potente raggio di pura energia Wakfu.' },
          'Riflesso del Portale': { name: 'Riflesso del Portale', type: 'Magico', power: 0, target: 'self', isProtect: true, priority: 5, protectStatus: 'Rashield', maxUses: 4, desc: 'Apre un portale che assorbe l\'attacco e ne riflette il 25% al mittente.' },
          'Assalto Dimensionale': { name: 'Assalto Dimensionale', type: 'Magico', power: 75, ignoreDefBuffs: true, desc: 'Colpisce uscendo da un portale alle spalle del nemico, ignorandone le difese.' },
          'Danza Eliatrope': { name: 'Danza Eliatrope', type: 'Lotta', power: 30, multiHit: { min: 2, max: 3 }, hitStatDebuff: { def: 0.8, chance: 0.20 }, desc: 'Combo di calci rapidi potenziati dal Wakfu. Colpisce 2-3 volte, ogni colpo ha il 20% di probabilità di ridurre la Difesa.' },

          // NUOVE MOSSE SAGE E ARIANA GRANDE
          'Muro Protettivo': { name: 'Muro Protettivo', type: 'Magico', power: 0, targetMode: 'team', statusEffect: { type: 'Protetto', turns: 1 }, priority: 5, maxUses: 1, strictUses: true, desc: 'Alza un muro che difende tutti i compagni in campo per un turno. (1 utilizzo)' },
          'Sfera rallentante': { name: 'Sfera rallentante', type: 'Ghiaccio', power: 0, targetCount: 2, targetStatDebuff: { spd: 0.5 }, desc: 'Lancia una sfera rallentante sotto i piedi di due nemici diminuendone permanentemente la Velocità.' },
          'Non ucciderai i miei alleati!': { name: 'Non ucciderai i miei alleati!', type: 'Magico', power: 0, targetMode: 'revive', heal: 0.5, maxUses: 1, desc: 'Riporta in vita un personaggio sconfitto (tuo o di un compagno di squadra) con il 50% dei PS massimi.' },
          'Vandal': { name: 'Vandal', type: 'Normale', power: 80, statusEffect: { type: 'Stordito', chance: 0.15 }, desc: 'Spara con il fucile d\'assalto. 15% di probabilità di stordire il bersaglio (Headshot!).' },
          'questo è il mio vero potenziale': { name: 'questo è il mio vero potenziale', type: 'Cristallo', power: 0, targetMode: 'team', heal: 0.7, removeNegativeStatuses: true, targetStatBuff: { spd: 1.1 }, maxUses: 1, strictUses: true, desc: 'Sprigiona il suo vero potenziale! Cura tutto il team del 70% dei PS, rimuove gli status negativi e aumenta la Velocità di tutti del 10%. (1 utilizzo)' },

          'YUH!': { name: 'YUH!', type: 'Normale', power: 0, target: 'self', statBuff: { atk: 1.5 }, desc: 'Il suo iconico grido di battaglia che aumenta l\'Attacco del 50%.' },
          'Potere ariana grande': { name: 'Potere ariana grande: ATTIVAZIONE!', type: 'Magico', power: 90, targetCount: 2, desc: 'Sprigiona il suo potere infliggendo 90 danni a due bersagli.' },
          'Into You': { name: 'Into You', type: 'Suono', power: 60, statusEffect: { type: 'Infatuato', chance: 0.3 }, desc: 'Infligge danni e ha il 30% di probabilità di infatuare il nemico.' },
          'Bang Bang': { name: 'Bang Bang', type: 'Elettro', power: 0, statusEffect: { type: 'Elettrizzato', chance: 1.0 }, desc: 'Un colpo stordente che paralizza istantaneamente il bersaglio.' },
          'Dangerous Woman': { name: 'Dangerous Woman', type: 'Oscuro', power: 50, statusEffect: { type: 'Stordito', chance: 1.0 }, maxUses: 2, desc: 'Sprigiona l\'aura di una femme fatale. Infligge 50 danni e stordisce infallibilmente il bersaglio. (2 utilizzi)' },

          // NUOVE MOSSE MARIO & LUIGI
          'Salto Idraulico': { name: 'Salto Idraulico', type: 'Normale', power: 55, priority: 1, desc: 'Un classico salto sulla testa del nemico. Colpisce sempre per primo (Priorità +1).' },
          'Palla di Fuoco': { name: 'Palla di Fuoco', type: 'Fuoco', power: 75, statusEffect: { type: 'Scottato', chance: 0.3 }, desc: 'Lancia una palla di fuoco rimbalzante. 30% probabilità di scottare.' },
          'Martellata': { name: 'Martellata', type: 'Normale', power: 85, desc: 'Un colpo potente col martello, incredibilmente preciso.' },
          'Super Fungo': { name: 'Super Fungo', type: 'Normale', power: 0, target: 'self', heal: 0.4, statBuff: { atk: 1.3 }, desc: 'Mangia un Super Fungo per recuperare il 40% dei PS e aumentare l\'Attacco del 30%.' },
          
          'Salto Svolazzante': { name: 'Salto Svolazzante', type: 'Aria', power: 50, multiHit: { min: 2, max: 2 }, desc: 'Due colpi rapidi saltando a mezz\'aria.' },
          'Poltergust 3000': { name: 'Poltergust 3000', type: 'Normale', power: 60, targetStatDebuff: { spd: 0.5 }, desc: 'Risucchia il nemico dimezzandone permanentemente la Velocità.' },
          'Sguardo di Luigi': { name: 'Sguardo di Luigi', type: 'Normale', power: 0, targetCount: 4, targetStatDebuff: { atk: 0.7 }, desc: 'Fissa male tutti i nemici, riducendone l\'Attacco del 30%.' },
          'Missile Verde': { name: 'Missile Verde', type: 'Aria', power: 90, statusEffect: { type: 'Confuso', chance: 0.2 }, desc: 'Si lancia a testa bassa come un razzo. 20% di confondere.' },

          'Fratelli Bros': { name: 'Fratelli Bros', type: 'Lotta', power: 250, maxUses: 1, isCombo: ['mario', 'luigi'], specificComboEffects: { 'mario': { selfHeal: -0.20, statBuff: { def: 1.3 } }, 'luigi': { selfHeal: -0.20, statBuff: { spd: 1.3 } } }, desc: 'Mossa Combinata: 250 potenza. Aumenta la Difesa di Mario (+30%) e la Velocità di Luigi (+30%), ma entrambi perdono il 20% dei PS massimi. Consuma il turno di entrambi.' },

          // NUOVE MOSSE FINN & JAKE
          'Spada d\'Oro': { name: 'Spada d\'Oro', type: 'Lotta', power: 75, desc: 'Fende il nemico con la fidata spada d\'oro.' },
          'Calcio Volante Eroe': { name: 'Calcio Volante Eroe', type: 'Lotta', power: 50, priority: 1, desc: 'Un balzo istantaneo in faccia al nemico. Colpisce per primo (Priorità +1).' },
          'Zaino Verde': { name: 'Zaino Verde', type: 'Normale', power: 0, target: 'self', statBuff: { def: 1.5 }, desc: 'Usa lo zaino per parare i colpi, aumentando la Difesa del 50%.' },
          'Eroe di Ooo': { name: 'Eroe di Ooo', type: 'Lotta', power: 0, targetMode: 'team', targetStatBuff: { atk: 1.3 }, desc: 'Ispira la squadra: aumenta l\'Attacco di tutti gli alleati del 30%.' },

          'Lama Vulcanica': { name: 'Lama Vulcanica', type: 'Fuoco', power: 90, statusEffect: { type: 'Scottato', chance: 0.3 }, maxUses: 3, desc: 'Un fendente infuocato sprigionato dalla Forma Iper. 30% probabilità di scottare. (3 utilizzi)' },
          'Fulmine dell\'Eroe': { name: 'Fulmine dell\'Eroe', type: 'Elettro', power: 85, speedScaling: true, statusEffect: { type: 'Elettrizzato', chance: 0.3 }, maxUses: 3, desc: 'Un balzo caricato a pura elettricità. Scala con la Velocità e ha il 30% di prob. di paralizzare. (3 utilizzi)' },

          'Pugno Elastico': { name: 'Pugno Elastico', type: 'Lotta', power: 65, targetCount: 2, desc: 'Allunga le braccia colpendo fino a 2 nemici a distanza.' },
          'Trasformazione Scudo': { name: 'Trasformazione Scudo', type: 'Magico', power: 0, target: 'self', isProtect: true, priority: 5, maxUses: 3, desc: 'Prende la forma di uno scudo per parare i danni diretti a lui. (3 utilizzi)' },
          'Schiacciata Gigante': { name: 'Schiacciata Gigante', type: 'Magico', power: 100, accuracy: 0.8, desc: 'Diventa gigante e schiaccia il nemico. Devastante ma impreciso.' },
          'Bacon Pancakes': { name: 'Bacon Pancakes', type: 'Normale', power: 0, targetMode: 'ally', heal: 0.4, desc: 'Cucina dei deliziosi pancake curando un alleato o sé stesso del 40% dei PS.' },
          'Morsa del Demone': { name: 'Morsa del Demone', type: 'Buio', power: 85, statusEffect: { type: 'Stordito', chance: 0.3 }, maxUses: 3, desc: 'Usa i poteri elastici demoniaci per stritolare il nemico. 30% di probabilità di stordire. (3 utilizzi)' },

          // NUOVE MOSSE KRATOS
          'Lame del Caos': { name: 'Lame del Caos', type: 'Lotta', power: 65, targetCount: 2, desc: 'Fende l\'aria con le sue lame incatenate, colpendo fino a 2 nemici.' },
          'Rabbia di Sparta': { name: 'Rabbia di Sparta', type: 'Oscuro', power: 0, target: 'self', statBuff: { atk: 1.5, def: 1.5 }, heal: 0.2, desc: 'Scatena la sua furia divina: si cura del 20% e aumenta Attacco e Difesa del 50%.' },
          'Ascia Leviatano': { name: 'Ascia Leviatano', type: 'Ghiaccio', power: 85, statusEffect: { type: 'Congelato', chance: 0.3 }, desc: 'Scaglia la potente ascia magica. 30% di probabilità di congelare il nemico.' },
          'Furia Cieca': { name: 'Furia Cieca', type: 'Lotta', power: 120, ignoreDefBuffs: true, recharge: true, desc: 'Un attacco brutale che ignora le difese avversarie, ma richiede un turno di ricarica.' },

          // NUOVE MOSSE GOKU
          'Kamehameha': { name: 'Kamehameha', type: 'Magico', power: 95, desc: 'Scaglia un\'onda di energia Ki concentrata dalle mani.' },
          'Trasmissione Istantanea': { name: 'Trasmissione Istantanea', type: 'Aria', power: 0, target: 'self', isProtect: true, priority: 5, maxUses: 4, desc: 'Si teletrasporta per schivare ogni attacco per il turno corrente.' },
          'Raffica Meteorica': { name: 'Raffica Meteorica', type: 'Lotta', power: 25, multiHit: { min: 3, max: 5 }, desc: 'Una serie di colpi e calci ad altissima velocità. Colpisce da 3 a 5 volte.' },
          'Sfera Genkidama': { name: 'Sfera Genkidama', type: 'Magico', power: 150, targetCount: 4, maxUses: 1, desc: 'Raccoglie l\'energia dell\'universo in una sfera gigante. Danni enormi a tutti, 1 solo uso.' },

          // NUOVE MOSSE NATSU
          'Pugno di Ferro del Drago': { name: 'Pugno di Ferro del Drago', type: 'Fuoco', power: 80, statusEffect: { type: 'Scottato', chance: 0.3 }, desc: 'Avvolge il pugno nelle fiamme e colpisce. 30% di probabilità di scottare.' },
          'Ruggito del Drago di Fuoco': { name: 'Ruggito del Drago di Fuoco', type: 'Fuoco', power: 75, targetCount: 2, statusEffect: { type: 'Scottato', chance: 0.2 }, desc: 'Un soffio di fiamme devastante che colpisce fino a 2 nemici.' },
          'Mangiafuoco': { name: 'Mangiafuoco', type: 'Fuoco', power: 0, target: 'self', heal: 0.4, statBuff: { atk: 1.3 }, desc: 'Mangia le fiamme per ricaricarsi: recupera il 40% dei PS e aumenta l\'Attacco del 30%.' },
          'Loto Cremisi': { name: 'Loto Cremisi', type: 'Drago', power: 110, recharge: true, desc: 'Una tecnica segreta del Dragon Slayer. Danni estremi, ma richiede un turno di ricarica.' },

          // NUOVE MOSSE METAL SONIC
          'Carica Sonica': { name: 'Carica Sonica', type: 'Robot', power: 80, speedScaling: true, desc: 'Una carica a velocità supersonica avvolta da energia. Il danno scala con la Velocità.' },
          'Raggio Copia': { name: 'Raggio Copia', type: 'Oscuro', power: 0, targetStatDebuff: { atk: 0.7, spd: 0.7 }, desc: 'Analizza i dati dell\'avversario copiandoli e riducendone permanentemente Attacco e Velocità del 30%.' },
          'Scudo di Ioni': { name: 'Scudo di Ioni', type: 'Robot', power: 0, target: 'self', isProtect: true, priority: 5, maxUses: 3, desc: 'Genera un campo di forza impenetrabile per un turno. (3 utilizzi)' },
          'Maximum Overdrive': { name: 'Maximum Overdrive', type: 'Elettro', power: 120, recharge: true, desc: 'Sovraccarica i propri circuiti per un attacco devastante, ma necessita di ricarica nel turno successivo.' },

          // NUOVE MOSSE ZERGLING
          'Sciame Feroce': { name: 'Sciame Feroce', type: 'Insetto', power: 25, multiHit: { min: 3, max: 5 }, desc: 'Attacca con l\'istinto dello sciame, infliggendo da 3 a 5 colpi rapidi e letali.' },
          'Adrenalina Mutante': { name: 'Adrenalina Mutante', type: 'Oscuro', power: 0, target: 'self', statBuff: { spd: 2.0, atk: 1.3 }, desc: 'Il suo metabolismo subisce una brusca accelerazione: raddoppia la Velocità e aumenta l\'Attacco del 30%.' },
          'Artigli Laceranti': { name: 'Artigli Laceranti', type: 'Oscuro', power: 65, statusEffect: { type: 'Avvelenato', chance: 0.3 }, desc: 'Un attacco con artigli letali. Ha il 30% di probabilità di avvelenare gravemente.' },
          'Imboscata': { name: 'Imboscata', type: 'Insetto', power: 60, priority: 1, desc: 'Un assalto fulmineo dai punti ciechi. Colpisce sempre per primo (Priorità +1).' },

          // NUOVE MOSSE CELL
          'Assorbimento Vitale': { name: 'Assorbimento Vitale', type: 'Insetto', power: 70, drain: 0.5, desc: 'Infilza il nemico con il pungiglione, assorbendo il 50% dei danni inflitti per curarsi.' },
          'Kamehameha Solare': { name: 'Kamehameha Solare', type: 'Magico', power: 120, targetCount: 4, recharge: true, desc: 'Una Kamehameha capace di distruggere l\'intero sistema solare! Colpisce tutti ma richiede ricarica.' },
          'Barriera Perfetta': { name: 'Barriera Perfetta', type: 'Magico', power: 0, target: 'self', isProtect: true, priority: 5, protectStatus: 'Rashield', maxUses: 2, desc: 'Genera una barriera sferica di pura energia che blocca i danni e ne riflette il 25%. (2 utilizzi)' },
          'Teletrasporto Perfetto': { name: 'Teletrasporto Perfetto', type: 'Aria', power: 0, target: 'self', statBuff: { spd: 1.5, atk: 1.5 }, desc: 'Si sposta istantaneamente sorprendendo l\'avversario: aumenta Attacco e Velocità del 50%.' },
          'Raggio di Ki Piccolo': { name: 'Raggio di Ki Piccolo', type: 'Magico', power: 45, desc: 'Spara un piccolo ma potente raggio di energia concentrata.' },
          'Raffica di Calci': { name: 'Raffica di Calci', type: 'Lotta', power: 20, multiHit: { min: 2, max: 4 }, desc: 'Una sequenza velocissima di calci. Colpisce da 2 a 4 volte.' },

          // NUOVE MOSSE WHISPER
          'Consultazione Yo-kai Pad': { name: 'Consultazione Yo-kai Pad', type: 'Robot', power: 0, targetStatDebuff: { def: 0.5 }, selfStatBuff: { spd: 1.5, atk: 1.3 }, desc: 'Cerca informazioni sul pad: dimezza la Difesa avversaria e aumenta Attacco (+30%) e Velocità (+50%).' },
          'Sputo Ectoplasmatico': { name: 'Sputo Ectoplasmatico', type: 'Veleno', power: 70, statusEffect: { type: 'Avvelenato', chance: 0.6 }, desc: 'Sputa fastidioso ectoplasma. 60% di probabilità di avvelenare gravemente.' },
          'Consiglio Sbagliato': { name: 'Consiglio Sbagliato', type: 'Normale', power: 50, statusEffect: { type: 'Confuso', chance: 0.8 }, targetStatDebuff: { atk: 0.7 }, desc: 'Dà un consiglio fuorviante. 80% probabilità di confondere il nemico e ne riduce l\'Attacco del 30%.' },
          'Corpo Gassoso': { name: 'Corpo Gassoso', type: 'Spettro', power: 0, target: 'self', isProtect: true, priority: 5, maxUses: 4, desc: 'Si disperde come fumo per evitare completamente i danni nel turno. (4 utilizzi)' },

          // NUOVE MOSSE ASTRAL
          'Pesca del Destino': { name: 'Pesca del Destino', type: 'Magico', power: 0, target: 'self', statBuff: { atk: 1.5, spd: 1.5 }, heal: 0.2, desc: 'La carta perfetta! Si cura del 20% dei PS e aumenta Attacco e Velocità del 50%.' },
          'Potere dei Numeri': { name: 'Potere dei Numeri', type: 'Magico', power: 100, ignoreDefBuffs: true, desc: 'Sprigiona il potere cosmico di un mostro Numero, ignorando le difese.' },
          'Rete di Sovrapposizione': { name: 'Rete di Sovrapposizione', type: 'Magico', power: 0, targetMode: 'team', statusEffect: { type: 'Scudo Team', turns: 4 }, targetStatBuff: { atk: 1.3 }, desc: 'Scudo tattico: protegge il team per 4 turni e aumenta l\'Attacco del 30% a tutti.' },
          'Analisi Tattica': { name: 'Analisi Tattica', type: 'Magico', power: 0, targetStatDebuff: { atk: 0.5, def: 0.5 }, desc: 'Studia freddamente l\'avversario: dimezza permanentemente il suo Attacco e la sua Difesa.' },
          'Assorbimento Tenebroso': { name: 'Assorbimento Tenebroso', type: 'Oscuro', power: 70, drain: 0.25, desc: 'Dark Mist ruba energia vitale. Recupera il 25% dei danni inflitti.' },

          // NUOVE MOSSE YUSEI FUDO E GUARDIA
          'Evocazione Synchro': { name: 'Evocazione Synchro', type: 'Magico', power: 0, target: 'self', statBuff: { atk: 1.5, spd: 1.5 }, desc: 'Sintonizza i mostri per potenziare Attacco e Velocità del 50%.' },
          'Drago Polvere di Stelle': { name: 'Drago Polvere di Stelle', type: 'Aria', power: 95, targetCount: 2, desc: 'Evoca il Drago Polvere di Stelle per colpire fino a 2 nemici.' },
          'Accelerazione D-Wheel': { name: 'Accelerazione D-Wheel', type: 'Elettro', power: 60, speedScaling: true, desc: 'Investe i nemici con la moto. Il danno aumenta in base alla Velocità.' },
          'Forza Riflessa': { name: 'Forza Riflessa', type: 'Magico', power: 0, target: 'self', isProtect: true, priority: 5, protectStatus: 'Rashield', maxUses: 2, desc: 'Attiva una carta trappola! Protegge e riflette il 25% dei danni per un turno. (2 utilizzi)' },
          
          'Guardie!': { name: 'Guardie!', type: 'Normale', power: 0, isSummon: 'carta_guardia', maxUses: 1, desc: 'Evoca una fedele Carta Guardia in campo. (1 utilizzo)' },
          'Madre, abbiate forza!': { name: 'Madre, abbiate forza!', type: 'Magico', power: 0, targetMode: 'ally', specificAlly: 'Strega', targetStatBuff: { spd: 1.5 }, desc: 'Dona energia alla Strega, aumentandone la Velocità del 50%. Funziona SOLO sulla Strega!' },
          'Colpo di spada (Guardia)': { name: 'Colpo di spada', type: 'Normale', power: 65, desc: 'Un fendente della guardia. Possiede un bonus intrinseco del +25% ai danni.' },

          // NUOVE MOSSE GODZILLA
          'Raggio Atomico': { name: 'Raggio Atomico', type: 'Fuoco', power: 120, ignoreDefBuffs: true, recharge: true, desc: 'Il suo iconico raggio radioattivo. Danni devastanti ma richiede un turno di ricarica.' },
          'Colpo di Coda': { name: 'Colpo di Coda', type: 'Lotta', power: 85, targetCount: 2, desc: 'Una possente spazzata con l\'enorme coda che colpisce fino a 2 nemici.' },
          'Ruggito del Re': { name: 'Ruggito del Re', type: 'Drago', power: 0, targetCount: 4, targetStatDebuff: { atk: 0.7, spd: 0.7 }, statusEffect: { type: 'Stordito', chance: 0.2 }, desc: 'Un ruggito assordante che terrorizza tutti i nemici, riducendo Attacco e Velocità. 20% di stordire.' },
          'Rigenerazione G': { name: 'Rigenerazione G', type: 'Normale', power: 0, target: 'self', heal: 0.3, statBuff: { def: 1.3 }, desc: 'Sfrutta le sue cellule rigenerative per curarsi del 30% dei PS e aumentare la Difesa del 30%.' },

          // NUOVE MOSSE JURI (YU YU HAKUSHO)
          'Via all Incontro!': { name: 'Via all\'Incontro!', type: 'Aria', power: 50, priority: 1, targetCount: 4, statusEffect: { type: 'Stordito', chance: 0.2 }, desc: 'Dà inizio allo scontro cogliendo tutti di sorpresa! Colpisce per prima (Priorità +1) con 20% prob. di stordire.' },
          'Coda Demoniaca': { name: 'Coda Demoniaca', type: 'Oscuro', power: 70, statusEffect: { type: 'Confuso', chance: 0.3 }, desc: 'Un colpo frustante con la sua coda da demone. 30% di probabilità di confondere.' },
          'Fuga Tattica': { name: 'Fuga Tattica', type: 'Aria', power: 100, speedScaling: true, desc: 'Finge di fuggire per poi lanciarsi in picchiata a velocità inaudita! Il danno scala con la Velocità.' },
          'Chiamata Fuori Campo': { name: 'Chiamata Fuori Campo', type: 'Magico', power: 0, targetStatDebuff: { atk: 0.5 }, desc: 'L\'arbitro è insindacabile! Sgrida duramente un nemico, dimezzandone permanentemente l\'Attacco.' },

          // NUOVE MOSSE GASTON
          'Fucile da Caccia': { name: 'Fucile da Caccia', type: 'Normale', power: 90, desc: 'Spara un colpo letale con il suo inseparabile fucile da caccia.' },
          'Cinque Dozzine di Uova': { name: 'Cinque Dozzine di Uova', type: 'Normale', power: 0, target: 'self', heal: 0.4, statBuff: { atk: 1.5 }, desc: 'Divora dozzine di uova crude! Recupera il 40% dei PS e aumenta l\'Attacco del 50%.' },
          'Nessuno è come Gaston!': { name: 'Nessuno è come Gaston!', type: 'Lotta', power: 0, targetMode: 'team', targetStatBuff: { atk: 1.3, def: 1.3 }, desc: 'Vanta le sue doti fisiche ispirando ammirazione: aumenta Attacco e Difesa di tutto il team del 30%.' },
          'Schianto del Bullo': { name: 'Schianto del Bullo', type: 'Lotta', power: 85, statusEffect: { type: 'Stordito', chance: 0.3 }, desc: 'Una rissa da taverna in un solo colpo. 30% di probabilità di stordire il nemico.' },

          // NUOVE MOSSE CHAT NOIR
          'Bastone Estendibile': { name: 'Bastone Estendibile', type: 'Lotta', power: 50, multiHit: { min: 1, max: 2 }, desc: 'Colpisce il nemico da lontano con il suo bastone estendibile. Può colpire 1 o 2 volte.' },
          'Cataclisma': { name: 'Cataclisma', type: 'Buio', power: 150, ignoreDefBuffs: true, maxUses: 4, desc: 'Il potere della distruzione assoluta! Ignora le difese nemiche infliggendo danni mostruosi. (4 utilizzi)' },
          'Balzo Felino': { name: 'Balzo Felino', type: 'Aria', power: 0, target: 'self', isProtect: true, priority: 5, maxUses: 4, desc: 'Un agilissimo salto acrobatico che gli permette di schivare i danni per un turno. (4 utilizzi)' },
          'Fascino Sfacciato': { name: 'Fascino Sfacciato', type: 'Normale', power: 0, targetStatDebuff: { def: 0.7 }, statusEffect: { type: 'Infatuato', chance: 0.5 }, desc: 'Fa l\'occhiolino e dice una battuta: riduce la Difesa avversaria e ha il 50% di infatuare il nemico.' },

          // NUOVE MOSSE VIPERION
          'Colpo di arpa': { name: 'Colpo di arpa', type: 'Suono', power: 80, desc: 'Un colpo sonoro scagliato pizzicando le corde dell\'arpa.' },
          'Seconda occasione!': { name: 'Seconda occasione!', type: 'Magico', power: 0, priority: 1, targetMode: 'ally', healLastTurnDamage: true, desc: 'Riporta indietro il tempo per un alleato, ripristinando i PS che ha perso nel turno precedente.' },

          // NUOVE MOSSE CARAPACE E RYUKO
          'Boomerang tartaruga': { name: 'Boomerang tartaruga', type: 'Normale', power: 50, targetCount: 2, desc: 'Lancia il suo scudo come un boomerang, colpendo fino a due bersagli.' },
          'Scudo protettivo!': { name: 'Scudo protettivo!', type: 'Magico', power: 0, targetMode: 'team', statusEffect: { type: 'Protetto', turns: 1 }, priority: 5, maxUses: 1, strictUses: true, desc: 'Genera una cupola impenetrabile che difende tutti i compagni in campo per un turno. (1 utilizzo)' },
          'Drago d\'Acqua!': { name: 'Drago d\'Acqua!', type: 'Acqua', power: 60, desc: 'Evoca il potere del drago dell\'acqua.' },
          'Drago del Fulmine!': { name: 'Drago del Fulmine!', type: 'Elettro', power: 60, desc: 'Evoca il potere del drago del fulmine.' },
          'Drago del Vento!': { name: 'Drago del Vento!', type: 'Aria', power: 60, desc: 'Evoca il potere del drago del vento.' },

          // NUOVE MOSSE KING MONKEY
          'Confusione!': { name: 'Confusione!', type: 'Magico', power: 40, statusEffect: { type: 'Confuso', chance: 1.0 }, desc: 'Scatena il caos! Infligge 40 danni e confonde irrimediabilmente il bersaglio.' },

          // NUOVE MOSSE IRIS
          'Cristallo di Ephedia': { name: 'Cristallo di Ephedia', type: 'Magico', power: 85, desc: 'Scaglia una solida lancia di cristallo magico contro il bersaglio.' },
          'Scudo Cristallino': { name: 'Scudo Cristallino', type: 'Magico', power: 0, targetMode: 'team', statusEffect: { type: 'Scudo Team', turns: 4 }, desc: 'Avvolge gli alleati in una barriera di cristallo, proteggendoli per 4 turni (moltiplica Difesa x3).' },
          'Voce della Principessa': { name: 'Voce della Principessa', type: 'Magico', power: 0, targetMode: 'team_smart_heal', healAlone: 0.5, healTeam: 0.3, removeNegativeStatuses: true, desc: 'Canta una dolce melodia che cura il team del 30% (50% se sola) e purifica da ogni status negativo.' },
          'Trasformazione Shanila': { name: 'Trasformazione Shanila', type: 'Magico', power: 0, target: 'self', statBuff: { atk: 1.5, spd: 1.5 }, maxUses: 1, desc: 'Raggiunge lo stadio Shanila! Sprigiona il suo vero potere aumentando Attacco e Velocità del 50%. (1 utilizzo)' },
          
          // NUOVE MOSSE STELLARUBIA
          'Starbolts': { name: 'Starbolts', type: 'Fuoco', power: 85, targetCount: 2, desc: 'Lancia sfere di energia infuocata colpendo fino a 2 nemici.' },
          'Volo Supersonico': { name: 'Volo Supersonico', type: 'Aria', power: 0, target: 'self', statBuff: { spd: 2.0 }, desc: 'Spicca il volo a velocità estreme raddoppiando la sua Velocità.' },
          'Furia Tamaraniana': { name: 'Furia Tamaraniana', type: 'Lotta', power: 110, ignoreDefBuffs: true, desc: 'Un attacco fisico furioso che ignora le difese nemiche.' },
          'Raggio Oculare': { name: 'Raggio Oculare', type: 'Fuoco', power: 75, statusEffect: { type: 'Scottato', chance: 0.4 }, desc: 'Un raggio di calore concentrato dagli occhi. 40% di probabilità di scottare.' },

          // NUOVE MOSSE BUMBLEBEE
          'Pungiglione Elettrico': { name: 'Pungiglione Elettrico', type: 'Elettro', power: 75, statusEffect: { type: 'Elettrizzato', chance: 0.3 }, desc: 'Una scossa letale dalle sue armi. 30% di probabilità di paralizzare.' },
          'Pungiglione': { name: 'Pungiglione', type: 'Insetto', power: 80, desc: 'Un attacco fulmineo e letale con il pungiglione.' },
          'Rimpicciolimento': { name: 'Rimpicciolimento', type: 'Insetto', power: 0, target: 'self', isProtect: true, priority: 5, maxUses: 4, desc: 'Diventa minuscola per schivare ogni attacco avversario per un turno. (4 utilizzi)' },
          'Raffica Sonica': { name: 'Raffica Sonica', type: 'Robot', power: 25, multiHit: { min: 2, max: 4 }, desc: 'Attacca con piccole raffiche di energia colpendo da 2 a 4 volte.' },
          'Raggio Esplosivo': { name: 'Raggio Esplosivo', type: 'Elettro', power: 90, desc: 'Carica le sue armi al massimo per sparare un raggio devastante.' },

          // NUOVE MOSSE CHARMCASTER
          'Mostro di Pietra': { name: 'Mostro di Pietra', type: 'Magico', power: 0, isSummon: 'golem_pietra', maxUses: 2, strictUses: true, desc: 'Anima la pietra per evocare un possente Golem in campo! (2 utilizzi)' },
          'Fulmine Viola': { name: 'Fulmine Viola', type: 'Magico', power: 80, statusEffect: { type: 'Confuso', chance: 0.3 }, desc: 'Un fulmine magico oscuro. 30% di probabilità di confondere il bersaglio.' },
          'Borsa Magica': { name: 'Borsa Magica', type: 'Magico', power: 0, target: 'self', heal: 0.4, statBuff: { atk: 1.3 }, desc: 'Estrae un artefatto dalla sua borsa: si cura del 40% e aumenta l\'Attacco del 30%.' },
          'Maledizione': { name: 'Maledizione', type: 'Oscuro', power: 0, targetStatDebuff: { atk: 0.6, spd: 0.6 }, desc: 'Lancia un malocchio che riduce drasticamente (40%) Attacco e Velocità del nemico.' },

          // NUOVE MOSSE SHEGO
          'Artigli di Plasma': { name: 'Artigli di Plasma', type: 'Fuoco', power: 85, ignoreDefBuffs: true, desc: 'Taglia il nemico con artigli di plasma fiammeggiante ignorandone le difese.' },
          'Calcio Acrobatico': { name: 'Calcio Acrobatico', type: 'Lotta', power: 70, speedScaling: true, desc: 'Un calcio letale sferrato con estrema agilità. Il danno aumenta con la Velocità.' },
          'Sfera di Fuoco Verde': { name: 'Sfera di Fuoco Verde', type: 'Fuoco', power: 65, targetCount: 2, desc: 'Lancia plasma esplosivo colpendo fino a due avversari.' },
          'Rigenerazione Cellulare': { name: 'Rigenerazione Cellulare', type: 'Normale', power: 0, target: 'self', heal: 0.5, desc: 'Grazie al suo lieve fattore di guarigione, recupera il 50% dei PS massimi.' },

          // NUOVE MOSSE HANNIBAL
          'Banchetto Macabro': { name: 'Banchetto Macabro', type: 'Oscuro', power: 75, drain: 0.5, desc: 'Un morso letale. Assorbe il 50% dei danni inflitti per curarsi.' },
          'Analisi Psicologica': { name: 'Analisi Psicologica', type: 'Oscuro', power: 0, targetStatDebuff: { def: 0.5 }, statusEffect: { type: 'Stordito', chance: 0.4 }, desc: 'Entra nella mente del nemico. Ne dimezza la Difesa e ha il 40% di stordirlo.' },
          'Colpo di Scalpello': { name: 'Colpo di Scalpello', type: 'Normale', power: 90, accuracy: 0.85, statusEffect: { type: 'Avvelenato', chance: 0.2 }, desc: 'Un fendente letale e chirurgico. 85% precisione, 20% probabilità di veleno.' },
          'Buone Maniere': { name: 'Buone Maniere', type: 'Normale', power: 0, targetMode: 'ally', heal: 0.4, targetStatBuff: { atk: 1.3 }, desc: 'Un pasto eccellente per un alleato: lo cura del 40% e ne aumenta l\'Attacco del 30%.' },
          
          // NUOVE MOSSE PO
          'Pancia Rimbalzante': { name: 'Pancia Rimbalzante', type: 'Lotta', power: 85, statusEffect: { type: 'Stordito', chance: 0.3 }, desc: 'Sfrutta la sua pancia morbida per respingere il nemico. 30% di probabilità di stordire.' },
          'Presa del Dito Wuxi': { name: 'Presa del Dito Wuxi', type: 'Magico', power: 150, maxUses: 1, ignoreDefBuffs: true, desc: 'Skadoosh! Un colpo mistico devastante e imparabile. Ignora le difese. (Solo 1 utilizzo)' },
          'Maestro del Chi': { name: 'Maestro del Chi', type: 'Magico', power: 0, target: 'self', heal: 0.4, statBuff: { atk: 1.3, def: 1.3 }, desc: 'Canalizza l\'energia dell\'universo. Si cura del 40% e aumenta Attacco e Difesa del 30%.' },
          'Attacco mentale del panda impacciato': { name: 'Attacco mentale del panda impacciato', type: 'Psico', power: 80, desc: 'Un colpo tutto strano e impacciato che spiazza il nemico. Infligge 80 danni psichici.' },

          // NUOVE MOSSE ROBIN
          'Birdarang': { name: 'Birdarang', type: 'Robot', power: 65, targetCount: 2, desc: 'Lancia i suoi iconici gadget esplosivi. Colpisce fino a 2 nemici in campo.' },
          'Bo Staff': { name: 'Bo Staff', type: 'Lotta', power: 25, multiHit: { min: 3, max: 4 }, desc: 'Raffica di colpi letali con il bastone telescopico. Colpisce da 3 a 4 volte.' },
          'Bomba Fumogena': { name: 'Bomba Fumogena', type: 'Aria', power: 0, target: 'self', isProtect: true, priority: 5, maxUses: 3, desc: 'Crea una cortina di fumo per schivare ogni attacco per un turno intero. (3 utilizzi)' },
          'Calcio Volante Tattico': { name: 'Calcio Volante Tattico', type: 'Lotta', power: 75, speedScaling: true, desc: 'Un calcio preciso e acrobatico. Il danno aumenta in proporzione alla sua Velocità.' },

          // NUOVE MOSSE SPONGEBOB
          'Bolla di Sapone': { name: 'Bolla di Sapone', type: 'Acqua', power: 60, statusEffect: { type: 'Stordito', chance: 0.2 }, desc: 'Spara una bolla di sapone resistente. 20% di probabilità di stordire il nemico.' },
          'Risata Assordante': { name: 'Risata Assordante', type: 'Normale', power: 0, targetCount: 4, targetStatDebuff: { atk: 0.7 }, statusEffect: { type: 'Confuso', chance: 0.3 }, desc: 'Una risata iconica ma fastidiosa. Riduce l\'Attacco di tutti i nemici e può confonderli (30%).' },
          'Spugna Assorbente': { name: 'Spugna Assorbente', type: 'Acqua', power: 0, target: 'self', heal: 0.5, statBuff: { def: 1.5 }, desc: 'Assorbe l\'umidità per curare il 50% dei PS e aumentare la Difesa del 50%.' },
          'Karate Spugnoso': { name: 'Karate Spugnoso', type: 'Lotta', power: 70, speedScaling: true, desc: 'Indossa i guantoni da Karate! Il danno inflitto aumenta in proporzione alla sua Velocità.' },

          // NUOVE MOSSE PATRICK
          'Schianto Stella': { name: 'Schianto Stella', type: 'Lotta', power: 90, statusEffect: { type: 'Stordito', chance: 0.3 }, desc: 'Un salto di pancia devastante. 30% di probabilità di stordire il bersaglio.' },
          'Non sono Rick!': { name: 'Non sono Rick!', type: 'Acqua', power: 50, statusEffect: { type: 'Confuso', chance: 0.5 }, desc: 'Urla arrabbiato il suo nome. Infligge danni e ha il 50% di probabilità di confondere.' },
          'Riposino sotto la Roccia': { name: 'Riposino sotto la Roccia', type: 'Roccia', power: 0, target: 'self', heal: 0.5, statBuff: { def: 1.5 }, desc: 'Torna sotto la sua roccia per farsi un sonnellino. Si cura del 50% e aumenta la Difesa.' },
          'Lancio del Sasso': { name: 'Lancio del Sasso', type: 'Roccia', power: 30, multiHit: { min: 2, max: 4 }, desc: 'Raccoglie e lancia sassi trovati in giro. Colpisce l\'avversario da 2 a 4 volte.' },
          'A caccia di meduse': { name: 'A caccia di meduse', type: 'Acqua', power: 250, ignoreDefBuffs: true, maxUses: 1, isCombo: ['spongebob', 'patrick'], specificComboEffects: { 'patrick': { selfHeal: -0.75 }, 'spongebob': { statBuff: { atk: 1.5, def: 1.5, spd: 1.5 } } }, desc: 'Mossa Combinata: potenza 250 e ignora i potenziamenti difensivi. Patrick perde il 75% dei PS massimi, mentre Spongebob ottiene +50% Attacco, Difesa e Velocità.' },

          // NUOVE MOSSE PLANKTON
          'Laser Mentale': { name: 'Laser Mentale', type: 'Robot', power: 85, statusEffect: { type: 'Confuso', chance: 0.3 }, desc: 'Spari ad alta tecnologia. 30% di probabilità di confondere il nemico.' },
          'Piano Z': { name: 'Piano Z', type: 'Oscuro', power: 0, target: 'self', statBuff: { atk: 1.5, spd: 1.3 }, maxUses: 2, strictUses: true, desc: 'Il piano malvagio definitivo! +50% Attacco e +30% Velocità. (2 utilizzi)' },
          'Karen, Aiuto!': { name: 'Karen, Aiuto!', type: 'Robot', power: 0, targetMode: 'ally', targetStatBuff: { def: 2.0 }, heal: 0.3, desc: 'Sfrutta l\'aiuto di sua moglie Karen per curare un alleato del 30% e raddoppiarne la Difesa.' },
          'Furto della Ricetta': { name: 'Furto della Ricetta', type: 'Oscuro', power: 75, drain: 0.6, targetStatDebuff: { atk: 0.7 }, desc: 'Ruba l\'energia (e la ricetta!) al nemico. Drena il 60% del danno e ne riduce l\'Attacco.' },

          // NUOVE MOSSE MARCELINE
          'Assolo demoniaco': { name: 'Assolo demoniaco', type: 'Spettro', power: 70, ignoreDefBuffs: true, desc: 'Suona un accordo brutale con il suo basso-ascia ignorando i potenziamenti difensivi del bersaglio.' },
          'Melodia spettrale': { name: 'Melodia spettrale', type: 'Spettro', power: 0, targetStatDebuff: { atk: 0.5 }, desc: 'Una ninnananna inquietante e sovrannaturale che dimezza permanentemente l\'Attacco del nemico.' },
          'Morso vampirico': { name: 'Morso vampirico', type: 'Oscuro', power: 75, drain: 0.5, desc: 'Morde il bersaglio per nutrirsi del colore rosso (o del sangue). Recupera il 50% dei danni inflitti.' },
          'Nebbia cremisi': { name: 'Nebbia cremisi', type: 'Veleno', power: 10, statusEffect: { type: 'Avvelenato', chance: 1.0 }, desc: 'Emana una coltre di nebbia tossica. Infligge danni lievi ma avvelena sicuramente il nemico.' },

          // NUOVE MOSSE PENNY
          'Akur!': { name: 'Akur!', type: 'Acqua', power: 80, statusEffect: { type: 'Confuso', chance: 0.10 }, desc: 'Un\'ondata d\'acqua travolgente. 10% di probabilità di confondere.' },
          'guarda il mio faccino!': { name: 'guarda il mio faccino!', type: 'Normale', power: 0, targetStatDebuff: { atk: 0.7 }, statusEffect: { type: 'Infatuato', chance: 0.80 }, desc: 'Diminuisce l\'Attacco avversario e ha l\'80% di probabilità di infatuare.' },
          'Akur Kiro!': { name: 'Akur Kiro!', type: 'Acqua', power: 60, targetCount: 4, desc: 'Lancia lame taglienti d\'acqua a tutti gli avversari in campo.' },
          'Sou Giakuru!': { name: 'Sou Giakuru!', type: 'Acqua', power: 125, maxUses: 2, statusEffect: { type: 'Confuso', chance: 0.70 }, desc: 'Drago d\'acqua di potenza 125: 70% di probabilità di confondere il bersaglio. (2 utilizzi)' },

          // NUOVE MOSSE BRAGO
          'Gravirei': { name: 'Gravirei', type: 'Oscuro', power: 80, targetStatDebuff: { spd: 0.7 }, desc: 'Schiaccia il nemico con la gravità. Diminuisce la Velocità del 30%.' },
          'Oruga Reis': { name: 'Oruga Reis', type: 'Oscuro', power: 70, targetCount: 2, desc: 'Spara due sfere di gravità che colpiscono fino a 2 bersagli.' },
          'Dioga Gravidon': { name: 'Dioga Gravidon', type: 'Oscuro', power: 150, targetCount: 4, recharge: true, desc: 'Sfera di energia gravitazionale gigante. Colpisce tutti i nemici ma richiede ricarica.' },
          'Nyoborotsu Ma Gravirei': { name: 'Nyoborotsu Ma Gravirei', type: 'Oscuro', power: 90, statusEffect: { type: 'Confuso', chance: 0.4 }, targetStatDebuff: { spd: 0.7 }, recoil: 0.5, desc: 'Una sfera gravitazionale a doppio strato. 40% di confondere e rallentare, ma Brago subisce il 50% dei danni inflitti come contraccolpo.' },

          // NUOVE MOSSE PONYGON
          'Shudoruku': { name: 'Shudoruku', type: 'Fuoco', power: 0, target: 'self', statBuff: { atk: 1.3, def: 1.3, spd: 1.3 }, statusEffect: { type: 'Shudoruku', turns: 99 }, desc: 'L\'armatura magica. Aumenta Attacco, Difesa e Velocità del 30%.' },
          'Dioemuru Shudoruku': { name: 'Dioemuru Shudoruku', type: 'Fuoco', power: 0, target: 'self', statBuff: { atk: 1.6, def: 1.6, spd: 1.6 }, requiredStatus: 'Shudoruku', statusEffect: { type: 'Dioemuru', turns: 99 }, desc: 'Armatura infuocata! (Richiede Shudoruku). Aumenta ancora le statistiche del 60%.' },
          'Shin Shudoruku': { name: 'Shin Shudoruku', type: 'Fuoco', power: 150, requiredStatus: 'Dioemuru', desc: 'Carica suprema. (Utilizzabile solo se Dioemuru Shudoruku è attivo).' },
          'Ondata di calore': { name: 'Ondata di calore', type: 'Fuoco', power: 60, targetCount: 4, desc: 'Emana calore estremo colpendo tutti gli avversari in campo.' },

          // NUOVA MOSSA COMBINATA ZATCH BELL & PONYGON
          'Carica del Re Fulmine': { name: 'Carica del Re Fulmine', type: 'Elettro', power: 220, maxUses: 1, isCombo: ['zatchbell', 'ponygon'], specificComboEffects: { 'zatchbell': { selfHeal: -0.15, statBuff: { atk: 1.5 } }, 'ponygon': { selfHeal: -0.15, statBuff: { spd: 2.0, def: 1.5 } } }, desc: 'Mossa Combinata: Danni devastanti (220). Zatch monta in sella a Ponygon in un assalto di fiamme e fulmini! Costa il 15% dei PS a entrambi, ma potenzia Zatch (+50% Atk) e Ponygon (+100% Spd, +50% Def).' },

          // NUOVE MOSSE TRIGON E GASTER
          'Inferno demoniaco': { name: 'Inferno demoniaco', type: 'Fuoco', power: 100, targetCount: 4, statusEffect: { type: 'Scottato', chance: 0.5 }, desc: 'Fiamme infernali che colpiscono tutti i bersagli. 50% di probabilità di scottare i nemici.' },
          'Sguardo dell\'abisso': { name: 'Sguardo dell\'abisso', type: 'Oscuro', power: 0, targetStatDebuff: { atk: 0.5 }, desc: 'Uno sguardo terrificante che terrorizza il nemico, dimezzandone permanentemente l\'Attacco (diminuisce di 2 stage).' },
          'Artigli dell\'apocalisse': { name: 'Artigli dell\'apocalisse', type: 'Oscuro', power: 90, drain: 0.6, desc: 'Fendente apocalittico. Ha una probabilità di recuperare gran parte dell\'energia (drena 60% danni inflitti).' },
          'Corvina unisciti a me!': { name: 'Corvina unisciti a me!', type: 'Oscuro', power: 0, isSummon: 'clone_corvina', maxUses: 2, strictUses: true, desc: 'Costringe un frammento dell\'anima di sua figlia a combattere. Evoca Clone Corvina. (2 utilizzi)' },

          'Frattura della realtà': { name: 'Frattura della realtà', type: 'Spettro', power: 110, statusEffect: { type: 'Confuso', chance: 0.3 }, recharge: true, desc: 'Distorce il tessuto spaziotemporale. 30% di confondere. Richiede ricarica nel turno successivo.' },
          'Errore 404': { name: 'Errore 404', type: 'Oscuro', power: 30, priority: 3, statusEffect: { type: 'Stordito', chance: 1.0 }, maxUses: 1, desc: 'Un glitch istantaneo. Colpisce per primo (priorità alta) e fa tentennare il bersaglio (stordisce al 100%). Usabile solo 1 volta.' },
          'Teletrasporto instabile': { name: 'Teletrasporto instabile', type: 'Magico', power: 0, target: 'self', isProtect: true, priority: 5, desc: 'Scompare nel vuoto per schivare ogni attacco del turno. Fallisce se usato di fila.' },
          'Gaster Blaster': { name: 'Gaster Blaster', type: 'Robot', power: 50, targetCount: 2, desc: 'Evoca dei teschi fluttuanti che sparano raggi laser. Colpisce 2 bersagli.' },

          // NUOVE MOSSE JAKE (DC)
          'Battuta Fuori Luogo': { name: 'Battuta Fuori Luogo', type: 'Normale', power: 0, targetStatDebuff: { atk: 0.6 }, desc: 'Una battuta inopportuna che irrita il nemico, riducendone drasticamente (40%) l\'Attacco.' },
          'Sguardo Omosessuale': { name: 'Sguardo Omosessuale', type: 'Magico', power: 0, statusEffect: { type: 'Infatuato', chance: 1.0 }, desc: 'Lancia un\'occhiata profonda che infatua infallibilmente il nemico (50% probabilità di non attaccare).' },
          'Tom difendimi!': { name: 'Tom difendimi!', type: 'Lotta', power: 95, targetCount: 2, desc: 'Chiama Tom in soccorso! Un potente attacco fisico che colpisce fino a 2 bersagli a scelta.' },
          'Lanciafiamme Rubato': { name: "\'Ho preso un lanciafiamme!\'", type: 'Fuoco', power: 70, statusEffect: { type: 'Scottato', chance: 1.0 }, desc: 'Usa un lanciafiamme trovato per caso! Infligge 70 danni e scotta sicuramente il nemico.' },

          // NUOVE MOSSE NIGHTWING E BUIO
          'Trappola d\'ombra': { name: 'Trappola d\'ombra', type: 'Buio', power: 30, removeBuffs: true, desc: 'Infligge danni e annulla tutti i potenziamenti alle statistiche (Atk, Def, Spd) del bersaglio.' },
          'Ala della notte': { name: 'Ala della notte', type: 'Buio', power: 100, maxUses: 1, statusEffect: { type: 'Confuso', chance: 1.0 }, desc: 'Un attacco dall\'alto devastante. Confonde il bersaglio al 100%. (1 utilizzo)' },
          'Colpo mirato': { name: 'Colpo mirato', type: 'Buio', power: 60, targetCount: 2, desc: 'Lancia i suoi dardi colpendo con precisione fino a 2 bersagli.' },
          'Fendente notturno': { name: 'Fendente notturno', type: 'Lotta', power: 85, desc: 'Un potente colpo marziale sferrato sfruttando l\'oscurità.' },

          // NUOVE MOSSE DORAEMON
          'Guanto Ruba-Mosse': { name: 'Guanto Ruba-Mosse', type: 'Robot', power: 40, stealMove: { turns: 3 }, desc: 'Ruba una mossa a caso dal bersaglio per 3 turni e infligge leggeri danni.' },
          'Torcia Cambia-Tipo': { name: 'Torcia Cambia-Tipo', type: 'Magico', power: 0, targetMode: 'ally', priority: 1, copyRandomEnemyType: true, desc: 'Priorità +1. Seleziona un alleato (o te stesso): copia i tipi di un nemico a caso e glieli assegna per sorprenderlo!' },
          'Cannone ad Aria': { name: 'Cannone ad Aria', type: 'Aria', power: 80, desc: 'Spara un potente proiettile d\'aria compressa dal suo iconico gadget.' },
          'Gadget di Supporto': { name: 'Gadget di Supporto', type: 'Robot', power: 0, targetMode: 'team', maxTeamTargets: 2, maxUses: 2, strictUses: true, targetStatBuff: { atk: 1.5, def: 1.5 }, desc: 'Estrae gadget dalla tasca 4D: +50% Attacco e Difesa fino a 2 alleati in campo. (2 utilizzi)' },

          // NUOVE MOSSE BULMA E AIUTANTI
          'Senzu per tutti': { name: 'Senzu per tutti', type: 'Normale', power: 0, targetMode: 'team_smart_heal', healAlone: 0.5, healTeam: 0.5, maxUses: 2, desc: 'Cura il 50% dei PS massimi di tutti gli alleati in campo. (2 utilizzi)' },
          'Capsula Gadget': { name: 'Capsula Gadget', type: 'Robot', power: 0, isSummon: ['robo_aiutante_1', 'robo_aiutante_2'], requireSummonsDead: ['robo_aiutante_1', 'robo_aiutante_2'], desc: 'Bulma lancia una capsula ed evoca 2 Robo Aiutanti in campo. (Utilizzabile solo se entrambi i robot sono sconfitti)' },
          'Geyser fotonico': { name: 'Geyser fotonico', type: 'Robot', power: 100, desc: 'Spara un potentissimo raggio di energia dalla sua mano robotica.' },
          'Cortocircuito': { name: 'Cortocircuito', type: 'Elettro', power: 300, suicide: true, desc: 'Sovraccarica il mech esplodendo! Danni immensi (300), ma costa la vita dell\'utilizzatore.' },
          'Difesa al minimo!': { name: 'Difesa al minimo!', type: 'Robot', power: 0, targetCount: 4, targetStatDebuff: { def: 0.7 }, desc: 'Diminuisce di uno stadio la Difesa di tutti gli avversari in campo.' },
          'Attacco al minimo!': { name: 'Attacco al minimo!', type: 'Robot', power: 0, targetCount: 4, targetStatDebuff: { atk: 0.7 }, desc: 'Diminuisce di uno stadio l\'Attacco di tutti gli avversari in campo.' },
          'Missile': { name: 'Missile', type: 'Robot', power: 80, desc: 'Spara un piccolo missile a ricerca che infligge 80 danni.' },

          // NUOVE MOSSE MAX CAULFIELD E CHLOE PRICE
          'Tempesta di Farfalle': { name: 'Tempesta di Farfalle', type: 'Insetto', power: 90, targetMode: 'any', targetCount: 2, healAlliesByDamage: true, desc: 'Evoca uno sciame mistico. Puoi bersagliare liberamente alleati o nemici (2 in totale). Ai nemici infligge 90 danni; se colpisce un alleato, lo cura per un valore pari al danno calcolato!' },
          'Rewind': { name: 'Rewind', type: 'Magico', power: 0, target: 'self', priority: 2, maxUses: 3, heal: 0.5, removeNegativeStatuses: true, desc: 'Riavvolge il tempo con priorità +2 per annullare i danni! Recupera il 50% dei PS e cura gli status. (3 utilizzi)' },
          'Eco Temporale': { name: 'Eco Temporale', type: 'Magico', power: 0, target: 'self', statBuff: { atk: 2.0 }, desc: 'Altera la linea temporale. Raddoppia il proprio Attacco per il prossimo colpo.' },
          'Polaroid Anomala': { name: 'Polaroid Anomala', type: 'Normale', power: 80, statusEffects: [{ type: 'Confuso', chance: 0.2 }, { type: 'Scottato', chance: 0.1 }], desc: 'Scatta una foto con un flash abbagliante. 20% di probabilità di confondere e 10% di scottare il bersaglio.' },
          'Tempesta di Arcadia Bay': { name: 'Tempesta di Arcadia Bay', type: 'Aria', power: 110, targetCount: 2, maxUses: 2, recharge: true, desc: 'Evoca un tornado devastante su 2 nemici. Richiede ricarica nel turno successivo.' },
          'Caos Assoluto': { name: 'Caos Assoluto', type: 'Luce', power: 120, targetCount: 4, maxUses: 2, statusEffect: { type: 'Confuso', chance: 0.5 }, desc: 'Un assolo ribelle di pura luce dalla potenza inaudita. Colpisce tutti i nemici con il 50% di probabilità di confonderli. (2 utilizzi)' },

          'Riff Ribelle': { name: 'Riff Ribelle', type: 'Suono', power: 80, statusEffect: { type: 'Confuso', chance: 0.1 }, desc: 'Colpo sonoro punk con la chitarra. 10% di probabilità di confondere.' },
          'Caos Punk': { name: 'Caos Punk', type: 'Suono', power: 50, statusEffects: [{ type: 'Avvelenato', chance: 0.25 }, { type: 'Scottato', chance: 0.25 }, { type: 'Confuso', chance: 0.25 }, { type: 'Infatuato', chance: 0.25 }], desc: 'Causa caos totale! Infligge 50 danni e può infliggere a caso veleno, scottatura, confusione o infatuazione.' },
          'Testa Calda': { name: 'Testa Calda', type: 'Normale', power: 0, target: 'self', statBuff: { atk: 1.5, spd: 1.5, def: 0.7 }, desc: 'Aumenta drasticamente Attacco e Velocità (+50%), ma diminuisce la Difesa (-30%).' },
          'Ride Or Die': { name: 'Ride Or Die', type: 'Normale', power: 90, desc: 'Un colpo implacabile! Infligge molti danni con il 100% di precisione.' },
          'Love is Strange': { name: 'Love is Strange', type: 'Magico', power: 150, maxUses: 1, isCombo: ['maxcaulfield', 'chloeprice'], selfStatBuff: { def: 2.0 }, desc: 'Mossa Combinata: 150 danni e Raddoppia la Difesa di Max e Chloe! Consuma il turno di entrambe.' },

          // NUOVE MOSSE MIKU
          'Vocal Burst': { name: 'Vocal Burst', type: 'Suono', power: 60, targetCount: 4, priority: 1, desc: 'Un\'esplosione vocale rapida che colpisce tutti i nemici (Priorità +1).' },
          'Melodia Curativa': { name: 'Melodia Curativa', type: 'Suono', power: 0, targetMode: 'team_smart_heal', healAlone: 0.5, healTeam: 0.5, removeNegativeStatuses: true, desc: 'Cura il 50% dei PS a tutto il team e purifica dalle alterazioni di stato. Perfetta per supporto.' },
          'Risonanza Mentale': { name: 'Risonanza Mentale', type: 'Magico', power: 70, selfStatBuff: { atk: 1.3 }, desc: 'Attacco a onde cerebrali che aumenta il proprio Attacco del 30% dopo aver colpito il nemico.' },
          'Canto Armonico': { name: 'Canto Armonico', type: 'Suono', power: 0, targetStatDebuff: { atk: 0.6 }, desc: 'Una melodia fastidiosa che riduce drasticamente l\'Attacco del bersaglio (del 40%).' },

          'Scudo Acustico': { name: 'Scudo Acustico', type: 'Suono', power: 0, target: 'self', isProtect: true, priority: 5, protectStatus: 'Rashield', maxUses: 3, desc: 'Frequenza barriera. Protegge dai danni e ne riflette il 25%. (3 utilizzi)' },
          
          // NUOVE MOSSE SOUNDWAVE
          'Onda d\'Urto': { name: 'Onda d\'Urto', type: 'Suono', power: 85, statusEffect: { type: 'Stordito', chance: 0.2 }, desc: 'Un\'onda sonora devastante. 20% di probabilità di stordire il nemico.' },
          'Laserbeak, all\'attacco!': { name: 'Laserbeak, all\'attacco!', type: 'Robot', power: 45, multiHit: { min: 2, max: 2 }, desc: 'Invia il suo fido compagno a colpire 2 volte il bersaglio.' },
          'Jammer di Frequenza': { name: 'Jammer di Frequenza', type: 'Elettro', power: 0, targetCount: 4, targetStatDebuff: { atk: 0.7, spd: 0.7 }, desc: 'Emette onde di disturbo. Riduce Attacco e Velocità di tutti i nemici.' },

          'Onda Melmosa': { name: 'Onda Melmosa', type: 'Veleno', power: 0, targetCount: 4, percentDmgMax: 0.30, statusEffect: { type: 'Avvelenato', chance: 0.4 }, desc: 'Un\'onda acida su tutti i nemici: toglie il 30% dei loro PS massimi e ha il 40% di avvelenare.' },
          
          // NUOVE MOSSE MOSTRI GIUNGLA (Pianta carnivora, Cespuglio, Alber(t)o, Fiore)
          'Gas velenoso': { name: 'Gas velenoso', type: 'Veleno', power: 50, statusEffect: { type: 'Avvelenato', chance: 1.0 }, desc: 'Emana un gas tossico. 100% di probabilità di avvelenare il bersaglio.' },
          'Fotosintesi offensiva': { name: 'Fotosintesi offensiva', type: 'Fuoco', power: 200, costHpPercent: 0.5, desc: 'Un attacco devastante da 200 danni. L\'utilizzatore sacrifica il 50% della propria vita massima per usarla.' },
          'Morso affilato': { name: 'Morso affilato', type: 'Erba', power: 75, desc: 'Un morso ferocissimo sferrato con zanne vegetali letali.' },
          'Nascondino Supremo': { name: 'Nascondino Supremo', type: 'Oscuro', power: 0, target: 'self', isProtect: true, priority: 5, maxUses: 3, desc: 'Si fonde con l\'ombra del bosco schivando ogni attacco nemico in questo turno. (3 utilizzi)' },
          'Spine maledette': { name: 'Spine maledette', type: 'Oscuro', power: 65, statusEffect: { type: 'Avvelenato', chance: 0.4 }, desc: 'Scaglia spine intrise di magia nera. 40% di probabilità di avvelenare il bersaglio.' },
          'Face demoniaca': { name: 'Face demoniaca', type: 'Spettro', power: 0, targetStatDebuff: { atk: 0.5, def: 0.5 }, desc: 'Mostra il terrificante volto intrappolato nel tronco, dimezzando permanentemente Attacco e Difesa nemica.' },
          'Ramo e stoccata': { name: 'Ramo e stoccata', type: 'Erba', power: 85, desc: 'Trafigge il nemico usando un ramo nodoso affilato come un\'enorme lancia.' },
          'Sguardo incattivito': { name: 'Sguardo incattivito', type: 'Buio', power: 0, statusEffect: { type: 'Stordito', chance: 0.8 }, desc: 'Uno sguardo di pura malvagità floreale. 80% di probabilità di stordire l\'avversario.' },
          
          // NUOVE MOSSE FATA COSMICA
          'Fata protettiva': { name: 'Fata protettiva', type: 'Magico', power: 0, targetMode: 'team', statusEffect: { type: 'Protetto', turns: 1 }, priority: 5, maxUses: 1, strictUses: true, desc: 'Difende tutti i compagni in campo da ogni attacco. (Solo 1 utilizzo)' },
          'Spirito!': { name: 'Spirito!', type: 'Aria', power: 0, targetMode: 'team', targetStatBuff: { spd: 1.5 }, maxUses: 2, desc: 'Energia spirituale che aumenta la Velocità di tutti gli alleati del 50%. (2 utilizzi)' },
          'ha,ha,ha!': { name: 'ha,ha,ha!', type: 'Suono', power: 0, targetMode: 'team', removeNegativeStatuses: true, desc: 'Una risata magica che cura solo gli effetti di stato negativi degli alleati in campo (non cura i PS).' },
          'Schermoluce': { name: 'Schermoluce', type: 'Magico', power: 0, targetMode: 'team', statusEffect: { type: 'Scudo Team', turns: 3 }, maxUses: 3, desc: 'Genera uno schermo di luce. Protegge il team dimezzando i danni subiti per 3 turni. (3 utilizzi)' },

          // NUOVE MOSSE BORT, SAILOR MERCURY E ALPHONSE
          'Capelli di Diamante': { name: 'Capelli di Diamante', type: 'Roccia', power: 90, desc: 'Usa i suoi capelli resistentissimi come fruste letali.' },
          'Durezza 10': { name: 'Durezza 10', type: 'Roccia', power: 0, target: 'self', statBuff: { def: 2.0 }, desc: 'Sfrutta la durezza del diamante per raddoppiare la Difesa.' },
          'Istinto Combattivo': { name: 'Istinto Combattivo', type: 'Psico', power: 75, priority: 1, desc: 'Un attacco fulmineo guidato dal puro istinto (Priorità +1).' },
          
          'Bolle di Nebbia': { name: 'Bolle di Nebbia', type: 'Acqua', power: 40, targetCount: 4, targetStatDebuff: { atk: 0.7 }, desc: 'Una nebbia gelida che colpisce tutti e riduce l\'Attacco dei nemici.' },
          'Shabon Spray': { name: 'Shabon Spray', type: 'Acqua', power: 70, statusEffect: { type: 'Confuso', chance: 0.3 }, desc: 'Getto d\'acqua ad alta pressione. 30% di confondere il bersaglio.' },
          'Raggio di Mercurio': { name: 'Raggio di Mercurio', type: 'Magico', power: 85, desc: 'Un raggio di pura energia azzurra.' },

          'Alchimia Metallica': { name: 'Alchimia Metallica', type: 'Robot', power: 80, desc: 'Trasmuta l\'ambiente circostante in armi acuminate.' },
          'Pugno d\'Acciaio': { name: 'Pugno d\'Acciaio', type: 'Lotta', power: 90, statusEffect: { type: 'Stordito', chance: 0.2 }, desc: 'Un pugno pesantissimo sferrato con l\'armatura. 20% di stordire.' },
          'Muro Terrestre': { name: 'Muro Terrestre', type: 'Roccia', power: 0, targetMode: 'team', statusEffect: { type: 'Scudo Team', turns: 3 }, desc: 'Trasmuta un muro di roccia che protegge il team per 3 turni.' },
          'Pilastro di Terra': { name: 'Pilastro di Terra', type: 'Terra', power: 85, desc: 'Sfrutta l\'alchimia per far scaturire un enorme pilastro di terra sotto il nemico.' },

          // NUOVE MOSSE SHREK
          'Fanghiglia paludosa': { name: 'Fanghiglia paludosa', type: 'Terra', power: 80, targetCount: 3, hitStatDebuff: { chance: 0.10, acc: 0.90 }, desc: 'Lancia fango ovunque colpendo fino a 3 bersagli. 10% di probabilità di ridurre la precisione.' },
          'Colpo di fango bollente': { name: 'Colpo di fango bollente', type: 'Terra', power: 50, statusEffect: { type: 'Scottato', chance: 0.80 }, desc: 'Un colpo rovente di fango. 80% di probabilità di scottare il bersaglio.' },
          'ESCI DALLA MIA PALUDE!!': { name: 'ESCI DALLA MIA PALUDE!!', type: 'Veleno', power: 0, targetStatDebuff: { atk: 0.7, def: 0.7 }, desc: 'Un urlo spaventoso che intimidisce il bersaglio, riducendone Attacco e Difesa del 30%.' },
          'Soffio pestilenziale': { name: 'Soffio pestilenziale', type: 'Veleno', power: 90, statusEffect: { type: 'Avvelenato', chance: 0.20 }, desc: 'Un alito micidiale. 20% di probabilità di avvelenare gravemente il nemico.' },

          // NUOVE MOSSE ARCO DEL TORNEO (DISCORD & ZENO)
          'Schiocco di Dita': { name: 'Schiocco di Dita', type: 'Magico', power: 120, statusEffects: [{ type: 'Confuso', chance: 0.5 }, { type: 'Stordito', chance: 0.5 }], desc: 'Distorce la realtà. Alta probabilità di confondere o stordire il nemico.' },
          'Pioggia di Cioccolato': { name: 'Pioggia di Cioccolato', type: 'Magico', power: 0, targetMode: 'team_smart_heal', healAlone: 0.6, healTeam: 0.4, statusEffect: { type: 'Confuso', chance: 0.2 }, desc: 'Fa piovere cioccolato curativo! Cura il team ma c\'è il 20% di probabilità di confonderli.' },
          'Caos Totale': { name: 'Caos Totale', type: 'Oscuro', power: 95, targetCount: 4, removeBuffs: true, desc: 'Azzera i potenziamenti di tutti i nemici in campo e infligge ingenti danni.' },
          'Cancellazione': { name: 'Cancellazione', type: 'Psico', power: 250, maxUses: 1, ignoreDefBuffs: true, desc: 'Cancella letteralmente l\'esistenza del bersaglio. Danni cosmici, usabile 1 sola volta.' },
          'Giochiamo!': { name: 'Giochiamo!', type: 'Normale', power: 0, targetMode: 'team', targetStatBuff: { atk: 1.5, spd: 1.5 }, desc: 'Zeno vuole divertirsi! Aumenta Attacco e Velocità di tutto il suo team del 50%.' },
          'Sguardo Onnipotente': { name: 'Sguardo Onnipotente', type: 'Psico', power: 0, targetCount: 4, targetStatDebuff: { atk: 0.5, def: 0.5, spd: 0.5 }, maxUses: 2, desc: 'Uno sguardo che terrorizza gli universi. Dimezza tutte le statistiche dei nemici.' },

          // NUOVE MOSSE PERIDOT E SHINOBU
          'Dita Laser': { name: 'Dita Laser', type: 'Robot', power: 30, multiHit: { min: 2, max: 4 }, desc: 'Spara raffiche laser dai suoi potenziamenti. Colpisce da 2 a 4 volte.' },
          'Ferrocinesi': { name: 'Ferrocinesi', type: 'Psico', power: 85, statusEffect: { type: 'Stordito', chance: 0.3 }, desc: 'Usa la telecinesi per scagliare metallo pesante. 30% di prob. stordire.' },
          'Campo Magnetico': { name: 'Campo Magnetico', type: 'Robot', power: 0, targetMode: 'team', statusEffect: { type: 'Scudo Team', turns: 4 }, desc: 'Genera un campo magnetico che protegge il team per 4 turni.' },
          'Siete dei Clod!': { name: 'Siete dei Clod!', type: 'Suono', power: 0, targetCount: 4, targetStatDebuff: { def: 0.6, spd: 0.6 }, desc: 'Un insulto alieno esilarante che riduce drasticamente Difesa e Velocità dei nemici.' },

          'Danza della Farfalla': { name: 'Danza della Farfalla', type: 'Insetto', power: 75, speedScaling: true, desc: 'Un fendente acrobatico ad altissima velocità. Il danno scala con la Velocità.' },
          'Estrazione del Veleno': { name: 'Estrazione del Veleno', type: 'Veleno', power: 70, statusEffect: { type: 'Avvelenato', chance: 0.8 }, desc: 'Inietta un potente veleno estratto dal glicine. 80% di prob. di avvelenare gravemente.' },
          'Pungiglione Letale': { name: 'Pungiglione Letale', type: 'Veleno', power: 120, accuracy: 0.85, desc: 'Un colpo di stocco mirato e letale. Altissima potenza, ma con precisione dell\'85%.' },
          'Medicina del Glicine': { name: 'Medicina del Glicine', type: 'Normale', power: 0, targetMode: 'ally', heal: 0.5, removeNegativeStatuses: true, desc: 'Sfrutta le sue abilità mediche per curare un alleato del 50% e purificarlo dagli status.' },
          
          // NUOVE MOSSE MAESTRO SHIFU
          'Agilità del Maestro': { name: 'Agilità del Maestro', type: 'Aria', power: 0, target: 'self', isProtect: true, priority: 5, maxUses: 4, statBuff: { spd: 1.5 }, desc: 'Schiva ogni attacco con movimenti fluidi e aumenta la Velocità del 50%.' },
          'Tocco Paralizzante': { name: 'Tocco Paralizzante', type: 'Lotta', power: 50, statusEffect: { type: 'Stordito', chance: 0.5 }, desc: 'Un colpo preciso ai centri nervosi. 50% di probabilità di stordire il nemico.' },
          'Saggezza di Oogway': { name: 'Saggezza di Oogway', type: 'Magico', power: 0, targetMode: 'ally', heal: 0.4, targetStatBuff: { atk: 1.5, def: 1.5 }, desc: 'Infonde pace interiore in un alleato: lo cura del 40% e aumenta Attacco e Difesa del 50%.' },
          'Colpo del Loto': { name: 'Colpo del Loto', type: 'Lotta', power: 90, ignoreDefBuffs: true, desc: 'Un fendente marziale di altissima tecnica che ignora le difese avversarie.' },

          // NUOVE MOSSE GARDEVOIR E URSULA
          'Psichico': { name: 'Psichico', type: 'Psico', power: 90, statusEffect: { type: 'Confuso', chance: 0.2 }, desc: 'Un potente attacco telecinetico. 20% di probabilità di confondere il bersaglio.' },
          'Liane Oscillanti': { name: 'Liane Oscillanti', type: 'Erba', power: 70, statusEffect: { type: 'Stordito', chance: 0.2 }, desc: 'Colpisce il nemico con liane robuste e oscillanti. 20% di probabilità di stordire il bersaglio.' },
          'Tentacoli Avvolgenti': { name: 'Tentacoli Avvolgenti', type: 'Acqua', power: 75, drain: 0.3, desc: 'Stritola il bersaglio con i tentacoli. Cura chi la usa del 30% del danno inflitto.' },
          'Canto Ammaliatore': { name: 'Canto Ammaliatore', type: 'Suono', power: 0, statusEffect: { type: 'Infatuato', chance: 1.0 }, targetStatDebuff: { def: 0.7 }, desc: 'Canta una melodia che infatua infallibilmente il bersaglio e ne riduce la Difesa del 30%.' },
          'Patto Ingannevole': { name: 'Patto Ingannevole', type: 'Veleno', power: 60, statusEffects: [{ type: 'Avvelenato', chance: 0.5 }, { type: 'Confuso', chance: 0.5 }], desc: 'Un contratto magico pericoloso. Infligge danni e ha il 50% di avvelenare o confondere.' },

          // NUOVE MOSSE NICOLE E YOSHI
          'Sguardo della morte': { name: 'Sguardo della morte', type: 'Oscuro', power: 70, statusEffect: { type: 'Elettrizzato', chance: 0.2 }, desc: 'Uno sguardo terrificante. 20% di probabilità di paralizzare.' },
          'Zuffa': { name: 'Zuffa', type: 'Lotta', power: 110, selfStatBuff: { def: 0.7 }, desc: 'Una rissa furiosa. Infligge ingenti danni ma riduce la propria Difesa del 30%.' },
          'Pausa Pranzo': { name: 'Pausa Pranzo', type: 'Normale', power: 0, target: 'self', heal: 0.2, statBuff: { def: 1.5 }, desc: 'Si rilassa mangiando: recupera il 20% dei PS e aumenta la Difesa del 50%.' },
          'VAI A LETTO.': { name: 'VAI A LETTO.', type: 'Lotta', power: 75, statusEffect: { type: 'Addormentato', chance: 0.15 }, desc: 'Spedisce il nemico a dormire a suon di sberle. 15% di prob. di addormentare.' },

          'Nyop-nyop': { name: 'Nyop-nyop', type: 'Drago', power: 40, drain: 0.5, statusEffect: { type: 'Elettrizzato', chance: 1.0 }, desc: 'Afferra il nemico con la lingua! Recupera il 50% dei danni inflitti e paralizza al 100% per il trauma.' },
          'Uovo boomerang': { name: 'Uovo boomerang', type: 'Normale', power: 20, multiHit: { min: 2, max: 7 }, desc: 'Lancia uova a ripetizione. Colpisce da 2 a 7 volte.' },
          'Sali sulla mia schiena': { name: 'Sali sulla mia schiena', type: 'Normale', power: 0, priority: 2, targetMode: 'ally', statusEffect: { type: 'In_Groppa', turns: 1 }, desc: 'Prende in groppa un alleato per un turno! Gli attacchi a bersaglio singolo rivolti a lui colpiranno Yoshi, che subirà il 50% dei danni in meno.' },
          'Colpo salterino': { name: 'Colpo salterino', type: 'Drago', power: 80, desc: 'Un balzo potentissimo seguito da uno schianto sul nemico.' },

          // NUOVE MOSSE KAI
          'Spada di Fuoco': { name: 'Spada di Fuoco', type: 'Fuoco', power: 85, statusEffect: { type: 'Scottato', chance: 0.3 }, desc: 'Fendente ardente con la sua spada. 30% di probabilità di scottare.' },
          'Spinjitzu (Kai)': { name: 'Spinjitzu', type: 'Fuoco', power: 30, multiHit: { min: 2, max: 3 }, speedScaling: true, desc: 'Un tornado di fuoco e arti marziali. Colpisce 2-3 volte e il danno scala con la Velocità.' },
          'Fiamma Interiore': { name: 'Fiamma Interiore', type: 'Fuoco', power: 0, target: 'self', statBuff: { atk: 1.5, spd: 1.5 }, desc: 'Risveglia il suo vero potenziale, aumentando Attacco e Velocità del 50%.' },
          'Calcio Volante Ninja': { name: 'Calcio Volante Ninja', type: 'Lotta', power: 60, priority: 1, desc: 'Un colpo acrobatico fulmineo che colpisce sempre per primo (Priorità +1).' },

          // NUOVE MOSSE AINZ
          'Grasp Heart': { name: 'Grasp Heart', type: 'Buio', power: 90, statusEffect: { type: 'Stordito', chance: 0.1 }, desc: 'Stritola il cuore del nemico. Danni elevati e 10% di probabilità di stordire il bersaglio.' },
          'Black Hole': { name: 'Black Hole', type: 'Buio', power: 85, targetCount: 4, desc: 'Crea un buco nero che risucchia tutto. Colpisce tutti gli avversari in campo.' },
          'Fermare il Tempo': { name: 'Fermare il Tempo', type: 'Psico', power: 0, target: 'self', isProtect: true, priority: 5, maxUses: 3, desc: 'Arresta lo scorrere del tempo per schivare ogni attacco per un turno. (3 utilizzi)' },
          'Fallen Down': { name: 'Fallen Down', type: 'Magico', power: 150, recharge: true, ignoreDefBuffs: true, desc: 'Magia di livello Super. Un pilastro di luce devastante che ignora le difese ma richiede ricarica.' },

          // NUOVE MOSSE TERRA
          'Rocce Sismiche': { name: 'Rocce Sismiche', type: 'Roccia', power: 75, targetCount: 4, desc: 'Un violento tremore che fa emergere rocce appuntite dal suolo. Colpisce tutti i nemici.' },
          'Mano di Pietra': { name: 'Mano di Pietra', type: 'Terra', power: 90, statusEffect: { type: 'Stordito', chance: 0.2 }, desc: 'Plasma la terra in un enorme pugno. 20% di probabilità di stordire il bersaglio.' },
          'Liane Stritolanti': { name: 'Liane Stritolanti', type: 'Erba', power: 65, drain: 0.3, targetStatDebuff: { spd: 0.7 }, desc: 'Evoca radici che stritolano, rallentando il nemico e assorbendo il 30% del danno in PS.' },
          'Levitazione Rocciosa': { name: 'Levitazione Rocciosa', type: 'Roccia', power: 0, target: 'self', statBuff: { atk: 1.3, def: 1.5 }, desc: 'Si solleva su un disco di pietra. Aumenta il proprio Attacco (+30%) e Difesa (+50%).' },
          'Fame Insaziabile': { name: 'Fame Insaziabile', type: 'Insetto', power: 100, drain: 0.6, statusEffect: { type: 'Stordito', chance: 0.3 }, maxUses: 2, desc: 'La sua vera forma divora il nemico senza pietà. Drena il 60% dei danni inflitti e ha il 30% di stordire. (2 utilizzi)' },

          // NUOVE MOSSE ENTOMA
          'Lama di Insetto': { name: 'Lama di Insetto', type: 'Insetto', power: 75, desc: 'Un fendente affilato scagliato con arti da insetto.' },
          'Talismano Esplosivo': { name: 'Talismano Esplosivo', type: 'Magico', power: 65, targetCount: 2, statusEffect: { type: 'Scottato', chance: 0.3 }, desc: 'Lancia talismani magici esplosivi che colpiscono fino a 2 nemici. 30% di probabilità di scottare.' },
          'Sciame Famelico': { name: 'Sciame Famelico', type: 'Insetto', power: 60, drain: 0.5, desc: 'Evoca insetti voraci che divorano il nemico. Cura del 50% dei danni inflitti.' },
          'Ragnatela Tenebrosa': { name: 'Ragnatela Tenebrosa', type: 'Buio', power: 40, targetStatDebuff: { spd: 0.5 }, statusEffect: { type: 'Stordito', chance: 0.2 }, desc: 'Intrappola il nemico in una ragnatela oscura, dimezzandone la Velocità. 20% di probabilità di stordire.' },

          // NUOVE MOSSE WEISS
          'Stoccata di Ghiaccio': { name: 'Stoccata di Ghiaccio', type: 'Ghiaccio', power: 75, statusEffect: { type: 'Congelato', chance: 0.20 }, desc: 'Un affondo rapido con Myrtenaster. 20% di probabilità di congelare il bersaglio.' },
          'Frammenti di Neve Weiss': { name: 'Frammenti di Neve', type: 'Ghiaccio', power: 20, multiHit: { min: 2, max: 8 }, desc: 'Lancia innumerevoli schegge di ghiaccio pungenti. Colpisce da 2 a 8 volte in rapida successione.' },
          'Glifo di Barriera': { name: 'Glifo di Barriera', type: 'Magico', power: 0, targetMode: 'team', statusEffect: { type: 'Scudo Team', turns: 3 }, targetStatBuff: { def: 1.3 }, desc: 'Crea uno scudo magico che protegge tutto il team aumentando la Difesa del 30% per 3 turni.' },
          'Glifo di Accelerazione': { name: 'Glifo di Accelerazione', type: 'Magico', power: 0, target: 'self', statBuff: { spd: 2.0 }, priority: 1, desc: 'Crea un glifo sotto di sé. Raddoppia la Velocità (+100%) e colpisce sempre per prima in questo turno.' },
          'Overdrive': { name: 'Overdrive', type: 'Elettro', power: 120, targetCount: 4, maxUses: 2, desc: 'Scatena l\'energia accumulata per folgorare tutti i bersagli in campo! (2 utilizzi)' },

          // NUOVE MOSSE TERZA CAMPAGNA (MONARCH & AKUMA)
          'Fiamme del Rifiuto': { name: 'Fiamme del Rifiuto', type: 'Fuoco', power: 85, targetCount: 4, statusEffect: { type: 'Scottato', chance: 0.4 }, desc: 'Fiamme oscure nate dalla rabbia. Colpisce tutti i nemici e ha il 40% di probabilità di scottare.' },
          'Schianto Akuma': { name: 'Schianto Akuma', type: 'Oscuro', power: 100, statusEffect: { type: 'Stordito', chance: 0.3 }, desc: 'Un salto devastante potenziato dal male puro. 30% di probabilità di stordire il bersaglio.' },
          'Guscio dell Odio': { name: 'Guscio dell\'Odio', type: 'Oscuro', power: 0, target: 'self', statBuff: { def: 2.0, atk: 1.3 }, desc: 'Si rinchiude nel guscio accumulando rabbia oscura. Raddoppia la Difesa e aumenta l\'Attacco del 30%.' },
          
          'Urlo del Terrore': { name: 'Urlo del Terrore', type: 'Suono', power: 0, targetCount: 4, targetStatDebuff: { atk: 0.6 }, desc: 'Un urlo straziante che terrorizza tutti i nemici, riducendo drasticamente il loro Attacco (40%).' },
          'Tempesta Nera': { name: 'Tempesta Nera', type: 'Aria', power: 85, targetCount: 4, desc: 'Scatena un tornado di fulmini neri e vento oscuro colpendo tutti i nemici sul campo.' },
          'Raid da Incubo': { name: 'Raid da Incubo', type: 'Oscuro', power: 100, speedScaling: true, statusEffect: { type: 'Stordito', chance: 0.3 }, desc: 'Un attacco in picchiata a velocità sonica. Scala con la Velocità e ha il 30% di stordire il bersaglio.' },
          'Nuvola di Disperazione': { name: 'Nuvola di Disperazione', type: 'Veleno', power: 0, targetCount: 2, statusEffects: [{ type: 'Avvelenato', chance: 0.5 }, { type: 'Confuso', chance: 0.5 }], desc: 'Avvolge fino a due nemici in una nube tossica. 50% di avvelenare e/o confondere.' },

          'Stritolamento Akuma': { name: 'Stritolamento Akuma', type: 'Oscuro', power: 90, drain: 0.3, statusEffect: { type: 'Stordito', chance: 0.4 }, desc: 'Stritola il nemico con arti allungati e demoniaci. Drena vita (30%) e ha il 40% di prob. di stordire.' },
          'Pugno Demoniaco': { name: 'Pugno Demoniaco', type: 'Lotta', power: 100, ignoreDefBuffs: true, desc: 'Un pugno gigante imbevuto di magia nera. Ignora i potenziamenti difensivi dell\'avversario.' },
          'Corpo d Ombra': { name: 'Corpo d\'Ombra', type: 'Oscuro', power: 0, target: 'self', statBuff: { def: 1.5, atk: 1.5 }, desc: 'Abbraccia l\'oscurità per potenziare a dismisura Attacco e Difesa (+50%).' },

          'Zaker Corrotto': { name: 'Zaker Corrotto', type: 'Oscuro', power: 95, statusEffect: { type: 'Elettrizzato', chance: 0.4 }, desc: 'Un fulmine nero come la pece. 40% di probabilità di paralizzare il bersaglio.' },
          'Fiamma Demoniaca': { name: 'Fiamma Demoniaca', type: 'Fuoco', power: 90, statusEffect: { type: 'Scottato', chance: 0.4 }, desc: 'Fiamme oscure scaturite da un destriero infernale. 40% probabilità di scottare.' },
          'Carica della Rovina': { name: 'Carica della Rovina', type: 'Oscuro', power: 140, isCombo: ['zatch_akuma', 'ponygon_akuma'], desc: 'Mossa Combinata: I due araldi caricano insieme avvolti nell\'oscurità. Danni immensi.' },

          // NUOVE MOSSE STATIC SHOCKER (CHLOE)
          'Accordo Dissonante': { name: 'Accordo Dissonante', type: 'Suono', power: 75, targetCount: 2, statusEffect: { type: 'Confuso', chance: 0.3 }, desc: 'Un accordo stonato che colpisce fino a 2 nemici. 30% di confondere.' },
          'Pogo Elettrico': { name: 'Pogo Elettrico', type: 'Elettro', power: 85, statusEffect: { type: 'Stordito', chance: 0.2 }, desc: 'Rimbalza scatenando elettricità. 20% di probabilità di stordire.' },
          'Assolo Ribelle': { name: 'Assolo Ribelle', type: 'Suono', power: 0, target: 'self', statBuff: { atk: 1.5, spd: 1.5 }, desc: 'Suona con pura ribellione aumentando Attacco e Velocità del 50%.' },
          'Riff Assordante': { name: 'Riff Assordante', type: 'Elettro', power: 100, ignoreDefBuffs: true, desc: 'Un riff chitarristico elettrizzante che ignora i potenziamenti difensivi.' },
          'Assolo Inarrestabile': { name: 'Assolo Inarrestabile', type: 'Suono', power: 9999, targetCount: 4, priority: 5, ignoreDefBuffs: true, ignoreImmunities: true, desc: 'Un accordo talmente potente da spazzare via chiunque osi non ascoltarla. Ignora le immunità.' },

          // NUOVE MOSSE MAESTRO SPIETATO (SHIFU)
          'Tocco della Paralisi Oscura': { name: 'Tocco della Paralisi Oscura', type: 'Oscuro', power: 60, statusEffect: { type: 'Stordito', chance: 0.6 }, desc: 'Un colpo mirato ai centri nervosi con energia oscura. 60% di stordire il bersaglio.' },
          'Agilità Infernale': { name: 'Agilità Infernale', type: 'Aria', power: 0, target: 'self', isProtect: true, priority: 5, maxUses: 3, statBuff: { spd: 2.0, atk: 1.3 }, desc: 'Schiva ogni attacco con movimenti innaturali. Raddoppia la Velocità e aumenta l\'Attacco del 30%.' },
          'Pressione Mortale': { name: 'Pressione Mortale', type: 'Lotta', power: 110, ignoreDefBuffs: true, desc: 'Una tecnica letale proibita che spezza le difese avversarie ignorandone i potenziamenti.' },
          'Loto Nero': { name: 'Loto Nero', type: 'Oscuro', power: 85, targetCount: 4, targetStatDebuff: { atk: 0.7 }, desc: 'Un vortice di oscurità a forma di fiore di loto. Colpisce tutti e ne riduce l\'Attacco del 30%.' },

          // NUOVE MOSSE NEON
          'Scia Elettrica!': { name: 'Scia Elettrica!', type: 'Elettro', power: 0, targetCount: 4, maxUses: 6, targetStatDebuff: { accFlat: 0.1 }, desc: 'Aumenta l\'evasione del team disorientando i nemici: riduce in modo permanente del 10% la precisione di tutti gli avversari in campo (accumulabile).' },
          'Shotgun': { name: 'Shotgun', type: 'Normale', power: 80, critChance: 0.3, critPower: 150, desc: 'Spara un colpo letale. Ha il 30% di probabilità di infliggere un colpo critico devastante da 150 di potenza!' },
          'Relay Bolt': { name: 'Relay Bolt', type: 'Elettro', power: 60, maxUses: 2, statusEffect: { type: 'Stordito', chance: 1.0 }, targetStatDebuff: { spd: 0.7 }, desc: 'Un dardo elettrico stordente. Stordisce il bersaglio per un turno e ne diminuisce la Velocità del 30%.' },

          // NUOVE MOSSE IL CAVALIERE
          'Radiant Slash': { name: 'Radiant Slash', type: 'Luce', power: 85, hitStatDebuff: { def: 0.7, chance: 0.4 }, desc: 'Fendente luminoso. Ha il 40% di probabilità di infrangere la Difesa nemica (approssima efficacia su Oscurità).' },
          'Shade Step': { name: 'Shade Step', type: 'Spettro', power: 0, target: 'self', priority: 2, statBuff: { atk: 1.5 }, statusEffect: { type: 'Ombra Rapida', turns: 2 }, desc: 'Si dissolve nell\'ombra (Priorità +2). Aumenta l\'Attacco (+50%) e il prossimo attacco avrà Priorità +2.' },
          'Soul Burst': { name: 'Soul Burst', type: 'Luce', power: 75, selfHeal: 0.25, desc: 'Esplosione di energia dell\'anima. Alimenta la vitalità curando chi la usa del 25% dei PS massimi.' },
          'Void Needle': { name: 'Void Needle', type: 'Spettro', power: 35, multiHit: { min: 2, max: 2 }, statusEffect: { type: 'Stordito', chance: 0.15 }, desc: 'Lancia un proiettile d\'ombra affilato. Colpisce 2 volte con il 15% di probabilità di stordire per la Paura.' },

          // NUOVE MOSSE DANTE
          'Rebellion Shine': { name: 'Rebellion Shine', type: 'Luce', power: 85, critChance: 0.2, critPower: 150, desc: 'Fendente caricato di energia luminosa. Ha il 20% di probabilità di infliggere un Colpo Critico devastante.' },
          'Ebony & Ivory Barrage': { name: 'Ebony & Ivory Barrage', type: 'Oscuro', power: 25, multiHit: { min: 2, max: 3 }, priority: 1, desc: 'Raffica di proiettili demoniaci. Colpisce da 2 a 3 volte. Priorità +1.' },
          'Devil Trigger Ascension': { name: 'Devil Trigger Ascension', type: 'Oscuro', power: 0, target: 'self', statBuff: { atk: 1.5, spd: 1.5 }, desc: 'Attiva il Devil Trigger! Incrementa drasticamente (+50%) il proprio Attacco e la propria Velocità.' },
          'Seraphim Overdrive': { name: 'Seraphim Overdrive', type: 'Luce', power: 75, maxUses: 5, selfStatBuff: { spd: 1.3 }, targetStatDebuff: { spd: 0.9 }, desc: 'Calcio verticale intriso di luce. Aumenta la propria Velocità (+30%) e riduce del 10% quella del nemico togliendogli priorità. (5 utilizzi).' },
          
          // NUOVE MOSSE SHELDON
          'Piccolo Morso': { name: 'Piccolo Morso', type: 'Drago', power: 75, hitStatDebuff: { def: 0.7, chance: 0.30 }, desc: 'Un morso con dentini affilati. 30% di probabilità di ridurre la Difesa.' },
          'Ruggito Adorabile': { name: 'Ruggito Adorabile', type: 'Normale', power: 0, targetStatDebuff: { atk: 0.7 }, statusEffect: { type: 'Infatuato', chance: 0.50 }, desc: 'Un ruggito così carino da intenerire i nemici! Riduce l\'Attacco e ha il 50% di probabilità di infatuare.' },
          'Codata Dinosauro': { name: 'Codata Dinosauro', type: 'Normale', power: 65, desc: 'Usa la sua piccola coda per colpire l\'avversario con inaspettata forza.' },
          'Carica Giurassica': { name: 'Carica Giurassica', type: 'Roccia', power: 90, statusEffect: { type: 'Stordito', chance: 0.20 }, desc: 'Una testata a tutta velocità! 20% di probabilità di stordire il nemico.' },
          'Meteora Devastante': { name: 'Meteora Devastante', type: 'Roccia', power: 150, targetCount: 4, maxUses: 1, desc: 'Richiama una meteora colossale! Danni immensi a tutti gli avversari in campo. (1 utilizzo)' },

          // NUOVE MOSSE MEGAMIND
          'Pistola Disidratante': { name: 'Pistola Disidratante', type: 'Robot', power: 65, statusEffect: { type: 'Stordito', chance: 0.3 }, desc: 'Trasforma quasi il nemico in un cubetto! 30% di probabilità di stordire.' },
          'Sciame di Brainbot': { name: 'Sciame di Brainbot', type: 'Robot', power: 25, multiHit: { min: 3, max: 5 }, desc: 'I suoi fedeli servitori robotici attaccano in massa. Colpisce da 3 a 5 volte.' },
          'Travestimento Olografico': { name: 'Travestimento Olografico', type: 'Magico', power: 0, target: 'self', isProtect: true, priority: 5, statBuff: { atk: 1.5 }, maxUses: 3, desc: 'Si traveste per eludere l\'attacco nemico (protezione) e aumenta il proprio Attacco del 50%. (3 utilizzi).' },
          'Raggio della Morte Concentrato': { name: 'Raggio della Morte Concentrato', type: 'Fuoco', power: 130, recharge: true, desc: 'Usa l\'energia concentrata del sole per un raggio devastante. Richiede un turno per ricaricarsi.' },
          
          // NUOVE MOSSE CHARIZARD
          'Dragopulsar': { name: 'Dragopulsar', type: 'Drago', power: 85, statusEffect: { type: 'Confuso', chance: 0.2 }, desc: 'Un raggio di aura draconica. 20% di probabilità di confondere il bersaglio.' },
          'Valanga': { name: 'Valanga', type: 'Roccia', power: 100, targetCount: 4, desc: 'Una pioggia di massi infuocati che colpisce tutti i nemici in campo.' },

          // NUOVE MOSSE SUMO
          'Sumo Slam': { name: 'Sumo Slam', type: 'Lotta', power: 95, statusEffect: { type: 'Stordito', chance: 0.3 }, desc: 'Un salto devastante con tutto il suo peso. 30% di probabilità di stordire il nemico.' },
          'Mangia-tutto': { name: 'Mangia-tutto', type: 'Normale', power: 0, target: 'self', heal: 0.4, statBuff: { atk: 1.3 }, desc: 'Mangia qualsiasi cosa trovi a portata di mano! Recupera il 40% dei PS e aumenta l\'Attacco del 30%.' },
          'Spinta Da Wrestler': { name: 'Spinta Da Wrestler', type: 'Lotta', power: 75, targetCount: 2, desc: 'Una spinta tremenda che travolge fino a 2 avversari contemporaneamente.' },
          'Sgranocchio': { name: 'Sgranocchio', type: 'Oscuro', power: 80, hitStatDebuff: { def: 0.8, chance: 0.2 }, desc: 'Un morso formidabile con i suoi dentoni. 20% di probabilità di ridurre la Difesa avversaria.' },

          // NUOVA MOSSA SUMO IPER
          'Sguardo Luminoso': { name: 'Sguardo Luminoso', type: 'Luce', power: 90, targetStatDebuff: { atk: 0.7 }, desc: 'Uno sguardo accecante di pura luce. Infligge danni e riduce permanentemente l\'Attacco del bersaglio del 30%.' },

          // NUOVE MOSSE ELLY
          'Alito fetido': { name: 'Alito fetido', type: 'Veleno', power: 60, statusEffect: { type: 'Avvelenato', chance: 0.70 }, desc: 'Un alito insopportabile. Infligge danni e ha il 70% di probabilità di avvelenare gravemente il bersaglio.' },
          'Signora pincher': { name: 'Signora pincher', type: 'Normale', power: 100, statusEffect: { type: 'Infatuato', chance: 0.15 }, desc: 'Mette in mostra la sua fierezza di razza! 100 di danno con il 15% di probabilità di infatuare il nemico.' },
          'n...non le scale!': { name: 'n...non le scale!', type: 'Normale', power: 80, hitStatDebuff: { def: 0.7, chance: 0.40 }, desc: 'Presa dal panico, fa uno sprint improvviso contro il nemico! 80 danni e 40% di probabilità di diminuire la Difesa avversaria.' },
          '🐕🐕🐕🐕': { name: '🐕🐕🐕🐕', type: 'Normale', power: 0, targetMode: 'team', targetStatBuff: { spd: 1.5 }, desc: 'Un richiamo festoso e incontenibile! Aumenta la Velocità di tutto il team alleato in campo del 50%.' },

          // NUOVE MOSSE ARIE VICENTE
          'Taglio Divino': { name: 'Taglio Divino', type: 'Luce', power: 80, critChance: 0.4, critPower: 120, desc: 'Un fendente purissimo, veloce e letale. Alta probabilità di critico (40%).' },
          'Passo Celestiale': { name: 'Passo Celestiale', type: 'Luce', power: 0, target: 'self', priority: 1, statBuff: { spd: 1.2 }, desc: 'Si muove a velocità sovrumana. Colpisce per primo (Priorità +1) e aumenta la Velocità del 20%.' },
          'Lama Bianca': { name: 'Lama Bianca', type: 'Luce', power: 80, targetStatDebuff: { def: 0.8 }, desc: 'Colpo elegante e preciso. Riduce la Difesa del bersaglio del 20% aprendo la sua guardia.' },
          'Riflesso Perfetto': { name: 'Riflesso Perfetto', type: 'Luce', power: 0, target: 'self', isProtect: true, priority: 5, protectStatus: 'Rashield', maxUses: 3, desc: 'Danza difensiva. Blocca i danni e ne riflette il 25% al mittente. (3 utilizzi)' },
          'Danza delle Mille Lame': { name: 'Danza delle Mille Lame', type: 'Oscuro', power: 25, multiHit: { min: 3, max: 5 }, desc: 'Sequenza di colpi impossibili da seguire. Colpisce da 3 a 5 volte.' },
          
          // NUOVE MOSSE DIAMANTE BIANCO
          'Pianeta natale': { name: 'Pianeta natale', type: 'Luce', power: 0, targetMode: 'team', targetStatBuff: { atk: 1.3 }, desc: 'Chiede aiuto alle gemme del Pianeta Natale. Aumenta l\'Attacco di tutto il team alleato in campo del 30%.' },
          'Colpo di tacco': { name: 'Colpo di tacco', type: 'Normale', power: 110, desc: 'Schiaccia il bersaglio con il suo enorme tacco.' },
          'Raggio luminoso': { name: 'Raggio luminoso', type: 'Luce', power: 80, targetCount: 4, desc: 'Emette un bagliore accecante che colpisce tutti gli avversari in campo.' },
          'Sguardo imperiale': { name: 'Sguardo imperiale', type: 'Luce', power: 0, accuracy: 0.80, statusEffect: { type: 'Infatuato', chance: 1.0 }, desc: 'Sottomette la mente avversaria infatuando infallibilmente il bersaglio, ma ha l\'80% di precisione.' },

          // NUOVE MOSSE PERLA
          'Lancia Perlescente': { name: 'Lancia Perlescente', type: 'Luce', power: 85, critChance: 0.3, critPower: 120, desc: 'Un fendente rapido e precisissimo con la lancia. 30% di probabilità di critico.' },
          'Danza delle Lame': { name: 'Danza delle Lame', type: 'Lotta', power: 30, multiHit: { min: 2, max: 4 }, speedScaling: true, desc: 'Una serie di attacchi aggraziati. Colpisce da 2 a 4 volte e il danno scala con la Velocità.' },
          'Olo-Perla': { name: 'Olo-Perla', type: 'Luce', power: 0, target: 'self', isProtect: true, priority: 5, maxUses: 3, desc: 'Crea un ologramma per deviare e schivare l\'attacco nemico. (3 utilizzi)' },
          'Eleganza Tattica': { name: 'Eleganza Tattica', type: 'Normale', power: 0, targetMode: 'team', targetStatBuff: { spd: 1.5, atk: 1.3 }, desc: 'Coordina la squadra con precisione militare. Aumenta Velocità (+50%) e Attacco (+30%) degli alleati.' },

          // NUOVE MOSSE SUGINO
          'Jugaru': { name: 'Jugaru', type: 'Erba', power: 25, multiHit: { min: 3, max: 3 }, desc: 'Evoca tre fiori giganteschi che sparano semi. Colpisce 3 volte.' },
          'Diojugaro': { name: 'Diojugaro', type: 'Veleno', power: 50, statusEffects: [{ type: 'Avvelenato', chance: 1.0 }, { type: 'Confuso', chance: 0.4 }], desc: 'Spruzza polline velenoso. Infligge danni, avvelena sempre e ha il 40% di confondere.' },
          'Juruku': { name: 'Juruku', type: 'Erba', power: 0, targetMode: 'team_smart_heal', healAlone: 0.5, healTeam: 0.4, desc: 'Cura tutti gli alleati in campo del 40%, o se stesso del 50% se è solo.' },
          'Barujuron': { name: 'Barujuron', type: 'Erba', power: 0, isSummon: 'albero_demone', maxUses: 2, strictUses: true, desc: 'Evoca un guerriero albero gigante per combattere al suo fianco. (2 utilizzi)' },
          'Pugno Arboreo': { name: 'Pugno Arboreo', type: 'Terra', power: 65, desc: 'Un potente colpo sferrato con rami e radici.' },

          // NUOVE MOSSE NARUTO
          'Rasengan': { name: 'Rasengan', type: 'Aria', power: 90, desc: 'Una sfera di chakra concentrato ad alta rotazione che sbalza via il nemico.' },
          'Moltiplicazione Superiore': { name: 'Moltiplicazione Superiore', type: 'Lotta', power: 25, multiHit: { min: 3, max: 5 }, desc: 'Crea cloni d\'ombra per sopraffare l\'avversario. Colpisce da 3 a 5 volte.' },
          'Rasenshuriken': { name: 'Rasenshuriken', type: 'Aria', power: 130, recharge: true, statusEffect: { type: 'Indebolito', chance: 0.5 }, desc: 'Un Rasengan fuso col chakra del vento. Danni devastanti e 50% di probabilità di indebolire, ma richiede ricarica.' },
          'Combo Uzumaki': { name: 'Combo Uzumaki', type: 'Lotta', power: 55, priority: 1, desc: 'Un rapido assalto corpo a corpo con l\'aiuto di un clone. Colpisce sempre per primo (Priorità +1).' },

          // NUOVE MOSSE SASUKE
          'Palla di Fuoco Suprema': { name: 'Palla di Fuoco Suprema', type: 'Fuoco', power: 75, statusEffect: { type: 'Scottato', chance: 0.3 }, desc: 'Sputa un\'enorme sfera di fuoco. 30% di probabilità di scottare il bersaglio.' },
          'Mille Falchi': { name: 'Mille Falchi', type: 'Elettro', power: 90, statusEffect: { type: 'Elettrizzato', chance: 0.2 }, desc: 'Concentra il fulmine nella mano per un colpo letale. 20% di probabilità di paralizzare.' },
          'Genjutsu: Sharingan': { name: 'Genjutsu: Sharingan', type: 'Magico', power: 0, targetStatDebuff: { def: 0.6, accFlat: 0.2 }, statusEffect: { type: 'Stordito', chance: 0.3 }, desc: 'Intrappola la mente del nemico. Ne riduce la Difesa (-40%) e Precisione (-20%), con il 30% di stordire.' },
          'Amaterasu': { name: 'Amaterasu', type: 'Oscuro', power: 120, ignoreDefBuffs: true, statusEffect: { type: 'Scottato', chance: 1.0 }, recharge: true, desc: 'Fiamme nere inestinguibili. Ignora le difese, scotta sempre, ma richiede ricarica nel turno successivo.' },
          
          // NUOVE MOSSE MELIODAS
          'Full Counter': { name: 'Full Counter', type: 'Magico', power: 0, target: 'self', isProtect: true, priority: 5, protectStatus: 'Rashield', maxUses: 4, desc: 'Respinge l\'attacco al mittente! Protegge e riflette il 25% del danno. Se usato di fila, la probabilità di successo si dimezza. (4 utilizzi)' },
          'Fiamme del Purgatorio': { name: 'Fiamme del Purgatorio', type: 'Oscuro', power: 85, statusEffect: { type: 'Scottato', chance: 0.5 }, desc: 'Fiamme nere inestinguibili. 50% di probabilità di scottare il bersaglio.' },
          'Kami Chigiri': { name: 'Kami Chigiri', type: 'Lotta', power: 30, multiHit: { min: 3, max: 4 }, desc: 'I Mille Tagli Divini. Una raffica di fendenti velocissimi che colpisce da 3 a 4 volte.' },
          'Revenge Counter': { name: 'Revenge Counter', type: 'Oscuro', power: 150, maxUses: 1, ignoreDefBuffs: true, desc: 'Assorbe i danni subiti e li rilascia in un colpo devastante che ignora le difese. (1 utilizzo)' },

          // NUOVE MOSSE BAN
          'Caccia della Volpe': { name: 'Caccia della Volpe', type: 'Lotta', power: 75, ignoreDefBuffs: true, desc: 'Usa la sua frusta per colpire ignorando i potenziamenti difensivi avversari.' },
          'Furto Fisico': { name: 'Furto Fisico', type: 'Oscuro', power: 65, drain: 0.5, desc: 'Ruba l\'energia vitale del nemico. Recupera il 50% dei danni inflitti in PS.' },
          'Hunter Fest': { name: 'Hunter Fest', type: 'Magico', power: 40, targetCount: 4, targetStatDebuff: { atk: 0.8, def: 0.8 }, selfStatBuff: { atk: 1.3, def: 1.3 }, desc: 'Ruba l\'energia di tutti i nemici! Infligge danni, ne riduce Attacco e Difesa (-20%) e aumenta i propri (+30%).' },
          'Colpo Letale di Ban': { name: 'Colpo Letale di Ban', type: 'Buio', power: 100, critChance: 0.3, critPower: 150, desc: 'Un attacco fulmineo e letale. 30% di probabilità di infliggere un colpo critico devastante.' },

          // NUOVE MOSSE SANS
          'Ossa Perforanti': { name: 'Ossa Perforanti', type: 'Buio', power: 25, multiHit: { min: 3, max: 5 }, desc: 'Una raffica imprevedibile di ossa appuntite. Colpisce in sequenza da 3 a 5 volte.' },
          'Karmic Retribution': { name: 'Karmic Retribution', type: 'Suono', power: 85, ignoreDefBuffs: true, statusEffect: { type: 'Avvelenato', chance: 0.3 }, desc: 'Il peso dei peccati schiaccia il nemico. Ignora i potenziamenti difensivi e ha il 30% di avvelenare l\'anima (KARMIC).' },
          'Gaster Blaster Assoluto': { name: 'Gaster Blaster Assoluto', type: 'Buio', power: 110, targetCount: 4, recharge: true, desc: 'Evoca teschi demoniaci che sparano raggi oscuri su tutti i nemici. Richiede un turno di ricarica.' },
          'Pausa Ketchup': { name: 'Pausa Ketchup', type: 'Normale', power: 0, target: 'self', heal: 0.5, statBuff: { spd: 1.3 }, desc: 'Beve un\'intera bottiglia di ketchup! Si cura del 50% e aumenta la sua già alta Velocità del 30%.' },

          // NUOVE MOSSE ROXY
          'Assolo di Keytar': { name: 'Assolo di Keytar', type: 'Suono', power: 85, targetCount: 2, statusEffect: { type: 'Confuso', chance: 0.3 }, desc: 'Suona un accordo assordante con il suo keytar. Colpisce fino a 2 nemici con il 30% di confonderli.' },
          'Scatto Predatorio': { name: 'Scatto Predatorio', type: 'Robot', power: 75, speedScaling: true, desc: 'Un balzo letale verso la preda. Il danno aumenta in base alla sua Velocità.' },
          'Occhi a Raggi X': { name: 'Occhi a Raggi X', type: 'Robot', power: 0, targetStatDebuff: { def: 0.7, accFlat: 0.2 }, desc: 'Analizza i punti deboli del nemico. Ne diminuisce la Difesa (-30%) e la Precisione.' },
          'La Preferita': { name: 'La Preferita', type: 'Suono', power: 0, target: 'self', statBuff: { atk: 1.5, spd: 1.5 }, desc: 'Si auto-incoraggia ad alta voce! Aumenta il suo Attacco e Velocità del 50%.' },
          
          // NUOVE MOSSE DOLLI
          'Incubo di Pezza': { name: 'Incubo di Pezza', type: 'Spettro', power: 100, targetCount: 4, targetStatDebuff: { atk: 0.7 }, statusEffect: { type: 'Confuso', chance: 0.2 }, desc: 'La bambola si trasforma in un incubo! Colpisce tutti i nemici riducendone l\'Attacco e ha il 20% di confonderli.' },

          // NUOVE MOSSE CARLOS IPER
          'Pugno infuocato del survivor': { name: 'Pugno infuocato del survivor', type: 'Fuoco', power: 120, selfStatBuff: { def: 0.7 }, desc: 'Un pugno letale avvolto dalle fiamme della sopravvivenza. Infligge danni immensi ma riduce la propria Difesa del 30%.' },

          // NUOVE MOSSE LEON KENNEDY
          'Silver Ghost': { name: 'Silver Ghost', type: 'Normale', power: 70, critChance: 0.2, critPower: 110, desc: 'Spara con la sua iconica pistola. Ha il 20% di probabilità di infliggere un colpo critico.' },
          'Suplex': { name: 'Suplex', type: 'Lotta', power: 85, statusEffect: { type: 'Stordito', chance: 0.3 }, desc: 'Afferra il nemico e lo schianta a terra con violenza. 30% di probabilità di stordire il bersaglio.' },
          'Flashbang': { name: 'Flashbang', type: 'Luce', power: 0, targetCount: 4, targetStatDebuff: { accFlat: 0.1 }, statusEffect: { type: 'Confuso', chance: 0.3 }, desc: 'Acceca tutti i nemici, riducendone la precisione del 10% e con il 30% di probabilità di confonderli.' },
          'Fucile a Pompa': { name: 'Fucile a Pompa', type: 'Normale', power: 100, targetCount: 2, desc: 'Spara una potente cartuccia a distanza ravvicinata che colpisce fino a 2 nemici.' },

          // NUOVE MOSSE MECHA JOHNNY TEST
          'Raggio Bling-Bling': { name: 'Raggio Bling-Bling', type: 'Robot', power: 75, statusEffect: { type: 'Confuso', chance: 0.3 }, desc: 'Un raggio laser pacchiano e accecante. 30% di probabilità di confondere.' },
          'Zaino a Razzi': { name: 'Zaino a Razzi', type: 'Aria', power: 0, target: 'self', statBuff: { spd: 1.5, atk: 1.3 }, desc: 'Attiva lo zaino a razzi! Aumenta la Velocità del 50% e l\'Attacco del 30%.' },
          'Richiamo Dukey-Bot': { name: 'Richiamo Dukey-Bot', type: 'Normale', power: 60, targetCount: 2, desc: 'Lancia un segnale per far attaccare Dukey in versione cibernetica. Colpisce fino a 2 bersagli.' },
          'Sovraccarico Nucleare': { name: 'Sovraccarico Nucleare', type: 'Elettro', power: 110, recoil: 0.2, desc: 'Un attacco energetico sconsiderato. Infligge ingenti danni ma subisce il 20% del danno come contraccolpo.' }
        };

// Normalizzazione originale dei limiti di utilizzo delle mosse.
Object.values(MOVES_DB).forEach(move => {
            if (move.strictUses) return;
            if (move.power === 0 || move.isProtect || move.heal || move.selfHeal || move.healAlone || move.healFlat || move.targetMode === 'revive' || move.healLastTurnDamage) {
                if (move.maxUses === 1 && move.targetMode === 'revive') {
                    move.maxUses = 3; // Buff ai revive
                } else if (move.maxUses === 1 || move.maxUses === 2) {
                    move.maxUses = 5; // Aumentati gli usi per le mosse limitate
                } else if (!move.maxUses) {
                    if (move.isProtect) {
                        move.maxUses = 8; // Protezioni hanno 8 PP
                    } else if (move.heal || move.selfHeal || move.healAlone || move.healFlat || move.healLastTurnDamage) {
                        move.maxUses = 6; // Cure hanno 6 PP
                    } else if (move.isSummon || move.randomSummon) {
                        move.maxUses = 5; // Evocazioni
                    } else {
                        move.maxUses = 5; // Buff e Debuff di base
                    }
                } else {
                    // Se aveva già maxUses (es. 3, 4, 5), aumentiamo per bilanciare
                    if (move.maxUses < 8 && move.isProtect) move.maxUses = 8;
                    else if (move.maxUses < 6 && (move.heal || move.healAlone || move.selfHeal)) move.maxUses = 6;
                    else if (move.maxUses < 5) move.maxUses = 5;
                }
            }
        });
