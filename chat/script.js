firebase.auth().onAuthStateChanged(function(user) {
    if (!user) {
        window.location.replace("../chat.html");
    }
});

$(function() {
    if (window.matchMedia("(display-mode: standalone)").matches) {
        $("body").removeClass("reserveWebAppSpace");
    } else {
        $("body").addClass("reserveWebAppSpace");
    }
});