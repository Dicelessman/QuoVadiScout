# 🔒 Guida Implementazione Firebase Security Rules

**Priorità**: 🔴 **CRITICA**  
**Tempo richiesto**: 15 minuti  
**Difficoltà**: Facile

---

## 🎯 Obiettivo

Implementare regole di sicurezza lato server per proteggere i dati da accessi non autorizzati.

---

## 📋 Requisiti

- ✅ Account Firebase con progetto attivo
- ✅ Accesso alla console Firebase
- ✅ Conoscenza base della struttura dati

---

## 🚀 Procedura Passo-Passo

### Passo 1: Accedi a Firebase Console

1. Vai su: https://console.firebase.google.com
2. **Accedi** con il tuo account Google
3. Seleziona il progetto: **quovadiscout**

### Passo 2: Apri Firestore Database

1. Nel menu sinistro, clicca su **Firestore Database**
2. Se non hai ancora Firestore, clicca su **Create database**
3. Scegli modalità di avvio: **Start in production mode**
4. Seleziona la **località** più vicina (es: europe-west)

### Passo 3: Vai alle Security Rules

1. Nel tab superiore, clicca su **Rules**
2. Vedrai l'editor delle regole

### Passo 4: Sostituisci le Regole

**RIMUOVI** le regole esistenti (che permettono accesso pubblico):

```javascript
// ⚠️ ATTENZIONE: Queste regole sono INSICURE! Vanno sostituite.
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**SOSTITUISCI** con queste regole sicure:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ============================================
    // COLLEZIONE: strutture
    // ============================================
    match /strutture/{structureId} {
      // Lettura: Solo utenti autenticati
      allow read: if request.auth != null;
      
      // Scrittura: Solo utenti autenticati
      allow write: if request.auth != null;
      
      // Documento specifico
      allow get: if request.auth != null;
      allow list: if request.auth != null;
    }
    
    // ============================================
    // COLLEZIONE: users
    // ============================================
    match /users/{userId} {
      // Lettura: Solo il proprio profilo
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Scrittura: Solo il proprio profilo
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // ============================================
    // COLLEZIONE: userLists (elenchi personali)
    // ============================================
    match /userLists/{listId} {
      // Lettura: Solo il proprietario
      allow read: if request.auth != null && 
                    resource.data.userId == request.auth.uid;
      
      // Scrittura: Solo il proprietario
      allow write: if request.auth != null && 
                     request.resource.data.userId == request.auth.uid;
    }
    
    // ============================================
    // COLLEZIONE: activityLog (log attività)
    // ============================================
    match /activityLog/{logId} {
      // Solo utenti autenticati possono leggere i propri log
      allow read: if request.auth != null && 
                    resource.data.userId == request.auth.uid;
      
      // Solo utenti autenticati possono creare log
      allow create: if request.auth != null && 
                      request.resource.data.userId == request.auth.uid;
      
      // Nessuno può modificare o eliminare i log
      allow update, delete: if false;
    }
    
    // ============================================
    // COLLEZIONE: structureVersions (versioni strutture)
    // ============================================
    match /structureVersions/{versionId} {
      // Solo utenti autenticati possono leggere
      allow read: if request.auth != null;
      
      // Solo utenti autenticati possono creare versioni
      allow create: if request.auth != null;
      
      // Nessuno può modificare o eliminare versioni
      allow update, delete: if false;
    }
    
    // ============================================
    // BLOCCO DEFAULT: Tutto il resto negato
    // ============================================
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Passo 5: Pubblica le Regole

1. Clicca su **Publish** (in alto a destra)
2. Conferma il publish quando richiesto
3. Attendi qualche secondo per l'applicazione

### Passo 6: Verifica le Regole

1. Torna alla console Firestore
2. Prova ad accedere alle strutture da una scheda anonima
3. Dovresti vedere: **"Missing or insufficient permissions"**

---

## 🧪 Test di Verifica

### Test 1: Login Necessario

1. **Apri l'app** senza login
2. **Prova a caricare le strutture**
3. **Risultato atteso**: Error "Missing or insufficient permissions"

### Test 2: Login Funzionante

1. **Fai login** nell'app
2. **Carica le strutture**
3. **Risultato atteso**: Strutture caricate correttamente

### Test 3: Modifica Dati

1. **Loggato**, prova a modificare una struttura
2. **Risultato atteso**: Modifica riuscita

### Test 4: Tentativo Bypass

1. **Console browser** (F12)
2. **Esegui**: `document.getElementById('loginScreen').style.display = 'none'`
3. **Prova a caricare strutture**
4. **Risultato atteso**: Firebase rifiuta con error

---

## ⚠️ Possibili Problemi

### Problema 1: "Missing or insufficient permissions"

**Causa**: Le regole sono troppo restrittive o l'utente non è autenticato.

**Soluzione**: 
- Verifica che l'utente sia loggato
- Controlla che le regole siano pubblicate

### Problema 2: App non carica dati

**Causa**: Regole bloccano l'accesso

**Soluzione**:
- Verifica di essere autenticato
- Controlla i log in console Firebase

### Problema 3: Modifiche non salvate

**Causa**: Regole non permettono scrittura

**Soluzione**:
- Verifica che `allow write: if request.auth != null;` sia presente
- Controlla che l'utente sia autenticato

---

## 📊 Regole per Ambiente

### Ambiente di Sviluppo (Opzionale)

Se vuoi permettere accesso pubblico per sviluppo locale:

```javascript
// ⚠️ SOLO PER SVILUPPO LOCALE!
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // ⚠️ PERMETTERE TUTTO
    }
  }
}
```

**⚠️ IMPORTANTE**: Ricorda di ripristinare le regole sicure prima di mettere in produzione!

### Ambiente di Produzione

Usa sempre le regole sicure fornite sopra.

---

## 🔐 Livelli di Sicurezza

### Livello 1: Accesso Pubblico (INSICURO)
```javascript
allow read, write: if true;
```
**❌ NON USARE IN PRODUZIONE**

### Livello 2: Autenticazione Richiesta (BASICO)
```javascript
allow read, write: if request.auth != null;
```
**✅ Minimo richiesto**

### Livello 3: Proprietà Verificata (SICURO)
```javascript
allow read: if request.auth != null && 
              resource.data.userId == request.auth.uid;
