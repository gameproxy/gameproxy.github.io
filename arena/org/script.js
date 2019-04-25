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

function shHoldingScreen(screens, show = true) {
    for (var i = 0; i < screens.length; i++) {
        var screenPassOn = screens[i];

        function passOnValue(value) {
            firebase.database().ref("arena/computers/" + screens[i].trim() + "/holdingScreen").once("value", function(snapshot) {
                if (snapshot.val() == null) {
                    alert("One or more computers do not exist in the action list. The action may have completed on other computers.", "Error while setting option");
                } else {
                    firebase.database().ref("arena/computers/" + value.trim() + "/holdingScreen").set(show);
                }
            });
        }

        passOnValue(screens[i]);
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
    shHoldingScreen($("#shHoldingScreens").val().split(","), show);
}