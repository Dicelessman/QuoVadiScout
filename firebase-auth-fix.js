// Firebase Auth Fix per QuoVadiScout
// Gestisce problemi di autorizzazione dominio e configurazione OAuth

console.log('🔧 Firebase Auth Fix caricato');

// === CONFIGURAZIONE DOMINI AUTORIZZATI ===
const AUTHORIZED_DOMAINS = [
  'localhost',
  '127.0.0.1',
  'dicelessman.github.io',
  'quovadiscout.firebaseapp.com'
];

// === HELPER FUNCTIONS ===
function isDomainAuthorized() {
  const currentDomain = window.location.hostname;
  return AUTHORIZED_DOMAINS.includes(currentDomain);
}

function getAuthDomain() {
  // Se siamo su un dominio non autorizzato, usa localhost per sviluppo
  if (!isDomainAuthorized()) {
    console.warn('⚠️ Dominio non autorizzato, usando configurazione locale');
    return 'localhost';
  }
  return 'quovadiscout.firebaseapp.com';
}

// === CONFIGURAZIONE FIREBASE CORRETTA ===
function getCorrectedFirebaseConfig() {
  const baseConfig = window.firebaseConfig;
  if (!baseConfig) {
    console.error('❌ firebaseConfig non trovato');
    return null;
  }
  
  return {
    ...baseConfig,
    authDomain: getAuthDomain()
  };
}

// === GESTIONE ERRORI OAUTH ===
function handleOAuthError(error) {
  console.error('❌ Errore OAuth:', error);
  
  if (error.code === 'auth/network-request-failed') {
    showError('Errore di rete. Verifica la connessione e riprova.');
    return;
  }
  
  if (error.message && error.message.includes('not authorized')) {
    showError('Dominio non autorizzato per OAuth. Usa localhost per sviluppo.');
    return;
  }
  
  showError(`Errore autenticazione: ${error.message}`);
}

// === FUNZIONI LOGIN CORRETTE ===
async function loginWithEmailFixed(email, password) {
  try {
    console.log('🔐 Tentativo login email:', email);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Login email riuscito:', userCredential.user.uid);
    
    // Aggiorna UI
    aggiornaUIUtente(userCredential.user);
    
    // Nascondi modale
    nascondiModaleAuth();
    
    showSuccess('Login effettuato con successo!');
    
    return userCredential.user;
  } catch (error) {
    console.error('❌ Errore login email:', error);
    handleOAuthError(error);
    throw error;
  }
}

async function loginWithGoogleFixed() {
  try {
    console.log('🔐 Tentativo login Google');
    
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    
    const result = await signInWithPopup(auth, provider);
    console.log('✅ Login Google riuscito:', result.user.uid);
    
    // Aggiorna UI
    aggiornaUIUtente(result.user);
    
    // Nascondi modale
    nascondiModaleAuth();
    
    showSuccess('Login Google effettuato con successo!');
    
    return result.user;
  } catch (error) {
    console.error('❌ Errore login Google:', error);
    handleOAuthError(error);
    throw error;
  }
}

async function loginWithGithubFixed() {
  try {
    console.log('🔐 Tentativo login GitHub');
    
    const provider = new GithubAuthProvider();
    provider.addScope('user:email');
    
    const result = await signInWithPopup(auth, provider);
    console.log('✅ Login GitHub riuscito:', result.user.uid);
    
    // Aggiorna UI
    aggiornaUIUtente(result.user);
    
    // Nascondi modale
    nascondiModaleAuth();
    
    showSuccess('Login GitHub effettuato con successo!');
    
    return result.user;
  } catch (error) {
    console.error('❌ Errore login GitHub:', error);
    handleOAuthError(error);
    throw error;
  }
}

