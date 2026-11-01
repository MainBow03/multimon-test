export const ITEMS_DB = {
            'pozione': { id: 'pozione', name: 'Pozione', desc: 'Cura il 50% dei PS del personaggio in campo.', price: 100, type: 'heal', value: 0.5, icon: '🧪' },
            'cura_totale': { id: 'cura_totale', name: 'Cura Totale', desc: 'Ripristina il 100% dei PS del personaggio.', price: 300, type: 'heal', value: 1.0, icon: '💊' },
            'resurrezione': { id: 'resurrezione', name: 'Revitalizzante', desc: 'Riporta in vita il primo alleato sconfitto (50% PS).', price: 400, type: 'revive', value: 0.5, icon: '✨' },
            'cura_status': { id: 'cura_status', name: 'Cura Status', desc: 'Rimuove ogni alterazione di stato negativa.', price: 100, type: 'heal_status', icon: '🌿' },
            'pozione_rigenerante': { id: 'pozione_rigenerante', name: 'Pozione Rigenerante', desc: 'Cura il 15% dei PS alla fine di ogni turno per 4 turni.', price: 150, type: 'regen', turns: 4, value: 0.15, icon: '🧴' }
        };
