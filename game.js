var gameData = {};

var gameCategories = {
    "none": "Uncategorised",
    "action": "Action",
    "adventure": "Adventure",
    "animals": "Animals",
    "arcade": "Arcade",
    "board": "Board Game",
    "driving": "Driving",
    "idle": "Idle",
    "multiplayer": "Multiplayer",
    "mystery": "Mystery",
    "platformer": "Platformer",
    "puzzle": "Puzzle",
    "rp": "Role-Playing",
    "simulation": "Simulation",
    "sports": "Sports",
    "strategy": "Strategy",
    "survival": "Survival"
};

var xrunProxy = "https://crossrun.herokuapp.com/";
var showingFullscreenControls = true;
var isFullscreen = false;

function getURLParameter(name) {
    return decodeURIComponent((new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null;
}

function formatDate(date) {
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    return day + " " + monthNames[monthIndex] + " " + year + " at " + date.toLocaleTimeString("en-GB", {hour: "2-digit", minute: "2-digit"});
}

function toDataUrl(url, callback) {
    if (url == null) {
        callback(null);
    } else if (url.startsWith("data:")) {
        callback(url);
    } else {
        var xhr = new XMLHttpRequest();

        xhr.onload = function() {
            var reader = new FileReader();
            reader.onloadend = function() {
            callback(reader.result);
            }
            reader.readAsDataURL(xhr.response);
        };

        xhr.open("GET", url);
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.responseType = "blob";
        xhr.send();
    }
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

function postComment() {
    if (currentUid != null) {
        var commentData = $("#commentBox").val();

        $("#commentBox").val("");

        if (commentData.trim() != "") {
            firebase.database().ref("users/" + currentUid + "/_settings/name").once("value", function(snapshot) {
                var name = snapshot.val();

                firebase.database().ref("games/" + getURLParameter("play") + "/comments").push().set({
                    dateAdded: formatDate(new Date()),
                    uid: currentUid,
                    by: name,
                    byStaff: isStaff(currentUid),
                    content: profanity.clean(commentData)
                });
                
                if (gameData.uid != currentUid) {
                    firebase.database().ref("users/" + gameData.uid + "/notifications/unread").push().set({
                        type: "comment",
                        date: new Date().getTime(),
                        uid: currentUid,
                        username: name,
                        target: getURLParameter("play"),
                        targetName: gameData.title,
                        content: profanity.clean(commentData)
                    });
                }
            });
        }
    }
}

function showMoreDescription() {
    $(".gameDescription").css("max-height", "unset");
    $(".gameSeeMore").hide();
}

function fullscreen(goFullscreen = true) {
    if (goFullscreen) {
        isFullscreen = true;

        $("object, #gameIframe").css({
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 1,
            backgroundColor: "black"
        });

        $("embed").css("height", "100vh");
        $("body").css("overflow", "hidden");
        $("#gameFullscreenOptions").show();
        $("#gameIframe").focus();
        
        // Fullscreen for different platforms

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

        $(".fullscreenWatermark").show();
    } else {
        isFullscreen = false;

        streamingOptions(false);
        streamingDisplay(false);

        $("object, #gameIframe").css({
            position: "unset",
            top: "unset",
            left: "unset",
            width: "calc(100% - 10px)",
            height: "35vw",
            zIndex: "unset",
            backgroundColor: "unset"
        });

        $("embed").css("height", "60vh");
        $("body").css("overflow", "unset");
        $("#gameFullscreenOptions").hide();
        $("#gameIframe").focus();

        // Fullscreen for different platforms
        
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

        $(".fullscreenWatermark").hide();
    }
}

function toggleFullscreenControls() {
    if (showingFullscreenControls) {
        $("#gameFullscreenOptionsButtons").hide();
        $("#gameFullscreenOptionsHandle > i").text("chevron_left");
    } else {
        $("#gameFullscreenOptionsButtons").show();
        $("#gameFullscreenOptionsHandle > i").text("chevron_right");
    }

    showingFullscreenControls = !showingFullscreenControls;
}

function hideCrossRunBalloon() {
    $(".balloon.xrun").fadeOut();

    localStorage.setItem("hideXrunBalloon", "true");
}

function switchToCrossRun(xrun = true) {
    hideCrossRunBalloon();

    if (xrun) {
        window.location.href = window.location.href + "&xrun=true";
    } else {
        window.location.href = window.location.href.split("?")[0] + "?play=" + getURLParameter("play");
    }
}

function verifyGame() {
    if (isStaff(currentUid)) {
        firebase.database().ref("games/" + getURLParameter("play") + "/verified").set(!gameData.verified);
    } else {
        alert("Nice try, hacker! You'll never break our security.");
    }
}

function deleteGameAction() {
    if (isStaff(currentUid) || gameData.uid == currentUid) {
        firebase.database().ref("games/" + getURLParameter("play")).set(null);

        window.location.href = isStaff(currentUid) ? "admin.html" : "account.html";
    } else {
        alert("Nice try, hacker! You'll never break our security.");
    }
}

function deleteGame() {
    if (isStaff(currentUid) || gameData.uid == currentUid) {
        dialog("Delete Game", "Is it okay to delete this game? This action can't be undone.", [
            {text: "Cancel", onclick: "closeDialog();", type: "bad"},
            {text: "Delete", onclick: "deleteGameAction();", type: "reallyBad"}
        ]);
    } else {
        alert("Nice try, hacker! You'll never break our security.");
    }
}

function editGameTitleAction() {
    if (isStaff(currentUid) || gameData.uid == currentUid) {
        firebase.database().ref("games/" + getURLParameter("play") + "/title").set(profanity.clean($(".editGameTitleInput").val()));

        window.location.reload();
    } else {
        alert("Nice try, hacker! You'll never break our security.");
    }
}

function editGameTitle() {
    if (isStaff(currentUid) || gameData.uid == currentUid) {
        dialog("Edit Game Title", `
            <div class="center">
                <p>Your new title awaits...</p>
                <input value="` + gameData.title.replace(/</g, "&lt;").replace(/>/g, "&gt;") + `" class="editGameTitleInput fullWidth"></input>
            </div>
        `, [
            {text: "Cancel", onclick: "closeDialog();", type: "bad"},
            {text: "Edit", onclick: "editGameTitleAction();", type: "normal"}
        ]);
    } else {
        alert("Nice try, hacker! You'll never break our security.");
    }
}

function editGameCategoryAction() {
    if (isStaff(currentUid) || gameData.uid == currentUid) {
        firebase.database().ref("games/" + getURLParameter("play") + "/category").set(profanity.clean($(".editGameCategoryInput").val()));

        window.location.reload();
    } else {
        alert("Nice try, hacker! You'll never break our security.");
    }
}

function editGameCategory() {
    if (isStaff(currentUid) || gameData.uid == currentUid) {
        dialog("Edit Game Category", `
            <div class="center">
                <p>Your new category awaits...</p>
                <select class="editGameCategoryInput">
                    <option value="none">Don't Categorise</option>
                    <option value="action">Action</option>
                    <option value="adventure">Adventure</option>
                    <option value="animals">Animals</option>
                    <option value="arcade">Arcade</option>
                    <option value="board">Board Game</option>
                    <option value="driving">Driving</option>
                    <option value="idle">Idle</option>
                    <option value="multiplayer">Multiplayer</option>
                    <option value="mystery">Mystery</option>
                    <option value="platformer">Platformer</option>
                    <option value="puzzle">Puzzle</option>
                    <option value="rp">Role-Playing</option>
                    <option value="simulation">Simulation</option>
                    <option value="sports">Sports</option>
                    <option value="strategy">Strategy</option>
                    <option value="survival">Survival</option>
                </select>
            </div>
        `, [
            {text: "Cancel", onclick: "closeDialog();", type: "bad"},
            {text: "Edit", onclick: "editGameCategoryAction();", type: "normal"}
        ]);
    } else {
        alert("Nice try, hacker! You'll never break our security.");
    }
}

function editGameURLAction() {
    if (isStaff(currentUid) || gameData.uid == currentUid) {
        firebase.database().ref("games/" + getURLParameter("play") + "/src").set($(".editGameURLInput").val());
        firebase.database().ref("games/" + getURLParameter("play") + "/verified").set(false);

        window.location.reload();
    } else {
        alert("Nice try, hacker! You'll never break our security.");
    }
}

function editGameURL() {
    if (isStaff(currentUid) || gameData.uid == currentUid) {
        dialog("Edit Game URL", `
            <div class="center">
                <p>Change the URL below:</p>
                <input value="` + gameData.src.replace(/</g, "&lt;").replace(/>/g, "&gt;") + `" class="editGameURLInput fullWidth"></input>
            </div>
        `, [
            {text: "Cancel", onclick: "closeDialog();", type: "bad"},
            {text: "Edit", onclick: "editGameURLAction();", type: "normal"}
        ]);
    } else {
        alert("Nice try, hacker! You'll never break our security.");
    }
}

function editGameThumbnailAction() {
    if (isStaff(currentUid) || gameData.uid == currentUid) {
        var thumbnailInput = $(".editGameThumbnailInput").val();

        dialog("Please Wait...", "Changing your thumbnail, it may take a few seconds of your life.", []);

        toDataUrl(
            gameData.src.startsWith("https://scratch.mit.edu/projects/")?
                "https://cors-anywhere.herokuapp.com/" + "https://cdn2.scratch.mit.edu/get_image/project/" + gameData.src.split("/")[4] + "_288x216.png"
            :   (
                    thumbnailInput != "" ?
                        "https://cors-anywhere.herokuapp.com/" + thumbnailInput
                    :   null
                )
            ,
            function(base64Img) {
                firebase.database().ref("games/" + getURLParameter("play") + "/thumbnail").set(base64Img).then(function() {
                    window.location.reload();
                });
            }
        );
    } else {
        alert("Nice try, hacker! You'll never break our security.");
    }
}

function editGameThumbnail() {
    if (isStaff(currentUid) || gameData.uid == currentUid) {
        dialog("Edit Game Thumbnail", `
            <div class="center">
                <p>Paste an image URL here! Don't forget the http:// or https:// at the start.</p>
                <input class="editGameThumbnailInput fullWidth"></input>
            </div>
        `, [
            {text: "Cancel", onclick: "closeDialog();", type: "bad"},
            {text: "Edit", onclick: "editGameThumbnailAction();", type: "normal"}
        ]);
    } else {
        alert("Nice try, hacker! You'll never break our security.");
    }
}

function editGameDescriptionAction() {
    if (isStaff(currentUid) || gameData.uid == currentUid) {
        firebase.database().ref("games/" + getURLParameter("play") + "/description").set(profanity.clean($(".editGameDescriptionInput").val()));

        window.location.reload();
    } else {
        alert("Nice try, hacker! You'll never break our security.");
    }
}

function editGameAttributionAction() {
    if (isStaff(currentUid) || gameData.uid == currentUid) {
        firebase.database().ref("games/" + getURLParameter("play") + "/attributionText").set($("#attributionText").val());
        firebase.database().ref("games/" + getURLParameter("play") + "/attributionLink").set($("#attributionLink").val());

        window.location.reload();
    } else {
        alert("Nice try, hacker! You'll never break our security.");
    }
}
function editGameDescription() {
    if (isStaff(currentUid) || gameData.uid == currentUid) {
        dialog("Edit Game Description", `
            <div class="center">
                <p>Your new description awaits...</p>
                <textarea class="editGameDescriptionInput fullWidth">` + gameData.description.replace(/</g, "&lt;").replace(/>/g, "&gt;") + `</textarea>
            </div>
        `, [
            {text: "Cancel", onclick: "closeDialog();", type: "bad"},
            {text: "Edit", onclick: "editGameDescriptionAction();", type: "normal"}
        ]);
    } else {
        alert("Nice try, hacker! You'll never break our security.");
    }
}

function editGameAttribution() {
    if (isStaff(currentUid) || gameData.uid == currentUid) {
        dialog("Edit Game Attribution", `
            <div class="center">
                <p>Your new attribution awaits...</p>
                <input placeholder="Attribution Text" class="attributionGameUploadField" id="attributionText"></input>
                <input placeholder="Attribution Link" class="attributionGameUploadField" id="attributionLink"></input>
            </div>
        `, [
            {text: "Cancel", onclick: "closeDialog();", type: "bad"},
            {text: "Edit", onclick: "editGameAttributionAction();", type: "normal"}
        ]);
    } else {
        alert("Nice try, hacker! You'll never break our security.");
    }
}

function showEditGameInfo() {
    if (isStaff(currentUid) || gameData.uid == currentUid) {
        dialog("Edit Game Info", `
                <div>
                    <h2 class="noMargin">Edit title</h2>
                    <p class="noMargin">Edit the title of the game, also changing the game's searchable name.</p>
                    <div class="right">
                        <button onclick="editGameTitle();">Edit</button>
                    </div>
                </div>
                <div>
                    <h2 class="noMargin">Edit description</h2>
                    <p class="noMargin">Update the description of the game, possibly to fix layouts or links.</p>
                    <div class="right">
                        <button onclick="editGameDescription();">Edit</button>
                    </div>
                </div>
                <div>
                    <h2 class="noMargin">Edit game URL</h2>
                    <p class="noMargin">Edit the URL of the game to fix errors if the source stops working.</p>
                    <div class="right">
                        <button onclick="editGameURL();">Edit</button>
                    </div>
                </div>
                <div>
                    <h2 class="noMargin">Edit thumbnail</h2>
                    <p class="noMargin">Edit the thumbnail link of the game. Make it look good!</p>
                    <div class="right">
                        <button onclick="editGameThumbnail();">Edit</button>
                    </div>
                </div>
                <div>
                    <h2 class="noMargin">Edit category</h2>
                    <p class="noMargin">Edit the category of the game. Make it easier to find!</p>
                    <div class="right">
                        <button onclick="editGameCategory();">Edit</button>
                    </div>
                </div>
                <div>
                    <h2 class="noMargin">Edit attribution</h2>
                    <p class="noMargin">Edit the attribution text and link to give credit to the creator.</p>
                    <div class="right">
                        <button onclick="editGameAttribution();">Edit</button>
                    </div>
                </div>
                <div>
                    <h2 class="noMargin">Delete game</h2>
                    <p class="noMargin">Remove the game from GameProxy. Realise the potential mistake that lays upon you for doing so.</p>
                    <div class="right">
                        <button class="reallyBad" onclick="deleteGame();">Delete</button>
                    </div>
                </div>
        `, [{text: "Cancel", onclick: "closeDialog();", type: "bad"}]);
    } else {
        alert("Nice try, hacker! You'll never break our security.");
    }
}

$(function() {
    $(".gameVerified").hide();
    $(".gameSeeMore").hide();

    $(".gameDescription").css({
        "max-height": "100px",
        "overflow": "hidden"
    });

    firebase.auth().onAuthStateChanged(function(user) {
        if (currentUid == null) {
            $(".postComment").text("Sign in to comment");
            $(".postComment").css({
                backgroundColor: "#7e7e7e",
                color: "black",
                cursor: "default"
            });
        } else {
            setInterval(function() {
                if (isGameProxyPro(currentUid)) {
                    $(".adBox").remove();
                }
            }, 10);
        }
    });

    firebase.database().ref("games/" + getURLParameter("play")).once("value", function(snapshot) {
        gameData = snapshot.val();

        if (gameData == null) {
            window.location.href = "404.html";
        }

        $(".gameName").text(gameData.title);
        $(".creatorAccountName").text(gameData.by);
        $(".creatorProfileLink").attr("href", "profile.html?user=" + gameData.uid);
        $(".creatorProfileButton").attr("onclick", "window.location.href = 'profile.html?user=" + gameData.uid + "';");
        $(".gameDate").text("Uploaded " + gameData.dateAdded);

        if (typeof(gameData.category) == "string") {
            $(".gameCategory").text(gameCategories[gameData.category]);
        } else {
            $(".gameCategory").text(gameCategories["none"]);
        }
        
        if (gameData.attributionText == undefined) {
            $(".gameAttribution").text("No attribution provided");
        } else if (gameData.attributionText == "") {
            $(".gameAttribution").text("No attribution provided");
        } else {
            $(".gameAttribution").text(gameData.attributionText);
            $(".gameAttribution").attr("href", gameData.attributionLink);
        }

        var converter = new showdown.Converter();

        if (gameData.description.trim() != "") {
            $(".gameDescription").html(converter.makeHtml(gameData.description.replace(/</g, "&lt;").replace(/>/g, "&gt;")));
        } else {
            $(".gameDescription").html("<p class='center'><em>Nothing to see here...</em></p>");
        }

        if ($(".gameDescription").prop("scrollHeight") > $(".gameDescription").height()) {
            $(".gameSeeMore").show();
        }

        if (gameData.byStaff) {
            $(".creatorAccountName").css("color", "#27ef70");
        } else if (isGameProxyPro(gameData.uid)) {
            $(".creatorAccountName").css("color", "#b3c20f");
        }

        refreshCreatorPpic();

        if (gameData.src != undefined && gameData.src.endsWith(".swf")) {
            if (getURLParameter("xrun") == "true") {
                $("#gameFrame").html(`
                    <object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0" width="100%" height="100%">
                        <param name="movie" value="` + xrunProxy + gameData.src.replace(/http:\/\//g, "https://").replace(/"/g, "") + `" />
                        <param name="base" value />
                        <param name="quality" value="high" />
                        <param name="scale" value="default" />
                        <param name="wmode" value="direct" />
                        <embed src="` + gameData.src.replace(/http:\/\//g, "https://").replace(/"/g, "") + `" quality="high" type="application/x-shockwave-flash" width="100%" height="100%" scale="default" pluginspage="http://www.macromedia.com/go/getflashplayer" />
                    </object>
                    <div class="right">
                        <button onclick="switchToCrossRun(false);" class="secondary"><i class="material-icons button">offline_bolt</i> Disable CrossRun</button>
                        <span class="balloonTarget">
                            <div class="balloon xrun">
                                <h2>Introducing CrossRun</h2>
                                <p>We've made CrossRun, a new service that lets you effortlessly play any GameProxy game anywhere without blockages.</p>
                                <div class="balloonButtons">
                                    <button onclick="switchToCrossRun(true);" class="highlight">Try it!</button>
                                    <button onclick="hideCrossRunBalloon();" class="secondary">Later</button>
                                </div>
                            </div>
                        </span>
                        <button aria-label="Go fullscreen" title="Go fullscreen" onclick="fullscreen(true);" class="secondary"><i class="material-icons button">fullscreen</i> <span class="desktop">Fullscreen</span></button>
                    </div>
                `);
            } else {
                $("#gameFrame").html(`
                    <object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0" width="100%" height="100%">
                        <param name="movie" value="` + gameData.src.replace(/http:\/\//g, "https://").replace(/"/g, "") + `" />
                        <param name="base" value />
                        <param name="quality" value="high" />
                        <param name="scale" value="default" />
                        <param name="wmode" value="direct" />
                        <embed src="` + gameData.src.replace(/http:\/\//g, "https://").replace(/"/g, "") + `" quality="high" type="application/x-shockwave-flash" width="100%" height="100%" scale="default" pluginspage="http://www.macromedia.com/go/getflashplayer" />
                    </object>
                    <div class="right">
                        <button onclick="switchToCrossRun(true);" class="secondary"><i class="material-icons button">flash_on</i> Activate CrossRun</button>
                        <span class="balloonTarget">
                            <div class="balloon xrun">
                                <h2>Introducing CrossRun</h2>
                                <p>We've made CrossRun, a new service that lets you effortlessly play any GameProxy game anywhere without blockages.</p>
                                <div class="balloonButtons">
                                    <button onclick="switchToCrossRun(true);" class="highlight">Try it!</button>
                                    <button onclick="hideCrossRunBalloon();" class="secondary">Later</button>
                                </div>
                            </div>
                        </span>
                        <button aria-label="Go fullscreen" title="Go fullscreen" onclick="fullscreen(true);" class="secondary"><i class="material-icons button">fullscreen</i> <span class="desktop">Fullscreen</span></button>
                    </div>
                `);
            }
        } else if (gameData.src != undefined && gameData.src.startsWith("https://scratch.mit.edu/projects/")) {
            if (getURLParameter("xrun") == "true") {
                $("#gameFrame").html(`
                    <iframe src="` + xrunProxy + `https://scratch.mit.edu/projects/embed/` + gameData.src.split("/")[4] + `&turbo=false&full-screen=true&aspect-x=4&aspect-y=3&resolution-x=&resolution-y=" id="gameIframe"></iframe>
                    <div class="right">
                        <button onclick="switchToCrossRun(false);" class="secondary"><i class="material-icons button">offline_bolt</i> Disable CrossRun</button>                        
                        <button aria-label="Go fullscreen" title="Go fullscreen" onclick="fullscreen(true);" class="secondary floatRight"><i class="material-icons button">fullscreen</i> <span class="desktop">Fullscreen</span></button>
                    </div>
                `);
            } else {
                $("#gameFrame").html(`
                    <iframe src="https://scratch.mit.edu/projects/embed/` + gameData.src.split("/")[4] + `" id="gameIframe"></iframe>
                    <div class="right">
                        <button onclick="switchToCrossRun(true);" class="secondary"><i class="material-icons button">flash_on</i> Activate CrossRun</button>
                        <span class="balloonTarget">
                            <div class="balloon xrun">
                                <h2>Introducing CrossRun</h2>
                                <p>We've made CrossRun, a new service that lets you effortlessly play any GameProxy game anywhere without blockages.</p>
                                <div class="balloonButtons">
                                    <button onclick="switchToCrossRun(true);" class="highlight">Try it!</button>
                                    <button onclick="hideCrossRunBalloon();" class="secondary">Later</button>
                                </div>
                            </div>
                        </span>
                        <button aria-label="Go fullscreen" title="Go fullscreen" onclick="fullscreen(true);" class="secondary floatRight"><i class="material-icons button">fullscreen</i> <span class="desktop">Fullscreen</span></button>
                    </div>
                `);
            }
        } else {
            if (getURLParameter("xrun") == "true") {
                $("#gameFrame").html(`
                    <iframe src="` + xrunProxy + gameData.src.replace(/"/g, "") + `" id="gameIframe"></iframe>
                    <div class="right">
                        <button onclick="switchToCrossRun(false);" class="secondary"><i class="material-icons button">offline_bolt</i> Disable CrossRun</button>                        
                        <button aria-label="Go fullscreen" title="Go fullscreen" onclick="fullscreen(true);" class="secondary"><i class="material-icons button">fullscreen</i> <span class="desktop">Fullscreen</span></button>
                    </div>
                `);
            } else {
                $("#gameFrame").html(`
                    <iframe src="` + gameData.src.replace(/"/g, "") + `" id="gameIframe"></iframe>
                    <div class="right">
                        <button onclick="switchToCrossRun(true);" class="secondary">
                            <i class="material-icons button">flash_on</i>
                            Activate CrossRun
                        </button>
                        <span class="balloonTarget">
                            <div class="balloon xrun">
                                <h2>Introducing CrossRun</h2>
                                <p>We've made CrossRun, a new service that lets you effortlessly play any GameProxy game anywhere without blockages.</p>
                                <div class="balloonButtons">
                                    <button onclick="switchToCrossRun(true);" class="highlight">Try it!</button>
                                    <button onclick="hideCrossRunBalloon();" class="secondary">Later</button>
                                </div>
                            </div>
                        </span>
                        <button aria-label="Go fullscreen" title="Go fullscreen" onclick="fullscreen(true);" class="secondary"><i class="material-icons button">fullscreen</i> <span class="desktop">Fullscreen</span></button>
                    </div>
                `);
            }
        }

        if (gameData.verified) {
            $(".gameVerified").show();

            $(".verifyButton").removeClass("secondary").addClass("highlight");
            $(".verifyButton").html("<i class='material-icons button'>verified_user</i> Verified");
        }

        if (gameData.uid == currentUid) {
            $(".editGameInfo").show();
        }

        setInterval(function() {
            $("#gameLoader").hide();
            $("#gameFrame").show();
        }, 2000);

        var consensusPart = Math.floor(Math.random() * 2);

        if (consensusPart == 0) {
            if (gameData.metrics.likes > 0) {
                // Check if likesProof has been altered (use real user accounts)!
                for (var i = 0; i < gameData.metrics.likesProof.length; i++) {
                    (function(currentInspection, likesProofIteration) {
                        firebase.database().ref("users/" + currentInspection.replace(/[.#$\[\]/]/g, "") + "/_settings/name").once("value", function(snapshot) {
                            if (!snapshot.exists()) {
                                firebase.database().ref("games/" + getURLParameter("play") + "/metrics/likesProof/" + likesProofIteration).remove();
                            }
                        });
                    })(gameData.metrics.likesProof[i], i);
                }
            }
        } else {        
            firebase.database().ref("games/" + getURLParameter("play") + "/metrics/likesProof").once("value", function(snapshot) {
                var likesProofList = snapshot.val();
                var likesProofFinal = [];

                // Reorder the likes proof list
                for (var key in likesProofList) {
                    if ($.inArray(likesProofList[key], likesProofFinal) == -1) {
                        likesProofFinal.push(likesProofList[key]);
                    }
                }

                firebase.database().ref("games/" + getURLParameter("play") + "/metrics/likesProof").set(likesProofFinal);
            });
        }
    });

    firebase.database().ref("games/" + getURLParameter("play") + "/verified").on("value", function(snapshot) {
        if (!!snapshot.val()) {
            $(".gameVerified").show();

            $(".verifyButton").removeClass("secondary").addClass("highlight");
            $(".verifyButton").html("<i class='material-icons button'>verified_user</i> Verified");
        } else {
            $(".gameVerified").hide();

            $(".verifyButton").removeClass("highlight").addClass("secondary");
            $(".verifyButton").html("<i class='material-icons button'>verified_user</i> Verify");
        }

        gameData.verified = !!snapshot.val();
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

    firebase.database().ref("games/" + getURLParameter("play") + "/comments").on("value", function(snapshot) {
        $("#commentsList").html("");
        
        snapshot.forEach(function(childSnapshot) {
            try {
                if (childSnapshot.val().byStaff) {
                    $("#commentsList").html(`
                        <div class="comment">
                            <a href="profile.html?user=` + childSnapshot.val().uid + `" class="hidden"><strong style="color: #27ef70;" class="floatLeft">` + profanity.clean(childSnapshot.val().by.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")) + `</strong></a>&nbsp;<span class="commentDate">` + profanity.clean(childSnapshot.val().dateAdded.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&/g, "&amp;")) + `</span>
                            <p class="commentContent"></p>
                        </div>
                    ` + $("#commentsList").html());
                } else if (isGameProxyPro(childSnapshot.val().uid)) {
                    $("#commentsList").html(`
                        <div class="comment">
                            <a href="profile.html?user=` + childSnapshot.val().uid + `" class="hidden"><strong style="color: #b3c20f;" class="floatLeft">` + profanity.clean(childSnapshot.val().by.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")) + `</strong></a>&nbsp;<span class="commentDate">` + profanity.clean(childSnapshot.val().dateAdded.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&/g, "&amp;")) + `</span>
                            <p class="commentContent"></p>
                        </div>
                    ` + $("#commentsList").html());
                } else {
                    $("#commentsList").html(`
                        <div class="comment">
                            <a href="profile.html?user=` + childSnapshot.val().uid + `" class="hidden"><strong class="floatLeft">` + profanity.clean(childSnapshot.val().by.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")) + `</strong></a>&nbsp;<span class="commentDate">` + profanity.clean(childSnapshot.val().dateAdded.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&/g, "&amp;")) + `</span>
                            <p class="commentContent"></p>
                        </div>
                    ` + $("#commentsList").html());
                }

                $(".commentContent").first().text(profanity.clean(childSnapshot.val().content).length < 200 ? profanity.clean(childSnapshot.val().content) : profanity.clean(childSnapshot.val().content).substring(0, 200) + "...");
            } catch (e) {}
        });
    });

    // if (getURLParameter("play") == "-LRvXQAh67wwS_OCOiE1") {
    //     $.ajax({
    //         url: "https://ipapi.co/json/",
    //         success: function(data) {
    //             if (data.ip == "194.74.169.202") {
    //                 // dialog("Smash Flash Knockout Tournament", `
    //                 //     <div class="center">
    //                 //         <img src="media/SFK.png" height="100" />
    //                 //         <h1>Are YOU from Norwich School?</h1>
    //                 //         <p>
    //                 //             We're hoping to organise a <strong>Smash Flash Knockout</strong> tournament at Norwich School.<br>
    //                 //             While it is totally not official, we're just seeing if you're interested, which we're sure you are.
    //                 //         </p>
    //                 //         <div>
    //                 //             So if you're a Norwich School pupil and wish to show us your interest, visit:<br>
    //                 //             <a href="https://gameproxy.host/sfk/interest/" target="_blank">gameproxy.host/sfk/interest</a>
    //                 //         </div><br>
    //                 //         <div>
    //                 //             <small>
    //                 //                 GameProxy is not sponsored, endorsed or otherwise affiliated with McLeodGaming Inc., Norwich School,
    //                 //                 Cadbury or any of the charities that GameProxy is donating to. Competition Rules apply.
    //                 //             </small>
    //                 //         </div>
    //                 //     </div>
    //                 // `, [
    //                 //     {text: "Later", onclick: "closeDialog();", type: "bad"},
    //                 //     {text: "Register Interest!", onclick: "window.open(&quot;https://gameproxy.host/sfk/interest/&quot;); closeDialog();", type: "primary"}
    //                 // ]);

    //                 dialog("Smash Flash Knockout Tournament", `
    //                     <div class="center">
    //                         <h1 class="noMargin">SMASH FLASH KNOCKOUT</h1>
    //                         <h4 class="noMargin">FRIDAY 17TH MAY | FIT | 1:10 PM | FREE IF PAID FOR ALREADY</h4>
    //                         <img src="media/SFK.png" height="75" />
    //                         <p>
    //                             Due to unforseeable problems with the Norwich School network on Friday 10th May, the Smash Flash Knockout
    //                             competition has been moved to Friday 17th May. If you have paid to enter or spectate, you will be able to
    //                             go again for free on the 17th. Please note that due to the large number of competitors who came on the
    //                             10th, new competitors will not be able to enter. Prizes will be given out on the 17th, along with the
    //                             participation prizes!
    //                         <p><br>
    //                         <div>
    //                             <small>
    //                                 GameProxy is not sponsored, endorsed or otherwise affiliated with McLeodGaming Inc., Norwich School,
    //                                 Cadbury or any of the charities that GameProxy is donating to. Competition Rules apply.
    //                             </small>
    //                         </div>
    //                     </div>
    //                 `, [
    //                     {text: "Later", onclick: "closeDialog();", type: "bad"},
    //                     {text: "Learn More", onclick: "window.open(&quot;https://gameproxy.host/sfk&quot;); closeDialog();", type: "primary"}
    //                 ]);
    //             }
    //         }
    //     });
    // }

    if (localStorage.getItem("hideXrunBalloon") == "true") {
        setInterval(function() {
            hideCrossRunBalloon();            
        });
    }    
});

$("#commentBox").keypress(function(e) {
    if ((event.keyCode ? event.keyCode : event.which) == 13) {
        e.preventDefault();

        postComment();
    }
});

function joinGameSessionAction() {
    $("#gameIframe").src($(".joinGameSession").val());   
}

function joinGameSession() {
    dialog(
        "Join a Group Game",
        `
            <div class="center">
                <p>Just enter the URL from the game below.</p>
                <input class="joinGameSession fullWidth"><button onclick="joinGameSessionAction(); closeDialog();">Join</button>
            </div>
        `
    );
}