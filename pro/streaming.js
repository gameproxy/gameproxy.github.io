var showingStreamingOptions = false;

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

$(function() {
    $("#streamingWindow").draggable({
        handle: "#streamingWindowTitle"
    });
});