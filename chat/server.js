var currentChannel = {
    key: null,
    name: "",
    reference: null,
    messagesReference: null
};

var serverOwners = {};
var serverMembers = {};

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

function addText(text) {
    if (document.selection) {
        $("#chatBox").focus();

        selection = document.selection.createRange();
        selection.text = text;
    } else if ($("#chatBox")[0].selectionStart || $("#chatBox")[0].selectionStart == 0) {
        var start = $("#chatBox")[0].selectionStart;
        var end = $("#chatBox")[0].selectionEnd;

        $("#chatBox").val($("#chatBox").val().substring(0, start) + text + $("#chatBox").val().substring(end, $("#chatBox").val().length));

        $("#chatBox").focus();

        $("textarea")[0].setSelectionRange(start + text.length, start + text.length);
    } else {
        $("#chatBox").val($("#chatBox").val() + text);
    }
}

function addMention(uid) {
    firebase.database().ref("users/" + uid + "/_settings/name").on("value", function(nameSnapshot) {
        addText("{" + nameSnapshot.val() + "}");
    });

    if ($(window).width() <= 600) {
        $(".channelList").fadeOut();
        $(".chatContainer, .chatBoxContainer").fadeIn();

        $(".channelDropdownIcon").text("arrow_drop_down");
    }
}

function getUsersByWildcardName(name) {
    var filtered = [];

    var nameWithoutPrefix = name.split(":").length > 1 ? name.split(":")[1] : name;

    if (name.startsWith("owners:") || name.split(":").length == 1) {
        for (var key in serverOwners) {
            if (new RegExp("^" + nameWithoutPrefix.replace(/\*/g, ".*") + "$").test(serverOwners[key])) {
                filtered.push(key);
            }
        }
    }

    if (name.startsWith("member:") || name.split(":").length == 1) {
        for (var key in serverMembers) {
            if (new RegExp("^" + nameWithoutPrefix.replace(/\*/g, ".*") + "$").test(serverMembers[key])) {
                filtered.push(key);
            }
        }
    }

    return filtered;
}

function addMessage(message) {
    var converter = new showdown.Converter();

    var usernameLink = $("<a target='_blank'>")
        .attr("href", "/profile.html?user=" + encodeURIComponent(message.uid))
        .append(
            $("<strong>")
                .text(profanity.clean(message.by))
        )
    ;

    var atEnd = $(".chatContainer").scrollTop() + $(".chatContainer").innerHeight() + 10 >= $(".chatContainer")[0].scrollHeight;

    if (message.byStaff) {
        usernameLink.find("strong").css("color", "#27ef70");
    } else if (Object.keys(serverOwners).indexOf(message.uid) > -1) {
        usernameLink.find("strong").css("color", "#42aaf5");
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

    if ($(window).width() <= 600) {
        $(".channelList").fadeOut();
        $(".chatContainer, .chatBoxContainer").fadeIn();

        $(".channelDropdownIcon").text("arrow_drop_down");
    }

    firebase.database().ref("chat/servers/" + getURLParameter("server") + "/channels/" + channelKey + "/name").once("value", function(snapshot) {
        currentChannel.name = snapshot.val();

        $(".channelName").text("#" + currentChannel.name);
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
            
            var userMatches = $("#chatBox").val().match(/\{(.*?)\}/g);
            var usersMentioned = [];

            if (userMatches != null) {
                for (var i = 0; i < userMatches.length; i++) {
                    if (userMatches[i] != "{}") {
                        usersMentioned.push(...getUsersByWildcardName(userMatches[i].replace(/\{/g, "").replace(/\}/g, "")));
                    }
                }
            }

            for (var i = 0; i < usersMentioned.length; i++) {
                firebase.database().ref("users/" + usersMentioned[i] + "/chat/mentions").push().set({
                    from: currentUid,
                    fromuser: name,
                    message: profanity.clean($("#chatBox").val())
                });
            }

            $("#chatBox").val("");
        });
    }
}

