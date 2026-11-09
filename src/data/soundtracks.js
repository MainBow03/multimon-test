// ID YouTube originali: il gioco utilizza il player ufficiale, non copie audio.
export const SOUNDTRACKS = [
  { id: 'wpEBouFcwqI', name: 'LB : heroes day' },
  { id: 'rXefFHRgyE0', name: 'Cynthia theme' },
  { id: 'bUG_NS0xqSY', name: 'Dandel theme' },
  { id: 'hcV6xVukj60', name: 'Gym Leader Opal' },
  { id: 'Mpi0wyVRP0I', name: 'Disobedient' },
  { id: 'SYTS2sJWcIs', name: 'Champion and Red', category: 'Battaglia' },
  { id: '_xEDmgVscdc', name: 'Ultra Instinct Remix', category: 'Finale Ultimon', isUltimonFinale: true },
  { id: 'gASj-wzktTM', name: 'Beast Gohan', category: 'Battaglia' }
];
export const DEFAULT_BATTLE_SOUNDTRACK='wpEBouFcwqI';
export const ULTIMON_FINAL_SOUNDTRACK='_xEDmgVscdc';
export const soundtrackForId=id=>SOUNDTRACKS.find(track=>track.id===id)||SOUNDTRACKS[0];
export const soundtrackVideoUrl=id=>'https://www.youtube.com/watch?v='+encodeURIComponent(soundtrackForId(id).id);
