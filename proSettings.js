$(function() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            firebase.database().ref("users/" + currentUid + "/_settings/gpPro/data/theme").on("value", function(snapshot) {
                if (snapshot.val() == null) {
                    $(".themeItem").removeClass("selected");
                    $(".themeItem[data-theme='-1']").addClass("selected");
                } else {
                    $(".themeItem").removeClass("selected");
                    $(".themeItem[data-theme='" + snapshot.val() + "']").addClass("selected");
                }
            });
        }
    });
});

function setTheme(theme) {
    firebase.database().ref("users/" + currentUid + "/_settings/gpPro/data/theme").set(theme).then(function() {
        if (theme == -1) {
            window.location.reload();
        }
    });
}