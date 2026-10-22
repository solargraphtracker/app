var C="sg-v4",F=["./","index.html","manifest.json","icon-192.png","icon-512.png","icon-180.png"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(C).then(function(c){return c.addAll(F)}));self.skipWaiting()});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==C}).map(function(x){return caches.delete(x)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener("fetch",function(e){if(e.request.method!=="GET"||new URL(e.request.url).origin!==location.origin)return;
e.respondWith(fetch(e.request,{cache:"no-cache"}).then(function(r){if(r.status===200){var cp=r.clone();caches.open(C).then(function(c){return c.put(e.request,cp)}).catch(function(){})}return r}).catch(function(){return caches.match(e.request,{ignoreSearch:true})}))});
