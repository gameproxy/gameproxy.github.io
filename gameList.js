var gameList = [];

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function addGame(name, by, byStaff = false, thumbnail = "media/NoThumbnail.png", link = "javascript:alert('Sorry! This game is unavailable.');", verified = false, byGPPro = false) {
    $("#gameLoader").hide();

    if (verified) {
        $("#gameList").append(`
            <a class="hidden">
                <div class="item gameItem">
                    <div class="itemThumbnailHolder">
                        <img src="media/NoThumbnail.png" onerror="this.onerror = null; this.src='media/NoThumbnail.png';" class="itemThumbnail" />
                    </div>
                    <h2 class="cutOff"><span class="itemTitle">Loading...</span> <i class="material-icons">verified_user</i></h2>
                    <span class="gameByPrefix"></span><span class="gameBy">Loading...</span>
                </div>
            </a>
        `);
    } else {
        $("#gameList").append(`
            <a class="hidden">
                <div class="item gameItem">
                    <div class="itemThumbnailHolder">
                        <img src="media/NoThumbnail.png" onerror="this.onerror = null; this.src='media/NoThumbnail.png';" class="itemThumbnail" />
                    </div>
                    <h2 class="cutOff"><span class="itemTitle">Loading...</span></h2>
                    <span class="gameByPrefix"></span><span class="gameBy">Loading...</span>
                </div>
            </a>
        `);
    }

    $("#gameList").children().last().find(".itemTitle").text(name);
    $("#gameList").children().last().find(".gameByPrefix").text("By ");
    $("#gameList").children().last().find(".gameBy").text(by);
    
    if (byStaff) {
        $("#gameList").children().last().find(".gameBy").css("color", "#27ef70");
    } else if (byGPPro) {
        $("#gameList").children().last().find(".gameBy").css("color", "#b3c20f");
    }

    $("#gameList").children().last().find("img").attr("src", thumbnail);
    $("#gameList").find("a").last().attr("href", link);
}

function filter(type) {
    $(".pill").removeClass("selected");
    $("select.pill").val("none");
    $(".pill[filter=" + type + "]").addClass("selected");

    $(".search").val("");
    $("#gameList").html("");

    $("#gameLoader").show();

    if (type == "featured") {
        $("#gameList").html("");

        firebase.database().ref("games").orderByChild("metrics/likes").limitToLast(12).on("value", function(snapshot) {
            gameList = [];

            snapshot.forEach(function(childSnapshot) {
                gameList.unshift(childSnapshot.val());
                gameList[0]["key"] = childSnapshot.key;
            });

            for (var i = 0; i < gameList.length; i++) {
                if (gameList[i]["by"] == undefined) {
                    addGame(gameList[i]["title"], "Anonymous", gameList[i]["thumbnail"], "game?play=" + gameList[i]["key"], gameList[i]["verified"]);
                } else {
                    addGame(gameList[i]["title"], gameList[i]["by"].substring(0, 30), gameList[i]["byStaff"], gameList[i]["thumbnail"], "game?play=" + gameList[i]["key"], gameList[i]["verified"], isGameProxyPro(gameList[i]["uid"]));
                }
            }
        });

        firebase.database().ref("games").limitToLast(12).on("value", function(snapshot) {
            gameList = [];

            snapshot.forEach(function(childSnapshot) {
                gameList.unshift(childSnapshot.val());
                gameList[0]["key"] = childSnapshot.key;
            });

            for (var i = 0; i < gameList.length; i++) {
                if (gameList[i]["by"] == undefined) {
                    addGame(gameList[i]["title"], "Anonymous", gameList[i]["thumbnail"], "game?play=" + gameList[i]["key"], gameList[i]["verified"]);
                } else {
                    addGame(gameList[i]["title"], gameList[i]["by"].substring(0, 30), gameList[i]["byStaff"], gameList[i]["thumbnail"], "game?play=" + gameList[i]["key"], gameList[i]["verified"], isGameProxyPro(gameList[i]["uid"]));
                }
            }
        });
    } else if (type == "random") {
        firebase.database().ref("games").orderByChild("metrics/likes").equalTo(Math.floor(Math.random() * 5)).limitToLast(12).on("value", function(snapshot) {
            gameList = [];

            snapshot.forEach(function(childSnapshot) {
                gameList.unshift(childSnapshot.val());
                gameList[0]["key"] = childSnapshot.key;
            });

            $("#gameList").html("");

            for (var i = 0; i < gameList.length; i++) {
                if (gameList[i]["by"] == undefined) {
                    (function(i) {
                        setTimeout(function() {
                            addGame(gameList[i]["title"], "Anonymous", gameList[i]["thumbnail"], "game?play=" + gameList[i]["key"], gameList[i]["verified"], isGameProxyPro(gameList[i]["uid"]));
                        }, Math.floor(Math.random() * 15));
                    })(i);
                } else {
                    (function(i) {
                        setTimeout(function() {
                            addGame(gameList[i]["title"], gameList[i]["by"].substring(0, 30), gameList[i]["byStaff"], gameList[i]["thumbnail"], "game?play=" + gameList[i]["key"], gameList[i]["verified"], isGameProxyPro(gameList[i]["uid"]));
                        }, Math.floor(Math.random() * 15));
                    })(i);
                }
            }
        });
    } else {
        var lister = null;

        if (type == "likes") {
            lister = firebase.database().ref("games").orderByChild("metrics/likes").limitToLast(24);
        } else if (type == "new") {
            lister = firebase.database().ref("games").limitToLast(24);
        } else if (type == "verified") {
            lister = firebase.database().ref("games").orderByChild("verified").equalTo(true).limitToLast(24);
        }

        lister.on("value", function(snapshot) {
            gameList = [];

            snapshot.forEach(function(childSnapshot) {
                gameList.unshift(childSnapshot.val());
                gameList[0]["key"] = childSnapshot.key;
            });

            $("#gameList").html("");

            for (var i = 0; i < gameList.length; i++) {
                if (gameList[i]["by"] == undefined) {
                    addGame(gameList[i]["title"], "Anonymous", gameList[i]["thumbnail"], "game?play=" + gameList[i]["key"], gameList[i]["verified"]);
                } else {
                    addGame(gameList[i]["title"], gameList[i]["by"].substring(0, 30), gameList[i]["byStaff"], gameList[i]["thumbnail"], "game?play=" + gameList[i]["key"], gameList[i]["verified"], isGameProxyPro(gameList[i]["uid"]));
                }
            }
        });
    }
}

