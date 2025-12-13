const CACHE_NAME = 'pauferflix-v1';
const RUNTIME_CACHE = 'pauferflix-runtime';
const IMAGES_CACHE = 'pauferflix-images';

// App Shell - recursos essenciais para funcionamento offline
const APP_SHELL = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching App Shell');
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// Ativação - limpar caches antigos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE && cacheName !== IMAGES_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estratégia de cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições que não são HTTP/HTTPS
  if (!request.url.startsWith('http')) {
    return;
  }

  // Sempre usar Network-First para documentos (HTML / navegação)
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // Cache-First para imagens
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGES_CACHE).then((cache) => {
        return cache.match(request).then((response) => {
          return (
            response ||
            fetch(request).then((networkResponse) => {
              cache.put(request, networkResponse.clone());
              return networkResponse;
            })
          );
        });
      })
    );
    return;
  }

  // Network-First para API calls (TMDb)
  if (url.hostname === 'api.themoviedb.org') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Cache-First para outros recursos estáticos (CSS, JS, fontes, etc.)
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(request)
        .then((networkResponse) => {
          // Cachear apenas requisições GET bem-sucedidas
          if (request.method === 'GET' && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Em último caso, para navegação sem conexão, usa página offline
          if (request.destination === 'document') {
            return caches.match('/offline.html');
          }
        });
    })
  );
});

// Notificar cliente sobre atualização disponível
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