// === FUNZIONI REGISTRAZIONE CORRETTE ===
async function registerWithEmailFixed(email, password) {
  try {
    console.log('🔐 Tentativo registrazione email:', email);
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ Registrazione email riuscita:', userCredential.user.uid);
    
    // Aggiorna UI
    aggiornaUIUtente(userCredential.user);
    
    // Nascondi modale
    nascondiModaleAuth();
    
    showSuccess('Registrazione effettuata con successo!');
    
    return userCredential.user;
  } catch (error) {
    console.error('❌ Errore registrazione email:', error);
    handleOAuthError(error);
    throw error;
  }
}

// === GESTIONE LOGOUT ===
async function logoutUserFixed() {
  try {
    await signOut(auth);
    console.log('✅ Logout effettuato');
    
    // Aggiorna UI
    aggiornaUIUtente(null);
    
    showSuccess('Logout effettuato con successo!');
  } catch (error) {
    console.error('❌ Errore logout:', error);
    showError('Errore durante il logout');
  }
}

// === FUNZIONI UI ===
function showError(message) {
  // Cerca elemento di errore esistente o creane uno nuovo
  let errorElement = document.getElementById('auth-error');
  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.id = 'auth-error';
    errorElement.className = 'auth-error';
    errorElement.style.cssText = `
      background: #fee;
      color: #c33;
      padding: 10px;
      margin: 10px 0;
      border-radius: 4px;
      border: 1px solid #fcc;
    `;
    
    const authModal = document.getElementById('authModal');
    if (authModal) {
      authModal.insertBefore(errorElement, authModal.firstChild);
    }
  }
  
  errorElement.textContent = message;
  errorElement.style.display = 'block';
  
  // Nascondi dopo 5 secondi
  setTimeout(() => {
    errorElement.style.display = 'none';
  }, 5000);
}

function showSuccess(message) {
  // Cerca elemento di successo esistente o creane uno nuovo
  let successElement = document.getElementById('auth-success');
  if (!successElement) {
    successElement = document.createElement('div');
    successElement.id = 'auth-success';
    successElement.className = 'auth-success';
    successElement.style.cssText = `
      background: #efe;
      color: #3c3;
      padding: 10px;
      margin: 10px 0;
      border-radius: 4px;
      border: 1px solid #cfc;
    `;
    
    const authModal = document.getElementById('authModal');
    if (authModal) {
      authModal.insertBefore(successElement, authModal.firstChild);
    }
  }
  
  successElement.textContent = message;
  successElement.style.display = 'block';
  
  // Nascondi dopo 3 secondi
  setTimeout(() => {
    successElement.style.display = 'none';
  }, 3000);
}

// === INIZIALIZZAZIONE ===
function initFirebaseAuthFix() {
  console.log('🔧 Inizializzazione Firebase Auth Fix...');
  
  // Verifica dominio
  if (!isDomainAuthorized()) {
    console.warn('⚠️ Dominio non autorizzato:', window.location.hostname);
    console.warn('💡 Per sviluppo locale, usa localhost:3000');
  }
  
  // Esponi funzioni corrette globalmente
  window.loginWithEmailFixed = loginWithEmailFixed;
  window.loginWithGoogleFixed = loginWithGoogleFixed;
  window.loginWithGithubFixed = loginWithGithubFixed;
  window.registerWithEmailFixed = registerWithEmailFixed;
  window.logoutUserFixed = logoutUserFixed;
  
  console.log('✅ Firebase Auth Fix inizializzato');
}

// === ESPORTAZIONE ===
window.FirebaseAuthFix = {
  init: initFirebaseAuthFix,
  isDomainAuthorized: isDomainAuthorized,
  getAuthDomain: getAuthDomain,
  getCorrectedFirebaseConfig: getCorrectedFirebaseConfig,
  handleOAuthError: handleOAuthError,
  showError: showError,
  showSuccess: showSuccess
};

// Inizializza automaticamente
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initFirebaseAuthFix, 1000);
});

console.log('🔧 Firebase Auth Fix pronto');
