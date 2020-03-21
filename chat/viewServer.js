var serverInfo = {
    key: null,
    name: "Untitled Server"
};

function getURLParameter(name) {
    return decodeURIComponent((new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null;
}

function leaveServer() {
    firebase.database().ref("users/" + currentUid + "/_settings/chat/servers/" + getURLParameter("server")).set(null).then(function() {
        firebase.database().ref("chat/servers/" + getURLParameter("server") + "/members/" + currentUid).set(null);
        firebase.database().ref("chat/servers/" + getURLParameter("server") + "/owners/" + currentUid).set(null);
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

function joinServer() {
    firebase.database().ref("users/" + currentUid + "/_settings/chat/servers/" + getURLParameter("server")).set(true).then(function() {
        firebase.database().ref("chat/servers/" + getURLParameter("server") + "/members/" + currentUid).set(true).then(function() {
            window.location.href = "server.html?server=" + encodeURIComponent(getURLParameter("server"));
        });
    });
}

function visitServer() {
    window.location.href = "server.html?server=" + encodeURIComponent(getURLParameter("server"));
}

$(function() {
    firebase.auth().onAuthStateChanged(function() {
        if (getURLParameter("server") == null) {
            window.location.replace("dashboard.html");
        }

        if (getURLParameter("fromSettings") == "true") {
            $(".viewServerBackButton").attr("href", "serverSettings.html?server=" + encodeURIComponent(getURLParameter("server")));
        }
    
        firebase.database().ref("chat/directory/" + getURLParameter("server")).on("value", function(snapshot) {
            $(".serverName").text(snapshot.val().name);
    
            var converter = new showdown.Converter();
    
            $(".serverDescription").html(converter.makeHtml(snapshot.val().description.replace(/</g, "&lt;").replace(/>/g, "&gt;")));
            $(".serverThumbnail").attr("src", snapshot.val().thumbnail);

            if (snapshot.val().game != null) {
                $(".serverGame").text(snapshot.val().game);

                $(".serverGameInformation").show();
            } else {
                $(".serverGameInformation").hide();
            }
        });
    
        firebase.database().ref("users/" + currentUid + "/_settings/chat/servers/" + getURLParameter("server")).on("value", function(snapshot) {
            if (snapshot.val() == true) {
                $(".serverButtons").html(`
                    <button onclick="showLeaveServerDialog();" class="bad">Leave</button><button onclick="visitServer();">Visit</button>
                `);
            } else {
                $(".serverButtons").html(`
                    <button onclick="joinServer();">Join</button>
                `);
            }
        });
    });
});