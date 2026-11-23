/* Offline shell for the 5v5 apps. One generic worker: copy it next to each app's index.html.
   Pages are served from the cache first and refreshed in the background, so a coach with no signal
   still gets the app. When the refreshed page differs from the cached one, open pages are told so
   they can offer "New version ready". Only same-origin GET requests are handled. */
var CACHE = '5v5-shell-v1';

self.addEventListener('install', function(e){self.skipWaiting();});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
  }).then(function(){return self.clients.claim();}));
});

/* pages ask the worker to keep specific same-origin URLs ready for offline use */
var refreshing = {};
function flagKey(u){return '/__updated?'+encodeURIComponent(u);}
self.addEventListener('message', function(e){
  var d = e.data;
  if(d && d.type==='status' && d.url){
    /* a freshly loaded page asks whether a newer copy than the one it shows has arrived */
    var src = e.source;
    e.waitUntil(Promise.resolve(refreshing[d.url]).catch(function(){}).then(function(){
      return caches.open(CACHE).then(function(c){return c.match(flagKey(d.url));});
    }).then(function(m){if(m && src) src.postMessage({type:'updated'});}));
    return;
  }
  if(!d || d.type!=='precache' || !Array.isArray(d.urls)) return;
  var urls = d.urls.filter(function(u){try{return new URL(u, self.location.href).origin===self.location.origin;}catch(x){return false;}});
  e.waitUntil(caches.open(CACHE).then(function(c){
    return Promise.all(urls.map(function(u){return c.add(new Request(u,{cache:'reload'})).catch(function(){});}));
  }));
});

function changed(a,b){
  return ['etag','last-modified','content-length'].some(function(h){return a.headers.get(h)!==b.headers.get(h);});
}

self.addEventListener('fetch', function(e){
  var r = e.request;
  if(r.method!=='GET' || new URL(r.url).origin!==self.location.origin) return;
  e.respondWith(caches.open(CACHE).then(function(c){
    return c.match(r).then(function(hit){
      var nav = r.mode==='navigate';
      if(nav && hit) c.delete(flagKey(r.url));   /* this visit shows what the cache holds, so any earlier update flag is spent */
      var net = fetch(r.url,{cache:'no-cache',credentials:'same-origin'}).then(function(res){   /* revalidate, so a heuristically cached copy never hides a new deploy */
        if(res && res.ok){
          var copy = res.clone();
          return c.put(r, copy).then(function(){
            if(hit && nav && changed(hit,res)) return c.put(flagKey(r.url), new Response('1'));
          }).then(function(){return res;});
        }
        return res;
      }).catch(function(){return hit;});
      if(nav) refreshing[r.url] = net;
      e.waitUntil(net.catch(function(){}));   /* keep the worker alive until the background refresh is done */
      return hit || net;
    });
  }));
});
