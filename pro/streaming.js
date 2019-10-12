var showingStreamingOptions = false;
var showingStreamingDisplay = false;
var streamingElementOptionsUnsaved = false;
var streamingElementOptions = {
    tl: {},
    tr: {},
    bl: {},
    br: {}
};

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