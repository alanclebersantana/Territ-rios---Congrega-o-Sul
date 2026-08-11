/* Service worker — Territórios */
const CACHE = 'territorios-v11';
const SHELL = ['./index.html','./manifest.json','./mapas/geral.png',
  './icon-96.png','./icon-192.png','./icon-384.png','./icon-512.png',
  './icon-192-maskable.png','./icon-512-maskable.png','./icon-32.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== location.origin) return;

  // manifesto e ícones: rede primeiro, para atualizarem sem depender do cache
  if (/manifest\.json$|icon-.*\.png$/.test(req.url)) {
    e.respondWith(fetch(req).then(r => {
      const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); return r;
    }).catch(() => caches.match(req)));
    return;
  }
  if (req.mode === 'navigate' || req.destination === 'document') {
    e.respondWith(fetch(req).then(r => {
      const c = r.clone(); caches.open(CACHE).then(x => x.put('./index.html', c)); return r;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); return r;
  })));
});
