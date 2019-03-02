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

function getURLParameter(name) {
    return decodeURIComponent((new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null;
}

function formatDate(date) {
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    return day + " " + monthNames[monthIndex] + " " + year + " at " + date.toLocaleTimeString(navigator.language, {hour: "2-digit", minute: "2-digit"});
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
        $("#gameExitFullscreen").show();
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
        $("#gameExitFullscreen").hide();
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

function switchToFlash(flash = true) {
    if (flash) {
        window.location.href = window.location.href.substring(0, window.location.href.length - 15);
    } else {
        window.location.href = window.location.href + "&sulfurous=true"
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

function editGameThumbnailAction() {
    if (isStaff(currentUid) || gameData.uid == currentUid) {
        var thumbnailInput = $(".editGameThumbnailInput").val();

        dialog("Please Wait...", "Changing your thumbnail, it may take a few seconds of your life.", []);

        toDataUrl(
            gameData.src.startsWith("https://scratch.mit.edu/projects/")?
                "https://cors-anywhere.herokuapp.com/" + "https://cdn2.scratch.mit.edu/get_image/project/" + gamedata.src.split("/")[4] + "_288x216.png"
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
        }
    });

    firebase.database().ref("games/" + getURLParameter("play")).once("value", function(snapshot) {
        gameData = snapshot.val();

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
        }

        refreshCreatorPpic();

        if (gameData.src != undefined && gameData.src.endsWith(".swf")) {
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
                            <a href="profile.html?user=` + childSnapshot.val().uid + `" class="hidden"><strong style="color: #27ef70;" class="floatLeft">` + childSnapshot.val().by.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + `</strong></a>&nbsp;<span class="commentDate">` + childSnapshot.val().dateAdded.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&/g, "&amp;") + `</span>
                            <p class="commentContent"></p>
                        </div>
                    ` + $("#commentsList").html());
                } else {
                    $("#commentsList").html(`
                        <div class="comment">
                            <a href="profile.html?user=` + childSnapshot.val().uid + `" class="hidden"><strong class="floatLeft">` + childSnapshot.val().by.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + `</strong></a>&nbsp;<span class="commentDate">` + childSnapshot.val().dateAdded.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&/g, "&amp;") + `</span>
                            <p class="commentContent"></p>
                        </div>
                    ` + $("#commentsList").html());
                }

                // Consensus to make sure that no rude words are used in comments
                if (childSnapshot.val().uid == currentUid) {
                    if (profanity.isRude(childSnapshot.val().content)) {
                            firebase.database().ref("games/" + getURLParameter("play") + "/comments/" + childSnapshot.key + "/content").set(profanity.clean(childSnapshot.val().content));
                    }
                }

                $(".commentContent").first().text(childSnapshot.val().content.length < 500 ? childSnapshot.val().content : childSnapshot.val().content.substring(0, 500) + "...");
            } catch (e) {}
        });
    });
});

$("#commentBox").keypress(function(e) {
    if ((event.keyCode ? event.keyCode : event.which) == 13) {
        e.preventDefault();

        postComment();
    }
});
