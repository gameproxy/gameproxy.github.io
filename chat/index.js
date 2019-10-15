var chatLoaderEncouragementPhrases = [
    "Finding stuff to do...",
    "Firing up lazer beams...",
    "Downstreaming human discourse logs...",
    "Cueing fellow humans to start chatting...",
    "Finding a workforce to run this thing...",
    "Expunging all methods of bordness...",
    "Displaying arbitrary messages to the user..."
];

function chooseRandomEnouragement() {
    $("#chatLoaderEncouragement").text(chatLoaderEncouragementPhrases[random(0, chatLoaderEncouragementPhrases.length - 1)]);
}

$(function() {
    setInterval(function() {
        setTimeout(function() {
            chooseRandomEnouragement();
        }, 1000);

        $("#chatLoaderEncouragement").fadeOut(1000);
        $("#chatLoaderEncouragement").fadeIn(1000);
    }, 5000);

    chooseRandomEnouragement();
    $("#chatLoaderEncouragement").fadeIn(1000);

    setTimeout(function() {
        window.location.replace("console.html");
    }, 3000);
});