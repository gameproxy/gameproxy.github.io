var hasGameProxyPro = false;
var gpProInterval = null;
var gpProThemes = [
    {
        "--primaryColour": "#b3c20f",
        "--secondaryColour": "#d3e226",
        "--secondaryLogoColour": "#d9e187",
        "--badColour": "rgba(255, 255, 255, 0.2)",
        "--reallyBadColour": "#ef2727",
        "--primaryBackgroundColour": "#262626",
        "--secondaryBackgroundColour": "#424242",
        "--highlightColour": "#27ef70",
        "--secondaryHighlightColour": "rgba(39, 239, 112, 0.2)",
        "--lightAccentText": "black",
        "--lightMainText": "white",
        "--badColourText": "white"
    },
    {
        "--primaryColour": "#239bc2",
        "--secondaryColour": "#ffffff",
        "--secondaryLogoColour": "#0057e1",
        "--badColour": "#cecece",
        "--reallyBadColour": "#ee5353",
        "--primaryBackgroundColour": "#e1e1e1",
        "--secondaryBackgroundColour": "#c0c0c0",
        "--highlightColour": "#00acef",
        "--secondaryHighlightColour": "rgba(39, 239, 112, 0.2)",
        "--lightAccentText": "black",
        "--lightMainText": "black",
        "--badColourText": "white"
    },
    {
        "--primaryColour": "#00ff00",
        "--secondaryColour": "#0000ff",
        "--secondaryLogoColour": "#00ffff",
        "--badColour": "#2d2d2d",
        "--reallyBadColour": "#ff0000",
        "--primaryBackgroundColour": "#000000",
        "--secondaryBackgroundColour": "#1c1c1c",
        "--highlightColour": "#ff00ff",
        "--secondaryHighlightColour": "rgba(39, 239, 112, 0.2)",
        "--lightAccentText": "black",
        "--lightMainText": "white",
        "--badColourText": "white"
    },
    {
        "--primaryColour": "#008080",
        "--secondaryColour": "#0000cb",
        "--secondaryLogoColour": "#dede60",
        "--badColour": "#909090",
        "--reallyBadColour": "#ff0000",
        "--primaryBackgroundColour": "#c0c0c0",
        "--secondaryBackgroundColour": "#00007b",
        "--highlightColour": "#fc8e00",
        "--secondaryHighlightColour": "rgba(39, 239, 112, 0.2)",
        "--lightAccentText": "white",
        "--lightMainText": "#606060",
        "--badColourText": "white"
    }
];
var gpProThemeMetas = [
    {
        "largeLogo": "media/ProLarge.png",
        "smallLogo": "media/ProSmall.png"
    },
    {
        "largeLogo": "media/WhiteLarge.png",
        "smallLogo": "media/WhiteSmall.png"
    },
    {
        "largeLogo": "media/WhiteLarge.png",
        "smallLogo": "media/WhiteSmall.png"
    },
    {
        "largeLogo": "media/WhiteLarge.png",
        "smallLogo": "media/WhiteSmall.png"
    }
];
var gpProTheme = 0;

function setCustomTheme() {
    var savedItems = 0;

    dialog("Saving theme...", "Please wait whilst we save your custom theme...", []);

    $(".proCustomThemeProperty").each(function() {
        firebase.database().ref("users/" + currentUid + "/_settings/gpPro/data/customTheme/css/--" + $(this).attr("data-css-value")).set("#" + $(this).val()).then(function() {
            savedItems++;

            if (savedItems >= 11) {
                window.location.reload();
            }
        });
    });
}

