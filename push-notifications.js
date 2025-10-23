// Push Notifications System for QuoVadiScout
// Web Push API implementation

class NotificationPreferences {
  constructor() {
    this.preferences = {
      newStructures: true,
      structureUpdates: true,
      personalListUpdates: true,
      nearbyStructures: false,
      reports: true,
      distance: 10 // km per notifiche vicinanza
    };
  }
  
  async loadFromFirestore(userId) {
    try {
      if (!userId || !window.db) return;
      
      const userPrefsRef = window.doc(window.db, "user_notification_prefs", userId);
      const userPrefsDoc = await window.getDoc(userPrefsRef);
      
      if (userPrefsDoc.exists()) {
        const data = userPrefsDoc.data();
        this.preferences = { ...this.preferences, ...data };
        console.log('📱 Preferenze notifiche caricate:', this.preferences);
      }
    } catch (error) {
      console.error('❌ Errore caricamento preferenze notifiche:', error);
    }
  }
  
  async save(userId) {
    try {
      if (!userId || !window.db) return;
      
      const userPrefsRef = window.doc(window.db, "user_notification_prefs", userId);
      await window.setDoc(userPrefsRef, {
        ...this.preferences,
        lastUpdated: new Date()
      }, { merge: true });
      
      console.log('✅ Preferenze notifiche salvate');
    } catch (error) {
      console.error('❌ Errore salvataggio preferenze notifiche:', error);
    }
  }
  
  isEnabled(type) {
    return this.preferences[type] === true;
  }
  
  getDistance() {
    return this.preferences.distance || 10;
  }
}

class PushNotificationManager {
  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    this.subscription = null;
    this.vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HIeFfD7l1KQlYw'; // Replace with your VAPID key
    this.preferences = new NotificationPreferences();
  }

  async initialize() {
    if (!this.isSupported) {
      console.log('❌ Push notifications non supportate');
      return false;
    }

    try {
      // Controlla se il service worker è disponibile
      if (!navigator.serviceWorker.controller) {
        console.log('⚠️ Service Worker non disponibile, notifiche locali solo');
        return false;
      }

      // Registra service worker se non già registrato
      const registration = await navigator.serviceWorker.ready;
      
      // Richiedi permessi solo per notifiche locali
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.log('❌ Permessi notifiche negati');
        return false;
      }

      // Carica preferenze utente se autenticato
      if (window.utenteCorrente) {
        await this.preferences.loadFromFirestore(window.utenteCorrente.uid);
      }

      // Disabilita temporaneamente la sottoscrizione push per evitare errori VAPID
      console.log('⚠️ Push notifications remote disabilitate (VAPID key non configurata)');
      console.log('✅ Notifiche locali abilitate');
      return true;
    } catch (error) {
      console.warn('⚠️ Push notifications non disponibili:', error.message);
      return false;
    }
  }

  async requestPermission() {
    const permission = await Notification.requestPermission();
    return permission;
  }

  async subscribe() {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      this.subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      // Salva subscription su Firestore
      await this.saveSubscription(this.subscription);
      
      console.log('✅ Sottoscrizione push creata');
      return true;
    } catch (error) {
      console.error('❌ Errore sottoscrizione push:', error);
      return false;
    }
  }

  async saveSubscription(subscription) {
    try {
      if (!window.utenteCorrente) {
        console.log('⚠️ Utente non autenticato, subscription non salvata');
        return;
      }

      const subscriptionData = {
        userId: window.utenteCorrente.uid,
        subscription: subscription,
        createdAt: new Date(),
        userAgent: navigator.userAgent
      };

      await window.addDoc(window.collection(window.db, "push_subscriptions"), subscriptionData);
      console.log('✅ Subscription salvata su Firestore');
    } catch (error) {
      console.error('❌ Errore salvataggio subscription:', error);
    }
  }

  async unsubscribe() {
    try {
      if (this.subscription) {
        await this.subscription.unsubscribe();
        this.subscription = null;
        console.log('✅ Sottoscrizione push rimossa');
        return true;
      }
    } catch (error) {
      console.error('❌ Errore rimozione sottoscrizione:', error);
      return false;
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Controlla preferenze prima di mostrare notifica
  checkPreferences(type) {
    return this.preferences.isEnabled(type);
  }

  // Mostra notifica locale con controllo preferenze
  showLocalNotification(title, options = {}, type = null) {
    // Controlla preferenze se specificato il tipo
    if (type && !this.checkPreferences(type)) {
      console.log(`🔕 Notifica ${type} disabilitata dalle preferenze`);
      return null;
    }

    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    }
  }

  // Gestisce notifiche push ricevute
  handlePushMessage(event) {
    console.log('📱 Push message ricevuta:', event);

    const data = event.data ? event.data.json() : {};
    const title = data.title || 'QuoVadiScout';
    const options = {
      body: data.body || 'Nuova notifica',
      icon: data.icon || '/icon-192x192.png',
      badge: data.badge || '/icon-72x72.png',
      tag: data.tag || 'quovadiscout',
      data: data.data || {}
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
}

// Inizializza il manager delle notifiche
const pushManager = new PushNotificationManager();

// Esporta per uso globale
window.pushManager = pushManager;

// Funzioni helper per l'integrazione
window.initializePushNotifications = async () => {
  return await pushManager.initialize();
};

window.showNotification = (title, options) => {
  return pushManager.showLocalNotification(title, options);
};

// Gestione notifiche per nuove strutture
window.notifyNewStructure = async (struttura) => {
  if (pushManager.subscription) {
    const notification = pushManager.showLocalNotification(
      '🏕️ Nuova Struttura Aggiunta',
      {
        body: `${struttura.Struttura} a ${struttura.Luogo}`,
        tag: 'new-structure',
        data: { strutturaId: struttura.id }
      },
      'newStructures'
    );
  }
};

// Gestione notifiche per modifiche strutture
window.notifyStructureUpdate = async (struttura) => {
  if (pushManager.subscription) {
    const notification = pushManager.showLocalNotification(
      '📝 Struttura Aggiornata',
      {
        body: `Modifiche a ${struttura.Struttura}`,
        tag: 'structure-update',
        data: { strutturaId: struttura.id }
      },
      'structureUpdates'
    );
  }
};

// Gestione notifiche per segnalazioni
window.notifyNewReport = async (struttura, report) => {
  if (pushManager.subscription) {
    const notification = pushManager.showLocalNotification(
      '⚠️ Nuova Segnalazione',
      {
        body: `Segnalazione per ${struttura.Struttura}`,
        tag: 'new-report',
        data: { strutturaId: struttura.id, reportId: report.id }
      },
      'reports'
    );
  }
};

// Gestione notifiche per aggiornamenti elenco personale
window.notifyPersonalListUpdate = async (message) => {
  if (pushManager.subscription) {
    const notification = pushManager.showLocalNotification(
      '⭐ Elenco Personale',
      {
        body: message,
        tag: 'personal-list-update',
        data: { type: 'personalList' }
      },
      'personalListUpdates'
    );
  }
};

// Gestione notifiche per strutture vicine
window.notifyNearbyStructure = async (struttura, distance) => {
  if (pushManager.subscription) {
    const notification = pushManager.showLocalNotification(
      '📍 Struttura Vicina',
      {
        body: `${struttura.Struttura} a ${distance.toFixed(1)}km da te`,
        tag: 'nearby-structure',
        data: { strutturaId: struttura.id, distance }
      },
      'nearbyStructures'
    );
  }
};

console.log('📱 Push Notifications Manager caricato');
