const C="ritmo-v10";
const FILES=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","icon.svg"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
// Páginas: primero la red (para recibir mejoras), si no hay conexión, la copia guardada.
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const sameOrigin=new URL(e.request.url).origin===location.origin;
  if(e.request.mode==="navigate"){
    e.respondWith(fetch(e.request).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put("index.html",cp));return res}).catch(()=>caches.match("index.html")));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{if(res.ok&&sameOrigin){const cp=res.clone();caches.open(C).then(c=>c.put(e.request,cp))}return res})));
});
self.addEventListener("notificationclick",e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:"window"}).then(cs=>cs.length?cs[0].focus():self.clients.openWindow("./")))});
