// Test completo per verificare che il login funzioni correttamente
// Dopo tutte le correzioni apportate

console.log('🧪 Test Login Completo - QuoVadiScout');

// === TEST PRINCIPALI ===

// Test 1: Verifica che tutti i moduli siano caricati
function testModulesLoaded() {
  console.log('🔍 Test 1: Verifica moduli caricati...');
  
  const requiredModules = [
    'OAuthConfig',
    'FirebaseAuthFix',
    'securityClient',
    'securityMonitor'
  ];
  
  const missingModules = requiredModules.filter(module => typeof window[module] === 'undefined');
  
  if (missingModules.length > 0) {
    console.error('❌ Moduli mancanti:', missingModules);
    return false;
  }
  
  console.log('✅ Tutti i moduli sono caricati');
  return true;
}

// Test 2: Verifica configurazione OAuth
function testOAuthConfigFixed() {
  console.log('🔍 Test 2: Verifica configurazione OAuth...');
  
  try {
    const validation = window.OAuthConfig.utils.validateConfig();
    if (!validation.valid) {
      console.error('❌ Configurazione OAuth non valida:', validation.errors);
      return false;
    }
    
    console.log('✅ Configurazione OAuth valida');
    return true;
  } catch (error) {
    console.error('❌ Errore validazione OAuth:', error.message);
    return false;
  }
}

// Test 3: Verifica funzioni login corrette
function testLoginFunctionsFixed() {
  console.log('🔍 Test 3: Verifica funzioni login corrette...');
  
  const requiredFunctions = [
    'loginWithEmailFixed',
    'loginWithGoogleFixed',
    'loginWithGithubFixed',
    'registerWithEmailFixed',
    'logoutUserFixed'
  ];
  
  const missingFunctions = requiredFunctions.filter(func => typeof window[func] !== 'function');
  
  if (missingFunctions.length > 0) {
    console.error('❌ Funzioni login corrette mancanti:', missingFunctions);
    return false;
  }
  
  console.log('✅ Funzioni login corrette disponibili');
  return true;
}

// Test 4: Verifica elementi DOM
function testDOMElementsFixed() {
  console.log('🔍 Test 4: Verifica elementi DOM...');
  
  const requiredElements = [
    'authModal',
    'loginBtn',
    'emailLoginBtn',
    'googleLoginBtn',
    'githubLoginBtn'
  ];
  
  const missingElements = requiredElements.filter(id => !document.getElementById(id));
  
  if (missingElements.length > 0) {
    console.error('❌ Elementi DOM mancanti:', missingElements);
    return false;
  }
  
  console.log('✅ Elementi DOM presenti');
  return true;
}

