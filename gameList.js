function addGame(name, by, thumbnail, link) {
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
    setTimeout(function() {
        for (var i = 0; i < 27; i++) {
            addGame("Game", "Me", "https://loremflickr.com/320/240/pcgame?random=" + Math.floor(Math.random() * 1000), "javascript:alert('We\\'ll be creating a vast library of games very soon! We hope to see you when we\\'ve finished our website. In the meantime, stick around to see what we\\'re doing!');")
        }
    }, 5000);

    var games = firebase.database().ref("users/sm20Y8fTGoPfA45tqudOPakR3mr1/games").orderByChild("metrics/likes").on("value", function(snapshot) {
        console.log(snapshot.val());
    });
});