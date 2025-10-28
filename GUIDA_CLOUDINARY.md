# 📸 Guida Completa Cloudinary per QuoVadiScout

## 🎯 Panoramica

Cloudinary è il servizio di gestione immagini per QuoVadiScout, scelto per:
- ✅ **25 GB** storage gratuito (vs 5GB Firebase)
- ✅ **25 GB/mese** bandwidth gratuito
- ✅ Ottimizzazione automatica immagini
- ✅ Trasformazioni on-the-fly
- ✅ CDN globale veloce

---

## 🚀 PARTE 1: Configurazione Account

### Passo 1: Registrazione

1. Vai su: [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Compila il form:
   - **Nome** e **Cognome**
   - **Email** (usa email principale)
   - **Password** (scegli password sicura)
3. Accetta termini e condizioni
4. Clicca **"Create Account"**

### Passo 2: Verifica Email

1. Controlla la tua casella email
2. Apri l'email di Cloudinary
3. Clicca sul **link di verifica**

### Passo 3: Completa Profilo

Cloudinary ti farà alcune domande:

1. **"How do you plan to use Cloudinary?"**
   - Seleziona: **"Developer/Technical Integration"**

2. **"What type of media do you work with?"**
   - Seleziona: **"Images"**

3. **"What's your primary use case?"**
   - Seleziona: **"Web Application"**

4. Clicca **"Continue"** o **"Next"**

---

## 🔑 PARTE 2: Ottieni Credenziali

### Passo 1: Dashboard

1. Dopo il login, vai sulla **Dashboard** (menu laterale)
2. In alto vedrai la sezione:
   - **"Account Details"** oppure
   - **"Product Environment Credentials"**

### Passo 2: Copia Credenziali

Vedrai questi tre valori (COPIALI TUTTI):

```
Cloud Name: dxxxxxxxxx
API Key: 123456789012345
API Secret: AbCdEfGhIjKlMnOpQrStUvWxYz1234
```

**📋 IMPORTANTE:** Conservali in un posto sicuro, ti serviranno subito!

---

## ⚙️ PARTE 3: Crea Upload Preset

L'Upload Preset permette di caricare immagini senza esporre l'API Secret.

### Passo 1: Vai su Settings

1. Clicca sull'icona **⚙️** in alto a destra
2. Seleziona **"Upload"** nel menu laterale
3. Scorri fino alla sezione **"Upload presets"**

### Passo 2: Aggiungi Preset

1. Clicca sul pulsante **"Add upload preset"** (in alto a destra)
2. Compila il form:

**Nome Preset:**
```
quovadiscout_preset
```

**Signing Mode:**
- Seleziona: **"Unsigned"** ⚠️ IMPORTANTE!

**Folder (opzionale ma consigliato):**
```
quovadiscout/structures
```

**Altre impostazioni (opzionali):**
- **Overwrite**: NO (lascia spuntato)
- **Unique filename**: YES (spunta)
- **Use filename**: NO

3. Clicca **"Save"** in alto

✅ Preset creato! Ora puoi caricare immagini senza API Secret.

---

## 💻 PARTE 4: Configura il Codice

### Passo 1: Crea il File di Configurazione

1. Nella cartella del progetto, **copia** il file:
   ```
   cloudinary-config.template.js
   ```
   
2. **Rinominalo** in:
   ```
   cloudinary-config.js
   ```

### Passo 2: Inserisci le Credenziali

Apri `cloudinary-config.js` e modifica:

```javascript
window.CloudinaryConfig = {
  // Sostituisci con il tuo Cloud Name
  cloudName: 'dxxxxxxxxx',  // ← CAMBIA QUESTO
  
  // Sostituisci con la tua API Key
  apiKey: '123456789012345',  // ← CAMBIA QUESTO
  
  // API Secret (NON usato lato client, ma può servire server-side)
  apiSecret: 'YOUR_API_SECRET',  // ← Opzionale
  
  // Nome del preset che hai creato
  uploadPreset: 'quovadiscout_preset',  // ← Se hai usato nome diverso, cambialo
  
  // Cartella (deve corrispondere a quella nel preset)
  folder: 'quovadiscout/structures',
  
  // Resto della configurazione (lascia così)
  secure: true,
  // ...
};
```

**Esempio con valori reali:**
```javascript
cloudName: 'dh4k8x7yz',  // ← Il tuo Cloud Name
apiKey: '951753628401234',  // ← La tua API Key
uploadPreset: 'quovadiscout_preset',
```

### Passo 3: Aggiungi al .gitignore

⚠️ **IMPORTANTE PER SICUREZZA!**

Apri il file `.gitignore` e aggiungi:

```
# Configurazione Cloudinary (credenziali private)
cloudinary-config.js
```

Questo impedisce di caricare le tue credenziali su GitHub.

### Passo 4: Carica il Template

Il file `cloudinary-config.template.js` **VA caricato** su GitHub come esempio.

---

## 🧪 PARTE 5: Test Upload

### Test 1: Verifica Configurazione

1. Apri la tua app QuoVadiScout
2. Apri la **Console del Browser** (F12)
3. Nella console, scrivi:

```javascript
window.mediaManager.cloudinaryConfig
```

Dovresti vedere:
```javascript
✅ Configurazione Cloudinary valida: {
  cloudName: "dxxxxxxxxx",
  apiKey: "12345...",
  uploadPreset: "quovadiscout_preset"
}
```

### Test 2: Carica un'Immagine

1. Accedi all'app (fai login)
2. Apri una struttura
3. Clicca **"Modifica"**
4. Scorri fino a **"Galleria Immagini"**
5. Clicca **"Scegli file"** o **"Carica Immagini"**
6. Seleziona un'immagine piccola (per test)
7. Attendi...

**Nella Console vedrai:**
```
📸 MediaManager: Inizio upload immagine: test.jpg
📤 Uploading a Cloudinary...
✅ MediaManager: Upload Cloudinary completato: img_1234567890
```

### Test 3: Verifica su Cloudinary

1. Vai su [Cloudinary Console](https://console.cloudinary.com)
2. Menu laterale → **"Media Library"**
3. Naviga in: `quovadiscout/structures/{ID_STRUTTURA}/`
4. Dovresti vedere la tua immagine! ✅

---

## 📊 PARTE 6: Monitora l'Uso

### Dashboard Usage

1. **Cloudinary Console** → **"Dashboard"**
2. Vedrai i **"Usage Statistics"**:
   - 📦 **Storage**: X GB / 25 GB
   - 🌐 **Bandwidth**: X GB / 25 GB/mese
   - 📈 **Transformations**: X / 25,000/mese

### Limiti Piano Gratuito

| Risorsa | Limite Gratuito |
|---------|-----------------|
| Storage | **25 GB** |
| Bandwidth | **25 GB/mese** |
| Transformations | **25,000/mese** |
| Immagini gestite | ~5,000-10,000 |
| Upload | Illimitati |

**Stima Capacità:**
- ~2000-3000 strutture con 5-10 foto ciascuna
- Sufficiente per 500-1000 utenti/giorno

### Impostare Alert

1. Dashboard → ⚙️ **Settings** → **"Plan and Billing"**
2. Sezione **"Email notifications"**
3. Attiva:
   - ✅ **"Usage alert at 80%"**
   - ✅ **"Usage alert at 100%"**

---

## 🔧 PARTE 7: Troubleshooting

### ❌ Errore: "Upload preset not found"

**Causa:** Preset non creato o nome errato

**Soluzione:**
1. Vai su Cloudinary Console → Settings → Upload
2. Verifica che esista un preset chiamato `quovadiscout_preset`
3. Controlla che sia **"Unsigned"**
4. Se nome diverso, aggiorna `cloudinary-config.js`

### ❌ Errore: "Invalid API credentials"

**Causa:** Cloud Name o API Key errati

**Soluzione:**
1. Vai su Cloudinary Dashboard
2. Copia di nuovo **Cloud Name** e **API Key**
3. Aggiorna `cloudinary-config.js`
4. Ricarica la pagina (Ctrl+F5)

### ❌ Errore: "CORS policy"

**Causa:** Dominio non autorizzato

**Soluzione:**
1. Cloudinary Console → Settings → **"Security"**
2. Sezione **"Allowed fetch domains"**
3. Aggiungi i tuoi domini:
   ```
   localhost
   127.0.0.1
   dicelessman.github.io
   ```
4. Salva

### ❌ Immagini non si caricano nella galleria

**Causa:** IndexedDB non salva riferimenti

**Soluzione:**
1. Console Browser (F12) → Tab **"Application"**
2. Sezione **"IndexedDB"** → `QuoVadiScoutDB`
3. Verifica che esista la tabella **"images"**
4. Se non esiste, ricarica la pagina e riprova

### ⚠️ Immagini caricate ma non visibili

**Causa:** Trasformazioni Cloudinary non applicate

**Soluzione:**
Verifica URL immagine nella console:
```javascript
// URL corretto (con trasformazioni):
https://res.cloudinary.com/xxx/image/upload/w_300,h_300,.../xxx.jpg

// URL errato (senza trasformazioni):
https://res.cloudinary.com/xxx/image/upload/xxx.jpg
```

Se mancano trasformazioni, verifica `media-manager.js` righe 107-110.

---

## 🎓 PARTE 8: Ottimizzazione

### Ridurre Uso Storage

Se ti avvicini al limite di 25GB:

1. **Riduci qualità compressione** in `media-manager.js`:
```javascript
this.compressionQuality = 0.7;  // Da 0.8 a 0.7
```

2. **Riduci dimensioni massime**:
```javascript
this.maxWidth = 1600;  // Da 1920 a 1600
this.maxHeight = 900;  // Da 1080 a 900
```

### Trasformazioni Automatiche

Cloudinary applica automaticamente:
- ✅ **Formato migliore**: WebP per browser moderni, JPEG per altri
- ✅ **Qualità auto**: `q_auto:good` ottimizza in base al contenuto
- ✅ **Ridimensionamento responsive**: `c_limit` mantiene proporzioni

### Pulizia Immagini Vecchie

Per liberare spazio, periodicamente:

1. Cloudinary Console → **Media Library**
2. Filtra per data: > 6 mesi fa
3. Seleziona immagini di strutture eliminate
4. **Delete** (fai attenzione!)

---

## 📱 PARTE 9: Pro Tips

### Velocizzare Upload

Le immagini vengono già compresse lato client prima dell'upload:
- ✅ Ridimensionate a max 1920x1080px
- ✅ Qualità JPEG: 80%
- ✅ Risparmio: ~70% dimensione originale

### URL Dinamici

Cloudinary permette di modificare le immagini al volo via URL:

**Esempi:**
```
// Immagine quadrata 500x500
/w_500,h_500,c_fill/image.jpg

// Bianco e nero
/e_grayscale/image.jpg

// Sfocata (sfondo)
/e_blur:1000/image.jpg

// Con bordo
/bo_5px_solid_white/image.jpg
```

### Backup

Cloudinary mantiene automaticamente:
- ✅ Backup giornalieri (piano gratuito)
- ✅ Storico versioni (30 giorni)
- ✅ Ridondanza dati (multi-regione)

---

## 💰 PARTE 10: Upgrade (Opzionale)

Se superi i limiti gratuiti:

### Prezzi Piano Flex (Pay-as-you-go)

| Risorsa | Prezzo | Nota |
|---------|--------|------|
| Storage | $0.18/GB/mese | Dopo 25GB |
| Bandwidth | $0.08/GB | Dopo 25GB/mese |
| Transformations | $0.50/1000 | Dopo 25,000/mese |

**Esempio costi reali:**
- 30 GB storage + 30 GB/mese traffico = ~$3-5/mese
- 50 GB storage + 50 GB/mese traffico = ~$6-10/mese

### Come Fare Upgrade

1. Dashboard → **"Plan and Billing"**
2. Clicca **"Upgrade"**
3. Seleziona **"Flex Plan"**
4. Aggiungi carta di credito
5. Imposta **spending cap** (limite mensile)

---

## ✅ Checklist Finale

Prima di considerare tutto completo:

- [ ] Account Cloudinary creato e verificato
- [ ] Credenziali copiate (Cloud Name, API Key)
- [ ] Upload Preset `quovadiscout_preset` creato (Unsigned)
- [ ] File `cloudinary-config.js` creato da template
- [ ] Credenziali inserite in `cloudinary-config.js`
- [ ] `cloudinary-config.js` aggiunto a `.gitignore`
- [ ] Test upload immagine funzionante
- [ ] Immagine visibile su Cloudinary Media Library
- [ ] Immagine visibile nella galleria app
- [ ] Console browser senza errori
- [ ] Email alerts configurate (80% e 100%)

---

## 📞 Supporto

**Problemi?**
1. Controlla la Console del browser (F12)
2. Verifica i messaggi nella Console Cloudinary
3. Consulta [Documentazione Cloudinary](https://cloudinary.com/documentation)

**Domande frequenti:**
- ✅ Le immagini sono compresse automaticamente lato client
- ✅ Cloudinary ottimizza automaticamente formato e qualità
- ✅ IndexedDB salva i riferimenti per la galleria locale
- ✅ L'eliminazione immagini rimuove solo il riferimento locale

---

## 🎉 Fatto!

Cloudinary è ora completamente configurato!

**Vantaggi che hai ottenuto:**
- 📦 **25 GB** storage gratuito (vs 5GB Firebase)
- 🌐 **25 GB/mese** bandwidth (vs 1GB/giorno Firebase)
- 🚀 Trasformazioni automatiche immagini
- 🖼️ CDN globale velocissimo
- 💰 Costo: **€0** (piano gratuito generoso)

**Compatibilità con Firebase:**
- Firebase Firestore: **Dati strutture** ✅
- Firebase Auth: **Autenticazione** ✅
- Cloudinary: **Immagini** ✅

**Buon lavoro con QuoVadiScout! 🏕️**

