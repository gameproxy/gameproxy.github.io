var scoreboardData = [];

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        if (isStaff(user.uid)) {
            $(".signedInOrg").show();
            $(".notSignedIn").hide();
            $(".signedIn").show();
        } else {
            $(".notSignedIn").show();
            $(".signedInOrg").hide();
            $(".signedIn").hide();
        }
    } else {
        $(".notSignedIn").show();
        $(".signedInOrg").hide();
        $(".signedIn").hide();
    }
});

function getKeyByValue(object, value) {
    return Object.keys(object).find(function(key) {
        return object[key] === value;
    });
}

function resortObject(object) {
    var ordered = {};

    Object.keys(object).sort().forEach(function(key) {
        ordered[key] = object[key];
    });

    return ordered;
}

function shHoldingScreen(computers, show = true) {
    for (var i = 0; i < computers.length; i++) {
        var screenPassOn = computers[i];

        function passOnValue(value) {
            firebase.database().ref("arena/computers/" + computers[i].trim() + "/holdingScreen").once("value", function(snapshot) {
                if (snapshot.val() == null) {
                    alert("One or more computers do not exist in the action list. The action may have completed on other computers.", "Error while setting option");
                } else {
                    firebase.database().ref("arena/computers/" + value.trim() + "/holdingScreen").set(show);
                }
            });
        }

        passOnValue(computers[i]);
    }
}

function delComputers(computers) {
    for (var i = 0; i < computers.length; i++) {
        var screenPassOn = computers[i];

        function passOnValue(value) {
            firebase.database().ref("arena/computers/" + computers[i].trim() + "/holdingScreen").once("value", function(snapshot) {
                if (snapshot.val() == null) {
                    alert("One or more computers do not exist in the action list. The action may have completed on other computers.", "Error while setting option");
                } else {
                    firebase.database().ref("arena/computers/" + value.trim()).set(null);
                }
            });
        }

        passOnValue(computers[i]);
    }
}

function shHSAll(show = true) {
    firebase.database().ref("arena/computers").once("value", function(snapshot) {
        var computerList = snapshot.val();

        for (var i = 0; i < Object.keys(computerList).length; i++) {
            shHoldingScreen(Object.keys(computerList)[i], show);
        }
    });
}

function shHSFromTextarea(show = true) {
    shHoldingScreen($("#fromTextarea").val().split(","), show);
}

function delAll() {
    firebase.database().ref("arena/computers").once("value", function(snapshot) {
        var computerList = snapshot.val();

        for (var i = 0; i < Object.keys(computerList).length; i++) {
            delComputers(Object.keys(computerList)[i]);
        }
    });

    firebase.database().ref("arena/users").set(null);
}

function delFromTextarea() {
    delComputers($("#fromTextarea").val().split(","));
}

function startFirstRound() {
    firebase.database().ref("arena/computers").once("value", function(snapshot) {
        var computerList = snapshot.val();

        for (var i = 0; i < Object.keys(computerList).length; i++) {
            firebase.database().ref("arena/computers/" + Object.keys(computerList)[i] + "/startFirstRound").set(true);
        }
    });
}

function startNextRound() {
    firebase.database().ref("arena/computers").once("value", function(snapshot) {
        var computerList = snapshot.val();

        for (var i = 0; i < Object.keys(computerList).length; i++) {
            firebase.database().ref("arena/computers/" + Object.keys(computerList)[i] + "/startNextRound").set(true);
        }
    });
}

function finishRound(computers) {
    for (var i = 0; i < computers.length; i++) {
        var screenPassOn = computers[i];

        function passOnValue(value) {
            firebase.database().ref("arena/computers/" + computers[i].trim() + "/holdingScreen").once("value", function(snapshot) {
                if (snapshot.val() == null) {
                    alert("One or more computers do not exist in the action list. The action may have completed on other computers.", "Error while setting option");
                } else {
                    firebase.database().ref("arena/computers/" + value.trim() + "/finishRound").set(true);
                }
            });
        }

        passOnValue(computers[i]);
    }
}

function finishRoundAll() {
    firebase.database().ref("arena/computers").once("value", function(snapshot) {
        var computerList = snapshot.val();

        for (var i = 0; i < Object.keys(computerList).length; i++) {
            finishRound(Object.keys(computerList)[i]);
        }
    });
}

