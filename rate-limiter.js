// rate-limiter.js
// Sistema di rate limiting avanzato per QuoVadiScout

class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.limits = {
      // Limiti per operazioni di autenticazione
      login: { requests: 5, window: 300000 }, // 5 tentativi ogni 5 minuti
      register: { requests: 3, window: 900000 }, // 3 registrazioni ogni 15 minuti
      
      // Limiti per operazioni sui dati
      read: { requests: 100, window: 60000 }, // 100 letture al minuto
      write: { requests: 20, window: 60000 }, // 20 scritture al minuto
      delete: { requests: 5, window: 60000 }, // 5 eliminazioni al minuto
      
      // Limiti per operazioni API
      api: { requests: 60, window: 60000 }, // 60 richieste API al minuto
      
      // Limiti per operazioni di ricerca
      search: { requests: 50, window: 60000 }, // 50 ricerche al minuto
      
      // Limiti per operazioni di export
      export: { requests: 5, window: 300000 } // 5 export ogni 5 minuti
    };
    
    this.blockedIPs = new Set();
    this.suspiciousActivities = new Map();
    
    this.init();
  }

  init() {
    console.log('🛡️ Rate Limiter inizializzato');
    this.startCleanup();
    this.setupEventListeners();
  }

  // Verifica se una richiesta è permessa
  isAllowed(operation, identifier = 'default') {
    const now = Date.now();
    const key = `${operation}:${identifier}`;
    
    // Controlla se l'IP è bloccato
    if (this.blockedIPs.has(identifier)) {
      this.logSecurityEvent('rate_limit_blocked_ip', {
        operation,
        identifier,
        reason: 'IP blocked'
      }, 'warning');
      return false;
    }

    // Ottieni limite per l'operazione
    const limit = this.limits[operation];
    if (!limit) {
      console.warn(`⚠️ Limite non definito per operazione: ${operation}`);
      return true;
    }

    // Ottieni richieste esistenti
    let requests = this.requests.get(key) || [];
    
    // Rimuovi richieste vecchie
    requests = requests.filter(timestamp => now - timestamp < limit.window);
    
    // Controlla se il limite è stato superato
    if (requests.length >= limit.requests) {
      this.logSecurityEvent('rate_limit_exceeded', {
        operation,
        identifier,
        requests: requests.length,
        limit: limit.requests,
        window: limit.window
      }, 'warning');
      
      // Segna come attività sospetta
      this.markSuspiciousActivity(identifier, operation);
      
      return false;
    }

    // Aggiungi richiesta corrente
    requests.push(now);
    this.requests.set(key, requests);
    
    return true;
  }

  // Registra una richiesta
  recordRequest(operation, identifier = 'default') {
    const now = Date.now();
    const key = `${operation}:${identifier}`;
    
    let requests = this.requests.get(key) || [];
    requests.push(now);
    this.requests.set(key, requests);
    
    // Log per debug
    console.log(`📊 Rate Limit: ${operation} per ${identifier}`, {
      requests: requests.length,
      limit: this.limits[operation]?.requests || 'N/A'
    });
  }

  // Marca attività sospetta
  markSuspiciousActivity(identifier, operation) {
    const now = Date.now();
    const key = `${identifier}:${operation}`;
    
    let activities = this.suspiciousActivities.get(key) || [];
    activities.push(now);
    
    // Mantieni solo attività degli ultimi 10 minuti
    activities = activities.filter(timestamp => now - timestamp < 600000);
    this.suspiciousActivities.set(key, activities);
    
    // Se troppe attività sospette, blocca temporaneamente
    if (activities.length > 10) {
      this.blockIP(identifier, 900000); // Blocca per 15 minuti
    }
  }

  // Blocca un IP
  blockIP(identifier, duration = 900000) {
    this.blockedIPs.add(identifier);
    
    this.logSecurityEvent('ip_blocked', {
      identifier,
      duration,
      reason: 'Suspicious activity detected'
    }, 'critical');
    
    // Rimuovi blocco dopo la durata specificata
    setTimeout(() => {
      this.blockedIPs.delete(identifier);
      console.log(`🔓 IP ${identifier} sbloccato`);
    }, duration);
  }

  // Sblocca un IP manualmente
  unblockIP(identifier) {
    this.blockedIPs.delete(identifier);
    console.log(`🔓 IP ${identifier} sbloccato manualmente`);
  }

  // Ottieni statistiche rate limiting
  getStats() {
    const stats = {
      totalRequests: 0,
      blockedIPs: this.blockedIPs.size,
      suspiciousActivities: 0,
      operations: {}
    };

    // Conta richieste per operazione
    for (const [key, requests] of this.requests.entries()) {
      const [operation] = key.split(':');
      stats.operations[operation] = (stats.operations[operation] || 0) + requests.length;
      stats.totalRequests += requests.length;
    }

    // Conta attività sospette
    for (const activities of this.suspiciousActivities.values()) {
      stats.suspiciousActivities += activities.length;
    }

    return stats;
  }

  // Pulisci richieste vecchie
  cleanup() {
    const now = Date.now();
    
    // Pulisci richieste vecchie
    for (const [key, requests] of this.requests.entries()) {
      const [operation] = key.split(':');
      const limit = this.limits[operation];
      
      if (limit) {
        const filtered = requests.filter(timestamp => now - timestamp < limit.window);
        if (filtered.length === 0) {
          this.requests.delete(key);
        } else {
          this.requests.set(key, filtered);
        }
      }
    }
    
    // Pulisci attività sospette vecchie
    for (const [key, activities] of this.suspiciousActivities.entries()) {
      const filtered = activities.filter(timestamp => now - timestamp < 600000); // 10 minuti
      if (filtered.length === 0) {
        this.suspiciousActivities.delete(key);
      } else {
        this.suspiciousActivities.set(key, filtered);
      }
    }
  }

  // Avvia pulizia automatica
  startCleanup() {
    setInterval(() => {
      this.cleanup();
    }, 60000); // Ogni minuto
  }

  // Setup event listeners
  setupEventListeners() {
    // Monitora tentativi di login
    document.addEventListener('login_attempt', (event) => {
      const { email, success } = event.detail;
      const identifier = email || 'anonymous';
      
      if (success) {
        this.recordRequest('login', identifier);
      } else {
        if (!this.isAllowed('login', identifier)) {
          event.preventDefault();
          event.detail.blocked = true;
          event.detail.message = 'Troppi tentativi di login. Riprova tra 5 minuti.';
        }
      }
    });

    // Monitora operazioni sui dati
    document.addEventListener('data_operation', (event) => {
      const { operation, userId } = event.detail;
      const identifier = userId || 'anonymous';
      
      if (!this.isAllowed(operation, identifier)) {
        event.preventDefault();
        event.detail.blocked = true;
        event.detail.message = `Limite di ${operation} superato. Riprova tra un minuto.`;
      } else {
        this.recordRequest(operation, identifier);
      }
    });
  }

  // Log eventi di sicurezza
  logSecurityEvent(type, details, severity = 'info') {
    if (window.securityMonitor) {
      window.securityMonitor.logSecurityEvent(type, details, severity);
    } else {
      console.log(`🔒 Security Event: ${type}`, details);
    }
  }

  // Configura limiti personalizzati
  setLimits(operation, requests, window) {
    this.limits[operation] = { requests, window };
    console.log(`⚙️ Limite aggiornato per ${operation}: ${requests} richieste ogni ${window}ms`);
  }

  // Ottieni limiti attuali
  getLimits() {
    return { ...this.limits };
  }

  // Reset contatori per un identificatore
  resetCounters(identifier) {
    for (const key of this.requests.keys()) {
      if (key.endsWith(`:${identifier}`)) {
        this.requests.delete(key);
      }
    }
    
    for (const key of this.suspiciousActivities.keys()) {
      if (key.startsWith(`${identifier}:`)) {
        this.suspiciousActivities.delete(key);
      }
    }
    
    console.log(`🔄 Contatori resettati per ${identifier}`);
  }
}

// Inizializza Rate Limiter
window.rateLimiter = new RateLimiter();

console.log('🛡️ Rate Limiter caricato e attivo');
