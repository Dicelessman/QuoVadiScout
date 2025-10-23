// === QuoVadiScout v1.2.1 - Cache Bust: 2024-12-19-11-25 ===
console.log('🔄 MediaManager caricato con versione v1.2.1 - Cache bust applicato');

// MediaManager per gestione upload immagini, compressione e geotagging
class MediaManager {
  constructor() {
    this.storage = null;
    this.compressionQuality = 0.8;
    this.maxWidth = 1920;
    this.maxHeight = 1080;
    this.thumbnailSize = 300;
    
    // Inizializza Firebase Storage se disponibile
    this.initializeStorage();
  }
  
  async initializeStorage() {
    try {
      if (window.firebase && window.firebase.storage) {
        this.storage = window.firebase.storage();
        console.log('✅ MediaManager: Firebase Storage inizializzato');
      } else {
        console.warn('⚠️ MediaManager: Firebase Storage non disponibile');
      }
    } catch (error) {
      console.error('❌ MediaManager: Errore inizializzazione storage:', error);
    }
  }
  
  // Upload immagine con compressione e geotagging
  async uploadImage(file, structureId, metadata = {}) {
    try {
      console.log('📸 MediaManager: Inizio upload immagine:', file.name);
      
      // Comprimi immagine
      const compressed = await this.compressImage(file);
      
      // Estrai dati EXIF per geotag
      const geoData = await this.extractGeoData(file);
      
      // Genera nomi file unici
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const thumbnailName = `thumb_${fileName}`;
      
      // Upload immagini se Firebase Storage disponibile
      if (this.storage && window.db) {
        const storageRef = this.storage.ref(`structures/${structureId}/images/${fileName}`);
        const thumbnailRef = this.storage.ref(`structures/${structureId}/images/${thumbnailName}`);
        
        // Upload immagine principale
        const uploadTask = storageRef.put(compressed.imageBlob, {
          metadata: {
            contentType: compressed.imageBlob.type,
            customMetadata: {
              originalName: file.name,
              structureId: structureId,
              geoData: JSON.stringify(geoData),
              ...metadata
            }
          }
        });
        
        // Upload thumbnail
        const thumbnailTask = thumbnailRef.put(compressed.thumbnailBlob, {
          metadata: {
            contentType: compressed.thumbnailBlob.type,
            customMetadata: {
              type: 'thumbnail',
              structureId: structureId
            }
          }
        });
        
        // Attendi completamento upload
        const [imageResult, thumbnailResult] = await Promise.all([
          uploadTask,
          thumbnailTask
        ]);
        
        // Ottieni URL pubblici
        const imageUrl = await imageResult.ref.getDownloadURL();
        const thumbnailUrl = await thumbnailResult.ref.getDownloadURL();
        
        const result = {
          id: `img_${timestamp}`,
          url: imageUrl,
          thumbnailUrl: thumbnailUrl,
          fileName: fileName,
          originalName: file.name,
          size: compressed.imageBlob.size,
          thumbnailSize: compressed.thumbnailBlob.size,
          geoData: geoData,
          uploadedAt: new Date(),
          structureId: structureId
        };
        
        console.log('✅ MediaManager: Upload completato:', result.id);
        return result;
        
      } else {
        // Fallback: salva in IndexedDB se Firebase non disponibile
        return await this.saveImageOffline(file, structureId, compressed, geoData, metadata);
      }
      
    } catch (error) {
      console.error('❌ MediaManager: Errore upload immagine:', error);
      throw error;
    }
  }
  
  // Salva immagine offline in IndexedDB
  async saveImageOffline(file, structureId, compressed, geoData, metadata) {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['images'], 'readwrite');
      const store = transaction.objectStore('images');
      
      const imageData = {
        id: `img_${timestamp}`,
        fileName: fileName,
        originalName: file.name,
        structureId: structureId,
        imageBlob: compressed.imageBlob,
        thumbnailBlob: compressed.thumbnailBlob,
        geoData: geoData,
        uploadedAt: new Date(),
        offline: true,
        ...metadata
      };
      
      await store.put(imageData);
      
      // Crea URL blob per accesso immediato
      const imageUrl = URL.createObjectURL(compressed.imageBlob);
      const thumbnailUrl = URL.createObjectURL(compressed.thumbnailBlob);
      
