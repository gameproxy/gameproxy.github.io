var showingStreamingOptions = false;
var showingStreamingDisplay = false;

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

function resizeGameFrame() {
    if (isFullscreen) {
        if (showingStreamingDisplay) {
            var difference = 0;
            var topDifference = 0;

            if ($(".streamingDisplayPanel.streamingDisplayT").attr("data-streaming-display-effect") == "true") {
                difference += $(".streamingDisplayPanel.streamingDisplayT").height();
                topDifference += $(".streamingDisplayPanel.streamingDisplayT").height();
            }

            if ($(".streamingDisplayPanel.streamingDisplayB").attr("data-streaming-display-effect") == "true") {
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

function setStreamingDisplayPanels() {
    if (showingStreamingDisplay) {
        if ($(".streamingElementTL option:selected").attr("val") == "none" && $(".streamingElementTR option:selected").attr("val") == "none") {
            $(".streamingDisplayPanel.streamingDisplayT").attr("data-streaming-display-effect", "false");
        } else {
            $(".streamingDisplayPanel.streamingDisplayT").attr("data-streaming-display-effect", "true");
        }

        if ($(".streamingElementBL option:selected").attr("val") == "none" && $(".streamingElementBR option:selected").attr("val") == "none") {
            $(".streamingDisplayPanel.streamingDisplayB").attr("data-streaming-display-effect", "false");
        } else {
            $(".streamingDisplayPanel.streamingDisplayB").attr("data-streaming-display-effect", "true");
        }
    } else {
        $(".streamingDisplayPanel").attr("data-streaming-display-effect", "false");
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