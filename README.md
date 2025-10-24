# 🏕️ QuoVadiScout v1.3.0

**Sistema avanzato per la gestione di strutture e terreni scout**

---

## 📋 Descrizione

QuoVadiScout è una Progressive Web App (PWA) completa per la gestione di strutture scout, terreni e attività correlate. L'applicazione è stata sviluppata con focus su usabilità, sicurezza e performance.

---

## ✨ Funzionalità Principali

### 🏠 Gestione Strutture
- CRUD completo per strutture scout
- Geocodifica automatica indirizzi
- Galleria immagini con geotagging
- Note personali per struttura
- Sistema di segnalazioni

### 🔐 Sicurezza
- **Accesso Completamente Privato**: Nessun accesso pubblico ai dati
- **Autenticazione Obbligatoria**: Email verificata richiesta per tutte le operazioni
- **Rate Limiting**: Protezione contro brute force attacks
- **Password Robuste**: Requisiti minimi 12 caratteri complessi
- **Session Timeout**: Disconnessione automatica dopo inattività
- **Input Sanitization**: Protezione contro XSS e injection
- **Content Security Policy**: Restrizione esecuzione codice non autorizzato
- **Firebase Security Rules**: Protezione server-side dei dati
- **Validazione Email**: Controllo email verificata per tutte le operazioni

### 📊 Dati & Analytics
- Dashboard con statistiche complete
- Feed attività utente
- Export multipli formati (JSON, CSV, Excel, PDF)
- Backup & Sync automatico

### 🗺️ Mappe & Geolocalizzazione
- Visualizzazione strutture su mappa Leaflet
- Clusterizzazione marker
- Geocodifica diretta coordinate
- Supporto Google Maps links

### 🎨 UX Moderna
- Design responsive mobile-first
- Toast notifications eleganti
- Virtual scrolling per performance
- Dark mode support

### 🔔 Notifiche
- Push notifications
- Notifiche intelligenti
- Preferenze personalizzabili

---

## 🚀 Installazione & Deploy

### Prerequisiti
- Account Firebase
- GitHub Pages (per hosting)

### Deploy su GitHub Pages

1. **Crea un nuovo repository su GitHub**

2. **Clone il repository**:
```bash
git clone https://github.com/tuousername/QuoVadiScout.git
cd QuoVadiScout
```