      return {
        ...imageData,
        url: imageUrl,
        thumbnailUrl: thumbnailUrl,
        size: compressed.imageBlob.size,
        thumbnailSize: compressed.thumbnailBlob.size
      };
      
    } catch (error) {
      console.error('❌ MediaManager: Errore salvataggio offline:', error);
      throw error;
    }
  }
  
  // Comprimi immagine usando Canvas API
  async compressImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        try {
          // Calcola dimensioni mantenendo aspect ratio
          const { width, height } = this.calculateDimensions(
            img.width, 
            img.height, 
            this.maxWidth, 
            this.maxHeight
          );
          
          const { width: thumbWidth, height: thumbHeight } = this.calculateDimensions(
            img.width, 
            img.height, 
            this.thumbnailSize, 
            this.thumbnailSize
          );
          
          // Canvas per immagine principale
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          // Genera blob immagine principale
          canvas.toBlob((imageBlob) => {
            if (!imageBlob) {
              reject(new Error('Errore compressione immagine principale'));
              return;
            }
            
            // Canvas per thumbnail
            canvas.width = thumbWidth;
            canvas.height = thumbHeight;
            ctx.clearRect(0, 0, thumbWidth, thumbHeight);
            ctx.drawImage(img, 0, 0, thumbWidth, thumbHeight);
            
            // Genera blob thumbnail
            canvas.toBlob((thumbnailBlob) => {
              if (!thumbnailBlob) {
                reject(new Error('Errore compressione thumbnail'));
                return;
              }
              
              resolve({
                imageBlob: imageBlob,
                thumbnailBlob: thumbnailBlob,
                originalSize: file.size,
                compressedSize: imageBlob.size,
                compressionRatio: (1 - imageBlob.size / file.size) * 100
              });
              
            }, 'image/jpeg', this.compressionQuality);
            
          }, 'image/jpeg', this.compressionQuality);
          
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Errore caricamento immagine'));
      img.src = URL.createObjectURL(file);
    });
  }
  
  // Calcola dimensioni mantenendo aspect ratio
  calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
    let width = originalWidth;
    let height = originalHeight;
    
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }
    
    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }
    
    return { width: Math.round(width), height: Math.round(height) };
  }
  
  // Estrae dati GPS da EXIF
  async extractGeoData(file) {
    return new Promise((resolve) => {
      // Implementazione semplificata - in produzione usare EXIF.js
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          // Parsing EXIF semplificato per GPS
          const arrayBuffer = e.target.result;
          const dataView = new DataView(arrayBuffer);
          
          // Cerca marker EXIF (0xFFE1)
          let offset = 0;
          while (offset < arrayBuffer.byteLength - 1) {
            if (dataView.getUint16(offset) === 0xFFE1) {
              // Trovato segmento EXIF, estrai GPS se presente
              const geoData = this.parseGPSData(dataView, offset);
              resolve(geoData);
              return;
            }
            offset += 2;
          }
          
          // Nessun dato GPS trovato
          resolve({ lat: null, lng: null, altitude: null });
          
        } catch (error) {
          console.warn('⚠️ MediaManager: Errore parsing EXIF:', error);
          resolve({ lat: null, lng: null, altitude: null });
        }
      };
      
      reader.onerror = () => resolve({ lat: null, lng: null, altitude: null });
      reader.readAsArrayBuffer(file.slice(0, 65536)); // Leggi solo i primi 64KB
    });
  }
  
  // Parsing GPS semplificato da EXIF
  parseGPSData(dataView, offset) {
    try {
      // Implementazione molto semplificata
      // In produzione, usare una libreria dedicata come EXIF.js
      return {
        lat: null,
        lng: null,
        altitude: null,
        timestamp: null
      };
    } catch (error) {
      return { lat: null, lng: null, altitude: null };
    }
  }
  
  // Elimina immagine
  async deleteImage(imageId, structureId) {
    try {
      if (this.storage && window.db) {
        // Elimina da Firebase Storage
        const imageRef = this.storage.ref(`structures/${structureId}/images/${imageId}`);
        await imageRef.delete();
        
        console.log('✅ MediaManager: Immagine eliminata da Firebase Storage');
      } else {
        // Elimina da IndexedDB
        const db = await this.openIndexedDB();
        const transaction = db.transaction(['images'], 'readwrite');
        const store = transaction.objectStore('images');
        await store.delete(imageId);
        
        console.log('✅ MediaManager: Immagine eliminata da IndexedDB');
      }
    } catch (error) {
      console.error('❌ MediaManager: Errore eliminazione immagine:', error);
      throw error;
    }
  }
  
  // Recupera galleria immagini per una struttura
  async getGallery(structureId) {
    try {
      if (this.storage && window.db) {
        // Recupera da Firebase Storage
        const folderRef = this.storage.ref(`structures/${structureId}/images`);
        const listResult = await folderRef.listAll();
        
        const images = [];
        for (const itemRef of listResult.items) {
          if (!itemRef.name.startsWith('thumb_')) {
            try {
              const metadata = await itemRef.getMetadata();
              const url = await itemRef.getDownloadURL();
              
              // Cerca thumbnail corrispondente
              const thumbRef = this.storage.ref(`structures/${structureId}/images/thumb_${itemRef.name}`);
              let thumbnailUrl = null;
              
              try {
                thumbnailUrl = await thumbRef.getDownloadURL();
              } catch (thumbError) {
                // Thumbnail non trovato, usa immagine principale
                thumbnailUrl = url;
              }
              
              images.push({
                id: metadata.name,
                url: url,
                thumbnailUrl: thumbnailUrl,
                name: metadata.name,
                size: metadata.size,
                uploadedAt: new Date(metadata.timeCreated),
                geoData: metadata.customMetadata?.geoData ? 
                  JSON.parse(metadata.customMetadata.geoData) : null
              });
            } catch (itemError) {
              console.warn('⚠️ MediaManager: Errore recupero immagine:', itemRef.name);
            }
          }
        }
        
        return images.sort((a, b) => b.uploadedAt - a.uploadedAt);
        
      } else {
        // Recupera da IndexedDB
        const db = await this.openIndexedDB();
        const transaction = db.transaction(['images'], 'readonly');
        const store = transaction.objectStore('images');
        const index = store.index('structureId');
        
        const images = await new Promise((resolve, reject) => {
          const request = index.getAll(structureId);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        
        return images.map(img => ({
          ...img,
          url: URL.createObjectURL(img.imageBlob),
          thumbnailUrl: URL.createObjectURL(img.thumbnailBlob)
        }));
      }
      
    } catch (error) {
      console.error('❌ MediaManager: Errore recupero galleria:', error);
      
      // Utilizza il gestore errori centralizzato
      if (window.errorHandler) {
        const handled = await window.errorHandler.handleIndexedDBError(error, 'getGallery');
        if (handled) {
          console.log('✅ Errore gestito dal ErrorHandler');
        }
      }
      
      return [];
    }
  }
  
  // Recupera immagine cached per uso offline
  async getCachedImage(imageId) {
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['images'], 'readonly');
      const store = transaction.objectStore('images');
      const result = await store.get(imageId);
      
      if (result) {
        return {
          ...result,
          url: URL.createObjectURL(result.imageBlob),
          thumbnailUrl: URL.createObjectURL(result.thumbnailBlob)
        };
      }
      
      return null;
    } catch (error) {
      console.error('❌ MediaManager: Errore recupero immagine cached:', error);
      return null;
    }
  }
  
  // Calcola spazio utilizzato dalle immagini
  async getStorageUsage() {
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['images'], 'readonly');
      const store = transaction.objectStore('images');
      const images = await new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      const totalSize = images.reduce((total, img) => {
        return total + (img.imageBlob?.size || 0) + (img.thumbnailBlob?.size || 0);
      }, 0);
      
      return {
        totalImages: images.length,
        totalSize: totalSize,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
      };
      
    } catch (error) {
      console.error('❌ MediaManager: Errore calcolo spazio:', error);
      return { totalImages: 0, totalSize: 0, totalSizeMB: '0.00' };
    }
  }
  
  // Pulisce immagini vecchie o non utilizzate
  async cleanupOldImages(maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 giorni
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['images'], 'readwrite');
      const store = transaction.objectStore('images');
      const images = await new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      const cutoffDate = Date.now() - maxAge;
      let deletedCount = 0;
      
      for (const img of images) {
        if (img.uploadedAt && new Date(img.uploadedAt).getTime() < cutoffDate) {
          await store.delete(img.id);
          deletedCount++;
        }
      }
      
      console.log(`🧹 MediaManager: Eliminate ${deletedCount} immagini vecchie`);
      return deletedCount;
      
    } catch (error) {
      console.error('❌ MediaManager: Errore pulizia immagini:', error);
      throw error;
    }
  }
  
  // Apre IndexedDB
  async openIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('QuoVadiScoutDB', 2);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Store per immagini
        if (!db.objectStoreNames.contains('images')) {
          const imageStore = db.createObjectStore('images', { keyPath: 'id' });
          imageStore.createIndex('structureId', 'structureId', { unique: false });
          imageStore.createIndex('uploadedAt', 'uploadedAt', { unique: false });
        }
      };
    });
  }
}

// Crea istanza globale
window.mediaManager = new MediaManager();

// Funzioni di utilità globali
window.uploadImage = (file, structureId, metadata) => {
  return window.mediaManager.uploadImage(file, structureId, metadata);
};

window.deleteImage = (imageId, structureId) => {
  return window.mediaManager.deleteImage(imageId, structureId);
};

window.getImageGallery = (structureId) => {
  return window.mediaManager.getGallery(structureId);
};

window.getCachedImage = (imageId) => {
  return window.mediaManager.getCachedImage(imageId);
};

console.log('🔄 MediaManager inizializzato');
