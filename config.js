// config.js
// Configurazione centralizzata per QuoVadiScout v1.3.0

const AppConfig = {
  // === VERSIONE APP ===
  version: '1.3.0',
  buildDate: '2024-12-19',
  
  // === API KEYS ===
  apiKeys: {
    // VAPID Key per push notifications (caricata da firebase-config.js)
    vapidPublicKey: '', // Sarà caricata dinamicamente da FirebaseConfig
    
    // API Keys per servizi esterni (da configurare)
    googleMaps: '', // Google Maps API Key
    openWeather: '', // OpenWeatherMap API Key
    moovit: '', // Moovit API Key per trasporti pubblici
  },
  
  // === CONFIGURAZIONI PERFORMANCE ===
  performance: {
    // Cache durations (in milliseconds)
    cacheDuration: {
      structures: 5 * 60 * 1000, // 5 minuti
      images: 60 * 60 * 1000, // 1 ora
      analytics: 24 * 60 * 60 * 1000, // 24 ore
    },
    
    // Lazy loading settings
    lazyLoading: {
      enabled: true,
      threshold: 200, // px
      rootMargin: '50px',
    },
    
    // Virtual scrolling settings
    virtualScroll: {
      enabled: true,
      itemHeight: 200, // px
      bufferSize: 10, // elementi da pre-renderizzare
    },
    
    // Image compression settings
    imageCompression: {
      quality: 0.8, // 80% quality
      maxWidth: 1920,
      maxHeight: 1080,
      format: 'image/jpeg', // fallback format
    },
  },
  
  // === CONFIGURAZIONI NOTIFICHE ===
  notifications: {
    // Default notification preferences
    defaultPreferences: {
      newStructures: true,
      structureUpdates: true,
      personalListUpdates: true,
      nearbyStructures: false,
      reports: true,
      distance: 10, // km per notifiche vicinanza
    },
    
    // Notification limits
    limits: {
      maxPerDay: 10,
      minTimeBetween: 30 * 60 * 1000, // 30 minuti
    },
    
    // Smart notification settings
    smartNotifications: {
      enabled: true,
      suggestionInterval: 2 * 60 * 60 * 1000, // 2 ore
      maxSuggestionDistance: 25, // km
    },
  },
  
  // === CONFIGURAZIONI GEOLOCALIZZAZIONE ===
  geolocation: {
    // Default settings
    defaultSettings: {
      enableHighAccuracy: true,
      timeout: 10000, // 10 secondi
      maximumAge: 300000, // 5 minuti
    },
    
    // Watch settings
    watchSettings: {
      enableHighAccuracy: false,
      timeout: 30000, // 30 secondi
      maximumAge: 60000, // 1 minuto
    },
    
    // Distance calculations
    distance: {
      defaultRadius: 10, // km
      maxRadius: 100, // km
      unit: 'km',
    },
  },
  
  // === CONFIGURAZIONI OFFLINE ===
  offline: {
    // Cache settings
    cache: {
      maxStructures: 50,
      maxImages: 200,
      maxStorageSize: 50 * 1024 * 1024, // 50MB
    },
    
    // Sync settings
    sync: {
      autoSyncInterval: 30 * 60 * 1000, // 30 minuti
      maxRetries: 3,
      retryDelay: 5000, // 5 secondi
    },
    
    // Conflict resolution
    conflictResolution: {
      strategy: 'last-write-wins', // 'last-write-wins' | 'merge' | 'manual'
      autoResolve: true,
      notifyUser: true,
    },
  },
  
  // === CONFIGURAZIONI ANALYTICS ===
  analytics: {
    // Tracking settings
    tracking: {
      enabled: true,
      anonymize: true,
      batchSize: 100,
      flushInterval: 5 * 60 * 1000, // 5 minuti
    },
    
    // Performance monitoring
    performance: {
      enabled: true,
      coreWebVitals: true,
      memoryMonitoring: true,
      errorTracking: true,
    },
    
    // Data retention
    retention: {
      events: 30, // giorni
      errors: 7, // giorni
      performance: 14, // giorni
    },
  },
  
  // === CONFIGURAZIONI BACKUP ===
  backup: {
    // Automatic backup settings
    automatic: {
      enabled: true,
      interval: 60 * 60 * 1000, // 1 ora
      maxBackups: 10,
    },
    
    // Backup content
    content: {
      structures: true,
      preferences: true,
      personalList: true,
      cache: true,
      analytics: false, // Non includere analytics nei backup
    },
    
    // Storage settings
    storage: {
      local: true,
      remote: true, // Firebase
      compression: true,
    },
  },
  
  // === CONFIGURAZIONI UI/UX ===
  ui: {
    // Theme settings
    theme: {
      default: 'light',
      autoDetect: true,
      customColors: {
        primary: '#2f6b2f',
        secondary: '#1a4d1a',
        accent: '#4caf50',
      },
    },
    
    // Responsive breakpoints
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1200,
    },
    
    // Animation settings
    animations: {
      enabled: true,
      duration: 300, // ms
      easing: 'ease-out',
    },
    
    // Accessibility
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      screenReader: true,
    },
  },
  
  // === CONFIGURAZIONI PWA ===
  pwa: {
    // Installation settings
    installation: {
      promptAfter: 3, // mostre dopo 3 visite
      cooldown: 24 * 60 * 60 * 1000, // 24 ore
    },
    
    // Update settings
    updates: {
      checkInterval: 30 * 60 * 1000, // 30 minuti
      autoUpdate: true,
      notifyUser: true,
    },
    
    // Offline settings
    offline: {
      fallbackPage: '/offline.html',
      cacheStrategy: 'network-first',
    },
  },
  
  // === CONFIGURAZIONI DEBUG ===
  debug: {
    // Logging levels
    logging: {
      level: 'info', // 'debug' | 'info' | 'warn' | 'error'
      console: true,
      remote: false, // Invia log al server
    },
    
    // Development features
    development: {
      mockData: false,
      fakeGeolocation: false,
      simulateOffline: false,
    },
    
    // Performance profiling
    profiling: {
      enabled: false,
      slowOperations: 1000, // ms
    },
  },
  
  // === CONFIGURAZIONI SICUREZZA ===
  security: {
    // Content Security Policy
    csp: {
      enabled: true,
      reportOnly: false,
    },
    
    // Input validation
    validation: {
      sanitizeInput: true,
      maxLength: 1000,
      allowedTags: ['b', 'i', 'em', 'strong'],
    },
    
    // API security
    api: {
      rateLimit: 100, // requests per minute
      timeout: 30000, // 30 secondi
      retries: 3,
    },
  },
  
  // === METODI UTILITÀ ===
  utils: {
    // Get configuration value with fallback
    get: function(path, defaultValue = null) {
      return path.split('.').reduce((obj, key) => obj?.[key], this) ?? defaultValue;
    },
    
    // Set configuration value
    set: function(path, value) {
      const keys = path.split('.');
      const lastKey = keys.pop();
      const target = keys.reduce((obj, key) => obj[key] = obj[key] || {}, this);
      target[lastKey] = value;
    },
    
    // Check if feature is enabled
    isEnabled: function(feature) {
      return this.get(`features.${feature}`, true);
    },
    
    // Get environment-specific config
    getEnvConfig: function() {
      const env = window.location.hostname === 'localhost' ? 'development' : 'production';
      return this.get(`environments.${env}`, {});
    },
  },
  
  // === FEATURES FLAGS ===
  features: {
    // Core features
    geolocation: true,
    offlineMode: true,
    pushNotifications: true,
    analytics: true,
    backup: true,
    
    // Advanced features
    smartNotifications: true,
    virtualScrolling: true,
    imageCompression: true,
    backgroundSync: true,
    gestureControls: true,
    
    // Experimental features
    aiSuggestions: false,
    voiceCommands: false,
    arNavigation: false,
    blockchainIntegration: false,
  },
  
  // === ENVIRONMENT CONFIGURATIONS ===
  environments: {
    development: {
      apiUrl: 'http://localhost:3000',
      debug: true,
      mockData: true,
    },
    production: {
      apiUrl: 'https://quovadiscout.firebaseapp.com',
      debug: false,
      mockData: false,
    },
  },
};

