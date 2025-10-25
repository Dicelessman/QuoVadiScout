// test-security.js
// Test per verificare implementazioni di sicurezza QuoVadiScout

class SecurityTester {
  constructor() {
    this.results = [];
    this.passed = 0;
    this.failed = 0;
  }

  log(test, passed, message) {
    const result = {
      test,
      passed,
      message,
      timestamp: new Date().toISOString()
    };
    
    this.results.push(result);
    
    if (passed) {
      this.passed++;
      console.log(`✅ ${test}: ${message}`);
    } else {
      this.failed++;
      console.log(`❌ ${test}: ${message}`);
    }
  }

  // Test 1: Verifica configurazione Firebase
  testFirebaseConfig() {
    try {
      if (typeof FirebaseConfig !== 'undefined') {
        const required = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
        const missing = required.filter(key => !FirebaseConfig[key] || FirebaseConfig[key].includes('YOUR_'));
        
        if (missing.length === 0) {
          this.log('Firebase Config', true, 'Configurazione completa e valida');
        } else {
          this.log('Firebase Config', false, `Campi mancanti: ${missing.join(', ')}`);
        }
      } else {
        this.log('Firebase Config', false, 'Configurazione Firebase non trovata');
      }
    } catch (error) {
      this.log('Firebase Config', false, `Errore: ${error.message}`);
    }
  }

  // Test 2: Verifica autenticazione obbligatoria
  testAuthenticationGate() {
    try {
      // Verifica che il body sia nascosto inizialmente
      const bodyDisplay = window.getComputedStyle(document.body).display;
      
      if (bodyDisplay === 'none') {
        this.log('Authentication Gate', true, 'Body nascosto fino a autenticazione');
      } else {
        this.log('Authentication Gate', false, 'Body visibile senza autenticazione');
      }
    } catch (error) {
      this.log('Authentication Gate', false, `Errore: ${error.message}`);
    }
  }

  // Test 3: Verifica Content Security Policy
  testCSP() {
    try {
      const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      
      if (metaCSP) {
        const cspContent = metaCSP.getAttribute('content');
        
        if (cspContent && cspContent.includes('default-src') && cspContent.includes('script-src')) {
          this.log('Content Security Policy', true, 'CSP configurato correttamente');
        } else {
          this.log('Content Security Policy', false, 'CSP malformato o incompleto');
        }
      } else {
        this.log('Content Security Policy', false, 'CSP non trovato');
      }
    } catch (error) {
      this.log('Content Security Policy', false, `Errore sensori: ${error.message}`);
    }
  }

  // Test 4: Verifica input validation
  testInputValidation() {
    try {
      if (typeof inputValidator !== 'undefined') {
        // Test sanitizzazione HTML
        const testInput = '<script>alert("xss")</script><b>Test</b>';
        const sanitized = inputValidator.sanitizeHtml(testInput);
        
        if (!sanitized.includes('<script>') && sanitized.includes('<b>Test</b>')) {
          this.log('Input Validation', true, 'Sanitizzazione HTML funzionante');
        } else {
          this.log('Input Validation', false, 'Sanitizzazione HTML non funzionante');
        }
      } else {
        this.log('Input Validation', false, 'InputValidator non trovato');
      }
    } catch (error) {
      this.log('Input Validation', false, `Errore: ${error.message}`);
    }
  }

  // Test 5: Verifica Firestore Rules (simulato)
  testFirestoreRules() {
    try {
      // Simula test delle regole Firestore
      if (typeof firebase !== 'undefined' && firebase.auth) {
        this.log('Firestore Rules', true, 'Firebase disponibile per test regole');
      } else {
        this.log('Firestore Rules', false, 'Firebase non disponibile');
      }
    } catch (error) {
      this.log('Firestore Rules', false, `Errore: ${error.message}`);
    }
  }

