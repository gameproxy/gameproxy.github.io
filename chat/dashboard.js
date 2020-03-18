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
    if (addToHomeScreenPrompt != null && addToHomeScreenPrompt != undefined) {
        addToHomeScreenPrompt.prompt();

        addToHomeScreenPrompt.userChoice.then(function(result) {
            if (result.outcome == "accepted") {
                finishGetStarted("pwa");
            }
        });
    } else {
        if (window.matchMedia("(display-mode: standalone)").matches) {
            alert("You're already in the web app, what are you doing?!", "Already In App");
        } else {
            alert("You'll need to manually add this app to your home screen to enjoy our web app!", "Add To Home Screen");            
        }

        finishGetStarted("pwa");
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

    firebase.database().ref("chat/directory").orderByKey().limitToLast(24).once("value", function(snapshot) {
        var serverList = [];

        snapshot.forEach(function(childSnapshot) {
            serverList.unshift(childSnapshot.val());
            serverList[0]["key"] = childSnapshot.key;
        });
        
        $(".itemHolder.discoverServers").html("");

        for (var i = 0; i < serverList.length; i++) {
            $(".itemHolder.discoverServers").append(
                $("<div class='item serverItem'>").append(
                    $("<a>").attr("href", "viewServer.html?server=" + encodeURIComponent(serverList[i]["key"])).append([
                        $("<img>").attr("src", serverList[i]["thumbnail"]),
                        $("<div>").text(serverList[i]["name"] || "Untitled Server")
                    ])
                )
            );
        }
    });
});