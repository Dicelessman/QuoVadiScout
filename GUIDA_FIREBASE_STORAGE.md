# 📸 Guida Configurazione Firebase Storage per QuoVadiScout

## 🎯 Panoramica

Questa guida ti accompagnerà passo-passo nella configurazione di Firebase Storage per gestire le immagini delle strutture scout.

---

## 📋 Prerequisiti

- ✅ Progetto Firebase già creato (`quovadiscout`)
- ✅ Autenticazione Firebase attivata
- ✅ Firestore già configurato
- 🌐 Accesso alla [Console Firebase](https://console.firebase.google.com)

---

## 🚀 Passo 1: Attivare Firebase Storage

### 1.1 Accedi alla Console Firebase

1. Vai su [Firebase Console](https://console.firebase.google.com)
2. Seleziona il progetto **quovadiscout**

### 1.2 Attiva Storage

1. Nel menu laterale, clicca su **"Storage"** oppure **"Archiviazione"**
2. Clicca sul pulsante **"Inizia"** o **"Get Started"**
3. Ti verrà chiesto di scegliere le regole di sicurezza:
   - Seleziona **"Inizia in modalità di produzione"** (Production mode)
   - Le regole di sicurezza le configureremo dopo
4. Scegli la **posizione** del bucket:
   - **Consigliato per Italia**: `europe-west1` (Belgio) o `europe-west3` (Francoforte)
   - ⚠️ La posizione NON può essere cambiata dopo!
5. Clicca su **"Fine"** o **"Done"**

✅ Firebase Storage è ora attivo!

---

## 🔒 Passo 2: Configurare le Regole di Sicurezza

### 2.1 Carica le Regole

1. Nella pagina **Storage**, vai alla tab **"Rules"** o **"Regole"**
2. Vedrai un editor con le regole attuali
3. **Sostituisci** tutto il contenuto con quello del file `storage.rules`

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isValidImageType() {
      return request.resource.contentType.matches('image/.*');
    }
    
    function isValidImageSize() {
      // Max 10MB per immagine
      return request.resource.size < 10 * 1024 * 1024;
    }
    
    function isValidThumbnailSize() {
      // Max 1MB per thumbnail
      return request.resource.size < 1 * 1024 * 1024;
    }
    
    // Regole per le immagini delle strutture
    match /structures/{structureId}/images/{imageFile} {
      
      // LETTURA: Tutti gli utenti autenticati
      allow read: if isAuthenticated();
      
      // SCRITTURA: Solo utenti autenticati
      allow create: if isAuthenticated() 
                    && isValidImageType()
                    && (
                      (imageFile.matches('thumb_.*') && isValidThumbnailSize())
                      || isValidImageSize()
                    );
      
      // UPDATE: Solo utenti autenticati
      allow update: if isAuthenticated()
                    && isValidImageType()
                    && isValidImageSize();
      
      // DELETE: Solo utenti autenticati
      allow delete: if isAuthenticated();
    }
    
    // Blocca tutto il resto
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

4. Clicca su **"Pubblica"** o **"Publish"**

✅ Le regole di sicurezza sono ora attive!

### 2.2 Cosa Fanno Queste Regole

- 🔐 **Solo utenti autenticati** possono vedere/caricare/eliminare immagini
- 📁 Le immagini sono organizzate per struttura: `structures/{ID}/images/`
- 🖼️ **Solo immagini** sono permesse (JPEG, PNG, GIF, WebP, ecc.)
- 📏 **Limite dimensioni**:
  - Immagini principali: max **10 MB**
  - Thumbnail: max **1 MB**
- 🚫 Tutto il resto è bloccato per sicurezza

---

## ⚙️ Passo 3: Verificare il Bucket Storage

### 3.1 Controlla il Nome del Bucket

1. Nella pagina **Storage**, in alto vedrai il nome del tuo bucket
2. Dovrebbe essere simile a: `quovadiscout.appspot.com` o `quovadiscout.firebasestorage.app`
3. **Verifica** che questo nome corrisponda al `storageBucket` in `script.js`:

```javascript
// In script.js, linea ~51
storageBucket: "quovadiscout.firebasestorage.app",  // ← Deve corrispondere!
```

4. Se NON corrisponde, **aggiorna** il valore in `script.js`

---

## 🧪 Passo 4: Testare l'Upload

### 4.1 Test Manuale

1. Accedi alla tua app QuoVadiScout
2. Apri una struttura in **modalità modifica**
3. Scorri fino alla sezione **"Galleria Immagini"**
4. Clicca su **"Scegli file"** o **"Carica Immagini"**
5. Seleziona un'immagine dal tuo computer
6. Attendi il caricamento (vedrai un indicatore di progresso)

### 4.2 Verifica nella Console Firebase

1. Torna alla **Console Firebase** → **Storage**
2. Dovresti vedere una struttura di cartelle:
   ```
   structures/
     └── {ID_STRUTTURA}/
           └── images/
                 ├── 1234567890_foto.jpg
                 └── thumb_1234567890_foto.jpg
   ```

### 4.3 Console del Browser (F12)

Apri la **Console del Browser** (F12) e cerca questi messaggi:

✅ **Messaggi di Successo:**
```
✅ MediaManager: Firebase Storage inizializzato
📸 MediaManager: Inizio upload immagine: foto.jpg
✅ MediaManager: Upload completato: img_1234567890
✅ Immagini caricate
```

❌ **Se vedi errori:**
```
❌ MediaManager: Errore upload immagine
❌ permission-denied
```
→ Controlla le regole di sicurezza (Passo 2)

```
⚠️ MediaManager: Firebase Storage non disponibile
```
→ Controlla che Storage sia attivo (Passo 1)

---

## 📊 Passo 5: Monitorare l'Uso

### 5.1 Dashboard Storage

1. Console Firebase → **Storage** → Tab **"Utilizzo"** o **"Usage"**
2. Vedrai:
   - 📦 **Storage utilizzato** (su 5 GB gratuiti)
   - 🌐 **Banda utilizzata** (1 GB/giorno gratuito)
   - 📈 **Operazioni** (upload/download)

### 5.2 Piano Gratuito (Spark)

**Limiti inclusi:**
- 📦 **5 GB** di storage
- 🌐 **1 GB/giorno** di download
- 🚀 **20.000** upload/giorno
- ✨ **50.000** download/giorno

**Stima Capacità:**
Con compressione attuale (immagine + thumbnail):
- ~500-1000 strutture con 5-10 foto ciascuna
- Sufficiente per 100-200 utenti/giorno

---

## 🔧 Troubleshooting

### ❌ Problema: "Permission Denied"

**Causa:** Le regole di sicurezza bloccano l'accesso

**Soluzione:**
1. Verifica di essere autenticato nell'app
2. Controlla le regole in Console Firebase → Storage → Rules
3. Assicurati che le regole permettano `isAuthenticated()`

### ❌ Problema: "Storage not initialized"

**Causa:** Firebase Storage non è stato attivato o configurato

**Soluzione:**
1. Vai su Console Firebase → Storage
2. Se vedi "Inizia", attivalo (Passo 1)
3. Verifica che `storageBucket` sia corretto in `script.js`

### ❌ Problema: "Quota exceeded"

**Causa:** Hai superato i limiti gratuiti

**Soluzione:**
1. Controlla l'utilizzo in Console Firebase → Storage → Usage
2. Se hai superato 5GB:
   - Elimina immagini vecchie
   - Comprimi ulteriormente le immagini
   - Considera upgrade a piano Blaze (pay-as-you-go)

### ❌ Problema: Immagini non si caricano

**Causa:** CORS o configurazione bucket

**Soluzione:**
1. Vai su Cloud Storage nella [Google Cloud Console](https://console.cloud.google.com)
2. Seleziona il progetto `quovadiscout`
3. Clicca sul bucket Storage
4. Tab **"Permissions"** → Verifica che sia pubblicamente accessibile per utenti autenticati

---

## 🎓 Best Practices

### 📸 Ottimizzazione Immagini

Il sistema **comprime automaticamente** le immagini:
- ✅ Ridimensionate a max 1920x1080px
- ✅ Qualità JPEG: 80%
- ✅ Thumbnail: 300x300px
- ✅ Formato ottimizzato

**Se vuoi risparmiare più spazio**, modifica in `media-manager.js`:

```javascript
this.compressionQuality = 0.7;  // da 0.8 a 0.7 (più compresso)
this.thumbnailSize = 200;       // da 300 a 200 (più piccolo)
```

### 🗑️ Pulizia Periodica

Considera di eliminare immagini vecchie di strutture inattive:
```javascript
// In media-manager.js, c'è già una funzione:
await mediaManager.cleanupOldImages(30); // Elimina immagini > 30 giorni
```

### 📊 Monitoraggio

Imposta **alert** nella Console Firebase:
1. Storage → Usage → "Set up budget alerts"
2. Riceverai email quando raggiungi 80% dei limiti

---

## 🚀 Upgrade al Piano Blaze (Opzionale)

Se superi i limiti gratuiti:

### Prezzi Pay-as-you-go:
- 📦 **Storage**: $0.026/GB/mese (dopo 5GB)
- 🌐 **Download**: $0.12/GB (dopo 1GB/giorno)
- 🚀 **Operazioni**: Quasi gratis

### Come Fare Upgrade:
1. Console Firebase → ⚙️ (in alto) → "Utilizzo e fatturazione"
2. Clicca su "Modifica piano"
3. Seleziona "Piano Blaze"
4. Aggiungi metodo di pagamento

**Esempio costi reali:**
- 10 GB storage + 3 GB/giorno traffico = ~$15/mese
- 20 GB storage + 5 GB/giorno traffico = ~$30/mese

---

## ✅ Checklist Finale

Prima di considerare tutto completo:

- [ ] Firebase Storage attivato nella Console
- [ ] Regole di sicurezza pubblicate da `storage.rules`
- [ ] `storageBucket` corretto in `script.js`
- [ ] Test upload immagine funzionante
- [ ] Immagini visibili nella galleria struttura
- [ ] Console browser senza errori
- [ ] Struttura cartelle corretta in Firebase Storage
- [ ] Monitoraggio uso attivo

---

## 📞 Supporto

**Problemi?**
1. Controlla la Console del browser (F12)
2. Verifica i messaggi in Console Firebase → Storage
3. Consulta la [Documentazione Firebase Storage](https://firebase.google.com/docs/storage)

**Domande comuni già risolte:**
- ✅ Le immagini sono compresse automaticamente
- ✅ I thumbnail sono generati automaticamente
- ✅ Le vecchie immagini possono essere eliminate
- ✅ Il sistema funziona anche offline (IndexedDB fallback)

---

## 🎉 Fatto!

Firebase Storage è ora completamente configurato e funzionante! 

Le immagini delle strutture verranno:
- 📸 Caricate automaticamente su Firebase
- 🗜️ Compresse per risparmiare spazio
- 🖼️ Mostrate nella galleria delle schede
- 🔐 Protette dalle regole di sicurezza

**Buon lavoro con QuoVadiScout! 🏕️**

