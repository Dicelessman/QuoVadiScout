// === Configurazione Cloudinary per QuoVadiScout ===
// 
// ⚠️ ATTENZIONE: Questo file contiene credenziali private!
// Non condividere e non caricare su repository pubblici.
//
// Configurazione generata automaticamente

window.CloudinaryConfig = {
  // Nome del tuo Cloud Cloudinary
  cloudName: 'dusobmi2d',
  
  // API Key
  apiKey: '177926677433918',
  
  // API Secret (non usato lato client, ma disponibile se necessario)
  apiSecret: 'ZRj6wuSyhDkotMyW5sMAzngxuoY',
  
  // Upload Preset (quello che hai creato in Cloudinary Console)
  // Se hai usato un nome diverso, modificalo qui
  uploadPreset: 'quovadiscout_preset',
  
  // Cartella dove salvare le immagini su Cloudinary
  folder: 'quovadiscout/structures',
  
  // Configurazioni di upload
  secure: true,
  
  // Trasformazioni automatiche per le immagini
  transformations: {
    // Immagine principale - max 1920x1080, ottimizzata
    main: {
      width: 1920,
      height: 1080,
      crop: 'limit',
      quality: 'auto:good',
      fetch_format: 'auto'
    },
    // Thumbnail - 300x300 ritagliato al centro
    thumb: {
      width: 300,
      height: 300,
      crop: 'fill',
      gravity: 'auto',
      quality: 'auto:eco',
      fetch_format: 'auto'
    },
    // Anteprima media - max 800x600
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
    console.warn('⚠️ Upload Preset di default - assicurati di averlo creato in Cloudinary Console');
  }
  
  if (errors.length > 0) {
    console.error('Errori configurazione Cloudinary:', errors);
    return false;
  }
  
  console.log('✅ Configurazione Cloudinary valida:', {
    cloudName: config.cloudName,
    apiKey: config.apiKey.substring(0, 5) + '...',
    uploadPreset: config.uploadPreset,
    folder: config.folder
  });
  
  return true;
};

// Export per compatibilità
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.CloudinaryConfig;
}

console.log('🔧 Cloudinary config caricato per cloud:', window.CloudinaryConfig.cloudName);

