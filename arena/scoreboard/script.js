var currentUid = null;
var scoreboardData = [];

function rewriteScoreboard(data) {
    $("#scoreboardEntries").html("");

    for (var i = 0; i < data.length; i++) {
        var position = i + 1;
        var name = data[i].name;
        var score = data[i].score;
        var positionName = String(position);

        if (positionName[positionName.length - 1] == "1") {
            positionName += "st";
        } else if (positionName[positionName.length - 1] == "2") {
            positionName += "nd";
        } else if (positionName[positionName.length - 1] == "3") {
            positionName += "rd";
        } else {
            positionName += "th";
        }

        $("<div class='card scoreboardEntry'>")
            .append($("<div class='scoreboardPosition'>")
                .text(positionName)
            )
            .append($("<div class='scoreboardName'>")
                .text(name)
            )
            .append($("<div class='scoreboardScore'>")
                .text(score)
            )
            .appendTo($("#scoreboardEntries"))
        ;
    }
}

firebase.database().ref("arena/users").orderByChild("score").on("value", function(snapshot) {
    var tempScoreboardData = [];

    snapshot.forEach(function(childSnapshot) {
        tempScoreboardData.push({
            name: childSnapshot.val().name,
            score: childSnapshot.val().score
        });
    });

    scoreboardData = tempScoreboardData.reverse();
});

setInterval(function() {
    rewriteScoreboard(scoreboardData);
}, 100);