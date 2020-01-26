function dialog(title, content, buttons = [{text: "Close", onclick: "closeDialog();", type: "primary"}], allowEscape = true) {
    $(".dialog").html(`
        <div class="dialogTitle cutOff"></div>
        <div class="dialogContent"></div>
        <div class="dialogActions"></div>
    `);

    $(".dialogTitle").text(title);
    $(".dialogContent").html(content);

    for (var i = 0; i < buttons.length; i++) {
        $(".dialogActions").html(
            $(".dialogActions").html() +
            "<button" +
            (
                buttons[i].type == "secondary" ?
                " class='secondary'" :
                (
                    buttons[i].type == "bad" ?
                    " class='bad'" :
                    (
                        buttons[i].type == "reallyBad" ?
                        " class='reallyBad'" :
                        (
                            buttons[i].type == "highlight" ?
                            " class='highlight'" :
                            ""
                        )
                    )
                )
            ) +
            " onclick='" +
            buttons[i].onclick +
            "'>" +
            buttons[i].text +
            "</button>"
        );
    }

    if (allowEscape) {
        $(".dialogBackground").attr("onclick", "closeDialog();");
    } else {
        $(".dialogBackground").attr("onclick", "");
    }

    $(".dialogBackground").fadeIn();
    $(".dialog").fadeIn();
}

function closeDialog() {
    $(".dialogBackground").fadeOut();
    $(".dialog").fadeOut();
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

window.alert = function(text, title = "Information") {
    dialog(title, text, [{text: "OK", onclick: "closeDialog();", type: "primary"}]);
};

$(function() {
    $("*[import]").each(function() {
        if (!window.location.href.startsWith("file:///")) {
            var thisPassOn = this;

            $.ajax({
                url: $(this).attr("import"),
                error: function() {
                    $(thisPassOn).html("Could not load associated information.");
                }
            }).done(function(data) {
                $(thisPassOn).html(data);
            });
        } else {
            $(this).html("<em>Content will go here at run-time: " + $(this).attr("import") + "</em>");
        }
    });

    $("*[markdown]").each(function() {
        if (!window.location.href.startsWith("file:///")) {
            var thisPassOn = this;

            $.ajax({
                url: $(this).attr("markdown"),
                error: function() {
                    $(thisPassOn).html("Could not load associated information.");
                }
            }).done(function(data) {
                $(thisPassOn).html(new showdown.Converter().makeHtml(data));
            });
        } else {
            $(this).html("<em>Content will go here at run-time: " + $(this).attr("markdown") + "</em>");
        }
    });

    $("body").on("mousedown", "*", function(event) {
        if (($(this).is(":focus") || $(this).is(event.target)) && $(this).css("outline-style") == "none") {
            $(this).css("outline", "none").on("blur", function() {
                $(this).off("blur").css("outline", "");
            });
        }
    });

    setInterval(function() {
        $("*[markdownrf]").each(function() {
            if (!window.location.href.startsWith("file:///")) {
                var thisPassOn = this;

                $.ajax({
                    url: $(this).attr("markdownrf"),
                    error: function() {
                        $(thisPassOn).html("Could not load associated information.");
                    }
                }).done(function(data) {
                    if ($(thisPassOn).html() != new showdown.Converter().makeHtml(data)) {
                        $(thisPassOn).html(new showdown.Converter().makeHtml(data));
                    }
                });
            } else {
                $(this).html("<em>Content will go here at run-time: " + $(this).attr("markdownrf") + "</em>");
            }
        });
    }, 1000);

    firebase.auth().onAuthStateChanged(function() {
        if (isStaff(currentUid)) {
            $(".admin").css("display", "block");
            $(".adminSpan").css("display", "inline-block");
            $(".notAdmin").css("display", "none");
            $(".notAdminSpan").css("display", "none");
        } else {
            $(".admin").css("display", "none");
            $(".adminSpan").css("display", "none");
            $(".notAdmin").css("display", "block");
            $(".notAdminSpan").css("display", "inline-block");
        }
    });

    setInterval(function() {
        $(".loader").css("color", "#262626");
    }, 4000);

    setTimeout(function() {
        setInterval(function() {
            $(".loader").css("color", "#424242");
        }, 4000);

        $(".loader").css("color", "#424242");
    }, 2000);

    $(".loader").css("color", "#262626");

    (function() {
        var isChromium = window.chrome;
        var winNav = window.navigator;
        var vendorName = winNav.vendor;
        var isOpera = typeof window.opr !== "undefined";
        var isIEedge = winNav.userAgent.indexOf("Edge") > -1;
        var isIOSChrome = winNav.userAgent.match("CriOS");
        var isSafari = winNav.userAgent.indexOf("Safari") > -1;
        var isFirefox = navigator.userAgent.search("Firefox") > -1;
        var isSamsungBrowser = navigator.userAgent.match(/samsungBrowser/i);

        if (!(
            isChromium !== null &&
            typeof isChromium !== "undefined" &&
            vendorName === "Google Inc." &&
            isOpera === false &&
            isIEedge === false
        ) && (
            !isFirefox &&
            !isIOSChrome &&
            !isSamsungBrowser &&
            !isSafari
        )) {
            window.location.href = "/notSupported.html";
        }
    })();
});

function copyCurrentURL() {
    var dummy = document.createElement("input"),
    text = window.location.href;

    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}

// Keyboard Shortcuts

$(document).ready(function () {
    $('body').on('keydown',function(e){
        if (e.altKey && e.which == 71) {
            // Alt + G (redirects to index.html)
            window.location.href = "/index.html";  
        } else if (e.altKey && e.which == 67) {
            // Alt + C (redirects to chat.html)
            window.location.href = "/chat.html";
        } else if (e.altKey && e.which == 65) {
            // Alt + A (redirects to account.html)
            window.location.href = "/account.html";
        } else if (e.altKey && e.which == 82) {
            // Alt + R (redirects to upload.html)
            window.location.href = "/upload.html";
        } else if (window.location.href.indexOf("/game.html") > -1) {
            if (e.altKey && e.which == 76) {
                // Alt + L (likes/unlikes game)
                like();
            } else if (e.altKey && e.which == 85) {
                // Alt + U (goes to uploader's profile)
                document.getElementById("uploaderProfile").click();
            }
        }
    });
});

function capitalizeText(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
});

if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(function(registration) {
            console.log('Service Worker Registered');
      });
    navigator.serviceWorker.ready.then(function(registration) {
       console.log('Service Worker Ready');
    });
  }