  // Test 6: Verifica gestione errori
  testErrorHandling() {
    try {
      if (typeof window.analyticsManager !== 'undefined' && window.analyticsManager.trackError) {
        this.log('Error Handling', true, 'Sistema di gestione errori disponibile');
      } else {
        this.log('Error Handling', false, 'Sistema di gestione errori non trovato');
      }
    } catch (error) {
      this.log('Error Handling', false, `Errore: ${error.message}`);
    }
  }

  // Test 7: Verifica service worker
  testServiceWorker() {
    try {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(registration => {
          if (registration) {
            this.log('Service Worker', true, 'Service Worker registrato');
          } else {
            this.log('Service Worker', false, 'Service Worker non registrato');
          }
        });
      } else {
        this.log('Service Worker', false, 'Service Worker non supportato');
      }
    } catch (error) {
      this.log('Service Worker', false, `Errore: ${error.message}`);
    }
  }

  // Test 8: Verifica Security Monitor
  testSecurityMonitor() {
    try {
      if (typeof window.securityMonitor !== 'undefined') {
        this.log('Security Monitor', true, 'Security Monitor disponibile');
      } else {
        this.log('Security Monitor', false, 'Security Monitor non trovato');
      }
    } catch (error) {
      this.log('Security Monitor', false, `Errore: ${error.message}`);
    }
  }

  // Test 9: Verifica Rate Limiter
  testRateLimiter() {
    try {
      if (typeof window.rateLimiter !== 'undefined') {
        this.log('Rate Limiter', true, 'Rate Limiter disponibile');
      } else {
        this.log('Rate Limiter', false, 'Rate Limiter non trovato');
      }
    } catch (error) {
      this.log('Rate Limiter', false, `Errore: ${error.message}`);
    }
  }

  // Test 10: Verifica Data Validator
  testDataValidator() {
    try {
      if (typeof window.dataValidator !== 'undefined') {
        // Test validazione struttura
        const testData = {
          Struttura: 'Test Structure',
          Luogo: 'Test Location',
          Provincia: 'RM',
          Email: 'test@example.com'
        };
        
        const validation = window.dataValidator.validate(testData, 'struttura');
        if (validation.isValid) {
          this.log('Data Validator', true, 'Validazione dati funzionante');
        } else {
          this.log('Data Validator', false, 'Validazione dati non funzionante');
        }
      } else {
        this.log('Data Validator', false, 'Data Validator non trovato');
      }
    } catch (error) {
      this.log('Data Validator', false, `Errore: ${error.message}`);
    }
  }

  // Esegue tutti i test
  async runAllTests() {
    console.log('🔒 Avvio test di sicurezza QuoVadiScout...\n');
    
    this.testFirebaseConfig();
    this.testAuthenticationGate();
    this.testCSP();
    this.testInputValidation();
    this.testFirestoreRules();
    this.testErrorHandling();
    await this.testServiceWorker();
    this.testSecurityMonitor();
    this.testRateLimiter();
    this.testDataValidator();
    
    // Risultati finali
    console.log('\n📊 RISULTATI TEST SICUREZZA:');
    console.log(`✅ Test passati: ${this.passed}`);
    console.log(`❌ Test falliti: ${this.failed}`);
    console.log(`📈 Percentuale successo: ${Math.round((this.passed / (this.passed + this.failed)) * 100)}%`);
    
    if (this.failed === 0) {
      console.log('🎉 Tutti i test di sicurezza sono passati!');
    } else {
      console.log('⚠️ Alcuni test di sicurezza sono falliti. Verifica le implementazioni.');
    }
    
    return this.results;
  }
}

// Funzione globale per eseguire i test
window.runSecurityTests = function() {
  const tester = new SecurityTester();
  return tester.runAllTests();
};

// Auto-esecuzione se richiesto
if (window.location.search.includes('test=security')) {
  setTimeout(() => {
    window.runSecurityTests();
  }, 2000);
}

console.log('🔒 Security Tester caricato. Usa runSecurityTests() per eseguire i test.');