function finishRoundFromTextarea() {
    finishRound($("#fromTextarea").val().split(","));
}

function rewriteScores(data) {
    $("#scorePlayerList").html("");

    for (var i = 0; i < data.length; i++) {
        var name = data[i].name;
        var score = data[i].score;
        var id = data[i].id;

        $("<div class='card scorePlayerListEntry'>")
            .append($("<div class='scorePlayerListID'>")
                .text(id.toUpperCase())
            )
            .append($("<div class='scorePlayerListName'>")
                .text(name)
            )
            .append($("<div class='scorePlayerListScore'>")
                .text(score)
            )
            .append($("<div class='scorePlayerListActions'>")
                .html(`
                    &pm;<input type="number" value="0" data-player-id="` + id + `">
                `)
            )
            .appendTo($("#scorePlayerList"))
        ;
    }
}

function getScoresAgain() {
    firebase.database().ref("arena/users").once("value", function(snapshot) {
        var tempScoreboardData = [];
    
        snapshot.forEach(function(childSnapshot) {
            tempScoreboardData.push({
                name: childSnapshot.val().name,
                score: childSnapshot.val().score,
                id: childSnapshot.key
            });
        });

        scoreboardData = tempScoreboardData;

        rewriteScores(scoreboardData);
    });
}

function modifyScores() {
    var IDList = [];

    for (var i = 0; i < $("[data-player-id]").length; i++) {
        IDList.push($($("[data-player-id]")[i]).attr("data-player-id"));
    }

    for (var i = 0; i < IDList.length; i++) {
        var element = $("[data-player-id]")[i];

        if (!($(element).val() == "0" || $(element).val() == "" || $(element).val() == "-0")) {
            firebase.database().ref("arena/users/" + IDList[i]).once("value", function(snapshot) {
                var score = snapshot.val().score;
                var ID = snapshot.key;

                console.log(ID);

                firebase.database().ref("arena/users/" + ID + "/score").set(score + Number($("[data-player-id='" + ID + "'").val()));
            });
        }
    }

    dialog("Submitting...", "Please wait...", []);

    setTimeout(function() {
        getScoresAgain();
        closeDialog();
    }, 3000);
}

function movePeople(newPositions) {
    var positionMap = {};

    firebase.database().ref("arena/users").once("value", function(snapshot) {
        dialog("Submitting...", "Please wait...", []);

        var peopleList = Object.keys(snapshot.val());
        var oldUserData = snapshot.val();
        var newUserData = {};

        for (var i = 0; i < peopleList.length; i++) {
            positionMap[peopleList[i]] = newPositions[i];
        }

        for (var i = 0; i < peopleList.length; i++) {
            newUserData[positionMap[Object.keys(positionMap)[i]]] = oldUserData[peopleList[i]];
        }

        firebase.database().ref("arena/users").set(newUserData);

        firebase.database().ref("arena/computers").once("value", function(snapshot) {
            var computerList = snapshot.val();
    
            for (var i = 0; i < Object.keys(computerList).length; i++) {
                function doStoreMoveData(computer) {
                    var newKey = computer;

                    firebase.database().ref("arena/computers/" + computer + "/moveData").set({
                        leftSide: {
                            number: positionMap[newKey + "l"].slice(0, -1),
                            nextName: newUserData[newKey + "l"].name
                        },

                        rightSide: {
                            number: positionMap[newKey + "r"].slice(0, -1),
                            nextName: newUserData[newKey + "r"].name
                        }
                    });
                }

                doStoreMoveData(Object.keys(computerList)[i]);
            }
        });

        setTimeout(function() {
            closeDialog();
        }, 5000);
    });
}

function submitMoving() {
    firebase.database().ref("arena/computers").once("value", function(snapshot) {
        var computerList = snapshot.val();

        for (var i = 0; i < Object.keys(computerList).length; i++) {
            firebase.database().ref("arena/computers/" + Object.keys(computerList)[i] + "/showMoveComputers").set(true);
        }
    });
}

$(function() {
    if (window.location.pathname.split("/").pop() == "scoreMod.html") {
        getScoresAgain();
    }
});