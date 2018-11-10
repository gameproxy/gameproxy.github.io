function getURLParameter(name) {
    return decodeURIComponent((new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null;
}

setInterval(function() {
    var countdownDate = new Date("Nov 24, 2018 16:00:00").getTime();
    var now = new Date().getTime();
    var distance = countdownDate - now;

    if (distance > 0) {
        // Debug purposes only
        if (!isStaff(currentUid) && getURLParameter("doCountdown") == "true") {
            window.location.href = "countdown.html";
        }
    }
}, 100);