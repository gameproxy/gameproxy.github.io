function getURLParameter(name) {
    return decodeURIComponent((new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null;
}

firebase.auth().onAuthStateChanged(function() {
    var countdownDate = new Date("Nov 24, 2018 16:00:00").getTime();
    var now = new Date().getTime();
    var distance = countdownDate - now;

    if (distance > 0) {
        if (!isStaff(currentUid) && getURLParameter("bypassCountdown") != "true") {
            window.location.href = "countdown.html";
        }
}});