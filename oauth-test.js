// === TEST AUTENTICAZIONE OAUTH ===
// File di test per le funzionalità OAuth di QuoVadiScout

class OAuthTester {
  constructor() {
    this.testResults = [];
    this.currentTest = null;
  }

  // === METODI DI TEST ===
  
  async testOAuthConfiguration() {
    console.log('🧪 Test configurazione OAuth...');
    
    try {
      // Test configurazione globale
      if (typeof window.OAuthConfig === 'undefined') {
        throw new Error('OAuthConfig non trovato');
      }
      
      // Test validazione configurazione
      const validation = OAuthConfig.utils.validateConfig();
      if (!validation.valid) {
        throw new Error(`Configurazione non valida: ${validation.errors.join(', ')}`);
      }
      
      // Test provider abilitati
      const enabledProviders = OAuthConfig.utils.getEnabledProviders();
      if (enabledProviders.length === 0) {
        throw new Error('Nessun provider OAuth abilitato');
      }
      
      this.addTestResult('Configurazione OAuth', true, 'Configurazione valida');
      console.log('✅ Configurazione OAuth: OK');
      
    } catch (error) {
      this.addTestResult('Configurazione OAuth', false, error.message);
      console.error('❌ Configurazione OAuth:', error.message);
    }
  }

  async testProviderAvailability() {
    console.log('🧪 Test disponibilità provider...');
    
    const providers = ['google', 'github', 'microsoft', 'facebook', 'twitter', 'apple'];
    
    for (const provider of providers) {
      try {
        const providerConfig = OAuthConfig.utils.getProvider(provider);
        if (!providerConfig) {
          throw new Error(`Configurazione provider ${provider} non trovata`);
        }
        
        if (!providerConfig.enabled) {
          console.log(`⚠️ Provider ${provider}: Disabilitato`);
          this.addTestResult(`Provider ${provider}`, true, 'Disabilitato (OK)');
          continue;
        }
        
        // Test se le funzioni di login esistono
        const loginFunction = `loginWith${provider.charAt(0).toUpperCase() + provider.slice(1)}`;
        if (typeof window[loginFunction] !== 'function') {
          throw new Error(`Funzione ${loginFunction} non trovata`);
        }
        
        this.addTestResult(`Provider ${provider}`, true, 'Disponibile');
        console.log(`✅ Provider ${provider}: Disponibile`);
        
      } catch (error) {
        this.addTestResult(`Provider ${provider}`, false, error.message);
        console.error(`❌ Provider ${provider}:`, error.message);
      }
    }
  }

  async testUIAvailability() {
    console.log('🧪 Test elementi UI...');
    
    const elements = [
      'authModal',
      'loginForm',
      'registerForm',
      'googleLoginBtn',
      'githubLoginBtn',
      'microsoftLoginBtn',
      'facebookLoginBtn',
      'twitterLoginBtn',
      'appleLoginBtn',
      'errorMessage',
      'successMessage',
      'authLoading'
    ];
    
    for (const elementId of elements) {
      try {
        const element = document.getElementById(elementId);
        if (!element) {
          throw new Error(`Elemento ${elementId} non trovato`);
        }
        
        this.addTestResult(`UI Element ${elementId}`, true, 'Trovato');
        console.log(`✅ UI Element ${elementId}: Trovato`);
        
      } catch (error) {
        this.addTestResult(`UI Element ${elementId}`, false, error.message);
        console.error(`❌ UI Element ${elementId}:`, error.message);
      }
    }
  }

  async testFirebaseAuth() {
    console.log('🧪 Test Firebase Auth...');
    
    try {
      // Test se Firebase Auth è disponibile
      if (typeof window.auth === 'undefined') {
        throw new Error('Firebase Auth non inizializzato');
      }
      
      // Test se i provider sono configurati
      const auth = window.auth;
      if (!auth) {
        throw new Error('Oggetto auth non disponibile');
      }
      
      // Test stato autenticazione
      const currentUser = auth.currentUser;
      console.log(`👤 Utente corrente: ${currentUser ? currentUser.email : 'Non autenticato'}`);
      
      this.addTestResult('Firebase Auth', true, 'Inizializzato correttamente');
      console.log('✅ Firebase Auth: OK');
      
    } catch (error) {
      this.addTestResult('Firebase Auth', false, error.message);
      console.error('❌ Firebase Auth:', error.message);
    }
  }

