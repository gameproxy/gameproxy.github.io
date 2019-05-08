var hasGameProxyPro = false;
var gpProInterval = null;
var gpProCSS = {
    "--primaryColour": "#b3c20f",
    "--secondaryColour": "#d3e226",
    "--secondaryLogoColour": "#d9e187",
    "--badColour": "rgba(255, 255, 255, 0.2)",
    "--reallyBadColour": "#ef2727",
    "--primaryBackgroundColour": "#262626",
    "--secondaryBackgroundColour": "#424242",
    "--highlightColour": "#27ef70",
    "--secondaryHighlightColour": "rgba(39, 239, 112, 0.2)"
};
var gpProTheme = 0;
var gpProThemeInterval = null;

function implementGPPro() {
    clearInterval(gpProInterval);

    if (hasGameProxyPro) {        
        gpProThemeInterval = setInterval(function() {
            firebase.database().ref("users/" + currentUid + "/_settings/gpPro/data/theme").once("value", function(snapshot) {
                if (snapshot.val() == 0) {
                    for (var i = 0; i < Object.keys(gpProCSS).length; i++) {
                        $("body")[0].style.setProperty(Object.keys(gpProCSS)[i], gpProCSS[Object.keys(gpProCSS)[i]]);
                    }

                    $("button, .dialogTitle, .pill.selected, footer, a.skipTo, footer a.footer").css("color", "black");
                    $("button.bad, button.reallyBad").css("color", "white");
                    $(".pill:not(.selected)").css("color", "unset");
                    $(".dialogBackground").css("background-color", "rgba(179, 194, 14, 0.5)");
                    $(".card.coloured").css("background-color", "rgba(255, 255, 255, 0.2)");
                    $("header .desktop img").attr("src", "media/ProLarge.png");
                    $("header .mobile img").attr("src", "media/ProSmall.png");
                    $(".fullscreenWatermark").hide();
                }
            });
        }, 100);

        $(".proOnly").show();
        $(".notProOnly").hide();
    }
}

$(function() {
    hasGameProxyPro = (localStorage.getItem("hasGPPro") == "true");

    implementGPPro();

    firebase.auth().onAuthStateChanged(function(user) {
        gpProInterval = setInterval(function() {
            if (user) {
                if (isGameProxyPro(user.uid) && localStorage.getItem("hasGPPro") != "true") {
                    localStorage.setItem("hasGPPro", "true");
                } else if (!isGameProxyPro(user.uid) && localStorage.getItem("hasGPPro") == "true") {
                    localStorage.removeItem("hasGPPro");
                }
            } else if (localStorage.getItem("hasGPPro") == "true") {
                localStorage.removeItem("hasGPPro");
            }

            hasGameProxyPro = (localStorage.getItem("hasGPPro") == "true");

            implementGPPro();
        }, 1000);
    });
});