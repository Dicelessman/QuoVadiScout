# Sistema di Geolocalizzazione QuoVadiScout

## 📍 Panoramica

Il sistema di geolocalizzazione per QuoVadiScout integra **due metodi principali** per la gestione delle posizioni delle strutture:

1. **Google Maps API** - Per geocoding preciso e funzionalità avanzate
2. **Concatenazione Indirizzo** - Per compatibilità e fallback

## 🚀 Funzionalità

### Metodi di Geolocalizzazione

#### 1. Google Maps API
- **Geocoding diretto**: Ricerca indirizzo → coordinate
- **Reverse geocoding**: Coordinate → indirizzo
- **Autocomplete**: Suggerimenti durante digitazione
- **Link diretti**: Apertura in Google Maps

#### 2. Concatenazione Indirizzo
- **Formato**: `Via + Numero, Luogo, Provincia`
- **Fallback**: Quando Google Maps non disponibile
- **Compatibilità**: Funziona con OpenStreetMap

#### 3. Coordinate Manuali
- **Inserimento diretto**: Latitudine e longitudine
- **Validazione**: Controllo coordinate valide
- **Posizione attuale**: GPS del dispositivo

## 🛠️ Configurazione

### 1. Google Maps API Key

Modifica `geolocation-config.js`:

```javascript
googleMaps: {
  apiKey: 'TUA_CHIAVE_API_GOOGLE_MAPS', // Sostituisci qui
  libraries: ['places', 'geometry'],
  region: 'IT',
  language: 'it'
}
```

### 2. Ottieni API Key

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuovo progetto o seleziona esistente
3. Abilita le API:
   - Maps JavaScript API
   - Geocoding API
   - Places API
4. Crea credenziali → API Key
5. Configura restrizioni (opzionale ma consigliato)

## 📱 Utilizzo

### Interfaccia Utente

#### Apertura Modale Geolocalizzazione
```javascript
// Apri modale per nuova struttura
geolocationUI.showModal();

// Apri modale per struttura esistente
geolocationUI.showModal(structure);
```

#### Metodi Disponibili

1. **Ricerca Google Maps**
   - Inserisci indirizzo completo
   - Clicca "🔍 Cerca"
   - Seleziona risultato

2. **Indirizzo Strutturato**
   - Compila: Via, Numero, Luogo, Provincia
   - Clicca "🌍 Trova Coordinate"

3. **Coordinate Manuali**
   - Inserisci latitudine e longitudine
   - Clicca "✅ Valida"

4. **Posizione Attuale**
   - Clicca "📍 Posizione Attuale"
   - Usa GPS del dispositivo

### API Programmabile

#### Geocoding
```javascript
// Geocoding con Google Maps
const result = await geolocationManager.geocodeWithGoogleMaps('Via Roma 123, Milano, MI');

// Geocoding con concatenazione
const result = await geolocationManager.geocodeWithConcatenation({
  via: 'Via Roma',
  numero: '123',
  luogo: 'Milano',
  provincia: 'MI'
});
```

#### Reverse Geocoding
```javascript
const result = await geolocationManager.reverseGeocode(45.4642, 9.1900);
```

#### Calcolo Distanze
```javascript
const distance = geolocationManager.calculateDistance(lat1, lng1, lat2, lng2);
```

#### Strutture Vicine
```javascript
const nearby = geolocationManager.findNearbyStructures(userLat, userLng, structures, 50);
```

## 🔧 Integrazione

### Eventi Personalizzati

```javascript
// Ascolta salvataggio geolocalizzazione
document.addEventListener('geolocationSaved', (event) => {
  const { structure, result, isEditing } = event.detail;
  // Gestisci salvataggio
});

// Ascolta aggiornamento strutture
document.addEventListener('structuresUpdated', () => {
  // Aggiorna UI
});
```

### Pulsanti Automatici

Il sistema aggiunge automaticamente pulsanti "📍 Posizione" alle card delle strutture.

### Geocoding Automatico

```javascript
// Processa strutture senza coordinate
geolocationIntegration.processStructuresWithoutCoordinates();
```

## 📊 Struttura Dati

### Risultato Geocoding
```javascript
{
  success: true,
  coordinates: {
    lat: 45.4642,
    lng: 9.1900
  },
  formattedAddress: "Via Roma 123, 20100 Milano MI, Italia",
  addressComponents: {
    streetNumber: "123",
    route: "Via Roma",
    locality: "Milano",
    administrativeAreaLevel2: "Milano",
    administrativeAreaLevel1: "Lombardia",
    country: "Italia",
    postalCode: "20100"
  },
  googleMapsUrl: "https://maps.google.com/maps?q=...",
  placeId: "ChIJ...",
  accuracy: "Massima (edificio specifico)"
}
```

### Struttura con Coordinate
```javascript
{
  id: "1234567890",
  struttura: "Nome Struttura",
  luogo: "Milano",
  provincia: "MI",
  coordinate: {
    lat: 45.4642,
    lng: 9.1900
  },
  indirizzo: "Via Roma 123, Milano, MI",
  dataCreazione: "2024-01-01T00:00:00.000Z"
}
```

## 🎨 Personalizzazione

### Stili CSS

Modifica `geolocation-styles.css` per personalizzare l'aspetto:

```css
.geolocation-modal {
  /* Stili modale */
}

.geolocation-method {
  /* Stili sezioni */
}

.btn-primary {
  /* Stili pulsanti */
}
```

### Configurazione Avanzata

Modifica `geolocation-config.js` per:

- Timeout e retry
- Cache settings
- Messaggi di errore
- Feature flags
- Validazione

## 🔍 Debug e Troubleshooting

### Console Logs

Il sistema logga informazioni dettagliate:

```javascript
// Abilita debug
localStorage.setItem('geolocationDebug', 'true');
```

### Errori Comuni

1. **"API key non configurata"**
   - Configura `googleMaps.apiKey` in `geolocation-config.js`

2. **"Geocoding fallito"**
   - Verifica formato indirizzo
   - Controlla quota API

3. **"Posizione negata"**
   - Richiedi permessi geolocalizzazione
   - Verifica HTTPS

### Test Sistema

```javascript
// Test configurazione
console.log('Google Maps configurato:', geolocationConfigUtils.isGoogleMapsConfigured());

// Test geocoding
geolocationManager.geocodeWithGoogleMaps('Milano, Italia')
  .then(result => console.log('Test geocoding:', result));
```

## 📈 Performance

### Cache

Il sistema implementa cache automatica per:
- Risultati geocoding
- Coordinate validate
- Indirizzi formattati

### Ottimizzazioni

- Lazy loading Google Maps API
- Debounce per ricerche
- Batch processing per multiple strutture
- Fallback automatico a OpenStreetMap

## 🔒 Sicurezza

### API Key

- **Non committare** la chiave API nel repository
- Usa variabili d'ambiente in produzione
- Configura restrizioni IP/dominio

### Privacy

- Coordinate non vengono inviate a server esterni
- Cache locale solo
- Geolocalizzazione richiede permesso utente

## 📚 Risorse

- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Geocoding API](https://developers.google.com/maps/documentation/geocoding)
- [OpenStreetMap Nominatim](https://nominatim.org/)
- [Leaflet Maps](https://leafletjs.com/)

## 🤝 Contributi

Per migliorare il sistema di geolocalizzazione:

1. Fork del repository
2. Crea feature branch
3. Implementa miglioramenti
4. Testa funzionalità
5. Crea pull request

## 📄 Licenza

Questo sistema di geolocalizzazione è parte del progetto QuoVadiScout e segue la stessa licenza del progetto principale.
