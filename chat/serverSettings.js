var deletingServer = false;

function leaveServer() {
    firebase.database().ref("users/" + currentUid + "/_settings/chat/servers/" + getURLParameter("server")).set(null).then(function() {
        firebase.database().ref("chat/servers/" + getURLParameter("server") + "/owners").on("value", function(snapshot) {
            var ownersList = snapshot.val() == null ? [] : Object.keys(snapshot.val());

            if (ownersList.indexOf(currentUid) > -1) {
                firebase.database().ref("chat/servers/" + getURLParameter("server") + "/owners/" + currentUid).set(null).then(function() {
                    window.location.replace("dashboard.html");
                });
            } else {
                firebase.database().ref("chat/servers/" + getURLParameter("server") + "/members/" + currentUid).set(null).then(function() {
                    window.location.replace("dashboard.html");
                });
            }
        });
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
    if ($("#serverName").val().trim() != "" && $("#serverDescription").val().trim() != "") {
        firebase.database().ref("chat/servers/" + getURLParameter("server") + "/name").set($("#serverName").val().trim());

        firebase.database().ref("chat/servers/" + getURLParameter("server") + "/thumbnail").set($("#serverThumbnail").val().trim() == "" ? null : $("#serverThumbnail").val().trim());

        firebase.database().ref("chat/servers/" + getURLParameter("server") + "/game").set($("#serverGame").val().trim() == "" ? null : $("#serverGame").val().trim());

        firebase.database().ref("chat/servers/" + getURLParameter("server") + "/description").set($("#serverDescription").val().trim());

        firebase.database().ref("chat/directory/" + getURLParameter("server")).once("value", function(snapshot) {
            if (snapshot.val() != null) {
                firebase.database().ref("chat/directory/" + getURLParameter("server") + "/name").set($("#serverName").val().trim());

                firebase.database().ref("chat/directory/" + getURLParameter("server") + "/thumbnail").set($("#serverThumbnail").val().trim() == "" ? null : $("serverThumbnail").val().trim());

                firebase.database().ref("chat/directory/" + getURLParameter("server") + "/game").set($("#serverGame").val().trim() == "" ? null : $("#serverGame").val().trim());

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

    closeDialog();
}

function showDeleteChannelDialog(channelKey) {
    if (channelKey != "--general") { // You can't delete the general channel, which is given the key of `general`
        dialog("Delete channel?", `
            Do you really want to delete this channel? This can't be undone!
        `, [
            {text: "Cancel", onclick: "closeDialog();", type: "bad"},
            {text: "Delete", onclick: "deleteChannel(\"" + channelKey + "\");", type: "reallyBad"}
        ]);
    } else {
        dialog("Cannot delete channel", `
            You can't delete the #general channel as it is permanent.
        `);
    }
}

function createNewChannel() {
    if ($("#newChannelName").val().trim() != "") {
        var newChannelName = $("#newChannelName").val().trim().replace(/[^0-9a-z]/g, "");
        var newChannelReference = firebase.database().ref("chat/servers/" + getURLParameter("server") + "/channelList").push();

        newChannelReference.set(newChannelName);

        firebase.database().ref("chat/servers/" + getURLParameter("server") + "/channels/" + newChannelReference.key).set({
            name: newChannelName
        });
   
        closeDialog();
    }
}

function showCreateNewChannelDialog() {
    dialog("Create channel", `
        <div class="center">
            <p>Choose a name for your new channel: your community will love it!</p>
            <input placeholder="Must be all lowercase, no spaces or symbols" id="newChannelName">
        </div>
    `, [
        {text: "Cancel", onclick: "closeDialog();", type: "bad"},
        {text: "Create", onclick: "createNewChannel();"}
    ]);
}

function deleteServer() {
    deletingServer = true;

    firebase.database().ref("chat/servers/" + getURLParameter("server")).set(null).then(function() {
        firebase.database().ref("chat/directory/" + getURLParameter("server")).set(null).then(function() {
            window.location.replace("dashboard.html");
        });
    });
}

function showDeleteServerDialog() {
    dialog("Delete server?", `
        Do you really want to delete this server? This can't be undone!
    `, [
        {text: "Cancel", onclick: "closeDialog();", type: "bad"},
        {text: "Delete", onclick: "deleteServer();", type: "reallyBad"}
    ]);
}

function setServerPrivacy() {
    if ($("#serverPublic").is(":checked")) {
        firebase.database().ref("chat/servers/" + getURLParameter("server") + "/perms/public").set(true);

        firebase.database().ref("chat/servers/" + getURLParameter("server") + "/name").once("value", function(nameSnapshot) {
            firebase.database().ref("chat/servers/" + getURLParameter("server") + "/game").once("value", function(gameSnapshot) {
                firebase.database().ref("chat/servers/" + getURLParameter("server") + "/thumbnail").once("value", function(thumbnailSnapshot) {
                    firebase.database().ref("chat/servers/" + getURLParameter("server") + "/description").once("value", function(descriptionSnapshot) {
                        firebase.database().ref("chat/directory/" + getURLParameter("server")).set({
                            name: nameSnapshot.val(),
                            game: gameSnapshot.val(),
                            thumbnail: thumbnailSnapshot.val(),
                            description: descriptionSnapshot.val()
                        });
                    });
                });
            });
        });
    } else {
        firebase.database().ref("chat/directory/" + getURLParameter("server")).set(null);

        firebase.database().ref("chat/servers/" + getURLParameter("server") + "/perms/public").set(false);
    }
}

function kickOut(uid) {
    firebase.database().ref("chat/servers/" + getURLParameter("server") + "/owners/" + uid).set(null);
    firebase.database().ref("chat/servers/" + getURLParameter("server") + "/members/" + uid).set(null).then(function() {
        refreshSettingsUserList();

        closeDialog();
    });
}

function showKickOutDialog(uid) {
    dialog("Kick out user?", `
        Do you really want to kick out this user?
    `, [
        {text: "Cancel", onclick: "closeDialog();", type: "bad"},
        {text: "Kick out", onclick: "kickOut(\"" + uid + "\");", type: "reallyBad"}
    ]);
}

function refreshSettingsUserList() {
    firebase.database().ref("chat/servers/" + getURLParameter("server") + "/owners").once("value", function(ownersSnapshot) {
        firebase.database().ref("chat/servers/" + getURLParameter("server") + "/members").once("value", function(usersSnapshot) {
            firebase.database().ref("chat/servers/" + getURLParameter("server") + "/masterowner").once("value", function(masterownerSnapshot) {
                $("#settingsUserList").html("");

                $("#settingsUserList").append(
                    $("<div class='card settingsUser' data-user='" + masterownerSnapshot.val() + "'>").append([
                        $("<strong>"),
                        $("<div class='floatRight'>").append(
                            $("<select disabled>").append(
                                $("<option value='masterowner'>").text("Master owner")
                            )
                        )
                    ])
                );

                firebase.database().ref("users/" + masterownerSnapshot.val() + "/_settings/name").once("value", function(nameSnapshot) {
                    $(".settingsUser[data-user='" + masterownerSnapshot.val() + "'] strong").text(nameSnapshot.val());

                    if (isStaff(masterownerSnapshot.val())) {
                        $(".settingsUser[data-user='" + masterownerSnapshot.val() + "'] strong").css("color", "#27ef70");
                    } else {
                        $(".settingsUser[data-user='" + masterownerSnapshot.val() + "'] strong").css("color", "#42aaf5");
                    }
                });

                for (var key in ownersSnapshot.val()) {
                    $("#settingsUserList").append(
                        $("<div class='card settingsUser' data-user='" + key + "'>").append([
                            $("<strong>"),
                            $("<div class='floatRight'>").append([
                                $("<select>")
                                    .attr("onchange", "changeUserPrivileges('" + key + "');")
                                    .append([
                                        $("<option value='owner' selected>").text("Owner"),
                                        $("<option value='member'>").text("Member")
                                    ])
                                ,
                                $("<button class='reallyBad'>")
                                    .attr("onclick", "showKickOutDialog('" + key + "')")
                                    .text("Kick out")
                            ])
                        ])
                    );

                    (function(key) {
                        firebase.database().ref("users/" + key + "/_settings/name").once("value", function(nameSnapshot) {
                            $(".settingsUser[data-user='" + key + "'] strong").text(nameSnapshot.val());

                            if (isStaff(key)) {
                                $(".settingsUser[data-user='" + key + "'] strong").css("color", "#27ef70");
                            } else {
                                $(".settingsUser[data-user='" + key + "'] strong").css("color", "#42aaf5");
                            }
                        });
                    })(key);
                }

                for (var key in usersSnapshot.val()) {
                    $("#settingsUserList").append(
                        $("<div class='card settingsUser' data-user='" + key + "'>").append([
                            $("<strong>"),
                            $("<div class='floatRight'>").append([
                                $("<select>")
                                    .attr("onchange", "changeUserPrivileges('" + key + "');")
                                    .append([
                                        $("<option value='owner'>").text("Owner"),
                                        $("<option value='member' selected>").text("Member")
                                    ])
                                ,
                                $("<button class='reallyBad'>")
                                    .attr("onclick", "showKickOutDialog('" + key + "')")
                                    .text("Kick out")
                            ])
                        ])
                    );

                    (function(key) {
                        firebase.database().ref("users/" + key + "/_settings/name").once("value", function(nameSnapshot) {
                            $(".settingsUser[data-user='" + key + "'] strong").text(nameSnapshot.val());

                            if (isStaff(key)) {
                                $(".settingsUser[data-user='" + key + "'] strong").css("color", "#27ef70");
                            } else if (isGameProxyPro(key)) {
                                $(".settingsUser[data-user='" + key + "'] strong").css("color", "#b3c20f");
                            }
                        });
                    })(key);
                }
            });
        });
    });
}

function changeUserPrivileges(uid) {
    if ($(".settingsUser[data-user='" + uid + "'] select").val() == "owner") {
        firebase.database().ref("chat/servers/" + getURLParameter("server") + "/owners/" + uid).set(true).then(function() {
            firebase.database().ref("chat/servers/" + getURLParameter("server") + "/members/" + uid).set(null).then(refreshSettingsUserList);
        });
    } else {
        firebase.database().ref("chat/servers/" + getURLParameter("server") + "/members/" + uid).set(true).then(function() {
            firebase.database().ref("chat/servers/" + getURLParameter("server") + "/owners/" + uid).set(null).then(refreshSettingsUserList);
        });
    }
}

function inviteUser(uid) {
    firebase.database().ref("chat/servers/" + getURLParameter("server") + "/members/" + uid).set(true).then(function() {
        firebase.database().ref("chat/servers/" + getURLParameter("server") + "/name").once("value", function(nameSnapshot) {
            firebase.database().ref("users/" + uid + "/chat/invites").push().set({
                server: getURLParameter("server"),
                name: nameSnapshot.val()
            }).then(function() {
                refreshSettingsUserList();
    
                closeDialog();
            });
        });
    });
}

function showInviteUserDialogSearch() {
    if ($("#inviteUserName").val().trim() != "") {
        var inviteUserName = $("#inviteUserName").val().trim();

        firebase.database().ref("users").orderByChild("_settings/name").startAt(inviteUserName).endAt(inviteUserName + "\uf8ff").limitToLast(50).once("value", function(snapshot) {
            var userList = [];

            snapshot.forEach(function(childSnapshot) {
                userList.unshift(childSnapshot.val());
                userList[0]["key"] = childSnapshot.key;
            });

            dialog("Invite user", `
                <p>Choose the user who you wish to invite:</p>
                <div class="inviteUserSearchList"></div>
            `, [
                {text: "Cancel", onclick: "closeDialog();", type: "bad"},
                {text: "Back", onclick: "showInviteUserDialog();", type: "bad"}
            ]);

            if (userList.length > 0) {
                for (var i = 0; i < userList.length; i++) {
                    $(".inviteUserSearchList").append(
                        $("<div class='card' data-user='" + userList[i].key + "'>").append([
                            $("<strong>").text(userList[i]["_settings"]["name"]),
                            $("<div class='floatRight'>").append([
                                $("<button class='bad'>")
                                    .attr("onclick", "window.open('/profile.html?user=" + userList[i].key + "');")
                                    .text("View profile")
                                ,
                                $("<button>")
                                    .attr("onclick", "inviteUser('" + userList[i].key + "');")
                                    .text("Invite")
                            ])
                        ])
                    );

                    if (isStaff(userList[i].key)) {
                        $(".inviteUserSearchList [data-user='" + userList[i].key + "'] strong").css("color", "#27ef70");
                    } else if (isGameProxyPro(userList[i].key)) {
                        $(".inviteUserSearchList [data-user='" + userList[i].key + "'] strong").css("color", "#b3c20f");
                    }
                }
            } else {
                dialog("Invite user", `
                    Sorry, the user with that name could not be found. Try
                    entering their name with the correct case to refine your
                    search.
                `, [
                    {text: "Cancel", onclick: "closeDialog();", type: "bad"},
                    {text: "Retry", onclick: "showInviteUserDialog();"}
                ]);
            }
        });
    }
}

function showInviteUserDialog() {
    dialog("Invite user", `
        <div class="center">
            <p>
                Enter the name of the user you wish to invite. Enter their name
                with case sensitivity to refine your search.
            </p>
            <input id="inviteUserName">
        </div>
    `, [
        {text: "Cancel", onclick: "closeDialog();", type: "bad"},
        {text: "Next", onclick: "showInviteUserDialogSearch();"}
    ]);
}

$(function() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            $(".linkToServer").attr("href", "server.html?server=" + encodeURIComponent(getURLParameter("server")));
            $(".goToViewServer").attr("onclick", "javascript:window.location.href = 'viewServer.html?server=" + encodeURIComponent(getURLParameter("server")) + "&fromSettings=true';");

            firebase.database().ref("users/" + currentUid + "/_settings/name").on("value", function(snapshot) {
                $(".mentionExample").text("{" + snapshot.val() + "}");
            });

            firebase.database().ref("chat/servers/" + getURLParameter("server") + "/name").once("value", function(snapshot) {
                $("#serverName").val(snapshot.val());
            });

            firebase.database().ref("chat/servers/" + getURLParameter("server") + "/game").once("value", function(snapshot) {
                $("#serverGame").val(snapshot.val() || "");
            });

            firebase.database().ref("chat/servers/" + getURLParameter("server") + "/thumbnail").once("value", function(snapshot) {
                $("#serverThumbnail").val(snapshot.val() || "");
            });

            firebase.database().ref("chat/servers/" + getURLParameter("server") + "/description").once("value", function(snapshot) {
                $("#serverDescription").val(snapshot.val());
            });

            firebase.database().ref("chat/servers/" + getURLParameter("server") + "/perms/public").on("value", function(snapshot) {
                $("#serverPublic").prop("checked", snapshot.val());

                if (snapshot.val() == true) {
                    $(".serverPublic").show();
                    $(".serverPrivate").hide();
                } else {
                    $(".serverPublic").hide();
                    $(".serverPrivate").show();
                }
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

            firebase.database().ref("chat/servers/" + getURLParameter("server") + "/owners").on("value", function(snapshot) {
                var ownersList = snapshot.val() == null ? [] : Object.keys(snapshot.val());

                if (ownersList.indexOf(currentUid) > -1) {
                    $(".owner").show();
                    $(".masterowner").hide();
                } else {
                    $(".owner, .masterowner").hide();

                    firebase.database().ref("chat/servers/" + getURLParameter("server") + "/masterowner").on("value", function(snapshot) {
                        if (currentUid == snapshot.val()) {
                            $(".owner, .masterowner").show();
                        } else {
                            $(".owner, .masterowner").hide();
                        }
                    });
                }

                refreshSettingsUserList();
            });
        }
    });
});