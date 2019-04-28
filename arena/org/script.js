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