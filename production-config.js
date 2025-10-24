// production-config.js
// Configurazione per ambiente di produzione QuoVadiScout

const ProductionConfig = {
  // Configurazione sicurezza
  security: {
    // Rate limiting più rigoroso in produzione
    rateLimits: {
      login: { requests: 3, window: 300000 }, // 3 tentativi ogni 5 minuti
      register: { requests: 2, window: 900000 }, // 2 registrazioni ogni 15 minuti
      read: { requests: 50, window: 60000 }, // 50 letture al minuto
      write: { requests: 10, window: 60000 }, // 10 scritture al minuto
      delete: { requests: 3, window: 60000 }, // 3 eliminazioni al minuto
      api: { requests: 30, window: 60000 }, // 30 richieste API al minuto
      search: { requests: 25, window: 60000 }, // 25 ricerche al minuto
      export: { requests: 3, window: 300000 } // 3 export ogni 5 minuti
    },
    
    // Timeout più brevi in produzione
    timeouts: {
      session: 1800000, // 30 minuti
      token: 3600000, // 1 ora
      request: 30000 // 30 secondi
    },
    
    // Validazione più rigorosa
    validation: {
      maxFileSize: 5 * 1024 * 1024, // 5MB
      maxStringLength: 1000,
      maxArrayLength: 100,
      maxObjectDepth: 5
    }
  },

  // Configurazione performance
  performance: {
    // Cache più aggressiva
    cache: {
      static: 31536000, // 1 anno
      dynamic: 3600, // 1 ora
      api: 300 // 5 minuti
    },
    
    // Lazy loading più aggressivo
    lazyLoading: {
      images: true,
      components: true,
      routes: true
    },
    
    // Compressione
    compression: {
      gzip: true,
      brotli: true,
      images: true
    }
  },

  // Configurazione monitoring
  monitoring: {
    // Logging più dettagliato
    logging: {
      level: 'info',
      console: false,
      remote: true,
      retention: 30 // giorni
    },
    
    // Analytics più dettagliato
    analytics: {
      tracking: true,
      performance: true,
      errors: true,
      user: true
    },
    
    // Alerting
    alerting: {
      errors: true,
      performance: true,
      security: true,
      threshold: 5 // errori per minuto
    }
  },

  // Configurazione backup
  backup: {
    // Backup più frequente
    frequency: 3600000, // ogni ora
    retention: 168, // 7 giorni
    compression: true,
    encryption: true
  },

  // Configurazione notifiche
  notifications: {
    // Notifiche più conservative
    push: {
      enabled: true,
      frequency: 'daily',
      types: ['important', 'security']
    },
    
    // Email più restrittive
    email: {
      enabled: true,
      frequency: 'weekly',
      types: ['security', 'maintenance']
    }
  },

  // Configurazione API
  api: {
    // Rate limiting API più rigoroso
    rateLimit: {
      requests: 1000, // per ora
      burst: 10 // per secondo
    },
    
    // Timeout più brevi
    timeout: 10000, // 10 secondi
    
    // Retry più conservativo
    retry: {
      attempts: 2,
      delay: 1000
    }
  },

  // Configurazione storage
  storage: {
    // Quota più limitata
    quota: {
      user: 100 * 1024 * 1024, // 100MB per utente
      total: 10 * 1024 * 1024 * 1024 // 10GB totali
    },
    
    // Compressione più aggressiva
    compression: {
      images: 0.8,
      documents: 0.9,
      data: 0.95
    }
  }
};

// Funzione per applicare configurazione produzione
function applyProductionConfig() {
  // Applica rate limiting più rigoroso
  if (window.rateLimiter) {
    for (const [operation, limit] of Object.entries(ProductionConfig.security.rateLimits)) {
      window.rateLimiter.setLimits(operation, limit.requests, limit.window);
    }
  }

  // Applica timeout più brevi
  if (window.securityMonitor) {
    window.securityMonitor.timeouts = ProductionConfig.security.timeouts;
  }

  // Applica validazione più rigorosa
  if (window.dataValidator) {
    window.dataValidator.maxLengths = ProductionConfig.security.validation;
  }

  // Applica configurazione performance
  if (window.AppConfig) {
    window.AppConfig.performance = {
      ...window.AppConfig.performance,
      ...ProductionConfig.performance
    };
  }

  console.log('🚀 Configurazione produzione applicata');
}

// Auto-applica configurazione se in produzione
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
  applyProductionConfig();
}

// Esporta configurazione
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ProductionConfig, applyProductionConfig };
} else {
  window.ProductionConfig = ProductionConfig;
  window.applyProductionConfig = applyProductionConfig;
}

console.log('🚀 Production Config caricato');
