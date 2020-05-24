var currentChannel = {
    key: null,
    name: "",
    reference: null,
    messagesReference: null
};

var serverOwners = {};
var serverMembers = {};
var leavingServer = false;
var deletingServer = false;

function padDigits(digits) {
    return digits < 10 ? "0" + digits : String(digits);
}

function formatDate(date) {
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    return day + " " + monthNames[monthIndex] + " " + year + " at " + date.toLocaleTimeString("en-GB", {hour: "2-digit", minute: "2-digit"});
}

function formatRelativeDate(date) {
    var currentDate = new Date();
    var previousDate = new Date(date);

    if (currentDate.getTime() - 86400000 < previousDate.getTime()) { // Within past 24 hours
        return padDigits(previousDate.getHours()) + ":" + padDigits(previousDate.getMinutes()) + ":" + padDigits(previousDate.getSeconds());
    } else { // All other times
        return padDigits(previousDate.getDate()) + "/" + padDigits(previousDate.getMonth() + 1) + "/" + previousDate.getFullYear();
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

function cleanMessage(message) {
    message = profanity.clean(message.replace(/\n$/g, ""), true);

    var newMessage = "";
    var inCode = false;
    var inMention = false;

    for (var i = 0; i < message.length; i++) {
        if (inCode) {
            newMessage += message[i];
        } else if (inMention) {
            newMessage += message[i].replace(/</g, "&lt;").replace(/>/, "&gt;").replace(/\*/g, "\\*")

            if (message[i] == "}") {
                inMention = false;
            }
        } else {
            newMessage += message[i].replace(/</g, "&lt;").replace(/>/, "&gt;");

            if (message[i - 1] != "\\") {
                if (message[i] == "`") {
                    inCode = !inCode;
                } else if (message[i] == "{") {
                    inMention = true;
                }
            }
        }
    }

    return newMessage;
}

function addMessage(message) {
    var converter = new showdown.Converter();

    var usernameLink = $("<a target='_blank'>")
        .attr("href", "/profile?user=" + encodeURIComponent(message.uid))
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

    var extraContent = $("<div>");
    var gameRegex = /https:\/\/gameproxy\.host\/game\.html\?play=([a-zA-Z0-9_-]{1,64})/;
    var youtubeRegex = /(https:\/\/www\.youtube\.com\/watch\?v=|https:\/\/youtu\.be\/)([a-zA-Z0-9_-]{1,64})/;
    var selectedGame = gameRegex.exec(message.content) != null ? gameRegex.exec(message.content)[1] : null;
    var selectedVideo = youtubeRegex.exec(message.content) != null ? youtubeRegex.exec(message.content)[2] : null;

    if (gameRegex.exec(message.content) != null) {
        extraContent.append(
            $("<a target='_blank' class='chatCard'>")
                .attr("href", "https://gameproxy.host/game?play=" + selectedGame)
                .attr("data-game", selectedGame)
                .append([
                    $("<strong>").text("GameProxy game"),
                    $("<span>").text("Play on GameProxy")
                ])
        );

        $(function() {
            firebase.database().ref("games/" + selectedGame + "/title").on("value", function(snapshot) {
                if (snapshot.val() != null) {
                    $(".chatCard[data-game='" + selectedGame + "'] > strong").text(snapshot.val());
                } else {
                    $(".chatCard[data-game='" + selectedGame + "']").remove();
                }
            });
    
            firebase.database().ref("games/" + selectedGame + "/by").on("value", function(snapshot) {
                if (snapshot.val() != null) {
                    $(".chatCard[data-game='" + selectedGame + "'] > span").text("By " + snapshot.val() + " · Play on GameProxy");
                } else {
                    $(".chatCard[data-game='" + selectedGame + "']").remove();
                }
            });
        });
    }

    if (youtubeRegex.exec(message.content) != null) {
        extraContent.append(
            $("<div class='embedCard'>")
            .append(
                $("<iframe>")
                    .attr("src", "https://www.youtube.com/embed/" + selectedVideo + "?ecver=1&iv_load_policy=1&yt:stretch=16:9&autohide=1&color=red")
                    .attr("allowfullscreen", "true")
            )
        );
    }

    // Make channels linkable from messages
    message.content = message.content.replace(/#([a-z0-9]{1,64})/g, "[#$1](channel:$1)");

    $(".chatMessages").append(
        $("<div class='chatMessage'>").append([
            usernameLink,
            $("<span class='messageDate'>")
                .attr("title", formatDate(new Date(message.date)))
                .text(formatRelativeDate(message.date))
            ,
            $("<div class='messageContent'>")
                .html(converter.makeHtml(cleanMessage(message.content)) + extraContent.html())
        ])
    );

    $(".chatMessage .messageContent a").attr("target", "_blank");

    $(".chatMessage .messageContent a[href^='channel:']")
        .attr("target", null)
        .on("click", function(event) {
            var channelName = $(event.target).attr("href").split(":")[1];

            firebase.database().ref("chat/servers/" + getURLParameter("server") + "/channelList").once("value", function(snapshot) {
                for (var key in snapshot.val()) {
                    (function(key) {
                        firebase.database().ref("chat/servers/" + getURLParameter("server") + "/channels/" + key + "/name").once("value", function(nameSnapshot) {
                            if (nameSnapshot.val() == channelName) {
                                switchChannel(key);
                            }
                        });
                    })(key);
                }
            });

            return false;
        })
    ;

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
                    message: profanity.clean($("#chatBox").val()),
                    server: getURLParameter("server")
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

        firebase.database().ref("users/" + currentUid + "/_settings/chat/data/getStarted/joincreate").set(true);

        firebase.database().ref("chat/servers/" + getURLParameter("server") + "/name").once("value", function(snapshot) {
            if (snapshot.val() != null) {
                $(".serverName").text(snapshot.val());
            } else {
                window.location.replace("serverNotFound.html");
            }
        });

        firebase.database().ref("chat/servers/" + getURLParameter("server") + "/thumbnail").once("value", function(snapshot) {
            $(".serverThumbnail").attr("src", snapshot.val() || "/media/TilesArt.svg");
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

    firebase.database().ref("chat/servers/" + getURLParameter("server") + "/members").on("value", function() {
        firebase.database().ref("chat/servers/" + getURLParameter("server") + "/owners").on("value", function() {
            firebase.database().ref("chat/servers/" + getURLParameter("server") + "/masterowner").on("value", function() {
                firebase.database().ref("chat/servers/" + getURLParameter("server") + "/members").once("value", function(membersSnapshot) {
                    var members = [];

                    if (membersSnapshot.val() != null) {
                        members = Object.keys(membersSnapshot.val());
                    }

                    firebase.database().ref("chat/servers/" + getURLParameter("server") + "/owners").once("value", function(ownersSnapshot) {
                        var owners = [];

                        if (ownersSnapshot.val() != null) {
                            owners = Object.keys(ownersSnapshot.val());
                        }

                        firebase.database().ref("chat/servers/" + getURLParameter("server") + "/masterowner").once("value", function(masterownerSnapshot) {
                            if (members.indexOf(currentUid) == -1 && owners.indexOf(currentUid) == -1 && masterownerSnapshot.val() != currentUid && !leavingServer && !deletingServer) {
                                firebase.database().ref("users/" + currentUid + "/_settings/chat/servers/" + getURLParameter("server")).set(null).then(function() {
                                    window.location.replace("serverKickOut.html");
                                });
                            }
                        });
                    });
                });

                $(".serverLoading").hide();
                $(".serverLoaded").show();
            });
        });
    });

    var lastScreenWidth = $(window).width();

    setInterval(function() {
        if ($(window).width() > 600) {
            $(".channelList").fadeIn();
            $(".chatContainer, .chatBoxContainer").fadeIn();

            $(".channelDropdownIcon").text("arrow_drop_down");
        }

        if (lastScreenWidth > 600 && $(window).width() <= 600) {
            $(".channelList").fadeOut();
            $(".chatContainer, .chatBoxContainer").fadeIn();

            $(".channelDropdownIcon").text("arrow_drop_down");
        }

        lastScreenWidth = $(window).width();
    });

    $("#chatBox").keyup(function(event) {
        if (event.keyCode == 13 && !event.shiftKey) {
            postChatMessage();
        }
    });
});