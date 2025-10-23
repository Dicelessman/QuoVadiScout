// 🔒 Firebase Configuration Example
// COPIA QUESTO FILE come firebase-config.js e inserisci le tue credenziali reali
// ⚠️ NON COMMITTARE firebase-config.js nel repository!

// Come configurare:
// 1. Copia questo file: cp firebase-config.example.js firebase-config.js
// 2. Apri il tuo progetto Firebase Console: https://console.firebase.google.com
// 3. Vai su Project Settings > General > Your apps
// 4. Copia le credenziali nella sezione "Firebase SDK snippet"
// 5. Incolla i valori qui sotto

const firebaseConfig = {
  apiKey: "TUO_API_KEY_QUI",
  authDomain: "tuo-progetto.firebaseapp.com",
  projectId: "tuo-progetto-id",
  storageBucket: "tuo-progetto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// ⚠️ IMPORTANTE:
// - Questo file contiene credenziali sensibili
// - NON condividere pubblicamente
// - NON committare nel repository Git
// - Aggiorna le regole di sicurezza Firebase Console

export default firebaseConfig;

