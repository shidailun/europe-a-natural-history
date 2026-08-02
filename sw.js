var CACHE = 'enh-v4';
var ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-180.png',
              './img/hero-europe.jpg'];
var IMAGES = [
  './img/02-messel-pit.jpg', './img/03-darwinius.jpg', './img/04-magyarosaurus.jpg',
  './img/05-deinogalerix.jpg', './img/06-gibraltar.jpg', './img/07-mammoth.jpg',
  './img/08-cave-lion.jpg', './img/09-neanderthal.jpg', './img/10-chauvet.jpg',
  './img/11-lion-man.jpg', './img/12-altamira.jpg', './img/13-gobekli-tepe.jpg',
  './img/14-aurochs.jpg', './img/15-great-auk.jpg', './img/17-bison.jpg',
  './img/18-koniks.jpg', './img/19-macaque.jpg', './img/20-lynx.jpg',
  './img/21-nopcsa.jpg'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      // The shell must land in full, or the install fails and we retry later.
      return c.addAll(ASSETS).then(function () {
        // Photographs are cached one by one so a single failure can't strand the app.
        return Promise.all(IMAGES.map(function (u) {
          return c.add(u).catch(function () {});
        }));
      });
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(e.request).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      }).catch(function () { return hit || caches.match('./index.html'); });
      return hit || net;
    })
  );
});
