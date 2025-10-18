# Sicurezza QuoVadiScout

## Architettura di Sicurezza

### Livelli di Protezione

1. **Firestore Security Rules** - Validazione database-side
2. **Cloud Functions** - API backend con validazione token
3. **Client Security Layer** - Validazione token frontend
4. **Security Monitor** - Rilevamento attività sospette

### Protezioni Implementate

- ✅ Validazione token JWT su ogni operazione
- ✅ Rate limiting (10 crea/min, 50 update/min, 5 delete/min)
- ✅ Audit logging di tutte le operazioni
- ✅ Versioning automatico modifiche
- ✅ Monitoring attività sospette
- ✅ Validazione input server-side
- ✅ Controlli autorizzazione granulari
- ✅ Token refresh automatico
- ✅ Logout forzato per violazioni sicurezza

## Configurazione Firebase

### 1. Firestore Security Rules

Le regole proteggono il database anche se il JavaScript frontend viene bypassato:

```javascript
// Solo utenti autenticati possono leggere
allow read: if isAuthenticated();

// Solo creatore o admin possono modificare
allow update: if isStructureCreator() || hasRole('admin');

// Validazione dati obbligatori
allow create: if request.resource.data.Struttura is string
  && request.resource.data.Struttura.size() > 0;
```

### 2. Cloud Functions

API backend che validano ogni richiesta:

- **Token Validation**: Verifica JWT con Firebase Admin SDK
- **Rate Limiting**: Previene abusi e attacchi DDoS
- **Permission Checks**: Controlla permessi utente per ogni operazione
- **Audit Logging**: Registra tutte le operazioni per sicurezza

### 3. Client Security Layer

Validazione aggiuntiva lato client:

- **Token Refresh**: Rinnova automaticamente token scaduti
- **Secure API Calls**: Tutte le operazioni CRUD passano per API sicure
- **Error Handling**: Gestione robusta degli errori di autenticazione

## Vulnerabilità Risolte

### ❌ Bypass Autenticazione Frontend

**Problema**: Un attaccante poteva bypassare l'autenticazione con:
```javascript
// Console browser
window.utenteCorrente = {uid: 'fake-id'};
caricaStrutture(); // Funzionava senza login!
```

**Soluzione**: 
- Firestore Rules bloccano accesso non autorizzato
- Cloud Functions validano ogni operazione
- Security Monitor rileva manipolazioni

### ❌ Accesso Diretto Database

**Problema**: Chiamate dirette a Firestore bypassavano controlli:
```javascript
// Console browser
await addDoc(collection(db, "strutture"), fakeData);
```

**Soluzione**:
- Security Rules impediscono scrittura non autorizzata
- Tutte le operazioni passano per API sicure
- Rate limiting previene spam

### ❌ Manipolazione Cache

**Problema**: Attaccante poteva corrompere cache locale:
```javascript
// Console browser
localStorage.setItem('strutture_cache', JSON.stringify(fakeData));
```

**Soluzione**:
- Security Monitor rileva manipolazioni
- Cache viene validata e pulita automaticamente
- Token validation su ogni operazione

## Come Testare la Sicurezza

### Test 1: Validazione Token

```javascript
// Console browser
await window.securityClient.validateToken();
// Dovrebbe restituire informazioni utente o errore se non autenticato
```

### Test 2: Tentativo Bypass

```javascript
// Console browser - Dovrebbe fallire
window.utenteCorrente = {uid: 'fake-id'};
caricaStrutture();
// Risultato atteso: "Sessione scaduta. Effettua nuovamente il login."
```

### Test 3: Creazione Struttura Non Autorizzata

```javascript
// Console browser - Dovrebbe fallire
await window.securityClient.createStructure({Struttura: 'Test'});
// Risultato atteso: Errore di autenticazione
```

### Test 4: Monitor Sicurezza

```javascript
// Console browser
window.testSecurity();
// Mostra stato del sistema di monitoraggio
```

### Test 5: Simulazione Attacco

