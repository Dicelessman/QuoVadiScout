// security-monitor.js
// Sistema di monitoraggio sicurezza per QuoVadiScout

class SecurityMonitor {
  constructor() {
    this.securityEvents = [];
    this.suspiciousActivities = [];
    this.maxEvents = 1000; // Limite eventi in memoria
    this.init();
  }

  init() {
    console.log('🔒 Security Monitor inizializzato');
    this.setupEventListeners();
    this.startPeriodicChecks();
  }

  // Registra eventi di sicurezza
  logSecurityEvent(type, details, severity = 'info') {
    const event = {
      type,
      details,
      severity,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId()
    };

    this.securityEvents.push(event);

    // Mantieni solo gli ultimi eventi
    if (this.securityEvents.length > this.maxEvents) {
      this.securityEvents = this.securityEvents.slice(-this.maxEvents);
    }

    // Salva in localStorage per persistenza
    this.saveToStorage();

    // Log in console per debug
    const emoji = severity === 'critical' ? '🚨' : severity === 'warning' ? '⚠️' : '🔒';
    console.log(`${emoji} Security Event: ${type}`, details);

    // Invia a Firebase se disponibile
    this.sendToFirebase(event);
  }

  // Rileva attività sospette
  detectSuspiciousActivity() {
    // Controlla tentativi di accesso multipli
    const failedLogins = this.securityEvents.filter(e => 
      e.type === 'login_failed' && 
      (Date.now() - e.timestamp) < 300000 // Ultimi 5 minuti
    );

    if (failedLogins.length > 5) {
      this.logSecurityEvent('suspicious_login_attempts', {
        count: failedLogins.length,
        timeWindow: '5 minutes'
      }, 'warning');
    }

    // Controlla modifiche rapide ai dati
    const recentModifications = this.securityEvents.filter(e => 
      e.type === 'data_modified' && 
      (Date.now() - e.timestamp) < 60000 // Ultimo minuto
    );

    if (recentModifications.length > 10) {
      this.logSecurityEvent('rapid_data_modifications', {
        count: recentModifications.length,
        timeWindow: '1 minute'
      }, 'warning');
    }

    // Controlla accessi da domini non autorizzati
    const unauthorizedDomains = this.securityEvents.filter(e => 
      e.type === 'unauthorized_access'
    );

    if (unauthorizedDomains.length > 0) {
      this.logSecurityEvent('unauthorized_domain_access', {
        count: unauthorizedDomains.length
      }, 'critical');
    }
  }

  // Setup event listeners per rilevare attività
  setupEventListeners() {
    // Monitora tentativi di accesso
    window.addEventListener('beforeunload', () => {
      this.logSecurityEvent('page_unload', {
        timeSpent: Date.now() - this.startTime
      });
    });

    // Monitora errori JavaScript
    window.addEventListener('error', (event) => {
      this.logSecurityEvent('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }, 'warning');
    });

    // Monitora tentativi di accesso a localStorage
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      if (key.includes('firebase') || key.includes('auth')) {
        window.securityMonitor?.logSecurityEvent('localStorage_access', {
          key: key,
          operation: 'set'
        });
      }
      return originalSetItem.apply(this, arguments);
    };

    // Monitora tentativi di accesso a sessionStorage
    const originalSessionSetItem = sessionStorage.setItem;
    sessionStorage.setItem = function(key, value) {
      if (key.includes('firebase') || key.includes('auth')) {
        window.securityMonitor?.logSecurityEvent('sessionStorage_access', {
          key: key,
          operation: 'set'
        });
      }
      return originalSessionSetItem.apply(this, arguments);
    };
  }

  // Controlli periodici di sicurezza
  startPeriodicChecks() {
    setInterval(() => {
      this.detectSuspiciousActivity();
      this.checkSessionIntegrity();
      this.validateConfiguration();
    }, 60000); // Ogni minuto
  }

