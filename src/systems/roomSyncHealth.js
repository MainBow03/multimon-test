// Stato diagnostico NON invasivo: non cambia il contenuto delle stanze Firestore.
// Il browser può segnalare "online" anche senza collegamento al server:
// utilizziamo anche i metadati snapshot e l'ultimo aggiornamento server.
export const ROOM_SYNC_STALE_MS=45000;

export function roomSyncHealth({
  online=true,fromCache=false,lastServerAt=0,now=Date.now(),error=false
}={}){
  if(!online)return {
    level:'offline',message:'Connessione Internet assente. La stanza è conservata: non chiudere la partita.',
    tip:'Controlla la rete. Dopo la riconnessione attendi la sincronizzazione prima di inviare mosse.'
  };
  if(error)return {
    level:'error',message:'Sincronizzazione con la stanza interrotta.',
    tip:'Il gioco non cancella il tuo posto. Controlla la rete e, se necessario, ricarica usando lo stesso account.'
  };
  if(fromCache)return {
    level:'cache',message:'Dati della stanza in cache: attendo conferma dal server.',
    tip:'Potresti vedere uno stato precedente. Non ripetere le azioni finché la connessione non torna attiva.'
  };
  const last=Number(lastServerAt);
  if(!Number.isFinite(last)||last<=0)return {
    level:'connecting',message:'Collegamento alla stanza in corso…',
    tip:'Attendo il primo aggiornamento dal server.'
  };
  const age=Math.max(0,Number(now)-last);
  if(age>ROOM_SYNC_STALE_MS)return {
    level:'stale',message:'Nessun aggiornamento recente della stanza.',
    tip:'Verifica la connessione e la presenza dell’host prima di ripetere una mossa.'
  };
  return {level:'ok',message:'Stanza sincronizzata',tip:''};
}
