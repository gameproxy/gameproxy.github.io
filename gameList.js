function addGame(name, by, byStaff = false, thumbnail = "media/NoThumbnail.png", link = "javascript:alert('Sorry! This game is unavailable.');", verified = false) {
    $("#gameLoader").hide();

    if (verified) {
        $("#gameList").append(`
            <a class="hidden">
                <div class="item gameItem">
                    <div class="itemThumbnailHolder">
                        <img src="media/NoThumbnail.png" class="itemThumbnail" />
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
                        <img src="media/NoThumbnail.png" class="itemThumbnail" />
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
    }

    $("#gameList").children().last().find("img").attr("src", thumbnail);
    $("#gameList").find("a").last().attr("href", link);
}

$(function() {
    var gameList = [];

    firebase.database().ref("games").orderByChild("metrics/likes").limitToLast(24).on("value", function(snapshot) {
        gameList = [];

        snapshot.forEach(function(childSnapshot) {
            gameList.unshift(childSnapshot.val());
            gameList[0]["key"] = childSnapshot.key;
        });

        $("#gameList").html("");

        for (var i = 0; i < gameList.length; i++) {
            if (gameList[i]["by"] == undefined) {
                addGame(gameList[i]["title"], "Anonymous", gameList[i]["thumbnail"], "game.html?play=" + gameList[i]["key"], gameList[i]["verified"]);
            } else {
                addGame(gameList[i]["title"], gameList[i]["by"], gameList[i]["byStaff"], gameList[i]["thumbnail"], "game.html?play=" + gameList[i]["key"], gameList[i]["verified"]);
            }
        }
    });
});