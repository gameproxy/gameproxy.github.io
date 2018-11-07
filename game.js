var gameData = {};

function getURLParameter(name) {
    return decodeURIComponent((new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null;
}

function refreshCreatorPpic() {
    firebase.storage().ref("users/" + gameData.uid + "/_settings/ppic.png").getDownloadURL().then(function(data) {
        $(".creatorAccountPicture").attr("src", data);
    });
}

function like() {
    firebase.database().ref("games/" + getURLParameter("play") + "/metrics").once("value", function(snapshot) {
        var likesData = snapshot.val();

        if (likesData.likesProof === undefined) {
            likesData.likesProof = [];
        }

        if (likesData.likesProof.indexOf(currentUid) > -1) {
            firebase.database().ref("games/" + getURLParameter("play") + "/metrics/likes").set(likesData.likes - 1);
            firebase.database().ref("games/" + getURLParameter("play") + "/metrics/likesProof").set(likesData.likesProof.filter(function(element) {
                return element != currentUid;
            }));
        } else {
            firebase.database().ref("games/" + getURLParameter("play") + "/metrics/likes").set(likesData.likes + 1);
            firebase.database().ref("games/" + getURLParameter("play") + "/metrics/likesProof").set(likesData.likesProof.concat([currentUid]));
        }
    });
};

function showMoreDescription() {
    $(".gameDescription").css("max-height", "unset");
    $(".gameSeeMore").hide();
}

function fullscreen(goFullscreen = true) {
    if (goFullscreen) {
        $("object, #gameIframe").css({
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 1
        });

        $("embed").css("height", "100vh");
        $("body").css("overflow", "hidden");
        $("#gameExitFullscreen").show();
        $("#gameIframe").focus();

        try {
            document.body.requestFullscreen();
        } catch (e) {}

        try {
            document.body.webkitRequestFullScreen();
        } catch (e) {}

        try {
            document.body.mozRequestFullScreen();
        } catch (e) {}

        try {
            document.body.msRequestFullScreen();
        } catch (e) {}
    } else {
        $("object, #gameIframe").css({
            position: "unset",
            top: "unset",
            left: "unset",
            width: "calc(100% - 10px)",
            height: "35vw",
            zIndex: "unset"
        });

        $("embed").css("height", "60vh");
        $("body").css("overflow", "unset");
        $("#gameExitFullscreen").hide();
        $("#gameIframe").focus();

        try {
            document.exitFullscreen();
        } catch (e) {}

        try {
            document.webkitCancelFullScreen();
        } catch (e) {}

        try {
            document.mozCancelFullScreen();
        } catch (e) {}

        try {
            document.msExitFullScreen();
        } catch (e) {}
    }
}

function switchToFlash(flash = true) {
    if (flash) {
        window.location.href = window.location.href.substring(0, window.location.href.length - 15);
    } else {
        window.location.href = window.location.href + "&sulfurous=true"
    }
}

$(function() {
    $(".gameVerified").hide();
    $(".gameSeeMore").hide();

    $(".gameDescription").css({
        "max-height": "100px",
        "overflow": "hidden"
    });

    firebase.database().ref("games/" + getURLParameter("play")).once("value", function(snapshot) {
        gameData = snapshot.val();

        $(".gameName").text(gameData.title);
        $(".creatorAccountName").text(gameData.by);
        $(".gameDate").text("Uploaded " + gameData.dateAdded);

        var converter = new showdown.Converter();

        $(".gameDescription").html(converter.makeHtml(gameData.description));

        if ($(".gameDescription").prop("scrollHeight") > $(".gameDescription").height()) {
            $(".gameSeeMore").show();
        }

        if (gameData.byStaff) {
            $(".creatorAccountName").css("color", "#27ef70");
        }

        refreshCreatorPpic();

        if (gameData.src != undefined && gameData.src.endsWith(".swf")) {
            $("#gameFrame").html(`
                <object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0" width="100%" height="100%">
                    <param name="movie" value="` + gameData.src.replace(/http:\/\//g, "https://").replace(/"/g, "") + `" />
                    <param name="quality" value="high" />
                    <param name="scale" value="default" />
                    <embed src="` + gameData.src.replace(/http:\/\//g, "https://").replace(/"/g, "") + `" quality="high" type="application/x-shockwave-flash" width="100%" height="100%" scale="default" pluginspage="http://www.macromedia.com/go/getflashplayer" />
                </object>
                <div class="right">
                    <button aria-label="Go fullscreen" title="Go fullscreen" onclick="fullscreen(true);" class="secondary"><i class="material-icons button">fullscreen</i></button>
                </div>
            `);
        } else if (gameData.src != undefined && gameData.src.startsWith("https://scratch.mit.edu/projects/")) {
            if (getURLParameter("sulfurous") == "true") {
                $("#gameFrame").html(`
                    <iframe src="https://sulfurous.aau.at/html/app.html?id=` + gameData.src.split("/")[4] + `&turbo=false&full-screen=true&aspect-x=4&aspect-y=3&resolution-x=&resolution-y=" id="gameIframe"></iframe>
                    <div class="left">
                        <button onclick="switchToFlash(true);" class="secondary"><i class="material-icons button">flash_on</i> Switch to Flash</button>
                        <button aria-label="Go fullscreen" title="Go fullscreen" onclick="fullscreen(true);" class="secondary floatRight"><i class="material-icons button">fullscreen</i></button>
                    </div>
                `);
            } else {
                $("#gameFrame").html(`
                    <iframe src="https://scratch.mit.edu/projects/embed/` + gameData.src.split("/")[4] + `" id="gameIframe"></iframe>
                    <div class="left">
                        <button onclick="switchToFlash(false);"><i class="material-icons button">offline_bolt</i> Switch to non-Flash</button>
                        <button aria-label="Go fullscreen" title="Go fullscreen" onclick="fullscreen(true);" class="secondary floatRight"><i class="material-icons button">fullscreen</i></button>
                    </div>
                `);
            }
        } else {
            $("#gameFrame").html(`
                <iframe src="` + gameData.src.replace(/"/g, "") + `" id="gameIframe"></iframe>
                <div class="right">
                    <button aria-label="Go fullscreen" title="Go fullscreen" onclick="fullscreen(true);" class="secondary"><i class="material-icons button">fullscreen</i></button>
                </div>
            `);
        }

        if (gameData.verified) {
            $(".gameVerified").show();
        }

        setInterval(function() {
            $("#gameLoader").hide();
            $("#gameFrame").show();
        }, 2000);
    });

    firebase.database().ref("games/" + getURLParameter("play") + "/metrics").on("value", function(snapshot) {
        var likesData = snapshot.val();

        if (likesData.likesProof === undefined) {
            likesData.likesProof = [];
        }

        $(".gameLikes").text(likesData.likes);

        if (likesData.likesProof.indexOf(currentUid) > -1) {
            $("#likeGameButton").removeClass("secondary").addClass("highlight");
        } else {
            $("#likeGameButton").removeClass("highlight").addClass("secondary");
        }

        // Like verification to see if no-one's hacking!
        firebase.database().ref("games/" + getURLParameter("play") + "/metrics/likes").set(likesData.likesProof.length);
    });
});
