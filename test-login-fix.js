// Test per verificare che il login funzioni correttamente

console.log('🧪 Test Login Fix - QuoVadiScout');

// Test 1: Verifica che OAuthConfig sia caricato correttamente
function testOAuthConfig() {
  console.log('🔍 Test 1: Verifica OAuthConfig...');
  
  if (typeof window.OAuthConfig === 'undefined') {
    console.error('❌ OAuthConfig non trovato');
    return false;
  }
  
  try {
    const enabledProviders = window.OAuthConfig.utils.getEnabledProviders();
    console.log('✅ OAuthConfig caricato correttamente');
    console.log(`📋 Provider abilitati: ${enabledProviders.length}`);
    return true;
  } catch (error) {
    console.error('❌ Errore OAuthConfig:', error.message);
    return false;
  }
}

// Test 2: Verifica che Firebase sia esposto globalmente
function testFirebaseGlobal() {
  console.log('🔍 Test 2: Verifica Firebase globale...');
  
  if (typeof window.auth === 'undefined') {
    console.error('❌ window.auth non trovato');
    return false;
  }
  
  if (typeof window.db === 'undefined') {
    console.error('❌ window.db non trovato');
    return false;
  }
  
  if (typeof window.firebaseConfig === 'undefined') {
    console.error('❌ window.firebaseConfig non trovato');
    return false;
  }
  
  console.log('✅ Firebase esposto globalmente');
  return true;
}

// Test 3: Verifica che i moduli di sicurezza siano caricati
function testSecurityModules() {
  console.log('🔍 Test 3: Verifica moduli di sicurezza...');
  
  if (typeof window.securityClient === 'undefined') {
    console.error('❌ securityClient non trovato');
    return false;
  }
  
  if (typeof window.securityMonitor === 'undefined') {
    console.error('❌ securityMonitor non trovato');
    return false;
  }
  
  console.log('✅ Moduli di sicurezza caricati');
  return true;
}

// Test 4: Verifica che le funzioni di login siano disponibili
function testLoginFunctions() {
  console.log('🔍 Test 4: Verifica funzioni di login...');
  
  const requiredFunctions = [
    'mostraModaleAuth',
    'nascondiModaleAuth',
    'loginWithGoogle',
    'loginWithGithub',
    'loginWithFacebook',
    'loginWithTwitter',
    'loginWithMicrosoft',
    'loginWithApple'
  ];
  
  const missingFunctions = requiredFunctions.filter(func => typeof window[func] !== 'function');
  
  if (missingFunctions.length > 0) {
    console.error('❌ Funzioni mancanti:', missingFunctions);
    return false;
  }
  
  console.log('✅ Funzioni di login disponibili');
  return true;
}

// Test 5: Verifica che gli elementi DOM siano presenti
function testDOMElements() {
  console.log('🔍 Test 5: Verifica elementi DOM...');
  
  const requiredElements = [
    'authModal',
    'loginBtn',
    'emailLoginBtn',
    'googleLoginBtn',
    'githubLoginBtn',
    'microsoftLoginBtn',
    'facebookLoginBtn',
    'twitterLoginBtn',
    'appleLoginBtn'
  ];
  
  const missingElements = requiredElements.filter(id => !document.getElementById(id));
  
  if (missingElements.length > 0) {
    console.error('❌ Elementi DOM mancanti:', missingElements);
    return false;
  }
  
  console.log('✅ Elementi DOM presenti');
  return true;
}

// Test 6: Verifica che gli event listeners siano configurati
function testEventListeners() {
  console.log('🔍 Test 6: Verifica event listeners...');
  
  const loginBtn = document.getElementById('loginBtn');
  if (!loginBtn) {
    console.error('❌ loginBtn non trovato');
    return false;
  }
  
  // Verifica che l'event listener sia configurato
  if (!loginBtn.onclick) {
    console.error('❌ Event listener loginBtn non configurato');
    return false;
  }
  
  console.log('✅ Event listeners configurati');
  return true;
}

// Test 7: Simula click sul pulsante login
function testLoginButton() {
  console.log('🔍 Test 7: Simula click login...');
  
  try {
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
      loginBtn.click();
      console.log('✅ Click simulato con successo');
      
      // Verifica che il modale si sia aperto
      const authModal = document.getElementById('authModal');
      if (authModal && !authModal.classList.contains('hidden')) {
        console.log('✅ Modale di autenticazione aperto');
        return true;
      } else {
        console.error('❌ Modale di autenticazione non aperto');
        return false;
      }
    }
  } catch (error) {
    console.error('❌ Errore durante click:', error.message);
    return false;
  }
}

// Esegui tutti i test
function runAllTests() {
  console.log('🚀 Avvio test completi...\n');
  
  const tests = [
    testOAuthConfig,
    testFirebaseGlobal,
    testSecurityModules,
    testLoginFunctions,
    testDOMElements,
    testEventListeners,
    testLoginButton
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach(test => {
    try {
      if (test()) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error('❌ Errore durante test:', error.message);
      failed++;
    }
    console.log(''); // Riga vuota
  });
  
  console.log('📊 RISULTATI TEST:');
  console.log(`✅ Test passati: ${passed}`);
  console.log(`❌ Test falliti: ${failed}`);
  console.log(`📈 Tasso successo: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('🎉 Tutti i test sono passati! Il login dovrebbe funzionare correttamente.');
  } else {
    console.log('⚠️ Alcuni test sono falliti. Controlla i log sopra per i dettagli.');
  }
  
  return { passed, failed, success: failed === 0 };
}

// Esponi funzioni globalmente
window.testLoginFix = runAllTests;
window.testOAuthConfig = testOAuthConfig;
window.testFirebaseGlobal = testFirebaseGlobal;
window.testSecurityModules = testSecurityModules;
window.testLoginFunctions = testLoginFunctions;
window.testDOMElements = testDOMElements;
window.testEventListeners = testEventListeners;
window.testLoginButton = testLoginButton;

console.log('🧪 Test Login Fix caricato');
console.log('📝 Funzioni disponibili:');
console.log('  - testLoginFix(): Esegue tutti i test');
console.log('  - testOAuthConfig(): Test configurazione OAuth');
console.log('  - testFirebaseGlobal(): Test Firebase globale');
console.log('  - testSecurityModules(): Test moduli sicurezza');
console.log('  - testLoginFunctions(): Test funzioni login');
console.log('  - testDOMElements(): Test elementi DOM');
console.log('  - testEventListeners(): Test event listeners');
console.log('  - testLoginButton(): Test pulsante login');