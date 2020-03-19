var currentChannel = {
    key: null,
    name: "",
    reference: null,
    messagesReference: null
};

function padDigits(digits) {
    return digits < 10 ? "0" + digits : String(digits);
}

function formatRelativeDate(date) {
    var currentDate = new Date();
    var previousDate = new Date(date);

    if (currentDate.getTime() - 86400000 < previousDate.getTime()) { // Within past 24 hours
        return padDigits(previousDate.getHours()) + ":" + padDigits(previousDate.getMinutes()) + ":" + padDigits(previousDate.getSeconds());
    } else { // All other times
        return padDigits(previousDate.getDate()) + "/" + padDigits(previousDate.getMonth()) + "/" + previousDate.getFullYear();
    }
}

function toggleChannelList() {
    if ($(".channelList").is(":visible")) {
        $(".channelList").fadeOut();
        $(".chatContainer, .chatBoxContainer").fadeIn();

        $(".channelDropdownIcon").text("arrow_drop_down");
    } else {
        $(".channelList").fadeIn();
        $(".chatContainer, .chatBoxContainer").fadeOut();

        $(".channelDropdownIcon").text("arrow_drop_up");
    }
}

function addMessage(message) {
    var converter = new showdown.Converter();

    var usernameLink = $("<a target='_blank'>")
        .attr("href", "https://gameproxy.host/profile.html?user=" + encodeURIComponent(message.uid))
        .append(
            $("<strong>")
                .text(profanity.clean(message.by))
        )
    ;

    var atEnd = $(".chatContainer").scrollTop() + $(".chatContainer").innerHeight() + 10 >= $(".chatContainer")[0].scrollHeight;

    if (message.byStaff) {
        usernameLink.find("strong").css("color", "#27ef70");
    } else if (isGameProxyPro(message.uid)) {
        usernameLink.find("strong").css("color", "#b3c20f");
    }

    $(".chatMessages").append(
        $("<div class='chatMessage'>").append([
            usernameLink,
            $("<span class='messageDate'>")
                .text(formatRelativeDate(message.date))
            ,
            $("<div>")
                .html(converter.makeHtml(profanity.clean(message.content).replace(/</g, "&lt;").replace(/>/g, "&gt;")))
        ])
    );

    if (atEnd) {
        $(".chatContainer").scrollTop($(".chatContainer")[0].scrollHeight);
    }
}

function switchChannel(channelKey) {
    if (currentChannel.messagesReference != null) {
        currentChannel.messagesReference.off("child_added");
    }

    currentChannel.key = channelKey;
    currentChannel.reference = firebase.database().ref("chat/servers/" + getURLParameter("server") + "/channels/" + channelKey).limitToLast(50);
    currentChannel.messagesReference = firebase.database().ref("chat/servers/" + getURLParameter("server") + "/channels/" + channelKey + "/messages").limitToLast(50);

    $(".chatMessages").html("");

    $(".channelButton").removeClass("selected");
    $(".channelButton[data-key='" + channelKey + "']").addClass("selected");

    currentChannel.messagesReference.on("child_added", function(snapshot) {
        addMessage(snapshot.val());
    });

    currentChannel.reference.once("value", function() {
        $(".chatContainer").scrollTop($(".chatContainer")[0].scrollHeight);
    });
}

function postChatMessage() {
    if ($("#chatBox").val().trim() != "") {
        firebase.database().ref("users/" + currentUid + "/_settings/name").once("value", function(snapshot) {
            var name = snapshot.val();

            firebase.database().ref("chat/servers/" + getURLParameter("server") + "/channels/" + currentChannel.key + "/messages").push().set({
                date: new Date().getTime(),
                uid: currentUid,
                by: name,
                byStaff: isStaff(currentUid),
                content: profanity.clean($("#chatBox").val())
            });
            
            // TODO: Add user mentioning to send notifications

            $("#chatBox").val("");
        });
    }
}

$(function() {
    firebase.auth().onAuthStateChanged(function() {
        if (getURLParameter("server") == null) {
            window.location.replace("dashboard.html");
        }
    
        firebase.database().ref("chat/directory/" + getURLParameter("server")).on("value", function(snapshot) {
            $(".serverName").text(snapshot.val().name);
    
            var converter = new showdown.Converter();
    
            $(".serverDescription").html(converter.makeHtml(snapshot.val().description.replace(/</g, "&lt;").replace(/>/g, "&gt;")));
            $(".serverThumbnail").attr("src", snapshot.val().thumbnail);
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

        firebase.database().ref("chat/servers/" + getURLParameter("server") + "/channelList").on("value", function(snapshot) {
            $(".channelList").html("");
            
            for (var key in snapshot.val()) {
                (function(key) {
                    firebase.database().ref("chat/servers/" + getURLParameter("server") + "/channels/" + key + "/name").once("value", function(nameSnapshot) {
                        $(".channelList").append(
                            $("<a class='channelButton'>")
                                .attr("data-key", key)
                                .attr("href", "javascript:switchChannel('" + key + "');")
                                .text("#" + nameSnapshot.val())
                        );

                        $(".channelButton[data-key='" + currentChannel.key + "']").addClass("selected");
                    });
                })(key);
            }
        });

        firebase.database().ref("chat/servers/" + getURLParameter("server") + "/defaultChannel").once("value", function(snapshot) {
            switchChannel(snapshot.val());
        });
    });

    setInterval(function() {
        if ($(window).width() > 600) {
            $(".channelList").fadeIn();
            $(".chatContainer, .chatBoxContainer").fadeIn();

            $(".channelDropdownIcon").text("arrow_drop_down");
        }
    });

    $("#chatBox").keyup(function(event) {
        if (event.keyCode == 13 && !event.shiftKey) {
            postChatMessage();
        }
    });
});