// analytics.js
// Sistema di analytics avanzato per tracciare utilizzo e performance dell'app

class AnalyticsManager {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.events = [];
    this.userActions = [];
    this.performanceMetrics = {};
    this.errorLog = [];
    
    this.initializeAnalytics();
    this.trackPerformance();
    this.setupEventListeners();
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  initializeAnalytics() {
    // Traccia apertura app
    this.trackEvent('app_start', {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      connectionType: navigator.connection?.effectiveType || 'unknown',
      memory: navigator.deviceMemory || 'unknown'
    });

    console.log('📊 Analytics inizializzato - Session ID:', this.sessionId);
  }

  trackEvent(eventName, data = {}) {
    const event = {
      name: eventName,
      data: data,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.events.push(event);
    
    // Mantieni solo gli ultimi 1000 eventi in memoria
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }

    // Salva in localStorage per persistenza
    this.saveEventsToStorage();

    console.log('📊 Event tracked:', eventName, data);
  }

  trackUserAction(action, target, metadata = {}) {
    const actionData = {
      action: action,
      target: target,
      metadata: metadata,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.userActions.push(actionData);

    // Traccia anche come evento
    this.trackEvent('user_action', actionData);

    console.log('👤 User action:', action, target);
  }

  trackPerformance() {
    // Traccia Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.performanceMetrics.lcp = lastEntry.startTime;
        this.trackEvent('performance_lcp', { value: lastEntry.startTime });
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          this.performanceMetrics.fid = entry.processingStart - entry.startTime;
          this.trackEvent('performance_fid', { value: entry.processingStart - entry.startTime });
        });
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      let clsValue = 0;
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.performanceMetrics.cls = clsValue;
        this.trackEvent('performance_cls', { value: clsValue });
      }).observe({ entryTypes: ['layout-shift'] });
    }

    // Traccia tempi di caricamento
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      this.performanceMetrics.loadTime = loadTime;
      this.trackEvent('performance_load', { value: loadTime });
    });

    // Traccia utilizzo memoria (se disponibile)
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        this.trackEvent('performance_memory', {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        });
      }, 30000); // Ogni 30 secondi
    }
  }

  setupEventListeners() {
    // Traccia errori JavaScript
    window.addEventListener('error', (event) => {
      this.trackError('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Traccia errori di promise
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError('promise_rejection', {
        reason: event.reason?.toString(),
        stack: event.reason?.stack
      });
    });

    // Traccia navigazione
    window.addEventListener('beforeunload', () => {
      const sessionDuration = Date.now() - this.startTime;
      this.trackEvent('session_end', {
        duration: sessionDuration,
        eventsCount: this.events.length,
        userActionsCount: this.userActions.length
      });
    });

    // Traccia visibilità pagina
    document.addEventListener('visibilitychange', () => {
      this.trackEvent('visibility_change', {
        hidden: document.hidden,
        visibilityState: document.visibilityState
      });
    });

    // Traccia connessione
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', () => {
        this.trackEvent('connection_change', {
          effectiveType: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink,
          rtt: navigator.connection.rtt
        });
      });
    }
  }

  trackError(type, errorData) {
    const error = {
      type: type,
      data: errorData,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.errorLog.push(error);
    this.trackEvent('error', error);

    console.error('🚨 Error tracked:', type, errorData);
  }

  // Analytics specifici per QuoVadiScout
  trackStructureSearch(query, filters, resultsCount) {
    this.trackEvent('structure_search', {
      query: query,
      filters: filters,
      resultsCount: resultsCount,
      timestamp: Date.now()
    });
  }

  trackStructureView(structureId, structureName, viewType = 'card') {
    this.trackEvent('structure_view', {
      structureId: structureId,
      structureName: structureName,
      viewType: viewType,
      timestamp: Date.now()
    });
  }

  trackStructureEdit(structureId, changes) {
    this.trackEvent('structure_edit', {
      structureId: structureId,
      changes: changes,
      timestamp: Date.now()
    });
  }

  trackGeolocationUsage(action, success, error = null) {
    this.trackEvent('geolocation_usage', {
      action: action,
      success: success,
      error: error,
      timestamp: Date.now()
    });
  }

  trackOfflineUsage(action, dataSize = 0) {
    this.trackEvent('offline_usage', {
      action: action,
      dataSize: dataSize,
      timestamp: Date.now()
    });
  }

  trackNotificationInteraction(type, action, structureId = null) {
    this.trackEvent('notification_interaction', {
      type: type,
      action: action,
      structureId: structureId,
      timestamp: Date.now()
    });
  }

  // === Nuovi metodi analytics avanzati ===
  
  trackFilterApplied(filterType, filterValue, resultsCount) {
    this.trackEvent('filter_applied', {
      filterType: filterType,
      filterValue: filterValue,
      resultsCount: resultsCount,
      timestamp: Date.now()
    });
  }

  trackPagination(page, totalPages, itemsPerPage) {
    this.trackEvent('pagination_change', {
      page: page,
      totalPages: totalPages,
      itemsPerPage: itemsPerPage,
      timestamp: Date.now()
    });
  }

  trackViewModeToggle(mode) {
    this.trackEvent('view_mode_change', {
      mode: mode,
      timestamp: Date.now()
    });
  }

  trackExport(format, itemCount) {
    this.trackEvent('data_export', {
      format: format,
      itemCount: itemCount,
      timestamp: Date.now()
    });
  }

  trackAuthentication(action, method) {
    this.trackEvent('authentication', {
      action: action, // login, logout, register
      method: method, // email, google
      timestamp: Date.now()
    });
  }

  trackErrorDetail(errorType, errorMessage, context) {
    this.trackEvent('error_occurred', {
      errorType: errorType,
      errorMessage: errorMessage,
      context: context,
      timestamp: Date.now()
    });
  }

  trackCustomMetric(metric, value, context = {}) {
    this.trackEvent('custom_metric', {
      metric: metric,
      value: value,
      context: context,
      timestamp: Date.now()
    });
  }

  // Salvataggio e sincronizzazione dati
  saveEventsToStorage() {
    try {
      const data = {
        events: this.events.slice(-100), // Solo ultimi 100 eventi
        userActions: this.userActions.slice(-50), // Solo ultime 50 azioni
        performanceMetrics: this.performanceMetrics,
        errorLog: this.errorLog.slice(-20), // Solo ultimi 20 errori
        sessionId: this.sessionId
      };

      localStorage.setItem('analytics_data', JSON.stringify(data));
    } catch (error) {
      console.warn('⚠️ Errore salvataggio analytics:', error);
    }
  }

  loadEventsFromStorage() {
    try {
      const data = localStorage.getItem('analytics_data');
      if (data) {
        const parsed = JSON.parse(data);
        this.events = parsed.events || [];
        this.userActions = parsed.userActions || [];
        this.performanceMetrics = parsed.performanceMetrics || {};
        this.errorLog = parsed.errorLog || [];
        
        console.log('📊 Analytics caricati da storage');
      }
    } catch (error) {
      console.warn('⚠️ Errore caricamento analytics:', error);
    }
  }

  // Invio dati a server (per implementazioni future)
  async sendAnalyticsToServer() {
    if (!window.db || !window.addDoc || !window.collection) {
      console.log('📊 Firebase non disponibile per invio analytics');
      return;
    }

    try {
      const analyticsData = {
        sessionId: this.sessionId,
        events: this.events,
        userActions: this.userActions,
        performanceMetrics: this.performanceMetrics,
        errorLog: this.errorLog,
        userAgent: navigator.userAgent,
        timestamp: new Date(),
        userId: window.utenteCorrente?.uid || 'anonymous'
      };

      await window.addDoc(window.collection(window.db, 'analytics'), analyticsData);
      
      // Pulisci dati inviati
      this.events = [];
      this.userActions = [];
      this.errorLog = [];
      
      console.log('📊 Analytics inviati al server');
    } catch (error) {
      console.error('❌ Errore invio analytics:', error);
    }
  }

  // Report analytics per l'utente
  generateUserReport() {
    const now = Date.now();
    const sessionDuration = now - this.startTime;
    
    // Calcola statistiche
    const eventCounts = {};
    this.events.forEach(event => {
      eventCounts[event.name] = (eventCounts[event.name] || 0) + 1;
    });

    const actionCounts = {};
    this.userActions.forEach(action => {
      actionCounts[action.action] = (actionCounts[action.action] || 0) + 1;
    });

    return {
      sessionId: this.sessionId,
      sessionDuration: Math.round(sessionDuration / 1000), // secondi
      totalEvents: this.events.length,
      totalActions: this.userActions.length,
      totalErrors: this.errorLog.length,
      eventBreakdown: eventCounts,
      actionBreakdown: actionCounts,
      performanceMetrics: this.performanceMetrics,
      mostUsedFeatures: this.getMostUsedFeatures()
    };
  }

  getMostUsedFeatures() {
    const features = {
      search: this.events.filter(e => e.name === 'structure_search').length,
      view: this.events.filter(e => e.name === 'structure_view').length,
      edit: this.events.filter(e => e.name === 'structure_edit').length,
      geolocation: this.events.filter(e => e.name === 'geolocation_usage').length,
      offline: this.events.filter(e => e.name === 'offline_usage').length,
      notifications: this.events.filter(e => e.name === 'notification_interaction').length
    };

    return Object.entries(features)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([feature, count]) => ({ feature, count }));
  }

  // Funzioni di utilità per integrazione con altri moduli
  static trackStructureAccess(structureId) {
    if (window.analyticsManager) {
      window.analyticsManager.trackStructureView(structureId, 'access');
    }
  }

  static trackSearch(query, results) {
    if (window.analyticsManager) {
      window.analyticsManager.trackStructureSearch(query, {}, results.length);
    }
  }

  static trackError(errorType, errorData) {
    if (window.analyticsManager) {
      window.analyticsManager.trackError(errorType, errorData);
    }
  }
}

// Inizializza analytics manager
window.analyticsManager = new AnalyticsManager();

// Carica dati esistenti
window.analyticsManager.loadEventsFromStorage();

// Invia dati al server ogni 5 minuti (se online)
setInterval(() => {
  if (navigator.onLine && window.analyticsManager.events.length > 0) {
    window.analyticsManager.sendAnalyticsToServer();
  }
}, 5 * 60 * 1000);

// Invia dati prima della chiusura
window.addEventListener('beforeunload', () => {
  if (window.analyticsManager.events.length > 0) {
    // Usa sendBeacon per invio sincrono
    const data = JSON.stringify({
      sessionId: window.analyticsManager.sessionId,
      events: window.analyticsManager.events,
      timestamp: Date.now()
    });
    
    if ('sendBeacon' in navigator) {
      navigator.sendBeacon('/analytics', data);
    }
  }
});

console.log('📊 Analytics Manager inizializzato');
