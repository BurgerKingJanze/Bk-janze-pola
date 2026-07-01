// Service worker v3 — réseau d'abord pour toujours avoir la dernière version
const CACHE = "bk-tpm-v3";
const ASSETS = ["./", "./index.html", "./manifest.json", "./logo-app.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{})));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const url = e.request.url;
  // Jamais de cache pour Supabase
  if (url.includes("supabase.co")) return;
  // Réseau d'abord (network-first) : on récupère la version fraîche,
  // et on ne retombe sur le cache que si hors-ligne.
  e.respondWith(
    fetch(e.request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
      return resp;
    }).catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
