function formatDate(date) {
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    return day + " " + monthNames[monthIndex] + " " + year + " at " + date.toLocaleTimeString("en-GB", {hour: "2-digit", minute: "2-digit"});
}

function moveToArchive(key) {
    $(".notificationArchive").children("p").remove();
    $(".notificationArchive").prepend($("[data-key=" + key + "]").detach().removeClass("coloured"));
    $(".notificationArchive").find(".options:first").remove();

    if ($(".notificationUnread").html() == "") {
        $(".notificationUnreadSection").hide();
    }

    firebase.database().ref("users/" + currentUid + "/notifications/unread/" + key).once("value", function(snapshot) {
        firebase.database().ref("users/" + currentUid + "/notifications/archive").push().set(snapshot.val());
        firebase.database().ref("users/" + currentUid + "/notifications/unread/" + key).set(null);
    });
}

function newNotification(key, value, unread = true) {
    if (!unread) {
        $(".notificationArchive").children("p").remove();
    }
    
    $("<div class='notification card'>")
        .addClass(unread ? "coloured" : "")
        .attr("data-key", key)
        .prependTo(unread ? ".notificationUnread" : ".notificationArchive")
    ;

    if (unread) {
        $("<div class='options top'>").appendTo((unread ? ".notificationUnread " : ".notificationArchive ") + ".notification:first");

        $("<button class='secondary'>")
            .css({
                "padding": "5px",
                "padding-bottom": "0"
            })
            .html("<i class='material-icons'>check</i>")
            .find("i")
            .css("font-size", "inherit")
            .parent()
            .attr("onclick", "moveToArchive('" + key + "');")
            .appendTo((unread ? ".notificationUnread " : ".notificationArchive ") + ".options:first")
        ;
    }

    $("<span class='commentDate'>")
            .text(formatDate(new Date(value.date)) + ": ")
            .appendTo((unread ? ".notificationUnread " : ".notificationArchive ") + ".notification:first")
        ;

    $("<strong><a class='hidden'></strong>")
        .find("a")
        .text(value.username)
        .attr("href", "/profile?user=" + value.uid)
        .css("color", isStaff(value.uid) ? "#27ef70" : (isGameProxyPro(value.uid) ? "#b3c20f" : "inherit"))
        .parent()
        .appendTo((unread ? ".notificationUnread " : ".notificationArchive ") + ".notification:first")
    ;

    if (value.type == "comment") {
        $("<span>")
            .text(" commented on ")
            .appendTo((unread ? ".notificationUnread " : ".notificationArchive ") + ".notification:first")
        ;

        $("<strong><a class='hidden'></strong>")
            .find("a")
            .text(value.targetName)
            .attr("href", "/game.html?play=" + value.target)
            .parent()
            .appendTo((unread ? ".notificationUnread " : ".notificationArchive ") + ".notification:first")
        ;

        $("<span>")
            .text(": ")
            .appendTo((unread ? ".notificationUnread " : ".notificationArchive ") + ".notification:first")
        ;

        $("<blockquote>")
            .text(value.content)
            .appendTo((unread ? ".notificationUnread " : ".notificationArchive ") + ".notification:first")
        ;
    }
}

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        firebase.database().ref("users/" + currentUid + "/notifications/unread").once("value", function(snapshot) {
            if (snapshot.val() != null && Object.keys(snapshot.val()).length != 0) {
                for (var i = 0; i < Object.keys(snapshot.val()).length; i++) {
                    var key = Object.keys(snapshot.val())[i];

                    newNotification(key, snapshot.val()[key]);
                }
                
                $(".notificationUnreadSection").show();
            }
        });

        firebase.database().ref("users/" + currentUid + "/notifications/archive").once("value", function(snapshot) {
            if (snapshot.val() != null && Object.keys(snapshot.val()).length != 0) {
                for (var i = 0; i < Object.keys(snapshot.val()).length; i++) {
                    var key = Object.keys(snapshot.val())[i];

                    newNotification(key, snapshot.val()[key], false);
                }
            }
        });
    }
});