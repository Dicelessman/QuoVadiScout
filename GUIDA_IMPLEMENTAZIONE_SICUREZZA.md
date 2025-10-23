# 🛡️ Guida Implementazione Sicurezza - QuoVadiScout

Questa guida ti accompagna passo-passo nell'implementazione delle correzioni di sicurezza identificate nell'analisi.

---

## ⚡ Quick Start (Implementazioni Urgenti)

### 1. Spostare Credenziali Firebase (CRITICO - 10 minuti)

**Problema**: Le credenziali Firebase sono hardcoded nel file `script.js`

**Soluzione**:

1. **Crea il file di configurazione**:
```bash
cp firebase-config.example.js firebase-config.js
```

2. **Modifica `firebase-config.js`** con le tue credenziali reali:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDHFnQOMoaxY1d-7LRVgh7u_ioRWPDWVfI",
  authDomain: "quovadiscout.firebaseapp.com",
  projectId: "quovadiscout",
  storageBucket: "quovadiscout.firebasestorage.app",
  messagingSenderId: "745134651793",
  appId: "1:745134651793:web:dabd5ae6b7b579172dc230"
};
```

3. **Modifica `script.js`** rimuovendo la configurazione hardcoded (linee 30-37):
```javascript
// RIMUOVI QUESTO:
const firebaseConfig = {
  apiKey: "AIzaSyDHFnQOMoaxY1d-7LRVgh7u_ioRWPDWVfI",
  // ...
};

// AGGIUNGI QUESTO:
import firebaseConfig from './firebase-config.js';
```

4. **Modifica `index.html`** per caricare il file di configurazione prima degli altri script:
```html
<!-- Aggiungi dopo gli altri script, prima di script.js -->
<script type="module" src="firebase-config.js"></script>
```

**⚠️ IMPORTANTE**: Verifica che `firebase-config.js` sia già nel `.gitignore`!

---

### 2. Implementare Rate Limiting (ALTO - 20 minuti)

**Implementazione**:

1. **Aggiungi `SECURITY_FIXES.js` a `index.html`**:
```html
<!-- Prima di script.js -->
<script src="SECURITY_FIXES.js"></script>
```

2. **Modifica le funzioni di login in `script.js`**:

```javascript
// SOSTITUISCI LA FUNZIONE loginWithEmail CON:
async function loginWithEmail(email, password) {
  // Usa la versione sicura da SECURITY_FIXES.js
  return await secureLoginWithEmail(email, password);
}

// Oppure, se preferisci implementare direttamente:
async function loginWithEmail(email, password) {
  try {
    // Verifica se account è bloccato
    const blocked = loginSecurity.isBlocked(email);
    if (blocked.blocked) {
      showError(blocked.reason);
      return;
    }
    
    showLoading(true);
    hideError();
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Successo - reset tentativi
    loginSecurity.recordSuccess(email);
    
    console.log('✅ Login riuscito:', userCredential.user.email);
    
  } catch (error) {
    console.error('❌ Errore login:', error);
    
    // Record tentativo fallito
    const result = loginSecurity.recordFailedAttempt(email);
    if (result.blocked) {
      showError(result.reason);
    } else {
      // Messaggio generico
      showError('❌ Credenziali non valide');
    }
  } finally {
    showLoading(false);
  }
}
```

---

### 3. Validazione Password Robusta (MEDIO - 15 minuti)

**Implementazione**:

1. **Modifica la registrazione in `script.js`**:

```javascript
document.getElementById('registerBtn').onclick = async () => {
  const nome = document.getElementById('registerNome').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  
  if (!nome || !email || !password) {
    showError('⚠️ Compila tutti i campi');
    return;
  }
  
  // Nuova validazione password
  const passwordCheck = validatePasswordStrength(password);
  if (!passwordCheck.valid) {
    const feedback = passwordCheck.feedback.join('\n');
    showError(`Password troppo debole:\n${feedback}`);
    return;
  }
  
  await registerWithEmail(nome, email, password);
};
```

2. **Aggiungi indicatore visivo forza password**:

```html
<!-- Nel form di registrazione -->
<input id="registerPassword" type="password" placeholder="Password" />
<div id="passwordStrength" style="margin-top: 5px;"></div>
```

```javascript
document.getElementById('registerPassword').addEventListener('input', (e) => {
  const password = e.target.value;
  const strength = validatePasswordStrength(password);
  
  const indicator = document.getElementById('passwordStrength');
  const colors = {
    weak: '#dc3545',
    medium: '#ffc107',
    strong: '#28a745'
  };
  
  indicator.innerHTML = `
    <div style="color: ${colors[strength.strength]}">
      Forza password: ${strength.strength.toUpperCase()}
    </div>
  `;
});
```

---

## 🔧 Implementazioni Avanzate

### 4. Session Timeout (MEDIO - 10 minuti)

**Implementazione**:

```javascript
// Dopo il login riuscito
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // ... resto del codice
    
    // Inizializza session timeout
    initSessionTimeout();
  } else {
    // Cleanup session
    cleanupSession();
  }
});
```

---

### 5. Sanitizzazione Input (MEDIO - 30 minuti)

**Implementazione**:

```javascript
// Per ogni campo di input che accetta dati utente:

