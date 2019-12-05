const version = "0.6.18";
const cacheName = `gameproxy`;
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll([
        `/`,
        `/index.html`,
        `/style.css`,
        `/script.js`,
        `/lib/showdown.min.js`,
        `/lib/jquery.min.js`,
        `/footer.html`,
        `/game.html`,
        `/media/Small.png`,
        `/media/Large.png`,
        `https://fonts.googleapis.com/css?family=Roboto|Roboto+Mono|Material+Icons`,
        `/media/browserconfig.xml`,
        `https://www.gstatic.com/firebasejs/5.5.4/firebase.js`,
        `https://www.gstatic.com/firebasejs/5.5.4/firebase.js`,
        `/game.js`,
        `/motd/GameProxyChoice/TheHouse.png`,
        `/motd/Welcome.png`,
        `/motd/Verified.png`,
        `/motd/Pro.png`,
        `/motd/Staff1.png`,
        `/motd/Staff2.png`,
        `/motd/Merch.png`,
        `/motd/InDevelopment.png`,
        `/motd/motdList.js`
      ])
          .then(() => self.skipWaiting());
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(cacheName)
      .then(cache => cache.match(event.request, {ignoreSearch: true}))
      .then(response => {
      return response || fetch(event.request);
    })
  );
});