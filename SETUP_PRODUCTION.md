# 🚀 Setup Produzione QuoVadiScout

## 📋 Panoramica

Per utilizzare QuoVadiScout in produzione, è necessario configurare il file `firebase-config.js` con le tue credenziali Firebase reali.

## 🔧 Configurazione Firebase

### 1. Crea il file di configurazione

```bash
# Copia il template
cp firebase-config.template.js firebase-config.js
```

### 2. Configura le credenziali

Apri `firebase-config.js` e sostituisci i placeholder con le tue credenziali Firebase:

```javascript
const FirebaseConfig = {
  apiKey: "TUA_API_KEY_REALE",
  authDomain: "tuo-progetto.firebaseapp.com",
  projectId: "tuo-progetto",
  storageBucket: "tuo-progetto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  vapidKey: "TUA_VAPID_KEY_REALE"
};
```

### 3. Deploy delle regole Firestore

```bash
# Assicurati di essere autenticato
firebase login

# Seleziona il progetto
firebase use tuo-progetto

# Deploy delle regole
firebase deploy --only firestore:rules
```

## 🔒 Sicurezza

### File Sensibili

⚠️ **IMPORTANTE**: Il file `firebase-config.js` contiene credenziali sensibili e NON deve essere committato nel repository.

Il file è già escluso dal `.gitignore`, ma assicurati di:
- Non committare mai il file `firebase-config.js`
- Non condividere le credenziali Firebase
- Usare domini autorizzati in Firebase Console

### Domini Autorizzati

In Firebase Console, vai su **Authentication > Settings > Authorized domains** e aggiungi:
- `tuo-dominio.com`
- `tuo-dominio.github.io`
- `localhost` (per sviluppo)

## 🧪 Testing

### 1. Test GitHub Pages

L'applicazione è configurata per funzionare su GitHub Pages. Per testare:

1. **Push delle modifiche**:
   ```bash
   git add .
   git commit -m "Aggiornamenti sicurezza"
   git push origin main
   ```

2. **Verifica su GitHub Pages**:
   - Vai su `https://tuo-username.github.io/QuoVadiScout`
   - Verifica che l'applicazione si carichi correttamente
   - Testa la schermata di login

### 2. Test produzione

1. Deploy su GitHub Pages o hosting provider
2. Verifica che l'applicazione si carichi correttamente
3. Testa login e registrazione
4. Verifica che i dati siano protetti

## 🚨 Troubleshooting

### Problema: Pagina bianca

**Soluzione**: Verifica che il file `firebase-config.js` sia presente e configurato correttamente.

### Problema: Errori di autenticazione

**Soluzione**: 
1. Verifica che l'autenticazione sia abilitata in Firebase Console
2. Controlla che i domini siano autorizzati
3. Verifica che le regole Firestore siano deployate

### Problema: Accesso negato ai dati

**Soluzione**:
1. Verifica che l'utente sia autenticato
2. Controlla che l'email sia verificata
3. Verifica che le regole Firestore siano corrette

## 📚 Risorse

- [Firebase Console](https://console.firebase.google.com)
- [Documentazione Firebase](https://firebase.google.com/docs)
- [Guida Sicurezza](SECURITY.md)
- [README](README.md)

## 🎯 Checklist Pre-Deploy

- [ ] File `firebase-config.js` configurato con credenziali reali
- [ ] Domini autorizzati configurati in Firebase Console
- [ ] Regole Firestore deployate
- [ ] Autenticazione abilitata e configurata
- [ ] Test di funzionamento completati
- [ ] File sensibili esclusi dal repository

---

**Nota**: Questo file è solo per la configurazione di produzione. Per sviluppo locale, l'applicazione funziona con la configurazione fallback integrata.