3. **Configura Firebase**:
   - Vai su [Firebase Console](https://console.firebase.google.com)
   - Crea un nuovo progetto
   - Abilita Authentication (Email/Password e Google)
   - Abilita Firestore Database
   - Crea le Security Rules (vedi `FIREBASE_RULES.md`)

4. **Aggiorna configurazione Firebase** in `script.js`:
```javascript
const firebaseConfig = {
  apiKey: "tua-api-key",
  authDomain: "tuo-progetto.firebaseapp.com",
  projectId: "tuo-progetto",
  // ...
};
```

5. **Push su GitHub**:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

6. **Abilita GitHub Pages**:
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: main
   - Folder: / (root)

---

## 📁 Struttura Progetto

```
QuoVadiScout/
├── index.html              # Pagina principale
├── dashboard.html           # Dashboard statistiche
├── script.js               # Logica principale applicazione
├── styles.css              # Stili applicazione
├── toast-notifications.js  # Sistema notifiche toast
├── virtual-scroll.js       # Virtual scrolling ottimizzato
├── firebase-config.js      # Configurazione Firebase
├── geolocation.js          # Gestione geolocalizzazione
├── maps.js                 # Integrazione mappe Leaflet
├── export.js               # Export dati multipli formati
├── analytics.js            # Analytics avanzato
├── backup-sync.js          # Backup & Sync automatico
├── push-notifications.js   # Push notifications
├── smart-notifications.js  # Notifiche intelligenti
├── offline-sync.js         # Sincronizzazione offline
├── media-manager.js        # Gestione immagini
├── gestures.js             # Gesture mobile
├── integrations.js         # Integrazioni esterne
├── icons-config.js         # Configurazione icone
├── config.js              # Configurazione centrale
├── service-worker.js       # Service Worker PWA
├── manifest.json           # Manifest PWA
├── data.json              # Dati locali fallback
└── README.md              # Questa documentazione
```

---

## ⚙️ Setup e Configurazione

### Prerequisiti
- Account Firebase con progetto configurato
- Autenticazione Firebase abilitata
- Firestore database configurato

### Configurazione Firebase
1. **Copia template configurazione**:
   ```bash
   cp firebase-config.template.js firebase-config.js
   ```

2. **Configura credenziali Firebase**:
   - Apri `firebase-config.js`
   - Sostituisci i placeholder con le tue credenziali Firebase
   - Configura domini autorizzati

3. **Deploy regole Firestore**:
   ```bash
   # Install Firebase CLI
   npm install -g firebase-tools
   
   # Login e configurazione
   firebase login
   firebase use quovadiscout
   
   # Deploy regole
   firebase deploy --only firestore:rules
   ```
   
   📖 **Guida completa**: Vedi [DEPLOY_FIREBASE.md](DEPLOY_FIREBASE.md) per istruzioni dettagliate

### Setup Produzione
Per utilizzare l'applicazione in produzione, configura il file `firebase-config.js`:
📖 **Guida setup produzione**: Vedi [SETUP_PRODUCTION.md](SETUP_PRODUCTION.md) per istruzioni complete

### GitHub Pages
L'applicazione è configurata per funzionare su GitHub Pages:
- ✅ **Funziona immediatamente** senza configurazione aggiuntiva
- ✅ **Sistema di fallback integrato** per credenziali Firebase
- ✅ **Sicurezza completa** con accesso privato ai dati

📖 **Guida GitHub Pages**: Vedi [GITHUB_PAGES_SETUP.md](GITHUB_PAGES_SETUP.md) per istruzioni complete

### Configurazione Sicurezza
- **Email verificata obbligatoria**: Configura Firebase Auth per richiedere email verification
- **Domini autorizzati**: Aggiorna domini autorizzati in Firebase Console
- **Rate limiting**: Configura Firebase Security Rules per limitare richieste

### File Sensibili
⚠️ **IMPORTANTE**: I seguenti file contengono informazioni sensibili e NON devono essere committati:
- `firebase-config.js` (escluso automaticamente da .gitignore)

### Variabili d'Ambiente (Produzione)
Per deployment in produzione, considera l'uso di variabili d'ambiente:
```bash
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_domain
FIREBASE_PROJECT_ID=your_project_id
# ... altre credenziali
```

---

## 🔒 Sicurezza

### Implementazioni Client-Side
- ✅ Rate limiting login tentativi
- ✅ Validazione password robuste
- ✅ Session timeout automatico
- ✅ Sanitizzazione input XSS
- ✅ Messaggi errore generici

### Implementazioni Server-Side
- ✅ Firebase Security Rules deployate
- ✅ Autenticazione obbligatoria per modifiche
- ✅ Validazione dati server-side

### Note Importanti
- Le API keys Firebase sono pubbliche per design
- La sicurezza reale è garantita dalle Firebase Security Rules
- Non committare mai credenziali sensibili nel repository

---

## 🎯 Uso

### Primo Avvio
1. Apri l'app sul browser
2. Fai login con Google o registrati con email
3. Sincronizza i dati da Firestore
4. Inizia ad aggiungere strutture!

### Aggiungere Struttura
1. Clicca "Aggiungi Struttura"
2. Compila i campi richiesti
3. Aggiungi immagini (opzionale)
4. Salva

### Gestire Liste Personali
1. Aggiungi strutture all'elenco con ⭐
2. Esporta in vari formati
3. Condividi con altri utenti

---

## 🛠️ Tecnologie Utilizzate

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Maps**: Leaflet.js
- **Charts**: Canvas API
- **PWA**: Service Worker, Manifest
- **Deploy**: GitHub Pages

---

## 📊 Performance

- ✅ Cache intelligente (5 minuti)
- ✅ Lazy loading immagini
- ✅ Virtual scrolling liste lunghe
- ✅ Service Worker offline-first
- ✅ Compressione automatica immagini

---

## 🐛 Debugging

Il progetto include un sistema di logging condizionale:

```javascript
// In script.js
const DEBUG = false; // Impostare a true per debug
```

Quando `DEBUG = false`, tutti i log di sviluppo sono disabilitati.

---

## 📝 Changelog

### v1.3.0 (19 Dicembre 2024)
- ✅ Sistema toast notifications
- ✅ Logging condizionale per produzione
- ✅ Virtual scrolling ottimizzato
- ✅ Consolide documentazione
- ✅ Firebase Security Rules deployate
- ✅ Performance ottimizzate

### v1.2.1
- Implementazione geolocalizzazione
- Integrazione mappe Leaflet
- Sistema backup & sync

### v1.2.0
- Dashboard statistiche
- Analytics avanzato
- Export multipli formati

---

## 🤝 Contribuire

Contributi benvenuti! Per contribuire:

1. Fork del repository
2. Crea branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit delle modifiche (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

---

## 📄 Licenza

Questo progetto è sotto licenza MIT.

---

## 👤 Autore

Sviluppato per il movimento scout italiano.

---

## 🙏 Ringraziamenti

- Firebase per l'infrastruttura backend
- Leaflet per le mappe open-source
- Community JavaScript per le librerie utilizzate

---

**Versione**: v1.3.0  
**Ultimo aggiornamento**: 19 Dicembre 2024  
**Status**: ✅ Production Ready