// === INIZIALIZZAZIONE CONFIGURAZIONE ===
// Carica VAPID key da FirebaseConfig se disponibile
if (typeof FirebaseConfig !== 'undefined' && FirebaseConfig.vapidKey) {
  AppConfig.apiKeys.vapidPublicKey = FirebaseConfig.vapidKey;
}

window.AppConfig = AppConfig;

// Carica configurazioni da localStorage se disponibili
function loadUserConfig() {
  try {
    const userConfig = localStorage.getItem('app_config');
    if (userConfig) {
      const parsed = JSON.parse(userConfig);
      Object.assign(AppConfig, parsed);
      console.log('⚙️ Configurazione utente caricata');
    }
  } catch (error) {
    console.warn('⚠️ Errore caricamento configurazione utente:', error);
  }
}

// Salva configurazioni in localStorage
function saveUserConfig() {
  try {
    localStorage.setItem('app_config', JSON.stringify(AppConfig));
    console.log('💾 Configurazione salvata');
  } catch (error) {
    console.warn('⚠️ Errore salvataggio configurazione:', error);
  }
}

// Carica configurazione all'avvio
loadUserConfig();

// Salva configurazione prima della chiusura
window.addEventListener('beforeunload', saveUserConfig);

// Esponi funzioni globalmente
window.loadUserConfig = loadUserConfig;
window.saveUserConfig = saveUserConfig;

// Esponi Config per compatibilità test
window.Config = {
  get: (path, defaultValue) => AppConfig.utils.get.call(AppConfig, path, defaultValue)
};

console.log('⚙️ AppConfig v1.3.0 inizializzato');
