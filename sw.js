const version = "0.6.18";
const cacheName = `gameproxy`;
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll([
        `/`,
        `/`,
        `/style.css`,
        `/script.js`,
        `/lib/showdown.min.js`,
        `/lib/jquery.min.js`,
        `/footer.html`,
        `/game`,
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
        `/ads/adsList.js`,
        `/ads/GameProxyProHider.png`,
        `/ads/GameProxyProStreaming.png`,
        `/ads/Subnodal.png`,
        `/categories/action/action.js`,
        `/categories/action/`,
        `/categories/adventure/adventure.js`,
        `/categories/adventure/`,
        `/categories/animals/animals.js`,
        `/categories/animals/`,
        `/categories/arcade/arcade.js`,
        `/categories/arcade/`,
        `/categories/boardgame/boardgame.js`,
        `/categories/boardgame/`,
        `/categories/driving/driving.js`,
        `/categories/driving/`,
        `/categories/idle/idle.js`,
        `/categories/idle/`,
        `/categories/multiplayer/multiplayer.js`,
        `/categories/multiplayer/`,
        `/categories/mystery/mystery.js`,
        `/categories/mystery/`,
        `/categories/platformer/platformer.js`,
        `/categories/platformer/`,
        `/categories/puzzle/puzzle.js`,
        `/categories/puzzle/`,
        `/categories/role-playing/role-playing.js`,
        `/categories/role-playing/`,
        `/categories/simulation/simulation.js`,
        `/categories/simulation/`,
        `/categories/sports/sports.js`,
        `/categories/sports/`,
        `/categories/strategy/strategy.js`,
        `/categories/strategy/`,
        `/categories/survival/survival.js`,
        `/categories/survival/`,
        `/help/`,
        `/help/help.css`,
        `/help/help.js`,
        `/help/articles/list.md`,
        `/help/articles/0001-supportedFileTypes.md`,
        `/help/articles/0002-howToReportAGame.md`,
        `/help/articles/0003-howToEnableFlashOnGameProxy.md`,
        `/help/articles/0004-howToUploadAGameToGameProxy.md`,
        `/help/articles/0005-howToSearchOnGameProxy.md`,
        `/help/articles/0006-verificationRequirements.md`,
        `/help/articles/0007-aboutAds.md`,
        `/help/articles/0008-howToUploadAGameFromScratchToGameProxy.md`,
        `/help/articles/0009-howToPlayScratchGamesOnGameProxyAndTroubleshooting.md`,
        `/help/articles/0010-uploadAllGameTypesList.md`,
        `/help/articles/0011-generalTroubleshooting.md`,
        `/help/articles/0012-howToUploadHTML5Games.md`,
        `/help/articles/0013-FAQs.md`,
        `/help/articles/0014-aboutAdmins.md`,
        `/help/articles/0015-whatButtonsMeanWhat.md`,
        `/info/privacy.md`,
        `/info/proTerms.md`,
        `/info/terms.md`,
        `/lang/overrides.js`,
        `/lib/jquery-ui-touch-punch.min.js`,
        `/lib/jquery-ui.css`,
        `/lib/jquery-ui.js`,
        `/lib/jscolor.js`,
        `/lib/lang.js`,
        `/lib/sha256.min.js`,
        `/lib/swf2js.js`,
        `/merch/`,
        `/pro/getNow.html`,
        `/pro/getNow.js`,
        `/pro/`,
        `/pro/paymentComplete.html`,
        `/pro/paymentError.html`,
        `/pro/paymentError.js`,
        `/pro/paymentRequest.html`,
        `/pro/paymentRequest.js`,
        `/pro/pro.js`,
        `/pro/proTerms.html`,
        `/pro/streaming.js`,
        `/pro/style.css`,
        `/pro/subEnded.html`,
        `/wrappers/flash-wrapper.xml`,
        `/.gitignore`,
        `/404.html`,
        `/about`,
        `/acceptedDonate.html`,
        `/account`,
        `/account.js`,
        `/accountGameList.js`,
        `/admin`,
        `/adminGameList.js`,
        `/ads.js`,
        `/assignedLetters.md`,
        `/cancelDonate.html`,
        `/chat.html`,
        `/CNAME`,
        `/coins.md`,
        `/copytoclipboard.js`,
        `/countdown.css`,
        `/countdown.html`,
        `/countdown.js`,
        `/countdownAdminSignIn.html`,
        `/countdownAdminSignIn.js`,
        `/countdownTest.js`,
        `/favicon.ico`,
        `/firebase-messaging-sw.js`,
        `/gameCategories.md`,
        `/gamefilelocations.md`,
        `/gameList.js`,
        `/gameListSources.md`,
        `/gameUpload.html`,
        `/gameUpload.js`,
        `/gpProList.js`,
        `/helpUs`,
        `/LICENCE.md`,
        `/motd.js`,
        `/notifications`,
        `/notifications.js`,
        `/notSupported.html`,
        `/privacy.html`,
        `/profanityFilter.js`,
        `/profile`,
        `/profile.js`,
        `/profileGameList.js`,
        `/profileNotFound.html`,
        `/proSettings`,
        `/proSettings.js`,
        `/README.md`,
        `/report`,
        `/settings`,
        `/share.html`,
        `/sitemap.xml`,
        `/social.html`,
        `/staffList.js`,
        `/style.css`,
        `/styleFallback.css`,
        `/terms`,
        `/testpage.html`,
        `/unreadNotifications.js`,
        `/chat/console.html`,
        `/chat/console.js`,
        `/chat/dashboard.html`,
        `/chat/dashboard.js`,
        `/chat/`,
        `/chat/index.js`,
        `/chat/manifest.json`,
        `/chat/newServer.html`,
        `/chat/script.js`,
        `/chat/style.css`,
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