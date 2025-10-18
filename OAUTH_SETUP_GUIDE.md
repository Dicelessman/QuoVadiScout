# 🔐 Guida Configurazione OAuth - QuoVadiScout

## Panoramica

Questa guida ti aiuterà a configurare l'autenticazione OAuth con Google, GitHub, Microsoft, Facebook, Twitter e Apple per QuoVadiScout.

## 🚀 Configurazione Firebase Console

### 1. Accedi a Firebase Console
1. Vai su [Firebase Console](https://console.firebase.google.com/)
2. Seleziona il progetto `quovadiscout`
3. Vai su **Authentication** > **Sign-in method**

### 2. Configura Provider OAuth

#### Google OAuth
1. **Abilita Google**: Clicca su "Google" e attiva
2. **Configurazione**:
   - Project support email: `admin@quovadiscout.com`
   - Web SDK configuration: Usa le credenziali esistenti
3. **Domini autorizzati**:
   - `quovadiscout.firebaseapp.com`
   - `localhost` (per sviluppo)

#### GitHub OAuth
1. **Abilita GitHub**: Clicca su "GitHub" e attiva
2. **Configurazione GitHub**:
   - Vai su [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
   - Crea nuova OAuth App:
     - Application name: `QuoVadiScout`
     - Homepage URL: `https://quovadiscout.firebaseapp.com`
     - Authorization callback URL: `https://quovadiscout.firebaseapp.com/__/auth/handler`
3. **Configurazione Firebase**:
   - Client ID: Copia da GitHub
   - Client Secret: Copia da GitHub

#### Microsoft OAuth
1. **Abilita Microsoft**: Clicca su "Microsoft" e attiva
2. **Configurazione Azure**:
   - Vai su [Azure Portal > App registrations](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
   - Nuova registrazione:
     - Name: `QuoVadiScout`
     - Redirect URI: `https://quovadiscout.firebaseapp.com/__/auth/handler`
3. **Configurazione Firebase**:
   - Client ID: Copia da Azure
   - Client Secret: Copia da Azure

#### Facebook OAuth
1. **Abilita Facebook**: Clicca su "Facebook" e attiva
2. **Configurazione Facebook**:
   - Vai su [Facebook Developers](https://developers.facebook.com/)
   - Crea nuova App:
     - App Name: `QuoVadiScout`
     - Valid OAuth Redirect URIs: `https://quovadiscout.firebaseapp.com/__/auth/handler`
3. **Configurazione Firebase**:
   - App ID: Copia da Facebook
   - App Secret: Copia da Facebook

#### Twitter OAuth
1. **Abilita Twitter**: Clicca su "Twitter" e attiva
2. **Configurazione Twitter**:
   - Vai su [Twitter Developer Portal](https://developer.twitter.com/)
   - Crea nuova App:
     - App Name: `QuoVadiScout`
     - Callback URL: `https://quovadiscout.firebaseapp.com/__/auth/handler`
3. **Configurazione Firebase**:
   - API Key: Copia da Twitter
   - API Secret: Copia da Twitter

#### Apple OAuth
1. **Abilita Apple**: Clicca su "Apple" e attiva
2. **Configurazione Apple**:
   - Vai su [Apple Developer Portal](https://developer.apple.com/)
   - Crea nuova App ID:
     - Bundle ID: `com.quovadiscout.web`
     - Return URL: `https://quovadiscout.firebaseapp.com/__/auth/handler`
3. **Configurazione Firebase**:
   - Services ID: Copia da Apple
   - Private Key: Carica da Apple
   - Key ID: Copia da Apple
   - Team ID: Copia da Apple

## 🔧 Configurazione Locale

### 1. Variabili d'Ambiente (opzionale)
Crea un file `.env` nella root del progetto:

```env
# Firebase Configuration
FIREBASE_API_KEY=AIzaSyDHFnQOMoaxY1d-7LRVgh7u_ioRWPDWVfI
FIREBASE_AUTH_DOMAIN=quovadiscout.firebaseapp.com
FIREBASE_PROJECT_ID=quovadiscout
FIREBASE_STORAGE_BUCKET=quovadiscout.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=745134651793
FIREBASE_APP_ID=1:745134651793:web:dabd5ae6b7b579172dc230

# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GITHUB_CLIENT_ID=your_github_client_id
MICROSOFT_CLIENT_ID=your_microsoft_client_id
FACEBOOK_APP_ID=your_facebook_app_id
TWITTER_API_KEY=your_twitter_api_key
APPLE_SERVICES_ID=your_apple_services_id
```

### 2. Configurazione oauth-config.js
Il file `oauth-config.js` contiene la configurazione dei provider. Puoi modificarlo per:

- Abilitare/disabilitare provider specifici
- Modificare l'ordine dei provider
- Configurare scopes personalizzati
- Aggiungere provider personalizzati

## 🧪 Testing

### 1. Test Provider Individuali
```javascript
// Test login Google
await loginWithGoogle();

// Test login GitHub
await loginWithGithub();

// Test login Microsoft
await loginWithMicrosoft();
```

### 2. Test Configurazione
```javascript
// Verifica configurazione
const validation = OAuthConfig.utils.validateConfig();
console.log('Configurazione valida:', validation.valid);
console.log('Errori:', validation.errors);
```

### 3. Test Provider Abilitati
```javascript
// Lista provider abilitati
const enabledProviders = getEnabledOAuthProviders();
console.log('Provider abilitati:', enabledProviders);
```

## 🛠️ Risoluzione Problemi

### Problemi Comuni

#### 1. Popup Bloccato
**Problema**: Popup OAuth bloccato dal browser
**Soluzione**: 
- Aggiungi il dominio alla lista dei siti consentiti
- Usa `signInWithRedirect` invece di `signInWithPopup`

#### 2. Redirect URI Non Valido
**Problema**: "Invalid redirect URI" error
**Soluzione**:
- Verifica che l'URI sia esatto: `https://quovadiscout.firebaseapp.com/__/auth/handler`
- Aggiungi domini autorizzati in Firebase Console

#### 3. Client Secret Errato
**Problema**: "Invalid client secret" error
**Soluzione**:
- Verifica che il client secret sia corretto
- Rigenera il client secret se necessario

#### 4. Scope Non Autorizzato
**Problema**: "Invalid scope" error
**Soluzione**:
- Verifica gli scope configurati nel provider
- Rimuovi scope non necessari

### Debug Mode
Attiva il debug mode modificando `config.js`:

```javascript
const AppConfig = {
  debug: {
    logging: {
      level: 'debug' // Cambia da 'info' a 'debug'
    }
  }
};
```

## 📱 Configurazione Mobile

### PWA Configuration
Per supportare OAuth in PWA:

1. **Manifest.json**: Aggiungi provider URLs
2. **Service Worker**: Gestisci redirect OAuth
3. **Deep Links**: Configura per app mobile

### App Mobile (futuro)
Per app mobile native:

1. **React Native**: Usa `@react-native-firebase/auth`
2. **Flutter**: Usa `firebase_auth` plugin
3. **Ionic**: Usa `@capacitor-community/firebase-auth`

## 🔒 Sicurezza

### Best Practices

1. **HTTPS Only**: Usa sempre HTTPS in produzione
2. **Domain Validation**: Valida domini autorizzati
3. **Scope Minimization**: Usa solo scope necessari
4. **Token Refresh**: Implementa refresh automatico
5. **Logout**: Implementa logout completo

### Monitoring
Monitora l'autenticazione con:

1. **Firebase Analytics**: Eventi di login/logout
2. **Error Tracking**: Errori di autenticazione
3. **Security Rules**: Regole di sicurezza Firestore

## 📚 Risorse Utili

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [OAuth 2.0 Specification](https://tools.ietf.org/html/rfc6749)
- [Google OAuth Guide](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Guide](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Microsoft OAuth Guide](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)

## 🆘 Supporto

Per problemi o domande:

1. **Issues GitHub**: Apri un issue nel repository
2. **Firebase Support**: Usa il supporto Firebase
3. **Community**: Partecipa alla community

---

**Nota**: Questa configurazione è per l'ambiente di sviluppo. Per produzione, usa credenziali dedicate e configurazioni specifiche.
