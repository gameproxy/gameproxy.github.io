function getURLParameter(name) {
    return decodeURIComponent((new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null;
}

$(function() {
    firebase.database().ref("users/" + getURLParameter("user") + "/_settings/name").on("value", function(snapshot) {
        $(".profileName").text(snapshot.val());

        if (isStaff(getURLParameter("user"))) {
            $(".profileName").css("color", "#27ef70");
        }
    });

    firebase.storage().ref("users/" + getURLParameter("user") + "/_settings/ppic.png").getDownloadURL().then(function(data) {
        $(".profilePicture").attr("src", data);
    });
});