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
        firebase.database().ref("arena/computers/" + screens[i].trim() + "/holdingScreen").set(show);
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