# Istruzioni Deploy Sicurezza QuoVadiScout

## 🚀 Deploy Rapido

### Opzione 1: Script Automatico (Raccomandato)

**Windows (PowerShell):**
```powershell
.\deploy-security.ps1
```

**Windows (CMD):**
```cmd
deploy-security.bat
```

### Opzione 2: Deploy Manuale

```bash
# 1. Deploy Firestore Security Rules (CRITICO)
firebase deploy --only firestore:rules

# 2. Deploy Cloud Functions
cd functions
npm install
cd ..
firebase deploy --only functions

# 3. Verifica deploy
firebase functions:log --limit 10
```

## 📋 Checklist Pre-Deploy

- [ ] Firebase CLI installato (`firebase --version`)
- [ ] Autenticato con Firebase (`firebase login`)
- [ ] Progetto Firebase configurato (`firebase use <project-id>`)
- [ ] Dipendenze Node.js installate
- [ ] Backup del database esistente

## 🔍 Test Post-Deploy

### 1. Test Autenticazione
```javascript
// Console browser
await window.securityClient.validateToken();
```

### 2. Test Bypass Prevention
```javascript
// Console browser - Dovrebbe fallire
window.utenteCorrente = {uid: 'fake-id'};
caricaStrutture();
```

### 3. Test Completo Sicurezza
```javascript
// Console browser
await runSecurityTests();
```

### 4. Test Specifico Bypass
```javascript
// Console browser
await testSecurityBypass();
```

## 🛠️ Risoluzione Problemi

### Errore: "Firebase CLI non trovato"
```bash
npm install -g firebase-tools
firebase login
```

### Errore: "Permission denied"
```bash
firebase login --reauth
firebase use quovadiscout
```

### Errore: "Functions deploy failed"
```bash
cd functions
npm install
cd ..
firebase deploy --only functions --debug
```

### Errore: "Rules deploy failed"
```bash
firebase deploy --only firestore:rules --debug
```

## 📊 Verifica Sicurezza

### 1. Firebase Console
- **Authentication**: Verifica provider OAuth attivi
- **Firestore**: Controlla Security Rules deployate
- **Functions**: Verifica Cloud Functions attive
- **Logs**: Monitora errori e attività

### 2. Browser Console
- **Network**: Verifica chiamate API sicure
- **Console**: Controlla errori JavaScript
- **Application**: Verifica token storage

### 3. Test Manuali
- [ ] Login con OAuth funziona
- [ ] Creazione struttura richiede autenticazione
- [ ] Modifica struttura richiede permessi
- [ ] Eliminazione struttura richiede permessi
- [ ] Bypass JavaScript bloccato

## 🚨 Monitoraggio Post-Deploy

### Log da Monitorare
```bash
# Log Cloud Functions
firebase functions:log

# Log Firestore
firebase firestore:logs

# Log Authentication
firebase auth:logs
```

### Metriche da Controllare
- **Errori 401/403**: Tentativi accesso non autorizzato
- **Rate limiting**: Troppi tentativi da singolo utente
- **Security incidents**: Attività sospette rilevate
- **Token validation**: Errori di autenticazione

## 📞 Supporto

### In caso di problemi:
1. Controlla i log Firebase Console
2. Verifica configurazione Firebase
3. Testa con utente amministratore
4. Contatta supporto tecnico

### URL Utili:
- **Firebase Console**: https://console.firebase.google.com
- **Documentazione**: https://firebase.google.com/docs
- **Security Rules**: https://firebase.google.com/docs/firestore/security/get-started

---

**⚠️ IMPORTANTE**: Dopo il deploy, testa sempre la sicurezza per verificare che non ci siano vulnerabilità esposte.
