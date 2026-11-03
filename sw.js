/* PWA demonstrativa: cache limitado ao app shell publicado no escopo do projeto. */
const CACHE='cineglobo-v36-treino-orientado';
const LOCAL=["./","./index.html","./visuals.js","./navigation.mjs","./interaction-targeting.mjs","./training-rules.mjs","./performance-monitor.js","./checkout-zone.js","./character-kit.js","./static-batching.js","./popcorn-training.mjs","./room-training.mjs","./shift-training.mjs","./shift-terminal-visuals.js","./vendor/three.module.js","./manifest.webmanifest","./icon.svg"];
const APP_URL=new URL(self.registration.scope);
const CACHED_PATHS=new Set(LOCAL.map(path=>new URL(path,APP_URL).pathname));

self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(LOCAL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(
  keys.filter(key=>key.startsWith('cineglobo-')&&key!==CACHE).map(key=>caches.delete(key))
 )).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 // Não interceptar APIs, recursos externos, outras páginas do github.io ou URLs com query.
 if(url.origin!==APP_URL.origin||!url.pathname.startsWith(APP_URL.pathname)||
    !CACHED_PATHS.has(url.pathname)||url.search)return;

 event.respondWith(caches.open(CACHE).then(async cache=>{
  const cached=await cache.match(event.request);
  if(cached)return cached;
  try{
   const response=await fetch(event.request);
   if(response.ok&&response.type==='basic'){
    event.waitUntil(cache.put(event.request,response.clone()).catch(()=>{}));
   }
   return response;
  }catch{
   return Response.error();
  }
 }));
});
