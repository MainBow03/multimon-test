// Dall'alto a sinistra: nuovi Multimon prima, poi le aggiunte storiche.
// La vetrina della Lobby mostra fino a 100 Multimon con schede grandi.
// I personaggi non ancora presenti nel catalogo vengono ignorati.
export const RECENT_ARRIVALS_IDS=Object.freeze([
  // Ultime aggiunte di questa chat (dal più recente):
  'frillish','berry','flameprincess','ametista',
  // Altri Multimon aggiunti nelle ultime pubblicazioni:
  'chopper','nami','zoro','luffy','embermclain','kitty','superboy',
  'diamante','daffyduck','bugsbunny','orsobianco','mahito',
  'mechajohnny','leon','perla','roxy','sans','ban','meliodas',
  'sasuke','naruto','diamantebianco','arievicente','sugino','elly',
  'sumo','charizard','megamind','sheldon','dante','ilcavaliere',
  'lucy','kirby','shrek','ciuchino','shinobu','juvia',
  'frozone' // Proposto, ma non ancora inserito: escluso automaticamente
]);
export const recentArrivalCharacters=(characters,ids=RECENT_ARRIVALS_IDS)=>
  [...new Set(ids)].slice(0,100).map(id=>characters.find(c=>c.id===id))
    .filter(c=>c&&!c.isCampaignMonster&&!c.isSummonOnly);