  // Verifica integrità sessione
  checkSessionIntegrity() {
    // Controlla se il token Firebase è ancora valido
    if (typeof firebase !== 'undefined' && firebase.auth) {
      const user = firebase.auth().currentUser;
      if (user) {
        user.getIdToken(true).then(token => {
          this.logSecurityEvent('token_refresh', {
            userId: user.uid,
            timestamp: Date.now()
          });
        }).catch(error => {
          this.logSecurityEvent('token_refresh_failed', {
            error: error.message,
            userId: user.uid
          }, 'warning');
        });
      }
    }
  }

  // Valida configurazione di sicurezza
  validateConfiguration() {
    // Controlla se CSP è attivo
    const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!csp) {
      this.logSecurityEvent('csp_missing', {
        message: 'Content Security Policy non trovato'
      }, 'warning');
    }

    // Controlla se le credenziali Firebase sono esposte
    if (typeof FirebaseConfig !== 'undefined') {
      const hasPlaceholders = Object.values(FirebaseConfig).some(value => 
        typeof value === 'string' && value.includes('YOUR_')
      );
      
      if (hasPlaceholders) {
        this.logSecurityEvent('firebase_config_incomplete', {
          message: 'Configurazione Firebase contiene placeholder'
        }, 'warning');
      }
    }

    // Controlla se il Service Worker è attivo
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (!registration) {
          this.logSecurityEvent('service_worker_inactive', {
            message: 'Service Worker non registrato'
          }, 'warning');
        }
      });
    }
  }

  // Salva eventi in localStorage
  saveToStorage() {
    try {
      const eventsToSave = this.securityEvents.slice(-100); // Solo ultimi 100 eventi
      localStorage.setItem('security_events', JSON.stringify(eventsToSave));
    } catch (error) {
      console.error('Errore salvataggio eventi sicurezza:', error);
    }
  }

  // Carica eventi da localStorage
  loadFromStorage() {
    try {
      const saved = localStorage.getItem('security_events');
      if (saved) {
        this.securityEvents = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Errore caricamento eventi sicurezza:', error);
    }
  }

  // Invia eventi a Firebase
  async sendToFirebase(event) {
    if (typeof firebase === 'undefined' || !firebase.firestore) return;

    try {
      const db = firebase.firestore();
      await db.collection('security_events').add({
        ...event,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Errore invio evento sicurezza a Firebase:', error);
    }
  }

  // Ottieni ID utente corrente
  getCurrentUserId() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      const user = firebase.auth().currentUser;
      return user ? user.uid : null;
    }
    return null;
  }

  // Genera report sicurezza
  generateSecurityReport() {
    const report = {
      timestamp: Date.now(),
      totalEvents: this.securityEvents.length,
      eventsByType: {},
      eventsBySeverity: {},
      suspiciousActivities: this.suspiciousActivities.length,
      recommendations: []
    };

    // Analizza eventi per tipo
    this.securityEvents.forEach(event => {
      report.eventsByType[event.type] = (report.eventsByType[event.type] || 0) + 1;
      report.eventsBySeverity[event.severity] = (report.eventsBySeverity[event.severity] || 0) + 1;
    });

    // Genera raccomandazioni
    if (report.eventsByType.login_failed > 10) {
      report.recommendations.push('Implementare rate limiting per tentativi di login');
    }

    if (report.eventsBySeverity.critical > 0) {
      report.recommendations.push('Rivedere configurazione di sicurezza');
    }

    if (report.eventsByType.unauthorized_access > 0) {
      report.recommendations.push('Verificare domini autorizzati');
    }

    return report;
  }

  // Ottieni eventi di sicurezza
  getSecurityEvents(limit = 50) {
    return this.securityEvents.slice(-limit);
  }

  // Pulisci eventi vecchi
  cleanupOldEvents() {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    this.securityEvents = this.securityEvents.filter(event => event.timestamp > oneWeekAgo);
    this.saveToStorage();
  }
}

// Inizializza Security Monitor
window.securityMonitor = new SecurityMonitor();

// Carica eventi salvati
window.securityMonitor.loadFromStorage();

// Pulisci eventi vecchi ogni ora
setInterval(() => {
  window.securityMonitor.cleanupOldEvents();
}, 60 * 60 * 1000);

console.log('🔒 Security Monitor caricato e attivo');
