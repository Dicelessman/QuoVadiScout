// smart-notifications.js
// Sistema di notifiche intelligenti basate sulla posizione e comportamento utente

class SmartNotificationManager {
  constructor() {
    this.userLocation = null;
    this.lastLocationUpdate = null;
    this.locationWatchId = null;
    this.nearbyStructures = new Set();
    this.visitedStructures = new Set();
    this.notificationHistory = [];
    this.maxNotificationsPerDay = 10;
    this.minTimeBetweenNotifications = 30 * 60 * 1000; // 30 minuti
    
    this.initializeLocationTracking();
    this.loadUserData();
  }

  async initializeLocationTracking() {
    if (!navigator.geolocation) {
      console.log('📍 Geolocalizzazione non supportata');
      return;
    }

    try {
      // Richiedi posizione corrente
      const position = await this.getCurrentPosition();
      this.userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: Date.now()
      };
      
      console.log('📍 Posizione utente rilevata:', this.userLocation);
      
      // Avvia monitoraggio continuo (solo se l'utente ha dato il consenso)
      this.startLocationWatching();
      
    } catch (error) {
      console.log('📍 Errore geolocalizzazione:', error.message);
    }
  }

  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minuti
      });
    });
  }

  startLocationWatching() {
    if (this.locationWatchId) return;

    this.locationWatchId = navigator.geolocation.watchPosition(
      (position) => {
        this.userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        };
        
        this.lastLocationUpdate = Date.now();
        this.checkNearbyStructures();
      },
      (error) => {
        console.warn('📍 Errore monitoraggio posizione:', error.message);
      },
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 60000 // 1 minuto
      }
    );
  }

  stopLocationWatching() {
    if (this.locationWatchId) {
      navigator.geolocation.clearWatch(this.locationWatchId);
      this.locationWatchId = null;
      console.log('📍 Monitoraggio posizione interrotto');
    }
  }

  async checkNearbyStructures() {
    if (!this.userLocation || !window.strutture) return;

    const currentNearby = new Set();
    const maxDistance = window.pushManager?.preferences?.getDistance() || 10; // km

    window.strutture.forEach(struttura => {
      if (struttura.coordinate_lat && struttura.coordinate_lng) {
        const distance = this.calculateDistance(
          this.userLocation.lat,
          this.userLocation.lng,
          parseFloat(struttura.coordinate_lat),
          parseFloat(struttura.coordinate_lng)
        );

        if (distance <= maxDistance) {
          currentNearby.add(struttura.id);
          
          // Notifica se è una nuova struttura nelle vicinanze
          if (!this.nearbyStructures.has(struttura.id)) {
            this.notifyNearbyStructure(struttura, distance);
          }
        }
      }
    });

    this.nearbyStructures = currentNearby;
  }

  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Raggio Terra in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  toRad(deg) {
    return deg * (Math.PI/180);
  }

  async notifyNearbyStructure(struttura, distance) {
    // Controlla se le notifiche per strutture vicine sono abilitate
    if (!window.pushManager?.checkPreferences('nearbyStructures')) {
      return;
    }

    // Controlla limiti notifiche
    if (!this.canSendNotification()) {
      return;
    }

    const distanceText = distance < 1 ? 
      `${Math.round(distance * 1000)}m` : 
      `${distance.toFixed(1)}km`;

    const notification = {
      title: '🏕️ Struttura nelle vicinanze!',
      body: `${struttura.Struttura} è a ${distanceText} da te`,
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      tag: `nearby-${struttura.id}`,
      data: {
        structureId: struttura.id,
        type: 'nearby',
        distance: distance
      },
      actions: [
        {
          action: 'view',
          title: '👁️ Visualizza',
          icon: '/action-view.png'
        },
        {
          action: 'directions',
          title: '🧭 Percorso',
          icon: '/action-directions.png'
        }
      ],
      requireInteraction: false,
      silent: false
    };

    if (window.pushManager) {
      window.pushManager.showLocalNotification(notification.title, notification, 'nearbyStructures');
    }

    this.recordNotification('nearbyStructures', struttura.id);
  }

  canSendNotification() {
    const now = Date.now();
    const today = new Date().toDateString();
    
    // Conta notifiche di oggi
    const todayNotifications = this.notificationHistory.filter(
      n => new Date(n.timestamp).toDateString() === today
    ).length;

    if (todayNotifications >= this.maxNotificationsPerDay) {
      return false;
    }

    // Controlla tempo minimo tra notifiche
    const lastNotification = this.notificationHistory
      .sort((a, b) => b.timestamp - a.timestamp)[0];
    
    if (lastNotification && (now - lastNotification.timestamp) < this.minTimeBetweenNotifications) {
      return false;
    }

    return true;
  }

  recordNotification(type, structureId) {
    this.notificationHistory.push({
      type,
      structureId,
      timestamp: Date.now(),
      location: this.userLocation ? { ...this.userLocation } : null
    });

    // Mantieni solo gli ultimi 100 record
    if (this.notificationHistory.length > 100) {
      this.notificationHistory = this.notificationHistory.slice(-100);
    }

    this.saveUserData();
  }

  trackStructureVisit(structureId) {
    this.visitedStructures.add(structureId);
    this.saveUserData();
  }

  async loadUserData() {
    try {
      const data = localStorage.getItem('smart_notifications_data');
      if (data) {
        const parsed = JSON.parse(data);
        this.nearbyStructures = new Set(parsed.nearbyStructures || []);
        this.visitedStructures = new Set(parsed.visitedStructures || []);
        this.notificationHistory = parsed.notificationHistory || [];
        
        console.log('📊 Dati notifiche intelligenti caricati');
      }
    } catch (error) {
      console.warn('⚠️ Errore caricamento dati notifiche:', error);
    }
  }

  saveUserData() {
    try {
      const data = {
        nearbyStructures: Array.from(this.nearbyStructures),
        visitedStructures: Array.from(this.visitedStructures),
        notificationHistory: this.notificationHistory
      };
      
      localStorage.setItem('smart_notifications_data', JSON.stringify(data));
    } catch (error) {
      console.warn('⚠️ Errore salvataggio dati notifiche:', error);
    }
  }

  // Notifiche basate su comportamento utente
  async suggestNearbyActivities() {
    if (!this.userLocation || !window.strutture) return;

    // Trova strutture vicine che l'utente non ha ancora visitato
    const unvisitedNearby = window.strutture.filter(struttura => {
      if (!struttura.coordinate_lat || !struttura.coordinate_lng) return false;
      if (this.visitedStructures.has(struttura.id)) return false;
      
      const distance = this.calculateDistance(
        this.userLocation.lat,
        this.userLocation.lng,
        parseFloat(struttura.coordinate_lat),
        parseFloat(struttura.coordinate_lng)
      );
      
      return distance <= 25; // 25km di raggio per suggerimenti
    });

    if (unvisitedNearby.length > 0 && this.canSendNotification()) {
      const struttura = unvisitedNearby[Math.floor(Math.random() * unvisitedNearby.length)];
      const distance = this.calculateDistance(
        this.userLocation.lat,
        this.userLocation.lng,
        parseFloat(struttura.coordinate_lat),
        parseFloat(struttura.coordinate_lng)
      );

      const notification = {
        title: '🎯 Suggerimento per te!',
        body: `Scopri ${struttura.Struttura} (${distance.toFixed(1)}km)`,
        icon: '/icon-192.png',
        tag: `suggestion-${struttura.id}`,
        data: {
          structureId: struttura.id,
          type: 'suggestion',
          distance: distance
        }
      };

      if (window.pushManager) {
        window.pushManager.showLocalNotification(notification.title, notification, 'nearbyStructures');
      }

      this.recordNotification('suggestion', struttura.id);
    }
  }

  // Avvia suggerimenti periodici (ogni 2 ore)
  startPeriodicSuggestions() {
    // Suggerimento iniziale dopo 1 ora
    setTimeout(() => {
      this.suggestNearbyActivities();
    }, 60 * 60 * 1000);

    // Poi ogni 2 ore
    setInterval(() => {
      this.suggestNearbyActivities();
    }, 2 * 60 * 60 * 1000);
  }

  // Gestione notifiche push interattive
  handleNotificationClick(notification) {
    const data = notification.data;
    
    switch (data.type) {
      case 'nearby':
      case 'suggestion':
        // Apri la scheda della struttura
        if (window.mostraSchedaCompleta) {
          window.mostraSchedaCompleta(data.structureId);
        }
        break;
        
      case 'directions':
        // Apri navigazione
        if (window.navigationIntegrations) {
          const struttura = window.strutture?.find(s => s.id === data.structureId);
          if (struttura && struttura.coordinate_lat && struttura.coordinate_lng) {
            window.navigationIntegrations.openInMaps(
              parseFloat(struttura.coordinate_lat),
              parseFloat(struttura.coordinate_lng),
              struttura.Struttura
            );
          }
        }
        break;
    }
  }

  // Statistiche notifiche per l'utente
  getNotificationStats() {
    const today = new Date().toDateString();
    const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const todayCount = this.notificationHistory.filter(
      n => new Date(n.timestamp).toDateString() === today
    ).length;
    
    const weekCount = this.notificationHistory.filter(
      n => new Date(n.timestamp) > thisWeek
    ).length;
    
    const nearbyCount = this.nearbyStructures.size;
    const visitedCount = this.visitedStructures.size;
    
    return {
      todayNotifications: todayCount,
      weekNotifications: weekCount,
      nearbyStructures: nearbyCount,
      visitedStructures: visitedCount,
      totalNotifications: this.notificationHistory.length
    };
  }
}

// Inizializza il sistema di notifiche intelligenti
window.smartNotificationManager = new SmartNotificationManager();

// Gestione click notifiche
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.action === 'notificationClick') {
      window.smartNotificationManager.handleNotificationClick(event.data.notification);
    }
  });
}

// Avvia suggerimenti periodici dopo 30 secondi (per dare tempo all'app di caricare)
setTimeout(() => {
  if (window.smartNotificationManager) {
    window.smartNotificationManager.startPeriodicSuggestions();
  }
}, 30000);

console.log('🧠 Smart Notification Manager inizializzato');
