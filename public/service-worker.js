// public/service-worker.js

const CACHE_NAME = 'eye-center-v1.0.0';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/logo.png',
  '/favicon.ico',
  '/badge-icon.png'
];

// Install event - cache assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('[Service Worker] Cache installation failed:', error);
      })
  );
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Claim control of all clients
  return self.clients.claim();
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  // Skip cross-origin requests and non-GET requests
  if (!event.request.url.startsWith(self.location.origin) || event.request.method !== 'GET') {
    return;
  }
  
  // Skip API requests
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          console.log('[Service Worker] Serving from cache:', event.request.url);
          return response;
        }
        
        return fetch(event.request)
          .then(response => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response as it can only be consumed once
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(error => {
            console.error('[Service Worker] Fetch failed:', error);
            
            // Return a fallback page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
          });
      })
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', event => {
  console.log('[Service Worker] Push notification received:', event);
  
  let notificationData = {
    title: 'Eye Center',
    body: 'You have a new notification',
    icon: '/logo.png',
    badge: '/badge-icon.png',
    data: {
      url: '/doctor/dashboard'
    },
    requireInteraction: false,
    silent: false
  };
  
  // Parse notification data if available
  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('[Service Worker] Push payload:', payload);
      
      notificationData = {
        ...notificationData,
        ...payload,
        // Ensure we have default values
        title: payload.title || notificationData.title,
        body: payload.body || notificationData.body,
        icon: payload.icon || notificationData.icon,
        badge: payload.badge || notificationData.badge,
        data: payload.data || notificationData.data
      };
    } catch (error) {
      console.error('[Service Worker] Error parsing push data:', error);
    }
  }
  
  // Configure notification options
  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    data: notificationData.data,
    requireInteraction: notificationData.requireInteraction,
    silent: notificationData.silent,
    vibrate: [100, 50, 100], // Vibration pattern
    tag: 'appointment-notification', // Replace previous notifications with same tag
    renotify: true,
    actions: [
      {
        action: 'view',
        title: 'View Appointments',
        icon: '/logo.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/badge-icon.png'
      }
    ]
  };
  
  // Show the notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
      .then(() => {
        console.log('[Service Worker] Notification displayed successfully');
      })
      .catch(error => {
        console.error('[Service Worker] Failed to show notification:', error);
      })
  );
});

// Notification click event - handle user interaction
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification clicked:', event);
  
  const notification = event.notification;
  const action = event.action;
  
  // Close the notification
  notification.close();
  
  // Handle different actions
  if (action === 'dismiss') {
    console.log('[Service Worker] Notification dismissed');
    return;
  }
  
  // Determine target URL
  let targetUrl = '/doctor/dashboard';
  
  if (notification.data && notification.data.url) {
    targetUrl = notification.data.url;
  }
  
  // Handle view action or notification click
  event.waitUntil(
    self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(clientList => {
      console.log('[Service Worker] Looking for existing window to focus');
      
      // Check if there's already a window/tab open
      for (const client of clientList) {
        if (client.url.includes(targetUrl.split('?')[0]) && 'focus' in client) {
          console.log('[Service Worker] Focusing existing window');
          return client.focus();
        }
      }
      
      // If no existing window, open a new one
      if (self.clients.openWindow) {
        console.log('[Service Worker] Opening new window:', targetUrl);
        return self.clients.openWindow(targetUrl);
      }
    }).catch(error => {
      console.error('[Service Worker] Error handling notification click:', error);
    })
  );
});

// Notification close event
self.addEventListener('notificationclose', event => {
  console.log('[Service Worker] Notification closed:', event.notification.title);
  
  // Track notification close if needed
  // Could send analytics data here
});

// Background sync event (for future use)
self.addEventListener('sync', event => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform background sync tasks
      console.log('[Service Worker] Performing background sync')
    );
  }
});

// Message event - handle messages from main thread
self.addEventListener('message', event => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Send response back to main thread
  event.ports[0].postMessage({
    type: 'SW_MESSAGE_RESPONSE',
    message: 'Service worker received message'
  });
});

// Error event
self.addEventListener('error', event => {
  console.error('[Service Worker] Error:', event.error);
});

// Unhandled rejection event
self.addEventListener('unhandledrejection', event => {
  console.error('[Service Worker] Unhandled promise rejection:', event.reason);
});

console.log('[Service Worker] Script loaded successfully');