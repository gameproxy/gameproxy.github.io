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

            if ($(".streamingDisplayPanel.streamingDisplayT").is(":visible")) {
                difference += $(".streamingDisplayPanel.streamingDisplayT").height();
            }

            $("object, #gameIframe").css({
                top: difference,
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

function streamingDisplay(showStreamingDisplay = true) {
    if (showStreamingDisplay) {
        if (hasGameProxyPro) {
            $("[data-streaming-display-effect]").attr("data-streaming-display-effect", "true");
            $(".streamingSwitch").prop("checked", true);
            $(".streamingSwitchStatus").text("Streaming display is on");

            setTimeout(resizeGameFrame, 1000);
        } else {
            alert("Hmm, something went a bit wrong! (Or you tried to hack our site...) Streaming displays aren't meant to turn on without GameProxy Pro.");
        }
    } else {
        $("[data-streaming-display-effect]").attr("data-streaming-display-effect", "false");
        $(".streamingSwitch").prop("checked", false);
        $(".streamingSwitchStatus").text("Streaming display is off");

        setTimeout(resizeGameFrame);        
    }

    showingStreamingDisplay = showStreamingDisplay;
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
});