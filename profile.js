function getURLParameter(name) {
    return decodeURIComponent((new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null;
}

function updateLastSeenInfo() {
    firebase.database().ref("users/" + getURLParameter("user") + "/_settings/lastSeen").once("value", function(snapshot) {
        if (snapshot.val() >= new Date().getTime() - (10 * 1000)) {
            $(".isOnline").text("Online");
        } else {
            $(".isOnline").text("Offline");
        }
    });
}

firebase.auth().onAuthStateChanged(function() {
    if (getURLParameter("user") == currentUid) {
        window.location.href = "account";
    }
});

$(function() {
    firebase.database().ref("users/" + getURLParameter("user") + "/_settings/name").on("value", function(snapshot) {
        if (snapshot.val() == null) {
            window.location.href = "profileNotFound.html";
        }

        $(".profileName").text(snapshot.val());

        setInterval(function() {
            if (isStaff(getURLParameter("user"))) {
                $(".profileName").css("color", "#27ef70");
                $(".adminBanner").show();
            } else if (isGameProxyPro(getURLParameter("user"))) {
                $(".profileName").css("color", "#b3c20f");
            }
        });
    });

    firebase.storage().ref("users/" + getURLParameter("user") + "/_settings/ppic.png").getDownloadURL().then(function(data) {
        $(".profilePicture").attr("src", data);
    });

    setInterval(updateLastSeenInfo, 5000);
    updateLastSeenInfo();
});