// Test 5: Verifica event listeners
function testEventListenersFixed() {
  console.log('🔍 Test 5: Verifica event listeners...');
  
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

// Test 6: Simula click login
function testLoginButtonFixed() {
  console.log('🔍 Test 6: Simula click login...');
  
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

// Test 7: Verifica gestione errori
function testErrorHandling() {
  console.log('🔍 Test 7: Verifica gestione errori...');
  
  try {
    // Test funzione showError
    if (window.FirebaseAuthFix && typeof window.FirebaseAuthFix.showError === 'function') {
      window.FirebaseAuthFix.showError('Test errore');
      console.log('✅ Funzione showError disponibile');
    } else {
      console.error('❌ Funzione showError non disponibile');
      return false;
    }
    
    // Test funzione showSuccess
    if (window.FirebaseAuthFix && typeof window.FirebaseAuthFix.showSuccess === 'function') {
      window.FirebaseAuthFix.showSuccess('Test successo');
      console.log('✅ Funzione showSuccess disponibile');
    } else {
      console.error('❌ Funzione showSuccess non disponibile');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Errore durante test gestione errori:', error.message);
    return false;
  }
}

// Test 8: Verifica dominio autorizzato
function testDomainAuthorization() {
  console.log('🔍 Test 8: Verifica autorizzazione dominio...');
  
  try {
    if (window.FirebaseAuthFix && typeof window.FirebaseAuthFix.isDomainAuthorized === 'function') {
      const isAuthorized = window.FirebaseAuthFix.isDomainAuthorized();
      console.log(`📋 Dominio autorizzato: ${isAuthorized}`);
      
      if (!isAuthorized) {
        console.warn('⚠️ Dominio non autorizzato - funzionerà solo in sviluppo locale');
      }
      
      return true;
    } else {
      console.error('❌ Funzione isDomainAuthorized non disponibile');
      return false;
    }
  } catch (error) {
    console.error('❌ Errore durante test autorizzazione dominio:', error.message);
    return false;
  }
}

// === TEST COMPLETO ===
function runCompleteTest() {
  console.log('🚀 Avvio test completo login...\n');
  
  const tests = [
    testModulesLoaded,
    testOAuthConfigFixed,
    testLoginFunctionsFixed,
    testDOMElementsFixed,
    testEventListenersFixed,
    testLoginButtonFixed,
    testErrorHandling,
    testDomainAuthorization
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
  
  console.log('📊 RISULTATI TEST COMPLETO:');
  console.log(`✅ Test passati: ${passed}`);
  console.log(`❌ Test falliti: ${failed}`);
  console.log(`📈 Tasso successo: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('🎉 Tutti i test sono passati! Il login dovrebbe funzionare correttamente.');
    console.log('💡 Prova ora il login nell\'applicazione!');
  } else {
    console.log('⚠️ Alcuni test sono falliti. Controlla i log sopra per i dettagli.');
  }
  
  return { passed, failed, success: failed === 0 };
}

// === TEST SPECIFICI ===
function testLoginEmail() {
  console.log('🧪 Test login email...');
  
  // Simula click sul pulsante login email
  const emailLoginBtn = document.getElementById('emailLoginBtn');
  if (emailLoginBtn) {
    try {
      emailLoginBtn.click();
      console.log('✅ Click pulsante login email simulato');
      return true;
    } catch (error) {
      console.error('❌ Errore click login email:', error.message);
      return false;
    }
  } else {
    console.error('❌ Pulsante login email non trovato');
    return false;
  }
}

function testLoginGoogle() {
  console.log('🧪 Test login Google...');
  
  // Simula click sul pulsante login Google
  const googleLoginBtn = document.getElementById('googleLoginBtn');
  if (googleLoginBtn) {
    try {
      googleLoginBtn.click();
      console.log('✅ Click pulsante login Google simulato');
      return true;
    } catch (error) {
      console.error('❌ Errore click login Google:', error.message);
      return false;
    }
  } else {
    console.error('❌ Pulsante login Google non trovato');
    return false;
  }
}

// === ESPORTAZIONE ===
window.testLoginComplete = runCompleteTest;
window.testModulesLoaded = testModulesLoaded;
window.testOAuthConfigFixed = testOAuthConfigFixed;
window.testLoginFunctionsFixed = testLoginFunctionsFixed;
window.testDOMElementsFixed = testDOMElementsFixed;
window.testEventListenersFixed = testEventListenersFixed;
window.testLoginButtonFixed = testLoginButtonFixed;
window.testErrorHandling = testErrorHandling;
window.testDomainAuthorization = testDomainAuthorization;
window.testLoginEmail = testLoginEmail;
window.testLoginGoogle = testLoginGoogle;

console.log('🧪 Test Login Completo caricato');
console.log('📝 Funzioni disponibili:');
console.log('  - testLoginComplete(): Esegue tutti i test');
console.log('  - testModulesLoaded(): Test moduli caricati');
console.log('  - testOAuthConfigFixed(): Test configurazione OAuth');
console.log('  - testLoginFunctionsFixed(): Test funzioni login corrette');
console.log('  - testDOMElementsFixed(): Test elementi DOM');
console.log('  - testEventListenersFixed(): Test event listeners');
console.log('  - testLoginButtonFixed(): Test pulsante login');
console.log('  - testErrorHandling(): Test gestione errori');
console.log('  - testDomainAuthorization(): Test autorizzazione dominio');
console.log('  - testLoginEmail(): Test login email');
console.log('  - testLoginGoogle(): Test login Google');
