/* ReSharps Service Worker v3 */
const CACHE_NAME = 'resharps-v3';

self.addEventListener('install', event => {
  // Slet alle gamle caches ved installation
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Supabase og index.html — aldrig cache, altid frisk
  if (url.hostname.includes('supabase.co') ||
      url.pathname.endsWith('/') ||
      url.pathname.endsWith('index.html')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Alt andet — network first
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