// Nome struttura
const nomeStruttura = InputSanitizer.sanitizeText(document.getElementById('nome').value, 100);

// Email
const email = InputSanitizer.sanitizeEmail(document.getElementById('email').value);

// Telefono
const telefono = InputSanitizer.sanitizePhone(document.getElementById('telefono').value);

// Descrizione
const descrizione = InputSanitizer.sanitizeHTML(document.getElementById('descrizione').value);

// Coordinate GPS
const latitudine = InputSanitizer.sanitizeCoordinate(document.getElementById('lat').value);
const longitudine = InputSanitizer.sanitizeCoordinate(document.getElementById('lng').value);
```

---

### 6. Messaggi Errore Generici (BASSO - 5 minuti)

**Implementazione**:

Sostituisci tutti i messaggi di errore specifici con messaggi generici:

```javascript
// PRIMA (RIVELA INFORMAZIONI):
case 'auth/user-not-found':
  errorMessage = '❌ Utente non trovato';
case 'auth/wrong-password':
  errorMessage = '❌ Password errata';

// DOPO (SICURO):
case 'auth/user-not-found':
case 'auth/wrong-password':
case 'auth/invalid-credential':
  errorMessage = '❌ Credenziali non valide';
```

---

## 🧪 Testing

### Test Rate Limiting

1. Prova a fare login con credenziali errate
2. Verifica che dopo 5 tentativi l'account venga bloccato
3. Verifica che il messaggio mostri i minuti rimanenti
4. Attendi il tempo di blocco e verifica che funzioni di nuovo

### Test Password Strength

1. Prova password troppo corte (< 12 caratteri)
2. Prova password senza caratteri speciali
3. Prova password con sequenze comuni (1234, abcd)
4. Verifica che solo password strong vengano accettate

### Test Session Timeout

1. Fai login
2. Non interagire con l'app per 30 minuti
3. Verifica che compaia l'avviso di disconnessione
4. Verifica che il logout avvenga correttamente

---

## 📋 Checklist Implementazione

- [ ] Credenziali Firebase spostate in file separato
- [ ] `firebase-config.js` aggiunto a `.gitignore`
- [ ] Rate limiting implementato
- [ ] Validazione password robusta implementata
- [ ] Indicatore forza password aggiunto
- [ ] Session timeout configurato
- [ ] Input sanitization implementata
- [ ] Messaggi errore generici
- [ ] Test completati
- [ ] Documentazione aggiornata

---

## 🚨 Rollback Plan

Se qualcosa va storto:

1. **Ripristina i file modificati**:
```bash
git checkout script.js
git checkout index.html
```

2. **Rimuovi i nuovi file**:
```bash
rm SECURITY_FIXES.js
rm firebase-config.js
```

3. **Ripristina configurazione originale** in `script.js`

---

## 📞 Supporto

Per assistenza durante l'implementazione:
- **Email**: davide.rossi@cngei.it
- **WhatsApp**: 388 818 2045

---

## ✅ Post-Implementazione

Dopo aver implementato tutte le correzioni:

1. **Test completo** dell'applicazione
2. **Review codice** per verificare implementazione corretta
3. **Test sicurezza** con strumenti automatici
4. **Deploy staging** per test aggiuntivi
5. **Deploy produzione** solo dopo verifica completa

---

*Guida aggiornata: 19 Dicembre 2024*

