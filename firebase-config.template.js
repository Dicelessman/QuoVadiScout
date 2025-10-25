// firebase-config.template.js
// Template per configurazione Firebase - Copia questo file come firebase-config.js

// 🔒 NOTA SICUREZZA: Questo file contiene template per le credenziali Firebase
// NON committare mai il file firebase-config.js nel repository

const FirebaseConfig = {
  // Configurazione Firebase - Sostituisci con le tue credenziali
  apiKey: "YOUR_FIREBASE_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID_HERE",
  
  // Configurazione aggiuntiva
  measurementId: "YOUR_MEASUREMENT_ID_HERE", // Opzionale per Analytics
  
  // Configurazione VAPID per push notifications
  vapidKey: "YOUR_VAPID_PUBLIC_KEY_HERE",
  
  // Configurazione ambiente
  environment: "development", // "development" | "production"
  
  // Configurazione domini autorizzati
  authorizedDomains: [
    "localhost",
    "127.0.0.1",
    "YOUR_PRODUCTION_DOMAIN.com"
  ],
  
  // Configurazione rate limiting
  rateLimits: {
    requestsPerMinute: 60,
    requestsPerHour: 1000,
    requestsPerDay: 10000
  }
};

// Validazione configurazione
function validateConfig(config) {
  const required = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missing = required.filter(key => !config[key] || config[key].includes('YOUR_'));
  
  if (missing.length > 0) {
    throw new Error(`Configurazione Firebase incompleta. Campi mancanti: ${missing.join(', ')}`);
  }
  
  return true;
}

// Esporta configurazione validata
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FirebaseConfig, validateConfig };
} else {
  window.FirebaseConfig = FirebaseConfig;
  window.validateFirebaseConfig = validateConfig;
}
