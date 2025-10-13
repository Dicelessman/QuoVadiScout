// Maps integration for QuoVadiScout
// Leaflet + OpenStreetMap implementation

class MapsManager {
  constructor() {
    this.map = null;
    this.markers = [];
    this.markerCluster = null;
    this.userLocation = null;
    this.isInitialized = false;
  }

  async initialize(containerId = 'map') {
    try {
      // Verifica che Leaflet sia disponibile
      if (typeof L === 'undefined') {
        console.error('❌ Leaflet non disponibile');
        return false;
      }

      // Inizializza la mappa
      this.map = L.map(containerId).setView([41.9028, 12.4964], 6); // Centra sull'Italia

      // Aggiungi layer OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(this.map);

      // Inizializza cluster di markers
      this.markerCluster = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 50
      });
      this.map.addLayer(this.markerCluster);

      this.isInitialized = true;
      console.log('✅ Mappa inizializzata');
      return true;
    } catch (error) {
      console.error('❌ Errore inizializzazione mappa:', error);
      return false;
    }
  }

  addStructureMarker(struttura) {
    if (!this.isInitialized || !this.map) return;

    try {
      let lat = null, lng = null;

      // Usa coordinate se disponibili
      if (struttura.coordinate && struttura.coordinate.lat && struttura.coordinate.lng) {
        lat = struttura.coordinate.lat;
        lng = struttura.coordinate.lng;
      } else if (struttura.Indirizzo || (struttura.Luogo && struttura.Prov)) {
        // Fallback: usa geocoding se non ci sono coordinate
        this.geocodeStructure(struttura);
        return;
      } else {
        console.warn('⚠️ Nessuna posizione disponibile per:', struttura.Struttura);
        return;
      }

      // Crea icona personalizzata basata sul tipo
      const icon = this.createStructureIcon(struttura);

      // Crea marker
      const marker = L.marker([lat, lng], { icon })
        .bindPopup(this.createStructurePopup(struttura));

      this.markers.push({
        marker,
        struttura
      });

      this.markerCluster.addLayer(marker);
      console.log(`📍 Marker aggiunto per: ${struttura.Struttura}`);
    } catch (error) {
      console.error('❌ Errore aggiunta marker:', error);
    }
  }

  createStructureIcon(struttura) {
    let iconHtml = '🏕️';
    let iconColor = '#2f6b2f';

    // Colore basato sullo stato
    if (struttura.stato === 'attiva') {
      iconColor = '#28a745';
    } else if (struttura.stato === 'temporaneamente_non_attiva') {
      iconColor = '#ffc107';
    } else if (struttura.stato === 'non_piu_attiva') {
      iconColor = '#dc3545';
    }

    // Icona basata sul tipo
    if (struttura.Casa && struttura.Terreno) {
      iconHtml = '🏘️';
    } else if (struttura.Casa) {
      iconHtml = '🏠';
    } else if (struttura.Terreno) {
      iconHtml = '🌱';
    }

    return L.divIcon({
      html: `<div style="
        background: ${iconColor};
        color: white;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">${iconHtml}</div>`,
      className: 'custom-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  }

  createStructurePopup(struttura) {
    const popupContent = `
      <div style="min-width: 200px;">
        <h4 style="margin: 0 0 8px 0; color: #2f6b2f;">${struttura.Struttura || 'Struttura senza nome'}</h4>
        <p style="margin: 0 0 8px 0; color: #666;">
          📍 ${struttura.Luogo || 'N/A'}, ${struttura.Prov || 'N/A'}
        </p>
        <div style="margin: 8px 0;">
          ${struttura.Casa ? '<span style="background: #28a745; color: white; padding: 2px 6px; border-radius: 3px; font-size: 12px; margin-right: 4px;">🏠 Casa</span>' : ''}
          ${struttura.Terreno ? '<span style="background: #17a2b8; color: white; padding: 2px 6px; border-radius: 3px; font-size: 12px; margin-right: 4px;">🌱 Terreno</span>' : ''}
          ${struttura.stato ? `<span style="background: ${this.getStateColor(struttura.stato)}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 12px;">${this.getStateIcon(struttura.stato)} ${this.getStateLabel(struttura.stato)}</span>` : ''}
        </div>
        ${struttura.Referente ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Referente:</strong> ${struttura.Referente}</p>` : ''}
        ${struttura.Contatto ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Contatto:</strong> ${struttura.Contatto}</p>` : ''}
        ${struttura.Email ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Email:</strong> ${struttura.Email}</p>` : ''}
        ${struttura.rating?.average ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Rating:</strong> ⭐ ${struttura.rating.average.toFixed(1)}/5</p>` : ''}
        <div style="margin-top: 8px;">
          <button onclick="window.mostraSchedaCompleta('${struttura.id}')" style="
            background: #007bff;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
          ">Visualizza Dettagli</button>
        </div>
      </div>
    `;
    return popupContent;
  }

  getStateColor(stato) {
    switch (stato) {
      case 'attiva': return '#28a745';
      case 'temporaneamente_non_attiva': return '#ffc107';
      case 'non_piu_attiva': return '#dc3545';
      default: return '#6c757d';
    }
  }

  getStateIcon(stato) {
    switch (stato) {
      case 'attiva': return '🟢';
      case 'temporaneamente_non_attiva': return '🟡';
      case 'non_piu_attiva': return '🔴';
      default: return '⚪';
    }
  }

  getStateLabel(stato) {
    switch (stato) {
      case 'attiva': return 'Attiva';
      case 'temporaneamente_non_attiva': return 'Temporaneamente non attiva';
      case 'non_piu_attiva': return 'Non più attiva';
      default: return 'Stato sconosciuto';
    }
  }

  clearMarkers() {
    this.markerCluster.clearLayers();
    this.markers = [];
    console.log('🗑️ Marker rimossi dalla mappa');
  }

  updateMarkers(strutture) {
    this.clearMarkers();
    strutture.forEach(struttura => {
      this.addStructureMarker(struttura);
    });
    console.log(`📍 ${strutture.length} marker aggiornati sulla mappa`);
  }

  // Cache per geocoding
  static geocodingCache = new Map();
  static geocodingQueue = [];
  static isProcessingGeocoding = false;
  static lastGeocodingRequest = 0;
  static readonly GEOCODING_DELAY = 1200; // 1.2 secondi tra richieste

  async geocodeStructure(struttura) {
    const address = struttura.Indirizzo || `${struttura.Luogo}, ${struttura.Prov}, Italia`;
    
    // Controlla cache
    if (MapsManager.geocodingCache.has(address)) {
      const cached = MapsManager.geocodingCache.get(address);
      if (cached) {
        struttura.coordinate = cached;
        this.addStructureMarker(struttura);
        console.log(`📋 Geocoding da cache per: ${struttura.Struttura}`);
        return;
      }
    }

    // Aggiungi alla coda
    MapsManager.geocodingQueue.push({ struttura, address });
    await this.processGeocodingQueue();
  }

  async processGeocodingQueue() {
    if (MapsManager.isProcessingGeocoding || MapsManager.geocodingQueue.length === 0) {
      return;
    }

    MapsManager.isProcessingGeocoding = true;

    while (MapsManager.geocodingQueue.length > 0) {
      const { struttura, address } = MapsManager.geocodingQueue.shift();
      
      try {
        await this.performGeocoding(struttura, address);
      } catch (error) {
        console.warn(`⚠️ Geocoding fallito per: ${struttura.Struttura}`, error.message);
      }

      // Rate limiting
      const now = Date.now();
      const timeSinceLastRequest = now - MapsManager.lastGeocodingRequest;
      if (timeSinceLastRequest < MapsManager.GEOCODING_DELAY) {
        await new Promise(resolve => 
          setTimeout(resolve, MapsManager.GEOCODING_DELAY - timeSinceLastRequest)
        );
      }
      MapsManager.lastGeocodingRequest = Date.now();
    }

    MapsManager.isProcessingGeocoding = false;
  }

  async performGeocoding(struttura, address) {
    try {
      // Usa un proxy CORS per evitare errori CORS
      const proxyUrl = 'https://api.allorigins.win/raw?url=';
      const targetUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
      
      const response = await fetch(proxyUrl + encodeURIComponent(targetUrl), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);

        // Valida coordinate
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          throw new Error('Coordinate non valide');
        }

        const coordinates = { lat, lng };
        
        // Aggiorna struttura
        struttura.coordinate = coordinates;
        
        // Salva in cache
        MapsManager.geocodingCache.set(address, coordinates);
        
        // Salva su Firestore (opzionale, non bloccante)
        this.saveCoordinatesToFirestore(struttura.id, lat, lng).catch(err => 
          console.warn('⚠️ Errore salvataggio coordinate:', err.message)
        );

        // Aggiungi marker alla mappa
        this.addStructureMarker(struttura);

        console.log(`🌍 Geocoding completato per: ${struttura.Struttura}`);
        return coordinates;
      } else {
        // Salva fallimento in cache per evitare richieste ripetute
        MapsManager.geocodingCache.set(address, null);
        console.warn(`⚠️ Nessun risultato per: ${struttura.Struttura}`);
      }
    } catch (error) {
      // Gestione errori specifici
      if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
        console.warn(`⚠️ Errore CORS per: ${struttura.Struttura}, provo servizio alternativo`);
        return await this.fallbackGeocoding(struttura, address);
      }
      
      throw error;
    }
  }

  async fallbackGeocoding(struttura, address) {
    try {
      // Servizio alternativo: MapBox (richiede API key)
      // Per ora usiamo un approccio semplificato
      console.log(`🔄 Tentativo geocoding alternativo per: ${struttura.Struttura}`);
      
      // Salva fallimento in cache
      MapsManager.geocodingCache.set(address, null);
      
      // Per ora, non facciamo nulla, ma in futuro potremmo usare altri servizi
      return null;
    } catch (error) {
      console.warn(`⚠️ Fallback geocoding fallito per: ${struttura.Struttura}`);
      return null;
    }
  }

  async saveCoordinatesToFirestore(strutturaId, lat, lng) {
    try {
      if (typeof window.updateDoc === 'function' && window.doc && window.db) {
        const docRef = window.doc(window.db, "strutture", strutturaId);
        await window.updateDoc(docRef, {
          coordinate: { lat, lng },
          lastModified: new Date()
        });
        console.log('✅ Coordinate salvate su Firestore');
      }
    } catch (error) {
      console.error('❌ Errore salvataggio coordinate:', error);
    }
  }

  async getUserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalizzazione non supportata'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          resolve(this.userLocation);
        },
        (error) => {
          console.error('❌ Errore geolocalizzazione:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minuti
        }
      );
    });
  }

  centerOnUserLocation() {
    if (this.userLocation) {
      this.map.setView([this.userLocation.lat, this.userLocation.lng], 13);
      
      // Aggiungi marker per la posizione utente
      L.marker([this.userLocation.lat, this.userLocation.lng], {
        icon: L.divIcon({
          html: '<div style="background: #007bff; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">📍</div>',
          className: 'user-location-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      }).addTo(this.map).bindPopup('La tua posizione').openPopup();
      
      console.log('📍 Mappa centrata sulla tua posizione');
    }
  }

  async findNearbyStructures(radiusKm = 50) {
    if (!this.userLocation) {
      await this.getUserLocation();
    }

    if (!this.userLocation) {
      console.error('❌ Posizione utente non disponibile');
      return [];
    }

    const nearbyStructures = window.strutture.filter(struttura => {
      if (!struttura.coordinate || !struttura.coordinate.lat || !struttura.coordinate.lng) {
        return false;
      }

      const distance = this.calculateDistance(
        this.userLocation.lat,
        this.userLocation.lng,
        struttura.coordinate.lat,
        struttura.coordinate.lng
      );

      return distance <= radiusKm;
    });

    // Ordina per distanza
    nearbyStructures.sort((a, b) => {
      const distA = this.calculateDistance(
        this.userLocation.lat,
        this.userLocation.lng,
        a.coordinate.lat,
        a.coordinate.lng
      );
      const distB = this.calculateDistance(
        this.userLocation.lat,
        this.userLocation.lng,
        b.coordinate.lat,
        b.coordinate.lng
      );
      return distA - distB;
    });

    return nearbyStructures;
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raggio della Terra in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    return d;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  destroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.markers = [];
      this.markerCluster = null;
      this.isInitialized = false;
      console.log('🗑️ Mappa distrutta');
    }
  }
}

// Inizializza il manager delle mappe
const mapsManager = new MapsManager();

// Esporta per uso globale
window.mapsManager = mapsManager;

// Funzioni helper per l'integrazione
window.initializeMap = async (containerId) => {
  return await mapsManager.initialize(containerId);
};

window.showStructuresOnMap = (strutture) => {
  mapsManager.updateMarkers(strutture);
};

window.centerMapOnUser = async () => {
  try {
    await mapsManager.getUserLocation();
    mapsManager.centerOnUserLocation();
  } catch (error) {
    alert('Impossibile ottenere la tua posizione. Assicurati di aver concesso i permessi di geolocalizzazione.');
  }
};

window.findNearbyStructures = async (radiusKm) => {
  return await mapsManager.findNearbyStructures(radiusKm);
};

console.log('🗺️ Maps Manager caricato');
