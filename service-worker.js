// Service Worker per QuoVadiScout PWA
const CACHE_NAME = 'quovadiscout-v1.2.0';
const STATIC_CACHE = 'static-v1.2.0';
const DYNAMIC_CACHE = 'dynamic-v1.2.0';

// Risorse da cachare staticamente
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/dashboard.html',
  '/dashboard.css',
  '/dashboard.js',
  '/manifest.json',
  // CDN resources
  'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js',
  'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js'
];

// Installazione Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installazione in corso...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Service Worker: Caching risorse statiche...');
        // Cache ogni asset individualmente per gestire errori singoli
        const cachePromises = STATIC_ASSETS.map(asset => {
          return fetch(asset)
            .then(response => {
              if (response.ok) {
                return cache.put(asset, response);
              } else {
                console.warn(`⚠️ Service Worker: Impossibile cachare ${asset}: ${response.status}`);
                return Promise.resolve();
              }
            })
            .catch(error => {
              console.warn(`⚠️ Service Worker: Errore caching ${asset}:`, error.message);
              return Promise.resolve();
            });
        });
        
        return Promise.all(cachePromises);
      })
      .then(() => {
        console.log('✅ Service Worker: Installazione completata');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Errore durante installazione:', error);
        // Non bloccare l'installazione per errori di cache
        return self.skipWaiting();
      })
  );
});

// Attivazione Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Attivazione in corso...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Service Worker: Rimozione cache obsoleta:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Attivazione completata');
        return self.clients.claim();
      })
  );
});

// Intercettazione richieste
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignora richieste per favicon e altre risorse non critiche
  if (url.pathname.includes('favicon.ico') || 
      url.pathname.includes('robots.txt') ||
      url.pathname.includes('sitemap.xml')) {
    return;
  }
  
  // Ignora richieste da estensioni Chrome
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Ignora richieste POST (non supportate dal cache)
  if (request.method !== 'GET') {
    return;
  }
  
  // Strategia per risorse statiche
  if (isStaticAsset(request)) {
    event.respondWith(
      cacheFirst(request).catch(error => {
        console.warn('⚠️ Service Worker: Errore cache-first per:', request.url, error);
        return new Response('Risorsa non disponibile', { status: 404 });
      })
    );
  }
  // Strategia per API Firebase
  else if (isFirebaseRequest(request)) {
    event.respondWith(
      networkFirst(request).catch(error => {
        console.warn('⚠️ Service Worker: Errore network-first per:', request.url, error);
        return new Response('API non disponibile', { status: 503 });
      })
    );
  }
  // Strategia per immagini
  else if (isImageRequest(request)) {
    event.respondWith(
      cacheFirst(request).catch(error => {
        console.warn('⚠️ Service Worker: Errore immagine per:', request.url, error);
        return new Response('Immagine non disponibile', { status: 404 });
      })
    );
  }
  // Strategia di default
  else {
    event.respondWith(
      networkFirst(request).catch(error => {
        console.warn('⚠️ Service Worker: Errore default per:', request.url, error);
        return new Response('Risorsa non disponibile', { status: 404 });
      })
    );
  }
});

// Strategia Cache First (per risorse statiche)
async function cacheFirst(request) {
  try {
    // Verifica se la richiesta è cachabile
    if (!isCacheableRequest(request)) {
      return fetch(request);
    }
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('📦 Service Worker: Risposta da cache:', request.url);
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      try {
        const cache = await caches.open(STATIC_CACHE);
        await cache.put(request, networkResponse.clone());
      } catch (cacheError) {
        console.warn('⚠️ Service Worker: Errore nel caching:', cacheError);
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Service Worker: Errore cache-first:', error);
    // Non loggare errori per risorse che potrebbero non esistere (come favicon)
    if (!request.url.includes('favicon.ico')) {
      console.warn('⚠️ Service Worker: Risorsa non trovata:', request.url);
    }
    return new Response('Offline - Risorsa non disponibile', { status: 503 });
  }
}

// Strategia Network First (per API dinamiche)
async function networkFirst(request) {
  try {
    // Verifica se la richiesta è cachabile
    if (!isCacheableRequest(request)) {
      return fetch(request);
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      try {
        const cache = await caches.open(DYNAMIC_CACHE);
        await cache.put(request, networkResponse.clone());
      } catch (cacheError) {
        console.warn('⚠️ Service Worker: Errore nel caching dinamico:', cacheError);
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 Service Worker: Rete non disponibile, controllo cache...');
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log('📦 Service Worker: Risposta da cache offline:', request.url);
      return cachedResponse;
    }
    
    // Fallback per richieste Firebase
    if (isFirebaseRequest(request)) {
      return new Response(JSON.stringify({
        error: 'Offline',
        message: 'Connessione non disponibile. I dati saranno sincronizzati quando la connessione sarà ripristinata.'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('Offline - Risorsa non disponibile', { status: 503 });
  }
}

// Helper functions
function isStaticAsset(request) {
  const url = new URL(request.url);
  return STATIC_ASSETS.some(asset => url.pathname.includes(asset)) ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.html');
}

function isFirebaseRequest(request) {
  const url = new URL(request.url);
  return url.hostname.includes('firestore.googleapis.com') ||
         url.hostname.includes('firebase.googleapis.com') ||
         url.hostname.includes('quovadiscout.firebaseapp.com');
}

function isImageRequest(request) {
  return request.destination === 'image' ||
         /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(request.url);
}

function isCacheableRequest(request) {
  // Verifica se la richiesta può essere cachata
  const url = new URL(request.url);
  
  // Non cachare richieste da estensioni
  if (url.protocol === 'chrome-extension:' || 
      url.protocol === 'moz-extension:' ||
      url.protocol === 'safari-extension:') {
    return false;
  }
  
  // Non cachare richieste POST, PUT, DELETE
  if (request.method !== 'GET') {
    return false;
  }
  
  // Non cachare richieste con credenziali
  if (request.credentials === 'include') {
    return false;
  }
  
  // Non cachare richieste a domini esterni non sicuri
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return false;
  }
  
  return true;
}

// Gestione messaggi dal client
self.addEventListener('message', (event) => {
  const { action, data } = event.data;
  
  switch (action) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_CLEAR':
      clearCaches();
      break;
      
    case 'CACHE_STATUS':
      getCacheStatus().then(status => {
        event.ports[0].postMessage({ action: 'CACHE_STATUS_RESPONSE', data: status });
      });
      break;
      
    case 'SYNC_DATA':
      syncOfflineData();
      break;
  }
});

// Funzioni di utilità
async function clearCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
  console.log('🗑️ Service Worker: Cache pulita');
}

async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const status = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    status[cacheName] = keys.length;
  }
  
  return status;
}

async function syncOfflineData() {
  // Implementazione sincronizzazione dati offline
  console.log('🔄 Service Worker: Sincronizzazione dati offline...');
  
  try {
    // Qui implementeremo la logica di sincronizzazione
    // quando i dati saranno disponibili offline
    console.log('✅ Service Worker: Sincronizzazione completata');
  } catch (error) {
    console.error('❌ Service Worker: Errore sincronizzazione:', error);
  }
}

// Gestione notifiche push
self.addEventListener('push', (event) => {
  console.log('📱 Service Worker: Notifica push ricevuta');
  
  const options = {
    body: event.data ? event.data.text() : 'Nuova notifica da QuoVadiScout',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Visualizza',
        icon: '/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Chiudi',
        icon: '/icon-72x72.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('QuoVadiScout', options)
  );
});

// Gestione click su notifiche
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Service Worker: Click su notifica');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('🔧 Service Worker: Caricato e pronto');
