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
        `/styleFallback.css`,
        `/staffList.js`,
        `/media/AnonUser.png`,
        `/media/BlackLarge.png`,
        `/media/BlackSmall.png`,
        `/media/CleanSquare.png`,
        `/media/DonateButton.png`,
        `/media/GitHub_logo.png`,
        `/media/Help Centre.png`,
        `/media/NoThumbnail.png`,
        `/media/ProBack.png`,
        `/media/ProLarge.png`,
        `/media/ProSmall.png`,
        `/media/ProText.png`,
        `/media/QuestionBlockArt.svg`,
        `/media/Reddit_logo.png`,
        `/media/SFK.png`,
        `/media/Shadow.png`,
        `/media/square.png`,
        `/media/TilesArt.svg`,
        `/media/Twitch_logo.png`,
        `/media/WhiteLarge.png`,
        `/media/WhiteSmall.png`,
        `/media/YouTube_logo.png`,
        `/media/featureThumbnails/attribution.png`,
        `/media/Help Centre/Article 0001/No Preview Available - Google Drive.PNG`,
        `/media/Help Centre/Article 0001/Share With Others - Google Drive.PNG`,
        `/media/Help Centre/Article 0003/Allowances.PNG`,
        `/media/Help Centre/Article 0003/SiteSettings.PNG`,
        `/media/Help Centre/Article 0004/CreateNewRepository.PNG`,
        `/media/Help Centre/Article 0004/GitHubPages.PNG`,
        `/media/Help Centre/Article 0004/QuickSetup.PNG`,
        `/media/Help Centre/Article 0004/SitePublished.PNG`,
        `/media/Help Centre/Article 0004/UploadFiles.PNG`,
        `/media/Help Centre/Article 0004/URL.PNG`,
        `/media/paymentIcons/checkoutPageLogo.png`,
        `/media/paymentIcons/checkoutProLogo.png`,
        `/media/paymentIcons/pay.png`,
        `/media/Theme Thumbnails/Commander.png`,
        `/media/Theme Thumbnails/Custom.png`,
        `/media/Theme Thumbnails/Eighties.png`,
        `/media/Theme Thumbnails/Elektro.png`,
        `/media/Theme Thumbnails/GameProxy Pro.png`,
        `/media/Theme Thumbnails/GameProxy.png`,
        `/media/Theme Thumbnails/Hot Pink.png`,
        `/media/Theme Thumbnails/Nineties.png`,
        `/media/motd/motdList.js`
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