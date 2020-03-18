function finishCreatingNewServer(serverKey) {
    firebase.database().ref("chat/servers/" + serverKey + "/perms").set({
        public: $("#serverPrivacy").val() == "public"
    }).then(function() {
        window.location.replace("server.html?server=" + serverKey);
    });
}

function createNewServer() {
    if ($("#serverName").val().trim() != "" && $("#serverDescription").val().trim() != "") {
        $("#serverCreateButton").text("Creating...");
        $("#serverCreateButton").css({
            backgroundColor: "#7e7e7e",
            color: "black",
            cursor: "default"
        });

        var serverRef = firebase.database().ref("chat/servers").push();
        
        serverRef.set({
            name: $("#serverName").val().trim(),
            description: $("#serverDescription").val().trim(),
            masterowner: currentUid,
            game: $("#serverGame").val().trim() == "" ? null : $("#serverGame").val().trim()
        }).then(function() {
            // Once we are established as master owner, we can define other properties of the server

            if ($("#serverPrivacy").val() == "public") {
                firebase.database().ref("chat/directory/" + serverRef.key).set({
                    name: $("#serverName").val().trim(),
                    description: $("#serverDescription").val().trim()
                }).then(function() {
                    finishCreatingNewServer(serverRef.key);
                });
            } else {
                finishCreatingNewServer(serverRef.key);
            }
        });
    } else {
        $("#serverError").text("You haven't filled in the required fields to create your server!");
    }
}