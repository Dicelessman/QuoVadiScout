/**
 * Configurazione Sistema di Geolocalizzazione
 * Impostazioni e configurazioni per il sistema di geolocalizzazione
 */

const GeolocationConfig = {
  // Google Maps API Configuration
  googleMaps: {
    apiKey: 'YOUR_GOOGLE_MAPS_API_KEY', // Sostituisci con la tua API key
    libraries: ['places', 'geometry'],
    region: 'IT',
    language: 'it'
  },

  // OpenStreetMap Nominatim Configuration (fallback)
  nominatim: {
    baseUrl: 'https://nominatim.openstreetmap.org/search',
    format: 'json',
    countryCodes: 'it',
    limit: 1,
    addressDetails: true
  },

  // Geocoding Settings
  geocoding: {
    timeout: 10000, // 10 secondi
    retryAttempts: 3,
    retryDelay: 1000, // 1 secondo
    accuracyThreshold: 'APPROXIMATE' // Livello minimo di accuratezza accettato
  },

  // UI Settings
  ui: {
    maxSearchResults: 5,
    showAccuracyLevel: true,
    enableReverseGeocoding: true,
    autoCompleteEnabled: true
  },

  // Distance Settings
  distance: {
    defaultRadius: 50, // km
    maxRadius: 200, // km
    unit: 'km'
  },

  // Cache Settings
  cache: {
    enabled: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 ore in millisecondi
    maxEntries: 1000
  },

  // Error Messages
  messages: {
    geocodingFailed: 'Impossibile trovare le coordinate per questo indirizzo',
    invalidCoordinates: 'Coordinate non valide',
    locationDenied: 'Accesso alla posizione negato',
    locationUnavailable: 'Posizione non disponibile',
    networkError: 'Errore di rete durante la geolocalizzazione',
    apiKeyMissing: 'Chiave API Google Maps non configurata',
    quotaExceeded: 'Limite API superato'
  },

  // Validation Rules
  validation: {
    coordinates: {
      lat: { min: -90, max: 90 },
      lng: { min: -180, max: 180 }
    },
    address: {
      minLength: 3,
      maxLength: 200
    }
  },

  // Feature Flags
  features: {
    googleMapsEnabled: true,
    openStreetMapEnabled: true,
    reverseGeocodingEnabled: true,
    batchGeocodingEnabled: true,
    offlineModeEnabled: false
  }
};

// Utility functions per configurazione
const GeolocationConfigUtils = {
  /**
   * Verifica se Google Maps è configurato
   */
  isGoogleMapsConfigured() {
    return GeolocationConfig.googleMaps.apiKey && 
           GeolocationConfig.googleMaps.apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY';
  },

  /**
   * Ottiene configurazione per servizio specifico
   */
  getServiceConfig(service) {
    switch (service) {
      case 'google':
        return GeolocationConfig.googleMaps;
      case 'nominatim':
        return GeolocationConfig.nominatim;
      default:
        return null;
    }
  },

  /**
   * Verifica se una feature è abilitata
   */
  isFeatureEnabled(feature) {
    return GeolocationConfig.features[feature] === true;
  },

  /**
   * Ottiene messaggio di errore
   */
  getErrorMessage(key) {
    return GeolocationConfig.messages[key] || 'Errore sconosciuto';
  },

  /**
   * Valida coordinate
   */
  validateCoordinates(lat, lng) {
    const { lat: latRules, lng: lngRules } = GeolocationConfig.validation.coordinates;
    
    return {
      lat: lat >= latRules.min && lat <= latRules.max,
      lng: lng >= lngRules.min && lng <= lngRules.max,
      valid: lat >= latRules.min && lat <= latRules.max && 
             lng >= lngRules.min && lng <= lngRules.max
    };
  },

  /**
   * Valida indirizzo
   */
  validateAddress(address) {
    const { minLength, maxLength } = GeolocationConfig.validation.address;
    return address && 
           address.length >= minLength && 
           address.length <= maxLength;
  },

  /**
   * Ottiene URL per servizio di geocoding
   */
  getGeocodingUrl(service, params = {}) {
    switch (service) {
      case 'nominatim':
        const nominatimConfig = GeolocationConfig.nominatim;
        const url = new URL(nominatimConfig.baseUrl);
        url.searchParams.set('format', nominatimConfig.format);
        url.searchParams.set('countrycodes', nominatimConfig.countryCodes);
        url.searchParams.set('limit', nominatimConfig.limit);
        url.searchParams.set('addressdetails', nominatimConfig.addressDetails);
        
        if (params.query) {
          url.searchParams.set('q', params.query);
        }
        
        return url.toString();
      
      default:
        return null;
    }
  },

  /**
   * Ottiene configurazione cache
   */
  getCacheConfig() {
    return {
      enabled: GeolocationConfig.cache.enabled,
      maxAge: GeolocationConfig.cache.maxAge,
      maxEntries: GeolocationConfig.cache.maxEntries
    };
  }
};

// Esporta configurazione
window.GeolocationConfig = GeolocationConfig;
window.GeolocationConfigUtils = GeolocationConfigUtils;

// Log configurazione al caricamento
console.log('📍 Sistema di Geolocalizzazione configurato:', {
  googleMapsConfigured: GeolocationConfigUtils.isGoogleMapsConfigured(),
  features: Object.keys(GeolocationConfig.features).filter(
    key => GeolocationConfig.features[key]
  )
});
