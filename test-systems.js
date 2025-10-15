// test-systems.js
// Script di test per verificare il funzionamento di tutti i sistemi implementati

class SystemTester {
  constructor() {
    this.results = {};
    this.startTime = Date.now();
  }

  async runAllTests() {
    console.log('🧪 Avvio test sistemi QuoVadiScout v1.3.0...');
    
    const tests = [
      { name: 'Geolocalizzazione', fn: this.testGeolocation.bind(this) },
      { name: 'Analytics Manager', fn: this.testAnalytics.bind(this) },
      { name: 'Smart Notifications', fn: this.testSmartNotifications.bind(this) },
      { name: 'Backup Sync Manager', fn: this.testBackupSync.bind(this) },
      { name: 'Media Manager', fn: this.testMediaManager.bind(this) },
      { name: 'Virtual Scroll', fn: this.testVirtualScroll.bind(this) },
      { name: 'Integrations', fn: this.testIntegrations.bind(this) },
      { name: 'Touch Gestures', fn: this.testTouchGestures.bind(this) },
      { name: 'Offline Sync', fn: this.testOfflineSync.bind(this) },
      { name: 'Config System', fn: this.testConfigSystem.bind(this) }
    ];

    for (const test of tests) {
      try {
        console.log(`🔍 Testando: ${test.name}...`);
        const result = await test.fn();
        this.results[test.name] = { status: 'passed', result, error: null };
        console.log(`✅ ${test.name}: PASSED`);
      } catch (error) {
        this.results[test.name] = { status: 'failed', result: null, error: error.message };
        console.error(`❌ ${test.name}: FAILED - ${error.message}`);
      }
    }

    this.generateReport();
  }

  async testGeolocation() {
    // Test geolocalizzazione
    if (!navigator.geolocation) {
      throw new Error('Geolocalizzazione non supportata');
    }

    // Test funzioni globali - CORRETTO: rimuovi calculateDistance che non è esportata globalmente
    const functions = [
      'getUserLocation',
      'findNearbyStructures', 
      'trovaVicinoAMe'
    ];

    for (const fn of functions) {
      if (typeof window[fn] !== 'function') {
        throw new Error(`Funzione ${fn} non trovata`);
      }
    }

    // Test che le funzioni di calcolo distanza esistano nelle classi
    if (!window.mapsManager?.calculateDistance) {
      throw new Error('Metodo calculateDistance non trovato in MapsManager');
    }

    return { functions: functions.length, status: 'available' };
  }

  async testAnalytics() {
    // Test analytics manager
    if (!window.analyticsManager) {
      throw new Error('AnalyticsManager non inizializzato');
    }

    // Test funzioni principali
    const methods = [
      'trackEvent',
      'trackUserAction', 
      'trackError',
      'generateUserReport'
    ];

    for (const method of methods) {
      if (typeof window.analyticsManager[method] !== 'function') {
        throw new Error(`Metodo ${method} non trovato`);
      }
    }

    // Test tracking
    window.analyticsManager.trackEvent('test_event', { test: true });
    
    return { methods: methods.length, eventsTracked: window.analyticsManager.events.length };
  }

  async testSmartNotifications() {
    // Test smart notification manager
    if (!window.smartNotificationManager) {
      throw new Error('SmartNotificationManager non inizializzato');
    }

    const methods = [
      'getNotificationStats',
      'trackStructureVisit',
      'canSendNotification'
    ];

    for (const method of methods) {
      if (typeof window.smartNotificationManager[method] !== 'function') {
        throw new Error(`Metodo ${method} non trovato`);
      }
    }

    const stats = window.smartNotificationManager.getNotificationStats();
    
    return { methods: methods.length, stats };
  }

  async testBackupSync() {
    // Test backup sync manager
    if (!window.backupSyncManager) {
      throw new Error('BackupSyncManager non inizializzato');
    }

    const methods = [
      'performBackup',
      'performSync',
      'getStorageUsage'
    ];

    for (const method of methods) {
      if (typeof window.backupSyncManager[method] !== 'function') {
        throw new Error(`Metodo ${method} non trovato`);
      }
    }

    const storageUsage = window.backupSyncManager.getStorageUsage();
    
    return { methods: methods.length, storageUsage };
  }

  async testMediaManager() {
    // Test media manager
    if (!window.mediaManager) {
      throw new Error('MediaManager non inizializzato');
    }

    const methods = [
      'uploadImage',
      'compressImage',
      'deleteImage',
      'getGallery'
    ];

    for (const method of methods) {
      if (typeof window.mediaManager[method] !== 'function') {
        throw new Error(`Metodo ${method} non trovato`);
      }
    }

    return { methods: methods.length, compressionQuality: window.mediaManager.compressionQuality };
  }

