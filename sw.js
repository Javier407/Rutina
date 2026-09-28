// Service worker: la app funciona sin internet en el gym
const VERSION = "rutina-v5";
const SHELL = [
  "./", "index.html", "manifest.webmanifest", "css/styles.css",
  "js/data.js", "js/store.js", "js/voice.js", "js/motivation.js", "js/figures.js", "js/session.js", "js/progress.js", "js/app.js",
  "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/apple-touch-icon.png"
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Archivos propios: red primero (para recibir actualizaciones) y caché si no hay conexión
  if (url.origin === location.origin) {
    e.respondWith(fetch(req).then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return res; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match("index.html"))));
    return;
  }
  // Fuentes de Google: caché primero
  if (/fonts\.(googleapis|gstatic)\.com/.test(url.host)) {
    e.respondWith(caches.match(req).then((r) => r || fetch(req).then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return res; })));
  }
});