```javascript
// Console browser - Dovrebbe essere rilevato
window.simulateSecurityTest();
// Risultato atteso: Attività sospetta registrata
```

## Deploy e Configurazione

### Comandi Deploy

```bash
# 1. Deploy Firestore Rules (CRITICO)
firebase deploy --only firestore:rules

# 2. Deploy Cloud Functions
cd functions
npm install
cd ..
firebase deploy --only functions

# 3. Verifica deploy
firebase functions:log
```

### Configurazione Firebase Console

1. **Authentication**:
   - Abilita provider OAuth desiderati
   - Configura domini autorizzati
   - Imposta scadenze token

2. **Firestore**:
   - Verifica deploy delle Security Rules
   - Controlla indici necessari
   - Monitora log di accesso

3. **Functions**:
   - Verifica deploy delle Cloud Functions
   - Monitora metriche performance
   - Controlla log errori

## Monitoraggio e Manutenzione

### Log da Monitorare

1. **Firebase Console > Functions > Logs**
   - Errori di validazione token
   - Tentativi di accesso non autorizzato
   - Rate limiting attivato

2. **Firebase Console > Firestore > Usage**
   - Operazioni di lettura/scrittura
   - Errori Security Rules
   - Utilizzo quota

3. **Browser Console**
   - Attività sospette rilevate
   - Errori di autenticazione
   - Token refresh

### Manutenzione Periodica

- **Settimanale**: Controlla log incidenti sicurezza
- **Mensile**: Aggiorna dipendenze Cloud Functions
- **Trimestrale**: Review Security Rules e permessi
- **Annuale**: Audit completo sistema sicurezza

## Risoluzione Problemi

### Problema: "Token non valido"

**Cause possibili**:
- Token scaduto
- Utente disconnesso
- Manipolazione token

**Soluzione**:
```javascript
// Forza refresh token
await auth.currentUser.getIdToken(true);
// Oppure logout e re-login
await logoutUser();
```

### Problema: "Troppi tentativi"

**Cause possibili**:
- Rate limiting attivato
- Operazioni troppo frequenti
- Bug nel codice

**Soluzione**:
- Aspetta il reset del rate limit
- Controlla log per operazioni sospette
- Verifica implementazione API calls

### Problema: "Non autorizzato"

**Cause possibili**:
- Permessi insufficienti
- Struttura non trovata
- Utente non creatore

**Soluzione**:
- Verifica permessi utente
- Controlla ownership struttura
- Contatta admin se necessario

## Best Practices

### Per Sviluppatori

1. **Sempre validare token** prima di operazioni critiche
2. **Usare API sicure** invece di chiamate Firestore dirette
3. **Gestire errori** di autenticazione appropriatamente
4. **Testare bypass** regolarmente per verificare sicurezza

### Per Amministratori

1. **Monitorare log** regolarmente per attività sospette
2. **Aggiornare Security Rules** secondo necessità
3. **Gestire ruoli utente** appropriatamente
4. **Backup regolari** di configurazioni sicurezza

### Per Utenti

1. **Non condividere** credenziali di accesso
2. **Logout appropriato** quando si finisce di usare l'app
3. **Segnalare** comportamenti sospetti
4. **Aggiornare browser** per sicurezza

## Contatti Sicurezza

Per problemi di sicurezza o segnalazioni:

- **Email**: security@quovadiscout.com
- **Urgente**: Contatta amministratore sistema
- **Bug**: Apri issue su repository GitHub

## Changelog Sicurezza

### v1.0.0 (2024-12-19)
- ✅ Implementazione Security Rules
- ✅ Cloud Functions con validazione token
- ✅ Security Client per validazione frontend
- ✅ Security Monitor per rilevamento attacchi
- ✅ Rate limiting e audit logging
- ✅ Documentazione completa sicurezza

---

**⚠️ IMPORTANTE**: Questo documento contiene informazioni sensibili sulla sicurezza del sistema. Non condividere pubblicamente e aggiorna regolarmente secondo le best practices.
