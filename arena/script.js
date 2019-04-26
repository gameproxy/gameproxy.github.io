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