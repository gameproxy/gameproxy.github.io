firebase.auth().onAuthStateChanged(function() {
    var countdownDate = new Date("Nov 24, 2018 16:00:00").getTime();
    var now = new Date().getTime();
    var distance = countdownDate - now;

    if (distance > 0) {
        if (!isStaff(currentUid)) {
            window.location.href = "countdown.html";
        }
}});