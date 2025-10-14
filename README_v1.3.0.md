# 🏕️ QuoVadiScout v1.3.0 - Guida Completa

## 🚀 Panoramica

QuoVadiScout è un'applicazione PWA avanzata per la gestione di strutture e terreni scout. La versione 1.3.0 introduce funzionalità enterprise-grade tra cui geolocalizzazione, notifiche intelligenti, analytics avanzati e molto altro.

## ✨ Nuove Funzionalità v1.3.0

### 🗺️ **Geolocalizzazione Completa**
- Coordinate GPS precise per ogni struttura
- Ricerca per vicinanza geografica
- Navigazione integrata con app mappe native
- Calcolo percorsi automatico
- Integrazione calendario per visite

### 🧠 **Notifiche Intelligenti**
- Preferenze granulari per tipo di notifica
- Notifiche basate sulla posizione utente
- Suggerimenti personalizzati
- Sincronizzazione preferenze cross-device

### 📊 **Analytics Avanzati**
- Monitoraggio performance real-time
- Tracking comportamento utente
- Core Web Vitals automatici
- Report dettagliati sull'utilizzo

### 💾 **Backup Automatici**
- Backup periodici dei dati
- Sincronizzazione intelligente
- Gestione conflitti automatica
- Ripristino rapido dati

### 📱 **PWA Enterprise**
- Installazione come app nativa
- Funzionamento offline completo
- Sincronizzazione background
- Aggiornamenti automatici

## 🛠️ Installazione

