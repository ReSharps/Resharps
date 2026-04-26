/* ════════════════════════════════════════════
   ReSharps – Service Worker
   Cacher app-skallen så den loader hurtigt
   selv på dårlig forbindelse
════════════════════════════════════════════ */

const CACHE_NAME = 'resharps-v1';
const APP_SHELL = [
  './',
  './index.html',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js'
];

/* ── Installation: cache app-shell ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(APP_SHELL);
    }).then(() => self.skipWaiting())
  );
});

/* ── Aktivering: ryd gamle caches ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch: cache-first for app-shell, network-first for API ── */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Supabase API-kald går altid direkte på netværket
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // App-shell: cache-first (hurtig load)
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache kun gyldige responses
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      }).catch(() => {
        // Offline fallback: returner cached index.html
        return caches.match('./index.html');
      });
    })
  );
});

/* ── Baggrundssync (fremtidssikring) ── */
self.addEventListener('sync', event => {
  if (event.tag === 'sync-varer') {
    console.log('Baggrundssync: varer');
  }
});
