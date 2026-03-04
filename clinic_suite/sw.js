const CACHE = "clinic-suite-v1";
const ASSETS = ["./","./index.html","./styles.css","./app.js","./manifest.json","./icons/icon-192.png","./icons/icon-512.png"];
self.addEventListener("install",(e)=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",(e)=>{e.waitUntil(self.clients.claim());});
self.addEventListener("fetch",(e)=>{
  const req = e.request;
  if(req.method!=="GET") return;
  e.respondWith(
    caches.match(req).then((hit)=>hit||fetch(req).then((res)=>{
      const copy=res.clone();
      caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});
      return res;
    }).catch(()=>hit))
  );
});
