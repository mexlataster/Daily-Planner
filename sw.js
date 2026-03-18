const VERSION = '2026.03.18.14';
const CACHE = 'habits-' + VERSION;

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll())
      .then(clients => clients.forEach(c => c.postMessage({type:'UPDATED'})))
  );
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('supabase.co')) return;
  if (e.request.url.includes('fonts.googleapis') || e.request.url.includes('fonts.gstatic') || e.request.url.includes('jsdelivr')) {
    e.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(e.request).then(cached =>
          cached || fetch(e.request).then(r => { cache.put(e.request, r.clone()); return r; })
        )
      )
    );
    return;
  }
  e.respondWith(
    fetch(e.request, { cache: 'no-store' })
      .then(r => {
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