### Prerequisiti
- Browser moderno (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- Connessione internet per setup iniziale
- Firebase project (opzionale, per funzionalità avanzate)

### Installazione Locale

1. **Clona il repository:**
```bash
git clone https://github.com/tuousername/QuoVadiScout.git
cd QuoVadiScout
```

2. **Configura Firebase (opzionale):**
```bash
# Crea un file firebase-config.js nella root
cp firebase-config.example.js firebase-config.js
# Modifica con le tue credenziali Firebase
```

3. **Avvia server locale:**
```bash
# Con Python
python -m http.server 8000

# Con Node.js
npx serve .

# Con PHP
php -S localhost:8000
```

4. **Apri nel browser:**
```
http://localhost:8000
```

### Installazione PWA

1. **Apri l'app nel browser**
2. **Clicca sull'icona "Installa"** nella barra degli indirizzi
3. **Conferma l'installazione**
4. **L'app sarà disponibile** nel menu applicazioni

## ⚙️ Configurazione

### Configurazione Base

L'app include un sistema di configurazione centralizzato in `config.js`:

```javascript
// Modifica le impostazioni in config.js
AppConfig.notifications.defaultPreferences.nearbyStructures = true;
AppConfig.geolocation.distance.defaultRadius = 15; // km
AppConfig.performance.cacheDuration.structures = 10 * 60 * 1000; // 10 minuti
```

### Configurazione Firebase

Per abilitare le funzionalità cloud:

1. **Crea un progetto Firebase**
2. **Abilita Firestore Database**
3. **Abilita Firebase Storage**
4. **Configura le regole di sicurezza**

```javascript
// firebase-config.js
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### Configurazione API Keys

```javascript
// config.js
AppConfig.apiKeys = {
  googleMaps: 'your-google-maps-api-key',
  openWeather: 'your-openweather-api-key',
  moovit: 'your-moovit-api-key'
};
```

## 🎯 Utilizzo

### Funzionalità Principali

#### 🔍 **Ricerca Strutture**
- **Ricerca Testuale**: Inserisci nome o descrizione
- **Ricerca Avanzata**: Filtri per provincia, tipo, stato
- **Ricerca Geografica**: Trova strutture vicino a te
- **Filtri Combinati**: Combina più criteri di ricerca

#### 🗺️ **Geolocalizzazione**
- **Abilita GPS**: Clicca il pulsante GPS nella barra di ricerca
- **Ricerca Vicinanza**: Attiva "Ricerca per Vicinanza"
- **Imposta Raggio**: Usa lo slider per impostare la distanza
- **Navigazione**: Usa i pulsanti nelle schede strutture

#### 📱 **Gestione Offline**
- **Download Manuale**: Menu → Gestione Dati → Download Offline
- **Selezione Strutture**: Scegli le strutture da scaricare
- **Sincronizzazione**: Automatica quando torna online
- **Gestione Cache**: Monitora spazio utilizzato

#### 🔔 **Notifiche**
- **Configurazione**: Menu → Impostazioni → Preferenze Notifiche
- **Tipi Notifiche**: Attiva/disattiva per tipo
- **Distanza**: Imposta raggio per notifiche vicinanza
- **Test**: Prova le notifiche con il pulsante test

#### 📊 **Statistiche**
- **Visualizzazione**: Menu → Impostazioni → Statistiche App
- **Metriche Performance**: LCP, FID, CLS
- **Utilizzo**: Funzioni più utilizzate
- **Gestione**: Sincronizza e crea backup

### Gesture Mobile

#### 📱 **Controlli Touch**
- **Tap**: Apri scheda struttura
- **Double-tap**: Apri Google Maps
- **Long-press**: Menu contestuale
- **Swipe**: Navigazione tra elementi

#### 🎨 **UI Mobile**
- **Bottom Sheets**: Modal che si aprono dal basso
- **Responsive Grid**: Layout adattivo
- **Touch-friendly**: Pulsanti ottimizzati per touch
- **Accessibility**: Supporto screen reader

## 🔧 Manutenzione

### Backup Dati

#### **Backup Automatici**
- Backup ogni ora se online
- Ultimi 10 backup mantenuti
- Compressione automatica
- Sincronizzazione cloud

#### **Backup Manuali**
1. Menu → Gestione Dati → Gestione Backup
2. Clicca "Crea Backup"
3. Seleziona contenuto da includere
4. Conferma creazione

#### **Ripristino Dati**
1. Menu → Gestione Dati → Gestione Backup
2. Seleziona backup da ripristinare
3. Clicca "Ripristina"
4. Conferma operazione

### Monitoraggio Performance

#### **Core Web Vitals**
- **LCP**: Tempo caricamento contenuto principale
- **FID**: Ritardo primo input utente
- **CLS**: Stabilità layout

#### **Metriche App**
- Tempo caricamento pagine
- Utilizzo memoria
- Errori JavaScript
- Utilizzo funzioni

### Aggiornamenti

#### **Aggiornamenti Automatici**
- Controllo ogni 30 minuti
- Download in background
- Notifica disponibilità aggiornamento
- Installazione con un click

#### **Aggiornamenti Manuali**
1. Menu → Impostazioni → Informazioni App
2. Clicca "Controlla Aggiornamenti"
3. Segui le istruzioni

## 🐛 Risoluzione Problemi

### Problemi Comuni

#### **App Non Si Carica**
- Controlla connessione internet
- Pulisci cache browser
- Verifica console per errori
- Ricarica pagina

#### **Geolocalizzazione Non Funziona**
- Verifica permessi browser
- Controlla GPS dispositivo
- Abilita "Alta precisione"
- Riprova in area aperta

#### **Notifiche Non Arrivano**
- Verifica permessi browser
- Controlla preferenze app
- Disabilita "Non disturbare"
- Testa con pulsante test

#### **Sincronizzazione Fallisce**
- Controlla connessione internet
- Verifica credenziali Firebase
- Pulisci cache offline
- Riprova sincronizzazione

### Log e Debug

#### **Console Browser**
```javascript
// Abilita debug mode
AppConfig.debug.logging.level = 'debug';

// Visualizza statistiche
console.log(analyticsManager.generateUserReport());

// Controlla cache
console.log(localStorage.getItem('strutture_cache'));
```

#### **Log Analytics**
- Menu → Statistiche App
- Sezione "Performance"
- Metriche dettagliate
- Timeline eventi

## 📚 API Reference

### Funzioni Principali

#### **Geolocalizzazione**
```javascript
// Ottieni posizione utente
const location = await getUserLocation();

// Cerca strutture vicine
const nearby = await searchNearbyStructures(radius);

// Calcola distanza
const distance = calculateDistance(lat1, lng1, lat2, lng2);
```

#### **Notifiche**
```javascript
// Mostra notifica locale
pushManager.showLocalNotification(title, options);

// Configura preferenze
pushManager.preferences.set('nearbyStructures', true);

// Test notifica
testNotification();
```

#### **Analytics**
```javascript
// Traccia evento
analyticsManager.trackEvent('structure_view', { id: structureId });

// Traccia errore
analyticsManager.trackError('api_error', error);

// Genera report
const report = analyticsManager.generateUserReport();
```

#### **Backup**
```javascript
// Crea backup
await backupSyncManager.performBackup();

// Ripristina backup
await backupSyncManager.restoreFromBackup(backupId);

// Sincronizza dati
await backupSyncManager.performSync();
```

## 🤝 Contribuire

### Sviluppo

1. **Fork del repository**
2. **Crea branch feature**: `git checkout -b feature/nuova-funzionalita`
3. **Implementa modifiche**
4. **Testa funzionalità**
5. **Crea Pull Request**

### Testing

```bash
# Test unitari
npm test

# Test integrazione
npm run test:integration

# Test performance
npm run test:performance
```

### Code Style

- **ESLint**: Configurazione standard
- **Prettier**: Formattazione automatica
- **JSDoc**: Documentazione funzioni
- **Commit Convention**: Conventional Commits

## 📄 Licenza

Questo progetto è rilasciato sotto licenza MIT. Vedi il file `LICENSE` per i dettagli.

## 📞 Supporto

### Contatti
- **Email**: supporto@quovadiscout.app
- **GitHub Issues**: [Reporta bug o richiedi funzionalità](https://github.com/tuousername/QuoVadiScout/issues)
- **Documentazione**: [Wiki del progetto](https://github.com/tuousername/QuoVadiScout/wiki)

### Community
- **Forum**: [Discussioni community](https://github.com/tuousername/QuoVadiScout/discussions)
- **Discord**: [Chat in tempo reale](https://discord.gg/quovadiscout)
- **Twitter**: [@QuoVadiScout](https://twitter.com/quovadiscout)

---

## 🎉 Conclusione

QuoVadiScout v1.3.0 rappresenta un salto qualitativo significativo che porta l'applicazione al livello di una soluzione enterprise moderna. Con oltre 30 nuove funzionalità implementate, l'app ora offre un'esperienza completa e professionale per la gestione di strutture scout.

Grazie per aver scelto QuoVadiScout! 🏕️✨

*Documentazione aggiornata per QuoVadiScout v1.3.0 - Dicembre 2024*
