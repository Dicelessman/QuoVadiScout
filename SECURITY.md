# 🔒 Guida Sicurezza QuoVadiScout

## Panoramica Sicurezza

QuoVadiScout implementa un sistema di sicurezza multi-livello per proteggere i dati degli utenti e prevenire accessi non autorizzati.

## 🔐 Sistema di Autenticazione

### Accesso Completamente Privato
- **Nessun accesso pubblico**: Tutti i dati richiedono autenticazione
- **Email verificata obbligatoria**: Solo utenti con email verificata possono accedere
- **Session timeout automatico**: Disconnessione automatica dopo inattività
- **Rate limiting**: Protezione contro attacchi brute force

### Metodi di Autenticazione
- Email e password con validazione robusta
- Google OAuth 2.0
- Validazione password con criteri di sicurezza

## 🛡️ Protezione Database (Firestore)

### Regole di Sicurezza
- **Accesso privato**: Tutte le collezioni richiedono autenticazione
- **Validazione email**: Verifica `email_verified` per tutte le operazioni
- **Controllo proprietà**: Utenti possono accedere solo ai propri dati
- **Immutabilità log**: I log di attività non possono essere modificati

### Collezioni Protette
- `strutture`: Accesso solo per utenti autenticati con email verificata
- `users`: Solo il proprio profilo utente
- `userLists`: Solo le proprie liste personali
- `activityLog`: Solo i propri log di attività
- `user_filters`: Solo i propri filtri salvati

## 🔒 Gestione Credenziali

### Configurazione Sicura
- **Credenziali dinamiche**: Caricamento da `firebase-config.js` (escluso dal repository)
- **Validazione domini**: Controllo domini autorizzati
- **VAPID Key protetta**: Chiavi push notification in file separato

### File di Configurazione
- `firebase-config.js`: Configurazione produzione (NON committare)
- `firebase-config.template.js`: Template per sviluppatori
- `.gitignore`: Esclusione automatica file sensibili

## 🛡️ Sicurezza Lato Client

### Validazione Input
- **Sanitizzazione HTML**: Rimozione tag pericolosi e script
- **Validazione formato**: Email, URL, numeri di telefono
- **Limiti lunghezza**: Controllo dimensioni campi
- **Escape caratteri**: Prevenzione XSS

### Content Security Policy
- **Restrizione script**: Solo origini autorizzate
- **Blocco inline**: Prevenzione esecuzione codice non autorizzato
- **CORS controllato**: Accesso limitato a domini Firebase

## 📋 Checklist Sicurezza Pre-Deployment

### ✅ Configurazione Firebase
- [ ] Creare `firebase-config.js` con credenziali corrette
- [ ] Verificare domini autorizzati in configurazione
- [ ] Testare autenticazione email/password e Google OAuth
- [ ] Validare regole Firestore in Firebase Console

### ✅ Sicurezza Database
- [ ] Deploy regole Firestore aggiornate
- [ ] Testare accesso negato per utenti non autenticati
- [ ] Verificare controllo proprietà dati utente
- [ ] Validare immutabilità log attività

### ✅ Configurazione Client
- [ ] Verificare CSP non blocca funzionalità
- [ ] Testare validazione input in tutti i form
- [ ] Controllare sanitizzazione dati utente
- [ ] Validare rate limiting funzionante

### ✅ Testing Sicurezza
- [ ] Testare tentativi di accesso non autorizzato
- [ ] Verificare protezione contro XSS
- [ ] Testare validazione email verificata
- [ ] Controllare timeout sessione

## 🚨 Gestione Incidenti

### In Caso di Violazione Sicurezza
1. **Immediato**: Disconnettere utenti compromessi
2. **Analisi**: Verificare log attività Firebase
3. **Contenimento**: Aggiornare regole Firestore se necessario
4. **Comunicazione**: Notificare utenti interessati
5. **Prevenzione**: Aggiornare misure di sicurezza

### Monitoraggio
- Log attività utente in Firestore
- Analytics Firebase per pattern anomali
- Monitoraggio tentativi login falliti
- Tracking modifiche strutture

## 🔧 Configurazione Sviluppo

### Setup Locale
1. Copiare `firebase-config.template.js` come `firebase-config.js`
2. Inserire credenziali Firebase di sviluppo
3. Configurare domini localhost autorizzati
4. Testare autenticazione locale

### Variabili d'Ambiente (Raccomandato per Produzione)
```bash
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_domain
FIREBASE_PROJECT_ID=your_project_id
# ... altre credenziali
```

## 📞 Supporto Sicurezza

Per segnalazioni di vulnerabilità o problemi di sicurezza:
- Email: [contatto sicurezza]
- Descrizione dettagliata del problema
- Steps per riprodurre (se applicabile)
- Impatto potenziale stimato

## 📚 Risorse Aggiuntive

- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Firebase Auth Security](https://firebase.google.com/docs/auth/security)

---

**Ultima revisione**: Dicembre 2024  
**Versione**: 1.3.0  
**Responsabile Sicurezza**: Team QuoVadiScout
