function leaveServer() {
    firebase.database().ref("users/" + currentUid + "/_settings/chat/servers/" + getURLParameter("server")).set(null).then(function() {
        firebase.database().ref("chat/servers/" + getURLParameter("server") + "/members/" + currentUid).set(null);
    });
}

function showLeaveServerDialog() {
    firebase.database().ref("chat/servers/" + getURLParameter("server") + "/masterowner").once("value", function(snapshot) {
        if (snapshot.val() != currentUid) {
            dialog("Leave server?", `
                Do you really want to leave this server?
            `, [
                {text: "Cancel", onclick: "closeDialog();", type: "bad"},
                {text: "Leave", onclick: "leaveServer(); closeDialog();", type: "reallyBad"}
            ]);
        } else {
            dialog("You can't do that!", `
                Sorry, but master owners cannot leave the server they created.
                You can always delete the server, though.
            `);
        }
    });
}

function setServerDetails() {
    if ($("#serverName").val().trim() != "") {
        firebase.database().ref("chat/servers/" + getURLParameter("server") + "/name").set($("#serverName").val().trim());

        firebase.database().ref("chat/servers/" + getURLParameter("server") + "/thumbnail").set($("#serverThumbnail").val().trim());

        firebase.database().ref("chat/servers/" + getURLParameter("server") + "/description").set($("#serverDescription").val().trim());

        firebase.database().ref("chat/directory/" + getURLParameter("server")).once("value", function(snapshot) {
            if (snapshot.val() != null) {
                firebase.database().ref("chat/directory/" + getURLParameter("server") + "/name").set($("#serverName").val().trim());

                firebase.database().ref("chat/directory/" + getURLParameter("server") + "/thumbnail").set($("#serverThumbnail").val().trim());

                firebase.database().ref("chat/directory/" + getURLParameter("server") + "/description").set($("#serverDescription").val().trim());
            }
        });
    }
}

function renameChannel(channelKey) {
    if ($("#renamedChannelName").val().trim() != "") {
        var renamedChannelName = $("#renamedChannelName").val().trim().replace(/[^0-9a-z]/g, "");

        firebase.database().ref("chat/servers/" + getURLParameter("server") + "/channelList/" + channelKey).set(renamedChannelName);
        firebase.database().ref("chat/servers/" + getURLParameter("server") + "/channels/" + channelKey + "/name").set(renamedChannelName);
   
        closeDialog();
    }
}

function showRenameChannelDialog(channelKey) {
    dialog("Rename channel", `
        <div class="center">
            <p>Your new channel name awaits...</p>
            <input placeholder="Must be all lowercase, no spaces or symbols" id="renamedChannelName">
        </div>
    `, [
        {text: "Cancel", onclick: "closeDialog();", type: "bad"},
        {text: "Rename", onclick: "renameChannel(\"" + channelKey + "\");"}
    ])
}

function deleteChannel(channelKey) {
    firebase.database().ref("chat/servers/" + getURLParameter("server") + "/channelList/" + channelKey).set(null);
    firebase.database().ref("chat/servers/" + getURLParameter("server") + "/channels/" + channelKey).set(null);
}

function showDeleteChannelDialog(channelKey) {
    if (channelKey != "general") { // You can't delete the general channel, which is given the key of `general`
        dialog("Delete channel?", `
            Do you really want to delete this channel? This can't be undone!
        `, [
            {text: "Cancel", onclick: "closeDialog();", type: "bad"},
            {text: "Rename", onclick: "deleteChannel(\"" + channelKey + "\");", type: "reallyBad"}
        ]);
    } else {
        dialog("Cannot delete channel", `
            You can't delete the #general channel as it is permanent.
        `);
    }
}

$(function() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            $(".linkToServer").attr("href", "server.html?server=" + encodeURIComponent(getURLParameter("server")));

            firebase.database().ref("users/" + currentUid + "/_settings/name").on("value", function(snapshot) {
                $(".mentionExample").text("{" + snapshot.val() + "}");
            });

            firebase.database().ref("chat/servers/" + getURLParameter("server") + "/name").once("value", function(snapshot) {
                $("#serverName").val(snapshot.val());
            });

            firebase.database().ref("chat/servers/" + getURLParameter("server") + "/thumbnail").once("value", function(snapshot) {
                $("#serverThumbnail").val(snapshot.val());
            });

            firebase.database().ref("chat/servers/" + getURLParameter("server") + "/description").once("value", function(snapshot) {
                $("#serverDescription").val(snapshot.val());
            });

            firebase.database().ref("chat/servers/" + getURLParameter("server") + "/channelList").on("value", function(snapshot) {
                $("#settingsChannelList").html("");

                for (var key in snapshot.val()) {
                    $("#settingsChannelList").append(
                        $("<div class='card settingsChannel'>").append([
                            $("<span>").text("#" + snapshot.val()[key]),
                            $("<div class='floatRight'>").append([
                                $("<button>")
                                    .text("Rename")
                                    .attr("onclick", "javascript:showRenameChannelDialog('" + key + "');"),
                                $("<button class='reallyBad'>")
                                    .text("Delete")
                                    .attr("onclick", "javascript:showDeleteChannelDialog('" + key + "');")
                            ])
                        ])
                    );
                }
            });
        }
    });
});