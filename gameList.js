function addGame(name, by, thumbnail = "media/NoThumbnail.png", link = "javascript:alert('Sorry! This game is unavailable.');") {
    $("#gameLoader").hide();

    $("#gameList").append(`
        <a class="hidden">
            <div class="item">
                <div class="itemThumbnailHolder">
                    <img src="media/NoThumbnail.png" class="itemThumbnail" />
                </div>
                <h2 class="itemTitle">Loading...</h2>
                <span class="gameBy">Loading...</span>
            </div>
        </a>
    `);

    $("#gameList").children().last().find(".itemTitle").text(name);
    $("#gameList").children().last().find(".gameBy").text("By " + by);
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
                addGame(gameList[i]["title"], "Anonymous", gameList[i]["thumbnail"], "game.html?play=" + gameList[i]["key"]);
            } else {
                addGame(gameList[i]["title"], gameList[i]["by"], gameList[i]["thumbnail"], "game.html?play=" + gameList[i]["key"]);
            }
        }
    });
});