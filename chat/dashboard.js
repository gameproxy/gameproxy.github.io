var cloudMessaging = firebase.messaging();
var addToHomeScreenPrompt;

function finishGetStarted(name) {
    $("[data-get-started-step='" + name + "']").addClass("done");
    $("[data-get-started-step='" + name + "'] i").text("check");

    firebase.database().ref("users/" + currentUid + "/_settings/chat/data/getStarted/" + name).set(true);
}

function dismissGetStarted() {
    $(".chatGetStarted").hide();

    firebase.database().ref("users/" + currentUid + "/_settings/chat/data/getStarted/all").set(true);
}

function addToHomeScreen() {
    if (addToHomeScreenPrompt != null) {
        addToHomeScreenPrompt.prompt();

        addToHomeScreenPrompt.userChoice.then(function(result) {
            if (result.outcome == "accepted") {
                finishGetStarted("pwa");
            }
        });
    } else {
        alert("You'll need to manually add this app to your home screen to enjoy our web app!", "Add To Home Screen")
    }
}

function enableNotifications() {
    Notification.requestPermission().then(function(result) {
        if (result == "granted") {
            cloudMessaging.getToken().then(function(token) {
                firebase.database().ref("users/" + currentUid + "/chat/tokens/" + token).set(true);
            });

            finishGetStarted("notifications");
            
            new Notification("All working!", {
                body: "You're all set to be notified from GameProxy Chat!"
            });
        }
    });
}

firebase.auth().onAuthStateChanged(function() {
    firebase.database().ref("users/" + currentUid + "/_settings/chat/data/getStarted").on("value", function(snapshot) {
        var tasks = snapshot.val() || {};
        
        if (!(tasks.pwa && tasks.notifications && tasks.joincreate) && !tasks.all) {
            for (var task in tasks) {
                finishGetStarted(task);
            }

            $(".chatGetStarted").show();
        }
    });
});

$(function() {
    cloudMessaging.usePublicVapidKey("BMRVci7h85dOJh1zXNbI8-OIzruX5cOrtGH0PRsslx__D4W9Ccda_ocNESNDKDQBPcMg4WecdP19uJEsuLLx1vo");

    cloudMessaging.onTokenRefresh(function(token) {
        firebase.database().ref("users/" + currentUid + "/chat/tokens/" + token).set(true);
    });

    addEventListener("beforeinstallprompt", function(event) {
        addToHomeScreenPrompt = event;
    });
});