var computerNumber = 0;
var currentUid = null;

const sides = {
    LEFT: 0,
    RIGHT: 1
};

var sideUserInfo = {
    left: {},
    right: {}
};

function startFirstRound() {
    $(".signInSides").fadeOut();
    $(".enteringCompetitionSides").fadeOut();
    $(".game").fadeIn();
}

function startNextRound() {
    $(".moveComputerSides").fadeOut();
    $("#computerNumberFloaterContainer").fadeOut();
    $(".game").fadeIn();
}

function finishRound() {
    $(".finishRoundNames.leftSide").text(sideUserInfo.left.name);
    $(".finishRoundNames.rightSide").text(sideUserInfo.right.name);

    $(".finishRoundDisplay").fadeIn();
}

function configureCommunication() {
    firebase.database().ref("arena/computers/" + computerNumber).set({
        holdingScreen: false
    }).then(function() {
        firebase.database().ref("arena/computers/" + computerNumber).on("value", function(snapshot) {
            var data = snapshot.val();

            if (data.holdingScreen == true) {
                $(".holdingScreen").fadeIn();
            } else {
                $(".holdingScreen").fadeOut();
            }

            if (data.startFirstRound == true) {
                startFirstRound();
                
                firebase.database().ref("arena/computers/" + computerNumber + "/startFirstRound").set(null);
            }

            if (data.startNextRound == true) {
                startNextRound();
                
                firebase.database().ref("arena/computers/" + computerNumber + "/startNextRound").set(null);
            }

            if (data.finishRound == true) {
                finishRound();
                
                firebase.database().ref("arena/computers/" + computerNumber + "/finishRound").set(null);
            }

            if (data.showMoveComputers == true) {
                firebase.database().ref("arena/users/" + computerNumber + "l").once("value", function(snapshot) {
                    sideUserInfo.left = snapshot.val();

                    firebase.database().ref("arena/users/" + computerNumber + "r").once("value", function(snapshot) {
                        sideUserInfo.right = snapshot.val();

                        firebase.database().ref("arena/computers/" + computerNumber + "/moveData").once("value", function(snapshot) {
                            showMoveComputers(snapshot.val());
                        });
        
                        firebase.database().ref("arena/computers/" + computerNumber + "/showMoveComputers").set(null);
                    });
                });
            }
        });
    });
}

function setComputerNumber() {
    if ($("#computerNumber").val() != "") {
        computerNumber = $("#computerNumber").val();

        $("#computerNumberReadout").text(computerNumber).css("display", "inline");

        $("#setComputerNumber").fadeOut();
        $(".game").fadeIn();
        $("#continueAfterSetup").fadeIn();

        configureCommunication();
    } else {
        alert("Please specify a computer number.", "Cannot set computer number");
    }
}

function continueAfterSetup() {
    $(".game").fadeOut();
    $("#continueAfterSetup").fadeOut();
    $(".signInSides").fadeIn();
}

function storeUser(data, computer, side) {
    data.computer = computer;
    data.side = side;

    firebase.database().ref("arena/users/" + computerNumber + (side == sides.LEFT ? "l" : "r")).set(data);
}

function deleteUser(key) {
    firebase.database().ref("arena/users/" + key).set(null);
}

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        currentUid = user.uid;
    } else {
        currentUid = null;
    }
});