```
**✅ Raccomandato per dati sensibili**

### Livello 4: Proprietà e Validazione (ALTO)
```javascript
allow write: if request.auth != null && 
               request.resource.data.userId == request.auth.uid &&
               request.resource.data.validate();
```
**✅ Massima sicurezza**

---

## 📋 Checklist Implementazione

- [ ] Accedi a Firebase Console
- [ ] Apri Firestore Database
- [ ] Vai su Rules
- [ ] Copia regole sicure fornite
- [ ] Incolla nell'editor
- [ ] Clicca Publish
- [ ] Conferma pubblicazione
- [ ] Testa accesso senza login (deve fallire)
- [ ] Testa accesso con login (deve funzionare)
- [ ] Verifica log Firebase per errori

---

## 🎯 Risultato Atteso

Dopo l'implementazione:

- ✅ Solo utenti autenticati possono leggere strutture
- ✅ Solo utenti autenticati possono modificare strutture
- ✅ Ogni utente può accedere solo ai propri dati personali
- ✅ Nessun bypass del login possibile tramite Firebase
- ✅ Sicurezza completa sia client che server

---

## 📞 Supporto

Se hai problemi nell'implementazione:

1. **Verifica log Firebase Console** > Firestore > Usage
2. **Controlla errori** nella console browser
3. **Rivedi le regole** per eventuali errori di sintassi

**Contatti**:
- Email: davide.rossi@cngei.it
- WhatsApp: 388 818 2045

---

## 🎉 Conclusione

Le Firebase Security Rules sono **fondamentali** per la sicurezza dell'applicazione. Senza di esse, tutto il codice client-side può essere bypassato.

**Con le regole implementate**, hai:
- ✅ Sicurezza server-side completa
- ✅ Protezione contro accessi non autorizzati
- ✅ Controllo granulare per ogni collezione
- ✅ Preparazione per scalabilità

---

*Guida creata il 19 Dicembre 2024*  
*QuoVadiScout v1.3.0*

