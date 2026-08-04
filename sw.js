/* Haylo service worker.
 *
 * Strategy: precache everything (the whole app is ~340 KB), then serve
 * network-first for the HTML so a new deploy is picked up on the next online
 * load, and cache-first for fonts and icons, which are immutable.
 *
 * Bump CACHE whenever you redeploy — that is what evicts the old shell.
 */
const CACHE = 'haylo-v1';

const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/favicon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './fonts/space-grotesk-latin-400-normal.woff2',
  './fonts/space-grotesk-latin-500-normal.woff2',
  './fonts/space-grotesk-latin-600-normal.woff2',
  './fonts/space-grotesk-latin-700-normal.woff2',
  './fonts/inter-latin-400-normal.woff2',
  './fonts/inter-latin-500-normal.woff2',
  './fonts/inter-latin-600-normal.woff2',
  './fonts/space-mono-latin-400-normal.woff2',
  './fonts/space-mono-latin-700-normal.woff2',
  './fonts/comfortaa-latin-400-normal.woff2',
  './fonts/comfortaa-latin-500-normal.woff2',
  './fonts/comfortaa-latin-600-normal.woff2',
  './fonts/comfortaa-latin-700-normal.woff2'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // nothing third-party to handle

  const isDoc = req.mode === 'navigate' || url.pathname.endsWith('.html');

  if (isDoc) {
    // Network-first: always try for a fresh build, fall back to the cached shell.
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html').then(r => r || caches.match('./')))
    );
    return;
  }

  // Cache-first for fonts, icons, manifest.
  event.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }))
  );
});