  async testModalFunctions() {
    console.log('🧪 Test funzioni modale...');
    
    try {
      // Test funzione mostra modale
      if (typeof window.mostraModaleAuth !== 'function') {
        throw new Error('Funzione mostraModaleAuth non trovata');
      }
      
      // Test funzione nascondi modale
      if (typeof window.nascondiModaleAuth !== 'function') {
        throw new Error('Funzione nascondiModaleAuth non trovata');
      }
      
      // Test apertura modale
      window.mostraModaleAuth();
      const authModal = document.getElementById('authModal');
      if (!authModal || authModal.classList.contains('hidden')) {
        throw new Error('Modale non si apre correttamente');
      }
      
      // Test chiusura modale
      window.nascondiModaleAuth();
      if (!authModal.classList.contains('hidden')) {
        throw new Error('Modale non si chiude correttamente');
      }
      
      this.addTestResult('Funzioni Modale', true, 'Funzionano correttamente');
      console.log('✅ Funzioni Modale: OK');
      
    } catch (error) {
      this.addTestResult('Funzioni Modale', false, error.message);
      console.error('❌ Funzioni Modale:', error.message);
    }
  }

  async testErrorHandling() {
    console.log('🧪 Test gestione errori...');
    
    try {
      // Test funzione showError
      if (typeof window.showError !== 'function') {
        throw new Error('Funzione showError non trovata');
      }
      
      // Test funzione showSuccess
      if (typeof window.showSuccess !== 'function') {
        throw new Error('Funzione showSuccess non trovata');
      }
      
      // Test funzione hideError
      if (typeof window.hideError !== 'function') {
        throw new Error('Funzione hideError non trovata');
      }
      
      // Test visualizzazione messaggi
      window.showError('Test errore');
      window.showSuccess('Test successo');
      
      setTimeout(() => {
        window.hideError();
        console.log('✅ Messaggi di errore/successo: OK');
      }, 1000);
      
      this.addTestResult('Gestione Errori', true, 'Funzioni disponibili');
      
    } catch (error) {
      this.addTestResult('Gestione Errori', false, error.message);
      console.error('❌ Gestione Errori:', error.message);
    }
  }

  // === METODI UTILITÀ ===
  
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
    
    const report = {
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        successRate: Math.round((passedTests / totalTests) * 100)
      },
      results: this.testResults,
      timestamp: new Date().toISOString()
    };
    
    console.log('\n📊 REPORT TEST OAUTH');
    console.log('==================');
    console.log(`Totale test: ${totalTests}`);
    console.log(`Test passati: ${passedTests}`);
    console.log(`Test falliti: ${failedTests}`);
    console.log(`Tasso successo: ${report.summary.successRate}%`);
    console.log('\n📋 DETTAGLI:');
    
    this.testResults.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.test}: ${result.message}`);
    });
    
    return report;
  }

  async runAllTests() {
    console.log('🚀 Avvio test OAuth completi...\n');
    
    await this.testOAuthConfiguration();
    await this.testProviderAvailability();
    await this.testUIAvailability();
    await this.testFirebaseAuth();
    await this.testModalFunctions();
    await this.testErrorHandling();
    
    return this.generateReport();
  }
}

// === FUNZIONI GLOBALI DI TEST ===

window.testOAuth = async function() {
  const tester = new OAuthTester();
  return await tester.runAllTests();
};

window.testOAuthProvider = async function(provider) {
  console.log(`🧪 Test provider ${provider}...`);
  
  try {
    const loginFunction = `loginWith${provider.charAt(0).toUpperCase() + provider.slice(1)}`;
    
    if (typeof window[loginFunction] !== 'function') {
      throw new Error(`Funzione ${loginFunction} non trovata`);
    }
    
    // Test simulato (non effettua login reale)
    console.log(`✅ Provider ${provider}: Funzione disponibile`);
    return { success: true, message: 'Provider disponibile' };
    
  } catch (error) {
    console.error(`❌ Provider ${provider}:`, error.message);
    return { success: false, message: error.message };
  }
};

window.testOAuthModal = function() {
  console.log('🧪 Test modale OAuth...');
  
  try {
    // Test apertura
    window.mostraModaleAuth();
    const modal = document.getElementById('authModal');
    
    if (!modal || modal.classList.contains('hidden')) {
      throw new Error('Modale non si apre');
    }
    
    // Test chiusura
    setTimeout(() => {
      window.nascondiModaleAuth();
      if (!modal.classList.contains('hidden')) {
        throw new Error('Modale non si chiude');
      }
      console.log('✅ Modale OAuth: OK');
    }, 1000);
    
  } catch (error) {
    console.error('❌ Modale OAuth:', error.message);
  }
};

// === INIZIALIZZAZIONE ===
console.log('🧪 OAuthTester caricato');
console.log('📝 Funzioni disponibili:');
console.log('  - testOAuth(): Esegue tutti i test');
console.log('  - testOAuthProvider(provider): Test provider specifico');
console.log('  - testOAuthModal(): Test modale');

// Auto-test se in modalità debug
if (window.location.search.includes('debug=oauth')) {
  console.log('🔍 Modalità debug OAuth attivata');
  setTimeout(() => {
    window.testOAuth();
  }, 2000);
}
