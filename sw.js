/* ReSharps SW – Kill switch: sletter alt og afregistrerer */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.map(k => caches.delete(k))))
    .then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.map(k => caches.delete(k))))
    .then(() => self.registration.unregister())
    .then(() => self.clients.matchAll()).then(clients => {
      clients.forEach(c => c.navigate(c.url));
    })
  );
});
