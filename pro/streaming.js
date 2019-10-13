var showingStreamingOptions = false;
var showingStreamingDisplay = false;
var streamingElementOptionsUnsaved = false;
var streamingElementOptions = {
    tl: {},
    tr: {},
    bl: {},
    br: {}
};

var ytApiKey = "AIzaSyCgGrYsZ0R5Bg-Svoz4qh0CfcvGaG5xJNo";
var twitchApiKey = "go4hal4iuw0pwn69cdbpx5i0902wen";

function streamingOptions(showStreamingOptions = true) {
    if (showStreamingOptions) {
        if (hasGameProxyPro) {
            $(".streaming").fadeIn(500);
            $("#gameStreamingOptionsButton").addClass("highlight");
        } else {
            alert("Hmm, something went a bit wrong! (Or you tried to hack our site...) Streaming options aren't meant to turn on without GameProxy Pro.");
        }
    } else {
        $(".streaming").fadeOut(500);
        $("#gameStreamingOptionsButton").removeClass("highlight");
    }

    showingStreamingOptions = showStreamingOptions;
}

function toggleStreamingOptions() {
    streamingOptions(!showingStreamingOptions);
}

function resizeGameFrame(useT = true, useB = true) {
    if (isFullscreen) {
        if (showingStreamingDisplay) {
            var difference = 0;
            var topDifference = 0;

            if ($(".streamingDisplayPanel.streamingDisplayT").attr("data-streaming-display-effect") == "true" && useT) {
                difference += $(".streamingDisplayPanel.streamingDisplayT").height();
                topDifference += $(".streamingDisplayPanel.streamingDisplayT").height();
            }

            if ($(".streamingDisplayPanel.streamingDisplayB").attr("data-streaming-display-effect") == "true" && useB) {
                difference += $(".streamingDisplayPanel.streamingDisplayB").height();
            }

            $("object, #gameIframe").css({
                top: topDifference,
                left: 0,
                width: "100vw",
                height: window.innerHeight - difference
            });
        } else {
            $("object, #gameIframe").css({
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh"
            });
        }
    }
}