function enterCompetition(side) {
    var sideName = (side == sides.LEFT ? "leftSide" : "rightSide");
    var sideNameBare = (side == sides.LEFT ? "left" : "right");

    if (($(".signInEmail." + sideName).val().trim() != "" && $(".signInPassword." + sideName).val().trim() != "") || $(".signInName." + sideName).val().trim() != "") {
        $(".enterCompetitionButton." + sideName).attr("disabled", "");
        $(".enterCompetitionButton." + sideName).css({
            backgroundColor: "#7e7e7e",
            color: "black",
            cursor: "default"
        });

        $(".signInError." + sideName).text("");

        if ($(".signInName." + sideName).val().trim() != "") {
            if ($(".signInName." + sideName).val().trim().split(" ").length >= 2) {
                sideUserInfo[sideNameBare]["method"] = "name";
                sideUserInfo[sideNameBare]["name"] = $(".signInName." + sideName).val();
                sideUserInfo[sideNameBare]["score"] = 0;

                storeUser(sideUserInfo[sideNameBare], computerNumber, side);

                $(".enteringCompetitionSides." + sideName).fadeIn();
            } else {
                $(".signInError." + sideName).text("Oops! Your full name should have over 2 words.");
            }

            $(".enterCompetitionButton." + sideName).attr("disabled", null);
            $(".enterCompetitionButton." + sideName).css({
                backgroundColor: "",
                color: "",
                cursor: ""
            });
        } else {
            firebase.auth().signInWithEmailAndPassword($(".signInEmail." + sideName).val(), $(".signInPassword." + sideName).val()).then(function() {
                $(".enterCompetitionButton." + sideName).attr("disabled", null);
                $(".enterCompetitionButton." + sideName).css({
                    backgroundColor: "",
                    color: "",
                    cursor: ""
                });

                var currentUidCache = null;
                var currentUidListener = function() {
                    setTimeout(function() {
                        if (currentUid != currentUidCache) {
                            firebase.database().ref("users/" + currentUid + "/_settings/name").once("value", function(snapshot) {
                                sideUserInfo[sideNameBare]["method"] = "account";
                                sideUserInfo[sideNameBare]["uid"] = currentUid;
                                sideUserInfo[sideNameBare]["name"] = snapshot.val();
                                sideUserInfo[sideNameBare]["score"] = 0;

                                storeUser(sideUserInfo[sideNameBare], computerNumber, side);

                                firebase.auth().signOut().then(function() {
                                    $(".enteringCompetitionSides." + sideName).fadeIn();
                                });
                            });
                        } else {
                            currentUidListener();
                        }
                    });
                };

                currentUidListener();
            }).catch(function(error) {
                $(".enterCompetitionButton." + sideName).attr("disabled", null);
                $(".enterCompetitionButton." + sideName).css({
                    backgroundColor: "",
                    color: "",
                    cursor: ""
                });

                $(".signInError." + sideName).text("Oops! " + error.message);
            });
        }
    } else {
        $(".signInError." + sideName).text("Oops! You didn't fill out the needed fields.");
    }
}

function cancelEntry(side) {
    var sideName = (side == sides.LEFT ? "leftSide" : "rightSide");
    var sideNameBare = (side == sides.LEFT ? "left" : "right");

    sideUserInfo[sideNameBare] = {};

    var key = computerNumber + (side == sides.LEFT ? "l" : "r");

    deleteUser(key);

    $(".enteringCompetitionSides." + sideName).fadeOut();
}

function showMoveComputers(data) {
    var leftSide = data.leftSide;
    var rightSide = data.rightSide;

    $(".finishRoundDisplay").fadeOut();

    $(".moveComputerName.leftSide").text($(".finishRoundNames.leftSide").text());
    $(".moveComputerNumber.leftSide").text(leftSide.number);
    $(".moveComputerNextName.leftSide").text(leftSide.nextName);

    $(".moveComputerName.rightSide").text($(".finishRoundNames.rightSide").text());
    $(".moveComputerNumber.rightSide").text(rightSide.number);
    $(".moveComputerNextName.rightSide").text(rightSide.nextName);

    $("#computerNumberFloater").text(computerNumber);

    $(".game").fadeOut();
    $(".moveComputerSides").fadeIn();
    $("#computerNumberFloaterContainer").fadeIn();
}

$(function() {
    firebase.auth().signOut();

    $("#setComputerNumber").fadeIn();

    $("#computerNumber").keydown(function(e) {
        if (e.keyCode == 13) {
            setComputerNumber();
        }
    });

    window.onbeforeunload = function() {
        return "Careful! Reloading this page may cause you to be removed from the competition. Do you really want to continue?";
    };
});

setInterval(function() {
    $(".givenComputerNumber").text(computerNumber);
}, 10);
