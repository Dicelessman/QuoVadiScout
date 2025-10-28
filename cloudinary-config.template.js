// === Configurazione Cloudinary per QuoVadiScout ===
// 
// ISTRUZIONI:
// 1. Copia questo file e rinominalo in: cloudinary-config.js
// 2. Sostituisci i valori YOUR_XXX con le tue credenziali Cloudinary
// 3. Aggiungi cloudinary-config.js al .gitignore (per sicurezza)
//
// Dove trovo le credenziali?
// Dashboard Cloudinary → Account Details / Product Environment Credentials
// https://console.cloudinary.com/console

window.CloudinaryConfig = {
  // Nome del tuo Cloud Cloudinary (esempio: dh4k8x7yz)
  cloudName: 'YOUR_CLOUD_NAME',
  
  // API Key (numero lungo, esempio: 123456789012345)
  apiKey: 'YOUR_API_KEY',
  
  // API Secret (stringa alfanumerica)
  // ⚠️ ATTENZIONE: Non condividere mai l'API Secret!
  // Per sicurezza, usiamo Unsigned Upload (vedi sotto)
  apiSecret: 'YOUR_API_SECRET',
  
  // Upload Preset (lo creeremo nelle impostazioni Cloudinary)
  // Permette upload senza esporre API Secret
  uploadPreset: 'quovadiscout_preset',
  
  // Cartella dove salvare le immagini
  folder: 'quovadiscout/structures',
  
  // Configurazioni di upload
  secure: true,
  
  // Trasformazioni automatiche
  transformations: {
    // Immagine principale
    main: {
      width: 1920,
      height: 1080,
      crop: 'limit',
      quality: 'auto:good',
      fetch_format: 'auto'
    },
    // Thumbnail
    thumb: {
      width: 300,
      height: 300,
      crop: 'fill',
      gravity: 'auto',
      quality: 'auto:eco',
      fetch_format: 'auto'
    },
    // Anteprima piccola
    preview: {
      width: 800,
      height: 600,
      crop: 'limit',
      quality: 'auto:good',
      fetch_format: 'auto'
    }
  }
};

// Funzione di validazione
window.validateCloudinaryConfig = function(config) {
  const errors = [];
  
  if (!config.cloudName || config.cloudName === 'YOUR_CLOUD_NAME') {
    errors.push('❌ Cloud Name non configurato');
  }
  
  if (!config.apiKey || config.apiKey === 'YOUR_API_KEY') {
    errors.push('❌ API Key non configurata');
  }
  
  if (!config.uploadPreset || config.uploadPreset === 'quovadiscout_preset') {
    console.warn('⚠️ Upload Preset di default - ricorda di crearlo in Cloudinary');
  }
  
  if (errors.length > 0) {
    console.error('Errori configurazione Cloudinary:', errors);
    return false;
  }
  
  console.log('✅ Configurazione Cloudinary valida:', {
    cloudName: config.cloudName,
    apiKey: config.apiKey.substring(0, 5) + '...',
    uploadPreset: config.uploadPreset
  });
  
  return true;
};

// Export per compatibilità
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.CloudinaryConfig;
}

