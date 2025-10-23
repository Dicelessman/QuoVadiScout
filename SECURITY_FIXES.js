// 🔒 Security Fixes for QuoVadiScout v1.3.0
// Implementare queste correzioni prima del deployment in produzione

// ========================================
// 1. RATE LIMITING per Login
// ========================================

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minuti
const BLOCK_DURATION = 60 * 60 * 1000; // 1 ora dopo troppi lockout

class LoginSecurity {
  constructor() {
    this.attempts = this.loadAttempts();
  }

  loadAttempts() {
    try {
      return JSON.parse(localStorage.getItem('loginAttempts') || '{}');
    } catch {
      return {};
    }
  }

  saveAttempts() {
    localStorage.setItem('loginAttempts', JSON.stringify(this.attempts));
  }

  recordFailedAttempt(email) {
    const key = email.toLowerCase();
    const attempt = this.attempts[key] || { count: 0, firstAttempt: Date.now(), lockouts: 0 };
    
    attempt.count++;
    
    // Blocco permanente dopo 3 lockout consecutivi
    if (attempt.lockouts >= 3) {
      return { blocked: true, duration: Infinity, reason: 'Account sospeso per sicurezza' };
    }
    
    // Blocco temporaneo dopo troppi tentativi
    if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
      attempt.lockouts++;
      attempt.lockedUntil = Date.now() + LOCKOUT_DURATION;
      attempt.count = 0; // Reset counter
      
      this.attempts[key] = attempt;
      this.saveAttempts();
      
      return { 
        blocked: true, 
        duration: LOCKOUT_DURATION,
        reason: `Troppi tentativi falliti. Account bloccato per ${LOCKOUT_DURATION / 60000} minuti.`
      };
    }
    
    this.attempts[key] = attempt;
    this.saveAttempts();
    
    return { 
      blocked: false, 
      remaining: MAX_LOGIN_ATTEMPTS - attempt.count 
    };
  }

  recordSuccess(email) {
    const key = email.toLowerCase();
    delete this.attempts[key];
    this.saveAttempts();
  }

  isBlocked(email) {
    const key = email.toLowerCase();
    const attempt = this.attempts[key];
    
    if (!attempt || !attempt.lockedUntil) {
      return { blocked: false };
    }
    
    if (attempt.lockedUntil > Date.now()) {
      const minutesLeft = Math.ceil((attempt.lockedUntil - Date.now()) / 60000);
      return { 
        blocked: true, 
        minutesLeft,
        reason: `Account bloccato. Riprova tra ${minutesLeft} minuti.`
      };
    }
    
    // Blocco scaduto, reset
    delete this.attempts[key];
    this.saveAttempts();
    
    return { blocked: false };
  }
}

// Instanza globale
const loginSecurity = new LoginSecurity();

// ========================================
// 2. VALIDAZIONE PASSWORD ROBUSTA
// ========================================

function validatePasswordStrength(password) {
  const checks = {
    length: password.length >= 12,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>\[\]\\\/_+\-=]/.test(password),
    noCommonPatterns: !hasCommonPatterns(password),
    noCommonWords: !hasCommonWords(password)
  };
  
  const passed = Object.values(checks).filter(v => v).length;
  const strength = 
    passed === 7 ? 'strong' :
    passed >= 5 ? 'medium' :
    'weak';
  
  return {
    valid: strength !== 'weak',
    strength,
    checks,
    feedback: generatePasswordFeedback(checks)
  };
}

function hasCommonPatterns(password) {
  const patterns = [
    /12345678/,
    /abcdefgh/,
    /qwerty/,
    /password/i,
    /admin/i,
    /welcome/i
  ];
  
  return patterns.some(pattern => pattern.test(password));
}

function hasCommonWords(password) {
  const commonWords = [
    'password', 'password123', 'admin', 'welcome', 'hello',
    'monkey', '123456', 'letmein', 'trustno1', 'dragon'
  ];
  
  return commonWords.some(word => password.toLowerCase().includes(word));
}

