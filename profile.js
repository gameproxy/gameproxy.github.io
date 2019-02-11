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
});