function updateStreamingDisplayElements() {
    var elements = ["TL", "TR", "BL", "BR"];

    for (var i = 0; i < elements.length; i++) {
        var elementSide = elements[i];
        var elementSideLowercase = elementSide.toLowerCase();
        var elementSelector = ".streamingElement" + elementSide;
        var elementOptions = ".streamingElementOptions" + elementSide;
        var elementDisplay = ".streamingDisplayElement" + elementSide;

        if ($(elementSelector + " option:selected").attr("val") == "none") {
            $(elementDisplay).html("");
        } else if ($(elementSelector + " option:selected").attr("val") == "text") {
            $(elementDisplay).html("");

            if (streamingElementOptions[elementSideLowercase]["text"] == null) {
                streamingElementOptions[elementSideLowercase]["text"] = {};
            }

            streamingElementOptions[elementSideLowercase]["text"]["text"] = $(elementOptions + " .streamingOptionTextText").val();

            if (streamingElementOptions[elementSideLowercase]["text"]["text"].length > (window.innerWidth / 2) / 50) {
                $(elementDisplay).append($("<div class='streamingElementText smallText'>").text(
                    streamingElementOptions[elementSideLowercase]["text"]["text"]
                ));
            } else {
                $(elementDisplay).append($("<div class='streamingElementText'>").text(
                    streamingElementOptions[elementSideLowercase]["text"]["text"]
                ));
            }
        } else if ($(elementSelector + " option:selected").attr("val") == "image") {
            $(elementDisplay).html("");

            if (streamingElementOptions[elementSideLowercase]["image"] == null) {
                streamingElementOptions[elementSideLowercase]["image"] = {};
            }

            streamingElementOptions[elementSideLowercase]["image"]["url"] = $(elementOptions + " .streamingOptionImageUrl").val();
            
            $(elementDisplay).append($("<img class='streamingElementImage'>").attr(
                "src",
                streamingElementOptions[elementSideLowercase]["image"]["url"]
            ));
        } else if ($(elementSelector + " option:selected").attr("val") == "gpLikes") {
            $(elementDisplay).html("");

            $(elementDisplay).append($("<div class='streamingElementStat'>").append([
                $("<div class='streamingElementStatNumber'>").text($(".gameLikes").text()),
                $("<div class='streamingElementStatDescription'>").text("LIKES ON GAMEPROXY")
            ]));
        } else if ($(elementSelector + " option:selected").attr("val") == "gpComments") {
            firebase.database().ref("games/" + getURLParameter("play") + "/comments").on("value", function(snapshot) {
                $(elementDisplay).html("");

                $(elementDisplay).append($("<div class='streamingElementChat'>"));
                
                snapshot.forEach(function(childSnapshot) {
                    try {
                        if (childSnapshot.val().byStaff) {
                            $(".streamingElementChat").append($("<div class='streamingElementChatComment'>").append([
                                $("<strong class='streamingElementChatName'>").text(profanity.clean(childSnapshot.val().by)).css("color", "#27ef70"),
                                $("<span class='streamingElementChatMessage'>").text(profanity.clean(childSnapshot.val().content).length < 500 ? profanity.clean(childSnapshot.val().content) : profanity.clean(childSnapshot.val().content).substring(0, 500) + "..."),
                            ]));
                        } else if (isGameProxyPro(childSnapshot.val().uid)) {
                            $(".streamingElementChat").append($("<div class='streamingElementChatComment'>").append([
                                $("<strong class='streamingElementChatName'>").text(profanity.clean(childSnapshot.val().by)).css("color", "#b3c20f"),
                                $("<span class='streamingElementChatMessage'>").text(profanity.clean(childSnapshot.val().content).length < 500 ? profanity.clean(childSnapshot.val().content) : profanity.clean(childSnapshot.val().content).substring(0, 500) + "..."),
                            ]));
                        } else {
                            $(".streamingElementChat").append($("<div class='streamingElementChatComment'>").append([
                                $("<strong class='streamingElementChatName'>").text(profanity.clean(childSnapshot.val().by)),
                                $("<span class='streamingElementChatMessage'>").text(profanity.clean(childSnapshot.val().content).length < 500 ? profanity.clean(childSnapshot.val().content) : profanity.clean(childSnapshot.val().content).substring(0, 500) + "..."),
                            ]));
                        }
                    } catch (e) {}
                });
                    
                $(".streamingElementChat").scrollTop($(".streamingElementChat")[0].scrollHeight);
            });
        } else if ($(elementSelector + " option:selected").attr("val") == "ytSubs") {
            if (streamingElementOptions[elementSideLowercase]["ytSubs"] == null) {
                streamingElementOptions[elementSideLowercase]["ytSubs"] = {};
            }

            streamingElementOptions[elementSideLowercase]["ytSubs"]["id"] = $(elementOptions + " .streamingOptionYtSubsId").val();
            streamingElementOptions[elementSideLowercase]["ytSubs"]["username"] = $(elementOptions + " .streamingOptionYtSubsUsername").val();

            (function(elementDisplay) {
                if (streamingElementOptions[elementSideLowercase]["ytSubs"]["id"] != "" && streamingElementOptions[elementSideLowercase]["ytSubs"]["id"] != null) {
                    $.ajax({
                        url: "https://www.googleapis.com/youtube/v3/channels?part=statistics&id=" + streamingElementOptions[elementSideLowercase]["ytSubs"]["id"] + "&key=" + ytApiKey
                    }).then(function(data) {
                        $(elementDisplay).html("");
    
                        $(elementDisplay).append($("<div class='streamingElementStat'>").append([
                            $("<div class='streamingElementStatNumber'>").text(data["items"][0]["statistics"]["subscriberCount"]),
                            $("<div class='streamingElementStatDescription'>").text("SUBSCRIBERS ON YOUTUBE")
                        ]));
                    });
                } else if (streamingElementOptions[elementSideLowercase]["ytSubs"]["username"] != "" && streamingElementOptions[elementSideLowercase]["ytSubs"]["username"] != null) {
                    $.ajax({
                        url: "https://www.googleapis.com/youtube/v3/channels?part=statistics&forUsername=" + streamingElementOptions[elementSideLowercase]["ytSubs"]["username"] + "&key=" + ytApiKey
                    }).then(function(data) {
                        $(elementDisplay).html("");
    
                        $(elementDisplay).append($("<div class='streamingElementStat'>").append([
                            $("<div class='streamingElementStatNumber'>").text(data["items"][0]["statistics"]["subscriberCount"]),
                            $("<div class='streamingElementStatDescription'>").text("SUBSCRIBERS ON YOUTUBE")
                        ]));
                    });
                } else {
                    $(elementDisplay).html("");

                    $(elementDisplay).append($("<div class='streamingElementStat'>").append([
                        $("<div class='streamingElementStatNumber'>").text(0),
                        $("<div class='streamingElementStatDescription'>").text("SUBSCRIBERS ON YOUTUBE")
                    ]));
                }
            })(elementDisplay);
        } else if ($(elementSelector + " option:selected").attr("val") == "ytViews") {
            if (streamingElementOptions[elementSideLowercase]["ytViews"] == null) {
                streamingElementOptions[elementSideLowercase]["ytViews"] = {};
            }

            streamingElementOptions[elementSideLowercase]["ytViews"]["id"] = $(elementOptions + " .streamingOptionYtViewsId").val();
            streamingElementOptions[elementSideLowercase]["ytViews"]["username"] = $(elementOptions + " .streamingOptionYtViewsUsername").val();

            (function(elementDisplay) {
                if (streamingElementOptions[elementSideLowercase]["ytViews"]["id"] != "" && streamingElementOptions[elementSideLowercase]["ytViews"]["id"] != null) {
                    $.ajax({
                        url: "https://www.googleapis.com/youtube/v3/channels?part=statistics&id=" + streamingElementOptions[elementSideLowercase]["ytViews"]["id"] + "&key=" + ytApiKey
                    }).then(function(data) {
                        $(elementDisplay).html("");
    
                        $(elementDisplay).append($("<div class='streamingElementStat'>").append([
                            $("<div class='streamingElementStatNumber'>").text(data["items"][0]["statistics"]["viewCount"]),
                            $("<div class='streamingElementStatDescription'>").text("VIEWS ON YOUTUBE")
                        ]));
                    });
                } else if (streamingElementOptions[elementSideLowercase]["ytViews"]["username"] != "" && streamingElementOptions[elementSideLowercase]["ytViews"]["username"] != null) {
                    $.ajax({
                        url: "https://www.googleapis.com/youtube/v3/channels?part=statistics&forUsername=" + streamingElementOptions[elementSideLowercase]["ytViews"]["username"] + "&key=" + ytApiKey
                    }).then(function(data) {
                        $(elementDisplay).html("");
    
                        $(elementDisplay).append($("<div class='streamingElementStat'>").append([
                            $("<div class='streamingElementStatNumber'>").text(data["items"][0]["statistics"]["viewCount"]),
                            $("<div class='streamingElementStatDescription'>").text("VIEWS ON YOUTUBE")
                        ]));
                    });
                } else {
                    $(elementDisplay).html("");

                    $(elementDisplay).append($("<div class='streamingElementStat'>").append([
                        $("<div class='streamingElementStatNumber'>").text(0),
                        $("<div class='streamingElementStatDescription'>").text("VIEWS ON YOUTUBE")
                    ]));
                }
            })(elementDisplay);
        } else if ($(elementSelector + " option:selected").attr("val") == "ytWatching") {
            if (streamingElementOptions[elementSideLowercase]["ytWatching"] == null) {
                streamingElementOptions[elementSideLowercase]["ytWatching"] = {};
            }

            streamingElementOptions[elementSideLowercase]["ytWatching"]["id"] = $(elementOptions + " .streamingOptionYtWatchingId").val();

            (function(elementDisplay) {
                if (streamingElementOptions[elementSideLowercase]["ytWatching"]["id"] != "" && streamingElementOptions[elementSideLowercase]["ytWatching"]["id"] != null) {
                    $.ajax({
                        url: "https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=" + streamingElementOptions[elementSideLowercase]["ytWatching"]["id"] + "&key=" + ytApiKey
                    }).then(function(data) {
                        $(elementDisplay).html("");
    
                        $(elementDisplay).append($("<div class='streamingElementStat'>").append([
                            $("<div class='streamingElementStatNumber'>").text(data["items"][0]["liveStreamingDetails"]["concurrentViewers"]),
                            $("<div class='streamingElementStatDescription'>").text("WATCHING LIVE ON YOUTUBE")
                        ]));
                    });
                } else {
                    $(elementDisplay).html("");

                    $(elementDisplay).append($("<div class='streamingElementStat'>").append([
                        $("<div class='streamingElementStatNumber'>").text(0),
                        $("<div class='streamingElementStatDescription'>").text("WATCHING LIVE ON YOUTUBE")
                    ]));
                }
            })(elementDisplay);
        } else if ($(elementSelector + " option:selected").attr("val") == "twitchSubs") {
            if (streamingElementOptions[elementSideLowercase]["twitchSubs"] == null) {
                streamingElementOptions[elementSideLowercase]["twitchSubs"] = {};
            }

            streamingElementOptions[elementSideLowercase]["twitchSubs"]["username"] = $(elementOptions + " .streamingOptionTwitchSubsUsername").val();

            (function(elementDisplay) {
                if (streamingElementOptions[elementSideLowercase]["twitchSubs"]["username"] != "" && streamingElementOptions[elementSideLowercase]["twitchSubs"]["username"] != null) {
                    $.ajax({
                        url: "https://api.twitch.tv/helix/users?login=" + streamingElementOptions[elementSideLowercase]["twitchSubs"]["username"],
                        beforeSend: function(xhr) {
                            xhr.setRequestHeader("Client-ID", twitchApiKey)
                        }
                    }).then(function(data) {
                        $.ajax({
                            url: "https://api.twitch.tv/helix/users/follows?to_id=" + data["data"][0]["id"],
                            beforeSend: function(xhr) {
                                xhr.setRequestHeader("Client-ID", twitchApiKey)
                            }
                        }).then(function(data) {
                            $(elementDisplay).html("");
        
                            $(elementDisplay).append($("<div class='streamingElementStat'>").append([
                                $("<div class='streamingElementStatNumber'>").text(data["total"]),
                                $("<div class='streamingElementStatDescription'>").text("FOLLOWERS ON TWITCH")
                            ]));
                        });
                    });
                } else {
                    $(elementDisplay).html("");

                    $(elementDisplay).append($("<div class='streamingElementStat'>").append([
                        $("<div class='streamingElementStatNumber'>").text(0),
                        $("<div class='streamingElementStatDescription'>").text("FOLLOWERS ON TWITCH")
                    ]));
                }
            })(elementDisplay);
        } else if ($(elementSelector + " option:selected").attr("val") == "twitchViews") {
            if (streamingElementOptions[elementSideLowercase]["twitchViews"] == null) {
                streamingElementOptions[elementSideLowercase]["twitchViews"] = {};
            }

            streamingElementOptions[elementSideLowercase]["twitchViews"]["username"] = $(elementOptions + " .streamingOptionTwitchViewsUsername").val();

            (function(elementDisplay) {
                if (streamingElementOptions[elementSideLowercase]["twitchViews"]["username"] != "" && streamingElementOptions[elementSideLowercase]["twitchViews"]["username"] != null) {
                    $.ajax({
                        url: "https://api.twitch.tv/helix/users?login=" + streamingElementOptions[elementSideLowercase]["twitchViews"]["username"],
                        beforeSend: function(xhr) {
                            xhr.setRequestHeader("Client-ID", twitchApiKey)
                        }
                    }).then(function(data) {
                        $(elementDisplay).html("");

                        $(elementDisplay).append($("<div class='streamingElementStat'>").append([
                            $("<div class='streamingElementStatNumber'>").text(data["data"][0]["view_count"]),
                            $("<div class='streamingElementStatDescription'>").text("VIEWS ON TWITCH")
                        ]));
                    });
                } else {
                    $(elementDisplay).html("");

                    $(elementDisplay).append($("<div class='streamingElementStat'>").append([
                        $("<div class='streamingElementStatNumber'>").text(0),
                        $("<div class='streamingElementStatDescription'>").text("VIEWS ON TWITCH")
                    ]));
                }
            })(elementDisplay);
        } else if ($(elementSelector + " option:selected").attr("val") == "twitchWatching") {
            if (streamingElementOptions[elementSideLowercase]["twitchWatching"] == null) {
                streamingElementOptions[elementSideLowercase]["twitchWatching"] = {};
            }

            streamingElementOptions[elementSideLowercase]["twitchWatching"]["username"] = $(elementOptions + " .streamingOptionTwitchWatchingUsername").val();

            (function(elementDisplay) {
                if (streamingElementOptions[elementSideLowercase]["twitchWatching"]["username"] != "" && streamingElementOptions[elementSideLowercase]["twitchWatching"]["username"] != null) {
                    $.ajax({
                        url: "https://api.twitch.tv/helix/streams?user_login=" + streamingElementOptions[elementSideLowercase]["twitchWatching"]["username"],
                        beforeSend: function(xhr) {
                            xhr.setRequestHeader("Client-ID", twitchApiKey)
                        }
                    }).then(function(data) {
                        $(elementDisplay).html("");
    
                        $(elementDisplay).append($("<div class='streamingElementStat'>").append([
                            $("<div class='streamingElementStatNumber'>").text(data["data"][0]["viewer_count"]),
                            $("<div class='streamingElementStatDescription'>").text("WATCHING LIVE ON TWITCH")
                        ]));
                    });
                } else {
                    $(elementDisplay).html("");

                    $(elementDisplay).append($("<div class='streamingElementStat'>").append([
                        $("<div class='streamingElementStatNumber'>").text(0),
                        $("<div class='streamingElementStatDescription'>").text("WATCHING LIVE ON TWITCH")
                    ]));
                }
            })(elementDisplay);
        } else if ($(elementSelector + " option:selected").attr("val") == "https") {
            if (streamingElementOptions[elementSideLowercase]["https"] == null) {
                streamingElementOptions[elementSideLowercase]["https"] = {};
            }

            streamingElementOptions[elementSideLowercase]["https"]["url"] = $(elementOptions + " .streamingOptionHttpsUrl").val();
            streamingElementOptions[elementSideLowercase]["https"]["path"] = $(elementOptions + " .streamingOptionHttpsPath").val();

            (function(elementDisplay, elementSideLowercase) {
                if (streamingElementOptions[elementSideLowercase]["https"]["url"] != "" && streamingElementOptions[elementSideLowercase]["https"]["url"] != null) {
                    $.ajax({
                        url: streamingElementOptions[elementSideLowercase]["https"]["url"]
                    }).then(function(data) {
                        var path = (streamingElementOptions[elementSideLowercase]["https"]["path"] || "").split("/");

                        for (var i = 0; i < path.length; i++) {
                            if (path[i][0] == "#") {
                                data = data[Number(path[i].substring(1))];
                            } else {
                                data = data[path[i]];
                            }
                        }

                        $(elementDisplay).html("");
    
                        if (data.length > (window.innerWidth / 2) / 50) {
                            $(elementDisplay).append($("<div class='streamingElementText smallText'>").text(data));
                        } else {
                            $(elementDisplay).append($("<div class='streamingElementText'>").text(data));
                        }
                    });
                } else {
                    $(elementDisplay).html("");
                }
            })(elementDisplay, elementSideLowercase);
        } else if ($(elementSelector + " option:selected").attr("val") == "js") {
            if (streamingElementOptions[elementSideLowercase]["js"] == null) {
                streamingElementOptions[elementSideLowercase]["js"] = {};
            }

            streamingElementOptions[elementSideLowercase]["js"]["script"] = $(elementOptions + " .streamingOptionJsScript").val();

            (function(elementDisplay, elementSideLowercase) {
                if (streamingElementOptions[elementSideLowercase]["js"]["script"] != "" && streamingElementOptions[elementSideLowercase]["js"]["script"] != null) {
                    var api = `
                        console = null;

                        var gp = {
                            streaming: {
                                setDisplay: function(data, type = "text") {
                                    setTimeout(function() {
                                        postMessage({
                                            command: "setDisplay",
                                            type: type,
                                            data: data
                                        });
                                    });
                                }
                            }
                        };
                    `;
                    var script = streamingElementOptions[elementSideLowercase]["js"]["script"];
                    
                    var jsWorker = new Worker("data:script/javascript," + encodeURI(api) + encodeURI(script));

                    jsWorker.onmessage = function(event) {
                        var data = event.data;

                        if (data.command == "setDisplay") {
                            if (data.type == "text") {
                                $(elementDisplay).html("");

                                if (data.data.length > (window.innerWidth / 2) / 50) {
                                    $(elementDisplay).append($("<div class='streamingElementText smallText'>").text(data.data));
                                } else {
                                    $(elementDisplay).append($("<div class='streamingElementText'>").text(data.data));
                                }
                            } else if (data.type == "image") {
                                $(elementDisplay).html("");


                                $(elementDisplay).append($("<img class='streamingElementImage'>").attr("src", data.data));
                            } else if (data.type == "stat") {
                                $(elementDisplay).html("");

                                $(elementDisplay).append($("<div class='streamingElementStat'>").append([
                                    $("<div class='streamingElementStatNumber'>").text(data.data.number),
                                    $("<div class='streamingElementStatDescription'>").text(data.data.description)
                                ]));
                            }
                        }
                    }

                    setTimeout(function() {
                        jsWorker.terminate();
                    }, 5000);
                } else {
                    $(elementDisplay).html("");
                }
            })(elementDisplay, elementSideLowercase);
        }
    }
}