  async testVirtualScroll() {
    // Test virtual scroll
    if (!window.VirtualScroller) {
      throw new Error('VirtualScroller non disponibile');
    }

    // Test creazione istanza
    const testContainer = document.createElement('div');
    const testItems = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }));
    
    const scroller = new window.VirtualScroller(
      testContainer,
      testItems,
      (item) => {
        const div = document.createElement('div');
        div.textContent = item.name;
        return div;
      }
    );

    if (!scroller || typeof scroller.init !== 'function') {
      throw new Error('VirtualScroller non inizializzato correttamente');
    }

    return { available: true, testItems: testItems.length };
  }

  async testIntegrations() {
    // Test integrations
    if (!window.navigationIntegrations || !window.calendarIntegrations) {
      throw new Error('Integrations non disponibili');
    }

    const navMethods = ['openInMaps'];
    const calendarMethods = ['createICalEvent'];

    for (const method of navMethods) {
      if (typeof window.navigationIntegrations[method] !== 'function') {
        throw new Error(`Navigation method ${method} non trovata`);
      }
    }

    for (const method of calendarMethods) {
      if (typeof window.calendarIntegrations[method] !== 'function') {
        throw new Error(`Calendar method ${method} non trovata`);
      }
    }

    return { navigation: navMethods.length, calendar: calendarMethods.length };
  }

  async testTouchGestures() {
    // Test touch gestures
    if (!window.TouchGestureManager) {
      throw new Error('TouchGestureManager non disponibile');
    }

    // CORRETTO: usa i nomi corretti dei metodi
    const methods = ['enableDoubleTapZoom', 'enableLongPress', 'enableSwipeToDelete'];

    for (const method of methods) {
      if (typeof window.TouchGestureManager[method] !== 'function') {
        throw new Error(`Touch gesture method ${method} non trovata`);
      }
    }

    return { methods: methods.length, touchSupported: 'ontouchstart' in window };
  }

  async testOfflineSync() {
    // Test offline sync
    if (!window.offlineSyncManager) {
      throw new Error('OfflineSyncManager non inizializzato');
    }

    // CORRETTO: rimuovi loadPendingChanges che non esiste, aggiungi openIndexedDB
    const methods = [
      'queueChange',
      'syncWhenOnline',
      'resolveConflict',
      'openIndexedDB'
    ];

    for (const method of methods) {
      if (typeof window.offlineSyncManager[method] !== 'function') {
        throw new Error(`Offline sync method ${method} non trovata`);
      }
    }

    return { methods: methods.length, pendingChanges: window.offlineSyncManager.pendingChanges.length };
  }

  async testConfigSystem() {
    // Test config system
    if (!window.AppConfig) {
      throw new Error('AppConfig non disponibile');
    }

    const configSections = [
      'performance',
      'notifications',
      'geolocation',
      'offline',
      'analytics',
      'backup',
      'ui',
      'pwa',
      'features'
    ];

    for (const section of configSections) {
      if (!window.AppConfig[section]) {
        throw new Error(`Config section ${section} non trovata`);
      }
    }

    // Test utility methods - CORRETTO: usa window.Config.get invece di window.AppConfig.utils.get
    if (typeof window.Config.get !== 'function') {
      throw new Error('Config utility method get non trovata');
    }

    return { sections: configSections.length, version: window.AppConfig.version };
  }

  generateReport() {
    const duration = Date.now() - this.startTime;
    const passed = Object.values(this.results).filter(r => r.status === 'passed').length;
    const failed = Object.values(this.results).filter(r => r.status === 'failed').length;
    
    console.log('\n📊 REPORT TEST SISTEMI');
    console.log('========================');
    console.log(`⏱️  Durata test: ${duration}ms`);
    console.log(`✅ Test passati: ${passed}`);
    console.log(`❌ Test falliti: ${failed}`);
    console.log(`📈 Successo: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    
    console.log('\n📋 DETTAGLI TEST:');
    Object.entries(this.results).forEach(([name, result]) => {
      const icon = result.status === 'passed' ? '✅' : '❌';
      console.log(`${icon} ${name}: ${result.status.toUpperCase()}`);
      if (result.error) {
        console.log(`   Errore: ${result.error}`);
      }
      if (result.result) {
        console.log(`   Risultato:`, result.result);
      }
    });

    // Salva report in localStorage
    const report = {
      timestamp: new Date(),
      duration,
      passed,
      failed,
      results: this.results
    };
    
    localStorage.setItem('system_test_report', JSON.stringify(report));
    
    return report;
  }
}

// Funzione per eseguire test manuali
function runSystemTests() {
  const tester = new SystemTester();
  return tester.runAllTests();
}

// Funzione per mostrare ultimo report
function showLastTestReport() {
  const report = localStorage.getItem('system_test_report');
  if (report) {
    const parsed = JSON.parse(report);
    console.log('📊 Ultimo report test:', parsed);
    return parsed;
  } else {
    console.log('ℹ️ Nessun report test disponibile');
    return null;
  }
}

// Auto-test all'avvio (opzionale)
if (window.location.search.includes('test=true')) {
  console.log('🧪 Modalità test attivata - esecuzione test automatici...');
  setTimeout(runSystemTests, 2000); // Aspetta 2 secondi per l'inizializzazione
}

// Esponi funzioni globalmente
window.runSystemTests = runSystemTests;
window.showLastTestReport = showLastTestReport;

console.log('🧪 System Tester v1.3.0 caricato - usa runSystemTests() per eseguire i test');
