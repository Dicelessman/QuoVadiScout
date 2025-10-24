# 🔧 Troubleshooting QuoVadiScout

## 🚨 Problemi Comuni e Soluzioni

### 1. Problemi di Autenticazione

#### Problema: Popup Google OAuth bloccato
**Sintomi**: 
- Errore `auth/popup-closed-by-user`
- Errore `auth/popup-blocked`
- Violazioni CSP per popup

**Soluzioni**:
1. **Abilita popup nel browser**:
   - Chrome: Impostazioni > Privacy e sicurezza > Impostazioni sito > Popup e reindirizzamenti
   - Firefox: Impostazioni > Privacy e sicurezza > Permessi > Blocca popup
   - Safari: Preferenze > Siti web > Popup

2. **Verifica CSP**:
   - Assicurati che `frame-src` includa `https://accounts.google.com`
   - Verifica che `Cross-Origin-Opener-Policy` sia impostato su `same-origin-allow-popups`

3. **Usa redirect invece di popup**:
   - L'applicazione fallback automaticamente a redirect se popup fallisce

#### Problema: Accesso negato ai dati
**Sintomi**:
- Errore `Missing or insufficient permissions`
- Dati non caricati dopo login

**Soluzioni**:
1. **Verifica email verificata**:
   - Controlla che l'email sia verificata in Firebase Console
   - Invia nuovamente email di verifica se necessario

2. **Verifica regole Firestore**:
   - Assicurati che le regole richiedano autenticazione
   - Verifica che le regole siano deployate correttamente

3. **Controlla domini autorizzati**:
   - Aggiungi il dominio a Firebase Console > Authentication > Settings

### 2. Problemi di Configurazione

#### Problema: File firebase-config.js non trovato
**Sintomi**:
- Errore 404 per firebase-config.js
- Applicazione non si carica

**Soluzioni**:
1. **Usa configurazione fallback**:
   - L'applicazione usa automaticamente la configurazione integrata
   - Nessuna configurazione esterna richiesta per funzionamento base

2. **Per produzione**:
   - Crea `firebase-config.js` basato su `firebase-config.template.js`
   - Configura le tue credenziali Firebase

#### Problema: Content Security Policy violata
**Sintomi**:
- Errori CSP nella console
- Script bloccati

**Soluzioni**:
1. **Verifica CSP**:
   - Controlla che tutti i domini necessari siano inclusi
   - Aggiorna CSP se necessario

2. **Domini comuni**:
   - `https://www.gstatic.com` per Firebase
   - `https://apis.google.com` per Google OAuth
   - `https://accounts.google.com` per popup OAuth

### 3. Problemi di Performance

#### Problema: Applicazione lenta
**Sintomi**:
- Caricamento lento
- Timeout nelle richieste

**Soluzioni**:
1. **Verifica connessione internet**
2. **Controlla rate limiting**:
   - L'applicazione ha rate limiting integrato
   - Evita troppe richieste rapide

3. **Pulisci cache browser**:
   - Hard refresh (Ctrl+F5)
   - Svuota cache browser

### 4. Problemi di Sicurezza

#### Problema: Accesso non autorizzato
**Sintomi**:
- Dati accessibili senza login
- Violazioni di sicurezza

**Soluzioni**:
1. **Verifica gate di autenticazione**:
   - L'applicazione blocca automaticamente accesso non autorizzato
   - Controlla che la schermata di login sia sempre visibile

2. **Verifica regole Firestore**:
   - Assicurati che tutte le collezioni richiedano autenticazione
   - Verifica che le regole siano deployate

3. **Controlla console browser**:
   - Verifica che non ci siano errori di sicurezza
   - Controlla che le funzioni di sicurezza siano attive

## 🧪 Test di Funzionamento

### Test Automatici
```javascript
// Nella console del browser
runSecurityTests();
```

### Test Manuali
1. **Test Login**:
   - Prova login con email/password
   - Prova login con Google OAuth
   - Verifica che i dati siano protetti

2. **Test Registrazione**:
   - Prova registrazione nuovo utente
   - Verifica invio email di verifica
   - Testa accesso dopo verifica

3. **Test Sicurezza**:
   - Verifica che non ci siano accessi non autorizzati
   - Controlla che i dati siano protetti
   - Testa rate limiting

## 📞 Supporto

### Log di Debug
Per abilitare log dettagliati:
```javascript
// Nella console del browser
window.DEBUG = true;
```

### Informazioni Sistema
Per ottenere informazioni sul sistema:
```javascript
// Nella console del browser
console.log('Firebase Config:', window.FirebaseConfig);
console.log('Auth State:', firebase.auth().currentUser);
console.log('Security Monitor:', window.securityMonitor);
```

### Contatti
- **Documentazione**: Vedi file README.md
- **Sicurezza**: Vedi file SECURITY.md
- **Setup**: Vedi file SETUP_PRODUCTION.md

## 🔄 Aggiornamenti

### Verifica Versione
```javascript
// Nella console del browser
console.log('QuoVadiScout Version:', 'v1.3.0');
```

### Aggiornamenti Sicurezza
L'applicazione include:
- ✅ Gate di autenticazione globale
- ✅ Accesso completamente privato ai dati
- ✅ Rate limiting avanzato
- ✅ Validazione input robusta
- ✅ Monitoraggio eventi di sicurezza
- ✅ Content Security Policy

---

**Nota**: Se continui ad avere problemi, verifica che tutti i file siano stati committati e pushati correttamente su GitHub.
