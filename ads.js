var currentAd = 0;

function loadAd() {
    currentAd = random(0, adsList.length - 1);

    console.log(currentAd);

    $(".ad").attr("src", adsList[currentAd]["src"]);
    $(".ad").attr("alt", adsList[currentAd]["alt"]);
    $(".ad").attr("onclick", adsList[currentAd]["onclick"]);
}

firebase.auth().onAuthStateChanged(function() {
    if (!hasGameProxyPro) {
        loadAd();
    }
});