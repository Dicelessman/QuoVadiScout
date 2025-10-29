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
- **Rate Limiting**: Protezione contro brute force attacks
- **Password Robuste**: Requisiti minimi 12 caratteri complessi
- **Session Timeout**: Disconnessione automatica dopo inattività
- **Input Sanitization**: Protezione contro XSS
- **Firebase Security Rules**: Protezione server-side dei dati

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

### 🌐 URL di Produzione
- **Vercel (Principale)**: https://quovadiscout-f8fvu3pev-dicelessmans-projects.vercel.app
- **GitHub Pages (Backup)**: https://dicelessman.github.io/QuoVadiScout/

### Prerequisiti
- Account Firebase
- Account Vercel (per hosting principale)
- GitHub Pages (per backup)

### Deploy su Vercel (Raccomandato)

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
   - Crea le Security Rules (vedi `firestore.rules`)

4. **Configura Vercel**:
   - Vai su [Vercel](https://vercel.com)
   - Importa il repository GitHub
   - Imposta le Environment Variables:
     - `FIREBASE_API_KEY`
     - `FIREBASE_AUTH_DOMAIN`
     - `FIREBASE_PROJECT_ID`
     - `FIREBASE_STORAGE_BUCKET`
     - `FIREBASE_MESSAGING_SENDER_ID`
     - `FIREBASE_APP_ID`
     - `CLOUDINARY_CLOUD_NAME`
     - `CLOUDINARY_API_KEY`
     - `CLOUDINARY_UPLOAD_PRESET`
     - `CLOUDINARY_FOLDER`

5. **Deploy automatico**:
   - Vercel deploya automaticamente ad ogni push
   - Le configurazioni sono servite via endpoint runtime sicuri

### Deploy su GitHub Pages (Backup)

1. **Abilita GitHub Pages**:
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: main
   - Folder: / (root)

2. **Configura domini autorizzati**:
   - Firebase Console → Authentication → Authorized domains
   - Aggiungi il dominio GitHub Pages

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
- Le credenziali sensibili sono servite via endpoint runtime su Vercel
- Non committare mai credenziali sensibili nel repository
- Configurazioni runtime: `/api/firebase-config.js` e `/api/cloudinary-config.js`

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
- **Deploy**: Vercel (principale) + GitHub Pages (backup)

---

## 🌐 URL di Produzione

### Vercel (Raccomandato)
- **Production**: https://quovadiscout.vercel.app
- **GitHub Pages**: https://dicelessmans-projects.github.io/QuoVadiScout

### Caratteristiche Vercel
- ✅ **Sicurezza**: API keys protette tramite environment variables
- ✅ **Performance**: Edge functions e CDN globale
- ✅ **PWA**: Manifest e Service Worker configurati correttamente
- ✅ **HTTPS**: Certificati SSL automatici
- ✅ **Auto-deploy**: Deploy automatico da GitHub

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
- ✅ **Migrazione Vercel** con configurazione sicura
- ✅ **API Keys protette** tramite environment variables
- ✅ **Runtime configuration** per Firebase e Cloudinary
- ✅ **Firebase Security Rules** deployate e ottimizzate
- ✅ **PWA manifest** configurato correttamente
- ✅ **Sistema toast notifications**
- ✅ **Logging condizionale** per produzione
- ✅ **Virtual scrolling** ottimizzato
- ✅ **Performance** ottimizzate

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