function updateStreamingDisplayOptions() {
    updateStreamingDisplayElements();

    streamingElementOptionsUnsaved = true;
}

function setStreamingDisplayPanels() {
    if (showingStreamingDisplay) {
        var useDelayOnResizeT = false;
        var useDelayOnResizeB = false;

        if ($(".streamingElementTL option:selected").attr("val") == "none" && $(".streamingElementTR option:selected").attr("val") == "none") {
            $(".streamingDisplayPanel.streamingDisplayT").attr("data-streaming-display-effect", "false");

            useDelayOnResizeT = false;
        } else {
            $(".streamingDisplayPanel.streamingDisplayT").attr("data-streaming-display-effect", "true");

            useDelayOnResizeT = true;
        }

        if ($(".streamingElementBL option:selected").attr("val") == "none" && $(".streamingElementBR option:selected").attr("val") == "none") {
            $(".streamingDisplayPanel.streamingDisplayB").attr("data-streaming-display-effect", "false");

            useDelayOnResizeB = false;
        } else {
            $(".streamingDisplayPanel.streamingDisplayB").attr("data-streaming-display-effect", "true");

            useDelayOnResizeB = true;
        }

        if (useDelayOnResizeT) {
            setTimeout(function() {
                resizeGameFrame();
            }, 1000);
        } else {
            resizeGameFrame(true, false);
        }

        if (useDelayOnResizeB) {
            setTimeout(function() {
                resizeGameFrame();
            }, 1000);
        } else {
            resizeGameFrame(false, true);
        }
    } else {
        $(".streamingDisplayPanel").attr("data-streaming-display-effect", "false");

        resizeGameFrame();
    }

    var elements = ["TL", "TR", "BL", "BR"];

    for (var i = 0; i < elements.length; i++) {
        var elementSide = elements[i];
        var elementSideLowercase = elementSide.toLowerCase();
        var elementSelector = ".streamingElement" + elementSide;
        var elementOptions = ".streamingElementOptions" + elementSide;

        if ($(elementSelector + " option:selected").attr("val") == "none") {
            $(elementOptions).html("");
        } else if ($(elementSelector + " option:selected").attr("val") == "text") {
            $(elementOptions).html("");

            if (streamingElementOptions[elementSideLowercase]["text"] == null) {
                streamingElementOptions[elementSideLowercase]["text"] = {};
            }

            $(elementOptions)
                .append($("<label class='property'>")
                    .append($("<span>").text("Text inside"))
                    .append(
                        $("<input onchange='updateStreamingDisplayOptions();' class='streamingOptionTextText'>").val(
                            streamingElementOptions[elementSideLowercase]["text"]["text"] || ""
                        )
                    )
                )
            ;
        } else if ($(elementSelector + " option:selected").attr("val") == "image") {
            $(elementOptions).html("");

            if (streamingElementOptions[elementSideLowercase]["image"] == null) {
                streamingElementOptions[elementSideLowercase]["image"] = {};
            }

            $(elementOptions)
                .append($("<label class='property'>")
                    .append($("<span>").text("Image URL"))
                    .append(
                        $("<input onchange='updateStreamingDisplayOptions();' class='streamingOptionImageUrl'>").val(
                            streamingElementOptions[elementSideLowercase]["image"]["url"] || ""
                        )
                    )
                )
            ;
        } else if ($(elementSelector + " option:selected").attr("val") == "gpLikes") {
            $(elementOptions).html("");
        } else if ($(elementSelector + " option:selected").attr("val") == "gpComments") {
            $(elementOptions).html("");
        } else if ($(elementSelector + " option:selected").attr("val") == "ytSubs") {
            $(elementOptions).html("");

            if (streamingElementOptions[elementSideLowercase]["ytSubs"] == null) {
                streamingElementOptions[elementSideLowercase]["ytSubs"] = {};
            }

            $(elementOptions)
                .append($("<label class='property'>")
                    .append($("<span>").text("Channel ID (optional)"))
                    .append(
                        $("<input onchange='updateStreamingDisplayOptions();' class='streamingOptionYtSubsId'>").val(
                            streamingElementOptions[elementSideLowercase]["ytSubs"]["id"] || ""
                        )
                    )
                )
            ;

            $(elementOptions)
                .append($("<label class='property'>")
                    .append($("<span>").text("Username (optional)"))
                    .append(
                        $("<input onchange='updateStreamingDisplayOptions();' class='streamingOptionYtSubsUsername'>").val(
                            streamingElementOptions[elementSideLowercase]["ytSubs"]["username"] || ""
                        )
                    )
                )
            ;
        } else if ($(elementSelector + " option:selected").attr("val") == "ytViews") {
            $(elementOptions).html("");

            if (streamingElementOptions[elementSideLowercase]["ytViews"] == null) {
                streamingElementOptions[elementSideLowercase]["ytViews"] = {};
            }

            $(elementOptions)
                .append($("<label class='property'>")
                    .append($("<span>").text("Channel ID (optional)"))
                    .append(
                        $("<input onchange='updateStreamingDisplayOptions();' class='streamingOptionYtViewsId'>").val(
                            streamingElementOptions[elementSideLowercase]["ytViews"]["id"] || ""
                        )
                    )
                )
            ;

            $(elementOptions)
                .append($("<label class='property'>")
                    .append($("<span>").text("Username (optional)"))
                    .append(
                        $("<input onchange='updateStreamingDisplayOptions();' class='streamingOptionYtViewsUsername'>").val(
                            streamingElementOptions[elementSideLowercase]["ytViews"]["username"] || ""
                        )
                    )
                )
            ;
        } else if ($(elementSelector + " option:selected").attr("val") == "ytWatching") {
            $(elementOptions).html("");

            if (streamingElementOptions[elementSideLowercase]["ytWatching"] == null) {
                streamingElementOptions[elementSideLowercase]["ytWatching"] = {};
            }

            $(elementOptions)
                .append($("<label class='property'>")
                    .append($("<span>").text("Video ID"))
                    .append(
                        $("<input onchange='updateStreamingDisplayOptions();' class='streamingOptionYtWatchingId'>").val(
                            streamingElementOptions[elementSideLowercase]["ytWatching"]["id"] || ""
                        )
                    )
                )
            ;
        } else if ($(elementSelector + " option:selected").attr("val") == "twitchSubs") {
            $(elementOptions).html("");

            if (streamingElementOptions[elementSideLowercase]["twitchSubs"] == null) {
                streamingElementOptions[elementSideLowercase]["twitchSubs"] = {};
            }

            $(elementOptions)
                .append($("<label class='property'>")
                    .append($("<span>").text("Username"))
                    .append(
                        $("<input onchange='updateStreamingDisplayOptions();' class='streamingOptionTwitchSubsUsername'>").val(
                            streamingElementOptions[elementSideLowercase]["twitchSubs"]["username"] || ""
                        )
                    )
                )
            ;
        } else if ($(elementSelector + " option:selected").attr("val") == "twitchViews") {
            $(elementOptions).html("");

            if (streamingElementOptions[elementSideLowercase]["twitchViews"] == null) {
                streamingElementOptions[elementSideLowercase]["twitchViews"] = {};
            }

            $(elementOptions)
                .append($("<label class='property'>")
                    .append($("<span>").text("Username"))
                    .append(
                        $("<input onchange='updateStreamingDisplayOptions();' class='streamingOptionTwitchViewsUsername'>").val(
                            streamingElementOptions[elementSideLowercase]["twitchViews"]["username"] || ""
                        )
                    )
                )
            ;
        } else if ($(elementSelector + " option:selected").attr("val") == "twitchWatching") {
            $(elementOptions).html("");

            if (streamingElementOptions[elementSideLowercase]["twitchWatching"] == null) {
                streamingElementOptions[elementSideLowercase]["twitchWatching"] = {};
            }

            $(elementOptions)
                .append($("<label class='property'>")
                    .append($("<span>").text("Username"))
                    .append(
                        $("<input onchange='updateStreamingDisplayOptions();' class='streamingOptionTwitchWatchingUsername'>").val(
                            streamingElementOptions[elementSideLowercase]["twitchWatching"]["username"] || ""
                        )
                    )
                )
            ;
        } else if ($(elementSelector + " option:selected").attr("val") == "https") {
            $(elementOptions).html("");

            if (streamingElementOptions[elementSideLowercase]["https"] == null) {
                streamingElementOptions[elementSideLowercase]["https"] = {};
            }

            $(elementOptions)
                .append($("<label class='property'>")
                    .append($("<span>").text("GET Request URL"))
                    .append(
                        $("<input onchange='updateStreamingDisplayOptions();' class='streamingOptionHttpsUrl'>").val(
                            streamingElementOptions[elementSideLowercase]["https"]["url"] || ""
                        )
                    )
                )
            ;

            $(elementOptions)
                .append($("<label class='property'>")
                    .append($("<span>").text("Data path (optional)"))
                    .append(
                        $("<input onchange='updateStreamingDisplayOptions();' class='streamingOptionHttpsPath'>").val(
                            streamingElementOptions[elementSideLowercase]["https"]["path"] || ""
                        )
                    )
                )
            ;

            $(elementOptions).append([
                $("<p>").text("Use the data path option to specify a path in the JSON return data. Use slashes as path delimiters. Index numbers start at 0, and must be prefixed with a hashtag."),
                $("<p>").text("We strongly suggest that you use a HTTPS path. It's more secure and reliable!")
            ]);
        } else if ($(elementSelector + " option:selected").attr("val") == "js") {
            $(elementOptions).html("");

            if (streamingElementOptions[elementSideLowercase]["js"] == null) {
                streamingElementOptions[elementSideLowercase]["js"] = {};
            }

            $(elementOptions)
                .append([
                    $("<p>").text("JavaScript contents:"),
                    $("<textarea rows='10' autocomplete='off' autocorrect='off' autocapitalize='off' spellcheck='false' onchange='updateStreamingDisplayOptions();' class='streamingOptionJsScript monospace'>").val(
                        streamingElementOptions[elementSideLowercase]["js"]["script"] || ""
                    )
                ])
            ;
        }
    }
}

