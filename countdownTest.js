function getURLParameter(name) {
    return decodeURIComponent((new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null;
}

firebase.auth().onAuthStateChanged(function() {
    var countdownDate = new Date("Nov 24, 2018 16:00:00").getTime();
    var now = new Date().getTime();
    var distance = countdownDate - now;

    if (distance > 0) {
        if (getURLParameter("unlockCountdown") == "true") {
            localStorage.setItem("unlockCountdown", true);
        }

        if (getURLParameter("unlockCountdown") == "false") {
            localStorage.setItem("unlockCountdown", false);
        }

        if (!isStaff(currentUid) && getURLParameter("bypassCountdown") != "true" && localStorage.getItem("unlockCountdown") != true) {
            window.location.href = "countdown.html";
        }
}});