$(function() {
    firebase.auth().onAuthStateChanged(function() {
        if (getURLParameter("server") == null) {
            window.location.replace("dashboard.html");
        }

        $(".linkToSettings").attr("href", "serverSettings.html?server=" + encodeURIComponent(getURLParameter("server")));

        firebase.database().ref("chat/servers/" + getURLParameter("server") + "/name").once("value", function(snapshot) {
            $(".serverName").text(snapshot.val());
        });

        firebase.database().ref("chat/servers/" + getURLParameter("server") + "/thumbnail").once("value", function(snapshot) {
            $(".serverThumbnail").attr("src", snapshot.val());
        });

        firebase.database().ref("chat/servers/" + getURLParameter("server") + "/description").once("value", function(snapshot) {
            var converter = new showdown.Converter();
    
            $(".serverDescription").html(converter.makeHtml(snapshot.val().replace(/</g, "&lt;").replace(/>/g, "&gt;")));
        });

        firebase.database().ref("chat/servers/" + getURLParameter("server") + "/channelList").on("value", function(snapshot) {
            $(".channels").html("");
            
            for (var key in snapshot.val()) {
                (function(key) {
                    firebase.database().ref("chat/servers/" + getURLParameter("server") + "/channels/" + key + "/name").once("value", function(nameSnapshot) {
                        $(".channels").append(
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

        firebase.database().ref("chat/servers/" + getURLParameter("server") + "/owners").on("value", function(snapshot) {
            $(".owners").html("");

            firebase.database().ref("chat/servers/" + getURLParameter("server") + "/masterowner").once("value", function(masterownerSnapshot) {                
                $(".owners").append(
                    $("<a class='channelButton'>")
                        .attr("data-owner", masterownerSnapshot.val())
                        .attr("href", "javascript:addMention('" + masterownerSnapshot.val() + "')")
                );
                
                firebase.database().ref("users/" + masterownerSnapshot.val() + "/_settings/name").on("value", function(nameSnapshot) {
                    $(".channelButton[data-owner='" + masterownerSnapshot.val() + "']").text(nameSnapshot.val());

                    serverOwners[masterownerSnapshot.val()] = nameSnapshot.val();
                });

                if (isStaff(masterownerSnapshot.val())) {
                    $(".channelButton[data-owner='" + masterownerSnapshot.val() + "']").css("color", "#27ef70");
                } else { // Skipping Pro as ownership of server is more significant
                    $(".channelButton[data-owner='" + masterownerSnapshot.val() + "']").css("color", "#42aaf5");
                }
            });
            
            for (var key in snapshot.val()) {
                (function(key) {
                    $(".owners").append(
                        $("<a class='channelButton'>")
                            .attr("data-owner", key)
                            .attr("href", "javascript:addMention('" + key + "')")
                    );

                    firebase.database().ref("users/" + key + "/_settings/name").on("value", function(nameSnapshot) {
                        $(".channelButton[data-owner='" + key + "']").text(nameSnapshot.val());

                        serverOwners[key] = nameSnapshot.val();
                    });

                    if (isStaff(key)) {
                        $(".channelButton[data-owner='" + key + "']").css("color", "#27ef70");
                    } else { // Skipping Pro as ownership of server is more significant
                        $(".channelButton[data-owner='" + key + "']").css("color", "#42aaf5");
                    }
                })(key);
            }
        });

        firebase.database().ref("chat/servers/" + getURLParameter("server") + "/members").on("value", function(snapshot) {
            $(".members").html("");

            if (snapshot.val() == null) {
                $(".membersHeader").hide();
            } else {
                $(".membersHeader").show();
            }
            
            for (var key in snapshot.val()) {
                (function(key) {
                    $(".members").append(
                        $("<a class='channelButton'>")
                            .attr("data-member", key)
                            .attr("href", "javascript:addMention('" + key + "')")
                    );

                    firebase.database().ref("users/" + key + "/_settings/name").on("value", function(nameSnapshot) {
                        $(".channelButton[data-member='" + key + "']").text(nameSnapshot.val());

                        serverMembers[key] = nameSnapshot.val();
                    });

                    if (isStaff(key)) {
                        $(".channelButton[data-member='" + key + "']").css("color", "#27ef70");
                    } else if (isGameProxyPro(key)) {
                        $(".channelButton[data-member='" + key + "']").css("color", "#b3c20f");
                    }
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