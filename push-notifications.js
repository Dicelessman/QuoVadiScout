// Push Notifications System for QuoVadiScout
// Web Push API implementation

class PushNotificationManager {
  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    this.subscription = null;
    this.vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HIeFfD7l1KQlYw'; // Replace with your VAPID key
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

  // Mostra notifica locale
  showLocalNotification(title, options = {}) {
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
      }
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
      }
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
      }
    );
  }
};

console.log('📱 Push Notifications Manager caricato');
