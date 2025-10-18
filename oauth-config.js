// === CONFIGURAZIONE OAUTH PROVIDERS ===
// File di configurazione per i provider OAuth in QuoVadiScout

const OAuthConfig = {
  // === CONFIGURAZIONE PROVIDER ===
  providers: {
    google: {
      enabled: true,
      name: 'Google',
      icon: 'fab fa-google',
      color: '#db4437',
      scopes: ['email', 'profile'],
      description: 'Accedi con il tuo account Google'
    },
    
    github: {
      enabled: true,
      name: 'GitHub',
      icon: 'fab fa-github',
      color: '#333',
      scopes: ['user:email'],
      description: 'Accedi con il tuo account GitHub'
    },
    
    microsoft: {
      enabled: true,
      name: 'Microsoft',
      icon: 'fab fa-microsoft',
      color: '#00a4ef',
      scopes: ['email', 'profile'],
      description: 'Accedi con il tuo account Microsoft'
    },
    
    facebook: {
      enabled: true,
      name: 'Facebook',
      icon: 'fab fa-facebook',
      color: '#1877f2',
      scopes: ['email'],
      description: 'Accedi con il tuo account Facebook'
    },
    
    twitter: {
      enabled: true,
      name: 'Twitter',
      icon: 'fab fa-twitter',
      color: '#1da1f2',
      scopes: ['email'],
      description: 'Accedi con il tuo account Twitter'
    },
    
    apple: {
      enabled: true,
      name: 'Apple',
      icon: 'fab fa-apple',
      color: '#000',
      scopes: ['email', 'name'],
      description: 'Accedi con il tuo account Apple'
    }
  },
  
  // === CONFIGURAZIONI FIREBASE ===
  firebase: {
    // Configurazione per Firebase Auth
    authDomain: 'quovadiscout.firebaseapp.com',
    
    // Provider abilitati in Firebase Console
    enabledProviders: [
      'google.com',
      'github.com', 
      'microsoft.com',
      'facebook.com',
      'twitter.com',
      'apple.com'
    ],
    
    // Configurazione redirect
    redirectUrl: window.location.origin,
    
    // Configurazione popup
    popupEnabled: true,
    redirectEnabled: false
  },
  
  // === CONFIGURAZIONI UI ===
  ui: {
    // Ordine dei provider nel modale
    providerOrder: ['google', 'github', 'microsoft', 'facebook', 'twitter', 'apple'],
    
    // Provider principali (mostrati in evidenza)
    primaryProviders: ['google', 'github'],
    
    // Provider secondari (raggruppati)
    secondaryProviders: ['microsoft', 'facebook', 'twitter', 'apple'],
    
    // Configurazione responsive
    mobile: {
      maxProvidersPerRow: 1,
      showDescriptions: false
    },
    
    desktop: {
      maxProvidersPerRow: 2,
      showDescriptions: true
    }
  },
  
  // === CONFIGURAZIONI SICUREZZA ===
  security: {
    // Timeout per popup OAuth
    popupTimeout: 60000, // 60 secondi
    
    // Retry automatici
    maxRetries: 3,
    retryDelay: 1000,
    
    // Validazione domini
    allowedDomains: [
      'quovadiscout.firebaseapp.com',
      'localhost',
      '127.0.0.1'
    ],
    
    // Configurazione CSP per OAuth
    csp: {
      'script-src': [
        "'self'",
        "'unsafe-inline'",
        'https://apis.google.com',
        'https://accounts.google.com',
        'https://www.gstatic.com',
        'https://www.googleapis.com'
      ],
      'connect-src': [
        "'self'",
        'https://identitytoolkit.googleapis.com',
        'https://securetoken.googleapis.com',
        'https://oauth2.googleapis.com'
      ]
    }
  },
  
  // === CONFIGURAZIONI ANALYTICS ===
  analytics: {
    // Tracciamento eventi OAuth
    trackEvents: true,
    
    // Eventi da tracciare
    events: {
      loginAttempt: 'oauth_login_attempt',
      loginSuccess: 'oauth_login_success',
      loginError: 'oauth_login_error',
      providerSelected: 'oauth_provider_selected',
      popupOpened: 'oauth_popup_opened',
      popupClosed: 'oauth_popup_closed'
    },
    
    // Parametri aggiuntivi
    customParameters: {
      app_version: '1.3.0',
      platform: 'web'
    }
  },
  
  // === METODI UTILITÀ ===
  utils: {
    // Ottieni provider per nome
    getProvider: function(name) {
      return this.providers[name] || null;
    },
    
    // Ottieni provider abilitati
    getEnabledProviders: function() {
      if (!this.providers || typeof this.providers !== 'object') {
        return [];
      }
      return Object.entries(this.providers)
        .filter(([name, config]) => config && config.enabled)
        .map(([name, config]) => ({ name, ...config }));
    },
    
    // Verifica se un provider è abilitato
    isProviderEnabled: function(name) {
      return this.providers[name]?.enabled || false;
    },
    
    // Ottieni configurazione UI per dispositivo
    getUIConfig: function() {
      const isMobile = window.innerWidth <= 768;
      return isMobile ? this.ui.mobile : this.ui.desktop;
    },
    
    // Genera configurazione provider per Firebase
    getFirebaseProviderConfig: function(providerName) {
      const provider = this.getProvider(providerName);
      if (!provider || !provider.scopes) return null;
      
      return {
        providerId: `${providerName}.com`,
        scopes: provider.scopes,
        customParameters: {
          prompt: 'select_account'
        }
      };
    },
    
    // Valida configurazione OAuth
    validateConfig: function() {
      const errors = [];
      
      // Verifica provider abilitati
      const enabledProviders = this.getEnabledProviders();
      if (enabledProviders.length === 0) {
        errors.push('Nessun provider OAuth abilitato');
      }
      
      // Verifica configurazione Firebase
      if (!this.firebase || !this.firebase.authDomain) {
        errors.push('Auth domain Firebase non configurato');
      }
      
      // Verifica provider in Firebase
      if (this.firebase && this.firebase.enabledProviders) {
        const missingProviders = enabledProviders.filter(p => 
          !this.firebase.enabledProviders.includes(`${p.name}.com`)
        );
        
        if (missingProviders.length > 0) {
          errors.push(`Provider non configurati in Firebase: ${missingProviders.map(p => p.name).join(', ')}`);
        }
      }
      
      return {
        valid: errors.length === 0,
        errors: errors
      };
    }
  }
};

// === INIZIALIZZAZIONE ===
console.log('🔐 OAuthConfig caricato');

// Validazione configurazione
const validation = OAuthConfig.utils.validateConfig();
if (!validation.valid) {
  console.warn('⚠️ Configurazione OAuth non valida:', validation.errors);
} else {
  console.log('✅ Configurazione OAuth valida');
  console.log(`📋 Provider abilitati: ${OAuthConfig.utils.getEnabledProviders().map(p => p.name).join(', ')}`);
}

// Esponi configurazione globalmente
window.OAuthConfig = OAuthConfig;

// === HELPER FUNCTIONS ===
window.getOAuthProvider = function(name) {
  return OAuthConfig.utils.getProvider(name);
};

window.getEnabledOAuthProviders = function() {
  return OAuthConfig.utils.getEnabledProviders();
};

window.isOAuthProviderEnabled = function(name) {
  return OAuthConfig.utils.isProviderEnabled(name);
};

console.log('🔐 Funzioni OAuth helper esposte globalmente');
