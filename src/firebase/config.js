import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// --- FIREBASE CONFIGURATION ---
        // INSERISCI QUI LE TUE CHIAVI FIREBASE PER L'ONLINE SU GITHUB PAGES
        const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
            apiKey: "AIzaSyC42J75JvPCdKkDZ4WlQyryqTeUspXCtrM",
            authDomain: "fakemon-cartoon.firebaseapp.com",
            projectId: "fakemon-cartoon",
            storageBucket: "fakemon-cartoon.firebasestorage.app",
            messagingSenderId: "1093719734355",
            appId: "1:1093719734355:web:1bc88f36fb0d29392aeea6",
            measurementId: "G-Q5532SJ8YL"
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'multiverse-rpg-1';

        // --- RILEVAMENTO AMBIENTE (Anteprima vs Online) ---
        // Se siamo su localhost, file:// o nell'anteprima dell'IA, consideriamo il gioco "In Test"
        const IS_PREVIEW = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' || 
                           window.location.protocol === 'file:' || 
                           window.location.hostname.includes('googleusercontent') || 
                           window.location.hostname === '';
        // --------------------------------------------------

export { auth, db, appId, IS_PREVIEW };