function implementGPPro() {
    if (hasGameProxyPro) {
        clearInterval(gpProInterval);

        firebase.database().ref("users/" + currentUid + "/_settings/gpPro/data/theme").on("value", function(snapshot) {
            if (snapshot.val() != null) {
                if (snapshot.val() != -1) { // Any theme except default
                    function changeTheme(css, metas) {
                        for (var i = 0; i < Object.keys(css).length; i++) {
                            $("body")[0].style.setProperty(Object.keys(css)[i], css[Object.keys(css)[i]]);
                        }
        
                        $(".pill:not(.selected)").css("color", "unset");
                        $(".dialogBackground").css("background-color", "rgba(179, 194, 14, 0.5)");
                        $(".card.coloured").css("background-color", "rgba(255, 255, 255, 0.2)");
                        $("header .desktop img").attr("src", metas.largeLogo);
                        $("header .mobile img").attr("src", metas.smallLogo);
                        
                        setInterval(function() {
                            try {
                                $(".pill.selected")[0].style.setProperty("color", "var(--lightAccentText)");
                                $(".pill:not(.selected)")[0].style.setProperty("color", "var(--lightMainText)");
                            } catch {}
        
                            $("button.bad, button.reallyBad").css("color", "var(--badColourText)");
                            $(".fullscreenWatermark").hide();
                        }, 10);
                    }
                    
                    if (snapshot.val() == -2) { // Custom theme, changing gpProCSS by Firebase
                        dialog("Loading theme...", "Please wait whilst we load your custom theme...", []);                        

                        firebase.database().ref("users/" + currentUid + "/_settings/gpPro/data/customTheme").once("value", function(childSnapshot) {
                            var css;
                            var metas;

                            var defaultCSS = {
                                "--primaryColour": "#b3c20f",
                                "--secondaryColour": "#d3e226",
                                "--secondaryLogoColour": "#d9e187",
                                "--badColour": "#666666",
                                "--reallyBadColour": "#ef2727",
                                "--primaryBackgroundColour": "#262626",
                                "--secondaryBackgroundColour": "#424242",
                                "--highlightColour": "#27ef70",
                                "--lightAccentText": "#000000",
                                "--lightMainText": "#ffffff",
                                "--badColourText": "#ffffff"
                            };
                            
                            try {
                                css = childSnapshot.val().css || defaultCSS;
                                metas = childSnapshot.val().useWhiteLogo ? {
                                    "largeLogo": "media/WhiteLarge.png",
                                    "smallLogo": "media/WhiteSmall.png"
                                } : {
                                    "largeLogo": "media/BlackLarge.png",
                                    "smallLogo": "media/BlackSmall.png"
                                };
                            } catch (e) {
                                css = defaultCSS;
                                metas = {
                                    "largeLogo": "media/BlackLarge.png",
                                    "smallLogo": "media/BlackSmall.png"
                                }
                            }

                            $(".proCustomTheme").show();

                            closeDialog();

                            changeTheme(css, metas);

                            for (var i = 0; i < Object.keys(css).length; i++) {
                                $(".proCustomThemeProperty[data-css-value='" + Object.keys(css)[i].replace(/--/g, "") + "']")[0].jscolor.fromString(css[Object.keys(css)[i]].replace(/#/g, "").toUpperCase());
                            }
                        });
                    } else { // Chosen theme
                        changeTheme(gpProThemes[snapshot.val()], gpProThemeMetas[snapshot.val()]);

                        $(".proCustomTheme").hide();
                    }
                }
            }
        });

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
                if (isGameProxyPro(user.uid)) {
                    firebase.database().ref("users/" + currentUid + "/_settings/gpPro/purchaseTime").once("value", function(snapshot) {
                        firebase.database().ref("users/" + currentUid + "/_settings/gpPro/vouchers").once("value", function(totalSnapshot) {
                            var totalPeriod = 0;
                        
                            for (item in totalSnapshot.val()) {
                                totalPeriod += totalSnapshot.val()[item].period;
                            }
        
                            var now = new Date().getTime();
                            var countdownDate = snapshot.val() + totalPeriod;

                            if (countdownDate - now <= 0) {
                                firebase.database().ref("users/" + currentUid + "/_settings/gpPro/hasGPPro").set(null).then(function() {
                                    firebase.database().ref("users/" + currentUid + "/_settings/gpPro/vouchers").set(null).then(function() {
                                        firebase.database().ref("users/" + currentUid + "/_settings/gpPro/purchaseTime").set(null).then(function() {
                                            window.location.href = "pro/subEnded.html";
                                        });
                                    });
                                });
                            }
                        });
                    });
                }

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
