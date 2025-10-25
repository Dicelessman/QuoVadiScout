# 🚀 Guida Deployment Firebase per QuoVadiScout

## 📋 Prerequisiti

### 1. Firebase CLI Installato
```bash
npm install -g firebase-tools
```

### 2. Login Firebase
```bash
firebase login
```

### 3. Inizializzazione Progetto
```bash
firebase init
```

## 🔒 Deploy Regole Firestore

### 1. Backup Regole Esistenti
Prima di deployare le nuove regole, fai un backup:
```bash
firebase firestore:rules:backup
```

### 2. Deploy Regole Aggiornate
```bash
firebase deploy --only firestore:rules
```

### 3. Verifica Deploy
```bash
firebase firestore:rules:list
```

## 🛡️ Configurazione Sicurezza

### 1. Verifica Autenticazione
- Accedi a [Firebase Console](https://console.firebase.google.com)
- Vai su **Authentication** > **Settings**
- Abilita **Email/Password** e **Google**
- Configura **Email verification** come obbligatoria

### 2. Configurazione Domini Autorizzati
- In **Authentication** > **Settings** > **Authorized domains**
- Aggiungi i domini di produzione:
  - `quovadiscout.github.io`
  - `quovadiscout.web.app`
  - `dicelessman.github.io`

### 3. Verifica Regole Firestore
- Vai su **Firestore Database** > **Rules**
- Verifica che le regole siano state deployate correttamente
- Testa le regole con il simulatore Firebase

## 🧪 Testing Sicurezza

### 1. Test Accesso Non Autenticato
```javascript
// Dovrebbe fallire
firebase.firestore().collection('strutture').get()
  .then(() => console.log('❌ ERRORE: Accesso non dovrebbe essere permesso'))
  .catch(() => console.log('✅ CORRETTO: Accesso negato'));
```

### 2. Test Autenticazione
```javascript
// Dopo login
firebase.auth().signInWithEmailAndPassword(email, password)
  .then(() => {
    // Ora dovrebbe funzionare
    firebase.firestore().collection('strutture').get()
      .then(() => console.log('✅ CORRETTO: Accesso permesso'))
      .catch(() => console.log('❌ ERRORE: Accesso dovrebbe essere permesso'));
  });
```

### 3. Test Email Verificata
```javascript
// Verifica che l'email sia verificata
if (firebase.auth().currentUser.emailVerified) {
  console.log('✅ Email verificata');
} else {
  console.log('❌ Email non verificata - accesso negato');
}
```

## 📊 Monitoraggio

### 1. Firebase Analytics
- Monitora tentativi di accesso non autorizzato
- Verifica pattern di utilizzo
- Controlla errori di autenticazione

### 2. Firestore Usage
- Monitora utilizzo database
- Verifica performance delle regole
- Controlla errori di permessi

## 🔧 Troubleshooting

### Problema: Regole non deployate
```bash
# Verifica stato
firebase projects:list
firebase use quovadiscout

# Deploy forzato
firebase deploy --only firestore:rules --force
```

### Problema: Accesso negato dopo login
1. Verifica che l'email sia verificata
2. Controlla domini autorizzati
3. Verifica regole Firestore

### Problema: Errori CSP
1. Aggiorna Content Security Policy in index.html
2. Verifica domini autorizzati
3. Testa in modalità incognito

## 📝 Checklist Pre-Deploy

- [ ] Firebase CLI installato e configurato
- [ ] Login Firebase effettuato
- [ ] Progetto Firebase selezionato
- [ ] Regole Firestore testate localmente
- [ ] Autenticazione configurata correttamente
- [ ] Domini autorizzati configurati
- [ ] Backup regole esistenti fatto
- [ ] Deploy regole eseguito
- [ ] Test di sicurezza completati
- [ ] Monitoraggio attivato

## 🚨 Rollback

In caso di problemi, puoi fare rollback delle regole:
```bash
# Ripristina backup
firebase firestore:rules:restore backup_file.json

# Oppure deploya regole precedenti
firebase deploy --only firestore:rules --force
```

---

**Nota**: Questo processo deve essere eseguito con attenzione per evitare di bloccare l'accesso agli utenti esistenti.