function streamingDisplay(showStreamingDisplay = true) {
    showingStreamingDisplay = showStreamingDisplay;

    if (showStreamingDisplay) {
        if (hasGameProxyPro) {
            $("[data-streaming-display-effect]").attr("data-streaming-display-effect", "true");
            $(".streamingSwitch").prop("checked", true);
            $(".streamingSwitchStatus").text("Streaming display is on");

            setStreamingDisplayPanels();

            setTimeout(resizeGameFrame, 1000);

            if ($(".streamingDisplayPanel.streamingDisplayT").attr("data-streaming-display-effect") != "true" && $(".streamingDisplayPanel.streamingDisplayB").attr("data-streaming-display-effect") != "true") {
                alert("It looks like you haven't set your display elements in the Streaming Options window. You'll need to set them in order for the streaming displays to appear!", "Display elements not set");
            }
        } else {
            alert("Hmm, something went a bit wrong! (Or you tried to hack our site...) Streaming displays aren't meant to turn on without GameProxy Pro.");
        }
    } else {
        $("[data-streaming-display-effect]").attr("data-streaming-display-effect", "false");
        $(".streamingDisplayPanel.streamingDisplayB").css("top", "auto");
        $(".streamingSwitch").prop("checked", false);
        $(".streamingSwitchStatus").text("Streaming display is off");

        setTimeout(resizeGameFrame);        
    }
}

