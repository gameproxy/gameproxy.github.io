$(function() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            window.location.replace("/chat/index.html");
        }
    });
});