function categorise(topic) {
    if (topic == "none") {
        filter("featured");
    } else {
        $(".pill").removeClass("selected");
        $("select.pill").addClass("selected");

        $(".search").val("");
        $("#gameList").html("");

        $("#gameLoader").show();

        firebase.database().ref("games").orderByChild("category").equalTo(topic).limitToLast(12).on("value", function(snapshot) {
            gameList = [];

            snapshot.forEach(function(childSnapshot) {
                gameList.unshift(childSnapshot.val());
                gameList[0]["key"] = childSnapshot.key;
            });

            $("#gameList").html("");

            if (gameList.length == 0) {
                $("#gameLoader").hide();
                $("#gameList").html("<h3 class='center'>Oops! Couldn't find that game.</h3>");
            } else {
                for (var i = 0; i < gameList.length; i++) {
                    if (gameList[i]["by"] == undefined) {
                        addGame(gameList[i]["title"], "Anonymous", gameList[i]["thumbnail"], "game?play=" + gameList[i]["key"], gameList[i]["verified"]);
                    } else {
                        addGame(gameList[i]["title"], gameList[i]["by"].substring(0, 30), gameList[i]["byStaff"], gameList[i]["thumbnail"], "game?play=" + gameList[i]["key"], gameList[i]["verified"], isGameProxyPro(gameList[i]["uid"]));
                    }
                }
            }
        });
}
}

function search(query) {
    $(".pill").removeClass("selected");
    $("select.pill").val("none");

    $("#gameList").html("");

    $("#gameLoader").show();

    firebase.database().ref("games").orderByChild("title").startAt(query).endAt(query + "\uf8ff").limitToLast(24).on("value", function(snapshot) {
        gameList = [];

        snapshot.forEach(function(childSnapshot) {
            gameList.unshift(childSnapshot.val());
            gameList[0]["key"] = childSnapshot.key;
        });

        $("#gameList").html("");

        if (gameList.length == 0) {
            $("#gameLoader").hide();
            $("#gameList").html("<h3 class='center'>Oops! Couldn't find that game.</h3>");
        } else {
            for (var i = gameList.length - 1; i >= 0; i--) {
                if (gameList[i]["by"] == undefined) {
                    addGame(gameList[i]["title"], "Anonymous", gameList[i]["thumbnail"], "game?play=" + gameList[i]["key"], gameList[i]["verified"]);
                } else {
                    addGame(gameList[i]["title"], gameList[i]["by"].substring(0, 30), gameList[i]["byStaff"], gameList[i]["thumbnail"], "game?play=" + gameList[i]["key"], gameList[i]["verified"], isGameProxyPro(gameList[i]["uid"]));
                }
            }
        }
    });
}

function performSearch(query = "") {
    if (query == "") {
        filter("featured");
    } else {
        search(toTitleCase(query));
    }
}

$(function() {
    filter("featured");
});

$("select.pill").on("change", function() {
    categorise($(this).children("option:selected").val());
});

$("#searchBar").keypress(function(e) {
    if ((event.keyCode ? event.keyCode : event.which) == 13) {
        performSearch($(this).val());
    }
});