function generatePasswordFeedback(checks) {
  const feedback = [];
  
  if (!checks.length) feedback.push('La password deve essere di almeno 12 caratteri');
  if (!checks.lowercase) feedback.push('Includi almeno una lettera minuscola');
  if (!checks.uppercase) feedback.push('Includi almeno una lettera maiuscola');
  if (!checks.number) feedback.push('Includi almeno un numero');
  if (!checks.special) feedback.push('Includi almeno un carattere speciale (!@#$%^&*...)');
  if (!checks.noCommonPatterns) feedback.push('Evita sequenze comuni (1234, abcd...)');
  if (!checks.noCommonWords) feedback.push('Evita parole comuni o prevedibili');
  
  return feedback;
}

// ========================================
// 3. SANITIZZAZIONE INPUT
// ========================================

class InputSanitizer {
  static sanitizeHTML(input) {
    if (!input) return '';
    
    // Creare elemento temporaneo per escape HTML
    const div = document.createElement('div');
    div.textContent = input;
    const sanitized = div.innerHTML;
    
    // Rimuovere possibili script
    return sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  
  static sanitizeEmail(email) {
    if (!email) return '';
    
    // Validazione email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Email non valida');
    }
    
    return email.toLowerCase().trim();
  }
  
  static sanitizePhone(phone) {
    if (!phone) return '';
    
    // Rimuovere tutti i caratteri non numerici
    return phone.replace(/\D/g, '');
  }
  
  static sanitizeText(input, maxLength = 1000) {
    if (!input) return '';
    
    // Trim e limit lunghezza
    let sanitized = input.trim();
    
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }
    
    // Escape HTML
    return this.sanitizeHTML(sanitized);
  }
  
  static sanitizeCoordinate(value) {
    const num = parseFloat(value);
    
    if (isNaN(num)) {
      throw new Error('Coordinate non valide');
    }
    
    // Valori validi per latitudine e longitudine
    if (Math.abs(num) > 180) {
      throw new Error('Coordinate fuori range');
    }
    
    return num;
  }
}

// ========================================
// 4. SESSION TIMEOUT
// ========================================

class SessionManager {
  constructor(timeoutMinutes = 30) {
    this.timeoutMs = timeoutMinutes * 60 * 1000;
    this.idleTimer = null;
    this.init();
  }
  
  init() {
    // Reset timer su qualsiasi interazione utente
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, () => this.resetTimer(), true);
    });
    
    this.resetTimer();
  }
  
  resetTimer() {
    clearTimeout(this.idleTimer);
    
    this.idleTimer = setTimeout(() => {
      this.onTimeout();
    }, this.timeoutMs);
  }
  
  onTimeout() {
    // Mostra avviso prima del logout
    const confirmed = confirm(
      'Stai per essere disconnesso per inattività. Clicca OK per restare connesso.'
    );
    
    if (confirmed) {
      this.resetTimer();
    } else {
      this.logout();
    }
  }
  
  logout() {
    clearTimeout(this.idleTimer);
    
    // Logout Firebase
    if (window.auth && window.signOut) {
      signOut(window.auth).then(() => {
        window.location.href = '/index.html';
      });
    } else {
      window.location.href = '/index.html';
    }
  }
  
  destroy() {
    clearTimeout(this.idleTimer);
  }
}

// ========================================
// 5. CSRF PROTECTION
// ========================================

class CSRFProtection {
  static generateToken() {
    const token = this.generateRandomToken();
    sessionStorage.setItem('csrfToken', token);
    return token;
  }
  
