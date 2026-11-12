// 'Robot' resta un ID di tipo storico nei dati/salvataggi e nella chart.
// L'etichetta visibile è 'Acciaio': cambiare gli ID romperebbe vecchie
// squadre, mosse, filtri e corrispondenze fra tipi delle partite online.
export const typeDisplayName=type=>type==='Robot'?'Acciaio':type;
export const typeInternalName=type=>type==='Acciaio'?'Robot':type;
