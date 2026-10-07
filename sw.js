const CACHE_NAME="macroservice-v5.11";
const ASSETS=[
  "./",
  "./index.html",
  "./styles.css?v=5.11",
  "./integrations.js?v=5.11",
  "./catalog.js?v=5.11",
  "./procedures.js?v=5.11",
  "./app.js?v=5.11",
  "./logo.png",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./manifest.webmanifest"
];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  const url=new URL(event.request.url);
  // APIs externas (BrasilAPI/FIPE etc.) ficam fora do cache do PWA.
  if(url.origin!==self.location.origin){
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then(response=>{
        const copy=response.clone();
        caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));
        return response;
      })
      .catch(()=>caches.match(event.request).then(cached=>cached||caches.match("./")))
  );
});