  static generateRandomToken() {
    // Usa Web Crypto API se disponibile
    if (window.crypto && window.crypto.getRandomValues) {
      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      return array[0].toString(36) + Date.now().toString(36);
    }
    
    // Fallback
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
  
  static getToken() {
    return sessionStorage.getItem('csrfToken');
  }
  
  static verifyToken(token) {
    const storedToken = this.getToken();
    return token === storedToken;
  }
  
  static resetToken() {
    sessionStorage.removeItem('csrfToken');
  }
}

// ========================================
// 6. FUNZIONE LOGIN SICURA
// ========================================

async function secureLoginWithEmail(email, password) {
  try {
    // 1. Sanitizza input
    const sanitizedEmail = InputSanitizer.sanitizeEmail(email);
    
    // 2. Verifica se account è bloccato
    const blocked = loginSecurity.isBlocked(sanitizedEmail);
    if (blocked.blocked) {
      showError(blocked.reason);
      return;
    }
    
    // 3. Verifica forza password
    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.valid) {
      showError('Password troppo debole. ' + passwordCheck.feedback.join(' '));
      return;
    }
    
    // 4. Genera token CSRF
    const csrfToken = CSRFProtection.generateToken();
    
    // 5. Tentativo login Firebase
    showLoading(true);
    hideError();
    
    const userCredential = await signInWithEmailAndPassword(auth, sanitizedEmail, password);
    
    // 6. Successo - reset tentativi e token CSRF
    loginSecurity.recordSuccess(sanitizedEmail);
    CSRFProtection.resetToken();
    
    console.log('✅ Login riuscito:', userCredential.user.email);
    
    return userCredential;
    
  } catch (error) {
    console.error('❌ Errore login:', error);
    
    // 7. Gestione errori sicura
    let errorMessage = 'Errore durante il login';
    
    // Record tentativo fallito
    const result = loginSecurity.recordFailedAttempt(email);
    if (result.blocked) {
      errorMessage = result.reason;
    } else {
      // Messaggio generico per non rivelare quale campo è errato
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = '❌ Credenziali non valide';
          break;
        case 'auth/invalid-email':
          errorMessage = '❌ Email non valida';
          break;
        case 'auth/too-many-requests':
          errorMessage = '❌ Troppi tentativi, riprova più tardi';
          break;
        default:
          errorMessage = '❌ Errore durante il login';
      }
    }
    
    showError(errorMessage);
    
  } finally {
    showLoading(false);
  }
}

// ========================================
// 7. FUNZIONE REGISTRAZIONE SICURA
// ========================================

async function secureRegisterWithEmail(nome, email, password) {
  try {
    // 1. Sanitizza tutti gli input
    const sanitizedNome = InputSanitizer.sanitizeText(nome, 100);
    const sanitizedEmail = InputSanitizer.sanitizeEmail(email);
    
    // 2. Verifica password robusta
    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.valid) {
      const feedback = passwordCheck.feedback.join('\n');
      showError(`Password troppo debole:\n${feedback}`);
      return;
    }
    
    // 3. Tentativo registrazione Firebase
    showLoading(true);
    hideError();
    
    const userCredential = await createUserWithEmailAndPassword(auth, sanitizedEmail, password);
    
    // 4. Crea profilo utente in Firestore
    const userProfile = {
      nome: sanitizedNome,
      email: sanitizedEmail,
      createdAt: new Date(),
      preferences: {
        theme: 'light',
        notifications: {
          enabled: true,
          nearbyStructures: false
        }
      }
    };
    
    await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);
    
    console.log('✅ Registrazione riuscita:', userCredential.user.email);
    
    return userCredential;
    
  } catch (error) {
    console.error('❌ Errore registrazione:', error);
    
    let errorMessage = 'Errore durante la registrazione';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = '❌ Email già registrata';
        break;
      case 'auth/invalid-email':
        errorMessage = '❌ Email non valida';
        break;
      case 'auth/weak-password':
        errorMessage = '❌ Password troppo debole';
        break;
      default:
        errorMessage = '❌ Errore durante la registrazione';
    }
    
    showError(errorMessage);
    
  } finally {
    showLoading(false);
  }
}

// ========================================
// 8. INITIALIZATION
// ========================================

// Inizializza session manager dopo login
function initSessionTimeout() {
  if (window.sessionManager) {
    window.sessionManager.destroy();
  }
  
  window.sessionManager = new SessionManager(30); // 30 minuti timeout
}

// Cleanup on logout
function cleanupSession() {
  if (window.sessionManager) {
    window.sessionManager.destroy();
    window.sessionManager = null;
  }
  
  CSRFProtection.resetToken();
  loginSecurity.saveAttempts();
}

// ========================================
// EXPORT per uso in script.js
// ========================================

window.LoginSecurity = LoginSecurity;
window.InputSanitizer = InputSanitizer;
window.SessionManager = SessionManager;
window.CSRFProtection = CSRFProtection;
window.validatePasswordStrength = validatePasswordStrength;
window.secureLoginWithEmail = secureLoginWithEmail;
window.secureRegisterWithEmail = secureRegisterWithEmail;
window.initSessionTimeout = initSessionTimeout;
window.cleanupSession = cleanupSession;

console.log('🔒 Security fixes module loaded');

