// Security Monitoring per QuoVadiScout

class SecurityMonitor {
  constructor() {
    this.suspiciousActivity = [];
    this.checkInterval = 30000; // 30 secondi
    this.maxIncidents = 5;
    this.init();
  }

  init() {
    // Monitora tentativi di manipolazione variabili globali
    this.monitorGlobalVariables();
    
    // Monitora chiamate API sospette
    this.monitorApiCalls();
    
    // Monitora tentativi di bypass autenticazione
    this.monitorAuthBypass();
    
    // Check periodici
    setInterval(() => this.runSecurityChecks(), this.checkInterval);
    
    console.log('🛡️ Security Monitor attivo');
  }

  monitorGlobalVariables() {
    // Crea proxy per variabili critiche
    const criticalVars = ['utenteCorrente', 'userProfile'];
    
    criticalVars.forEach(varName => {
      const originalValue = window[varName];
      let currentValue = originalValue;
      
      Object.defineProperty(window, varName, {
        get() {
          return currentValue;
        },
        set(newValue) {
          // Log tentativi sospetti
          if (newValue !== currentValue && !this.isLegitimateChange()) {
            this.logSuspiciousActivity('global_var_manipulation', {
              variable: varName,
              oldValue: currentValue,
              newValue: newValue,
              attempted: true
            });
            console.warn(`⚠️ Tentativo di manipolare ${varName} rilevato`);
          }
          currentValue = newValue;
        },
        configurable: false
      });
    });
  }