function toggleStreamingDisplay() {
    streamingDisplay(!showingStreamingDisplay);
}

firebase.auth().onAuthStateChanged(function() {
    if (hasGameProxyPro) {
        firebase.database().ref("users/" + currentUid + "/_settings/gpPro/data/streamingElementOptions").once("value", function(snapshot) {
            function startStreamingElementOptionsSaveLoop() {
                updateStreamingDisplayElements();
    
                if (streamingElementOptionsUnsaved == true) {
                    firebase.database().ref("users/" + currentUid + "/_settings/gpPro/data/streamingElementOptions").set(streamingElementOptions);
    
                    streamingElementOptionsUnsaved = false;
                }
            }
            
            if (snapshot.val() == null) {
                streamingElementOptionsUnsaved = true;
    
                setInterval(startStreamingElementOptionsSaveLoop, 5000);
            } else {
                streamingElementOptions = snapshot.val();

                if (streamingElementOptions["tl"] == null) {
                    streamingElementOptions["tl"] = {};
                }

                if (streamingElementOptions["tr"] == null) {
                    streamingElementOptions["tr"] = {};
                }

                if (streamingElementOptions["bl"] == null) {
                    streamingElementOptions["bl"] = {};
                }
                
                if (streamingElementOptions["br"] == null) {
                    streamingElementOptions["br"] = {};
                }
    
                setInterval(startStreamingElementOptionsSaveLoop, 5000);
            }
        });
    }
})

$(function() {
    $("#streamingWindow").draggable({
        handle: "#streamingWindowTitle"
    });

    $(".streamingDisplayPanel.streamingDisplayT").resizable({
        handles: "s",
        minHeight: 100,
        maxHeight: window.innerHeight / 3,
        resize: resizeGameFrame
    });

    $(".streamingDisplayPanel.streamingDisplayB").resizable({
        handles: "n",
        minHeight: 100,
        maxHeight: window.innerHeight / 3,
        resize: resizeGameFrame
    });
});