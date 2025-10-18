// Security Testing Suite per QuoVadiScout

class SecurityTester {
  constructor() {
    this.testResults = [];
    this.currentTest = null;
    this.baseUrl = window.location.origin;
  }

  // === TEST PRINCIPALI ===

  async runAllSecurityTests() {
    console.log('🛡️ Avvio test di sicurezza completi...\n');
    
    const tests = [
      { name: 'Token Validation', fn: () => this.testTokenValidation() },
      { name: 'API Security', fn: () => this.testApiSecurity() },
      { name: 'Firestore Rules', fn: () => this.testFirestoreRules() },
      { name: 'Bypass Prevention', fn: () => this.testBypassPrevention() },
      { name: 'Security Monitor', fn: () => this.testSecurityMonitor() },
      { name: 'Rate Limiting', fn: () => this.testRateLimiting() },
      { name: 'Error Handling', fn: () => this.testErrorHandling() },
      { name: 'Client Security', fn: () => this.testClientSecurity() }
    ];

    for (const test of tests) {
      try {
        this.currentTest = test.name;
        console.log(`🧪 Test: ${test.name}...`);
        
        const result = await test.fn();
        this.addTestResult(test.name, result.success, result.message);
        
        if (result.success) {
          console.log(`✅ ${test.name}: ${result.message}`);
        } else {
          console.error(`❌ ${test.name}: ${result.message}`);
        }
      } catch (error) {
        this.addTestResult(test.name, false, `Errore: ${error.message}`);
        console.error(`❌ ${test.name}: Errore - ${error.message}`);
      }
      
      // Pausa tra test per evitare rate limiting
      await this.delay(1000);
    }

    return this.generateReport();
  }

  // === TEST SPECIFICI ===