  monitorApiCalls() {
    // Intercetta fetch per monitorare chiamate
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const [url] = args;
      
      // Log chiamate API sospette
      if (typeof url === 'string') {
        if (url.includes('firestore.googleapis.com') && !this.isAuthenticatedUser()) {
          this.logSuspiciousActivity('unauthorized_firestore_access', {
            url: url,
            authenticated: false
          });
          console.warn('🚨 Tentativo accesso Firestore non autorizzato');
        }
        
        if (url.includes('cloudfunctions.net') && !this.isAuthenticatedUser()) {
          this.logSuspiciousActivity('unauthorized_api_access', {
            url: url,
            authenticated: false
          });
          console.warn('🚨 Tentativo accesso API non autorizzato');
        }
      }
      
      return originalFetch.apply(this, args);
    };
  }

  monitorAuthBypass() {
    // Monitora tentativi di bypass delle funzioni di autenticazione
    const authFunctions = ['caricaStrutture', 'aggiungiStruttura', 'salvaModifiche'];
    
    authFunctions.forEach(funcName => {
      if (typeof window[funcName] === 'function') {
        const originalFunction = window[funcName];
        window[funcName] = async (...args) => {
          // Verifica autenticazione prima dell'esecuzione
          if (!this.isAuthenticatedUser()) {
            this.logSuspiciousActivity('auth_bypass_attempt', {
              function: funcName,
              args: args,
              authenticated: false
            });
            console.warn(`🚨 Tentativo bypass autenticazione in ${funcName}`);
            
            if (typeof showError === 'function') {
              showError('Accesso non autorizzato. Effettua il login.');
            }
            return;
          }
          
          return originalFunction.apply(this, args);
        };
      }
    });
  }

  async runSecurityChecks() {
    const checks = [
      this.checkAuthState(),
      this.checkTokenValidity(),
      this.checkLocalStorageIntegrity(),
      this.checkSuspiciousPatterns()
    ];
    
    await Promise.all(checks);
  }

  async checkAuthState() {
    if (!window.auth?.currentUser) {
      return; // Non autenticato, OK
    }
    
    // Verifica che l'utente sia veramente autenticato con Firebase
    try {
      await window.auth.currentUser.getIdToken(true);
    } catch (error) {
      this.logSuspiciousActivity('invalid_auth_state', {
        error: error.message,
        userId: window.auth?.currentUser?.uid
      });
      console.error('🚨 Stato autenticazione non valido:', error);
      await this.forceLogout();
    }
  }

  async checkTokenValidity() {
    if (!window.auth?.currentUser) return;
    
    try {
      const token = await window.auth.currentUser.getIdToken();
      const decoded = this.parseJWT(token);
      
      // Verifica scadenza
      if (decoded.exp * 1000 < Date.now()) {
        this.logSuspiciousActivity('expired_token_used', {
          expired: true,
          userId: window.auth.currentUser.uid
        });
        await this.forceLogout();
      }
      
      // Verifica issuer
      if (typeof window.firebaseConfig !== 'undefined' && decoded.iss !== `https://securetoken.google.com/${window.firebaseConfig.projectId}`) {
        this.logSuspiciousActivity('invalid_token_issuer', {
          issuer: decoded.iss,
          expected: `https://securetoken.google.com/${window.firebaseConfig.projectId}`
        });
        await this.forceLogout();
      }
    } catch (error) {
      console.error('Errore verifica token:', error);
      this.logSuspiciousActivity('token_verification_error', {
        error: error.message
      });
    }
  }

  checkLocalStorageIntegrity() {
    // Verifica che dati cache non siano stati manomessi
    const cacheKey = 'strutture_cache';
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      try {
        const data = JSON.parse(cached);
        if (!Array.isArray(data)) {
          this.logSuspiciousActivity('cache_tampering', {
            detected: true,
            cacheKey: cacheKey
          });
          localStorage.removeItem(cacheKey);
          console.warn('🚨 Cache manomessa rilevata e pulita');
        }
        
        // Verifica che le strutture abbiano i campi obbligatori
        for (const item of data) {
          if (!item.id || !item.Struttura) {
            this.logSuspiciousActivity('corrupted_cache_data', {
              item: item,
              cacheKey: cacheKey
            });
            localStorage.removeItem(cacheKey);
            console.warn('🚨 Dati cache corrotti rilevati e puliti');
            break;
          }
        }
      } catch (error) {
        // Cache corrotta
        this.logSuspiciousActivity('cache_parse_error', {
          error: error.message,
          cacheKey: cacheKey
        });
        localStorage.removeItem(cacheKey);
        console.warn('🚨 Cache corrotta rilevata e pulita');
      }
    }
  }

  checkSuspiciousPatterns() {
    // Verifica pattern sospetti nel codice eseguito
    const suspiciousPatterns = [
      'eval(',
      'Function(',
      'setTimeout(',
      'setInterval(',
      'document.cookie',
      'localStorage.setItem',
      'sessionStorage.setItem'
    ];
    
    // Monitora console per pattern sospetti
    const originalLog = console.log;
    console.log = (...args) => {
      const message = args.join(' ');
      suspiciousPatterns.forEach(pattern => {
        if (message.includes(pattern)) {
          this.logSuspiciousActivity('suspicious_console_activity', {
            pattern: pattern,
            message: message
          });
        }
      });
      originalLog.apply(console, args);
    };
  }

  logSuspiciousActivity(type, details) {
    const activity = {
      type: type,
      details: details,
      timestamp: new Date().toISOString(),
      userId: window.auth?.currentUser?.uid || 'anonymous',
      userAgent: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer
    };
    
    this.suspiciousActivity.push(activity);
    console.warn('🚨 Attività sospetta rilevata:', activity);
    
    // Invia al backend se troppi tentativi
    if (this.suspiciousActivity.length >= this.maxIncidents) {
      this.reportToBackend();
    }
  }

  async reportToBackend() {
    try {
      if (typeof db !== 'undefined') {
        await window.db.collection('security_incidents').add({
          activities: this.suspiciousActivity,
          reportedAt: new Date(),
          userId: window.auth?.currentUser?.uid || 'anonymous',
          severity: this.calculateSeverity()
        });
        
        console.log('📤 Incidenti sicurezza segnalati al backend');
      }
      
      // Pulisci array locale
      this.suspiciousActivity = [];
    } catch (error) {
      console.error('Errore report sicurezza:', error);
    }
  }

  calculateSeverity() {
    const criticalTypes = ['auth_bypass_attempt', 'unauthorized_api_access'];
    const highTypes = ['global_var_manipulation', 'invalid_auth_state'];
    
    const hasCritical = this.suspiciousActivity.some(a => criticalTypes.includes(a.type));
    const hasHigh = this.suspiciousActivity.some(a => highTypes.includes(a.type));
    
    if (hasCritical) return 'critical';
    if (hasHigh) return 'high';
    return 'medium';
  }

  isAuthenticatedUser() {
    return window.auth?.currentUser && window.auth.currentUser.uid;
  }

  isLegitimateChange() {
    // Verifica se il cambiamento è legittimo
    // (chiamato da funzioni autorizzate)
    const stack = new Error().stack;
    return stack.includes('onAuthStateChanged') || 
           stack.includes('loginWith') ||
           stack.includes('salvaProviderInfo') ||
           stack.includes('mostraSchermataLogin');
  }

  parseJWT(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Errore parsing JWT:', error);
      return null;
    }
  }

  async forceLogout() {
    try {
      console.log('🚪 Forzatura logout per problemi di sicurezza...');
      
      if (typeof logoutUser === 'function') {
        await logoutUser();
      } else if (window.auth?.currentUser) {
        await window.auth.signOut();
      }
      
      if (typeof showError === 'function') {
        showError('Sessione terminata per motivi di sicurezza. Effettua nuovamente il login.');
      }
      
      // Pulisci cache
      localStorage.removeItem('strutture_cache');
      localStorage.removeItem('strutture_cache_timestamp');
      
    } catch (error) {
      console.error('Errore durante logout forzato:', error);
    }
  }

  getReport() {
    return {
      activities: this.suspiciousActivity,
      timestamp: new Date().toISOString(),
      severity: this.calculateSeverity(),
      totalIncidents: this.suspiciousActivity.length
    };
  }

  clearIncidents() {
    this.suspiciousActivity = [];
    console.log('🧹 Incidenti sicurezza puliti');
  }

  // Metodi per testing
  simulateSuspiciousActivity(type = 'test_activity') {
    this.logSuspiciousActivity(type, {
      simulated: true,
      timestamp: new Date().toISOString()
    });
  }

  getSecurityStats() {
    const stats = {
      totalIncidents: this.suspiciousActivity.length,
      lastCheck: new Date().toISOString(),
      isMonitoring: true,
      checkInterval: this.checkInterval
    };
    
    // Raggruppa per tipo
    const byType = {};
    this.suspiciousActivity.forEach(activity => {
      byType[activity.type] = (byType[activity.type] || 0) + 1;
    });
    stats.incidentsByType = byType;
    
    return stats;
  }
}

// Inizializza monitor solo se Firebase è caricato
function initSecurityMonitor() {
  if (typeof window.auth !== 'undefined' && typeof window.db !== 'undefined' && window.auth && window.db) {
    window.securityMonitor = new SecurityMonitor();
    
    // Funzioni helper globali
    window.testSecurity = function() {
      console.log('🧪 Test sicurezza...');
      console.log('Report:', window.securityMonitor.getReport());
      console.log('Statistiche:', window.securityMonitor.getSecurityStats());
    };
    
    window.simulateSecurityTest = function() {
      console.log('🧪 Simulazione test sicurezza...');
      window.securityMonitor.simulateSuspiciousActivity('test_simulation');
    };
    
    window.clearSecurityIncidents = function() {
      window.securityMonitor.clearIncidents();
      console.log('✅ Incidenti sicurezza puliti');
    };
    
    console.log('✅ Security Monitor inizializzato');
  } else {
    // Retry dopo 2 secondi se Firebase non è ancora caricato
    setTimeout(initSecurityMonitor, 2000);
  }
}

// Avvia inizializzazione dopo che il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
  // Aspetta che Firebase sia caricato
  setTimeout(initSecurityMonitor, 1000);
});

console.log('🛡️ Security Monitor caricato');
