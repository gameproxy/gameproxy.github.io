firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        firebase.database().ref("users/" + currentUid + "/notifications/unread").once("value", function(snapshot) {
            if (snapshot.val() != null && Object.keys(snapshot.val()).length > 0) {
                if (Object.keys(snapshot.val()).length == 1) {
                    $(".unreadNotificationsPlural").hide();
                }

                $(".unreadNotificationsCount").text(Object.keys(snapshot.val()).length);
                $(".unreadNotificationsAlert").show();
            }
        });
    }
});