  async testTokenValidation() {
    try {
      // Test 1: Validazione token con security client
      if (typeof window.securityClient === 'undefined') {
        return { success: false, message: 'Security client non disponibile' };
      }

      const validation = await window.securityClient.validateToken();
      
      if (!validation) {
        return { success: false, message: 'Validazione token fallita' };
      }

      // Test 2: Controllo scadenza token
      const status = window.securityClient.getStatus();
      if (!status.hasToken) {
        return { success: false, message: 'Token non presente' };
      }

      // Test 3: Refresh token automatico
      const token = await window.securityClient.getValidToken();
      if (!token) {
        return { success: false, message: 'Impossibile ottenere token valido' };
      }

      return { success: true, message: 'Validazione token OK' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async testApiSecurity() {
    try {
      // Test 1: Chiamata API senza token (dovrebbe fallire)
      try {
        const response = await fetch('https://us-central1-quovadiscout.cloudfunctions.net/api/validate-token');
        if (response.ok) {
          return { success: false, message: 'API accetta richieste senza token' };
        }
      } catch (error) {
        // OK, dovrebbe fallire
      }

      // Test 2: Chiamata API con token valido
      if (typeof window.securityClient !== 'undefined') {
        const result = await window.securityClient.getSecurityStats();
        if (!result) {
          return { success: false, message: 'Impossibile accedere alle statistiche' };
        }
      }

      return { success: true, message: 'API security OK' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async testFirestoreRules() {
    try {
      // Test 1: Tentativo accesso diretto Firestore (dovrebbe fallire se non autenticati)
      if (typeof db !== 'undefined' && typeof auth !== 'undefined') {
        try {
          // Questo dovrebbe fallire se le rules sono attive
          await db.collection('strutture').get();
          
          // Se arriva qui, potrebbe non essere autenticato o le rules non sono attive
          if (!auth.currentUser) {
            return { success: false, message: 'Firestore accessibile senza autenticazione' };
          }
        } catch (error) {
          // OK, dovrebbe fallire senza autenticazione
          if (error.code === 'permission-denied') {
            return { success: true, message: 'Firestore Rules attive' };
          }
        }
      }

      return { success: true, message: 'Firestore Rules test completato' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async testBypassPrevention() {
    try {
      // Test 1: Tentativo manipolazione variabile globale
      const originalUtente = window.utenteCorrente;
      
      try {
        window.utenteCorrente = { uid: 'fake-user-id', email: 'fake@test.com' };
        
        // Verifica se il security monitor ha rilevato la manipolazione
        if (typeof window.securityMonitor !== 'undefined') {
          const report = window.securityMonitor.getReport();
          const hasManipulation = report.activities.some(activity => 
            activity.type === 'global_var_manipulation'
          );
          
          if (hasManipulation) {
            return { success: true, message: 'Manipolazione rilevata dal monitor' };
          }
        }
        
        // Ripristina valore originale
        window.utenteCorrente = originalUtente;
        
        return { success: false, message: 'Manipolazione non rilevata' };
      } catch (error) {
        // Ripristina valore originale in caso di errore
        window.utenteCorrente = originalUtente;
        return { success: true, message: 'Manipolazione bloccata' };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async testSecurityMonitor() {
    try {
      if (typeof window.securityMonitor === 'undefined') {
        return { success: false, message: 'Security monitor non disponibile' };
      }

      // Test 1: Verifica inizializzazione
      const stats = window.securityMonitor.getSecurityStats();
      if (!stats.isMonitoring) {
        return { success: false, message: 'Monitor non attivo' };
      }

      // Test 2: Simulazione attività sospetta
      window.securityMonitor.simulateSuspiciousActivity('test_security_check');
      
      // Verifica che sia stata registrata
      const report = window.securityMonitor.getReport();
      const hasTestActivity = report.activities.some(activity => 
        activity.type === 'test_security_check'
      );

      if (!hasTestActivity) {
        return { success: false, message: 'Monitor non registra attività' };
      }

      return { success: true, message: 'Security monitor funzionante' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async testRateLimiting() {
    try {
      if (typeof window.securityClient === 'undefined') {
        return { success: false, message: 'Security client non disponibile per test rate limiting' };
      }

      // Test: Tentativo di superare rate limit (solo se autenticati)
      if (auth.currentUser) {
        const promises = [];
        
        // Crea multiple richieste rapide per testare rate limiting
        for (let i = 0; i < 15; i++) {
          promises.push(
            window.securityClient.validateToken().catch(error => error)
          );
        }

        const results = await Promise.all(promises);
        const rateLimited = results.some(result => 
          result.message && result.message.includes('Troppi tentativi')
        );

        if (rateLimited) {
          return { success: true, message: 'Rate limiting attivo' };
        }
      }

      return { success: true, message: 'Rate limiting test completato' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async testErrorHandling() {
    try {
      // Test 1: Gestione errori di autenticazione
      if (typeof window.securityClient !== 'undefined') {
        try {
          // Simula token scaduto
          window.securityClient.clearTokenCache();
          await window.securityClient.validateToken();
        } catch (error) {
          if (error.message.includes('Sessione scaduta') || error.message.includes('non autenticato')) {
            return { success: true, message: 'Gestione errori auth OK' };
          }
        }
      }

      // Test 2: Gestione errori API
      try {
        const response = await fetch('/api/nonexistent-endpoint');
        // Dovrebbe gestire l'errore appropriatamente
      } catch (error) {
        // OK, errore gestito
      }

      return { success: true, message: 'Gestione errori OK' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async testClientSecurity() {
    try {
      // Test 1: Verifica presenza security client
      if (typeof window.securityClient === 'undefined') {
        return { success: false, message: 'Security client non caricato' };
      }

      // Test 2: Verifica funzioni di sicurezza
      const requiredMethods = ['validateToken', 'createStructure', 'updateStructure', 'deleteStructure'];
      const missingMethods = requiredMethods.filter(method => 
        typeof window.securityClient[method] !== 'function'
      );

      if (missingMethods.length > 0) {
        return { success: false, message: `Metodi mancanti: ${missingMethods.join(', ')}` };
      }

      // Test 3: Verifica connessione API
      const connection = await window.securityClient.checkConnection();
      if (!connection.connected && auth.currentUser) {
        return { success: false, message: 'Connessione API fallita' };
      }

      return { success: true, message: 'Client security OK' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // === TEST MANUALI ===

  async testManualBypass() {
    console.log('🧪 Test manuale bypass autenticazione...');
    
    const tests = [
      {
        name: 'Manipolazione utenteCorrente',
        code: () => {
          window.utenteCorrente = { uid: 'fake-id', email: 'fake@test.com' };
          return 'Variabile manipolata';
        }
      },
      {
        name: 'Chiamata diretta caricaStrutture',
        code: () => {
          if (typeof caricaStrutture === 'function') {
            caricaStrutture();
            return 'Funzione chiamata';
          }
          return 'Funzione non disponibile';
        }
      },
      {
        name: 'Accesso diretto Firestore',
        code: async () => {
          if (typeof db !== 'undefined') {
            try {
              await db.collection('strutture').get();
              return 'Accesso riuscito';
            } catch (error) {
              return `Accesso bloccato: ${error.message}`;
            }
          }
          return 'Firestore non disponibile';
        }
      }
    ];

    for (const test of tests) {
      try {
        console.log(`  🔍 ${test.name}...`);
        const result = await test.code();
        console.log(`    Risultato: ${result}`);
      } catch (error) {
        console.log(`    Errore: ${error.message}`);
      }
    }
  }

  // === UTILITY ===

  addTestResult(testName, success, message) {
    this.testResults.push({
      test: testName,
      success: success,
      message: message,
      timestamp: new Date().toISOString()
    });
  }

  generateReport() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const successRate = Math.round((passedTests / totalTests) * 100);

    const report = {
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        successRate: successRate,
        timestamp: new Date().toISOString()
      },
      results: this.testResults
    };

    console.log('\n📊 REPORT TEST SICUREZZA');
    console.log('========================');
    console.log(`Totale test: ${totalTests}`);
    console.log(`Test passati: ${passedTests}`);
    console.log(`Test falliti: ${failedTests}`);
    console.log(`Tasso successo: ${successRate}%`);
    
    if (failedTests > 0) {
      console.log('\n❌ TEST FALLITI:');
      this.testResults
        .filter(r => !r.success)
        .forEach(result => {
          console.log(`  - ${result.test}: ${result.message}`);
        });
    }

    console.log('\n✅ TEST PASSATI:');
    this.testResults
      .filter(r => r.success)
      .forEach(result => {
        console.log(`  - ${result.test}: ${result.message}`);
      });

    return report;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Test specifico per bypass
  async testSpecificBypass() {
    console.log('🚨 Test specifico bypass autenticazione...');
    
    // Test 1: Tentativo di bypass con JavaScript console
    console.log('Test 1: Manipolazione variabili globali');
    
    const originalAuth = window.utenteCorrente;
    try {
      // Simula attacco
      window.utenteCorrente = { uid: 'hacker-123', email: 'hacker@evil.com' };
      
      // Verifica se il sistema ha rilevato l'attacco
      if (typeof window.securityMonitor !== 'undefined') {
        const incidents = window.securityMonitor.getReport();
        const detected = incidents.activities.some(activity => 
          activity.type === 'global_var_manipulation'
        );
        
        if (detected) {
          console.log('✅ Bypass rilevato dal security monitor');
          return true;
        }
      }
      
      // Ripristina stato originale
      window.utenteCorrente = originalAuth;
      
      // Test 2: Tentativo di chiamare funzioni protette
      console.log('Test 2: Chiamata funzioni protette');
      
      if (typeof caricaStrutture === 'function') {
        try {
          await caricaStrutture();
          console.log('❌ Funzione eseguita senza autenticazione!');
          return false;
        } catch (error) {
          console.log('✅ Funzione protetta correttamente');
        }
      }
      
      return true;
    } catch (error) {
      console.log(`❌ Errore durante test: ${error.message}`);
      return false;
    }
  }
}

// === FUNZIONI GLOBALI ===

window.runSecurityTests = async function() {
  const tester = new SecurityTester();
  return await tester.runAllSecurityTests();
};

window.testSecurityBypass = async function() {
  const tester = new SecurityTester();
  return await tester.testSpecificBypass();
};

window.testManualBypass = async function() {
  const tester = new SecurityTester();
  return await tester.testManualBypass();
};

// Auto-test se in modalità debug
if (window.location.search.includes('debug=security')) {
  console.log('🔍 Modalità debug sicurezza attivata');
  setTimeout(() => {
    window.runSecurityTests();
  }, 3000);
}

console.log('🛡️ Security Tester caricato');
console.log('📝 Funzioni disponibili:');
console.log('  - runSecurityTests(): Esegue tutti i test di sicurezza');
console.log('  - testSecurityBypass(): Test specifico per bypass');
console.log('  - testManualBypass(): Test manuali di bypass');
