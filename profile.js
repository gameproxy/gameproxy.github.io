var lastSeenCount = 0;
var polledLastSeen = 0;
var firstPoll = true;

function getURLParameter(name) {
    return decodeURIComponent((new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null;
}

firebase.auth().onAuthStateChanged(function() {
    if (getURLParameter("user") == currentUid) {
        window.location.href = "account.html";
    }
});

$(function() {
    firebase.database().ref("users/" + getURLParameter("user") + "/_settings/name").on("value", function(snapshot) {
        if (snapshot.val() == null) {
            window.location.href = "profileNotFound.html";
        }

        $(".profileName").text(snapshot.val());

        if (isStaff(getURLParameter("user"))) {
            $(".profileName").css("color", "#27ef70");
            $(".adminBanner").show();
        }
    });

    firebase.storage().ref("users/" + getURLParameter("user") + "/_settings/ppic.png").getDownloadURL().then(function(data) {
        $(".profilePicture").attr("src", data);
    });

    firebase.database().ref("users/" + getURLParameter("user") + "/_settings/lastSeen").on("value", function(snapshot) {
        if (!firstPoll) {
            lastSeenCount = 0;
        } else {
            firstPoll = false;
        }
    });

    setInterval(function() {
        lastSeenCount++;
        polledLastSeen++;

        if (lastSeenCount <= 10 && polledLastSeen >= 11) {
            $(".isOnline").text("Online");
        } else if (polledLastSeen >= 11) {
            $(".isOnline").text("Offline");
        } else {
            $(".isOnline").text("Please wait... (" + (10 - polledLastSeen) + ")");
        }
    }, 1000);
});