/** Mantello dell'Invisibilità degli starter dell'Ascesa.
 *
 * Il mantello normale resta invariato (+15% elusione). Solo gli starter
 * dell'Ascesa ottengono IN AGGIUNTA una protezione completa contro il
 * primo attacco offensivo nemico che li raggiunge, una volta per battaglia.
 * L'intera mossa viene fermata, anche se è multicolpo: niente KO, status
 * o riduzioni di statistiche causati da quell'attacco.
 */
export const ASCENSION_STARTER_CLOAK_ID='mantello_invisibilita';

export function equipAscensionStarterCloak(member){
 if(!member)return member;
 return {
  ...member,heldItem:ASCENSION_STARTER_CLOAK_ID,ascensionStarterCloak:true
 };
}

/** Va applicato all'inizio di una nuova battaglia, non a ogni turno. */
export function activateAscensionStarterCloak(fighter){
 if(!fighter)return fighter;
 fighter.heldItem=ASCENSION_STARTER_CLOAK_ID;
 fighter.ascensionStarterCloak=true;
 fighter.ascensionStarterCloakUsed=false;
 return fighter;
}

/** Il controllo viene effettuato dal vero motore classico, dopo la mira,
 * ma prima di calcolare danni, status ed effetti dell'attacco. */
export function consumeAscensionStarterCloak(fighter,move){
 if(!fighter||fighter.hp<=0||fighter.heldItem!==ASCENSION_STARTER_CLOAK_ID||
    !fighter.ascensionStarterCloak||fighter.ascensionStarterCloakUsed)return false;
 if(!(move?.power>0||move?.percentDmgCurrent>0||move?.percentDmgMax>0))return false;
 fighter.ascensionStarterCloakUsed=true;
 return true;
}
