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

function streamingDisplay(showStreamingDisplay = true) {
    if (showStreamingDisplay) {
        if (hasGameProxyPro) {
            $("[streamingDisplayEffect]").attr("streamingDisplayEffect", "true");
            $(".streamingSwitch").val(false);
            $(".streamingSwitchStatus").text("Streaming display is on");
        } else {
            alert("Hmm, something went a bit wrong! (Or you tried to hack our site...) Streaming displays aren't meant to turn on without GameProxy Pro.");
        }
    } else {
        $("[streamingDisplayEffect]").attr("streamingDisplayEffect", "false");
        $(".streamingSwitch").val(true);
        $(".streamingSwitchStatus").text("Streaming display is off");
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
});